import type { ExamPaperSeed } from "../types";

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 7,
  paperNumber: 1,
  title: "Week 7 Lecture Practice Paper",
  topics:
    "Professional ethics and responsibility applied to a deployed AI system. A loan-decision model rejects 8% more applicants from one demographic group; the gap is statistically real but causation is unproven. Competing positions: model is accurate (AI team), currently legal (legal team), profitable (business team), disparity real but cause unproven (independent audit). Deciding KEEP vs SUSPEND vs MODIFY as the responsible IT professional; the evidence needed to justify the call; disparate impact vs disparate treatment; proxy variables and indirect discrimination; the professional codes of conduct (ACS, IEEE/ACM) duty to the public interest above employer and self-interest; why 'legal, accurate and profitable' can still be professionally and ethically wrong. Tutorial questions (FinServe case): COBIT governance (EDM) vs management (APO, BAI, DSS, MEA) domains; ITIL v4 Service Value Chain activities, practices and guiding principles vs ITIL v3; incident, problem and change enablement sequence; RACI; governance failures from unclear roles; ADKAR Desire; ITSM focus; moving too fast vs too slow.",
  sourceFiles: [
    "exam-content/info5990/unit_outline.md (LO1: analyse and resolve ethical dilemmas in the IT profession; professional codes of conduct)",
    "User-supplied exam scenario: AI loan system with an 8% higher rejection rate for one demographic group",
    "tutorial/INFO5990 2026-S1 Week 07 Tutorial sheet.pdf (COBIT 2019 and ITIL v4 knowledge check plus the FinServe digital transformation case; questions appended after the Ed Discussion prep question)",
    "exam-content/info5990/week-6-notes.md (COBIT / ITIL v4 facts the tutorial sheet builds on)",
  ],
  questions: [
    {
      type: "scenario",
      prompt:
        "A company's AI system rejects 8% more loan applications from one demographic group.\n\nThe situation is messy:\n\n• The AI team says the model is technically accurate.\n\n• The legal team says it currently complies with the law.\n\n• The business team says switching it off will cost millions.\n\n• An independent audit says the 8% gap is statistically real, but cannot prove the model itself caused it.\n\nThe CEO asks you, as the IT professional, to recommend whether the system keeps running.\n\n• Would you recommend KEEP, SUSPEND or MODIFY — and what evidence would you need to justify that choice professionally?\n\n• Harder: if the system is legal, accurate and profitable, can deploying it still be professionally wrong?",
      modelAnswer:
        "Picture a shop doorway with a stiff turnstile. Nobody told staff to keep anyone out, and no rule is being broken, but wheelchair users get through 8% less often. 'We didn't mean to' does not change the fact that a real group is being shut out. You would loosen the turnstile and investigate while people keep shopping — you would not ignore it, and you would not rip the whole doorway out before you knew what was wrong.\n\n• The recommendation: MODIFY, with a short, time-boxed partial SUSPEND for the affected group if the harm looks serious. 'KEEP and change nothing' ignores a real, measured harm. 'SUSPEND everything indefinitely' throws away a working system before you know it is actually broken and may deny loans to people who would have been approved. MODIFY means keep serving but add a safety net now — for example, send rejected applications from the affected group to a human reviewer — and open a proper investigation.\n\n• Why 'we cannot prove the model caused it' is not a free pass: in fairness law and ethics what matters is disparate impact — the outcome is unequal — not only disparate treatment, which is deliberately using the protected attribute. A model can produce a biased outcome through proxy variables: postcode, school, employment history and spending data can each stand in for the protected group even when that attribute was never an input. 'The group field is not fed to the model' does not clear it.\n\n• Evidence you would need to justify the decision:\n\n• Does the 8% gap already exist in the real world before the model, or is the model widening it?\n\n• Run the model on matched applicants who differ only by group — does the decision flip? That isolates the model's contribution the audit could not.\n\n• Which features drive the rejections for that group, and are any of them proxies for it?\n\n• What do the training labels reflect — past human decisions that were themselves biased?\n\n• What is the cost of a wrong rejection to the applicant, against the cost of a wrong approval to the company?\n\n• Is there a fairness constraint or a reweighting that closes the gap at an acceptable accuracy cost?\n\n• The harder question — yes, it can still be wrong. 'Legal' is the floor, not the goal: the law lags behind technology, and 'not yet illegal' is not the same as 'right'. 'Accurate' means it matches the historical data, and if that history is biased then an accurate model faithfully reproduces the bias. 'Profitable' is the company's interest, not the public's. Professional codes of conduct — the ACS Code, IEEE/ACM — put the public interest and the duty to avoid harm above loyalty to your employer and above your own convenience. If a system quietly disadvantages a group, an IT professional has a duty to raise it, document it and press for a fix; being told 'it is legal and it makes money' does not discharge that duty.\n\nSo the answer is: recommend MODIFY with a targeted human-review safety net now, demand causal evidence that isolates the model from existing real-world gaps, and accept that legal plus accurate plus profitable can still fail the professional obligation to the public.",
    },
    {
      type: "mcq",
      prompt: "FinServe's board is deciding whether the AI chatbot is worth funding at all, how much customer-facing risk the bank will accept, and who gets the budget. In COBIT terms, which area is this decision?",
      options: [
        "Management (APO: Align, Plan, Organise) — the project manager drafting the chatbot's plan and budget lines",
        "Management (BAI: Build, Acquire, Implement) — the team choosing, buying and configuring the chatbot platform",
        "Governance (EDM: Evaluate, Direct, Monitor) — the board setting direction, priorities and risk appetite",
        "Management (DSS: Deliver, Service, Support) — the support team running the chatbot and fixing its incidents"
      ],
      correctIndex: 2,
      modelAnswer: "Think of a football club. The owners decide whether to buy a new stadium and how much debt they will risk. The coaches and groundskeepers then plan, build and run it. Deciding whether and how much to bet is the owners' job, not the workers'.\n\n• Governance (EDM): Evaluate needs and risks, Direct priorities and resources, Monitor results. It asks: are we doing the right things? It belongs to the board and executives.\n\n• Management (APO, BAI, DSS, MEA): the managers and teams who plan, build, run and monitor. They ask: are we doing things the right way?\n\n• Why the others are wrong: planning the project, building the platform and running it day to day are all management work that happens after the board has decided.\n\nSo the answer is: choosing whether to fund the chatbot and how much risk to accept is Governance, the EDM part of COBIT (Control Objectives for Information and related Technologies)."
    },
    {
      type: "multi",
      prompt: "FinServe maps its cloud migration onto the ITIL v4 Service Value Chain (the six-activity model showing how value is created end to end). Select ALL the pairings that are correct.",
      options: [
        "Handling customer tickets about failed app logins after go-live — Obtain/Build",
        "Building and configuring the new cloud environment — Deliver & Support",
        "Testing the migrated loan system and preparing a safe staged release — Design & Transition",
        "Agreeing the 18-month cloud roadmap and priorities — Plan",
        "Collecting customer and staff feedback on the new mobile banking app — Engage"
      ],
      correctIndices: [
        2,
        3,
        4
      ],
      modelAnswer: "Picture building a new restaurant. First you plan the menu and budget, then you talk to the neighbours, then you design and trial-run the kitchen, then you buy and fit the equipment, then you serve customers, and you keep improving. Each step has a name, and mixing up building with serving is the classic mistake.\n\n• Plan: agree the direction, roadmap and priorities.\n\n• Engage: understand stakeholder needs and keep good relationships, for example gathering feedback.\n\n• Design & Transition: design the service, then test and release it safely into live use.\n\n• Obtain/Build: get and configure the components, such as the cloud environment. That is why 'building the cloud environment' is Obtain/Build, not Deliver & Support.\n\n• Deliver & Support: run the live service and help users, such as answering login tickets. The sixth activity, Improve, keeps making it better.\n\nSo the answer is: Plan, Design & Transition and Engage are matched correctly, while the other two pairings have Obtain/Build and Deliver & Support swapped."
    },
    {
      type: "mcq",
      prompt: "FinServe's new chatbot starts giving customers wrong loan-fee answers. The service desk apologises and applies a quick workaround. Later the team finds the cause is a faulty training document, and the fix must go live without disturbing other services. Which ITIL v4 practices apply, in order?",
      options: [
        "Incident management, then problem management, then change enablement",
        "Problem management, then incident management, then change enablement",
        "Incident management, then change enablement, then problem management",
        "Change enablement, then incident management, then problem management"
      ],
      correctIndex: 0,
      modelAnswer: "When a car breaks down on the highway, the tow truck gets you moving again first. Later the mechanic works out why it broke. Finally the garage schedules the repair so it does not cause a bigger mess.\n\n• Incident management: restore service quickly, even with a temporary workaround.\n\n• Problem management: find and remove the root cause so it does not happen again.\n\n• Change enablement: approve and release the permanent fix safely so it does not break anything else.\n\n• Why the others are wrong: you cannot investigate a root cause before there is an incident, and you cannot release a fix before you know what the cause is.\n\nSo the answer is: incident management, then problem management, then change enablement."
    },
    {
      type: "multi",
      prompt: "FinServe never clearly assigns who owns what across its cloud, AI and compliance work. Select ALL the governance failure risks this creates.",
      options: [
        "The chosen cloud provider suffers a regional outage during the migration",
        "ASIC and APRA compliance reports slip because each team assumes another team owns them",
        "Nobody is clearly accountable when the chatbot gives wrong advice, so the problem bounces between teams",
        "IT projects drift away from business goals and are abandoned halfway, repeating the earlier CRM failure",
        "Digital-native fintech competitors launch a cheaper mobile banking app"
      ],
      correctIndices: [
        1,
        2,
        3
      ],
      modelAnswer: "Imagine a group project where nobody knows who is writing which section. Sections are missed, two people write the same thing, and when the teacher complains everyone points at someone else. The chaos comes from unclear ownership, not from bad luck.\n\n• Why it happens: without defined roles, responsibilities and accountability, there is no owner for decisions, risks or compliance duties.\n\n• What it looks like: missed regulatory deadlines, unowned incidents, and projects pursued without business alignment or executive backing.\n\n• Why the others are wrong: a vendor outage and competitor moves are real risks, but they happen with or without clear roles. They are technical and market risks, not role-clarity failures.\n\nSo the answer is: unowned chatbot errors, missed compliance reports and misaligned, abandoned projects are the governance failure risks."
    },
    {
      type: "mcq",
      prompt: "For FinServe's automated ASIC and APRA compliance reporting, the compliance analyst prepares the report every month. The CIO signs it off and answers to the board if it is wrong. In a RACI chart, who is who?",
      options: [
        "The analyst is Accountable (owns the outcome) and the CIO is Responsible (does the work)",
        "The analyst is Consulted (gives input) and the CIO is Informed (is kept up to date)",
        "The analyst is Responsible (does the work) and the CIO is Consulted (gives input)",
        "The analyst is Responsible (does the work) and the CIO is Accountable (owns the outcome)"
      ],
      correctIndex: 3,
      modelAnswer: "In a kitchen the cook makes the dish and the head chef puts their name on it and takes the blame if it is bad. The cook does the work. The head chef answers for the result.\n\n• Responsible: the person or team who actually does the task.\n\n• Accountable: the one owner who signs off and is answerable for the outcome.\n\n• Consulted: gives input before a decision. Informed: kept up to date afterwards.\n\n• Why the others are wrong: the CIO is not merely giving input or being told, and the analyst does not own the board-level answer.\n\nSo the answer is: analyst Responsible, CIO Accountable. RACI stands for Responsible, Accountable, Consulted, Informed."
    },
    {
      type: "truefalse",
      prompt: "True or false? ITIL v4 is mainly a governance framework that asks 'are we doing the right things?', while COBIT is mainly about how to deliver and support IT services day to day.",
      options: [
        "True",
        "False"
      ],
      correctIndex: 1,
      modelAnswer: "Mixing these up is like swapping the job of the board and the service desk. One decides direction and controls risk, the other runs the help line.\n\n• COBIT: governance and management framework focused on alignment, control, value and risk. It answers what should be done and who oversees it.\n\n• ITIL v4: best-practice framework for IT service management. It answers how services are designed, delivered and supported.\n\n• Level: COBIT is strategic and tactical, ITIL is operational and tactical.\n\nSo the answer is: false. The statement has the two frameworks the wrong way round."
    },
    {
      type: "mcq",
      prompt: "Which statement correctly describes how ITIL v4 differs from ITIL v3?",
      options: [
        "The v3 guiding principles grew from seven to nine in v4 so that value creation is covered more fully",
        "The v3 processes and five-stage lifecycle became practices inside a Service Value System with a six-activity value chain",
        "The v3 practices were replaced by fixed processes in v4 to make service delivery more predictable",
        "ITIL v4 dropped Agile and DevOps ideas and went back to a strict, sequential service lifecycle"
      ],
      correctIndex: 1,
      modelAnswer: "Think of an old paper recipe book that must be followed step by step, replaced by a flexible cooking system where you mix and match techniques to suit the meal. Same kitchen, far more adaptable.\n\n• v3 (2007): a five-stage Service Lifecycle with processes and nine guiding principles.\n\n• v4 (2019): a Service Value System with guiding principles, governance, the Service Value Chain of six activities, practices (34 of them) and continual improvement.\n\n• v4 also added the four dimensions and pulled in Agile, Lean and DevOps. It has seven guiding principles, down from nine.\n\n• Why the others are wrong: they reverse the principle count, reverse practices and processes, and claim v4 dropped Agile.\n\nSo the answer is: v3's lifecycle and processes became a Service Value System with a value chain and practices."
    },
    {
      type: "multi",
      prompt: "Select ALL of the following that are ITIL v4 guiding principles.",
      options: [
        "Start where you are",
        "Cover the enterprise end to end",
        "Optimize and automate",
        "Separate governance from management",
        "Focus on value"
      ],
      correctIndices: [
        0,
        2,
        4
      ],
      modelAnswer: "Imagine two rulebooks in the same school library, one for how the school is governed and one for running the help desk. Their rules sound similar, so students grab lines from the wrong one.\n\n• ITIL v4's seven guiding principles: Focus on value; Start where you are; Progress iteratively with feedback; Collaborate and promote visibility; Think and work holistically; Keep it simple and practical; Optimize and automate.\n\n• 'Separate governance from management' and 'cover the enterprise end to end' are COBIT 5 principles, from a different framework.\n\nSo the answer is: Focus on value, Start where you are and Optimize and automate are ITIL v4 principles. The other two belong to COBIT."
    },
    {
      type: "mcq",
      prompt: "FinServe's leaders argue over the bigger risk: moving too fast on cloud and AI without governance, or moving too slowly and losing customers to fintechs. Which position do the tutorial's frameworks best support?",
      options: [
        "Move as fast as possible, because losing customers to fintechs is a bigger risk than any governance gap",
        "Move iteratively with governance checkpoints, so speed continues but each release is checked for value and risk",
        "Pause every project until COBIT 2019 is fully in place across the whole company before continuing",
        "Skip pilots and go straight to the full rollout because the failed CRM upgrade shows pilots waste time"
      ],
      correctIndex: 1,
      modelAnswer: "Learning to drive, you do not refuse to leave the driveway, and you do not floor it on the first day. You drive in small steps, checking the mirrors as you go.\n\n• Too fast: FinServe already failed once with an over-budget CRM upgrade, and a failed rollout in a regulated bank risks fines and lost trust.\n\n• Too slow: waiting for perfect governance lets digital-native competitors take customers.\n\n• The balance: ITIL v4's 'progress iteratively with feedback' and COBIT's evaluate, direct and monitor cycle. Small governed steps keep both speed and control.\n\nSo the answer is: neither extreme. Move in small, governed, feedback-driven steps."
    },
    {
      type: "mcq",
      prompt: "FinServe staff know the cloud and chatbot are coming and understand why. But many fear automation will take their jobs and quietly stop engaging. Which ADKAR building block is missing?",
      options: [
        "Awareness — understanding why the change is happening",
        "Knowledge — knowing how to work in the new way",
        "Reinforcement — being rewarded for sustaining the change",
        "Desire — the personal motivation to support the change"
      ],
      correctIndex: 3,
      modelAnswer: "You know exactly why the gym membership is good for you and how the machines work, but you are scared you will look silly, so you never go. Knowing is not wanting.\n\n• ADKAR (Awareness, Desire, Knowledge, Ability, Reinforcement) works in order for each individual.\n\n• Awareness is already met: staff know the changes and reasons.\n\n• Desire is the gap: fear of job loss blocks the motivation. It is fixed by showing personal and organisational benefits.\n\n• Why the others are wrong: Knowledge and Ability come after Desire, and Reinforcement comes last.\n\nSo the answer is: Desire. The staff's fear needs to be addressed before training will help."
    },
    {
      type: "mcq",
      prompt: "Which option best describes what IT service management (ITSM) focuses on?",
      options: [
        "Managing IT as a set of services that deliver value to customers, through processes, people and services",
        "Aligning IT investment with board-level strategy, risk appetite and stakeholder value",
        "Controlling technology purchases and setting infrastructure standards across the company",
        "Building, testing and releasing software faster by automating the development pipeline"
      ],
      correctIndex: 0,
      modelAnswer: "A restaurant is judged on the meals customers enjoy, not on how fancy the oven is. ITSM cares about the meal, meaning the service the customer receives.\n\n• ITSM manages IT as services that create value for internal or external customers.\n\n• Its focus is on processes (how IT is delivered), people (who use and support IT) and services (the outcomes IT provides), not only the technology.\n\n• Why the others are wrong: the first is governance (COBIT territory), the second is technology-centric which is what ITSM moved away from, the third describes DevOps automation.\n\nSo the answer is: managing IT as value-delivering services through processes, people and services."
    },
    {
      type: "mcq",
      prompt: "FinServe's steering committee lists COBIT's four management domains. Which list is correct?",
      options: [
        "EDM (Evaluate, Direct, Monitor), APO (Align, Plan, Organise), BAI (Build, Acquire, Implement), DSS (Deliver, Service, Support)",
        "Service Strategy, Service Design, Service Transition, Service Operation, plus Continual Service Improvement",
        "APO (Align, Plan, Organise), BAI (Build, Acquire, Implement), DSS (Deliver, Service, Support), MEA (Monitor, Evaluate, Assess)",
        "Plan, Improve, Engage, Design and Transition, Obtain or Build, plus Deliver and Support"
      ],
      correctIndex: 2,
      modelAnswer: "A company has a board room and four departments below it. The board room (EDM) is separate from the four departments (APO, BAI, DSS, MEA) that do the managing.\n\n• COBIT's governance objectives are EDM only. Its management objectives are the four domains APO, BAI, DSS and MEA (often remembered as Plan, Build, Run, Monitor).\n\n• Why the others are wrong: the first list puts EDM (governance) inside the management domains and leaves out MEA. The other two are ITIL lists: the v3 lifecycle and the v4 Service Value Chain.\n\nSo the answer is: APO, BAI, DSS and MEA are the four management domains, and EDM is the separate governance part."
    },
  ],
};

const CHANGE_LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 7,
  paperNumber: 2,
  title: "Week 7 Change Management Lecture Practice Paper",
  topics:
    "Organisational Change Management (OCM): project management vs change management (system readiness vs people adoption, measures of success); the three states of change (current, transition, future); the Kubler-Ross change curve stages and the change management response to each, including the reading's evolved model and limitations; psychology of change (fear of the unknown, loss aversion, cognitive dissonance, status quo bias, social proof) and Diffusion of Innovation; change roles, core principles and practical strategies (stakeholder mapping, change agents network, quick wins); business and IT outcomes of change management; McKinsey 7S (hard vs soft S's), ADKAR and Kotter's 8 steps, top-down vs bottom-up, and choosing between models; Alpha Manufacturing ERP case study.",
  sourceFiles: [
    "lecture/INFO5990 2026-S2 Week 07 - Organisational Change Management.pdf",
    "lecture/Reading 1 - Kubler Ross Change curve in the workplace.pdf",
    "lecture/Week 07 - Profession-s1-low.transcript.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt: "A university's new online learning system goes live on time, on budget and to scope. Three months later most staff still use email and old spreadsheets. Which statement is correct?",
      options: [
        "The project succeeded overall, because on-time and on-budget delivery is what defines success for an IT project",
        "Project management failed, because a system nobody uses was never really delivered to the technical scope",
        "Project management succeeded on its own measures, but change management has not yet delivered adoption",
        "Change management succeeded, because the people side is only judged on whether training sessions were held"
      ],
      correctIndex: 2,
      modelAnswer: "A restaurant can build a beautiful kitchen on time and on budget, but if no customers walk in, the owner is not happy. Building the kitchen and filling the seats are two different jobs.\n\n• Project management ensures the technical side is delivered. Its success is measured by time, cost, scope and quality.\n\n• Change management ensures the people side is managed. Its success is measured by whether people use the system confidently, competently and consistently.\n\n• Why the others are wrong: the lecturer says a project can finish successfully while the organisational change still fails. Adoption, not training attendance, is the change management measure.\n\nSo the answer is: project management met its goals, but the change has failed until people actually adopt the system."
    },
    {
      type: "multi",
      prompt: "Select ALL the activities that mainly belong to change management, rather than project management.",
      options: [
        "Scheduling vendor deliverables and adjusting the plan when a milestone slips",
        "Tracking spend against the approved budget and reporting variances to the sponsor",
        "Designing coaching and short training courses to build staff confidence",
        "Tracking how many staff use the new system and whether old habits return",
        "Running workshops that let staff voice their concerns about the new system"
      ],
      correctIndices: [
        2,
        3,
        4
      ],
      modelAnswer: "On a school trip, the organiser books the bus and tracks the money, while the teacher worries about whether the nervous kids are actually ready to go. One handles logistics, the other handles the people.\n\n• Project management scope: planning, scheduling, budgeting, risk, resources and deliverables.\n\n• Change management scope: communication, training, stakeholder management and resistance, managing the move from the old way of working to the new way.\n\n• Why the others are wrong: budget tracking and vendor scheduling are classic project management work, even though both teams work on the same project.\n\nSo the answer is: workshops for concerns, training and coaching, and adoption tracking are change management."
    },
    {
      type: "truefalse",
      prompt: "True or false? Because an IT project can finish on time, on budget and to scope, the organisation has automatically achieved successful change.",
      options: [
        "True",
        "False"
      ],
      correctIndex: 1,
      modelAnswer: "Finishing a race does not mean you won. Crossing the line is delivery. Winning is people actually using what was delivered.\n\n• The lecture's key idea: a project can finish successfully, but the organisational change can still fail if users do not adopt it.\n\n• Without adoption, business value is never realised: the new system sits unused, shadow IT appears and money is wasted.\n\nSo the answer is: false. Delivery is not the same as adoption."
    },
    {
      type: "mcq",
      prompt: "A company has switched off half of the old system, but the new one is not yet stable. Staff are confused, making more mistakes, and productivity has dropped. Which state of change is this, and why is it considered the riskiest?",
      options: [
        "The transition state, the messy middle where old ways are abandoned before the new ways are stable",
        "The current state, because staff are stuck in their comfort zone and refuse to leave the old system",
        "The future state, because the new reality is not well understood and people cannot yet see the benefits",
        "The transition state, but it is low risk because temporary confusion always fixes itself without support"
      ],
      correctIndex: 0,
      modelAnswer: "Moving house: the old flat is half empty and the new one is full of unopened boxes. You cannot find the kettle and everything takes longer. That middle bit is where things get lost or broken.\n\n• Current state: where the organisation is today, the comfort zone with familiar processes.\n\n• Transition state: the messy middle with stress, anxiety and mistakes, so it is the riskiest.\n\n• Future state: the desired new reality, fully adopted and embedded.\n\n• Why the others are wrong: this scenario is neither the comfort zone nor the finished result, and the lecture says the transition needs communication, training and support, not just waiting.\n\nSo the answer is: the transition state, which is the riskiest because of the confusion, mistakes and productivity drop."
    },
    {
      type: "mcq",
      prompt: "During a CRM rollout a senior developer says, 'Why are we being forced to use this? Management does not understand our work!' Which change curve stage is this, and what is the best change management response?",
      options: [
        "Shock and denial — provide clear information about why the change is happening and what it will involve",
        "Bargaining — set out the non-negotiables and offer a few small flexibilities where possible",
        "Depression — offer training, coaching and peer support and share quick wins to rebuild confidence",
        "Anger — encourage listening and empathy and give people a safe channel to voice their concerns"
      ],
      correctIndex: 3,
      modelAnswer: "When someone is furious, arguing back makes it worse. Letting them vent to someone who really listens calms them down. The lecturer's point: as people keep speaking, their anger level drops.\n\n• Anger sounds like blame: 'why are we forced', 'management does not understand'.\n\n• The right response is listening, empathy and a safe place to speak, for example roundtables or feedback sessions.\n\n• Why the others are wrong: each of them is the right response, but to a different stage. Information suits denial, non-negotiables suit bargaining, and training suits depression.\n\nSo the answer is: anger, handled by listening with empathy and providing a safe channel to voice concerns."
    },
    {
      type: "mcq",
      prompt: "After a new CRM is announced, a team lead asks, 'Can't we keep the old CRM for some tasks, or run both in parallel for a while?' What is the best response from the change team?",
      options: [
        "Agree to run both systems indefinitely, since flexibility is the surest way to keep every employee content",
        "Be clear about the non-negotiables and offer small, time-limited flexibilities, such as a short parallel-running period",
        "Ignore the request and repeat the announcement, because clear information solves every objection at this stage",
        "Send the team lead to coaching sessions, because the request means they have lost hope and need support"
      ],
      correctIndex: 1,
      modelAnswer: "A kid who is told to tidy their room says, 'Can I do it after dinner?' A good parent keeps the main rule but gives a bit of room. Giving in totally means the room never gets cleaned.\n\n• This is bargaining: people try to negotiate a compromise and find the path of least objection.\n\n• The change team should provide clarity on what is non-negotiable and offer small flexibilities where possible, for example both systems working for the next three months.\n\n• Why the others are wrong: running both forever defeats the change, repeating information suits denial, and coaching for lost hope suits depression.\n\nSo the answer is: state the non-negotiables and offer small, limited flexibilities."
    },
    {
      type: "mcq",
      prompt: "Two months into an ERP rollout, an employee says, 'This is too hard. My productivity has dropped and I cannot keep up.' What should the change team focus on?",
      options: [
        "Clear announcements about why the ERP is happening, to fix the shock the employee is still feeling",
        "Training, coaching and peer support, plus quick wins that rebuild confidence",
        "A safe channel for the employee to vent frustration about management until the anger fades",
        "Recognition and rewards for the employee, to reinforce the behaviour and embed the change in culture"
      ],
      correctIndex: 1,
      modelAnswer: "A player who keeps losing and starts thinking they are no good needs a coach, some drills, and a small win. A pep-talk about why the league exists does not help.\n\n• Depression in the change curve: people lose hope, feel they cannot cope, and productivity is at its lowest.\n\n• The lecture's response: offer training, coaching and peer support, and share quick wins to rebuild confidence.\n\n• The reading adds: reassure people that this is normal and others feel the same, and build an individual support plan.\n\n• Why the others are wrong: explaining why fits denial, listening fits anger, and reinforcing and celebrating fits acceptance.\n\nSo the answer is: depression, so give training, coaching, peer support and quick wins."
    },
    {
      type: "multi",
      prompt: "Based on the Kübler-Ross change curve reading, select ALL the statements that are TRUE.",
      options: [
        "A limitation is that different employees move at different speeds, and not everyone goes through every stage",
        "Later versions added experimentation, decision and integration after depression, and stages can overlap or cycle",
        "Every employee moves through the five stages once, in a strict order, at the same pace as their colleagues",
        "The model grew out of Kübler-Ross's 1969 five stages of grief, which were observed in terminally ill patients",
        "Productivity is at its lowest in the depression stage, while bargaining may raise it briefly",
        "The model was built from studies of corporate software rollouts, so it needs no adaptation for workplace change"
      ],
      correctIndices: [
        0,
        1,
        3,
        4
      ],
      modelAnswer: "A weather forecast says what usually happens, not what will happen to each person. The change curve is a useful map, not a train timetable.\n\n• Origin: Kübler-Ross's five stages of grief (1969). That is also a limitation, because it was not created with corporate change in mind.\n\n• Evolution: experimentation, decision and integration follow the depression stage, and the journey can overlap or cycle, with people regressing.\n\n• Limitations: people adapt at different speeds, which complicates planning, and not every individual goes through every stage.\n\n• Productivity: depression is the lowest point, while bargaining can lift it briefly but only because people fixate on small tasks.\n\n• Why the last two are wrong: they claim a strict order at the same pace, and a corporate origin that does not fit the reading.\n\nSo the answer is: the first four statements are true."
    },
    {
      type: "mcq",
      prompt: "A few weeks after accepting a new workflow, an employee tries it, sometimes slips back to the old way, then tries again and finally settles on it. According to the reading, which idea does this best show?",
      options: [
        "The original five-stage grief model, where each stage happens once in a strict linear order",
        "Bargaining, because the employee is negotiating with the change by mixing old and new methods",
        "A failure of the change curve, because a person who regresses proves the stages do not apply",
        "The evolved curve, where experimentation leads to decision and integration, and people can regress and move forward"
      ],
      correctIndex: 3,
      modelAnswer: "Learning to ride a bike: you wobble, put your foot down, try again, and eventually it clicks. Falling back once does not mean you have failed.\n\n• The reading says Kübler-Ross later developed post-depression stages: experimentation, decision and integration.\n\n• The evolved model is non-linear. Stages overlap, the journey can be cyclical, and experimentation may send people back to earlier stages or forward to decision.\n\n• Why the others are wrong: the linear model does not allow regression, and regression does not disprove the model.\n\nSo the answer is: the evolved curve, where experimentation can regress or advance towards decision and integration."
    },
    {
      type: "mcq",
      prompt: "A CIO insists the ERP rollout is only a success if every employee fully supports it before go-live. What is the most professional response?",
      options: [
        "Aim to move the majority from resistance to commitment, and expect that a few people will never support the change",
        "Delay go-live until the last critic has been persuaded, since resistance from anyone is a warning sign of a flawed plan",
        "Enforce the change on everyone at once, since resistance is best handled by removing the choice to resist",
        "Support only the early adopters, since the others will follow automatically once the new system is running"
      ],
      correctIndex: 0,
      modelAnswer: "No school trip ever gets 100% of students excited. You aim to get most of them on the bus and keep the door open for the rest.\n\n• Lecture: employee resistance is the norm, not the exception. Expect some to never support the change.\n\n• Success depends on moving the majority from resistance to commitment efficiently.\n\n• Why the others are wrong: waiting for unanimity never ends, and forcing the change badly damages motivation, since the lecturer warns enforcement will not give the output you want.\n\nSo the answer is: aim for the majority and accept that some will never be convinced."
    },
    {
      type: "mcq",
      prompt: "After years of clicking one button to clock in, staff must now scan a fingerprint and confirm a photo. They complain that it clashes with everything they are used to. Which psychological response fits best?",
      options: [
        "Fear of the unknown — worry about what the change means for their jobs",
        "Loss aversion — valuing what they already have more than what they might gain",
        "Cognitive dissonance — a conflict between old habits and new expectations",
        "Status quo bias — a general preference to keep things as they are"
      ],
      correctIndex: 2,
      modelAnswer: "A left-handed person handed right-handed scissors: every cut feels wrong because years of habit fight the new tool. That clash is the problem, not the scissors.\n\n• Cognitive dissonance: the conflict between long-standing habits and the new expectations, as in the lecture's clock-in example.\n\n• Why the others are wrong: fear of the unknown is about the job and future, loss aversion is about giving up something valued, and status quo bias is a general preference for how things are.\n\nSo the answer is: cognitive dissonance."
    },
    {
      type: "mcq",
      prompt: "A trial shows a new tool saves staff an hour a week, yet one team refuses it, saying, 'We have built real expertise in the old tool and don't want to give that up for something that might be better.' Which response explains their reasoning best?",
      options: [
        "Status quo bias — they simply prefer things to stay as they are, without weighing any losses",
        "Social proof — they are waiting until their peers have adopted the tool successfully first",
        "Loss aversion — they weigh what they would lose more heavily than what they might gain",
        "Fear of the unknown — they are worried about what the tool will mean for their job security"
      ],
      correctIndex: 2,
      modelAnswer: "Kids who will not swap a scruffy old toy for a shiny new one, because they are attached to what they already have. It is about giving something up, not just liking things the same.\n\n• Loss aversion: people value what they already have more than what they might gain.\n\n• Status quo bias: a plain preference for keeping things as they are. The team here is naming a specific loss (their expertise).\n\n• Why the others are wrong: nobody mentions waiting for peers (social proof), and nobody mentions their job being at risk.\n\nSo the answer is: loss aversion."
    },
    {
      type: "multi",
      prompt: "Select ALL the pairings of employee comment and psychological response that are correct.",
      options: [
        "'The old process and the new one contradict each other and I cannot switch' — fear of the unknown",
        "'I have always done it this way and see no reason to change' — social proof",
        "'What will this mean for my job?' — fear of the unknown",
        "'I would rather keep what I have than risk something worse' — loss aversion",
        "'Once I saw my colleagues finishing tasks in ten minutes, I decided to try it too' — social proof"
      ],
      correctIndices: [
        2,
        3,
        4
      ],
      modelAnswer: "Think of five different reasons a friend might refuse to try a new food: worried what will happen to them, attached to their old favourite, waiting to see others eat it, clashing habits, or just liking things the same. Each has its own name.\n\n• Fear of the unknown: worry about what the change means for me.\n\n• Loss aversion: valuing what I have over what I might gain.\n\n• Social proof: adopting because peers already are.\n\n• Status quo bias: keep things as they are. Cognitive dissonance: old habits conflict with new expectations.\n\n• Why the last two are wrong: the 'always done it this way' comment is status quo bias, and the habits-clash comment is cognitive dissonance.\n\nSo the answer is: the first three pairings are correct."
    },
    {
      type: "mcq",
      prompt: "A change manager plans for the different adoption speeds across 1,000 employees. Which pairing of group and best approach follows Diffusion of Innovation as taught in the lecture?",
      options: [
        "The majority wait for proof of benefits, so show visible results, while laggards fear loss and need strong support",
        "Early adopters wait for proof of benefits, so show visible results, while laggards are motivated by innovation",
        "The majority fear loss and need strong support, while laggards wait for proof of benefits from their peers",
        "Laggards are curious and motivated by innovation, so use them as trainers, while early adopters need strong support"
      ],
      correctIndex: 0,
      modelAnswer: "At a new restaurant, the first few diners try it because they love trying new things. Most people wait for good reviews. A small group only comes if dragged along, because they are worried about missing their usual place.\n\n• Early adopters: curious and motivated by innovation.\n\n• Majority: wait until they see proof of benefits.\n\n• Laggards: fear loss and need strong support to shift.\n\n• The lecture's point: everyone adapts at a different pace, so set goals accordingly and do not expect the whole company to move at once.\n\nSo the answer is: the majority need proof, and laggards need strong support."
    },
    {
      type: "mcq",
      prompt: "A bank wants staff to adopt a new workflow faster and get some peer influence going. Which plan does this best?",
      options: [
        "Send a company-wide email from the CEO explaining the workflow and set a hard deadline for adoption",
        "Hold one large training day for everyone at the same time, so all staff learn at the same pace",
        "Ask the IT department to switch off the old workflow on day one so there is no other choice",
        "Train respected staff in each department first and let them support and inspire their peers on the job"
      ],
      correctIndex: 3,
      modelAnswer: "In a new school, the popular kid who joins the chess club makes ten others sign up. A notice board never does that.\n\n• Change agents network: identify respected staff in each department, train them, and let them support peers, because peer influence accelerates adoption.\n\n• This uses social proof: people adopt faster when they see colleagues doing so.\n\n• Why the others are wrong: an email and a deadline are one-way instructions, one large session ignores different paces, and switching off the old system is enforcing change, which the lecturer warns against.\n\nSo the answer is: a change agents network of trained, respected peers."
    },
    {
      type: "mcq",
      prompt: "During an ERP change, executives still use the old reports themselves, and middle managers tell their teams, 'Just do whatever head office says.' Which of the following best describes the problem?",
      options: [
        "There is no structured process, because no framework such as ADKAR or Kotter has been chosen for the change",
        "Visible sponsorship and coaching are missing, so staff will not take the change seriously",
        "There is no communication plan, because the messages are not tailored to executives, managers and end-users",
        "There is no change agents network, because no respected staff in each department have been trained yet"
      ],
      correctIndex: 1,
      modelAnswer: "If the head coach is seen skipping the new training drills, the team assumes the drills do not matter.\n\n• Employee-facing roles: executives and senior leaders are the decision makers who sponsor the change, and middle managers and supervisors act as coaches.\n\n• Visible and active sponsorship is not only desirable but necessary for success.\n\n• Why the others are wrong: those gaps may also exist, but the scenario describes leaders and managers not modelling or coaching the change.\n\nSo the answer is: missing visible leadership sponsorship and manager coaching."
    },
    {
      type: "multi",
      prompt: "Select ALL the situations that violate a core principle of effective change management.",
      options: [
        "A manager answers 'why this system?' with 'it came from higher management, so nothing can be done'",
        "The team mixes many one-off tactics rather than following a proven framework such as ADKAR or Kotter",
        "A respected user from each department is trained to help peers and share feedback",
        "A pilot with one department is run first, and feedback is used to adjust the rollout plan",
        "Support ends after the first month, and staff have nowhere to take questions after that"
      ],
      correctIndices: [
        0,
        1,
        4
      ],
      modelAnswer: "A sports team without a clear goal, a coach who shows up, and a plan will lose, however talented the players.\n\n• The five core principles: clarity of purpose, leadership commitment, stakeholder engagement, structured process and continuous support.\n\n• 'Because higher management said so' breaks clarity of purpose. Support ending after a month breaks continuous support. Mixing tactics without a framework breaks structured process.\n\n• Why the others are wrong: peer champions and feedback-driven pilots are recommended strategies (change agents network, quick wins and iterative delivery).\n\nSo the answer is: the first three situations violate the principles."
    },
    {
      type: "mcq",
      prompt: "A respected senior architect openly opposes the new platform and other engineers listen to her. What does the lecture recommend?",
      options: [
        "Leave her until the end, since it is easier to win over the majority first and let her follow once the change is proven",
        "Identify high-influence, low-support people like her early and try to turn them into champions, or at least neutralise the risk",
        "Focus all effort on low-influence, high-support staff, since they are the easiest to convert to champions",
        "Communicate only through a single company-wide announcement, so that no individual is treated differently"
      ],
      correctIndex: 1,
      modelAnswer: "If the loudest, most respected kid in class is against a plan, winning them over first often brings the rest along. Ignoring them means they might rally everyone against it.\n\n• Stakeholder mapping: identify high-influence, low-support individuals early.\n\n• Convert them into champions or neutralise the risks, because their influence spreads to others.\n\n• Why the others are wrong: delaying leaves influential opposition free to grow, and the lecturer warns that resistance from key people drives stress.\n\nSo the answer is: engage high-influence, low-support stakeholders early and try to convert them."
    },
    {
      type: "multi",
      prompt: "Select ALL the outcomes that are IT outcomes of successful change management (as opposed to business outcomes).",
      options: [
        "Customer satisfaction: better service delivery and quicker response times",
        "Employee engagement: staff feel supported and involved, with lower turnover",
        "Process compliance: whether new workflows are followed or people revert",
        "Adoption rate: the percentage of users actively using the new system",
        "System utilisation: how deeply features are used, not just basic functions"
      ],
      correctIndices: [
        2,
        3,
        4
      ],
      modelAnswer: "A school reports two things about a new library app: how many students use it and how deeply (technology numbers), and whether grades and happiness improved (school outcomes). Both matter but they are different.\n\n• IT outcomes: adoption rates, system utilisation, process compliance and governance alignment (for example with ITIL Change Enablement).\n\n• Business outcomes: higher productivity, customer satisfaction, employee engagement and innovation readiness.\n\n• Why the others are wrong: engagement and customer satisfaction are real benefits, but they are business outcomes.\n\nSo the answer is: adoption rate, system utilisation and process compliance are the IT outcomes."
    },
    {
      type: "multi",
      prompt: "Select ALL the elements that are SOFT S's in McKinsey's 7S model.",
      options: [
        "Style",
        "Structure",
        "Shared values",
        "Systems",
        "Skills"
      ],
      correctIndices: [
        0,
        2,
        4
      ],
      modelAnswer: "Like a sports team: the tactics board, the team roster chart and the training equipment are on paper (hard), while team spirit, players' abilities and the coach's approach are harder to see (soft).\n\n• Hard S's, easier to identify and manage: Strategy, Structure, Systems.\n\n• Soft S's, harder to define but critical: Shared values (the central point), Skills, Style, Staff.\n\n• Why the others are wrong: structure (hierarchy and reporting lines) and systems (processes, workflows, IT systems) are hard S's.\n\nSo the answer is: shared values, skills and style are soft S's."
    },
    {
      type: "mcq",
      prompt: "An organisation has a clear strategy and a new ERP system, but staff lack the capability to use it and the project is stalling. Using McKinsey's 7S, what does this show?",
      options: [
        "A misalignment between Strategy and Structure, because the reporting lines have not yet been redrawn",
        "A failure of the Systems element alone, because the ERP itself has not been configured properly yet",
        "A gap in the Shared Values element only, because staff have not yet accepted the change vision",
        "A misalignment between the hard elements and the soft element Skills, which the model helps to diagnose"
      ],
      correctIndex: 3,
      modelAnswer: "A team with a brilliant game plan and new kit will still lose if the players have never learned the moves. The plan is fine; the players' skills are the gap.\n\n• 7S has seven interdependent elements: three hard (Strategy, Structure, Systems) and four soft (Shared values, Skills, Style, Staff).\n\n• It is useful for diagnosing why change is stalling, and it identifies misalignments such as a great strategy but no skills to execute it.\n\n• Why the others are wrong: the scenario says strategy and system exist. The missing piece is skills.\n\nSo the answer is: a misalignment between the hard elements and Skills."
    },
    {
      type: "mcq",
      prompt: "A company buys a complex firewall. Everyone knows why, and staff want it, but nobody can configure it. Later, after a training course, staff still cannot manage it without help. Which ADKAR block is missing at each point?",
      options: [
        "First Knowledge (they have not been taught how), then Ability (they cannot yet apply it without practice and coaching)",
        "First Awareness (they do not know why), then Desire (they are not yet motivated to support the change)",
        "First Ability (they cannot apply it), then Knowledge (they still need to know how to configure it)",
        "First Knowledge (they have not been taught how), then Reinforcement (nobody is rewarding them for using it)"
      ],
      correctIndex: 0,
      modelAnswer: "Watching a video on how to swim is not the same as being able to swim. First you need to be taught, and then you need to practise in the water with someone helping.\n\n• Knowledge: training and communication give people the how-to, including skills, tools and understanding.\n\n• Ability: people apply the knowledge and perform in the new way. This needs practice, coaching and support.\n\n• The lecture's firewall example: complex configurations mean you must train people before you bring the change.\n\n• Why the others are wrong: Awareness and Desire are already met, and Reinforcement comes only after Ability.\n\nSo the answer is: Knowledge first, then Ability."
    },
    {
      type: "mcq",
      prompt: "Six months after a CRM rollout, staff attended the training and can use the system, but they are slipping back to the old spreadsheets. Which ADKAR step is missing, and what fixes it?",
      options: [
        "Ability — more practice and coaching, because people who can use the system have not yet mastered it",
        "Awareness — a repeated explanation of why the change is happening now rather than later",
        "Reinforcement — recognition, rewards and performance tracking to prevent slipping back into old habits",
        "Desire — a strong personal benefit story, because staff clearly do not want to use the new system"
      ],
      correctIndex: 2,
      modelAnswer: "Once you learn to brush your teeth, it only sticks if you keep doing it. Without a routine or a reward, old habits creep back.\n\n• Reinforcement is the last ADKAR step: sustain change through recognition, rewards and performance tracking.\n\n• The scenario says people can already use the system, so knowledge and ability are met, and the issue is slipping back.\n\n• Why the others are wrong: they are earlier steps, and staff have already shown they can use the system.\n\nSo the answer is: Reinforcement."
    },
    {
      type: "multi",
      prompt: "Select ALL the pairings of Kotter's step and example that are correct.",
      options: [
        "Empower employees for action — extra IT training or process simplification",
        "Consolidate gains — embed the new practices into policies, processes and values",
        "Create a sense of urgency — cybersecurity risks demand immediate upgrades",
        "Generate short-term wins — a pilot project succeeds before the full rollout",
        "Build a guiding coalition — share the change vision through town halls and email"
      ],
      correctIndices: [
        0,
        2,
        3
      ],
      modelAnswer: "A school reform starts by showing why it is needed now, gathering a team, then making it easy for teachers to act, and showing results early. Some steps sound alike, so the order matters.\n\n• Kotter's eight steps: urgency; guiding coalition; vision and strategy; communicate the vision; empower employees for action; short-term wins; consolidate gains and produce more change; anchor new approaches in the culture.\n\n• Why the others are wrong: embedding change into policy and values is the last step, anchoring new approaches. Sharing the vision through many channels is 'communicate the change vision', not the coalition.\n\nSo the answer is: urgency, empower employees and short-term wins are matched correctly."
    },
    {
      type: "mcq",
      prompt: "A pilot in one department succeeds, and the project sponsor declares 'mission accomplished' and stops further support. Which Kotter step is being ignored?",
      options: [
        "Generate short-term wins — show quick, visible results, since the pilot has not actually demonstrated anything yet",
        "Anchor new approaches in the culture — embed the change in policies, but only after the pilot is signed off",
        "Consolidate gains and produce more change — use early wins to drive further change and do not declare victory too soon",
        "Create a sense of urgency — show why the change is needed now, since the pilot removed the pressure"
      ],
      correctIndex: 2,
      modelAnswer: "Winning the first match of the season and going home to celebrate does not win the league. You have to use the momentum for the next matches.\n\n• Short-term wins: quick, visible results such as a pilot success. The pilot here did that.\n\n• Consolidate gains: use early success to drive further change, and do not declare victory too soon.\n\n• The lecture warns that early success declared as victory is risky, because non-technical issues such as ethical or admin factors can still sink the project.\n\n• Why the others are wrong: the pilot did generate a win, and anchoring the culture is a later step.\n\nSo the answer is: consolidate gains and produce more change."
    },
    {
      type: "mcq",
      prompt: "Kotter's model is called top-down. Which scenario is an example of the top-down approach rather than bottom-up?",
      options: [
        "Senior leaders decide on a new security control and direct managers and technicians to implement it",
        "A security engineer proposes a new control, and it goes up to the executives for approval based on goals and budget",
        "A team of technicians pilots a tool on their own initiative and then recommends it to management for wider adoption",
        "An expert flags a risk in the department, and the department head later escalates it to the board for a decision"
      ],
      correctIndex: 0,
      modelAnswer: "In an army the general gives an order that passes down through officers to soldiers. If a soldier spots a problem and reports it up the chain, that is the other direction.\n\n• Top-down: instructions come from the top leadership to directors, managers and then technicians.\n\n• Bottom-up: an expert lower down suggests something, and the leadership decides after checking goals, budget and feasibility.\n\n• Kotter's model is a top-down approach, focused on leadership, momentum and embedding change in culture.\n\n• Why the others are wrong: each starts with someone lower in the organisation raising the idea, which is bottom-up.\n\nSo the answer is: leaders deciding and directing the change downwards."
    },
    {
      type: "mcq",
      prompt: "Which situation is the best fit for Kotter's 8-step model, rather than ADKAR or McKinsey's 7S?",
      options: [
        "A single CRM rollout where individual end users show high resistance and need structured, step-by-step personal support and coaching",
        "An ongoing ERP project that is stalling, where managers want a holistic checklist to find which areas are misaligned and why",
        "A small agile team wanting to build individual awareness, desire, knowledge and ability for the adoption of one new tool",
        "A large, hierarchical organisation running a company-wide digital transformation that needs strong leadership sponsorship and a culture change"
      ],
      correctIndex: 3,
      modelAnswer: "Choosing a tool for the job: a crowbar for a big job at the top, a screwdriver for fixing one person's stuck screw, and a checklist for finding what is broken.\n\n• Kotter: large, organisation-wide IT changes, where culture change and leadership sponsorship in a hierarchy are critical, and when speed is needed.\n\n• ADKAR: people-centred, individual-level, for end-user adoption and high resistance.\n\n• 7S: a holistic diagnostic for major implementations or troubled projects.\n\n• Why the others are wrong: the first suits ADKAR and the second suits 7S, and the third also describes ADKAR.\n\nSo the answer is: a large, hierarchical, leader-sponsored digital transformation."
    },
    {
      type: "mcq",
      prompt: "Alpha Manufacturing's ERP pilot shows employees still use spreadsheets. Staff say 'the old systems work fine,' line managers feel excluded, and training is poorly attended. Which change curve stages best describe them?",
      options: [
        "Mostly bargaining and depression, because staff are negotiating over spreadsheets and losing hope",
        "Mostly shock and denial among staff, with anger among the line managers who feel excluded from decisions",
        "Acceptance, because the pilot rollout is under way and staff are already partly using the new system",
        "Depression only, because low training attendance shows that staff have completely lost hope"
      ],
      correctIndex: 1,
      modelAnswer: "A team told to switch tools says 'the old one is fine,' skips the training and grumbles about not being asked. They are not bargaining for terms or exhausted yet. They are mostly rejecting and complaining.\n\n• 'The old systems work fine' is the classic denial statement from the lecture.\n\n• Excluded line managers feeling ignored show anger, similar to 'management does not understand our work'.\n\n• Why the others are wrong: staff are not yet negotiating compromise, they are avoiding the change. Continuing to use spreadsheets shows they have not accepted it.\n\nSo the answer is: shock and denial, with anger among the line managers."
    },
    {
      type: "mcq",
      prompt: "Alpha's change team wants to find out which individual-level step is failing (why do employees still avoid the new ERP, and what should it fix first?). Which model suits this best?",
      options: [
        "McKinsey's 7S, because it shows how the hard and soft elements align, but says nothing about individual steps",
        "ADKAR, because it is people-centred, works at the individual level and diagnoses which step, such as Desire or Ability, is missing",
        "Kotter's 8 steps, because it is a top-down leadership roadmap and does not diagnose individual-level gaps",
        "None of the three, because frameworks are for designing a change and cannot diagnose why adoption is failing"
      ],
      correctIndex: 1,
      modelAnswer: "If one student keeps failing maths, you ask whether they know why it matters, want to learn it, were taught it, can do it, and keep practising. That is checking one step at a time.\n\n• ADKAR guides individuals through change step by step and helps managers diagnose whether adoption is failing because of Awareness, Desire, Knowledge, Ability or Reinforcement.\n\n• Why the others are wrong: 7S diagnoses organisational alignment, and Kotter is a leader-driven roadmap.\n\nSo the answer is: ADKAR."
    },
    {
      type: "multi",
      prompt: "Select ALL the practical steps that would help Alpha's change team increase adoption and reduce resistance.",
      options: [
        "Shut down the old spreadsheets immediately to force adoption ahead of the CIO's ROI deadline",
        "Cut the training programme to save time and money so ROI can be shown within twelve months",
        "Use small pilots with quick wins and feedback loops to refine the adoption plan",
        "Set up a change agents network of respected staff in each department to support peers",
        "Make line managers visible coaches and involve them in shaping the rollout"
      ],
      correctIndices: [
        2,
        3,
        4
      ],
      modelAnswer: "A school introducing a new timetable app gets teachers on board, appoints student helpers, and trials it with one year group before the full launch. It does not ban the old timetable overnight.\n\n• Involvement and coaching: give people a voice, and let middle managers act as coaches for their teams.\n\n• Change agents network: peer influence accelerates adoption.\n\n• Quick wins and iterative delivery: agile-style pilots demonstrate success quickly and feed back into the plan.\n\n• Why the others are wrong: forcing change and cutting training fight against the lecture's advice, since people in the transition state need communication, training and support.\n\nSo the answer is: involve line managers, use change agents and run pilots with feedback."
    },
  ],
};

export const WEEK_7_PAPERS: ExamPaperSeed[] = [LECTURE_PAPER, CHANGE_LECTURE_PAPER];
