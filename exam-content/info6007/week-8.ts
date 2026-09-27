import type { ExamPaperSeed } from "../types";

// NOTE: The Week 8 LECTURE topic is Procurement Management. The Week 8
// TUTORIAL sheet's topic is Risk Management (the Week 7 lecture topic,
// applied fresh to a Mobile Banking App scenario) — the tutorial runs a week
// behind the lecture. Paper 1 (tutorial) is therefore a risk-management
// paper; Paper 2 (lecture) is the procurement-management paper.

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 8,
  paperNumber: 1,
  title: "Week 8 Practice Paper — Tutorial",
  topics:
    "Risk management applied to a Mobile Banking App (AI spending insights + biometric authentication): risk identification and categorisation (Market, Financial, Technology, People, Process) with positive/negative framing; qualitative risk analysis and the probability-impact matrix; threat response strategies (avoid/mitigate/transfer/accept/escalate); opportunity response strategies (exploit/enhance/share/accept); the risk register and its fields; Agile/Hybrid risk practices and early stakeholder engagement; continuity with Week 7's risk-management theory and Week 7's tutorial project-board workflow.",
  sourceFiles: ["tutorial/Tutorial sheet INFO6007 Week 08 .pdf"],
  readings: [
    {
      beforeQuestion: 0,
      title: "Mobile Banking App: Identifying Risks",
      body: "You're part of a team building a new mobile banking app. It has two headline features: AI-driven spending insights that studies your spending and suggests budgets, and biometric authentication that lets you log in with your fingerprint or face instead of a password.\n\nBefore you can manage a risk, you have to actually spot it and sort it into a bucket.\n\n• Market: will people actually want this, will a competitor beat you to it.\n\n• Financial: costs, funding, revenue going wrong.\n\n• Technology: the tech itself failing, being hacked, or not working as intended.\n\n• People: team members, skills, morale.\n\n• Process: how the team works — approvals, hand-offs, unclear steps.\n\n• Every risk is also either negative (a threat, something that could hurt the project) or positive (an opportunity, something that could help it) — the same five categories cover both.",
    },
    {
      beforeQuestion: 5,
      title: "Qualitative Risk Analysis",
      body: "Once risks are identified, you rate each one by how likely it is (probability) and how bad it would be if it happened (impact), then plot it on a probability-impact matrix. A rare event can still be high priority if its impact is severe enough — probability and impact are judged independently, never just added together.\n\n• Risk 1 — a biometric data breach exposing customer fingerprints: Low probability, Very High impact.\n\n• Risk 2 — minor glitches in the AI spending-insight recommendations: High probability, Low impact.\n\n• Qualitative analysis is a subjective High/Medium/Low sort using a matrix — it does not require a statistical simulation or a precise numeric calculation. That is quantitative analysis instead.",
    },
    {
      beforeQuestion: 10,
      title: "Threat Response Strategies",
      body: "For a negative risk (a threat), the team picks one of five response strategies.\n\n• Avoid: remove the threat entirely, for example dropping a risky feature.\n\n• Mitigate: reduce the threat's probability or impact while keeping the feature, for example adding extra safeguards.\n\n• Transfer: shift the consequences of the risk onto a third party, for example buying insurance so someone else covers the loss if it happens.\n\n• Accept: do nothing proactive and live with the consequences if it happens.\n\n• Escalate: the risk is outside the team's own authority to decide on, so it must go up to someone with the power to decide, rather than being handled by the team itself.",
    },
    {
      beforeQuestion: 15,
      title: "Opportunity Response Strategies",
      body: "For a positive risk (an opportunity), the team picks one of four response strategies.\n\n• Exploit: actively guarantee the opportunity happens, for example signing an exclusive deal so it definitely occurs.\n\n• Enhance: increase the probability or size of the opportunity without guaranteeing it, for example extra training that improves the odds of a good outcome.\n\n• Share: partner with another organisation to jointly capture the opportunity.\n\n• Accept: don't actively chase it — take advantage only if it happens on its own, such as using spare capacity if it exists.",
    },
    {
      beforeQuestion: 18,
      title: "The Risk Register",
      body: "Every identified risk gets logged in a risk register, one row per risk, so nothing is tracked only in someone's head.\n\n• Risk: a short description of what could happen.\n\n• Category: which bucket it belongs to (Market, Financial, Technology, People, Process) — helps route it to the right expert.\n\n• Probability and Impact: the ratings from the matrix.\n\n• Response: which strategy was chosen (avoid, mitigate, transfer, accept, escalate, or the opportunity equivalents).\n\n• Owner: the named person accountable for actually watching this risk and acting on the response — without an owner, a chosen strategy never actually gets carried out, because nobody is responsible for doing it.",
    },
    {
      beforeQuestion: 22,
      title: "Agile Risk Practices",
      body: "Risk management doesn't stop once the register is built — how the team works day to day matters too.\n\n• Building the riskiest, least-understood part of the app first (in an early sprint rather than a late one) means problems surface while there's still time to react.\n\n• Involving stakeholders like compliance and legal early, before a risky feature is even designed, catches problems while they're still cheap to fix — waiting until final sign-off risks expensive rework.\n\n• Genuine agile risk practices: periodic risk reviews, risk-based backlog prioritisation (riskiest work first), and burn-down charts as a supporting tool.\n\n• Not agile: identifying every risk fully upfront before any sprint begins and never revisiting the list — that's a waterfall trait.",
    },
  ],
  questions: [
    // ---------- Round 1: Risk Identification & Categorisation (0-4) ----------
    {
      type: "mcq",
      prompt:
        "A tester discovers that a fake fingerprint mould, or a photo held up to the camera, can sometimes fool the biometric login on the mobile banking app. Which risk category does this belong to, and is it a threat or an opportunity?",
      options: [
        "Technology, and it is a threat — the authentication mechanism itself can be fooled, which is a negative outcome for the project",
        "Process, and it is an opportunity — finding the flaw early proves the team's testing process is working well",
        "Market, and it is a threat — customers might complain publicly once they hear about the flaw",
        "People, and it is a threat — the tester who found the flaw is now a liability the team must manage carefully",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a house key that turns out to also open the neighbour's door — that's a flaw in the lock itself, not in who owns the house or how the movers were scheduled.\n\n• Category: the biometric system failing to reliably tell real users from fakes is a flaw in the tech itself — Technology.\n\n• Sign: this hurts the project (a security failure), so it's negative — a threat.\n\n• Why the others are wrong: no person's actions caused this, it isn't about market demand, and it isn't a process/workflow issue.\n\nSo the answer is: Technology, negative (a threat).",
    },
    {
      type: "sort",
      prompt:
        "Sort each new risk for the mobile banking app into the category it best fits.",
      groups: ["Market", "Financial", "Technology"],
      items: [
        { text: "A rival bank launches a near-identical AI spending-insights feature two months before this app ships", group: 0 },
        { text: "Customers turn out to be less interested in AI budgeting advice than early research suggested", group: 0 },
        { text: "The cloud bill for running the AI model on millions of transactions comes in far higher than budgeted", group: 1 },
        { text: "A currency shift increases the cost of a licensed fraud-detection component priced in US dollars", group: 1 },
        { text: "The biometric SDK has an undocumented bug that occasionally crashes the login screen", group: 2 },
        { text: "The AI recommendation model was trained on incomplete data and gives unreliable spending advice", group: 2 },
      ],
      modelAnswer:
        "Think of sorting mail into three trays: one for 'will people want this', one for 'money', one for 'does the tech actually work'.\n\n• Market: a competitor beating you to it, or customers not wanting the feature — both are about demand and competition.\n\n• Financial: costs coming in over budget, whether from cloud bills or currency shifts.\n\n• Technology: the software itself misbehaving, whether a bug or a badly trained model.\n\nSo the answer is: rival launch and low interest → Market; cloud cost and currency shift → Financial; SDK bug and bad training data → Technology.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following mobile banking app risks are POSITIVE (opportunities) rather than negative (threats)? Select all that apply.",
      options: [
        "Being first to market with the AI insights feature attracts unexpected press coverage and free publicity",
        "A fintech data partner offers to share richer spending data, which could make the AI insights noticeably more useful",
        "The AI model gives biased spending advice that unfairly targets certain customer groups",
        "A biometric data breach exposes customers' fingerprint templates",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "Think of a weather forecast: a surprise cool change that saves your picnic is an opportunity, while a surprise storm that ruins it is a threat — same forecast, opposite sign.\n\n• Opportunities: a data partnership improving the AI, and free press from being first to market — both would help the project.\n\n• Threats: a data breach and biased advice would both hurt the project, its customers or its reputation.\n\nSo the answer is: the data-partner offer and the press-coverage opportunity.",
    },
    {
      type: "mcq",
      prompt:
        "Why does actually sorting each risk into a category (Market, Financial, Technology, People, Process), rather than just keeping one long unsorted list, genuinely help the project team?",
      options: [
        "It replaces the need for a probability-impact matrix entirely, since the category alone is enough to decide how urgent a risk is",
        "It routes each risk to the person or team best placed to own it, and it shapes which response strategies are realistic — a Technology risk needs a different fix than a People risk",
        "It automatically lowers every risk's probability rating, since categorised risks are considered better understood and therefore less dangerous",
        "It doesn't help in practice — categorising risks is just a paperwork formality with no real benefit to the project",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a hospital triage board sorted by department: a broken arm goes to orthopaedics, a fever goes to general medicine — sorting means the right specialist sees it fast, and the treatment plan actually fits the problem.\n\n• Routing: a Technology risk goes to the engineering lead, a People risk to the team lead — not the other way around.\n\n• Shaping the response: you can't 'add safeguards' to a resignation the way you can to a buggy login, so the category shapes which strategy actually makes sense.\n\n• Why the others are wrong: categorising doesn't change probability, and it doesn't replace the probability-impact matrix — it works alongside it.\n\nSo the answer is: it routes the risk to the right owner and shapes which response is realistic.",
    },
    {
      type: "mcq",
      prompt:
        "The team's lead AI specialist resigns mid-project. Separately, nobody on the team is sure exactly who has to approve a new step for storing biometric data before it's coded. Which of these is a People risk and which is a Process risk?",
      options: [
        "Both are People risks, since both ultimately involve individual people making decisions",
        "The resignation is a Process risk (it disrupts the workflow); the unclear approval step is a People risk (it's about a person's confusion)",
        "Both are Process risks, since both ultimately slow down the project's schedule",
        "The resignation is a People risk (it's about a team member leaving); the unclear approval step is a Process risk (it's about how the team's workflow is structured)",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a factory: a machinist quitting is a staffing problem; not knowing which supervisor has to sign off on a safety change is a workflow problem — different fixes for each.\n\n• People risk: about the humans on the team themselves — skills, morale, availability. Losing the AI specialist is exactly this.\n\n• Process risk: about how the team's own workflow is structured — approvals, hand-offs, unclear steps. An undefined approval gate is exactly this.\n\nSo the answer is: resignation = People; unclear approval step = Process.",
    },
    // ---------- Round 2: Qualitative Risk Analysis (5-9) ----------
    {
      type: "mcq",
      prompt:
        "Risk 1 (a biometric data breach exposing customer fingerprints) is rated Low probability but Very High impact, and still lands in a High or Extreme priority band on the probability-impact matrix. Why does it still rate so high despite being unlikely?",
      options: [
        "The matrix judges probability and impact independently, and a severe enough impact can push a rare risk into a high priority band on its own",
        "It only rates high because fingerprint data sounds scary, not because of any actual scoring logic in the matrix",
        "Probability and impact are averaged together, and 'Low' averaged with 'Very High' happens to land in the High band by coincidence",
        "It's actually a mistake — a Low-probability risk should always be downgraded to a Low priority band regardless of its impact",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a shark attack: extremely unlikely on any given swim, but the consequence is so severe that beaches still close the moment one is sighted.\n\n• The mechanism: probability and impact are judged independently, and a catastrophic-enough impact can carry a risk into a high priority band even at low probability.\n\n• Why the others are wrong: there's no scoring rule that auto-downgrades low-probability risks, the axes aren't just averaged, and the rating isn't about how 'scary' the topic sounds.\n\nSo the answer is: a severe enough impact can push a rare risk into a high priority band on its own.",
    },
    {
      type: "mcq",
      prompt:
        "Risk 2 (minor glitches in the AI spending-insight recommendations) is rated High probability but Low impact. Where does this land on the priority scale compared with Risk 1, and why?",
      options: [
        "It lands at exactly the same priority as Risk 1, because probability and impact always cancel each other out",
        "It cannot be placed on the matrix at all, because 'High probability, Low impact' is not a valid combination",
        "It lands higher priority than Risk 1, because anything with High probability always outranks anything with Low probability regardless of impact",
        "It lands lower priority than Risk 1, because even though it happens often, each occurrence causes only minor, low-impact annoyance rather than serious harm",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a squeaky door hinge you hear every single day versus a chimney fire that might happen once in ten years — the hinge is far more frequent, but nobody's evacuating the house over it.\n\n• Risk 2 happens often, but each glitch is minor, so its overall priority stays lower than Risk 1's rare-but-catastrophic breach.\n\n• Why the others are wrong: probability alone doesn't decide priority, the two risks don't cancel out, and High/Low combinations are perfectly valid matrix cells.\n\nSo the answer is: lower priority than Risk 1 — frequent but only minor harm each time.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are correct statements about qualitative risk analysis? Select all that apply.",
      options: [
        "It requires running a statistical simulation such as Monte Carlo to produce a precise numeric result",
        "It is a judgment-based, subjective sorting exercise rather than a precise numeric calculation",
        "It estimates each risk's probability and impact, usually on a simple scale like Low/Medium/High",
        "It places risks on a probability-impact matrix to prioritise them",
      ],
      correctIndices: [1, 2, 3],
      modelAnswer:
        "Think of a quick 'looks bad / looks minor' sort at a hospital triage desk versus the full MRI scan that comes later with exact numbers.\n\n• True of qualitative analysis: it's a Low/Medium/High style judgment call, and it uses the probability-impact matrix to prioritise.\n\n• Not qualitative: needing a statistical simulation for a precise numeric answer is quantitative analysis instead, using tools like Monte Carlo.\n\nSo the answer is: everything except the Monte Carlo simulation claim.",
    },
    {
      type: "mcq",
      prompt:
        "A third risk is identified: a regulatory delay to biometric data-storage approval, rated Medium probability and Medium impact. Ranking Risk 1 (Low probability, Very High impact), Risk 2 (High probability, Low impact) and this new Risk 3 by overall priority, which is highest?",
      options: [
        "Risk 2, because it happens most often and frequency is what ultimately drives priority on the matrix",
        "All three are automatically tied, since the matrix can only ever produce three priority bands",
        "Risk 3, because a Medium/Medium risk always sits above any Low or High extreme on the matrix",
        "Risk 1, because its Very High impact is severe enough to outweigh its low probability, keeping it the top priority of the three",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of comparing a rare house fire, a daily dripping tap, and a mid-sized plumbing leak that happens sometimes — the fire is still the one you plan hardest for, even though it's the rarest.\n\n• Risk 1's Very High impact keeps it the most serious despite low probability.\n\n• Risk 3 (Medium/Medium) sits in the middle, above Risk 2 (High probability but only Low impact).\n\n• Why the others are wrong: frequency alone doesn't decide priority, and Medium/Medium doesn't automatically beat every extreme.\n\nSo the answer is: Risk 1 stays the highest priority of the three.",
    },
    {
      type: "mcq",
      prompt:
        "A stakeholder argues: 'Risk 2 (the AI glitches) happens most often, so it must be our top priority.' What is wrong with this reasoning?",
      options: [
        "It ignores impact entirely — Risk 2's glitches are only minor each time, while a rarer but far more severe risk like the biometric breach can still outrank it",
        "Nothing is wrong with it — frequency is genuinely the only factor that determines priority on a probability-impact matrix",
        "It's wrong because probability should never be considered at all when setting priority, only impact matters",
        "It's wrong because Risk 2 isn't actually a real risk, since AI glitches are too minor to ever be logged in a risk register",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of arguing a paper cut deserves more attention than a rare snake bite just because paper cuts happen more often — frequency alone misses how much each event actually hurts.\n\n• The flaw: the stakeholder is only looking at probability and ignoring impact, but the matrix weighs both.\n\n• Why the others are wrong: probability does matter, just not on its own, and minor risks absolutely still belong in the register.\n\nSo the answer is: it ignores impact, which is why a rarer but far more severe risk can still outrank Risk 2.",
    },
    // ---------- Round 3: Threat Response Strategies (10-14) ----------
    {
      type: "mcq",
      prompt:
        "The team decides to drop biometric login entirely and use a password plus a one-time code instead, because the spoofing risk can't be brought low enough for their comfort. Why is this Avoidance rather than Mitigation?",
      options: [
        "Because the decision happened early in the project, and Avoidance is a strategy that can only ever be chosen before any development work has actually started",
        "Because Mitigation strategies only ever apply to risks classified in the Technology category, and biometric spoofing risk isn't classified as a Technology risk at all",
        "Because dropping the feature turned out to be cheaper than building extra safeguards, and Avoidance is defined purely as whichever response option costs the least money overall",
        "Because escalating the decision to senior management for approval first is a mandatory step before any Avoidance response can be chosen, and that step was skipped here",
        "Because the risky feature is removed entirely rather than kept and reduced — the spoofing risk on biometric login can no longer occur at all, since the feature is gone",
      ],
      correctIndex: 4,
      modelAnswer:
        "Think of a dangerous shortcut on a hiking trail: taking a completely different trail removes the danger outright, while adding a handrail on the same shortcut just makes it less dangerous.\n\n• Avoidance: the threat is eliminated because the risky thing itself is gone — no biometric login means no biometric spoofing risk, period.\n\n• Mitigation would instead keep biometric login but reduce the spoofing risk, for example with liveness detection.\n\n• Why the others are wrong: cost, project timing, category and escalation aren't what defines Avoidance vs Mitigation.\n\nSo the answer is: the feature causing the risk is removed entirely, not just made safer.",
    },
    {
      type: "fillblank",
      prompt:
        "Keeping the biometric login feature but adding liveness detection (checking for a real, live face or finger rather than a photo or mould) to make spoofing much harder is an example of a threat-response strategy called ___.",
      blanks: [["mitigate", "mitigation"]],
      modelAnswer:
        "Think of keeping the cliff-edge path but adding a sturdy handrail — the danger is still technically there, but it's now much less likely to hurt you.\n\n• The feature stays (biometric login is kept), but its probability of failing is reduced (liveness detection makes spoofing harder).\n\n• That's the definition of Mitigation: reduce probability or impact without removing the risky thing entirely.\n\nSo the answer is: mitigate (mitigation).",
    },
    {
      type: "mcq",
      prompt:
        "The team signs a contract stating that the biometric SDK vendor is contractually liable for any losses caused by false-accept security failures in their SDK. Which threat-response strategy is this?",
      options: [
        "Accept — the team is simply agreeing to live with whatever losses occur",
        "Escalate — the risk has been raised to a level outside the project team's authority",
        "Transfer — the consequences of the risk are shifted onto a third party (the vendor) through the contract",
        "Avoid — the team has removed the biometric feature by outsourcing it to the vendor",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of buying travel insurance before a trip: you don't remove the risk of a cancelled flight, but you do make sure someone else — the insurer — picks up the bill if it happens.\n\n• Transfer: the risk itself (SDK failures can still happen) stays, but a third party — the vendor, via the contract — now carries the financial consequences.\n\n• Why the others are wrong: nothing is removed (not Avoid), nothing is simply ignored (not Accept), and this isn't being pushed to a higher authority (not Escalate).\n\nSo the answer is: Transfer.",
    },
    {
      type: "mcq",
      prompt:
        "A possible new national law might ban biometric data storage outright — a decision entirely outside this project team's authority to influence or control. What is the correct response, and why is it not simply Accept?",
      options: [
        "Mitigate is correct, since the team should quietly and gradually reduce how much biometric data it stores, just in case the proposed law eventually changes or passes",
        "Accept is correct here, since the project team has absolutely no control over national law, and accepting outcomes is simply what you do whenever something is entirely uncontrollable",
        "Escalate is correct — the risk is outside the project team's control and authority, so it must be raised to a higher level (such as senior management or legal) that actually can act on it",
        "Avoid is correct, since the team should immediately stop all biometric-related work altogether, regardless of whether the proposed law ever actually ends up passing",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a tenant who notices the whole apartment building might be condemned by the city — that's not a light bulb the tenant can fix themselves; it has to go to the building's owner or the city itself.\n\n• Escalate: used specifically when a risk sits outside the project team's own authority — a possible national law is exactly this kind of risk.\n\n• Why not Accept: Accept means choosing to do nothing and live with the consequences yourself; here, the team can't even decide what 'living with it' looks like without someone higher up weighing in.\n\nSo the answer is: Escalate — because the decision is outside the team's own control.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are valid response strategies specifically for a NEGATIVE risk (a threat)? Select all that apply.",
      options: ["Transfer", "Avoid", "Mitigate", "Accept", "Exploit"],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of dealing with a pothole on your usual route: dodge it, slow down for it, get the council to fix it, or just accept the bump.\n\n• Threat strategies: avoid, mitigate, transfer, accept (with escalate as a fifth, for risks outside the team's control).\n\n• Exploit is an opportunity strategy — it's for making a positive risk certain to happen, not for handling a threat.\n\nSo the answer is: avoid, mitigate, transfer, accept.",
    },
    // ---------- Round 4: Opportunity Response Strategies (15-17) ----------
    {
      type: "match",
      prompt:
        "Match each mobile banking app opportunity scenario to the response strategy it best illustrates.",
      pairs: [
        {
          left: "Signing an exclusive data-sharing deal with a fintech aggregator to guarantee richer AI spending insights",
          right: "Exploit",
        },
        {
          left: "Giving the data-science team extra training to improve the odds the AI feature gets positive press coverage",
          right: "Enhance",
        },
        {
          left: "Partnering with another bank's fraud-detection vendor to jointly build a biometric fraud-detection capability",
          right: "Share",
        },
        {
          left: "Building one small extra feature only if the team happens to have spare capacity, without actively chasing it",
          right: "Accept",
        },
      ],
      modelAnswer:
        "Think of four ways to handle a lucky break: lock it in with a signed deal, train harder to improve your odds, team up with someone else to share the win, or just take it if it happens to fall in your lap.\n\n• Exploit: the exclusive deal guarantees the opportunity happens.\n\n• Enhance: extra training raises the odds without guaranteeing anything.\n\n• Share: partnering with another firm to jointly capture the benefit.\n\n• Accept: building the extra feature only opportunistically, with no active pursuit.\n\nSo the answer is: exclusive deal → Exploit; extra training → Enhance; partnership → Share; opportunistic extra feature → Accept.",
    },
    {
      type: "mcq",
      prompt:
        "Why is 'signing the exclusive data-sharing deal with a fintech aggregator' (Exploit) different from simply hoping a good data partner turns up on its own (Accept)?",
      options: [
        "Exploit actively makes the opportunity certain to happen through a deliberate action (signing the deal); Accept is passive and only benefits if the opportunity happens to arise unprompted",
        "Accept is always the objectively better strategy here, because it costs the team absolutely nothing to simply wait around and see whether a good partner happens to show up",
        "There's no real difference at all between the two approaches — both strategies would end up producing the exact same outcome for the project regardless of which one the team actually chooses",
        "Exploit can only ever be used for handling negative risks (threats), so it wouldn't actually apply at all to a positive opportunity like landing a good data partner",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a job opening you really want: Exploit is applying, interviewing hard and negotiating to lock the offer in; Accept is just mentioning to a friend that you'd take it if it fell in your lap.\n\n• Exploit: deliberate action that guarantees the benefit — signing the deal makes richer AI data certain.\n\n• Accept: passive — you only get the benefit if it shows up on its own, with no push from you.\n\n• Why the others are wrong: the outcomes are very different, Accept isn't automatically 'better', and Exploit is an opportunity (positive-risk) strategy, not a threat strategy.\n\nSo the answer is: Exploit locks the opportunity in deliberately; Accept only benefits from it passively.",
    },
    {
      type: "mcq",
      prompt:
        "Distinguish Enhance from Exploit using this pair: (1) giving the marketing team extra training that only improves the odds of positive press for the AI feature, versus (2) signing a guaranteed collaboration agreement with a well-known tech reviewer to publish a feature story. Which is Enhance and which is Exploit?",
      options: [
        "(1) is Exploit, because training is a guaranteed action; (2) is Enhance, because a signed agreement only slightly raises the odds of coverage",
        "Both are Exploit, since both actions are proactive steps taken by the team rather than pure luck",
        "(1) is Enhance, because it only raises the odds without guaranteeing the outcome; (2) is Exploit, because the signed agreement makes the coverage certain",
        "Both are Enhance, since press coverage is never something a project team can actually guarantee in advance",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of trying to win a raffle: buying more tickets improves your odds (Enhance) but doesn't guarantee a win; being handed the winning ticket directly guarantees it (Exploit).\n\n• (1) Extra training only improves the odds of good press — probability goes up, but nothing is certain. That's Enhance.\n\n• (2) A signed agreement with a reviewer makes the feature story certain to happen. That's Exploit.\n\nSo the answer is: (1) Enhance, (2) Exploit.",
    },
    // ---------- Round 5: Risk Register & Response Planning (18-21) ----------
    {
      type: "match",
      prompt: "Match each risk-register field to its actual purpose.",
      pairs: [
        { left: "Category", right: "Routes the risk to the team or expert best placed to own it" },
        { left: "Probability", right: "Records how likely the risk is to occur" },
        { left: "Impact", right: "Records how severe the consequences would be if it occurred" },
        { left: "Owner", right: "Names the person accountable for monitoring the risk and carrying out its response" },
      ],
      modelAnswer:
        "Think of a maintenance logbook entry for a building: what kind of fault it is, how likely it is to get worse, how bad it would be if it did, and who's actually responsible for checking on it.\n\n• Category sorts the risk to the right owner. Probability and Impact are the matrix ratings. Owner is the accountable person.\n\nSo the answer is: Category → routing; Probability → likelihood; Impact → severity; Owner → accountability.",
    },
    {
      type: "mcq",
      prompt:
        "Why does a complete risk-register row need a named Owner field, not just a chosen response strategy on its own?",
      options: [
        "The Owner field is only needed for opportunity-type risks, since threats are automatically handled by the whole team collectively",
        "Without a named owner, nobody is actually accountable for monitoring the risk and carrying out the chosen response, so even a good strategy can quietly never get executed",
        "It doesn't really need one — a written response strategy is self-executing once it's typed into the register",
        "The Owner field exists purely for legal record-keeping and has no effect on whether the response actually happens",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a group project where everyone agrees 'someone should email the tutor' — if no one specific is named, it's entirely possible nobody actually sends it.\n\n• The gap: a response strategy written on paper doesn't act by itself. Someone has to actually watch the risk and carry the response out.\n\n• The fix: naming an Owner makes one person accountable, so the response doesn't fall through the cracks.\n\nSo the answer is: without an owner, nobody is accountable, so even a good strategy can go unexecuted.",
    },
    {
      type: "order",
      prompt:
        "Order the risk-response-planning workflow, tracking the biometric-spoofing risk from identification through to a monitored, owned response.",
      steps: [
        "Identify the risk (a fake fingerprint or photo could fool the biometric login)",
        "Analyse its probability and impact (rate how likely and how severe)",
        "Place it on the probability-impact matrix to see its priority",
        "Choose a response strategy (for example, mitigate with liveness detection)",
        "Assign an owner accountable for carrying out and watching that response",
        "Monitor the risk going forward, in case it changes or the response needs adjusting",
      ],
      modelAnswer:
        "Think of noticing a leak in your roof, checking how bad it is, deciding how urgent it is compared to your other jobs, picking a fix, getting someone to actually do it, then checking back after the next storm.\n\n• Step 1: spot the risk. Step 2: rate probability and impact. Step 3: see where it lands on the matrix. Step 4: pick a response. Step 5: assign who's accountable. Step 6: keep watching it.\n\nSo the answer is: identify → analyse → place on matrix → choose response → assign owner → monitor.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following must a complete risk-register row actually contain? Select all that apply.",
      options: [
        "Its category",
        "Its chosen response strategy and owner",
        "Its probability and impact ratings",
        "A description of the risk",
        "The project's total overall budget",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of a maintenance logbook entry: what the fault is, what kind it is, how bad and how likely, who's on it and what the plan is — not the building's entire annual accounts.\n\n• Belongs in the register: risk description, category, probability, impact, response, and owner.\n\n• Doesn't belong: the project's total budget lives in a separate financial document, not the risk register.\n\nSo the answer is: everything except the project's total budget.",
    },
    // ---------- Round 6: Agile Risk Practices & Stakeholder Engagement (22-24) ----------
    {
      type: "mcq",
      prompt:
        "The team building this app in Scrum chooses to build the biometric-authentication feature in Sprint 1 rather than Sprint 8, even though it's the least well-understood, highest-risk part of the app. Why does this make sense?",
      options: [
        "It doesn't make sense at all — the riskiest, least-understood work should always be saved for the very last sprint, once everything else in the app is already stable and finished",
        "Building the riskiest, least-understood feature early means problems surface while there's still plenty of time and budget left to fix them, rather than discovering a fundamental flaw right before launch",
        "It only makes sense because biometric authentication features are always inherently faster and simpler to build than any other kind of feature in a typical mobile banking app",
        "Sprint order has no real effect on risk whatsoever — the exact same problems would surface at exactly the same severity and cost no matter which sprint the feature happens to be built in",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a school project where one part depends on a shaky, unproven idea — you'd want to test whether that idea even works in week one, not discover it's broken the night before the deadline.\n\n• The logic: tackling the riskiest, least-understood work early ('fail fast') means any fundamental problems surface while there's still time and budget to fix or redesign around them.\n\n• Why the others are wrong: saving the riskiest work for last is the opposite of good practice, sprint order absolutely does affect how much room you have to react, and this has nothing to do with how fast biometric features build.\n\nSo the answer is: building it early surfaces problems while there's still time to react.",
    },
    {
      type: "mcq",
      prompt:
        "Why does involving compliance and legal stakeholders early — before biometric data handling is even designed — reduce project risk, compared with involving them only at final sign-off?",
      options: [
        "It only matters because compliance stakeholders are legally required by regulation to be the very first people to review any new feature, completely regardless of the actual risk involved",
        "Waiting until final sign-off is actually the safer approach, because it means far fewer meetings and check-ins are needed with stakeholders throughout the entire project timeline",
        "Involving them early lets compliance concerns shape the design from the start, catching problems while they're cheap to fix, instead of discovering at final sign-off that the whole approach needs to be redesigned",
        "It doesn't reduce risk at all in practice; compliance and legal review is purely a bureaucratic formality that has no real bearing on how the feature actually gets designed and built",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of asking a building inspector to look at your renovation plans before you start knocking down walls, rather than after the whole extension is built and it turns out to violate a safety code.\n\n• Early involvement: compliance concerns shape the design from day one, so problems are caught while changes are still cheap.\n\n• Late involvement: discovering a compliance problem at final sign-off can mean redesigning or rebuilding a feature that's already finished — expensive and slow.\n\nSo the answer is: early involvement catches problems while they're cheap to fix, rather than after the work is already done.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are genuine Agile risk-management practices? Select all that apply.",
      options: [
        "Identifying every risk fully upfront before any sprint begins, then never revisiting the list",
        "Burn-down charts used as a supporting tool to track progress and exposure over time",
        "Periodic risk reviews built into the team's regular sprint rhythm",
        "Risk-based backlog prioritisation, tackling the riskiest stories first",
      ],
      correctIndices: [1, 2, 3],
      modelAnswer:
        "Think of a team that checks its own dashboard together every lap of a race, instead of writing one plan before the race starts and never looking at it again.\n\n• Agile practices: regular risk reviews, prioritising the riskiest work first, and burn-down charts as a supporting tool.\n\n• Not agile: freezing the risk list at the very start and never revisiting it is a waterfall trait being contrasted against.\n\nSo the answer is: the first three.",
    },
    // ---------- Final mixed review round (25-31) ----------
    {
      type: "truefalse",
      prompt:
        "True or False: choosing to drop a risky feature entirely, rather than reducing how likely or severe it is, is an example of mitigation, not avoidance.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "Think of taking a totally different hiking trail to skip a dangerous cliff edge, versus staying on the same trail but adding a handrail.\n\n• Why it's false: dropping the feature entirely removes the risk outright — that's avoidance. Mitigation only reduces probability or impact while keeping the feature.\n\nSo the answer is: false — dropping it entirely is avoidance, not mitigation.",
    },
    {
      type: "mcq",
      prompt:
        "A new risk is logged: a 20% chance of a $50,000 regulatory fine tied to the biometric feature. What is the Expected Monetary Value (EMV) of this risk, and how would that figure typically be used?",
      options: [
        "EMV cannot be calculated here because probability and impact must both be expressed in the same units before any calculation is possible",
        "EMV is $10,000 (0.20 × $50,000), and it would typically help justify how large a contingency reserve to set aside for this risk",
        "EMV is $50,000, and it would be used as the exact amount the team must pay regardless of whether the fine ever happens",
        "EMV is $250,000 ($50,000 ÷ 0.20), and it represents the worst-case scenario the team should plan for",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of working out the average cost of a maybe-event by multiplying its price tag by how often it actually lands.\n\n• The maths: EMV = probability × impact = 0.20 × $50,000 = $10,000.\n\n• The use: this figure is exactly the kind of number that helps size a contingency reserve — how much to set aside for risks that have already been identified.\n\nSo the answer is: EMV is $10,000, used to help justify the size of a contingency reserve.",
    },
    {
      type: "mcq",
      prompt:
        "The team's lead AI specialist resigns mid-project (a People risk from earlier in this paper). Cross-training another team member on the AI model beforehand, so someone else can pick up the work, is a mitigation move. Why does cross-training reduce the risk's impact specifically, rather than its probability?",
      options: [
        "Cross-training eliminates the underlying risk entirely and completely, which is exactly what makes this an example of avoidance rather than mitigation in the first place",
        "Cross-training only ever affects risks classified as Financial, never risks classified as People, so it genuinely has no real bearing on a scenario like this one at all",
        "Cross-training doesn't stop the specialist from resigning — the probability of them leaving is unchanged — but it does reduce how badly the project is hurt if they do, since someone else can already cover the work",
        "Cross-training actually makes the resignation itself considerably less likely to happen in the first place, since specialists rarely choose to leave a team that has trained multiple people",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a sports team with a backup goalkeeper already trained and ready: the star keeper can still get injured just as easily, but the team isn't left with an empty goal if it happens.\n\n• Probability unchanged: cross-training does nothing to stop the specialist from actually choosing to resign.\n\n• Impact reduced: if they do leave, the damage is far smaller because someone else already knows the work.\n\nSo the answer is: it lowers the impact of the resignation, not its probability.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: a risk with Low probability but Very High impact should automatically be deprioritised below a risk with High probability but Low impact.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "Think of a rare house fire versus a daily squeaky door hinge — nobody plans harder for the hinge just because it happens more often.\n\n• Why it's false: the probability-impact matrix judges both dimensions together, and a severe enough impact can keep a rare risk at a higher priority than a frequent but minor one.\n\nSo the answer is: false.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL correct strategy-to-scenario pairings below, mixing threat and opportunity responses across two NEW examples.",
      options: [
        "Deliberately signing a guaranteed licensing deal to lock in a new revenue stream — this is Accept",
        "Dropping a planned 'auto-invest spare change' feature entirely because its regulatory risk can't be brought low enough — this is Mitigation",
        "Dropping a planned 'auto-invest spare change' feature entirely because its regulatory risk can't be brought low enough — this is Avoidance",
        "Partnering with a budgeting app to jointly offer a combined product, sharing both the effort and the benefit — this is Share",
      ],
      correctIndices: [2, 3],
      modelAnswer:
        "Think of two new scenarios: cutting a feature outright versus teaming up to share a win.\n\n• Correct: dropping the feature entirely is Avoidance (the risk is removed, not reduced); partnering to jointly offer a product is Share (an opportunity captured together).\n\n• Incorrect: dropping the feature entirely is not Mitigation, since mitigation keeps the feature; a signed guaranteed deal is Exploit, not Accept, since Accept is passive.\n\nSo the answer is: the Avoidance pairing and the Share pairing.",
    },
    {
      type: "order",
      prompt:
        "Order the project board workflow for tracking the biometric-spoofing mitigation task specifically, from the moment it's identified as work to when it's finished.",
      steps: ["Backlog", "Ready", "In Progress", "In Review", "Done"],
      modelAnswer:
        "Think of the mitigation task ('add liveness detection to the biometric login') moving through a car workshop: it waits in the yard, gets booked in, goes up on the hoist, gets checked over, then is handed back.\n\n• Backlog holds it as an idea. Ready means it's scoped and picked up. In Progress means it's actively being built. In Review means it's being checked. Done means it's finished and accepted.\n\nSo the answer is: Backlog → Ready → In Progress → In Review → Done.",
    },
    {
      type: "mcq",
      prompt:
        "Why should the qualitative risk analysis (rating probability and impact on the matrix) generally happen before detailed risk-response planning (choosing avoid/mitigate/transfer/accept/escalate for each risk)?",
      options: [
        "Qualitative analysis is only ever needed when assessing positive opportunities, so it's genuinely irrelevant when it comes to planning responses for negative threats",
        "Response planning should always be done first instead, since already knowing the team's chosen response makes it considerably easier to guess the probability and impact scores afterward",
        "It genuinely doesn't matter which activity comes first at all — the two activities are entirely independent of each other and produce exactly the same result no matter the order chosen",
        "Ratings from the matrix tell the team which risks actually deserve a costly response and which don't, so planning without them risks wasting effort on low-priority risks while under-responding to high-priority ones",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of triaging patients in an emergency room before deciding treatment plans — you need to know who's critical and who has a scraped knee before you decide how much time and staff to spend on each.\n\n• The order matters: the matrix tells you which risks are actually high priority, so response planning can focus real effort where it's needed instead of spreading it evenly or guessing.\n\n• Why the others are wrong: order does matter, reversing it doesn't make ratings easier, and qualitative analysis applies to both threats and opportunities.\n\nSo the answer is: rating risks first tells the team where response effort is actually worth spending.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 8,
  paperNumber: 2,
  title: "Week 8 Practice Paper — Lecture",
  topics:
    "Procurement Management: the three-process overview (Plan Procurement Management, Conduct Procurements, Control Procurements); Make-or-Buy Analysis with a worked numeric example; RFP versus RFQ; contract types (Fixed-Price, Cost-Reimbursable, Time and Materials) and the buyer/seller risk continuum; vendor evaluation methods (Checklist, Weighted Scoring Model, Vendor Scorecard) with a worked weighted-scoring example; procurement risk management (five categories, five-step process); project outsourcing types (Complete, Partial, Business Process Outsourcing) and sourcing models (Onshore, Nearshore, Offshore, Insourcing); Controlling Procurements and Service Level Agreements (SLAs); a TechSolutions ERP case study; continuity with Week 3 change control, Week 4 contingency reserves, and Week 7 risk-response strategies.",
  sourceFiles: [
    "lecture/Lecture - INFO6007 Week 08 - Procurement Management Plan.pdf",
    "lecture/Week 08 - Project Ma-s1-low.transcript.md",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Procurement Management Overview",
      body: "Imagine throwing a huge party but your kitchen cannot make everything yourself, so you go out and buy pizza, drinks, and hire a DJ instead of doing it all in-house.\n\nProcurement management is the planning behind those trips: deciding what to buy, from whom, and how to make sure you actually get what you paid for.\n\n• Procurement: buying goods, services or results from outside your own project team.\n\n• Why it matters: most IT projects rely on outside software, hardware, cloud services or consultants. Good procurement gets the right resources in place on time, on budget and at the right quality. Poor procurement risks delays, cost overruns or project failure.\n\n• The three stages, always in this order: plan what to buy, go get it, then keep an eye on the supplier.\n\nA fintech startup buying cloud infrastructure and hiring an external auditor to check its security before launch is doing exactly this kind of planning before approaching any vendor.",
      diagram: "flowchart LR\n    A[Plan Procurement Management] --> B[Conduct Procurements]\n    B --> C[Control Procurements]",
    },
    {
      beforeQuestion: 3,
      title: "Make-or-Buy Analysis",
      body: "Think of deciding whether to cook dinner yourself or order takeout. Cooking costs time and ingredients you already own; takeout costs cash but saves your evening. A company faces the same choice: build something internally, or pay someone else to supply it.\n\n• Worked example: building a part internally totals $1,100,000 once materials, labour, overhead, equipment lease, building rent and supervisor salaries are added up. Buying the same part from outside totals $1,190,000 once the purchase price plus leftover overhead is added. Making it internally is $90,000 cheaper, so Make wins here.\n\n• Six things to weigh: cost, time, quality, expertise and skills, control and confidentiality, and strategic importance.\n\n• The lesson: always run the actual numbers before assuming outsourcing is cheaper — in-house can still win.",
    },
    {
      beforeQuestion: 7,
      title: "RFP versus RFQ",
      body: "Picture asking a builder to quote a fixed job everyone understands, like laying a driveway, versus asking several architects to pitch their own creative design for a new house. The driveway just needs a price; the house needs ideas as well as a price.\n\n• RFQ, Request for Quotation: asks suppliers for a price on something clearly defined and standard, like office chairs or software licences. Fast, decided mostly on cost.\n\n• RFP, Request for Proposal: invites vendors to propose their own solution for a complex or unclear need, like building custom software. Decided on quality, approach and price together.\n\n• Worked example: a government project issued an RFP for independent security testing, because it needed vendor expertise and creativity, then used an RFQ for standard, off-the-shelf items where the requirement was already fixed.",
      diagram:
        "flowchart LR\n    A[Buyer prepares RFP] --> B[RFP published to vendors]\n    B --> C[Vendors prepare proposals]\n    C --> D[Buyer evaluates using selection criteria]\n    D --> E[Vendor selected, negotiation begins]",
    },
    {
      beforeQuestion: 12,
      title: "Contract Types and Who Carries the Risk",
      body: "Imagine three ways to pay a carpenter for renovating a room. You either agree on one fixed total no matter how long it takes, you pay back whatever they actually spend plus a fee, or you pay by the hour plus materials. Each option shifts risk between you and the carpenter.\n\n• Fixed-Price: one agreed total; the seller absorbs the risk if costs run over — the buyer's own cost stays locked in no matter what.\n\n• Cost-Reimbursable: buyer repays the seller's actual costs plus a fee; the buyer absorbs the overrun risk if the job runs long or over budget.\n\n• Time and Materials: hybrid, paid by hours and materials used; medium risk on both sides, but the seller is still paid more if the job takes longer.\n\n• Under Cost Plus Percentage of Costs (CPPC) specifically, the seller is reimbursed cost plus a percentage of that cost, so they have zero incentive to control spending — the riskiest arrangement for the buyer.\n\n• Riskiest for the buyer sits at one end of a continuum, riskiest for the seller at the other.",
      diagram:
        "flowchart LR\n    A[CPPC, riskiest for buyer] --> B[CPFF]\n    B --> C[CPIF]\n    C --> D[CPAF]\n    D --> E[FPI]\n    E --> F[FP-EPA]\n    F --> G[FFP, riskiest for seller]",
    },
    {
      beforeQuestion: 17,
      title: "Choosing a Vendor Evaluation Method",
      body: "Think of hiring a babysitter three different ways: sometimes you just need a checklist of must-haves like a first-aid certificate, sometimes you weigh several qualities like experience and friendliness together, and sometimes you keep scoring the same regular babysitter every month to see if standards are slipping.\n\n• Checklist: pass or fail against minimum required standards. Best when compliance is critical.\n\n• Weighted Scoring Model: each factor gets a percentage weight, scores are multiplied by that weight and added up. Best when many factors matter besides price.\n\n• Vendor Scorecard: ongoing scoring of a vendor already under contract, tracked over time.\n\n• Worked example: comparing two suppliers on Integrity (weight 0.20), Industry Expertise (0.35), Experience and Qualification (0.20) and Financial and Managerial Strength (0.25). Supplier A scored 1, 3, 2, 1 giving a weighted total of 1.90. Supplier B scored 1, 5, 4, 0 giving a weighted total of 2.75. Supplier B wins despite scoring zero on financial strength, because its much higher expertise and experience scores outweigh that gap.",
    },
    {
      beforeQuestion: 23,
      title: "Managing Procurement Risk",
      body: "Imagine ordering a custom cake for a wedding. Things that could go wrong include the price rising last minute, the bakery running late, the cake tasting wrong, or a dispute over what was promised. Procurement risk management plans for all of this before it happens.\n\n• Five risk categories: Cost, Schedule, Quality, Compliance and legal, Operational.\n\n• Five steps, always in this order: identify risks, assess likelihood and impact, plan mitigation, monitor vendor performance, then respond and use a contingency plan if something still goes wrong.",
      diagram:
        "flowchart LR\n    A[Identify risks] --> B[Assess likelihood and impact]\n    B --> C[Plan mitigation]\n    C --> D[Monitor vendor performance]\n    D --> E[Respond and use contingency]",
    },
    {
      beforeQuestion: 28,
      title: "Project Outsourcing Types and Sourcing Models",
      body: "Picture a restaurant that cooks its signature dish in-house but hires an outside cleaning company for the kitchen — that's partial outsourcing: keep the core skill, hand off the rest. Some restaurants hand the entire kitchen to a franchise operator instead, which is complete outsourcing.\n\n• Complete Project Outsourcing: one vendor runs the whole project start to finish.\n\n• Partial Project Outsourcing: only specific tasks are handed off, the rest stays in-house.\n\n• Business Process Outsourcing (BPO): non-core business processes are outsourced, such as payroll or customer support — not the technical work itself.\n\n• Onshore: vendor in the same country. Nearshore: vendor in a nearby country. Offshore: vendor in a distant country. Insourcing: the opposite of outsourcing — moving work to another internal team instead.\n\n• Worked example: Australia's car makers Holden, Ford and Toyota all stopped local manufacturing roughly between 2015 and 2020, mainly because local labour was too expensive — the same cost-efficiency reason companies outsource IT work offshore today.",
    },
    {
      beforeQuestion: 34,
      title: "Controlling Procurements and SLAs",
      body: "Think of hiring a contractor to renovate your kitchen. Signing the contract isn't the end of your job — you still need to check their work at each stage, confirm they hit deadlines, and only pay once you're satisfied it was actually done properly.\n\n• Control Procurements: managing the vendor relationship after award, checking performance against the contract, and approving changes formally.\n\n• Five-step flow: review deliverables, check milestones and SLA, test acceptance criteria, manage approved changes, verify invoice and close.\n\n• SLA, Service Level Agreement: a standard promising a response within a set time frame — for example, a university promising to respond to an exam-mark complaint within a set number of business days.",
      diagram:
        "flowchart LR\n    A[Review deliverables] --> B[Check milestones and SLA]\n    B --> C[Test acceptance criteria]\n    C --> D[Manage approved changes]\n    D --> E[Verify invoice and close]",
    },
  ],
  questions: [
    // ---------- Round A: Procurement Management Overview (0-2) ----------
    {
      type: "mcq",
      prompt:
        "A fintech startup needs cloud infrastructure and an external compliance auditor to review its systems before launch. Planning what to buy, how to buy it, and who to buy it from — before actually approaching any vendor — is procurement management. Why does this planning step matter so much for a project like this?",
      options: [
        "It matters because it completely removes all risk from ever using outside vendors, so once a contract is signed the project team no longer needs to monitor anyone at all",
        "It matters only for large public-sector software projects specifically, and has essentially no real bearing on how a small private fintech startup's project actually turns out",
        "It matters purely because it guarantees the absolute cheapest possible price on every single purchase made, which is the only real purpose procurement management actually serves",
        "It matters because it aligns what's bought with the project's scope, schedule and budget, so the right resources arrive on time and at the right quality — poor procurement instead risks delays, cost overruns or failure",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of planning a road trip's fuel and rest stops in advance versus just driving until the tank runs dry somewhere remote — planning ahead means you actually arrive on time.\n\n• Why it matters: most IT projects lean on outside software, hardware, cloud services or consultants, so getting the buying decisions right directly shapes whether the project finishes on time, on budget and at quality.\n\n• Why the others are wrong: lowest price isn't the sole goal, this applies just as much to a private startup as a government agency, and signing a contract never removes the need to keep monitoring the vendor.\n\nSo the answer is: it aligns procurement with scope, schedule and budget so the project gets what it actually needs.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are genuine effects procurement quality can have on an IT project? Select all that apply.",
      options: [
        "Because most IT projects depend on outside software, hardware, cloud services or consultants, procurement choices directly shape whether the project succeeds",
        "Good procurement gets the right resources in place on time, on budget and at the right quality",
        "Poor procurement can cause delays, cost overruns or even project failure",
        "Procurement decisions have no bearing on a project's schedule, since schedule is set entirely by the internal team's own work",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of a restaurant that depends on a produce supplier: good deliveries keep the kitchen running smoothly, and a late or wrong delivery can shut a whole night's service down.\n\n• Real effects: good procurement supports timely, on-budget, quality delivery; poor procurement causes delays, overruns or failure; and because so much of an IT project is bought in, procurement genuinely shapes project success.\n\n• Not real: schedule is not purely internal — a late vendor delivery absolutely can blow out the schedule.\n\nSo the answer is: everything except the claim that procurement has no bearing on schedule.",
    },
    {
      type: "mcq",
      prompt:
        "A project team skips Plan Procurement Management entirely and jumps straight into negotiating with a vendor. What is the most likely consequence?",
      options: [
        "The vendor is automatically forced to offer worse terms, since vendors always charge more when no formal plan document exists",
        "The team gets a better price, because skipping the planning stage removes bureaucracy that would otherwise slow the negotiation down",
        "Nothing changes, because Plan Procurement Management is an optional paperwork step with no real effect on the outcome",
        "The team negotiates with no evaluation criteria or clearly scoped requirements in hand, so it has weak leverage and risks agreeing to a mismatched, poorly scoped deal",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of walking into a car dealership with no idea what model, budget or must-have features you actually want — the salesperson steers the conversation, and you end up with whatever they're pushing that day.\n\n• Why it happens: without a plan, there's no scope, no evaluation criteria and no negotiating position, so the team is reacting to the vendor instead of driving the deal.\n\n• Why the others are wrong: skipping planning doesn't magically produce a better price, and vendor pricing isn't automatically tied to whether a plan document exists.\n\nSo the answer is: the team ends up with weak leverage and risks a mismatched, poorly scoped deal.",
    },
    // ---------- Round B: Make-or-Buy Analysis (3-6) ----------
    {
      type: "mcq",
      prompt:
        "Using the reading card's numbers (Make Internally totals $1,100,000; Buy from Outside totals $1,190,000), which alternative is more cost-effective, and by how much?",
      options: [
        "The two alternatives are equally cost-effective, since both totals round to roughly $1.1 million",
        "Alternative 1 (Make Internally), by $90,000",
        "Alternative 2 (Buy from Outside), by $90,000",
        "Alternative 1 (Make Internally), by $1,100,000",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of comparing two quotes for the same job: $1,100,000 versus $1,190,000 — the smaller number wins, and the gap between them is the saving.\n\n• The maths: $1,190,000 − $1,100,000 = $90,000.\n\n• The decision: Alternative 1, Make Internally, is the cheaper option here.\n\nSo the answer is: Alternative 1 (Make Internally), by $90,000.",
    },
    {
      type: "mcq",
      prompt:
        "A separate company is deciding whether to build a component internally or buy it from an outside supplier. Building it internally totals $850,000. Buying it from an outside supplier totals $760,000. Applying the same make-or-buy comparison logic, which option is more cost-effective, and by how much?",
      options: [
        "Buy from Outside, by $850,000",
        "Make Internally, by $90,000",
        "Buy from Outside, by $90,000",
        "The two options are effectively tied, since both totals are close to $800,000",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of comparing two new quotes: $850,000 to build it yourself versus $760,000 to buy it in — the lower number wins again, same logic as before, just different numbers.\n\n• The maths: $850,000 − $760,000 = $90,000 cheaper to buy.\n\n• The decision: here, unlike the card's example, Buy from Outside is the more cost-effective choice.\n\nSo the answer is: Buy from Outside, by $90,000.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are genuine factors weighed in a Make-or-Buy Analysis? Select all that apply.",
      options: [
        "Time — how quickly each option can actually be delivered",
        "Quality — which option is more likely to meet the required standard",
        "Cost — comparing internal production cost against the external purchase cost",
        "Which option would generate better publicity in a press release",
        "Expertise and skills, plus control and confidentiality, plus strategic importance",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "Think of deciding whether to bake a birthday cake yourself or order one: you'd weigh cost, how much time you have, how good it will taste, whether you trust your own skills, how much control you want over the recipe, and how important getting it exactly right actually is — not how good it would look in a social media post.\n\n• Real factors: cost, time, quality, expertise and skills, control and confidentiality, and strategic importance.\n\n• Not a real factor: press-release appeal has nothing to do with the actual cost-benefit comparison.\n\nSo the answer is: everything except the press-release option.",
    },
    {
      type: "mcq",
      prompt:
        "What happens if a company picks 'Buy' based only on the lowest unit price, ignoring the vendor's lead time and reliability?",
      options: [
        "The company risks hidden schedule delays or quality problems that the raw price comparison never captured",
        "The company saves money guaranteed, since the lowest price always reflects the true total cost of a purchase",
        "The vendor becomes legally required to guarantee on-time delivery the moment the lowest price is accepted",
        "Nothing extra happens, because a raw price comparison already accounts for lead time and reliability automatically",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of choosing the cheapest tradesperson for a home reno purely on their quote, without checking whether they've ever actually finished a job on time — the invoice might be smaller, but the renovation could drag on for months.\n\n• The risk: price alone says nothing about whether the vendor delivers on schedule or holds up under quality checks.\n\n• Why the others are wrong: price doesn't automatically bake in lead time or reliability, and accepting a low price creates no automatic delivery guarantee.\n\nSo the answer is: the company risks hidden schedule or quality problems the price comparison never caught.",
    },
    // ---------- Round C: RFP vs RFQ (7-11) ----------
    {
      type: "mcq",
      prompt:
        "A company needs to (1) buy 50 identical off-the-shelf laptops with standard specifications, and (2) commission a custom AI-powered recommendation engine that no vendor has built before. Which procurement document fits each need?",
      options: [
        "RFP for the laptops, since any hardware purchase needs a full vendor proposal; RFQ for the AI engine, since AI work is always priced the same across vendors",
        "RFQ for both, since RFQ is always the faster document regardless of how well-defined the requirement is",
        "RFQ for the laptops, since the requirement is well-defined and price-driven; RFP for the AI engine, since it needs vendor creativity and a proposed solution",
        "RFP for both, since any IT-related purchase always requires evaluating a complete vendor proposal",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of asking for a fixed price on 50 identical office chairs versus asking several architects to pitch a completely new house design — one is a simple price comparison, the other needs real creative input.\n\n• Laptops: well-defined, standardised, so an RFQ gets competitive pricing fast.\n\n• AI engine: complex and undefined, so an RFP invites vendors to propose their own approach, judged on quality and approach as well as price.\n\nSo the answer is: RFQ for the laptops, RFP for the AI engine.",
    },
    {
      type: "sort",
      prompt:
        "Sort each feature into whether it describes a Request for Quotation (RFQ) or a Request for Proposal (RFP).",
      groups: ["Request for Quotation (RFQ)", "Request for Proposal (RFP)"],
      items: [
        { text: "Evaluation is mainly price-centric", group: 0 },
        { text: "Used when requirements need vendor creativity and innovation", group: 1 },
        { text: "Has a short decision cycle", group: 0 },
        { text: "Evaluated on technical, financial and qualitative factors together", group: 1 },
      ],
      modelAnswer:
        "Think of a driveway quote versus a house-design pitch: one is about a quick, fixed price; the other is judged on creativity, approach and price all together.\n\n• RFQ: price-centric evaluation, short decision cycle — quick and standardised.\n\n• RFP: needs vendor creativity, judged across technical, financial and qualitative factors.\n\nSo the answer is: price-centric and short decision cycle → RFQ; needs creativity and multi-factor evaluation → RFP.",
    },
    {
      type: "mcq",
      prompt:
        "What happens if a buyer issues an RFQ for a complex, poorly-defined AI project instead of an RFP?",
      options: [
        "The buyer automatically ends up getting a lower price overall, since RFQs always attract noticeably cheaper bids than RFPs regardless of how the requirement is actually written",
        "Nothing changes at all in practice, because an RFQ and an RFP will always produce completely identical vendor responses no matter how well-defined the underlying requirement actually is",
        "Vendors quote against their own guessed assumptions about the unclear requirement, so the resulting quotes become impossible to compare fairly and the buyer risks picking the wrong solution",
        "The project timeline becomes considerably shorter overall, because RFQs are always processed much faster even when the requirement itself is genuinely complex and poorly defined",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of asking several builders for a fixed quote on 'a house' with no plans, no room count and no materials specified — each one guesses differently, and you end up with wildly different, incomparable numbers.\n\n• The risk: an RFQ assumes the requirement is already well-defined. Fed a vague, complex need instead, vendors each fill the gaps with their own assumptions, so the quotes can't be compared fairly and the buyer may end up with a solution that doesn't actually fit.\n\n• Why the others are wrong: mismatched documents don't produce identical results, don't guarantee a lower price, and don't make a genuinely complex project faster to run.\n\nSo the answer is: vendors quote against guessed assumptions, making the quotes incomparable and risking the wrong solution.",
    },
    {
      type: "fillblank",
      prompt:
        "Fill in the blank: the RFP process runs buyer prepares RFP, then RFP is published to vendors, then vendors prepare ___ covering their solution, cost and schedule, then the buyer evaluates using selection criteria, then a vendor is selected and negotiation begins.",
      blanks: [["proposals", "proposal"]],
      modelAnswer:
        "Think of a design competition: the brief goes out, and each entrant sends back their own pitch covering what they'd build, what it would cost, and how long it would take.\n\n• That pitch — the vendor's own solution, cost and schedule — is exactly what an RFP asks vendors to submit.\n\nSo the answer is: proposals.",
    },
    {
      type: "match",
      prompt: "Match each part of an RFP document to what it actually does.",
      pairs: [
        {
          left: "Introduction and Background",
          right: "Sets the context for the procurement and explains why the project needs this solution",
        },
        {
          left: "Scope of Work",
          right: "References the detailed Statement of Work describing exactly what must be delivered",
        },
        {
          left: "Evaluation Criteria",
          right: "States how the buyer will score and compare competing vendor proposals",
        },
        {
          left: "Terms and Conditions",
          right: "Sets the legal and contractual rules both buyer and vendor must follow",
        },
      ],
      modelAnswer:
        "Think of a competition brief: it explains why the competition exists, exactly what entries must cover, how entries will be judged, and the rules everyone has to follow.\n\n• Introduction and Background: the why. Scope of Work: the what. Evaluation Criteria: the how-you'll-be-judged. Terms and Conditions: the rules.\n\nSo the answer is: Introduction/Background → context; Scope of Work → deliverables; Evaluation Criteria → scoring; Terms and Conditions → legal rules.",
    },
    // ---------- Round D: Contract Types & Risk (12-16) ----------
    {
      type: "mcq",
      prompt:
        "A homeowner is hiring a carpentry company to renovate a room. Out of Fixed Price, Cost Reimbursable, and Time and Materials, which is most beneficial for the homeowner?",
      options: ["All three are equally beneficial for the homeowner", "Cost Reimbursable", "Fixed Price", "Time and Materials"],
      correctIndex: 2,
      modelAnswer:
        "Think of agreeing '$10,000 for this room, done in one month' up front — no matter how long the work actually takes or what it costs the carpenter, the homeowner's bill doesn't change.\n\n• Fixed Price: the seller (carpenter) absorbs the risk if costs run over, so the buyer's (homeowner's) cost is locked in and predictable.\n\n• Why the others are worse for the homeowner: Cost Reimbursable and Time and Materials both let costs grow if the job runs long, and that overrun risk lands on the buyer.\n\nSo the answer is: Fixed Price.",
    },
    {
      type: "mcq",
      prompt:
        "Using the same carpenter scenario, which contract type is most beneficial for the carpenter (the supplier) instead?",
      options: [
        "Fixed Price, since it removes all risk from both the buyer and the seller equally",
        "Fixed Price, since it guarantees the carpenter the highest possible profit regardless of how the job goes",
        "None of the three contract types offer any advantage to the supplier under any circumstances",
        "Either Cost Reimbursable or Time and Materials, since both let the carpenter be paid for extra hours or costs if the job runs long",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of being paid by the hour plus the cost of materials used, rather than agreeing to one fixed number before you know how tricky the job will turn out to be — if it takes longer, you still get paid for that extra time.\n\n• Cost Reimbursable: the buyer repays actual costs plus a fee, so overruns are covered.\n\n• Time and Materials: paid per hour and materials used, so extra hours mean extra pay.\n\n• Why Fixed Price is wrong here: it's the carpenter, not the homeowner, who absorbs the risk of costs running over under Fixed Price — the opposite of beneficial for the supplier.\n\nSo the answer is: Cost Reimbursable or Time and Materials.",
    },
    {
      type: "order",
      prompt:
        "Order these seven contract types from riskiest-for-the-buyer to riskiest-for-the-seller. (Buyer-risk means the buyer's costs can run over unpredictably; seller-risk means the seller absorbs any cost overrun themselves.)",
      steps: [
        "Cost Plus Percentage of Costs (CPPC)",
        "Cost Plus Fixed Fee (CPFF)",
        "Cost Plus Incentive Fee (CPIF)",
        "Cost Plus Award Fee (CPAF)",
        "Fixed Price Incentive (FPI)",
        "Fixed Price with Economic Price Adjustment (FP-EPA)",
        "Firm Fixed Price (FFP)",
      ],
      modelAnswer:
        "Think of a dial that slides from 'the buyer covers absolutely everything, no matter how it balloons' at one end, to 'the seller is locked into one number no matter what it actually costs them' at the other.\n\n• CPPC sits at the risky-for-buyer end: the seller is reimbursed cost plus a percentage of that cost, so they have no incentive to control spending.\n\n• The Cost-Reimbursable family (CPFF, CPIF, CPAF) gradually adds more seller accountability through fixed, incentive or award fees.\n\n• The Fixed-Price family (FPI, FP-EPA, FFP) shifts more and more risk onto the seller, ending at FFP, where the price is completely final.\n\nSo the answer is: CPPC → CPFF → CPIF → CPAF → FPI → FP-EPA → FFP.",
    },
    {
      type: "sort",
      prompt:
        "Sort each contract clause example into the contract type it best matches.",
      groups: ["Fixed-Price", "Cost-Reimbursable", "Time and Materials"],
      items: [
        { text: "$50,000 total for the whole job, no matter how long it actually takes", group: 0 },
        { text: "The seller is billed hourly plus the cost of materials actually used", group: 2 },
        { text: "The seller is reimbursed actual cost, plus a fee tied to how satisfied the buyer is with the work", group: 1 },
        { text: "One agreed total price locked in before work starts, with no adjustment for inflation", group: 0 },
        { text: "The buyer repays whatever the seller actually spent, plus a separately agreed fixed fee", group: 1 },
        { text: "Payment tracks the number of hours logged each week plus whatever supplies were used that week", group: 2 },
      ],
      modelAnswer:
        "Think of three different ways to pay for the same renovation: one flat number no matter what, a running tab plus a fee, or an hourly rate plus materials.\n\n• Fixed-Price: one locked-in total, whether stated plainly or 'no adjustment for inflation'.\n\n• Cost-Reimbursable: actual costs are repaid, plus a fee — whether fixed or tied to satisfaction.\n\n• Time and Materials: billed by the hour or week, plus materials used.\n\nSo the answer is: the two flat-total examples → Fixed-Price; the two reimbursed-cost-plus-fee examples → Cost-Reimbursable; the two hourly-plus-materials examples → Time and Materials.",
    },
    {
      type: "mcq",
      prompt:
        "Under a Cost Plus Percentage of Costs (CPPC) contract specifically, what happens that makes it the riskiest arrangement for the buyer?",
      options: [
        "The buyer is legally and contractually barred from ever reviewing or auditing the seller's submitted invoices at all under this particular contract type",
        "The seller is reimbursed their actual cost plus a percentage of that same cost, so the more they spend, the more they're paid — giving them no incentive to control spending",
        "The seller is paid one single fixed total regardless of their actual incurred cost, so any cost overrun that happens becomes entirely the seller's own problem to absorb",
        "The contract automatically caps the seller's total possible payment at a fixed dollar ceiling, regardless of whatever actual costs end up being incurred along the way",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a tradesperson who gets paid more the more materials they use, with a bonus on top calculated from that same spend — there's no reason for them to shop around for a cheaper supplier.\n\n• The mechanism: reimbursement plus a percentage of cost means higher spending directly increases the seller's own payment.\n\n• The result: the seller has zero financial incentive to keep costs down, so the buyer's bill can climb with no natural brake on it.\n\nSo the answer is: the seller is paid more the more they spend, so they have no incentive to control costs.",
    },
    // ---------- Round E: Vendor Evaluation Methods (17-22) ----------
    {
      type: "mcq",
      prompt:
        "USyd is tendering for a new catering supplier for campus events. The main requirement is that the supplier must comply with food safety certifications, have valid insurance, and meet health and hygiene regulations. Price and menu variety are secondary considerations. Which supplier evaluation method is most suitable here?",
      options: ["Checklist", "None of these methods apply to catering suppliers", "Weighted Scoring Model", "Vendor Scorecard"],
      correctIndex: 0,
      modelAnswer:
        "Think of hiring a babysitter where the one non-negotiable thing is a valid first-aid certificate — you're not weighing that against how fun they are, you're checking pass or fail on the essentials first.\n\n• Checklist: best when compliance to minimum standards, like certifications and insurance, is critical — exactly this scenario.\n\n• Why the others are weaker fits: Weighted Scoring suits cases where many factors matter roughly equally alongside price; a Vendor Scorecard is for tracking an existing long-term supplier, not selecting a new one.\n\nSo the answer is: Checklist.",
    },
    {
      type: "fillblank",
      prompt:
        "A company is choosing a new software vendor where cost, technical capability and delivery speed all matter, with no single compliance gate to pass or fail. The evaluation method that applies a percentage weight to each factor and sums the scores is called the ___ ___ ___.",
      blanks: [["weighted"], ["scoring"], ["model"]],
      modelAnswer:
        "Think of judging a talent show where singing, stage presence and originality each count for a different percentage of the final score, and you add up the weighted totals to find the winner.\n\n• When several factors matter together, rather than one pass/fail gate, each factor gets a weight, scores are multiplied by that weight, and the totals are summed.\n\nSo the answer is: Weighted Scoring Model.",
    },
    {
      type: "mcq",
      prompt:
        "An existing long-term supplier has been under contract for two years, and the company wants to track their monthly performance — on-time delivery, defect rate, cost and customer service — going forward. Which evaluation method fits this?",
      options: ["Checklist", "Weighted Scoring Model", "Request for Proposal (RFP)", "Vendor Scorecard"],
      correctIndex: 3,
      modelAnswer:
        "Think of a report card issued every month for the same student, tracking how they're doing over time, rather than a one-off entrance exam.\n\n• Vendor Scorecard: ongoing performance monitoring of a supplier already engaged, tracking KPIs like delivery timeliness, quality, cost and service over time — exactly this case.\n\n• Why the others are wrong: Checklist and Weighted Scoring are typically used to select a vendor, not to track one already under contract; an RFP is a procurement document, not an evaluation method at all.\n\nSo the answer is: Vendor Scorecard.",
    },
    {
      type: "mcq",
      prompt:
        "Two new suppliers are being compared using the same four weighted factors as the reading card (Integrity 0.20, Industry Expertise 0.35, Experience and Qualification 0.20, Financial and Managerial Strength 0.25), but with different raw scores this time. Supplier X scores 4, 2, 3, 4. Supplier Y scores 2, 4, 4, 1. Which supplier wins, and by how much (to two decimal places)?",
      options: [
        "Supplier X wins, with a total of 3.05 versus Supplier Y's 2.90",
        "Supplier Y wins, with a total of 3.10 versus Supplier X's 2.85",
        "They tie exactly, both scoring 2.98",
        "Supplier X wins, with a total of 3.10 versus Supplier Y's 2.85",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of multiplying each judge's score by how much that category is worth, then adding the results up for each contestant.\n\n• Supplier X: (4×0.20) + (2×0.35) + (3×0.20) + (4×0.25) = 0.80 + 0.70 + 0.60 + 1.00 = 3.10.\n\n• Supplier Y: (2×0.20) + (4×0.35) + (4×0.20) + (1×0.25) = 0.40 + 1.40 + 0.80 + 0.25 = 2.85.\n\nSo the answer is: Supplier X wins, with a total of 3.10 versus Supplier Y's 2.85.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are genuine criteria used when evaluating a potential vendor? Select all that apply.",
      options: [
        "Technical capability, including availability of skilled personnel",
        "Customer service and support, including responsiveness to issues",
        "Quality of goods or services, including compliance with specifications and standards",
        "The vendor's number of social media followers",
        "Cost and pricing, including total cost of ownership and payment flexibility",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "Think of choosing a mechanic: you'd weigh their price, the quality of their work, whether they actually know your car model, and how quickly they answer the phone — not how many followers their shop has online.\n\n• Real criteria: cost and pricing, quality, technical capability, customer service and support.\n\n• Not a real criterion: social media following has nothing to do with whether the vendor can actually deliver.\n\nSo the answer is: everything except the social media followers option.",
    },
    {
      type: "mcq",
      prompt:
        "What happens if a company always selects the lowest-cost vendor without ever running a checklist or weighted scoring first?",
      options: [
        "Nothing really changes in practice, because price alone is always a perfectly reliable proxy for a vendor's compliance, quality and technical capability",
        "The company automatically ends up getting noticeably better customer service, since cheaper vendors are statistically proven to be more responsive",
        "The company is fully and automatically protected legally from any future vendor-related dispute simply by having chosen the cheapest available option",
        "The company risks ending up with a vendor that fails a mandatory certification, cuts corners on quality, or can't actually deliver — risks a proper evaluation would have caught",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of hiring the cheapest babysitter you can find without ever checking whether they actually hold a first-aid certificate — you might save a few dollars, but you've skipped the one check that actually mattered.\n\n• The risk: price says nothing about compliance, quality or capability on its own, so skipping a checklist or weighted scoring can let a genuinely unsuitable vendor slip through.\n\n• Why the others are wrong: cheaper doesn't mean better service or more compliant, and choosing low cost offers no legal protection.\n\nSo the answer is: the company risks non-compliance, poor quality, or a vendor that can't actually deliver.",
    },
    // ---------- Round F: Procurement Risk Management (23-27) ----------
    {
      type: "sort",
      prompt: "Sort each new procurement-risk example into the category it best fits.",
      groups: ["Cost", "Schedule", "Quality"],
      items: [
        { text: "A key raw material's price spikes unexpectedly mid-contract", group: 0 },
        { text: "A vendor's shipment is held up for weeks at customs", group: 1 },
        { text: "A delivered component fails to meet the agreed technical specification", group: 2 },
        { text: "Hidden fees appear on the vendor's final invoice that weren't in the original quote", group: 0 },
        { text: "A supplier's factory has a long backlog, pushing out the delivery date", group: 1 },
        { text: "A batch of parts arrives with a noticeably higher defect rate than promised", group: 2 },
      ],
      modelAnswer:
        "Think of sorting complaints about a supplier into three trays: 'it cost more than expected', 'it arrived late', and 'it wasn't actually good enough'.\n\n• Cost: price spikes and hidden fees are both about money running over.\n\n• Schedule: customs delays and factory backlogs are both about timing slipping.\n\n• Quality: failing a spec and a high defect rate are both about the work not being good enough.\n\nSo the answer is: price spike and hidden fees → Cost; customs delay and factory backlog → Schedule; failed spec and high defect rate → Quality.",
    },
    {
      type: "order",
      prompt:
        "A vendor is supplying test devices for an app launch. Order the five-step procurement risk-management process for handling this relationship.",
      steps: [
        "Identify risks (for example, the vendor might ship devices with an outdated OS version)",
        "Assess likelihood and impact of each identified risk",
        "Plan mitigation (for example, specify the required OS version in the contract)",
        "Monitor vendor performance against the agreed terms",
        "Respond and use contingency (for example, switch to a backup device supplier if needed)",
      ],
      modelAnswer:
        "Think of ordering equipment for a school camp: you first think about what could go wrong, judge how likely and how bad each thing is, put a plan in place, keep checking the supplier as the date nears, and have a backup ready just in case.\n\n• Step 1: spot the risks. Step 2: judge them. Step 3: plan how to reduce them. Step 4: watch the vendor. Step 5: fall back on a contingency if something still goes wrong.\n\nSo the answer is: identify → assess → plan mitigation → monitor → respond and use contingency.",
    },
    {
      type: "multi",
      prompt:
        "For a new cost-risk scenario — a key material's price could spike mid-contract — which of the following are genuine mitigation moves? Select all that apply.",
      options: [
        "Locking in a fixed-price contract so the vendor absorbs any material price increase",
        "Negotiating a multi-year agreement that locks in pricing for the contract's duration",
        "Verbally reminding the vendor to try to be careful with their spending",
        "Using a hedging arrangement to protect against price swings in the underlying material",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Think of protecting yourself from rising fuel prices: you could lock in a fixed delivery contract, sign a multi-year supply deal, or hedge with a fuel-price contract — a friendly reminder to 'be careful with fuel' does nothing enforceable.\n\n• Genuine mitigation: fixed-price contracts, multi-year agreements, and hedging all actually shift or lock down the cost risk.\n\n• Not genuine: a verbal reminder has no binding effect and doesn't actually reduce the risk.\n\nSo the answer is: fixed-price contract, multi-year agreement, and hedging.",
    },
    {
      type: "mcq",
      prompt:
        "A team sets up vendor KPIs (key performance indicators) at contract signing but never actually monitors them afterward. What happens as a result?",
      options: [
        "Issues go undetected until they've become expensive to fix, and there's no early warning if a dispute is brewing",
        "The vendor is automatically penalised financially the moment a KPI is missed, even without anyone reviewing it",
        "Nothing changes, because setting up KPIs alone is enough to guarantee good vendor performance regardless of whether anyone checks them",
        "The contract becomes legally void the moment monitoring stops, protecting the buyer from any further risk",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of installing a smoke detector but never changing its battery or checking it works — having it there does nothing if it's never actually monitored.\n\n• The consequence: without ongoing monitoring, small problems can grow unnoticed until they're serious and costly, and there's no early warning to catch a dispute forming.\n\n• Why the others are wrong: KPIs don't enforce themselves, penalties don't trigger automatically without review, and the contract doesn't void itself.\n\nSo the answer is: issues go undetected until they're expensive to fix, with no early warning.",
    },
    {
      type: "multi",
      prompt: "Which of the following are genuine procurement risk categories? Select all that apply.",
      options: ["Aesthetic", "Operational", "Schedule", "Quality", "Cost", "Compliance and legal"],
      correctIndices: [1, 2, 3, 4, 5],
      modelAnswer:
        "Think of the checklist a buyer runs through before trusting a vendor: will it cost more than planned, arrive late, fail to meet spec, break a rule, or cause internal friction — not whether it looks nice.\n\n• The five genuine categories: cost, schedule, quality, compliance and legal, and operational.\n\n• Not a real category: 'aesthetic' risk isn't one of the five procurement risk categories taught.\n\nSo the answer is: all except Aesthetic.",
    },
    // ---------- Round G: Project Outsourcing Types & Sourcing Models (28-33) ----------
    {
      type: "mcq",
      prompt:
        "Australia previously had three car manufacturers — Holden, Ford and Toyota — and all three stopped local manufacturing between roughly 2015 and 2020, mainly because local labour was expensive. Why do companies in Australia most commonly outsource IT work today?",
      options: [
        "A cultural preference for working with international teams over local ones",
        "Cost efficiency — expensive local labour makes outsourcing to lower-cost regions more attractive",
        "Access to expertise unavailable anywhere in Australia at any price, regardless of cost",
        "A legal requirement that all IT development must be performed overseas",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of the same story that played out with car manufacturing: when local labour costs get high enough, businesses look elsewhere to keep costs down, even for work that could technically be done locally.\n\n• The driver: cost efficiency — expensive local labour is the dominant reason companies in Australia outsource IT work, mirroring exactly why Holden, Ford and Toyota all left.\n\n• Why the others are wrong: it's not that the expertise is unavailable locally, there's no legal requirement, and it isn't a cultural preference.\n\nSo the answer is: cost efficiency, driven by expensive local labour.",
    },
    {
      type: "sort",
      prompt:
        "Sort each outsourced task example into the outsourcing type it best fits.",
      groups: ["Complete Project Outsourcing", "Partial Project Outsourcing", "Business Process Outsourcing"],
      items: [
        { text: "A vendor manages an entire mobile app's design, build and deployment from start to finish", group: 0 },
        { text: "A company builds its core product in-house but outsources just the UI/UX design work", group: 1 },
        { text: "A company outsources its payroll processing to an external provider", group: 2 },
        { text: "An external vendor runs the customer support helpdesk for a software product", group: 2 },
        { text: "A company develops its software internally but outsources only the testing phase", group: 1 },
        { text: "One vendor is handed an entire new e-commerce platform project, initiation to closure", group: 0 },
      ],
      modelAnswer:
        "Think of three levels of handing off work: giving away the whole project, handing off just one piece of a project you still run, or handing off an everyday business task that isn't really about building the product at all.\n\n• Complete: one vendor runs the whole thing start to finish.\n\n• Partial: only specific technical tasks (like UI/UX or testing) are handed off.\n\n• BPO: non-core business processes like payroll or a support helpdesk, not the core technical build.\n\nSo the answer is: whole-project examples → Complete; UI/UX and testing examples → Partial; payroll and helpdesk examples → BPO.",
    },
    {
      type: "match",
      prompt: "Match each vendor description to its sourcing model.",
      pairs: [
        { left: "A local software development company based in the same city as the client", right: "Onshore" },
        { left: "A development team in a nearby country, in a similar or overlapping time zone", right: "Nearshore" },
        { left: "A development team in a distant country, chosen mainly to reduce costs", right: "Offshore" },
        { left: "The client's own internal team builds the product instead of hiring any external vendor", right: "Insourcing" },
      ],
      modelAnswer:
        "Think of four ways to get work done: hire someone down the street, someone a short flight away in a similar time zone, someone on the other side of the world for a lower rate, or just do it yourselves.\n\n• Onshore: same country. Nearshore: nearby country, similar time zone. Offshore: distant country, mainly for cost. Insourcing: kept entirely internal.\n\nSo the answer is: local vendor → Onshore; nearby vendor → Nearshore; distant cost-driven vendor → Offshore; internal team → Insourcing.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following statements correctly describe Business Process Outsourcing (BPO) specifically? Select all that apply.",
      options: [
        "BPO refers to outsourcing cloud migration or AI model development, which are highly technical tasks",
        "BPO is a way to hand off support work that isn't central to building the actual product",
        "BPO involves outsourcing non-core business processes, such as payroll or customer support",
        "BPO refers to hiring a specialised vendor specifically for cybersecurity work",
      ],
      correctIndices: [1, 2],
      modelAnswer:
        "Think of a company that builds software in-house but pays an outside firm to run its payroll — the payroll work isn't the product, it's a background business task.\n\n• Correct: BPO is exactly this — non-core business processes like payroll or customer support, not the core technical build.\n\n• Incorrect: cloud migration, AI model development and cybersecurity work are technical/IT outsourcing, not BPO.\n\nSo the answer is: the two BPO-specific statements, not the IT/Technical outsourcing examples.",
    },
    {
      type: "multi",
      prompt: "Which of the following are genuine benefits of outsourcing IT projects? Select all that apply.",
      options: [
        "It eliminates all project risk entirely, since the vendor takes on full responsibility for everything",
        "Cost reduction and access to global talent",
        "Faster project completion, thanks to experienced vendors who've done similar work before",
        "Access to skills or technologies not available within the company",
      ],
      correctIndices: [1, 2, 3],
      modelAnswer:
        "Think of hiring a specialist tradesperson who's fitted a hundred kitchens before, rather than learning it yourself from scratch — cheaper, faster, and they bring skills you don't have. But hiring them doesn't mean nothing can ever go wrong on the job.\n\n• Genuine benefits: cost reduction, global talent access, faster completion, and access to otherwise-unavailable skills.\n\n• Not genuine: outsourcing never eliminates project risk entirely — vendor delays, quality issues and communication gaps are all still real risks.\n\nSo the answer is: everything except the 'eliminates all risk' claim.",
    },
    {
      type: "mcq",
      prompt:
        "An offshore development team is 10 time zones away from the client, so every clarification question takes 2 full days to get answered because working hours barely overlap. Which disadvantage of offshore outsourcing does this best illustrate, and why does it specifically hurt offshore more than onshore arrangements?",
      options: [
        "Hidden coordination costs — the client is quietly being charged a series of extra fees that were never actually specified anywhere in the original signed contract",
        "Communication issues across geographies and time zones — the large time-zone gap directly causes long delays, a problem onshore vendors sharing the same working hours simply don't have",
        "Vendor dependency — the client has become so reliant on this one particular vendor's specialised skills that switching providers later would be extremely costly and disruptive",
        "Confidentiality and data security concerns — the sheer physical distance between client and vendor makes data breaches inherently far more likely to occur",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of texting a friend on the exact opposite side of the world: by the time they wake up and reply, your day is already over, and every back-and-forth eats a full day instead of minutes.\n\n• The disadvantage: communication issues across geographies and time zones — a large gap directly means clarifications take far longer to resolve.\n\n• Why offshore specifically: onshore vendors share the same or similar working hours, so this delay simply doesn't exist for them the way it does across a 10-hour gap.\n\nSo the answer is: communication issues across time zones, which hit offshore arrangements far harder than onshore ones.",
    },
    // ---------- Round H: Controlling Procurements & SLA (34-38) ----------
    {
      type: "mcq",
      prompt:
        "A cloud hosting provider must restore service within 4 business hours of an outage report. Which term names this kind of promise, and if an outage is reported at 9am and service is restored at 1pm the same business day, is the promise met or breached?",
      options: [
        "A Service Level Agreement (SLA); the promise is met, since service was restored in exactly 4 business hours",
        "A Statement of Work (SOW); the promise is breached, since exactly 4 hours passed",
        "A Request for Proposal (RFP); the promise is met, since the vendor responded within a single business day",
        "A Vendor Scorecard entry; the promise is breached, since any outage counts as a scorecard failure",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a university promising to reply to an exam-mark complaint within a set number of business days — that promised response window is exactly what an SLA is.\n\n• SLA, Service Level Agreement: a standard promising a response or resolution within a set time frame.\n\n• The maths here: 9am to 1pm is exactly 4 hours, so the 4-business-hour promise is met, not breached.\n\nSo the answer is: a Service Level Agreement (SLA), and the promise is met.",
    },
    {
      type: "fillblank",
      prompt:
        "The minimum working version of a product, built to test an idea before a full launch, is called the ___ ___ ___.",
      blanks: [["minimum"], ["viable"], ["product"]],
      modelAnswer:
        "Think of a food truck testing one simple menu item before building a full restaurant — just enough to see if people actually want it.\n\n• That stripped-down, test-the-idea-first version of a product is what this term describes.\n\nSo the answer is: Minimum Viable Product (MVP).",
    },
    {
      type: "order",
      prompt:
        "An accepted vendor has delivered a security-testing report. Order the five-step Control Procurements flow for handling this delivery.",
      steps: [
        "Review the deliverables (the security-testing report itself)",
        "Check milestones and SLA (was it delivered on the promised schedule and to the promised standard)",
        "Test acceptance criteria (does the report actually meet what was contractually required)",
        "Manage any approved changes (formally document and approve any agreed adjustments to scope)",
        "Verify the invoice and close (confirm the bill matches the accepted work before releasing payment)",
      ],
      modelAnswer:
        "Think of a contractor finishing a renovation: you look at the work, check it matches the agreed schedule, test that it actually meets the standard you asked for, sign off on any agreed extras, and only then pay the final invoice.\n\n• Step 1: review the deliverable. Step 2: check milestones and SLA. Step 3: test against acceptance criteria. Step 4: manage approved changes. Step 5: verify the invoice and close.\n\nSo the answer is: review deliverables → check milestones and SLA → test acceptance criteria → manage approved changes → verify invoice and close.",
    },
    {
      type: "mcq",
      prompt:
        "What happens if a buyer releases payment before verifying that the deliverable meets the contract's acceptance criteria?",
      options: [
        "The vendor is automatically obligated to keep improving the deliverable indefinitely, regardless of payment status",
        "The buyer loses leverage to require fixes, since the vendor has already been paid, and quality or compliance issues can go unmanaged",
        "Nothing changes, because payment timing has no real bearing on whether a vendor fixes remaining defects",
        "The contract becomes void the instant payment is released ahead of formal acceptance",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of paying a contractor in full before checking whether the renovation actually passed inspection — once they've been paid, what's their real incentive to come back and fix a problem?\n\n• The risk: paying early removes the buyer's strongest lever (withholding payment) for getting fixes made, so quality or compliance gaps can simply go unaddressed.\n\n• Why the others are wrong: payment timing absolutely does affect vendor incentives, there's no automatic ongoing obligation once paid, and the contract doesn't void itself.\n\nSo the answer is: the buyer loses leverage to require fixes, and issues can go unmanaged.",
    },
    {
      type: "multi",
      prompt: "Which of the following activities belong specifically to Control Procurements? Select all that apply.",
      options: [
        "Reviewing test reports and milestone evidence against the contract",
        "Verifying invoices before releasing payment",
        "Issuing the original RFP to prospective vendors",
        "Formally approving contract changes",
        "Monitoring agreed service levels over time",
        "Holding the initial bidder briefing before any contract is signed",
      ],
      correctIndices: [0, 1, 3, 4],
      modelAnswer:
        "Think of the difference between choosing a contractor and then managing them once they're on the job — one is picking who to hire, the other is making sure the work stays on track after hiring.\n\n• Control Procurements (after award): reviewing test reports, approving changes formally, verifying invoices, monitoring service levels.\n\n• Not Control Procurements: issuing the RFP and holding a bidder briefing both happen during Conduct Procurements, before any contract exists.\n\nSo the answer is: the first four — reviewing reports, approving changes, verifying invoices, and monitoring service levels.",
    },
    // ---------- Round I: Case Study — TechSolutions ERP (39-43) ----------
    {
      type: "mcq",
      prompt:
        "TechSolutions Pty Ltd, a mid-sized Sydney manufacturer, is deploying a cloud-based ERP system. The internal team handles project management, system integration and change management. Outsourced tasks are ERP software customisation, cloud deployment, data migration and cybersecurity audits. Which of TechSolutions' own activities is insourced rather than outsourced or procured, and why?",
      options: [
        "Cybersecurity audits, because compliance-related work of this kind is always legally required to be kept entirely in-house",
        "Data migration, because it involves handling the company's own particularly sensitive customer and financial data",
        "ERP software customisation, because it's far too technically complex and requires specialist skills the internal team doesn't have",
        "Project management, system integration and change management, because they need organisational context an outside vendor lacks",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a renovation where the homeowner keeps overall project coordination and deciding what changes when, while handing the actual plumbing and electrical work to outside tradespeople — coordination needs deep knowledge of the household that an outsider doesn't have.\n\n• Insourced: project management, system integration and change management stay internal because they need deep organisational context — how TechSolutions actually works — that an external vendor wouldn't have.\n\n• Why the others are wrong: ERP customisation, data migration and cybersecurity audits are all explicitly outsourced in this case study, not insourced.\n\nSo the answer is: project management, system integration and change management — kept in-house for their organisational context.",
    },
    {
      type: "match",
      prompt:
        "TechSolutions uses three named vendors: an ERP Development Vendor, a Cloud Hosting Provider, and a Cybersecurity Auditing Firm. Match each vendor to its sourcing model.",
      pairs: [
        { left: "ERP Development Vendor", right: "Offshore" },
        { left: "Cloud Hosting Provider", right: "Onshore" },
        { left: "Cybersecurity Auditing Firm", right: "Nearshore" },
      ],
      modelAnswer:
        "Think of three contractors working on the same house: one flown in from overseas for a specialist job, one from just down the road, and one from a country a short flight away.\n\n• The ERP Development Vendor is Offshore, the Cloud Hosting Provider is Onshore, and the Cybersecurity Auditing Firm is Nearshore, exactly as named in the case study.\n\nSo the answer is: ERP Development Vendor → Offshore; Cloud Hosting Provider → Onshore; Cybersecurity Auditing Firm → Nearshore.",
    },
    {
      type: "mcq",
      prompt:
        "If the offshore ERP Development Vendor fails to deliver on time, which strategy from this week's material could have reduced that risk, and how?",
      options: [
        "Nothing could reduce this risk, since offshore vendor delays are always completely unpredictable and unmanageable",
        "Avoidance — TechSolutions should have refused to outsource the ERP customisation at all",
        "Escalation — the delay should simply be reported up to senior management with no other action taken",
        "Multisourcing, or lining up an alternative vendor in advance, so TechSolutions isn't solely dependent on one offshore supplier if it falls behind",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of always having a backup caterer on standby for a big event, in case your first choice falls through close to the date — you're not relying on a single point of failure.\n\n• The strategy: multisourcing, or having an alternative vendor lined up in advance, means a single offshore vendor's delay doesn't leave the whole ERP customisation stranded.\n\n• Why the others are wrong: escalation alone doesn't reduce the risk itself, avoidance would mean losing the benefit of outsourcing entirely, and the risk absolutely can be managed with the right planning.\n\nSo the answer is: multisourcing or lining up an alternative vendor in advance.",
    },
    {
      type: "mcq",
      prompt:
        "The nearshore Cybersecurity Auditing Firm's report is delayed by 3 weeks, pushing back TechSolutions' go-live date. Which procurement risk category best fits this scenario?",
      options: ["Cost risk", "Quality risk", "Schedule risk", "Compliance and legal risk"],
      correctIndex: 2,
      modelAnswer:
        "Think of a wedding cake arriving three weeks late — the cake itself might be perfectly made, but the timing problem is what's actually causing the trouble.\n\n• The issue: a 3-week delay pushing back the go-live date is fundamentally about timing, not price, workmanship or legal compliance.\n\n• Why the others are wrong: nothing here is about cost, the quality of the report isn't in question, and no legal or compliance breach is described.\n\nSo the answer is: Schedule risk.",
    },
    {
      type: "mcq",
      prompt:
        "TechSolutions must also buy servers, software licences and network infrastructure with well-defined, standard specifications. Which procurement document should it use to get competitive pricing on these, and why not the alternative?",
      options: [
        "Neither document applies, since servers and licences are always bought through direct negotiation rather than any formal procurement document",
        "RFQ, because the specifications are well-defined and standardised, and the goal is competitive pricing rather than a creative solution — an RFP would be overkill here",
        "RFP, because any hardware and licence purchase always benefits from vendor creativity and a proposed solution",
        "Either document works identically well, since RFQ and RFP produce the same outcome for standardised items",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of asking several suppliers for a price on 50 identical laptops versus inviting them to redesign your entire IT strategy — the laptops just need a number, not a pitch.\n\n• Why RFQ: servers, licences and network infrastructure are well-defined, standardised items — exactly what an RFQ is built for, focused on price and delivery terms.\n\n• Why not RFP: an RFP is for complex, unclear needs requiring vendor creativity, which doesn't apply to buying standard, already-specified hardware and licences.\n\nSo the answer is: RFQ, because the requirement is well-defined and price-driven, not RFP.",
    },
    // ---------- Final mixed review round (44-50) ----------
    {
      type: "mcq",
      prompt:
        "A team locks in a fixed-price contract with a cloud vendor specifically to control the risk of unpredictable cloud-spend increases over the life of the contract. How does this connect to Week 7's threat-response strategies?",
      options: [
        "It's an example of Mitigation, since it reduces the buyer's exposure to cost overruns without eliminating the underlying possibility that cloud costs could rise",
        "It has no connection to Week 7's risk-response strategies, since procurement risk and general project risk are handled through entirely separate frameworks",
        "It's an example of Avoidance, since the cost risk is completely removed from existence by signing any contract at all",
        "It's an example of Escalation, since fixed-price contracts must always be approved by senior management before being signed",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of locking in a fixed price for your home electricity plan instead of riding the wholesale market — prices could still technically rise in the wider market, but your own bill is shielded from that swing.\n\n• The connection: a fixed-price contract doesn't make the underlying possibility of rising costs disappear, it just shrinks the buyer's own exposure to it — that's Mitigation, not Avoidance.\n\n• Why the others are wrong: nothing here is being escalated to a higher authority, and procurement risk is still just a specific flavour of the same risk-response strategies taught in Week 7.\n\nSo the answer is: Mitigation — it reduces cost-overrun exposure without eliminating the underlying risk.",
    },
    {
      type: "mcq",
      prompt:
        "Partway through a signed contract, a vendor requests a scope change — adding an extra data-migration step that wasn't in the original agreement. Connecting this to Week 3's formal Change Control Process, what must happen before that change is accepted?",
      options: [
        "The change should simply be applied immediately, since Control Procurements exists specifically to speed up any vendor request without extra review",
        "The change only needs a verbal agreement between the project manager and the vendor, with no documentation required",
        "The change must go through the formal Change Control Process — assessed against the original scope, then the schedule and cost baselines are updated only if it's approved",
        "The change can never be accepted once a contract is signed, since signed contracts are permanently fixed under all circumstances",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a builder asking to add an extra room partway through a fixed renovation contract — you don't just nod along, you check it against the original plan, work out what it does to the price and timeline, and only then sign off.\n\n• The link to Week 3: 'manage approved changes' inside Control Procurements isn't a free pass — it still means running the request through the formal Change Control Process, checking it against the original scope, and updating schedule and cost baselines only once approved.\n\n• Why the others are wrong: changes aren't auto-applied, signed contracts can still be formally amended, and verbal-only agreements skip the documentation a proper change process requires.\n\nSo the answer is: it must go through the formal Change Control Process before being accepted.",
    },
    {
      type: "mcq",
      prompt:
        "A quantitative risk analysis on a vendor contract produces a net expected exposure of $30,000 across several identified delivery risks. Connecting this to Week 4's cost concepts, what is this figure most directly used to justify sizing?",
      options: [
        "The management reserve outside the cost baseline, set aside for genuinely unknown risks that haven't been identified yet",
        "The sunk cost already spent before the contract was signed, which is excluded from any go-forward decision",
        "The contingency reserve inside the cost baseline, set aside for these specific identified risks",
        "The vendor's own profit margin, which the buyer has no visibility into or influence over",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of looking at your history of surprise car repairs and deciding how much to keep set aside in a dedicated 'car problems' envelope, based specifically on the problems you already know can happen.\n\n• The link: a net expected exposure figure comes from risks that have already been identified and analysed, and that's exactly what a contingency reserve inside the cost baseline is meant to cover.\n\n• Why the others are wrong: management reserve is for unknown-unknowns, not identified risks; sunk cost and vendor profit margin are unrelated to this figure.\n\nSo the answer is: it justifies the size of the contingency reserve inside the cost baseline.",
    },
    {
      type: "multi",
      prompt:
        "Two new scenarios: (1) a company outsources cloud hosting to cut costs but the vendor's data centre is in a country with weaker data-protection law than the company's home market; (2) a company outsources UI design to a nearshore vendor and gains faster turnaround thanks to overlapping working hours. Which statements correctly mix outsourcing benefits and risks across these two scenarios? Select all that apply.",
      options: [
        "Scenario 2 illustrates a genuine outsourcing benefit — faster completion helped by a smaller time-zone gap",
        "Scenario 2 illustrates a risk, since nearshore vendors always take longer to deliver than offshore vendors",
        "Scenario 1 illustrates a genuine outsourcing risk — confidentiality and data security concerns tied to weaker regulation in the vendor's jurisdiction",
        "Scenario 1 illustrates a benefit, since outsourcing to any country automatically improves data protection regardless of local law",
      ],
      correctIndices: [0, 2],
      modelAnswer:
        "Think of two separate stories: one where cutting costs means landing in a country with looser rules around your data, and another where being in a similar time zone actually speeds things up.\n\n• Correct: Scenario 1 is a real confidentiality/data-security risk from weaker local regulation; Scenario 2 is a real benefit from faster turnaround due to overlapping hours.\n\n• Incorrect: outsourcing doesn't automatically improve data protection, and nearshore isn't inherently slower than offshore — the opposite is usually true because of time-zone overlap.\n\nSo the answer is: the Scenario 1 risk statement and the Scenario 2 benefit statement.",
    },
    {
      type: "truefalse",
      prompt: "True or False: a Firm Fixed Price (FFP) contract places most of the cost risk on the buyer.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "Think of agreeing to pay exactly $10,000 for a job no matter how long it drags on — if it costs the tradesperson more than expected, that's their problem, not yours.\n\n• Why it's false: FFP sits at the seller-risk end of the contract-type continuum. The price is completely final, so the seller absorbs any cost overrun, not the buyer.\n\nSo the answer is: false — FFP places most of the risk on the seller.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: the Checklist evaluation method is best suited to procurements where meeting minimum compliance standards is critical.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "Think of checking a babysitter has a valid first-aid certificate before anything else matters — a pass/fail gate on the essentials, exactly what a Checklist is built for.\n\n• Why it's true: Checklist is specifically the method used when compliance to minimum standards, such as certifications or licences, is the critical factor.\n\nSo the answer is: true.",
    },
    {
      type: "mcq",
      prompt:
        "A company sets up a Vendor Scorecard for an ongoing supplier, but the scorecard is never actually reviewed after the first month. What happens as a result?",
      options: [
        "The scorecard becomes legally binding evidence that the vendor is performing to standard, regardless of the actual numbers",
        "Nothing changes, because simply having a scorecard in place is enough to keep the vendor's performance high regardless of whether anyone looks at it",
        "It defeats the purpose of ongoing monitoring — declining performance, such as slipping on-time-delivery or a rising defect rate, goes unnoticed until it becomes a crisis",
        "The vendor is automatically dropped from the contract the moment a scorecard review is missed",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of buying a fitness tracker and never once looking at the app — the device is still recording data, but it isn't doing you any good if nobody's checking it.\n\n• The consequence: a Vendor Scorecard only works if it's actually reviewed regularly; left unchecked, a real decline in on-time delivery or defect rate can slide for months before anyone notices.\n\n• Why the others are wrong: the scorecard existing doesn't enforce anything by itself, there's no automatic contract termination, and unreviewed numbers prove nothing either way.\n\nSo the answer is: it defeats the purpose of monitoring, letting declining performance go unnoticed until it's a crisis.",
    },
  ],
};

export const WEEK_8_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
