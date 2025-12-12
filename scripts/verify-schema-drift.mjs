#!/usr/bin/env node

/**
 * Schema & RLS Drift Audit
 * 
 * Verifies that database schema in migrations matches:
 * - What the documentation describes
 * - TypeScript type definitions
 * - How the code actually queries the database
 * 
 * This prevents drift between:
 * - supabase/migrations/*.sql
 * - docs/architecture/MULTI_TENANCY.md
 * - docs/architecture/ARCHITECTURE.md
 * - supabase/README.md
 * - src/lib/types/*.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🔍 Schema & RLS Drift Audit\n');
console.log('Verifying database schema consistency...\n');

let errors = 0;
let warnings = 0;

// ============================================================
// PHASE 1: Load and Parse Migrations
// ============================================================

console.log('📊 PHASE 1: Analyzing Migrations\n');

const migrationsDir = 'supabase/migrations';
const migrations = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Found ${migrations.length} migration files:`);
migrations.forEach(m => console.log(`  - ${m}`));
console.log();

// Parse all migrations to extract schema
const schema = {
  tables: {},
  policies: {},
  indexes: {},
  functions: {}
};

migrations.forEach(file => {
  const content = readFileSync(join(migrationsDir, file), 'utf-8');
  
  // Extract table definitions
  const tableMatches = content.matchAll(/CREATE TABLE[^(]*\s+(?:IF NOT EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi);
  for (const match of tableMatches) {
    const tableName = match[1];
    const columns = match[2];
    
    if (!schema.tables[tableName]) {
      schema.tables[tableName] = {
        columns: [],
        file: file
      };
    }
    
    // Parse columns (basic parsing)
    const columnLines = columns.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('--'));
    
    columnLines.forEach(line => {
      const colMatch = line.match(/^(\w+)\s+(\w+)/);
      if (colMatch && !line.startsWith('PRIMARY KEY') && !line.startsWith('FOREIGN KEY')) {
        schema.tables[tableName].columns.push({
          name: colMatch[1],
          type: colMatch[2],
          line: line
        });
      }
    });
  }
  
  // Extract RLS policies
  const policyMatches = content.matchAll(/CREATE POLICY\s+"([^"]+)"\s+ON\s+(?:public\.)?(\w+)/gi);
  for (const match of policyMatches) {
    const policyName = match[1];
    const tableName = match[2];
    
    if (!schema.policies[tableName]) {
      schema.policies[tableName] = [];
    }
    schema.policies[tableName].push(policyName);
  }
  
  // Check RLS is enabled
  const rlsMatches = content.matchAll(/ALTER TABLE\s+(?:public\.)?(\w+)\s+ENABLE ROW LEVEL SECURITY/gi);
  for (const match of rlsMatches) {
    const tableName = match[1];
    if (schema.tables[tableName]) {
      schema.tables[tableName].rlsEnabled = true;
    }
  }
});

console.log('📋 Schema Summary:');
console.log(`  Tables: ${Object.keys(schema.tables).length}`);
console.log(`  Tables with RLS: ${Object.values(schema.tables).filter(t => t.rlsEnabled).length}`);
console.log(`  Total RLS Policies: ${Object.values(schema.policies).flat().length}`);
console.log();

// ============================================================
// PHASE 2: Verify Against Documentation
// ============================================================

console.log('📖 PHASE 2: Verifying Against Documentation\n');

// Expected tables from MULTI_TENANCY.md and ARCHITECTURE.md
const expectedTables = {
  workspaces: {
    doc: 'docs/architecture/MULTI_TENANCY.md',
    columns: ['id', 'name', 'created_by', 'created_at', 'updated_at'],
    rlsRequired: true
  },
  workspace_members: {
    doc: 'docs/architecture/MULTI_TENANCY.md',
    columns: ['workspace_id', 'user_id', 'role', 'created_at'],
    rlsRequired: true
  },
  sources: {
    doc: 'docs/architecture/ARCHITECTURE.md',
    columns: ['id', 'workspace_id', 'type', 'config', 'created_at', 'updated_at'],
    rlsRequired: true
  },
  crawled_pages: {
    doc: 'docs/architecture/ARCHITECTURE.md',
    columns: ['id', 'workspace_id', 'source_id', 'url', 'title', 'content_text', 'raw_html', 'metadata', 'crawled_at'],
    rlsRequired: true
  }
};

// Check each expected table exists
Object.entries(expectedTables).forEach(([tableName, expected]) => {
  if (!schema.tables[tableName]) {
    console.log(`  ❌ Table '${tableName}' documented in ${expected.doc} but NOT FOUND in migrations`);
    errors++;
  } else {
    console.log(`  ✅ Table '${tableName}' exists`);
    
    // Check columns
    const actualColumns = schema.tables[tableName].columns.map(c => c.name);
    const missingColumns = expected.columns.filter(col => !actualColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`     ⚠️  Missing documented columns: ${missingColumns.join(', ')}`);
      warnings++;
    }
    
    // Check RLS
    if (expected.rlsRequired && !schema.tables[tableName].rlsEnabled) {
      console.log(`     ❌ RLS is NOT ENABLED but required by documentation`);
      errors++;
    }
    
    // Check policies exist
    if (!schema.policies[tableName] || schema.policies[tableName].length === 0) {
      console.log(`     ⚠️  No RLS policies found (table may be inaccessible)`);
      warnings++;
    }
  }
});

console.log();

// ============================================================
// PHASE 3: Verify TypeScript Types Match Schema
// ============================================================

console.log('🔷 PHASE 3: Verifying TypeScript Types\n');

const typesFiles = [
  'src/lib/types/index.ts',
  'src/lib/types/sources.ts'
];

typesFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8');
    console.log(`  📄 ${file}`);
    
    // Check for Workspace type
    if (content.includes('interface Workspace') || content.includes('type Workspace')) {
      const workspaceMatch = content.match(/(?:interface|type)\s+Workspace[^{]*\{([^}]+)\}/s);
      if (workspaceMatch) {
        const typeFields = workspaceMatch[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('//'))
          .map(line => line.split(':')[0].trim())
          .filter(f => f);
        
        const schemaColumns = schema.tables.workspaces?.columns.map(c => c.name) || [];
        const missingInType = schemaColumns.filter(col => !typeFields.includes(col));
        
        if (missingInType.length > 0) {
          console.log(`     ⚠️  Workspace type missing DB columns: ${missingInType.join(', ')}`);
          warnings++;
        } else {
          console.log(`     ✅ Workspace type matches schema`);
        }
      }
    }
    
    // Check for Source type
    if (content.includes('interface Source') || content.includes('type Source')) {
      const sourceMatch = content.match(/(?:interface|type)\s+Source[^{]*\{([^}]+)\}/s);
      if (sourceMatch) {
        const typeFields = sourceMatch[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('//'))
          .map(line => line.split(':')[0].trim())
          .filter(f => f);
        
        const schemaColumns = schema.tables.sources?.columns.map(c => c.name) || [];
        const missingInType = schemaColumns.filter(col => !typeFields.includes(col));
        
        if (missingInType.length > 0) {
          console.log(`     ⚠️  Source type missing DB columns: ${missingInType.join(', ')}`);
          warnings++;
        } else {
          console.log(`     ✅ Source type matches schema`);
        }
      }
    }
  } catch (err) {
    console.log(`     ⚠️  Could not read ${file}`);
    warnings++;
  }
});

console.log();

// ============================================================
// PHASE 4: Verify Code Queries Match Schema
// ============================================================

console.log('💻 PHASE 4: Verifying Code Queries\n');

// Check workspace queries
const workspaceFiles = readdirSync('src/lib/workspaces', { withFileTypes: true })
  .filter(f => f.isFile() && f.name.endsWith('.ts'))
  .map(f => join('src/lib/workspaces', f.name));

workspaceFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  // Check for .from('workspaces') queries
  const workspaceQueries = content.match(/\.from\(['"]workspaces['"]\)[^;]*/g) || [];
  workspaceQueries.forEach(query => {
    // Check if selecting non-existent columns
    const selectMatch = query.match(/\.select\(['"`]([^'"`]+)['"`]\)/);
    if (selectMatch) {
      const selectedFields = selectMatch[1].split(',').map(f => f.trim());
      const schemaColumns = schema.tables.workspaces?.columns.map(c => c.name) || [];
      
      selectedFields.forEach(field => {
        // Handle nested selects and complex patterns
        const baseField = field.split('(')[0].split(':')[0].trim();
        if (baseField && !schemaColumns.includes(baseField) && baseField !== '*') {
          console.log(`  ⚠️  ${file} selects non-existent column: ${baseField}`);
          warnings++;
        }
      });
    }
  });
});

console.log(`  ✅ Checked ${workspaceFiles.length} workspace-related files`);
console.log();

// ============================================================
// Summary
// ============================================================

console.log('============================================================');
console.log('📋 SCHEMA DRIFT AUDIT SUMMARY:\n');
console.log(`  Tables in migrations: ${Object.keys(schema.tables).length}`);
console.log(`  Tables with RLS enabled: ${Object.values(schema.tables).filter(t => t.rlsEnabled).length}`);
console.log(`  RLS policies defined: ${Object.values(schema.policies).flat().length}`);
console.log(`  Errors: ${errors}`);
console.log(`  Warnings: ${warnings}\n`);

if (errors > 0) {
  console.log('❌ SCHEMA DRIFT DETECTED: Critical mismatches found');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  VERIFICATION PASSED WITH WARNINGS');
  process.exit(0);
} else {
  console.log('✅ VERIFICATION PASSED: Schema is consistent!');
  process.exit(0);
}

