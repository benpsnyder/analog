# AnalogJS v3 Unified Issues Plan

Last merged: 2026-04-05  
This file consolidates the previous split issue docs into one canonical planning document.

Planning branch policy:

- The master `Issues.md` planning document resides on local branch `feat/resolve-all-issues`.
- That branch is a local coordination branch and should not be pushed to `origin`.
- Each issue should be implemented on its own dedicated branch, tracked in the resolution ledger below.
- Every implementation branch should be based on `analogjs/alpha` unless explicitly noted otherwise.

## Section Index

- Release inventory and prioritization
- Parallel workstreams and per-issue triage
- Execution plans with instrumentation, verification, and risks
- Additional technical execution notes preserved from the prior technical-plan draft

---

## Release Inventory

- `Must fix before stable`: release-blocking correctness, packaging, migration, or core DX issues.
- `Should fix before stable`: strong candidates for the v3 stabilization window, but not all are hard blockers.
- `Verify fixed and close`: open issues that look already resolved in the repo and should be regression-tested, then closed.
- `Defer to v3.1+`: valuable work, but not the right scope for stabilizing v3.

## Recommended Release Gate

### Must fix before stable

- [ ] `analogjs/analog#2229` Refactor stylesheet pipeline / Tailwind v4 / HMR
- [ ] `analogjs/analog#2172` blog-app root route should redirect to `/blog`
- [ ] `analogjs/analog#2165` `contentFileResource` fails during prerender and file-server hydration
- [ ] `analogjs/analog#2174` typed route generation drops pathless parent layouts
- [ ] `analogjs/analog#2049` scoped CSS keyframes are not unique in dev mode
- [ ] `analogjs/analog#2026` Angular HMR / reload behavior is unreliable and underspecified
- [ ] `analogjs/analog#2178` published `.mjs.map` files are missing
- [ ] `analogjs/analog#2215` deprecation audit and removal plan
- [ ] `analogjs/analog#2127` remaining maintainer follow-ups that affect correctness/API behavior
- [ ] `analogjs/analog#1939` migration guide for stable v3

### Should fix before stable

- [ ] `analogjs/analog#2222` Vitest 4 isolation regression on CI
- [ ] `analogjs/analog#2220` snapshot output has trailing whitespace / blank lines
- [ ] `analogjs/analog#2218` snapshot output contains unstable ids and `aria-describedby`
- [ ] `analogjs/analog#2173` old `setup-vitest` path still has a broken `zone.js` dependency story
- [ ] `analogjs/analog#2185` release process still needs deterministic lockfile regeneration
- [ ] `analogjs/analog#2074` Storybook `componentWrapperDecorator` is broken in Vitest
- [ ] `analogjs/analog#2029` allow Mermaid-heavy content builds to avoid Shiki OOM paths
- [ ] `analogjs/analog#2159` remove leftover `.agx` references
- [ ] `analogjs/analog#2076` remove stale `standalone: true` usage from docs/templates where modern Angular no longer needs it
- [ ] `analogjs/analog#2036` add AI integrations docs section

### Verify fixed and close

- [ ] `analogjs/analog#2177` HTTP/2 pseudo-headers crash in `toWebHeaders()`
- [ ] `analogjs/analog#2168` restore Angular schematic compatibility for `@analogjs/platform`
- [ ] `analogjs/analog#2044` typed file routing umbrella issue after follow-up hardening
- [ ] `analogjs/analog#2092` OXC tooling investigation is mostly done; re-scope or close

### Defer to v3.1+

- [ ] `analogjs/analog#2227` first-class Style Dictionary support
- [ ] `analogjs/analog#2213` Astro client hydration reuse
- [ ] `analogjs/analog#2189` runtime i18n with `$localize`
- [ ] `analogjs/analog#2175` Vite Plugin Registry compatibility metadata
- [ ] `analogjs/analog#2158` MD / MDX / MDC performance work
- [ ] `analogjs/analog#2068` Storybook SCSS build issue without a minimal repro
- [ ] `analogjs/analog#2039` docs site accessibility / hosting issue
- [ ] `analogjs/analog#2038` migrate docs site to Astro/Starlight
- [ ] `analogjs/analog#2035` complete Nitro v3 Vite plugin migration

## Parallel Workstreams

### Workstream A: Angular CSS / HMR / dev-server correctness

Issues: `analogjs/analog#2229`, `analogjs/analog#2049`, `analogjs/analog#2026`  
Primary packages:

- `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts`
- `packages/vite-plugin-angular/src/lib/host.ts`
- `packages/vite-plugin-angular/src/lib/stylesheet-registry.ts`
- `packages/vite-plugin-angular/src/lib/live-reload-plugin.ts`
- `packages/platform/src/lib/options.ts`
- `packages/platform/src/lib/platform-plugin.ts`
- `apps/analog-app-e2e/tests/angular-compilation-api.spec.ts`
- `apps/tailwind-debug-app-e2e/tests/component-css-hmr.spec.ts`

Opinion: this is the highest-risk technical area for v3. Treat it as one stabilization stream, not three separate fixes, because the same externalized stylesheet/HMR pipeline is behind all of them.

### Workstream B: Content / prerender / markdown pipeline

Issues: `analogjs/analog#2165`, `analogjs/analog#2029`, `analogjs/analog#2158`  
Primary packages:

- `packages/content/resources/src/content-file-resource.ts`
- `packages/content/src/lib/content-file-loader.ts`
- `packages/content/src/lib/content-files-list-token.ts`
- `packages/content/src/lib/content-files-token.ts`
- `packages/content/src/lib/get-content-files.ts`
- `packages/content/src/lib/provide-content.ts`
- `apps/blog-app-e2e/tests/app.spec.ts`
- `apps/docs-app/docs/features/routing/content.md`

Opinion: `analogjs/analog#2165` is a blocker; `analogjs/analog#2029` is the opportunistic follow-up. Do not expand this stream into a broad content redesign before the SSR/resource path is stable.

### Workstream C: Router / typed routes / redirect correctness

Issues: `analogjs/analog#2172`, `analogjs/analog#2174`, `analogjs/analog#2044`, correctness items from `analogjs/analog#2127`  
Primary packages:

- `packages/platform/src/lib/route-manifest.ts`
- `packages/platform/src/lib/route-manifest.spec.ts`
- `packages/platform/src/lib/typed-routes-plugin.ts`
- `packages/platform/src/lib/route-generation-plugin.ts`
- `packages/router/src/lib/request-context.ts`
- `packages/router/src/lib/define-route.ts`
- `apps/blog-app/src/app/pages/index.page.ts`
- `packages/create-analog/template-blog/src/app/pages/index.page.ts`
- `apps/blog-app-e2e/tests/app.spec.ts`

Opinion: this stream should aim to make route generation boring and deterministic. Redirect-only routes, pathless layouts, and SSR fetch forwarding all need to behave correctly before stable.

### Workstream D: Vitest / Storybook / test DX

Issues: `analogjs/analog#2222`, `analogjs/analog#2220`, `analogjs/analog#2218`, `analogjs/analog#2173`, `analogjs/analog#2074`, `analogjs/analog#2068`  
Primary packages:

- `packages/vitest-angular/setup-testbed.ts`
- `packages/vitest-angular/setup-snapshots.ts`
- `packages/vitest-angular/src/lib/snapshot-serializers/index.ts`
- `packages/vitest-angular/src/lib/snapshot-serializers/no-ng-attributes.ts`
- `packages/vite-plugin-angular/package.json`
- `packages/vite-plugin-angular/migrations/migrate-setup-vitest/migrate-setup-vitest.ts`
- `packages/storybook-angular/src/lib/testing.ts`
- `packages/storybook-angular/src/lib/preset.ts`
- `tests/vitest-angular/src/reset-test-bed-between-tests/test-setup.ts`
- `tests/vitest-angular/src/snapshot-serializers`

Opinion: this is mostly sharp-edge removal. It is good sub-agent territory because each issue is focused and regression-testable.

### Workstream E: Release hygiene / package quality

Issues: `analogjs/analog#2178`, `analogjs/analog#2185`, `analogjs/analog#2215`, packaging item from `analogjs/analog#2127`  
Primary packages:

- `release.config.ts`
- `tools/scripts/publish.mts`
- `tools/scripts/verify-package-artifacts.mts`
- `packages/router/package.json`
- `packages/vite-plugin-angular/package.json`
- `packages/storybook-angular/src/types.ts`
- `packages/vite-plugin-nitro/src/lib/options.ts`

Opinion: this work is less glamorous but directly affects the quality of the first stable publish. It should not be left for “after code freeze”.

### Workstream F: Docs / migration / launch polish

Issues: `analogjs/analog#1939`, `analogjs/analog#2159`, `analogjs/analog#2076`, `analogjs/analog#2036`, closeout notes for `analogjs/analog#2044`  
Primary packages:

- `apps/docs-app/docs`
- `apps/docs-app/i18n`
- `apps/docs-app/docusaurus.config.js`
- `CHANGELOG.md`
- `packages/create-analog/template-blog`
- `packages/nx-plugin/src/generators/page/files/__fileName__.page.ts__template__`

Opinion: stable v3 needs a real migration story and modern examples. This stream is parallelizable and should run while the core engineering work is in progress.

## Per-Issue Triage

### Must fix before stable

#### `analogjs/analog#2229` [AnalogJS v3] RFC: Refactor Stylesheet Pipeline

Status: `must fix before stable`

Files:

- `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts`
- `packages/vite-plugin-angular/src/lib/host.ts`
- `packages/vite-plugin-angular/src/lib/stylesheet-registry.ts`
- `packages/platform/src/lib/options.ts`
- `packages/platform/src/lib/platform-plugin.ts`
- `packages/create-analog/index.js`
- `packages/nx-plugin/src/generators/app/lib/add-tailwind-helpers.ts`

Opinion: the core direction is correct already: separate `hmr` from stylesheet externalization, keep `liveReload` as a compatibility alias, and make Tailwind-aware preprocessing framework-owned. Finish this as a stabilization effort, not as an open-ended RFC.

Open PR context:

- draft [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204) is still open, but it is now a docs-only follow-up and explicitly says the implementation already landed via [analogjs/analog#2226](https://github.com/analogjs/analog/pull/2226)

#### `analogjs/analog#2172` [AnalogJS v3] blog-app index route does not redirect to /blog

Status: `must fix before stable`

Files:

- `apps/blog-app-e2e/tests/app.spec.ts`
- `apps/blog-app/src/app/pages/index.page.ts`
- `packages/create-analog/template-blog/src/app/pages/index.page.ts`
- `packages/platform/src/lib/route-generation-plugin.ts`
- `packages/platform/src/lib/route-manifest.ts`

Opinion: the app currently uses a client-only navigation workaround while the template still shows the intended metadata-based redirect. Fix redirect-only route handling in the route pipeline, restore the metadata route in the app, and re-enable the e2e.

#### `analogjs/analog#2165` [AnalogJS v3] `contentFileResource` does not resolve during prerender or file-server hydration

Status: `must fix before stable`

Files:

- `packages/content/resources/src/content-file-resource.ts`
- `packages/content/src/lib/content-file-loader.ts`
- `packages/content/src/lib/content-files-list-token.ts`
- `packages/content/src/lib/content-files-token.ts`
- `packages/content/src/lib/get-content-files.ts`
- `apps/blog-app-e2e/tests/app.spec.ts`

Opinion: this is a real runtime correctness bug for prerendered content and static hosting. Fix the resource-loading path first; only after that should the team revisit content ergonomics or performance features.

#### `analogjs/analog#2174` bug(router): pathless parent layouts are treated as route collisions

Status: `must fix before stable`

Files:

- `packages/platform/src/lib/route-manifest.ts`
- `packages/platform/src/lib/route-manifest.spec.ts`
- `packages/platform/src/lib/typed-routes-plugin.ts`
- `apps/docs-app/docs/features/routing/typed-routes.md`

Opinion: typed routing cannot be considered stable while valid pathless layouts are warned on or dropped. Keep structural identity by route `id`, compute parent/child relations first, and only canonicalize by `fullPath` where that is semantically correct.

#### `analogjs/analog#2049` Scoped CSS keyframes does not have unique names in dev mode

Status: `must fix before stable`

Files:

- `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts`
- `packages/vite-plugin-angular/src/lib/stylesheet-registry.ts`
- `packages/vite-plugin-angular/src/lib/host.ts`
- `apps/tailwind-debug-app-e2e/tests/component-css-hmr.spec.ts`

Opinion: dev and prod should not disagree on CSS scoping semantics. The likely fix belongs in the dev stylesheet transformation/externalization path, not in application code.

#### `analogjs/analog#2026` HMR is not working

Status: `must fix before stable`

Files:

- `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts`
- `packages/vite-plugin-angular/src/lib/live-reload-plugin.ts`
- `packages/vite-plugin-angular/src/lib/angular-vite-plugin-live-reload.spec.ts`
- `apps/analog-app-e2e/tests/angular-compilation-api.spec.ts`
- `apps/analog-app-e2e-playwright/tests/angular-compilation-api.spec.ts`

Opinion: clarify the contract first, then enforce it in tests. Template/style edits should HMR where supported; TS logic edits must at least trigger deterministic full reload when Angular cannot produce a safe HMR payload.

#### `analogjs/analog#2178` bug: Missing `.mjs.map` source map files in published ng-packagr packages

Status: `must fix before stable`

Files:

- `packages/router/ng-package.json`
- `packages/content/ng-package.json`
- `tools/scripts/verify-package-artifacts.mts`
- `tools/scripts/publish.mts`
- `release.config.ts`

Opinion: this is a packaging-quality issue rather than a framework-runtime issue, but it affects every consumer with noisy Vite sourcemap errors. Add a packed-artifact assertion so this does not regress again.

#### `analogjs/analog#2215` Audit deprecated APIs for removal

Status: `must fix before stable`

Files:

- `packages/router/src/lib/define-route.ts`
- `packages/vitest-angular/src/lib/builders/build/plugins/downlevel-plugin.ts`
- `packages/vitest-angular/setup-testbed.ts`
- `packages/storybook-angular/src/types.ts`
- `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts`
- `packages/platform/src/lib/options.ts`
- `packages/vite-plugin-nitro/src/lib/options.ts`
- `apps/docs-app/docs/guides/migrating.md`

Opinion: v3 stable should ship with an explicit deprecation posture. Inventory every exported deprecation, decide which ones are removed vs. documented compatibility aliases, then align the docs and migration guide in the same pass.

#### `analogjs/analog#2127` [AnalogJS v3] Track follow-ups and feedback from maintainer

Status: `must fix before stable` for the correctness/API items; `defer` for the future enhancements

Files:

- `packages/router/src/lib/request-context.ts`
- `packages/router/package.json`
- `packages/router/src/lib/define-server-route.ts`
- `packages/router/src/lib/tanstack-query`
- `apps/tanstack-query-app`

Opinion: only a subset is truly release-critical. The must-fix items are:

- SSR query-param forwarding in `requestContextInterceptor`
- a clear published-consumer story for `@standard-schema/spec`
- mutually exclusive `defineServerRoute` option shapes

The “upstream to TanStack Query” and future resource API ideas are post-stable work.

#### `analogjs/analog#1939` AnalogJS 2.0 migration guide

Status: `must fix before stable`

Files:

- `apps/docs-app/docs/guides/migrating.md`
- `apps/docs-app/docs/features/routing/content.md`
- `CHANGELOG.md`
- `packages/create-analog/template-blog/src/app/app.config.ts`

Opinion: stable v3 without a current migration guide will generate avoidable support churn. The guide should call out content/highlighter changes, testing setup changes, typed routes, and any HMR option renames.

### Should fix before stable

#### `analogjs/analog#2222` Vitest 4.0.5 broke Angular tests’ isolation

Status: `should fix before stable`

Files:

- `packages/vitest-angular/setup-testbed.ts`
- `tests/vitest-angular/src/reset-test-bed-between-tests/test-setup.ts`
- `tests/vitest-angular/vitest.config.ts`

Opinion: even without a perfect reproduction repo, test isolation regressions in the first-party test package are exactly the kind of problem that will look like “v3 instability” to users. Add a CI-oriented regression fixture and harden cleanup behavior.

#### `analogjs/analog#2220` vitest snapshots: remove trailing white-space

Status: `should fix before stable`

Files:

- `packages/vitest-angular/setup-snapshots.ts`
- `packages/vitest-angular/src/lib/snapshot-serializers/index.ts`
- `tests/vitest-angular/src/snapshot-serializers`

Opinion: snapshot text normalization belongs in the serializer layer. Trim trailing whitespace and collapse serializer-created blank lines before users have to workaround it in inline snapshots.

#### `analogjs/analog#2218` vitest snapshots: unstable ids and `aria-describedby`

Status: `should fix before stable`

Files:

- `packages/vitest-angular/src/lib/snapshot-serializers/no-ng-attributes.ts`
- `packages/vitest-angular/src/lib/snapshot-serializers/no-ng-attributes.spec.ts`

Opinion: this is a narrow and tractable serializer fix. Expand the attribute-cleaning patterns for CDK/Ngb-generated ids and ARIA attributes, then add explicit regression tests.

#### `analogjs/analog#2173` old `@analogjs/vite-plugin-angular/setup-vitest` path still has a broken dependency story

Status: `should fix before stable`

Files:

- `packages/vite-plugin-angular/package.json`
- `packages/vite-plugin-angular/migrations/migrate-setup-vitest/migrate-setup-vitest.ts`
- `packages/vitest-angular/package.json`
- `apps/docs-app/docs/features/testing/vitest.md`

Opinion: the repo is clearly migrating users to `@analogjs/vitest-angular`, which is correct, but the old path still exists in issue history and migration tests. Stable v3 should either make the legacy path harmless or remove it with a clean migration story.

#### `analogjs/analog#2185` bug: include `pnpm-lock.yaml` in release commits

Status: `should fix before stable`

Files:

- `release.config.ts`

Opinion: the repo already commits `pnpm-lock.yaml`, but the lockfile still needs regeneration after version replacement. Add an explicit lockfile-only install or equivalent prepare hook so releases are deterministic.

#### `analogjs/analog#2074` [storybook] `componentWrapperDecorator` broken in Vitest

Status: `should fix before stable`

Files:

- `packages/storybook-angular/src/lib/testing.ts`
- `packages/storybook-angular/src/lib/testing.spec.ts`

Opinion: the thread already points at the likely fix: include `applyDecorators` in the render annotations. This should be a small patch with a focused regression test.

#### `analogjs/analog#2029` Ability to exclude Mermaid blocks from Shiki to avoid OOM in CI

Status: `should fix before stable`

Files:

- `packages/content/src/lib/provide-content.ts`
- `packages/content/src/lib/marked-content-highlighter.ts`
- `packages/content/shiki-highlighter`
- `apps/docs-app/docs/features/routing/content.md`

Opinion: do not wait for a full content rewrite. Add a direct way to bypass expensive languages like Mermaid in the highlighter path, and update docs so the client-only Mermaid recommendation is the default guidance.

#### `analogjs/analog#2159` [Repo]: remove leftover references to agx files

Status: `should fix before stable`

Files:

- `CHANGELOG.md`
- `apps/docs-app/docs`
- any remaining references found by `rg 'agx'`

Opinion: low-risk cleanup, worth doing before stable so removed experiments do not remain discoverable in public docs or release notes.

#### `analogjs/analog#2076` [Docs]: remove usage of `standalone: true`

Status: `should fix before stable`

Files:

- `apps/docs-app/docs`
- `packages/nx-plugin/src/generators/page/files/__fileName__.page.ts__template__`
- generator snapshots tied to page scaffolding

Opinion: keep version-specific compatibility templates where older Angular needs the property, but stop presenting it as normal modern usage in current docs and examples.

#### `analogjs/analog#2036` Docs: add section for AI integrations

Status: `should fix before stable`

Files:

- `apps/docs-app/docs`
- `apps/docs-app/docusaurus.config.js`

Opinion: not a core framework blocker, but it is useful launch polish given the current ecosystem. This can be done in parallel with the migration guide and other docs work.

### Verify fixed and close

#### `analogjs/analog#2177` bug: `toWebHeaders()` crashes on HTTP/2 pseudo-headers

Status: `verify fixed, then close`

Files:

- `packages/vite-plugin-nitro/src/lib/utils/node-web-bridge.ts`

Opinion: the repo already filters pseudo-headers with `!key.startsWith(':')`. Add or confirm regression coverage, then close the issue.

#### `analogjs/analog#2168` [AnalogJS v3] restore real Angular schematic compatibility for `@analogjs/platform`

Status: `verify fixed, then close`

Files:

- `packages/nx-plugin/generators.json`
- `packages/nx-plugin/src/generators/app/compat.ts`
- `packages/nx-plugin/src/generators/page/compat.ts`
- `packages/nx-plugin/src/generators/init/compat.ts`
- `packages/nx-plugin/src/generators/setup-vitest/compat.ts`

Opinion: the current repo shape looks aligned with the issue’s requested compatibility path. The missing step is confidence in published-package behavior, not more design work.

#### `analogjs/analog#2044` [@analogjs/router]: support type-safety for file-based routing

Status: `verify hardened, then close`

Files:

- `packages/platform/src/lib/route-manifest.ts`
- `packages/platform/src/lib/typed-routes-plugin.ts`
- `packages/platform/src/lib/route-generation-plugin.ts`
- `packages/router/src/lib/inject-typed-params.ts`
- `apps/docs-app/docs/features/routing/typed-routes.md`

Opinion: most of the feature is already landed. Close the umbrella issue after `analogjs/analog#2174` and the typed-route hardening from `analogjs/analog#2127` are resolved.

#### `analogjs/analog#2092` Investigate addition of oxc tools

Status: `re-scope or close`

Files:

- `package.json`
- `oxlint.config.ts`
- `packages/nx-plugin/src/generators/app/lib/add-eslint.ts`
- `packages/create-analog/package.json`

Opinion: repo-level OXC adoption is no longer speculative. The remaining question is whether new generated apps should default to OXC-based tooling, which is a smaller follow-up issue.

### Defer to v3.1+

#### `analogjs/analog#2227` [AnalogJS v3] RFC: first-class Style Dictionary support

Status: `defer`

Files:

- `packages/platform/src/lib/options.ts`
- `packages/create-analog/index.js`
- `apps/docs-app/docs`

Opinion: potentially useful, but it would expand public API and dependency surface during stabilization. Revisit after the stylesheet pipeline is settled.

Open PR context:

- draft [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204) references this issue, but that PR is now only the Tailwind/docs companion and should not be treated as implementation progress on design-token support itself

#### `analogjs/analog#2213` feature: use Angular client hydration in Astro components

Status: `defer`

Files:

- `packages/astro-angular/src/client.ts`
- `packages/astro-angular/src/server.ts`
- `packages/astro-angular/README.md`

Opinion: worthwhile performance work, but not a v3 stable blocker unless Astro hydration is a release headline item.

Open PR context:

- draft [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212) is the active WIP implementation for this issue

#### `analogjs/analog#2189` Feature: runtime i18n support with `$localize`

Status: `defer`

Files:

- `packages/router`
- `packages/platform/src/lib/options.ts`
- `packages/vite-plugin-nitro`
- `packages/content`

Opinion: too broad for a stabilization window. Split into smaller routing, content, and Nitro phases after stable.

#### `analogjs/analog#2175` feat(vite-plugin-angular): add Vite Plugin Registry compatibility

Status: `defer`

Files:

- `packages/vite-plugin-angular/package.json`
- `packages/vite-plugin-angular/README.md`

Opinion: good metadata hygiene, not a stable-release gate.

#### `analogjs/analog#2158` [AnalogJS v3] MD / MDX / MDC rendering performance

Status: `defer`

Files:

- `packages/content/src/lib/provide-content.ts`
- `packages/content/src/lib/markdown.component.ts`
- `packages/content/src/index.ts`

Opinion: do not mix performance experimentation with content-runtime stabilization.

#### `analogjs/analog#2068` [storybook] vite builder does not build scss

Status: `defer unless a minimal reproduction appears`

Files:

- `packages/storybook-angular/src/lib/preset.ts`
- `packages/storybook-angular/README.md`
- `apps/docs-app/docs/integrations/storybook/index.md`

Opinion: current code already handles style injection and SCSS load paths, and the thread never produced a small repro. Improve docs first; only escalate if a repro shows a package bug.

#### `analogjs/analog#2039` [Docs] analogjs.org/docs not accessible

Status: `defer from code release gate`

Files:

- `apps/docs-app/docusaurus.config.js`

Opinion: this looks operational rather than framework-level. It matters for launch readiness, but not as a monorepo code blocker unless the public docs deploy is part of the release gate.

#### `analogjs/analog#2038` [Docs]: migrate docs to Astro/Starlight

Status: `defer`

Files:

- `apps/docs-app`

Opinion: explicitly on hold in the thread. Do not mix a docs-platform rewrite into the v3 stabilization scope.

#### `analogjs/analog#2035` [@analogjs/vite-plugin-nitro]: investigate support for Nitro v3 Vite plugin

Status: `defer`

Files:

- `packages/vite-plugin-nitro/src/lib/vite-plugin-nitro.ts`
- `packages/vite-plugin-nitro/src/lib/build-server.ts`
- `packages/vite-plugin-nitro/src/lib/build-ssr.ts`

Opinion: the issue comments already frame the remaining migration work as more appropriate for `v3.1`. Keep the landed pieces stable and defer more churn.

Open PR context:

- open [analogjs/analog#2188](https://github.com/analogjs/analog/pull/2188) is the current migration PR for this issue; it is substantial and should be evaluated as post-stable architecture work rather than required v3 GA scope

## Suggested Execution Order

1. Workstream A and Workstream C first: CSS/HMR and routing correctness are the biggest “stable means stable” risks.
2. Workstream B in parallel: `contentFileResource` prerender correctness must land before launch.
3. Workstream D next: eliminate sharp test/storybook regressions so release confidence improves.
4. Workstream E during code freeze: package quality, deprecations, and release automation.
5. Workstream F throughout: docs, migration, and launch polish should not wait until the very end.

## Explicitly Not In Scope For v3 Stable

- first-class design token integration
- runtime i18n
- docs platform migration
- finishing the Nitro v3 plugin migration
- Astro hydration enhancements

Those are good follow-ups, but they should not delay stabilization of the existing v3 surface.

---

## Execution Plans

Each issue plan below has the same shape:

- `Root cause / working theory`
- `Desired end state`
- `Execution plan`
- `Instrumentation`
- `Verification`
- `Risks / notes`

## Shared Instrumentation Conventions

Analog already standardizes on `obug` with deferred activation and optional scoped file logs under `tmp/debug/`.

Primary scopes:

- `analog:angular:hmr`
- `analog:angular:hmr:v`
- `analog:angular:styles`
- `analog:angular:styles:v`
- `analog:angular:compiler`
- `analog:angular:compilation-api`
- `analog:angular:tailwind`
- `analog:platform`
- `analog:platform:routes`
- `analog:platform:content`
- `analog:platform:typed-router`
- `analog:platform:tailwind`
- `analog:nitro`
- `analog:nitro:ssr`
- `analog:nitro:prerender`

Preferred local debug config shape:

```ts
analog({
  debug: {
    scopes: [
      'analog:platform:typed-router',
      'analog:angular:hmr',
      'analog:angular:styles',
    ],
    mode: 'dev',
    logFile: 'scoped',
  },
});
```

Equivalent env-var form:

```bash
DEBUG=analog:platform:typed-router,analog:angular:hmr,analog:angular:styles pnpm dev
```

When a plan below says `scoped log files`, it means using the built-in `logFile: 'scoped'` option so logs land in files like:

- `tmp/debug/analog.angular.hmr.log`
- `tmp/debug/analog.angular.styles.log`
- `tmp/debug/analog.platform.typed-router.log`
- `tmp/debug/analog.nitro.prerender.log`

For Vite websocket/HMR timing issues, also reuse the existing `tailwind-debug-app` logging surfaces:

- `tmp/debug/tailwind-debug-app.vite-hmr.log`
- `tmp/debug/tailwind-debug-app.vite-ws.log`

## Must Fix Before Stable

### `analogjs/analog#2229` stylesheet pipeline / Tailwind v4 / HMR

Root cause / working theory:

- The historical Angular plugin design treated `liveReload` as the public switch and coupled HMR behavior to `externalRuntimeStyles`.
- Tailwind v4 needs component styles to flow through Vite's CSS pipeline with the right `@reference` semantics, but Angular's own resource pipeline externalizes styles for different reasons.
- Generator output, docs, and runtime behavior have not fully converged on a single model, which creates drift between app templates, Nx generators, and the actual plugin.

Desired end state:

- `hmr` is the primary option and `liveReload` is only a compatibility alias.
- Stylesheet externalization is decided independently of HMR.
- Tailwind-aware preprocessing is a first-class, framework-owned part of component stylesheet handling.
- Generator templates, docs, and runtime all describe the same pipeline.

Execution plan:

1. Audit the full stylesheet decision tree in `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts` for both the Compilation API path and the legacy `NgtscProgram` path.
2. Split the option-resolution layer into:
   - HMR enablement
   - stylesheet externalization
   - Tailwind preprocessing
3. Confirm the same Tailwind root stylesheet and prefix rules are applied consistently in:
   - `packages/platform/src/lib/options.ts`
   - `packages/platform/src/lib/platform-plugin.ts`
   - `packages/create-analog/index.js`
   - `packages/nx-plugin/src/generators/app/lib/add-tailwind-helpers.ts`
4. Remove or minimize any remaining code paths where `liveReload` implicitly controls stylesheet externalization.
5. Add a single docs source of truth and point template/readme docs at it.

Instrumentation:

- Dev scopes:
  - `analog:angular:tailwind`
  - `analog:angular:tailwind:v`
  - `analog:angular:styles`
  - `analog:angular:styles:v`
  - `analog:angular:hmr`
  - `analog:angular:hmr:v`
- Build scopes:
  - `analog:angular:compiler`
  - `analog:angular:compilation-api`
  - `analog:platform:tailwind`
- Run with scoped logs to correlate wrapper-module registration with CSS update events.
- Use `apps/tailwind-debug-app` as the standing repro app and collect both obug output and Vite HMR websocket logs.

Verification:

- Unit/spec coverage in `packages/vite-plugin-angular/src/lib/angular-vite-plugin.spec.ts`.
- End-to-end dev verification in `apps/tailwind-debug-app-e2e/tests/component-css-hmr.spec.ts`.
- Template generation checks for `create-analog` and Nx-generated apps.
- Manual smoke test for:
  - component `styles`
  - component `styleUrls`
  - SCSS + Tailwind
  - prefixed Tailwind utilities

Risks / notes:

- This touches both modern and compatibility code paths. Do not “fix” only the Compilation API path and leave the legacy path divergent.
- Keep the public API stable for v3; the work should mostly be behavioral hardening, not new surface area.

### `analogjs/analog#2172` blog-app root route redirect

Root cause / working theory:

- The route generation path appears to assume a page file needs a component-like export to survive manifest generation.
- Redirect-only route metadata works in the template app but not in `apps/blog-app`, which currently uses client-side navigation as a workaround.
- The disabled e2e strongly suggests this is a route-generation/runtime interpretation bug, not a blog-app-only bug.

Desired end state:

- Redirect-only file routes are preserved in route generation.
- `apps/blog-app/src/app/pages/index.page.ts` can match the template's metadata-only redirect style.
- The blog app redirects correctly during SSR, prerendered output, and client navigation.

Execution plan:

1. Compare the generated route data for:
   - `apps/blog-app/src/app/pages/index.page.ts`
   - `packages/create-analog/template-blog/src/app/pages/index.page.ts`
2. Trace where redirect-only routes are dropped or downgraded in:
   - route discovery
   - route manifest generation
   - route codegen/runtime consumption
3. Update route-generation logic so `routeMeta.redirectTo` is sufficient for route preservation.
4. Replace the client `Router.navigateByUrl()` workaround in the blog app with metadata-only redirect config.
5. Re-enable the blocked Playwright assertion in `apps/blog-app-e2e/tests/app.spec.ts`.

Instrumentation:

- `analog:platform:routes`
- `analog:platform:typed-router`
- If runtime route output is still ambiguous, temporarily log route meta preservation at the generation boundary using existing `debugRoutes` / `debugTypedRouter`.

Verification:

- Re-enable `analogjs/analog#2172` e2e.
- Add a focused generation/regression test around redirect-only root routes.
- Verify redirect behavior in dev, build, and static preview.

Risks / notes:

- Do not “fix” this by preserving only the blog-app path. The rule must work for redirect-only file routes generically.

### `analogjs/analog#2165` `contentFileResource` prerender / hydration failure

Root cause / working theory:

- `contentFileResource()` currently builds around `injectContentFileLoader()` returning an async function, then converts its result into a signal.
- The underlying content map placeholders in `packages/content/src/lib/get-content-files.ts` are empty objects until the build/plugin replacement path runs.
- In prerender or static preview, the async loader and placeholder-replacement timing can leave the resource evaluating against an empty map, producing fallback content that never recovers correctly.

Desired end state:

- `contentFileResource()` resolves deterministically in prerender, SSR, static file-server preview, and client hydration.
- Content maps are present at the time resource params are evaluated.
- `apps/blog-app-e2e/tests/app.spec.ts` can re-enable the prerendered markdown assertion.

Execution plan:

1. Trace the full content-map path:
   - placeholder source in `packages/content/src/lib/get-content-files.ts`
   - injection provider in `packages/content/src/lib/content-file-loader.ts`
   - resource consumption in `packages/content/resources/src/content-file-resource.ts`
2. Decide whether the stable fix is:
   - making the content-file map synchronous at injection time, or
   - delaying resource evaluation until the placeholder-backed map is guaranteed ready.
3. Ensure key normalization is not masking the real failure. The current normalization logic is useful, but it does not solve empty-map timing.
4. Add integration coverage for:
   - prerender
   - static file-server hydration
   - nested content paths
5. Re-enable the blocked blog e2e and add at least one package-level spec that asserts a non-empty content map under SSR-like conditions.

Instrumentation:

- `analog:platform:content`
- `analog:nitro:prerender`
- Add targeted debug lines in the content provider path to emit:
  - number of content files injected
  - whether the map is empty at resource-evaluation time
  - normalized candidate key list for the requested slug
- Use scoped log files because this issue is timing-sensitive across build and preview phases.

Verification:

- Re-enable `apps/blog-app-e2e/tests/app.spec.ts` prerender case.
- Add content-resource specs that simulate empty and non-empty injected file maps.
- Smoke test on Nitro preview and simple file-server preview.

Risks / notes:

- Avoid layering more fallback heuristics onto an empty injected map. The fix needs to make the data available at the correct lifecycle boundary.

### `analogjs/analog#2174` pathless parent layouts and typed route collisions

Root cause / working theory:

- The typed route manifest historically collision-checked by `fullPath` too early.
- Pathless layout parents can share a `fullPath` with other structural routes while still being semantically distinct.
- The current source already has partial support via `filenameToRouteId()` and `isPathlessLayout`, so the likely remaining work is hardening and broadening regression coverage.

Desired end state:

- Pathless layout parents and their children coexist correctly in the manifest.
- Collision diagnostics only fire for real semantic collisions.
- The generated tree preserves structural parent-child relationships and canonical navigation paths.

Execution plan:

1. Audit the exact ordering in `generateRouteManifest()`:
   - filename normalization
   - `fullPath` derivation
   - collision detection
   - canonical-route selection
   - parent/child wiring
2. Make structural route identity (`id`) the source of truth during manifest assembly.
3. Delay `fullPath` canonicalization until after layout/group semantics are preserved.
4. Extend `packages/platform/src/lib/route-manifest.spec.ts` with cases for:
   - multiple root pathless layouts
   - nested pathless layouts
   - pathless layout + index child
   - app-local vs external/shared route precedence combined with pathless parents
5. Confirm generated route-tree output stays stable in watch mode.

Instrumentation:

- `analog:platform:typed-router`
- `analog:platform:routes`
- Add temporary debug snapshots for:
  - discovered files
  - pre-canonical manifest entries
  - collision decisions
  - final parent/child graph

Verification:

- Expand `route-manifest.spec.ts`.
- Run typed-route generation against at least one demo app with pathless layouts.
- Check generated `routeTree.gen.ts` diffs in watch mode.

Risks / notes:

- Be careful not to reintroduce true duplicate-route ambiguity while relaxing pathless layout handling.

### `analogjs/analog#2049` scoped CSS keyframes are not unique in dev mode

Root cause / working theory:

- The prod build path applies component-style scoping/keyframe rewriting differently than the dev externalized stylesheet path.
- In dev, wrapper modules and Vite-served CSS likely bypass or partially bypass the same transformation that prod gets.

Desired end state:

- Keyframe names are component-scoped consistently in both dev and prod.
- HMR continues to work for component styles after the fix.

Execution plan:

1. Identify where keyframe rewriting happens today in the prod path.
2. Compare that with the dev path that serves externalized component styles through the stylesheet registry.
3. Move or share the keyframe-scoping transform so both paths use the same logic.
4. Add a dedicated fixture with colliding keyframe names across multiple components.
5. Add both spec-level and e2e-level regression coverage.

Instrumentation:

- `analog:angular:styles`
- `analog:angular:styles:v`
- `analog:angular:hmr:v`
- Add debug snapshots of:
  - raw stylesheet content
  - post-transform stylesheet content
  - registry entries for the same source file

Verification:

- Extend HMR-style fixtures in `apps/tailwind-debug-app-e2e`.
- Add test(s) comparing dev-emitted CSS to build-emitted CSS for keyframe naming.

Risks / notes:

- The fix must not break sourcemaps or wrapper request mapping for CSS HMR.

### `analogjs/analog#2026` HMR reliability

Root cause / working theory:

- The current plugin has multiple fallback paths for TS, template, and stylesheet changes, but the acceptance criteria are not crisp.
- The issue comments suggest some edits should reload rather than HMR, which means part of the problem is behavioral ambiguity and part is actual nondeterminism.

Desired end state:

- The plugin deterministically chooses one of:
  - Angular component HMR update
  - CSS update
  - full reload
- Docs and tests state which edits are expected to HMR and which are expected to reload.

Execution plan:

1. Enumerate current edit classes:
   - inline template changes
   - external template changes
   - external stylesheet changes
   - TS logic changes that do not produce safe HMR metadata
2. Build an explicit outcome matrix in tests.
3. Tighten fallback logic so “no HMR payload” means immediate clear full reload, not ambiguous no-op behavior.
4. Add docs clarifying Angular's HMR limitations vs full reload expectations.

Instrumentation:

- `analog:angular:hmr`
- `analog:angular:hmr:v`
- `analog:angular:compilation-api`
- Reuse:
  - `tmp/debug/tailwind-debug-app.vite-hmr.log`
  - `tmp/debug/tailwind-debug-app.vite-ws.log`

Verification:

- Expand `packages/vite-plugin-angular/src/lib/angular-vite-plugin-live-reload.spec.ts`.
- Expand `apps/analog-app-e2e/tests/angular-compilation-api.spec.ts`.
- If needed, add one more repro app focused on TS logic edit fallbacks.

Risks / notes:

- Avoid over-promising “HMR everywhere”. Stable behavior matters more than maximizing HMR coverage.

### `analogjs/analog#2178` missing `.mjs.map` files in published packages

- Current state:
  - closeout comment posted at <https://github.com/analogjs/analog/issues/2178#issuecomment-4188529617>
  - current `alpha` build output and packed tarballs both include the referenced `.mjs.map` artifacts for `@analogjs/router` and `@analogjs/content`

Root cause / working theory:

- Build outputs reference `.mjs.map` files, but published tarballs do not include them consistently.
- The issue is likely in packaging/verification rather than the core build output itself.

Desired end state:

- Every published FESM bundle that references a sourcemap ships the matching `.map` artifact.
- CI/package verification fails before publish if a sourcemap reference points to a missing file.

Execution plan:

1. Compare local built package contents with what `npm pack` would include.
2. Confirm whether maps are missing from:
   - build output
   - `npm pack` output only
3. If the problem is packaging, update package manifest/files behavior or publish scripts.
4. Extend `tools/scripts/verify-package-artifacts.mts` to:
   - scan built JS/MJS files for `sourceMappingURL`
   - assert the referenced file exists
5. Add one smoke-release consumer check that fails fast on missing sourcemaps.

Instrumentation:

- Not primarily runtime instrumentation.
- Use `analog:nitro` / `analog:platform` only if build-path debugging becomes necessary.
- Main instrumentation is artifact inspection plus enhanced packaging assertions.

Verification:

- `npm pack` or equivalent tarball inspection for affected packages.
- Artifact verifier regression tests.
- `node tools/scripts/build-lib.mts router`
- `node tools/scripts/build-lib.mts content`
- `node tools/scripts/verify-package-artifacts.mts router content`
- `node tools/scripts/release-artifacts.mts pack`
- tarball inspection of `tmp/release-artifacts/analogjs-router-3.0.0-alpha.25.tgz`
- tarball inspection of `tmp/release-artifacts/analogjs-content-3.0.0-alpha.25.tgz`

Risks / notes:

- Do not solve this by stripping sourcemap comments unless the repo consciously decides to stop shipping maps. The better default is to ship matching maps.

### `analogjs/analog#2215` deprecation audit

Root cause / working theory:

- Several deprecated compatibility aliases and stale docs remain across packages.
- v3 stable needs a deliberate story for what survives as compatibility and what is removed.

Desired end state:

- A single deprecation matrix exists for v3 stable.
- Deprecated exports/options are either removed, explicitly documented, or intentionally retained with a sunset note.

Execution plan:

1. Build a deprecation inventory from source comments and public docs.
2. Classify each item:
   - remove in v3
   - keep in v3 with compatibility note
   - keep until v3.x with warning/docs
3. Update package docs and `apps/docs-app/docs/guides/migrating.md`.
4. Add tests for remaining compatibility aliases if they are intentionally kept.

Instrumentation:

- Mostly static analysis.
- For option aliases that remain, use existing package debug scopes to confirm the canonical path is used internally.

Verification:

- `rg '@deprecated'` inventory checked against public docs.
- Migration guide updated in the same PR series.

Risks / notes:

- Removing aliases without migration notes will create unnecessary breakage perception.

### `analogjs/analog#2127` remaining maintainer follow-ups

Root cause / working theory:

- This is a tracker issue, not a single bug. The release-relevant pieces are:
  - SSR query param forwarding
  - `@standard-schema/spec` consumer story
  - `defineServerRoute` API cleanup

Desired end state:

- The correctness/API debt from the merged server-route/TanStack work is resolved without broadening v3 scope.

Execution plan:

1. Split the issue into three execution subtracks in the eventual implementation:
   - `requestContextInterceptor` fix
   - published type dependency strategy
   - `defineServerRoute` mutual-exclusivity cleanup
2. For `requestContextInterceptor`, merge `req.params` into the Nitro fetch param object rather than forcing URL-embedded workarounds.
3. For the Standard Schema dependency, choose one strategy and make it enforceable:
   - regular dependency/peer surface
   - emitted type inlining/elision
4. For `defineServerRoute`, enforce exclusivity with types first and runtime warning second.

Instrumentation:

- `analog:nitro:ssr`
- `analog:platform:routes`
- Add temporary debug snapshots for server-route request forwarding:
  - original Angular request params
  - Nitro fetch params
  - final resolved URL

Verification:

- Restore stricter e2e assertions mentioned in the issue comments.
- Add package-level type tests for `defineServerRoute`.

Risks / notes:

- Keep the tracker issue split in code changes. One giant PR will be hard to review.

### `analogjs/analog#1939` migration guide

- Current state:
  - branch `docs/1939-v3-migration-guide`
  - draft PR: [analogjs/analog#2240](https://github.com/analogjs/analog/pull/2240)
  - the guide now includes a focused v3 migration checklist for Angular version support, removed SFC support, explicit content highlighter setup, Astro Angular's Angular 20 zoneless baseline, and the legacy `setup-vitest` import migration

Root cause / working theory:

- There is no current stable-grade migration narrative for the v2 to v3 surface.
- Existing issue comments already show confusion around content/highlighter config and testing setup.

Desired end state:

- One canonical migration guide that covers the real changes users will hit when moving to v3 stable.

Execution plan:

1. Structure the guide by migration area:
   - testing setup (`@analogjs/vitest-angular`)
   - content/highlighter setup
   - typed routes
   - Tailwind/HMR options
   - deprecations removed or renamed
2. Add “before / after” snippets taken from real templates in the repo.
3. Link directly to stable docs for each feature area.

Instrumentation:

- No runtime instrumentation.
- Validate examples by running the relevant generators/templates or smoke apps.

Verification:

- Docs review against `IssuesInventoryTodo.md`.
- Cross-check with template and example app current state.
- `pnpm nx build docs-app`

Risks / notes:

- The guide must not describe planned behavior as if it already shipped. Land it only after blocker behavior is settled.

## Should Fix Before Stable

### `analogjs/analog#2222` Vitest 4 isolation regression

Root cause / working theory:

- `setupTestBed()` relies on a global singleton init path plus Angular cleanup hooks, which may not be sufficient under Vitest 4's worker and environment lifecycle behavior.

Desired end state:

- TestBed cleanup is deterministic across Vitest 4 CI runs and project/test ordering.

Execution plan:

1. Build a minimal repo-local regression in `tests/vitest-angular`.
2. Decide whether the fix is:
   - more aggressive teardown/reset
   - one-time init plus per-test state cleanup
   - changed browser/project config expectations
3. Add CI-like ordering and isolation tests.

Instrumentation:

- Add temporary debug traces around setup/cleanup boundaries in `setup-testbed.ts`.
- Runtime `obug` is not heavily used in this package today, so lightweight internal logging in tests is acceptable.

Verification:

- New regression project in `tests/vitest-angular`.
- Run with `isolate: false` and CI-like ordering.

Risks / notes:

- Avoid “fixes” that force expensive full re-init on every test unless necessary.

### `analogjs/analog#2220` snapshot whitespace cleanup

Root cause / working theory:

- Snapshot serialization preserves trailing whitespace and blank lines created by Angular DOM/comment serialization.

Desired end state:

- Snapshot output is stable under formatting tools and omits obvious whitespace noise.

Execution plan:

1. Normalize serialized output in the snapshot serializer chain after Angular fixture rendering.
2. Trim trailing whitespace line-by-line.
3. Collapse repeated empty lines where serializer artifacts are the source.

Instrumentation:

- No runtime obug needed.
- Add serializer test fixtures with deliberate whitespace edge cases.

Verification:

- Extend `tests/vitest-angular/src/snapshot-serializers`.
- Include inline-snapshot behavior in at least one test.

Risks / notes:

- Do not over-normalize and accidentally change meaningful text formatting.

### `analogjs/analog#2218` snapshot unstable ids / `aria-describedby`

Root cause / working theory:

- The current attribute-cleaning regexes are too narrow for real-world generated ids from CDK/Ngb-style libraries.

Desired end state:

- Generated ids and related ARIA attributes are stripped when they are framework-generated noise, but user-authored stable ids remain.

Execution plan:

1. Expand `attributesToClean` patterns in `no-ng-attributes.ts`.
2. Add separate tests for:
   - generated `id`
   - `for`
   - `aria-describedby`
   - retained user ids

Instrumentation:

- No runtime obug needed.

Verification:

- Serializer unit tests with representative DOM fixtures.

Risks / notes:

- The regexes must not strip semantically important, user-authored ids.

### `analogjs/analog#2173` broken legacy `setup-vitest` dependency path

Root cause / working theory:

- The intended package is now `@analogjs/vitest-angular`, but users can still hit old guidance or old imports.

Desired end state:

- Legacy setup imports either migrate cleanly or fail with an intentional path forward.

Execution plan:

1. Decide whether the old export should remain in v3 at all.
2. If retained, ensure its dependency story is correct.
3. If removed, make the migration executable and update all docs/generators.

Instrumentation:

- No runtime obug needed.
- Migration/test fixtures should assert the rewritten import path.

Verification:

- Migration spec coverage.
- Docs and generator template audit.

Risks / notes:

- Silent breakage of the legacy path is worse than either a supported alias or a clean removal.

### `analogjs/analog#2185` release lockfile regeneration

Root cause / working theory:

- `pnpm-lock.yaml` is now committed, but version replacement alone does not regenerate it.

Desired end state:

- Release commits always include the correctly regenerated lockfile.

Execution plan:

1. Add a lockfile regeneration step after version replacement and before the git-commit step.
2. Keep the regeneration cheap (`pnpm install --lockfile-only` or equivalent).
3. Add a release-config test or dry-run check if practical.

Instrumentation:

- No runtime obug needed.
- Use release dry-run logs and file-diff assertions.

Verification:

- Dry-run semantic-release or equivalent local script path.
- Confirm clean git state after version bump automation.

Risks / notes:

- Avoid adding a step that mutates unrelated workspace state during release.

### `analogjs/analog#2074` Storybook `componentWrapperDecorator`

Root cause / working theory:

- `packages/storybook-angular/src/lib/testing.ts` currently omits `applyDecorators` from the render annotations it passes through.

Desired end state:

- Storybook decorators applied in Vitest-backed rendering behave the same as expected Storybook runtime behavior.

Execution plan:

1. Add `applyDecorators` to the forwarded annotation object.
2. Add a small regression spec around `componentWrapperDecorator`.

Instrumentation:

- Minimal or none; this is not a runtime-debug-heavy issue.

Verification:

- Focused unit/spec coverage.

Risks / notes:

- Keep the fix narrow; this does not need framework-wide refactoring.

### `analogjs/analog#2029` Mermaid / Shiki OOM avoidance

Root cause / working theory:

- The current docs and content setup encourage a path where Mermaid content is still expensive in the highlighting/build pipeline.

Desired end state:

- Users can explicitly exclude Mermaid or other heavy languages from server-side/highlighter processing.

Execution plan:

1. Add `skipLangs` or equivalent filter support in the relevant content highlighter path.
2. Update docs to recommend client-only Mermaid loading as the safe default.

Instrumentation:

- `analog:platform:content`
- If build performance diagnostics are needed, add temporary timing logs around highlighter invocation.

Verification:

- Content package tests for skipped-language behavior.
- Docs update and manual memory-sensitive smoke test.

Risks / notes:

- Keep the API generic enough to support more than Mermaid.

### `analogjs/analog#2159` remove `.agx` references

Root cause / working theory:

- Old experiment references remain in docs/history.

Desired end state:

- No public-facing docs or current guidance references `.agx`.

Execution plan:

1. `rg 'agx'` across repo.
2. Remove or contextualize historical references.

Instrumentation:

- None.

Verification:

- `rg 'agx'` returns only truly historical/internal context that is acceptable.

Risks / notes:

- Avoid rewriting historical changelog context if the wording is still needed; prefer clarifying that the feature is removed.

### `analogjs/analog#2076` remove `standalone: true` from modern docs/examples

Root cause / working theory:

- Docs and some generator examples still present `standalone: true` as normal modern usage, even though newer Angular versions no longer need it.

Desired end state:

- Current docs reflect modern Angular style while compatibility templates remain correct for older versions.

Execution plan:

1. Audit docs/examples.
2. Keep Angular-version-specific templates accurate.
3. Update snapshots/tests for generators where output changes.

Instrumentation:

- None.

Verification:

- Docs diff audit.
- Generator snapshot updates.

Risks / notes:

- Do not break older template targets in the name of modernizing docs.

### `analogjs/analog#2036` AI integrations docs

Root cause / working theory:

- Docs site has supporting machinery but no actual user-facing section.

Desired end state:

- One concrete integrations page that points to stable, supported guidance.

Execution plan:

1. Add a docs page under integrations or guides.
2. Link it from navigation/search.
3. Keep it opinionated and bounded to supported examples.

Instrumentation:

- None for docs itself.
- Validate any runnable examples separately.

Verification:

- Docs build and link checks.

Risks / notes:

- Avoid promising an “AI framework” surface in Analog that does not exist.

## Verify Fixed And Close

### `analogjs/analog#2177` HTTP/2 pseudo-header crash

Root cause / working theory:

- Already addressed by filtering `:` pseudo-headers in `toWebHeaders()`.

Desired end state:

- The issue can be closed with a regression test.

Execution plan:

1. Add/confirm a test that feeds pseudo-headers into `toWebHeaders()`.
2. Verify no regression in normal header handling.

Instrumentation:

- `analog:nitro`

Verification:

- Unit test only.

Risks / notes:

- Close only after the test lands.

### `analogjs/analog#2168` schematic compatibility

Root cause / working theory:

- Source layout looks fixed, but published-package behavior still needs confirmation.

Desired end state:

- Close with confidence that published packages resolve Angular schematics correctly.

Execution plan:

1. Validate built output manifests.
2. Add/confirm artifact tests for generators/compat paths.

Instrumentation:

- Not a runtime issue.

Verification:

- Build output + manifest checks.

Risks / notes:

- Do not rely only on source-tree shape; verify dist behavior.

### `analogjs/analog#2044` typed-routing umbrella

Root cause / working theory:

- Core feature is landed; remaining work is hardening and closing follow-ups.

Desired end state:

- Close after `analogjs/analog#2174` and remaining typed-route hardening are complete.

Execution plan:

1. Treat this as a closeout/meta issue.
2. Close only after manifest correctness, watch-mode stability, and docs are acceptable.

Instrumentation:

- `analog:platform:typed-router`

Verification:

- Typed-route specs + generated-output smoke tests.

Risks / notes:

- Do not close prematurely while structural route bugs remain open.

### `analogjs/analog#2092` OXC tooling

Root cause / working theory:

- The repo has already moved substantially toward OXC.

Desired end state:

- Either close or re-scope narrowly to generator defaults.

Execution plan:

1. Confirm what remains unimplemented.
2. If only generator defaults remain, spin that into a new smaller issue.

Instrumentation:

- None.

Verification:

- Check root tooling and generated app defaults.

Risks / notes:

- Avoid leaving a vague umbrella issue open when the repo work is functionally done.

## Defer To v3.1+

### `analogjs/analog#2227` Style Dictionary support

Root cause / working theory:

- This is more a platform-boundary/API-design question than a stabilization task.

Desired end state:

- Revisit after the stylesheet pipeline is fully stable.

Execution plan:

1. Do not implement during v3 stabilization.
2. After stable, decide whether this belongs in core or as a plugin/integration package.

Instrumentation:

- If revisited later, use `analog:platform:tailwind` and `analog:angular:styles`.

Verification:

- Future RFC/prototype only.

Risks / notes:

- High API-surface and maintenance-risk if rushed into v3.

### `analogjs/analog#2213` Astro Angular hydration reuse

Root cause / working theory:

- The current Astro client path mounts fresh application instances rather than hydrating the existing DOM.

Desired end state:

- Optional hydration-aware island bootstrapping with safe fallback.

Execution plan:

1. Continue work on draft [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212).
2. Reduce coupling to Angular internals if possible.
3. Keep behind an explicit experimental flag.

Instrumentation:

- Add package-local debug scopes if this work is resumed; none exist yet.
- For now, rely on targeted tests and browser verification.

Verification:

- `astro-angular` package tests plus demo app hydration scenarios.

Risks / notes:

- Internal Angular coupling is the biggest blocker here.

### `analogjs/analog#2189` runtime i18n

Root cause / working theory:

- Broad feature spanning router, content, Nitro, and route generation.

Desired end state:

- Smaller phased roadmap rather than one mega-PR.

Execution plan:

1. Phase 1: locale detection/routing contract.
2. Phase 2: translation loading/runtime provider surface.
3. Phase 3: prerender/sitemap/content expansion.

Instrumentation:

- Future work would use `analog:platform:routes`, `analog:nitro:prerender`, and `analog:platform:content`.

Verification:

- Future milestone work.

Risks / notes:

- Too broad for stabilization.

### `analogjs/analog#2175` Vite Plugin Registry compatibility

Root cause / working theory:

- Missing peer metadata for `vite`.

Desired end state:

- Small metadata improvement.

Execution plan:

1. Add optional `vite` peer dependency metadata.
2. Document supported versions clearly.

Instrumentation:

- None.

Verification:

- Package metadata inspection only.

Risks / notes:

- Keep low priority.

### `analogjs/analog#2158` MD / MDX / MDC performance

Root cause / working theory:

- This is future-facing renderer/performance architecture work.

Desired end state:

- Post-stable performance roadmap with experiments isolated from core stabilization.

Execution plan:

1. Preserve current merged foundations.
2. Split future work into renderer-specific milestones.

Instrumentation:

- `analog:platform:content`
- Add timing/logging around renderer selection if resumed.

Verification:

- Future milestone work.

Risks / notes:

- Do not combine with `analogjs/analog#2165`.

### `analogjs/analog#2068` Storybook SCSS build issue

Root cause / working theory:

- Still ambiguous without a repro. Current code already injects styles and load paths.

Desired end state:

- Either a real repro-backed bug fix or clearer docs.

Execution plan:

1. Treat docs/support cleanup as the near-term work.
2. If a repro arrives, inspect preview transform and path resolution.

Instrumentation:

- Limited runtime instrumentation is likely enough; Storybook package has no established obug scopes.

Verification:

- Docs checks now; bug fix later if repro exists.

Risks / notes:

- Do not spend stabilization time chasing an unreproduced report.

### `analogjs/analog#2039` docs site accessibility/hosting

Root cause / working theory:

- Likely deployment/infrastructure rather than framework code.

Desired end state:

- Operational resolution outside the v3 code gate.

Execution plan:

1. Confirm deployment/proxy rules.
2. Only patch repo config if the problem is actually base-url/build-output related.

Instrumentation:

- None in repo runtime.

Verification:

- External deployment validation.

Risks / notes:

- Keep outside the framework stabilization path unless proven repo-caused.

### `analogjs/analog#2038` docs migration to Astro/Starlight

Root cause / working theory:

- Strategic docs-platform change, explicitly on hold.

Desired end state:

- Post-stable docs-platform migration plan.

Execution plan:

1. Do nothing during v3 stabilization except keep the issue linked from future planning.

Instrumentation:

- None.

Verification:

- Future project work.

Risks / notes:

- Not appropriate for the stable-release window.

### `analogjs/analog#2035` Nitro v3 plugin migration

Root cause / working theory:

- Large architecture migration with active open PR [analogjs/analog#2188](https://github.com/analogjs/analog/pull/2188).

Desired end state:

- Decide after v3 stable whether to finish the migration or stage it for v3.1+.

Execution plan:

1. Keep `analogjs/analog#2188` out of the v3 GA critical path.
2. If resumed later, split it into:
   - Nitro orchestration
   - SSR build behavior
   - renderer/module integration

Instrumentation:

- `analog:nitro`
- `analog:nitro:ssr`
- `analog:nitro:prerender`

Verification:

- Future PR validation path.

Risks / notes:

- This is exactly the kind of architecture churn that should not land late in stabilization.

---

## Resolution Ledger And Difficulty Scores

I previously treated a trailing technical-plan draft as structurally duplicate because it repeated the same issue-by-issue execution guidance already merged into the main plan sections above. That should not be read as permission to lose information: if any wording, ordering, or appendix context from that draft is still useful, it should remain in `Issues.md` as retained historical context rather than being discarded.

### Cache Deletion Gate

Do not delete `.codex-tmp/issues/*` until these conditions are true:

1. The active issue numbers, linked PRs, and canonical comment targets below remain sufficient for GitHub closeout work.
2. Any in-flight implementation PRs have been opened or the intended PR linkage is documented in the relevant issue.
3. We are comfortable using `Issues.md` as the sole planning ledger.

I have not deleted `.codex-tmp/issues/*` in this pass.

### Default GitHub Closeout Workflow

For every issue, unless noted otherwise:

1. Land a focused PR.
2. Post a fresh issue comment with the fix summary, test evidence, and PR link.
3. Close the issue from the PR or manually after merge.

### Difficulty Scale

- `1-2`: metadata/docs/simple packaging cleanup
- `3-4`: contained implementation or regression-test work
- `5-6`: medium cross-file work with some behavioral risk
- `7-8`: substantial cross-package stabilization work
- `9-10`: architecture-heavy or broad feature work

### Per-Issue Resolution Ledger

Branch tracking convention:

- `Base branch` is always `analogjs/alpha` unless explicitly changed later.
- `Issues.md` itself is maintained on local branch `feat/resolve-all-issues` and is not intended for remote push.
- Each issue gets a dedicated implementation branch even before work starts, so ownership and PR slicing stay explicit.
- If work already exists on a PR branch, keep the real branch name instead of replacing it with a planned name.

Status convention:

- `Planned`: branch reserved, work not started
- `In progress`: active implementation or investigation
- `Blocked`: waiting on prerequisite, maintainer decision, or external repro
- `Verify and close`: looks fixed, needs regression proof and GitHub closeout
- `Deferred`: intentionally out of v3 stable scope
  | Issue | Status | Difficulty | Implementation branch | Base branch | GitHub update target once solved | Notes |
  | --- | --- | ---: | --- | --- | --- | --- |
  | `analogjs/analog#2229` | Planned | 8 | `feat/2229-stylesheet-pipeline` | `analogjs/alpha` | Issue closeout comment; possibly update or close draft [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204) as docs follow-up | [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204) is docs-only now; implementation history points at [analogjs/analog#2226](https://github.com/analogjs/analog/pull/2226) |
  | `analogjs/analog#2172` | Planned | 4 | `fix/2172-blog-root-redirect` | `analogjs/alpha` | Issue closeout comment | Re-enable blocked e2e in the fixing PR |
  | `analogjs/analog#2165` | Planned | 8 | `fix/2165-content-resource-prerender-hydration` | `analogjs/alpha` | Issue closeout comment | Preserve thread context from <https://github.com/analogjs/analog/issues/2165#issuecomment-4107403358> |
  | `analogjs/analog#2174` | Planned | 7 | `fix/2174-pathless-layout-typed-routes` | `analogjs/alpha` | Issue closeout comment | Typed-routes hardening item |
  | `analogjs/analog#2049` | Planned | 8 | `fix/2049-dev-keyframe-scoping` | `analogjs/alpha` | Issue closeout comment | Dev/prod stylesheet parity bug |
  | `analogjs/analog#2026` | Planned | 7 | `fix/2026-angular-hmr-reload-matrix` | `analogjs/alpha` | Issue closeout comment with explicit HMR vs reload matrix | Canonical thread endpoint: <https://github.com/analogjs/analog/issues/2026#issuecomment-3677561130> |
  | `analogjs/analog#2178` | Pending Close (Completed) | 5 | `fix/2178-missing-mjs-sourcemaps` | `analogjs/alpha` | Issue closeout comment | Closeout comment posted at <https://github.com/analogjs/analog/issues/2178#issuecomment-4188529617>; current `alpha` build and packed tarballs include the `.mjs.map` artifacts |
  | `analogjs/analog#2215` | Planned | 4 | `chore/2215-deprecation-audit` | `analogjs/alpha` | Issue closeout comment plus docs/migration references | Deprecation audit is repo-wide but contained |
  | `analogjs/analog#2127` | Planned | 6 | `fix/2127-router-followups` | `analogjs/alpha` | Tracker issue comment, and possibly issue body refresh if it remains active | Current tracker comment: <https://github.com/analogjs/analog/issues/2127#issuecomment-4187640151> |
  | `analogjs/analog#1939` | In progress | 3 | `docs/1939-v3-migration-guide` | `analogjs/alpha` | Issue closeout comment with final migration-guide URL | Draft PR: [analogjs/analog#2240](https://github.com/analogjs/analog/pull/2240) |
  | `analogjs/analog#2222` | Planned | 7 | `fix/2222-vitest-isolation` | `analogjs/alpha` | Issue closeout comment | Latest thread endpoint: <https://github.com/analogjs/analog/issues/2222#issuecomment-4183839053> |
  | `analogjs/analog#2220` | In progress | 3 | `fix/2220-snapshot-whitespace` | `analogjs/alpha` | Issue closeout comment | Draft PR: [analogjs/analog#2237](https://github.com/analogjs/analog/pull/2237) |
  | `analogjs/analog#2218` | Planned | 4 | `fix/2218-snapshot-generated-ids` | `analogjs/alpha` | Issue closeout comment | Serializer cleanup |
  | `analogjs/analog#2173` | In progress | 3 | `fix/2173-setup-vitest-legacy-path` | `analogjs/alpha` | Issue closeout comment | Draft PR: [analogjs/analog#2235](https://github.com/analogjs/analog/pull/2235). Covers both `ng update` and `nx migrate` for the legacy import path, and stops stale `setup-vitest` artifacts from being republished |
  | `analogjs/analog#2185` | Closed upstream | 2 | `fix/2185-release-lockfile-regeneration` | `analogjs/alpha` | None | Issue was closed upstream before a branch was carried forward |
  | `analogjs/analog#2074` | In progress | 4 | `fix/2074-storybook-component-wrapper-decorator` | `analogjs/alpha` | Issue closeout comment | Draft PR: [analogjs/analog#2236](https://github.com/analogjs/analog/pull/2236). Re-applies the `beta` fix from [analogjs/analog#2086](https://github.com/analogjs/analog/pull/2086) onto `alpha` with regression coverage |
  | `analogjs/analog#2029` | Planned | 5 | `fix/2029-mermaid-shiki-oom` | `analogjs/alpha` | Issue closeout comment and docs link | Latest repro/investigation endpoint: <https://github.com/analogjs/analog/issues/2029#issuecomment-4046690307> |
  | `analogjs/analog#2159` | Pending Close (Completed) | 2 | `docs/2159-remove-agx-references` | `analogjs/alpha` | Issue closeout comment | Branch was later repurposed for `analogjs/analog#2168`, so this now needs a maintainer closeout note rather than a dedicated PR |
  | `analogjs/analog#2076` | Planned | 2 | `docs/2076-remove-standalone-true` | `analogjs/alpha` | Issue closeout comment | Existing volunteer comment: <https://github.com/analogjs/analog/issues/2076#issuecomment-3935674971> |
  | `analogjs/analog#2036` | Pending Close (Completed) | 2 | `docs/2036-ai-integrations` | `analogjs/alpha` | Issue closeout comment with docs URL | Draft PR: [analogjs/analog#2234](https://github.com/analogjs/analog/pull/2234) |
  | `analogjs/analog#2177` | In progress | 1 | `chore/2177-verify-http2-pseudo-headers` | `analogjs/alpha` | Issue closeout comment explicitly saying current code was verified | Draft PR: [analogjs/analog#2233](https://github.com/analogjs/analog/pull/2233) |
  | `analogjs/analog#2168` | In progress | 2 | `docs/2159-remove-agx-references` | `analogjs/alpha` | Issue closeout comment explicitly saying current package shape/published behavior was verified | Repurposed onto draft PR: [analogjs/analog#2231](https://github.com/analogjs/analog/pull/2231) |
  | `analogjs/analog#2044` | Verify and close | 6 | `chore/2044-typed-routing-umbrella-closeout` | `analogjs/alpha` | Issue closeout comment referencing the prior typed-routes status update | Canonical comment: <https://github.com/analogjs/analog/issues/2044#issuecomment-4107833684> |
  | `analogjs/analog#2092` | Pending Close (Completed) | 2 | `chore/2092-oxc-followup-closeout` | `analogjs/alpha` | Issue closeout or re-scope comment referencing the OXC summary comment | Closeout comment posted at <https://github.com/analogjs/analog/issues/2092#issuecomment-4188471667>; maintainer close still required |
  | `analogjs/analog#2227` | Deferred | 8 | `feat/2227-style-dictionary-support` | `analogjs/alpha` | Issue comment only unless feature is actively implemented | Latest design discussion endpoint: <https://github.com/analogjs/analog/issues/2227#issuecomment-4187347062> |
  | `analogjs/analog#2213` | In progress | 8 | `ng-client-hydration` | `analogjs/alpha` | Update issue and draft [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212) | Active WIP is [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212) |
  | `analogjs/analog#2189` | Deferred | 9 | `feat/2189-runtime-i18n-localize` | `analogjs/alpha` | Issue comment only unless scope becomes active | Broad cross-package feature |
  | `analogjs/analog#2175` | Deferred | 1 | `chore/2175-vite-plugin-registry-metadata` | `analogjs/alpha` | Issue closeout or defer comment | Existing maintainer directive: <https://github.com/analogjs/analog/issues/2175#issuecomment-4166726621> |
  | `analogjs/analog#2158` | Deferred | 8 | `feat/2158-content-rendering-performance` | `analogjs/alpha` | Issue comment only unless moved into active scope | Canonical context endpoint: <https://github.com/analogjs/analog/issues/2158#issuecomment-4107088995> |
  | `analogjs/analog#2068` | Blocked | 6 | `fix/2068-storybook-scss-build` | `analogjs/alpha` | Issue comment only unless a real repro/fix lands | Latest thread endpoint: <https://github.com/analogjs/analog/issues/2068#issuecomment-4061779661> |
  | `analogjs/analog#2039` | Blocked | 2 | `chore/2039-docs-hosting-investigation` | `analogjs/alpha` | Issue comment only unless hosting fix is done alongside release work | Likely operational rather than code-level |
  | `analogjs/analog#2038` | Deferred | 7 | `feat/2038-docs-platform-migration` | `analogjs/alpha` | Issue comment if resumed; otherwise leave open as on hold | Maintainer on-hold comment: <https://github.com/analogjs/analog/issues/2038#issuecomment-4107135282> |
  | `analogjs/analog#2035` | Deferred | 9 | `feat/investigate-nitro-vite-plugin` | `analogjs/alpha` | Update issue and open [analogjs/analog#2188](https://github.com/analogjs/analog/pull/2188) | Architecture-heavy migration; not v3 GA scope |

### Open PRs That Need Explicit Handling Later

- [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212)
  Linked to `analogjs/analog#2213`. If the feature lands, update this PR and close the issue from it. If the feature stays deferred, add a scope comment on both the issue and the PR.

- [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204)
  References `analogjs/analog#2229` and `analogjs/analog#2227`, but is currently docs-only. Do not treat it as implementation progress for either issue without a fresh code PR.

- [analogjs/analog#2188](https://github.com/analogjs/analog/pull/2188)
  Linked to `analogjs/analog#2035`. Keep this explicitly out of the v3 stable gate unless the release scope changes.

### Comment URLs Worth Keeping Even If The Cache Is Deleted

- `analogjs/analog#2127`: <https://github.com/analogjs/analog/issues/2127#issuecomment-4187640151>
- `analogjs/analog#2044`: <https://github.com/analogjs/analog/issues/2044#issuecomment-4107833684>
- `analogjs/analog#2038`: <https://github.com/analogjs/analog/issues/2038#issuecomment-4107135282>
- `analogjs/analog#2035`: <https://github.com/analogjs/analog/issues/2035#issuecomment-4127412595>
- `analogjs/analog#2092`: <https://github.com/analogjs/analog/issues/2092#issuecomment-4062220933>
- `analogjs/analog#2029`: <https://github.com/analogjs/analog/issues/2029#issuecomment-4046690307>
- `analogjs/analog#2026`: <https://github.com/analogjs/analog/issues/2026#issuecomment-3677561130>
- `analogjs/analog#1939`: <https://github.com/analogjs/analog/issues/1939#issuecomment-3536712188>
- `analogjs/analog#2173`: <https://github.com/analogjs/analog/issues/2173#issuecomment-4119092949>
- `analogjs/analog#2175`: <https://github.com/analogjs/analog/issues/2175#issuecomment-4166726621>
- `analogjs/analog#2165`: <https://github.com/analogjs/analog/issues/2165#issuecomment-4107403358>
- `analogjs/analog#2222`: <https://github.com/analogjs/analog/issues/2222#issuecomment-4183839053>
- `analogjs/analog#2074`: <https://github.com/analogjs/analog/issues/2074#issuecomment-3963819693>
- `analogjs/analog#2068`: <https://github.com/analogjs/analog/issues/2068#issuecomment-4061779661>
- `analogjs/analog#2227`: <https://github.com/analogjs/analog/issues/2227#issuecomment-4187347062>
- `analogjs/analog#2158`: <https://github.com/analogjs/analog/issues/2158#issuecomment-4107088995>
- `analogjs/analog#2076`: <https://github.com/analogjs/analog/issues/2076#issuecomment-3935674971>

---

## Retained Historical Draft Appendix

The section below is preserved verbatim from the earlier merged technical-plan draft. It is intentionally redundant with parts of the canonical execution plan above, but it remains in this document so no prior planning context, phrasing, or issue-by-issue detail is lost.

## Additional Technical Notes

Analog already has an `obug`-based debug convention and file-log harness:

- `analog:angular:*` in `packages/vite-plugin-angular/src/lib/utils/debug.ts`
- `analog:platform:*` in `packages/platform/src/lib/utils/debug.ts`
- `analog:nitro:*` in `packages/vite-plugin-nitro/src/lib/utils/debug.ts`
- optional scoped logs under `tmp/debug/` via `debug.logFile: 'scoped'`

Use these first:

```ts
analog({
  debug: [
    {
      scopes: ['analog:platform:typed-router'],
      mode: 'build',
      logFile: 'scoped',
    },
    {
      scopes: ['analog:angular:hmr', 'analog:angular:styles:v'],
      mode: 'dev',
      logFile: 'scoped',
    },
    {
      scopes: ['analog:nitro:ssr', 'analog:nitro:prerender'],
      mode: 'build',
      logFile: 'scoped',
    },
  ],
});
```

Or via environment variables:

```bash
DEBUG=analog:* pnpm dev
DEBUG=analog:platform:typed-router,analog:nitro:prerender pnpm build
```

When an area has no current logger, the plan below calls out the exact `createDebug()` scope to add.

## Workstream A: Angular CSS / HMR / Stylesheet Pipeline

### analogjs/analog#2229 Refactor stylesheet pipeline / Tailwind v4 / HMR

- Root cause analysis:
  - The old behavior coupled `liveReload`, externalized component styles, and dev-only HMR assumptions.
  - The current alpha code already moved toward a real stylesheet registry, but the work is still spread across `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts`, `packages/vite-plugin-angular/src/lib/host.ts`, `packages/vite-plugin-angular/src/lib/stylesheet-registry.ts`, `packages/platform/src/lib/options.ts`, `packages/create-analog/index.js`, and `packages/nx-plugin/src/generators/app/lib/add-tailwind-helpers.ts`.
  - Generator output, docs, and plugin runtime all need to agree on the same Tailwind v4 integration story.
- Desired end result:
  - `hmr` is the first-class option.
  - `liveReload` remains a compatibility alias only.
  - externalized component styles are a framework-owned pipeline that works independently of HMR.
  - Tailwind v4 component stylesheet handling is deterministic in dev and build.
  - CLI and Nx generators scaffold the same supported path.
- Implementation plan:
  - Audit the option flow from `analog()` to `platformPlugin()` to `angular()` and remove any remaining behavior where HMR toggles stylesheet externalization.
  - Collapse component stylesheet bookkeeping onto `stylesheet-registry.ts` as the single source of truth.
  - Keep raw source-to-request-id mapping stable enough for CSS HMR and source lookup.
  - Align `create-analog` and Nx app generation so both install `@tailwindcss/vite`, write the same root stylesheet import, and generate the same Tailwind/PostCSS support files.
  - Update package docs to point at the unified path rather than mixed generator-specific guidance.
- Instrumentation:
  - Enable `analog:angular:tailwind`, `analog:angular:styles`, `analog:angular:styles:v`, `analog:angular:hmr`, and `analog:angular:hmr:v`.
  - Use `logFile: 'scoped'` so `tmp/debug/analog.angular.styles.log` and `tmp/debug/analog.angular.hmr.log` can be diffed across edits.
  - For generator alignment, add temporary `createDebug('analog:platform:tailwind')` callsites around template emission if scaffold drift is suspected.
- Regression tests:
  - expand `packages/vite-plugin-angular/src/lib/angular-vite-plugin.spec.ts`
  - expand `apps/tailwind-debug-app-e2e/tests/component-css-hmr.spec.ts`
  - add generator tests in Nx/create-analog that assert the same Tailwind plugin/import/postcss output
- Risks:
  - the dev/build pipeline may diverge silently if resolve/load/transform hooks are not tested as a full chain
  - generator updates can accidentally regress Angular version-specific templates
- Open PR context:
  - draft [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204) is now docs-only and should not be treated as the implementation vehicle
  - implementation history already flowed through [analogjs/analog#2226](https://github.com/analogjs/analog/pull/2226)

### analogjs/analog#2049 Scoped CSS keyframes are not unique in dev mode

- Root cause analysis:
  - prod and dev use different stylesheet handling paths
  - the dev path externalizes component styles for Vite processing and HMR, which makes it easy to lose Angular’s normal style rewriting semantics
  - the likely failure point is between `host.ts`, stylesheet preprocessing, and the served external stylesheet module in `angular-vite-plugin.ts`
- Desired end result:
  - component-scoped keyframes are rewritten consistently in dev and prod
  - no visual behavior changes when switching from `pnpm dev` to built output
- Implementation plan:
  - trace how keyframe names appear in raw source, preprocessed CSS, registry snapshots, and served wrapper CSS
  - compare Angular’s emitted style text when inline vs externalized
  - if the registry path bypasses a rewrite step, move that rewrite into the common stylesheet pipeline before wrapper-module serving
  - add a focused e2e fixture with two components using the same keyframe name to prove scoping
- Instrumentation:
  - `analog:angular:styles`, `analog:angular:styles:v`
  - if needed, add a temporary verbose logger around keyframe rewrite output in `stylesheet-registry.ts`
  - capture scoped logs while editing a component stylesheet in `tailwind-debug-app`
- Regression tests:
  - unit test a CSS sample with colliding keyframe names
  - add an e2e assertion that the browser sees unique keyframe names in dev
- Risks:
  - fixing only the wrapper CSS path may leave inline/JIT CSS inconsistent

### analogjs/analog#2026 HMR is not working

- Root cause analysis:
  - the issue thread mixes true HMR expectations with legitimate full-reload cases for TS logic changes
  - the plugin already has complex decision points around invalidation, ownership lookup, Angular template updates, and direct CSS updates
  - the gap is likely a combination of unsupported TS-change cases plus unclear acceptance criteria
- Desired end result:
  - supported template/style edits HMR cleanly
  - unsupported TS logic edits always trigger reliable full reload instead of ambiguous no-op behavior
  - docs explain the boundary clearly
- Implementation plan:
  - formalize a support matrix: template edits, external template edits, inline styles, external styles, TS metadata edits, TS logic-only edits
  - encode that matrix in tests before changing runtime logic
  - make fallback-to-full-reload explicit whenever component update code is absent or ownership cannot be resolved safely
  - document the support matrix in debugging/HMR docs
- Instrumentation:
  - `analog:angular:hmr`, `analog:angular:hmr:v`, `analog:angular:compilation-api`, `analog:angular:compiler:v`
  - use `tmp/debug/analog.angular.hmr.log` to trace which branch each edit takes
  - keep `tailwind-debug-app` websocket/HMR side logs for browser/server correlation
- Regression tests:
  - extend `packages/vite-plugin-angular/src/lib/angular-vite-plugin-live-reload.spec.ts`
  - add explicit e2e cases in `apps/analog-app-e2e/tests/angular-compilation-api.spec.ts`
- Risks:
  - an over-aggressive HMR path can leave stateful components partially updated and harder to debug than a full reload

### analogjs/analog#2175 Vite Plugin Registry compatibility metadata

- Root cause analysis:
  - `packages/vite-plugin-angular/package.json` advertises `vite-plugin` but not `vite` in peer dependencies
  - registry discovery is therefore incomplete
- Desired end result:
  - Vite Plugin Registry can infer supported Vite versions from the package manifest
- Implementation plan:
  - add optional `vite` peer dependency range matching the supported Vite majors
  - note compatibility in `packages/vite-plugin-angular/README.md`
  - confirm no consumer install warnings become misleading
- Instrumentation:
  - not runtime-sensitive; no existing debug scope needed
  - if the package build/publish path changes, temporary `createDebug('analog:release:package-manifest')` can be added in artifact verification
- Regression tests:
  - package-manifest snapshot/assertion in publish artifact verification
- Risks:
  - peer range drift if Vite support changes elsewhere and this metadata is forgotten

## Workstream B: Content / Prerender / Docs / Migration

### analogjs/analog#2165 `contentFileResource` fails during prerender and hydration

- Root cause analysis:
  - `packages/content/resources/src/content-file-resource.ts` wraps the loader in `toSignal(from(loaderPromise()))`, which introduces a late async edge into a path that needs to be stable during prerender and hydration
  - `packages/content/src/lib/get-content-files.ts` and `content-files*.ts` rely on placeholder-replaced maps and slug remapping
  - if those maps are empty or arrive too late, prerender emits empty output and hydration never resolves content
- Desired end result:
  - prerendered markdown routes have content in HTML
  - static file-server hydration restores the same content immediately
  - slug-based and filename-based lookup both work
- Implementation plan:
  - trace `CONTENT_FILES_LIST_TOKEN`, `CONTENT_FILES_TOKEN`, and `CONTENT_FILE_LOADER` creation under prerender
  - collapse the lookup path so the resource loader reads directly from a stable content map signal/value instead of a deferred promise layer where possible
  - verify placeholder replacement for both content list and lazy content map in build output
  - restore the blog e2e once the path is fixed
- Instrumentation:
  - existing `analog:platform:content` for build/discovery-side tracing
  - add `createDebug('analog:content:resource')` and `createDebug('analog:content:lookup')` in `content-file-resource.ts` and content-token factories when implementation starts
  - use scoped file logs under `tmp/debug/analog.content.resource.log` if those scopes are added
- Regression tests:
  - targeted unit coverage in `packages/content/resources/src/content-file-resource.spec.ts`
  - re-enable `apps/blog-app-e2e/tests/app.spec.ts`
- Risks:
  - fixing only prerender may still leave file-server hydration broken if the runtime token path differs

### analogjs/analog#2029 Exclude Mermaid from Shiki to avoid OOM

- Root cause analysis:
  - docs encourage `additionalLangs: ['mermaid']`, but the issue thread shows this is still too heavy in constrained CI environments
  - the real missing feature is a way to opt out of expensive language highlighters while still rendering markdown
- Desired end result:
  - users can keep Mermaid blocks in markdown without forcing Shiki to fully tokenize them during build
  - docs default to the safer client-only Mermaid path
- Implementation plan:
  - add `skipLangs` or equivalent exclusion support to the highlighter config path
  - ensure Mermaid blocks fall back to plain fenced output or dedicated Mermaid rendering rather than Shiki tokenization
  - update docs to present client-only Mermaid loading as the default recommendation
- Instrumentation:
  - use `analog:platform:content` during build
  - if needed, add `createDebug('analog:content:highlighter')` around per-language handling in the content renderer/highlighter adapter
- Regression tests:
  - markdown rendering fixture with Mermaid plus Shiki configured
  - build-memory smoke test is optional; config-path behavior tests are mandatory
- Risks:
  - language-skipping that silently changes rendered output without docs could confuse users

### analogjs/analog#2158 MD / MDX / MDC rendering performance

- Root cause analysis:
  - the issue is largely about future renderer evolution; comments show md4x and related foundations already landed experimentally
  - the current risk is scope creep, not missing infrastructure
- Desired end result:
  - a phased roadmap rather than a monolithic content rewrite during stabilization
- Implementation plan:
  - split the issue into subtracks: renderer benchmarks, MDC component mapping hardening, streaming/AI content, and docs
  - inventory what shipped in merged work vs what remains experimental
  - define performance baselines before any new runtime contract is introduced
- Instrumentation:
  - use `analog:platform:content`
  - add a small benchmark harness rather than production logging
- Regression tests:
  - renderer correctness tests, not just perf numbers
- Risks:
  - performance work can destabilize the now-working content pipeline if mixed with `analogjs/analog#2165`

### analogjs/analog#1939 Migration guide

- Root cause analysis:
  - issue comments show continuing confusion around content/highlighter setup
  - stable v3 increases the cost of stale migration docs
- Desired end result:
  - one authoritative migration guide covering v2 to v3 changes in routing, content, Vitest setup, Storybook, HMR naming, and generator defaults
- Implementation plan:
  - diff the current v2 docs and templates against alpha behavior
  - write a top-level migration guide in `apps/docs-app/docs/guides/migrating.md`
  - link to package-specific guides where detail is too large
  - include before/after examples for content highlighter configuration and `@analogjs/vitest-angular` setup
- Instrumentation:
  - docs-only; no runtime scope required
  - if llms/doc generation is touched, use a temporary `analog:docs:llms`
- Regression tests:
  - docs link check via existing docs build
  - spot-check example configs against templates in the repo
- Risks:
  - migration text can drift from templates if not verified against generated output

### analogjs/analog#2159 Remove `.agx` references

- Current state:
  - completed in the earlier changelog cleanup
  - track as `Pending Close (Completed)` because branch `docs/2159-remove-agx-references` was repurposed for `analogjs/analog#2168`
- Root cause analysis:
  - `.agx` was a removed experiment, but references remain in changelog/docs/history
- Desired end result:
  - no public docs or migration content implies `.agx` is still supported
- Implementation plan:
  - run a repo-wide `rg 'agx'`
  - remove or rewrite historical references unless they are explicitly labeled as removed legacy behavior
  - verify docs search results no longer surface it
- Instrumentation:
  - no runtime logging needed
- Regression tests:
  - grep-based repo check can be added to CI later if desired
- Risks:
  - overzealous cleanup could erase useful historical context in changelog entries

### analogjs/analog#2076 Remove `standalone: true` from docs/templates

- Root cause analysis:
  - modern Angular no longer needs the property for current standalone usage, but old docs/templates still show it
  - some version-specific templates may still need it for old Angular compatibility
- Desired end result:
  - modern docs show current Angular style
  - version-pinned templates keep compatibility where required
- Implementation plan:
  - split docs/examples from versioned template compatibility
  - clean current docs and generator templates targeting supported modern versions
  - leave v17/v18 templates alone unless verified safe
- Instrumentation:
  - no runtime logging needed
- Regression tests:
  - generator snapshot updates
  - docs examples should compile where they are used as fixtures
- Risks:
  - breaking older generated templates if cleanup is applied indiscriminately

### analogjs/analog#2036 AI integrations docs

- Current state:
  - completed on branch `docs/2036-ai-integrations`
  - draft PR: [analogjs/analog#2234](https://github.com/analogjs/analog/pull/2234)
- Root cause analysis:
  - docs already emit `llms.txt` and `llms-full.txt`, but there is no focused docs page explaining AI integration use cases
- Desired end result:
  - a docs page covering llms files, AI-friendly routing/content patterns, and recommended integration boundaries
- Implementation plan:
  - create a dedicated docs page and add it to navigation
  - explain the purpose of `llms.txt` / `llms-full.txt`
  - cross-link content, server routes, and any streaming examples that are actually maintained
- Instrumentation:
  - if the llms plugin changes, add `createDebug('analog:docs:llms')` inside `apps/docs-app/docusaurus.config.js`
  - otherwise docs-only
- Regression tests:
  - docs build
  - verify generated `llms.txt`/`llms-full.txt` still emit
- Risks:
  - AI docs can become aspirational marketing if not tied to maintained examples

### analogjs/analog#2038 Migrate docs to Astro/Starlight

- Root cause analysis:
  - this is a platform migration, not a bug fix, and the thread explicitly says it is on hold
- Desired end result:
  - a scoped migration plan that does not block v3 stable
- Implementation plan:
  - write an RFC-level migration checklist rather than implementation work now
  - inventory Docusaurus-specific features currently in use: i18n, llms plugin, search/theme, edit links
  - only resume once maintainers decide it is active
- Instrumentation:
  - if prototyping begins later, add `analog:docs:migration`
- Regression tests:
  - N/A until active
- Risks:
  - large platform rewrites often absorb launch energy without improving core framework stability

### analogjs/analog#2039 docs site inaccessible

- Root cause analysis:
  - most evidence points to deploy/proxy configuration outside the monorepo
  - the only obvious in-repo sensitivity is path/base-url handling in `apps/docs-app/docusaurus.config.js`
- Desired end result:
  - confirm whether the outage is code-side or infrastructure-side
- Implementation plan:
  - validate generated routes and `baseUrl` assumptions locally
  - compare deploy configuration outside repo before opening code changes
  - if code-side, add deploy-preview assertions for docs root and `/docs`
- Instrumentation:
  - docs build logs only
  - optional future scope `analog:docs:deploy`
- Regression tests:
  - deploy-preview smoke check is more valuable than unit tests here
- Risks:
  - wasting engineering time in the monorepo if the real issue is nginx/CDN routing

## Workstream C: Router / Typed Routes / Runtime / Astro / Nitro

### analogjs/analog#2172 blog-app root redirect

- Root cause analysis:
  - `apps/blog-app/src/app/pages/index.page.ts` currently uses browser navigation in `ngOnInit`, while the template blog uses route metadata
  - route generation likely drops redirect-only routes that do not export a component
- Desired end result:
  - metadata-only redirect route works in app and generated templates
- Implementation plan:
  - trace redirect-only route discovery and manifest generation
  - allow route files that export redirect metadata without a component default export
  - restore blog-app to metadata route and re-enable e2e
- Instrumentation:
  - `analog:platform:typed-router`
  - add temporary `analog:platform:routes` logging if redirect files are being skipped before manifest generation
- Regression tests:
  - re-enable `apps/blog-app-e2e/tests/app.spec.ts`
  - add unit coverage for redirect-only route files
- Risks:
  - redirect semantics may collide with index/layout handling if route classification is too coarse

### analogjs/analog#2174 Pathless parent layouts collide in typed route generation

- Root cause analysis:
  - `generateRouteManifest()` still reasons about canonical `fullPath` collisions before all structural relationships are fully settled
  - pathless layouts share URL space with index routes but are not duplicate leaves
- Desired end result:
  - structural route identity survives even when `fullPath` matches
  - typed route tree contains both layout and child/index structure correctly
- Implementation plan:
  - make structural `id` the primary identity through parent/child wiring
  - only use `fullPath` for canonical navigation lookup after the structure is built
  - add explicit test fixtures for multiple pathless parents at `/`
- Instrumentation:
  - `analog:platform:typed-router`
  - capture route collision logs with `logFile: 'scoped'` during `pnpm build`
- Regression tests:
  - `packages/platform/src/lib/route-manifest.spec.ts`
  - build-level typed-routes fixtures
- Risks:
  - “fixing” collisions too broadly may accidentally permit real duplicate routes

### analogjs/analog#2044 Type-safe file routing umbrella

- Root cause analysis:
  - most of the feature is implemented, but remaining hardening items are scattered
- Desired end result:
  - close the umbrella after `analogjs/analog#2174` and `analogjs/analog#2127` correctness items are done
- Implementation plan:
  - treat this as a checklist issue, not a fresh feature project
  - close or split remaining sub-items that are now independent
- Instrumentation:
  - `analog:platform:typed-router`
- Regression tests:
  - build/watch regeneration tests
- Risks:
  - umbrella issues stay open forever unless the close criteria are explicit

### analogjs/analog#2127 Maintainer follow-ups

- Root cause analysis:
  - this is a tracker issue with a mix of must-fix correctness and future design work
  - current evidence shows `packages/router/src/lib/request-context.ts` still forwards only `requestUrl.searchParams`
- Desired end result:
  - resolve the correctness/API items and move future ideas to their own issues
- Implementation plan:
  - in `request-context.ts`, merge `req.params` into the Nitro fetch params object instead of passing only `URLSearchParams`
  - verify whether `@standard-schema/spec` should remain a runtime dependency or be erased from public `.d.ts` surfaces
  - make `defineServerRoute` overloads reject `input` together with `query`/`body`
  - split `provideAnalogQuery` scope and TanStack-upstream discussions into post-stable follow-ups
- Instrumentation:
  - add `createDebug('analog:router:request-context')` around SSR fetch param shaping
  - use `analog:nitro:ssr` in end-to-end testing to see the server side of the request path
- Regression tests:
  - SSR query forwarding e2e with `fetchCount === 1`
  - API typing tests for `defineServerRoute`
- Risks:
  - type-level fixes without runtime warnings can still leave confusing invalid combinations for JS users

### analogjs/analog#2215 Deprecated API audit

- Root cause analysis:
  - deprecated symbols are currently spread across router, vitest-angular, storybook-angular, platform, and nitro options
  - the repo has no single removal plan for stable v3
- Desired end result:
  - every deprecation has a disposition: remove now, keep as compatibility alias, or document for later removal
- Implementation plan:
  - inventory all `@deprecated` exports and option fields
  - decide whether `liveReload` remains as alias only or is fully removed from public docs
  - update migration docs in the same PR
- Instrumentation:
  - not runtime-sensitive
  - optional future artifact check to fail if new deprecated exports appear without documentation
- Regression tests:
  - type tests and option compatibility tests where aliases are intentionally kept
- Risks:
  - removing too much at once may exceed the migration budget for stable v3

### analogjs/analog#2177 HTTP/2 pseudo-header crash

- Current state:
  - verified on branch `chore/2177-verify-http2-pseudo-headers`
  - draft PR: [analogjs/analog#2233](https://github.com/analogjs/analog/pull/2233)
- Root cause analysis:
  - already fixed in `packages/vite-plugin-nitro/src/lib/utils/node-web-bridge.ts` by skipping keys starting with `:`
- Desired end result:
  - confirm via regression test, then close
- Implementation plan:
  - add a unit test that passes pseudo-headers through `toWebHeaders()`
- Instrumentation:
  - `analog:nitro` if reproducing in dev
- Regression tests:
  - direct unit coverage for `node-web-bridge.ts`
- Risks:
  - none if the test is added

### analogjs/analog#2168 Angular schematic compatibility

- Current state:
  - verified on branch `docs/2159-remove-agx-references`
  - draft PR repurposed to: [analogjs/analog#2231](https://github.com/analogjs/analog/pull/2231)
- Root cause analysis:
  - repo shape suggests the compatibility work is already in place
- Desired end result:
  - confirm published package shape behaves correctly, then close
- Implementation plan:
  - verify generator/schematic entrypoints in built output and one real schematic invocation path
- Instrumentation:
  - optional `analog:release:artifacts` if adding publish verification logging
- Regression tests:
  - artifact verification plus schematic smoke test
- Risks:
  - relying only on source tree structure instead of built package behavior

### analogjs/analog#2213 Astro client hydration reuse

- Root cause analysis:
  - `packages/astro-angular/src/client.ts` currently calls `createApplication()` and mounts with `createComponent()` against the host element, replacing server markup instead of hydrating it
  - the server path in `packages/astro-angular/src/server.ts` already renders DOM suitable for hydration reuse
- Desired end result:
  - optional hydration-aware Astro islands that reuse SSR DOM
- Implementation plan:
  - keep current mount path as fallback
  - add `experimental.useAngularHydration` path that wires `provideClientHydration()` and hydration-specific island bootstrap
  - prove event replay and transfer cache behavior on a demo island
- Instrumentation:
  - add `createDebug('analog:astro:hydration')` in `packages/astro-angular/src/client.ts` and `server.ts`
  - log whether a component took fresh mount vs hydration path
- Regression tests:
  - extend `astro-app` scenarios
  - SSR HTML preservation checks
- Risks:
  - the open draft depends on Angular internals and may be brittle across Angular releases
- Open PR context:
  - draft [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212)

### analogjs/analog#2189 Runtime i18n with `$localize`

- Root cause analysis:
  - this is a broad cross-package feature proposal without implementation in current stable code paths
- Desired end result:
  - phased design, not a giant stabilization PR
- Implementation plan:
  - phase 1: locale detection contract in router/platform
  - phase 2: content and route-prefix integration
  - phase 3: Nitro prerender/sitemap expansion
  - phase 4: docs and template support
- Instrumentation:
  - future scopes: `analog:platform:i18n`, `analog:nitro:i18n`
- Regression tests:
  - route prefix, SSR language detection, and content lookup tests per phase
- Risks:
  - i18n crosses too many package boundaries to safely land during stabilization

### analogjs/analog#2035 Nitro v3 Vite plugin migration

- Root cause analysis:
  - there is already a substantial open PR replacing manual orchestration with Nitro’s first-party plugin
  - maintainers already indicated this is more appropriate for `v3.1`
- Desired end result:
  - keep current v3 path stable, finish migration later if maintainers still want it
- Implementation plan:
  - treat the open PR as a separate post-stable architecture track
  - do not intermingle with v3 GA fixes unless a bug must be cherry-picked
- Instrumentation:
  - `analog:nitro`, `analog:nitro:ssr`, `analog:nitro:prerender`
- Regression tests:
  - if resumed later, full server build/prerender matrix is required
- Risks:
  - this is a high-churn internal rewrite with little direct stable-release benefit
- Open PR context:
  - open [analogjs/analog#2188](https://github.com/analogjs/analog/pull/2188)

## Workstream D: Vitest / Storybook / Release / Docs Platform / Design Tokens

### analogjs/analog#2222 Vitest 4 isolation regression

- Root cause analysis:
  - `packages/vitest-angular/setup-testbed.ts` initializes the Angular test environment once behind a global symbol and relies on Angular cleanup hooks in `beforeEach` / `afterEach`
  - that model can leak state when Vitest’s worker or project lifecycle changes
  - `tests/vitest-angular/vitest.config.ts` already runs with `isolate: false`, which increases the importance of deterministic teardown
- Desired end result:
  - no cross-test TestBed or DOM contamination under current Vitest versions, including CI ordering
- Implementation plan:
  - reproduce the failure inside `tests/vitest-angular`
  - decide whether the fix is stricter teardown, per-project environment init, or a stronger testbed reset helper
  - document the supported setup pattern in docs
- Instrumentation:
  - add `createDebug('analog:vitest:testbed')` in `setup-testbed.ts`
  - log environment init count, teardown strategy, and whether cleanup hooks ran
- Regression tests:
  - extend `tests/vitest-angular/src/reset-test-bed-between-tests`
  - add a worker/order-sensitive regression fixture
- Risks:
  - fixes that re-init the Angular platform too aggressively can slow tests or break browser-mode runs

### analogjs/analog#2220 Snapshot trailing whitespace

- Current state:
  - branch `fix/2220-snapshot-whitespace`
  - draft PR: [analogjs/analog#2237](https://github.com/analogjs/analog/pull/2237)
  - serializer now trims trailing spaces at line ends and collapses repeated blank lines in the final printed snapshot output
- Root cause analysis:
  - `createAngularFixtureSnapshotSerializer()` simply prints a DOM node from `DOMParser`
  - formatting normalization is minimal; downstream serializers remove attributes/comments but do not normalize whitespace
- Desired end result:
  - snapshots are stable under formatter runs and do not contain avoidable blank lines/trailing spaces
- Implementation plan:
  - add a post-serialization normalization step for text output
  - keep it conservative so real content whitespace is not destroyed
  - normalize only trailing spaces and repeated blank lines created by serializer cleanup
- Instrumentation:
  - add `createDebug('analog:vitest:snapshots')` around pre/post normalization text in `angular-fixture.ts`
- Regression tests:
  - add inline snapshot cases showing trailing-space removal and blank-line collapse
- Verification completed:
  - `pnpm exec vitest run --config packages/vitest-angular/vite.config.ts packages/vitest-angular/src/lib/snapshot-serializers/angular-fixture.spec.ts`
  - `pnpm nx build vitest-angular`
- Risks:
  - over-normalization could hide legitimate whitespace-sensitive content

### analogjs/analog#2218 Snapshot unstable ids and `aria-describedby`

- Root cause analysis:
  - `no-ng-attributes.ts` cleans only a limited set of attributes and patterns
  - current regexes match `mat|cdk|ng` ids with `-<digits>` patterns but not more complex generated ids such as CDK drag/drop or bootstrap popover IDs
  - `aria-describedby` is not in the cleaning table
- Desired end result:
  - first-party serializers remove common framework-generated runtime noise while preserving real semantic attributes
- Implementation plan:
  - widen regex coverage for generated ids
  - add `aria-describedby`
  - include multi-token attribute value cases
- Instrumentation:
  - reuse `analog:vitest:snapshots`
  - log which attributes were cleaned when a debug flag is enabled
- Regression tests:
  - add targeted serializer spec cases for CDK and Ngb patterns
- Risks:
  - broad regexes can accidentally strip user-authored IDs if not specific enough

### analogjs/analog#2173 legacy `setup-vitest` import path

- Current state:
  - maintainer guidance is to remove the old export path and rely on `@analogjs/vitest-angular` plus migration
  - `packages/vite-plugin-angular` already contains `migrate-setup-vitest`, which rewrites imports to `@analogjs/vitest-angular/setup-zone` and installs `@analogjs/vitest-angular`
  - branch `fix/2173-setup-vitest-legacy-path`, draft PR: [analogjs/analog#2235](https://github.com/analogjs/analog/pull/2235)
  - the branch now sets `emptyOutDir: true` in the package build so stale `dist/setup-vitest.*` files are not republished
  - the branch also adds an Nx migration entry so `nx migrate` follows the same rewrite/install path as the existing Angular schematic migration used by `ng update`
- Root cause analysis:
  - the old path belongs to `@analogjs/vite-plugin-angular`, but the active setup now lives in `@analogjs/vitest-angular`
  - the package manifest no longer exposes a correct dependency story for the old path
  - the repo already contains a migration schematic for this import
- Desired end result:
  - stable v3 has a single supported path, with a reliable migration for old users
- Implementation plan:
  - decide whether to keep a compatibility export temporarily or fully remove it
  - if compatibility stays, declare any needed optional peers and make the path safe
  - if compatibility is removed, ensure generators/docs/migrations cover it cleanly
- Instrumentation:
  - add `createDebug('analog:vitest:migration')` in the migration schematic only if troubleshooting is needed
- Regression tests:
  - extend `migrate-setup-vitest.spec.ts`
  - verify docs point only to the new path
- Verification completed:
  - `pnpm nx test vite-plugin-angular --runTestsByPath packages/vite-plugin-angular/migrations/update-3-0-0/migrate-setup-vitest.spec.ts packages/vite-plugin-angular/migrations/migrate-setup-vitest/migrate-setup-vitest.spec.ts`
  - `pnpm nx build vite-plugin-angular`
- Risks:
  - leaving the legacy path half-supported creates confusing install failures for stable users

### analogjs/analog#2185 Release lockfile regeneration

- Current state:
  - the issue was closed upstream before a repo-side fix landed here
- Root cause analysis:
  - `release.config.ts` commits `pnpm-lock.yaml`, but no prepare step regenerates it after version replacement
- Desired end result:
  - releases never leave a dirty lockfile
- Implementation plan:
  - add a prepare hook that runs `pnpm install --lockfile-only` after replacement and before `@semantic-release/git`
  - validate that the command is deterministic in CI
- Instrumentation:
  - add `createDebug('analog:release:lockfile')` in a small release helper if the process becomes script-driven
  - otherwise rely on release logs
- Regression tests:
  - dry-run release fixture or script-level test if practical
- Risks:
  - calling `pnpm` in the wrong stage can mutate more than the lockfile

### analogjs/analog#2074 Storybook `componentWrapperDecorator` in Vitest

- Current state:
  - branch `fix/2074-storybook-component-wrapper-decorator`
  - draft PR: [analogjs/analog#2236](https://github.com/analogjs/analog/pull/2236)
  - note: the same fix previously merged via [analogjs/analog#2086](https://github.com/analogjs/analog/pull/2086), but onto `beta` rather than `alpha`
- Root cause analysis:
  - `packages/storybook-angular/src/lib/testing.ts` omits `applyDecorators` from `renderAnnotations`
  - the issue thread points directly at the missing piece
- Desired end result:
  - Storybook decorator behavior matches expected Storybook Angular semantics in tests
- Implementation plan:
  - include `configAnnotations.applyDecorators` in `renderAnnotations`
  - add a focused regression test using `componentWrapperDecorator`
- Instrumentation:
  - add `createDebug('analog:storybook:testing')` only if render-annotation debugging is needed
- Regression tests:
  - new unit/spec for `setProjectAnnotations()` behavior
- Verification completed:
  - `pnpm nx test storybook-angular --runTestsByPath packages/storybook-angular/src/lib/testing.spec.ts`
  - `pnpm nx build storybook-angular`
- Risks:
  - low; this looks like a targeted compatibility fix

### analogjs/analog#2068 Storybook SCSS build issue

- Root cause analysis:
  - no minimal reproduction exists
  - current preset already maps `stylePreprocessorOptions.loadPaths` and injects builder `styles` into `preview.ts`
  - the remaining likely failures are path-resolution edge cases or misunderstanding about package CSS imports
- Desired end result:
  - either a confirmed docs-only clarification or a narrowly reproduced bug
- Implementation plan:
  - do not code-fix first
  - tighten docs around global style registration, `preview.ts` imports, and package export requirements
  - only patch runtime after a minimal repro is obtained
- Instrumentation:
  - add `createDebug('analog:storybook:styles')` in `preset.ts` if a repro appears
  - log resolved imports, load paths, and root/workspace resolution
- Regression tests:
  - if a repro appears, convert it into a preset test
- Risks:
  - speculative fixes without repro can break existing working setups

### analogjs/analog#2092 OXC tooling adoption

- Current state:
  - closeout comment posted at <https://github.com/analogjs/analog/issues/2092#issuecomment-4188471667>
  - issue still requires maintainer close permissions
- Root cause analysis:
  - the repo already adopted much of the OXC path; the issue is now mostly about remaining generator/template defaults
- Desired end result:
  - close or re-scope to “default generated tooling”
- Implementation plan:
  - inventory what is already switched
  - if desired, open a follow-up issue specifically for `create-analog`/Nx generated defaults
- Instrumentation:
  - not runtime-sensitive
- Regression tests:
  - generator snapshots if scaffolding changes
- Risks:
  - leaving the umbrella open obscures that the main investigation is already complete

### analogjs/analog#2227 First-class Style Dictionary support

- Root cause analysis:
  - this issue depends on the stylesheet pipeline direction from `analogjs/analog#2229`
  - current repo has no stable public extension surface for the whole proposed token pipeline
- Desired end result:
  - a narrow, post-stable integration plan that does not bloat v3 core
- Implementation plan:
  - wait until `analogjs/analog#2229` is fully settled
  - then decide whether the right path is:
    - core-owned extensibility hooks, or
    - community/plugin-owned integration with minimal Analog hooks
  - avoid locking public target names or token schemas into core
- Instrumentation:
  - if prototyping later, add `analog:platform:tokens` and `analog:angular:tokens`
- Regression tests:
  - future integration should prove codegen, watch mode, and theme swapping before any public API commitment
- Risks:
  - shipping a large new dependency/API surface before the base stylesheet pipeline is fully stable
- Open PR context:
  - draft [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204) references the issue indirectly, but it is not implementation progress on design tokens

### analogjs/analog#2038 Docs platform migration

- Root cause analysis:
  - see Workstream B; this remains on hold
- Desired end result:
  - no v3 stable dependency on a docs-platform rewrite
- Implementation plan:
  - keep deferred until maintainers unfreeze it
- Instrumentation:
  - future `analog:docs:migration`
- Regression tests:
  - N/A
- Risks:
  - scope explosion

### analogjs/analog#2039 Docs site accessibility / hosting issue

- Root cause analysis:
  - see Workstream B; likely outside repo
- Desired end result:
  - determine infra vs repo ownership before coding
- Implementation plan:
  - validate `baseUrl` and generated route output locally, then escalate to deploy config if clean
- Instrumentation:
  - future `analog:docs:deploy` if code-side investigation starts
- Regression tests:
  - deploy-preview smoke test
- Risks:
  - chasing the wrong layer

## Execution Order Recommendation

1. `analogjs/analog#2229`, `analogjs/analog#2172`, `analogjs/analog#2165`, `analogjs/analog#2174`, `analogjs/analog#2026`
2. `analogjs/analog#2049`, `analogjs/analog#2178`, `analogjs/analog#2127`, `analogjs/analog#2215`, `analogjs/analog#1939`
3. `analogjs/analog#2222`, `analogjs/analog#2220`, `analogjs/analog#2218`, `analogjs/analog#2173`, `analogjs/analog#2185`, `analogjs/analog#2074`
4. docs/support cleanup: `analogjs/analog#2029`, `analogjs/analog#2159`, `analogjs/analog#2076`, `analogjs/analog#2036`
5. verify-close candidates: `analogjs/analog#2177`, `analogjs/analog#2168`, `analogjs/analog#2044`, `analogjs/analog#2092`
6. post-stable tracks only after GA scope is healthy

## Close Criteria

For each issue, implementation should not be considered complete until:

- code path is covered by a regression test
- docs are updated if user-facing behavior changed
- any temporary debug scopes added for diagnosis are either removed or kept as intentional instrumentation
- the issue or PR links in `IssuesInventoryTodo.md` are updated to reflect the new state
