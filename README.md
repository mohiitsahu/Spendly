# 💸 Spendly

A full-stack personal finance tracker. Log income and expenses, set monthly budgets per category, follow savings goals, and see a live spending summary. Built with a **Spring Boot** backend and a **Next.js** frontend, with a focus on clean system design: per-user data isolation, a tenant-ready schema, and passwordless authentication.

## 🔗 Live Demo

- **App:** [spendly-lime-one.vercel.app](https://spendly-lime-one.vercel.app)

> **Trying the demo:** use **Google Sign-In**, which works for everyone. Email OTP login works in code and is fully testable locally, but the deployed app uses Resend's free-tier sandbox sender, which only delivers to the account owner's email until a custom domain is verified. This is an email deliverability limit, not an application bug.
>
> The backend runs on Render's free tier, so the first request after inactivity may take a minute to respond.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Migrations](#-database-migrations)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## ✨ Features

- 🔐 **Passwordless authentication**
  - Email OTP: a 6-digit code valid for 5 minutes, limited to 5 verification attempts, and stored only as a bcrypt hash
  - Google Sign-In: the Google ID token is verified server-side
  - Both methods resolve to the **same account by email**, so one email never ends up with two accounts
- 🏷️ **Categories:** custom income and expense categories with icons
- 💰 **Transactions:** full CRUD, paginated, each linked to a category (default currency INR)
- 📊 **Budgets:** monthly spending limits per category
- 🎯 **Goals:** savings targets with a deadline and progress tracking
- 📈 **Dashboard:** server-computed monthly income, expenses, and net savings, plus a per-category spend vs. budget breakdown
- 📱 **Responsive UI:** animated landing page, collapsible mobile menu, and toast notifications

---

## 🛠 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Java 17, Spring Boot, Spring Security, Spring Data JPA, Hibernate, Bean Validation, Lombok |
| **Database** | PostgreSQL 16, Flyway (versioned migrations) |
| **Auth** | JWT (jjwt), Google API Client (ID token verification), bcrypt-hashed OTPs, Resend (OTP emails) |
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS 4, React Compiler, Motion, Lucide React |
| **Infra** | Docker, Docker Compose (local Postgres), Gradle, Vercel (frontend), Render (backend) |

---

## 🏗 Architecture

- **Tenant-ready from day one.** Every table carries a `tenant_id`. The app runs single-tenant today using one fixed ID from config, so supporting shared workspaces later (for example household budgets) is an auth and query-scoping change rather than a schema rewrite.
- **Per-user data isolation.** Queries are scoped by both `tenant_id` and `user_id`, so one user can never read another user's categories, transactions, budgets, or goals.
- **Request-scoped tenant context.** A `TenantResolvingFilter` sets a `ThreadLocal`-backed `TenantContext` for each request and clears it afterwards, making the current tenant available anywhere in the call stack without passing it around.
- **Clean layering.** Controller → Service → Repository, with DTOs as the boundary between stored data and what the API exposes.
- **Stateless JWT auth.** No server-side sessions. Access tokens are short-lived (15 minutes) and sent as a `Bearer` token.
- **Centralised error handling.** A global exception handler returns a consistent error shape, including field-level validation errors the frontend can display.
- **Schema validated, not generated.** Hibernate runs in `validate` mode while Flyway owns all schema changes.

---

## 📁 Project Structure

```
Spendly/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/spendly/backend/
│   │   ├── config/                   # Security, JPA auditing
│   │   ├── controller/               # Auth, Category, Transaction, Budget, Goal, Analytics
│   │   ├── dto/                      # Request / response objects per domain
│   │   ├── entity/                   # JPA entities (tenant-scoped base class)
│   │   ├── exception/                # Global exception handling
│   │   ├── repository/               # Spring Data repositories
│   │   ├── security/                 # JWT, Google verifier, OTP email sender
│   │   ├── service/                  # Business logic
│   │   └── tenant/                   # TenantContext + resolving filter
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/             # Flyway migrations (V1–V4)
│   ├── Dockerfile
│   └── docker-compose.yml            # Local PostgreSQL
│
└── frontend/                         # Next.js app
    └── src/
        ├── app/
        │   ├── (auth)/               # Login, register
        │   ├── (dashboard)/          # Dashboard, categories, transactions, budgets, goals
        │   └── page.tsx              # Landing page
        ├── components/               # Google sign-in button
        ├── lib/                      # API client, auth context, per-domain API helpers, toasts
        └── types/                    # Shared TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17
- Node.js 18+
- Docker (for local PostgreSQL)
- A [Google OAuth client ID](https://console.cloud.google.com/apis/credentials) for Google Sign-In
- *(Optional)* A [Resend](https://resend.com) API key to send real OTP emails

### 1. Clone the repository

```bash
git clone https://github.com/mohiitsahu/Spendly.git
cd Spendly
```

### 2. Start the database

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL 16 on port `5432` with a `spendly` database. The default credentials in `application.yml` match the compose file for local development.

### 3. Run the backend

```bash
# still inside backend/
./gradlew bootRun
```

The API runs on **http://localhost:8080**. Flyway applies all migrations automatically on startup.

### 4. Run the frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Then start the dev server:

```bash
npm run dev
```

The app runs on **http://localhost:3000**.

---

## 🔑 Environment Variables

### Backend

Every value has a development default in `application.yml`. Override these in production:

| Variable | Description | Default |
| --- | --- | --- |
| `SPENDLY_DB_URL` | JDBC connection URL | `jdbc:postgresql://localhost:5432/spendly` |
| `SPENDLY_DB_USERNAME` | Database user | `spendly` |
| `SPENDLY_DB_PASSWORD` | Database password | local dev password |
| `SPENDLY_JWT_SECRET` | JWT signing secret (32+ bytes) | dev-only placeholder, **change in production** |
| `SPENDLY_GOOGLE_CLIENT_ID` | Google OAuth client ID | `changeme...` |
| `SPENDLY_RESEND_API_KEY` | Resend API key for OTP emails | `changeme` |
| `SPENDLY_RESEND_FROM` | Sender address for OTP emails | `onboarding@resend.dev` |
| `SPENDLY_CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `PORT` | Server port | `8080` |

### Frontend

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (same one the backend verifies against) |

---

## 📡 API Reference

All routes except `/api/auth/**` require an `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/otp/request` | Send a one-time code to an email address |
| POST | `/api/auth/otp/verify` | Verify the code and receive a JWT |
| POST | `/api/auth/google` | Sign in with a Google ID token |

### Resources

Categories, transactions, budgets, and goals share the same CRUD shape:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/{resource}` | List the current user's items |
| POST | `/api/{resource}` | Create an item |
| PUT | `/api/{resource}/{id}` | Update an item |
| DELETE | `/api/{resource}/{id}` | Delete an item |

`{resource}` is one of `categories`, `transactions`, `budgets`, or `goals`. The transactions list is paginated (default page size 20).

### Analytics
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/analytics/dashboard` | Monthly income, expenses, net savings, and per-category spend vs. budget |

---

## 🗄 Database Migrations

Schema changes are versioned with Flyway:

| Version | Change |
| --- | --- |
| `V1` | Initial schema: users, categories, transactions, budgets, goals (all with `tenant_id`) |
| `V2` | Added `user_id` ownership to categories, budgets, and goals for per-user privacy |
| `V3` | Made category uniqueness per user, so different users can both have a "Food" category |
| `V4` | Moved to passwordless auth: dropped password hashes, added the OTP challenge table |

---

## 🗺 Roadmap

- [ ] Recurring transactions
- [ ] Charts and spending trends over time
- [ ] CSV export / import
- [ ] Shared household budgets (multi-tenant mode)
- [ ] Custom email domain for OTP delivery
- [ ] Automated test coverage for services and controllers

---

## 👨‍💻 Author

**Mohit Sahu**

- GitHub: [@mohiitsahu](https://github.com/mohiitsahu)
- LinkedIn: [mohitsahu7](https://www.linkedin.com/in/mohitsahu7/)

---

<p align="center">
  If you found this project useful, consider giving it a ⭐
</p>
