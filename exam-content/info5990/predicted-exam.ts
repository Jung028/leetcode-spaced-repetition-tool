import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 9,
  paperNumber: 3,
  title: "Predicted Exam Practice Paper",
  topics:
    "Multiple-choice questions predicted from the real INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf and its matching Answer Guide, grounded in the single-best-answer Part B pattern of that bank. Covers: unclear governance decision rights and accountability; incident-response first actions (validate, triage, preserve evidence, contain); trust boundaries in threat modelling; least privilege vs defence in depth vs security through obscurity; multi-factor authentication as layered protection; utilitarian vs deontological ethical reasoning applied to a release decision; ACS professional responsibilities around disclosing a known risk; estimation by analogy vs a Work Breakdown Structure; integration/end-to-end testing vs performance/load testing gaps; the ADKAR model's Ability vs Reinforcement elements; COBIT vs ITIL as governance vs service-management; and the ITSM distinction between an incident and a service request, plus incident response vs disaster recovery.",
  sourceFiles: [
    "Predicted Exam - INFO5990.docx (Desktop, derived from INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf + its Answer Guide)",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "A governance committee meets monthly, produces detailed minutes, and has an approved charter — yet a critical security investment keeps being deferred without anyone formally rejecting it. What is the most accurate diagnosis?",
      options: [
        "Decision rights for this category of risk are not clearly assigned to an accountable owner",
        "The committee needs to meet more frequently than it currently does each month",
        "The charter should be rewritten with far more procedural detail than it currently has",
        "The security investment is not actually a governance matter at all, so it falls outside this committee's role",
      ],
      correctIndex: 0,
      modelAnswer:
        "A ship can have a detailed logbook and a full crew roster and still drift if nobody is actually holding the wheel.\n\n• The real problem: the scenario describes plenty of activity, meetings, minutes, an approved charter, but no accountability. Nobody can actually say yes or no to this specific risk.\n\n• Why more meetings or more paperwork don't fix it: extra meeting frequency or a longer charter can't manufacture accountability that was never assigned in the first place.\n\n• Why this is still governance's job: deferring a security investment is exactly the kind of risk-acceptance decision governance exists to own, not something outside its remit.\n\nSo the answer is: decision rights for this category of risk are not clearly assigned to an accountable owner — the real problem is unclear accountability, not meeting frequency or documentation detail.",
    },
    {
      type: "mcq",
      prompt:
        "A support account used only for scheduled maintenance is suddenly used to log in from an unfamiliar location at 3am. What is the most appropriate immediate action?",
      options: [
        "Delete the account's logs so the incident cannot be misread",
        "Wait for the next scheduled security audit to review it",
        "Validate and triage the activity, preserve evidence, and begin containment as appropriate",
        "Immediately rebuild every system connected to that account without investigation",
      ],
      correctIndex: 2,
      modelAnswer:
        "If a smoke alarm goes off at 3am, you don't wait for the monthly fire drill and you definitely don't disconnect the alarm — you check what's actually happening first.\n\n• The right first move: incident response starts with validating that the signal is real, preserving evidence for investigation, and containing the specific risk, not overreacting or underreacting.\n\n• Why waiting is wrong: a scheduled audit weeks away ignores a live risk happening right now.\n\n• Why destroying evidence or rebuilding everything is wrong: deleting logs destroys exactly what you'd need to understand what happened, and rebuilding every connected system is a disproportionate first step before the scope is even known.\n\nSo the answer is: validate, triage, preserve evidence, then contain as the investigation confirms is needed.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement best explains why a trust boundary matters when threat-modelling a system that shares data with an external payment partner?",
      options: [
        "It replaces the earlier need to identify which specific assets in the system actually matter most",
        "It marks where data or control crosses between areas with different trust assumptions, which is where attacks are most likely to succeed",
        "It proves that the external partner's own system can never be compromised under any realistic circumstances at all",
        "It functions purely as a budgeting and cost-allocation tool rather than as a genuine security concept",
      ],
      correctIndex: 1,
      modelAnswer:
        "A trust boundary is like the border crossing between two countries with different laws — it's exactly where you need extra checks, not where you can assume everything on the other side follows your own rules.\n\n• What it actually marks: the point where control or data moves from an area you fully trust (your own systems) into one you don't fully control (the partner's).\n\n• Why that spot matters most: it's exactly where extra verification matters, because it's where an attacker is most likely to succeed.\n\n• Why the other options are wrong: a trust boundary doesn't prove anything is safe, it doesn't replace the separate step of identifying what assets matter, and it's a security concept, not a financial one.\n\nSo the answer is: a trust boundary flags where data or control crosses into a different trust zone, which is exactly where threat modelling needs to focus.",
    },
    {
      type: "mcq",
      prompt:
        "A project team gives each role only the system permissions needed for their current, authorised tasks, rather than broad access \"just in case.\" Which principle does this most directly implement?",
      options: [
        "Disaster recovery",
        "Least privilege",
        "Security through obscurity",
        "Defence in depth",
      ],
      correctIndex: 1,
      modelAnswer:
        "Giving every staff member at a hotel a master key \"just in case\" is the opposite of this — a good hotel gives each person only the keys their actual job requires.\n\n• Why this is least privilege: it means granting only the access needed for the authorised task, nothing more.\n\n• Why the others don't fit: defence in depth is about layering multiple independent controls, security through obscurity means hiding how something works rather than controlling access, and disaster recovery is about restoring service after major disruption.\n\nSo the answer is: least privilege, since it's specifically about scoping access to need.",
    },
    {
      type: "mcq",
      prompt:
        "A password is stolen in a phishing attack, but the attacker still cannot log in because a separate, independent code sent to the user's phone is also required. This best illustrates:",
      options: [
        "Stakeholder mapping",
        "Data classification",
        "Change reinforcement",
        "Defence in depth",
      ],
      correctIndex: 3,
      modelAnswer:
        "A house with a locked front door and a second lock that needs a different key is safer than one lock alone, even if a burglar somehow copies the first key.\n\n• Why this is defence in depth: having a second, independent layer of protection, this is multi-factor authentication, or MFA (requiring a second proof of identity beyond just the password), means one compromised control doesn't mean total failure.\n\n• Why the others are wrong: data classification, change reinforcement and stakeholder mapping are each from a different part of the unit entirely and don't describe layered controls.\n\nSo the answer is: defence in depth, because a second independent factor stopped the attack even after the first control, the password, failed.",
    },
    {
      type: "mcq",
      prompt:
        "Under utilitarian reasoning, a decision to launch a system known to have a minor but real accessibility gap should primarily weigh:",
      options: [
        "Whether the project finished on schedule and stayed within its originally approved budget",
        "Only whether senior management personally prefers to launch regardless of what the evidence shows",
        "Whether the decision strictly follows a fixed rule or duty, regardless of the resulting outcome for anyone",
        "The overall balance of benefits and harms for everyone affected, including the excluded group",
      ],
      correctIndex: 3,
      modelAnswer:
        "A utilitarian weighing a decision is like a scale — you have to actually put everyone's outcomes on it, including the people who'd be left out, not just the people cheering for launch day.\n\n• Why this is utilitarian reasoning: it's specifically about weighing total consequences, benefits and harms, across everyone affected, not just the people making the decision.\n\n• Why the others are wrong: schedule and budget success isn't an ethical criterion, management preference alone isn't either, and following a fixed rule regardless of outcome describes deontology, the opposite framework.\n\nSo the answer is: utilitarian reasoning weighs overall benefit and harm for everyone affected, including the group that would be excluded.",
    },
    {
      type: "mcq",
      prompt:
        "Under deontological reasoning, which consideration is most central to a release decision?",
      options: [
        "Only whether users happen to notice the problem after the release has already gone out",
        "Only the single largest measurable benefit produced by the decision, regardless of who bears the cost",
        "The duties, rules and obligations that should be respected regardless of outcome",
        "Only whether the release turns out to be profitable for the organisation in the end",
      ],
      correctIndex: 2,
      modelAnswer:
        "A deontologist is the person who keeps a promise even when breaking it would clearly work out better for everyone — duty comes first, not the outcome.\n\n• Why this is the deontological answer: it centres on obligations and duties, such as a duty not to expose users to a known, avoidable risk, rather than calculating the best overall outcome.\n\n• Why the others are wrong: the largest benefit and profitability describe a consequence-focused, utilitarian, lens, and \"whether users notice\" ignores duty entirely.\n\nSo the answer is: deontological reasoning is centred on duties and obligations, independent of whether the outcome looks good.",
    },
    {
      type: "mcq",
      prompt:
        "An IT professional is quietly asked to delay reporting a confirmed material privacy risk until after a scheduled public launch. Which response best aligns with ACS (the Australian Computer Society's professional code of conduct) responsibilities?",
      options: [
        "Say nothing about the risk at all, since schedule and launch decisions belong only to management",
        "Treat the already-announced launch date as more important than the foreseeable harm to users",
        "Disclose the material risk honestly now and prioritise public interest and professional responsibility",
        "Wait and see whether anyone else happens to notice the risk before deciding to raise it",
      ],
      correctIndex: 2,
      modelAnswer:
        "A lifeguard who sees a confirmed rip current doesn't wait for the lunch rush to end before putting up the flag — some things can't wait for a convenient moment.\n\n• Why disclosing now is right: ACS professional responsibilities place public interest, honesty and competence above convenience or schedule pressure, especially for a confirmed material risk.\n\n• Why the others are wrong: staying silent, waiting, or prioritising the launch date over foreseeable harm all directly contradict the duty to disclose known material risks honestly.\n\nSo the answer is: disclose the confirmed material risk honestly and promptly; professional responsibility doesn't pause for a launch date.",
    },
    {
      type: "mcq",
      prompt:
        "A team has reliable effort data from a genuinely comparable, recently completed project. Which estimation technique can use that evidence most directly?",
      options: [
        "Ignoring the reliable historical data entirely and relying on an unsupported guess instead",
        "Estimation by analogy, which reuses effort data directly from a project that is genuinely comparable",
        "Random contingency padding added on top of the estimate with no stated basis or justification",
        "Function points calculated using only headcount figures rather than real functional complexity",
      ],
      correctIndex: 1,
      modelAnswer:
        "If you've genuinely renovated the exact same model of kitchen before, that past job is your best starting estimate for this one — as long as it really is the same kind of job.\n\n• Why estimation by analogy is right: it's specifically designed to reuse evidence from a genuinely comparable completed project.\n\n• Why the others are wrong: padding without a stated basis and headcount-only function points aren't evidence-based, and ignoring reliable historical data wastes the best information available.\n\nSo the answer is: estimation by analogy directly uses evidence from a genuinely comparable past project.",
    },
    {
      type: "mcq",
      prompt:
        "What is the main estimation benefit of building a Work Breakdown Structure, or WBS, before estimating a complex project?",
      options: [
        "It removes the need to document assumptions because the breakdown itself already captures every constraint",
        "It decomposes scope into smaller work packages so effort can be estimated at a more reliable level of detail",
        "It removes all uncertainty from the project by predicting every risk and cost in advance before work has started",
        "It guarantees requirements will never change for the rest of the project once the breakdown has been agreed",
      ],
      correctIndex: 1,
      modelAnswer:
        "Estimating \"how long will renovating the whole house take\" is much harder than estimating room by room, task by task, and adding it up — breaking the job down is what makes the number trustworthy.\n\n• Why decomposing scope is right: a WBS breaks a large, vague scope into smaller, more estimable work packages.\n\n• Why the others are wrong: no technique removes all uncertainty, requirements can still change regardless of a WBS, and assumptions still need to be documented even with one.\n\nSo the answer is: a WBS makes estimates more reliable by decomposing scope into smaller, estimable work packages.",
    },
    {
      type: "mcq",
      prompt:
        "A platform's individual functions (search, payment, booking) each pass their own tests, but the complete \"search, book, pay\" journey fails when run end-to-end. Which testing gap is most likely?",
      options: [
        "Integration or end-to-end testing",
        "Version control discipline",
        "Password rotation policy",
        "Stakeholder mapping",
      ],
      correctIndex: 0,
      modelAnswer:
        "Every part of a car can pass its own inspection, brakes fine, engine fine, steering fine, and the car can still fail if nobody ever tested them working together at once.\n\n• Why this is the gap: functions passing individually but failing when combined is the textbook signature of missing integration or end-to-end testing.\n\n• Why the others are wrong: password rotation, version control and stakeholder mapping are unrelated to workflow-level test coverage.\n\nSo the answer is: integration or end-to-end testing is the gap when individual functions pass but the combined workflow fails.",
    },
    {
      type: "mcq",
      prompt:
        "Testing whether a booking platform stays responsive when thousands of users search simultaneously during a known peak period is:",
      options: [
        "Change reinforcement",
        "Data classification",
        "Stakeholder salience mapping",
        "Performance/load testing",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's the difference between testing a bridge with one car on it versus testing it with the full rush-hour queue it will actually carry.\n\n• Why this is performance/load testing: it specifically checks responsiveness under realistic peak demand.\n\n• Why the others are wrong: change reinforcement, data classification and stakeholder salience mapping are concepts from entirely different parts of the unit.\n\nSo the answer is: performance/load testing, because it checks behaviour under realistic peak demand.",
    },
    {
      type: "mcq",
      prompt:
        "Employees say they now understand why a new system is better and genuinely want to switch, but struggle to complete the new workflow without help. Using the ADKAR model (Awareness, Desire, Knowledge, Ability, Reinforcement), which element is weakest?",
      options: ["Reinforcement", "Desire", "Ability", "Awareness"],
      correctIndex: 2,
      modelAnswer:
        "Wanting to learn to swim and actually being able to swim unassisted across a pool are two different stages — the second one needs practice, not more motivation.\n\n• Why Ability is the weak element: Awareness and Desire are already present per the scenario; the gap described is applying the knowledge in practice, which is Ability.\n\n• Why the others are wrong: Awareness and Desire are already satisfied by the scenario, and Reinforcement is about sustaining a change after it's already working, not the initial struggle described here.\n\nSo the answer is: Ability, since staff want the change but can't yet execute it without help.",
    },
    {
      type: "mcq",
      prompt:
        "Employees can successfully use a new system when observed, but gradually drift back to the old process over the following weeks. Using the ADKAR model, which element needs the most attention?",
      options: ["Reinforcement", "Knowledge", "Awareness", "Ability"],
      correctIndex: 0,
      modelAnswer:
        "Going to the gym diligently for the first two weeks of January and then quietly stopping by February is a Reinforcement problem, not a knowledge or ability problem — the habit wasn't locked in.\n\n• Why Reinforcement is the gap: the employees have already demonstrated Ability (they can use it when observed); the gap is sustaining that behaviour once attention fades.\n\n• Why the others are wrong: Awareness and Knowledge are clearly present since they succeeded when observed, and Ability is demonstrated, not missing.\n\nSo the answer is: Reinforcement, since the behaviour exists but isn't being sustained over time.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement best distinguishes COBIT (Control Objectives for Information and related Technologies) from ITIL (IT Infrastructure Library) as taught in this unit?",
      options: [
        "COBIT is an incident ticketing tool; ITIL is an ethical theory about professional conduct",
        "COBIT replaces organisational strategy entirely; ITIL replaces all technical security controls",
        "COBIT is a change-management model for individuals; ITIL is an effort-estimation technique",
        "COBIT supports governance of enterprise IT; ITIL supports service-management practices",
      ],
      correctIndex: 3,
      modelAnswer:
        "COBIT is the company's constitution, who decides what the organisation should aim for; ITIL is the day-to-day operating manual for actually running the service once that direction is set.\n\n• Why this is the governance-vs-operations split: this is exactly the distinction the unit teaches, COBIT for governance and direction, ITIL for service-management execution.\n\n• Why the others are wrong: the other options describe neither framework accurately and mix up unrelated concepts from other weeks.\n\nSo the answer is: COBIT governs enterprise IT direction and accountability; ITIL manages the operational delivery of IT services.",
    },
    {
      type: "mcq",
      prompt:
        "A production payment service fails unexpectedly and customers cannot complete transactions. In ITSM (IT service management) terms, this event is primarily:",
      options: [
        "A governance objective",
        "A project estimate",
        "A service request",
        "An incident",
      ],
      correctIndex: 3,
      modelAnswer:
        "A normal request to reset a forgotten password is a service request; a payment system that's suddenly down for everyone is an emergency, not a routine ask.\n\n• Why this is an incident: an unplanned interruption or reduction in service quality is, by definition, an incident in ITSM terms.\n\n• Why the others are wrong: a service request is a planned, routine ask; a project estimate and a governance objective describe entirely different unit topics, not an operational failure.\n\nSo the answer is: an unexpected service failure is an incident.",
    },
    {
      type: "mcq",
      prompt: "Which statement best distinguishes incident response from disaster recovery?",
      options: [
        "Incident response is a purely preventive process that is never reactive; disaster recovery is purely an ethical review process with no technical role",
        "Incident response handles security and operational events as they occur; disaster recovery focuses on restoring critical services after a major disruption",
        "They are identical processes that simply use two different names for exactly the same set of activities and responsibilities",
        "Incident response is used only for formal project effort estimation; disaster recovery is used only for mapping out stakeholder interests",
      ],
      correctIndex: 1,
      modelAnswer:
        "Incident response is the paramedic treating the patient right now; disaster recovery is the hospital rebuilding its wing after the fire that caused the emergency in the first place.\n\n• Why this is the right distinction: incident response manages a live security or operational event, while disaster recovery is specifically about restoring critical services after major disruption.\n\n• Why the others are wrong: the other options either misassign both concepts to unrelated topics or incorrectly claim they're the same process.\n\nSo the answer is: incident response handles the live event; disaster recovery restores service afterwards.",
    },
  ],
};

export const INFO5990_PREDICTED_EXAM_PAPERS: ExamPaperSeed[] = [PAPER];
