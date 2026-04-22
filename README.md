# FlipFlag — Feature Flag Management

> A lightweight, self-hostable feature flag service for modern development teams. Ship code safely, control rollouts, and target users — without redeploying.

**Status:** MVP in active development · Full CRUD live · SDK evaluation endpoint live ✅

🔗 **[Live Demo](https://main.d1v523vwrs34r6.amplifyapp.com/)**

---

## What is FlipFlag?

FlipFlag is a feature flag management platform that lets developers decouple **code deployment** from **feature release**. Instead of deploying new code every time you want to enable a feature, you flip a flag.

The core idea is simple:

```
context (who is the user?) + rules (who should see this?) → true / false
```

You define rules like:
```
IF plan IN [premium] → rollout 50% → ENABLED
IF plan IN [free]    → rollout 10% → DISABLED
DEFAULT              → DISABLED
```

Your application calls one API endpoint, passes user context, and gets back evaluated flag values instantly — no redeployment needed.

---

## Key Features

### 🚩 Feature Flags
- Create boolean feature flags per environment
- Global ON/OFF switch (kill switch) for instant rollback
- Default rollout percentage as a fallback when no rules match

### 🎯 User Targeting
- Target users by any attribute — `plan`, `country`, `role`, or any custom field
- Rules evaluated top-to-bottom by priority
- `IN` operator for matching attribute values against a list

### 📊 Percentage Rollouts
- Gradual rollouts with deterministic bucketing
- Same user always gets the same result — no flicker
- Rollout defined per rule, not globally

### 🌍 Multi-Environment Support
- Each project has **Development** and **Production** environments
- Flags managed independently per environment
- Unique SDK key per environment for secure access

### 🔐 Authentication
- Email/password sign-in
- Google OAuth
- Powered by Better Auth

### ⚡ SDK Endpoint
- Single API call returns all evaluated flags for a user
- Pass user context → get back a map of `flagKey: true/false`
- Works server-side and client-side

---

## How It Works

### 1. Create a Project & Generate API Keys
Organize your flags under projects. After creating a project, go to **Settings → Developer** to generate your Development and Production SDK keys.

### 2. Create Feature Flags
Define flags with a key (used in code), a name, and a default rollout percentage.

### 3. Add Targeting Rules
Rules define who sees the feature:
- **Condition** → who qualifies (e.g. `plan IN [premium]`)
- **Rollout %** → what percentage of matching users get selected
- **Serve** → what value to return (`true` or `false`)

### 4. Evaluate via SDK
```http
POST /api/sdk/flags
X-SDK-Key: ff_dev_your_key_here

{
  "userContext": {
    "userId": "user-123",
    "attributes": {
      "plan": "premium",
      "country": "IN"
    }
  }
}
```

```json
{
  "flags": {
    "new-checkout": true,
    "dark-mode": false,
    "ai-assistant": true
  }
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Backend | Node.js, Express 5 |
| Auth | Better Auth (email/password + Google OAuth) |
| Database | PostgreSQL 16 |
| Infrastructure | Docker (local), AWS Amplify (frontend) |

---

---

## Running Locally

**Prerequisites:** Node.js 20+, Docker

```bash
# Clone the repo
git clone https://github.com/Aryan-Elite/FlipFlag.git
cd FlipFlag

# Start PostgreSQL
docker-compose up -d postgres

# Backend
cd src
cp .env.example .env   # fill in your values
npm install
npm run start

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| PostgreSQL | localhost:5433 |

---

<!-- ## MVP Scope

**Included:**
- Boolean feature flags
- Single-condition rules with `IN` operator
- Percentage rollouts with deterministic hashing
- Development + Production environments
- Email/password and Google auth
- SDK evaluation endpoint

**Planned (v2):**
- Multi-condition rules (AND/OR)
- Multi-variant flags (A/B/C)
- Real-time flag updates (SSE)
- Analytics and flag change history
- Segments and user groups -->

---

## Author

Built by [Aryan Gupta](https://github.com/Aryan-Elite) · [LinkedIn](https://www.linkedin.com/in/aryan-gupta-41494323a)
