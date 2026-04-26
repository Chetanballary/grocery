# FreshCart - Online Grocery Store

## Overview

FreshCart is a full-stack online grocery store with categories for fruits, vegetables, dairy & bread, personal daily essentials, home utilities, and puja items. Customers can browse products, search, manage a cart, and place orders.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React 19 + Vite 7 + Tailwind 4 + wouter + React Query
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/grocery-store` — React + Vite storefront, served at `/`
- `artifacts/api-server` — Express API for products, cart, and orders, served at `/api`
- `artifacts/mockup-sandbox` — design canvas

## Domain Model (Drizzle schema in `lib/db/src/schema/`)

- `categories` — top-level grocery categories with image and accent color
- `products` — products with price, MRP (for showing discount), unit, stock, rating
- `cart_items` — session-scoped shopping cart line items
- `orders` + `order_items` — placed orders with delivery and payment info

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed-grocery` — seed categories and products

## Notes

- Cart and orders are session-scoped via an `fc_sid` cookie set by the API.
- Free delivery for orders ≥ ₹499; otherwise ₹29 flat fee.
- Three payment methods supported on checkout: COD, UPI, Card (no real payment processor — order is recorded).

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
