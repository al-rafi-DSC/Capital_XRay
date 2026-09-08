# Capital X-Ray webapp

The Next.js frontend and Gemini explanation endpoint for Capital X-Ray.

See the [project README](../README.md) for the product overview, dataset, scoring formulas, regression methodology, pipeline setup and known limitations.

## Run locally

With Node.js and npm installed, run these commands from this directory:

```sh
npm ci
npm run dev
```

Open the local address printed in the terminal, normally http://localhost:3000. To use another port, run `npm run dev -- --port 4300`.

The generated data and model modules in `lib/` are included. To enable live Gemini explanations, create or update `.env.local` with your own `GEMINI_API_KEY` and restart the server. The app uses template explanations if the API is unavailable.

## Build and check

```sh
npm run lint
npm run build
npm run start
```

Lint is a separate check because the current Next.js configuration skips ESLint during builds. The main app needs a Node.js server for `/api/explain`.

Regenerate `lib/capital-data.ts` and `lib/capital-model.ts` using the Python scripts described in the root README.
