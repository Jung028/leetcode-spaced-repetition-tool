import type { ExamPaperSeed } from "../types";

// Tracely is a self-authored case-study tutorial (not the real INFO6007
// university course, which lives in exam-content/info6007/) styled after
// INFO6007's Project Management approach, using the user's own "Tracely"
// software project (an AI incident-investigation tool) as subject matter.
// Source material lives outside this repo at ~/Desktop/USYD/Tracely/.

const PAPER_1: ExamPaperSeed = {
  course: "TRACELY",
  week: 1,
  paperNumber: 1,
  title: "Tracely — Concepts & Requirements",
  topics:
    "Problem & thesis; the Company Brain (entities, relationships, controlled vocabulary, provenance, versioning vs. corroboration, source-of-truth boundary); the Investigation Agent (FR-17 lifecycle, hypotheses, parallel/sequential tools, historical incidents); Evidence, Timeline & Failure Handling (never-fabricate rule, NOT_CONFIRMED, expandable timeline); Requirements Engineering Process (Validation→FR→NFR→Architecture, MUST vs SHOULD, TBD NFRs, rubric traceability); Architecture & Domain Model (six domains, ingestion pipeline, graph-store decision, ER path tracing); Remediation & Safety (DML workflow, human-approval gate, MVP vs. closed-loop vision); Investigation State Machine (six states, illegal transitions).",
  sourceFiles: [
    "CLAUDE.md",
    "Tracely_MVP_Development_Specification.pdf",
    "Tracely_Tutorial_Sheet_1.pdf",
    "Tracely_Tutorial_Answers.pdf",
    "specs/01-company-brain.md",
    "specs/03-investigation-agent.md",
    "specs/04-evidence-timeline.md",
    "specs/05-failure-handling.md",
    "specs/08-state-machine.md",
    "specs/09-remediation.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "Tracely's own problem statement explicitly rejects \"engineers can't query systems\" as the core problem it solves. What does it argue the real problem is instead?",
      options: [
        "Engineers already have query tools (GitHub, Datadog, PagerDuty, Slack, a DB client) — what's missing is the mental model connecting how those systems relate, which has to be manually reconstructed every investigation.",
        "Engineers technically have query access, but each tool requires a different security clearance level, so most investigations stall waiting on access approval.",
        "The real bottleneck is that query tools return results too slowly during an active incident to be useful for time-sensitive root-cause analysis.",
        "Engineers can query systems fine, but lack permission to view database schemas without a DBA signing off on each request.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Companies already have the tools to query systems — what engineers lack isn't access, it's the mental model of how those systems connect. Reconstructing that mental model from scratch, every single time, across code/databases/logs/traces/business workflows, is the actual problem Tracely targets — not a missing tool.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following would most directly falsify Tracely's central thesis — \"a persistent, queryable representation of a company's technical and business context lets an AI agent investigate complex problems more effectively than starting fresh every time\"?",
      options: [
        "A manual engineer investigation reaches the wrong root cause faster than Tracely does on the same case.",
        "Claude with tools and no persistent Company Brain performs just as well as Tracely on the same real investigation cases.",
        "The Company Brain's SQLite-backed schema fails to scale past a few thousand entities without a migration to a graph database.",
        "Tracely takes longer to configure and connect its five source integrations than a general-purpose agent with no setup at all.",
      ],
      correctIndex: 1,
      modelAnswer:
        "The thesis is falsifiable because it makes a specific, measurable claim — Tracely (agent + persistent context) should outperform a general-purpose agent with no persistent context on the same investigation. If Claude-with-tools-and-no-Brain does just as well, the thesis is wrong. Setup time, storage scaling, or manual-investigation speed don't test that specific causal claim.",
    },
    {
      type: "mcq",
      prompt:
        "\"Claude can already do RCA well — why build Tracely at all?\" What is the strongest rebuttal the source material gives?",
      options: [
        "Claude cannot call external tools like databases or log-search APIs unaided, so it structurally cannot perform RCA without a wrapper system like Tracely.",
        "Claude's context window is too small to hold an entire company's codebase in a single prompt, making RCA without persistent storage impossible.",
        "Reasoning quality was never the bottleneck — a raw prompt has no memory of a company's services, schema, or business state machines, so it has to guess at the system the way a new hire would, every single time; persistent context turns that guesswork into an actual investigation.",
        "Claude's training data cutoff means it has no knowledge of the company's proprietary business logic at all, unlike a system trained specifically on that company's data.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Reasoning quality is treated as a commodity now, not the bottleneck. The rebuttal isn't about tool access, context window limits, or training data — it's that a bare prompt has to guess at the company's actual system every time, and persistent context is what turns that guesswork into retrieve → hypothesize → gather evidence → conclude only once evidence supports it.",
    },
    {
      type: "scenario",
      prompt:
        "GitHub reports the relationship sched_liability --DEPENDS_ON--> svc_liability at confidence 0.8. Two days later, Datadog independently reports the exact same fact about the exact same edge. A week after that, GitHub re-scans the repo and reports the same edge again, but now at a materially different confidence, because the scheduler's config actually changed. Explain what the Brain does to the stored relationship at each of these three points, using \"corroboration\" and \"versioning\" correctly.",
      modelAnswer:
        "1) GitHub's initial report creates the relationship with confidence 0.8 and GitHub as its provenance. 2) Datadog independently confirming the same fact is corroboration: the Brain raises confidence and adds Datadog as a second provenance entry on the existing edge — it does not create a duplicate. 3) GitHub later reporting a materially different fact about the same edge (confidence changed because the config changed) is versioning: the old relationship is marked SUPERSEDED with a valid_until timestamp, and a new current relationship is created — the history isn't deleted, because that changed fact is itself evidence of when the scheduler broke.",
    },
    {
      type: "mcq",
      prompt:
        "Why does Tracely restrict relationships to a controlled vocabulary (17 relationship types) instead of letting the agent invent new relationship labels at investigation time?",
      options: [
        "SQLite enforces a hard architectural limit on the number of distinct foreign-key-constrained relationship types a single table can support.",
        "Each of the Company Brain's five domains is assigned a fixed number of relationship types by design, and 17 is simply the total with no other rationale.",
        "A single confidence number would need to be recalculated by re-querying every source system on every read, which the read-only access constraint prohibits.",
        "An open vocabulary would fill the graph with near-duplicate, inconsistent labels (e.g. CALLS vs INVOKES vs USES), breaking reliable querying — extending the vocabulary is meant to be a deliberate, reviewed schema change, not something that happens silently mid-investigation.",
      ],
      correctIndex: 3,
      modelAnswer:
        "A closed vocabulary means every query and downstream module can rely on a fixed, known set of edge types. Letting the agent invent labels freely would produce inconsistent near-duplicates and defeat the point of a structured Brain — extending it requires deliberate schema review, not an on-the-fly decision at 2am during an investigation.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the Company Brain store full provenance (every source observation, when, and at what confidence) rather than just a single rolled-up confidence number per relationship?",
      options: [
        "A single number reveals how sure the system is but not why — provenance lets an investigator trace a claim back to its origin, which is what makes \"why do we believe this\" answerable, not just \"we believe this.\"",
        "A single confidence number cannot be represented in SQLite's type system, so a list structure is a storage necessity rather than a design choice.",
        "Provenance lists exist so each source system can be billed per API call it contributes evidence to, which a single number can't support.",
        "Storing a single number would count as an 18th implicit relationship type, which would violate the controlled-vocabulary constraint.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Provenance is the list of every source observation behind the confidence number — which system reported it, when, and at what confidence — so an investigator (or the agent itself) can trace a claim back to its origin. That traceability is the entire premise of evidence-backed RCA; a bare number can't provide it.",
    },
    {
      type: "mcq",
      prompt: "Why must the Company Brain never be treated as its own source of truth?",
      options: [
        "Because the Brain physically lacks write access to any production database, so it cannot technically serve as authoritative for anything.",
        "The Brain stores a derived, connected representation of what other systems already know — GitHub is authoritative for code, Postgres for data, and so on. Treating the Brain as authoritative would let a stale or wrong entry silently override reality, with no way to distinguish real evidence from a Brain-side mistake.",
        "Regional data-residency rules forbid any single system from being authoritative across more than one business domain at once.",
        "SQLite's lack of full ACID compliance under concurrent writes makes any of its stored records inherently untrustworthy as ground truth.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Each source system is authoritative for its own domain, and the Brain only stores derived representations plus provenance references back to the source. Keeping every entity/relationship tied to its source system means the Brain can be wrong and recoverable — you always know where to re-check, which is lost the moment the Brain is treated as truth itself.",
    },
    {
      type: "mcq",
      prompt:
        "Per FR-17's investigation lifecycle, which of the following correctly places \"form hypotheses\" relative to the surrounding steps?",
      options: [
        "Hypotheses are formed before Company Brain context is retrieved, so the agent knows in advance what context to look for.",
        "Hypotheses are formed only once, at the very end, immediately before producing the RCA — earlier steps are purely data-gathering.",
        "Hypotheses are formed after retrieving Company Brain context, and before the agent selects which tools to run and starts collecting evidence.",
        "Hypotheses are formed after evidence collection is complete, as a summary of whatever the collected tool results happened to show.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The lifecycle runs request → understand problem → retrieve Brain context → form hypotheses → select tools → collect evidence → update hypotheses → validate → RCA (or NOT_CONFIRMED) → remediation proposal → human approval. Hypotheses are formed once Brain context is available, and drive which tools get selected next — not the other way around.",
    },
    {
      type: "mcq",
      prompt:
        "Why is a structured hypothesis (status INVESTIGATING/CONFIRMED/REFUTED, with explicit supporting and contradicting evidence) considered better than reporting a single confidence score like \"0.4 confident\"?",
      options: [
        "A status enum is required because SQLite cannot store floating-point confidence values in a queryable column.",
        "Confidence scores are more computationally expensive to calculate than a status field, so the status enum was chosen purely for performance.",
        "A confidence score can't be linked to provenance metadata the way a status enum can, for purely technical schema reasons.",
        "A bare confidence score hides its own reasoning — 0.4 tells you nothing about what would raise or lower it. A structured hypothesis with visible supporting/contradicting evidence lets a human or the agent see exactly what's missing, and lets the agent explicitly refute a wrong hypothesis and generate a better one instead of quietly adjusting a number.",
      ],
      correctIndex: 3,
      modelAnswer:
        "A hypothesis is a named, falsifiable claim carrying explicit evidence and a status. The value isn't storage mechanics — it's that the reasoning behind the number becomes visible and actionable, which a bare confidence score can never provide.",
    },
    {
      type: "scenario",
      prompt:
        "During one investigation, the agent needs to (a) check the current database state of a stuck chargeback task, and (b) search logs for that same task ID — and, separately, (c) inspect a scheduler's implementation, which can only make sense once the agent has first determined which scheduler owns the failed state transition. Explain which of (a), (b), (c) the agent should run in parallel and which must run sequentially, and why.",
      modelAnswer:
        "(a) and (b) can run in parallel, because checking the database state and searching logs for the same task ID are independent of each other's results — neither needs the other's output first. (c) must run sequentially after determining which scheduler owns the transition, because the agent can't inspect a specific scheduler's implementation until it knows which scheduler that is — one result determines the next query. The architecture explicitly supports choosing adaptively between the two rather than forcing every investigation into one fixed shape.",
    },
    {
      type: "mcq",
      prompt:
        "Why must a similar past incident's RCA be treated as a candidate hypothesis rather than accepted as proof for a new investigation?",
      options: [
        "Systems change — configs get fixed, code gets patched — so a shared symptom doesn't guarantee a shared cause; treating history as proof would let the agent skip fresh verification and risk reporting a stale root cause with unearned confidence.",
        "Historical incidents live in a Brain domain the retrieval tool physically cannot query directly, so they can only ever be suggestions rather than usable evidence.",
        "Because historical-incident retrieval (FR-29) is marked SHOULD rather than MUST, its output is inherently less trustworthy than a MUST requirement's output.",
        "Two separate incidents can, by definition, never share a genuinely identical root cause, so treating one as proof for another would always be a logical error.",
      ],
      correctIndex: 0,
      modelAnswer:
        "A past incident with a similar symptom might share the same root cause, or might not. Treating history as proof would let the agent skip fresh verification; treating it as a candidate hypothesis means the agent still has to gather current evidence before confirming it — the exact discipline that keeps Tracely from fabricating conclusions (FR-30 makes this a MUST, independent of FR-29's SHOULD priority on retrieval itself).",
    },
    {
      type: "short",
      prompt:
        "Per FR-21, list the five things that must be recorded for every investigation step, and briefly explain why dropping any single one of them breaks the evidence trail.",
      modelAnswer:
        "What was queried (so it's reproducible), why it was queried (so the reasoning is visible, not just the action), what was found (the raw result), what the result means (the agent's interpretation, not left to the reader to infer), and which hypothesis it supports or refutes (so evidence connects back to the actual conclusion instead of floating unattached). Drop any one field and the evidence trail stops being inspectable — it becomes a log, not evidence.",
    },
    {
      type: "mcq",
      prompt:
        "Under Tracely's \"never fabricate\" rule, what must happen when no hypothesis clears the confidence threshold by the end of an investigation?",
      options: [
        "The agent automatically re-runs the investigation with a lower confidence threshold until some hypothesis clears the new bar.",
        "The system returns an explicit NOT_CONFIRMED result listing what was investigated and what's missing, and the investigation transitions to MANUAL_REVIEW_REQUIRED — treated as a correctness bug if this is violated, not a style preference.",
        "The agent selects the highest-confidence hypothesis available and reports it, with a visible caveat noting the confidence fell below threshold.",
        "The investigation record is discarded without being stored, since an unconfirmed root cause is considered to provide no downstream value.",
      ],
      correctIndex: 1,
      modelAnswer:
        "The agent is never allowed to present a guess as a conclusion. If no hypothesis clears the bar, it must return an explicit NOT_CONFIRMED result (what was investigated, what's missing, recommended next step) and transition to MANUAL_REVIEW_REQUIRED — a confident wrong answer during a production incident is worse than an honest 'I don't know yet.'",
    },
    {
      type: "mcq",
      prompt:
        "Why does the spec treat the expandable investigation timeline as a core product feature rather than a UI nicety?",
      options: [
        "The timeline exists mainly so the benchmark module has a concrete count of \"investigation actions\" to compare against the manual and Claude+tools baselines.",
        "Expandable steps are required by the encryption-in-transit/at-rest NFR, since collapsing steps into a single blob would violate per-step encryption granularity.",
        "Tracely's differentiator is trust through visible reasoning — if only the final RCA were shown, Tracely would just be a chatbot with better luck; showing every step, expandable to its evidence, is what makes it feel like an investigation an engineer can verify rather than a black box.",
        "The timeline is required because Slack's message character limit makes it impossible to post a full RCA as a single message.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The whole differentiator Tracely is selling is trust through visible reasoning, not just a faster answer — this matters enormously more in a production-incident context than in a typical chat product, which is exactly why it's core UX, not decoration.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the requirements process follow the order Validation → FR → NFR → Architecture, and why is doing it in reverse a mistake?",
      options: [
        "NFRs must always precede FRs, since non-functional constraints like latency mathematically bound which functional requirements are even achievable.",
        "Architecture decisions should come first so FRs can be scoped to only what the chosen technology stack already supports.",
        "The ordering is inherited waterfall-methodology convention with no functional justification specific to this project.",
        "Architecture decisions that are expensive to undo should be constrained by requirements, and requirements should be constrained by validated demand — picking a database or framework before knowing what the system must do risks spending weeks building for a problem nobody actually has.",
      ],
      correctIndex: 3,
      modelAnswer:
        "Validating the pain first means requirements aren't built for a problem nobody has, and architecture (expensive to undo) is constrained by requirements rather than the other way around — picking infrastructure before it's justified is 'pouring a foundation before knowing how many floors the building needs.'",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: NFR-3, the confidence threshold for claiming a root cause, being marked TBD instead of given a reasonable starting number, is treated as a gap in the spec that should be filled in before implementation begins.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. The confidence threshold is deliberately left TBD, to be calibrated from real MVP testing rather than fixed in advance. Filling it with a plausible-sounding placeholder would violate the project's own 'no invented numbers' rule and risk quietly becoming load-bearing before it's actually validated — TBD is the correct, honest state here, not a gap.",
    },
    {
      type: "short",
      prompt:
        "What does \"rubric traceability\" mean in Tracely's requirements process, and why does every FR/NFR need to map back to a rubric category?",
      modelAnswer:
        "Rubric traceability means every requirement can be traced to the specific MVP Acceptance Rubric category it serves (Company Brain 20%, Evidence & RCA 20%, and so on). It matters because it stops requirements accumulating for their own sake — if a proposed FR can't be mapped to a rubric line, that's a signal it might be scope creep rather than something the MVP actually needs to prove.",
    },
    {
      type: "scenario",
      prompt:
        "Chargeback CB-118820 is auto-rejected at PRE_JUDGE within seconds, with nothing that looks like a crash in the logs, because a newly launched region is missing an exchange-rate configuration entry. Using the Company Brain's domain model and its controlled relationship vocabulary, trace the ER path an investigation would walk to explain this root cause — name each entity in order and the relationship type connecting each pair.",
      answerDiagram: `flowchart LR
  A["State: PRE_JUDGE"] -->|DEPENDS_ON| B["Business Rule: liability calculation"]
  B -->|DEPENDS_ON| C["Configuration: exchange-rate entry (missing for new region)"]
  C -.->|"no entry found -> unguarded default"| D["Outcome: auto-reject"]`,
      modelAnswer:
        "State → Business Rule → Configuration. The chargeback sits in PRE_JUDGE (a State), which is governed by a Business Rule about liability calculation, which depends on a Configuration entity (the exchange-rate entry) that's missing for the new region. Nothing in this path touches a log error or a code bug — which is exactly why this demo case proves RCA can't rely on log search alone; the agent has to walk the Brain's entity relationships to find a configuration gap, not a stack trace.",
    },
    {
      type: "scenario",
      prompt:
        "The diagram below shows a proposed investigation-lifecycle transition. One transition shown is illegal and must be rejected by the state machine. Identify it and explain why, per the 'never fabricate' principle.",
      promptDiagram: `stateDiagram-v2
  [*] --> CREATED
  CREATED --> INVESTIGATING
  CREATED --> RESOLVED
  INVESTIGATING --> RCA_IDENTIFIED
  INVESTIGATING --> MANUAL_REVIEW_REQUIRED
  RCA_IDENTIFIED --> RESOLUTION_PROPOSAL
  RESOLUTION_PROPOSAL --> RESOLVED`,
      modelAnswer:
        "CREATED → RESOLVED directly (skipping INVESTIGATING entirely) is the illegal transition. Allowing it would mean the system could mark something resolved with zero evidence ever gathered, which directly violates the 'never fabricate' principle at the state-machine level, not just the agent-reasoning level — this transition must be structurally impossible, not just discouraged.",
    },
    {
      type: "mcq",
      prompt:
        "Why was the graph-store technology decision (Neo4j vs. Postgres-adjacency vs. hybrid) deliberately left open in the architecture document, rather than picked upfront?",
      options: [
        "Because picking infrastructure before it's justified by real query patterns is exactly the mistake the Validation → FR → NFR → Architecture order exists to prevent — the recommendation was to prototype against the option needing the least new infrastructure first (SQLite), and only switch if traversal performance genuinely demands it.",
        "Because Neo4j's licensing terms could not be finalized before the MVP's funding round closed.",
        "Because the Investigation Agent's tool-calling interface is fully database-agnostic by design, making the backend choice functionally irrelevant to any module.",
        "Because module 01's spec explicitly forbids naming a specific database technology in any spec file, for confidentiality reasons.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Picking infrastructure before it's justified by real query patterns is exactly what the project's own process exists to prevent. Module 01 followed this by prototyping on SQLite (least new infra) and would only justify switching once multi-hop traversal performance is actually measured as a bottleneck.",
    },
    {
      type: "mcq",
      prompt:
        "Per specs/09-remediation.md, what is the full DML remediation workflow, and which single step can never be skipped for any reason?",
      options: [
        "Generate SQL → human approval → test in dev → validate/rollback → confirm tests pass → execute, where the initial approval step can be skipped for a senior engineer's own fixes.",
        "Generate SQL → test in a development environment → validate/rollback → confirm tests pass → human approval → execute — human approval can never be skipped, including for a fix that seems 'obviously correct.'",
        "Generate SQL → validate/rollback → execute → confirm tests pass → human approval (granted retroactively for low-risk fixes) → test in dev.",
        "Generate SQL → test in dev → execute → validate/rollback → confirm tests pass → human approval, with approval required only for changes touching more than one table.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Generate SQL → test in dev → validate/rollback → confirm tests pass → human approval → execute. There is no code path, for any reason including 'the fix was obviously correct,' where the agent executes DML against production without an explicit, logged human approval action.",
    },
    {
      type: "scenario",
      prompt:
        "An engineer argues: 'This DML fix is a one-line UPDATE correcting an obviously wrong exchange-rate value — let's just let Tracely auto-apply it and skip the approval round-trip to save time.' Using CLAUDE.md's non-negotiable constraints and specs/09-remediation.md, explain why this must be rejected even though the fix looks safe, and state what category of action the MVP is confined to as a result.",
      modelAnswer:
        "'Obviously correct' is exactly the kind of confident-but-wrong judgment the system's own 'never fabricate' principle exists to guard against — if the agent could self-certify its own fixes as safe, the human approval gate would just be theater, and the rule is written specifically to override convenience because convenience is when corners get cut. As a result, the MVP is confined to read-only investigation plus a human-gated DML/PR remediation path — nothing auto-deploys, nothing auto-merges, and no production write happens without an explicit approval action recorded in the audit log.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: When a second, independent source corroborates a relationship the Brain already knows about, the Brain adds that source to the existing relationship's provenance rather than creating a duplicate edge.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. A relationship independently observed by a second source is recorded as additional provenance on the existing relationship — this raises confidence and adds provenance, it does not replace or duplicate the edge. That's the distinction from versioning, which replaces the edge when the same source reports a materially different fact.",
    },
    {
      type: "short",
      prompt:
        "What does FR-20 require the agent to be able to do once a hypothesis is refuted, and why is this capability necessary alongside FR-19's structured status tracking?",
      modelAnswer:
        "FR-20 requires the agent to be able to refute a hypothesis and generate a new one from evidence already gathered — not just mark the old one REFUTED and stop. This matters because FR-19's structured status (INVESTIGATING/CONFIRMED/REFUTED) is only useful if refutation actually drives the investigation forward toward a better hypothesis using the evidence already collected, rather than leaving the agent stuck with no path once its first guess is disproven.",
    },
  ],
};

const PAPER_2: ExamPaperSeed = {
  course: "TRACELY",
  week: 1,
  paperNumber: 2,
  title: "Tracely — Implementation & Benchmark",
  topics:
    "Module 01 Company Brain implementation (observe_relationship() outcomes, valid_from/valid_until, why SQLite, traverse()); Module 02 Source Integrations implementation (five connector failure modes, missing-source walkthrough, GitHub-first rationale, Slack auth.test quirk); Ingestion Pipeline stage ownership; module test-case requirements; Benchmark & Competitive Landscape (three benchmark paths, YC competitors and differentiation, no-invented-numbers rule, the three demo cases).",
  sourceFiles: [
    "Tracely_Tutorial_Sheet_1.pdf",
    "Tracely_Tutorial_Answers.pdf",
    "specs/01-company-brain.md",
    "specs/02-source-integrations.md",
    "specs/09-remediation.md",
    "specs/11-benchmark.md",
    "specs/_security-nfrs.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "observe_relationship() receives a new fact about an edge that already exists in the Brain. The fact comes from the same source system that originally reported it, and it's reporting the exact same fact again. What does observe_relationship() do?",
      options: [
        "Leaves the relationship unchanged — the fact is confirmed but nothing new needs to be recorded.",
        "Marks the existing relationship SUPERSEDED and creates a new current version, since any re-observation counts as a materially different report.",
        "Raises the relationship's confidence and adds a second provenance entry, treating the repeat as independent corroboration.",
        "Rejects the write entirely, since observe_relationship() only accepts facts about edges it hasn't seen from that exact source before.",
      ],
      correctIndex: 0,
      modelAnswer:
        "observe_relationship() asks whether the edge has been seen before. Same source, same fact repeated → leave it unchanged. Versioning only applies when the same source reports something materially different; corroboration only applies when a different source confirms the same fact.",
    },
    {
      type: "mcq",
      prompt:
        "observe_relationship() receives a fact about sched_liability --DEPENDS_ON--> svc_liability from Datadog. GitHub had already reported this exact same fact previously. What outcome does observe_relationship() produce?",
      options: [
        "The fact is discarded, since observe_relationship() only processes the first source to ever report a given edge.",
        "Corroboration: confidence is raised and Datadog is added as additional provenance on the existing edge; no duplicate is created.",
        "Versioning: the GitHub-sourced relationship is marked SUPERSEDED with a valid_until timestamp, and a new Datadog-sourced relationship becomes current.",
        "A separate duplicate edge scoped to Datadog is created, since each source system owns its own private copy of every relationship it independently observes.",
      ],
      correctIndex: 1,
      modelAnswer:
        "A different source independently confirming an already-known fact is corroboration — it raises confidence and adds provenance, it does not replace or duplicate the edge. That's distinct from versioning, which only applies when the same source's report about that edge materially changes.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the Brain use valid_from/valid_until timestamps on relationships instead of simply deleting a relationship once it's outdated?",
      options: [
        "SQLite does not support DELETE statements on foreign-key-constrained rows, making valid_from/valid_until a technical workaround rather than a design choice.",
        "valid_from/valid_until exist so the Brain can bill each source system based on how long its observation stayed current before being superseded.",
        "The outdated fact is itself evidence — knowing a dependency was healthy until a specific date and broken after is exactly the timeline signal an investigation needs; deleting it would destroy that history.",
        "Deleting a relationship would count as writing an 18th relationship type, which the controlled vocabulary constraint forbids.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The outdated fact is itself evidence — knowing the scheduler dependency was healthy until a specific date and broken after is exactly the signal an investigation needs. Deleting it would destroy the timeline the whole product is built to reconstruct.",
    },
    {
      type: "mcq",
      prompt:
        "Why was SQLite chosen for the Company Brain's MVP prototype instead of a dedicated graph database, and what would justify switching later?",
      options: [
        "SQLite was chosen because it natively supports the Cypher query language the controlled 17-type relationship vocabulary was designed around.",
        "SQLite was mandated by the data-encryption NFR, since it was the only storage option satisfying that constraint during the MVP build window.",
        "SQLite was chosen because it automatically enforces schema versioning, removing the need for the Diff Engine and Writer pipeline stages entirely.",
        "It required zero new infrastructure and its schema translates directly to Postgres later, matching the architecture doc's guidance to prototype against the option needing the least new infra first — switching to a native graph database would only be justified once multi-hop traversal performance genuinely becomes a measured bottleneck at real scale.",
      ],
      correctIndex: 3,
      modelAnswer:
        "SQLite required zero new infrastructure and its schema translates directly to Postgres later, matching the architecture doc's own guidance. It's worth switching to a native graph database only once multi-hop traversal performance is actually measured as a bottleneck — not before that's been proven.",
    },
    {
      type: "short",
      prompt:
        "What does traverse() do, and why does the Investigation Agent specifically need it rather than just reading an entity's immediate neighbors?",
      modelAnswer:
        "traverse() walks a chain of relationships multiple hops deep from a starting entity — e.g. from a Workflow through a State, a Scheduler, a Service, down to a Method. The agent needs this because a real root cause is rarely one hop away; traverse() is the mechanism that lets the agent ask 'what's downstream of this' and get the whole chain back, not just the immediate neighbor.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following is NOT one of the five distinct connector failure modes module 02 must implement test cases for?",
      options: [
        "Automatic silent retry with exponential backoff on every failed query.",
        "Not connected at all.",
        "Insufficient permissions on a connected integration.",
        "Source unavailable (timeout or down).",
      ],
      correctIndex: 0,
      modelAnswer:
        "The five distinct failure modes are not connected, authorization expired, insufficient permissions, source unavailable, and query failed. Silent automatic retry isn't one of the named failure modes — collapsing distinct failure types into one generic behavior is exactly what the spec argues against, since 'your token expired' needs a different response (re-auth) than 'the source is down' (wait and retry).",
    },
    {
      type: "scenario",
      prompt:
        "An investigation determines it needs Datadog telemetry, but Datadog isn't connected for this workspace. Walk through, step by step, what the system does per FR-15, including the three choices presented to the human and what becomes of whichever choice is made.",
      modelAnswer:
        "check_required_sources() detects Datadog is missing and returns a MissingSourceNotice explaining what it's needed for. The human is presented with three real choices via apply_decision() — connect it, continue without it, or cancel — and whichever choice is made gets written down as a structured record. That record becomes evidence in its own right, exactly what a later NOT_CONFIRMED result would cite under 'Missing' if the investigation can't be completed without that source.",
    },
    {
      type: "mcq",
      prompt:
        "Why was GitHub built first and fully tested during module 02's implementation, while Postgres/Datadog/PagerDuty/Slack were only structurally built at that point?",
      options: [
        "GitHub was chosen first because it's the cheapest of the five integrations to operate at scale, minimizing MVP infrastructure cost.",
        "The module's own spec explicitly instructed starting with GitHub only and proving the failure-mode test cases there before adding the next integration — building all five in parallel with none fully tested would have produced five shallow integrations instead of one deep, trustworthy one.",
        "GitHub was chosen first because it was the only integration exempt from the read-only database-access constraint.",
        "GitHub was chosen first because Postgres, Datadog, PagerDuty, and Slack all technically depend on GitHub's API being connected before they can authenticate.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Module 02's own spec explicitly instructed starting with GitHub only, applying the same one-module-at-a-time discipline at a finer grain. Building all five in parallel without any of them fully proven would have produced five shallow integrations instead of one deep, trustworthy one.",
    },
    {
      type: "mcq",
      prompt: "What was the Slack auth.test quirk caught during implementation, and why did it matter?",
      options: [
        "Slack's auth.test endpoint requires a second confirmation call within 30 seconds, or the session is silently invalidated with no error returned.",
        "Slack's auth.test endpoint returns HTTP 401 for an expired token but omits the ok field entirely, making the failure reason unparseable.",
        "Slack's auth.test endpoint returns HTTP 200 even when authentication has actually failed — the real failure is buried in the response body as \"ok\": false. Checking only the status code would make an expired token look 'connected' and fail silently later, exactly the failure mode FR-15 exists to prevent.",
        "Slack's auth.test endpoint only validates bot tokens, silently skipping validation for the user tokens Tracely actually relies on.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Slack's auth.test endpoint returns HTTP 200 even on authentication failure, with the real failure buried in the response body as \"ok\": false. Checking only the status code would let an expired token look 'connected' and fail silently later — caught here at the implementation level instead of surfacing in a future incident.",
    },
    {
      type: "mcq",
      prompt: "What three paths does the MVP benchmark compare, and what is the actual research question being tested?",
      options: [
        "Claude+tools, Tracely, and a third model fine-tuned on the company's historical incidents — testing which underlying model reasons best.",
        "Manual investigation, Tracely with the Brain disabled, and Tracely with the Brain enabled — testing whether the agent's tool-calling logic alone accounts for any improvement.",
        "Manual investigation, Tracely, and a deterministic rules-based expert system — testing whether an AI approach outperforms rule matching.",
        "Manual investigation, Claude+tools (no persistent context), and Tracely — run on the same real cases. The question isn't whether Tracely is 'smarter' than Claude; it's whether persistent company context makes the investigation workflow materially better than starting fresh with a general-purpose agent.",
      ],
      correctIndex: 3,
      modelAnswer:
        "The three paths are manual, Claude+tools with no persistent context, and Tracely, on the same real cases. The actual research question is whether persistent company context makes the investigation workflow materially better than starting fresh with a general-purpose agent — that's the thesis from Part A, made measurable.",
    },
    {
      type: "mcq",
      prompt:
        "What actually differentiates Tracely's positioning from a generic 'AI SRE' competitor, per the competitive-landscape material?",
      options: [
        "It isn't 'we have a knowledge graph' — several YC companies (like the now-pivoted IncidentFox, or active players Metoro and Relvy) already claim that. It's picking a vertical (payments/chargeback ops) where domain depth from lived experience is the moat, not generic infrastructure coverage a better-funded horizontal player can out-build.",
        "Tracely is the only entrant using a native graph database instead of a relational one, which is claimed as the primary differentiator.",
        "Tracely differentiates itself by supporting more than 20 source integrations, well beyond what adjacent 'AI SRE' competitors support.",
        "Tracely differentiates itself by offering fully autonomous production remediation without a human approval step, which competitors don't offer.",
      ],
      correctIndex: 0,
      modelAnswer:
        "IncidentFox (YC W26) pitched a nearly identical idea before pivoting away; Metoro and Relvy remain active in adjacent 'AI SRE' territory. The differentiation is picking a vertical where domain depth is the moat — not a graph-database claim (common), not integration count (explicitly out of scope per CLAUDE.md's '20+ integrations' non-goal), and definitely not autonomous production remediation, which CLAUDE.md explicitly forbids.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the spec forbid inventing benchmark numbers — even clearly-labeled placeholder ones — before real measured data exists?",
      options: [
        "Because investors are legally entitled to audit any quantitative claim made in pitch material before releasing funding.",
        "A plausible-sounding placeholder (e.g. '80% faster') tends to survive into pitch material and get quoted as if it were measured — exactly the overclaiming that destroys credibility the moment someone asks for the source. TBD is the honest state until a real run produces a real number.",
        "Because the benchmark module's own test suite programmatically rejects any hardcoded numeric constant in the metrics-reporting code path.",
        "Because a performance figure is legally classified as a compliance claim requiring certification before it can be published.",
      ],
      correctIndex: 1,
      modelAnswer:
        "A plausible-sounding placeholder tends to survive into pitch material and get quoted as if measured. The benchmark module exists specifically to stop that — TBD is the honest state until a real run produces a real number, which is exactly the same discipline CLAUDE.md applies to every other 'no invented numbers' case in the project.",
    },
    {
      type: "short",
      prompt:
        "Per FR-40, list the six things the benchmark module measures for each investigation case across all three paths (Manual, Claude+tools, Tracely).",
      modelAnswer:
        "Time-to-RCA, correctness, number of investigation actions, context switches, human interventions, and evidence quality — captured for each of the three demo cases across all three paths, in a format that can be cited directly without a manual cleanup step.",
    },
    {
      type: "scenario",
      prompt:
        "The MVP benchmark uses three demo cases: CB-123456 (WAIT_JUDGE, scheduler disabled), CB-118820 (auto-rejected at PRE_JUDGE, missing exchange-rate configuration), and CB-130201 (duplicate ICB records from a webhook-retry race condition). For each case, identify which system layer the root cause actually lives in, and explain why benchmarking all three together — rather than just the strongest one — matters for evaluating the Company Brain.",
      modelAnswer:
        "CB-123456's cause lives in the infrastructure/scheduling layer (a disabled scheduler); CB-118820's cause lives in the business-rule/configuration layer (a missing exchange-rate entry, not a code bug or outage); CB-130201's cause lives in the application code/concurrency layer (a race condition in a webhook retry handler). Running all three matters because they prove the Company Brain generalizes across categories of failure rather than succeeding on one lucky case — per the spec, showing only the easiest case would be building infrastructure that looks like it proves the thesis without actually proving it.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: FR-29 (retrieving similar historical incidents as candidate hypotheses) is a MUST requirement, while FR-30 (never treating historical RCAs as proof on their own) is only a SHOULD.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False — it's the reverse. FR-29 (retrieving historical incidents) is a SHOULD; FR-30 (treating them only as hypotheses to validate against fresh evidence, never as proof) is a MUST. The retrieval itself can slip under time pressure, but the discipline of never trusting history unverified cannot.",
    },
    {
      type: "mcq",
      prompt: "Which of the following is explicitly required as a module 01 (Company Brain) test case?",
      options: [
        "Confirming the Brain can auto-generate a new relationship type when none of the existing controlled-vocabulary types fit a newly observed fact.",
        "Verifying a relationship's stored confidence score numerically matches a value independently computed by an external ML model.",
        "Rejecting an attempt to write a relationship type outside the controlled vocabulary.",
        "Confirming the Brain can restore a hard-deleted relationship from a database backup within a defined recovery point objective.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Rejecting an attempt to write a relationship type outside the controlled vocabulary is explicitly listed as a required module 01 test case, alongside entity/relationship CRUD, versioning, multi-source corroboration, and domain/type/time-validity filtered queries. The Brain never auto-generates new types (that requires an explicit schema change), and hard-delete/restore isn't part of this module — relationships are versioned via valid_from/valid_until, never hard-deleted.",
    },
    {
      type: "mcq",
      prompt: "What are the Ingestion Pipeline's five stages in order, and which module owns which stages?",
      options: [
        "Connector → Normalizer → Extractor → Writer → Diff Engine, with module 01 owning the first three stages and module 02 owning the last two.",
        "All five stages — Connector, Extractor, Normalizer, Diff Engine, Writer — are owned entirely by module 01, since module 02 only supplies raw API credentials.",
        "Connector → Diff Engine → Extractor → Normalizer → Writer, with ownership split evenly across both modules and overlapping at Normalizer.",
        "Connector (authenticates, pulls raw data) → Extractor (turns raw data into candidate entities/relationships) → Normalizer (maps candidates onto the controlled vocabulary) — all three owned by module 02 — then Diff Engine (compares against current Brain state) → Writer (commits the version/corroborate decision) — both owned by module 01, where the storage and versioning logic lives.",
      ],
      correctIndex: 3,
      modelAnswer:
        "Connector → Extractor → Normalizer (module 02) → Diff Engine → Writer (module 01). Module 02 owns pulling and normalizing raw data into candidate facts; module 01 owns comparing those candidates against current Brain state and committing the version/corroborate decision, since that's where the storage and versioning logic actually lives.",
    },
    {
      type: "short",
      prompt:
        "Per NFR-19, list the full set of failure-mode and edge-case test scenarios module 02 must implement — not just the five connector failure modes, but the complete required list from specs/02-source-integrations.md.",
      modelAnswer:
        "Not connected at all; authorization expired mid-use; insufficient permissions on a connected integration; source unavailable (timeout/down); source query failure (valid connection, query itself errors); user chooses 'continue without source' and the investigation proceeds while noting the gap; and an investigation becoming impossible because the missing source contained required evidence — which must resolve to the NOT CONFIRMED / MANUAL_REVIEW_REQUIRED path, not a crash or a silent guess.",
    },
    {
      type: "scenario",
      prompt:
        "The diagram below shows the Ingestion Pipeline's five stages, but two of the stage labels have been swapped from their correct order. Identify which two are swapped, state the correct order, and say which module (01 or 02) owns each corrected stage.",
      promptDiagram: `flowchart LR
  A[Connector] --> B[Normalizer]
  B --> C[Extractor]
  C --> D[Diff Engine]
  D --> E[Writer]`,
      modelAnswer:
        "Extractor and Normalizer are swapped. The correct order is Connector → Extractor → Normalizer → Diff Engine → Writer. Connector, Extractor, and Normalizer are owned by module 02 (source integrations) — authenticate/pull, turn raw data into candidate entities/relationships, then map candidates onto the controlled vocabulary. Diff Engine and Writer are owned by module 01 (Company Brain) — compare candidates against current Brain state, then commit the version/corroborate decision. Normalizing has to happen before diffing, because the Diff Engine compares against the Brain's own controlled-vocabulary representation, not raw extracted candidates.",
    },
    {
      type: "mcq",
      prompt:
        "Why would collapsing all connector failures into one generic 'connector error' be worse than the five distinct failure-mode types module 02 actually implements?",
      options: [
        "A single generic error would force every caller to guess what actually went wrong — an expired token needs re-authentication, while a down source needs wait-and-retry — collapsing them into one type would make FR-15's explicit-notification requirement impossible to satisfy well.",
        "A generic error type would violate the data-encryption NFR, since error payloads must be typed to route through the correct encrypted channel.",
        "A generic error type is technically impossible to represent in a statically typed language, forcing a discriminated union regardless of design intent.",
        "A generic error type would count as an 18th relationship type, violating the controlled-vocabulary constraint that governs an unrelated part of the system.",
      ],
      correctIndex: 0,
      modelAnswer:
        "A single generic error would force every caller to guess what actually went wrong. 'Your token expired' needs a completely different response (re-auth) than 'the source is down' (wait and retry) — collapsing them would make FR-15's explicit-notification requirement (connect it / continue without it / cancel) impossible to satisfy meaningfully.",
    },
    {
      type: "mcq",
      prompt: "Per NFR-5, what is the one exception to database access being read-only everywhere in Tracely?",
      options: [
        "Module 10's team-scoped retrieval, which is permitted to write access-control metadata directly into the source database.",
        "The gated DML remediation workflow in module 09 — generate SQL → dev-test → validate/rollback → confirm tests pass → human approval → execute, with no path that skips the approval step.",
        "Module 02's Postgres connector, which is granted write access specifically for schema-introspection caching.",
        "The Company Brain's Diff Engine, which is permitted to write corrected values back into a source system when it detects a stale relationship.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Database access is read-only everywhere except the module 09 gated DML workflow, which always ends at a human approval gate before execution. No other module — not team-scoped retrieval, not a source connector, not the Diff Engine — is permitted write access to a source system.",
    },
    {
      type: "mcq",
      prompt:
        "On successful resolution of an investigation, what does FR-38 require to happen to the incident/investigation/RCA/resolution, and what priority is FR-38 itself?",
      options: [
        "It's fed back into the Company Brain as validated knowledge, and this is a MUST requirement, since FR-29's historical-incident retrieval would have no data at all without it.",
        "It's exported to an external analytics warehouse but never written back into the Brain's own queryable graph.",
        "It's fed back into the Company Brain as validated knowledge — but this is a SHOULD requirement, not a MUST.",
        "It's deleted from the investigation record entirely once resolved, to keep the Brain's storage from growing without bound over time.",
      ],
      correctIndex: 2,
      modelAnswer:
        "On successful resolution, the incident + investigation + RCA + resolution is fed back into the Company Brain as validated knowledge — but this is explicitly marked SHOULD, not MUST, meaning it strengthens the module (and feeds FR-29's historical-incident retrieval) without being required for MVP acceptance on its own.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Per NFR-19, 'user chooses continue-without-source' is itself one of the explicit test-case scenarios module 02 must implement, not just an incidental UI behavior.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. NFR-19's required test cases explicitly include the user choosing to continue without a missing source, with the investigation proceeding and later noting the gap — this is a required, tested behavior, not an implicit side effect of the UI.",
    },
  ],
};

export const WEEK_1_PAPERS: ExamPaperSeed[] = [PAPER_1, PAPER_2];
