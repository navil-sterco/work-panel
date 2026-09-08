# Work Log Panel (MERN → Google Sheet)

A small panel where you fill a form and it appends a row straight into a
Google Sheet, using a Google service account (no user login required).

```
work-panel/
├── server/     Express API that talks to Google Sheets
└── client/     React form + recent-entries view
```

## 1. Create the Google Sheet

1. Make a new Google Sheet.
2. Add a first tab (rename it if you like — you'll put this name in `.env`).
3. Add this header row exactly, in this order:

   `Date | Employee Name | Project Name | Plan / Unplan Project | Type of Work | Work Description | Page URL | Status | Effort Time in Mins | Assigned by`

   (The server can also create this tab and header for you automatically the
   first time it runs, if the tab doesn't exist yet.)

4. Copy the Sheet ID from its URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

## 2. Create a Google service account

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or use an existing one).
3. Enable the **Google Sheets API** for that project.
4. Go to **IAM & Admin → Service Accounts → Create Service Account**.
5. Once created, open it → **Keys → Add Key → Create new key → JSON**.
   This downloads a `.json` file — keep it private, don't commit it.
6. From that JSON file, you need two values:
   - `client_email`
   - `private_key`
7. **Share your Google Sheet** with that `client_email` address (Editor access) —
   exactly like sharing it with a person. Without this step, writes will fail.

## 3. Configure the server

```bash
cd server
cp .env.example .env
```

Fill in `.env`:

```
GOOGLE_SHEET_ID=<the ID from step 1>
GOOGLE_SHEET_TAB=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from the JSON key>
GOOGLE_PRIVATE_KEY="<private_key from the JSON key, keep the \n as literal \n>"
PORT=8000
```

Install and run:

```bash
npm install
npm run dev      # or: npm start
```

Server runs on `http://localhost:8000`.

## 4. Run the client

```bash
cd client
npm install
npm start
```

Opens on `http://localhost:3000` and proxies API calls to the server.

## How it works

- The React form posts to `POST /api/entries`.
- The server uses the `google-spreadsheet` package, authenticated as your
  service account, to append a row matching the form fields.
- `GET /api/entries` reads the last 20 rows back so you can see what's been
  logged, without needing to open the Sheet itself.

## Notes

- Never commit your real `.env` or the service account JSON key to version control.
- If you rename columns in the Sheet, update the `HEADERS` array in
  `server/sheets.js` to match.
- To deploy, host `server/` anywhere that can keep the `.env` values secret
  (Render, Railway, a small VPS, etc.), and point the client's API calls at
  that deployed URL instead of `localhost:8000`.
