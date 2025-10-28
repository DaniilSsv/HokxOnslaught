# WOT Onslaught — Availability Voting (React)

This is a minimal React + Vite app to let players vote which days they're available for Onslaught (World of Tanks). Votes are stored in-browser (localStorage).

Quick start (PowerShell on Windows):

```powershell
cd d:\Coding\Hokx\HokxOnslaught
npm install
npm run dev
```

Open the URL printed by Vite (typically http://localhost:5173) to view the app.

Notes

- Votes are stored per-browser using localStorage. To aggregate votes from many players you'll need a server or shared datastore.
- You can export the contents of localStorage key `wot-onslaught-counts` for external processing.
