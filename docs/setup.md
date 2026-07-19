# Setup

[← README](../README.md) · [Architecture](architecture.md) · [Workflows and API](workflows-and-api.md) · [Security](security-and-privacy.md) · [Troubleshooting](troubleshooting.md)

## Before you begin

Use a dedicated test account whenever possible. If another person's account participates, obtain explicit informed consent and explain that the prototype stores reusable session cookies. Do not expose port 8000 to the public internet.

## Prerequisites

- Git
- Python 3.10+
- Node.js with npm
- Chrome or another Chromium-based browser
- MongoDB running locally or a private MongoDB deployment

## Backend setup

### 1. Enter the backend directory

```bash
cd twikit
```

### 2. Create an isolated Python environment

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

The repository's requirements file is UTF-16 encoded. If a particular pip version cannot read it, convert it to UTF-8 locally before retrying; do not change package names or versions during conversion.

### 4. Configure MongoDB

Create `twikit/.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
```

For a remote private database, use its complete connection string. Restrict network access and use a database account with access only to the required database.

### 5. Start the API

```bash
uvicorn main:app --reload
```

Expected address:

```text
http://127.0.0.1:8000
```

Startup attempts to list MongoDB collections and prints whether that connection succeeded.

## Extension setup

### 1. Install and build

From a second terminal:

```bash
cd extension
npm install
npm run build
```

Webpack writes the unpacked extension to `extension/dist`.

### 2. Load into Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the repository's `extension/dist` directory.
5. Pin **X Feed Extension** if desired.

After every source change, run `npm run build` again and press the extension's **Reload** button on `chrome://extensions`.

## Local verification

Use a test account and verify in this order:

1. The API starts without a missing `MONGODB_URI` exception.
2. MongoDB connection success appears in the API console.
3. The extension popup displays **Search Feed** and **Allow Access**.
4. Empty access fields show a validation message.
5. A consented test account can complete **Allow Access**.
6. Exact username or email lookup returns the saved account.
7. Selecting the result displays a saved-session confirmation.
8. Opening `https://x.com/home` shows the feed selector.
9. Selecting the test account displays timeline items.
10. Selecting **Your Feed** restores the standard page by reloading it.

## Configuration reference

| Setting | Current value/location | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `twikit/.env` | MongoDB connection string |
| API base URL | Hardcoded as `http://localhost:8000` in extension scripts | FastAPI requests |
| Database | `twitter_sessions` | Session storage database |
| Collection | `sessions` | Stored shared sessions |
| Feed page | `https://x.com/home*` in manifest | Content-script scope |

## Stopping and cleaning a test run

1. Stop Uvicorn with `Ctrl+C`.
2. Remove test records from the MongoDB `sessions` collection.
3. Remove the extension or clear its storage from Chrome's extension details.
4. Revoke X sessions used during testing from the account's security settings.
5. Delete any unexpected files under `twikit/sessions`.

These steps matter because uninstalling the extension does not delete MongoDB records.

## Build limitations

The repository has no automated test script, lint script, development watcher, or continuous-integration workflow. A successful Webpack build confirms bundling only; it does not verify the X integration or the security of the session flow.
