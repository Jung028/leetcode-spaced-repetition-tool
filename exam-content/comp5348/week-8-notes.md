# COMP5348 Week 8 — Study Notes

Lecture 8 "Predicting performance and queues" (Dr. Sichao Li, `COMP5348_W8.pdf`,
48 slides; slide "Page N" footer = PDF page N) + Tutorial 8 "RESTful Web Services"
(payroll service, Parts A-D, `tutorial-8-base` code). Recording transcript is
whisper output (noisy) — the slides win wherever numbers disagree (see "Verified
numbers" at the end). Notes only; no questions authored here.

Sources read: every slide page (diagram slides 24-29, 31-37, 39-43 viewed as images),
the whole transcript, the tutorial PDF, and the tutorial-8-base source
(`EmployeeController.java`, `EmployeeService.java`, `EmployeeDTO.java`, `Employee.java`,
error classes, `LoadDatabase.java`, React `employee.service.js` + components).

Author priority (from the user): the most important part of the week is the
**"Work is done at different devices" calculation** (slide 24) and the worked examples and
laws that flow from it (slides 25-29, 31-37). About two thirds of the paper should
exercise those calculations.

---

## 1. Important points from slides

# >>> THE CORE OF WEEK 8: "Work is done at different devices" (slide 24) <<<

This is the slide the user flagged as the most important. Everything else in the lecture
(laws, bounds, planning, redesign) is built on these symbols. The subscript **i** means
"one particular device" (CPU, database, disk, ...). A **job** = one complete client
request through the whole system; a **visit** = one trip of a job to one device.

| Symbol | Meaning (slide wording) | Formula / unit |
|---|---|---|
| V_i | (average) number of **visits** by a single job to device i | visits per job |
| S_i | average **service time** for a visit at device i — time spent *actually using* the device, **not** queueing etc. | seconds per visit |
| λ_i | average **arrival rate** of visits per second at device i | visits/s |
| X_i | **throughput** of device i (visits completed per second) | visits/s |
| μ_i | average **service rate** of visits at device i: visits that could be completed per second if the device were kept continually busy | **μ_i = 1 / S_i** |
| D_i | **service demand per job** at device i | **D_i = V_i × S_i** (seconds of device i per job) |
| U_i | **utilisation** of device i: fraction of time the device is busy | **U_i = λ_i × S_i** |

Reading guide:
- D_i is "how much of device i one complete job consumes on average" — actual time
  using the device, excluding waiting. The lecturer: "this might be one of the most
  important concepts — service demand."
- S_i is per *visit*; D_i is per *job*; D_i = V_i × S_i converts one to the other.
- μ_i and S_i are reciprocals (S = 20 ms = 0.02 s → μ = 50 visits/s).
- In steady state a device completes what arrives, so X_i = λ_i; then U_i = X_i × S_i
  (derived, not printed on the slide, but it is what links slide 24 to the laws on
  slide 28).

### The worked example that uses it (slides 25, 29, 36) — same table each time

| Resource | Visits per job V_i | Service time per visit S_i | Service demand D_i = V_i S_i |
|---|---|---|---|
| CPU | 2 | 20 ms | 40 ms = **0.04 s** |
| Database | 3 | 20 ms | 60 ms = **0.06 s** |

- Think time **Z = 5 s**; number of clients **N varies** (slide 25 title: "How many
  users can our system support?"). Flow drawn: Client → CPU (D = 0.04 s) → DB (D = 0.06 s).
- Slide question: "Which resource do you expect to become the bottleneck?" →
  the **database** (largest D_i; 0.06 s > 0.04 s). The lecturer: DB "will be first
  saturated" because its service demand is larger.
- Total service demand **D = ΣD_i = 0.04 + 0.06 = 0.10 s**; **D_max = 0.06 s** (DB).
- Variations to be ready for: change V or S and recompute D_i (e.g. DB with V = 3,
  S = 10 ms → D_DB = 0.03 s, CPU 0.04 s becomes the bottleneck); convert S ↔ μ
  (20 ms ↔ 50/s); D_i uses S_i (device time), never R (response time).

### Laws that relate a device to the whole system (slide 28)

- **Forced Flow Law:** X_i = V_i × X  (device throughput = visits per job × system throughput).
  Example (video): system X = 10 jobs/s, each job visits the DB 3 times → X_DB = 3 × 10 =
  **30 visits/s**.
- **Service Demand Law ("Bottleneck Law"):** U_i = D_i × X  (utilisation = demand per job
  × system throughput). At X = 10 jobs/s: U_CPU = 0.04 × 10 = **0.4** (40%), U_DB =
  0.06 × 10 = **0.6** (60%); both below saturation.
- **Example: Service Demand Law (slide 36).** D_DB = 0.06 s and utilisation cannot exceed
  1, so 0.06·X ≤ 1 → X ≤ 1/0.06 → **X ≤ 16.67 jobs/s**. (At that X, U_DB = 1: the DB
  saturates first; the CPU would be at 0.04 × 16.67 ≈ 0.67.)

### Little's Law and the interactive response time law (slides 26-27)

- Measures: **X** = (average) jobs completed per second (throughput); **R** = (average)
  time from submitting a job till it is completed (response time).
- **Little's Law: N = λT.** Any system in steady state; N = jobs in the "system", T =
  average time in the "system", λ = average arrival (or departure) rate. Applies to any
  part of the system; does not depend on knowing the distribution shape. (The user's own
  notes write it L = λ × W — same law, different letters; mention the alias once in a
  reading card, use N = λT in questions.)
- Apply it to the *whole closed system including the clients*: N = number of clients
  (each client is one job somewhere: thinking, being processed, or waiting). Each client's
  cycle is R + Z, the system completes X jobs/s, so **N = X × (R + Z)**, equivalently
  **R = N/X − Z** — the **interactive response time law**.
- **Example: 20 Clients (slide 29).** Z = 5 s, N = 20, measured X = 3.92 jobs/s →
  R = 20/3.92 − 5 ≈ **0.10 s**. And D = D_CPU + D_DB = 0.10 s, so **R ≈ D**: response
  time equals the raw service work, i.e. **no queueing** at this load (lecturer:
  "there might be no queuing at all"). Note X = 3.92 is also exactly the low-load bound
  N/(D+Z) = 20/5.10 ≈ 3.92 — the system is on the low-load line.
- Lecturer's convoy example for Little's law (units unclear in transcript; skip for
  questions): λ = 2 customers/s, time in system T, N = λT.

### Performance bounds for closed systems (slides 31-33)

- **High-load bounds** (bottleneck): D_max = largest D_i; the device where it occurs is
  "the bottleneck". **X ≤ 1/D_max** (because U_i must be at most 1), so
  **R ≥ N × D_max − Z**. X and R are close to these bounds when load is **high**.
  Example: D_max = 0.06 → X ≤ 16.67 jobs/s.
- **Low-load bounds** (actual work): D = ΣD_i. **R ≥ D** (a job's total time includes time
  at each device *plus* queueing), so **X ≤ N/(D + Z)**. X and R are close to these bounds
  when load is **low**. Example: D = 0.10 → R ≥ 0.10 s; N = 20, Z = 5 → X ≤ 20/5.10 ≈ 3.92.
- **Slide 33 diagram ("Effect of the bounds")** — two plots against N. Left plot, X vs N:
  a dashed rising line (low-load bound, X ≤ N/(D+Z)) and a dashed horizontal line (high-load
  bound, X ≤ 1/D_max); the real X curve follows the rising line at small N, then bends
  and flattens just below the horizontal line; an arrow at the crossing says "Queues
  start to build up badly, as bottleneck is saturated". Right plot, R vs N: a dashed
  horizontal line (low-load bound R ≥ D) and a dashed rising line (high-load bound
  R ≥ N·D_max − Z); the real R curve is flat near D at small N, then curves up and hugs
  the rising line at large N.
- **Knee point** (not printed on the slides; the user's own summary; it follows from
  equating the two bounds where the lines cross): **N\* = (D + Z)/D_max**. With D = 0.10,
  Z = 5, D_max = 0.06 → N\* = 5.10/0.06 = **85 clients**. Below N\* the system behaves
  like the low-load line, above it queues build up badly. Present as "where the two bounds
  cross".
- Low-load message (video): with few clients, adding clients raises throughput roughly
  proportionally (using idle capacity); eventually some resource saturates.

### Planning for scale (slide 34) and system redesign (slide 35)

- Typical situation: an existing system; how much can the workload grow before performance
  is unacceptable? Question: "how many clients can be supported while keeping average
  response time below a given limit?" — equivalently how much throughput. Harder variants
  (e.g. "99% of response times below a limit") are not handled by these averages.
- From measurements determine job categories and D_i for each resource. **Assumption:
  adding more clients of the same type does not alter D_i.** Solve the high-load bound for
  the highest N that keeps R under the limit, then determine the X bound for that N.
- **Worked plan (slide + video):** keep average R below 2 s, D_max = 0.06 s, Z = 5 s.
  R ≥ N·D_max − Z and we need R ≤ 2, so N·0.06 − 5 ≤ 2 → **N ≤ (2 + 5)/0.06 = 116.67 →
  about 116 clients** (check: 116 × 0.06 − 5 = 1.96 s; 117 × 0.06 − 5 = 2.02 s). Lecturer:
  it is an **upper planning estimate** from averages and bounds; it does **not** prove the
  116th client gets a 2 s response — it says beyond roughly this point the requirement
  cannot hold ("a necessary capacity constraint").
- **System redesign methodology (slide 35):** the bottleneck is the device with the largest
  D_i. The only way to beat X ≤ 1/D_max is to change the design to change D_max: move
  tasks away from the bottleneck (add new devices to take some load, or re-arrange
  processing so some visits go to other existing devices), or change the device so each
  request needs less service time (e.g. a faster disk). **After redesign there is still a
  bottleneck — perhaps on a different device.** Video: fix the identified bottleneck first
  (here the DB), not "whatever is easiest to change"; then consider moving work elsewhere,
  reducing visits, adding parallel capacity.
- **Warning (slide 37):** common mistake = re-using a previously computed quantity that has
  changed. E.g. with higher N you have the **same D_i but different X_i and U_i**; with a
  change in the frequency of job types you have a different (average) D_i.

### Approaches to performance prediction (slides 8-10)

- **Extrapolation:** measure at some parameter values (e.g. response time at 10, 20, 30
  clients), fit a curve, predict other values. Big problem: performance can change
  radically when the system reaches capacity — **interpolation works well, extrapolation
  does not** (video: estimating 25 users from 10/20/30 is interpolation).
- **Simulation:** build a computer-based model of tasks, resources and events (randomised
  values; frameworks such as NS2), run it and see what happens (do queues build up? how
  many requests per time?). Problems: coding a reasonable model is very difficult and
  slow; getting key parameters is hard (e.g. how long each request uses a disk).
- **Analytical (queueing) models:** mathematical model of resources, queues and state
  probabilities; solve for steady-state behaviour (exact function, or approximate by
  iteration). Not as precise as simulation, but usually far easier if the random-value
  pattern is one of a few easy forms. Some simple results are back-of-the-envelope, without
  the precise distribution: the **operational laws — the focus of this unit**.

### Closed vs open system (slide 23)

- **Closed system:** independent parameters **N** (number of clients submitting jobs; also
  the number of jobs either in the system or "thinking" at the client) and **Z** (think
  time between a job completing and the same client submitting another).
- **Open system:** independent parameter **λ**, the arrival rate of jobs per second
  (requests arrive from outside). This lecture's operational-law analysis is for the closed
  system; M/M/1 is an open-system model.

### M/M/1 queueing (slides 39-42) — "proofs not needed, but know these results"

- Assumptions: jobs arrive by a **Poisson process** (exponential inter-arrival gaps,
  average λ arrivals/s); service demand is **exponential** (average μ services possible per
  s); one server. Essential parameter: load **ρ = λ/μ**.
- **N = ρ/(1−ρ)** (avg jobs in queue or being served); **N_wait = ρ²/(1−ρ)** (avg in queue);
  **T = 1/(μ(1−ρ))** (avg time in system: waiting or being served);
  **T_wait = ρ/(μ(1−ρ))** (avg waiting time in queue). T = T_wait + 1/μ.
- **Slide 41 table** (μ = 10 requests/s → average service time 1/μ = 0.1 s; vary only λ):

  | Arrival rate λ | Utilisation ρ | Average time in system T |
  |---|---|---|
  | 5/s | 50% | 0.20 s |
  | 8/s | 80% | 0.50 s |
  | 9/s | 90% | 1.00 s |
  | 9.5/s | 95% | 2.00 s |

  Verified: T = 1/(10(1−ρ)). Also at ρ = 0.8: N = 4, N_wait = 3.2, T_wait = 0.4 s.
  Message: the server does not change, yet response time grows **sharply / non-linearly**
  as ρ → 1 (it is a curve, not a line).
- **Impact of queues (slide 42):** if λ is close to μ the queue builds up long and each job
  is delayed a long time. Contrast: with exactly periodic arrivals and exactly equal service
  times there is never a queue as long as λ < μ (video: a job every 2 s with 1 s average
  service → no queue). **Aim to keep load ρ at the bottleneck resource below 0.8, say**, so
  no resource gets saturated.
- **Heavy-tailed distributions (slide 43):** distributions spread more from the average give
  longer queues and worse response times; especially serious for power laws where a few
  extremely big jobs clog the system (video: mostly 10 ms requests but occasionally a
  30 s one blocks many short jobs behind it). Diagram: left = evenly spaced arrivals and
  equal services, "no queue"; right = bunched arrivals and long services, some jobs "wait".

### Maths refresher (slides 12-21)

- Inequalities: transitive; add X to both sides; add two inequalities; multiply by X > 0;
  if 0 < A < B then 1/B < 1/A. Used to derive upper/lower bounds (e.g. utilisation
  cannot exceed 100%).
- Probability: P(A) in [0,1]; P(not A) = 1 − P(A); P(A and B) = P(A)P(B) if independent;
  P(A or B) = P(A)+P(B)−P(A and B). Random variable gives a number to each case; expected
  value E(X) = Σ X(case)·P(case). Uniform (all values equally likely); binomial (successes in
  n attempts, E = np).
- Continuous cases: probability density function. Normal (μ, σ; symmetric; E = μ; many real
  situations), **exponential** (parameter λ; **E = 1/λ**; memoryless — time between events
  when the past has no impact), **Poisson** (count of events when inter-event gaps are
  exponential; approximates binomial when np = λ, n big, p small; **E = λ**).
  The pdf/probability formulas for normal, exponential and Poisson are marked
  **NON-EXAMINABLE** on the slides — do not ask formula recall.
- Video framing: the operational quantities (D, R, X) are **averages / long-run
  quantities**, not a claim that every request behaves that way; probability enters as an
  assumption about how arrivals are distributed (e.g. 10 requests/s but distributed how?).

### Other slide facts

- Outline slide lists Availability as the next topic (types of faults and failures,
  estimating reliability and availability, techniques for dealing with failure) — Week 9 is
  a self-study week (see section 2).
- Slide 45: "Lab/Tutorial W8: RESTful Web Services"; "Lecture W10 (Oct. 13): Professional
  pathway towards software architect". Slide 44 summary: typical closed-system analysis =
  identify resources → D_i for each → D and D_max → high-load (and sometimes low-load)
  bounds → identify the bottleneck; if arrivals/services are exponential-like, estimate
  queue delay T_wait = ρ/(μ(1−ρ)).
- Further reading (not examinable): Menasce/Almeida/Dowdy "Performance by Design";
  Schroeder/Wierman/Harchol-Balter "Open versus Closed"; Harchol-Balter queueing text.

### Tutorial 8 — RESTful payroll service (Parts A-D)

Adapted from spring.io/guides/tutorials/rest. Payroll service manages a company's
employees, stored in PostgreSQL via JPA and exposed through a Spring MVC layer. Required
operations: list employees; view one by ID; add; update by ID; delete by ID. When designing
REST interfaces think about **resources, the URIs identifying them, and the HTTP
operations each supports**.

- **Part A (Table 1: Resource / URI / HTTP operations):** the tutorial's own hint — POST a
  new "Employee" to "/Employees", but the actual URI of the created employee includes its
  unique identifier ("/Employees/292"), which is then used with GET and PUT. Model answer
  (matches the provided code):
  - Employee collection — `/employees` — **GET** (list all), **POST** (create a new one).
  - Single employee — `/employees/{id}` — **GET** (view), **PUT** (update/replace),
    **DELETE** (remove).
  - The provided controller additionally maps **DELETE `/employees`** = delete all
    employees (used by the React "Remove All" button).
- **Part B (provided solution, `EmployeeController.java`):**
  - `@GetMapping("/employees")` → `findAll()`; `@PostMapping("/employees")` → `newEmployee(
    @RequestBody EmployeeDTO)`; `@GetMapping("/employees/{id}")` → `one(id)`;
    `@PutMapping("/employees/{id}")` → sets `newEmployeeInfo.id = id` from the path then
    `updateEmployeeDetails`; `@DeleteMapping("/employees/{id}")` → `ResponseEntity.noContent()`
    (**204 No Content**), or **500** if an exception occurs; `@DeleteMapping("/employees")`
    → delete all, same 204/500.
  - **The base POST handler simply returns the created `EmployeeDTO` (default 200 OK) — it
    does not set 201 Created or a Location header.** (Lecture quiz Q2 states the proper
    REST practice: 201 + Location. Do not present the base code as if it did that.)
  - Missing employee → `EmployeeNotFoundException("Could not find employee " + id)`,
    turned into **404 Not Found** with that message by `EmployeeNotFoundAdvice`
    (`@RestControllerAdvice`).
  - Layers: Controller → `EmployeeService` → `EmployeeRepository` (Spring Data JPA
    `JpaRepository<Employee, Long>`) → PostgreSQL; controller talks in **`EmployeeDTO`**
    (fields `id`, `name`, `role`, annotated `@JsonInclude(NON_NULL)` so null fields are
    left out of the JSON), the entity `Employee` has `@Id @GeneratedValue Long id`, `name`,
    `role` (the **server assigns the id**).
  - `LoadDatabase` preloads two employees (Bilbo Baggins / burglar, Frodo Baggins / thief).
    Expected GET response: `{"id": 1, "name": "Bilbo Baggins", "role": "burglar"}`.
  - `@CrossOrigin(origins = "http://localhost:3000")` lets the React app call the API;
    server runs on port 8080.
  - Test GET/PUT/POST/DELETE using IntelliJ's HTTP request tool or Postman.
- **Part C (React front end):** complete `EmployeeDataService` in
  `react/src/services/employee.service.js` using axios (`http-common.js` sets
  `baseURL: "http://localhost:8080/"`, JSON content type). Methods: `getAll()`, `get(id)`,
  `create(data)`, `update(id, data)`, `delete(id)`, `deleteAll()` — i.e. CRUD (Create,
  Read, Update, Delete) mapped to POST, GET, PUT, DELETE:
  `getAll` → GET `/employees`; `get(id)` → GET `/employees/{id}`; `create(data)` → POST
  `/employees`; `update(id, data)` → PUT `/employees/{id}`; `delete(id)` → DELETE
  `/employees/{id}`; `deleteAll()` → DELETE `/employees`. The skeleton has empty method
  bodies, so running the React app before completing it gives an error. Components (list /
  detail, add, edit) use `name` and `role`.
- **Part D (new requirement, backward compatibility):** the system is live, many
  enterprises adopted it; now the employee's name must be split into **firstName** and
  **lastName**. The straightforward fix — replace `name` with firstName/lastName — forces
  **all existing systems offline for the update**; the tutorial asks for a better,
  **backward-compatible** solution that keeps existing functionality working, verified by
  running the Part C React app (which still reads/writes `name`). The tutorial gives no
  solution code; the standard approach (inference, consistent with the brief) is an
  **additive change**: keep `name` and add optional `firstName`/`lastName`; old clients that
  only know `name` keep working (and tolerate unknown/extra fields), new clients use the new
  fields; the server derives one from the other (e.g. split `name` on write from an old
  client; compose `name` from first + last for old readers). Existing records and clients
  are not broken and nothing has to go offline.

---

## 2. Important points only in the video

- **Exam format announcement** (start of recording; recorded in `assessment_overview.md`):
  mostly **multiple-choice**, **some fill-in-the-blank**, and **some short-answer scenario
  questions** where you are asked to **design a specific architecture**. Practical example
  questions will be provided closer to the exam ("we'll talk about more on that in a couple
  of weeks"). Because the School has a **hurdle** on the final exam, the lecturer will
  **not make it difficult** — aim is that most students at least pass the hurdle.
- **Assignment 1** is due/closed; the similarity report appears in Canvas immediately after
  a PDF is submitted through Turnitin; a handwritten/scanned version may not produce one.
  **No simple extensions** in this unit (sufficient time given); if something urgent or
  unexpected happens, apply for **Special Consideration**.
- **Week 9:** no live lecture (public holiday). The lecturer will post a shorter chapter on
  **availability prediction and calculation** plus notes and **practice quizzes** for
  self-study; the Week 9 tutorials become **drop-in** sessions (any tutorial slot; questions
  on previous lecture content welcome).
- **Lecture 10 (slide 45, Oct 13):** professional pathway towards software architect.
- Framing of today: week 5 was the concepts (throughput, response time, saturation); today
  is "one step further — calculation and **prediction before we deploy**". Three
  prediction approaches: extrapolation, simulation, analytical.
- Lecturer's "why this maths": bounds need inequalities (a resource cannot be more than
  100% busy — an upper bound on throughput); quantities such as service demand and response
  time are averages/long-run; probability is an assumption about arrival patterns.
- Verbal walk-through of D_i: a request may use the CPU first, then the database, then the
  CPU again; for each resource find V, S and the rest; D "tells us how much of device i is
  consumed by one complete job on average — actual time using the device".
- Verbal worked examples (all consistent with slides, corrected here):
  - CPU V = 2, DB V = 3, S = 20 ms each → D_CPU = 40 ms, D_DB = 60 ms; "the database will
    be the first to saturate and might become the bottleneck".
  - 20 clients, Z = 5 s, X ≈ 3.92 → R = 0.1 s ≈ D = 0.04 + 0.06 → "no queuing".
  - Forced flow: X = 10 jobs/s, DB visited 3 times per job → X_DB = 30 visits/s
    (lecturer stressed the confusing part is the meaning of the symbols: V_i = how many
    times a job interacts with that resource).
  - Service demand law: at X ≈ 16-17 jobs/s the DB becomes the bottleneck; at 10 jobs/s both
    CPU and DB are below full utilisation.
  - High-load bound: maximum utilisation 1 and D_DB = 0.06 → X ≤ 1/0.06 (≈ 16.7 jobs/s).
  - Low-load bound: D = sum of all D_i = 0.1 s; "response time can never be less than the
    actual amount of service work"; low load is limited by how much actual work one request
    needs, high load by the bottleneck.
  - Planning: manager says average R < 2 s; D_max = 0.06 s, Z = 5 s; N ≤ 116 clients. He
    stressed it is an average/expected-value estimate, "not a guarantee", "beyond roughly
    this point the high-load bound itself violates the requirement."
  - Redesign: address the identified bottleneck (database) first — not the easiest
    component to change; if that fails, move work elsewhere, reduce visits, add parallel
    capacity. Common mistake: reusing numbers that have changed (with more clients D_i stays
    the same but X_i and U_i change).
  - M/M/1: first M = Poisson arrivals, second M = exponential service, 1 = one server.
    ρ = λ/μ (server capacity 10/s, 8 requests/s arriving → ρ = 0.8, "80% utilised").
    Response time grows sharply near saturation "and we do not change the server at all"
    (μ = 10/s, λ = 5, 8, 9, 9.5 → 0.2, 0.5, 1.0, 2.0 s). Periodic-arrival contrast (a job
    every 2 s, average job 1 s → no queue) versus bunched random arrivals (a job must
    wait). Heavy tail: "most requests 10 ms, sometimes 30 s".
  - Summary: "make yourself familiar with those calculations."
- **Transcript errors — do not trust:** "192nd client" (should be 116/≈116), "CPU service
  demand is 0.4, database 0.7 and 0.6" and "0.06 CPU" (should be CPU 0.04, DB 0.06, sum
  0.10), "little small" (= Little's law), "Menti", "gat" (= GET), "2.0" = 2xx success
  status, "transport nature" (= transport neutrality). The convoy example ("two customers
  per second", "five minutes", result "10") has unclear units.

---

## 3. Lecture-quiz questions (Mentimeter, start of lecture)

Slide 5 is a "Menti time!" slide (audience joins by QR code). Five questions were put to the
class; the **answer options were not visible in the recording or slides** (transcript has
only the lecturer's spoken question stems and his answers), so the question wording below is
the lecturer's spoken stem as transcribed, and options must be written by the author.
All five revise Week 7 (REST vs WS-*). Recording quotes are auto-transcribed and noisy.

1. **"Which HTTP method is safe (as well as idempotent)?"** (transcript: "which HTTP might
   be safe as well as ...")
   - Lecturer's answer: **GET** ("strictly GET"). Reasoning: if you read something, no
     matter how many times you request it you get the same answer; the keyword is
     *identity* — repeated GET returns the same representation and does not affect the
     resource. He "didn't expect a lot of students doing wrong on this question" — POST
     "is a bit different from GET".
   - Facts for distractors (user's notes): GET = safe and idempotent; PUT = idempotent but
     **not** safe (replaces a resource; repeating leaves the same state); DELETE =
     idempotent but **not** safe; POST = neither safe nor idempotent (repeating can create
     duplicates).

2. **"A client POSTs a new order and the server assigns its URL (the resource identifier).
   What should the response be?"** (transcript: "A client post a new order and server
   designs its URL...")
   - Lecturer's answer: a success response meaning **created (201 Created; he says "2.0"
     for 2xx)**, and because the server assigns the URL, the new order's URI is returned in
     the **Location** header ("this order will be created with a specific location").
     He also flagged a distinction about the first answer option saying the order itself is
     not echoed in the body ("it's a bit tricky ... some distinction that we should be
     aware of"). The user's brief: do **not** make the question hinge on the body; keep the
     correct option about 201 + Location, distractors like 200 OK with no location, 204,
     redirects.

3. **"When we say a service is stateless, what does that mean?"**
   - Lecturer's answer: the server **does not keep any conversation between requests
     (sessions/conversations)** — no session state is held on the server between calls;
     each request carries everything needed to process it. ("Yeah, this is good.")

4. **A question about XML with an "envelope and body"** (transcript: "whenever we're saying
   so, this is based on XML. And in XML, we will provide some envelope with body and so
   on. So that's the right answer in the XML inside the sort of envelope"). Full stem not
   audible.
   - Lecturer's answer: **SOAP** (XML message with an envelope, containing header and body).
     Suggested self-contained wording: "Which message structure is an XML envelope with a
     body?"

5. **"Which capability do WS-* (SOAP) standards provide that REST does not?"** (transcript:
   "Which capacity is WS standard for by the rest does not?"; lecturer: "This is a bit
   tricky.")
   - Lecturer's answer: **transport neutrality** (message can be carried over any
     transport/format) **and support for distributed transactions** (WS-AtomicTransaction
     style). The other options — **caching** and **uniform interface** — are things REST
     *does* provide. A student asked why REST "does not provide a uniform interface"
     (i.e. picked it); the lecturer said "I know this one is a bit difficult" and would
     revisit in lecture / in person. He offered to add more similar quizzes after the
     lecture.

(Leaderboard/prizes for the top students followed the quiz — administrative only.)

---

## 4. Post-lecture Q&A (informal, tail of the recording)

- A student clarified the **similarity report** issue: if you submit a handwritten/scanned
  version of Assignment 1 you may not get a similarity report (teacher: "I was not aware of
  that; thank you for the clarification"). Either typed or handwritten format is fine for
  submission — "no preference".
- **Group work:** the lecturer wants everyone to master the whole system, no matter which
  component each member built — you should know how the whole system works and be able to
  explain the part a teammate did; that is fine for how the group divides work.
- Off-topic careers chat: opportunities at startups and how Australia differs (payment
  might be low / employers value interest and capability). No exam content.
- Nothing further about performance, REST or the exam was added in the tail.

---

## 5. Verified numbers (slides win over transcript)

All checked against the slide images and re-computed.

| Item | Value |
|---|---|
| CPU | V = 2, S = 20 ms → **D_CPU = 40 ms = 0.04 s** (μ_CPU = 50/s) |
| Database | V = 3, S = 20 ms → **D_DB = 60 ms = 0.06 s** (μ_DB = 50/s) |
| Total demand | D = 0.04 + 0.06 = **0.10 s**; D_max = **0.06 s** (DB = bottleneck) |
| Think time | Z = **5 s**; N varies (slide 29: N = 20) |
| 20-client example | X = 3.92 jobs/s → R = 20/3.92 − 5 ≈ **0.10 s** = D (no queueing); 3.92 = N/(D+Z) low-load bound |
| Forced flow | X = 10 jobs/s, V_DB = 3 → X_DB = **30 visits/s**; V_CPU = 2 → X_CPU = 20 visits/s |
| Service demand law | at X = 10: U_CPU = **0.4**, U_DB = **0.6** |
| DB saturation | 0.06·X ≤ 1 → **X ≤ 16.67 jobs/s** (slide 36); CPU at that X: 0.04 × 16.67 ≈ 0.67 |
| Low-load bounds | R ≥ D = 0.10 s; X ≤ N/(D+Z) = N/5.10 |
| High-load bounds | X ≤ 1/D_max = 16.67 jobs/s; R ≥ N·0.06 − 5 |
| Knee | N\* = (D+Z)/D_max = 5.10/0.06 = **85 clients** (user summary; not on slides) |
| Planning for R ≤ 2 s | N ≤ (2+5)/0.06 = 116.67 → **≈116 clients** (116 → 1.96 s; 117 → 2.02 s); an estimate, not a guarantee. The transcript's "192" is a speech-to-text error |
| M/M/1, μ = 10/s | λ = 5 → ρ 50% → T 0.20 s; λ = 8 → 80% → 0.50 s; λ = 9 → 90% → 1.00 s; λ = 9.5 → 95% → 2.00 s |
| M/M/1 at ρ = 0.8 (μ = 10) | N = 4 jobs, N_wait = 3.2, T = 0.5 s, T_wait = 0.4 s |
| Target load | keep bottleneck ρ below about **0.8** |
| Transcript slips | "CPU 0.4 / DB 0.7 / 0.6", "0.06 CPU", "192nd client" are wrong — slides: CPU 0.04, DB 0.06, sum 0.10, ≈116 clients |
| Not on slides (user notes) | knee N\*; L = λW alias of N = λT; HTTP safety table |

Question-authoring reminders from the extra brief: about two thirds of the paper on the
slide-24 calculations (numeric worked examples, formula recognition, spotting mistakes);
use `fillblank` for numbers/one-word formula terms (units stated in the prompt, plain
numbers, list accepted forms like "0.06"/".06"); also use match/sort/order (symbol→meaning;
HTTP methods safe / idempotent-not-safe / neither; bottleneck-analysis steps); every
question self-contained (numbers written in); Phase 1 = no typed short/scenario answers;
all five lecture-quiz questions must be included; about 6-8 tutorial-8 REST questions;
pass-the-hurdle difficulty, no trick wording.
