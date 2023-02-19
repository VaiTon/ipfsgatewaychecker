# IPFS Gateway Checker

Try to query a list of IPFS gateways for a given CID and return the ones that respond with a 200 status code.

It can be used to check if a CID is available on a given gateway, and to provide a page with a list of gateways that have the CID.

## Usage

Go to <https://ipfsgatewaychecker.pages.dev/> and enter a CID.

## Developing

Checkout the project and install dependencies with `npm install` (or `pnpm install` or `yarn`), then start a development server:

```bash
npm run dev

```

## Building

To create a production version of this app:

```bash
npm run build
```

The current adapter is [`@sveltejs/adapter-cloudflare`](https://kit.svelte.dev/docs/adapter-cloudflare),

You can preview the production build with `npm run preview`.
