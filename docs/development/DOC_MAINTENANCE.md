> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# Documentation Maintenance Guide

**Last Updated**: December 11, 2025  
**Purpose**: Quick reference for maintaining documentation quality

This guide documents the tiny habits and processes for keeping POSTD documentation at 100% quality.

---

## 🎯 The Golden Rule

**Before merging any PR that touches documentation:**

```bash
npm run verify:docs
```

If it's green ✅, you're still at 100%.

---

## 📝 Adding a New Document

### Steps

1. **Create the file** in the appropriate directory
2. **Add status tag** at the top:
   ```markdown
   > **STATUS: 🟢 CANONICAL**  
   > This document is current and treated as a source of truth.
   ```
3. **Reference it in DOCS_INDEX.md**
   - Add to the appropriate section
   - Include description and status indicator
4. **Verify**:
   ```bash
   npm run verify:docs
   ```

### Example

```markdown
> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# My New Feature Documentation

Content here...
```

Then in `DOCS_INDEX.md`:
```markdown
| **[docs/workflows/MY_NEW_FEATURE.md](docs/workflows/MY_NEW_FEATURE.md)** | Description here | 🟢 CANONICAL |
```

---

## 📦 Archiving a Document

### When to Archive

Archive a document when:
- ✅ A feature has been completed and documented elsewhere
- ✅ An implementation report is no longer actively referenced
- ✅ A fix/audit is complete and superseded by current docs
- ✅ Historical context should be preserved but not actively maintained

### Steps

1. **Move to archive folder**
   ```bash
   mkdir -p docs/archive-docs/YYYY-MM-DD-topic-name/
   mv path/to/OLD_DOC.md docs/archive-docs/YYYY-MM-DD-topic-name/
   ```

2. **Change status tag** to archived:
   ```markdown
   > **STATUS: 🔴 ARCHIVED**  
   > This document is kept for historical reference and is not actively maintained.
   ```

3. **Update archive README**
   
   Add to `docs/archive-docs/README.md`:
   ```markdown
   ### `YYYY-MM-DD-topic-name/` (N documents)
   Brief description:
   - OLD_DOC.md
   ```

4. **Update DOCS_INDEX.md**
   
   Move reference to Archive section or remove if no longer needed

5. **Verify**:
   ```bash
   npm run verify:docs
   ```

### Example

Moving an old implementation report:

```bash
# 1. Move file
mkdir -p docs/archive-docs/2025-12-15-phase3-social/
mv docs/PHASE_3_IMPLEMENTATION.md docs/archive-docs/2025-12-15-phase3-social/

# 2. Update status tag in the file
# (Change 🟢 CANONICAL to 🔴 ARCHIVED)

# 3. Add to docs/archive-docs/README.md
# 4. Update DOCS_INDEX.md archive section
# 5. Verify
npm run verify:docs
```

---

## 🔄 Updating an Existing Document

### Steps

1. **Make your changes** to the document
2. **Ensure status tag remains** at the top
3. **Update "Last Updated" date** if present
4. **Verify**:
   ```bash
   npm run verify:docs
   ```

That's it! No need to update DOCS_INDEX.md if just updating content.

---

## 🚨 If Verification Fails

### Status Tag Issues

```bash
❌ DOCS_INDEX.md: MISSING STATUS TAG
```

**Fix**: Add status tag to the top of the file:
```markdown
> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.
```

### Orphaned Document

```bash
❌ ORPHANED DOCUMENTS DETECTED:
  - docs/some-file.md
```

**Fix**: Reference it in `DOCS_INDEX.md`, `PROJECT_STATUS.md`, or `archive-docs/README.md`

### Broken Link

```bash
❌ docs/old-file.md - FILE NOT FOUND
   Link text: "See old file"
```

**Fix**: Update the link to point to the correct file or remove it

---

## 🔍 Verification Commands

### Run All Verifications
```bash
npm run verify:docs
```

### Run Individual Checks
```bash
npm run verify:docs:status    # Check status tags
npm run verify:docs:orphans   # Check for orphans
npm run verify:docs:links     # Check internal links
```

### Direct Script Execution
```bash
node scripts/verify-doc-status.mjs
node scripts/verify-doc-orphans.mjs
node scripts/verify-doc-links.mjs
```

---

## 📊 Current Documentation State

As of December 11, 2025:

- **Total files**: 31 markdown files
- **Canonical**: 16 files (53%)
- **Archived**: 15 files (47%)
- **Orphans**: 0
- **Broken links**: 0
- **Status tag compliance**: 100%

**Goal**: Maintain 100% across all metrics.

---

## 🎯 Quality Standards

### Every Markdown File Must Have

1. ✅ **Status tag** at the top (🟢 CANONICAL or 🔴 ARCHIVED)
2. ✅ **Reference** in at least one index document
3. ✅ **Working links** (no broken internal references)

### DOCS_INDEX.md Must

1. ✅ Reference all canonical documents
2. ✅ Have working links to all referenced files
3. ✅ Be organized by topic/purpose

### Archive Must

1. ✅ Be organized by date and topic
2. ✅ List all archived files in `archive-docs/README.md`
3. ✅ Preserve historical context

---

## 🤖 CI/CD Integration

### GitHub Actions Workflow

A workflow is configured at `.github/workflows/verify-docs.yml` that:

- ✅ Runs on every PR that touches `.md` files
- ✅ Runs on push to `main` with doc changes
- ✅ Blocks merge if verification fails
- ✅ Provides clear success/failure summaries

### Local Testing Before Push

Always run before committing doc changes:

```bash
npm run verify:docs
```

If all checks pass locally, CI will pass too.

---

## 📋 Common Scenarios

### Scenario: Added a new feature documentation

```bash
# 1. Create file
echo "> **STATUS: 🟢 CANONICAL**" > docs/workflows/NEW_FEATURE.md
# ... add content ...

# 2. Reference in DOCS_INDEX.md
# Add under ## 🔧 Workflows & Features

# 3. Verify
npm run verify:docs
```

### Scenario: Completed Phase 3, need to archive implementation report

```bash
# 1. Move to archive
mkdir -p docs/archive-docs/2025-12-20-phase3/
mv docs/PHASE_3_IMPLEMENTATION.md docs/archive-docs/2025-12-20-phase3/

# 2. Update status tag to 🔴 ARCHIVED

# 3. List in docs/archive-docs/README.md

# 4. Verify
npm run verify:docs
```

### Scenario: Renamed a file

```bash
# 1. Rename the file
git mv docs/old-name.md docs/new-name.md

# 2. Update all references in DOCS_INDEX.md

# 3. Verify (will catch any broken links)
npm run verify:docs
```

---

## 🎓 Best Practices

### DO ✅

- Add status tags to every new markdown file
- Reference new docs in DOCS_INDEX.md immediately
- Archive completed work rather than deleting
- Run `npm run verify:docs` before committing
- Organize archives by date and topic

### DON'T ❌

- Create markdown files without status tags
- Leave orphaned documents unreferenced
- Delete historical documentation
- Skip verification before merging
- Mix canonical and archived content in same folder

---

## 🔗 Related Documentation

- **[DOCS_INDEX.md](../../DOCS_INDEX.md)** - Central documentation index
- **[DOCS_VERIFICATION_REPORT.md](../../DOCS_VERIFICATION_REPORT.md)** - Latest verification results
- **[docs/archive-docs/README.md](../archive-docs/README.md)** - Archive organization

---

## 📞 Questions?

If verification fails and you're not sure how to fix it:

1. Check the error message (scripts provide clear output)
2. Review this guide for the relevant scenario
3. Look at existing docs for examples
4. Run individual verification scripts for more detail

**The verification scripts are your friends!** They'll tell you exactly what's wrong and where.

---

**Maintained by**: POSTD Documentation Team  
**Last Verification**: December 11, 2025  
**Status**: ✅ All systems green

