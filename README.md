# react-markdown-composer

Reusable React component for composing markdown.

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-26-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18.svg?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.4+-000000.svg?style=flat-square&logo=bun)](https://bun.sh/)

- [react-markdown-composer](#react-markdown-composer)
  - [Installation](#installation)
  - [Development](#development)
  - [All Scripts](#all-scripts)
  - [Contributions](#contributions)
  - [Library semantic versioning](#library-semantic-versioning)
  - [License](#license)

## Installation

Install [Bun](https://bun.sh/docs/installation) 1.4+ (see `packageManager` in `package.json`), then:

```bash
bun install
```

Install [habit-hooks](https://github.com/habit-hooks/habit-hooks) (Python 3.11+) to run the `bun run habit:hooks` / `bun run habit:snoozed` scripts below:

```bash
uv tool install "habit-hooks[typescript]"  # pip, pipx or brew also work
```

## Development

```bash
bun start
```

Starts the Vite playground on http://localhost:3000 and opens `MarkdownComposer`.

## All Scripts

| Command                 | Description                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `bun clean:node`        | Removes node_modules directories and bun.lock file                                             |
| `bun start`             | Starts the Vite playground (MarkdownComposer)                                                  |
| `bun generate:version`  | Writes version constants from package.json (optional local helper)                             |
| `bun typecheck`         | Checks TypeScript types without emitting files                                                 |
| `bun lint`              | Runs ESLint to check code quality                                                              |
| `bun lint:fix`          | Runs ESLint with `--fix`                                                                       |
| `bun lint:package`      | Lints `package.json` via npm-package-json-lint                                                 |
| `bun lint:unused`       | Finds unused files, exports, and dependencies (via knip)                                       |
| `bun habit:hooks`       | Runs [habit-hooks](https://github.com/habit-hooks/habit-hooks) — linter findings as coaching guides |
| `bun habit:snoozed`     | Lists the currently snoozed habit-hooks findings (`.habit-hooks/snooze.json`)                  |
| `bun format`            | Formats all files using Prettier according to .prettierrc rules                                |
| `bun format:check`      | Checks if files are formatted according to Prettier rules                                      |
| `bun build`             | Cleans `dist`, then type-checks (`tsc -b`)                                                     |
| `bun test`              | Runs tests using Vitest                                                                        |
| `bun test:eslint-rules` | Runs unit tests for custom ESLint rules (`eslint-rules/`)                                      |
| `bun test:coverage`     | Runs tests with a Vitest coverage report                                                       |
| `bun test:crap`         | Runs tests with coverage, then generates a CRAP score report (`crap-report/`)                  |

## Contributions

Contributions to the project are made by improving the current codebase and then creating a Pull Request. When the PR is merged into `main`, the CI pipeline runs automatically. [semantic-release](https://semantic-release.gitbook.io/) determines the next version from conventional commit messages, updates `CHANGELOG.md` and `package.json`, and publishes the new version — no manual version bump required.

## Library semantic versioning

Versioning is automated by [semantic-release](https://semantic-release.gitbook.io/) using [Conventional Commits](https://www.conventionalcommits.org/). The release type is derived from commit message prefixes:

| Commit prefix                 | Release type                                    |
| ----------------------------- | ----------------------------------------------- |
| `fix:`                        | `PATCH` — backward-compatible bug fix           |
| `feat:`                       | `MINOR` — new backward-compatible functionality |
| `feat!:` / `BREAKING CHANGE:` | `MAJOR` — incompatible API change               |

Follow [Semantic Versioning](https://semver.org/#summary) (`MAJOR.MINOR.PATCH`) when writing commit messages — the tooling takes care of the rest. Commitlint requires a **scope** (e.g. `feat(composer): add toolbar`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
