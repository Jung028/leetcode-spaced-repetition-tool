import type { CompanySystemDesignSeed } from "./types";

const RUBRIC = ["Requirements clarification", "High-level architecture", "Data model", "Scaling & bottlenecks", "Trade-offs"];

export const ATLASSIAN: CompanySystemDesignSeed = {
  company: "Atlassian",
  questions: [
    {
      prompt:
        "Design the backend for a real-time collaborative document editor (like Confluence's live editing), where multiple users can type in the same document at once and see each other's changes within milliseconds, without overwriting each other's work.",
      modelAnswer: `# Atlassian System Design — Real-Time Collaborative Document Editor

## 1. Requirements

"Before designing the system, I'd like to clarify the requirements.

For functional requirements, I need users to be able to open and edit documents, multiple users should be able to edit the same document simultaneously, changes should be visible to other users in real time, and concurrent edits must not overwrite each other's work.

I'll also assume we need document persistence and the ability for users to reconnect and recover changes after a network failure.

For non-functional requirements, I'm targeting sub-100-millisecond propagation latency, high availability, horizontal scalability, consistency for users editing the same document, and durability so accepted edits aren't lost.

The most technically challenging requirement is concurrent editing, so I'll focus the design around that."

---

## 2. Scale

"Before choosing the infrastructure, I'll make some rough assumptions.

Let's say we have 10 million registered users, around 1 million daily active users, and perhaps 100,000 concurrent editors at peak.

A single document might have tens or hundreds of concurrent users, while the total number of documents is much larger.

The important observation is that we don't need global ordering across all documents. We only need strong ordering for operations on the same document.

That will be important for scaling."

---

## 3. High-Level Architecture

"I'll use WebSockets between clients and our collaboration servers because the server needs to push edits to other users immediately."

Draw:

\`\`\`text
                  ┌──────────────┐
                  │   Clients    │
                  └──────┬───────┘
                         │
                      WebSocket
                         │
                  ┌──────▼───────┐
                  │ Load Balancer│
                  └──────┬───────┘
                         │
              ┌──────────▼──────────┐
              │ Collaboration       │
              │ Servers              │
              │                      │
              │ OT / CRDT Engine     │
              └──────┬───────┬──────┘
                     │       │
                 ┌───▼───┐ ┌─▼─────┐
                 │ Redis │ │ Kafka │
                 └───────┘ └──┬─────┘
                               │
                          ┌────▼────┐
                          │   DB    │
                          └─────────┘
\`\`\`

"The collaboration servers are responsible for the real-time editing path.

Redis stores ephemeral information such as presence and connection metadata.

Kafka provides a durable stream of document operations.

The database stores document snapshots and durable document state."

---

## 4. The Core Problem — Concurrent Editing

"Now I'll go deeper into the most important part.

Suppose the document contains:

'Hello World'

Alice and Bob both see version 10.

Alice inserts 'beautiful ' at position 6.

At approximately the same time, Bob inserts 'big ' at position 6.

Both operations were generated against version 10.

If we simply apply both operations based on position 6, one operation can change the position of the other.

So we need a concurrency-control mechanism.

I would use Operational Transformation, or OT."

---

## 5. How OT Works

"Each edit is represented as an operation containing something like:

\`\`\`text
documentId
clientId
baseVersion
operation
\`\`\`

For example:

\`\`\`text
Alice:
version 10
INSERT('beautiful ', 6)

Bob:
version 10
INSERT('big ', 6)
\`\`\`

The collaboration server receives these operations and determines whether the client's base version is behind the current document version.

If there are concurrent operations, the OT engine transforms the new operation relative to the operations that have already been applied.

The important property is that both users' changes are preserved and all clients eventually converge to the same document state."

---

## 6. Real-Time Edit Flow

"Let me walk through the complete request path.

Alice types something.

The client optimistically updates her local UI and creates an edit operation.

That operation is sent through the WebSocket to the collaboration server.

The server authenticates Alice and checks that she has permission to edit the document.

It checks the document version and performs the required OT transformation.

The server then assigns the operation the next document version.

For example:

\`\`\`text
Version 100
    ↓
Alice's operation
    ↓
Version 101
\`\`\`

The server broadcasts the resulting operation to the other users connected to that document.

At the same time, the operation is written to our durable log.

This gives us a very short real-time path while still maintaining durability."

---

## 7. Scaling

"Now let's consider how to scale the collaboration servers.

I would partition documents by document ID.

Conceptually:

\`\`\`text
hash(documentId) → collaboration shard
\`\`\`

So:

\`\`\`text
Document A → Shard 1
Document B → Shard 2
Document C → Shard 3
\`\`\`

All users editing the same document are routed to the same logical collaboration shard.

This is useful because we need to maintain an ordering of operations for a document, but we don't need a global ordering across the entire system.

That allows us to horizontally scale by adding more collaboration shards."

---

## 8. Kafka and Persistence

"I'd use Kafka as an append-only operation log.

For example:

\`\`\`text
Document 123
    Version 101 → Alice insert
    Version 102 → Bob insert
    Version 103 → Alice delete
\`\`\`

We don't want to reconstruct a large document by replaying millions of operations every time it is opened.

So periodically we create snapshots.

For example:

\`\`\`text
Snapshot → Version 1000
Operations → 1001...1010
\`\`\`

To recover the document, we load the snapshot and replay only the operations after it."

---

## 9. Failure and Reconnection

"If a collaboration server fails, another server can take over the document shard.

Because the operations are durably stored, the new server can reconstruct the latest state from the snapshot and operation log.

For a disconnected client, the client keeps unacknowledged operations locally.

When it reconnects, it tells the server:

'My last acknowledged version is 100.'

If the server is currently at version 105, it sends the missing operations.

Any pending client operations are then transformed against the newer operations before being accepted.

This prevents a disconnected client from accidentally overwriting newer changes."

---

## 10. Availability and Consistency Trade-Off

"There's an important trade-off here.

For different documents, we can process operations independently, which gives us high scalability.

For a single document, however, we need a consistent ordering of operations.

I'm therefore deliberately choosing stronger consistency for operations within one document rather than trying to make the entire system globally strongly consistent.

This gives us the consistency we need without creating a global bottleneck."

---

## 11. Security

"Every WebSocket connection should be authenticated.

For each edit, the server verifies that the user has permission to modify that document.

I would also validate the operation server-side rather than trusting the client.

For example, a malicious client shouldn't be able to send an arbitrary operation against a document they don't have access to."

---

## 12. Final Summary

"So my final design is:

WebSockets provide the low-latency communication channel.

Collaboration servers handle the real-time editing logic.

OT resolves concurrent edits and prevents users from overwriting each other's changes.

Documents are partitioned by document ID so we can scale horizontally while maintaining ordering for each document.

Redis handles ephemeral presence information.

Kafka provides a durable operation log.

The database stores document snapshots.

Clients maintain pending operations so they can recover from network failures.

The key design decision is that we don't need global consistency. We need a consistent ordering of operations for each individual document.

That gives us low-latency collaboration, conflict resolution, durability, and horizontal scalability."`,
      rubric: RUBRIC,
    },
    {
      prompt:
        "Design the backend for an issue-tracking system (like Jira) that supports millions of projects, each with potentially thousands of issues, flexible custom fields per project, and fast full-text plus filtered search across a user's accessible projects.",
      modelAnswer: `# Atlassian System Design — Jira-style Issue Tracking System

## 1. Requirements

"Before designing, I want to nail down the requirements.

For functional requirements, users create and update issues; every issue has core fields such as title, status, assignee, and timestamps; each project can define its own custom fields; users browse a project's board; users comment on issues; and users run full-text plus filtered search across every project they have permission to see.

For non-functional requirements, the system should hold millions of projects with thousands of issues each; opening a board or an issue should feel instant, roughly under 200 milliseconds; search should stay low-latency while combining text matching with structured filters; the system of record must be durable and strongly consistent for an issue's own state; and the search index is allowed to be eventually consistent.

The interesting tension is that flexible per-project custom fields pull the data model toward a dynamic schema, while fast filtered search pulls it toward a fixed, indexable one. I'll design around resolving that."

---

## 2. Scale

"Some rough assumptions.

Say 5 million projects, an average of a few thousand issues per project, so low tens of billions of issues in total.

The workload is read-heavy: opening a board or an issue happens far more often than writing one.

Search queries are frequent. They are often scoped to one project, but 'all my issues across projects' is also common.

The key observation is that almost every read is scoped to a single project, so project ID is a natural partition key."

---

## 3. High-Level Architecture

"I'll separate the system of record from the search path, because they want opposite things from the data model."

Draw:

\`\`\`text
              ┌───────────┐
              │  Clients  │
              └─────┬─────┘
                    │ HTTPS
              ┌─────▼─────┐
              │    API    │
              │  Servers  │
              └──┬─────┬──┘
                 │     │
      ┌──────────▼─┐ ┌─▼───────────────┐
      │ Relational │ │  Change stream  │
      │   Store    │ │    (async)      │
      │ (sharded   │ └───────┬─────────┘
      │ by project)│         │
      └────────────┘   ┌─────▼────────┐
                       │ Search index │
                       │  (inverted)  │
                       └──────────────┘
\`\`\`

"The relational store is the source of truth. An issue's existence and core state must never depend on a search index being current.

The API servers write to the relational store first, then publish the change to an asynchronous stream.

A consumer reads that stream and updates a dedicated full-text search engine.

The search index is a derived, rebuildable copy of the data, purpose-built for combining text matching with structured filtering."

---

## 4. The Core Problem — Flexible Schema vs Fast Search

"The hard part is supporting per-project custom fields without giving up fast filtered search.

A fully dynamic 'ALTER TABLE per project' approach doesn't scale operationally once you have millions of projects.

So I split storage by how a field behaves.

The fixed core fields that every issue has regardless of project become real indexed columns.

The custom fields, which vary per project, go into a separate key-value structure keyed by issue ID and field ID. That can be an entity-attribute-value table or a JSON column.

Then search is handled by neither of those directly. Both are flattened into one searchable document per issue in the search engine."

---

## 5. Data Model

"Concretely, the relational store has:

\`\`\`text
issues
  id, project_id, title, status,
  assignee, created_at, updated_at
  (sharded by project_id)

custom_field_values
  issue_id, field_id, value

comments
  id, issue_id, author, body, created_at
\`\`\`

The search engine stores one document per issue:

\`\`\`text
issue_doc
  issue_id, project_id
  core fields (status, assignee, ...)
  custom field values
  title + description + comment text
  permission_group_ids
\`\`\`

Tagging each search document with the permission groups allowed to see it lets us enforce access control inside the search query itself."

---

## 6. Search Path

"A filtered search such as 'status = open AND assignee = me AND project in my accessible projects' runs entirely against the search index, not the relational store.

The search engine is built for exactly this: full-text matching combined with structured filters at low latency.

Because indexing is asynchronous, a newly created issue might take a few hundred milliseconds to a few seconds to become searchable.

That lag is acceptable for a project-management tool. Search freshness is not safety-critical, unlike the issue's actual state in the system of record."

---

## 7. Scaling

"I shard the relational store by project ID.

Almost every real query — 'show me this project's board' — is scoped to one project, so cross-shard queries are rare.

Conceptually:

\`\`\`text
hash(project_id) → relational shard

Project A → Shard 1
Project B → Shard 2
Project C → Shard 3
\`\`\`

The search cluster scales independently by sharding its documents, typically also by project ID so a single-project search hits one shard.

Reads dominate, so I'd add read replicas for the relational store and cache hot boards and issues."

---

## 8. Failure and Consistency

"If the search index is lost or falls behind, we rebuild it by re-reading the relational store. Nothing about correctness depends on it.

That is the standard justification for treating the index as eventually consistent rather than trying to keep it transactionally in sync with every write.

Within the relational store, an issue's own state is strongly consistent. A write is acknowledged only after it is durably committed.

If the async indexing consumer crashes, it resumes from its last processed position in the change stream, so no updates are silently dropped."

---

## 9. Security

"Every request is authenticated, and the API layer checks that the user has permission on the project before returning or modifying an issue.

Search results are filtered by the permission groups embedded in each search document, so a user can never see an issue from a project they don't have access to, even through search.

Custom field definitions and values are validated server-side against the project's schema rather than trusting the client."

---

## 10. Final Summary

"So my final design is:

A relational store is the source of truth, sharded by project ID, with core fields as indexed columns and custom fields in a separate key-value structure.

A dedicated full-text search engine holds a derived, rebuildable document per issue that flattens core fields, custom fields, and text, tagged with permission groups.

Writes go to the relational store first, then flow asynchronously into the search index.

Filtered and full-text search run against the search engine; board and issue reads run against the relational store with replicas and caching.

The key design decision is separating the system of record from the search path so each can use the data model it needs, accepting a small search-freshness lag as the trade-off.

That gives us flexible per-project schemas, fast filtered search, strong consistency where it matters, and horizontal scalability by project."`,
      rubric: RUBRIC,
    },
  ],
};
