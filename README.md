# Delivery Verify

**Multi-factor delivery handover proof system** with AI vision privacy control (GDPR).

Prevent delivery fraud with GPS-locked photo evidence, OTP verification, digital signatures, and automated AI vision checks — all cryptographically hashed (SHA-256) and stored in an immutable audit trail.

---

## Features

- **4‑factor verification** — GPS proximity (50m) + live photo capture + OTP on customer device + dual digital signature
- **AI vision** — Automatic photo analysis checks for identifiable faces (GDPR), package presence, and image authenticity
- **Privacy by design** — Faces blurred before storage, minimal data collection, full audit traceability
- **Immutable evidence** — Every file SHA‑256 hashed, events timestamped, audit trail never altered
- **Bilingual demo** — Presentation UI in French and English, ready for stakeholder review
- **Pluggable AI providers** — Mock (default for POC), Google Cloud Vision, AWS Rekognition

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | React 19 + [Tailwind CSS 4](https://tailwindcss.com/) |
| Language | TypeScript 6 |
| Database | PostgreSQL + [postgres.js](https://github.com/porsager/postgres) |
| Auth | next-auth (Credentials provider, JWT) |
| State | Zustand |
| AI Vision | Pluggable (mock / Google Vision / AWS Rekognition) |
| Tests | Vitest |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (running on localhost:5433 or configure via `.env`)

### Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_ORG/delivery-verify.git
cd delivery-verify

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.local .env
# Edit .env with your credentials

# 4. Initialize database
psql -U postgres -h localhost -p 5433 -d delivery_verify -f migrations/001_initial.sql

# 5. Run tests
npm test

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — register a user and start verifying deliveries.

### Demo Presentation

Open [http://localhost:3000/demo](http://localhost:3000/demo) for the full system design walkthrough (bilingual FR/EN).

## Project Structure

```
delivery-verify/
├── app/
│   ├── (auth)/                 # Login / register
│   ├── (dashboard)/            # Deliveries, verifications, disputes
│   ├── api/                    # REST route handlers
│   └── demo/                   # Bilingual system design presentation
├── lib/
│   ├── verification.ts         # Core verification engine (pure functions)
│   ├── ai-vision.ts            # AI vision analysis (pluggable providers)
│   ├── face-blur.ts            # Face pixelation / blurring
│   ├── photo.ts                # Photo save + SHA-256 hashing
│   ├── gps.ts                  # Haversine distance calculation
│   ├── audit.ts                # Async audit trail logger
│   ├── auth.ts                 # NextAuth configuration
│   ├── amazon.ts               # Amazon API adapter
│   ├── db.ts                   # PostgreSQL client
│   └── demo-i18n.ts            # Bilingual (FR/EN) translation strings
├── migrations/                 # SQL schema
├── types/                      # TypeScript type definitions
└── store/                      # Zustand stores
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Account creation |
| POST | `/api/auth/signin` | JWT login |
| GET | `/api/deliveries` | List deliveries |
| POST | `/api/deliveries` | Create delivery |
| GET | `/api/deliveries/:id` | Delivery detail |
| POST | `/api/deliveries/:id/verify` | Start verification session |
| POST | `/api/deliveries/:id/verify/location` | GPS proximity check |
| POST | `/api/deliveries/:id/verify/photo` | Photo upload + AI analysis |
| POST | `/api/deliveries/:id/verify/confirm` | OTP + digital signature |
| POST | `/api/deliveries/:id/dispute` | Open a dispute |
| GET | `/api/verifications/:id` | Session detail with timeline |
| GET | `/api/verifications/:id/evidence` | Evidence file serving |
| POST | `/api/amazon/webhook` | Amazon event webhook |

## Verification Flow

```
Attribution → Arrival + GPS → Photo + AI Vision → OTP → Signature → Confirmation
                                                      ↓
                                          AI checks:
                                          • Identifiable face? (GDPR)
                                          • Package present?
                                          • Photo authentic?
```

Each step produces a timestamped `verification_event`. All evidence is SHA‑256 hashed. The AI vision check is **non-blocking** — it never interrupts the delivery flow.

## AI Vision

The `lib/ai-vision.ts` module uses a pluggable provider pattern:

```typescript
interface AIVisionProvider {
  analyze(buffer: Buffer, mimeType: string, role: string): Promise<AIVisionResult>;
}
```

| Provider | Status | Notes |
|----------|--------|-------|
| `mock` | ✅ Active (POC) | Entropy + pixel analysis, zero external deps |
| `google-vision` | 🔜 Ready | Implement `@google-cloud/vision` |
| `aws-rekognition` | 🔜 Ready | Implement AWS SDK Rekognition client |

### GDPR Compliance

- **No identifiable faces stored** — AI detection flags photos with clear faces before storage
- **Auto-blurring** — `lib/face-blur.ts` pixelates detected face regions
- **Minimal data** — Only necessary metadata collected
- **Limited retention** — Configurable 90-day data retention
- **Full audit trail** — Every access logged with who, what, when

## Testing

```bash
npm test              # Run all tests (Vitest)
npm run test:watch    # Watch mode
```

**22 tests** across 5 test files covering:
- GPS calculation (haversine)
- Verification engine (location, photo, OTP, signature)
- AI vision analysis
- Face blurring
- API authentication

## Roadmap

- [ ] Amazon API integration (live)
- [ ] SMS / Push notifications (Twilio / Firebase)
- [ ] Production photo storage (S3 / R2)
- [ ] PWA native camera wrapper
- [ ] CI/CD pipeline (GitHub Actions + Vercel)
- [ ] E2E tests (Playwright)

## License

[MIT](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
