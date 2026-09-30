# SecondChance

A JavaScript back-end capstone marketplace for community reuse. The Express service stores listings and accounts in MongoDB, supports listing CRUD, category filters, text search with `natural`, image uploads, registration/login/profile updates, and serves a small landing page.

## Run locally

Requires Node.js 18+ and MongoDB. Copy `.env.example` to `.env`, set a private `JWT_SECRET` and `MONGODB_URI`, then:

```sh
npm install
npm run seed
npm start
```

Or use Docker Compose: `docker compose up --build`. Open <http://localhost:3000>.

## API

- `GET /health`
- Items CRUD at `/api/secondchance/items` (also available at `/items`): list/filter with `?category=Home`, create with JSON or multipart form field `file`, details, `PATCH`, and `DELETE`.
- `GET /api/secondchance/search?q=desk%20lamp&category=Home` (also `/search`)
- Auth at `/api/secondchance/auth/register`, `/login`, and `/update` (also `/auth/...`). Registration accepts `{ "name", "email", "password" }`; login accepts `{ "email", "password" }`; update requires `Authorization: Bearer <token>` and profile fields.

Uploaded images must be JPEG, PNG, WebP, or GIF and are limited to 5 MB. The app stores the file under `uploads/` and returns its URL. Auth profile updates require a valid signed token. Configure a strong `JWT_SECRET` outside development.

## Quality checks

`npm test` exercises the health route, landing page, request validation, and seed data. Full database-backed route checks and the seed script require MongoDB; CI starts MongoDB and runs both. No external deployment or live database result is claimed in this repository.

## Evidence

`docs/evidence/` contains capture instructions from the supplied starter. These are prompts, not evidence. Add screenshots, API responses, deployment proof, or CI run evidence only after capturing them from the real service. No external output is fabricated.
