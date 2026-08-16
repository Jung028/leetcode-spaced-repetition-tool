import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed =
  {
    course: "INFO5990",
    week: 2,
    paperNumber: 1,
    title: "Week 2 Practice Paper",
    topics: "Organisations vs businesses, organisational structures (functional, matrix, flat, hierarchical), value and organisational value, IT investment, resources vs capabilities, the role of IT in creating organisational value, aligning IT and business (goals, strategy, business model, operating model, capabilities, value stream orchestration), Netflix/Blockbuster and BrightCare case studies; Tutorial: evaluating/finding/referencing sources (CRAAP test), knowledge/skill/expertise/profession/professionalism/practice, being an IT professional, strategic roles of IT and the four forces reshaping organisations",
    sourceFiles: [
      "tutorial/INFO5990 2026-S2 Week 02 - IT and Organizational Value (1).pdf",
      "tutorial/INFO5990 2026-S2 Week 02 Tutorial Sheet.pdf",
      "tutorial/Week 2 Tutorial - Answers.md",
    ],
    questions: [
      {
        type: "mcq",
        prompt: "Per the 'What is an Organisation?' slide, which five characteristics does the lecture list as key to any Organisation?",
        options: [
          "Purpose, People, Structure, System, Resources", "Profit, People, Product, Price, Promotion", "Vision, Mission, Values, Culture, Brand", "Hierarchy, Budget, Policy, Staff, Technology",
        ],
        correctIndex: 0,
        modelAnswer: "The slide lists: Purpose (mission/objective guiding activities), People (individuals with different roles/responsibilities/skills), Structure (defined hierarchy for dividing/coordinating tasks), System (established methods for communication, decision-making, and operations), and Resources (human, financial, technological, and physical resources).",
      },
      {
        type: "mcq",
        prompt: "According to the 'Organisation vs Business' comparison slide, what is the key distinguishing feature of a business?",
        options: [
          "A business is any group of people working toward a common goal", "A business is a type of Organisation whose primary goal is to make a profit by providing goods or services", "A business must be a large corporation with multiple departments", "A business is defined by having government funding",
        ],
        correctIndex: 1,
        modelAnswer: "The slide states an Organisation is a broad term for any structured group working toward a goal (not always profit-driven, e.g. non-profits, governments, universities, clubs), while a business is specifically 'a type of Organisation whose primary goal is to make a profit by providing goods or services' (e.g. Canva, Apple, local cafes).",
      },
      {
        type: "truefalse",
        prompt: "True or False: Per the lecture, all Organisations exist primarily to generate profit.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "False. The slide explicitly says an Organisation's purpose 'is not always profit-driven' — examples given include non-profits (Red Cross), governments (NSW Health), universities (University of Sydney), and clubs. Only a business, a subset of Organisations, is specifically profit-driven.",
      },
      {
        type: "mcq",
        prompt: "Which organisational structure divides the company into departments based on specialised roles or functions (e.g. IT, HR, Finance, Marketing), and was exemplified in the lecture by Microsoft?",
        options: ["Matrix", "Flat", "Functional", "Hierarchical"],
        correctIndex: 2,
        modelAnswer: "Functional structure. The lecture's Microsoft example describes departments like Engineering, Sales, Marketing, HR, and Finance operating independently, each with its own VP reporting to the CEO — specialisation in each domain helped Microsoft scale globally while maintaining departmental focus.",
      },
      {
        type: "mcq",
        prompt: "In a Matrix organisational structure, as illustrated by the lecture's Google example, how do employees typically report?",
        options: [
          "To no manager at all — fully self-directed", "To a single functional manager only", "To two managers — one for function (e.g. Engineering or UX) and one for project/product (e.g. Android or YouTube)", "To the CEO directly regardless of role",
        ],
        correctIndex: 2,
        modelAnswer: "Employees report to more than one manager, typically by function and project/team. The Google example: employees often report to both a product manager (e.g. for Android or YouTube) and a functional manager (e.g. Engineering or UX) — dual-reporting that allows better cross-project collaboration while maintaining technical excellence.",
      },
      {
        type: "mcq",
        prompt: "The lecture's Valve Corporation example illustrates which organisational structure, and what is its defining feature?",
        options: [
          "Hierarchical — multiple layers of command", "Flat — few or no levels of middle management, with employees choosing what projects to work on", "Matrix — dual reporting lines", "Functional — departments organised by specialism",
        ],
        correctIndex: 1,
        modelAnswer: "Flat structure. Valve 'famously operates with no formal hierarchy' — employees choose what projects to work on and everyone contributes equally to decision-making, which the lecture says fostered innovation and rapid iteration in the creative, agile gaming industry.",
      },
      {
        type: "mcq",
        prompt: "IBM is given as the lecture's example of which organisational structure, and why did the lecture say it 'worked' for IBM?",
        options: [
          "Flat — because small teams move faster", "Hierarchical — because in such a massive enterprise, a strict hierarchy ensures stability, control, and accountability across global operations", "Matrix — because IBM needed dual reporting for R&D", "Functional — because IBM has only one product line",
        ],
        correctIndex: 1,
        modelAnswer: "Hierarchical. IBM follows a classic top-down structure with multiple layers of management and a clear chain of command from junior employees to executives; the lecture states this works because 'in such a massive enterprise, a strict hierarchy ensures stability, control, and accountability across global operations.'",
      },
      {
        type: "truefalse",
        prompt: "True or False: One of the lecture's listed cons of a Functional organisational structure is that it can create silos and reduce flexibility due to limited communication across departments.",
        options: ["True", "False"],
        correctIndex: 0,
        modelAnswer: "True. The Functional structure slide lists 'limited communication across departments' and 'can create silos and reduce flexibility' as cons, despite the pros of specialisation, clear roles, and easier scaling by department.",
      },
      {
        type: "mcq",
        prompt: "What is listed as a key 'con' of the Matrix organisational structure?",
        options: [
          "It is only usable by small startups", "Dual authority can cause confusion, and it requires strong communication and coordination", "It has no defined roles at all", "It cannot scale across projects",
        ],
        correctIndex: 1,
        modelAnswer: "The Matrix structure slide lists 'dual authority can cause confusion' and 'requires strong communication and coordination' as cons, despite pros like efficient resource use across projects, cross-functional teamwork, and flexibility.",
      },
      {
        type: "mcq",
        prompt: "Which of the following is listed as a 'con' of the Hierarchical organisational structure?",
        options: [
          "It cannot support growth or delegation", "Slower decision-making, and it can stifle creativity and employee autonomy", "It has no clear chain of command", "It is unsuitable for government bodies",
        ],
        correctIndex: 1,
        modelAnswer: "The Hierarchical structure slide lists 'slower decision-making' and 'can stifle creativity and employee autonomy' as cons, against pros of clear reporting lines/accountability, stability for managing large teams, and support for growth and delegation.",
      },
      {
        type: "mcq",
        prompt: "Per the lecture, Value can be tangible or intangible. Which pairing correctly matches the lecture's own examples?",
        options: [
          "Tangible: Trust; Intangible: Money", "Tangible: Money, Products; Intangible: Trust, Satisfaction", "Tangible: Satisfaction; Intangible: Products", "Both tangible and intangible value refer only to money",
        ],
        correctIndex: 1,
        modelAnswer: "The 'Value and Organisational value' slide gives Money and Products as examples of tangible value, and Trust and Satisfaction as examples of intangible value — value in general answers 'How does this benefit me or others?'",
      },
      {
        type: "mcq",
        prompt: "According to the lecture, what question does 'Organisational Value' answer, as distinct from plain 'Value'?",
        options: [
          "'How much profit did we make this quarter?'", "'How does the Organisation create meaningful outcomes for its stakeholders?'", "'How fast can we ship this feature?'", "'How does this benefit me personally?'",
        ],
        correctIndex: 1,
        modelAnswer: "Organisational value refers to value created, delivered, and sustained by an Organisation for its stakeholders (customers, employees, shareholders, and society), and answers: 'How does the Organisation create meaningful outcomes for its stakeholders?' — versus plain Value, which answers 'How does this benefit me or others?'",
      },
      {
        type: "mcq",
        prompt: "Which of these is an accurate definition of an 'IT investment', per the lecture?",
        options: [
          "Only money spent on new laptops for staff", "The allocation of financial, human, and technological resources into IT systems, tools, or services to support or improve an Organisation's operations, performance, or strategic goals — which can be insourced or outsourced", "A one-off purchase of software with no ongoing organisational impact", "Any expense the IT department incurs, regardless of strategic purpose",
        ],
        correctIndex: 1,
        modelAnswer: "An IT investment is the allocation of financial, human, and technological resources into IT systems, tools, or services to support or improve an Organisation's operations, performance, or strategic goals. These resources/capabilities can be internally owned (insourced) or externally sourced (outsourced); examples include hardware, software, data, people, and processes/frameworks.",
      },
      {
        type: "truefalse",
        prompt: "True or False: Per the 'Distinction between resources and capabilities' slide, a Capability refers to what an Organisation owns, while a Resource refers to what an Organisation can do.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "False — it's the reverse. Resources refer to what an Organisation owns (tangible: property, machinery, hardware; intangible: knowledge, employee skills, policies). Capabilities refer to what an Organisation can do by using those resources — the ability to execute a course of action to achieve outcomes based on available skills and technology.",
      },
      {
        type: "mcq",
        prompt: "Per the 'Four Foundational concepts' diagram, which three concepts combine to produce Organisational Value?",
        options: [
          "Organisations, Value, IT Investment", "Strategy, Structure, Culture", "Resources, Capabilities, Competitors", "People, Process, Technology only",
        ],
        correctIndex: 0,
        modelAnswer: "The diagram shows three arrows converging on 'Organisational Value': Organisations, Value, and IT Investment — the same three concepts elaborated across the lecture (organisational structure/people/process; value delivered to stakeholders; and technology enabling efficiency, innovation, and scale).",
      },
      {
        type: "mcq",
        prompt: "Which set correctly matches the lecture's 'critical role of IT in creating Organisational Value' to its example technologies?",
        options: [
          "Improving efficiency – automation/cloud/databases; Enhancing decisions – data analytics/BI/AI; Driving innovation – IoT/Blockchain/Agentic AI; Customer-centric strategies – CRM/self-service; Scalability – AWS/GCP/Azure",
          "Improving efficiency – CRM; Enhancing decisions – AWS; Driving innovation – databases; Customer-centric – Blockchain; Scalability – BI tools",
          "All five roles are only achieved through cybersecurity tooling",
          "IT's role is limited to technical support and troubleshooting",
        ],
        correctIndex: 0,
        modelAnswer: "The 'critical role of IT' slide lists exactly this mapping: improving operational efficiency (automation, cloud systems, databases), enhancing decision-making (data analytics, BI tools, AI), driving innovation (IoT, Blockchain, Agentic AI), enabling customer-centric strategies (CRM systems, self-service platforms), and supporting scalability/flexibility (AWS, GCP, Azure).",
      },
      {
        type: "mcq",
        prompt: "In Case study #1, which Netflix IT investment does the lecture credit with 'Scalability without hardware limitations'?",
        options: ["Recommendation Algorithms", "Content Analytics", "Cloud Computing (AWS)", "Streaming Infrastructure"],
        correctIndex: 2,
        modelAnswer: "Cloud Computing (AWS) — the slide lists it as enabling 'Scalability without hardware limitations,' alongside Streaming Infrastructure (global 24/7 access), Recommendation Algorithms (increased watch time/satisfaction), and Content Analytics (informed original content like House of Cards).",
      },
      {
        type: "truefalse",
        prompt: "True or False: Per the lecture, Blockbuster's decline was primarily due to failing to adapt to the shift toward online streaming and digital rentals, including late and poorly executed attempts to launch a streaming service.",
        options: ["True", "False"],
        correctIndex: 0,
        modelAnswer: "True. The slide states Blockbuster (founded 1985) 'failed to adapt to the shift toward online streaming and digital rentals,' and that 'late and poorly executed attempts to launch a streaming service and impose unpopular fees (like late fees) hurt customer loyalty.'",
      },
      {
        type: "mcq",
        prompt: "In the 'Aligning IT and Business' diagram, what connects Business Strategy to IT Strategy?",
        options: [
          "A solid arrow showing IT Strategy causes Business Strategy", "A dashed line, indicating the two must be developed in alignment with each other", "No connection is shown between them", "Business Strategy is shown as a subset of IT Strategy",
        ],
        correctIndex: 1,
        modelAnswer: "A dashed line connects Business Strategy to IT Strategy (and similarly Business Operating Model to IT Operating Model), representing that 'IT strategy must be developed in lockstep with business strategy' — the two sides (Organisational components and IT investments) run in parallel, converging at Value stream orchestration.",
      },
      {
        type: "mcq",
        prompt: "How does the lecture distinguish a business goal from a business objective?",
        options: [
          "They are interchangeable terms with no real difference", "A business goal represents the direction the company intends to go and what it wants to achieve; a business objective specifies the measurable methods/paths to help achieve that goal", "A business objective is always about a company's overall vision; a business goal is a specific number", "Business goals only apply to non-profits, objectives only apply to businesses",
        ],
        correctIndex: 1,
        modelAnswer: "A business goal defines what the organisation ultimately wants to achieve, providing direction and purpose (e.g. 'Increase customer satisfaction in the next 12 months'). A business objective specifies measurable targets/methods that help achieve that goal (e.g. 'reduce expenses by 5%', 'increase sales by 5%').",
      },
      {
        type: "mcq",
        prompt: "In the QuickCart example, what is given as the Business Goal (as distinct from the Business Objective)?",
        options: [
          "Complete at least 90% of grocery deliveries within 30 minutes by the end of next 12 months", "Become a preferred ultra-fast grocery-delivery service for customers in urban areas", "Deploy a cloud-first infrastructure", "Reduce commissions paid to partner stores",
        ],
        correctIndex: 1,
        modelAnswer: "The Business Goal is 'Become a preferred ultra-fast grocery-delivery service for customers in urban areas' — the broad, long-term outcome. The Business Objective (the measurable target supporting it) is 'Complete at least 90% of grocery deliveries within 30 minutes by the end of the next 12 months.'",
      },
      {
        type: "mcq",
        prompt: "Which of the following are listed as QuickCart's IT Strategy elements?",
        options: [
          "Cloud-first infrastructure, AI-driven logistics, real-time tracking system, mobile app/digital payment platform, data analytics for demand forecasting", "Hiring only in-house delivery drivers and avoiding all outsourcing", "A purely paper-based order tracking system", "Avoiding cloud computing in favour of on-premise servers only",
        ],
        correctIndex: 0,
        modelAnswer: "QuickCart's IT Strategy includes: cloud-first infrastructure for scalability/availability, AI-driven logistics for route optimisation/delivery prediction, a real-time tracking system for customers and drivers, a mobile app and digital payment platform, and data analytics to forecast demand and optimise inventory.",
      },
      {
        type: "mcq",
        prompt: "What are QuickCart's revenue streams, per its Business Model?",
        options: [
          "Delivery fees, QuickCart Prime subscriptions, and commissions from partner stores", "Government grants and venture capital only", "Advertising revenue exclusively", "One-off app purchase fees",
        ],
        correctIndex: 0,
        modelAnswer: "QuickCart uses a digital platform model connecting customers, grocery stores, and delivery partners, with revenue streams of: delivery fees, QuickCart Prime subscriptions, and commissions from partner stores.",
      },
      {
        type: "truefalse",
        prompt: "True or False: The lecture states that the IT operating model must align with the business operating model, and that operating model alignment enables efficient IT integration.",
        options: ["True", "False"],
        correctIndex: 0,
        modelAnswer: "True. The 'IT operating model' slide explicitly states IT operating model definitions 'must align with the business operating model,' and the 'Business operating model' slide notes 'Operating model alignment enables efficient IT integration.'",
      },
      {
        type: "mcq",
        prompt: "How does the lecture define 'Value stream orchestration'?",
        options: [
          "A synonym for the IT department's ticketing system", "Coordinating business and IT to deliver continuous value by synchronising people, processes, and technology to maximise value delivered to stakeholders", "A method exclusively for managing cloud server costs", "The process of writing a business model canvas",
        ],
        correctIndex: 1,
        modelAnswer: "Value stream orchestration is 'about coordinating business and IT to deliver continuous value,' involving synchronising people, processes, and technology to maximise value delivered to stakeholders, enabling smooth flow of value from idea to delivery so technology investments produce real business outcomes.",
      },
      {
        type: "mcq",
        prompt: "Per 'Best practices for IT investments', what should organisations use to rank competing IT initiatives?",
        options: [
          "Whichever project the CEO personally prefers", "A cost-benefit or value-risk matrix", "Alphabetical order of project names", "The number of vendors bidding on the project",
        ],
        correctIndex: 1,
        modelAnswer: "The slide recommends using 'a cost-benefit or value-risk matrix to rank IT initiatives,' alongside setting measurable outcomes for each investment, using KPIs to track ROI, and focusing on projects offering both short-term wins and long-term value.",
      },
      {
        type: "truefalse",
        prompt: "True or False: The lecture's 'Best practices for IT investments' slide advises businesses to invest in systems that lock the business into rigid structures, to maximise long-term control.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "False — the opposite. The slide advises to 'invest in technologies that can grow with the business (e.g., cloud, APIs, modular platforms)' and to 'avoid systems that lock the business into rigid structures.'",
      },
      {
        type: "short",
        prompt: "Summarise the five key characteristics of an Organisation, per the lecture.",
        modelAnswer: "Purpose (a mission or objective guiding activities), People (individuals with different roles, responsibilities, and skills), Structure (a defined hierarchy for how tasks are divided and coordinated), System (established methods for communication, decision-making, and operations), and Resources (human, financial, technological, and physical resources the Organisation utilises).",
      },
      {
        type: "short",
        prompt: "Explain the difference between an Organisation and a Business, with an example of each from the lecture.",
        modelAnswer: "An Organisation is a broad term for any structured group of people working together toward a common goal — its purpose is not always profit-driven (e.g. Red Cross, NSW Health, University of Sydney, a local sports club). A Business is specifically a type of Organisation whose primary goal is to make a profit by providing goods or services (e.g. Canva, Apple, local cafes). So every business is an Organisation, but not every Organisation is a business.",
      },
      {
        type: "short",
        prompt: "Briefly describe each of the four organisational structures covered in the lecture: Functional, Matrix, Flat, and Hierarchical.",
        modelAnswer: "Functional: groups employees by specialised roles/functions (e.g. IT, HR, Finance, Marketing) — efficient and clear, but can create silos. Matrix: employees report to two managers, one for function and one for project — flexible and collaborative, but dual authority can confuse. Flat: few or no levels of middle management, common in startups — fast decisions and innovation, but hard to scale. Hierarchical: traditional top-down structure with multiple layers of authority — clear accountability and stability, but slower decisions and less creative autonomy.",
      },
      {
        type: "short",
        prompt: "Explain the distinction between Resources and Capabilities, with an example of each.",
        modelAnswer: "Resources are what an Organisation owns — tangible (e.g. property, machinery, hardware) or intangible (e.g. knowledge, employee skills, policies). Capabilities are what an Organisation can do by using those resources — the ability to execute a course of action to achieve outcomes based on available skills and technology. For example, owning a fleet of delivery vehicles and a mapping API is a resource; being able to reliably deliver groceries within 30 minutes using them is a capability.",
      },
      {
        type: "short",
        prompt: "Using the 'Four Foundational concepts' diagram, explain how Organisations, Value, and IT Investment combine to produce Organisational Value.",
        modelAnswer: "Organisation provides the structure, people, and processes that drive operations and form the foundation for strategy and delivery. IT Investment (automation, data analytics, cloud, AI) enables efficiency, innovation, and scale on top of that foundation. Value is the result of organisational effort plus tech enablement, delivering benefits to stakeholders — customers, employees, investors, and society (e.g. profits, dividends, operational efficiency). Together, these three feed into Organisational Value: the meaningful outcomes the Organisation sustainably creates for its stakeholders.",
      },
      {
        type: "short",
        prompt: "List the five ways the lecture says IT plays a critical role in creating Organisational Value.",
        modelAnswer: "Improving operational efficiency (automation, cloud systems, databases); enhancing decision-making (data analytics, BI tools, AI); driving innovation (IoT, Blockchain, Agentic AI); enabling customer-centric strategies (CRM systems, self-service platforms); and supporting scalability and flexibility (cloud platforms such as AWS, GCP, Azure).",
      },
      {
        type: "short",
        prompt: "Summarise the Netflix case study: what did Netflix invest in, and what organisational value outcomes resulted — in contrast to Blockbuster?",
        modelAnswer: "Netflix invested in streaming infrastructure (global 24/7 access), recommendation algorithms (increased watch time/satisfaction), cloud computing via AWS (scalability without hardware limits), and content analytics (informing original content like House of Cards). The resulting organisational value: a customer-centric, personalised model; rapid scalability to 200M+ subscribers; market disruption as a digital entertainment leader; and a sustainable competitive advantage from data-driven decisions and operational efficiency. Blockbuster, by contrast, failed to adapt to the shift toward streaming and made late, poorly executed attempts to launch its own service, which — combined with unpopular fees — hurt customer loyalty and ultimately let Netflix overtake it.",
      },
      {
        type: "short",
        prompt: "In under a minute, as you might for the Viva, explain the difference between a business goal and a business objective, using QuickCart's example.",
        modelAnswer: "A business goal is the broad, long-term direction — what the organisation ultimately wants to achieve. QuickCart's goal is to become a preferred ultra-fast grocery-delivery service for urban customers. A business objective is the specific, measurable target that supports that goal — QuickCart's objective is to complete at least 90% of deliveries within 30 minutes within 12 months. In short: the goal is the destination, the objective is the measurable milestone proving you're getting there.",
      },
      {
        type: "short",
        prompt: "Describe QuickCart's Business Operating Model, and explain how the IT Operating Model supports it.",
        modelAnswer: "QuickCart's Business Operating Model is platform-based and partner-enabled: partner stores prepare orders, independent delivery partners complete deliveries, and QuickCart centrally manages the digital platform, payments, order allocation, and customer experience. The IT Operating Model supports this directly — a central IT team manages the platform, data, and cybersecurity; cross-functional Agile teams build customer-facing features; cloud infrastructure supports scalability; and DevOps practices enable frequent, reliable releases — mirroring the business's centralised-platform, distributed-execution model.",
      },
      {
        type: "short",
        prompt: "Explain what 'value stream orchestration' means in the context of IT/business alignment, using QuickCart as an example.",
        modelAnswer: "Value stream orchestration is where business and IT truly meet — coordinating both sides to deliver continuous value by synchronising people, processes, and technology, so technology investments translate into real business outcomes rather than existing in isolation. For QuickCart, this means aligning IT and business goals so AI, cloud, and automation work together to enhance delivery speed, increase logistics-partner efficiency, and improve customer satisfaction and retention.",
      },
      {
        type: "short",
        prompt: "Per the tutorial's Concept Review, define Knowledge, Skill, Expertise, Profession, Professionalism, and Practice, and explain how they relate.",
        modelAnswer: "Knowledge is theoretical/factual understanding a person can recall and reason about. Skill is the learned, practical ability to competently perform a task, developed through training and repetition. Expertise is a deep, specialised combination of knowledge and skill built up over years, enabling someone to solve complex or novel problems. Profession is a formal occupation requiring specialised education, governed by a recognised body and code of ethics, involving service to others. Professionalism is the conduct, judgement, and attitudes expected within a profession — competence, integrity, accountability, ethics, continuous development. Practice is the actual applied exercise of knowledge, skill, and standards in real work, as distinct from theory. How they relate: Knowledge + Skill, developed over time through Practice, produce Expertise; a Profession is the formal structure organising people with that expertise; Professionalism is the standard of conduct expected of them while practising within it.",
      },
      {
        type: "short",
        prompt: "Summarise the CRAAP test from the tutorial's 'Evaluating sources of information' section, and where students should prioritise looking for sources.",
        modelAnswer: "Before using a source, check its Currency (how recent/updated it is), Relevance (does it actually address the question), Authority (who wrote it and their credentials), Accuracy (can the claims be verified elsewhere), and Purpose (is it objective, or selling/persuading) — commonly remembered as the CRAAP test. For finding sources, students should prioritise USyd Library databases, Google Scholar, peer-reviewed journals, and reputable industry sources (e.g. Gartner, McKinsey, Forbes) over generic web search results or unverified blogs.",
      },
      {
        type: "short",
        prompt: "Drawing on the tutorial's Part C and connecting back to Week 1, what does it mean to be an IT professional in today's world?",
        modelAnswer: "Being an IT professional goes beyond technical competence. As covered in Week 1, it means making sound decisions when requirements, risks, and information are incomplete; balancing technical choices against organisational strategy, cost, time, and quality constraints; communicating risk and trade-offs clearly to technical and non-technical stakeholders; acting ethically and taking accountability for decisions under delivery pressure — not just completing tasks; and continuously updating skills as technology (cloud, AI, cybersecurity) evolves. In short: technical excellence is necessary but not sufficient — professional judgement, communication, and accountability separate a technician from a professional.",
      },
      {
        type: "short",
        prompt: "List the four key forces reshaping how organisations operate and compete, per the tutorial notes (drawing on the Week 1 'Changing Business Landscape' material).",
        modelAnswer: "Business drivers (globalisation, deregulation, competition), Technology drivers (the power of the web, and the shift from raw data to usable information), Customer expectations (customers are more sophisticated and demanding), and Market trends (markets are more fragmented, with a shift toward mass customisation).",
      },
      {
        type: "scenario",
        prompt: "BrightCare, a mid-sized telehealth organisation, has outdated systems, siloed departments, and manual reporting. It plans to invest in a cloud-based Health Information System (HIS), hire a CIO, and restructure from a functional model to a matrix structure. Identify two business goals BrightCare is trying to achieve through this IT investment, and explain how they relate to Organisational Value.",
        modelAnswer: "Two of BrightCare's stated goals: a 30% reduction in wait times, and 95% digital record accuracy. Both relate directly to Organisational Value because they target the exact stakeholder benefits the lecture defines value around: reduced wait times increase patient (customer) satisfaction and operational efficiency, while accurate digital records reduce error/rework costs and support better clinical decision-making — measurable outcomes the 'Outcome — Organisational value' slide lists (increased customer satisfaction, operational efficiency, revenue growth). The goals only become value once IT investment (the new HIS) and organisational change (restructuring, retraining) are actually aligned and delivered, not merely announced.",
      },
      {
        type: "scenario",
        prompt: "BrightCare is moving from a functional structure to a matrix structure to enable cross-departmental collaboration. Using the pros/cons of both structures from the lecture, explain why this move is a reasonable response to BrightCare's siloed, functionally-structured starting point — and what new risk it introduces.",
        modelAnswer: "BrightCare's original functional structure (departments organised by specialism, e.g. clinical, IT, admin) gives clear roles and easier per-department management, but its listed con is exactly BrightCare's problem: 'limited communication across departments' that 'can create silos and reduce flexibility' — consistent with the case's description of siloed departments and manual, disconnected reporting. A matrix structure directly targets this: employees report to both a functional manager and a project/initiative manager (e.g. the HIS rollout), which the lecture says 'encourages teamwork and cross-functional skills' and 'increases flexibility and adaptability' — well suited to a project-based technology rollout spanning multiple clinical and IT functions. The new risk the lecture flags for matrix structures: 'dual authority can cause confusion' and it 'requires strong communication and coordination' — without a CIO actively managing that coordination, cross-departmental collaboration could just as easily produce conflicting priorities between functional and project managers.",
      },
      {
        type: "scenario",
        prompt: "The BrightCare CIO's plan is to define clear business goals, align IT and business strategy by upgrading technology and retraining staff, build data analytics/reporting capabilities, and implement value stream orchestration to connect IT workflows with patient care delivery. Explain the CIO's role in ensuring IT/business alignment here, and identify one challenge they might face.",
        modelAnswer: "The CIO's role mirrors the lecture's 'Aligning IT and Business' diagram: business goals and strategy (reduce wait times, improve accuracy) must connect — via a dashed but deliberate link — to IT strategy, and the business operating model must connect to the IT operating model, so that business capabilities and IT capabilities jointly feed value stream orchestration rather than developing in isolation. Concretely, the CIO ensures the new HIS, the matrix restructure, and staff retraining are not separate initiatives but a single coordinated plan. A likely challenge: per the matrix-structure con above, dual reporting lines between clinical/functional managers and the CIO's cross-functional initiative could create confusion over decision rights during the technology rollout — the CIO must invest heavily in communication and coordination, which the lecture identifies as the specific weakness matrix structures require managing.",
      },
      {
        type: "scenario",
        prompt: "Evaluate whether BrightCare's planned IT investment (cloud HIS, CIO hire, matrix restructure, data analytics capability) is likely to create organisational value. Structure your answer as: a claim, 2-3 supporting points, and one example — as you would for a time-boxed Viva answer.",
        modelAnswer: "Claim: the plan is well-positioned to create organisational value, provided execution follows through on alignment, not just investment. Supporting points: (1) it follows the lecture's alignment chain — clear business goals (wait-time/accuracy targets) driving IT strategy (cloud HIS, analytics) and a restructured operating model (matrix) to support it, rather than IT being bolted on afterward; (2) it targets a genuine resources-vs-capabilities gap — BrightCare currently has the resources (staff, systems) but lacks the capability (real-time reporting, cross-department coordination) the new structure and analytics investment specifically build; (3) it follows 'Best practices for IT investments' by setting measurable outcomes (30% wait-time cut, 95% accuracy) rather than investing without KPIs. Example: this mirrors Netflix's case, where IT investment (cloud, analytics) plus organisational commitment to using it converted into measurable value (200M+ subscribers) — versus Blockbuster, where technology alone without organisational follow-through produced no value. BrightCare's risk is the same one Blockbuster's competitors avoided: value only appears if the matrix restructure and retraining are actually completed, not just proposed.",
      },
      {
        type: "scenario",
        prompt: "Week 1's ASX, Victorian Government, and Optus case studies concluded that technology alone rarely explains success or failure — organisational and professional factors (governance, risk management, accountability) usually decide the outcome. Using Week 2's Netflix vs Blockbuster case, argue whether this same lesson applies to Netflix's success, or whether Netflix is a counter-example where 'the technology' really was the deciding factor.",
        modelAnswer: "The Week 1 lesson still applies, but from the success side rather than the failure side: Netflix's advantage wasn't simply 'better technology' in isolation — Blockbuster could, in principle, have built or bought similar streaming infrastructure. What separated them was organisational and strategic judgement: Netflix committed early to a customer-centric, data-driven model and treated content analytics and recommendation algorithms as core to strategy, while Blockbuster's response was 'late and poorly executed,' compounded by an unpopular fee structure that actively damaged customer trust. This mirrors Week 1's framing precisely — 'the issue is rarely the code, it is how decisions were made around it' (from 'When Strong Technology Still Leads to Poor Outcomes'). Netflix is not a counter-example to the Week 1 lesson; it's the positive mirror of it: professional practice — timely, well-governed decisions about how to use technology — determined the organisational value outcome, just as its absence explained the ASX, Victorian Government, and Optus failures.",
      },
      {
        type: "scenario",
        prompt: "Your Team Report (Group Assignment) is marked partly on Criterion 12: 'Integration, research, professional communication and presentation,' which requires 'high-quality current sources, correct APA 7.' Using the tutorial's guidance on evaluating and referencing sources, explain how you would apply the CRAAP test and referencing practice while researching for the report.",
        modelAnswer: "Before citing any source in the report, I'd run it through the CRAAP test: check its Currency (is it recent enough to reflect current industry practice), Relevance (does it actually address the specific business challenge or governance point being argued), Authority (who wrote it — an industry body like Gartner/McKinsey carries more weight than an anonymous blog), Accuracy (can its claims be cross-checked against another source), and Purpose (is it an objective analysis or a vendor trying to sell something). I'd prioritise USyd Library databases, Google Scholar, peer-reviewed journals, and reputable industry sources over generic web search results, per the tutorial's guidance. For writing, I'd follow the tutorial's paragraph structure — topic sentence, evidence with an APA in-text citation, and a closing sentence linking back to the argument — so the report reads as evidenced analysis rather than uncited assertion, which is exactly what Criterion 12 rewards over a report that merely 'looks' researched.",
      },
      {
        type: "scenario",
        prompt: "Using the tutorial's four key forces (business drivers, technology drivers, customer expectations, market trends) and this week's lecture on organisational structure, argue which one force would most strongly push a traditional, hierarchically-structured supermarket chain toward adopting a matrix or flat structure — and why.",
        modelAnswer: "Customer expectations is the strongest driver here: as the tutorial notes, customers are 'more sophisticated and more demanding' — expecting real-time tracking, personalisation, and fast fulfilment (per the Amazon example: real-time order tracking, one-click purchasing, personalised recommendations). A traditional hierarchical supermarket structure is built for stability and control (per the lecture's hierarchical pros), but its con — 'slower decision-making' — directly conflicts with the speed customer expectations now demand. Meeting rising customer expectations typically requires cross-functional projects (e.g. building a QuickCart-style delivery arm) spanning IT, logistics, and marketing simultaneously — exactly the kind of initiative the lecture says benefits from a matrix structure's cross-functional collaboration, or even a flat structure's fast decision-making, rather than a rigid top-down chain of command that slows the organisation's response to what customers now expect.",
      },
      {
        type: "scenario",
        prompt: "A new logistics startup is defining its Business Goal, Business Strategy, and IT Strategy for the first time, modelling itself on the QuickCart example from the lecture. Write a plausible Business Goal, Business Strategy, and IT Strategy for this startup, explicitly showing how each level supports the one above it.",
        modelAnswer: "Business Goal: become the most trusted same-day parcel-delivery service for small businesses in a metro region — the broad, long-term outcome (mirroring QuickCart's 'become a preferred ultra-fast grocery-delivery service'). Business Strategy: differentiate through guaranteed same-day delivery windows and transparent real-time tracking, supported by AI-driven route planning — this is 'how' the goal will be achieved, choosing a competitive position (speed/transparency) the way QuickCart chose 'fast delivery, real-time order tracking, and AI-driven logistics.' IT Strategy: cloud-first infrastructure for scalability, AI-driven route optimisation, a real-time tracking system for customers and drivers, and a mobile app for booking and payment — this is the technology roadmap for delivering the strategy, directly mirroring QuickCart's IT Strategy slide. Each level narrows the one above: the goal sets direction, the strategy sets the competitive approach to get there, and the IT strategy is the concrete technology roadmap that makes the strategy executable — exactly the 'lockstep' relationship the lecture's dashed-line diagram shows between Business Strategy and IT Strategy.",
      },
    ],
  }

export const WEEK_2_PAPERS: ExamPaperSeed[] = [PAPER];
