# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js project implementing modern web development best practices. It uses Next.js 15.5.4 with the App Router, React 19, TypeScript, and focuses on type-safe development patterns.

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **Database**: Prisma ORM with SQLite
- **Environment**: Type-safe environment variables with @t3-oss/env-nextjs and Zod
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Font**: Geist font family optimization

## Essential Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build with Turbopack
npm start           # Start production server
```

### Code Quality
```bash
npm run lint        # Run Biome linter checks
npm run format      # Format code with Biome
```

### Database (Prisma)
```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma db push     # Push schema to database
npx prisma studio      # Open database browser
npx prisma migrate dev # Create and apply migrations
```

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/env.ts` - Type-safe environment variable validation
- `prisma/` - Database schema and migrations
- Path alias: `@/*` maps to `./src/*`

### Key Patterns
- **Environment Variables**: All environment variables must be defined and validated in `src/env.ts` using Zod schemas
- **Database**: Prisma client generates to `src/generated/prisma`
- **Styling**: Uses Tailwind CSS with global styles in `src/app/globals.css`
- **Fonts**: Geist font family with Next.js font optimization

## Code Style

### Biome Configuration
- **Indentation**: 2 spaces
- **Rules**: Biome recommended + Next.js and React domains
- **Import Organization**: Automatic sorting enabled
- **Target Files**: All files except node_modules, .next, dist, build

### TypeScript
- **Strict mode**: Enabled
- **Target**: ES2017
- **Module Resolution**: Bundler
- **JSX**: Preserve (handled by Next.js)

## Task Completion Checklist

After making changes, always run:

1. `npm run lint` - Verify code quality
2. `npm run build` - Ensure production build succeeds
3. `npm run dev` - Test in development mode

For database changes:
1. Run `npx prisma generate` after schema modifications
2. Consider `npx prisma db push` for development changes

## Environment Variables

Environment variables are strictly typed and validated. Add new variables to `src/env.ts`:

- Server variables: Define in `server` object with Zod schema
- Client variables: Define in `client` object (must be prefixed with `NEXT_PUBLIC_`)
- Runtime env: Add client variables to `experimental__runtimeEnv` object

## Deployment

The project is configured with `output: "standalone"` for containerized deployments. The build includes all necessary dependencies for self-contained execution.