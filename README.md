# X Feed Extension

> A consent-based Chrome extension prototype for viewing a shared X home feed.

[Demo video](https://drive.google.com/file/d/1kaC_B0NBTRkO7f37G3d7zcF8YydUI07B/view?usp=sharing) · [Setup](docs/setup.md) · [Architecture](docs/architecture.md) · [Security](docs/security-and-privacy.md)

```mermaid
flowchart LR
    Owner([Account owner]) -->|voluntarily shares a session| Extension[Chrome extension]
    Extension --> API[FastAPI + Twikit]
    API --> DB[(MongoDB)]
    Viewer([Viewer]) -->|finds shared user| Extension
    Extension -->|renders selected timeline| X[X home page]

```

> [!CAUTION]
> This is a local research prototype. It handles X credentials and reusable session cookies, has no API authentication, and is **not safe for public deployment**. Use test accounts or explicit informed consent only.

## The experience

```mermaid
flowchart TB
    Open[Open extension] --> Choice{Choose a path}
    Choice -->|Allow Access| Login[Owner enters X details]
    Login --> Share[Backend stores session cookies]
    Choice -->|Search Feed| Search[Viewer searches exact user/email]
    Search --> Save[Session saved in Chrome storage]
    Save --> Home[Open x.com/home]
    Home --> Select[Choose user from Switch Feed]
    Select --> Feed[Shared timeline replaces primary column]

```

## What is here

| Browser extension | Local backend | Feed output |
| --- | --- | --- |
| Manifest V3 popup | FastAPI endpoints | Text and timestamps |
| Allow-access screen | Twikit X client | Images and MP4 video |
| Shared-user search | MongoDB sessions | Likes, reposts, replies |
| X page content script | Cookie normalization | Batches of 10, up to 30 |
| Chrome local storage | Expired-session cleanup | Original-feed restore |

## Documentation map

```mermaid
flowchart LR
    Readme[README<br/>project map] --> Architecture[Architecture<br/>components + data]
    Readme --> Setup[Setup<br/>install + verify]
    Readme --> Workflows[Workflows & API<br/>requests + states]
    Readme --> Security[Security<br/>risks + hardening]
    Readme --> Troubleshooting[Troubleshooting<br/>decision trees]

    click Architecture "docs/architecture.md"
    click Setup "docs/setup.md"
    click Workflows "docs/workflows-and-api.md"
    click Security "docs/security-and-privacy.md"
    click Troubleshooting "docs/troubleshooting.md"
```

| Guide | Best place to answer |
| --- | --- |
| [Architecture](docs/architecture.md) | What talks to what? Where is data stored? |
| [Setup](docs/setup.md) | How do I run and verify it locally? |
| [Workflows and API](docs/workflows-and-api.md) | What happens in each user journey and endpoint? |
| [Security and privacy](docs/security-and-privacy.md) | What is sensitive, unsafe, or required before production? |
| [Troubleshooting](docs/troubleshooting.md) | Why is a particular step failing? |

## Repository shape

```mermaid
flowchart TB
    Root[X_feed_extension]
    Root --> Ext[extension/]
    Ext --> Public[public/<br/>manifest + icon]
    Ext --> Source[src/<br/>popup + content + background]
    Ext --> Dist[dist/<br/>generated Chrome build]
    Root --> Backend[twikit/]
    Backend --> Main[main.py<br/>FastAPI routes]
    Backend --> Models[models/<br/>session schema]
    Root --> Docs[docs/<br/>visual guides]

```

## Stack at a glance

| Layer | Technology | Role |
| --- | --- | --- |
| Extension | Manifest V3, HTML, CSS, JavaScript | Popup and X page integration |
| Bundling | Webpack 5 + Babel | Produces `extension/dist` |
| API | Python, FastAPI, Uvicorn | Session and feed orchestration |
| X client | Twikit | Login and home timeline retrieval |
| Server data | MongoDB + Motor | Shared-session persistence |
| Browser data | `chrome.storage.local` | Viewer-selected sessions |

## Implementation snapshot

```mermaid
pie showData
    title Prototype capability status
    "Implemented demo flows" : 7
    "Security hardening required" : 6
    "Testing and packaging missing" : 2
```

| ✅ Implemented | ⚠️ Prototype limitation |
| --- | --- |
| Popup navigation | No backend authentication |
| Twikit session creation | Cookies returned by search API |
| Exact username/email lookup | Cookies stored without app-level encryption |
| Shared-feed selector | Broad `<all_urls>` host permission |
| Text, image, video rendering | Hardcoded `localhost:8000` API |
| Expired local-session removal | No automated test suite |
| Webpack extension build | X DOM/API changes can break integration |

## Run locally

```mermaid
flowchart LR
    Env[1 · Add twikit/.env] --> API[2 · Start Uvicorn]
    API --> Build[3 · npm run build]
    Build --> Load[4 · Load extension/dist]
    Load --> Test[5 · Test with consented account]
```

```dotenv
# twikit/.env
MONGODB_URI=mongodb://127.0.0.1:27017
```

```bash
# Terminal 1
cd twikit
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2
cd extension
npm install
npm run build
```

Then load `extension/dist` from `chrome://extensions` → **Developer mode** → **Load unpacked**. See the [visual setup checklist](docs/setup.md) before entering any account details.

## Data sensitivity

```mermaid
flowchart LR
    Password[Password<br/>transient input] --> API[Local API]
    API --> Cookies[Session cookies]
    Cookies --> Mongo[(MongoDB)]
    Mongo --> Chrome[(Chrome local storage)]
    Chrome --> Timeline[Shared feed]
```

Passwords and cookies must never appear in commits, issues, screenshots, or logs. Follow the [cleanup and revocation flow](docs/security-and-privacy.md#revocation-map) after every demonstration.

## Contributors and control

| Person/account | Relationship |
| --- | --- |
| **Sidheshwar Sarangal** (`SidheshwarSarangal`) | Project owner and maintainer |
| **Ayan** (`AyanMhd`; `maniac` in Git author metadata) | Contributor |
| `GDSC-IITR` | Existing repository collaborator |

The Git history remains the authoritative contribution record. An active **Owner-only branch changes** ruleset preserves collaborator status while allowing only `SidheshwarSarangal` to create, update, or delete repository branches.

```mermaid
flowchart LR
    Contributor[Contributor] -->|fork / suggestion| Review[Owner review]
    Collaborator[Existing collaborator] -->|cannot modify protected branches| Review
    Owner[Repository owner] -->|only bypass actor| Branches[(All branches)]
```

## Status

**Core demonstration:** present · **Local research use:** possible · **Production use:** not ready

This project is not affiliated with or endorsed by X Corp.
