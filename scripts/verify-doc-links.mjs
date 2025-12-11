#!/usr/bin/env node

/**
 * Documentation Link Verification Script
 * 
 * Checks that all relative markdown links in DOCS_INDEX.md point to existing files.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';

function extractMarkdownLinks(content) {
  // Match markdown links: [text](path)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      path: match[2]
    });
  }
  
  return links;
}

function main() {
  const rootDir = process.cwd();
  const docsIndexPath = join(rootDir, 'DOCS_INDEX.md');
  
  console.log('🔍 Documentation Link Verification\n');
  console.log(`Root directory: ${rootDir}`);
  console.log(`Checking: DOCS_INDEX.md\n`);
  
  if (!existsSync(docsIndexPath)) {
    console.error('❌ DOCS_INDEX.md not found!');
    process.exit(1);
  }
  
  const content = readFileSync(docsIndexPath, 'utf-8');
  const links = extractMarkdownLinks(content);
  
  console.log(`📊 Found ${links.length} links\n`);
  
  const mdLinks = links.filter(link => {
    // Filter for relative .md links (not URLs)
    return link.path.endsWith('.md') && !link.path.startsWith('http');
  });
  
  console.log(`🔗 Checking ${mdLinks.length} relative markdown links:\n`);
  
  let brokenLinks = 0;
  let workingLinks = 0;
  
  for (const link of mdLinks) {
    // Resolve relative to DOCS_INDEX.md location (root)
    const targetPath = resolve(dirname(docsIndexPath), link.path);
    
    if (existsSync(targetPath)) {
      console.log(`  ✅ ${link.path}`);
      workingLinks++;
    } else {
      console.log(`  ❌ ${link.path} - FILE NOT FOUND`);
      console.log(`     Link text: "${link.text}"`);
      console.log(`     Resolved to: ${targetPath}`);
      brokenLinks++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY:');
  console.log(`  Total links: ${links.length}`);
  console.log(`  Markdown links checked: ${mdLinks.length}`);
  console.log(`  Working links: ${workingLinks}`);
  console.log(`  Broken links: ${brokenLinks}`);
  
  if (brokenLinks > 0) {
    console.log('\n❌ VERIFICATION FAILED: Broken links detected');
    process.exit(1);
  } else {
    console.log('\n✅ VERIFICATION PASSED: All links are valid!');
    process.exit(0);
  }
}

main();

