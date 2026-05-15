# Next.js Template

Starter repo for a full-stack Next.js app with App Router, TypeScript, Tailwind CSS, Prisma, Clerk, and Vitest.

Prisma and Clerk are first-class. OpenAI helpers and Sentry wiring are optional.

## Deploying to Render

This repo includes an optional [`render.yaml`](render.yaml) for Render.

It provisions:

- a Node web service
- a PostgreSQL database
- `DATABASE_URL` from the Render database connection string
- prompts for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

Before using it:

- change the default service and database names if this repo has been renamed
- review the `free` plan defaults and upgrade them if they do not fit your app
- confirm your Render branch, environment variables, and Clerk production settings

## Quick Start

You need:

- Node 24
- local PostgreSQL server (e.g. [Postgres.app](https://postgresapp.com/))
- a Clerk app with publishable and secret keys

1. Install the repo toolchain, use [Mise en place](https://mise.jdx.dev/):

```bash
mise trust && mise install
```

2. Copy the example files:

```bash
cp .env{.example,}
cp .env.test{.example,}
cp prisma/seed-fixtures/local.ts{.example,}
```

3. Open `.env` & `.env.test` and update as needed (see [Environment](#environment)).

4. Install dependencies:

```bash
npm install
```

5. Prepare the local databases:

```bash
npm run db:reset
```

6. Start the app:

```bash
npm run dev
```

## Environment

Required in `.env`:

| Variable                            | Notes                                      |
| ----------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                      | Must point to a local PostgreSQL database. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key. Starts with `pk_`.  |
| `CLERK_SECRET_KEY`                  | Clerk secret key. Starts with `sk_`.       |

Required in `.env.test`:

| Variable       | Notes                                                       |
| -------------- | ----------------------------------------------------------- |
| `DATABASE_URL` | Test database URL. The example uses `nextjs_template_test`. |

Optional:

| Variable                 | Notes                                           |
| ------------------------ | ----------------------------------------------- |
| `OPENAI_API_KEY`         | Enables `src/lib/openai`.                       |
| `NEXT_PUBLIC_SENTRY_DSN` | Enables runtime Sentry reporting.               |
| `SENTRY_AUTH_TOKEN`      | Enables Sentry source map upload during builds. |
| `SENTRY_ORG`             | Enables Sentry source map upload during builds. |
| `SENTRY_PROJECT`         | Enables Sentry source map upload during builds. |

If you are not using Sentry, leave the Sentry env vars unset.

## Commands

| Task                                    | Command                    |
| --------------------------------------- | -------------------------- |
| Start local development                 | `npm run dev`              |
| Run tests                               | `npm run test`             |
| Run TypeScript checks                   | `npm run check-types`      |
| Run ESLint                              | `npm run lint`             |
| Format files                            | `npm run format`           |
| Apply Prisma schema changes             | `npm run db:migrate`       |
| Reset development and test databases    | `npm run db:reset`         |
| Reset, then create a new migration flow | `npm run db:migrate:reset` |
| Build locally                           | `npm run build`            |

Notes:

- `npm run dev` starts Next.js, Prisma Studio, and a Prisma file watcher.
- `npm run test` uses `NODE_ENV=test`, `.env.test`, and the test database.
- `npm run db:reset` only runs against a local PostgreSQL host.

## Starter Map

Read these files first:

| Path                                    | Purpose                                                 |
| --------------------------------------- | ------------------------------------------------------- |
| `src/app/page.tsx`                      | Default home page. Replace early.                       |
| `src/app/layout.tsx`                    | Root layout and metadata.                               |
| `src/app/provider.tsx`                  | Clerk provider setup.                                   |
| `src/proxy.ts`                          | Public and protected route rules.                       |
| `src/app/_lib/get-auth-redirect-url.ts` | Post-auth redirect helper.                              |
| `src/app/api/auth/sync/route.ts`        | Syncs the signed-in Clerk user into the local database. |
| `prisma/schema.prisma`                  | Prisma schema and generators.                           |
| `prisma/seed.ts`                        | Seed entry point.                                       |
| `prisma/seed-fixtures/local.ts`         | Local-only seed data.                                   |
| `src/lib/prisma/get-client.ts`          | Shared Prisma client setup.                             |
| `src/lib/openai`                        | Optional OpenAI helpers.                                |

## Starter Defaults

The starter ships with:

- Clerk routes at `/sign-in` and `/sign-up`
- route protection in `src/proxy.ts`
- post-auth sync through `/api/auth/sync`
- a single starter Prisma model: `Account`

`prisma/seed.ts` always loads `prisma/seed-fixtures/base.ts` and loads `prisma/seed-fixtures/local.ts` when that file exists.

## Structure Guidance

This repo borrows the spirit of
[bulletproof-react](https://github.com/alan2207/bulletproof-react): keep
domain behavior close to the feature that owns it, and keep framework and
shared infrastructure concerns separate.

In this template, that means:

- `src/app` is the Next.js route layer: pages, layouts, route handlers, and
  route-only helpers
- `src/features` holds feature-owned business logic
- `src/lib` holds shared cross-feature infrastructure and integrations

Prefer adding new product code to a feature first. Only move code into `app`
when it is route-specific, or into `lib` when it is truly shared.

## Adoption Checklist

Before building real features:

- replace the homepage and visible starter copy
- update app metadata and package name
- change route protection or auth redirects if your flow differs
- replace the Prisma schema and seed data for your domain
- remove OpenAI or Sentry if you do not want those integrations

If you remove Sentry, start with:

- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/instrumentation.ts`

## Decisions

ADR templates live in `docs/decisions`.
