import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 8,
  paperNumber: 3,
  title: "Final Exam Practice Paper (Weeks 1–8, mixed review)",
  topics:
    "A closed-book style mixed-review paper spanning all eight authored weeks, matching the Final Exam's stated format (closed-book, supervised, case-study-based questions similar to tutorial style). Draws on: Week 1 (assessment structure and hurdle requirements, professional judgement vs technical competence, the ASX/Victorian Government/Optus/CrowdStrike case studies, escalating known risk); Week 2 (organisational structures — functional, matrix, flat, hierarchical — resources vs capabilities, IT investment best practices, IT/business alignment); Week 3 (project definition, reasons projects fail, Waterfall vs Agile vs DevOps fit-to-context, Enterprise Architecture domains and TOGAF); Week 4 (Belbin team roles, Tuckman's stages, the Power-Interest Matrix vs the Salience Model, Thomas-Kilman conflict styles, stakeholder engagement); Week 5 (evidence-based estimating over stakeholder-pressured guesses); Week 6 (KEEP/SUSPEND/MODIFY governance judgement for a biased AI system, disparate impact vs proxy variables, professional codes of conduct); Week 7 (COBIT governance EDM vs management domains, ADKAR, Kotter's 8 steps); and Week 8 (change management roles, the CIA Triad, Risk = Vulnerability × Threat, the Shared Responsibility Model). Roughly half the paper is single-concept recall at final-exam difficulty; the other half is scenario-based, and several scenarios deliberately require combining a concept from one week with a concept from a different week, the way a cumulative final exam would.",
  sourceFiles: [
    "exam-content/info5990/week-1.ts",
    "exam-content/info5990/week-2.ts",
    "exam-content/info5990/week-3.ts",
    "exam-content/info5990/week-4.ts",
    "exam-content/info5990/week-5.ts",
    "exam-content/info5990/week-6.ts",
    "exam-content/info5990/week-7.ts",
    "exam-content/info5990/week-8.ts",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "In INFO5990, two of the four assessment items are hurdle tasks, and both of those two are also the only items where AI use is prohibited. Which pairing correctly identifies both hurdle tasks together with their weightings?",
      options: [
        "Written Exam (50%) and Interactive Oral/Viva (10%)",
        "Written Exam (35%) and Team Report (10%)",
        "Early Semester Feedback Task (5%) and Interactive Oral/Viva (10%)",
        "Written Exam (50%) and Team Report (35%)",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a video game with two boss levels you absolutely cannot skip, no matter how well you did on the side quests. Everything else is optional grinding by comparison.\n\n• The Assessments table lists exactly two hurdle tasks: the Written Exam (50%, closed-book, supervised) and the Interactive Oral/Viva (10%, secured, no notes allowed, held Week 8).\n\n• Those same two items are also the only ones marked 'AI prohibited' — the Early Semester Feedback Task (5%) and the Team Report (35%) are both 'AI allowed' and neither is a hurdle.\n\n• Why the other options are wrong: they either mismatch the weightings (35%/10%, 50%/35%) or pair a non-hurdle item (the 5% quiz) with a real hurdle task.\n\nSo the answer is: the Written Exam (50%) and the Interactive Oral/Viva (10%) are the two hurdle, AI-prohibited tasks.",
    },
    {
      type: "mcq",
      prompt:
        "A logistics company owns a fleet of delivery vans and a licensed route-planning API — things it physically or contractually owns. Separately, it has built the organisational ability to reliably complete same-day deliveries across a city using those assets. Which term correctly labels each half of this pair?",
      options: [
        "The vans and API are a Capability; the same-day delivery ability is a Resource",
        "The vans and API are a Resource; the same-day delivery ability is a Capability",
        "Both halves are Resources; Capability only ever applies to financial assets",
        "Both halves are Capabilities; Resource only ever applies to intangible assets",
      ],
      correctIndex: 1,
      modelAnswer:
        "Owning a guitar is not the same as being able to actually play it well. One is a thing you have; the other is something you can do because of what you have.\n\n• Resources are what an organisation owns — tangible things like vehicles, hardware, or a licensed API, or intangible things like knowledge and policies.\n\n• Capabilities are what an organisation can do by using those resources — here, reliably completing same-day deliveries.\n\n• Why the others are wrong: Capability is not defined by ownership, Resource is not limited to money, and neither term is restricted to only tangible or only intangible things.\n\nSo the answer is: the vans and API are a Resource, and the same-day delivery ability is a Capability.",
    },
    {
      type: "mcq",
      prompt:
        "An employee at a software company reports to both a functional Engineering Manager and a separate Project Manager for a specific product launch. This dual-reporting arrangement is the defining feature of which organisational structure, and what is its most commonly cited drawback?",
      options: [
        "Hierarchical, where each person reports to exactly one manager up a fixed chain; its drawback is that layered approvals slow decisions and stifle creativity",
        "Functional, where staff are grouped into specialised departments like Engineering and Finance; its drawback is that it creates silos and limits cross-department communication",
        "Matrix; its drawback is that dual authority can cause confusion, requiring strong communication and coordination",
        "Flat, with few or no layers of middle management at all; its drawback is that this speed advantage is hard to sustain once the company needs to scale",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine having two different coaches for the same sport, one for your position and one for the overall game plan. It works well when they talk to each other, and badly when they don't.\n\n• A Matrix structure is defined by employees reporting to two managers at once, typically one functional and one project-based.\n\n• Its documented drawback is that dual authority can cause confusion and demands strong communication and coordination to actually work.\n\n• Why the others are wrong: slower decisions belong to Hierarchical, silos belong to Functional, and scaling difficulty belongs to Flat — each structure has its own distinct, non-interchangeable drawback.\n\nSo the answer is: Matrix, and its drawback is dual-authority confusion.",
    },
    {
      type: "mcq",
      prompt:
        "A project has clear, stable, well-documented requirements from day one, but fails because the team never anticipated that a critical third-party payment API would be deprecated mid-project. Which failure category does this best match, and why is it not Poor Scope Definition?",
      options: [
        "Poor Scope Definition, since any unplanned event that occurs mid-project always counts as a scope failure by definition, regardless of how stable the original requirements actually were",
        "Resource Issues, because losing access to the payment API is treated in every case as equivalent to losing a skilled staff member partway through delivery",
        "Unrealistic Timelines or Budgets, since an unexpected external dependency failure like this one always traces back to an earlier, undetected budgeting error",
        "Inadequate Risk Management, since the requirements were clear and stable — the team simply failed to anticipate and mitigate a foreseeable external risk",
      ],
      correctIndex: 3,
      modelAnswer:
        "Packing perfectly for a hiking trip and still getting caught out because you never checked the weather forecast is not a packing mistake — it's a failure to plan for a foreseeable risk.\n\n• Poor Scope Definition is about unclear or constantly changing requirements — but this project's requirements were clear and stable throughout.\n\n• Inadequate Risk Management is specifically about failing to anticipate and mitigate foreseeable issues, which is exactly what happened when nobody planned for the vendor's API deprecation.\n\n• Why the others are wrong: an API deprecation is not the same as losing a team member, and nothing here points to a budgeting mistake.\n\nSo the answer is: Inadequate Risk Management, because the failure was in anticipating a foreseeable risk, not in defining scope.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following is an actual principle from the Agile Manifesto, as distinct from a common misreading of it?",
      options: [
        "Working software is the primary measure of progress, not comprehensive documentation",
        "Requirements should be frozen as early as possible and never revisited once approved",
        "The most efficient way to convey information to a team is through detailed written specifications",
        "Documentation is the primary measure of progress across a sprint",
      ],
      correctIndex: 0,
      modelAnswer:
        "Judging a chef by whether the food actually tastes good, rather than by how thick their recipe binder is, is the same idea the Agile Manifesto applies to software.\n\n• The Manifesto states directly that working software is the primary measure of progress — not documentation.\n\n• It also explicitly welcomes changing requirements even late in development, and says face-to-face conversation, not detailed written specs, is the most efficient way to convey information.\n\n• Why the others are wrong: freezing requirements, favouring written specs over conversation, and treating documentation as the progress measure are each the direct opposite of a real Manifesto principle.\n\nSo the answer is: working software, not documentation, is the primary measure of progress.",
    },
    {
      type: "mcq",
      prompt:
        "A team member consistently generates original, creative solutions to hard problems, but tends to overlook small details and struggles to explain their ideas clearly to others. Which Belbin team role does this describe, and what is this role's most commonly cited weakness?",
      options: [
        "Shaper; its weakness is that it thrives on pressure and can risk offending people",
        "Plant; its weakness is that it ignores incidentals and can struggle to communicate effectively",
        "Specialist; its weakness is that it contributes only on a narrow technical front",
        "Resource Investigator; its weakness is that it loses interest once initial enthusiasm fades",
      ],
      correctIndex: 1,
      modelAnswer:
        "A brilliant inventor lost in thought, scribbling a breakthrough idea on a napkin, who then can't quite explain it clearly when someone asks 'so how does this actually work?' — that's a very specific type of strength paired with a very specific type of weakness.\n\n• Belbin's Plant role is defined as creative, imaginative, and free-thinking, generating ideas and solving difficult problems.\n\n• Its paired weakness is exactly this description: ignoring incidentals and being too preoccupied to communicate effectively.\n\n• Why the others are wrong: Shaper thrives on pressure and risks offending people, Specialist is narrow but not necessarily poor at communication, and Resource Investigator's weakness is losing enthusiasm, not creative disorganisation.\n\nSo the answer is: Plant, whose weakness is ignoring incidentals and struggling to communicate.",
    },
    {
      type: "mcq",
      prompt:
        "Two stakeholder classification tools are being compared for a project. One sorts people into four quadrants using only power and interest. The other adds legitimacy and urgency as a third dimension, producing more specific categories such as Dormant, Dangerous, and Definitive. What correctly names each tool?",
      options: [
        "The Salience Model is the two-dimensional tool; the Power-Interest Matrix is the three-dimensional one",
        "Both tools use exactly the same three dimensions, just under different category names",
        "The Power-Interest Matrix is the two-dimensional tool; the Salience Model is the three-dimensional one",
        "The Power-Interest Matrix only applies to external stakeholders, and the Salience Model only to internal ones",
      ],
      correctIndex: 2,
      modelAnswer:
        "A simple two-way street sign tells you left or right. A more detailed sign adds a third piece of information, like a time restriction, letting it distinguish more precisely between situations that looked the same on the simple sign.\n\n• The Power-Interest Matrix classifies stakeholders on two dimensions, power and interest, into four quadrants.\n\n• The Salience Model adds a third dimension, legitimacy and urgency together, producing a more granular set of categories like Dormant, Dangerous, Dependent, and Definitive that a flat 2D grid can't distinguish.\n\n• Why the others are wrong: the dimension count is reversed in one option, and neither tool is restricted to only internal or only external stakeholders.\n\nSo the answer is: the Power-Interest Matrix is two-dimensional, and the Salience Model is the three-dimensional one.",
    },
    {
      type: "mcq",
      prompt:
        "A company's board decides how much budget risk it is willing to accept for a new AI project and sets its strategic priority. A separate team then plans, builds, and runs the actual system day to day. In COBIT terms, which activity is the board's decision, and which domain covers the team's day-to-day work?",
      options: [
        "The board's decision is Management (APO: Align, Plan, Organise), since setting a budget figure is treated as a planning activity; the team's daily work instead falls under Governance (EDM)",
        "Both the board's decision and the team's day-to-day work fall under the exact same EDM domain, since COBIT treats governance and management as fully interchangeable terms",
        "The board's decision is MEA (Monitor, Evaluate, Assess), since setting risk appetite is treated as a monitoring activity; the team's daily work instead falls under EDM",
        "The board's decision is Governance (EDM: Evaluate, Direct, Monitor); the team's work spans the Management domains (APO, BAI, DSS, MEA)",
      ],
      correctIndex: 3,
      modelAnswer:
        "A ship's owners decide whether to sail into risky waters and how much cargo to insure. The crew then actually navigates, loads, and maintains the ship day to day. Owning the risk decision and running the ship are two different jobs.\n\n• Governance (EDM: Evaluate, Direct, Monitor) is the board's job — setting direction, priorities, and risk appetite.\n\n• Management (APO, BAI, DSS, MEA) is where the actual planning, building, running, and monitoring happens, carried out by managers and teams.\n\n• Why the others are wrong: they either swap governance and management, or collapse the two into one domain, when COBIT deliberately separates deciding direction from executing it.\n\nSo the answer is: the board's decision is Governance (EDM), and the team's work spans the Management domains.",
    },
    {
      type: "mcq",
      prompt:
        "Employees at a firm already understand exactly why a new expense-reporting tool is being introduced, but many are quietly reluctant to actually use it because they're worried it will make their jobs feel less secure. Per ADKAR, which step is missing, and why won't scheduling more training sessions fix it on its own?",
      options: [
        "Desire is missing; training builds Knowledge, which is the step that comes after Desire, so training alone can't fix a motivation gap",
        "Reinforcement is missing; more training would reward people for sustaining a change they've already made",
        "Awareness is missing; more training would need to re-explain why the change is happening in the first place",
        "Ability is missing; training would need to focus on hands-on practice rather than motivation",
      ],
      correctIndex: 0,
      modelAnswer:
        "Knowing exactly why a diet is good for you doesn't make you actually want to give up dessert, especially if you're scared of what changing your routine might mean. Knowing is not the same as wanting.\n\n• ADKAR runs in order for each individual: Awareness, then Desire, then Knowledge, then Ability, then Reinforcement.\n\n• These employees already have Awareness (they understand why the tool exists). Their gap is Desire — job-security fear is blocking their personal motivation.\n\n• Why more training doesn't help: training builds Knowledge, the step that comes after Desire, so without Desire, staff won't meaningfully engage with training even if it's offered.\n\nSo the answer is: Desire is the missing step, and training targets a later stage, so it can't fix a motivation problem by itself.",
    },
    {
      type: "mcq",
      prompt:
        "A hospital's patient-records database has a known unpatched software flaw, but almost no one outside the hospital's IT team knows this system even exists, and no attacker has ever attempted to target it. Using the formula Risk = Vulnerability × Threat, how should this situation currently be assessed, and what would change that?",
      options: [
        "Risk is currently relatively low, because although a real vulnerability exists, no real motivated threat is currently targeting it — risk would spike if a threat actor became aware of the flaw and began attempting to exploit it",
        "Risk is already at its maximum, since any unpatched flaw automatically qualifies as a full-blown security incident",
        "Risk is zero, because a vulnerability alone can never cause harm regardless of whether a threat exists",
        "Risk depends only on the threat side of the formula; the vulnerability itself doesn't matter once a system is in production",
      ],
      correctIndex: 1,
      modelAnswer:
        "A broken lock on a shed nobody knows about, in a yard nobody visits, isn't nearly as dangerous as the same broken lock on a shed a burglar has already scouted out.\n\n• Risk = Vulnerability × Threat means danger only spikes when a real weak point and a real, motivated attacker exist together.\n\n• Here, the vulnerability is real, but there's no evidence of an active, motivated threat targeting it yet — so current risk is relatively low, though not zero, since the flaw still needs patching.\n\n• Why the others are wrong: a vulnerability alone doesn't automatically mean maximum risk or zero risk, and the formula multiplies both factors together, so neither side can be ignored.\n\nSo the answer is: risk is currently relatively low, and it would rise sharply if a real threat actor started targeting the flaw.",
    },
    {
      type: "mcq",
      prompt:
        "Solstice Robotics is building a safety-certified firmware update for warehouse robots. Requirements are frozen after regulatory sign-off and cannot change once approved. A regional operations director has high organisational power but low current interest in the project — until the certification deadline nears, at which point his interest is expected to spike sharply. Which combination best fits Solstice Robotics' situation: the most suitable project methodology for the firmware work, and how the director's stakeholder classification should be treated over time?",
      options: [
        "Agile for the firmware, since safety-critical, certification-heavy work always benefits most from short, iterative sprints and evolving requirements; the director stays fixed in 'keep satisfied' permanently regardless of the approaching deadline",
        "DevOps for the firmware, chosen purely for the fastest possible continuous delivery pipeline; the director should be classified as 'monitor' since his currently low interest means he can safely be ignored throughout the whole project",
        "Waterfall for the firmware, since stable, certification-heavy requirements suit a sequential, well-documented process; the director's classification is a snapshot that should shift toward 'manage closely' as his interest rises near the deadline",
        "Waterfall for the firmware, since it is the only methodology ever used for regulated work; the director's power-interest classification is fixed permanently by his job title and never changes regardless of any circumstances that follow",
      ],
      correctIndex: 2,
      modelAnswer:
        "NASA chose a slow, rigorous, document-everything approach for shuttle software because the requirements were locked down and safety-critical — the same logic applies here. Separately, a stakeholder's spot on a map is a photo of today, not a tattoo.\n\n• Waterfall fits stable, certification-heavy, rarely-changing requirements far better than Agile's iterative, evolving-requirements approach.\n\n• The Power-Interest Matrix is explicitly a snapshot of the current situation, not a permanent fact about a person — as urgency rises near a deadline, someone's classification legitimately moves toward 'manage closely.'\n\n• Why the others are wrong: Agile and DevOps don't fit frozen, certification-driven requirements, and treating a stakeholder's position as permanently fixed ignores that interest genuinely changes as circumstances change.\n\nSo the answer is: Waterfall fits the firmware work, and the director's classification should shift toward 'manage closely' as the deadline approaches.",
    },
    {
      type: "mcq",
      prompt:
        "Vantage Insurance's automated claims-triage AI flags claims from customers in a particular postcode band for extra manual review 12% more often than claims from other postcodes. The data science team says the model is well-calibrated against historical fraud outcomes. Legal says nothing in current insurance regulation prohibits postcode-based triage. An internal audit confirms the 12% gap is statistically real but cannot yet prove the model, rather than a genuine regional fraud pattern, is the cause. Using the same reasoning applied to deciding whether a biased AI system should KEEP running, be SUSPENDED, or be MODIFIED, which response is most professionally defensible here, and why can't 'it's not currently illegal' settle the question on its own?",
      options: [
        "KEEP the model unchanged and take no further action, because legal compliance combined with strong historical calibration against past outcomes together already prove beyond doubt that the model is fair",
        "SUSPEND the model permanently and stop all automated triage immediately, because any statistically real gap between two demographic groups automatically means the underlying model must be discriminatory",
        "Escalate the entire decision to the insurance regulator and take no internal investigative action at all until a formal regulator response eventually arrives, however long that takes",
        "MODIFY: add human review for the affected postcode band and investigate whether postcode is acting as a proxy for a protected characteristic before trusting the model unmonitored again — being legal only means no law currently forbids it, not that it is fair",
      ],
      correctIndex: 3,
      modelAnswer:
        "A bouncer who follows the club's rulebook to the letter, breaks no law, and keeps the club profitable can still be running an unfair door policy — 'legal' only tells you nobody's written a rule against it yet.\n\n• The audit already shows the 12% gap is statistically real, but real doesn't mean the model itself caused it — a postcode can quietly act as a proxy variable for income, ethnicity, or other protected characteristics.\n\n• KEEP ignores a confirmed statistical warning sign outright, and SUSPEND overreacts before the actual cause is known, throwing away a working system on an unproven assumption.\n\n• MODIFY — adding human review for the affected group while investigating the root cause — treats the audit's finding seriously without jumping to a conclusion the audit itself admits it can't prove; 'not currently illegal' just means the law hasn't caught up, not that the outcome is fair.\n\nSo the answer is: MODIFY with targeted human review and a proxy-variable investigation, since legal compliance alone never proves fairness.",
    },
    {
      type: "multi",
      prompt:
        "Kestrel Aerospace's firmware team loses its most experienced lead engineer mid-project, right as the team also switches from an old in-house testing tool to a new cloud-based one. Two weeks later, splinter groups have formed over which testing approach is 'correct,' and a few engineers have quietly gone back to running tests manually rather than learning the new tool. Select ALL of the following that correctly diagnose this situation.",
      options: [
        "The team has likely regressed to Storming, since splinter groups forming and people pushing for position are Storming behaviours",
        "The team has likely progressed to Performing, since a cloud-based tool is inherently more advanced than a legacy in-house tool",
        "The engineers who reverted to manual testing are most likely missing Ability — they may already know why the change is happening and want to support it, but haven't yet built hands-on skill and confidence with the new tool",
        "The engineers who reverted to manual testing are most likely missing Awareness, since nobody has told them a new testing tool was introduced",
        "The engineers who reverted to manual testing are most likely missing Reinforcement, since manual testing itself was never previously rewarded",
      ],
      correctIndices: [0, 2],
      modelAnswer:
        "Losing an experienced leader and switching tools at the same time is like changing coaches and switching sports on the same day — it's no surprise the team temporarily falls back into arguing over the rules.\n\n• Both a new person leaving and a new tool being introduced are exactly the kinds of events that move a team backward on Tuckman's stages, and splinter groups plus competing positions are textbook Storming, not Performing.\n\n• For the reverting engineers, they clearly know the change happened (ruling out missing Awareness), so the more likely gap is Ability — needing hands-on practice and coaching with the new cloud tool rather than simply not wanting to change or not knowing about it.\n\n• Why the other two are wrong: nothing suggests the tool switch itself was never communicated (Awareness), and Reinforcement is about sustaining a change already adopted, which doesn't fit engineers who haven't adopted it yet.\n\nSo the answer is: the team has regressed to Storming, and the reverting engineers' most likely gap is Ability.",
    },
    {
      type: "mcq",
      prompt:
        "TerraLogix is bidding for a $3 million manufacturing-automation contract. The lead engineer estimates 4 months. Historical data from three comparable past TerraLogix projects averages 7 months. An internal estimation tool trained on the company's own delivery history predicts 6 months. The account manager says, 'promise 4 months or we lose the deal to a competitor.' Using the same evidence-based estimating reasoning applied to a similar software-bid dilemma, and connecting it to why projects fail, what is the most defensible position, and which listed failure reason would committing to 4 months risk triggering?",
      options: [
        "Trust the historical data and the estimation tool (6-7 months) over the account manager's 4-month sales figure, since committing to 4 months risks Unrealistic Timelines or Budgets — a documented reason projects fail",
        "Promise 4 months, since a single experienced lead engineer's technical judgement always outweighs historical averages drawn from past projects, which fully avoids any risk of Poor Scope Definition",
        "Split the difference and promise 5 months without collecting any further evidence at all, since simply averaging the three numbers together always produces the single safest possible estimate",
        "Promise 4 months but secretly pad the technical scope to compensate for the shortfall, since Inadequate Risk Management is a category that only ever applies to risks caused by external vendors",
      ],
      correctIndex: 0,
      modelAnswer:
        "Two independent instruments both saying 'the flight will take about 7 hours' should carry more weight than one passenger who insists it'll be 4, especially when the 4-hour guess is the only one nobody actually measured.\n\n• The historical data (7 months) and the independent estimation tool (6 months) are two separate, evidence-based sources landing close to each other — a strong signal to trust that range.\n\n• The account manager's 4-month figure is a negotiating position, not an estimate, and committing to it despite the evidence risks the documented failure reason Unrealistic Timelines or Budgets.\n\n• Why the others are wrong: a single optimistic gut estimate isn't automatically more reliable than data, unexamined averaging skips the evidence-gathering step entirely, and Inadequate Risk Management isn't limited to external vendors.\n\nSo the answer is: trust the historical data and tool over the sales figure, since 4 months risks Unrealistic Timelines or Budgets.",
    },
    {
      type: "mcq",
      prompt:
        "Meridian Freight is rolling out a new nationwide dispatch platform. The regional operations manager for its busiest depot is well respected among dispatchers, but is openly skeptical the platform will actually work, and dispatchers there often echo her doubts in meetings. Applying both Kotter's model and the practice of engaging high-power, low-support stakeholders early, what should Meridian Freight's change team do about this manager, and at which point in Kotter's sequence does this action best fit?",
      options: [
        "Ignore her entirely until the very final 'anchor the culture' step, since resistance voiced by any single regional manager becomes completely irrelevant once the entire nationwide rollout has already been fully completed and signed off",
        "Engage her early — ideally inviting her into the guiding coalition or directly addressing her concerns — because her high influence and low support make her a priority stakeholder risk, and this fits early in Kotter's sequence, around building the guiding coalition, not at the end",
        "Wait patiently for company-wide short-term wins to appear entirely on their own before ever speaking to her directly, since Kotter's model claims that visible early wins always convert every remaining skeptic automatically, without any direct engagement needed",
        "Transfer her immediately to a different, much quieter depot altogether, since Kotter's model specifically and explicitly recommends removing any manager who publicly voices doubt about an organisation-wide change",
      ],
      correctIndex: 1,
      modelAnswer:
        "If the most respected kid in class is against a plan, winning them over near the start of the process matters far more than waiting until everyone else is already convinced — by then, their doubt has already spread.\n\n• Stakeholder mapping flags high-power, low-support people as the biggest priority risk, because their opposition can stall an entire rollout.\n\n• Kotter's second step, building a guiding coalition, is exactly where this kind of respected-but-skeptical person should be engaged or brought in — early, not at the final anchoring step.\n\n• Why the others are wrong: waiting until the end wastes the window where her influence does the most damage, short-term wins don't convert people automatically without direct engagement, and transferring her sidesteps the actual concern rather than addressing it.\n\nSo the answer is: engage her early, around the guiding-coalition step, rather than waiting or removing her.",
    },
    {
      type: "mcq",
      prompt:
        "Fernbank Credit Union stores member data on a third-party cloud platform. An audit finds attackers got in not because the cloud provider's own servers were breached, but because several Fernbank staff had reused old passwords and never enabled multi-factor authentication on their own accounts. The board is now deciding whether to keep using the cloud provider and who should be accountable for preventing a repeat. Using the Shared Responsibility Model and the governance-versus-management split, who was actually responsible for the failure that let attackers in, and whose job is it to decide the overall risk appetite and direction going forward?",
      options: [
        "The cloud provider was responsible for the failure, since it is deemed to own the entire account layer under every cloud contract; Fernbank's own IT support team should set overall risk appetite, since that is treated as a management-level activity",
        "Both the provider and Fernbank staff automatically share equal responsibility in every single cloud breach regardless of the actual cause, and risk appetite is always set jointly by the provider and the board negotiating together",
        "Fernbank staff were responsible for the failure, since their own account security is the customer's side of the shared-responsibility split, not the provider's; Fernbank's board should set risk appetite and direction, since that is a governance-level activity",
        "The cloud provider was solely responsible, since cloud providers are always considered fully and automatically liable for any breach involving data stored anywhere on their platform, regardless of its actual root cause",
      ],
      correctIndex: 2,
      modelAnswer:
        "A landlord is responsible for the locks on the building's front entrance, but a tenant who leaves their own apartment door unlocked, or hands a stranger their key, caused their own break-in.\n\n• Under the Shared Responsibility Model, the customer — here, Fernbank's own staff — owns their own account security, including enabling multi-factor authentication, not the cloud provider.\n\n• Deciding overall risk appetite and strategic direction is a governance activity, which belongs to the board, not to the IT support team or the vendor.\n\n• Why the others are wrong: blaming the provider ignores that its infrastructure wasn't the point of failure, and treating responsibility as automatically shared or the vendor as automatically liable misreads what the shared-responsibility split actually assigns to each side.\n\nSo the answer is: Fernbank staff caused the failure on their side of the split, and the board owns setting risk appetite and direction.",
    },
    {
      type: "mcq",
      prompt:
        "Arcadia Retail's CFO is deciding between funding a new customer loyalty app, projected to increase repeat purchases, and funding a security upgrade to patch a known vulnerability in the company's payment system — no attacker activity has been observed yet, but the flaw is publicly documented in a vendor security advisory. Applying both the practice of ranking IT initiatives with measurable outcomes, and the formula Risk = Vulnerability × Threat, what is the strongest argument for prioritising the security upgrade first, even though the loyalty app has a clearer revenue figure attached?",
      options: [
        "The loyalty app should always be funded first regardless of the published advisory, since the risk formula is defined to apply only to systems that have already suffered a confirmed, successful attack at least once before this point",
        "Neither project should ever be funded at all until a full enterprise architecture review of every single system across the entire company has first been completed and formally signed off by the board of directors",
        "The loyalty app and the security upgrade carry identical, entirely unquantifiable risk profiles in every conceivable respect, so the decision should simply be made by whichever project the CEO personally happens to prefer this particular quarter",
        "A publicly documented vulnerability meaningfully raises the threat side of the risk formula, since attackers actively scan for known, published flaws — so the risk-weighted case for the security upgrade may outweigh the loyalty app's revenue figure even though the upgrade has no revenue figure of its own",
      ],
      correctIndex: 3,
      modelAnswer:
        "Publishing the exact location of a broken lock in a public bulletin doesn't just describe a weakness — it actively invites people to go try it, which is very different from a weakness nobody knows about.\n\n• Risk = Vulnerability × Threat means a publicly documented flaw genuinely raises the threat side of the equation, since attackers routinely scan for known, published vulnerabilities.\n\n• Ranking IT initiatives shouldn't rely on whichever project has the flashiest revenue KPI attached — a risk-weighted case for preventing a costly breach can outweigh a project with a clear but smaller upside.\n\n• Why the others are wrong: the risk formula applies before an attack happens, not only after; an unrelated architecture review doesn't help decide between these two specific projects; and the two projects clearly do not carry identical risk profiles once the public advisory is factored in.\n\nSo the answer is: the public advisory raises real threat exposure, making the security upgrade's risk-weighted case strong even without its own revenue figure.",
    },
    {
      type: "mcq",
      prompt:
        "Bellwether Health Systems wants to unify its patient-scheduling, billing, and pharmacy systems under a single new platform, integrating them through APIs, while aligning the effort with its stated business goal of reducing patient wait times. Which Enterprise Architecture domain does 'integrating patient-scheduling, billing, and pharmacy systems through APIs' belong to, and how does this connect back to the principle that IT strategy must be developed in lockstep with business strategy?",
      options: [
        "Application Architecture; the API integration only creates real organisational value once it is deliberately tied to the stated business goal of reducing wait times, not simply built for its own sake",
        "Technology Architecture; alignment with business strategy is entirely irrelevant here, since choosing to integrate systems through APIs is treated as a purely technical, standalone decision",
        "Data Architecture; the alignment principle here specifically means the CFO must personally approve every single individual API call before any of it is actually coded",
        "Business Architecture; the API integration automatically belongs to this domain simply because the word 'business' happens to appear somewhere in the stated goal",
      ],
      correctIndex: 0,
      modelAnswer:
        "Wiring three separate rooms in a house together with new pipes and cables is Application-layer work, similar to Application Architecture connecting systems through APIs — but that plumbing only actually matters once it's clear what the renovation is meant to achieve.\n\n• Integrating existing systems through APIs is squarely Application Architecture, distinct from Data, Technology, or Business Architecture.\n\n• The alignment principle means this integration only becomes real organisational value once it is deliberately connected to the stated business goal, reducing patient wait times — not simply built as a technical exercise in isolation.\n\n• Why the others are wrong: API integration is a technical decision, but that doesn't make business alignment irrelevant; alignment isn't about a CFO approving individual API calls; and a domain isn't determined by which word literally appears in a goal statement.\n\nSo the answer is: Application Architecture, and it only creates value once tied to the actual business goal.",
    },
    {
      type: "mcq",
      prompt:
        "During Northwind Telecom's billing-system migration, a senior billing analyst who is respected by her peers keeps blocking the new process in meetings, insisting the old system 'just works fine.' Two other analysts are now clashing over her objection: one wants to override her decision outright, and the other wants to just let her keep using the old system indefinitely to avoid conflict. Using both change-management role definitions and the Thomas-Kilman conflict model, which role best describes the senior analyst, and which conflict style is each of the other two analysts showing?",
      options: [
        "She is a change agent actively supporting the rollout; one analyst shows Collaborating by combining approaches, and the other shows Compromising by meeting her partway on the disagreement",
        "She is a Resistor; the analyst who wants to override her shows Competing (high assertiveness, low cooperation), and the analyst who wants to let her keep the old system shows Accommodating (low assertiveness, high cooperation)",
        "She is a sponsor visibly backing the migration from above; both analysts show Avoiding, since neither one wants to formally escalate the underlying disagreement to a manager",
        "She is only an end user with no defined change-role pattern at all; both analysts show Collaborating, since both of them ultimately want the migration project to succeed",
      ],
      correctIndex: 1,
      modelAnswer:
        "One coworker who digs in and refuses to budge is playing a very different role from a colleague who tries to steamroll the disagreement, and a third who just lets it slide to avoid an argument — three distinct patterns, not one blur of 'conflict.'\n\n• Someone actively opposing a change, often from an unaddressed concern, is a Resistor — exactly the senior analyst's behaviour.\n\n• Wanting to override her decision outright is high assertiveness with low cooperation, which is Competing; wanting to simply let her keep the old system to avoid friction is low assertiveness with high cooperation, which is Accommodating.\n\n• Why the others are wrong: she isn't backing the change (ruling out change agent or sponsor), and Collaborating requires both people actively working together toward a combined solution, which neither analyst is doing here.\n\nSo the answer is: she is a Resistor, one analyst is Competing, and the other is Accommodating.",
    },
    {
      type: "mcq",
      prompt:
        "Oakridge Logistics pushes a routine security patch to all of its production systems overnight with no staged rollout, trusting the vendor's assurance that the patch is low-risk. The patch causes a global outage across its warehouses the next morning. A post-incident review finds the patch itself was not experimental technology — it was an approved, industry-standard update — but no one had confirmed a rollback plan or tested it against a representative slice of production systems before approval. Which case-study lesson from this unit does this best match, and what specific professional decision should have been confirmed before approving the release?",
      options: [
        "This matches the ASX case's lesson about outdated, ageing technology that had never been modernised; the missing decision was upgrading to entirely newer hardware across every warehouse before the patch was ever even considered for release",
        "This matches the Optus case's lesson about experimental, unproven technology being deployed too early; the missing decision was avoiding vendor security patches of any kind altogether, permanently, across every production system the company runs",
        "This matches the CrowdStrike case's lesson that industry-standard, trusted technology can still cause a global outage when the professional decisions around its release are weak; the missing decision was confirming a staged rollout and rollback plan rather than approving a single global push on vendor trust alone",
        "This has no meaningful connection to any of the unit's professional-practice case studies at all, since none of those earlier cases ever specifically involved a routine, vendor-approved security patch",
      ],
      correctIndex: 2,
      modelAnswer:
        "A trusted, well-reviewed medicine can still cause a mass reaction if a hospital hands it out to every patient at once overnight, with no one checking for a bad batch first and no plan for what to do if it goes wrong.\n\n• The CrowdStrike case's core lesson was that an industry-standard, trusted update from a reputable vendor still caused a global outage, because the professional decisions around testing and approving its release were weak, not because the technology was experimental.\n\n• The specific missing decision here is the same one: confirming a staged, canary-style rollout and a tested rollback plan before approving a single global push, rather than trusting the vendor's 'low-risk' label alone.\n\n• Why the others are wrong: nothing suggests outdated hardware or experimental technology was the cause, and the case clearly connects to a professional-practice lesson this unit has covered.\n\nSo the answer is: the CrowdStrike lesson applies directly, and the missing decision was a staged rollout with a confirmed rollback plan.",
    },
    {
      type: "multi",
      prompt:
        "Coastal Health Analytics' patient-risk-scoring AI is being reviewed by an ethics board. A community health advocacy group has no power over the company and no urgent claim right now, but its involvement is considered entirely legitimate given the model affects vulnerable patients. Separately, a former patient whose data was mishandled has significant social-media reach (power) and is actively demanding an urgent public response (urgency), but has not yet established any formal legitimate standing in the matter. Select ALL of the following that are correctly classified per the Salience Model.",
      options: [
        "The advocacy group is Discretionary — legitimacy only, with no power or urgent claim",
        "The advocacy group is Dominant — power and legitimacy together, but no urgency",
        "The former patient is currently Dangerous — power and urgency together, but no legitimacy",
        "The former patient is currently Definitive — power, legitimacy, and urgency all held together",
        "If the former patient later establishes formal legitimate standing, such as through a regulator ruling in their favour, they would become Definitive",
      ],
      correctIndices: [0, 2, 4],
      modelAnswer:
        "A funded charity with no seat at the table but an obviously appropriate interest is a very different case from an online figure with a huge following and a loud demand for action but no formal standing yet — the Salience Model gives each of these its own label.\n\n• Legitimacy only, with no power and no urgent claim, is exactly the Discretionary category, matching the advocacy group.\n\n• Power plus urgency without legitimacy is Dangerous, matching the former patient's current position — coercive and disruptive potential, but no established legitimate standing yet.\n\n• The Salience Model explicitly allows stakeholders to move between categories by acquiring a missing attribute: if the former patient later gains legitimacy, they would hold all three attributes and become Definitive.\n\n• Why the other two are wrong: the advocacy group has no power, ruling out Dominant, and the former patient doesn't yet have legitimacy, ruling out Definitive right now.\n\nSo the answer is: the advocacy group is Discretionary, the former patient is currently Dangerous, and gaining legitimacy would move them to Definitive.",
    },
  ],
};

export const INFO5990_FINAL_PRACTICE_PAPERS: ExamPaperSeed[] = [PAPER];
