## Salon & Spa Booking API

Production-ready NestJS backend for managing salon/spa appointments, services, staff, customers, and real-time availability.

### Tech Stack

- Node.js + NestJS (v11)
- PostgreSQL + TypeORM with repositories & soft deletes
- JWT authentication (access + refresh)
- Role-based access control (Customer, Staff, Admin)
- Swagger/OpenAPI, class-validator pipes, Helmet, ConfigModule

### Getting Started

```bash
cd salon-backend
npm install
cp env.example .env   # fill in secrets & database credentials
npm run start:dev
```

Run the seeder after the first migration to create an admin user and default services:

```bash
npm run seed
```

Swagger docs are available at `http://localhost:3000/docs` (auto-protected with bearer auth).

### Environment Variables

See `env.example` for required variables:

- `DB_*` for PostgreSQL connection
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and TTLs
- `BCRYPT_SALT_ROUNDS`

### Module Overview

- **Auth** – signup/login/refresh with bcrypt hashing + JWT + refresh token rotation.
- **Users/Customer** – profile management (`GET/PATCH /customer/me`) reusing the shared `UsersService`.
- **Services** – CRUD for salon services with admin-only create/update/delete and public listing.
- **Staff** – manages staff metadata, working hours, and many-to-many service capabilities.
- **Bookings** – enforces staff availability, salon hours, weekly off days, and holiday blackout dates.
- **Salon Config** – centralized configuration (`GET/PATCH /config`) for hours, weekly off days, and holidays.
- **Dashboard** – admin-only KPIs (`GET /admin/dashboard/overview`) for appointments, revenue, and staff utilization.

### Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Start the API |
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run seed` | Seed admin user and default services |
| `npm run lint` | ESLint + Prettier |
| `npm run test*` | Jest unit/e2e/coverage |

### Testing & Quality

- Global validation pipe with whitelist/transform
- Role guard + JWT guard for RBAC
- DTOs typed with `class-validator` + Swagger decorators
- Soft deletes on all mutable entities
- Helmet + CORS enabled

### Database Model Highlights

- `User` ↔ `Booking` (1:M)
- `Staff` ↔ `Service` (M:N) via `staff_services`
- `Booking` links `User`, `Staff`, and `Service`
- `SalonConfig` singleton row powering booking rules

### Seeding Defaults

The seed script creates:

- Admin user → `admin@salon.com` / `Admin@123`
- Classic salon services (haircut, massage, manicure)

Update passwords/secrets after provisioning in any production environment.
