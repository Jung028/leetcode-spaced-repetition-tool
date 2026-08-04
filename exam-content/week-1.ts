import type { ExamPaperSeed } from "./types";

const SOURCE_FILES = [
  "INFO5995 Week 1 - Exam Practice Questions.md",
  "lecture/INFO5995_Week_1_Extra_Resources.pdf",
  "lecture/Week01-Introduction, cybersecurity basics, security lifecycle, system and threat models.pdf",
];

const PAPER_1: ExamPaperSeed = {
  week: 1,
  paperNumber: 1,
  title: "Week 1 Practice Paper 1",
  topics:
    "Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study",
  sourceFiles: SOURCE_FILES,
  questions: [
    {
      type: "mcq",
      prompt: "Which of the following best describes why \"a perfectly closed castle is secure but useless\"?",
      options: [
        "Closed systems are more expensive to build",
        "Systems must allow access for people, information, and business to function, and that access is what creates risk",
        "Attackers always find a way in eventually",
        "Castles are an outdated security metaphor with no modern relevance",
      ],
      correctIndex: 1,
      modelAnswer:
        "A closed system has no doors, so nothing valuable can be used; the moment access is added for legitimate use, risk is introduced too.",
    },
    {
      type: "mcq",
      prompt: "In the Wooden Barrel Theory of security, what determines how much \"water\" (security capacity) a system can hold?",
      options: [
        "The average height of all the boards (layers)",
        "The number of layers of defence, regardless of quality",
        "The shortest/weakest board — the system is only as strong as its weakest point",
        "The cost invested in the tallest board",
      ],
      correctIndex: 2,
      modelAnswer:
        "Attackers look for the shortest board; the system's overall security is capped by its weakest point, not its average or its best control.",
    },
    {
      type: "truefalse",
      prompt: "True or False: Adding more layers of security controls guarantees a system is fully protected against all threats.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "The lecture explicitly states no single control protects the whole system — layers reduce risk, they don't eliminate it; one weak point can still undermine everything.",
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
      prompt:
        "A DDoS (Distributed Denial of Service) attack that floods a server with fake requests so real users can't connect primarily threatens which CIA property?",
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
      options: [
        "Intrusion detection",
        "Fuzzing and dynamic analysis in production",
        "Defining security goals/properties and manual audits",
        "Disaster recovery and freezing stolen funds",
      ],
      correctIndex: 2,
      modelAnswer:
        "Defining goals/security properties, best-coding practice, and manual audit are all pre-deployment activities. Intrusion detection and fuzzing in production are after deployment; disaster recovery is after an incident.",
    },
    {
      type: "mcq",
      prompt: "Which of these activities belongs to the after incident phase of the security lifecycle?",
      options: [
        "Static analysis of source code",
        "Post-mortem review and disaster recovery",
        "Best-practice secure coding",
        "Intrusion prevention systems",
      ],
      correctIndex: 1,
      modelAnswer:
        "Post-mortem and disaster recovery (freezing money, tracing, insurance, legal) are explicitly \"after incident\" activities.",
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
      modelAnswer:
        "\"The network connection is protected\" is an assumption about the system, not a physical/logical component. The card reader, bank server, and customer are components/actors.",
    },
    {
      type: "mcq",
      prompt:
        "When threat modeling, \"what can they do?\" (e.g. steal a password, exploit software, act as an insider) refers to which part of the attacker profile?",
      options: ["Adversary goals", "Adversary capabilities", "Attack surface", "Trust boundary"],
      correctIndex: 1,
      modelAnswer:
        "\"What can they do?\" maps to capabilities, as distinct from goals (\"what do they want?\") and attack vector (the path they take).",
    },
    {
      type: "mcq",
      prompt: "In the Bybit case, what was the root cause that allowed attackers to steal ~$1.4 billion?",
      options: [
        "A weak password on the cold wallet",
        "A DDoS attack that overwhelmed Bybit's servers",
        "Staff approved a transaction based on a fake/manipulated UI screen without independent verification by the cold wallet system",
        "An expired TLS certificate",
      ],
      correctIndex: 2,
      modelAnswer:
        "Attackers presented a manipulated approval screen; staff approved via the UI without independent verification, and the cold wallet signed without re-checking what was actually being signed.",
    },
    {
      type: "truefalse",
      prompt: "True or False: The Bybit incident shows that cybersecurity failures are always purely technical (software) failures, never human ones.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "The lecture's explicit takeaway is \"security means protecting both the technology and the people who use it\" — Bybit shows human/process failure, not just a technical bug.",
    },
    {
      type: "short",
      prompt:
        "Explain, in your own words, why modern cybersecurity can no longer be modeled as a single \"castle\" with one boundary. What replaced this model in the lecture, and why does every connection in that replacement create risk?",
      modelAnswer:
        "Modern systems are distributed across many connected components (user → computer → internet → web server → switch → backend server → database), so there is no single perimeter to defend. This was replaced by a defence-in-depth / layered model, where protections (MFA, firewalls, intrusion detection, encryption) are placed at multiple points along the chain. Every connection point that enables the system to function is also a potential entry point for an attacker — functionality and risk are two sides of the same coin.",
    },
    {
      type: "short",
      prompt:
        "Define each part of the CIA Triad in one sentence each, and give one original example (not from the slides) of an attack or failure for each property.",
      modelAnswer:
        "Confidentiality: only authorised parties can view data/services (e.g. an attacker sniffing unencrypted Wi-Fi traffic to read someone's login credentials). Integrity: information/system state can't be changed without authorisation (e.g. a student altering their own grade in a database they shouldn't have write access to). Availability: authorised users can access the system when they need it (e.g. a ransomware attack encrypting a hospital's patient records system so doctors can't access it).",
    },
    {
      type: "short",
      prompt:
        "List the four stages of the Week 1 \"Take Away 2: Security is a Lifecycle\" summary (build → ? → ? → ?) and briefly explain what happens in each stage.",
      modelAnswer:
        "Build securely (understand assets → identify threats → test for weaknesses) → Watch and protect (monitor → detect suspicious activity → patch/improve) → Respond (contain → recover → investigate) → Learn and strengthen (fix weaknesses, feed lessons into the next cycle). It's a continuous loop, not a straight line.",
    },
    {
      type: "short",
      prompt:
        "Explain the difference between a system model and a threat model. Why do you need both before you can reason about a system's security?",
      modelAnswer:
        "A system model describes what actually exists and how it's supposed to work: components, actors, environment, and trust assumptions (the \"as-designed\" view). A threat model describes how it could be attacked: adversary types, goals, capabilities, and attack vectors (the \"as-attacked\" view). You need the system model first because you can't identify realistic threats or broken assumptions without knowing what's actually there and what you're assuming to be true.",
    },
    {
      type: "short",
      prompt:
        "List the five components of a system model as taught in the ATM example (components, actors, environment, trust assumptions — plus one more). For each, give one example that is different from the ATM slide.",
      modelAnswer:
        "Components (technical parts), Actors (people/entities involved), Environment (context/setting), Trust Assumptions (things assumed secure/true), and — implicitly — Assets (what's valuable, shown explicitly in the Bybit model as \"cold wallet funds\"). Example set for a different system (online banking app): components = mobile app, API server, database; actors = customer, bank employee, third-party auditor; environment = personal smartphone on public Wi-Fi; trust assumptions = \"the app was not tampered with before install,\" \"the OS keychain protecting stored credentials is secure.\"",
    },
    {
      type: "short",
      prompt:
        "For threat modeling, three questions define an attacker: what do they want, what can they do, and what path/vector do they use. Apply this to a phishing email attacker targeting a university student.",
      modelAnswer:
        "Goal: obtain the student's university login credentials (to access grades, financial info, or pivot to other accounts). Capability: can craft a convincing fake email/login page mimicking the university portal, can spoof sender addresses. Attack vector: email lands in inbox → student clicks link → enters credentials on fake page → attacker captures and reuses them, exploiting the student's trust in familiar branding and urgency cues rather than a technical software flaw.",
    },
    {
      type: "short",
      prompt:
        "Explain the \"wooden barrel theory\" and connect it explicitly to the Bybit case: which \"board\" (layer) was the shortest, and what should have been done to lengthen it?",
      modelAnswer:
        "The wooden barrel theory says a system's overall security is limited by its weakest layer (people, devices, networks, software, data), no matter how strong the other layers are. In Bybit, the technical layers (cold wallet cryptography, aggregate signatures) were strong, but the people/process layer was the shortest board — staff trusted what the UI displayed without independently verifying the transaction, and the cold wallet signed without re-displaying/re-checking what it was actually signing. Lengthening that board would mean adding independent, out-of-band verification of transaction details before signing (e.g. a second display device showing the raw transaction data, not just what the UI claims).",
    },
    {
      type: "short",
      prompt:
        "The unit outline lists 15 learning outcomes across five categories. Why do you think Week 1 spends most of its time on system models, threat models, and the CIA triad rather than jumping straight into technical attacks? What foundation does this build for later weeks?",
      modelAnswer:
        "Week 1 builds a transferable way of thinking rather than a list of memorised attacks: system modeling forces you to name assets and trust assumptions, and threat modeling forces you to ask who would attack them and how. Every later topic (cryptography, authentication, network security, AI security, blockchain security) is really just \"what are the assets/assumptions in this specific domain, and how are they attacked?\" — so mastering the Week 1 framework early means the same five-step process (model the system → model expected behaviour → think like an attacker → define what must be protected → know your attacker) applies to any new topic instead of memorising each domain separately.",
    },
    {
      type: "scenario",
      prompt:
        "A university uses an online exam portal where students log in, complete a timed quiz, and submit answers automatically saved to a server. a) Build a system model: identify at least 3 components, 2 actors, the environment, and 2 trust assumptions. b) Build a threat model: identify one plausible attacker, their goal, their capability, and a likely attack vector. c) State one confidentiality, one integrity, and one availability property that must hold for this system.",
      modelAnswer:
        "a) Components: student device/browser, exam portal web server, authentication service, answer-storage database, timer service. Actors: student, instructor/invigilator, IT admin. Environment: accessed remotely over the public internet, potentially on personal/unmanaged devices. Trust assumptions: \"the authentication service correctly verifies student identity,\" \"the timer/submission service reliably captures answers before the deadline.\" b) Attacker: a student wanting a better grade. Goal: view exam questions early or alter submitted answers after the deadline. Capability: has legitimate login credentials, may attempt to exploit a flaw in the submission API or session handling. Vector: intercepting/replaying an API request to resubmit answers after time expires, or exploiting a predictable URL/ID to access another student's exam session. c) Confidentiality: exam questions must not be visible before the scheduled start time. Integrity: submitted answers must not be alterable after the deadline. Availability: the portal must stay up and accept submissions throughout the exam window.",
    },
    {
      type: "scenario",
      prompt:
        "A smart home doorbell camera streams video to an app and lets the homeowner unlock the front door remotely. a) Identify one component-level trust assumption that, if broken, would compromise the whole system (link this to the Wooden Barrel Theory). b) Describe an attack that would violate confidentiality, and a separate attack that would violate availability.",
      modelAnswer:
        "a) Trust assumption: \"the cloud service that relays the unlock command is not compromised and only accepts commands from the authenticated homeowner app.\" If an attacker compromises that cloud relay or the app's authentication token, every downstream control (locks, cameras) is worthless — this is the shortest board in the barrel, since a strong physical lock means nothing if the digital unlock path is broken. b) Confidentiality violation: an attacker gains unauthorised access to the video feed and watches the homeowner's live camera without permission. Availability violation: an attacker floods the home Wi-Fi/router with traffic (or jams the doorbell's wireless signal) so the doorbell can't alert the homeowner or stream video when someone is actually at the door.",
    },
    {
      type: "scenario",
      prompt:
        "Revisit the Bybit case one more time, but now argue it from a defender's perspective using the security lifecycle: for each of the three phases (before deployment, after deployment, after incident), suggest one concrete control Bybit could have implemented to prevent or limit the loss.",
      modelAnswer:
        "Before deployment: require the cold wallet system to independently decode and display the actual raw transaction being signed (not just trust the UI's claim), and mandate a formal manual audit/threat model of the approval workflow before launch. After deployment: monitor for anomalous large withdrawal patterns and add automatic holds/alerts on unusually large transfers pending secondary review. After incident: run a post-mortem to identify that \"trusting the UI without independent verification\" was the root cause, then feed that lesson back by mandating out-of-band verification for all future high-value approvals.",
    },
    {
      type: "scenario",
      prompt:
        "A classmate says: \"If we just add a firewall and multi-factor authentication, our system will be secure.\" Using concepts from Week 1 (layered defence, CIA triad, lifecycle, trust assumptions), explain why this statement is incomplete, and what else needs to be considered.",
      modelAnswer:
        "This statement conflates two controls (a firewall and MFA) with \"security\" as a whole. Week 1's layered-defence and wooden-barrel arguments show that no single control — or even two controls — protects the whole system; a firewall doesn't protect data integrity once it's inside the network, and MFA doesn't stop a socially engineered staff member from approving a malicious request (as in Bybit) or a vulnerability in the application code itself. A complete view also needs: coverage of all three CIA properties (not just access control), a full lifecycle (build, monitor, respond, learn — not a one-time setup), and explicit trust assumptions about every component, because attackers look for whichever assumption is weakest, not necessarily the front door.",
    },
  ],
};

const PAPER_2: ExamPaperSeed = {
  week: 1,
  paperNumber: 2,
  title: "Week 1 Practice Paper 2",
  topics:
    "Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study",
  sourceFiles: SOURCE_FILES,
  questions: [
    {
      type: "mcq",
      prompt:
        "A company replaces its single external firewall with firewalls at the network edge, between internal subnets, and on each server, plus endpoint antivirus on every laptop. This is an example of:",
      options: ["Zero trust networking", "Defence-in-depth / layered defence", "The castle model", "Air-gapping"],
      correctIndex: 1,
      modelAnswer:
        "Defence-in-depth places multiple independent layers of control along the path an attacker would have to travel, rather than relying on one perimeter — exactly what stacking firewalls, segmentation, and endpoint protection does.",
    },
    {
      type: "mcq",
      prompt:
        "In the Wooden Barrel Theory, if four of five security layers are excellent but the fifth (staff training) is very weak, the system's overall security is best described as:",
      options: [
        "Strong, because 4 out of 5 layers are excellent",
        "The average of all five layers",
        "Limited by the weakest layer (staff training)",
        "Undefined without a numeric score",
      ],
      correctIndex: 2,
      modelAnswer:
        "The barrel holds only as much water as its shortest board — one weak layer caps the whole system's security regardless of how strong the others are.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: A system with ten layers of defence is always more secure than a system with only three well-designed and well-reviewed layers.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Quantity of layers isn't the deciding factor — a small number of well-chosen, well-maintained layers can outperform many redundant or poorly-configured ones; the barrel theory cares about the weakest layer, not the count.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Trade-offs between security and usability mean that the \"most secure\" design is not always the design that should be shipped.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "Security involves trade-offs — a maximally secure design that's unusable will get bypassed or abandoned by real users, so the right design balances protection against usability rather than maximising security alone.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker gains read-only access to a company's customer database and downloads emails and phone numbers without modifying anything or affecting service. Which CIA property is violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
      correctIndex: 0,
      modelAnswer: "Unauthorised viewing of data with no modification or disruption is a confidentiality breach.",
    },
    {
      type: "mcq",
      prompt:
        "A ransomware attack encrypts a hospital's files so doctors can't open patient records, but the data itself is not stolen or altered. Which CIA property is primarily violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
      correctIndex: 2,
      modelAnswer:
        "Blocking authorised users from accessing data they need, when they need it, is an availability violation — even though nothing was read or changed.",
    },
    {
      type: "mcq",
      prompt:
        "According to the Week 1 Security Lifecycle model, patching a known vulnerability in a running production system belongs to which phase?",
      options: [
        "Before deployment",
        "After deployment",
        "After incident",
        "None of these — patching isn't part of the lifecycle",
      ],
      correctIndex: 1,
      modelAnswer:
        "Patching a live system is a \"watch and protect\" activity that happens once the system is already running, not before launch or specifically after a breach.",
    },
    {
      type: "mcq",
      prompt: "In the Bybit case, which of the following is the most accurate root-cause description?",
      options: [
        "A brute-force password attack on the cold wallet",
        "A DDoS attack overwhelming Bybit's infrastructure",
        "Staff approved a transaction based on a manipulated UI without independent verification",
        "A supply-chain compromise of Bybit's cloud provider",
      ],
      correctIndex: 2,
      modelAnswer:
        "The root cause was a process/human failure: staff trusted what the approval UI displayed instead of independently verifying the actual transaction being signed.",
    },
    {
      type: "short",
      prompt:
        "Explain in your own words the difference between a system model and a threat model, using an example system of your choosing (not the ATM or Bybit).",
      modelAnswer:
        "A system model describes what exists and how it's meant to work — its components, actors, environment, and trust assumptions (the \"as-designed\" view). A threat model describes how that system could be attacked — who the adversaries are, what they want, what they can do, and the vector they'd use (the \"as-attacked\" view). Example: for a food-delivery app, the system model names the rider's phone, the restaurant's tablet, the matching server, and the payment gateway as components, with a trust assumption like \"the rider's GPS location is not spoofed\"; the threat model then asks who would exploit that assumption (a rider spoofing location to fake a delivery) and how (a GPS-spoofing app).",
    },
    {
      type: "short",
      prompt:
        "List the four stages of the \"Security is a Lifecycle\" takeaway and briefly explain what changes about a system's security posture between the \"before deployment\" and \"after deployment\" stages.",
      modelAnswer:
        "Build securely → Watch and protect → Respond → Learn and strengthen. Before deployment, security work is preventive and design-time (threat modeling, secure coding, manual audit, defining what needs protecting); after deployment, it shifts to operational and reactive activities against a live system (monitoring, intrusion detection, patching newly found issues) — the system is now exposed to real traffic and real attackers, so the goal moves from \"design this well\" to \"watch this constantly.\"",
    },
    {
      type: "short",
      prompt:
        "Give an original example (not from lecture) of a single trust assumption whose failure would compromise an entire system, and explain why it is the \"shortest board\" in that system's barrel.",
      modelAnswer:
        "A password manager's trust assumption might be \"the master password is never intercepted by anything running on the user's device.\" If a keylogger captures that one password, every credential the manager stores is instantly compromised regardless of how strong the encryption or how many other controls exist — it is the shortest board because every other layer of protection is downstream of, and depends on, that single assumption holding.",
    },
    {
      type: "scenario",
      prompt:
        "A ride-share app lets drivers see a passenger's pickup location and lets passengers rate drivers after the trip. a) Build a system model: name 3 components, 2 actors, the environment, and 1 trust assumption. b) Identify one attacker whose goal is to see a passenger's home address without authorisation, and describe their likely capability and attack vector. c) State one confidentiality property and one integrity property that must hold.",
      modelAnswer:
        "a) Components: passenger app, driver app, matching/dispatch server, ratings database, payment processor. Actors: passenger, driver, support staff. Environment: personal smartphones over public cellular/Wi-Fi networks. Trust assumption: \"the dispatch server only reveals a passenger's precise location to the driver actually assigned to their trip.\" b) Attacker: a driver (or ex-driver with residual access) wanting to stalk a specific passenger. Capability: legitimate access to the driver app plus ability to record/screenshot trip data, possibly abusing an API that doesn't expire location access after trip completion. Vector: requesting or re-accessing a past trip's location data through the driver app's API after the ride has ended. c) Confidentiality: a passenger's home/pickup address must not be visible to any driver other than the one assigned to that specific trip, and not after the trip ends. Integrity: a driver's star rating must only be updated by the passenger who actually completed that specific trip.",
    },
    {
      type: "scenario",
      prompt:
        "Revisit the Wooden Barrel Theory and apply it to a university's learning management system (LMS) that stores grades. a) Identify a plausible \"shortest board\" for the LMS (people, process, or technology) and justify your choice. b) Recommend one concrete control that would lengthen that specific board, and explain, using the Security Lifecycle, which phase that control belongs to.",
      modelAnswer:
        "a) A plausible shortest board is the process around teaching-assistant accounts: TAs are often granted broad grade-editing access for convenience, with no time-limited scope or logging of which TA changed which grade — even if the LMS itself uses strong encryption and MFA, this overly broad, unaudited access is the weakest point an attacker (or a dishonest insider) would target. b) Control: restrict TA accounts to grade-editing only for the specific course/section they're assigned to, with all changes logged and reviewable, and access automatically revoked at semester end. This is a \"before deployment\" control if built into the access model from the start, or a \"watch and protect\" (after deployment) control if added later as continuous monitoring/alerting on unusual grade-change patterns.",
    },
  ],
};

const PAPER_3: ExamPaperSeed = {
  week: 1,
  paperNumber: 3,
  title: "Week 1 Practice Paper 3",
  topics:
    "Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study",
  sourceFiles: SOURCE_FILES,
  questions: [
    {
      type: "mcq",
      prompt:
        "A bank adds a second, independent device that must physically confirm a large wire transfer before it executes, even though the initiating computer has already approved it. This most directly demonstrates:",
      options: [
        "The castle model",
        "Defence-in-depth via an independent verification layer",
        "Non-repudiation",
        "A trust assumption",
      ],
      correctIndex: 1,
      modelAnswer:
        "An independent, out-of-band confirmation step is exactly the kind of extra layer defence-in-depth adds — it doesn't rely on the same system/UI that could itself be compromised or manipulated.",
    },
    {
      type: "mcq",
      prompt: "Which statement best reflects the lecture's view of the relationship between security and usability?",
      options: [
        "Usability should always be sacrificed for maximum security",
        "Security and usability are unrelated design concerns",
        "Security involves trade-offs; more security can reduce usability and convenience",
        "Usability problems are only a UX team's concern, not a security concern",
      ],
      correctIndex: 2,
      modelAnswer:
        "The lecture is explicit that security is a trade-off, not a free upgrade — stronger controls often cost convenience, and that cost has to be weighed deliberately.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In system modeling, \"the environment\" refers to the physical or network context a system operates in (e.g. public Wi-Fi, a data centre), not a component or actor.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "Environment describes the surrounding context (where/how the system runs), distinct from components (technical parts) and actors (people/entities involved).",
    },
    {
      type: "truefalse",
      prompt: "True or False: An attacker's \"capability\" and their \"goal\" describe the same thing — what they are able to do.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Goal is what the attacker wants to achieve (e.g. steal funds); capability is what they are actually able to do to pursue that goal (e.g. exploit a specific software flaw, act as a trusted insider) — related but distinct parts of an attacker profile, alongside their attack vector.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker doesn't steal or alter any data but manages to keep an online exam portal offline for the entire two-hour exam window with a flood of junk traffic. Which CIA property is violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Accountability"],
      correctIndex: 2,
      modelAnswer: "Denying legitimate access to a service for its intended duration is an availability violation.",
    },
    {
      type: "mcq",
      prompt:
        "A disgruntled employee with legitimate database access quietly changes a colleague's performance review score before it's finalised. Which CIA property is violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
      correctIndex: 1,
      modelAnswer:
        "Unauthorised modification of data by someone who technically has access, but not the authority to make that change, is an integrity violation.",
    },
    {
      type: "mcq",
      prompt:
        "According to the Security Lifecycle, conducting a formal post-mortem after a breach and feeding the findings back into secure design belongs mainly to which two stages, in order?",
      options: [
        "Before deployment, then after deployment",
        "After incident, then build securely (next cycle)",
        "After deployment, then after incident",
        "Build securely, then after deployment",
      ],
      correctIndex: 1,
      modelAnswer:
        "A post-mortem is an \"after incident\" activity; feeding its lessons back into design starts the next cycle's \"build securely\" stage — the lifecycle is a loop, not a straight line.",
    },
    {
      type: "mcq",
      prompt: "Which of these is the best description of why the Bybit incident is described as a failure of both technology and people?",
      options: [
        "The cryptography used was mathematically broken",
        "Staff trusted a manipulated UI and approved a transaction without independently verifying what was actually being signed",
        "Bybit had no firewall at all",
        "The attackers exploited an expired SSL certificate",
      ],
      correctIndex: 1,
      modelAnswer:
        "The technology (cold wallet cryptography) worked as designed; the failure was a human/process one — trusting a display without independent verification — which is exactly why the lecture frames it as both a technical and human failure.",
    },
    {
      type: "short",
      prompt:
        "A classmate says \"our system uses AES-256 encryption everywhere, so it's secure.\" Using the CIA triad, explain why this claim is incomplete.",
      modelAnswer:
        "Strong encryption mainly protects confidentiality (and, with proper authentication, integrity of data in transit/at rest) — it says nothing about availability (encryption doesn't stop a DDoS attack or a hardware failure taking the system offline) and nothing about integrity if the encryption keys themselves or the endpoints handling the plaintext are compromised. Claiming a system is \"secure\" based on one control covering one CIA property ignores the other two and every other layer the wooden barrel theory says the system's real security depends on.",
    },
    {
      type: "short",
      prompt:
        "Explain why \"the network connection between the card reader and the bank server is protected\" is a trust assumption rather than a component in an ATM system model, and describe one way this specific assumption could fail in practice.",
      modelAnswer:
        "A component is a physical or logical part of the system (the card reader, the bank server, the network link itself); a trust assumption is a belief about how a component behaves or is protected that the rest of the model relies on without re-verifying it. \"The connection is protected\" assumes the link can't be eavesdropped on or tampered with — in practice this could fail if an attacker installs a rogue device between the ATM and the network (a man-in-the-middle skimmer) that intercepts card and PIN data before it reaches the bank.",
    },
    {
      type: "short",
      prompt:
        "Give an original example of a system where increasing security noticeably reduces usability, and explain the specific trade-off being made.",
      modelAnswer:
        "Requiring hardware security-key MFA (e.g. a physical YubiKey) for every login to a company's internal wiki significantly reduces account-takeover risk, but it also means employees can't quickly check the wiki from a borrowed device or their phone without carrying the key, and losing the key locks them out entirely — trading day-to-day convenience and accessibility for stronger protection against credential theft.",
    },
    {
      type: "scenario",
      prompt:
        "A university library system lets students reserve physical books online and lets staff issue digital fines for overdue returns. a) Build a system model: 3 components, 2 actors, the environment, 2 trust assumptions. b) Build a threat model: one attacker, their goal, capability, and vector. c) State one integrity property and one availability property that must hold.",
      modelAnswer:
        "a) Components: student web portal, reservation/catalog server, fines database, staff terminal. Actors: student, library staff. Environment: accessed from campus Wi-Fi and students' personal devices off-campus. Trust assumptions: \"only authenticated staff terminals can issue or waive fines,\" \"the reservation server correctly attributes a reservation to the student who is logged in.\" b) Attacker: a student wanting to avoid paying fines. Goal: erase or reduce their own outstanding fines. Capability: valid student login, possibly discovering an unauthenticated or poorly-authorised staff API endpoint. Vector: directly calling the fines-adjustment endpoint that should be staff-only, bypassing the UI that would normally block a student from reaching it. c) Integrity: a fine amount must only be changed by authorised staff action, never by the student who owes it. Availability: the reservation system must stay reachable during peak periods (e.g. exam-period book reservations).",
    },
    {
      type: "scenario",
      prompt:
        "A smart doorbell vendor pushes a firmware update automatically to every installed device overnight with no user confirmation. a) Identify one new trust assumption this update mechanism introduces that didn't exist before. b) Describe an attack that would violate integrity via this mechanism, and one concrete lifecycle control that would reduce that risk.",
      modelAnswer:
        "a) New trust assumption: \"every firmware update pushed through this channel genuinely comes from the vendor and has not been tampered with in transit or at the update server.\" b) Integrity attack: an attacker compromises the vendor's update server (or intercepts the update channel) and pushes malicious firmware to thousands of doorbells at once, silently adding a backdoor that streams video to the attacker. Lifecycle control: before deployment, require all firmware updates to be cryptographically signed and verified on-device before installation, so a device rejects any update that isn't signed by the vendor's private key — this closes the exact trust assumption identified in (a) instead of just hoping the update channel is never compromised.",
    },
  ],
};

export const WEEK_1_PAPERS: ExamPaperSeed[] = [PAPER_1, PAPER_2, PAPER_3];
