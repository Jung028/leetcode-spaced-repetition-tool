import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 6,
  paperNumber: 1,
  title: "Week 6 Tutorial: Message-Oriented Middleware (TradeTrack)",
  topics:
    "Week 6 MOM tutorial built on the TradeTrack producer/consumer project (two Spring Boot apps, a PostgreSQL-backed message queue). Why MOM: direct A->B calls create a runtime dependency; a messaging layer lets the producer send and move on while the consumer processes later, so neither needs the other running at that moment (decoupling in time). Producer vs consumer as roles. The tutorial architecture: producer generates Gold/Silver/Platinum prices -> TradeDataDTO -> serialize to a JSON array -> message queue -> consumer deserializes -> saves each DTO to the business database. PostgreSQL plays two distinct roles: TRADEDATA_CHANNEL_MESSAGE is the queue (messages in transit, one message = one row, removed on read), TRADE_DATA is the permanent business table (created by Hibernate from the @Entity). Both apps point at the same trade database because the queue is shared infrastructure; server.port 8080 vs 8081 only avoids a local port clash and is not architectural. DTO vs JSON vs SQL operate at different levels — SQL is how the library talks to Postgres, JSON is the message payload; we never write SQL ourselves. Question 1 (understand the queue): QueueChannel 'out' bean backed by a JdbcChannelMessageStore, IntegrationFlow polling pollMessageFromGroup('trade-queue') once per second; send() -> INSERT one row; receive() -> a DELETE ... RETURNING that takes and removes the oldest row (ORDER BY CREATED_DATE => FIFO, GROUP_KEY identifies the queue, MESSAGE_BYTES holds the content); PostgresChannelMessageStoreQueryProvider supplies the SQL and swapping it changes every query; optional detail FOR UPDATE SKIP LOCKED lets multiple consumers share work, CTID is a Postgres row id. Question 2 (business logic): Math.random() prices, one shared LocalDateTime.now() for all three (one market snapshot -> one message), mapper.writeValueAsString(List.of(...)) to serialize, mapper.readValue(payload, new TypeReference<List<TradeDataDTO>>(){}) to deserialize, loop calling tradeDataService.saveTradeData(dto); JavaTimeModule needed for LocalDateTime, TypeReference needed because of type erasure (List.class yields LinkedHashMap and a ClassCastException), the DTO's empty constructor is required by Jackson, wrap parsing in try/catch because the message is already removed from the queue by the time handle() runs. Part 6 demonstration: stop the consumer, producer keeps sending and never notices, rows accumulate in the queue table, restart the consumer and the backlog is processed with nothing lost — decoupling. When PostgreSQL-as-queue is reasonable (small/simple) vs when a dedicated broker is used (millions of messages, many producers/consumers, retries, routing, delivery guarantees, scaling, consumer management).",
  sourceFiles: [
    "tutorial/Week6-Tutorial-Walkthrough.pdf",
    "tutorial/COMP5348_Tutorial 6.docx",
    "tutorial/tutorial-6-tradeTrack-student/ (Spring Integration QueueChannel + JdbcChannelMessageStore on PostgreSQL)",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "The tutorial motivates MOM by contrasting it with a direct call from Application A to Application B. What specific problem does putting a message queue between them solve?",
      options: [
        "It encrypts the trade data while it is in transit between the two applications, a protection the tutorial says a plain direct socket call from A to B cannot offer on its own",
        "It guarantees that B will eventually process every message it receives successfully, so the tutorial notes that A never has to write any deferred error-handling code at all",
        "It lets A send its message and carry on even while B is temporarily unavailable, instead of A's request failing at that moment and A having to handle the error there and then",
        "It removes the need for either side to serialize its data, because the queue is documented as storing native in-memory Java objects rather than a JSON or byte representation",
      ],
      correctIndex: 2,
      modelAnswer:
        "A direct call creates a runtime dependency: if B is down when A calls, the request fails immediately and A must deal with it now. With a queue, A sends and moves on; the message waits in the queue until B collects it. This is decoupling in time. It does not guarantee the work succeeds — only that the message survives until read.",
    },
    {
      type: "mcq",
      prompt:
        "In the TradeTrack tutorial, PostgreSQL is used for two conceptually different things. Which description of the two tables is correct?",
      options: [
        "TRADEDATA_CHANNEL_MESSAGE is the queue holding messages in transit that are removed as soon as the consumer reads them, while TRADE_DATA is the permanent business table of saved trades",
        "TRADEDATA_CHANNEL_MESSAGE stores the raw JSON message payloads for audit, while TRADE_DATA stores those exact same payloads a second time in a gzip-compressed BYTEA column for long-term archival",
        "TRADEDATA_CHANNEL_MESSAGE holds the permanent trade history that the REST endpoint serves, while TRADE_DATA is a temporary scratch table the consumer truncates and rebuilds on every restart",
        "Both tables are queues: one carries the producer's outgoing price messages and the other carries the consumer's acknowledgement messages that are sent back to the producer after each save",
      ],
      correctIndex: 0,
      modelAnswer:
        "TRADEDATA_CHANNEL_MESSAGE is the queue: one message = one row, held only until the consumer reads it. TRADE_DATA is the business data: the permanent saved trade history, written by the consumer. 'Don't confuse storing a message in the queue with saving the final business data.' The queue table belongs to the messaging library (created by create_table.sql); TRADE_DATA is created by Hibernate from the @Entity class.",
    },
    {
      type: "mcq",
      prompt:
        "Both the producer and consumer connect to jdbc:postgresql://localhost:5432/trade and differ only in server.port (8080 vs 8081). What is the significance of each of those two facts?",
      options: [
        "Same database means the two applications share a single transaction spanning send and receive; the different server.port values tell PostgreSQL which listening port to open for each of the two applications",
        "Same database is what lets Hibernate create the queue table automatically for both sides; the different server.port values set the message priority the JdbcChannelMessageStore stamps on each row it writes",
        "Same database is a mistake carried over from Week 4 where each bank had its own; the different server.port values route the producer's outgoing traffic and the consumer's incoming traffic down separate physical channels",
        "Same database because the queue is shared infrastructure both sides must be able to reach; the different server.port values exist only so two programs do not clash on one local port, which is not an architectural decision",
      ],
      correctIndex: 3,
      modelAnswer:
        "A queue the consumer cannot see is not a queue, so both apps point at the same trade database — the queue is a shared channel. This differs from Week 4 where each bank owned a separate database. The two server.port values just stop 'Port 8080 already in use' when both run on one machine; :5432 (Postgres) is the same for both. server.port is the port the app listens on, unrelated to the DB port.",
    },
    {
      type: "mcq",
      prompt:
        "Neither out.send(...) nor messageStore.pollMessageFromGroup(\"trade-queue\") contains any SQL, yet the queue is a database table. What generates the SQL, and why does the tutorial highlight this?",
      options: [
        "PostgreSQL generates it internally from triggers defined on the queue table, which the tutorial highlights because those triggers must be installed by running create_table.sql before either application starts",
        "Spring Boot generates and inlines it during the Gradle build, which the tutorial highlights because any change to the queue's SQL therefore requires a full recompile and redeploy of both applications",
        "The JdbcChannelMessageStore generates it via a PostgresChannelMessageStoreQueryProvider, which the tutorial highlights because swapping that one provider changes every query without touching any application code",
        "Hibernate generates it by reflecting over the TradeDataDTO class at startup, which the tutorial highlights because it means the DTO must carry JPA @Entity and @Id annotations for the queue to work",
      ],
      correctIndex: 2,
      modelAnswer:
        "The identical JdbcChannelMessageStore bean in both apps turns send/poll into SQL. Its ChannelMessageStoreQueryProvider decides what the SQL looks like — there is a different provider per database (Postgres, MySQL, Oracle, SQL Server). Swapping that single line would change every query without altering the code that calls send() and pollMessageFromGroup(). We never write the SQL ourselves.",
    },
    {
      type: "mcq",
      prompt:
        "In the PostgreSQL queue table, what do GROUP_KEY, CREATED_DATE and MESSAGE_BYTES each do?",
      options: [
        "GROUP_KEY is the unique message id used as the primary key; CREATED_DATE is the time-to-live after which the row is auto-deleted; MESSAGE_BYTES is a checksum the consumer recomputes to detect corruption",
        "GROUP_KEY is the id of the consumer that reserved the row; CREATED_DATE is the timestamp the message was read and removed; MESSAGE_BYTES is the text of the SQL statement the library will run next",
        "GROUP_KEY names the queue so one table can hold several; CREATED_DATE gives the FIFO ordering with the oldest row taken first; MESSAGE_BYTES holds the serialised message content itself",
        "GROUP_KEY is the numeric message priority used for ordering; CREATED_DATE is the count of delivery retries so far; MESSAGE_BYTES is the destination server.port the message should be routed to",
      ],
      correctIndex: 2,
      modelAnswer:
        "GROUP_KEY = the queue name ('trade-queue'), so one table can carry multiple queues. CREATED_DATE = ordering, oldest first, making the queue FIFO. MESSAGE_BYTES = the message itself (stored as bytes because the library serialises the whole Java message object, with your JSON readable somewhere inside). A message is just a row; the queue is just a table.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial reduces the consumer's receive SQL (a DELETE ... RETURNING with a subquery) to a plain-English core. What is that core behaviour?",
      options: [
        "Take the oldest message from this queue, exactly one of them, remove it, and hand back its content — reading and removing happen in one statement so it can never be processed twice",
        "Acquire a table-level lock on the entire queue, count how many rows the group currently has, return that count to the caller, and release the lock without removing any row",
        "Read every message currently queued for the group into memory in one pass, process them as a batch, and then issue a single DELETE that removes the whole group at once",
        "Copy the newest message for the group into a separate archive table and flag the original row as read, but leave that original row physically in the queue table for auditing",
      ],
      correctIndex: 0,
      modelAnswer:
        "ORDER BY CREATED_DATE (oldest), WHERE GROUP_KEY = 'trade-queue' (our queue), LIMIT 1 (just one), DELETE ... RETURNING (remove it and give back its content). Because the message is read and removed in the same statement, it can never be processed twice. FOR UPDATE SKIP LOCKED and CTID are implementation detail — SKIP LOCKED lets multiple consumers share the work; CTID is only needed because SQL will not take ORDER BY/LIMIT directly inside a DELETE.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In the TradeTrack consumer, sending a message is an INSERT into the queue table and receiving one is a SELECT that leaves the row in place for other consumers to also read.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. Sending is an INSERT, but receiving takes AND removes the oldest row (DELETE ... RETURNING). If the row stayed, several consumers would each process the same message. Removing on read is exactly what makes each message processed by only one consumer.",
    },
    {
      type: "mcq",
      prompt:
        "The producer builds three TradeDataDTO objects (Gold, Silver, Platinum) and the tutorial insists all three share a single LocalDateTime.now(). Why send all three in one message with one timestamp?",
      options: [
        "PostgreSQL enforces that every row sharing a GROUP_KEY must also share an identical CREATED_DATE, so the three prices would be rejected by the queue table unless their timestamps matched exactly",
        "A single shared timestamp is what the DELETE ... RETURNING subquery uses as its tie-breaker, so without it the receive query could not decide which of the three metal rows to return first",
        "The three prices are one market snapshot taken at the same moment, so one message keeps them together and a consumer never sees a fresh Gold price sitting next to a stale Silver price",
        "Jackson's writeValueAsString can only serialise one object per call, so putting the three DTOs in a list with a shared timestamp field is the only way to fit them into a single message payload",
      ],
      correctIndex: 2,
      modelAnswer:
        "The message is the unit of delivery — put things in the same message when they belong together. The three prices are one snapshot of the market; sending them as one JSON array means the consumer always gets all three together and consistent. Three separate messages could interleave, leaving the consumer with a mix of new and stale prices.",
    },
    {
      type: "mcq",
      prompt:
        "On the consumer side, why must the payload be deserialized with new TypeReference<List<TradeDataDTO>>() {} rather than List.class?",
      options: [
        "Java erases the generic parameter at runtime, so List.class only says 'a list of something' — Jackson produces LinkedHashMap objects and a ClassCastException; TypeReference keeps the element type as TradeDataDTO",
        "List.class is simply not an accepted argument type for mapper.readValue in this Jackson version; the method signature only takes a TypeReference, so the code would fail to compile if List.class were used",
        "TypeReference transparently decrypts the payload before parsing whereas List.class assumes the bytes on the queue are already plaintext JSON, so List.class throws on the encrypted TradeTrack message",
        "TypeReference caches the parsed field-to-setter schema between successive messages which makes deserialization measurably faster, while List.class re-derives that mapping on every single call to readValue",
      ],
      correctIndex: 0,
      modelAnswer:
        "Type erasure removes the generic parameter at runtime, so List.class cannot tell Jackson what is inside the list — you get back a List<LinkedHashMap> and a ClassCastException when you treat an element as a TradeDataDTO. TypeReference is an anonymous subclass (the trailing {}) whose type argument survives in metadata, so Jackson knows to build TradeDataDTO objects. This is the most common bug in the exercise.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: The consumer's parsing code should be wrapped in try/catch because, by the time .handle(...) runs, the message has already been removed from the queue, so an unhandled exception would lose that message and could disrupt the consumer.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "True. The DELETE ... RETURNING already took the message off the queue before your handler runs. Catching the exception means one bad message is logged and skipped rather than propagating and disrupting the consumer's processing loop. (You also need JavaTimeModule registered on the ObjectMapper, or LocalDateTime deserialization throws InvalidDefinitionException.)",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial explains that DTO, JSON and SQL 'operate at different levels'. Which statement matches that framing?",
      options: [
        "SQL is a third data format the message is converted into between the producer's JSON and the consumer's JSON, so the pipeline is really JSON to SQL to JSON before the DTO is rebuilt on the far side",
        "DTO, JSON and SQL are three interchangeable serialisation formats for the payload and the tutorial simply picks JSON of the three because it is the easiest for a student to read in a SELECT",
        "JSON is how the messaging library actually talks to the database and issues its reads and writes, while SQL is the human-readable format that travels inside the MESSAGE_BYTES column of each queued row",
        "The Java object (DTO) is serialised to JSON as the message payload, while SQL is separately how the library reads and writes the Postgres queue table — the two are not stages in the same pipeline",
      ],
      correctIndex: 3,
      modelAnswer:
        "Data flow: TradeDataDTO --serialize--> JSON --> message queue --> JSON --deserialize--> TradeDataDTO --> database. SQL is not a stage in that flow — it is how the JdbcChannelMessageStore interacts with PostgreSQL underneath the send/poll calls. JSON is the payload; SQL is plumbing; the DTO is the in-memory shape.",
    },
    {
      type: "mcq",
      prompt:
        "In Part 6, you stop only the consumer, leave the producer running for a minute, then check the queue table. What do you observe, and what does it demonstrate?",
      options: [
        "The accumulated rows are silently discarded one by one after each sits unread for ten seconds, which demonstrates that the queue applies a time-to-live and drops messages a stopped consumer misses",
        "The producer throws a connection-refused error on each 10-second send while the consumer is down, which demonstrates that MOM still needs both endpoints online at the moment a message is sent",
        "About six rows have accumulated and the producer never failed or even noticed; restarting the consumer clears the whole backlog within seconds with nothing lost, which demonstrates decoupling",
        "The producer automatically throttles itself down to one message per minute to match the stopped consumer's rate, which demonstrates the back-pressure the JdbcChannelMessageStore applies to senders",
      ],
      correctIndex: 2,
      modelAnswer:
        "Rows build up (one every 10 seconds), the producer keeps sending untouched, and when the consumer restarts it processes the whole backlog in a few seconds. With direct communication a down consumer is an immediate failure for the producer; with a queue the same event becomes a delay. That is what decoupling means and why MOM exists.",
    },
    {
      type: "mcq",
      prompt:
        "The consumer 'uses polling: once per second it checks whether the queue contains a message', while the producer only sends every 10 seconds. What is the consequence the tutorial points out?",
      options: [
        "Polling makes the queue lose its FIFO ordering, because a poll that lands between two sends can pick up the newer message first, so the tutorial warns against relying on CREATED_DATE order",
        "The mismatch between the one-second poll and the ten-second send causes roughly nine in ten messages to be missed, so the tutorial says the two intervals must always be configured to the same value",
        "Most of the per-second poll checks find an empty queue and that is expected behaviour; the tutorial notes other messaging systems may push messages to consumers instead of relying on polling",
        "The consumer ends up processing each message about ten times, once per poll, until the next send replaces it on the queue, so the tutorial adds a de-duplication check keyed on the message id",
      ],
      correctIndex: 2,
      modelAnswer:
        "With a 1-second poll and a 10-second send, roughly nine of every ten checks find an empty queue — that is normal for a polling consumer. It is not a bug and does not affect ordering or delivery; each message is still taken once. Dedicated brokers often push messages to consumers instead of relying on polling.",
    },
    {
      type: "short",
      prompt:
        "The tutorial says implementing the queue mechanism yourself 'would be too complex for the two-hour tutorial', yet you should understand how it works. Summarise the four points a complete answer to Question 1 covers.",
      modelAnswer:
        "1. Architecture: the producer sends to a QueueChannel backed by a JdbcChannelMessageStore, which stores each message as a row in TRADEDATA_CHANNEL_MESSAGE; the consumer polls that same table once per second; the two apps never call each other — the database is the channel. 2. The table: GROUP_KEY identifies the queue, CREATED_DATE gives FIFO order, MESSAGE_BYTES holds the content. 3. The SQL: an INSERT on send; a DELETE ... RETURNING that takes and removes the oldest message on receive; all generated by PostgresChannelMessageStoreQueryProvider, not written by us. 4. What it gives: messages stored durably, delivered in order, each processed by only one consumer.",
    },
    {
      type: "short",
      prompt:
        "When is a PostgreSQL-backed queue a reasonable choice, and when would you reach for a dedicated messaging system like RabbitMQ or Kafka instead?",
      modelAnswer:
        "A database-backed queue is reasonable for a smaller or simpler system: modest message volume, few producers/consumers, and the bonus that you can SELECT and literally look at the messages sitting in the table. Reach for a dedicated broker when you need to handle millions of messages, many producers and consumers, consumer failures and retries, routing, delivery guarantees, high throughput, scaling and monitoring — these systems are built for those messaging concerns. MOM/messaging is the architectural idea; PostgreSQL, RabbitMQ, Kafka, SQS, etc. are technologies that implement it (and RabbitMQ is closer to the traditional queue model while Kafka is built around persistent event streams).",
    },
    {
      type: "mcq",
      prompt:
        "A student runs plain ./gradlew bootRun and gets 'Unable to find a single main class from the following candidates [...ProducerApplication, ...ConsumerApplication]'. What is the cause and the fix the tutorial gives?",
      options: [
        "Both applications are configured with the same server.port so the second JVM aborts during context startup; the fix is to set the consumer to 8081 in its own application-consumer.properties file",
        "The project has two main() classes and build.gradle does not say which to use, so Gradle cannot choose; the fix is to register separate runProducer / runConsumer BootRun tasks, or run each class from the IDE",
        "The create_table.sql script has not been applied to the trade database yet, so the library aborts startup before a main class is chosen; the fix is to run that script against trade and retry",
        "PostgreSQL is not running on port 5432 so Spring Boot cannot pick a main class until the datasource connects; the fix is to start the database server and then re-run the plain bootRun command",
      ],
      correctIndex: 1,
      modelAnswer:
        "There are two separate main() classes and Gradle cannot choose between them. The walkthrough adds two BootRun tasks (runProducer, runConsumer) each with an explicit mainClass, so each application has its own command; alternatively run either class directly from IntelliJ or VS Code. The port and SQL issues are different symptoms with their own fixes.",
    },
    {
      type: "mcq",
      prompt:
        "Once the shared database and queue table exist, the tutorial notes you can start the producer and consumer in either order, and can stop and restart the consumer without error. Why?",
      options: [
        "Spring Boot buffers the first ten messages in an in-memory ring on the producer side until both applications have registered with each other through the shared datasource and completed a handshake",
        "The producer continuously pings the consumer's 8081 health endpoint and pauses its 10-second send loop whenever that endpoint is unreachable, resuming automatically once the consumer comes back up",
        "PostgreSQL replays its write-ahead transaction log into whichever of the two applications happens to start second, so a late-starting consumer is brought up to the producer's current state on connect",
        "The two applications never call each other directly; they communicate only through the queue, which persists messages until somebody collects them, so start order and a consumer restart do not matter",
      ],
      correctIndex: 3,
      modelAnswer:
        "There is no direct binding between producer and consumer — the queue sits between them and persists messages. So start order does not matter, and a consumer restart just resumes collecting from where the queue stands. This is the same decoupling property demonstrated at length in Part 6.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Hibernate creates the TRADEDATA_CHANNEL_MESSAGE queue table automatically on startup, the same way it creates TRADE_DATA.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. Hibernate only builds tables for classes annotated @Entity. There is no entity for messages — that table belongs to the messaging library and needs an exact schema, so you run create_table.sql by hand. TRADE_DATA does come from an @Entity class and appears the first time the consumer runs.",
    },
    {
      type: "scenario",
      prompt:
        "After implementing Question 2, you run both apps and check three things: the consumer console, SELECT * FROM trade_data, and SELECT COUNT(*) FROM tradedata_channel_message. What is the healthy result for each, and what would a growing count mean?",
      modelAnswer:
        "Consumer console: prints a JSON array (the three metals with prices and a timestamp) instead of the old dummy text. trade_data: three new rows every 10 seconds, one per metal, newest first. COUNT(*) on the queue table: almost always 0 — the consumer is collecting messages as fast as the producer sends them. A count that keeps rising means the consumer has stopped, crashed, or is polling a different GROUP_KEY / using a different table prefix, so messages are inserted but never taken. (Also: the REST check is curl http://localhost:8081/api/tradedata/Gold on the consumer's port, and the item name is case-sensitive.)",
    },
    {
      type: "mcq",
      prompt:
        "Producer inserts rows but the consumer never receives them. The walkthrough's troubleshooting table lists two configuration mismatches that cause exactly this silent non-delivery. Which pair is it?",
      options: [
        "The create_table.sql script having been run against the default postgres database rather than trade, and Hibernate's ddl-auto being left disabled so no tables are created",
        "A wrong PostgreSQL password saved in one of the two properties files, and the consumer being started on port 8080 by mistake instead of on its intended port 8081",
        "The 'trade-queue' GROUP_KEY name differing between the two applications, and the JdbcChannelMessageStore setTablePrefix value differing when both must be \"TRADEDATA_\"",
        "The JavaTimeModule not being registered on the consumer's ObjectMapper, and List.class being passed to readValue in place of a TypeReference for the list element type",
      ],
      correctIndex: 2,
      modelAnswer:
        "If the producer writes to GROUP_KEY 'trade-queue' but the consumer polls a different name, or the two JdbcChannelMessageStore beans use different table prefixes, the producer's INSERTs land somewhere the consumer never looks — rows appear but nothing is received. Both the queue name and the \"TRADEDATA_\" prefix must be identical in the two applications. (The JavaTimeModule / TypeReference issues cause deserialization errors, not silent non-delivery.)",
    },
    {
      type: "short",
      prompt:
        "Give the five-sentence summary of the Week 6 tutorial in your own words.",
      modelAnswer:
        "1. Message-Oriented Middleware lets applications communicate by exchanging messages instead of calling each other directly. 2. The producer sends and moves on; the consumer processes later — neither needs the other running at that moment. 3. Here the queue is just a PostgreSQL table: sending is an INSERT, receiving takes and removes the oldest row. 4. PostgreSQL plays two separate roles — the queue table carries messages in transit, the business table stores the saved trade data. 5. The data travels as JSON: Java object -> serialize -> queue -> deserialize -> Java object -> database.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 6,
  paperNumber: 2,
  title: "Week 6 Lecture: Message-Oriented Middleware & Asynchronous Technologies",
  topics:
    "Lecture 6 'Message oriented middleware and asynchronous technologies'. Recap: RPC and synchronous request/response make a remote call look local, but the caller blocks until the reply and if the destination is unavailable the whole application is unavailable (tight coupling; phone-call analogy). Asynchrony: the caller sends a message that is stored until the receiver reads it and replies similarly — non-blocking + persistent queues (email analogy: archived, neither party present at the same time), giving improved availability and performance. Two responses to synchronous problems: (a) enhance the synchronous model (transactional interaction for exactly-once, service replication + load balancing) — but client-side recovery is still the client's problem; (b) change the interaction model to messaging. Message queuing: Send(queue,message) puts a message on a queue, Receive(queue,message) gets one; no dependency on the receiving application's state at send time; suits modular design and complex/heterogeneous interactions. Reliable queuing = persistence: receipt writes the message to a disk log, removal deletes it — a performance-vs-reliability trade-off. 'Guaranteed delivery?' Not really — the queue only guarantees the message survives, not that the work is done; failures surface as deferred exceptions hours or days later, and the sender must be able to recover the state from the time of the request to handle the error. Messaging models: point-to-point (peer-to-peer, participants autonomous, no message server, but sender must know the destination queue); centralised messaging (one central server holds many queues, accessed via RPC, simplifies management but a single point of failure and tight coupling); message queues and clusters (distribute one logical MOM server across a cluster, each message to one instance, danger of out-of-order across instances). Request-and-reply built on async messaging: request queue + response queue, looks synchronous to the app but underneath is async (existing apps connect via adapters). MOM transactions: sender and receiver do NOT share a transaction — a rollback on the receiver does not affect the already-committed sender; 'synchronous' request/response is 3 local transactions (T1 update db + send request; T2 receive request + update db + send response; T3 receive response + update db), not one atomic action; messaging gives decoupling, not end-to-end atomicity. Poison and dead-letter queues: time-to-live and delivery failures move a message to a dead-letter queue for post-mortem; a poison message is one whose processing aborts the transaction so it returns to the queue and can crash the consumer repeatedly — retry limits move it to a poison queue for diagnosis. Quality of service: non-persistent queues (lost on node failure, faster, no disk I/O) vs persistent queues (written to a log, survive node failure, possibly slower); message priority and transactions supported. Products: IBM MQ Series (point-to-point, queue managers, persistent/non-persistent, transactional XA), Microsoft MSMQ (bundled with Windows, point-to-point, persistent, transactional, IP multicast / mput, used with WCF), JMS (a Java API to messaging, not a protocol — says how sender/receiver are coded, not the wire format; no interoperability guarantee unless all use the same MOM). Publish/Subscribe: decouples in design (publishers and subscribers do not know each other); a service publishes events of a type, clients subscribe to types, the system forwards each event to interested subscribers' queues; 1-to-N, N-to-1 and N-to-N; messages published to logical subjects/topics; hierarchical topic names with wildcards and system-side filtering (Sydney/DevGroup/Information/work, Sydney/*/Information); implementation builds a subscription tree and forwards along every path to a subscriber, exploiting network multicast where possible. TIBCO pub/sub: a published message written to the network once (IP multicast/broadcast), replication by routers, filtering on the receiving system; 'rvd' is the per-node daemon, 'rvrd' bridges LANs on a WAN (no WAN multicast). Pub/Sub issues: reliability, transactions, security, performance; strength is dynamic add of publishers/subscribers without architectural change. Message brokers: add logic to the queues for Enterprise Application Integration — message transformation between source/target formats, content-based intelligent routing, a rules engine, adapters; hub-and-spoke architecture; typically built on a MOM layer. Adapters: sit between broker and end systems, an abstraction layer; thin (simple wrappers) vs thick (programmable); centralised (co-located with broker) vs distributed. Point-to-point integration becomes spaghetti (N business processes => ~N^2 interfaces; 5 processes = 20 interfaces); a broker relocates the spaghetti into itself. Enterprise Data Model (EDM) alternative: source sends a common message format as payload, target transforms it into its own representation — 2xN transformations, no broker needed, but agreeing the EDM is the hard part. Broker 'some thoughts': efficient and flexible for EAI provided messages are not too big and the process->queue mapping is well understood; RPC-based enqueue/dequeue is poor for large objects/docs; embedded transformation/routing gets complex; scaling needs replicated brokers; broker failure handling is lightweight; often proprietary though open standards-based options (e.g. Mule) exist. Architectural choices — quality attribute analysis: Messaging pattern (async comms, configurable QoS, loose coupling; queues replicated for availability and failover; strong balance of availability/scalability/loose coupling; format changes still ripple to servers). Publish-Subscribe pattern (many-to-many; even stronger decoupling; topics replicated for availability/scalability; publishers/subscribers added dynamically without config change; multicast/broadcast distributes uniformly; trade-off is reliability/trust since you do not know who is listening). Broker pattern (hub-and-spoke; strong modifiability because transformation and routing are separated from senders/receivers; typed input ports validate and discard wrong-format messages; the broker can become a performance bottleneck under high volume or complex transforms, throughput typically lower than plain reliable messaging; cluster broker instances to scale). Final point: asynchronous messaging does not make RPC disappear — messaging is often built on top of RPC for the enqueue/dequeue calls to the messaging server or broker; the value is the architectural abstraction exposed to the application.",
  sourceFiles: [
    "lecture/COMP5348_W6.pdf",
    "lecture/Week 06 - Enterprise-s1-low.transcript.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "The lecture recaps synchronous RPC before introducing messaging. What is the core disadvantage of synchronous interaction it wants you to feel?",
      options: [
        "It can only marshal primitive parameter types across the wire, so any call that needs to pass a structured object or a collection between caller and callee is impossible without a custom protocol",
        "It tightly couples caller and callee so both must be alive at once, and if the destination is unavailable the caller blocks and its whole application becomes unavailable too",
        "It forces every call to be individually encrypted and signed before transmission, adding a fixed cryptographic latency to each request that the application has no way to switch off or amortise",
        "It loses the caller's entire request whenever the underlying network drops even a single packet mid-call, because the RPC layer has no retransmission and the caller cannot tell a slow reply from a lost one",
      ],
      correctIndex: 1,
      modelAnswer:
        "Synchronous middleware introduces tight coupling: the caller waits until the reply comes back, and if the destination is down the caller blocks and its application is unavailable too. The lecture's analogy: a synchronous call is a phone call — both parties must be on the line at once; miss it and you have spent the time waiting for nothing.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture gives two attributes of asynchronous interaction. Which pair is correct?",
      options: [
        "Synchronous fallback, meaning the call reverts to blocking RPC if the queue is slow, and automatic client-side recovery, meaning the middleware restores the caller's state after any delivery failure",
        "Exactly-once delivery, meaning the infrastructure guarantees each message is processed one time only, and a shared transaction, meaning the sender and receiver commit or roll back their work together",
        "Encrypted-by-default, meaning every payload is protected on the wire without configuration, and compressed-on-the-wire, meaning the middleware shrinks each message before it enters the queue",
        "Non-blocking, meaning the service is invoked but the call returns immediately without waiting for a response, and persistent queues, meaning the request and response are stored until each side accesses them",
      ],
      correctIndex: 3,
      modelAnswer:
        "Asynchronous interaction: the caller sends a message that is stored somewhere until the receiver reads it and replies in the same way. Its two attributes are non-blocking (service invoked, call returns immediately) and persistent queues (request and response are persistently stored until accessed). Email analogy: archived and persistent, and neither party need be present at the same time.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture describes two solutions to the problems synchronous interaction causes. What are they, and what limitation does the first still have?",
      options: [
        "Move calls onto faster hardware and wider network links, and add more worker threads on the server; the first still cannot let the client and server run at genuinely different times, only reduce the wait",
        "Switch the transport from TCP to UDP with application-level retries, and add sequence numbers for ordering; the first trades away the delivery ordering guarantees that the synchronous model provided by default",
        "Enhance the synchronous model with transactional interaction for exactly-once semantics plus service replication and load balancing, and change the interaction model to messaging; the first still leaves client-side recovery as the client's problem",
        "Put a read-through cache in front of the service and add a load balancer across replicas, and shard the database behind it; the first only helps workloads that are dominated by repeated identical read requests",
      ],
      correctIndex: 2,
      modelAnswer:
        "Solution 1: keep synchronous interaction but add mechanisms — transactional interaction to enforce exactly-once semantics, and service replication + load balancing to keep the service available through failures. But recovery on the client side is still the client's problem — it works around the problem rather than removing it. Solution 2: change the interaction model itself to asynchronous messaging.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Once a message is safely placed on a persistent queue, the messaging system has guaranteed that the requested work will eventually be carried out successfully.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. Putting a message on a queue only guarantees the message survives — not that the work will be done or the response produced. Failures become 'deferred exceptions' that surface hours or days later, and the sender must be able to recover the state from the time of the request to handle the error. Messaging moves the failure-handling complexity into the application; it does not remove it.",
    },
    {
      type: "mcq",
      prompt:
        "In the point-to-point messaging model as the lecture presents it, which statement is true?",
      options: [
        "Messages pass directly from the sending system's queue to the receiving system's queue with no message server, and participants stay autonomous, but the sender must know the destination queue",
        "A service announces events of a given type and any number of subscribers that registered interest receive them, without the publisher and subscribers needing to know anything about each other",
        "A single central message server owns the queues for every participant and is reached by clients through ordinary RPC calls, which is what keeps the participants loosely coupled to one another",
        "Every message is broadcast to all participants at once and each recipient filters locally for the subset it actually wants, so no participant needs to know the address of any other participant",
      ],
      correctIndex: 0,
      modelAnswer:
        "Point-to-point / peer-to-peer: message goes from the sending queue on the sending system to the receiving queue on the receiving system, then to the receiving application. No intermediaries, no message server — all participants run embedded MQ code, which keeps them autonomous. The cost is that the sender still has to know which destination queue to use, which makes the network complex as it grows.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture moves from centralised messaging to clustering. What problem does clustering solve, and what new danger does it introduce?",
      options: [
        "It solves the high per-server licensing cost by pooling capacity, and introduces the danger of deep vendor lock-in to the specific clustering product that coordinates the message-server instances",
        "It solves slow serialisation by parallelising it across nodes, and introduces the danger that different nodes serialise with incompatible library versions so some receivers cannot decode the payload",
        "It solves the message-encryption gap by spreading key material across nodes, and introduces the danger that a single compromised node leaks the keys needed to read every queue in the cluster",
        "It solves the central server being a single point of failure, since a cluster keeps serving if one instance fails, and introduces the danger of messages going out of order when handled by different instances",
      ],
      correctIndex: 3,
      modelAnswer:
        "A single central message server simplifies management but is a single point of failure that tightly couples all clients. Distributing one logical MOM server across a cluster, with each message allocated to one instance, restores availability and scalability. The danger: if messages are handled by different instances they may not be delivered in the order they were sent. There is always an availability/performance/ordering trade-off.",
    },
    {
      type: "scenario",
      prompt:
        "The lecture says a 'synchronous' request/response built on messaging is actually three transactions, not one. Lay out the three, and state what messaging does and does not give you here.",
      modelAnswer:
        "T1: the sender updates its database and puts the request message on the request queue, committed as one local transaction. T2: the receiver gets the request from the request queue, updates its database, and puts the response on the response queue, as another local transaction. T3: the sender gets the response from the response queue and updates its database, a third local transaction. Sender and receiver do not share a transaction — a rollback on the receiver does not undo the sender's already-committed T1. Messaging gives decoupling (neither side need be online at once, each step is locally atomic) but not end-to-end atomicity across the whole interaction; the application must cope with partial completion.",
    },
    {
      type: "mcq",
      prompt:
        "Distinguish a dead-letter queue from a poison message, as the lecture defines them.",
      options: [
        "They are two names for the same construct, with 'poison queue' being the Microsoft MSMQ term and 'dead-letter queue' being the IBM MQ Series term for the identical hold-aside area for bad messages",
        "A dead-letter queue holds messages awaiting a decryption key that has not yet been provisioned, and a poison message is one that failed its integrity check on arrival and so cannot be trusted for processing",
        "A dead-letter queue holds messages that could not be delivered (TTL expiry or other delivery failures) for later post-mortem, and a poison message is one whose processing aborts the transaction so it returns to the queue and can crash the consumer repeatedly until retry limits move it aside",
        "A dead-letter queue holds messages that exceeded their configured retry limit after repeated processing failures, and a poison message is any message whose serialised size is larger than the queue's per-message limit",
      ],
      correctIndex: 2,
      modelAnswer:
        "Dead-letter queue: messages that could not be delivered — time-to-live expired or other delivery failures — moved aside on the sender for diagnosis. Poison message: code reads it, then aborts the transaction, so the message returns to the queue and is read again; reasonable once (e.g. a transient deadlock), but if it keeps crashing the consumer, a retry limit moves it to a poison queue for admin/diagnosis.",
    },
    {
      type: "mcq",
      prompt:
        "Non-persistent vs persistent queues — which comparison matches the lecture's quality-of-service slide?",
      options: [
        "Non-persistent queues are the only kind that support message priority ordering, while persistent queues are the only kind that can take part in transactional send-and-receive with the application's database",
        "Non-persistent queues write every message to a disk log so it survives a node failure but run slower, while persistent queues keep messages only in memory so they are faster but are lost if the node fails",
        "Non-persistent queues lose messages if the node fails before the recipient reads them but are faster with no disk I/O, while persistent queues write each message to a log file on disk and survive node failure but are possibly slower",
        "Non-persistent queues can only be used with the publish/subscribe topic model, while persistent queues can only be used with the point-to-point messaging model where each message has one destination",
      ],
      correctIndex: 2,
      modelAnswer:
        "Non-persistent queues avoid disk I/O so they are faster, but a node failure before the message is read loses it. Persistent queues write each message to a disk log so it survives a node failure, at some performance cost. Both support message priority and transactions. This is the performance-versus-reliability trade-off again, made an architectural decision.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: JMS is a messaging protocol that defines what messages look like on the wire, so any two applications using JMS can interoperate regardless of the underlying product.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. JMS (Java Message Service) is an API, not a protocol. It specifies how the sender and receiver are coded, not what the messages look like on the wire. There is no guarantee of interoperability between applications unless they all use the same underlying MOM (JMS over MQ, over TIBCO, JMS-only vendors, etc.).",
    },
    {
      type: "mcq",
      prompt:
        "How does publish/subscribe change the coupling between components compared with a queue, per the lecture?",
      options: [
        "It removes coupling in space but keeps coupling in time, so a publisher and its subscribers must still be online during the same window for an event to be delivered rather than dropped",
        "It removes coupling in design as well as in time: publishers do not know subscribers and vice versa, both can appear and disappear dynamically, and adding a subscriber needs no change to the publisher",
        "It couples them more tightly than a queue, because each subscriber has to register directly with every publisher it wants events from and re-register whenever a publisher restarts or moves",
        "It makes no real difference to coupling, since publish/subscribe is just a queue with the endpoints renamed 'topic', 'publisher' and 'subscriber' while the delivery semantics stay one-to-one",
      ],
      correctIndex: 1,
      modelAnswer:
        "A queue decouples in time (send now, receive later) but the sender still has to know which queue. Pub/sub also decouples in design: a service publishes events of a type, clients subscribe to types, and the infrastructure forwards each event to interested subscribers. Publishers and subscribers do not know each other and can be added or removed dynamically — adding a subscriber (billing, shipping, analytics on an 'order placed' event) needs no change to the publisher, which is why pub/sub aids scalability and modifiability.",
    },
    {
      type: "mcq",
      prompt:
        "Topic naming in the lecture is hierarchical with wildcards, e.g. Sydney/DevGroup/Information/work and Sydney/*/Information. What does the middleware do with these?",
      options: [
        "It builds a subscription tree recording, per topic, which nodes and paths lead to subscribers, forwards each publication along every path toward a possible subscriber, and lets one wildcard subscription match a whole subtree with the system doing the filtering",
        "It requires every subscriber to spell out the exact full topic path it wants, treating the wildcard forms in the slides as documentation shorthand that the runtime does not actually accept from clients",
        "It ignores the path hierarchy entirely and floods every publication to every node, leaving each receiving application to parse the topic string itself and discard the messages it did not want",
        "It expands each wildcard subscription into a separate physical queue for every currently matching topic at subscribe time, then tears those queues down and rebuilds them whenever a new topic appears",
      ],
      correctIndex: 0,
      modelAnswer:
        "The system builds a tree indicating, for each topic, where subscribers can be found; each new publication is forwarded on every path leading to a possible subscriber, exploiting network-level multicast to avoid repeated messages on a link. Wildcards (Sydney/*/Information, Sydney/DevGroup/*/*) let a single subscription cover a subtree, and the system does the filtering to decide whether to forward a given publication.",
    },
    {
      type: "mcq",
      prompt:
        "In the TIBCO pub/sub example, what do 'rvd' and 'rvrd' refer to?",
      options: [
        "'rvd' is the content-based rules engine that decides which subscribers match a publication and 'rvrd' is the routing table that engine consults to find the network path to each matched subscriber",
        "'rvd' is the on-the-wire message format used within a LAN and 'rvrd' is the more compact compressed format the system switches to when a publication has to cross a wide-area network link",
        "'rvd' is the per-node daemon that sends and receives messages on one node, and 'rvrd' is the daemon that bridges one LAN to others across a WAN where WAN multicast is not available",
        "'rvd' is a persistent database table that stores every published message for replay and 'rvrd' is its read replica kept on a second node so that publication history survives a single-node failure",
      ],
      correctIndex: 2,
      modelAnswer:
        "rvd is TIBCO's name for the daemon on each node that sends and receives messages; a published message is written to the network once (IP multicast/broadcast), routers replicate it, and filtering happens on the receiving system. rvrd is the daemon that sends/receives between LANs on a WAN, since the WAN example assumes no multicast support.",
    },
    {
      type: "short",
      prompt:
        "What capabilities does a message broker add beyond a plain queue, and what architecture is it typically drawn as?",
      modelAnswer:
        "A broker adds logic at the level of the messaging infrastructure, developed for Enterprise Application Integration: message transformation between different source and target formats (with mapping tools and a format repository), content-based intelligent routing, a rules engine (scripting language, built-in functions, a programming environment), and adapters to end systems. It is typically drawn as hub-and-spoke — senders and receivers are spokes connecting to a central hub that transforms, routes and applies rules — and it is usually (though not necessarily) built on top of a MOM layer.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture shows point-to-point integration turning into 'spaghetti': 5 business processes needing about 20 interfaces. It then shows a broker and the Enterprise Data Model as responses. What does each actually achieve?",
      options: [
        "The broker and the Enterprise Data Model are two names for the same hub-and-spoke technique, so choosing one over the other is only a question of which vendor's product and terminology the enterprise has adopted",
        "The broker cuts the interface count to zero by making all systems speak its native format directly, while the Enterprise Data Model deliberately raises the count back toward N-squared to provide redundant integration paths",
        "The broker relocates the spaghetti into itself as one managed place for transformation and routing, while the Enterprise Data Model has each source emit a common format and each target transform it locally, giving 2xN transformations with no broker but requiring agreement on the common model",
        "The broker removes essentially all integration effort by auto-generating the interfaces, while the Enterprise Data Model removes the need to define any message format at all because every system reads raw bytes",
      ],
      correctIndex: 2,
      modelAnswer:
        "Point-to-point evolution gives roughly N^2 brittle interfaces. A broker does not remove the complexity — it relocates the spaghetti into the broker, but now it is in one managed place with transformation and routing separated from endpoints. The EDM alternative: source emits a common message format as payload, target transforms that into its own representation — 2xN transformations and no broker — but getting organisational agreement on the enterprise data model is the tough part.",
    },
    {
      type: "mcq",
      prompt:
        "In the quality-attribute analysis, which trade-off is correctly matched to the pattern?",
      options: [
        "Messaging pattern: delivers guaranteed end-to-end atomicity across the sender and receiver so a rollback anywhere undoes the whole interaction, at the cost of much lower scalability than pub/sub or a broker",
        "Publish-subscribe pattern: very strong modifiability and decoupling because publishers and subscribers can be added dynamically without touching the architecture, but reliability and trust are the weak point since you do not know who is listening",
        "Messaging pattern: native many-to-many delivery with no coupling at all between the endpoints, but it is the one pattern of the three that cannot be made highly available through replication",
        "Broker pattern: the highest availability and the highest raw message throughput of the three patterns, with no realistic bottleneck risk because the hub validates and routes each message in constant time",
      ],
      correctIndex: 1,
      modelAnswer:
        "Pub/sub: topics replicate for availability and scalability, publishers and subscribers can be added without architectural change (high modifiability), multicast/broadcast distributes uniformly — but you do not know who is subscribed, so reliability, trust and security of the delivery are the trade-off. Messaging: strong balance of availability, scalability and loose coupling (replicated queues, failover), though message-format changes still ripple to servers. Broker: strong modifiability (transformation/routing separated from endpoints) but the hub can become a performance bottleneck and needs clustering to scale.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: With replicated brokers, typed input ports let a broker validate and discard messages sent in the wrong format, and senders can fail over to a live broker if a replica fails.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "True. The broker pattern's failure-handling analysis: brokers have typed input ports, so they validate incoming messages and discard wrongly-formatted ones; with replicated brokers a sender can fail over to a live replica if one fails. High availability for brokers is built with the same clustering mechanisms used for messaging and pub/sub servers.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture's final point is that asynchronous messaging 'does not mean remote procedure call disappears'. What does it mean?",
      options: [
        "It means RPC is really a special case of publish/subscribe in which there happens to be exactly one subscriber, so any RPC system can be re-expressed as a one-subscriber topic without changing its behaviour",
        "It means messaging is measurably slower than RPC for every workload, so well-designed systems keep RPC on the latency-critical paths and use messaging only where a delay of hours would be acceptable",
        "It means messaging is often built on top of synchronous communication, with RPC used underneath for the enqueue and dequeue calls to the messaging server or broker; what changes is the abstraction the application sees",
        "It means RPC and messaging are mutually exclusive design choices, so committing to a messaging architecture requires methodically removing every remaining synchronous RPC call from the codebase",
      ],
      correctIndex: 2,
      modelAnswer:
        "Many messaging implementations use RPC internally to talk to the messaging server or broker (the earlier slides note centralised message servers are 'accessed by clients using RPC calls'). Messaging is frequently layered on synchronous mechanisms; the benefit is the abstraction the application sees — send/receive with decoupling in time — not the disappearance of RPC.",
    },
    {
      type: "mcq",
      prompt:
        "A colleague argues: 'we should replace all our synchronous service calls with a central message server because it will make the system more available.' Using the lecture, what is the flaw?",
      options: [
        "Central message servers only implement the publish/subscribe model, so the existing point-to-point service calls could not be moved onto one without first rewriting every caller as a topic subscriber",
        "Central message servers cannot carry request/response interactions at all, only fire-and-forget notifications, so migrating the synchronous service calls onto one would stop those interactions from working",
        "A single central message server is itself a single point of failure that tightly couples every client to it; availability only genuinely improves if that logical server is clustered, and clustering then risks messages going out of order across instances",
        "There is no real flaw: a central message server has no single point of failure by design because its queues are always internally replicated, so availability improves as soon as it is introduced",
      ],
      correctIndex: 2,
      modelAnswer:
        "Centralised messaging simplifies management (one server, many queues) but introduces a single point of failure and makes all clients tightly coupled to it — participants are no longer autonomous. Availability only genuinely improves if that logical server is distributed across a cluster, and then messages allocated to different instances can go out of order. It is a trade-off, not a free win.",
    },
    {
      type: "short",
      prompt:
        "Give the email-vs-phone-call analogy the lecturer uses, and state exactly which property of messaging each part of the analogy is illustrating.",
      modelAnswer:
        "A synchronous call is a phone call: both people must be on the line at the same moment; if you ring and they do not pick up, you reach nothing and have spent the time waiting — this illustrates tight temporal coupling and blocking. Asynchronous messaging is email: you send it and get on with other things, the message sits in a server/archive, and the reply comes whenever the other side is ready — this illustrates non-blocking send and decoupling in time. Emails being archived and persistent illustrates the persistent-queue property: a missed message is not lost forever, unlike a missed phone call.",
    },
    {
      type: "mcq",
      prompt:
        "A student asks after the lecture why modern systems use RabbitMQ, or different technologies for IoT. How does the lecturer position this relative to Week 6?",
      options: [
        "He says Week 6 deliberately recaps the fundamental concepts and that specific and more advanced cases such as database services and IoT come in the next lecture, because the fundamentals are what carry across the tools",
        "He says RabbitMQ and Kafka are interchangeable in every scenario, so which one a team picks is purely a matter of familiarity and has no bearing on the delivery semantics the application will get",
        "He says RabbitMQ and similar products supersede the models in the lecture, so the messaging, pub/sub and broker concepts are now mainly of historical interest rather than something to design with",
        "He says IoT devices do not use messaging middleware at all and communicate only through direct synchronous RPC, so those systems fall outside the scope of everything covered in this week's material",
      ],
      correctIndex: 0,
      modelAnswer:
        "The lecturer frames Week 6 as reinforcing fundamentals — why we need asynchronous messaging, the models, and the design trade-offs — and defers specific/advanced technologies (RabbitMQ, IoT, database services) to the following lecture. The tutorial notes add the related point that RabbitMQ is closer to the traditional message-queue model while Kafka is built around persistent event streams.",
    },
  ],
};

export const WEEK_6_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
