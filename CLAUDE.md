# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking

# Database (Supabase Local Development)
npx supabase start       # Start local Supabase (Docker required)
npx supabase stop        # Stop local Supabase
npx supabase db reset    # Reset local database and apply migrations
npx supabase status      # Show local Supabase status and URLs

# Database (Supabase Remote)
npm run db:push          # Push schema to remote Supabase
npm run db:pull          # Pull schema from remote Supabase
npm run db:migration     # Create new migration

# Generate TypeScript types from local database
npx supabase gen types typescript --local > src/lib/supabase/types.ts
```

## Local Development Setup

For local development, use the local Supabase instance:

```bash
# Start local Supabase (requires Docker)
npx supabase start
```

Local Supabase URLs:
- **Studio**: http://127.0.0.1:54323
- **API URL**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

For local development, create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<from supabase start output>"
SUPABASE_SECRET_KEY="<from supabase start output>"
```

## Architecture

### Integrations Pattern

The codebase uses a modular integration pattern in `src/integrations/`:

**Calculators** (`src/integrations/calculators/`)
- Registry-based system with dynamic loading
- Each calculator is a self-contained module in `calculators/[slug]/`
- Required exports: `config`, `calculate`, `CalculatorUI`, `inputSchema`, `outputSchema`
- Registry singleton at `lib/registry.ts` handles lookup and caching
- PDF reports generated via `@react-pdf/renderer`

**Forms** (`src/integrations/form/`)
- Typeform-compatible form system
- Supports conditional logic with jump actions
- Field types: short_text, long_text, email, phone_number, multiple_choice, yes_no, checkbox

### Data Layer

**Supabase** (`src/lib/supabase/`)
- `client.ts` - Browser client for client components
- `server.ts` - Server client with cookie-based auth + service client for admin ops
- `types.ts` - Generated TypeScript types from database schema

**Email** (`src/lib/email/`)
- Resend for transactional emails
- React email templates in `templates/`

### Key Patterns

- Next.js 16 App Router with React 19
- Zod for runtime validation
- Calculator routes at `/calculators/[slug]` with dynamic loading
- Form submissions stored in Supabase with `form_submissions` table

## Database Migrations

**Important**: Add all database changes to the single migration file:
`supabase/migrations/20251205140351_initial_schema.sql`

Do NOT create new migration files. Keep all schema changes consolidated in this one file to maintain a clean migration history.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

## Adding a New Calculator

1. Create folder: `src/integrations/calculators/calculators/[slug]/`
2. Add files: `config.ts`, `types.ts`, `logic.ts`, `validation.ts`, `ui.tsx`, `index.ts`
3. Register in `config/calculators.ts`
4. Export from `calculators/index.ts`

## Deployment

**Important**: Do NOT deploy to Vercel automatically after commits. Only deploy when the user explicitly says "deploy to vercel".

## Git Commits

**Important**: Never use Claude as co-author in commits. Do NOT add:
- `Co-Authored-By: Claude`
- `🤖 Generated with Claude Code`
- Any other Claude attribution

Keep commit messages clean and professional without AI attribution.
