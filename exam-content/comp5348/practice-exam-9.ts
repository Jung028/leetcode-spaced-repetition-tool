import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  "course": "COMP5348",
  "week": 9,
  "paperNumber": 11,
  "title": "Practice Exam 9",
  "instructions": "Part I — Multiple choice: Questions 1–7. Select one answer for each question. Part II — Written questions: Q8 quality-attribute subparts and Q9 terms are fill-in-the-blank; Q10–Q13 scenario subparts require paragraph answers. For written answers, type your response, save it, reveal the model answer, then mark yourself Correct or Wrong. Practice material based on the supplied paper and answer guide; it does not establish the official exam blueprint.",
  "topics": "Practice Exam 9, adapted from the StockFlow trading-platform practice paper and answer guide. Covers row-level locking; series availability; Saga versus Two-Phase Commit; optimistic concurrency; poison messages; AI workflow and retrieval-augmented generation; HATEOAS; quality attributes; idempotency, dead-letter queues, bottlenecks and compensators; service demand and operational-law throughput bounds; RPC timeout ambiguity and idempotency keys; choosing containers or serverless for different workloads; fan-out/fan-in; and choosing RPC versus durable messaging based on latency and delivery needs.",
  "sourceFiles": [
    "COMP4348_COMP5348_2026_S2_Practice_Exam_09.pdf (Desktop, practice-paper source)",
    "COMP4348_COMP5348_2026_S2_Practice_Exam_09_Answers.pdf (Desktop, answer guide)"
  ],
  "questions": [
    {
      "type": "mcq",
      "prompt": "Part I — Multiple choice\n\nSelect one answer for each question.\n\nMany traders update different orders at once, while a nightly job scans the whole table. Which lock choice best supports live order placement, and what is its cost?",
      "options": [
        "Row-level locks, which permit more concurrency but add lock overhead and deadlock risk",
        "Table-level locks, because they allow unrelated rows to update concurrently",
        "Table-level locks, because they are the finer-grained choice",
        "Row-level locks, which prevent all other transactions from using the table"
      ],
      "correctIndex": 0,
      "modelAnswer": "If people work on separate pages, locking only each page lets more people work than locking the whole book.\n\n• Correct idea: Row-level locking allows transactions on different rows to proceed concurrently, at the cost of more lock management and possible deadlocks.\n\n• Why the other choices are wrong: Table locks are coarse-grained and block more work; row locks do not block every other row by definition.\n\nSo the answer is: Row-level locks, which permit more concurrency but add lock overhead and deadlock risk"
    },
    {
      "type": "mcq",
      "prompt": "A path requires both Risk-Check at 99.95% and Order-Routing at 99.9% to work. What is the series availability?",
      "options": [
        "About 99.95%, equal to the more available service",
        "About 99.85%, because the two availabilities multiply",
        "About 99.999%, because the services improve each other",
        "Exactly 99.9%, equal to the less available service"
      ],
      "correctIndex": 1,
      "modelAnswer": "A route with two required bridges is open only when both bridges are open.\n\n• Correct idea: Series availability is 0.9995 × 0.999 = 0.9985005, or about 99.85%, lower than either component alone.\n\n• Why the other choices are wrong: The series result is a product, not the maximum or exactly the minimum; adding a required component does not create redundancy.\n\nSo the answer is: About 99.85%, because the two availabilities multiply"
    },
    {
      "type": "mcq",
      "prompt": "Three independent exchanges commit each trade leg immediately and use a new balancing trade if a later leg fails, instead of holding locks for 2PC (Two-Phase Commit). Which transaction pattern is this?",
      "options": [
        "Two-Phase Commit, where every exchange holds a prepared lock until all vote",
        "A single database transaction shared by every exchange",
        "A Saga, where completed steps are reversed by compensating transactions",
        "A retry loop that makes every leg atomic"
      ],
      "correctIndex": 2,
      "modelAnswer": "A travel booking may confirm one leg, then arrange a refund if a later leg cannot be booked.\n\n• Correct idea: A Saga commits each step separately and runs compensating transactions for completed steps if a later step fails.\n\n• Why the other choices are wrong: Two-Phase Commit prepares participants before any commit; independent exchanges do not share one database transaction, and retries alone do not make a workflow atomic.\n\nSo the answer is: A Saga, where completed steps are reversed by compensating transactions"
    },
    {
      "type": "mcq",
      "prompt": "Two jobs read a trader’s position and check its modification count before writing. What concurrency method is this, and what is a known limitation?",
      "options": [
        "Pessimistic locking; it requires no locks",
        "Pessimistic locking; all jobs must wait before they can read",
        "Optimistic control; its main limitation is that it prevents any concurrent reads",
        "Optimistic control; complete correctness also requires validating every object read, which is rarely done"
      ],
      "correctIndex": 3,
      "modelAnswer": "Two people can edit freely, then compare the version number before saving.\n\n• Correct idea: Optimistic concurrency control detects a conflict at write time; full correctness also requires checking versions of every object read during the computation.\n\n• Why the other choices are wrong: No lock is acquired up front, and optimistic control permits concurrent reads; pessimistic locking is the approach that makes work wait.\n\nSo the answer is: Optimistic control; complete correctness also requires validating every object read, which is rarely done"
    },
    {
      "type": "mcq",
      "prompt": "A queue message reaches its consumer, but processing fails ten times and the transaction keeps aborting. Where should it be moved for diagnosis?",
      "options": [
        "A poison-message queue; a dead-letter queue is for delivery failures before a consumer receives a message",
        "A dead-letter queue, which is identical to consumer retry handling",
        "A retry queue for messages already processed successfully",
        "A fanout exchange, which stores failed messages permanently"
      ],
      "correctIndex": 0,
      "modelAnswer": "A parcel that arrived but cannot be opened differs from one that never reached the address.\n\n• Correct idea: A repeatedly failing consumer message is a poison message. A dead-letter queue generally handles messages that fail delivery, such as expiry or routing failure.\n\n• Why the other choices are wrong: Successful messages are not poison messages, and an exchange or generic retry queue is not the described diagnosis destination.\n\nSo the answer is: A poison-message queue; a dead-letter queue is for delivery failures before a consumer receives a message"
    },
    {
      "type": "mcq",
      "prompt": "A support tool always runs the same coded database lookup before a model writes an answer; this fixed retrieval-then-answer design is RAG (retrieval-augmented generation). Which autonomy level best describes it?",
      "options": [
        "Level 1, because any retrieval makes it an agent",
        "Level 2, a fixed AI workflow such as retrieval-augmented generation",
        "Level 3, because the model chooses the lookup at run time",
        "Level 3, because the tool has multiple steps"
      ],
      "correctIndex": 1,
      "modelAnswer": "A vending machine follows a programmed sequence; it does not decide which step to take based on its own goals.\n\n• Correct idea: This is a Level 2 workflow: developers fix the retrieval step and order, while the model generates text from the retrieved information.\n\n• Why the other choices are wrong: Retrieval alone does not make a Level 3 agent; the model does not choose which lookup to run or control the next step.\n\nSo the answer is: Level 2, a fixed AI workflow such as retrieval-augmented generation"
    },
    {
      "type": "mcq",
      "prompt": "A REST (Representational State Transfer) response includes a cancel link only while cancellation is valid, and clients follow the returned links. Which constraint, HATEOAS (Hypermedia As The Engine Of Application State), is shown?",
      "options": [
        "Statelessness",
        "Cacheability",
        "HATEOAS",
        "Self-descriptive messages"
      ],
      "correctIndex": 2,
      "modelAnswer": "A signpost tells you which paths are available from where you are now.\n\n• Correct idea: HATEOAS exposes available next actions through hypermedia links in the response instead of requiring the client to hard-code them.\n\n• Why the other choices are wrong: The other constraints concern request context, reusing responses, or understanding message formats, not state-dependent action links.\n\nSo the answer is: HATEOAS"
    },
    {
      "type": "fillblank",
      "prompt": "Part II — Written questions\n\nQ8 Quality attributes\n\nThe same charting module must run unmodified in both a desktop terminal and a web portal. Name the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A plug that works in different sockets can travel between places without being rebuilt.\n\n• Correct idea: Portability is the ability to move software across platforms with little or no change.\n\n• Why the other choices are wrong: Availability is uptime, security protects data or actions, and performance concerns speed.\n\nSo the answer is: Portability",
      "blanks": [
        [
          "Portability"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "Order matching must acknowledge a request within 5 milliseconds at the 99th percentile during peak hours. Name the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A race’s time limit is about how quickly it finishes, not where it can run.\n\n• Correct idea: A measurable response-time target, especially at a stated percentile, specifies performance.\n\n• Why the other choices are wrong: Scalability concerns increased load, portability concerns platforms, and testability concerns ease of verification.\n\nSo the answer is: Performance",
      "blanks": [
        [
          "Performance"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "Trade confirmations are cryptographically signed so neither party can later deny sending or receiving them. Which security property is central?\n\nName the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A signed receipt provides evidence of who approved or received something.\n\n• Correct idea: Non-repudiation uses evidence such as digital signatures so a party cannot plausibly deny an action later.\n\n• Why the other choices are wrong: Confidentiality hides information, availability concerns uptime, and portability is not a security property.\n\nSo the answer is: Non-repudiation",
      "blanks": [
        [
          "Non-repudiation",
          "non-repudiation",
          "nonrepudiation"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "The platform must support ten times as many connected traders during a volatility spike without redesigning the connection tier. Name the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A venue designed to add more seats as attendance grows is scalable.\n\n• Correct idea: Scalability is the ability to handle a substantial increase in users or workload without redesign.\n\n• Why the other choices are wrong: The other attributes describe verification, protection, or uptime rather than growth in concurrent load.\n\nSo the answer is: Scalability",
      "blanks": [
        [
          "Scalability"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "Q9 Terms\n\nComplete each statement with the appropriate term.\n\nIf a repeated cancel request must have the same end effect as one request, the operation should be ______.",
      "blanks": [
        [
          "idempotent",
          "idempotency"
        ]
      ],
      "modelAnswer": "Pressing the same floor button twice still requests the same floor once.\n\n• Key idea: An idempotent operation can be repeated without changing its final effect, which makes retrying after a timeout safer.\n\nSo the answer is: idempotent."
    },
    {
      "type": "fillblank",
      "prompt": "A message that cannot be delivered before its time-to-live expires is moved to a ______ on the sending side.",
      "blanks": [
        [
          "dead-letter queue",
          "dead letter queue",
          "dead-letter"
        ]
      ],
      "modelAnswer": "A parcel that could not be delivered is set aside for review.\n\n• Key idea: A dead-letter queue holds messages that failed delivery, such as when they expire before reaching a consumer.\n\nSo the answer is: dead-letter queue."
    },
    {
      "type": "fillblank",
      "prompt": "The resource with the greatest total service demand, which saturates first and limits maximum throughput, is the ______.",
      "blanks": [
        [
          "bottleneck",
          "bottleneck device"
        ]
      ],
      "modelAnswer": "On a road, the narrowest bridge limits how many cars can pass through the whole route.\n\n• Key idea: The resource with the largest service demand is the bottleneck and bounds the system’s maximum throughput.\n\nSo the answer is: bottleneck."
    },
    {
      "type": "fillblank",
      "prompt": "In a Saga, a new business transaction that reverses the effect of an already committed step is a ______.",
      "blanks": [
        [
          "compensator",
          "compensating transaction",
          "compensation"
        ]
      ],
      "modelAnswer": "If a hotel booking cannot be completed, a separate refund reverses the charge without erasing history.\n\n• Key idea: A compensator is a new transaction that semantically reverses a completed Saga step; it is not a database rollback.\n\nSo the answer is: compensator."
    },
    {
      "type": "scenario",
      "prompt": "Scenario questions — write each response in a short paragraph, showing your reasoning.\n\nQ10(a)\n\nOver 1,200 seconds, 6,000 orders complete. Matching-engine busy time is 900 seconds and risk-check busy time is 300 seconds; each is visited once per order. Which service demands (busy time per completed order) and bottleneck are correct?",
      "modelAnswer": "To compare checkout lanes, divide each lane’s busy time by how many customers used it.\n\n• Correct idea: Service demand is busy time divided by completed jobs: 900/6000 = 0.15 seconds for matching and 300/6000 = 0.05 seconds for risk-check. Matching is larger and is the bottleneck.\n\n• A common mistake is: The demands are not reversed, the higher-demand resource is the bottleneck, and the figures are seconds per order rather than total seconds.\n\nSo the answer is: Matching 0.15 s/order; Risk 0.05 s/order; Matching is the bottleneck"
    },
    {
      "type": "scenario",
      "prompt": "Q10(b)\n\nThe matching engine’s service demand is 0.15 seconds per order. What high-load bound does this place on maximum system throughput?",
      "modelAnswer": "If one worker needs 0.15 seconds per job, that worker cannot finish more than about 1 divided by 0.15 jobs each second.\n\n• Correct idea: The high-load bound is Xmax = 1/Dmax = 1/0.15 ≈ 6.67 orders per second.\n\n• A common mistake is: Multiplying rather than taking the reciprocal has the wrong units, and measured throughput does not equal the theoretical bound for every population.\n\nSo the answer is: At most about 6.67 orders/second"
    },
    {
      "type": "scenario",
      "prompt": "Q10(c)\n\nThe total service demand is 0.20 seconds, think time is 3 seconds, and there are 25 terminals. The low-load bound is 25/(0.20+3) ≈ 7.81 orders/second; the high-load bound is 6.67. Which bound limits throughput?",
      "modelAnswer": "If a speed limit and a road-capacity limit both apply, the smaller allowed rate is the one that constrains you.\n\n• Correct idea: Actual throughput cannot exceed either bound, so the smaller number, 6.67 orders/second, is limiting at N=25.\n\n• A common mistake is: The larger low-load estimate does not override the lower bottleneck ceiling, and the two values are not equal.\n\nSo the answer is: The high-load bound, because it is the smaller bound"
    },
    {
      "type": "scenario",
      "prompt": "Q10(d)\n\nWith total service demand D=0.20 seconds, think time Z=3 seconds, and bottleneck demand Dmax=0.15 seconds, what does N*=(D+Z)/Dmax tell the team?",
      "modelAnswer": "The knee is where adding more people stops making a checkout line move faster because the cashier is already fully busy.\n\n• Correct idea: N* = 3.2/0.15 ≈ 21.3 terminals. Since 25 exceeds this, the system is in the saturated region; more terminals mostly add waiting.\n\n• A common mistake is: N* is a population threshold, not a throughput or lock count, and beyond the knee throughput is capped by the bottleneck.\n\nSo the answer is: N* is about 21.3; at 25 terminals the system is past the knee, so adding terminals will not materially raise throughput"
    },
    {
      "type": "scenario",
      "prompt": "Q11(a)\n\nA remote procedure call (RPC) to execute a trade times out and the client gets no reply. What can it conclude about whether the trade executed?",
      "modelAnswer": "A letter may be lost on the way to someone, or their reply may be lost on its way back; silence alone cannot tell you which happened.\n\n• Correct idea: The client stub sends a request through the network to a server skeleton. A timeout reveals only that no reply arrived, not whether the method ran.\n\n• A common mistake is: A missing reply does not prove failure or success, and a client-side stub cannot roll back a remote operation automatically.\n\nSo the answer is: It cannot tell: the request, reply, or server processing may be delayed or lost"
    },
    {
      "type": "scenario",
      "prompt": "Q11(b)\n\nWhy is it unsafe to retry executeTrade after a timeout if the service is not idempotent?",
      "modelAnswer": "If a shop charged your card but the receipt vanished, paying again could make you buy the same item twice.\n\n• Correct idea: The first call may have executed while its reply was lost. Without deduplication, retrying can submit a second trade.\n\n• A common mistake is: Encryption does not prevent duplicate effects, retries do not automatically cancel work, and the server needs an explicit duplicate-handling rule.\n\nSo the answer is: The first trade may have completed and the retry can execute it again, doubling the position"
    },
    {
      "type": "scenario",
      "prompt": "Q11(c)\n\nWhich design makes a retry safe using an idempotency key?",
      "modelAnswer": "A numbered claim ticket links repeated visits to the same job rather than creating a new job each time.\n\n• Correct idea: The client reuses the same unique key for retries. The service stores the completed key and outcome durably and returns the saved result instead of executing again.\n\n• A common mistake is: A new key per retry defeats deduplication, client memory may be lost, and assuming a timeout means failure is unsafe.\n\nSo the answer is: Use one key for the logical trade, durably store its outcome, and return that outcome for duplicate keys"
    },
    {
      "type": "scenario",
      "prompt": "Q11(d)\n\nFor a trade that needs a quick outcome but must survive a temporary execution-service outage, which comparison is most accurate?",
      "modelAnswer": "A phone call is immediate when both people are available; a mailbox can hold the request if the other person is away.\n\n• Correct idea: RPC suits a response the trader wants quickly, especially with idempotent retries. A durable asynchronous queue tolerates a temporarily unavailable receiver by storing work for later.\n\n• A common mistake is: RPC can be ambiguous after a timeout, queues can persist messages but do not give an immediate response, and either can be designed with retries.\n\nSo the answer is: RPC is simpler for a quick request/reply when paired with an idempotency key; a persistent queue decouples outages but replies later"
    },
    {
      "type": "scenario",
      "prompt": "Q12(a)\n\nA continuously loaded order-matching engine needs predictable low latency. Which deployment is the better fit?",
      "modelAnswer": "A restaurant that serves customers all day may keep its kitchen ready instead of closing it between every order.\n\n• Correct idea: Dedicated containers remain running and provide predictable response time for continuous, steady load.\n\n• A common mistake is: Cold starts can delay serverless responses; a queue changes interaction semantics, and serverless runtimes do have limits.\n\nSo the answer is: Dedicated containers, which stay warm and suit steady high load"
    },
    {
      "type": "scenario",
      "prompt": "Q12(b)\n\nAn end-of-day report is idle most of the day, then processes a large burst for 20 minutes. Which deployment option is the better fit?",
      "modelAnswer": "It is like renting a larger room only for the event instead of paying for it while it sits empty.\n\n• Correct idea: Serverless suits scheduled or spiky workloads because capacity can scale with invocations and costs can stop while the job is idle.\n\n• A common mistake is: Keeping peak-sized capacity running all day wastes resources, and locking is not a deployment model.\n\nSo the answer is: Serverless functions that scale for the short burst and can scale to zero while idle"
    },
    {
      "type": "scenario",
      "prompt": "Q12(c)\n\nWhich pair names specific reasons serverless may be a poor fit for a continuously loaded, low-latency matching engine?",
      "modelAnswer": "A service that must respond instantly may not want to wake a sleeping worker for every first request.\n\n• Correct idea: Cold starts hurt tight latency targets, and per-invocation pricing may be less attractive for steady high utilization.\n\n• A common mistake is: Serverless can run code, access networks, scale, and run without a human approving each invocation; those are not the stated limitations.\n\nSo the answer is: Cold starts can add latency, and steady high load can cost more than dedicated capacity"
    },
    {
      "type": "scenario",
      "prompt": "Q12(d)\n\nA reporting job runs many per-account functions in parallel and combines their outputs into one summary. Which orchestration pattern fits?",
      "modelAnswer": "A group divides a big task into many pieces, then gathers the results into one report.\n\n• Correct idea: Fan-out/fan-in distributes work across parallel functions and aggregates their results when they complete.\n\n• A common mistake is: Request/reply is a communication style, Two-Phase Commit coordinates transactions, and a circuit breaker limits failing calls.\n\nSo the answer is: Fan-out/fan-in"
    },
    {
      "type": "scenario",
      "prompt": "Q13(a)\n\nA live price quote returned by an RPC (remote procedure call) is useless after a few hundred milliseconds. Which communication style best fits?",
      "modelAnswer": "A live weather update is useful now; a message arriving tomorrow cannot replace it.\n\n• Correct idea: RPC provides a synchronous request/response round trip suited to a quote whose value expires quickly.\n\n• A common mistake is: A persistent queue is designed to preserve useful work for later, while a Saga and dead-letter queue address different problems.\n\nSo the answer is: Synchronous RPC, because the caller needs a quick response or immediate failure"
    },
    {
      "type": "scenario",
      "prompt": "Q13(b)\n\nWhy is a message queue a weaker fit than RPC (remote procedure call) for the live price quote?",
      "modelAnswer": "A delayed answer to “What time is it now?” may be correct about the past but useless now.\n\n• Correct idea: Queueing adds delay and eventual delivery is not helpful when a quote becomes stale within a few hundred milliseconds.\n\n• A common mistake is: Queues can carry data and can be durable; signing is a separate concern, and RPC does not automatically persist every request.\n\nSo the answer is: A queue adds broker and waiting delay, so the client may receive a stale quote"
    },
    {
      "type": "scenario",
      "prompt": "Q13(c)\n\nA trade confirmation must never be lost, but a few seconds of delay is acceptable. Which communication style is the better fit: RPC (remote procedure call) or a message queue?",
      "modelAnswer": "A signed letter can wait safely in a mailbox until the recipient returns.\n\n• Correct idea: A persistent queue durably holds a confirmation while the settlement system is unavailable, turning an outage into a delay rather than immediate failure.\n\n• A common mistake is: RPC couples the sender to the receiver’s availability; a cache or unstored retry does not provide reliable delivery.\n\nSo the answer is: A persistent message queue, which stores the confirmation and decouples temporary outages"
    },
    {
      "type": "scenario",
      "prompt": "Q13(d)\n\nWhy is RPC (remote procedure call) a weaker fit than a persistent queue for the trade confirmation?",
      "modelAnswer": "A phone call can fail if the other person is unavailable, while a letter can wait for them.\n\n• Correct idea: A synchronous RPC can fail or time out when the receiver is unavailable, and the sender may not know whether the request reached it.\n\n• A common mistake is: RPC does not guarantee delivery to an offline receiver, queues can deliver confirmations, and RPC is designed to return responses.\n\nSo the answer is: RPC requires the settlement service to be reachable at send time, and a timeout can leave delivery uncertain"
    }
  ]
};

export const COMP5348_PRACTICE_EXAM_9_PAPERS: ExamPaperSeed[] = [PAPER];
