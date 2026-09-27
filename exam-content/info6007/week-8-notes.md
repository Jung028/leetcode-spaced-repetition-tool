# INFO6007 Week 8 — Reader Notes (Procurement Management Plan)

Source material read: lecture slides (`Lecture - INFO6007 Week 08 - Procurement Management Plan.pdf`, 59 pages), lecture transcript (`Week 08 - Project Ma-s1-low.transcript.md`, whisper-cpp auto-transcript, no speaker labels), tutorial sheet (`Tutorial sheet INFO6007 Week 08 .pdf`), and `exam-content/info6007/unit_outline.md` / `assessment_overview.md` for context. The two supplementary reading PDFs in the lecture folder ("14 Best practices for IT Procurement Process in 2025" and "Transformational outsourcing in IT Project Management") were **not** processed in this pass — out of scope for this Reader brief (slides/tutorial/transcript only); flagging their existence in case a later pass wants them.

## 0. Scope note / mismatch to be aware of

- **The lecture's topic is Procurement Management** (PMBOK Ch.12: Plan/Conduct/Control Procurements) plus Project Outsourcing.
- **The Week 8 tutorial sheet's topic is Risk Management** (mobile banking app scenario — Risk Identification / Risk Analysis / Risk Response Planning / Project evaluation), not procurement. This looks like the tutorial is running roughly a week behind the lecture content (Week 7's lecture was Risk Management, per the lecturer's own recap at the start of this recording). Treat lecture-derived and tutorial-derived questions as two separate topic pools — do not conflate them into one "Week 8 = procurement" paper without accounting for the tutorial being risk-management-based.

## 1. Important points from slides

### Introduction to Procurement Management
- Project Procurement Management = acquiring goods, services, or results from outside the project team to meet project needs.
- Decides: what to buy, how to buy it, who to buy it from, and how to ensure the contract is completed successfully.
- Why it matters: most IT projects rely on external parties (software, hardware, cloud services, consultants, support); effective procurement → right resources on time/budget/quality; poor procurement → delays, cost overruns, project failure.
- PMBOK Guide (6th ed.) Figure 12-1 "Project Procurement Management Overview" — 3 processes, each with its own Inputs / Tools & Techniques / Outputs:
  1. **12.1 Plan Procurement Management**
  2. **12.2 Conduct Procurements**
  3. **12.3 Control Procurements**

### Running case study: NSW Digital Driver Licence Project
- Objective: optional digital version of the NSW Driver Licence via the Service NSW app; lets holders demonstrate identity, age, and permission to drive; supports digital verification.
- Project journey: Initial pilot — Dubbo, November 2017 → Expanded trials — Sydney's Eastern Beaches and Albury → Statewide launch — October 2019.
- Key stakeholders: Service NSW, Transport for NSW, NSW Police, Licence holders, Licence checkers.
- Project type: public-sector software development and rollout — mobile-app development, system integration, security, testing, stakeholder adoption.
- Used as the running example across all three procurement stages:
  - **Plan Procurement Management**: Need = independent security testing and temporary launch support. Approach = RFP for complex services, RFQ for standard items. Timing = before assurance and statewide rollout. Governance = evaluation criteria, approvals, contract owner. Who manages it = the project manager, supported by procurement and the responsible workstream lead. Example given: the team keeps licensing integration within the internal team and engages an external specialist for independent security testing.
  - **Conduct Procurements** (table): Issue RFP (provide a SOW for independent security/performance testing → decision evidence: scope response & proposed method → output: comparable bids) → Receive proposals (hold a bidder briefing, issue same clarifications to all vendors → compliance check → eligible bids) → Evaluate vendors (apply weighted scoring to capability, security, delivery, price → scores & evaluator comments → preferred vendor) → Negotiate and award (agree milestones, acceptance criteria, price, reporting → final offer and terms → signed contract). Selection result: the chosen supplier meets mandatory security and delivery requirements and offers the best overall value.
  - **Control Procurements** (5-step flow): Review deliverables → Check milestones and SLA → Test acceptance criteria → Manage approved changes → Verify invoice and close. Control focus = keep supplier work aligned with the contract; review test reports and milestone evidence, record issues, approve changes formally, accept deliverables before payment. Monitor: delivery status, service levels, quality findings, approved changes. Payments and contract closure follow formal acceptance of deliverables.

### 1. Plan Procurement Management
- Definition: the process of documenting procurement decisions, specifying the approach, and identifying potential sellers.
- It answers: What do we need to buy? How will we buy it? When will we buy it? Who will manage it?
- Purpose: ensure structured/efficient/cost-effective acquisition; align procurement with scope, schedule, budget, and risk; provide a roadmap for managing vendor relationships.
- Key technique: **Make-or-Buy Analysis**.

#### Make-or-Buy Analysis
- Process of deciding whether a product/service/result should be produced internally (make) or purchased/outsourced externally (buy); helps determine the most cost-effective, time-efficient, risk-appropriate option.
- Factors to consider: Cost, Time, Quality, Expertise and skills, Control and Confidentiality, Strategic Importance.
- Steps: identify the need (e.g., software component, IT service) → estimate internal capability (resources, skills, costs, schedule) → estimate external costs and constraints (vendor proposals, market research) → compare options on cost/risk/benefit → document and justify the decision in the Procurement Management Plan.
- **Worked numeric example** (table source: saylordotorg — "make or buy decisions"):
  - Alternative 1 (Make Internally): Cost to buy from outside $0; Direct materials $300,000; Direct labor $160,000; Manufacturing overhead $100,000; Factory equipment lease $110,000; Factory building rent $290,000; Production supervisors' salaries $140,000 → **Total production cost $1,100,000**.
  - Alternative 2 (Buy from Outside): Cost to buy from outside $700,000; Direct materials/labor/overhead $0; Factory equipment lease $110,000; Factory building rent $290,000; Production supervisors' salaries $90,000 → **Total production cost $1,190,000**.
  - Differential amount = $(90,000); Alternative 1 is Lower → **Alternative 1 (Make Internally) is the more cost-effective option**, by $90,000.

### 2. Conduct Procurements
- Definition: the process of obtaining seller responses, evaluating them, and awarding the contract — turns procurement planning into action by interacting with the market.
- Key activities: distribution of procurement documents; vendor conferences/bidder meetings; receive proposals/quotations; evaluation of proposals; negotiation with vendors; selection and award of contract.

### 3. Control Procurements
- Definition: the process of managing relationships with vendors, monitoring contract performance, and making changes as needed so both buyer and seller meet contractual obligations.
- Objectives: ensure vendor delivers per contract scope/schedule/cost/quality; identify and address issues (delays, cost overruns, non-compliance); manage contract changes/disputes fairly; maintain proper communication and documentation.
- Tips for controlling procurements: monitor performance regularly; keep communication transparent; manage change formally; verify before payment; build strong relationships; manage risks proactively; ensure compliance; document everything.

### Components of Procurement Management (documentation deep-dive)

#### Procurement Statement of Work (SOW)
- A detailed description of the products/services/results to be delivered under a contract; sets scope, deliverables, timelines, and standards — the "what and how" document for procurement.
- Purpose: provides clarity to vendors; forms the basis for preparing proposals (RFP responses); reduces misunderstandings and scope creep; acts as a legal reference in disputes.
- SOW template sections (Figure 12-3): I. Scope of Work, II. Location of Work, III. Period of Performance, IV. Deliverables Schedule, V. Applicable Standards, VI. Acceptance Criteria, VII. Special Requirements.

#### Request for Proposal (RFP)
- A formal document issued by a buyer inviting potential sellers/vendors to submit proposals on how they would meet the project's requirements; used when requirements are less defined and vendor creativity/innovation is wanted.
- Purpose: communicate requirements clearly; encourage competition and obtain best value; evaluate proposals on technical, financial, and qualitative factors; ensure transparency and fairness in vendor selection.
- Key components: Introduction and Background; Scope of Work (references the SOW); Requirements; Proposal Guidelines; Evaluation Criteria; Timeline; Budget (optional — may be provided or left open); Terms and Conditions.
- Process: buyer prepares RFP → RFP published/shared with vendors → vendors prepare proposals (solution, cost, schedule) → buyer evaluates proposals using selection criteria → vendor selected and contract negotiations begin.

#### Request for Quotation (RFQ)
- A formal procurement document issued by a buyer to solicit price quotations from suppliers for well-defined, standardized goods or services — focused on price, delivery terms, and payment conditions (unlike an RFP's detailed-solution focus).
- Purpose: obtain competitive pricing for specific items/services; identify the most cost-effective supplier that still meets technical/quality requirements; establish a baseline for vendor comparison when scope/specs are already fixed.
- Key features: detailed specifications (model numbers, sizes, quantities); price-centric evaluation (costs, discounts, payment terms); used for standardized/commoditized products; short decision cycle (faster than RFP).
- When to use: buying commodities (office supplies, raw materials); procuring standardized IT hardware/software licenses; requirements are clear and don't need innovation/customization; comparisons across suppliers are mainly on cost and delivery.

#### RFP vs RFQ comparison table
| Aspect | Request for Quotation (RFQ) | Request for Proposal (RFP) |
|---|---|---|
| Definition | A document to solicit price quotations from suppliers for well-defined goods/services | A document issued by a buyer to invite potential sellers/vendors to submit proposals on how they would meet the project's requirements |
| Focus | Price & delivery | Technical solution + price |
| Requirements | Well defined, standardised | Complex, needs innovation |
| Evaluation criteria | Cost driven | Quality, approach, and capability |
| When to use? | When you need price quotes for well-defined items | When you want solutions and vendor creativity |
| Typical use case | Commodities, shared items | IT projects, consulting, custom systems |

#### Types of Contracts
- A contract formalizes vendor engagement and defines: how payment is structured, how risk is shared between buyer and seller, how performance is measured.
- 3 main types: **Fixed-Price contracts**, **Cost-Reimbursable contracts**, **Time & Materials contracts**.
- Fixed-Price sub-types:
  - **Firm Fixed Price (FFP)**: price is final, no adjustments.
  - **Fixed Price Incentive Fee (FPIF)**: price fixed, but with performance incentives.
  - **Fixed Price with Economic Price Adjustment (FP-EPA)**: price fixed, but adjusted for inflation/market changes.
- Cost-Reimbursable sub-types:
  - **Cost Plus Fixed Fee (CPFF)**: seller reimbursed + fixed fee.
  - **Cost Plus Incentive Fee (CPIF)**: seller reimbursed + incentive based on performance.
  - **Cost Plus Award Fee (CPAF)**: seller reimbursed + award fee based on the buyer's satisfaction.
- Contract types vs risk (Figure 12-2) — ordered from high buyer-risk/low seller-risk to low buyer-risk/high seller-risk:
  **CPPC (Cost Plus Percentage of Costs) → CPFF → CPIF → CPAF → FPI (Fixed-Price Incentive) → FP-EPA → FFP (Firm-Fixed Price)**.
  - CPPC is the riskiest for the buyer / safest for the seller (seller reimbursed cost *plus a percentage of that cost*, so the seller has no incentive to control spending — explicitly called out in the transcript as "a bit more dangerous").
  - FFP is the safest for the buyer / riskiest for the seller.
- Comparison table:

| Aspect | Fixed-Price contracts | Cost-Reimbursable contracts | Time and Material contracts |
|---|---|---|---|
| Definition | Price is agreed upon in advance, regardless of actual costs | Buyer reimburses seller for actual costs, plus a fee/profit | Hybrid of fixed and cost-reimbursable; buyer pays per hour/day plus materials |
| Risk on Buyer | Low | High | Medium |
| Risk on Seller | High | Low | Medium |
| Advantages | Predictable cost for buyer, risk on seller | Flexibility, good for R&D or uncertain projects | Simple to administer, flexible scope |
| Disadvantages | Seller may cut corners if costs rise; change requests are expensive | Higher cost risk for buyer, less incentive for seller to control costs | Risk of cost overruns if not monitored |
| Best use case | Clear scope, predictable deliverables | R&D, uncertain requirements | Staff augmentation, flexible scope |

#### Vendor Evaluation Criteria & Methods
- Criteria: **Cost and pricing** (total cost of ownership, pricing transparency, payment flexibility); **Quality of goods/services** (compliance with specifications/standards); **Technical capability** (availability of skilled personnel/know-how); **Customer service and support** (responsiveness to queries/complaints/service issues).
- 3 evaluation methods:
  - **Weighted Scoring Model** — best for complex procurements where multiple factors matter, not just price.
  - **Checklist** — best when compliance to minimum standards (e.g., certifications, licenses) is critical.
  - **Vendor Scorecard** — best for long-term supplier relationships. Purpose = ongoing performance monitoring of suppliers already engaged. Focus = tracks KPIs (delivery timeliness, quality, cost, customer service, compliance). Nature = retrospective and continuous, used *after* awarding the contract. Format = typically a dashboard or report with scores/ratings/traffic lights (green/yellow/red). Example given: a monthly supplier performance review showing on-time delivery 92% (green), defect rate 4% (yellow).
- **Weighted Scoring worked example** ("Potential Suppliers Evaluation"):
  - Criteria and weights: Integrity 0.20; Industry Expertise 0.35; Experience and Qualification 0.20; Financial and Managerial Strength 0.25.
  - Supplier A (0–5 scale, 5 = high): Integrity 1 (weighted 0.20); Industry Expertise 3 (weighted 1.05); Experience and Qualification 2 (weighted 0.40); Financial and Managerial Strength 1 (weighted 0.25) → **Total 1.90**.
  - Supplier B: Integrity 1 (weighted 0.20); Industry Expertise 5 (weighted 1.75); Experience and Qualification 4 (weighted 0.80); Financial and Managerial Strength 0 (weighted 0) → **Total 2.75**.
  - Decision: **Select Supplier B** (2.75 > 1.90) — despite Supplier B's much weaker financial/managerial strength score (0 vs 1), its far higher industry expertise (5 vs 3) and experience/qualification (4 vs 2) scores, combined with their weights, gave it the higher overall weighted total.
- **Checklist worked example**: Suppliers A/B/C scored across Legal & Compliance, Certifications (Supplier A: ISO 9001; Supplier B: ISO 22000; Supplier C: ISO 9001 + HACCP), Financial Stability, Capacity & Capability, Quality Standards, Delivery Performance (A 95% / B 80% / C 92%), Cost Competitiveness, Customer References, Sustainability & Ethics, Risk Factors, Overall Recommendation. Suppliers A and C are green/recommended across nearly every row; Supplier B is red/at-risk on most rows (financially "at risk," no spare capacity, high cost, mixed customer references, no sustainability/ethics compliance, medium risk factor).

#### Procurement Schedule
- A timeline outlining the key activities, milestones, and deadlines for managing procurement activities; aligns procurement processes with the overall project schedule to avoid delays.
- Key elements: procurement planning timeline; document preparation; vendor selection timeline; contract award milestone; delivery and performance periods; monitoring and controlling timeline; procurement closure.

#### Risk Management in Procurement
- Definition: the process of identifying, assessing, and mitigating risks that arise when acquiring goods, services, or works from external vendors; ensures vendor relationships, contracts, and deliverables don't jeopardize project success.
- Common risk categories: **Cost** (price fluctuations, hidden costs, penalties, cost overruns); **Schedule** (delays in delivery, long lead times, logistics/transportation issues); **Quality** (products/services don't meet specifications, vendor cutting corners); **Compliance and legal** (breach of contract terms, IP disputes, etc.); **Operational** (miscommunication between vendor and buyer, poor contracts, etc.).
- Steps in Procurement Risk Management:
  1. **Risk identification** — brainstorm potential risks with project and procurement teams; review vendor history, market conditions, and past lessons learned.
  2. **Risk assessment** — analyze risks based on likelihood and impact; use a risk matrix to prioritize (high/medium/low).
  3. **Risk mitigation strategies** — Cost risks: use fixed-price contracts, hedging, or multi-year agreements. Schedule risks: include penalties for delays (liquidated damages). Quality risks: define strict acceptance criteria in the Statement of Work (SOW).
  4. **Risk monitoring** — track vendor performance with KPIs; regular audits, inspections, and progress reports.
  5. **Risk response and contingency** — have contingency plans (e.g., a secondary supplier); escalation procedures for resolving disputes quickly.

### Project Outsourcing
- Definition: the practice of hiring an external organization or vendor to perform specific project activities, tasks, or deliverables instead of executing them in-house; often used to leverage specialized expertise, reduce costs, or accelerate timelines.
- Why outsource: **Cost Efficiency** (reduce labor, infrastructure, operational costs); **Access to Expertise** (specialized skills not available internally, e.g. cloud architecture, AI development); **Focus on Core Activities** (let the organization focus on strategic activities while vendors handle support/technical work); **Risk Sharing** (vendors may assume certain risks related to delivery, technology, or compliance).
- Types of Outsourcing in IT Projects:
  - **Complete Project Outsourcing** — the vendor manages the entire project from initiation to closure. Example: outsourcing the development of a mobile app from design to deployment.
  - **Partial Project Outsourcing** — only specific components or tasks are outsourced. Example: a company develops software in-house but outsources testing or UI/UX design.
  - **Business Process Outsourcing (BPO)** — outsourcing of non-core business processes related to the project. Example: customer support, payroll processing, or IT helpdesk services.
  - **IT/Technical Outsourcing** — hiring specialized vendors for software development, cloud infrastructure, or cybersecurity. Example: cloud migration, AI model development.
- Outsourcing Models table:

| Model | Description | Example |
|---|---|---|
| Onshore | Vendor in same country | Local software development company |
| Nearshore | Vendor in nearby country/time zone | Indonesian vendor for Australian company |
| Offshore | Vendor in distant country | India or Vietnam outsourcing for cost savings |
| Hybrid | Mix of internal and external resources | Core strategy in-house, coding offshore |
| Multisource | A mix of the different models of sourcing | — |
| Insourcing | Opposite of outsourcing — movement of a business process within the company to another internal entity | A company develops its mobile app using its internal software development team instead of hiring an external vendor |

- Benefits of Outsourcing IT Projects: cost reduction and access to global talent; faster project completion due to experienced vendors; reduced burden on internal teams; flexibility in resource management; access to skills/technologies unavailable within the company; reduces both fixed and recurrent costs; allows the client organisation to focus on its core business.
- Disadvantages of Project Outsourcing: communication issues across geographies/time zones; quality control and adherence to standards; confidentiality and data security concerns; vendor dependency and lack of internal skill development; hidden costs in coordination or contract management.
- Governance of Outsourcing: the framework of policies, processes, roles, and oversight that ensures outsourced activities align with organizational objectives, deliver value, and manage risks effectively; ensures accountability, performance monitoring, and compliance in vendor relationships. Key components:
  - **Strategic alignment** — ensure outsourced services align with business goals and project objectives.
  - **Contract management** — oversight of contract adherence, including deliverables, milestones, penalties, and incentives.
  - **Roles and responsibilities** — define who in the organization manages the vendor (e.g., Vendor Manager, Project Manager) and specify vendor responsibilities, deliverables, and escalation points.
- Integration of Procurement and Outsourcing in IT Projects — why it matters: **Alignment with Project Objectives** (ensures procured/outsourced components meet technical and business requirements); **Risk Reduction** (minimizes schedule delays, cost overruns, quality issues); **Efficient Resource Utilization** (combines internal and external resources effectively); **Better Vendor Management** (clear accountability, performance monitoring, contract compliance); **Strategic Decision-Making** (helps decide what to build in-house vs outsource, and how to procure critical components).
- Best practices for integration: **Start Early** (include procurement and outsourcing planning in the project initiation phase); **Align Contracts with Project Milestones** (ensure payments and deliverables match the project schedule); **Use Integrated Tools** (track both internal and external tasks in the same project management system); **Continuous Communication** (maintain transparency between internal teams and vendors); **Mitigate Risks Proactively** (identify dependencies and maintain backup plans, e.g. alternate vendors, contingency inventory).

### Slide-only end-of-lecture/case-study prompts (not verbally worked through with a single answer)
- "End of Lecture Questions" slide: (1) Define project procurement management and explain its importance in IT projects. (2) Differentiate between insourcing and outsourcing in project management. (3) What is a Make-or-Buy Analysis, and why is it critical in procurement planning? (4) List and briefly describe the types of contracts used in outsourcing.
- Case Study slide — **TechSolutions Pty Ltd** (a mid-sized manufacturing company in Sydney) is implementing a **cloud-based ERP system** to improve operations, inventory management, and financial reporting. The internal IT team lacks expertise in ERP customization and cloud deployment, so the company plans to outsource key components while procuring necessary hardware and software licenses.
  - Internal Team handles: Project management, system integration, change management.
  - Outsourced Tasks: ERP software customization, cloud deployment, data migration, cybersecurity audits.
  - Procured Items: Servers for hybrid cloud backup, software licenses, network infrastructure.
  - Vendors Selected: ERP Development Vendor (**Offshore**), Cloud Hosting Provider (**Onshore**), Cybersecurity Auditing Firm (**Nearshore**).
  - Timeline: Project initiation Week 1; Vendor selection Weeks 2–4; Contract award Week 5; ERP deployment Weeks 6–16; Testing & acceptance Weeks 17–18; Project closure Week 20.
  - Case-study based prompt questions: identify which components are insourced vs outsourced; explain the outsourcing models used for each vendor; discuss the importance of procurement planning in this project; identify risks associated with each vendor and suggest mitigation strategies; describe how the project manager can control procurements to ensure vendor deliverables are on time and meet quality standards; if the offshore ERP vendor fails to deliver on time, how could multisourcing or alternative strategies have reduced project risk; discuss how this project demonstrates the importance of controlling procurement risks in IT projects.

## 2. Important points only in the video (not on any slide)

- **Tech/housekeeping**: lecturer explicitly asked online/Zoom students to confirm they could see and hear him and the screen before starting; a student (Ronit) confirmed. Lecturer apologized for starting late, explaining he'd been finishing up the Week 8 tutorial and had to walk over.
- **Verbal recap of Week 7 (Risk Management)** given before moving into new content — not slide-driven:
  - Risk appetite varies by industry: education, health, and military organisations tend to be risk-averse; startups/new companies tend to be risk-seeking.
  - Risk identification techniques recapped verbally: brainstorming, the Delphi technique, interviewing, and (per the transcript, likely mis-heard as "sort analysis") SWOT analysis.
  - Qualitative risk analysis illustrated with a deliberately absurd example: an "alien attack" — very low probability/likelihood, but very high impact if it happened — used to make the point that likelihood and impact must be balanced independently when prioritising risks in a probability-impact matrix.
  - Quantitative risk analysis (Monte Carlo simulation) was explicitly described as only needing a conceptual understanding — "no need to go into a lot of detail," just that it's a statistical/simulation methodology for exploring different risk scenarios.
  - Decision tree analysis recapped as a technique for evaluating potential project outcomes and choosing between project options.
- **Extended risk-response worked example** (entirely verbal, walked live with the class — no slide): a hypothetical postgrad startup team building a **safety app for scuba divers**, already at MVP (Minimum Viable Product) stage and planning to launch in a couple of months, used to illustrate all risk response strategies via class discussion:
  - **Avoid** (negative risk): a risky real-time in-dive advice feature that could fail health/compliance standards — the team could scope it out entirely rather than build it.
  - **Mitigate** (negative risk): replace the risky real-time feature with pre-dive/post-dive advice instead — reduces probability/impact rather than eliminating the feature.
  - **Transfer** (negative risk): analogous to buying insurance; lecturer's own startup transferred payment-handling risk by using **Stripe** as a third-party payment gateway rather than handling payments themselves.
  - **Accept** (negative risk): do nothing proactive and accept the consequences if the risk occurs.
  - **Escalate** (negative risk): a risk outside the project team's control (e.g., a security risk affecting Canvas itself) must be escalated to a higher authority rather than handled by the team.
  - **Exploit** (positive risk): actively guarantee a potential opportunity happens, e.g. contacting a large US company to lock in a potential collaboration.
  - **Enhance** (positive risk): increase probability/impact of an opportunity, e.g. training the team to pitch the scuba app to a new customer segment (swimmers, not just divers).
  - **Share** (positive risk): partnering with another firm to jointly capture an opportunity — real-world example given: food-delivery platforms (Uber Eats and another, transcribed unclearly as "Lodash") partnering with grocery chains (Coles, and another transcribed as "healthy," likely Woolworths) to deliver groceries.
  - **Accept** (positive risk): don't actively pursue the opportunity, just take it if it happens; if you have spare capacity/hours you can use them opportunistically.
- **Canvas outage anecdote**, used to explain "residual risk": a recent Canvas outage was eventually resolved (student data restored, system operational again), but cost roughly 4–5 days of downtime. Afterwards, **residual risks** included some students being unable to submit assignments on time — deadlines had to be rescheduled — and some oral vivas had to be rescheduled as a knock-on effect.
- **Agile vs waterfall risk management** (verbal only): waterfall identifies risks up front; agile addresses risk iteratively per sprint/release — e.g., assessing the risk of a payment-gateway feature (such as security vulnerabilities) before that sprint begins, and designing the work to avoid those issues. Hybrid approaches (a formal risk register plus agile flexibility) are common and were explicitly recommended ("no silver bullet... you can use a combination"). Agile-specific risk practices mentioned: periodic risk reviews; prioritising high-risk features early in the backlog (e.g., integrating a new cloud service, or a new third-party gateway); burn-down charts as a supporting tool; risk work being done collaboratively. Agile's flagged weakness: documentation can be lacking, which is specifically dangerous for risk management (a "recipe for disaster").
- **Personal anecdote used as a lead-in to procurement**: roughly 16–17 years ago the lecturer was an IT intern at a tea manufacturing company and observed tea auctions/tenders — described as an intensely serious, almost "sacred" event for the business side of the company, with IT staff peripheral to it. Used to introduce the idea of tender processes before the procurement content began.
- **Announcements** (verbal only, not on slides):
  - Mid-semester break is the following week. The lecturer explicitly said Ed Discussion responses will be slower during the break, and encouraged students to genuinely rest rather than front-load assignment work, framing it as a work-life-balance point: "if you don't have good breaks... you cannot do good work, especially during the exams."
  - Mid-semester teaching survey results shared: response rate over 40% (versus a usual faculty baseline of under 30%); average rating **4.6 out of 5**. Positive comments were about preparation, accommodating requests, and clear feedback. The main improvement comment was that the lecturer moves too fast through slides — he committed to slowing down, pausing roughly every 10–15 minutes, and colour-coding key slides going forward so they stand out.
  - Group project guidance walkthrough (referencing the Canvas module live): the assignment overview includes the marking rubric; the "Suggested Weekly Progress" document is a non-mandatory pacing guide ("you don't need to stick to this perfectly"); an FAQ/additional-information document has been added; provided templates are a guide to required topics/content rather than a rigid structure — word limits should be respected where given, otherwise use best judgement (not too long or too short).
  - Group project due date confirmed verbally: **Week 13, due 8 November** — described as "around six to seven weeks" away from this lecture.
  - Tutors can review draft group-report work and give directional feedback, but cannot pre-assign a grade band (can't say "this is HD" or "this is D"); lecturer encouraged students to share drafts with tutors since weekly evaluation slots may not leave time for detailed discussion.
- **Personal outsourcing/procurement anecdotes** (verbal only):
  - The lecturer's own startup evaluated a hosting vendor comparable to "Rackspace" — described as an older-style, expensive, physical/server-based hosting provider, chosen despite the higher price because of trusted quality and excellent customer service/support, even though newer serverless options (Microsoft Azure, AWS) were cheaper — used as a real anecdote for why reputation and customer service matter in vendor evaluation beyond price alone.
  - An internal University of Sydney tool (referred to as "the discussion" tool / possibly Ed-related, transcribed unclearly) was originally built by an internal development team — used as an example of when a Vendor Scorecard approach makes sense: checking in with an existing long-standing internal or external development relationship (e.g., "GradeScope developers," per the transcript) before assigning them a new project.
- **Australian outsourcing example** (verbal, real-world, not on a slide): Australia previously had three car manufacturers — **Holden** (the Australian brand), **Ford**, and **Toyota** — and all three ceased local manufacturing, mainly due to expensive Australian labour, all exiting roughly between **2015 and 2020** (Holden reportedly the last to leave). Used as the concrete illustration that "cost efficiency" (expensive local labour) is the dominant driver of outsourcing decisions specifically in the Australian context.
- **Mid-lecture break small talk**: lecturer asked students whether they had assignments due in other units (some responded "many of them") and whether they'd be working during the semester break (a student said yes; lecturer said he'd be doing the same).
- Two live Menti polls were run during the lecture (QR code + link shown on-slide) — see Section 3 for both, verbatim.

## 3. Lecture-quiz questions (verbatim, with the answer the lecturer gave)

**Q1 — Menti live poll ("Vendor Evaluation" scenario).**
Prompt (verbatim from slide): *"USyd is tendering for a new catering supplier for campus events. The main requirement is that the supplier must comply with food safety certifications, have valid insurance, and meet health and hygiene regulations. Price and menu variety are secondary considerations."*
Question asked: *"Which supplier evaluation method is most suitable in this case?"* (the three methods taught this week: Weighted Scoring Model / Checklist / Vendor Scorecard)
Link shown: https://www.menti.com/alyxjezogo2
**Answer given by the lecturer: Checklist.** Reasoning stated live: "Considering it involves a lot of safety requirements, health and hygiene regulations, and insurance requirements... you could actually fall into this approach" — i.e., Checklist is the method that's "best for when compliance to minimum standards is critical," which matches this scenario. The lecturer noted a Weighted Scoring Model could also be used (or a combination of the two), but confirmed Checklist as the intended/majority answer.

**Q2 — rhetorical, answered immediately.**
*"What is MVP, by the way?"*
**Answer: Minimum Viable Product.**

**Q3 — rhetorical, answered immediately.**
*"What is SLA?"*
**Answer: Service Level Agreement** — explained as a standard specifying a response time frame and required content, e.g. the university must respond to a student's exam-mark complaint within a set number of business days, provide justification/evidence, while the student must also properly justify their inquiry.

**Q4 — pause-and-think, tied to the Make-or-Buy worked example on the slide.**
Data given on slide: Alternative 1 (Make Internally) total production cost = **$1,100,000**; Alternative 2 (Buy from Outside) total production cost = **$1,190,000**; Differential Amount = **$(90,000)**.
Question asked: *"What is the potential, the favourable [option] here — is it Alternative 1 or 2?"*
**Answer: Alternative 1 (Make Internally)** — confirmed as more cost-effective, being $90,000 cheaper than buying from outside.

**Q5 — pause-and-think, contract-types scenario (verbal only, no slide).**
Scenario given: *"You are developing a house... and you recruit a carpentry company. Out of Fixed Price, Cost Reimbursable, and Time and Materials — which one is more beneficial for me [the homeowner/buyer] in this situation?"*
**Answer: Fixed Price** — you agree to pay a set amount (e.g., "$10,000 for this room, done in one month") regardless of how long the work takes or what it costs the contractor; you don't pay extra even if they work longer.

**Q6 — same scenario, follow-up question.**
*"What would be the most beneficial for the supplier or the carpentry company [instead]?"*
**Answer: Either Cost Reimbursable or Time and Materials** — both let the seller "stretch" things in their favour: claiming extra costs for reimbursement, or billing more hours/materials under time-and-materials.

**Q7 — rhetorical, answered immediately (outsourcing rationale).**
*"Why do people [companies] outsource projects? ... In Australia, there's one main reason. What do you think?"*
**Answer: To save money — labour is very expensive in Australia.** Concrete example given: Australia previously had three car manufacturers — **Holden** (the Australian brand), **Ford**, and **Toyota** — and all three stopped manufacturing cars in Australia (roughly between 2015 and 2020, Holden reportedly the last to leave), mainly because of expensive local labour.

**Q8 — Menti live poll ("Muddy Card"), open-ended, no single correct answer.**
Prompt (verbatim from slide): *"Explain in a few words any unclear area or a topic which requires further clarification from today's lecture. Or just post a question you would like to ask."*
Link shown: https://www.menti.com/alyo5ye8mc9p
**Answer: N/A.** This is an open student-feedback/reflection prompt (a "muddy card" exercise), not a content question with a single correct answer — not suitable for exam-question authoring, but included here since it was formally posed to the class as a poll.

## 4. Post-lecture / informal Q&A discussion (woven through the recording + closing)

- Opened by checking whether Zoom/online participants could see and hear him and the screen properly — confirmed by a student named Ronit.
- Asked whether anyone had questions on last week's risk-management content before moving on to procurement — no substantive questions surfaced in the recording (brief acknowledgement only).
- Asked whether anyone in the class had personally been part of a tender or auction process (house auction, vehicle auction) before introducing procurement — students said no; the lecturer shared his own tea-auction internship story instead as a substitute.
- During the scuba-diver risk-response exercise, asked open brainstorming questions to the class ("What can go wrong?", "What is your option here?") — audible answers in the transcript were sparse; a compliance-related risk was the one example the class surfaced and the lecturer built the rest of the walkthrough on.
- Asked directly: *"Any questions about the project work and how it's assessed? When is it due? Anyone remember?"* — a student apparently supplied/confirmed the date, after which the lecturer verbally confirmed: Week 13, due 8 November, "around six to seven weeks" from this lecture.
- Mid-lecture 5-minute break: asked students whether they have assignments due in other units (some said "many of them") and whether they'd be working during the semester break (a student said yes; lecturer said he'd be doing the same).
- Repeated short comprehension check-ins throughout the session, each met with brief "all good"/no-response reactions rather than extended discussion: "Any questions about risk management? Any unclear areas for you?"; "Any questions about the project work?"; "Any question about that explanation of RFQ and RFP? All good?"; "Any questions up to this point?"; "Any questions up to now?"
- Closing: *"Any questions before we close? Before the break? All good?"* — no further questions raised in the recording; lecturer wished the class a good mid-semester break and a good evening.
