---
title: Getting Started
description: Creating an Analog project can be done with minimal steps.
---

Creating an Analog project can be done with minimal steps.

## System Requirements

Analog requires the following Node and Angular versions:

- Node v18.13.0 and higher is recommended
- Angular v15 or higher

## Creating a New Application

To create a new Analog project, you can use the `create-analog` package with your package manager of choice:

::::tabs
:::tab[npm]

```shell
npm create analog@latest
```

:::

:::tab[yarn]

```shell
yarn create analog
```

:::

:::tab[pnpm]

```shell
pnpm create analog
```

:::

:::tab[bun]

```shell
bun create analog
```

:::
::::

You can also [scaffold a new project with Nx](/docs/integrations/nx).

### Serving the application

To start the development server for the application, run the `start` command.

::::tabs
:::tab[npm]

```shell
npm run start
```

:::

:::tab[yarn]

```shell
yarn start
```

:::

:::tab[pnpm]

```shell
pnpm start
```

:::

:::tab[bun]

```shell
bun start
```

:::
::::

Visit [http://localhost:5173](http://localhost:5173) in your browser to view the running application.

Next, you can [define additional routes using components](/docs/features/routing/overview) for navigation.

### Building the Application

To build the application for deployment

::::tabs
:::tab[npm]

```shell
npm run build
```

:::

:::tab[yarn]

```shell
yarn build
```

:::

:::tab[pnpm]

```shell
pnpm run build
```

:::

:::tab[bun]

```shell
bun run build
```

:::
::::

### Build Artifacts

By default, Analog comes with [Server-Side Rendering](/docs/features/server/server-side-rendering) enabled.
Client artifacts are located in the `dist/analog/public` directory.
The server for the API/SSR build artifacts is located in the `dist/analog/server` directory.

## Migrating an Existing Application

You can also migrate an existing Angular application to Analog. See the [migration guide](/docs/guides/migrating) for migration steps.
