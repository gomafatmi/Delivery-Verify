# PROJECT_MAP — Delivery Verify (Amazon Handover Proof)

## [TECH_STACK]

| Layer        | Technology         | Version  | Status |
|-------------|-------------------|----------|--------|
| Framework   | Next.js            | 16.2.6   | ✅ Installed |
| UI Engine   | React              | 19.2.6   | ✅ Installed |
| Language    | TypeScript         | 6.0.3    | ✅ Installed |
| Styling     | Tailwind CSS       | 4.3.0    | ✅ Installed |
| Components  | shadcn/ui          | 0.9.5    | ✅ CLI available |
| State Mgmt  | Zustand            | 5.0.13   | ✅ Installed |
| DB Client   | postgres.js        | 3.4.9    | ✅ Installed |
| Auth        | next-auth          | 5.0.0-beta.31 | ✅ Credentials provider (JWT) |
| Testing     | Vitest             | 4.1.6    | ✅ Installed |
| Storage     | local filesystem   | —        | ⚠️ Replace with S3 in prod |

**Peer Deps Confirmed:**
- React 19.2.6 ← Next.js 16.2.6 [compatible ^18.2.0 || ^19.0.0]
- next-auth v5 beta.31 compatible with Next.js 16 (App Router)
- Tailwind 4 → uses `@tailwindcss/postcss` (no tailwind.config.js needed)

---

## [SYSTEM_FLOW] — Multi-Factor Delivery Verification

### Problem Chain (Current)
```
Amazon sends OTP → Delivery person calls customer → Customer reads OTP over phone
→ Delivery person enters OTP → Leaves package at door → Package stolen / item missing
→ Customer claims → Amazon refuses: "OTP given = delivered"
→ ❌ Who defrauded? No evidence.
```

### Solution Flow (Proposed)
```
Amazon assigns delivery (valuable item)
    │
    ▼
Delivery person arrives at address  ─── GPS-locked ───┐
    │                                                   │
    ▼                                                   │
Customer presence check (geofence 50m radius)  ◄───────┘
    │
    ├── ❌ Customer not within radius → FAIL → Return to depot
    │
    └── ✅ Customer confirmed present
              │
              ▼
    Live photo capture (both parties + package visible)
    GPS-tagged + timestamped
              │
              ▼
    Customer enters OTP on THEIR OWN device
    (not verbally relayed)
              │
              ▼
    Mutual digital confirmation:
    • Customer: "I received the package intact"
    • Delivery: "I handed package to customer"
              │
              ▼
    ✅ Immutable record in PostgreSQL
    All evidence stored with SHA-256 hash
```

### User Roles
| Role             | Permissions                                      |
|-----------------|--------------------------------------------------|
| amazon_admin    | Configure rules, audit all records, resolve disputes |
| delivery_person | Initiate verification, capture GPS + photos      |
| customer        | Confirm presence, take selfie, enter OTP, sign   |

### Verifiable Goals (Milestones)
| # | Goal | Verification | Status |
|---|------|-------------|--------|
| M1 | Create delivery + verification session | POST `/api/deliveries/:id/verify` → 201 + sessionId | ✅ Implemented |
| M2 | GPS proximity check rejects >50m | `gps_check` event=failed when GPS >50m | ✅ Implemented |
| M3 | Photo upload with SHA-256 hash | `evidence` record stored in DB | ✅ Implemented |
| M4 | OTP verified on customer device | `otp_entry` success/fail event | ✅ Implemented |
| M5 | Digital signatures from both parties | `signature_customer` + `signature_delivery` events | ✅ Implemented |
| M6 | Full audit trail viewable | `/verifications/:id` shows timeline + evidence | ✅ Implemented |
| M7 | Amazon API adapter | POST `/api/amazon/webhook` accepts 3 event types | ✅ Implemented |
| M8 | Auth (credentials) | Login/register with bcrypt + JWT session | ✅ Implemented |
| M9 | Tests pass | `vitest run` → 9/9 tests pass | ✅ Implemented |

---

## [ARCHITECTURE]

### Directory Tree
```
delivery-verify/
├── app/                                     # Next.js App Router
│   ├── (auth)/                              # Auth group
│   │   ├── login/page.tsx                   # Login form (client)
│   │   ├── register/page.tsx                # Registration form (client)
│   │   └── layout.tsx
│   ├── (dashboard)/                         # Authenticated routes
│   │   ├── layout.tsx                       # Nav + session guard
│   │   ├── deliveries/
│   │   │   ├── page.tsx                     # List (server, SQL)
│   │   │   ├── new/page.tsx                 # Create delivery (client)
│   │   │   └── [id]/
│   │   │       ├── page.tsx                 # Delivery detail (server)
│   │   │       └── verify/page.tsx          # 4-step wizard (client)
│   │   ├── verifications/
│   │   │   ├── page.tsx                     # Session list (server)
│   │   │   └── [id]/page.tsx                # Event timeline (server)
│   │   └── disputes/
│   │       ├── page.tsx                     # Dispute list (server)
│   │       └── [id]/page.tsx                # Resolution view (server)
│   └── api/                                 # Route handlers
│       ├── auth/
│       │   ├── [...nextauth]/route.ts       # next-auth handler
│       │   └── register/route.ts            # User registration
│       ├── deliveries/
│       │   ├── route.ts                     # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts                 # GET delivery detail
│       │       ├── verify/route.ts          # Start session
│       │       ├── verify/location/route.ts # GPS check
│       │       ├── verify/photo/route.ts    # Photo upload
│       │       ├── verify/confirm/route.ts  # OTP + signature
│       │       └── dispute/route.ts         # Open dispute
│       ├── verifications/
│       │   └── [id]/
│       │       ├── route.ts                 # Session detail
│       │       └── evidence/route.ts        # File serving
│       └── amazon/webhook/route.ts          # Amazon event handler
│
├── components/
│   ├── session-provider.tsx                 # next-auth SessionProvider wrapper
│   └── features/ (inlined in pages)
│
├── lib/
│   ├── auth.ts                     # NextAuth config (credentials + JWT)
│   ├── db.ts                       # postgres.js client
│   ├── verification.ts             # Core verification helpers
│   ├── gps.ts                      # Haversine distance
│   ├── photo.ts                    # Photo save + SHA-256
│   ├── audit.ts                    # Async queue logger
│   └── amazon.ts                   # Amazon API adapter
│
├── store/
│   ├── delivery-store.ts
│   └── verification-store.ts
│
├── types/
│   ├── delivery.ts
│   ├── verification.ts
│   ├── user.ts
│   └── next-auth.d.ts
│
├── migrations/001_initial.sql      # Full DB schema
├── __tests__/ (in lib/ and app/api/)
└── PROJECT_MAP.md

### Key Architectural Decisions
1. **App Router everywhere** — No Pages Router, use Server Components by default, Client Components only when interactivity needed
2. **Server Actions for mutations** — Not REST for simple CRUD; REST only for file uploads (photo evidence)
3. **Zustand over Context** — Minimal re-renders, simpler API, works outside React tree
4. **postgres.js over Prisma** — Zero deps, 10x smaller, raw SQL for audit integrity
5. **No micro-files** — Each domain directory has 3-5 files max; component per concern
6. **Core verification logic is pure functions** — `lib/verification.ts` has zero I/O, receives dependencies injected

### Core Verification Engine (`lib/verification.ts`)
```
executeVerification(deliveryId, deps: { db, gps, photo, audit })
  → Creates session
  → Runs steps sequentially (each step is a pure function)
  → On step FAIL → session status=failed, delivery returns to depot
  → On ALL steps PASS → session status=passed, delivery=completed
  → Returns full VerificationRecord with all events
```

### Database Entity Relationship
```
users ──1:N──> deliveries (as customer)
users ──1:N──> deliveries (as delivery_person)
deliveries ──1:N──> verification_sessions
verification_sessions ──1:N──> verification_events
verification_events ──1:N──> evidence
```

---

## [SAFE_LOGGING]

**Strategy:** Async, non-blocking, structured JSON.

| Level | When |
|-------|------|
| ERROR | Verification failure, DB error, file write failure |
| WARN  | Suspicious activity (GPS mismatch, retry attempts) |
| INFO  | Session created, step passed, delivery completed |
| DEBUG | GPS coordinates, photo metadata (dev only) |

**Implementation:**
- `lib/audit.ts` — queue-based async writer to `audit_logs` table
- No `console.log` in production paths
- Never blocks verification flow for logging
- `audit_logs` table: `{id, level, action, actor_id, delivery_id, metadata JSONB, created_at}`

---

## [ORPHANS & PENDING]

| Item | Status | Action Required |
|------|--------|-----------------|
| Amazon API spec | ❓ Unknown | Need actual Amazon delivery API integration docs |
| SMS / Push notifications | 🟡 Deferred | Third-party service (Twilio/Firebase) — not in MVP |
| Photo storage (prod) | 🟡 PENDING | Replace local FS with S3/R2 for production |
| Camera API (mobile) | 🟡 Deferred | PWA works on mobile browser; native wrapper if needed later |
| PostgreSQL setup | 🟡 PENDING | Run `migrations/001_initial.sql` on a live PG instance |
| CI/CD pipeline | 🟡 PENDING | GitHub Actions + Vercel deploy |
| E2E tests | 🟡 PENDING | Playwright for browser-level verification flow tests |
| Seed script | 🟡 PENDING | Script to create test users + deliveries |
