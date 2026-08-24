import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 4,
  paperNumber: 1,
  title: "Week 4 Practice Paper — Tutorial",
  topics:
    "Scope Creep & Risk Analysis and Work Breakdown Structure applied to an HR Management System scenario (mobile app/payroll analytics/multilingual support requested mid-project without budget or timeline change); Scheduling Dependencies via a sequential Activity-on-Node chain (Requirements→Design→Development→Testing→Deployment) and recalculating duration when an activity's length changes; GitHub-based project board setup (repository naming convention, collaborators, Kanban workflow columns) for the group project; continuity with Week 3's scope creep, WBS decomposition, dependency types, and Critical Path Method concepts applied to new scenarios and tooling.",
  sourceFiles: ["tutorial/Tutorial sheet Week 04 INFO6007.pdf.pdf"],
  questions: [
    {
      type: "mcq",
      prompt:
        "In the Week 4 tutorial's HR Management System scenario, the client requests new features (mobile app, payroll analytics, multilingual support) halfway through the project \"without any change in budget or timeline.\" Which of the following best describes why this exact combination is the textbook definition of scope creep, rather than a normal, well-managed change request?",
      options: [
        "Because new functionality is being added without a corresponding adjustment to time, cost, or resources",
        "Because the features were requested by the client rather than the project team",
        "Because mobile apps are inherently more expensive to build than web apps",
        "Because payroll analytics requires additional security compliance",
      ],
      correctIndex: 0,
      modelAnswer:
        "Per Week 3's definition (directly applicable here), scope creep is \"uncontrolled changes or continuous growth in a project's scope without adjustments to time, cost, and resources.\" The tutorial scenario matches this exactly: new features are added but budget and timeline stay fixed — the defining trait isn't who requested the change or what the feature is, but the lack of a compensating adjustment.",
    },
    {
      type: "mcq",
      prompt:
        "Which pair of Week 3 concepts would most directly help the HR System project manager push back on the client's mid-project feature requests without simply refusing them outright?",
      options: [
        "Fast tracking and crashing",
        "Analogous estimating and Gantt charting",
        "Mandatory and discretionary dependency mapping",
        "A formal Change Control Process and a clear Scope Statement defining inclusions/exclusions",
      ],
      correctIndex: 3,
      modelAnswer:
        "Week 3's mitigation list for scope creep centers on a formal Change Control Process and a clear Scope Statement (with explicit inclusions/exclusions) — these let the PM evaluate and formally approve or reject each new feature request against agreed scope, rather than informally absorbing it. The other options are real Week 3 tools, but they address schedule compression, cost estimation, or dependency sequencing, not scope control.",
    },
    {
      type: "short",
      prompt:
        "Identify three risks that could arise from the HR System scope creep scenario, and explain how each connects to a concept from Week 3.",
      modelAnswer:
        "(1) Budget overrun — the 'Scope Management Issues' table lists this as scope creep's direct impact, since mobile app/payroll analytics/multilingual work all consume unbudgeted developer hours. (2) Schedule delay — adding three new features without extending the timeline risks pushing the critical path (per Week 3's Critical Path Method) past the original deadline, since the added work still has to pass through Development and Testing. (3) Team burnout — also explicit in the Issues table's listed impact, from developers absorbing extra scope inside the same time-boxed schedule.",
    },
    {
      type: "short",
      prompt:
        "Suggest two strategies the HR System project manager could use to manage or prevent this scope creep, referencing Week 3 concepts by name.",
      modelAnswer:
        "(1) Enforce a formal Change Control Process, requiring any new feature (mobile app, payroll analytics, multilingual support) to go through impact analysis and sign-off before being added, rather than being absorbed ad hoc. (2) Maintain a clear Scope Statement with explicit inclusions/exclusions agreed at Define Scope, so the client's new requests can be evaluated against — and if approved, traded off via — the existing baseline, rather than silently expanding it.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial asks you to \"develop a simplified WBS with at least 3 levels\" for the HR System, covering requirements, design, development, testing, and deployment. Per Week 3's lecture, what is the name of the technique used to build a WBS like this?",
      options: ["Benchmarking", "Decomposition", "Crashing", "Variance analysis"],
      correctIndex: 1,
      modelAnswer:
        "Week 3 defines decomposition as \"the process of breaking high-level deliverables into sub-deliverables, and then into work packages\" — exactly what's needed to turn 'HR Management System' (Level 1) into requirements/design/development/testing/deployment (Level 2) and then further work packages (Level 3).",
    },
    {
      type: "short",
      prompt:
        "Sketch (in words) a simplified 3-level WBS for the HR System tutorial scenario, following Week 3's WBS rules.",
      modelAnswer:
        "Level 1: HR Management System (the project). Level 2: five deliverables — Requirements, Design, Development, Testing, Deployment. Level 3 (work packages under each, one example each): under Requirements — 'Gather stakeholder requirements' and 'Build Requirements Traceability Matrix'; under Design — 'Database schema design'; under Development — 'Build payroll module' and 'Build core HR module'; under Testing — 'Unit testing' and 'User acceptance testing'; under Deployment — 'Production rollout' and 'Staff training.' Per Week 3's rules, each work package should be the responsibility of only one individual/team and appear in only one place in the WBS.",
    },
    {
      type: "scenario",
      requiresDrawing: true,
      prompt:
        "Draw a simple Activity-on-Node (AON) diagram for the tutorial's scheduling exercise: Requirements (2 weeks) → Design (3 weeks) → Development (6 weeks) → Testing (4 weeks) → Deployment (2 weeks). Then identify the critical path and the total project duration.",
      answerDiagram:
        "flowchart LR\n  A[Requirements\\n2 weeks] --> B[Design\\n3 weeks] --> C[Development\\n6 weeks] --> D[Testing\\n4 weeks] --> E[Deployment\\n2 weeks]",
      modelAnswer:
        "Since every activity depends solely on the one before it (a single sequential chain, no parallel branches), the critical path is the entire chain: Requirements → Design → Development → Testing → Deployment. Total project duration = 2+3+6+4+2 = 17 weeks. Per Week 3's Critical Path Method, this is 'the longest sequence of dependent activities,' which here is also the only sequence, so it trivially determines project duration.",
    },
    {
      type: "short",
      prompt:
        "If Development takes 8 weeks instead of 6, recalculate the new project duration, and explain why the critical path doesn't change shape.",
      modelAnswer:
        "New duration = 2+3+8+4+2 = 19 weeks (a 2-week increase, matching the 2-week increase in Development). The critical path doesn't change shape because the chain is fully sequential — every activity is a mandatory (hard-logic) dependency of the next, so there's no alternate path for the schedule to reroute through; per Week 3, 'any delay on the Critical Path will DELAY the entire project,' which here means any activity's delay delays all of it.",
    },
    {
      type: "mcq",
      prompt:
        "In the tutorial's scheduling chain, the dependency between Development and Testing (Testing cannot start until Development is code-complete) is best classified, per Week 3, as?",
      options: [
        "External dependency",
        "Discretionary dependency",
        "Mandatory dependency",
        "Lag-only dependency",
      ],
      correctIndex: 2,
      modelAnswer:
        "Week 3 defines mandatory dependencies (hard logic) as 'inherent to the work and cannot be changed' — you cannot test code that hasn't been built yet, exactly the Development→Testing relationship in this chain.",
    },
    {
      type: "short",
      prompt:
        "Could the project manager apply 'lead time' (Week 3) to the tutorial's Development→Testing dependency to shorten the 17-week schedule? Explain, including the tradeoff.",
      modelAnswer:
        "Yes — lead time lets a successor start before its predecessor fully finishes; here, Testing could begin on already-completed modules while Development is still finishing others (the same idea as Week 3's example of starting testing before development is 100% complete). This is Week 3's 'accelerate the schedule' use of lead time. The tradeoff is risk: testing partially-complete work may need to be repeated if later Development changes affect already-tested modules — the same risk profile Week 3 attributes to fast tracking.",
    },
    {
      type: "mcq",
      prompt:
        "Per the tutorial's Part E instructions, what repository naming convention must each group use for its GitHub project repository?",
      options: [
        "\"INFO6007-GroupYY\"",
        "\"INFO6007 TXX-GYY\", where XX is your tutorial number and YY is your group number",
        "\"Tutorial-XX-Team-YY\"",
        "The group members' unikeys concatenated",
      ],
      correctIndex: 1,
      modelAnswer:
        "The tutorial states: \"Name the repository using the format 'INFO6007 TXX-GYY', where XX is your tutorial number and YY is your group number within that tutorial.\"",
    },
    {
      type: "mcq",
      prompt:
        "Besides all group members, who else must be added as a collaborator on the group's GitHub repository, per the tutorial?",
      options: [
        "Only the unit coordinator",
        "No one else — repositories must stay private to the group",
        "The tutor and the 'info6007' account",
        "Every student in the tutorial, for peer review",
      ],
      correctIndex: 2,
      modelAnswer:
        "The tutorial states: \"You must also add your tutor (ask for their unikey) and 'info6007' as collaborators,\" in addition to the group's own members.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial recommends which project board layout for tracking the group project, and what is the correct order of its workflow columns?",
      options: [
        "Scrum board; Sprint Backlog → Doing → Done",
        "Gantt view; Not Started → Started → Finished",
        "Kanban; To Do → Doing → Done → Archived",
        "Kanban; Backlog → Ready → In Progress → In Review → Done",
      ],
      correctIndex: 3,
      modelAnswer:
        "The tutorial recommends 'the Kanban layout, as this makes it easier to organise and track your team's work,' with the workflow: 'Backlog -> Ready -> In Progress -> In Review -> Done.'",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Per the tutorial, the repository's visibility should be set to Public so that other tutorial groups can review each other's project boards.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. The tutorial specifies: \"Set the repository visibility to Private and leave the other settings at their default values.\"",
    },
    {
      type: "short",
      prompt:
        "Explain how the GitHub project board's Backlog column relates to the WBS concept covered in Week 3 and reused in this week's tutorial.",
      modelAnswer:
        "The Backlog column holds tasks members 'think of... for next week' before they're scheduled or assigned — conceptually the same starting point as a WBS's Level 3 work packages before they're sequenced into a schedule. Just as Week 3's WBS decomposes deliverables into manageable work items (e.g., 'draft a work plan,' 'research GitHub usage'), the Backlog captures those same granular tasks; moving them through Ready → In Progress → In Review → Done is the tutorial's lightweight equivalent of applying Week 3's schedule processes (Sequence Activities, Develop Schedule, Control Schedule) to track their completion.",
    },
    {
      type: "scenario",
      prompt:
        "Your tutorial group has created its GitHub repository and Kanban board, but by the deadline only two of five members have been added as collaborators, and no tasks have been entered in the Backlog. Using this week's tutorial requirements and Week 3's WBS concepts, list what still needs to happen and why it matters.",
      modelAnswer:
        "(1) Add the remaining three members (plus the tutor and 'info6007') as collaborators — per the tutorial, 'make sure all members can access the repository successfully,' since access failures block anyone from updating the board. (2) Populate the Backlog with initial tasks (e.g., 'draft a work plan,' 'research GitHub usage,' 'review the assignment guidelines,' 'choose a project topic') and assign each to a member — the tutorial requires 'some initial tasks have been entered and assigned' by next week. Skipping this mirrors Week 3's WBS warning that a unit of work must have a clear owner; without assigned Backlog items, no one is accountable for a piece of the group's work, and the group can't track progress through Ready → In Progress → In Review → Done.",
    },
    {
      type: "mcq",
      prompt:
        "If the HR System client's mobile app request (from Part A) is formally approved via Change Control, which additional Week 3 process would the PM need to re-run to reflect the added scope in the schedule?",
      options: [
        "Sequence Activities and Develop Schedule, since new activities and dependencies must be added",
        "Validate Scope only",
        "Control Costs only, since scope changes only affect budget",
        "Nothing — approved scope changes don't affect the schedule baseline",
      ],
      correctIndex: 0,
      modelAnswer:
        "Adding an approved feature means new WBS work packages exist that weren't in the original network diagram, so Week 3's Sequence Activities (placing the new activities in the dependency chain) and Develop Schedule (recalculating the Critical Path Method) must be re-run to produce an updated, accurate schedule baseline.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial's Part A scenario doesn't specify a formal process for the multilingual support request — the client asks informally 'halfway through.' Per Week 3, why does this matter for scope control?",
      options: [
        "It doesn't matter — all client requests must be implemented immediately",
        "Only requests submitted in writing by the sponsor count as scope",
        "Informal requests bypass Validate Scope and the Change Control Process, so nothing has been checked against the Scope Statement or formally costed",
        "Informal requests are automatically rejected under PMI rules",
      ],
      correctIndex: 2,
      modelAnswer:
        "Per Week 3's mitigation framework, a request only becomes a legitimate scope change once it passes through the formal Change Control Process and is checked against the Scope Statement's inclusions/exclusions; an informal mid-project ask that gets implemented without that step is exactly how scope creep occurs, since nothing has assessed its cost or schedule impact first.",
    },
    {
      type: "short",
      prompt:
        "The tutorial's Part A features (mobile app, payroll analytics, multilingual support) each likely affect a different part of the WBS you built in Part B. For each feature, name which Level 2 deliverable(s) it would primarily add work to, and why.",
      modelAnswer:
        "Mobile app — primarily Development (a new client interface to build) and Testing (a new platform to test on). Payroll analytics — primarily Requirements (new data/reporting requirements to gather) and Development (a new module). Multilingual support — spans Design (UI/locale design), Development (translation/localisation implementation), and Testing (testing every supported language), making it the most cross-cutting of the three and hardest to scope-limit.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Per Week 3, adding lag time between Testing and Deployment to absorb schedule risk from a newly-approved feature would also shorten the overall schedule.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False — half right, half wrong. Lag time does add a buffer between Testing and Deployment (e.g. waiting before go-live), but Week 3 defines lag time's effect as 'technically slows down the schedule,' not shortening it; the 'shortening' property belongs to lead time, not lag time.",
    },
    {
      type: "scenario",
      prompt:
        "[Final-exam style case study] A different IT consultancy is running a project structurally identical to the tutorial's HR System: Requirements (2 weeks) → Design (3 weeks) → Development (6 weeks) → Testing (4 weeks) → Deployment (2 weeks), sequential with no parallel activities. Three weeks into Development, the client requests two unbudgeted features. The PM estimates each adds 1.5 weeks to Development if approved. (a) Classify this using Week 3/4 terminology. (b) If both features are approved without adjusting the deadline, recalculate total project duration. (c) Recommend one mitigation.",
      modelAnswer:
        "(a) This is scope creep — uncontrolled scope growth (two new features) with no adjustment to time or cost, per Week 3's definition. (b) Development grows from 6 to 6+1.5+1.5 = 9 weeks; since the chain is fully sequential, total duration becomes 2+3+9+4+2 = 20 weeks (up from 17), a 3-week overrun that falls entirely on the Critical Path since there's no parallel path to absorb it. (c) Mitigation: run both features through a formal Change Control Process before approval, using the Requirement Traceability Matrix to weigh their cost/schedule impact against the original Scope Statement, and negotiate either an extended deadline or a reduced scope elsewhere to compensate — rather than silently absorbing 3 weeks of schedule risk.",
    },
    {
      type: "mcq",
      prompt:
        "Per Part D, if a student is not yet in a group by the tutorial deadline, what does the tutorial instruct them to do?",
      options: [
        "Email the unit coordinator directly to be manually assigned",
        "Wait until Week 6 when stand-ups begin",
        "Form a group of one and complete the assignment solo",
        "Speak to their tutor, who will help match them into a suitable group within the tutorial where possible",
      ],
      correctIndex: 3,
      modelAnswer:
        "The tutorial states: 'If you are not yet in a group, speak to your tutor, who will help match students into suitable groups within the tutorial where possible.'",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 4,
  paperNumber: 2,
  title: "Week 4 Practice Paper — Lecture",
  topics:
    "Project Cost Management: definition, cost types (tangible/intangible/direct/indirect/sunk), contingency vs management reserves, the 4 main processes (Plan Cost Management, Estimate Costs, Determine Budget, Control Costs), estimating techniques (analogous, parametric, bottom-up, three-point/PERT, expert judgement, benchmarking) with worked calculations, cost baseline, Earned Value Management (PV/EV/AC, CV/SV, CPI/SPI, EAC/ETC) with worked calculations, Traditional vs Agile cost management and challenges applying EVM in Agile, industry IT cost blowout case studies, the NSW Digital Driver Licence and University of Sydney student portal case studies; readings on EVMS's 32 guidelines and BCWS/BCWP/ACWP/VAC terminology, agile budgeting at Curaspan, and the ClipBits software estimation case study (LOC and function point estimation).",
  sourceFiles: [
    "lecture/Lecture - INFO6007 Week 04 - Cost Management.pdf",
    "lecture/Reading 1 Basic Concepts of Earned Value Management (EVM).pdf",
    "lecture/Reading 2 Agile Budgeting in Action_ Bringing Transparency and Flexibility to Project Finances.pdf",
    "lecture/Reading 3 A Case Study in Software Project Estimation.pdf",
  ],
  questions: [
    {
      type: "mcq",
      prompt: "What is the formal definition of Project Cost Management given in the lecture?",
      options: [
        "The processes involved in planning, estimating, budgeting, financing, funding, managing, and controlling costs so that the project can be completed within the approved budget",
        "The processes for negotiating vendor contracts and procurement",
        "The process of tracking billable hours for stakeholders",
        "The process of forecasting revenue from the completed product",
      ],
      correctIndex: 0,
      modelAnswer:
        "The lecture's formal definition: \"Project Cost Management includes the processes involved in planning, estimating, budgeting, financing, funding, managing, and controlling costs so that the project can be completed within the approved budget.\"",
    },
    {
      type: "mcq",
      prompt: "Which statement correctly distinguishes sunk costs from indirect costs, per the lecture?",
      options: [
        "Sunk costs are tangible while indirect costs are intangible",
        "Sunk costs are money already spent in the past that is not included when deciding what to invest in going forward, whereas indirect costs are ongoing costs not directly tied to producing project deliverables",
        "Sunk costs are always higher in dollar value than indirect costs",
        "Sunk costs are the same as contingency reserves",
      ],
      correctIndex: 1,
      modelAnswer:
        "The lecture defines sunk costs as \"money that has been spent in the past when deciding what projects to invest in... sunk costs are not included in the PMP,\" while indirect costs are \"not directly related to the products or services but indirectly related to performing the project\" — different categories: sunk costs are about timing/decision-relevance, indirect costs are about proximity to deliverables.",
    },
    {
      type: "mcq",
      prompt: "Which statement correctly distinguishes contingency reserves from management reserves?",
      options: [
        "Contingency reserves are set by the sponsor while management reserves are set by the project manager",
        "Management reserves are always larger than contingency reserves",
        "Contingency reserves cover future situations that may be partially planned for and sit inside the project cost baseline, while management reserves cover unpredictable situations and sit outside the baseline",
        "Contingency reserves cover unpredictable risks while management reserves cover known risks",
      ],
      correctIndex: 2,
      modelAnswer:
        "The lecture states contingency reserves \"allow for future situations that may be partially planned for and are included in the project cost baseline,\" while management reserves \"allow for future situations that are unpredictable\" — and separately, \"Total Project Budget = Cost Baseline + Management Reserves,\" confirming management reserves sit outside the baseline while contingency reserves sit inside it.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following is NOT one of the 4 main processes in Project Cost Management covered in the lecture?",
      options: ["Estimate Costs", "Control Costs", "Determine Budget", "Validate Scope"],
      correctIndex: 3,
      modelAnswer:
        "The lecture's 4 main processes are Plan Cost Management, Estimate Costs, Determine Budget, and Control Costs. Validate Scope is a Scope Management process (Week 3), not a Cost Management one.",
    },
    {
      type: "mcq",
      prompt:
        "Which cost estimating technique is described as 'the most detailed and hence the most accurate,' estimating each work package/task and rolling up to a total?",
      options: [
        "Bottom-Up Estimating",
        "Analogous Estimating",
        "Parametric Estimating",
        "Three-Point Estimating (PERT)",
      ],
      correctIndex: 0,
      modelAnswer:
        "The lecture states Bottom-Up Estimating: 'Estimate each work package/task → roll up to total. This is the most detailed and hence the most accurate technique' — distinct from Analogous (quick, historical, less accurate) and Parametric (uses statistical/quantitative models).",
    },
    {
      type: "short",
      prompt:
        "Using the lecture's Bottom-Up Estimation example for a mobile banking app (Login Module: 120 hours × $60/hr; Payments Module: 300 hours × $60/hr; Testing: 200 hours × $50/hr; Cloud Hosting: $12,000 flat), show the subtotal and the contingency reserve at 10%.",
      modelAnswer:
        "Login = 120×$60 = $7,200. Payments = 300×$60 = $18,000. Testing = 200×$50 = $10,000. Cloud Hosting = $12,000. Subtotal = 7,200+18,000+10,000+12,000 = $47,200. Contingency (10% of subtotal) = $4,720 — matching the lecture's stated figures exactly.",
    },
    {
      type: "short",
      prompt:
        "Using the lecture's Three-Point Estimation example for setting up cloud infrastructure (Optimistic $8,000, Most Likely $12,000, Pessimistic $20,000), calculate the PERT cost estimate and show your working.",
      modelAnswer:
        "Estimate = (O + 4M + P) / 6 = (8,000 + 4×12,000 + 20,000) / 6 = (8,000 + 48,000 + 20,000) / 6 = 76,000 / 6 = $12,666.67 ≈ $12,667 — matching the lecture's stated figure.",
    },
    {
      type: "mcq",
      prompt:
        "Per the NSW Digital Driver Licence case study, what estimating method did the team use for the 'App development' cost item specifically?",
      options: ["Three-point", "Bottom-up", "Expert judgement", "Rolling-wave"],
      correctIndex: 1,
      modelAnswer:
        "The case study's cost-item table lists 'App development' using the 'Bottom-up' method, based on 'Staff + supplier effort,' with 'Feature complexity' as the main uncertainty — distinct from System integration (Three-point), Security & privacy assurance (Expert judgement), and Trials & rollout readiness (Rolling-wave).",
    },
    {
      type: "mcq",
      prompt: "Which correctly defines Earned Value (EV), per the lecture?",
      options: [
        "The total direct and indirect costs actually incurred for work performed",
        "The budgeted cost of work planned to be done by a certain date",
        "The budgeted cost of work actually completed by a certain date",
        "The expected total cost of the project based on current performance trends",
      ],
      correctIndex: 2,
      modelAnswer:
        "The lecture defines Earned Value (EV) as 'Budgeted cost of work actually completed by a certain date... the estimate of the value of the physical work actually completed.' The first option describes Actual Cost, the second describes Planned Value, and the fourth describes Estimate at Completion.",
    },
    {
      type: "mcq",
      prompt:
        "If a project's Cost Variance (CV) is positive and its Schedule Variance (SV) is negative, what does this indicate?",
      options: [
        "The project is over budget but ahead of schedule",
        "The project is under budget and ahead of schedule",
        "The project is over budget and behind schedule",
        "The project is under budget but behind schedule",
      ],
      correctIndex: 3,
      modelAnswer:
        "Per the lecture, 'If CV is Positive → under budget' and 'If SV is Positive → ahead of schedule & Negative → behind schedule.' Positive CV combined with negative SV means under budget but behind schedule.",
    },
    {
      type: "short",
      prompt:
        "Calculate CV, SV, CPI, and SPI for the lecture's IT project example (BAC=$100,000, AC=$40,000, EV=30% of BAC, PV=35% of BAC), and interpret each result.",
      modelAnswer:
        "EV = 0.30×100,000 = $30,000. PV = 0.35×100,000 = $35,000. CV = EV−AC = 30,000−40,000 = −$10,000 → over budget by $10,000. SV = EV−PV = 30,000−35,000 = −$5,000 → behind schedule by $5,000 worth of work. CPI = EV/AC = 30,000/40,000 = 0.75 → for every $1 spent, only $0.75 of value is earned (low cost efficiency). SPI = EV/PV = 30,000/35,000 = 0.857 → work is progressing at 85.7% of the planned rate (behind schedule).",
    },
    {
      type: "short",
      prompt:
        "Using CPI = 0.75 from the previous calculation, calculate the Estimate at Completion (EAC) and explain what it means for the project.",
      modelAnswer:
        "EAC = BAC/CPI = 100,000/0.75 = $133,333. This means that if the project continues performing at its current cost efficiency (CPI=0.75), it will finish $33,333 over its original $100,000 budget, unless the PM takes corrective action to improve cost performance.",
    },
    {
      type: "mcq",
      prompt:
        "Per the lecture's comparison table, why is EVM harder to apply reliably in Agile projects than in traditional (Waterfall) ones?",
      options: [
        "Changing scope makes Planned Value unstable, and story points/features aren't directly measurable in dollars",
        "Agile projects never track cost at all",
        "Agile teams refuse to report progress to Finance",
        "Agile projects always cost more than Waterfall projects",
      ],
      correctIndex: 0,
      modelAnswer:
        "The lecture lists these exact challenges: 'Changing scope makes Planned Value unstable,' 'Story points and features are not directly measurable in dollars,' and 'Frequent reprioritisation reduces the usefulness of variance analysis' — EVM assumes a stable baseline that Agile's flexible scope undermines.",
    },
    {
      type: "short",
      prompt:
        "In the lecture's Agile Budgeting scenario (a Scrum team costing $60,000 per 2-week sprint, 10 sprints funded upfront), how much of the $600,000 total budget remains after Sprint 5, and how does the team respond to the stakeholders' request to add biometric login without more budget?",
      modelAnswer:
        "After 5 of 10 sprints (halfway), $300,000 of the $600,000 has been spent, leaving $300,000 remaining — matching the lecture's stated figure. Per the lecture, the team adds biometric login 'by adjusting priorities without increasing budget': since in Agile 'time and cost are often fixed, but scope is variable,' the team reprioritises the backlog to deliver the highest-value features (including biometric login) within the remaining 5 sprints' budget, rather than requesting extra funding.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following is one of the lecture's listed 'Adaptations' for applying EVM concepts in an Agile context?",
      options: [
        "Abandon all cost tracking and rely purely on the Product Owner's judgement",
        "Track Earned Business Value (EBV) instead of only cost efficiency, and recalculate EAC at the end of each iteration using rolling forecasts",
        "Convert all story points into fixed dollar amounts before the project starts",
        "Apply the PERT formula to every user story",
      ],
      correctIndex: 1,
      modelAnswer:
        "The lecture's Adaptations list states: 'Track Earned Business Value (EBV) instead of only cost efficiency,' 'Map story points to cost using sprint burn rates,' and 'Recalculate EAC at the end of each iteration using rolling forecasts.'",
    },
    {
      type: "mcq",
      prompt:
        "Reading 1 ('Basic Concepts of EVM') uses the terms BCWS, BCWP, and ACWP. Which of these maps to the lecture's 'Earned Value (EV)'?",
      options: [
        "BCWS (Budgeted Cost for Work Scheduled)",
        "ACWP (Actual Cost of Work Performed)",
        "BCWP (Budgeted Cost for Work Performed)",
        "BAC (Budget at Completion)",
      ],
      correctIndex: 2,
      modelAnswer:
        "Reading 1 states: 'Budgeted cost for work performed (BCWP) or earned value.' BCWP is the older EVMS terminology for what the lecture calls Earned Value (EV). BCWS maps to Planned Value, and ACWP maps to Actual Cost.",
    },
    {
      type: "mcq",
      prompt:
        "Per Reading 1, what is created at the intersection of a project's Work Breakdown Structure (WBS) and its Organization Breakdown Structure (OBS)?",
      options: [
        "The cost baseline",
        "The contract budget base",
        "The performance measurement baseline",
        "A control account, the key management control point where a Control Account Manager (CAM) owns scope, schedule, and budget",
      ],
      correctIndex: 3,
      modelAnswer:
        "Reading 1 states: 'It is at this level where the WBS (what) and OBS (who) intersect that defines a control account, a key management control point. The person responsible for the work effort (scope, schedule, and budget) is the control account manager (CAM).'",
    },
    {
      type: "short",
      prompt:
        "Reading 1 defines Variance at Completion (VAC) as BAC − EAC. Using the lecture's IT project example (BAC=$100,000, EAC=$133,333), calculate VAC and explain what a negative VAC means, per Reading 1's convention.",
      modelAnswer:
        "VAC = BAC − EAC = 100,000 − 133,333 = −$33,333. Per Reading 1, 'a result greater than 0 is favorable, a result less than 0 is unfavorable' — the negative VAC confirms the project is trending toward finishing $33,333 over its original budget, the same overrun the lecture's EAC calculation already implied, just expressed as a single completion-level variance figure.",
    },
    {
      type: "mcq",
      prompt:
        "Per Reading 2's Curaspan case study, what is the key shift in what the organisation funds under agile budgeting?",
      options: [
        "It funds teams (as ongoing 'factories'), not projects — dollars are not tied to specific projects",
        "It funds individual projects more precisely than before, using detailed WBS-based estimates",
        "It funds only projects with a positive ROI calculated up front",
        "It abolished all budgeting and relies solely on stakeholder trust",
      ],
      correctIndex: 0,
      modelAnswer:
        "Reading 2 states: 'Teams are funded, not projects. Curaspan views teams as the equivalent of \"factories\" in a manufacturing setting... Dollars are not tied to projects.' This is a more radical version of agile budgeting than merely funding by sprint or iteration.",
    },
    {
      type: "mcq",
      prompt:
        "Per Reading 2, which single metric does Finance at Curaspan treat as more important than ROI when assessing engineering performance?",
      options: [
        "Cost Performance Index (CPI)",
        "Velocity — whether the company can sustainably develop and release new functionality at a fast rate",
        "Schedule Performance Index (SPI)",
        "Function point count",
      ],
      correctIndex: 1,
      modelAnswer:
        "Reading 2 states: 'Velocity is more important to Finance than ROI. The key question for finance is whether the company can sustainably develop and release new functionality at a fast rate.'",
    },
    {
      type: "short",
      prompt:
        "Reading 3's ClipBits case study originally estimated 5,407 lines of code but the final product contained only about 2,000. Using the lecture's 'What affects IT Cost Estimation?' slide, explain which listed factor best accounts for this gap.",
      modelAnswer:
        "The gap traces to 'Quality of requirements (clear vs vague)' and 'Estimation technique chosen' from the lecture's factors list: per Reading 3, the overestimate was 'due largely to uncertainty about the extent to which Windows Presentation Foundation (WPF) would be used,' since WPF's declarative syntax handled many operations (like UI updates) with far less code than the team had assumed when they made their LOC estimate — the requirement itself (how much of the UI framework would do automatically) wasn't yet clear at estimation time.",
    },
    {
      type: "mcq",
      prompt:
        "Reading 3's Lines-of-Code (LOC) estimation formula for each function is '(Optimistic + 4×Average + Pessimistic) / 6' — the same structure as which technique from the lecture?",
      options: [
        "Analogous Estimating",
        "Bottom-Up Estimating",
        "Three-Point Estimating (PERT)",
        "Parametric Estimating",
      ],
      correctIndex: 2,
      modelAnswer:
        "This is the same weighted-average structure as the lecture's Three-Point/PERT formula, (O + 4M + P)/6 — Reading 3 applies the identical beta-distribution-based technique to lines of code instead of cost or duration.",
    },
    {
      type: "scenario",
      prompt:
        "[Final-exam style case study] The University of Sydney's new online student portal project has a 6-month, $180,000 budget, planned as: Month 1 $20,000, Month 2 $35,000, Month 3 $30,000, Month 4 $35,000, Month 5 $30,000, Month 6 $30,000, with a 10% contingency reserve and 5% management reserve on top of the $180,000 cost baseline. At the end of Month 3, the course registration module is fully done and exam scheduling is 50% complete, with EV = $80,000 and AC = $85,000. Calculate CV, SV, CPI, SPI, and EAC (assuming CPI continues), and interpret the results.",
      modelAnswer:
        "PV (cumulative through Month 3) = 20,000+35,000+30,000 = $85,000. CV = EV−AC = 80,000−85,000 = −$5,000 → over budget by $5,000. SV = EV−PV = 80,000−85,000 = −$5,000 → behind schedule by $5,000 worth of planned work. CPI = EV/AC = 80,000/85,000 ≈ 0.941 → slightly under $1 of value per $1 spent (mild cost inefficiency). SPI = EV/PV = 80,000/85,000 ≈ 0.941 → progressing at about 94% of the planned rate (mildly behind schedule). EAC = BAC/CPI = 180,000/0.941 ≈ $191,282 — if this cost efficiency continues, the project is forecast to finish about $11,282 over its $180,000 baseline, before accounting for the separate 10% contingency / 5% management reserves sitting on top of that baseline.",
    },
    {
      type: "mcq",
      prompt:
        "Per the lecture's 'main components of a Project Budget,' which of these would the online student portal's LMS integration work and staff training most naturally fall under?",
      options: [
        "Indirect Costs — overhead unrelated to the specific deliverables",
        "Management Reserves — set aside for unknown risks",
        "Sunk Costs — since planning happened before the budget was approved",
        "Direct Costs — the salaries, software, and vendor fees needed to build and deliver those specific deliverables",
      ],
      correctIndex: 3,
      modelAnswer:
        "The lecture defines Direct Costs as 'salaries, hardware, software, vendor fees' — tied directly to producing project deliverables. LMS integration and staff training are named deliverables of the student portal project (per the case study's scope highlights), so their associated staff time and integration/training costs are Direct Costs, not Indirect Costs (overhead/admin) or reserves.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Per the lecture, if a project's CPI is greater than 1, the project is cost efficient, meaning it is earning more value than it is spending.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "True. The lecture states: 'If CPI > 1 → cost efficient,' since CPI = EV/AC — a ratio above 1 means EV (value earned) exceeds AC (actual cost), i.e. more value earned per dollar spent than budgeted.",
    },
  ],
};

export const WEEK_4_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
