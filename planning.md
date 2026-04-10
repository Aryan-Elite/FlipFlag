# FlipFlag - Feature Flag System MVP (Final Architecture)

## Overview

FlipFlag is a personal feature flag service that enables dynamic feature toggling without redeployment. It supports user targeting, attribute-based rules, and percentage rollouts.

The system follows the principle:

**context (data) + rules (logic) → evaluation result**

---

## Core Concepts

### 1. Context (Client-side)

Represents runtime user data passed from SDK.

```json
{
  "userId": "user-123",
  "attributes": {
    "plan": "premium",
    "country": "IN"
  }
}
```

* Provided by client SDK
* Used for rule evaluation
* Required for rollout hashing

---

### 2. Flags (UI-controlled)

```json
{
  "key": "new-dashboard",
  "isActive": true,
  "defaultRollout": 0
}
```

* Global ON/OFF switch
* Default fallback behavior

---

### 3. Rules (UI-controlled)

Each rule defines:

* WHO → condition (field + values)
* HOW MANY → rollout %
* WHAT → serve (true/false)

```json
{
  "field": "plan",
  "values": ["premium"],
  "rollout": 50,
  "serve": true,
  "priority": 1
}
```

---

## Evaluation Logic (FINAL)

```
Flag enabled globally?
    → No → return false

    → Yes → Evaluate rules (top → bottom by priority)

        IF rule matches (userId / attributes):

            IF rollout exists:
                IF userId missing → skip (passthrough), try next rule  ← CORRECTED
                IF user in rollout bucket:
                    return serve, STOP
                ELSE:
                    continue to next rule (passthrough)  ← CORRECTED

            ELSE (no rollout):
                return serve, STOP

    → DEFAULT:
        IF defaultRollout exists:
            IF userId missing → return false (cannot hash)
            return hash(flagKey + userId) % 100 < defaultRollout
        ELSE:
            return false
```

---

## Key Principles

* First matching rule wins — evaluation stops at first decision
* Rules MUST be fetched ordered by priority ASC at DB/query level — never sort in application code
* Rollout is applied **inside rules**, not globally
* `serve` defines final ON/OFF — but ONLY when user is selected
* `rollout` defines what percentage gets selected
* If user not selected in rollout → continue to next rule (passthrough)
* If userId missing and rollout exists → skip rule (passthrough), cannot hash
* Default ensures fallback behavior when no rules match

### Mental Model
```
Condition → WHO qualifies
Rollout   → WHO gets selected
Serve     → WHAT happens to selected users
```

### Critical Behavior (Finalized)
```
Rule match + rollout pass  → return serve (true/false), STOP
Rule match + rollout fail  → continue to next rule (passthrough)
Rule match + no rollout    → return serve (true/false), STOP
No rules match             → apply default_rollout on flag
No default_rollout         → return false
```

### Important Clarification on `serve`
`serve` only applies when user is SELECTED (rollout passes or no rollout exists).

```
serve=false → return false ONLY if:
    - rule condition matched
    - AND rollout passed (or no rollout on rule)

serve=false + rollout fail → NOT reached, evaluation continues
```

Example:
```
Rule: plan IN [free] → rollout 20% → serve false

User A (plan=free, in 20% bucket):
  condition ✅ → rollout ✅ → return false, STOP

User B (plan=free, NOT in 20% bucket):
  condition ✅ → rollout ❌ → continue to next rule

User C (plan=premium):
  condition ❌ → skip → continue to next rule
```

---

## Database Schema (Final)

### Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Projects

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Environments

```sql
CREATE TABLE environments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    sdk_key VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Flags

```sql
CREATE TABLE flags (
    id SERIAL PRIMARY KEY,
    environment_id INTEGER REFERENCES environments(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    default_rollout INTEGER DEFAULT 0
        CHECK (default_rollout >= 0 AND default_rollout <= 100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(key, environment_id)
);
```

---

### Targeting Rules

```sql
-- rule_type removed (UX-only distinction, not needed in schema)
-- operator column not added in MVP (IN only — add via ALTER TABLE in v2)
CREATE TABLE targeting_rules (
    id SERIAL PRIMARY KEY,
    flag_id INTEGER REFERENCES flags(id) ON DELETE CASCADE,

    field_name VARCHAR(100) NOT NULL,
    values TEXT[] NOT NULL,

    rollout_percent INTEGER CHECK (rollout_percent >= 0 AND rollout_percent <= 100),
    serve BOOLEAN DEFAULT TRUE,

    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints (MVP Focus)

### Auth

| Method | Endpoint |
| ------ | -------- |
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |

---

### Projects

| Method | Endpoint |
| ------ | -------- |
| GET | /api/projects |
| POST | /api/projects |
| GET | /api/projects/:id |
| DELETE | /api/projects/:id |

---

### Environments

| Method | Endpoint |
| ------ | -------- |
| GET | /api/projects/:id/environments |
| GET | /api/environments/:id |

---

### Flags

| Method | Endpoint |
| ------ | -------- |
| GET | /api/environments/:id/flags |
| POST | /api/environments/:id/flags |
| GET | /api/flags/:id |
| PUT | /api/flags/:id |
| DELETE | /api/flags/:id |
| PATCH | /api/flags/:id/toggle |

---

### Rules

| Method | Endpoint |
| ------ | -------- |
| POST | /api/flags/:id/rules |
| PUT | /api/rules/:id |
| DELETE | /api/rules/:id |
| PATCH | /api/rules/:id/toggle |

---

## SDK Endpoint (Critical)

### Request

```http
POST /api/sdk/flags
Headers:
  X-SDK-Key: ff_dev_xxx
```

```json
{
  "userContext": {
    "userId": "user-123",
    "attributes": {
      "plan": "premium"
    }
  }
}
```

---

### Response

```json
{
  "flags": {
    "new-dashboard": true,
    "checkout-v2": false
  }
}
```

---

### Backend Flow

```
1. Validate SDK key
2. Fetch flags + rules
3. Sort rules by priority (ascending)
4. Evaluate each flag using evaluation logic
5. Return results
```

---

## UI Design

```
IF [plan] IN [premium]
THEN rollout [50%] → ENABLED

IF [plan] IN [free]
THEN rollout [20%] → DISABLED

DEFAULT → DISABLED
```

---

## Architecture Flow

```
Client → sends context
        ↓
Backend → fetch flags + rules
        ↓
Evaluate (pure function)
        ↓
Return result
```

---

## MVP Scope

### Included

* Single-condition rules
* IN operator only
* Boolean flags
* Rule-level rollout
* Deterministic hashing (FNV-1a)

---

### Excluded (v2)

* AND / OR logic
* Multi-variant flags
* Segments
* Real-time updates
* operator column (contains, equals, regex — add via ALTER TABLE)

---

## Key Decisions

* Rollout uses deterministic hashing — FNV-1a(flagKey + userId) % 100
* Rules contain rollout + serve
* Default acts as fallback
* Context required for targeting
* rule_type column removed — UX-only distinction, not needed in schema
* operator column deferred to v2 — backward compatible via ALTER TABLE DEFAULT 'IN'
* userId missing + rollout exists → skip rule (passthrough), not return false

---

## Safety & Reliability

* Default ensures predictable behavior
* Rollout limits exposure risk
* Global flag acts as kill switch
* serve only executes when user is selected — rollout failure never reaches serve

---

## Frontend — Next.js

* Router: App Router
* SDK initialization: `layout.jsx` (runs once, wraps entire app)
* Server Components: decision pending — decide when frontend implementation starts

---

## Future Improvements (v2)

* Multi-condition rules (AND/OR logic)
* operator support (contains, equals, regex, greater_than)
* Multi-variant flags (A/B/C)
* Scheduled rollouts
* Real-time updates (SSE)
* Segments
* A/B testing