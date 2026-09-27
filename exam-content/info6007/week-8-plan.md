# INFO6007 Week 8 — Planner Output

Two papers, per the authoring guide and per this week's topic mismatch (see
`week-8-notes.md` Section 0): `TUTORIAL_PAPER` (paperNumber 1, **Risk
Management** — the Week 7 lecture topic, applied fresh to a **Mobile Banking
App** scenario from the actual Week 8 tutorial sheet) then `LECTURE_PAPER`
(paperNumber 2, **Procurement Management** — this week's real lecture topic).
`export const WEEK_8_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];`

Continuity note: Week 7's `LECTURE_PAPER` already drilled risk-response
strategies (avoid/mitigate/transfer/accept/escalate; exploit/enhance/share/
accept), the probability-impact matrix, EMV, Delphi/brainstorming/SWOT, and
residual risk — using the **NSW Digital Driver Licence** and a **cloud-
migration** case. The Week 8 tutorial reuses the same theory on a **different,
brand-new case (Mobile Banking App — AI spending insights + biometric
authentication)** pulled from the actual tutorial sheet PDF (`tutorial/
Tutorial sheet INFO6007 Week 08 .pdf`, Parts A–D: Risk Identification / Risk
Analysis / Risk Response Planning / Project evaluation). This is intentional
second-exposure practice, not duplication — every Week 8 tutorial question
must be new and Mobile-Banking-specific (or, in the mixed-review round, an
explicit new Week 7 connection), never a re-skin of a Week 7 NSW/cloud
question.

Self-contained numbers rule applied throughout: every fact a question needs
(the Make-or-Buy $1,100,000 / $1,190,000 / $90,000 numbers, weighted-scoring
supplier totals, the TechSolutions case facts, any probability/impact figures
for the Mobile Banking App) is either stated on a preceding reading card or
restated inline in that question's own prompt. Nothing ever says "the
deck/slides/tutorial sheet/video says X."

---

## LECTURE_PAPER — Procurement Management (paperNumber 2)

Source files: `exam-content/info6007/week-8-notes.md`,
`exam-content/info6007/week-8-learning.md`,
`lecture/Lecture - INFO6007 Week 08 - Procurement Management Plan.pdf`,
`lecture/Week 08 - Project Ma-s1-low.transcript.md`.

Target ~50 questions.

### Quota checklist (paper-level, Writer should land within ~1-2 of each)
| type | target | planned |
|---|---|---|
| mcq | 26 | 27 |
| multi | 10 | 9 |
| truefalse | 2 | 2 |
| fillblank | 3 | 3 |
| match | 3 | 3 |
| order | 3 | 3 |
| sort | 3 | 3 |
| **total** | **~50** | **50** |

At least 10 questions must be "why / what happens if" framed (marked
**[WHY]** below — exactly 10 tagged).

### Lecture-quiz question coverage map (all 7 answerable questions must land; Q8 excluded)
| # | Topic | Round / question | Notes |
|---|---|---|---|
| Q1 | Menti poll — catering supplier → best evaluation method | Round E, E1 | Scenario facts (food safety/insurance/hygiene primary, price/menu secondary) restated inline — already self-contained in the notes, keep verbatim-equivalent. Answer: Checklist. |
| Q2 | rhetorical — "What is MVP?" | Round H, H2 | fillblank. Answer: Minimum Viable Product. |
| Q3 | rhetorical — "What is SLA?" | Round H, H1 | Answer: Service Level Agreement, with the university exam-complaint response-time example from the notes restated inline. |
| Q4 | pause-and-think — Make-or-Buy worked numbers | Round B, B1 | Numbers ($1,100,000 / $1,190,000 / diff $90,000) carried by Round B's reading card. Answer: Alternative 1 (Make Internally). |
| Q5 | pause-and-think — carpenter scenario, best for homeowner | Round D, D1 | Answer: Fixed Price. |
| Q6 | same scenario, best for supplier | Round D, D2 | Answer: Cost Reimbursable or Time & Materials. |
| Q7 | rhetorical — why Australia outsources | Round G, G1 | Holden/Ford/Toyota facts (ceased local manufacturing ~2015–2020, expensive labour) restated inline. Answer: cost efficiency / expensive local labour. |
| Q8 | Menti "Muddy Card" — open student reflection | — | **Excluded per Reader notes** — no single correct answer, explicitly flagged as not suitable for exam-question authoring. |

Post-lecture Q&A: per `week-8-notes.md` Section 4, no substantive
content-clarifying exchange occurred (repeated "all good"/no-response
check-ins; the only concrete items were administrative — mid-semester break,
teaching-survey results, group-project due date). None of these clear up a
confusable concept, so no additional practice question is authored from
Section 4 beyond what the group-project due date already covers in Week 7's
paper.

### Round-by-round plan

**Round A — Procurement Management Overview (no lecture-quiz item)** — card:
"throwing a party, buying in what the kitchen can't make" analogy (from
`week-8-learning.md` §1) + the 3-process flow diagram (reuse its `flowchart
LR`: Plan Procurement Management → Conduct Procurements → Control
Procurements). No specific numbers needed. 3 questions:
1. mcq — definition/importance applied to a NEW example (a fintech startup
   buying cloud infrastructure and hiring an external compliance auditor)
   rather than the NSW Driver Licence example.
2. multi — select ALL genuine effects of procurement on a project (good
   procurement → right resources on time/budget/quality; poor procurement →
   delays/cost overruns/failure) vs a distractor effect that's false (e.g.
   "procurement quality has no bearing on project schedule").
3. **[WHY]** mcq — what happens if a team skips Plan Procurement Management
   and jumps straight into vendor negotiation? (misaligned scope, no
   evaluation criteria, weak leverage in negotiation).

**Round B — Make-or-Buy Analysis (carries Q4)** — card: cook-vs-takeout
analogy + the worked numeric example stated in full ($1,100,000 Make vs
$1,190,000 Buy, differential $90,000) + the 6 decision factors (cost, time,
quality, expertise/skills, control/confidentiality, strategic importance).
4 questions:
1. mcq **[Q4]** — using the card's exact numbers, which alternative is more
   cost-effective? Answer: Alternative 1 (Make Internally).
2. mcq — a NEW numeric example with different totals (e.g. Make totals
   $850,000, Buy totals $760,000) — apply the same comparison logic; numbers
   stated inline in this question's own prompt (a second scenario, not the
   card's).
3. multi — select ALL factors genuinely part of Make-or-Buy Analysis (cost,
   time, quality, expertise, control/confidentiality, strategic importance)
   vs a plausible-but-wrong distractor (e.g. "which option looks better in a
   press release").
4. **[WHY]** mcq — what happens if a company picks "Buy" based only on the
   lowest unit price, ignoring vendor lead time and reliability? (hidden
   schedule/quality risk not captured by the raw cost comparison).

**Round C — RFP vs RFQ (no lecture-quiz item)** — card: driveway-quote vs
architect-pitch analogy + the RFP/RFQ comparison table + the NSW example (RFP
for independent security testing, RFQ for standard items). 4 questions:
1. mcq — apply RFP-vs-RFQ choice to a NEW pair of needs (buying 50 identical
   off-the-shelf laptops vs commissioning a custom AI recommendation engine).
2. **match** — match 4 features (price-centric evaluation; used when
   requirements need vendor creativity; short decision cycle; evaluated on
   technical + financial + qualitative factors) to RFQ or RFP.
3. **[WHY]** mcq — what happens if a buyer issues an RFQ for a complex,
   poorly-defined AI project instead of an RFP? (vendors quote against
   assumptions, comparisons become meaningless, wrong solution risk).
4. **fillblank** — the RFP process: "buyer prepares RFP → RFP published to
   vendors → vendors prepare ___ (solution, cost, schedule) → buyer evaluates
   using selection criteria → vendor selected, negotiation begins." Blank =
   "proposals".

**Round D — Contract Types & Risk (carries Q5, Q6)** — card: carpenter
payment analogy + the 3 main types + sub-type names + the risk continuum
(reuse `week-8-learning.md` §4's `flowchart LR`, extended to the full 7-point
order: CPPC → CPFF → CPIF → CPAF → FPI → FP-EPA → FFP). 5 questions:
1. mcq **[Q5]** — homeowner-and-carpenter scenario restated: which contract
   type is most beneficial for the homeowner? Answer: Fixed Price.
2. mcq **[Q6]** — same scenario: which is most beneficial for the carpenter
   /supplier instead? Answer: Cost Reimbursable or Time & Materials.
3. **order** — order the 7 contract types from riskiest-for-buyer to
   riskiest-for-seller (CPPC → CPFF → CPIF → CPAF → FPI → FP-EPA → FFP),
   grounded in a one-line reminder of what buyer-risk/seller-risk means.
4. **sort** — sort 6-7 short contract-clause examples into Fixed-Price /
   Cost-Reimbursable / Time-and-Materials (3 groups) — e.g. "$50,000 total, no
   matter how long it takes" (Fixed-Price); "seller billed hourly plus
   materials used" (T&M); "seller reimbursed actual cost plus a fee tied to
   buyer satisfaction" (Cost-Reimbursable, CPAF-flavoured).
5. **[WHY]** mcq — what happens under a CPPC (Cost Plus Percentage of Cost)
   contract specifically? (seller is reimbursed cost *plus a percentage of
   that cost*, so they have no incentive to control spending — the riskiest
   arrangement for the buyer).

**Round E — Vendor Evaluation Methods (carries Q1)** — card: babysitter-
hiring analogy (checklist vs weighted scoring vs ongoing scorecard) + the
weighted-scoring worked example (Supplier A total 1.90, Supplier B total
2.75, weights Integrity 0.20/Industry Expertise 0.35/Experience 0.20/
Financial Strength 0.25). 6 questions:
1. mcq **[Q1]** — the catering-supplier scenario restated (compliance/food
   safety/insurance primary, price/menu secondary): which method is most
   suitable? Answer: Checklist.
2. **fillblank** — a NEW scenario needing multiple weighted factors (e.g.
   choosing a software vendor where cost, technical capability and delivery
   speed all matter, no single compliance gate) — "The evaluation method
   that applies a percentage weight to each factor and sums the scores is
   called the ___." Blank = "Weighted Scoring Model".
3. mcq — a NEW scenario needing Vendor Scorecard (an existing long-term
   supplier's ongoing monthly performance is being tracked).
4. mcq — apply the weighted-scoring calculation with NEW weights/scores (2
   suppliers, different numbers than the card's Supplier A/B) — compute which
   supplier wins and by how much.
5. multi — select ALL genuine vendor-evaluation criteria (cost/pricing,
   quality of goods/services, technical capability, customer service and
   support) vs a distractor (e.g. "the vendor's number of social media
   followers").
6. **[WHY]** mcq — what happens if a company always selects the lowest-cost
   vendor without running a checklist or weighted scoring first? (risk of
   non-compliance, poor quality, or missing a mandatory certification).

**Round F — Procurement Risk Management (no lecture-quiz item)** — card:
custom-wedding-cake analogy + the 5 risk categories (cost, schedule, quality,
compliance/legal, operational) + the 5-step process (identify → assess →
mitigate → monitor → respond/contingency), reusing `week-8-learning.md` §6's
`flowchart LR`. 5 questions:
1. **sort** — sort 6-8 new procurement-risk examples into Cost / Schedule /
   Quality (3 of the 5 categories).
2. **order** — order the 5-step procurement risk-management process,
   grounded in a new scenario (a vendor supplying test devices for an app
   launch).
3. multi — select ALL genuine risk-mitigation moves for a NEW cost-risk
   scenario (fixed-price contract, multi-year price lock, hedging) vs a
   distractor that doesn't actually mitigate cost risk (e.g. "verbally
   reminding the vendor to be careful with spending").
4. **[WHY]** mcq — what happens if a team sets up vendor KPIs but never
   actually monitors them after contract award? (issues go undetected until
   they're expensive to fix; no early warning for disputes).
5. multi — select ALL of the 5 genuine procurement risk categories (cost,
   schedule, quality, compliance/legal, operational) vs a distractor category
   that isn't one of the 5 (e.g. "aesthetic risk").

**Round G — Project Outsourcing Types & Sourcing Models (carries Q7)** —
card: restaurant-kitchen analogy (partial vs complete outsourcing) + the
outsourcing-models table (onshore/nearshore/offshore/hybrid/multisource/
insourcing). 6 questions:
1. mcq **[Q7]** — restated inline: "Australia previously had three car
   manufacturers — Holden, Ford and Toyota — and all three stopped local
   manufacturing between roughly 2015 and 2020, mainly because local labour
   was expensive." Why do companies in Australia most commonly outsource IT
   work today? Answer: cost efficiency / expensive local labour.
2. **sort** — sort 6-8 new outsourced-task examples into Complete Project
   Outsourcing / Partial Project Outsourcing / Business Process Outsourcing
   (3 groups).
3. **match** — match 4 new one-line vendor descriptions to Onshore / Nearshore
   / Offshore / Insourcing.
4. multi — select ALL statements that correctly describe Business Process
   Outsourcing (BPO) specifically (non-core process work — e.g. payroll,
   customer support, IT helpdesk) vs distractors describing IT/Technical
   outsourcing instead (e.g. cloud migration, AI model development).
5. multi — select ALL genuine benefits of outsourcing IT projects (cost
   reduction/global talent access, faster completion via experienced
   vendors, access to unavailable skills) vs a false distractor (e.g.
   "eliminates all project risk entirely").
6. **[WHY]** mcq — a NEW scenario illustrating a disadvantage of offshore
   outsourcing (a 10-hour time-zone gap causes a 2-day delay on every
   clarification question) — which disadvantage does this best illustrate,
   and why does it specifically hurt offshore more than onshore arrangements?

**Round H — Controlling Procurements & SLA (carries Q2, Q3)** — card:
kitchen-renovation analogy + the 5-step control flow (review deliverables →
check milestones/SLA → test acceptance criteria → manage approved changes →
verify invoice and close) + the SLA definition (university exam-complaint
response-time example from the notes). 5 questions:
1. mcq **[Q3]** — "What is SLA?" applied to a NEW example (a cloud host must
   restore service within 4 business hours of an outage report) — which term
   names this kind of promise, and is it met or breached given a stated
   restore time?
2. **fillblank [Q2]** — "The minimum working version of a product, built to
   test an idea before a full launch, is called the ___." Blank = "Minimum
   Viable Product" (accept "MVP").
3. **order** — order the 5-step Control Procurements flow, grounded in a new
   scenario (an accepted vendor delivering a security-testing report).
4. **[WHY]** mcq — what happens if a buyer releases payment before verifying
   the deliverable meets the contract's acceptance criteria? (loses leverage
   to require fixes; quality/compliance risk goes unmanaged).
5. multi — select ALL activities that belong to Control Procurements
   specifically (reviewing test reports, approving changes formally,
   verifying invoices before payment, monitoring service levels) vs
   distractors that belong to Conduct Procurements instead (issuing the RFP,
   holding a bidder briefing, negotiating the initial contract).

**Round I — Case Study: TechSolutions ERP (slide-only; facts restated inline
each time, no separate card since it's one scenario reused across the
round)** — 5 questions, each opening with (or referencing) these stated
facts: "TechSolutions Pty Ltd, a mid-sized Sydney manufacturer, is deploying
a cloud-based ERP system. The internal team handles project management,
system integration and change management. Outsourced tasks are ERP software
customisation, cloud deployment, data migration and cybersecurity audits,
handled respectively by an offshore ERP Development Vendor, an onshore Cloud
Hosting Provider, and a nearshore Cybersecurity Auditing Firm. Procured items
are servers, software licences and network infrastructure."
1. mcq **[Final-exam style case study]** — which of TechSolutions' own
   activities is insourced rather than outsourced or procured, and why?
   (project management/system integration/change management — kept in-house
   because it needs organisational context an outside vendor lacks).
2. **match** — match TechSolutions' 3 named vendors to their sourcing model
   (Offshore / Onshore / Nearshore).
3. **[WHY]** mcq — if the offshore ERP Development Vendor fails to deliver on
   time, which strategy from this week's material could have reduced that
   risk, and how? (multisourcing / lining up an alternative vendor in
   advance, rather than relying on a single offshore supplier).
4. mcq — which procurement risk category best fits a scenario where the
   nearshore Cybersecurity Auditing Firm's report is delayed by 3 weeks,
   pushing back the go-live date? Answer: Schedule risk.
5. mcq **[Final-exam style case study]** — TechSolutions must also buy
   servers, software licences and network infrastructure with well-defined,
   standard specifications. Which procurement document should it use to get
   competitive pricing on these, and why not the alternative? Answer: RFQ
   (well-defined, standardised, price-driven), not RFP.

### Final mixed review round (no card) — 7 questions
No card. At least 3 connect to earlier weeks (new questions, never copies).
No more than 2 consecutive on the same subtopic.
1. mcq **[earlier-week: Week 7]** — connects procurement risk mitigation
   (e.g. locking in a fixed-price contract to control a cost risk) to Week
   7's "mitigate" threat-response strategy, applied to a NEW scenario
   distinct from both Week 7's and this week's worked examples.
2. mcq **[earlier-week: Week 3]** — connects Control Procurements' "manage
   approved changes" step to Week 3's formal Change Control Process, via a
   new scenario (a vendor requests a scope change mid-contract) — what must
   happen before that change is accepted?
3. mcq **[earlier-week: Week 4]** — connects a procurement risk-exposure
   figure (a new small EMV-style number, stated inline) to Week 4's
   contingency reserve concept — what is this figure most directly used to
   justify sizing?
4. multi — jumbled: select ALL correct statements mixing outsourcing
   benefits and outsourcing risks across two different scenarios (new
   examples, not TechSolutions or the NSW case).
5. truefalse — "A Firm Fixed Price (FFP) contract places most of the cost
   risk on the buyer." Answer: False (it places most risk on the seller).
6. truefalse — new wording, distinct from Round E: "The Checklist evaluation
   method is best suited to procurements where meeting minimum compliance
   standards is critical." Answer: True.
7. **[WHY]** mcq — what happens if a company sets up a Vendor Scorecard for
   an ongoing supplier but the scorecard is never actually reviewed after
   the first month? (defeats the purpose of ongoing monitoring; declining
   performance — e.g. slipping on-time-delivery or defect-rate metrics —
   goes unnoticed until it's a crisis).

### Diagrams
- Round A: 3-process flow (`flowchart LR`, reused from `week-8-learning.md` §1).
- Round C: RFP process flow (reused from §3).
- Round D: contract risk continuum (`flowchart LR`, extended from §4 to all 7 points).
- Round F: 5-step risk-management process flow (reused from §6).
- Round H: 5-step Control Procurements flow (reused from §8).
- No diagram needed for Rounds B, E, G, I or the case-study round — these are
  numeric/tabular/classification ideas better served by the worked example or
  comparison table already in the card text.

---

## TUTORIAL_PAPER — Risk Management / Mobile Banking App (paperNumber 1)

Source files: `exam-content/info6007/week-8-notes.md` (Section 0 mismatch
note), `tutorial/Tutorial sheet INFO6007 Week 08 .pdf` (read directly for
this plan — Parts A–D), `exam-content/info6007/week-7.ts` (continuity only —
do not copy).

Target ~32 questions (tutorial papers run smaller, ~30–35 per the guide). No
new lecture-quiz pass applies here (the tutorial sheet has no video/quiz) —
instead every one of the sheet's 4 Parts must be represented, and Part D
(project board) is deliberately folded into the mixed-review round only,
since Week 7's tutorial paper already asked this exact board-order question
almost verbatim — a full new round here would be near-duplication.

Scenario facts to carry (stated on Round 1's card, then available for the
rest of the paper without needing restatement per question): "You are part of
a team building a new mobile banking app. It will include AI-driven spending
insights and biometric authentication (e.g. fingerprint/face login)." Risk
categories from the sheet: Market, Financial, Technology, People, Process.

### Quota checklist
| type | target |
|---|---|
| mcq | ~18 |
| multi | ~6 |
| truefalse | ~2 |
| fillblank | ~1 |
| match | ~2 |
| order | ~2 |
| sort | ~1 |
| **total** | **~32** |

At least 10 "why / what happens if" questions across this paper — heavy,
because Parts B and C of the tutorial sheet are inherently "why is this
prioritised" and "what should the response be" in nature.

### Round-by-round plan

**Round 1 — Risk Identification & Categorisation (Part A)** — card: the
Mobile Banking App scenario stated above + the 5 categories (Market,
Financial, Technology, People, Process) with a one-line description each +
positive (opportunity) vs negative (threat) framing. 5 questions:
1. mcq — classify a NEW risk ("a fake fingerprint or photo could fool the
   biometric login") — which category and which sign (threat/opportunity)?
   Answer: Technology, negative.
2. **sort** — sort 6-8 new risk examples into Market / Financial / Technology
   (3 of the 5 categories).
3. multi — select ALL POSITIVE (opportunity) risks from a mixed list of 6
   (e.g. "a fintech data partner offers richer spending-insight data" and
   "being first to market with AI insights attracts press coverage" are
   positive; "a biometric data breach exposes fingerprints" and "the AI
   model gives biased spending advice" are negative distractors).
4. **[WHY]** mcq — why does categorising each risk by type (Market vs
   Technology vs People, etc.) actually help the project team, beyond just
   listing risks? (routes each risk to the right expert/owner and shapes
   which response strategy is realistic).
5. mcq — distinguish a People risk from a Process risk using two NEW
   examples (an AI specialist resigning mid-project = People; an unclear
   internal approval step for storing biometric data = Process).

**Round 2 — Qualitative Risk Analysis (Part B)** — card: recap of the
probability-impact matrix (using Week 7's "rare but catastrophic still rates
high" lesson, restated with a fresh one-line reminder, not copied verbatim) +
a NEW mini worked pair specific to this app (stated on the card): "Risk 1 —
a biometric data breach exposing customer fingerprints: Low probability, Very
High impact. Risk 2 — minor glitches in the AI spending-insight
recommendations: High probability, Low impact." 5 questions:
1. **[WHY]** mcq — why does Risk 1 (the biometric data breach) still land in
   a High/Extreme priority band on the matrix despite its low probability?
2. mcq — where does Risk 2 (the minor AI glitches) land instead, and why is
   it treated as lower priority despite happening often?
3. multi — select ALL correct statements about qualitative risk analysis
   (estimates probability and impact, places risks on a matrix, does not
   require a statistical simulation) vs a distractor claiming it needs a
   precise numeric EMV calculation (that's quantitative analysis instead).
4. mcq — given a NEW third risk (state its probability/impact inline: "a
   regulatory delay to biometric data-storage approval: Medium probability,
   Medium impact"), rank it against Risk 1 and Risk 2 from the card — which
   is highest priority overall?
5. mcq — a stakeholder argues "Risk 2 happens most often, so it must be our
   top priority" — what's wrong with that reasoning?

**Round 3 — Threat Response Strategies (Part C, negative risks)** — card:
one-line recap of avoid/mitigate/transfer/accept/escalate, each illustrated
with a NEW mobile-banking micro-example (fresh wording from Week 7's scuba
app and NSW examples). 5 questions:
1. **[WHY]** mcq — the team decides to drop biometric login entirely and use
   password + one-time code instead, because spoofing risk can't be brought
   low enough. Why is this Avoidance and not Mitigation?
2. **fillblank** — "Keeping the biometric login but adding liveness detection
   to make spoofing much harder is an example of a response strategy called
   ___." Blank = "mitigate" (accept "mitigation").
3. mcq — the team signs a contract where the biometric SDK vendor is
   contractually liable for losses caused by false-accept security failures
   — which strategy is this? Answer: Transfer.
4. **[WHY]** mcq — a possible new national law might ban biometric data
   storage entirely, a decision far outside this project team's authority —
   what is the correct response, and why is it not simply "accept"? Answer:
   Escalate — the risk is outside the team's control and must go to a higher
   authority.
5. multi — select ALL valid strategies for a NEGATIVE risk/threat (avoid,
   mitigate, transfer, accept, escalate) vs a distractor that's actually a
   positive-risk/opportunity strategy (e.g. "exploit").

**Round 4 — Opportunity Response Strategies (Part C, positive risks)** —
card: one-line recap of exploit/enhance/share/accept, each with a NEW
mobile-banking micro-example. 3 questions:
1. **match** — match 4 new opportunity scenarios to Exploit / Enhance /
   Share / Accept (e.g. "signing an exclusive data-sharing deal with a
   fintech aggregator to guarantee richer AI insights" → Exploit; "extra
   training for the data-science team to improve the odds the AI feature
   gets positive press" → Enhance; "partnering with another bank's
   fraud-detection vendor to jointly build biometric fraud detection" →
   Share; "building one extra small feature only if spare capacity exists,
   without actively chasing it" → Accept).
2. **[WHY]** mcq — why is "signing the exclusive data-sharing deal" (Exploit)
   different from simply hoping a good data partner turns up on its own
   (Accept)?
3. mcq — distinguish Enhance from Exploit using a NEW pair of examples (extra
   training that only improves the *odds* of good press vs a signed deal
   that *guarantees* the collaboration happens).

**Round 5 — Risk Register & Response Planning (Part C, the register itself)**
— card: the risk-register field list (Risk, Category, Probability, Impact,
Response, Owner) with a one-line purpose for each field. 4 questions:
1. **match** — match 4 risk-register field names (Category, Probability,
   Impact, Owner) to their one-line purpose.
2. **[WHY]** mcq — why does a complete risk-register row need an "Owner"
   field, not just a chosen response strategy? (accountability — someone
   must actually monitor and act, or the strategy never gets executed).
3. **order** — order the risk-response-planning workflow: identify the risk
   → analyse probability and impact → place it on the matrix → choose a
   response strategy → assign an owner → monitor going forward (5-6 steps),
   grounded in a new mini-scenario (tracking the biometric-spoofing risk from
   Round 3 through to a monitored, owned response).
4. multi — select ALL information a complete risk-register row must actually
   contain (risk description, category, probability, impact, response,
   owner) vs a distractor that isn't part of the register (e.g. "the
   project's total budget").

**Round 6 — Agile/Hybrid Risk Practices & Stakeholder Engagement** — card:
one-line recap of Week 7's agile-vs-waterfall risk point, applied fresh to
this app (building the riskiest story first; involving stakeholders early).
3 questions:
1. **[WHY]** mcq — why would the team building this app in Scrum choose to
   build the biometric-authentication feature in Sprint 1 rather than Sprint
   8, given it's the least well-understood, highest-risk part of the app?
2. **[WHY]** mcq — why does involving compliance/legal stakeholders early
   (before biometric data handling is even designed) reduce project risk,
   compared with involving them only at final sign-off?
3. multi — select ALL genuine agile risk practices (periodic risk reviews,
   risk-based backlog prioritisation, burn-down charts as a supporting tool)
   vs a distractor describing a waterfall trait instead ("identify every risk
   fully upfront before any sprint begins, then never revisit the list").

### Final mixed review round (no card) — 7 questions
At least 3 connect to Week 7 (new questions, never copies of Week 7's NSW or
cloud-migration questions). No more than 2 consecutive on the same subtopic.
1. **truefalse [earlier-week: Week 7]** — "Choosing to drop a risky feature
   entirely, rather than reducing how likely or severe it is, is an example
   of mitigation, not avoidance." Answer: False (dropping it entirely is
   avoidance; mitigation only reduces probability/impact while keeping the
   feature).
2. mcq **[earlier-week: Week 7]** — a NEW small EMV-style scenario stated
   inline (e.g. "a 20% chance of a $50,000 regulatory fine tied to the
   biometric feature") — what is the EMV of this risk, and how would that
   figure typically be used?
3. mcq **[earlier-week: Week 6]** — connects the People-category risk of an
   AI specialist resigning (Round 1) to Week 6's resource-management
   concept of cross-training/knowledge transfer as a mitigation — why does
   this reduce the impact of that risk specifically, rather than its
   probability?
4. truefalse — new wording, distinct from Round 2: "A risk with Low
   probability but Very High impact should automatically be deprioritised
   below a risk with High probability but Low impact." Answer: False.
5. multi — jumbled: select ALL correct strategy-to-scenario pairings across
   both threats and opportunities, mixing Round 3 and Round 4 content with
   new examples not used in either round.
6. **order [earlier-week: Week 7 tutorial]** — order the project-board
   workflow (Backlog → Ready → In Progress → In Review → Done), grounded in
   a NEW scenario (tracking the biometric-risk mitigation task specifically)
   — distinct wording from Week 7's tutorial paper, which already asked this
   with a generic framing; this version must not be a copy.
7. **[WHY]** mcq — why should the qualitative risk analysis in Part B
   generally happen *before* detailed risk-response planning in Part C,
   rather than the other way around?

### Tutorial-sheet coverage map (all 4 Parts land)
| Sheet part | Round / question |
|---|---|
| Part A — identify ≥5 risks, categorise, positive/negative | Round 1 |
| Part B — qualitative risk analysis, probability-impact matrix | Round 2 |
| Part C — risk register + response strategy (threats) | Rounds 3 and 5 |
| Part C — risk register + response strategy (opportunities) | Round 4 |
| Part D — project evaluation / project board | Final mixed review, Q6 (deliberately not a full round — Week 7's tutorial paper already covers the board-order question; this is a lighter, differently-worded touch to avoid duplication) |

### Diagrams
- No Mermaid diagram is essential for this paper — Parts A-C are
  classification/analysis/response tasks better served by the card's
  worked examples and category lists than a process diagram. Round 5's
  risk-response-planning **order** question and the final round's project-
  board **order** question are both inherently sequential but short enough
  (5-6 and 5 steps respectively) to state as plain ordered lists in the
  question itself, per the `order` question type's own UI (shuffled steps),
  without needing a supporting `promptDiagram`.

---

## Cross-cutting reminders for the Writer stage
- Every question must be answerable from its own prompt + any preceding
  reading card + general knowledge — never "the deck/slides/tutorial sheet/
  transcript says."
- Cards teach via analogy + worked example + jargon decoder; questions apply
  the idea to a **new** example, never quoting a card sentence back as the
  answer.
- Keep every lecture-quiz question's core facts (Make-or-Buy numbers,
  catering scenario, carpenter scenario, Holden/Ford/Toyota facts) intact —
  these are already self-contained in `week-8-notes.md`, so restate them
  faithfully rather than inventing new numbers for those specific items.
- Distractors must be close/plausible, same length and specificity as the
  correct option — run `bun scripts/check-mcq-lengths.ts INFO6007` after
  writing and fix every flag.
- Check `correctIndex` distribution is roughly even across 0-3; run
  `bun scripts/shuffle-week-options.ts` if skewed.
- Run `bun scripts/check-exam-structure.ts` and `bun test` before considering
  the week done — both must pass with 0 issues / 0 failures.
