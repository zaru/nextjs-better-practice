# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js project implementing modern web development best practices. It uses Next.js 15.5.4 with the App Router, React 19, TypeScript, and focuses on type-safe development patterns. The project emphasizes maintainability, practical design patterns, and realistic trade-offs over pursuing perfect architecture.

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **Database**: Prisma ORM with SQLite
- **Validation**: Zod for runtime type validation
- **Environment**: Type-safe environment variables with @t3-oss/env-nextjs and Zod
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Font**: Geist font family optimization

### Recommended Libraries
- **UI**: React Aria Components, Storybook, Tailwind CSS
- **Auth**: Better Auth or Auth0
- **Worker**: BullMQ
- **Testing**: Vitest, MSW
- **Linter/Formatter**: Biome, SecretLint
- **Other**: dotenvx, T3-Env, pino + next-logger, Sentry

### Library Selection Policy
- Minimize dependencies to reduce maintenance costs and security risks
- Implement simple features in-house rather than adding libraries
- Use libraries for complex functionality where reinvention costs outweigh benefits (e.g., advanced UI libraries)

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

### Layer Policy

The architecture uses a 2-layer data-centric approach:
- **Repository Layer**: Direct database/API operations
- **Service Layer**: Business logic and transaction management

Data operations (Mutation/DataFetch) are performed in:
- **Mutations**: Server Actions
- **Data Fetching**: Server Components
- **Exception**: Client Components for specific UI needs (infinite scroll, load more, sorting)

This architecture does not pursue DDD or Clean Architecture, but incorporates practical elements from them.

### Directory Structure

```
src
├── components          # Shared components used across pages
│   └── Card.tsx
├── repositories        # Database/API operations
│   └── TagRepository.ts
├── services           # Business logic and transactions
│   └── createTagService.ts
└── app
    └── tag
        ├── _actions       # Server Actions (mutations)
        │   └── createTag.ts
        ├── _components    # Page-specific components
        │   └── CreateTagForm.tsx
        └── page.tsx       # Page component
```

**Path Aliases:**
- `@/*` maps to `./src/*`

### Repository Layer

**Purpose**: Direct DB/API operations and DTO (Data Transfer Object) role

**Design Principles:**
- Create Repository layer for DB operations and external APIs
- Explicitly specify minimum required SELECT fields (acts as DTO)
- Design generic interfaces rather than proliferating functions
- JOIN related tables in Repository if commonly used together
  - Example: `articleRepo().find()` includes category JOIN since articles typically need category info
- Never use Prisma auto-generated types directly; explicitly specify required fields

**Type Definition Pattern:**
```typescript
// Explicitly define required fields
const tagSelect = {
  id: true,
  name: true,
} satisfies Prisma.TagSelect;

// Generate type from select
type Tag = Prisma.TagGetPayload<{ select: typeof tagSelect }>;
```

**Transaction Handling:**
- Repositories accept Prisma transaction object as parameter
- Repositories do NOT manage transactions (that's Service responsibility)

**File Naming:**
- One file per resource (e.g., `UserRepository.ts`, `ArticleRepository.ts`)

**Function Naming:**
- Base names: `list`, `count`, `find`, `create`, `update`, `delete`
- Bulk operations allowed: `bulkCreate`, `bulkUpdate`, `bulkDelete`
- PROHIBITED: Narrow-purpose functions like `updateName`, `updateDescription`
  - Keep functions generic; specialized logic belongs in Service
  - Exception: When generalization increases complexity significantly

**Raw SQL:**
- Using `$queryRaw` is acceptable
- MUST parse results with Zod
- MUST write tests with real data

### Service Layer

**Purpose**: Business logic and transaction management with high cohesion

**Design Principles:**
- Service layer handles DB transactions and expresses business logic
- Services call necessary Repositories
- One function per file (e.g., `createUserService.ts`, `deleteArticleService.ts`)
- Files and functions MUST have `Service` suffix
- Function names should clearly represent use cases (not too long)

**What is Business Logic in This Architecture:**
Business logic in this context refers to domain-specific rules and operations that coordinate multiple Repository calls within transactions.

### Mutation: Server Actions

**Purpose**: Handle mutations with authentication, validation, and service invocation (like MVC Controller)

**Design Principles:**
- Server Actions perform: auth/authz → data validation/parsing → Service call → response
- Do NOT call Repository directly from Server Actions
- Do NOT write business logic in Server Actions (delegate to Service)
- Accept FormData as argument by default
  - Use with `useActionState`
  - Exception: Simple actions like "like" button can accept any value
- Call from Form's `action` prop: `<Form action={action}>`
  - PROHIBITED: Form's `onSubmit`
  - Exception: Simple actions can use `onClick`
- Use `revalidatePath` as needed for screen updates
- One function per file
  - File name MUST match function name (e.g., `createUser.ts` contains `function createUser()`)

### Data Fetch: Server Component

**Design Principles:**
- Fetch necessary data in top-level PageComponent via Service functions
- Components deeply nested may fetch their own data
  - Often these are Client Components that cannot call Service functions directly
  - In such cases, using `fetch` equivalent is acceptable
  - Server Actions can fetch data but be cautious of performance implications
  - Principle: Pass data via props from Server Component whenever possible

## Error Handling

- Repositories and Services throw exceptions on errors
- Callers (Server Actions, etc.) use `try..catch` for proper error handling
- Do NOT use Result types

## Component Design

### Directory Structure & File Naming

**Colocation Principle:**
- Files for one screen/feature should be placed together
- Server Actions in `_actions/` directory
- Components in `_components/` directory
  - Multi-screen components go in top-level `src/components/`
- Exception: Repository and Service always in top-level directories

**File Naming:**
- File name MUST match function name
  - camelCase for functions (e.g., `createUser.ts`)
  - UpperCamelCase for components (e.g., `UserList.tsx`)

**Component Size:**
- Keep components small to minimize re-render impact
- Don't over-divide; maintain meaningful units

### Layout / Page Component

**Design Principles:**
- Use Next.js v15.5+ Page Props Helper
- Parse SearchParams with Zod schema before use
- Page Components MUST be Server Components
  - Extract to separate component if Client Component needed

### Client Component

**State Management Philosophy:**
- Minimize client-side state management
- Do NOT introduce state management libraries
- Complex client state leads to development pain

**useState / useEffect / useRef:**
- Pause and review design before using these hooks
- Simple cases often work without them
- Not forbidden; use when genuinely necessary

### Layout Components

**Pattern for Multi-Component Layouts:**
```tsx
<Card>
  <Card.Header>Card</Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

**Implementation with TypeScript Namespace:**
```typescript
export function Card(){}
export namespace Card {
  export function Header(){}
  export function Content(){}
}
```
- Namespace enables IDE code navigation support
- renderProps allowed but minimize usage

### Component Styling

**Principles:**
- Primarily rely on shared UI components for styling
- Consolidate similar-but-different designs with designer
- Location-specific designs can be styled inline
- Shared UI components should be closed for extension
  - Unrestricted external styling leads to uncontrollable complexity

## Authentication & Authorization

**Design Principles:**
- MUST perform auth/authz in PageComponent
  - Getting session in Layout is OK
  - Controlling ONLY in Layout is PROHIBITED
  - MUST check in actual page
- MUST verify auth/authz in Server Actions and Route Handlers
- Middleware auth check is OK but treat as supplementary
- Provide common generic auth functions to prevent logic dispersion:
  - `requireLogin()`: Verify authenticated
  - `hasPermission({ resource, action, session })`: Check operation permission
- Authz in Service: Domain-wise, authz is invariant so Service seems natural, but Services may be used system-wide (batch processes) without user context. Currently, handling authz at Endpoint level is clearer and more generic.

## Next.js / React Best Practices

### Parallel Routes / Intercept Routes

- Powerful features, effective when used well
- Parallel Routes especially useful for complex UI like modals (can extract as Server Component independent of nesting)
- However, directory structure and `default.tsx` concept are complex; use sparingly

### useMemo / useCallback

**PROHIBITED** with limited exceptions:
- React Compiler will handle optimization automatically in the future
- Negligible performance impact in most cases
- Increases code complexity
- Exception: ONLY when handling large data with high computational cost

## Prisma

### $extends

**PROHIBITED:**
- Powerful feature enabling model object-like expressions
- Type inference becomes complex as extensions grow
- PrismaClient handling becomes difficult
- Leads to non-essential type puzzles

## TypeScript

### Code Style

**Type Annotations:**
- Write types explicitly; don't rely solely on inference
- Function return types MUST be explicit to prevent unintended bugs
- Variable types good practice but can omit for obvious cases
  - OK to omit: `const foo = 'string'`
  - Use `satisfies` for complex objects

**Prohibited Patterns:**
- `class` is PROHIBITED
  - Classes encourage state management
  - State management has limited utility in stateless web apps
- `let` is PROHIBITED
  - For different assignments in `if-else`, extract to function and use `const`

### Branded Types

**Not Used:**
- Would enhance type safety but difficult to unify with Prisma
- Adopted policy: don't use Branded Types

## Testing Strategy

**Principle: Minimize mocking**

**Repository Tests:**
- Test with real database and data
- External APIs: Use MSW mocks
- Focus: Verify query logic and SQL correctness

**Service Tests:**
- Test with real database and data
- Call actual Repository functions
- Focus: Express business logic specs, test normal/error cases
- Avoid overly detailed test cases; focus on main scenarios

**Server Actions Tests:**
- Test with real database and data
- Focus: Parameter validation, auth/authz, error handling
- Avoid overly detailed test cases; focus on main scenarios

**Regular Components:**
- Undecided on unit testing necessity
- E2E tests may provide better coverage, but want to limit E2E test proliferation

**Shared UI Components:**
- Provide Storybook with interaction tests
  - Skip if interaction isn't complex
- Visual regression testing has value

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