# LabFix: Computer Laboratory Issue Reporting System

LabFix lets students and faculty report broken computers in the university computer labs. They take a photo, pick the lab and PC number, describe the problem, and submit. IT Support staff see every report on a dashboard and update each report's status (**Pending → In Progress → Resolved**).

> **Current stage: interface only.** The backend uses **in-memory mock data**, and nothing is connected to AWS yet. Data resets when the server restarts, and uploaded photos are checked but not saved.

Built with **Next.js 16 (App Router, JavaScript)** and **Tailwind CSS 4**. The only dependencies are `next`, `react`, `react-dom`, and Tailwind.

---

## Run locally

Requirements: **Node.js 20.9 or newer** (`node -v`).

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env.local        # Windows PowerShell: Copy-Item .env.example .env.local

# 3. Generate a session secret and paste it after SESSION_SECRET= in .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Start the development server
npm run dev
```

Open http://localhost:3000.

To test the production build locally:

```bash
npm run build
npm start
```

## Demo login accounts

| Role | Email | Password |
|---|---|---|
| Reporter (student / faculty) | `reporter@labfix.edu` | `Reporter123!` |
| IT Support | `itsupport@labfix.edu` | `Support123!` |

The login page shows these accounts only when `NODE_ENV` is not `"production"`, so they are hidden after `npm run build` + `npm start`. They still work there.

## Pages

| URL | Who | What it does |
|---|---|---|
| `/` | everyone | Sends you to `/login`, or to your home page if you are logged in |
| `/login` | everyone | Email + password login |
| `/report` | Reporter | Form to report an issue (lab, PC number, issue type, description, photo) |
| `/my-reports` | Reporter | Your own reports and their status |
| `/dashboard` | IT Support | Summary cards, filters (`?lab=lab-1&status=Pending`), and a reports table |
| `/dashboard/reports/LF-0001` | IT Support | Report details, photo, status update form, and activity timeline |

## Folder and file guide

```
LabFix/
├── app/                          Pages and API routes (Next.js App Router)
│   ├── layout.js                 Root HTML layout
│   ├── globals.css               Tailwind import + school color tokens (brand / gold / crimson)
│   ├── page.js                   "/" redirect logic
│   ├── not-found.js              404 page
│   ├── login/page.js             Login page (shows demo accounts in development)
│   ├── (app)/                    Logged-in pages (the "(app)" group does not appear in URLs)
│   │   ├── layout.js             Checks the session and shows the Navbar
│   │   ├── error.js              Friendly error screen
│   │   ├── report/page.js        Report an Issue (Reporter)
│   │   ├── my-reports/page.js    My Reports (Reporter)
│   │   └── dashboard/
│   │       ├── layout.js         IT Support-only check for all dashboard pages
│   │       ├── page.js           Dashboard (IT Support)
│   │       ├── loading.js        Loading skeleton
│   │       └── reports/[id]/page.js  Report details (IT Support)
│   └── api/                      Placeholder API (Route Handlers)
│       ├── auth/login/route.js   POST: log in (rate limited)
│       ├── auth/logout/route.js  POST: log out
│       ├── reports/route.js      POST: create report (multipart, with photo)
│       └── reports/[id]/route.js PATCH: update status + remarks (IT Support only)
├── components/                   Reusable UI pieces
│   ├── Navbar.js                 Logo, role-based links, user name, Log out
│   ├── StatusBadge.js            Pending (red), In Progress (yellow), Resolved (blue)
│   ├── StatusProgress.js         3-step Pending → In Progress → Resolved bar
│   ├── SchoolStripe.js           Blue / yellow / red brand band
│   ├── ReportForm.js             Report form with chips, counter, photo preview
│   ├── LoginForm.js              Login form
│   ├── StatusUpdateForm.js       IT Support status form
│   ├── SummaryCards.js, Filters.js, ReportsTable.js   Dashboard parts
│   ├── Timeline.js, PhotoPlaceholder.js               Report details parts
│   └── Alert.js, EmptyState.js, PageHeader.js, SubmitButton.js, Spinner.js, Logo.js
├── lib/                          Server logic (no UI)
│   ├── data.js                   ALL mock data + data functions  ← replace with RDS later
│   ├── storage.js                Photo upload placeholder       ← replace with S3 later
│   ├── session.js                Signed session cookie + role checks
│   ├── validation.js             Server-side input + photo validation
│   ├── password.js               scrypt password hashing
│   ├── rate-limit.js             Login rate limit (in-memory Map)
│   ├── request.js                Same-origin check for POST/PATCH (CSRF protection)
│   ├── constants.js              Roles, statuses, issue types, limits
│   ├── status-styles.js          Color of each status (badge, dot, card edge)
│   └── format.js                 Date formatting
├── next.config.mjs               Security headers, poweredByHeader: false
├── .env.example                  Example environment variables (copy to .env.local)
├── DEPLOYMENT.md                 Step-by-step AWS Free Tier deployment guide
└── README.md
```

## Security features

1. **Passwords** are hashed with Node's `crypto.scrypt` and a random salt, then compared with `timingSafeEqual`. No plain-text passwords are stored.
2. **Session** is a cookie signed with HMAC-SHA256 (`SESSION_SECRET`) that holds only `id`, `name`, `role`, and the expiry time. It is `httpOnly`, `sameSite: "lax"`, `path: "/"`, and expires after 8 hours. `secure` is controlled by `COOKIE_SECURE`.
3. **Role checks on the server** for every protected page and API route. APIs return `401` when you are not logged in and `403` when your role is wrong.
4. **Server-side validation**: the lab must exist, the PC number must match `/^[A-Za-z0-9-]{1,10}$/`, the issue type must be on the allowed list, and the description must be 10–500 characters.
5. **Photo checks**: maximum 5 MB, MIME type must be JPEG/PNG/WEBP, **magic bytes** must match a real image, and the file gets a random `crypto.randomUUID()` name.
6. **Login rate limit**: 5 attempts per 15 minutes per IP + email.
7. **Generic login errors**: "Invalid email or password".
8. **Security headers**: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and no `X-Powered-By`.
9. **No secrets in code**: secrets live in `.env.local`, which `.gitignore` ignores.
10. **No `dangerouslySetInnerHTML`**. React escapes all text.
11. **Same-origin check** on POST/PATCH API requests (extra CSRF protection).

> Note: the mock data and the rate limit live in memory, so they only work correctly with **one** server process. That is fine for one EC2 instance running one PM2 process.

---

## Next steps

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full step-by-step AWS Free Tier guide. Summary:

1. **Connect RDS MySQL in `lib/data.js`.** Install `mysql2`, create a connection pool from `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`, and replace each function body at its `// TODO: replace with RDS MySQL query` comment. Keep the function names and return shapes the same so no page needs to change. Always use `?` placeholders (prepared statements).
2. **Connect Amazon S3 in `lib/storage.js`.** Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`, then uncomment the example code. Credentials come from the **EC2 IAM Role**, so there are no access keys in code or `.env`. Keep the bucket private and show photos with short-lived pre-signed URLs.
3. **Deploy to EC2 with PM2 + Nginx.**
   - Run `npm ci && npm run build`, then `pm2 start npm --name labfix -- start`.
   - Nginx proxies port 80 to `127.0.0.1:3000`, with `client_max_body_size 6M;` so 5 MB photos can be uploaded. It must pass the `Host` and `X-Forwarded-For` headers.
   - A t3.micro has only 1 GB RAM, so **add a swap file** before running `npm run build` (or build on your computer and copy the `.next` folder).
   - Keep `COOKIE_SECURE=false` while using plain HTTP. Change it to `true` once HTTPS is set up.
