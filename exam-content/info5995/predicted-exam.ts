import type { ExamPaperSeed } from "../types";

export const INFO5995_PREDICTED_EXAM_PAPERS: ExamPaperSeed[] = [
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 14,
    "title": "Predicted Exam Practice Paper",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "topics": "Predicted-exam practice MCQs converted from the student's own AI-authored 'Predicted Exam - INFO5995' prediction document, grounded in the official INFO5995 Exam Revision Question Bank: Weeks 1-8 (with MCQs, Answered). Covers the Week 9 Mixed MCQ Practice set (the can we / may we / should we ethics test, the ACS and ACM codes of ethics, responsible disclosure, the five factors Australian law uses to judge unauthorised computer access, the Notifiable Data Breaches scheme, Australian Privacy Principle 11, ISO/IEC 27001 versus the NIST Cybersecurity Framework, the event/alert/incident/breach severity ladder, containment trade-offs, Recovery Time Objective versus Recovery Point Objective, Raft consensus, and blockchain eclipse/selfish-mining/sandwich attacks) plus the Weeks 1-8 Gap-Fill MCQ Practice set (Kerckhoffs's principle applied to password hashing, TLS's transport-layer-only scope, non-repudiation via digital signatures versus MACs, and the weakest-link principle across layered controls). Phase-1 recognition-only: the source document's scenario-based (a)/(b)/(c) free-response sub-questions are out of scope for this app and are excluded; option order has been shuffled from the source document to remove positional bias while keeping each correct answer's content unchanged. Reworked to the 50-mark format: 10 single-best-answer MCQs and four written scenario questions.",
    "sourceFiles": [
      "Predicted Exam - INFO5995.docx (Desktop, derived from INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf)",
      "INFO5995_Practice_Final_Exam_1_Questions.pdf",
      "INFO5995_Practice_Final_Exam_1_Answer_Guide.pdf",
      "INFO5995_Practice_Final_Exam_2_Questions.pdf",
      "INFO5995_Practice_Final_Exam_2_Answer_Guide.pdf",
      "INFO5995_Practice_Final_Exam_3_Questions.pdf",
      "INFO5995_Practice_Final_Exam_3_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A crisis team confirms they are technically able to pay a ransom, but their lawyers are still checking whether paying would break international sanctions law before anyone acts. Which part of the can we / may we / should we test have they not yet cleared?",
        "options": [
          "May we",
          "Should we",
          "None — ethics only applies after payment",
          "Can we"
        ],
        "correctIndex": 0,
        "modelAnswer": "Imagine you could technically climb a fence to get a ball back, but you still need to check whether you are allowed to before you do it.\n\n• Can we: asks whether something is technically possible — already settled here, since the team can pay.\n\n• May we: asks whether it is legally and organisationally permitted — this is exactly what the lawyers are still checking, because some ransomware groups sit on sanctions lists that make payment illegal regardless of what an insurer says.\n\n• Should we: asks whether paying is the right thing to do even if it turns out to be allowed — a separate, later question.\n\n• Why the other options are wrong: ethics does not only switch on after payment, and the scenario is clearly stuck on checking legal permission, not technical possibility or rightness.\n\nSo the answer is: may we, the legal-permission question, which the lawyers have not yet cleared."
      },
      {
        "type": "mcq",
        "prompt": "Under the ACM (Association for Computing Machinery) Code of Ethics, which principle most directly requires weighing the harm future ransomware victims would suffer if an organisation refuses to pay now?",
        "options": [
          "Respect privacy and confidentiality",
          "Contribute to human well-being and avoid harm",
          "Honour intellectual property",
          "Maintain professional competence"
        ],
        "correctIndex": 1,
        "modelAnswer": "Paying a kidnapper once can make kidnapping more tempting for every other family too, not just save your own child this one time.\n\n• What the principle says: contribute to human well-being and avoid harm — professionals must weigh harm to everyone affected, not only the people in front of them right now.\n\n• Why it fits here: refusing to pay protects future victims from a more profitable ransomware economy, which is exactly the kind of wider-harm trade-off this principle is built for.\n\n• Why the other options are wrong: respecting privacy and confidentiality is about protecting information, not weighing future harm; honouring intellectual property is about ownership of work, not safety trade-offs; maintaining professional competence is about staying skilled, not about this ethical weighing.\n\nSo the answer is: contribute to human well-being and avoid harm."
      },
      {
        "type": "mcq",
        "prompt": "While completing an assignment, a student notices that a local hospital's patient-booking website leaks appointment details through a predictable link, with no authorisation to test the hospital's system. What should the student do first, before telling anyone outside the hospital?",
        "options": [
          "Report it to a news outlet",
          "Publish the finding publicly to force a fast fix",
          "Verify the issue is real and reproducible",
          "Exploit it further to measure total impact"
        ],
        "correctIndex": 2,
        "modelAnswer": "It's like finding a neighbour's door unlocked — the responsible first move is to quietly check it is really unlocked, not to post about it on the street or walk further inside.\n\n• Verify first: confirm the flaw is real and reproducible, going no further than that, and without extracting real patient data in the process.\n\n• Why not the other options: exploiting it further risks real harm and possibly breaks the law; publishing it or going to a news outlet first skips the hospital's own chance to fix the problem and can cause panic or copycat attacks before a fix exists.\n\nSo the answer is: verify the issue is real and reproducible, the first step of responsible disclosure."
      },
      {
        "type": "mcq",
        "prompt": "Which of the following is NOT one of the five factors Australian law uses to decide whether computer access counts as authorised?",
        "options": [
          "The purpose of the access",
          "The person accessing",
          "The system accessed",
          "The brand of antivirus installed"
        ],
        "correctIndex": 3,
        "modelAnswer": "Whether you're allowed into a building depends on who let you in, which building it is, why you're there, how you got in, and when — not which brand of smoke detector is mounted on the wall.\n\n• The real five factors: person, system, purpose, method, and time, taken together.\n\n• Why the odd one is wrong: the brand of antivirus software installed says nothing about who was permitted to access what, for what reason, how, or when, so it is not part of the legal test at all.\n\nSo the answer is: the brand of antivirus installed, since it is not one of the five authorisation factors."
      },
      {
        "type": "mcq",
        "prompt": "A company's customer database, including driver's licence numbers, is copied by an attacker, but nothing has been published yet. Under Australia's Notifiable Data Breaches (NDB) scheme, what matters most for deciding whether this breach must be reported?",
        "options": [
          "Whether the breach is likely to cause serious harm to the individuals concerned",
          "Whether the company already holds an active cyber-insurance policy for this event",
          "Whether the specific attacker behind the breach has since been formally identified",
          "Whether the stolen data has already been published or put up for sale online"
        ],
        "correctIndex": 0,
        "modelAnswer": "A shoplifter has already stolen your wallet the moment they take it, whether or not they've spent the money yet.\n\n• The real trigger: whether the breach is likely to cause serious harm to the people whose information was taken — here, licence numbers and dates of birth are exactly the kind of identity-theft-ready data that makes serious harm likely.\n\n• Why the other options are wrong: publication is not the trigger, since the risk exists the moment the data leaves the company's control; having insurance or identifying the attacker are both irrelevant to whether the breach itself must be reported.\n\nSo the answer is: whether the breach is likely to cause serious harm to the individuals concerned."
      },
      {
        "type": "mcq",
        "prompt": "Which Australian Privacy Principle (APP) most directly requires an organisation to take reasonable steps to protect the personal information it holds?",
        "options": [
          "APP 3",
          "APP 11",
          "APP 12",
          "APP 1"
        ],
        "correctIndex": 1,
        "modelAnswer": "APP 11 works like a landlord's duty to fit a working lock on your door — not a guarantee nothing bad ever happens, just a reasonable-effort requirement.\n\n• APP 11: requires reasonable steps to protect personal information from misuse, interference, loss, and unauthorised access, modification or disclosure.\n\n• Why the others are wrong: APP 1, APP 3 and APP 12 cover different duties, such as openness about practices and how information is collected, not the security-of-information duty this question is about.\n\nSo the answer is: APP 11, the security-of-personal-information principle."
      },
      {
        "type": "mcq",
        "prompt": "ISO/IEC 27001 and the NIST (National Institute of Standards and Technology) Cybersecurity Framework both support incident response, but what is the key difference between them?",
        "options": [
          "NIST CSF is a binding law organisations must follow; ISO/IEC 27001 is merely an optional internal suggestion",
          "ISO/IEC 27001 and the NIST Cybersecurity Framework are simply two different names for the exact same certification document",
          "ISO/IEC 27001 is a certifiable management-system standard; NIST CSF is a voluntary framework of functions",
          "ISO/IEC 27001 is a certifiable standard that applies only to blockchain-based systems and smart contracts"
        ],
        "correctIndex": 2,
        "modelAnswer": "One is like a certified gym membership an inspector can check off against a list, the other is like a shared coach's playbook everyone agrees to follow even though nobody is grading it.\n\n• ISO/IEC 27001: a certifiable management-system standard — an outside assessor can audit an organisation against it and issue a certificate.\n\n• NIST CSF: a voluntary framework of functions, covering identify, protect, detect, respond, recover and govern, that organises how people think about cybersecurity, without being a law or a certification.\n\n• Why the others are wrong: neither document is a law, they are not interchangeable names for the same thing, and ISO/IEC 27001 applies broadly to information security management, not specifically to blockchains.\n\nSo the answer is: ISO/IEC 27001 is a certifiable standard, while NIST CSF is a voluntary framework of functions."
      },
      {
        "type": "mcq",
        "prompt": "A monitoring tool flags unusual file-encryption activity on a file server, but nobody has yet confirmed any real damage. At this point, this is best classified as:",
        "options": [
          "A disaster",
          "A confirmed data breach",
          "An incident",
          "An alert"
        ],
        "correctIndex": 3,
        "modelAnswer": "Think of a smoke detector going off — it means something is worth checking, not that the house has already burned down.\n\n• What it is: an alert — a tool or person flagging something as worth a look, before it is confirmed to actually threaten anything.\n\n• Why the escalation matters: event, alert, incident, and data breach form a deliberate ladder of seriousness, and this flag has not yet been confirmed as a real incident or breach.\n\n• Why the other options are wrong: calling it a confirmed data breach or a disaster jumps several rungs up the ladder before any confirmation has happened, and it clearly isn't a confirmed incident yet either.\n\nSo the answer is: an alert, since nothing has been confirmed as a real threat yet."
      },
      {
        "type": "mcq",
        "prompt": "During a ransomware event at a university, the response team isolates only the affected subnet instead of shutting down the entire network. This decision is an example of:",
        "options": [
          "A containment trade-off between disruption and residual risk",
          "A recovery action aimed at restoring full service across the entire network",
          "A lessons-learned finding documented only after the incident has fully concluded",
          "Eradication performed once the malware's full root cause has already been confirmed"
        ],
        "correctIndex": 0,
        "modelAnswer": "It's like closing one burning room's door instead of evacuating the whole building — faster for everyone else, but riskier if the fire has already slipped under a different door.\n\n• What it is: a containment trade-off — isolating just the subnet keeps the rest of the university running, but risks that the attacker has already spread somewhere else undetected.\n\n• Why the other options are wrong: eradication is about removing the cause once found, recovery is about restoring services, and lessons learned happens only after the incident is over, while this decision is happening during containment, not any of those later stages.\n\nSo the answer is: a containment trade-off between disruption and residual risk."
      },
      {
        "type": "mcq",
        "prompt": "Recovery Time Objective (RTO) and Recovery Point Objective (RPO) are best described as:",
        "options": [
          "RTO is how much data loss in time is acceptable to lose; RPO is how long an outage is allowed to last before restoration",
          "RTO is how long a system can be down before it must be restored; RPO is how much data loss (in time) is acceptable",
          "Both RTO and RPO measure exactly the same underlying recovery concept, just using two different traditional names",
          "Both RTO and RPO are terms that apply exclusively to ransomware incidents and no other kind of outage"
        ],
        "correctIndex": 1,
        "modelAnswer": "RTO is like how long a shop can stay closed before customers stop coming back; RPO is like how much of yesterday's sales records the shop can afford to lose if the backup is a day old.\n\n• RTO: how long a system can be down before it must be restored.\n\n• RPO: how much data loss, measured in time, is acceptable.\n\n• Why the other options are wrong: the two terms are often swapped by mistake, but they measure different things, and neither is limited to ransomware incidents specifically.\n\nSo the answer is: RTO is the maximum acceptable downtime, and RPO is the maximum acceptable data-loss window."
      },
      {
        "type": "scenario",
        "prompt": "Threat modelling and security foundations\nA regional clinic opens its patient portal to home networks and mobile devices. The portal stores appointments and medication records, delegates sign-in to an identity provider, and uses a cloud database. Managers say the threat model does not need revision because the application code is unchanged.\n\na) Define a suitable system boundary and identify two assets to protect. [3 marks]\n\nb) Explain two ways the expanded access or dependencies affect the attack surface or trust assumptions. [4 marks]\n\nc) Give one confidentiality, integrity and availability objective for the portal. [3 marks]",
        "modelAnswer": "a) Include users/devices, portal client and service, identity provider, cloud database, network paths and relevant administrators/dependencies. Assets include patient records, credentials/tokens and service availability. Award marks for a sensible boundary and two assets.\n\nb) Home and mobile access introduce new devices, networks and reachable interfaces that can enable credential theft or client compromise. The clinic also relies on identity-provider authentication and cloud access controls; failure or misconfiguration at either trust boundary affects the portal.\n\nc) Confidentiality: a patient and authorized care team members may see only the records permitted for their roles, preventing disclosure to other patients or unauthorized staff. Integrity: medication and appointment changes must be made by authenticated, authorized users, validated and auditable so unauthorized changes can be detected. Availability: patients and clinicians can use the portal when needed, supported by tested recovery and continuity arrangements."
      },
      {
        "type": "scenario",
        "prompt": "AI-assisted vulnerability verification\nA security team asks an AI coding assistant to review an authorized application repository. The assistant flags an authorization bypass but invents a library function and proposes testing against the live service. The team has a staging environment with synthetic data.\n\na) Explain why the AI finding and its confidence score are not sufficient evidence. [3 marks]\n\nb) Describe a safe, human-reviewed verification workflow for the suspected bypass. [4 marks]\n\nc) State what should be recorded in a defensible vulnerability report. [3 marks]",
        "modelAnswer": "a) An AI assistant can invent APIs, miss configuration or authorization checks, and misread the path a real request follows. Its confidence score is generated text, not evidence that an attacker can reach or exploit the issue. The analyst should verify the named function exists, trace the actual route and guard conditions, and reproduce the suspected access-control failure in the authorized staging environment before reporting it as a vulnerability.\n\nb) Confirm written scope and permissions; inspect the real route and authorization logic; test in staging using accounts with different roles and minimal requests; capture expected versus observed behavior; stop if impact is unexpected; have a human validate the conclusion.\n\nc) Record affected version/endpoint, preconditions, reproducible steps, expected and observed behavior, sanitized logs or responses, impact, remediation and verification limits. Distinguish observations from AI-generated hypotheses."
      },
      {
        "type": "scenario",
        "prompt": "Mobile security\nA banking app contains a long-lived backend key in its APK. An exported deep-link activity accepts a destination account and amount from an external URL, and the backend trusts the key as proof that the request came from the official app.\n\na) Explain two distinct security weaknesses in this design. [4 marks]\n\nb) Recommend checks before a transfer can be accepted. [3 marks]\n\nc) Propose a safer backend authentication design and one way to test the fix. [3 marks]",
        "modelAnswer": "a) The key can be extracted from the distributed APK and reused by attackers; it cannot be treated as confidential client-side. The exported activity accepts attacker-controlled values, and syntactically valid links do not prove user intent or authorization.\n\nb) Validate and normalize account/amount server-side; authenticate the user and authorize the specific transfer; require confirmation in a trusted UI and apply transaction limits or step-up authentication for higher-risk transfers.\n\nc) Remove the shared privileged key from the app. Authenticate users through an appropriate identity flow and use short-lived scoped tokens with server-side authorization. Test by inspecting the APK for secrets and invoking crafted external links in an authorized test environment to confirm unauthorized transfers are rejected."
      },
      {
        "type": "scenario",
        "prompt": "Cryptographic goals and replay\nA payroll service encrypts salary instructions before sending them to a partner. It does not authenticate messages, reuses a nonce with its encryption mode, and accepts a previously captured instruction if it is sent again.\n\na) Explain what encryption provides and what is missing from this design. [3 marks]\n\nb) Explain the risk of nonce reuse and recommend a safer message-protection approach. [3 marks]\n\nc) Identify the replay weakness and give a freshness control. [4 marks]",
        "modelAnswer": "a) Encryption primarily provides confidentiality by making intercepted content unreadable without the decryption key. It does not, by itself, prove who sent the message or detect every unauthorized modification: an attacker may alter unauthenticated ciphertext or substitute data. Use an authenticated-encryption mode or a separate MAC/signature and validate the result before acting on decrypted content.\n\nb) Nonce reuse can break security guarantees of many modes, potentially exposing relationships or enabling forgery. Use a standard authenticated-encryption scheme with unique nonces per key, correct key management and rejection of invalid tags.\n\nc) A valid old instruction can be resent because the receiver does not check freshness. Include a unique transaction ID, nonce or sequence number, track accepted values at the receiver, enforce an appropriate freshness window and make processing idempotent."
      }
    ]
  }
];
