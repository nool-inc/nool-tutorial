# nool-tutorial

The course project for [Learn Nool](https://www.nool.dev/tutorial): a small webhook service with a billing module and an API. Every module of the course works on this repository, and each one builds on the last.

```bash
git clone https://github.com/nool-inc/nool-tutorial.git
cd nool-tutorial
npm install
npm test
```

You need Node 22.18 or later and Git. Node runs the TypeScript directly; `npm install` only adds TypeScript and Node's types, so the type check Nool runs on every change can pass.

## What is in it

```
src/
  index.ts             starts the server and the webhook delivery loop
  queue.ts             webhook events waiting to be delivered
  api/
    router.ts          a tiny Express-style router
    routes.ts          GET /health, POST /v1/charges, GET /v1/invoices
    health.ts          answers 501 until Module 02
    server.ts          the HTTP server
  billing/
    client.ts          deliver() sends webhooks; charge() and listInvoices()
    provider.ts        an in-memory stand-in for a payment provider
tests/                 Node's built-in test runner
docs/retry-policy.md   written by an agent in Module 17
course/                notes for each module: what to change, and the code
scripts/
  test.mjs             npm test, or npm test -- billing for one area
  setup-workspace.sh   Module 18: two more repositories that call this one
```

Run it with `npm start` (port 3000), and set `WEBHOOK_URL` to have each charge delivered as a `charge.succeeded` webhook.

## How the course uses it

The exercises are `todo` tests. They run every time and show as ⚠ until you do the work, then turn ✔:

```
⚠ GET /health answers 200 with status ok # Module 02: your first change
```

A `todo` test never fails `npm test`, so Nool's checks keep passing while you work. Once one is green, remove its `todo` option so it guards the code.

Start at [course/README.md](course/README.md), or go straight to the course at [nool.dev/tutorial](https://www.nool.dev/tutorial).

## Start again

Delete the folder and clone it again. Nool keeps everything in `.nool` inside the repository, so nothing is left behind.

## Licence

MIT
