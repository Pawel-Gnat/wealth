# Architecture Decision Records

## ADR-001: Logout scope and cross-tab / cross-device session sync

**Context:** Refresh tokens support multiple concurrent sessions (e.g. phone + desktop). Logout must decide whether to end only the current browser session or every session for the user. Open tabs in the same browser (and other devices with a live connection) need a reliable way to clear in-memory auth UI when the server revokes a session.

**Decision:**
- **Server:** Logout revokes only the refresh token presented with the request (the current device cookie). Other devices keep their sessions until expiry, logout, or refresh-token reuse detection. Sign-in may create an additional refresh token without revoking existing ones. Reuse detection revokes all active refresh tokens for that user.
- **Revocation push (SSE):** After a durable revoke (logout → `scope: session`; reuse detection → `scope: user`), the backend best-effort publishes `auth.session-revoked` over Redis pub/sub and delivers it on `GET /sse` to matching live connections. Clients clear local auth state from that event. No access or refresh tokens travel in SSE payloads.
- **Same-browser BroadcastChannel (narrow):** Only hints that SSE cannot cover well:
  - `session-ready` — after sign-in, peer tabs (often still on the login screen, without SSE) refresh under the Web Lock to pick up the shared cookie session
  - `refresh-done` — hints peers that a refresh already succeeded (retry without long delay)
  - Do **not** broadcast local `clear` for logout; peer logout / revocation UI sync is SSE-only.
- **Degradation:** Redis or SSE unavailable must not fail logout HTTP. Peers without a live stream converge on page reload or when the access JWT expires (≤15m) and refresh fails / returns 401.

**Consequences:**
- Users can stay signed in on other devices after logging out on one, unless those devices hold a live SSE connection for the same session (logout) or any session of that user (reuse detection).
- Within one browser, tabs with an open SSE stream log out live after server revoke; tabs without SSE (e.g. login screen) are not woken by `clear` anymore.
- Sign-in in one tab still brings other tabs onto the same session via `session-ready` + refresh.
- Compromised sessions on other devices are not cleared by a single logout unless they receive SSE; mitigate via short access TTL, reuse detection, and a future “sessions” / “logout everywhere” feature if needed.
- Product copy may say the user is signed out of this browser; it must not imply a global sign-out across devices unless that feature is added.
