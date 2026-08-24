import type { ExamPaperSeed } from "../types";

// Week 2 of the self-authored TRACELY module: unlike week-1.ts (which was
// written from tracely-brain's specs/*.md at the conceptual level), every
// question here is grounded directly in tracely-brain's actual source code
// (src/, migrations/) and tests. Real code snippets are copied verbatim
// from the files listed in each paper's sourceFiles, with the exact
// function/variable names the codebase uses. Source repo:
// /Users/adam/VSCodeProjects/tracely-brain (sibling repo, not this one).

const PAPER_1: ExamPaperSeed = {
  course: "TRACELY",
  week: 2,
  paperNumber: 1,
  title: "Tracely — Company Brain & Data Model (Implementation)",
  topics:
    "src/brain: entity/relationship persistence (db.ts, entities.ts), the versioning/corroboration write-path (relationships.ts — created/retained/corroborated/versioned outcomes, deepEqual, race-condition fixes), the read-only query interface (query.ts — queryRelationships' null-coalescing filters, traverse's recursive CTE and its 'both' direction limitation), typed domain errors (errors.ts), controlled vocabularies (types.ts), and the underlying schema (migrations/0001_init.sql — partial unique index, UNIQUE(source_system, source_ref), jsonb attributes, the deferred tenant_id cost).",
  sourceFiles: [
    "src/brain/db.ts",
    "src/brain/entities.ts",
    "src/brain/relationships.ts",
    "src/brain/query.ts",
    "src/brain/errors.ts",
    "src/brain/types.ts",
    "migrations/0001_init.sql",
    "tests/relationships.test.ts",
  ],
  questions: [
    {
      type: "short",
      prompt:
        "src/brain/entities.ts defines a private UUID_RE regex and an isWellFormedUuid() helper, used inside getEntity() before it ever runs a SELECT:\n\nexport async function getEntity(id: string): Promise<Entity> {\n  if (!isWellFormedUuid(id)) {\n    throw new EntityNotFoundError(id);\n  }\n  const [row] = await sql<EntityRow[]>`SELECT * FROM entities WHERE id = ${id}`;\n  if (!row) {\n    throw new EntityNotFoundError(id);\n  }\n  return rowToEntity(row);\n}\n\nWhy does the code check the id's shape before ever touching the database, instead of just letting a malformed id hit Postgres and catching whatever error comes back?",
      modelAnswer:
        "Per the code's own comment: a malformed id string sent straight to Postgres as a `uuid` parameter fails with raw error code 22P02 ('invalid input syntax for type uuid') instead of the module's typed EntityNotFoundError. Validating the shape up front lets a bad id resolve to the exact same typed 'not found' outcome as a well-formed id that simply doesn't exist, so every call site can catch one typed error instead of needing a try/catch around the raw Postgres exception too.",
    },
    {
      type: "scenario",
      prompt:
        "src/brain/relationships.ts's recordRelationshipObservation has four possible outcomes: created, retained, corroborated, versioned. Trace three sequential calls against the SAME (fromEntityId, toEntityId, relationshipType) identity triple:\n1) sourceSystem: 'github', sourceRef: 'sha1', attributes: {criticality: 'high'}\n2) sourceSystem: 'datadog', sourceRef: 'obs1', attributes: {criticality: 'high'} (same payload, different source)\n3) sourceSystem: 'github', sourceRef: 'sha1', attributes: {criticality: 'high'} (identical to call 1, including source)\n\nFor each call, state the returned `action` and exactly what gets written to the relationships / relationship_provenance tables.",
      modelAnswer:
        "1) No current row exists for the triple yet -> action: 'created'. sql.begin inserts a new relationships row and one relationship_provenance row (github/sha1). 2) A current row exists and its attributes are unchanged (deepEqual true against {criticality:'high'}), but (datadog, obs1) has never been recorded against this relationship -> the atomic `INSERT INTO relationship_provenance ... ON CONFLICT (relationship_id, source_system, source_ref) DO NOTHING RETURNING id` actually inserts a row -> action: 'corroborated'. The relationships row itself is untouched; a second provenance row is added. 3) A current row exists, attributes unchanged, but (github, sha1) was already recorded in call 1 -> the same ON CONFLICT DO NOTHING insert has nothing to insert (the row already exists), so `inserted` is undefined -> action: 'retained', a pure no-op with no new writes at all.",
    },
    {
      type: "mcq",
      prompt:
        "recordRelationshipObservation can return action: 'retained' or action: 'corroborated' whenever the current relationship's attributes are unchanged from the new observation. What actually determines which of the two is returned?",
      options: [
        "Whether the new observation's confidence value is higher or lower than the relationship's currently stored confidence — lower is 'retained', higher is 'corroborated'.",
        "Whether the observation arrives inside the same database transaction as the original insert — same transaction is 'retained', a separate transaction is 'corroborated'.",
        "Whether the exact (source_system, source_ref) pair being observed was already recorded as provenance on that relationship — an atomic INSERT ... ON CONFLICT DO NOTHING that inserts nothing means 'retained'; one that actually inserts a row means 'corroborated'.",
        "Whether the relationship's status column is 'current' or 'historical' at the time of the new observation — 'current' rows are always 'retained' and 'historical' rows are always 'corroborated'.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The code runs a single atomic INSERT INTO relationship_provenance ... ON CONFLICT (relationship_id, source_system, source_ref) DO NOTHING RETURNING id. If that insert returns a row, this (source_system, source_ref) pair is new for this relationship -> 'corroborated'. If it returns nothing, that exact pair was already recorded -> 'retained', a no-op. Confidence, transaction boundaries, and status play no part in this particular decision.",
    },
    {
      type: "short",
      prompt:
        "relationships.ts's module header states: \"Identity (same edge vs. a different edge): (from_entity_id, to_entity_id, relationship_type). Payload (what 'changed' means): the attributes jsonb column only... Pure provenance (always additive, never triggers versioning): source_system, source_ref, observed_at, per-observation confidence, notes.\" Why is confidence deliberately excluded from the equality check (deepEqual) that decides whether a new observation counts as a change requiring 'versioned'?",
      modelAnswer:
        "Confidence is a property of each individual observation (provenance), not of the edge's payload itself — a new source reporting the exact same fact at a different confidence is just another data point about how sure that particular source is, not evidence that the underlying fact changed. If confidence participated in the equality check, two sources honestly disagreeing on confidence about the identical fact would spuriously trigger a 'versioned' outcome, wrongly retiring a still-true current edge and fragmenting its history for no real reason.",
    },
    {
      type: "scenario",
      prompt:
        "relationships.ts contains this comment right before the equality check:\n\n\"Compare against the JSON-round-tripped form of the incoming attributes, not the raw object: `attributes` is persisted via JSON.stringify (which drops keys with an explicit `undefined` value), and `current.attributes` was itself read back via JSON.parse. Comparing raw objects would treat e.g. `{a: 1, b: undefined}` as different from the stored `{a: 1}`, even though they serialize identically — a spurious `versioned` outcome.\"\n\nExplain in your own words what bug this protects against, and why the code passes `JSON.parse(JSON.stringify(attributes))` to deepEqual rather than `attributes` directly.",
      modelAnswer:
        "JavaScript's structural equality treats `{a: 1, b: undefined}` as a different object shape from `{a: 1}` (different key sets), but JSON.stringify silently drops keys whose value is `undefined`, so once that object round-trips through the database (stored via JSON.stringify, read back via JSON.parse) it comes back as exactly `{a: 1}`. If a caller passed an incoming attributes object with a stray `undefined` field, comparing it directly against the already-round-tripped `current.attributes` would find a spurious difference and trigger an unnecessary 'versioned' outcome — retiring a current row and creating a new one for no real change. Running the incoming object through the same JSON.stringify/JSON.parse round trip before comparing normalizes both sides to what they'd actually look like once persisted, so the comparison reflects real, persisted differences only.",
    },
    {
      type: "short",
      prompt:
        "The comment on the 'unchanged' branch of recordRelationshipObservation explains a fix: \"The two-statement version left a race window: two concurrent observations of the identical (relationship_id, source_system, source_ref) could both see 'not found' and both attempt the INSERT, with the second hitting the UNIQUE constraint and throwing a raw Postgres unique-violation instead of resolving to 'retained'.\" Explain the race this atomic single-statement form (INSERT ... ON CONFLICT DO NOTHING) closes.",
      modelAnswer:
        "Under a two-statement approach (SELECT to check if this provenance row already exists, then INSERT if not), two concurrent calls for the same (relationship_id, source_system, source_ref) could both run their SELECT before either has inserted anything, both see 'not found', and both then attempt the INSERT — the first succeeds, and the second throws an unhandled Postgres unique-violation error instead of gracefully resolving to 'retained'. The atomic form has Postgres itself arbitrate: only one INSERT can win the UNIQUE constraint, and the loser's ON CONFLICT DO NOTHING clause makes it return no row instead of throwing, which the code then correctly interprets as 'retained'.",
    },
    {
      type: "mcq",
      prompt:
        "In the versioning branch of recordRelationshipObservation, the old current row is marked historical BEFORE the new current row is inserted:\n\nawait tx`UPDATE relationships SET status = 'historical', valid_until = now() WHERE id = ${current.id}`;\nconst [newRow] = await tx<RelationshipRow[]>`INSERT INTO relationships (...) VALUES (...) RETURNING *`;\n\nWhy must the UPDATE happen strictly before the INSERT?",
      options: [
        "Marking historical first lets the new row's superseded_by column immediately reference the old row's id, which is only possible once the old row's own status has already changed.",
        "Postgres requires every UPDATE inside a transaction to execute before any INSERT in the same transaction, or the whole transaction is automatically rolled back.",
        "relationship_provenance's foreign key on relationship_id must resolve against the old row before the new row is created, or the provenance insert fails.",
        "The partial unique index relationships_current_identity_uniq permits at most one 'current' row per (from_entity_id, to_entity_id, relationship_type) triple — inserting the new current row before retiring the old one would violate that index.",
      ],
      correctIndex: 3,
      modelAnswer:
        "migrations/0001_init.sql creates relationships_current_identity_uniq as a partial unique index WHERE status = 'current' over (from_entity_id, to_entity_id, relationship_type). If the new current row were inserted while the old one was still status = 'current', both rows would satisfy that partial index's uniqueness scope simultaneously and the insert would fail the constraint — so the old row has to be retired first to free up the identity triple for the new current row.",
    },
    {
      type: "short",
      prompt:
        "supersedeRelationship is described in its doc comment as an \"explicit escape hatch for a caller that already knows two different-identity edges represent the same functional slot over time (e.g. a service was renamed, so the edge's to_entity_id changes but it's conceptually 'the same' relationship).\" Its UPDATE guard reads:\n\nconst [retired] = await tx`UPDATE relationships SET status = 'historical', valid_until = now() WHERE id = ${oldRelationship.id} AND status = 'current' RETURNING id`;\nif (!retired) { throw new RelationshipNotFoundError(oldRelationship.id); }\n\nWhat does supersedeRelationship let a caller do that recordRelationshipObservation cannot, and what race does the `AND status = 'current'` guard close?",
      modelAnswer:
        "recordRelationshipObservation only ever versions an edge when the identity triple (from, to, type) stays exactly the same but attributes changed — it has no way to say 'this old edge and this new edge are the same conceptual thing even though their to_entity_id differs.' supersedeRelationship is the explicit hatch for exactly that case, letting the caller supply a new toEntityId/relationshipType/attributes that don't have to match the old row's identity. The `AND status = 'current'` guard closes a concurrent-writer race: two transactions could both pass an initial SELECT seeing the row as 'current', and because their inserts may target different new identity triples the partial unique index never fires to stop the second one — without the guard, the second transaction would silently re-retire an already-historical row, overwriting its valid_until/superseded_by and orphaning the first transaction's new row from the supersession chain. With the guard, an UPDATE affecting zero rows means the row was already retired, and the function throws instead of proceeding.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: updateRelationshipConfidence(id, confidence, reason) in src/brain/relationships.ts stores the `reason` string in a database column, so a caller can later query why a relationship's confidence was manually adjusted.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. The function signature accepts `reason` but its body opens with `void reason; // accepted for the caller's bookkeeping only`, and the doc comment explains: \"there is no schema column to persist it against without inventing one beyond Task 2's DDL, so it is intentionally not persisted here.\" The parameter exists for the caller's own use, not because the database stores it.",
    },
    {
      type: "mcq",
      prompt:
        "updateRelationshipConfidence's UPDATE statement is:\n\nUPDATE relationships SET confidence = ${confidence} WHERE id = ${id} AND status = 'current' RETURNING *\n\nWhat does the `AND status = 'current'` guard protect against?",
      options: [
        "It prevents the function from silently mutating a historical (already-retired) row's confidence, which the code's own comment calls corrupting 'what should be an immutable audit record.'",
        "It prevents the function from ever updating a relationship whose confidence is already NULL, since NULL confidence values are meant to stay permanently unset.",
        "It prevents two concurrent calls to updateRelationshipConfidence on the same relationship id from both succeeding, by making the second call's WHERE clause match zero rows.",
        "It prevents the function from being called on a relationship that has never received any provenance, since a provenance-less relationship has no 'current' status.",
      ],
      correctIndex: 0,
      modelAnswer:
        "The doc comment says it directly: \"without it, this would happily mutate a historical (retired) row's confidence, silently corrupting what should be an immutable audit record.\" A zero-row update (id doesn't exist, or resolves to a historical row) throws RelationshipNotFoundError instead of silently no-op'ing.",
    },
    {
      type: "short",
      prompt:
        "query.ts's traverse() has this comment on its maxDepth parameter check:\n\n\"maxDepth is REQUIRED but not otherwise validated by the type system — a caller passing 0 or a negative number would still reach the recursive CTE below, where only the *recursive* term checks `depth < maxDepth`; the seed term has no such check, so 0/negative would still return one hop instead of the empty result the caller asked for.\"\n\nWhy does traverse() need `if (!Number.isInteger(maxDepth) || maxDepth < 1) { return { entities: [], relationships: [] }; }` in application code, given the recursive CTE already has a depth check?",
      modelAnswer:
        "The recursive CTE's depth check (`w.depth < ${maxDepth}`) only appears in the recursive term, which governs whether the walk continues past its first hop — it never runs for the seed (base case) term, which unconditionally selects every direct edge from the start entity at depth 1 regardless of what maxDepth is. So a caller passing maxDepth: 0 (or a negative number) would still get one hop of results straight out of the SQL, not the empty result that value should logically mean. The application-level guard short-circuits before the query even runs, so 'not a positive integer' actually produces the empty TraverseResult a caller would expect.",
    },
    {
      type: "scenario",
      prompt:
        "traverse's TraverseParams doc comment gives this example for direction: 'both':\n\n\"Given `ServiceA --DEPENDS_ON--> DB <--DEPENDS_ON-- ServiceB`, `traverse({ startEntityId: ServiceA.id, direction: 'both' })` returns the `ServiceA -> DB` edge but never reaches `ServiceB`, because there is no all-outgoing or all-incoming path from A to B — only a path that goes out then back in, which this union does not follow.\"\n\nExplain, referencing walk_out and walk_in, why this is true even though 'both' unions two separate recursive walks.",
      modelAnswer:
        "The 'both' implementation runs two independent named CTEs from the same start node — walk_out, which only ever follows edges forward (from_entity_id -> to_entity_id), and walk_in, which only ever follows edges backward (to_entity_id -> from_entity_id) — then UNION ALLs their results together at the end. walk_out from ServiceA finds ServiceA -> DB and stops there, because DB has no outgoing DEPENDS_ON edge to follow further forward. walk_in from ServiceA finds nothing, because ServiceA has no incoming edges in this example. Neither walk ever switches direction mid-path (there's no code path where walk_out's recursive term joins against a backward edge, or vice versa), so reaching ServiceB — which requires going forward from A to DB and then backward from DB to ServiceB — is never expressed by either straight walk. The union of two straight walks is not the same as true undirected reachability.",
    },
    {
      type: "short",
      prompt:
        "query.ts's comment on typesFilter says: \"Bun.sql needs an explicit Postgres array type via `sql.array(...)` — a plain JS array interpolated as `${arr}` is sent as a comma-joined string, not a Postgres array literal, and fails with 'malformed array literal' (verified empirically against a live Postgres instance).\" Why can't `r.relationship_type = ANY(${types})` just interpolate the JS array of relationship type strings directly?",
      modelAnswer:
        "Bun's sql tagged-template driver serializes an interpolated plain JS array as a single comma-joined string value (e.g. the text 'CALLS,DEPENDS_ON'), not as a genuine Postgres array literal (e.g. '{CALLS,DEPENDS_ON}'). Postgres's ANY(...) operator expects an actual array type on its right-hand side, so handing it a plain string parameter fails with a malformed array literal error rather than matching against each element. sql.array(types, 'text') explicitly tells the driver to serialize the value as a Postgres text[] array instead, which ANY(...) can correctly iterate.",
    },
    {
      type: "mcq",
      prompt:
        "Both entities.ts's isDomain() and relationships.ts's isRelationshipType() run a check like `(Domain as readonly string[]).includes(value)` before any write — even though migrations/0001_init.sql already has CHECK (domain IN (...)) and CHECK (relationship_type IN (...)) constraints enforcing the identical vocabulary in the database. Why does the application code duplicate the check?",
      options: [
        "Postgres CHECK constraints on a text column with more than 15 allowed values are silently ignored by the query planner, so the migration's constraint provides no actual protection on its own.",
        "It's defense in depth — entities.ts's own comment calls it exactly that: catching an invalid value with a clear typed error (e.g. InvalidRelationshipTypeError) before it ever reaches Postgres, rather than relying solely on a raw CHECK-constraint violation surfacing as a generic database error.",
        "The application-level check exists purely so TypeScript can narrow the value to the Domain/RelationshipType union at compile time — it has no effect once the code is actually compiled and running.",
        "The CHECK constraints only fire on INSERT statements, not UPDATE statements, so the application check exists specifically to protect UPDATE-only paths like updateRelationshipConfidence.",
      ],
      correctIndex: 1,
      modelAnswer:
        "entities.ts's upsertEntity comment says it directly: \"Defense in depth alongside the DB CHECK constraint (see migrations/0001_init.sql).\" Both layers enforce the same controlled vocabulary (types.ts: \"the literal values here must match the Postgres CHECK constraints ... exactly\"), but the app-level guard turns an invalid value into a specific, catchable, typed error (InvalidRelationshipTypeError / a thrown Error naming the bad domain) instead of letting it fail as a raw, less-actionable Postgres constraint-violation exception.",
    },
    {
      type: "short",
      prompt:
        "migrations/0001_init.sql defines:\n\nCREATE UNIQUE INDEX relationships_current_identity_uniq\n  ON relationships (from_entity_id, to_entity_id, relationship_type)\n  WHERE status = 'current';\n\nWhy is this a *partial* unique index (scoped `WHERE status = 'current'`) instead of a plain unique index over the whole table?",
      modelAnswer:
        "Historical rows are meant to accumulate on purpose — every past version of a given (from, to, type) triple stays in the relationships table forever as audit history (that's the entire point of the versioning algorithm in relationships.ts). A plain, table-wide unique index over (from_entity_id, to_entity_id, relationship_type) would make it impossible to ever store more than one row for that triple at all, which would break versioning outright. Scoping the index to WHERE status = 'current' enforces the actual invariant the schema needs — at most one *current* row per identity triple — while leaving any number of historical rows for that same triple unrestricted.",
    },
    {
      type: "scenario",
      prompt:
        "The comment above relationships_current_identity_uniq in migrations/0001_init.sql says: \"this schema is single-tenant by design... Adding a tenant_id later is the single most expensive future migration this schema implies: it would require altering this unique index (and the entities table's UNIQUE (source_system, source_ref) key) to include tenant_id, plus updating every query predicate in query.ts/relationships.ts that currently assumes a single implicit tenant.\" Name the two schema constraints this comment says would need to change, and explain why adding tenant_id isn't just a matter of adding a new column.",
      modelAnswer:
        "The two constraints named are relationships_current_identity_uniq (currently over from_entity_id, to_entity_id, relationship_type) and entities' UNIQUE (source_system, source_ref) key — both would need tenant_id folded into their column list, since as written they'd otherwise treat the same (from,to,type) or (source_system,source_ref) as globally unique across every tenant, when it should only be unique within one tenant. Beyond the schema change itself, every query predicate throughout query.ts and relationships.ts that currently has no tenant filter at all (queryRelationships, traverse, findEntities, etc.) would need a tenant_id predicate added, since none of the current SQL scopes results by tenant — a column addition alone wouldn't fix any of the actual query logic that assumes single-tenant data.",
    },
    {
      type: "short",
      prompt:
        "entities.ts, relationships.ts, and query.ts each carry a near-identical comment: \"Bun's sql driver returns jsonb columns as raw JSON text, not a parsed object — verified empirically against a live Postgres instance.\" What would go wrong if a row-mapping function like rowToEntity forgot to call JSON.parse(row.attributes) and just assigned the raw string to attributes?",
      modelAnswer:
        "Entity.attributes is typed as Record<string, unknown> — every caller that reads it (e.g. search_code's `(file.attributes as {sha?: string}).sha`, or deepEqual's structural comparison in relationships.ts) expects to do object-shaped access or comparison on it. If attributes were left as the raw JSON string Bun's driver actually returns, those callers would be operating on a string instead of an object — property access like `.sha` would return undefined instead of throwing (since TypeScript's cast would mask the mismatch at compile time), and any deep-equality or JSON-shape logic downstream would silently behave incorrectly rather than failing loudly.",
    },
    {
      type: "mcq",
      prompt:
        "findEntities' WHERE clause reads:\n\nWHERE (${domainFilter}::text IS NULL OR domain = ${domainFilter})\n  AND (${entityTypeFilter}::text IS NULL OR entity_type = ${entityTypeFilter})\n\nqueryRelationships uses the same pattern for several of its own optional filters. What does this SQL pattern accomplish, and why is it preferable to building a different SQL string in JS depending on which filters were supplied?",
      options: [
        "It forces Postgres to always run a full sequential scan on the table regardless of which filters are supplied, trading query performance for simpler code.",
        "It exists purely to satisfy a Bun sql driver requirement that every tagged-template parameter be explicitly cast with `::text`, and has no effect on which rows are actually returned.",
        "It lets one single parameterized query serve both the 'filter provided' and 'filter omitted' cases — when a filter param is null, its OR branch always evaluates true and that predicate becomes a no-op — without string-concatenating a different SQL statement for every combination of optional filters.",
        "It deduplicates rows that would otherwise appear twice whenever both the domain and entityType filters happen to resolve to the same underlying value.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Passing `null` for an omitted filter makes its `... IS NULL OR ...` branch always true, so that predicate contributes nothing to the WHERE clause's result — while passing an actual value makes the `IS NULL` branch false and falls through to the real equality check. One fixed parameterized query string handles every combination of filters being present or absent, instead of the code needing to conditionally build a different SQL string (and manage a different parameter list) per combination — which is both more error-prone and harder to keep in sync as filters are added.",
    },
    {
      type: "short",
      prompt:
        "migrations/0001_init.sql declares `UNIQUE (source_system, source_ref)` on entities, and upsertEntity writes:\n\nON CONFLICT (source_system, source_ref) DO UPDATE SET\n  domain = EXCLUDED.domain, entity_type = EXCLUDED.entity_type,\n  name = EXCLUDED.name, attributes = EXCLUDED.attributes, updated_at = now()\n\nWhy is an entity's identity keyed on (source_system, source_ref) rather than, say, (domain, name)? What actually happens to a stored row if it's re-upserted with the same source_ref but a changed `name`?",
      modelAnswer:
        "(source_system, source_ref) is the durable back-reference to exactly where a fact came from (e.g. 'github:acme/repo:src/index.ts') and stays stable even if a human-facing name or domain classification changes — matching FR-7's provenance-back-reference requirement. Keying on (domain, name) instead would be fragile: a renamed file or service would look like a brand-new entity rather than an update to the existing one, silently duplicating history. Re-upserting the same (source_system, source_ref) with a new name updates the existing row in place — domain, entity_type, name, attributes, and updated_at are all overwritten via ON CONFLICT DO UPDATE, but the row's id (and hence anything already pointing at it via relationships) is preserved.",
    },
    {
      type: "scenario",
      prompt:
        "The 'created' branch of recordRelationshipObservation does this:\n\nconst relationship = await sql.begin(async (tx) => {\n  const [row] = await tx<RelationshipRow[]>`INSERT INTO relationships (...) VALUES (...) RETURNING *`;\n  await insertProvenance(tx, { relationshipId: row.id, sourceSystem: obs.sourceSystem, ... });\n  return rowToRelationship(row);\n});\n\nWhy are the relationship insert and its first provenance insert wrapped in sql.begin(...) rather than issued as two separate, unwrapped `sql\\`...\\`` calls?",
      modelAnswer:
        "sql.begin wraps both inserts in a single database transaction, so they commit or roll back together. Without that, if the process crashed (or a concurrent reader queried the table) between the two inserts, it would be possible to observe a relationship row with zero provenance rows behind it — breaking the implicit invariant that every stored relationship traces back to at least one source observation. Wrapping them atomically guarantees a relationship never exists in the database without its first piece of provenance, and vice versa.",
    },
  ],
};

const PAPER_2: ExamPaperSeed = {
  course: "TRACELY",
  week: 2,
  paperNumber: 2,
  title: "Tracely — Investigation Agent & State Machine (Implementation)",
  topics:
    "src/agent: the hypothesis lifecycle (hypotheses.ts — confidenceFrom's evidence-count scoring, CONFIRMED/REFUTED terminal rules), the investigation entrypoint (investigate.ts — SYSTEM_PROMPT, toolRunner, sessionId registration, outcome selection), model selection (model.ts), the tool-calling layer (tools.ts — beginToolCall's microtask-based concurrency grouping, the withStepId citation convention, query_brain's search/traverse modes, the NOT_IMPLEMENTED stub tools); src/state-machine (transition.ts's TRANSITIONS table and REOPEN_LIMIT); src/investigations (the persistent Investigation record); src/timeline (build.ts's pure ToolCallRecord -> TimelineStep transform, server.ts's routes).",
  sourceFiles: [
    "src/agent/hypotheses.ts",
    "src/agent/investigate.ts",
    "src/agent/model.ts",
    "src/agent/tools.ts",
    "src/agent/types.ts",
    "src/state-machine/transition.ts",
    "src/state-machine/types.ts",
    "src/investigations/db.ts",
    "src/investigations/types.ts",
    "src/timeline/build.ts",
    "src/timeline/types.ts",
    "src/timeline/server.ts",
  ],
  questions: [
    {
      type: "short",
      prompt:
        "hypotheses.ts defines:\n\nexport const CONFIRMATION_THRESHOLD = 0.75;\nexport const REFUTATION_THRESHOLD = 0.75;\n\nfunction confidenceFrom(evidenceCount: number): number {\n  const INCREMENT = 0.2;\n  return Math.min(1, evidenceCount * INCREMENT);\n}\n\nThe code comments call 0.75 \"a deliberately conservative placeholder value, not a fabricated 'real' number.\" Why is that distinction made explicit, and why does it take 4 pieces of evidence (4 * 0.2 = 0.8 >= 0.75) to cross the threshold rather than fewer?",
      modelAnswer:
        "Per CLAUDE.md's 'no invented numbers' rule, any figure that looks like a calibrated measurement must actually come from measurement — and no calibration data exists yet (the comment points to specs/11-benchmark.md as the source that would eventually produce real numbers). Rather than presenting 0.75 as a scientifically-derived cutoff, the code documents it plainly as a placeholder and uses the simplest possible scoring rule (a fixed per-item increment) instead of a weighted model that would imply more rigor than exists. Requiring 4 items to cross 0.75 is a deliberate structural choice, independent of the exact threshold value: it guarantees a single tool call's evidence can never alone confirm a hypothesis, which is a direct enforcement of 'never fabricate a root cause.'",
    },
    {
      type: "mcq",
      prompt:
        "hypotheses.ts's addSupportingEvidence begins:\n\nif (hypothesis.status === \"REFUTED\") {\n  return hypothesis;\n}\n\nWhat does calling addSupportingEvidence on an already-REFUTED hypothesis actually do?",
      options: [
        "It re-evaluates confidenceFrom against the combined evidence and can move status back to INVESTIGATING if the new evidence outweighs the prior contradicting evidence.",
        "It throws an error, since attaching new supporting evidence to a refuted hypothesis is treated as a caller programming mistake.",
        "It returns the hypothesis completely unchanged — REFUTED is terminal here; the lifecycle in investigate.ts is responsible for proposing a brand-new replacement hypothesis instead of resurrecting the old one.",
        "It appends the evidence to supportingEvidence as normal but caps the resulting confidence at whatever value it already held, without changing status.",
      ],
      correctIndex: 2,
      modelAnswer:
        "The function's very first check short-circuits and returns the hypothesis unmodified whenever status is already REFUTED — the comment says it plainly: 'a refuted hypothesis never resurrects from new evidence. The lifecycle (investigate.ts) is responsible for proposing a *replacement* hypothesis (FR-20); this function only guards its own invariant.'",
    },
    {
      type: "scenario",
      prompt:
        "hypotheses.ts computes status as:\n\nconst status: Hypothesis[\"status\"] =\n  confidence >= CONFIRMATION_THRESHOLD &&\n  hypothesis.contradictingEvidence.length === 0\n    ? \"CONFIRMED\"\n    : \"INVESTIGATING\";\n\nA hypothesis has 5 pieces of supporting evidence (confidence 1.0, well above 0.75) and exactly 1 piece of contradicting evidence — not enough on its own to refute it (contradictionWeight 0.2, below REFUTATION_THRESHOLD). What status is the hypothesis, and why, even though its raw confidence number alone clears CONFIRMATION_THRESHOLD?",
      modelAnswer:
        "It stays INVESTIGATING. addSupportingEvidence's CONFIRMED branch requires BOTH confidence >= CONFIRMATION_THRESHOLD AND contradictingEvidence.length === 0 — any contradicting evidence at all, even a single weak piece nowhere near REFUTATION_THRESHOLD, blocks CONFIRMED outright. This is a direct enforcement of 'never fabricate a root cause': a hypothesis with known, unresolved counter-evidence can't be declared confirmed just because its supporting count happens to be high.",
    },
    {
      type: "short",
      prompt:
        "types.ts's doc comment on Hypothesis.confidence says: \"Reflects accumulated supporting evidence only (via addSupportingEvidence). Contradicting evidence affects status but not confidence.\" Looking at addContradictingEvidence's still-INVESTIGATING branch (`return { ...hypothesis, contradictingEvidence, status: \"INVESTIGATING\" }`), why does adding contradicting evidence never modify the confidence field?",
      modelAnswer:
        "confidence is defined purely as a function of accumulated supporting evidence — it's meant to answer 'how much support do we have,' a separate question from 'is any of that support contradicted.' Contradicting evidence's only job is to gate whether a hypothesis is *allowed* to become CONFIRMED (via the contradictingEvidence.length === 0 check in addSupportingEvidence) or to force it to REFUTED once contradictionWeight crosses REFUTATION_THRESHOLD — never to lower a numeric score. Keeping the two signals separate and independently inspectable is more informative than blending them into one number that would otherwise hide whether a drop in confidence-like value came from weak support or from active contradiction.",
    },
    {
      type: "mcq",
      prompt:
        "When addContradictingEvidence's contradictionWeight crosses REFUTATION_THRESHOLD, it returns:\n\nreturn { ...hypothesis, contradictingEvidence, status: \"REFUTED\" };\n\nWhat happens to that hypothesis's `confidence` field at the exact moment it becomes REFUTED?",
      options: [
        "It is reset to 0, since a refuted hypothesis should never report having any residual confidence.",
        "It is recalculated as 1 minus the contradiction weight, producing a symmetric 'how refuted' score in the same field.",
        "It is set to null to signal that confidence is no longer a meaningful value once a hypothesis is REFUTED.",
        "It is left exactly as it was before refutation — the object spread `{...hypothesis, ...}` carries the prior confidence value forward unchanged, since only contradictingEvidence and status are explicitly overwritten.",
      ],
      correctIndex: 3,
      modelAnswer:
        "The return statement spreads the existing hypothesis object and only explicitly overwrites contradictingEvidence and status — confidence is never mentioned, so it passes through the spread untouched at whatever value it last held from addSupportingEvidence. A REFUTED hypothesis can therefore still report a high confidence number, which is exactly the point of keeping confidence and status as independent signals per types.ts's comment.",
    },
    {
      type: "short",
      prompt:
        "investigate.ts's SYSTEM_PROMPT tells the model: \"You never set a hypothesis's status or confidence directly — update_hypothesis's result tells you the current status after our system recomputes it from accumulated evidence.\" What in the actual code (not just the prompt) makes this true — i.e. what would the model literally have to do to set a status or confidence value itself, and why can't it?",
      modelAnswer:
        "tools.ts's update_hypothesis tool has a Zod inputSchema of `{ hypothesisId, direction: 'supporting'|'contradicting', description, toolSource, stepId? }` — there is no status or confidence field in that schema at all, so the model literally has no parameter through which to supply either value even if it tried. Status and confidence are only ever produced inside the tool's run() handler, by calling addSupportingEvidence/addContradictingEvidence in hypotheses.ts after the model's direction/description input has been applied — the model only ever reads the resulting `hypothesis ${updated.id} is now ${updated.status} (confidence ${updated.confidence.toFixed(2)})` string back, it never writes those fields.",
    },
    {
      type: "scenario",
      prompt:
        "tools.ts's beginToolCall:\n\nfunction beginToolCall(state: InvestigationState): ToolCallHandle {\n  if (!state.batchOpen) {\n    state.batchCounter += 1;\n    state.batchOpen = true;\n    queueMicrotask(() => { state.batchOpen = false; });\n  }\n  return { id: crypto.randomUUID(), concurrencyGroup: `batch-${state.batchCounter}` };\n}\n\nExplain why this must be called synchronously, at the very top of an evidence tool's run() handler, before any `await`. What would break if it were instead called after an internal await, e.g. after `await findEntities(...)`?",
      modelAnswer:
        "The comment explains that the Tool Runner (BetaToolRunner) dispatches every same-turn tool_use block's run() handler synchronously, back to back, via Promise.all(toolUseBlocks.map(async (toolUse) => {...})) — every call in one turn starts executing before any of them can suspend past its own first await. Calling beginToolCall in that synchronous window is exactly what lets batchOpen/batchCounter track real same-turn concurrency: the first call in a burst opens the batch and schedules a microtask to close it, and every other call from the same synchronous burst runs before that microtask fires, so they all see batchOpen === true and share the batch id. If beginToolCall instead ran after an internal await, calls would be grouped by whichever unrelated async operation (e.g. a database query) happened to resolve first, not by which turn actually issued the calls — silently corrupting the concurrencyGroup field's meaning for anything downstream, like the timeline UI, that relies on it to show which steps were truly parallel.",
    },
    {
      type: "short",
      prompt:
        "tools.ts defines `function withStepId(id: string, body: string): string { return \\`STEP_ID: ${id}\\n${body}\\`; }`, and every evidence tool's result is wrapped in it. update_hypothesis's `stepId` parameter is described as citing 'the exact prior query_brain / search_code / query_database / search_logs call this evidence came from.' Describe the full loop from a tool call producing a STEP_ID to update_hypothesis using it, and what Evidence.raw ends up being if the model never cites a stepId.",
      modelAnswer:
        "Every evidence tool (query_brain, search_code, query_database, search_logs) returns its result text prefixed with `STEP_ID: <id>\\n` via withStepId(call.id, ...). The model can read that literal id back out of the tool result text it receives, and later pass it as update_hypothesis's optional stepId argument. Inside update_hypothesis's handler, `state.toolCalls.findIndex((call) => call.id === input.stepId)` looks up a matching ToolCallRecord; if found, that record's real `result` is attached as the new Evidence's `raw` field (`raw: citedStep ? citedStep.result : null`). If the model never supplies a stepId, or supplies one that doesn't match any recorded call, citedStep is undefined and raw is simply set to null — the evidence still gets recorded and counted toward confidence, but with no underlying tool result attached for later inspection.",
    },
    {
      type: "mcq",
      prompt:
        "Per query_brain's own description string in tools.ts, when should the agent use 'search' mode versus 'traverse' mode?",
      options: [
        "'search' walks relationships outward from a known entity id; 'traverse' finds entities by domain/type — the modes are simply named the opposite of what their descriptions suggest at first glance.",
        "'traverse' should always be called first in every investigation, since it establishes the maxDepth bound that later 'search' calls are validated against.",
        "'search' is scoped only to the 'Operational Knowledge' domain, and 'traverse' is scoped to every other domain — the two modes are domain-restricted, not method-restricted.",
        "'search' finds entities by domain/type and is how an investigation bootstraps into the Brain when no specific entity id is known yet; 'traverse' walks relationships outward from a known entity id, once a prior search has already found one.",
      ],
      correctIndex: 3,
      modelAnswer:
        "The tool's description text says it directly: \"'search' (find entities by domain/type — use this first, when you don't yet know a specific entity id; this is how an investigation bootstraps from a problem description into the Brain at all) and 'traverse' (walk relationships outward from a known entity id, once search has found one).\"",
    },
    {
      type: "scenario",
      prompt:
        "search_code's implementation includes:\n\nconst sha = (file.attributes as { sha?: string }).sha;\nif (!sha) continue;\n\nWhat does search_code do with a matched File entity that has no `sha` in its attributes, and under what real circumstance (based on github/sync.ts's upsertEntity call) could that actually happen in this codebase today?",
      modelAnswer:
        "That file is silently skipped via `continue` — it just doesn't appear in the results array returned to the model, with no error or warning surfaced. In the normal GitHub sync flow, this should never actually fire: every File entity written by github/sync.ts's syncGitHubRepository always calls upsertEntity with `attributes: { sha: file.sha }`, so a synced File entity always has a sha. The guard is defensive against a File entity created through some other path (e.g. a manually inserted entity, or one written by a future integration) that didn't set that attribute — it prevents search_code from crashing on `undefined` rather than protecting against something that happens in the current sync pipeline.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: per tools.ts's description text, when query_database or search_logs returns its NOT_IMPLEMENTED marker, the agent is instructed to treat that result the same as an empty-but-valid answer — i.e. as 'no matching database rows/logs were found.'",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. Both tools' description strings say the opposite: \"NOT YET IMPLEMENTED — always returns a NOT_IMPLEMENTED marker; treat this the same as an unavailable source, not as an empty result.\" Treating it as 'no results found' would be a subtle but real violation of never-fabricate-a-conclusion — a source that was never actually queried must not be mistaken for one that was queried and came up empty.",
    },
    {
      type: "short",
      prompt:
        "model.ts's resolveModel():\n\nconst KNOWN_MODELS = new Set([\"claude-opus-5\", \"claude-sonnet-5\", \"claude-haiku-4-5\"]);\n\nexport function resolveModel(): string {\n  const configured = process.env.INVESTIGATION_AGENT_MODEL ?? DEFAULT_MODEL;\n  if (!KNOWN_MODELS.has(configured)) {\n    throw new Error(`Unknown INVESTIGATION_AGENT_MODEL: ${JSON.stringify(configured)}`);\n  }\n  return configured;\n}\n\nWhy does resolveModel() throw on an unrecognized model name instead of just passing whatever string is configured straight through to the Anthropic client?",
      modelAnswer:
        "The comment on KNOWN_MODELS explains it's \"every model this module has actually been exercised against. Extend when a new model is adopted, not speculatively.\" Throwing early surfaces a misconfiguration — a typo in the env var, a deprecated or renamed model id — as a clear, immediate startup error, instead of letting an unvalidated string reach the Anthropic API where it might fail with a confusing error mid-investigation, or in the worst case silently route to unexpected model behavior that was never actually tested against this system prompt and tool set.",
    },
    {
      type: "mcq",
      prompt:
        "transition.ts special-cases REOPEN:\n\nif (\n  event.type === \"REOPEN\" &&\n  current === \"MANUAL_REVIEW_REQUIRED\" &&\n  context.retryCount >= REOPEN_LIMIT\n) {\n  return { ok: false, error: `cannot reopen investigation: retry limit reached (${context.retryCount}/${REOPEN_LIMIT})` };\n}\n\nIs REOPEN from MANUAL_REVIEW_REQUIRED to INVESTIGATING always legal, given that the TRANSITIONS table lists it as a valid edge for that state?",
      options: [
        "No — REOPEN is listed as a legal edge in TRANSITIONS, but the function explicitly rejects it once context.retryCount reaches REOPEN_LIMIT (3), even though the (state, event) pair itself is present in the table.",
        "Yes — once an event type appears in the TRANSITIONS table for a given state, transition() always returns ok: true for it, regardless of any other context.",
        "No — REOPEN isn't actually listed in the TRANSITIONS table for MANUAL_REVIEW_REQUIRED at all; only the REOPEN_LIMIT check governs whether it's ever accepted.",
        "Yes, but only if a RESOLUTION_REJECTED event has fired at least once already — REOPEN otherwise requires a prior RESOLUTION_REJECTED in the same investigation.",
      ],
      correctIndex: 0,
      modelAnswer:
        "TRANSITIONS.MANUAL_REVIEW_REQUIRED does list `REOPEN: \"INVESTIGATING\"` as a legal edge — but the special-cased check above runs before the table lookup and rejects the event outright once retryCount has reached REOPEN_LIMIT (3), returning a specific error message about the retry limit instead of ever consulting the table for that call. Being listed in the transition table is necessary but not sufficient for REOPEN specifically.",
    },
    {
      type: "scenario",
      prompt:
        "Given transition.ts's TRANSITIONS table (RCA_IDENTIFIED only accepts PROPOSE_RESOLUTION -> RESOLUTION_PROPOSAL and CLOSE_DIRECTLY -> RESOLVED), trace this call: an investigation is currently in state RCA_IDENTIFIED, and someone calls `transition(current, { type: \"RCA_CONFIRMED\" }, context)`. What is returned, and why?",
      modelAnswer:
        "TRANSITIONS.RCA_IDENTIFIED only has entries for PROPOSE_RESOLUTION and CLOSE_DIRECTLY — there is no RCA_CONFIRMED key. `const nextState = TRANSITIONS[current][event.type]` evaluates to undefined, the `if (!nextState)` guard fires, and the function returns `{ ok: false, error: \"illegal transition: cannot apply RCA_CONFIRMED from RCA_IDENTIFIED\" }`. RCA_CONFIRMED is only a legal event from the INVESTIGATING state (where it leads to RCA_IDENTIFIED) — trying to fire it again once already in RCA_IDENTIFIED is rejected.",
    },
    {
      type: "short",
      prompt:
        "transition.ts's TRANSITIONS table has `RESOLVED: {}` — an empty object, rather than omitting RESOLVED from the table entirely. Why does the empty object matter, and what does it mean for transition()'s behavior when current is RESOLVED?",
      modelAnswer:
        "TRANSITIONS is typed as `Record<InvestigationState, Partial<Record<TransitionEvent[\"type\"], InvestigationState>>>`, so TypeScript requires every InvestigationState value — including RESOLVED — to have some entry in the object literal, even an empty one. Because RESOLVED's entry is `{}`, `TRANSITIONS['RESOLVED'][event.type]` is undefined for literally any event type, so `transition()` always falls into the 'illegal transition' branch when current is RESOLVED — the state accepts no events at all, matching FR-35's terminal-state requirement, without needing any special-cased 'is this RESOLVED?' check anywhere in the function body.",
    },
    {
      type: "short",
      prompt:
        "investigate.ts wraps its logic in try/finally:\n\ntry {\n  await client.beta.messages.toolRunner({...});\n  ...\n  return { outcome: \"CONFIRMED\", ... };\n  ...\n  return { outcome: \"INSUFFICIENT_EVIDENCE\", ... };\n} finally {\n  if (options.sessionId) { unregisterSession(options.sessionId); }\n}\n\nWhy is unregisterSession(sessionId) called from a finally block, rather than just once after each return statement inside the try?",
      modelAnswer:
        "There are two separate return points inside the try (CONFIRMED and INSUFFICIENT_EVIDENCE), and the toolRunner call itself could throw before reaching either one. A finally block guarantees the cleanup call runs on every one of those exit paths, including an unexpected exception — so a crashed or thrown investigation never leaves a stale entry registered forever in src/session/registry.ts's in-memory sessions Map. That matters concretely because registerSession() throws on a duplicate sessionId ('session already registered'), so a leaked registration would break any future investigation that happened to reuse the same session id.",
    },
    {
      type: "mcq",
      prompt:
        "investigate.ts decides the outcome with:\n\nconst confirmed = state.hypotheses.find((h) => h.status === \"CONFIRMED\");\nif (confirmed) { return { outcome: \"CONFIRMED\", hypothesis: confirmed, ... }; }\nreturn { outcome: \"INSUFFICIENT_EVIDENCE\", ... };\n\nIf two different hypotheses in state.hypotheses both happen to reach CONFIRMED status during one investigation, which one does investigate() actually report as the result?",
      options: [
        "Whichever one Array.prototype.find encounters first in hypotheses' array order — the code takes the first CONFIRMED hypothesis it finds and returns immediately, with no tie-breaking logic for a second confirmed hypothesis.",
        "Neither — investigate() detects the ambiguity and force-downgrades the outcome to INSUFFICIENT_EVIDENCE rather than arbitrarily picking between two confirmed root causes.",
        "The one with the strictly higher confidence value — find is called with a prior sort by confidence descending before the first match is taken.",
        "The one with the most supportingEvidence entries, since more accumulated evidence is treated as the stronger of the two confirmed conclusions.",
      ],
      correctIndex: 0,
      modelAnswer:
        "`Array.prototype.find` returns the first element satisfying the predicate and stops there — the code has no sort, no comparison, and no ambiguity check for the case where more than one hypothesis has reached CONFIRMED. Whichever hypothesis happens to be earlier in state.hypotheses (i.e. was proposed first, or whose evidence crossed the threshold first) is the one reported; a later-confirmed hypothesis is simply never inspected once the first match is found.",
    },
    {
      type: "short",
      prompt:
        "timeline/build.ts's header comment insists buildTimeline() stay \"a pure function of the data it's handed... No I/O, no mutation of the input array, and no dependency on src/agent/ internals beyond the ToolCallRecord type itself.\" What practical benefit does that constraint give, specifically for testing?",
      modelAnswer:
        "It lets timeline/build.test.ts exercise buildTimeline() against hand-built ToolCallRecord fixtures — plain object literals constructed directly in the test file — with zero live agent, database, or network machinery running. Because the function has no I/O and touches nothing beyond the shape of the array it's handed, its correctness (sorting steps chronologically, renaming fields into TimelineStep) is fully verifiable in isolation and fast to run, and it can never accidentally develop a hidden dependency on brain/session/investigations state that would make timeline tests fragile, slow, or order-dependent on unrelated modules.",
    },
    {
      type: "scenario",
      prompt:
        "timeline/server.ts's route:\n\n\"/api/timeline/:id\": {\n  GET: async (req) => {\n    const investigation = await getInvestigation(req.params.id);\n    if (!investigation || investigation.status === \"IN_PROGRESS\" || !investigation.result) {\n      return new Response(\"not found\", { status: 404 });\n    }\n    return Response.json(investigation.result.timeline);\n  },\n},\n\nName the three distinct conditions under which this route returns 404 instead of a timeline, and explain why an in-progress investigation is deliberately treated as a 404 rather than, say, returning a partial timeline.",
      modelAnswer:
        "(1) No investigation row exists for that id at all — getInvestigation returns undefined, which also covers a malformed/non-UUID-shaped id, since investigations/db.ts's getInvestigation short-circuits on invalid UUID shape before querying. (2) The investigation exists but its status is still IN_PROGRESS — its final result/timeline hasn't been written by completeInvestigation() yet. (3) investigation.result is still falsy even though status isn't IN_PROGRESS — a defensive check matching Investigation's `result: {...} | null` type. An in-progress investigation is 404'd rather than served as a partial timeline because this endpoint only serves the persisted, complete InvestigationTimeline written once an investigation finishes — live, in-progress step-by-step visibility is a separate concern handled by src/session's registry/poller (getInvestigationState), not by this route.",
    },
    {
      type: "short",
      prompt:
        "buildTimeline sorts before returning:\n\nconst steps = toolCalls.map(toTimelineStep).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());\n\nWhy sort by timestamp at all, rather than trusting the order toolCalls were originally pushed onto state.toolCalls in tools.ts's finishToolCall?",
      modelAnswer:
        "toolCalls are pushed in whatever order each tool's finishToolCall call happens to run in — for same-turn parallel calls sharing one concurrencyGroup, that push order reflects whichever async operation (e.g. a findEntities() query) happened to resolve first, which is essentially arbitrary and not a meaningful ordering to present to a user. Explicitly sorting by timestamp gives buildTimeline's output a consistent, reproducible chronological order regardless of that incidental completion order, while the separate concurrencyGroup field (untouched by the sort) is what actually tells a viewer which steps were genuinely concurrent versus sequential.",
    },
  ],
};

const PAPER_3: ExamPaperSeed = {
  course: "TRACELY",
  week: 2,
  paperNumber: 3,
  title: "Tracely — Integrations, Slack & Failure Handling (Implementation)",
  topics:
    "src/integrations/github: the read-only REST client's typed ConnectionFailure surface and 401/403/404 classification (client.ts), the sync pipeline's write-after-full-validation ordering and path-based file identity (sync.ts); src/slack: the Slack Web API client (client.ts), the app_mention handler's fire-and-forget investigation kickoff (handler.ts), the progress-polling loop and its crash-prevention try/catch (poller.ts), HMAC request-signature verification (verify.ts); src/failure: turning an INSUFFICIENT_EVIDENCE outcome into a FailureReport, including a documented (and, on inspection, partly stale) known limitation (report.ts); src/session: the in-memory live-investigation registry (registry.ts).",
  sourceFiles: [
    "src/integrations/github/client.ts",
    "src/integrations/github/sync.ts",
    "src/integrations/github/types.ts",
    "src/slack/client.ts",
    "src/slack/handler.ts",
    "src/slack/poller.ts",
    "src/slack/verify.ts",
    "src/failure/index.ts",
    "src/failure/report.ts",
    "src/failure/types.ts",
    "src/session/index.ts",
    "src/session/registry.ts",
    "src/session/types.ts",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "classifyGitHubResponse's 403 branch:\n\nif (response.status === 403) {\n  if (response.headers.get(\"x-ratelimit-remaining\") === \"0\") {\n    return { status: \"unavailable\", detail: \"rate limited\" };\n  }\n  const { message, raw } = await readErrorBody(response);\n  return { status: \"insufficient_permissions\", detail: message ?? raw ?? response.statusText };\n}\n\nGitHub returns HTTP 403 for both rate-limiting and insufficient permissions. How does this code tell them apart, and why does the distinction matter for how a caller reacts?",
      options: [
        "It checks the `x-ratelimit-remaining` response header — a value of '0' means rate-limited (classified as the transient/retryable 'unavailable' status); any other 403 is classified as 'insufficient_permissions' (not retryable without a permissions change).",
        "It re-issues the same request once with a longer timeout — if the retry also comes back 403, it's classified as 'insufficient_permissions'; otherwise the original 403 was transient rate limiting.",
        "It inspects the response body's `message` field for the literal substring 'rate limit' — any other message text falls through to 'insufficient_permissions'.",
        "It checks whether the request targeted a public or a private repository — 403s on public repos are always classified as rate limiting, 403s on private repos are always classified as permissions issues.",
      ],
      correctIndex: 0,
      modelAnswer:
        "The `x-ratelimit-remaining` header is 'the only reliable discriminator' per the code's own comment. Rate limiting is transient and worth retrying later, so it's classified as 'unavailable'; a genuine permissions denial is not something a retry will fix, so it's classified separately as 'insufficient_permissions' with the actual error message attached — giving callers (and eventually failure/report.ts's recommendNextStep) different, correct remediation advice for each case.",
    },
    {
      type: "short",
      prompt:
        "client.ts's header comment states: \"Every 'expected' failure mode (not connected, expired auth, insufficient permissions, source unavailable, query failure) resolves to a typed ConnectionFailure value — nothing in this file throws for those cases. Only a genuinely unexpected bug ... is allowed to propagate as an exception.\" Why does every expected failure resolve to a typed value instead of throwing?",
      modelAnswer:
        "A typed return value forces every caller — sync.ts, the search_code tool — to explicitly branch on the failure via its `status` field, instead of needing a try/catch wrapped around every call site that could otherwise silently swallow or generically mis-handle an error. It also lets a later layer inspect the exact status string (e.g. 'not_connected' vs 'auth_expired' vs 'insufficient_permissions') to build a specific, actionable message — as failure/report.ts's recommendNextStep does — rather than working from a generic caught exception with no structured information. Reserving `throw` specifically for genuinely unexpected bugs keeps a clean distinction between 'the integration worked correctly and reported a known failure' and 'something is actually broken in our own code.'",
    },
    {
      type: "scenario",
      prompt:
        "getFileContent validates the blob encoding before decoding:\n\nif (rawData.encoding !== \"base64\") {\n  return { status: \"query_failed\", detail: `unsupported blob encoding: ${JSON.stringify(rawData.encoding)}` };\n}\n\nThe comment above says GitHub's blob API 'always returns encoding: \"base64\" ... in practice, but this is validated rather than assumed.' What specifically would go wrong if this check were removed and the code just always ran `Buffer.from(rawData.content, \"base64\")`?",
      modelAnswer:
        "If GitHub ever returned a different encoding (or an unexpected value), Buffer.from(content, 'base64') would still run and produce output — but silently mis-decoded, garbage bytes, rather than failing with any visible error. The caller (search_code, and ultimately the investigation agent) would receive corrupted file content with no signal anything went wrong, which is precisely the kind of silent-wrong-data failure the codebase's 'never fabricate data' convention is built to avoid. Validating the encoding first turns a silent corruption into an explicit, typed query_failed result instead.",
    },
    {
      type: "short",
      prompt:
        "sync.ts's header comment states a hard ordering requirement: \"every fetch from GitHub — the repo lookup and the full recursive tree — must succeed before any write to the Brain begins. If either fetch resolves to a ConnectionFailure, this function returns it immediately with zero writes having occurred.\" Why does syncGitHubRepository fetch and fully validate the whole tree before writing even the Repository entity to the Brain?",
      modelAnswer:
        "If either the repo lookup or the tree fetch failed partway through and the code had already started writing, the Brain could be left holding a half-synced repository — a Repository entity with no files behind it, or files from only part of the tree — with no clear signal that the sync actually failed. By returning immediately with zero writes whenever either GitHub-side fetch fails, the function guarantees a run either produces a fully-consistent sync result or produces nothing at all. The comment notes that everything after the tree fetch is local write logic that 'cannot fail with a GitHub-side error,' which is exactly why it's safe to start writing only once both remote calls are already known-good.",
    },
    {
      type: "mcq",
      prompt:
        "sync.ts's comment says: \"Path-based identity: stable across commits, so a changed file's blob sha doesn't spawn a new 'current' entity for the same path. Per FR-7's back-reference requirement, the exact blob is still traceable — via `attributes.sha`, not the identity key.\" Why is a File entity's identity keyed on its path (`github:{owner}/{repo}:{path}`) rather than its blob sha?",
      options: [
        "Blob shas collide too often across different files in the same repository to be safely used as a unique key against entities' UNIQUE(source_system, source_ref) constraint.",
        "GitHub's tree API doesn't reliably return a blob sha for every file, so path is used as a fallback identity whenever sha happens to be missing.",
        "Path-based identity avoids an extra GitHub API call per file that a sha-based lookup would otherwise require during sync.",
        "Using sha as the identity key would mean every commit that changes a file's content spawns a brand-new entity for what's conceptually the same file, instead of updating the existing entity's row in place — the blob sha is still tracked, just in `attributes.sha`, not in the identity key.",
      ],
      correctIndex: 3,
      modelAnswer:
        "A file's blob sha changes every time its content changes, but its path is stable across commits — using sha as the identity key would fragment what's conceptually one file's history across a new entity per commit, defeating any relationship or timeline logic that expects a stable entity id for 'this file.' Path-based identity keeps one entity per file across its whole history, while the current blob sha is still recorded (in `attributes.sha`) so the exact version is traceable when needed — just not used to decide identity.",
    },
    {
      type: "short",
      prompt:
        "sync.ts's comment on recordRelationshipObservation calls says: \"Matches the file's own source ref, so re-syncing is naturally idempotent through module 01's existing retained/corroborated write-path outcomes — no special-casing needed here.\" Trace what happens if syncGitHubRepository runs twice in a row against an unchanged repo. What outcome does the second run's recordRelationshipObservation calls resolve to, and why doesn't sync.ts need its own 'already synced' check?",
      modelAnswer:
        "The second run calls upsertEntity again for the Repository and every File — itself idempotent via ON CONFLICT DO UPDATE — and then recordRelationshipObservation again with the exact same fromEntityId, toEntityId, relationshipType ('CONTAINS'), sourceSystem ('github'), and sourceRef (matching the file's own sourceRef) as the first run. Since the current relationship's attributes ({} by default) are unchanged and that exact (source_system, source_ref) pair was already recorded as provenance from the first run, relationships.ts resolves this to 'retained' — a pure no-op. sync.ts needs no idempotency logic of its own because it just always calls the same two Brain write functions with the same inputs on every run, and those functions' own versioning/corroboration algorithm already absorbs a repeat call correctly without any special-casing at the sync layer.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: syncGitHubRepository creates a directory Entity plus a CONTAINS relationship for every `type: \"tree\"` entry returned by GitHub's recursive tree API, in addition to the File entities it creates for `type: \"blob\"` entries.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. The header comment lists this as explicitly out of scope — \"No directory entities or directory-CONTAINS relationships — `type === 'tree'` tree entries are skipped entirely\" — and the code confirms it: `const files = treeResult.data.filter((entry) => entry.type === \"blob\")` filters the tree down to blob (file) entries only before any writes happen. Tree (directory) entries are discarded and never written to the Brain at all.",
    },
    {
      type: "short",
      prompt:
        "slack/client.ts's PostMessageResult is `{ ok: true; ts: string } | { ok: false; error: string }` — a single generic error string, unlike github/client.ts's ConnectionFailure, which has five distinct status variants (not_connected, auth_expired, insufficient_permissions, unavailable, query_failed). Both files' comments describe the 'same typed failure surface, never throw for an expected failure' convention. Why is postMessage's failure shape simpler than GitHub's, given they follow the same convention?",
      modelAnswer:
        "Slack's own chat.postMessage API already collapses every failure into a single JSON body shape with one `error` string field (`parsed.error`) — there's no structurally distinct information from Slack itself to preserve the way GitHub's different HTTP status codes (401 vs 403 vs 404) map to genuinely different remediation paths. GitHub's richer type exists because auth_expired, insufficient_permissions, and unavailable really do call for different caller responses (refresh credentials vs. request access vs. retry later); postMessage's only real caller in this codebase, poller.ts's logIfFailed, just logs the message either way, so a single flat error string carries everything that's actually used.",
    },
    {
      type: "scenario",
      prompt:
        "handler.ts's handleAppMention:\n\nconst resultPromise = investigateImpl(problemDescription, { sessionId: investigation.id });\n\n// Deliberately not awaited — the poller owns the rest of this\n// investigation's lifecycle, including posting the final result.\nvoid pollAndPost(investigation.id, investigation.id, resultPromise, { channel: event.channel, thread_ts: threadTs }, { postMessageImpl });\n\nWhy does handleAppMention call investigateImpl() but never `await` its result directly, and what does it do with the resulting Promise instead?",
      modelAnswer:
        "Slack requires app_mention webhook handlers to acknowledge quickly (the initial 'Investigating — I'll post updates here' message is posted right after createInvestigation, before this line), but a real investigation can run for minutes; awaiting investigateImpl() here would block the whole HTTP handler — and hence Slack's webhook response — for the full investigation duration. Instead the still-unresolved Promise (resultPromise) is handed straight to pollAndPost(), which is the function responsible for awaiting it, polling the live session registry for progress updates in the meantime, and posting the final result once it resolves. handleAppMention itself returns immediately after kicking that off.",
    },
    {
      type: "short",
      prompt:
        "handler.ts defines `const LEADING_MENTION_RE = /^<@[^>]+>\\s*/;` with the comment: \"app_mention events fire only when this app itself is mentioned, so the leading <@ANYID> token is always this bot — no need for a separately configured bot user id env var to know which id to strip.\" What problem would a naive `event.text.replace(/<@BOT_ID>/, \"\")` (hardcoding a specific bot user id) have that this regex avoids?",
      modelAnswer:
        "A hardcoded bot id would need a separate config value (e.g. an env var) kept in sync with whatever id Slack actually assigned this app's bot user, and it would silently stop stripping the mention (leaving the raw `<@U123...>` token in problemDescription) if the app were ever reinstalled under a different workspace or bot user id. Since Slack's app_mention event type only fires when this specific app is mentioned, the leading `<@...>` token at the very start of the message text is guaranteed to always be this bot, whatever its id is — matching any id via `[^>]+` strips it correctly without the code needing to know or configure that id anywhere.",
    },
    {
      type: "mcq",
      prompt:
        "poller.ts's setInterval callback:\n\nif (snapshot.stepNumber > lastStepNumber) {\n  lastStepNumber = snapshot.stepNumber;\n  ...\n  void postMessageImpl({ ... text: `Still investigating… (${snapshot.stepNumber} steps so far, ...)` });\n}\n\nWhat specifically triggers a 'Still investigating…' progress message being posted mid-investigation?",
      options: [
        "A fixed timer posts a progress update on every single polling tick, regardless of whether the investigation has made any real progress since the previous tick.",
        "A new hypothesis is proposed via propose_hypothesis — progress messages are tied specifically to hypothesis count, not to tool-call count.",
        "The live session snapshot's stepNumber (incremented once per tool invocation, via src/agent/tools.ts's withStep) has advanced past the last value this poller observed — every tick that sees a higher stepNumber than before posts once and updates lastStepNumber to match.",
        "The investigation crosses into a new state.js state-machine state (e.g. INVESTIGATING to RCA_IDENTIFIED) — pollAndPost subscribes directly to state-machine transition events.",
      ],
      correctIndex: 2,
      modelAnswer:
        "getInvestigationState(sessionId) returns a snapshot whose stepNumber comes from src/session/registry.ts reading the live InvestigationState's stepNumber field — a coarse counter tools.ts's withStep() increments once per tool invocation regardless of which tool. The poller only posts, and only advances lastStepNumber, when the current tick's stepNumber is strictly greater than the last one it saw; if no tool call has happened since the last tick, nothing is posted. There's no separate subscription to hypothesis events or state-machine transitions — stepNumber comparison is the only trigger.",
    },
    {
      type: "scenario",
      prompt:
        "pollAndPost's outer try/catch/finally comment says: \"This function must never reject once this fix lands... Bun terminates on an unhandled rejection, which would take down both the Slack webhook and the web UI.\" What would happen without that outer try/catch if `resultPromise` (ultimately investigate()) rejected — e.g. the underlying Anthropic API call throws?",
      modelAnswer:
        "`await resultPromise` inside pollAndPost would itself throw. Since pollAndPost is invoked as `void pollAndPost(...)` in handler.ts — fire-and-forget, never awaited by its own caller — that thrown rejection would become an unhandled promise rejection at the process level rather than being caught anywhere. Per the comment, Bun terminates the entire process on an unhandled rejection, which would take down the whole server — both the Slack /slack/events webhook route and the web UI's /api/investigate route — over a single failed investigation. The try/catch converts that into a caught, logged error and a 'Investigation failed...' message posted back to the Slack thread instead of crashing the process.",
    },
    {
      type: "short",
      prompt:
        "verify.ts compares signatures with `timingSafeEqual(expectedBuf, actualBuf)` (after first checking the buffers are the same length) rather than a plain `expected === signature` string comparison. Why?",
      modelAnswer:
        "A plain `===` string comparison in most JS engines short-circuits at the first mismatched character, so its execution time subtly correlates with how many leading characters of a forged signature happen to already match the real one — an attacker able to measure that timing difference precisely enough could incrementally guess the correct signature byte by byte. `timingSafeEqual` always compares the full buffer regardless of where (or whether) a mismatch occurs, so the comparison's timing doesn't leak any information about how close a forged signature is to correct.",
    },
    {
      type: "mcq",
      prompt:
        "verify.ts defines `const MAX_TIMESTAMP_SKEW_SECONDS = 60 * 5;` and rejects any request whose timestamp is more than 5 minutes from now, in either direction, in addition to checking the HMAC signature. What does this timestamp-skew check protect against, separately from the signature check itself?",
      options: [
        "It substitutes for signature verification entirely on requests where the signing secret hasn't been configured yet, as a lower-security fallback check.",
        "It's replay protection — even a captured, genuinely-signed request (a valid signature, the real signing secret) becomes unusable to a later attacker once too much wall-clock time has passed since its original timestamp, since verifySlackSignature rejects requests outside the 5-minute window regardless of whether the signature itself is valid.",
        "It ensures requests are processed in the exact order Slack originally sent them, by rejecting any request whose timestamp is older than the most recently accepted request's timestamp.",
        "It compensates for clock drift between the Tracely server and Slack's servers by rejecting only future-dated timestamps, while accepting any request from the past regardless of its age.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Slack's own documented signing scheme includes this window specifically as replay protection, per the file's header comment: '5-minute timestamp window (replay protection), per Slack's own guidance.' An attacker who somehow captured a legitimately-signed request (correct signature, real secret) couldn't just replay it later — verifySlackSignature checks `ageSeconds > MAX_TIMESTAMP_SKEW_SECONDS` and rejects regardless of whether the HMAC signature itself is perfectly valid, closing off reuse of an old, genuinely-signed payload.",
    },
    {
      type: "scenario",
      prompt:
        "src/failure/report.ts's header comment claims: \"A second, sharper edge of the same limitation: update_hypothesis's own handler (tools.ts) currently hardcodes every Evidence's raw field to null regardless of what the underlying tool actually returned.\" Now look at the actual update_hypothesis handler you read in tools.ts: `raw: citedStep ? citedStep.result : null`. Does the code match what this comment claims? Explain the real behavior of the raw field.",
      modelAnswer:
        "No, the comment appears stale relative to the current code. `raw: citedStep ? citedStep.result : null` does NOT unconditionally hardcode raw to null — it's set to the real, recorded tool result (`citedStep.result`) whenever the model supplies a stepId that matches a prior ToolCallRecord in state.toolCalls, and only falls back to null when no stepId was given or the given id doesn't match anything recorded. The report.ts comment describing an unconditional hardcode reads like leftover documentation from an earlier version of tools.ts, not an accurate description of the current implementation — a good reminder that a code comment (even one that reads with total confidence) has to be checked against the live code, not trusted at face value.",
    },
    {
      type: "scenario",
      prompt:
        "Given a hypothesis whose only contradicting evidence has toolSource: \"search_logs\" and a correctly cited raw value of `{ status: \"NOT_IMPLEMENTED\", tool: \"search_logs\" }`, and the overall InvestigationResult's reason is \"no hypothesis reached the confirmation threshold\" — trace buildFailureReport's output. What are `investigated`, `missing`, and `recommendedNextStep`?",
      modelAnswer:
        "investigatedList collects friendlyLabel(\"search_logs\") = \"Logs\" from the evidence, so `investigated: [\"Logs\"]`. detectMissingSignals inspects that same evidence's raw.status (\"NOT_IMPLEMENTED\"), finds it's in MISSING_SOURCE_STATUSES, and records `{ label: \"Logs\", status: \"NOT_IMPLEMENTED\" }` as a signal — so describeMissing takes the signals.length > 0 branch instead of falling back to the raw `reason` string, producing `missing: \"Logs unavailable (not yet implemented)\"` via the NOT_IMPLEMENTED-specific branch in describeMissing. recommendNextStep switches on that first signal's status; the NOT_IMPLEMENTED case returns `\"Connect the Logs integration; it is not yet implemented.\"` — so recommendedNextStep is that exact string, not the generic 'escalate to a human' fallback that fires when no signals are found at all.",
    },
    {
      type: "short",
      prompt:
        "session/registry.ts's registerSession:\n\nexport function registerSession(sessionId: string, state: InvestigationState): void {\n  if (sessions.has(sessionId)) {\n    throw new Error(`session already registered: ${sessionId}`);\n  }\n  sessions.set(sessionId, state);\n}\n\nWhy throw on a duplicate sessionId, rather than letting Map.set() silently overwrite the existing entry the way a plain cache normally would?",
      modelAnswer:
        "sessionId values come from createInvestigation's generated uuid, so a genuine collision should never happen in normal operation — but if it somehow did (a bug reusing an id, or investigate() invoked twice concurrently with the same sessionId by mistake), a silent Map.set() overwrite would mean any poller already reading `getInvestigationState(sessionId)` for the first investigation would abruptly start seeing the second investigation's hypotheses/stepNumber instead, with nothing anywhere signaling that a swap happened — a subtle, hard-to-diagnose cross-talk bug between two unrelated investigations. Throwing immediately turns that into a loud, attributable failure right at the point of the mistake, per the file's own comment: \"prevents one investigation's state from silently overwriting/cross-talking with another's in the registry.\"",
    },
    {
      type: "mcq",
      prompt:
        "getInvestigationState builds and returns a new object rather than the live state:\n\nreturn {\n  sessionId,\n  status: \"IN_PROGRESS\",\n  stepNumber: state.stepNumber,\n  hypotheses: [...state.hypotheses],\n};\n\nThe comment calls this 'a defensive snapshot copy — never the live InvestigationState object.' Why not just return `state` directly to the caller?",
      options: [
        "Because state.hypotheses is typed as a readonly array, so returning it directly would fail to compile without first spreading it into a new, mutable array.",
        "Because the session registry actually stores each session's state as a serialized JSON string internally, so state.hypotheses must be parsed back into an array before it can be returned at all.",
        "Because JSON serialization for an eventual HTTP response requires a plain array, and state.hypotheses is stored as a Map internally that has to be converted first.",
        "Because `state` is the live, mutable InvestigationState object a still-running investigate() call is actively writing to as new tool calls and hypothesis updates come in — handing it out directly would give a caller (e.g. a poller reading it on a timer) a reference that keeps changing underneath them, or that they could accidentally mutate; the copy is a frozen point-in-time snapshot instead.",
      ],
      correctIndex: 3,
      modelAnswer:
        "InvestigationState (from src/agent/tools.ts) is exactly the object createInvestigationState() returns and createTools()'s handlers mutate in place as the model calls tools and updates hypotheses — it's live, shared, mutable state for the duration of one investigate() call. Returning it directly to a caller like poller.ts would hand out a reference into that ongoing mutation, so reading `.hypotheses` a moment later could already reflect a different, later point in the investigation than when it was read, and nothing would stop a caller from mutating it and corrupting the running investigation's actual state. Building `{ sessionId, status, stepNumber: state.stepNumber, hypotheses: [...state.hypotheses] }` freezes a true point-in-time view instead.",
    },
  ],
};

export const WEEK_2_PAPERS: ExamPaperSeed[] = [PAPER_1, PAPER_2, PAPER_3];
