# KML Production — Public Website (Next.js)

The public, SEO-facing website (`/` and `/work`), converted from the Vite SPA to
**Next.js (App Router)** so every page is **server-rendered** with real content,
`<title>`/`<meta>` tags, Open Graph tags, JSON-LD structured data, `sitemap.xml`
and `robots.txt` — everything a search engine needs.

The **admin panel stays the Vite SPA** in [`../frontend`](../frontend) and the
**Laravel API** in [`../backend`](../backend) is unchanged. This app only reads
the public content endpoint `GET /api/public/site` and posts the contact form to
`POST /api/public/inquiries`.

## How SEO works here

- `app/page.tsx` and `app/work/page.tsx` are **Server Components**. They fetch
  the site content on the server (`lib/api.ts`, ISR `revalidate: 60`) and pass it
  as `initialData` to the client components (`components/SiteClient.tsx`,
  `WorkClient.tsx`). Because the data is present on the server render, the full
  HTML — hero copy, projects, services, testimonials — ships in the response.
- `generateMetadata()` builds the per-page title/description/OG/Twitter tags from
  the studio's admin settings.
- Content edited in the admin panel appears within ~60s (ISR) without a redeploy.

## Run locally

The Laravel API must be running (see `../backend`). Then:

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

Env vars (`.env.local`, already created for dev — see `.env.example`):

| Var                    | Used by            | Purpose                                  |
| ---------------------- | ------------------ | ---------------------------------------- |
| `API_URL`              | Next server (SSR)  | Base URL to reach Laravel API            |
| `NEXT_PUBLIC_API_URL`  | Browser            | Contact-form POST target                 |
| `NEXT_PUBLIC_SITE_URL` | Both               | Canonical / sitemap / OG absolute URLs   |
| `ADMIN_ORIGIN`         | Next server (opt.) | Proxy `/admin/*` to the Vite admin app   |

## Production build → **static export (shared hosting friendly)**

`next.config.ts` sets `output: 'export'`, so `npm run build` produces a plain
`out/` folder of HTML/CSS/JS with **no Node runtime required** — it runs on any
shared / cPanel / Apache host, exactly like a normal static site.

```bash
# Point the build at the LIVE production API + domain, then build:
#   .env.production.local  (or export the vars in your shell)
#   API_URL=https://yourdomain.com/api
#   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
#   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
npm run build
# → upload everything inside  web/out/  to the host's public_html/
```

- **SEO:** content is fetched at build time and baked into the HTML, so crawlers
  get the full page. `API_URL` must be reachable when you run `npm run build`.
- **Live content:** on load, the browser re-fetches `NEXT_PUBLIC_API_URL/public/site`
  and updates to the latest admin edits — so you only rebuild when the *structure*
  changes, not for every content edit. (If you prefer, rebuild + re-upload to also
  refresh the baked-in HTML that crawlers see.)

### Deploying alongside the admin panel + API on one shared host

- `public_html/` ← contents of `web/out/` (the public site + `sitemap.xml`,
  `robots.txt`).
- `public_html/admin/` ← the built admin SPA (`frontend` → `vite build`, with Vite
  `base: '/admin/'`). It's static too, so no Node needed.
- The Laravel API (`backend`) runs as normal PHP on the same host under `/api`.

> This replaces the earlier SSR/`npm start` approach, which needed a Node host.
> Static export gives the same SEO while running on plain shared hosting.
