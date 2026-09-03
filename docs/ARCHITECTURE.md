# Architecture decision record

## Decision

Use a modular monolith first: one deployable API with strict internal domain boundaries. This keeps private self-hosting understandable while leaving clean seams for extracting high-risk modules later.

Domains are Auth, Users, Permissions, Calendar, Tasks, Rewards, Grocery, Lists, Recipes, Meals, Maintenance, Goals, Journal, Gallery, Feed, Notifications, Finance, Documents, Portfolio, Audit, Export, and Admin. Each domain owns its tables and exposes application services plus versioned HTTP endpoints. Cross-domain effects use an outbox-backed event bus.

Calendar is a projection, not the owner of task, maintenance, goal, meal, or future finance records. Producers publish lifecycle events; Calendar stores a typed source reference and rebuildable projection. Notifications consume the same events. Documents remain isolated. Portfolio has a separate principal type, session cookie, authorization middleware, and route namespace; a portfolio principal cannot resolve to a family principal.

## Production stack

- TypeScript client and API; PostgreSQL with foreign keys, checks, and transactional migrations
- Redis-compatible ephemeral session/rate-limit storage, optional for a single-node deployment
- S3-compatible media storage with original files, content hashes, malware scanning, and signed short-lived downloads
- Background worker consuming a transactional outbox for reminders, exports, and media processing
- OpenAPI-described `/api/v1` contract so native clients can be added without reworking domains

The browser demo uses one local adapter. It is deliberately replaceable and must not be interpreted as a security boundary.

## Portability

All providers sit behind interfaces: blob store, mail, push, queue, and identity verification. Exports stream JSON and CSV by domain plus original media into a documented directory tree. PostgreSQL-native backups complement, but never replace, open-format exports.

## Assumptions

One household is the initial tenant; users can later join multiple households. A guardian relationship is explicit rather than inferred from a role. Private adult content is deny-by-default. Child access policy is separately configurable. Finance and Documents ship only after a focused security review.
