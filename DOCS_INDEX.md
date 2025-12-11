> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD Documentation Index

**Last Updated**: December 11, 2025  
**Purpose**: Single source of truth for all POSTD documentation

This index provides a complete map of the POSTD documentation. All documents marked 🟢 CANONICAL are actively maintained and treated as authoritative.

---

## 🚀 New Developer? Start Here

If you're new to POSTD, follow this path:

1. **[README.md](README.md)** 🟢 - Project overview, what POSTD is, and quick start
2. **[docs/development/QUICK_START.md](docs/development/QUICK_START.md)** 🟢 - Get running in 5 minutes
3. **[docs/development/SETUP.md](docs/development/SETUP.md)** 🟢 - Detailed setup instructions
4. **[docs/development/RULES.md](docs/development/RULES.md)** 🟢 ⚠️ **MUST READ** - Development standards

---

## 📐 Architecture & Design

Understand how POSTD is built:

| Document | Description | Status |
|----------|-------------|--------|
| **[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)** | System architecture, tech stack, directory structure | 🟢 CANONICAL |
| **[docs/architecture/MULTI_TENANCY.md](docs/architecture/MULTI_TENANCY.md)** | Workspace model, RLS policies, data isolation | 🟢 CANONICAL |
| **[docs/architecture/API.md](docs/architecture/API.md)** | API routes, request/response formats, authentication | 🟢 CANONICAL |
| **[docs/architecture/TESTING_SETUP.md](docs/architecture/TESTING_SETUP.md)** | Playwright setup, test organization, running tests | 🟢 CANONICAL |

---

## 💻 Development Guides

Essential information for developers:

| Document | Description | Status |
|----------|-------------|--------|
| **[docs/development/RULES.md](docs/development/RULES.md)** | ⚠️ Development rules, restrictions, patterns to follow | 🟢 CANONICAL |
| **[docs/development/SETUP.md](docs/development/SETUP.md)** | Complete local setup guide | 🟢 CANONICAL |
| **[docs/development/QUICK_START.md](docs/development/QUICK_START.md)** | 5-minute quick start | 🟢 CANONICAL |
| **[docs/development/DEV_MODE.md](docs/development/DEV_MODE.md)** | Comprehensive dev mode documentation | 🟢 CANONICAL |
| **[DEV_MODE_SETUP.md](DEV_MODE_SETUP.md)** | Quick reference for enabling dev mode | 🟢 CANONICAL |

---

## 🔧 Workflows & Features

Implementation guides for active features:

| Document | Description | Status |
|----------|-------------|--------|
| **[docs/workflows/PHASE_2_WEBSITE_INGESTION.md](docs/workflows/PHASE_2_WEBSITE_INGESTION.md)** | Website crawler, content extraction, API routes | 🟢 CANONICAL |

*Future workflows (Phase 3+) will be added here as they're implemented.*

---

## 📊 Current Status

Where we are and what's next:

| Document | Description | Status |
|----------|-------------|--------|
| **[docs/current-status/PROJECT_STATUS.md](docs/current-status/PROJECT_STATUS.md)** | Phase completion status, roadmap, features | 🟢 CANONICAL |
| **[DOCS_VERIFICATION_REPORT.md](DOCS_VERIFICATION_REPORT.md)** | Automated documentation verification results | 🟢 CANONICAL |

---

## 🔌 Database & Infrastructure

Database setup, migrations, and configuration:

| Document | Description | Status |
|----------|-------------|--------|
| **[supabase/README.md](supabase/README.md)** | Migration guide, RLS setup, troubleshooting | 🟢 CANONICAL |

---

## 🧪 Testing

Testing infrastructure and guides:

| Document | Description | Status |
|----------|-------------|--------|
| **[tests/README.md](tests/README.md)** | How to run tests, test organization | 🟢 CANONICAL |
| **[docs/architecture/TESTING_SETUP.md](docs/architecture/TESTING_SETUP.md)** | Playwright configuration, writing tests | 🟢 CANONICAL |

---

## 📦 Archive

Historical documentation preserved for reference but not actively maintained:

**[docs/archive-docs/](docs/archive-docs/)** - Complete archive with README

### Archive Organization

| Folder | Contents | Date |
|--------|----------|------|
| **[2025-11-19-auth-evolution/](docs/archive-docs/2025-11-19-auth-evolution/)** | Authentication system fixes and audits (9 documents) | Nov 19, 2025 |
| **[2025-11-19-workspace-fixes/](docs/archive-docs/2025-11-19-workspace-fixes/)** | Workspace RLS policy fixes (2 documents) | Nov 19, 2025 |
| **[2025-12-11-dev-mode/](docs/archive-docs/2025-12-11-dev-mode/)** | Dev mode implementation report | Dec 11, 2025 |
| **[phase-completions/](docs/archive-docs/phase-completions/)** | Phase completion summaries and verification | Various |

**All archived documents have 🔴 ARCHIVED status** and represent completed work, historical audits, or superseded implementations.

---

## 🎯 Quick Reference by Topic

### Authentication
- **Current**: See [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) - "Authentication Flow" section
- **Historical**: See [docs/archive-docs/2025-11-19-auth-evolution/](docs/archive-docs/2025-11-19-auth-evolution/)

### Workspaces & Multi-Tenancy
- **Current**: [docs/architecture/MULTI_TENANCY.md](docs/architecture/MULTI_TENANCY.md)
- **Historical**: [docs/archive-docs/2025-11-19-workspace-fixes/](docs/archive-docs/2025-11-19-workspace-fixes/)

### Dev Mode
- **Current**: [docs/development/DEV_MODE.md](docs/development/DEV_MODE.md) and [DEV_MODE_SETUP.md](DEV_MODE_SETUP.md)
- **Historical**: [docs/archive-docs/2025-12-11-dev-mode/](docs/archive-docs/2025-12-11-dev-mode/)

### Website Crawling
- **Current**: [docs/workflows/PHASE_2_WEBSITE_INGESTION.md](docs/workflows/PHASE_2_WEBSITE_INGESTION.md)
- **Historical**: [docs/archive-docs/phase-completions/PHASE_2_SUMMARY.md](docs/archive-docs/phase-completions/PHASE_2_SUMMARY.md)

### Setup & Installation
- **Quick**: [docs/development/QUICK_START.md](docs/development/QUICK_START.md)
- **Detailed**: [docs/development/SETUP.md](docs/development/SETUP.md)
- **Database**: [supabase/README.md](supabase/README.md)

### API Reference
- **Current**: [docs/architecture/API.md](docs/architecture/API.md)
- **Architecture Context**: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)

### Development Rules
- **Critical**: [docs/development/RULES.md](docs/development/RULES.md) ⚠️ **MUST READ BEFORE CODING**

---

## 📝 Documentation Standards

### Status Tags

Every documentation file has one of three status tags:

- **🟢 CANONICAL** - Current, actively maintained, authoritative
- **🟡 MIXED** - Contains both current and potentially outdated content
- **🔴 ARCHIVED** - Historical reference only, not actively maintained

### Maintaining Documentation

When creating or updating documentation:

1. **Add status tag** at the top of every `.md` file
2. **Update this index** when adding new documentation
3. **Archive old docs** rather than deleting them (preserve history)
4. **Cross-reference** related documents for easy navigation
5. **Date stamp** implementation reports and time-bound documents

---

## 🆘 Common Questions

**Q: How do I set up POSTD locally?**  
→ Follow [docs/development/QUICK_START.md](docs/development/QUICK_START.md) or [docs/development/SETUP.md](docs/development/SETUP.md)

**Q: How do I develop without logging in every time?**  
→ See [DEV_MODE_SETUP.md](DEV_MODE_SETUP.md) for quick setup or [docs/development/DEV_MODE.md](docs/development/DEV_MODE.md) for details

**Q: What development rules must I follow?**  
→ Read [docs/development/RULES.md](docs/development/RULES.md) - this is mandatory!

**Q: How do workspaces work in POSTD?**  
→ See [docs/architecture/MULTI_TENANCY.md](docs/architecture/MULTI_TENANCY.md)

**Q: How do I connect a website for crawling?**  
→ See [docs/workflows/PHASE_2_WEBSITE_INGESTION.md](docs/workflows/PHASE_2_WEBSITE_INGESTION.md)

**Q: Why are there so many archived auth documents?**  
→ The auth system evolved through multiple iterations. Current implementation is documented in [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md); historical fixes are preserved in [docs/archive-docs/2025-11-19-auth-evolution/](docs/archive-docs/2025-11-19-auth-evolution/)

**Q: Where are database migrations?**  
→ See [supabase/README.md](supabase/README.md) and `supabase/migrations/` directory

**Q: How do I run tests?**  
→ See [tests/README.md](tests/README.md)

---

## 🔗 External Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Playwright**: https://playwright.dev

---

## 📌 Maintenance

This index is maintained manually and should be updated whenever:
- New documentation is created
- Documents are moved or renamed
- Documents are archived
- Status tags change

**Last Index Update**: December 11, 2025

---

*For questions or issues with documentation, contact the development team or open an issue.*

