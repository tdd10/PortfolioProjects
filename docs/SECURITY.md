# Security model

## Primary risks

The highest risks are broken object-level authorization, portfolio-to-family privilege crossing, disclosure of journals/goals/documents, stolen sessions, unsafe uploads, account-removal privacy mistakes, and audit tampering.

## Required production controls

- Resolve authorization server-side for every object and action: role defaults plus per-user allow/deny overrides, with explicit deny winning.
- Hash passwords with Argon2id; never log or expose credentials. Support passkeys/TOTP, recovery codes, verified recovery, lockout, throttling, and session revocation.
- Store opaque session IDs in `Secure`, `HttpOnly`, `SameSite=Lax` cookies; rotate on privilege change and enforce idle/absolute expiry. Protect mutations with origin checks and CSRF tokens.
- Validate request schemas, parameterize SQL, encode output, set CSP and security headers, and rate-limit by account and network signals.
- Encrypt transport and storage. Encrypt especially sensitive values with envelope keys separated from the database.
- Treat uploaded files as hostile: quarantine, size/type validation, malware scan, random object keys, download disposition, and short-lived signed access.
- Append security audit events through a restricted service account to immutable/WORM-capable storage. Family activity is a separate, editable projection.

## Private content and break glass

Private records reveal no metadata to unauthorized users. Break-glass requires an elevated recent-auth session, MFA when enrolled, a typed reason, explicit confirmation, a scoped record set, automatic expiry, owner notification where policy permits, and immutable audit events. Guardian access uses a verified relationship and a separate policy from adult recovery access.

## Removal

Deactivation blocks login but retains content. Removing membership revokes household grants and sessions while shared history remains. Data deletion is a distinct reviewed workflow with per-domain disposition: retain shared attribution, transfer selected ownership, archive private data without widening visibility, or cryptographically/permanently erase selected private records.

## Portfolio isolation

Invitation tokens are random, single-purpose, hashed at rest, expiring, revocable, usage-limited, optionally identity-bound, and exchanged once for a restricted portfolio session. Portfolio middleware rejects family endpoints before resource lookup. Tests must prove forged IDs, cookies, roles, and URLs cannot cross this boundary.
