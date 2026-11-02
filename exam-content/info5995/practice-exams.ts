import type { ExamPaperSeed } from "../types";

export const INFO5995_PRACTICE_EXAM_PAPERS: ExamPaperSeed[] = [
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 4,
    "title": "Exam Paper — Practice 1",
    "topics": "Predicted, original practice questions based on Week 1 — foundations. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 1/lecture/Week01-Introduction, cybersecurity basics, security lifecycle, system and threat models.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "System boundary and threat model (10 marks)\nA regional clinic launches a patient portal reachable from home networks and mobile devices. It stores patient details and appointments, delegates login to an identity provider, and uses a cloud database. A manager says that because the application code did not change, the threat model is unchanged.\n\n(a) Define the system boundary and identify two assets worth protecting. (3 marks)\n(b) Explain two ways the new access paths or dependencies change the attack surface or trust assumptions. (4 marks)\n(c) Give one confidentiality, integrity and availability objective for this portal. (3 marks)",
        "modelAnswer": "Include the portal, identity provider, cloud database, users and relevant network paths in the boundary. Assets include patient records, credentials and service availability. Home/mobile access adds reachable entry points; the identity provider and cloud database create trust boundaries and dependency risks. Confidentiality: only authorised care staff/patients see permitted records. Integrity: only authorised staff can change clinical details. Availability: patients and clinicians can use the portal when needed."
      },
      {
        "type": "mcq",
        "prompt": "Which statement best describes the attack surface?",
        "options": [
          "The set of reachable interfaces and paths an attacker could use",
          "Only the source-code files written by the organisation",
          "The list of approved security controls",
          "The amount of encrypted data stored"
        ],
        "correctIndex": 0,
        "modelAnswer": "Attack surface concerns reachable interfaces and paths, including dependencies and human processes."
      },
      {
        "type": "mcq",
        "prompt": "A threat model is most useful when it explicitly records:",
        "options": [
          "Only the product’s marketing goals",
          "Assets, boundaries, assumptions, attacker capabilities and likely threats",
          "Only vulnerabilities already confirmed in production",
          "A promise that the system is secure"
        ],
        "correctIndex": 1,
        "modelAnswer": "Explicit assumptions make the security reasoning reviewable and testable."
      },
      {
        "type": "mcq",
        "prompt": "Which CIA property is primarily affected when an attacker alters a student’s recorded grade?",
        "options": [
          "Confidentiality",
          "Integrity",
          "Availability",
          "Non-repudiation"
        ],
        "correctIndex": 1,
        "modelAnswer": "Unauthorised modification compromises integrity."
      },
      {
        "type": "mcq",
        "prompt": "An AI scanner reports a high-severity flaw but gives no code location or reproducible steps. What should the analyst do?",
        "options": [
          "Publish it as confirmed",
          "Verify it against the actual code and controlled tests",
          "Ignore every AI finding permanently",
          "Probe the live service without permission"
        ],
        "correctIndex": 1,
        "modelAnswer": "AI output is a lead; verification requires evidence and authorised testing."
      },
      {
        "type": "mcq",
        "prompt": "A student is authorised to examine an APK supplied for coursework. Which action exceeds that scope?",
        "options": [
          "Inspecting its manifest locally",
          "Tracing a deep link in an emulator",
          "Sending crafted requests to an unrelated live production service",
          "Recording a reproducible result in the report"
        ],
        "correctIndex": 2,
        "modelAnswer": "Permission to inspect the APK does not authorise testing another live system."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 5,
    "title": "Exam Paper — Practice 2",
    "topics": "Predicted, original practice questions based on Weeks 2–3 — AI-assisted vulnerability discovery and mobile security. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 2/lecture/Week02-Al assisted vulnerability discovery, mobile security, assignment walkthrough.pdf",
      "Week 3/lecture/Week03-Mobile Security.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "AI-assisted mobile review (10 marks)\nA student team uses an AI agent to review an Android app. The agent proposes a deep link payload that might expose another user’s data. The team has permission to inspect the provided APK, but not to probe the live production service.\n\n(a) Describe a safe way to verify the AI claim using the authorised APK and evidence. (4 marks)\n(b) Explain why the agent’s confident report is not proof of a vulnerability. (3 marks)\n(c) State the boundary between authorised analysis and out-of-scope testing. (3 marks)",
        "modelAnswer": "Reproduce the claim against the provided APK in a controlled environment, inspect the relevant manifest/code and data flow, and record the exact steps and evidence. AI can hallucinate, miss context or confuse a risky pattern with an exploitable path, so findings need independent verification. Test only the supplied APK and approved test environment; do not send crafted traffic to production without explicit authorisation."
      },
      {
        "type": "mcq",
        "prompt": "An Android activity is marked exported and accepts external input. What is the key security concern?",
        "options": [
          "It cannot be launched by another app",
          "An external app may invoke it, so inputs and permissions need validation",
          "Android encrypts every intent automatically",
          "Exported activities cannot access sensitive data"
        ],
        "correctIndex": 1,
        "modelAnswer": "Exported components cross an application boundary and must validate caller/input and access."
      },
      {
        "type": "mcq",
        "prompt": "Where should object ownership for a requested student record be checked?",
        "options": [
          "Only in a hidden client-side button",
          "On the server for each object request",
          "In the app store listing",
          "Only during the first login"
        ],
        "correctIndex": 1,
        "modelAnswer": "Authorization must be enforced server-side per request/object; UI controls are not enforcement."
      },
      {
        "type": "mcq",
        "prompt": "Why should a mobile app not contain a long-lived privileged API secret?",
        "options": [
          "APK contents can be inspected and extracted",
          "Android automatically rotates secrets every hour",
          "A secret in resources is protected by TLS",
          "Only iOS apps can expose embedded secrets"
        ],
        "correctIndex": 0,
        "modelAnswer": "Client software is under user control; embedded credentials can be recovered."
      },
      {
        "type": "mcq",
        "prompt": "Kerckhoffs’s principle says a cryptosystem should remain secure even if:",
        "options": [
          "The algorithm is public, provided the key remains secret",
          "The key is public but the algorithm is hidden",
          "The ciphertext is never transmitted",
          "The implementation has no users"
        ],
        "correctIndex": 0,
        "modelAnswer": "Security should depend on the secret key, not obscurity of the algorithm."
      },
      {
        "type": "mcq",
        "prompt": "Which property does an unkeyed cryptographic hash alone not establish?",
        "options": [
          "A fixed-length digest",
          "A deterministic output for a given input",
          "Message origin authentication against an attacker who can replace both message and digest",
          "A way to detect accidental changes if the digest is trusted separately"
        ],
        "correctIndex": 2,
        "modelAnswer": "Without a secret or signature, an attacker can recompute the digest."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 6,
    "title": "Exam Paper — Practice 3",
    "topics": "Predicted, original practice questions based on Week 3 — mobile application security. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 3/lecture/Week03-Mobile Security.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Android exported components (10 marks)\nA university app exposes an exported activity that accepts a deep-link parameter `studentId`. The activity loads that student’s results without checking whether the signed-in user owns the record. A secret API key is also stored in the APK resources.\n\n(a) Identify the main authorisation flaw and its consequence. (3 marks)\n(b) Recommend two mobile-side or server-side mitigations. (4 marks)\n(c) Explain why moving the API key to another APK resource is not a real fix. (3 marks)",
        "modelAnswer": "This is broken object-level authorisation/IDOR: a caller can change the identifier and access another student’s results. Enforce ownership and role checks server-side for every request; validate deep-link inputs and expose only components that need external invocation. Remove privileged secrets from the client, rotate the exposed key, and use a backend-controlled credential flow. Anything shipped in an APK can be extracted, so obfuscation or moving the key does not make it secret."
      },
      {
        "type": "mcq",
        "prompt": "What is the main advantage of Encrypt-then-MAC when correctly designed?",
        "options": [
          "It verifies the ciphertext’s authenticity before decryption",
          "It removes the need for a key",
          "It guarantees the sender’s identity to every third party",
          "It prevents all denial-of-service attacks"
        ],
        "correctIndex": 0,
        "modelAnswer": "Authenticate ciphertext first, then decrypt only after the tag verifies."
      },
      {
        "type": "mcq",
        "prompt": "Why should a nonce not be reused with a stream/CTR-style encryption key?",
        "options": [
          "Reuse can expose relationships between plaintexts through reused keystream",
          "It makes the key longer",
          "It disables hashing",
          "It only affects message availability"
        ],
        "correctIndex": 0,
        "modelAnswer": "Reusing a keystream can reveal plaintext relationships and compromise confidentiality."
      },
      {
        "type": "mcq",
        "prompt": "Which option provides public verifiability using an asymmetric key pair?",
        "options": [
          "A digital signature",
          "A plain hash",
          "A shared-password check",
          "Encryption with a shared key only"
        ],
        "correctIndex": 0,
        "modelAnswer": "A verifier can use the signer’s public key to check a signature."
      },
      {
        "type": "mcq",
        "prompt": "A password database should normally store:",
        "options": [
          "Reversibly encrypted passwords with a shared application key",
          "Salted, slow password hashes using a suitable password KDF",
          "Plaintext passwords plus a hash for convenience",
          "One unsalted fast hash for every account"
        ],
        "correctIndex": 1,
        "modelAnswer": "Unique salts and a deliberately costly password KDF make offline guessing harder."
      },
      {
        "type": "mcq",
        "prompt": "Password plus PIN generally counts as:",
        "options": [
          "Two independent factor categories",
          "Two knowledge factors, not two independent factor categories",
          "Possession plus inherence",
          "No authentication factors"
        ],
        "correctIndex": 1,
        "modelAnswer": "Both are things the user knows."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 7,
    "title": "Exam Paper — Practice 4",
    "topics": "Predicted, original practice questions based on Week 4 — cryptography basics 1. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 4/lecture/Week04-Cryptography basics part 1.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Cryptographic goals and key exchange (10 marks)\nA service encrypts messages with a public-key scheme and uses Diffie–Hellman to establish a session key. It does not authenticate the peer’s public key, and the team claims encryption alone proves the messages came from the intended server.\n\n(a) Distinguish confidentiality from authentication and integrity. (3 marks)\n(b) Explain how an active attacker can exploit unauthenticated key exchange. (4 marks)\n(c) Name a suitable mechanism to authenticate the server and bind the exchange. (3 marks)",
        "modelAnswer": "Encryption can hide message contents (confidentiality), but does not by itself prove who sent them or whether they were changed. An active attacker can establish one key with the client and a different key with the server, relay and read/alter traffic: a man-in-the-middle attack. Authenticate the server’s public key with a validated certificate/signature and use an authenticated key-exchange protocol; protect records with an authenticated channel."
      },
      {
        "type": "mcq",
        "prompt": "Which control best limits damage after an administrator account is compromised?",
        "options": [
          "Least privilege and separate named accounts",
          "A longer login banner",
          "A public bucket",
          "One shared administrator password"
        ],
        "correctIndex": 0,
        "modelAnswer": "Scoped, attributable privileges reduce reach and improve accountability."
      },
      {
        "type": "mcq",
        "prompt": "Which cloud statement best reflects shared responsibility?",
        "options": [
          "The provider is responsible for every customer configuration",
          "The customer retains responsibility for many in-cloud identities, data and configurations",
          "Moving to cloud removes the need for backups",
          "Only physical security matters"
        ],
        "correctIndex": 1,
        "modelAnswer": "Provider/customer responsibilities vary by service model; customer configuration and data remain important."
      },
      {
        "type": "mcq",
        "prompt": "What does correctly validated TLS principally provide for a web connection?",
        "options": [
          "Confidentiality, integrity in transit and server authentication for the validated name",
          "Protection from every application vulnerability",
          "Proof that a website is ethical",
          "Authorization to view every object"
        ],
        "correctIndex": 0,
        "modelAnswer": "TLS protects the channel and authenticates the server certificate for the requested name; it does not replace app authorization."
      },
      {
        "type": "mcq",
        "prompt": "A certificate warning appears on a login site. What is the safest immediate action?",
        "options": [
          "Ignore it because the page is encrypted",
          "Stop and verify the site/network using a trusted path",
          "Enter a fake password to test it",
          "Disable certificate validation"
        ],
        "correctIndex": 1,
        "modelAnswer": "Without validation, the client cannot reliably know who terminates the connection."
      },
      {
        "type": "mcq",
        "prompt": "A distributed denial-of-service attack primarily threatens:",
        "options": [
          "Availability",
          "Confidentiality only",
          "Non-repudiation only",
          "Password hashing"
        ],
        "correctIndex": 0,
        "modelAnswer": "DDoS overwhelms resources and prevents legitimate service."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 8,
    "title": "Exam Paper — Practice 5",
    "topics": "Predicted, original practice questions based on Week 5 — cryptography basics 2. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 5/lecture/Week05-Cryptography basics part 2.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Hash, MAC and signature (10 marks)\nA payroll API receives a message containing a salary change. The team stores a plain hash beside the message and says that this prevents an attacker who can alter the database from changing the salary undetected.\n\n(a) Explain why an unkeyed hash does not authenticate the message against this attacker. (3 marks)\n(b) Distinguish a MAC from a digital signature for this use. (4 marks)\n(c) State one freshness control needed if old valid salary messages could be replayed. (3 marks)",
        "modelAnswer": "An attacker who can change both the message and its unkeyed hash can compute a new matching hash, so it does not prove origin/authenticity. A MAC uses a shared secret to authenticate integrity to parties holding the key; a digital signature uses a private key to sign and a public key to verify, supporting public verifiability. Include a nonce, sequence number, timestamp with replay protection, or unique transaction identifier that the receiver checks."
      },
      {
        "type": "mcq",
        "prompt": "Which is the primary defence against SQL injection?",
        "options": [
          "Parameterized queries/prepared statements",
          "More detailed database errors",
          "Hiding the database name",
          "A client-side input length limit alone"
        ],
        "correctIndex": 0,
        "modelAnswer": "Parameterization keeps untrusted values separate from executable query structure."
      },
      {
        "type": "mcq",
        "prompt": "Which practice helps prevent reflected XSS in HTML output?",
        "options": [
          "Context-appropriate output encoding",
          "Storing passwords with reversible encryption",
          "Using UDP",
          "Disabling audit logs"
        ],
        "correctIndex": 0,
        "modelAnswer": "Encode untrusted output for its context so it is rendered as data, not script."
      },
      {
        "type": "mcq",
        "prompt": "A static analysis tool reports a possible null dereference. What does the report mean?",
        "options": [
          "A lead that needs interpretation and verification",
          "Proof an attacker exploited production",
          "Proof there are no other defects",
          "An automatic patch has been applied"
        ],
        "correctIndex": 0,
        "modelAnswer": "Static analysis can over-approximate and needs triage or dynamic reproduction."
      },
      {
        "type": "mcq",
        "prompt": "Which control is detective rather than preventive?",
        "options": [
          "Centralised alerting on anomalous privileged actions",
          "Parameterized database queries",
          "MFA at login",
          "Private storage bucket policy"
        ],
        "correctIndex": 0,
        "modelAnswer": "Monitoring and alerts detect suspicious activity; the others primarily block or constrain it."
      },
      {
        "type": "mcq",
        "prompt": "What is the first priority after a credible ransomware alert?",
        "options": [
          "Validate and triage while preserving evidence and beginning proportionate containment",
          "Delete logs to protect reputation",
          "Immediately wipe every device before scoping",
          "Wait for the next audit"
        ],
        "correctIndex": 0,
        "modelAnswer": "Rapid triage, evidence preservation and proportionate containment protect response options."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 9,
    "title": "Exam Paper — Practice 6",
    "topics": "Predicted, original practice questions based on Week 6 — applied security and cloud. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 6/lecture/INFO5995-Week 6_ Applied Cryptography and Secure Communications.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Authentication and cloud access (10 marks)\nA cloud-hosted learning service uses password plus PIN as “two-factor authentication.” Staff share a powerful administrator account, and a storage bucket containing student records is publicly readable.\n\n(a) Explain why password plus PIN are not independent authentication factors. (2 marks)\n(b) Recommend one authentication and two access-control/cloud controls. (5 marks)\n(c) State one backup/recovery control that addresses availability. (3 marks)",
        "modelAnswer": "A password and PIN are both knowledge factors, so they do not provide two independent factor categories. Use a password plus a possession factor such as a phishing-resistant passkey or authenticator. Give staff unique accounts, MFA, role-based least privilege and reviewable admin access; make the bucket private and restrict access by identity/policy, then audit it. Maintain isolated, protected backups and test restoration against a recovery objective."
      },
      {
        "type": "mcq",
        "prompt": "Which order best matches the incident-response lifecycle after preparation?",
        "options": [
          "Detection, containment, eradication, recovery, lessons learned",
          "Recovery, detection, preparation, eradication",
          "Eradication, preparation, disclosure, detection",
          "Containment, recovery, prevention, detection"
        ],
        "correctIndex": 0,
        "modelAnswer": "This is the usual response progression; lessons feed back into preparation."
      },
      {
        "type": "mcq",
        "prompt": "Under an NDB assessment, notification is generally relevant when an eligible breach is likely to cause:",
        "options": [
          "Serious harm to affected individuals, not prevented by remedial action",
          "Any service outage of any length",
          "Only reputational harm to the organisation",
          "A failed login attempt"
        ],
        "correctIndex": 0,
        "modelAnswer": "The scheme focuses on eligible data breaches likely to result in serious harm, subject to remedial action."
      },
      {
        "type": "mcq",
        "prompt": "Responsible disclosure generally means:",
        "options": [
          "Verify safely, report privately, coordinate remediation, then disclose proportionately",
          "Publish data immediately to prove impact",
          "Continue testing until every possible weakness is found",
          "Sell the vulnerability to the highest bidder"
        ],
        "correctIndex": 0,
        "modelAnswer": "The process protects people while giving the owner a reasonable chance to remediate."
      },
      {
        "type": "mcq",
        "prompt": "The “can, may, should” test separates:",
        "options": [
          "Technical possibility, legal permission and ethical justification",
          "Confidentiality, integrity and availability",
          "Detection, containment and recovery",
          "Hashing, encryption and signing"
        ],
        "correctIndex": 0,
        "modelAnswer": "It prompts distinct technical, legal and ethical checks."
      },
      {
        "type": "mcq",
        "prompt": "Consensus in a distributed ledger can help nodes agree on:",
        "options": [
          "An ordered ledger state under protocol assumptions",
          "Whether every real-world input is truthful",
          "Whether a contract is legally enforceable",
          "Whether code contains no bugs"
        ],
        "correctIndex": 0,
        "modelAnswer": "Consensus coordinates state; it cannot validate all external facts or legal meaning."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 10,
    "title": "Exam Paper — Practice 7",
    "topics": "Predicted, original practice questions based on Week 7 — secure networks, protocols and TLS. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 7/lecture/Week07-Secure network, UDP, TCP, TLS, HTTPS.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "TLS and network paths (10 marks)\nA student connects to campus Wi-Fi and sees a certificate warning for the university login page. A friend says HTTPS is only about encrypting data, so clicking through is harmless if the password is strong.\n\n(a) Explain what a correctly validated TLS certificate helps establish. (3 marks)\n(b) Explain why the warning matters even if the connection is encrypted. (4 marks)\n(c) Give a safer next step and one risk TLS does not solve. (3 marks)",
        "modelAnswer": "TLS can provide confidentiality and integrity in transit and authenticate that the peer controls a certificate valid for the requested domain. An invalid certificate means the client cannot reliably authenticate the server; an attacker may terminate separate encrypted connections and steal credentials. Do not proceed; use a trusted bookmark/network and report the warning. TLS does not prevent phishing on a valid lookalike domain, compromised endpoints, or broken server-side authorisation."
      },
      {
        "type": "mcq",
        "prompt": "A blockchain oracle is a trust boundary because it:",
        "options": [
          "Brings external information into the on-chain system",
          "Encrypts every private key automatically",
          "Prevents smart-contract bugs",
          "Replaces consensus"
        ],
        "correctIndex": 0,
        "modelAnswer": "On-chain logic depends on the integrity and availability of off-chain inputs."
      },
      {
        "type": "mcq",
        "prompt": "A smart contract passes static analysis. What can safely be concluded?",
        "options": [
          "The tool found no issues within its checks; this is not proof of overall safety",
          "The contract cannot lose funds",
          "Every runtime state has been exhaustively tested",
          "The oracle data is truthful"
        ],
        "correctIndex": 0,
        "modelAnswer": "Analysis has scope and limitations; combine methods and review assumptions."
      },
      {
        "type": "mcq",
        "prompt": "Which is a common static-analysis limitation?",
        "options": [
          "False positives and false negatives",
          "It always requires production exploitation",
          "It cannot inspect source code",
          "It proves human intent"
        ],
        "correctIndex": 0,
        "modelAnswer": "Approximation and incomplete models can miss bugs or flag benign patterns."
      },
      {
        "type": "mcq",
        "prompt": "Which combination gives stronger software assurance before a high-risk release?",
        "options": [
          "Threat modelling, static analysis, dynamic tests, independent review and staged rollout",
          "One clean scanner report",
          "Removing logs to reduce noise",
          "Relying on user reports after launch"
        ],
        "correctIndex": 0,
        "modelAnswer": "Layered assurance combines complementary methods and controlled release."
      },
      {
        "type": "mcq",
        "prompt": "An event becomes a security incident when it:",
        "options": [
          "Meets defined criteria for actual or suspected adverse security impact",
          "Appears in any log at all",
          "Is mentioned in a status meeting",
          "Has already become public"
        ],
        "correctIndex": 0,
        "modelAnswer": "Events are triaged; classification criteria determine whether escalation to incident is warranted."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 11,
    "title": "Exam Paper — Practice 8",
    "topics": "Predicted, original practice questions based on Week 8 — software and system security. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 8/lecture/Week08_Software and System security.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Secure software and monitoring (10 marks)\nA web app builds SQL by concatenating a search string into a query. It returns detailed database errors to users. The team relies on a network firewall and says that SQL injection is unlikely because only staff can log in.\n\n(a) Identify the injection weakness and its trust-boundary cause. (3 marks)\n(b) Recommend a primary code-level fix and two impact-limiting controls. (4 marks)\n(c) Name a suitable detective control and what it should capture. (3 marks)",
        "modelAnswer": "Untrusted input is being treated as executable SQL structure because code and data are concatenated. Use parameterised queries/prepared statements so input remains data. Also apply least-privilege database permissions and safe error handling; validate inputs as an additional control, not the primary injection defence. Centralised audit/security logging and monitoring should record relevant identity, time, request/action and outcome without leaking secrets."
      },
      {
        "type": "mcq",
        "prompt": "Which action best preserves digital evidence?",
        "options": [
          "Record a timeline, protect relevant logs and document handling/access",
          "Edit logs to remove personal data before copying",
          "Reboot all systems before recording state",
          "Share evidence in an unrestricted chat"
        ],
        "correctIndex": 0,
        "modelAnswer": "Preserve originals, document collection and maintain controlled access/chain of custody."
      },
      {
        "type": "mcq",
        "prompt": "Why is recovery testing important for backups?",
        "options": [
          "A backup that has never been restored may not meet recovery needs",
          "It makes encryption unnecessary",
          "It proves the original system cannot fail",
          "It replaces incident response"
        ],
        "correctIndex": 0,
        "modelAnswer": "Restore tests validate that data is usable and recovery objectives are achievable."
      },
      {
        "type": "mcq",
        "prompt": "RTO refers to:",
        "options": [
          "The target time to restore a service after disruption",
          "The maximum acceptable data loss measured in time",
          "A cryptographic key length",
          "The time to patch a vulnerability"
        ],
        "correctIndex": 0,
        "modelAnswer": "Recovery Time Objective is the service-restoration time target."
      },
      {
        "type": "mcq",
        "prompt": "RPO refers to:",
        "options": [
          "The maximum acceptable data loss measured in time",
          "The target time to restore a service",
          "The age of an encryption key",
          "The number of incidents per year"
        ],
        "correctIndex": 0,
        "modelAnswer": "Recovery Point Objective measures the tolerable time window of data loss."
      },
      {
        "type": "mcq",
        "prompt": "Which privacy approach best reduces impact if a dataset is exposed?",
        "options": [
          "Collect only needed data and set justified retention/deletion rules",
          "Keep all data indefinitely for possible future use",
          "Share one admin account",
          "Rely only on encryption"
        ],
        "correctIndex": 0,
        "modelAnswer": "Data minimisation and retention limits reduce unnecessary exposure."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 12,
    "title": "Exam Paper — Practice 9",
    "topics": "Predicted, original practice questions based on Week 9 — ethics, privacy and incident response. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 9/lecture/INFO5995 Week 9 Ethics and Incident Response.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Ethics, privacy and incident response (10 marks)\nA staff member reports that a compromised vendor account downloaded customer records. The incident lead wants to delete logs to avoid reputational damage and delay notifying anyone until the attacker publishes the data.\n\n(a) State the first response priorities, including evidence handling. (4 marks)\n(b) Explain the professional/ethical problem with deleting logs or concealing the incident. (3 marks)\n(c) State how to assess notification duties under the Australian NDB scheme. (3 marks)",
        "modelAnswer": "Validate and triage the report, preserve logs/evidence, scope affected data and accounts, contain the compromised vendor access, and coordinate recovery. Deleting evidence and concealing a known risk undermine accountability, honesty and the ability to protect affected people or investigate. Assess whether personal information was accessed/disclosed or lost and whether serious harm is likely; consider whether remedial action has prevented that harm, then follow applicable notification duties to affected individuals and the OAIC if eligible."
      },
      {
        "type": "mcq",
        "prompt": "A CSF-style risk program should include:",
        "options": [
          "Identify, protect, detect, respond, recover and governance activities",
          "Only prevention controls",
          "Only annual penetration testing",
          "Only an incident hotline"
        ],
        "correctIndex": 0,
        "modelAnswer": "A cybersecurity program covers the lifecycle, including governance and recovery."
      },
      {
        "type": "mcq",
        "prompt": "What is the key risk of a shared privileged account?",
        "options": [
          "Weak individual accountability and difficult attribution",
          "Improved non-repudiation",
          "Automatic separation of duties",
          "Lower attack surface by definition"
        ],
        "correctIndex": 0,
        "modelAnswer": "Shared credentials obscure who performed actions and broaden access."
      },
      {
        "type": "mcq",
        "prompt": "Which principle requires a professional to avoid concealing a known serious security risk?",
        "options": [
          "Honesty and accountability",
          "Security through obscurity",
          "Availability",
          "Data portability"
        ],
        "correctIndex": 0,
        "modelAnswer": "Professional codes emphasize honest communication and accountability for foreseeable harm."
      },
      {
        "type": "mcq",
        "prompt": "A vendor account is no longer needed after a project. What is best practice?",
        "options": [
          "Revoke it promptly and review related credentials/access",
          "Leave it active but rename it",
          "Share it with another vendor",
          "Disable logging for the account"
        ],
        "correctIndex": 0,
        "modelAnswer": "Remove stale access; periodically review third-party identities and privileges."
      },
      {
        "type": "mcq",
        "prompt": "Which security measure best addresses a malicious dependency update?",
        "options": [
          "Dependency inventory, verified sources, timely patching and build controls",
          "Assume signed packages are harmless",
          "Disable all monitoring",
          "Store a copy of the old password"
        ],
        "correctIndex": 0,
        "modelAnswer": "Supply-chain controls reduce exposure and improve provenance/response."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 13,
    "title": "Exam Paper — Practice 10",
    "topics": "Predicted, original practice questions based on Weeks 10–12 — consensus, program analysis, organisational aspects and future cybersecurity. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style.",
    "instructions": "Practice format, not an official exam specification: one 10-mark scenario with applied subparts and five single-best-answer MCQs. The supplied revision bank separately contains 30 single-answer MCQs and 10-mark scenarios, but the assessment overview does not confirm the final exam question count or format. Attempt before reviewing the separate answer guide.",
    "sourceFiles": [
      "Week 10/lecture/Week10_Consensus, blockchain, decentralised finance.pdf",
      "Week 11/lecture/Week11_Program Analysis, Human, Organisational & Regulatory Aspects.pdf",
      "Week 12/lecture/INFO5995_Week12_Future_of_Cybersecurity_Revised.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Consensus, program analysis and future risk (10 marks)\nA fintech proposes a blockchain ledger for audit records and an AI code scanner for smart contracts. The team assumes that consensus makes all recorded data true and that a clean static-analysis report proves the contract is safe.\n\n(a) Explain what consensus can establish and what it cannot establish about submitted data. (3 marks)\n(b) Explain one limitation of static program analysis. (3 marks)\n(c) Recommend two governance/assurance steps before handling real funds. (4 marks)",
        "modelAnswer": "Consensus helps distributed participants agree on an ordered ledger state under the protocol’s assumptions; it does not prove that an input was truthful, lawful or correct. Static analysis reasons about code without executing it, but may produce false positives/negatives and cannot prove all runtime/environmental properties in general. Independently review the threat model and oracle/input trust, combine static and dynamic testing with expert review, test recovery/upgrade controls, and use staged limits with an accountable release decision."
      },
      {
        "type": "mcq",
        "prompt": "Why should security controls be layered?",
        "options": [
          "A single control can fail or be bypassed, so independent measures reduce residual risk",
          "Layering guarantees zero risk",
          "It means using only encryption",
          "It makes threat modelling unnecessary"
        ],
        "correctIndex": 0,
        "modelAnswer": "Defence in depth limits reliance on one barrier."
      },
      {
        "type": "mcq",
        "prompt": "Which statement about authorization is correct?",
        "options": [
          "Authentication establishes identity; authorization decides permitted actions",
          "Authorization proves a password is correct",
          "They are identical terms",
          "Authentication determines data retention periods"
        ],
        "correctIndex": 0,
        "modelAnswer": "Identity verification and permission checking are distinct."
      },
      {
        "type": "mcq",
        "prompt": "A login system sends repeated push requests hoping a user will approve one. This is:",
        "options": [
          "MFA fatigue/push bombing",
          "SQL injection",
          "A hash collision",
          "A certificate pin"
        ],
        "correctIndex": 0,
        "modelAnswer": "Repeated prompts exploit user fatigue to obtain an approval."
      },
      {
        "type": "mcq",
        "prompt": "Which control reduces risk from a compromised user session reading another person’s record?",
        "options": [
          "Per-object server-side authorization checks",
          "TLS alone",
          "A stronger password only",
          "A generic error page only"
        ],
        "correctIndex": 0,
        "modelAnswer": "The server must authorize each object request, regardless of valid authentication."
      },
      {
        "type": "mcq",
        "prompt": "Why do cryptographic algorithms benefit from public scrutiny?",
        "options": [
          "Researchers can examine weaknesses instead of security relying on secrecy of design",
          "It makes keys public",
          "It prevents implementation defects automatically",
          "It eliminates the need for updates"
        ],
        "correctIndex": 0,
        "modelAnswer": "Open review supports robust design; secrecy should reside in keys, not the algorithm."
      }
    ]
  }
];
