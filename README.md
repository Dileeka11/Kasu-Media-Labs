# KML Production — Company Website + Admin CMS

Full-stack implementation of the Claude Design handoff (**KML Production v2.dc.html** + **KML Admin.dc.html**).
**React + TypeScript (Vite)** frontend · **Laravel 12 + Sanctum + MySQL** backend.

## Routes

| URL | What |
|---|---|
| `/` | Public company website (hero showreel, ticker, about, services, work index, films, process, testimonials, gear, CTA, contact form, light/dark theme) |
| `/admin` | Admin CMS (login required) |

The website is CMS-driven: the Work index and Films sections list **published** projects from the database (drafts appear too if the "Show drafts on public site" setting is on), category filter chips come from Categories, the contact form creates entries in the admin's **Inquiries** (with unread badge + activity log), and the studio contact email comes from Settings.

## Admin modules (matches the design 1:1)

- **Login** — split-panel gradient sign-in (demo credential box included)
- **Dashboard** — Total Projects / Total Views / New Inquiries / Published stat cards, 14-bar "Views — last 30 days" chart, recent activity feed
- **Projects** — table with thumbnail, category, status (Published / Draft / Review), views, date; create/edit via the New Project modal (drag & drop cover upload), delete
- **Categories** — card grid with slug + project counts, add/edit/delete
- **Inquiries** — lead list with unread dots, type/budget, relative time, Reply (marks read + opens mail); unread badge in sidebar
- **Users & Roles** — Owner / Editor / Producer / Viewer with colored role pills, last-active tracking, invite/manage/remove
- **Settings** — studio profile + preference toggles (persisted)

## Requirements

- PHP 8.2+ with `zip` extension (XAMPP works), Composer, Node 18+, MySQL/MariaDB on 3306

## Running locally

1. **Start MySQL** (XAMPP Control Panel → MySQL → Start). Create the database once:
   ```sql
   CREATE DATABASE kml_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Backend** (port 8000):
   ```
   cd backend
   composer install
   php artisan migrate:fresh --seed
   php artisan storage:link
   php artisan serve
   ```

3. **Frontend** (port 5173):
   ```
   cd frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:5173 (website) — admin at http://localhost:5173/admin

## Demo login (as in the design)

| Email | Password |
|---|---|
| `admin@kml` | `kml` |

`admin@kml` is an alias for Karim Malik (Owner, `karim@kmlproduction.com`). All seeded team members use password `kml`.

## API (Sanctum bearer token, base `http://localhost:8000/api`)

| Endpoint | Notes |
|---|---|
| `GET /public/site` | Public: published projects, categories, studio info (no auth) |
| `POST /public/inquiries` | Public: contact form → creates an inquiry (no auth) |
| `POST /login`, `POST /logout`, `GET /me` | Auth (login accepts the `admin@kml` alias) |
| `GET /dashboard` | Stats, chart bars, recent activity |
| `projects` | CRUD; multipart with `thumbnail` image; auto `published_at`; activity logged |
| `categories` | CRUD; slug auto-generated; delete blocked while projects exist |
| `inquiries` | index / mark read (`PUT {unread}`) / delete |
| `users` | CRUD; roles owner/editor/producer/viewer; self-delete blocked |
| `GET/PUT /settings` | Studio profile + preferences singleton |

Thumbnails are stored on the `public` disk (`storage/app/public/thumbnails`) and served via `/storage` (requires `php artisan storage:link`).
