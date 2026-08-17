# Backend & Database Rules

---

## Schema and Migrations

### Schema-as-Code
PRINCIPLE: Database schema changes must be captured in versioned, source-controlled migration files — never applied ad-hoc via a SQL client. Each migration file is a one-way, sequential script. Once applied to production it is immutable.

HERE: Migrations are plain Node.js scripts in `CampUs-api/` root: `migrate.js`, `migrate-v2.js`, `migrate-v3.js`, `migrate-v4.js`, `admin-migrate.js`, `init-db.js`, `db-constraints.js`. They use `@neondatabase/serverless` and are run manually (`node migrate-v4.js`). **Never edit an already-applied migration file.** For new schema changes, create a new `migrate-v5.js` (incrementing the version number). There is no migration tracker (no `schema_migrations` table), so the version number in the filename IS the tracker.

---

### Additive Migrations Only
PRINCIPLE: Prefer `ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, and `CREATE INDEX IF NOT EXISTS`. Destructive changes (DROP, RENAME) require explicit review because they can't be rolled back.

HERE: All existing migrations use the `IF NOT EXISTS` / `IF EXISTS` pattern. Follow this. If a column rename is needed, add the new column, backfill data, update application code, then remove the old column in a follow-up migration — never rename in one step.

---

## SQL Query Rules

### Tagged Template Literals (Critical)
PRINCIPLE: Use the database client's parameterized query API. Never concatenate user input into a SQL string.

HERE: The Neon client (`@neondatabase/serverless`) uses **tagged template literals exclusively**. The correct form is:
```js
const rows = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
```
**Never use** `sql(baseString + " AND col = $1", [value])` — this is the `node-postgres` calling convention and will throw a runtime 500 error in Neon. Every query branch that varies by parameter must be a separate tagged template literal block.

---

### Avoid N+1 Queries
PRINCIPLE: Never issue a query inside a loop over a result set. One request should not generate O(n) database round-trips. Fetch related data with JOINs or IN clauses.

HERE: The most common violation pattern in this codebase is fetching a list of items and then fetching related profile names in a `.map()`. Fix this with a `LEFT JOIN profiles ON ...` in the primary query, as already done in `api/conversations.js`. When adding new list endpoints, always join the related data up front.

---

### Index Hot Lookup Paths
PRINCIPLE: Every column used in a `WHERE` clause on a table with significant rows should have an index. Unindexed lookups on large tables cause full table scans.

HERE: Core indexes are defined in `db-constraints.js` and are already applied:
- `idx_products_feed` on `(college_name, is_active, created_at DESC)`
- `idx_knowledge_feed` on `(college_name, course, semester, created_at DESC)`
- `idx_messages_conversation` on `(conversation_id, created_at ASC)`

When adding a new table or a new filter condition on an existing table, add an `CREATE INDEX IF NOT EXISTS` in a new migration script.

---

### LIMIT All List Queries
PRINCIPLE: Unbounded `SELECT *` without a `LIMIT` on large tables will eventually cause memory exhaustion and slow responses. Every list query must have a cap.

HERE: Add `LIMIT 50` (or an explicit pagination `LIMIT/OFFSET`) to every query that returns multiple rows. The default list queries in knowledge-hub, events, and products already do this. New endpoints must follow the same pattern.

---

## Input Validation

### Validate at the API Boundary
PRINCIPLE: The backend must validate all inputs — type, presence, length, format, and range — before they touch business logic or the database. Client-side validation is UX only, never a security control.

HERE: There is currently **no validation library** (no Zod, Joi, or express-validator) on the backend. Validation is done with manual `if (!field)` checks. For new routes, add explicit guards at the top of each handler before any DB call:
```js
const { title, user_id } = req.body;
if (!title || typeof title !== 'string' || title.trim().length === 0) {
  return res.status(400).json({ error: 'title is required' });
}
if (title.length > 200) {
  return res.status(400).json({ error: 'title must be 200 characters or fewer' });
}
```
Do not trust `req.query`, `req.params`, or `req.body` without checking type and bounds.

---

### Ownership / Authorization Checks
PRINCIPLE: After validating inputs, verify that the authenticated user is allowed to perform the requested operation on the target resource. Authentication (who are you?) and authorization (are you allowed?) are separate checks.

HERE: `req.uid` is the Firebase UID set by `verifyFirebaseToken` middleware. For any mutation on a user-owned resource (e.g., deleting a product, editing a listing), always check that `req.uid === resource.seller_id` (or equivalent owner field) before proceeding. For admin-only mutations, the `requireAdminForMutations` middleware handles the DB role check. Never skip this check because "the frontend already prevents it."

---

## Transactions and Consistency

### Wrap Multi-Step Writes in a Transaction
PRINCIPLE: Any operation that modifies more than one table, or makes multiple related changes to the same table, must be wrapped in a database transaction. A partial write that leaves the DB in an inconsistent state is worse than a full failure.

HERE: The Neon serverless client supports transactions via `sql.transaction()`:
```js
await sql.transaction(async (tx) => {
  await tx`DELETE FROM user_files WHERE hash = ${hash} AND user_id = ${userId}`;
  await tx`UPDATE file_hashes SET reference_count = reference_count - 1 WHERE hash = ${hash} RETURNING reference_count`;
});
```
The file deletion flow (in `api/delete-file.js`) specifically requires a transaction for the ownership-row delete + reference-count decrement. The R2 `DeleteObjectCommand` happens **outside** the transaction (after it commits) and uses the `pending_deletion` flag as a safe retry mechanism.

---

### Atomic Increments/Decrements
PRINCIPLE: Never read a counter, modify it in application code, and write it back — this creates a race condition. Always use a single atomic SQL statement that modifies the value in the database.

HERE: Reference counts must always be modified as:
```sql
UPDATE file_hashes SET reference_count = reference_count - 1 WHERE hash = $hash RETURNING reference_count
```
The returned value from the `RETURNING` clause is what determines whether to issue an R2 delete — never make that decision based on a separate SELECT before or after.
