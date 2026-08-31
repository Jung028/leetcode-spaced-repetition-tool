# Daily Interview Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a daily mock-interview mode that pairs the next-due LeetCode problem with a curated system-design question into one timed session, surfaced as a new "Interview" tab and wired into the Home dashboard.

**Architecture:** New `interview-content/` seed files + `interview/content.ts` aggregator (mirrors `exam-content/`/`exam/content.ts`), a new `interview_sessions`/`interview_sd_seen` schema in `interview/db.ts` (mirrors `exam/db.ts`), a new `interview/api.ts` route set (mirrors `exam/api.ts`), a 4th `DueItem` source wired into `home-api.ts`, and a new `interview/App.tsx` that embeds the existing LeetCode `Detail` component for Part 1 and a new `@excalidraw/excalidraw`-backed canvas for Part 2.

**Tech Stack:** Bun (`bun:sqlite`, `Bun.serve()` HTML imports), React 19, `@excalidraw/excalidraw` (new dependency).

**Spec:** `docs/superpowers/specs/2026-08-30-daily-interview-practice-design.md`

## Global Constraints

- Timer is fixed at 45:00 per part, client-computed from a server-set start timestamp — no server-side ticking, no configurable duration.
- Past zero, the timer counts up as overtime (`+MM:SS`) with a one-time alert; answers are never locked.
- A day with an empty LeetCode due-queue is a design-only session (`leetcode_problem_id: null`), never blocked.
- No spaced-repetition/resurfacing for system design questions — `interview_sd_seen` is a one-time "already assigned" set, not a scheduler.
- `completed_at` / `sd_revealed_at` are plain `YYYY-MM-DD` date strings (this codebase's usual `_at` convention). `coding_started_at` / `design_started_at` are full ISO timestamps — the frontend needs sub-day precision for the countdown, and this is a deliberate exception to the date-string convention.
- The interview due-item's `id` is a fixed constant `900_000_000` (not `courseOffset`-derived) — at most one interview item is ever due at a time, so no collision is possible.
- This plan seeds 3 companies (Meta, Amazon, Atlassian) with 2 questions each (6 total) — enough to exercise every code path. The full ~20-30 company roster is explicit follow-on work, not part of this plan.
- The Excalidraw canvas is only built after a manual spike confirms it bundles cleanly under Bun's HTML-import pipeline (Task 1) — Task 7 (the real canvas) is not started until Task 1's verification passes.
- This repo has no pre-commit/CI hook yet (see `CLAUDE.md`'s "Spec requirement: continuous testing"). That remains a pre-existing, outstanding gap this plan does not newly introduce or fix — run `bun test` manually after every task instead.

---

## Task 1: Excalidraw dependency spike

**Files:**
- Modify: `package.json` (add `@excalidraw/excalidraw` dependency)
- Create (temporary, deleted at the end of this task): `interview-spike.html`, `interview-spike.tsx`
- Modify (temporary, reverted at the end of this task): `index.ts` (one scratch route)

**Interfaces:**
- Produces: confidence that `@excalidraw/excalidraw` bundles under Bun's HTML-import pipeline and that its scene data round-trips through `JSON.stringify`/`JSON.parse`. No code from this task ships — it's a spike per the spec's explicit "spike first" requirement (see spec, "Excalidraw integration — spike first"). The real component is built in Task 7, informed by whatever this task discovers.

This task has no `bun test` step — it's a manual verification spike, exactly as the spec calls for ("a manual verification step... not itself a `bun test` assertion, since it's validating third-party bundling behavior, not application logic").

- [ ] **Step 1: Add the dependency**

```bash
bun add @excalidraw/excalidraw
```

Let Bun resolve and pin the current version in `package.json`/`bun.lock` — don't hand-pin a version number.

- [ ] **Step 2: Create the scratch page**

`interview-spike.html`:

```html
<html>
  <body>
    <div id="root" style="height: 100vh;"></div>
    <script type="module" src="./interview-spike.tsx"></script>
  </body>
</html>
```

`interview-spike.tsx`:

```tsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

function Spike() {
  const [savedScene, setSavedScene] = useState<string | null>(null);
  const [reloadedData, setReloadedData] = useState<any>(null);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 8, display: "flex", gap: 8 }}>
        <button
          onClick={() => {
            if (!savedScene) return;
            setReloadedData(JSON.parse(savedScene));
          }}
        >
          Reload from saved JSON
        </button>
        <span>{savedScene ? `saved ${savedScene.length} chars` : "nothing saved yet"}</span>
      </div>
      <div style={{ flex: 1 }}>
        <Excalidraw
          initialData={reloadedData ?? undefined}
          onChange={(elements, appState) => {
            setSavedScene(JSON.stringify({ elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } }));
          }}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Spike />);
```

- [ ] **Step 3: Wire a temporary route in `index.ts`**

Add this import near the other imports:

```ts
import interviewSpike from "./interview-spike.html";
```

Add this line inside the `routes` object, next to `"/"`:

```ts
    "/interview-spike": interviewSpike,
```

- [ ] **Step 4: Run the dev server and verify manually**

```bash
bun --hot index.ts
```

Open `http://localhost:3000/interview-spike` in a browser and confirm all of the following:
1. The canvas renders with no console errors (check for `process is not defined` or similar Node-global errors — if this appears, add `(globalThis as any).process ??= { env: {} };` at the top of `interview-spike.tsx` and re-check).
2. Draw a rectangle and a line.
3. Click "Reload from saved JSON" — the same shapes must still be there (confirms the scene round-trips through `JSON.stringify`/`JSON.parse` and back into `initialData`).
4. Resize the browser window — the canvas must resize with it (confirms it isn't hardcoded to a fixed pixel size).

If any of these fail, stop and resolve the bundling issue before continuing to Task 7 — this is exactly the isolated failure the spike exists to surface early.

- [ ] **Step 5: Clean up the scratch files**

```bash
rm interview-spike.html interview-spike.tsx
```

Revert the `index.ts` changes from Step 3 (remove the import line and the `"/interview-spike"` route line) so `index.ts` matches its pre-Task-1 state exactly.

- [ ] **Step 6: Commit only the dependency addition**

```bash
git add package.json bun.lock
git commit -m "chore: add @excalidraw/excalidraw (bundling verified via spike)"
```

---

## Task 2: System design content — types, seeds, and aggregator

**Files:**
- Create: `interview-content/types.ts`
- Create: `interview-content/meta.ts`
- Create: `interview-content/amazon.ts`
- Create: `interview-content/atlassian.ts`
- Create: `interview/content.ts`
- Test: `interview/content.test.ts`

**Interfaces:**
- Produces: `SystemDesignQuestionSeed`, `CompanySystemDesignSeed` (`interview-content/types.ts`); `SystemDesignQuestion` (extends `SystemDesignQuestionSeed` with `id: string`, `company: string`), `allSystemDesignQuestions(): SystemDesignQuestion[]` (`interview/content.ts`). These are consumed by Task 3 (`interview/db.ts`), Task 4 (`interview/api.ts`), Task 5 (`home-api.ts`), and Task 7 (`interview/App.tsx`).

- [ ] **Step 1: Write the failing test**

`interview/content.test.ts`:

```ts
import { test, expect } from "bun:test";
import { allSystemDesignQuestions } from "./content";

test("at least 3 companies are seeded", () => {
  const companies = new Set(allSystemDesignQuestions().map((q) => q.company));
  expect(companies.size).toBeGreaterThanOrEqual(3);
});

test("every question has a non-empty prompt, modelAnswer, and rubric", () => {
  for (const q of allSystemDesignQuestions()) {
    expect(q.prompt.length).toBeGreaterThan(0);
    expect(q.modelAnswer.length).toBeGreaterThan(0);
    expect(q.rubric.length).toBeGreaterThan(0);
  }
});

test("every question id is unique", () => {
  const ids = allSystemDesignQuestions().map((q) => q.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test("question ids follow the `${company}:${index}` convention, per company", () => {
  const nextIndex = new Map<string, number>();
  for (const q of allSystemDesignQuestions()) {
    const index = nextIndex.get(q.company) ?? 0;
    expect(q.id).toBe(`${q.company}:${index}`);
    nextIndex.set(q.company, index + 1);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test interview/content.test.ts`
Expected: FAIL — `Cannot find module './content'` (or similar), since none of these files exist yet.

- [ ] **Step 3: Write `interview-content/types.ts`**

```ts
export interface SystemDesignQuestionSeed {
  prompt: string;
  modelAnswer: string;
  rubric: string[];
}

export interface CompanySystemDesignSeed {
  company: string;
  questions: SystemDesignQuestionSeed[];
}
```

- [ ] **Step 4: Write `interview-content/meta.ts`**

```ts
import type { CompanySystemDesignSeed } from "./types";

const RUBRIC = ["Requirements clarification", "High-level architecture", "Data model", "Scaling & bottlenecks", "Trade-offs"];

export const META: CompanySystemDesignSeed = {
  company: "Meta",
  questions: [
    {
      prompt:
        "Design a URL shortening service (like bit.ly) that Meta could run internally for sharing links across its apps. Reads (redirects) vastly outnumber writes (link creation), and a single link can suddenly go viral. Cover the API, the short-code generation strategy, storage, and how you'd keep redirects fast under a traffic spike.",
      modelAnswer:
        "Clarify scale first: assume on the order of a few hundred million new links a month and redirect traffic two to three orders of magnitude higher than that, with p99 redirect latency in the tens of milliseconds. The write path is a single POST /links endpoint that takes a long URL and returns a short code; the read path is GET /{code}, which looks up the long URL and issues an HTTP 301/302 redirect.\n\nFor code generation, avoid a naive incrementing counter shared across writers (contention, and it leaks creation order). Instead, hand out non-overlapping counter ranges to each write-serving host from a lightweight coordination service (or use a Snowflake-style ID: timestamp + shard ID + sequence), then base62-encode the resulting integer into a 6-8 character code. This keeps writes fully parallel with no cross-host locking, at the cost of a small amount of wasted range if a host restarts mid-range — an acceptable trade for a keyspace this large.\n\nData model: a single table keyed by short_code, storing long_url, created_at, and optionally an expiry. This is a pure key-value access pattern, so back it with a key-value store (or a sharded relational table keyed by short_code) rather than anything that needs joins. Because reads dominate by orders of magnitude, put a CDN/edge cache or a large in-memory cache (e.g. Redis) in front of the datastore, keyed by short_code, with a long TTL — a short code's mapping never changes once created, so cache invalidation is a non-issue; the only invalidation event is explicit link deletion.\n\nScaling and the viral-link case: with the cache layer above, even a single link taking 100k+ requests/second is just a hot cache key, which in-memory caches handle far better than hitting the backing store repeatedly. Shard the backing store by short_code hash so no single shard is a bottleneck for the write path or for cache-miss traffic. The main trade-off is cache staleness vs. simplicity — since mappings are immutable, this is the rare case where an aggressive cache has no real downside.",
      rubric: RUBRIC,
    },
    {
      prompt:
        "Design the backend for a social news feed (like Facebook's) that ranks and delivers posts from a user's friends/follows in near real time. Cover the write path (fan-out on write vs. fan-out on read), the ranking step, and how the feed stays fresh without being recomputed from scratch on every page load.",
      modelAnswer:
        "Start by separating two problems that are often conflated: distribution (getting a new post in front of the right followers) and ranking (deciding what order to show them in). For distribution, the standard trade-off is fan-out-on-write (push a new post into every follower's precomputed feed at publish time) vs. fan-out-on-read (merge each followee's recent posts at request time). Fan-out-on-write is cheap to read but expensive to write for accounts with huge follower counts (a celebrity post fanning out to millions of feed lists); fan-out-on-read is the reverse. The standard hybrid: fan out on write for ordinary users, but for accounts above a follower threshold, skip the fan-out and merge their posts in at read time for the (relatively few) users who follow them.\n\nEach user's precomputed feed is a bounded-length list (e.g. the most recent few hundred candidate post IDs, not full post bodies) stored in a fast key-value store, since post content itself is fetched separately and can change (edits, deletion) after the feed entry was written. A separate post-storage service holds the actual content, sharded by post ID.\n\nRanking is a separate service that takes the candidate post IDs for a feed request (merging the precomputed list with any real-time fan-out-on-read posts) and scores them using signals like recency, the viewer's historical engagement with the poster, and content type — this can start as a straightforward weighted-feature score and later be replaced with a learned model without changing the surrounding architecture, since ranking is cleanly isolated behind a \"given these candidate IDs and this viewer, return a ranked order\" interface.\n\nFreshness without full recomputation: the client requests a bounded page of ranked posts and remembers a cursor (e.g. the last-seen post's rank score or timestamp); the next page request only needs to rank posts on either side of that cursor, not the whole history. New posts arriving after the user started scrolling are queued into a small \"new posts\" banner rather than reshuffling posts already on screen, which is both a UX improvement and an implementation simplification. The key trade-off throughout is push (fast reads, background cost, some staleness for busy accounts) vs. pull (always fresh, but a heavier request-time computation) — the hybrid exists because no single choice is right at both ends of the follower-count distribution.",
      rubric: RUBRIC,
    },
  ],
};
```

- [ ] **Step 5: Write `interview-content/amazon.ts`**

```ts
import type { CompanySystemDesignSeed } from "./types";

const RUBRIC = ["Requirements clarification", "High-level architecture", "Data model", "Scaling & bottlenecks", "Trade-offs"];

export const AMAZON: CompanySystemDesignSeed = {
  company: "Amazon",
  questions: [
    {
      prompt:
        "Design a distributed rate limiter that Amazon's API gateway could use to throttle requests per customer/API-key across a fleet of gateway servers. It must be accurate under highly concurrent requests, add minimal latency, and must not become a single point of failure for the whole gateway.",
      modelAnswer:
        "Clarify the limit shape first: is it a fixed quota per fixed window (e.g. 1000 requests/minute), or a smoother rate (e.g. a token bucket allowing bursts up to a cap)? Sliding-window/token-bucket algorithms are usually preferred over fixed windows because a fixed window lets a client burst 2x its limit right across a window boundary (all its quota at the end of one window, then all its quota again at the start of the next).\n\nArchitecture: gateway servers are stateless and horizontally scaled, so the rate-limit counters can't live in any single gateway instance's memory — they need a shared, low-latency store. Use a centralized in-memory store (e.g. Redis) holding one counter (or token-bucket state) per API key, updated via an atomic increment-and-check operation (Redis's INCR plus TTL, or a Lua script for the token-bucket variant) so concurrent requests from the same key across different gateway hosts don't race past each other.\n\nData model is intentionally tiny: a key like `ratelimit:{apiKey}:{windowStart}` mapping to a count, with a TTL equal to the window length so old windows self-expire without a cleanup job. For the token-bucket variant, store `{tokens, lastRefillTimestamp}` per key and compute the refill amount lazily on each check rather than running a background refill process per key.\n\nScaling and single-point-of-failure concerns: a single Redis instance is both a latency risk (every request now round-trips to it) and an availability risk. Shard the store by API key hash across multiple Redis nodes so no one node is a hotspot, and run each shard as a small replicated cluster so a node failure doesn't wipe out rate-limit state for the keys it owned. For availability, the key trade-off is fail-open vs. fail-closed when the rate-limit store is unreachable: fail-open (let requests through) protects availability at the cost of temporarily losing throttling, which is usually the right default for a gateway, since an outage in the rate limiter should not take down the whole API — losing precision briefly is far cheaper than an outage.",
      rubric: RUBRIC,
    },
    {
      prompt:
        "Design the backend that manages product inventory and order placement for an e-commerce checkout flow at Amazon's scale. Cover how you prevent overselling when many customers try to buy the last few units of a popular item at the same time, and how an order flows through payment, inventory reservation, and fulfillment.",
      modelAnswer:
        "The central risk this design has to solve is overselling: two customers both see \"1 left in stock\" and both complete checkout. Naive read-then-write inventory checks (read the count, check it's > 0, decrement) race under concurrency. The fix is to make the decrement itself the check: an atomic conditional update like `UPDATE inventory SET quantity = quantity - 1 WHERE product_id = ? AND quantity > 0`, checking the affected-row count to know whether the reservation actually succeeded. This pushes the correctness guarantee into the database's atomicity rather than the application's read-then-write logic.\n\nOrder flow: checkout is a multi-step process — reserve inventory, charge payment, confirm the order, hand off to fulfillment — and these steps can each fail independently (payment declines after inventory is reserved, fulfillment is temporarily unavailable, etc.), so model it as an explicit state machine per order (e.g. `pending_payment -> paid -> reserved -> fulfilling -> shipped`, with a `cancelled`/`failed` branch from any state) rather than a single synchronous transaction spanning services that don't share a database. If payment fails after inventory was reserved, a compensating action releases the reservation (increment the quantity back) rather than trying to roll back a distributed transaction.\n\nData model: an `inventory` table keyed by (product_id, warehouse/fulfillment-center) since large catalogs are stocked across many locations, not one global count; an `orders` table holding the order's current state and a foreign key to its line items; and a `reservations` table linking an order to the specific inventory rows it holds, with a short expiry (e.g. 15 minutes) so an abandoned checkout releases its hold automatically via a background sweep rather than tying up stock indefinitely.\n\nScaling: shard inventory by product ID so hot products (flash-sale items) don't bottleneck the whole inventory service, and consider a short-lived per-product semaphore or queue in front of extremely hot items so thousands of simultaneous requests for the same nearly-sold-out product don't all hammer the same database row at once — trading a small amount of added latency for those specific items for much lower contention. The overall trade-off is strict consistency on the inventory count (never oversell, occasionally reject a checkout that a slightly-stale read would have allowed) over eventual consistency, which is the right choice here because the cost of overselling (a broken promise to a paying customer) is much higher than the cost of an occasional false \"out of stock.\"",
      rubric: RUBRIC,
    },
  ],
};
```

- [ ] **Step 6: Write `interview-content/atlassian.ts`**

```ts
import type { CompanySystemDesignSeed } from "./types";

const RUBRIC = ["Requirements clarification", "High-level architecture", "Data model", "Scaling & bottlenecks", "Trade-offs"];

export const ATLASSIAN: CompanySystemDesignSeed = {
  company: "Atlassian",
  questions: [
    {
      prompt:
        "Design the backend for a real-time collaborative document editor (like Confluence's live editing), where multiple users can type in the same document at once and see each other's changes within milliseconds, without overwriting each other's work.",
      modelAnswer:
        "The core problem is merging concurrent edits without last-write-wins clobbering someone's changes. The standard approaches are Operational Transformation (OT) — transforming each incoming operation against every operation it \"missed\" so it still applies correctly to the current document state — or a CRDT (Conflict-free Replicated Data Type) for text, which structures the document so concurrent operations commute and merge deterministically without needing a central transform step. OT is battle-tested (Google Docs) but the transform logic is notoriously easy to get subtly wrong; CRDTs are simpler to reason about per-operation but historically carried higher memory overhead per character, though modern CRDT implementations have mostly closed that gap. Either is a defensible choice; the important part is naming the trade-off rather than hand-waving \"just merge the changes.\"\n\nArchitecture: each open document has a single authoritative session, hosted by one server process (or a per-document actor) that all connected clients' edits flow through over a persistent connection (WebSocket). That server holds the current in-memory document state plus the operation log needed for OT/CRDT reconciliation, broadcasts each accepted operation to every other connected client, and periodically flushes a snapshot plus the operation log to durable storage. Routing all of a document's traffic to one owning process avoids needing distributed consensus on every keystroke, at the cost of needing a way to reassign ownership if that process dies (a lease held in a coordination store, re-acquired by another process on failure).\n\nData model: durable storage holds periodic full-document snapshots (so reload doesn't require replaying the entire edit history since document creation) plus an append-only operation log since the last snapshot, tagged with a monotonically increasing sequence number the OT/CRDT algorithm uses to order and transform operations. Presence data (who's currently in the document, their cursor position) is ephemeral and lives only in the owning process's memory plus a lightweight broadcast to connected clients — it doesn't need durability.\n\nScaling: because each document's edit traffic is owned by one process, horizontal scale comes from spreading documents across many such processes (sharded by document ID) rather than scaling a single document's throughput, which is inherently bounded by how fast one process can sequence operations — an acceptable trade-off since even a very actively co-edited document sees nowhere near the write volume of, say, a global inventory counter.",
      rubric: RUBRIC,
    },
    {
      prompt:
        "Design the backend for an issue-tracking system (like Jira) that supports millions of projects, each with potentially thousands of issues, flexible custom fields per project, and fast full-text plus filtered search across a user's accessible projects.",
      modelAnswer:
        "Two requirements pull the data model in different directions: flexible per-project custom fields (schema that varies per tenant) and fast filtered search (which favors a fixed, indexable schema). Resolve this by splitting storage: a relational store holds the fixed core fields every issue has regardless of project (id, project_id, title, status, assignee, created_at, updated_at) as real indexed columns, while custom fields are stored as a separate key-value structure (an EAV-style table, or a JSON/JSONB column) keyed by issue ID and field ID, since custom fields vary per project and a fully dynamic ALTER TABLE-per-project approach doesn't scale operationally.\n\nSearch is a separate concern from the system of record: issues are written to the relational store first (the source of truth for correctness — an issue's existence and core state must never depend on a search index being up to date), then asynchronously indexed into a dedicated search engine (e.g. an inverted-index/full-text search system) that combines the core fields, custom field values, and issue description/comment text into one searchable document per issue, tagged with the project ID and the set of permission groups allowed to see it. Filtered search queries (\"status = open AND assignee = me AND project in my-accessible-projects\") run against this search index rather than the relational store, since it's purpose-built for combining full-text matching with structured filtering at low latency.\n\nData model, concretely: `issues` (core fixed columns, one row per issue, partitioned/sharded by project_id since a project's issues are almost always queried together), `custom_field_values` (issue_id, field_id, value), and a `comments` table keyed by issue_id. The search index is a derived, rebuildable copy — if it's lost or falls behind, it can be fully reconstructed by re-reading the relational store, which is the standard justification for treating an async index as eventually consistent rather than trying to keep it transactionally in sync.\n\nScaling: shard the relational store by project_id, since almost every real query (\"show me this project's board\") is scoped to one project, making cross-shard queries rare. The main trade-off is search freshness — a newly created issue might take a few hundred milliseconds to a few seconds to become searchable, since indexing is asynchronous — which is an acceptable lag for a project-management tool where search freshness is not safety-critical, unlike the issue's actual state in the system of record.",
      rubric: RUBRIC,
    },
  ],
};
```

- [ ] **Step 7: Write `interview/content.ts`**

```ts
import type { SystemDesignQuestionSeed, CompanySystemDesignSeed } from "../interview-content/types";
import { META } from "../interview-content/meta";
import { AMAZON } from "../interview-content/amazon";
import { ATLASSIAN } from "../interview-content/atlassian";

export interface SystemDesignQuestion extends SystemDesignQuestionSeed {
  id: string;
  company: string;
}

const ALL_COMPANIES: CompanySystemDesignSeed[] = [META, AMAZON, ATLASSIAN];

export function allSystemDesignQuestions(): SystemDesignQuestion[] {
  return ALL_COMPANIES.flatMap((company) =>
    company.questions.map((q, index) => ({
      ...q,
      id: `${company.company}:${index}`,
      company: company.company,
    })),
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `bun test interview/content.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 9: Commit**

```bash
git add interview-content/types.ts interview-content/meta.ts interview-content/amazon.ts interview-content/atlassian.ts interview/content.ts interview/content.test.ts
git commit -m "feat: seed curated system design questions for Meta, Amazon, Atlassian"
```

---

## Task 3: `interview/db.ts` — schema and session mechanics

**Files:**
- Create: `interview/db.ts`
- Test: `interview/db.test.ts`

**Interfaces:**
- Consumes: `allSystemDesignQuestions()` (`interview/content.ts`, Task 2); `listProblems(db)`, `getProblem(db, id)` (`leetcode/db.ts`, returns `ProblemSummary[]` / `ProblemDetail | null`); `isDue(nextReview, today)` (`shared/scheduling.ts`).
- Produces: `migrateInterview(db)`, `InterviewSessionRow` (fields: `date`, `leetcode_problem_id: number | null`, `sd_question_id: string`, `coding_started_at: string | null`, `design_started_at: string | null`, `sd_answer: string`, `sd_excalidraw_scene: string | null`, `sd_rubric_checked: string`, `sd_revealed_at: string | null`, `completed_at: string | null`), `getTodaySession(db, today): InterviewSessionRow | null`, `getOrCreateTodaySession(db, today): InterviewSessionRow`, `startCodingTimer(db, today): InterviewSessionRow`, `startDesignTimer(db, today): InterviewSessionRow`, `saveDesignAnswer(db, today, answer, scene): InterviewSessionRow`, `revealModelAnswer(db, today): InterviewSessionRow`, `saveRubricChecked(db, today, checked: boolean[]): InterviewSessionRow`. Consumed by Task 4 (`interview/api.ts`) and Task 5 (`home-api.ts`).

- [ ] **Step 1: Write the failing test**

`interview/db.test.ts`:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "../leetcode/db";
import { addDays, localToday } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";
import {
  migrateInterview,
  getOrCreateTodaySession,
  getTodaySession,
  startCodingTimer,
  startDesignTimer,
  saveDesignAnswer,
  revealModelAnswer,
  saveRubricChecked,
} from "./db";

const TODAY = localToday();
let db: Database;

beforeEach(() => {
  db = openDb(":memory:");
  migrateInterview(db);
});

test("getOrCreateTodaySession creates exactly one row per day and never re-rolls", () => {
  const first = getOrCreateTodaySession(db, TODAY);
  const second = getOrCreateTodaySession(db, TODAY);
  expect(second.sd_question_id).toBe(first.sd_question_id);
  const count = db.query(`SELECT COUNT(*) AS n FROM interview_sessions`).get() as { n: number };
  expect(count.n).toBe(1);
});

test("picks the next-due LeetCode problem when one is due", () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  const session = getOrCreateTodaySession(db, TODAY);
  expect(session.leetcode_problem_id).toBe(problem.id);
});

test("leetcode_problem_id is null when no problem is due", () => {
  const session = getOrCreateTodaySession(db, TODAY);
  expect(session.leetcode_problem_id).toBeNull();
});

test("picks a system design question not already in interview_sd_seen", () => {
  const today = getOrCreateTodaySession(db, TODAY);
  const tomorrow = getOrCreateTodaySession(db, addDays(TODAY, 1));
  expect(tomorrow.sd_question_id).not.toBe(today.sd_question_id);
});

test("marks completed_at once both parts are satisfied, and not before", () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  getOrCreateTodaySession(db, TODAY);
  expect(getTodaySession(db, TODAY)!.completed_at).toBeNull();

  saveDesignAnswer(db, TODAY, "my approach", null);
  expect(getTodaySession(db, TODAY)!.completed_at).toBeNull();

  revealModelAnswer(db, TODAY);
  expect(getTodaySession(db, TODAY)!.completed_at).toBeNull();

  reviewProblem(db, problem.id, "pass", TODAY);
  expect(getTodaySession(db, TODAY)!.completed_at).toBe(TODAY);
});

test("startCodingTimer/startDesignTimer set their started_at columns once, without overwriting on a second call", () => {
  const afterFirst = startCodingTimer(db, TODAY);
  expect(afterFirst.coding_started_at).not.toBeNull();
  const firstTimestamp = afterFirst.coding_started_at;
  const afterSecond = startCodingTimer(db, TODAY);
  expect(afterSecond.coding_started_at).toBe(firstTimestamp);

  const afterDesign = startDesignTimer(db, TODAY);
  expect(afterDesign.design_started_at).not.toBeNull();
});

test("saveRubricChecked persists the checked array as JSON", () => {
  const rubricLength = allSystemDesignQuestions()[0]!.rubric.length;
  const checked = new Array(rubricLength).fill(false).map((_, i) => i === 0);
  const updated = saveRubricChecked(db, TODAY, checked);
  expect(JSON.parse(updated.sd_rubric_checked)).toEqual(checked);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test interview/db.test.ts`
Expected: FAIL — `Cannot find module './db'`

- [ ] **Step 3: Write `interview/db.ts`**

```ts
import type { Database } from "bun:sqlite";
import { getProblem, listProblems } from "../leetcode/db";
import { isDue } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";

export interface InterviewSessionRow {
  date: string;
  leetcode_problem_id: number | null;
  sd_question_id: string;
  coding_started_at: string | null;
  design_started_at: string | null;
  sd_answer: string;
  sd_excalidraw_scene: string | null;
  sd_rubric_checked: string;
  sd_revealed_at: string | null;
  completed_at: string | null;
}

export function migrateInterview(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      date TEXT PRIMARY KEY,
      leetcode_problem_id INTEGER,
      sd_question_id TEXT NOT NULL,
      coding_started_at TEXT,
      design_started_at TEXT,
      sd_answer TEXT NOT NULL DEFAULT '',
      sd_excalidraw_scene TEXT,
      sd_rubric_checked TEXT NOT NULL DEFAULT '[]',
      sd_revealed_at TEXT,
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS interview_sd_seen (
      question_id TEXT PRIMARY KEY
    );
  `);
}

function isCodingPartDone(db: Database, row: InterviewSessionRow, today: string): boolean {
  if (row.leetcode_problem_id === null) return true;
  const problem = getProblem(db, row.leetcode_problem_id);
  return problem !== null && problem.next_review > today;
}

function isDesignPartDone(row: InterviewSessionRow): boolean {
  return row.sd_answer.trim().length > 0 && row.sd_revealed_at !== null;
}

function recomputeCompletion(db: Database, row: InterviewSessionRow, today: string): InterviewSessionRow {
  if (row.completed_at) return row;
  if (isCodingPartDone(db, row, today) && isDesignPartDone(row)) {
    db.query(`UPDATE interview_sessions SET completed_at = ? WHERE date = ?`).run(today, row.date);
    return { ...row, completed_at: today };
  }
  return row;
}

export function getTodaySession(db: Database, today: string): InterviewSessionRow | null {
  const row = db.query(`SELECT * FROM interview_sessions WHERE date = ?`).get(today) as InterviewSessionRow | null;
  if (!row) return null;
  return recomputeCompletion(db, row, today);
}

export function getOrCreateTodaySession(db: Database, today: string): InterviewSessionRow {
  const existing = getTodaySession(db, today);
  if (existing) return existing;

  const nextProblem = listProblems(db).find((p) => isDue(p.next_review, today));
  const seenRows = db.query(`SELECT question_id FROM interview_sd_seen`).all() as { question_id: string }[];
  const seen = new Set(seenRows.map((r) => r.question_id));
  const allQuestions = allSystemDesignQuestions();
  if (allQuestions.length === 0) throw new Error("no system design questions are seeded");
  // Once every seeded question has been assigned at least once, reuse the
  // first one rather than throwing — with only a handful of seed companies
  // this repeats sooner than it will once the full ~20-30 company roster
  // (see spec, "Scope for the implementation plan") is authored.
  const question = allQuestions.find((q) => !seen.has(q.id)) ?? allQuestions[0]!;

  db.query(`INSERT INTO interview_sessions (date, leetcode_problem_id, sd_question_id) VALUES (?, ?, ?)`).run(
    today,
    nextProblem?.id ?? null,
    question.id,
  );
  db.query(`INSERT OR IGNORE INTO interview_sd_seen (question_id) VALUES (?)`).run(question.id);

  return getTodaySession(db, today)!;
}

export function startCodingTimer(db: Database, today: string): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET coding_started_at = ? WHERE date = ? AND coding_started_at IS NULL`).run(
    new Date().toISOString(),
    today,
  );
  return getTodaySession(db, today)!;
}

export function startDesignTimer(db: Database, today: string): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET design_started_at = ? WHERE date = ? AND design_started_at IS NULL`).run(
    new Date().toISOString(),
    today,
  );
  return getTodaySession(db, today)!;
}

export function saveDesignAnswer(db: Database, today: string, answer: string, scene: string | null): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET sd_answer = ?, sd_excalidraw_scene = ? WHERE date = ?`).run(answer, scene, today);
  return getTodaySession(db, today)!;
}

export function revealModelAnswer(db: Database, today: string): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET sd_revealed_at = ? WHERE date = ? AND sd_revealed_at IS NULL`).run(today, today);
  return getTodaySession(db, today)!;
}

export function saveRubricChecked(db: Database, today: string, checked: boolean[]): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET sd_rubric_checked = ? WHERE date = ?`).run(JSON.stringify(checked), today);
  return getTodaySession(db, today)!;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test interview/db.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add interview/db.ts interview/db.test.ts
git commit -m "feat: add interview_sessions schema and daily session mechanics"
```

---

## Task 4: `interview/api.ts` — HTTP routes

**Files:**
- Create: `interview/api.ts`
- Test: `interview/api.test.ts`
- Modify: `index.ts`

**Interfaces:**
- Consumes: everything produced in Task 3 (`interview/db.ts`) and `allSystemDesignQuestions()` (Task 2).
- Produces: `interviewApiRoutes(db): Record<string, ...>`, `InterviewSessionView` (fields: `date`, `codingStartedAt`, `designStartedAt`, `completedAt`, `leetcodeProblemId`, `sdQuestion: { id, company, prompt, modelAnswer, rubric }`, `sdAnswer`, `sdExcalidrawScene`, `sdRubricChecked: boolean[]`, `sdRevealedAt`). Consumed by Task 7 (`interview/App.tsx`, as the client-side response shape).

- [ ] **Step 1: Write the failing test**

`interview/api.test.ts`:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem } from "../leetcode/db";
import { migrateInterview } from "./db";
import { interviewApiRoutes } from "./api";
import { allSystemDesignQuestions } from "./content";
import { addDays, localToday } from "../shared/scheduling";

const TODAY = localToday();
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateInterview(db);
  server = Bun.serve({ port: 0, routes: interviewApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/interview/today creates and returns today's session", async () => {
  const view: any = await (await fetch(`${base}/api/interview/today`)).json();
  expect(view.date).toBe(TODAY);
  expect(view.sdQuestion.id).toBe(allSystemDesignQuestions()[0]!.id);
  expect(view.leetcodeProblemId).toBeNull();
  expect(view.completedAt).toBeNull();
});

test("GET /api/interview/today includes the due LeetCode problem", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  const view: any = await (await fetch(`${base}/api/interview/today`)).json();
  expect(view.leetcodeProblemId).toBe(problem.id);
});

test("POST /api/interview/today/start-coding sets codingStartedAt once", async () => {
  const first: any = await (await fetch(`${base}/api/interview/today/start-coding`, { method: "POST" })).json();
  expect(first.codingStartedAt).not.toBeNull();
  const second: any = await (await fetch(`${base}/api/interview/today/start-coding`, { method: "POST" })).json();
  expect(second.codingStartedAt).toBe(first.codingStartedAt);
});

test("POST /api/interview/today/start-design sets designStartedAt once", async () => {
  const first: any = await (await fetch(`${base}/api/interview/today/start-design`, { method: "POST" })).json();
  expect(first.designStartedAt).not.toBeNull();
});

test("POST /api/interview/today/design-answer saves the answer and scene", async () => {
  const updated: any = await (
    await fetch(`${base}/api/interview/today/design-answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answer: "my approach", scene: JSON.stringify({ elements: [] }) }),
    })
  ).json();
  expect(updated.sdAnswer).toBe("my approach");
  expect(updated.sdExcalidrawScene).toBe(JSON.stringify({ elements: [] }));
});

test("POST /api/interview/today/reveal sets sdRevealedAt", async () => {
  const updated: any = await (await fetch(`${base}/api/interview/today/reveal`, { method: "POST" })).json();
  expect(updated.sdRevealedAt).not.toBeNull();
});

test("POST /api/interview/today/rubric saves the checked array and rejects a non-boolean-array body", async () => {
  const rubricLength = allSystemDesignQuestions()[0]!.rubric.length;
  const checked = new Array(rubricLength).fill(false).map((_, i) => i === 0);
  const updated: any = await (
    await fetch(`${base}/api/interview/today/rubric`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checked }),
    })
  ).json();
  expect(updated.sdRubricChecked).toEqual(checked);

  const badRes = await fetch(`${base}/api/interview/today/rubric`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ checked: "nope" }),
  });
  expect(badRes.status).toBe(400);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test interview/api.test.ts`
Expected: FAIL — `Cannot find module './api'`

- [ ] **Step 3: Write `interview/api.ts`**

```ts
import type { Database } from "bun:sqlite";
import { localToday } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";
import {
  getOrCreateTodaySession,
  startCodingTimer,
  startDesignTimer,
  saveDesignAnswer,
  revealModelAnswer,
  saveRubricChecked,
  type InterviewSessionRow,
} from "./db";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export interface InterviewSessionView {
  date: string;
  codingStartedAt: string | null;
  designStartedAt: string | null;
  completedAt: string | null;
  leetcodeProblemId: number | null;
  sdQuestion: { id: string; company: string; prompt: string; modelAnswer: string; rubric: string[] };
  sdAnswer: string;
  sdExcalidrawScene: string | null;
  sdRubricChecked: boolean[];
  sdRevealedAt: string | null;
}

function sessionView(row: InterviewSessionRow): InterviewSessionView {
  const question = allSystemDesignQuestions().find((q) => q.id === row.sd_question_id)!;
  return {
    date: row.date,
    codingStartedAt: row.coding_started_at,
    designStartedAt: row.design_started_at,
    completedAt: row.completed_at,
    leetcodeProblemId: row.leetcode_problem_id,
    sdQuestion: {
      id: question.id,
      company: question.company,
      prompt: question.prompt,
      modelAnswer: question.modelAnswer,
      rubric: question.rubric,
    },
    sdAnswer: row.sd_answer,
    sdExcalidrawScene: row.sd_excalidraw_scene,
    sdRubricChecked: JSON.parse(row.sd_rubric_checked) as boolean[],
    sdRevealedAt: row.sd_revealed_at,
  };
}

export function interviewApiRoutes(db: Database) {
  return {
    "/api/interview/today": {
      GET: () => json(sessionView(getOrCreateTodaySession(db, localToday()))),
    },
    "/api/interview/today/start-coding": {
      POST: () => json(sessionView(startCodingTimer(db, localToday()))),
    },
    "/api/interview/today/start-design": {
      POST: () => json(sessionView(startDesignTimer(db, localToday()))),
    },
    "/api/interview/today/design-answer": {
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { answer?: unknown; scene?: unknown } | null;
        const answer = typeof body?.answer === "string" ? body.answer : "";
        const scene = typeof body?.scene === "string" ? body.scene : null;
        return json(sessionView(saveDesignAnswer(db, localToday(), answer, scene)));
      },
    },
    "/api/interview/today/reveal": {
      POST: () => json(sessionView(revealModelAnswer(db, localToday()))),
    },
    "/api/interview/today/rubric": {
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { checked?: unknown } | null;
        if (!Array.isArray(body?.checked) || !body.checked.every((v) => typeof v === "boolean")) {
          return json({ error: "checked must be an array of booleans" }, 400);
        }
        return json(sessionView(saveRubricChecked(db, localToday(), body.checked as boolean[])));
      },
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test interview/api.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Wire into `index.ts`**

Add these imports near the other route/migration imports:

```ts
import { migrateInterview } from "./interview/db";
import { interviewApiRoutes } from "./interview/api";
```

Add this line next to the other `migrate*` calls:

```ts
migrateInterview(db);
```

Add this line inside `routes`, next to the other `...xApiRoutes(db)` spreads:

```ts
    ...interviewApiRoutes(db),
```

- [ ] **Step 6: Run the full suite**

Run: `bun test`
Expected: PASS (all existing tests plus the new ones)

- [ ] **Step 7: Commit**

```bash
git add interview/api.ts interview/api.test.ts index.ts
git commit -m "feat: add /api/interview routes and wire into the server"
```

---

## Task 5: Home dashboard integration

**Files:**
- Modify: `home-api.ts`
- Modify: `home-api.test.ts`

**Interfaces:**
- Consumes: `getOrCreateTodaySession` (`interview/db.ts`, Task 3), `allSystemDesignQuestions` (`interview/content.ts`, Task 2), `getProblem` (`leetcode/db.ts`).
- Produces: `DueSource` widened to include `"interview"`; `interviewDue(db, today): DueItem[]` wired into `/api/home/due` and `homeStats`.

- [ ] **Step 1: Write the failing tests**

In `home-api.test.ts`, add these imports (extend the existing import lines, don't duplicate):

```ts
import { migrateInterview, getOrCreateTodaySession, saveDesignAnswer, revealModelAnswer } from "./interview/db";
```

Add this constant next to `LEETCODE150_DAILY_DUE`:

```ts
// A freshly migrated db always has exactly one incomplete daily interview
// session due today (getOrCreateTodaySession creates one on first read, and
// none of the existing tests below complete both of its parts unless they
// say so explicitly).
const INTERVIEW_DAILY_DUE = 1;
```

Add `migrateInterview(db);` to `beforeEach`, alongside the other `migrate*` calls.

Add these two new tests (anywhere alongside the other `/api/home/due` tests):

```ts
test("GET /api/home/due includes today's interview session when incomplete", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "interview")).toBe(true);
});

test("GET /api/home/due excludes the interview session once both parts are completed", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  getOrCreateTodaySession(db, TODAY);
  saveDesignAnswer(db, TODAY, "my approach", null);
  revealModelAnswer(db, TODAY);
  reviewProblem(db, problem.id, "pass", TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "interview")).toBe(false);
});
```

Update the three existing hardcoded `dueToday` assertions to add `+ INTERVIEW_DAILY_DUE`:

```ts
// In "GET /api/home/stats starts with one exam item per course...":
    dueToday: EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE + INTERVIEW_DAILY_DUE,

// In "GET /api/home/stats counts due todos":
    dueToday: 5 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE + INTERVIEW_DAILY_DUE,

// In "GET /api/home/stats counts dueToday and overdue across all three sources":
  expect(stats.dueToday).toBe(6 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE + INTERVIEW_DAILY_DUE);
```

Leave every `overdue` and `completedToday` assertion in the file untouched — the interview item's `overdueDays` is always 0 by design, and it is not wired into `completedToday`/`completed-today`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test home-api.test.ts`
Expected: FAIL — the two new tests fail with "interview" not found in `DueSource`/`items`, and the three updated numeric assertions fail because `interviewDue` doesn't exist yet to contribute the `+1`.

- [ ] **Step 3: Update `home-api.ts`**

Change the import from `./leetcode/db` to include `getProblem`:

```ts
import { listProblems, countReviewsToday, listCompletedToday, levelDueLeetcode, getProblem } from "./leetcode/db";
```

Add these two new imports:

```ts
import { getOrCreateTodaySession } from "./interview/db";
import { allSystemDesignQuestions } from "./interview/content";
```

Widen `DueSource`:

```ts
export type DueSource = "leetcode" | "todo" | "exam" | "interview";
```

Add `interviewDue` (place it after `examDue`):

```ts
function interviewDue(db: Database, today: string): DueItem[] {
  const session = getOrCreateTodaySession(db, today);
  if (session.completed_at) return [];
  const question = allSystemDesignQuestions().find((q) => q.id === session.sd_question_id)!;
  const problem = session.leetcode_problem_id ? getProblem(db, session.leetcode_problem_id) : null;
  const questionSummary = `${question.company}: ${question.prompt.slice(0, 40)}...`;
  return [
    {
      source: "interview" as const,
      // Fixed constant, not courseOffset (that helper is keyed to COURSES,
      // which "interview" isn't part of) — safe because at most one
      // interview item is ever due at a time, so no collision is possible.
      id: 900_000_000,
      title: problem ? `${problem.title} + ${questionSummary}` : questionSummary,
      subtitle: "Daily interview practice",
      dueDate: today,
      overdueDays: 0,
      linkId: 0,
    },
  ];
}
```

In `homeStats`, add `...interviewDue(db, today)` to the `items` array:

```ts
  const items = [
    ...leetcodeDue(db, today),
    ...leetcode150Due(db, today, leetcode150),
    ...todoDue(db, today),
    ...examDue(db, today),
    ...interviewDue(db, today),
  ];
```

In `homeApiRoutes`'s `/api/home/due` handler, add the same line to its `items` array:

```ts
        const items = [
          ...leetcodeDue(db, today),
          ...leetcode150Due(db, today),
          ...todoDue(db, today),
          ...examDue(db, today),
          ...interviewDue(db, today),
        ];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test home-api.test.ts`
Expected: PASS (all tests, including the 2 new ones)

- [ ] **Step 5: Run the full suite**

Run: `bun test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add home-api.ts home-api.test.ts
git commit -m "feat: surface the daily interview session on the Home dashboard"
```

---

## Task 6: Tab wiring — export `Detail`, add the Interview tab shell

**Files:**
- Modify: `frontend.tsx`
- Modify: `HomeApp.tsx`
- Modify: `index.css`

**Interfaces:**
- Produces: `export function Detail(...)` from `frontend.tsx` (consumed by Task 7's `interview/App.tsx`); `Tab` widened to include `"interview"`; `--cat-src-interview` CSS variable. This task wires the tab shell with a placeholder in the new tab's slot — `interview/App.tsx` itself is built in Task 7, which replaces the placeholder with the real import as its final step, so this task's own build stays clean with zero errors.

This task is UI wiring with no new backend logic, so its verification step is a type-check plus a visual smoke check rather than a new `bun test` file — consistent with this repo's existing pattern for UI-only changes (see `2026-08-06-exam-modules-sync-design.md`, referenced in the spec's Testing section).

- [ ] **Step 1: Export `Detail` in `frontend.tsx`**

Change:

```ts
function Detail({
```

to:

```ts
export function Detail({
```

(`Detail` is a plain function declaration, so this export is safe to consume from a module that `frontend.tsx` itself imports — function declarations are bound during module instantiation, before either module's top-level code runs, so the circular import between `frontend.tsx` and `interview/App.tsx` resolves correctly.)

- [ ] **Step 2: Widen `Tab` and `navigate`'s parameter type**

Change:

```ts
type Tab = "home" | "leetcode" | "todo" | "exam";
```

to:

```ts
type Tab = "home" | "leetcode" | "todo" | "exam" | "interview";
```

Change the `navigate` function's parameter type and body:

```ts
  const navigate = (item: {
    source: "leetcode" | "todo" | "exam";
    linkId: number;
    course?: string;
    externalUrl?: string;
  }) => {
    if (item.source === "leetcode" && item.externalUrl) {
      openExternal(item.externalUrl);
      return;
    }
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "todo") setDeepLink({ tab: "todo", todoId: item.linkId });
    else setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
    setTab(item.source);
  };
```

to:

```ts
  const navigate = (item: {
    source: "leetcode" | "todo" | "exam" | "interview";
    linkId: number;
    course?: string;
    externalUrl?: string;
  }) => {
    if (item.source === "leetcode" && item.externalUrl) {
      openExternal(item.externalUrl);
      return;
    }
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "todo") setDeepLink({ tab: "todo", todoId: item.linkId });
    else if (item.source === "exam") setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
    setTab(item.source);
  };
```

- [ ] **Step 3: Add the tab button**

In `TabBar`, add this button right after the "Modules" button and before `<ThemeToggle />`:

```tsx
      <button
        className={tab === "interview" ? "tab tab-active" : "tab"}
        onClick={() => onChange("interview")}
      >
        Interview
      </button>
```

- [ ] **Step 4: Render the new tab in `App()`**

Add this render branch right after the `{tab === "exam" && (...)}` block, inside `App()`'s returned JSX. This is a placeholder — Task 7 replaces it with the real `interview/App.tsx` component once that file exists, keeping this task's own build clean in the meantime:

```tsx
      {tab === "interview" && <p className="board-empty">Coming soon</p>}
```

- [ ] **Step 5: Add the Home dashboard label/color**

In `HomeApp.tsx`, add an `"interview"` entry to both records:

```ts
const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  todo: "Todo",
  exam: "Modules",
  interview: "Interview",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "var(--cat-src-leetcode)",
  todo: "var(--cat-src-theory)",
  exam: "var(--cat-src-exam)",
  interview: "var(--cat-src-interview)",
};
```

- [ ] **Step 6: Add the CSS variable**

In `index.css`, add `--cat-src-interview` to all three theme blocks:

In the top `:root { ... }` block, right after `--cat-src-exam: #ff375f;`:

```css
  --cat-src-interview: #5b8def;
```

In the `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { ... } }` block, right after `--cat-src-exam: #da002c;`:

```css
    --cat-src-interview: #2f5fd1;
```

In the `:root[data-theme="light"] { ... }` block, right after `--cat-src-exam: #da002c;`:

```css
  --cat-src-interview: #2f5fd1;
```

- [ ] **Step 7: Verify**

Run: `bun test` — expected to still PASS (this task touched no backend logic).

```bash
bunx tsc --noEmit
```

Expected: no errors. If any appear, fix them before moving on — it means one of the edits above doesn't type-check against the current codebase.

- [ ] **Step 8: Commit**

```bash
git add frontend.tsx HomeApp.tsx index.css
git commit -m "feat: wire an Interview tab shell into the app and Home dashboard"
```

---

## Task 7: `interview/App.tsx` and the Excalidraw canvas

**Files:**
- Create: `interview/ExcalidrawCanvas.tsx`
- Create: `interview/App.tsx`

**Interfaces:**
- Consumes: `Detail` (exported from `frontend.tsx` in Task 6); `InterviewSessionView` shape (matches Task 4's `interview/api.ts` JSON responses, redeclared client-side since the frontend doesn't import server modules); `@excalidraw/excalidraw`'s `Excalidraw` component (bundling confirmed in Task 1's spike).
- Produces: `export default function InterviewApp()`. This task's own final step wires it into `frontend.tsx`, replacing the placeholder Task 6 left in the `"interview"` tab's render slot.

This is the UI-heavy view the spec calls out as manually verified rather than `bun test`-covered (spec, Testing section: "No automated UI test for the full session flow"). Its steps are a build/type-check plus a manual browser walkthrough instead of a `bun test` cycle.

- [ ] **Step 1: Write `interview/ExcalidrawCanvas.tsx`**

```tsx
import React, { useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface StoredScene {
  elements: readonly unknown[];
  appState: { viewBackgroundColor?: string };
}

export function ExcalidrawCanvas({
  initialScene,
  onChange,
}: {
  initialScene: string | null;
  onChange: (scene: string) => void;
}) {
  // Parsed once per mount — Excalidraw owns the live scene state after that;
  // this component only needs the parsed value to seed `initialData`.
  const initialData = useRef<StoredScene | null>(initialScene ? (JSON.parse(initialScene) as StoredScene) : null);

  return (
    <div className="interview-canvas">
      <Excalidraw
        initialData={initialData.current ?? undefined}
        onChange={(elements, appState) => {
          onChange(JSON.stringify({ elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } }));
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `interview/App.tsx`**

```tsx
import React, { useEffect, useRef, useState } from "react";
import { Detail } from "../frontend";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";

interface SdQuestionView {
  id: string;
  company: string;
  prompt: string;
  modelAnswer: string;
  rubric: string[];
}

interface InterviewSessionView {
  date: string;
  codingStartedAt: string | null;
  designStartedAt: string | null;
  completedAt: string | null;
  leetcodeProblemId: number | null;
  sdQuestion: SdQuestionView;
  sdAnswer: string;
  sdExcalidrawScene: string | null;
  sdRubricChecked: boolean[];
  sdRevealedAt: string | null;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const api = {
  today: () => fetch("/api/interview/today").then((r) => json<InterviewSessionView>(r)),
  startCoding: () => fetch("/api/interview/today/start-coding", { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  startDesign: () => fetch("/api/interview/today/start-design", { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  saveDesignAnswer: (answer: string, scene: string | null) =>
    fetch("/api/interview/today/design-answer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answer, scene }),
    }).then((r) => json<InterviewSessionView>(r)),
  reveal: () => fetch("/api/interview/today/reveal", { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  saveRubric: (checked: boolean[]) =>
    fetch("/api/interview/today/rubric", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checked }),
    }).then((r) => json<InterviewSessionView>(r)),
};

const PART_SECONDS = 45 * 60;

function looksLikeCode(block: string): boolean {
  return block.includes("\n") && /[{}()_]|:=|==|=>|\b(def|class|import|return)\b/.test(block);
}

function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((block, i) =>
        looksLikeCode(block) ? (
          <pre key={i} className="exam-code-block">{block}</pre>
        ) : (
          <p key={i} style={{ whiteSpace: "pre-wrap" }}>{block}</p>
        ),
      )}
    </>
  );
}

function Countdown({ startedAt }: { startedAt: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);
  if (!startedAt) return null;
  const elapsedSeconds = Math.floor((now - new Date(startedAt).getTime()) / 1000);
  const remaining = PART_SECONDS - elapsedSeconds;
  const overtime = remaining < 0;
  const displaySeconds = Math.abs(remaining);
  const mm = String(Math.floor(displaySeconds / 60)).padStart(2, "0");
  const ss = String(displaySeconds % 60).padStart(2, "0");
  return (
    <span className={overtime ? "interview-timer interview-timer-over" : "interview-timer"}>
      {overtime ? "+" : ""}
      {mm}:{ss}
    </span>
  );
}

type Part = "coding" | "design";

export default function InterviewApp() {
  const [session, setSession] = useState<InterviewSessionView | null>(null);
  const [part, setPart] = useState<Part>("coding");
  const [draft, setDraft] = useState("");
  const [scene, setScene] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = async () => {
    const s = await api.today();
    setSession(s);
    setDraft(s.sdAnswer);
    setScene(s.sdExcalidrawScene);
    if (s.leetcodeProblemId === null) setPart("design");
  };
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!session) return;
    if (part === "coding" && session.leetcodeProblemId !== null && !session.codingStartedAt) {
      api.startCoding().then(setSession);
    }
    if (part === "design" && !session.designStartedAt) {
      api.startDesign().then(setSession);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part, session?.date]);

  const scheduleSave = (nextAnswer: string, nextScene: string | null) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const updated = await api.saveDesignAnswer(nextAnswer, nextScene);
      setSession(updated);
    }, 800);
  };

  const reveal = async () => {
    const updated = await api.reveal();
    setSession(updated);
  };

  const toggleRubric = async (index: number) => {
    if (!session) return;
    const next = [...session.sdRubricChecked];
    next[index] = !next[index];
    const updated = await api.saveRubric(next);
    setSession(updated);
  };

  if (!session) return <p className="board-empty">Loading…</p>;

  const revealed = session.sdRevealedAt !== null;

  return (
    <>
      <header className="masthead">
        <span className="wordmark">Daily Interview Practice</span>
        <span className="masthead-date">{session.date}</span>
        {session.completedAt && <span className="cat-tag">Completed</span>}
      </header>

      <nav className="tabs interview-part-tabs" aria-label="Session parts">
        {session.leetcodeProblemId !== null && (
          <button className={part === "coding" ? "tab tab-active" : "tab"} onClick={() => setPart("coding")}>
            Part 1 · Coding <Countdown startedAt={session.codingStartedAt} />
          </button>
        )}
        <button className={part === "design" ? "tab tab-active" : "tab"} onClick={() => setPart("design")}>
          Part 2 · System Design <Countdown startedAt={session.designStartedAt} />
        </button>
      </nav>

      {part === "coding" && session.leetcodeProblemId !== null && (
        <Detail id={session.leetcodeProblemId} today={session.date} onBack={() => {}} onChanged={refresh} />
      )}

      {part === "design" && (
        <div className="exam-question">
          <h2>{session.sdQuestion.company}</h2>
          <PromptText text={session.sdQuestion.prompt} />
          <textarea
            className="theory-answer"
            rows={8}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              scheduleSave(e.target.value, scene);
            }}
            placeholder="Write your approach: requirements, high-level design, data model, trade-offs..."
          />
          <ExcalidrawCanvas
            initialScene={scene}
            onChange={(nextScene) => {
              setScene(nextScene);
              scheduleSave(draft, nextScene);
            }}
          />
          {!revealed && (
            <div className="btn-row">
              <button className="btn" disabled={draft.trim().length === 0} onClick={reveal}>
                Reveal model answer
              </button>
            </div>
          )}
          {revealed && (
            <div className="theory-model-answer">
              <h3>Model answer</h3>
              <PromptText text={session.sdQuestion.modelAnswer} />
              <h3>Self-assessment</h3>
              <ul className="interview-rubric">
                {session.sdQuestion.rubric.map((item, i) => (
                  <li key={item}>
                    <label>
                      <input type="checkbox" checked={session.sdRubricChecked[i] ?? false} onChange={() => toggleRubric(i)} />
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Add the remaining CSS classes**

Append to the end of `index.css`:

```css
.interview-part-tabs {
  margin-bottom: var(--space-4);
}

.interview-timer {
  margin-left: var(--space-2);
  font-family: var(--mono);
  font-size: var(--text-sm);
  color: var(--dim);
}

.interview-timer-over {
  color: var(--red);
}

.interview-canvas {
  height: 480px;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  margin: var(--space-4) 0;
}

.interview-rubric {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.interview-rubric label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
```

- [ ] **Step 4: Wire the real component into `frontend.tsx`**

Add this import at the top of `frontend.tsx`, alongside the other tab-app imports:

```ts
import InterviewApp from "./interview/App";
```

Replace the placeholder Task 6 added:

```tsx
      {tab === "interview" && <p className="board-empty">Coming soon</p>}
```

with:

```tsx
      {tab === "interview" && <InterviewApp />}
```

- [ ] **Step 5: Type-check**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Run the full test suite**

```bash
bun test
```

Expected: PASS — this task added no new `bun test` files, so this just confirms nothing broke.

- [ ] **Step 7: Manual browser verification**

```bash
bun --hot index.ts
```

Open `http://localhost:3000`, click the "Interview" tab, and confirm:
1. The session loads with today's date.
2. If a LeetCode problem is due, "Part 1 · Coding" is shown and its countdown starts ticking; the embedded problem view matches the normal LeetCode tab's detail view exactly.
3. Switch to "Part 2 · System Design" — the prompt renders, the countdown starts, and the Excalidraw canvas renders and is drawable.
4. Type an answer, draw something, wait ~1 second, reload the page — the answer text and the drawing must both still be there (confirms the debounced autosave round-trip works end to end, not just in the Task 1 spike).
5. Click "Reveal model answer" — the model answer and rubric checkboxes appear; check one and reload — it stays checked.
6. Go to the Home tab — an "Interview" due item appears in "Everything due" with the correct color; click it and confirm it navigates to the Interview tab.

- [ ] **Step 8: Commit**

```bash
git add interview/ExcalidrawCanvas.tsx interview/App.tsx index.css frontend.tsx
git commit -m "feat: build the Interview tab UI with the Excalidraw canvas"
```

---

## Task 8: Final verification pass

**Files:** none (verification only)

**Interfaces:** none — this task closes out the plan.

- [ ] **Step 1: Full automated suite**

```bash
bun test
bunx tsc --noEmit
```

Expected: both clean.

- [ ] **Step 2: Full manual end-to-end walkthrough**

Repeat Task 7 Step 7's walkthrough once more, plus:
1. Complete both parts of today's session (submit a LeetCode review as pass/fail, and reveal the design answer with non-empty text) and confirm the Home dashboard's "Interview" due item disappears and the session header shows "Completed".
2. Confirm a fresh day (temporarily patch `localToday()` or just wait for the date to roll over, whichever is more convenient) creates a new session with a different system design question than the previous day's.
3. Confirm a completely empty LeetCode queue (temporarily clear all `problems` rows in a scratch DB, or note this from Task 3's `db.test.ts` coverage if reproducing it live is impractical) opens straight into Part 2, per spec.

- [ ] **Step 3: Confirm no leftover spike artifacts**

```bash
git status
```

Expected: no `interview-spike.html`/`interview-spike.tsx` files, and `index.ts` has no leftover `/interview-spike` route (Task 1, Step 5 already handled this — this is a final sanity check).
