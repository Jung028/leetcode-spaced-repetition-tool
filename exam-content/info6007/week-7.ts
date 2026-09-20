import type { ExamPaperSeed } from "../types";

// NOTE: In Week 7 the lecture and tutorial cover different topics. The Week 7
// LECTURE is Risk Management; the Week 7 TUTORIAL is Resource Management (the
// Week 6 lecture topic — the tutorial always trails the lecture by one week).
// Paper 1 (tutorial) is therefore a resource-management paper; Paper 2
// (lecture) is the risk-management paper built from the lecture deck plus the
// Standish CHAOS Report and the UK NHS NPfIT readings.

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 7,
  paperNumber: 1,
  title: "Week 7 Practice Paper — Tutorial",
  topics:
    "Resource management for a Mobile Banking App: building a Resource Breakdown Structure (RBS); reading a task-hours vs availability table to find over-allocated and under-utilised people; resource leveling vs resource smoothing and their effect on the schedule; resource acquisition options; effort vs duration; team development and motivation theory applied to a demotivated QA team (Maslow, Herzberg two-factor, McGregor Theory X/Y, Vroom expectancy, Tuckman stages); the project board workflow (Backlog to Ready to In Progress to In Review to Done) and weekly progress evaluation; continuity with Week 3 scheduling/critical-path and Week 4's project-board setup.",
  sourceFiles: ["tutorial/Tutorial sheet INFO6007 Week 07.pdf"],
  questions: [
    {
      type: "mcq",
      prompt:
        "In Part A you draw a Resource Breakdown Structure (RBS) for the Mobile Banking App. What is an RBS?",
      options: [
        "A hierarchical breakdown of the project's deliverables into ever-smaller sub-deliverables and work packages that can each be scheduled and costed",
        "A ranked list of the project's identified risks grouped by category, each one annotated with a probability score and a separate impact score",
        "A hierarchical breakdown of everything the project needs to consume, organised by resource type such as people, hardware, software licences and facilities",
        "A chart that maps each named team member to the individual tasks and deliverables they are personally responsible for completing on the project",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of packing for a long trip: before you pack you write a categorised checklist — clothes, toiletries, gadgets, documents — so nothing is forgotten.\n\n• What it is: a tree of everything the project will need, grouped by resource type such as people, hardware, software licences, facilities and materials.\n\n• Why the others are wrong: breaking deliverables into work packages is a WBS (Work Breakdown Structure); mapping people to tasks is a responsibility matrix; grouping risks by category is a Risk Breakdown Structure.\n\nSo the answer is: a categorised, hierarchical list of the resources the project needs.",
    },
    {
      type: "multi",
      prompt:
        "For the Mobile Banking App RBS in Part A, which of the following are legitimate branches of a Resource Breakdown Structure? Select all that apply.",
      options: [
        "Human resources — developers, QA testers, a business analyst, a project manager",
        "Hardware — build servers, test devices, laptops",
        "Software and licences — IDE licences, cloud subscriptions, testing tools",
        "Facilities and materials — office space, meeting rooms, network access",
        "Project deliverables — the login module, the payments module, the release build",
        "Identified risks — vendor delay, data-loss during migration, key staff leaving",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Picture the categorised shopping list for a house build: bricks, timber, tools, tradespeople, permits — every line is something you use up or hire, not a room of the finished house.\n\n• What belongs: people, hardware, software and licences, and facilities and materials are all things the project consumes or hires — they are resource types.\n\n• What does not belong: the login and payments modules are deliverables, so they live in the WBS; vendor delay and staff leaving are risks, so they live in the Risk Breakdown Structure.\n\nSo the answer is: the four resource-type branches, not the deliverables branch and not the risks branch.",
    },
    {
      type: "mcq",
      prompt:
        "Part B gives this table:\n\n• Dev 1 — 50 task hours assigned, 40 hours available\n\n• Dev 2 — 30 assigned, 40 available\n\n• QA 1 — 35 assigned, 40 available\n\n• QA 2 — 40 assigned, 40 available\n\nWhich statement about Dev 1 is correct?",
      options: [
        "Dev 1 is under-utilised — assigned 10 hours fewer than available, a load of about 80% of capacity",
        "Dev 1 is over-allocated — assigned 10 hours more than available, a load of about 125% of capacity",
        "Dev 1 is correctly leveled — the 50 hours are spread so that no single day exceeds availability",
        "Dev 1 is fully allocated — assigned exactly to capacity, a load of 100% with no spare hours",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a delivery van rated to carry 40 boxes and someone loads 50 onto it — it is 10 boxes past its limit, riding low on its springs.\n\n• The maths: 50 assigned divided by 40 available is 1.25, so Dev 1 is carrying 125% of a full load, 10 hours of overload.\n\n• Why it matters: sustained over-allocation leads to long hours, mistakes and burnout, and eventually a slipped schedule.\n\nSo the answer is: Dev 1 is over-allocated by 10 hours, roughly 125% loaded.",
    },
    {
      type: "multi",
      prompt:
        "Using the Part B table (Dev 1 50/40, Dev 2 30/40, QA 1 35/40, QA 2 40/40), which team members are under-utilised (assigned fewer hours than they are available for)? Select all that apply.",
      options: [
        "Dev 2 — 30 assigned against 40 available, about 75% loaded",
        "QA 1 — 35 assigned against 40 available, about 88% loaded",
        "Dev 1 — 50 assigned against 40 available, about 125% loaded",
        "QA 2 — 40 assigned against 40 available, exactly 100% loaded",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "Think of four workers on a 40-hour roster: two are given less than a full week's work, one is given exactly a full week, and one is given more than a full week.\n\n• Under-utilised: Dev 2 at 75% and QA 1 at 88% both have spare hours the plan is not using.\n\n• Not under-utilised: Dev 1 is over-allocated at 125%; QA 2 is exactly full at 100%.\n\nSo the answer is: Dev 2 and QA 1.",
    },
    {
      type: "mcq",
      prompt:
        "Part B asks for a resource leveling plan to balance the workload. What does resource leveling actually do?",
      options: [
        "Rewrites the estimates so each person's assigned hours equal their availability exactly, without changing any task dates or assignments",
        "Reduces the project scope by cutting the lowest-value features until the remaining work fits inside the team's current available hours",
        "Adds extra people and overtime to the most heavily loaded tasks so the existing end date is protected no matter what the resource load looks like",
        "Adjusts task start and finish dates or reassigns work so that nobody is loaded beyond their availability, accepting that the project end date may move",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a supermarket that opens a second checkout and shifts some shoppers across so no single queue is dangerously long — the shop might stay open a little later, but no lane is overwhelmed.\n\n• What it does: moves task timing or reassigns work so each person stays within their available hours.\n\n• The trade-off: because tasks may be delayed to fit capacity, the project finish date can slip.\n\n• Why the others are wrong: adding people and overtime is crashing; cutting features is descoping; just rewriting numbers fixes nothing real.\n\nSo the answer is: reschedule or reassign work to remove over-allocation, even if the end date moves.",
    },
    {
      type: "mcq",
      prompt:
        "How does resource smoothing differ from the resource leveling you apply in Part B?",
      options: [
        "Smoothing always shortens the project by overlapping tasks, whereas leveling always lengthens it by adding buffer time between tasks",
        "Smoothing removes over-allocation by hiring contractors, whereas leveling removes it by reassigning work to existing staff",
        "Smoothing only shifts tasks within their existing slack or float, so the project end date and critical path are not allowed to change",
        "Smoothing is used only for people, whereas leveling is used only for equipment, materials and other non-human resources",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of tidying a messy week: smoothing means only shuffling tasks into the gaps you already have, while leveling means you are allowed to push the whole week's end back if you must.\n\n• Smoothing: works inside existing float only, so the finish date and critical path stay fixed — it just evens out the peaks.\n\n• Leveling: may delay tasks past their float, so the end date can move.\n\nSo the answer is: smoothing keeps the end date fixed by using only slack; leveling may move the end date.",
    },
    {
      type: "mcq",
      prompt:
        "In Part B, which leveling action best fixes Dev 1's over-allocation with the least disruption?",
      options: [
        "Move about 10 hours of Dev 1's work to Dev 2, who has roughly 10 spare hours, so both end up close to full but within capacity",
        "Delay the entire project by two weeks so that Dev 1's 50 hours of work spread comfortably across the longer timeline",
        "Ask Dev 1 to work 10 hours of unpaid overtime each week for the rest of the project so the original assignments do not have to change",
        "Remove QA 2 from the project and give Dev 1's surplus testing tasks to QA 1, who still has a few spare hours",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of two removalists where one is carrying eight boxes and the other four — you hand two boxes across and now they each carry six.\n\n• Best fix: Dev 2 is only 75% loaded, so shifting roughly 10 of Dev 1's hours to Dev 2 clears the overload while barely touching the schedule.\n\n• Why the others are worse: forced overtime burns people out, a two-week slip is a big cost for a small imbalance, and pulling QA 2 off the project creates a new gap.\n\nSo the answer is: reassign about 10 hours from Dev 1 to the under-loaded Dev 2.",
    },
    {
      type: "mcq",
      prompt:
        "If Dev 1's 125% over-allocation is simply ignored for the rest of the project, which chain of consequences is most consistent with what earlier weeks taught about schedule and quality?",
      options: [
        "Dev 1 rushes and tires, defect rates rise, rework grows, and the extra rework pushes Dev 1's tasks — which may sit on the critical path — past their planned finish, delaying the project",
        "Nothing measurable changes, because assigned hours are only a planning artefact and have no bearing on real delivery dates or on the quality of the work produced",
        "The budget falls because Dev 1 is delivering 50 hours of output while only being paid for 40, so the project banks a cost saving each week",
        "The project finishes early because Dev 1 is working harder than everyone else, and the only cost is that Dev 1 accrues time off in lieu to be taken later",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of one cook told to plate 50 meals in a 40-minute service — plates go out sloppy, some come back, and the whole kitchen runs late behind that station.\n\n• The chain: overload leads to fatigue and rushing, which lifts the defect rate (a Week 5 quality point), which creates rework, which delays Dev 1's tasks — and if those are on the critical path (Week 3), the whole project slips.\n\n• Why the others are wrong: overload does not make projects finish early or under budget, and assigned-vs-available hours absolutely do affect real delivery.\n\nSo the answer is: fatigue, more defects, rework, and a schedule slip through the critical path.",
    },
    {
      type: "mcq",
      prompt:
        "Part C: a QA team is well paid and has secure jobs, but is bored, gets no recognition, and sees no path to more interesting work. Which motivation theory best explains their low motivation, and how?",
      options: [
        "Herzberg's two-factor theory — pay and job security are hygiene factors that only prevent dissatisfaction; motivation needs motivators like recognition, achievement and growth, which are missing",
        "Maslow's hierarchy — the team is stuck at the physiological level because their basic pay and safety needs have not yet been met by the organisation",
        "McGregor's Theory X — the team is naturally lazy and avoids work, so tighter supervision and stricter deadlines are what will restore their productivity",
        "Herzberg's two-factor theory — pay and recognition are both motivators, so the fix is simply to raise the QA team's salaries until motivation returns to a healthy level",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a phone with a full battery that still will not do anything interesting — charge is necessary but it is not entertainment.\n\n• The idea: Herzberg splits work factors into hygiene (pay, security, conditions) that only stop people being unhappy, and motivators (recognition, achievement, responsibility, growth) that actually drive engagement.\n\n• Applied here: the hygiene side is fine, but every motivator is missing, so the team coasts.\n\n• Why the others are wrong: pay is not a motivator in this theory; the team's basic needs are clearly met; and nothing says they are lazy.\n\nSo the answer is: Herzberg — the motivators, not the hygiene factors, are the gap.",
    },
    {
      type: "mcq",
      prompt:
        "Part C, using Maslow's hierarchy of needs: the QA team says they feel their work is invisible and unappreciated. Which need level is most directly unmet?",
      options: [
        "Physiological — the need for the basic wage required to cover food, housing and other essentials",
        "Esteem — the need for recognition, respect and a sense that one's contribution is valued by others",
        "Self-actualisation — the need to fully realise one's potential through the most challenging possible work",
        "Safety — the need for job security, stable income and protection from arbitrary dismissal",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of someone who has a warm home and a steady job but never hears a thank-you — what is missing is not shelter, it is being seen.\n\n• The match: feeling invisible and unappreciated is squarely an esteem gap — recognition and respect from others.\n\n• Why the others are wrong: safety and physiological needs are about security and pay, which the scenario says are fine; self-actualisation is the top rung, about reaching full potential, not about being noticed.\n\nSo the answer is: esteem.",
    },
    {
      type: "mcq",
      prompt:
        "Part C: the current QA lead assumes the testers will slack off unless every task is closely checked and tightly deadlined, so he micromanages them. In McGregor's terms, which assumption set is he using, and what would the opposite look like?",
      options: [
        "He is using expectancy theory; the opposite would be equity theory, focused on whether rewards feel fair compared with other teams",
        "He is using Theory Y (people are self-motivated); Theory X would give them even more freedom and remove all deadlines and check-ins entirely",
        "He is using Herzberg's hygiene factors; the opposite would be Herzberg's motivators, focused only on salary and working conditions",
        "He is using Theory X (people dislike work and must be controlled); Theory Y would assume they can be self-directed and would give them autonomy and ownership",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of two coaches: one stands over every drill sure the players will dog it, the other sets the goal and trusts the players to run at it.\n\n• Theory X: assumes people avoid work and need control, coercion and close supervision — exactly the micromanaging lead.\n\n• Theory Y: assumes people can be self-directed and seek responsibility, so you give autonomy, ownership and trust.\n\n• Why the others are wrong: expectancy and Herzberg are different theories entirely.\n\nSo the answer is: he is applying Theory X; Theory Y is the autonomy-and-trust opposite.",
    },
    {
      type: "mcq",
      prompt:
        "Part C, through the lens of Vroom's expectancy theory: the QA team believes that no matter how hard they test, management never notices and nothing changes for them. Which link in the effort-to-reward chain is broken?",
      options: [
        "Valence — how much the person actually wants the reward on offer",
        "Expectancy — the belief that trying harder will actually produce better performance",
        "Instrumentality — the belief that good performance will actually lead to a valued outcome or reward",
        "Equity — the belief that one's reward is fair compared with what colleagues receive",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a vending machine that eats your coins: you know you can press the button (effort works), you want the snack (you value it), but you have stopped believing the snack will drop.\n\n• Instrumentality: the belief that performing well leads to a reward — that is what has collapsed here, because good testing never gets noticed or rewarded.\n\n• Why the others are wrong: expectancy is effort leading to performance (not the issue), valence is wanting the reward, and equity is a separate theory.\n\nSo the answer is: instrumentality — performance is no longer believed to lead to any reward.",
    },
    {
      type: "multi",
      prompt:
        "Part C asks for strategies to lift the demotivated QA team's productivity and morale. Which of the following are sound, theory-aligned strategies? Select all that apply.",
      options: [
        "Publicly recognise good testing work and tie it to visible outcomes",
        "Give testers ownership of a test area and more say in how they work",
        "Offer a path to more varied or advanced work, such as automation or exploratory testing",
        "Set clear goals and make sure effort visibly connects to a reward",
        "Install screen-monitoring software and require hourly activity reports",
        "Cut the team's rest breaks so more hours are spent on test execution",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of reviving a wilting plant: light, room to grow and steady care work; shouting at it and moving it into a dark cupboard do not.\n\n• What works: recognition (esteem, Herzberg motivator), autonomy and ownership (Theory Y), growth opportunities (motivator), and a clear effort-reward link (expectancy) all target the real gap.\n\n• What backfires: surveillance and cutting breaks are Theory X controls that deepen resentment and lower morale further.\n\nSo the answer is: recognition, ownership, growth and a clear effort-reward link — not surveillance or fewer breaks.",
    },
    {
      type: "mcq",
      prompt:
        "The QA team has recently had two members leave and be replaced, and the group is now full of friction and arguments about how to work. In Tuckman's model of team development, which stage is this, and what should the project manager expect next if it is handled well?",
      options: [
        "Forming — polite early caution as members get to know each other; handled well it leads straight to performing with no conflict in between",
        "Adjourning — the team is winding down and disbanding, so the friction is people disengaging as the project ends",
        "Performing — the team is at peak output and the arguments are just a sign of healthy high-speed delivery that needs no intervention",
        "Storming — conflict as members contest roles and approaches; handled well it settles into norming, where agreed ways of working emerge",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a new share-house where everyone was polite for a fortnight and is now fighting over the dishes roster — that argument is a stage, not the end of the house.\n\n• Storming: members clash over roles and methods; new members restart it. Handled well, it resolves into norming, where the team agrees on how it works, then performing.\n\n• Why the others are wrong: forming is the quiet start, performing is smooth delivery, adjourning is disbanding.\n\nSo the answer is: storming, and the next stage is norming.",
    },
    {
      type: "mcq",
      prompt:
        "Part A also touches on resource acquisition. Which of the following is a genuine way to acquire project resources?",
      options: [
        "Averaging the skill levels of the whole company and assuming every task gets a person of that average skill",
        "Re-baselining the schedule so that the tasks needing scarce specialists are simply marked as complete",
        "Reclassifying a required senior developer as an assumption so the role no longer appears in the plan",
        "Negotiating with functional managers to have named specialists assigned to the project for a defined period",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of assembling a five-a-side team: you can recruit from outside, borrow a player from another team for the season, or call in someone already promised to you.\n\n• Real acquisition routes: negotiation with functional managers, hiring, contracting or outsourcing, pre-assignment of people named in the proposal, and forming virtual teams.\n\n• Why the others are wrong: marking work done, hiding a role as an assumption, or averaging skills are all ways of pretending the resource problem does not exist.\n\nSo the answer is: negotiate with functional managers to get specific people assigned.",
    },
    {
      type: "mcq",
      prompt:
        "A stakeholder says: 'Dev 1 has 50 hours of work; just add a second developer and it will be done in half the time.' Why is this reasoning unsafe?",
      options: [
        "Effort and duration are the same measurement, so 50 hours of effort is always exactly 50 hours of calendar time regardless of team size",
        "Adding a second developer is impossible because the Resource Breakdown Structure has already been baselined and cannot take new entries",
        "It is actually correct — doubling the number of people on any task always halves its duration, so the stakeholder's plan is sound",
        "Effort in person-hours does not divide cleanly into calendar duration — coordination, ramp-up and tasks that cannot be split mean two people rarely halve the time",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of nine women and one baby: adding people does not get you a baby in one month, because some work just does not split.\n\n• Effort is total person-hours; duration is calendar time. They are linked but not the same.\n\n• Adding people adds communication overhead and ramp-up time, and some tasks are indivisible, so doubling headcount rarely halves duration.\n\nSo the answer is: effort does not divide neatly into duration, so a second developer will not simply halve the time.",
    },
    {
      type: "mcq",
      prompt:
        "How does resource leveling differ in intent from crashing, a schedule-compression technique from Week 3?",
      options: [
        "Leveling and crashing are the same technique under two names — both add people to overloaded tasks so the schedule finishes sooner",
        "Leveling shortens the project by overlapping dependent tasks; crashing lengthens it by inserting buffers between every activity",
        "Leveling reschedules or reassigns work to fit within available resources and may lengthen the project; crashing adds resources to critical tasks to shorten the project",
        "Leveling applies only to the budget baseline; crashing applies only to the scope baseline, so the two never interact",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of two ways to handle a packed moving day: spread the lifting over an extra day so nobody is crushed (leveling), or pay for three more removalists to finish on time (crashing).\n\n• Leveling: respects the people you have, may push the end date out.\n\n• Crashing: throws extra resources at critical tasks to pull the end date in, usually at higher cost.\n\nSo the answer is: leveling fits work to resources and can lengthen the project; crashing adds resources to shorten it.",
    },
    {
      type: "mcq",
      prompt:
        "Part D: the tutorial says to keep the project board updated by moving tasks through a fixed set of columns. What is the correct order?",
      options: [
        "Backlog → Ready → In Progress → In Review → Done",
        "Ready → Backlog → In Review → In Progress → Done",
        "To Do → Doing → Testing → Reviewed → Archived",
        "Backlog → In Progress → Ready → Done → In Review",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a car through a workshop: it waits in the yard, gets booked in, goes up on the hoist, is checked over, then is handed back.\n\n• The flow: Backlog holds ideas, Ready holds picked-up-and-scoped tasks, In Progress is active work, In Review is being checked, Done is finished.\n\nSo the answer is: Backlog → Ready → In Progress → In Review → Done.",
    },
    {
      type: "mcq",
      prompt:
        "Part D points to the Suggested Weekly Progress document and the weekly stand-up. From Week 6 onward these feed a marked assessment. What is that assessment, per the unit's assessment overview?",
      options: [
        "The Group project — the incrementally-built written deliverable submitted in Week 13, worth 25% overall",
        "The Early Semester Feedback Task — an auto-graded multiple-choice quiz on Weeks 1 to 3, held in Week 4, worth 5% overall",
        "The final written exam — the closed-book, case-study-based hurdle task held in the formal exam period, worth 60% overall",
        "The Weekly progress evaluation — a tutor-marked, individually-scored contribution task, best 5 of 7 across Weeks 6 to 12, worth 10% overall",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a weekly fitness check-in with a trainer who signs off your card each visit — miss a few and your best sessions still count.\n\n• What it is: the Weekly progress evaluation, run in tutorials Weeks 6 to 12, marked by the tutor from the project board, scored individually, best 5 of 7, worth 10%.\n\n• Why the others are wrong: those are the Week 4 quiz, the Week 13 group report, and the final exam — different tasks with different weights.\n\nSo the answer is: the 10% Weekly progress evaluation.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are real effects of chronic resource over-allocation on an IT project? Select all that apply.",
      options: [
        "Rising defect rates as tired people rush and skip checks",
        "Staff attrition as overloaded people burn out and leave",
        "Schedule slippage when overloaded tasks on the critical path finish late",
        "Lower stakeholder confidence as commitments are repeatedly missed",
        "A lower project budget, because overloaded staff deliver unpaid extra output",
        "Faster delivery, because a heavier load always means more gets done per week",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of running an engine permanently in the red zone: it does not go faster for long, it wears out, and one day it will not start.\n\n• Real effects: more defects, people quitting, late critical tasks, and stakeholders losing trust as dates keep moving.\n\n• Not real effects: overload does not cut the budget or speed delivery — past capacity, output per hour falls, not rises.\n\nSo the answer is: more defects, attrition, schedule slip and lost confidence.",
    },
    {
      type: "multi",
      prompt:
        "Which actions are legitimate resource-leveling moves for the Part B team? Select all that apply.",
      options: [
        "Delay a non-critical task Dev 1 owns until Dev 1 has free capacity",
        "Reassign some of Dev 1's hours to Dev 2, who is only 75% loaded",
        "Split one of Dev 1's larger tasks so part of it runs later in the schedule",
        "Stagger task start dates so two heavy tasks no longer overlap for one person",
        "Delete the testing tasks entirely so the numbers balance without moving anyone",
        "Record Dev 1's availability as 50 hours so the over-allocation disappears on paper",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of easing a traffic jam: you can hold some cars back, send some down a quieter road, or split a convoy so it does not all hit the bridge at once.\n\n• Legitimate: delaying non-critical work, reassigning hours to a lighter-loaded person, splitting big tasks, and staggering overlapping tasks all genuinely reduce the peak load.\n\n• Not legitimate: deleting testing is descoping, and pretending someone is available for 50 hours is just faking the plan.\n\nSo the answer is: delay non-critical work, reassign, split tasks, and stagger overlaps.",
    },
    {
      type: "multi",
      prompt:
        "In Herzberg's two-factor theory, which of the following are hygiene factors (they prevent dissatisfaction but do not by themselves motivate)? Select all that apply.",
      options: [
        "Salary and benefits",
        "Company policy and administration",
        "Physical working conditions",
        "Job security",
        "Recognition for good work",
        "Opportunity for achievement and growth",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of the plumbing and wiring in a house: if they fail you are miserable, but perfect plumbing is not why you love living somewhere.\n\n• Hygiene factors: salary, company policy, working conditions and job security — fix them and people stop complaining, but they do not light anyone up.\n\n• Motivators (not hygiene): recognition and achievement/growth are the things that actually drive engagement.\n\nSo the answer is: salary, company policy, working conditions and job security.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are levels in Maslow's hierarchy of needs? Select all that apply.",
      options: [
        "Physiological",
        "Safety",
        "Social (belonging)",
        "Esteem",
        "Self-actualisation",
        "Instrumentality",
      ],
      correctIndices: [0, 1, 2, 3, 4],
      modelAnswer:
        "Think of climbing a ladder from the ground up: you need each rung under you before the next one is any use.\n\n• Maslow's five rungs: physiological, safety, social or belonging, esteem, then self-actualisation at the top.\n\n• The odd one out: instrumentality is a term from Vroom's expectancy theory, not a Maslow level.\n\nSo the answer is: all five listed except instrumentality.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: resource leveling can never change the project's planned end date.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Think of spreading one weekend's chores across three evenings instead — the job still gets done, but it finishes later than Sunday night.\n\n• Why it is false: leveling is allowed to delay tasks beyond their float to fit the resources available, and that can push the finish date out. It is resource smoothing that keeps the end date fixed.\n\nSo the answer is: false — leveling can move the end date.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: a team member assigned more task hours than their availability is described as over-allocated.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "Think of a suitcase rated for 20 kg with 25 kg packed into it — it is over its limit.\n\n• Why it is true: over-allocation just means assigned load exceeds available capacity, like Dev 1's 50 hours against 40 available.\n\nSo the answer is: true.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: per Herzberg, giving the bored but well-paid QA team a pay rise is a reliable way to restore their motivation.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Think of topping up a phone that already has full signal — more bars will not make the boring app fun.\n\n• Why it is false: pay is a hygiene factor. Once it is adequate, more of it stops dissatisfaction but does not create motivation — that needs recognition, achievement and growth.\n\nSo the answer is: false.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: the project board should only be updated once a week, during the stand-up meeting.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Think of a kitchen order rail during service — tickets move the moment a dish is up, not once at the end of the night.\n\n• Why it is false: tasks should move across Backlog, Ready, In Progress, In Review and Done as the work actually happens, so the board reflects reality; the stand-up just reviews it.\n\nSo the answer is: false.",
    },
    {
      type: "mcq",
      prompt:
        "[Final-exam style case study] A mobile-app project has five developers. A resource histogram shows two developers at 130% load for the middle six weeks while three sit at 60%. The project deadline has some slack on the non-critical design-polish tasks but none on the payments integration, which the two overloaded developers own. Which response is soundest?",
      options: [
        "Level by reassigning the design-polish and lower-risk tasks to the under-loaded developers and, if the overload on payments integration remains, negotiate a short deadline extension for that path",
        "Smooth the schedule using only the float on the payments integration path, since smoothing is always preferable to leveling and the end date must never move",
        "Accept the 130% load for six weeks, because a histogram is only an estimate and real developers routinely absorb a 30% overload without any effect on quality or dates",
        "Crash every task by adding contractors across the whole project, since the fastest possible finish is always the correct objective regardless of cost or onboarding time",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of two chefs slammed on the grill while three stand idle on salads — you move the salad orders around first, and only if the grill is still buried do you ask for a few more minutes on those tickets.\n\n• Best move: shift the movable, lower-risk work to the idle developers (leveling within float), then, only for the still-overloaded no-slack payments path, seek a targeted extension.\n\n• Why the others are wrong: blanket crashing is expensive and slow to onboard, ignoring a 30% overload invites defects and burnout, and there is no float on payments integration to smooth with.\n\nSo the answer is: reassign the movable work first, then negotiate a small extension only where the overload truly cannot be absorbed.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 7,
  paperNumber: 2,
  title: "Week 7 Practice Paper — Lecture",
  topics:
    "Project Risk Management: risk vs issue; positive vs negative risk and their response strategies (avoid/mitigate/transfer/accept and escalation for threats; exploit/enhance/share/accept for opportunities), including avoidance vs mitigation, transfer vs escalation and exploit vs enhance; classifying and categorising risks in a cloud-migration case; risk identification tools (brainstorming, Delphi, interviewing, SWOT) vs analysis tools; the outputs of Identify Risks; the probability-impact matrix; Monte Carlo simulation and decision-tree/EMV analysis; the NSW Digital Driver Licence worked case (EMV figures, net expected exposure, low-probability/very-high-impact risks); the risk register; residual risk; risk appetite factors and risk utility (risk-averse vs risk-neutral); risk communication tailoring and stakeholder engagement; Agile and Hybrid risk practices (risk-based backlog prioritisation, risk burn-down); links to Week 3 change control and Week 4 contingency reserves. Reading 1 (Standish CHAOS Report): challenged/impaired project factors and the California DMV case. Reading 2 (UK NHS NPfIT): the Haste / Overambitious design / Strategy and skills themes, centralised top-down failure ('connect all not replace all'), and top-management support plus user involvement.",
  sourceFiles: [
    "lecture/Lecture - INFO6007 Week 07 - Risk Management Plan.pdf",
    "lecture/Reading 1 - Standish Group Chaos Report.pdf",
    "lecture/Reading 2 - NHS UK National Programme for IT case study.pdf",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "What is the difference between a risk and an issue on an IT project?",
      options: [
        "A risk is raised by the project team; an issue can only be raised by an external stakeholder such as the client or a regulator",
        "A risk is a potential future event that has not happened yet; an issue is something that has already occurred and needs managing now",
        "A risk affects only cost and schedule; an issue affects only scope and quality, so the two never overlap in practice",
        "A risk is recorded in the risk register; an issue is the same thing recorded under a different name in the very same register",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a weather app warning of possible storms next week (risk) versus the tree that just fell on your driveway this morning (issue).\n\n• Risk: still in the future, still uncertain — you plan a response in case it happens.\n\n• Issue: it has already occurred — you deal with the consequences now.\n\nSo the answer is: a risk is a possible future event; an issue has already happened.",
    },
    {
      type: "mcq",
      prompt:
        "In the lecture's terms, what distinguishes avoidance from mitigation as responses to a threat?",
      options: [
        "Avoidance removes the threat entirely, for example by dropping the high-risk feature; mitigation only reduces the threat's probability or impact, for example by extra testing",
        "Avoidance shifts the threat to a third party such as an insurer; mitigation keeps the threat but sets aside a contingency reserve to pay for it",
        "Avoidance is used before the project starts; mitigation is exactly the same action but applied after the project has already started",
        "Avoidance reduces the threat's probability while leaving its impact untouched; mitigation reduces the impact while leaving the probability untouched",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a cliff-edge path: avoidance is taking a completely different trail so the drop is not on your route at all; mitigation is staying on the path but adding a handrail so a slip matters less.\n\n• Avoidance: eliminate the threat, often by changing scope or approach so it cannot occur.\n\n• Mitigation: the threat still exists, but you cut its probability or its impact.\n\n• The insurer answer describes transfer, not mitigation.\n\nSo the answer is: avoidance removes the threat; mitigation only shrinks it.",
    },
    {
      type: "mcq",
      prompt:
        "One of the End of Lecture Questions asks how risk escalation differs from risk transfer. What is the key difference?",
      options: [
        "Escalation is done by buying insurance; transfer is done by emailing the steering committee to make them aware of the risk",
        "Escalation moves a risk that is outside the project's scope up to program or portfolio management; transfer keeps the risk but gives a third party responsibility for its consequences",
        "Escalation and transfer are the same action, since both mean the project manager stops tracking the risk in the project's own risk register",
        "Escalation applies only to opportunities and transfer applies only to threats, so a single risk can never be a candidate for both",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a noisy neighbour: escalation is telling the building manager because it is really their problem to solve; transfer is hiring a soundproofing company to deal with it for you while it stays your problem.\n\n• Escalation: the risk is beyond the project's authority, so it goes up to program or portfolio level to own.\n\n• Transfer: the project still owns the risk but pays a third party to carry its consequences.\n\nSo the answer is: escalation hands the risk upward; transfer hands the consequences sideways to a third party.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture's example of 'assign the best resources to a task to guarantee early completion' illustrates which positive-risk strategy, and how does it differ from enhancement?",
      options: [
        "Enhancement — it increases the opportunity's impact; exploitation instead only shares the opportunity's benefit with a partner organisation",
        "Sharing — it partners with a third party to capture the benefit; exploitation instead means passively accepting the benefit if it happens to arise",
        "Exploitation — it makes the opportunity certain to happen; enhancement instead only increases the opportunity's probability or impact without guaranteeing it",
        "Acceptance — it takes advantage of the opportunity only if spare capacity exists; enhancement instead escalates the opportunity to senior management",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a race you might win: exploitation is putting your fastest runner in to make the win certain; enhancement is giving a decent runner extra training to improve the odds.\n\n• Exploitation: lock in the opportunity so it definitely occurs.\n\n• Enhancement: raise the probability or the size of the opportunity, but it is still not guaranteed.\n\nSo the answer is: exploitation guarantees the opportunity; enhancement only improves its chances.",
    },
    {
      type: "mcq",
      prompt:
        "How does the lecture describe Monte Carlo simulation?",
      options: [
        "A visual analytical tool that combines decision branches and chance branches with probabilities and payoffs attached to compute the Expected Monetary Value of each competing choice",
        "A structured method of obtaining consensus from a panel of subject-matter experts through several rounds of anonymous surveys that are summarised and re-circulated between each round",
        "A group creativity technique for generating a large number of candidate risk ideas quickly in a free-flowing, non-judgmental workshop that depends heavily on the facilitator's skill",
        "A probabilistic technique that uses random sampling across thousands of iterations with varying inputs to produce a range of possible project outcomes rather than a single estimate",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of rolling a big handful of dice thousands of times and writing down the totals — you end up with a picture of what is likely, not one lucky roll.\n\n• Monte Carlo: assign probability distributions to uncertain inputs like task durations and costs, run the model thousands of times, and read off the spread of outcomes.\n\n• The other options describe the Delphi technique, decision-tree analysis, and brainstorming.\n\nSo the answer is: repeated random sampling that yields a range of outcomes.",
    },
    {
      type: "mcq",
      prompt:
        "Decision Tree Analysis in the lecture is used to calculate which quantity, and how is the final choice made?",
      options: [
        "The risk priority number — probability times impact times detectability — and the branch with the highest number is avoided",
        "The critical path of the project — the longest chain of dependent activities — and the branch containing that path is selected",
        "The Cost Performance Index for each option — earned value divided by actual cost — and the branch with the lowest index is selected",
        "Expected Monetary Value for each decision branch — probability times payoff, summed across outcomes — and the branch with the highest EMV is selected",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of choosing between two lottery-style options by working out the average payout of each and picking the better average.\n\n• Decision tree: lay out choices and chance events, attach probabilities and payoffs, compute EMV (probability times payoff, summed) for each decision branch, then pick the highest.\n\n• The other terms belong to scheduling, earned-value management, and FMEA.\n\nSo the answer is: it computes EMV per branch and you pick the highest.",
    },
    {
      type: "mcq",
      prompt:
        "The NSW Digital Driver Licence quantitative slide totals its scenarios to a single figure. It reports a net expected exposure of A$425k. How is that number reached?",
      options: [
        "The average of the four scenario EMVs, rounded to the nearest A$25k for reporting simplicity",
        "A$545k of threat EMV plus A$120k of opportunity benefit, because opportunities and threats both add to total exposure",
        "The single largest scenario, peak-demand response at A$240k, scaled up by the number of scenarios considered",
        "A$545k of threat EMV (A$240k + A$125k + A$180k) minus A$120k of opportunity benefit from the trial-insight saving",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a budget where three bills add up against you and one refund comes back — you net the refund off the bills.\n\n• The threats: A$240k + A$125k + A$180k = A$545k.\n\n• The opportunity: the trial-insight saving is worth −A$120k (it reduces exposure).\n\n• Net: 545 − 120 = A$425k.\n\nSo the answer is: threat EMV of A$545k minus the A$120k opportunity benefit.",
    },
    {
      type: "mcq",
      prompt:
        "In the NSW Digital Driver Licence qualitative table, R3 'Privacy or security issue' is rated Low probability but Very high impact, and still comes out as HIGH priority. What does this show about the probability-impact matrix?",
      options: [
        "Low-probability risks are always downgraded to LOW priority, so R3's HIGH rating must be an error in the deck",
        "Probability and impact are added together, so Low plus Very high averages out to a Medium overall priority",
        "A severe enough impact can push a risk into a high priority band even when its probability is low — impact is not outranked by probability",
        "The matrix always rounds any risk with a 'Very high' impact up to EXTREME regardless of its probability rating",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a shark attack: very unlikely on any given swim, but the consequences are so severe that beaches still close on a sighting.\n\n• The lesson: the matrix multiplies severity into the priority, so a rare event with catastrophic impact still lands high.\n\n• Why the others are wrong: Very high does not auto-promote to EXTREME, low probability is not auto-demoted, and the axes are not simply summed.\n\nSo the answer is: a big enough impact can drive a high priority even at low probability.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture says the Identify Risks process produces two things. What are they?",
      options: [
        "An initial Risk Register and a Risk Breakdown Structure (a hierarchical representation of risk categories)",
        "A completed probability-impact matrix and a set of assigned contingency reserves",
        "A Monte Carlo distribution of finish dates and a decision tree of response options",
        "A stakeholder register and a communications management plan for reporting risks",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a first walk-through of a rental property: you come away with a written list of every fault (the register) and a sense of which faults are plumbing, which are electrical, which are structural (the breakdown structure).\n\n• Identify Risks outputs: the initial Risk Register and a Risk Breakdown Structure that organises risk sources by category.\n\nSo the answer is: an initial Risk Register and a Risk Breakdown Structure.",
    },
    {
      type: "mcq",
      prompt:
        "How does the Delphi technique for risk identification differ from ordinary group brainstorming?",
      options: [
        "Delphi requires no subject-matter experts at all, relying instead on a random sample of ordinary project team members",
        "Delphi only identifies opportunities, whereas brainstorming only identifies threats, so projects run both to get full coverage",
        "Delphi collects input from experts anonymously across several survey rounds to reach consensus, which avoids letting dominant personalities sway the group",
        "Delphi is faster than brainstorming because it happens in a single facilitated meeting with everyone in the room at once",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a silent written vote passed around several times versus a loud open-floor shout-out where the confident person wins.\n\n• Delphi: anonymous, multi-round expert surveys converging on consensus, so the loudest voice does not dominate.\n\n• The trade-off the deck notes: it is slow and depends on having true experts available.\n\nSo the answer is: anonymous multi-round expert consensus that neutralises dominant personalities.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture uses the term 'residual risk.' What does it mean?",
      options: [
        "A brand-new risk created as a direct side effect of implementing a response to another risk",
        "The single highest-priority risk on the register at any given point in the project",
        "The risk that remains after a response has been applied — the leftover exposure you have chosen to live with",
        "A risk that was identified but later removed from the register because it turned out to be impossible",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of putting sunscreen on before the beach: it cuts the burn risk a lot, but the bit of exposure still left is what you are accepting.\n\n• Residual risk: what is left over once your response has done its job.\n\n• A new risk caused by the response itself is a secondary risk — different thing.\n\nSo the answer is: the exposure that remains after the response.",
    },
    {
      type: "mcq",
      prompt:
        "On a risk utility function graph, a risk-averse stakeholder is offered a certain A$100k or a 50/50 gamble on A$0 or A$250k (expected value A$125k). What does risk aversion predict, and why?",
      options: [
        "They are indifferent between the two, because risk aversion means deciding purely on expected monetary value",
        "They take the gamble only if the project's contingency reserve can cover the A$0 outcome",
        "They take the certain A$100k, because each extra dollar adds less utility than the last, so the gamble's downside hurts more than its upside helps",
        "They take the gamble, because a risk-averse stakeholder always chooses the option with the higher expected monetary value",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of someone who would rather keep a guaranteed birthday gift than swap it for a mystery box that might be amazing or might be socks.\n\n• Risk-averse utility curves bend over: more money still helps, but each extra dollar helps less, so a possible zero outcome stings more than the chance of A$250k pleases.\n\n• Deciding purely on expected value is the risk-neutral stance, not risk-averse.\n\nSo the answer is: they take the certain A$100k because their utility of money flattens as it grows.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture's Agile risk practice of 'risk-based backlog prioritisation' means what?",
      options: [
        "Letting the project sponsor personally rank every backlog item by business value, ignoring technical risk entirely",
        "Sorting the product backlog so the cheapest and easiest stories are always delivered first to build early momentum",
        "Delivering the user stories with the highest uncertainty or risk earliest, so problems surface while there is still time to react ('fail fast')",
        "Removing any story from the backlog that carries risk, so only fully understood work is ever scheduled into a sprint",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of testing the dodgiest bit of a second-hand car first — you want to find the engine problem on day one, not after you have fixed the paint.\n\n• Risk-based prioritisation: schedule the riskiest, least-understood stories early so failures happen when they are still cheap to handle.\n\nSo the answer is: do the riskiest stories first to fail fast.",
    },
    {
      type: "mcq",
      prompt:
        "In Reading 1, the California DMV project scored only 10 of 100 on the 'success potential' chart and was cancelled after $45 million. Which combination of causes does the report give?",
      options: [
        "Executive managers acting as active project managers, an incomplete statement of requirements, and constant requirement changes",
        "A clear vision and strong ownership undermined only by the adoption of unproven new technology late in delivery",
        "A frozen design that could not accommodate business change, plus a contractor with too little flexibility to alter specifications",
        "No executive management support, no user involvement, poor planning, unclear objectives, and internal state politics",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a group project with no teacher backing it, nobody who will actually use it in the room, a vague brief, and two members feuding — it was never going to finish.\n\n• DMV's causes per the report: no exec support, no user involvement, poor planning, unclear objectives, and state politics.\n\n• The 'executive managers as active project managers' description is the American Airlines CONFIRM project, not DMV.\n\nSo the answer is: no exec support, no user involvement, poor planning, unclear objectives, politics.",
    },
    {
      type: "mcq",
      prompt:
        "Reading 2 says the UK government's 2011 press release underlined a specific structural fault in the NPfIT, and the Department of Health then called for a different model. What was the fault, and the replacement?",
      options: [
        "A centralised authority making top-down decisions for local organisations; replaced by a 'connect all' rather than 'replace all' model of local, modular, incremental change",
        "Over-reliance on unsupported open-source components; replaced by fully proprietary regional systems backed by long-term fixed-price vendor warranties and managed support contracts",
        "Insufficient central budget allocated for staff training; replaced by a doubled national training budget while the same unwieldy centralised architecture was deliberately retained throughout",
        "Excessive local autonomy with no shared central standards at all; replaced by one mandatory national system procured from a single prime supplier and rolled out identically to every region",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of head office redesigning every branch's layout by decree, versus letting each branch improve its own layout while agreeing to keep the doorways lined up.\n\n• The fault: a central authority imposing top-down decisions on local NHS organisations.\n\n• The replacement: 'connect all' not 'replace all' — local decision-making, modular systems, smaller incremental change.\n\nSo the answer is: top-down centralism, replaced by 'connect all not replace all'.",
    },
    {
      type: "mcq",
      prompt:
        "Reading 2 says only two factors are 'constantly associated with successful IT implementation.' What are they, and how does this line up with the lecture's NPfIT slide?",
      options: [
        "Formal change control and a signed scope statement — matching the lecture slide's point that requirements kept changing throughout",
        "Top management support and user involvement — matching the lecture slide's point that frontline clinicians were left out of risk communication and engagement",
        "A large contingency reserve and a detailed Gantt chart — matching the lecture slide's point that the budget was too small from the start",
        "A fixed-price contract and a single prime vendor — matching the lecture slide's point that multiple vendors caused integration failures",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of any big workplace system that actually stuck: the boss genuinely backed it and the people who use it daily had a real say.\n\n• The reading's two constants: top-management support and user involvement.\n\n• The lecture slide's NPfIT lesson is the mirror image: senior leaders talked among themselves while clinicians, nurses and admin staff were shut out of both risk communication and engagement.\n\nSo the answer is: top-management support and user involvement, matching the 'frontline staff were left out' point.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture's NPfIT slide lists 'tailor risk communication' as a key lesson. What does tailoring mean here?",
      options: [
        "Each region writes its own risk register in its own format, so no two parts of the programme share a common risk picture",
        "Senior leaders get concise summaries, technical teams get detailed risk logs, and end users get practical guidance — the same risks, pitched to each audience",
        "Only risks above the Extreme threshold are communicated at all, and everything below that is kept off every report to reduce noise",
        "Risk updates are sent out on a fixed monthly schedule regardless of whether anything about the risks has actually changed",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of explaining the same house problem three ways: to the bank ('structural issue, quote attached'), to the builder ('joist rotted at the north end'), to your family ('do not stand on that bit of floor').\n\n• Tailoring: same underlying risks, but the format and detail match what each audience needs to act.\n\nSo the answer is: match the level of detail to the audience — summaries for leaders, logs for technical teams, guidance for users.",
    },
    {
      type: "mcq",
      prompt:
        "A threat response of 'change the project scope to exclude the high-risk functionality' is given in the lecture as an example of avoidance. Which earlier-week process must the project manager run to make that change properly?",
      options: [
        "The Week 6 resource-leveling process, since removing a feature only ever changes who is assigned to the remaining work",
        "The Week 3 formal Change Control Process, checking the reduced scope against the Scope Statement before rebaselining schedule and cost",
        "The Week 5 Control Quality process, running the full planned test suite one last time against the feature being removed",
        "The Week 4 Earned Value Management calculation, recomputing CPI and SPI before the feature can be removed from the plan",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of cancelling a room from a house build: you do not just stop building it, you file the variation, re-price the job and redraw the plans.\n\n• Avoidance by descoping is still a scope change, so it goes through Week 3's formal Change Control Process and is checked against the Scope Statement, then schedule and cost are rebaselined.\n\n• EVM, Control Quality and leveling are not how you authorise a scope change.\n\nSo the answer is: run it through the formal Change Control Process from Week 3.",
    },
    {
      type: "mcq",
      prompt:
        "Quantitative risk analysis produces figures like the NSW project's A$425k net expected exposure. Which Week 4 cost concept is this figure most directly used to justify?",
      options: [
        "The management reserve outside the cost baseline, set aside for genuinely unknown risks that have not been identified",
        "The size of the contingency reserve inside the cost baseline, set aside for identified risks that may partly be planned for",
        "The sunk cost already spent before the project's budget was approved, which is excluded from go-forward decisions",
        "The indirect cost overhead, such as general administration and facilities, that is not tied to specific deliverables",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of looking at your history of surprise car repairs and deciding how much to keep in a dedicated 'car problems' envelope.\n\n• Quantitative risk analysis sizes the exposure from identified risks, and that is exactly what the contingency reserve inside the cost baseline is meant to cover.\n\n• Management reserve is for unknown-unknowns; sunk and indirect costs are unrelated.\n\nSo the answer is: it justifies the contingency reserve within the cost baseline.",
    },
    {
      type: "mcq",
      prompt:
        "[Final-exam style case study] A financial-services firm is migrating legacy systems to the cloud with multiple vendors and strict data-protection compliance. It has logged: (a) Vendor A may deliver migration tooling late; (b) a new data-storage regulation may take effect mid-project; (c) 25% chance of data loss during migration, cost A$200k; (d) a key senior developer may resign; (e) adopting AI monitoring could cut post-migration costs. Which analysis is correct?",
      options: [
        "(a)(b)(c)(d) are threats and (e) is an opportunity; (c) has an EMV of A$50k; (d) is a People risk best handled by cross-training and documentation now, not after the resignation",
        "All five are threats; (c) has an EMV of A$200k; (d) is a Financial risk and the only valid response is to raise the developer's salary immediately",
        "(b)(e) are threats and (a)(c)(d) are opportunities; (c) has an EMV of A$150k; (d) is a Market risk to be escalated to the portfolio board",
        "(a)(c) are threats and (b)(d)(e) are opportunities; (c) has an EMV of A$25k; (d) is a Technology risk to be accepted with no action",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a road trip with four things that could go wrong (late hire car, new toll rule, possible breakdown, driver might quit) and one that could go right (a new bypass opens).\n\n• Classification: late tooling, new regulation, possible data loss and a possible resignation all hurt objectives (threats); AI monitoring helps (opportunity).\n\n• EMV of the data loss: 0.25 × 200,000 = A$50,000.\n\n• The resignation is a People risk — mitigate now with cross-training, documentation and knowledge transfer so a departure does not stall the project; a pay rise alone is not the only lever and does nothing if they leave anyway.\n\nSo the answer is: four threats and one opportunity, EMV A$50k, and cross-train the developer's knowledge now.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are strategies the lecture lists for responding to NEGATIVE risks (threats)? Select all that apply.",
      options: [
        "Avoid",
        "Mitigate",
        "Transfer",
        "Accept",
        "Exploit",
        "Enhance",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of dealing with a pothole: dodge it, slow for it, make the council fix it, or just bump over it.\n\n• Threat strategies: avoid, mitigate, transfer, accept (with escalate as a fifth for out-of-scope risks).\n\n• Exploit and enhance are for opportunities, not threats.\n\nSo the answer is: avoid, mitigate, transfer, accept.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are risk IDENTIFICATION tools and techniques in the lecture (as opposed to analysis techniques)? Select all that apply.",
      options: [
        "Brainstorming",
        "The Delphi technique",
        "Interviewing",
        "SWOT analysis",
        "Monte Carlo simulation",
        "Decision tree analysis",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of finding the leaks in a house first, and only later measuring how much water each one lets in.\n\n• Identification: brainstorming, Delphi, interviewing and SWOT all help surface what the risks are.\n\n• Monte Carlo and decision trees are quantitative analysis — they measure risks you have already found.\n\nSo the answer is: brainstorming, Delphi, interviewing, SWOT.",
    },
    {
      type: "multi",
      prompt:
        "Which items would you expect to find recorded against a risk in a well-maintained risk register? Select all that apply.",
      options: [
        "A description of the risk and its category",
        "A probability rating and an impact rating",
        "The named risk owner",
        "The planned response and its trigger",
        "The residual risk after the response",
        "Each team member's hourly pay rate",
      ],
      correctIndices: [0, 1, 2, 3, 4],
      modelAnswer:
        "Think of a maintenance logbook entry: what the fault is, how bad and how likely, who is on it, the plan, and what is still left after the fix.\n\n• In the register: description and category, probability and impact, owner, planned response and trigger, and residual risk.\n\n• Pay rates live in resource or cost documents, not the risk register.\n\nSo the answer is: everything except the hourly pay rates.",
    },
    {
      type: "multi",
      prompt:
        "Reading 1 (CHAOS) lists factors behind challenged and impaired projects. Which of the following appear on those lists? Select all that apply.",
      options: [
        "Incomplete requirements and specifications",
        "Changing requirements and specifications",
        "Lack of user involvement or user input",
        "Lack of resources",
        "Lack of executive support",
        "Excessive automated testing slowing delivery",
      ],
      correctIndices: [0, 1, 2, 3, 4],
      modelAnswer:
        "Think of the usual suspects when a group project falls apart: nobody nailed down what was wanted, the brief kept moving, the users never showed, there were not enough hands, and no teacher backed it.\n\n• On the CHAOS lists: incomplete requirements, changing requirements, lack of user involvement, lack of resources, lack of executive support.\n\n• 'Too much testing' is not a CHAOS failure factor.\n\nSo the answer is: all except the excessive-testing option.",
    },
    {
      type: "multi",
      prompt:
        "Reading 2 and the lecture slide together attribute the NPfIT's failure to which factors? Select all that apply.",
      options: [
        "Haste and unrealistic timetables with too little stakeholder consultation",
        "An overambitious, unwieldy centralised design",
        "Weak project management with no clear direction and no exit strategy",
        "Frontline clinicians and end users not engaged early in the work",
        "The absence of a phased change-management approach",
        "A deliberately small budget that starved the programme from day one",
      ],
      correctIndices: [0, 1, 2, 3, 4],
      modelAnswer:
        "Think of a national building scheme rushed out, drawn far too grand, run without a plan, ignoring the people who would live in it, with no staged rollout.\n\n• Attributed causes: haste, overambitious centralised design, weak project management with no exit strategy, no early clinician or user engagement, and no phased change management.\n\n• Budget was not the problem — the programme spent billions; it was scale, governance and engagement.\n\nSo the answer is: all except the 'deliberately small budget' option.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are Agile or Hybrid risk-management practices the lecture describes? Select all that apply.",
      options: [
        "Iterative risk reviews at each sprint retrospective",
        "Risk-based backlog prioritisation, delivering the riskiest stories first",
        "Risk burn-down charts tracking exposure over time",
        "Collaborative ownership of risks across the whole team",
        "A single risk manager who owns the register and shields the team from risk work",
        "Freezing the risk register at project initiation and not revisiting it",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of a team that checks its own dashboard together every lap instead of leaving one person to watch the gauges.\n\n• Agile and Hybrid practices: iterative reviews each sprint, risk-based backlog ordering, risk burn-down charts, and shared team ownership.\n\n• A lone risk manager and a frozen up-front register are the Traditional pattern being contrasted against.\n\nSo the answer is: the first four.",
    },
    {
      type: "multi",
      prompt:
        "In the NSW Digital Driver Licence quantitative analysis, EMV is calculated as probability times impact. Which of the following EMV figures match the deck? Select all that apply.",
      options: [
        "Peak-demand response: 30% of A$800k = A$240k",
        "Integration rework: 25% of A$500k = A$125k",
        "Rollout delay: 15% of A$1.2m = A$180k",
        "Trial insight reduces support: 40% of A$300k saving = −A$120k",
        "Peak-demand response: 30% of A$800k = A$400k",
        "Rollout delay: 15% of A$1.2m = A$120k",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of working out the average cost of four maybe-events by multiplying each price tag by how often it lands.\n\n• Correct: 0.30 × 800k = 240k; 0.25 × 500k = 125k; 0.15 × 1.2m = 180k; 0.40 × 300k saving = −120k.\n\n• The last two options miscalculate (400k and 120k) and do not match the deck.\n\nSo the answer is: the first four.",
    },
    {
      type: "multi",
      prompt:
        "Which factors does the lecture say influence an organisation's risk appetite? Select all that apply.",
      options: [
        "Industry context, such as a tech startup versus a government agency",
        "Financial health, such as the size of the organisation's reserves",
        "Leadership mindset, such as risk-taking versus conservative decision-making",
        "Stakeholder expectations, such as shareholders demanding high growth",
        "The alphabetical order of the project's name",
        "The number of columns on the project's Kanban board",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Think of how boldly a household invests: depends on the industry they work in, how much savings they have, how adventurous they are, and what the family is pushing for.\n\n• Real factors: industry context, financial health, leadership mindset, stakeholder expectations.\n\n• The other two options are nonsense distractors.\n\nSo the answer is: the first four.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: qualitative risk analysis produces a numerical probability distribution of the project's total cost.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Think of a quick 'looks bad / looks minor' sort at triage versus the MRI that puts numbers on the injury.\n\n• Why it is false: qualitative analysis is a subjective High/Medium/Low prioritisation. Producing a numerical distribution of total cost is quantitative analysis, using tools like Monte Carlo simulation.\n\nSo the answer is: false.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: the deck's End of Lecture Questions treat 'escalation' as one of the four main strategies for responding to negative risks.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Think of a list of four home fixes — dodge it, soften it, insure it, live with it — with 'call the council' noted separately as a fifth, different kind of move.\n\n• Why it is false: the four main threat responses are avoid, mitigate, transfer and accept. Escalation is listed as a separate response used when the risk is outside the project's scope.\n\nSo the answer is: false.",
    },
  ],
};

export const WEEK_7_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
