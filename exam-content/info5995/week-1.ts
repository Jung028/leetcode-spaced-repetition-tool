import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = 
  {
    course: "INFO5995",
    week: 1,
    paperNumber: 1,
    title: "Week 1 Practice Paper",
    topics: "Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study; Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study; Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study",
    sourceFiles: ["INFO5995 Week 1 - Exam Practice Questions.md", "lecture/INFO5995_Week_1_Extra_Resources.pdf", "lecture/Week01-Introduction, cybersecurity basics, security lifecycle, system and threat models.pdf"],
    questions: [
      {
        type: "mcq",
        prompt: "Which of the following best describes why \"a perfectly closed castle is secure but useless\"?",
        options: ["Closed systems cost far more to build, since blocking every entry point needs specialised, custom-built hardware", "Systems must allow access for people, information, and business to function, and that access is what creates risk", "Attackers always find a way in eventually, regardless of how many layers of defence are placed in front of them", "Castle-style perimeters are outdated because modern networks have no physical walls or moats left to defend"],
        correctIndex: 1,
        modelAnswer: "A closed system has no doors, so nothing valuable can be used; the moment access is added for legitimate use, risk is introduced too.",
      },
      {
        type: "mcq",
        prompt: "In the Wooden Barrel Theory of security, what determines how much \"water\" (security capacity) a system can hold?",
        options: ["The average height of all the boards (layers)", "The number of layers of defence, regardless of quality", "The shortest/weakest board — the system is only as strong as its weakest point", "The cost invested in the tallest board"],
        correctIndex: 2,
        modelAnswer: "Attackers look for the shortest board; the system's overall security is capped by its weakest point, not its average or its best control.",
      },
      {
        type: "truefalse",
        prompt: "True or False: Adding more layers of security controls guarantees a system is fully protected against all threats.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "The lecture explicitly states no single control protects the whole system — layers reduce risk, they don't eliminate it; one weak point can still undermine everything.",
      },
      {
        type: "truefalse",
        prompt: "True or False: Security involves trade-offs — increasing security can reduce usability and convenience.",
        options: ["True", "False"],
        correctIndex: 0,
        modelAnswer: "\"Security involves trade-offs... more security can affect usability and convenience.\"",
      },
      {
        type: "mcq",
        prompt: "Which CIA Triad property is violated if an attacker changes a bank balance from $100 to $1,000,000 without authorisation?",
        options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
        correctIndex: 1,
        modelAnswer: "Unauthorised modification of data/value is a textbook integrity violation.",
      },
      {
        type: "mcq",
        prompt: "A DDoS (Distributed Denial of Service) attack that floods a server with fake requests so real users can't connect primarily threatens which CIA property?",
        options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
        correctIndex: 2,
        modelAnswer: "DDoS attacks aim to make a service unreachable/unusable, not to steal or alter data.",
      },
      {
        type: "mcq",
        prompt: "Which CIA property asks the question \"who is allowed to see this?\"",
        options: ["Integrity", "Availability", "Confidentiality", "Accountability"],
        correctIndex: 2,
        modelAnswer: "\"Confidentiality asks: who is allowed to see this?\"",
      },
      {
        type: "mcq",
        prompt: "According to the Week 1 \"Security Lifecycle\" model, which of these activities happens before code deployment?",
        options: ["Intrusion detection", "Fuzzing and dynamic analysis in production", "Defining security goals/properties and manual audits", "Disaster recovery and freezing stolen funds"],
        correctIndex: 2,
        modelAnswer: "Defining goals/security properties, best-coding practice, and manual audit are all pre-deployment activities. Intrusion detection and fuzzing in production are after deployment; disaster recovery is after an incident.",
      },
      {
        type: "mcq",
        prompt: "Which of these activities belongs to the after incident phase of the security lifecycle?",
        options: ["Static analysis of source code", "Post-mortem review and disaster recovery", "Best-practice secure coding", "Intrusion prevention systems"],
        correctIndex: 1,
        modelAnswer: "Post-mortem and disaster recovery (freezing money, tracing, insurance, legal) are explicitly \"after incident\" activities.",
      },
      {
        type: "truefalse",
        prompt: "True or False: According to the lecture, security is a one-time activity that ends once a system is launched.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "\"Security does not end when a system is launched\" / \"Security is never finished.\"",
      },
      {
        type: "mcq",
        prompt: "In system modeling, which of the following is a \"trust assumption\" rather than a \"component\"?",
        options: ["The card reader", "The bank server", "\"The network connection is protected\"", "The customer"],
        correctIndex: 2,
        modelAnswer: "\"The network connection is protected\" is an assumption about the system, not a physical/logical component. The card reader, bank server, and customer are components/actors.",
      },
      {
        type: "mcq",
        prompt: "When threat modeling, \"what can they do?\" (e.g. steal a password, exploit software, act as an insider) refers to which part of the attacker profile?",
        options: ["Adversary goals", "Adversary capabilities", "Attack surface", "Trust boundary"],
        correctIndex: 1,
        modelAnswer: "\"What can they do?\" maps to capabilities, as distinct from goals (\"what do they want?\") and attack vector (the path they take).",
      },
      {
        type: "mcq",
        prompt: "In the Bybit case, what was the root cause that allowed attackers to steal ~$1.4 billion?",
        options: ["A weak, reused administrator password that let attackers log directly into the cold wallet's signing infrastructure", "A DDoS attack that overwhelmed Bybit's servers and forced staff to approve pending transfers under time pressure", "Staff approved a transaction based on a fake/manipulated UI screen without independent verification by the cold wallet system", "An expired TLS certificate that let attackers intercept and quietly rewrite transaction data in transit"],
        correctIndex: 2,
        modelAnswer: "Attackers presented a manipulated approval screen; staff approved via the UI without independent verification, and the cold wallet signed without re-checking what was actually being signed.",
      },
      {
        type: "truefalse",
        prompt: "True or False: The Bybit incident shows that cybersecurity failures are always purely technical (software) failures, never human ones.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "The lecture's explicit takeaway is \"security means protecting both the technology and the people who use it\" — Bybit shows human/process failure, not just a technical bug.",
      },
      {
        type: "short",
        prompt: "Explain, in your own words, why modern cybersecurity can no longer be modeled as a single \"castle\" with one boundary. What replaced this model in the lecture, and why does every connection in that replacement create risk?",
        modelAnswer:
          "Think of an old castle: one wall, one gate, one thing to guard. A modern app is more like a whole city — your phone, the wifi, the internet, a web server, a switch, a backend server, a database, all wired together. There is no single wall around a city.\n\n• Why the castle model broke: the \"stuff\" of a system is now spread across many machines in many places, so there is no one edge to stand on and defend.\n\n• What replaced it: layered defence (also called defence-in-depth). Instead of one big wall you put smaller guards everywhere — a login check here, a firewall there, an alarm system, scrambled data — so getting past one guard still doesn't get you in.\n\n• Why every connection is a risk: each wire that lets the city function (people, data, money moving through) is also a door an attacker can try. The same opening that makes it useful makes it attackable.\n\nSo the answer is: modern systems are too spread out for one boundary, so we use many layers instead, and every useful connection is also a possible way in.",
      },
      {
        type: "short",
        prompt: "Define each part of the CIA Triad in one sentence each, and give one original example (not from the slides) of an attack or failure for each property.",
        modelAnswer:
          "Picture a diary. You care about three separate things: no one else reads it, no one secretly rewrites lines in it, and you can actually open it when you want to. Those three worries are the CIA triad.\n\n• Confidentiality: only allowed people can see the data. Broken example — someone on the same coffee-shop wifi captures your login as it goes past because it wasn't scrambled.\n\n• Integrity: data can't be changed without permission. Broken example — a student with sneaky write access edits their own mark in the results database.\n\n• Availability: allowed people can get in when they need to. Broken example — ransomware locks up a hospital's records so doctors can't open any patient file.\n\nSo the answer is: Confidentiality = kept secret, Integrity = kept unaltered, Availability = kept reachable.",
      },
      {
        type: "short",
        prompt: "List the four stages of the Week 1 \"Take Away 2: Security is a Lifecycle\" summary (build → ? → ? → ?) and briefly explain what happens in each stage.",
        modelAnswer:
          "Security isn't a thing you install once, like a lock on a new door. It's more like looking after a garden — you plant it well, then you keep watching, dealing with problems, and improving, forever.\n\n• Build securely: before launch, work out what's valuable, think about who'd attack it, and test for weak spots.\n\n• Watch and protect: once it's live, keep monitoring, spot anything suspicious, and patch or tighten things.\n\n• Respond: when something bad happens, contain it, recover, and work out what went on.\n\n• Learn and strengthen: fix the weakness for good and feed the lesson back into the next round of building.\n\nSo the answer is: Build securely, Watch and protect, Respond, Learn and strengthen — and it loops, it doesn't end.",
      },
      {
        type: "short",
        prompt: "Explain the difference between a system model and a threat model. Why do you need both before you can reason about a system's security?",
        modelAnswer:
          "Imagine planning a house. First you draw the floor plan: rooms, doors, windows, and things you're taking for granted like \"the front door lock works\". Then you walk around as a burglar: which window is easy, what would they want, how would they get in. Two different drawings of the same house.\n\n• System model: what exists and how it's meant to work — the parts, the people, the setting, and the things you're assuming are safe. This is the \"as-designed\" picture.\n\n• Threat model: how it could be attacked — who the attackers are, what they're after, what they can do, and the route they'd take. This is the \"as-attacked\" picture.\n\n• Why you need both: you can't spot realistic attacks or shaky assumptions until you've written down what's actually there. The floor plan has to come before the burglar walk-through.\n\nSo the answer is: the system model says what it is, the threat model says how it breaks, and the first has to come before the second.",
      },
      {
        type: "short",
        prompt: "List the five components of a system model as taught in the ATM example (components, actors, environment, trust assumptions — plus one more). For each, give one example that is different from the ATM slide.",
        modelAnswer:
          "A system model is basically five labelled boxes you fill in about any system. Think of describing a food-delivery app to a friend: the gadgets involved, the people involved, where it's used, what you're assuming is safe, and what's worth stealing.\n\n• Components: the technical parts. Banking-app example — the phone app, the API server, the database.\n\n• Actors: the people or entities. Example — the customer, a bank staff member, an outside auditor.\n\n• Environment: the setting it runs in. Example — a personal phone on public cafe wifi.\n\n• Trust assumptions: things taken as safe without re-checking. Example — \"the app wasn't tampered with before the customer installed it\".\n\n• Assets: the valuable stuff worth protecting. Example — the customer's account balance and card details. In the Bybit model this box held the \"cold wallet funds\".\n\nSo the answer is: Components, Actors, Environment, Trust Assumptions, and Assets.",
      },
      {
        type: "short",
        prompt: "For threat modeling, three questions define an attacker: what do they want, what can they do, and what path/vector do they use. Apply this to a phishing email attacker targeting a university student.",
        modelAnswer:
          "To size up an attacker you ask three plain questions: what do they want, what are they able to do, and how do they actually get to you. Here it's a scammer sending a fake \"your library account is locked\" email to a student.\n\n• What they want (goal): the student's university username and password, so they can get into grades and finance, or use it to jump into other accounts.\n\n• What they can do (capability): build a fake login page that looks exactly like the real uni portal, and fake the \"from\" address so the email looks official.\n\n• How they get in (vector): the email lands in the inbox, the student clicks the link, types their password into the fake page, and the scammer grabs it and logs in as them. It works on trust and panic, not on any software bug.\n\nSo the answer is: goal = steal the login, capability = convincing fake email and page, vector = click the link and hand over the password.",
      },
      {
        type: "short",
        prompt: "Explain the \"wooden barrel theory\" and connect it explicitly to the Bybit case: which \"board\" (layer) was the shortest, and what should have been done to lengthen it?",
        modelAnswer:
          "A wooden barrel is made of vertical planks. Fill it with water and it only holds up to the height of the shortest plank — water pours out there no matter how tall the others are. Security works the same way: your protection is capped by your weakest layer, not your best one.\n\n• The layers (planks): people, devices, networks, software, data.\n\n• Bybit's tall planks: the crypto on the cold wallet and the multi-signature setup were genuinely strong.\n\n• Bybit's shortest plank: the people-and-process layer. Staff approved a transfer by trusting what the screen said, and the signing device signed without re-showing what it was really signing. Attackers poured straight through that gap.\n\n• How to lengthen it: check the real transaction on a separate, independent device before signing, so a lie on the main screen gets caught instead of trusted.\n\nSo the answer is: security is limited by the weakest layer; at Bybit that was people trusting the screen, and the fix is independent verification on a second device before signing.",
      },
      {
        type: "short",
        prompt: "The unit outline lists 15 learning outcomes across five categories. Why do you think Week 1 spends most of its time on system models, threat models, and the CIA triad rather than jumping straight into technical attacks? What foundation does this build for later weeks?",
        modelAnswer:
          "It's like a cooking course teaching knife skills and food safety first instead of 50 recipes. The recipes change; the underlying skills carry into all of them.\n\n• What Week 1 is really teaching: a way of thinking. Modelling the system makes you name what's valuable and what you're assuming is safe. Threat modelling makes you ask who'd attack it and how.\n\n• Why not dive into attacks: a memorised list of attacks doesn't transfer. A thinking method does.\n\n• How later weeks reuse it: cryptography, authentication, network security, AI security, blockchain security are all just \"what are the assets and assumptions here, and how are they attacked\" applied to a new area.\n\n• The repeatable steps: model the system, model how it should behave, think like an attacker, decide what must be protected, know your attacker.\n\nSo the answer is: Week 1 installs a reusable framework so every later topic is the same five steps on new material, not a fresh pile of facts.",
      },
      {
        type: "scenario",
        prompt: "A university uses an online exam portal where students log in, complete a timed quiz, and submit answers automatically saved to a server. a) Build a system model: identify at least 3 components, 2 actors, the environment, and 2 trust assumptions. b) Build a threat model: identify one plausible attacker, their goal, their capability, and a likely attack vector. c) State one confidentiality, one integrity, and one availability property that must hold for this system.",
        modelAnswer:
          "Treat the exam portal like any system: describe it, then walk around it as a cheater, then say what must stay true.\n\n• Components: the student's browser, the exam website server, the login service, the database that stores answers, the countdown timer service.\n\n• Actors: the student, the instructor or invigilator, the IT admin.\n\n• Environment: used from home over the public internet, often on the student's own laptop that the uni doesn't control.\n\n• Trust assumptions: \"the login service really proves it's the right student\", and \"the submit service reliably saves answers before the deadline\".\n\n• Attacker and goal: a student who wants a better mark, aiming to see questions early or change answers after time runs out.\n\n• Capability and vector: they have a real login, and they try to replay or tamper with the \"submit\" web request after the timer ends, or guess another student's session link.\n\n• Must stay true: Confidentiality — questions hidden until the start time. Integrity — answers can't be changed after the deadline. Availability — the portal stays up for the whole exam window.\n\nSo the answer is: model it (parts, people, setting, assumptions), the threat is a student replaying the submit request for a better grade, and C/I/A map to hidden questions, locked answers, and an up portal.",
      },
      {
        type: "scenario",
        prompt: "A smart home doorbell camera streams video to an app and lets the homeowner unlock the front door remotely. a) Identify one component-level trust assumption that, if broken, would compromise the whole system (link this to the Wooden Barrel Theory). b) Describe an attack that would violate confidentiality, and a separate attack that would violate availability.",
        modelAnswer:
          "The fancy lock on the door doesn't matter if the phone line that sends \"unlock\" can be faked. That phone line is the weak plank in the barrel.\n\n• The key trust assumption: \"the cloud service that passes along the unlock command is not hacked, and only obeys the real homeowner's app.\" If an attacker takes over that cloud relay or steals the app's login token, the strong physical lock and the camera are all worthless — it's the shortest plank, so everything leaks out there.\n\n• Confidentiality attack: the attacker gets into the video feed and watches the live camera inside the home without permission.\n\n• Availability attack: the attacker floods the home wifi or jams the doorbell's wireless signal, so it can't ring the phone or send video when someone's actually at the door.\n\nSo the answer is: the weak plank is trusting the unlock relay; breaking secrecy means watching the camera, breaking availability means jamming the doorbell so it can't alert anyone.",
      },
      {
        type: "scenario",
        prompt: "Revisit the Bybit case one more time, but now argue it from a defender's perspective using the security lifecycle: for each of the three phases (before deployment, after deployment, after incident), suggest one concrete control Bybit could have implemented to prevent or limit the loss.",
        modelAnswer:
          "Same \"look after the garden\" lifecycle — build well, watch, then learn from what went wrong. Bybit's loss was staff approving a transfer they couldn't really see. One fix per phase:\n\n• Before deployment: make the signing device decode and show the actual transaction it's about to sign, instead of trusting the main screen's word for it — and have someone formally threat-model the whole approval process before launch.\n\n• After deployment: watch for unusual huge withdrawals and automatically pause them for a second human review before they go out.\n\n• After the incident: run a proper post-mortem, name the root cause as \"trusting the screen without an independent check\", and make independent verification mandatory for every future big approval.\n\nSo the answer is: build = show the real transaction on the signer, watch = auto-hold giant transfers for review, learn = require independent checks on all high-value approvals from now on.",
      },
      {
        type: "scenario",
        prompt: "A classmate says: \"If we just add a firewall and multi-factor authentication, our system will be secure.\" Using concepts from Week 1 (layered defence, CIA triad, lifecycle, trust assumptions), explain why this statement is incomplete, and what else needs to be considered.",
        modelAnswer:
          "It's like saying \"I put a deadbolt and a burglar alarm on the front door, so the house is safe.\" Those are two good things, not a whole security plan.\n\n• Two controls aren't \"secure\": the barrel still has other planks. A firewall doesn't protect data once something's already inside the network, and multi-factor login doesn't stop a tricked staff member from approving a bad request, like at Bybit, or a bug in the app's own code.\n\n• Missing CIA coverage: a firewall and login are mostly about who gets in. They say little about integrity (data being altered) or availability (being knocked offline).\n\n• Missing lifecycle: security is build, watch, respond, learn — ongoing — not a one-time setup.\n\n• Missing trust assumptions: you still have to list what every part is assuming is safe, because attackers hit the weakest assumption, not necessarily the front door.\n\nSo the answer is: two controls is a start, but a real plan also covers all of CIA, runs as a continuous lifecycle, and writes down every trust assumption.",
      },
      {
        type: "mcq",
        prompt: "A company replaces its single external firewall with firewalls at the network edge, between internal subnets, and on each server, plus endpoint antivirus on every laptop. This is an example of:",
        options: ["Zero trust networking", "Defence-in-depth / layered defence", "The castle model", "Air-gapping"],
        correctIndex: 1,
        modelAnswer: "Defence-in-depth places multiple independent layers of control along the path an attacker would have to travel, rather than relying on one perimeter — exactly what stacking firewalls, segmentation, and endpoint protection does.",
      },
      {
        type: "mcq",
        prompt: "In the Wooden Barrel Theory, if four of five security layers are excellent but the fifth (staff training) is very weak, the system's overall security is best described as:",
        options: ["Strong, because 4 out of 5 layers are excellent", "The average of all five layers", "Limited by the weakest layer (staff training)", "Undefined without a numeric score"],
        correctIndex: 2,
        modelAnswer: "The barrel holds only as much water as its shortest board — one weak layer caps the whole system's security regardless of how strong the others are.",
      },
      {
        type: "truefalse",
        prompt: "True or False: A system with ten layers of defence is always more secure than a system with only three well-designed and well-reviewed layers.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "Quantity of layers isn't the deciding factor — a small number of well-chosen, well-maintained layers can outperform many redundant or poorly-configured ones; the barrel theory cares about the weakest layer, not the count.",
      },
      {
        type: "truefalse",
        prompt: "True or False: Trade-offs between security and usability mean that the \"most secure\" design is not always the design that should be shipped.",
        options: ["True", "False"],
        correctIndex: 0,
        modelAnswer: "Security involves trade-offs — a maximally secure design that's unusable will get bypassed or abandoned by real users, so the right design balances protection against usability rather than maximising security alone.",
      },
      {
        type: "mcq",
        prompt: "An attacker gains read-only access to a company's customer database and downloads emails and phone numbers without modifying anything or affecting service. Which CIA property is violated?",
        options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
        correctIndex: 0,
        modelAnswer: "Unauthorised viewing of data with no modification or disruption is a confidentiality breach.",
      },
      {
        type: "mcq",
        prompt: "A ransomware attack encrypts a hospital's files so doctors can't open patient records, but the data itself is not stolen or altered. Which CIA property is primarily violated?",
        options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
        correctIndex: 2,
        modelAnswer: "Blocking authorised users from accessing data they need, when they need it, is an availability violation — even though nothing was read or changed.",
      },
      {
        type: "mcq",
        prompt: "According to the Week 1 Security Lifecycle model, patching a known vulnerability in a running production system belongs to which phase?",
        options: ["Before deployment", "After deployment", "After incident", "None of these — patching isn't part of the lifecycle"],
        correctIndex: 1,
        modelAnswer: "Patching a live system is a \"watch and protect\" activity that happens once the system is already running, not before launch or specifically after a breach.",
      },
      {
        type: "mcq",
        prompt: "In the Bybit case, which of the following is the most accurate root-cause description?",
        options: ["A brute-force password attack that bypassed multi-factor authentication on the cold wallet's admin account", "A DDoS attack overwhelming Bybit's infrastructure until staff bypassed the normal approval checks", "Staff approved a transaction based on a manipulated UI without independent verification", "A supply-chain compromise of Bybit's cloud provider that injected malicious code into the approval tool"],
        correctIndex: 2,
        modelAnswer: "The root cause was a process/human failure: staff trusted what the approval UI displayed instead of independently verifying the actual transaction being signed.",
      },
      {
        type: "short",
        prompt: "Explain in your own words the difference between a system model and a threat model, using an example system of your choosing (not the ATM or Bybit).",
        modelAnswer:
          "Same house idea again: first the floor plan, then the burglar's walk-around. Let's use a food-delivery app.\n\n• System model (what it is): the rider's phone, the restaurant's tablet, the matching server, and the payment system are the parts; a trust assumption is \"the rider's GPS location is real and not faked\". This is the as-designed picture.\n\n• Threat model (how it breaks): who would attack that assumption and how. A rider fakes their GPS to look like they delivered an order they never picked up, using a location-spoofing app. This is the as-attacked picture.\n\n• The difference: one lists the pieces and what you're trusting; the other attacks exactly those trusted pieces.\n\nSo the answer is: the system model describes the delivery app and its assumptions, the threat model shows a rider spoofing GPS to break one of them.",
      },
      {
        type: "short",
        prompt: "List the four stages of the \"Security is a Lifecycle\" takeaway and briefly explain what changes about a system's security posture between the \"before deployment\" and \"after deployment\" stages.",
        modelAnswer:
          "The four stages are Build securely, Watch and protect, Respond, Learn and strengthen. The big shift is between the first two: before launch you're a designer, after launch you're a lookout.\n\n• Before deployment: preventive, at the drawing board — threat modelling, writing safe code, getting it audited, deciding what must be protected. No real attackers yet.\n\n• After deployment: reactive, against a live system — watching logs, catching intrusions, patching problems as they're found. Real users and real attackers are now hitting it.\n\n• What changed: the goal moves from \"design this well\" to \"watch this constantly\", because the system is now exposed instead of theoretical.\n\nSo the answer is: Build, Watch, Respond, Learn — and going live turns the job from careful design into constant monitoring.",
      },
      {
        type: "short",
        prompt: "Give an original example (not from lecture) of a single trust assumption whose failure would compromise an entire system, and explain why it is the \"shortest board\" in that system's barrel.",
        modelAnswer:
          "A password manager holds all your other passwords behind one master password. The whole thing rests on one belief: nothing on your device is secretly recording what you type.\n\n• The trust assumption: \"the master password is never captured by anything running on the user's device.\"\n\n• If it fails: a keylogger records the master password once, and now the attacker can open the vault and read every stored login — no matter how strong the encryption is.\n\n• Why it's the shortest plank: every other protection sits behind that one assumption. Break it and all the other layers become pointless, so that's the plank an attacker aims for.\n\nSo the answer is: \"the master password is never keylogged\" — because every other safeguard in a password manager depends on that single thing holding.",
      },
      {
        type: "scenario",
        prompt: "A ride-share app lets drivers see a passenger's pickup location and lets passengers rate drivers after the trip. a) Build a system model: name 3 components, 2 actors, the environment, and 1 trust assumption. b) Identify one attacker whose goal is to see a passenger's home address without authorisation, and describe their likely capability and attack vector. c) State one confidentiality property and one integrity property that must hold.",
        modelAnswer:
          "Describe the ride-share app, then think like a creepy driver, then say what must stay true.\n\n• Components: the passenger app, the driver app, the matching server, the ratings database, the payment system.\n\n• Actors: the passenger, the driver, support staff.\n\n• Environment: personal phones on public mobile and wifi networks.\n\n• Trust assumption: \"the matching server only shows a passenger's exact location to the driver actually assigned to that trip.\"\n\n• Attacker and goal: a current or former driver who wants to find and stalk one passenger's home.\n\n• Capability and vector: they have a real driver account and can screenshot trip data; they abuse a request in the driver app that still hands back a past trip's pickup location after the ride is over.\n\n• Must stay true: Confidentiality — a passenger's home address is visible only to the assigned driver and only during the trip. Integrity — a driver's star rating can only be changed by the passenger who actually took that trip.\n\nSo the answer is: model it, the threat is a driver re-pulling old pickup locations to stalk someone, and C/I mean addresses stay trip-scoped and ratings can't be forged.",
      },
      {
        type: "scenario",
        prompt: "Revisit the Wooden Barrel Theory and apply it to a university's learning management system (LMS) that stores grades. a) Identify a plausible \"shortest board\" for the LMS (people, process, or technology) and justify your choice. b) Recommend one concrete control that would lengthen that specific board, and explain, using the Security Lifecycle, which phase that control belongs to.",
        modelAnswer:
          "The grade system can have strong crypto and strong logins and still spill at its weakest plank. Here that plank is how teaching-assistant accounts are handled.\n\n• The shortest plank: TA accounts. TAs often get wide grade-editing power for convenience, with no limit to their own class and no record of which TA changed which mark. A dishonest insider or a stolen TA login walks straight through this, past all the strong tech.\n\n• The control to lengthen it: limit each TA to editing grades only for their assigned class, log every change so it can be reviewed, and auto-remove the access at the end of semester.\n\n• Which lifecycle phase: \"before deployment\" if this tight access model is designed in from the start; \"watch and protect\" if it's added later as monitoring and alerts on odd grade changes.\n\nSo the answer is: the weak plank is over-broad, unlogged TA access; fix it with least-privilege, logged, expiring accounts, built in at design time or bolted on as monitoring later.",
      },
      {
        type: "mcq",
        prompt: "A bank adds a second, independent device that must physically confirm a large wire transfer before it executes, even though the initiating computer has already approved it. This most directly demonstrates:",
        options: ["The castle model's single strong outer perimeter approach", "Defence-in-depth via an independent verification layer", "Non-repudiation of who initiated the transfer", "A trust assumption about the initiating computer's security"],
        correctIndex: 1,
        modelAnswer: "An independent, out-of-band confirmation step is exactly the kind of extra layer defence-in-depth adds — it doesn't rely on the same system/UI that could itself be compromised or manipulated.",
      },
      {
        type: "mcq",
        prompt: "Which statement best reflects the lecture's view of the relationship between security and usability?",
        options: ["Usability should always be sacrificed for maximum security", "Security and usability are unrelated design concerns", "Security involves trade-offs; more security can reduce usability and convenience", "Usability problems are only a UX team's concern, not a security concern"],
        correctIndex: 2,
        modelAnswer: "The lecture is explicit that security is a trade-off, not a free upgrade — stronger controls often cost convenience, and that cost has to be weighed deliberately.",
      },
      {
        type: "truefalse",
        prompt: "True or False: In system modeling, \"the environment\" refers to the physical or network context a system operates in (e.g. public Wi-Fi, a data centre), not a component or actor.",
        options: ["True", "False"],
        correctIndex: 0,
        modelAnswer: "Environment describes the surrounding context (where/how the system runs), distinct from components (technical parts) and actors (people/entities involved).",
      },
      {
        type: "truefalse",
        prompt: "True or False: An attacker's \"capability\" and their \"goal\" describe the same thing — what they are able to do.",
        options: ["True", "False"],
        correctIndex: 1,
        modelAnswer: "Goal is what the attacker wants to achieve (e.g. steal funds); capability is what they are actually able to do to pursue that goal (e.g. exploit a specific software flaw, act as a trusted insider) — related but distinct parts of an attacker profile, alongside their attack vector.",
      },
      {
        type: "mcq",
        prompt: "An attacker doesn't steal or alter any data but manages to keep an online exam portal offline for the entire two-hour exam window with a flood of junk traffic. Which CIA property is violated?",
        options: ["Confidentiality", "Integrity", "Availability", "Accountability"],
        correctIndex: 2,
        modelAnswer: "Denying legitimate access to a service for its intended duration is an availability violation.",
      },
      {
        type: "mcq",
        prompt: "A disgruntled employee with legitimate database access quietly changes a colleague's performance review score before it's finalised. Which CIA property is violated?",
        options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
        correctIndex: 1,
        modelAnswer: "Unauthorised modification of data by someone who technically has access, but not the authority to make that change, is an integrity violation.",
      },
      {
        type: "mcq",
        prompt: "According to the Security Lifecycle, conducting a formal post-mortem after a breach and feeding the findings back into secure design belongs mainly to which two stages, in order?",
        options: ["Before deployment, then after deployment", "After incident, then build securely (next cycle)", "After deployment, then after incident", "Build securely, then after deployment"],
        correctIndex: 1,
        modelAnswer: "A post-mortem is an \"after incident\" activity; feeding its lessons back into design starts the next cycle's \"build securely\" stage — the lifecycle is a loop, not a straight line.",
      },
      {
        type: "mcq",
        prompt: "Which of these is the best description of why the Bybit incident is described as a failure of both technology and people?",
        options: ["The cryptography used to sign cold wallet transactions was mathematically broken, letting attackers forge valid signatures", "Staff trusted a manipulated UI and approved a transaction without independently verifying what was actually being signed", "Bybit had no firewall at all in front of its internal network, leaving every service exposed directly to the internet", "The attackers exploited an expired SSL certificate to intercept and silently alter transaction data as it was signed"],
        correctIndex: 1,
        modelAnswer: "The technology (cold wallet cryptography) worked as designed; the failure was a human/process one — trusting a display without independent verification — which is exactly why the lecture frames it as both a technical and human failure.",
      },
      {
        type: "short",
        prompt: "A classmate says \"our system uses AES-256 encryption everywhere, so it's secure.\" Using the CIA triad, explain why this claim is incomplete.",
        modelAnswer:
          "Encryption is like sealing letters in strong envelopes. Great for stopping people reading them — but it doesn't stop the post office being shut down, and it doesn't help if someone steals your wax seal.\n\n• What encryption covers: mostly confidentiality — keeping data secret. With proper authentication it also helps integrity of stored and sent data.\n\n• What it doesn't cover — availability: scrambled data still goes offline in a denial-of-service flood or a server crash. Encryption does nothing there.\n\n• What it doesn't cover — integrity, if keys leak: if the encryption keys or the machines handling the unscrambled data are compromised, the attacker can change things freely.\n\n• The barrel point: \"secure\" based on one control covering one of the three CIA properties ignores the other two and every other plank.\n\nSo the answer is: AES-256 mainly buys confidentiality; it says little about staying online or about tampering once keys or endpoints are compromised, so the system isn't automatically \"secure\".",
      },
      {
        type: "short",
        prompt: "Explain why \"the network connection between the card reader and the bank server is protected\" is a trust assumption rather than a component in an ATM system model, and describe one way this specific assumption could fail in practice.",
        modelAnswer:
          "A component is a thing. A trust assumption is a belief about that thing that you don't re-check.\n\n• The component: the network cable or link between the ATM's card reader and the bank server is a real part, so it's a component.\n\n• The assumption: \"that connection is protected\" is a belief — that nobody can listen in on it or tamper with it. The rest of the model just relies on that being true.\n\n• How it fails in practice: an attacker splices a rogue device into the line between the ATM and the bank (a man-in-the-middle skimmer) and copies card numbers and PINs as they pass, before they ever reach the bank.\n\nSo the answer is: the link is a component, but \"it's protected\" is an unchecked belief about it, and a wiretap-style skimmer on that line breaks the belief.",
      },
      {
        type: "short",
        prompt: "Give an original example of a system where increasing security noticeably reduces usability, and explain the specific trade-off being made.",
        modelAnswer:
          "Security and convenience usually pull in opposite directions, like a heavier front door that's safer but harder to open.\n\n• The example: a company makes every login to its internal wiki require a physical security key — a little USB dongle you plug in.\n\n• The security gain: someone who steals a password still can't get in without the physical key, so account takeovers drop sharply.\n\n• The usability cost: staff can't quickly check the wiki from a borrowed laptop or their phone without carrying the dongle, and if they lose it they're locked out completely.\n\n• The trade-off in one line: everyday speed and \"log in from anywhere\" is given up in exchange for strong protection against stolen passwords.\n\nSo the answer is: mandatory hardware keys stop password theft but cost quick, device-anywhere access — that's the trade being made.",
      },
      {
        type: "scenario",
        prompt: "A university library system lets students reserve physical books online and lets staff issue digital fines for overdue returns. a) Build a system model: 3 components, 2 actors, the environment, 2 trust assumptions. b) Build a threat model: one attacker, their goal, capability, and vector. c) State one integrity property and one availability property that must hold.",
        modelAnswer:
          "Describe the library system, then think like a student dodging fines, then say what must stay true.\n\n• Components: the student website, the reservation and catalogue server, the fines database, the staff terminal.\n\n• Actors: the student, the library staff.\n\n• Environment: used from campus wifi and from students' own devices off campus.\n\n• Trust assumptions: \"only logged-in staff terminals can add or cancel fines\", and \"the reservation server correctly ties a booking to whoever is logged in\".\n\n• Attacker and goal: a student who wants to wipe out their own overdue fines.\n\n• Capability and vector: they have a normal student login and find a staff-only \"adjust fine\" web request that isn't properly locked down, then call it directly, skipping the screen that would normally stop a student reaching it.\n\n• Must stay true: Integrity — a fine amount only changes through authorised staff action, never by the student who owes it. Availability — the reservation system stays up during busy times like exam period.\n\nSo the answer is: model it, the threat is a student calling a weakly-protected staff \"adjust fine\" request, and I/A mean fines are staff-only to change and reservations stay reachable at peak.",
      },
      {
        type: "scenario",
        prompt: "A smart doorbell vendor pushes a firmware update automatically to every installed device overnight with no user confirmation. a) Identify one new trust assumption this update mechanism introduces that didn't exist before. b) Describe an attack that would violate integrity via this mechanism, and one concrete lifecycle control that would reduce that risk.",
        modelAnswer:
          "Auto-updates are like leaving a key with a builder so they can come fix things while you sleep. Handy — but only safe if it's really the builder.\n\n• The new trust assumption: \"every update sent down this channel really comes from the vendor and hasn't been swapped or altered on the way\". Before auto-update, nothing was silently changing the doorbell overnight.\n\n• The integrity attack: an attacker breaks into the vendor's update server, or intercepts the update on the wire, and pushes evil software to thousands of doorbells at once — quietly adding a hidden feature that streams everyone's video to the attacker.\n\n• The lifecycle control: before deployment, require every update to be digitally signed by the vendor and checked on the device before it installs, so a doorbell refuses anything not signed with the vendor's private key. That directly closes the assumption in part (a) instead of just hoping the channel is never hacked.\n\nSo the answer is: the new assumption is \"updates are genuine and untampered\"; break it by pushing malicious firmware from a hacked update server, and fix it with signed, on-device-verified updates.",
      },
    ],
  }

export const WEEK_1_PAPERS: ExamPaperSeed[] = [PAPER];
