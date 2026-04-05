# Most Valuable Storybook Things For Analog

## Goal

Make `@analogjs/storybook-angular` feel less like "Angular + Vite, but inside Storybook" and more like "Analog app development in isolation".

The best opportunities are the ones where Analog can add real framework value on top of Storybook's existing strengths:

- app-context simulation
- Angular-first testing
- route/content awareness
- zero-friction setup in Nx and Angular workspaces
- first-class docs/theming workflows for real Analog apps

## What Analog Has Today

From the current source review, the integration is useful but thin:

- `packages/storybook-angular/src/lib/preset.ts` swaps Storybook Angular to `@storybook/builder-vite` and wires in `@analogjs/vite-plugin-angular`.
- It adds support for:
  - Angular JIT
  - HMR / `liveReload` compatibility
  - `styles` + Sass `loadPaths` from Angular builder options
  - zoneless detection and `zone.js` injection rules
  - build-time `keepNames` for Compodoc arg type display
- `packages/storybook-angular/src/lib/testing.ts` adds a small `setProjectAnnotations()` wrapper for Storybook testing.
- The builders are mostly pass-through re-exports of Storybook Angular builders.

That means the current package is closer to a Vite preset than a full Analog x Storybook product surface.

## Important Current Gaps

These are the highest-signal issues from the source review.

### 1. Tailwind v4 docs over-promise today

The docs say `framework.options.tailwindCss.rootStylesheet` should work:

- `apps/docs-app/docs/integrations/storybook/index.md`

But `FrameworkOptions` does not include `tailwindCss`:

- `packages/storybook-angular/src/types.ts`

And the Storybook preset does not pass `tailwindCss` through to `angular()`:

- `packages/storybook-angular/src/lib/preset.ts`

So this is currently a docs/product mismatch, not just a missing enhancement.

### 2. The Vitest story is strategically important but still fragile

Analog docs present Angular Storybook + `@storybook/addon-vitest` as supported:

- `apps/docs-app/docs/integrations/storybook/index.md`

But Storybook's current docs still position the official Vitest addon around Vite frameworks like React/Preact/Vue/Svelte/Web Components, not Angular, and Storybook's own docs historically call out Angular limitations in this area.

At the same time, Storybook's Angular framework source already exports portable stories helpers:

- `code/frameworks/angular/src/client/index.ts`
- `code/frameworks/angular/src/client/portable-stories.ts`

That makes this a real opportunity for Analog to become the practical bridge.

### 3. Preview file handling looks narrower than Storybook expects

`angularOptionsPlugin()` only rewrites `preview.ts` exactly:

- `packages/storybook-angular/src/lib/preset.ts`

That is likely too narrow for Storybook configs that use `preview.js`, `preview.mjs`, or other supported variants. It also means style and `zone.js` injection depend on a very specific filename.

### 4. No first-class setup workflow

I did not find an Analog generator, schematic, or Nx workflow that makes Storybook setup feel native to Analog. Right now the docs are mostly manual steps.

For adoption, this is a bigger problem than it looks.

## What Storybook Already Brings

These are the Storybook features worth building around instead of re-inventing:

- Autodocs and custom docs templates
- tags for docs-only, test-only, experimental, stable, etc.
- globals/toolbars for theme, locale, rendering mode
- accessibility addon
- visual testing via Chromatic
- composition across multiple Storybooks
- portable stories and interaction testing primitives
- test runner as the fallback when Vitest support is incomplete

Those are not the product by themselves for Analog. They are the substrate.

## Best Bets For Analog

### 1. Analog App Mode for Storybook

This is the highest-value feature.

Storybook is strongest when components render with real app context. Analog should make it trivial to story-render:

- router state
- route params
- query params
- route data
- injected providers
- content collections
- app-level styles and theme setup
- feature flags / environment variants

The model to aim for is similar to how Storybook's framework integrations for app frameworks stub routing and app services, but tailored for Analog:

```ts
export default {
  component: UserPageComponent,
  parameters: {
    analog: {
      route: '/users/42?tab=activity',
      params: { id: '42' },
      query: { tab: 'activity' },
      providers: [provideAuthMock()],
      content: {
        collections: ['docs', 'blog'],
      },
    },
  },
};
```

What this unlocks:

- stories for route components stop being awkward
- Analog router/content become visible inside Storybook instead of being external prerequisites
- stories become closer to app scenarios, not just leaf component demos

This is the feature that would make Analog and Storybook feel genuinely integrated.

### 2. Official Angular Storybook Testing That Actually Feels Supported

This is the best differentiator available right now.

Storybook's modern testing story is moving toward Vitest, Storybook UI test widgets, accessibility integration, and portable stories. Angular is not the cleanest first-party path there today, but Analog already has enough pieces to build a credible bridge:

- `@analogjs/storybook-angular/testing`
- `@analogjs/vitest-angular`
- Storybook Angular portable stories exports

What Analog should do:

- publish an explicitly supported Angular recipe for Storybook + Vitest
- add real repo coverage for it
- document what works in CLI, what works in Storybook UI, and what still falls back to the test runner
- make `test-storybook` feel native in Nx and Angular workspaces
- integrate accessibility test guidance from the start

If Analog can become the easiest way to get "Storybook tests for Angular that don't feel second-class", that is a meaningful ecosystem position.

### 3. Fix and Productize Tailwind v4 Support

This should move from "doc claim" to "hard-supported feature".

Analog already has strong Tailwind v4 machinery in `@analogjs/vite-plugin-angular`, including `tailwindCss.rootStylesheet` support. Storybook should inherit that cleanly.

Needed work:

- add `tailwindCss` to `FrameworkOptions`
- pass it through in `packages/storybook-angular/src/lib/preset.ts`
- add tests
- document monorepo cases, especially `server.fs.allow`
- provide one blessed Analog + Storybook Tailwind recipe

This is high-value because Tailwind + Storybook is a daily workflow issue, not a niche feature.

### 4. Native Analog Storybook Generator / Automigrate

Analog should have a setup command that does the boring work correctly:

- `.storybook/main.ts`
- `.storybook/preview.ts`
- `project.json` or `angular.json` targets
- `styles` wiring
- Compodoc setup or explicit opt-out
- optional Vitest setup
- optional a11y addon
- optional Chromatic addon
- Nx tsconfig paths plugin when in Nx
- Tailwind recipe when detected

Good shape:

- `ng g @analogjs/storybook-angular:setup`
- `nx g @analogjs/storybook-angular:setup`

This will do more for adoption than several deeper features combined.

### 5. Storybook-Aware Analog Router and Content Helpers

Analog should lean into the parts Storybook cannot know about generically.

Examples:

- `withAnalogRouter()`
- `withAnalogContent()`
- `withAnalogRequestContext()`
- `withAnalogTheme()`

Or a single `analogAppConfig()` decorator API that composes them.

This would reduce repetitive `applicationConfig()` and custom provider boilerplate in stories, especially for route-level and app-shell stories.

### 6. Better Docs Mode for Real Analog Apps

Storybook already has strong docs primitives:

- autodocs
- custom docs pages
- table of contents
- subcomponents
- docs-only stories via tags

Analog can improve the Angular/Analog-specific side by providing:

- a recommended docs template for standalone Angular components
- better defaults for route/page stories
- better Compodoc handling for monorepos
- examples for documenting content-driven and routed experiences, not just leaf components

This matters because Analog is not just a component library toolchain. It is used to build actual applications.

### 7. First-Class Storybook Composition for Analog Monorepos

Storybook composition is a strong fit for the Analog repo shape:

- framework primitives
- app examples
- docs/demo apps
- design-system-style libraries

Analog could provide clear guidance and maybe utilities for:

- composing multiple package Storybooks
- separating "framework internals" from "consumer examples"
- publishing a docs/demo Storybook plus package Storybooks

This is less foundational than App Mode or Testing, but very good for large teams and the Analog monorepo itself.

### 8. Tags and Globals Presets for Common Analog Workflows

Storybook's tags and globals are already powerful. Analog should package conventions around them.

Examples:

- globals for theme, locale, rendering mode, motion reduction
- tags like `autodocs`, `experimental`, `stable`, `route`, `content`, `docs-only`
- recommended sidebar filtering patterns for large app Storybooks

This is not a flagship feature, but it is cheap and high-leverage.

### 9. Safer Vite Config Reuse Instead of Blanket Plugin Stripping

Right now the preset removes any Vite plugin whose name includes `analogjs`:

- `packages/storybook-angular/src/lib/preset.ts`

That is understandable as a defensive move, but it is blunt.

Better direction:

- selectively reuse safe app Vite config
- provide an explicit opt-in for Analog-aware config bridging
- preserve aliases, env, shared plugins, and file replacement behavior where safe
- avoid double-registering full Analog platform plugins unless explicitly requested

This could become part of App Mode.

## Ranked Roadmap

If I were sequencing this for impact:

1. Fix current product mismatches
2. Ship an Analog Storybook setup generator
3. Make Tailwind v4 support real and tested
4. Make Angular Storybook testing a supported Analog workflow
5. Build Analog App Mode with route/query/provider/content support
6. Add Storybook-focused router/content helpers and docs presets
7. Expand monorepo composition guidance and templates

## Concrete Fixes Worth Doing Immediately

These are small enough to ship early and materially improve credibility:

- Add `tailwindCss` typing and pass-through support.
- Broaden preview file detection beyond `preview.ts`.
- Add repository tests for the documented Vitest integration.
- Add one full example app showing:
  - standalone Angular stories
  - route/page stories
  - `applicationConfig`
  - theme globals
  - accessibility addon
  - test-storybook workflow

## Product Thesis

The strongest Storybook strategy for Analog is not "support more Storybook features".

It is:

**make Storybook understand Analog app scenarios well enough that stories become a first-class way to build, test, and document Analog applications, not just isolated Angular components.**

That means the most valuable investments are:

- app-context simulation
- Angular-first testing
- route/content-aware helpers
- setup that feels native and automatic

Everything else is supportive.

## Sources Reviewed

Analog source:

- `packages/storybook-angular/src/lib/preset.ts`
- `packages/storybook-angular/src/types.ts`
- `packages/storybook-angular/src/lib/testing.ts`
- `packages/storybook-angular/README.md`
- `apps/docs-app/docs/integrations/storybook/index.md`
- `apps/analog-app/.storybook/main.ts`
- `apps/analog-app/.storybook/preview.ts`
- `apps/analog-app/project.json`
- `packages/vite-plugin-angular/src/lib/angular-vite-plugin.ts`

Storybook source:

- `code/frameworks/angular/src/preset.ts`
- `code/frameworks/angular/src/client/index.ts`
- `code/frameworks/angular/src/client/portable-stories.ts`
- `docs/get-started/frameworks/angular.mdx`
- `docs/writing-tests/integrations/vitest-addon/index.mdx`
- `docs/api/portable-stories/portable-stories-vitest.mdx`
- `docs/writing-docs/autodocs.mdx`
- `docs/writing-stories/tags.mdx`
- `docs/essentials/toolbars-and-globals.mdx`
- `docs/writing-tests/accessibility-testing.mdx`
- `docs/writing-tests/visual-testing.mdx`
- `docs/sharing/storybook-composition.mdx`

Official docs links:

- https://storybook.js.org/docs/get-started/frameworks/angular
- https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
- https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest
- https://storybook.js.org/docs/writing-docs/autodocs
- https://storybook.js.org/docs/writing-stories/tags
- https://storybook.js.org/docs/essentials/toolbars-and-globals
- https://storybook.js.org/docs/writing-tests/accessibility-testing
- https://storybook.js.org/docs/writing-tests/visual-testing
- https://storybook.js.org/docs/sharing/storybook-composition
