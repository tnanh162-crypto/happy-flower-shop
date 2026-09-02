# Happy Flower - Hoa sáp Hải Phòng

A full e-commerce storefront for a flower shop with three-tier pricing
(retail / wholesale / affiliate) and a single-admin management panel.

## Stack

- **Next.js 14** (App Router) — frontend + API routes in one project
- **Tailwind CSS** — styling, with a warm beige + pastel-blue design system
- **better-sqlite3** — zero-config file-based database (`data/shop.db`)
- **bcryptjs** — password hashing for the single admin account
- Image uploads are saved to `public/uploads/` (swap for Cloudinary/S3 later if you outgrow local disk — see "Going to production" below)

No external services are required to run this locally — there's no database
server to install and no API keys to configure to get started.

## Getting started

```bash
cd flower-shop
npm install

cp .env.example .env.local
# Edit .env.local:
#   SESSION_SECRET   -> any long random string
#   ADMIN_USERNAME   -> the admin login you want
#   ADMIN_PASSWORD   -> the admin password you want

npm run seed   # creates the admin account + a few sample products
npm run dev    # http://localhost:3000
```

- Storefront: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin/login`

Re-running `npm run seed` is safe — it updates the admin password if the
account already exists, and only seeds sample products the first time
(skips if products already exist).

## Project structure

```
app/
  (site)/                  Customer-facing storefront (has its own layout: navbar/footer)
    page.js                Homepage: hero, categories, best-sellers, search results
    product/[id]/page.js   Product detail (accepts numeric id or slug)
    cart/page.js           Cart, editable quantities, live tier-based pricing
    checkout/page.js       Customer info form -> creates an order
    order-confirmation/[id]/page.js

  admin/
    login/page.js          Admin login (public)
    layout.js               Admin-only root HTML layout
    (protected)/            Route group guarded by a server-side session check
      layout.js              Redirects to /admin/login if not authenticated; renders sidebar
      page.js                 Dashboard: stats + recent orders
      products/page.js        Product list (edit/delete)
      products/new/page.js
      products/[id]/edit/page.js
      orders/page.js          Order list with status filter + inline status update
      orders/[id]/page.js     Order detail

  api/
    auth/login, auth/logout
    products/, products/[id]/     (GET public; POST/PUT/DELETE admin-only)
    upload/                       (admin-only image upload)
    orders/, orders/[id]/         (POST public checkout; GET list + PATCH status admin-only)

components/                Shared React components (Navbar, ProductCard, CartContext, admin UI, etc.)
lib/                       db.js (schema), auth.js (session/auth), pricing.js, utils.js
scripts/seed.js            Creates the admin account + sample products
data/shop.db               SQLite database file (created automatically)
public/uploads/            Uploaded product images
```

## How the three-tier pricing works

Every product stores three prices: `retail_price`, `wholesale_price`,
`ctv_price` (Vietnamese: khách lẻ / khách sỉ / cộng tác viên). On the
storefront, the customer picks their tier from a dropdown in the navbar (or
on the product page); the chosen tier is kept in `localStorage` via
`CartContext` and used everywhere prices are shown, including at checkout.
The tier the customer picked is stored on the order (`orders.price_tier`)
along with the actual unit price charged for each line item, so historical
orders keep the price that was valid at checkout time even if you edit
product prices later.

There's no login/account system for customers — tier selection is
self-service and trust-based, which matches typical small-business
wholesale/CTV arrangements (agree the tier with the customer over
phone/Zalo, they select the matching tier when ordering). If you need to
gate wholesale/CTV pricing behind real customer accounts later, that's the
main piece to add — see "Extending" below.

## Single-admin authentication

There's intentionally only one admin account (no roles/permissions system).
`scripts/seed.js` creates or updates it from `ADMIN_USERNAME` /
`ADMIN_PASSWORD` in `.env.local`. Sessions are a signed cookie (HMAC-SHA256
with `SESSION_SECRET`, 7-day expiry) — no session table, nothing to clean
up. All `/admin/*` pages except `/admin/login` are guarded server-side in
`app/admin/(protected)/layout.js`, and every mutating API route
(`POST`/`PUT`/`PATCH`/`DELETE` on products/orders, and the upload route)
independently checks the same session server-side, so the admin API isn't
reachable even if someone bypasses the UI.

**To change the admin password later:** edit `ADMIN_PASSWORD` in
`.env.local` and re-run `npm run seed`.

## Order lifecycle

Orders move through four statuses, set from the admin orders list or an
order's detail page: `pending` (chờ xác nhận) → `delivering` (đang giao) →
`completed` (hoàn tất), or `cancelled` (đã huỷ) at any point. Placing an
order decrements product stock immediately (floored at 0); there's no
automatic restock on cancellation — reverse it manually by editing the
product's stock if needed.

## Going to production

A few things to swap out before a real launch:

1. **Image storage**: local disk (`public/uploads/`) works for one server
   but won't survive redeploys on most hosting platforms and doesn't scale
   across multiple instances. Swap `app/api/upload/route.js` for a
   Cloudinary/S3 upload and store the returned URL — the rest of the app
   only ever deals with an `image_url` string, so this is a self-contained
   change.
2. **Database**: `better-sqlite3` writes to a single file — great for a
   single small-business server, but won't work on serverless/edge hosting
   or with multiple server instances. For that, swap `lib/db.js` for
   PostgreSQL (e.g. via `pg` or Prisma) — the SQL in this project is plain
   enough to port directly.
3. **HTTPS**: `SESSION_COOKIE_OPTIONS.secure` is already tied to
   `NODE_ENV === "production"`, so cookies will be marked secure in
   production automatically — just make sure the app is actually served
   over HTTPS.
4. Set a strong, unique `SESSION_SECRET` in production — never reuse the
   `.env.example` placeholder.

## Extending

- **Payments**: hook a payment provider into `app/checkout/page.js` and
  `app/api/orders/route.js` (currently cash-on-delivery / manual
  confirmation style, matching common small-shop workflows in Vietnam).
- **Customer accounts**: none currently exist. Adding them would let you
  attach a price tier to an account instead of a client-side toggle.
- **Email/Zalo notifications on new orders**: add a call from inside the
  `createOrder` transaction in `app/api/orders/route.js`.
