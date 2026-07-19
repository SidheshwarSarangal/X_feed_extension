# Architecture

[← README](../README.md) · [Setup](setup.md) · [Workflows](workflows-and-api.md) · [Security](security-and-privacy.md) · [Troubleshooting](troubleshooting.md)

## Runtime map

```mermaid
flowchart LR
    subgraph Browser[Chromium browser]
        Popup[Popup pages]
        Content[content.js<br/>on x.com/home]
        Storage[(chrome.storage.local)]
    end

    subgraph Local[Local Python service]
        API[FastAPI]
        Client[Twikit]
        Temp[(temporary cookie JSON)]
    end

    Mongo[(MongoDB)]
    X[X]

    Popup -->|HTTP :8000| API
    Popup <--> Storage
    Content <--> Storage
    Content -->|HTTP :8000| API
    API <--> Mongo
    API --> Client
    Client <--> X
    Client --> Temp
    API -. cleanup .-> Temp

    style Browser fill:#eff6ff,stroke:#2563eb
    style Local fill:#f0fdf4,stroke:#16a34a
    style Temp fill:#fee2e2,stroke:#dc2626
```

## Component cards

| Component | Input | Output |
| --- | --- | --- |
| `main.js` | Popup button click | Access or search page |
| `allow-access.js` | Username, email, password | `/login` request |
| `search-feed.js` | Exact identifier | Saved Chrome session |
| `content.js` | Selected session | Injected shared feed |
| `main.py` | API requests | Mongo/Twikit operations |
| `session_model.py` | Cookie fields | Pydantic session model |

## Extension anatomy

```mermaid
flowchart TB
    Manifest[manifest.json] --> Popup[main.html]
    Popup --> Access[allow-access.html]
    Popup --> Search[search-feed.html]
    Manifest --> Worker[background.js]
    Manifest --> Content[content.js]
    Content --> XHome[https://x.com/home*]
    Search --> ChromeStore[(userSessions)]
    ChromeStore --> Content

    style Manifest fill:#f3e8ff,stroke:#9333ea
    style ChromeStore fill:#fef3c7,stroke:#d97706
```

### Manifest footprint

| Declaration | Current scope |
| --- | --- |
| Version | Manifest V3 |
| Browser permission | `storage` |
| Host permission | `<all_urls>` ⚠️ |
| Content-script match | `https://x.com/home*` |
| Service worker | ES module |

## Feed replacement path

```mermaid
sequenceDiagram
    participant Page as x.com/home
    participant Script as content.js
    participant Store as Chrome storage
    participant API as FastAPI

    Script->>Page: Inject Switch Feed selector
    Script->>Store: Read userSessions
    Store-->>Script: Saved users
    Script->>API: POST /get-feed
    API-->>Script: Normalized timeline[]
    Script->>Page: Clear primaryColumn
    loop batches of 10
        Script->>Page: Append cards
    end
```

| Renderer rule | Value |
| --- | --- |
| X selector | `[data-testid="primaryColumn"]` |
| Backend request count | 20 timeline items |
| Renderer ceiling | 30 items |
| Batch size | 10 items |
| Next batch trigger | `IntersectionObserver` |

## Backend map

```mermaid
flowchart TB
    Login[POST /login] --> TwikitLogin[Twikit login]
    TwikitLogin --> Normalize[Normalize cookies]
    Normalize --> Upsert[MongoDB upsert]

    Match[POST /match-sessions] --> Query[Exact identifier query]
    Query --> Result[Session + cookies]

    Get[POST /get-feed] --> Timeline[Twikit timeline]
    Timeline --> Media[Extract image / best MP4]
    Media --> JSON[Normalized JSON]

    File[POST /login-from-file] --> Import[Development cookie import]

    style Result fill:#fee2e2,stroke:#dc2626
    style File fill:#fef3c7,stroke:#d97706
```

## Stored shapes

```mermaid
erDiagram
    SESSION ||--|| COOKIE_WRAPPER : contains
    COOKIE_WRAPPER ||--o{ COOKIE : contains
    SESSION {
        string auth_info_1
        string auth_info_2
    }
    COOKIE {
        string name
        string value
        string domain
        string path
        boolean secure
        boolean httpOnly
    }
```

## Build graph

```mermaid
flowchart LR
    Src[extension/src] --> Webpack[Webpack production build]
    Public[manifest + icon] --> Copy[Copy plugin]
    Webpack --> Dist[extension/dist]
    Copy --> Dist
    Dist --> Chrome[Load unpacked]
```

## Coupling and boundaries

| Boundary | Coupling | Break condition |
| --- | --- | --- |
| Extension → API | Hardcoded localhost URL | Port/host changes |
| Content script → X | URL + DOM selector | X UI update |
| Backend → X | Twikit behavior | X/Twikit update |
| Backend → MongoDB | `MONGODB_URI` | Network/auth failure |
| Viewer → session | Raw cookie transfer | Expiry/revocation |

> [!IMPORTANT]
> The red-cookie paths are prototype boundaries, not a production delegation architecture. See [Security](security-and-privacy.md).
