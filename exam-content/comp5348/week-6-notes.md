# COMP5348 Week 6 — Study Notes

Message-Oriented Middleware & Asynchronous Technologies. Companion to
`week-6.ts` (TUTORIAL_PAPER: the TradeTrack MOM tutorial; LECTURE_PAPER:
Lecture 6).

## Important points

### Slide-sourced (Lecture 6 deck: `COMP5348_W6.pdf`)

- **Synchronous recap.** RPC makes a remote call look local; the caller
  *blocks* until the reply. Tight coupling: both parties must be alive at
  once, and if the destination is down the caller's whole application is
  unavailable. Disadvantages listed: connection overhead, higher failure
  probability, hard to detect/react to failures, one-to-one (bad for
  nested calls).
- **Asynchrony.** Caller sends a message that is stored until the receiver
  reads it; reply comes back the same way. Two attributes: **non-blocking**
  (call returns immediately) and **persistent queues** (request and
  response persistently stored until accessed). Gains: availability and
  performance.
- **Two responses to synchronous problems.** (a) Enhance the synchronous
  model — transactional interaction for exactly-once, service replication +
  load balancing; *but client-side recovery is still the client's
  problem*. (b) Change the interaction model → messaging.
- **Message queuing.** `Send(queue, message)` puts a message on a queue;
  `Receive(queue, message)` gets one. No dependency on the receiving
  application's state at send time. Suits modular design and heterogeneous
  systems.
- **Reliable queuing = persistence.** Receipt at the queue writes the
  message to a disk log; removal deletes it. Trade-off: performance vs
  reliability.
- **"Guaranteed delivery?" Not at all.** The queue only guarantees the
  message *survives*. The receiving system may never accept or may reject
  it. Failures become **deferred exceptions** — discovered hours/days
  later, when the sender must recover the state from the time of the
  request to handle the error.
- **Messaging models.**
  - *Point-to-point* (peer-to-peer): message goes sending-queue →
    receiving-queue → receiving app. No intermediary, no message server;
    participants autonomous. Cost: sender must know the destination queue.
  - *Centralised messaging*: one central server holds queues for many
    destinations, accessed by RPC. Simplifies management; introduces a
    **single point of failure** and tight coupling.
  - *Message queues and clusters*: distribute one logical MOM server across
    a cluster; each message allocated to one instance. Danger: messages
    can get **out of order** across instances.
- **Request-and-reply on async infrastructure.** Request queue + response
  queue; looks synchronous to the app, is async underneath. Existing apps
  connect via **adapters**.
- **MOM transactions.** Sender and receiver **do not share a
  transaction**. A rollback on the receiver does not affect the sender
  (already committed). A "synchronous" request/response is **3
  transactions, not 1**: T1 update db + put request; T2 get request +
  update db + put response; T3 get response + update db. Messaging gives
  decoupling, **not** end-to-end atomicity.
- **Poison & dead letters.** Undeliverable messages (TTL expiry, delivery
  failures) → **dead-letter queue** for post-mortem. A **poison message**
  aborts the transaction on read, returns to the queue, and can crash the
  consumer repeatedly → retry limit → **poison queue** for diagnosis.
- **Quality of service.** Non-persistent queues: lost on node failure,
  faster (no disk I/O). Persistent queues: written to log, survive node
  failure, possibly slower. Message priority and transactions supported.
- **Products.** IBM MQ Series (point-to-point, queue managers,
  persistent/non-persistent, transactional XA). Microsoft MSMQ (bundled
  with Windows, point-to-point, persistent, transactional, IP multicast /
  `mput`, used with WCF). **JMS** — a Java *API*, not a protocol: says how
  sender/receiver are coded, not the wire format; no interoperability
  unless all sides use the same MOM.
- **Publish/Subscribe.** Decouples in *design* — publishers and
  subscribers do not know each other, and both can appear/disappear
  dynamically. Service publishes events of a type; clients subscribe to
  types; the system forwards each event to interested subscribers' queues.
  1-to-N, N-to-1, N-to-N. Messages published to logical subjects/topics.
- **Topic naming.** Hierarchical with wildcards
  (`Sydney/DevGroup/Information/work`, `Sydney/*/Information`,
  `Sydney/DevGroup/*/*`). System builds a subscription tree, forwards each
  publication along every path toward a subscriber, exploits network
  multicast where possible, and does the filtering.
- **TIBCO example.** Published message written to the network once (IP
  multicast/broadcast); routers replicate; filtering on the receiving
  system. `rvd` = per-node send/receive daemon; `rvrd` = daemon bridging
  one LAN to others across a WAN (no WAN multicast assumed).
- **Pub/Sub issues.** Reliability, transactions, security, performance —
  because you do not know who is listening.
- **Message brokers.** Add logic *at the messaging-infrastructure level*
  for **Enterprise Application Integration**: message transformation
  between source/target formats, content-based **intelligent routing**, a
  **rules engine**, **adapters**. **Hub-and-spoke**. Typically built on a
  MOM layer.
- **Adapters.** Sit between broker and end systems (abstraction layer).
  *Thin* = simple wrappers; *thick* = programmable. Centralised
  (co-located with broker) or distributed.
- **Point-to-point → spaghetti.** N business processes ⇒ ~N² interfaces (5
  processes = 20 interfaces). A broker **relocates** the spaghetti into
  itself.
- **Enterprise Data Model (EDM).** Source sends a common message format as
  payload; target transforms it into its own representation. **2×N**
  transformations, no broker needed. Hard part: getting agreement on the
  EDM.
- **Broker "some thoughts".** Efficient and flexible for EAI *provided*
  messages are not too big and the process→queue mapping is well
  understood. RPC-based enqueue/dequeue is poor for large objects/docs;
  embedded transformation/routing gets complex; scaling needs replicated
  brokers; broker failure handling is lightweight; often proprietary
  (open, standards-based options like Mule now exist).
- **Quality-attribute analysis.**
  - *Messaging*: queues replicated for availability + failover; strong
    balance of availability/scalability/loose coupling; message-format
    changes still ripple to servers.
  - *Pub/Sub*: topics replicated; publishers/subscribers added dynamically
    without config change; multicast/broadcast distributes uniformly;
    trade-off is **reliability/trust** (unknown listeners).
  - *Broker*: strong **modifiability** (transformation/routing separated
    from endpoints); typed input ports validate and discard wrong-format
    messages; the **hub can become a bottleneck**, throughput typically
    lower than plain reliable messaging; cluster to scale.
- **Final point.** Async messaging does **not** make RPC disappear —
  messaging is often built *on top of* RPC for the enqueue/dequeue calls to
  the messaging server or broker. The value is the architectural
  abstraction exposed to the application.

### Tutorial-sourced (`Week6-Tutorial-Walkthrough.pdf`, `COMP5348_Tutorial 6.docx`, `tutorial-6-tradeTrack-student/`)

- **Why MOM (concrete).** Direct `A → B` creates a runtime dependency: if
  B is down when A calls, the request fails now. A queue turns that
  failure into a delay.
- **Roles.** Producer sends/publishes; consumer receives/processes. The
  producer need not know *when* the consumer processes.
- **TradeTrack architecture.** Producer generates Gold/Silver/Platinum
  prices → `TradeDataDTO` → serialize to a JSON array → message queue →
  consumer deserializes → `saveTradeData(dto)` per item → business DB.
- **PostgreSQL plays two roles.** `TRADEDATA_CHANNEL_MESSAGE` = the queue
  (one message = one row, removed on read; created by `create_table.sql`
  because it belongs to the library). `TRADE_DATA` = permanent business
  history (created by Hibernate from the `@Entity`). Both apps point at the
  **same** `trade` DB — the queue is a shared channel. `server.port`
  8080 vs 8081 only avoids a local port clash; `:5432` (Postgres) is the
  same for both.
- **DTO vs JSON vs SQL.** Different levels. DTO = in-memory Java shape;
  JSON = the message payload; SQL = how the library talks to Postgres
  underneath `send`/`poll`. We never write SQL ourselves.
- **Question 1 — the queue.** Producer `out.send(...)` → `QueueChannel`
  ("out" bean) backed by a `JdbcChannelMessageStore` → **INSERT** one row.
  Consumer `IntegrationFlow` polls `pollMessageFromGroup("trade-queue")`
  once per second → **`DELETE ... RETURNING`** that takes and removes the
  oldest row. `GROUP_KEY` = queue name; `CREATED_DATE` = FIFO order;
  `MESSAGE_BYTES` = content (bytes, because the whole Java message object
  is serialised). `PostgresChannelMessageStoreQueryProvider` supplies the
  SQL — swap it and every query changes, no app-code change. Optional:
  `FOR UPDATE SKIP LOCKED` lets multiple consumers share work; `CTID` is a
  Postgres row id needed only because SQL will not take `ORDER BY`/`LIMIT`
  directly inside a `DELETE`.
- **Question 2 — business logic.** `Math.random()` prices; **one**
  `LocalDateTime.now()` shared by all three (one market snapshot ⇒ one
  message); `mapper.writeValueAsString(List.of(...))` to serialize;
  `mapper.readValue(payload, new TypeReference<List<TradeDataDTO>>(){})` to
  deserialize; loop `tradeDataService::saveTradeData`. Needs
  `JavaTimeModule` (or `LocalDateTime` throws
  `InvalidDefinitionException`). Needs `TypeReference` because Java **type
  erasure** makes `List.class` yield `LinkedHashMap` + `ClassCastException`
  — the most common bug. DTO's **empty constructor** is required by
  Jackson. Wrap parsing in try/catch: the message is already off the queue
  by the time `handle()` runs, so a bad message should be logged and
  skipped, not allowed to disrupt the consumer.
- **Part 6 demonstration.** Stop only the consumer, leave the producer
  running: rows accumulate (~6 in a minute), the producer never fails or
  notices; restart the consumer and the backlog clears in seconds, nothing
  lost. That is **decoupling** — the whole point of the week.
- **When Postgres-as-queue is fine vs not.** Fine for small/simple systems
  (bonus: you can `SELECT` and literally see the messages). Reach for a
  dedicated broker (RabbitMQ, Kafka, SQS, …) for millions of messages,
  many producers/consumers, retries, routing, delivery guarantees,
  throughput, scaling, monitoring. MOM = the idea; those are technologies
  that implement it. RabbitMQ ≈ traditional queue model; Kafka ≈ persistent
  event streams.
- **Healthy-run checks.** Consumer console prints the JSON array;
  `trade_data` gains 3 rows / 10 s; `SELECT COUNT(*) FROM
  tradedata_channel_message` ≈ 0 (a rising count ⇒ consumer stopped /
  wrong `GROUP_KEY` / wrong table prefix). REST check:
  `curl http://localhost:8081/api/tradedata/Gold` (consumer's port,
  case-sensitive item name).
- **Silent non-delivery causes.** `trade-queue` `GROUP_KEY` differs
  between the apps, or `setTablePrefix` differs (both must be
  `"TRADEDATA_"`).

### Video-only (`Week 06 - Enterprise-s1-low.transcript.md`)

- **In-class recap quiz (Week 5 content, carried forward):** open vs
  closed system (open ⇒ unbounded clients ⇒ admission control); acceptable
  throughput but "feels slow" ⇒ system is **saturated** (requests queue);
  Java timer in ns but only changing every ~10 ms ⇒ **coarse resolution**,
  not high precision; server pinned at 500 tps regardless of load ⇒ a
  bottleneck downstream; cache added, no improvement ⇒ **low hit rate**.
- **Phone-call vs email analogy** (verbal framing): synchronous = phone
  call (both on the line, miss it and it's gone); asynchronous = email
  (archived, persistent, neither party present at once).
- **Verbal emphasis:** "messaging does not give end-to-end atomicity"; the
  three-transaction breakdown of request/response; "a central message
  server is a single point of failure — clustering fixes availability but
  risks ordering."
- **Post-lecture Q&A:** a student asks why modern systems use RabbitMQ, or
  different tech for IoT — lecturer: Week 6 deliberately recaps
  *fundamentals*; specific/advanced technologies (RabbitMQ, IoT, database
  services) come in the **next lecture**; RabbitMQ is closer to the
  traditional queue model, Kafka is built around persistent event streams.
  A second student asks about channel-based in-process messaging patterns
  and the actor model — lecturer: follow up on specific topics of
  interest; the same decoupling patterns recur.

## Post-lecture Q&A summary

- **Q: Why do real systems use RabbitMQ / different messaging tech for
  IoT?** A: This week recaps the fundamental concepts and trade-offs;
  concrete products and more advanced cases (IoT, database services) are
  next lecture. RabbitMQ ≈ traditional message-queue model; Kafka ≈
  persistent event streaming — not the same type of system.
- **Q: There are in-process channel / actor-model messaging technologies
  that use similar patterns — is that the same idea?** A: Yes, the same
  decoupling patterns recur across transports; follow up on any specific
  one of interest.
