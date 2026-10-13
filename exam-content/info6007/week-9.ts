import type { ExamPaperSeed } from "../types";

// NOTE: Two differently-named "Week 09" tutorial PDFs exist in the course
// folder. "Tutorial sheet - INFO6007 Week 09.pdf" (CityCare booking-system
// procurement case, file created 2026-10-08) is the authoritative, current
// handout: it is the most recent of the two and it continues the
// established pattern from Weeks 7-8 where the tutorial applies the
// PREVIOUS week's lecture topic (Week 8's lecture was Procurement
// Management) to a fresh scenario. "Tutorial sheet INFO6007 Week 09.pdf"
// (HealthPlus Insurance cloud-migration case, file created 2026-09-16) is an
// older artifact that matches the CURRENT week's lecture topic instead
// (Leadership/Governance/Alignment) and breaks that trailing pattern, so it
// was treated as superseded and not used as a source here.

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 9,
  paperNumber: 1,
  title: "Week 9 Practice Paper — Tutorial",
  topics:
    "Procurement management applied fresh to a CityCare online booking system case (continuing Week 8's lecture topic, one week behind as usual): make-or-buy analysis across cost/time/expertise/control/risk; choosing RFP vs RFQ for a custom service versus a standard product; Statement of Work essentials (scope, deadline, measurable acceptance criteria); contract type selection (fixed-price/cost-reimbursable/time-and-materials) and risk allocation; a worked weighted vendor-scoring calculation across three vendors; why mandatory requirements are checked before weighted scoring; controlling procurement when a vendor is late and a deliverable fails testing, milestone-payment conditions, change control for an out-of-scope feature request, and supplier performance measures; the project board workflow.",
  sourceFiles: ["tutorial/Tutorial sheet - INFO6007 Week 09.pdf"],
  readings: [
    {
      beforeQuestion: 0,
      title: "CityCare: A New Booking System",
      body: "CityCare runs five medical clinics in Sydney and wants an online appointment booking system within four months, on a $180,000 budget. The system must let patients book, get reminders and view appointments, and must connect to CityCare's existing patient management system.\n\nCityCare has two internal developers who know the existing systems well but have limited cloud-deployment and cybersecurity-testing experience, and who must keep supporting daily clinic operations at the same time.\n\nThe project needs: development and integration of the booking system, cloud hosting and deployment, independent cybersecurity testing, and twenty standard tablets for reception staff.\n\nCityCare wants to keep control over patient data and avoid becoming too dependent on any single vendor.",
    },
    {
      beforeQuestion: 6,
      title: "RFP versus RFQ, recap",
      body: "An RFQ (Request for Quotation) asks suppliers for a price on something clearly defined and standard — fast, decided mostly on cost. An RFP (Request for Proposal) invites vendors to propose their own solution for a complex or unclear need, decided on quality, approach and price together.\n\nCityCare's twenty tablets are a standard, off-the-shelf product with a fixed specification. The booking system's development, integration and cloud-deployment approach is not something CityCare can fully specify in advance — it needs vendors to propose how they would build, integrate and secure it.",
    },
    {
      beforeQuestion: 11,
      title: "Statement of Work essentials",
      body: "A Statement of Work (SOW) is the document that pins down exactly what an outsourced service must deliver, so both sides can check later whether it actually happened. For any one outsourced service on this project, a complete SOW needs three things: the scope and key deliverables (what's actually being built or provided), a delivery deadline tied to CityCare's four-month project timeline, and at least two measurable acceptance criteria — specific, checkable conditions, not vague statements like 'it should work well'.",
    },
    {
      beforeQuestion: 15,
      title: "Contract types, recap",
      body: "Fixed-Price: one agreed total; the seller absorbs the risk if costs run over, so the buyer's own cost stays locked in. Cost-Reimbursable: the buyer repays the seller's actual costs plus a fee, so the buyer absorbs the risk if the job runs over budget. Time and Materials: a hybrid paid by hours and materials used, medium risk on both sides.\n\nCityCare has a fixed $180,000 budget and a firm four-month deadline, and the cloud-hosting and cybersecurity-testing services can be scoped clearly upfront.",
    },
    {
      beforeQuestion: 19,
      title: "Weighted vendor scoring",
      body: "Three vendors propose on the same agreed scope for the booking system's development. All three already pass CityCare's mandatory security and data-handling checks. Scores run 1 (poor) to 5 (excellent); for Cost, a higher score means better value.\n\nTechnical capability (weight 30%): Vendor A = 4, Vendor B = 5, Vendor C = 3.\n\nRelevant healthcare experience (weight 25%): Vendor A = 3, Vendor B = 5, Vendor C = 3.\n\nAbility to meet the deadline (weight 25%): Vendor A = 4, Vendor B = 3, Vendor C = 5.\n\nCost (weight 20%): Vendor A = 5, Vendor B = 2, Vendor C = 4.\n\nTotal score = the sum, across all four criteria, of each criterion score multiplied by its weight as a decimal.",
    },
    {
      beforeQuestion: 27,
      title: "Controlling procurement: a delay and a scope request",
      body: "Six weeks after the contract is awarded, the selected vendor reports a two-week delay. A demonstration reveals that appointment reminders sometimes fail to send. The vendor asks for the next milestone payment, even though the contract makes payment conditional on successful testing and formal acceptance.\n\nAt the same time, CityCare asks for a new multilingual feature that was never part of the agreed scope.",
    },
    {
      beforeQuestion: 32,
      title: "Wrapping up: tracking and acceptance",
      body: "CityCare keeps final acceptance of the delivered booking system as an internal decision, even though development itself is outsourced — the vendor builds it, but CityCare's own team is the one that signs off that it actually meets requirements. Work on the project is tracked on a shared project board, with tasks moved through five stages as they progress: Backlog, Ready, In Progress, In Review, Done.",
    },
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "CityCare's two internal developers already understand the existing patient management system's data and workflows. Which argument most strongly supports keeping the booking system's integration with that existing system in-house, rather than outsourcing it?",
      options: [
        "The developers already have the expertise and context an external vendor would need weeks to acquire, so in-house integration is both faster and lower-risk here",
        "In-house work is always cheaper than outsourced work, regardless of the skills involved, because internal staff salaries are treated as a sunk cost with no extra billing",
        "Outsourcing integration work is never allowed under standard procurement rules, since any system touching patient data must by policy stay under direct internal control",
        "Internal teams are always faster than external vendors at any task, regardless of familiarity, because external vendors must first complete a lengthy onboarding process",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of asking the person who already lives in the house to fix a quirky door, instead of hiring a stranger who's never seen the place — the resident already knows exactly how that door behaves.\n\n• The real reason: the internal developers' existing knowledge of the patient management system's data and workflows is expertise a new vendor would have to build from scratch, costing time CityCare doesn't have.\n\n• Why the others are wrong: in-house isn't automatically cheaper or faster in general, and outsourcing integration work is a perfectly normal procurement choice — it's the specific expertise gap that matters here.\n\nSo the answer is: the developers' existing system knowledge makes in-house integration faster and lower-risk.",
    },
    {
      type: "mcq",
      prompt:
        "CityCare's project explicitly requires 'independent cybersecurity testing.' Why does the word 'independent' push this piece toward outsourcing even if the internal developers had time to attempt it themselves?",
      options: [
        "Independent testing must come from a party separate from whoever built the system, so the people who wrote the code checking their own work would defeat the purpose",
        "Independent testing is always the cheapest procurement option available to any project",
        "Independent testing is a step that can be skipped once a project is already behind schedule",
        "Independent testing only matters for projects with budgets above $500,000",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a student marking their own exam versus a separate teacher marking it — even an honest student is more likely to miss their own mistakes than someone checking with fresh eyes.\n\n• The real reason: 'independent' specifically means the check has to come from outside the team that built the system, so an objective, unbiased review actually happens.\n\n• Why the others are wrong: this isn't about cost, it isn't something a tight schedule justifies skipping, and it has nothing to do with the size of the budget.\n\nSo the answer is: independence requires a separate party, which the system's own builders can't provide for themselves.",
    },
    {
      type: "mcq",
      prompt:
        "The two internal developers have limited cloud-deployment experience. What is the main risk if CityCare has them handle cloud hosting and deployment themselves rather than outsourcing it?",
      options: [
        "There is no real risk, since cloud deployment is identical in difficulty to any other development task",
        "The only risk is a slightly higher invoice total, with no effect on the schedule",
        "A steep learning curve could eat into the four-month deadline and risk a poorly configured, less secure hosting setup",
        "The developers would be legally barred from working on any other part of the project afterward",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of asking someone who has never driven a stick-shift car to learn on the way to an important interview — they might get there, but they're far more likely to stall, and they'll have less attention left for driving safely.\n\n• The real risk: learning cloud deployment from scratch under a firm four-month deadline risks running out of time, and a first attempt at something unfamiliar is more likely to be misconfigured or less secure.\n\n• Why the others are wrong: this is a genuine time-and-quality risk, not just a cost difference, and it has no bearing on the developers' ability to work on other tasks.\n\nSo the answer is: a steep learning curve risks blowing the deadline and producing a weaker, misconfigured hosting setup.",
    },
    {
      type: "multi",
      prompt:
        "Based on CityCare's situation, which of the following components should be classified as 'Buy/Outsource' rather than 'Make internally'? Select all that apply.",
      options: [
        "Cloud hosting and deployment",
        "Independent cybersecurity testing",
        "The twenty standard tablets for reception staff",
        "Integration with the existing patient management system",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of sorting a renovation job: hire an electrician for the wiring you've never touched, buy the standard light fittings off the shelf, but handle the room you already know inside out yourself.\n\n• Buy/Outsource: cloud hosting and cybersecurity testing need skills the internal team lacks, and the tablets are a standard off-the-shelf product — none of these need CityCare's own system knowledge.\n\n• Make internally: the integration work directly depends on the internal developers' existing knowledge of CityCare's own patient management system, which is exactly the expertise they already have.\n\nSo the answer is: cloud hosting, cybersecurity testing and the tablets are outsourced; integration stays internal.",
    },
    {
      type: "mcq",
      prompt:
        "CityCare 'wants to retain control over patient data and avoid becoming overly dependent on a single vendor.' Which procurement approach best reflects that concern?",
      options: [
        "Outsourcing every component, including data integration and final data-handling decisions, to whichever single vendor offers the lowest overall price across the entire project",
        "Building every component internally regardless of the significant cloud-deployment and cybersecurity-testing expertise gaps this would create for the two developers",
        "Keeping integration and final data-handling oversight internal while outsourcing cloud hosting and testing to separate vendors, rather than handing the whole booking system to one external company",
        "Outsourcing only the twenty standard tablets while leaving every other component of the booking system project entirely undecided and unplanned",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of hiring a separate plumber and a separate electrician for your house instead of giving one contractor the keys to redo the entire building — you stay in control of the parts that matter most to you and aren't stuck relying on just one outside company.\n\n• The fit: keeping integration and final oversight of patient data internal, while spreading cloud hosting and testing across separate vendors, keeps control where CityCare wants it and avoids single-vendor dependence.\n\n• Why the others are wrong: handing the whole system to one vendor is exactly the dependence CityCare wants to avoid, building everything internally ignores real skill and time gaps, and outsourcing only the tablets ignores the data-control concern entirely.\n\nSo the answer is: keep integration and data oversight internal, and split the outsourced work across separate vendors.",
    },
    {
      type: "mcq",
      prompt:
        "Of the six make-or-buy factors (cost, time, expertise, quality, control/confidentiality, strategic importance), which pair is most directly behind CityCare's decision to outsource cloud hosting and cybersecurity testing rather than build that capability in-house within four months?",
      options: [
        "Strategic importance and quality alone, with no bearing at all from the project's four-month deadline or the developers' current skill level",
        "Cost alone, since outsourcing is simply assumed to always be cheaper than in-house work regardless of the skill level actually involved",
        "Control and confidentiality alone, since these two hosting and testing services don't touch patient data directly in any meaningful way",
        "Expertise and time — the developers lack cloud and cybersecurity skills, and there isn't time to build them before the deadline",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of needing a specialist surgery done next week — you don't spend that week training a general doctor to become a surgeon from scratch, you book the specialist who already has the skill.\n\n• The real driver: the internal developers simply don't have cloud or cybersecurity expertise yet, and there isn't enough runway before the four-month deadline to build it from zero.\n\n• Why the others are wrong: cost isn't assumed to always favour outsourcing, and this isn't really about confidentiality — it's a straightforward skills-and-time gap.\n\nSo the answer is: expertise and time are the main factors driving this outsourcing decision.",
    },
    {
      type: "mcq",
      prompt:
        "Which type of procurement document should CityCare use for the booking system development service, and why?",
      options: [
        "An RFQ, because the development work is treated as a simple, standard item with one obvious, easily comparable price across vendors",
        "Neither an RFP nor an RFQ, since development services can't legally be procured from an external vendor under standard procurement rules",
        "An RFP, because the work is complex and custom, and vendors need to propose their own approach to integration, hosting and security rather than just quote a price",
        "An RFQ, because price is treated as the only factor that should ever matter when comparing vendors for software development work",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of asking several architects to pitch their own design ideas for a custom house, rather than just asking a builder for a price to lay a standard driveway — one needs creative proposals, the other just needs a number.\n\n• The fit: the booking system is a complex, custom build, so CityCare needs vendors to propose how they'd handle integration, hosting and security — that's exactly what an RFP is for.\n\n• Why the others are wrong: this isn't a standard, pre-defined item suited to a price-only RFQ, and nothing here makes outsourcing development illegal or makes price the only consideration.\n\nSo the answer is: an RFP, because it's complex, custom work needing a proposed approach, not just a price.",
    },
    {
      type: "mcq",
      prompt:
        "Which type of procurement document should CityCare use for the twenty standard tablets, and why?",
      options: [
        "An RFP, because tablets are too complex a product to describe without vendor proposals",
        "An RFQ, because the tablets are a standard, well-defined product, so a price-focused request is enough",
        "Neither, since standard hardware purchases don't require any procurement document",
        "An RFP, because CityCare needs each vendor's creative vision for how tablets should be used",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of ordering the exact same model of chair from three office-supply stores — you don't need each store to pitch a design, you just need their best price for the same thing.\n\n• The fit: twenty standard tablets are a clearly defined, off-the-shelf product, so comparing suppliers mainly on price with an RFQ is enough.\n\n• Why the others are wrong: standard hardware doesn't need a creative proposal, and procurement documents are still the right tool even for a routine purchase.\n\nSo the answer is: an RFQ, since the tablets are a standard product best compared on price.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following genuinely justify issuing an RFP rather than an RFQ for the booking system development service? Select all that apply.",
      options: [
        "The requirement is complex and custom, needing a vendor-proposed design and approach",
        "The team needs to evaluate quality and approach alongside price, not price alone",
        "Producing an RFP document is cheaper for CityCare to write than an RFQ document",
        "Vendors need room to propose their own integration, hosting and security approach",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Think of commissioning a custom wedding cake versus ordering a dozen identical cupcakes — the custom cake needs the baker's own design ideas, not just a price list.\n\n• Genuine reasons: the work is complex and custom, quality and approach matter alongside price, and vendors need room to propose their own integration and security design.\n\n• Not a reason: how cheap the document itself is to produce has nothing to do with which document type fits the requirement.\n\nSo the answer is: everything except the claim about which document is cheaper to produce.",
    },
    {
      type: "mcq",
      prompt:
        "If CityCare instead issued an RFQ for the booking system development, treating it like a standard commodity purchase, what risk would that create?",
      options: [
        "No risk at all, since RFQs and RFPs are just two names for the same process and always produce an identical vendor shortlist",
        "Vendors would compete purely on price, with no structured way to compare how each would actually approach the integration, security and cloud-deployment work",
        "The project would automatically become cheaper with no downside, since RFQs are always the lowest-cost procurement route available",
        "CityCare would be legally required to accept the lowest bidder regardless of technical ability, with no option to weigh quality at all",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of hiring a surgeon purely by picking whoever quotes the lowest fee, with no way to compare their actual surgical approach or track record — price alone tells you almost nothing about whether the job gets done well.\n\n• The risk: an RFQ only compares price, so CityCare would lose the structured comparison of each vendor's integration, security and deployment approach that the project actually needs.\n\n• Why the others are wrong: this genuinely changes the outcome, it isn't free money, and nothing legally forces CityCare to accept the lowest bid regardless of quality.\n\nSo the answer is: vendors would compete on price alone, with no real comparison of their technical approach.",
    },
    {
      type: "match",
      prompt: "Match each procurement document or decision type to its defining feature.",
      pairs: [
        { left: "RFQ (Request for Quotation)", right: "Used for a clearly defined, standard item, decided mostly on price" },
        { left: "RFP (Request for Proposal)", right: "Invites vendors to propose their own solution for a complex or unclear need" },
        { left: "SOW (Statement of Work)", right: "Defines the scope, deliverables, deadline and acceptance criteria for the engagement" },
        { left: "Make-or-buy analysis", right: "Decides whether to build a capability in-house or purchase it from a vendor" },
      ],
      modelAnswer:
        "Think of a fixed-price menu item versus asking a chef to design a custom tasting menu — one just needs a price, the other needs the chef's own creative plan.\n\n• RFQ: for something already clearly defined, where price is the main deciding factor.\n\n• RFP: for a complex or unclear need, where the vendor's proposed approach matters as much as price.\n\n• SOW: the document that locks in scope, deliverables, deadline and acceptance criteria once a vendor is chosen.\n\n• Make-or-buy analysis: the earlier decision of whether to build in-house or bring in a vendor at all.\n\nSo the answer is: RFQ pairs with 'standard item, decided on price'; RFP pairs with 'vendor proposes their own solution'; SOW pairs with 'scope, deliverables, deadline and acceptance criteria'; make-or-buy analysis pairs with 'build in-house or buy from a vendor'.",
    },
    {
      type: "mcq",
      prompt:
        "Per the tutorial's own task list, a complete Statement of Work (SOW) for an outsourced service on this project should include which three things at minimum?",
      options: [
        "The vendor's total annual revenue, its head office address, and its company logo",
        "Scope and key deliverables, a delivery deadline, and at least two measurable acceptance criteria",
        "Only a price quote, with everything else negotiated verbally later",
        "A list of every other client the vendor has ever worked with",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a renovation contract that spells out exactly what's being built, by when, and how you'll check it was actually done right — without those three things, there's nothing to hold anyone to.\n\n• What belongs: scope and key deliverables (what's being built), a delivery deadline (tied to CityCare's four-month timeline), and measurable acceptance criteria (specific, checkable conditions).\n\n• Why the others are wrong: a vendor's revenue, address, logo or client list don't define what's actually being delivered or how to check it.\n\nSo the answer is: scope and deliverables, a delivery deadline, and measurable acceptance criteria.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following is an example of a measurable acceptance criterion for the booking system's cloud hosting component, as opposed to a vague statement?",
      options: [
        "The hosted system must handle at least 500 concurrent bookings with 99.5% uptime during the first month of operation",
        "The hosting should generally work well and be reliable enough for day-to-day clinic use",
        "The vendor should try their best to keep the system running smoothly for patients and staff",
        "The hosting needs to be of generally high quality compared with other similar healthcare systems",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of the difference between 'run fast' and 'finish the 5km under 25 minutes' — one is a checkable target, the other is just a wish.\n\n• The real criterion: a specific number (500 concurrent bookings) and a specific percentage (99.5% uptime) over a stated period can actually be tested and confirmed.\n\n• Why the others are wrong: 'work well', 'try their best' and 'high quality' are all vague — nobody can objectively confirm whether they've been met.\n\nSo the answer is: the concurrent-bookings-and-uptime statement, because it's a specific, checkable target.",
    },
    {
      type: "mcq",
      prompt:
        "Why does a Statement of Work need an explicit delivery deadline tied to CityCare's four-month project timeline, rather than leaving timing open-ended?",
      options: [
        "Without a defined deadline, there's no contractual basis to hold the vendor accountable if the system isn't ready in time, risking the whole project slipping",
        "A deadline is only a formality with no real effect on whether a vendor delivers on time",
        "Deadlines are required purely so CityCare can calculate the vendor's hourly pay rate",
        "An open-ended timeline would actually make the vendor finish faster through self-motivation alone",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of agreeing to have a house renovated 'sometime soon' instead of 'by March 1st' — without the specific date, there's nothing to point to if the builders are still there in July.\n\n• The real reason: a written deadline is the contractual hook that lets CityCare hold the vendor accountable, and it's tied directly to CityCare's own four-month target so the whole project doesn't quietly slip.\n\n• Why the others are wrong: a deadline is far more than a formality, it isn't about calculating pay, and leaving timing open doesn't somehow motivate faster delivery.\n\nSo the answer is: a defined deadline gives CityCare a concrete basis to hold the vendor to the project's own timeline.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following belong in a Statement of Work for one of CityCare's outsourced services? Select all that apply.",
      options: [
        "Scope and key deliverables",
        "A delivery deadline",
        "Two measurable acceptance criteria",
        "The internal developers' individual salaries",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of a building contract: what's being built, by when, and how you'll check it's done right — not the homeowner's own payroll records.\n\n• Belongs: scope and deliverables, a delivery deadline, and measurable acceptance criteria all define what the vendor must actually deliver and how to check it.\n\n• Doesn't belong: CityCare's internal staff salaries have nothing to do with what an outsourced vendor is contracted to deliver.\n\nSo the answer is: everything except the internal developers' salaries.",
    },
    {
      type: "mcq",
      prompt:
        "CityCare has a fixed $180,000 budget and a firm four-month deadline. Which contract type best fits the cloud hosting and cybersecurity testing services, and why?",
      options: [
        "Time-and-materials, because it always guarantees the lowest total price regardless of how long the work actually takes",
        "Cost-reimbursable, because it removes all financial risk from both parties equally no matter how the costs run",
        "Fixed-price, because CityCare needs cost certainty within its fixed budget and this work can be scoped clearly upfront",
        "No contract is needed at all, as long as the vendor seems personally trustworthy and reliable",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of agreeing on one flat price with a tradesperson before they start, instead of promising to pay 'whatever it ends up costing' — the flat price keeps your own wallet predictable.\n\n• The fit: with a fixed $180,000 cap and clearly scoped hosting and testing work, a fixed-price contract locks in CityCare's own cost no matter what the vendor's actual expenses turn out to be.\n\n• Why the others are wrong: time-and-materials doesn't guarantee the lowest price, cost-reimbursable shifts risk onto the buyer rather than removing it, and a contract is still needed regardless of trust.\n\nSo the answer is: fixed-price, because it gives CityCare cost certainty on clearly scoped work.",
    },
    {
      type: "mcq",
      prompt:
        "Why would a cost-reimbursable contract be riskier for CityCare specifically, given its fixed $180,000 budget?",
      options: [
        "Because cost-reimbursable contracts are illegal for government-adjacent healthcare projects like CityCare's clinics",
        "Under cost-reimbursable, CityCare would absorb the risk of the vendor's actual costs running over, which could blow straight through the fixed $180,000 cap",
        "Cost-reimbursable contracts never include a fee for the vendor, so the vendor has no incentive to finish at all",
        "There is no extra risk at all — cost-reimbursable and fixed-price allocate overrun risk in exactly the same way",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of agreeing to simply reimburse a contractor for whatever they end up spending on your renovation, with no cap — if their costs balloon, so does your bill.\n\n• The real risk: cost-reimbursable means CityCare pays the vendor's actual costs plus a fee, so any overrun comes straight out of CityCare's own fixed budget.\n\n• Why the others are wrong: nothing makes this contract type illegal here, it does include a fee for the vendor, and it clearly allocates risk differently from fixed-price.\n\nSo the answer is: cost-reimbursable shifts overrun risk onto CityCare's own fixed budget.",
    },
    {
      type: "mcq",
      prompt:
        "In what scenario would a time-and-materials contract make more sense for CityCare's work than a fixed-price contract?",
      options: [
        "When the exact scope isn't fully defined yet and is expected to evolve, such as further customisation work, in exchange for CityCare taking on more cost-overrun risk than it would under fixed-price",
        "Whenever the vendor simply asks for it, regardless of how well-defined or already fixed the scope of the work happens to be at that point in the project",
        "Only when CityCare's budget is completely unlimited, with no fixed cap at all like the real $180,000 figure it is actually working with on this project",
        "Time-and-materials never makes sense for any IT procurement at all, since it is treated as always strictly worse than a fixed-price arrangement",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of paying a repair person by the hour for a job where nobody's quite sure yet how many hours it'll take, versus getting a flat quote for a job that's fully specified — the hourly approach only makes sense when the scope itself is still moving.\n\n• The fit: when requirements aren't fully locked down and are likely to change, paying by hours and materials gives flexibility, but it shifts more overrun risk onto CityCare than a fixed-price deal would.\n\n• Why the others are wrong: the contract type should fit the work's own certainty, not simply whatever the vendor prefers, it isn't about having an unlimited budget, and time-and-materials is a legitimate option in plenty of IT projects.\n\nSo the answer is: when scope is still evolving, in exchange for CityCare accepting more of the overrun risk.",
    },
    {
      type: "fillblank",
      prompt:
        "Under a ___-price contract, the seller absorbs the risk of cost overruns while the buyer's own price stays locked in at the agreed total.",
      blanks: [["fixed"]],
      modelAnswer:
        "Think of paying one flat quote for a job no matter how long it actually takes the tradesperson — their time is their own problem once the price is agreed.\n\n• The mechanism: the total is set in advance, so if the seller's actual costs run over, that overrun comes out of the seller's own margin, not the buyer's wallet.\n\nSo the answer is: fixed (fixed-price).",
    },
    {
      type: "mcq",
      prompt:
        "Using the weighted-scoring table (Technical capability 30%, Healthcare experience 25%, Deadline 25%, Cost 20%), what is Vendor A's total weighted score, given scores of 4, 3, 4 and 5 on those four criteria respectively?",
      options: ["3.90", "3.70", "3.95", "4.00"],
      correctIndex: 2,
      modelAnswer:
        "Think of multiplying each ingredient's amount by its recipe share, then adding them all up for the final result.\n\n• The maths: (4 × 0.30) + (3 × 0.25) + (4 × 0.25) + (5 × 0.20) = 1.20 + 0.75 + 1.00 + 1.00 = 3.95.\n\nSo the answer is: 3.95.",
    },
    {
      type: "mcq",
      prompt:
        "Using the same weighted-scoring table, what is Vendor B's total weighted score, given scores of 5, 5, 3 and 2 on Technical capability, Healthcare experience, Deadline and Cost respectively?",
      options: ["3.95", "4.05", "3.70", "3.90"],
      correctIndex: 3,
      modelAnswer:
        "Think of totting up a report card where each subject counts for a different share of the final grade.\n\n• The maths: (5 × 0.30) + (5 × 0.25) + (3 × 0.25) + (2 × 0.20) = 1.50 + 1.25 + 0.75 + 0.40 = 3.90.\n\nSo the answer is: 3.90.",
    },
    {
      type: "mcq",
      prompt:
        "Using the same weighted-scoring table, what is Vendor C's total weighted score, given scores of 3, 3, 5 and 4 on Technical capability, Healthcare experience, Deadline and Cost respectively?",
      options: ["3.90", "3.60", "3.95", "3.70"],
      correctIndex: 3,
      modelAnswer:
        "Think of adding up four weighted shares one more time, the same way as the first two vendors.\n\n• The maths: (3 × 0.30) + (3 × 0.25) + (5 × 0.25) + (4 × 0.20) = 0.90 + 0.75 + 1.25 + 0.80 = 3.70.\n\nSo the answer is: 3.70.",
    },
    {
      type: "mcq",
      prompt:
        "Given the three totals — Vendor A 3.95, Vendor B 3.90, Vendor C 3.70 — which vendor should CityCare recommend, and how close is the next-best alternative?",
      options: [
        "Vendor C, because it wins outright on meeting the deadline",
        "It's an exact tie requiring a coin flip between all three",
        "Vendor B, by a wide and decisive margin over the other two",
        "Vendor A, only 0.05 ahead of Vendor B — a genuinely close race",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of two runners finishing a race just a fraction of a second apart — technically there's a winner, but it was close enough that the runner-up's case is still worth hearing.\n\n• The read: Vendor A's 3.95 narrowly beats Vendor B's 3.90, a gap of just 0.05, while Vendor C's 3.70 trails both more clearly.\n\n• Why the others are wrong: it isn't a tie, Vendor B doesn't win, and Vendor C's strong deadline score alone doesn't overturn its lower overall total.\n\nSo the answer is: Vendor A, but only narrowly ahead of Vendor B.",
    },
    {
      type: "mcq",
      prompt:
        "What is the main trade-off CityCare accepts by choosing Vendor A (3.95) over Vendor B (3.90), given their individual criterion scores?",
      options: [
        "Vendor A is worse on every single criterion than Vendor B, with no single area where it actually comes out ahead",
        "There is no trade-off at all — Vendor A beats Vendor B outright on every one of the four weighted criteria",
        "Vendor A fails CityCare's mandatory security and data-handling requirements, unlike Vendor B, which passes them cleanly",
        "Vendor A has slightly less technical capability and healthcare experience than Vendor B, but makes up for it with a much stronger cost score",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of choosing a slightly less experienced tradesperson because their quote is so much more affordable that it tips the overall decision in their favour.\n\n• The trade-off: Vendor A scores lower than Vendor B on technical capability (4 vs 5) and healthcare experience (3 vs 5), but its much better cost score (5 vs 2) is enough to edge ahead overall.\n\n• Why the others are wrong: Vendor A isn't worse across the board, there genuinely is a trade-off, and both vendors already passed the mandatory checks before scoring began.\n\nSo the answer is: less experience and technical strength, offset by a much better cost score.",
    },
    {
      type: "mcq",
      prompt:
        "What is the main trade-off CityCare would accept if it chose Vendor C (3.70) over Vendor A (3.95) instead?",
      options: [
        "Vendor C is actually the overall winner once all four weighted criteria are totalled, so there is no real trade-off to accept",
        "Vendor C fails the mandatory security and data-handling requirements that all three vendors were supposed to meet upfront",
        "Vendor C and Vendor A score identically on every one of the four weighted criteria, leaving nothing to actually trade off",
        "Vendor C scores best on meeting the deadline, but is noticeably weaker on both technical capability and cost, pulling its overall total below Vendor A's",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of picking the contractor who promises the fastest finish date, even though their workmanship and price are both a bit weaker than a rival's — you're trading overall strength for speed.\n\n• The trade-off: Vendor C's strongest score is on meeting the deadline (5), but weaker technical capability (3) and cost (4) scores drag its overall total below Vendor A's.\n\n• Why the others are wrong: Vendor C's total (3.70) is the lowest of the three, not the highest, all three vendors already passed the mandatory checks, and their scores clearly differ.\n\nSo the answer is: a better deadline score, traded against weaker technical capability and cost.",
    },
    {
      type: "mcq",
      prompt:
        "Why must CityCare confirm that all three vendors meet the mandatory security and data-handling requirements before relying on the weighted scores to pick a winner?",
      options: [
        "Weighted scoring only ranks vendors against each other on the stated criteria — a vendor that fails a mandatory requirement could still score highest and be wrongly recommended if that check isn't done first",
        "Mandatory requirements are only relevant for the twenty tablets, not for the three vendors competing on the booking system's development work",
        "Weighted scoring already automatically fails any vendor that doesn't meet the mandatory security and data-handling requirements, so no separate check is needed",
        "Checking mandatory requirements first makes the later weighted-scoring step completely unnecessary, since the check alone decides the winner",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of ranking job applicants purely by how impressive their resumes sound, without first checking that each one is actually legally allowed to work the role — a great-sounding resume doesn't help if that basic requirement isn't met.\n\n• The real reason: weighted scoring compares vendors against each other on the listed criteria, but it has no built-in pass/fail gate, so a vendor failing a hard requirement could still top the ranking if nobody checked separately.\n\n• Why the others are wrong: mandatory checks apply to the development vendors too, scoring doesn't auto-fail anyone, and checking requirements first doesn't replace the need for scoring — both steps are needed.\n\nSo the answer is: without the separate mandatory check, a disqualifying vendor could still win on the weighted score alone.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are true about this weighted-scoring exercise? Select all that apply.",
      options: [
        "Vendor A's total (3.95) and Vendor B's total (3.90) are close enough that the trade-off between them genuinely matters",
        "Cost carries the lowest weight (20%) of the four criteria",
        "Technical capability carries the highest weight (30%) of the four criteria",
        "Vendor C has the highest total score of the three vendors",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of checking a few facts about a race result: how close the top two finished, and which events counted for the most points.\n\n• True: A and B are genuinely close (3.95 vs 3.90), Cost is the lowest-weighted criterion at 20%, and Technical capability is the highest-weighted at 30%.\n\n• Not true: Vendor C's total (3.70) is actually the lowest of the three, not the highest.\n\nSo the answer is: everything except the claim that Vendor C scores highest.",
    },
    {
      type: "mcq",
      prompt:
        "Six weeks in, the vendor reports a two-week delay and a demo shows appointment reminders sometimes fail, while the contract makes the next milestone payment conditional on successful testing and formal acceptance. Should the project manager approve that milestone payment now?",
      options: [
        "Yes, because milestone payments should always be approved on the original schedule regardless of what the test results actually show",
        "No — the payment condition (successful testing and formal acceptance) hasn't been met, since the reminder feature is still failing",
        "Yes, because a two-week delay by itself is too minor a slip to ever justify withholding a scheduled payment",
        "No, because the whole contract should be cancelled immediately the moment any single defect is found",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of refusing to pay the final instalment on a renovation until the leaking tap it was supposed to fix is actually confirmed fixed — paying early removes any reason for the tradesperson to finish the job properly.\n\n• The right call: the contract explicitly ties payment to successful testing and formal acceptance, and the reminders feature is demonstrably still failing, so that condition isn't met yet.\n\n• Why the others are wrong: approving on schedule regardless of results ignores the contract's own terms, a delay this size isn't something to just wave through, and one failing feature doesn't automatically mean cancelling the whole contract.\n\nSo the answer is: no, the payment condition hasn't been satisfied yet.",
    },
    {
      type: "mcq",
      prompt:
        "What evidence should the project manager request before agreeing on corrective action for the failed appointment reminders?",
      options: [
        "Just a verbal assurance from the vendor's project lead that the reminder feature will be fixed sometime soon",
        "Specific defect and test logs showing where and why the reminder feature fails, plus a documented root-cause analysis and a revised timeline",
        "Nothing at all — corrective action should be agreed with the vendor before any supporting evidence is actually reviewed",
        "A general patient satisfaction survey about CityCare's clinics, unrelated to the reminder defect itself",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a mechanic who says 'trust me, it's fixed' versus one who shows you the actual diagnostic report explaining exactly what was wrong and what they did about it — the second one actually lets you verify the claim.\n\n• The right evidence: concrete defect and test logs, a documented root cause, and a revised timeline give CityCare something it can actually check, rather than just taking the vendor's word.\n\n• Why the others are wrong: a verbal assurance alone proves nothing, agreeing action with no evidence is reckless, and a patient satisfaction survey doesn't diagnose a technical defect.\n\nSo the answer is: specific logs, a documented root cause, and a revised timeline.",
    },
    {
      type: "mcq",
      prompt:
        "CityCare's new multilingual feature request was never part of the agreed scope. How should it be assessed and approved?",
      options: [
        "Through formal change control — assess its cost, schedule and resource impact, and get it approved (with the contract and budget adjusted if needed) before any work begins",
        "By simply having the vendor fold it into the current milestone's work with no formal review, cost estimate or schedule check at all",
        "It should be rejected automatically and without discussion, since scope can never change once a contract has already been signed",
        "By waiting until the entire booking system project is fully finished before even raising or discussing the request with the vendor",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of asking a builder to add a whole extra room partway through a house renovation — you don't just tell them to squeeze it in; you get a proper quote, agree the extra cost and timeline, and sign off before work starts.\n\n• The right process: formal change control assesses the real cost, schedule and resource impact of the new feature, and gets it approved and reflected in the contract before any work on it begins.\n\n• Why the others are wrong: quietly folding it into the current milestone skips proper review, scope changes are a normal and manageable part of procurement rather than something automatically banned, and waiting until the whole project is done defeats the point of addressing it now.\n\nSo the answer is: run it through formal change control before any work starts.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are appropriate supplier performance measures CityCare could track for this vendor? Select all that apply.",
      options: [
        "On-time delivery rate against agreed milestones",
        "Defect rate or number of failed acceptance tests",
        "Responsiveness to issues raised by CityCare",
        "The vendor's total number of employees company-wide",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of rating a tradesperson on whether they showed up on time, how often their work needed redoing, and how quickly they answered your calls — not on how big their company happens to be.\n\n• Genuine measures: on-time delivery, defect rate, and responsiveness all directly track how well the vendor is actually performing on this contract.\n\n• Not a measure: the vendor's total headcount says nothing about how this specific job is going.\n\nSo the answer is: on-time delivery, defect rate, and responsiveness.",
    },
    {
      type: "mcq",
      prompt:
        "If the vendor's performance does not improve after corrective action is agreed, what is an appropriate contingency action for CityCare to have ready?",
      options: [
        "A pre-agreed escalation or exit option, such as withholding further payment or invoking the contract's termination or replacement-vendor clause",
        "Doing nothing further and simply continuing to pay the vendor on the original schedule regardless of performance",
        "Immediately suing the vendor in court without first using any of the remedies already written into the contract",
        "Quietly dropping the unrelated multilingual feature request as an informal form of punishment for the vendor",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of having a backup plumber's number ready before your current one misses a second appointment — you hope you won't need it, but it's there so you're not stuck if performance doesn't improve.\n\n• The right fallback: a concrete, pre-agreed contingency — such as withholding payment further or using a termination/replacement clause already in the contract — gives CityCare real leverage if things don't improve.\n\n• Why the others are wrong: continuing to pay regardless removes any incentive to improve, jumping straight to a lawsuit skips the contract remedies that exist for exactly this situation, and dropping an unrelated feature request isn't a performance contingency at all.\n\nSo the answer is: a pre-agreed escalation or exit option built into the contract.",
    },
    {
      type: "order",
      prompt:
        "Order the project board workflow CityCare uses to track the booking system work, from first logged through to finished.",
      steps: ["Backlog", "Ready", "In Progress", "In Review", "Done"],
      modelAnswer:
        "Think of a task moving through a workshop: it waits in the yard, gets booked in, goes up on the hoist, gets checked over, then is handed back finished.\n\n• Backlog holds it as an idea. Ready means it's scoped and picked up. In Progress means it's actively being worked. In Review means it's being checked. Done means it's finished and accepted.\n\nSo the answer is: Backlog, Ready, In Progress, In Review, Done.",
    },
    {
      type: "mcq",
      prompt:
        "Why does CityCare's plan explicitly keep final acceptance of the booking system internal, rather than letting the vendor sign off its own work?",
      options: [
        "Final acceptance is the independent checkpoint confirming the delivered system actually meets CityCare's requirements before payment or sign-off — letting the vendor self-certify removes that check",
        "Final acceptance is purely a ceremonial step with no real effect at all on the project's outcome or on whether payment is actually ever released",
        "Vendors are legally barred from ever testing their own software at any stage of development, under standard procurement and contract law",
        "Keeping acceptance internal is required only because the twenty reception tablets happen to be purchased separately from the booking system itself",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think back to the student-marking-their-own-exam idea from earlier in this paper — letting the person who built something be the only one who checks it removes the independent safety net.\n\n• The real reason: final acceptance is CityCare's own confirmation that the system actually works as required, and keeping it internal means the vendor can't simply declare its own work finished.\n\n• Why the others are wrong: it isn't ceremonial, vendors testing their own code during development is normal, and this decision has nothing to do with the separate tablet purchase.\n\nSo the answer is: it keeps an independent check in CityCare's own hands rather than the vendor's.",
    },
    {
      type: "mcq",
      prompt:
        "Taken together, what does this tutorial's procurement sequence — make-or-buy, then RFP/RFQ, then Statement of Work, then contract type, then vendor scoring, then controlling procurement — illustrate about procurement management overall?",
      options: [
        "Procurement ends the moment a contract is signed with the chosen vendor, so none of the controlling-procurement activities afterward are really part of procurement itself",
        "Only the vendor-scoring step actually matters for the outcome; the make-or-buy, RFP/RFQ, SOW and contract-type steps before it are mostly optional formalities",
        "Procurement is a continuous process spanning planning (deciding what to buy and how), execution (selecting and contracting a vendor), and control (monitoring the vendor relationship after award) — not a single one-off purchase",
        "Procurement is identical to risk management and uses exactly the same tools and techniques throughout, just applied to vendors instead of generic project risks",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of buying and running a car: deciding what you need, choosing and signing for the right one, and then still servicing, insuring and monitoring it for years afterward — the purchase is only the middle of the story.\n\n• The real takeaway: this sequence spans planning what to buy and how, actually selecting and contracting a vendor, and then controlling that relationship afterward — procurement keeps going well past the signature.\n\n• Why the others are wrong: the controlling-procurement activity shows work clearly continues after signing, none of the earlier steps are optional formalities, and procurement is its own discipline, not simply risk management under another name.\n\nSo the answer is: procurement is a continuous planning-execution-control process, not a one-off purchase.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 9,
  paperNumber: 2,
  title: "Week 9 Practice Paper — Lecture",
  topics:
    "Project Leadership, Governance and Alignment: foundational definitions (leadership/governance/alignment as the ship's captain, navigation rules and destination); project leadership vs project management and leader vs manager; leadership styles (Transformational, Transactional, Autocratic, Laissez-Faire, Adaptive/Agile) with strengths and risks; applying leadership in Agile, digital-transformation and cloud/infrastructure IT contexts, why leadership matters, and essential leader skills; Project Communication Management's three processes (Plan/Manage/Monitor) via the NSW Digital Driver Licence case; IT Project Governance (Steering Committee, Project Management Office, Project Sponsor), governance mechanisms, common governance challenges and best practices; alignment's four dimensions and why it matters; alignment frameworks (Strategic Alignment Model, Balanced Scorecard, Agile Value Streams); integrating the leadership-governance-alignment triad through the SmartCampus Project case study.",
  sourceFiles: [
    "lecture/Lecture - INFO6007 Week 09 - Project Leadership, Governance and Alignment.pdf",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Leadership, Governance and Alignment",
      body: "Picture steering a ship across the ocean. Someone has to motivate the crew and decide which way to turn when a storm hits. Someone has to keep the navigation charts, safety rules and checklists so the ship doesn't wander off course. And someone has to make sure the ship is actually headed toward the right harbour in the first place.\n\n• Leadership: the ability to inspire, guide and influence the project team and stakeholders to achieve the project's objectives — the captain of the ship, motivating the crew and steering its direction.\n\n• Governance: the formal structure of oversight and control that keeps the project accountable — the navigation system and rules, keeping the ship on course safely.\n\n• Alignment: making sure the project's goals match the organisation's strategy and business needs — the destination, making sure the ship is headed where the organisation actually wants to go.\n\nAll three directly shape decision-making, resource use and whether the project delivers real value.",
    },
    {
      beforeQuestion: 5,
      title: "Leadership vs Management, Leader vs Manager",
      body: "Project management applies tools and techniques to plan, execute and control a project within scope, time, cost and quality — task-oriented, process-driven, focused on short-term efficiency. Project leadership goes further: inspiring, guiding and influencing the team and stakeholders to actually achieve the project's objectives, beyond just managing tasks and schedules — people-oriented, vision-driven, focused on long-term value, adoption and transformation.\n\n• A Manager asks 'how do we get it done efficiently and correctly?', is present-oriented, plans/organises/monitors/controls work, and is structured, methodical and risk-averse — the outcome is delivering on time, budget and scope.\n\n• A Leader asks 'where are we going, and why does it matter?', is future-oriented, motivates/influences/empowers the team, and is flexible, adaptive and willing to take risks — the outcome is engagement, innovation and long-term value.\n\nA project genuinely needs both roles, whether held by one person or two.",
    },
    {
      beforeQuestion: 10,
      title: "Leadership Styles",
      body: "A project leader doesn't use just one fixed style — different situations call for different approaches, and the wrong one for the moment carries a real cost.\n\n• Transformational: encourages innovation and embraces new technology. Strength: high engagement and adaptability. Risk: may overlook operational detail.\n\n• Transactional: focuses on structure, rewards and penalties. Strength: clear accountability and discipline. Risk: can stifle creativity and initiative.\n\n• Autocratic: the leader decides unilaterally with tight control. Strength: fast decisions in emergencies. Risk: low morale and lack of team input if overused.\n\n• Laissez-Faire: hands-off, giving freedom to highly skilled professionals. Strength: encourages autonomy and innovation. Risk: confusion or lack of direction if the team is inexperienced.\n\n• Adaptive/Agile: a flexible, situational approach shifting style to match changing project needs, team dynamics and business priorities. Strength: balances control and empowerment. Risk: requires high awareness and skill to shift styles effectively.",
    },
    {
      beforeQuestion: 16,
      title: "Leadership in IT Contexts, Why It Matters, Essential Skills",
      body: "In Agile software teams, leaders act as servants and enablers in Scrum or Kanban, removing blockers and helping the team self-organise rather than directing every task. In digital transformation projects, leaders ensure the project aligns with strategic objectives like better efficiency or customer experience, and guide adoption and cultural change. In cloud or infrastructure projects, leaders manage cross-functional teams (network, security, developers), handle risk, and adapt plans as technical challenges arise.\n\n• Why it matters: IT projects face changing technology, evolving requirements and high uncertainty, so strong leadership helps teams adapt and decide confidently under pressure, builds morale and trust across diverse roles, and bridges technical execution with business strategy so the project delivers real business value, not just something that 'works' technically.\n\n• Essential skills: communication, strategic thinking and vision, decision-making and problem-solving, leadership and people management, adaptability and flexibility, risk management and critical thinking, stakeholder management and negotiation, and emotional intelligence.",
    },
    {
      beforeQuestion: 21,
      title: "Project Communication Management: the NSW Digital Driver Licence",
      body: "The NSW Digital Driver Licence project (piloted in Dubbo in 2017, expanded to Sydney's Eastern Beaches and Albury, launched statewide in October 2019) built an optional digital licence in the Service NSW app, with stakeholders spanning Service NSW, Transport for NSW, NSW Police, licence holders and licence checkers.\n\n• Plan Communications Management: decide what information each stakeholder needs, who provides it, which channel to use and when — an urgent security issue goes straight to the sponsor and security lead, while routine progress stays in the weekly report.\n\n• Manage Communications: actually collect, create and distribute that information per the plan — trial feedback goes through a trial review to the product lead; a security issue goes through a restricted escalation briefing to the security lead.\n\n• Monitor Communications: check whether communication is reaching people and supporting decisions — reviewing unanswered questions, delayed decisions, repeated questions and missed escalations, then adjusting the audience, channel or timing when something isn't working.",
    },
    {
      beforeQuestion: 27,
      title: "IT Project Governance: Steering Committee, PMO, Sponsor",
      body: "IT Project Governance is the framework of policies, roles, responsibilities, processes and decision-making structures that guide, monitor and control IT projects, keeping them aligned with organisational objectives, compliant with standards, and focused on managing risk and delivering value. Three governance roles sit at its centre.\n\n• Steering Committee (sometimes a Project Board): senior stakeholders — the sponsor, senior business reps, IT/technical leads, finance/PMO reps and others — providing strategic guidance and decision-making authority. They approve the charter and business case, approve major changes, monitor progress, resolve escalated issues, and confirm benefits realisation.\n\n• Project Management Office (PMO): a centralised unit standardising project management practices and providing governance support, performance monitoring, training, tools/process management and risk/issue management — the bridge between project teams, leadership and stakeholders.\n\n• Project Sponsor: the senior executive who champions the project, provides resources and holds ultimate accountability for its success — granting the project manager authority, keeping the project tied to strategy, and helping navigate risks beyond the project manager's own scope.",
    },
    {
      beforeQuestion: 33,
      title: "Governance Mechanisms, Challenges and Best Practices",
      body: "Governance mechanisms are the structured methods used to guide, monitor and control IT projects day to day: Stage-Gate/Phase-Gate reviews (formal checkpoints at key milestones), performance reporting and dashboards (visibility into budget, schedule, scope, risk and quality), risk and issue escalation procedures, decision-making frameworks (who can decide what), and audits and reviews (independent compliance checks).\n\n• Common challenges: ambiguity in decision-making and accountability causes confusion, delays and finger-pointing; key stakeholders not involved or informed enough causes misalignment and low adoption; unclear or untimely project information leaves teams misunderstanding requirements; projects executed without clear alignment to organisational goals fail to deliver expected value; governance that doesn't actively monitor or escalate risk lets problems grow unnoticed; teams resisting governance processes causes delays and reduced compliance.\n\n• Best practices: define mechanisms clearly at the start, integrate governance into daily operations rather than treating it as separate, keep decisions and approvals transparent and documented, use tools and dashboards to automate tracking, and scale governance to the project's size — smaller projects need lighter governance.",
    },
    {
      beforeQuestion: 38,
      title: "Alignment: Definition, Dimensions, Why It Matters",
      body: "Alignment means ensuring an IT project's goals, activities and outcomes are in harmony with the broader business strategy, stakeholder expectations and organisational priorities, across four dimensions.\n\n• Strategic Alignment: the project supports the organisation's long-term goals, mission and vision.\n\n• Business-IT Alignment: IT solutions deliver real business value, not just technical outputs.\n\n• Stakeholder Alignment: the expectations of executives, end-users, customers and regulators are properly managed and satisfied.\n\n• Team Alignment: the project team shares a common understanding of objectives, roles and priorities.\n\n• Why it matters: alignment maximises business value, reduces wasted effort by preventing teams from building features nobody in the business needs, improves stakeholder satisfaction, enhances decision-making by helping prioritise projects and resources by strategic fit, and boosts adoption, since users embrace systems that actually fit their needs and workflows.",
    },
    {
      beforeQuestion: 42,
      title: "Frameworks for Alignment: SAM, BSC, Value Streams",
      body: "Several established frameworks help check and maintain alignment.\n\n• Strategic Alignment Model (SAM), Henderson and Venkatraman: aligns business strategy with IT strategy across two dimensions — Strategic Fit (external business/IT environment, internal organisational structure/IT infrastructure) and Functional Integration (business strategy linked to IT strategy, business infrastructure linked to IT infrastructure) — spanning four domains: business strategy, IT strategy, organisational infrastructure and processes, and IT infrastructure and processes.\n\n• Balanced Scorecard (BSC), Kaplan and Norton: integrates financial and non-financial measures across four perspectives — Financial ('how do we look to shareholders?', e.g. did the ERP system reduce costs?), Customer ('how do customers see us?'), Internal Process ('what must we excel at?'), and Learning and Growth ('can we keep improving?').\n\n• Agile Value Streams: a value stream is the sequence of activities an organisation undertakes to deliver value to a customer — Operational Value Streams (how the business delivers value to end customers) and Development Value Streams (how the organisation builds the systems that enable those operational streams).",
    },
    {
      beforeQuestion: 46,
      title: "Integrating the Triad: the SmartCampus Project",
      body: "Leadership, governance and alignment reinforce each other as a triad. Leadership drives the people — without it, projects risk low morale, poor communication and mismanaged expectations. Governance provides the rules of the game — without it, projects face scope creep, poor accountability and unmanaged risks. Alignment ensures everyone plays the right game — without it, projects risk delivering technology that doesn't solve business problems.\n\n• Case study — SmartCampus Project: a university launches a project to transform student services (an enrolment/payments/registration portal, a timetable and notifications app, and retention-focused data analytics), but struggles on all three fronts. Leadership: the project manager is technically skilled but poor at motivating the team or engaging academic staff, so communication breaks down. Governance: there is no clear steering committee or decision-making structure, and privacy compliance is considered too late. Alignment: IT focuses on 'cool features' like gamification that don't support the university's actual strategy of improving student retention.\n\n• Outcome: after 18 months, the project is over budget, behind schedule, and students find the portal confusing.",
    },
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "In the ship metaphor, which concept is described as 'the destination, making sure the ship is headed where the organisation actually wants to go'?",
      options: ["Alignment", "Leadership", "Project Management", "Governance"],
      correctIndex: 0,
      modelAnswer:
        "Think of a ship crew that's motivated and well-run but sailing toward the wrong harbour entirely — great crew, wrong destination.\n\n• The fit: Alignment is specifically about making sure the project's goals match the organisation's strategy and business needs — the destination itself.\n\n• Why the others are wrong: Leadership is the captain motivating the crew, Governance is the navigation rules, and Project Management is the day-to-day sailing, not the choice of harbour.\n\nSo the answer is: Alignment.",
    },
    {
      type: "mcq",
      prompt:
        "Which concept is described as 'the navigation system and rules, ensuring the ship stays on course safely'?",
      options: ["Alignment", "Governance", "Leadership", "Stakeholder engagement"],
      correctIndex: 1,
      modelAnswer:
        "Think of the charts, checklists and safety rules that keep a ship from drifting off course, regardless of who's steering.\n\n• The fit: Governance is the formal structure of oversight and control that keeps the project accountable — the rules keeping the ship safely on course.\n\n• Why the others are wrong: Alignment is about the destination, Leadership is about motivating the crew, and stakeholder engagement is just one piece of the wider picture, not the rules themselves.\n\nSo the answer is: Governance.",
    },
    {
      type: "mcq",
      prompt:
        "A project has a highly motivating project manager who gets everyone excited about the vision, but there are no formal approval processes, no defined decision rights, and nobody checks whether the final product actually supports company strategy. Which two foundational pillars are clearly missing, even though leadership is present?",
      options: [
        "Leadership and Alignment",
        "Governance and Alignment",
        "Communication and Alignment",
        "Governance and stakeholder engagement",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of an inspiring captain with no rulebook and no map — the crew loves them, but nobody's checking the ship's course or heading toward the right port.\n\n• The gap: no approval processes or decision rights means Governance is missing, and nobody checking strategic fit means Alignment is missing — Leadership itself is clearly present and working.\n\n• Why the others are wrong: Leadership is explicitly present here, and 'stakeholder engagement' alone doesn't capture the missing formal decision-making structure.\n\nSo the answer is: Governance and Alignment.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are listed among the 'key aspects of project leadership' in the lecture? Select all that apply.",
      options: [
        "Vision and direction",
        "Motivation and inspiration",
        "Change management",
        "Approving the project charter and business case",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of what a ship's captain personally does versus what the ship-owner's board signs off on.\n\n• Leadership aspects: vision and direction, motivation and inspiration, and change management are all things a leader does directly with the team.\n\n• Not a leadership aspect: approving the charter and business case is a Steering Committee responsibility, not something listed under project leadership itself.\n\nSo the answer is: vision and direction, motivation and inspiration, and change management.",
    },
    {
      type: "mcq",
      prompt:
        "Why do leadership, governance and alignment all matter directly for IT project success, per the lecture's framing?",
      options: [
        "They matter only during the initial planning phase and can be set aside once development starts",
        "They directly influence decision-making, resource use and the project's ability to deliver value that actually meets organisational goals",
        "They only matter for very large public-sector IT projects, not typical commercial ones",
        "They are nice-to-have extras that mostly affect team morale, not whether the project technically works",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a car that needs a working engine, steering and a destination the whole trip, not just at the start of the drive.\n\n• The real reason: these three pillars directly shape how decisions get made, how resources are used, and whether the project ends up delivering value that actually matters to the organisation — throughout the project, not just at the start.\n\n• Why the others are wrong: they aren't limited to planning, aren't limited to the public sector, and go well beyond just morale.\n\nSo the answer is: they directly shape decision-making, resource use and value delivery.",
    },
    {
      type: "mcq",
      prompt:
        "Which question does a Manager typically ask, versus which question does a Leader typically ask, per the Leader vs Manager comparison?",
      options: [
        "Manager asks 'where are we going, why does it matter?'; Leader asks 'how do we get it done efficiently?'",
        "Manager asks 'how do we get it done efficiently and correctly?'; Leader asks 'where are we going, why does it matter?'",
        "Both ask the same present-oriented question, just applied to different teams",
        "Manager asks about long-term vision; Leader asks about short-term task completion",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a ship's navigator asking 'are we on the right heading and speed?' while the captain asks 'why are we even sailing to this port?'\n\n• The fit: the Manager is present-oriented, focused on getting the work done efficiently and correctly; the Leader is future-oriented, focused on direction and purpose.\n\n• Why the others are wrong: the first and third options swap the questions around, and they're explicitly different orientations, not the same question for different teams.\n\nSo the answer is: Manager asks how to get it done efficiently; Leader asks where we're going and why.",
    },
    {
      type: "sort",
      prompt:
        "Sort each characteristic into whether the Leader vs Manager table describes it as Leader or Manager.",
      groups: ["Leader", "Manager"],
      items: [
        { text: "People, vision and inspiration (Focus)", group: 0 },
        { text: "Future-oriented: asks where are we going and why it matters (Orientation)", group: 0 },
        { text: "Motivates, influences and empowers the team (Approach)", group: 0 },
        { text: "Processes, tasks and control (Focus)", group: 1 },
        { text: "Present-oriented: asks how do we get it done efficiently (Orientation)", group: 1 },
        { text: "Plans, organises, monitors and controls work (Approach)", group: 1 },
      ],
      modelAnswer:
        "Think of two people running the same project: one is always asking 'why does this matter and where are we headed', the other is always asking 'is this task on schedule and within budget'.\n\n• Leader items: focused on people and vision, future-oriented, and leads by motivating and empowering.\n\n• Manager items: focused on process and control, present-oriented, and leads by planning and monitoring.\n\nSo the answer is: the first three items are Leader; the last three are Manager.",
    },
    {
      type: "mcq",
      prompt:
        "Project management is described as 'task-oriented and process-driven... focused on efficiency, resource allocation and deliverables.' Project leadership instead is described as what?",
      options: [
        "Focused only on compliance with governance frameworks and standards, with no real attention to people or vision",
        "Equally task-oriented and process-driven, just applied to a slightly different set of tasks than management handles",
        "People-oriented and vision-driven, building team cohesion while focusing on long-term value, adoption and transformation",
        "Focused purely on short-term efficiency, same as management but delivered through more frequent meetings",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of two people on the same project: one tracking the schedule line by line, the other focused on whether the whole team actually believes in where it's headed.\n\n• The fit: project leadership is people-oriented and vision-driven, building cohesion and trust while focusing on long-term value, adoption and transformation rather than just task completion.\n\n• Why the others are wrong: compliance focus belongs to management's characteristics, and leadership is explicitly contrasted with task-orientation and short-term efficiency, not identical to them.\n\nSo the answer is: people-oriented and vision-driven, focused on long-term value and transformation.",
    },
    {
      type: "fillblank",
      prompt:
        "Project management's 'Orientation' in the comparison table is short-term efficiency; project leadership's 'Orientation' is long-term ___.",
      blanks: [["impact"]],
      modelAnswer:
        "Think of a manager checking today's to-do list versus a leader thinking about what the team's work will mean a year from now.\n\n• The pairing: short-term efficiency sits opposite long-term impact in the table's 'Orientation' row.\n\nSo the answer is: impact.",
    },
    {
      type: "multi",
      prompt:
        "According to the Project Leadership vs Project Management table, which characteristics belong to Project Leadership rather than Project Management? Select all that apply.",
      options: [
        "People-oriented and vision-driven",
        "Ensures compliance with governance frameworks and standards",
        "Builds team cohesion and trust while providing direction during uncertainty",
        "Focuses on long-term value, adoption and transformation",
      ],
      correctIndices: [0, 2, 3],
      modelAnswer:
        "Think of sorting a list of traits into 'this is about people and vision' versus 'this is about process and compliance'.\n\n• Leadership characteristics: people-oriented and vision-driven, builds cohesion and trust, and focuses on long-term value and transformation.\n\n• Not leadership: ensuring compliance with governance frameworks and standards is listed under Project Management's characteristics instead.\n\nSo the answer is: everything except the compliance characteristic.",
    },
    {
      type: "mcq",
      prompt:
        "A project manager faces a sudden production outage during a critical cloud migration and makes a fast, unilateral call to roll back the deployment without consulting the team, given the emergency. Which leadership style does this best illustrate, and what's its main strength here?",
      options: [
        "Transformational — strength is driving innovation under pressure",
        "Autocratic — strength is fast decisions in emergencies",
        "Laissez-Faire — strength is giving the team full autonomy to decide for themselves",
        "Transactional — strength is clear rewards and penalties for the decision",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a ship's captain shouting a single urgent order during a storm rather than calling a crew meeting to vote on it — speed matters more than consensus in that moment.\n\n• The fit: deciding unilaterally with tight control during an emergency is the Autocratic style, and its named strength is exactly fast decisions in emergencies.\n\n• Why the others are wrong: Laissez-Faire would mean stepping back entirely, Transactional is about rewards/penalties rather than emergency speed, and Transformational is about driving innovation, not crisis response.\n\nSo the answer is: Autocratic, strength is fast decisions in emergencies.",
    },
    {
      type: "mcq",
      prompt:
        "A leader manages a team of senior, highly experienced cloud architects by stepping back and giving them freedom to decide their own technical approach with minimal direction. What is the main risk of applying this same Laissez-Faire approach to a different, inexperienced team instead?",
      options: [
        "It would overlook operational detail, the same risk associated with a Transformational style",
        "It guarantees fast decisions regardless of the team's experience level",
        "It could lead to confusion or lack of direction, since the style relies on the team already being highly skilled",
        "It would cause low morale through excessive rewards and penalties",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of handing a brand-new driver the car keys and no instructions, the same way you'd treat a veteran racer — the veteran thrives, the newcomer gets lost fast.\n\n• The risk: Laissez-Faire's hands-off freedom only works because the team is already highly skilled; applied to an inexperienced team, it risks confusion and a lack of direction.\n\n• Why the others are wrong: overlooking operational detail is Transformational's risk, rewards/penalties belong to Transactional, and Laissez-Faire doesn't guarantee fast decisions at all.\n\nSo the answer is: confusion or lack of direction, since the style assumes the team is already highly skilled.",
    },
    {
      type: "mcq",
      prompt:
        "A leader who sets clear KPI-linked bonuses and penalties for the team's sprint delivery is practising which leadership style, and what is its known risk?",
      options: [
        "Autocratic — risk of low morale from lack of input",
        "Transformational — risk of overlooking operational detail",
        "Transactional — risk of stifling creativity and initiative",
        "Adaptive/Agile — risk of requiring high skill to switch styles",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a sales team where every target hit earns a bonus and every miss costs one — clear and motivating for routine work, but not exactly inspiring for creative risk-taking.\n\n• The fit: structuring work around rewards and penalties is the Transactional style, and its named risk is that it can stifle creativity and initiative.\n\n• Why the others are wrong: low morale from lack of input is Autocratic's risk, overlooking detail is Transformational's risk, and switching-style difficulty is Adaptive/Agile's risk.\n\nSo the answer is: Transactional, risk of stifling creativity and initiative.",
    },
    {
      type: "mcq",
      prompt:
        "Why is Adaptive/Agile described as a style that's 'rapidly gaining popularity', rather than just another fixed style on the list?",
      options: [
        "Because it is the only one of the five leadership styles that carries no associated risk at all, unlike Transformational, Transactional, Autocratic or Laissez-Faire",
        "Because it is defined purely by giving the team complete freedom with no leader input whatsoever, the same way Laissez-Faire is described",
        "Because once adopted, it replaces the need for any of the other four leadership styles ever being used again on the project",
        "Because it's a flexible, situational approach that adjusts to changing project needs, team dynamics and business priorities, rather than applying one fixed approach regardless of context",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a coach who switches between hands-on drilling and stepping back to let players improvise, depending on what that specific game actually needs — not locked into one single coaching style all season.\n\n• The fit: Adaptive/Agile leadership shifts its approach to match the project's changing needs, team dynamics and business priorities, rather than sticking to one fixed style regardless of situation.\n\n• Why the others are wrong: it does carry a real risk (requiring high skill to switch styles effectively), it isn't the same as Laissez-Faire's complete hands-off freedom, and it doesn't eliminate the other styles — it draws on them situationally.\n\nSo the answer is: it flexibly shifts approach to match changing project needs and priorities.",
    },
    {
      type: "match",
      prompt: "Match each leadership style to the strength the lecture pairs it with.",
      pairs: [
        { left: "Transformational", right: "Builds high engagement and adaptability" },
        { left: "Transactional", right: "Clear accountability and discipline" },
        { left: "Autocratic", right: "Fast decisions in emergencies" },
        { left: "Laissez-Faire", right: "Encourages autonomy and innovation" },
      ],
      modelAnswer:
        "Think of four different coaching styles, each with its own clear upside: inspiring new ideas, keeping everyone accountable, deciding fast under pressure, or trusting experts to run with it.\n\n• Transformational builds engagement and adaptability through innovation. Transactional builds discipline through clear structure. Autocratic enables speed in emergencies. Laissez-Faire enables autonomy for skilled professionals.\n\nSo the answer is: each style pairs with its matching strength as listed above.",
    },
    {
      type: "sort",
      prompt:
        "Sort each description into the leadership style it belongs to.",
      groups: ["Transformational", "Transactional", "Autocratic"],
      items: [
        { text: "Encourages innovation and embraces new technology to drive digital transformation", group: 0 },
        { text: "Risk: may overlook operational details", group: 0 },
        { text: "Focuses on structure, rewards and penalties", group: 1 },
        { text: "Risk: can stifle creativity and initiative", group: 1 },
        { text: "The leader makes decisions unilaterally with tight control", group: 2 },
        { text: "Risk: can cause low morale if overused", group: 2 },
      ],
      modelAnswer:
        "Think of three different bosses: one chasing the next big idea, one running a strict rewards system, and one who just makes the call themselves.\n\n• Transformational: embraces innovation, risks missing operational detail. Transactional: runs on rewards and penalties, risks stifling creativity. Autocratic: decides unilaterally, risks low morale if overused.\n\nSo the answer is: each pair of items sorts into its matching style as listed above.",
    },
    {
      type: "mcq",
      prompt:
        "In Agile software development teams specifically, how does the lecture describe the project leader's role?",
      options: [
        "As an autocratic decision-maker who assigns every sprint task directly",
        "As a transactional manager focused mainly on KPI-linked rewards",
        "As someone who stays entirely hands-off regardless of the team's experience level",
        "As a servant and enabler who removes blockers, facilitates communication and helps the team self-organise",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a stage manager backstage clearing obstacles and relaying cues, rather than standing on stage directing every actor's every move.\n\n• The fit: in Scrum or Kanban teams, leaders act as servants and enablers — removing blockers, facilitating communication, and helping the team self-organise.\n\n• Why the others are wrong: this isn't about assigning every task autocratically, it isn't primarily reward-driven, and it isn't a blanket hands-off approach regardless of context.\n\nSo the answer is: a servant and enabler who removes blockers and helps the team self-organise.",
    },
    {
      type: "mcq",
      prompt:
        "In a digital transformation project, what is the project leader's role beyond just delivering the technology itself?",
      options: [
        "Ensuring the project aligns with strategic objectives like improved efficiency or customer experience, and guiding adoption and cultural change across the organisation",
        "Writing all the code personally to guarantee technical quality, rather than delegating development work to the team",
        "Avoiding any contact with end users until the system is fully built and ready to launch, to keep requirements stable",
        "Focusing solely on the technical architecture and infrastructure decisions, leaving adoption entirely to the operations team",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of rolling out a new system at a company: building it is only half the job — getting people to actually trust and use it is the other half.\n\n• The fit: the leader ensures the project aligns with strategic goals like efficiency or customer experience, and actively guides adoption and cultural change across the organisation.\n\n• Why the others are wrong: it isn't about personally writing code, avoiding users undermines adoption entirely, and leaving adoption to someone else ignores the leader's actual role here.\n\nSo the answer is: aligning with strategic objectives and guiding adoption and cultural change.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the lecture argue that strong leadership specifically helps teams in IT projects 'navigate complexity and uncertainty'?",
      options: [
        "Because all project uncertainty is completely eliminated the moment a formal steering committee is put in place and starts meeting regularly",
        "Because IT projects never actually change scope once they've started, regardless of new technology, shifting requirements or stakeholder demands",
        "Because strong leadership entirely replaces the need for any separate formal risk management process to exist on the project at all",
        "Because IT projects face changing technologies, evolving requirements and high uncertainty, and strong leadership helps teams adapt quickly and decide confidently under pressure",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a hiking guide leading a group through fog and shifting terrain — the terrain doesn't become predictable just because a guide is there, but the group navigates it with far more confidence.\n\n• The real reason: IT projects genuinely face changing technology and evolving requirements, and strong leadership is what helps teams adapt quickly and make confident decisions despite that uncertainty.\n\n• Why the others are wrong: forming a steering committee doesn't eliminate uncertainty, scope absolutely can change on IT projects, and leadership works alongside risk management rather than replacing it.\n\nSo the answer is: it helps teams adapt and decide confidently amid real, ongoing uncertainty.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are listed among the 'Essential Skills for Project Leaders' in the lecture? Select all that apply.",
      options: [
        "Communication",
        "Adaptability and Flexibility",
        "Emotional Intelligence",
        "Formal contract law qualification",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of the human skills a good team captain needs versus a credential that belongs to a lawyer's office, not a leader's toolkit.\n\n• Listed skills: communication, adaptability and flexibility, and emotional intelligence are all named essential skills for project leaders.\n\n• Not listed: a formal contract law qualification isn't part of the lecture's essential-skills list.\n\nSo the answer is: communication, adaptability and flexibility, and emotional intelligence.",
    },
    {
      type: "mcq",
      prompt:
        "A cloud infrastructure project leader spends significant time managing cross-functional teams (network, security, developers), handling risk, and adapting plans as technical challenges arise, while keeping stakeholders informed. Which of the 'why leadership matters' reasons does this best illustrate?",
      options: [
        "Aligning the project with business strategy specifically, while deliberately setting team dynamics aside as unimportant",
        "Driving team motivation and performance, by building morale, trust and accountability across diverse roles so the team works as a unit",
        "Reducing wasted effort by avoiding redundant features that nobody in the business actually asked for",
        "Boosting adoption by end-users specifically, rather than by the cross-functional technical teams involved",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of a conductor keeping an orchestra of very different instruments playing together as one piece, not just leaving each section to do its own thing.\n\n• The fit: managing diverse cross-functional teams, handling risk and keeping everyone informed is exactly about driving motivation, trust and accountability so the team works as a unit.\n\n• Why the others are wrong: this scenario isn't specifically about end-user adoption or redundant features, and it clearly involves team dynamics, not strategy to the exclusion of them.\n\nSo the answer is: driving team motivation and performance across diverse roles.",
    },
    {
      type: "mcq",
      prompt:
        "Planning Communication Management is the process of determining the project's communication needs and defining how information will be collected, distributed, stored and managed. In the NSW case, an urgent security issue is routed to the sponsor and security lead immediately via a restricted escalation briefing, while routine progress stays in the weekly report. What does this illustrate about a good communications plan?",
      options: [
        "It matches the audience, channel and urgency to the type of information, rather than sending everything through the same channel regardless of importance",
        "It should always route every type of information, urgent or routine, through the same weekly report for consistency",
        "It only ever applies to security-related information like the escalation briefing, not to routine progress reporting at all",
        "It replaces the need for a project manager to manage the communications process directly once the plan has been written",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a hospital that pages a doctor immediately for a cardiac emergency but leaves routine check-up notes for the weekly chart review — the urgency decides the channel.\n\n• The fit: a good plan matches each piece of information to the right audience, channel and urgency, rather than treating a security emergency the same as routine progress.\n\n• Why the others are wrong: forcing everything through one channel defeats the point, the plan clearly also covers routine progress, and a plan still needs the project manager to actually manage communications day to day.\n\nSo the answer is: it matches audience, channel and urgency to the type of information.",
    },
    {
      type: "fillblank",
      prompt:
        "___ Communications is the process of collecting, creating, distributing, storing and retrieving project information according to the communication management plan.",
      blanks: [["managing", "manage"]],
      modelAnswer:
        "Think of actually carrying out a delivery schedule, not just writing it — someone still has to pack, send and track every parcel.\n\n• The process: this is the second of the three communication processes, where the plan is actually put into action.\n\nSo the answer is: Managing (Manage) Communications.",
    },
    {
      type: "mcq",
      prompt:
        "Monitoring Communications involves reviewing signals like reports arriving late, decisions delayed, questions repeated, and escalations missed. What is the purpose of tracking these specific signals?",
      options: [
        "To calculate the project's total budget variance against the original approved cost baseline",
        "To replace the need for a communication management plan entirely once monitoring activity has begun",
        "To check whether communication is actually supporting decisions, and adjust the audience, channel or timing when it isn't working",
        "To determine which stakeholders should be removed from the project's distribution list entirely going forward",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of checking whether a smoke alarm is actually working by testing it occasionally, rather than just assuming it's fine because it's installed.\n\n• The purpose: these signals reveal whether communication is actually supporting decisions, so the plan's audience, channel or timing can be adjusted when something isn't working.\n\n• Why the others are wrong: this isn't a budget calculation, it doesn't replace the plan (it checks whether the plan is working), and it has nothing to do with removing stakeholders.\n\nSo the answer is: to check whether communication is working and adjust it when it isn't.",
    },
    {
      type: "order",
      prompt: "Order the three processes of Project Communications Management as the lecture presents them.",
      steps: ["Plan Communications Management", "Manage Communications", "Monitor Communications"],
      modelAnswer:
        "Think of planning a delivery route, actually running the deliveries, then checking afterward whether packages are arriving on time.\n\n• Plan decides what's needed and how. Manage actually carries it out. Monitor checks whether it's working and adjusts it.\n\nSo the answer is: Plan Communications Management, then Manage Communications, then Monitor Communications.",
    },
    {
      type: "mcq",
      prompt:
        "In the NSW case's communication-need table, 'Launch readiness' (confirming capacity, support arrangements and user guidance) is communicated through a readiness meeting and launch update, owned by the rollout lead. Why does it matter that this communication need has a specific, named owner rather than being left to 'whoever notices'?",
      options: [
        "Because named ownership is only ever required for security-related communications, not for operational items like launch readiness",
        "Because it removes the need for the launch-readiness communication to go through any defined channel at all",
        "Because without a specific owner, nobody is accountable for making sure launch-readiness information is actually gathered and shared before go-live",
        "Because the rollout lead is the only person on the project legally allowed to discuss launch readiness with anyone",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a group project where everyone assumes 'someone' will book the venue — if nobody is specifically named, it's entirely possible nobody actually does it.\n\n• The real reason: naming an owner means one person is actually accountable for gathering and sharing launch-readiness information before go-live, so it doesn't quietly fall through the cracks.\n\n• Why the others are wrong: named ownership applies across all four communication needs in the table, not just security, it doesn't remove the channel requirement, and it isn't about legal permission to discuss the project.\n\nSo the answer is: without a named owner, nobody is accountable for making sure it actually happens.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are genuine objectives of Monitoring Communications, per the lecture? Select all that apply.",
      options: [
        "Monitor communication effectiveness",
        "Identify gaps and issues",
        "Ensure compliance and standards",
        "Set communication frequency and timing",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of which tasks belong to checking a system afterward versus which belong to designing it beforehand.\n\n• Monitoring objectives: checking effectiveness, spotting gaps and issues, and ensuring compliance and standards.\n\n• Not a monitoring objective: setting communication frequency and timing is actually a Planning objective, decided before anything is sent out.\n\nSo the answer is: monitor effectiveness, identify gaps and issues, and ensure compliance and standards.",
    },
    {
      type: "mcq",
      prompt:
        "IT Project Governance is defined as 'the framework of policies, roles, responsibilities, processes and decision-making structures that guide, monitor and control IT projects.' What does it ensure, per the lecture?",
      options: [
        "That every single project decision is made exclusively by the project sponsor, with no other role involved",
        "That projects never require any further oversight at all once the project charter has been formally signed",
        "That governance completely replaces the need for project leadership once it has been properly established",
        "That projects are aligned with organisational objectives, comply with standards, manage risks, and deliver value",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a company's financial controls: not one single person approving everything, but a framework that keeps spending accountable and connected to the company's actual goals.\n\n• The fit: governance ensures projects stay aligned with organisational objectives, comply with standards, manage risk, and deliver value.\n\n• Why the others are wrong: decisions aren't made by the sponsor alone, oversight is ongoing rather than ending at charter sign-off, and governance works alongside leadership rather than replacing it.\n\nSo the answer is: it ensures alignment, compliance, risk management and value delivery.",
    },
    {
      type: "mcq",
      prompt:
        "A Steering Committee is typically composed of the Project Sponsor, senior business representatives, IT/technical leads, and finance/PMO representatives. What is its core function, distinct from the PMO's?",
      options: [
        "It performs the detailed technical development work itself, in place of the developers actually assigned to the project team",
        "It exists solely to approve individual staff members' annual leave requests across the whole organisation's departments",
        "It replaces the project manager's day-to-day responsibilities entirely, taking over task assignment and scheduling directly",
        "It acts as the senior decision-making body that provides strategic guidance and resolves escalated issues, rather than standardising day-to-day project processes",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a company's board of directors versus its internal operations department — the board sets direction and resolves the big calls, while operations runs the daily standardised processes.\n\n• The fit: the Steering Committee is the senior decision-making body providing strategic guidance and resolving escalated issues — different from the PMO, which standardises day-to-day practices.\n\n• Why the others are wrong: it doesn't do the technical development work itself, it isn't about staff leave, and it doesn't take over the project manager's day-to-day role.\n\nSo the answer is: it's the senior decision-making body, distinct from the PMO's process-standardising role.",
    },
    {
      type: "mcq",
      prompt:
        "Which of these is one of the Steering Committee's main responsibilities, per the lecture's list?",
      options: [
        "Writing the project's detailed technical architecture documents",
        "Performing the independent cybersecurity testing personally",
        "Approving the project charter and business case, and confirming benefits realisation",
        "Handling the team's day-to-day task assignments",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a board of directors signing off on a company's big strategic bets and later checking whether those bets actually paid off — not drafting the engineering blueprints themselves.\n\n• The fit: approving the charter and business case, and confirming benefits realisation, are explicitly listed as Steering Committee responsibilities.\n\n• Why the others are wrong: technical architecture, hands-on testing and day-to-day task assignment are operational work, not strategic governance responsibilities.\n\nSo the answer is: approving the charter and business case, and confirming benefits realisation.",
    },
    {
      type: "mcq",
      prompt:
        "A PMO is described as 'a centralized organizational unit... that standardizes project management practices, provides governance support, and ensures projects align with business strategy.' How does this differ from a Steering Committee's role?",
      options: [
        "The PMO provides ongoing, cross-project standardisation, tools, training and performance monitoring, while the Steering Committee provides project-specific strategic decision-making authority",
        "They are simply two different names used by different organisations for exactly the same underlying governance role, with no real difference in scope",
        "The PMO only exists in public-sector organisations, and private-sector companies never set one up to support their IT projects at all",
        "The Steering Committee formally reports to the PMO as its direct line manager within the organisation's overall management structure",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a company's central training-and-standards department versus a specific project's own senior oversight group — one keeps every project consistent, the other steers one project's big decisions.\n\n• The fit: the PMO works across projects, standardising practices, tools, training and monitoring, while the Steering Committee provides strategic decision-making authority for its own specific project.\n\n• Why the others are wrong: they are distinct roles with different scopes, the PMO is common in private-sector organisations too, and there's no reporting line making the Steering Committee subordinate to the PMO.\n\nSo the answer is: the PMO standardises across projects; the Steering Committee decides strategically for its own project.",
    },
    {
      type: "fillblank",
      prompt:
        "A Project Sponsor provides ___, granting the project manager the ability to execute plans and secure resources.",
      blanks: [["authority"]],
      modelAnswer:
        "Think of a company director formally signing off so a manager can actually spend the budget and direct staff, rather than just having good ideas with no backing.\n\n• The mechanism: the sponsor's standing grants the project manager real authority to execute plans and secure resources.\n\nSo the answer is: authority.",
    },
    {
      type: "multi",
      prompt: "Which of the following are genuine functions of a PMO, per the lecture? Select all that apply.",
      options: [
        "Governance support for project teams",
        "Performance monitoring across active projects",
        "Training and mentoring of project staff",
        "Approving the organisation's total annual IT budget",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of a central standards office that supports every project team, tracks how projects are doing, and trains staff — versus the much bigger job of setting the whole organisation's annual budget.\n\n• Genuine PMO functions: governance support, performance monitoring, and training and mentoring are all explicitly listed.\n\n• Not a PMO function: approving the organisation's entire annual IT budget sits above what the PMO is described as doing.\n\nSo the answer is: governance support, performance monitoring, and training and mentoring.",
    },
    {
      type: "mcq",
      prompt:
        "A project introduces formal checkpoints at key milestones to approve progress, deliverables and resource allocation before work continues. Which governance mechanism is this?",
      options: [
        "Performance reporting and dashboards",
        "Risk and issue escalation procedures",
        "Decision-making frameworks",
        "Stage-Gate / Phase-Gate reviews",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a building project that can't move to the next floor until an inspector signs off on the current one — a formal checkpoint before work continues.\n\n• The fit: formal checkpoints at key milestones, approving progress and resource allocation before continuing, is exactly what Stage-Gate/Phase-Gate reviews are.\n\n• Why the others are wrong: dashboards provide ongoing visibility rather than discrete checkpoints, escalation procedures handle problems as they arise, and decision frameworks define who decides, not when a checkpoint happens.\n\nSo the answer is: Stage-Gate / Phase-Gate reviews.",
    },
    {
      type: "mcq",
      prompt:
        "A project has ambiguity in decision-making and accountability. Per the lecture's 'Common Governance challenges,' what does this directly lead to?",
      options: [
        "Automatically higher project costs, regardless of any other factor or how the ambiguity is actually resolved",
        "Immediate project cancellation by the steering committee the moment the ambiguity is first noticed",
        "Confusion, delays and finger-pointing, including critical decisions being delayed and stakeholders not knowing whom to approach for approvals",
        "A mandatory switch to an Autocratic leadership style imposed by the project sponsor to force a decision",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of an office where nobody's sure who actually has to sign off on a purchase — requests just bounce around unanswered while everyone assumes someone else will handle it.\n\n• The real consequence: ambiguous decision-making and accountability leads to confusion, delays and finger-pointing, with stakeholders unsure whom to approach for approvals.\n\n• Why the others are wrong: it doesn't automatically raise costs on its own, it doesn't trigger automatic cancellation, and it has no connection to forcing a particular leadership style.\n\nSo the answer is: confusion, delays and finger-pointing from unclear accountability.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: per the lecture's best practices, governance mechanisms should be treated as a separate activity from daily project operations, kept distinct to avoid interference.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "Think of trying to keep 'safety checks' completely separate from the actual work on a construction site — in practice, good safety is woven into every task, not bolted on afterward.\n\n• Why it's false: the lecture's best practice is the opposite — integrate governance into daily operations rather than treating it as a separate activity.\n\nSo the answer is: false.",
    },
    {
      type: "multi",
      prompt:
        "Which of the following are listed among the 'Common Governance challenges' in the lecture? Select all that apply.",
      options: [
        "Key stakeholders not involved or informed sufficiently, causing misalignment and low adoption of IT systems",
        "Project information that isn't timely, accurate or clear, leading to misunderstood requirements",
        "Teams or stakeholders resisting governance processes, causing delays and reduced compliance",
        "Having too many formally documented decisions and approvals, which the lecture frames as a governance strength rather than a challenge",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of the real failure modes a project actually runs into — people left out of the loop, confusing information, and pushback on process — versus a problem that isn't actually listed at all.\n\n• Genuine challenges: insufficient stakeholder involvement, unclear/untimely information, and resistance to governance processes are all named in the lecture.\n\n• Not listed: having too many documented decisions isn't one of the challenges — too little clarity and documentation is closer to the actual problem described.\n\nSo the answer is: the first three challenges listed.",
    },
    {
      type: "match",
      prompt: "Match each governance mechanism to what it actually provides.",
      pairs: [
        { left: "Stage-Gate / Phase-Gate reviews", right: "Formal checkpoints at key milestones to approve progress and resource allocation" },
        { left: "Performance reporting and dashboards", right: "Visibility into budget, schedule, scope, risk and quality metrics" },
        { left: "Risk and issue escalation procedures", right: "Defines how risks and issues are reported, evaluated and resolved" },
        { left: "Audits and reviews", right: "Independent checks ensuring compliance, quality and alignment with governance standards" },
      ],
      modelAnswer:
        "Think of four different ways a project keeps itself honest: scheduled checkpoints, an always-on dashboard, a defined path for raising problems, and an outside inspector dropping in.\n\n• Each mechanism pairs with its own distinct purpose, from milestone approval to ongoing visibility to problem escalation to independent compliance checks.\n\nSo the answer is: each mechanism matches the description listed above.",
    },
    {
      type: "mcq",
      prompt:
        "A project delivers a technically excellent system, but it does not support the organisation's long-term mission or goals. Which dimension of alignment is missing?",
      options: ["Team Alignment", "Stakeholder Alignment", "Business-IT Alignment", "Strategic Alignment"],
      correctIndex: 3,
      modelAnswer:
        "Think of a beautifully built addition to a house that has nothing to do with what the family actually needed the extra space for.\n\n• The fit: Strategic Alignment is specifically about the project supporting the organisation's long-term goals, mission and vision — exactly what's missing here.\n\n• Why the others are wrong: Team Alignment is about shared understanding within the team, Stakeholder Alignment is about managing expectations, and Business-IT Alignment is about delivering real business value from IT outputs — none of these is the specific 'long-term mission' gap described.\n\nSo the answer is: Strategic Alignment.",
    },
    {
      type: "mcq",
      prompt:
        "An IT project delivers working software, but the system produces no real business value — a technical success that doesn't actually help the organisation. Which dimension of alignment does this failure best illustrate?",
      options: [
        "Business-IT Alignment — IT solutions must deliver real business value, not just technical outputs",
        "Team Alignment — the team must share a common understanding of objectives, roles and priorities",
        "Strategic Alignment — the project must support the organisation's long-term mission, vision and goals",
        "Stakeholder Alignment — executive, user and regulator expectations must be properly managed",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a beautifully engineered machine that technically works perfectly but doesn't actually solve the problem it was built for.\n\n• The fit: Business-IT Alignment is specifically about IT solutions delivering real business value, not just technical outputs — exactly the gap described here.\n\n• Why the others are wrong: this isn't about the team's shared understanding, the organisation's long-term mission, or managing stakeholder expectations — it's specifically about IT output failing to translate into business value.\n\nSo the answer is: Business-IT Alignment.",
    },
    {
      type: "match",
      prompt: "Match each Strategic Alignment Model (SAM) domain to its description.",
      pairs: [
        { left: "Business strategy", right: "Defines the company's vision, goals, competitive positioning and market approach" },
        { left: "IT strategy", right: "How IT will support or enable the business strategy, covering technology scope, IT governance and competencies" },
        { left: "Organisational infrastructure and processes", right: "Structure, roles, decision-making processes and capabilities of the business" },
        { left: "IT infrastructure and processes", right: "Hardware, software, networks, applications and IT capabilities" },
      ],
      modelAnswer:
        "Think of a company split into four quadrants: what the business wants, how IT supports it, how the business itself is organised, and what IT is physically built on.\n\n• Business strategy sets the vision and market approach. IT strategy sets how technology enables that vision. Organisational infrastructure covers the business's own structure and roles. IT infrastructure covers the actual hardware, software and systems.\n\nSo the answer is: each domain pairs with its description as listed above.",
    },
    {
      type: "multi",
      prompt: "Per the lecture's 'Why alignment matters' list, which of the following are genuine benefits of alignment? Select all that apply.",
      options: [
        "Maximizes business value by delivering outcomes that directly support organisational objectives",
        "Reduces wasted effort by preventing teams from building features that aren't useful to the business",
        "Boosts adoption, since users are more likely to embrace systems that align with their needs and workflows",
        "Guarantees the project will finish under budget regardless of scope changes",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of the real, reasonable payoffs of being well-aligned versus an unrealistic promise no framework can actually guarantee.\n\n• Genuine benefits: maximising business value, reducing wasted effort, and boosting adoption are all explicitly listed reasons alignment matters.\n\n• Not a genuine benefit: no framework can guarantee a project finishes under budget regardless of scope changes — that overstates what alignment actually delivers.\n\nSo the answer is: maximising value, reducing wasted effort, and boosting adoption.",
    },
    {
      type: "mcq",
      prompt:
        "The Strategic Alignment Model (SAM) identifies 'Strategic Fit' and 'Functional Integration' as its two main dimensions. Which pairing correctly describes Functional Integration?",
      options: [
        "External business environment linked to external IT environment only",
        "Organisational structure linked only to internal IT infrastructure, with no strategy component",
        "Business strategy linked to IT strategy, and business infrastructure linked to IT infrastructure",
        "Financial perspective linked to customer perspective",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of two gears that need to mesh properly: the company's strategic gear turning in sync with IT's strategic gear, and the company's day-to-day operating gear turning in sync with IT's operating gear.\n\n• The fit: Functional Integration links business strategy with IT strategy, and business infrastructure with IT infrastructure — the two 'horizontal' connections in SAM.\n\n• Why the others are wrong: external-to-external pairing and structure-to-infrastructure-only pairing both describe Strategic Fit's internal/external dimension instead, and the financial/customer pairing belongs to the Balanced Scorecard, not SAM.\n\nSo the answer is: business strategy linked to IT strategy, and business infrastructure linked to IT infrastructure.",
    },
    {
      type: "mcq",
      prompt:
        "SAM identifies four domains: Business strategy, IT strategy, Organisational infrastructure and processes, and IT infrastructure and processes. Which domain 'defines the company's vision, goals, competitive positioning and market approach'?",
      options: [
        "IT infrastructure and processes",
        "Organisational infrastructure and processes",
        "IT strategy",
        "Business strategy",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of the very top-level question a company's leadership asks: what are we trying to achieve, and how do we want to compete in our market?\n\n• The fit: Business strategy is the domain that defines the company's vision, goals, competitive positioning and market approach.\n\n• Why the others are wrong: IT strategy is about how technology enables that vision, organisational infrastructure is about internal structure and roles, and IT infrastructure is about the physical technology itself.\n\nSo the answer is: Business strategy.",
    },
    {
      type: "multi",
      prompt: "Which of the following are among the Balanced Scorecard's four perspectives? Select all that apply.",
      options: [
        "Financial perspective",
        "Customer perspective",
        "Internal Business Process perspective",
        "Vendor Cost perspective",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of four different lenses for checking on a company's health: money, customers, internal operations, and the ability to keep improving — not a lens specifically about vendor costs.\n\n• The real four: Financial, Customer, Internal Business Process, and Learning and Growth.\n\n• Not one of the four: 'Vendor Cost perspective' isn't one of the Balanced Scorecard's named perspectives.\n\nSo the answer is: Financial, Customer, and Internal Business Process perspectives.",
    },
    {
      type: "order",
      prompt:
        "Order these Balanced Scorecard questions from the Financial Perspective through to the Learning and Growth Perspective, as the lecture presents them.",
      steps: [
        "How do we look to shareholders? (Financial)",
        "How do customers see us? (Customer)",
        "What must we excel at? (Internal Business Process)",
        "Can we continue to improve and create value? (Learning and Growth)",
      ],
      modelAnswer:
        "Think of checking a company's health in four passes: first the money, then how customers feel, then how smoothly things run internally, then whether the company can keep getting better.\n\n• Financial asks about shareholders, Customer asks about customer perception, Internal Business Process asks what must be excelled at, and Learning and Growth asks about continuous improvement.\n\nSo the answer is: Financial, then Customer, then Internal Business Process, then Learning and Growth.",
    },
    {
      type: "mcq",
      prompt:
        "Per the 'Integrating Leadership, Governance and Alignment' section, what happens specifically 'without governance,' even if leadership and alignment are both strong?",
      options: [
        "Projects face scope creep, poor accountability and unmanaged risks",
        "Projects automatically fail to secure a budget",
        "Teams lose all motivation immediately",
        "The project's strategic fit with the business disappears entirely",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a well-motivated, well-aimed road trip with absolutely no map, no agreed rules about who decides the route, and nobody checking the fuel gauge — good intentions alone don't stop the trip from sprawling out of control.\n\n• The real consequence: without governance specifically, projects face scope creep, poor accountability and unmanaged risks, even when leadership and alignment are strong.\n\n• Why the others are wrong: budget approval, motivation and strategic fit are the specific territories of governance, leadership and alignment respectively — governance's own gap is scope creep, accountability and risk.\n\nSo the answer is: scope creep, poor accountability and unmanaged risks.",
    },
    {
      type: "mcq",
      prompt:
        "In the SmartCampus Project case study, the project manager is described as 'technically skilled but poor at motivating the team or engaging academic staff,' causing communication to break down. Which of the triad's three pillars does this failure sit under?",
      options: ["Governance", "Alignment", "Leadership", "Stakeholder risk management"],
      correctIndex: 2,
      modelAnswer:
        "Think of a highly skilled engineer put in charge of a team who can design anything but can't get the team excited or talking to each other.\n\n• The fit: motivating the team and engaging stakeholders is exactly what Leadership covers, so a failure to do either sits squarely under this pillar.\n\n• Why the others are wrong: this isn't about missing decision structures (Governance) or technology not supporting strategy (Alignment), and 'stakeholder risk management' isn't one of the three triad pillars.\n\nSo the answer is: Leadership.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: in the SmartCampus case study, the project's governance failure is that privacy compliance was considered too late and there was no clear steering committee or decision-making structure.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "Think of a building project that starts construction before anyone checks the safety code, and where nobody is actually in charge of approving design changes.\n\n• Why it's true: the case study explicitly describes exactly this — no clear steering committee or decision-making structure, and privacy compliance considered too late.\n\nSo the answer is: true.",
    },
    {
      type: "multi",
      prompt:
        "In the SmartCampus Project case study, which of the following are given as examples of the project's alignment problem specifically? Select all that apply.",
      options: [
        "IT focused on 'cool features' like gamification",
        "These features didn't support the university's actual strategy of improving student retention",
        "The project manager lacked motivational and communication skills",
        "There was no clear steering committee",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "Think of sorting the case study's three different kinds of trouble into their correct bucket: the tech team chasing flashy extras that don't serve the real goal is an alignment problem, while a manager who can't motivate people and a missing committee are different problems entirely.\n\n• Alignment problem: IT building 'cool features' like gamification that don't support the university's actual retention strategy.\n\n• Not alignment: the manager's weak motivational skills is the Leadership problem, and the missing steering committee is the Governance problem.\n\nSo the answer is: the gamification example and the strategy-mismatch example.",
    },
  ],
};

const FINAL_EXAM_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 9,
  paperNumber: 3,
  title: "Week 9 Practice Paper — Final Exam Style",
  topics:
    "A closed-book style essay paper matching the Final Exam's stated format: 4 essay questions, each with 3-4 parts, each built around a brief scenario that can draw on any topic from any lecture or tutorial. Centres on Week 9 (leadership styles and leader vs manager, IT governance roles — Steering Committee, PMO, Project Sponsor — and governance mechanisms, Communication Management's Plan/Manage/Monitor processes, alignment's four dimensions, and alignment frameworks — Strategic Alignment Model, Balanced Scorecard, Agile Value Streams), deliberately combined with: Week 1 (the Triple Constraint, stakeholder identification); Week 2 (the Power/Interest Grid, Scrum roles); Week 3 (Critical Path Method); Week 4 (Earned Value Management — CPI and SPI); Week 6/7 (resource leveling, Herzberg's two-factor motivation theory); Week 7/8 (risk response strategies); and Week 8 (Make-or-Buy analysis, outsourcing). Each question combines a Week 9 concept with a concept from at least one earlier week, the way the real cumulative final exam is described as doing.",
  sourceFiles: [
    "lecture/Lecture - INFO6007 Week 09 - Project Leadership, Governance and Alignment.pdf",
    "tutorial/Tutorial sheet - INFO6007 Week 09.pdf",
    "exam-content/info6007/week-1.ts",
    "exam-content/info6007/week-2.ts",
    "exam-content/info6007/week-3.ts",
    "exam-content/info6007/week-4.ts",
    "exam-content/info6007/week-6.ts",
    "exam-content/info6007/week-7.ts",
    "exam-content/info6007/week-8.ts",
  ],
  questions: [
    {
      type: "scenario",
      prompt:
        "Scenario: Riverside Water Authority is running a digital transformation project to replace its paper-based meter-reading process with a mobile app for field technicians. The project sponsor is the Chief Operating Officer. The project manager, who has a strong technical background, is leading a highly skilled, self-organising Agile development team, but has also set up a habit of personally approving every single code change before it merges, even small ones, and rarely asks the team for input on technical decisions. Three months in, the Steering Committee approves a request from the regulator-facing compliance team to add a new audit-trail feature, without adjusting the project's budget or four-month deadline. Meanwhile, the utility's water-quality regulator — who has significant power to halt the rollout but has shown little day-to-day interest in the project — has not been actively engaged, and nobody has specifically been assigned to keep communication flowing to them.\n\n(a) Which leadership style is the project manager actually using, and why is it a poor fit for this particular team? Recommend a better-fitting style and explain why it suits a highly skilled, self-organising Agile team.",
      modelAnswer:
        "Think of a head chef who insists on personally tasting and approving every single ingredient a team of award-winning cooks chops, even the onions — talented cooks start to feel untrusted and slow down waiting for sign-off instead of just cooking.\n\n• The style in use: this is an Autocratic style — the project manager decides unilaterally and keeps tight control, down to approving every small code change alone.\n\n• Why it's a poor fit: Autocratic leadership is suited to fast decisions in emergencies, but used on a highly skilled, self-organising team it risks low morale and a lack of team input, which wastes the exact expertise the team already has.\n\n• The better fit: a Laissez-Faire or Adaptive/Agile style suits this team far better, since Laissez-Faire gives freedom to highly skilled professionals and encourages autonomy and innovation, while Adaptive/Agile would let the manager flex control only where it's genuinely needed and step back everywhere else.\n\nSo the answer is: the manager is using an Autocratic style, which suppresses a skilled Agile team's own judgement — a Laissez-Faire or Adaptive/Agile style would fit this team much better.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Riverside Water Authority is running a digital transformation project to replace its paper-based meter-reading process with a mobile app for field technicians. The project sponsor is the Chief Operating Officer. The project manager, who has a strong technical background, is leading a highly skilled, self-organising Agile development team, but has also set up a habit of personally approving every single code change before it merges, even small ones, and rarely asks the team for input on technical decisions. Three months in, the Steering Committee approves a request from the regulator-facing compliance team to add a new audit-trail feature, without adjusting the project's budget or four-month deadline. Meanwhile, the utility's water-quality regulator — who has significant power to halt the rollout but has shown little day-to-day interest in the project — has not been actively engaged, and nobody has specifically been assigned to keep communication flowing to them.\n\n(b) Using the Triple Constraint, explain what the Steering Committee's decision to add the audit-trail feature actually does to the project, and why approving it without adjusting budget or deadline is not a realistic position for the Steering Committee to leave unresolved.",
      modelAnswer:
        "Picture scope, time and cost as three corners of a triangle tied together with rubber bands — pull harder on one corner and the others inevitably stretch, whether anyone admits it or not.\n\n• What the approval does: adding the audit-trail feature grows the project's scope corner, since new work now has to be built that wasn't in the original plan.\n\n• Why the committee's position doesn't hold: the Steering Committee has the authority to approve major changes, but approving extra scope while leaving the four-month deadline and budget untouched ignores that the triangle's corners are locked together — if neither time nor cost is allowed to move, the pressure usually ends up quietly squeezing quality instead, which is exactly the kind of risk good governance is supposed to catch and manage, not let slide.\n\n• What should have happened instead: the Steering Committee should have required an explicit budget or deadline adjustment as a condition of approving the new scope, not approved the change and left the trade-off unaddressed.\n\nSo the answer is: the audit-trail feature grows scope, and since neither time nor cost was adjusted to absorb it, the Steering Committee has left an unmanaged trade-off that will most likely surface as a quality or deadline problem later.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Riverside Water Authority is running a digital transformation project to replace its paper-based meter-reading process with a mobile app for field technicians. The project sponsor is the Chief Operating Officer. The project manager, who has a strong technical background, is leading a highly skilled, self-organising Agile development team, but has also set up a habit of personally approving every single code change before it merges, even small ones, and rarely asks the team for input on technical decisions. Three months in, the Steering Committee approves a request from the regulator-facing compliance team to add a new audit-trail feature, without adjusting the project's budget or four-month deadline. Meanwhile, the utility's water-quality regulator — who has significant power to halt the rollout but has shown little day-to-day interest in the project — has not been actively engaged, and nobody has specifically been assigned to keep communication flowing to them.\n\n(c) Using the Power/Interest Grid, classify the water-quality regulator and explain which alignment dimension is most directly at risk from failing to engage them.",
      modelAnswer:
        "Think of a landlord who rarely visits your rented apartment but holds the one key that can shut the whole building down — low day-to-day interest doesn't mean low importance.\n\n• The Power/Interest classification: the regulator has high power (they can halt the rollout) but low day-to-day interest, which places them in the 'Keep Satisfied' quadrant — someone to manage carefully even without constant attention, rather than someone to merely keep informed.\n\n• The alignment dimension at risk: this threatens Stakeholder Alignment specifically, since that dimension is about properly managing and satisfying the expectations of groups like regulators — ignoring a high-power regulator because they seem quiet now risks a sudden, project-halting intervention later.\n\nSo the answer is: the regulator sits in the 'Keep Satisfied' quadrant, and failing to engage them puts Stakeholder Alignment at risk.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Riverside Water Authority is running a digital transformation project to replace its paper-based meter-reading process with a mobile app for field technicians. The project sponsor is the Chief Operating Officer. The project manager, who has a strong technical background, is leading a highly skilled, self-organising Agile development team, but has also set up a habit of personally approving every single code change before it merges, even small ones, and rarely asks the team for input on technical decisions. Three months in, the Steering Committee approves a request from the regulator-facing compliance team to add a new audit-trail feature, without adjusting the project's budget or four-month deadline. Meanwhile, the utility's water-quality regulator — who has significant power to halt the rollout but has shown little day-to-day interest in the project — has not been actively engaged, and nobody has specifically been assigned to keep communication flowing to them.\n\n(d) Using the Plan, Manage and Monitor Communications processes, explain what the project manager should set up now to fix the regulator-engagement gap, and how Monitor Communications specifically would have caught this problem earlier.",
      modelAnswer:
        "Think of a lighthouse keeper who has a different signal for ships passing close by versus ships far out at sea, and who regularly checks whether distant ships are actually seeing the signal at all, not just assuming they are.\n\n• Plan Communications Management: the project manager should decide specifically what the regulator needs to hear, who sends it, through which channel, and how often — for a high-power, low-interest stakeholder this is usually a lighter-touch but still deliberate update, not silence.\n\n• Manage Communications: someone must then actually be assigned to create and send that update to the regulator on the agreed schedule, rather than leaving it to happen informally or not at all.\n\n• Monitor Communications: this process exists specifically to check whether communication is reaching people and supporting decisions, by reviewing things like unanswered questions and stakeholders who've gone quiet — regularly monitoring would have flagged that the regulator had no assigned contact or channel at all, long before it became a live risk.\n\nSo the answer is: plan a specific, assigned update channel for the regulator, manage it by actually sending those updates, and Monitor Communications is the process that would have caught the missing assignment early.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Vantage Insurance is building a new fraud-detection module. The module has strict, stable regulatory requirements, and Vantage's in-house developers have no fraud-detection expertise. Partway into the project, the Project Management Office (PMO) flags that the fraud-detection vendor contract carries a 25% chance of a $200,000 integration failure if the vendor's API doesn't match Vantage's core system, which would require costly rework. At the project's mid-point review, the numbers show Planned Value of $300,000, Earned Value of $300,000 and Actual Cost of $300,000 — exactly on budget and on schedule — yet the development team has grown increasingly frustrated because the project sponsor has been essentially invisible since kickoff, never attending steering committee meetings, and the resulting fraud-detection dashboard, while technically flawless, surfaces alerts in a format that the fraud-investigation business unit says doesn't fit how they actually work.\n\n(a) Using Make-or-Buy reasoning, recommend build or buy for the fraud-detection module, and explain the Project Management Office's (PMO) governance role in how this decision gets reviewed and tracked.",
      modelAnswer:
        "Think of ordering a specialised dish from a restaurant that already perfected the recipe, rather than trying to invent it from scratch in a kitchen that's never cooked anything like it before.\n\n• Build or buy: Vantage should buy the fraud-detection module rather than build it — the requirements are strict and stable, which removes the main reason to build something custom, and the in-house team has no fraud-detection expertise, meaning building it internally would add both skill risk and delivery risk.\n\n• The PMO's governance role: the Project Management Office standardises project management practices and provides governance support, performance monitoring, and risk/issue management — here that's exactly why it's the PMO flagging the vendor integration risk, acting as the bridge between the project team, leadership and stakeholders rather than leaving the risk unnoticed inside the vendor contract.\n\nSo the answer is: buy the fraud-detection module, with the PMO providing the governance oversight and risk tracking that surfaces issues like the vendor integration risk.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Vantage Insurance is building a new fraud-detection module. The module has strict, stable regulatory requirements, and Vantage's in-house developers have no fraud-detection expertise. Partway into the project, the Project Management Office (PMO) flags that the fraud-detection vendor contract carries a 25% chance of a $200,000 integration failure if the vendor's API doesn't match Vantage's core system, which would require costly rework. At the project's mid-point review, the numbers show Planned Value of $300,000, Earned Value of $300,000 and Actual Cost of $300,000 — exactly on budget and on schedule — yet the development team has grown increasingly frustrated because the project sponsor has been essentially invisible since kickoff, never attending steering committee meetings, and the resulting fraud-detection dashboard, while technically flawless, surfaces alerts in a format that the fraud-investigation business unit says doesn't fit how they actually work.\n\n(b) Classify the 25% chance, $200,000 vendor integration risk as positive or negative, recommend a response strategy, and name the governance mechanism that should have formally brought this risk to the Steering Committee's attention.",
      modelAnswer:
        "Think of a pothole 25% likely to be hiding under the road ahead — not a certainty, but one you'd still rather deal with before driving over it blind.\n\n• Classifying the risk: this is a negative risk, a threat — a 25% chance of a $200,000 integration failure if the vendor's API doesn't match Vantage's core system.\n\n• The response strategy: mitigate the risk, for example by running an early technical compatibility test between the vendor's API and Vantage's core system before full integration begins, to reduce the chance or shrink the impact if it does happen.\n\n• The governance mechanism: a risk and issue escalation procedure is specifically the governance mechanism meant to carry a flagged risk like this one up to the Steering Committee for visibility and decision-making, rather than letting it sit only with the PMO or the project team.\n\nSo the answer is: this is a negative risk to mitigate with early compatibility testing, and a risk escalation procedure is the mechanism that should carry it to the Steering Committee.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Vantage Insurance is building a new fraud-detection module. The module has strict, stable regulatory requirements, and Vantage's in-house developers have no fraud-detection expertise. Partway into the project, the Project Management Office (PMO) flags that the fraud-detection vendor contract carries a 25% chance of a $200,000 integration failure if the vendor's API doesn't match Vantage's core system, which would require costly rework. At the project's mid-point review, the numbers show Planned Value of $300,000, Earned Value of $300,000 and Actual Cost of $300,000 — exactly on budget and on schedule — yet the development team has grown increasingly frustrated because the project sponsor has been essentially invisible since kickoff, never attending steering committee meetings, and the resulting fraud-detection dashboard, while technically flawless, surfaces alerts in a format that the fraud-investigation business unit says doesn't fit how they actually work.\n\n(c) Calculate CPI and SPI from the figures given, and explain why these numbers alone do not mean the project is actually succeeding.",
      modelAnswer:
        "Think of a report card showing perfect attendance and perfectly on-time homework, while completely missing whether the student actually understood any of the material.\n\n• CPI: CPI equals earned value divided by actual cost, so $300,000 ÷ $300,000 = 1.0 — exactly on budget.\n\n• SPI: SPI equals earned value divided by planned value, so $300,000 ÷ $300,000 = 1.0 — exactly on schedule.\n\n• Why that's not the whole story: CPI and SPI only measure whether the planned work is being delivered on time and on budget — they say nothing about whether that work is the right work. Here the dashboard is technically flawless and on track, but it doesn't fit how the fraud-investigation unit actually works, which is a Business-IT Alignment problem, not a cost or schedule problem, so a perfect CPI and SPI can sit right alongside a project that still fails to deliver real business value.\n\nSo the answer is: CPI = 1.0 and SPI = 1.0, both perfect, but they don't catch the Business-IT Alignment gap causing the dashboard to not actually fit the business unit's needs.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Vantage Insurance is building a new fraud-detection module. The module has strict, stable regulatory requirements, and Vantage's in-house developers have no fraud-detection expertise. Partway into the project, the Project Management Office (PMO) flags that the fraud-detection vendor contract carries a 25% chance of a $200,000 integration failure if the vendor's API doesn't match Vantage's core system, which would require costly rework. At the project's mid-point review, the numbers show Planned Value of $300,000, Earned Value of $300,000 and Actual Cost of $300,000 — exactly on budget and on schedule — yet the development team has grown increasingly frustrated because the project sponsor has been essentially invisible since kickoff, never attending steering committee meetings, and the resulting fraud-detection dashboard, while technically flawless, surfaces alerts in a format that the fraud-investigation business unit says doesn't fit how they actually work.\n\n(d) Identify which part of the Project Sponsor's role is missing in this scenario, and recommend one Herzberg-based leadership action to address the team's resulting frustration.",
      modelAnswer:
        "Think of a sports team whose official owner never shows up to a single game, never backs the coach's calls publicly, and leaves the players feeling like nobody senior actually cares whether they win.\n\n• The missing sponsor role: the Project Sponsor is meant to champion the project, provide resources, and hold ultimate accountability for its success, including helping the project manager navigate risks beyond their own authority — by never attending Steering Committee meetings, this sponsor is failing to visibly champion the project or back the team, leaving it to feel unsupported from above.\n\n• The Herzberg-based fix: applying Herzberg's two-factor theory, the team's frustration points to missing motivators, like recognition and a sense that the work matters to leadership, rather than a hygiene-factor problem like pay or conditions — a concrete action is for the project manager to push for the sponsor to personally recognise the team's technical delivery in a visible way, such as a steering committee shout-out, rather than hoping silent senior support is enough.\n\nSo the answer is: the sponsor is failing to champion the project and back the team visibly, and the fix is a motivator-focused action such as visible senior recognition of the team's work.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Meridian Health Network is rolling out a patient-facing appointment portal. Two testers on the quality assurance team are each booked for 45 hours of testing next week against only 30 hours of real availability, while a third tester has just 8 hours booked against 30 hours available. Leadership wants to track four separate measures of the portal's success: whether it actually reduces patients' average appointment wait time, whether clinical staff feel the new booking workflow has made their jobs easier, whether the finance team sees reduced no-show-related revenue loss, and whether the technical team can keep shipping portal updates without growing technical debt. Separately, a hospital department head with significant influence over clinical staff adoption, but who has shown little interest in attending project meetings, has not been actively consulted, and a known data-entry bug is costing the help desk $15,000 a month in support calls, which a one-time $1,500 fix to the validation logic would eliminate.\n\n(a) Identify the resource imbalance among the three testers, and explain the fix using the resource leveling technique.",
      modelAnswer:
        "Picture three couriers sharing one delivery run — two of them are handed far more parcels than they can realistically carry in a shift, while the third drives around nearly empty.\n\n• The imbalance: the two testers booked for 45 hours against only 30 hours of real availability are over-allocated, while the third tester, booked for just 8 hours against 30 available, has plenty of spare capacity sitting unused.\n\n• The fix: resource leveling means adjusting the schedule so demand doesn't exceed what people can actually deliver — here that means shifting some of the excess testing hours from the two overloaded testers onto the underused third tester's spare capacity, even if a few tasks have to shift slightly later as a result.\n\nSo the answer is: two testers are over-allocated and one is under-utilised, and resource leveling fixes it by shifting excess hours onto the underused tester.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Meridian Health Network is rolling out a patient-facing appointment portal. Two testers on the quality assurance team are each booked for 45 hours of testing next week against only 30 hours of real availability, while a third tester has just 8 hours booked against 30 hours available. Leadership wants to track four separate measures of the portal's success: whether it actually reduces patients' average appointment wait time, whether clinical staff feel the new booking workflow has made their jobs easier, whether the finance team sees reduced no-show-related revenue loss, and whether the technical team can keep shipping portal updates without growing technical debt. Separately, a hospital department head with significant influence over clinical staff adoption, but who has shown little interest in attending project meetings, has not been actively consulted, and a known data-entry bug is costing the help desk $15,000 a month in support calls, which a one-time $1,500 fix to the validation logic would eliminate.\n\n(b) Using the Balanced Scorecard's four perspectives, match each of the four proposed success measures to its perspective.",
      modelAnswer:
        "Think of a school report card with four separate sections — how happy the students are, how well the lessons run, how the budget looks, and how much the teachers are still learning and improving themselves.\n\n• Patient wait time: this is the Customer perspective — it's about how customers, in this case patients, experience the service.\n\n• Clinical staff finding the workflow easier: this is the Internal Process perspective — it's about how well the organisation's own internal workflow is running.\n\n• Reduced no-show revenue loss: this is the Financial perspective — 'how do we look to shareholders', here measured as cost and revenue impact.\n\n• Shipping updates without growing technical debt: this is the Learning and Growth perspective — 'can we keep improving', measured by the technical team's ongoing capacity to keep delivering well.\n\nSo the answer is: wait time maps to Customer, staff ease maps to Internal Process, revenue loss maps to Financial, and sustainable update delivery maps to Learning and Growth.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Meridian Health Network is rolling out a patient-facing appointment portal. Two testers on the quality assurance team are each booked for 45 hours of testing next week against only 30 hours of real availability, while a third tester has just 8 hours booked against 30 hours available. Leadership wants to track four separate measures of the portal's success: whether it actually reduces patients' average appointment wait time, whether clinical staff feel the new booking workflow has made their jobs easier, whether the finance team sees reduced no-show-related revenue loss, and whether the technical team can keep shipping portal updates without growing technical debt. Separately, a hospital department head with significant influence over clinical staff adoption, but who has shown little interest in attending project meetings, has not been actively consulted, and a known data-entry bug is costing the help desk $15,000 a month in support calls, which a one-time $1,500 fix to the validation logic would eliminate.\n\n(c) Using the Power/Interest Grid, classify the department head, and explain the Stakeholder Alignment risk of continuing to leave them unconsulted.",
      modelAnswer:
        "Think of a quiet building inspector who rarely visits a construction site but still holds the authority to stop the whole project if they're unhappy with how it's being run.\n\n• The Power/Interest classification: the department head has high power over clinical staff adoption but has shown low day-to-day interest, placing them in the 'Keep Satisfied' quadrant — someone to manage carefully, not just inform occasionally.\n\n• The alignment risk: leaving them unconsulted threatens Stakeholder Alignment, since that dimension depends on properly managing the expectations of influential groups — if clinical staff adoption later stalls because the department head was never brought on board, the portal could fail where it matters most, even if it works technically.\n\nSo the answer is: the department head sits in 'Keep Satisfied', and leaving them unconsulted risks a Stakeholder Alignment failure that could stall clinical adoption.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Meridian Health Network is rolling out a patient-facing appointment portal. Two testers on the quality assurance team are each booked for 45 hours of testing next week against only 30 hours of real availability, while a third tester has just 8 hours booked against 30 hours available. Leadership wants to track four separate measures of the portal's success: whether it actually reduces patients' average appointment wait time, whether clinical staff feel the new booking workflow has made their jobs easier, whether the finance team sees reduced no-show-related revenue loss, and whether the technical team can keep shipping portal updates without growing technical debt. Separately, a hospital department head with significant influence over clinical staff adoption, but who has shown little interest in attending project meetings, has not been actively consulted, and a known data-entry bug is costing the help desk $15,000 a month in support calls, which a one-time $1,500 fix to the validation logic would eliminate.\n\n(d) Using the Cost of Quality framework, classify the $1,500 fix and the ongoing $15,000-a-month cost, recommend what Meridian should do, and name the Balanced Scorecard perspective this decision most directly improves.",
      modelAnswer:
        "Think of paying for a small plumbing repair now versus paying every month to mop up the same leak forever — one is a tiny upfront fix, the other is a slow, ongoing drain.\n\n• The $1,500 fix: this is a Cost of Conformance, specifically a prevention cost — money spent upfront to stop the data-entry defect from happening at all.\n\n• The $15,000-a-month cost: this is a Cost of Non-Conformance, specifically an internal failure cost pattern showing up as repeated support-desk cleanup — the ongoing price of letting a known defect keep causing problems.\n\n• The recommendation: Meridian should pay the one-time $1,500 prevention fix, since it eliminates a recurring $15,000-a-month cost almost immediately.\n\n• The Balanced Scorecard link: this decision most directly improves the Financial perspective, since it reduces an ongoing support cost that is otherwise draining the budget every month.\n\nSo the answer is: the $1,500 fix is a prevention cost, the $15,000-a-month cost is an internal failure cost, Meridian should fix it now, and doing so improves the Financial perspective.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Nova Logistics is building an IoT-based fleet-tracking platform using Scrum. A junior developer on the team is blocked because a third-party mapping API's documentation is outdated, and has raised it at the daily stand-up two days running without it being resolved. The project has a Stage-Gate governance checkpoint scheduled for the end of the current phase, and the latest schedule report shows the critical path's 'Integrate GPS hardware' activity — previously 4 weeks — now needs 7 weeks because of a supplier delay, pushing out every downstream activity that depends on it. The IT department has already chosen to host the whole platform on a specific cloud vendor because it best matches the team's own existing technical skills and infrastructure, without checking whether that vendor's analytics tools actually support the executive team's strategic goal of real-time fleet-wide cost reporting. Monitoring of project communications also shows that the operations director has asked the same question about go-live timing three times across three different channels without ever getting a clear answer.\n\n(a) In this Agile context, whose job is it to remove the junior developer's blocker, and why has leaving it unresolved for two stand-ups in a row been a leadership failure?",
      modelAnswer:
        "Think of a relay race where one runner is stuck untangling their shoelace and nobody on the sideline, whose actual job is to help with exactly that, steps in to help — the team loses time it didn't need to lose.\n\n• Whose job it is: in Agile software teams, the leader acts as a servant and enabler, removing blockers and helping the team self-organise rather than directing every task — in Scrum, this role specifically belongs to the Scrum Master.\n\n• Why it's a failure to leave it unresolved: the same blocker being raised two stand-ups in a row without resolution means the servant-leadership function isn't actually functioning — the point of a daily stand-up is precisely to surface blockers so someone acts on them immediately, not to let them repeat unaddressed.\n\nSo the answer is: the Scrum Master should be removing the blocker, and letting it persist across two stand-ups shows the servant-leader role isn't being carried out.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Nova Logistics is building an IoT-based fleet-tracking platform using Scrum. A junior developer on the team is blocked because a third-party mapping API's documentation is outdated, and has raised it at the daily stand-up two days running without it being resolved. The project has a Stage-Gate governance checkpoint scheduled for the end of the current phase, and the latest schedule report shows the critical path's 'Integrate GPS hardware' activity — previously 4 weeks — now needs 7 weeks because of a supplier delay, pushing out every downstream activity that depends on it. The IT department has already chosen to host the whole platform on a specific cloud vendor because it best matches the team's own existing technical skills and infrastructure, without checking whether that vendor's analytics tools actually support the executive team's strategic goal of real-time fleet-wide cost reporting. Monitoring of project communications also shows that the operations director has asked the same question about go-live timing three times across three different channels without ever getting a clear answer.\n\n(b) Explain what a Stage-Gate review is for, and what it must specifically check and decide now that the critical path's GPS-integration activity has grown from 4 to 7 weeks.",
      modelAnswer:
        "Think of a road trip with planned rest-stop checkpoints where the driver is supposed to honestly check the fuel gauge and the map before deciding whether to keep going at the planned pace or change the plan.\n\n• What a Stage-Gate review is for: it's a formal checkpoint at a key project milestone, used to confirm the project is still on track and worth continuing in its current form before moving into the next phase.\n\n• What it must check here: since 'Integrate GPS hardware' sits on the critical path and has grown from 4 to 7 weeks, that 3-week slip pushes out every downstream activity depending on it — the Stage-Gate review must specifically re-check the whole project's end date against this new critical path length, decide whether to re-baseline the schedule, and make a clear go or no-go call on continuing as planned rather than letting the phase proceed on outdated assumptions.\n\nSo the answer is: a Stage-Gate review is a formal continue-or-not checkpoint, and here it must re-check the project's end date against the now-longer critical path and formally decide whether to re-baseline the schedule.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Nova Logistics is building an IoT-based fleet-tracking platform using Scrum. A junior developer on the team is blocked because a third-party mapping API's documentation is outdated, and has raised it at the daily stand-up two days running without it being resolved. The project has a Stage-Gate governance checkpoint scheduled for the end of the current phase, and the latest schedule report shows the critical path's 'Integrate GPS hardware' activity — previously 4 weeks — now needs 7 weeks because of a supplier delay, pushing out every downstream activity that depends on it. The IT department has already chosen to host the whole platform on a specific cloud vendor because it best matches the team's own existing technical skills and infrastructure, without checking whether that vendor's analytics tools actually support the executive team's strategic goal of real-time fleet-wide cost reporting. Monitoring of project communications also shows that the operations director has asked the same question about go-live timing three times across three different channels without ever getting a clear answer.\n\n(c) Using the Strategic Alignment Model's two dimensions, explain which dimension the IT department's cloud-vendor decision satisfies, which dimension it risks failing, and why.",
      modelAnswer:
        "Think of choosing a van for a delivery business purely because the driver already knows how to operate it, without checking whether that van's cargo space actually fits the goods the business plans to deliver.\n\n• The dimension it satisfies: choosing the vendor that best matches the team's existing technical skills and infrastructure satisfies Strategic Fit on the internal side — specifically fitting the organisation's internal IT infrastructure to what the vendor offers.\n\n• The dimension it risks failing: it risks failing Functional Integration, which is about linking IT strategy to business strategy — picking a vendor without checking whether its analytics tools actually support the executive team's strategic goal of real-time fleet-wide cost reporting means the IT choice may not connect back to what the business actually needs.\n\n• Why this matters: a decision can be a comfortable technical fit and still fail to deliver business value if nobody checks the Functional Integration side, which is exactly the gap here.\n\nSo the answer is: the decision satisfies Strategic Fit on infrastructure, but risks failing Functional Integration because it was never checked against the business's real-time cost-reporting strategy.",
    },
    {
      type: "scenario",
      prompt:
        "Scenario: Nova Logistics is building an IoT-based fleet-tracking platform using Scrum. A junior developer on the team is blocked because a third-party mapping API's documentation is outdated, and has raised it at the daily stand-up two days running without it being resolved. The project has a Stage-Gate governance checkpoint scheduled for the end of the current phase, and the latest schedule report shows the critical path's 'Integrate GPS hardware' activity — previously 4 weeks — now needs 7 weeks because of a supplier delay, pushing out every downstream activity that depends on it. The IT department has already chosen to host the whole platform on a specific cloud vendor because it best matches the team's own existing technical skills and infrastructure, without checking whether that vendor's analytics tools actually support the executive team's strategic goal of real-time fleet-wide cost reporting. Monitoring of project communications also shows that the operations director has asked the same question about go-live timing three times across three different channels without ever getting a clear answer.\n\n(d) Explain what the Monitor Communications process is specifically supposed to catch, and what the project manager should adjust now that the operations director has asked the same go-live question three times across three channels.",
      modelAnswer:
        "Think of a smoke alarm that only matters if someone is actually listening for it — the same unanswered question going up three times in three different rooms is the project's own smoke alarm going off repeatedly.\n\n• What Monitor Communications is supposed to catch: it's the process that checks whether communication is actually reaching people and supporting decisions, specifically by watching for signs like repeated questions, unanswered questions and delayed decisions — exactly the pattern happening here.\n\n• What should be adjusted: the project manager should treat the repeated question as a signal that the current channel and audience plan for the operations director isn't working, and adjust it — for example, assigning a specific person to give the operations director a direct, timely answer on go-live timing through one clear channel, rather than letting it bounce unanswered across three.\n\nSo the answer is: Monitor Communications exists to catch exactly this kind of repeated, unanswered question, and the fix is to adjust the channel and ownership so the operations director gets one clear, direct answer.",
    },
  ],
};

export const WEEK_9_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER, FINAL_EXAM_PAPER];
