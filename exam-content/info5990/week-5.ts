import type { ExamPaperSeed } from "../types";

const DISCUSSION_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 5,
  paperNumber: 1,
  title: "Week 5 Discussion Prep",
  topics:
    "Pre-lecture Ed Discussion prompt: estimation accuracy vs stakeholder pressure, evidence-based estimating, three-point/analogous estimating, the risk of anchoring an estimate to what a client wants to hear rather than what the data supports",
  sourceFiles: ["Ed Discussion — Week 5 pre-lecture prompt"],
  questions: [
    {
      type: "scenario",
      prompt:
        "A quick IT project dilemma: your company is bidding for a $2 million software project and the client wants delivery in 6 months. An experienced developer estimates 6 months; previous project data suggests 9 months; an AI estimation tool predicts 7 months; the sales manager says 'promise 6 months, or we may lose the client.' As the Project Manager: which estimate would you trust, and why? Would you promise 6 months to win the project? What evidence would you collect before making the final decision? Should a good estimate be what the stakeholder wants to hear, or what the evidence can justify?",
      modelAnswer:
        "Trust the historical data (9 months) and the AI tool (7 months) over the single developer's 6-month gut estimate, and treat the sales manager's 6-month figure as a negotiating position, not an estimate at all — it's the one number with zero supporting evidence behind it, driven purely by what the client wants to hear. The developer's estimate is a single unverified data point subject to optimism bias (planning fallacy): people who haven't yet hit a project's actual obstacles routinely underestimate. The 9-month historical figure is analogous estimating grounded in what actually happened on comparable past projects, and the AI tool's 7 months likely sits between the two because it's pattern-matching against a broader dataset than any one person's memory — the fact that two independent, evidence-based sources (data and AI) land closer to each other (7-9 months) than either lands to the developer's 6 is itself a signal about which number to trust. I would not promise 6 months: committing to a timeline the evidence doesn't support sets the project up to fail from day one, and a broken promise on a $2M contract costs far more in trust, penalty clauses, and rework than losing this particular bid up front. Before finalising a number I'd collect a bottom-up WBS-based estimate from the team actually doing the work (not just one developer's top-down gut check), compare it against the historical data for structurally similar past projects (same tech stack, team size, client complexity), get the AI tool's estimate re-run with the project's actual scope details rather than generic inputs, and identify the specific risks/unknowns that explain the gap between 6 and 9 months, then decide whether a phased delivery (e.g. an MVP at 6 months, full scope at 9) could reconcile the client's timeline with the evidence rather than just picking one number and hoping. A good estimate has to be what the evidence can justify, not what the stakeholder wants to hear — an estimate that's really a sales tactic isn't an estimate at all, and confusing the two is exactly how projects end up in the 'unrealistic timelines and budgets' failure category covered earlier this unit.",
    },
  ],
};

// Viva prep — a standalone spoken-answer paper for the Week 8 Interactive
// Oral, which covers Weeks 1-7 (per the marking rubric) with no notes. It
// is deliberately all `short`/`scenario` (there is nothing to click in a
// viva) and weighted toward cross-week synthesis, since the rubric's
// Knowledge & Understanding band rewards "integrates multiple ideas" and
// "depth beyond the answer guide" over single-fact recall. Model answers
// are structured as claim -> 2-3 supporting points -> one example, kept
// short enough to say aloud in the rubric's 1-2 minutes per question
// (Communication & Clarity), and written as unaided recall rather than a
// read-aloud essay (Professionalism & Engagement, no AI/notes reliance).
// Filed under Week 5 (paperNumber 2) rather than a future week so it is
// visible and drillable now — Weeks 6-7 questions get appended here once
// that material is authored.
const VIVA_PREP_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 5,
  paperNumber: 2,
  title: "Viva Prep — Weeks 1-7 (Weeks 1-5 so far)",
  topics:
    "Interactive Oral / Viva rehearsal, Weeks 1-7 (Weeks 1-5 authored so far, 6-7 to follow). Week-by-week spoken recall: technical competence essential-but-not-sufficient, technical vs professional questions, diffusion of responsibility and risk escalation, the ASX/Victorian Government/Optus/CrowdStrike lesson (W1); Organisation vs Business, resources vs capabilities, the five ways IT creates organisational value, the IT-business alignment chain and value stream orchestration, Andreessen 'make the technologist CEO', mistake of commission vs omission, CRAAP (W2); project definition and why projects fail, risk vs issue, the PM's ethical dilemma, Waterfall/Agile/DevOps fit and methodology-as-culture, the continuous IT lifecycle and its drivers, Enterprise Architecture (Zachman vs TOGAF), IT technician vs IT professional, silo mentality (W3); the 7Cs and SBAR, communication barriers and channel selection, Tuckman's stages and regression, Belbin roles and Apollo teams, psychological safety and Project Aristotle, Thomas-Kilman styles, task vs relationship conflict, Power-Interest vs the Salience Model, Power+Legitimacy=Authority (W4); evidence-based estimating vs stakeholder pressure, anchoring and the planning fallacy (W5). Cross-week synthesis: Netflix as the positive mirror of the W1 case-study lesson; functional-structure silos -> Dev/Ops split -> communication barriers; professional judgement <-> the PM's ethical dilemma <-> the AI hiring-bias case; DevOps maturity <-> Tuckman stage <-> psychological safety; diffusion of responsibility <-> single point of contact; making IT investment value visible with KPIs; treating technologists as first-class citizens <-> psychological safety; unrealistic timelines/budgets <-> estimation under pressure; the CrowdStrike approval decision <-> inadequate risk management.",
  sourceFiles: [
    "week-1.ts",
    "week-2.ts",
    "week-3.ts",
    "week-4.ts",
    "week-5.ts",
    "assessment_overview.md",
  ],
  questions: [
    // --- Section A: week-by-week spoken recall -------------------------
    {
      type: "short",
      prompt:
        "Week 1. Explain why the unit argues technical excellence is 'essential but not sufficient' — give the actual mechanism, not just the slogan.",
      modelAnswer:
        "Claim: a technically sound system can still fail because success depends on how well the technology fits the organisation's constraints and decision-making, not just on how well it is built. Support: (1) IT systems do not exist in isolation — decisions are shaped by hierarchies and authority, budgets and timelines that are negotiated and often fixed, policy and law, and stakeholders with different goals and incentives; (2) when a system meets every functional requirement but still fails, the cause is usually that staff were not ready to change their workflows or decision-makers lost confidence after delays — 'the issue is rarely the code, it is how decisions were made around it'; (3) that is why professional practice 'focuses on what happens after the technical solution is proposed'. Example: a system that passes every test but is rejected because end users were never trained to switch workflows.",
    },
    {
      type: "short",
      prompt:
        "Week 1. Distinguish a 'technical question' from a 'professional question' in IT work, with an example of each.",
      modelAnswer:
        "Claim: technical questions ask 'can we build this, and how?'; professional questions ask 'should we proceed under these conditions, and who bears the consequences?'. Support: (1) technical — can this system be built? which architecture, platform or tool? what is the runtime complexity? (2) professional — should we proceed now, delay, or change direction? what risks are we accepting and on whose behalf? who is affected if this decision goes wrong? (3) the shift is from 'can we do this?' to 'should we do this, under these conditions?'. Example: the system is complete and passes all tests (the technical question is answered), but users will not be ready for a month — whether to go live now is a professional question, and it belongs with decision-makers, raised early and explicitly rather than left implicit.",
    },
    {
      type: "short",
      prompt:
        "Week 1. Why do many IT problems escalate rather than stay contained, and what professional behaviour prevents it?",
      modelAnswer:
        "Claim: problems escalate when risks are known but poorly communicated, assumptions stay implicit, and responsibility is spread so widely that no one owns it. Support: (1) a known-but-unspoken risk becomes an uncontained failure once it materialises; (2) escalating and documenting a risk early creates a record of who chose to proceed despite it; (3) blaming one person (the manager) ignores that they may be following a governance structure — 'it is easier to blame a person than a structure'. Example: the 'just launch it, we will deal with the risk later' case — the professional response is to escalate and document the risk, not silently comply because 'managers are always right', and not to avoid the situation either.",
    },
    {
      type: "short",
      prompt:
        "Week 1. State the single lesson the ASX, Victorian Government and Optus case studies share, and how CrowdStrike reinforces it.",
      modelAnswer:
        "Claim: in every case the technology was not the primary cause of failure — organisational and professional factors were. Support: (1) ASX — the technology was sophisticated, but governance, planning, risk management and accountability across stakeholders failed; (2) Victorian Government — not immature technology, but cross-agency governance, risk escalation and decision-making under public pressure; (3) Optus — not experimental technology, but gaps in resilience planning, redundancy and change management. Example / takeaway: CrowdStrike pushed a trusted, industry-standard security update that still grounded flights and disrupted banks and hospitals — showing the deciding professional moment was the decision to approve release, not the deployment step. As systems scale and become critical, judgement, coordination and accountability matter as much as technical capability.",
    },
    {
      type: "short",
      prompt:
        "Week 2. Define Organisation vs Business and Resources vs Capabilities, and explain how the two distinctions connect.",
      modelAnswer:
        "Claim: an Organisation is any structured group working toward a goal — not always profit-driven (Red Cross, NSW Health, a university); a Business is the profit-driven subset (Apple, Canva, a local cafe). Resources are what an organisation owns (tangible: hardware, property; intangible: knowledge, skills, policies); Capabilities are what it can do with those resources. Support: (1) every Business is an Organisation, but not the reverse; (2) owning resources is not value in itself — the capability to use them is; (3) an IT investment adds resources, but only becomes organisational value once it builds a capability tied to a stated goal. Example: owning a fleet of vans plus a mapping API is a resource; reliably delivering groceries within 30 minutes using them is the capability.",
    },
    {
      type: "short",
      prompt:
        "Week 2. Name the five ways IT creates organisational value, and define 'organisational value' as the unit uses it.",
      modelAnswer:
        "Claim: organisational value is value created, delivered and sustained by an organisation for its stakeholders — customers, employees, shareholders and society — answering 'how does the organisation create meaningful outcomes for its stakeholders?'. The five ways IT contributes: (1) improving operational efficiency (automation, cloud, databases); (2) enhancing decision-making (data analytics, BI tools, AI); (3) driving innovation (IoT, blockchain, agentic AI); (4) enabling customer-centric strategies (CRM, self-service platforms); (5) supporting scalability and flexibility (AWS, GCP, Azure). Example: Netflix combined streaming infrastructure, recommendation algorithms, AWS and content analytics into 200M+ subscribers and market leadership — investment converted into measurable stakeholder value.",
    },
    {
      type: "short",
      prompt:
        "Week 2. Walk through the IT-business alignment chain, from a business goal down to IT strategy and up to value.",
      modelAnswer:
        "Claim: IT strategy must be developed in lockstep with business strategy, not bolted on afterward. Chain: (1) a business goal sets direction ('become the preferred ultra-fast grocery-delivery service'); a business objective makes it measurable ('90% of deliveries under 30 minutes within 12 months'); (2) business strategy connects to IT strategy, and the business operating model connects to the IT operating model, by deliberate alignment (the diagram's dashed lines); (3) both sides converge at value stream orchestration — synchronising people, processes and technology so the technology investment produces real business outcomes. Example: QuickCart's cloud-first, AI-driven-logistics IT strategy exists to serve its speed goal, not for its own sake.",
    },
    {
      type: "short",
      prompt:
        "Week 2. Summarise Marc Andreessen's core argument from the McKinsey reading and his one-line advice to big companies.",
      modelAnswer:
        "Claim: incumbents lose to digital-native companies because they do not treat technologists as first-class citizens. Support: (1) his direct advice — 'find the smartest technologist in the company and make them CEO'; (2) big firms historically siloed technologists in an IT department, then in a 'digital division' led by a VP of digital — still a unit, not leadership — whereas at Tesla the self-driving engineers effectively lead the company; (3) in a downturn incumbents feel 'palpable relief' that they can stop taking technology seriously. Example: he can always spot the real technologist in a strategy meeting — sitting against the wall rather than at the table, nodding along.",
    },
    {
      type: "short",
      prompt:
        "Week 3. Define 'project' precisely, list the unit's reasons projects fail, and distinguish a risk from an issue.",
      modelAnswer:
        "Claim: a project is a temporary endeavour with a defined start and end that produces a unique outcome — 'unique' describes the outcome, not the process (the processes can be reused). Fail reasons: (1) poor scope definition — unclear or frequently changing requirements; (2) inadequate risk management — failing to anticipate and mitigate foreseeable issues; (3) unrealistic timelines or budgets; (4) resource issues — not having the right people or skills. Risk vs issue: a risk is a future possibility; once it happens it becomes an issue — and risk can be positive (a project exceeding expectations). Example: stable requirements but an unanticipated third-party API deprecation is a risk-management failure, not a scope one.",
    },
    {
      type: "short",
      prompt:
        "Week 3. Compare Waterfall, Agile and DevOps on when each fits, and state the unit's point about what methodology choice really is.",
      modelAnswer:
        "Claim: methodology choice is a cultural decision, not just a technical one. Support: (1) Waterfall fits stable, well-defined requirements with certification- and documentation-heavy testing (NASA shuttle software: near-zero defects, but years and enormous cost); it suits a command-and-control culture; (2) Agile fits evolving requirements with sprint feedback (a startup MVP reshaped every few weeks); it needs a collaborative culture with trust and psychological safety; (3) DevOps unifies development and operations for continuous integration, delivery and monitoring (Amazon reportedly deploys about every 11.7 seconds); it needs a mature culture and shared responsibility. Example: a national grid operator's safety-certified control software -> Waterfall; a feedback-driven consumer MVP -> Agile.",
    },
    {
      type: "short",
      prompt:
        "Week 3. What is the continuous IT lifecycle, what drives the shift toward it, and why is it described as part of IT capability rather than a separate concept?",
      modelAnswer:
        "Claim: instead of ending at deployment, IT work cycles Plan -> Design/Build/Test -> Deploy/Troubleshoot -> Monitor and back to Plan, feeding monitoring and feedback into the next round of planning. Drivers: digital transformation (keeping pace with competitors), customer expectations (fast updates and fixes), cloud and automation (faster, safer deployments), Agile and DevOps practices, and data-driven decisions (continuous monitoring informs priorities). Why a capability: an IT capability is only useful while the underlying system keeps working and improving — the continuous loop is the ongoing mechanism that sustains it, versus treating deployment as an endpoint. Example: a bank shipping fraud-detection rule updates within hours, prioritised from real-time dashboards.",
    },
    {
      type: "short",
      prompt:
        "Week 3. What is Enterprise Architecture, and how do the Zachman Framework and TOGAF differ?",
      modelAnswer:
        "Claim: Enterprise Architecture is a structured blueprint aligning an organisation's business processes, applications, data and technology with its strategic goals — organisation-wide, not one project's delivery cycle. Difference: (1) Zachman is a classification framework, organising EA by stakeholder perspectives and six questions — What, How, Where, Who, When, Why; (2) TOGAF is a methodology and framework that uses the Architecture Development Method (ADM) to design, plan, implement and govern EA; (3) so Zachman is a classification scheme and TOGAF a step-by-step governance method. Example: a university unifying enrolment, LMS and payments maps the change across business, data, application and technology architecture so a new integration or AI service does not become another isolated silo.",
    },
    {
      type: "short",
      prompt:
        "Week 3. Contrast an IT technician with an IT professional, and connect that contrast back to Weeks 1 and 2.",
      modelAnswer:
        "Claim: a technician executes; a professional exercises judgement and owns impact. Support: (1) the table's pairs — executes tasks vs exercises judgement; follows requirements vs challenges unclear ones; focuses on output vs impact; solves bugs vs solves organisational problems; thinks technically vs thinks strategically and ethically; (2) this is the same thread as Week 1's 'technical competence is necessary but not sufficient' and Week 2's account of being an IT professional; (3) judgement, communication and accountability are what separate the two. Example: told to ship a system with a known bias, a technician ships it; a professional escalates the fairness and legal risk with evidence and recommends the delay.",
    },
    {
      type: "short",
      prompt:
        "Week 4. Explain the 7Cs 'Concrete' failure and the SBAR framework, with an example of each.",
      modelAnswer:
        "Claim: most real update failures are vagueness, not inaccuracy. Support: (1) the 7Cs define 'Concrete' as using specific facts, data or examples — 'the system has some issues affecting many users' fails it with vague quantifiers, even though it is grammatically Correct; (2) SBAR structures an escalation — Situation (what is happening now: the payment gateway is down since 2pm), Background (what led here: this morning's certificate renewal), Assessment (the analysis: TLS handshake failures on the new certificate), Recommendation (the next action); (3) turning 'the data is a bit messy' into '8% of records have no matching ID' is what answers 'what is the actual problem?'. Example: an actionable update states what is complete, the actual problem, the business impact, when the next update is due, and whether a decision is needed.",
    },
    {
      type: "short",
      prompt:
        "Week 4. Give Tuckman's stages of team development and explain what moves a team backwards.",
      modelAnswer:
        "Claim: teams develop through Forming -> Storming -> Norming -> Performing (then Adjourning), and can regress. Support: (1) Forming is tentative and polite with no norms yet; Storming is where splinter groups form and people push for position and power; Norming is where trust builds, hidden agendas surface and roles are agreed; Performing has 'no surprises' and little waste; (2) a new person joining or leaving, or a new platform or process, can push a team back toward Storming or even Forming; (3) recovery means reconfirming responsibilities, redefining what 'done' means, clarifying who can decide and how issues escalate. Example: a ten-year legacy-stack expert effectively becomes a newcomer the moment the platform changes.",
    },
    {
      type: "short",
      prompt:
        "Week 4. What did Google's Project Aristotle find, and why does that matter when choosing a methodology or building a team?",
      modelAnswer:
        "Claim: psychological safety — the shared belief that you can take risks without fear of embarrassment or punishment — was the number one factor for team effectiveness, ranked above expertise or structure. Support: (1) the study covered 180+ teams over 2012-2014; (2) it outranked raw intelligence — Belbin's 'Apollo' teams of the highest-IQ members typically finished near last, prone to destructive, unresolved debate; (3) collaborative methods like Agile, and DevOps' shared ownership, only work when that safety exists. Example: a team that cannot safely disagree will rubber-stamp a bad estimate rather than challenge it.",
    },
    {
      type: "short",
      prompt:
        "Week 4. Compare the Power-Interest Matrix with the Salience Model, and explain 'Power + Legitimacy = Authority'.",
      modelAnswer:
        "Claim: both classify stakeholders, but the Salience Model is more granular. Support: (1) the Power-Interest Matrix uses two dimensions and four quadrants (manage closely / keep satisfied / keep informed / monitor), and it is a snapshot, not a fixed fact — a low-interest stakeholder shifts to 'manage closely' as a deadline nears; (2) the Salience Model adds legitimacy and urgency, producing seven categories (Dormant, Discretionary, Demanding, Dominant, Dependent, Dangerous, Definitive), and stakeholders move between them by gaining an attribute; (3) Authority is Power plus Legitimacy together — a Dangerous stakeholder has power and urgency but, lacking legitimacy, holds raw influence, not authority. Example: a Dangerous stakeholder who wins a court case gains legitimacy and becomes Definitive, the highest priority.",
    },
    {
      type: "short",
      prompt:
        "Week 5. What does evidence-based estimating look like, and what is the danger of anchoring an estimate to what a stakeholder wants to hear?",
      modelAnswer:
        "Claim: a good estimate is what the evidence can justify, not what the stakeholder wants to hear — a number driven purely by what wins the deal is a negotiating position, not an estimate. Support: (1) trust historical and analogous data and estimation tools over a single person's gut figure, which is subject to optimism bias and the planning fallacy; (2) use techniques — a bottom-up work-breakdown estimate from the team doing the work, three-point estimating, and comparison against structurally similar past projects; (3) when independent evidence-based sources converge (for example history at 9 months and a tool at 7) and diverge from one developer's 6, trust the convergence. Example: do not promise 6 months on a $2M bid to win it — a broken promise costs more than the bid; consider phased delivery, an MVP at 6 months and full scope at about 9.",
    },
    // --- Section B: cross-week synthesis -----------------------------
    {
      type: "scenario",
      prompt:
        "Synthesis (W1 + W2). The Week 1 case studies conclude technology rarely decides success or failure. Does Netflix vs Blockbuster contradict that or confirm it? Answer as you would in the viva, in about a minute.",
      modelAnswer:
        "Claim: it confirms the Week 1 lesson, from the success side rather than the failure side. Support: (1) Blockbuster could in principle have built or bought similar streaming infrastructure — what separated them was strategic judgement: Netflix committed early to a data-driven, customer-centric model, while Blockbuster's response was 'late and poorly executed' and compounded by trust-destroying fees; (2) this is exactly Week 1's 'the issue is rarely the code, it is how decisions were made around it', just positive; (3) so Netflix is the mirror image of ASX, Victorian Government and Optus, not a counter-example. Example: the same technology was available to both firms; timely, well-governed decisions about how to use it decided the organisational-value outcome.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W2 + W3 + W4). A company organised by function has slow, conflict-ridden releases. Trace the problem through Weeks 2, 3 and 4, then say what actually fixes it.",
      modelAnswer:
        "Claim: this is one continuous thread — structure creates silos, silos split Dev and Ops, and communication practice is where the split actually bites. Support: (1) Week 2 — a functional structure's listed con is that it 'creates silos and reduces flexibility' through limited cross-department communication; (2) Week 3 — that produces the Dev (features) vs Ops (cost, reliability, risk) focus split, plus the silo mentality Reading 2 describes (Sony's two incompatible Walkmans; Volkswagen's 'chimney careers' where people feared speaking up); (3) Week 4 — technical jargon and undocumented handoffs are the day-to-day mechanism the silo fails through. Fix: DevOps unifies development and operations for continuous integration, delivery and monitoring, ideally inside a governed Enterprise Architecture so new silos do not simply reappear.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W1 + W3). A sponsor wants to ship an AI hiring-screening system that performs slightly worse for candidates from certain universities and regions, promising to 'fix it later'; fixing first costs two months. As the project manager, argue your response using Weeks 1 and 3 in 1-2 minutes.",
      modelAnswer:
        "Claim: delay the launch and communicate the risk — do not ship the biased version, and do not refuse silently either. Support: (1) Week 1 — this is a professional question, not a technical one: should we proceed now, what risk are we accepting and on whose behalf (the candidates screened out in the meantime), who is affected if it goes wrong; (2) Week 3 — 'a professional PM must balance delivery with integrity', and 'improve it later' does not undo the harm to real people, on top of the legal and reputational exposure; (3) the professional move is to escalate and document the fairness and legal risk to the sponsor and other stakeholders and recommend the two-month fix. Example: this mirrors Week 1's 'just launch it' case — escalate and document a known risk rather than comply or avoid.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W3 + W4). A newly formed team that is still competing over decisions, and whose members rarely challenge the senior developer, wants to adopt DevOps now. Is that the right call?",
      modelAnswer:
        "Claim: not yet — the culture is not ready. Support: (1) Week 3 — DevOps needs a mature organisational culture and shared responsibility, and the unit is explicit that methodology choice is 'a cultural decision, not just a technical one'; (2) Week 4 — the team is in Storming (competing for position) and lacks psychological safety, which Project Aristotle found is the single biggest factor in team effectiveness; (3) forcing DevOps' shared ownership onto a low-trust, immature team produces blame, not collaboration. Recommendation: build norms and psychological safety first to reach Norming/Performing, start with Agile's sprint cadence and reviews, and move toward DevOps as trust and maturity grow.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W1 + W4). During a rollout, both the client's team and the contractor's team believe they should field questions from a nervous end-user group, so users receive the same messages twice, worded differently. Diagnose this using Weeks 1 and 4.",
      modelAnswer:
        "Claim: this is Week 1's 'responsibility spread so widely that no one owns it' showing up as Week 4's 'lack of a single point of contact'. Support: (1) Week 1 — problems escalate when accountability is diffuse and assumptions stay implicit; here nobody has explicitly been made the owner of user communication; (2) Week 4 — Bourne's interview findings list 'lack of single point of contact' as a major stakeholder-relationship problem, alongside information distortion and miscommunication between important stakeholders; (3) the fix is explicit ownership: one named point of contact, one channel, one message. Example: route all user-facing communication through the project manager, using email (on the record) rather than chat (fast but easily lost) for anything carrying a date or a commitment.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W2 + W3). A CFO calls IT 'a cost centre with unclear returns' while the CEO wants IT aligned more strategically. Using Weeks 2 and 3, say what the CFO's framing is missing and what IT should do.",
      modelAnswer:
        "Claim: the value is real but invisible because it is not being measured — the disagreement is not unresolvable. Support: (1) Week 2 — best practice for IT investments is to set measurable outcomes, track ROI with KPIs, and rank initiatives with a cost-benefit or value-risk matrix; without that, organisational value stays invisible to a stakeholder like the CFO; (2) Week 3 — a professional challenges an unclear framing with evidence rather than capitulating to it or staying silent; (3) so IT should proactively propose outcome-linked KPIs (for example diagnostic wait-time or accuracy improvement against a pre-system baseline) and a cost-benefit case. Example: 'lines of code delivered' is an output metric; '20% faster diagnosis and higher patient satisfaction' is organisational value the CFO can see.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W2 + W4). Connect Andreessen's argument about how firms treat technologists (Week 2) to Project Aristotle's finding (Week 4). What is the common idea, and one practical implication?",
      modelAnswer:
        "Claim: both say the environment around capable people, not their raw capability, decides whether that capability pays off. Support: (1) Andreessen — talented technologists only deliver where leadership genuinely understands their work and they are central, not siloed in a 'digital division'; (2) Project Aristotle — psychological safety beat expertise and structure as the top predictor of team effectiveness; (3) common idea: capability is necessary but its payoff depends on whether people are heard and structurally central. Implication: do not just hire strong engineers or a CIO — give them a seat at the decision table and a team in which challenging a senior voice is safe.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W3 + W5). Sales wants you to promise a 6-month delivery on a $2M bid; historical data says 9 months, an AI tool says 7, one developer says 6. Tie your answer explicitly to Week 3's reasons projects fail.",
      modelAnswer:
        "Claim: do not promise 6 months — that commits the project to Week 3's 'unrealistic timelines or budgets' failure from day one. Support: (1) the sales figure has no evidence behind it — it is a negotiating position, not an estimate — and the lone 6-month developer estimate is subject to optimism bias and the planning fallacy; (2) two independent evidence-based sources (history at 9, the tool at 7) converge away from 6, and that convergence is itself the signal; (3) before committing, get a bottom-up work-breakdown estimate from the team, compare against structurally similar past projects, and identify what specifically explains the 6-versus-9 gap. Example: offer phased delivery — an MVP at 6 months and full scope at about 9 — rather than a number chosen to win the bid.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W1 + W3). Your organisation is about to push a 'routine' security patch to all production systems overnight with no staged rollout. Using Week 1's CrowdStrike lesson and Week 3's failure reasons, what do you insist on first?",
      modelAnswer:
        "Claim: insist on a staged rollout with rollback capability and a named approver before release. Support: (1) Week 1 — CrowdStrike showed a trusted, industry-standard update cause a global outage, and it stopped being 'just technical' at the decision to approve release, not only at deployment; (2) Week 3 — skipping a staged rollout is inadequate risk management (not anticipating a foreseeable failure), and is often driven by unrealistic-timeline pressure; (3) trusting the vendor is a reason for confidence, not a reason to bypass your own resilience and change-management practice — the exact gap the Optus review identified. Ask: was it tested against representative production configurations, is there a canary or phased plan with monitoring at each stage, and who explicitly owns the decision to skip staging?",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W1 + W3 + W4). In about two minutes, make the case that being an 'IT professional' is defined by more than technical skill, drawing on at least three weeks of this unit.",
      modelAnswer:
        "Claim: across the unit, the professional is defined by judgement, communication and accountability layered on top of technical competence. Support: (1) Week 1 — technical competence is essential but not sufficient; professional questions ask 'should we, and on whose behalf?'; known risks must be escalated and documented, not left implicit; (2) Week 3 — technician versus professional: challenges unclear requirements, focuses on impact, solves organisational problems, thinks strategically and ethically, and 'balances delivery with integrity'; (3) Week 4 — communicates concretely (the 7Cs, SBAR), manages stakeholders and team dynamics, and establishes a single point of contact. Example: handed a system with a known bias and a tight deadline, the professional escalates the risk with specific evidence and recommends the responsible course; the technician just ships.",
    },
    {
      type: "scenario",
      prompt:
        "Exam-format case (W2 + W3). A mid-sized insurer has outdated, siloed systems and manual reporting. It plans to invest in a cloud platform, hire a CIO, and move from a functional to a matrix structure. As an IT professional, assess whether this will create organisational value — claim, 2-3 points, one example, about two minutes.",
      modelAnswer:
        "Claim: the plan is well-positioned to create organisational value, provided execution follows through on alignment rather than just spend. Support: (1) it follows Week 2's alignment chain — measurable goals driving IT strategy and a restructured operating model, rather than IT bolted on afterward; (2) it targets a genuine resources-versus-capabilities gap — the insurer has systems and staff but lacks the capability for real-time reporting and cross-department coordination; (3) the matrix move addresses the functional structure's silo con but introduces dual-authority confusion (Week 2), so the CIO must invest heavily in coordination, ideally inside a governed Enterprise Architecture (Week 3) so the shift to continuous delivery does not create new silos. Example: this mirrors Netflix (investment plus organisational follow-through equals value) versus Blockbuster (proposals without follow-through equals none) — value appears only if the restructure and retraining are actually completed.",
    },
    {
      type: "scenario",
      prompt:
        "Synthesis (W4). Two engineers disagree on the fastest safe fix and want to combine their approaches; separately, a teammate silently accepts a UI choice 'to keep the peace'. Name each Thomas-Kilman style and say which behaviour is healthier here and why.",
      modelAnswer:
        "Claim: the first is Collaborating, which is healthy here; the second is Accommodating, which is a warning sign here. Support: (1) Collaborating is high assertiveness plus high cooperation — both engineers pursue the best outcome and combine approaches, ideal for a task conflict that has a right answer; (2) Accommodating is low assertiveness plus high cooperation — fully yielding, not meeting halfway (that would be Compromising) — which is fine for trivial matters but buries genuine input; (3) the underlying distinction is task (cognitive) conflict, which can be constructive, versus relationship (affective) conflict, which is usually destructive. Example: if the UI choice actually matters, the accommodating teammate should voice the disagreement so it becomes a task conflict to resolve, not a silent concession.",
    },
  ],
};

export const WEEK_5_PAPERS: ExamPaperSeed[] = [DISCUSSION_PAPER, VIVA_PREP_PAPER];
