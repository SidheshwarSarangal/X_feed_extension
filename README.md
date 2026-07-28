# X Feed Extension

## Documentation

The guides are ordered from the complete owner/viewer journey to implementation details, then operation and safety.

| Order | Guide | Covers |
| ---: | --- | --- |
| 1 | [User journey and feature handoffs](docs/workflows-and-api.md) | Project overview, roles, complete owner grant, viewer search, save, switch, restore flow, and viewer capabilities |
| 2 | [Browser extension](docs/browser-extension.md) | Manifest, popup pages, Chrome storage, content script, and feed renderer |
| 3 | [Backend and API](docs/backend-and-api.md) | FastAPI, Twikit, MongoDB, endpoints, cookie normalization, and media extraction |
| 4 | [Architecture](docs/architecture.md) | Technology stack, runtime layers, component ownership, storage, build, and coupling |
| 5 | [Security and privacy](docs/security-and-privacy.md) | Consent, credential/session risks, cleanup, revocation, and safe demonstration |
| 6 | [Setup](docs/setup.md) | Prerequisites, backend, build, Chrome installation, verification, and cleanup |
| 7 | [Troubleshooting](docs/troubleshooting.md) | Failure trees for backend, build, requests, search, X injection, and reset |
| 8 | [Current boundaries](docs/current-boundaries.md) | Present limitations, production correction order, and project affiliation |
