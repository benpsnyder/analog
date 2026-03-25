---
title: create-analog
description: The create-analog package contains templates for scaffolding new Analog projects.
---

The `create-analog` package contains templates for scaffolding new Analog projects.

::::tabs
:::tab[npm]

```shell
npm create analog@latest
```

:::
:::tab[Yarn]

```shell
yarn create analog
```

:::
:::tab[pnpm]

```shell
pnpm create analog
```

:::
::::

### Optional `create-analog` flags

| Flag         | Description                                                                        | Value type | Default value |
| ------------ | ---------------------------------------------------------------------------------- | ---------- | ------------- |
| &lt;name&gt; | Name of the project. Specify `.` to scaffold the project in the current directory. | string     |               |
| `--template` | Template preset.                                                                   | string     |               |

### Template presets

| Preset                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `Full-stack Application` | Default Analog application.                    |
| `Blog`                   | Default template enhanced with a blog example. |

### Tailwind v4

`create-analog` scaffolds Tailwind v4 with the Vite plugin by default for the current Analog templates. Generated projects use `@tailwindcss/vite`, add `@import 'tailwindcss';` to `src/styles.css`, and do not create a `.postcssrc.json` file or a `tailwind.config.*` file for the standard setup.

If you do not want Tailwind in the generated app, pass `--skipTailwind true`. The default Tailwind v4 flow expects a plain CSS entry file for global styles.

### Example

To scaffold an Angular application in the `my-angular-app` directory, run:

::::tabs
:::tab[npm]

```shell
# npm >=7.0
npm create analog@latest my-angular-app -- --template latest
# npm 6.x
npm create analog@latest my-angular-app -- --template blog
```

:::
:::tab[Yarn]

```shell
yarn create analog my-angular-app --template blog
```

:::
:::tab[pnpm]

```shell
pnpm create analog my-angular-app --template blog
```

:::
::::
