import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 9,
  paperNumber: 3,
  title: "Predicted Exam Practice Paper",
  topics:
    "Predicted-exam practice MCQs converted from the student's own AI-authored 'Predicted Exam - INFO5995' prediction document, grounded in the official INFO5995 Exam Revision Question Bank: Weeks 1-8 (with MCQs, Answered). Covers the Week 9 Mixed MCQ Practice set (the can we / may we / should we ethics test, the ACS and ACM codes of ethics, responsible disclosure, the five factors Australian law uses to judge unauthorised computer access, the Notifiable Data Breaches scheme, Australian Privacy Principle 11, ISO/IEC 27001 versus the NIST Cybersecurity Framework, the event/alert/incident/breach severity ladder, containment trade-offs, Recovery Time Objective versus Recovery Point Objective, Raft consensus, and blockchain eclipse/selfish-mining/sandwich attacks) plus the Weeks 1-8 Gap-Fill MCQ Practice set (Kerckhoffs's principle applied to password hashing, TLS's transport-layer-only scope, non-repudiation via digital signatures versus MACs, and the weakest-link principle across layered controls). Phase-1 recognition-only: the source document's scenario-based (a)/(b)/(c) free-response sub-questions are out of scope for this app and are excluded; option order has been shuffled from the source document to remove positional bias while keeping each correct answer's content unchanged.",
  sourceFiles: [
    "Predicted Exam - INFO5995.docx (Desktop, derived from INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf)",
  ],
  questions: [
    // ---------- Week 9 Mixed MCQ Practice (12 questions) ----------
    {
      type: "mcq",
      prompt:
        "A crisis team confirms they are technically able to pay a ransom, but their lawyers are still checking whether paying would break international sanctions law before anyone acts. Which part of the can we / may we / should we test have they not yet cleared?",
      options: [
        "May we",
        "Should we",
        "None — ethics only applies after payment",
        "Can we",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine you could technically climb a fence to get a ball back, but you still need to check whether you are allowed to before you do it.\n\n• Can we: asks whether something is technically possible — already settled here, since the team can pay.\n\n• May we: asks whether it is legally and organisationally permitted — this is exactly what the lawyers are still checking, because some ransomware groups sit on sanctions lists that make payment illegal regardless of what an insurer says.\n\n• Should we: asks whether paying is the right thing to do even if it turns out to be allowed — a separate, later question.\n\n• Why the other options are wrong: ethics does not only switch on after payment, and the scenario is clearly stuck on checking legal permission, not technical possibility or rightness.\n\nSo the answer is: may we, the legal-permission question, which the lawyers have not yet cleared.",
    },
    {
      type: "mcq",
      prompt:
        "Under the ACM (Association for Computing Machinery) Code of Ethics, which principle most directly requires weighing the harm future ransomware victims would suffer if an organisation refuses to pay now?",
      options: [
        "Respect privacy and confidentiality",
        "Contribute to human well-being and avoid harm",
        "Honour intellectual property",
        "Maintain professional competence",
      ],
      correctIndex: 1,
      modelAnswer:
        "Paying a kidnapper once can make kidnapping more tempting for every other family too, not just save your own child this one time.\n\n• What the principle says: contribute to human well-being and avoid harm — professionals must weigh harm to everyone affected, not only the people in front of them right now.\n\n• Why it fits here: refusing to pay protects future victims from a more profitable ransomware economy, which is exactly the kind of wider-harm trade-off this principle is built for.\n\n• Why the other options are wrong: respecting privacy and confidentiality is about protecting information, not weighing future harm; honouring intellectual property is about ownership of work, not safety trade-offs; maintaining professional competence is about staying skilled, not about this ethical weighing.\n\nSo the answer is: contribute to human well-being and avoid harm.",
    },
    {
      type: "mcq",
      prompt:
        "While completing an assignment, a student notices that a local hospital's patient-booking website leaks appointment details through a predictable link, with no authorisation to test the hospital's system. What should the student do first, before telling anyone outside the hospital?",
      options: [
        "Report it to a news outlet",
        "Publish the finding publicly to force a fast fix",
        "Verify the issue is real and reproducible",
        "Exploit it further to measure total impact",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like finding a neighbour's door unlocked — the responsible first move is to quietly check it is really unlocked, not to post about it on the street or walk further inside.\n\n• Verify first: confirm the flaw is real and reproducible, going no further than that, and without extracting real patient data in the process.\n\n• Why not the other options: exploiting it further risks real harm and possibly breaks the law; publishing it or going to a news outlet first skips the hospital's own chance to fix the problem and can cause panic or copycat attacks before a fix exists.\n\nSo the answer is: verify the issue is real and reproducible, the first step of responsible disclosure.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following is NOT one of the five factors Australian law uses to decide whether computer access counts as authorised?",
      options: [
        "The purpose of the access",
        "The person accessing",
        "The system accessed",
        "The brand of antivirus installed",
      ],
      correctIndex: 3,
      modelAnswer:
        "Whether you're allowed into a building depends on who let you in, which building it is, why you're there, how you got in, and when — not which brand of smoke detector is mounted on the wall.\n\n• The real five factors: person, system, purpose, method, and time, taken together.\n\n• Why the odd one is wrong: the brand of antivirus software installed says nothing about who was permitted to access what, for what reason, how, or when, so it is not part of the legal test at all.\n\nSo the answer is: the brand of antivirus installed, since it is not one of the five authorisation factors.",
    },
    {
      type: "mcq",
      prompt:
        "A company's customer database, including driver's licence numbers, is copied by an attacker, but nothing has been published yet. Under Australia's Notifiable Data Breaches (NDB) scheme, what matters most for deciding whether this breach must be reported?",
      options: [
        "Whether the breach is likely to cause serious harm to the individuals concerned",
        "Whether the company already holds an active cyber-insurance policy for this event",
        "Whether the specific attacker behind the breach has since been formally identified",
        "Whether the stolen data has already been published or put up for sale online",
      ],
      correctIndex: 0,
      modelAnswer:
        "A shoplifter has already stolen your wallet the moment they take it, whether or not they've spent the money yet.\n\n• The real trigger: whether the breach is likely to cause serious harm to the people whose information was taken — here, licence numbers and dates of birth are exactly the kind of identity-theft-ready data that makes serious harm likely.\n\n• Why the other options are wrong: publication is not the trigger, since the risk exists the moment the data leaves the company's control; having insurance or identifying the attacker are both irrelevant to whether the breach itself must be reported.\n\nSo the answer is: whether the breach is likely to cause serious harm to the individuals concerned.",
    },
    {
      type: "mcq",
      prompt:
        "Which Australian Privacy Principle (APP) most directly requires an organisation to take reasonable steps to protect the personal information it holds?",
      options: ["APP 3", "APP 11", "APP 12", "APP 1"],
      correctIndex: 1,
      modelAnswer:
        "APP 11 works like a landlord's duty to fit a working lock on your door — not a guarantee nothing bad ever happens, just a reasonable-effort requirement.\n\n• APP 11: requires reasonable steps to protect personal information from misuse, interference, loss, and unauthorised access, modification or disclosure.\n\n• Why the others are wrong: APP 1, APP 3 and APP 12 cover different duties, such as openness about practices and how information is collected, not the security-of-information duty this question is about.\n\nSo the answer is: APP 11, the security-of-personal-information principle.",
    },
    {
      type: "mcq",
      prompt:
        "ISO/IEC 27001 and the NIST (National Institute of Standards and Technology) Cybersecurity Framework both support incident response, but what is the key difference between them?",
      options: [
        "NIST CSF is a binding law organisations must follow; ISO/IEC 27001 is merely an optional internal suggestion",
        "ISO/IEC 27001 and the NIST Cybersecurity Framework are simply two different names for the exact same certification document",
        "ISO/IEC 27001 is a certifiable management-system standard; NIST CSF is a voluntary framework of functions",
        "ISO/IEC 27001 is a certifiable standard that applies only to blockchain-based systems and smart contracts",
      ],
      correctIndex: 2,
      modelAnswer:
        "One is like a certified gym membership an inspector can check off against a list, the other is like a shared coach's playbook everyone agrees to follow even though nobody is grading it.\n\n• ISO/IEC 27001: a certifiable management-system standard — an outside assessor can audit an organisation against it and issue a certificate.\n\n• NIST CSF: a voluntary framework of functions, covering identify, protect, detect, respond, recover and govern, that organises how people think about cybersecurity, without being a law or a certification.\n\n• Why the others are wrong: neither document is a law, they are not interchangeable names for the same thing, and ISO/IEC 27001 applies broadly to information security management, not specifically to blockchains.\n\nSo the answer is: ISO/IEC 27001 is a certifiable standard, while NIST CSF is a voluntary framework of functions.",
    },
    {
      type: "mcq",
      prompt:
        "A monitoring tool flags unusual file-encryption activity on a file server, but nobody has yet confirmed any real damage. At this point, this is best classified as:",
      options: [
        "A disaster",
        "A confirmed data breach",
        "An incident",
        "An alert",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a smoke detector going off — it means something is worth checking, not that the house has already burned down.\n\n• What it is: an alert — a tool or person flagging something as worth a look, before it is confirmed to actually threaten anything.\n\n• Why the escalation matters: event, alert, incident, and data breach form a deliberate ladder of seriousness, and this flag has not yet been confirmed as a real incident or breach.\n\n• Why the other options are wrong: calling it a confirmed data breach or a disaster jumps several rungs up the ladder before any confirmation has happened, and it clearly isn't a confirmed incident yet either.\n\nSo the answer is: an alert, since nothing has been confirmed as a real threat yet.",
    },
    {
      type: "mcq",
      prompt:
        "During a ransomware event at a university, the response team isolates only the affected subnet instead of shutting down the entire network. This decision is an example of:",
      options: [
        "A containment trade-off between disruption and residual risk",
        "A recovery action aimed at restoring full service across the entire network",
        "A lessons-learned finding documented only after the incident has fully concluded",
        "Eradication performed once the malware's full root cause has already been confirmed",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like closing one burning room's door instead of evacuating the whole building — faster for everyone else, but riskier if the fire has already slipped under a different door.\n\n• What it is: a containment trade-off — isolating just the subnet keeps the rest of the university running, but risks that the attacker has already spread somewhere else undetected.\n\n• Why the other options are wrong: eradication is about removing the cause once found, recovery is about restoring services, and lessons learned happens only after the incident is over, while this decision is happening during containment, not any of those later stages.\n\nSo the answer is: a containment trade-off between disruption and residual risk.",
    },
    {
      type: "mcq",
      prompt:
        "Recovery Time Objective (RTO) and Recovery Point Objective (RPO) are best described as:",
      options: [
        "RTO is how much data loss in time is acceptable to lose; RPO is how long an outage is allowed to last before restoration",
        "RTO is how long a system can be down before it must be restored; RPO is how much data loss (in time) is acceptable",
        "Both RTO and RPO measure exactly the same underlying recovery concept, just using two different traditional names",
        "Both RTO and RPO are terms that apply exclusively to ransomware incidents and no other kind of outage",
      ],
      correctIndex: 1,
      modelAnswer:
        "RTO is like how long a shop can stay closed before customers stop coming back; RPO is like how much of yesterday's sales records the shop can afford to lose if the backup is a day old.\n\n• RTO: how long a system can be down before it must be restored.\n\n• RPO: how much data loss, measured in time, is acceptable.\n\n• Why the other options are wrong: the two terms are often swapped by mistake, but they measure different things, and neither is limited to ransomware incidents specifically.\n\nSo the answer is: RTO is the maximum acceptable downtime, and RPO is the maximum acceptable data-loss window.",
    },
    {
      type: "mcq",
      prompt:
        "A consensus algorithm elects a single leader, works only among a known and vetted set of nodes, and has no defence against fake identities. This is best described as:",
      options: [
        "A hash function",
        "Proof of work",
        "Raft",
        "A sandwich attack",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like a classroom where everyone already knows and trusts who the teacher is, so when the teacher speaks, everyone just repeats the answer — it falls apart if a stranger could walk in and claim to be the teacher.\n\n• What it is: Raft — a permissioned, single-leader consensus algorithm with no defence against fake identities, a Sybil attack, because it assumes every participant is already known and trusted.\n\n• Why the other options are wrong: proof of work is built for untrusted strangers and uses costly computation instead of a single leader, while a sandwich attack and a hash function are unrelated concepts from different parts of the material.\n\nSo the answer is: Raft.",
    },
    {
      type: "mcq",
      prompt:
        "A bot places a trade immediately before a user's pending trade on a decentralised exchange, and another trade immediately after, profiting from the price movement it caused. This is:",
      options: [
        "A 51% attack",
        "An eclipse attack",
        "Selfish mining",
        "A sandwich attack",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's like someone cutting into a queue just ahead of you to buy up the last discount tickets, letting you pay full price, then reselling their cheap tickets right after for a profit.\n\n• What it is: a sandwich attack — the user's trade is sandwiched between the bot's front-run trade, which pushes the price first, and its back-run trade, which locks in the profit afterwards.\n\n• Why the other options are wrong: an eclipse attack isolates a victim's network connections rather than manipulating a trade price, selfish mining is about withholding a mined block, and a 51% attack is about controlling a majority of computing power, none of which match a bot trading just before and after a victim.\n\nSo the answer is: a sandwich attack.",
    },
    // ---------- Weeks 1-8 Gap-Fill MCQ Practice (6 questions) ----------
    {
      type: "mcq",
      prompt:
        "A startup argues that attackers can't break its password hashes because nobody knows its custom, undocumented hashing algorithm. Which named principle does this reasoning violate?",
      options: [
        "Kerckhoffs's principle",
        "Defence in depth",
        "Non-repudiation",
        "Least privilege",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like a shop owner trusting their safe just because nobody knows the lock brand — but the safe ships in a box anyone could inspect, and once one burglar works out the design, every safe of that brand is just as vulnerable.\n\n• Kerckhoffs's principle: a system should stay secure even if everything except the secret key is known — security should never depend on the method itself staying hidden.\n\n• Why the startup's reasoning fails: hiding a custom algorithm is security by obscurity, which has not survived years of public testing the way a published algorithm has, and offers no fallback once it leaks.\n\n• Why the other options are wrong: least privilege is about limiting access, defence in depth is about layering multiple controls, and non-repudiation is about proving who sent a message, none of which are about hiding a secret method.\n\nSo the answer is: Kerckhoffs's principle.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker uses a compromised account to run a SQL injection attack over a connection that is validly protected by TLS (Transport Layer Security). What does this best illustrate?",
      options: [
        "SQL injection is completely prevented the moment a connection is correctly secured with TLS encryption",
        "TLS protects the transport layer only; it does not stop flaws at other layers such as authorisation or application logic",
        "TLS automatically prevents SQL injection from occurring anywhere in the application's database layer",
        "Encryption over TLS guarantees that any account which successfully authenticates can be fully trusted",
      ],
      correctIndex: 1,
      modelAnswer:
        "TLS is like an armoured van that safely drives a package between two addresses — it protects the package in transit, but says nothing about whether the sender is trustworthy or whether the package itself is dangerous.\n\n• What TLS actually covers: only the network path in transit, stopping eavesdropping and tampering while data moves between browser and server.\n\n• What it doesn't cover: SQL injection is an application-logic flaw in how input is handled once it arrives, and a compromised account's excessive privileges are a separate authorisation problem, both of which sit outside what TLS protects.\n\n• Why the other options are wrong: TLS has no effect on SQL injection at all, and a correctly encrypted connection says nothing about whether the account using it is trustworthy.\n\nSo the answer is: TLS protects the transport layer only, and does nothing to stop flaws at other layers such as authorisation or application logic.",
    },
    {
      type: "mcq",
      prompt:
        "Which property does a digital signature provide that a shared-secret MAC (Message Authentication Code) cannot?",
      options: ["Confidentiality", "Integrity", "Non-repudiation", "Availability"],
      correctIndex: 2,
      modelAnswer:
        "A MAC is like a signature made with a rubber stamp that both sides own a copy of — anyone holding the stamp could have made the mark. A digital signature is like a signature made with a pen only one person owns.\n\n• Why a MAC falls short: both parties share the same secret key, so both are technically capable of producing a valid tag, meaning neither side can prove the other didn't make it.\n\n• Why a digital signature fixes this: it uses a key pair unique to one party — only that party holds the private signing key, so a valid signature can be tied to exactly one signer.\n\n• Why the other options are wrong: both a MAC and a signature can provide integrity, and neither one provides confidentiality or availability on its own.\n\nSo the answer is: non-repudiation, the ability to prove exactly who produced a message.",
    },
    {
      type: "mcq",
      prompt:
        "A system is secured at the network layer, but is left with an excessively privileged database account and an unpatched application. What does this best demonstrate?",
      options: [
        "A non-repudiation failure caused specifically by the unpatched application component",
        "A false positive generated only by the network-layer monitoring and detection tooling",
        "Perfect security achieved through network-layer encryption alone, regardless of other layers",
        "The weakest-link principle — one unprotected layer still leaves the system exploitable",
      ],
      correctIndex: 3,
      modelAnswer:
        "A chain is only as strong as its weakest link — reinforcing one link while leaving two others rusty still means the chain snaps where it's weak.\n\n• The principle: the weakest-link principle — fixing one layer while leaving others weak just moves the attacker to the next unprotected layer.\n\n• Applying it here: hardening the network layer alone does nothing to stop an attacker who reaches the excessively privileged account or exploits the unpatched application.\n\n• Why the other options are wrong: this isn't a false positive or a non-repudiation issue at all, and no single layer, including encryption, provides perfect security by itself.\n\nSo the answer is: the weakest-link principle — one unprotected layer still leaves the whole system exploitable.",
    },
    {
      type: "mcq",
      prompt:
        "Why is a per-user random salt more important to keep protected than the design of a public, standard password-hashing algorithm like Argon2?",
      options: [
        "The algorithm is already public and reviewed; the salt (and secrecy of stored hashes) is what actually individualises and slows an attack on each password",
        "The salt is useless once the algorithm is known, since knowing the method automatically reveals every stored password instantly",
        "Algorithms should always be kept secret instead of salts, because a published algorithm like Argon2 can never truly be secure",
        "Salts and algorithms provide identical protection, since both are equally effective whether kept secret or published openly",
      ],
      correctIndex: 0,
      modelAnswer:
        "An algorithm is like the design printed on every lock of a brand; a salt is like the specific, unique cut of your own key — changing the lock design helps nobody, but losing your specific key does.\n\n• Why the algorithm doesn't need secrecy: it is already public and has been reviewed by the security community for years, so hiding it adds nothing.\n\n• What actually matters: a unique random salt per user, plus a deliberately slow work factor, is what individualises and slows down an attack on each password.\n\n• Why the other options are wrong: a salt is still useful once the algorithm is known, algorithms should not be kept secret under Kerckhoffs's principle, and salts and algorithms do not provide identical protection.\n\nSo the answer is: the algorithm is already public and reviewed, and it's the salt that actually individualises and slows an attack on each password.",
    },
    {
      type: "mcq",
      prompt:
        "A dispute arises over whether a contractor actually submitted a specific work claim, protected only by a MAC (Message Authentication Code) key shared between the contractor's app and the platform's server. Why can the platform not prove the contractor alone created it?",
      options: [
        "MAC keys are never actually kept secret by either the contractor's app or the platform's server",
        "Both parties who share the MAC key are equally capable of having produced a valid tag",
        "MACs are fundamentally incapable of ever detecting any tampering with a submitted message",
        "MACs are significantly slower to compute than digital signatures in every realistic situation",
      ],
      correctIndex: 1,
      modelAnswer:
        "A MAC is like a rubber stamp both the contractor and the platform own a copy of — anyone holding the stamp could have made the mark.\n\n• The reason: both parties who share the MAC key are equally capable of having produced a valid tag, since the key isn't unique to either one of them.\n\n• Why the other options are wrong: MAC keys are secret, just shared between two parties rather than unique to one; a MAC can detect tampering just fine; and speed has nothing to do with this dispute.\n\nSo the answer is: both parties who share the MAC key are equally capable of having produced a valid tag.",
    },
  ],
};

export const INFO5995_PREDICTED_EXAM_PAPERS: ExamPaperSeed[] = [PAPER];
