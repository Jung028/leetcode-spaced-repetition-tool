# COMP5348 Week 8 - Question Plan (Planner stage)

Sources: `week-8-notes.md`, `week-8-learning.md`, the extra brief (binding), `docs/exam-content-authoring-guide.md`,
`assessment_overview.md` (Final Exam Format), and earlier weeks (`week-4.ts`, `week-5.ts`, `week-6.ts`, `week-7.ts`).
Phase 1 is active: no `short` / `scenario` questions. Scenario-style thinking is written as `mcq` / `multi`.

## 0. Decisions (read first)

1. **Two papers**, per the guide: `WEEK_8_PAPERS = [TUTORIAL_PAPER, LECTURE_PAPER]`.
   - Paper 1 = "Week 8 Tutorial: RESTful Web Services (payroll)", **8 questions, one round, one card**. The caller asked for a
     small REST/tutorial set in one round. It is too small for a mixed-review round, so it deliberately has none, and it
     has fewer than ~10 why/what-if questions (it has 5). `check-exam-structure.ts` does not enforce either.
   - Paper 2 = "Week 8 Lecture: Predicting Performance and Queues", **50 questions, 8 card rounds + 1 mixed round**.
2. **Calculation weighting.** Rounds 1-6 (Q0-Q33, 34 questions) are entirely the "Work is done at different devices" family
   (D_i = V_i x S_i, mu_i = 1/S_i, lambda_i / X_i / U_i, Forced Flow, Service Demand Law, Little / interactive response time law,
   bounds, knee, planning N <= (R+Z)/D_max, redesign). Three more in the mixed round (Q44, Q46, Q48 recap the family) bring the family
   to 37 of 50 (a bit over two thirds). M/M/1 and prediction approaches (5) + the five lecture-quiz questions (5) + three
   earlier-week questions (Q45, Q47, Q49) cover the rest.
3. **Quota deviation (deliberate):** the brief wants numeric fill-in-the-blank practice, so the lecture paper has
   **7 fillblank, 2 match, 2 order, 2 sort = 13 new-format** (quota ~12, about 3 each) and **25 mcq, 10 multi, 2 truefalse**.
   Total 50 (ceiling 55). The tutorial paper adds 1 sort, 1 match, 1 fillblank.
4. **Fresh numbers everywhere.** Cards use the slide running example (CPU V=2 S=20 ms, DB V=3 S=20 ms, Z=5 s, N=20,
   X=3.92, X=10, N<=116, N*=85, M/M/1 mu=10). **No question reuses those numbers as its answer**; every question is a new
   example and states all of its own numbers. Writer: use the numbers below exactly, they are already double-checked.
5. **Option hygiene.** After writing, run `bun scripts/shuffle-week-options.ts exam-content/comp5348/week-8.ts` (positional
   bias) and `bun scripts/check-mcq-lengths.ts COMP5348` (keep all options the same length/detail; numeric options
   must carry the same shape, e.g. all "NN ms"). Then `bun scripts/check-exam-structure.ts` and `bun test`.
6. **modelAnswer style:** everyday analogy first (coffee shop with a cashier and a barista, a till with a queue), bullets
   with `• `, blank line between blocks, keep `()`, `=>`, `==`, `_` out of multi-line blocks (PromptText renders those as
   code). Every numeric answer shows the working in one bullet, and names the wrong-option mistake.
7. **Symbols:** write V_i as "Vᵢ" etc. in card text/answers (subscript characters are fine); in `fillblank` prompts state the
   unit and accept plain numbers only.

---

## 1. Notation used in questions (all numbers are new; verified)

| Symbol | Meaning |
|---|---|
| V_i, S_i, D_i = V_i x S_i | visits per job, service time per visit (device time only, no waiting), demand per job |
| mu_i = 1/S_i; lambda_i; X_i; U_i = lambda_i x S_i | rate the device could do; arrival rate; completed rate; fraction busy |
| X_i = V_i x X; U_i = D_i x X | Forced Flow Law; Service Demand Law |
| N = lambda T; R = N/X - Z | Little's law; interactive response time law |
| low load: R >= D, X <= N/(D+Z); high load: X <= 1/D_max, R >= N x D_max - Z; knee N* = (D+Z)/D_max | bounds |
| planning: N <= (R_target + Z)/D_max, round DOWN | scale planning |
| M/M/1: rho = lambda/mu; N = rho/(1-rho); T = 1/(mu(1-rho)); T_wait = rho/(mu(1-rho)) | queue |

---

## 2. Reading cards (lecture paper; 100-150 words each, teenager style, analogy first, worked example, jargon decoded)

Cards teach the idea with the **slide running example** (coffee shop: cashier = CPU visited 2x, barista = DB visited 3x, 20 s
per visit; Z = 5 s). Questions apply the idea to different numbers. Cards must **not** contain the answer to any question
(no card may show "D = 4 x 15", the K system, the Shop system, etc.).

| Card | Placed before | Title | Must carry (formulas / facts the questions rely on) | Diagram |
|---|---|---|---|---|
| C1 | Q0 | Work per job at each device | job vs visit; V_i, S_i (excludes waiting), D_i = V_i x S_i in seconds/job; biggest D_i = bottleneck; total D = sum; D_max. Example CPU 0.04, DB 0.06, D 0.10 | none |
| C2 | Q5 | How busy is a device? | mu_i = 1/S_i (50/s for 20 ms); lambda_i; X_i = lambda_i when it keeps up; U_i = lambda_i x S_i (never above 1); example 30 visits/s at S=20 ms -> 0.6 | none |
| C3 | Q10 | From one device to the whole system | Forced Flow X_i = V_i x X; Service Demand Law U_i = D_i x X (also "Bottleneck Law"); U <= 1 gives X <= 1/D_i; example X=10 jobs/s -> DB 30 visits/s, U_CPU 0.4, U_DB 0.6, cap 16.67 | flowchart: Client -> CPU (V=2) -> DB (V=3) -> Client |
| C4 | Q16 | Little's law and the interactive response time law | N = lambda T (alias L = lambda W, same law); closed system N clients each cycle R + Z; N = X(R+Z) so R = N/X - Z; example N=20, Z=5, X=3.92 -> R 0.10 ~ D 0.10 means no queueing; one client's cycle | flowchart: Think for Z -> Send request -> Wait for reply R -> back to Think |
| C5 | Q22 | The two bounds and the knee | low-load bounds R >= D, X <= N/(D+Z); high-load bounds X <= 1/D_max, R >= N x D_max - Z; real values hug the low-load line when few clients and the high-load line when many; knee N* = (D+Z)/D_max where they cross; example D=0.10, D_max=0.06, Z=5 -> 16.67 jobs/s, N*=85 | learning-guide flowchart (find D_i -> add up D, pick D_max -> apply bounds -> bottleneck) |
| C6 | Q28 | Planning for scale and redesign | N <= (R_target + Z)/D_max, round down; example R<=2, D_max 0.06, Z 5 -> 116; it is an average-based planning estimate, not a promise per client; redesign = shrink D_max (move work, add devices, cut visits, faster device); a new bottleneck then appears; common mistake: re-using an old X_i or U_i after N changes (D_i unchanged, X_i and U_i change) | none |
| C7 | Q34 | Predicting before you deploy, and one queue | three ways to predict: extrapolation (fit a curve to measurements: fine between measured points, risky beyond them because behaviour changes sharply at capacity), simulation (hard to build/parameters), analytical models (maths on averages; operational laws are the focus). Closed system (N, Z) vs open (lambda). M/M/1: rho = lambda/mu, N = rho/(1-rho), T = 1/(mu(1-rho)), T_wait = rho/(mu(1-rho)); example mu=10: rho 0.5 -> 0.20 s, 0.8 -> 0.50 s, 0.9 -> 1.00 s, 0.95 -> 2.00 s; keep bottleneck load below about 0.8; heavy tails (a few huge jobs) make it worse. (Tight: keep to 150-190 words; drop closed/open to one clause if needed.) | none |
| C8 | Q39 | Recap: REST and SOAP in one glance | **Analogies only**, no verb-to-answer mapping: reading a menu (changes nothing) vs setting a thermostat to 21 (same result however often) vs pressing "add a sandwich" (repeat = extra sandwich); a waiter who forgets you between visits so each order slip carries everything; a letter in an envelope with a body; REST is a style built on the web (URIs, cached pages, a uniform interface); the Week 7 WS-* family adds extras on top | none |

Tutorial paper card (T-C1, before T0): safe vs idempotent (analogies as in C8 **plus the verb table**: GET safe+idempotent;
PUT, DELETE idempotent not safe; POST neither); payroll design: collection `/employees` (GET list, POST create), item
`/employees/{id}` (GET, PUT, DELETE); nouns not verbs in URIs; POST returns the new id chosen by the server; 404 for a
missing employee; backward compatible = additive change (keep `name`, add optional `firstName`/`lastName`).

---

## 3. LECTURE PAPER (paperNumber 2) - question by question

Format tags: MCQ / MULTI (select-all) / TF / FILL (`fillblank`) / MATCH / ORDER / SORT. "WHY" = counts toward the ">=10 why /
what-if" requirement. The correct option index is left to the Writer (spread over 0-3, then run the shuffle script).
For every numeric question the exact numbers and the answer are given; the distractor list names the mistake it models.

### Round 1 (card C1) - Q0-Q4: demand per job, D_i = V_i x S_i

- **Q0 MCQ (WHY: D uses S, not waiting).** A job visits the disk 4 times. Each visit takes 15 ms of actual disk service and
  waits on average another 25 ms in the queue. What is D_disk? **Answer 60 ms** (4 x 15).
  Distractors: 160 ms (4 x (15+25), counts queueing), 19 ms (4+15), 3.75 ms (15/4). All "NN ms".
- **Q1 FILL.** "A job visits the CPU 5 times and each visit needs 8 ms of service. D_CPU = ___ ms." blanks `[["40"]]` (also "40.0").
- **Q2 MCQ (scenario, bottleneck).** Web server V=1, S=30 ms; app server V=2, S=12 ms; database V=6, S=6 ms. Which is the
  bottleneck? **Database** (D = 36 ms; web 30 ms; app 24 ms; total D = 90 ms). Distractors: web server (biggest S per visit),
  app server (middle), "all three, because they share the same total D". Model answer must show all three D values.
- **Q3 MULTI.** Devices P (V=2, S=25 ms), Q (V=5, S=8 ms), R (V=10, S=4 ms) -> D_P=50, D_Q=40, D_R=40 ms, total 130 ms.
  Statements (5): (a) P has the largest D and is the bottleneck TRUE; (b) Q and R have the same D TRUE; (c) total D = 130 ms TRUE;
  (d) Q has the larger D than P because it is visited more often FALSE; (e) R has the smallest D because its S is the smallest FALSE.
  Correct = a, b, c.
- **Q4 MCQ (WHY, spot the mistake).** A student computes D = V / S = 4 / 0.005 = 800 for a device with V=4, S=5 ms. What is the
  error? Correct: D must be V x S = 4 x 5 ms = 20 ms (multiply, not divide). Distractors: "D should be V + S = 4.005", "D should
  be S / V = 1.25 ms", "D is right, but its unit should be visits per second". Reference: 800 has no time unit.

### Round 2 (card C2) - Q5-Q9: rates at one device

- **Q5 FILL.** "A disk needs S = 4 ms (0.004 s) per visit. Its service rate is mu = ___ visits per second." blanks `[["250"]]`.
- **Q6 MCQ.** Visits arrive at a device at lambda = 120 per second; S = 5 ms. Utilisation? **60%** (120 x 0.005 = 0.6).
  Distractors: 40% (idle fraction, 1 - 0.6), 24% (120 / 5, dividing), 600% (used 5 instead of 0.005).
- **Q7 MCQ (WHY / what if).** A device has mu = 40 visits/s but 50 visits/s arrive (S = 25 ms so U would be 1.25). What happens?
  Correct: it saturates, is busy 100% of the time, completes only about 40 visits/s and the waiting line keeps growing.
  Distractors: runs at 125% and completes 50/s; completes 50/s because X always equals lambda; its S falls to 20 ms so it copes.
- **Q8 MULTI.** Device with S = 25 ms, lambda = 16 visits/s. (a) mu = 40/s TRUE; (b) U = 0.4 TRUE; (c) if it keeps up its X = 16/s TRUE;
  (d) U = 16 / 0.025 = 640 FALSE (divides); (e) a device with S = 50 ms has mu = 50/s FALSE (it is 20/s). Correct a, b, c.
- **Q9 MATCH (definitions -> match).** 6 pairs: V_i -> "visits one job makes to device i"; S_i -> "service time for one visit,
  not counting waiting"; D_i -> "total service time one job needs from device i"; mu_i -> "visits per second the device could
  finish if it never idled"; lambda_i -> "visits per second arriving at device i"; U_i -> "fraction of time the device is busy".
  Decoys (2): "average time from request to reply for the whole job", "time a client waits between a reply and its next request".

### Round 3 (card C3) - Q10-Q15: Forced Flow and the Service Demand Law

- **Q10 FILL.** "The whole system completes X = 6 jobs per second and each job makes 4 visits to the cache server. The cache
  server's throughput is X_cache = ___ visits per second." `[["24"]]`.
- **Q11 MCQ.** X = 15 jobs/s and D_app = 0.03 s. Utilisation of the app server? **45%** (0.03 x 15 = 0.45).
  Distractors: 0.2% (0.03 / 15), 500% (15 / 0.03), 55% (idle fraction).
- **Q12 MCQ.** D_DB = 0.04 s. Highest throughput the system can reach before the DB is 100% busy? **25 jobs/s** (0.04 x X <= 1).
  Distractors: "0.04 jobs/s" (D itself), "40 jobs/s" (1 / S with S = 25 ms), "2.5 jobs/s" (mis-scaled by 10). All "N jobs/s".
- **Q13 MCQ (scenario; promptDiagram flowchart Client -> Web V=1 -> App V=3 -> DB V=5).** "Shop" system: Web V=1, S=15 ms;
  App V=3, S=10 ms; DB V=5, S=8 ms. D_web=0.015, D_app=0.030, D_DB=0.040 (total 0.085). At X = 20 jobs/s: U_web=0.3, U_app=0.6,
  U_DB=0.8. Correct: "all below saturation, the DB is the busiest at 80%". Distractors: "DB is saturated because it gets 5 x 20 = 100
  visits/s" (X_DB is a rate, its mu is 125/s so it is not saturated); "web is busiest because it has the longest time per
  visit (15 ms)"; "total utilisation 0.3+0.6+0.8 = 1.7 so the system is overloaded" (utilisation is per device, not summed).
- **Q14 MULTI (spot the mistake).** X = 12 jobs/s, V_DB = 2, D_DB = 0.05 s (S = 25 ms). (a) X_DB = 24 visits/s TRUE; (b) U_DB = 0.6 TRUE;
  (c) max system throughput is 20 jobs/s TRUE; (d) "U_DB = 0.05 x 24 = 1.2, so the DB is overloaded" FALSE (D must be paired with
  system X, not X_DB); (e) X_DB = 12 / 2 = 6 visits/s FALSE (Forced Flow multiplies). Correct a, b, c.
- **Q15 TF (WHY).** "When system throughput doubles from 8 to 16 jobs/s, the service demand D_i of each device also doubles."
  **False**: D_i = V_i x S_i depends on the job and the device, not on load; U_i and X_i double, D_i does not.

### Round 4 (card C4) - Q16-Q21: Little's law and R = N/X - Z

- **Q16 FILL.** N = 40 clients, Z = 6 s, X = 5 jobs/s. "R = ___ seconds." `[["2","2.0","2.00"]]` (40/5 - 6).
- **Q17 MCQ (spot the mistake: forgetting Z).** N = 60 clients, Z = 3 s, measured R = 1.5 s. Throughput? **13.3 jobs/s** (60 / 4.5).
  Distractors: 40 (60 / 1.5, ignores Z), 20 (60 / 3, ignores R), 90 (60 x 1.5).
- **Q18 MCQ (Little's law, non-closed wording).** A server has on average N = 30 requests in flight and completes lambda = 60
  requests per second. Average time each request spends in the server? **0.5 s** (N = lambda T, T = 30/60).
  Distractors: 2 s (60/30), 1800 s (30 x 60), 90 s (30 + 60).
- **Q19 MCQ (WHY: what the number tells you).** D = 0.30 s in total. N = 30 clients, Z = 10 s, measured X = 2.9 jobs/s.
  R = 30/2.9 - 10 = 0.345 -> **about 0.34 s, slightly above D, so little queueing.** Distractors: R about 10.3 s (forgot to subtract
  Z, heavy queueing); R about 0.34 s "below D so the measurement must be wrong" (it is above); R about 0.09 s (D / something).
  Keep options equal length.
- **Q20 MULTI.** N = 25, Z = 5 s, X = 4 jobs/s. (a) R = 25/4 - 5 = 1.25 s TRUE; (b) N = X x (R+Z) = 4 x 6.25 = 25 TRUE;
  (c) R = 25/4 = 6.25 s FALSE (that is R + Z); (d) X = N/(R+Z) = 4 TRUE; (e) R = N x X - Z = 95 FALSE. Correct a, b, d.
- **Q21 ORDER (process).** One client's cycle in a closed system, authored in this correct order (4 steps): 1 "The client finishes
  thinking and sends a request" 2 "The request queues for and is served by the devices" 3 "The reply arrives back at the client"
  4 "The client thinks for Z seconds before sending the next request". Model answer: steps 2-3 together are R, step 4 is Z, so
  one cycle is R + Z and N = X x (R + Z). (WHY the interactive law counts the clients too.)

### Round 5 (card C5) - Q22-Q27: bounds and the knee. **System K (used in Q22-Q26):** CPU D=0.06 s, DB D=0.10 s, Disk D=0.04 s;
D = 0.20 s, D_max = 0.10 s (DB), Z = 10 s. State the D_i values in every question that needs them.

- **Q22 FILL.** "High-load bound: X <= ___ jobs per second." `[["10","10.0"]]` (1/0.10).
- **Q23 MCQ.** N = 30 clients. Which upper bound on X is the smaller and what is it? **Low-load bound N/(D+Z) = 30/10.2 = 2.94 jobs/s.**
  Distractors: high-load bound 10 jobs/s; "N/Z = 3.0 jobs/s" (drops D); "1/D = 5 jobs/s" (uses total D instead of D_max).
  All shaped "the ... bound, X value".
- **Q24 MCQ (spot the mistake).** Knee point N*. **102 clients** (10.2 / 0.10). Distractors: 100 (Z / D_max, drops D), 2 (D / D_max),
  51 (10.2 / 0.20, uses D instead of D_max).
- **Q25 MCQ (WHY / what if).** N = 150, well above the knee. Lower bound on average R from the high-load bound? **5 s** (150 x 0.10 - 10).
  Distractors: 0.20 s (low-load bound, applies only when few clients), 15 s (forgot -Z), 25 s (added Z instead).
- **Q26 MULTI.** Using System K: (a) at N = 20 real R is close to D = 0.20 s TRUE; (b) at N = 300 real X is close to 10 jobs/s TRUE;
  (c) at N = 300, R >= 300 x 0.10 - 10 = 20 s TRUE; (d) at N = 300 the low-load bound N/(D+Z) is the one closest to real X FALSE;
  (e) adding clients beyond the knee raises X noticeably FALSE. Correct a, b, c.
- **Q27 SORT (classification).** Groups: ["Low-load bound", "High-load bound"]; items (6): "R >= D" (0); "X <= N/(D+Z)" (0);
  "Real values sit close to this line when there are few clients" (0); "X <= 1/D_max" (1); "R >= N x D_max - Z" (1);
  "Real values sit close to this line when there are many clients" (1).

### Round 6 (card C6) - Q28-Q33: planning for scale and redesign

- **Q28 FILL.** D_max = 0.04 s, Z = 6 s, target average R <= 2.5 s. "The largest number of clients the plan allows is N = ___
  (round down to a whole number)." `[["212"]]` ((2.5+6)/0.04 = 212.5; check 212 x 0.04 - 6 = 2.48, 213 -> 2.52).
- **Q29 MCQ.** D = 0.10 s total, D_max = 0.08 s, Z = 5 s, target R <= 1 s. Max clients? **75** ((1+5)/0.08).
  Distractors: 60 (uses total D: 6/0.10), 50 ((Z-R)/D_max sign slip), 12 (R / D_max, forgets Z).
- **Q30 MCQ (WHY, planning estimate).** After finding N <= 75 for R <= 1 s, a manager says "so client number 75 is guaranteed a
  response in one second or less." Best reply: **No, it is a planning estimate from averages and a bound; it says beyond roughly 75
  clients the average target cannot be met, not that any single request will be fast enough.** Distractors: "Yes, the bound is exact
  for every request"; "No, because the bound ignores think time Z"; "Yes, but only if D_max is measured in milliseconds".
- **Q31 MULTI (redesign).** System: Web D=0.02, App D=0.05, DB D=0.08 (X <= 12.5 jobs/s now). Which changes RAISE the maximum
  throughput bound? (a) cache reads so DB visits per job halve (D_DB 0.04) TRUE; (b) move half the DB work to a second identical
  DB (D per DB 0.04) TRUE; (c) buy database storage 30% faster (D_DB 0.056) TRUE; (d) replace the web server with one twice as
  fast FALSE; (e) increase the think time Z FALSE. Correct a, b, c.
- **Q32 MCQ (WHY: the bottleneck moves).** Same system, after option (a) D_DB = 0.04, D_App = 0.05, D_Web = 0.02. New maximum throughput?
  **20 jobs/s** (bottleneck is now the App server, 1/0.05). Distractors: 25 jobs/s (1/0.04, forgets the bottleneck moved),
  12.5 jobs/s (unchanged), 50 jobs/s (1/0.02, web).
- **Q33 ORDER (process; answerDiagram not needed).** Steps of a bottleneck analysis, correct order (5): "Identify the resources (devices) a job uses"
  -> "Find V_i and S_i and compute D_i = V_i x S_i for each" -> "Add up D and pick out D_max" -> "Apply the low-load and high-load bounds"
  -> "The device with D_max is the bottleneck, so redesign there first".

### Round 7 (card C7) - Q34-Q38: predicting before deploying, closed/open, M/M/1

- **Q34 MCQ (prediction approaches).** A team measured average response time at 10, 20 and 30 clients and fits a curve. Which
  statement is right? **The estimate for 25 clients (between measurements) is trustworthy; the one for 400 clients is risky
  because behaviour changes sharply once a device saturates.** Distractors: both equally reliable; 400 reliable and 25 not;
  neither, curve fitting never works. Options same length.
- **Q35 MCQ.** M/M/1 with mu = 20 jobs/s, lambda = 16 jobs/s: rho = 0.8. Average time in the system T? **0.25 s** (1/(20 x 0.2)).
  Distractors: 0.05 s (1/mu, service only), 0.20 s (T_wait, waiting only), 5 s (1/(1-rho), forgot mu).
- **Q36 FILL.** M/M/1: lambda = 18/s, mu = 20/s. "Average number of jobs in the system N = ___." `[["9","9.0"]]` (rho = 0.9, 0.9/0.1).
- **Q37 MULTI (WHY: non-linear).** M/M/1, mu = 50/s. (a) at lambda = 40, rho = 0.8 and T = 0.10 s TRUE; (b) at lambda = 48, rho = 0.96 and
  T = 0.50 s TRUE; (c) at lambda = 40 there are 4 jobs in the system on average TRUE; (d) raising lambda from 40 to 48 (20% more)
  raises T by about 20% FALSE; (e) since mu never changes, T is the same at both loads FALSE. Correct a, b, c.
- **Q38 TF (WHY).** "If a few jobs are enormous (heavy-tailed service times) but the average service time is unchanged, queues and
  response times get worse." **True** (variability, one big job blocks many small ones behind it).

### Round 8 (card C8) - Q39-Q43: the five Mentimeter lecture-quiz questions (MANDATORY, none dropped)

Options written by the Writer, close distractors, every option the same length. The question stem is self-contained.

- **Q39 MCQ = Lecture quiz 1.** "Which HTTP method is safe (as well as idempotent)?" Correct **GET**. Distractors PUT, DELETE, POST
  (PUT/DELETE idempotent not safe, POST neither). WHY in the model answer: repeated GET returns the same representation and does not
  change the resource.
- **Q40 MCQ = Lecture quiz 2.** "A client POSTs a new order and the server assigns the order's URL. What should the response be?"
  Correct: **201 Created with a Location header holding the new order's URL.** Distractors: 200 OK with no location; 204 No Content
  with no location; a redirect (e.g. 303 See Other) back to the collection. Do NOT hinge on whether the body echoes the order.
- **Q41 MCQ = Lecture quiz 3 (WHY).** "When we say a service is stateless, what does that mean?" Correct: **the server keeps no session
  or conversation state between requests, so each request carries everything needed.** Distractors: the service has no database;
  the service never changes its data; the client keeps no cache.
- **Q42 MCQ = Lecture quiz 4.** "Which message structure is XML with an envelope containing a header and a body?" Correct **a SOAP
  message.** Distractors: a REST resource representation, a gRPC Protobuf message, a plain JSON payload with headers.
- **Q43 MULTI = Lecture quiz 5.** "Which capabilities do WS-* (SOAP) standards give that REST does not?" Options (4): transport
  neutrality TRUE; support for distributed transactions (WS-AtomicTransaction style) TRUE; caching FALSE (REST has it); a uniform
  interface FALSE (REST has it). Correct = the first two. Model answer notes the uniform interface is REST's own core feature.

### Round 9 (NO card) - Q44-Q49: mixed review, 3 earlier-week questions, no more than 2 consecutive on a subtopic

Order alternates week 8 / earlier week so the rule holds.

- **Q44 MCQ (week 8, Forced Flow + Service Demand jumbled).** X = 7 jobs/s, each job visits the DB 4 times, S_DB = 25 ms, so D_DB = 0.1 s
  and X_DB = 28 visits/s. Utilisation of the DB? **70%** (0.1 x 7). Distractors: 17.5% (used S not D), 28% (mixed X_DB up with U),
  280% (D x X_DB double-counts the visits).
- **Q45 MCQ (WEEK 5: admission control / thrashing; WHY).** "A database completes the most orders per minute at 40 concurrent jobs and
  completes fewer and fewer as more are admitted. What does admission control do?" Correct: **cap concurrent jobs near 40 and queue
  or reject the rest.** Distractors: admit every job so none is lost; add more clients to keep the CPU busy; double the think time
  Z for all clients. Connects to the knee in this week.
- **Q46 SORT (week 8, slide 37 warning).** Groups ["Stays the same when more clients of the same type are added", "Changes when more
  clients are added"]; items (6): D_i (0), V_i (0), S_i (0), X_i (1), U_i (1), R (1).
- **Q47 MULTI (WEEK 4: two-phase commit).** "In the prepare phase the coordinator collects votes from participants. Select all true:"
  (a) if every participant votes Yes, the coordinator tells all to commit TRUE; (b) if any participant votes No or times out, the
  coordinator tells all to abort TRUE; (c) a participant that voted Yes must keep its locks until it hears the decision TRUE;
  (d) a participant that voted Yes may commit on its own before the decision arrives FALSE; (e) the prepare phase already makes
  the changes permanent FALSE. Correct a, b, c.
- **Q48 MATCH (week 8 recap: law -> formula).** Pairs (5): Forced Flow Law -> "X_i = V_i x X"; Service Demand Law -> "U_i = D_i x X";
  Interactive response time law -> "R = N / X - Z"; Little's law -> "N = lambda x T"; High-load throughput bound -> "X <= 1 / D_max".
  Decoy (1): "R = N x X - Z".
- **Q49 MULTI (WEEK 6: message queues; WHY).** "An order service puts messages on a queue read by an email service. Select all benefits:"
  (a) the order service does not wait for the email to be sent TRUE; (b) messages wait safely if the email service is down for an hour
  TRUE; (c) the order service gets instant proof the email arrived FALSE; (d) the two services can be deployed and scaled separately
  TRUE; (e) the queue guarantees the email is read before the next order is taken FALSE. Correct a, b, d.

### Totals check (lecture paper)

| Type | Count | Questions |
|---|---|---|
| mcq | 25 | Q0, 2, 4, 6, 7, 11, 12, 13, 17, 18, 19, 23, 24, 25, 29, 30, 32, 34, 35, 39, 40, 41, 42, 44, 45 |
| multi | 10 | Q3, 8, 14, 20, 26, 31, 37, 43, 47, 49 |
| truefalse | 2 | Q15, Q38 |
| fillblank | 7 | Q1, 5, 10, 16, 22, 28, 36 |
| match | 2 | Q9, Q48 |
| order | 2 | Q21, Q33 |
| sort | 2 | Q27, Q46 |
| **total** | **50** | |

Lecture-quiz coverage: Q39, Q40, Q41, Q42, Q43 (all five, Round 8).
Why / what-if count (>= 10): Q0, Q4, Q7, Q15, Q19, Q21, Q25, Q30, Q32, Q37, Q38, Q41, Q45, Q49 (14).
Earlier weeks: Q45 (week 5), Q47 (week 4), Q49 (week 6); Q39-Q43 also recap week 7.
Diagrams: card C3, C4, C5 (Mermaid flowcharts as listed); `promptDiagram` on Q13 (Shop system flow) and optionally Q31/Q32 (Web -> App -> DB
with visit counts).

## 4. TUTORIAL PAPER (paperNumber 1): "Week 8 Tutorial: RESTful Web Services (payroll)" - 8 questions, one round

Card T-C1 goes before Q0 (see section 2). Sources: `tutorial/COMP5348_Tutorial 8.pdf`, `tutorial/tutorial-8-base` (support only).

- **T0 SORT (classification).** Groups ["Safe and idempotent", "Idempotent but not safe", "Neither safe nor idempotent"]; items (6):
  "GET /employees/7" (0); "GET /employees" (0); "PUT /employees/7 with a new role" (1); "DELETE /employees/7" (1);
  "DELETE /employees (remove all)" (1); "POST /employees with a new person" (2).
- **T1 MATCH (URI/verb design).** Pairs (5): "GET /employees" -> "list all employees"; "POST /employees" -> "create a new employee";
  "GET /employees/{id}" -> "view one employee"; "PUT /employees/{id}" -> "update (replace) one employee"; "DELETE /employees/{id}" ->
  "remove one employee". Decoy (1): "look up an employee by name only".
- **T2 MCQ (WHY, POST is not idempotent).** A client POSTs a new employee, times out, and retries the same request. What is the
  likely result? **Two employees with different ids are created.** Distractors: exactly one employee (POST is idempotent); a 409
  Conflict because the name already exists; the second call is ignored because the server remembers the first.
- **T3 FILL.** "In the React data service, `update(id, data)` sends an HTTP ___ request to `/employees/{id}`." `[["PUT","put"]]`
  (case-insensitive already).
- **T4 MCQ (WHY, missing resource).** `GET /employees/999` and no employee 999 exists. What should the payroll service return?
  **404 Not Found with a message such as "Could not find employee 999".** Distractors: 200 OK with an empty body; 204 No Content;
  500 Internal Server Error.
- **T5 MCQ (URI design).** Best design for "delete employee 7": **DELETE /employees/7**. Distractors: GET /employees/7/delete (a GET
  must be safe); POST /deleteEmployee?id=7 (verb in the URI, not a resource); GET /removeEmployee/7.
- **T6 MCQ (WHY, backward compatibility).** The payroll API is live in many companies and `name` must become `firstName`/`lastName`. Best
  plan: **keep `name`, add optional `firstName`/`lastName`, and let the server fill one from the other, so old clients keep
  working.** Distractors: replace `name` and take every client offline for the update; version the whole service and switch
  everyone the same night; keep `name` only and store the new names in a separate hidden table.
- **T7 MULTI.** "Which changes to the employee JSON are backward compatible with a client that only knows `id`, `name`, `role`?"
  (a) adding an optional `firstName` field TRUE; (b) keeping `name` while adding `lastName` TRUE; (c) old clients ignoring unknown
  fields TRUE; (d) renaming `name` to `fullName` FALSE; (e) removing `role` FALSE. Correct a, b, c.

Tutorial totals: 1 sort, 1 match, 1 fillblank, 4 mcq, 1 multi = 8. Why/what-if: T2, T4, T5, T6, T7 (5, small paper exemption).

## 5. Metadata for the Writer

- Lecture paper: `title: "Week 8 Lecture: Predicting Performance and Queues"`, `topics`: operational laws (service demand D_i, rates and
  utilisation, Forced Flow, Service Demand Law, Little's law and the interactive response time law, low/high-load bounds and the knee,
  planning for scale, redesign), prediction approaches, closed vs open systems, M/M/1 queue, heavy tails, week 7 recap quiz (safe/idempotent,
  201 + Location, stateless, SOAP envelope, WS-* vs REST), mixed review (week 4 2PC, week 5 admission control, week 6 message queues).
  `sourceFiles`: `lecture/COMP5348_W8.pdf`, `lecture/Week 08 - Enterprise-s1-low.transcript.md`.
- Tutorial paper: `title: "Week 8 Tutorial: RESTful Web Services (payroll)"`; `sourceFiles`: `tutorial/COMP5348_Tutorial 8.pdf`,
  `tutorial/tutorial-8-base (supporting context only)`.
- `readings` array (lecture): `beforeQuestion` values 0, 5, 10, 16, 22, 28, 34, 39 (Q44 mixed round has no card). Tutorial: one reading at 0.
- Wire into `exam-content.ts` (or `exam/content.ts` as the repo now does for new weeks): import `WEEK_8_PAPERS as COMP5348_WEEK_8_PAPERS`
  and append to `ALL_PAPERS` (check how week 7 is wired and copy it).
- Final checks: `bun scripts/shuffle-week-options.ts`, `bun scripts/check-mcq-lengths.ts COMP5348`, `bun scripts/check-exam-structure.ts`, `bun test`.
