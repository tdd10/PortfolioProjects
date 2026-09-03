# Production data model outline

All durable records use UUIDs, `created_at`, `updated_at`, creator/owner references where relevant, and explicit lifecycle state. Important family history uses soft deletion; explicit privacy erasure uses hard deletion or crypto-shredding.

Core tables include `households`, `users`, `memberships`, `roles`, `permissions`, `role_permissions`, `entitlement_overrides`, `guardian_relationships`, `sessions`, and `audit_events`. Domain tables remain normalized: calendar events/attendees/recurrences; tasks/assignments/completions; reward requests/transactions/catalog; grocery lists/items/history/categories; generic lists/items/shares; recipes/ingredients/steps; meal slots; assets/maintenance records; goals/milestones/contributors; journals/tags/shares; media/albums; posts/comments/reactions; notification preferences/deliveries; portfolio projects/assets/invitations/sessions.

Private visibility is represented by an enum plus an access-control join table, never an unchecked client flag. Cross-module calendar entries use `(source_domain, source_id, occurrence_id)` and cannot mutate the source. Reward balances are derived from immutable point transactions. Grocery completion creates history rather than deleting an item.

Finance and Documents use dedicated database schemas and restricted database roles. Document metadata and encrypted blob keys never appear in feed/search projections. Audit rows are append-only and partitioned for retention/export.
