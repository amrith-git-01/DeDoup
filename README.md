# DeDoup

DeDoup is a web activity and download tracking application. It helps users monitor their downloads (including duplicate detection), view download and browsing analytics in a central dashboard, and track screen time by domain via a browser extension. Data is collected by the extension, stored and aggregated by the backend, and visualized in the dashboard.

---

## Use Cases

**Download tracking and duplicate awareness**  
The extension observes completed downloads and sends each file’s metadata (filename, URL, size, content hash, category) to the backend. The backend records the download and classifies it as new or duplicate based on whether the same hash was seen before for that user. Users can see download history, trends, file and source analytics, and filter or open a details view from the dashboard.

**Browsing and screen time**  
When the user switches tabs or closes them, the extension records time spent per domain (visit start/end and duration). These visits are sent to the backend in batches. The dashboard shows today’s screen time, visits and sites, week and month aggregates with comparisons to previous periods, today-by-domain breakdown, recent visits, and a screen-time-over-time chart.

**Single account across surfaces**  
Users sign up or log in once. The dashboard is used for authentication; the extension receives auth (e.g. via external messaging) and then calls the same backend APIs with the same identity so download and browsing data are tied to one account.

---

## How It Is Implemented

**Data flow**  
The browser extension (Chrome) runs a service worker that (1) listens to download completion events, computes file hash and category, and POSTs to the backend track endpoint; (2) maintains a per-tab “current visit” and a local queue of visit records, and periodically syncs that queue to the backend browsing ingest endpoint. The backend persists downloads (files + events) and browsing (visits + domains) in MongoDB, and exposes REST APIs for history, metrics, and analytics. The dashboard (React SPA) and the extension UI both call these APIs to display summaries, charts, lists, and filters.

**Authentication**  
The backend provides signup and login (JWT). The dashboard stores the token and sends it on API requests. The extension obtains the token via Chrome external messaging from the dashboard (or a login flow) and stores it in Chrome storage, then attaches it to requests so the backend can associate all tracking data with the logged-in user.

---

## Metrics Tracked

**Downloads (extension collects; backend stores and aggregates)**

- Per download: filename, URL, content hash, size, file extension, MIME type, inferred category (document, image, video, audio, archive, etc.), source domain, and status (new vs duplicate). The backend stores one file record per unique hash per user and one event per download; status is derived from whether the file already existed.
- Aggregated metrics: total/new/duplicate counts and total/new/duplicate sizes (summary); today/week/month download counts with change vs yesterday/last week/last month (trends); per-day totals and new/duplicate breakdown (daily activity); most active hour and day in the week (habits); per-category and per-extension counts and sizes with new/duplicate split (file metrics); per-source-domain download counts and sizes (source stats). Download history is queryable with filters (date range, category, extension, source domain, status) and pagination.

**Browsing (extension collects; backend stores and aggregates)**

- Per visit: domain (hostname), start time, end time, and duration in seconds. The extension records these when the user switches tabs, closes a tab, or goes idle; they are batched and sent to the backend.
- Aggregated metrics: total screen time and visit/site counts for today (with comparison to yesterday), for the current week (vs previous week), and for the current month (vs previous month); daily time series (total seconds, visit count, distinct site count per day); today’s breakdown by domain (time and visit count per domain); recent visits list (last N visits with domain, duration, end time). The backend normalizes domains and stores visits and domain references per user.

---

## Frontend Display

**Dashboard – Downloads**

- **Overview (left column):** Cards for today’s download count (vs yesterday), this week (vs last week), this month (vs last month), peak hour and peak day in the week. Cards are clickable and can open the details drawer filtered by the corresponding period or habit.
- **Downloads health and storage (right column):** Two horizontal bar-style visualizations: one for download counts (new vs duplicate vs total) and one for storage (new size vs duplicate size vs total), with labels and optional bubble clicks to filter the drawer.
- **Download activity (next row):** Two-column layout: an activity chart (bar chart of downloads over time, with date click to filter) and a “Recent downloads” list (last 10 items: filename, size, time ago, new/duplicate badge; click to open details). Fixed height with scroll for the list.
- **File analytics:** One card with a metric-type selector (file categories vs file extensions). List/pie/bar views of counts and sizes by category or extension, with a “Total” row and clickable rows that open the details drawer filtered by that category or extension.
- **Source analytics:** One card showing “Domains” with list/pie/bar views of download counts and sizes by source domain; top N domains plus “Others,” with row/clicks opening the drawer filtered by that source or by “Others” (exclude top N).
- **Details drawer:** Slide-out panel showing filtered download history (from overview, health bar, activity date, file analytics, or source analytics), with pagination and list items (filename, size, date, status, etc.).

**Dashboard – Browsing**

- **Screen time overview (left column):** Single card. “Today” row: three metrics in one row—screen time, visits, sites—each with value and “vs yesterday” trend. Below a divider, “This week” and “This month” in two columns, each with screen time, visits, and sites and “vs prev week” / “vs prev month.” All trends use color (e.g. green/red) for direction.
- **Today by domain (right column):** One card with list/pie/bar toggle. Shows domains visited today with time and visit count; list view has a scrollable list with optional bar representation.
- **Screen time over time and recent visits (bottom row):** Fixed-height row (e.g. 400px). Left: bar chart of screen time per day over a selectable period (e.g. last 7/15/30 days). Right: “Recent visits” list (last 10 visits: domain, duration, time ago) in a scrollable column.

**Extension – Side panel**

- **Overview:** Cards for today’s downloads (count and vs yesterday), current streak, this week (vs last week), this month (vs last month), peak hour and peak day. Compact layout with trend arrows and labels.
- **File breakdown:** Tabs for “Categories” and “Extensions”; list or chart of counts (and optionally sizes) by category or extension.
- **Recent downloads:** List of last 10 downloads (filename, size, time ago, new/duplicate badge). No details drawer; main analytics and history are in the dashboard.

The extension does not display browsing metrics in the UI; browsing data is sent to the backend and viewed only in the dashboard.

---

## Project Structure

The repository contains three main applications:

| Folder      | Role                                                                 |
|------------|----------------------------------------------------------------------|
| **backend**  | Node/Express API, MongoDB, auth and business logic for downloads and browsing. |
| **dashboard**| React web app for analytics, download and browsing views, and auth.  |
| **extension**| Chrome extension (side panel + service worker) for tracking and quick stats. |

Each has its own `package.json` and is run and built independently.

---

## Backend

The backend is an Express server that provides REST APIs under `/api` for auth, downloads, and browsing. It uses MongoDB (via Mongoose) for persistence and JWT for authenticated routes.

**Responsibilities**

- **Auth:** Signup, login, and a protected “me” endpoint; issues and validates JWT.
- **Downloads:** Ingest download events (track), store files (by user and content hash) and events; serve download history (with filters and pagination), duplicate-related data, and metrics (summary, trends, daily activity, habits, file metrics by category/extension, source stats). History can be filtered by date, category, extension, and source domain.
- **Browsing:** Ingest visit events (domain, start/end, duration), normalize domains; serve daily activity, today-by-domain, period stats (week/month vs previous), recent visits, and habits. All browsing APIs are scoped by the authenticated user.

**Stack**

- Node.js, Express, TypeScript (ESM).
- Mongoose for MongoDB.
- JWT (jsonwebtoken), bcrypt, CORS, Helmet, optional rate limiting, optional WebSocket support (express-ws).

**Running**

- From `backend`: install dependencies, set MongoDB and JWT env (e.g. in `.env`), then `npm run dev` (development) or `npm run build` and `npm start` (production). Health check: `GET /health`.

---

## Dashboard

The dashboard is a React single-page application that talks to the backend API. It is the main place to view download and browsing analytics and to log in; the extension can receive auth from the dashboard so both use the same account.

**Responsibilities**

- **Auth:** Login and signup screens; token storage; protected routes and layout for authenticated pages.
- **Downloads:** Overview (today/week/month counts and trends), health-style metrics, download activity chart, file analytics (by category and extension), source analytics (by domain), recent downloads, and a detailed download history list with filters and a details drawer. Filters and drawer can be driven by date, category, extension, or source.
- **Browsing:** Screen time overview (today, this week, this month with comparisons), today-by-domain list/pie/bar, screen time over time chart, and recent visits list. Layout and height are aligned with a fixed-height activity section similar to the download activity area.
- **Settings:** User preferences and account-related UI (structure may vary).
- **Home:** Landing/dashboard entry for authenticated users.

**Stack**

- React 19, React Router, Redux Toolkit.
- Vite (Rolldown-based build), TypeScript.
- Tailwind CSS, Recharts for charts, Axios for API calls.
- Optional Chrome types for any extension-related messaging.

**Running**

- From `dashboard`: set API base URL (e.g. `VITE_API_BASE_URL`) if needed, install dependencies, then `npm run dev` (development) or `npm run build` and preview. Default dev server runs on a typical Vite port (e.g. 5173).

---

## Extension

The extension is a Chrome extension that runs in the user’s browser to track downloads and tab activity, and to show a compact UI (e.g. in the side panel) for quick stats and settings. It must be used with the backend (and optionally the dashboard) for full functionality.

**Responsibilities**

- **Download tracking:** Listens to `chrome.downloads.onChanged`; on completion, computes file hash (e.g. SHA-256) and category/extension, then POSTs to the backend `/api/downloads/track`. Can show a notification for new or duplicate status.
- **Browsing tracking:** Maintains a “current visit” (active tab’s domain and start time). On tab switch, tab close, or idle, it ends the current visit and appends a record (domain, start, end, duration) to a local queue. A periodic alarm (e.g. every minute) syncs the queue to the backend `/api/browsing/events`; on failure, events are re-queued for retry.
- **UI:** Side panel with a download/stats view (overview cards, recent downloads) and settings. Requires the user to be logged in; auth is typically received from the dashboard via Chrome external messaging and stored in Chrome storage.
- **API usage:** All backend calls use the stored token so data is associated with the same user as in the dashboard.

**Stack**

- React, Redux Toolkit, React Router.
- Vite with CRXJS (or similar) for building the extension.
- TypeScript, Tailwind CSS.
- Chrome APIs: downloads, tabs, storage, alarms, side panel, optional notifications and external messaging.

**Running**

- From `extension`: install dependencies, then `npm run dev` or `npm run build`. Load the built extension (e.g. `dist`) in Chrome as an unpacked extension. Ensure the backend (and optionally dashboard) is running and that the extension is allowed to communicate with them (manifest host permissions and CORS).

---

## Getting Started

1. **Backend:** In `backend`, copy or create `.env` with MongoDB URI and JWT secret (and any other required env). Run `npm install` and `npm run dev`. Confirm `GET /health` returns OK.
2. **Dashboard:** In `dashboard`, set `VITE_API_BASE_URL` to the backend URL if not default. Run `npm install` and `npm run dev`. Open the app in the browser, sign up or log in.
3. **Extension:** In `extension`, run `npm install` and `npm run build` (or `npm run dev`). In Chrome, load the unpacked extension from the build output. Log in via the dashboard (or the extension’s auth flow) so the extension has a valid token. After that, downloads and tab usage will be sent to the backend and reflected in the dashboard.

For production, run the backend with `NODE_ENV=production` and serve the dashboard’s build from a static host. Configure CORS and extension manifest to match your deployed origins and API URL.
