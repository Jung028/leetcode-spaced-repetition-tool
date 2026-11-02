import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  "course": "COMP5348",
  "week": 9,
  "paperNumber": 10,
  "title": "Practice Exam 8",
  "instructions": "Part I — Multiple choice: Questions 1–7. Select one answer for each question. Part II — Written questions: Q8 quality-attribute subparts and Q9 terms are fill-in-the-blank; Q10–Q13 scenario subparts require paragraph answers. For written answers, type your response, save it, reveal the model answer, then mark yourself Correct or Wrong. Practice material based on the supplied paper and answer guide; it does not establish the official exam blueprint.",
  "topics": "Practice Exam 8, adapted from the SmartNest practice paper and answer guide. Covers PUT idempotency; SOAP Document/Literal; deadlock prevention by lock ordering; conditional GET with ETags; the Interactive Response Time Law; containers and Kubernetes control loops; quality attributes; circuit breakers, HATEOAS, idempotency keys and open systems; publish/subscribe fanout and poison-message handling; component and series/parallel availability; resource state and optimistic concurrency; and AI workflow/agent autonomy, retry loops and action reversibility.",
  "sourceFiles": [
    "COMP4348_COMP5348_2026_S2_Practice_Exam_08.pdf (Desktop, practice-paper source)",
    "COMP4348_COMP5348_2026_S2_Practice_Exam_08_Answers.pdf (Desktop, answer guide)"
  ],
  "questions": [
    {
      "type": "mcq",
      "prompt": "Part I — Multiple choice\n\nSelect one answer for each question.\n\nA homeowner’s phone retries the same HTTP (Hypertext Transfer Protocol) PUT request to set a thermostat schedule after a flaky connection. Which property means the repeated request has the same final effect as one request?",
      "options": [
        "Idempotency",
        "Cacheability",
        "Safety",
        "Statelessness"
      ],
      "correctIndex": 0,
      "modelAnswer": "It is like writing the same temperature on a thermostat twice: the setting ends up at that value either way.\n\n• Correct idea: PUT replaces a resource with the requested state, so repeating the same PUT does not create an additional schedule. Idempotent does not mean there is no state change.\n\n• Why the other choices are wrong: Safety means a request is not meant to change state; cacheability and statelessness describe other HTTP or REST properties.\n\nSo the answer is: Idempotency"
    },
    {
      "type": "mcq",
      "prompt": "A SOAP (Simple Object Access Protocol) service sends a well-formed XML (Extensible Markup Language) document checked against an XML Schema and follows the WS-I (Web Services Interoperability) Basic Profile recommendation. Which encoding style is it using?",
      "options": [
        "RPC/Encoded",
        "Document/Literal",
        "HATEOAS",
        "JSON-RPC"
      ],
      "correctIndex": 1,
      "modelAnswer": "It is like submitting a standard form that can be checked against a shared template.\n\n• Correct idea: Document/Literal treats the SOAP body as schema-validated XML and is generally more interoperable across vendors.\n\n• Why the other choices are wrong: RPC/Encoded uses SOAP-specific procedure-call encoding; HATEOAS is a REST constraint, and JSON-RPC is a different protocol.\n\nSo the answer is: Document/Literal"
    },
    {
      "type": "mcq",
      "prompt": "Two routines each lock one device record and then wait for the other record, creating a circular wait. What is the direct preventive fix?",
      "options": [
        "Replace the locks with a modification counter",
        "Increase the lock timeout so both routines wait longer",
        "Use one canonical order for acquiring the locks",
        "Retry both routines repeatedly in random order"
      ],
      "correctIndex": 2,
      "modelAnswer": "If everyone collects keys in the same order, two people cannot each hold the key the other needs.\n\n• Correct idea: A consistent lock ordering prevents circular wait: every transaction acquires records in the same predefined order.\n\n• Why the other choices are wrong: A longer timeout delays detection, a modification count addresses optimistic conflict checks, and random retries do not guarantee the cycle is prevented.\n\nSo the answer is: Use one canonical order for acquiring the locks"
    },
    {
      "type": "mcq",
      "prompt": "A client sends If-None-Match with the ETag (entity tag, a version fingerprint) it received earlier. The resource has not changed. What should the server return?",
      "options": [
        "200 OK with the full representation",
        "204 No Content",
        "409 Conflict",
        "304 Not Modified with no body"
      ],
      "correctIndex": 3,
      "modelAnswer": "It is like a library confirming that the book on your shelf is still the latest edition, without sending you another copy.\n\n• Correct idea: A matching ETag tells the server the client’s cached representation is still current, so 304 avoids transferring the unchanged body.\n\n• Why the other choices are wrong: 200 resends the body, 204 means there is no response content for a different reason, and 409 does not describe a matching cache validator.\n\nSo the answer is: 304 Not Modified with no body"
    },
    {
      "type": "mcq",
      "prompt": "A closed system has 20 routines, completes 2,400 requests in 600 seconds, and has a 2-second think time. Using N = X(R + Z), what is the average response time?",
      "options": [
        "3 seconds",
        "5 seconds",
        "7 seconds",
        "78 seconds"
      ],
      "correctIndex": 0,
      "modelAnswer": "Think of 20 people taking turns at one kiosk: total time per visit plus thinking time is the number of people divided by visits per second.\n\n• Correct idea: Throughput X is 2,400/600 = 4 requests per second. Therefore R = N/X − Z = 20/4 − 2 = 3 seconds.\n\n• Why the other choices are wrong: Adding Z instead of subtracting it, multiplying N by X, or reversing X/N all apply the response-time law incorrectly.\n\nSo the answer is: 3 seconds"
    },
    {
      "type": "mcq",
      "prompt": "An edge gateway needs fast startup and many isolated services sharing one Linux operating-system kernel. Which deployment technology best fits?",
      "options": [
        "Virtual machines, each with its own guest operating system",
        "Containers sharing the host operating-system kernel",
        "A separate physical server for each service",
        "A hypervisor that gives every container a full guest operating system"
      ],
      "correctIndex": 1,
      "modelAnswer": "Containers are like separate workspaces in one building; virtual machines are more like separate buildings with their own utilities.\n\n• Correct idea: Containers share the host kernel, reducing startup and resource overhead and allowing denser packing than full virtual machines.\n\n• Why the other choices are wrong: A VM has its own guest OS, while a container does not; separate physical servers and guest operating systems add more overhead.\n\nSo the answer is: Containers sharing the host operating-system kernel"
    },
    {
      "type": "mcq",
      "prompt": "A Kubernetes Deployment wants three replicas but only two are running after a worker node fails. What normally causes a replacement replica to be scheduled?",
      "options": [
        "The container image’s ENTRYPOINT",
        "The registry restarting the failed pod",
        "The control plane’s reconciliation loop comparing actual and desired state",
        "The failed node’s kubelet creating a pod elsewhere"
      ],
      "correctIndex": 2,
      "modelAnswer": "It works like a thermostat: it keeps checking the measured temperature against the target and corrects a mismatch.\n\n• Correct idea: Kubernetes controllers continuously observe actual state, compare it with desired state, and act to correct drift.\n\n• Why the other choices are wrong: The registry stores images, the failed node cannot schedule a replacement elsewhere, and ENTRYPOINT runs inside a container rather than managing replica counts.\n\nSo the answer is: The control plane’s reconciliation loop comparing actual and desired state"
    },
    {
      "type": "fillblank",
      "prompt": "Part II — Written questions\n\nQ8 Quality attributes\n\nThe SmartNest team runs rule-engine changes against simulated sensor events before release. Name the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A practice field lets a team try a play safely before using it in a real game.\n\n• Correct idea: The requirement emphasizes checking behavior with controlled, simulated inputs before real users are affected.\n\n• Why the other choices are wrong: Portability is running across platforms, availability is being reachable, and scalability is handling growth in load.\n\nSo the answer is: Testability",
      "blanks": [
        [
          "Testability"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "A mobile app codebase must run unmodified on Android and iOS. Name the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A universal adapter lets the same device work in different countries’ sockets.\n\n• Correct idea: Portability is the ability to run the same software across different platforms with little or no modification.\n\n• Why the other choices are wrong: Performance concerns speed, testability concerns ease of checking behavior, and availability concerns uptime.\n\nSo the answer is: Portability",
      "blanks": [
        [
          "Portability"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "A sensor platform must handle ten times more connected devices without redesigning its ingestion pipeline. Name the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A road that can add lanes as traffic grows is designed to scale.\n\n• Correct idea: Scalability describes the ability to handle increased load without a major redesign.\n\n• Why the other choices are wrong: Security protects systems and data, testability supports verification, and portability supports running on different platforms.\n\nSo the answer is: Scalability",
      "blanks": [
        [
          "Scalability"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "A monitoring service must be reachable 99.95% of the time, except for a planned maintenance window. Name the quality attribute mainly addressed by this requirement: ___",
      "modelAnswer": "A shop that is open whenever customers need it has high availability.\n\n• Correct idea: The requirement is about the proportion of time the service can be reached and used.\n\n• Why the other choices are wrong: The other attributes concern platform independence, verification, or handling increased load rather than uptime.\n\nSo the answer is: Availability",
      "blanks": [
        [
          "Availability"
        ]
      ]
    },
    {
      "type": "fillblank",
      "prompt": "Q9 Terms\n\nComplete each statement with the appropriate term.\n\nWhen repeated calls to a failing dependency should stop temporarily instead of hammering it, a ______ pattern is used.",
      "blanks": [
        [
          "circuit breaker",
          "circuit-breaker"
        ]
      ],
      "modelAnswer": "A household circuit breaker stops sending electricity through a faulty circuit until it is safe to try again.\n\n• Key idea: A circuit breaker detects repeated failures and temporarily blocks further calls, protecting both the caller and the dependency.\n\nSo the answer is: circuit breaker."
    },
    {
      "type": "fillblank",
      "prompt": "A REST (Representational State Transfer) API exposes links for the actions currently available on a resource. This constraint is called ______.",
      "blanks": [
        [
          "HATEOAS",
          "hypermedia as the engine of application state"
        ]
      ],
      "modelAnswer": "It is like a signpost showing which doors are open right now.\n\n• Key idea: HATEOAS lets the client discover next actions through links in the server’s response rather than hard-coding every state transition.\n\nSo the answer is: HATEOAS."
    },
    {
      "type": "fillblank",
      "prompt": "A retry carries a unique ______ so the server can recognize and ignore a duplicate update.",
      "blanks": [
        [
          "idempotency key",
          "idempotency-key"
        ]
      ],
      "modelAnswer": "It is like a claim ticket: a second copy of the same ticket identifies the same job.\n\n• Key idea: An idempotency key identifies one logical operation across retries so the server can avoid applying it twice.\n\nSo the answer is: idempotency key."
    },
    {
      "type": "fillblank",
      "prompt": "A workload whose events arrive from an unbounded number of outside devices is an ______ system.",
      "blanks": [
        [
          "open",
          "open system"
        ]
      ],
      "modelAnswer": "An open checkout line has new customers arriving from outside, rather than a fixed group taking turns.\n\n• Key idea: Open systems receive requests from outside sources; a closed system has a fixed population of terminals or users.\n\nSo the answer is: open."
    },
    {
      "type": "scenario",
      "prompt": "Scenario questions — write each response in a short paragraph, showing your reasoning.\n\nQ10(a)\n\nAnalytics, Alerting, and Billing each need every telemetry event. They compete to consume from one queue. What is the problem?",
      "modelAnswer": "One pizza shared by three people is different from ordering one whole pizza for each person.\n\n• Correct idea: Competing consumers share work: each message goes to one consumer, but this use case requires every service to receive every event.\n\n• A common mistake is: A normal competing-consumer queue does not broadcast or create an independent copy for each service, and it does not create a shared database transaction.\n\nSo the answer is: The queue distributes each event to one competing consumer, so the other services miss it"
    },
    {
      "type": "scenario",
      "prompt": "Q10(b)\n\nWhat should SmartNest use so Analytics, Alerting, and Billing each receive an independent copy of every telemetry event?",
      "modelAnswer": "A radio broadcast can be heard independently by every station tuned to it.\n\n• Correct idea: A fanout exchange publishes a copy to every bound queue, allowing each downstream service to process and acknowledge events independently.\n\n• A common mistake is: Competing consumers split messages; RPC tightly couples the publisher to each service; a dead-letter queue is for failures, not normal broadcast.\n\nSo the answer is: A fanout exchange with one bound queue per service"
    },
    {
      "type": "scenario",
      "prompt": "Q10(c)\n\nAlerting is offline for ten minutes while events continue to arrive. Its own persistent queue is not being consumed. What normally happens?",
      "modelAnswer": "A mailbox can hold letters while its owner is away, while other people’s mailboxes keep receiving their own letters.\n\n• Correct idea: The Alerting queue builds a backlog; when its consumer returns, it can drain the messages. With persistent messaging, an outage becomes a delay rather than immediate loss.\n\n• A common mistake is: Independent queues isolate each subscriber; the exchange does not normally erase a queued message just because the consumer is offline, and the gateway need not make synchronous calls.\n\nSo the answer is: Its messages accumulate for later processing, while the other services’ queues remain independent"
    },
    {
      "type": "scenario",
      "prompt": "Q10(d)\n\nA message reaches a consumer but repeatedly fails during processing and exceeds its retry limit. Which mechanism handles it, and how is that different from a delivery failure?",
      "modelAnswer": "A parcel that arrived but cannot be opened is different from a parcel that never reached the address.\n\n• Correct idea: Repeated consumer-processing failure is poison-message handling; a dead-letter queue is for delivery failures such as expiry or routing failure before a consumer receives the message.\n\n• A common mistake is: Successful messages are not poison messages, and the two queues describe different failure stages rather than the same mechanism.\n\nSo the answer is: Poison-message queue; a dead-letter queue handles messages that could not be delivered to a queue"
    },
    {
      "type": "scenario",
      "prompt": "Q11(a)\n\nUsing Availability = MTTF (Mean Time To Failure)/(MTTF + MTTR (Mean Time To Repair)), which set of component availabilities is correct for the Gateway (2400h, 6h), Broker (4000h, 4h), and Database (9000h, 18h)?",
      "modelAnswer": "Availability is the working part of a full cycle that includes both working time and repair time.\n\n• Correct idea: The calculations are 2400/2406 ≈ 99.7506%, 4000/4004 ≈ 99.9001%, and 9000/9018 ≈ 99.8004%.\n\n• A common mistake is: Each incorrect option assigns the right approximate percentages to the wrong component.\n\nSo the answer is: 99.75%, 99.90%, 99.80%"
    },
    {
      "type": "scenario",
      "prompt": "Q11(b)\n\nThe Gateway, Broker, and Database must all work for telemetry to be recorded. Their availabilities are about 99.7506%, 99.9001%, and 99.8004%. What is the overall series availability?",
      "modelAnswer": "A chain works only when every link works, so each required link reduces the chance the whole chain is available.\n\n• Correct idea: For a series system, multiply the component availabilities: 0.997506 × 0.999001 × 0.998004 ≈ 0.994521, or 99.4521%.\n\n• A common mistake is: A series system is not equal to its strongest or weakest component, and it does not gain redundancy unless alternatives are arranged in parallel.\n\nSo the answer is: About 99.4521%, the product of the three availabilities"
    },
    {
      "type": "scenario",
      "prompt": "Q11(c)\n\nAn overall availability of 99.4521% corresponds to roughly 48 hours of downtime per year. How does that compare with the standard nines tiers?",
      "modelAnswer": "A yearly downtime budget is like a race time: compare the measured result with each benchmark rather than rounding it to the nearest label.\n\n• Correct idea: Two nines allow about 87.6 hours/year and three nines about 8.76 hours/year. Forty-eight hours falls between those tiers, so report the calculated availability rather than rounding it to either benchmark.\n\n• A common mistake is: The system is not above 99.9%, below 99%, or exactly equal to either tier.\n\nSo the answer is: It lies between two and three nines, so it does not meet either tier"
    },
    {
      "type": "scenario",
      "prompt": "Q11(d)\n\nA second identical Message Broker is added in parallel, so either broker can work. What is the new overall availability and why is the gain limited?",
      "modelAnswer": "Adding a backup to the strongest link in a chain does not repair the weaker links.\n\n• Correct idea: The broker pair is about 99.9999% available, but the unchanged Gateway and Database remain in series, giving about 99.5514% overall.\n\n• A common mistake is: Redundancy improves the broker stage, but it neither removes the other components nor makes the whole chain equal to the broker alone.\n\nSo the answer is: About 99.5514%; the unchanged Gateway and Database now dominate the series path"
    },
    {
      "type": "scenario",
      "prompt": "Q12(a)\n\nA thermostat’s target temperature is stored and shared across many automation rules and sessions. Which state category best describes it?",
      "modelAnswer": "A thermostat’s saved setting is like a shared noticeboard entry, not a note kept by one person during one task.\n\n• Correct idea: Resource state represents a persistent domain fact that can be accessed by multiple operations or sessions.\n\n• A common mistake is: Local computation state is transient to one operation; session state belongs to one related interaction; temporary message state is not a course category here.\n\nSo the answer is: Resource state"
    },
    {
      "type": "scenario",
      "prompt": "Q12(b)\n\nTwo thermostat rules both read the old value; Rule B writes 18 first and Rule A writes 21 last. What is the lost-update result?",
      "modelAnswer": "If two people edit a copy of the same document, the last saved copy can erase the earlier person’s change.\n\n• Correct idea: Both rules worked from stale versions; the last write replaces the whole record, so Rule A leaves 21 and silently overwrites Rule B’s 18.\n\n• A common mistake is: The final state is determined by the last write, not the first, and the system does not automatically average the values.\n\nSo the answer is: The final value is 21, and Rule B’s update is overwritten"
    },
    {
      "type": "scenario",
      "prompt": "Q12(c)\n\nHow can optimistic concurrency control prevent one thermostat rule from silently overwriting another rule’s newer value?",
      "modelAnswer": "A shared document can show an edit number; if the number changed while you were working, you reopen the latest version before saving.\n\n• Correct idea: Each rule remembers the version it read. A changed version makes the stale write fail; the rule should reread, recompute, and retry.\n\n• A common mistake is: Table locks are pessimistic and unnecessarily broad, ignoring versions preserves the lost update, and queues do not resolve a database write conflict.\n\nSo the answer is: Check the record version at write time and reject a stale write so the rule can reread and retry"
    },
    {
      "type": "scenario",
      "prompt": "Q12(d)\n\nTwo rules contend for one thermostat record. What is the best trade-off if the team chooses pessimistic locking for this case?",
      "modelAnswer": "Locking one diary page makes sense if two people edit it; locking the whole library would stop everyone else from working.\n\n• Correct idea: A row-level lock can prevent the specific lost update, but the other rule must wait and locks can add contention or deadlock risk.\n\n• A common mistake is: Table-wide locking blocks unrelated devices, pessimistic locks do block, and row-level locking does not eliminate all deadlocks.\n\nSo the answer is: Row-level locking prevents conflicting edits but makes the other rule wait; it avoids blocking the whole table"
    },
    {
      "type": "scenario",
      "prompt": "Q13(a)\n\nA nightly feature reads energy logs, writes a summary, and emails it; code fixes the sequence and the homeowner chooses what to do next. Which autonomy level is this: LLM (large language model), AI workflow, or AI agent?",
      "modelAnswer": "A recipe that always follows the same written steps is different from a cook deciding what to do next on their own.\n\n• Correct idea: The software determines the fixed retrieve, summarize, and email sequence; the model generates text but does not choose the next action.\n\n• A common mistake is: Level 1 has no multi-step fixed workflow, and Level 3 requires the model to choose actions at run time; sending an email alone does not make it an agent.\n\nSo the answer is: Level 2: an AI workflow with developer-fixed steps"
    },
    {
      "type": "scenario",
      "prompt": "Q13(b)\n\nA feature watches live electricity prices, chooses which appliances to delay, and calls a smart-plug API (application programming interface) without asking the homeowner. Which autonomy level best fits?",
      "modelAnswer": "A person following a fixed checklist is a workflow; a person deciding which action to take as conditions change is acting autonomously.\n\n• Correct idea: The model selects actions based on live prices and invokes tools without a developer-fixed sequence, which is agent behavior.\n\n• A common mistake is: Using an API alone does not determine autonomy; the key distinction is who chooses the next step.\n\nSo the answer is: Level 3: an AI agent choosing actions at run time"
    },
    {
      "type": "scenario",
      "prompt": "Q13(c)\n\nAn autonomous energy agent times out while calling the grid-price API. Which failure mode is especially plausible if it keeps retrying without a limit?",
      "modelAnswer": "A phone repeatedly redialing a number that never answers can use up time and battery without getting anywhere.\n\n• Correct idea: A retry loop repeats the same failing action without a stop condition, consuming the agent’s step or cost budget.\n\n• A common mistake is: The other choices describe unrelated database, messaging, or HTTP-cache mechanisms.\n\nSo the answer is: Retry loop that burns steps and cost without progress"
    },
    {
      "type": "scenario",
      "prompt": "Q13(d)\n\nA smart plug turns an ordinary appliance off to shift energy use. Which statement best applies the reversibility and blast-radius rule?",
      "modelAnswer": "Turning a lamp back on usually undoes the action; turning off a medical device could cause harm that cannot be undone by turning it back on.\n\n• Correct idea: Classify the action per appliance: ordinary switching is reversible and low impact, while a safety-critical device may have effectively irreversible consequences.\n\n• A common mistake is: Approval should depend on reversibility and blast radius, not a blanket rule or the model’s confidence.\n\nSo the answer is: It is usually reversible for an ordinary low-impact appliance, but high-impact devices may need approval or no agent access"
    }
  ]
};

export const COMP5348_PRACTICE_EXAM_8_PAPERS: ExamPaperSeed[] = [PAPER];
