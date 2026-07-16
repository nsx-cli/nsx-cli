# NSX CLI

NSX CLI is an enterprise-ready TypeScript CLI for scaffolding, analyzing, and maintaining NestJS and Prisma projects.

Release 1.0 is validated end to end with build, test, coverage, packaging, and a temporary `nsx-playground` project.

## Features

- Command pipelines with ApplicationContext and Bootstrap DI
- Generator registry with Template Method pattern
- Prisma DMMF-based CRUD workflows
- ts-morph AST operations for safe code modifications
- Quality commands: doctor, analyze, fix, graph
- Documentation and AI command modules
- Marketplace de templates remotos com install local e overlay no TemplateRegistry

## Installation

```bash
npm install -g @nsx/cli
```

## Quick Start

```bash
nsx generate module users
nsx generate test users
nsx make api users
nsx prisma crud User
nsx doctor
nsx analyze
nsx fix --dry-run
nsx graph
nsx docs generate
nsx marketplace templates list
nsx marketplace templates install enterprise-controller
```

## Release 1.0

- [Release Notes v1.0](RELEASE_NOTES.v1.0.md)
- [Release Checklist v1.0](CHECKLIST.v1.0.md)
- [RC1](RC1.md)

## Commands

See [docs/command-reference.md](docs/command-reference.md).

## Marketplace

See [docs/marketplace.md](docs/marketplace.md).

## Architecture

See [docs/architecture-guide.md](docs/architecture-guide.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## Release Notes

See [RELEASE_NOTES.md](RELEASE_NOTES.md), [RELEASE_NOTES.v1.0.md](RELEASE_NOTES.v1.0.md), and [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
