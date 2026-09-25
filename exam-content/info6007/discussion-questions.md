# INFO6007 — Ed Discussion exam-style questions

A running log of scenario/case-study discussion prompts pulled from Ed
Discussion ("Thought Nugget" posts), kept for memorising professional-grade
answers. Update this file whenever a new similar-style question turns up,
across any week/module.

---

## 1. Requirements gathering across five clinics, an outdated manual, and busy staff

**Source:** Ed Discussion, Week 1 Thought Nugget (`#69` approx., General).

**Prompt:**

> A hospital is replacing its paper-based outpatient appointment system
> with a digital system. Receptionists manage bookings, nurses record
> patient arrivals, and doctors request follow-up appointments. Patients
> will also be able to view or change appointments online. The project team
> has three weeks to gather requirements. Staff across the hospital's five
> clinics follow slightly different processes, the existing procedure
> manual is outdated, and some staff are too busy to attend long meetings.
> The system must also meet the needs of elderly patients and patients with
> limited English.
>
> What would be the best approach to gathering the requirements for this
> project, and why?

**Full-marks answer:**

Given a tight three-week window, inconsistent processes across five clinics,
an unreliable existing document, and stakeholders who genuinely can't spare
long meetings, a **single elicitation technique won't work — this calls for
a mixed, staged approach, matched to each constraint**:

- **Don't trust the procedure manual as ground truth.** It's explicitly
  outdated, and processes already vary clinic-to-clinic, so treat it only
  as a starting checklist, not a source of requirements.
- **Interview/workshop representatives from each of the five clinics
  separately**, not just one "typical" clinic — since processes already
  differ, assuming one clinic's workflow represents all five would bake a
  false requirement into the system from day one.
- **Direct observation / job-shadowing** of receptionists, nurses and
  doctors during real shifts surfaces the undocumented, informal
  workarounds staff actually use — exactly the gap an outdated manual and
  rushed interviews would miss.
- **Short, structured surveys or brief standups instead of long workshops**
  for staff who can't spare meeting time — respecting the real constraint
  rather than requiring attendance that won't happen.
- **Dedicated accessibility requirements gathering** for the elderly and
  limited-English patient groups specifically — e.g. direct usability
  input or testing with representative patients, or consulting an
  accessibility specialist — rather than assuming the general staff
  interviews will surface these needs, since the people who feel this pain
  point (patients) are a different stakeholder group from the staff being
  interviewed.
- **Use lightweight prototypes/wireframes for rapid validation** rather
  than long written requirements documents — with three weeks, fast
  visual feedback loops catch misunderstandings far quicker than
  requirements prose review would.
- **Document the cross-clinic variation explicitly** as a requirement in
  its own right (e.g. "the system must support configurable workflow
  variants per clinic," or a decision to standardise one process across
  all five) rather than silently picking one clinic's process and calling
  it "the" requirement.

**Why this combination, not just one method:** each individual constraint
(time pressure, staff availability, process inconsistency, outdated
documentation, accessibility needs) rules out a different single technique
on its own — the correct answer is recognising that real-world requirements
gathering under multiple simultaneous constraints requires combining fast,
low-burden techniques (short surveys, observation) with targeted deep-dives
where the stakes are highest (multi-clinic interviews, dedicated
accessibility input), rather than picking one method and hoping it covers
everything.

---

## 2. Scheduling a 14-week project with a blocked dependency and shared specialists

**Source:** Ed Discussion, Week 2 Thought Nugget (`#89` approx., General).

**Prompt:**

> A university must replace its online enrolment system before enrolment
> opens in 14 weeks. The project involves configuring the new system,
> migrating student records, integrating it with the payment system,
> testing it, and training staff. The payment-system integration cannot
> begin until an external vendor provides access in four weeks. The
> condition of the existing student data is uncertain, and the same two
> technical specialists are required for both data migration and system
> integration. The go-live date cannot be postponed.
>
> What would be the best approach to developing a realistic schedule for
> this project, and what are the key considerations?

**Full-marks answer:**

**Build a network diagram / critical-path schedule that makes these
constraints explicit, rather than a simple linear task list** — this
scenario has three distinct scheduling risks stacked on top of each other,
and each needs its own handling:

1. **The vendor dependency is an external, finish-to-start constraint**:
   integration literally cannot start before week 4, no matter how the
   internal team is organised. Treat this as a scheduled risk, not just a
   date — add a contingency buffer around it, and escalate to secure the
   vendor's commitment as early as possible, since any vendor slippage
   directly delays the whole chain.
2. **Resource contention**: the same two specialists are needed for both
   data migration and integration. Since integration is blocked until week
   4 anyway, **sequence the specialists onto migration-prep and the
   data-condition audit first**, so they aren't idle during the vendor wait
   — then plan for the overlap window where both migration and integration
   genuinely compete for the same two people, and either stagger the work
   further or bring in temporary extra capacity for that specific overlap
   rather than assuming both can run at full pace simultaneously.
3. **Uncertain existing data condition is a hidden risk to the migration
   estimate.** Run a dedicated, early data-quality audit task *before*
   committing to a migration timeline — discovering data problems late,
   after migration has already started, would blow out the schedule right
   when there's no time left to absorb it.

**Because the go-live date is fixed**, schedule backwards from that
deadline (reverse scheduling) and identify the **critical path** — the
sequence of dependent tasks (vendor access → integration → testing →
training, and migration → testing) that has zero slack. This tells the PM
exactly which risk (vendor delay, data condition, or specialist
contention) would actually blow the fixed deadline, versus which tasks have
float and can absorb some slippage safely.

**Key considerations to call out explicitly:** the external dependency is
outside the PM's direct control and needs proactive vendor management, not
just a calendar entry; resource-constrained scheduling (leveling) is needed
because "compress the schedule" isn't possible by just assigning more of
the same two specialists to overlapping critical tasks; and testing/training
time must be protected at the back end rather than compressed to absorb
earlier slippage, since a rushed go-live with untrained staff creates its
own operational risk on launch day.

---

## 3. On schedule, over budget — is this project healthy?

**Source:** Ed Discussion, Week 3 Thought Nugget (`#93` approx., General).

**Prompt:**

> A software company has approved a $300,000 budget to develop an
> appointment-management platform. At the halfway point: the project has
> completed 50% of the work, as scheduled. According to the cost baseline,
> the completed work was expected to cost $150,000. The project has
> actually spent $260,000. The remaining activities are currently
> estimated to require another $120,000.
>
> The project manager reports: "The project is progressing well because we
> are still on schedule." Would you consider this project healthy? What do
> these figures suggest, and what might have caused this situation?

**Full-marks answer:**

**No — this project is not healthy, and the PM's "on schedule" framing is
technically true but dangerously incomplete.** Run the actual Earned Value
Management numbers:

- **BAC (Budget at Completion)** = $300,000.
- **EV (Earned Value)** = 50% of BAC = **$150,000** (the value of work
  actually completed, measured at planned/budgeted rates).
- **PV (Planned Value)** at the halfway checkpoint = **$150,000** (50% of
  budget was scheduled to be done by now).
- **AC (Actual Cost)** = **$260,000**.
- **SV (Schedule Variance) = EV − PV = $150,000 − $150,000 = $0`** — on
  schedule, exactly matching the PM's claim.
- **CV (Cost Variance) = EV − AC = $150,000 − $260,000 = −$110,000`** —
  significantly **over budget**.
- **SPI (Schedule Performance Index) = EV / PV = 150 / 150 = 1.0`** — on
  schedule.
- **CPI (Cost Performance Index) = EV / AC = 150 / 260 ≈ 0.58`** — for
  every $1 spent, only about $0.58 of planned value has actually been
  delivered. This is a severe cost-efficiency problem.

**Even by the team's own remaining estimate**, total forecast cost =
$260,000 spent + $120,000 remaining = **$380,000**, already **$80,000
(≈27%) over** the $300,000 budget. And that $120,000 "remaining" figure is
itself optimistic if cost efficiency doesn't improve: a proper
**EAC = AC + (BAC − EV) / CPI = 260 + (300 − 150) / 0.58 ≈ $518,000`** —
suggesting the overrun could be far worse than the team's own remaining
estimate implies, if the same cost inefficiency continues.

**What this suggests / possible causes:** the original budget may have been
underestimated for the actual scope; scope creep may have crept in without
a matching budget increase; resources may be less efficient or more
expensive than planned (e.g. more senior/costly staff than budgeted, or more
hours needed per task than estimated); or rework from quality issues may be
consuming budget without producing net new "earned value." **The core
lesson: schedule status (SPI) and cost status (CPI) are independent
metrics — a project can be perfectly on schedule while quietly burning
through its budget, and reporting only the schedule number hides a serious
cost-health problem that the PM either missed or chose not to surface.**

---

## 4. Every test passed, then the system crashed under real load

**Source:** Ed Discussion, Week 4 Thought Nugget (`#111` approx., General).

**Prompt:**

> A university developed a new online enrolment system. Throughout the
> project, the team followed its approved quality plan: all functional
> test cases were completed successfully, code reviews and security checks
> were conducted, no critical defects remained before release, and the
> system met its response-time target during testing. The client approved
> the system for launch. Based on these results, the project manager
> reported that the system was ready and had met all quality requirements.
>
> However, when enrolment opened, thousands of students attempted to use
> the system simultaneously. The system became extremely slow, some users
> received error messages, and several students were unsure whether their
> enrolment had been successfully submitted.
>
> If the system passed every planned test, can we say that its quality was
> managed successfully? Where did the main problem occur — planning
> quality, managing quality, controlling quality, or somewhere else? What
> quality criteria, testing activities or stakeholder input might have
> prevented this situation?

**Full-marks answer:**

**No — passing every planned test does not mean quality was managed
successfully. It means the tests that were planned were executed
correctly; it says nothing about whether the *right* tests were planned in
the first place.**

**Where the failure actually occurred: primarily Quality Planning, not
Quality Control.** Quality Control (executing the defined tests — functional
cases, code review, security checks, a response-time target) was clearly
performed and passed. The gap is that the **quality plan itself never
specified a realistic peak-load / concurrent-user acceptance criterion** —
"met its response-time target during testing" almost certainly reflects a
much smaller simulated load than "thousands of students simultaneously,"
which is a foreseeable real-world condition for an enrolment system that
was never captured as a requirement to test against.

**What would have prevented it:**

- **Explicit non-functional/performance requirements** in the quality plan
  — a specific target concurrent-user load derived from real historical
  enrolment-period traffic data, not an arbitrary response-time figure
  tested under light conditions.
- **Load/stress/performance testing** simulating realistic peak
  concurrency, distinct from functional correctness testing — these are
  different testing activities with different purposes, and only the
  latter was evidently planned.
- **Capacity planning input from IT operations** during the quality
  planning phase, since operations would know the expected peak traffic
  pattern that development/QA alone might not think to model.
- **A phased or staggered launch** (e.g. enrolment opening by student
  cohort or in time-staggered windows) as a risk-mitigation strategy,
  reducing the real-world peak load even if performance headroom is
  uncertain.
- **Stakeholder input beyond client sign-off on functional scope** — the
  client approving "it does what we asked for functionally" is not the
  same as the client (or IT operations) confirming "we've validated it
  against our real peak-demand conditions."

**The core lesson:** quality control can execute flawlessly against a
quality plan that itself has a blind spot — "all planned tests passed" is
only as trustworthy as the plan that decided what to test, and the plan
here omitted the one condition (true peak concurrent load) that actually
broke the system in production.

---

## 5. Nothing has technically gone wrong yet — should that reassure you?

**Source:** Ed Discussion, Week 5 Thought Nugget (`#128` approx., General).

**Prompt:**

> A company is developing a new IT system. The project team was formed
> according to the original plan, the expected roles were assigned, and
> early progress appeared satisfactory. As the project continued, however,
> some work began taking longer than expected, decisions became more
> difficult, and participation across the team became increasingly uneven.
> None of these issues appeared serious on its own, and the project had not
> yet missed any major milestones.
>
> The project manager said: "Everyone is assigned to the project, work is
> continuing, and the major milestones are still achievable. There is no
> reason to make changes."
>
> If the project appears to have the people it needs and is still
> progressing, could something important still be going wrong? What should
> the project manager investigate before concluding that everything is
> being managed effectively?

**Full-marks answer:**

**Yes — something can absolutely be going wrong even though no milestone
has been missed, because milestone status is a lagging, binary indicator
(hit or not-hit) that can mask a deteriorating trend right up until it's too
late to fix cheaply.** The three symptoms described — tasks taking longer,
decisions getting harder, participation becoming uneven — are individually
minor but together are classic **early warning signs of team dysfunction**:
unclear roles or accountability, an emerging communication breakdown,
possible disengagement or burnout, or an unresolved ambiguity (technical or
requirements-related) that's quietly making every decision slower without
anyone naming it directly.

**Why "milestones still achievable" is not reassurance on its own:** it
only confirms the *output* metric hasn't broken yet — it says nothing about
whether the *process* generating that output is healthy or about to fail.
Teams frequently look fine on the milestone tracker right up until a
compounding problem (accumulated rework, quiet disengagement, unresolved
conflict) causes a sudden, hard-to-recover schedule break.

**What the PM should investigate before declaring "everything is fine":**

- **Run a team health check** — a retrospective, structured 1:1s, or an
  anonymous team survey — to surface the *root cause* behind slower
  decisions and uneven participation, rather than assuming it will resolve
  itself.
- **Look at leading indicators the milestone metric doesn't show**: trend
  in velocity/throughput (is task completion rate declining even though the
  milestone date hasn't moved yet?), decision turnaround time, and
  defect/rework trends.
- **Compare actual effort/hours spent against planned effort** for
  completed work so far — a cost/effort-based check (conceptually similar
  to a CPI check) even though the schedule looks fine, since effort
  overrun can be absorbing schedule buffer invisibly.
- **Talk directly with the less-engaged team members** to understand *why*
  participation has become uneven — workload imbalance, unclear
  expectations, interpersonal conflict, or blocked dependencies are all
  plausible and each needs a different fix.

**The core lesson:** a PM's job includes proactively probing qualitative,
leading team-health signals, not just tracking the lagging milestone
metric — by the time a "no reason to make changes" project misses a major
milestone, the underlying problem has usually been compounding, unaddressed,
for weeks.

---

## 6. The best developer is on every critical task — so why is the project slowing down?

**Source:** Ed Discussion, Week 6 Thought Nugget (`#150` approx., General).

**Prompt:**

> A project was running under tight deadlines. To ensure faster delivery,
> the project manager decided to: assign the best and most experienced
> developer to multiple critical tasks; keep less experienced team members
> on smaller, low-risk tasks; avoid reassigning work to maintain
> "efficiency"; and ensure that important tasks are handled by the "most
> capable" person.
>
> Initially, everything seemed under control. However, as the project
> progressed: critical tasks started getting delayed, other team members
> were waiting for dependencies to be completed, the "expert" became
> overwhelmed, and overall progress slowed despite having available team
> members. No one questioned the resource allocation strategy.
>
> If the most capable person is handling the most important work, why is
> the project slowing down? Is assigning the "best resource" always the
> best decision? What would you change in this situation?

**Full-marks answer:**

**Why it's slowing down: concentrating multiple critical-path tasks on one
person turns that person into the project's bottleneck** — a classic
resource-constrained scheduling problem. Even though each individual task
is theoretically being done by the "best" person for it, that person has
finite capacity; stacking critical tasks onto them **serialises work that
could otherwise run in parallel** across other team members, and adds
context-switching overhead between tasks. Meanwhile, everyone else is left
**waiting on dependencies** the expert hasn't gotten to yet, so their
"available" capacity sits idle. The project's true throughput is capped by
one person's bandwidth, not by the team's total skill.

**Is assigning the best resource always the best decision? No.** This
strategy optimises for *individual task quality* while ignoring
*queueing and parallelism effects* — exactly what resource
levelling and the critical-chain method in project scheduling exist to
manage. A resource-constrained schedule has to account for the fact that
one person, however skilled, cannot execute two critical tasks at once; if
best-resource assignment creates contention on the critical path, it can
make the *project* slower even while each *task* is executed excellently.
There's also a hidden risk being ignored: **single point of failure** — if
the expert is unavailable, sick, or leaves, all critical work stalls at
once, and the team has built no redundancy or capability elsewhere.

**What I'd change:**

- **Apply resource levelling**: redistribute some critical-path tasks to
  other capable-enough team members, with the expert providing review,
  mentoring, or unblocking support rather than doing all the hands-on
  execution themselves — this lets more work run in genuine parallel.
- **Use the expert selectively on the highest-leverage points** (design
  decisions, unblocking others, code review) rather than as the sole
  executor of every critical task.
- **Deliberately build capability and redundancy** in less experienced
  members by pairing them on moderate-risk tasks with support, rather than
  permanently confining them to low-risk work — this both reduces
  single-point-of-failure risk and grows the team's overall throughput for
  the rest of the project.
- **Re-baseline the schedule as a resource-constrained critical path
  (critical chain)**, which explicitly accounts for one person's finite
  capacity across multiple "critical" tasks, instead of a schedule that
  implicitly assumes the best resource has unlimited bandwidth.

---
