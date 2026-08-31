import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 4,
  paperNumber: 1,
  title: "Week 4 Tutorial Practice Paper",
  topics:
    "Defining Project, Project Management Methodology, IT Lifecycle, Continuous IT Lifecycle, and Enterprise Architecture (Part A review, revisited from Week 3); three common reasons projects fail; comparing Waterfall, Agile, and DevOps on flexibility, delivery speed, and stakeholder involvement, plus best-fit project examples (Part B1); business drivers for the shift from a linear to a continuous IT lifecycle (Part B2); the HealthLink Systems case study — issues before the shift, why continuous lifecycle suited it better, Agile vs DevOps necessity, Enterprise Architecture's contribution, and integrating AI-based predictive analytics (Part C)",
  sourceFiles: ["tutorial/INFO5990 2026-S1 Week 04 Tutorial sheet.pdf"],
  questions: [
    {
      type: "mcq",
      prompt:
        "Part A asks students to define 'Project' in their own words. Which definition is most consistent with how this unit uses the term?",
      options: [
        "A temporary endeavour undertaken to create a unique product, service, or result, with a defined start and end",
        "Any ongoing departmental activity that repeats indefinitely without a fixed end date",
        "A permanent business function staffed by the same team for the life of the organisation",
        "Any task a manager assigns, regardless of whether it has a defined start or end",
      ],
      correctIndex: 0,
      modelAnswer:
        "A project is defined as a temporary endeavour with a unique outcome and a defined start and end — distinct from ongoing operations or routine departmental work, which repeat indefinitely rather than concluding once their unique result is delivered.",
    },
    {
      type: "mcq",
      prompt:
        "Part A also asks students to define 'Project Management Methodology.' Which definition correctly distinguishes it from 'IT Lifecycle'?",
      options: [
        "The stages a specific system passes through from initial planning to deployment and ongoing operation",
        "A structured set of principles, processes, and practices — such as Waterfall, Agile, or DevOps — used to plan, execute, and control a project",
        "An organisation's internal reporting structure showing exactly who approves IT investment decisions",
        "A single software tool, such as a ticketing system, used only to track individual project tasks day to day",
      ],
      correctIndex: 1,
      modelAnswer:
        "A Project Management Methodology (Waterfall, Agile, DevOps) is the structured approach used to plan, execute, and control a project — distinct from an IT Lifecycle, which describes the stages a system itself moves through (plan, build, deploy, operate), not the methodology used to manage that work.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement correctly distinguishes 'IT Lifecycle' from 'Continuous IT Lifecycle'?",
      options: [
        "IT Lifecycle and Continuous IT Lifecycle are simply two different names for one identical concept, with no practical difference between them at all",
        "Continuous IT Lifecycle describes stages that always end permanently after deployment, while IT Lifecycle instead cycles back to planning continuously",
        "IT Lifecycle describes stages that end after deployment; Continuous IT Lifecycle cycles the same stages continuously, feeding monitoring and feedback back into planning",
        "IT Lifecycle only ever applies to hardware-focused projects, while Continuous IT Lifecycle only ever applies to software-focused projects",
      ],
      correctIndex: 2,
      modelAnswer:
        "A traditional IT Lifecycle's stages conclude once a system is deployed. A Continuous IT Lifecycle cycles Plan → Design/Build/Test → Deploy/Troubleshoot → Monitor back to Plan, because instead of ending after deployment, IT work continues via monitoring, feedback, and updates.",
    },
    {
      type: "mcq",
      prompt:
        "Which definition best captures 'Enterprise Architecture' as a general concept (not a specific framework)?",
      options: [
        "A specific commercial software product used exclusively for designing network topology diagrams for IT teams",
        "A committee within an organisation responsible only for approving individual employees' laptop purchase requests",
        "A framework or set of standards that only very large multinational enterprises can ever meaningfully adopt or benefit from",
        "A structured blueprint aligning an organisation's business processes, IT systems, and technology infrastructure with its strategic goals",
      ],
      correctIndex: 3,
      modelAnswer:
        "Enterprise Architecture is a structured blueprint that aligns an organisation's business processes, applications, data, and technology with its strategic goals — a general concept that specific frameworks like Zachman or TOGAF each implement differently, and that applies regardless of organisation size.",
    },
    {
      type: "short",
      prompt:
        "In your own words, briefly distinguish IT Lifecycle from Enterprise Architecture, and explain why a student might confuse the two.",
      modelAnswer:
        "IT Lifecycle describes the stages one specific system moves through, from planning to deployment (and, if continuous, ongoing monitoring). Enterprise Architecture is the broader blueprint aligning ALL of an organisation's business processes, applications, data, and technology together, not just one system's delivery. They're easy to confuse because EA frameworks like TOGAF's ADM also describe lifecycle-like phases (architect, plan, govern), but EA's scope is organisation-wide, not one project's delivery cycle.",
    },
    {
      type: "mcq",
      prompt:
        "A project has crystal-clear, stable requirements from day one, but still fails because the team never anticipated a critical vendor's sudden price increase, and separately kept quietly expanding the feature list mid-build without updating the plan. Which TWO of the week's listed failure reasons does this best illustrate?",
      options: [
        "Inadequate Risk Management and Poor Scope Definition",
        "Unrealistic Timelines or Budgets and Resource Issues",
        "Poor Scope Definition alone explains both events",
        "Neither event matches any of the unit's listed reasons projects fail",
      ],
      correctIndex: 0,
      modelAnswer:
        "The unanticipated vendor price increase is a failure to anticipate and mitigate a foreseeable risk (Inadequate Risk Management), while quietly expanding the feature list without updating the plan is exactly the unclear-requirements, frequent-changes pattern of Poor Scope Definition — two distinct reasons, not one, even though the requirements were 'clear' at the very start.",
    },
    {
      type: "short",
      prompt:
        "List three reasons why projects fail (per this unit's material) and briefly explain why each negatively affects outcomes.",
      modelAnswer:
        "(1) Poor Scope Definition — unclear or constantly changing requirements mean the team keeps rebuilding work to match a moving target. (2) Inadequate Risk Management — failing to anticipate and mitigate foreseeable issues means problems surface late, when they're more expensive to fix. (3) Unrealistic Timelines or Budgets — committing to schedules/costs that don't match the actual scope forces corner-cutting or missed deadlines. (Resource Issues — not having the right people or skills available — is also an acceptable third reason.)",
    },
    {
      type: "mcq",
      prompt:
        "Comparing Waterfall, Agile, and DevOps together across flexibility, delivery speed, and stakeholder involvement, which statement is accurate?",
      options: [
        "Waterfall: high flexibility, the fastest possible delivery speed of the three, and continuous stakeholder involvement throughout; Agile: low flexibility, slow sequential delivery, and no stakeholder involvement at any stage of the project",
        "Waterfall: low flexibility, slow sequential delivery, stakeholders mainly involved upfront and at sign-off; Agile: high flexibility, fast iterative delivery, stakeholders involved every sprint; DevOps: high flexibility, fastest/continuous delivery, stakeholder involvement extends into live monitoring and feedback",
        "All three methodologies — Waterfall, Agile, and DevOps — are entirely identical across all three dimensions of flexibility, speed, and involvement; the only real difference is which specific tools each one happens to use",
        "Agile has the least stakeholder involvement of the three methodologies overall, because its short sprints simply don't leave enough time to gather any meaningful feedback",
      ],
      correctIndex: 1,
      modelAnswer:
        "Waterfall's sequential structure means low flexibility, slow end-to-end delivery, and stakeholders mostly involved at requirements and final sign-off. Agile's sprints add flexibility, faster iterative delivery, and stakeholder feedback each sprint. DevOps goes further still, with the fastest/continuous delivery and stakeholder involvement extending into production via live monitoring and rapid feedback — not just periodic reviews.",
    },
    {
      type: "mcq",
      prompt:
        "A small startup is building an MVP where user feedback is expected to reshape requirements every few weeks, and a national grid operator is building safety-certified control software with requirements that cannot change once approved. Which methodology best fits each, applying the same fit-to-context logic used for the NASA Waterfall example?",
      options: [
        "Startup MVP → Waterfall structured planning; grid operator → Agile sprints, since safety-critical systems always move the fastest under an Agile approach",
        "Both the startup and the grid operator should use identical methodologies, because project context never actually affects which methodology is the right choice",
        "Startup MVP → Agile (embraces evolving requirements); grid operator → Waterfall (stable requirements, certification-heavy documentation and testing)",
        "Startup MVP → DevOps automation only, and grid operator → Agile sprints only, since Waterfall is now considered obsolete for any modern project",
      ],
      correctIndex: 2,
      modelAnswer:
        "Agile fits the startup because its sprints absorb frequently changing requirements without restarting the whole project. Waterfall fits the grid operator for the same reason NASA's shuttle software used it: extremely well-defined, unlikely-to-change requirements plus certification-heavy documentation and rigorous testing suit a sequential, well-documented process better than iterative delivery.",
    },
    {
      type: "mcq",
      prompt:
        "A bank needs to push fraud-detection rule updates within hours of new fraud patterns emerging, and uses real-time dashboards to decide which fixes to prioritise first. Which TWO business drivers for the shift to a continuous IT lifecycle does this best illustrate?",
      options: [
        "Digital Transformation and Cloud & Automation only",
        "Agile & DevOps Practices only, since dashboards are unrelated to any listed driver",
        "None of the listed drivers apply to fraud detection specifically",
        "Customer Expectations (fast fixes/updates) and Data-Driven Decisions (monitoring informs priorities)",
      ],
      correctIndex: 3,
      modelAnswer:
        "Needing fixes within hours matches Customer Expectations — the driver about needing quick updates/fixes to stay competitive — while using dashboards to decide what to prioritise next matches Data-Driven Decisions, the driver specifically about continuous monitoring feeding into what gets worked on next.",
    },
    {
      type: "short",
      prompt:
        "Discuss at least two business drivers for the shift from a linear IT lifecycle to a continuous one, using this unit's own terms.",
      modelAnswer:
        "Customer Expectations — users now expect quick updates and bug fixes rather than waiting for the next scheduled release, which a linear lifecycle can't deliver fast enough. Data-Driven Decisions — continuous monitoring after deployment feeds real usage data back into deciding what to build or fix next, instead of only planning once at the start of a new linear cycle. (Digital Transformation, Cloud & Automation, and Agile & DevOps Practices are also acceptable drivers.)",
    },
    {
      type: "mcq",
      prompt:
        "HealthLink's core problem was siloed business and IT teams causing slow updates. Why was shifting to a continuous IT lifecycle more suitable than remaining with a linear approach?",
      options: [
        "A continuous lifecycle's ongoing monitoring-and-feedback loop lets fixes and features ship incrementally without waiting for an entire new linear cycle to complete, directly addressing the delay caused by siloed handoffs",
        "A continuous lifecycle removes the need for any testing whatsoever, so releases simply go out faster regardless of quality or reliability concerns",
        "A linear lifecycle is actually cheaper overall in every case, so there's no real advantage at all to switching for a company like HealthLink",
        "A continuous lifecycle eliminates the need for any planning stage entirely, since ongoing monitoring alone is fully sufficient to guide all future development work",
      ],
      correctIndex: 0,
      modelAnswer:
        "HealthLink's delays came from waiting for a full linear cycle (and its business/IT handoffs) to complete before anything shipped. A continuous lifecycle's Plan→Build→Deploy→Monitor loop lets updates ship incrementally as monitoring surfaces issues, directly targeting the slow, siloed handoff pattern that caused the original delays — not by skipping planning or testing.",
    },
    {
      type: "short",
      prompt:
        "How did Enterprise Architecture (EA) contribute to the long-term success of HealthLink's transformation?",
      modelAnswer:
        "TOGAF-based EA gave HealthLink a structured blueprint aligning its business processes, applications, data, and technology, so the shift to continuous delivery wasn't just a process change bolted on top — it was embedded in a governed architecture. This prevented the new continuous practices from creating a fresh set of silos or inconsistent systems, sustaining the improvement rather than letting it erode over time.",
    },
    {
      type: "scenario",
      prompt:
        "If HealthLink wanted to add AI-based predictive analytics for hospitals, how could Enterprise Architecture ensure smooth integration?",
      modelAnswer:
        "EA would map the new AI capability across its architecture domains before building it: Business Architecture — which clinical workflows the predictions actually feed into; Data Architecture — which patient/hospital data sources train and feed the model, with proper governance; Application Architecture — how the predictive service integrates via APIs with HealthLink's existing systems rather than sitting outside them; Technology Architecture — the cloud/infrastructure needed to run it reliably. Mapping the new capability this way (echoing the TOGAF university digital-transformation example) stops the AI feature from becoming another isolated silo.",
    },
    {
      type: "mcq",
      prompt:
        "Per Week 3's stakeholder-influence mapping (budget holders→scope, sponsors→timelines, technical leads→feasibility, users→adoption, regulators→rules and laws), which stakeholder's influence lever is most directly responsible for assessing whether HealthLink's shift to a TOGAF-based Enterprise Architecture is technically achievable?",
      options: [
        "Users, because adoption determines technical feasibility",
        "Technical leads, because their influence lever is specifically feasibility",
        "Regulators, because rules and laws always determine technical feasibility",
        "Sponsors, because timelines and feasibility are the same thing",
      ],
      correctIndex: 1,
      modelAnswer:
        "Week 3's mapping ties each stakeholder to a distinct lever — budget holders to scope, sponsors to timelines, users to adoption, regulators to rules/laws — and technical leads specifically to feasibility, making them the stakeholder whose influence lever most directly covers whether a technical shift like EA adoption is achievable.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: 'IT Lifecycle' and 'Continuous IT Lifecycle' are simply two different names for the exact same concept, with no meaningful difference.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. A traditional IT Lifecycle's stages end once a system is deployed. A Continuous IT Lifecycle cycles the same stages (Plan→Build→Deploy→Monitor) back to Plan continuously, because IT work keeps going after deployment via monitoring, feedback, and updates rather than stopping there.",
    },
    {
      type: "scenario",
      prompt:
        "A fintech startup has stable, well-documented regulatory requirements that rarely change, needs extensive up-front security certification, and cannot tolerate mid-project scope changes. Its IT lead is deciding between Waterfall, Agile, and DevOps for this system, and whether to invest in Enterprise Architecture from day one. Recommend an approach and justify it using this week's concepts.",
      modelAnswer:
        "Waterfall best fits this specific system: stable, well-documented, rarely-changing requirements plus certification-heavy testing mirror the same logic behind NASA's Waterfall choice for its shuttle software. Investing in Enterprise Architecture from day one is still worthwhile even under Waterfall, though — EA aligns future IT investments across the whole organisation before the system's architecture calcifies, so if the fintech later needs a more continuous, user-facing delivery model for other systems, it isn't retrofitting alignment after the fact.",
    },
    {
      type: "mcq",
      prompt:
        "Midway through a project, a regulator introduces a completely new compliance requirement the team hadn't planned for. Which methodology accommodates this change most naturally, and why?",
      options: [
        "Waterfall, because its sequential structure is specifically designed to absorb late-arriving requirement changes",
        "None of the three methodologies can accommodate a requirement introduced after the project has started",
        "Agile, because its iterative sprints let the backlog be reprioritised to absorb the new requirement without restarting the whole project",
        "DevOps cannot handle changing requirements at all, since it only concerns deployment automation",
      ],
      correctIndex: 2,
      modelAnswer:
        "Agile's sprint-based backlog lets a new requirement be reprioritised into upcoming iterations without restarting the whole project — unlike Waterfall's sequential, fixed-scope structure, which struggles to absorb late changes. DevOps also isn't purely about deployment automation; it commonly pairs with Agile's iterative planning, but the sprint-reprioritisation mechanism itself is the Agile trait being tested here.",
    },
    {
      type: "short",
      prompt:
        "Per Part B1, compare Waterfall, Agile, and DevOps specifically on stakeholder involvement (not speed or flexibility). How does the degree or timing of stakeholder involvement differ across the three?",
      modelAnswer:
        "Waterfall involves stakeholders mainly upfront (gathering requirements) and at the very end (final sign-off), with little involvement during execution. Agile involves stakeholders continuously, typically reviewing progress and giving feedback every sprint. DevOps extends this further still — stakeholder involvement continues into production itself, through live monitoring and rapid feedback from real usage, rather than stopping at periodic sprint reviews.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 4,
  paperNumber: 2,
  title: "Week 4 Lecture Practice Paper",
  topics:
    "Professional communication in IT (7Cs of communication, SBAR framework, written/verbal/presentation/non-verbal communication, barriers to communication, communication tools and channel selection, vague vs actionable updates, escalating early); teamwork (importance and mistaken beliefs, diversity and its benefits/challenges, team dynamics and challenges, Tuckman's stages of team development in depth, teams moving backwards, Belbin's nine team roles, Belbin-Tuckman synthesis, psychological safety and Google's Project Aristotle, Agile teamwork practices, conflict in the workplace, Thomas-Kilman conflict styles, task vs relationship conflict); stakeholder management (who stakeholders are, stakeholder analysis and mapping, the Power-Interest Matrix, the Salience Model and its seven stakeholder categories, engagement strategies, challenges and best practices); how communication, teamwork, and stakeholder management interconnect (Hospital EMR case study, mobile banking app case study); guest lecture on communication that survives contact with real people (stakeholder matrices as snapshots not facts, business urgency vs technical risk, written channel selection, the cost of unverified assumptions, changing industries)",
  sourceFiles: [
    "lecture/INFO5990 2026-S2 Week 04 - Professional communication, collaboration, and stakeholder management.pdf",
    "lecture/INFO5990_week04_Guest_Lecture_Falguni.pdf",
    "lecture/Week 04 - Profession-s1-low.transcript.md",
    "lecture/Reading 1 - The Salience Model for Stakeholder Classification.pdf",
    "lecture/Reading 2 - Tuckman’s Team Development Model.pdf",
    "lecture/Reading 3 - Belbin and Tuckman.pdf",
    "lecture/Extra Reading - A guide to Belbin team roles.pdf",
    "lecture/Extra Reading - Effective communication with stakeholders.pdf",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "A status update says 'the system has some issues affecting many users' with no other detail. Per the 7Cs, which C does this message most directly violate — and why not 'Correct' instead?",
      options: [
        "Concrete — it lacks specific facts, data, or examples, using vague quantifiers instead of actual numbers",
        "Correct — the sentence is grammatically wrong and also factually inaccurate as written",
        "Courteous — the message is rude and quite disrespectful toward its intended reader",
        "Coherent — the sentence simply doesn't flow logically from one idea to the next one",
      ],
      correctIndex: 0,
      modelAnswer:
        "The message isn't factually wrong or rude or illogical — it's just vague. The 7Cs define Concrete as using specific facts, data, or examples rather than abstract statements, which is exactly what 'some issues' and 'many users' fail to do; Correct instead means accurate and error-free, which this sentence technically is.",
    },
    {
      type: "mcq",
      prompt:
        "A message reads: 'The payment gateway has been down since 2pm today. This started right after this morning's certificate renewal. Logs show TLS handshake failures on the new certificate.' Which SBAR component does the certificate-renewal timing sentence represent?",
      options: [
        "Situation, because it states what is happening right now",
        "Background, because it provides the context or history that led to the issue",
        "Assessment, because it states the writer's analysis of the cause",
        "Recommendation, because it proposes the next action to take",
      ],
      correctIndex: 1,
      modelAnswer:
        "SBAR's Background component provides context or relevant history — 'what led to this issue, why is it important?' The certificate-renewal timing explains what preceded the outage, which is Background; the down-since-2pm sentence is the Situation, and the TLS handshake failure log detail is the Assessment (the analysis of the likely cause).",
    },
    {
      type: "short",
      prompt:
        "Per 'Barriers to communication in IT Teams,' a remote team member says a bug is fixed after only glancing at a passing local test, without documenting which edge cases were checked. A teammate later has to re-investigate from scratch. Which listed barrier does this best illustrate, and how does it differ from 'assumptions and lack of active listening'?",
      modelAnswer:
        "This illustrates 'poor documentation leading to knowledge gaps' — the missing record of which edge cases were checked forces the next person to redo the investigation. This differs from 'assumptions and lack of active listening,' which is about mishearing or presuming what someone else meant during a live exchange; here, the problem is a missing written record after the fact, not a misunderstanding during a conversation.",
    },
    {
      type: "short",
      prompt:
        "Per the guest lecture's channel-selection table, briefly explain what each of chat message, email, documentation, and a meeting is good for, and give one example of what belongs in each.",
      modelAnswer:
        "Chat message — fast and informal but easily lost; good for anything that would be fine to lose (e.g. 'can you jump on a call?'). Email — slower but on the record; good for decisions, commitments, and anything with a date (e.g. confirming a deadline). Documentation — written once, read for years; good for how something works and why it was built that way (e.g. an architecture decision record). A meeting — expensive, rich, and immediate; good for disagreement, ambiguity, or anything with emotion (e.g. resolving a heated scope dispute).",
    },
    {
      type: "mcq",
      prompt:
        "A status update says: 'Still working on the compliance report. The data is a bit messy. Will let you know.' Per the guest lecture's 'vague vs actionable update' checklist, which element would fixing 'the data is a bit messy' into a specific, quantified statement address?",
      options: [
        "Does anyone need to make a decision?",
        "When is the next update?",
        "What is the actual problem?",
        "What is complete?",
      ],
      correctIndex: 2,
      modelAnswer:
        "The checklist asks what is complete, what the actual problem is, the business impact, when the next update is due, and whether a decision is needed. 'The data is a bit messy' is vague about the actual problem — turning it into something specific (e.g. '8% of records have no matching ID') is what answers that particular missing element, not the other four.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: per the guest lecture, Slack/chat messages are the best source of truth for how a decision was made, because they create a permanent, unmodifiable record.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. The guest lecture specifically notes chat messages can be edited and leave only a trail, calling them fast and useful for quick decisions but not a source of truth — email (slower, on the record) or documentation are better suited for recording how a decision was actually made.",
    },
    {
      type: "mcq",
      prompt:
        "'Teamwork means everyone has to agree' is listed as a mistaken belief. What is the lecture's actual rebuttal, and how does it differ from the rebuttal to 'good teams don't have conflicts'?",
      options: [
        "Both of these mistaken beliefs actually share the exact same rebuttal in the lecture material, since agreement and conflict are treated there as meaning the same thing",
        "The rebuttal given by the lecture is that teamwork always inevitably slows everything down for the whole team, which is also exactly the rebuttal given to the second myth",
        "The rebuttal given by the lecture is that exactly equal contribution from every single team member is strictly required at all times, a point unrelated to either of these two myths",
        "The rebuttal is that healthy disagreements drive better outcomes — a different point from 'conflicts are normal, it's how they're resolved that matters,' which addresses whether conflict exists at all, not whether agreement is required",
      ],
      correctIndex: 3,
      modelAnswer:
        "The lecture pairs 'everyone has to agree' → 'No, healthy disagreements drive better outcomes' with a separate myth, 'good teams don't have conflicts' → 'conflicts are normal; it's how they're resolved that matters.' The first is about whether unanimous agreement is necessary; the second is about whether conflict's mere presence signals a bad team — related but distinct points, not interchangeable rebuttals.",
    },
    {
      type: "mcq",
      prompt:
        "Per Reading 2's detailed behaviour table, 'splinter groups form,' 'people push for position and power,' and 'cliques drive the team' describe which Tuckman stage — and how does that differ from Forming's behaviours?",
      options: [
        "Storming — Forming instead shows people checking each other out with no established norms yet, before any competition for position emerges",
        "Forming — these are the very first behaviours a brand-new team displays before any norms exist yet",
        "Norming — these particular behaviours typically emerge once roles and responsibilities have already been agreed",
        "Performing — these specific behaviours only ever appear once a team has already achieved a high level of trust",
      ],
      correctIndex: 0,
      modelAnswer:
        "Reading 2 lists 'splinter groups form,' 'people push for position and power,' and 'cliques drive the team' under Storming, distinct from Forming's 'no group history, unfamiliar with group members, norms not yet established, people check one another out' — Forming is tentative and polite, while Storming is where competition and factions actually emerge.",
    },
    {
      type: "mcq",
      prompt:
        "Per Reading 2's table, 'hidden agendas become open' and increased individual motivation are listed under which stage — and why might a student mistakenly place them under Performing instead?",
      options: [
        "Performing, since only a fully high-performing, mature team that has already worked closely together for several years could ever be honest enough about any hidden agendas",
        "Norming — because this is exactly where trust and feedback are just beginning to solidify enough for previously unspoken issues to finally surface, whereas Performing is marked by 'no surprises' since such issues are already resolved by then",
        "Storming, because open conflict and previously hidden agendas are essentially treated as being exactly the same underlying phenomenon throughout this particular week's assigned reading",
        "Forming, since a brand-new team that has just met for the first time has no hidden agendas of any kind to reveal yet",
      ],
      correctIndex: 1,
      modelAnswer:
        "Reading 2 places 'hidden agendas become open' and 'more individual motivation' under Norming, alongside building trust and high feedback — a student might expect this at Performing, but Performing is instead marked by 'no surprises' and 'little waste,' meaning by that stage such issues have already surfaced and been resolved during Norming.",
    },
    {
      type: "scenario",
      prompt:
        "A senior developer with ten years on a legacy stack leaves the team mid-project, and is replaced by a junior developer while the team simultaneously migrates to a brand-new platform. Using the lecture's own reasoning about what moves teams backward, which Tuckman stage is this team likely to regress to, and why?",
      modelAnswer:
        "Likely back toward Storming (or even Forming), because the lecture lists both 'a new person joins or someone leaves' and 'a new platform or process is introduced' as things that can move a team backward — and this scenario combines both at once. What helps recover is reconfirming responsibilities, agreeing on what 'done' now means on the new platform, identifying who can make decisions, and establishing how issues will be escalated, echoing the same anecdote about a 10-year ASP Classic expert effectively becoming a newcomer once the platform changed.",
    },
    {
      type: "mcq",
      prompt:
        "Per Belbin's Team Roles, someone is described as creative and free-thinking, generating ideas and solving difficult problems, but ignoring incidental details and struggling to communicate effectively. Which role is this?",
      options: [
        "Shaper — challenging and dynamic, thriving on pressure",
        "Specialist — single-minded and dedicated, but contributing only on a narrow front",
        "Plant — creative, imaginative, free-thinking, but prone to ignoring incidentals and being too preoccupied to communicate effectively",
        "Resource Investigator — outgoing and enthusiastic, but over-optimistic and losing interest quickly",
      ],
      correctIndex: 2,
      modelAnswer:
        "Belbin's Plant role is specifically described as creative, imaginative, and free-thinking, generating ideas and solving difficult problems, with the associated weaknesses of ignoring incidentals and being too preoccupied to communicate effectively — matching this description exactly, unlike Shaper (thrives on pressure, risks offending people) or Specialist (narrow focus, dwells on technicalities).",
    },
    {
      type: "mcq",
      prompt:
        "Per Reading 3's synthesis of Belbin and Tuckman, at which stage does the team most need Plants (to generate new ideas) and Monitor Evaluators (to analyse them dispassionately) working together?",
      options: [
        "Forming, when the team is still getting to know each other's strengths",
        "Norming, when roles and responsibilities are already agreed",
        "Performing, when the team is already autonomous and high-functioning",
        "Storming, when the team begins suggesting and competing over ideas",
      ],
      correctIndex: 3,
      modelAnswer:
        "Reading 3 places Plants (generating new ideas) and Monitor Evaluators (analysing them dispassionately) specifically at Storming, when the team begins suggesting and competing over ideas — by Norming, Reading 3 instead warns that Plants introducing new ideas risk causing disruption, since work is already underway by then.",
    },
    {
      type: "short",
      prompt:
        "Per Reading 3, what specific risk does a Shaper pose during Storming, and how can a Co-ordinator help offset a related risk during Forming?",
      modelAnswer:
        "During Storming, a Shaper's competitive streak risks turning aggressive or confrontational, which needs to be addressed to protect relationships going forward — though Shapers are also valuable there for preventing the Co-ordinator from getting too absorbed in team politics and for pushing discussion from ideas to outcomes. During Forming, the related risk is that team members avoid difficult topics for fear of causing conflict; a good Co-ordinator helps by bringing the team together and identifying how each person can contribute, surfacing those topics constructively before Storming arrives.",
    },
    {
      type: "mcq",
      prompt:
        "Google's Project Aristotle (2012–2014) studied 180+ teams to find what makes teams effective. Which statement accurately reports its finding?",
      options: [
        "Psychological safety was the number one factor for team success, more important than expertise or structure",
        "Technical expertise was found to be the single most important factor for team success",
        "Team structure and clearly defined processes mattered more than any other factor",
        "The study found no single factor reliably predicted team success",
      ],
      correctIndex: 0,
      modelAnswer:
        "Project Aristotle's finding was that psychological safety — the shared belief that team members can take risks without fear of embarrassment or punishment — was the number one factor for team success, ranked above expertise or structure, not the other way around.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement correctly distinguishes a Sprint Review from a Sprint Retrospective?",
      options: [
        "A Sprint Retrospective is where stakeholders come to see a demo of the work, while a Sprint Review is instead only ever held for the team itself internally",
        "A Sprint Review is where the team demonstrates completed work and gets feedback from stakeholders; a Sprint Retrospective is an internal discussion of what worked well and what could be improved",
        "Both meetings serve an entirely identical purpose within a sprint and can be freely used interchangeably by any Agile team",
        "A Sprint Review happens every single day of the sprint, while a Sprint Retrospective happens only once across the entire project's lifetime",
      ],
      correctIndex: 1,
      modelAnswer:
        "The Sprint Review is where the team reviews accomplishments against planned sprint work and often demonstrates results to get stakeholder feedback, while the Sprint Retrospective is a separate, internal discussion at the end of an iteration about what worked well and what could be improved — one faces outward to stakeholders, the other faces inward to the team.",
    },
    {
      type: "mcq",
      prompt:
        "In a tutorial poll, students were asked how to resolve an urgent bug-fix disagreement between two developers who both want the fastest safe fix and are willing to combine their approaches. Per the Thomas–Kilman model, which conflict style does this represent?",
      options: [
        "Competing — high assertiveness, low cooperation",
        "Avoiding — low assertiveness, low cooperation",
        "Collaborating — high assertiveness, high cooperation",
        "Compromising — medium assertiveness, medium cooperation",
      ],
      correctIndex: 2,
      modelAnswer:
        "Both developers assertively pursue the best outcome while actively cooperating and combining approaches — high assertiveness plus high cooperation is exactly Collaborating ('I reckon we can both get what we need'), not Competing (only one wins), Avoiding (neither engages), or Compromising (meeting halfway rather than combining fully).",
    },
    {
      type: "mcq",
      prompt:
        "In the same tutorial poll, a teammate disagrees with the UI colour choice but simply goes along with what the more invested teammate wants, to keep the peace. Which Thomas–Kilman style is this, and why not Compromising?",
      options: [
        "Compromising, because any form of giving in at all technically counts as meeting somewhere in the middle",
        "Competing, because the more invested teammate is the one actively asserting their own preference here",
        "Avoiding, because no real discussion about the colour choice ever actually happened between the two teammates",
        "Accommodating — low assertiveness, high cooperation, giving in fully rather than meeting in the middle, which is what Compromising would involve",
      ],
      correctIndex: 3,
      modelAnswer:
        "Simply going along with the other person's preference — low assertiveness, high cooperation — is Accommodating ('OK, let's just do it your way'), not Compromising, which would involve both people meeting partway rather than one side fully yielding.",
    },
    {
      type: "mcq",
      prompt:
        "A team debates whether to use Agile or Waterfall for a project, while separately, two teammates clash over each other's tone and personal style. Which statement correctly distinguishes these two conflicts?",
      options: [
        "The methodology debate is task (cognitive) conflict, which can be constructive; the personal clash is relationship (affective) conflict, which is usually destructive",
        "Both of these are examples of relationship conflict, since any disagreement at all between teammates counts as being personal",
        "The methodology debate is actually relationship conflict, since methodology choices are always driven by personal preferences",
        "Both of these are examples of task conflict instead, since they both simply occur somewhere at work",
      ],
      correctIndex: 0,
      modelAnswer:
        "Task (cognitive) conflict is disagreement about work-related issues like goals, ideas, or processes — the Agile-vs-Waterfall debate — and can stimulate better decisions. Relationship (affective) conflict is based on personal incompatibilities like tone or ego, is usually destructive, and reduces team cohesion — exactly the personality clash described.",
    },
    {
      type: "mcq",
      prompt:
        "During a dealer website migration, the dealer principal is initially classified as 'keep satisfied' (high power, low interest) on the power-interest matrix. Once the advertising campaign begins in two hours, they move to 'manage closely.' Why does the classification change even though it's the same person?",
      options: [
        "Because the power-interest matrix is fixed permanently by job title and never actually changes",
        "Because the matrix is a snapshot of the current situation, not a permanent fact about a person — urgency and interest shift as circumstances change",
        "Because the matrix is only ever built once at project kickoff and cannot be revisited",
        "Because the integration provider's position on the matrix automatically determines the dealer principal's position",
      ],
      correctIndex: 1,
      modelAnswer:
        "The lecture explicitly frames the power-interest matrix as 'a snapshot, not a fact about a person' — as the campaign deadline approaches, the dealer principal's interest and urgency rise, moving them into 'manage closely,' even though their underlying power and role haven't changed at all.",
    },
    {
      type: "mcq",
      prompt:
        "A local charity that receives funding from a company has no power over the project and no urgent claims, but its involvement is entirely appropriate and legitimate. Per the Salience Model, which category is this?",
      options: [
        "Dormant — power only",
        "Demanding — urgency only, with no power or legitimacy",
        "Discretionary — legitimacy only, with no power or urgency",
        "Dependent — legitimacy and urgency, but no power",
      ],
      correctIndex: 2,
      modelAnswer:
        "The Salience Model defines Discretionary stakeholders as legitimate but with no power and no urgent claims — exactly matching a funded charity, which the reading gives as its own example, distinct from Dormant (power only) or Dependent (legitimacy plus urgency, but still no power).",
    },
    {
      type: "mcq",
      prompt:
        "A stakeholder previously had power and urgency but no legitimacy (Dangerous). They later win a court case establishing their legal standing in the matter. What does this stakeholder become?",
      options: [
        "Dominant — power and legitimacy, but no urgency",
        "Dependent — legitimacy and urgency, but no power",
        "They remain Dangerous, since legitimacy cannot be acquired after the fact",
        "Definitive — power, legitimacy, and urgency together, the highest-priority category",
      ],
      correctIndex: 3,
      modelAnswer:
        "The Salience Model explicitly describes stakeholders transitioning between categories by acquiring a missing attribute. A Dangerous stakeholder (power + urgency) who gains legitimacy now possesses all three attributes, making them Definitive — the highest-priority category demanding the utmost attention.",
    },
    {
      type: "short",
      prompt:
        "Explain what 'Power + Legitimacy = Authority' means in the Salience Model, and why a Dangerous stakeholder (power + urgency, no legitimacy) is not considered to have authority despite having power.",
      modelAnswer:
        "The Salience Model treats Authority as the combination of Power (ability to influence) and Legitimacy (appropriateness of involvement) together — not power alone. A Dangerous stakeholder has power and urgency but lacks legitimacy, meaning their claim isn't considered appropriate or rightful; they can still be coercive or disruptive, but without legitimacy they don't have genuine Authority in the model's terms, only raw influence.",
    },
    {
      type: "mcq",
      prompt:
        "Comparing the Power–Interest Matrix and the Salience Model, what is the key structural difference between them?",
      options: [
        "The Power–Interest Matrix uses two attributes (power, interest) across four quadrants; the Salience Model adds a third attribute (legitimacy and urgency), producing more granular categories",
        "Both of these models use exactly the same three underlying attributes and therefore produce completely identical categories",
        "The Power–Interest Matrix is actually the more advanced model of the two, because it has more distinct categories than the Salience Model",
        "The Salience Model only ever applies to internal organisational stakeholders, while the Power–Interest Matrix only ever applies to external ones",
      ],
      correctIndex: 0,
      modelAnswer:
        "The Power–Interest Matrix classifies stakeholders on two dimensions (power and interest) into four quadrants. The Salience Model adds legitimacy and urgency as a third dimension, producing a more granular set of categories (Dormant, Discretionary, Demanding, Dominant, Dependent, Dangerous, Definitive) that a purely 2D grid can't distinguish.",
    },
    {
      type: "mcq",
      prompt:
        "Per the engagement-strategy levels (Inform, Consult, Involve, Collaborate, Empower), which strategy is illustrated by giving product owners in an Agile team the authority to make release decisions themselves?",
      options: [
        "Inform — sending them a newsletter about the decision after it's made",
        "Empower — giving them the decision-making authority directly",
        "Consult — asking for their input before someone else decides",
        "Collaborate — co-creating the decision jointly with the team",
      ],
      correctIndex: 1,
      modelAnswer:
        "Empower is specifically defined as giving decision-making authority, with the lecture's own example being product owners in Agile — distinct from Consult (seeking input) or Collaborate (co-creating jointly but not necessarily holding sole authority).",
    },
    {
      type: "scenario",
      prompt:
        "Using the EMR (Hospital Electronic Medical Records) case's own framing — communication as the glue, teamwork as the engine, and stakeholder management as the direction — explain how failing at just stakeholder management alone could undermine the project even if communication and teamwork were both done well.",
      modelAnswer:
        "Even with clear written documentation, daily stand-ups, and presentations (good communication), and developers/testers/UX designers collaborating well in Agile sprints (good teamwork), the project could still fail if administrators' expectations were never actually managed — because stakeholder management is what 'ensures the team is building the right thing, aligned with expectations.' A well-communicated, well-built system that doesn't match what stakeholders actually needed still risks rejection, showing why all three are necessary together, not just two of the three.",
    },
    {
      type: "scenario",
      prompt:
        "In the end-of-lecture mobile banking app case, executives want a faster release while compliance officers demand more security checks, testers complain developers don't document enough, developers say deadlines are too tight, and the client says they're 'not sure what's really happening' with the project. Identify two communication failures, recommend a conflict-resolution strategy for the developer–tester conflict, and place executives, compliance officers, and end-users on the Power–Interest Matrix.",
      modelAnswer:
        "Communication failures: the client's 'not sure what's really happening' shows a lack of clear, regular updates, and the tester/developer dispute over documentation shows a breakdown in written communication between roles. The developer–tester conflict is task conflict, not relationship conflict, so Collaborating is the right approach — working together to agree on a documentation standard both can sustain, rather than one side simply winning. On the Power–Interest Matrix: executives (high power, high interest) → manage closely; compliance officers (high power due to regulatory authority, high interest) → manage closely, or keep satisfied if their day-to-day involvement is lower; end-users/customers (lower power, high interest as the system directly affects them) → keep informed.",
    },
    {
      type: "mcq",
      prompt:
        "Week 2 lists 'creates silos and reduces flexibility' as a Functional-structure con, and Week 3 covers the Business/IT silo split (development focused on features, operations on cost and reliability). How does this week's 'barriers to communication in IT teams' content (jargon, poor documentation) extend that same thread?",
      options: [
        "It is entirely unrelated — organisational structure and communication barriers are two completely separate topics with absolutely no connection between them",
        "This week's content actually proves that both Week 2 and Week 3 were wrong about silos ever being a real problem for any organisation",
        "It describes the day-to-day mechanism through which structural silos actually fail in practice — jargon and undocumented handoffs are what makes cross-silo coordination break down, not just the org chart itself",
        "Communication barriers of this kind only ever affect flat organisational structures, and never affect functional ones at all",
      ],
      correctIndex: 2,
      modelAnswer:
        "Week 2 identifies organisational structure (grouping by specialism) as a structural root cause of silos, and Week 3 describes the resulting Dev/Ops focus split. This week's communication barriers — technical jargon, poor documentation, remote collaboration challenges — are the concrete, day-to-day mechanisms through which that structural silo actually causes coordination to fail, connecting structure (Week 2), the Dev/Ops split (Week 3), and communication practice (Week 4) into one continuous thread rather than three unrelated topics.",
    },
    {
      type: "mcq",
      prompt:
        "Belbin originally hypothesized that teams composed of the highest-IQ individuals ('Apollo' teams) would perform best. What did his research actually find, and why?",
      options: [
        "Apollo teams consistently finished first, because raw intelligence was the single strongest predictor of team performance across every trial",
        "Apollo teams performed exactly average, because intelligence had no measurable effect on team outcomes in either direction",
        "Apollo teams typically finished close to last, because their assertive, highly intelligent members were prone to destructive debate and internal competition rather than collaboration",
        "Apollo teams finished last only when led by a weak chairperson, but otherwise always outperformed mixed-ability teams",
      ],
      correctIndex: 2,
      modelAnswer:
        "Apollo teams (highest-IQ members) typically finished close to or dead last in Belbin's simulations — difficult to manage, prone to destructive and unresolved debate, and more internally competitive than collaborative. The rare successful Apollo teams needed less-assertive members plus a strong chairperson, not just raw intelligence, which is what shifted Belbin's research away from an intelligence-based hypothesis and toward team-role balance.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: per 'A Guide to Belbin Team Roles,' Belbin's research means a team must be composed of nine individuals, one playing each team role, in order to be balanced.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. Most people can perform at least three of the nine roles well, so a balanced team is possible with as few as three people. In practice the Guide states the optimal team size is four to six: fewer than four risks unfilled role voids, more than six risks role surpluses, and once a team passes about ten people, informal 'inner circles' tend to form as members gravitate back to a more functional size.",
    },
    {
      type: "mcq",
      prompt:
        "A team has no one who ranks Shaper among their top three preferred roles, so no one naturally pushes the team toward decisive action. Per the Guide's terminology, what is this an example of, and which type of imbalance does the Guide say is typically harder to correct?",
      options: [
        "This is a team role surplus; surpluses are easier to address than voids, since surplus members simply stop contributing altogether",
        "This is a team role void; voids are generally easier to address than surpluses, since a manageable-role member can stretch into the missing role on an occasional basis",
        "This is a team role void; voids are always harder to fix than surpluses, since a missing role can never be filled by anyone else on the team",
        "This is a team role surplus; surpluses and voids are equally easy to address using the exact same correction strategy",
      ],
      correctIndex: 1,
      modelAnswer:
        "A missing Shaper strength is a team role void. The Guide says voids are generally the easier imbalance to address: look to a member for whom that role is 'manageable' (ranked 4-6) and have them stretch into it as needed, since the gap is usually only felt occasionally. Surpluses are harder, because members who share a preferred role tend to keep indulging it — brainstorming stays fun for a Plant-heavy team long after the point of diminishing returns — even after the team has agreed who should lead that role.",
    },
    {
      type: "mcq",
      prompt:
        "Per the Guide's 'Roles needed during project phases' table, a team is in the Contacts phase — making the external connections the project depends on. Which two team roles does the table say are in greatest demand at that specific phase?",
      options: [
        "Plant and Resource Investigator",
        "Monitor Evaluator and Specialist",
        "Resource Investigator and Team Worker",
        "Shaper and Coordinator",
      ],
      correctIndex: 2,
      modelAnswer:
        "The Guide's phase table pairs each phase with two roles: Needs → Shaper and Coordinator; Ideas → Plant and Resource Investigator; Plans → Monitor Evaluator and Specialist; Contacts → Resource Investigator and Team Worker; Organization → Implementer and Coordinator; Follow-through → Completer Finisher and Implementer. Contacts specifically calls on Resource Investigator (making outside connections) and Team Worker.",
    },
    {
      type: "mcq",
      prompt:
        "A team member strong in the Plant role becomes briefly distracted and lost in thought during a meeting. Per the Guide's distinction between allowable and disallowable weaknesses, how does this compare to that same person simply forgetting to attend the meeting entirely?",
      options: [
        "Both are equally disallowable weaknesses, since any lapse in attention during a meeting should always be corrected immediately",
        "Both are equally allowable weaknesses, since any weakness connected to a person's preferred role should always be left completely unaddressed",
        "Becoming briefly distracted is disallowable because it disrupts the meeting, while forgetting to attend is allowable because it affects no one else",
        "Becoming briefly distracted is an allowable weakness tied to the Plant strength itself; forgetting to attend entirely crosses into a disallowable weakness that needs correcting",
      ],
      correctIndex: 3,
      modelAnswer:
        "The Guide frames this as a matter of degree: the absent-mindedness that accompanies Plant creativity is generally allowable and can be compensated for by other roles (e.g. a Completer Finisher), but if the person over-indulges that tendency and misses a meeting entirely, that crosses into disallowable territory needing correction — the goal isn't eliminating the weakness completely, just keeping it from becoming disruptive.",
    },
    {
      type: "short",
      prompt:
        "What does the Guide mean by 'Coherence' as one of the three primary individual applications of Belbin's research, and why does it say Coherence correlates more strongly with effective leadership than any single team role does?",
      modelAnswer:
        "Coherence is the degree to which a person sees themselves the way others actually see them — being genuine, self-aware, and consistent rather than having self-perception drift from observed behaviour. The Guide argues Coherence correlates more strongly with effective leadership than any of the nine team roles because it isn't about which role a person plays, but about how accurately they know and play to their own strengths while managing their weaknesses — coherent people are easier to place into suitable tasks and are seen as predictable and trustworthy, regardless of which specific role they're strongest in.",
    },
    {
      type: "scenario",
      prompt:
        "Three team leads each describe a recurring problem: (1) a Coordinator delegates an important decision to a junior member, then gets too distracted by other tasks to check in, so the junior ends up making calls that should have stayed with the lead; (2) a Team Worker avoids saying anything when asked to choose between two competing design options, letting the disagreement fester; (3) an Implementer resists switching away from a seven-year-old tool even though the team has clearly outgrown it. Match each situation to its role's characteristic weakness, and explain what the underlying failure mode has in common with, and differs from, the other two.",
      modelAnswer:
        "(1) Coordinator: delegation morphing into abdication — attention to detail across many balls in play suffers, so oversight erodes instead of being consciously handed off. (2) Team Worker: discomfort with conflict blocking progress — the drive for harmony becomes an excuse to avoid taking a stance, letting an underlying issue go unresolved rather than surfacing it constructively. (3) Implementer: rigidity and aversion to risk/uncertainty — disciplined, practical execution tips into resistance to any change, even a clearly needed one. All three show a role's core strength (delegating well, seeking harmony, disciplined execution) tipping into its allowable weakness when overindulged, but the specific mechanism differs: a lapse in oversight, avoidance of necessary conflict, and resistance to necessary change are three distinct failure modes, not interchangeable symptoms of 'being a bad team member.'",
    },
    {
      type: "scenario",
      prompt:
        "In the Guide's case study, Pete was promoted into a sales management role and initially struggled badly, equating 'leadership' with the Coordinator role — one of his actual weakest areas, since he had a short attention span, disliked detailed follow-up, and tended to dominate meetings. Using the Guide's concepts of Role-playing and Coherence, explain what Pete misunderstood and how he turned his division around without trying to become a different person.",
      modelAnswer:
        "Pete lacked Coherence at first: he assumed effective leadership required playing the Coordinator role, but his actual strengths were closer to Shaper-like drive plus Resource-Investigator-style networking and opportunistic lead generation, not Coordinator's patient, delegate-and-consult style. Rather than forcing himself into his weakest role — which the Guide's Role-playing principle warns against, since it recommends seeking out preferred roles and delegating least-preferred ones — Pete hired a strong Coordinator as his second-in-command to cover that gap, and refocused himself on what he did well: connecting with resources and pursuing new leads (the Resource Investigator role). His division's turnaround came from aligning his role with his actual strengths, not from trying to become a better Coordinator himself.",
    },
    {
      type: "short",
      prompt:
        "Name the three primary individual applications of Belbin's research listed in the Guide, and briefly state what each one is about.",
      modelAnswer:
        "(1) Role-playing — deciding which team role to play in a given situation, generally by seeking out your preferred roles and delegating your least-preferred ones rather than forcing yourself into a weak role. (2) Coherence — making sure how you see yourself matches how others actually see you. (3) Allowable weaknesses — learning to manage, not eliminate, the weaknesses that are the natural flipside of your strengths, since trying to fix them outright often damages the associated strength too.",
    },
    {
      type: "mcq",
      prompt:
        "Per Bourne's (2013) framework adopted in the stakeholder communication reading, a project team has already identified its stakeholders and ranked whose needs matter most, and is now deciding what specific engagement approach to use for each one. Which of Bourne's five steps are they in the middle of, and what comes immediately after it?",
      options: [
        "Step 1, Identify all stakeholders; step 2, Prioritize stakeholder needs, comes next",
        "Step 3, Visualize and decide the stakeholder management strategy; step 4, Engage stakeholders, comes next",
        "Step 4, Engage stakeholders; step 5, Monitor stakeholder communication, comes next",
        "Step 5, Monitor stakeholder communication; there is no step after this, since it is the framework's final step",
      ],
      correctIndex: 1,
      modelAnswer:
        "Bourne's five steps are: (1) Identify all stakeholders, (2) Prioritize stakeholder needs, (3) Visualize and decide the necessary stakeholder management strategy, (4) Engage stakeholders, and (5) Monitor stakeholder communication throughout the project. Having already identified and prioritized stakeholders, deciding the specific engagement approach for each one is Step 3, immediately followed by Step 4, actually engaging them.",
    },
    {
      type: "mcq",
      prompt:
        "A project team drafts its communication plan and communication matrix, and integrates its chosen communication tools into the organization's broader strategy, before any work on the project itself begins. Per the reading's three-stage Communication Framework for Stakeholder Relationship Management, which project stage does this activity belong to?",
      options: [
        "Project Execution Stage",
        "This activity spans all three stages equally and cannot be assigned to just one",
        "Project Close-Out Stage",
        "Project Planning Stage",
      ],
      correctIndex: 3,
      modelAnswer:
        "The reading's framework assigns creating awareness, preparing the communication plan/matrix, and integrating communication tools specifically to the Project Planning Stage — before execution begins. The Execution Stage instead covers managing stakeholder engagement, monitoring/control, team performance, and risk management day to day, while the Close-Out Stage covers overcoming resistance to change and building long-term relationships as the project wraps up.",
    },
    {
      type: "mcq",
      prompt:
        "During a project, the client team and the contractor's team each believe they are the ones who should field questions from a nervous end-user group, and messages sometimes reach the end-users twice, worded differently by each side. Per the reading's interview findings on major problems in managing stakeholder relationships, which specific problem does this best illustrate?",
      options: [
        "Effectiveness of existing stakeholder relationship management policies",
        "Communication as a tool for risk management",
        "Awareness in the organization about stakeholder relationship management practices",
        "Lack of a single point of contact",
      ],
      correctIndex: 3,
      modelAnswer:
        "The interview participants specifically listed 'lack of single point of contact' as one of the major problems in managing stakeholder relationships, alongside information distortion, delay in information, miscommunication between important stakeholders, conflicts between client and contractor (or internal team conflicts), and lack of trust amongst stakeholders — exactly the situation where two sides both message the same stakeholder group without coordinating.",
    },
    {
      type: "mcq",
      prompt:
        "Freeman (1984), as cited in the stakeholder communication reading, defines a stakeholder as 'any group or individual who can affect or is affected by the achievement of the organization's objectives.' Which statement correctly distinguishes this from Mitchell et al.'s (1997) salience-based approach covered elsewhere this week?",
      options: [
        "Freeman's definition identifies who counts as a stakeholder at all; Mitchell's model instead classifies stakeholders who already qualify by how much power, legitimacy, and urgency each one holds",
        "Freeman's and Mitchell's approaches are identical, since both use the same three attributes of power, legitimacy, and urgency to define a stakeholder",
        "Freeman's definition only applies to internal stakeholders, while Mitchell's salience model only applies to external ones",
        "Mitchell's model defines who counts as a stakeholder, while Freeman's definition is only used to rank stakeholders by priority after they've already been identified",
      ],
      correctIndex: 0,
      modelAnswer:
        "Freeman's definition answers the more basic question of who counts as a stakeholder at all — anyone who can affect or is affected by the organization's objectives. Mitchell et al.'s Salience Model operates one level down: it assumes a set of stakeholders has already been identified, then classifies and prioritizes them by how much power, legitimacy, and urgency each one holds (Dormant, Discretionary, Dangerous, Definitive, etc.) — identification versus classification, not two competing definitions of the same thing.",
    },
  ],
};

export const WEEK_4_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
