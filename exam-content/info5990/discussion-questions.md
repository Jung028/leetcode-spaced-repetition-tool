# INFO5990 — Ed Discussion exam-style questions

A running log of scenario/case-study discussion prompts pulled from Ed
Discussion, kept for memorising professional-grade answers. Update this file
whenever a new similar-style question turns up, across any week/module.

---

## 1. AI loan-decisioning bias — KEEP / SUSPEND / MODIFY

**Source:** Ed Discussion, Week 6 pre-lecture prompt. **Already authored as
a `scenario` question in `exam-content/info5990/week-6.ts`** (Week 6
Discussion Prep paper) — this entry just mirrors that answer here for quick
memorisation without opening the app.

**Prompt:**

> A company's AI system rejects 8% more loan applications from one
> demographic group.
>
> The situation is complicated:
>
> The AI team says the model is technically accurate.
>
> The legal team says it currently complies with the law.
>
> The business team says removing the model will cost millions.
>
> An independent audit says the difference is statistically real, but
> cannot prove the model itself caused the disparity.
>
> The CEO asks you, as the IT professional, to recommend whether the system
> should continue operating.
>
> Would you recommend KEEP, SUSPEND, or MODIFY and what evidence would you
> need to justify your decision professionally?
>
> Harder question: If the system is legal, accurate and profitable, can
> deploying it still be professionally wrong?

**Full-marks answer:**

**Recommendation: MODIFY.** Add mandatory human review for any rejection
from the affected group, and run a controlled root-cause investigation
before returning to fully automated decisions.

**Why not KEEP:** "Legal", "accurate" and "profitable" each measure the
wrong thing. Legal is a compliance floor, not an ethics ceiling — law
consistently lags behind newly-identified harms, so something can be fully
lawful today and still be a governance failure. Accurate only means the
model is good at predicting its narrow training target (e.g. default risk)
— it says nothing about whether that target, or the historical data it was
trained on, was itself fair. Profitable measures revenue, not fairness. None
of the three rebuts the audit's finding, so quietly keeping the system as-is
means ignoring a confirmed statistical warning sign — not something a
professional acting responsibly can do.

**Why not SUSPEND (outright):** The audit found the 8% gap is statistically
real but explicitly could **not** prove the model caused it — it could be a
genuine signal from legitimate credit-risk factors (income, employment
history, existing debt) that happen to correlate with the demographic
grouping, rather than the model discriminating on a protected attribute
directly or via a **proxy variable** (a normal-looking input, like zip code,
that secretly tracks something like race or gender). Suspending a working,
lawful system on an unproven causal claim discards its value for every
applicant it correctly assesses, and risks being an overreaction if the
cause turns out to be legitimate risk signal.

**Why MODIFY is the professionally correct middle path:** it treats the
audit's finding as a genuine warning that must be acted on now (unlike
KEEP), without jumping to an unproven causal conclusion the audit itself
disclaims (unlike SUSPEND). Mandatory human review of affected-group
rejections limits harm immediately while the investigation runs.

**Evidence required before finalising the decision:**

1. **Controlled re-run** of the model's decisions holding legitimate
   credit-risk factors constant (income, credit history, etc.). If the 8%
   gap collapses toward zero once those are controlled for, the disparity is
   likely driven by real risk data; if it survives, that is strong evidence
   of proxy discrimination.
2. **A fairness metric, not just accuracy** — compare rejection rates
   between *equally qualified* applicants across groups (e.g. equal
   opportunity / demographic parity style comparison), since raw accuracy
   can be high while still being systematically unfair to a subgroup.
3. **Manual re-review of a sample** of the affected group's rejected
   applications, to check whether the stated rejection reasons actually
   hold up under human scrutiny.

**Harder question — yes, a system can be legal, accurate and profitable and
still be professionally wrong.** Legal only proves no law currently
prohibits it. Accurate only proves it performs well against its own narrow
objective. Profitable only proves it generates revenue. None of those three
properties measures whether people are being treated fairly, and a
professional's duty — e.g. under a code of professional conduct such as the
ACS Code of Professional Conduct — goes beyond "is this allowed and does it
work" to "is this actually right." A system can tick all three boxes
(legal, accurate, profitable) and still represent a professional and
ethical failure if it produces disparate harm the organisation hasn't
properly investigated or justified.

---

## 2. Which estimate do you trust — and would you promise 6 months?

**Source:** Ed Discussion, "Week 4 Friday Thought: Would You Trust the
Estimate?" (`#116`, General).

**Prompt:**

> Your company is bidding for a $2 million software project. The client
> wants delivery in 6 months. However: an experienced developer estimates 6
> months; previous project data suggests 9 months; an AI estimation tool
> predicts 7 months. The sales manager says: "Promise 6 months, or we may
> lose the client."
>
> As the Project Manager, what would you do? Which estimate would you
> trust, and why? Would you promise 6 months to win the project? What
> evidence would you collect before making the final decision?
>
> Final thought: Should a good estimate be what the stakeholder wants to
> hear, or what the evidence can justify?

**Full-marks answer:**

**I would not simply pick one of the three numbers — the spread between them
(6 to 9 months) is itself the important signal: it tells you estimating
uncertainty is high, so the right output is a range with a justified
expected value, not a single confident number.**

**Weighing the three estimates:**

- The **experienced developer's 6-month estimate** is valuable domain
  judgment, but a single expert's gut-feel figure is vulnerable to
  optimism bias and anchoring — especially when it happens to line up
  exactly with what the client and sales team want to hear, which is a red
  flag for unconscious bias, not evidence.
- **Historical data (9 months)** is an *analogous/reference-class*
  estimate — grounded in how similar projects actually performed in
  reality, not how anyone hoped they'd perform. Reference-class forecasting
  is generally the most reliable anchor precisely because it isn't subject
  to any one person's optimism about *this* project.
- The **AI tool's 7 months** is a data-driven midpoint, but it is only as
  good as the training data it saw — it's unclear whether this project's
  specific constraints (team, scope, dependencies) match what the model was
  trained on, so treat it as one more data point, not a tie-breaker.

**Would I promise 6 months? No.** Promising 6 months when the strongest
evidence (real historical performance) says 9 turns an *estimate* into a
*commitment* with zero risk buffer — a textbook case of the **planning
fallacy**, where schedule pressure overrides evidence. If the project later
runs to 9 months as the data predicted, the company has now broken a
contractual promise instead of having set expectations correctly from the
start; that damages the client relationship far more than an honest
range would have.

**Evidence to collect before finalising a number:**

1. Break the work down (WBS) and compare it against the historical
   projects' scope — is this project genuinely smaller/better-resourced
   than the 9-month baseline, or just being *hoped* to be?
2. Interview the developer behind the 6-month estimate to surface their
   assumptions (dedicated team? no scope creep? no external dependencies?)
   — an estimate is only as good as its stated assumptions.
3. Check what data the AI tool was trained on and whether this project
   actually resembles that distribution.
4. Run a proper **three-point (PERT) estimate** — optimistic (6),
   most likely, pessimistic (9+) — to produce an expected duration with a
   quantified confidence range, instead of a single number from any one
   source.
5. Identify what would actually be needed to *credibly* compress 9 months
   to 6 — extra resources, reduced scope, or a phased/MVP delivery — rather
   than assuming the number can simply be willed shorter.

**Final thought — answered:** a good estimate is what the evidence can
justify, never simply what the stakeholder wants to hear. If 6 months isn't
achievable without changing scope or resources, the professional response is
to present the evidence-based range and negotiate (e.g. an MVP in 6 months,
full scope by 9) rather than promise a number the data doesn't support —
that protects both the client relationship and the company's credibility far
better than a promise built on hope.

---

## 3. Nurses flag a confusing interface — ship on schedule or delay?

**Source:** Ed Discussion, "Week 3 Friday Thought: What Would You Do?"
(`#100`, General).

**Prompt:**

> A hospital's new patient-management system has passed all technical
> tests. However, during final testing, several nurses report that the
> interface is confusing and may lead to mistakes during busy shifts.
>
> The project sponsor says: "There is no confirmed system failure. Delaying
> the launch will cost $500,000, so communicate that the system is ready."
>
> Meanwhile, two junior developers agree with the nurses but are
> uncomfortable challenging senior management.
>
> As the Project Manager, what would you do? Proceed because the system
> passed its technical tests, or delay because users raised a serious
> concern? How would you communicate the situation without creating panic
> or hiding the risk? How would you encourage junior team members to speak
> openly? Whose views should receive the most attention — the sponsor,
> technical team or end users?
>
> Final thought: Is good communication simply delivering the message
> stakeholders want to hear, or ensuring important concerns are heard
> before a decision is made?

**Full-marks answer:**

**I would not launch on the original schedule purely because it passed
technical tests** — at minimum, run a rapid, scoped usability-fix and retest
cycle before going live, or launch through a staged/pilot rollout in one
clinic first rather than hospital-wide.

**Why "passed all technical tests" doesn't settle it:** passing planned
tests is *verification* — "did we build the system right" — not
*validation* — "did we build the right system for the people who actually
have to use it, under real conditions." Nurses reporting confusion that
"may lead to mistakes during busy shifts" is a direct validation failure
that no functional test suite was designed to catch.

**Why the sponsor's framing is misleading:** "no confirmed system failure"
quietly redefines "failure" as only a technical defect ticket, and ignores
that in a hospital, a confusing interface during a busy shift is a
**patient-safety risk** (a mis-recorded arrival, a missed follow-up, a
wrong-timing entry), not a cosmetic complaint. The severity of the possible
consequence — patient harm — is what should drive the decision, not whether
a formal defect was logged.

**How to communicate without panic or cover-up:** present the concern as
specific and evidence-backed (e.g. "X of Y nurses made a specific type of
error during simulated busy-shift testing") rather than a vague alarm, and
pair it with a concrete mitigation plan (targeted UI fix, a one-clinic pilot
rollout, extra shift training) — giving the sponsor a path forward rather
than an open-ended blocker makes the message land as risk management, not
obstruction.

**Encouraging the junior developers to speak up:** give the concern a
structured, safe channel that doesn't require them to personally confront
senior management — a documented risk-register entry, an anonymous
feedback channel, or having their lead formally escalate on their behalf —
so the concern is judged on its evidence, not the seniority of whoever
raises it. This is a psychological-safety responsibility of the PM, not
something left to the juniors to solve alone.

**Whose view should carry the most weight:** the **end users (nurses)**,
because they're the ones operating the system under real conditions, and
the specific failure mode they've flagged (mistakes during busy shifts) has
direct patient-safety consequences that outweigh a purely financial
argument. The sponsor's cost concern and the technical team's "no defects
found" are both legitimate inputs, but in a health-safety context, credible
frontline-user risk signals should dominate the launch decision.

**Final thought — answered:** good communication is not delivering the
message stakeholders want to hear — it is making sure important concerns,
especially safety-relevant ones raised by frontline users, are surfaced and
weighed *before* a decision is finalised, even when that message is
unwelcome or costly.

---

## 4. Waterfall, on time and on budget — but solving the wrong problem

**Source:** Ed Discussion, "Friday Thought: What Would You Do?" (`#84`,
General).

**Prompt:**

> A company chooses Waterfall because the scope, budget, and deadline are
> fixed. Three months later, users realise the approved requirements won't
> actually solve the business problem.
>
> Management: "Changing requirements means poor project control." Project
> Team: "Following them means delivering the wrong solution."
>
> What would you do as the Project Manager? Stick with Waterfall? Move to
> Agile/Hybrid? Or is methodology not the real problem?
>
> Final thought: If the project is delivered on time, on budget, and
> exactly as approved, but solves the wrong problem, has it succeeded?

**Full-marks answer:**

**This isn't really a Waterfall-vs-Agile question at its core — it's a
requirements validation failure that happened before delivery even started,
and the methodology only determined how expensive that failure is to fix
now that it's been discovered.**

**Stick with Waterfall (as-is)?** No — continuing to deliver a solution
the team now has evidence doesn't solve the real business problem, purely
to preserve "process," repeats the sunk-cost/planning-fallacy mistake:
finishing the wrong thing on schedule is not success.

**Move to Agile/Hybrid?** A full reactive mid-project switch of methodology
is itself risky and disruptive — it means retraining the team, renegotiating
a contract built around fixed scope/budget, and confusing stakeholders. The
better move is a **controlled change request within (or alongside) the
existing framework**: formally document the new evidence that the approved
requirements miss the real business problem, run an impact/cost-benefit
analysis of the gap, and negotiate a scope/schedule/budget adjustment
through proper change control — potentially adopting incremental,
check-in-driven delivery (a genuine hybrid) for the *remaining* phases so
future misalignments surface earlier, rather than switching frameworks as a
knee-jerk reaction to one failure.

**Or is methodology not the real problem?** Correct — the root cause is a
**requirements elicitation/validation failure**: the originally approved
requirements didn't actually capture the real business problem. Waterfall's
characteristic risk (all requirements frozen upfront, expensive to change
once locked) made this pre-existing gap far more costly to discover and fix
later, but switching methodology after the fact treats the symptom, not the
cause — the same gap could still occur under Agile if elicitation with real
users/business stakeholders was inadequate to begin with.

**Final thought — answered:** on time, on budget, and exactly as approved,
but solving the wrong problem, is **not** success — it is failure disguised
as compliance. Project success has to include delivering real business
value, not merely satisfying the scope/schedule/budget "iron triangle." A
project that ticks every constraint box while missing the actual business
need has failed its true purpose.

---
