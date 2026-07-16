# Contributing

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Development

```bash
npm run dev -- --help
```

## Validation

```bash
npm run build
npm run test:unit
npm run test:integration
npm run test:smoke
npm run test -- --coverage
npm pack
```

## Release Notes

- Keep `RELEASE_NOTES.md` and `CHANGELOG.md` aligned with published versions.
- Add or update release notes whenever a publishable change lands.

## Standards

- Keep architecture aligned with .copilot documents
- Use ts-morph for TypeScript source modifications
- Do not use manual Prisma parser; use DMMF only
- Add tests for all behavior changes
