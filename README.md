# Shop Frontend

Next.js (App Router) + TypeScript + Tailwind. Customer-facing eCommerce site.

## Setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

## Run

```bash
npm run dev   # http://localhost:3000
npm run build && npm start
```

Ensure the **backend API** is running and seeded so products and auth work.

## Routes

- `/` – Home (featured products + banner)
- `/products` – Product grid, pagination, search, category filter
- `/products/[slug]` – Product detail, add to cart
- `/cart` – Cart (guest: localStorage; logged-in: API)
- `/checkout` – Address form, place order (no payment)
- `/order-success` – “Buy ho gaya ✅” after order
- `/orders` – My orders (login required)
- `/orders/[id]` – Order detail
- `/login`, `/register` – Auth

## Features

- Product listing with pagination (limit/skip), search, category filter, skeletons, empty state
- Product detail: gallery, price/discount, stock, specs, add to cart
- Guest cart (localStorage) and logged-in cart (synced with API); sync on login
- Checkout: address form, place order, redirect to order-success
- Orders list and detail for logged-in users
