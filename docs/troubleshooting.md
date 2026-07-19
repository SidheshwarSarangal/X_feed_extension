# Troubleshooting

[← README](../README.md) · [Architecture](architecture.md) · [Setup](setup.md) · [Workflows and API](workflows-and-api.md) · [Security](security-and-privacy.md)

## Backend fails immediately

### `MONGODB_URI not set in environment`

Create `twikit/.env` and start Uvicorn with `twikit` as the working directory:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
```

### MongoDB connection failure

Check that:

- the MongoDB service is running;
- the URI includes the correct credentials and host;
- a hosted MongoDB firewall allows the current machine;
- DNS and TLS settings match the provider's connection string.

Do not paste a real connection string into issues, logs, or screenshots.

### Pip cannot parse `requirements.txt`

The tracked requirements file is UTF-16. If pip reports a decoding error, convert only its text encoding to UTF-8 and retry. Preserve the listed dependency versions.

## Extension build problems

### `npm` is not found

Install a supported Node.js release, reopen the terminal, and verify:

```bash
node --version
npm --version
```

### Webpack build fails after dependency changes

Install from the lockfile state:

```bash
cd extension
npm install
npm run build
```

The repository does not define test or lint scripts, so `npm run build` is the available project-level check.

### Chrome says the manifest is missing

Load `extension/dist`, not the repository root or `extension/src`. Confirm that `dist/manifest.json` exists after the build.

## Popup cannot reach the API

Symptoms include generic login errors, search fetch errors, or long loading followed by timeout.

Check:

1. Uvicorn is still running.
2. It is reachable at `http://localhost:8000`.
3. The extension was rebuilt after changing any API URL.
4. Local firewall or proxy software is not blocking loopback requests.

The current UI maps several different failures to the same generic message, so inspect the FastAPI terminal before assuming the password is wrong. Never share logs containing cookies or credentials.

## Search returns no users

- Search uses exact username or email equality.
- Confirm the owner completed **Allow Access** successfully.
- Check the `twitter_sessions.sessions` collection.
- Make sure the search and login operations use the same MongoDB deployment.

## Feed selector does not appear

The content script only runs on URLs matching `https://x.com/home*`, and the script additionally checks for hostname `x.com` and pathname `/home`.

Try:

1. Navigate directly to `https://x.com/home`.
2. Reload the X tab after installing or reloading the extension.
3. Check the page console for the content-script injection message.
4. Confirm the extension is enabled and has site access.

## Selector appears but no users are listed

Selecting a result on the Search Feed page stores it under `userSessions`. Return to or reload `x.com/home` afterward. If the same identifier was already saved, the extension reports that it already exists rather than adding a duplicate.

## Feed fails to render

Possible causes include:

- expired or revoked X cookies;
- an X authentication challenge;
- a Twikit/X compatibility change;
- the API or MongoDB being unavailable;
- X changing `[data-testid="primaryColumn"]`;
- media or timeline response shapes changing.

If a session is expired, revoke it in X security settings and repeat the consented Allow Access flow with a test account. Do not repeatedly submit another person's credentials without their active participation.

## Returning to the normal X feed

Choose **Your Feed** in the injected selector. The implementation restores the original X interface by reloading the page.

## Clearing local extension state

The selected sessions are held in Chrome local extension storage. Use the extension's Chrome details page to clear site/extension data, or remove and reinstall the unpacked extension. This does not delete the corresponding MongoDB records.

## Reporting a problem safely

Include:

- browser and version;
- Python and Node.js versions;
- the failing step;
- sanitized error text;
- whether the backend and MongoDB are reachable.

Never include passwords, session cookies, `.env` contents, MongoDB URIs, or private feed data.
