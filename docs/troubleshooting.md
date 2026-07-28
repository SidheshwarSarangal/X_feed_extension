# Troubleshooting

[← README](../README.md) · [User journey](workflows-and-api.md) · [Browser extension](browser-extension.md) · [Backend and API](backend-and-api.md) · [Architecture](architecture.md) · [Security](security-and-privacy.md) · [Setup](setup.md) · [Boundaries](current-boundaries.md)

## Start here

```mermaid
flowchart TD
    Problem{Where does it fail?}
    Problem -->|API start| Backend[Backend tree]
    Problem -->|npm / Webpack| Build[Build tree]
    Problem -->|Popup request| Request[Connection tree]
    Problem -->|Search| Search[Search tree]
    Problem -->|X page| Feed[Feed tree]
```

## Backend tree

```mermaid
flowchart TD
    Start[uvicorn main:app --reload] --> URI{MONGODB_URI found?}
    URI -->|No| Env[Create twikit/.env<br/>run from twikit/]
    URI -->|Yes| Mongo{Mongo connects?}
    Mongo -->|No| Network[Check service, URI, firewall, DNS/TLS]
    Mongo -->|Yes| Ready[API ready at localhost:8000]
```

| Symptom | Check | Fix |
| --- | --- | --- |
| `MONGODB_URI not set` | `.env` location | Put it in `twikit/.env` |
| Mongo connection failure | Service/URI/network | Correct private connection |
| Pip decoding error | Requirements encoding | Convert UTF-16 → UTF-8 only |
| Import error | Active virtual environment | Reinstall requirements |

## Build tree

```mermaid
flowchart TD
    NPM{npm available?}
    NPM -->|No| Node[Install Node.js and reopen terminal]
    NPM -->|Yes| Install[npm install]
    Install --> Build[npm run build]
    Build --> Manifest{dist/manifest.json exists?}
    Manifest -->|No| Logs[Read first Webpack error]
    Manifest -->|Yes| Load[Load extension/dist]
```

```bash
node --version
npm --version
cd extension
npm install
npm run build
```

## Request tree

```mermaid
flowchart TD
    Error[Popup fetch error / timeout] --> Running{Uvicorn running?}
    Running -->|No| Start[Start backend]
    Running -->|Yes| URL{localhost:8000 reachable?}
    URL -->|No| Firewall[Check loopback firewall/proxy]
    URL -->|Yes| Logs[Inspect sanitized API logs]
    Logs --> Mongo{Database healthy?}
    Mongo -->|No| FixDB[Fix Mongo connection]
    Mongo -->|Yes| XIssue[Check X challenge/session]
```

The UI maps several failures to the same message. A generic credential error does not prove the password is wrong.

## Search tree

```mermaid
flowchart TD
    None[No users returned] --> Exact{Exact username/email?}
    Exact -->|No| Retry[Use exact saved value]
    Exact -->|Yes| Saved{Allow Access succeeded?}
    Saved -->|No| Authorize[Repeat consented test flow]
    Saved -->|Yes| SameDB{Same MongoDB?}
    SameDB -->|No| Align[Use one MONGODB_URI]
    SameDB -->|Yes| Inspect[Inspect sessions collection]
```

## X page tree

```mermaid
flowchart TD
    Home[Open https://x.com/home] --> Selector{Switch Feed visible?}
    Selector -->|No| Reload[Reload extension + X tab]
    Reload --> Scope{Correct URL and site access?}
    Scope -->|No| FixScope[Open /home; enable extension]
    Scope -->|Yes| Console[Inspect content-script console]

    Selector -->|Yes| Users{Saved users listed?}
    Users -->|No| Search[Select a Search Feed result, reload]
    Users -->|Yes| Render{Feed renders?}
    Render -->|No| Session[Check expired/revoked session]
    Session --> DOM[Check X primaryColumn selector]
    Render -->|Yes| Done[Working]
```

## Symptom board

| Symptom | Most likely boundary |
| --- | --- |
| Popup opens, fetch fails | Extension → local API |
| Search empty | Exact value or Mongo record |
| Selector absent | Manifest/content-script scope |
| Selector empty | Chrome `userSessions` storage |
| Loading never resolves | API/Twikit/X request |
| Session expired | Revoked or invalid cookies |
| Wrong user after an expiry removal | Stale dropdown indexes; refresh X Home |
| Blank X column | X DOM selector changed |
| Images work, video fails | Media URL/format changed |

## Endpoint failure map

| Endpoint | Common visible result | Important distinction |
| --- | --- | --- |
| `/login` | Generic credential message or timeout | Backend maps file, database, X, and login exceptions to similar failures |
| `/match-sessions` | No matches or fetch error | Search requires exact stored username/email and the same MongoDB |
| `/get-feed` | Session expired or Error loading feed | Parsed non-array/empty data removes local entry; network/parse catch does not |
| `/login-from-file/{username}` | HTTP error | Development endpoint is not part of the extension UI flow |

Read sanitized FastAPI output before concluding that the owner entered incorrect credentials.

## Restore and reset

```mermaid
flowchart LR
    YourFeed[Choose Your Feed] --> Reload[Page reload]
    Reset[Full reset] --> Revoke[Revoke X session]
    Revoke --> Delete[Delete Mongo test record]
    Delete --> Clear[Clear extension storage]
    Clear --> Files[Delete temporary session JSON]
```

Removing the extension clears browser-side state, not MongoDB records.

## Safe bug report card

| Include | Never include |
| --- | --- |
| Browser/version | Password |
| Python/Node versions | Cookie values |
| Failing step | `.env` contents |
| Sanitized error | MongoDB URI |
| API/Mongo reachability | Private feed data |
