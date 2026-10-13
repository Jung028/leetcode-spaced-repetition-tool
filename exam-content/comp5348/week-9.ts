import type { ExamPaperSeed } from "../types";

const LECTURE_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 9,
  paperNumber: 1,
  title: "Week 9 Lecture: Availability",
  topics: "Week 9 lecture (availability, self-study chapter). Reliability vs availability definitions; availability = usable required time / total required time; scope, downtime and maintenance; nines targets and downtime conversions. Strategies for high availability: remove single points, detect and recover, spare capacity, standby readiness (hot/warm/cold); failure domains and shared dependencies. Designing for routine failure: engineering response, common failure pressures, state placement, communication, service boundaries, operations. Failover and work in progress; timeout leaves the outcome uncertain. Fault, error and failure chain; dormant faults; what can fail (hardware, software, environment, application and recovery); failure behaviour (crash/stop, wrong output, timing) and persistence (permanent, transient, intermittent); fail-stop; Bohrbugs and Heisenbugs; five whys root-cause analysis; malicious vs accidental failures. Estimating reliability and availability: the memoryless failure model R(t)=exp(-λt); rate vs probability; a mean is not a guarantee; the bathtub curve; MTTF=1/λ; reading fleet AFR data; repair and restoration time (MTTR); A = MTTF/(MTTF+MTTR); series systems A(system)=A1×...×Ak and failure-rate addition; parallel redundancy A(n copies)=1-(1-A)^n; shared dependencies dominating a redundant pair; MTTF of a redundant pair with repair; two mistakes high and spare-capacity planning (k-out-of-n vs any-one-of-n). Techniques for dealing with failure: five areas of availability engineering, risk registers, testing failure mitigations (chaos engineering, game days), logs that support recovery, backward vs forward recovery, idempotence and causality, the durable idempotency record, fail-fast components and graceful degradation, circuit breakers.",
  sourceFiles: [
    "lecture/COMP5348_W9.pdf",
    "lecture/COMP5348_Week9_Lecture_Notes.pdf"
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Reliability and availability are different questions",
      body: "A car that starts every single morning for a year, then breaks down and needs three weeks in the garage, had excellent reliability but poor availability during that stretch. A car that stalls every Monday but restarts in ten seconds is unreliable but highly available. The two measures ask different questions.\n\n• Reliability: correct service over a stated interval — will it keep working for the next N hours?\n\n• Availability: readiness to provide service when needed — if I ask right now, will it work?\n\n• A service can recover quickly from failures and still achieve high availability, even if it fails often.\n\n• The formula: availability = usable required time / total required time.\n\n• A percentage alone means nothing without a scope (all day? business hours?) and a success criterion (what counts as working).\n\n• Downtime includes detecting the problem, fixing it, restarting, and recovering state — scheduled maintenance counts too if it interrupts the window.\n\n• The nines: 99% allows about 7h 12m of downtime a month. 99.99% allows about 4m 19s a month. Each extra nine cuts the downtime budget by about ten, and usually costs far more than ten times as much to achieve."
    },
    {
      beforeQuestion: 6,
      title: "Strategies for staying up, and the trap in a failure domain",
      body: "Think of a restaurant with two kitchens across town, each with its own power and staff, so a fire in one doesn't stop the other cooking. That's the idea behind failure domains. But both kitchens might still share one delivery app or one supplier — shared pieces a tidy diagram can hide.\n\n• Remove single points of failure: replicate critical components and their shared dependencies, not just the components.\n\n• Detect and recover: health checks, automated restart and a tested failover path shrink the time spent broken.\n\n• Provide spare capacity for disks, processors, power, memory and databases.\n\n• Choose standby readiness: hot standby takes over immediately, warm needs recovery work first, cold starts from scratch — readier costs more but is faster.\n\n• A failure domain is a set of components that one cause — one rack, one power feed, one data centre — can take out together.\n\n• Separate domains reduce some shared risks. They do not create full independence: load balancing, DNS and the deployment system can still be shared across domains.\n\n• Redundancy only helps if the survivors can actually deliver the service — a replica with no spare capacity isn't a real safety net."
    },
    {
      beforeQuestion: 10,
      title: "Planning for routine failure, and the request caught mid-flight",
      body: "In a large system, failure is not a rare emergency — it is routine, much like a city planning for routine traffic jams rather than assuming clear roads.\n\n• Why failures grow more common: resource exhaustion and changing load, more components, people and external dependencies, technical debt and operational changes.\n\n• The engineering response: plan for failure and growth, monitor the user-visible service (not just infrastructure), and use a predictable recovery procedure.\n\n• Four design questions: state placement (what survives a server failure?), communication (synchronous calls add dependencies; queues decouple work), service boundaries (are contracts and SLAs defined?), and operations (is recovery automated?).\n\n• After a component fails: detect the fault, reroute traffic to a surviving replica, and repair the failed one while service continues.\n\n• The hard case is a request already in flight when failure happens. It may have aborted, committed, or its outcome may simply be unknown. Routing can move traffic quickly — it cannot determine the outcome of an unknown transaction.\n\n• A timeout only tells the client how long it waited. It does not roll back anything on the other side, and it does not reveal whether the request succeeded before the reply was lost."
    },
    {
      beforeQuestion: 14,
      title: "Fault, error, failure — and how they behave",
      body: "These three words are used loosely in conversation but precisely in engineering: a crack in a dam is the cause, water seeping through is the problem, and the dam giving way is the disaster.\n\n• Fault: the cause of an incorrect internal state — it may lie dormant and never cause trouble.\n\n• Error: the incorrect internal state itself.\n\n• Failure: the delivered service deviates from its specification.\n\n• A dormant fault stays harmless until triggered; detecting or masking an error stops it becoming a failure. One service's failure becomes a fault to whatever depends on it.\n\n• What can fail: hardware, software, environment, or the application and repair action itself.\n\n• How things fail: by behaviour (crash, wrong output, late timing) and persistence (permanent, transient, intermittent).\n\n• Fail-stop means other components can reliably detect a stop — merely unreachable isn't fail-stop, since a timeout might just mean a slow network.\n\n• Bohrbugs reproduce under the same conditions, so a stable test isolates them; Heisenbugs vanish when observed, usually from concurrency.\n\n• The five whys: keep asking why until you reach something actionable. Five is a prompt, not a rule. Real incidents often have several contributing causes, not one root."
    },
    {
      beforeQuestion: 25,
      title: "The numbers: a rate is not a probability, and a mean is not a guarantee",
      body: "A fair coin landing on heads ten times is no more likely to land on tails next time — each flip forgets the ones before it. The memoryless failure model works the same way.\n\n• R(t) = exp(−λt): the probability of surviving beyond time t under a constant rate λ. Surviving s hours tells you nothing extra about the next t.\n\n• A rate is not a probability: the chance of failing at least once in a year is p = 1 − exp(−λ). A rate can exceed 1 per year; a probability never can.\n\n• A mean is not a guarantee: expected failures over t years are about N × λ × t, but the count varies — an MTTF of 100 years doesn't mean failing at age 100; about 63% fail by then under the exponential model.\n\n• MTTF = 1 / λ, but only under a constant, exponential rate.\n\n• The bathtub curve: rate is higher early, roughly constant through useful life, then rises at wear-out.\n\n• AFR (annualised failure rate) = failures × 365 / total drive-days — normalise by exposure, not device count."
    },
    {
      beforeQuestion: 32,
      title: "Repair time, and the formula that rewards fixing fast",
      body: "After a failure, something must repair the broken part and restore service — that whole interval is what MTTR measures, not just the repair step.\n\n• MTTR: the mean time from failure until correct service resumes. It covers detection, diagnosis, repair, restart and recovering state. Detection is frequently the longest part, and the easiest to overlook.\n\n• Availability from uptime and downtime: A = MTTF / (MTTF + MTTR), with both measured in the same time unit.\n\n• Worked example: 1,000 hours of up-time with a 1-hour restore time gives 1000 / 1001 ≈ 99.9001% availability. The same up-time with a 6-minute (0.1-hour) restore time gives 1000 / 1000.1 ≈ 99.9900% — a whole extra nine, from recovering ten times faster, with the failure frequency unchanged.\n\n• This is a key lesson: making components fail less often (raising MTTF) is slow and expensive. Detecting sooner, automating restart and rehearsing failover are usually far cheaper — and the formula rewards them just as much.\n\n• The formula describes a long-run ratio, not the probability of getting through a year with no failure at all. Frequent failures with fast recovery can still give high availability."
    },
    {
      beforeQuestion: 37,
      title: "Series systems: every required component matters",
      body: "A chain is only as strong as its weakest link, and a service built from several required tiers is the same: every tier has to be up for the whole service to be up.\n\n• When a request needs all of several components, they are in series: A(system) = A1 × A2 × ... × Ak, assuming each component's up/down state is independent.\n\n• Worked example: web, app and database tiers, each 99.9% available, combine to 0.999³ ≈ 99.7%. Each tier alone allows 8.76 hours of downtime a year; all three together allow about 26.3 hours.\n\n• A chain is less available than its weakest link — every required dependency you add lowers the system's availability, an argument for short dependency chains and optional dependencies.\n\n• There is a companion result for reliability: for independent exponential lifetimes, the failure rates add, λ(system) = λ1 + λ2 + ... + λk.\n\n• Multiplying availabilities and adding failure rates answer different questions — do not mix them. And in parallel, when any one of several identical, independent copies is enough, they combine the opposite way: A(n copies) = 1 − (1 − A)^n, since all n must be down at once."
    },
    {
      beforeQuestion: 40,
      title: "A shared dependency dominates, and a repaired pair lasts far longer than you'd guess",
      body: "Two mediocre components can make one excellent pair on paper: two independent 99% replicas combine to 1 − 0.01² = 99.99%, almost four nines from two ordinary parts — but only if they're truly independent.\n\n• The catch: suppose both replicas also depend on one shared component — a load balancer, a database — with its own availability. That shared piece is in series with the pair and dominates. Two 99% replicas behind a 99.9% shared dependency give ≈99.89%, not 99.99%.\n\n• Improving the replicas further cannot remove a required shared dependency — find what they already have in common, which is what a failure domain means.\n\n• If replicas share a rack or a power feed, their failures become correlated: the independence assumption fails, and even the simple pair formula becomes too optimistic.\n\n• How much longer does a repaired pair last? With independent exponential failures and repairs, and MTTR much smaller than MTTF: MTTFn ≈ MTTFⁿ / (n × MTTRⁿ⁻¹). With MTTF = 1,000 hours and MTTR = 1 hour, the pair's MTTF is about 500,000 hours, roughly 57 years — lost only if the second copy fails during the hour it takes to repair the first."
    },
    {
      beforeQuestion: 41,
      title: "Two mistakes high: planning real spare capacity",
      body: "'Two mistakes high', borrowed from flying radio-controlled aircraft, means keeping enough margin to survive two independent problems at once, not just one.\n\n• First, find the nodes needed just to carry today's load: nodes needed = ceiling(load / capacity per healthy node).\n\n• That number is the capacity you need, not the capacity that tolerates a failure. One more node, surviving a single failure, is a different number again.\n\n• The general rule: installed nodes = nodes needed for the load + simultaneous losses you must tolerate. A rolling upgrade takes one node offline and looks exactly like a failure to the rest of the system — so surviving an upgrade and a failure together needs headroom for both at once.\n\n• This is not the parallel formula. A(n copies) = 1 − (1 − A)^n assumes any one surviving copy is enough. 'At least 4 of 6 nodes healthy' is a k-out-of-n requirement instead — using the any-one-of-n formula there would badly overstate availability. Always ask: how many survivors do I need?\n\n• In practice, add further headroom: load balancers rarely spread traffic perfectly, and a node near 100% utilisation has terrible response time."
    },
    {
      beforeQuestion: 44,
      title: "Five areas of availability engineering, and the safe way to retry",
      body: "An untested mitigation is just a hypothesis, and an untested retry can silently double-charge a customer.\n\n• Five areas: failure-aware design, scaling, risk mitigation, monitoring, and defined response.\n\n• A risk register lists what could go wrong, with an owner per risk and evidence the response was tested.\n\n• Chaos engineering (game days): state a hypothesis, run a controlled experiment with an abort threshold, then revise the mitigation.\n\n• Recovery logs record time, component, event and a request ID with its result — stored durably, secrets never logged.\n\n• Backward recovery replays a log from a checkpoint; forward recovery applies corrective operations instead (a refund is compensation, not reversal).\n\n• An operation is idempotent if repeating it preserves its effect: write(5) is idempotent, add(2) is not — though idempotent isn't the same as safe to replay any time.\n\n• A durable idempotency record makes a retry safe: the client reuses a key, the service commits key/effect/result atomically, and a duplicate key returns the stored result instead of repeating the effect.\n\n• Fail-fast components expose a clear error and bound how long they wait on a dependency. A circuit breaker stops calling a failing dependency, giving it room to recover."
    }
  ],
  formulas: [
    { label: "Availability (time-based)", formula: "A = usable required time / total required time" },
    { label: "Downtime from a target", formula: "downtime = (1 − A) × period" },
    { label: "Memoryless survival", formula: "R(t) = exp(−λt)" },
    { label: "Probability of at least one failure in time t", formula: "p = 1 − exp(−λt)" },
    { label: "Mean time to failure (constant rate)", formula: "MTTF = 1 / λ" },
    { label: "Annualised failure rate from fleet data", formula: "AFR = failures × 365 / total drive-days" },
    { label: "Availability from MTTF and MTTR", formula: "A = MTTF / (MTTF + MTTR)" },
    { label: "Series system availability", formula: "A(system) = A1 × A2 × ... × Ak" },
    { label: "Series system failure rate (independent exponential)", formula: "λ(system) = λ1 + λ2 + ... + λk" },
    { label: "Parallel (any one of n) availability", formula: "A(n copies) = 1 − (1 − A)^n" },
    { label: "Redundant pair MTTF with fast repair", formula: "MTTFn ≈ MTTF^n / (n × MTTR^(n−1))" },
    { label: "Spare-capacity planning", formula: "installed nodes = nodes needed for the load + simultaneous losses to tolerate" },
  ],
  questions: [
    {
      type: "mcq",
      prompt: "A payment gateway has run for eleven months without an outage, but when it finally fails, the fix takes three weeks because the only engineer who understood the old billing code has left the company. How would this system best be described?",
      options: [
        "Highly reliable and highly available, because eleven months without an outage is a long reliable run",
        "Not reliable but highly available, because it recovers quickly from every problem",
        "Highly reliable but not very available, because it ran correctly for a long stretch but then stayed down for a long time",
        "Neither reliable nor available, because any outage at all counts against both measures",
      ],
      correctIndex: 2,
      modelAnswer: "A car that starts every morning for a year and then needs three weeks in the garage was a great car for most of the year, but useless while it sat there broken.\n\n• Reliability asks whether it kept working correctly for a stretch of time — eleven clean months is a strong reliability story.\n\n• Availability asks whether it is ready right now — and for three weeks, the honest answer is no.\n\n• Why the other options are wrong: the system is not highly available during the outage, it is not unreliable (it worked correctly for eleven months), and one long outage does not erase eleven months of correct service.\n\nSo the answer is: highly reliable but not very available during that period."
    },
    {
      type: "mcq",
      prompt: "An online store's checkout page stays up the whole time, but a bug means every order is charged the wrong amount. According to the distinction between reliability and availability, what does 'the service was up' actually tell you here?",
      options: [
        "That the specified service was delivered, because the checkout page responded to every request",
        "That the service was both reliable and available, since availability already implies correct results",
        "Nothing about correctness — uptime alone misses whether the service did the right thing",
        "That the fault never activated, since an error only exists once a customer notices it",
      ],
      correctIndex: 2,
      modelAnswer: "A vending machine that lights up and takes your money every time, but sometimes drops the wrong snack, is technically 'on' the whole time — that doesn't mean it is doing its job.\n\n• The teaching point: uptime alone misses correctness. The service running and the service running correctly are two different things.\n\n• Here the specified service (charging the right amount) was not delivered, even though the page itself responded.\n\n• Why the other options are wrong: availability does not automatically imply correct results, and the fault clearly did activate, since it reached customers as wrong charges — that makes it a failure, not a harmless dormant fault.\n\nSo the answer is: nothing about correctness — uptime alone misses that."
    },
    {
      type: "mcq",
      prompt: "A company advertises '99.95% available' for its support portal but does not say over what period or what counts as the service being up. What is missing?",
      options: [
        "Only the service window, since 'available' always means 'returns any response at all'",
        "The scope: a service window and a success criterion are both needed for the number to mean anything",
        "Only the success criterion, since periods are always assumed to be a calendar year",
        "Nothing — a percentage on its own is a complete and meaningful promise",
      ],
      correctIndex: 1,
      modelAnswer: "Saying 'I'm free' means nothing until someone asks free when, and free to do what. A bare availability number has the same problem.\n\n• A percentage only has meaning with a service window (all day? business hours?) and a success criterion (what counts as the service actually working).\n\n• Without both, '99.95% available' could mean almost anything, from a strict round-the-clock promise to a loose best-effort during office hours.\n\n• Why the other options are wrong: neither piece alone is enough, and nothing in the definition says a period defaults to a year or that 'available' just means any response at all.\n\nSo the answer is: both the service window and the success criterion are missing."
    },
    {
      type: "mcq",
      prompt: "A team sets an availability target of 99.95% for a 30-day month (43,200 minutes). Using downtime = (1 − A) × period, how much downtime does this target permit?",
      options: [
        "0.05 minutes, found by forgetting to convert 99.95% into the decimal fraction 0.0005",
        "21.6 minutes, found by multiplying 0.0005 by the 43,200 minutes in the month",
        "216 minutes, found by using a 365-day period instead of the 30-day month",
        "43.2 minutes, found by using 0.001 instead of 0.0005 in the calculation",
      ],
      correctIndex: 1,
      modelAnswer: "If a shop promises to be closed for repairs no more than a tiny sliver of the month, the sliver is just (1 minus the promise) times the whole month.\n\n• The rule: downtime = (1 − A) × period.\n\n• Working: 1 − 0.9995 = 0.0005, and 0.0005 × 43,200 minutes = 21.6 minutes.\n\n• The 43.2-minute option mixes up the 0.0005 fraction with the 0.001 fraction used for 99.9%.\n\n• The 0.05-minute option forgets to turn 99.95% into a small decimal fraction first.\n\n• The 216-minute option uses the wrong period, a year's worth of minutes scaled down instead of the actual 30-day month.\n\nSo the answer is: 21.6 minutes."
    },
    {
      type: "fillblank",
      prompt: "A service targets 99.9% availability over a 365-day year (8,760 hours). Using downtime = (1 − A) × period, the permitted downtime is ___ hours (to two decimal places).",
      blanks: [["8.76"]],
      modelAnswer: "If a service promises to be down no more than one-thousandth of the year, that sliver is a small slice of 8,760 hours.\n\n• The rule: downtime = (1 − A) × period.\n\n• Working: 1 − 0.999 = 0.001, and 0.001 × 8,760 hours = 8.76 hours.\n\nSo the answer is: 8.76."
    },
    {
      type: "multi",
      prompt: "Select all statements that are true about availability targets and how downtime budgets are quoted.",
      options: [
        "99.999% availability permits about 25.9 seconds of downtime per 30-day month",
        "A percentage like '99.9% available' is fully meaningful on its own, without stating the service window or what counts as success",
        "Each extra nine added to a target cuts the downtime budget by about ten, and usually costs far more than ten times as much to achieve",
        "Scheduled maintenance that interrupts the required service window still counts as downtime",
        "A request-based availability figure (successful requests ÷ total requests) always equals the time-based figure (uptime ÷ required time)",
      ],
      correctIndices: [0, 2, 3],
      modelAnswer: "A nines table is like a set of speed limits: each stricter limit buys you a lot less room, and it costs a lot more effort to stay inside it.\n\n• True, 99.999%: the nines table gives 25.9 seconds a month for five nines.\n\n• True, each nine: each extra nine divides the downtime budget by about ten and typically costs far more than ten times as much.\n\n• True, maintenance: scheduled work still counts as downtime whenever it interrupts the required service window.\n\n• False, request-based vs time-based: the two can differ, since an outage at 3 a.m. costs a lot of time but touches few requests.\n\n• False, meaningful alone: a percentage only means something once it has a service window and a success criterion attached.\n\nSo the answer is: the 25.9-second figure, the ten-times rule, and counting maintenance are all true."
    },
    {
      type: "mcq",
      prompt: "A database has a 'warm' standby ready to take over if the primary fails. What should the team expect compared to a 'hot' standby?",
      options: [
        "The warm standby takes over just as fast as a hot standby, since warm already means it is fully caught up and running",
        "There is no practical difference between them; hot, warm and cold are purely marketing terms with no real cost trade-off",
        "The warm standby must be started completely from scratch, with no state preserved at all, the same as a cold standby",
        "The warm standby needs more recovery work before it can take over, since it is not already caught up and ready",
      ],
      correctIndex: 3,
      modelAnswer: "Picture three spare drivers for a delivery van: one is already sitting in the van with the engine running (hot), one is in the building and has to grab keys and check the route first (warm), and one has to be called in from home (cold).\n\n• Hot, warm and cold are positions on a cost-versus-recovery-time trade-off: the readier the standby, the more it costs to keep and the faster it takes over.\n\n• A warm standby sits in the middle — it needs some recovery work before it is ready, more than a hot standby but less than starting from scratch.\n\n• Why the other options are wrong: a cold standby, not a warm one, must be started from scratch, and the three levels are a real engineering trade-off, not just marketing language.\n\nSo the answer is: a warm standby needs more recovery work than a hot standby."
    },
    {
      type: "mcq",
      prompt: "A system splits its web and app servers into failure domain A and failure domain B, each with its own power and network. Which of these is most likely to still be shared by both domains?",
      options: [
        "The physical power cable feeding domain A's rack, which domain B's hardware never touches",
        "The authentication service that both domains' app servers call to check who the user is",
        "Domain B's own local app server instance, which domain A does not rely on at all",
        "Domain A's own local web server instance, which domain B does not rely on at all",
      ],
      correctIndex: 1,
      modelAnswer: "Two kitchens on opposite sides of town, each with its own stove and its own staff, can still both depend on the same delivery app to get orders in the first place.\n\n• Separate failure domains reduce particular shared risks, like one rack's power failing. They do not create complete independence.\n\n• Load balancing, DNS, authentication, the storage layer and the deployment system can all still be shared across every domain, even with separate power and network.\n\n• Why the other options are wrong: a rack's power cable and each domain's own local servers are exactly the things the separate domains were built to isolate.\n\nSo the answer is: the shared authentication service."
    },
    {
      type: "multi",
      prompt: "Select all statements that are true about strategies for high availability and standby readiness.",
      options: [
        "A hot standby changes over more slowly than a warm standby, because it needs more recovery work first",
        "A cold standby is ready to take over immediately, with no startup delay",
        "Providing spare capacity can include disks, processors, power, cooling, memory, applications and databases",
        "Redundancy only helps availability when the surviving resources can actually deliver the required service",
        "Removing single points of failure means replicating critical components and the dependencies they share",
      ],
      correctIndices: [2, 3, 4],
      modelAnswer: "The four strategies are like a fire-safety plan for a building: duplicate the exits (and the stairwells they share), keep the alarms working, stock spare equipment, and decide in advance how ready the backup generator needs to be.\n\n• True, single points: this includes the shared dependencies, not just the obvious duplicated parts.\n\n• True, spare capacity: it spans disks, channels, processors, power, cooling, memory, applications and databases.\n\n• True, redundancy's limit: a surviving replica with no spare capacity cannot actually absorb the load.\n\n• False, hot vs warm: it is the other way round — hot changes over fastest, warm needs more recovery work.\n\n• False, cold standby: a cold standby must be started from scratch, so it is the slowest, not the fastest.\n\nSo the answer is: replicating shared dependencies, broad spare capacity, and redundancy needing real capacity are all true."
    },
    {
      type: "multi",
      prompt: "Select all statements that are true about failure domains.",
      options: [
        "Before adding more replicas, it is worth checking what they have in common",
        "Separating power and network for each domain guarantees complete independence between the domains",
        "Load balancing, DNS, authentication, the storage layer and the deployment system can all still be shared even across separate failure domains",
        "A failure domain is a set of components that a single cause, such as one power feed, can take out together",
        "Putting web and app servers in separate failure domains A and B removes all shared dependencies between them",
      ],
      correctIndices: [0, 2, 3],
      modelAnswer: "A diagram with two tidy, separate boxes looks reassuring, but the picture does not prove the boxes have nothing in common — you still have to check.\n\n• True, shared dependencies: load balancing, DNS, authentication, storage and the deployment system can all still cross both domains.\n\n• True, definition: a failure domain is a set of components one cause can take out together.\n\n• True, checking first: finding what replicas have in common is worth doing before relying on more of them.\n\n• False, removes all sharing: separate domains reduce particular shared risks, they do not remove every shared dependency.\n\n• False, guarantees independence: separate power and network reduce some risks, but they do not guarantee complete independence.\n\nSo the answer is: shared dependencies can persist, the definition is correct, and checking first is worthwhile."
    },
    {
      type: "mcq",
      prompt: "Which of these is listed as a common pressure that makes failures more frequent as a system grows?",
      options: [
        "A stable, unchanging set of external dependencies",
        "A fixed, never-changing deployment process",
        "More components, more people and more external dependencies",
        "Fewer components, since smaller systems are simpler to reason about",
      ],
      correctIndex: 2,
      modelAnswer: "A small team running one server is easy to keep an eye on. Add ten more servers, five more engineers, and three outside services, and there are simply more places for something to go wrong.\n\n• Common failure pressures: resource exhaustion and changing load, more components and people and external dependencies, technical debt and operational changes.\n\n• Growth adds moving parts, and more moving parts means more chances for one of them to break.\n\n• Why the other options are wrong: fewer components, stable dependencies and an unchanging process would all reduce pressure, not increase it — they describe the opposite of what actually happens as systems grow.\n\nSo the answer is: more components, more people and more external dependencies."
    },
    {
      type: "mcq",
      prompt: "When designing for routine failure, the 'state placement' design question asks engineers to think about which of the following?",
      options: [
        "Whether any replica can handle the next request, and what state survives a server failure",
        "Whether contracts, responsibilities and service-level agreements between components are clearly defined",
        "Whether synchronous calls add dependencies, and whether queues could decouple the work instead",
        "Whether the service is monitored, and whether repeatable recovery steps are automated",
      ],
      correctIndex: 0,
      modelAnswer: "If every waiter at a restaurant has to remember your order personally, losing that one waiter loses your order too. If the order is written on a shared ticket, any waiter can pick it up.\n\n• State placement asks: can any replica handle the next request, and what state survives if a server fails?\n\n• This matters because a replica that secretly depends on one server's local memory is not really a safe replica.\n\n• Why the other options are wrong: those describe the other three design questions — communication, service boundaries, and operations — not state placement.\n\nSo the answer is: whether any replica can handle the next request, and what state survives a failure."
    },
    {
      type: "mcq",
      prompt: "A server fails mid-request, right after traffic has been rerouted to a surviving replica. For the one request that was in flight when the failure happened, what does the lecture say is true?",
      options: [
        "Its outcome may be unknown — it could have aborted, committed, or remain uncertain",
        "Routing can determine its outcome once traffic reaches the surviving replica",
        "It must have committed successfully, since the reroute happened quickly",
        "It must have aborted, since failed servers never complete work",
      ],
      correctIndex: 0,
      modelAnswer: "If the power cuts out just as you press 'confirm payment', you genuinely don't know whether the payment went through before the lights went out.\n\n• Detecting the fault and rerouting traffic handles new requests, and a surviving replica can take new work.\n\n• But for the request already in flight, the operation may have aborted, may have committed, or its outcome may simply be unknown.\n\n• Why the other options are wrong: nothing guarantees it committed or aborted, and rerouting traffic cannot by itself reveal what an unknown transaction actually did.\n\nSo the answer is: its outcome may be unknown."
    },
    {
      type: "mcq",
      prompt: "A client sends a charge request, the connection times out before any reply arrives, and the client does not yet know whether the server committed the charge. What does the timeout itself actually tell the client?",
      options: [
        "How long the client waited — it does not by itself reveal what happened on the other side",
        "That the charge definitely happened, since the server usually processes requests before replying",
        "That the charge definitely did not happen, since no reply was received",
        "That the server has automatically rolled back the charge on timeout",
      ],
      correctIndex: 0,
      modelAnswer: "If you post a letter and never get a reply, you don't actually know whether it arrived and the reply got lost, or whether it never arrived at all. Both look the same from where you're standing.\n\n• A timeout limits how long you wait. It does not roll back anything on the other side, and it does not prove what happened there.\n\n• Two completely different histories look identical from the client's side: the request never arrived, or it arrived, was committed, and only the reply was lost.\n\n• Why the other options are wrong: neither 'definitely happened' nor 'definitely didn't' is justified, and nothing about a timeout triggers an automatic rollback.\n\nSo the answer is: a timeout only tells you how long you waited."
    },
    {
      type: "mcq",
      prompt: "A defect in a shipping calculator silently stores a package's weight as a negative number, and later a customer is wrongly quoted free shipping for an oversized parcel. Which part of this is the 'error' in the fault-error-failure chain?",
      options: [
        "The customer service team investigating the complaint",
        "The stored weight value being negative",
        "The customer receiving a free-shipping quote they should not get",
        "The defect in the shipping calculator's code",
      ],
      correctIndex: 1,
      modelAnswer: "A crack forming inside a dam wall, water actually seeping through it, and the dam finally giving way are three different stages of the same story.\n\n• Fault: the cause of an incorrect internal state — here, the defect in the shipping calculator's logic.\n\n• Error: the incorrect internal state itself — here, the weight value stored as negative.\n\n• Failure: the delivered service deviating from its specification — here, the wrong free-shipping quote reaching the customer.\n\nSo the answer is: the negative stored weight value is the error."
    },
    {
      type: "mcq",
      prompt: "A defect has existed in a billing module for two years without ever causing a wrong invoice. What does the lecture's idea of a 'dormant fault' say about this?",
      options: [
        "It cannot be a real fault, since faults always cause visible problems immediately",
        "A fault can remain dormant and harmless until something triggers it into becoming an error",
        "It must already be a failure, since customers rely on correct invoices",
        "It must already be an error, since the fault clearly exists in the code",
      ],
      correctIndex: 1,
      modelAnswer: "A cracked tile hidden under a rug can sit there for years doing nothing, until someone finally steps on exactly the wrong spot.\n\n• A dormant fault can remain harmless until a trigger activates it. Most software faults are dormant most of the time.\n\n• Being present in the code is not the same as having caused an incorrect internal state yet.\n\n• Why the other options are wrong: a fault does not need to cause an immediate problem to be real, and nothing here says it has yet become an error or a failure.\n\nSo the answer is: a fault can stay dormant until a trigger activates it."
    },
    {
      type: "mcq",
      prompt: "Which of these failure sources is specifically called out as something that can introduce brand-new faults, rather than only being a pre-existing cause?",
      options: [
        "A repair action performed during recovery",
        "The cooling system",
        "A disk controller",
        "The network stack",
      ],
      correctIndex: 0,
      modelAnswer: "A rushed, mistyped fix applied at 3 a.m. can turn a small outage into a much bigger one — the fix itself becomes a new problem.\n\n• 'What can fail' spans hardware, software, environment, and application and recovery — and that last category specifically includes the repair action itself.\n\n• A rushed fix, a mistyped configuration, or a failover that was never rehearsed is a common way for a small incident to become a large one.\n\n• Why the other options are wrong: disks, the network stack and cooling are all things that can fail, but they are not singled out as something that introduces new faults through the act of fixing a problem.\n\nSo the answer is: a repair action performed during recovery."
    },
    {
      type: "mcq",
      prompt: "A service occasionally sends back a perfectly correct response, but so slowly that the caller has already given up waiting for it. Which observed failure behaviour does this describe?",
      options: [
        "Fail-stop",
        "Wrong output",
        "Timing",
        "Crash or stop",
      ],
      correctIndex: 2,
      modelAnswer: "A pizza that arrives exactly as ordered, three hours after you gave up and ordered something else, was made correctly — it just didn't arrive in time to matter.\n\n• Observed failure behaviour has three kinds: crash or stop (the component stops doing work), wrong output (an incorrect value), and timing (a correct response that arrives too late).\n\n• Here the content is correct, but it arrives too late to be useful — that is a timing failure.\n\n• Why the other options are wrong: the component did not stop, the output was not wrong, and fail-stop is about detectable stopping, not lateness.\n\nSo the answer is: timing."
    },
    {
      type: "mcq",
      prompt: "A server becomes unreachable, but other components cannot tell whether it has actually stopped or whether the network to it is just slow. What does this gap show?",
      options: [
        "This is an example of a Bohrbug, since it reproduces identically every time it is triggered under the same controlled test conditions",
        "Fail-stop needs more than just stopping — other components must also be able to reliably detect that it stopped, and that is missing here",
        "This proves the cause of the problem is permanent rather than transient, since an unreachable server always indicates a permanent hardware fault",
        "The server is definitely fail-stop, since being unreachable on the network already satisfies the fail-stop requirement by itself",
      ],
      correctIndex: 1,
      modelAnswer: "A friend who stops replying to texts might have dropped their phone in a lake, or might just be asleep — from the outside, both look identical until you find out more.\n\n• Fail-stop is a stronger property than 'it crashed': the component must stop, and other components must be able to reliably detect that it has stopped.\n\n• A server that is merely unreachable is not fail-stop — a timeout suggests failure, but it may equally be a slow network.\n\n• Why the other options are wrong: nothing here confirms it definitely stopped, Bohrbugs are about reproducible defects not detectability, and nothing tells you whether the cause is permanent or transient.\n\nSo the answer is: fail-stop requires reliable detection, which this scenario does not have."
    },
    {
      type: "mcq",
      prompt: "A defect reliably reproduces every single time the same test is rerun under the same controlled conditions. What kind of bug is this?",
      options: [
        "An intermittent fault, since it recurs",
        "A Bohrbug, since a stable test case can isolate it",
        "A Heisenbug, since it is being observed in a test",
        "A fail-stop component, since the defect is reproducible",
      ],
      correctIndex: 1,
      modelAnswer: "A recipe that always comes out the same way, every time you follow the same steps in the same kitchen, is easy to debug — you can just repeat it and watch closely.\n\n• A Bohrbug reproduces under the same controlled conditions, so a stable test case can isolate it.\n\n• A Heisenbug, by contrast, changes between executions or disappears when observed, usually from concurrency, scheduling or environment.\n\n• Why the other options are wrong: being observed does not make something a Heisenbug, 'intermittent' describes how long a cause persists rather than how reproducible it is, and fail-stop is about detectable stopping, not reproducibility.\n\nSo the answer is: a Bohrbug."
    },
    {
      type: "mcq",
      prompt: "During root-cause analysis, a team keeps asking 'why' and after three steps reaches something the process owner can actually go and fix, so they stop there. What does the lecture say about this?",
      options: [
        "Root-cause analysis only works if a single root cause is found, so they must keep searching for one more",
        "'Five' is a prompt, not a rule — stopping once you reach an actionable cause is correct",
        "They did it wrong, since five whys always requires exactly five questions",
        "They should keep asking why forever, since there is always a deeper cause",
      ],
      correctIndex: 1,
      modelAnswer: "A mechanic diagnosing a car that won't start doesn't have to trace the problem back to the factory that made the battery — they stop once they find something they can actually go fix.\n\n• 'Five' in the five whys is a prompt, not a rule. Stop when you reach an actionable cause, whether that takes three steps or eight.\n\n• Real incidents usually have several contributing conditions, not one single root, so looking for exactly one final cause is not the goal either.\n\n• Why the other options are wrong: there is no fixed count of five required, and the point is to find something actionable, not to chase an endless chain or insist on a single root.\n\nSo the answer is: stopping at three actionable steps is correct."
    },
    {
      type: "multi",
      prompt: "Select all statements that are true about the fault, error and failure chain.",
      options: [
        "Detecting or masking an error before it reaches the service boundary can prevent a failure",
        "A fault is the cause of an incorrect internal state, and it may stay dormant and never activate",
        "A failure of one service can be a fault to the service that depends on it",
        "An error automatically becomes a failure the moment it occurs, with no way to stop it",
        "An error is defined as the delivered service deviating from its specification",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer: "A leaking pipe inside a wall (the error) doesn't have to turn into a flooded floor (the failure) if someone finds and fixes the leak before the water spreads.\n\n• True, fault: it is the cause of an incorrect internal state, and it may lie dormant indefinitely.\n\n• True, propagation: one service's failure becomes a fault for whatever depends on it.\n\n• True, catching it early: detecting or masking an error before it reaches the service boundary is exactly what stops it becoming a failure.\n\n• False, automatic: the chain is not automatic — that is the whole point of availability techniques.\n\n• False, definition: 'the delivered service deviates from its specification' describes a failure, not an error.\n\nSo the answer is: faults can stay dormant, failures propagate as faults, and catching errors early prevents failures."
    },
    {
      type: "order",
      prompt: "A team uses the five whys to investigate 'the car will not start'. Put the symptom and the chain of whys into the correct order.",
      steps: [
        "Symptom: the car will not start",
        "Why? The battery is dead",
        "Why? The alternator is not functioning",
        "Why? The alternator belt has broken",
        "Why? The belt exceeded its useful life and was never replaced",
        "Why? The recommended maintenance schedule was not followed"
      ],
      modelAnswer: "Each answer becomes the question for the next step, like peeling back one layer of an onion at a time until you reach something you can actually change.\n\n• The first answer (dead battery) is just a symptom close to the surface.\n\n• Each further why digs one layer deeper: the alternator, then the belt, then why the belt failed, then why the maintenance schedule was not followed.\n\n• The last answer is something a process change can actually prevent — that is the actionable cause the five whys technique is looking for.\n\nSo the answer is: symptom, then the five whys in the order shown, ending at the process failure."
    },
    {
      type: "sort",
      prompt: "Put each statement into the box for the stage of the fault-error-failure chain it belongs to.",
      groups: ["Fault", "Error", "Failure"],
      items: [
        { text: "A defect in the stock-decrement logic", group: 0 },
        { text: "A dormant bug in the logic that has never yet been triggered", group: 0 },
        { text: "The stored stock value becomes -1", group: 1 },
        { text: "An incorrect internal state that has not yet reached the service boundary", group: 1 },
        { text: "A customer successfully orders stock that does not exist", group: 2 },
        { text: "The delivered service deviates from its specification", group: 2 }
      ],
      modelAnswer: "A crack in a dam, water seeping through it, and the dam finally giving way are three different stages of the same story, and each statement here belongs to one of those stages.\n\n• Fault: the cause of an incorrect internal state, which may stay dormant — the code defect and the untriggered bug.\n\n• Error: the incorrect internal state itself, before it reaches anyone outside — the negative stock value and any internal state not yet at the boundary.\n\n• Failure: the delivered service deviating from its specification — the customer actually getting an impossible order, and the general definition of failure itself.\n\nSo the answer is: the code defects are faults, the internal bad states are errors, and the customer-visible outcomes are failures."
    },
    {
      type: "match",
      prompt: "Match each term to its meaning.",
      pairs: [
        { left: "Fault", right: "the cause of an incorrect internal state, which may stay dormant" },
        { left: "Error", right: "the incorrect internal state itself" },
        { left: "Failure", right: "the delivered service deviating from its specification" },
        { left: "Bohrbug", right: "a defect that reproduces under the same controlled conditions" },
        { left: "Heisenbug", right: "a defect that changes between executions or disappears under observation" }
      ],
      decoys: ["a component that stops, where other components can also reliably detect that it has stopped"],
      modelAnswer: "These five terms describe the chain from hidden cause to visible outcome, plus the two personalities a bug can have once you go looking for it.\n\n• Fault, error and failure form the chain: cause, internal state, visible outcome.\n\n• A Bohrbug behaves itself under the same test conditions every time. A Heisenbug does not — it shifts with concurrency, scheduling or observation.\n\n• The decoy describes fail-stop, which is about detectable stopping, not about the fault-error-failure chain or bug repeatability.\n\nSo the answer is: match each term to its own definition, and leave the fail-stop description as the decoy."
    },
    {
      type: "mcq",
      prompt: "A component's lifetime follows the memoryless (constant failure rate) model. It has already been running for 5 years without failing. What does this tell you about the chance it fails in the next year?",
      options: [
        "The chance of failing in the next year is the same as it was for a brand-new component — past survival changes nothing",
        "It is guaranteed to survive another 5 years, since it has already proven it can survive that long once before",
        "It is now more likely to fail in the next year, since the component is getting older and starting to wear out",
        "It is now less likely to fail in the next year, since it has already proven itself reliable by surviving this long",
      ],
      correctIndex: 0,
      modelAnswer: "A fair coin that has just landed on heads ten times in a row is no more or less likely to land on tails next time — each flip forgets every flip before it.\n\n• The memoryless property: P(T > s + t given T > s) = P(T > t). Surviving s years tells you nothing extra about the next t years.\n\n• Why the other options are wrong: the model assumes no ageing effect at all, so neither 'less likely' nor 'more likely' applies, and nothing about the model guarantees any future outcome.\n\nSo the answer is: the chance stays the same as for a brand-new component."
    },
    {
      type: "mcq",
      prompt: "A device has a constant failure rate of λ = 0.05 per year. Using p(1 year) = 1 − exp(−λ), what is the probability it fails at least once in the next year?",
      options: [
        "5%, since the rate and the probability are treated as exactly equal",
        "105%, found by adding 1 and 0.05 instead of using the exponential formula",
        "About 4.88%, found from 1 − exp(−0.05)",
        "50%, found by misreading 0.05 as 0.5",
      ],
      correctIndex: 2,
      modelAnswer: "A rate and a probability feel similar when they're both small, but they are not the same thing — the exponential formula is what actually converts one into the other.\n\n• The rule: p(1 year) = 1 − exp(−λ).\n\n• Working: exp(−0.05) ≈ 0.9512, so p ≈ 1 − 0.9512 = 0.0488, about 4.88%.\n\n• Why the other options are wrong: the rate and the probability are close but not exactly equal, misreading the decimal point gives a wildly different answer, and a probability can never exceed 1, which rules out 105% immediately.\n\nSo the answer is: about 4.88%."
    },
    {
      type: "mcq",
      prompt: "A fleet of 100,000 devices has a constant failure rate of λ = 0.01 per device-year. Using the expected count E[failures] ≈ N × λ × t, about how many failures should the fleet see in one year?",
      options: [
        "100 failures, found by dividing instead of multiplying",
        "1 failure, since the rate is so small it barely counts",
        "1,000 failures, found by multiplying 100,000 by 0.01",
        "10,000 failures, found by multiplying by 0.1 instead of 0.01",
      ],
      correctIndex: 2,
      modelAnswer: "If one in every hundred light bulbs in a huge warehouse burns out each year, and there are 100,000 bulbs, you'd expect about a thousand burnouts, not just a handful.\n\n• The rule: E[failures] ≈ N × λ × t.\n\n• Working: 100,000 × 0.01 × 1 = 1,000 failures expected in the year.\n\n• Why the other options are wrong: dividing instead of multiplying, slipping a decimal point from 0.01 to 0.1, and assuming the count barely matters all give the wrong order of magnitude.\n\nSo the answer is: about 1,000 failures.\n\nNote: the actual count varies year to year around this mean — it is an expectation, not a guarantee."
    },
    {
      type: "mcq",
      prompt: "A fleet logs 200 failures over 3,650,000 total drive-days. Using AFR = failures × 365 / total drive-days, what is the annualised failure rate?",
      options: [
        "0.02%, the correct value but with the decimal point in the wrong place",
        "668,050%, found by dividing the wrong way round",
        "2%, found by multiplying 200 by 365 and dividing by 3,650,000",
        "0.005%, found by leaving out the ×365 in the formula",
      ],
      correctIndex: 2,
      modelAnswer: "Spreading 200 failures across 3.65 million drive-days of exposure, then scaling that rate up to a one-year basis, is exactly what the AFR formula does.\n\n• The rule: AFR = failures × 365 / total drive-days.\n\n• Working: 200 × 365 = 73,000, and 73,000 / 3,650,000 = 0.02, which is 2%.\n\n• Why the other options are wrong: 0.02% has the decimal point shifted two places, dividing drive-days by failures the wrong way round gives a nonsense percentage, and skipping the ×365 step leaves the rate on the wrong time basis.\n\nSo the answer is: 2%."
    },
    {
      type: "fillblank",
      prompt: "A fleet records 60 failures over 1,825,000 drive-days. Using AFR = failures × 365 / total drive-days, the annualised failure rate is ___ % (to one decimal place).",
      blanks: [["1.2", "1.20"]],
      modelAnswer: "Scaling 60 observed failures up to a one-year, exposure-normalised basis is exactly what AFR is for.\n\n• The rule: AFR = failures × 365 / total drive-days.\n\n• Working: 60 × 365 = 21,900, and 21,900 / 1,825,000 = 0.012, which is 1.2%.\n\nSo the answer is: 1.2."
    },
    {
      type: "multi",
      prompt: "Select all statements that are true about the memoryless model and the difference between a rate and a probability.",
      options: [
        "A failure rate λ can be expressed as failures per device-year or per hour",
        "Under the memoryless model, having survived 5 years tells you something extra about the chances of surviving the next year",
        "For small rates, the rate and the probability of failing within a year are nearly equal",
        "The probability that one device fails at least once in a year can never exceed 1",
        "A failure rate of 2.0 per year is impossible, because no rate can exceed 1",
      ],
      correctIndices: [0, 2, 3],
      modelAnswer: "A rate is a speed, like kilometres per hour, and it can be as large as the numbers allow. A probability is a share of a whole, and it is always boxed in between 0 and 1.\n\n• True, units: a rate can be expressed per device-year, per hour, or any other consistent unit.\n\n• True, probability's ceiling: a probability can never exceed 1, no matter how it is calculated.\n\n• True, small rates: for small rates, the rate and the probability are nearly equal, which is exactly why people confuse them.\n\n• False, memoryless: past survival changes nothing about the future under this model.\n\n• False, rate ceiling: a rate can exceed 1 per year, since a repaired device can fail again and again.\n\nSo the answer is: units, probability's ceiling, and the near-equality at small rates are all true."
    },
    {
      type: "truefalse",
      prompt: "True or False: Under the constant-rate (memoryless) failure model, a failure rate λ can be greater than 1 per year, but a probability of failure within a year can never be greater than 1.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer: "A speedometer can read any number, however large, but a show of hands can never be more than everyone in the room.\n\n• A rate can exceed 1 per year, because a repaired device can fail again and again — there is no upper bound built into the idea of a rate.\n\n• A probability can never exceed 1, because it measures a share of a whole range of outcomes, which tops out at certainty.\n\nSo the answer is: True."
    },
    {
      type: "mcq",
      prompt: "After a failure, MTTR covers the whole interval from failure to correct service resuming: detect, diagnose, repair, restart, and recover state. Which stage does the lecture call out as frequently the longest and easiest to overlook?",
      options: [
        "Detection",
        "Restart",
        "Repair",
        "Recovering state",
      ],
      correctIndex: 0,
      modelAnswer: "A fire that burns for ten minutes before anyone notices the smoke alarm has already done most of its damage before the fire brigade even sets off.\n\n• MTTR is the whole unavailable interval: detect, diagnose, repair, restart, recover state.\n\n• Detection is frequently the longest part, and the easiest to overlook, because teams often focus their attention on the fix itself.\n\n• Why the other options are wrong: repair, restart and recovering state are real parts of MTTR, but they are not the stage singled out as typically the longest.\n\nSo the answer is: detection."
    },
    {
      type: "mcq",
      prompt: "A component has MTTF = 200 hours and MTTR = 5 hours. Using A = MTTF / (MTTF + MTTR), what is its availability?",
      options: [
        "40.00%, found by dividing 200 by 5",
        "97.50%, found by dividing 200 by 5 and subtracting from 100",
        "97.56%, found by dividing 200 by 205",
        "2.50%, found by dividing 5 by 200",
      ],
      correctIndex: 2,
      modelAnswer: "Availability is simply the share of a repeating up-and-down cycle that is spent up, so you divide the up-time by the whole cycle, up-time plus down-time.\n\n• The rule: A = MTTF / (MTTF + MTTR).\n\n• Working: A = 200 / (200 + 5) = 200 / 205 ≈ 0.9756, or 97.56%.\n\n• Why the other options are wrong: 97.50% comes from an unrelated subtraction, 40.00% just divides MTTF by MTTR, and 2.50% flips the fraction upside down.\n\nSo the answer is: 97.56%."
    },
    {
      type: "fillblank",
      prompt: "A component has MTTF = 500 hours and MTTR = 2 hours. Using A = MTTF / (MTTF + MTTR), its availability is ___ % (to two decimal places).",
      blanks: [["99.60", "99.6"]],
      modelAnswer: "A component that spends 500 hours up for every 2 hours down is up for almost all of each cycle.\n\n• The rule: A = MTTF / (MTTF + MTTR).\n\n• Working: A = 500 / (500 + 2) = 500 / 502 ≈ 0.99602, or 99.60%.\n\nSo the answer is: 99.60."
    },
    {
      type: "order",
      prompt: "Put the stages that MTTR covers, from the moment a failure happens to correct service resuming, into the correct order.",
      steps: [
        "Detect that a failure has happened",
        "Diagnose the cause",
        "Repair or replace the failed component",
        "Restart the component",
        "Recover its state so correct service resumes"
      ],
      modelAnswer: "Fixing a broken appliance follows the same order every time: notice something is wrong, work out what broke, fix or swap the part, turn it back on, and let it settle back into normal use.\n\n• MTTR is the whole interval, not just the hands-on repair step.\n\n• Detection usually comes first and is frequently the longest, and easiest to overlook, part of the whole interval.\n\n• Restarting and recovering state come after the physical repair, since the component still has to come back online correctly.\n\nSo the answer is: detect, diagnose, repair, restart, recover state."
    },
    {
      type: "truefalse",
      prompt: "True or False: Because A = MTTF / (MTTF + MTTR), raising MTTF (failing less often) is generally a cheaper way to improve availability than lowering MTTR (recovering faster).",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer: "A worked example compares 1,000 hours of up-time with a 1-hour restore (99.9001%) against the same up-time with a 6-minute restore (99.9900%) — the same failure frequency, but a whole extra nine from recovering faster.\n\n• Making components fail less often is slow and expensive.\n\n• Detecting sooner, automating restart and rehearsing failover are usually far cheaper, and the formula rewards them just as much as it rewards a longer MTTF.\n\nSo the answer is: False — recovering faster (lowering MTTR) is usually the cheaper lever, not raising MTTF."
    },
    {
      type: "fillblank",
      prompt: "Four required components are in series, each with 99.5% availability. Using A(system) = A1 × A2 × A3 × A4, the system's availability is ___ % (to two decimal places).",
      blanks: [["98.01"]],
      modelAnswer: "When every one of several parts must be up for the whole thing to work, the chances multiply together, and multiplying four numbers each a little under 1 always gives something smaller than any one of them.\n\n• The rule: A(system) = A1 × A2 × A3 × A4.\n\n• Working: 0.995 × 0.995 × 0.995 × 0.995 ≈ 0.980150, or 98.01%.\n\nSo the answer is: 98.01."
    },
    {
      type: "multi",
      prompt: "A service has web, application and database tiers in series, each 99.9% available, and separately, two independent 99% replicas sit behind the same point in parallel. Select all statements that are true.",
      options: [
        "Multiplying availabilities and adding failure rates answer the same underlying question",
        "Two independent, identical 99% replicas in parallel give about 99.99% combined availability",
        "Each tier alone allows about 8.76 hours of downtime a year, and the combined three-tier service allows about 26.3 hours",
        "Three required tiers, each 99.9% available, combine to about 99.7003% system availability",
        "Adding a required tier to a series system always raises the system's overall availability",
      ],
      correctIndices: [1, 2, 3],
      modelAnswer: "A chain of required links gets weaker every time you add another link, while a set of backup copies gets stronger every time you add another copy — series and parallel pull availability in opposite directions.\n\n• True, three tiers: 0.999 × 0.999 × 0.999 ≈ 0.997003, or 99.7003%.\n\n• True, downtime: each tier alone allows 8.76 hours a year, and the combined service allows about 26.3 hours.\n\n• True, parallel pair: 1 − 0.01² = 0.9999, or 99.99%.\n\n• False, adding a tier: every required tier you add lowers the system's availability, since you are multiplying by another number less than 1.\n\n• False, same question: multiplying availabilities and adding failure rates answer different questions and should not be mixed.\n\nSo the answer is: the three-tier calculation, the downtime figures, and the parallel pair figure are all true."
    },
    {
      type: "sort",
      prompt: "Put each statement into the box for the kind of system it describes.",
      groups: ["Series system", "Parallel system"],
      items: [
        { text: "All required components must be up for the service to be up", group: 0 },
        { text: "A(system) = A1 × A2 × ... × Ak", group: 0 },
        { text: "Every additional required component lowers the system's availability", group: 0 },
        { text: "Any one of several identical copies is enough", group: 1 },
        { text: "A(n copies) = 1 − (1 − A)^n", group: 1 },
        { text: "Adding another identical copy raises the system's availability", group: 1 }
      ],
      modelAnswer: "A series system is a single chain where every link must hold. A parallel system is a bundle of backup copies where only one has to survive.\n\n• Series: every required component counts against you, so availabilities multiply and each addition makes things worse, not better.\n\n• Parallel: the service only goes down if every single copy goes down at once, so adding a copy makes things better.\n\nSo the answer is: the 'all required / multiply / each addition lowers it' statements are series, and the 'any one is enough / 1 minus the product of failures / each addition raises it' statements are parallel."
    },
    {
      type: "multi",
      prompt: "Two independent replicas, each 99% available, sit behind one shared dependency at 99.9% availability. A separate redundant pair has MTTF = 1,000 hours and MTTR = 1 hour per copy. Select all statements that are true.",
      options: [
        "If replicas share a rack or a power feed, their failures can become correlated, which makes the independence assumption fail",
        "Improving the independent replicas further can remove the need to deal with a required shared dependency",
        "Two replicas each at 99% combine in parallel to 99.99%, but behind a shared dependency at 99.9% the service achieves only about 99.89%",
        "Halving the repair time of a redundant pair roughly halves its MTTF",
        "A pair with MTTF = 1,000 hours and MTTR = 1 hour has an approximate pair MTTF of about 500,000 hours, roughly 57 years",
      ],
      correctIndices: [0, 2, 4],
      modelAnswer: "Two mediocre components can make one excellent pair on paper — but only until you notice they both still depend on the same single doorway everyone has to walk through.\n\n• True, shared dependency: 1 − 0.01² = 99.99% for the pair alone, but 0.999 × 0.9999 ≈ 99.89% once the shared 99.9% dependency is included — it dominates.\n\n• True, redundant pair MTTF: MTTFn ≈ MTTF^n / (n × MTTR^(n−1)) gives about 1,000² / (2 × 1) = 500,000 hours, roughly 57 years.\n\n• True, correlation: a shared rack or power feed breaks the independence assumption and makes even the pair formula too optimistic.\n\n• False, improving replicas: no amount of improving the replicas removes a required shared dependency — the shared piece still has to be dealt with on its own.\n\n• False, halving repair time: halving the repair time roughly doubles the pair's MTTF, since MTTR sits in the denominator, not the numerator.\n\nSo the answer is: the shared-dependency figure, the pair MTTF figure, and the correlation risk are all true."
    },
    {
      type: "mcq",
      prompt: "A service must handle 2,400 requests per second, and each healthy node can handle 500 requests per second. Using nodes needed = ceiling(load / capacity per node), how many nodes are needed just to carry today's load, with no spare for any failure?",
      options: [
        "2,400 nodes, found by forgetting to divide by the per-node capacity",
        "4 nodes, found by rounding 4.8 down instead of up",
        "5 nodes, found by rounding 2,400 / 500 = 4.8 up to the next whole node",
        "12 nodes, found by multiplying instead of dividing",
      ],
      correctIndex: 2,
      modelAnswer: "If each checkout lane can serve 500 customers an hour and 2,400 customers are expected, four lanes (2,000 customers) fall short, so a fifth lane is needed even though it won't be completely full.\n\n• The rule: nodes needed = ceiling(load / capacity per node).\n\n• Working: 2,400 / 500 = 4.8, which rounds up to 5 nodes, since a fraction of a node cannot carry traffic.\n\n• Why the other options are wrong: rounding down leaves the load uncovered, multiplying instead of dividing and forgetting the division both give numbers with no connection to the real capacity needed.\n\nSo the answer is: 5 nodes."
    },
    {
      type: "mcq",
      prompt: "The same service (5 nodes needed for 2,400 req/s at 500 req/s each) installs only 6 nodes in total. One node is offline for a rolling upgrade at the same time as a second, unrelated node fails. Does 6 installed nodes give enough headroom?",
      options: [
        "Yes, because installed nodes only ever need to equal the nodes needed for the load, regardless of upgrades or failures happening",
        "Yes, because 6 nodes is already more than the 5 needed for the load alone, so there is no need to plan for further losses",
        "No — but only because the upgrade should never happen during business hours, not because of any capacity shortfall in node count",
        "No — 6 nodes leaves only 4 healthy nodes (2,000 req/s) during an upgrade and a failure together, short of the 2,400 req/s target; 7 nodes are needed",
      ],
      correctIndex: 3,
      modelAnswer: "Flying 'two mistakes high' means keeping enough altitude to survive a second mistake while you're already recovering from the first one, not just enough for one mistake alone.\n\n• The rule: installed nodes = nodes needed for the load + simultaneous losses to tolerate.\n\n• Working: with 1 node lost to upgrade and 1 node lost to failure at the same time, 6 installed nodes leaves 4 healthy nodes, giving 4 × 500 = 2,000 req/s — short of the 2,400 req/s target.\n\n• To cover 5 nodes needed for the load plus 2 simultaneous losses, 7 nodes must be installed.\n\n• Why the other options are wrong: 6 nodes is enough for the load alone or for one single loss, but not for an upgrade and a failure happening together, and the scheduling of the upgrade does not change the arithmetic.\n\nSo the answer is: no — 7 nodes are needed, not 6."
    },
    {
      type: "truefalse",
      prompt: "True or False: If a service needs at least 4 healthy nodes out of 6 installed to meet its capacity target, its availability can be correctly calculated using the parallel formula A(n copies) = 1 − (1 − A)^n.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer: "The parallel formula assumes any one surviving copy is enough, like a bundle of spare umbrellas where grabbing just one keeps you dry. Needing 4 out of 6 healthy nodes is a different kind of requirement, more like needing at least 4 working wheels on a 6-wheeled truck.\n\n• A(n copies) = 1 − (1 − A)^n only applies when any one of n identical copies is sufficient.\n\n• A 'k-out-of-n' requirement, such as needing 4 of 6 nodes healthy, needs a different calculation — using the any-one-of-n formula for it would badly overstate the availability.\n\nSo the answer is: False — always ask how many survivors are actually needed before picking a formula."
    },
    {
      type: "mcq",
      prompt: "A risk register entry for an identity-service dependency proposes caching identity data if the identity service becomes unavailable. What does the lecture say is the important test question for this mitigation?",
      options: [
        "Whether the cache can be implemented using the team's existing framework",
        "Whether caching improves the service's response time under normal load",
        "Which operations can safely use stale data, and for how long",
        "Whether the identity service is likely to fail at all",
      ],
      correctIndex: 2,
      modelAnswer: "A cached identity is a fallback with consequences: a user whose access was just revoked might still get in if the cache hasn't caught up yet.\n\n• A risk register needs joint analysis, an owner, and evidence that a response was actually tested.\n\n• For a cached-identity mitigation, the test question is which operations can safely use stale data, and for how long — a mitigation must be judged for correctness, not just for whether it keeps the service available.\n\n• Why the other options are wrong: implementation framework and normal-load performance are not the point, and likelihood of failure belongs to a different part of the risk assessment (likelihood/severity), not to testing whether the mitigation itself is safe.\n\nSo the answer is: which operations can safely use stale data, and for how long."
    },
    {
      type: "match",
      prompt: "Match each of the five areas of availability engineering to what it means.",
      pairs: [
        { left: "Failure-aware design", right: "handle partial service and dependency failures in the application" },
        { left: "Scaling", right: "add resources while preserving capacity and predictable behaviour" },
        { left: "Risk mitigation", right: "identify consequential risks and test the proposed response" },
        { left: "Monitoring", right: "detect user impact, and tell which dependency is failing" },
        { left: "Defined response", right: "repeatable automation and rehearsed recovery procedures" }
      ],
      decoys: ["the mean time from failure until correct service resumes"],
      modelAnswer: "These five areas are shared responsibilities between the people who design the application and the people who run it day to day.\n\n• Failure-aware design is about the application itself coping with partial failures.\n\n• Scaling, risk mitigation, monitoring and defined response round out the picture: adding capacity safely, planning for what could go wrong, watching for user-visible impact, and having rehearsed procedures ready.\n\n• The decoy describes MTTR, a measurement from earlier in the topic, not one of these five areas.\n\nSo the answer is: match each area to its own description, and leave the MTTR definition as the decoy."
    },
    {
      type: "multi",
      prompt: "Select all statements that are true about testing failure mitigations (chaos engineering) and the logs that support recovery.",
      options: [
        "Chaos Monkey deliberately terminated production instances during business hours, when engineers were present to respond",
        "A mitigation that has never been exercised is a hypothesis, which is why deliberate failure testing (chaos engineering) matters",
        "Secrets such as payment details, passwords and tokens are fine to log as long as access to the log is controlled",
        "Logs should be stored inside the same system they describe, so they are always available together",
        "A correlated log, tied together by a request or trace ID, lets you follow one request across many services",
      ],
      correctIndices: [0, 1, 4],
      modelAnswer: "A fire drill that has never actually been run is just a plan on paper — you only find out whether it works by running it, ideally on a day when everyone is around to respond.\n\n• True, hypothesis: an untested mitigation is only a hypothesis until a controlled experiment checks it.\n\n• True, Chaos Monkey: it ran during business hours specifically so engineers were at their desks.\n\n• True, correlated logs: a shared request or trace ID lets you follow one request's path across many services.\n\n• False, storing logs with the system: logs should be collected in durable, independent storage, not inside the same system they describe, since that system might be exactly what's failing.\n\n• False, secrets: payment details, passwords and tokens do not belong in a log at all, regardless of access control.\n\nSo the answer is: the hypothesis idea, Chaos Monkey's timing, and correlated logs are all true."
    },
    {
      type: "order",
      prompt: "Put the four steps of a durable idempotency record into the correct order.",
      steps: [
        "Identify the operation: the client generates a key and reuses it for every retry of the same request",
        "Commit once: the service records the key, the effect and the result atomically",
        "Return the recorded result: a duplicate key gets back the earlier outcome instead of repeating the effect",
        "Preserve the contract: check that the payload matches, decide how long keys are kept, and handle concurrent duplicates"
      ],
      modelAnswer: "A takeaway order ticket with one order number on it is the same idea: whoever hands over that number again gets the same order again, not a second helping.\n\n• The client must identify the operation first, with one key reused across every retry of the same logical request.\n\n• The service commits the key, effect and result together, atomically, so there is never a moment where one exists without the others.\n\n• A duplicate key then returns the already-recorded result instead of repeating the underlying effect.\n\n• Finally, the contract is preserved by checking the payload matches and handling edge cases like concurrent duplicates.\n\nSo the answer is: identify the operation, commit once, return the recorded result, preserve the contract."
    },
    {
      type: "multi",
      prompt: "Select all statements that are true about idempotence, durable retries, and fail-fast components.",
      options: [
        "Timestamps alone are enough to guarantee correct deduplication and ordering of retried requests",
        "A circuit breaker is a guard that stops calls to a dependency that keeps failing, giving it room to recover",
        "A durable idempotency record must store the key, the effect and the result atomically",
        "write(5) is idempotent, but add(2) is not, because repeating add(2) keeps adding to the value",
        "An idempotent operation is always safe to replay no matter when it is replayed, even if other updates happened in between",
      ],
      correctIndices: [1, 2, 3],
      modelAnswer: "Setting a thermostat to 21 degrees twice leaves it at 21 either way — that's idempotent. Adding 2 degrees twice leaves it warmer than adding it once — that's not.\n\n• True, write vs add: write(5) is idempotent because the value is 5 however often you do it; add(2) is not, since each repeat adds more.\n\n• True, durable record: the key, effect and result must be stored together, atomically, so a retry can never land between them.\n\n• True, circuit breaker: it stops calls to a dependency that keeps failing, giving that dependency room to recover.\n\n• False, always safe to replay: idempotent is not the same as safe to replay at any time — a late retry can still silently overwrite a newer value set in between.\n\n• False, timestamps alone: clocks drift, and two events can share a timestamp, so timestamps alone do not guarantee correct deduplication or ordering.\n\nSo the answer is: the write/add distinction, the durable record requirement, and the circuit breaker definition are all true."
    },
    {
      type: "match",
      prompt: "Match each recovery or resilience term to its meaning.",
      pairs: [
        { left: "Backward recovery", right: "restore a known valid checkpoint, then replay operations from a durable log" },
        { left: "Forward recovery", right: "apply corrective or compensating operations to reach a new valid state" },
        { left: "Idempotency key", right: "a client-chosen identifier that lets a service recognise a retry of the same operation" },
        { left: "Graceful degradation", right: "offering a reduced but still meaningful service while repair proceeds" },
        { left: "Circuit breaker", right: "a guard that stops calls to a dependency that keeps failing" }
      ],
      decoys: ["a living list of risks with their likelihood, severity, owner and mitigation"],
      modelAnswer: "A database rolling back to a backup and replaying its log is backward recovery. A refund issued after a wrong charge is forward recovery — the charge still happened, so the business moves forward to a new valid state instead of pretending it never occurred.\n\n• An idempotency key is what lets a service spot a retry of the same request instead of treating it as a new one.\n\n• Graceful degradation and the circuit breaker work together: a static popular-products list can stand in for a broken search, while a circuit breaker stops hammering the broken dependency in the meantime.\n\n• The decoy describes a risk register, a separate idea from this group of recovery and resilience terms.\n\nSo the answer is: match each term to its own meaning, and leave the risk register description as the decoy."
    }
  ]
};

const CLOUD_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 9,
  paperNumber: 2,
  title: "Week 9 Lecture: Cloud Computing Fundamentals",
  topics:
    "Week 9 lecture recording (cloud computing fundamentals, delivered live, separate from the availability self-study chapter). Two historical threads that became the cloud: 1970s time-sharing and virtual machines (isolation between users sharing one machine) and transaction-processing (TP) monitors running short, stateless service requests across a pool of processes; the cloud reuses both ideas at a much larger scale. Virtualization and the hypervisor, which separates a CPU from its operating system so one physical server can run many isolated virtual machines. Why cloud providers can rent capacity cheaply: on-premises capacity must be provisioned for peak demand and then sits mostly idle, while large providers already had spare capacity from their core businesses (shopping, search, email) and turned renting it out into its own business. Cloud provider geography: a geography (a legal/market boundary such as a country, containing two or more regions so service can survive losing a whole region), a region (a group of datacenters in one area joined by a fast, often private network), and an availability zone (a physically separate facility within a region, with its own power, cooling and network, close enough to the others in its region to replicate synchronously). The shared responsibility model and the X-as-a-service ladder: on-premises (you manage every layer), infrastructure as a service / IaaS (provider manages the physical layers and virtualization; you get a virtual machine and manage the OS upward), platform as a service / PaaS (provider also manages OS and runtime; you bring code and data), function as a service / FaaS (serverless; provider also manages scaling; you bring functions), and software as a service / SaaS (provider manages everything; you just use the application) — every step up this ladder trades control for convenience. IaaS specifics (pay by the hour or second, no capital expenditure, good for test/dev, you patch and manage the OS yourself). PaaS specifics (supports the whole application lifecycle; trade-off is being limited to the platform's supported runtimes and growing dependent on its services). SaaS as the oldest model (hosted applications such as a university email service). FaaS/serverless specifics: event-driven (an HTTP request, a file update, a database change), pay per invocation/execution time, automatic scale-out, a cold start when no warm instance exists, and the hard part — functions are stateless and cannot share state directly with each other, so state has to live in external storage or a queue. Packaging compute as virtual machines versus containers versus functions: a VM bundles a full OS, its own libraries and its own virtual disk and is slow to boot and scaled by adding more VMs; a container shares the host operating system, is lightweight, starts in seconds, is packaged as an image (base image, copy the app, expose a port, run command) and is scaled by adding more containers; a function is just code, starts in milliseconds to seconds, and is scaled by the platform spinning up more invocations rather than by adding servers. Messaging services have no single best option, only trade-offs between ordering guarantees, consistency and cost, matched to the job (simple queue versus event/publish-subscribe). The same underlying services exist across providers under different names (for example AWS EC2, Azure Virtual Machines and Google Compute Engine are all the same idea: a rented virtual machine). The cloud infrastructure market is dominated by three providers (Amazon, Microsoft, Google), is worth roughly $143 billion a quarter, and is growing about 43% year on year, driven substantially by AI and data growth. Whether serverless is the final evolution of cloud: in one sense yes, because every resource is now virtual, but state-sharing and consistency between functions remains a genuinely hard, unresolved problem, because functions cannot share state directly and every interaction must go through storage or a queue.",
  sourceFiles: [
    "lecture/Week 09 - Enterprise-s1-low.transcript.md",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Cloud computing is two old ideas, combined at a much bigger scale",
      body: "Long before 'the cloud' was a marketing word, computer time was already being shared. Two separate traditions from decades ago quietly became today's cloud.\n\n• Time-sharing and virtual machines (1970s): many users safely sharing one physical machine, each isolated from the others — the ancestor of today's virtual machine.\n\n• Transaction-processing (TP) monitors: short, stateless service requests handled across a pool of processes — the ancestor of today's serverless functions.\n\n• The cloud's real trick isn't a new idea, it's running both of these ideas at a massive scale, across buildings full of machines that big companies already owned for their own shopping, search and email businesses.\n\n• That's also why renting cloud capacity can be cheap: the buildings, power and staff were already a sunk cost of someone else's core business.",
    },
    {
      beforeQuestion: 8,
      title: "Renting a layer of the stack: the shared responsibility ladder",
      body: "Picture a ladder of layers: data centre, server, storage, network, virtualization, operating system, runtime, and finally your own application code and data. Running everything yourself on-premises means climbing and maintaining the whole ladder alone.\n\n• IaaS (infrastructure as a service): the provider takes the bottom rungs (physical layers, virtualization) and hands you a virtual machine — everything above that, you manage.\n\n• PaaS (platform as a service): the provider also takes the operating system and runtime — you just bring your code and data.\n\n• FaaS/serverless (function as a service): the provider also takes care of scaling — you just bring a function.\n\n• SaaS (software as a service): the provider manages the entire ladder — you just use the finished application.\n\n• Every step up this ladder trades away some control in exchange for convenience — there's no free step, only a trade-off to decide on as an architect.",
    },
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "The lecture traces cloud computing back to two separate 1970s-era ideas. What are they, and which part of today's cloud did each one lead to?",
      options: [
        "Desktop spreadsheets, which led toward today's databases, and early email systems, which led toward today's messaging queues",
        "Time-sharing/virtual machines, which led toward today's virtual machines, and transaction-processing monitors running short stateless requests, which led toward today's serverless functions",
        "Punch-card batch processing, which led toward today's containers, and dial-up networking, which led toward today's content delivery networks",
        "Mainframe print queues, which led toward today's load balancers, and floppy disk storage, which led toward today's object storage",
      ],
      correctIndex: 1,
      modelAnswer:
        "Two old family trees both ended up at the same modern address: one branch is about safely sharing one machine among many users, the other is about handling lots of short, no-memory requests quickly.\n\n• Time-sharing and virtual machines: many users isolated on one physical machine, the direct ancestor of today's virtual machine.\n\n• TP monitors: short, stateless service requests spread across a pool of processes, the direct ancestor of today's serverless functions.\n\n• Why the others are wrong: punch cards, dial-up, spreadsheets, email and floppy disks aren't the two threads the lecture actually traced.\n\nSo the answer is: time-sharing/VMs led to virtual machines, and TP monitors led to serverless functions.",
    },
    {
      type: "mcq",
      prompt:
        "What does a hypervisor do, and what does it make possible on a single physical server?",
      options: [
        "It encrypts network traffic leaving the server, letting multiple tenants share a building without being able to see each other's packets",
        "It separates the CPU from the operating system with an abstraction layer, letting one physical server safely run several isolated virtual machines at once",
        "It physically splits a server's hard drive into separate partitions, letting several users store files without sharing a folder",
        "It compresses application code before it runs, letting more copies of the same program fit into memory at once",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of one physical office building divided into separate, fully self-contained apartments, each with its own lock, so tenants never see or disturb each other, even though they share the same building.\n\n• The separation: a hypervisor is the abstraction layer that separates a CPU from its operating system.\n\n• The result: it lets one physical server run several virtual machines at the same time, each isolated from the others, possibly even running different operating systems.\n\n• Why the others are wrong: it isn't about disk partitioning, code compression, or network traffic encryption — those solve different problems entirely.\n\nSo the answer is: a hypervisor separates CPU from OS, letting one physical server safely run multiple isolated virtual machines.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture shows a demand-versus-capacity chart to explain why running your own data centre is wasteful compared to renting from a cloud provider. What is the core problem it illustrates?",
      options: [
        "On-premises capacity has to be provisioned for peak demand and then stays flat all day, so it sits mostly idle outside the peak, while a cloud provider lets you pay only for what you use at any given moment",
        "On-premises data centres are not legally permitted to operate outside standard business hours, so companies are required to rent cloud capacity for any workloads that run overnight or on weekends",
        "On-premises servers physically wear out much faster than cloud provider servers do, so the real financial saving from switching to cloud computing comes entirely from avoiding that extra hardware wear",
        "On-premises capacity automatically shrinks itself every night to cut electricity costs, while a cloud provider's rented capacity instead stays fixed at its absolute maximum size around the clock",
      ],
      correctIndex: 0,
      modelAnswer:
        "Buying a delivery van big enough for your busiest Saturday means that same van is mostly empty and still costing you money every other day of the week.\n\n• The on-prem problem: you provision for the peak, but that capacity line stays flat all day, so it's wasted outside peak hours.\n\n• The cloud fix: a provider can let you rent capacity close to actual demand, instead of a fixed, oversized line.\n\n• Why the others are wrong: nothing in the lecture is about automatic overnight shrinking, hardware wear rates, or legal restrictions on daytime operation.\n\nSo the answer is: on-prem capacity is fixed to the peak and wasted off-peak, while cloud rental can track actual demand.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the lecture say large providers like Amazon, Microsoft and Google can offer cloud capacity relatively cheaply?",
      options: [
        "They are legally exempt from paying for electricity and cooling at their data centres, unlike any smaller competitor trying to run a comparable service",
        "They already owned huge amounts of infrastructure for their core businesses (shopping, search, email), so renting out their spare capacity became a natural side business",
        "They use entirely different, far cheaper hardware than any company could realistically buy for its own on-premises data centre deployment",
        "They only operate their data centres for a few hours each day, which keeps their running costs far below a typical always-on business",
      ],
      correctIndex: 1,
      modelAnswer:
        "A supermarket chain that already owns huge warehouses can rent out unused shelf space cheaply, because the building and staff were already paid for by the main business.\n\n• The core idea: these companies already had very large infrastructure footprints built for shopping, search and email.\n\n• The side business: turning spare capacity into a rentable cloud service was a natural extension, not a brand-new cost.\n\n• Why the others are wrong: there's no electricity exemption, no reduced operating hours, and no claim about exotic hardware in the lecture.\n\nSo the answer is: existing huge infrastructure from their core businesses let them rent out spare capacity cheaply.",
    },
    {
      type: "mcq",
      prompt:
        "Using the Azure terms from the lecture, what is the difference between a geography, a region, and an availability zone?",
      options: [
        "A geography, a region and an availability zone are three different marketing names used by different cloud providers for exactly the same underlying technical concept, with no real difference between them",
        "A geography is the smallest unit of all, meaning a single physical server; a region is the next size up, meaning one rack of several servers; an availability zone is the largest unit, meaning an entire continent",
        "A geography is a legal/market boundary that normally contains two or more regions; a region is a group of data centres in one area joined by a fast network; an availability zone is a physically separate facility within a region with its own power, cooling and network",
        "A geography is a single server rack inside one building; a region is a single data centre building containing several racks; an availability zone is a single virtual machine running somewhere inside that building",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a country (the geography) containing a few major cities (regions), and each city containing a few separate, independently powered buildings (availability zones) close enough together to stay in sync.\n\n• Geography: a legal/market boundary, usually with two or more regions so the service can survive losing an entire region.\n\n• Region: a group of data centres in one area, joined by a fast, often private network.\n\n• Availability zone: a physically separate facility within a region, with its own power, cooling and network, close enough to replicate synchronously with its neighbours.\n\nSo the answer is: geography contains regions, a region is a group of connected data centres, and an availability zone is one physically separate facility within a region.",
    },
    {
      type: "mcq",
      prompt:
        "In the shared responsibility model, what changes as you move from on-premises, to infrastructure as a service (IaaS), to software as a service (SaaS)?",
      options: [
        "The provider's responsibility shrinks at each step, until by SaaS the customer is fully responsible for patching the provider's own hardware",
        "You gain more control over each layer of the stack, until by SaaS you are personally responsible for managing the data centre's power and cooling",
        "You give up more control over each layer of the stack in exchange for more convenience, until the provider manages everything and you just use the finished application",
        "Nothing changes about responsibility, since every cloud service model makes the customer responsible for every layer regardless of its name",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like going from cooking an entire meal yourself, to ordering meal-kit ingredients, to just having a restaurant serve you a finished plate — convenience goes up each time, but so does what you're trusting someone else to get right.\n\n• On-premises: every layer, from the data centre up to your application, is your responsibility.\n\n• IaaS: the provider takes the physical layers and virtualization; everything from the OS upward is still yours.\n\n• SaaS: the provider manages the entire stack; you just use the finished application.\n\n• The trade-off: every step to the right trades control for convenience, it isn't a free upgrade.\n\nSo the answer is: responsibility shifts toward the provider at each step, trading your control for convenience, until SaaS where the provider manages everything.",
    },
    {
      type: "mcq",
      prompt:
        "What specifically do you get, and what are you still responsible for, when you rent infrastructure as a service (IaaS)?",
      options: [
        "You get a fully finished application with nothing left to configure, and you are only responsible for paying a flat monthly subscription fee",
        "You get the provider's entire physical data centre building to operate however you like, and you are responsible for its power and cooling systems",
        "You get a virtual machine, paid for by the hour or second with no capital expenditure, and you are responsible for the operating system and everything above it (installing, patching, configuring)",
        "You get a managed database with automatic backups included, and you are responsible only for writing the queries that run against it",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like renting an empty apartment: the landlord handles the building's structure and utilities connection, but you still have to furnish it, keep it clean, and fix anything inside it yourself.\n\n• What you get: a virtual machine, billed by the hour or second, with no upfront capital expenditure on hardware.\n\n• What's still yours: the operating system and everything above it — installing, patching and configuring it is your job.\n\n• Good fit: the lecture calls this ideal for test and development work.\n\nSo the answer is: IaaS gives you a pay-as-you-go virtual machine, while you remain responsible for the OS and everything above it.",
    },
    {
      type: "mcq",
      prompt:
        "What is the key trade-off of platform as a service (PaaS), according to the lecture?",
      options: [
        "You get a ready-made environment that supports the whole application lifecycle, but you live inside the platform's choices — limited to its supported runtimes and growing dependent on its services",
        "You pay absolutely nothing at all for a PaaS service of any kind, but in exchange you must hand the provider full legal ownership of your application's own source code",
        "You get a bare virtual machine with no operating system installed on it at all, and you must build the entire platform yourself completely from scratch before using it",
        "You get complete and totally unrestricted control over every single layer of the stack, but in exchange you must personally cool and power the physical servers yourself",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like renting a fully kitted-out commercial kitchen instead of building your own: you can start cooking immediately, but you're stuck with that kitchen's equipment and layout, and you depend on it staying available.\n\n• What you get: a ready environment (OS, runtime, database management) supporting the whole build-test-deploy-manage-update lifecycle.\n\n• The catch: you live inside the platform's choices, limited to its supported runtimes, and you grow dependent on its specific services.\n\n• Why the others are wrong: PaaS isn't unrestricted control, isn't free, and doesn't hand your source code to the provider.\n\nSo the answer is: PaaS gives a ready application environment, at the cost of being limited to, and dependent on, that platform's own choices.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture calls software as a service (SaaS) 'an older version of cloud' and gives university email as an example. What best describes SaaS?",
      options: [
        "A hosted, finished application that you simply use, with the provider managing every layer underneath it",
        "A programming environment where you write and deploy your own custom application code and manage its runtime",
        "A rented virtual machine onto which you must install your own email server software before you can use it",
        "A pool of functions that only run in response to specific triggers, such as a new email arriving",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like using a webmail service instead of running your own mail server in a cupboard, you just log in and use it, someone else runs everything behind the scenes.\n\n• What it is: a hosted application, like university email through Outlook or a tool like Salesforce, that you simply use.\n\n• Who manages what: the provider manages every layer underneath, from hardware to the application itself.\n\n• Why the others are wrong: SaaS isn't a bare VM, isn't a place you deploy your own custom code, and isn't specifically function-trigger based.\n\nSo the answer is: SaaS is a hosted, finished application you simply use, with the provider managing everything beneath it.",
    },
    {
      type: "mcq",
      prompt:
        "What is the core programming model for function as a service (FaaS/serverless), and what has to happen to its state?",
      options: [
        "The function must first manually request that its own dedicated virtual machine be created, before it is allowed to begin processing any incoming event at all",
        "A stateless function runs in response to an event (such as an HTTP request or a database update), and because it can't hold its own state, that state has to live in external storage or a queue",
        "A single long-running process holds all of the application's state permanently in memory, and every event is simply logged somewhere for later manual review by a developer",
        "Every function permanently keeps its own completely private copy of the full application state, entirely isolated and inaccessible from every other function in the system",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's like a cashier who forgets everything the moment a customer walks away, so the till, not the cashier's memory, has to be where the running total actually lives.\n\n• The trigger: a stateless function runs in response to an event, an HTTP request, a database update, a new file, and so on.\n\n• The catch: because the function itself holds no state, that state has to live somewhere else, storage, a database, or a queue.\n\n• Why the others are wrong: it isn't one long-running process, functions don't request their own VM, and state isn't privately kept inside each function.\n\nSo the answer is: FaaS runs stateless functions in response to events, pushing all state out into external storage or a queue.",
    },
    {
      type: "mcq",
      prompt:
        "What is a 'cold start' in serverless computing, as described in the lecture?",
      options: [
        "When no warm function instance already exists, the platform has to create one from scratch before the function can run, adding a wait",
        "When a container image fails to build because its Dockerfile references a base image that no longer exists",
        "When a virtual machine's operating system needs to fully reinstall itself after every single reboot, unlike a function",
        "When a developer deliberately turns off a function overnight to reduce its cloud bill before turning it back on in the morning",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like a shop that's fully staffed when busy but sends everyone home when it's quiet — the next customer has to wait while someone is called back in before being served.\n\n• The trigger: if no instance of the function is already warm and waiting, the platform must create one from scratch.\n\n• The cost: that creation step adds a wait before the function can actually run and respond.\n\n• Why the others are wrong: it isn't a deliberate nightly shutdown, isn't about VM reinstalls, and isn't a broken Dockerfile.\n\nSo the answer is: a cold start is the wait created when the platform has to spin up a fresh instance because no warm one was available.",
    },
    {
      type: "mcq",
      prompt:
        "How do virtual machines, containers and functions differ in what they bundle and how fast they typically start?",
      options: [
        "A container bundles its own complete full operating system internally, while a VM instead shares the host machine's operating system, which makes containers slower to start than VMs",
        "A VM, a container and a function all bundle an identical full operating system inside them, and all three of them take roughly the same amount of time to fully start up",
        "A VM bundles a full operating system, libraries and its own disk and is slow to boot; a container shares the host OS and starts in seconds; a function is just code and starts in milliseconds to seconds",
        "A function bundles a complete virtual machine image inside itself, which is exactly why functions end up being the slowest of the three options to start running",
      ],
      correctIndex: 2,
      modelAnswer:
        "Starting a VM is like moving into a brand-new furnished house from scratch; starting a container is like unlocking a room that's already built in a shared building; starting a function is like flicking on a single light switch.\n\n• VM: its own full OS, libraries and virtual disk, which makes boot time slow, minutes rather than seconds.\n\n• Container: shares the host operating system, so it's lightweight and starts in seconds.\n\n• Function: just code, starting in milliseconds to seconds, the fastest of the three.\n\nSo the answer is: VMs bundle a full OS and boot slowly, containers share the host OS and start in seconds, and functions are just code that starts almost instantly.",
    },
    {
      type: "mcq",
      prompt:
        "How is each of virtual machines, containers and functions typically scaled out, according to the lecture?",
      options: [
        "VMs are scaled by adding more containers, containers are scaled by adding more functions, and functions are scaled by adding more virtual machines",
        "VMs are scaled by adding more virtual machines, containers are scaled by adding more containers, and functions are scaled by the platform running more invocations rather than by adding servers",
        "None of the three can be scaled out at all; each is permanently limited to a single running instance",
        "All three are scaled using exactly the same mechanism: manually buying and racking additional physical servers",
      ],
      correctIndex: 1,
      modelAnswer:
        "Adding more delivery vans scales a van fleet, adding more market stalls scales a market, and letting more customers walk up to one tireless cashier scales a till, three different ways to handle more demand.\n\n• VMs: scale out by adding more virtual machines.\n\n• Containers: scale out by adding more containers.\n\n• Functions: scale out because the platform just runs more invocations, with no servers for you to add at all.\n\nSo the answer is: VMs scale by adding VMs, containers by adding containers, and functions by the platform invoking more copies automatically.",
    },
    {
      type: "mcq",
      prompt:
        "What does the lecture say about choosing a cloud messaging service (for example, a simple queue versus an event/publish-subscribe service)?",
      options: [
        "Messaging services are entirely interchangeable with each other, so the specific choice you make never has any real effect on an application's eventual behaviour",
        "There is no single best messaging service; each option is tuned for a different job, and you trade off things like ordering guarantees, consistency and cost to match your actual requirement",
        "Messaging services only ever matter for communication between two completely separate companies, never for any communication occurring within your own single application",
        "There is one single universally best messaging service, and every other available option exists only as a cheaper, strictly worse backup choice to fall back on",
      ],
      correctIndex: 1,
      modelAnswer:
        "Picking a messaging service is like picking between a phone call, a group chat, and a notice board — each is genuinely better for a different kind of message, not ranked best to worst.\n\n• No single best: each messaging option is tuned for a different job.\n\n• The real decision: trade-offs around ordering guarantees, consistency, and cost, matched against what you actually need.\n\n• Why the others are wrong: there's no universal winner, the choice does affect behaviour, and it matters just as much for communication inside one app.\n\nSo the answer is: there's no single best messaging service, only trade-offs to match against your actual requirement.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture gives AWS EC2, Azure Virtual Machines and Google Compute Engine as an example. What point is it making?",
      options: [
        "Only one of the three providers actually offers virtual machines, while the other two only offer containers under a confusing name",
        "AWS EC2, Azure Virtual Machines and Google Compute Engine are three completely different kinds of service with no shared underlying concept",
        "The three names refer to three different pricing tiers of a single product sold exclusively by one company",
        "Different cloud providers use different names for the same underlying building blocks, a rented virtual machine is the same basic idea everywhere, just branded differently",
      ],
      correctIndex: 3,
      modelAnswer:
        "Three airlines all selling you a seat on a plane under three different loyalty-programme names, it's still the same basic product underneath.\n\n• The point: different providers share the same underlying building blocks, just with different branded names.\n\n• The example: a rented virtual machine is EC2 on AWS, Virtual Machines on Azure, and Compute Engine on Google Cloud.\n\n• Why it matters: the choice between providers is about more than naming, picking one is still a real architectural decision.\n\nSo the answer is: different providers name the same underlying service differently, a rented VM is the same core idea across all three.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false: the lecture states that the cloud infrastructure market is dominated by three providers (Amazon, Microsoft, Google) and is growing at roughly 43% year on year, driven substantially by AI and data growth.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "Think of three big supermarket chains controlling most of a country's grocery market, while the whole market keeps growing fast because everyone suddenly needs a lot more of one particular product.\n\n• Three dominant providers: Amazon, Microsoft and Google were named as the dominant players.\n\n• The growth figure: the lecture cited roughly 43% year-on-year growth.\n\n• The driver: that growth was tied substantially to AI and the data it generates.\n\nSo the answer is: True, three providers dominate and the market is growing quickly, driven largely by AI and data.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false: according to the lecture, once every resource in an application is running as serverless functions, state-sharing and consistency between those functions becomes an easy, fully solved problem.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "Imagine a team where nobody is allowed to remember anything between tasks, every bit of shared progress has to be written down on a shared noticeboard instead, that noticeboard becomes the hard part.\n\n• What's true: serverless is, in one sense, the final step of cloud abstraction, since every resource is now virtual.\n\n• What's still hard: functions cannot share state directly with each other, every interaction has to go through storage or a queue.\n\n• The honest framing: the lecture explicitly raised this as unresolved difficulty, not something serverless magically fixes.\n\nSo the answer is: False, state-sharing and consistency between functions remains a genuinely hard, open problem.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly describes the shared responsibility model and the as-a-service ladder, as covered in the lecture.",
      options: [
        "With PaaS, you are still responsible for installing and patching the operating system yourself",
        "With IaaS, the provider manages the physical layers and virtualization, and you manage the operating system and everything above it",
        "With SaaS, the provider manages the entire stack and you simply use the finished application",
        "On-premises means you are responsible for every layer of the stack, from the data centre up to your application",
        "Moving further along the as-a-service ladder always increases your control over the system with no trade-off at all",
      ],
      correctIndices: [1, 2, 3],
      modelAnswer:
        "Climbing down a ladder of layers, on-prem means you're standing on every single rung yourself; by SaaS, someone else is holding the whole ladder for you.\n\n• True, on-premises: every layer is your responsibility.\n\n• True, IaaS: provider takes the physical layers and virtualization, you take the OS upward.\n\n• False, PaaS: the whole point of PaaS is that the provider takes the OS and runtime, you bring code and data instead.\n\n• True, SaaS: the provider manages everything, you just use the app.\n\n• False, control without trade-off: every step up trades away control in exchange for convenience, it's never a free upgrade.\n\nSo the answer is: on-premises, IaaS, and SaaS are described correctly; the PaaS claim and the 'no trade-off' claim are both false.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly describes function as a service (FaaS/serverless), as covered in the lecture.",
      options: [
        "You typically pay per invocation or execution time, rather than for a server that is always running",
        "A function runs in response to an event, such as an HTTP request, a file update, or a database change",
        "Functions tend to start in milliseconds to seconds, much faster than booting a full virtual machine",
        "Functions can directly share in-memory state with each other without needing any external storage or queue",
        "A cold start happens when no warm instance exists yet, so the platform must create one before the function can run",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "A function is like a light that only switches on when a sensor detects movement, lit instantly when needed, but it never remembers anything about the last time it was on.\n\n• True, event-driven: an HTTP request, file update, or database change can all trigger a function.\n\n• True, pay per use: billing is tied to invocations and execution time, not to an always-on server.\n\n• False, shared in-memory state: functions are stateless and cannot share state directly, state has to live in external storage or a queue.\n\n• True, cold start: no warm instance means the platform creates one first, adding a wait.\n\n• True, fast start: milliseconds to seconds, far faster than a VM boot.\n\nSo the answer is: event-driven triggers, pay-per-use, cold starts, and fast starts are all true; functions sharing in-memory state directly is false.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly describes virtual machines, containers, and functions, as covered in the lecture.",
      options: [
        "A virtual machine includes its own full operating system, its own libraries, and its own virtual disk",
        "Virtual machines generally start faster than containers because they contain less software overall",
        "A container image is typically built from a base image, with the application copied in, a port exposed, and a run command set",
        "A container shares the host machine's operating system instead of bundling its own",
        "Functions are usually scaled by the platform running more invocations, rather than by manually adding servers",
      ],
      correctIndices: [0, 2, 3, 4],
      modelAnswer:
        "A VM is a fully furnished house you build from scratch each time, a container is a room in a shared building that's mostly ready to go, and a function is a single light switch, three very different amounts of setup.\n\n• True, VM contents: full OS, its own libraries, and its own virtual disk.\n\n• True, container OS sharing: it shares the host's operating system rather than bundling its own.\n\n• True, container image: built from a base image, with the app copied in, a port exposed, and a run command.\n\n• False, VM start speed: VMs boot much slower than containers, not faster, exactly because they carry a full OS.\n\n• True, function scaling: the platform just runs more invocations, no servers for you to add.\n\nSo the answer is: VM contents, container OS sharing, the container image recipe, and function scaling are all true; the claim that VMs start faster than containers is false.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly describes cloud provider geography, as covered in the lecture.",
      options: [
        "A region is a group of data centres in one area, joined by a fast, often private network",
        "A geography is a legal/market boundary that normally contains two or more regions",
        "Having two or more regions inside one geography helps a service survive losing an entire region",
        "Availability zones within the same region are too far apart to ever replicate data between them synchronously",
        "An availability zone is a physically separate facility within a region, with its own power, cooling and network",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "A country holding a few major cities, each city holding a few separately powered buildings close enough together to stay in sync, that's geography, region, and availability zone.\n\n• True, geography: a legal/market boundary normally containing two or more regions.\n\n• True, region: a group of data centres in one area, joined by a fast network.\n\n• True, availability zone: a physically separate facility within a region, with its own power, cooling and network.\n\n• False, zone distance: zones within a region are deliberately close enough to replicate synchronously, not too far apart to do so.\n\n• True, surviving region loss: multiple regions in one geography is what lets a service survive losing an entire region.\n\nSo the answer is: the geography, region, zone, and region-loss-survival statements are all true; the claim that zones are too far apart to replicate synchronously is false.",
    },
    {
      type: "order",
      prompt:
        "Put these five deployment models in order from the one where the customer manages every layer themselves, to the one where the provider manages every layer.",
      steps: [
        "On-premises (the customer manages every layer, from the data centre up to the application)",
        "Infrastructure as a service / IaaS (the provider manages the physical layers and virtualization; the customer gets a virtual machine)",
        "Platform as a service / PaaS (the provider also manages the operating system and runtime; the customer brings code and data)",
        "Function as a service / FaaS, serverless (the provider also manages scaling; the customer brings a function)",
        "Software as a service / SaaS (the provider manages the entire stack; the customer just uses the finished application)",
      ],
      modelAnswer:
        "It's the same ladder from cooking an entire meal yourself from raw ingredients, to ordering a finished dish delivered to your door, each step hands over one more layer of the work.\n\n• On-premises starts the ladder, where every layer is the customer's job.\n\n• IaaS, PaaS and FaaS each hand over one more layer of the stack to the provider, in that order.\n\n• SaaS finishes the ladder, where the provider manages everything and the customer just uses the app.\n\nSo the answer is: on-premises, then IaaS, then PaaS, then FaaS/serverless, then SaaS.",
    },
    {
      type: "match",
      prompt:
        "Match each term from the lecture to what a customer is responsible for bringing or managing under that model.",
      pairs: [
        { left: "On-premises", right: "every layer, from the data centre and hardware up to the application" },
        { left: "IaaS", right: "the operating system and everything above it, on a rented virtual machine" },
        { left: "PaaS", right: "just the code and data, on a provider-managed runtime and OS" },
        { left: "FaaS / serverless", right: "just a function, with scaling handled by the provider" },
        { left: "SaaS", right: "nothing beyond using the finished application" },
      ],
      decoys: ["only the physical power and cooling for a rented data centre"],
      modelAnswer:
        "Five rungs of the same ladder, each one handing the customer a little less to look after than the rung before it.\n\n• On-premises and IaaS sit at the heavy-responsibility end, the customer manages most or all of the stack.\n\n• PaaS and FaaS sit in the middle, the customer brings progressively less (code and data, then just a function).\n\n• SaaS sits at the light end, the customer brings nothing but their own use of the finished application.\n\n• The decoy describes managing a data centre's power and cooling, something no customer does under any of these five models.\n\nSo the answer is: match each model to what the customer brings, and leave the power-and-cooling description as the decoy.",
    },
  ],
};

export const WEEK_9_PAPERS: ExamPaperSeed[] = [LECTURE_PAPER, CLOUD_PAPER];
