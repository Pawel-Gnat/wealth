# Architecture Decision Records

## ADR-001: Logout revokes only the current refresh session

**Context:** Refresh tokens support multiple concurrent sessions (e.g. phone + desktop). Logout must decide whether to end only the current device session or every session for the user.

**Decision:** Logout revokes only the refresh token presented with the request (the current device cookie). Other devices keep their sessions until expiry, logout, or refresh-token reuse detection. Sign-in may create an additional refresh token without revoking existing ones.

**Consequences:**
- Users can stay signed in on other devices after logging out on one.
- Compromised sessions on other devices are not cleared by a single logout; mitigate via short refresh TTL, reuse detection on rotated tokens, and a future “sessions” / “logout everywhere” feature if needed.
- Product copy and UX should not imply a global sign-out unless that feature is added.
