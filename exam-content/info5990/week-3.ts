import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 3,
  paperNumber: 1,
  title: "Week 3 Tutorial Practice Paper",
  topics:
    "Organization vs business, professionalism, organizational value, and IT investment (Part A review, revisited from Week 2); how functional/matrix/flat/hierarchical structures affect cross-department communication, IT alignment, and IT-investment decision-making (Part B); why IT professionals need to understand an Organisation's business model and operating model; SmartCare Health Ltd case study — divisional structure, centralised IT vs divisional (state-level) operations, aligning IT strategy with business goals, measuring the value of an AI diagnostics IT investment (Part C)",
  sourceFiles: ["tutorial/INFO5990 2026-S1 Week 03 Tutorial Sheet.pdf"],
  questions: [
    {
      type: "mcq",
      prompt:
        "The tutorial's Part A asks students to define 'Organization' and 'Business' in their own words. Consistent with how this unit has defined these terms, which statement best captures the relationship between them?",
      options: [
        "An Organisation always refers to a for-profit entity, while a business can be either for-profit or non-profit",
        "Every Organisation is a business, but not every business is an Organisation",
        "The two terms are fully interchangeable and can be used without distinction in a professional context",
        "Every business is an Organisation, but not every Organisation is a business — an Organisation is any structured group working toward a goal, while a business is specifically the subset whose primary goal is to make a profit by providing goods or services",
      ],
      correctIndex: 3,
      modelAnswer:
        "This distinction was established in Week 2's 'Organisation vs Business' slide and is exactly what the tutorial's Part A question 1 asks students to restate: Organisation is the broader term for any structured group working toward a goal, not always profit-driven (e.g. Red Cross, NSW Health, University of Sydney), while Business is a type of Organisation whose primary goal is to make a profit (e.g. Canva, Apple).",
    },
    {
      type: "mcq",
      prompt: "Part A also asks students to define 'Professionalism.' Which definition is correct?",
      options: [
        "Following instructions exactly as given, without ever exercising independent judgement",
        "How formally a person dresses at work",
        "Simply holding a university degree in a technical field",
        "The conduct, judgement, and attitudes expected within a profession — competence, integrity, accountability, ethics, and continuous development",
      ],
      correctIndex: 3,
      modelAnswer:
        "Professionalism is the conduct, judgement, and attitudes expected within a profession — competence, integrity, accountability, ethics, and continuous development — as distinguished from the related but narrower concepts of Knowledge, Skill, and Expertise that this unit's Week 2 tutorial concept review also covers.",
    },
    {
      type: "mcq",
      prompt: "Part A asks students to define 'Organizational value.' Which definition matches how this unit defines the term?",
      options: [
        "Any personal benefit an individual employee receives from their job",
        "Value created, delivered, and sustained by an Organisation for its stakeholders — answering 'how does the Organisation create meaningful outcomes for its stakeholders?'",
        "The market price of an Organisation's shares on a given trading day",
        "The total revenue a company reports in its annual financial statements",
      ],
      correctIndex: 1,
      modelAnswer:
        "Week 2's 'Value and Organisational value' slide distinguishes plain Value (answering 'how does this benefit me or others?') from Organisational value specifically: value created, delivered, and sustained by an Organisation for its stakeholders (customers, employees, shareholders, society) — the definition the tutorial's Part A revisits.",
    },
    {
      type: "mcq",
      prompt: "Part A also asks students to define 'IT investment.' Which definition is correct?",
      options: [
        "Money spent exclusively on purchasing new laptops for staff",
        "Any expense the IT department incurs, regardless of whether it supports a strategic purpose",
        "Only resources that are permanently owned in-house; outsourced arrangements don't qualify",
        "The allocation of financial, human, and technological resources into IT systems, tools, or services to support organisational goals — resources that can be insourced or outsourced",
      ],
      correctIndex: 3,
      modelAnswer:
        "Per Week 2, an IT investment is the allocation of financial, human, and technological resources into IT systems, tools, or services to support or improve an Organisation's operations, performance, or strategic goals — these resources can be insourced (internally owned) or outsourced (externally sourced), which rules out the option that restricts it to in-house ownership.",
    },
    {
      type: "mcq",
      prompt:
        "Part A question 2 asks for three key differences between a business and an Organisation. Which set of three is accurate and consistent with Week 2's definitions?",
      options: [
        "There are no real differences — the tutorial question is testing whether students notice the two terms are synonyms",
        "(1) Purpose — a business exists primarily to profit, while an Organisation's purpose need not be profit-driven; (2) Scope — 'Organisation' is the broader category and 'business' a subset of it; (3) Examples — businesses include firms like Canva or Apple, while non-business Organisations include the Red Cross, NSW Health, or a university",
        "(1) Businesses always have IT departments and Organisations never do; (2) Organisations never have a hierarchy; (3) Businesses cannot be structured functionally",
        "(1) Size — businesses are always larger than Organisations; (2) Age — Organisations are always older than businesses; (3) Location — businesses only ever operate in one country",
      ],
      correctIndex: 1,
      modelAnswer:
        "The only differences the unit actually supports are purpose (profit-driven or not), scope (Organisation as the broader category containing 'business' as a subset), and the examples the lecture itself uses to illustrate each — the other options invent unsupported claims about size, age, location, or structure.",
    },
    {
      type: "mcq",
      prompt:
        "Part B1(a) asks how organisational structures affect communication across departments. Based on the functional structure's characteristics from Week 2, what is its typical effect?",
      options: [
        "It guarantees dual-channel communication because employees report to two managers",
        "It tends to limit communication across departments, because staff are grouped by specialism (e.g. IT, HR, Finance) and each department can become insulated, creating silos",
        "It has no documented effect on communication — only on decision speed",
        "It always maximises communication across departments because everyone reports to a single flat team",
      ],
      correctIndex: 1,
      modelAnswer:
        "Week 2's Functional structure slide lists 'limited communication across departments' and the risk it 'can create silos and reduce flexibility' as its cons — directly answering Part B1(a)'s prompt about communication impact.",
    },
    {
      type: "mcq",
      prompt:
        "Part B1(b) asks how organisational structure affects IT alignment with business goals. For a matrix structure, what is the key mechanism (and its risk) shaping this alignment?",
      options: [
        "IT alignment is irrelevant in a matrix structure because all decisions are made solely by the CEO",
        "Dual reporting lines (to both a functional manager and a project/product manager) can improve alignment by connecting IT work directly to business initiatives, but confusion over dual authority can undermine that alignment without strong coordination",
        "Matrix structures guarantee perfect alignment with no coordination effort required",
        "Matrix structures eliminate the need for IT alignment entirely, since every employee works independently",
      ],
      correctIndex: 1,
      modelAnswer:
        "Week 2's Matrix structure slide lists cross-functional teamwork and flexibility as pros, but 'dual authority can cause confusion' and it 'requires strong communication and coordination' as its listed con — that same coordination requirement is what determines whether the dual-reporting structure actually keeps IT work aligned with business goals.",
    },
    {
      type: "mcq",
      prompt:
        "Part B1(c) asks about the impact of organisational structure on decision-making in IT investments. What does a flat structure typically offer here, and what is its limitation?",
      options: [
        "Flat structures always produce the slowest IT investment decisions of any structure",
        "Fast, informal decision-making due to minimal middle management — but this speed advantage is harder to sustain once the Organisation and its IT investments need to scale",
        "Flat structures make IT investment decisions identical to a hierarchical structure's",
        "Flat structures require IT investment decisions to pass through the most layers of management",
      ],
      correctIndex: 1,
      modelAnswer:
        "Week 2's Flat structure slide lists fast decisions and innovation as pros (few or no levels of middle management), against the con that it is 'hard to scale' — so decision speed is the structure's strength, while scaling IT investment decisions as the Organisation grows is its limitation.",
    },
    {
      type: "mcq",
      prompt: "Contrasting Hierarchical with Flat for Part B1(c), which statement correctly distinguishes their effect on IT investment decision-making?",
      options: [
        "Both structures produce identical decision-making speed for IT investments",
        "Flat structures require more layers of sign-off than hierarchical structures",
        "Hierarchical structures make faster IT investment decisions than flat structures because there is only one decision-maker",
        "Hierarchical structures slow decision-making because approvals pass through multiple layers of authority, whereas flat structures allow faster, more autonomous decisions with fewer approval layers",
      ],
      correctIndex: 3,
      modelAnswer:
        "Week 2 lists 'slower decision-making' as a Hierarchical con (against pros of clear accountability and stability) and fast decisions as a Flat pro (against the con of being hard to scale) — the two structures sit at opposite ends of the same decision-speed trade-off.",
    },
    {
      type: "mcq",
      prompt:
        "Part B2 asks why it's important for IT professionals to understand an Organisation's business model and operating model. Which reason is most consistent with Week 2's 'Aligning IT and Business' framework?",
      options: [
        "Because the business model determines an IT professional's personal salary and has no other significance",
        "Because IT strategy and the IT operating model must be developed in alignment with business strategy and the business operating model — without that understanding, IT investments risk not supporting real business capabilities or value",
        "Understanding the business model is irrelevant to IT professionals — only staff working in finance need it",
        "Because IT professionals are contractually required to memorise the org chart before writing any code",
      ],
      correctIndex: 1,
      modelAnswer:
        "Week 2's diagram connects Business Strategy to IT Strategy, and Business Operating Model to IT Operating Model, via dashed lines representing required alignment, converging at Value stream orchestration — an IT professional who doesn't understand the business/operating model can't ensure their IT work actually feeds that alignment.",
    },
    {
      type: "mcq",
      prompt:
        "SmartCare Health Ltd operates under 'a divisional structure, with each state operating semi-independently,' while IT is centrally managed. Why is this a divisional structure rather than one of Week 2's four named structures (functional, matrix, flat, hierarchical)?",
      options: [
        "It is a flat structure because the case does not mention a CEO",
        "SmartCare is organised around semi-independent geographic units (states) each running largely on their own, rather than around specialised functions (functional), dual reporting lines (matrix), or a single dominant chain of authority (hierarchical) — a structural pattern the case describes that isn't one of Week 2's four named types",
        "It is a functional structure because each state has its own IT department",
        "It is a matrix structure because each state reports to two separate CEOs",
      ],
      correctIndex: 1,
      modelAnswer:
        "The case explicitly labels this a 'divisional structure' with each state semi-independent — that's organisation-by-geography, distinct from functional (organised by specialism), matrix (dual reporting per employee), or hierarchical (a single top-down chain), even though none of Week 2's four structures is literally 'divisional.'",
    },
    {
      type: "mcq",
      prompt: "What potential issue is most likely to arise from SmartCare's combination of centralised IT and semi-independent divisional (state-level) operations?",
      options: [
        "Centralised IT automatically resolves the CFO's cost-centre concerns",
        "Centrally standardised IT decisions may not fit each state's local operational needs, creating tension between central control and divisional autonomy — a different tension from a matrix structure's dual-reporting confusion, since here one central function (IT) sits over multiple semi-independent business units, not two managers over one person",
        "The issue is identical to the 'dual authority' risk of a matrix structure, since both involve two managers per employee",
        "There is no possible tension, since centralising any one function always perfectly satisfies every division's needs",
      ],
      correctIndex: 1,
      modelAnswer:
        "SmartCare's tension is structural, not a per-employee dual-reporting problem: one centrally managed function (IT) must serve multiple divisions that otherwise operate semi-independently, so IT decisions optimised centrally can clash with what any one state actually needs — a distinct issue from Matrix's dual-authority confusion.",
    },
    {
      type: "mcq",
      prompt: "How might aligning IT strategy with SmartCare's business goals create organisational value, per the concepts this unit has built since Week 2?",
      options: [
        "Alignment creates value automatically, regardless of whether goals or KPIs are ever defined",
        "IT strategy has no relationship to organisational value — only marketing strategy does",
        "Aligning IT strategy with business goals mainly matters for regulatory compliance, not value creation",
        "By connecting IT investment (e.g. AI diagnostics, cloud infrastructure) to a defined business goal through value stream orchestration, so the investment translates into measurable stakeholder benefits (e.g. better patient outcomes, efficiency) rather than existing as an isolated cost",
      ],
      correctIndex: 3,
      modelAnswer:
        "Week 2 defines value stream orchestration as coordinating business and IT to deliver continuous value by synchronising people, processes, and technology — applied to SmartCare, that means the AI diagnostics/cloud investment only becomes organisational value once it's deliberately connected to a stated business goal, not simply purchased.",
    },
    {
      type: "mcq",
      prompt:
        "The case asks students to suggest one way SmartCare could measure the value of its AI diagnostics IT investment. Which suggestion best reflects the unit's 'best practices for IT investments' guidance (measurable outcomes tracked with KPIs)?",
      options: [
        "Track a specific outcome-linked KPI, such as reduction in diagnostic wait time or improvement in diagnostic accuracy rate, against a baseline measured before the AI system was introduced",
        "Count the number of lines of code written for the AI diagnostics feature",
        "There is no way to measure the value of an IT investment like this",
        "Measure success purely by how much the CFO personally likes the new system",
      ],
      correctIndex: 0,
      modelAnswer:
        "Week 2's 'Best practices for IT investments' guidance is to set measurable outcomes and use KPIs to track ROI rather than proceeding without evidence — for AI diagnostics, an outcome-linked KPI such as diagnostic wait time or accuracy improvement is a direct application of that guidance, unlike an output metric like lines of code.",
    },
    {
      type: "mcq",
      prompt:
        "The CFO calls IT 'a cost centre with unclear returns,' while the CEO wants to align IT more strategically. Which concept from this unit best explains what the CFO's framing is missing?",
      options: [
        "The CEO's view is irrelevant since only the CFO's opinion determines IT budget outcomes",
        "Without measurable, agreed-upon KPIs tied to specific business goals, an IT investment's organisational value stays invisible to stakeholders like the CFO — the fix is applying the 'best practices for IT investments' guidance (measurable outcomes, cost-benefit/value-risk ranking) to make the returns visible",
        "The CFO is factually correct and there is nothing IT can do to demonstrate value",
        "This disagreement has no connection to any concept covered in the unit",
      ],
      correctIndex: 1,
      modelAnswer:
        "The CFO's 'unclear returns' framing is exactly the gap Week 2's best-practices guidance addresses: value only becomes visible to stakeholders once it is expressed as measurable, tracked outcomes — the disagreement isn't unresolvable, it's a symptom of IT investment value not yet being made measurable.",
    },
    {
      type: "mcq",
      prompt: "A classmate argues SmartCare's structure 'is basically a matrix structure because IT and the states both have authority.' What is the strongest reason this is incorrect?",
      options: [
        "It is incorrect because SmartCare has too few employees to have any structure at all",
        "A matrix structure is defined by individual employees reporting to two managers (typically one functional, one project); SmartCare instead has one function (IT) centralised across otherwise semi-independent geographic divisions — a different pattern (divisional, with centralised IT) than dual-reporting individuals",
        "It is incorrect only because SmartCare is a healthcare company, and matrix structures are illegal in healthcare",
        "It is actually correct — divisional and matrix structures are identical concepts under different names",
      ],
      correctIndex: 1,
      modelAnswer:
        "Matrix structure specifically means an individual employee reports to two managers (e.g. functional and project); SmartCare's tension is instead between one centralised function and multiple semi-independent geographic divisions — a structural pattern, not a per-employee dual-reporting one, so the two are not the same thing despite both involving 'two sources of authority' in a loose sense.",
    },
    {
      type: "mcq",
      prompt:
        "Which pairing correctly matches an organisational structure to the specific impact Week 2 associates with it, as raised by the tutorial's Part B1 discussion prompts?",
      options: [
        "Functional → the fastest IT investment decisions of any structure; Matrix → no communication at all; Hierarchical → the highest risk of silos",
        "Functional → risk of siloed communication across departments; Matrix → dual-authority confusion affecting IT alignment; Hierarchical → slower IT investment decision-making due to layered approval",
        "All four structures have identical effects on communication, alignment, and decision-making",
        "Flat → the slowest decision-making of all four structures; Hierarchical → the fastest decision-making of all four structures",
      ],
      correctIndex: 1,
      modelAnswer:
        "Each structure's listed con maps directly onto one of Part B1's three prompts: Functional's silos affect (a) communication, Matrix's dual-authority confusion affects (b) IT alignment, and Hierarchical's slower approvals affect (c) IT investment decision-making — the distractors invert or flatten these documented differences.",
    },
    {
      type: "mcq",
      prompt:
        "Drawing on the unit's IT-professional framing (challenging unclear requirements/assumptions rather than simply executing tasks), what would the most professionally sound IT-side response to the CFO's 'cost centre' framing look like?",
      options: [
        "Agree with the CFO immediately regardless of whether the reasoning holds up, since finance always overrides IT",
        "Escalate to a regulator, since this is a compliance matter rather than a value-alignment matter",
        "Avoid the conversation entirely and let the CEO resolve it without any IT input",
        "Proactively propose measurable KPIs and a cost-benefit case for the AI diagnostics investment, addressing the CFO's concern with evidence rather than either dismissing it or silently accepting the 'cost centre' label",
      ],
      correctIndex: 3,
      modelAnswer:
        "The professional response combines two things this unit has built up: an IT professional exercises judgement rather than just executing tasks, and Week 2's best-practices guidance says to make IT investment value visible through measurable KPIs — together, that means proactively building the evidence-based case rather than staying silent or capitulating.",
    },
    {
      type: "mcq",
      prompt:
        "Suppose SmartCare's CEO decides to keep IT centralised but appoint a dedicated 'divisional IT liaison' in each state to coordinate the AI diagnostics rollout with local clinical teams. Which two concepts from this unit does this response most directly combine?",
      options: [
        "Nothing from the unit — liaison roles are unrelated to any concept covered",
        "Only marketing strategy and legal compliance, with no connection to organisational structure or IT investment",
        "Structural coordination (mitigating the central-IT/divisional-autonomy tension) with IT-business alignment (ensuring the AI diagnostics investment is adopted in a way that produces real, locally-relevant organisational value)",
        "Only the definition of 'business' versus 'Organisation,' with no relevance to structure or value",
      ],
      correctIndex: 2,
      modelAnswer:
        "A divisional IT liaison directly targets the structural tension identified earlier (centralised IT vs divisional autonomy) while also serving the IT-business alignment goal (making sure a centrally-designed investment actually lands as value in each division) — a concrete example of combining two ideas rather than treating them separately.",
    },
    {
      type: "mcq",
      prompt: "If SmartCare later reports that AI diagnostics reduced average diagnosis time by 20% and improved patient satisfaction scores, which concept does this outcome best exemplify?",
      options: [
        "An IT investment that, by definition, cannot count as organisational value because it is technology-related",
        "Professionalism, since organisational value only concerns individual conduct, not measurable outcomes",
        "A business objective with no connection to organisational value",
        "Organisational value — a meaningful, measurable outcome the IT investment created for stakeholders (patients), rather than the investment simply existing as a technical asset",
      ],
      correctIndex: 3,
      modelAnswer:
        "Organisational value answers 'how does the Organisation create meaningful outcomes for its stakeholders?' — a 20% reduction in diagnosis time and improved patient satisfaction are exactly that: measurable stakeholder benefit created by the IT investment, not merely the investment's technical existence.",
    },
    {
      type: "mcq",
      prompt:
        "Per Week 2's definitions (revisited in this tutorial's Part A), which pairing of examples is correctly matched to 'Organisation' (broad, not necessarily profit-driven) versus 'Business' (the profit-driven subset)?",
      options: [
        "Organisation and Business are mutually exclusive sets with no overlap at all",
        "Organisation: Apple, Canva; Business: the Red Cross, a university",
        "Both categories only ever refer to for-profit companies",
        "Organisation: NSW Health, a university, the Red Cross; Business: Apple, Canva, a local café",
      ],
      correctIndex: 3,
      modelAnswer:
        "These are the exact examples Week 2 uses: non-business Organisations like NSW Health, University of Sydney, and Red Cross illustrate that an Organisation's purpose isn't always profit-driven, while Canva and Apple illustrate the profit-driven Business subset — note Business is a subset of Organisation, not a disjoint category, so 'mutually exclusive' is also wrong.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 3,
  paperNumber: 2,
  title: "Week 3 Lecture Practice Paper",
  topics:
    "Project management essentials (project definition, stakeholder perspectives, power in a project, success criteria, why projects fail, the hidden-root-cause table, the PM's ethical dilemma, Sydney Metro Upgrade case); PM methodologies (Waterfall, Agile, DevOps — benefits, disadvantages, when to use, NASA/Spotify/Amazon examples, the Agile Manifesto, methodology as organisational culture); the continuous IT lifecycle (business/IT silos, linear vs continuous, factors driving the shift, the Plan/Design-Build-Test/Deploy/Monitor cycle, success metrics, common pitfalls); Enterprise Architecture (Zachman Framework, TOGAF/ADM, EA and the continuous IT lifecycle, benefits of EA, the University Student Portal and digital-transformation examples); IT Technician vs IT Professional; Reading 1 — Waterfall vs Agile vs DevOps (MoSCoW rule, Scrum vs Kanban, adoption/success statistics); Reading 2 — Silo Mentality (Sony, MySpace, Volkswagen, pets.com, Apple examples); the HealthLink Systems case study",
  sourceFiles: [
    "lecture/INFO5990 2026-S2 Week 03 - IT Lifecycle and PM essentials.pdf",
    "lecture/Reading 1 - Waterfall vs Agile vs DevOps.pdf",
    "lecture/Reading 2 - Silo Mentality - What Are Organizational Silos and Their Impact.pdf",
  ],
  questions: [
    {
      type: "mcq",
      prompt: "Per the 'All about a Project' slide, a project's outcome is described as 'unique.' What does the lecture actually mean by this, as distinct from a common misreading?",
      options: [
        "No two projects can ever use the same methodology or process",
        "A project can never reuse any process from a previous project",
        "The outcome is not routine, even though the processes used to produce it can be repeatable — 'unique' describes the outcome, not the process",
        "Uniqueness means a project must have no defined start or end date",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide's exact wording is: 'Unique - Outcome is not routine, even if processes are repeatable.' It is specifically the outcome that is unique; the processes producing it (e.g. a standard methodology) can still be reused across projects — the misreading is assuming uniqueness applies to process rather than outcome.",
    },
    {
      type: "mcq",
      prompt: "Per the 'Who Has Power in a Project?' slide, which pairing of a project stakeholder to their source of influence is correct?",
      options: [
        "Regulators influence timelines; Users influence scope; Sponsors set rules and laws",
        "Only the Project Manager holds any influence over a project — all other roles are purely advisory",
        "Budget holders influence adoption; Sponsors influence feasibility; Technical leads influence scope; Users set rules and laws",
        "Budget holders influence scope; Sponsors influence timelines; Technical leads influence feasibility; Users influence adoption; Regulators set rules and laws the project must follow",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide lists exactly this mapping: budget holders → scope, sponsors → timelines, technical leads → feasibility, users → adoption, and regulators → the rules and laws the project must follow — each stakeholder's influence is tied to a different lever, not interchangeable.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Success criteria for Project Completion' slide lists five criteria. A project delivers every required feature to specification and passes all quality checks, but six months later usage data shows almost no cost savings or efficiency gain. Which criterion has it failed to meet?",
      options: [
        "Stakeholder Satisfaction, which the slide defines identically to Business Value",
        "On-Time Delivery, since meeting scope and quality automatically implies meeting the schedule",
        "Business Value — delivering measurable benefits such as cost savings, efficiency gains, or competitive advantage — which is distinct from 'Meets Scope & Quality' (delivering required features to an acceptable standard)",
        "Meets Scope & Quality, since business value and scope/quality are the same criterion under two names",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide separately lists 'Meets Scope & Quality' (delivering required features with acceptable quality) and 'Business Value' (delivering measurable benefits such as cost savings, efficiency gains, or competitive advantage) as two of five distinct criteria — a project can satisfy the first while failing the second, which is exactly this scenario.",
    },
    {
      type: "mcq",
      prompt:
        "Per 'Why do Projects fail?', a project has crystal-clear, stable requirements and a realistic budget, but still fails because the team never anticipated a critical third-party API being deprecated mid-project. Which listed failure reason does this best match?",
      options: [
        "Unrealistic Timelines or Budgets, since the API deprecation must have been a budgeting error",
        "Poor Scope Definition, since any unforeseen problem counts as a scope issue",
        "Inadequate Risk Management — failing to anticipate and mitigate issues — which is distinct from Poor Scope Definition (unclear requirements, frequent changes)",
        "Resource Issues, since API deprecations are always caused by a lack of skilled staff",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide separates 'Poor Scope Definition' (unclear requirements, frequent changes) from 'Inadequate Risk Management' (failing to anticipate and mitigate issues) — a scenario with clear, stable requirements but an unanticipated external risk event is squarely a risk-management failure, not a scope-definition one.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Hidden Root Cause: Professional Breakdown' table pairs technical symptoms with the professional failure behind them. Which pairing is correct, and how does it echo the theme (from earlier in this unit) that professional practice, not technology alone, usually decides project outcomes?",
      options: [
        "'Late defect discovery' pairs with 'Unrealistic executive pressure', and this table has no connection to any earlier week's material",
        "'Late defect discovery' pairs with 'Communication gaps' — reinforcing the same theme raised by this unit's Week 1 case studies (ASX, Victorian Government, Optus), that technical symptoms usually trace back to professional/organisational failures rather than the technology itself",
        "'Scope creep' pairs with 'Communication gaps', and 'Budget overrun' pairs with 'Weak boundary management'",
        "The table shows technical symptoms have no professional-failure counterpart — they are purely technical issues",
      ],
      correctIndex: 1,
      modelAnswer:
        "The table's actual pairings are: Scope creep → Weak boundary management, Budget overrun → Unrealistic executive pressure, User rejection → Poor stakeholder engagement, and Late defect discovery → Communication gaps. This directly echoes the lesson from this unit's earlier case studies — that the deciding factor in project outcomes is usually how decisions were made and communicated, not the underlying technology.",
    },
    {
      type: "mcq",
      prompt: "Per 'The Project Manager's Ethical Dilemma' slide, the PM stands between five competing pressures. What is the slide's stated resolution to this dilemma?",
      options: [
        "A professional PM should always prioritise executive expectations over every other pressure",
        "A professional PM must balance delivery with integrity",
        "The dilemma has no resolution — PMs should simply pick whichever pressure is loudest",
        "A professional PM should resolve the dilemma by ignoring organisational politics entirely",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide lists the five pressures (executive expectations, budget realities, user needs, technical constraints, organisational politics) and states in bold: 'A professional PM must balance delivery with integrity' — the resolution is balance, not picking a single pressure to prioritise.",
    },
    {
      type: "mcq",
      prompt: "In the Sydney Metro Upgrade example, which of the following was listed as a Challenge rather than a Success Factor or an Outcome?",
      options: [
        "Reduced train scheduling time by 35%",
        "Continuous stakeholder engagement",
        "Budget pressure due to global supply chain disruptions",
        "Phased delivery using Agile sprints",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide's three columns are: Success Factors (clear requirements from operators, phased delivery using Agile sprints, continuous stakeholder engagement), Challenges (initial delays due to hardware integration issues, budget pressure due to global supply chain disruptions), and Outcome (fully operational in 2023, 35% reduced train scheduling time, improved commuter satisfaction) — only budget pressure from supply chain disruptions is a Challenge.",
    },
    {
      type: "mcq",
      prompt: "The lecture's NASA Space Shuttle Software Development example explains why Waterfall was chosen. What was the trade-off in its outcome?",
      options: [
        "It achieved extremely high reliability (reportedly 0 defects per 420,000 lines of code in some modules) but took years to complete and had enormous costs due to the sequential, documentation-heavy process",
        "It was fast and cheap to deliver, but reliability suffered because Waterfall skips testing",
        "It achieved high reliability with no additional cost or time compared to Agile alternatives",
        "It failed outright because Waterfall cannot be used for safety-critical software",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide states Waterfall was chosen because requirements were extremely well-defined and unlikely to change, and safety-critical systems required extensive documentation and rigorous testing per DO-178B compliance — but the reported outcome trade-off was extremely high reliability at the cost of years of time and enormous expense from the sequential, documentation-heavy process.",
    },
    {
      type: "mcq",
      prompt: "Which of the following is an accurate principle from 'The Agile Manifesto' slide shown in the lecture?",
      options: [
        "The most efficient way to convey information is through detailed written specifications, not face-to-face conversation",
        "Documentation is the primary measure of progress",
        "Working software is the primary measure of progress",
        "Requirements should be frozen as early as possible and never revisited",
      ],
      correctIndex: 2,
      modelAnswer:
        "The Manifesto slide lists 'Working software is the primary measure of progress' as principle 7. It also states the opposite of the other options: it welcomes changing requirements even late in development, and says the most efficient method of conveying information is face-to-face conversation, not documentation.",
    },
    {
      type: "mcq",
      prompt: "Per the DevOps Approach – Example slide, what outcome does Amazon's DevOps-driven deployment model reportedly achieve?",
      options: [
        "Amazon avoids automation entirely in favour of manual deployment reviews",
        "Amazon deploys changes once per quarter to minimise risk, consistent with a Waterfall release cadence",
        "Amazon reportedly deploys changes every 11.7 seconds on average, enabling rapid innovation, personalised shopping experiences, and quick bug fixes without major downtime",
        "Amazon's deployment frequency is not mentioned in the lecture",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide states Amazon 'reportedly deploys changes every 11.7 seconds on average,' which the lecture attributes to needing to keep up with market demand and competition faster than traditional long release cycles allowed.",
    },
    {
      type: "mcq",
      prompt: "Per 'Methodologies Reflect Organisational Culture,' which pairing of a methodology to its associated culture trait is correct?",
      options: [
        "Waterfall → command-and-control culture with heavy documentation and clear hierarchy; Agile → collaborative culture requiring trust and psychological safety; DevOps → shared responsibility that breaks silos and requires a mature organisational culture",
        "DevOps → command-and-control culture with heavy documentation; Waterfall → collaborative culture requiring psychological safety",
        "Waterfall → shared responsibility that breaks silos; Agile → command-and-control culture; DevOps → requires minimal organisational maturity",
        "All three methodologies require an identical organisational culture to succeed",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide lists these traits under each methodology exactly as in option 1, and concludes: 'Methodology choice is a cultural decision, not just a technical one' — meaning the methodologies are not culturally interchangeable.",
    },
    {
      type: "mcq",
      prompt: "Per 'Business and IT Silos,' which pairing of a traditional team to its typical focus is correct?",
      options: [
        "Development teams focused on regulatory compliance; Operations teams focused on customer-facing UX",
        "Both teams focused exclusively on cost, with no distinction between them",
        "Development teams focused on functionality, features, and non-functional requirements; Operations teams focused on cost, reliability, security, risk, and manageability",
        "Development teams focused on cost and reliability; Operations teams focused on functionality and features",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide states development teams focused on functionality, features, and non-functional requirements, while operations teams focused on cost, reliability, security, risk, and manageability — this traditional split is exactly the silo the shift toward continuous IT lifecycles and DevOps was meant to break down.",
    },
    {
      type: "mcq",
      prompt: "Per 'Factors driving this shift' (from linear to continuous), which factor specifically refers to using continuous monitoring to inform priorities, as distinct from the other listed factors?",
      options: [
        "Customer Expectations",
        "Data-Driven Decisions",
        "Digital Transformation",
        "Cloud & Automation",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide's five factors are Digital Transformation (keeping pace with competitors), Customer Expectations (quick updates/fixes), Cloud & Automation (faster, safer deployments), Agile & DevOps Practices (collaboration and speed), and Data-Driven Decisions (continuous monitoring informs priorities) — only the last is specifically about monitoring feeding into prioritisation.",
    },
    {
      type: "mcq",
      prompt: "Per 'What is continuous IT Lifecycle,' which sequence and key concept correctly describes it?",
      options: [
        "The continuous IT lifecycle has no defined stages — it is purely a metaphor with no structure",
        "Design/Build/Test → Plan → Monitor → Deploy, with no further cycling after Monitor",
        "Plan → Deploy → Design/Build/Test → Monitor, a one-way flow that ends after deployment",
        "Plan → Design/Build/Test → Deploy/Troubleshoot → Monitor, cycling continuously — because instead of ending after deployment, IT work continues with monitoring, feedback, and updates",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide's diagram cycles Plan → Design/Build/Test → Deploy/Troubleshoot → Monitor and back to Plan, with the key concept stated explicitly: 'Instead of ending after deployment, IT work continues with monitoring, feedback, and updates,' enabling faster innovation and responsiveness.",
    },
    {
      type: "mcq",
      prompt:
        "A university deploys updates to its student portal every 2 weeks. Per 'Metrics for Continuous IT Lifecycle Success,' which metric does this example illustrate, and how does it differ from Deployment Success Rate?",
      options: [
        "Release Frequency — how often new features, fixes, or updates are deployed — which measures how often releases happen, whereas Deployment Success Rate measures what percentage of those releases go live without rollback or issues",
        "Deployment Success Rate — the same metric as Release Frequency, just described differently",
        "Customer Satisfaction (CSAT/NPS) — since deployment cadence is a survey-based metric",
        "Mean Time to Repair (MTTR) — since deploying every 2 weeks measures how fast incidents are resolved",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide's own example for Release Frequency is 'Deploying updates every 2 weeks to add new features in a university student portal' — distinct from Deployment Success Rate, whose example is '98% success rate for cloud service deployments without downtime' (what fraction of deployments succeed), not how often they happen.",
    },
    {
      type: "mcq",
      prompt: "Per 'Enterprise Architecture Frameworks,' what fundamentally distinguishes the Zachman Framework from TOGAF?",
      options: [
        "Zachman and TOGAF are two names for the exact same methodology published by different organisations",
        "Zachman is used only for database design, while TOGAF is used only for network architecture",
        "Zachman is a classification framework organising EA by stakeholder perspectives and six key questions (What, How, Where, Who, When, Why); TOGAF is a methodology and framework using the Architecture Development Method (ADM) to design, plan, implement, and govern EA",
        "TOGAF is a classification framework of six questions, while Zachman uses the Architecture Development Method (ADM)",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide states Zachman is 'a classification framework that organizes enterprise architecture using different stakeholder perspectives and key questions (What, How, Where, Who, When, Why)', while TOGAF is 'a methodology and framework for designing, planning, implementing, and governing enterprise architecture' using the ADM — a classification scheme versus a step-by-step governance methodology.",
    },
    {
      type: "mcq",
      prompt:
        "In the TOGAF digital-transformation example (university unifying enrolment, LMS, and payments), which EA component correctly matches 'Integration of LMS (Canvas), CRM (Salesforce), and payment gateway through APIs'?",
      options: [
        "Business Architecture",
        "Data Architecture",
        "Technology Architecture",
        "Application Architecture",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide lists API integration of Canvas/Salesforce/payment gateway under Application Architecture, distinct from Data Architecture (the centralised student database with real-time updates), Technology Architecture (cloud infrastructure and SSO), and Business Architecture (streamlined enrolment workflows aligning course registration, fee payment, and academic records).",
    },
    {
      type: "mcq",
      prompt: "Per the 'IT Technician vs IT Professional' table, which correctly distinguishes the two, and how does this connect to material from earlier in the unit?",
      options: [
        "There is no meaningful distinction — the table lists the same behaviours twice under different labels",
        "A Technician solves organisational problems, while a Professional only solves bugs",
        "A Technician exercises judgement, while a Professional only executes tasks",
        "A Technician follows requirements and focuses on output, while a Professional challenges unclear requirements and focuses on impact — echoing this unit's earlier framing (Weeks 1–2) that professional judgement, not just technical competence, is what separates a technician from a professional",
      ],
      correctIndex: 3,
      modelAnswer:
        "The table pairs 'Executes tasks / Exercises judgement', 'Follows requirements / Challenges unclear requirements', 'Focuses on output / Focuses on impact', 'Solves bugs / Solves organisational problems', and 'Thinks technically / Thinks strategically & ethically' — the same theme this unit has built since Week 1–2, that professional practice is judgement and accountability beyond technical execution.",
    },
    {
      type: "mcq",
      prompt: "Per Reading 1's description of Scrum versus Kanban, which statement correctly distinguishes them?",
      options: [
        "Both Scrum and Kanban originated in the same country and use identical board layouts",
        "Kanban is conducted by a certified scrum master; Scrum uses a visual board with columns for completed/in-progress/requested work",
        "Scrum is conducted by a certified scrum master, is heavily dependent on constant feedback, and suits small teams; Kanban, first implemented in Japan for manufacturing communication, visually tracks work on a board with columns for completed/in-progress/requested work",
        "Scrum has no relationship to feedback, while Kanban is defined entirely by daily stand-up meetings",
      ],
      correctIndex: 2,
      modelAnswer:
        "The reading describes Scrum meetings as conducted by a certified scrum master and heavily dependent on constant feedback, better suited to small teams; Kanban, by contrast, was first implemented in Japan to communicate manufacturing methods and involves overseeing work visually via a board with rows for sprint objectives and columns for completed/in-progress/requested work.",
    },
    {
      type: "mcq",
      prompt: "Per Reading 1's cited statistics, which pairing of success rates is correct?",
      options: [
        "64% of Agile projects are considered successful, versus 49% of Waterfall projects; separately, 42% of Agile projects succeed without significant challenges, versus only 14% of Waterfall projects",
        "49% of Agile projects are considered successful, versus 64% of Waterfall projects",
        "14% of Agile projects succeed without significant challenges, versus 42% of Waterfall projects",
        "Agile and Waterfall have identical success rates according to the reading",
      ],
      correctIndex: 0,
      modelAnswer:
        "The reading cites two separate figures in Agile's favour: an overall success rate of 64% for Agile versus 49% for Waterfall (per the Project Management Statistics report), and separately, 42% of Agile projects achieving success without encountering significant challenges versus only 14% of Waterfall projects.",
    },
    {
      type: "mcq",
      prompt:
        "Reading 2 describes Sony showing two incompatible digital Walkman devices at the 1999 Expo of Technology, shortly before Apple's iPod overtook it. Which drawback of organisational silos does this example illustrate?",
      options: [
        "Employee disenfranchisement and poor culture — the same drawback illustrated by the Volkswagen example",
        "Duplication of effort and diminished innovation — because Sony's departments, disconnected from company goals, each built a competing digital Walkman without coordinating, producing two incompatible devices",
        "Lack of team alignment and overall organisational alignment — the same drawback illustrated by the MySpace example",
        "Lack of cross-team collaboration and communication — the same drawback illustrated by the pets.com example",
      ],
      correctIndex: 1,
      modelAnswer:
        "The reading presents Sony specifically under 'Duplication in effort and diminished innovation': Sony's departments were disconnected from the company's goals and pursued their own goals separately, resulting in two different, incompatible digital Walkman-type devices — a distinct drawback from the MySpace (alignment), Volkswagen (culture), and pets.com (cross-team collaboration) examples used for the reading's other drawbacks.",
    },
    {
      type: "mcq",
      prompt: "Reading 2 describes Volkswagen employees being stuck in a 'chimney career.' What does this term mean, and which drawback of silos does it illustrate?",
      options: [
        "A hiring practice specific to engineering roles only — illustrating 'Lack of cross-team collaboration'",
        "A career path where employees could only advance within their own silo, never move across departments — illustrating 'Employee disenfranchisement/poor culture,' since this made employees afraid to speak up or challenge decisions (relevant to the emissions-cheating scandal)",
        "A career path where employees are promoted rapidly across every department — illustrating 'Duplication of effort'",
        "A term describing Volkswagen's factory floor layout, unrelated to organisational silos",
      ],
      correctIndex: 1,
      modelAnswer:
        "The reading explains that a 'chimney career' meant employees could only progress upward within their own silo, not move across departments, which 'meant that people were afraid to communicate new ideas or even to speak up to a manager' — presented as a root cause behind the Volkswagen clean diesel scandal, under the 'Employee disenfranchisement/poor culture' drawback.",
    },
    {
      type: "mcq",
      prompt: "According to Reading 2's 'Can Organizational Silos Ever Be a Good Thing?' section, what is the article's actual position?",
      options: [
        "The article takes no position on whether silos can ever be beneficial",
        "Yes — having a group of experts to consult within the same area is beneficial; the real problem is not silos themselves, but the silo mentality of the people within them",
        "No — silos are always harmful and there is no scenario in which they benefit a company",
        "Silos are beneficial only for demographic reasons, such as employees' age, and never for expertise reasons",
      ],
      correctIndex: 1,
      modelAnswer:
        "The article states 'Yes. silos in the workplace can be beneficial to your company... the real problem isn't the silos. The problem is the people within the silos and their silo mentality' — silos as a grouping of expertise are not inherently bad; it's the mentality of protecting one's own department over company goals that causes harm.",
    },
    {
      type: "mcq",
      prompt: "Per the HealthLink Systems case study, which three issues did HealthLink face before shifting to a Continuous IT Lifecycle?",
      options: [
        "An inability to hire staff, and a complete absence of any IT department",
        "Frequent delays in software updates due to siloed business and IT teams, and customer dissatisfaction with long wait times for both bug fixes and feature updates",
        "Overuse of Agile ceremonies with no other listed issues",
        "Excessive automation without any testing, and a lack of any organisational structure",
      ],
      correctIndex: 1,
      modelAnswer:
        "The case's Background states HealthLink 'faced frequent delays in software updates due to siloed business and IT teams' and that 'customer feedback indicated dissatisfaction with long wait times for bug fixes and feature updates' — a structural (silos) issue and its downstream customer-facing consequence.",
    },
    {
      type: "mcq",
      prompt:
        "Would Agile alone have solved HealthLink's problems, or was DevOps also necessary? Reasoning from the lecture's own definitions, which answer is best supported?",
      options: [
        "DevOps was also necessary — HealthLink's root problem was siloed business and IT teams, and while Agile improves iterative delivery and stakeholder feedback, it doesn't inherently unify development and operations the way DevOps specifically does by combining Dev and Ops for continuous integration, delivery, and monitoring",
        "Agile alone was clearly sufficient, since Agile and DevOps are defined identically in the lecture",
        "Waterfall alone would have solved HealthLink's problems faster than either Agile or DevOps",
        "Neither Agile nor DevOps could have addressed HealthLink's problems, since both methodologies ignore stakeholder communication entirely",
      ],
      correctIndex: 0,
      modelAnswer:
        "HealthLink's stated root problem is siloed business and IT teams — the lecture defines DevOps specifically as combining development and operations for continuous integration/delivery/monitoring, directly targeting that silo, whereas Agile's definition (iterative delivery in sprints, stakeholder feedback) doesn't itself guarantee dev/ops unification, so DevOps (alongside TOGAF-based EA, per the case) was the more directly applicable fix.",
    },
    {
      type: "mcq",
      prompt:
        "Week 2 lists 'can create silos and reduce flexibility' as a Functional structure con. How does that connect to this week's 'Business and IT Silos' content and Reading 2?",
      options: [
        "They describe the same underlying phenomenon from different angles: Week 2 identifies organisational structure (grouping by specialised function) as one structural cause of silos, while this week's lecture and Reading 2 explain the resulting Dev/Ops split and the silo mentality that sustains it, plus its real-world consequences (e.g. Sony, Volkswagen)",
        "This week's silo content replaces Week 2's structural analysis entirely, since Week 2's structures no longer apply once a company adopts DevOps",
        "Week 2 concluded that silos are always beneficial, contradicting this week's material which says they are always harmful",
        "They are unrelated — Week 2's structures apply only to non-IT departments, while this week's silo content applies only to IT",
      ],
      correctIndex: 0,
      modelAnswer:
        "Week 2's Functional structure con ('creates silos') identifies a structural root cause; this week connects it forward — 'Business and IT Silos' describes the resulting Dev/Ops split by focus area, and Reading 2 explains the silo mentality that sustains such divides plus concrete organisational consequences (Sony's duplicated Walkman/iPod effort, Volkswagen's chimney careers) — one continuous thread across the two weeks, not two unrelated topics.",
    },
  ],
};

export const WEEK_3_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
