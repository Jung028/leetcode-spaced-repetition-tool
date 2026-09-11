# INFO6007 Week 7 — Study Notes

Week 7 has **two different topics** because the lecture and the tutorial are
one week out of step with each other:

- **Lecture (Paper 2):** Risk Management Plan — the 6 risk processes, positive
  vs negative risk, risk appetite/utility, plus the Standish CHAOS Report and
  the UK NHS NPfIT case study readings.
- **Tutorial (Paper 1):** Resource Management — Resource Breakdown Structure,
  over/under-allocation, resource leveling, team motivation theories. (This is
  the Week 6 lecture topic; the tutorial always trails the lecture by a week.)

There is **no lecture recording for Week 7** — only the slide PDF and the two
readings. So the "video-only" list below is empty and the "Post-lecture Q&A"
section is n/a. The slide deck itself, however, ends with an explicit
**"End of Lecture Questions"** list and a **case study with questions**, and
the tutorial sheet has its own worksheet prompts — those are all mined into
practice questions and listed at the bottom.

---

## Important points

### Slide-sourced — Lecture (Risk Management Plan)

**What a project risk is**

- A project risk is "an uncertain event or condition that, if it occurs, has a
  positive or negative effect on one or more project objectives (scope,
  schedule, cost, or quality)."
- Risk is about **uncertainty** — something that may or may not happen.
- IT projects need risk management because they are highly dynamic: fast-moving
  technology, evolving requirements, cybersecurity and data-privacy concerns.
- Standish CHAOS Report cited on the slide: **over 60% of IT projects** fail to
  meet time, budget or scope — the major reason given is **poor risk
  management**.

**Goals and nature of risk management**

- Goals: identify risks early; assess probability and impact; develop
  strategies to minimise threats and maximise opportunities; monitor risks
  across the lifecycle; enable informed decisions under uncertainty.
- It is a **continuous process**, not a one-time task; it complements scope,
  schedule, cost and quality management.
- It keeps the project manager out of "firefighting mode" and in proactive
  planning.

**Positive vs negative risk**

- Negative risk = **threat** (harmful effect on objectives). Response
  strategies: **avoid, mitigate, transfer, accept** (+ escalate).
- Positive risk = **opportunity** (beneficial effect). Response strategies:
  **exploit, enhance, share, accept** (+ escalate).
- Both need a structured process — risks are not always bad.

**Risk categories (the RBS top level in this unit)**

- Market risk — external market conditions.
- Financial risk — funding, budget, cost overruns.
- Technology risk — adoption, integration, performance of technology.
- People risk — human factors, resourcing, stakeholder involvement.
- Structure/Process risk — organisational processes, governance, project
  structure.

**Benefits of risk management** — improved success rate; better decision
making; cost and time savings; increased stakeholder confidence; competitive
advantage; compliance and governance.

**Risk communication and stakeholder engagement**

- Risk communication = sharing information about threats and opportunities with
  stakeholders in a clear, timely, transparent, action-oriented way.
- Objectives: stakeholders understand risks and impact; status/response updates;
  build trust; support informed decisions on responses.
- Engage stakeholders throughout the cycle: they spot risks the team missed;
  they improve probability/impact accuracy; they share ownership of responses;
  early involvement reduces resistance to change.

**UK NHS NPfIT example (as told on the slides)**

- Launched 2002; goal was a nationwide electronic patient records system and
  standardised NHS IT; budget cited on the slide as ~£12 billion.
- Risks identified: technology (multi-vendor + legacy integration), people
  (clinician resistance), financial (budget overruns), process (inconsistent
  governance across regions).
- Risk-communication failures: risks discussed only among senior leadership,
  frontline staff excluded; vendors/PMs downplayed risks to avoid political
  fallout, so decisions were delayed and unaddressed risks snowballed;
  Parliament and public were not given accurate updates → reputational damage.
- Stakeholder-engagement failures: clinicians not engaged early (systems didn't
  match medical workflows); vendors had misaligned incentives (chased contract
  milestones, not long-term mitigation); government/Parliament involved too late,
  only in crises.
- Outcome: programme abandoned in 2011 after billions spent, most objectives
  unmet. Lesson cited: "failure to effectively communicate risks and engage
  stakeholders at all levels."
- Key lessons: engage all stakeholders early (especially end users); communicate
  risks openly and continuously (hiding risks erodes trust); tailor the message
  (leaders want summaries, technical teams want detailed logs, end users want
  practical guidance); transparency builds resilience.

**Risk appetite and organisational culture**

- Risk appetite = the degree of uncertainty an organisation is willing to accept
  in pursuit of its objectives. Organisations range from risk-seeking to
  risk-averse.
- Factors influencing risk appetite: industry context (startups > government
  agencies), financial health (strong reserves → more tolerance), leadership
  mindset, stakeholder expectations (shareholders demanding growth).
- Three risk cultures: risk-averse (avoids uncertainty, compliance-heavy, slow to
  innovate), risk-neutral (balances threats and opportunities pragmatically),
  risk-seeking (encourages experimentation and rapid scaling).
- **Alignment is crucial** — if stated risk appetite doesn't match the real
  culture, risk management fails.

**Risk utility functions and risk preference**

- A risk utility function shows how much value (utility) a person/organisation
  assigns to outcomes under uncertainty; it helps make choices when facing risk.
- Risk-averse: prefers a certain but lower payoff over a risky higher one.
- Risk-seeking: prefers the gamble for a potentially higher payoff.
- Risk-neutral: indifferent to risk, decides purely on **Expected Monetary Value
  (EMV)**.
- Graph convention: X-axis = monetary value / project benefit, Y-axis = utility
  (satisfaction/value derived).

**The 6 processes of risk management (this unit's numbering)**

1. **Plan Risk Management** — define *how* risk activities will be run: roles and
   responsibilities, methods/tools (brainstorming, Monte Carlo), resources
   (budget, time, reserves), and thresholds (acceptable risk level). Output: the
   Risk Management Plan.
2. **Identify Risks** — determine which risks may affect the project and document
   their characteristics. Runs early and continues throughout. Outputs: the
   **initial Risk Register** and a **Risk Breakdown Structure** (hierarchical
   representation of risk categories).
   - Tools: **Brainstorming** (quick, diverse, but louder voices dominate);
     **Delphi technique** (anonymous multi-round expert consensus, avoids
     dominant personalities, but slow); **Interviewing** (deep context, but
     subjective / interviewer bias); **SWOT analysis** (internal
     strengths/weaknesses + external opportunities/threats, balances positive and
     negative risk, but can oversimplify).
3. **Perform Qualitative Risk Analysis** — subjective prioritisation of risks by
   probability and impact, using expert judgement and a
   **probability-impact matrix** to sort risks into High/Medium/Low. Done after
   identification, before quantitative analysis.
4. **Perform Quantitative Risk Analysis** — numerical, data-driven analysis of
   the combined effect of risks on cost/schedule/scope/quality. Tools:
   **Monte Carlo simulation** (random sampling over thousands of iterations →
   a *range* of outcomes, not one number) and **Decision Tree Analysis** (decision
   branches + chance branches → **Expected Monetary Value**; pick the branch with
   the highest EMV).
5. **Plan Risk Responses** — develop options/strategies/actions for each risk;
   assign owners; make responses cost-effective and realistic.
6. **Implement Risk Responses** — approved treatments become scheduled, owned
   work, not just entries in the register.
7. **Monitor and Control Risks** — track identified risks, monitor residual
   risks, identify new risks, evaluate how well the risk process is working.
   Continuous. (The slides sometimes fold "Implement" into 5&6, so the list is
   often spoken of as "6 processes.")

**The Risk Register**

- Central, living document recording every identified risk, its characteristics
  and its planned response.
- Purpose: structured capture/tracking/communication of risks; accountability
  (every risk has an owner); a decision-making tool for prioritising and
  planning responses.

**NSW Digital Driver Licence case study (runs through all 6 processes)**

- Optional digital NSW driver licence in the Service NSW app; pilot Dubbo Nov
  2017, expanded trials (Eastern Beaches, Albury), statewide launch Oct 2019.
- Stakeholders: Service NSW, Transport for NSW, NSW Police, licence holders,
  licence checkers.
- Plan: PM plus product, platform, cybersecurity and rollout leads own risks;
  fortnightly reviews + stage gates + launch-readiness checkpoints; illustrative
  rule — any extreme identity/security/privacy/availability risk gets immediate
  treatment and escalation.
- Identify (initial register): R1 Peak launch demand (Technical), R2 Record
  integration errors (Technical), R3 Privacy or security issue
  (Technical/stakeholder), R4 Trial feedback improves rollout (Opportunity).
- Qualitative analysis: R1 High prob / High impact → **EXTREME** (treat
  immediately); R2 Medium / High → HIGH; R3 Low / Very high → HIGH; R4 Medium /
  Medium benefit → MODERATE (monitor and enhance).
- Quantitative analysis (EMV = probability × impact):
  - Peak-demand response: 30% × A$800k = **A$240k**
  - Integration rework: 25% × A$500k = **A$125k**
  - Rollout delay: 15% × A$1.2m = **A$180k**
  - Trial insight reduces support: 40% × A$300k saving = **−A$120k**
  - Net expected exposure: A$545k threat − A$120k opportunity = **A$425k**
- Responses: pick strategy → design action (load testing, staged release,
  assurance, fallback) → assign owner → set trigger. Implement: authorise,
  scale/load-test, resolve findings, prepare support and comms, record residual
  risk. Monitor: review register, check triggers, test response effectiveness,
  identify new/residual risk, update and communicate.

**Traditional vs Agile vs Hybrid risk management**

- Traditional (Waterfall): risks identified, analysed and planned up front; risk
  register + formal reviews.
- Agile: risks handled iteratively each sprint; risk management embedded in daily
  work, not just up front.
- Hybrid: keeps the formal structures (register, probability-impact matrix) plus
  Agile practices (daily monitoring, adaptive responses); suits large IT projects
  with many stakeholders, regulators and vendors.
- Agile practices: iterative risk reviews at each retrospective; risk-based
  backlog prioritisation ("fail fast" — do the riskiest stories first); risk
  burn-down charts (risk exposure over time); collaborative ownership (whole team,
  not one risk manager).

### Slide-sourced — Reading 1: Standish Group CHAOS Report (1994/1995)

- Resolution types: **Type 1 success** (on time, on budget, all features) —
  **16.2%**; **Type 2 challenged** (completed but over budget/time, fewer
  features) — **52.7%**; **Type 3 impaired** (cancelled mid-development) —
  **31.1%**.
- Large companies do worst: only **9%** of their projects succeed; 42% of
  originally-proposed features survive to the end product.
- Average cost overrun **189%** of original estimate; average time overrun
  **222%**.
- Restarts: for every 100 projects started there are 94 restarts.
- Denver airport baggage-handling software failure cost the city **$1.1 million
  per day**.
- Top 3 project **success** factors: (1) User Involvement, (2) Executive
  Management Support, (3) Clear Statement of Requirements. Then proper planning,
  realistic expectations, smaller milestones.
- Top **challenged** factors: lack of user input; incomplete requirements;
  changing requirements. Top **impaired/cancelled** factors: incomplete
  requirements; lack of user involvement; lack of resources.
- Case studies scored on a 100-point "success potential" chart: California DMV
  **10 pts** ($45m, cancelled — no exec support, no user involvement, poor
  planning, politics); American Airlines CONFIRM **29 pts** ($165m collapse —
  "too many cooks", incomplete requirements, constant changes); Hyatt reservation
  system **100 pts** ($15m, ahead of schedule, under budget — all success
  ingredients present); Banco Itamarati **85 pts** (clear vision, top-down
  involvement, incremental measurable results).
- "Growing" software (small components delivered early and often, iterative) beats
  "developing" software (big-bang). Complexity causes only confusion and cost.

### Slide-sourced — Reading 2: UK NPfIT — "Why was it dismantled?" (Justinia, 2017)

- NPfIT launched 2002, initial budget ~**£6.2 billion** over 10 years; later
  forecasts ~£10bn (some estimates £11.4bn). Officially **dismantled September
  2011**; Connecting for Health agency ceased **March 2013**. Deemed the world's
  largest civil IT programme.
- Aim: centralised, integrated electronic patient records + "choose and book" +
  computerised referral/prescription across ~300 hospitals.
- Three underlying themes (Campion-Awwad et al.):
  - **Haste** — rushed policy-making, procurement and implementation; no time for
    consultation; unrealistic timetables; no checking progress against
    expectations.
  - **Overambitious design** — an unwieldy centralised model chosen to cut cost
    and force uptake, ignoring user satisfaction, confidentiality, and the fact
    that a long project gets overtaken by new technology.
  - **Strategy and skills** — no clear direction, weak project management, no exit
    strategy; setbacks became system-wide failures.
- The 2011 press release stressed the **inappropriateness of a centralised
  authority making top-down decisions on behalf of local organisations**. The DOH
  called instead for **"connect all" rather than "replace all"** — local
  decision-making, modular and incremental change.
- Only about **one third** of healthcare IT projects succeed.
- The two factors constantly associated with successful IT implementation:
  **top-management support** and **user involvement**.
- Central argument: there is **no such thing as an "IT failure"** — technology
  failures are more accurately **management failures**; the label "IT failure"
  wrongly excuses management. "It is people, not technology, that make the
  difference between success and failure."
- Recommended fix: a **phased / incremental change-management approach** driven
  from the local level, with change champions and genuine end-user engagement.

### Slide-sourced — Tutorial (Resource Management)

- Tutorial aim: practical resource management — planning, estimating, acquiring,
  allocating and developing resources for IT projects; building a **Resource
  Breakdown Structure (RBS)**; spotting over- and under-allocated resources;
  **resource leveling**; improving team productivity and morale with motivation
  theories.
- Part A — for a Mobile Banking App, list all resources and draw a simple
  hierarchical RBS (people, hardware, software/licences, facilities, materials).
- Part B — allocation table to analyse:
  | Team member | Task hours assigned | Availability |
  |---|---|---|
  | Dev 1 | 50 | 40 |
  | Dev 2 | 30 | 40 |
  | QA 1 | 35 | 40 |
  | QA 2 | 40 | 40 |
  Dev 1 is **over-allocated** by 10 hours (125% loaded); Dev 2 (75%) and QA 1
  (87.5%) are **under-utilised**; QA 2 is exactly at capacity. Suggest a
  **resource leveling** plan: move ~10 hours of Dev 1's work to Dev 2 (and/or
  shift task timing) so no one exceeds availability.
- Part C — a QA team is underperforming through low motivation; suggest
  productivity/morale strategies and name the **motivation theory** that applies
  and why (Maslow's hierarchy of needs, Herzberg's two-factor
  motivators/hygiene, McGregor's Theory X / Theory Y, Vroom's expectancy theory).
- Part D — project evaluation: review the Suggested Weekly Progress document, use
  the Canvas templates, and keep the project board updated by moving tasks
  **Backlog → Ready → In Progress → In Review → Done**.

### Video-only content

- **n/a — there is no Week 7 lecture recording.** Only the slide PDF and the two
  readings were provided, so there are no announcements, asides, in-class
  Mentimeter results or verbal-emphasis points to capture beyond what is printed
  on the slides. (The deck does include a "Muddy Card" Mentimeter link and a
  written "End of Lecture Questions" list — those are slide-sourced and are
  turned into practice questions below.)

## Post-lecture Q&A

**n/a for Week 7 — no lecture recording, so there is no post-lecture
teacher/student discussion to summarise.** The in-deck "End of Lecture
Questions", the in-deck cloud-migration case study, and the tutorial-sheet
worksheet prompts are the closest equivalent and are all covered as practice
questions (see list below).

---

## Worksheet / in-deck discussion prompts turned into practice questions

**Lecture deck — "End of Lecture Questions" slide:**

- Difference between a positive and a negative risk, with an IT example of each
  → Paper 2 MCQ + multi on threat vs opportunity and response strategies.
- Difference between qualitative and quantitative risk analysis → Paper 2 MCQ
  contrasting the two, plus a Monte Carlo / probability-impact-matrix MCQ.
- The four main strategies for responding to negative risks → Paper 2 multi
  (avoid / mitigate / transfer / accept) and an "escalation is not one of the
  four" distractor MCQ.
- How a risk register helps project decision-making → Paper 2 MCQ on the
  register as a living decision-making / accountability tool.
- How risk escalation differs from risk transfer → Paper 2 MCQ directly
  contrasting escalation (out of scope → program/portfolio) with transfer
  (third party keeps the risk, e.g. insurance/SLA).

**Lecture deck — in-deck cloud-migration case study slide:**

- Classify each of the five listed risks as positive or negative → Paper 2 MCQ
  (AI monitoring tool = opportunity; the other four = threats).
- Assign each risk to a category (Market/Financial/Technology/People/
  Structure-Process) → Paper 2 multi matching risks to categories.
- EMV of a 25% chance of data loss costing $200,000 → Paper 2 MCQ (EMV =
  0.25 × 200,000 = $50,000).
- Contingency/fallback plan for the senior developer who might leave → Paper 2
  MCQ on people-risk contingency (knowledge transfer / cross-training /
  documentation / retention).

**Lecture deck — "Muddy Card" Mentimeter slide:**

- The deck asks students to post an unclear topic or a question → covered
  indirectly by the broad-coverage MCQs on the 6 processes.

**Tutorial sheet prompts:**

- Part A — identify all resources for a Mobile Banking App and draw a simple
  hierarchical RBS → Paper 1 MCQ + multi on what an RBS is and what its branches
  contain.
- Part B — identify over-allocated and under-utilised resources from the hours
  table and propose a resource-leveling plan → Paper 1 MCQs on the Dev 1
  over-allocation (125%), the under-utilised resources, and what resource
  leveling does (and its schedule side-effect), plus a leveling-vs-smoothing
  MCQ.
- Part C — strategies to lift a demotivated QA team, and which motivation theory
  applies and why → Paper 1 MCQs on Maslow, Herzberg two-factor,
  McGregor Theory X/Y and expectancy theory applied to the QA-team scenario.
- Part D — review Suggested Weekly Progress, use templates, move tasks
  Backlog → Ready → In Progress → In Review → Done → Paper 1 MCQ + truefalse on
  the board workflow and the weekly progress evaluation (continuity with Week 4).
