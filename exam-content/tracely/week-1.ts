import type { ExamPaperSeed } from "../types";

// Full replacement of the TRACELY course content. The prior version was
// grounded in ~/Desktop/USYD/Tracely/ (a conceptual case-study spec) and
// ~/VSCodeProjects/tracely-brain (a now-stale sibling repo) — neither
// reflects the real project anymore. Every question below is grounded
// directly in the ACTUAL current source at
// /Users/adam/VSCodeProjects/tracely/services/rca-engine — its README.md
// and the Python code under app/ (agents/, agents/pr/, api/, core/,
// discovery/, integrations/, models/, services/, storage/, utils/,
// main.py). Real code is copied verbatim (function/variable names intact)
// from the files listed in each paper's sourceFiles. Several questions
// deliberately probe real bugs/dead code found while reading the source
// (e.g. core/evidence.py's undefined-variable crash, services/validate_service.py's
// bad import, the unused core/ranking.py and app/models/edge.py|node.py|integration.py) —
// these are genuine properties of the current codebase, not invented.

const PAPER_1: ExamPaperSeed = {
  course: "TRACELY",
  week: 1,
  paperNumber: 1,
  title: "RCA Engine — Agent Pipeline & Orchestration",
  topics:
    "The Honesty Rule and the 6-stage multi-agent pipeline (README); the Planner agent's hard rules and forced-tool plan emission (planner.py, plan.py); the Investigation agent's context-engineered per-step evidence gathering and its degrade-not-crash `safe()` wrapper (investigation.py); the Hypothesis agent's evidence-indexed clustering (hypothesis.py); the Synthesizer's deterministic verdict bands + mermaid/graph-view generation vs its LLM-only narrative (synthesizer.py); the deterministic Invalid State Tracer's AST-based origin-finding, distinct from the crash site (invalid_state.py); run_pipeline's end-to-end wiring and its trace-not-found short-circuit (orchestrator.py); the Workflow/Resolution remediation-action contract (workflow.py); the FastAPI app's router wiring (main.py).",
  sourceFiles: [
    "README.md",
    "app/agents/hypothesis.py",
    "app/agents/invalid_state.py",
    "app/agents/investigation.py",
    "app/agents/orchestrator.py",
    "app/agents/pipeline.py",
    "app/agents/plan.py",
    "app/agents/planner.py",
    "app/agents/synthesizer.py",
    "app/agents/workflow.py",
    "app/agents/run_pipeline.py",
    "app/agents/run_planner.py",
    "app/main.py",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "The README states the engine's \"Honesty Rule\" has three parts. Per that rule, what makes a node a valid root cause?",
      options: [
        "An explicit application error — success=false in a business response, an HTTP 5xx, or an error log — with business-level failure signals outranking transport-level status codes.",
        "A gap or missing span in the trace, which the engine treats as strong indirect evidence that something failed silently at that point.",
        "Any node whose HTTP status code is 4xx or 5xx, since transport-level failures are the most reliable signal available across every service.",
        "A node flagged by the Hypothesis agent as high-confidence, regardless of whether the Investigation agent found matching explicit-error evidence for it.",
      ],
      correctIndex: 0,
      modelAnswer:
        "The README is explicit: \"Explicit Signals Only\" (success=false, HTTP 5xx, or an error log), \"No Guesswork\" (never infer from missing telemetry — plan steps to collect evidence instead), and \"Business Logic Over Transport\" (business-level failure signals inside an HTTP 200 outrank transport status). A missing span is exactly the kind of gap the engine refuses to treat as evidence.",
    },
    {
      type: "mcq",
      prompt:
        "planner.py's _SYSTEM prompt includes this hard rule verbatim: \"NEVER plan a step that concludes from missing spans, gaps, or incomplete telemetry. When evidence is absent, plan a step to COLLECT the explicit evidence.\" If the graph summary handed to the planner shows a service with no outgoing calls recorded at all, what is the planner instructed to do?",
      options: [
        "Conclude that service is the root cause, since a total absence of downstream calls is itself powerful evidence of a hard failure at that point.",
        "Skip planning entirely and let the Hypothesis agent decide later whether the gap matters, since planning is only for services with existing evidence.",
        "Plan a step whose goal is to go collect explicit evidence about that service (e.g. its logs or trace data), not a step that treats the absence itself as proof of anything.",
        "Lower the confidence of every other hypothesis in the plan by a fixed amount to account for the uncertainty the gap introduces.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The rule is explicit: when evidence is absent, the planner must plan a step to COLLECT explicit evidence — never a step that concludes anything from the absence itself. This is the planning-stage enforcement of the engine-wide Honesty Rule (\"No Guesswork\").",
    },
    {
      type: "mcq",
      prompt:
        "planner.py's build_planner_context() lifts three specific fields out of the causal_engine's signals dict for the planner's brief: verdict, failure_node, and observed. Given a signals dict where failure_node is None (no explicit signal found yet), what line does the brief contain?",
      options: [
        '"PRIME SUSPECT: none — no explicit error signal found yet."',
        '"PRIME SUSPECT (explicit signal): unknown.unknown — no signal [none]"',
        "The PRIME SUSPECT line is omitted from the brief entirely when failure_node is None, rather than showing a placeholder.",
        '"PRIME SUSPECT: UNDETERMINED — deterministic pass found no failing node in the graph."',
      ],
      correctIndex: 0,
      modelAnswer:
        'build_planner_context() branches: `if failure_node:` builds the "PRIME SUSPECT (explicit signal): ..." line; `else: lines.append("PRIME SUSPECT: none — no explicit error signal found yet.")`. The line is always present — either the signal-derived form or this literal fallback string.',
    },
    {
      type: "short",
      prompt:
        'planner.py builds the tool schema as:\n\n_EMIT_PLAN_TOOL: Dict[str, Any] = {\n    "name": "emit_plan",\n    "description": "Return the investigation plan.",\n    "input_schema": InvestigationPlan.model_json_schema(),\n}\n\nand calls messages.create() with tool_choice={"type": "tool", "name": "emit_plan"}. Why does forcing tool use this way, with the schema taken directly from the Pydantic model, guarantee a schema-valid plan without the code needing any separate validation step?',
      modelAnswer:
        "tool_choice forces the model to respond with exactly one call to emit_plan and nothing else — no free-text preamble to parse around. Because the tool's input_schema IS InvestigationPlan.model_json_schema() (not a hand-written approximation of it), the model is constrained at generation time to produce JSON matching InvestigationPlan's own shape. planner.py then does `InvestigationPlan.model_validate(block.input)`, which is really just re-hydrating already-schema-conformant data into the Pydantic object rather than performing meaningful validation of untrusted input.",
    },
    {
      type: "scenario",
      prompt:
        'investigation.py\'s _engineer_context() has a helper:\n\ndef safe(label: str, fn) -> str:\n    try:\n        return fn()\n    except Exception as e:\n        return f"({label} unavailable: {e})"\n\nand every per-source fetch (_fetch_graph, _fetch_trace, _fetch_logs) is wrapped in it. Also note the comment on GRAPH/GITHUB/DB sources: "github / db: TODO (call tracely /api/integrations/postgres/query, github client)". Given an InvestigationStep whose data_sources is [DataSource.GITHUB], what evidence slice does _engineer_context() actually produce for that step, and why?',
      modelAnswer:
        "An empty one — the method's if/elif chain only has branches for DataSource.GRAPH (when focus or step.query_hint is set), DataSource.TRACE (when trace_id is set), and DataSource.LOGS (when trace_id is set); there is no branch for DataSource.GITHUB or DataSource.DB at all, since those fetches are marked TODO and never implemented. `parts` stays empty, and the method falls through to its own fallback: `(\"\\n\\n\".join(parts))[:_MAX_CHARS] or \"(no evidence available for this step)\"` returns that literal string. The step still runs through _post_process with that placeholder slice; the InvestigationAgent's system prompt tells the model to return no items and explain in `note` when the slice is inconclusive, so the step honestly yields zero evidence rather than crashing.",
    },
    {
      type: "mcq",
      prompt:
        "investigation.py's _SYSTEM prompt for the Investigation agent includes: \"NEVER invent facts not present in the slice; if the slice is empty or inconclusive, return no items and say so in `note`.\" What does hypothesis.py's HypothesisAgent.run() do when a step's EvidenceBundle ends up with zero items?",
      options: [
        "It raises an exception — specifically a ValueError naming the offending step — since HypothesisAgent.run() is written to assume every EvidenceBundle handed to it contains at least one usable EvidenceItem before flattening ever begins.",
        "It substitutes a synthetic low-confidence EvidenceItem summarizing the bundle's `note` field, so the Hypothesis agent's prompt still has at least one concrete citation available for that step.",
        "It automatically re-invokes the Investigation agent on that same step with a relaxed prompt and a wider set of data sources, trying to force at least one real evidence item out of it before giving up.",
        "It flattens `evidence` across all bundles as usual — an empty bundle simply contributes nothing to that flattened list, and hypothesis formation proceeds on whatever evidence the OTHER bundles did produce.",
      ],
      correctIndex: 3,
      modelAnswer:
        "`evidence: List[EvidenceItem] = [it for b in bundles for it in b.items]` simply flattens every bundle's items — a bundle with `items=[]` contributes nothing, and nothing special happens to it. Only if the ENTIRE flattened list across ALL bundles is empty does hypothesis.py print \"no evidence, no hypotheses\" and return `[]` immediately, before ever calling the model.",
    },
    {
      type: "mcq",
      prompt:
        'hypothesis.py\'s pick() helper resolves the model\'s cited evidence indices back to real EvidenceItems:\n\ndef pick(idxs: Any) -> List[EvidenceItem]:\n    out: List[EvidenceItem] = []\n    for i in idxs or []:\n        if isinstance(i, int) and 0 <= i < len(evidence):\n            out.append(evidence[i])\n    return out\n\nIf the model\'s emit_hypotheses call cites `supporting: [2, 47, "3"]` when only 5 evidence items exist (valid indices 0-4), what does pick() return?',
      options: [
        "Just the item at index 2 — indices 47 and the string \"3\" are silently dropped, since 47 fails the range check and \"3\" fails the isinstance(i, int) check.",
        "An empty list, because encountering any out-of-range or wrongly-typed index anywhere in the input causes the whole citation to be discarded.",
        "The items at index 2 and 3, since pick() coerces string-typed indices like \"3\" to int before bounds-checking them.",
        "It raises an IndexError on index 47 before the string \"3\" is ever evaluated, since Python evaluates list comprehensions left to right without a guard.",
      ],
      correctIndex: 0,
      modelAnswer:
        'pick() loops and only appends when `isinstance(i, int) and 0 <= i < len(evidence)` — 47 fails the range half of that check, and the string "3" fails isinstance(i, int) entirely (no coercion), so both are silently skipped. Only index 2 satisfies both conditions, so pick() returns `[evidence[2]]`.',
    },
    {
      type: "mcq",
      prompt:
        "synthesizer.py's SynthesizerAgent.run() begins:\n\nranked = sorted(hypotheses, key=lambda h: h.confidence, reverse=True)\nif not ranked:\n    return FinalReport(verdict=\"UNDETERMINED\", confidence=0.0, ...)\n\nWhy return a hardcoded UNDETERMINED/0.0 report here instead of calling the LLM to write a narrative explaining that no hypotheses were found?",
      options: [
        "Calling the LLM would cost real API credits and add response latency for a case whose outcome is entirely fixed and predictable in advance, so skipping the call here is presented as purely a cost- and latency-optimization shortcut rather than anything to do with the Honesty Rule.",
        "The Anthropic client's tool_choice forced-call mechanism can't be invoked with an empty messages list, so calling messages.create() here with zero hypotheses to describe would raise a client-side validation exception before any request even reached the API.",
        "An empty hypothesis list means there is nothing evidence-grounded for a narrative to describe — same Honesty Rule reasoning as the rest of the engine: never guess, and never dress up 'nothing was found' as if it were a confident conclusion.",
        "synthesizer.py precomputes and caches every possible LLM narrative response at build/deploy time keyed by hypothesis shape, and the empty-hypotheses case simply isn't one of the fixed set of cached responses the module ships with, so it falls back to this hardcoded report instead.",
      ],
      correctIndex: 2,
      modelAnswer:
        "This is the same never-guess discipline the whole engine applies: with zero hypotheses there's no evidence-grounded content for an LLM narrative to responsibly describe, so the code returns a fixed, honest UNDETERMINED report (\"No root-cause hypothesis could be formed from the available evidence\") rather than asking the model to manufacture prose around an empty result.",
    },
    {
      type: "scenario",
      prompt:
        'synthesizer.py\'s _graph_view() builds node roles like this:\n\nfor i, label in enumerate(chain):\n    role = "failure" if i == len(chain) - 1 else "context"\n    if suspect and suspect in label:\n        role = "suspect"\n\nGiven a hypothesis with causal_chain = ["iagent.handle", "iwallet.queryBalance"] and signals["failure_node"]["service"] == "iwallet", what role does the LAST node ("iwallet.queryBalance") end up with, and why not "failure"?',
      modelAnswer:
        'It ends up "suspect", not "failure". The loop first assigns role = "failure" to the last element (i == len(chain)-1), but the very next line unconditionally overwrites role to "suspect" whenever the causal-engine\'s prime-suspect service string appears in that label — and it does here ("iwallet" is a substring of "iwallet.queryBalance"). The suspect check runs AFTER and is not an elif, so it silently wins over the "failure" assignment for the same node whenever the label happens to contain the suspect service name.',
    },
    {
      type: "scenario",
      prompt:
        'synthesizer.py\'s _causal_mermaid() draws a hypothesis\'s causal chain:\n\ndef _causal_mermaid(h: Hypothesis) -> MermaidDiagram:\n    chain = h.causal_chain or []\n    if len(chain) < 2:\n        only = _san(chain[0]) if chain else _san(h.statement)\n        return MermaidDiagram(title="Causal chain", code=f\'flowchart LR\\n  n0["{only}"]\')\n    lines = ["flowchart LR"]\n    for i, (a, b) in enumerate(zip(chain, chain[1:])):\n        lines.append(f\'  n{i}["{_san(a)}"] --> n{i+1}["{_san(b)}"]\')\n    return MermaidDiagram(title="Causal chain", code="\\n".join(lines))\n\nGiven a hypothesis whose causal_chain is exactly ["iwallet.queryBalance"] (one element), sketch the mermaid code _causal_mermaid() actually produces.',
      answerDiagram: `flowchart LR
  n0["iwallet.queryBalance"]`,
      modelAnswer:
        'A single-node diagram. Because len(chain) == 1 is < 2, the function takes the short-circuit branch: `only = _san(chain[0])` (i.e. the single chain element, sanitized), and returns `flowchart LR\\n  n0["iwallet.queryBalance"]` — one box, no arrows. The zip(chain, chain[1:])-based edge-drawing loop is never reached for a chain this short; it only runs when there are at least two elements to connect.',
    },
    {
      type: "short",
      prompt:
        'invalid_state.py\'s module docstring says the tracer is "Fully deterministic: parse the failure expression, walk the trace/code graph to the caller chain, fetch the REAL construction source from GitHub, and use AST analysis to compare required-vs-set fields." Given that analyze_construction() calls javalang.parse.parse() on real fetched source and compares the parsed setter-call set against the required setter, why is this described as deterministic rather than as an LLM inferring the missing setter?',
      modelAnswer:
        "No LLM call appears anywhere in InvalidStateTracer.run() or its helpers — parse_invalid_state() uses fixed regexes on the stack trace, analyze_construction() runs javalang's AST parser and a plain set-membership check (`required in setters`) against the actual fetched source text, and _confidence() is a fixed arithmetic formula. Every step either finds the missing setter by literally inspecting the parsed AST of real code, or it doesn't and reports that honestly (`missing_setter=None`) — there's no step where a model guesses at what the code probably does; the origin is PROVEN from the actual construction site's syntax, not inferred.",
    },
    {
      type: "mcq",
      prompt:
        'invalid_state.py\'s _confidence() is:\n\ndef _confidence(analysis: ConstructionAnalysis, schema_not_null: bool) -> float:\n    if not analysis.missing_setter:\n        return 0.0\n    c = 0.6 if analysis.via == "ast" else 0.4\n    c += 0.10\n    if schema_not_null:\n        c += 0.20\n    return round(min(c, 0.95), 2)\n\nGiven an AST-confirmed missing setter (via="ast") where the field also corresponds to a NOT NULL database column (schema_not_null=True), what confidence does this return?',
      options: ["0.70", "0.80", "0.90", "0.95"],
      correctIndex: 2,
      modelAnswer:
        "0.6 (AST base) + 0.10 (runtime null observed in the stack trace) + 0.20 (schema confirms the column is required) = 0.90, which is below the 0.95 cap, so round(min(0.90, 0.95), 2) = 0.90.",
    },
    {
      type: "mcq",
      prompt:
        "invalid_state.py resolves the caller of the failing service with:\n\ncaller = caller_from_trace(events, failure_service) or caller_from_graph(failure_service)\n\ncaller_from_trace() looks for an RPC event belonging to failure_service and returns its parent event's service. caller_from_graph() queries the persisted graph for a service with a CALLS edge into the failure service. Under what circumstance does caller_from_graph() actually get invoked?",
      options: [
        "It always runs, in addition to caller_from_trace(), and the two results are compared for consistency before proceeding.",
        "Only when javalang is unavailable, since caller_from_graph() is meant as a fallback specifically for environments without AST support, not for trace-lookup misses.",
        "Only when the events list passed to InvalidStateTracer.run() is completely empty, regardless of what caller_from_trace() would have returned given real events.",
        "Only when caller_from_trace() returns a falsy value (None, or an empty string) — Python's `or` short-circuits, so caller_from_graph() is skipped entirely whenever the trace-based lookup already found a caller.",
      ],
      correctIndex: 3,
      modelAnswer:
        "`or` short-circuits in Python: caller_from_graph(failure_service) only executes when caller_from_trace(events, failure_service) evaluates to a falsy value — i.e. no matching RPC event was found in the trace, or its parent had no distinct service. When the trace lookup succeeds, the graph fallback function is never called at all.",
    },
    {
      type: "scenario",
      prompt:
        'invalid_state.py\'s _build_path() constructs three StateTransition hops when a caller is known: the construction hop (kind="api_mapping", status="deviated" if analysis.missing_setter else "ok"), the cross-service call hop (kind="service_call", status="unknown"), and the crash hop (kind="code_transform", status ALWAYS "deviated"). Why is the crash hop\'s status hardcoded to "deviated" regardless of what analyze_construction() found, while the construction hop\'s status depends on it?',
      modelAnswer:
        'The crash hop represents the point where the null expression from the parsed stack trace was literally observed to be null (`observed=f"{signal.null_expression} is null"`) — that IS a deviation from the "non-null at use" expectation by definition; there\'s no case where this hop is reached and the value wasn\'t null, since InvalidStateTracer only builds a report at all when parse_invalid_state() found a real null-expression signal in the stack trace. The construction hop, by contrast, is where the actual root cause (a missing setter) may or may not exist — analysis.missing_setter could be None if the setter genuinely was called, so that hop\'s status has to reflect the real AST finding rather than being assumed.',
    },
    {
      type: "mcq",
      prompt:
        'orchestrator.py\'s run_pipeline() begins:\n\nif graph is None:\n    events = fetch_trace_with_retry(trace_id) if trace_id else []\n    if trace_id and not events:\n        return { "trace_id": trace_id, "status": "trace_not_found", "verdict": "UNDETERMINED", ... }\n    graph = build_graph(events, trace_id=trace_id)\n\nGiven a call to run_pipeline(trace_id=None, question="why did checkout fail?"), does the trace_not_found short-circuit ever trigger?',
      options: [
        "Yes — with no trace_id, fetch_trace_with_retry is never even attempted (the ternary's else-branch sets events to [] directly), and the code is written to treat that empty-because-skipped case as functionally equivalent to a real trace lookup failure, triggering the same trace_not_found short-circuit response.",
        "No — `trace_id and not events` requires trace_id to be truthy; with trace_id=None, `events` is set to [] directly (fetch_trace_with_retry is skipped) and the guard's `trace_id and ...` is already False, so the pipeline falls through to build_graph([], trace_id=None) and proceeds with an empty-but-valid graph.",
        "No — question-only calls raise a ValueError immediately, before this block ever executes, because run_pipeline() is written to require trace_id to be non-None whenever the caller also leaves graph unset, on the reasoning that a fully graph-less, trace-less call has nothing concrete to investigate.",
        "Yes — fetch_trace_with_retry(trace_id) is called with trace_id=None regardless of the ternary, retries internally against Tempo using None as the id, and returns [] after exhausting its retry/backoff attempts; that empty result by itself is what the `trace_id and not events` guard treats as enough to trigger trace_not_found.",
      ],
      correctIndex: 1,
      modelAnswer:
        "The `if trace_id else []` ternary means fetch_trace_with_retry is only called when trace_id is truthy — with trace_id=None, events is assigned [] directly, no retries happen. Then `if trace_id and not events` short-circuits on the falsy trace_id alone, so this whole branch is skipped regardless of events being empty. The pipeline proceeds to build_graph([], trace_id=None) and continues through the full agent pipeline on an essentially empty graph — a legitimate \"full sweep from a question with no trace\" path, not an error.",
    },
    {
      type: "short",
      prompt:
        'orchestrator.py\'s _run_invalid_state() picks which log line to treat as the stack trace like this:\n\nmsgs = [str(l.get("message", "")) for l in logs]\nstack = max(\n    (m for m in msgs if "Exception" in m or "Caused by" in m or "\\tat " in m),\n    key=len, default="",\n) or max(msgs, key=len, default="")\n\nExplain what this picks when there IS a message containing "Exception", versus what it falls back to when there is NOT one, and why "longest" is the selection criterion in both cases.',
      modelAnswer:
        'It first filters to only messages containing "Exception", "Caused by", or a tab-indented "\\tat " stack frame line, and takes the LONGEST one of those — a real multi-line Java stack trace concatenated into one log message tends to be the longest such match, so `key=len` is a cheap proxy for "the most complete stack trace, not just a one-line exception summary". If no message matches any of those three markers at all, the `or` falls back to the single longest message overall (`max(msgs, key=len, default="")`) — a best-effort guess when no message looks like a real stack trace. Either way, an empty `stack` (no logs at all) makes `_run_invalid_state` return None via the `if not stack: return None` guard right after — it never fabricates a trace to parse.',
    },
    {
      type: "mcq",
      prompt:
        "workflow.py's WorkflowStep.new() classmethod is:\n\n@classmethod\ndef new(cls, **kw: Any) -> \"WorkflowStep\":\n    step = cls(**kw)\n    step.is_write = step.kind in WRITE_KINDS\n    step.approval = ApprovalState.PENDING if step.is_write else ApprovalState.NOT_REQUIRED\n    return step\n\nGiven WRITE_KINDS = {StepKind.DB_UPDATE, StepKind.CONFIG_CHANGE, StepKind.REPLAY_ACTION}, what approval state does a WorkflowStep.new(kind=StepKind.VERIFICATION, ...) get, and why?",
      options: [
        "ApprovalState.PENDING, since VERIFICATION steps re-query production data and are treated as writes out of caution.",
        "ApprovalState.NOT_REQUIRED, since StepKind.VERIFICATION is not a member of WRITE_KINDS, so is_write is False and the ternary selects NOT_REQUIRED.",
        "ApprovalState.APPROVED, since VERIFICATION steps are pre-approved by definition and skip the pending state entirely.",
        "ApprovalState.REJECTED, since a bare VERIFICATION step with no prior write step to verify is treated as invalid by the constructor.",
      ],
      correctIndex: 1,
      modelAnswer:
        "VERIFICATION is a read-only re-query step (per StepKind's own comment: \"re-query to confirm → read-only\"), so it's not one of the three WRITE_KINDS. is_write evaluates to False, and the ternary `PENDING if step.is_write else NOT_REQUIRED` selects NOT_REQUIRED — the same treatment SQL_QUERY steps get, since both auto-run without a human gate.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: workflow.py's Resolution model allows `kind` to be ResolutionKind.NONE, and per its own doc comment, this is meant to happen specifically when the investigation's verdict is UNDETERMINED or its confidence is low — i.e. it is the same Honesty Rule discipline applied to the remediation layer, not an error state.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. Resolution's doc comment states it directly: \"Honesty rule: kind == NONE when verdict is UNDETERMINED or confidence is low.\" ResolutionKind.NONE means \"nothing recommended yet\" — a deliberate, honest non-answer rather than a forced guess at a fix for a cause that isn't actually confirmed.",
    },
    {
      type: "mcq",
      prompt:
        "main.py wires up the FastAPI app:\n\napp.include_router(investigate.router, tags=[\"investigation\"])\napp.include_router(trace.router, tags=[\"trace\"])\napp.include_router(remediation.router, tags=[\"remediation\"])\n\n@app.on_event(\"shutdown\")\ndef close_db_pool():\n    pool.close()\n\nWhy is closing the database pool tied to FastAPI's shutdown event specifically, rather than, say, closing it right after each request finishes?",
      options: [
        "Because storage/db.py's pool is a small ConnectionPool (min_size=1, max_size=5) meant to be held open and reused across the whole app's lifetime — closing it per-request would defeat the purpose of pooling and force a fresh connection setup on every single request.",
        "Because psycopg's ConnectionPool object cannot be closed more than once without raising an exception, so it must only ever be closed exactly once, at an arbitrary point chosen for convenience.",
        "Because Prisma (which owns the schema in the Next.js app) requires the rca-engine's pool to stay open for the lifetime of the process so that migrations can be coordinated between the two services.",
        "Because closing per-request would violate FastAPI's threadpool model, since store functions run synchronously in worker threads that share the same pool object.",
      ],
      correctIndex: 0,
      modelAnswer:
        "storage/db.py's own comment explains the pool exists because \"Store functions are sync and run in FastAPI's threadpool, so a single shared connection would not be thread-safe — use a small pool instead.\" The whole point of a connection pool is to hold a small number of connections open and reuse them across many requests; closing it after every request would recreate that overhead on every single call. Tying cleanup to the app's shutdown event closes it exactly once, when the process is actually going away.",
    },
    {
      type: "short",
      prompt:
        'run_pipeline.py\'s CLI prints the final report and ends with:\n\nfor m in r["mermaid"]:\n    print(f"\\nMERMAID — {m[\'title\']}:\\n{m[\'code\']}")\n\nGiven that run_pipeline() (orchestrator.py) returns `"report": report.model_dump()` and FinalReport.mermaid is `List[MermaidDiagram]`, and SynthesizerAgent always builds exactly `mermaid = [_causal_mermaid(top)]` for the top-ranked hypothesis (never one per hypothesis) — how many mermaid diagrams does a typical run_pipeline.py CLI run print, regardless of how many hypotheses were formed?',
      modelAnswer:
        'Exactly one (when there is at least one hypothesis) — synthesizer.py only ever calls `_causal_mermaid(top)` once, against the single highest-confidence hypothesis after `ranked = sorted(hypotheses, key=lambda h: h.confidence, reverse=True)`, and wraps it in a one-element list. The mermaid diagrams for any other, lower-ranked hypotheses are never generated at all — only the causal chain of the winning hypothesis gets visualized. When there are zero hypotheses, mermaid=[] and the loop prints nothing.',
    },
  ],
};

const PAPER_2: ExamPaperSeed = {
  course: "TRACELY",
  week: 1,
  paperNumber: 2,
  title: "RCA Engine — Remediation & PR Generation Subsystem",
  topics:
    "The remediation pipeline's 'Trust-but-Verify' stages per the README (Symbol Grounding, Multi-Tier Patch Generation, Isolated Sandboxing, Deterministic Validation Gates, Idempotent PR Submission); the frozen FixSpec contract and the PreparedArtifact 'reviewed == committed' invariant (spec.py); pre-patch symbol grounding and its auto-correction/signature-change branches (symbol_grounder.py); Tier-1 deterministic AST insertion with its hard structural gate, and Tier-2 LLM-proposed multi-file search/replace edits (patch_generator.py, multifile_generator.py); the sandbox's pre-flight dependency probe and module-scoped Maven build (sandbox.py, dep_probe.py); the deterministic-guards-then-refuse-only-LLM-judge validator (validator.py); GitHub-native idempotency via canonical_id/branch/PR-body marker (idempotency.py); the threaded job registry and its prepare/approve split (jobs.py); PR text assembly split across prepare-time and approve-time (assembler.py); the sha-gated approve step and the GitHub write client (pipeline.py, github_pr.py); the optional LLM cache and the replanner escape hatch (llm.py, replanner.py).",
  sourceFiles: [
    "README.md",
    "app/agents/pr/artifact_store.py",
    "app/agents/pr/assembler.py",
    "app/agents/pr/dep_probe.py",
    "app/agents/pr/github_pr.py",
    "app/agents/pr/idempotency.py",
    "app/agents/pr/jobs.py",
    "app/agents/pr/llm.py",
    "app/agents/pr/multifile_generator.py",
    "app/agents/pr/patch_generator.py",
    "app/agents/pr/pipeline.py",
    "app/agents/pr/replanner.py",
    "app/agents/pr/run_pr.py",
    "app/agents/pr/sandbox.py",
    "app/agents/pr/spec.py",
    "app/agents/pr/symbol_grounder.py",
    "app/agents/pr/validator.py",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "Per the README's Symbol Grounding section, what does the Symbol Grounder do when a fix requires a variable (e.g. `userId`) that isn't available in the local method's scope?",
      options: [
        "It flags the need for a signature change and identifies all upstream call sites that must be updated as well.",
        "It silently drops that part of the fix and generates a partial patch that compiles but doesn't actually resolve the root cause.",
        "It substitutes a hardcoded placeholder value in place of the missing variable and leaves a TODO comment for a human to fill in later.",
        "It automatically searches the entire repository for any variable with a matching name and substitutes the first match it finds.",
      ],
      correctIndex: 0,
      modelAnswer:
        'The README states this directly under "Scope Awareness": "It identifies if a required variable (e.g., userId) is missing from the local method scope" and under "Signature Propagation": "If a fix requires a variable not available in the current method, it flags the need for a signature change and identifies all upstream call sites that must be updated." symbol_grounder.py implements exactly this via needs_signature_change and _find_call_sites().',
    },
    {
      type: "scenario",
      prompt:
        'symbol_grounder.py\'s _check_value_expr() returns (compatible, corrected, needs_sig_change, missing_var, escalate_reason). When the value_expr\'s inner variable is NOT in the target method\'s scope, it returns:\n\nreturn False, None, True, inner, reason\n\nBack in pipeline.py\'s prepare(), the check is:\n\nif grounded and grounded.escalate_reason and not grounded.needs_signature_change:\n    return artifact(PrStage.ESCALATED, note=f"type mismatch (pre-patch): {grounded.escalate_reason}")\n\nDoes an out-of-scope variable (needs_signature_change=True) cause an immediate ESCALATED artifact at this check, even though escalate_reason is also set?',
      modelAnswer:
        "No. The guard is `grounded.escalate_reason and not grounded.needs_signature_change` — both conditions must hold to escalate here. Since needs_signature_change is True in this case, `not grounded.needs_signature_change` is False, so the whole condition is False and this particular ESCALATED return is skipped. Instead, prepare() goes on to check `if grounded and grounded.needs_signature_change and spec.change_intent.kind == \"insert_setter\"`, which swaps change_intent.kind to \"llm_multifile\" — routing the fix to the multi-file generator (which can add the parameter and update call sites) rather than refusing outright. Only a genuine, non-fixable type mismatch (escalate_reason set AND needs_signature_change False) is escalated at the earlier check.",
    },
    {
      type: "mcq",
      prompt:
        'patch_generator.py\'s _generate_insert_setter() computes a structural signature before and after the patch:\n\nsig_after, calls_after = _structural_signature(new_content), sorted(_setter_calls(new_content))\nif sig_after != sig_before:\n    return _escalate(spec, "structural signature changed — refusing (not a pure setter insert)")\ndelta = _multiset_delta(calls_after, calls_before)\nif delta != [ci.setter]:\n    return _escalate(spec, f"setter delta {delta} != [{ci.setter}] — refusing")\n\n_structural_signature() fingerprints method signatures, fields, type names, and imports (setter CALLS are deliberately excluded from it). If the insertion happens to land one line off and accidentally also duplicates an adjacent, unrelated setter call, what happens?',
      options: [
        "The patch is escalated: sig_after would still equal sig_before (setter calls aren't part of the structural signature), but delta would include the unexpected duplicated setter, making delta != [ci.setter], which triggers the second refusal.",
        "Nothing — since setter calls are excluded from _structural_signature(), the duplicate call is invisible to the gate and the patch is accepted as-is.",
        "The patch is silently corrected — patch_generator.py detects the duplicate and removes it before comparing signatures, so the final patch never contains the accidental duplication.",
        "The patch fails at the javalang.parse.parse() re-parse step with a syntax error, since a duplicated setter call is not valid Java syntax.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Setter calls are deliberately excluded from _structural_signature() (\"that's the one thing we're allowed to add\"), so a duplicated adjacent setter call wouldn't break the sig_before/sig_after comparison. But it WOULD change the setter-call multiset: _multiset_delta(calls_after, calls_before) would now include both the intended setter AND the accidental duplicate, so `delta != [ci.setter]` becomes true and the second guard refuses the patch with \"setter delta ... != ... — refusing\". The hard gate catches this even though the structural signature alone couldn't.",
    },
    {
      type: "mcq",
      prompt:
        'patch_generator.py\'s _apply_unified_diff() applies a raw diff hunk-by-hunk, checking every context and removed line:\n\nif h.startswith(" "):\n    if si >= len(src) or src[si].rstrip("\\n") != h[1:].rstrip("\\n"):\n        return None\n    out.append(src[si]); si += 1\nelif h.startswith("-"):\n    if si >= len(src) or src[si].rstrip("\\n") != h[1:].rstrip("\\n"):\n        return None\n    si += 1\n\nWhat happens if a context line in the diff doesn\'t exactly match the corresponding source line (e.g. the source has drifted since the diff was generated)?',
      options: [
        "The applier does a fuzzy match against the source, accepting the diff as long as the mismatched line falls within a small configurable edit-distance threshold of what the diff expected, similar to how patch(1) tolerates minor drift with fuzz factors.",
        "It skips the mismatched context or removed line silently, advances past it, and continues applying the rest of the hunk anyway, treating the mismatch as a non-fatal warning rather than a reason to abort the whole patch.",
        "The whole function returns None — a strict, exact-match applier with no fuzz, so any context/removed-line mismatch causes the raw_diff patch to fail (and _generate_raw_diff then escalates with \"raw diff did not apply cleanly\").",
        "It re-fetches the current file content from GitHub via the read-only client, discards the stale copy the diff was generated against, and retries applying the same diff once more against the freshly fetched content before giving up entirely.",
      ],
      correctIndex: 2,
      modelAnswer:
        'The module docstring calls this out directly: "Strict unified-diff applier: every context/removed line must match the source exactly at the hunk offset, else bail (None). No fuzz." Any mismatch on a " "-prefixed or "-"-prefixed line returns None immediately, and _generate_raw_diff() turns that into `_escalate(spec, "raw diff did not apply cleanly (context mismatch)")` — never a best-effort partial apply.',
    },
    {
      type: "short",
      prompt:
        'multifile_generator.py\'s docstring says its two forced-tool phases are "1. plan_edit → which extra files (beyond the entry file) it must see. 2. emit_edits → per-file [{find, replace}] search/replace blocks." Why not just have phase 2 emit the entire new file content directly, instead of find/replace blocks that _apply_edits() then has to apply deterministically?',
      modelAnswer:
        "The docstring states the philosophy plainly: \"the engine applies them DETERMINISTICALLY (each `find` must match EXACTLY once) and re-parses the Java. The LLM generates; the engine + downstream gates DECIDE.\" If the LLM emitted whole-file content, there would be no deterministic way to verify the edit is minimal and scoped to only what it claims to change — any unrelated drift the model introduced elsewhere in the file would be invisible. Find/replace blocks force every change to be an explicit, individually-verifiable unit: _apply_edits() can confirm each `find` is an exact, unique substring of the real current content before applying it, and _check_scope() can confirm each edit's location falls inside the target method or a known call site — neither check would be possible against an opaque whole-file rewrite.",
    },
    {
      type: "mcq",
      prompt:
        'multifile_generator.py\'s _apply_edits() is:\n\nfor find, replace in edits:\n    if not find:\n        return None, "empty find block"\n    n = content.count(find)\n    if n == 0:\n        return None, f"find block not found: {find[:60]!r}"\n    if n > 1:\n        return None, f"find block not unique ({n}x): {find[:60]!r}"\n    content = content.replace(find, replace, 1)\n\nWhy does the function refuse an edit whose `find` string occurs MORE than once in the file, rather than just replacing the first occurrence (which the code technically already knows how to do via `replace(find, replace, 1)`)?',
      options: [
        "Because Python's str.replace() with count=1 is only guaranteed to replace the FIRST occurrence when the target string is pure ASCII; Java source containing non-ASCII identifiers, string literals, or comments could make str.count() and str.replace() disagree about where matches actually start, so the uniqueness check is really a workaround for that encoding edge case.",
        "Because a non-unique find string always indicates the LLM accidentally copy-pasted the exact same edit block twice into the same emit_edits response, so refusing it here is really a deduplication safeguard against a malformed tool call rather than a genuine ambiguous-location guard.",
        "Because a non-unique `find` string means the model's copied snippet doesn't uniquely identify the intended location — replacing 'the first occurrence' could silently patch the wrong one of several identical-looking spots, which is exactly the kind of ambiguous edit the pipeline's design escalates rather than guesses at.",
        "Because Java files containing the same non-trivial substring in more than one place (beyond a few lines) are treated by javalang's parser as a structural anomaly bordering on a compile error, so _apply_edits() is really just pre-empting a downstream re-parse failure rather than reasoning about which occurrence the model actually meant.",
      ],
      correctIndex: 2,
      modelAnswer:
        'The EDIT_SYS prompt itself requires `find` to be "an EXACT, UNIQUE substring of the current file content" precisely because the pipeline never guesses at ambiguous locations — this is the same "ANCHOR ON THE TARGET METHOD" discipline as elsewhere in the PR subsystem. If the same text appears twice, "replace the first one" is an arbitrary guess about which occurrence the model actually meant, and a wrong guess could patch an unrelated, correct piece of code instead of the buggy one. Refusing forces either a more specific `find` (with more surrounding context) or an escalation, never a silent guess.',
    },
    {
      type: "scenario",
      prompt:
        'multifile_generator.py\'s _check_scope() is:\n\nlo, hi = grounded.method_lines\ncall_site_set = set(grounded.call_sites)\nfor e in edits:\n    ...\n    line_no = content[:idx].count("\\n")\n    in_method = lo <= line_no <= hi\n    near_call_site = any(abs(line_no - cs) <= 3 for cs in call_site_set)\n    if not in_method and not near_call_site:\n        return (f"edit targets line {line_no} ... outside `{grounded.target_method}` ... and not near a known call site ...")\n\nGiven the EDIT_SYS prompt\'s rule "Do NOT \'fix\' a similar-looking call (e.g. another setUserId(...)) in a DIFFERENT, unrelated method," explain what _check_scope() actually enforces at the code level, and why "near a known call site" is also allowed, not just "inside the target method."',
      modelAnswer:
        "_check_scope() enforces that every proposed edit's line falls either inside the target method's own body (lo <= line_no <= hi, from the symbol grounder's GroundedScope) or within 3 lines of one of the target method's KNOWN call sites (grounded.call_sites) — anywhere else fails scope and the whole patch is escalated as a \"scope violation\". Call sites have to be allowed too, not just the method body, because a signature-change fix legitimately needs to touch caller code (per the grounded-scope prompt's own instruction to update call sites when a parameter is added) — restricting edits to ONLY the method body would make that class of fix impossible, while still refusing edits that land in some unrelated third method that merely happens to contain a similarly-named setter call.",
    },
    {
      type: "mcq",
      prompt:
        'validator.py\'s validate() is:\n\ndef validate(spec, patch, *, source=None, client=None) -> ValidationResult:\n    det = _deterministic(spec, patch)\n    if not det.deterministic_ok:\n        return det  # rejected on hard guards alone — no LLM call\n    ...\n\nGiven _deterministic() checks file count, new/deleted files, forbidden paths (build/SQL/migration/Dockerfile/yaml), and total changed lines — why does validate() skip the LLM judge call entirely when any of these fail, rather than still asking the LLM for its opinion?',
      options: [
        "Because the LLM judge's forced tool call is observed to always return introduces_unrelated_change=true whenever any deterministic guard has already failed on the same patch, making a post-failure LLM call statistically redundant even though it would technically still execute and cost money.",
        "Because the deterministic guards and the LLM judge's three judgments (addresses_root_cause, is_minimal, introduces_unrelated_change) check substantially overlapping criteria, so calling the LLM after a deterministic guard has already failed would just double-count essentially the same violation in the final reasons list shown to the reviewer.",
        "Because the Anthropic API itself rejects any tool_choice-forced messages.create() call whenever the diff being evaluated exceeds PR_MAX_CHANGED_LINES, so skipping the LLM call in that specific case is a required workaround for an external API-side line-count limitation, not a design choice about redundant checks.",
        "Because a patch that already fails a hard, mechanical guard (too many files, forbidden file type, too many changed lines) can never pass validation regardless of what an LLM thinks about its intent — running the LLM anyway would just spend money and latency on a call whose outcome cannot change the result.",
      ],
      correctIndex: 3,
      modelAnswer:
        "validate()'s passed condition ultimately requires deterministic_ok in addition to whatever the LLM judge says — the module docstring states the hard guards \"run FIRST and can reject alone\", and the LLM judge only ever runs \"if they pass\". Since deterministic_ok=False already guarantees the patch cannot be validated no matter what the LLM concludes, calling the model would be pure wasted cost/latency with zero possible effect on the outcome.",
    },
    {
      type: "mcq",
      prompt:
        'validator.py\'s _SYSTEM prompt for the LLM judge says: "You CANNOT approve a fix; you confirm it is on-target and minimal, or flag a problem... Be conservative: when unsure, refuse." And validate() computes:\n\nreturn ValidationResult(passed=arc and mini and not iuc, ...)\n\nGiven the LLM returns addresses_root_cause=True, is_minimal=True, and introduces_unrelated_change=True, what is `passed`?',
      options: [
        "True — two of the three judgments (addresses_root_cause and is_minimal) are favorable, and validate()'s passed logic is written as a majority-rules vote across the three booleans rather than a strict AND, so two-out-of-three favorable outweighs the one unfavorable flag.",
        "It depends on whether the deterministic guards (_deterministic()) also passed — if det.deterministic_ok is True, the LLM judge's introduces_unrelated_change flag is treated as advisory only and gets overridden/ignored when combining the final passed boolean.",
        "True — introduces_unrelated_change is recorded only as advisory information carried into the `reasons` list for the reviewer to read, and validate()'s passed computation is built purely from addresses_root_cause and is_minimal, without referencing introduces_unrelated_change at all.",
        "False — `arc and mini and not iuc` requires ALL THREE conditions to hold in the passing direction simultaneously; introduces_unrelated_change=True makes `not iuc` False, which alone fails the whole AND regardless of the other two being favorable.",
      ],
      correctIndex: 3,
      modelAnswer:
        "`passed = arc and mini and not iuc` is a strict AND across all three — every condition must be simultaneously true (with introduces_unrelated_change specifically needing to be False, hence `not iuc`). Even with addresses_root_cause and is_minimal both True, introduces_unrelated_change=True makes `not iuc` False, and one False term fails the entire AND. This matches the docstring's \"REFUSE-ONLY\" design: the judge can only prevent an approval, never force one through despite a real objection on any single dimension.",
    },
    {
      type: "scenario",
      prompt:
        "sandbox.py's SandboxRunner.run() starts with a pre-flight check:\n\ntopology = dep_probe.probe(workdir)\nif topology.blocking:\n    res.compile_passed = False\n    res.failure_kind = BuildFailureKind.ENVIRONMENT\n    res.note = topology.note\n    return res\n\nThe module docstring explains this \"catches 'Nexus is down' in ~3s instead of waiting for Maven's own dependency-resolution timeout (~60s)\". Given a repo whose pom.xml references an unreachable local Nexus server, trace what happens: does `mvn ... install` ever get invoked?",
      modelAnswer:
        "No — dep_probe.probe(workdir) parses the repo's declared repositories (from pom.xml plus ~/.m2/settings.xml's active profiles), classifies each as nexus_local/github_packages/central/unknown, and actively probes every non-central one over HTTP with a short timeout (PR_PROBE_TIMEOUT, default 3s). An unreachable Nexus repo ends up in topology.blocking, and run() returns immediately with compile_passed=False and failure_kind=ENVIRONMENT before the `phase(\"compile\", [\"mvn\", ...])` call is ever reached — Maven itself never starts. This is deliberately faster and more specific than letting Maven discover the same unreachable Nexus on its own dependency-resolution timeout, and it classifies the failure as an infrastructure problem (ENVIRONMENT) rather than a code problem.",
    },
    {
      type: "mcq",
      prompt:
        'sandbox.py builds its Maven scopes as:\n\nscope = (["-pl", ",".join(modules), "-am"] if modules else [])      # build deps too\ntest_scope = (["-pl", ",".join(modules)] if modules else [])        # test only the changed module(s)\n\nand runs compile via `["mvn", "-q", "-B"] + scope + ["-DskipTests", "install"]` but tests via `["mvn", "-q", "-B"] + test_scope + ["test"]`. Why does the compile phase include `-am` (also make dependencies) while the test phase deliberately omits it?',
      options: [
        "Because Maven's `test` goal doesn't accept the `-am` (also-make) flag at all when invoked this way — `-am` is only meaningful alongside `-pl` for goals that actually build modules, and the combination `mvn -pl <modules> -am test` would either be silently ignored or rejected by Maven's reactor logic — so omitting it from test_scope is presented as a syntactic necessity of the tool rather than a deliberate scoping decision.",
        "Because the test phase is run inside a more network-restricted Docker sandbox profile than the compile phase, and `-am`'s extra reactor-wide dependency-module resolution step would require outbound access to Nexus/Maven Central that the test-phase network policy deliberately blocks, forcing test_scope to stay narrower than compile's scope.",
        "Because `-am` triggers a fresh network round-trip to Nexus to re-resolve every dependency module on each invocation, and since dep_probe.probe(workdir) already confirmed Nexus reachability once up front and the compile phase already installed those dependency modules into ~/.m2, repeating `-am` during the test phase would just be a redundant, wasted network call.",
        "Because the compile phase needs to build and `install` the changed module's dependency modules too (so later, module-scoped test runs can resolve sibling SNAPSHOT artifacts from ~/.m2), while the test phase should only run the CHANGED module's own tests — re-running every dependency module's tests too (which -am would trigger) would be far slower and pointless, since those modules weren't touched by the patch.",
      ],
      correctIndex: 3,
      modelAnswer:
        'The inline comments say this directly: compile is "build + install the changed module(s) AND their deps (no tests), so a later module-scoped test can resolve sibling SNAPSHOTs from ~/.m2" — hence `-am`. The test phase comment says "run ONLY the changed module(s)\' tests — not the whole reactor\'s" — omitting `-am` scopes `mvn test` to just the modules the patch actually touched, avoiding the cost of re-running every dependency module\'s existing (unrelated, unchanged) test suite.',
    },
    {
      type: "mcq",
      prompt:
        'idempotency.py\'s canonical_id() hashes only a subset of a FixSpec\'s fields via _semantic_view():\n\ndef _semantic_view(spec: FixSpec) -> dict:\n    """ONLY the fields that define WHAT the fix is — never evidence/confidence/timestamps..."""\n    ...\n    return {"repo": ..., "target_file": ..., "root_cause": {...}, "change_intent": {...}}\n\nWhy exclude spec.confidence and spec.evidence from the hash that determines a fix\'s canonical id (and therefore its branch name and idempotency marker)?',
      options: [
        "Because confidence and evidence are frequently None or empty depending on which detection path produced the FixSpec, and Python's hashlib would raise a TypeError trying to serialize inconsistent optional fields — so _semantic_view() strips them purely to keep canonical_id() from crashing on otherwise well-formed inputs.",
        "Because two runs that identify the EXACT SAME underlying fix (same repo, file, root cause, and change) but happen to compute slightly different confidence scores or cite a differently-ordered evidence list should still collapse to the same canonical id and reuse the same branch/PR — the hash is meant to capture WHAT the fix changes, not incidental metadata about how confident or well-evidenced this particular run felt.",
        "Because confidence and evidence are mutable fields that get updated after the FixSpec is constructed (e.g. when a later pass revises the confidence score), and hashing a field that can still change after construction would violate FixSpec's `model_config = {\"frozen\": True}` immutability guarantee, so they are excluded to keep the model itself internally consistent.",
        "Because including floating-point confidence values as raw input to a SHA-256 hash is numerically unstable across different Python versions and platforms, producing a non-reproducible hash even for two runs on identical FixSpec data — so floats are dropped from the hashed view entirely to guarantee determinism.",
      ],
      correctIndex: 1,
      modelAnswer:
        "The docstring is explicit: the semantic view holds \"ONLY the fields that define WHAT the fix is — never evidence/confidence/timestamps — so cosmetic re-runs collapse to the same id, but a different diff (raw_diff) yields a different one.\" Two investigation runs might land on the same root cause and change but disagree slightly on confidence or which exact evidence snippets they cite; that's incidental to WHAT gets changed, so it shouldn't fragment identical fixes into separate branches/PRs — GitHub-native idempotency (via find_existing_pr keyed on this id) only works if truly-identical fixes hash identically.",
    },
    {
      type: "scenario",
      prompt:
        "jobs.py's submit_prepare() is:\n\njob_id = canonical_id(spec)[:16]\nwith _LOCK:\n    if job_id in _JOBS:\n        return job_id\n    art = artifact_store.load(job_id)\n    if art is not None:\n        _PREP[job_id] = art\n        _JOBS[job_id] = PrJob(...)\n        return job_id\n    _JOBS[job_id] = PrJob(job_id=job_id, spec=spec, stage=PrStage.GENERATING)\nthreading.Thread(target=_run_prepare, args=(job_id, spec), daemon=True).start()\nreturn job_id\n\nA user previews the same fix twice: once now, and once after restarting the rca-engine process entirely. Does the second call re-run patch generation, sandboxing, and validation from scratch?",
      modelAnswer:
        "No. Because job_id is derived deterministically from canonical_id(spec), the second call computes the exact same job_id as the first. After the restart, job_id is no longer in the in-memory `_JOBS` dict (that state was lost with the process), so the first `if job_id in _JOBS` check misses — but the very next check, `artifact_store.load(job_id)`, finds the PERSISTED PreparedArtifact JSON file that the first run's prepare() already wrote to disk (via artifact_store.save() inside pipeline.prepare()'s `artifact()` helper). Finding it reconstructs the PrJob from the saved artifact and returns immediately WITHOUT starting a new background thread — generation truly runs \"at most once per fix identity,\" surviving a process restart, exactly as the docstring states.",
    },
    {
      type: "mcq",
      prompt:
        'pipeline.py\'s open_pr() on the normal READY path does:\n\nif compute_patch_sha(artifact.files) != artifact.patch_sha:\n    return PrResult(stage=PrStage.FAILED, ..., note="patch_sha mismatch — refusing to open PR (no GitHub call made)")\nresult = assembler.open_draft_pr(self._client, artifact)\n\nGiven that artifact.patch_sha was already computed and stored back when the artifact was first prepared, why re-compute and re-check it again right before opening the PR instead of trusting the stored value?',
      options: [
        "Because compute_patch_sha() is documented as non-deterministic across process restarts — it seeds its hash with the current wall-clock time rather than purely the file contents — so re-computing it right before the GitHub write catches hash drift introduced purely by the restart itself, not by any actual change to the files.",
        "Because this is the trust invariant the whole PR subsystem is built around: the bytes a human reviewed (captured in artifact.files at prepare-time) must be EXACTLY the bytes about to be committed — re-hashing artifact.files right before the GitHub write catches any tampering or corruption of the persisted artifact between prepare and approve, and refuses the write rather than silently trusting a value that could have been altered.",
        "Because GitHub's Contents API itself requires a freshly computed sha parameter on every PUT request as part of its own optimistic-concurrency check, unrelated to this module's own trust logic — the local re-check exists only to pre-compute the value the API call will need, not to catch tampering.",
        "Because artifact.patch_sha is only a placeholder value written during prepare() (a zero or empty string) and is never actually populated with a real, meaningful SHA-256 hash until this exact point inside open_pr(), so the comparison here is really the first time the real hash is computed at all.",
      ],
      correctIndex: 1,
      modelAnswer:
        "spec.py's module docstring names this as THE trust invariant: \"the diff the user reviews is exactly the diff committed... that hash is re-checked at approve.\" The artifact is persisted to disk between prepare and approve (artifact_store.save/load), so re-hashing artifact.files and comparing against the stored patch_sha at the moment of the GitHub write is what actually guarantees nothing changed in between — trusting the stored value alone would defeat the entire purpose of having a separate, explicit approval step.",
    },
    {
      type: "mcq",
      prompt:
        'pipeline.py\'s open_pr() force path only proceeds past this guard:\n\nif not artifact.files:\n    return PrResult(stage=PrStage.FAILED, ..., note="no patch to commit — generation failed before producing output")\n\nWhat does this guard mean is required even to attempt a force-push of a REJECTED/FAILED/BLOCKED job?',
      options: [
        "The job's confidence score must still be above the configured PR_MIN_CONFIDENCE threshold, even though its stage already reflects a rejection, because the force path re-runs the same confidence gate used on the normal READY path before allowing any GitHub write.",
        "A human reviewer must have already left an explicit comment approving the force-push, tracked separately in a dedicated approvals table from the job's normal automated approval gate, before this guard will let execution proceed any further.",
        "A patch must actually have been generated and written into artifact.files at some point — generation succeeding is a precondition for force-pushing; if generation itself failed (e.g. patch_generator escalated before producing any FileChange), there's nothing to commit regardless of how hard a human insists.",
        "The sandbox build must have at least started running, even if it ultimately failed, since this guard is meant to distinguish a genuine build failure from a job that never reached the sandbox stage at all and therefore has nothing worth force-pushing.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The force path exists to let a human push a patch through despite a failed SANDBOX or VALIDATION gate — but it still needs an actual patch to push. If patch generation itself never produced any FileChange (e.g. an ESCALATED or FAILED-at-generation stage), artifact.files is empty and there is literally nothing to commit to a branch — the guard reports this plainly rather than attempting a no-op GitHub write.",
    },
    {
      type: "short",
      prompt:
        'assembler.py\'s module docstring distinguishes two functions by WHEN they run: "build_pr_text(): PREPARE-time... open_draft_pr(): APPROVE-time. Pure GitHub writes... No LLM, no generation." Why does splitting PR-text generation (which calls the LLM, wrapped in try/except with a deterministic fallback) away from the actual GitHub writes matter for what happens during the approval click?',
      modelAnswer:
        'Because the title/summary are already generated and persisted inside the PreparedArtifact (pr_title/pr_body) by the time a human clicks approve, approve-time work is reduced to open_draft_pr()\'s "pure GitHub writes" — idempotency re-check, create branch, commit files verbatim, open the draft PR — with zero LLM calls and zero chance of the PR text changing between what the reviewer saw in the preview UI and what actually gets posted. If PR text were generated at approve-time instead, the human could review one summary during prepare and have a DIFFERENT (freshly-regenerated) summary actually posted to GitHub, breaking the same "what you reviewed is what you get" guarantee that patch_sha re-verification protects on the code side.',
    },
    {
      type: "mcq",
      prompt:
        'llm.py\'s tool_call() is:\n\nkey = _key(model, system, tools, messages) if _ENABLED else ""\nif _ENABLED:\n    p = _dir() / f"{key}.json"\n    if p.exists():\n        return json.loads(p.read_text())\nif client is None:\n    from anthropic import Anthropic\n    client = Anthropic()\nresp = client.messages.create(...)\n\nWhen RCA_LLM_CACHE=1 and a matching cached response file already exists on disk, does this code path ever construct an Anthropic() client or require ANTHROPIC_API_KEY to be set?',
      options: [
        "Yes — an Anthropic() client is always constructed up front to validate that ANTHROPIC_API_KEY is set correctly, even when the cached response file ends up being read from disk instead of a live API call being made.",
        "No — when the cache is enabled and a hit is found, the function returns json.loads(p.read_text()) immediately; the `if client is None:` block (which imports and constructs Anthropic()) is only reached when there was NO cache hit, so a cache hit needs no API key at all.",
        "It depends on whether `client` was explicitly passed in by the caller — if client is None, an Anthropic() instance is always created regardless of whether the cache lookup above it produced a hit or a miss.",
        "Yes, but only to fetch the model's context-window metadata, which this code path always needs in order to validate the cached response's shape before it can be safely returned to the caller.",
      ],
      correctIndex: 1,
      modelAnswer:
        "On a cache hit, `return json.loads(p.read_text())` executes and the function exits right there — every line after it, including the `if client is None: from anthropic import Anthropic; client = Anthropic()` block, is simply never reached. The docstring confirms this design goal directly: replaying \"identical requests after that replay from disk with NO API call (and no API key needed).\"",
    },
    {
      type: "short",
      prompt:
        'replanner.py\'s replan() is:\n\ndef replan(spec, source, failure_reason, attempt):\n    if attempt >= 3:\n        return spec.change_intent.model_copy(update={"kind": "llm_multifile"})\n    ...\n    # otherwise: forced-tool LLM call to emit a corrected ChangeIntent\n\nWhy does the function give up on trying to correct the deterministic insert_setter approach after 3 attempts, switching straight to llm_multifile WITHOUT even asking the LLM to propose a corrected ChangeIntent that attempt?',
      modelAnswer:
        "Each of the first two attempts already gave the LLM a chance to fix the ChangeIntent (the exact method name, request type, setter, and value expression) based on the specific failure_reason from the previous try. If three attempts have failed to produce a working insert_setter-style fix, repeatedly asking the same narrow question (\"what's the right setter/method/value_expr?\") isn't converging — the underlying fix likely needs an approach insert_setter's single-setter-insertion model can't express at all (e.g. genuinely multi-file logic). Switching directly to llm_multifile bypasses AST insertion's narrow shape entirely and lets the multi-file generator's more general search/replace + scope-checking machinery attempt the fix from scratch, rather than spending a fourth attempt asking the same kind of question that already failed three times.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: run_pr.py's CLI, `python -m app.agents.pr.run_pr <fixspec.json> [--prepare-only]`, defaults to running the ENTIRE pipeline (prepare AND open the PR) unless the caller explicitly passes --prepare-only, meaning it will actually write a branch and open a draft PR on GitHub if the prepared artifact reaches READY.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        'True. run_pr.py\'s main() checks `if "--prepare-only" in argv:` to call pipe.prepare(...) alone; the else branch calls `pipe.run(spec, job_id="cli")`, and PrPipeline.run() explicitly calls self.prepare() followed by self.open_pr(art) whenever the prepared artifact\'s stage is READY — meaning the default CLI invocation, with no flag, really does perform live GitHub writes (branch creation, file commit, draft PR) if the fix clears every gate.',
    },
  ],
};

const PAPER_3: ExamPaperSeed = {
  course: "TRACELY",
  week: 1,
  paperNumber: 3,
  title: "RCA Engine — API Layer, Core Causal Engine & Data Models",
  topics:
    "FastAPI routes for investigation and remediation (api/investigate.py, api/remediation.py, api/trace.py); the deterministic causal engine's explicit-signal priority order, leaf-failure/origin detection, and confidence formula (core/causal_engine.py); the dead/broken core/evidence.py and core/ranking.py modules found by inspection; build_graph's event-to-node/edge translation and its logs-only-with-trace_id behavior (core/graph_builder.py); the Pydantic request/data models and which ones are actually wired into the app versus unused (models/*.py).",
  sourceFiles: [
    "app/api/investigate.py",
    "app/api/remediation.py",
    "app/api/trace.py",
    "app/core/causal_engine.py",
    "app/core/evidence.py",
    "app/core/graph_builder.py",
    "app/core/ranking.py",
    "app/models/connect_request.py",
    "app/models/edge.py",
    "app/models/event.py",
    "app/models/integration.py",
    "app/models/node.py",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        'causal_engine.py\'s _failure_signal() checks signal types in a fixed priority order — business success flag, then business result/outcome keys, then HTTP status, then OTel span status, then log-line keywords — and returns on the FIRST match. Given a node whose data contains BOTH `success: false` AND `http.status_code: 200`, which signal does _failure_signal() actually report?',
      options: [
        'The business signal — `{"kind": "business", "severity": 4, "detail": "success=False"}` — because the function checks `_SUCCESS_KEYS` first and returns immediately on a match, before ever reaching the HTTP-status check; HTTP 200 is not even an error code, so it wouldn\'t match on its own anyway.',
        'The HTTP signal — `{"kind": "http", "severity": ..., "detail": "HTTP 200"}` — since 200 is still a status code present in the data, and the function is documented as checking HTTP status ahead of business outcome fields whenever both are present on the same node.',
        "Both signals are merged into a single combined dict with kind='business+http', severity taken as the max of the two, since the function is designed to surface every applicable signal type at once for maximum diagnostic information rather than picking just one.",
        "Neither — a success=false paired with a non-error HTTP status like 200 is treated as an internally contradictory node, and _failure_signal() explicitly returns None for it rather than guessing which field to trust.",
      ],
      correctIndex: 0,
      modelAnswer:
        "The function's own ordering (\"Order == priority. Business outcome first (success=false beats an HTTP 200)\") checks _SUCCESS_KEYS first: `if v is False or v == 0 or ...: return {\"kind\": \"business\", \"severity\": 4, \"detail\": f\"{k}={v}\"}`. That return statement exits the function immediately — the HTTP-status branch is simply never reached for this node. And separately, HTTP 200 wouldn't have matched the HTTP branch anyway, since that branch only fires `if code >= 400`.",
    },
    {
      type: "mcq",
      prompt:
        'run_causal_analysis() begins:\n\nfailures = {n["id"]: sig for n in nodes if (sig := _failure_signal(n))}\nif not failures:\n    return _undetermined()\n\nGiven a graph where every node has an HTTP status under 400, no success/result field, no OTel ERROR status, and no LOG-type node with error keywords in its text, what does run_causal_analysis() return?',
      options: [
        "A verdict of UNDETERMINED with confidence 0.0, via _undetermined() — since `failures` is an empty dict, `not failures` is True, and the function returns immediately without ever computing leaf_failures, causal chains, or hypotheses.",
        "A verdict of LIKELY_CAUSE targeting whichever node has the highest HTTP status code among those under 400, since some signal is still better than none.",
        "An exception, since the dict comprehension `{n[\"id\"]: sig for n in nodes if (sig := _failure_signal(n))}` cannot evaluate to an empty dict without raising a KeyError on the walrus assignment.",
        "A verdict of ROOT_CAUSE_IDENTIFIED pointing at the entry node of the trace, on the reasoning that an unremarkable trace with no failures anywhere still 'completed', which the engine treats as a positive confirmation.",
      ],
      correctIndex: 0,
      modelAnswer:
        "_failure_signal() returns None whenever none of its five signal checks match, so the dict comprehension's walrus filter (`if (sig := _failure_signal(n))`) simply excludes every node, leaving `failures = {}`. `not failures` is True, so run_causal_analysis() returns `_undetermined()` immediately — UNDETERMINED verdict, 0.0 confidence, and an explicit \"No explicit application error ... was present in the trace\" one-liner, without ever computing leaf failures or a causal chain. This is the engine's core never-guess behavior: absence of any explicit signal never becomes a positive verdict.",
    },
    {
      type: "scenario",
      prompt:
        "run_causal_analysis() identifies the origin as the deepest failing node with no failing descendant:\n\nleaf_failures = [nid for nid in fail_ids if not (descendants(nid) & fail_ids)] or list(fail_ids)\n\nGiven a linear call chain A → B → C (A calls B, B calls C) where all three nodes independently carry an explicit failure signal, which node ends up in leaf_failures, and why not A or B?",
      modelAnswer:
        "Only C. descendants(A) = {B, C}, and {B, C} & fail_ids = {B, C} (both fail) — non-empty, so A is EXCLUDED (`not (... & fail_ids)` is False for A). descendants(B) = {C}, and {C} & fail_ids = {C} — non-empty, so B is excluded too. descendants(C) = {} (no children), so {} & fail_ids = {} — empty, meaning `not (empty)` is True, and C IS included. leaf_failures ends up as [C]: the engine's logic is that when a whole chain of calls all show failure signals, the deepest one with no failing node further downstream is the actual origin — A and B failing is presumed to be a consequence of C's failure propagating back up, not three independent root causes.",
    },
    {
      type: "mcq",
      prompt:
        'run_causal_analysis() computes confidence as:\n\nbase = {4: 0.9, 3: 0.75, 2: 0.6, 1: 0.5}[sig["severity"]]\nif len(leaf_failures) > 1:\n    base -= 0.2\nconfidence = round(max(0.0, min(0.95, base)), 2)\nverdict = _verdict(confidence)\n\nGiven the primary leaf failure has severity 4 (a business signal) AND there are 2 leaf_failures total, what verdict does _verdict() assign (recall: >= 0.7 is ROOT_CAUSE_IDENTIFIED, >= 0.4 is LIKELY_CAUSE, else UNDETERMINED)?',
      options: [
        "UNDETERMINED, since any competing leaf failure at all is treated as disqualifying evidence that forces the verdict down regardless of severity.",
        "LIKELY_CAUSE, since 0.9 minus the 0.2 penalty for multiple leaf failures lands at 0.7, which the code treats as just below the ROOT_CAUSE_IDENTIFIED threshold.",
        "ROOT_CAUSE_IDENTIFIED, since base = 0.9 (severity 4) minus 0.2 (two leaf failures) = 0.7, and _verdict()'s check `confidence >= 0.7` is inclusive of exactly 0.7.",
        "ROOT_CAUSE_IDENTIFIED at confidence 0.9, since the len(leaf_failures) > 1 penalty only applies when the SECONDARY leaf failures have LOWER severity than the primary, and severity isn't specified for the second one here.",
      ],
      correctIndex: 2,
      modelAnswer:
        '0.9 (severity 4 base) - 0.2 (competing-leaf-failure penalty, since len(leaf_failures) = 2 > 1) = 0.7. round(max(0.0, min(0.95, 0.7)), 2) = 0.7. _verdict()\'s first check is `if confidence >= 0.7: return "ROOT_CAUSE_IDENTIFIED"` — 0.7 satisfies `>= 0.7` (inclusive), so the verdict is ROOT_CAUSE_IDENTIFIED, not LIKELY_CAUSE.',
    },
    {
      type: "mcq",
      prompt:
        'run_causal_analysis() builds its "hypotheses" list as:\n\n"hypotheses": [\n    {\n        "id": f"h{i + 1}",\n        "cause": ...,\n        "confidence": confidence if nid == primary else round(confidence * 0.5, 2),\n        "evidence": [failures[nid]["detail"]],\n    }\n    for i, nid in enumerate(leaf_failures)\n],\n\nWhat confidence does a NON-primary leaf failure get in this list, relative to the primary\'s confidence?',
      options: [
        "Exactly zero — non-primary leaf failures are listed for transparency but always reported at 0.0 confidence to signal they were ruled out.",
        "The same confidence as the primary — every leaf failure is reported at the identical top-level confidence value, since they were all independently detected as explicit signals.",
        "Half the primary's confidence, via `round(confidence * 0.5, 2)` — a non-primary leaf failure is still surfaced as a real (if less likely) hypothesis rather than being dropped from the list entirely.",
        "A value computed independently per-node from that node's own severity score, unrelated to the primary node's final confidence value.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The ternary is explicit: `confidence if nid == primary else round(confidence * 0.5, 2)`. Every leaf failure other than the primary gets exactly half the primary's already-computed confidence, not its own independently-derived value and not zero — competing failure candidates are kept visible in the hypotheses list, just ranked lower.",
    },
    {
      type: "short",
      prompt:
        'run_causal_analysis()\'s _qualified() helper is:\n\ndef _qualified(svc, op):\n    op = str(op)\n    return op if (op == svc or op.startswith(f"{svc}.") or "." in op) else f"{svc}.{op}"\n\nGiven svc="iwallet" and op="iwallet.queryBalance", what does _qualified() return, and why does the function avoid just always returning f"{svc}.{op}"?',
      modelAnswer:
        'It returns "iwallet.queryBalance" unchanged — op already starts with "iwallet." (matches `op.startswith(f"{svc}.")`), so the condition is True and the function returns `op` as-is rather than concatenating again. The docstring/comment explains the reason directly: "Avoid iwallet.iwallet.queryBalance when op already carries the service prefix." _operation() (which supplies `op`) often pulls a span\'s `name` field, and that name may already be written in "service.method" form by the instrumented service itself — blindly prefixing every op with svc would double up the service name in exactly that common case.',
    },
    {
      type: "scenario",
      prompt:
        'core/evidence.py in its entirety is:\n\ndef extract_evidence(graph, root_service):\n    evidence = []\n    if n in graph["nodes"]:\n        if n.get("service") == root_service:\n            evidence.append({\n                "nodeId" : n["id"],\n                "type" : n["type"],\n                "data" : n.get["data"]\n            })\n    return evidence\n\nName the FIRST error this function would raise if called as extract_evidence(some_graph, "iwallet"), and explain why the loop over `graph["nodes"]` (which the function clearly intends, given the `if n in graph["nodes"]` check) never actually happens.',
      modelAnswer:
        'A NameError, on the very first line of the function body: `if n in graph["nodes"]:` references the name `n`, but `n` is never assigned anywhere in the function — there is no `for n in graph["nodes"]:` loop, only a bare `if n in graph["nodes"]:` check as if `n` already existed. Python raises NameError: name \'n\' is not defined at that line, before the function can even evaluate the membership test, let alone reach the (also broken) `n.get["data"]` call further down, which uses square-bracket subscript syntax on a bound method instead of calling it with `n.get("data")`. Grepping the rest of the app confirms extract_evidence() is never imported or called anywhere else in the codebase — this function is unreachable dead code that would crash immediately if anything ever invoked it.',
    },
    {
      type: "mcq",
      prompt:
        'core/ranking.py in its entirety is:\n\ndef rank_root_causes(nodes):\n    score = Counter()\n    for n in nodes:\n        service = n.get("service")\n        if not service:\n            continue\n        score[service] += 1\n        data = n.get("data", {})\n        if n.get("type") == "DB":\n            score[service] += 3\n        if "ERROR" in str(data):\n            score[service] += 5\n    return score.most_common()\n\nWhich API route or pipeline stage in this codebase calls rank_root_causes()?',
      options: [
        "api/investigate.py's /investigate/rich endpoint, which uses it to build the `steps` list shown in the UI, feeding rank_root_causes()'s per-service Counter tally directly into each step's title, description, and numeric score fields before any of that data reaches the rendered frontend response payload.",
        "core/causal_engine.py's run_causal_analysis(), as a secondary scoring pass that runs after the primary leaf-failure detection to break ties when two leaf failures land on the exact same rounded confidence value, using the Counter tally as a tiebreaker.",
        "None — grepping the codebase for rank_root_causes turns up no callers anywhere outside core/ranking.py itself; it's unused/dead code implementing a simpler, unrelated heuristic (count nodes per service, +3 for DB-type nodes, +5 for the literal substring \"ERROR\" anywhere in a node's stringified data) that has nothing to do with the explicit-signal-priority approach causal_engine.py actually uses.",
        "app/agents/synthesizer.py's _graph_view(), which calls it during the final synthesis stage to decide which nodes in the rendered graph get labeled role='suspect' for the frontend to visually highlight to the user.",
      ],
      correctIndex: 2,
      modelAnswer:
        "rank_root_causes() is never imported or called anywhere else in app/ — it's an orphaned, unused function. Its heuristic is also conceptually different from and cruder than causal_engine.py's actual approach: it scores every service by raw node COUNT plus flat bonuses for being a DB-type node or containing the literal substring \"ERROR\" anywhere in the stringified data, with no concept of explicit business/HTTP/log signal priority, no leaf-failure/descendant analysis, and no confidence formula — none of which is wired into any route or agent in this codebase.",
    },
    {
      type: "scenario",
      prompt:
        'graph_builder.py\'s build_graph() is:\n\ndef build_graph(events, trace_id=None):\n    nodes = {}\n    edges = []\n    for e in events:\n        nodes[e["eventId"]] = {"id": e["eventId"], ...}\n        if e.get("parentEventId"):\n            edges.append({"from": e["parentEventId"], "to": e["eventId"], "type": "CALLS"})\n    if trace_id:\n        logs = get_logs_by_trace(trace_id)\n        for i, log in enumerate(logs):\n            node_id = f"log-{i}"\n            nodes[node_id] = {"id": node_id, "type": "LOG", "service": "loki", "data": log}\n    return {"nodes": list(nodes.values()), "edges": edges}\n\nWhen trace_id IS supplied and Loki logs ARE added, are any edges created connecting those log-derived nodes to the trace\'s RPC/span nodes?',
      modelAnswer:
        'No. The `for i, log in enumerate(logs):` block only ever writes into the `nodes` dict (`nodes[node_id] = {...}`) — it never appends anything to `edges`. Edges are only created inside the FIRST loop, and only for events that carry a parentEventId (i.e. real trace spans with a genuine parent-child relationship). The log-derived nodes end up as floating, disconnected entries in the returned graph — present in `nodes` for anything that iterates the full node list (like causal_engine.py\'s _failure_signal(), which does check LOG-type nodes for error keywords), but with no CALLS edge tying any of them to the span they logically relate to.',
    },
    {
      type: "mcq",
      prompt:
        "api/trace.py's /trace/{trace_id}/graph route is:\n\n@router.get(\"/trace/{trace_id}/graph\")\ndef get_trace_graph(trace_id: str):\n    events = get_trace(trace_id)\n    if not events:\n        raise HTTPException(status_code=404, detail=\"Trace not found\")\n    graph = build_graph(events)\n    return graph\n\nCompared to orchestrator.py's run_pipeline(), which calls `build_graph(events, trace_id=trace_id)`, does this route's graph include any Loki-log-derived nodes?",
      options: [
        "Yes — get_trace(trace_id) internally fetches both spans and logs together before build_graph() ever runs, so build_graph(events) always includes log nodes regardless of whether trace_id is passed to it as a separate argument.",
        "Yes, but only the first 100 log entries are included, per a hardcoded slice inside build_graph()'s log-fetching branch that applies the same way no matter which caller invokes the function or what arguments it passes.",
        "It depends on whether the trace itself contains any spans whose type is already LOG at the source, independent of how build_graph() is called or whether a trace_id argument is supplied to it.",
        "No — this route calls build_graph(events) WITHOUT the trace_id keyword argument, so build_graph's `if trace_id:` guard (trace_id defaults to None) is never true, and the log-fetching branch is skipped entirely — this endpoint's graph only ever contains span/RPC nodes.",
      ],
      correctIndex: 3,
      modelAnswer:
        "build_graph()'s signature is `build_graph(events, trace_id=None)`, and this route calls it as `build_graph(events)` — no trace_id argument, so the parameter stays at its default None inside the function, and `if trace_id:` is False. The log-fetching/log-node-building block is entirely skipped. Only orchestrator.py's call, which explicitly passes `trace_id=trace_id`, produces a graph that includes log-derived nodes; this trace.py endpoint's graph is span-only.",
    },
    {
      type: "mcq",
      prompt:
        'api/investigate.py\'s /investigate/rich route enriches the plain causal-engine result:\n\nrca["summary"] = f"Root cause identified in service: {rca[\'root_cause\'][0]}" if rca.get("root_cause") else "No root cause identified"\nrca["steps"] = [\n    {"stepNumber": i + 1, "title": f"Anomaly in {c[0]}", "description": ..., "score": c[1]}\n    for i, c in enumerate(rca.get("rankedCandidates", []))\n]\n\nGiven causal_engine.py\'s run_causal_analysis() sets "rankedCandidates" to `[[by_id[nid].get("service"), failures[nid]["severity"]] for nid in leaf_failures]`, what does each step\'s "score" field in the /investigate/rich response actually represent?',
      options: [
        "The final rounded confidence value (0.0–0.95) computed for that specific leaf failure, identical to what appears in the hypotheses list's confidence field for that same node elsewhere in the very same JSON response payload.",
        "A normalized 0–1 ranking score computed specifically for the /investigate/rich endpoint's presentation layer, distinct from and independent of anything computed inside run_causal_analysis() itself.",
        "The count of how many pieces of evidence were collected for that candidate during the Investigation agent's step-by-step evidence-gathering phase of the multi-agent pipeline.",
        "A node's raw severity integer (1–4) from _failure_signal()'s signal classification — not a probability or confidence value at all, since rankedCandidates pairs each leaf-failure service with `failures[nid][\"severity\"]`, and that's exactly what c[1] (and therefore \"score\") is here.",
      ],
      correctIndex: 3,
      modelAnswer:
        '"rankedCandidates" is built directly from `failures[nid]["severity"]` for each leaf failure — a small integer (1, 2, 3, or 4) representing signal STRENGTH/KIND priority, not the 0.0–0.95 rounded confidence value that appears elsewhere in the response (e.g. summary.confidence, hypotheses[].confidence). /investigate/rich\'s `"score": c[1]` inherits that severity integer directly and relabels it "score" with no rescaling — a caller reading this field as a probability would be misreading it.',
    },
    {
      type: "scenario",
      prompt:
        'api/investigate.py has both `/investigate` and `/investigate/agentic`:\n\n@router.post("/investigate")\ndef investigate(trace_id: str):\n    events = get_trace(trace_id)\n    graph = build_graph(events, trace_id=trace_id)\n    rca = run_causal_analysis(graph)\n    return rca\n\n@router.post("/investigate/agentic")\ndef investigate_agentic(payload: dict):\n    ...\n    return run_pipeline(trace_id=trace_id, question=question)\n\nName the concrete difference in WORK DONE between these two endpoints for the same trace_id, tying it back to the README\'s "Multi-Agent Pipeline" list of 6 stages.',
      modelAnswer:
        '/investigate runs ONLY stage 1 of the README\'s pipeline — "Causal Engine (Deterministic Pass): Performs a fast, non-agentic scan of the trace graph to find the deepest leaf failure based on explicit signals" — build_graph() then run_causal_analysis(), with zero LLM calls and zero agents involved. /investigate/agentic runs the full pipeline via run_pipeline(): the same deterministic signal pass PLUS the Planner, Investigation, Hypothesis, and Synthesizer agents (each making at least one Anthropic API call) plus the deterministic Invalid State Tracer — i.e. every one of the README\'s 6 stages, not just the first. /investigate exists as the cheap, fast, purely-deterministic first pass; /investigate/agentic is the full multi-agent RCA.',
    },
    {
      type: "mcq",
      prompt:
        'api/remediation.py\'s _job_view() computes:\n\n"force_pushable": job.stage in (PrStage.REJECTED, PrStage.FAILED, PrStage.BLOCKED) and bool(art and art.files),\n\nWhy are PrStage.ESCALATED and PrStage.DUPLICATE deliberately left OUT of the force_pushable stage tuple?',
      options: [
        "Because ESCALATED and DUPLICATE jobs always have empty artifact.files by construction — the pipeline never lets generation proceed far enough to populate files for either stage — so including them in the tuple would be entirely redundant with the `bool(art and art.files)` check that already guards force-pushability anyway.",
        "Because ESCALATED represents cases the pipeline flagged as needing human judgment on WHAT to do (ambiguous fix, out-of-scope edit, missing token) rather than a mechanical build/validation failure that force-pushing bypasses, and DUPLICATE means a PR already exists — force-pushing either doesn't make sense the way force-pushing past a failed sandbox build or a rejected validation does.",
        "Because ESCALATED and DUPLICATE are not real PrStage enum values at all — only REJECTED, FAILED, and BLOCKED exist as terminal failure states in spec.py's PrStage definition, so they simply cannot appear in a stage-membership tuple like this one in the first place.",
        "Because the GitHub API itself inspects the job's internal PrStage value and rejects any write operation originating from a job whose stage is ESCALATED or DUPLICATE, as a security measure enforced entirely server-side and unrelated to this endpoint's own logic.",
      ],
      correctIndex: 1,
      modelAnswer:
        "REJECTED/FAILED/BLOCKED are the outcomes of a mechanical gate failing (validation guard, sandbox build/test, environment/dependency issue) where a human might reasonably say \"I've reviewed this, push it anyway\" — pipeline.py's open_pr() force path exists exactly for these. ESCALATED means the pipeline itself couldn't even decide what the right change is (ambiguous edit, missing GitHub token, type mismatch it couldn't auto-correct) — there's no generated patch worth force-pushing in the same sense. DUPLICATE means an existing PR was already found for this exact canonical fix — force-pushing would be pointless since the intended output already exists. (Both PrStage enum values do exist in spec.py — they're deliberately excluded from this tuple, not absent from the type.)",
    },
    {
      type: "mcq",
      prompt:
        'models/integration.py\'s Integration model is:\n\nimport datetime\n\nclass Integration(BaseModel):\n    id: str\n    organization_id: str\n    name: str\n    type: str\n    status: str\n    create_at: datetime\n    metadata: dict = {}\n    encrypted_credentials: Optional[str] = None\n\nGiven the import is `import datetime` (the MODULE) rather than `from datetime import datetime` (the CLASS), what happens when Pydantic tries to build this model\'s schema, given the field is typed as bare `datetime` (the module)?',
      options: [
        "Pydantic silently treats `create_at: datetime` as `create_at: Any`, accepting any value at runtime without validation, since it can't build a proper type constraint from a module reference.",
        "Pydantic raises an error when building the model, since `datetime` here refers to the imported MODULE object, not a valid type/class it knows how to validate a field against — this is a real type-annotation bug in the file as written.",
        "Pydantic automatically resolves `datetime` to `datetime.datetime` by convention whenever a module of that name is imported, so the model works exactly as if `datetime.datetime` had been written.",
        "This has no effect at model-build time, but the very first time a value is actually assigned to create_at, an AttributeError is raised deep inside Pydantic's validators.",
      ],
      correctIndex: 1,
      modelAnswer:
        'With `import datetime`, the bare name `datetime` inside the class body refers to the imported MODULE, not the `datetime.datetime` class — a module object is not a type Pydantic can build field validation around, so constructing this BaseModel subclass errors out rather than silently accepting anything. This is a genuine bug in the annotation as written (it should be `from datetime import datetime` or the field typed as `datetime.datetime`). Grepping the codebase confirms models/integration.py\'s Integration class is never imported anywhere else in app/ — the actual persisted integration data is handled entirely as plain dicts in storage/integration_store.py, so this broken model is never actually instantiated at runtime.',
    },
    {
      type: "scenario",
      prompt:
        'models/edge.py and models/node.py define:\n\nclass Edge(BaseModel):\n    from_node: str\n    to_node: str\n    type: str\n\nclass Node(BaseModel):\n    id: str\n    traceId: Optional[str]\n    type: str\n    service: Optional[str]\n    timestamp: int\n    data: Dict[str, Any]\n\nCompare these field names against the actual dicts core/graph_builder.py\'s build_graph() constructs (e.g. `{"from": e["parentEventId"], "to": e["eventId"], "type": "CALLS"}` for an edge, and `{"id": ..., "type": ..., "service": ..., "timestamp": ..., "data": ...}` for a node, with no "traceId" key at all). If build_graph()\'s output were ever passed through Edge.model_validate() or Node.model_validate(), would it validate cleanly?',
      modelAnswer:
        'No, not as constructed. Edge\'s fields are `from_node`/`to_node`, but build_graph()\'s edge dicts use the keys `"from"`/`"to"` — Pydantic would either reject the input for missing required fields (from_node, to_node) or, depending on validation mode, ignore the unrecognized `from`/`to` keys and still fail on the missing required ones. Node declares `traceId` as a field (Optional, so its absence alone wouldn\'t fail validation), but the actual node dicts never include a `traceId` key at all — a minor mismatch that happens to be tolerated only because the field is Optional. In practice this question is moot: neither model is ever imported by graph_builder.py, causal_engine.py, or any API route — grepping confirms `app.models` is only ever imported once in the whole codebase, for ConnectRequest in api/investigate.py. Edge and Node are unused type definitions that don\'t match the shape of the plain dicts the rest of the engine actually passes around.',
    },
    {
      type: "mcq",
      prompt:
        "Given that api/investigate.py imports `from app.models.connect_request import ConnectRequest` and uses it as the request body type for POST /integrations/connect, but nothing else in app/ imports from app.models at all (confirmed by grep), what is the accurate description of the app/models/ package's actual role in this codebase?",
      options: [
        "It defines the canonical Pydantic schema for every entity the engine works with — nodes, edges, events, integrations, and connect requests — and every storage/core module validates through these models before persisting or returning data.",
        "It is entirely dead code with no live callers anywhere, including ConnectRequest, which is now hardcoded as a raw dict in api/investigate.py's route signature instead.",
        "Only ConnectRequest is actually wired in, as the FastAPI request-body schema for one endpoint (POST /integrations/connect); Edge, Node, Integration, and Event are unused type definitions that no route, agent, or storage function currently constructs or validates against.",
        "Event is used internally by core/graph_builder.py to validate each incoming trace span before building a graph node from it, even though Edge, Node, and Integration remain unused.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The grep evidence supports exactly one live usage: `from app.models.connect_request import ConnectRequest` in api/investigate.py, where it's the Pydantic type annotation for the /integrations/connect route's payload (`async def connect(payload: ConnectRequest)`), giving FastAPI automatic request validation there. Edge, Node, Integration, and Event are all defined but never imported by any other file in app/ — graph_builder.py, causal_engine.py, and trace_store.py all build and pass around plain Python dicts instead of these Pydantic models, so those four models are effectively unused scaffolding.",
    },
  ],
};

const PAPER_4: ExamPaperSeed = {
  course: "TRACELY",
  week: 1,
  paperNumber: 4,
  title: "RCA Engine — Storage, Discovery, Integrations & Services",
  topics:
    "Postgres access shared with the Next.js/Prisma app, and where the README's storage claims diverge from the actual code (storage/db.py, storage/graph_store.py); credential decryption matching the Node-side encryption scheme (storage/encryption.py, storage/integration_store.py); Loki log fetching via a range query with a line filter (storage/log_store.py); Tempo trace fetching, its retry/hydration wrapper, and a real return-type bug on its exception path (storage/trace_store.py); the integration connect → validate → discover flow and a real bug in its validation step (services/integration_service.py, services/validate_service.py); the background discovery dispatch table and its unhandled-type gap (discovery/discovery_worker.py, discovery/github_discovery.py, discovery/loki_discovery.py); the read-only GitHub client used for invalid-state tracing, distinct from the PR subsystem's write client (integrations/github_client.py); the one-line id-generation helper and where it is/isn't actually used (utils/id.py).",
  sourceFiles: [
    "README.md",
    "app/storage/db.py",
    "app/storage/encryption.py",
    "app/storage/graph_store.py",
    "app/storage/integration_store.py",
    "app/storage/log_store.py",
    "app/storage/trace_store.py",
    "app/discovery/discovery_worker.py",
    "app/discovery/github_discovery.py",
    "app/discovery/loki_discovery.py",
    "app/integrations/github_client.py",
    "app/services/integration_service.py",
    "app/services/validate_service.py",
    "app/utils/id.py",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        'The README\'s Project Structure section describes `app/storage/` as "Adapters for PostgreSQL, Neo4j, and log stores." Based on the actual files under app/storage/ (db.py, encryption.py, graph_store.py, integration_store.py, log_store.py, trace_store.py), is there a Neo4j adapter in this codebase?',
      options: [
        "No — every storage module, including graph_store.py (which persists into the `fact_graph_node` table via the same shared Postgres `pool` from db.py), reads/writes Postgres; grepping app/ for \"neo4j\" turns up no matches anywhere, so the README's mention of a Neo4j adapter doesn't correspond to any code that currently exists.",
        "Yes — graph_store.py connects to Neo4j specifically for graph-shaped Cypher queries against node and relationship data, while db.py handles the relational (non-graph) Postgres tables like integrations and traces separately from the graph layer entirely.",
        "Yes, but only for the invalid-state tracer's caller_from_graph() lookup path — every other graph read or write anywhere else in the codebase goes through the shared Postgres connection pool instead of touching Neo4j at all.",
        "It's ambiguous — encryption.py's AESGCM key derivation logic is shared internally with a separate, unlisted Neo4j client module that lives entirely outside app/storage/ and isn't mentioned anywhere in the README's Project Structure section.",
      ],
      correctIndex: 0,
      modelAnswer:
        'graph_store.py\'s own docstring says it\'s "backed by the Prisma-owned `fact_graph_node` table" and its _create_node() function does a plain `conn.execute("INSERT INTO fact_graph_node ...")` against `app.storage.db`\'s Postgres `pool` — the same pool every other storage module uses. There is no Neo4j client, driver import, or connection string anywhere in app/. The README\'s "PostgreSQL, Neo4j, and log stores" description doesn\'t match the actual implementation as it exists today; the graph is Postgres-backed, not Neo4j-backed.',
    },
    {
      type: "short",
      prompt:
        'storage/db.py\'s module docstring says: "Prisma (in the Next.js app) OWNS the schema and migrations. This module does not create or alter tables — it just connects to the SAME database and reads/writes the existing tables." Given store functions run synchronously inside FastAPI\'s threadpool, why does db.py use a `ConnectionPool(min_size=1, max_size=5, ...)` instead of one shared global connection?',
      modelAnswer:
        "The module's own comment states it directly: \"Store functions are sync and run in FastAPI's threadpool, so a single shared connection would not be thread-safe — use a small pool instead.\" FastAPI dispatches sync route handlers to worker threads, so multiple requests can be executing storage calls concurrently on different threads; a single psycopg connection object isn't safe to use from multiple threads at once. A small pool (1–5 connections) lets each concurrent thread check out its own connection via `pool.connection()`, avoiding cross-thread interference while still bounding how many simultaneous connections the process opens against the shared Postgres database.",
    },
    {
      type: "mcq",
      prompt:
        'storage/encryption.py\'s decrypt() is:\n\ndef decrypt(ciphertext: str) -> str:\n    obj = json.loads(ciphertext)\n    iv = bytes.fromhex(obj["iv"])\n    data = bytes.fromhex(obj["data"])\n    tag = bytes.fromhex(obj["tag"])\n    return AESGCM(_key()).decrypt(iv, data + tag, None).decode("utf-8")\n\nThe module comment notes: "Node keeps the GCM tag separate; AESGCM wants ciphertext||tag." What would happen if the code instead called `AESGCM(_key()).decrypt(iv, data, None)` — passing `data` alone, without appending `tag`?',
      options: [
        "It would still decrypt correctly, since Python's AESGCM implementation stores the authentication tag in a separate internal buffer distinct from the ciphertext bytes and therefore doesn't actually require the two to be concatenated together before the call.",
        "It would decrypt successfully but return an empty string, since the missing tag bytes would be silently interpreted by the underlying C extension as zero-length plaintext padding rather than raising any error.",
        "Decryption would fail — Python's cryptography library's AESGCM.decrypt() expects the ciphertext and the authentication tag concatenated into a single bytes argument; passing ciphertext alone (without the tag Node.js keeps as a separate field) would raise an authentication/decryption error rather than silently succeeding.",
        "It would decrypt successfully but with corrupted output, since AESGCM silently truncates the missing tag bytes from wherever the ciphertext happens to end and fills the gap with null bytes.",
      ],
      correctIndex: 2,
      modelAnswer:
        'The comment explains exactly why the code concatenates: "AESGCM wants ciphertext||tag" as one combined argument, whereas Node.js\'s crypto API (on the encrypting side) keeps the GCM authentication tag as a separate field in its own output. If the Python side passed `data` alone, it would be handing AESGCM.decrypt() an incomplete input missing its required authentication tag — the library would fail the GCM authentication check and raise, not silently produce wrong or empty output.',
    },
    {
      type: "mcq",
      prompt:
        'storage/graph_store.py\'s module docstring explains: "fact_graph_node has columns service / type / metadata — there is no name or source column, so the service name goes in service and source goes inside metadata." Given `create_service_node(service_name="iwallet", source="loki")`, which calls `_create_node(service="iwallet", node_type="service", metadata={"source": "loki"})`, what row does the INSERT actually write?',
      options: [
        'A row with service=\'iwallet\', type=\'service\', and metadata containing {"source": "loki"} as a JSON value — plus a freshly generated uuid4().hex as the id, since the table has no DB-side default for id.',
        "A row with name='iwallet', source='loki', and type='service' — directly matching the three keyword arguments passed to create_service_node, since the SQL column names mirror the Python parameter names one-to-one.",
        "A row with service='iwallet' and type='service' only — metadata is left NULL, since the metadata parameter is only used for repository nodes (created via create_repository_node), never for service nodes.",
        "Two rows: one in fact_graph_node with service='iwallet', and a second in a separate metadata table holding {\"source\": \"loki\"}, joined by a shared node id.",
      ],
      correctIndex: 0,
      modelAnswer:
        'create_service_node("iwallet", "loki") calls `_create_node(service="iwallet", node_type="service", metadata={"source": "loki"})`, which executes `INSERT INTO fact_graph_node (id, service, type, metadata) VALUES (%s, %s, %s, %s)` with `(uuid4().hex, "iwallet", "service", Json({"source": "loki"}))`. Per the docstring\'s own mapping note, this is exactly why source has to be folded into the metadata JSON column rather than getting its own column — the table schema simply doesn\'t have one for it. The id is explicitly generated in Python (`uuid4().hex`) because, per the same docstring, "id has no DB default."',
    },
    {
      type: "scenario",
      prompt:
        'integration_store.py\'s get_integration_credentials() handles three shapes for the raw `credentials` value read from Postgres:\n\nif isinstance(raw, str):\n    return json.loads(decrypt(raw))\nif isinstance(raw, dict):\n    if {"iv", "data", "tag"} <= raw.keys():\n        return json.loads(decrypt(json.dumps(raw)))\n    return raw\n\nGiven a stored `credentials` value of `{"url": "http://loki:3100"}` (a plain dict with no iv/data/tag keys), what does the function return?',
      modelAnswer:
        'The dict itself, unchanged: `{"url": "http://loki:3100"}`. isinstance(raw, str) is False (it\'s a dict), so the first branch is skipped. isinstance(raw, dict) is True, so the second branch runs — but `{"iv", "data", "tag"} <= raw.keys()` (a subset check) is False, since raw\'s only key is "url". That inner `if` is False, so execution falls through to `return raw`, returning the plain dict as-is. The docstring explains this third case: credentials "written by this service" (rather than encrypted by the Next.js side\'s lib/encryption.ts) are stored as a plain object and read back plain, with no decryption needed.',
    },
    {
      type: "mcq",
      prompt:
        'log_store.py\'s get_logs_by_trace() builds its Loki query as a RANGE query with a line filter:\n\nparams = {\n    "query": f\'{{service=~".+"}} |= "{trace_id}"\',\n    "start": str(start_ns),\n    "end": str(end_ns),\n    ...\n}\n\nThe inline comment explains: "traceId lives in the log LINE, not a label — match the TS client: a range query over all services with a line filter. (An instant {traceId=\"...\"} query returns nothing because Loki tags these logs by service.)" Why would a LogQL query like `{traceId="<id>"}` (an instant query using traceId as a label selector) fail to find anything here?',
      options: [
        "Because Loki instant queries are deprecated in recent server versions and always return an empty result set regardless of the label selector used, requiring every client to migrate to range queries even for point-in-time lookups.",
        "Because Loki caps instant queries to the most recent 5 minutes of data relative to the query time, while the trace being searched for during a typical investigation is usually well older than that window by the time anyone actually runs the lookup.",
        "Because trace ids in this system are randomly regenerated on every single log write by the logging library's own instrumentation layer, so no single stable traceId value ever appears consistently across the multiple log lines belonging to the same originating request to match against in the first place.",
        "Because Loki's label selectors only match labels actually attached to the log stream — these log streams are labeled by `service`, not by `traceId`, so a `{traceId=\"...\"}` selector matches zero streams; the trace id only appears inside the free-text LOG LINE content, which is why the code uses a line filter (`|= \"<trace_id>\"`) against a broader `{service=~\".+\"}` label match instead.",
      ],
      correctIndex: 3,
      modelAnswer:
        "The comment states the reason directly: Loki labels these log streams by `service`, not by `traceId` — so a label-selector query like `{traceId=\"...\"}` has nothing to match against; Loki's label index simply doesn't have a traceId label on these streams. The trace id is embedded inside the log line's TEXT content instead, which is exactly why the actual query broadens the label match to every service (`{service=~\".+\"}`) and narrows results with a line-content filter (`|= \"<trace_id>\"`) that scans line text rather than labels.",
    },
    {
      type: "mcq",
      prompt:
        'trace_store.py\'s get_trace() is:\n\ndef get_trace(trace_id: str) -> List[Dict[str, Any]]:\n    url = f"{TEMPO_URL}/api/traces/{trace_id}"\n    try:\n        res = requests.get(url, timeout=5)\n        if res.status_code != 200:\n            return []\n        data = res.json()\n        return normalize_tempo_trace(data)\n    except Exception as e:\n        print(f"[get_trace],")\n\nGiven the function\'s declared return type is `List[Dict[str, Any]]`, what does get_trace() actually return if requests.get() raises an exception (e.g. a connection timeout)?',
      options: [
        "An empty list `[]`, matching the function's declared return type, since the except block is understood by convention to implicitly fall back to the same empty-list default the status-code-check branch above it already returns on failure.",
        "It returns the partial `res` object captured just before the exception was raised, letting the caller inspect whatever partial HTTP response data did manage to come back from the failed request.",
        "The function re-raises the original exception after logging it via the print statement, so every caller must wrap their own call to get_trace() in a try/except block to handle a network failure gracefully.",
        "None — the except block only prints a (notably malformed, trailing-comma) log line and has no explicit `return` statement, so the function falls off the end and Python returns None on this path, silently violating its own declared `List[Dict[str, Any]]` return type.",
      ],
      correctIndex: 3,
      modelAnswer:
        'The except block\'s ONLY statement is `print(f"[get_trace],")` (itself malformed — a trailing comma with no actual exception detail interpolated) — there is no `return` in that branch at all. A Python function with no explicit return on a given code path returns None implicitly, so an exception during the request makes get_trace() return None, not `[]`, silently contradicting its own type hint of `List[Dict[str, Any]]`.',
    },
    {
      type: "scenario",
      prompt:
        "trace_store.py's fetch_trace_with_retry() wraps get_trace() in a retry loop:\n\nfor attempt, delay in enumerate(_HYDRATION_DELAYS):\n    if delay:\n        time.sleep(delay)\n    result = get_trace(trace_id)\n    if result:\n        ...\n        return result\n    ...\nreturn []\n\nGiven get_trace()'s exception path returns None (not []), does fetch_trace_with_retry() crash or behave incorrectly when get_trace() hits an exception on some attempts?",
      modelAnswer:
        "No — `if result:` treats None exactly like an empty list: both are falsy in Python, so `if result:` is False either way, and the loop simply proceeds to the next retry attempt (or, after exhausting _HYDRATION_DELAYS, falls through to the function's own explicit `return []`). fetch_trace_with_retry() never inspects result's type or iterates it directly, so get_trace()'s None-vs-[] inconsistency happens to be harmless HERE. The bug would only surface for a DIFFERENT caller that invoked get_trace() directly (bypassing the retry wrapper) and assumed its declared List[Dict[str, Any]] return type — e.g. code that did `for event in get_trace(trace_id):` would raise TypeError: 'NoneType' object is not iterable on the exception path.",
    },
    {
      type: "short",
      prompt:
        "trace_store.py's normalize_tempo_trace() builds two kinds of events per span:\n\nevents.append({\"eventId\": span_id, ..., \"type\": \"RPC\", ...})\nfor log in span.get(\"logs\", []):\n    events.append({\n        \"eventId\": log.get(\"id\"), ..., \"parentEventId\": span_id, \"type\": \"LOG\", ...\n    })\n\nGiven graph_builder.py's build_graph() creates a CALLS edge for any event with a truthy parentEventId, what edge does a span's log entry end up with in the resulting graph, and how does that differ from the floating Loki-derived LOG nodes build_graph() adds separately when trace_id is passed?",
      modelAnswer:
        'A span-embedded log event carries `"parentEventId": span_id` explicitly, so when this event list reaches build_graph(), its `if e.get("parentEventId"):` check is true and a real CALLS edge is created FROM the parent span TO this log event — it\'s properly connected into the graph. This is different from the separate Loki-fetched LOG nodes build_graph() adds in its own `if trace_id:` block (via log_store.get_logs_by_trace()) — those are built directly as `{"id": f"log-{i}", "type": "LOG", "service": "loki", "data": log}` with no parentEventId field at all, so no edge connects them to anything; they remain floating nodes in the graph, unlike a Tempo span\'s own embedded log entries.',
    },
    {
      type: "mcq",
      prompt:
        'discovery_worker.py\'s dispatch is:\n\ndef run_discovery(integration_id, integration_type, credentials):\n    if integration_type == "loki":\n        discover_loki(integration_id, credentials)\n    elif integration_type == "github":\n        discover_github(integration_id, credentials)\n\nGiven services/integration_service.py\'s connect_integration() accepts ANY `request.integrationType` string and passes it straight through to start_discovery(), what happens if a user connects an integration with integrationType="postgres" (or any type other than "loki"/"github")?',
      options: [
        "run_discovery() raises a ValueError naming the unrecognized integration_type, which propagates back up through the background thread and is logged as a startup failure.",
        "connect_integration() itself validates integrationType against an allow-list before calling start_discovery(), so a type like \"postgres\" would already have been rejected with a 400 error before reaching discovery_worker.py at all.",
        "It falls back to discover_github(), since github is checked last in the elif chain and therefore acts as the default case for any unrecognized type.",
        "The if/elif chain has no matching branch and no else/default case — run_discovery() simply does nothing for that call: no discovery runs, nothing is written to the graph, and no error or log message is produced anywhere. The background thread just exits.",
      ],
      correctIndex: 3,
      modelAnswer:
        'The if/elif chain has exactly two branches and no trailing else — run_discovery() checks "loki" then "github" and, finding neither match for something like "postgres", simply falls through to the end of the function with no action taken and no error raised. Since start_discovery() launches this on a background Thread with no return value or exception surfaced back to the caller, connect_integration() has already returned `{"integrationId": ..., "status": "CONNECTING"}` to the user by this point — the integration is left silently stuck at CONNECTING forever for any type this dispatcher doesn\'t recognize, with no error anywhere to say why.',
    },
    {
      type: "mcq",
      prompt:
        "services/validate_service.py's validate_connection() is:\n\nfrom fastapi import requests\n\nasync def validate_connection(integration_type, credentials):\n    if integration_type == \"loki\":\n        response = requests.get(f\"{credentials['url']}\\\\ready\")\n        if response.status_code != 200:\n            raise Exception(\"Loki is unreachable\")\n    return True\n\nThis module has two distinct bugs: `from fastapi import requests` (fastapi has no `requests` submodule) and the URL built with a literal `\\ready` (a backslash-r escape sequence, not a `/ready` path). Which one actually breaks the module first, and when?",
      options: [
        "The URL bug fires first, at call time, specifically when validate_connection(\"loki\", creds) is actually invoked with an integration_type of \"loki\" and requests.get() is subsequently called against the malformed backslash-escaped URL string, well after the module has already been imported and used successfully by other callers elsewhere.",
        "The import bug fires first — `from fastapi import requests` is a top-level module-level import statement, so it's evaluated the moment this module is FIRST imported by anything (e.g. when services/integration_service.py does `from app.services.validate_service import validate_connection`), raising an ImportError immediately — long before validate_connection() is ever called, and regardless of which integration_type would have been passed.",
        "Neither is actually a bug — fastapi transparently re-exports the entire `requests` library as a convenience submodule for HTTP calls inside route handlers, and `\\ready` is treated as a perfectly valid relative URL path once it passes through Python's f-string interpolation engine at runtime.",
        "Both bugs fire simultaneously at call time, since Python defers all import resolution until the function body that actually references the imported name executes, meaning neither the import statement nor the URL construction does anything before validate_connection() itself runs.",
      ],
      correctIndex: 1,
      modelAnswer:
        'Import statements at module scope execute at IMPORT time, not at call time — as soon as anything does `from app.services.validate_service import validate_connection` (e.g. services/integration_service.py\'s own top-level import), Python tries to resolve `from fastapi import requests` right then. Since the `fastapi` package has no `requests` attribute/submodule, this raises an ImportError before validate_connection() is ever defined as a callable, let alone invoked — the URL\'s `\\ready` bug (which would build a URL like "http://host:3100\\ready" instead of ".../ready", likely causing a connection or 404 failure) never even gets a chance to run.',
    },
    {
      type: "scenario",
      prompt:
        'services/integration_service.py\'s connect_integration() is:\n\nasync def connect_integration(request):\n    integration_id = str(uuid4())\n    integration = {"id": integration_id, "organizationId": request.organizationId, "type": request.integrationType, "status": "CONNECTING"}\n    save_integration(integration)\n    await validate_connection(request.integrationType, request.credentials)\n    start_discovery(integration_id, request.integrationType, request.credentials)\n    return {"integrationId": integration_id, "status": "CONNECTING"}\n\nIf `await validate_connection(...)` raises an exception (e.g. because Loki really is unreachable, per validate_service.py\'s own `raise Exception("Loki is unreachable")`), what state is left behind in Postgres, and does the FastAPI caller ever see the CONNECTING status corrected?',
      modelAnswer:
        'save_integration(integration) already ran and wrote a row with status="CONNECTING" to Postgres BEFORE validate_connection() is awaited. When validate_connection() raises, the exception propagates up out of connect_integration() (there\'s no try/except around the await), so start_discovery() is never reached and the function never returns its own {"integrationId": ..., "status": "CONNECTING"} response — the FastAPI caller instead gets an unhandled-exception error response (a 500) from the /integrations/connect route. But the already-saved integration ROW in Postgres is never touched again — nothing anywhere sets its status to a failed/error state — so that integration is left permanently stuck showing status="CONNECTING" in the database even though the connection attempt actually failed and the client was told about a 500 error, not a "CONNECTING" response.',
    },
    {
      type: "mcq",
      prompt:
        "discovery/github_discovery.py's discover_github() is:\n\ndef discover_github(integration_id, credentials):\n    token = credentials[\"token\"]\n    github = Github(token)\n    user = github.get_user()\n    repos = user.get_repos()\n    for repo in repos:\n        create_repository_node(repo.full_name)\n\nGiven models/connect_request.py's ConnectRequest carries an `organizationId` field that this whole connect flow is described as being scoped to, what actually determines which repos get discovered here?",
      options: [
        "The organizationId passed through from ConnectRequest — discover_github() filters `user.get_repos()` down to only repos belonging to that specific organization before creating nodes for them.",
        "The GitHub token's OWNING ACCOUNT — `github.get_user().get_repos()` returns every repo accessible to whichever account the token belongs to, with no filtering by organization_id anywhere in this function; organization_id isn't referenced by discover_github() at all.",
        "Both — organizationId narrows the initial GitHub API call, and the token further restricts results to only repos the token owner has write access to.",
        "Neither directly — discover_github() queries a separately configured list of allowed repo names stored in the integration's metadata rather than calling the GitHub API's repo-listing endpoint at all.",
      ],
      correctIndex: 1,
      modelAnswer:
        'discover_github() never references integration_id or any organization scoping at all — it only uses `credentials["token"]` to construct a PyGithub client, then calls `github.get_user().get_repos()`, which (per PyGithub\'s API) lists every repository accessible to the account that token authenticates as. Whatever organization_id the ConnectRequest carried plays no role in filtering which repos get discovered here — the actual scope is entirely determined by which account the token belongs to and what that account can see on GitHub.',
    },
    {
      type: "mcq",
      prompt:
        "integrations/github_client.py's fetch_construction_site() tries three code-search queries in a fixed order before giving up:\n\nfor q in (f'\"new {request_type}\" repo:{full}',\n          f'\"{request_type}.builder\" repo:{full}',\n          f'\"{request_type}\" repo:{full}'):\n    items = _search_code(token, q)\n    if not items:\n        continue\n    ...\n    return {...}\n\nWhy try the narrower, more specific queries (looking for `new RequestType` or `RequestType.builder`) BEFORE falling back to the broadest bare `\"RequestType\"` query, rather than just running the broad query once?",
      options: [
        "The GitHub code-search API charges a measurably different rate-limit cost depending on how specific or broad a query's search terms are, so trying the narrow, specific queries first is fundamentally a cost-minimization strategy tied to the API's per-query billing model, not a precision-driven design choice about which results are actually more useful to the caller.",
        "The narrow queries are far more likely to land directly on the actual CONSTRUCTION SITE (where `new RequestType(...)` or a builder call literally appears) on the first hit, whereas the broad bare-name query would also match unrelated files that merely reference the type (imports, field declarations, other methods) — trying specific-to-broad means the function is more likely to return genuinely useful construction-site code before falling back to a noisier match.",
        "GitHub's search API silently caps the broad bare-name query at a much lower maximum result count than it allows for the two more specific queries, so running the broad query first would risk exhausting that cap and missing the real construction site entirely before the function ever gets to try the narrower alternatives.",
        "The three queries are actually issued in parallel via concurrent requests rather than in sequence one after another — the ordering they appear in inside the tuple only determines which result wins in the case where more than one of the three queries happens to return a match at the same time.",
      ],
      correctIndex: 1,
      modelAnswer:
        "A bare `\"RequestType\"` search matches ANY file mentioning that type name at all — imports, field declarations, method parameters, javadoc comments — most of which have nothing to do with where the object is actually CONSTRUCTED. The two more specific queries (`\"new RequestType\"`, `\"RequestType.builder\"`) target the literal syntax of object construction directly, so a hit from either of them is far more likely to be the genuine construction site the invalid-state tracer actually needs. The loop's `if not items: continue` / `return` on first success means the function commits to the FIRST query (in specific-to-broad order) that returns anything fetchable, only falling back to the noisier bare-name search when neither specific pattern turns anything up.",
    },
    {
      type: "mcq",
      prompt:
        "This codebase has two separate GitHub API client modules: integrations/github_client.py (used by agents/invalid_state.py) and agents/pr/github_pr.py (used by the PR pipeline). What is the key functional difference between them, per their own module docstrings?",
      options: [
        "integrations/github_client.py authenticates via a personal access token stored in the integration's credentials, while agents/pr/github_pr.py authenticates via a GitHub App installation token issued specifically for the PR pipeline — otherwise, per both modules' docstrings, their read/write capabilities are described as identical.",
        "integrations/github_client.py is a read-only client for locating/fetching source code (construction sites, class setters) to support deterministic reasoning; agents/pr/github_pr.py is explicitly a WRITE client — resolving the repo, verifying write scope, creating branches, committing files, and opening draft PRs. Per github_pr.py's own docstring: \"Read-only fetching lives in github_client.py.\"",
        "integrations/github_client.py only works against public repositories reachable without special access, while agents/pr/github_pr.py is the only one of the two modules capable of authenticating against and operating on private repositories at all.",
        "They are functionally identical, duplicated only because they were written independently by different contributors at different times — per their docstrings, either module could in principle be used interchangeably for both reading construction sites and opening draft PRs.",
      ],
      correctIndex: 1,
      modelAnswer:
        'github_pr.py\'s own docstring states the split directly: "Minimal GitHub WRITE client for the PR subsystem: resolve the repo, verify the token can write, find a prior PR (idempotency), create a branch, commit a file via the Contents API, and open a DRAFT pull request... Read-only fetching lives in github_client.py." integrations/github_client.py only ever performs GET-style operations (code search, fetching file content via base64-decoded blobs) to support the invalid-state tracer\'s need for real source code — it has no branch-creation, commit, or PR-opening capability at all; that\'s deliberately isolated in the PR subsystem\'s own write-specific client.',
    },
    {
      type: "truefalse",
      prompt:
        "True or False: storage/graph_store.py's _create_node() calls utils/id.py's generate_id() helper to produce each new fact_graph_node row's id.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        'False. graph_store.py imports `from uuid import uuid4` directly and calls `uuid4().hex` inline inside _create_node() — it does not import or call generate_id() from utils/id.py at all, even though generate_id() is itself just `return str(uuid.uuid4())`, functionally near-identical. Grepping the codebase for `generate_id` turns up only its own definition in utils/id.py and no callers anywhere in app/ — it\'s an unused helper that graph_store.py\'s equivalent inline uuid4().hex call duplicates rather than reuses.',
    },
  ],
};

export const WEEK_1_PAPERS: ExamPaperSeed[] = [PAPER_1, PAPER_2, PAPER_3, PAPER_4];
