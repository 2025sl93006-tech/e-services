# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack MERN service marketplace where users browse, book, and review home/professional services (Civil, Electrical, Electronics, Carpentry, Sanitary, Hardware, Software, Interior Decorators). Two roles: `admin` and `enduser`.

- **Server**: Express + Mongoose, port `5001`
- **Client**: React 18 + Bootstrap 5, port `3001`
- **Database**: MongoDB, database name `kt_eservices` (local)

---

## Common Commands

### Server

```bash
cd "FSAD Project/e-services/server"
npm run dev        # start with nodemon (auto-reload)
npm start          # start without nodemon
npm run seed       # wipe + re-seed DB (3 users, 8 categories, 16 providers)
```

### Client

```bash
cd "FSAD Project/e-services/client"
npm start          # React dev server on port 3001 (PORT=3001 is baked into package.json scripts)
npm run build      # production build
```

### Swagger API Docs

Available at `http://localhost:5001/api-docs` when the server is running.  
Authorize via **POST /auth/login** → copy token → click **Authorize** button → paste token.

### Seed Credentials (after `npm run seed`)

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@eservices.com      | admin123  |
| User  | rahul@example.com        | user123   |
| User  | priya@example.com        | user123   |

---

## Architecture

### Server (`server/`)

MVC structure. All routes are mounted in `server.js` under `/api/*`.

```
config/         db.js (mongoose connect), nodemailer.js (Gmail transporter)
middleware/     authMiddleware.js, errorHandler.js
models/         User, Category, ServiceProvider, Order, Review
controllers/    one file per resource, imported by routes
routes/         JSDoc @swagger annotations live here (read by swagger.js)
services/       emailService.js — sendOrderConfirmation()
utils/          generateToken.js
swagger.js      OpenAPI 3.0 spec built with swagger-jsdoc, served at /api-docs
seedData.js     drops + re-creates all collections
```

**Auth flow**: `verifyToken` decodes JWT from `Authorization: Bearer <token>` header and sets `req.user = { id, role }`. `requireAdmin` checks `req.user.role === 'admin'`. Token payload only carries `id` and `role` — no DB lookup on every request.

**Soft deletes throughout**: records are never hard-deleted. Categories and Providers set `isActive: false`; Reviews set `isVisible: false`. Queries filter on these fields accordingly.

**Rating denormalization**: `averageRating` and `totalReviews` are stored directly on `ServiceProvider`. After every review create/update/delete, `Review.recomputeRating(providerId)` runs an aggregation and writes back to the provider — call this static method any time you touch a review.

**Order cost formula**: `estimatedCost = Math.max(chargePerHour × estimatedHours, minCharge)` — computed server-side in `orderController.create`, never trusted from the client.

**Order reference format**: `ES-<year>-<4-digit-random>`, generated in an `Order` pre-save hook.

**Email**: sent non-blocking after order creation via `.then().catch()` — a failed email never fails the order response.

### Client (`client/src/`)

```
api/            one file per resource (authApi, categoryApi, serviceApi, orderApi, reviewApi)
                all import axiosInstance.js which auto-attaches Bearer token and handles 401 → logout
context/        AuthContext.jsx — user/token/loading state; login(), logout(), isAdmin()
components/
  common/       PrivateRoute, AdminRoute, StarRating
  layout/       Navbar, Footer
pages/          one file per page/view
App.jsx         BrowserRouter + all Routes, wraps AuthProvider + ToastContainer
```

**Route guards**: `PrivateRoute` redirects unauthenticated users to `/login`. `AdminRoute` redirects non-admins to `/`.

**StarRating** accepts `interactive` prop for input mode (review forms) and display mode for listings. Pass `totalReviews` to show count.

**Axios interceptor** handles 401 globally: clears `localStorage` and redirects to `/login` — no per-component 401 handling needed.

---

## Key Constraints

- The `Review` compound index `{ user: 1, provider: 1 }` enforces one review per user per provider at the DB level. The controller also does an explicit `findOne` check before insert to return a clean 400.
- Provider routes register `/category/:categoryId` **before** `/:id` — preserve this ordering or Express will swallow the static segment.
- Order routes register `/my` **before** `/:id` for the same reason.
- Review routes register `/my` and `/provider/:providerId` **before** `/:id`.
- The client `package.json` has `"proxy": "http://localhost:5001"` but `axiosInstance` uses the absolute `http://localhost:5001/api` baseURL — do not rely on the proxy.
- To add a new endpoint to Swagger: add a `@swagger` JSDoc block in the relevant `routes/*.js` file. The spec is auto-built by `swagger-jsdoc` from those annotations; no changes to `swagger.js` are needed for new routes.
