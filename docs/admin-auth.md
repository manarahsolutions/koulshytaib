# Admin Authentication — كلشي طيب (Phase 18)

Admin-only authentication and authorization. Customers remain guest-first (no login).

## 1. Architecture

```text
Browser
  → HttpOnly cookie (kt_admin_session)
  → proxy.ts (UX redirect for /admin/*)
  → (app) layout requireAdmin()
  → Server Actions requireAdmin()
  → Domain service / DB repository
  → Prisma → PostgreSQL
```

Security source of truth is **server-side** (`requireAdmin()`), not the proxy alone.

## 2. Session strategy

- **Signed session token** (HMAC-SHA256) containing: `sub` (admin id), `identifier`, `role`, `iat`, `exp`
- **Not** database-backed session rows (simpler for Phase 18; revocable via `isActive` + secret rotation)
- Cookie name: `kt_admin_session`
- HttpOnly, SameSite=Lax, Secure in production, path `/`
- Lifetime: **12 hours**
- Never stores password or passwordHash

On each `requireAdmin()` / `getCurrentAdmin()` call, the AdminUser row is reloaded so deactivated accounts lose access even if the cookie is still valid.

## 3. Cookie security

| Flag | Value |
| --- | --- |
| HttpOnly | yes |
| Secure | production only |
| SameSite | Lax |
| Max-Age | 12h |

Signing secret: `ADMIN_SESSION_SECRET` (min 16 characters).

## 4. AdminUser schema

```text
AdminUser
  id, identifier (unique, lowercase), passwordHash, role, isActive, createdAt, updatedAt
```

Roles enum: `OWNER` | `MANAGER` | `STAFF`

## 5. Roles

| Role | Phase 18 behavior |
| --- | --- |
| OWNER | Full access (all protected Admin actions) |
| MANAGER | Same operational access |
| STAFF | Same operational access |

`requireRole()` / `requireAdminRole()` exist for future granular permissions. Phase 18 gates on authentication, not a large permission matrix.

## 6. Route protection

- `/admin/login` — public (redirects to `/admin` if already signed in)
- All other `/admin/*` — `(app)` layout calls `requireAdmin()`; unauthenticated → `/admin/login`
- `src/proxy.ts` — Edge UX redirect when cookie missing/invalid

## 7. Server Action protection

Admin mutations/reads in `src/app/actions/backend.ts` call `requireAdminDb()`:

- Products / categories / offers mutations
- Orders list/detail/status
- CRM / loyalty bootstrap and customer updates

**Not** Admin-gated (customer guest flows):

- `fetchCatalogAction`, `fetchOffersAction`
- `placeGuestOrderAction`
- `databaseStatusAction`

Auth actions: `src/app/actions/admin-auth.ts` (`loginAdminAction`, `logoutAdminAction`).

## 8. Password handling

- `bcryptjs` with cost factor 12
- Hash + verify only on the server
- Never sent to the client; never logged
- Login failures use a **generic** Arabic message (no user enumeration)

## 9. Seed setup

On `npm run db:seed`, if both are set:

```bash
ADMIN_SEED_IDENTIFIER=admin@example.com
ADMIN_SEED_PASSWORD=your-long-password
ADMIN_SEED_ROLE=OWNER   # optional
```

Password must be at least 8 characters. If vars are missing, catalog seed still runs and Admin seed is **skipped** (logged). No hardcoded production password.

## 10. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | for auth | PostgreSQL |
| `ADMIN_SESSION_SECRET` | for login | HMAC signing (≥16 chars) |
| `ADMIN_SEED_IDENTIFIER` | optional | Seed admin login |
| `ADMIN_SEED_PASSWORD` | optional | Seed admin password |
| `ADMIN_SEED_ROLE` | optional | OWNER / MANAGER / STAFF |

See `.env.example`.

## 11. Behavior without DATABASE_URL

- No fake Admin session / bypass credentials
- Protected Admin routes redirect to login
- Login fails with a clear configuration/DB message
- Customer guest flows continue with in-memory fallback (Phase 17)

**Security > convenience.**

## 12. Known limitations

- No password reset / email verification
- No MFA / OTP
- No per-action permission matrix yet
- Session not individually revocable without `isActive=false` or secret rotation
- No customer authentication (intentional)

## 13. Future expansion

- Granular `requireRole` / permission checks per mutation
- Optional DB session table for forced logout
- Audit log of Admin actions
- Password reset for OWNER-managed accounts
