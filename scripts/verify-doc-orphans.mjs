#!/usr/bin/env node

/**
 * Documentation Orphan Detection Script
 * 
 * Verifies that all markdown files are referenced in at least one index document.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, basename } from 'path';

const INDEX_ROOTS = [
  'DOCS_INDEX.md',
  'docs/current-status/PROJECT_STATUS.md',
  'docs/archive-docs/README.md'
];

// Files that are referenced by path/convention, not by name in index
const EXCEPTION_FILES = [
  'supabase/README.md',  // Referenced by path in DOCS_INDEX.md
  'tests/README.md'       // Referenced by path in DOCS_INDEX.md
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

function main() {
  const rootDir = process.cwd();
  console.log('🔍 Documentation Orphan Detection\n');
  console.log(`Root directory: ${rootDir}\n`);
  
  // Get all markdown files
  const allFiles = getAllMarkdownFiles(rootDir);
  const relativePaths = allFiles.map(f => relative(rootDir, f));
  
  console.log(`📊 Found ${relativePaths.length} markdown files\n`);
  
  // Read index roots
  console.log('📖 Reading index roots:\n');
  const indexContents = {};
  for (const indexPath of INDEX_ROOTS) {
    const fullPath = join(rootDir, indexPath);
    const content = readFileSync(fullPath, 'utf-8');
    indexContents[indexPath] = content;
    console.log(`  ✅ ${indexPath} (${content.length} chars)`);
  }
  
  console.log('\n🔎 Checking for orphaned documents:\n');
  
  const orphans = [];
  const filesToCheck = relativePaths.filter(path => {
    // Exclude index roots themselves
    if (INDEX_ROOTS.includes(path)) {
      return false;
    }
    // Exclude exception files
    if (EXCEPTION_FILES.includes(path)) {
      return false;
    }
    return true;
  });
  
  for (const filePath of filesToCheck) {
    const fileName = basename(filePath);
    let referenced = false;
    
    // Check if mentioned in any index root
    for (const [indexPath, content] of Object.entries(indexContents)) {
      // Check for filename reference (without extension)
      const nameWithoutExt = fileName.replace('.md', '');
      
      // Check multiple patterns:
      // 1. Full filename: FILENAME.md
      // 2. Markdown link: [text](path/FILENAME.md)
      // 3. Basename reference: FILENAME
      // 4. Full path reference: path/to/FILENAME.md
      
      if (
        content.includes(fileName) ||
        content.includes(nameWithoutExt) ||
        content.includes(filePath)
      ) {
        referenced = true;
        console.log(`  ✅ ${filePath} (referenced in ${indexPath})`);
        break;
      }
    }
    
    if (!referenced) {
      orphans.push(filePath);
      console.log(`  ❌ ${filePath} - NOT REFERENCED`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY:');
  console.log(`  Total files: ${relativePaths.length}`);
  console.log(`  Index roots: ${INDEX_ROOTS.length}`);
  console.log(`  Files checked: ${filesToCheck.length}`);
  console.log(`  Exception files: ${EXCEPTION_FILES.length}`);
  console.log(`  Orphaned documents: ${orphans.length}`);
  
  if (orphans.length > 0) {
    console.log('\n❌ ORPHANED DOCUMENTS DETECTED:');
    orphans.forEach(path => console.log(`  - ${path}`));
    console.log('\nThese files are not referenced in any index document!');
    process.exit(1);
  } else {
    console.log('\n✅ No orphan docs detected. All documents are properly referenced!');
    process.exit(0);
  }
}

main();

