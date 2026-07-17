# Architecture Decision Records

## ADR-001: Logout scope (device vs other devices)

**Context:** Refresh tokens support multiple concurrent sessions (e.g. phone + desktop). Logout must decide whether to end only the current browser session or every session for the user.

**Decision:**
- **Server:** Logout revokes only the refresh token presented with the request (the current device cookie). Other devices keep their sessions until expiry, logout, or refresh-token reuse detection. Sign-in may create an additional refresh token without revoking existing ones.
- **Same browser (all tabs):** Auth UI state is synchronized across tabs via a same-origin broadcast:
  - `clear` — logout / session loss drops in-memory access token in every tab
  - `session-ready` — after sign-in, peer tabs refresh under the Web Lock to pick up the shared cookie session
  - `refresh-done` — hints peers that a refresh already succeeded (retry without long delay)

**Consequences:**
- Users can stay signed in on other devices after logging out on one.
- Within one browser, logout signs the user out in every open tab; sign-in in one tab brings other tabs onto the same session after they refresh.
- Compromised sessions on other devices are not cleared by a single logout; mitigate via short refresh TTL, reuse detection on rotated tokens, and a future “sessions” / “logout everywhere” feature if needed.
- Product copy may say the user is signed out of this browser; it must not imply a global sign-out across devices unless that feature is added.
