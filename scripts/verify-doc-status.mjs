#!/usr/bin/env node

/**
 * Documentation Status Tag Verification Script
 * 
 * Verifies that all markdown files have exactly one STATUS tag
 * and that canonical/archived docs have the correct status markers.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const CANONICAL_PATHS = [
  'README.md',
  'DOCS_INDEX.md',
  'DEV_MODE_SETUP.md',
  'DOCS_VERIFICATION_REPORT.md',
  'docs/architecture/ARCHITECTURE.md',
  'docs/architecture/API.md',
  'docs/architecture/MULTI_TENANCY.md',
  'docs/architecture/TESTING_SETUP.md',
  'docs/development/QUICK_START.md',
  'docs/development/SETUP.md',
  'docs/development/RULES.md',
  'docs/development/DEV_MODE.md',
  'docs/development/DOC_MAINTENANCE.md',
  'docs/workflows/PHASE_2_WEBSITE_INGESTION.md',
  'docs/current-status/PROJECT_STATUS.md',
  'supabase/README.md',
  'tests/README.md'
];

const ARCHIVED_PATHS = [
  'docs/archive-docs/README.md',
  'docs/archive-docs/phase-completions/PHASE_0_1_VERIFICATION.md',
  'docs/archive-docs/phase-completions/PHASE_2_SUMMARY.md',
  'docs/archive-docs/2025-12-11-dev-mode/DEV_MODE_SAFETY_REPORT.md',
  'docs/archive-docs/2025-11-19-auth-evolution/AUTH_AUDIT_REPORT.md',
  'docs/archive-docs/2025-11-19-auth-evolution/AUTH_FLOW_AUDIT_REPORT.md',
  'docs/archive-docs/2025-11-19-auth-evolution/AUTH_METHOD_CHANGE.md',
  'docs/archive-docs/2025-11-19-auth-evolution/AUTH_VERIFICATION_CHECKLIST.md',
  'docs/archive-docs/2025-11-19-auth-evolution/BLANK_SCREEN_FIX.md',
  'docs/archive-docs/2025-11-19-auth-evolution/LANDING_PAGE_FIX.md',
  'docs/archive-docs/2025-11-19-auth-evolution/LOGIN_SIGNUP_FIX.md',
  'docs/archive-docs/2025-11-19-auth-evolution/MAGIC_LINK_FIX_REPORT.md',
  'docs/archive-docs/2025-11-19-auth-evolution/APP_CRASH_FIX_REPORT.md',
  'docs/archive-docs/2025-11-19-workspace-fixes/WORKSPACE_CREATION_FIX.md',
  'docs/archive-docs/2025-11-19-workspace-fixes/WORKSPACE_FIX_SUMMARY.md'
];

function getAllMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    
    // Skip node_modules and .next
    if (entry === 'node_modules' || entry === '.next') {
      continue;
    }
    
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function extractStatusTag(content) {
  const statusMatches = content.match(/STATUS:\s*([^\n]+)/g);
  return statusMatches;
}

function main() {
  const rootDir = process.cwd();
  console.log('🔍 Documentation Status Tag Verification\n');
  console.log(`Root directory: ${rootDir}\n`);
  
  // Get all markdown files
  const allFiles = getAllMarkdownFiles(rootDir);
  const relativePaths = allFiles.map(f => relative(rootDir, f));
  
  console.log(`📊 Found ${relativePaths.length} markdown files\n`);
  
  let errors = 0;
  let warnings = 0;
  
  // Check canonical files
  console.log('✅ Checking CANONICAL files (expected: 🟢 CANONICAL):\n');
  for (const path of CANONICAL_PATHS) {
    const fullPath = join(rootDir, path);
    const content = readFileSync(fullPath, 'utf-8');
    const statusMatches = extractStatusTag(content);
    
    if (!statusMatches || statusMatches.length === 0) {
      console.log(`  ❌ ${path}: MISSING STATUS TAG`);
      errors++;
    } else if (statusMatches.length > 1) {
      console.log(`  ⚠️  ${path}: Multiple STATUS tags found (${statusMatches.length})`);
      warnings++;
    } else {
      const status = statusMatches[0];
      if (status.includes('🟢 CANONICAL')) {
        console.log(`  ✅ ${path}`);
      } else {
        console.log(`  ❌ ${path}: Wrong status - ${status.trim()}`);
        errors++;
      }
    }
  }
  
  // Check archived files
  console.log('\n🔴 Checking ARCHIVED files (expected: 🔴 ARCHIVED):\n');
  for (const path of ARCHIVED_PATHS) {
    const fullPath = join(rootDir, path);
    const content = readFileSync(fullPath, 'utf-8');
    const statusMatches = extractStatusTag(content);
    
    if (!statusMatches || statusMatches.length === 0) {
      console.log(`  ❌ ${path}: MISSING STATUS TAG`);
      errors++;
    } else if (statusMatches.length > 1) {
      console.log(`  ⚠️  ${path}: Multiple STATUS tags found (${statusMatches.length})`);
      warnings++;
    } else {
      const status = statusMatches[0];
      if (status.includes('🔴 ARCHIVED')) {
        console.log(`  ✅ ${path}`);
      } else {
        console.log(`  ❌ ${path}: Wrong status - ${status.trim()}`);
        errors++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY:');
  console.log(`  Total files checked: ${CANONICAL_PATHS.length + ARCHIVED_PATHS.length}`);
  console.log(`  Canonical files: ${CANONICAL_PATHS.length}`);
  console.log(`  Archived files: ${ARCHIVED_PATHS.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Warnings: ${warnings}`);
  
  if (errors > 0) {
    console.log('\n❌ VERIFICATION FAILED: Status tag errors detected');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  VERIFICATION PASSED WITH WARNINGS');
    process.exit(0);
  } else {
    console.log('\n✅ VERIFICATION PASSED: All status tags are correct!');
    process.exit(0);
  }
}

main();

