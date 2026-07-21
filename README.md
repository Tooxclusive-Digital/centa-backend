# CentaHR — Backend API

The server-side engine for CentaHR, a multi-tenant HR management platform built for African businesses. Handles payroll processing, tax compliance, workforce management, recruitment, performance appraisals, and real-time employee engagement — all through a single REST API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Fastify adapter) |
| Language | TypeScript |
| Database | PostgreSQL via Drizzle ORM |
| Cache | Redis (Keyv) |
| Queue | BullMQ + RabbitMQ |
| Auth | JWT + Passport (local, Google OAuth, 2FA) |
| Storage | AWS S3 |
| Email | SendGrid + Handlebars templates |
| Push Notifications | Expo SDK + Pusher |
| PDF Generation | Puppeteer + PDFKit |
| Logging | Pino + Logtail (Better Stack) |
| Deployment | Railway |

---

## Modules

### Core HR
- **Employees** — full employee lifecycle, role management, bulk import, org chart
- **Departments** — department hierarchy, manager assignment
- **Announcements** — company-wide announcements with email delivery
- **Audit** — immutable audit log for all sensitive operations
- **Assets** — company asset tracking and assignment

### Payroll & Finance
- **Payroll** — multi-run payroll engine with off-cycle support, pay groups, pay adjustments, payslip generation, payment status tracking
- **Tax** — Nigerian tax compliance (PAYE, pension, NHF), configurable tax bands, tax filing
- **Benefits** — employee benefit plans linked to pay groups
- **Expenses** — expense submission and approval workflow

### Time & Attendance
- **Clock In/Out** — GPS-aware clock-in/out with timezone handling
- **Shifts** — shift scheduling and assignment
- **Reports** — daily, weekly, and monthly attendance reports with CSV export

### Leave Management
- **Leave Requests** — multi-type leave requests with approval flow
- **Holidays** — company and public holiday calendar

### Recruitment
- **Recruitment** — job postings, applicant pipeline, offer letter generation with PDF, offer status tracking

### Performance
- **Appraisals** — self-appraisal, manager review, scoring engine, review cycles
- **Goals** — goal creation, assignment, approval logic, cycle cron jobs
- **Assessments** — 360-degree feedback and peer review

### Employee Self-Service (ESS)
- **ESS Home** — personalised employee dashboard (V2)
- **Onboarding / Offboarding** — checklist-driven lifecycle flows

### Integrations
- **Google Calendar / Meet** — meeting scheduling
- **Google OAuth** — SSO login
- **OpenAI** — AI assistant integration
- **Expo** — mobile push notifications

### Infrastructure
- **Auth** — JWT refresh rotation, 2FA (72h sessions), role-based guards, permission scoping
- **Cache** — Redis-backed multi-layer caching with PgBouncer-compatible Drizzle config
- **Notifications** — email, in-app, and mobile push notification service
- **Billing** — subscription and trial period management
- **Checklist** — configurable onboarding checklist engine

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- AWS S3 bucket
- SendGrid API key

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file at the root. Key variables:

```env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
SENDGRID_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Running the Server

```bash
# development
npm run start:dev

# production
npm run start:prod
```

### Database

```bash
# generate migrations
npm run db:generate

# run migrations
npm run db:migrate
```

---

## Architecture

```
src/
├── modules/
│   ├── auth/           # JWT, OAuth, 2FA, guards
│   ├── core/           # employees, departments, company settings
│   ├── payroll/        # payroll engine, tax, benefits
│   ├── time/           # attendance, shifts, reports
│   ├── leave/          # leave requests, holidays
│   ├── recruitment/    # jobs, applicants, offers
│   ├── performance/    # appraisals, goals, assessments
│   ├── lifecycle/      # onboarding, offboarding
│   ├── notification/   # email, push, in-app
│   ├── integrations/   # Google, OpenAI, Expo
│   ├── assets/         # asset management
│   ├── expenses/       # expense management
│   ├── audit/          # audit logging
│   └── announcement/   # company announcements
└── common/             # guards, decorators, interceptors, pipes
```

Multi-tenancy is enforced at the database level — every table is scoped by `company_id`. Role-based access control is implemented via a metadata-driven `PermissionsGuard` that gates routes by plan tier and user role.

---

## License

Private — All rights reserved. CentaHR © 2024.
