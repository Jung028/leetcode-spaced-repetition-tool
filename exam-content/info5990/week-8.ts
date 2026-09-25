import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 8,
  paperNumber: 1,
  title: "Week 8 Tutorial: Change Management (BetaBank CRM)",
  topics:
    "Change management tutorial applying Week 7's models to a new case: BetaBank, a mid-sized retail bank, spent $5 million on a new CRM. The pilot went live on schedule but only 30% of employees kept using it. Project management vs change management (measures of success); McKinsey 7S (hard vs soft S's), ADKAR, Kotter's 8-Step (condensed to 7 for the order question); the change curve and psychological barriers (fear of the unknown, loss aversion, cognitive dissonance, status quo bias, social proof); Diffusion of Innovation; change roles (sponsor, change agent, resistor, end user), stakeholder mapping, quick wins; BetaBank risks and interventions. Mixed review connects back to Week 7's Alpha Manufacturing ERP case (PM vs CM, ADKAR, COBIT governance).",
  sourceFiles: [
    "tutorial/INFO5990 2026-S1 Week 08 Tutorial sheet.pdf",
    "exam-content/info5990/week-8-notes.md (tutorial section)",
    "exam-content/info5990/week-7.ts (continuity only, not copied)",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Two different jobs: building it vs getting people to use it",
      body:
        "BetaBank, a mid-sized retail bank, spent $5 million building a new CRM system so staff could serve customers better and use AI-driven analytics for marketing. The project managers were confident and delivered the pilot on schedule. But after the pilot, only 30% of employees kept using it — many went back to their old tools. The CEO said: 'We've spent $5 million, but the results are not visible.'\n\nThink of it like a restaurant. One job is building the kitchen: buying the right equipment, finishing on time, staying on budget. A completely different job is getting customers to actually walk in and enjoy the food.\n\n• Project management (PM) is the kitchen-building job — measured by time, cost and scope.\n\n• Change management (CM) is the customer-filling job — measured by whether people actually use the new thing confidently, competently and consistently.\n\n• A project can succeed as a PM job (delivered on time) while completely failing as a CM job (nobody wants to use it).\n\nBetaBank's PM side worked. Its CM side is what's failing.",
    },
    {
      beforeQuestion: 4,
      title: "Three toolkits for managing change",
      body:
        "Change management has three well-known toolkits, each suited to a different kind of problem.\n\n• Kotter's 8 Steps (top-down, whole-organisation change): Create urgency, Build a guiding coalition, Form a vision and strategy, Communicate the vision, Empower employees for action, Generate short-term wins, then Consolidate gains and anchor the new way into the culture.\n\n• McKinsey's 7S (a health-check for why a change is stalling): three hard elements that are easy to see and measure — Strategy, Structure, Systems — and four soft elements that are harder to pin down but just as important — Shared Values, Skills, Style, Staff.\n\n• ADKAR (individual-level adoption, already covered in depth in Week 7): Awareness, Desire, Knowledge, Ability, Reinforcement — five steps one person must pass through, in order, to actually change how they work.\n\nPicking the right toolkit depends on the problem: organisation-wide culture shift, a stalled project needing diagnosis, or one person stuck at a specific step.",
      diagram:
        "graph TD\n    A[1. Create urgency] --> B[2. Build a guiding coalition]\n    B --> C[3. Form a vision and strategy]\n    C --> D[4. Communicate the vision]\n    D --> E[5. Empower employees for action]\n    E --> F[6. Generate short-term wins]\n    F --> G[7. Consolidate gains and anchor the culture]",
    },
    {
      beforeQuestion: 10,
      title: "The change curve and why people resist",
      body:
        "When people face a big change, they often move through predictable emotional stages, similar to the stages of grief: shock and denial ('this isn't really happening', 'the old way works fine') then anger ('why are we being forced into this?') then bargaining ('can we keep the old system for some tasks?') then depression ('I can't keep up, my performance has dropped') then acceptance (using the new way confidently). People don't all move at the same speed, and some slide backward before moving on.\n\nFive named psychological barriers explain why people get stuck: fear of the unknown (worry about what the change means for them), loss aversion (valuing what they already have more than any promised gain), cognitive dissonance (old habits clashing with new expectations), status quo bias (a general preference to keep things as they are), and social proof (waiting to see peers succeed before trying it themselves).\n\nDiffusion of Innovation groups people by adoption speed: early adopters (curious, try it first), the majority (wait for proof it works), and laggards (resist until forced or strongly supported).",
      diagram:
        "graph LR\n    A[Shock and Denial] --> B[Anger]\n    B --> C[Bargaining]\n    C --> D[Depression]\n    D --> E[Acceptance]",
    },
    {
      beforeQuestion: 20,
      title: "Roles and tricks that make change stick",
      body:
        "Northbridge Logistics is rolling out a new inventory system across its warehouses.\n\n• Sponsor: a senior leader who visibly backs the change and unblocks resistance from above — Northbridge's COO championing the rollout in person.\n\n• Change agent / champion: a respected peer, trained early, who supports and influences colleagues day to day — Northbridge trains one warehouse lead per site.\n\n• Resistor: someone actively opposing the change, often from fear or a genuine, unaddressed concern.\n\n• End user: the person who has to actually use the new system in their daily work.\n\n• Stakeholder mapping: sorting people by how much power they have and how supportive they are, so the highest-power resistors get engaged first.\n\n• Quick win: a small, early, visible success (one warehouse hitting a target fast) that builds momentum and proves the change works before the full rollout.",
    },
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "BetaBank spent $5 million on a new CRM system. The project managers delivered the pilot on schedule and within the agreed technical scope. But after the pilot went live, only 30% of employees were using it, and many reverted to their old spreadsheets and tools. Was this best described as a project management failure, a change management failure, or both?",
      options: [
        "A pure change management failure — the technical delivery succeeded, but people never adopted the new way of working",
        "Neither failed — 30% adoption after a pilot is a normal, acceptable early-stage result",
        "A pure project management failure — the system was delivered late and over budget, which explains the low usage",
        "Both failed equally — the CRM was delivered late, over budget, and unused",
      ],
      correctIndex: 0,
      modelAnswer:
        "Picture a brand-new restaurant kitchen finished on schedule, under budget, with every appliance working. Building the kitchen is one job. Getting customers to actually walk in and order is a completely different job.\n\n• What went right: BetaBank's project managers delivered the CRM pilot on schedule and within the agreed technical scope — that's project management, and it succeeded.\n\n• What went wrong: only 30% of employees kept using it after the pilot, and many went back to their old spreadsheets — that's people not adopting the new way of working, exactly what change management is supposed to prevent.\n\n• Why the other options are wrong: nothing in the case says the CRM was late or over budget, so it wasn't a project-management failure, and 30% adoption after a pilot is a real warning sign, not a normal result.\n\nSo the answer is: this is a change management failure — the technical project succeeded, but the people side of the change did not.",
    },
    {
      type: "mcq",
      prompt:
        "BetaBank's CEO says: 'We delivered the CRM on time and under the original scope, so why is this still failing?' What is the most direct answer, using the PM-vs-CM distinction?",
      options: [
        "Being on time and in scope only proves the technical build succeeded — it says nothing about whether people actually adopted the new way of working",
        "The CEO is right — meeting the schedule and scope numbers means the change has, by definition, succeeded",
        "The failure is caused only by the CRM vendor's software quality, since every internal delivery metric was met",
        "The failure must be a budget overrun that hasn't been reported yet, since schedule and scope alone cannot fail a project",
      ],
      correctIndex: 0,
      modelAnswer:
        "Finishing a house on time and on budget does not mean the family living in it is happy, or even moved in yet. Building and living-in are two separate outcomes.\n\n• On-time and in-scope are project management measures — they tell you the build was delivered as planned.\n\n• Whether people actually use it, confidently and consistently, is a change management measure, and it's tracked completely separately.\n\n• Why the other options are wrong: nothing says the budget overran, and blaming vendor software quality ignores that the case is explicitly about adoption, not technical defects.\n\nSo the answer is: on-time delivery only proves the technical side worked — it says nothing about whether people adopted it.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that are genuine measures of Change Management success, as opposed to Project Management success.",
      options: [
        "Employees feel confident using the new CRM without needing constant help",
        "The CRM project finished within its approved budget",
        "Employees use the CRM competently, without major errors, in their daily work",
        "The CRM was delivered within the originally agreed technical scope",
        "Employees consistently keep using the CRM weeks and months after launch, instead of drifting back to old tools",
      ],
      correctIndices: [0, 2, 4],
      modelAnswer:
        "A driving instructor doesn't just check whether the car was delivered on time — they check whether the learner can actually drive confidently, correctly, and keeps driving safely afterwards.\n\n• Change management success: people feel confident, use the new system competently, and keep using it consistently over time.\n\n• Project management success: on budget, on time, in scope — none of which tell you whether anyone actually adopted the result.\n\n• Why the other two are wrong: budget and scope are classic project management numbers, not measures of whether people changed their behaviour.\n\nSo the answer is: confident, competent and consistent use are the change management measures.",
    },
    {
      type: "mcq",
      prompt:
        "A hospital rolls out new scheduling software. The IT team delivers it on time and under budget, and every technical requirement in the contract is met. Three months later, most nurses are still using paper rosters because they don't trust the new system. What does this show about project management and change management in general (not just at a bank)?",
      options: [
        "That project management and change management are actually the same discipline measured with different words",
        "That project management success and change management success are two separate outcomes — either one can succeed while the other fails",
        "That change management is only needed when a project is delivered late or over budget",
        "That a technically successful delivery automatically guarantees people will adopt it, given enough time",
      ],
      correctIndex: 1,
      modelAnswer:
        "Whether it's a bank's CRM or a hospital's rostering system, the same split shows up: the build can be flawless while the people side still fails.\n\n• Here, project management succeeded fully (on time, on budget, spec met), yet adoption failed anyway (nurses avoid it).\n\n• This proves the two are independent outcomes, not two names for the same thing, and not something that fixes itself with a late or over-budget project alone.\n\n• Why the other options are wrong: a flawless delivery clearly did not guarantee adoption here, and the CRM case showed the same problem even though nothing was late.\n\nSo the answer is: project management and change management success are separate, and either can fail without the other.",
    },
    {
      type: "order",
      prompt:
        "BetaBank's regional sister bank, EastCoast Trust, decides to overhaul its entire teller workflow using Kotter's model. Put these actions back in the correct order.",
      steps: [
        "Create urgency by showing tellers and managers why the old workflow can no longer keep up with customer demand",
        "Build a guiding coalition of respected branch managers and senior tellers to lead the change",
        "Form a clear vision and strategy for what the new teller workflow will look like",
        "Communicate that vision widely across every branch, not just to head office staff",
        "Empower tellers to act by removing obstacles like outdated approval steps",
        "Generate short-term wins by rolling the new workflow out in one branch first and sharing its early results",
        "Consolidate the gains from that branch and anchor the new workflow into everyday culture bank-wide",
      ],
      modelAnswer:
        "Think of renovating a whole chain of stores: first you convince everyone renovation is actually needed, then you gather a leadership team, plan what the new store should look like, tell every branch about it, clear away obstacles so staff can act, show off the first renovated store's success, then lock the new layout in everywhere for good.\n\n• Kotter's steps run in a specific order because each one depends on the last: you can't empower action before people know the vision, and you can't anchor a culture change before you've actually won some visible results.\n\n• EastCoast Trust's story follows exactly that path: urgency, coalition, vision, communication, empowerment, short-term wins, then consolidation.\n\nSo the answer is: urgency, guiding coalition, vision and strategy, communicate the vision, empower employees for action, generate short-term wins, then consolidate gains and anchor the culture.",
    },
    {
      type: "sort",
      prompt:
        "Sort each element of McKinsey's 7S model into whether it is a Hard S or a Soft S.",
      groups: ["Hard S's", "Soft S's"],
      items: [
        { text: "Strategy", group: 0 },
        { text: "Structure", group: 0 },
        { text: "Systems", group: 0 },
        { text: "Shared Values", group: 1 },
        { text: "Skills", group: 1 },
        { text: "Style", group: 1 },
        { text: "Staff", group: 1 },
      ],
      modelAnswer:
        "A sports team has things you can point to on paper — the game plan, the roster chart, the training schedule — and things that are much harder to see, like team spirit or a coach's personal style.\n\n• Hard S's, easy to identify and measure: Strategy, Structure, Systems.\n\n• Soft S's, harder to pin down but just as important: Shared Values, Skills, Style, Staff.\n\nSo the answer is: Strategy, Structure and Systems are hard; Shared Values, Skills, Style and Staff are soft.",
    },
    {
      type: "mcq",
      prompt:
        "A change team needs to track exactly which step is failing for individual employees adopting a new tool — not restructure the whole organisation. Which change management model best fits this need, and why?",
      options: [
        "McKinsey's 7S, because it is designed specifically to track one individual employee's personal adoption journey",
        "Kotter's 8 Steps, because it is a fast, lightweight tool built for tracking single employees rather than whole organisations",
        "ADKAR, because it works step-by-step at the individual level (Awareness, Desire, Knowledge, Ability, Reinforcement) and can pinpoint exactly where one person is stuck",
        "None of the three models can track individual-level adoption; they are all designed only for organisation-wide change",
      ],
      correctIndex: 2,
      modelAnswer:
        "Checking why one student keeps failing a subject means asking a series of individual questions: do they know why it matters, do they want to learn it, were they taught it, can they do it, do they keep practising? That's a person-by-person checklist, not a school-wide policy review.\n\n• ADKAR is built exactly for that — a five-step, individual-level checklist (Awareness, Desire, Knowledge, Ability, Reinforcement) that pinpoints which stage one specific person is stuck at.\n\n• Why the others are wrong: 7S diagnoses whether an organisation's structure and culture are aligned, and Kotter is a top-down leadership roadmap for the whole organisation — neither tracks one person's individual adoption step.\n\nSo the answer is: ADKAR, because it is people-centred and works at the individual level.",
    },
    {
      type: "mcq",
      prompt:
        "BetaBank's branch staff already know the CRM is coming and understand the reasons for it (Awareness is met), but they are actively avoiding it out of fear that it's too complex. Which ADKAR stage is the actual gap, and why doesn't jumping straight to more training fix it?",
      options: [
        "Reinforcement — staff have already fully adopted the CRM confidently and just need to be rewarded and tracked for sustaining it",
        "Awareness — staff still don't understand why the CRM exists, so repeating the original announcement in more detail is the actual fix needed here",
        "Ability — staff already want the change but simply cannot physically operate the CRM screens without hands-on practice and coaching support",
        "Desire — the personal motivation to support the change is missing, and Knowledge (training) only comes after Desire, so training alone can't fix a motivation problem",
      ],
      correctIndex: 3,
      modelAnswer:
        "Knowing exactly why the gym is good for you, and even knowing how the machines work, doesn't make you want to go if you're scared of looking silly. Knowing is not the same as wanting.\n\n• ADKAR runs in order for each individual: Awareness, then Desire, then Knowledge, then Ability, then Reinforcement.\n\n• Branch staff already have Awareness (they know the CRM is coming and why). The gap is Desire — their complexity fear is blocking personal motivation.\n\n• Why more training doesn't help: training builds Knowledge, which is the step after Desire. Without Desire, staff won't engage with the training even if it's offered.\n\nSo the answer is: Desire is the gap, and training targets a later step, so it can't fix a motivation problem on its own.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of McKinsey 7S's SOFT elements.",
      options: [
        "Shared Values",
        "Skills",
        "Structure",
        "Style",
        "Staff",
      ],
      correctIndices: [0, 1, 3, 4],
      modelAnswer:
        "A sports team's tactics board and roster chart are things you can point to on paper (hard). Team spirit, the players' abilities and the coach's personal style are much harder to see, but just as important (soft).\n\n• Soft S's: Shared Values, Skills, Style, Staff.\n\n• Why Structure is wrong: it's a Hard S — the organisation's reporting lines and hierarchy, easy to draw on a chart.\n\nSo the answer is: Shared Values, Skills, Style and Staff are the soft elements.",
    },
    {
      type: "mcq",
      prompt:
        "At EastCoast Trust, the CEO personally mandates a new teller workflow and directs branch managers to implement it top-down. At a rival bank, a small team of tellers pilots a workflow tweak on their own initiative and then recommends it upward to management. Which of these is the top-down approach, and which is bottom-up?",
      options: [
        "EastCoast Trust's CEO mandate is top-down; the rival bank's teller-led pilot is bottom-up",
        "Both are bottom-up, since both changes eventually reach every teller in the bank",
        "Both are top-down, since both eventually involve management approving the change",
        "EastCoast Trust's CEO mandate is bottom-up; the rival bank's teller-led pilot is top-down",
      ],
      correctIndex: 0,
      modelAnswer:
        "In an army, a general's order travels down through officers to soldiers — that's top-down. A soldier who spots a problem and reports it up the chain for a decision is the opposite direction.\n\n• Top-down: instructions and direction come from senior leadership downward, as with EastCoast's CEO mandate.\n\n• Bottom-up: an idea starts with people lower in the organisation and is escalated upward for approval, as with the rival bank's teller-led pilot.\n\nSo the answer is: the CEO mandate is top-down, and the teller-led pilot is bottom-up.",
    },
    {
      type: "mcq",
      prompt:
        "BetaBank's branch staff worry the new CRM is too complex and will slow down customer interactions — many have quietly gone back to their spreadsheets since the pilot ended. Which change-curve stage are they most likely in?",
      options: [
        "Anger — they are openly blaming management for forcing the change on them",
        "Denial — they are actively avoiding the change, believing the old way still works fine",
        "Shock — they are still processing the news and have not formed any opinion yet",
        "Bargaining — they are actively negotiating to keep both systems running side by side",
      ],
      correctIndex: 1,
      modelAnswer:
        "Someone told to switch tools who quietly keeps using the old one and says nothing is really wrong with the old way isn't fighting or negotiating — they're simply refusing to accept the change happened.\n\n• Branch staff's specific behaviour — reverting to spreadsheets, worried the CRM is too complex — is avoidance, the classic sign of Denial.\n\n• Why the others are wrong: there's no sign of open blame (Anger) or active negotiation over keeping both systems (Bargaining), and reverting behaviour is more active than the very first, unformed reaction of Shock.\n\nSo the answer is: Denial — reverting to the familiar tool while believing it still works fine.",
    },
    {
      type: "mcq",
      prompt:
        "BetaBank's marketing staff say they don't understand how the new CRM differs from their current spreadsheets — but unlike branch staff, they haven't reverted to old tools or shown active resistance yet. Which change-curve stage are they in, and is it the same as branch staff's stage?",
      options: [
        "Bargaining — they are trying to negotiate keeping their spreadsheets permanently",
        "Denial — the same stage as branch staff, since both dislike the CRM equally",
        "Shock — an earlier, more passive stage of confusion before any active resistance forms, different from branch staff's more active Denial",
        "Acceptance — since they haven't reverted to any old tools, they must already be using the CRM confidently",
      ],
      correctIndex: 2,
      modelAnswer:
        "Someone who's just confused by a new gadget and hasn't touched it yet is in a different place than someone who tried it, decided they hate it, and quietly went back to their old one.\n\n• Marketing staff are confused but passive — no active resistance, no reverting to old behaviour yet. That's Shock, an earlier and more passive stage than branch staff's Denial.\n\n• Why the others are wrong: there's no negotiation happening (Bargaining), and confusion is not the same as confident use (Acceptance).\n\nSo the answer is: Shock — an earlier, more passive stage than branch staff's active Denial.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL psychological barriers that are visible in BetaBank's case (branch staff worried the CRM is too complex, many reverting to spreadsheets after the pilot).",
      options: [
        "Loss aversion — staff value the familiar spreadsheet workflow they'd have to give up",
        "Status quo bias — staff are reverting to keep things exactly as they were",
        "Fear of the unknown — staff worry the CRM's complexity will disrupt how they work",
        "Social proof — staff are only waiting to see other branches succeed before trying it",
        "Cognitive dissonance — staff's old habits are openly clashing with a specific new required action",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Five different reasons someone might resist a change all sound similar but aren't: worried about what happens to them, attached to what they already have, waiting to see peers succeed first, or a habit directly clashing with a new rule.\n\n• BetaBank's case explicitly shows: loss aversion (giving up the familiar spreadsheet workflow), status quo bias (reverting to keep things as they were), and fear of the unknown (worry the CRM will make things harder).\n\n• Why the other two are wrong: nothing in the case mentions staff waiting on other branches (social proof), or a specific habit-versus-rule clash being named (cognitive dissonance) — those just aren't evidenced here.\n\nSo the answer is: loss aversion, status quo bias and fear of the unknown are visible in the case.",
    },
    {
      type: "fillblank",
      prompt:
        "The tendency to keep doing things the old, familiar way even when a better option exists is called ___ bias.",
      blanks: [["status quo", "status-quo"]],
      modelAnswer:
        "Think of someone who keeps using an old flip phone even after being handed a free smartphone, purely because it's familiar, not because it's better.\n\n• This general preference for keeping things as they are, regardless of whether something better is available, is exactly what this bias describes.\n\n• It's distinct from loss aversion (which is about a specific thing you'd lose) — this one is just a general preference for sameness.\n\nSo the answer is: status quo bias.",
    },
    {
      type: "mcq",
      prompt:
        "Branch staff tried the new CRM during the pilot but many reverted to old tools afterward. Using Diffusion of Innovation, which adoption category best fits this behaviour, and what does it imply for the rollout strategy?",
      options: [
        "Early adopters — the rollout should slow down, since these staff already tried it eagerly and need no further encouragement",
        "None of the categories apply, since branch staff already used the system once during the pilot",
        "Laggards — branch staff will essentially never adopt the CRM regardless of any support offered",
        "The majority — the rollout needs to show clearer, visible proof of benefit before most staff commit to sticking with it",
      ],
      correctIndex: 3,
      modelAnswer:
        "Most people at a new restaurant aren't the first-in-line food adventurers, and they aren't the ones who refuse to ever try it either — they wait to see good reviews before committing.\n\n• Branch staff tried the CRM once (they're not laggards refusing entirely) but reverted rather than sticking with it, which is closer to the majority's 'wait for proof' pattern than the early adopters' eager, sustained enthusiasm.\n\n• Implication: the rollout needs to show clear, visible proof that the CRM genuinely helps — quick wins and demonstrated results — rather than assuming one pilot round is enough.\n\nSo the answer is: the majority, meaning the rollout needs stronger visible proof of benefit.",
    },
    {
      type: "mcq",
      prompt:
        "BetaBank spent $5 million on its CRM, but adoption is stuck at 30%, with many employees reverting to spreadsheets. Beyond the $5 million already spent, what specific ongoing business risk does this create?",
      options: [
        "Compounding costs from paying for CRM licensing and support while also maintaining the old spreadsheet workflows indefinitely, plus losing the promised AI-driven marketing capability",
        "The bank's core banking licence could be revoked by the regulator purely because internal software usage is measured as too low",
        "The $5 million becomes automatically tax-deductible once adoption falls below 50%, which removes the financial risk from this situation entirely",
        "There is no additional risk beyond the $5 million already spent, since sunk costs are the only cost that ever matters in a case like this",
      ],
      correctIndex: 0,
      modelAnswer:
        "Buying an expensive treadmill and then still paying for a separate gym membership because you never actually use the treadmill means you're now paying twice for the same problem.\n\n• BetaBank is likely paying ongoing CRM licensing and support costs while staff keep maintaining the old spreadsheet workflows in parallel — a double cost that keeps compounding.\n\n• It also loses the promised business value: the AI-driven analytics the CRM was meant to enable never gets used if adoption stays at 30%.\n\n• Why the others are wrong: a licence revocation and an automatic tax break for low usage aren't real consequences described anywhere in this case, and treating the $5 million as the only cost ignores the ongoing double-running expense.\n\nSo the answer is: compounding dual-running costs and losing the promised analytics capability.",
    },
    {
      type: "multi",
      prompt:
        "BetaBank needs to raise CRM adoption within the next 3 months. Select ALL of the following that would plausibly help.",
      options: [
        "Targeted coaching for branch staff addressing their specific fear that the CRM is too complex",
        "A working session showing marketing staff exactly what the CRM can do that their spreadsheets can't",
        "Short quick-win pilots with visible early results shared across branches",
        "Renegotiating the CRM vendor's contract price",
        "Replacing all branch staff with new hires who already like the CRM",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "If a team refuses to use a new tool because it's confusing, cutting a better deal with the tool's seller doesn't make anyone less confused — it solves a completely different problem.\n\n• Targeted coaching, a working session clarifying real benefits, and visible quick wins all directly address why people aren't adopting it: fear, confusion, and lack of proof.\n\n• Why the other two are wrong: renegotiating price is a procurement issue, not an adoption issue, and replacing staff wholesale is not a realistic or intended change management intervention.\n\nSo the answer is: coaching, a clarifying working session, and quick-win pilots.",
    },
    {
      type: "mcq",
      prompt:
        "Given BetaBank's case — branch staff are large in number and actively reverting to old tools, while marketing staff are confused but not yet resisting — which stakeholder group most needs direct engagement first, and why?",
      options: [
        "Neither group — only the CEO's and project managers' opinions matter for a $5 million project",
        "Branch staff, because they are large in number and actively resisting, which poses the bigger risk to overall adoption",
        "The CRM vendor's support team, because technical bugs are the real cause of the low adoption",
        "Marketing staff, because their confusion is louder and more visible to the CEO than branch staff's behaviour",
      ],
      correctIndex: 1,
      modelAnswer:
        "If two groups aren't on board with a plan — one large group already acting against it, and one small group just puzzled but not resisting — the group already pushing back is the more urgent fire to put out.\n\n• Branch staff are both large in number and actively resisting (reverting to old tools), which directly drags down overall adoption numbers.\n\n• Marketing staff's confusion is a real problem too, but it hasn't yet turned into active resistance, so it's lower urgency.\n\nSo the answer is: branch staff, because their size and active resistance pose the bigger risk.",
    },
    {
      type: "mcq",
      prompt:
        "BetaBank needs to rebuild employees' personal desire to use a CRM they already understand and know how to operate. Which model's structure best targets exactly that gap, and why doesn't a structural model like 7S directly fix it?",
      options: [
        "7S — because its Shared Values element directly measures each individual employee's personal desire to change",
        "Kotter's 8 Steps — because step 6, generating short-term wins, is specifically defined as fixing individual desire",
        "ADKAR — because it isolates the Desire step specifically for individuals, whereas 7S diagnoses organisational alignment, not one person's motivation",
        "Any of the three models works equally well here, since they all eventually cover motivation somewhere",
      ],
      correctIndex: 2,
      modelAnswer:
        "Checking a car's engine, chassis and electronics tells you a lot about the car overall, but it won't tell you why one specific driver refuses to get in it. That needs a different, person-level checklist.\n\n• ADKAR's Desire step is built exactly to isolate an individual's personal motivation gap — which is exactly what's missing at BetaBank if employees know how but don't want to.\n\n• 7S diagnoses whole-organisation alignment across seven elements; it was never designed to zoom into one person's motivation.\n\nSo the answer is: ADKAR, because it targets individual Desire directly, unlike a structural model like 7S.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false? BetaBank's CRM pilot going live on schedule guarantees that the overall change will succeed.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Crossing the finish line of a race is not the same as winning it. Delivering a pilot on schedule is crossing the project-management finish line — the change itself is a separate race that's still running.\n\n• BetaBank's pilot went live on schedule (project management success), yet adoption sits at only 30% (change management failure).\n\n• This is the exact same PM-vs-CM gap seen throughout this case: a technical delivery success guarantees nothing about people actually adopting the result.\n\nSo the answer is: false — on-schedule delivery does not guarantee the change succeeds.",
    },
    {
      type: "match",
      prompt: "Match each change-management role to its description.",
      pairs: [
        { left: "Sponsor", right: "A senior leader who visibly backs the change and clears roadblocks from above" },
        { left: "Change agent / champion", right: "A respected peer, trained early, who supports and influences colleagues day to day" },
        { left: "Resistor", right: "Someone actively opposing the change, often from fear or an unaddressed concern" },
        { left: "End user", right: "The person who has to actually use the new system in their daily work" },
      ],
      decoys: ["A consultant hired only to write the project's final closing report"],
      modelAnswer:
        "A school play needs a principal who backs it publicly, a popular student who gets others excited, a kid who really doesn't want to be involved, and the students who actually perform in it — four different jobs, four different people.\n\n• Sponsor: senior leader visibly backing the change from above.\n\n• Change agent / champion: a trained, respected peer influencing colleagues day to day.\n\n• Resistor: someone actively opposing the change.\n\n• End user: whoever actually has to use the new system.\n\nSo the answer is: sponsor = senior backer, change agent = trained peer influencer, resistor = active opposer, end user = daily user.",
    },
    {
      type: "mcq",
      prompt:
        "A manufacturing firm rolls out a new inventory system nationwide but first pilots it with one enthusiastic team, then loudly shares that team's fast, visible success across the company before the wider rollout begins. What is this tactic called, and why does it help?",
      options: [
        "Stakeholder mapping — sorting every employee by their power and support level",
        "A sponsor — a senior leader personally backing the rollout across the whole company",
        "Reinforcement — an ADKAR step that rewards people for sustaining a change after they've adopted it",
        "A quick win — a small, early, visible success that builds momentum and proves the change works before full rollout",
      ],
      correctIndex: 3,
      modelAnswer:
        "Showing off the first renovated store in a chain before renovating the rest gets everyone excited and proves the new layout actually works, before asking the whole company to commit.\n\n• A quick win is exactly that: a small, fast, visible success shared early to build momentum and prove the change delivers real results.\n\n• Why the others are wrong: no single leader's personal backing is described (sponsor), no power/support sorting of stakeholders is described (stakeholder mapping), and this happens before wider adoption, not as a reward afterward (reinforcement).\n\nSo the answer is: a quick win, because it proves the change works and builds momentum before full rollout.",
    },
    {
      type: "mcq",
      prompt:
        "At Northbridge Logistics, the warehouse operations director is skeptical of the new inventory system and has enough authority to slow the rollout company-wide, while a junior clerk is enthusiastic but has no authority over anyone else's workflow. Using stakeholder mapping, who should the change team prioritise engaging first, and why?",
      options: [
        "The director, because high power combined with low support poses the biggest risk if not converted or at least neutralised",
        "Neither — only the CEO's opinion matters when deciding rollout priorities",
        "The clerk, because low-power stakeholders are the easiest to convert and should be secured first before tackling harder cases",
        "The clerk, because enthusiastic end users should always be engaged before anyone else, regardless of their authority",
      ],
      correctIndex: 0,
      modelAnswer:
        "If the loudest, most influential person in the room is against a plan, winning them over first (or at least containing the risk) matters more than talking to someone who was never going to slow anything down anyway.\n\n• Stakeholder mapping sorts people by power and support: high-power, low-support people like the director are the biggest risk, because their opposition can stall the whole rollout.\n\n• Why the others are wrong: the clerk has no authority to slow anything, so engaging them first doesn't address the real risk.\n\nSo the answer is: the director — high power and low support is the priority to engage or neutralise first.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL genuine business/IT outcomes of effective change management, as opposed to project management outcomes.",
      options: [
        "Higher adoption rates of the new system",
        "Faster realisation of the investment's return (ROI)",
        "Reduced shadow-IT workarounds, like staff quietly maintaining old spreadsheets",
        "Delivering the project within the original approved budget",
        "Increased data storage capacity purchased for the project",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "A school reports two different kinds of numbers about a new library app: how many students actually use it (change outcome), and how much the app itself cost to build (project outcome). Both matter, but they're different measurements.\n\n• Effective change management drives higher adoption, faster ROI, and less reliance on old workarounds.\n\n• Why the other two are wrong: staying within budget is a project management measure, and storage capacity is a technical resourcing detail, not a change outcome.\n\nSo the answer is: higher adoption, faster ROI, and reduced shadow-IT workarounds.",
    },
    {
      type: "mcq",
      prompt:
        "A logistics company's new fleet-tracking app is delivered on time, on budget, and meets every item in the technical spec. Six months later, half of the drivers still radio in manually because they don't trust the app's live location data. What general lesson about IT change does this show?",
      options: [
        "Driver distrust of an app is purely a training issue that project management is directly responsible for fixing",
        "The technical project and the human adoption of it are two separate outcomes, and one succeeding never guarantees the other will too",
        "The app must have actually been delivered late, since drivers wouldn't distrust a genuinely on-time, in-scope system",
        "Once technical delivery succeeds, adoption always follows automatically within six months",
      ],
      correctIndex: 1,
      modelAnswer:
        "Same story as BetaBank's CRM, just in a different industry: a perfectly on-time, in-scope, on-budget technical delivery still didn't make the drivers trust and use it.\n\n• This confirms the lesson generalises beyond one company: technical success (project management) and human adoption (change management) are genuinely separate outcomes.\n\n• Why the others are wrong: the case explicitly says the delivery was on time, on budget and in scope, and six months of non-adoption disproves the idea that adoption 'always follows automatically'.\n\nSo the answer is: technical delivery success never guarantees human adoption — they're separate outcomes.",
    },
    {
      type: "mcq",
      prompt:
        "Week 7's Alpha Manufacturing case showed staff had ADKAR Knowledge (they'd been trained) but not yet Ability (they couldn't yet configure the new firewall without help). BetaBank's branch staff have the opposite pattern: they already know how to use every CRM screen from training, but many still avoid using it daily. Which ADKAR gap does BetaBank's case point to instead, and why is it different from Alpha's gap?",
      options: [
        "Reinforcement — BetaBank staff have already been using the CRM successfully and confidently for years and only need a reward system introduced now",
        "Awareness — BetaBank staff don't yet understand why the CRM was introduced in the first place, unlike Alpha's staff who understood the firewall change",
        "Desire — BetaBank staff have the skill (Knowledge and Ability) but lack the personal motivation to want the change, unlike Alpha's staff who wanted it but couldn't yet execute it",
        "Knowledge — this is the exact same gap as Alpha's case, just happening at a different company with a different system involved",
      ],
      correctIndex: 2,
      modelAnswer:
        "Alpha's staff were like someone who's been taught the theory but still fumbles the actual controls. BetaBank's staff are the opposite: they can already work the controls fine, but they don't want to.\n\n• BetaBank staff already have Knowledge and can operate the CRM (training worked), yet many still avoid it — that's a Desire gap, not a skills gap.\n\n• Alpha's gap was Ability (couldn't yet execute despite wanting to); BetaBank's gap is Desire (can execute but don't want to). Same model, opposite step, different fix needed.\n\nSo the answer is: Desire — BetaBank's staff can operate the CRM but lack the personal motivation to actually use it.",
    },
    {
      type: "mcq",
      prompt:
        "Under COBIT's governance-vs-management split (from Week 7), BetaBank assigns a training coordinator to run the CRM training sessions, while the Head of Retail Banking answers to the CEO for whether adoption actually improves. Who is Accountable for the adoption outcome, and who is Responsible for running the training sessions?",
      options: [
        "The training coordinator is Accountable for the outcome; the Head of Retail Banking is only Consulted",
        "The CEO is Responsible for running the sessions, since ultimate authority means doing the hands-on work",
        "Both are equally Accountable, since RACI does not distinguish between the two roles",
        "The Head of Retail Banking is Accountable for the outcome; the training coordinator is Responsible for running the sessions",
      ],
      correctIndex: 3,
      modelAnswer:
        "In a kitchen, the cook actually makes the dish, but the head chef is the one who puts their name on it and answers for the result if it's bad.\n\n• Responsible: the person who actually does the task — here, the training coordinator running the sessions.\n\n• Accountable: the one owner who answers for the outcome — here, the Head of Retail Banking, who answers to the CEO for adoption.\n\n• Why the others are wrong: the CEO isn't doing hands-on training, and RACI specifically separates who does the work from who owns the result.\n\nSo the answer is: the Head of Retail Banking is Accountable, and the training coordinator is Responsible.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false? According to Kotter's model, declaring victory and ending support as soon as the first pilot team shows a quick win is the correct way to consolidate gains.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Winning the first match of the season and going home to celebrate for the rest of the year does not win the league — you have to keep using that momentum.\n\n• Kotter's 'consolidate gains' step means using early wins to drive further change, explicitly warning against declaring victory too soon.\n\n• Stopping support right after one pilot's success risks the change stalling before it reaches everyone else.\n\nSo the answer is: false — consolidating gains means building on the win, not stopping after it.",
    },
    {
      type: "multi",
      prompt:
        "At a different company rolling out new scheduling software, one team says 'our spreadsheet process has worked for 10 years, why change it,' while another team says 'we'll switch once we see other departments succeed first.' The change team runs a two-week pilot with one enthusiastic department to build early momentum, plus coaching sessions targeted at each team's specific fear. Select ALL statements below that are correct.",
      options: [
        "The 'it's worked for years, why change' comment is an example of status quo bias",
        "The 'we'll wait to see other departments succeed' comment is an example of social proof",
        "Running a two-week pilot with one enthusiastic department to build early momentum is a quick win",
        "Targeted coaching for each team's specific fear is itself an example of loss aversion, not an intervention",
        "Waiting to see other departments succeed is actually cognitive dissonance, not social proof",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Five people can resist the same change for five different reasons, and mixing up the labels is the most common mistake here.\n\n• 'It's worked for years' is a plain preference to keep things as they are — status quo bias.\n\n• 'We'll wait to see others succeed first' is waiting on peer proof — social proof.\n\n• A short pilot building early, visible momentum is a quick win, by definition.\n\n• Why the last two are wrong: coaching is an intervention the change team runs, not a psychological barrier itself, and waiting on peers is social proof, not a habit-versus-rule clash (which is what cognitive dissonance actually means).\n\nSo the answer is: the first three statements are correct.",
    },
    {
      type: "order",
      prompt:
        "A regional supermarket chain plans to roll out a new self-checkout system store by store. Put these four general stages of a change rollout back in the correct order.",
      steps: [
        "Build awareness of why the change is happening and what it means for staff",
        "Run a small pilot in one store to test and refine the approach",
        "Roll the system out broadly across the rest of the stores",
        "Reinforce the new way of working so it sticks for the long term",
      ],
      modelAnswer:
        "Opening a new store format everywhere at once, with no warning and no trial run, is how a supermarket chain ends up with confused staff and angry customers in every location on day one.\n\n• The safe order is: explain why first, trial it small, then expand broadly, then keep reinforcing it so people don't drift back to the old checkout process.\n\n• Skipping straight to broad rollout without a pilot removes the chance to catch problems while they're still small and cheap to fix.\n\nSo the answer is: build awareness, run a pilot, roll out broadly, then reinforce.",
    },
    {
      type: "mcq",
      prompt:
        "A mid-sized accounting firm trains every staff member thoroughly on new tax software — they all know why it matters and can operate it competently. Six months later, most have quietly reverted to their old spreadsheets. No one is rewarded or checked on for using the new software, and many staff privately don't want to give up their personal spreadsheet habits. Why does this change fail long-term despite the strong training?",
      options: [
        "Desire (personal motivation) and Reinforcement (rewards or tracking to sustain the habit) are the two ADKAR gaps here, and Awareness plus Ability alone can't sustain a change without them",
        "The failure is purely a Knowledge gap, since spreadsheets are simply easier for staff to use than the unfamiliar new tax software",
        "ADKAR only ever requires Awareness and Ability to succeed; Desire and Reinforcement are optional extras for most software rollouts",
        "The failure is a project management failure, since the tax software rollout was almost certainly delivered late and over its original budget",
      ],
      correctIndex: 0,
      modelAnswer:
        "Learning to brush your teeth only sticks if you keep doing it — without wanting to and without any routine or reward reinforcing it, old habits creep straight back.\n\n• Staff here have Awareness and Ability (trained, competent), but privately don't want to give up spreadsheets — that's a Desire gap — and nobody is rewarding or checking on continued use — that's a Reinforcement gap.\n\n• Why the others are wrong: the case says nothing about delivery timing, and training clearly worked, so it isn't a Knowledge gap; ADKAR's five steps are not optional, they build on each other.\n\nSo the answer is: Desire and Reinforcement are both missing, and Awareness plus Ability alone cannot sustain a change without them.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 8,
  paperNumber: 2,
  title: "Week 8 Lecture: Security Management",
  topics:
    "Security management lecture: three dimensions of security (Physical, Digital/Information, Operational); the security management lifecycle (Identify, Plan, Implement, Monitor & Detect, Respond & Recover, Review & Improve); the CIA Triad (Confidentiality, Integrity, Availability) with the postman analogy; vulnerabilities and Risk = Vulnerability x Threat; controls and access control / least privilege; cybercrime types (identity theft, harassment, hacking, data breaches, malware, phishing/social engineering, DDoS, APT); real breaches (ManageMyHealth, Kido International, Snowflake, TJX) and the Shared Responsibility Model; threat categories and individual data rights; a healthcare ransomware case study. Mixed review connects to Week 1 (CIA/CrowdStrike), Week 2 (IT investment value), and Week 7 (COBIT governance).",
  sourceFiles: [
    "lecture/INFO5990 2026-S2 Week 08 - Security Management.pdf",
    "lecture/Week 08 - Profession-s1-low.transcript.md",
    "exam-content/info5990/week-8-notes.md",
    "exam-content/info5990/week-8-learning.md",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Three kinds of locks",
      body:
        "Security in IT isn't one single thing — it's three different jobs happening at once, like three different kinds of locks protecting the same building.\n\n• Physical Security: locks, cameras, guards — protecting the actual hardware and buildings from theft, damage or tampering. Goal: stop someone physically getting to or wrecking the equipment.\n\n• Digital/Information Security: firewalls, encryption, passwords — protecting data and digital systems from cyber threats. Goal: keep information Confidential, unaltered (Integrity), and available (Availability), together called the CIA Triad.\n\n• Operational Security: policies, training, processes — protecting systems through people and procedures rather than gadgets. Goal: reduce mistakes, insider misuse, and weak habits.\n\nAll three sit inside one bigger umbrella called Information Security. Cybersecurity (protecting machines and networks specifically) is a narrower slice of Digital/Information Security, not a separate fourth thing — Data Security is another narrower slice, focused specifically on protecting the information itself wherever it lives.",
    },
    {
      beforeQuestion: 4,
      title: "The security smoke-detector routine",
      body:
        "Security management isn't a one-time setup — it's a loop you run forever, like a smoke detector routine: you don't just install it once, you keep checking batteries, watching for smoke, putting out any fire, then upgrading the detector.\n\nThe six-step lifecycle: Identify Risks, Plan Controls, Implement Controls, Monitor and Detect, Respond and Recover, Review and Improve — then it loops back to Identify Risks again.\n\n• Goals: protect Confidentiality/Integrity/Availability, keep the business running (continuity), stay legally compliant, and build trust with users and customers.\n\n• Key elements are that same six-step process — don't mix goals up with the steps used to reach them.\n\n• Why it matters: protecting assets, fighting cyber threats, staying compliant with laws like GDPR and HIPAA, protecting reputation, managing human risk, and avoiding the far higher cost of an actual breach.",
      diagram:
        "graph LR\n    A[1. Identify Risks] --> B[2. Plan Controls]\n    B --> C[3. Implement Controls]\n    C --> D[4. Monitor and Detect]\n    D --> E[5. Respond and Recover]\n    E --> F[6. Review and Improve]\n    F --> A",
    },
    {
      beforeQuestion: 9,
      title: "The CIA Triad and the postman",
      body:
        "The CIA Triad is security's foundation: Confidentiality (only the right people can read it), Integrity (it hasn't been secretly changed), Availability (it's there when you need it). NIST, the US National Institute of Standards and Technology, is credited with popularising this model.\n\nPostman story: a postman opens a plain letter, reads it, and understands a private meeting time — confidentiality is broken, because an unauthorised person understood something private. If the sender writes in code words instead, the postman opens it, reads the code, but doesn't understand it — confidentiality is NOT broken, because merely touching protected information isn't a breach; only actually understanding it counts.\n\nWhy draw it as a triangle? All three legs must hold together, like three pillars under one roof. If one pillar is weak, the whole security 'building' can collapse, no matter how strong the other two are.\n\nWhich matters most depends on the system: for banking, Integrity usually matters most; for hospitals or emergency systems, Availability usually matters most.",
      diagram: "graph TD\n    A[Confidentiality] --> D[Secure System]\n    B[Integrity] --> D\n    C[Availability] --> D",
    },
    {
      beforeQuestion: 16,
      title: "The broken window and the risk formula",
      body:
        "A vulnerability is a weak point — like one broken window in an otherwise heavily guarded building. It doesn't matter how strong every door is if that one window is left open.\n\nVulnerabilities generally trace back to one of three sources, depending on WHERE the weak point actually sits: something a person did or didn't do (a careless action or a missing skill), something wrong with the technology itself (a flaw, a setting, or missing protection), or something missing at the organisation level (a policy, a process, or an oversight gap that was never put in place).\n\nRisk isn't just about the weak point alone. The formula is: Risk = Vulnerability × Threat. A weak point nobody is targeting is low risk. A determined attacker facing a hardened system is also relatively low risk. Danger spikes only when a real weakness and a real, motivated attacker exist together.\n\nEven the strongest technology can be undone by the people using it, which is why people are so often singled out as one of the biggest weak points in any security plan.",
    },
    {
      beforeQuestion: 21,
      title: "The hotel keycard",
      body:
        "A hotel keycard opens your own room and maybe the gym, but never the manager's office or another guest's room, even though you're a paying guest in the same building. That's least privilege: only ever giving someone the smallest amount of access needed for their job.\n\nA control is a 'fix' put in place to lower a risk. Controls come in three flavours, based on WHERE the fix lives rather than any one example: Technical controls are built directly into the software or hardware itself; Administrative controls are written rules governing how people must behave; Physical controls are barriers protecting the tangible equipment itself.\n\nDefense-in-depth means stacking several unrelated layers instead of relying on just one safeguard. If one layer fails, another layer that works completely differently is still there to catch the problem — which is exactly why relying on a single layer alone is risky.",
    },
    {
      beforeQuestion: 25,
      title: "Four cybercrime types, four preventive measures",
      body:
        "• Identity Theft and Fraud: stealing someone's personal info (name, ID numbers, login details) to commit fraud. Preventive measure: strong unique passwords plus MFA, and caution about sharing personal info.\n\n• Harassment and Cyber-bullying: repeated unwanted, threatening behaviour carried out online. Preventive measure: acceptable-use policies plus reporting mechanisms.\n\n• Hacking and Unauthorised Access: getting into systems or accounts without permission, or misusing legitimate access beyond what's allowed. Preventive measure: strong passwords, MFA, least-privilege access, and vendor risk checks.\n\n• Data Breaches: sensitive or confidential information accessed, disclosed, or stolen without authorisation. Preventive measure: encryption, strong access controls, continuous monitoring, and tested backups.\n\nHacking is about how someone got in or misused access; a Data Breach is about what happened as a result — protected information got out.",
    },
    {
      beforeQuestion: 29,
      title: "Malware, zero-days, and DoS vs DDoS",
      body:
        "Malware ('malicious software') is the umbrella term for any code deliberately written to cause harm. Viruses, Trojans and macros are its main sub-types. Antivirus tools mostly work by matching code against known bad patterns, so they can miss brand-new attacks they've never seen before.\n\nA zero-day vulnerability is a flaw so new that defenders have had zero days of warning — no signature exists yet, so it can slip straight past pattern-matching defences.\n\nDoS (Denial of Service) is one attacking machine flooding a target with requests so real users can't get through. DDoS (Distributed Denial of Service) is the same idea but from thousands of machines in many locations at once, making it far harder to filter out from real traffic.\n\nAn Advanced Persistent Threat (APT) is different again: rather than crashing a system loudly, an attacker quietly lives inside a network for months, slowly stealing data without being noticed.",
      diagram: "graph TD\n    M[Malware] --> V[Virus]\n    M --> T[Trojan]\n    M --> Ma[Macro]",
    },
    {
      beforeQuestion: 34,
      title: "The landlord and the tenant",
      body:
        "Renting an apartment in a big building: the landlord is responsible for the locks on the main entrance and the fire escape, but you're responsible for locking your own apartment door and not handing your key to a stranger. That's the Shared Responsibility Model used by cloud providers.\n\nIn the Snowflake data breach, the cloud provider's own servers weren't the problem — customers who skipped multi-factor authentication (MFA) and reused stolen passwords were the ones who got broken into, exposing over 500 million records. The landlord's locks held; some tenants left their own doors open.\n\n• The provider (landlord) owns: platform infrastructure, physical security of its data centres, and overall uptime.\n\n• The customer (tenant) owns: their own account security, enabling MFA, setting their own access controls, and monitoring their own account activity.",
    },
    {
      beforeQuestion: 39,
      title: "Where threats come from, and your rights over your own data",
      body:
        "Security threats fall into categories based on where they come from. Three worth knowing: Human-based (caused by people, on purpose or by accident), Technical (exploiting hardware, software or network weaknesses), and External (coming from outside the organisation's direct control, like a vendor or a hacker group).\n\nSeparately, people have specific legal rights over their own personal data (protected by laws like GDPR, CCPA and Australia's Privacy Act): Right to be informed (know how your data is used), Right of access (request a copy of what's held), Right to rectification (fix inaccurate data), Right to erasure (request deletion, with an exception when the law requires the data to be kept, such as financial records), and Right to restrict processing (limit how data is used, like pausing marketing emails, without deleting the account entirely).",
    },
  ],
  questions: [
    // ---------- Round A: What Security Means (0-3) ----------
    {
      type: "mcq",
      prompt:
        "A cleaner leaves the server-room door propped open overnight so it's easier to empty the bins, and anyone walking past could simply walk in. Which security dimension does this failure belong to?",
      options: [
        "Operational Security",
        "Physical Security",
        "Digital/Information Security",
        "Data Security",
      ],
      correctIndex: 1,
      modelAnswer:
        "A bank vault with the world's strongest steel door is useless if someone leaves the back window wide open. This is about the physical route into the building, not the data inside it.\n\n• Physical Security protects tangible infrastructure — buildings, hardware, server rooms — from theft, damage or tampering.\n\n• Why the others are wrong: nothing digital was touched, no process or policy failure is described beyond the door itself, and no specific information was exposed.\n\nSo the answer is: Physical Security.",
    },
    {
      type: "sort",
      prompt: "Sort each scenario into the security dimension it best belongs to.",
      groups: ["Physical Security", "Digital/Information Security", "Operational Security"],
      items: [
        { text: "A firewall blocks an unusual flood of connection attempts from overseas", group: 1 },
        { text: "A company writes a policy requiring every new hire to complete a phishing-awareness course", group: 2 },
        { text: "A data centre installs a fingerprint scanner on its server-room door", group: 0 },
        { text: "An app encrypts customer messages so they can't be read if intercepted", group: 1 },
        { text: "A manager quietly stops enforcing the password-rotation policy because staff complain it's annoying", group: 2 },
        { text: "A thief snaps the padlock off an unattended laptop cart in a school hallway", group: 0 },
        { text: "IT sets up multi-factor authentication for all remote logins", group: 1 },
        { text: "A company runs a tabletop exercise walking staff through what to do during a data breach", group: 2 },
      ],
      modelAnswer:
        "Each example maps to one job: guarding the physical stuff, guarding the digital stuff, or guarding the human processes around both.\n\n• Physical: the fingerprint scanner and the stolen laptop cart — both about tangible hardware and access to it.\n\n• Digital/Information: the firewall, the encrypted messages, and MFA — all technical protections for data and systems.\n\n• Operational: the training policy, the abandoned password rule, and the tabletop exercise — all about people, policies and process.\n\nSo the answer is: fingerprint scanner and laptop cart are Physical; firewall, encryption and MFA are Digital; the policy, the abandoned rule and the exercise are Operational.",
    },
    {
      type: "multi",
      prompt: "Select ALL statements that correctly describe Operational Security.",
      options: [
        "It reduces risk from human error and weak internal processes",
        "It relies mainly on policies, training and procedures rather than physical locks or firewalls",
        "It's mainly concerned with stopping someone from physically stealing a server",
        "It's the main defence against phishing caused by careless staff behaviour",
        "Its main goal is keeping data confidential, accurate and available using technical tools",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Three dimensions get mixed up constantly: one guards buildings, one guards data with technical tools, and one guards people and processes.\n\n• Operational Security: reduces human error and process weaknesses, relies on policies/training/procedures, and is the main defence against careless-staff phishing.\n\n• Why the other two are wrong: stopping physical theft of a server is Physical Security, and using technical tools to keep data confidential/accurate/available is Digital/Information Security.\n\nSo the answer is: the first, second and fourth statements describe Operational Security.",
    },
    {
      type: "mcq",
      prompt:
        "A company's Head of Information Security explains that cybersecurity, physical security and data security are all narrower parts of what she oversees. Which statement best captures the relationship?",
      options: [
        "Physical security is actually a narrow sub-domain sitting inside cybersecurity specifically, since both ultimately exist to protect physical hardware",
        "Data security and cybersecurity are the same discipline under two different marketing names, and information security is unrelated to either one",
        "Information security is the umbrella term; cybersecurity (protecting digital systems/networks), physical security and data security (protecting the information itself) are all sub-domains within it",
        "Cybersecurity is the umbrella term, and information security is simply an older, now-outdated name for exactly the same overall discipline",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of 'information security' as the entire tree, with cybersecurity, physical security, operational security and data security as branches growing off it — not four separate trees.\n\n• Information security is the umbrella covering all of these domains.\n\n• Cybersecurity focuses specifically on digital systems and networks; data security focuses specifically on the information itself, wherever it lives.\n\n• Why the others are wrong: none of the sub-domains is the umbrella term, and physical security is its own branch, not a subset of cybersecurity.\n\nSo the answer is: information security is the umbrella, with cybersecurity, physical security and data security as sub-domains inside it.",
    },
    // ---------- Round B: Security Management goals & lifecycle (4-8) ----------
    {
      type: "order",
      prompt:
        "A company discovers its office VPN client is running badly outdated software that could be exploited. Put these six lifecycle steps back in the correct order for handling it.",
      steps: [
        "Identify that the VPN client is outdated and could be exploited",
        "Plan which patch and password rules to apply",
        "Actually install the VPN patch and enforce the new rules",
        "Watch login logs for any unusual VPN activity",
        "If an intrusion happens, contain it and recover affected systems",
        "Review what allowed the outdated client to slip through and improve the process",
      ],
      modelAnswer:
        "Like the smoke-detector routine: notice the risk, plan a fix, install it, keep watching, deal with any fire that still starts, then learn and upgrade.\n\n• The six-step lifecycle always runs in this order, because each step depends on the last — you can't monitor for a fix that hasn't been implemented yet, and you can't review a response that hasn't happened.\n\nSo the answer is: identify, plan, implement, monitor and detect, respond and recover, then review and improve.",
    },
    {
      type: "mcq",
      prompt:
        "A company runs a penetration test on its system right after a security fix has already shipped, specifically to check the fix actually holds up. Which lifecycle step does this belong to?",
      options: [
        "Monitor & Detect",
        "Identify Risks",
        "Implement Controls",
        "Review & Improve",
      ],
      correctIndex: 3,
      modelAnswer:
        "Once you've fixed a leaky pipe, you don't just walk away — you check the fix actually holds by testing it under pressure, then decide if anything else needs upgrading.\n\n• A penetration test run after a fix ships is evaluating how effective that fix was — that's the Review & Improve step, which closes the loop before it starts again at Identify Risks.\n\n• Why the others are wrong: Identify Risks happens before a fix exists, Implement Controls is the fix going in, and Monitor & Detect is ongoing watching, not a deliberate after-the-fact test of one specific fix.\n\nSo the answer is: Review & Improve.",
    },
    {
      type: "mcq",
      prompt:
        "A company lists 'maintain compliance with GDPR' on one part of its security plan and 'implement controls' on another part. Which statement correctly separates these two ideas?",
      options: [
        "'Maintain compliance with GDPR' is a goal of security management; 'implement controls' is one of the six key elements (steps) used to get there",
        "Both are key elements (steps) of security management, since compliance is just another control to implement",
        "Both are goals of security management, since compliance and controls both protect the same outcome",
        "'Implement controls' is a goal, and 'maintain compliance' is a key element, since laws are followed through specific steps",
      ],
      correctIndex: 0,
      modelAnswer:
        "A goal is the destination you're trying to reach; a key element is one of the actual steps on the road that gets you there.\n\n• Security management's goals include staying legally compliant, protecting CIA, business continuity and trust.\n\n• Its key elements are the six-step process: identify, plan, implement, monitor, respond, review.\n\n• 'Maintain compliance' describes a destination (a goal); 'implement controls' describes one step on the journey (a key element).\n\nSo the answer is: compliance is a goal, and implementing controls is a key element (step).",
    },
    {
      type: "multi",
      prompt: "Select ALL genuine reasons security management matters in IT, based on the list of reasons covered.",
      options: [
        "Protection of critical assets",
        "Legal and regulatory compliance",
        "Maximising developer velocity so features ship faster",
        "Managing human risk such as phishing and weak passwords",
        "Cost avoidance, since prevention costs less than a breach",
      ],
      correctIndices: [0, 1, 3, 4],
      modelAnswer:
        "Some things sound like good business goals but aren't actually reasons security management exists — shipping features faster is a product goal, not a security one.\n\n• Genuine reasons: protecting critical assets, staying legally compliant, managing the human risk of phishing and weak passwords, and avoiding the much higher cost of an actual breach.\n\n• Why 'developer velocity' is wrong: it's a product/engineering-speed goal, and it isn't one of the reasons security management matters.\n\nSo the answer is: protection of assets, compliance, managing human risk, and cost avoidance.",
    },
    {
      type: "mcq",
      prompt:
        "A company removes its monitoring and detection step to save money, planning to rely only on prevention. Months later, attackers who got past the initial defences are found to have been inside the network for weeks, moving freely and copying data the whole time. Why does skipping Monitor & Detect specifically cause this kind of damage?",
      options: [
        "Monitoring only matters after an attacker has already been caught, so skipping it has no effect on how long a breach lasts",
        "Without ongoing monitoring, an intrusion that gets past prevention has no way of being noticed early, so the attacker has unlimited time to explore and cause harm before anyone responds",
        "Prevention controls alone are always sufficient, so removing monitoring cannot lead to an undetected long-term breach",
        "The damage described is caused by weak Implement Controls, not by removing Monitor & Detect, since that step only tracks employee productivity",
      ],
      correctIndex: 1,
      modelAnswer:
        "A locked front door with no security camera means that once someone finally gets past the lock, they can wander the whole house for weeks with nobody noticing.\n\n• Prevention (locks, patches) only stops the first attempt. Once something slips past it, only ongoing monitoring can catch what happens next.\n\n• Without Monitor & Detect, there's no tripwire — the attacker gets unlimited free time inside the network.\n\n• Why the others are wrong: prevention alone was clearly not sufficient here, and monitoring's job is watching for suspicious activity, not tracking productivity.\n\nSo the answer is: skipping monitoring removes the only tripwire that would catch an intrusion early, letting it run undetected for weeks.",
    },
    // ---------- Round C: The CIA Triad (9-15) ----------
    {
      type: "mcq",
      prompt:
        "In a job interview, you're asked: 'You're good at security — how would you secure our organisation?' The interviewer won't tell you anything about their specific systems. What is the one always-safe generic answer, and what does giving it lead into?",
      options: [
        "'I would fire anyone who clicks a phishing link' — which leads into a discussion of HR disciplinary policy and termination procedure",
        "'I can't answer without knowing your systems' — refusing to answer at all is always treated as the safest possible choice in any interview",
        "'I would implement and verify the security fundamentals in your systems' — which leads into naming Confidentiality, Integrity and Availability when asked to elaborate",
        "'I would buy the most expensive firewall on the market' — which leads into a lengthy discussion of vendor pricing and contract terms",
      ],
      correctIndex: 2,
      modelAnswer:
        "When you don't know the specifics, there's still one answer that's always true for any organisation: check the fundamentals are in place.\n\n• 'Implement/verify the security fundamentals' works regardless of the org, and when pushed further, it opens into naming the CIA Triad: Confidentiality, Integrity, Availability.\n\n• Why the others are wrong: pricing and disciplinary policy aren't fundamentals, and refusing to answer at all reads as indecisive rather than safe.\n\nSo the answer is: 'implement the security fundamentals,' which leads into the CIA Triad.",
    },
    {
      type: "mcq",
      prompt:
        "An office cleaner, out of curiosity, picks up a printed memo left on a desk, reads it in plain English, understands that it lists next week's executive bonus figures, then puts it back exactly where it was. Is confidentiality compromised?",
      options: [
        "No — because the cleaner didn't physically take the memo away or show its contents to anyone else",
        "No — because putting the memo back exactly where it originally was undoes whatever happened earlier",
        "Yes, but only because the memo happened to be printed on paper rather than stored digitally",
        "Yes — an unauthorised person understood private information, even though nothing was damaged or removed",
      ],
      correctIndex: 3,
      modelAnswer:
        "A postman who opens a plain letter, reads and understands a private detail, then reseals it and delivers it as if nothing happened has still broken confidentiality — the resealing doesn't undo what was already understood.\n\n• A breach happens the moment an unauthorised person actually understands protected information — not when something goes missing or gets damaged.\n\n• Why the others are wrong: not taking or sharing the memo, and putting it back, don't erase the fact that the information was already understood.\n\nSo the answer is: yes, confidentiality is compromised, because the cleaner understood private information they weren't authorised to see.",
    },
    {
      type: "mcq",
      prompt:
        "An encrypted email containing salary details is intercepted mid-transit by someone outside the company, but they have no way to decrypt it and can only see scrambled text. Is confidentiality compromised?",
      options: [
        "No — accessing scrambled, encrypted data without being able to understand it isn't a breach; a breach requires actually understanding the protected content",
        "No, but only because email as a channel is generally considered lower-risk than sending printed paper documents",
        "Yes, but only once the interceptor goes on to store a permanent copy of that scrambled, unreadable file somewhere",
        "Yes — any unauthorised access to a transmitted file always counts as a breach, regardless of whether the content is actually readable",
      ],
      correctIndex: 0,
      modelAnswer:
        "This is the coded-letter version of the postman story: the postman opens the letter, sees the code words, but can't read them — nothing private was actually understood.\n\n• Just touching protected information isn't a breach on its own — a breach requires the unauthorised party to actually understand the content.\n\n• Why the others are wrong: storing a copy of unreadable scrambled text still doesn't reveal anything, and the channel (email vs paper) isn't what decides this.\n\nSo the answer is: no, confidentiality is not compromised, because the interceptor never actually understood the encrypted content.",
    },
    {
      type: "mcq",
      prompt: "Why is the CIA Triad usually drawn as a triangle rather than as three separate boxes?",
      options: [
        "Because only two of the three parts are ever needed at once, and the third is optional",
        "Because all three parts must be implemented together, like three pillars holding up the same roof — if one is weak, the whole structure is at risk",
        "Because a triangle is simply the traditional shape used in every information-security diagram, with no meaning behind it",
        "Because the three parts are always equally important in every single system, with no exceptions",
      ],
      correctIndex: 1,
      modelAnswer:
        "A triangle only stands because all three sides support each other — remove or weaken one side and the whole shape collapses, unlike three separate, unrelated boxes.\n\n• Confidentiality, Integrity and Availability must all be implemented together; if even one is weak, the overall security 'building' is at risk no matter how strong the other two are.\n\n• Why the others are wrong: which element matters most does vary by system (so it isn't 'always equally important, no exceptions'), the shape carries real meaning, and none of the three is ever truly optional.\n\nSo the answer is: it's drawn as a triangle because all three parts must hold up the same structure together.",
    },
    {
      type: "mcq",
      prompt:
        "For an airline's flight-booking ledger, a doubled or silently dropped booking record could put two passengers in the same seat or lose a booking entirely. Which CIA element matters most here, and why?",
      options: [
        "All three matter exactly equally in every system, so no single element can be prioritised here",
        "Confidentiality — passenger data must stay private, since privacy always outranks accuracy in a ledger system",
        "Integrity — the records must stay accurate and unaltered, since a subtly wrong number causes real, hard-to-detect harm",
        "Availability — the booking system must always be reachable, since any downtime matters more than record accuracy",
      ],
      correctIndex: 2,
      modelAnswer:
        "For a bank balance, changing one digit turns $10,000 into $100,000 or $100 without anyone noticing right away — that's exactly the kind of quiet, high-impact damage a broken booking ledger causes too.\n\n• A doubled or dropped record is an accuracy problem, and accuracy is what Integrity protects.\n\n• Why the others are wrong: the scenario is about wrong or missing records, not about the system being unreachable (Availability) or private data leaking (Confidentiality).\n\nSo the answer is: Integrity, because the harm described comes from records becoming inaccurate, not from the system being down or exposed.",
    },
    {
      type: "multi",
      prompt: "Select ALL techniques that primarily protect Confidentiality.",
      options: [
        "Encryption of stored and transmitted data",
        "Role-based access permissions limiting who can open a file",
        "Multi-factor authentication (MFA) before logging in",
        "Checksums verifying a file hasn't been altered",
        "Cryptographic hashes used to detect tampering",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Confidentiality tools stop the wrong people from reading something; Integrity tools check whether something has been secretly changed. It's easy to mix the two up.\n\n• Confidentiality techniques: encryption, access permissions, and MFA all control who can actually get to and read the data.\n\n• Why the last two are wrong: checksums and cryptographic hashes detect tampering — that's an Integrity job, not a Confidentiality one.\n\nSo the answer is: encryption, access permissions and MFA protect Confidentiality.",
    },
    {
      type: "fillblank",
      prompt:
        "The CIA Triad's three parts: ___ (only authorised people can read it), ___ (the data hasn't been secretly changed), ___ (the system is there when it's needed).",
      blanks: [["confidentiality"], ["integrity"], ["availability"]],
      modelAnswer:
        "Three legs of one stool: if any leg is missing, the whole thing tips over, no matter how strong the other two are.\n\n• Confidentiality: only authorised people can read it.\n\n• Integrity: the data hasn't been secretly changed.\n\n• Availability: the system is there when it's needed.\n\nSo the answer is: Confidentiality, Integrity, Availability.",
    },
    // ---------- Round D: Vulnerabilities & Risk (16-20) ----------
    {
      type: "sort",
      prompt: "Sort each vulnerability example into the factor category it best illustrates.",
      groups: ["Human Factors", "Technological Factors", "Organisational Factors"],
      items: [
        { text: "An employee reuses the same password across five different work accounts", group: 0 },
        { text: "A cloud storage bucket is left with public read access by mistake", group: 1 },
        { text: "The company has no written incident-response plan at all", group: 2 },
        { text: "Staff have never received any phishing-awareness training", group: 0 },
        { text: "A critical server hasn't been patched in over a year", group: 1 },
        { text: "The organisation lets a third-party vendor connect to its network without ever reviewing the vendor's own security", group: 2 },
        { text: "An employee clicks a link in a message pretending to be their bank", group: 0 },
        { text: "Firewall rules were never properly configured after installation", group: 1 },
      ],
      modelAnswer:
        "A building can be weak because of the people in it, the tech running it, or the way the organisation is set up around it — often all three at once.\n\n• Human: password reuse, no phishing training, clicking a fake bank link.\n\n• Technological: a misconfigured public storage bucket, an unpatched server, unconfigured firewall rules.\n\n• Organisational: no incident-response plan, and trusting a vendor without ever checking their security.\n\nSo the answer is: password reuse, no training and clicking the fake link are Human; the storage bucket, unpatched server and firewall are Technological; the missing plan and unvetted vendor are Organisational.",
    },
    {
      type: "mcq",
      prompt:
        "An intern's test account was never disabled after their internship ended six months ago, and it still has valid login access today. What security concept does this best illustrate?",
      options: [
        "A control — since leaving the account active was technically a deliberate security decision",
        "A risk that has already been fully realised, since the account being open guarantees a breach has already happened",
        "A threat — since the intern is now assumed to be actively planning an attack",
        "A vulnerability — a weak point in the system that could be exploited, whether or not anyone has used it yet",
      ],
      correctIndex: 3,
      modelAnswer:
        "A building with a hundred small windows only needs one left unlocked for someone to get in — whether or not anyone has tried that window yet.\n\n• The still-active, unused intern account is exactly that kind of weak point: a vulnerability that exists whether or not it's ever exploited.\n\n• Why the others are wrong: nothing says the intern is actively attacking anything (not a threat), leaving it open wasn't a deliberate safeguard (not a control), and a weak point existing doesn't mean a breach has definitely already happened (not a realised risk).\n\nSo the answer is: a vulnerability.",
    },
    {
      type: "mcq",
      prompt:
        "System A has many unpatched flaws but no evidence anyone is targeting it. System B is fully patched and hardened but is currently facing a determined, skilled attacker. Using Risk = Vulnerability × Threat, which statement is correct?",
      options: [
        "Both systems currently carry only moderate-to-low combined risk, because each is missing one of the two factors that must both be high for risk to spike",
        "System B carries the highest possible risk, since any active attacker alone is enough to make risk maximal regardless of defences",
        "System A carries the highest possible risk, since vulnerability alone is enough to make risk maximal regardless of any attacker",
        "Neither system carries any risk at all, since risk only exists once a breach has actually occurred",
      ],
      correctIndex: 0,
      modelAnswer:
        "An unlocked window with no burglar nearby is low risk. A locked, alarmed window facing a determined burglar is also relatively low risk. Danger only spikes when both a real weakness and a real, motivated attacker exist together.\n\n• System A has high vulnerability but low threat (nobody's targeting it). System B has low vulnerability but high threat (a skilled attacker is trying). Neither has both factors high at once.\n\n• Why the others are wrong: vulnerability or threat alone, without the other, doesn't spike risk to its maximum.\n\nSo the answer is: both carry only moderate-to-low risk, because each is missing one of the two factors that must combine for risk to spike.",
    },
    {
      type: "multi",
      prompt: "Select ALL true statements about why users are often called the biggest security threat.",
      options: [
        "Human error, like sending sensitive info to the wrong person, can undo strong technical defences",
        "Poor password practices, like reusing passwords across accounts, create easy openings",
        "Susceptibility to phishing and social engineering lets attackers in without breaking any technical control",
        "Zero-day vulnerabilities exist primarily because users choose weak passwords",
        "Insider threats, where a disgruntled employee misuses legitimate access, are a genuine user-related risk",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "Even the strongest firewall and encryption can be bypassed the moment a person makes a mistake or is tricked — that's why users are called the weakest link.\n\n• Genuine user-related risks: human error, poor password practices, phishing/social-engineering susceptibility, and insider misuse of legitimate access.\n\n• Why the zero-day statement is wrong: zero-days are brand-new technical flaws unknown to vendors and defenders — a technical/vendor gap, not something caused by user password choices.\n\nSo the answer is: human error, poor passwords, phishing susceptibility, and insider threats are the genuine reasons.",
    },
    {
      type: "multi",
      prompt: "How can Availability be compromised? Select ALL genuine causes.",
      options: [
        "A Denial-of-Service (DoS) attack flooding a server with fake requests so real users can't get through",
        "Someone physically stealing the server or cutting its network cable",
        "A hardware failure or power outage taking the system offline",
        "An attacker successfully decrypting stored customer data",
        "An unauthorised person subtly changing a stored record's values",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Availability is about whether the system is actually there when you need it — it can fail through an attack or through nothing malicious at all, like a power cut.\n\n• A DoS flood, physical theft or cable-cutting, and hardware failure or power outages all make a system unreachable — that's Availability being compromised.\n\n• Why the last two are wrong: decrypting stored data is a Confidentiality problem, and subtly altering a record is an Integrity problem — neither is about the system being unreachable.\n\nSo the answer is: a DoS attack, a physical security failure, and a hardware/power failure can all compromise Availability.",
    },
    // ---------- Round E: Controls & Access Control (21-24) ----------
    {
      type: "match",
      prompt: "Match each action to the control type it best represents.",
      pairs: [
        { left: "Encrypting a customer database", right: "Technical control — a digital safeguard built into the system itself" },
        { left: "Enforcing MFA on every login", right: "Technical control — a second proof of identity beyond a password" },
        { left: "Writing a password-rotation policy", right: "Administrative control — a written rule governing how systems must be used" },
        { left: "Installing a keycard lock on the server room door", right: "Physical control — a barrier protecting the tangible hardware itself" },
      ],
      decoys: ["A control that exists only as an aspirational company value with no enforcement mechanism"],
      modelAnswer:
        "Controls come in three flavours: things built into the technology, written rules about behaviour, and physical barriers.\n\n• Encryption and MFA are Technical controls — digital safeguards built into the system.\n\n• A password-rotation policy is an Administrative control — a written rule.\n\n• A keycard lock on the server room is a Physical control — a barrier protecting hardware.\n\nSo the answer is: encryption and MFA are Technical, the policy is Administrative, and the keycard lock is Physical.",
    },
    {
      type: "mcq",
      prompt:
        "A temporary contractor is given a login that can only open one specific shared folder needed for their three-week project, and nothing else on the network. What security principle does this reflect?",
      options: [
        "Zero-day protection — limiting exposure to brand-new, unpatched vulnerabilities",
        "Least privilege — giving someone only the minimum access needed to do their specific job",
        "Shared Responsibility — splitting security duties between a provider and a customer",
        "Defense-in-depth — stacking multiple unrelated security layers on top of each other",
      ],
      correctIndex: 1,
      modelAnswer:
        "A hotel keycard opens your room and maybe the gym, never the manager's office, even though you're a paying guest in the same building.\n\n• Giving the contractor access to exactly one folder and nothing else is least privilege — the smallest amount of access needed to do the job.\n\n• Why the others are wrong: nothing here describes stacked layers (defense-in-depth), unpatched flaws (zero-day), or a provider/customer split (Shared Responsibility).\n\nSo the answer is: least privilege.",
    },
    {
      type: "mcq",
      prompt:
        "A bank wants to stop staff from accidentally emailing customer spreadsheets to the wrong recipient, so it deploys software that automatically blocks outgoing emails containing account numbers unless approved. What is this software an example of, in security terms?",
      options: [
        "A vulnerability — a weak point that increases the bank's exposure to risk",
        "A threat — an entity capable of causing harm to the bank's systems",
        "A control — a fix put in place specifically to reduce a security risk",
        "A breach — an incident where unauthorised access has already occurred",
      ],
      correctIndex: 2,
      modelAnswer:
        "A control is basically a 'fix' put in place to lower a risk — a patch, a password rule, or in this case, software that blocks a risky email automatically.\n\n• This blocking software directly reduces the risk of accidental data leakage, which is exactly what a control does.\n\n• Why the others are wrong: it isn't a weakness (vulnerability), it isn't something capable of causing harm (threat), and no unauthorised access has happened (breach).\n\nSo the answer is: a control.",
    },
    {
      type: "mcq",
      prompt:
        "A company protects all logins with only a password — no MFA, no monitoring, nothing else. An attacker guesses one employee's weak password. What happens next, and why does this illustrate the value of defense-in-depth?",
      options: [
        "This scenario shows that passwords alone are always a fully sufficient defence, since defense-in-depth only ever really matters for physical security",
        "The attacker is automatically blocked by the operating system's own built-in defences, regardless of how many extra security layers exist",
        "Nothing happens, because a correctly guessed password is never actually enough on its own to access any properly configured company account",
        "The attacker gets straight in with nothing left to stop them, because that one layer just failed — a second layer like MFA would have caught it",
      ],
      correctIndex: 3,
      modelAnswer:
        "A castle with only a moat and nothing else falls the moment someone crosses the moat. A castle with a moat, then a wall, then guards, survives that same single failure.\n\n• With only one layer (the password), guessing it right is game over — there's nothing left to catch the attacker.\n\n• With defense-in-depth, MFA behind the password would have stopped the same guessed password from being enough on its own.\n\nSo the answer is: the attacker gets straight in, because a single layer that fails leaves nothing else to stop them — which is exactly why defense-in-depth stacks more layers.",
    },
    // ---------- Round F: Cybercrime Types I (25-28) ----------
    {
      type: "mcq",
      prompt:
        "An ex-employee's login was never disabled after they left. Six months later, they use that still-active login to export the company's entire customer list. Which term best describes what actually happened as the outcome of this event, as opposed to how it was carried out?",
      options: [
        "A Data Breach — customer data was taken without authorisation, the outcome; the still-active login misuse is the Unauthorised Access that enabled it",
        "Only Hacking — no breach can ever exist unless a technical system was actually broken into using written malicious code",
        "Neither term applies here, since the login itself was, at some earlier point in time, a technically valid and properly issued credential",
        "Only a Data Breach — accessing a system using previously valid login credentials is never considered a form of unauthorised access",
      ],
      correctIndex: 0,
      modelAnswer:
        "Using an old, still-valid key to sneak back into a house you no longer live in is unauthorised access — the outcome is what you took once inside, which is the actual breach.\n\n• Hacking/Unauthorised Access describes how they got in (misusing a login they shouldn't still have). Data Breach describes what happened as a result (customer data taken without authorisation).\n\n• Why the others are wrong: no code needed to be broken for this to count as unauthorised access, and having once-valid credentials doesn't make later misuse authorised.\n\nSo the answer is: a Data Breach was the outcome, enabled by Unauthorised Access to a login that should have been disabled.",
    },
    {
      type: "mcq",
      prompt:
        "Someone posts their full name and date of birth publicly on social media, and weeks later discovers accounts have been opened in their name. Which preventive measure would have most directly reduced this risk?",
      options: [
        "Setting up a Web Application Firewall on their home router",
        "Being cautious about sharing personal information online",
        "Installing antivirus software on their home computer",
        "Shredding old paper bank statements before throwing them out",
      ],
      correctIndex: 1,
      modelAnswer:
        "Posting your name and birthday publicly is like leaving your ID card on a park bench — anyone can pick up exactly what they need to pretend to be you.\n\n• The direct cause here was public oversharing, so the direct fix is being cautious about what personal info gets shared online.\n\n• Why the others are wrong: antivirus, shredding paper, and a Web Application Firewall are all real preventive measures for other risks, but none of them addresses information that was voluntarily posted publicly.\n\nSo the answer is: being cautious about sharing personal information online.",
    },
    {
      type: "multi",
      prompt: "Select ALL genuine preventive measures for Hacking and Unauthorised Access.",
      options: [
        "Role-based access control (RBAC) limiting what each account can do",
        "Mandatory multi-factor authentication",
        "A Web Application Firewall combined with input validation",
        "Regular vendor and third-party risk assessments",
        "Permanently disabling all remote access company-wide",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Real preventive measures narrow down exactly who can get in and how, without shutting the business down entirely.\n\n• RBAC, mandatory MFA, a Web Application Firewall with input validation, and vendor risk assessments all genuinely reduce the chance of unauthorised access.\n\n• Why the last one is wrong: permanently disabling all remote access isn't a realistic or listed measure — it would cripple normal business operations, not just block attackers.\n\nSo the answer is: RBAC, MFA, WAF with input validation, and vendor risk assessments.",
    },
    {
      type: "fillblank",
      prompt: "Manipulating a person (not a machine) into revealing confidential information is called ___.",
      blanks: [["social engineering"]],
      modelAnswer:
        "A con artist never bothers picking your lock — they just trick you into handing over the key yourself, by pretending to be someone you trust.\n\n• This is exactly what this term describes: tricking a person, rather than hacking a machine, into giving up access or secrets.\n\n• Phishing is one specific, email/message-based version of this broader idea.\n\nSo the answer is: social engineering.",
    },
    // ---------- Round G: Cybercrime Types II (29-33) ----------
    {
      type: "mcq",
      prompt:
        "An employee downloads a spreadsheet that contains a hidden macro programmed to secretly delete files when opened. What category does this macro belong to, in the broadest sense?",
      options: [
        "A zero-day vulnerability — a brand-new flaw that defenders have never encountered or documented before now",
        "A control — a specific fix deliberately put in place by defenders to reduce an identified security risk",
        "Malware — malicious software, the umbrella term covering viruses, Trojans and macros written to cause harm",
        "A DDoS attack — a flood of traffic from many different sources all aimed at overwhelming one single target",
      ],
      correctIndex: 2,
      modelAnswer:
        "Viruses, Trojans and macros are all just different disguises for the same underlying idea: code deliberately written to cause harm.\n\n• A destructive hidden macro is a sub-type of malware, the umbrella term for malicious software.\n\n• Why the others are wrong: nothing says this flaw was previously unknown (zero-day), nothing involves many machines flooding a target (DDoS), and it's harmful code, not a protective fix (control).\n\nSo the answer is: malware.",
    },
    {
      type: "fillblank",
      prompt: "A brand-new flaw with no existing defence signature is called a ___ vulnerability.",
      blanks: [["zero-day", "zero day"]],
      modelAnswer:
        "Imagine a lock-picking trick no locksmith on Earth has ever seen before — no alarm knows to watch for it, because nobody has taught any alarm what it looks like yet.\n\n• That's exactly what this term describes: a flaw so new that defenders have had zero days of warning before it can be exploited.\n\nSo the answer is: zero-day.",
    },
    {
      type: "mcq",
      prompt:
        "A ticket-sales website is flooded with fake requests from one single overloaded machine, and legitimate buyers can't get through. A month later, the same site is flooded again — this time from thousands of hijacked devices scattered across dozens of countries, all hitting it at the same moment. What are these two attacks called, in order, and why is the second one considered more dangerous?",
      options: [
        "Both attacks are DoS, since the target and the underlying goal of denying service stayed exactly the same across both incidents",
        "Both attacks are DDoS, since any flood of fake requests always counts as distributed no matter how many sources are actually involved",
        "DDoS, then DoS — many attacking machines the first time around, then only just one single attacking machine the second time",
        "DoS, then DDoS — one attacking machine the first time, then many attacking machines from many locations the second time, which is far harder to filter out from real traffic",
      ],
      correctIndex: 3,
      modelAnswer:
        "One annoying person knocking on your door nonstop is one problem. An entire mob knocking from every direction at once is a much bigger one, because you can't just block one direction.\n\n• One machine flooding a target is DoS (Denial of Service). Thousands of machines from many locations flooding it together is DDoS (Distributed Denial of Service).\n\n• DDoS is more dangerous specifically because the traffic comes from so many different sources that defences can't tell the flood apart from real customers trying to log in.\n\nSo the answer is: DoS then DDoS, and the second is more dangerous because its scale and spread make it far harder to filter out.",
    },
    {
      type: "mcq",
      prompt:
        "One attacker floods a company's server with traffic until it crashes and goes offline. A different attacker quietly gets into a company's network and stays hidden for months, slowly copying out small amounts of data without crashing anything. What's the key difference between these two, and why does it matter for detection?",
      options: [
        "A DDoS attack is loud and instantly noticeable once the service goes down; an APT is deliberately quiet and drawn-out, avoiding the outage alerts that catch a DDoS attack",
        "A DDoS attack is actually quiet and genuinely hard to detect, while an APT (Advanced Persistent Threat) is loud and immediately obvious the moment it begins",
        "There is no real difference at all between the two — both are simply just variants of the same underlying Denial-of-Service attack aimed at crashing one server",
        "An APT always involves noticeably more attacking machines spread across more locations than a typical DDoS attack, which is what makes it harder to detect",
      ],
      correctIndex: 0,
      modelAnswer:
        "A fire alarm catches a fire the moment smoke appears — loud and obvious. A slow leak under the floorboards can go unnoticed for months, because nothing ever triggers the alarm.\n\n• A DDoS attack crashes the service, which is instantly obvious to everyone.\n\n• An APT (Advanced Persistent Threat) is the opposite by design — an attacker who stays hidden and moves slowly specifically to avoid triggering outage-based alerts.\n\n• Why detection differs: DDoS gets caught by simply noticing the service is down; an APT needs deliberate, ongoing monitoring for subtle anomalies, since nothing crashes to give it away.\n\nSo the answer is: DDoS is loud and self-announcing; an APT is quiet and long-lived, which is exactly why it's harder to detect.",
    },
    {
      type: "multi",
      prompt: "Select ALL genuine preventive measures for phishing.",
      options: [
        "User awareness training to recognise suspicious emails and links",
        "Multi-factor authentication, so a stolen password alone isn't enough",
        "Email and web filters blocking malicious content before it reaches users",
        "Treating a phone-call impersonation scam ('vishing') as textbook phishing, since both trick people",
        "Physically locking every employee's phone in a drawer during work hours",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Phishing is specifically the email/message version of tricking people — not every trick that uses a phone or a voice counts as phishing itself.\n\n• User training, MFA, and email/web filters are all genuine, listed preventive measures for phishing.\n\n• Why the last two are wrong: 'vishing' (a phone-call impersonation scam) is social engineering, but it's not phishing specifically, which is message/email-based — and locking away every phone isn't a realistic or listed measure.\n\nSo the answer is: user training, MFA, and email/web filters.",
    },
    // ---------- Round H: Real Breaches & Shared Responsibility (34-38) ----------
    {
      type: "mcq",
      prompt:
        "A company using a cloud CRM platform skips enabling MFA on its admin account and reuses a password that was previously leaked in an unrelated breach. An attacker logs in using that leaked password. Under the Shared Responsibility Model, whose responsibility was the failure that let this happen?",
      options: [
        "Neither party's — reused passwords are considered an unavoidable risk that no framework assigns responsibility for",
        "The customer's — enabling MFA and using unique, uncompromised passwords are account-security tasks that sit on the customer's side of the split",
        "The customer's original employer from years ago, since that's where the password was first leaked",
        "The cloud provider's — since any successful login to a hosted platform is always the provider's fault",
      ],
      correctIndex: 1,
      modelAnswer:
        "The landlord fits a strong lock to the building's main door, but if you hand your own apartment key to a stranger, that's on you, not the landlord.\n\n• MFA and using unique, uncompromised passwords are account-security tasks — squarely on the customer's side of the Shared Responsibility Model.\n\n• Why the others are wrong: the provider's infrastructure wasn't the point of failure here, and 'unavoidable' or 'someone else's fault years ago' both dodge the fact that this specific account-security choice was the customer's to make.\n\nSo the answer is: the customer's — MFA and password hygiene are account-security tasks on the customer's side.",
    },
    {
      type: "mcq",
      prompt:
        "TJX's 2005-2007 breach exposed up to 45.7 million accounts; data was intercepted over Wi-Fi before it reached encryption, and unencrypted data had also been stored since as early as 2002. Which CIA element was primarily broken, and what's the root technical cause?",
      options: [
        "Confidentiality — but the root cause was a phishing email sent to a single TJX executive",
        "Availability — the stolen data made the payment system unusable for months, caused by a denial-of-service attack",
        "Confidentiality — customer card data was read by unauthorised parties, caused by transmitting and storing sensitive data without encryption",
        "Integrity — the card numbers were altered in transit, caused by a weak Wi-Fi signal",
      ],
      correctIndex: 2,
      modelAnswer:
        "Sending a postcard instead of a sealed letter means anyone along the way can simply read it — that's exactly what unencrypted Wi-Fi transmission and unencrypted storage did to this card data.\n\n• Confidentiality was broken: unauthorised parties read card data they were never meant to see.\n\n• The root cause was technical: sensitive data travelled over Wi-Fi and sat in storage without encryption, so anyone intercepting it could simply read it.\n\n• Why the others are wrong: nothing describes altered numbers (Integrity) or a system outage (Availability), and no phishing email is mentioned in the facts given.\n\nSo the answer is: Confidentiality, caused by transmitting and storing card data without encryption.",
    },
    {
      type: "mcq",
      prompt:
        "Kido International's 2025 ransomware attack exposed data on 25,000+ children, parents and staff across 38 countries; the attackers got in via weak third-party vendor access controls. Which vulnerability category does this best illustrate?",
      options: [
        "Physical Factors — an intruder physically breaking into one of Kido's own office buildings overnight",
        "Technological Factors — a previously unknown zero-day flaw inside Kido's own custom-built internal software",
        "Human Factors — a single Kido employee's own personal social media oversharing about their job",
        "Organisational Factors — over-reliance on a third-party vendor without properly vetting or restricting their access",
      ],
      correctIndex: 3,
      modelAnswer:
        "Letting a delivery company keep a spare key to your building without ever checking how carefully they guard their own keys is exactly the kind of vendor-trust gap described here.\n\n• The stated cause was weak third-party vendor access controls — over-reliance on a vendor whose own security wasn't properly checked. That's an Organisational Factor.\n\n• Why the others are wrong: no physical break-in, employee oversharing, or Kido-specific zero-day is mentioned — the facts point squarely at vendor access controls.\n\nSo the answer is: Organisational Factors, specifically over-reliance on an under-vetted third-party vendor.",
    },
    {
      type: "multi",
      prompt: "Select ALL statements about the Shared Responsibility Model that are true.",
      options: [
        "The cloud provider is responsible for the platform's infrastructure and overall uptime",
        "The customer is responsible for enabling MFA on their own accounts",
        "The customer is responsible for their own access controls and monitoring",
        "The provider is responsible for the customer's individual account security, including their password choices",
        "In the Snowflake case, the provider's own servers were found to be the direct cause of the breach",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "The landlord and the tenant each own a clearly different half of the same building's security — mixing up who owns which half is the mistake to avoid.\n\n• The provider owns platform infrastructure and uptime. The customer owns their own MFA, access controls and monitoring.\n\n• Why the last two are wrong: the provider does not own the customer's individual password choices, and in the Snowflake case the provider's own servers were not the cause — customers skipping MFA and reusing leaked passwords were.\n\nSo the answer is: the first three statements are true.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false? Under the Shared Responsibility Model, the cloud provider is responsible for enforcing MFA on each individual customer account.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "The landlord doesn't come round to lock your apartment door for you every night — that part of the deal is yours.\n\n• Enabling and enforcing MFA on an individual account is an account-security task, which sits on the customer's side of the Shared Responsibility Model, not the provider's.\n\nSo the answer is: false — MFA enforcement on individual accounts is the customer's responsibility.",
    },
    // ---------- Round I: Threat Categories & Individual Data Rights (39-43) ----------
    {
      type: "sort",
      prompt: "Sort each threat example into the category it comes from.",
      groups: ["Human-based", "Technical", "External"],
      items: [
        { text: "An employee accidentally emails a customer list to the wrong recipient", group: 0 },
        { text: "An unpatched web server has a known exploitable flaw", group: 1 },
        { text: "A supplier's compromised system is used as a stepping stone into the company's network", group: 2 },
        { text: "A disgruntled staff member deliberately deletes project files before resigning", group: 0 },
        { text: "A misconfigured database exposes records to the public internet", group: 1 },
        { text: "A hacking group unaffiliated with the company breaches it purely for profit", group: 2 },
        { text: "An employee falls for a phishing email and hands over their password", group: 0 },
        { text: "Outdated encryption on a legacy system is broken by a modern attack technique", group: 1 },
      ],
      modelAnswer:
        "Threats come from three different directions: the people inside, the technology itself, or somewhere entirely outside the organisation's control.\n\n• Human-based: the accidental email, the deliberate deletion, and falling for phishing — all caused by people.\n\n• Technical: the unpatched server, the misconfigured database, and the broken outdated encryption — all exploiting weaknesses in the technology itself.\n\n• External: the compromised supplier and the unaffiliated hacking group — both coming from outside the organisation's direct control.\n\nSo the answer is: the email mistake, the deliberate deletion and the phishing victim are Human-based; the unpatched server, misconfigured database and broken encryption are Technical; the supplier and the hacking group are External.",
    },
    {
      type: "match",
      prompt: "Match each individual data right to its description.",
      pairs: [
        { left: "Right to be informed", right: "Organisations must clearly explain how your data is collected, stored and used" },
        { left: "Right of access", right: "You can request a copy of the personal data an organisation holds about you" },
        { left: "Right to rectification", right: "You can have inaccurate or incomplete data corrected" },
        { left: "Right to erasure", right: "You can request your data be deleted, unless a law requires it to be kept" },
        { left: "Right to restrict processing", right: "You can limit how your data is used without deleting your account entirely" },
      ],
      decoys: ["A guaranteed right to a full refund whenever a data breach occurs"],
      modelAnswer:
        "Each right protects a different kind of control over your own data — knowing about it, seeing it, fixing it, deleting it, or just limiting one specific use of it.\n\n• Right to be informed: know how your data is used. Right of access: get a copy of it. Right to rectification: fix it if wrong. Right to erasure: delete it (with legal exceptions). Right to restrict processing: limit one use without closing the account.\n\nSo the answer is: informed = explanation of use, access = copy of data, rectification = correction, erasure = deletion with exceptions, restrict processing = limiting one use.",
    },
    {
      type: "mcq",
      prompt:
        "A customer asks their bank to delete all their personal data, including past transaction records. The bank refuses to delete the transaction records specifically, citing a legal requirement. Is the bank's refusal consistent with the Right to Erasure?",
      options: [
        "Yes — the Right to Erasure has an exception for data that must be kept for legal, contractual or public-interest reasons, like financial record-keeping",
        "No — the Right to Erasure has no exceptions whatsoever, so the bank must always delete everything the customer requests",
        "Yes, but only because banks as an industry are entirely exempt from every data-protection law that exists",
        "No — refusing any deletion request from any customer is always unlawful, regardless of whatever reason is given",
      ],
      correctIndex: 0,
      modelAnswer:
        "A landlord can't shred the lease the moment a tenant moves out if the law says leases must be kept on file for a set number of years — some records simply have to stay, by law.\n\n• The Right to Erasure explicitly carries an exception: data that must be kept for legal, contractual or public-interest reasons, such as financial record-keeping requirements.\n\n• Why the others are wrong: the right does have real exceptions, banks aren't blanket-exempt from all data law, and refusing a deletion request isn't automatically unlawful when a genuine legal exception applies.\n\nSo the answer is: yes, the refusal is consistent, because financial record-keeping law is exactly the kind of exception the Right to Erasure allows for.",
    },
    {
      type: "mcq",
      prompt:
        "A customer asks a company to stop sending them marketing emails but keep their account open and usable. A different customer asks the company to delete their account and all associated data entirely. Which right does each customer's request match?",
      options: [
        "Neither request matches a real individual data right, since both are just customer-service preferences",
        "The first is Right to Restrict Processing (limiting one use of the data while the account stays active); the second is Right to Erasure",
        "The first is Right to Erasure and the second is Right to Restrict Processing",
        "Both requests are examples of Right to Erasure, since both involve reducing how the company uses the customer's data",
      ],
      correctIndex: 1,
      modelAnswer:
        "Asking to stop just the junk mail while keeping your account is very different from asking to close the account entirely — one limits a single use, the other removes everything.\n\n• Right to Restrict Processing: limit one specific use (marketing emails) while the account stays active — that's the first customer.\n\n• Right to Erasure: delete the account and its data entirely — that's the second customer.\n\nSo the answer is: the first request matches Right to Restrict Processing, and the second matches Right to Erasure.",
    },
    {
      type: "mcq",
      prompt:
        "A company's marketing team adopts a new AI writing tool company-wide within a week, well before the security team has had a chance to review what data the tool collects or how it's stored. Which factor that makes security harder does this best illustrate, and why?",
      options: [
        "A physical factor, since the AI tool exists only as software with no physical component at all",
        "Regulatory and compliance pressure, since the AI tool itself is issuing legal threats against the company",
        "Rapid technological change outpacing an organisation's ability to assess and secure new tools before they're already in wide use",
        "Resource constraints, since the company has more security staff than it needs and cannot use them fast enough",
      ],
      correctIndex: 2,
      modelAnswer:
        "New tools can spread through a company faster than anyone can properly check them, like a new app going viral among staff before IT even hears about it.\n\n• The marketing team adopting the tool in a week, before security review, is exactly rapid technological change outpacing the organisation's ability to assess and secure it in time.\n\n• Why the others are wrong: no legal threat, no staff-surplus problem, and no physical-hardware element is described in this scenario.\n\nSo the answer is: rapid technological change, because the tool spread faster than the security team could vet it.",
    },
    // ---------- Round J: Case Study Application: Healthcare Ransomware (44-46) ----------
    {
      type: "multi",
      prompt:
        "A mid-sized healthcare organisation was hit after an employee clicked a phishing email link, which installed ransomware on several hospital servers. Patient records became temporarily unavailable, and some sensitive patient data was also exposed. The attackers demanded payment to unlock the files. Select ALL CIA Triad elements that were impacted by this incident.",
      options: [
        "Confidentiality — sensitive patient data was exposed to unauthorised parties",
        "Availability — patient records became temporarily unreachable",
        "Integrity — there's no indication in the scenario that any records were altered or corrupted, only exposed and made unavailable",
        "All three elements equally, since ransomware by definition breaks all of CIA at once",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "The scenario tells you exactly two things happened: data got seen by people who shouldn't have seen it, and records became temporarily unreachable. Nothing says any record was actually altered.\n\n• Confidentiality was hit (data exposed) and Availability was hit (records unreachable).\n\n• Why Integrity is wrong here: the scenario never mentions any record being changed or corrupted — only exposed and made unavailable. Assuming Integrity was also hit isn't supported by the facts given.\n\nSo the answer is: Confidentiality and Availability were impacted.",
    },
    {
      type: "mcq",
      prompt:
        "Using the same healthcare ransomware scenario: what should the organisation do as its best immediate incident-response step, and why is it prioritised over paying the ransom?",
      options: [
        "Publicly announce the attack to all patients before taking any technical containment action, since transparency matters more than stopping the spread",
        "Pay the ransom immediately, because it's the fastest, fully guaranteed way to restore every single affected patient record",
        "Wait for the attackers to make first contact before doing anything at all, since acting too early could make the whole attack worse",
        "Contain and isolate the affected servers, because stopping the ransomware from spreading further protects unaffected systems, whereas paying doesn't guarantee file recovery and funds further attacks",
      ],
      correctIndex: 3,
      modelAnswer:
        "A fire-alarm evacuation doesn't start by negotiating with whoever pulled the alarm — you contain the immediate danger first, before anything else.\n\n• Containing and isolating the affected servers stops the ransomware from spreading to unaffected systems right now.\n\n• Why paying isn't prioritised: it doesn't guarantee the files actually get unlocked, and paying funds further attacks against other victims.\n\n• Why the others are wrong: waiting passively lets the ransomware keep spreading, and a public announcement before any technical action doesn't stop the ongoing damage.\n\nSo the answer is: contain and isolate the affected servers first, because paying doesn't guarantee recovery and only funds more attacks.",
    },
    {
      type: "mcq",
      prompt:
        "Using the same healthcare ransomware scenario: what legal and ethical obligation does the organisation have after the attack, regardless of whether it pays the ransom?",
      options: [
        "Notify affected patients under breach-disclosure obligations, since exposed personal and health data triggers a duty to inform those affected",
        "Disclosure is only ever legally required if more than one million individual records were exposed in total",
        "The obligation to notify patients falls solely on the ransomware attackers themselves, never on the healthcare organisation",
        "No disclosure obligation exists at all, once the ransom has actually been paid and the files are fully unlocked again",
      ],
      correctIndex: 0,
      modelAnswer:
        "Paying to get your stolen wallet back doesn't erase the fact that a stranger already saw everything inside it — the people affected still deserve to know.\n\n• Exposing sensitive patient data triggers a breach-disclosure obligation to notify those affected, regardless of whether the ransom was later paid.\n\n• Why the others are wrong: paying the ransom doesn't remove the disclosure duty, there's no stated record-count threshold that erases it, and the obligation sits with the organisation that held the data, not with the attackers.\n\nSo the answer is: notify affected patients under breach-disclosure obligations, regardless of whether the ransom is paid.",
    },
    // ---------- Final mixed-review round (47-53) ----------
    {
      type: "mcq",
      prompt:
        "In 2024 a faulty CrowdStrike software update crashed millions of Windows machines worldwide, grounding flights and disrupting hospitals for hours, with no attacker involved. Which CIA element does this best illustrate being compromised, and does a threat actor need to be involved for that to happen?",
      options: [
        "Availability, but only attacker-driven denial-of-service attacks can ever cause an availability failure like this",
        "Availability — systems became unusable, and no, a threat actor doesn't need to be involved; a software bug or hardware failure can compromise availability too",
        "Integrity — the update secretly altered stored data, and yes an attacker must always be involved for integrity to be compromised",
        "Confidentiality — since millions of machines were affected, some data must have leaked, and yes a threat actor was definitely involved",
      ],
      correctIndex: 1,
      modelAnswer:
        "A power outage that knocks out the internet does the exact same thing a hacker's flood attack would do — make the system unreachable — without anyone attacking anything.\n\n• Millions of machines became unusable, which is Availability being compromised.\n\n• No threat actor needs to be involved: a faulty update, like a hardware failure or power outage, can compromise availability all on its own.\n\n• Why the others are wrong: no data leak or secret alteration is described, and the CrowdStrike incident itself disproves the idea that only attacker-driven DoS attacks can cause an availability failure.\n\nSo the answer is: Availability, and no, a threat actor is not required — a bug alone was enough.",
    },
    {
      type: "mcq",
      prompt:
        "Week 7 distinguished COBIT Governance (board-level EDM: Evaluate, Direct, Monitor) from Management (APO, BAI, DSS, MEA). A board deciding how much financial risk the organisation will accept from a potential data breach — is that Governance or Management under COBIT, and which part of Security Management's lifecycle does it correspond to?",
      options: [
        "Management (DSS) — deciding the organisation's risk appetite is really about delivering ordinary day-to-day support services instead",
        "Management (APO) — setting risk appetite is really just an operational planning task handled entirely by IT managers, not the board",
        "Governance (EDM) — setting risk appetite is a board-level direction decision, and it corresponds most closely to Identify Risks / Plan Controls at the start of the security lifecycle",
        "Governance (EDM), but it actually corresponds to Respond & Recover, since risk appetite only ever gets decided after a breach already happens",
      ],
      correctIndex: 2,
      modelAnswer:
        "The board deciding how much risk the whole organisation is willing to accept is the same kind of decision as owners deciding how much financial risk to bet on a new stadium — that's steering the ship, not running it day to day.\n\n• Deciding risk appetite is a board-level Evaluate/Direct decision, which is Governance (EDM), not Management.\n\n• It corresponds to the start of the security lifecycle — Identify Risks and Plan Controls — since risk appetite has to be set before specific controls are planned and implemented.\n\n• Why the others are wrong: this isn't day-to-day IT planning or support delivery (Management), and it happens before a breach, not as a response to one.\n\nSo the answer is: Governance (EDM), corresponding to Identify Risks / Plan Controls.",
    },
    {
      type: "mcq",
      prompt:
        "Week 2 covered aligning IT investment with business value. A company is deciding between spending $50,000 now on a security upgrade, or doing nothing and risking a breach that would plausibly cost $2 million in recovery and fines. Which security-management reason for investing does this best illustrate?",
      options: [
        "Legal and Regulatory Compliance — because $50,000 is the exact legal minimum required by law in every jurisdiction",
        "Safeguarding Reputation and Trust — because the dollar figures given are irrelevant to reputation",
        "Managing Human Risk — because the scenario is really about training employees, not spending money on controls",
        "Cost Avoidance — spending a smaller amount on prevention is far cheaper than absorbing the financial and operational impact of a breach",
      ],
      correctIndex: 3,
      modelAnswer:
        "Paying a small amount now for a smoke detector is obviously cheaper than paying to rebuild a house after a fire it could have caught early — the same logic applies to this $50,000-versus-$2-million comparison.\n\n• Spending $50,000 to avoid a plausible $2 million breach cost is textbook Cost Avoidance: prevention costs less than the impact of a breach.\n\n• Why the others are wrong: no legal minimum figure is stated, reputation isn't the focus of the dollar comparison given, and nothing here is about employee training specifically.\n\nSo the answer is: Cost Avoidance.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false? A locked, monitored server that no one is currently trying to break into counts as carrying high security risk, purely because some vulnerability might theoretically exist somewhere in it.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "A locked, alarmed window with no burglar anywhere nearby isn't high risk just because a window is, in theory, a place someone could try to break in.\n\n• Risk = Vulnerability × Threat. Even if some theoretical weakness exists, risk only spikes when a real, motivated attacker is also present.\n\n• A secured, monitored, currently-untargeted system is low risk in practice, not high risk on a technicality.\n\nSo the answer is: false — risk needs a real threat as well as a real weakness, not just a theoretical possibility.",
    },
    {
      type: "multi",
      prompt: "Select ALL of the following cybercrime-preventive-measure pairings that are correct.",
      options: [
        "Hacking and Unauthorised Access is helped by role-based access control and mandatory MFA",
        "Malware risk is reduced by keeping systems patched and restricting unnecessary admin privileges",
        "Phishing is best prevented by permanently disabling every employee's email account",
        "Data Breaches are helped by encrypting data at rest and in transit, plus tested backups",
        "DDoS attacks are best prevented by giving every user administrator rights so they can fix problems themselves",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Real preventive measures narrow down risk without breaking normal business operations — disabling all email or handing out admin rights to everyone does the opposite.\n\n• Correct pairings: RBAC and MFA for hacking, patching and limited admin privileges for malware, and encryption plus tested backups for data breaches.\n\n• Why the other two are wrong: disabling every email account isn't a real, listed phishing measure, and giving everyone admin rights would actually increase risk, not reduce DDoS exposure.\n\nSo the answer is: the first, second and fourth pairings are correct.",
    },
    {
      type: "match",
      prompt: "Match each control action to its control type.",
      pairs: [
        { left: "Requiring a fingerprint scan to enter a data centre", right: "Physical control — a barrier protecting the tangible hardware, separate from any keycard example" },
        { left: "Writing a rule that all new software must be security-reviewed before purchase", right: "Administrative control — a written organisational rule" },
        { left: "Automatically encrypting all outgoing customer emails", right: "Technical control — a digital safeguard applied to communications specifically" },
      ],
      decoys: ["A control that exists only as a slogan on the office wall with no real enforcement"],
      modelAnswer:
        "Same three flavours as before, different examples: a fingerprint scan guarding a room, a written review rule guarding purchases, and automatic encryption guarding outgoing emails.\n\n• Fingerprint scan on a data centre: Physical control.\n\n• A software-review rule: Administrative control.\n\n• Automatic email encryption: Technical control.\n\nSo the answer is: the fingerprint scan is Physical, the review rule is Administrative, and the email encryption is Technical.",
    },
    {
      type: "order",
      prompt:
        "A developer accidentally commits a live API key to a public code repository, and it's discovered exposed several hours later. Put these four general incident-response stages back in the correct order for handling this.",
      steps: [
        "Contain the exposure by revoking the leaked API key immediately",
        "Investigate to find out how the key was exposed and what it was used for",
        "Recover by issuing a new key and restoring any affected systems to normal",
        "Review the process afterward and improve safeguards so it doesn't happen again",
      ],
      modelAnswer:
        "Same underlying logic as any security incident, applied to a leaked key instead of a network breach: stop the bleeding first, work out what happened, fix it, then make sure it can't happen the same way again.\n\n• Contain: revoke the leaked key immediately, before investigating anything else — an active leaked key is an active risk.\n\n• Investigate: find out how it was exposed and what it was used for.\n\n• Recover: issue a new key and restore normal operation.\n\n• Review: improve safeguards, such as automated scanning for committed secrets, so it doesn't happen again.\n\nSo the answer is: contain, investigate, recover, then review and improve.",
    },
  ],
};

export const WEEK_8_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
