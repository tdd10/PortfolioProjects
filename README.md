# Family Hub (Free Website)

This project is a **100% free family hub website** built with plain HTML/CSS/JavaScript.

## Features

- Multiple family profiles (kid / parent / admin)
- Admin profile management (create/remove profiles)
- Role-based visibility controls (admin decides what each role can see)
- Shared schedule/events
- Grocery list with check-off
- Chore board with check-off
- Shared notes
- Local storage persistence (no account required)

## Default admin access

On first load, a default admin profile is created:

- **Name**: `Family Admin`
- **Role**: `admin`
- **PIN**: `1234`

Change this by creating a new admin profile and deleting/replacing the default profile.

## Run locally

Just open `index.html` in your browser.

## Publish for free

### Option 1: GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set source to **Deploy from branch**.
4. Choose your default branch and root (`/`).
5. Save. Your site will be live on `https://<username>.github.io/<repo>`.

### Option 2: Netlify Drop

1. Go to https://app.netlify.com/drop
2. Drag-and-drop this project folder.
3. Netlify gives you a free URL instantly.

## Notes

- Data is saved in each browser's local storage.
- Admin PINs and profile data are local to the browser, so this is a convenience control, not enterprise-grade security.
- If you want synced profiles across devices, add a free backend (for example Firebase free tier or Supabase free tier).
