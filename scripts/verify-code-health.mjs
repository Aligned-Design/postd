#!/usr/bin/env node

/**
 * Code Health & Consistency Check
 * 
 * Periodic maintenance script to catch:
 * - Orphaned components/hooks not imported anywhere
 * - Manual Supabase auth instead of standard helpers
 * - Outdated TODOs that contradict implemented code
 * - Unused types/interfaces
 * - Console.logs left in production code
 * 
 * Run this before releases or periodically to keep code drift at zero.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

console.log('🔍 Code Health & Consistency Check\n');
console.log('Scanning for orphaned code and anti-patterns...\n');

let errors = 0;
let warnings = 0;
const rootDir = process.cwd();

// ============================================================
// PHASE 1: Find Orphaned Components
// ============================================================

console.log('🧩 PHASE 1: Checking for Orphaned Components\n');

function getAllTsxFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getAllTsxFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.spec.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const componentFiles = getAllTsxFiles('src/components');

console.log(`Found ${componentFiles.length} component files to check:\n`);

componentFiles.forEach(file => {
  const fileName = file.split('/').pop().replace('.tsx', '');
  
  try {
    // Use ripgrep for fast searching, fallback to grep
    let isImported = false;
    try {
      const result = execSync(
        `rg -l "from.*${fileName}" src --glob '!${file}'`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      isImported = result.trim().length > 0;
    } catch (e) {
      // rg returns exit code 1 when no matches found
      isImported = false;
    }
    
    if (!isImported) {
      // Double-check with a simpler pattern
      try {
        const doubleCheck = execSync(
          `grep -r "${fileName}" src --include="*.tsx" --include="*.ts" --exclude="${file}" -l`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
        );
        isImported = doubleCheck.trim().length > 0;
      } catch (e) {
        isImported = false;
      }
    }
    
    if (!isImported) {
      console.log(`  ⚠️  ${relative(rootDir, file)}`);
      console.log(`     Not imported anywhere - potential orphan`);
      warnings++;
    } else {
      console.log(`  ✅ ${fileName}`);
    }
  } catch (err) {
    console.log(`  ⚠️  ${fileName} - Could not verify usage`);
  }
});

console.log();

// ============================================================
// PHASE 2: Check for Manual Auth Anti-Patterns
// ============================================================

console.log('🔐 PHASE 2: Checking Auth Patterns in API Routes\n');

function getAllApiRoutes(dir = 'src/app/api', routes = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        getAllApiRoutes(fullPath, routes);
      } else if (entry.name === 'route.ts') {
        routes.push(fullPath);
      }
    }
  } catch (err) {
    // Directory might not exist
  }
  
  return routes;
}

const apiRoutes = getAllApiRoutes();

console.log(`Checking ${apiRoutes.length} API route files:\n`);

apiRoutes.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  const hasStandardAuth = content.includes('authenticateRequest');
  const hasManualAuth = content.includes('supabase.auth.getUser()');
  
  if (hasManualAuth && !hasStandardAuth) {
    console.log(`  ❌ ${relative(rootDir, file)}`);
    console.log(`     Using manual auth - should use authenticateRequest() helper`);
    errors++;
  } else if (hasStandardAuth) {
    console.log(`  ✅ ${relative(rootDir, file)} - Uses standard helpers`);
  } else {
    console.log(`  ⚠️  ${relative(rootDir, file)} - No auth found`);
    warnings++;
  }
});

console.log();

// ============================================================
// PHASE 3: Find Misleading TODOs
// ============================================================

console.log('📝 PHASE 3: Checking for Misleading TODOs\n');

const knownTodos = [
  {
    file: 'src/lib/crawler/websiteCrawler.ts',
    line: 'TODO: Respect robots.txt',
    status: 'valid',
    reason: 'Documented as future enhancement'
  },
  {
    file: 'src/components/WorkspaceSwitcher.tsx',
    line: 'TODO: Fetch all user workspaces',
    status: 'valid',
    reason: 'Documented as Phase 1.5 feature'
  }
];

try {
  const todoResults = execSync(
    `rg "TODO:" src --no-heading --line-number`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
  ).trim();
  
  if (todoResults) {
    const todos = todoResults.split('\n');
    console.log(`Found ${todos.length} TODO comments:\n`);
    
    todos.forEach(todo => {
      const [filePath, ...rest] = todo.split(':');
      const lineNum = rest[0];
      const content = rest.slice(1).join(':').trim();
      
      const isKnown = knownTodos.some(known => 
        filePath.includes(known.file) && content.includes(known.line)
      );
      
      if (isKnown) {
        console.log(`  ✅ ${relative(rootDir, filePath)}:${lineNum}`);
        console.log(`     ${content}`);
      } else {
        console.log(`  ⚠️  ${relative(rootDir, filePath)}:${lineNum}`);
        console.log(`     ${content}`);
        console.log(`     Verify this TODO is still accurate`);
        warnings++;
      }
    });
  } else {
    console.log(`  ✅ No unexpected TODOs found`);
  }
} catch (err) {
  console.log(`  ✅ No TODOs found`);
}

console.log();

// ============================================================
// PHASE 4: Check for Console Logs
// ============================================================

console.log('🖨️  PHASE 4: Checking for Console Logs\n');

// Allowed console.log patterns (for debugging/logging libraries)
const allowedPatterns = [
  'console.log(\\[',  // Structured logging [tag]
  'console.error\\(',  // Error logging is OK
  'console.warn\\(',   // Warning logging is OK
  'if.*console'        // Conditional console statements
];

try {
  const consoleResults = execSync(
    `rg "console\\.log\\(" src --glob '!*.spec.*' --glob '!*.test.*'`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
  ).trim();
  
  if (consoleResults) {
    const logs = consoleResults.split('\n');
    let suspiciousLogs = 0;
    
    logs.forEach(log => {
      const isAllowed = allowedPatterns.some(pattern => 
        new RegExp(pattern).test(log)
      );
      
      if (!isAllowed) {
        if (suspiciousLogs === 0) {
          console.log(`  ⚠️  Found console.log statements (review before production):\n`);
        }
        console.log(`     ${log}`);
        suspiciousLogs++;
      }
    });
    
    if (suspiciousLogs > 0) {
      warnings += suspiciousLogs;
    } else {
      console.log(`  ✅ All console.log statements are structured/intentional`);
    }
  } else {
    console.log(`  ✅ No console.log statements found`);
  }
} catch (err) {
  console.log(`  ✅ No console.log statements found`);
}

console.log();

// ============================================================
// PHASE 5: Check for Unused Imports (TypeScript types)
// ============================================================

console.log('📦 PHASE 5: Checking Type Files\n');

const typeFiles = [
  'src/lib/types/index.ts',
  'src/lib/types/sources.ts'
];

typeFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8');
    
    // Extract exported types/interfaces
    const exports = [];
    const typeMatches = content.matchAll(/export\s+(?:type|interface)\s+(\w+)/g);
    for (const match of typeMatches) {
      exports.push(match[1]);
    }
    
    console.log(`  📄 ${relative(rootDir, file)}: ${exports.length} types exported`);
    
    // Check if each type is used (basic check)
    exports.forEach(typeName => {
      try {
        const usage = execSync(
          `rg "\\b${typeName}\\b" src --glob '!${file}' -l`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
        ).trim();
        
        if (!usage) {
          console.log(`     ⚠️  Type '${typeName}' may be unused`);
          warnings++;
        }
      } catch (e) {
        console.log(`     ⚠️  Type '${typeName}' may be unused`);
        warnings++;
      }
    });
    
  } catch (err) {
    console.log(`  ⚠️  Could not read ${file}`);
  }
});

console.log();

// ============================================================
// Summary
// ============================================================

console.log('============================================================');
console.log('📋 CODE HEALTH SUMMARY:\n');
console.log(`  Components checked: ${componentFiles.length}`);
console.log(`  API routes checked: ${apiRoutes.length}`);
console.log(`  Type files checked: ${typeFiles.length}`);
console.log(`  Errors: ${errors}`);
console.log(`  Warnings: ${warnings}\n`);

if (errors > 0) {
  console.log('❌ CODE HEALTH ISSUES DETECTED');
  console.log('   Fix critical issues before proceeding\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  CODE HEALTH CHECK PASSED WITH WARNINGS');
  console.log('   Review warnings before production deployment\n');
  process.exit(0);
} else {
  console.log('✅ CODE HEALTH CHECK PASSED');
  console.log('   No issues detected!\n');
  process.exit(0);
}

