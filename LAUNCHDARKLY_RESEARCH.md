# LaunchDarkly Deep Dive + FlipFlag MVP Roadmap

> Researched: April 2026 | Based on full LaunchDarkly docs + FlipFlag codebase analysis

---

## What is LaunchDarkly?

LaunchDarkly is a **Feature Management Platform**. It lets engineering and product teams control which features are visible to which users — without deploying new code. Think of it like a remote control panel for your running app.

**Core idea:** Instead of `if (someConfig === true)`, you ask LaunchDarkly's SDK: "should user X see feature Y?" and LaunchDarkly evaluates targeting rules, experiments, and rollout percentages and tells you yes/no (or a value) — in real time.

---

## LaunchDarkly: Every Major Feature Explained Simply

---

### 1. Feature Flags (The Core)

A feature flag is just a named switch with a value. LaunchDarkly supports 4 types:

| Type | Example Value | Use Case |
|------|--------------|----------|
| **Boolean** | `true` / `false` | Kill switch, enable/disable a feature |
| **String** | `"v2"` / `"control"` | Which UI variant to show |
| **Number** | `50` / `3.14` | Config values, rate limits, timeouts |
| **JSON** | `{"color": "red", "size": "lg"}` | Complex config objects |

Every flag has **named variations** — e.g., a string flag might have variations called "control", "treatment-a", "treatment-b".

---

### 2. Environments

Every project has multiple environments (Dev, Staging, Production, etc.). Each environment has its own:
- **SDK keys** — separate server-side and client-side keys
- **Flag states** — a flag can be ON in Dev but OFF in Production
- **Targeting rules** — different rollout percentages per environment
- **Approval settings** — Prod might require approvals, Dev doesn't

LaunchDarkly lets you create unlimited custom environments (not just Dev/Prod).

---

### 3. Targeting Rules — How Flags Decide Who Gets What

This is the most powerful part. Each flag has an ordered list of rules. Evaluation goes top to bottom until a rule matches.

**Rule structure:**
```
IF  user.country IS ONE OF ["IN", "US"]
AND user.plan EQUALS "premium"
THEN serve variation: "new-checkout"
     with 50% rollout
```

**Supported operators:**
- `is one of` / `is not one of`
- `contains` / `does not contain`
- `starts with` / `ends with`
- `matches regex`
- `equals` / `does not equal`
- `greater than` / `less than` (for numbers)
- `before` / `after` (for dates)
- `semantic version` comparisons (e.g., `>=2.0.0`)

**Target individual users too:** You can explicitly say "user ID abc123 always gets the ON variation" — before any rules even evaluate.

---

### 4. Percentage Rollouts

At the bottom of every flag's evaluation (the "default" case), you can define a rollout:
- 10% of users → "new-feature"
- 90% of users → "old-feature"

This uses a hash of the user ID + flag key to make the assignment sticky (same user always gets the same variation). This is the "gradual rollout" / canary deployment pattern.

---

### 5. Segments — Reusable Audiences

Instead of copy-pasting the same `country IN ["IN", "US"]` rule across 50 flags, you create a **Segment** called "IndiaUSPremiumUsers" and reuse it everywhere.

**Types:**
- **Rule-based segments** — dynamically evaluated (e.g., "users where plan=premium")
- **List-based segments** — explicit list of user IDs (e.g., beta testers)
- **Big segments** — for lists >15,000 users, stored in persistent backend (Redis/DynamoDB)
- **Synced segments** — automatically synced from Amplitude, Segment, etc.

---

### 6. Contexts (LaunchDarkly's User Model)

LaunchDarkly evolved beyond just "targeting users". Now you can target any **context kind**:
- `user` — the logged-in person
- `organization` — the company they belong to
- `device` — the device type
- `custom` — anything you define

**Multi-context evaluation:** One SDK call can evaluate against user + org + device simultaneously:
```json
{
  "user": {"key": "user-123", "plan": "premium"},
  "organization": {"key": "acme-corp", "tier": "enterprise"},
  "device": {"key": "iphone-14", "os": "ios16"}
}
```
A flag rule can say: "org.tier = enterprise AND user.plan = premium → serve true"

---

### 7. Real-Time Flag Updates (Streaming)

LaunchDarkly SDKs maintain a **persistent SSE (Server-Sent Events) connection** to LaunchDarkly's servers. When you toggle a flag in the dashboard, every connected SDK client receives the update in ~200ms — without any polling, without a restart, without a redeploy.

This is what makes LaunchDarkly powerful: you can toggle a feature for 10 million users simultaneously in under a second.

---

### 8. Local Evaluation (Server SDKs)

Server-side SDKs (Node.js, Go, Python, etc.) **download all flag rules on startup** and evaluate them locally — no network call per flag evaluation. This means:
- Evaluation is microsecond-fast
- Works even if LaunchDarkly is down (cached rules)
- Can handle millions of evaluations/second on your own servers

Client-side SDKs (browser, mobile) work differently — they send the user context to LaunchDarkly and get back pre-evaluated values for that specific user.

---

### 9. Experimentation (A/B Testing)

LaunchDarkly has a full A/B testing product built on top of flags.

**How it works:**
1. Create a flag with 2+ variations (control vs treatment)
2. Create an experiment tied to that flag
3. Define a **metric** (conversion, click, revenue, custom event)
4. LaunchDarkly tracks which users saw which variation and what they did
5. It calculates statistical significance and tells you which variation won

**Metric types:**
- Conversion (did user do X?)
- Click (did user click element?)
- Page view (did user visit URL?)
- Custom events (anything you track)
- Numeric/revenue (average order value, etc.)

---

### 10. Guarded Rollouts & Release Pipelines

**Guarded rollout:** Gradually increase traffic to a new feature while automatically monitoring metrics. If error rate spikes → rollout pauses automatically.

```
Stage 1: 1% → watch error rate for 30 min
Stage 2: 5% → watch conversion rate
Stage 3: 25% → watch p99 latency  
Stage 4: 100% → fully launched
```

**Release pipelines:** Multi-environment promotion workflow:
```
Dev → Staging → Production
```
Each stage can have automated gates (tests must pass, metrics must be healthy).

---

### 11. Approval Workflows

For production environments, you can require approvals before flag changes go live:
- "2 people must approve this change before it applies"
- Specific team members are notified
- Request → Review → Approve/Deny → Applied
- Integration with ServiceNow for enterprise compliance

---

### 12. Audit Log & Change History

Every change to every flag is recorded:
- Who changed it
- What changed (old value → new value)
- When
- From which environment

Exportable, searchable, flag-level history available.

---

### 13. Scheduled Flag Changes

Set a flag to automatically change at a future date/time:
- "Turn off the summer sale banner at midnight on July 4th"
- "Enable the new onboarding flow on launch day at 9am"

No one needs to be awake at 3am to flip a switch.

---

### 14. Flag Lifecycle Management

Flags have a **lifecycle status**:
- `new` — just created
- `active` — being evaluated
- `launched` — fully rolled out, consider cleaning up
- `inactive` — not being evaluated by any SDK
- `deprecated` — marked for removal

**Code references:** LaunchDarkly scans your GitHub repos to find where each flag key is used in code — so you know what to delete when you archive a flag.

**Archiving:** Soft-delete a flag. It stops being evaluated but the history is preserved.

---

### 15. Flag Prerequisites

Flag A can depend on Flag B:
- "Only evaluate the `checkout-redesign` flag if `new-checkout-flow` flag is ON"

This creates dependency chains — useful for feature dependencies.

---

### 16. Webhooks & Integrations (70+)

**Outbound webhooks:** Notify any URL when a flag changes.

**Flag triggers (inbound webhooks):** External systems can trigger flag changes:
- PagerDuty alert fires → automatically disable the problematic feature
- Smoke test fails in CI → roll back the flag

**Key integrations:**
- Monitoring: Datadog, New Relic, Dynatrace, Grafana, Honeycomb
- CI/CD: GitHub Actions, GitLab, CircleCI, Terraform
- Chat: Slack, Microsoft Teams
- Project: Jira, ServiceNow
- Data: Amplitude, Segment, mParticle
- Edge: Cloudflare, Vercel, Fastly, Akamai, Netlify

---

### 17. SDK Ecosystem (25+)

| Category | Languages/Platforms |
|----------|-------------------|
| Server-side | Node.js, Python, Go, Java, .NET, Ruby, PHP, Rust, C/C++, Erlang |
| Browser | JavaScript, React, Vue, Angular |
| Mobile | iOS, Android, Flutter, React Native |
| Edge | Cloudflare Workers, Vercel Edge, Fastly, Akamai |
| AI | Dedicated AI Config SDK |

---

### 18. AI Configs (Newest Product)

A dedicated product for managing AI/LLM configurations as feature flags:
- Store prompts, model names, temperature, max_tokens as flag values
- A/B test "GPT-4 vs Claude Sonnet" by serving different model names to different users
- Swap prompts in production without redeployment
- Run experiments to measure which prompt drives better outcomes

---

### 19. Access Control (RBAC)

Very granular permission system:
- Built-in roles: Reader, Writer, Admin, Owner
- Custom roles with policy-based rules (like AWS IAM):
  - `ALLOW write on project:my-project/*`
  - `DENY delete on environment:production/*`
- Team management: group users → assign roles to teams
- SSO/SAML 2.0 + SCIM provisioning for enterprise
- Per-environment permission restrictions

---

### 20. Relay Proxy

A self-hosted proxy that sits between your servers and LaunchDarkly:
- Caches all flag rules locally
- Your servers connect to the Relay Proxy instead of LaunchDarkly directly
- Reduces latency (especially in regions far from LaunchDarkly's servers)
- Works in air-gapped environments
- Supports Redis, DynamoDB, Consul as persistent stores
- Required for big segments

---

## What FlipFlag Has Today

| Feature | Status |
|---------|--------|
| Auth (email + Google OAuth) | Done |
| Projects CRUD | Done |
| Auto-create Dev + Prod environments | Done |
| Boolean flags per environment | Done |
| Toggle flags on/off | Done |
| Per-environment SDK keys | Done |
| `targeting_rules` DB schema | Schema only — not wired |
| SDK evaluation endpoint | Designed — not built |
| Flag detail/edit page | Route exists — page missing |
| Dashboard stats | Mock data only |

---

## FlipFlag MVP+ Roadmap

### Phase 1: Core That's Missing (Must-Have)

#### 1.1 SDK Evaluation Endpoint — the actual reason people use feature flags

```
POST /api/sdk/flags
Header: Authorization: Bearer <SDK_KEY>
Body: { "flagKey": "my-feature", "context": { "userId": "u-123", "plan": "premium" } }
Response: { "value": true, "variation": "on", "reason": "RULE_MATCH" }
```

**How it works (already designed in planning.md):**
1. Look up environment by SDK key
2. Get all flag configs for that environment
3. For each rule (ordered by priority): evaluate condition against context
4. If rule matches → return variation (with optional rollout %)
5. If no rule matches → return `default_rollout`

Use FNV-1a hash of `userId + flagKey` for percentage rollouts (same user always gets same result).

**Why it matters:** Without this, FlipFlag is just a dashboard. With this, it's an actual product.

#### 1.2 Targeting Rules UI + Backend Routes

Wire up the `targeting_rules` table that already exists in the schema.

**Backend routes needed:**
```
GET    /api/flags/:flagId/rules
POST   /api/flags/:flagId/rules
PUT    /api/flags/:flagId/rules/:ruleId
DELETE /api/flags/:flagId/rules/:ruleId
PUT    /api/flags/:flagId/rules/reorder  (update priorities)
```

**Operators to support (start simple, expand):**
- `equals` / `not_equals`
- `in` / `not_in` (comma-separated list)
- `contains`
- `greater_than` / `less_than` (for numbers)

**Frontend:** A rule editor on the flag detail page. Each rule card shows:
- Field name input
- Operator dropdown
- Value input
- Serve: ON / OFF / % rollout
- Drag to reorder (priority)

#### 1.3 Flag Detail Page

`/projects/[id]/environments/[envId]/flags/[flagId]`

This page is where users:
- View flag details (key, description, created date)
- Manage targeting rules (add/edit/delete/reorder)
- Set default rollout %
- View flag history (future)

---

### Phase 2: Nice-to-Have for MVP+

#### 2.1 Audit Log

Track every change to every flag. Simple DB table:

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  flag_id UUID REFERENCES flags(id),
  environment_id UUID REFERENCES environments(id),
  user_id TEXT,
  action TEXT,            -- 'flag.toggle', 'rule.create', 'flag.delete'
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Every backend mutation writes to this table. Frontend shows a simple timeline on the flag detail page.

**Why it's powerful in interviews:** "I built a full audit trail so teams can always see who changed what and roll back mentally."

#### 2.2 Real Dashboard Stats (Replace Mock Data)

Wire up the dashboard page to real queries:
```sql
SELECT COUNT(*) FROM flags WHERE project_id = ?                          -- total flags
SELECT COUNT(*) FROM flag_configs WHERE is_active = true AND env_id = ?  -- active flags
SELECT COUNT(*) FROM environments WHERE project_id = ?                   -- environments
SELECT COUNT(*) FROM audit_log WHERE created_at > NOW() - INTERVAL '24h' -- 24h changes
```

#### 2.3 Multivariate Flags (String/Number/JSON)

Extend the schema to support non-boolean flags:

```sql
ALTER TABLE flags ADD COLUMN flag_type TEXT DEFAULT 'boolean'; -- boolean, string, number, json
ALTER TABLE flags ADD COLUMN variations JSONB; -- [{"name": "control", "value": "v1"}, ...]
ALTER TABLE flag_configs ADD COLUMN serve_variation TEXT; -- which variation name to serve
```

This unlocks use cases like "show pricing plan A vs B vs C to different segments."

#### 2.4 More Targeting Operators

Add to the evaluation engine:
- `starts_with` / `ends_with`
- `matches_regex`
- `before_date` / `after_date` (ISO timestamp comparison)
- `semver_gte` / `semver_lte`

#### 2.5 Webhooks

Allow users to register a URL to receive POST requests when a flag changes:

```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  url TEXT NOT NULL,
  secret TEXT,          -- for HMAC signature
  events TEXT[],        -- ['flag.toggle', 'flag.delete', etc.]
  is_active BOOLEAN DEFAULT true
);
```

Fire webhook after every flag mutation. Send HMAC-signed payload. This is a great interview talking point — it shows you understand event-driven architecture.

---

### Phase 3: Unique Features (Your Differentiators)

These are things LaunchDarkly either doesn't have or buries in enterprise plans. These will make interviewers say "oh that's clever."

---

#### 3.1 Flag Health Score

Auto-calculate a "health score" for each flag:

| Signal | Penalty |
|--------|---------|
| Flag is boolean + never had a rule (just a toggle) | -10 |
| Flag has been 100% on for 30+ days | -20 (should be permanent code now) |
| Flag has no description | -5 |
| Flag has never been evaluated by SDK in 7 days | -30 (dead flag) |
| Flag has conflicting rules (earlier rule always matches) | -25 |

Show a health badge on the flags list. Give actionable suggestions: "This flag has been fully rolled out for 45 days — consider removing it from code."

**Why it's unique:** LaunchDarkly has "flag status" (active/launched/inactive) but no proactive health scoring or actionable recommendations.

---

#### 3.2 Evaluation Playground

A UI panel where you can test flag evaluation without writing code:

```
[Flag key dropdown]
[Context builder: add key-value pairs]
→ [Evaluate] button
→ Result: ON / OFF / "variation-name"
→ Reason: "RULE_MATCH: rule-2 (plan IN ['premium', 'enterprise'])"
→ Rule path: shows exactly which rule matched and why
```

**Why it's unique:** LaunchDarkly has a "targeting tester" but it's buried and basic. A full debug-style playground with rule path explanation is extremely useful for developers and would be a standout demo feature.

---

#### 3.3 Flag Dependency Graph (Visual)

If you implement prerequisites (Flag A depends on Flag B), visualize the dependency chain as a graph using a simple force-directed diagram (D3.js or react-flow).

Even without prerequisites, you can show: "These 3 flags are always toggled together — consider grouping them."

**Why it's unique:** LaunchDarkly has prerequisites but zero visual tooling around them.

---

#### 3.4 AI-Powered Flag Description Generator

When a user creates a flag, offer a "Generate description" button. Send the flag key + current targeting rules to Claude/OpenAI API and auto-generate a human-readable description:

> "This flag enables the new checkout flow for premium users in India and the US. Currently 25% of matching users see the new experience."

**Why it's unique:** LaunchDarkly has nothing like this. It's a small feature with a big wow factor in demos. And it shows you know how to integrate AI APIs.

---

#### 3.5 Change Impact Preview

Before toggling a flag, show:
- "This change will affect ~X% of your users"
- "This flag has been evaluated 1,200 times in the last 24h"
- "Last time this flag was toggled: 3 days ago by [user]"

**Why it's unique:** LaunchDarkly shows metrics but there's no "are you sure? here's the impact" confirmation flow that gives you context before acting.

---

#### 3.6 SDK Snippet Generator

On the environment page, show a ready-to-use code snippet for the most common SDKs:

```javascript
// Node.js
const client = new FlipFlagClient('your-sdk-key');
const isEnabled = await client.isEnabled('my-feature', {
  userId: 'user-123',
  plan: 'premium'
});
```

With a language dropdown (Node.js, Python, curl). Auto-fill the SDK key from the current environment.

**Why it's unique:** LaunchDarkly has this but it's basic. Make yours more interactive — live-update the snippet as the user changes the context object.

---

## Summary: What to Build in What Order

```
Week 1: SDK evaluation endpoint + fix flag detail page
Week 2: Targeting rules UI (simple operators: equals, in, contains)
Week 3: Audit log + real dashboard stats
Week 4: Evaluation playground + SDK snippet generator (interview-ready demo features)
Week 5: Multivariate flags + webhooks
Week 6: Flag health score + AI description generator (differentiators)
```

---

## Architecture Decisions for Interview Talking Points

### Why FNV-1a for rollout hashing?

It's fast, non-cryptographic, and produces well-distributed results. The hash of `userId + flagKey` → modulo 100 gives a consistent bucket. Same user always gets the same variation because the inputs don't change. LaunchDarkly uses a similar approach (MurmurHash3).

### Why normalize flag_configs separately from flags?

A flag is a project-level concept. Its state per environment (is_active, rollout %) is an environment-level concern. Keeping them in a separate `flag_configs` table means you can have one flag that's ON in Dev and OFF in Prod — which is the core use case.

### Why not use Redis for the SDK evaluation endpoint?

For an MVP, PostgreSQL is fine. Flag rules change rarely (maybe once a day), not once a millisecond. You can add a simple in-memory cache (Node.js `Map`) with a 30-second TTL to avoid hitting the DB on every SDK call. Redis becomes relevant at 100k+ evaluations/second.

### Why SSE over WebSockets for real-time updates?

SSE is unidirectional (server → client), which is exactly what you need for flag updates. It's simpler than WebSockets, works over HTTP/1.1, and reconnects automatically. LaunchDarkly uses SSE for the same reason.

---

## Tech Stack Alignment

FlipFlag's current stack is perfect for these features:
- **Express 5** — add SDK endpoint + audit log routes
- **PostgreSQL** — add audit_log and webhook tables
- **Better Auth** — user identity already in place for audit log attribution
- **Next.js 15** — add flag detail page + evaluation playground components
- **shadcn/ui** — already installed, use for rule editor cards
- **Tailwind CSS 4** — styling sorted

No new dependencies needed for Phase 1 and 2. Phase 3 features need:
- `react-flow` or `d3` for the dependency graph
- Anthropic/OpenAI SDK for AI description generator
- `crypto` (built-in Node.js) for webhook HMAC signatures
