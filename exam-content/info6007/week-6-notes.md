# INFO6007 Week 6 — Study Notes

Week 6 has **two different topics** because the lecture and the tutorial are
one week out of step with each other:

- **Lecture (Paper 2):** Resource Management Plan — the 6 resource processes,
  leadership and motivation theory, RACI / RBS / histogram, resource loading
  and leveling, Tuckman, conflict modes, productivity / availability / cost
  calculations, Agile resource management, plus a **guest talk** on project
  and product management in a space-imaging startup (video only). The
  Simply Psychology reading on Maslow's hierarchy is folded into this paper.
- **Tutorial (Paper 1):** Quality management tools and Cost of Quality —
  fishbone, checksheet, Pareto / run chart, CoC vs CoNC, the $2,000 vs
  $20,000 prevention trade-off, plus the Part C weekly progress evaluation.
  (This applies the Week 5 quality lecture; the tutorial trails the lecture by
  a week. The Week 7 tutorial is in turn the Resource Management worksheet.)

The lecturer only reached **"Acquiring resources"** in the recording (he said
"we'll discuss from this point onwards next week") and then handed over to the
guest speaker. The deck is still fully covered because the slides are the
exam material.

---

## Important points

### Slide-sourced — Lecture (Resource Management Plan)

**What resource management is**

- Identifying, acquiring and managing the **human** and **physical / technical**
  resources a project needs.
- IT-specific reasons it matters: specialised roles (cloud engineers, data
  scientists, cybersecurity), resources shared across projects, licences /
  cloud credits / hardware planned in advance; poor planning gives conflicts,
  delays and higher cost.

**The 6 processes (PMBOK overview figure)**

1. Plan Resource Management — how to estimate, acquire, manage and use
   resources; outputs: resource management plan, team charter.
2. Estimate Activity Resources — types and quantities per activity; outputs:
   resource requirements, basis of estimates, **RBS**.
3. Acquire Resources — obtain people, physical and material resources; outputs:
   physical resource assignments, project team assignments, resource calendars.
4. Develop Team — improve competencies, interaction, environment.
5. Manage Team — track performance, feedback, resolve issues, coordinate
   changes.
6. Control Resources — monitor utilisation, resolve conflicts, adjust.

**Managing people**

- Human performance is **variable** (skills, motivation, communication,
  culture). Key aspects: leadership and motivation, communication, conflict
  resolution, performance management, team development.
- **Leadership vs management:** leadership inspires, motivates, enables
  collaboration; management plans, organises, controls resources.
- **Leadership styles:** Autocratic (fast, good in a crisis / outage; low
  motivation), Democratic (innovation and engagement; slower, conflict risk),
  Laissez-faire (works with skilled self-motivated teams; can cause
  confusion). Adapt to environment, team maturity and culture. Slide: directive
  in an incident, participative in design, hands-off with trusted specialists.
- **Intrinsic vs extrinsic motivation:** intrinsic = enjoyment, mastery,
  accomplishment; extrinsic = money, recognition, promotions, avoiding
  punishment.
- **Maslow:** physiological → safety → love and belonging → esteem →
  self-actualisation; lower needs met before higher ones motivate.
- **Herzberg:** motivators (job content; achievement, recognition,
  responsibility, advancement, growth, meaningful work) vs hygiene factors (job
  context; salary, policies, job security, working conditions, supervision,
  colleague relationships). Missing hygiene = dissatisfaction; present hygiene
  does not motivate. Missing motivators = lack of motivation, not necessarily
  dissatisfaction.
- **Covey's 7 habits:** be proactive; begin with the end in mind; put first
  things first; think win-win; seek first to understand then to be understood;
  synergize; sharpen the saw.

**Frameworks and tools**

- **Work definition and assignment:** requirements finalisation → how work will
  be done → break down the work (WBS, activity definitions) → assign the work
  (OBS, responsibilities).
- **RACI:** Responsible (does), Accountable (answerable, approves), Consulted
  (input before, two-way), Informed (updates, one-way). Prevents confusion,
  overlaps, accountability gaps. Sample chart: car owner / shop owner /
  mechanic / parts supplier.
- **RBS:** hierarchical breakdown of resources by category and type;
  complements the WBS. 3 levels: categories (Human, Equipment, Software,
  Materials) → subcategories (roles, tools) → specific resources (names,
  versions, servers, licences). Slide diagram: People / Material / Equipment.
- **Resource histogram:** bar chart, X = time periods, Y = usage (hours, FTEs,
  number of resources); spots over-allocation. Sample: managers, business
  analysts, programmers, technical writers Jan–June (peak 7 people Mar–May).

**Estimating activity resources**

- Resource types: human, equipment / hardware, software / tools, materials.
- Techniques: expert judgement, analogous, bottom-up (most accurate, slowest),
  three-point (PERT).
- Questions to ask: difficulty, unique scope, full- vs part-time, multitasking,
  conflicts with other projects, hardware / software / tools, licences,
  constraints.
- NSW Digital Driver Licence table: app development = bottom-up; system
  integration = expert judgement; security and privacy assurance = expert
  judgement; trials and rollout = analogous + parametric.

**Acquiring resources, loading and leveling**

- Methods: internal (culture, faster onboarding), external (hire, contractors,
  consultants), procurement (vendors), multi-source.
- Acquiring steps: confirm needs → pre-assign → negotiate → provision.
- **Resource loading:** Resource Load = ∑ allocated hours ÷ available hours
  (hours, days or FTE per period); detects over-allocation / under-use.
- **Resource leveling:** resolve over-allocation by adjusting the schedule or
  redistributing resources; techniques: delay, split, reassign, adjust work
  hours. Slide example: delaying activity C by its 2 days of slack drops the
  peak from 8 to 6 workers without moving the end date (links to Week 3 float).

**Developing the team**

- Purposes: skills, collaboration, motivation, quality, trust. Aspects: training
  / mentoring, trust activities, recognition, prompt conflict handling,
  clear responsibilities.
- **Tuckman (1965):** Forming, Storming, Norming, Performing, Adjourning; the
  PM is facilitator, coach and mediator.
- Tools: RACI (roles), resource allocation tools (availability / workload),
  collaboration tools (communication), performance tracking, surveys / feedback.
- Reward and recognition: monetary, non-monetary, career-based, team-based.
- Monitor (Develop Team slide): skills, cohesion, engagement, satisfaction.

**Managing the team**

- Conflict modes: Competing (high A / low C; quick decision), Collaborating
  (high / high; complex issues), Compromising (moderate / moderate; time
  pressure), Avoiding (low / low; minor issues or high emotion), Accommodating
  (low A / high C; preserve relationships).
- **5 dysfunctions:** absence of trust, fear of conflict, lack of commitment,
  avoidance of accountability, inattention to results.
- Strategies: RACI roles, open communication, appropriate leadership style
  (transformational, servant, situational), address conflict early, acknowledge
  contributions. Rule: address conflict, overload or low motivation early, then
  adjust assignments, support or style.

**Controlling resources**

- Loop: collect usage data → compare with plan → analyse shortages → reallocate
  or replace → update and communicate. Monitor availability, utilisation,
  shortages, condition / calendars.

**Productivity, availability, cost**

- Productivity = efficiency of using resources; availability = accessible and
  ready when needed; cost = expenditure to acquire, use and maintain.
- Cost-based decision: actual time = effort ÷ productivity; cost = time × $/hr.
  Schedule-based: available time = actual time ÷ availability.
- Worked scenario (90 effort hours): Bill 60% / 50% / $45 → 150 h, $6,750,
  300 h available; Mary 120% / 40% / $80 → 75 h, $6,000, 187.5 h; Minh 100% /
  40% / $60 → 90 h, $5,400, 225 h. **Cost: Minh. Schedule: Mary.**

**Agile resource management**

- Match capacity to sprint goals; plan on available time, skills and workload,
  not full availability; capacity planning; sprint planning balances priorities
  with capacity; monitor overload / bottlenecks / burnout; re-balance often;
  cross-functional teams reduce handoffs. Steps: scope → identify → estimate →
  allocate and schedule → monitor. Best practices: communication,
  continuous monitoring, flexibility, stakeholder involvement, documentation.

**End-of-lecture questions and case study**

- Acquiring process and challenges; how the RBS helps; tools to track
  allocation; define productivity / availability / cost; how leveling improves
  availability and cost efficiency; automation, cross-training and flexible
  scheduling.
- Cloud Banking case (12 weeks, 3 backend + 2 frontend devs, 2 QA, 1 DevOps,
  $100,000): Backend Dev 1 on leave (availability), DevOps struggling
  (productivity), QA multitasking, cloud server usage over budget (cost).

### Slide-sourced — Reading 1: Maslow's Hierarchy of Needs (Simply Psychology, updated Aug 2025)

- Five tiers; the first four are **deficiency needs** (D-needs), the top is
  the **growth / being need** (B-need).
- Later Maslow: order "not nearly as rigid", need not be 100% satisfied
  first, behaviour is multi-motivated.
- Expanded model adds **cognitive, aesthetic and transcendence** needs.
- Criticisms: no empirical work from Maslow himself; rigid progression
  challenged (athletes, deadlines, poverty studies); Tay and Diener (about
  60,000 people, 123 countries): needs universal but not in strict order —
  "needs are like vitamins".
- Workplace: esteem = performance reviews, mentoring roles, merit promotions;
  self-actualisation = fostering innovation, sponsoring education; safety =
  anti-harassment, psychological safety, pay transparency; physiological =
  healthcare, wellness.
- Compared with Herzberg (lower needs ≈ hygiene, higher ≈ motivators) and
  Alderfer's ERG (Existence, Relatedness, Growth; simultaneous, can move back).

### Slide-sourced — Tutorial (Quality tools and Cost of Quality)

- **Part A, Scenario 1 (payroll errors):** fishbone (Ishikawa) with the
  problem at the head; three preventive measures (automated payroll testing,
  code review and validation, data validation and regular updates); a
  checksheet by defect type × release.
- **Part A, Scenario 2 (intermittent crashes):** choose two tools to spot
  trends / patterns — run chart (crashes over time) and Pareto chart (biggest
  causes) in the worked answer; control chart and scatter diagram are also
  valid Week 5 tools.
- **Part B:** $8,000 internal fix; skipping prevention saves $2,000 but risks
  $20,000 external failure. CoC = prevention + appraisal; CoNC = internal +
  external failure. Trade-off and recommendation: keep the $2,000 prevention.
- **Part C:** each member explains progress in the past week and plan for next
  week, and shows work evidence (Suggested Weekly Progress PDF on Canvas).

### Video-only content

**Announcements / weekly evaluation remarks (start of recording)**

- Weekly evaluations overran, so the lecture started late.
- Observations from evaluations: tickets must be **assigned to specific
  individuals**; explain **progress to date and plan for next week**; ticket
  names should be **descriptive**; use a **shared folder** and **link each
  ticket to the exact place in the document** (for example the cost management
  plan) so it is easy to check at the end of the semester.
- Lecture will be short today; **remaining content continues next week**.
- Mid-semester survey response was around 35%; the lecturer wants about 50%.
- Another guest speaker is being lined up for Week 10 or 11.
- The lecturer will be preparing the exam paper and practice questions next
  week.

**In-class questions the lecturer asked (the most examinable are in the 30-question practice paper)**

- "What resources do you need for a project?" (money, humans, infrastructure,
  software / licences) — two types: humans and physical / technical.
- "What is the most important resource in a company?" (money vs people; people
  are needed to handle everything else, though not necessarily the most
  expensive).
- "When I say red, what comes to mind?" (danger vs delight; culture differences
  in managing people).
- "Who comes to mind when I say leader?" and autocratic / democratic /
  laissez-faire examples; a leader can be different types at different times.
- Intrinsic vs extrinsic (his own examples); pay alone fine for casual short
  work, not for long-term commitment.
- Maslow with a job-advert mapping (salary, safety and resources, community,
  prestige, career direction); riot and sleep examples.
- Herzberg: unpaid salary (hygiene) vs professional development or bonus
  (motivator).
- Covey habits with the lecturer's own examples (backup plans, end in mind,
  first things first).
- RACI worked examples: shipping an order; preparing the exam paper.
- Estimating: one person handling many tasks (do not give UX design to a
  developer).

**Guest talk (project and product management in a startup)**

- The startup images satellites from other satellites and analyses the images;
  founded 2016, ~40 sensors in orbit, customers in 10+ countries.
- The speaker prefers "product delivery" to "project": a project feels
  internal and one-off; the goal is customer-centric, reusable work.
- Planning cascade: company goals → ~two-year strategic initiatives →
  quarterly product and technology goals → two-week sprints (Scrum-leaning
  but light). Quarterly split about **90% core product, 10%
  customer-specific project-like work**.
- Mixing contracts with other work stops one customer over-tuning the product.
- Feedback loops: CI/CD, release early, be transparent about completeness;
  hard in B2B / government sales.
- Bespoke request: do we back ourselves to build it within the contract, and
  can we achieve it; tell the customer which parts will be challenging.
- Challenges: time zones and handovers between sales, product delivery and
  engineering; growth from about 14-15 people in 2023 to about 52; managing a
  growing product line.

## Post-lecture Q&A

The recording ends with the guest speaker's Q&A (the lecturer then closes the
session); there is no separate class Q&A about the resource material.

- **How did you come up with the idea, given how unusual it is?** — Started as
  an asteroid-mining company; the technology was cameras in space, so they
  pivoted to imaging other satellites. Australia was lightly regulated for this,
  which let them be first. To avoid the cost of building and launching
  satellites, they partnered with Earth-observation operators and pointed
  those satellites at other satellites when idle — zero capital cost, only
  operating cost — and now also send their own cameras selectively.
- **How do you handle much bigger, better-funded competitors?** — Focus on
  what you can control and on the speed of learning; stay high-touch with
  customers (fly out and sit with them); rely on the sensor network as a moat
  (Uber analogy: coverage is hard to copy).
- **Confidence in using the sensor network?** — Question was cut off; the
  lecturer wrapped up. (Not turned into a question.)
- Closing remarks: thanks to the speaker; hope to line up another speaker for
  Week 10 or 11; good luck with evaluations and assignments.

No exam hints were given in the recording.

---

## Transcript questions and slide prompts turned into practice questions

Paper 2 (lecture) is trimmed to the 30 core, exam-style questions; the mappings
below show where each topic is covered. Topics marked *(not in paper)* were
dropped as recall-level or non-core.

**Recording — lecturer questions to the class (Paper 2 unless stated):**

- Resources for a big IT project → multi on resource-type classification
  (people, equipment, materials, software).
- Most important resource / people variable; "red" example → *(not in paper)*.
- Leader examples and autocratic / democratic / laissez-faire → mcqs on the
  crisis-outage scenario and the team that suits a laissez-faire leader.
- Intrinsic vs extrinsic; pay for short-term vs long-term work → *(not in
  paper)*.
- Maslow job-advert mapping → multi; riot example → *(not in paper)*.
- Herzberg unpaid salary → mcq; hygiene factors → multi; Maslow vs Herzberg
  (reading) → mcq; Maslow's clarification of the order (reading) → *(not in
  paper)*.
- Covey habits → scenario mcq (proactive backup plans).
- RACI shipping / exam-paper examples → mcq (exam paper) and RACI reading mcq.
- RBS example (people, material, equipment; material → physical + software)
  → three-level RBS path mcq and RBS-vs-WBS true/false.
- Resource histogram example → mcq on reading the chart.
- Estimating: one person, many tasks → *(not in paper)*.
- Acquiring: internal / external / multi-source → mcq on multi-source.
- Weekly evaluation observations → Paper 1 multi and mcq.
- Guest talk points → *(not in paper; not treated as core examinable content)*.

**Lecture deck — "End of Lecture Questions":**

- Acquiring process and challenges → mcq on the Acquire Resources definition
  (versus the other processes) and multi-source acquisition.
- How an RBS helps → mcq on three-level paths and a true/false on the WBS
  relationship.
- Tools to track allocation → resource loading mcq (over-allocation) and the
  histogram-reading mcq.
- Define productivity, availability, cost → worked calculation mcqs (Bill,
  Mary, Minh cost and schedule; Nora).
- How leveling improves availability and cost → leveling techniques multi, the
  slack-based example mcq and a true/false on schedule impact.
- Role of automation, cross-training, flexible scheduling → strategies multi in
  the case study (cross-train, reassign, adjust hours).
- Agile resource management → one mcq (capacity matching versus fixed allocation).

**Lecture deck — Cloud Banking case study:**

- Key challenges, DevOps productivity monitoring → *(not in paper)*.
- Cover for Backend Dev 1's leave → multi of strategies.
- Fixed budget prioritisation → mcq.

**Tutorial sheet:**

- Part A Scenario 1 (fishbone, three preventive measures, checksheet) → Paper 1
  mcqs and multi on the diagram, causes, cause-to-measure pairing, checksheet
  reading and Pareto 80/20 calculation.
- Part A Scenario 2 (two tools for trends / patterns) → Paper 1 mcqs on run
  chart, Pareto chart, scatter diagram and a multi of pattern tools.
- Part B (CoC vs CoNC, trade-offs, minimise total CoQ) → Paper 1 mcqs and multis
  on classifying $2,000 / $8,000 / $20,000, net effect, best action and
  trade-offs.
- Part C (weekly progress evaluation) → Paper 1 multis, mcq on scoring, and a
  true/false.

**Source caveats**

- The Vault note for Week 6 matches the tutorial sheet (quality tools), but its
  worked answer files the $8,000 internal fix under Cost of Conformance; the
  Week 5 lecture (and this paper) classifies it as an internal failure cost, part
  of the Cost of Non-Conformance.
- The run chart is not on the Week 5 slides; it is used because the tutorial
  answer chose it, alongside the Pareto chart.
- The recording is a speech-to-text transcript (base model); "startup name" and
  a few terms were misheard, so questions do not depend on the company name.
