# D&D Encounter Runner

A modern web application built with Vite, React, TypeScript, Vitest, and Material-UI.

## Tech Stack

- **Vite** - Next generation frontend tooling
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vitest** - Fast unit test framework
- **Material-UI (MUI)** - React component library

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

### Build

Build for production:

```bash
pnpm build
```

### Preview

Preview the production build:

```bash
pnpm preview
```

### Testing

Run tests (watch mode by default):

```bash
pnpm test
```

### Database

Generate a new Drizzle migration from schema changes:

```bash
pnpm db:generate
```

Apply pending migrations:

```bash
pnpm db:migrate
```

Seed the database with development data:

```bash
pnpm db:seed
```

Regenerate Supabase TypeScript types from the local database (run after `db:migrate` when schema changes):

```bash
pnpm db:gen-types
```
