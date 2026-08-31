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
        "Every Organisation is by definition also a business, but not every business qualifies as an Organisation — a business additionally needs a formal management structure, paid staff, and documented operating procedures",
        "An Organisation always refers specifically to a formally registered for-profit entity with shareholders and a board, while a business can be either for-profit or a non-profit style structure",
        "The two terms are fully interchangeable and can be used without any distinction whatsoever in a professional or academic context, since both describe any structured group working toward a shared aim",
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
        "Simply holding a university degree in a technical field, regardless of whether that knowledge is ever applied responsibly in practice",
        "The conduct, judgement, and attitudes expected within a profession — competence, integrity, accountability, ethics, and continuous development",
        "Following instructions exactly as given, without ever exercising independent judgement about whether those instructions are actually appropriate",
        "How formally a person dresses at work, and whether they arrive on time to scheduled meetings",
      ],
      correctIndex: 1,
      modelAnswer:
        "Professionalism is the conduct, judgement, and attitudes expected within a profession — competence, integrity, accountability, ethics, and continuous development — as distinguished from the related but narrower concepts of Knowledge, Skill, and Expertise that this unit's Week 2 tutorial concept review also covers.",
    },
    {
      type: "mcq",
      prompt: "Part A asks students to define 'Organizational value.' Which definition matches how this unit defines the term?",
      options: [
        "The market price of an Organisation's publicly traded shares on a given trading day, as reported on the stock exchange at market close",
        "The total revenue a company reports in its annual financial statements, before any operating costs, taxes, or other deductions are applied",
        "Any personal benefit an individual employee receives from their own job, such as salary, bonuses, or workplace perks and entitlements",
        "Value created, delivered, and sustained by an Organisation for its stakeholders — answering 'how does the Organisation create meaningful outcomes for its stakeholders?'",
      ],
      correctIndex: 3,
      modelAnswer:
        "Week 2's 'Value and Organisational value' slide distinguishes plain Value (answering 'how does this benefit me or others?') from Organisational value specifically: value created, delivered, and sustained by an Organisation for its stakeholders (customers, employees, shareholders, society) — the definition the tutorial's Part A revisits.",
    },
    {
      type: "mcq",
      prompt: "Part A also asks students to define 'IT investment.' Which definition is correct?",
      options: [
        "Only resources that are permanently owned and managed in-house by the IT department; any outsourced or externally contracted arrangement doesn't qualify as an investment",
        "The allocation of financial, human, and technological resources into IT systems, tools, or services to support organisational goals — resources that can be insourced or outsourced",
        "Any expense the IT department incurs on its day-to-day operations, regardless of whether that spending supports a specific strategic purpose or measurable goal",
        "Money spent exclusively on purchasing new laptops and desktop computers for staff, unrelated to software, cloud services, or process improvements",
      ],
      correctIndex: 1,
      modelAnswer:
        "Per Week 2, an IT investment is the allocation of financial, human, and technological resources into IT systems, tools, or services to support or improve an Organisation's operations, performance, or strategic goals — these resources can be insourced (internally owned) or outsourced (externally sourced), which rules out the option that restricts it to in-house ownership.",
    },
    {
      type: "mcq",
      prompt:
        "Part A question 2 asks for three key differences between a business and an Organisation. Which set of three is accurate and consistent with Week 2's definitions?",
      options: [
        "(1) Size — businesses are always larger in employee headcount and revenue than Organisations of any kind; (2) Age — Organisations are always founded decades earlier and are therefore older than businesses; (3) Location — businesses only ever operate within a single country and never expand internationally",
        "(1) Businesses always maintain a dedicated in-house IT department while Organisations of any other kind never do; (2) Organisations never have any defined hierarchy, chain of command, or reporting structure whatsoever; (3) Businesses cannot ever be organised functionally by specialised department",
        "There are no real differences at all between the two terms — the tutorial question is simply testing whether students notice that 'Organisation' and 'business' are synonyms used interchangeably throughout every reading and lecture in this unit",
        "(1) Purpose — a business exists primarily to profit, while an Organisation's purpose need not be profit-driven; (2) Scope — 'Organisation' is the broader category and 'business' a subset of it; (3) Examples — businesses include firms like Canva or Apple, while non-business Organisations include the Red Cross, NSW Health, or a university",
      ],
      correctIndex: 3,
      modelAnswer:
        "The only differences the unit actually supports are purpose (profit-driven or not), scope (Organisation as the broader category containing 'business' as a subset), and the examples the lecture itself uses to illustrate each — the other options invent unsupported claims about size, age, location, or structure.",
    },
    {
      type: "mcq",
      prompt:
        "Part B1(a) asks how organisational structures affect communication across departments. Based on the functional structure's characteristics from Week 2, what is its typical effect?",
      options: [
        "It has no documented effect on communication at all — the slide says it only affects decision speed, not cross-department information flow",
        "It always maximises communication across departments because everyone effectively reports into a single flat team with no specialism boundaries",
        "It tends to limit communication across departments, because staff are grouped by specialism (e.g. IT, HR, Finance) and each department can become insulated, creating silos",
        "It guarantees dual-channel communication across every department because employees simultaneously report to two separate managers",
      ],
      correctIndex: 2,
      modelAnswer:
        "Week 2's Functional structure slide lists 'limited communication across departments' and the risk it 'can create silos and reduce flexibility' as its cons — directly answering Part B1(a)'s prompt about communication impact.",
    },
    {
      type: "mcq",
      prompt:
        "Part B1(b) asks how organisational structure affects IT alignment with business goals. For a matrix structure, what is the key mechanism (and its risk) shaping this alignment?",
      options: [
        "IT alignment is irrelevant in a matrix structure because every single decision, including all IT investment priorities and project timelines, is made solely and unilaterally by the CEO without any input from managers",
        "Dual reporting lines (to both a functional manager and a project/product manager) can improve alignment by connecting IT work directly to business initiatives, but confusion over dual authority can undermine that alignment without strong coordination",
        "Matrix structures eliminate the need for IT alignment entirely, since every employee across the Organisation works completely independently without reporting to either a functional or a project manager",
        "Matrix structures guarantee perfect alignment between IT and business goals automatically and permanently, with no ongoing coordination effort or communication required from either manager",
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
        "Flat structures require IT investment decisions to pass through the most layers of management of any of the four structures covered in this unit",
        "Flat structures always produce the slowest IT investment decisions of any structure, because there is never a single person with final approval authority",
        "Flat structures make IT investment decisions identical to a hierarchical structure's, since both ultimately rely on one decision-maker at the top",
        "Fast, informal decision-making due to minimal middle management — but this speed advantage is harder to sustain once the Organisation and its IT investments need to scale",
      ],
      correctIndex: 3,
      modelAnswer:
        "Week 2's Flat structure slide lists fast decisions and innovation as pros (few or no levels of middle management), against the con that it is 'hard to scale' — so decision speed is the structure's strength, while scaling IT investment decisions as the Organisation grows is its limitation.",
    },
    {
      type: "mcq",
      prompt: "Contrasting Hierarchical with Flat for Part B1(c), which statement correctly distinguishes their effect on IT investment decision-making?",
      options: [
        "Hierarchical structures slow decision-making because approvals pass through multiple layers of authority, whereas flat structures allow faster, more autonomous decisions with fewer approval layers",
        "Flat structures require more layers of sign-off than hierarchical structures, since every team member must individually approve any new IT spending before it proceeds",
        "Hierarchical structures make faster IT investment decisions than flat structures because there is only one decision-maker at the very top of the chain of command",
        "Both structures produce identical decision-making speed for IT investments, since decision speed depends only on company size, not organisational structure",
      ],
      correctIndex: 0,
      modelAnswer:
        "Week 2 lists 'slower decision-making' as a Hierarchical con (against pros of clear accountability and stability) and fast decisions as a Flat pro (against the con of being hard to scale) — the two structures sit at opposite ends of the same decision-speed trade-off.",
    },
    {
      type: "mcq",
      prompt:
        "Part B2 asks why it's important for IT professionals to understand an Organisation's business model and operating model. Which reason is most consistent with Week 2's 'Aligning IT and Business' framework?",
      options: [
        "Because IT professionals are contractually required by most standard employment agreements to memorise the full company org chart before being permitted to write any code at all",
        "Understanding the business model is irrelevant to IT professionals — the slide explicitly says only staff working directly in the finance department ever actually need it",
        "Because the business model only ever determines an individual IT professional's personal salary band and pay grade, and has no other significance for how they do their job",
        "Because IT strategy and the IT operating model must be developed in alignment with business strategy and the business operating model — without that understanding, IT investments risk not supporting real business capabilities or value",
      ],
      correctIndex: 3,
      modelAnswer:
        "Week 2's diagram connects Business Strategy to IT Strategy, and Business Operating Model to IT Operating Model, via dashed lines representing required alignment, converging at Value stream orchestration — an IT professional who doesn't understand the business/operating model can't ensure their IT work actually feeds that alignment.",
    },
    {
      type: "mcq",
      prompt:
        "SmartCare Health Ltd operates under 'a divisional structure, with each state operating semi-independently,' while IT is centrally managed. Why is this a divisional structure rather than one of Week 2's four named structures (functional, matrix, flat, hierarchical)?",
      options: [
        "SmartCare is organised around semi-independent geographic units (states) each running largely on their own, rather than around specialised functions (functional), dual reporting lines (matrix), or a single dominant chain of authority (hierarchical) — a structural pattern the case describes that isn't one of Week 2's four named types",
        "It is a flat structure because the case never once mentions a CEO anywhere in its description of SmartCare's day-to-day reporting lines, and flat structures are specifically defined by having no visible head of the organisation at all, unlike hierarchical or divisional ones",
        "It is a functional structure because each state maintains its own dedicated IT department that mirrors the specialised, single-domain departments — engineering, sales, finance — that a genuinely functional organisation would be built around from the top down",
        "It is a matrix structure because each state's clinical staff report to two entirely separate CEOs simultaneously, one overseeing clinical operations statewide and one overseeing finance and budgeting statewide",
      ],
      correctIndex: 0,
      modelAnswer:
        "The case explicitly labels this a 'divisional structure' with each state semi-independent — that's organisation-by-geography, distinct from functional (organised by specialism), matrix (dual reporting per employee), or hierarchical (a single top-down chain), even though none of Week 2's four structures is literally 'divisional.'",
    },
    {
      type: "mcq",
      prompt: "What potential issue is most likely to arise from SmartCare's combination of centralised IT and semi-independent divisional (state-level) operations?",
      options: [
        "Centrally standardised IT decisions may not fit each state's local operational needs, creating tension between central control and divisional autonomy — a different tension from a matrix structure's dual-reporting confusion, since here one central function (IT) sits over multiple semi-independent business units, not two managers over one person",
        "There is no possible tension at all in this kind of arrangement, since centralising any single function like IT will always, by definition, perfectly satisfy every division's differing local needs and preferences without exception or ongoing friction",
        "Centralised IT automatically and permanently resolves the CFO's cost-centre concerns, because a single consolidated IT budget line is inherently easier for finance to track, forecast, and approve each quarter than several separate divisional budgets would be",
        "The issue here is entirely identical to the 'dual authority' risk of a matrix structure, since both situations involve exactly two managers exercising overlapping, conflicting authority over the very same individual employee's day-to-day work",
      ],
      correctIndex: 0,
      modelAnswer:
        "SmartCare's tension is structural, not a per-employee dual-reporting problem: one centrally managed function (IT) must serve multiple divisions that otherwise operate semi-independently, so IT decisions optimised centrally can clash with what any one state actually needs — a distinct issue from Matrix's dual-authority confusion.",
    },
    {
      type: "mcq",
      prompt: "How might aligning IT strategy with SmartCare's business goals create organisational value, per the concepts this unit has built since Week 2?",
      options: [
        "Alignment creates organisational value entirely automatically and immediately upon signing off the IT budget, regardless of whether any specific business goals, KPIs, or measurable outcomes are ever actually defined for the investment",
        "Aligning IT strategy with business goals mainly matters for satisfying external regulatory compliance requirements and audit checklists, not for creating any genuine organisational value for stakeholders",
        "By connecting IT investment (e.g. AI diagnostics, cloud infrastructure) to a defined business goal through value stream orchestration, so the investment translates into measurable stakeholder benefits (e.g. better patient outcomes, efficiency) rather than existing as an isolated cost",
        "IT strategy has no meaningful relationship to organisational value whatsoever in any Organisation — according to this framing, only a company's marketing strategy actually drives real stakeholder value",
      ],
      correctIndex: 2,
      modelAnswer:
        "Week 2 defines value stream orchestration as coordinating business and IT to deliver continuous value by synchronising people, processes, and technology — applied to SmartCare, that means the AI diagnostics/cloud investment only becomes organisational value once it's deliberately connected to a stated business goal, not simply purchased.",
    },
    {
      type: "mcq",
      prompt:
        "The case asks students to suggest one way SmartCare could measure the value of its AI diagnostics IT investment. Which suggestion best reflects the unit's 'best practices for IT investments' guidance (measurable outcomes tracked with KPIs)?",
      options: [
        "Count the number of lines of code written for the AI diagnostics feature during development, regardless of any patient-facing outcome",
        "There is no way to measure the value of an IT investment like this — clinical outcomes are inherently impossible to track reliably over time",
        "Track a specific outcome-linked KPI, such as reduction in diagnostic wait time or improvement in diagnostic accuracy rate, against a baseline measured before the AI system was introduced",
        "Measure success purely by how much the CFO personally likes the new system after a single brief demonstration, rather than any tracked data",
      ],
      correctIndex: 2,
      modelAnswer:
        "Week 2's 'Best practices for IT investments' guidance is to set measurable outcomes and use KPIs to track ROI rather than proceeding without evidence — for AI diagnostics, an outcome-linked KPI such as diagnostic wait time or accuracy improvement is a direct application of that guidance, unlike an output metric like lines of code.",
    },
    {
      type: "mcq",
      prompt:
        "The CFO calls IT 'a cost centre with unclear returns,' while the CEO wants to align IT more strategically. Which concept from this unit best explains what the CFO's framing is missing?",
      options: [
        "Without measurable, agreed-upon KPIs tied to specific business goals, an IT investment's organisational value stays invisible to stakeholders like the CFO — the fix is applying the 'best practices for IT investments' guidance (measurable outcomes, cost-benefit/value-risk ranking) to make the returns visible",
        "The CFO is entirely and permanently factually correct in this framing, and there is genuinely nothing the IT department can ever realistically do to demonstrate measurable value for any technology investment it makes, now or in future",
        "This disagreement between the CFO and CEO has no connection whatsoever to any concept covered anywhere across this unit's lectures, tutorials, or assigned readings so far this semester",
        "The CEO's view on strategic alignment is entirely irrelevant here, since only the CFO's personal opinion about cost ultimately determines what IT budget gets approved each financial year",
      ],
      correctIndex: 0,
      modelAnswer:
        "The CFO's 'unclear returns' framing is exactly the gap Week 2's best-practices guidance addresses: value only becomes visible to stakeholders once it is expressed as measurable, tracked outcomes — the disagreement isn't unresolvable, it's a symptom of IT investment value not yet being made measurable.",
    },
    {
      type: "mcq",
      prompt: "A classmate argues SmartCare's structure 'is basically a matrix structure because IT and the states both have authority.' What is the strongest reason this is incorrect?",
      options: [
        "It is incorrect only because SmartCare happens to be a healthcare company specifically, and matrix organisational structures are legally prohibited from ever being used within the entire regulated healthcare industry in any jurisdiction",
        "A matrix structure is defined by individual employees reporting to two managers (typically one functional, one project); SmartCare instead has one function (IT) centralised across otherwise semi-independent geographic divisions — a different pattern (divisional, with centralised IT) than dual-reporting individuals",
        "It is actually correct — divisional and matrix structures are simply two identical underlying concepts described using slightly different terminology across different textbooks, consultants, and lecturers over the years",
        "It is incorrect only because SmartCare has far too few total employees spread thinly across its state divisions to meaningfully have any organisational structure of any recognisable kind at all",
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
        "All four structures have exactly identical effects on communication, IT alignment, and decision-making, according to Week 2's structure comparison slides",
        "Flat → the slowest decision-making of all four structures, due to a complete lack of any defined roles; Hierarchical → the fastest decision-making of all four structures",
        "Functional → risk of siloed communication across departments; Matrix → dual-authority confusion affecting IT alignment; Hierarchical → slower IT investment decision-making due to layered approval",
        "Functional → the fastest IT investment decisions of any structure, since specialists decide alone; Matrix → no communication at all between any team members; Hierarchical → the highest risk of silos",
      ],
      correctIndex: 2,
      modelAnswer:
        "Each structure's listed con maps directly onto one of Part B1's three prompts: Functional's silos affect (a) communication, Matrix's dual-authority confusion affects (b) IT alignment, and Hierarchical's slower approvals affect (c) IT investment decision-making — the distractors invert or flatten these documented differences.",
    },
    {
      type: "mcq",
      prompt:
        "Drawing on the unit's IT-professional framing (challenging unclear requirements/assumptions rather than simply executing tasks), what would the most professionally sound IT-side response to the CFO's 'cost centre' framing look like?",
      options: [
        "Avoid the conversation entirely and simply let the CEO resolve the entire disagreement alone, without ever offering any technical or financial input from IT's side",
        "Agree with the CFO immediately and without question, regardless of whether the underlying reasoning actually holds up, since finance's judgement always overrides IT's on any budget matter",
        "Escalate the disagreement straight to an external regulator right away, treating it purely as a compliance matter rather than an internal value-alignment discussion",
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
        "Only the definition of 'business' versus 'Organisation' revisited from Week 2, with absolutely no relevance to organisational structure, IT alignment, or investment value here",
        "Only marketing strategy and legal compliance considerations from earlier weeks, with no meaningful connection whatsoever to organisational structure or any IT investment concept covered",
        "Nothing from the unit at all — liaison roles are a completely unrelated HR staffing concept that was never covered in any lecture or tutorial on structure or value",
        "Structural coordination (mitigating the central-IT/divisional-autonomy tension) with IT-business alignment (ensuring the AI diagnostics investment is adopted in a way that produces real, locally-relevant organisational value)",
      ],
      correctIndex: 3,
      modelAnswer:
        "A divisional IT liaison directly targets the structural tension identified earlier (centralised IT vs divisional autonomy) while also serving the IT-business alignment goal (making sure a centrally-designed investment actually lands as value in each division) — a concrete example of combining two ideas rather than treating them separately.",
    },
    {
      type: "mcq",
      prompt: "If SmartCare later reports that AI diagnostics reduced average diagnosis time by 20% and improved patient satisfaction scores, which concept does this outcome best exemplify?",
      options: [
        "An IT investment that, by definition, can never count as organisational value simply because the underlying asset itself is technology-related",
        "A business objective with no connection to organisational value at all, since objectives and value are entirely separate, unrelated concepts",
        "Organisational value — a meaningful, measurable outcome the IT investment created for stakeholders (patients), rather than the investment simply existing as a technical asset",
        "Professionalism, since organisational value only ever concerns individual employee conduct and ethics, not any measurable patient or stakeholder outcome",
      ],
      correctIndex: 2,
      modelAnswer:
        "Organisational value answers 'how does the Organisation create meaningful outcomes for its stakeholders?' — a 20% reduction in diagnosis time and improved patient satisfaction are exactly that: measurable stakeholder benefit created by the IT investment, not merely the investment's technical existence.",
    },
    {
      type: "mcq",
      prompt:
        "Per Week 2's definitions (revisited in this tutorial's Part A), which pairing of examples is correctly matched to 'Organisation' (broad, not necessarily profit-driven) versus 'Business' (the profit-driven subset)?",
      options: [
        "Both categories only ever refer to for-profit companies",
        "Organisation: Apple, Canva; Business: the Red Cross, a university",
        "Organisation and Business are mutually exclusive sets with no overlap at all",
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
    "lecture/Week 03 - Profession-s2-low.transcript.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt: "Per the 'All about a Project' slide, a project's outcome is described as 'unique.' What does the lecture actually mean by this, as distinct from a common misreading?",
      options: [
        "A project can never reuse any process or methodology from a previous project, since every project must invent an entirely new approach",
        "No two projects can ever use the same methodology or process, even if they belong to the same team working in the same organisation",
        "The outcome is not routine, even though the processes used to produce it can be repeatable — 'unique' describes the outcome, not the process",
        "Uniqueness means a project must have no defined start or end date, unlike routine operational tasks which always have clear deadlines",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide's exact wording is: 'Unique - Outcome is not routine, even if processes are repeatable.' It is specifically the outcome that is unique; the processes producing it (e.g. a standard methodology) can still be reused across projects — the misreading is assuming uniqueness applies to process rather than outcome.",
    },
    {
      type: "mcq",
      prompt: "Per the 'Who Has Power in a Project?' slide, which pairing of a project stakeholder to their source of influence is correct?",
      options: [
        "Budget holders influence scope; Sponsors influence timelines; Technical leads influence feasibility; Users influence adoption; Regulators set rules and laws the project must follow",
        "Regulators influence project timelines directly; Users influence the defined scope; Sponsors set the rules and laws the project must follow",
        "Budget holders influence adoption rates; Sponsors influence technical feasibility; Technical leads influence scope; Users set the rules and laws",
        "Only the Project Manager holds any real influence over a project's direction — every other listed role is purely advisory and non-binding",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide lists exactly this mapping: budget holders → scope, sponsors → timelines, technical leads → feasibility, users → adoption, and regulators → the rules and laws the project must follow — each stakeholder's influence is tied to a different lever, not interchangeable.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Success criteria for Project Completion' slide lists five criteria. A project delivers every required feature to specification and passes all quality checks, but six months later usage data shows almost no cost savings or efficiency gain. Which criterion has it failed to meet?",
      options: [
        "Business Value — delivering measurable benefits such as cost savings, efficiency gains, or competitive advantage — which is distinct from 'Meets Scope & Quality' (delivering required features to an acceptable standard)",
        "On-Time Delivery, since meeting scope and quality requirements to specification automatically and necessarily implies that the original project schedule was also fully met",
        "Stakeholder Satisfaction, which the slide explicitly defines as identical to Business Value, treating the two separately-named criteria as one single interchangeable measure",
        "Meets Scope & Quality, since Business Value and Scope & Quality are actually the exact same underlying success criterion, just described using two different sets of words",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide separately lists 'Meets Scope & Quality' (delivering required features with acceptable quality) and 'Business Value' (delivering measurable benefits such as cost savings, efficiency gains, or competitive advantage) as two of five distinct criteria — a project can satisfy the first while failing the second, which is exactly this scenario.",
    },
    {
      type: "mcq",
      prompt:
        "Per 'Why do Projects fail?', a project has crystal-clear, stable requirements and a realistic budget, but still fails because the team never anticipated a critical third-party API being deprecated mid-project. Which listed failure reason does this best match?",
      options: [
        "Poor Scope Definition, since any unforeseen problem that arises mid-project always counts as a scope-definition issue by default",
        "Resource Issues, since third-party API deprecations are always ultimately caused by the project team lacking sufficiently skilled staff",
        "Inadequate Risk Management — failing to anticipate and mitigate issues — which is distinct from Poor Scope Definition (unclear requirements, frequent changes)",
        "Unrealistic Timelines or Budgets, since an unexpected API deprecation like this must always trace back to an underlying budgeting error",
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
        "'Late defect discovery' pairs with 'Communication gaps' — reinforcing the same theme raised by this unit's Week 1 case studies (ASX, Victorian Government, Optus), that technical symptoms usually trace back to professional/organisational failures rather than the technology itself",
        "The table shows technical symptoms have absolutely no professional-failure counterpart at all — every symptom listed is presented purely as a technical issue caused by a purely technical root cause, unrelated to people",
        "'Scope creep' pairs with 'Communication gaps', and 'Budget overrun' pairs with 'Weak boundary management', while the other two rows in the same table are left entirely unpaired and undefined",
        "'Late defect discovery' pairs with 'Unrealistic executive pressure', and this table has no connection at all to any earlier week's material on professional practice, judgement, or accountability",
      ],
      correctIndex: 0,
      modelAnswer:
        "The table's actual pairings are: Scope creep → Weak boundary management, Budget overrun → Unrealistic executive pressure, User rejection → Poor stakeholder engagement, and Late defect discovery → Communication gaps. This directly echoes the lesson from this unit's earlier case studies — that the deciding factor in project outcomes is usually how decisions were made and communicated, not the underlying technology.",
    },
    {
      type: "mcq",
      prompt: "Per 'The Project Manager's Ethical Dilemma' slide, the PM stands between five competing pressures. What is the slide's stated resolution to this dilemma?",
      options: [
        "A professional PM should always prioritise executive expectations over every other pressure",
        "A professional PM must balance delivery with integrity, not simply prioritise one pressure over the rest",
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
        "Phased delivery using Agile sprints",
        "Budget pressure due to global supply chain disruptions",
        "Continuous stakeholder engagement",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide's three columns are: Success Factors (clear requirements from operators, phased delivery using Agile sprints, continuous stakeholder engagement), Challenges (initial delays due to hardware integration issues, budget pressure due to global supply chain disruptions), and Outcome (fully operational in 2023, 35% reduced train scheduling time, improved commuter satisfaction) — only budget pressure from supply chain disruptions is a Challenge.",
    },
    {
      type: "mcq",
      prompt: "The lecture's NASA Space Shuttle Software Development example explains why Waterfall was chosen. What was the trade-off in its outcome?",
      options: [
        "It was fast and cheap to deliver on schedule, but reliability suffered badly because the Waterfall approach inherently skips most rigorous testing steps",
        "It achieved extremely high reliability (reportedly 0 defects per 420,000 lines of code in some modules) but took years to complete and had enormous costs due to the sequential, documentation-heavy process",
        "It achieved extremely high reliability with no additional cost or time investment at all compared to using Agile-based development alternatives",
        "It failed outright and was ultimately scrapped, because the Waterfall methodology simply cannot ever be used for safety-critical aerospace software",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide states Waterfall was chosen because requirements were extremely well-defined and unlikely to change, and safety-critical systems required extensive documentation and rigorous testing per DO-178B compliance — but the reported outcome trade-off was extremely high reliability at the cost of years of time and enormous expense from the sequential, documentation-heavy process.",
    },
    {
      type: "mcq",
      prompt: "Which of the following is an accurate principle from 'The Agile Manifesto' slide shown in the lecture?",
      options: [
        "Working software is the primary measure of progress",
        "The most efficient way to convey information is through detailed written specifications, not face-to-face conversation",
        "Documentation is the primary measure of progress",
        "Requirements should be frozen as early as possible and never revisited",
      ],
      correctIndex: 0,
      modelAnswer:
        "The Manifesto slide lists 'Working software is the primary measure of progress' as principle 7. It also states the opposite of the other options: it welcomes changing requirements even late in development, and says the most efficient method of conveying information is face-to-face conversation, not documentation.",
    },
    {
      type: "mcq",
      prompt: "Per the DevOps Approach – Example slide, what outcome does Amazon's DevOps-driven deployment model reportedly achieve?",
      options: [
        "Amazon deploys changes only once per quarter to deliberately minimise risk, consistent with a traditional Waterfall-style release cadence",
        "Amazon avoids automation entirely in favour of slow, manual deployment reviews conducted by a dedicated release management team",
        "Amazon reportedly deploys changes every 11.7 seconds on average, enabling rapid innovation, personalised shopping experiences, and quick bug fixes without major downtime",
        "Amazon's deployment frequency is never actually mentioned anywhere in the lecture slides or the accompanying transcript",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide states Amazon 'reportedly deploys changes every 11.7 seconds on average,' which the lecture attributes to needing to keep up with market demand and competition faster than traditional long release cycles allowed.",
    },
    {
      type: "mcq",
      prompt: "Per 'Methodologies Reflect Organisational Culture,' which pairing of a methodology to its associated culture trait is correct?",
      options: [
        "Waterfall → shared responsibility that breaks down organisational silos entirely; Agile → a strict command-and-control culture; DevOps → requires only minimal organisational maturity to succeed",
        "Waterfall → command-and-control culture with heavy documentation and clear hierarchy; Agile → collaborative culture requiring trust and psychological safety; DevOps → shared responsibility that breaks silos and requires a mature organisational culture",
        "All three methodologies — Waterfall, Agile, and DevOps — require an entirely identical organisational culture and maturity level in order to succeed at all",
        "DevOps → a command-and-control culture with heavy upfront documentation; Waterfall → a collaborative culture requiring strong psychological safety among team members",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide lists these traits under each methodology exactly as in option 1, and concludes: 'Methodology choice is a cultural decision, not just a technical one' — meaning the methodologies are not culturally interchangeable.",
    },
    {
      type: "mcq",
      prompt: "Per 'Business and IT Silos,' which pairing of a traditional team to its typical focus is correct?",
      options: [
        "Development teams focused on functionality, features, and non-functional requirements; Operations teams focused on cost, reliability, security, risk, and manageability",
        "Development teams focused primarily on regulatory compliance matters; Operations teams focused mainly on customer-facing UX design work",
        "Both development and operations teams focused exclusively on minimising cost, with no meaningful distinction drawn between their roles",
        "Development teams focused on cost and system reliability concerns; Operations teams focused on functionality and new feature delivery",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide states development teams focused on functionality, features, and non-functional requirements, while operations teams focused on cost, reliability, security, risk, and manageability — this traditional split is exactly the silo the shift toward continuous IT lifecycles and DevOps was meant to break down.",
    },
    {
      type: "mcq",
      prompt: "Per 'Factors driving this shift' (from linear to continuous), which factor specifically refers to using continuous monitoring to inform priorities, as distinct from the other listed factors?",
      options: [
        "Cloud & Automation",
        "Customer Expectations",
        "Data-Driven Decisions",
        "Digital Transformation",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide's five factors are Digital Transformation (keeping pace with competitors), Customer Expectations (quick updates/fixes), Cloud & Automation (faster, safer deployments), Agile & DevOps Practices (collaboration and speed), and Data-Driven Decisions (continuous monitoring informs priorities) — only the last is specifically about monitoring feeding into prioritisation.",
    },
    {
      type: "mcq",
      prompt: "Per 'What is continuous IT Lifecycle,' which sequence and key concept correctly describes it?",
      options: [
        "The continuous IT lifecycle has no defined stages whatsoever — it is purely a loose metaphor with no actual repeatable structure behind it",
        "Design/Build/Test → Plan → Monitor → Deploy, a fixed sequence with no further cycling back to Plan after the Monitor stage completes",
        "Plan → Deploy → Design/Build/Test → Monitor, a strictly one-way flow that permanently ends once deployment has been completed",
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
        "Mean Time to Repair (MTTR) — since deploying updates every 2 weeks to the student portal is itself a direct measure of how fast production incidents typically get resolved",
        "Customer Satisfaction (CSAT/NPS) — since deployment cadence for a student portal is fundamentally a survey-based metric collected from end users after each individual release",
        "Deployment Success Rate — essentially the exact same underlying metric as Release Frequency, just described using slightly different wording on the same slide",
        "Release Frequency — how often new features, fixes, or updates are deployed — which measures how often releases happen, whereas Deployment Success Rate measures what percentage of those releases go live without rollback or issues",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide's own example for Release Frequency is 'Deploying updates every 2 weeks to add new features in a university student portal' — distinct from Deployment Success Rate, whose example is '98% success rate for cloud service deployments without downtime' (what fraction of deployments succeed), not how often they happen.",
    },
    {
      type: "mcq",
      prompt: "Per 'Enterprise Architecture Frameworks,' what fundamentally distinguishes the Zachman Framework from TOGAF?",
      options: [
        "Zachman is used only for low-level database schema design work within a project, while TOGAF is used only for drawing physical network architecture diagrams for a data centre",
        "Zachman is a classification framework organising EA by stakeholder perspectives and six key questions (What, How, Where, Who, When, Why); TOGAF is a methodology and framework using the Architecture Development Method (ADM) to design, plan, implement, and govern EA",
        "Zachman and TOGAF are simply two different names for the exact same underlying methodology and governance process, published independently by two entirely different standards organisations decades apart",
        "TOGAF is actually the classification framework built around six key stakeholder questions like What and How, while Zachman is instead the one that uses the Architecture Development Method (ADM)",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide states Zachman is 'a classification framework that organizes enterprise architecture using different stakeholder perspectives and key questions (What, How, Where, Who, When, Why)', while TOGAF is 'a methodology and framework for designing, planning, implementing, and governing enterprise architecture' using the ADM — a classification scheme versus a step-by-step governance methodology.",
    },
    {
      type: "mcq",
      prompt:
        "In the TOGAF digital-transformation example (university unifying enrolment, LMS, and payments), which EA component correctly matches 'Integration of LMS (Canvas), CRM (Salesforce), and payment gateway through APIs'?",
      options: [
        "Data Architecture",
        "Technology Architecture",
        "Application Architecture",
        "Business Architecture",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide lists API integration of Canvas/Salesforce/payment gateway under Application Architecture, distinct from Data Architecture (the centralised student database with real-time updates), Technology Architecture (cloud infrastructure and SSO), and Business Architecture (streamlined enrolment workflows aligning course registration, fee payment, and academic records).",
    },
    {
      type: "mcq",
      prompt: "Per the 'IT Technician vs IT Professional' table, which correctly distinguishes the two, and how does this connect to material from earlier in the unit?",
      options: [
        "A Technician solves broad organisational problems across the entire business and its wider long-term strategic direction, while a Professional is instead limited to solving narrow, individual bugs found only in their own code",
        "A Technician exercises independent judgement about what to build and how to build it and when to ship it, while a Professional only ever executes tasks exactly as instructed by others without question",
        "A Technician follows requirements and focuses on output, while a Professional challenges unclear requirements and focuses on impact — echoing this unit's earlier framing (Weeks 1–2) that professional judgement, not just technical competence, is what separates a technician from a professional",
        "There is no meaningful distinction between the two roles at all in the table — it simply lists the exact same set of behaviours twice, under two different labels, for no real reason",
      ],
      correctIndex: 2,
      modelAnswer:
        "The table pairs 'Executes tasks / Exercises judgement', 'Follows requirements / Challenges unclear requirements', 'Focuses on output / Focuses on impact', 'Solves bugs / Solves organisational problems', and 'Thinks technically / Thinks strategically & ethically' — the same theme this unit has built since Week 1–2, that professional practice is judgement and accountability beyond technical execution.",
    },
    {
      type: "mcq",
      prompt: "Per Reading 1's description of Scrum versus Kanban, which statement correctly distinguishes them?",
      options: [
        "Scrum is conducted by a certified scrum master, is heavily dependent on constant feedback, and suits small teams; Kanban, first implemented in Japan for manufacturing communication, visually tracks work on a board with columns for completed/in-progress/requested work",
        "Both Scrum and Kanban originated in exactly the same country decades apart and use completely identical visual board layouts and terminology throughout their history",
        "Kanban is conducted specifically by a certified scrum master who runs all of its ceremonies each sprint, while Scrum instead uses a visual board with columns for completed, in-progress, and requested work",
        "Scrum has no relationship to feedback of any kind at any stage, while Kanban is instead defined entirely by its daily stand-up meetings and nothing else in its methodology",
      ],
      correctIndex: 0,
      modelAnswer:
        "The reading describes Scrum meetings as conducted by a certified scrum master and heavily dependent on constant feedback, better suited to small teams; Kanban, by contrast, was first implemented in Japan to communicate manufacturing methods and involves overseeing work visually via a board with rows for sprint objectives and columns for completed/in-progress/requested work.",
    },
    {
      type: "mcq",
      prompt: "Per Reading 1's cited statistics, which pairing of success rates is correct?",
      options: [
        "49% of Agile projects are considered successful overall, versus a reported higher 64% success rate for traditional Waterfall projects",
        "64% of Agile projects are considered successful, versus 49% of Waterfall projects; separately, 42% of Agile projects succeed without significant challenges, versus only 14% of Waterfall projects",
        "14% of Agile projects succeed entirely without encountering any significant challenges at all, versus 42% of Waterfall projects reportedly doing the same",
        "Agile and Waterfall have exactly identical success rates according to the reading's cited Project Management Statistics report",
      ],
      correctIndex: 1,
      modelAnswer:
        "The reading cites two separate figures in Agile's favour: an overall success rate of 64% for Agile versus 49% for Waterfall (per the Project Management Statistics report), and separately, 42% of Agile projects achieving success without encountering significant challenges versus only 14% of Waterfall projects.",
    },
    {
      type: "mcq",
      prompt:
        "Reading 2 describes Sony showing two incompatible digital Walkman devices at the 1999 Expo of Technology, shortly before Apple's iPod overtook it. Which drawback of organisational silos does this example illustrate?",
      options: [
        "Duplication of effort and diminished innovation — because Sony's departments, disconnected from company goals, each built a competing digital Walkman without coordinating, producing two incompatible devices",
        "Employee disenfranchisement and poor organisational culture — the exact same drawback separately illustrated elsewhere by the reading's Volkswagen example",
        "Lack of cross-team collaboration and communication — the exact same drawback separately illustrated elsewhere by the reading's pets.com example",
        "Lack of team alignment and overall organisational alignment — the exact same drawback separately illustrated elsewhere by the reading's MySpace example",
      ],
      correctIndex: 0,
      modelAnswer:
        "The reading presents Sony specifically under 'Duplication in effort and diminished innovation': Sony's departments were disconnected from the company's goals and pursued their own goals separately, resulting in two different, incompatible digital Walkman-type devices — a distinct drawback from the MySpace (alignment), Volkswagen (culture), and pets.com (cross-team collaboration) examples used for the reading's other drawbacks.",
    },
    {
      type: "mcq",
      prompt: "Reading 2 describes Volkswagen employees being stuck in a 'chimney career.' What does this term mean, and which drawback of silos does it illustrate?",
      options: [
        "A term describing Volkswagen's physical factory floor layout and assembly line design, entirely unrelated to organisational silos, career paths, or company culture in any way",
        "A career path where employees are instead promoted rapidly and repeatedly across every single department in the whole company over just a few short years — illustrating the drawback of 'Duplication of effort'",
        "A career path where employees could only advance within their own silo, never move across departments — illustrating 'Employee disenfranchisement/poor culture,' since this made employees afraid to speak up or challenge decisions (relevant to the emissions-cheating scandal)",
        "A hiring practice that was specific only to engineering roles at Volkswagen and no other department at all — illustrating the drawback of 'Lack of cross-team collaboration'",
      ],
      correctIndex: 2,
      modelAnswer:
        "The reading explains that a 'chimney career' meant employees could only progress upward within their own silo, not move across departments, which 'meant that people were afraid to communicate new ideas or even to speak up to a manager' — presented as a root cause behind the Volkswagen clean diesel scandal, under the 'Employee disenfranchisement/poor culture' drawback.",
    },
    {
      type: "mcq",
      prompt: "According to Reading 2's 'Can Organizational Silos Ever Be a Good Thing?' section, what is the article's actual position?",
      options: [
        "No — silos are always harmful in every case, and there is genuinely no scenario in which they could ever benefit a company",
        "Silos are beneficial only for demographic reasons, such as employees sharing a similar age range, and never for reasons of shared expertise",
        "Yes — having a group of experts to consult within the same area is beneficial; the real problem is not silos themselves, but the silo mentality of the people within them",
        "The article deliberately takes no position at all on whether silos can ever be beneficial, leaving the question fully unresolved",
      ],
      correctIndex: 2,
      modelAnswer:
        "The article states 'Yes. silos in the workplace can be beneficial to your company... the real problem isn't the silos. The problem is the people within the silos and their silo mentality' — silos as a grouping of expertise are not inherently bad; it's the mentality of protecting one's own department over company goals that causes harm.",
    },
    {
      type: "mcq",
      prompt: "Per the HealthLink Systems case study, which three issues did HealthLink face before shifting to a Continuous IT Lifecycle?",
      options: [
        "Excessive automation without any accompanying testing process, and a complete lack of any defined organisational reporting structure",
        "An inability to hire enough qualified staff, and a complete absence of any dedicated IT department within the organisation at all",
        "Overuse of Agile ceremonies such as daily stand-ups and retrospectives, with no other issue listed anywhere in the case study",
        "Frequent delays in software updates due to siloed business and IT teams, and customer dissatisfaction with long wait times for both bug fixes and feature updates",
      ],
      correctIndex: 3,
      modelAnswer:
        "The case's Background states HealthLink 'faced frequent delays in software updates due to siloed business and IT teams' and that 'customer feedback indicated dissatisfaction with long wait times for bug fixes and feature updates' — a structural (silos) issue and its downstream customer-facing consequence.",
    },
    {
      type: "mcq",
      prompt:
        "Would Agile alone have solved HealthLink's problems, or was DevOps also necessary? Reasoning from the lecture's own definitions, which answer is best supported?",
      options: [
        "DevOps was also necessary — HealthLink's root problem was siloed business and IT teams, and while Agile improves iterative delivery and stakeholder feedback, it doesn't inherently unify development and operations the way DevOps specifically does by combining Dev and Ops for continuous integration, delivery, and monitoring",
        "Waterfall alone would have solved HealthLink's problems far faster than either Agile or DevOps could have, given its rigorous upfront planning phase and detailed documentation before any development work even began",
        "Agile alone was clearly sufficient on its own to fix absolutely everything at HealthLink, since the lecture defines Agile and DevOps as functionally identical methodologies describing the exact same underlying practices with no real distinction",
        "Neither Agile nor DevOps could ever have addressed HealthLink's underlying problems in any way, since both methodologies are said in the lecture to ignore stakeholder communication entirely from start to finish",
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
        "They are entirely unrelated concepts covered in two separate, unconnected weeks of the unit — Week 2's organisational structures apply only to non-IT departments across the business, while this week's silo content applies only and exclusively to the IT department itself",
        "They describe the same underlying phenomenon from different angles: Week 2 identifies organisational structure (grouping by specialised function) as one structural cause of silos, while this week's lecture and Reading 2 explain the resulting Dev/Ops split and the silo mentality that sustains it, plus its real-world consequences (e.g. Sony, Volkswagen)",
        "This week's silo content completely replaces and invalidates Week 2's earlier structural analysis entirely, since Week 2's four organisational structures no longer apply at all once a company adopts DevOps practices",
        "Week 2 concluded that organisational silos are always entirely beneficial for a company in every case, directly contradicting this week's material which instead says they are always harmful with absolutely no exceptions",
      ],
      correctIndex: 1,
      modelAnswer:
        "Week 2's Functional structure con ('creates silos') identifies a structural root cause; this week connects it forward — 'Business and IT Silos' describes the resulting Dev/Ops split by focus area, and Reading 2 explains the silo mentality that sustains such divides plus concrete organisational consequences (Sony's duplicated Walkman/iPod effort, Volkswagen's chimney careers) — one continuous thread across the two weeks, not two unrelated topics.",
    },
    {
      type: "mcq",
      prompt:
        "Per the 'A Project Looks Different to Different People' slide — distinct from the separate 'Who Has Power in a Project' slide — which pairing of a role to what they primarily care about is correct?",
      options: [
        "Developer → strategic impact; Operations → value for money; Regulator → privacy and ethical impact; Society → compliance and risk",
        "Developer → clear requirements and technical feasibility; Operations → value for money; Regulator → strategic impact; Society → compliance and risk",
        "Developer → clear requirements and technical feasibility; Operations → stability, security, and maintainability; Regulator → compliance and risk; Society → privacy and ethical impact",
        "Every role in this table cares about the same thing — time, cost, and scope balance — regardless of role",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide's table lists Executive Sponsor → strategic impact, Project Manager → time/cost/scope balance, Developer → clear requirements and technical feasibility, Operations → stability, security, and maintainability, Customer → value for money, Regulator → compliance and risk, and Society → privacy and ethical impact — a different lens from 'Who Has Power,' which is about influence over specific levers (scope, timelines, feasibility, adoption, rules) rather than what each role cares about.",
    },
    {
      type: "mcq",
      prompt:
        "In the lecture's live 'is this a project?' exercise, students debated whether 'updating a university website with new content every semester' counts as a project. Based on the class's concluded reasoning (tied to the 'unique outcome, not routine' project definition), which classification is most defensible?",
      options: [
        "Not a project — it is regular, recurring maintenance work with no unique outcome each time, unlike building a wholly new system such as a student management or learning management system, which would be a project",
        "It is always a project, because it has a defined timeline (the semester ending) and involves multiple people, regardless of whether the outcome repeats identically each time",
        "It is not a project only because updating a website's content each semester requires no planning, coordination, or meaningful effort at all",
        "It is a project only when the update work is performed by an external contractor, rather than by in-house university staff members",
      ],
      correctIndex: 0,
      modelAnswer:
        "The lecturer concluded that recurring content updates are a regular task, not a project, because they lack a unique outcome each cycle — but building a separate system such as a student management or learning management system would qualify as a project, directly applying the 'Unique - Outcome is not routine, even if processes are repeatable' definition to a new example.",
    },
    {
      type: "mcq",
      prompt:
        "During the same exercise, the class discussed 'upgrading all company computers to a new operating system.' What was the class's key insight about classifying this task?",
      options: [
        "It is never a project under any circumstances whatsoever, regardless of company size or the total number of machines involved, because operating system upgrades of any kind are always simply classified as routine IT maintenance",
        "Whether it counts as a project depends on context and scale — a routine single-site upgrade functions as ordinary IT maintenance, but upgrading hundreds of thousands of PCs across multiple offices and countries requires the planning, coordination, and downtime management characteristic of a project",
        "It is always a project without any exception at all, because operating systems across a whole organisation only ever need to be upgraded a single time in that organisation's entire lifetime",
        "It cannot be classified as either a project or routine work at all in any scenario, since the project definition the lecture gave never applies to any hardware or software maintenance task",
      ],
      correctIndex: 1,
      modelAnswer:
        "A student's example made the point explicit: a small company upgrading a handful of PCs is routine daily-task territory, but a large company with offices across several countries upgrading hundreds of thousands of PCs requires real planning, coordination, and managed downtime — the same task can sit on either side of the project/non-project line depending on scale and context.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture distinguished 'risk' from 'issue' during the discussion of why projects fail, and noted risk can be positive as well as negative. Which statement correctly captures this distinction, using the lecture's own examples?",
      options: [
        "Risk and issue are fully interchangeable terms describing exactly the same thing in every context — any problem the project team has already actually encountered during delivery",
        "A risk is always inherently negative in every situation, and it only technically becomes 'positive' once it has been successfully resolved and turned into an issue instead",
        "An issue is something that might still happen at some point in the future, while a risk is instead something that has already happened in the past and has already been fully and permanently resolved",
        "A risk is something that could happen in the future (e.g. not having enough servers for higher-than-anticipated client demand); once it actually happens, it becomes an issue — and risk can also be positive, such as a project exceeding its original expectations",
      ],
      correctIndex: 3,
      modelAnswer:
        "The class's own examples define the pair: a risk is a future possibility (e.g. anticipating too few servers for client demand — a risk until it actually happens, at which point it becomes an issue), and risk is not always negative — a project unexpectedly exceeding its original expectations was given as an example of positive risk.",
    },
    {
      type: "scenario",
      prompt:
        "In the lecture's case study, an AI hiring-screening system performs slightly worse for candidates from certain universities and regions. The sponsor wants to launch next month regardless, arguing the system is 'still better than manual screening' and can be improved later; fixing the bias first would delay the project two months and add cost. As the project manager, weighing 'A professional PM must balance delivery with integrity' against the class discussion's own conclusion, what should you do and why?",
      modelAnswer:
        "The class's discussion converged on delaying the launch rather than shipping the biased version: launching a system known to disadvantage candidates from certain universities and regions carries real fairness harm and potential legal exposure (e.g. under equal-opportunity obligations), and 'improve it later' does not undo the harm to real candidates screened out in the meantime. Rather than silently accepting the sponsor's 'launch now' framing or unilaterally refusing without explanation, the professionally sound response is to clearly communicate the risk to the sponsor and other stakeholders (the fairness impact on affected candidates, the legal and reputational exposure) and recommend the two-month delay as the responsible choice — balancing delivery pressure with integrity, rather than deciding unilaterally or staying silent.",
    },
    {
      type: "short",
      prompt:
        "Per the lecture's Mentimeter quiz on 'what should have been created first?', what is a project charter, and why does it come before artefacts like a sprint backlog?",
      modelAnswer:
        "A project charter is the first official document created when a project is proposed — it records the stakeholders, budget, and timeline, formally authorising the project. It precedes artefacts like a sprint backlog because those artefacts organise execution work within a project that has already been authorised; the charter is what establishes the project's existence and scope in the first place.",
    },
    {
      type: "mcq",
      prompt:
        "Per 'Methodology Through Professional Lenses' — distinct from the earlier 'Methodologies Reflect Organisational Culture' slide about Waterfall/Agile/DevOps culture traits — which pairing of a role to their concern and methodology impact is correct?",
      options: [
        "Governance → cares about usability, so methodology impact is feedback cycle; Change Manager → cares about reliability, so methodology impact is automation & monitoring",
        "Governance → cares about compliance, so methodology impact is documentation & traceability; Change Manager → cares about adoption, so methodology impact is communication & training",
        "Governance and Change Manager have identical concerns and methodology impacts under this slide, since both are non-technical roles",
        "Governance → cares about strategic alignment, so methodology impact is business case clarity; Change Manager → cares about work process & quality, so methodology impact is flexibility & collaboration",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide's table lists Governance → Compliance → Documentation & traceability and Change Manager → Adoption → Communication & training, alongside Project Manager → Control & delivery → Structure & reporting visibility, Sponsor → Strategic alignment → Business case clarity, Developer → Work process & quality → Flexibility & collaboration, End User → Usability → Feedback cycle, and Operations → Reliability → Automation & monitoring — the distractors swap these role-specific pairings.",
    },
    {
      type: "mcq",
      prompt:
        "Per the 'Difference between Linear and Continuous approach' comparison table, how do the two approaches differ specifically on the Risk Management aspect?",
      options: [
        "Linear is high risk because issues are often detected late (e.g. during testing), whereas Continuous is lower risk because continuous testing helps identify and fix issues early",
        "Linear is lower risk because every phase is tested exhaustively before moving on, whereas Continuous is high risk because testing happens too infrequently",
        "Both approaches carry an identical risk profile — the table only distinguishes them on Process Flow, not Risk Management",
        "Continuous is high risk because its cyclical process flow makes it impossible to detect issues at all, whereas Linear is low risk purely because of its one-way structure",
      ],
      correctIndex: 0,
      modelAnswer:
        "The comparison table's Risk Management row states Linear is 'High risk – Issues are often detected late in the process (e.g., during testing)' while Continuous is 'Lower risk – Continuous testing helps identify and fix issues early' — a direct consequence of Linear's one-way structured progression versus Continuous's cyclical, iterative flow, which the table lists as a separate row above Risk Management.",
    },
    {
      type: "mcq",
      prompt: "Per 'Enterprise Architecture & Continuous IT Lifecycle,' which pairing of a continuous-lifecycle phase to how EA supports it is correct?",
      options: [
        "Planning Phase → EA principles maintain interoperability and scalability; Feedback Loop → EA defines a roadmap for technology adoption and integration",
        "Design & Build Phase → EA evolves as new business needs and technologies emerge; Deployment & Monitoring → EA standards ensure solutions fit into the broader organisational ecosystem",
        "Planning Phase → EA defines a roadmap for technology adoption and integration; Feedback Loop → EA evolves as new business needs and technologies emerge",
        "EA has no defined role at any specific phase of the Continuous IT Lifecycle — it only applies once, at the very beginning of a project",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide maps each lifecycle phase to a specific EA contribution: Planning Phase → EA defines a roadmap for technology adoption and integration, Design & Build Phase → EA standards ensure solutions fit into the broader organisational ecosystem, Deployment & Monitoring → EA principles maintain interoperability and scalability, and Feedback Loop → EA evolves as new business needs and technologies emerge — the distractors swap these phase-to-contribution pairings.",
    },
    {
      type: "short",
      prompt:
        "Week 2 defines IT capabilities as the technical strengths of the IT function (e.g. system integration, cloud management, data analytics, cybersecurity) that support and scale business capabilities. Using this week's lecture discussion connecting the continuous IT lifecycle to IT capability, explain why the continuous IT lifecycle is described as part of IT capability rather than a separate, unrelated concept.",
      modelAnswer:
        "An organisation's IT capabilities are only useful while the underlying systems keep working and improving — the continuous IT lifecycle (Plan → Design/Build/Test → Deploy/Troubleshoot → Monitor, cycling continuously) is the ongoing mechanism that keeps those resources running and updated, rather than treating deployment as a one-off endpoint. A system built and monitored within that continuous cycle is what becomes an organisation's IT capability, and it is the continuous monitoring, feedback, and updates that keep that capability functioning and improving over time — so the continuous IT lifecycle isn't a separate topic from IT capability, but the ongoing process that sustains it, echoing Week 2's point that IT capabilities must be enabled and scaled by IT on an ongoing basis, not delivered once and left alone.",
    },
  ],
};

export const WEEK_3_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
