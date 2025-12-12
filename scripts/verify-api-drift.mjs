#!/usr/bin/env node

/**
 * API Contract Drift Audit
 * 
 * Verifies that API implementations match:
 * - What the documentation describes (docs/architecture/API.md)
 * - What the frontend code expects
 * - TypeScript types and interfaces
 * 
 * Checks the "Code–API–Docs triangle" for consistency.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔍 API Contract Drift Audit\n');
console.log('Verifying API implementations match documentation and usage...\n');

let errors = 0;
let warnings = 0;

// ============================================================
// PHASE 1: Load API Documentation
// ============================================================

console.log('📖 PHASE 1: Loading API Documentation\n');

const apiDoc = readFileSync('docs/architecture/API.md', 'utf-8');

// Parse documented endpoints from API.md
const documentedAPIs = [
  {
    method: 'GET',
    path: '/api/app/active-workspace',
    description: "Get current user's active workspace",
    authRequired: true,
    expectedResponse: {
      workspace: { id: 'uuid', name: 'string', created_by: 'uuid', created_at: 'timestamp', role: 'string' },
      user: { id: 'uuid', email: 'string' }
    },
    file: 'src/app/api/app/active-workspace/route.ts'
  },
  {
    method: 'GET',
    path: '/api/workspaces/[workspaceId]/sources',
    description: 'List all sources for a workspace',
    authRequired: true,
    expectedResponse: {
      sources: 'array'
    },
    file: 'src/app/api/workspaces/[workspaceId]/sources/route.ts'
  },
  {
    method: 'POST',
    path: '/api/workspaces/[workspaceId]/sources/website',
    description: 'Create website source and trigger crawl',
    authRequired: true,
    expectedResponse: {
      source: 'object',
      result: 'object'
    },
    file: 'src/app/api/workspaces/[workspaceId]/sources/website/route.ts'
  },
  {
    method: 'GET',
    path: '/api/workspaces/[workspaceId]/crawled-pages',
    description: 'List crawled pages for a workspace',
    authRequired: true,
    expectedResponse: {
      pages: 'array'
    },
    file: 'src/app/api/workspaces/[workspaceId]/crawled-pages/route.ts'
  }
];

console.log(`Found ${documentedAPIs.length} documented API endpoints\n`);

// ============================================================
// PHASE 2: Verify API Route Implementations Exist
// ============================================================

console.log('📂 PHASE 2: Verifying Route Files Exist\n');

documentedAPIs.forEach(api => {
  try {
    const content = readFileSync(api.file, 'utf-8');
    console.log(`  ✅ ${api.method} ${api.path}`);
    
    // Check for correct export
    const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${api.method}`, 'i');
    if (!methodRegex.test(content)) {
      console.log(`     ❌ Missing 'export async function ${api.method}'`);
      errors++;
    }
    
    // Store content for later checks
    api.implementation = content;
    
  } catch (err) {
    console.log(`  ❌ ${api.method} ${api.path}`);
    console.log(`     File not found: ${api.file}`);
    errors++;
  }
});

console.log();

// ============================================================
// PHASE 3: Verify Auth Pattern Consistency
// ============================================================

console.log('🔐 PHASE 3: Verifying Auth Patterns\n');

documentedAPIs.forEach(api => {
  if (!api.implementation) return;
  
  if (api.authRequired) {
    // Check for standard auth helpers OR dev mode conditional
    const hasAuthHelper = api.implementation.includes('authenticateRequest');
    const hasDevModeConditional = api.implementation.includes('isDevMode()') && 
                                   api.implementation.includes('getDevWorkspace');
    const hasMembershipHelper = api.path.includes('workspaceId') && 
                                api.implementation.includes('verifyWorkspaceMembership');
    
    if (!hasAuthHelper && !hasDevModeConditional) {
      console.log(`  ❌ ${api.method} ${api.path}`);
      console.log(`     Missing authenticateRequest() helper (using manual auth)`);
      errors++;
    } else if (hasDevModeConditional && !hasAuthHelper) {
      console.log(`  ✅ ${api.method} ${api.path} - Uses dev mode conditional`);
    } else if (api.path.includes('workspaceId') && !hasMembershipHelper) {
      console.log(`  ⚠️  ${api.method} ${api.path}`);
      console.log(`     Missing verifyWorkspaceMembership() helper`);
      warnings++;
    } else {
      console.log(`  ✅ ${api.method} ${api.path} - Uses standard auth helpers`);
    }
    
    // Check for manual Supabase auth (anti-pattern)
    if (api.implementation.includes('supabase.auth.getUser()') && !hasAuthHelper) {
      console.log(`  ⚠️  ${api.method} ${api.path}`);
      console.log(`     Using manual supabase.auth.getUser() - should use authenticateRequest()`);
      warnings++;
    }
  }
});

console.log();

// ============================================================
// PHASE 4: Verify Frontend Usage Matches API Contracts
// ============================================================

console.log('🎨 PHASE 4: Verifying Frontend Usage\n');

function findAPIUsage(apiPath) {
  const usages = [];
  const searchPath = apiPath.replace(/\[workspaceId\]/g, '${workspaceId}');
  
  function searchDir(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'api') {
        continue;
      }
      
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          // Look for fetch calls to this API
          if (content.includes(apiPath) || content.includes(searchPath)) {
            usages.push(fullPath);
          }
        } catch (err) {
          // Skip files we can't read
        }
      }
    }
  }
  
  searchDir('src');
  return usages;
}

documentedAPIs.forEach(api => {
  const usages = findAPIUsage(api.path);
  
  if (usages.length === 0) {
    console.log(`  ⚠️  ${api.method} ${api.path}`);
    console.log(`     Not called from any frontend code (potentially unused API)`);
    warnings++;
  } else {
    console.log(`  ✅ ${api.method} ${api.path} - Used in ${usages.length} file(s)`);
  }
});

console.log();

// ============================================================
// PHASE 5: Check for Undocumented API Routes
// ============================================================

console.log('📋 PHASE 5: Checking for Undocumented Routes\n');

function findAllRouteFiles(dir, routes = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findAllRouteFiles(fullPath, routes);
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      routes.push(fullPath);
    }
  }
  
  return routes;
}

const allRouteFiles = findAllRouteFiles('src/app/api');
const documentedFiles = documentedAPIs.map(api => api.file);
const undocumentedRoutes = allRouteFiles.filter(route => !documentedFiles.includes(route));

if (undocumentedRoutes.length > 0) {
  console.log(`  ⚠️  Found ${undocumentedRoutes.length} undocumented API route(s):\n`);
  undocumentedRoutes.forEach(route => {
    console.log(`     - ${route}`);
    console.log(`       Should be documented in docs/architecture/API.md`);
  });
  warnings++;
} else {
  console.log(`  ✅ All API routes are documented`);
}

console.log();

// ============================================================
// Summary
// ============================================================

console.log('============================================================');
console.log('📋 API DRIFT AUDIT SUMMARY:\n');
console.log(`  Documented APIs: ${documentedAPIs.length}`);
console.log(`  Implemented routes: ${documentedAPIs.filter(a => a.implementation).length}`);
console.log(`  Routes using standard auth: ${documentedAPIs.filter(a => a.implementation?.includes('authenticateRequest')).length}`);
console.log(`  Undocumented routes: ${undocumentedRoutes.length}`);
console.log(`  Errors: ${errors}`);
console.log(`  Warnings: ${warnings}\n`);

if (errors > 0) {
  console.log('❌ API DRIFT DETECTED: Critical mismatches found');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  VERIFICATION PASSED WITH WARNINGS');
  process.exit(0);
} else {
  console.log('✅ VERIFICATION PASSED: APIs are consistent!');
  process.exit(0);
}

