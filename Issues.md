# AnalogJS v3 Unified Issues Plan

Last reviewed: 2026-04-06

This is the compact v3 stabilization tracker for `analogjs/alpha` to get to a beta-worthy alpha release.

Planning branch policy:

- The canonical planning doc lives on local branch `benpsnyder:feat/resolve-all-issues`.
- Do not push that branch to `origin` or `analogjs` remotes.
- Each implementation should use a dedicated branch based on `analogjs/alpha` unless explicitly noted otherwise.
- In the release gate below, `[-]` means a PR exists for the issue and `[X]` means merged.

## Release Gate

### Must fix before stable

- [-] `analogjs/analog#2215` deprecation audit and removal plan
  PR: [analogjs/analog#2246](https://github.com/analogjs/analog/pull/2246) (`draft`)
- [-] `analogjs/analog#1939` migration guide for stable v3
  PR: [analogjs/analog#2240](https://github.com/analogjs/analog/pull/2240)

### Should fix before stable

- [-] `analogjs/analog#2222` Vitest 4 isolation regression on CI
  PR: [analogjs/analog#2244](https://github.com/analogjs/analog/pull/2244)
- [-] `analogjs/analog#2220` snapshot output has trailing whitespace / blank lines
  PR: [analogjs/analog#2237](https://github.com/analogjs/analog/pull/2237)
- [-] `analogjs/analog#2218` snapshot output contains unstable ids and `aria-describedby`
  PR: [analogjs/analog#2238](https://github.com/analogjs/analog/pull/2238)
- [-] `analogjs/analog#2173` old `setup-vitest` path still has a broken `zone.js` dependency story
  PR: [analogjs/analog#2235](https://github.com/analogjs/analog/pull/2235)
- [-] `analogjs/analog#2074` Storybook `componentWrapperDecorator` is broken in Vitest
  PR: [analogjs/analog#2236](https://github.com/analogjs/analog/pull/2236)
- [-] `analogjs/analog#2029` Mermaid-heavy content builds should avoid Shiki OOM paths
  PR: [analogjs/analog#2239](https://github.com/analogjs/analog/pull/2239)
- [-] `analogjs/analog#2076` remove stale `standalone: true` usage from docs/templates
  PR: [analogjs/analog#2242](https://github.com/analogjs/analog/pull/2242)

### Verify fixed and close

- [ ] `analogjs/analog#2049` scoped CSS keyframes are not unique in dev mode
      Current state: likely fixed on current `alpha`; reporter retest requested.
- [ ] `analogjs/analog#2026` Angular HMR / reload behavior is unreliable and underspecified
      Current state: likely largely addressed by the v3 alpha overhaul; reporter retest requested.
- [ ] `analogjs/analog#2044` typed file routing umbrella issue after follow-up hardening
      Current state: umbrella closeout only.
- [ ] `analogjs/analog#2092` OXC tooling investigation is mostly done; re-scope or close
      Current state: closeout comment posted; maintainer close still required.
- [ ] `analogjs/analog#2159` remove leftover `.agx` references
      Current state: appears completed; maintainer closeout still needed.
- [ ] `analogjs/analog#2036` add AI integrations docs section
      Current state: docs PR exists but issue still open.

### Defer to v3.1+

- [ ] `analogjs/analog#2253` consolidate `liveReload` / `hmr` into one option after v3 settles
- [ ] `analogjs/analog#2252` tighten `stylesheet-registry` public surface
- [ ] `analogjs/analog#2251` extract Tailwind CSS into a composable preprocessor factory
- [ ] `analogjs/analog#2250` simplify debug infrastructure and remove compilation-path logging noise
- [-] `analogjs/analog#2227` first-class Style Dictionary support
  PR: [analogjs/analog#2245](https://github.com/analogjs/analog/pull/2245)
- [-] `analogjs/analog#2213` Astro client hydration reuse
  PR: [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212) (`beta`)
- [ ] `analogjs/analog#2189` runtime i18n with `$localize`
- [ ] `analogjs/analog#2175` Vite Plugin Registry compatibility metadata
- [ ] `analogjs/analog#2158` MD / MDX / MDC performance work
- [-] `analogjs/analog#2068` Storybook SCSS build issue without a minimal repro
  PR: [analogjs/analog#2243](https://github.com/analogjs/analog/pull/2243)
- [ ] `analogjs/analog#2039` docs site accessibility / hosting issue
- [ ] `analogjs/analog#2038` migrate docs site to Astro/Starlight
- [ ] `analogjs/analog#2035` complete Nitro v3 Vite plugin migration
      PR: [analogjs/analog#2188](https://github.com/analogjs/analog/pull/2188)

## Active Issue Ledger

Only issues still open on GitHub are listed here.

| Issue                  | Status                  | Difficulty | Branch                                              | PR                                                                   | Notes                                                                                                    |
| ---------------------- | ----------------------- | ---------: | --------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `analogjs/analog#2215` | In progress             |          4 | `chore/2215-deprecation-audit`                      | [analogjs/analog#2246](https://github.com/analogjs/analog/pull/2246) | Draft docs-first deprecation audit; still part of the stable gate.                                       |
| `analogjs/analog#1939` | In progress             |          3 | `docs/1939-v3-migration-guide`                      | [analogjs/analog#2240](https://github.com/analogjs/analog/pull/2240) | Migration guide split into `v1 -> v2` and `v2 -> v3`.                                                    |
| `analogjs/analog#2222` | In progress             |          7 | `fix/2222-vitest-isolation`                         | [analogjs/analog#2244](https://github.com/analogjs/analog/pull/2244) | Core test DX issue; PR includes regression coverage and DX logging.                                      |
| `analogjs/analog#2220` | In progress             |          3 | `fix/2220-snapshot-whitespace`                      | [analogjs/analog#2237](https://github.com/analogjs/analog/pull/2237) | Narrow snapshot serializer cleanup.                                                                      |
| `analogjs/analog#2218` | In progress             |          4 | `fix/2218-snapshot-generated-ids`                   | [analogjs/analog#2238](https://github.com/analogjs/analog/pull/2238) | Snapshot determinism cleanup.                                                                            |
| `analogjs/analog#2173` | In progress             |          3 | `fix/2173-setup-vitest-legacy-path`                 | [analogjs/analog#2235](https://github.com/analogjs/analog/pull/2235) | Covers `ng update` and `nx migrate` legacy path cleanup.                                                 |
| `analogjs/analog#2074` | In progress             |          4 | `fix/2074-storybook-component-wrapper-decorator`    | [analogjs/analog#2236](https://github.com/analogjs/analog/pull/2236) | Re-applies the earlier fix onto `alpha` with regression coverage.                                        |
| `analogjs/analog#2029` | In progress             |          5 | `fix/2029-mermaid-shiki-oom`                        | [analogjs/analog#2239](https://github.com/analogjs/analog/pull/2239) | Includes `skipLangs`, docs updates, and skipped-language fallback output.                                |
| `analogjs/analog#2076` | In progress             |          2 | `docs/2076-remove-standalone-true-pr`               | [analogjs/analog#2242](https://github.com/analogjs/analog/pull/2242) | Active PR supersedes [analogjs/analog#2232](https://github.com/analogjs/analog/pull/2232).               |
| `analogjs/analog#2049` | Verify on current alpha |          5 | `fix/2049-dev-keyframe-scoping`                     | None                                                                 | Reporter retest requested at <https://github.com/analogjs/analog/issues/2049#issuecomment-4189327385>.   |
| `analogjs/analog#2026` | Verify on current alpha |          5 | `fix/2026-angular-hmr-reload-matrix`                | None                                                                 | Reporter retest requested at <https://github.com/analogjs/analog/issues/2026#issuecomment-4189333998>.   |
| `analogjs/analog#2044` | Verify and close        |          6 | `chore/2044-typed-routing-umbrella-closeout`        | None                                                                 | Typed-routing umbrella only; underlying hardening mostly landed.                                         |
| `analogjs/analog#2092` | Pending close           |          2 | `chore/2092-oxc-followup-closeout`                  | None                                                                 | Closeout comment posted at <https://github.com/analogjs/analog/issues/2092#issuecomment-4188471667>.     |
| `analogjs/analog#2159` | Pending close           |          2 | `docs/2159-remove-agx-references`                   | None                                                                 | Branch was later repurposed for `analogjs/analog#2168`; issue still needs maintainer closeout.           |
| `analogjs/analog#2036` | Pending close           |          2 | `docs/2036-ai-integrations`                         | [analogjs/analog#2234](https://github.com/analogjs/analog/pull/2234) | Docs PR exists; issue remains open.                                                                      |
| `analogjs/analog#2253` | Deferred                |          3 | `chore/2253-liveReload-hmr-consolidation`           | None                                                                 | New refactor proposal, 2026-04-06.                                                                       |
| `analogjs/analog#2252` | Deferred                |          2 | `chore/2252-stylesheet-registry-surface`            | None                                                                 | New refactor proposal, 2026-04-06.                                                                       |
| `analogjs/analog#2251` | Deferred                |          4 | `refactor/2251-tailwind-preprocessor-factory`       | None                                                                 | New refactor proposal, 2026-04-06.                                                                       |
| `analogjs/analog#2250` | Deferred                |          4 | `refactor/2250-debug-infrastructure-simplification` | None                                                                 | New refactor proposal, 2026-04-06.                                                                       |
| `analogjs/analog#2227` | Deferred                |          8 | `feat/2227-style-dictionary-support`                | [analogjs/analog#2245](https://github.com/analogjs/analog/pull/2245) | Prototype / architecture work, not v3 GA scope.                                                          |
| `analogjs/analog#2213` | In progress             |          8 | `ng-client-hydration`                               | [analogjs/analog#2212](https://github.com/analogjs/analog/pull/2212) | Active WIP on `beta`, not current GA scope.                                                              |
| `analogjs/analog#2189` | Deferred                |          9 | `feat/2189-runtime-i18n-localize`                   | None                                                                 | Broad cross-package feature.                                                                             |
| `analogjs/analog#2175` | Deferred                |          1 | `chore/2175-vite-plugin-registry-metadata`          | None                                                                 | Existing maintainer directive: <https://github.com/analogjs/analog/issues/2175#issuecomment-4166726621>. |
| `analogjs/analog#2158` | Deferred                |          8 | `feat/2158-content-rendering-performance`           | None                                                                 | Performance track, not v3 GA scope.                                                                      |
| `analogjs/analog#2068` | In progress             |          6 | `fix/2068-storybook-scss-build`                     | [analogjs/analog#2243](https://github.com/analogjs/analog/pull/2243) | Diagnostics/docs/test hardening; does not yet claim a full runtime fix.                                  |
| `analogjs/analog#2039` | Blocked                 |          2 | `chore/2039-docs-hosting-investigation`             | None                                                                 | Likely operational rather than repo code.                                                                |
| `analogjs/analog#2038` | Deferred                |          7 | `feat/2038-docs-platform-migration`                 | None                                                                 | Maintainer on-hold comment: <https://github.com/analogjs/analog/issues/2038#issuecomment-4107135282>.    |
| `analogjs/analog#2035` | Deferred                |          9 | `feat/investigate-nitro-vite-plugin`                | [analogjs/analog#2188](https://github.com/analogjs/analog/pull/2188) | Architecture-heavy migration; not v3 GA scope.                                                           |

## Closed Issues With Open PRs

These issue trackers are already closed on GitHub. The PRs below still need maintainer disposition, but the issue state should not be inferred from the PR still being open.

| Closed issue           | Open PR                                                              | Notes                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `analogjs/analog#2229` | [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204) | Tailwind RFC is closed; PR is now only the generator/docs follow-up to [analogjs/analog#2226](https://github.com/analogjs/analog/pull/2226). |
| `analogjs/analog#2172` | [analogjs/analog#2241](https://github.com/analogjs/analog/pull/2241) | Blog root redirect issue is closed upstream; PR may still need separate maintainer action.                                                   |
| `analogjs/analog#2165` | [analogjs/analog#2248](https://github.com/analogjs/analog/pull/2248) | Issue is closed; PR is the remaining content follow-up to evaluate.                                                                          |
| `analogjs/analog#2127` | [analogjs/analog#2247](https://github.com/analogjs/analog/pull/2247) | Issue was narrowed and closed; PR is the remaining scoped router follow-up.                                                                  |
| `analogjs/analog#2177` | [analogjs/analog#2233](https://github.com/analogjs/analog/pull/2233) | Verify-close PR only.                                                                                                                        |
| `analogjs/analog#2168` | [analogjs/analog#2231](https://github.com/analogjs/analog/pull/2231) | Verify-close PR only.                                                                                                                        |

## Important Open PRs Without Open-Issue Gate Movement

These are open PRs that exist in the repo but are not currently release-gate issue drivers in this doc.

- [analogjs/analog#2249](https://github.com/analogjs/analog/pull/2249) `beta`
  Type-only import elision work on the Angular compiler path.
- [analogjs/analog#2230](https://github.com/analogjs/analog/pull/2230)
  Bundle size analysis workflow work, not currently tied to a tracked issue in this plan.

## Canonical References

- `analogjs/analog#2127`: <https://github.com/analogjs/analog/issues/2127#issuecomment-4189209410>
- `analogjs/analog#2044`: <https://github.com/analogjs/analog/issues/2044#issuecomment-4107833684>
- `analogjs/analog#2092`: <https://github.com/analogjs/analog/issues/2092#issuecomment-4188471667>
- `analogjs/analog#2026`: <https://github.com/analogjs/analog/issues/2026#issuecomment-3677561130>
- `analogjs/analog#2049`: <https://github.com/analogjs/analog/issues/2049#issuecomment-4189327385>
- `analogjs/analog#2165`: <https://github.com/analogjs/analog/issues/2165#issuecomment-4107403358>
- `analogjs/analog#2175`: <https://github.com/analogjs/analog/issues/2175#issuecomment-4166726621>
- `analogjs/analog#2038`: <https://github.com/analogjs/analog/issues/2038#issuecomment-4107135282>
- `analogjs/analog#2035`: <https://github.com/analogjs/analog/issues/2035#issuecomment-4127412595>

## Execution Order

1. Stable gate merges: `analogjs/analog#2215`, `analogjs/analog#1939`
2. Test DX merges: `analogjs/analog#2222`, `analogjs/analog#2220`, `analogjs/analog#2218`, `analogjs/analog#2173`, `analogjs/analog#2074`, `analogjs/analog#2029`, `analogjs/analog#2076`
3. Verify-close items: `analogjs/analog#2049`, `analogjs/analog#2026`, `analogjs/analog#2044`, `analogjs/analog#2092`, `analogjs/analog#2159`, `analogjs/analog#2036`
4. Closed-issue / open-PR cleanup: [analogjs/analog#2204](https://github.com/analogjs/analog/pull/2204), [analogjs/analog#2231](https://github.com/analogjs/analog/pull/2231), [analogjs/analog#2233](https://github.com/analogjs/analog/pull/2233), [analogjs/analog#2241](https://github.com/analogjs/analog/pull/2241), [analogjs/analog#2247](https://github.com/analogjs/analog/pull/2247), [analogjs/analog#2248](https://github.com/analogjs/analog/pull/2248)
5. Post-stable tracks only after v3 GA scope is healthy

## Close Criteria

Before calling the v3 plan effectively done:

- Every `Must fix before stable` issue is merged or explicitly de-scoped by maintainers.
- Every `Should fix before stable` item is either merged or intentionally deferred.
- Every `Verify fixed and close` issue has either:
  - a maintainer close, or
  - a fresh repro proving it still belongs back in active scope.
- Closed issues with open PRs are explicitly dispositioned so the PR list does not mislead future planning.
