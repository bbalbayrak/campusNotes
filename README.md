# CampusNotes

A full-featured backend API for a university note-sharing marketplace where students upload, purchase, and download academic notes. Built with NestJS, PostgreSQL, Redis, and AWS S3 — containerized with Docker for production deployment.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [API Modules & Endpoints](#api-modules--endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [File Upload & Storage](#file-upload--storage)
- [Caching & Background Jobs](#caching--background-jobs)
- [Subscription & Monetization System](#subscription--monetization-system)
- [GPA & Grading Calculator](#gpa--grading-calculator)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Scripts](#scripts)
- [Testing](#testing)

---

## Project Overview

CampusNotes is a note-sharing platform designed for university students. It provides a marketplace where:

- **Students** can upload lecture notes (PDF, images) and earn money when others purchase them.
- **Buyers** can browse, preview, bookmark, and download notes organized by university, department, and lecture.
- **Admins** can review and approve/reject uploaded notes, manage users, process payouts, and monitor platform health.
- **Discussion boards** allow students to ask questions and engage within their department communities.
- A **GPA calculator** helps students calculate final exam targets using both absolute and bell-curve grading systems.

The platform implements a tiered subscription model (Free / Pro / Legend) with In-App Purchase (IAP) support for both Apple App Store and Google Play Store.

---

## Tech Stack

| Layer                | Technology                                                           |
| -------------------- | -------------------------------------------------------------------- |
| **Framework**        | [NestJS](https://nestjs.com/) 10 (TypeScript)                        |
| **Runtime**          | Node.js 20                                                           |
| **Database**         | PostgreSQL 16                                                        |
| **ORM**              | [Sequelize](https://sequelize.org/) 6 + sequelize-typescript         |
| **Caching**          | [Redis](https://redis.io/) 7 (via ioredis)                           |
| **Job Queue**        | [BullMQ](https://docs.bullmq.io/) (backed by Redis)                  |
| **Authentication**   | JWT (access + refresh tokens) + Passport.js (Local & JWT strategies) |
| **File Storage**     | AWS S3 (with presigned URLs for secure access)                       |
| **PDF Processing**   | pdf2pic + sharp (preview image generation)                           |
| **Rate Limiting**    | @nestjs/throttler                                                    |
| **Scheduling**       | @nestjs/schedule (cron jobs)                                         |
| **Validation**       | class-validator + class-transformer                                  |
| **IAP Verification** | Google Auth Library + @googleapis/androidpublisher                   |
| **Containerization** | Docker (multi-stage build) + Docker Compose                          |
| **Testing**          | Jest + Supertest                                                     |
| **Linting**          | ESLint + Prettier                                                    |

---

## Architecture

```
Client (Mobile App / Web)
         |
         v
  +--------------+
  |   NestJS API  |  <-- JWT Auth, Rate Limiting, Validation
  +--------------+
   |     |      |
   v     v      v
 Postgres  Redis   AWS S3
 (data)   (cache   (file
           + jobs)  storage)
```

The application follows a **modular monolith** architecture with NestJS modules. Each feature domain is encapsulated in its own module with its own entity, service, controller, DTO, and provider.

**Key architectural patterns:**

- **Repository pattern** via Sequelize providers (injected with `@Inject` tokens)
- **Guard-based authorization** (JWT guard + Roles guard)
- **Background job processing** via BullMQ workers (view/download count increments)
- **Redis caching** for feed pagination, signed URL caching, and deduplication of view/download counts
- **Presigned URL access** to S3 files with plan-based expiration durations
- **Global validation pipe** with whitelist + forbidNonWhitelisted for strict input validation
- **Global rate limiting** (10 requests per 60 seconds default, with per-route overrides)

---

## Folder Structure

```
campus-notes/
├── src/
│   ├── main.ts                          # Application bootstrap
│   ├── app.module.ts                    # Root module (imports all feature modules)
│   ├── app.controller.ts               # Health check / root endpoint
│   ├── app.service.ts                  # Root service
│   │
│   ├── config/
│   │   ├── aws/
│   │   │   ├── aws.module.ts            # AWS module export
│   │   │   ├── aws-s3.service.ts        # S3 upload, presigned URL, preview upload
│   │   │   └── multer-options.ts        # File filter (PDF/images) + 5MB size limit
│   │   ├── constants/
│   │   │   └── index.ts                 # Repository injection tokens
│   │   ├── database/
│   │   │   ├── database.config.ts       # Sequelize config (dev/test/prod)
│   │   │   ├── database.module.ts       # Database module
│   │   │   └── interface/
│   │   │       └── dbConfig.interface.ts
│   │   └── redis/
│   │       ├── redis.module.ts          # Redis module
│   │       ├── redis.service.ts         # Redis client wrapper
│   │       └── note-reviews.ts          # BullMQ worker (view/download count)
│   │
│   ├── decorators/
│   │   ├── roles.decorators.ts          # @Roles() decorator
│   │   └── roles.guard.ts              # Role-based access control guard
│   │
│   ├── types/
│   │   └── pdf2pic.d.ts                # Type declarations for pdf2pic
│   │
│   └── modules/
│       ├── auth/                        # Authentication (login, register, JWT, sessions)
│       ├── users/                       # User management (CRUD, trust score, wallet)
│       ├── universities/                # University registry
│       ├── departments/                 # Department management (under universities)
│       ├── lectures/                    # Lecture management (under departments)
│       ├── notes/                       # Note CRUD, upload, feed, admin approval
│       ├── preview/                     # PDF-to-image preview generation
│       ├── bookmarks/                   # Note bookmarking
│       ├── comments/                    # Note comments
│       ├── discussion/                  # Department discussion boards + likes
│       ├── follows_users/               # User-to-user following
│       ├── follows_departments/         # User-to-department following
│       ├── follows_lectures/            # User-to-lecture following
│       ├── note_purchases/              # Note purchase records
│       ├── download_permissions/        # Download access control (free/purchase/subscription)
│       ├── downloads/                   # Download history tracking
│       ├── subscriptions/               # Subscription plan definitions (Free/Pro/Legend)
│       ├── user_subscriptions/          # User subscription records + IAP verification
│       ├── earnings/                    # Author earnings tracking + payout processing
│       ├── withdrawals/                 # Withdrawal requests + admin approval
│       ├── events/                      # University/department events
│       ├── reports/                     # Content reporting system
│       ├── audit_logs/                  # Activity audit logging
│       ├── uni-grading-system/          # GPA calculator + final exam target calculator
│       └── grading-terms/               # Grading term management
│
├── test/
│   ├── app.e2e-spec.ts                 # E2E test
│   └── jest-e2e.json                   # E2E Jest config
│
├── Dockerfile                           # Multi-stage production build
├── Dockerfile.dev                       # Development Dockerfile
├── docker-compose.yml                   # Production compose (app + postgres + redis)
├── docker-compose.dev.yml               # Development compose
├── nest-cli.json                        # NestJS CLI configuration
├── tsconfig.json                        # TypeScript configuration
├── tsconfig.build.json                  # Build-specific TS config
├── .eslintrc.js                         # ESLint configuration
├── .prettierrc                          # Prettier configuration
└── package.json                         # Dependencies and scripts
```

### Entity Relationship Diagram

```
University  1───*  Department  1───*  Lecture
                       |                  |
                       |                  |
                *──────┘                  └──────*
            Discussion                       Note
                |                          /  |  \
                |                         /   |   \
          DiscussionLike           Purchase Download Bookmark
                                      |
                                   Earnings
                                      |
                                  Withdrawal

User ──── Session
  |  \
  |   └── FollowsUsers / FollowsDepartments / FollowLecture
  |
  └── Subscription ──── UserSubscription
```

## Authentication & Authorization

### JWT Strategy

- **Access tokens** are short-lived (configurable via `JWT_EXPIRESIN`, default 24 hours)
- **Refresh tokens** are stored as httpOnly secure cookies with 7-day expiry
- Refresh tokens are tracked in the `Session` table with user agent and IP address
- On logout, all sessions for the user are revoked

### Guards

- **JwtAuthGuard** — Validates the JWT access token from the `Authorization: Bearer <token>` header
- **LocalAuthGuard** — Validates email/password on the login endpoint
- **RolesGuard** — Checks the user's role against the `@Roles()` decorator metadata
- **ThrottlerGuard** — Applied globally with per-route overrides

### User Roles

| Role        | Permissions                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `student`   | Upload notes, browse, purchase, download, follow, discuss                   |
| `professor` | Same as student (future differentiation planned)                            |
| `moderator` | Content moderation capabilities                                             |
| `admin`     | Full platform control (approve/reject notes, manage users, process payouts) |

---

## File Upload & Storage

1. **Upload flow**: Files are uploaded via multipart form data through the `/notes/create` endpoint
2. **Validation**: Only PDF, JPEG, PNG, and WebP files are accepted (max 5MB)
3. **S3 storage**: Files are uploaded to AWS S3 with a UUID-prefixed key under the `notes/` prefix
4. **Preview generation**: For PDF files, the first page is rendered to a PNG image using `pdf2pic`, optimized with `sharp` (resized to 800px width), and uploaded to S3 under the `previews/` prefix
5. **Secure access**: Files are never publicly accessible. Presigned URLs are generated on-demand with plan-based expiration durations:
   - **Free**: Short expiration
   - **Pro**: Medium expiration
   - **Legend**: Long expiration
6. **Caching**: Signed URLs are cached in Redis to avoid regeneration within the validity window

---

## Caching & Background Jobs

### Redis Caching

- **Notes feed** (`notes:feed:*`): Paginated feed responses cached for 60 seconds
- **View deduplication** (`view:note:{id}:user:{id}`): Prevents duplicate view counts (24-hour TTL)
- **Download deduplication** (`download:note:{id}:user:{id}`): Prevents duplicate download counts (24-hour TTL)
- **Signed URL cache** (`signed:note:{id}:user:{id}` and `signedurl:note:{id}:user:{id}`): Caches presigned URLs to avoid repeated S3 calls
- Cache invalidation triggers on note create, update, delete, approve, reject, and unpublish

### BullMQ Background Jobs

The `note-reviews` queue handles asynchronous counter increments:

- `increment-view`: Atomically increments `view_count` on the Note entity
- `increment-download`: Atomically increments `download_count` on the Note entity

This ensures that view/download count updates don't block the request response cycle.

---

## Subscription & Monetization System

### Subscription Tiers

| Tier       | Price   | Revenue Share (Uploader / Platform) |
| ---------- | ------- | ----------------------------------- |
| **Free**   | 0 TRY   | 60% / 40%                           |
| **Pro**    | 149 TRY | 85% / 15%                           |
| **Legend** | 499 TRY | 95% / 5%                            |

### Purchase Flow

1. Buyer initiates a purchase (via IAP on mobile or direct)
2. A `NotePurchase` record is created with the buyer's plan type at time of purchase
3. Revenue is split according to the buyer's subscription tier
4. An `Earnings` record is created for the note author
5. A `DownloadPermission` is granted to the buyer

### Withdrawal Flow

1. Author requests withdrawal (minimum 50 TRY)
2. Only one pending withdrawal allowed per user at a time
3. The withdrawal amount is locked (deducted from `pending_earnings`)
4. Admin reviews and approves (marks earnings as WITHDRAWN, records transaction reference) or rejects (refunds the locked amount back to `pending_earnings`)
5. User can also cancel their own pending withdrawal

### IAP Support

- **Apple App Store**: Receipt verification via shared secret
- **Google Play Store**: Verification via Google service account + `@googleapis/androidpublisher`
- Subscription records track `iap_transaction_id`, `original_transaction_id`, and `receipt_data`

---

## GPA & Grading Calculator

The grading module provides two calculation systems:

### Quick GPA Calculator

Accepts a list of courses with credits and grade points, returns the weighted GPA.

### Final Exam Target Calculator

Given a midterm score, weights, and optional bell-curve parameters, calculates the minimum final exam score needed for each letter grade (AA through DD).

**Absolute system**: Uses score thresholds (default: AA=90, BA=80, BB=70, CC=50, DD=40)

**Bell curve system**: Uses T-score conversion with class average and standard deviation to calculate needed raw scores, then converts to final exam requirements.

Both systems support:

- Custom thresholds
- Final pass limit enforcement
- Status indication (reachable vs. impossible)
