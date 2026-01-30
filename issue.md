# Windows-only dev error with `next-intl` precompile + Turbopack

## Summary

- **Environment**: Windows (GitHub Actions `windows-latest` / Windows Server 2025) + `next dev` (Turbopack)
- **Works**: `pnpm build`
- **Fails**: `pnpm dev` (dev server + browser console)
- **Error**:
  - `INVALID_MESSAGE: Message at \`HomePage.header.balance\` resolved to an array, but only strings are supported.`

This looks like precompiled messages (AST arrays) being surfaced to a runtime that expects strings, but only in **dev/Turbopack on Windows**.

## Reproduction (external)

Repro app repo (App Router + `next-intl` plugin with `precompile: true`):

- Repo: `https://github.com/amannn/next-intl-bug-repro-keyboy21-precompile`
- Branch: `cursor/next-intl-windows-dev-error-92a5`

CI reproduces on Windows by running Playwright against a dev server and failing on any console errors:

- Workflow: `.github/workflows/windows-dev-console-errors.yml`
- Playwright config: `playwright.config.ts` (`webServer.command = "pnpm dev"`)
- Test: `tests/dev-console-errors.spec.ts` (navigates to `/en`, asserts no console errors)

Local reproduction on Windows (from that repro repo branch):

```bash
pnpm install
pnpm playwright install
pnpm test:e2e
```

## What we observed

### 1) Runtime messages are strings in source JSON

`messages/en.json` contains:

```json
{
  "HomePage": {
    "header": {
      "balance": "Баланс : {balance} сум"
    }
  }
}
```

Yet on Windows dev, the resolved message becomes an **array**.

### 2) Final Next config shows Turbopack rule converting `*.json` under `./messages/**/*` to `*.js`

From `next.config.mjs` logging (`[next-config] finalConfig`) in the repro repo branch above:

- `turbopack.rules['*.json']` includes loader `next-intl/extractor/catalogLoader`
- `options.messages.precompile: true`
- `condition.path: './messages/**/*'`
- `as: '*.js'`

So in dev/Turbopack, message JSON is being loaded through the catalog loader and emitted as JS.

### 3) `turbopack.resolveAlias` includes a suspicious alias target for `use-intl/format-message`

From logs (trimmed):

```txt
turbopack.resolveAlias:
  'next-intl/config': './src/i18n/request.ts'
  'use-intl/format-message': './node_modules\\.pnpm\\use-intl@4.8.0_react@19.2.4\\node_modules\\use-intl\\dist\\esm\\production\\format-message\\format-only.js'
```

Notes:
- `next-intl/config` alias uses a clean repo-relative path and is known to work.
- `use-intl/format-message` alias is repo-relative but:
  - contains **backslashes** embedded in the string
  - points into pnpm’s `.pnpm` internal layout

Hypothesis: on Windows + Turbopack dev, this alias path format is not handled the same way as the `next-intl/config` alias, causing the wrong `format-message` implementation to be used (or alias resolution to fail), which then makes the runtime treat precompiled output as “messages” (arrays) instead of formatting them.

## Why this matters

The thrown error indicates `next-intl` believes it received message **arrays** at runtime, but the intended pipeline likely is:

- precompile → compiled form (arrays/AST) stored/transported
- runtime formatter → understands compiled form

If the formatter module aliasing is wrong in dev/Turbopack on Windows, that could explain:
- build ok (different pipeline)
- dev Windows broken (Turbopack + alias path semantics)

## What to try in `next-intl` (candidate fix direction)

- Ensure `turbopack.resolveAlias['use-intl/format-message']` matches the “working” alias format style:
  - prefer a stable, package-based resolution rather than pnpm internals
  - use `require.resolve(...)` (or equivalent) so Windows gets a valid absolute path
  - avoid mixed separators in an alias target string

Expected “robust” alias target shape on Windows is typically an absolute path from `require.resolve`, e.g. `D:\\...\\node_modules\\use-intl\\dist\\...\\format-only.js` (or forward-slash absolute).

## References

- Report/discussion: `https://github.com/amannn/next-intl/discussions/2209#discussioncomment-15640201`
