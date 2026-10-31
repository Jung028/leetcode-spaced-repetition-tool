import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 9,
  paperNumber: 5,
  title: "Practice Exam 3",
  topics:
    "A practice-exam paper built directly from the unofficial AI-generated 'COMP4348/COMP5348 2026 S2 Practice Exam 3' and its answer key, converted to Phase-1 recognition-only format. Covers: optimistic vs pessimistic concurrency control, Two-Phase Commit (2PC) versus the Saga pattern for cross-service coordination, deadlock cycle-of-waiting requirements, M/M/1 queueing behaviour as utilisation approaches 1, Kubernetes control-loop self-healing, RPC retry idempotency ambiguity, multi-agent coordinator-vs-swarm failure modes, naming quality attributes (availability, scalability, security/encryption, testability) from a described requirement, fill-in-the-blank terms (HATEOAS, idempotent, circuit breaker, shared-database integration style), resource-oriented REST API redesign (cart vs order resources, idempotency of 'convert cart to order', 201 Created + Location header, idempotency-key fixes for duplicate charges), series/parallel/shared-dependency availability calculations with annual downtime and 'nines' tiers, cloud service model fit per component (IaaS/PaaS/Serverless) based on management-boundary and load-pattern criteria, and RPC-vs-message-queue communication-style trade-offs for synchronous payment authorization versus asynchronous multi-consumer shipping notifications. Phase-1 recognition-only: the source document's Part II written/scenario sub-questions have each been converted into a single-best-answer mcq or fillblank grounded in the official answer's own reasoning, with distractors built from plausible same-category misconceptions and near-miss calculations.",
  sourceFiles: [
    "COMP4348_COMP5348_2026_S2_Practice_Exam_03.pdf (Desktop, unofficial AI-generated practice exam used as source)",
    "COMP4348_COMP5348_2026_S2_Practice_Exam_03_Answers.pdf (Desktop, unofficial AI-generated answer key used as source)",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "MarketCo's checkout platform receives two warehouse-inventory update requests for the same product SKU at nearly the same time. The team is choosing between optimistic concurrency control (check a stored modification count before writing, and retry if it changed) and pessimistic concurrency control (acquire an exclusive lock before reading or writing). Which statement correctly describes how the two approaches differ?",
      options: [
        "Optimistic control lets both requests proceed without blocking and catches a conflict by checking the stored modification count at write time; pessimistic control instead blocks the second request until the first one releases its lock.",
        "Optimistic control stops the conflict up front by blocking the second request until the first one finishes, while pessimistic control only detects and repairs the damage after both requests have already written.",
        "Both approaches block one request until the other finishes; the only difference is whether the block happens before the read, for pessimistic control, or before the write, for optimistic control.",
        "Optimistic control can only be used for read-only requests, while pessimistic control is required any time a write to the same SKU is involved.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Picture two people editing the same shared spreadsheet cell. Optimistic control lets them both type without any lock, then checks right before saving whether the cell changed underneath them. Pessimistic control instead hands out a single key to the cell, and the second person has to wait for the key.\n\n• What optimistic control does: both inventory-update requests are allowed to read and work on the SKU at the same time, and only at write time does the system check a stored modification count — if it changed, the write is rejected and retried.\n\n• What pessimistic control does: it stops the conflict before it can happen at all, by making the second request wait for an exclusive lock before it can even read or write.\n\n• Why the other options are wrong: claiming optimistic blocks up front describes pessimistic control, not optimistic; claiming both approaches always block ignores that optimistic control never blocks at all; and optimistic control is just as usable for writes as it is for reads — the whole point is that it allows concurrent writes and only checks for conflicts afterward.\n\nSo the answer is: optimistic control allows both requests through and checks a modification count at write time, while pessimistic control blocks the second request until the first releases its lock.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo needs an order workflow that deducts loyalty points from one service and charges a credit card via a separate, independently-operated payment service. Which statement correctly contrasts coordinating this with Two-Phase Commit (2PC — a protocol for getting several systems to all commit or all abort together) versus the Saga pattern (a sequence of local transactions, each with its own compensating action to undo it if a later step fails)?",
      options: [
        "2PC lets each service commit its own part right away and only runs a compensating action afterward if a later step fails — the same way people often describe a Saga — while a Saga, by contrast, is actually the one that makes every participant vote together before any of them is allowed to commit.",
        "2PC requires every participant to vote in a Prepare phase before any of them commits, holding its resources until the final decision is known; a Saga instead lets each step commit immediately on its own, and relies on compensating transactions to undo already-completed steps if a later one fails.",
        "Both patterns require every participant to vote together before committing anything at all; the only real difference between them is that a Saga uses an XA-compliant Transaction Manager to run that shared vote, while plain 2PC is not required to use one.",
        "2PC and the Saga pattern are really just two different names for the exact same underlying coordination mechanism, differing only in which specific industry standard formally defines and certifies each one — XA for one of them, BPEL4WS for the other.",
      ],
      correctIndex: 1,
      modelAnswer:
        "2PC is like a wedding where every guest must RSVP yes before the caterer is allowed to cook anything. A Saga is like a road trip with no group RSVP — you just start driving and booking things one at a time, and if a later booking falls through, you cancel or refund something you already booked instead of pretending you never left home.\n\n• 2PC's shape: every participant votes in a Prepare phase, holding its locks or reserved resources the whole time, and nothing is actually committed until every vote comes back yes.\n\n• Saga's shape: each local transaction (deduct loyalty points, then charge the card) commits on its own, right away, with no group vote at all — if charging the card later fails, the loyalty-point deduction is undone with a brand-new compensating transaction instead of a vote-based rollback.\n\n• Why the other options are wrong: swapping which pattern votes first gets it backwards; claiming both patterns vote ignores that a Saga never holds a group vote at all; and the two patterns are genuinely different coordination mechanisms, not the same thing under two names.\n\nSo the answer is: 2PC makes every participant vote and hold resources before anyone commits, while a Saga commits each step immediately and compensates later if something downstream fails.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo's order service reports that Transaction A is currently waiting to acquire a lock on the 'inventory' table, which is held by Transaction B. A support engineer claims this fact, by itself, already proves a deadlock has occurred. Which statement correctly evaluates this claim?",
      options: [
        "The claim is correct: any transaction that is waiting for a lock held by another transaction is, by definition, already a deadlock.",
        "The claim is correct, but only once the wait has lasted longer than the database's configured lock timeout — at that point it officially becomes a deadlock.",
        "The claim is incorrect: a deadlock requires a cycle of waiting, such as Transaction B also waiting, directly or indirectly, on a lock that Transaction A holds — A merely waiting on B by itself is not yet a deadlock.",
        "The claim is incorrect, but only because a deadlock can exclusively occur between more than two transactions at once, so a two-transaction wait like this one could never become a deadlock.",
      ],
      correctIndex: 2,
      modelAnswer:
        "One person waiting for the bathroom isn't a traffic jam. A traffic jam is when car A is blocking car B's only way out, and car B is simultaneously blocking car A's only way out, so nobody can move until someone backs up.\n\n• What a deadlock actually requires: a circular wait, where A waits on something B holds, and directly or through a chain, B is also waiting on something A holds.\n\n• What's described here: only a one-way wait, A waiting on B. That is just ordinary lock contention, which usually resolves quickly once B finishes and releases the lock.\n\n• Why the other options are wrong: a timeout is how systems eventually detect and break a real deadlock, it does not create one on its own; and deadlocks absolutely can happen between exactly two transactions, so ruling that out entirely is wrong.\n\nSo the answer is: the engineer's claim is incorrect — a one-way wait is ordinary contention, not a deadlock, which needs a circular wait.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo models its single checkout-payment server as an M/M/1 queue (one server, random arrivals, random service times). As the arrival rate λ approaches the server's service rate μ, so utilisation ρ = λ/μ approaches 1, which statement correctly describes what happens to the mean response time, and why this matters for system design?",
      options: [
        "Mean response time stays roughly constant no matter what ρ is, because Little's Law is said to guarantee that the number of jobs in the system depends only on the arrival rate, not on how busy the server is.",
        "Mean response time actually decreases as ρ approaches 1, because a server that's busier is assumed to process each request more efficiently once it settles into a steady state.",
        "Mean response time is only undefined exactly at ρ = 0, and otherwise is claimed to behave in a smooth, linear, predictable way for every other value of ρ, right up to and including ρ = 1.",
        "Mean response time grows without bound as ρ approaches 1 — a hyperbolic blow-up — which is why a latency-sensitive system should never be designed to run near full utilisation on its critical path.",
      ],
      correctIndex: 3,
      modelAnswer:
        "Picture one single checkout lane at a supermarket getting busier and busier. While there's some slack, a new customer barely waits. But once customers are arriving almost as fast as the cashier can serve them, the queue behind the register doesn't just grow a little — it explodes, and the wait for someone joining the back of the line keeps climbing without any ceiling.\n\n• The formula: in an M/M/1 queue, mean time in the system is T = 1 / (μ − λ). As λ gets closer and closer to μ, the denominator shrinks toward zero, and T grows without bound — a hyperbolic blow-up, not a gentle increase.\n\n• Why this matters for design: it's exactly why a latency-sensitive path, like checkout payment, should never be planned to run near 100% utilisation — there needs to be real headroom below ρ = 1, or response times become unpredictable and can spike enormously from tiny increases in load.\n\n• Why the other options are wrong: Little's Law relates the number of jobs in the system to both arrival rate and time in system together, it doesn't make response time constant; a busier server does not process requests more efficiently, queueing only gets worse as ρ rises; and response time is defined at ρ = 0, it's the blow-up near ρ = 1 that's the real story, not a single undefined point.\n\nSo the answer is: mean response time grows without bound as ρ approaches 1, so the system should keep real headroom below full utilisation on any latency-sensitive path.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo runs its checkout service as a Kubernetes (a container-orchestration platform) Deployment with 3 desired replica pods. One worker node hosting one of those pods crashes. Which statement correctly describes how Kubernetes responds, based on its control-loop design?",
      options: [
        "The control plane continuously compares actual state (2 running pods) against desired state (3 replicas), and automatically schedules a replacement pod onto a healthy node, with no human involved.",
        "Kubernetes requires an operator to manually run a command telling it that only 2 replicas are currently running, before it will schedule any replacement pod.",
        "The checkout service simply keeps running with 2 pods indefinitely, since Kubernetes only corrects replica counts during a planned rolling update, not after an unplanned node failure.",
        "Kubernetes pauses all 3 pods platform-wide until the failed node is manually repaired or removed from the cluster, to avoid scheduling anything onto potentially unstable hardware.",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like a thermostat: it doesn't need a person to notice the room got cold, it just continuously checks whether the actual temperature matches the one it's set to, and turns the heating on by itself the moment they don't match.\n\n• What the control loop does: continuously observe actual state, compare it to desired state, and act automatically to correct any difference.\n\n• Applied here: actual pods (2) no longer match desired pods (3) after the node crash, so the control plane automatically schedules a replacement pod onto a healthy node — with zero human involvement.\n\n• Why the other options are wrong: no manual step is needed to tell Kubernetes the current count; the correction happens after unplanned failures too, not only during planned rolling updates; and the whole service does not pause while this correction runs — the two surviving pods keep serving traffic the whole time.\n\nSo the answer is: the control plane automatically schedules a replacement pod to restore the desired 3 replicas, with no human involved.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo's checkout service calls a remote procedure ApplyDiscount(orderId, code) over RPC (Remote Procedure Call — calling code on another machine as if it were a normal local function call). The network times out before a reply arrives, so the client cannot tell whether the original call was lost or only the reply was lost, and it retries the identical call. Which property does ApplyDiscount need to behave correctly under this retry?",
      options: [
        "ApplyDiscount needs to be stateless, so the server holds no record of the discount code between the original call and the retry.",
        "ApplyDiscount needs to be idempotent, so that applying the same discount code to the same order a second time has the same effect as applying it once.",
        "ApplyDiscount needs to run inside a distributed transaction coordinated by a Transaction Manager, so the retry is automatically detected and discarded by the 2PC protocol.",
        "ApplyDiscount needs to be synchronous, so the client blocks until it is certain the first call's effects were fully applied before it retries.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Imagine you text a friend 'pick up milk' and get no reply — you don't know if the text never arrived, or they got it and their reply to you got lost. If you text 'pick up milk' again, you want that to mean one trip to the shop, not two.\n\n• Why the ambiguity exists: a timeout could mean the request never arrived, or it arrived, ran, and only the reply was lost — the caller genuinely cannot tell which happened.\n\n• Why retry alone is risky: if ApplyDiscount is not idempotent, the server might apply the discount twice, so the order ends up discounted twice over.\n\n• The fix: make ApplyDiscount idempotent, for example by checking whether that order already has that discount code applied before applying it again, so a repeat call is harmless.\n\n• Why the other options are wrong: being stateless is about not keeping session data between unrelated calls, not about being safe to repeat the same one; a commit protocol coordinates separate systems committing together, it doesn't deduplicate a single retried call on its own; and blocking synchronously just delays discovering the ambiguity rather than resolving it.\n\nSo the answer is: ApplyDiscount needs to be idempotent.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo is building a customer-support AI system and is deciding between a single coordinator agent that delegates subtasks to several specialist agents (a 'coordinator' topology) and a design where many agents can call each other freely (a 'swarm' topology). Which statement correctly describes the characteristic failure mode most associated with each topology?",
      options: [
        "The coordinator topology's characteristic failure is uncontrolled cost growth from agents calling each other in loops, while the swarm topology's characteristic failure is that one lead agent becomes a bottleneck.",
        "Both topologies share the exact same characteristic failure — compounding errors across sequential steps — since every multi-agent system is ultimately sequential under the hood regardless of how it's wired.",
        "The coordinator topology's characteristic failure is that the lead agent becomes a bottleneck, while the swarm topology's characteristic failure is loops, cost blow-ups, and no clear owner of a task.",
        "The swarm topology has no characteristic failure mode at all, because its agents operate fully independently, while the coordinator topology only fails when the underlying language model itself returns an error.",
      ],
      correctIndex: 2,
      modelAnswer:
        "A coordinator topology is like one manager personally routing every request to the right specialist — brilliant until that one manager becomes the thing everyone's waiting on. A swarm is like a room full of people who can all call each other directly — nobody's individually overloaded, but a message can bounce between three different people in a loop with nobody quite sure whose job it actually was.\n\n• Coordinator's characteristic failure: the single lead agent has to see and route every subtask, so it becomes a bottleneck as the system grows.\n\n• Swarm's characteristic failure: with agents free to call each other, nothing stops loops, runaway cost from repeated back-and-forth calls, and ambiguity over which agent actually owns a given task.\n\n• Why the other options are wrong: swapping the two failure modes mismatches which topology causes which problem; claiming they share one failure mode ignores that their actual architectures create genuinely different risks; and claiming the swarm has no failure mode at all ignores exactly the loop/cost/ownership risk that's its defining weakness.\n\nSo the answer is: the coordinator topology risks the lead agent becoming a bottleneck, while the swarm topology risks loops, cost blow-ups, and no clear task owner.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo wants its checkout flow to keep working correctly even if one of its three payment-gateway integrations goes offline, falling back automatically to another gateway without the customer noticing. Which quality attribute does this requirement mainly address?",
      options: ["Scalability", "Portability", "Testability", "Availability"],
      correctIndex: 3,
      modelAnswer:
        "It's like a 24-hour convenience store with a backup generator for when the power grid fails — the point is that the doors stay open despite something going wrong.\n\n• What the requirement actually asks for: the checkout flow keeps working correctly even when one dependency fails, by automatically falling back to another one — a classic availability requirement.\n\n• Why it's not the others: scalability is about handling more load, portability is about running unmodified on a different platform, and testability is about verifying a component in isolation — none of those is about surviving a dependency going offline.\n\n• The defining test: does the requirement describe staying operational despite a failure? That's availability's signature shape.\n\nSo the answer is: availability.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo's product-search index currently handles 2 million listings; the catalogue is expected to grow to 50 million listings within two years, and the search algorithm must continue to work without being redesigned from scratch as that growth happens. Which quality attribute does this requirement mainly address?",
      options: ["Scalability", "Availability", "Portability", "Testability"],
      correctIndex: 0,
      modelAnswer:
        "It's like a car park that can add more levels as more cars show up, instead of being torn down and rebuilt bigger every time demand grows.\n\n• What the requirement actually asks for: the search algorithm keeps working as the catalogue grows 25x in size, without being redesigned from scratch.\n\n• Why it's not the others: availability is about staying up during failures, portability is about moving to a different platform, and testability is about verifying a component in isolation — none of those addresses growing data volume.\n\n• The defining test: does the system keep working as the size of the job grows, without needing a ground-up redesign? That's scalability.\n\nSo the answer is: scalability.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo's compliance team requires that all customer payment details be unreadable to anyone intercepting network traffic between the checkout page and the payment gateway. Which quality attribute does this requirement mainly address?",
      options: ["Availability", "Security", "Scalability", "Testability"],
      correctIndex: 1,
      modelAnswer:
        "It's like sealing a letter in an envelope before it travels through the postal system, so that anyone who intercepts it along the way can't read what's inside.\n\n• What the requirement actually asks for: payment details must be unreadable to anyone intercepting network traffic — that's encryption in transit, one of the security properties the course names.\n\n• Why it's not the others: availability is about staying reachable, scalability is about handling more load, and testability is about verifying components in isolation — none of those is about keeping data unreadable to an eavesdropper.\n\n• The defining test: is the requirement about data being hidden from someone who shouldn't see it? That's security, specifically confidentiality/encryption, distinct from integrity (not altered) or non-repudiation (proof of participation).\n\nSo the answer is: security (encryption of data in transit).",
    },
    {
      type: "mcq",
      prompt:
        "Each microservice in MarketCo's checkout pipeline must be deployable to a new engineer's laptop and tested against a fake payment gateway, without needing the real production payment infrastructure running. Which quality attribute does this requirement mainly address?",
      options: ["Availability", "Scalability", "Testability", "Portability"],
      correctIndex: 2,
      modelAnswer:
        "It's like a flight simulator that lets a pilot practise an engine failure without ever risking a real plane — the point is being able to check correctness without needing the real, live dependencies running.\n\n• What the requirement actually asks for: each microservice can be deployed to a new laptop and verified against a fake payment gateway, without the real production payment infrastructure running.\n\n• Why it's not the others: availability is about staying up, scalability is about handling more load, and portability is about running unmodified on a different platform — none of those is about verifying a component in isolation from its real dependencies.\n\n• The defining test: can the component's correctness be checked without its real-world dependencies running? That's testability.\n\nSo the answer is: testability.",
    },
    {
      type: "fillblank",
      prompt:
        "MarketCo's order-confirmation API returns, in its JSON response, a hypermedia link to 'cancel-order' only when the order is still within the cancellation window. This REST constraint, where the response itself tells the client what it can do next, is called ___.",
      blanks: [["HATEOAS"]],
      modelAnswer:
        "Like a vending machine that only lights up the buttons for drinks it actually still has in stock, instead of printing every button on the front panel whether or not it works.\n\n• Why it matters: the client doesn't need to hard-code business rules about when an action is allowed — it just follows whatever links the server currently offers.\n\nSo the answer is: HATEOAS (Hypermedia As The Engine Of Application State).",
    },
    {
      type: "fillblank",
      prompt:
        "A call to MarketCo's PATCH /orders/{id}/status endpoint is considered ___ because sending the exact same request multiple times leaves the order in the same final state as sending it once.",
      blanks: [["idempotent"]],
      modelAnswer:
        "Like pressing a pedestrian crossing button: pressing it five times doesn't make the lights change five times faster, since the request has already registered, so extra presses do nothing new.\n\n• Why it matters: when a client can't tell whether its request was received, the operation needs to be safe to just resend.\n\nSo the answer is: idempotent.",
    },
    {
      type: "fillblank",
      prompt:
        "MarketCo's checkout-payment service stops calling a failing fraud-check dependency after five consecutive failures, waits briefly, then sends one test call to see if the dependency has recovered before resuming normal traffic. This protective pattern is called a ___.",
      blanks: [["circuit breaker"]],
      modelAnswer:
        "Like a real household circuit breaker: once it detects a fault, it trips and cuts power instead of letting the fault keep burning out every appliance on the line, and it can be reset once the fault clears.\n\n• Why it matters: it stops a struggling dependency from being hammered by retries, and stops the caller itself from piling up failed, slow calls.\n\nSo the answer is: circuit breaker.",
    },
    {
      type: "fillblank",
      prompt:
        "When MarketCo's order and inventory databases were originally built so that every application reads and writes directly to one shared schema, later schema changes became risky for every connected application. This kind of tight coupling is an example of the ___ integration style.",
      blanks: [["shared database", "shared database integration"]],
      modelAnswer:
        "Like several roommates all keeping their stuff in one shared, unlabelled drawer — convenient at first, but the moment one of them reorganises it, everyone else's stuff ends up in the wrong place.\n\n• Why it's risky: multiple applications reading and writing directly to one database means the schema itself becomes a shared contract, and any change to it risks breaking every connected application.\n\n• The contrast: this is one of the course's four classic application integration styles, alongside RPC, Messaging, and File Transfer.\n\nSo the answer is: Shared Database.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo is redesigning its checkout API. A 'cart' holds the items a customer has added before paying; once payment succeeds, the cart becomes an immutable 'order'. The current design has only two endpoints: POST /checkout/process (which both creates the order AND charges the card in one call) and GET /cart/{id}/items. Which redesign correctly identifies the missing/conflated resources and proposes a cleaner resource-oriented set of endpoints for (i) adding an item to a cart, (ii) retrieving the current cart, and (iii) converting a cart into an order and triggering payment?",
      options: [
        "Nothing is actually missing from the current design — /checkout/process already represents both the cart and order resources together in one combined endpoint, and the existing GET /cart/{id}/items endpoint is enough on its own to both add new items and retrieve the current item list for any cart.",
        "Treat only 'Order' as a resource and drop 'Cart' as a separate concept entirely: (i) add an item with POST /orders/{orderId}/items, treating an in-progress order as if it were already the cart, (ii) retrieve it with GET /orders/{orderId}, (iii) convert it and charge the card with PATCH /orders/{orderId}/pay, updating that one same order resource's status field in place each time.",
        "Keep /checkout/process exactly as it is today for both creating the order and charging the card, but add a brand-new DELETE /checkout/process endpoint alongside it, so that a customer can cancel a checkout that's already partway in progress before it finishes.",
        "The design conflates two distinct resources — 'order creation' and 'payment processing' — into one verb-named endpoint, and never exposes 'cart' as an addressable resource of its own. A cleaner design treats Cart (/carts/{cartId}) and Order (/orders/{orderId}) as separate resources: (i) POST /carts/{cartId}/items to add an item, (ii) GET /carts/{cartId} to retrieve the current cart, (iii) POST /carts/{cartId}/orders to convert the cart into a new order and trigger payment.",
      ],
      correctIndex: 3,
      modelAnswer:
        "A cart and an order are really two different things in a shop — the cart is what you're still deciding on, the order is the receipt once you've paid — but the current design squashes both ideas, plus the act of charging the card, into one single action-named endpoint.\n\n• What's missing: 'cart' never gets its own address at all, and 'create the order' and 'charge the card' are bundled into one verb-named call instead of being a resource you create.\n\n• The cleaner shape: Cart (/carts/{cartId}) and Order (/orders/{orderId}) become their own resources — add an item with POST /carts/{cartId}/items, read the current cart with GET /carts/{cartId}, and convert the cart into a new order (which also triggers payment as a side effect of creating it) with POST /carts/{cartId}/orders.\n\n• Why the other options are wrong: claiming nothing is missing ignores that cart was never addressable at all; dropping cart entirely loses the distinction between 'still deciding' and 'paid and final'; and bolting a DELETE onto the same verb-named endpoint doesn't fix the underlying conflation, it just adds another one.\n\nSo the answer is: expose Cart and Order as separate resources, with POST /carts/{cartId}/items, GET /carts/{cartId}, and POST /carts/{cartId}/orders.",
    },
    {
      type: "mcq",
      prompt:
        "For the 'convert cart into an order and charge payment' operation in MarketCo's redesigned checkout API, which statement correctly states whether the HTTP verb used for that action should be idempotent, and justifies it by the real-world effect of calling it twice?",
      options: [
        "It is correctly modelled as a non-idempotent POST, because it creates a brand-new resource (the order) and triggers a real side effect (charging the card); calling it twice as a plain, unprotected POST would create two separate orders and charge the customer twice.",
        "It should be modelled as an idempotent PUT, because PUT always represents the server applying a client-supplied exact value, and charging a card for an exact fare amount fits that definition directly.",
        "It doesn't matter whether the verb is idempotent or not, because the card network itself is assumed to automatically detect and reject a duplicate charge for the same cart within a short time window.",
        "It should be modelled as an idempotent DELETE, because converting a cart into an order effectively removes the cart from its 'open' state, and DELETE is inherently idempotent by definition.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Hitting 'place order' is like physically handing cash to a cashier — do it twice, and you've genuinely paid twice, not once extra-firmly.\n\n• Why it's POST, and non-idempotent: this action creates a brand-new Order resource and triggers a real-world side effect (charging the card), which is exactly what POST is defined to do — and exactly why repeating it isn't automatically safe.\n\n• The real risk: as a plain, unprotected POST, calling it twice (say, because of a flaky mobile network) creates two separate orders and charges the customer's card twice.\n\n• Why the other options are wrong: PUT is for setting an existing resource to an exact given state, not for creating a brand-new order each time; nothing about the card network reliably detects or blocks this kind of application-level duplicate; and DELETE doesn't fit an action that creates a new resource and charges money.\n\nSo the answer is: it's correctly modelled as a non-idempotent POST, and calling it twice as a plain POST creates two orders and two charges.",
    },
    {
      type: "mcq",
      prompt:
        "For MarketCo's redesigned 'convert cart into order' endpoint, which statement correctly describes the HTTP status code and header the server should return on successful order creation, and what information that header should carry?",
      options: [
        "200 OK, together with an ETag header carrying a version fingerprint of the newly-created order, so the client can later send that fingerprint back to check whether the order has changed since.",
        "201 Created, together with a Location header, where the Location header carries the URI of the newly-created Order resource (for example, /orders/{orderId}), so the client can retrieve or reference that specific order afterward.",
        "202 Accepted, together with a Retry-After header telling the client how many seconds to wait before it should poll again to check on the order's eventual final status.",
        "200 OK, with no additional header included at all, since the order's full representation is expected to already appear directly inside the body of that same response.",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's like a shop handing you a receipt with your new order number printed on it the moment they ring it up — you walk away already knowing exactly where to look up that order later.\n\n• The status code: 201 Created signals that a brand-new resource — the order — now exists as a result of this call.\n\n• The header: Location carries the URI of that new Order resource, for example /orders/{orderId}, so the client can retrieve, poll, or reference that specific order without having to guess or construct its address itself.\n\n• Why the other options are wrong: an ETag communicates a version fingerprint for caching/conditional requests, not the location of a brand-new resource; 202 Accepted with Retry-After fits an operation that's still processing asynchronously, not one that's already succeeded; and leaving out the Location header forces the client to somehow already know the new order's address.\n\nSo the answer is: 201 Created with a Location header carrying the new order's URI.",
    },
    {
      type: "mcq",
      prompt:
        "A MarketCo customer's app calls 'convert cart to order' twice because of a flaky mobile network, with no idempotency key included in either request. Which statement correctly explains what goes wrong, and proposes a concrete fix?",
      options: [
        "Nothing goes wrong at all: because the cart's contents haven't changed in the short gap between the two calls, the server is expected to automatically recognise the second call as simply referring to the same still-open cart it already knows about, and silently ignores it without creating anything new or charging anything twice.",
        "The second call fails outright with a 409 Conflict response, because the server is assumed to be able to detect, purely from the cart's identifier alone and without any additional idempotency information anywhere in either request, that this exact cart was already successfully converted once before, and so it automatically refuses to process that same cart a second time under any circumstances at all.",
        "Because the convert-to-order call is non-idempotent and nothing in the request identifies the second call as 'the same attempt' as the first, the server has no way to distinguish a genuine second purchase from a retry — it creates a second Order resource and charges the card a second time. The fix: the client sends a unique idempotency key with the request; the server stores the outcome of each key's first successful processing, and returns the original order's result for any repeat of that same key instead of creating a new one.",
        "The second call does succeed and does create a genuine second order with its own separate charge, but the proposed fix here is simply to lower the client app's network retry timeout setting, since doing only that is claimed to prevent the underlying flaky mobile network from ever being able to trigger a retry being sent out again in the first place.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Without anything on the receipt to say 'this is the same order I already tried to place,' the cashier has no way to tell your second attempt apart from a genuine second purchase — so they ring it up again.\n\n• What actually happens: the convert-to-order call is a plain, non-idempotent POST, and neither request carries anything identifying it as a retry of the first — so the server creates a second Order and charges the card a second time.\n\n• The concrete fix: the client generates and sends a unique idempotency key with the request (for example, in an Idempotency-Key header); the server stores the outcome of each key's first successful processing, and if a request arrives with a key it has already completed, it returns the previously-created order's result instead of creating a new one or charging again.\n\n• Why the other options are wrong: the server has no built-in way to recognise 'same cart, same attempt' without an explicit key, so it won't silently ignore or auto-reject the repeat; and lowering a client-side timeout doesn't remove the underlying ambiguity, since real network failures and retries can still happen regardless of the timeout setting.\n\nSo the answer is: without an idempotency key, the retry creates a duplicate order and a duplicate charge — the fix is a client-supplied idempotency key that the server checks before processing.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo runs two identical Checkout API replicas behind a load balancer for redundancy — if either replica is up, checkout works. Each replica has an availability of 99.5%. What is the availability of the two replicas considered alone, as a parallel (redundant) pair?",
      options: [
        "99.5%, because adding a second identical replica in parallel never changes the combined availability beyond what one replica alone already provides.",
        "99.0%, found by simply multiplying the two replicas' availabilities together as though they were in series rather than in parallel.",
        "99.75%, found by averaging the two replicas' individual availability figures.",
        "99.9975%, found using the parallel/redundant formula A = 1 − (1 − A)², giving 1 − (0.005)² = 1 − 0.000025 = 0.999975.",
      ],
      correctIndex: 3,
      modelAnswer:
        "Two identical spare keys hidden outside the house, with either one able to get you in — you're only locked out if you lose both of them at the same time, which is far less likely than losing just one.\n\n• The right formula: for components in parallel, where only one needs to be up, availability equals 1 minus the product of each component's unavailability — here, 1 − (1 − 0.995)².\n\n• The number: 1 − (0.005)² = 1 − 0.000025 = 0.999975, or 99.9975%.\n\n• Why the other options are wrong: treating the pair as providing no improvement ignores what redundancy actually buys you; multiplying the two availabilities together is the series formula, the wrong one for a parallel pair; and simply averaging the two figures isn't how combined availability is calculated at all.\n\nSo the answer is: 99.9975%.",
    },
    {
      type: "mcq",
      prompt:
        "Both Checkout API replicas from the previous question call out to a single shared Fraud-Check microservice instance, with no redundancy there yet, with an availability of 99.8%; a checkout cannot complete without a successful fraud check. Which statement correctly explains why Fraud-Check can't simply be ignored in the overall availability calculation, and computes the TRUE overall availability of the checkout path?",
      options: [
        "Fraud-Check is a single shared dependency that every checkout request must pass through regardless of which Checkout API replica handles it, so it's effectively in series with the parallel Checkout API pair, even though it sits 'behind' the redundant layer; the true overall availability multiplies the two: 0.999975 × 0.998 ≈ 99.80%.",
        "Fraud-Check can safely be ignored in this calculation, because it sits visually 'behind' the already-redundant Checkout API pair in the architecture diagram, and the rule is that only components drawn in front of a redundant layer are ever allowed to affect the final combined availability figure.",
        "Fraud-Check should instead be treated as being in parallel with the Checkout API pair, since both ultimately belong to the same overall checkout path end to end, which gives a true overall availability of 1 − (1 − 0.999975) × (1 − 0.998) ≈ 99.9999%, an even higher number than either piece alone.",
        "Fraud-Check's own 99.8% availability figure should simply replace the Checkout API pair's separately-calculated figure entirely, since whichever single component in a whole system has the lowest availability by itself is always treated as determining the entire system's combined availability number outright.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine two parallel roads into town, both in great shape, but they both funnel through the exact same single bridge before you can actually arrive — however good the two roads are, you're still stuck if that one bridge is out.\n\n• Why Fraud-Check can't be ignored: every checkout request, no matter which Checkout API replica handles it, still has to pass through this one Fraud-Check instance — so it's effectively in series with the parallel Checkout API block, even though it visually sits 'behind' the redundant layer in a diagram. This is the course's shared-dependency gotcha: redundancy only helps if replicas can fail independently, and a common dependency can erase the benefit of redundancy built elsewhere.\n\n• The calculation: true overall availability multiplies the parallel block's availability by Fraud-Check's own availability: 0.999975 × 0.998 = 0.99797505, about 99.80%.\n\n• Why the other options are wrong: a shared dependency behind a redundant layer still gates every request through it, so it can't be dropped from the calculation; it isn't in parallel with the Checkout API pair, since both replicas depend on it rather than being an alternative to it; and Fraud-Check's figure doesn't simply replace the other block's figure, the two get multiplied together.\n\nSo the answer is: about 99.80%, found by multiplying the parallel Checkout API pair's availability (99.9975%) by Fraud-Check's own availability (99.8%).",
    },
    {
      type: "mcq",
      prompt:
        "Convert the checkout path's true overall availability of about 99.80% (from the previous question) into an approximate annual downtime figure in hours, and state which 'nines' availability tier it is closest to.",
      options: [
        "About 1.8 hours of downtime per year, which would sit comfortably inside the four-nines (99.99%) availability tier.",
        "About 17.7 hours per year of downtime — closer to, but still short of, the three-nines (99.9%) tier, roughly double the downtime that tier would allow.",
        "About 87.6 hours of downtime per year, placing it right at the two-nines (99%) tier exactly, no better and no worse.",
        "About 876 hours of downtime per year, a figure that sits well below even the weakest, two-nines (99%) availability tier.",
      ],
      correctIndex: 1,
      modelAnswer:
        "A year has 8,760 hours in it (24 hours times 365 days), so the difference between 'always up' and the actual availability percentage tells you how many of those hours were actually downtime.\n\n• The calculation: downtime = (1 − 0.99797505) × 8,760 ≈ 0.00202495 × 8,760 ≈ 17.7 hours per year.\n\n• Comparing to the nines table: 99% ('two nines') is about 87.6 hours per year of downtime; 99.9% ('three nines') is about 8.76 hours per year. At roughly 17.7 hours, this system sits between two nines and three nines — noticeably better than 99%, but it falls short of three nines, at roughly double the downtime that tier would allow.\n\n• Why the other options are wrong: 1.8 hours would require a much higher availability than 99.80%, well into four-nines territory; 87.6 hours is the two-nines figure, not this system's actual, better number; and 876 hours is off by an order of magnitude from the real calculation.\n\nSo the answer is: about 17.7 hours per year, closest to but still short of three nines (99.9%).",
    },
    {
      type: "mcq",
      prompt:
        "Given the checkout path above (Checkout API pair at 99.9975%, Fraud-Check alone at 99.8%, true overall availability about 99.80%), which statement correctly recommends an architectural change to most effectively raise the TRUE overall availability, and explains why simply adding a third Checkout API replica would NOT achieve the same benefit?",
      options: [
        "Add a third Checkout API replica to the existing pair, because adding any redundant replica anywhere at all in a system is assumed to always raise its overall combined availability by some meaningful, clearly noticeable amount, regardless of which component it's added to.",
        "Replace the whole existing Checkout API pair with one single, far more powerful replica individually rated at 99.9999% availability, since one highly reliable component is assumed to always be a better investment than keeping several merely-ordinary redundant ones around.",
        "Add redundancy to the Fraud-Check service itself, deploying a second, independent instance in parallel; this is the real bottleneck, since the Checkout API pair is already at 99.9975% — far above Fraud-Check's 99.8% — so pushing an already-near-100% component even closer to 100% has almost no effect on a result that's dominated by the much lower 99.8% term.",
        "Add a fourth Checkout API replica on top of the existing two, since a larger pool of redundant replicas at that same layer is assumed to always keep improving the combined figure, roughly in direct proportion to however many additional replicas end up being added there.",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like reinforcing two already-very-strong chain links while leaving the one weak, rusted link in the same chain untouched — no matter how much stronger you make the strong links, the chain still snaps at the rusty one.\n\n• The real fix: add redundancy to the Fraud-Check service itself — a second, independent instance in parallel, with either one sufficing — while also checking the two instances don't share some further single dependency (like one database) that would just relocate the same problem one layer down.\n\n• Why this is the effective fix: Fraud-Check is the true bottleneck, the dominant single point of failure in series with everything else, so only improving its own availability can meaningfully raise the overall ceiling.\n\n• Why adding a third Checkout API replica would NOT help: the Checkout API pair is already at 99.9975%, far above Fraud-Check's 99.8% — pushing an already-near-100% component even closer to 100% has almost no effect on a result that's overwhelmingly dominated by the much lower 99.8% term, since overall availability is capped by whichever component in the chain is weakest, not by how much redundancy gets piled onto a component that's no longer the bottleneck.\n\nSo the answer is: add a second, independent Fraud-Check instance in parallel — that's the real bottleneck, while a third Checkout API replica would barely move the number.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo's checkout system includes a legacy inventory-reservation engine with unusual OS-level dependencies that the team doesn't want to touch yet. Which statement correctly recommends IaaS, PaaS, or Serverless for this component, justified using the course's management-boundary facts about who manages the OS, runtime, and capacity in each model?",
      options: [
        "PaaS, because PaaS gives the team a full build-test-deploy-manage lifecycle without having to handle OS or runtime management themselves at all, which is claimed to be ideal even for a component that has special, unusual OS-level needs like this one.",
        "Serverless, because serverless functions are assumed to abstract away the underlying OS entirely, which is claimed to remove any risk at all coming from the engine's own unusual OS-level dependencies, no matter what those dependencies actually are.",
        "PaaS or Serverless, used interchangeably, since both of those models manage the OS and runtime fully on the customer's behalf, and either one is assumed to be equally capable of still preserving the legacy engine's unusual OS-level dependencies intact.",
        "IaaS, because under IaaS the provider manages virtualisation and below while the customer still manages the OS, runtime, and app code — exactly the OS-level control the legacy engine's unusual dependencies need, which PaaS and Serverless both take away from the customer.",
      ],
      correctIndex: 3,
      modelAnswer:
        "IaaS is like renting an empty apartment — you bring and manage all your own furniture, but you can set it up exactly how you need, down to rewiring a lamp socket if you really have to.\n\n• The management boundary: under IaaS, the provider manages virtualisation and everything below it (servers, storage, network, data centre), but the customer still manages the OS, runtime/middleware, capacity and scaling, and application code and data.\n\n• Why that fits here: the legacy engine's unusual OS-level dependencies mean the team needs exactly that OS-level control, which IaaS preserves.\n\n• Why the other options are wrong: PaaS and Serverless both take OS (and, for Serverless, capacity/scaling) management away from the customer entirely — a good simplification for ordinary application code, but incompatible with a legacy system whose special requirements live precisely in the layer those models take out of the customer's hands.\n\nSo the answer is: IaaS, because it's the only model that leaves OS-level control with the customer.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo's main checkout web application is a stateless REST API deployed continuously, dozens of times per week. Which statement correctly recommends IaaS, PaaS, or Serverless for this component, justified by what the team gains or gives up compared to the other two options, given how often they deploy?",
      options: [
        "PaaS, because the team deploys dozens of times a week and wants a managed build-test-deploy-manage lifecycle without taking on OS/runtime management themselves — giving up low-level OS control they don't need, in exchange for a managed environment that fits frequent, continuous deployment better than either IaaS or a collection of short-lived Serverless functions.",
        "IaaS, because having full, direct OS-level control is assumed to always be more valuable to a team than a managed deployment pipeline would be, completely regardless of how frequently that same team actually deploys their application in practice.",
        "Serverless, because it is treated here as simply the most modern and most abstracted available option, and a REST API that happens to be deployed continuously many times a week is assumed to always be a naturally good fit for being split apart into a collection of short-lived functions.",
        "IaaS or Serverless, used interchangeably, since a continuously-running stateless REST API like this one is assumed to perform essentially identically no matter which of those two particular models it actually ends up being deployed under.",
      ],
      correctIndex: 0,
      modelAnswer:
        "PaaS is like renting a fully-equipped commercial kitchen instead of either building your own kitchen from scratch (IaaS) or only cooking one dish at a time to order (Serverless) — you get a ready-to-use environment built for running a real, ongoing operation.\n\n• What the team gains: a managed OS, runtime, and middleware, sharing capacity/scaling responsibility with the provider — exactly what a team deploying dozens of times a week wants, without taking on OS-level management themselves.\n\n• What they give up compared to IaaS: low-level OS control, but that's control the team doesn't need for an ordinary stateless REST API.\n\n• Why PaaS beats Serverless here: PaaS fits a continuously-running service better than forcing the application into a collection of independent, short-lived functions, and it avoids Serverless's per-invocation constraints (cold starts, time limits) that matter less when the app is meant to run steadily.\n\nSo the answer is: PaaS, because it fits frequent continuous deployment of a steadily-running service without taking on OS-level management.",
    },
    {
      type: "mcq",
      prompt:
        "MarketCo's 'send order confirmation email' function runs briefly, only when an order completes, with highly spiky and unpredictable volume — near zero most of the day, bursting during flash sales. Which statement correctly recommends IaaS, PaaS, or Serverless for this component, using the course's 'good fit' criteria for that model?",
      options: [
        "PaaS, because PaaS is treated here as always being the safest default architectural choice to reach for, entirely regardless of how spiky, bursty, or unpredictable any particular workload's actual volume pattern happens to be over time.",
        "Serverless, because the course names spiky/unpredictable load and event-driven 'glue code' as good fits for serverless — this function is event-driven, near-zero most of the day, and bursts unpredictably, letting it scale to zero when idle and pay only per invocation.",
        "IaaS, because reserving a block of fixed capacity well in advance is assumed to fully guarantee the function will never once experience a cold start, which is claimed to matter most precisely for a function that otherwise runs this infrequently.",
        "PaaS or IaaS, used interchangeably here, since both of those two models provision their capacity ahead of time, which is assumed to always be the single most reliable general way of handling genuinely unpredictable bursts in load.",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's like ordering food only when you're actually hungry, instead of keeping a full-time chef on staff around the clock whether or not anyone's eating — you pay only for what you actually use, and nobody keeps the 'kitchen' running for you in between.\n\n• The fit: the course explicitly names spiky/unpredictable load and event processing/'glue code' as good fits for serverless, and this function matches that precisely — it's event-driven, triggered only when an order completes, with near-zero load most of the day and unpredictable bursts during flash sales.\n\n• Why it wins here: serverless lets this function scale to zero when idle and pay only per invocation, rather than paying for provisioned capacity (IaaS/PaaS) that would sit mostly idle.\n\n• Why the other options are wrong: PaaS isn't automatically the safest choice for every workload shape, it's a worse fit for something this spiky; reserving fixed capacity under IaaS actually wastes money sitting idle most of the day, and cold starts aren't the deciding factor here; and provisioning capacity ahead of time is the opposite of what an unpredictable, bursty workload needs.\n\nSo the answer is: Serverless, because spiky, event-driven, near-zero-most-of-the-day load is exactly the pattern the course names as serverless's good fit.",
    },
    {
      type: "mcq",
      prompt:
        "A manager asks MarketCo's team: 'Why not just put all three parts — the legacy engine, the checkout web app, and the email function — on Serverless, since it's the newest and most abstracted option?' Which statement gives two course-grounded reasons this would be a bad idea for at least one of the three parts?",
      options: [
        "There's really no good reason not to do this at all — Serverless is assumed to be strictly more capable than both IaaS and PaaS in absolutely every respect, so moving all three of these parts onto it together can therefore only ever end up being a genuine improvement for the team.",
        "One claimed reason: Serverless functions are assumed to always cost strictly more per individual request than an equivalent always-on IaaS server would, for literally any workload shape whatsoever, including ones that sit idle most of the day. A second claimed reason: Serverless is assumed to not support any of the programming languages the checkout API happens to currently be written in, forcing a full rewrite before any migration could even begin.",
        "Reason one: the legacy engine's unusual OS-level dependencies make it a poor fit for Serverless, which removes OS/runtime control from the customer entirely — exactly the control that component needs and cannot give up. Reason two: the course explicitly flags steady high load and long-running/stateful work as a poor fit for Serverless, noting real limitations like cold starts, per-invocation time limits, and difficulty maintaining consistency across many function calls — which would make the continuously-running checkout web application a worse fit for Serverless than for PaaS.",
        "One claimed reason: Serverless is assumed to require every single component moved onto it to first be entirely rewritten in a purely functional programming language. A second claimed reason: Serverless is assumed to be fundamentally unusable by any application that handles customer payment data, under absolutely any circumstances whatsoever.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Serverless is a fantastic tool for the right job, the same way a food truck is fantastic for selling food only when hungry customers show up — but you wouldn't try to run a full-time, always-open restaurant kitchen out of a food truck, and you definitely couldn't use one to safely store and age wine in a custom climate-controlled cellar.\n\n• Reason one, the legacy engine: its unusual OS-level dependencies need direct OS-level control, which Serverless removes from the customer entirely, making it a poor fit regardless of how modern the option is.\n\n• Reason two, the checkout web app: the course explicitly flags steady high load and long-running/stateful work as a poor fit for Serverless — cold starts, per-invocation time limits (for example, 15 minutes on standard AWS Lambda), and difficulty maintaining composability/consistency/atomicity across many function calls all make a continuously-running, always-on service a worse fit for Serverless than for PaaS.\n\n• Why the other options are wrong: Serverless isn't strictly better in every respect, its whole value proposition depends on matching the right load pattern; claiming it's always more expensive or incompatible with every language the checkout API uses isn't an accurate cost or language comparison; and claiming it requires rewriting everything in a functional language or can never touch payment data isn't true either.\n\nSo the answer is: the legacy engine needs OS-level control Serverless doesn't allow, and the checkout app's steady, long-running load is a poor match for Serverless's per-invocation limits — both course-grounded reasons against putting every part on Serverless.",
    },
    {
      type: "mcq",
      prompt:
        "Scenario A: when a MarketCo customer clicks 'Pay Now,' the checkout page calls the Payment Gateway to authorise the card and needs an approved/declined answer before it can show the customer a result. Which statement correctly states whether to use RPC (synchronous request/response) or a message queue for this scenario, with two reasons?",
      options: [
        "A message queue, because queues are assumed to always be the objectively safer architectural choice for any interaction that involves moving money at all, completely regardless of whether the caller genuinely needs an immediate answer back or not.",
        "A message queue, with two claimed reasons: it decouples the checkout page in time from the Payment Gateway it's calling, which is assumed to always be a benefit no matter the scenario; and it is assumed to let several independent downstream consumers all separately process that same single card-authorization event, even though only the Payment Gateway itself would actually need to see it.",
        "RPC, but only, it's claimed, because the Payment Gateway happens to be a third-party system here, and every third-party integration is assumed to always be required by convention to use synchronous calls instead of any kind of queue at all.",
        "RPC, with two reasons: the customer is waiting synchronously on-screen for an approved/declined result before the checkout flow can proceed, which matches synchronous communication's fit for when the caller genuinely cannot continue without the reply; and this is a single request/response pair with exactly one receiver per click, so there's no need for the multicast or time-decoupling benefits a message queue would offer.",
      ],
      correctIndex: 3,
      modelAnswer:
        "Asking the Payment Gateway 'approved or declined?' is like asking someone a direct question face-to-face — you need the actual answer right now before you can tell the customer anything, there's nothing useful to do in the meantime except wait.\n\n• Reason one: the customer is waiting, synchronously, on-screen, for an approved/declined result before the checkout flow can proceed — the business logic genuinely needs the answer right now, which is exactly what synchronous request/response communication is for.\n\n• Reason two: this is a single request/response pair with exactly one receiver, the Payment Gateway, per click — there's no need for the multicast, time-decoupling, or multiple-consumer benefits that make message queuing attractive, so a direct RPC call keeps the interaction simple.\n\n• Why the other options are wrong: a message queue is not 'always safer' independent of whether the caller actually needs an immediate answer; queues suit scenarios with multiple independent consumers, which this single-receiver interaction doesn't have; and nothing about a dependency being third-party by itself forces a synchronous call — the deciding factor is whether the caller needs the answer right now, which it does here.\n\nSo the answer is: RPC, because the customer needs the result immediately and there's exactly one receiver per call.",
    },
    {
      type: "mcq",
      prompt:
        "For Scenario A (payment authorization) from the previous question, which statement correctly gives one reason the message-queue option fits less well than RPC?",
      options: [
        "A message queue decouples the sender and receiver in time — the checkout page would have to poll a reply queue or wait on an asynchronous callback just to get a result the customer is waiting to see immediately, adding latency and complexity for no benefit.",
        "A message queue is assumed to only ever be able to deliver a given message to exactly one single consumer in total, so it would therefore be structurally unable to ever reach the Payment Gateway at all under this scenario.",
        "A message queue is assumed to require the Payment Gateway itself to first be entirely rewritten around an event-driven architecture before it could ever receive even a single message sent from MarketCo's own checkout page.",
        "A message queue is assumed to be unable to carry a card-authorization payload of this particular size, since queued messages are generally assumed to be limited to only a few bytes of plain text each.",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine asking a yes/no question by dropping a note in someone's mailbox instead of just asking them face-to-face — you'd then have to keep checking the mailbox yourself to see if they'd replied, instead of just getting the answer on the spot.\n\n• The real drawback: a message queue decouples the sender and receiver in time, so the checkout page would have to poll a reply queue or wait on an asynchronous callback just to get a result the customer is waiting to see right now — pure added latency and complexity for a case with nothing useful to do while 'waiting' other than show the result as soon as it's known anyway.\n\n• Why the other options are wrong: a queue can fan out to multiple consumers, that's not its limitation here; the Payment Gateway doesn't need to be rewritten into any particular architecture just to receive a queued message; and message size limits aren't the reason RPC fits better in this scenario.\n\nSo the answer is: a message queue would add polling/callback latency and complexity for a result the customer needs to see immediately.",
    },
    {
      type: "mcq",
      prompt:
        "Scenario B: when an order is marked 'shipped,' MarketCo needs to notify the customer by email, update the loyalty-points ledger, and notify the warehouse analytics pipeline — none of which need to block the 'mark as shipped' action from completing immediately. Which statement correctly states whether to use RPC or a message queue for this scenario, with two reasons?",
      options: [
        "RPC, with two claimed reasons: a direct synchronous call is assumed to guarantee the email, the ledger update, and the analytics notification all happen together in the exact same millisecond, and RPC is assumed to always be inherently simpler to implement overall than any queue-based design could ever be.",
        "A message queue, with two reasons: none of the three downstream actions need to block 'mark as shipped' from completing, which is exactly the 'send and move on' case message queuing is designed for and which supports multicast-style delivery to multiple independent consumers from one event; and if one consumer (say, the warehouse analytics pipeline) is temporarily down, a persistent queue holds the notification until it recovers, rather than failing the shipping update.",
        "RPC, because it's claimed that all three of these downstream systems — email, loyalty ledger, and warehouse analytics — happen to be owned and operated internally by MarketCo itself, and RPC is assumed to always be the preferred architectural choice whenever every single participant involved belongs to the same company, regardless of any blocking concerns.",
        "A message queue, but only, it's claimed, because queues are assumed to always be cheaper to operate overall than equivalent RPC infrastructure, entirely regardless of how many consumers end up being involved or whether any of them would otherwise need to block the action.",
      ],
      correctIndex: 1,
      modelAnswer:
        "Marking an order 'shipped' and then needing to tell three different people about it is like dropping three separate postcards in the mail once it ships, instead of personally calling each person and waiting on the line until they pick up.\n\n• Reason one: none of the three downstream actions — email, loyalty ledger, warehouse analytics — need to block 'mark as shipped' from completing, which is exactly the 'send and move on' case message queuing is designed for, and it naturally supports multicast-style delivery to several independent consumers from a single event.\n\n• Reason two: if one of those consumers, say the warehouse analytics pipeline, is temporarily down, a persistent queue holds the notification until that consumer recovers, rather than failing the shipping update or forcing the order service to implement its own retry logic against three separate synchronous calls.\n\n• Why the other options are wrong: nothing requires all three downstream actions to happen in the exact same instant, and RPC is not automatically simpler once you account for building retry logic for three dependencies yourself; shared company ownership isn't the deciding factor between RPC and queuing, the deciding factor is whether the caller needs to block for a reply; and cost alone isn't the real justification here.\n\nSo the answer is: a message queue, because none of the three notifications need to block the shipping update, and a queue tolerates one consumer being temporarily down.",
    },
    {
      type: "mcq",
      prompt:
        "For Scenario B (shipped-order notifications) from the previous question, which statement correctly gives one reason the RPC option fits less well than a message queue?",
      options: [
        "RPC is assumed to be structurally unable to call more than one single downstream system at all from one action, so it would supposedly be incapable of ever reaching the email service, the loyalty ledger, and the warehouse analytics pipeline from that one single 'mark as shipped' action in any order.",
        "RPC calls are assumed to always be slower at the raw network level than messages published to an equivalent queue, entirely regardless of how many separate downstream systems actually end up being involved in either approach.",
        "RPC would couple 'mark as shipped' to the availability and response time of three separate downstream services at once — if any one of them is slow or temporarily unavailable, a synchronous call chain would either block the shipping update or require the order service to build its own failure-handling/retry logic for each call, duplicating reliability work a message queue already provides for free.",
        "RPC is assumed to be unable to carry the kind of payload a 'shipped' notification would need to send, since RPC calls are generally assumed to be limited to passing only a single primitive value, such as one integer or one boolean, per call.",
      ],
      correctIndex: 2,
      modelAnswer:
        "Calling three different people one after another to deliver the same piece of news, and waiting on hold for each one to answer before dialling the next, is a lot more fragile than just dropping the same note in three mailboxes and moving on with your day.\n\n• The real drawback: RPC would couple 'mark as shipped' to the availability and response time of three separate downstream services at once — if any one of them is slow or temporarily unavailable, a synchronous call chain either blocks the shipping update or forces the order service to build its own failure-handling and retry logic for each call, duplicating exactly the reliability work a message queue already provides for free.\n\n• Why the other options are wrong: RPC can call multiple downstream systems one after another, that's not structurally impossible, it's just worse here; RPC calls aren't inherently slower at the network level than publishing to a queue, the issue is coupling to three dependencies' availability, not raw call latency; and RPC payloads aren't limited to a single primitive value.\n\nSo the answer is: RPC would tie the shipping update to three downstream services' availability and response time, forcing the order service to build its own retry logic for each one — reliability work a queue already handles.",
    },
  ],
};

export const COMP5348_PRACTICE_EXAM_3_PAPERS: ExamPaperSeed[] = [PAPER];
