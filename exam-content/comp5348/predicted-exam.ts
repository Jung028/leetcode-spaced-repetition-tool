import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  "course": "COMP5348",
  "week": 9,
  "paperNumber": 3,
  "title": "Predicted Exam Practice Paper",
  "instructions": "Part I — Multiple choice: Questions 1–7. Select one answer for each question. Part II — Written questions: answer the scenario questions in short paragraphs, complete the fill-in-the-blank items, then answer the quality-attribute mapping in a numbered list. For written answers, type your response, save it, reveal the model answer, then mark yourself Correct or Wrong. Predicted practice content is for revision and does not establish the official exam blueprint.",
  "topics": "A predicted-exam practice paper grounded in the 9 real COMP4348/COMP5348 2026 S2 practice exam papers and their answer keys, covering the concepts and question patterns that recur most across them: REST verb safety and idempotency (PUT vs POST, ETags/If-None-Match/304), RPC call-ambiguity under timeout, Two-Phase Commit mechanics (Prepare vs Commit phase) versus the Saga pattern and compensating transactions, optimistic vs pessimistic concurrency control, row-level vs table-level locking and deadlocks, series/parallel availability calculations, dead-letter vs poison-message queues, RPC vs message-queue communication-style trade-offs, Kubernetes self-healing control loops, VM vs container isolation, cloud service model fit (IaaS/PaaS/FaaS), AI autonomy levels (workflow vs agent) and the 'lethal trifecta' data-exfiltration risk, SOAP/WSDL Document-Literal vs RPC-Encoded, and naming quality attributes (availability, scalability, portability, testability, security/non-repudiation) from a described requirement. Now arranged in two parts: seven MCQs followed by written fill-in and paragraph-response questions.",
  "sourceFiles": [
    "Predicted Exam - COMP5348.docx (Desktop, derived from the 9 real COMP4348_COMP5348_2026_S2_Practice_Exam PDFs + their Answers)"
  ],
  "questions": [
    {
      "type": "mcq",
      "prompt": "Part I — Multiple choice\n\nSelect one answer for each question.\n\nA clinic booking API exposes PUT /appointments/{id} to reschedule an appointment to an exact given time, and POST /appointments to create a new booking. A mobile app's PUT request succeeds, but the network drops the reply before the app sees it, so the app automatically resends the identical PUT request. Is this resend safe, and why?",
      "options": [
        "Yes — PUT is idempotent, so resending the identical request leaves the appointment at the same final time; it is not \"safe\" in REST's technical sense because it still changes stored data.",
        "No — PUT is not idempotent here, so resending the identical request risks creating a second, duplicate reschedule each time the app retries after losing the reply.",
        "Yes — PUT counts as \"safe\" in REST's technical sense, so the resend has no effect on the server at all and the appointment's stored data never changes.",
        "No — only POST is idempotent here, because it always targets the same fixed collection URI, so PUT must never be retried after a lost reply without extra tracking."
      ],
      "correctIndex": 0,
      "modelAnswer": "Think of PUT like writing today's date on a whiteboard: no matter how many times you write \"Tuesday\" on it, the board still only ever says \"Tuesday\" once. POST is more like stapling a brand-new sheet of paper onto a pile — do it twice and you get two sheets.\n\n• What idempotent means: doing an operation once has exactly the same end result as doing it two, three, or a hundred times.\n\n• Why PUT qualifies: PUT replaces a resource with an exact given state, so repeating the identical PUT just sets it to the same time again — nothing changes the second time.\n\n• Why this still isn't \"safe\": REST's own term \"safe\" means an operation never changes server state at all, like a GET. PUT does change state, it just doesn't change it further on repeats — idempotent and safe are two different properties.\n\n• Why the other options are wrong: a resend creating a duplicate would mean PUT is not idempotent, which is wrong; claiming PUT has no effect at all confuses \"safe\" with \"idempotent\"; and POST is actually the one that is NOT idempotent, the opposite of that option's claim.\n\nSo the answer is: the resend is safe because PUT is idempotent, even though it isn't REST-\"safe\"."
    },
    {
      "type": "mcq",
      "prompt": "A courier-dispatch service calls a remote procedure AssignDriver(orderId) over RPC (Remote Procedure Call — calling code on another machine as if it were a normal local function call). The network times out before a reply arrives, so the caller cannot tell whether AssignDriver actually ran on the server or not, and it retries the identical call. What property must AssignDriver have for this retry to be safe?",
      "options": [
        "It must be synchronous, so the caller blocks until it is certain the first call fully completed before retrying.",
        "It must be idempotent, so running it a second time has the same effect as running it once.",
        "It must run inside Two-Phase Commit, so the protocol automatically detects and discards the retry.",
        "It must be stateless, so the server keeps no record of which driver was assigned between calls."
      ],
      "correctIndex": 1,
      "modelAnswer": "Imagine you text a friend \"pick up milk\" and get no reply — you don't know if the text never arrived, or they got it and their reply to you got lost. If you text \"pick up milk\" again, you want that to mean one trip to the shop, not two.\n\n• Why the ambiguity exists: a timeout could mean the request never arrived, or it arrived, ran, and only the reply was lost — the caller genuinely cannot tell which.\n\n• Why retry alone is risky: if AssignDriver is not idempotent, the server might assign a driver twice, so the courier platform ends up with two drivers heading to the same pickup.\n\n• The fix: make AssignDriver idempotent, for example by checking whether the order already has a driver assigned before assigning one, so a repeat call is harmless.\n\n• Why the other options are wrong: blocking synchronously just delays discovering the ambiguity rather than resolving it; a commit protocol coordinates separate systems committing together, it does not deduplicate retries on its own; and statelessness is about not keeping session data between calls, not about being safe to repeat.\n\nSo the answer is: AssignDriver must be idempotent."
    },
    {
      "type": "mcq",
      "prompt": "During Two-Phase Commit (2PC — a protocol for getting several systems to all commit or all abort together) between a Transaction Manager and two Resource Managers, one Resource Manager replies \"vote_commit\" during the Prepare phase. What has actually happened at that Resource Manager at this exact point?",
      "options": [
        "Its change has already been durably written; the vote simply confirms the write succeeded.",
        "It has released all its locks, since voting \"commit\" means the risk has passed.",
        "It has saved the intended change and can still vote either way, but has not actually applied the change yet.",
        "It has forwarded the final decision directly to the other Resource Manager, bypassing the Transaction Manager."
      ],
      "correctIndex": 2,
      "modelAnswer": "It's like a group of friends deciding on a restaurant by text: everyone first says \"I'm in, ready to book\" before anyone actually pays a deposit, and nobody pays until the organiser texts back that everyone is in.\n\n• What the Prepare phase really does: each Resource Manager checks it can do its part, saves the intended change somewhere durable, and votes yes or no — but does not apply the change to the real data yet.\n\n• What the Commit phase does: only after the Transaction Manager collects every vote and sees all \"yes\" does it tell everyone to commit, and only then is the change actually applied.\n\n• Why the two-step split matters: it lets the whole group abort cleanly if even one participant votes no, because nobody has committed to anything real yet.\n\n• Why the other options are wrong: the change is not yet applied, so it cannot already be durably written; locks are held through both phases rather than released early; and only the Transaction Manager coordinates the final decision, participants never forward it directly to each other.\n\nSo the answer is: the change is saved and ready to apply, but has not actually been applied yet."
    },
    {
      "type": "mcq",
      "prompt": "A payment platform must debit a customer's wallet and credit a loyalty-points balance, run by two independently-operated services. Which statement correctly contrasts coordinating this with Two-Phase Commit (2PC) versus the Saga pattern (a sequence of local transactions, each with a compensating action to undo it if a later step fails)?",
      "options": [
        "2PC lets each service commit immediately and only runs a compensating transaction if a later step fails; a Saga instead makes every participant vote in a Prepare phase before anyone is allowed to commit anything.",
        "Both patterns require every participant to vote before committing anything real; a Saga just renames the coordinating Transaction Manager an \"orchestrator\" without changing how the voting actually works.",
        "2PC and the Saga pattern are really the same underlying mechanism, differing only in which industry standard body formally defines and certifies each one for enterprise use.",
        "2PC requires every participant to vote in a Prepare phase before anyone commits, holding locks/resources until the decision is known; a Saga lets each step commit immediately and relies on compensating transactions if a later step fails."
      ],
      "correctIndex": 3,
      "modelAnswer": "2PC is like a wedding where every guest must RSVP yes before the caterer is allowed to cook anything. A Saga is like a road trip with no group RSVP: you just start driving, and if a later booking falls through, you cancel something you already booked instead of never having left home.\n\n• 2PC's shape: Prepare, where everyone votes and resources stay held or locked, then Commit, where everyone applies the change — strongly coordinated, but every participant is tied up waiting the whole time.\n\n• Saga's shape: each step commits on its own, right away, with no group vote at all.\n\n• The trade-off: 2PC gives strict all-or-nothing certainty but can block participants for a long time, which hurts availability; a Saga stays available and fast, but needs a compensating action ready for every step in case something downstream fails.\n\n• Why the other options are wrong: a Saga never holds a group vote, which rules out the options that swap the two patterns or claim they both vote; and the two patterns behave completely differently, not just under different names.\n\nSo the answer is: 2PC makes every participant vote before anyone commits and holds resources meanwhile, while a Saga commits each step immediately and compensates later if needed."
    },
    {
      "type": "mcq",
      "prompt": "A news app polls GET /articles/{id} repeatedly and sends back the ETag (a version fingerprint the server returned last time) in an If-None-Match header. The article has not changed since the last poll. What should the server respond with, and why does this help performance?",
      "options": [
        "304 Not Modified with no response body, because the matching ETag shows the client's cached copy is still current, so re-sending it would waste bandwidth.",
        "200 OK with the full article body sent again every time, because an ETag is only meant to protect write operations from conflicts, not to help optimise ordinary read requests like this poll.",
        "201 Created with a Location header pointing at a new resource, since a matching ETag on a read actually means a brand-new representation reference now has to be issued to the client.",
        "409 Conflict, because a matching ETag actually means the client's cached copy has become stale relative to the server's current version of the article."
      ],
      "correctIndex": 0,
      "modelAnswer": "It's like asking a friend whether anything changed on the group chat since you last checked. If the answer is \"nope, still the same\", you don't need them to re-read you the whole chat history — \"nope\" is enough.\n\n• What an ETag is: a short fingerprint, like a version stamp, the server attaches to a resource's current representation.\n\n• How If-None-Match uses it: the client sends back the fingerprint it already has, and the server compares it to the current one.\n\n• If they match: the server returns 304 Not Modified with an empty body, telling the client its copy is still correct without re-sending the whole article.\n\n• Why the other options are wrong: ETag applies to reads, not just writes; nothing about a matching fingerprint calls for creating a new resource or signalling a conflict — a match means everything is fine, the opposite of stale.\n\nSo the answer is: 304 Not Modified with no body, because re-sending unchanged data would waste bandwidth."
    },
    {
      "type": "mcq",
      "prompt": "Two travel agents may try to book the same seat at the same time. The system records a modification count on each seat row, and re-checks that count at write time; if it has changed, the write is refused and retried. Which concurrency-control strategy is this, and what is its main limitation?",
      "options": [
        "Pessimistic locking; it blocks the second agent from even viewing or reading the seat row until the first agent's entire booking attempt has fully finished and released its lock.",
        "Optimistic concurrency control; full correctness also requires checking the modification counts of every other object read during the computation, which is rarely done in practice.",
        "Optimistic concurrency control; once the modification count is checked and matches, it guarantees that no further retry will ever be needed for that booking again.",
        "Pessimistic locking; because it holds an exclusive lock for the whole transaction, it can never allow a lost update to occur under any circumstances at all."
      ],
      "correctIndex": 1,
      "modelAnswer": "It's like two people editing the same shared document without locking each other out: you both type freely, but right before you hit save, the app checks whether anything changed since you opened it — if so, it stops you and asks you to redo your edit on the latest version.\n\n• Why this is optimistic, not pessimistic: nobody is blocked up front, both agents can read and work on the booking at the same time, and the conflict is only caught at write time via the stored count.\n\n• The real limitation: genuinely complete correctness needs checking the modification count of every object read during the whole computation, not just the one being written, and in practice systems usually only check the one record being saved.\n\n• Why the other options are wrong: pessimistic locking would stop the second agent from reading or writing up front via a lock, which is not what's described here; and optimistic control never guarantees no retry, since the whole point is that a retry can happen whenever there is a genuine conflict.\n\nSo the answer is: this is optimistic concurrency control, and its real limitation is that full correctness would require checking every object read, not just the one written."
    },
    {
      "type": "mcq",
      "prompt": "A bulk price-update batch job is deciding between row-level and table-level locking on a products table that live customer traffic is also reading and updating concurrently. Which statement correctly describes the trade-off?",
      "options": [
        "Table-level locking allows more concurrent updates than row-level locking, because managing one big lock is more efficient than managing many small ones.",
        "Row-level locking has no overhead at all compared to table-level locking, since fine-grained locking is free in every relational database.",
        "Row-level locking allows more concurrent updates to different rows, but carries more locking overhead and a higher deadlock risk than table-level locking.",
        "Table-level locking carries a higher deadlock risk than row-level locking, because it forces every transaction to wait for every other one."
      ],
      "correctIndex": 2,
      "modelAnswer": "Table-level locking is like locking the whole kitchen so only one chef can cook at a time, even if they're using completely different stoves. Row-level locking is like each chef only locking the one stove they're actually using — more people can cook at once, but now two chefs can end up each waiting on a stove the other is holding.\n\n• Row-level locking's benefit: different rows can be updated by different transactions at the same time, which is exactly what a busy live table needs.\n\n• Row-level locking's cost: the database has to track far more individual locks, and because transactions can each hold different rows while waiting for others, the risk of a deadlock goes up.\n\n• Table-level locking's trade-off: it is simpler and has lower deadlock risk, but it blocks concurrency that would otherwise be perfectly safe, which is exactly the wrong fit for a table under live concurrent traffic.\n\n• Why the other options are wrong: table-level locking allows less concurrency, not more; row-level locking is not free, it costs more tracking overhead; and it is row-level locking's finer granularity, not table-level locking, that raises deadlock risk.\n\nSo the answer is: row-level locking allows more concurrent updates, but with more overhead and a higher deadlock risk than table-level locking."
    },
    {
      "type": "scenario",
      "prompt": "Part II — Written questions\n\nScenario responses — write a short paragraph explaining your reasoning.\n\nScenario 1\n\nTransaction A is currently waiting to acquire a lock on the Orders table, which is held by Transaction B. A teammate claims this by itself proves a deadlock has occurred. Evaluate this claim.",
      "modelAnswer": "One person waiting for the bathroom isn't a traffic jam. A traffic jam is when car A is blocking car B's only way out, and car B is simultaneously blocking car A's only way out, so nobody can move until someone backs up.\n\n• What a deadlock actually requires: a circular wait, where A waits on something B holds, and directly or through a chain, B is also waiting on something A holds.\n\n• What's described here: only a one-way wait, A waiting on B. That is just normal lock contention, which usually resolves quickly once B finishes and releases the lock.\n\n• A common mistake is: a timeout is how systems eventually detect and break a real deadlock, it does not create one; and deadlocks absolutely can happen between exactly two transactions, so ruling that out is wrong.\n\nSo the answer is: the teammate's claim is incorrect — a one-way wait is ordinary contention, not a deadlock, which needs a circular wait."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 2\n\nA checkout path depends on two components in series: an AuthGateway (99.9% available) and a PaymentProcessor (99% available). What is the path's overall availability, and why?",
      "modelAnswer": "A chain is only as strong as both its links combined being intact — if either link can snap, having a strong second link doesn't make up for a slightly weaker first one.\n\n• The calculation: for components in series, where both must work for the whole path to work, overall availability equals A1 times A2, 0.999 times 0.99, about 0.9890, or 98.90%.\n\n• Why it's lower than either component: every extra component in series is one more thing that can independently fail, so each additional link in series can only ever pull the combined number down, never up.\n\n• A common mistake is: series availability is never the higher of the two figures, and it is never exactly the lower one either since it actually drops below it; and series components never raise availability above the weakest link.\n\nSo the answer is: about 98.90%, found by multiplying the two availabilities together."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 3\n\nThe platform from the previous question adds a second, independent PaymentProcessor (99% available) in parallel with the first — either one being up is enough — while keeping one AuthGateway (99.9%) in series. Approximately what happens to overall availability?",
      "modelAnswer": "Putting two payment processors side by side, with either one able to cover the job, is like having a spare key hidden outside the house — you are only locked out if both the key in your pocket and the spare are lost at the same time, which is much less likely than losing just one.\n\n• Step one, the parallel processor pair: availability equals 1 minus (1 minus 0.99) squared, which is 1 minus 0.0001, about 99.99%.\n\n• Step two, combining with the gateway, still in series: total availability is about 0.999 times 0.9999, roughly 99.89%.\n\n• The takeaway: redundancy in parallel only ever raises availability, while a component still in series, here the lone gateway, only ever caps it, so the gateway is now effectively the new bottleneck.\n\n• A common mistake is: redundancy raises availability, it does not lower it; the processor stage's improvement does move the combined number even though the gateway still matters; and gaining exactly one more nine is not a fixed rule, since the actual gain depends on the specific numbers involved.\n\nSo the answer is: it rises to about 99.89%, with the gateway now the limiting factor."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 4\n\nA message that cannot be delivered to any consumer at all, because its time-to-live expires before anything reads it, is moved onto Queue X on the sending side. A different message IS delivered successfully, but the consumer's processing of it keeps throwing an exception every time, so after a retry limit it is moved onto Queue Y instead. What are Queue X and Queue Y called?",
      "modelAnswer": "A dead-letter queue is like a parcel stamped return to sender, because the courier never even managed to hand it to anyone. A poison-message queue is more like a customer who did receive the parcel, but every time they try to open it, it explodes, so after a few tries the shop pulls it aside instead of mailing it back again.\n\n• Dead-letter queue: for messages that were never successfully delivered at all, for example because the time-to-live expired first or routing failed.\n\n• Poison message queue: for messages that were delivered, but whose processing keeps failing with an exception every time, so after a retry limit it is pulled aside to stop blocking the queue and allow diagnosis later.\n\n• Why the distinction matters: they represent opposite failure stages — too few deliveries for the dead-letter case versus a delivery processed too many times without ever succeeding for the poison case.\n\n• A common mistake is: the two queues are not the same mechanism, and Queue X is not a poison queue since the message in that case was never delivered at all; a plain \"retry queue\" is not the standard term for either case described.\n\nSo the answer is: Queue X is a dead-letter queue, and Queue Y is a poison (message) queue."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 5\n\nA ride-hailing app requests a driver's live ETA (estimated time of arrival) — a reply arriving more than half a second late is useless and should just be discarded. Separately, a \"trip completed\" event must reach a billing system — it must never be lost, but a delay of a few seconds is completely fine. Which communication style fits each interaction, and why?",
      "modelAnswer": "Asking \"what's the ETA?\" is like asking someone a question face-to-face — you want the answer right now, or not at all; a stale answer is worthless. Sending a trip-completed notice is more like dropping a letter in a mailbox — it doesn't need to be read instantly, it just needs to definitely arrive eventually.\n\n• ETA request: needs RPC, a direct, synchronous request and response. There is no benefit to durability or decoupling here, because a late answer is thrown away anyway, and a queue would only add latency for nothing.\n\n• Trip-completed event: needs a message queue, since it must survive the billing system being briefly down, and the ride-hailing app should not have to wait around for billing to confirm receipt before moving on.\n\n• Why swapping them is wrong: using a queue for the ETA just adds delay to something time-critical, while using plain RPC for the billing event risks losing it entirely if billing happens to be down at that exact moment.\n\nSo the answer is: RPC for the ETA request, and a message queue for the trip-completed event."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 6\n\nA Kubernetes (a container-orchestration platform) Deployment has 3 desired replica pods. One worker node hosting one of those pods crashes. Which mechanism restores the service to 3 running pods, and how?",
      "modelAnswer": "It's like a thermostat: it doesn't need a person to notice the room got cold, it just continuously checks whether the actual temperature matches the one it's set to, and turns the heating on by itself the moment they don't match.\n\n• What the control loop does: continuously observe actual state, compare it to desired state, and act automatically to correct any difference.\n\n• Applied here: actual pods (2) no longer match desired pods (3), so the control plane schedules a replacement pod onto a healthy node automatically, with zero human involvement.\n\n• Why this matters: this self-healing is exactly what makes Kubernetes-managed services more resilient to unplanned node failures than manually-managed deployments.\n\n• A common mistake is: no manual step is needed to tell Kubernetes the current count, the correction happens after unplanned failures too, and the whole platform does not pause while this correction runs.\n\nSo the answer is: the control plane automatically schedules a replacement pod to restore the desired 3 replicas, with no human involved."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 7\n\nWhich statement correctly explains why containers start in seconds and pack far more densely onto a server than virtual machines (VMs) do?",
      "modelAnswer": "A virtual machine is like building an entirely separate house, complete with its own plumbing and electrical system, just to rent out one room. A container is like renting a room in a house that already has shared plumbing and electricity — much faster to move into, and more rooms fit in the same building.\n\n• VMs: each one runs a full, independent guest operating system on top of a hypervisor, the layer that lets multiple VMs share one physical machine — heavyweight, and booting a fresh guest OS takes real time.\n\n• Containers: they share the host machine's OS kernel directly, through a container runtime, isolating only the application and its dependencies, which is much lighter weight.\n\n• Why this matters: sharing the kernel is exactly why containers start in seconds with no OS to boot, and why far more of them can be packed onto the same hardware than VMs.\n\n• A common mistake is: containers do not each run their own guest OS, that describes VMs; VMs do not share one kernel across every VM, that describes containers; and the real difference is the kernel-sharing architecture, not which tool happens to manage each one.\n\nSo the answer is: VMs each run a full guest OS on a hypervisor, while containers share the host's OS kernel through a container runtime."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 8\n\nA university needs to host: (i) a legacy simulation engine with a custom kernel module that the team must directly control, and (ii) a \"generate exam timetable\" function that runs for only a few minutes, once a semester, at an unpredictable exact moment. Which pairing of cloud service models correctly fits (i) and (ii), and why?",
      "modelAnswer": "IaaS is like renting an empty apartment — you bring and manage all your own furniture, but you can set it up exactly how you need. Serverless is like ordering food only when you're hungry — you pay only when you actually use it, and nobody keeps a kitchen running for you in between.\n\n• The legacy engine: its custom kernel module means the team needs direct control over the operating system itself, something PaaS and serverless both take away from the customer. IaaS is the one model that leaves OS-level control with the customer.\n\n• The timetable function: it is event-driven, rare, and unpredictable in timing, exactly the spiky, infrequent load pattern that serverless fits well, since it scales to zero and costs nothing between runs.\n\n• A common mistake is: PaaS manages the OS and runtime for the customer, which is incompatible with the legacy engine's special OS needs, and swapping the pairing puts each workload with the model that fits it worst.\n\nSo the answer is: IaaS for the legacy engine, and serverless/FaaS for the timetable function."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 9\n\nAn exam-support tool always runs the exact same fixed sequence of lookups — unit outline, then assessment dates — regardless of the question, with a model only used to turn the retrieved facts into a readable sentence. A second, separate tool decides for itself, at run time, which of several lookups to run and in what order, and can send an email to a lecturer without asking first. Classify each tool's level of autonomy.",
      "modelAnswer": "Level 2 is like following a fixed recipe: step one, step two, step three, every time, no matter who's cooking. Level 3 is like a chef improvising, deciding on the fly which ingredients to grab and in what order, then serving the dish without checking with anyone first.\n\n• What actually distinguishes the levels: not how many model calls happen, but who decides the next step — fixed code for an AI workflow, or the model itself at run time for an AI agent.\n\n• Tool one: the lookups always run in the same order, written into the code, and the model is only used for the final wording. That is Level 2, even though it does retrieve data, because the retrieval order is fixed.\n\n• Tool two: the model itself chooses which lookups to run, in what order, and takes a real-world action, sending an email, with no human approval step. That is the defining shape of Level 3.\n\n• A common mistake is: retrieving data by itself does not make something an agent, and the number of model calls is not what the levels measure.\n\nSo the answer is: the first tool is Level 2 (an AI workflow), and the second is Level 3 (an AI agent)."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 10\n\nAn AI assistant reads incoming student emails (which may contain arbitrary attacker-written text), has access to students' private academic records, and can send outbound emails to any address. Which statement correctly evaluates the risk?",
      "modelAnswer": "It's like a bank teller who will read any note a stranger slides across the counter, has full access to every customer's account balance, and is allowed to wire money anywhere on request — if all three are true of the same teller, a convincingly-worded fake note is all it takes to steal money, no matter how polite the teller's training was.\n\n• The three legs: untrusted input, meaning text the assistant reads that could come from an attacker; access to sensitive or private data; and an output channel that reaches the outside world.\n\n• Why all three together are dangerous: an attacker can hide instructions inside the untrusted input, which the model then obeys because it cannot reliably tell data from instructions, and if it also has both the private data and a way to send it out, that is a direct path to leaking it.\n\n• Why wording the prompt better is not enough: a prompt instruction is just another piece of text the model has to interpret correctly every single time, so it is not a hard architectural guarantee, and a cleverly-worded attack can still slip past it.\n\n• The real fix: remove or restrict one of the three legs architecturally, for example by not letting the same assistant both read arbitrary untrusted text and send emails to arbitrary addresses with access to private data.\n\nSo the answer is: all three conditions together create the risk, and removing any one of them closes the path."
    },
    {
      "type": "scenario",
      "prompt": "Scenario 11\n\nA finance team must integrate with a bank's legacy SOAP (Simple Object Access Protocol) web service, described by a WSDL (Web Services Description Language) contract that supports both a Document/Literal and an RPC/Encoded encoding style. Which statement correctly evaluates the choice between the two?",
      "modelAnswer": "Document/Literal is like mailing a fully-filled-in, standard government form — anyone can check it against the official template to make sure every field is correct. RPC/Encoded is more like describing the same request in your own freeform shorthand, which might work between two people who already know each other's shorthand, but a stranger cannot easily verify it.\n\n• Document/Literal: the message body is a well-formed XML document that can be validated directly against an XML Schema, predictable, checkable, and the style the WS-I (Web Services Interoperability) Basic Profile recommends for interoperability.\n\n• RPC/Encoded: uses SOAP's own, older encoding rules to represent a procedure call directly, which is harder for different toolkits and vendors to agree on, exactly why it is discouraged for new integrations.\n\n• Why this matters for a legacy bank integration: cross-vendor interoperability is the whole point, so the schema-validated, standards-recommended style is the safer choice wherever there is a choice at all.\n\n• A common mistake is: RPC/Encoded does not validate directly against a schema the way Document/Literal does, the two styles are not identical at the wire level, and UDDI is a service-directory concept, not the thing standardising RPC/Encoded's rules.\n\nSo the answer is: Document/Literal should be preferred, because it is schema-validated and the more interoperable, WS-I recommended style."
    },
    {
      "type": "fillblank",
      "prompt": "Fill-in-the-blank questions\n\nA business operation that produces the same end state whether it runs once or many times is called ___.",
      "blanks": [
        [
          "idempotent",
          "idempotency"
        ]
      ],
      "modelAnswer": "Like pressing a pedestrian crossing button: pressing it five times doesn't make the lights change five times faster, since it has already registered, so extra presses do nothing new.\n\n• Why it matters: when a client can't tell whether its request was received, the operation needs to be safe to just resend.\n\nSo the answer is: idempotent."
    },
    {
      "type": "fillblank",
      "prompt": "Rather than rolling back an already-committed step, a Saga reverses its effect with a brand-new business transaction called a ___.",
      "blanks": [
        [
          "compensating transaction",
          "compensator"
        ]
      ],
      "modelAnswer": "Like crediting someone's account back after an accidental overcharge, rather than pretending the original charge never happened — the record of both the charge and the refund stays in history.\n\n• Why this is not a rollback: the original step already committed and became visible to the world, so the only way to reverse its effect is a new, opposite transaction.\n\nSo the answer is: a compensating transaction (compensator)."
    },
    {
      "type": "fillblank",
      "prompt": "A message that can never be delivered to any consumer at all (for example, its time-to-live expires first) is moved onto a ___ on the sending side.",
      "blanks": [
        [
          "dead-letter queue",
          "dead letter queue"
        ]
      ],
      "modelAnswer": "Like a parcel stamped return to sender, because it could never be handed to anyone.\n\n• Where it sits: on the sender's side, so it can be inspected later during a post-mortem.\n\nSo the answer is: dead-letter queue."
    },
    {
      "type": "fillblank",
      "prompt": "A message that IS delivered successfully, but whose processing keeps failing every time it's retried, is — after a retry limit — moved onto a ___.",
      "blanks": [
        [
          "poison queue",
          "poison message queue",
          "poison message"
        ]
      ],
      "modelAnswer": "Like a customer who did receive their parcel, but it explodes every time they try to open it — after enough failed attempts, it is pulled aside for someone to diagnose rather than mailed back again and again.\n\n• The contrast: dead-letter means never delivered; poison means delivered but never successfully processed.\n\nSo the answer is: poison message queue (poison queue)."
    },
    {
      "type": "fillblank",
      "prompt": "A REST API response that embeds links such as \"cancel\" only when that action is currently valid, so the client discovers what it can do next from the response itself, demonstrates the constraint called ___.",
      "blanks": [
        [
          "HATEOAS"
        ]
      ],
      "modelAnswer": "Like a vending machine that only lights up the buttons for drinks it actually still has in stock, instead of printing every button on the front panel whether or not it works.\n\n• Why it matters: the client does not need to hard-code business rules about when an action is allowed, it just follows whatever links the server currently offers.\n\nSo the answer is: HATEOAS (Hypermedia As The Engine Of Application State)."
    },
    {
      "type": "fillblank",
      "prompt": "A gateway that stops calling a failing downstream dependency after repeated failures, then periodically sends one test call to check for recovery before resuming normal traffic, is called a ___.",
      "blanks": [
        [
          "circuit breaker"
        ]
      ],
      "modelAnswer": "Like a real household circuit breaker: once it detects a fault, it trips and cuts power instead of letting the fault keep burning out every appliance on the line, and it can be reset once the fault clears.\n\n• Why it matters: it stops a struggling dependency from being hammered by retries, and stops the caller itself from piling up failed, slow calls.\n\nSo the answer is: circuit breaker."
    },
    {
      "type": "fillblank",
      "prompt": "The resource with the highest total service demand in a system — the one that saturates first and caps the system's maximum achievable throughput — is called the ___.",
      "blanks": [
        [
          "bottleneck",
          "bottleneck device"
        ]
      ],
      "modelAnswer": "Like the slowest checkout lane in a supermarket — no matter how many other fast lanes you open, the whole store's total customers-per-hour is capped by however fast that one slow lane can go once every lane is busy.\n\n• Why it matters: maximum throughput equals one divided by the bottleneck's demand, so improving any device other than the bottleneck does not raise the system's maximum throughput at all.\n\nSo the answer is: the bottleneck (bottleneck device)."
    },
    {
      "type": "fillblank",
      "prompt": "A workload modelled as a fixed number of terminals, each submitting a request, waiting for the response, then \"thinking\" before submitting the next one, is called a ___ system — as opposed to one with unbounded external arrivals.",
      "blanks": [
        [
          "closed"
        ]
      ],
      "modelAnswer": "Like a fixed group of ten people taking turns at one arcade machine — there will never be an eleventh player showing up mid-game, because the population is capped at the ten who are already there.\n\n• The contrast: an open system has requests arriving from an unbounded, uncontrolled outside population, like a public website.\n\nSo the answer is: a closed system."
    },
    {
      "type": "scenario",
      "prompt": "Quality attributes — write a short paragraph or numbered list naming the quality attribute for each requirement:\n\n(a) An airline's check-in system must keep accepting passengers even if its primary data centre goes offline during a storm, with no single outage exceeding 10 minutes.\n\n(b) A logistics platform must grow from tracking 5,000 to 500,000 parcels without the tracking algorithm being redesigned from scratch.\n\n(c) A vendor wants its booking engine to run unmodified on AWS today and on a different cloud provider next year, without rewriting code tied to one vendor's APIs.\n\n(d) Each microservice in a checkout pipeline must be verifiable by an automated suite using a fake payment gateway, without the real production payment infrastructure running.\n\n(e) Trade confirmations must be cryptographically signed so neither the trader nor the exchange can later deny having sent or received them.",
      "modelAnswer": "A requirement is like a clue about what kind of quality a system needs.\n\n• Match each requirement to the quality attribute it describes:\n\n• An airline's check-in system must keep accepting passengers even if its primary data centre goes offline during a storm, with no single outage exceeding 10 minutes. → Availability\n\n• A logistics platform must grow from tracking 5,000 to 500,000 parcels without the tracking algorithm being redesigned from scratch. → Scalability\n\n• A vendor wants its booking engine to run unmodified on AWS today and on a different cloud provider next year, without rewriting code tied to one vendor's APIs. → Portability\n\n• Each microservice in a checkout pipeline must be verifiable by an automated suite using a fake payment gateway, without the real production payment infrastructure running. → Testability\n\n• Trade confirmations must be cryptographically signed so neither the trader nor the exchange can later deny having sent or received them. → Security (non-repudiation)\n\nSo the answer is the four mappings shown above."
    }
  ]
};

export const COMP5348_PREDICTED_EXAM_PAPERS: ExamPaperSeed[] = [PAPER];
