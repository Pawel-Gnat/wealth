# Architecture Decision Records

## ADR-001: Cookie session, logout scope, and session-ended SSE

**Context:** The app used an access JWT in JavaScript (Bearer) plus a refresh cookie. Logout could clear the UI while the cookie/row still authenticated the next reload. Refresh reuse used to revoke every session for the user. Cross-tab sync used BroadcastChannel and a Web Lock. That stack is replaced by opaque tokens in httpOnly cookies and one `sessions` row per device session.

**Decision:**

- **Source of truth:** Two httpOnly cookies (`wealth.auth.session`, `wealth.auth.refresh`) and one database row. Tokens are opaque (`randomBytes` → base64url); the DB stores SHA-256 hashes only. No JWT, no access token in JS, no CSRF header. Mutations are JSON; CSRF defense is the CORS origin allowlist (required in production) plus preflight. Production cookies: `Secure` + `SameSite=None`. Local: `SameSite=Lax`, not secure.
- **TTL:** Session cookie 15 minutes. Refresh cookie slides 3 days from each successful `/refresh`. Refresh rotation is CAS on `refreshHash` (update in place; `sessions.id` stays put so SSE need not reconnect). A 10s grace window accepts the previous refresh and returns the **same** new session (multi-window), not another rotation. Presenting the previous refresh **after** grace deletes **that** row only and publishes `session-ended`. Unknown/garbage refresh: 401, no publish.
- **Logout and sign-in:** Logout ends only the current row (refresh cookie; session cookie may already be dead), returns 204, clears both cookies, best-effort SSE. Redis/SSE failure must not fail logout HTTP. Sign-in with an existing refresh cookie ends that row (`session-ended` then `DELETE`) and inserts a new one. Other devices are unchanged. Sign-up creates a user only — no cookies, no auto-login. “Logout everywhere” is out of scope. Existing `refresh_tokens` are not migrated (force re-login).
- **RPC vs SSE:** API and `GET /me` authenticate with the session cookie (`SessionGuard`). `GET /sse` authenticates with the refresh cookie, targeting the same `sessions.id`. Event: `session-ended` (no `scope`). Publish before `DELETE` on logout, post-grace reuse, failed refresh that deletes a found row, and sign-in that replaces the current refresh row.
- **Frontend:** Public context is `{ user, isAuthLoading, logout }`. Layouts treat `user !== null` as signed in. Bootstrap is `GET /me` only (401 → refresh + retry `/me`). Sign-in/refresh/me share `{ user, sessionExpiresAt }`. A timer ~1 minute before expiry and the 401 interceptor share one in-tab mutex `/refresh`. No Bearer, Web Lock, or auth BroadcastChannel. A second tab left on the login screen does not live-sync after sign-in (reload). `user` becomes null only from logout, `session-ended`, or `/refresh` 401. EventSource errors reconnect with backoff; they never log the user out.

**Consequences:**

- Logout on one device does not sign the user out elsewhere. Copy must not imply a global sign-out.
- Tabs with a live SSE stream clear UI when that session ends. Tabs without SSE (login screen) wait for reload or a later `/me` / failed refresh.
- Reuse after grace is treated as theft of **this** session, not of every device.
- Session lookup hits the database on each RPC (Redis cache later). Logout is immediate on the API because the row is gone, not because a JWT expired.
- Production `SameSite=None` makes a strict CORS allowlist mandatory.
