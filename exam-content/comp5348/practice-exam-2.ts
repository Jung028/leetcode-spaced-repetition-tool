import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 9,
  paperNumber: 4,
  title: "Practice Exam 2",
  topics:
    "A practice-exam paper built directly from the unofficial AI-generated 'COMP4348/COMP5348 2026 S2 Practice Exam 2' and its answer key, converted to Phase-1 recognition-only format. Covers: REST idempotency contrasts (PUT vs POST), SOAP/WSDL Document-Literal vs RPC-Encoded, Two-Phase Commit Prepare-phase mechanics, ETags/If-None-Match/304 caching, row-level vs table-level locking trade-offs, series/parallel availability calculations, VM vs container isolation, naming quality attributes (portability, scalability, availability, testability) from a described requirement, fill-in-the-blank terms (idempotent, compensating transaction, dead-letter queue, HATEOAS), the layered architecture model (tier/layer identification) and the three categories of state (local computation/session/resource state) applied to a stateful in-memory microservice bug, Saga pattern design with compensating transactions versus 2PC infeasibility for third-party participants, 'no isolation' in saga compensation, idempotent-consumer design for at-least-once message delivery versus dead-letter/poison-message handling, and queueing-theory capacity planning (service demand Di, bottleneck identification, Xmax, N* knee calculation, lightly- vs heavily-loaded regions) with real worked numbers. Phase-1 recognition-only: the source document's Part II written/scenario sub-questions have each been converted into a single-best-answer mcq or fillblank grounded in the official answer's own reasoning, with distractors built from plausible same-category misconceptions and near-miss calculations.",
  sourceFiles: [
    "COMP4348_COMP5348_2026_S2_Practice_Exam_02.pdf (Desktop, unofficial AI-generated practice exam used as source)",
    "COMP4348_COMP5348_2026_S2_Practice_Exam_02_Answers.pdf (Desktop, unofficial AI-generated answer key used as source)",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "RideCo's REST API offers PUT /rides/{id}/status, which sets a ride's status to an exact value sent by the client, and a separate POST /rides, which creates a brand-new ride request. A junior engineer claims both endpoints are idempotent, because calling either one twice with the same input \"does the same thing.\" Which statement correctly evaluates this claim?",
      options: [
        "The engineer is partly correct: PUT is idempotent because repeating it leaves the ride in the same end state, but POST is not idempotent because each call is expected to create a new ride resource.",
        "The engineer is correct: PUT is idempotent because repeating it leaves the ride in the same end state, and POST is also idempotent because resending the same ride details simply overwrites the previous request.",
        "The engineer is incorrect: neither PUT nor POST is idempotent, since both methods are defined to always create a new resource representation on every call.",
        "The engineer is partly correct, but for the opposite reason: POST is idempotent because it always targets the same fixed collection URI, while PUT is not idempotent because it modifies existing data.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of PUT like writing today's date on a whiteboard: no matter how many times you write \"Tuesday\" on it, the board still only ever says \"Tuesday\" once. POST is more like stapling a brand-new sheet of paper onto a pile — do it twice and you get two sheets.\n\n• What idempotent means: doing an operation once has exactly the same end result as doing it two, three, or a hundred times.\n\n• Why PUT qualifies: it replaces the ride's status with an exact given value, so repeating the identical call just sets it to the same value again.\n\n• Why POST doesn't: POST is defined to create a brand-new resource every time it's called, so resending the same details with POST typically creates a second, duplicate ride.\n\n• Why the other options are wrong: claiming both are idempotent ignores that POST creates a new resource each time; claiming neither is idempotent ignores that PUT genuinely does leave the ride in the same end state; and swapping which method is idempotent gets the two the wrong way round — POST is the one that is NOT idempotent, not PUT.\n\nSo the answer is: PUT is idempotent, POST is not — the engineer is only partly correct.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo's legacy partner integration still uses a SOAP (Simple Object Access Protocol) web service to settle driver payouts with a banking partner. The WSDL (Web Services Description Language) contract for this service can be generated in either a Document/Literal style or an RPC/Encoded style. Which statement about choosing between these two SOAP encoding styles is correct?",
      options: [
        "RPC/Encoded should be preferred because its body always validates directly against an XML Schema, making it the WS-I Basic Profile's recommended, most interoperable choice.",
        "Document/Literal should be preferred: its body is a well-formed XML document validated against an XML Schema, and it is the WS-I Basic Profile's recommended, more interoperable style.",
        "The two styles are functionally identical at the wire level, so the choice only affects which programming language can generate client stubs from the WSDL.",
        "RPC/Encoded should be preferred for cross-vendor integrations, because its encoding rules are standardized by UDDI, independently of whichever SOAP toolkit each partner uses.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Document/Literal is like mailing a fully filled-in, standard government form — anyone can check it against the official template to confirm every field is correct. RPC/Encoded is more like writing the same request in your own personal shorthand, which two people who already know each other's shorthand can read, but a stranger can't easily verify.\n\n• Document/Literal: the message body is a well-formed XML document that validates directly against an XML Schema, and it's the style the WS-I (Web Services Interoperability) Basic Profile recommends for cross-vendor interoperability.\n\n• RPC/Encoded: uses SOAP's own older encoding rules to represent a procedure call directly, which different toolkits and vendors struggle to agree on — exactly why it's discouraged for new integrations like this bank payout link.\n\n• Why the other options are wrong: RPC/Encoded does not validate directly against a schema the way Document/Literal does; the two styles are not identical at the wire level; and UDDI is a service-directory concept, not the thing standardizing RPC/Encoded's rules.\n\nSo the answer is: Document/Literal should be preferred, because it's schema-validated and the more interoperable, WS-I recommended style.",
    },
    {
      type: "mcq",
      prompt:
        "During the Prepare phase of Two-Phase Commit (2PC — a protocol for getting several systems to all commit or all abort together) between RideCo's Transaction Manager and two Resource Managers — the rider's bank and the driver's payout account — the payout account's Resource Manager replies \"vote_commit.\" What has actually happened at the payout account at this exact point?",
      options: [
        "The payout account's balance has already been updated, and the vote simply confirms that the write was successful and durable.",
        "The payout account's Resource Manager has released all the locks it was holding, since voting \"commit\" means the risk has passed.",
        "The payout account's Resource Manager has saved the intended change and can still vote either way, but it has not actually applied the balance change yet.",
        "The payout account's Resource Manager has forwarded the decision to the rider's bank directly, bypassing the Transaction Manager for the remaining steps.",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like a group of friends deciding on a restaurant by text: everyone first texts \"I'm in, ready to book\" before anyone actually pays a deposit, and nobody pays until the organiser texts back that everyone said yes.\n\n• What the Prepare phase does: each Resource Manager checks it can do its part, saves the intended change somewhere durable, and votes yes or no — without touching the real, live data yet.\n\n• What happens next: only after the Transaction Manager collects every vote and sees all \"yes\" does it tell everyone to commit, and only then does the balance actually change.\n\n• Why the other options are wrong: the balance isn't updated yet, so it can't already be durably written; locks are held through both phases, not released early on a \"commit\" vote; and only the Transaction Manager coordinates the final decision, participants never forward it directly to each other.\n\nSo the answer is: the change is saved and ready to apply, but hasn't been applied yet.",
    },
    {
      type: "mcq",
      prompt:
        "A rider's app repeatedly polls GET /rides/{id} for status updates. RideCo's API returns an ETag (a version fingerprint the server attaches to a resource) with each response, and the app sends that value back in an If-None-Match header on the next poll. The ride's status hasn't changed since the last poll. Which response should the server send, and why does this help performance?",
      options: [
        "200 OK with the full ride representation again, because an ETag only protects writes from lost updates, not ordinary reads like this poll.",
        "201 Created with a Location header pointing at the unchanged resource, because the matching ETag means a new representation reference must be issued.",
        "409 Conflict, because a matching ETag indicates the client's cached copy is now stale relative to the server's current version.",
        "304 Not Modified with no response body, because the matching ETag shows the client's cached copy is still current, so re-sending it would waste bandwidth.",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's like asking a friend whether anything changed in the group chat since you last checked. If the answer is \"nope, still the same,\" you don't need them to re-read you the entire chat history — \"nope\" is enough.\n\n• What an ETag is: a short fingerprint, like a version stamp, that the server attaches to a resource's current representation.\n\n• How If-None-Match uses it: the client sends back the fingerprint it already has, and the server compares it to the current one.\n\n• If they match: the server returns 304 Not Modified with an empty body, telling the client its copy is still correct without re-sending the whole ride representation.\n\n• Why the other options are wrong: ETags apply to reads just as much as writes; nothing about a matching fingerprint calls for issuing a new resource reference or signalling a conflict — a match means everything is fine, the opposite of stale.\n\nSo the answer is: 304 Not Modified with no body, because re-sending unchanged data would waste bandwidth.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo's billing database originally locked the entire rides table during every status update, and the team is considering switching to row-level locking instead. Which statement correctly describes the trade-off?",
      options: [
        "Row-level locking reduces contention and allows more concurrent updates, but it increases locking overhead and the risk of deadlocks compared to table-level locking.",
        "Row-level locking increases contention because more individual locks must be checked, but it eliminates the possibility of deadlocks entirely.",
        "Table-level locking is strictly better in every respect: it has lower overhead, fewer deadlocks, and does not reduce concurrency compared to row-level locking.",
        "Row-level and table-level locking have identical performance characteristics, since the database's lock manager always escalates row locks to a table lock once contention appears.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Table-level locking is like locking the whole kitchen so only one chef can cook at a time, even if they're using completely different stoves. Row-level locking is like each chef only locking the one stove they're actually using — more people can cook at once, but now two chefs can end up each waiting on a stove the other is holding.\n\n• Row-level locking's benefit: different rows can be updated by different transactions at the same time, which is exactly what a busy, live rides table needs.\n\n• Row-level locking's cost: the database has to track far more individual locks, and because transactions can each hold different rows while waiting on others, the risk of a deadlock goes up.\n\n• Table-level locking's trade-off: simpler and lower deadlock risk, but it blocks concurrency that would otherwise be perfectly safe — the wrong fit for a table under live concurrent traffic.\n\n• Why the other options are wrong: row-level locking reduces contention, it doesn't increase it, and it does not eliminate deadlocks; table-level locking is not \"strictly better,\" it trades away concurrency; and the two locking strategies do not behave identically.\n\nSo the answer is: row-level locking allows more concurrent updates, but with more overhead and a higher deadlock risk than table-level locking.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo's payment path depends on two components in series: an API gateway (99.9% available) and a payment processor (99% available). A proposal adds a second, independent payment processor in parallel with the first — either one being available is enough — while keeping one API gateway. Approximately what does this change do to overall system availability?",
      options: [
        "Overall availability drops, because adding any additional component to the system can only ever decrease availability, regardless of how it is connected.",
        "Overall availability rises from about 98.9% to about 99.89%, because the parallel processors raise the processor stage's availability close to 100% while the gateway's 99.9% remains in series.",
        "Overall availability stays at exactly 98.9%, because the API gateway's availability is the true bottleneck and no change to the processors can affect the combined figure.",
        "Overall availability becomes exactly 99.99%, because adding one redundant replica to any series system always yields one additional \"nine\" of availability.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Putting two payment processors side by side, with either one able to cover the job, is like keeping a spare key hidden outside the house — you're only locked out if both your pocket key and the spare are lost at the same time, which is far less likely than losing just one.\n\n• Step one, the parallel processor pair: availability equals 1 minus (1 minus 0.99) squared, which is 1 minus 0.0001, about 99.99%.\n\n• Step two, combined with the gateway, still in series: total availability is about 0.999 times 0.9999, roughly 99.89%.\n\n• The takeaway: redundancy in parallel only ever raises availability, while a component still in series — here, the lone gateway — only ever caps it, so the gateway is now effectively the new bottleneck.\n\n• Why the other options are wrong: redundancy raises availability rather than lowering it; the processor stage's improvement does move the combined number even though the gateway still matters; and gaining exactly one more \"nine\" isn't a fixed rule — the actual gain depends on the specific numbers involved.\n\nSo the answer is: it rises to about 99.89%, with the gateway now the limiting factor.",
    },
    {
      type: "mcq",
      prompt:
        "A platform engineer at RideCo explains the difference between running the matching service in virtual machines versus in containers. Which statement correctly describes the key distinguishing fact between the two?",
      options: [
        "Containers each run their own independent guest operating system atop a hypervisor, which is why they start more slowly than virtual machines.",
        "Virtual machines share a single host operating-system kernel across all VMs on a server, while containers each boot a separate guest OS, making containers the heavier-weight option.",
        "Virtual machines each run a full guest OS atop a hypervisor, while containers share the host OS kernel through a container runtime, which is why containers start faster and pack more densely.",
        "Both virtual machines and containers share the host OS kernel; the only real difference is that containers are managed by Kubernetes while VMs are managed by a hypervisor.",
      ],
      correctIndex: 2,
      modelAnswer:
        "A virtual machine is like building an entirely separate house, complete with its own plumbing and electrical system, just to rent out one room. A container is like renting a room in a house that already has shared plumbing and electricity — much faster to move into, and more rooms fit in the same building.\n\n• VMs: each runs a full, independent guest operating system on top of a hypervisor, the layer that lets several VMs share one physical machine — heavyweight, and booting a fresh guest OS takes real time.\n\n• Containers: they share the host machine's OS kernel directly, through a container runtime, isolating only the application and its dependencies — much lighter weight.\n\n• Why this matters: sharing the kernel is exactly why containers start in seconds with no OS to boot, and why far more of them fit on the same hardware than VMs.\n\n• Why the other options are wrong: containers don't each run their own guest OS — that describes VMs; VMs don't share one kernel across every VM — that describes containers; and the real difference is the kernel-sharing architecture, not which tool happens to manage each one.\n\nSo the answer is: VMs each run a full guest OS on a hypervisor, while containers share the host's OS kernel through a container runtime.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo's engineering team wants to run their entire matching engine unmodified on AWS today, and on Google Cloud next year, without rewriting any code tied to a specific cloud vendor's APIs. Which quality attribute does this requirement mainly address?",
      options: ["Scalability", "Availability", "Interoperability", "Portability"],
      correctIndex: 3,
      modelAnswer:
        "It's like a phone charger that works in any country's wall socket with just an adapter — the same device runs somewhere new without being redesigned.\n\n• What the requirement actually asks for: the same software, unmodified, running on a different vendor's platform.\n\n• Why it's not the others: scalability is about handling more load, availability is about staying up despite failures, and interoperability is about separate systems working together — none of those is what \"runs unmodified on a different cloud\" is describing.\n\n• The defining test: can the same code move to a new platform without being rewritten? That is exactly what portability means.\n\nSo the answer is: portability.",
    },
    {
      type: "mcq",
      prompt:
        "During Friday night peak, RideCo needs to grow from handling 500 concurrent ride requests to 50,000 concurrent ride requests within the same quarter, without a corresponding increase in configuration effort per new server. Which quality attribute does this requirement mainly address?",
      options: ["Scalability", "Portability", "Testability", "Availability"],
      correctIndex: 0,
      modelAnswer:
        "It's like a car park that can add more levels as more cars show up, instead of being torn down and rebuilt bigger every time demand grows.\n\n• What the requirement actually asks for: handling load that grows by two orders of magnitude (500 to 50,000) without each new server needing extra manual setup effort.\n\n• Why it's not the others: portability is about moving to a different platform, testability is about verifying components in isolation, and availability is about staying up during failures — none of those addresses growing request volume.\n\n• The defining test: does the system keep working as the size of the job grows, without a matching jump in effort per unit? That's scalability.\n\nSo the answer is: scalability.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo promises riders that the app will be reachable and able to accept ride requests 99.95% of the time, with at most 20 minutes of planned maintenance downtime per month. Which quality attribute does this requirement mainly address?",
      options: ["Scalability", "Availability", "Testability", "Portability"],
      correctIndex: 1,
      modelAnswer:
        "It's like a 24-hour convenience store with a backup generator for when the power grid fails — the point is that the doors stay open despite things going wrong.\n\n• What the requirement actually asks for: a precise uptime percentage, plus an explicit allowance for planned maintenance — a classic availability specification.\n\n• Why it's not the others: scalability is about handling more load, testability is about verifying components in isolation, and portability is about moving to a different platform — none of those is about staying reachable over time.\n\n• The defining test: is the requirement stated as \"reachable X% of the time\"? That is availability's signature shape.\n\nSo the answer is: availability.",
    },
    {
      type: "mcq",
      prompt:
        "Each new build of RideCo's driver-matching module must be verifiable by an automated suite that can run the matching logic in isolation, feeding it synthetic ride requests without needing a live GPS feed or real drivers. Which quality attribute does this requirement mainly address?",
      options: ["Availability", "Portability", "Testability", "Scalability"],
      correctIndex: 2,
      modelAnswer:
        "It's like a flight simulator that lets a pilot practise an engine failure without ever risking a real plane — the point is being able to check correctness without needing the real, live dependencies.\n\n• What the requirement actually asks for: verifying a component's correctness in isolation, fed synthetic inputs instead of a live GPS feed or real drivers.\n\n• Why it's not the others: availability is about staying up, portability is about moving to a different platform, and scalability is about handling more load — none of those is about isolating a component to verify it.\n\n• The defining test: can the component's correctness be checked without its real-world dependencies running? That's testability.\n\nSo the answer is: testability.",
    },
    {
      type: "fillblank",
      prompt:
        "When RideCo's BillingConsumer redelivers the same RideCompleted event after a timeout, it must apply the charge using an operation that is ___, so processing the same event twice produces the same end state as processing it once.",
      blanks: [["idempotent"]],
      modelAnswer:
        "Like pressing a pedestrian crossing button: pressing it five times doesn't make the lights change five times faster, since the request has already registered, so extra presses do nothing new.\n\n• Why it matters: when a client can't tell whether its request was received, the operation needs to be safe to just resend.\n\nSo the answer is: idempotent.",
    },
    {
      type: "fillblank",
      prompt:
        "After a rider's card is charged for a ride that is later found to have been cancelled, RideCo doesn't undo the database write — instead it issues a new ___ that credits the rider's account, reversing the business effect of the original charge without erasing the historical record.",
      blanks: [["compensating transaction", "compensator"]],
      modelAnswer:
        "Like crediting someone's account back after an accidental overcharge, rather than pretending the original charge never happened — the record of both the charge and the refund stays in history.\n\n• Why this isn't a rollback: the original step already committed and became visible to the outside world, so the only way to reverse its effect is a new, opposite transaction.\n\nSo the answer is: a compensating transaction (compensator).",
    },
    {
      type: "fillblank",
      prompt:
        "A ride-matching event that fails to be delivered to RideCo's BillingConsumer queue because its time-to-live expires first is moved into a ___ queue on the sender, where it can be inspected during a post-mortem.",
      blanks: [["dead-letter queue", "dead letter queue"]],
      modelAnswer:
        "Like a parcel stamped return to sender, because the courier never even managed to hand it to anyone.\n\n• Where it sits: on the sender's side, so it can be inspected later during a post-mortem.\n\n• The contrast: a poison queue instead holds messages that WERE delivered but kept failing to process.\n\nSo the answer is: dead-letter queue.",
    },
    {
      type: "fillblank",
      prompt:
        "RideCo's REST API returns, alongside each ride resource, a set of links such as \"cancel\" or \"rate-driver\" that only appear when those actions are currently valid for that ride's state — this is the REST constraint called ___.",
      blanks: [["HATEOAS"]],
      modelAnswer:
        "Like a vending machine that only lights up the buttons for drinks it actually still has in stock, instead of printing every button on the front panel whether or not it works.\n\n• Why it matters: the client doesn't need to hard-code business rules about when an action is allowed — it just follows whatever links the server currently offers.\n\nSo the answer is: HATEOAS (Hypermedia As The Engine Of Application State).",
    },
    {
      type: "mcq",
      prompt:
        "RideCo's ride-matching microservice, MatchEngine, tracks each in-progress ride's state (driver assigned, pickup ETA, ride status) in an in-memory hash map keyed by ride ID, inside the service process. Using the course's layered architecture model (client/presentation tier, application/business tier, data tier), which tier does MatchEngine belong to, and in which layer within that tier would ride-status lookups typically be coded?",
      options: [
        "The data tier, in the repository/data-access layer, since MatchEngine directly owns the storage for ride state, and the repository layer is defined as whichever layer is responsible for reading and writing whatever a service persists, in-memory or not.",
        "The client/presentation tier, in the service layer, since MatchEngine is what the rider's mobile app talks to directly, and the service layer in that tier is where request handling and business decision logic are both expected to live together.",
        "The application tier, in the controller layer, since ride-status lookups are triggered by an incoming HTTP request, and the controller layer is defined as the layer responsible for interpreting a request and producing the matching business result.",
        "The application tier, in the service/business layer, since that's the layer responsible for business workflow logic, as distinct from the controller layer (request/response handling) and the repository layer (persisted data access).",
      ],
      correctIndex: 3,
      modelAnswer:
        "Picture a restaurant: the host at the front door (controller) takes your order and passes it back, the kitchen (service/business layer) actually decides how to cook and combine things, and the pantry (repository layer) is where the ingredients are physically stored.\n\n• MatchEngine's tier: it sits in the application/business tier, the middle layer that does the actual work, not the client-facing front end and not the raw data storage.\n\n• The specific layer: ride-status lookups — deciding what to do with a ride's current state — are business workflow logic, which belongs in the service/business layer, not the controller layer (which only handles the incoming request/response) and not the repository layer (which would normally handle persisted, not in-memory, data).\n\n• Why the other options are wrong: the data tier/repository layer is about persisted storage access, not business decisions; the client/presentation tier is what the rider's app itself is, not MatchEngine; and the controller layer only shuttles the request in and the response out, it doesn't contain the lookup logic itself.\n\nSo the answer is: the application tier, specifically its service/business layer.",
    },
    {
      type: "mcq",
      prompt:
        "Using the course's three categories of state (local computation, session, resource state), how should the in-progress ride state held in MatchEngine's in-memory map be classified?",
      options: [
        "Resource state — it's a persistent entity (an in-progress ride) that outlives any single request and is normally shared/accessed concurrently by many operations, even though it's currently (incorrectly) kept only in one instance's local memory.",
        "Session state, because MatchEngine tracks it specifically for one rider's logged-in session on the mobile app, and the data (driver, ETA, status) only ever matters for the duration of that one rider's active session with the service.",
        "Local computation state, because it exists only for the duration of a single method call and is discarded once that call returns, the same way a loop counter or a temporary variable inside one function invocation would be.",
        "None of the three categories apply, because state that is only held in memory rather than in a database falls outside the course's classification scheme, which the course defines purely in terms of where data is physically stored.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of the three categories like three kinds of notes: local computation state is a sticky note you throw away the second you finish one task; session state is a notebook for one specific customer's visit; resource state is more like the shop's actual inventory ledger — something that exists independently of any one customer and that many different operations read and update over time.\n\n• Why it's resource state: an in-progress ride (driver assigned, ETA, status) persists across many separate requests over the ride's whole lifetime, not just within one method call, and it's naturally something many operations would need to access — that's resource state's definition.\n\n• Why it's not local computation state: local computation state disappears the moment a single method finishes; ride state is meant to outlive any one lookup.\n\n• Why it's not session state: session state is scoped to one client's login session; ride state belongs to the ride itself, not to any one rider's session.\n\n• Why the \"none apply\" option is wrong: where state is currently stored (in memory vs. a database) doesn't change what kind of state it fundamentally is — it just means MatchEngine is currently storing resource state in the wrong place.\n\nSo the answer is: resource state.",
    },
    {
      type: "mcq",
      prompt:
        "Operations scales MatchEngine from 1 instance to 4 replicas behind a load balancer that round-robins requests across them, with each replica keeping its own private in-memory map. What goes wrong once requests for the same ride ID can be routed to different replicas? Trace what happens to a rider whose ride state lives on Replica 1 but whose next request is routed to Replica 2.",
      options: [
        "Nothing actually goes wrong here: the load balancer itself automatically copies each replica's in-memory map over to all of the other replicas before routing any new request onward, so every single replica always ends up holding the full, current ride state for any ride ID it could possibly be asked about next.",
        "Replica 2's in-memory map has no entry for that ride ID, because the map is private to each process instance and was never shared or replicated — so Replica 2 either returns a \"not found\" error or takes an incorrect action, producing inconsistent, replica-dependent behaviour for what should be one single, consistent ride state.",
        "Replica 2 silently detects the missing entry for that ride ID, and then automatically queries Replica 1 directly over an internal network call to fetch the ride's current state before responding, so the rider's request still succeeds correctly every single time, just with a little extra network latency added on top.",
        "Kubernetes' control loop notices that Replica 1 is now handling noticeably less inbound traffic than the other three replicas, and automatically restarts it, which the platform then uses as an opportunity to re-synchronise every replica's in-memory ride state across the entire deployment within a few seconds.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Imagine four separate notebooks at four different help desks, with no one copying notes between them. If you first spoke to desk 1 and they wrote your details down, then came back and got sent to desk 3 instead, desk 3 has genuinely never heard of you.\n\n• Step by step: the ride is created and its state gets written only into Replica 1's in-memory map. The rider's next request — say, a status update — gets round-robined to Replica 2 instead. Replica 2's map has no entry for that ride ID, because the map is private to each process and nothing synced it across replicas.\n\n• What happens next: Replica 2 either returns \"not found,\" or worse, treats the request as if the ride doesn't exist and takes a wrong action, like trying to re-match a driver who is already assigned.\n\n• Why this is a correctness bug, not just a performance issue: the same ride can appear \"not found,\" \"unmatched,\" or correctly matched purely depending on which replica happens to answer that particular request — genuinely inconsistent behaviour.\n\n• Why the other options are wrong: nothing in a plain round-robin load balancer replicates in-memory state between instances automatically; replicas don't query each other directly for missing entries by default; and restarting a replica doesn't synchronise state that was never shared in the first place.\n\nSo the answer is: Replica 2 has no record of the ride, so it returns an incorrect result, which is inconsistent, replica-dependent, correctness-breaking behaviour.",
    },
    {
      type: "mcq",
      prompt:
        "Which fix, consistent with the course's state-management principles (stateless vs. stateful instances, external state store), lets MatchEngine scale horizontally across replicas without losing ride-state correctness?",
      options: [
        "Pin each rider to the same MatchEngine replica with sticky sessions, so each replica's own in-memory map stays correct and nothing about where ride state actually lives needs to be redesigned at all.",
        "Replace the in-memory hash map with a larger in-memory cache spread evenly across all 4 replicas' combined memory, so there's simply more total room available to store every ride's state.",
        "Make MatchEngine instances stateless, and externalise ride state into a shared state store — such as a persistent database — that every replica reads from and writes to, so any replica can correctly handle any request for any ride.",
        "Keep ride state in each replica's own private memory as before, but add Two-Phase Commit between all 4 replicas so they vote and agree on the current ride state before answering any read request.",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like moving from four separate private notebooks to one shared whiteboard that every help desk can read and write to — now it doesn't matter which desk you walk up to, because they're all looking at the same, single source of truth.\n\n• The real fix: make MatchEngine stateless — meaning no replica keeps ride state of its own between requests — and move ride state into a shared, external state store (for example, a persistent database) that every replica reads from and writes to.\n\n• Why this solves the bug: because the authoritative state lives outside any one process, any replica can now correctly answer a request for any ride, no matter which one the load balancer happens to route to.\n\n• Why the other options are wrong: sticky sessions is a real technique, but it papers over the symptom rather than fixing the underlying design, and it breaks the moment that replica goes down; a bigger combined in-memory cache still doesn't make the state visible across replicas, since each replica's own memory is still private; and adding a heavyweight commit protocol between replicas just for a read is a mismatched, overly complex tool for keeping replicas in sync.\n\nSo the answer is: make MatchEngine stateless and move ride state into a shared external state store, such as a database.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo considered coordinating a ride's rider-charge and driver-payout with classic Two-Phase Commit (2PC) across the third-party Payment Gateway and the Payout Service, but the Payment Gateway does not support holding an uncommitted \"prepared\" state for more than a few seconds. Why is 2PC not a feasible coordination mechanism for this scenario?",
      options: [
        "Because 2PC can, by design, only ever coordinate exactly two participants in total, and this particular workflow genuinely needs three separate systems involved — the Transaction Manager, the Payment Gateway, and the Payout Service — which exceeds the protocol's fixed, hard-coded two-participant design limit entirely.",
        "Because the Saga pattern is claimed to always execute measurably faster than 2PC for literally any kind of transaction whatsoever, so Sagas should always be the preferred choice purely on raw performance grounds, regardless of whether 2PC would otherwise have technically worked fine for a given set of participants.",
        "Because 2PC strictly requires every single participant to be implemented in the exact same programming language and application framework as the coordinating Transaction Manager itself, and the third-party Payment Gateway almost certainly runs on a completely different technology stack than RideCo's own systems.",
        "Because 2PC's Prepare phase requires every participant to hold locked/reserved resources for an unpredictable duration until all votes are collected — the course describes 2PC as an \"unavailability protocol\" for exactly this reason — and the Payment Gateway, a third party RideCo doesn't control, cannot hold that uncommitted prepared state for more than a few seconds.",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's like asking a stranger at a shop counter to hold an item aside, uncommitted, for as long as it takes everyone else in a group chat to reply \"yes\" — if that stranger will only hold it for a few seconds before putting it back on the shelf, a slow-replying group chat breaks the whole plan.\n\n• What 2PC actually demands: every participant holds reserved resources — locks, pending changes — for however long it takes the coordinator to collect every vote and announce the final decision, which can be an unpredictable amount of time, especially if the coordinator or a participant is slow.\n\n• Why that's a problem here: the Payment Gateway is a third-party system RideCo doesn't control, and it was never designed to sit inside a multi-second (or longer) cross-network voting protocol — it can only hold an uncommitted \"prepared\" state for a few seconds.\n\n• Why the other options are wrong: 2PC is not limited to exactly two participants, it can coordinate any number; the Saga pattern isn't chosen \"purely for speed\" independent of feasibility, it's chosen because it fits participants like this one; and 2PC has no requirement that every participant share a programming language or framework with the coordinator.\n\nSo the answer is: the Payment Gateway can't hold a prepared state long enough for 2PC's voting window, which the course calls an \"unavailability protocol\" risk.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo decides to coordinate the rider-charge and driver-payout as a Saga instead of with 2PC. Which option correctly lists the saga's sequence of locally-atomic transactions along with one compensating action for each?",
      options: [
        "T1: ChargeRider (charge the rider's card for the fare). Compensator: RefundRider — a new, separate transaction that credits the rider's account for the fare amount (not an un-charge; the original charge stays in the record). T2: CreditDriverPayout (credit the fare amount, minus commission, to the driver's payout account). Compensator: ReverseDriverPayout — a new transaction debiting that amount back out of the driver's payout account.",
        "T1: ChargeRider, with compensator defined as: delete the charge record from RideCo's own database entirely once any later failure is detected downstream, so that the saga's recorded history shows it as though the original charge had simply never happened in the first place. T2: CreditDriverPayout, with its compensator deleting the payout record from the database the exact same way.",
        "T1: CreditDriverPayout runs first in the sequence, crediting money into the driver's payout account before the rider has actually been charged anything for the fare at all. T2: ChargeRider then runs second, with both steps' originally-assigned compensators simply swapped around to match this newly reversed execution order.",
        "Both ChargeRider and CreditDriverPayout run together inside one single spanning ACID transaction stretched across both the Payment Gateway's and the Payout Service's own separate internal databases, so the whole combined transaction automatically rolls back cleanly on any failure and no separate compensating transactions are ever actually needed.",
      ],
      correctIndex: 0,
      modelAnswer:
        "A saga is like a road trip with no group RSVP: you just start driving and booking things one at a time, and if a later booking falls through, you cancel or refund something you've already booked instead of pretending you never left home.\n\n• The sequence: first ChargeRider, because the rider needs to be charged before the driver can be paid out of that fare; then CreditDriverPayout, crediting the driver's account.\n\n• The compensators: ChargeRider's compensator is RefundRider — a brand-new transaction that credits the rider back, leaving the original charge visible in the record rather than erasing it. CreditDriverPayout's compensator is ReverseDriverPayout — a new transaction that debits the driver's account back.\n\n• Why the other options are wrong: deleting records pretends the original transactions never happened, which breaks the saga principle of never erasing history; running CreditDriverPayout before ChargeRider reverses a dependency that should go the other way, since the payout is funded by the rider's fare; and a saga explicitly does NOT run inside one spanning ACID transaction — that's exactly the 2PC-style coordination the saga was chosen to avoid.\n\nSo the answer is: ChargeRider (compensator RefundRider) then CreditDriverPayout (compensator ReverseDriverPayout), each a new, separate reversing transaction.",
    },
    {
      type: "mcq",
      prompt:
        "Suppose the rider's card is charged successfully, but the Payout Service credit then fails — for example, the driver's bank account details are invalid. Trace what the saga does step by step, and explain why this is called \"compensation\" rather than \"rollback.\"",
      options: [
        "Once CreditDriverPayout fails, the saga is said to simply call the underlying database's native ROLLBACK command directly against the already-committed ChargeRider transaction, discarding the charge as though it had genuinely never run at all, in supposedly exactly the same way a single ACID transaction spanning both steps together would cleanly undo an in-progress, not-yet-committed write before anyone could ever observe it.",
        "ChargeRider already committed, so it can't simply be undone — the saga runs ChargeRider's compensator, RefundRider, as a new transaction crediting the rider back; CreditDriverPayout never committed, so it needs no compensation at all and is simply abandoned; this is called compensation, not rollback, because by the time the failure is detected, ChargeRider's effect is already committed and durable (potentially already visible on the rider's bank statement), so the only way to reverse it is a brand-new, opposite transaction, not an undo of something not yet committed.",
        "Both ChargeRider and CreditDriverPayout get compensated right away as soon as the failure in the Payout Service is first detected, even though CreditDriverPayout itself never actually managed to commit anything at all, because the saga framework's overall design is assumed to always run every single compensator in the full sequence regardless of whether that particular step genuinely succeeded or failed.",
        "The saga is said to pause the entire workflow and keep retrying ChargeRider and CreditDriverPayout together, bundled up as one single atomic unit, until both of them eventually manage to succeed together at the same time — which, the argument goes, is supposedly exactly what distinguishes a saga's own recovery approach from how 2PC itself behaves under an equivalent kind of mid-sequence failure.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Rollback is like erasing a line you just wrote in pencil, before anyone else has read the page — it's as if it never happened. Compensation is more like a shop that already rang up your purchase and printed your receipt; they can't un-print it, so instead they process a brand-new refund.\n\n• Step by step: ChargeRider runs and commits — the rider's card has genuinely been charged. CreditDriverPayout then runs and fails, because of the invalid bank details. Because CreditDriverPayout never committed, it needs no compensation — the saga simply abandons it. Because ChargeRider already committed, the saga runs its compensator, RefundRider, crediting the rider's account for the fare. The ride is marked \"payout failed\" for manual follow-up once the driver's details are corrected.\n\n• Why \"compensation,\" not \"rollback\": a rollback (inside one ACID transaction) can only undo work that hasn't been committed yet. ChargeRider's effect is already committed and durable — possibly already visible on the rider's bank statement — by the time the failure is noticed, so the only way to reverse its business effect is a brand-new, opposite transaction.\n\n• Why the other options are wrong: a saga has no spanning ACID transaction to issue a native rollback on; compensating a step that never committed would be pointless and isn't what sagas do; and a saga doesn't block and retry both steps together as one atomic unit — that's closer to how 2PC behaves, the exact pattern the saga was chosen to avoid.\n\nSo the answer is: only ChargeRider gets compensated (via RefundRider), because it's the only step that already committed — this is compensation, not rollback, because committed, visible effects can only be reversed by a new transaction.",
    },
    {
      type: "mcq",
      prompt:
        "The course notes that saga compensators run with \"no isolation.\" In this ride-charging scenario, what does this mean, and what concrete problem could arise if the rider disputes the charge via the Payment Gateway's own dashboard while the saga's compensating refund is still in flight?",
      options: [
        "\"No isolation\" means that every local transaction inside the saga is forced by the pattern's own design to run at the database's lowest possible isolation level, which risks a later step accidentally reading uncommitted, half-written data from ChargeRider while that transaction is still genuinely mid-write and not yet finished — a classic dirty-read problem that has nothing to do with how visible a committed step's effects are to the outside world.",
        "\"No isolation\" means that every compensator in the saga must, by definition, execute on a physically separate server from the original transaction it is reversing, purely so that the two never end up competing for the exact same CPU and memory resources on the same machine at the same moment in time.",
        "\"No isolation\" means that once ChargeRider commits, its effect is immediately visible to the outside world — the rider, their bank, the Payment Gateway's own dashboard — even before any compensator has run; a concrete problem is that if the rider disputes the charge directly on the Gateway's dashboard at roughly the same time the saga's RefundRider compensator is independently issuing its own refund, the rider could end up refunded twice, an inconsistency the saga has no way to detect on its own.",
        "\"No isolation\" means that the rider's own bank statement later shows the ChargeRider effect and the eventual RefundRider effect merged together into one single combined line item, which conveniently hides from the rider the fact that two genuinely separate transactions actually occurred on their account.",
      ],
      correctIndex: 2,
      modelAnswer:
        "A lock-protected ACID transaction is like a magician's curtain — nobody sees anything until the trick is fully finished and the curtain opens. A saga has no curtain at all: the moment the first step commits, everyone outside can already see it, well before the whole saga's story is finished.\n\n• What \"no isolation\" actually means: once ChargeRider commits, its effect — the charge — is immediately visible to the rider, their bank, and the Payment Gateway's own dashboard, even though the saga as a whole (including any compensator it might later need) hasn't finished running.\n\n• The concrete problem: if the rider disputes the charge directly on the Gateway's dashboard, triggering the Gateway's own chargeback process, at roughly the same time the saga's RefundRider compensator is independently issuing its own refund, the rider could end up refunded twice — once via the chargeback, once via the saga's compensator — an inconsistency the saga has no built-in way to detect, since it assumed it was the only path by which that charge could ever be reversed.\n\n• Why the other options are wrong: \"no isolation\" isn't about database isolation levels within a single local transaction, it isn't about physically separating servers, and it doesn't mean the two transactions get merged into one hidden entry — they remain two separate, both-visible entries, which is exactly the problem.\n\nSo the answer is: committed saga steps are visible to the outside world immediately, which can lead to a double refund if an external dispute and the saga's own compensation happen at the same time.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo's ride-completion events are published to a message queue, and BillingConsumer reads each \"RideCompleted\" event and issues one charge to the rider's card. The broker uses at-least-once delivery: if BillingConsumer doesn't acknowledge a message in time, the broker redelivers the same message. Explain why \"at-least-once delivery\" by itself isn't sufficient to guarantee the rider is charged exactly once, and which of the course's MOM (message-oriented middleware) reliability concepts actually solves this specific problem.",
      options: [
        "At-least-once delivery can, under this reasoning, silently drop messages entirely whenever the broker is under heavy load, the same way a plain best-effort delivery guarantee supposedly can, so RideCo should switch BillingConsumer's whole queue onto a dead-letter queue setup instead, since that is apparently what actually guarantees the rider gets charged exactly once per completed ride, regardless of how many times the event is ultimately redelivered.",
        "At-least-once delivery actually is, on its own, already fully sufficient to prevent any duplicate charge from ever occurring, because by definition any broker offering that particular delivery guarantee is assumed to always silently de-duplicate a message internally before it could ever be handed to the consumer for a second time.",
        "At-least-once delivery is said to add a small per-redelivery processing fee that the broker itself quietly charges back to RideCo on every redelivery attempt; poison-message handling is supposedly what actually solves the duplicate-charge problem here, simply by refusing to keep redelivering messages that are judged too costly to keep reprocessing.",
        "At-least-once delivery only promises a message is never silently lost — the broker keeps redelivering until it gets an acknowledgement — but it says nothing about how many times the consumer's own side-effecting logic (charging the card) actually runs; an idempotent consumer, which makes the charge operation safe to run more than once for the same logical ride-completion, is what actually prevents a duplicate charge. Dead-letter and poison-message handling solve different problems — messages never delivered at all, and messages whose processing keeps failing, respectively.",
      ],
      correctIndex: 3,
      modelAnswer:
        "At-least-once delivery is like a courier who will knock on your door again and again until you sign for the parcel — it guarantees the parcel eventually gets to you, but it says nothing about whether you might end up signing for (and accepting) the same parcel twice if the courier's first knock actually succeeded and only their note-taking got lost.\n\n• Why at-least-once isn't enough: it only promises the message isn't silently lost — the broker keeps redelivering until it gets an acknowledgement — but it never promises the consumer's own logic (charging the card) runs only once.\n\n• What actually solves it: an idempotent consumer — making the charge operation safe to run more than once for the same logical ride-completion, so a redelivered copy causes no extra charge.\n\n• Why the other two concepts don't solve it: dead-letter handling is for messages that were never successfully delivered at all — the opposite problem — and poison-message handling is for messages whose processing keeps throwing an exception, a different problem from processing succeeding more than once.\n\nSo the answer is: at-least-once delivery only guarantees the message arrives, not that it's processed once — an idempotent consumer is what actually prevents the duplicate charge.",
    },
    {
      type: "mcq",
      prompt:
        "BillingConsumer currently calls chargeCard(rideId, amount) directly for every message it receives, with no additional logic. Design a fix: what should BillingConsumer check and store before issuing a charge, so that redelivery of the same RideCompleted event doesn't cause a duplicate charge?",
      options: [
        "BillingConsumer should maintain a durable idempotency record keyed on the ride's unique ID (the logical operation), and before charging, check whether a charge record already exists for that rideId; if one exists, skip charging again; if none exists, create the idempotency record and perform the charge together, atomically, so a crash between \"check\" and \"charge\" can't leave a window for a duplicate charge.",
        "BillingConsumer should instead check whether the message's own delivery/message ID has been seen before, since that particular ID is what the broker itself uses internally to track each individual delivery attempt, and should treat any ID it hasn't logged before as evidence of a brand-new ride that needs charging.",
        "BillingConsumer should simply reduce the broker's configured redelivery timeout setting all the way down to zero seconds, so that timeout-triggered redeliveries effectively never happen in practice at all, meaning the same RideCompleted event could then never realistically be seen twice by the consumer.",
        "BillingConsumer should charge the rider's card first for every single message it receives from the queue, and only afterward go back and check whether an idempotency record for that ride already exists, deleting whichever of the two resulting charges turns out to be the newer duplicate one.",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like a venue checking your ticket's seat number at the door, not the specific print-out you're holding — because you might have reprinted that same ticket twice, but it's still only good for one seat.\n\n• The key design choice: key the idempotency record on the ride's unique ID, the logical operation being charged — not on a delivery-specific identifier, since a redelivery can get an entirely new message ID while still representing the same logical ride-completion.\n\n• The check-then-charge flow: before charging, look up whether a charge record already exists for that rideId; if it does, skip charging again (optionally returning the earlier result); if it doesn't, create the idempotency record and perform the charge together, atomically — for example inside the same local transaction, or via a database uniqueness constraint on rideId — so nothing can slip through the gap between checking and charging.\n\n• Why the other options are wrong: checking the message's own delivery ID fails precisely because a redelivery can carry a different ID for what is logically the same event; reducing the timeout to zero doesn't remove the underlying ambiguity (crashes and lost acknowledgements can still happen); and charging first, checking after, leaves a real window where a concurrent redelivery can double-charge before the duplicate is ever detected.\n\nSo the answer is: keep a durable record keyed on the ride ID, and check-then-charge atomically so redelivery can never slip through.",
    },
    {
      type: "mcq",
      prompt:
        "Suppose BillingConsumer's charge-processing logic has a bug: for one specific malformed event, it throws an exception every single time it's delivered, so the message keeps being redelivered without ever succeeding. Name the mechanism from the course that eventually stops this from consuming the queue indefinitely, and describe what happens to the message once that mechanism triggers.",
      options: [
        "The dead-letter queue mechanism, because any message that fails processing for any reason at all — whether or not it was ever successfully delivered to a consumer in the first place — is said to eventually land there once some global, queue-wide failure counter trips across the entire messaging system.",
        "Poison-message handling. The queue or consumer tracks how many times a given message's processing has aborted; once that count exceeds a configured retry limit, the message is pulled out of the normal queue and moved into a dedicated poison queue, rather than being redelivered indefinitely, so it stops competing for consumer resources and is retained for an administrator to inspect and diagnose offline.",
        "The idempotent-consumer mechanism, because once BillingConsumer records in its own internal idempotency store that it has already seen that specific ride's event once before, it is assumed to automatically signal back to the broker to permanently stop redelivering that exact message going forward.",
        "The circuit-breaker mechanism, because once a configured threshold of consecutive processing failures is reached for that message, the circuit is assumed to trip open and the broker then stops sending BillingConsumer any messages on any queue whatsoever, not just the one specific failing queue.",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's like a theme-park ride that keeps breaking down on the same broken car — after a few failed attempts to send that car around, staff pull it off the track entirely and set it aside for a mechanic to look at, instead of letting it keep jamming up the whole ride for everyone else.\n\n• The mechanism: poison-message handling. The queue or consumer tracks how many times a specific message's processing has aborted.\n\n• What happens once it triggers: once the failure count passes a configured retry limit, that one message is removed from the normal queue and moved into a dedicated poison queue — no longer competing for consumer resources or blocking messages behind it — and it's kept there for an administrator to inspect and diagnose offline.\n\n• Why the other options are wrong: dead-letter handling is for messages that were never delivered at all, the opposite failure mode; the idempotent-consumer pattern prevents a successfully-processed message from causing a duplicate effect, it doesn't stop redelivery of a message that keeps failing; and a circuit breaker protects a caller from a failing downstream dependency on ordinary calls, it isn't the mechanism that retires one specific bad queue message.\n\nSo the answer is: poison-message handling — after the retry limit, the message is moved to a poison queue for offline inspection instead of being redelivered forever.",
    },
    {
      type: "mcq",
      prompt:
        "A colleague argues: \"We should just switch the broker to exactly-once delivery, and then we won't need idempotency in BillingConsumer.\" Evaluate this suggestion against the course's point that MOM delivery is never truly guaranteed end-to-end, and against idempotency's role as a foundational principle.",
      options: [
        "The suggestion should be accepted without reservation, because simply enabling an exactly-once broker setting is said to mathematically guarantee that the chargeCard call itself can never possibly run more than once for the same logical ride, which would make BillingConsumer's idempotency check entirely redundant going forward from that point on.",
        "The suggestion should be accepted, but only selectively for RideCo's highest-value premium rides, since genuinely exactly-once delivery is generally considered far too computationally expensive and resource-intensive to enable broker-wide across every single ordinary ride completion event the platform processes.",
        "The suggestion should be rejected: realistic failure modes — like BillingConsumer crashing after it has already charged the card but before it acknowledges the message — mean no broker setting can fully guarantee the external side-effect (the actual card charge) happens only once, because an \"exactly-once\" feature typically only de-duplicates at the broker/network layer and can't know whether BillingConsumer's external side-effect was already durably applied before a crash; idempotency is a foundational principle, not a stopgap to remove once a fancier broker is available.",
        "The suggestion should be rejected, but strictly only because switching the broker's delivery guarantees over to exactly-once would require a long, costly, multi-month infrastructure migration project that RideCo can't currently justify budgeting for given its other engineering priorities this quarter — meaning idempotency logic in BillingConsumer genuinely becomes entirely unnecessary the very moment that future migration project eventually finishes.",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like trusting a delivery app's \"delivered exactly once\" badge to mean the driver can never possibly hand you two pizzas — the badge covers what the app's own tracking system logs, not what might go wrong at your actual front door, like the driver's phone glitching right after the handoff and them not realising it already happened.\n\n• Why the suggestion should be rejected: a realistic failure is BillingConsumer crashing after it has already charged the card but before it manages to acknowledge the message — the broker, seeing no acknowledgement, redelivers, and an \"exactly-once\" broker feature typically only de-duplicates at the broker/network layer, since it has no way to know whether BillingConsumer's external side-effect (the actual card charge, which lives outside the broker entirely) was already durably applied before the crash.\n\n• Why idempotency can't just be removed: the course treats it as a foundational principle, not a stopgap to delete once a fancier broker is purchased — it's the only mechanism that gives an actual end-to-end correctness guarantee regardless of what delivery semantics the broker claims.\n\n• Why the other options are wrong: claiming it's a mathematical guarantee ignores exactly the crash scenario above; restricting the fix to high-value rides doesn't address the underlying gap at all; and agreeing idempotency becomes \"unnecessary\" after a migration repeats the same flawed reasoning the colleague started with, just with extra steps.\n\nSo the answer is: reject the suggestion — no broker setting removes the need for an idempotent consumer, because the broker can't see whether the actual side-effect already happened.",
    },
    {
      type: "mcq",
      prompt:
        "RideCo's ride-dispatch control centre has 10 dispatch terminals (N = 10), each operated by a staff member who reviews and confirms a ride assignment before starting the next one. Over a 20-minute (1,200-second) observation window, the control centre completed 900 ride-assignment matches. During that period, the matching engine (CPU) was busy for 450 seconds in total, and the driver-location database was busy for 360 seconds in total. Compute the service demand Di for each device, and state which device is the bottleneck.",
      options: [
        "D_cpu = 450 / 1200 ≈ 0.375 s/job and D_db = 360 / 1200 = 0.3 s/job, found by dividing each device's busy time by the length of the whole 1,200-second observation window rather than by job count; this still makes the matching engine the bottleneck.",
        "D_cpu = 900 / 450 = 2 jobs/sec and D_db = 900 / 360 ≈ 2.5 jobs/sec, found by dividing the number of completions by each device's busy time instead of the other way around; this makes the driver-location database come out as the bottleneck.",
        "D_cpu = 450 / 900 = 0.5 s/job and D_db = 360 / 900 = 0.4 s/job, but because both computed demands come out under 1 second each, neither device actually counts as a true bottleneck under this reasoning.",
        "D_cpu = 450 / 900 = 0.5 s/job and D_db = 360 / 900 = 0.4 s/job, found by dividing each device's busy time by the number of completed jobs (900); since the matching engine has the higher service demand, it is the bottleneck device.",
      ],
      correctIndex: 3,
      modelAnswer:
        "Like the slowest checkout lane in a supermarket — no matter how many other fast lanes are open, the whole store's customers-per-hour is capped by how fast that one slow lane can go once every lane is busy.\n\n• The right formula: service demand Di equals a device's total busy time (Bi) divided by the number of jobs completed in that period (C = 900 here), not by the length of the observation window and not inverted into a rate.\n\n• The numbers: D_cpu = 450 / 900 = 0.5 seconds per job; D_db = 360 / 900 = 0.4 seconds per job.\n\n• Finding the bottleneck: the device with the higher service demand saturates first and caps throughput — here, that's the matching engine (CPU), at 0.5 s/job versus the database's 0.4 s/job.\n\n• Why the other options are wrong: dividing by the observation window (1200s) computes something closer to utilisation, not service demand, and gets the formula wrong; dividing completions by busy time inverts Di into a rate and flips which device looks like the bottleneck; and having both demands under 1 second doesn't mean neither is a bottleneck — the bottleneck is always whichever device has the higher demand, regardless of the absolute number.\n\nSo the answer is: D_cpu = 0.5 s/job, D_db = 0.4 s/job, and the matching engine is the bottleneck.",
    },
    {
      type: "mcq",
      prompt:
        "Using the service demands from the previous question (matching engine D_cpu = 0.5 s/job is the bottleneck), state the high-load (asymptotic) throughput bound Xmax for RideCo's dispatch system, and explain what it means as more terminals are added.",
      options: [
        "Xmax = 1 / Dmax = 1 / 0.5 = 2 jobs/sec. This is the absolute ceiling on throughput no matter how many terminals N are added: once N is large enough that the bottleneck device (the matching engine) is continuously busy, total throughput cannot exceed 2 completed ride-matches per second, and adding more terminals beyond that point only grows queueing/response time, not completed work per second.",
        "Xmax = 1 / (D_cpu + D_db) = 1 / 0.9 ≈ 1.11 jobs/sec, summing both devices' demands rather than using just the bottleneck's own demand alone. Total throughput then keeps climbing roughly in proportion to N forever, with no real upper limit, as more terminals get added to the control centre.",
        "Xmax = N / (D_cpu + D_db + Z) = 10 / 8.9 ≈ 1.12 jobs/sec, computed by plugging the current terminal count straight into the low-load throughput formula. This figure is treated as the system's permanent throughput ceiling, fixed forever at the current N = 10 regardless of how many more terminals are later added.",
        "Xmax = 1 / D_db = 1 / 0.4 = 2.5 jobs/sec, using the driver-location database's demand instead of the matching engine's. The driver-location database is treated as capping the system's long-run throughput at this value, no matter how many terminals are added.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Picture a factory line where one machine is slower than all the others — no matter how many workers you add feeding parts into the line, the whole line can never finish products faster than that one slow machine allows.\n\n• The right formula: Xmax = 1 / Dmax, using only the bottleneck device's service demand, not the sum of every device's demand and not a formula that still has N baked into it.\n\n• The number: Xmax = 1 / 0.5 = 2 jobs per second.\n\n• What it means for the control centre: this is the absolute ceiling — once enough terminals are feeding work that the matching engine is continuously busy, throughput flattens out at 2 completed ride-matches per second no matter how many more terminals get added; extra terminals beyond that point just mean longer waits, not more completed work per second.\n\n• Why the other options are wrong: summing both devices' demands instead of using just the bottleneck's gives a meaningless figure that isn't the true asymptote; a formula that still includes N (like D+Z) describes something else (the low-load region), not the fixed high-load ceiling; and using the non-bottleneck device's demand picks the wrong device entirely.\n\nSo the answer is: Xmax = 2 jobs/sec, a hard ceiling that doesn't rise no matter how many terminals are added.",
    },
    {
      type: "mcq",
      prompt:
        "Each dispatch terminal's operator has an average think time Z of 8 seconds (reviewing/confirming a ride assignment before requesting the next one). Using the low-load and high-load bounds, compute N* — the terminal count at the \"knee\" of the performance curve — for RideCo's system (total service demand D = D_cpu + D_db = 0.5 + 0.4 = 0.9 s, Dmax = 0.5 s/job).",
      options: [
        "N* = (D + Z) / D_db = (0.9 + 8) / 0.4 = 22.25, so N* ≈ 22 terminals, found by dividing by the driver-location database's demand instead of the bottleneck's.",
        "N* = (D + Z) / Dmax = (0.9 + 8) / 0.5 = 8.9 / 0.5 = 17.8, so N* ≈ 18 terminals.",
        "N* = Z / Dmax = 8 / 0.5 = 16 terminals, found using only the think time and leaving out the total service demand D entirely.",
        "N* = (D + Z) × Dmax = 8.9 × 0.5 = 4.45, so N* ≈ 4 terminals, found by multiplying instead of dividing.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of N* as the point where adding one more customer to a queue stops speeding up the total line and starts just making everyone wait longer — the \"sweet spot\" terminal count right at the bend of the curve.\n\n• The right formula: N* = (D + Z) / Dmax, where D is the total service demand summed across all devices, Z is the think time, and Dmax is specifically the bottleneck device's demand.\n\n• The numbers: D = 0.5 + 0.4 = 0.9 seconds; (D + Z) = 0.9 + 8 = 8.9; N* = 8.9 / 0.5 = 17.8, which rounds to about 18 terminals.\n\n• Why the other options are wrong: dividing by the database's demand instead of the bottleneck's uses the wrong device entirely; leaving D out of the formula and using only Z / Dmax ignores how much total work each job actually requires across all devices; and multiplying instead of dividing produces a far smaller, meaningless number.\n\nSo the answer is: N* = (0.9 + 8) / 0.5 = 17.8, so N* ≈ 18 terminals.",
    },
    {
      type: "mcq",
      prompt:
        "The control centre currently operates with N = 10 terminals, and N* ≈ 18 from the previous calculation. State whether the system is currently operating in the lightly-loaded or heavily-loaded region, and recommend, with justification, whether adding 5 more terminals (N = 15) is likely to meaningfully increase throughput.",
      options: [
        "Since N = 10 is below N* ≈ 18, the system is argued to already be heavily loaded at this terminal count, so adding 5 more terminals to reach N = 15 would, under this reasoning, only add further queueing delay with no real throughput gain to show for it.",
        "Since N = 10 is below N* ≈ 18, the system is correctly identified as lightly loaded, but because N = 15 would still remain below N*, adding those 5 terminals is claimed to be unlikely to raise throughput at all — the argument being that only actually crossing N* itself is what unlocks any further gain.",
        "Since N = 10 is well below N* ≈ 18, the system is currently in the lightly-loaded region, where throughput still rises roughly in proportion to N; because N = 15 is also still below N* ≈ 18, adding those 5 terminals is expected to meaningfully increase throughput, since the system hasn't yet reached the bottleneck's asymptotic ceiling of 2 jobs/sec.",
        "N* is dismissed here as basically irrelevant to this particular decision; instead, the only number treated as mattering is Xmax = 2 jobs/sec, and because the currently observed throughput of roughly 0.75 jobs/sec already sits below that ceiling, adding any more terminals at all is said to be unable to help until Xmax itself is somehow raised.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of N* as the point on a hiking trail where the path stops climbing steeply and starts to flatten out. At N = 10, the control centre is still well before that bend — climbing fast, with every extra hiker (terminal) still making real progress.\n\n• Which region: because N = 10 is well below N* ≈ 18, the system is currently in the lightly-loaded region, below the knee, where throughput still rises roughly in proportion to how many terminals are active.\n\n• The recommendation: N = 15 is still below N* ≈ 18, so the system still has headroom before the bottleneck device (the matching engine) becomes continuously busy — adding those 5 terminals is expected to meaningfully increase throughput, not just add queueing delay.\n\n• Why the other options are wrong: calling the system \"heavily loaded\" below N* has the region backwards; claiming no gain happens until N* is actually reached ignores that the low-load region's whole behaviour is throughput rising roughly with N, not staying flat until a cliff edge; and dismissing N* as irrelevant misses that N* is exactly what tells you whether there's still headroom to exploit before Xmax becomes the limiting factor.\n\nSo the answer is: the system is lightly loaded at N = 10, and adding 5 more terminals (to N = 15) should meaningfully increase throughput, since it's still below the N* ≈ 18 knee.",
    },
  ],
};

export const COMP5348_PRACTICE_EXAM_2_PAPERS: ExamPaperSeed[] = [PAPER];
