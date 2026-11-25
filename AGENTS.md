# AGENTS.md

Welcome, agent. Fast orientation for this repo. Read this first, `README.md` for depth.

## What this repo is

`data-types` is the catalogue of **standard event types** of Pryv.io: for each `{class}/{format}` (for example `mass/kg`, `note/txt`, `consent/accept-cmc`), a JSON Schema that says what the event's `content` may be. It is data plus a small build script, not a library: nothing here is published to npm (`package.json` is `private`).

[open-pryv.io](https://github.com/pryv/open-pryv.io) cores download the built catalogue at startup, from the URL in their `service.eventTypes` configuration, and validate event content against it. The usual one, proposed by the install wizard, is https://pryv.github.io/event-types/flat.json (browsable at https://pryv.github.io/event-types/). A published change therefore reaches every platform that uses that URL at its next start, without a server release.

## Quick repo map

```
src/*.json        THE SOURCE, one file per class (file name = class name, by convention)
optionals/        event-sets.json: named sets of types, copied into the built files as `sets`
scripts/
  build.js                     src/ + optionals/ -> dist/
  check-type-schemas.js        every type schema must compile (the second half of `npm run build`)
  json-schema-validator.js     ajv configured the way a core configures it
  validate.js                  runs content validation cases
  batch-to-validation-cases.js turns an API batch body into validation cases
dist/             BUILT AND COMMITTED, never edit by hand
  event-types.json             hierarchical (version, classes, extras, sets)
  flat.json                    keyed by type (version, types, extras, classes, sets): what cores use
  flat.min.json                version and types only
```

## Commands

```bash
npm install
npm run build            # src/ -> dist/, then checks that every type schema compiles
npm run lint             # eslint (neostandard, with semicolons), scripts only
npm run validate-schema  # re-check dist/flat.json (add `-- <file>` for another file)
npm run validate-content -- <cases.json> [schema.json] [--enforce-wildcards]
```

There is no test suite: the gate is `npm run build` + `npm run lint`, plus validation cases you write for the types you touch. A cases file is an array of `{ "type", "content", "expected": "success" | "failure" }`; `validation-cases.json` at the root is git-ignored for that use.

## Adding or changing a type

1. Edit `src/<class>.json` (or create it): `{ "<class>": { "description", "extras", "formats": { "<format>": { <JSON Schema>, "description", "extras" } } } }`. `extras` holds display data (`name` per language, `symbol`) and is moved to a separate section by the build.
2. Schemas are **JSON Schema draft-04**. Booleans are booleans (`"additionalProperties": true`, not `"true"`), and `required` sits beside `properties`, not inside it: both mistakes have shipped, and made cores refuse every event of the type.
3. Bump `version` in `package.json` (and its lockfile): the build writes it into the three files.
4. Run `npm run build` and commit `src/` and `dist/` together, so that the built files always match the source.
5. Write validation cases for what must pass **and** what must fail.

**Think of the events already stored.** Accounts hold events of the existing types, and a core validates content when an event is created or updated. Loosening a schema is safe; tightening one, or changing a type's JSON type, makes the next update of existing events fail. Prefer a new format. Descriptions and `extras` are free to change.

**A type that carries protocol meaning is not free to change.** `consent/*`, `shared-secret/*`, `verification/*` and similar classes are written or read by the server: the schema must follow the code in open-pryv.io, not the reverse.

## How a core uses the catalogue

Worth knowing before you reason about a validation result (code: `components/business/src/types.ts` and `components/api-server/src/methods/events.ts` in open-pryv.io):

- **Types are matched by exact key.** `numset/*` is the only wildcard entry here; cores do not expand it, so `numset/heart` is an unknown type to a core. `validate-content` mirrors that (and says so); `--enforce-wildcards` checks against the wildcard schema instead.
- **Unknown types are accepted** with any content: the catalogue validates, it does not restrict. Two exceptions: the `series:` prefix requires a known type, and a core that has not been able to load the catalogue since it started refuses unknown types until it does.
- **The download is applied on top of a seed** bundled in open-pryv.io (`components/business/src/types/event-types.default.json`), each type replacing the bundled one whole. Removing a type here does not remove it from a core.
- **A schema that does not compile refuses every event of its type.** The core starts and logs a warning. That is why the build compiles each schema with the same ajv setup as the core.

## Publishing

Merging to `master` does not publish the catalogue (only a platform pointed at the raw files on GitHub would see it). The chain:

1. `master` here, with `dist/` rebuilt.
2. The developer site ([dev-site2](https://github.com/pryv/dev-site2)) imports `dist/` with `just import-event-types`, and its publication puts the files at `https://pryv.github.io/event-types/flat.json` and `https://pryv.github.io/event-types/hierarchical.json` (the latter is `dist/event-types.json`).
3. open-pryv.io vendors the published catalogue twice (the test fixture `test/event-types-flat.json` and the seed above). Its lint compares both with the published file and fails on a difference: refresh them there with `just update-event-types` right after a publication.

**Your own catalogue:** fork, edit, build, host `dist/flat.json` or `dist/flat.min.json` on any web server, and set `service.eventTypes` to its URL. It extends the bundled types, so it only needs your additions and overrides.

## Where to file issues / PRs

- Wrong or missing type, schema bug: [`pryv/open-pryv.io` GitHub Issues](https://github.com/pryv/open-pryv.io/issues), single tracker for the Pryv ecosystem; maintainers route internally.
- PRs against `master`, with `dist/` rebuilt.
- Vulnerabilities: see [SECURITY.md](./SECURITY.md), not a public issue.

## Where to read next

- `README.md`: file format of a class, validation tools, content of the built files.
- [Event types](https://pryv.github.io/event-types/): the rendered catalogue. [API concepts](https://pryv.github.io/concepts/): events and streams.
- [open-pryv.io AGENTS.md](https://github.com/pryv/open-pryv.io/blob/master/AGENTS.md): the server that validates against this catalogue.
- [llms.txt](https://pryv.github.io/llms.txt): agent index of the developer documentation.

## When in doubt

- Where this repo and the open-pryv.io code disagree on how validation works, the code wins.
- `git log -- src/<class>.json` explains why a schema is the way it is.
