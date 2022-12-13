# Dashboard Starter Kit

This is a tool to consume the pipes and visualize all the events that has been sent to your data project.

## Tech stack

To build this Starter Kit template we have used:

- [Next.js](https://nextjs.org/) with [React](https://reactjs.org/) v18 as a framework
- [Vercel](https://vercel.com/) as deployment system
- [Tailwind](https://tailwindcss.com/) with theme configuration for CSS styling
- [SWR](https://swr.vercel.app/es-ES) for data fetching
- [Tremor](https://tremor.so/) for graph plotting
- [Vitest](https://vitest.dev/) for unit testing
- [Cypress](https://www.cypress.io/) for e2e testing

## How to use it?

### Install

First of all, you have to clone the repo if you haven't already

```bash
$ git clone git@github.com:tinybirdco/web-analytics-starter-kit.git
```

Then navigate into the `/dashboard` folder and install the dependencies

```bash
$ cd web-analytics-starter-kit/dashboard
$ npm install
```

### Build for Development

Once you have installed the dependencies, run:

```bash
npm run dev
```

You will find the app running at http://localhost:3000

### Build for Production

```bash
npm run build
```

```bash
npm run start
```

 And you will find the app running at but with the production bundle http://localhost:3000

### Deployment

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

## Contributing

Contributions are always welcome. To contribute, commit your changes into a new branch, and open a pull request against the main branch.

Please be careful in describing the problem and the implemented solution so that we can make the best review possible.

### Issues

Also, you can [open an issue](https://github.com/tinybirdco/web-analytics-starter-kit/issues) if you've encountered a bug or an enhancement on the Dashboard.

## Customization

We encourage you to [fork](https://docs.github.com/es/get-started/quickstart/fork-a-repo) the repo and customize the dashboard adapting it to your needs and to your branding image.

You will be able to change the main colors, the font and other theme configration modifying the [tailwind.config.js](./tailwind.config.js) file. However, colors defined in [styles/theme/tremor-colors.ts](styles/theme/tremor-colors.ts) are predefined and cannot be changed

## Authors

[Rafa Moreno](https://github.com/rmorehig)

[Raquel Yuste](https://github.com/raqyuste)

## Licence

MIT License

Copyright (c) 2022 Tinybird.co

Permission is hereby granted, free of charge, to any person obtaining a copy
