# Running and deploying

## Locally

```bash
npm install
npm run dev
```

Two things will waste your afternoon if you do not know them:

- **Check which port it actually took.** If a stale server is holding 3000,
  Next moves to 3001 without much fuss and you end up debugging an old build.
  The startup line tells you; believe it over habit.
- **Never run `next build` while `next dev` is running.** They share `.next`,
  and the result is a broken mixture that looks like the stylesheet has
  collapsed.

## Building

```bash
npm run build && npm start
```

The whole site prerenders to static content — there is no server, no database
and no API. First load is ~160 kB of JS.

## Deploying

Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
Vercel detects Next.js and needs no configuration: no environment variables, no
build settings, no secrets. Every push to `main` redeploys.

Netlify, Cloudflare Pages or any static host works equally well — `npm run
build` and serve. Add `output: 'export'` to `next.config.mjs` if you need a
pure static bundle with no Node runtime at all.

### A domain

Buy it wherever, then point it at the host. On Vercel that is Settings →
Domains, and it issues the certificate itself.

## Changing things without touching components

| what | where |
|---|---|
| every word on the site | `src/config/site.ts` |
| every file the site loads | `src/config/assets.ts` |
| the measured geometry | `src/config/tokens.ts` |

Contact destinations, the Polaroid captions and angles, the skills list, the
education and experience entries — all copy, all in `site.ts`. Nothing in
`src/components` needs editing to change content.

## Utilities

```bash
npm run shoot -- hero 1440 900 0 4200        # screenshot: name, w, h, scrollY, wait
npm run shoot -- whole 1440 900 0 4200 full  # full page
python tools/extract-cutout.py --preview     # rebuild the transparent portrait
```

`tools/` is optional. `npm uninstall playwright && rm -rf tools` if you would
rather not carry it.
