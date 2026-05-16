# Contributing

Thanks for your interest in contributing to Delivery Verify.

## Development

```bash
npm install
npm run dev     # Start dev server on localhost:3000
npm test        # Run tests
```

## Guidelines

1. **No secrets in code** — Use `process.env` for all configuration. Never commit `.env.local` or real credentials.
2. **Pure functions first** — Keep business logic in `lib/` with zero I/O. Inject dependencies (DB, logger) as parameters.
3. **Tests required** — New features must include Vitest tests. Run `npm test` before committing.
4. **TypeScript strict** — Use the existing types in `types/`. Avoid `any`.
5. **No breaking changes** — Additive changes only unless explicitly discussed. Don't modify existing function signatures.
6. **Conventional commits** — Use clear commit messages: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.

## PR Workflow

1. Fork and create a feature branch (`feat/your-feature`)
2. Write tests
3. Ensure `npm test` passes
4. Open a pull request against `main`

## Adding an AI Vision Provider

1. Implement the `AIVisionProvider` interface in `lib/ai-vision.ts`
2. Register it via `setProvider(yourProvider)`
3. Add tests in `lib/__tests__/ai-vision.test.ts`
4. Add the provider config in `lib/demo-i18n.ts` (for the demo page)
