# Agents & Development Standards

# Wiggle Pop

# Agents

## Shared Agent Registry

Shared MDS agent definitions and review workflows are maintained in the
[MDS Agent Registry](https://agents.malandevelopmentsystems.co.za/).

## Review Coordinator

Repository reviews are coordinated by [Sam](https://agents.malandevelopmentsystems.co.za/agents/sam.md).

Sam is responsible for selecting the appropriate specialist
agents based on the requested task.

## Default Workflow

Use the [Full Review workflow](https://agents.malandevelopmentsystems.co.za/workflows/full-review.md) unless another workflow is explicitly requested.

## Sam Review Activation

When the user asks Sam to review Wiggle Pop, treat it as a Full Review. Activate
Sam, RevisionSam, SecuritySam, DesignSam, and MobileSam before
reviewing. This covers Angular standards, backend and tenant security,
mobile-first design and release risk, accessibility, and fitness-domain
behaviour.

At the start of the review, show the active team through the registry link:

`https://agents.malandevelopmentsystems.co.za/?agents=sam,revision-sam,security-sam,design-sam,mobile-sam`

The registry applies `is-active` to those cards. If a review is narrower, Sam
may activate only the relevant specialists and must state why.

⚠️ **This document is authoritative.**

---

## Before Making Changes

Agents must read these project-local documents before editing code, routes, UI, copy, or behavior:

1. `context.md` - product scope, current route structure, screen definitions, service contracts, and success criteria.
2. `feedback.md` - latest user feedback and explicit implementation preferences.

Use `context.md` to verify whether a change fits the current product and route structure. Use `feedback.md` to preserve the user's latest corrections, especially navigation and interaction rules.

If `agents.md`, `context.md`, `feedback.md`, and the live code disagree, inspect the live code before changing it and keep the smallest safe update. The newest explicit user instruction overrides stale documentation.

---

## Core Principle

1. **Build a mobile product.**
2. **Do not shrink a web dashboard.**
3. **Every feature must justify itself on mobile.**

**Preferred outcomes:**
- Fast
- Simple
- Predictable
- Offline-friendly
- Maintainable

---

### Angular

**Use:**
- Standalone Components
- `inject()`
- Signals where practical
- `OnPush` change detection

**Prefer:**
- `computed()`

**Avoid:**
- Constructor injection
- NgModules
- Template complexity

---

### Services

**Pages must not call HttpClient.**

**Allowed:**
```
Page → Service → API
```

**Forbidden:**
```
Page → HttpClient
```

**Good:** `workout.service.ts`

**Bad:** `today.page.ts`

---

### Components

**Folder:** `components/`

**Naming:** `feature-name.component.ts`

**Rules:**
- Single responsibility
- ≤200 lines preferred
- No business logic
- Inputs immutable
- Outputs explicit

---

### Styling

**Priority:**
1. Ionic
2. Tailwind
3. SCSS

**Do not:**
- Inline styles
- Magic spacing
- Random colors

**Use design tokens:**
- `bg-surface`
- `text-primary`
- `rounded-card`

---

## Folder Rules

**Allowed:**
- `pages/`
- `services/`
- `components/`
- `models/`
- `shared/`
- `theme/`
- `guards/`

**Forbidden:**
- `utils2/`
- `new-folder/`
- `misc/`
- `temp/`

---

## Routing Rules

**Feature routes only.**

**Do not:**
- `/page1`
- `/page2`

**Use:**
- `/workouts/today`
- `/bookings/upcoming`
- `/profile`

**Max depth:** 3

---

## API Rules

**Single API gateway:** `services/api.service.ts`

**Rules:**
- Timeout: 10s
- Retry: 1
- Errors normalized

**Response shape:**
```json
{
  "success": true,
  "data": "T",
  "error": "string (optional)"
}
```

---

## State Rules

**Local first.**

**Avoid:** Global state

**Use:** Signals

**Escalate only if needed.**

**Allowed global state:**
- `auth`
- `profile`
- `theme`

---

## Testing Rules

**Required:**
- Service tests
- Guard tests
- Smoke test

**Before merge:**
- Build
- Lint
- Typecheck

---

## Git Rules

**Branch naming:**
- `feature/`
- `fix/`
- `refactor/`
- `release/`

**Commit format:**
- `feat:`
- `fix:`
- `refactor:`
- `docs:`

**No direct commits to main.**

---

## Performance Budget

| Metric | Target |
|--------|--------|
| Cold start | <2s |
| Screen transition | <150ms |
| Bundle | <5MB |
| Lighthouse mobile | ≥90 |

---

## Definition of Done

- [ ] Code builds
- [ ] No lint errors
- [ ] No duplicate logic
- [ ] Reviewed
- [ ] Mobile tested
- [ ] Dark mode verified
- [ ] No TODO comments

---

## Authority Boundaries

### Principle

Every decision in the system must have one authoritative owner.

Never duplicate ownership across frontend and backend.

---

### Frontend Owns

The frontend owns:

- Presentation
- Layout
- Navigation
- Visual state
- User interaction
- Loading states
- Temporary UI state
- Feature visibility
- Client-side validation for UX

Frontend may:

- Show buttons
- Hide buttons
- Filter views
- Display routes
- Display permissions

Frontend must not:

- Assign roles
- Grant permissions
- Trust local state
- Enforce security
- Decide tenant access
- Decide ownership

---

### Backend Owns

The backend owns:

- Authentication
- Authorization
- Roles
- Permissions
- Tenant isolation
- Data validation
- Business rules
- State transitions
- Audit logging
- Data persistence

Backend must:

- Validate every request
- Derive user authority
- Enforce permissions
- Scope tenant queries
- Ignore privileged frontend fields

Backend never trusts these request body values:

- `role`
- `isAdmin`
- `client_id`
- `user_id`
- `permissions`

---

### Role Rule

Roles are assigned by API.

**Bad:**

```ts
if (email.includes("admin")) role = "admin";
```

**Bad:**

```ts
if (frontendRole === "admin")
```

**Good:**

```txt
JWT
-> user_id

API
-> loads role

API
-> validates permission

API
-> executes request
```

---

### Permission Rule

Frontend asks:

> Should I show this?

Backend answers:

> May this happen?

---

### Tenant Rule

Frontend may display active client.

Backend decides active client.

Never trust:

- `client_id`
- `tenant_id`
- `role`

sent from the UI.

---

### Data Ownership Rule

| Data type | Owner |
|-----------|-------|
| Profile data | Profile tables |
| Activity data | Event tables |
| Computed data | Derived queries |

Never store duplicated truths.

---

### Final Test

If changing browser JavaScript can grant access, the decision belongs in the backend.

*End of Document*