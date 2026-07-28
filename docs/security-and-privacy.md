# Security and privacy

[← README](../README.md) · [User journey](workflows-and-api.md) · [Browser extension](browser-extension.md) · [Backend and API](backend-and-api.md) · [Architecture](architecture.md) · [Setup](setup.md) · [Troubleshooting](troubleshooting.md) · [Boundaries](current-boundaries.md)

> [!WARNING]
> Local research prototype only. Do not expose this backend publicly.

## Trust map

```mermaid
flowchart LR
    Owner([Consenting owner]) -->|password| Popup[Extension popup]
    Popup -->|plain HTTP localhost| API[FastAPI]
    API -->|login| X[X / Twikit]
    API -->|cookies| Mongo[(MongoDB)]
    Mongo -->|cookies in lookup| Viewer[Viewer extension]
    Viewer --> Chrome[(Chrome local storage)]

```

## Consent gate

```mermaid
flowchart TD
    Start[Want to demonstrate shared feed] --> Consent{Explicit informed consent?}
    Consent -->|No| Stop[Do not continue]
    Consent -->|Yes| Test{Dedicated test account available?}
    Test -->|Yes| UseTest[Use test account]
    Test -->|No| Explain[Explain password + cookie handling]
    Explain --> Scope[Agree viewer, duration, revocation]
    Scope --> Run[Run locally only]
    Run --> Cleanup[Revoke and delete]

```

Consent to view never grants permission to post, message, follow, or modify the account.

## What “read-only” means here

| Layer | Current behavior | Security meaning |
| --- | --- | --- |
| Injected cards | No like, reply, repost, follow, or message controls | Read-only presentation |
| FastAPI | Accepts reusable cookies and returns timeline data | No scoped viewer authorization |
| Stored X session | Represents an authenticated owner session | May carry capabilities beyond the injected UI |

The project demonstrates a read-only viewer interface. It does not create a read-only X credential.

## Risk board

| Severity | Current condition | Why it matters |
| --- | --- | --- |
| 🔴 Critical | Lookup returns raw cookies | Callers receive reusable sessions |
| 🔴 Critical | API has no authentication | No caller identity or authorization |
| 🔴 Critical | Cookies stored in MongoDB/Chrome | Persistent account-access material |
| 🟠 High | Password entered in extension | Highly sensitive transient input |
| 🟠 High | CORS allows all origins | Any origin can attempt API calls |
| 🟠 High | Manifest uses `<all_urls>` | Permission scope is too broad |
| 🟠 High | File-import endpoint exists | Unsafe production surface |
| 🟠 High | Search results use unescaped `innerHTML` | Stored identifier content enters an extension page as markup |
| 🟡 Operational | Twikit and X DOM can change | Reliability is not controlled |

## Sensitive-data lifecycle

```mermaid
stateDiagram-v2
    [*] --> PasswordInput
    PasswordInput --> LocalAPI
    LocalAPI --> TemporaryCookieFile
    TemporaryCookieFile --> MongoRecord
    MongoRecord --> SearchResponse
    SearchResponse --> ChromeStorage
    ChromeStorage --> FeedRequest
    FeedRequest --> Revoked
    Revoked --> [*]
```

| Data | Expected lifetime | Current deletion path |
| --- | --- | --- |
| Password | Login request only | Not placed in Mongo update |
| Temporary JSON | During login | `finally` cleanup attempt |
| Mongo cookies | Until failure/manual deletion | Database cleanup |
| Chrome cookies | Until expiry/manual clearing | Storage removal/uninstall |
| X session | Until revoked/expired | X security settings |

The password is not intentionally included in the MongoDB update. Cookie values, however, move from Twikit to a temporary file, MongoDB, the search response, Chrome storage, and the later feed request.

## Minimum safe-demo boundary

```mermaid
flowchart TB
    Loopback[Bind API to loopback] --> PrivateDB[Network-restricted MongoDB]
    PrivateDB --> TestProfile[Separate Chrome profile]
    TestProfile --> TestAccount[Dedicated X test account]
    TestAccount --> NoTunnel[No tunnels / port forwarding]
    NoTunnel --> Cleanup[Delete + revoke after demo]
```

## Production replacement map

```mermaid
flowchart LR
    CurrentPassword[Password collection] -->|replace| OAuth[Official scoped authorization]
    RawCookies[Raw-cookie sharing] -->|replace| Grant[Opaque short-lived grant]
    OpenAPI[Unauthenticated API] -->|replace| AuthZ[Authentication + authorization]
    PlainStore[Plain persistence] -->|replace| Encrypted[Encrypted managed secrets]
    BroadAccess[All URLs + CORS *] -->|replace| Exact[Exact origins and hosts]
    ManualExpiry[Manual cleanup] -->|replace| TTL[Expiry + revocation + audit]
```

### Hardening order

1. Official scoped authorization; no password collection.
2. Backend-only session custody; never return cookies from search.
3. Authenticated owner/viewer model with revocable grants.
4. Encryption, key rotation, retention, rate limits, and audit events.
5. Exact CORS/manifest scope and removal of file import.
6. Authorization, revocation, and privacy tests.
7. Legal, platform-policy, privacy, and threat-model review.

## Revocation map

```mermaid
flowchart LR
    RevokeX[1 · Revoke X session] --> DeleteMongo[2 · Delete Mongo record]
    DeleteMongo --> ClearChrome[3 · Clear extension storage]
    ClearChrome --> DeleteFiles[4 · Delete session JSON]
    DeleteFiles --> Rotate[5 · Rotate exposed DB credentials]

```

Revoking the X session is the key step: it invalidates cookies at their source.

## Never log or publish

```text
passwords ✕ cookie values ✕ MongoDB URIs ✕ private feed content ✕ unredacted email
```

The current content script logs returned feed data in the browser console. Remove or redact that output before using non-test data.

For the complete list of present implementation limits, separate from this risk-focused guide, read [Current boundaries](current-boundaries.md).
