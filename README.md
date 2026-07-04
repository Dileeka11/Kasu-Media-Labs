# KML Admin — Kasu Media Labs Admin Panel

Full-stack admin panel: **React + TypeScript (Vite)** frontend and **Laravel 12 + MySQL** backend.

## Modules

- **Dashboard** — revenue, outstanding invoices, active projects, clients, new leads, 6-month revenue chart
- **Clients** — client directory with status and project counts
- **Projects** — projects per client with type, budget, deadline, status
- **Services** — service catalogue with pricing
- **Invoices** — invoices with line items, auto-numbering (`INV-YYYY-NNNN`), status tracking
- **Leads** — inquiry pipeline (new → contacted → qualified → converted / lost)
- **Team** — user management with roles (admin / manager / staff)
- **Settings** — profile and password

## Requirements

- PHP 8.2+ with the `zip` extension enabled (XAMPP works)
- Composer, Node.js 18+, MySQL/MariaDB on port 3306

## Running locally

1. **Start MySQL** (XAMPP Control Panel → MySQL → Start). Database `kml_admin` must exist:
   ```sql
   CREATE DATABASE kml_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Backend** (port 8000):
   ```
   cd backend
   composer install
   php artisan migrate --seed
   php artisan serve
   ```

3. **Frontend** (port 5173):
   ```
   cd frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:5173

## Default login

| Email | Password |
|---|---|
| `admin@kasumedialabs.com` | `kml@admin123` |

> Change this password after first login (Settings → Change Password).

## API

Token auth via Laravel Sanctum (`Authorization: Bearer <token>`). Base URL `http://localhost:8000/api` — override with `VITE_API_URL` in `frontend/.env`.

| Endpoint | Notes |
|---|---|
| `POST /login`, `POST /logout`, `GET /me` | Auth |
| `GET /dashboard` | Stats + chart data |
| `clients`, `projects`, `services`, `invoices`, `leads`, `users` | REST resources (index/store/update/destroy) |
| `PUT /profile`, `PUT /profile/password` | Own profile |
