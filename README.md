> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD

**Marketing content that's always on-brand.**

POSTD is a marketing content system that ingests your website and social presence to generate on-brand content powered by AI.

## 📖 Using the Docs

POSTD's documentation is organized and indexed in **[DOCS_INDEX.md](./DOCS_INDEX.md)** for easy navigation.

**Quick links:**
- **Product & Architecture** → [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) and [DOCS_INDEX.md](./DOCS_INDEX.md)
- **Setup** → [docs/development/SETUP.md](./docs/development/SETUP.md) and [docs/development/QUICK_START.md](./docs/development/QUICK_START.md)
- **Dev Mode** → [DEV_MODE_SETUP.md](./DEV_MODE_SETUP.md) and [docs/development/DEV_MODE.md](./docs/development/DEV_MODE.md)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or pnpm
- A Supabase account (sb_publishable_I8qdcyhHU68BYhcNZ4Fepg_1vPzJUP2)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd POSTD
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**

Copy the example env file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

To get these values:
- Go to [app.supabase.com](https://app.supabase.com)
- Create a new project (or use an existing one)
- Go to Settings → API
- Copy the **Project URL** and **anon public** key

4. **Apply database migrations**

Run the SQL migrations in your Supabase project:
- Go to the SQL Editor in your Supabase dashboard
- Copy the contents of `supabase/migrations/001_create_workspaces.sql`
- Execute the migration

See `supabase/README.md` for detailed migration instructions.

5. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

6. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
POSTD/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Business logic & utilities
│   └── hooks/           # Custom React hooks
├── supabase/
│   └── migrations/      # Database migrations
├── docs/                # Documentation
│   ├── ARCHITECTURE.md  # System architecture
│   └── MULTI_TENANCY.md # Multi-tenant design
└── README.md
```

## 🏗️ Architecture

POSTD is built with:

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth

For detailed architecture information, see [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md).

## 🎯 Current Features (Phase 0 & 1)

### ✅ Phase 0 - Foundation
- [x] Next.js App Router with TypeScript
- [x] TailwindCSS styling
- [x] Supabase integration (client + server)
- [x] Email/password authentication
- [x] Protected `/app` routes
- [x] Landing page with marketing copy

### ✅ Phase 1 - Multi-Tenant Workspaces
- [x] Workspace database schema with RLS
- [x] Automatic workspace creation on signup
- [x] Workspace-aware `/app` dashboard
- [x] Workspace switcher UI (foundation)
- [x] Server and client workspace helpers

## 🛣️ Roadmap

### Phase 2: Website Ingestion (Coming Soon)
- Website crawler
- Content extraction and analysis
- Brand voice detection

### Phase 3: Social Connectors (Coming Soon)
- OAuth integrations (Twitter, LinkedIn, Instagram)
- Social content analysis
- Style pattern recognition

### Phase 4: Brand Guide Generation (Coming Soon)
- AI-powered brand guide creation
- Voice, tone, and style guidelines
- Visual identity (colors, fonts)

### Phase 5: On-Brand Content Generator (Coming Soon)
- AI content generation
- Multi-format support (social, blog, email)
- Brand consistency checking

### Phase 6: Analytics & AI Feedback (Coming Soon)
- Content performance tracking
- AI model refinement
- A/B testing

## 📚 Documentation

- [ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) - System architecture and design decisions
- [MULTI_TENANCY.md](./docs/architecture/MULTI_TENANCY.md) - Multi-tenant workspace design
- [supabase/README.md](./supabase/README.md) - Database migration guide

For complete documentation, see [DOCS_INDEX.md](./DOCS_INDEX.md)

## 🧪 Development

### Code Quality

Run the linter:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

### Testing

Run end-to-end tests:
```bash
# Install Playwright (first time only)
npx playwright install

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed
```

See `tests/README.md` for more testing information.

### Building for Production

```bash
npm run build
npm start
```

## 🔐 Security

- All `/app` routes are protected by Next.js middleware
- Row-Level Security (RLS) enforces workspace access at the database level
- Authentication tokens stored in secure httpOnly cookies
- Service role keys kept server-side only

## 🤝 Contributing

This is a private project. If you have access, please follow these guidelines:

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

All rights reserved.

## 🙋 Support

For questions or issues, please contact the development team or open an issue in the repository.

---

Built with ❤️ using Next.js and Supabase

