import type { ExamPaperSeed } from "../types";

export const INFO5995_PRACTICE_EXAM_PAPERS: ExamPaperSeed[] = [
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 4,
    "title": "Exam Paper — Practice 1",
    "topics": "Predicted, original practice questions based on Week 1 — foundations. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 1/lecture/Week01-Introduction, cybersecurity basics, security lifecycle, system and threat models.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "Which statement best describes a system boundary in threat modelling?",
        "options": [
          "It contains only the application source code",
          "It identifies the system, relevant users, dependencies and interfaces being assessed",
          "It lists only known vulnerabilities",
          "It is the firewall perimeter only"
        ],
        "correctIndex": 1,
        "modelAnswer": "A useful boundary includes components, actors, dependencies and interfaces relevant to the security claim."
      },
      {
        "type": "mcq",
        "prompt": "A threat model should state attacker capabilities because:",
        "options": [
          "All attackers have identical access",
          "Conclusions depend on what the attacker can reach or do",
          "It replaces testing",
          "It removes trust assumptions"
        ],
        "correctIndex": 1,
        "modelAnswer": "Different capabilities can change attack paths and whether a weakness is exploitable."
      },
      {
        "type": "mcq",
        "prompt": "An AI assistant reports a critical API flaw but gives no evidence. What should the analyst do?",
        "options": [
          "Accept the severity score",
          "Verify the actual code path and reproduce safely within authorized scope",
          "Test it against unrelated production systems",
          "Close every AI finding"
        ],
        "correctIndex": 1,
        "modelAnswer": "AI output is a hypothesis and needs controlled human verification."
      },
      {
        "type": "mcq",
        "prompt": "An Android activity is exported but not linked from the app interface. Which is true?",
        "options": [
          "Other apps may still invoke it",
          "The sandbox blocks all external intents",
          "It cannot receive user input",
          "It is automatically secure"
        ],
        "correctIndex": 0,
        "modelAnswer": "An exported component can be reached externally even if the app UI does not link it."
      },
      {
        "type": "mcq",
        "prompt": "A mobile app embeds a long-lived API secret in its APK. Why is that unsafe?",
        "options": [
          "APK content can be inspected and extracted",
          "The key is too short to use",
          "Android encrypts all resources with a secret app key",
          "Users cannot see the key on screen"
        ],
        "correctIndex": 0,
        "modelAnswer": "Distributed application packages can be reverse engineered; client secrets are not reliably secret."
      },
      {
        "type": "scenario",
        "prompt": "System boundary and threat model (10 marks)\nA regional clinic launches a patient portal reachable from home networks and mobile devices. It stores patient details and appointments, delegates login to an identity provider, and uses a cloud database. A manager says that because the application code did not change, the threat model is unchanged.\n\n(a) Define the system boundary and identify two assets worth protecting. (3 marks)\n(b) Explain two ways the new access paths or dependencies change the attack surface or trust assumptions. (4 marks)\n(c) Give one confidentiality, integrity and availability objective for this portal. (3 marks)",
        "modelAnswer": "Include the portal, identity provider, cloud database, users and relevant network paths in the boundary. Assets include patient records, credentials and service availability. Home/mobile access adds reachable entry points; the identity provider and cloud database create trust boundaries and dependency risks. Confidentiality: only authorised care staff/patients see permitted records. Integrity: only authorised staff can change clinical details. Availability: patients and clinicians can use the portal when needed."
      },
      {
        "type": "scenario",
        "prompt": "AI-assisted vulnerability verification\nA security team asks an AI coding assistant to review an authorized application repository. The assistant flags an authorization bypass but invents a library function and proposes testing against the live service. The team has a staging environment with synthetic data.\n\na) Explain why the AI finding and its confidence score are not sufficient evidence. [3 marks]\n\nb) Describe a safe, human-reviewed verification workflow for the suspected bypass. [4 marks]\n\nc) State what should be recorded in a defensible vulnerability report. [3 marks]",
        "modelAnswer": "a) The model may hallucinate code or misunderstand guards, configuration and context. Confidence is not observed exploitability. The analyst must confirm the actual code path and conditions.\n\nb) Confirm written scope and permissions; inspect the real route and authorization logic; test in staging using accounts with different roles and minimal requests; capture expected versus observed behavior; stop if impact is unexpected; have a human validate the conclusion.\n\nc) Record affected version/endpoint, preconditions, reproducible steps, expected and observed behavior, sanitized logs or responses, impact, remediation and verification limits. Distinguish observations from AI-generated hypotheses."
      },
      {
        "type": "scenario",
        "prompt": "Mobile security\nA banking app contains a long-lived backend key in its APK. An exported deep-link activity accepts a destination account and amount from an external URL, and the backend trusts the key as proof that the request came from the official app.\n\na) Explain two distinct security weaknesses in this design. [4 marks]\n\nb) Recommend checks before a transfer can be accepted. [3 marks]\n\nc) Propose a safer backend authentication design and one way to test the fix. [3 marks]",
        "modelAnswer": "a) The key can be extracted from the distributed APK and reused by attackers; it cannot be treated as confidential client-side. The exported activity accepts attacker-controlled values, and syntactically valid links do not prove user intent or authorization.\n\nb) Validate and normalize account/amount server-side; authenticate the user and authorize the specific transfer; require confirmation in a trusted UI and apply transaction limits or step-up authentication for higher-risk transfers.\n\nc) Remove the shared privileged key from the app. Authenticate users through an appropriate identity flow and use short-lived scoped tokens with server-side authorization. Test by inspecting the APK for secrets and invoking crafted external links in an authorized test environment to confirm unauthorized transfers are rejected."
      },
      {
        "type": "scenario",
        "prompt": "Cryptographic goals and replay\nA payroll service encrypts salary instructions before sending them to a partner. It does not authenticate messages, reuses a nonce with its encryption mode, and accepts a previously captured instruction if it is sent again.\n\na) Explain what encryption provides and what is missing from this design. [3 marks]\n\nb) Explain the risk of nonce reuse and recommend a safer message-protection approach. [3 marks]\n\nc) Identify the replay weakness and give a freshness control. [4 marks]",
        "modelAnswer": "a) Encryption primarily aims at confidentiality. Without authentication/integrity, an attacker may modify ciphertext or impersonate a sender; encryption alone does not establish message origin or correctness.\n\nb) Nonce reuse can break security guarantees of many modes, potentially exposing relationships or enabling forgery. Use a standard authenticated-encryption scheme with unique nonces per key, correct key management and rejection of invalid tags.\n\nc) A valid old instruction can be resent because the receiver does not check freshness. Include a unique transaction ID, nonce or sequence number, track accepted values at the receiver, enforce an appropriate freshness window and make processing idempotent."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 5,
    "title": "Exam Paper — Practice 2",
    "topics": "Predicted, original practice questions based on Weeks 2–3 — AI-assisted vulnerability discovery and mobile security. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 2/lecture/Week02-Al assisted vulnerability discovery, mobile security, assignment walkthrough.pdf",
      "Week 3/lecture/Week03-Mobile Security.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "Which cryptographic approach is best suited to protect a large file while keeping the algorithm public?",
        "options": [
          "Use a standard symmetric cipher with securely managed keys",
          "Invent a secret algorithm",
          "Use a hash as encryption",
          "Publish the secret key with the file"
        ],
        "correctIndex": 0,
        "modelAnswer": "Standard symmetric encryption is efficient for bulk data; security depends on keys and correct use, not hidden algorithms."
      },
      {
        "type": "mcq",
        "prompt": "A secure message must detect modification and authenticate a sender who shares a secret with the receiver. Use:",
        "options": [
          "An unkeyed hash alone",
          "A MAC",
          "Compression",
          "A checksum alone"
        ],
        "correctIndex": 1,
        "modelAnswer": "A MAC provides integrity and source authentication to parties sharing the key."
      },
      {
        "type": "mcq",
        "prompt": "Why does an authenticated encrypted message still need replay protection?",
        "options": [
          "Authentication always expires",
          "A valid old message may be resent unchanged",
          "Encryption exposes the key",
          "Replay is only possible without TLS"
        ],
        "correctIndex": 1,
        "modelAnswer": "Integrity/authenticity do not inherently establish freshness; use nonces, sequence numbers or equivalent state."
      },
      {
        "type": "mcq",
        "prompt": "A user receives an HTTPS certificate warning for a banking site. Safest response?",
        "options": [
          "Ignore it if the page looks right",
          "Stop and verify the server identity before entering credentials",
          "Switch to HTTP",
          "Install any certificate offered by a pop-up"
        ],
        "correctIndex": 1,
        "modelAnswer": "Certificate validation supports server authentication and helps resist impersonation."
      },
      {
        "type": "mcq",
        "prompt": "Which control most directly prevents SQL injection in a search query?",
        "options": [
          "Parameterized queries",
          "A longer database name",
          "TLS alone",
          "Hiding the submit button"
        ],
        "correctIndex": 0,
        "modelAnswer": "Parameter binding keeps user input as data rather than SQL syntax."
      },
      {
        "type": "scenario",
        "prompt": "AI-assisted mobile review (10 marks)\nA student team uses an AI agent to review an Android app. The agent proposes a deep link payload that might expose another user’s data. The team has permission to inspect the provided APK, but not to probe the live production service.\n\n(a) Describe a safe way to verify the AI claim using the authorised APK and evidence. (4 marks)\n(b) Explain why the agent’s confident report is not proof of a vulnerability. (3 marks)\n(c) State the boundary between authorised analysis and out-of-scope testing. (3 marks)",
        "modelAnswer": "Reproduce the claim against the provided APK in a controlled environment, inspect the relevant manifest/code and data flow, and record the exact steps and evidence. AI can hallucinate, miss context or confuse a risky pattern with an exploitable path, so findings need independent verification. Test only the supplied APK and approved test environment; do not send crafted traffic to production without explicit authorisation."
      },
      {
        "type": "scenario",
        "prompt": "Cryptographic goals and replay\nA payroll service encrypts salary instructions before sending them to a partner. It does not authenticate messages, reuses a nonce with its encryption mode, and accepts a previously captured instruction if it is sent again.\n\na) Explain what encryption provides and what is missing from this design. [3 marks]\n\nb) Explain the risk of nonce reuse and recommend a safer message-protection approach. [3 marks]\n\nc) Identify the replay weakness and give a freshness control. [4 marks]",
        "modelAnswer": "a) Encryption primarily aims at confidentiality. Without authentication/integrity, an attacker may modify ciphertext or impersonate a sender; encryption alone does not establish message origin or correctness.\n\nb) Nonce reuse can break security guarantees of many modes, potentially exposing relationships or enabling forgery. Use a standard authenticated-encryption scheme with unique nonces per key, correct key management and rejection of invalid tags.\n\nc) A valid old instruction can be resent because the receiver does not check freshness. Include a unique transaction ID, nonce or sequence number, track accepted values at the receiver, enforce an appropriate freshness window and make processing idempotent."
      },
      {
        "type": "scenario",
        "prompt": "Authentication, authorization and cloud access\nA staff member receives repeated unexpected push-based MFA prompts and approves one while distracted. The attacker then accesses cloud files through the account. The account has standing access to every department folder, although the staff member works in finance.\n\na) Distinguish authentication from authorization using this scenario. [3 marks]\n\nb) Explain how least privilege and role-based access should change the account’s file permissions. [3 marks]\n\nc) Recommend incident-response steps and two controls to reduce the likelihood or impact of recurrence. [4 marks]",
        "modelAnswer": "a) Authentication establishes that the account holder is signing in, but the attacker induced an approval and compromised that authentication step. Authorization determines which files/actions the authenticated identity may access; the broad file access is a separate authorization failure.\n\nb) Grant the finance role only the folders and actions needed for finance work. Remove standing access to unrelated departments, use time-limited elevation for exceptional tasks and review access periodically.\n\nc) Revoke sessions and tokens, reset/re-secure authentication, preserve sign-in and file-access logs, determine what was accessed, notify security/privacy responders and follow incident procedures. Use number matching or phishing-resistant MFA, alert on repeated prompts, and apply least privilege/conditional access."
      },
      {
        "type": "scenario",
        "prompt": "Cryptography and software updates\nA supplier distributes software updates publicly. Each update is signed with the supplier’s private key; customer devices have a trusted copy of the public key. A rushed patch is signed and installs correctly, but the patch contains an unsafe configuration that disables audit logging.\n\na) Explain how the device should verify the digital signature and what a valid signature establishes. [4 marks]\n\nb) State two important properties a valid signature does not guarantee about this update. [3 marks]\n\nc) Recommend two release controls that would reduce the risk illustrated. [3 marks]",
        "modelAnswer": "a) The device verifies the signature using the trusted public key and checks that the signature corresponds to the update bytes. A valid signature supports that the update was signed by whoever controls the matching private key and that the signed bytes have not changed since signing.\n\nb) It does not prove the update is free of vulnerabilities, correctly configured, safe for the customer environment or that the signer’s key was uncompromised. It also does not by itself establish that installation is authorized under local policy.\n\nc) Use independent code/configuration review and automated security tests before signing; stage and canary the release with monitoring and rollback; enforce secure configuration baselines so audit logging cannot be disabled silently."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 6,
    "title": "Exam Paper — Practice 3",
    "topics": "Predicted, original practice questions based on Week 3 — mobile application security. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 3/lecture/Week03-Mobile Security.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "When a model has high overall accuracy but performs worse for one group, the next step is to:",
        "options": [
          "Deploy based on the average",
          "Analyse subgroup outcomes, potential harms and release criteria",
          "Hide the subgroup result",
          "Replace all human review"
        ],
        "correctIndex": 1,
        "modelAnswer": "Aggregate results can hide differential error or harm; investigate before release."
      },
      {
        "type": "mcq",
        "prompt": "A team finds a hard-coded credential in a repository. A sound response is to:",
        "options": [
          "Delete the line and leave the credential active",
          "Revoke/rotate it, assess exposure, preserve evidence and remove it from future builds",
          "Post it publicly",
          "Assume private repositories cannot leak"
        ],
        "correctIndex": 1,
        "modelAnswer": "Rotation addresses ongoing access while investigation and remediation address exposure."
      },
      {
        "type": "mcq",
        "prompt": "Which describes least privilege?",
        "options": [
          "Grant each account only permissions required for its role",
          "Give everyone admin access for convenience",
          "Share one account among a team",
          "Allow permissions indefinitely"
        ],
        "correctIndex": 0,
        "modelAnswer": "Least privilege limits the actions and data available to each identity."
      },
      {
        "type": "mcq",
        "prompt": "MFA fatigue occurs when:",
        "options": [
          "A user forgets a password",
          "Repeated unsolicited approval prompts pressure a user to approve one",
          "A token expires",
          "A system rejects a valid certificate"
        ],
        "correctIndex": 1,
        "modelAnswer": "Attackers exploit notification fatigue to obtain an authentication approval."
      },
      {
        "type": "mcq",
        "prompt": "Defence in depth means:",
        "options": [
          "One control should protect every layer",
          "Independent safeguards reduce reliance on any single control",
          "Monitoring is unnecessary",
          "All controls must use encryption"
        ],
        "correctIndex": 1,
        "modelAnswer": "Layered measures help limit risk if one control fails or is bypassed."
      },
      {
        "type": "scenario",
        "prompt": "Android exported components (10 marks)\nA university app exposes an exported activity that accepts a deep-link parameter `studentId`. The activity loads that student’s results without checking whether the signed-in user owns the record. A secret API key is also stored in the APK resources.\n\n(a) Identify the main authorisation flaw and its consequence. (3 marks)\n(b) Recommend two mobile-side or server-side mitigations. (4 marks)\n(c) Explain why moving the API key to another APK resource is not a real fix. (3 marks)",
        "modelAnswer": "This is broken object-level authorisation/IDOR: a caller can change the identifier and access another student’s results. Enforce ownership and role checks server-side for every request; validate deep-link inputs and expose only components that need external invocation. Remove privileged secrets from the client, rotate the exposed key, and use a backend-controlled credential flow. Anything shipped in an APK can be extracted, so obfuscation or moving the key does not make it secret."
      },
      {
        "type": "scenario",
        "prompt": "Network security and phishing\nEmployees use airport Wi-Fi to access a payroll portal. An attacker operates a lookalike access point and sends a convincing payroll-reset email linking to a fake login page. Some staff assume the HTTPS padlock proves the site is legitimate.\n\na) Explain what TLS can protect in this situation and what it cannot establish about the email or website’s intent. [3 marks]\n\nb) Recommend two controls for employees or the organization to reduce phishing and credential risk. [3 marks]\n\nc) Describe a safe response when a user suspects credentials were entered on the fake page. [4 marks]",
        "modelAnswer": "a) TLS can encrypt traffic to the endpoint and authenticate the domain named in a valid certificate, if validation is correct. It does not prove the page is the intended payroll service when the user visits a lookalike domain, nor does HTTPS make an email trustworthy.\n\nb) Use phishing-resistant MFA/passkeys and a trusted bookmarked portal; deploy email filtering/domain protections and user reporting; train staff to check the exact domain and avoid links in unexpected reset emails.\n\nc) Report immediately; revoke active sessions and reset credentials using the genuine portal; notify security staff; review sign-in and account changes, preserve email/message evidence, check for unauthorized payroll data or modifications, and follow incident/privacy escalation procedures."
      },
      {
        "type": "scenario",
        "prompt": "Web application and dependency security\nAn online booking service builds SQL queries by concatenating search text. It also renders customer reviews without context-aware output encoding and relies on an old third-party component with a known security advisory.\n\na) Explain how the query construction and review rendering create different vulnerabilities. [4 marks]\n\nb) Recommend a primary mitigation for each of those two vulnerabilities. [3 marks]\n\nc) Describe how to assess and manage the vulnerable dependency, including one verification step. [3 marks]",
        "modelAnswer": "a) Concatenated untrusted input can alter SQL syntax and cause SQL injection, potentially exposing or changing database data. Unencoded review text may be interpreted by a browser as executable markup/script, causing cross-site scripting against other users.\n\nb) Use parameterized queries so values remain data; apply context-appropriate output encoding when rendering reviews, and use a restrictive content security policy as defense in depth.\n\nc) Identify the exact component/version and advisory, determine whether the vulnerable code path is present and reachable, and upgrade to a fixed supported version or apply a documented mitigation. Run dependency and regression tests in staging, then monitor for exposure."
      },
      {
        "type": "scenario",
        "prompt": "Incident response and ethical decision-making\nA university discovers that ransomware encrypted parts of its student services environment. Backups are available but have not been recently restored in a test. Attackers demand payment and threaten to publish data they claim to have copied.\n\na) Identify the immediate security priorities and explain why affected systems should be isolated carefully. [3 marks]\n\nb) Describe two evidence-preservation or investigation actions and one communication/escalation action. [3 marks]\n\nc) Apply an ethical framework and professional responsibility to the payment and recovery decision. Identify who should make the decision and what evidence they need. [4 marks]",
        "modelAnswer": "a) Contain spread, protect unaffected systems, preserve availability of critical services where safe and avoid destroying evidence. Isolate affected devices or segments based on incident-response procedures; indiscriminate shutdown may disrupt evidence or recovery, so responders should coordinate actions.\n\nb) Preserve logs, ransom notes, affected-system images and a time-stamped action record; identify scope and whether data was accessed/exfiltrated. Notify the incident lead, privacy/legal team and accountable executives, following reporting obligations and controlled communications.\n\nc) A utilitarian view weighs likely harms to affected people and the wider ecosystem; a duty-based view considers obligations not to conceal, mislead or expose people to avoidable harm. Payment has uncertain recovery and may fund further attacks. An authorized crisis/governance owner should decide with technical, legal, privacy and law-enforcement advice, verified backup status, data-impact assessment, legal constraints and recovery options."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 7,
    "title": "Exam Paper — Practice 4",
    "topics": "Predicted, original practice questions based on Week 4 — cryptography basics 1. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 4/lecture/Week04-Cryptography basics part 1.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "A team wants to test a suspected exploit affecting customer data. Best initial environment?",
        "options": [
          "Production with real accounts",
          "Staging with synthetic data and authorized scope",
          "A third-party live service",
          "An employee’s personal device"
        ],
        "correctIndex": 1,
        "modelAnswer": "Staging limits harm and supports repeatable testing."
      },
      {
        "type": "mcq",
        "prompt": "Which control most directly reduces risk from a vulnerable software dependency?",
        "options": [
          "Inventory, update and verify dependencies through a controlled process",
          "Hide the package name",
          "Disable logging",
          "Use only minified code"
        ],
        "correctIndex": 0,
        "modelAnswer": "Dependency inventory, review and timely patching reduce known-vulnerability exposure."
      },
      {
        "type": "mcq",
        "prompt": "An intrusion-detection alert may be a false positive. The analyst should:",
        "options": [
          "Disable all alerts",
          "Correlate the alert with evidence and context before classifying",
          "Assume an incident is confirmed",
          "Delete the event"
        ],
        "correctIndex": 1,
        "modelAnswer": "Validation and context reduce both missed incidents and unsupported conclusions."
      },
      {
        "type": "mcq",
        "prompt": "A digital signature can support which claim?",
        "options": [
          "The software is free of vulnerabilities",
          "A holder of the corresponding private key signed these bytes and they were not altered",
          "The software is confidential",
          "The signer is legally authorized in every context"
        ],
        "correctIndex": 1,
        "modelAnswer": "A verified signature supports integrity and key-based origin, not correctness or safety."
      },
      {
        "type": "mcq",
        "prompt": "A useful incident response first action after confirmed account compromise is to:",
        "options": [
          "Contain the compromised access while preserving relevant evidence",
          "Erase logs",
          "Wait for a public report",
          "Email the password to the team"
        ],
        "correctIndex": 0,
        "modelAnswer": "Containment limits impact; evidence preservation supports investigation."
      },
      {
        "type": "scenario",
        "prompt": "Cryptographic goals and key exchange (10 marks)\nA service encrypts messages with a public-key scheme and uses Diffie–Hellman to establish a session key. It does not authenticate the peer’s public key, and the team claims encryption alone proves the messages came from the intended server.\n\n(a) Distinguish confidentiality from authentication and integrity. (3 marks)\n(b) Explain how an active attacker can exploit unauthenticated key exchange. (4 marks)\n(c) Name a suitable mechanism to authenticate the server and bind the exchange. (3 marks)",
        "modelAnswer": "Encryption can hide message contents (confidentiality), but does not by itself prove who sent them or whether they were changed. An active attacker can establish one key with the client and a different key with the server, relay and read/alter traffic: a man-in-the-middle attack. Authenticate the server’s public key with a validated certificate/signature and use an authenticated key-exchange protocol; protect records with an authenticated channel."
      },
      {
        "type": "scenario",
        "prompt": "Network security and service availability\nAn online enrolment service is hosted behind a public gateway. During registration week, traffic surges and the service becomes unavailable. Logs show a large volume of requests from many addresses, while staff also report a lookalike Wi-Fi network near campus collecting credentials.\n\na) Distinguish the likely availability threat from the credential-harvesting threat and identify the primary security property affected by each. [3 marks]\n\nb) Recommend two layered controls to reduce the likelihood or impact of these threats. [3 marks]\n\nc) Describe how the team should investigate and recover while preserving evidence and communicating with users. [4 marks]",
        "modelAnswer": "a) The distributed request flood is consistent with a denial-of-service attempt or overload, primarily affecting availability. The lookalike Wi-Fi network is an impersonation/credential-theft threat, primarily risking confidentiality of credentials and subsequent integrity of accounts.\n\nb) Use upstream DDoS protection, rate limiting, capacity scaling and monitoring for availability; use phishing-resistant MFA, secure HTTPS certificate validation, trusted network guidance and credential-risk alerts for account protection. Controls should be layered because no single safeguard addresses both threats.\n\nc) Coordinate incident response, preserve gateway/authentication logs and indicators, determine whether accounts or data were affected, apply rate controls or traffic filtering and restore service through tested recovery steps. Reset/revoke compromised credentials if indicated, inform affected users through trusted channels and document actions and impact."
      },
      {
        "type": "scenario",
        "prompt": "Governance, privacy and secure lifecycle\nA health analytics team plans to give a supplier historical patient data to improve a predictive model. The data-sharing purpose and retention period are unclear. A pilot has shown useful average results but has not assessed subgroup performance or tested model rollback.\n\na) Identify two data-governance questions that must be resolved before sharing the data. [3 marks]\n\nb) Recommend two assurance activities before expanding the pilot, including one that addresses differential impacts or rollback. [3 marks]\n\nc) Explain the professional and governance response if the sponsor wants to proceed before these concerns are resolved. [4 marks]",
        "modelAnswer": "a) Confirm the lawful/authorized purpose and whether secondary use is permitted; identify the minimum data needed, who may access it, retention/deletion requirements, supplier obligations and onward-sharing restrictions. Name accountable data owners.\n\nb) Assess privacy/security controls and conduct a data-minimization review; test disaggregated performance and potential harms across relevant groups; define model monitoring, rollback triggers and a rehearsed rollback test before scale-up.\n\nc) Document evidence and unresolved risks, escalate through privacy, clinical/ethics and security governance, and recommend a release gate or bounded pause. Do not conceal subgroup results or represent the pilot as proven safe. An authorized risk owner decides against agreed criteria with recorded rationale, mitigations, monitoring and residual-risk acceptance."
      },
      {
        "type": "scenario",
        "prompt": "Secure development and vulnerability management\nA public benefits portal depends on a third-party logging library with a newly disclosed vulnerability. Administrators also deployed a default configuration that exposes verbose error details. The team is unsure whether the affected library is reachable in production.\n\na) Explain the security concern created by the vulnerable dependency and the exposed error details. [4 marks]\n\nb) Describe a proportionate process to determine exposure and choose a remediation. [3 marks]\n\nc) Recommend one secure-default or lifecycle control and one verification activity to reduce recurrence. [3 marks]",
        "modelAnswer": "a) A vulnerable dependency may provide an attack path if the affected code is present, reachable and exploitable in the deployed configuration; the severity depends on version, usage and exposure. Verbose errors may disclose paths, implementation details or sensitive values that help an attacker.\n\nb) Inventory the exact deployed version, review the advisory and reachability, inspect configuration and logs, and verify in an authorized staging environment. Upgrade to a fixed supported version or apply a documented mitigation, assess whether exploitation occurred, and prioritize according to impact and exposure.\n\nc) Use secure configuration baselines that disable verbose errors in production and a dependency-management process with inventory, patch ownership and change review. Verify with deployment configuration checks and a regression/security test that production responses omit internal details and the fixed dependency is deployed."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 8,
    "title": "Exam Paper — Practice 5",
    "topics": "Predicted, original practice questions based on Week 5 — cryptography basics 2. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 5/lecture/Week05-Cryptography basics part 2.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "Which property is most directly affected when an online service is unreachable to legitimate users?",
        "options": [
          "Confidentiality",
          "Integrity",
          "Availability",
          "Non-repudiation"
        ],
        "correctIndex": 2,
        "modelAnswer": "Availability concerns timely access to the service."
      },
      {
        "type": "mcq",
        "prompt": "A cryptographic algorithm should generally be:",
        "options": [
          "Kept secret as the main security measure",
          "Publicly reviewed, with keys kept secure",
          "Embedded with its key in client code",
          "Replaced by a custom cipher"
        ],
        "correctIndex": 1,
        "modelAnswer": "Modern cryptography relies on sound public algorithms and secure key management."
      },
      {
        "type": "mcq",
        "prompt": "A TLS certificate primarily helps a client:",
        "options": [
          "Verify the server identity and establish a protected channel",
          "Prove all website content is truthful",
          "Prevent phishing emails",
          "Guarantee the server has no vulnerabilities"
        ],
        "correctIndex": 0,
        "modelAnswer": "TLS certificate validation supports authentication of the endpoint and secure channel setup."
      },
      {
        "type": "mcq",
        "prompt": "Why are parameterized queries useful?",
        "options": [
          "They prevent all network attacks",
          "They separate user data from SQL commands",
          "They encrypt database records",
          "They replace authorization checks"
        ],
        "correctIndex": 1,
        "modelAnswer": "Parameterization prevents input from being interpreted as query syntax."
      },
      {
        "type": "mcq",
        "prompt": "Which practice best protects passwords stored by a service?",
        "options": [
          "Reversible encryption for support staff",
          "Salted, deliberately slow password hashing",
          "Plaintext storage",
          "A single shared hash for every user"
        ],
        "correctIndex": 1,
        "modelAnswer": "Unique salts and a suitable work factor make offline guessing more difficult."
      },
      {
        "type": "scenario",
        "prompt": "Hash, MAC and signature (10 marks)\nA payroll API receives a message containing a salary change. The team stores a plain hash beside the message and says that this prevents an attacker who can alter the database from changing the salary undetected.\n\n(a) Explain why an unkeyed hash does not authenticate the message against this attacker. (3 marks)\n(b) Distinguish a MAC from a digital signature for this use. (4 marks)\n(c) State one freshness control needed if old valid salary messages could be replayed. (3 marks)",
        "modelAnswer": "An attacker who can change both the message and its unkeyed hash can compute a new matching hash, so it does not prove origin/authenticity. A MAC uses a shared secret to authenticate integrity to parties holding the key; a digital signature uses a private key to sign and a public key to verify, supporting public verifiability. Include a nonce, sequence number, timestamp with replay protection, or unique transaction identifier that the receiver checks."
      },
      {
        "type": "scenario",
        "prompt": "Threat modelling and security foundations\nA regional clinic opens its patient portal to home networks and mobile devices. The portal stores appointments and medication records, delegates sign-in to an identity provider, and uses a cloud database. Managers say the threat model does not need revision because the application code is unchanged.\n\na) Define a suitable system boundary and identify two assets to protect. [3 marks]\n\nb) Explain two ways the expanded access or dependencies affect the attack surface or trust assumptions. [4 marks]\n\nc) Give one confidentiality, integrity and availability objective for the portal. [3 marks]",
        "modelAnswer": "a) Include users/devices, portal client and service, identity provider, cloud database, network paths and relevant administrators/dependencies. Assets include patient records, credentials/tokens and service availability. Award marks for a sensible boundary and two assets.\n\nb) Home and mobile access introduce new devices, networks and reachable interfaces that can enable credential theft or client compromise. The clinic also relies on identity-provider authentication and cloud access controls; failure or misconfiguration at either trust boundary affects the portal.\n\nc) Confidentiality: only authorized users access permitted records. Integrity: medication/appointment changes require authorized actions and are logged. Availability: patients and clinicians can access the portal when needed."
      },
      {
        "type": "scenario",
        "prompt": "AI-assisted vulnerability verification\nA security team asks an AI coding assistant to review an authorized application repository. The assistant flags an authorization bypass but invents a library function and proposes testing against the live service. The team has a staging environment with synthetic data.\n\na) Explain why the AI finding and its confidence score are not sufficient evidence. [3 marks]\n\nb) Describe a safe, human-reviewed verification workflow for the suspected bypass. [4 marks]\n\nc) State what should be recorded in a defensible vulnerability report. [3 marks]",
        "modelAnswer": "a) The model may hallucinate code or misunderstand guards, configuration and context. Confidence is not observed exploitability. The analyst must confirm the actual code path and conditions.\n\nb) Confirm written scope and permissions; inspect the real route and authorization logic; test in staging using accounts with different roles and minimal requests; capture expected versus observed behavior; stop if impact is unexpected; have a human validate the conclusion.\n\nc) Record affected version/endpoint, preconditions, reproducible steps, expected and observed behavior, sanitized logs or responses, impact, remediation and verification limits. Distinguish observations from AI-generated hypotheses."
      },
      {
        "type": "scenario",
        "prompt": "Mobile security\nA banking app contains a long-lived backend key in its APK. An exported deep-link activity accepts a destination account and amount from an external URL, and the backend trusts the key as proof that the request came from the official app.\n\na) Explain two distinct security weaknesses in this design. [4 marks]\n\nb) Recommend checks before a transfer can be accepted. [3 marks]\n\nc) Propose a safer backend authentication design and one way to test the fix. [3 marks]",
        "modelAnswer": "a) The key can be extracted from the distributed APK and reused by attackers; it cannot be treated as confidential client-side. The exported activity accepts attacker-controlled values, and syntactically valid links do not prove user intent or authorization.\n\nb) Validate and normalize account/amount server-side; authenticate the user and authorize the specific transfer; require confirmation in a trusted UI and apply transaction limits or step-up authentication for higher-risk transfers.\n\nc) Remove the shared privileged key from the app. Authenticate users through an appropriate identity flow and use short-lived scoped tokens with server-side authorization. Test by inspecting the APK for secrets and invoking crafted external links in an authorized test environment to confirm unauthorized transfers are rejected."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 9,
    "title": "Exam Paper — Practice 6",
    "topics": "Predicted, original practice questions based on Week 6 — applied security and cloud. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 6/lecture/INFO5995-Week 6_ Applied Cryptography and Secure Communications.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "If the same stream-cipher keystream is reused for two messages, an attacker may:",
        "options": [
          "Learn relationships between plaintexts from combined ciphertexts",
          "Recover the key with certainty in every case",
          "Only learn message length",
          "Have no advantage"
        ],
        "correctIndex": 0,
        "modelAnswer": "XORing ciphertexts cancels the reused keystream and exposes the XOR relation of plaintexts."
      },
      {
        "type": "mcq",
        "prompt": "Which statement about a MAC is correct?",
        "options": [
          "Anyone can verify it using a public key",
          "It uses a shared secret to authenticate integrity between key holders",
          "It encrypts the message",
          "It proves the message is safe to execute"
        ],
        "correctIndex": 1,
        "modelAnswer": "A MAC is a keyed integrity/authentication mechanism for parties sharing the secret."
      },
      {
        "type": "mcq",
        "prompt": "A production service shows repeated unexpected login approvals. This most suggests:",
        "options": [
          "MFA fatigue/push bombing",
          "A successful backup",
          "A certificate renewal",
          "A quality audit"
        ],
        "correctIndex": 0,
        "modelAnswer": "Repeated prompts can be used to pressure a user into approving an attacker’s login."
      },
      {
        "type": "mcq",
        "prompt": "Which is the safest response to a possible privacy incident?",
        "options": [
          "Contain exposure, preserve evidence and notify accountable incident/privacy leads",
          "Investigate by copying all data to personal storage",
          "Delete logs to protect reputation",
          "Wait until the next release"
        ],
        "correctIndex": 0,
        "modelAnswer": "Prompt, proportionate containment and evidence-based escalation are appropriate."
      },
      {
        "type": "mcq",
        "prompt": "Why should secure defaults matter?",
        "options": [
          "They make unsafe configuration the user’s responsibility",
          "The system should start with protective settings unless a justified need changes them",
          "They eliminate the need for updates",
          "They replace user authorization"
        ],
        "correctIndex": 1,
        "modelAnswer": "Secure defaults reduce risk when users do not change configuration."
      },
      {
        "type": "scenario",
        "prompt": "Authentication and cloud access (10 marks)\nA cloud-hosted learning service uses password plus PIN as “two-factor authentication.” Staff share a powerful administrator account, and a storage bucket containing student records is publicly readable.\n\n(a) Explain why password plus PIN are not independent authentication factors. (2 marks)\n(b) Recommend one authentication and two access-control/cloud controls. (5 marks)\n(c) State one backup/recovery control that addresses availability. (3 marks)",
        "modelAnswer": "A password and PIN are both knowledge factors, so they do not provide two independent factor categories. Use a password plus a possession factor such as a phishing-resistant passkey or authenticator. Give staff unique accounts, MFA, role-based least privilege and reviewable admin access; make the bucket private and restrict access by identity/policy, then audit it. Maintain isolated, protected backups and test restoration against a recovery objective."
      },
      {
        "type": "scenario",
        "prompt": "Cryptographic goals and replay\nA payroll service encrypts salary instructions before sending them to a partner. It does not authenticate messages, reuses a nonce with its encryption mode, and accepts a previously captured instruction if it is sent again.\n\na) Explain what encryption provides and what is missing from this design. [3 marks]\n\nb) Explain the risk of nonce reuse and recommend a safer message-protection approach. [3 marks]\n\nc) Identify the replay weakness and give a freshness control. [4 marks]",
        "modelAnswer": "a) Encryption primarily aims at confidentiality. Without authentication/integrity, an attacker may modify ciphertext or impersonate a sender; encryption alone does not establish message origin or correctness.\n\nb) Nonce reuse can break security guarantees of many modes, potentially exposing relationships or enabling forgery. Use a standard authenticated-encryption scheme with unique nonces per key, correct key management and rejection of invalid tags.\n\nc) A valid old instruction can be resent because the receiver does not check freshness. Include a unique transaction ID, nonce or sequence number, track accepted values at the receiver, enforce an appropriate freshness window and make processing idempotent."
      },
      {
        "type": "scenario",
        "prompt": "Authentication, authorization and cloud access\nA staff member receives repeated unexpected push-based MFA prompts and approves one while distracted. The attacker then accesses cloud files through the account. The account has standing access to every department folder, although the staff member works in finance.\n\na) Distinguish authentication from authorization using this scenario. [3 marks]\n\nb) Explain how least privilege and role-based access should change the account’s file permissions. [3 marks]\n\nc) Recommend incident-response steps and two controls to reduce the likelihood or impact of recurrence. [4 marks]",
        "modelAnswer": "a) Authentication establishes that the account holder is signing in, but the attacker induced an approval and compromised that authentication step. Authorization determines which files/actions the authenticated identity may access; the broad file access is a separate authorization failure.\n\nb) Grant the finance role only the folders and actions needed for finance work. Remove standing access to unrelated departments, use time-limited elevation for exceptional tasks and review access periodically.\n\nc) Revoke sessions and tokens, reset/re-secure authentication, preserve sign-in and file-access logs, determine what was accessed, notify security/privacy responders and follow incident procedures. Use number matching or phishing-resistant MFA, alert on repeated prompts, and apply least privilege/conditional access."
      },
      {
        "type": "scenario",
        "prompt": "Cryptography and software updates\nA supplier distributes software updates publicly. Each update is signed with the supplier’s private key; customer devices have a trusted copy of the public key. A rushed patch is signed and installs correctly, but the patch contains an unsafe configuration that disables audit logging.\n\na) Explain how the device should verify the digital signature and what a valid signature establishes. [4 marks]\n\nb) State two important properties a valid signature does not guarantee about this update. [3 marks]\n\nc) Recommend two release controls that would reduce the risk illustrated. [3 marks]",
        "modelAnswer": "a) The device verifies the signature using the trusted public key and checks that the signature corresponds to the update bytes. A valid signature supports that the update was signed by whoever controls the matching private key and that the signed bytes have not changed since signing.\n\nb) It does not prove the update is free of vulnerabilities, correctly configured, safe for the customer environment or that the signer’s key was uncompromised. It also does not by itself establish that installation is authorized under local policy.\n\nc) Use independent code/configuration review and automated security tests before signing; stage and canary the release with monitoring and rollback; enforce secure configuration baselines so audit logging cannot be disabled silently."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 10,
    "title": "Exam Paper — Practice 7",
    "topics": "Predicted, original practice questions based on Week 7 — secure networks, protocols and TLS. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 7/lecture/Week07-Secure network, UDP, TCP, TLS, HTTPS.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "Which statement best describes a system boundary in threat modelling?",
        "options": [
          "It contains only the application source code",
          "It identifies the system, relevant users, dependencies and interfaces being assessed",
          "It lists only known vulnerabilities",
          "It is the firewall perimeter only"
        ],
        "correctIndex": 1,
        "modelAnswer": "A useful boundary includes components, actors, dependencies and interfaces relevant to the security claim."
      },
      {
        "type": "mcq",
        "prompt": "A threat model should state attacker capabilities because:",
        "options": [
          "All attackers have identical access",
          "Conclusions depend on what the attacker can reach or do",
          "It replaces testing",
          "It removes trust assumptions"
        ],
        "correctIndex": 1,
        "modelAnswer": "Different capabilities can change attack paths and whether a weakness is exploitable."
      },
      {
        "type": "mcq",
        "prompt": "An AI assistant reports a critical API flaw but gives no evidence. What should the analyst do?",
        "options": [
          "Accept the severity score",
          "Verify the actual code path and reproduce safely within authorized scope",
          "Test it against unrelated production systems",
          "Close every AI finding"
        ],
        "correctIndex": 1,
        "modelAnswer": "AI output is a hypothesis and needs controlled human verification."
      },
      {
        "type": "mcq",
        "prompt": "An Android activity is exported but not linked from the app interface. Which is true?",
        "options": [
          "Other apps may still invoke it",
          "The sandbox blocks all external intents",
          "It cannot receive user input",
          "It is automatically secure"
        ],
        "correctIndex": 0,
        "modelAnswer": "An exported component can be reached externally even if the app UI does not link it."
      },
      {
        "type": "mcq",
        "prompt": "A mobile app embeds a long-lived API secret in its APK. Why is that unsafe?",
        "options": [
          "APK content can be inspected and extracted",
          "The key is too short to use",
          "Android encrypts all resources with a secret app key",
          "Users cannot see the key on screen"
        ],
        "correctIndex": 0,
        "modelAnswer": "Distributed application packages can be reverse engineered; client secrets are not reliably secret."
      },
      {
        "type": "scenario",
        "prompt": "TLS and network paths (10 marks)\nA student connects to campus Wi-Fi and sees a certificate warning for the university login page. A friend says HTTPS is only about encrypting data, so clicking through is harmless if the password is strong.\n\n(a) Explain what a correctly validated TLS certificate helps establish. (3 marks)\n(b) Explain why the warning matters even if the connection is encrypted. (4 marks)\n(c) Give a safer next step and one risk TLS does not solve. (3 marks)",
        "modelAnswer": "TLS can provide confidentiality and integrity in transit and authenticate that the peer controls a certificate valid for the requested domain. An invalid certificate means the client cannot reliably authenticate the server; an attacker may terminate separate encrypted connections and steal credentials. Do not proceed; use a trusted bookmark/network and report the warning. TLS does not prevent phishing on a valid lookalike domain, compromised endpoints, or broken server-side authorisation."
      },
      {
        "type": "scenario",
        "prompt": "Network security and phishing\nEmployees use airport Wi-Fi to access a payroll portal. An attacker operates a lookalike access point and sends a convincing payroll-reset email linking to a fake login page. Some staff assume the HTTPS padlock proves the site is legitimate.\n\na) Explain what TLS can protect in this situation and what it cannot establish about the email or website’s intent. [3 marks]\n\nb) Recommend two controls for employees or the organization to reduce phishing and credential risk. [3 marks]\n\nc) Describe a safe response when a user suspects credentials were entered on the fake page. [4 marks]",
        "modelAnswer": "a) TLS can encrypt traffic to the endpoint and authenticate the domain named in a valid certificate, if validation is correct. It does not prove the page is the intended payroll service when the user visits a lookalike domain, nor does HTTPS make an email trustworthy.\n\nb) Use phishing-resistant MFA/passkeys and a trusted bookmarked portal; deploy email filtering/domain protections and user reporting; train staff to check the exact domain and avoid links in unexpected reset emails.\n\nc) Report immediately; revoke active sessions and reset credentials using the genuine portal; notify security staff; review sign-in and account changes, preserve email/message evidence, check for unauthorized payroll data or modifications, and follow incident/privacy escalation procedures."
      },
      {
        "type": "scenario",
        "prompt": "Web application and dependency security\nAn online booking service builds SQL queries by concatenating search text. It also renders customer reviews without context-aware output encoding and relies on an old third-party component with a known security advisory.\n\na) Explain how the query construction and review rendering create different vulnerabilities. [4 marks]\n\nb) Recommend a primary mitigation for each of those two vulnerabilities. [3 marks]\n\nc) Describe how to assess and manage the vulnerable dependency, including one verification step. [3 marks]",
        "modelAnswer": "a) Concatenated untrusted input can alter SQL syntax and cause SQL injection, potentially exposing or changing database data. Unencoded review text may be interpreted by a browser as executable markup/script, causing cross-site scripting against other users.\n\nb) Use parameterized queries so values remain data; apply context-appropriate output encoding when rendering reviews, and use a restrictive content security policy as defense in depth.\n\nc) Identify the exact component/version and advisory, determine whether the vulnerable code path is present and reachable, and upgrade to a fixed supported version or apply a documented mitigation. Run dependency and regression tests in staging, then monitor for exposure."
      },
      {
        "type": "scenario",
        "prompt": "Incident response and ethical decision-making\nA university discovers that ransomware encrypted parts of its student services environment. Backups are available but have not been recently restored in a test. Attackers demand payment and threaten to publish data they claim to have copied.\n\na) Identify the immediate security priorities and explain why affected systems should be isolated carefully. [3 marks]\n\nb) Describe two evidence-preservation or investigation actions and one communication/escalation action. [3 marks]\n\nc) Apply an ethical framework and professional responsibility to the payment and recovery decision. Identify who should make the decision and what evidence they need. [4 marks]",
        "modelAnswer": "a) Contain spread, protect unaffected systems, preserve availability of critical services where safe and avoid destroying evidence. Isolate affected devices or segments based on incident-response procedures; indiscriminate shutdown may disrupt evidence or recovery, so responders should coordinate actions.\n\nb) Preserve logs, ransom notes, affected-system images and a time-stamped action record; identify scope and whether data was accessed/exfiltrated. Notify the incident lead, privacy/legal team and accountable executives, following reporting obligations and controlled communications.\n\nc) A utilitarian view weighs likely harms to affected people and the wider ecosystem; a duty-based view considers obligations not to conceal, mislead or expose people to avoidable harm. Payment has uncertain recovery and may fund further attacks. An authorized crisis/governance owner should decide with technical, legal, privacy and law-enforcement advice, verified backup status, data-impact assessment, legal constraints and recovery options."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 11,
    "title": "Exam Paper — Practice 8",
    "topics": "Predicted, original practice questions based on Week 8 — software and system security. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 8/lecture/Week08_Software and System security.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "Which cryptographic approach is best suited to protect a large file while keeping the algorithm public?",
        "options": [
          "Use a standard symmetric cipher with securely managed keys",
          "Invent a secret algorithm",
          "Use a hash as encryption",
          "Publish the secret key with the file"
        ],
        "correctIndex": 0,
        "modelAnswer": "Standard symmetric encryption is efficient for bulk data; security depends on keys and correct use, not hidden algorithms."
      },
      {
        "type": "mcq",
        "prompt": "A secure message must detect modification and authenticate a sender who shares a secret with the receiver. Use:",
        "options": [
          "An unkeyed hash alone",
          "A MAC",
          "Compression",
          "A checksum alone"
        ],
        "correctIndex": 1,
        "modelAnswer": "A MAC provides integrity and source authentication to parties sharing the key."
      },
      {
        "type": "mcq",
        "prompt": "Why does an authenticated encrypted message still need replay protection?",
        "options": [
          "Authentication always expires",
          "A valid old message may be resent unchanged",
          "Encryption exposes the key",
          "Replay is only possible without TLS"
        ],
        "correctIndex": 1,
        "modelAnswer": "Integrity/authenticity do not inherently establish freshness; use nonces, sequence numbers or equivalent state."
      },
      {
        "type": "mcq",
        "prompt": "A user receives an HTTPS certificate warning for a banking site. Safest response?",
        "options": [
          "Ignore it if the page looks right",
          "Stop and verify the server identity before entering credentials",
          "Switch to HTTP",
          "Install any certificate offered by a pop-up"
        ],
        "correctIndex": 1,
        "modelAnswer": "Certificate validation supports server authentication and helps resist impersonation."
      },
      {
        "type": "mcq",
        "prompt": "Which control most directly prevents SQL injection in a search query?",
        "options": [
          "Parameterized queries",
          "A longer database name",
          "TLS alone",
          "Hiding the submit button"
        ],
        "correctIndex": 0,
        "modelAnswer": "Parameter binding keeps user input as data rather than SQL syntax."
      },
      {
        "type": "scenario",
        "prompt": "Secure software and monitoring (10 marks)\nA web app builds SQL by concatenating a search string into a query. It returns detailed database errors to users. The team relies on a network firewall and says that SQL injection is unlikely because only staff can log in.\n\n(a) Identify the injection weakness and its trust-boundary cause. (3 marks)\n(b) Recommend a primary code-level fix and two impact-limiting controls. (4 marks)\n(c) Name a suitable detective control and what it should capture. (3 marks)",
        "modelAnswer": "Untrusted input is being treated as executable SQL structure because code and data are concatenated. Use parameterised queries/prepared statements so input remains data. Also apply least-privilege database permissions and safe error handling; validate inputs as an additional control, not the primary injection defence. Centralised audit/security logging and monitoring should record relevant identity, time, request/action and outcome without leaking secrets."
      },
      {
        "type": "scenario",
        "prompt": "Network security and service availability\nAn online enrolment service is hosted behind a public gateway. During registration week, traffic surges and the service becomes unavailable. Logs show a large volume of requests from many addresses, while staff also report a lookalike Wi-Fi network near campus collecting credentials.\n\na) Distinguish the likely availability threat from the credential-harvesting threat and identify the primary security property affected by each. [3 marks]\n\nb) Recommend two layered controls to reduce the likelihood or impact of these threats. [3 marks]\n\nc) Describe how the team should investigate and recover while preserving evidence and communicating with users. [4 marks]",
        "modelAnswer": "a) The distributed request flood is consistent with a denial-of-service attempt or overload, primarily affecting availability. The lookalike Wi-Fi network is an impersonation/credential-theft threat, primarily risking confidentiality of credentials and subsequent integrity of accounts.\n\nb) Use upstream DDoS protection, rate limiting, capacity scaling and monitoring for availability; use phishing-resistant MFA, secure HTTPS certificate validation, trusted network guidance and credential-risk alerts for account protection. Controls should be layered because no single safeguard addresses both threats.\n\nc) Coordinate incident response, preserve gateway/authentication logs and indicators, determine whether accounts or data were affected, apply rate controls or traffic filtering and restore service through tested recovery steps. Reset/revoke compromised credentials if indicated, inform affected users through trusted channels and document actions and impact."
      },
      {
        "type": "scenario",
        "prompt": "Governance, privacy and secure lifecycle\nA health analytics team plans to give a supplier historical patient data to improve a predictive model. The data-sharing purpose and retention period are unclear. A pilot has shown useful average results but has not assessed subgroup performance or tested model rollback.\n\na) Identify two data-governance questions that must be resolved before sharing the data. [3 marks]\n\nb) Recommend two assurance activities before expanding the pilot, including one that addresses differential impacts or rollback. [3 marks]\n\nc) Explain the professional and governance response if the sponsor wants to proceed before these concerns are resolved. [4 marks]",
        "modelAnswer": "a) Confirm the lawful/authorized purpose and whether secondary use is permitted; identify the minimum data needed, who may access it, retention/deletion requirements, supplier obligations and onward-sharing restrictions. Name accountable data owners.\n\nb) Assess privacy/security controls and conduct a data-minimization review; test disaggregated performance and potential harms across relevant groups; define model monitoring, rollback triggers and a rehearsed rollback test before scale-up.\n\nc) Document evidence and unresolved risks, escalate through privacy, clinical/ethics and security governance, and recommend a release gate or bounded pause. Do not conceal subgroup results or represent the pilot as proven safe. An authorized risk owner decides against agreed criteria with recorded rationale, mitigations, monitoring and residual-risk acceptance."
      },
      {
        "type": "scenario",
        "prompt": "Secure development and vulnerability management\nA public benefits portal depends on a third-party logging library with a newly disclosed vulnerability. Administrators also deployed a default configuration that exposes verbose error details. The team is unsure whether the affected library is reachable in production.\n\na) Explain the security concern created by the vulnerable dependency and the exposed error details. [4 marks]\n\nb) Describe a proportionate process to determine exposure and choose a remediation. [3 marks]\n\nc) Recommend one secure-default or lifecycle control and one verification activity to reduce recurrence. [3 marks]",
        "modelAnswer": "a) A vulnerable dependency may provide an attack path if the affected code is present, reachable and exploitable in the deployed configuration; the severity depends on version, usage and exposure. Verbose errors may disclose paths, implementation details or sensitive values that help an attacker.\n\nb) Inventory the exact deployed version, review the advisory and reachability, inspect configuration and logs, and verify in an authorized staging environment. Upgrade to a fixed supported version or apply a documented mitigation, assess whether exploitation occurred, and prioritize according to impact and exposure.\n\nc) Use secure configuration baselines that disable verbose errors in production and a dependency-management process with inventory, patch ownership and change review. Verify with deployment configuration checks and a regression/security test that production responses omit internal details and the fixed dependency is deployed."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 12,
    "title": "Exam Paper — Practice 9",
    "topics": "Predicted, original practice questions based on Week 9 — ethics, privacy and incident response. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 9/lecture/INFO5995 Week 9 Ethics and Incident Response.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "When a model has high overall accuracy but performs worse for one group, the next step is to:",
        "options": [
          "Deploy based on the average",
          "Analyse subgroup outcomes, potential harms and release criteria",
          "Hide the subgroup result",
          "Replace all human review"
        ],
        "correctIndex": 1,
        "modelAnswer": "Aggregate results can hide differential error or harm; investigate before release."
      },
      {
        "type": "mcq",
        "prompt": "A team finds a hard-coded credential in a repository. A sound response is to:",
        "options": [
          "Delete the line and leave the credential active",
          "Revoke/rotate it, assess exposure, preserve evidence and remove it from future builds",
          "Post it publicly",
          "Assume private repositories cannot leak"
        ],
        "correctIndex": 1,
        "modelAnswer": "Rotation addresses ongoing access while investigation and remediation address exposure."
      },
      {
        "type": "mcq",
        "prompt": "Which describes least privilege?",
        "options": [
          "Grant each account only permissions required for its role",
          "Give everyone admin access for convenience",
          "Share one account among a team",
          "Allow permissions indefinitely"
        ],
        "correctIndex": 0,
        "modelAnswer": "Least privilege limits the actions and data available to each identity."
      },
      {
        "type": "mcq",
        "prompt": "MFA fatigue occurs when:",
        "options": [
          "A user forgets a password",
          "Repeated unsolicited approval prompts pressure a user to approve one",
          "A token expires",
          "A system rejects a valid certificate"
        ],
        "correctIndex": 1,
        "modelAnswer": "Attackers exploit notification fatigue to obtain an authentication approval."
      },
      {
        "type": "mcq",
        "prompt": "Defence in depth means:",
        "options": [
          "One control should protect every layer",
          "Independent safeguards reduce reliance on any single control",
          "Monitoring is unnecessary",
          "All controls must use encryption"
        ],
        "correctIndex": 1,
        "modelAnswer": "Layered measures help limit risk if one control fails or is bypassed."
      },
      {
        "type": "scenario",
        "prompt": "Ethics, privacy and incident response (10 marks)\nA staff member reports that a compromised vendor account downloaded customer records. The incident lead wants to delete logs to avoid reputational damage and delay notifying anyone until the attacker publishes the data.\n\n(a) State the first response priorities, including evidence handling. (4 marks)\n(b) Explain the professional/ethical problem with deleting logs or concealing the incident. (3 marks)\n(c) State how to assess notification duties under the Australian NDB scheme. (3 marks)",
        "modelAnswer": "Validate and triage the report, preserve logs/evidence, scope affected data and accounts, contain the compromised vendor access, and coordinate recovery. Deleting evidence and concealing a known risk undermine accountability, honesty and the ability to protect affected people or investigate. Assess whether personal information was accessed/disclosed or lost and whether serious harm is likely; consider whether remedial action has prevented that harm, then follow applicable notification duties to affected individuals and the OAIC if eligible."
      },
      {
        "type": "scenario",
        "prompt": "Threat modelling and security foundations\nA regional clinic opens its patient portal to home networks and mobile devices. The portal stores appointments and medication records, delegates sign-in to an identity provider, and uses a cloud database. Managers say the threat model does not need revision because the application code is unchanged.\n\na) Define a suitable system boundary and identify two assets to protect. [3 marks]\n\nb) Explain two ways the expanded access or dependencies affect the attack surface or trust assumptions. [4 marks]\n\nc) Give one confidentiality, integrity and availability objective for the portal. [3 marks]",
        "modelAnswer": "a) Include users/devices, portal client and service, identity provider, cloud database, network paths and relevant administrators/dependencies. Assets include patient records, credentials/tokens and service availability. Award marks for a sensible boundary and two assets.\n\nb) Home and mobile access introduce new devices, networks and reachable interfaces that can enable credential theft or client compromise. The clinic also relies on identity-provider authentication and cloud access controls; failure or misconfiguration at either trust boundary affects the portal.\n\nc) Confidentiality: only authorized users access permitted records. Integrity: medication/appointment changes require authorized actions and are logged. Availability: patients and clinicians can access the portal when needed."
      },
      {
        "type": "scenario",
        "prompt": "AI-assisted vulnerability verification\nA security team asks an AI coding assistant to review an authorized application repository. The assistant flags an authorization bypass but invents a library function and proposes testing against the live service. The team has a staging environment with synthetic data.\n\na) Explain why the AI finding and its confidence score are not sufficient evidence. [3 marks]\n\nb) Describe a safe, human-reviewed verification workflow for the suspected bypass. [4 marks]\n\nc) State what should be recorded in a defensible vulnerability report. [3 marks]",
        "modelAnswer": "a) The model may hallucinate code or misunderstand guards, configuration and context. Confidence is not observed exploitability. The analyst must confirm the actual code path and conditions.\n\nb) Confirm written scope and permissions; inspect the real route and authorization logic; test in staging using accounts with different roles and minimal requests; capture expected versus observed behavior; stop if impact is unexpected; have a human validate the conclusion.\n\nc) Record affected version/endpoint, preconditions, reproducible steps, expected and observed behavior, sanitized logs or responses, impact, remediation and verification limits. Distinguish observations from AI-generated hypotheses."
      },
      {
        "type": "scenario",
        "prompt": "Mobile security\nA banking app contains a long-lived backend key in its APK. An exported deep-link activity accepts a destination account and amount from an external URL, and the backend trusts the key as proof that the request came from the official app.\n\na) Explain two distinct security weaknesses in this design. [4 marks]\n\nb) Recommend checks before a transfer can be accepted. [3 marks]\n\nc) Propose a safer backend authentication design and one way to test the fix. [3 marks]",
        "modelAnswer": "a) The key can be extracted from the distributed APK and reused by attackers; it cannot be treated as confidential client-side. The exported activity accepts attacker-controlled values, and syntactically valid links do not prove user intent or authorization.\n\nb) Validate and normalize account/amount server-side; authenticate the user and authorize the specific transfer; require confirmation in a trusted UI and apply transaction limits or step-up authentication for higher-risk transfers.\n\nc) Remove the shared privileged key from the app. Authenticate users through an appropriate identity flow and use short-lived scoped tokens with server-side authorization. Test by inspecting the APK for secrets and invoking crafted external links in an authorized test environment to confirm unauthorized transfers are rejected."
      }
    ]
  },
  {
    "course": "INFO5995",
    "week": 9,
    "paperNumber": 13,
    "title": "Exam Paper — Practice 10",
    "topics": "Predicted, original practice questions based on Weeks 10–12 — consensus, program analysis, organisational aspects and future cybersecurity. Covers course lecture concepts and the supplied Weeks 1–8 revision-bank question style. Reworked into a full 50-mark exam: 10 MCQs followed by four written scenario problems.",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "sourceFiles": [
      "Week 10/lecture/Week10_Consensus, blockchain, decentralised finance.pdf",
      "Week 11/lecture/Week11_Program Analysis, Human, Organisational & Regulatory Aspects.pdf",
      "Week 12/lecture/INFO5995_Week12_Future_of_Cybersecurity_Revised.pdf",
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf",
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
      },
      {
        "type": "mcq",
        "prompt": "A team wants to test a suspected exploit affecting customer data. Best initial environment?",
        "options": [
          "Production with real accounts",
          "Staging with synthetic data and authorized scope",
          "A third-party live service",
          "An employee’s personal device"
        ],
        "correctIndex": 1,
        "modelAnswer": "Staging limits harm and supports repeatable testing."
      },
      {
        "type": "mcq",
        "prompt": "Which control most directly reduces risk from a vulnerable software dependency?",
        "options": [
          "Inventory, update and verify dependencies through a controlled process",
          "Hide the package name",
          "Disable logging",
          "Use only minified code"
        ],
        "correctIndex": 0,
        "modelAnswer": "Dependency inventory, review and timely patching reduce known-vulnerability exposure."
      },
      {
        "type": "mcq",
        "prompt": "An intrusion-detection alert may be a false positive. The analyst should:",
        "options": [
          "Disable all alerts",
          "Correlate the alert with evidence and context before classifying",
          "Assume an incident is confirmed",
          "Delete the event"
        ],
        "correctIndex": 1,
        "modelAnswer": "Validation and context reduce both missed incidents and unsupported conclusions."
      },
      {
        "type": "mcq",
        "prompt": "A digital signature can support which claim?",
        "options": [
          "The software is free of vulnerabilities",
          "A holder of the corresponding private key signed these bytes and they were not altered",
          "The software is confidential",
          "The signer is legally authorized in every context"
        ],
        "correctIndex": 1,
        "modelAnswer": "A verified signature supports integrity and key-based origin, not correctness or safety."
      },
      {
        "type": "mcq",
        "prompt": "A useful incident response first action after confirmed account compromise is to:",
        "options": [
          "Contain the compromised access while preserving relevant evidence",
          "Erase logs",
          "Wait for a public report",
          "Email the password to the team"
        ],
        "correctIndex": 0,
        "modelAnswer": "Containment limits impact; evidence preservation supports investigation."
      },
      {
        "type": "scenario",
        "prompt": "Consensus, program analysis and future risk (10 marks)\nA fintech proposes a blockchain ledger for audit records and an AI code scanner for smart contracts. The team assumes that consensus makes all recorded data true and that a clean static-analysis report proves the contract is safe.\n\n(a) Explain what consensus can establish and what it cannot establish about submitted data. (3 marks)\n(b) Explain one limitation of static program analysis. (3 marks)\n(c) Recommend two governance/assurance steps before handling real funds. (4 marks)",
        "modelAnswer": "Consensus helps distributed participants agree on an ordered ledger state under the protocol’s assumptions; it does not prove that an input was truthful, lawful or correct. Static analysis reasons about code without executing it, but may produce false positives/negatives and cannot prove all runtime/environmental properties in general. Independently review the threat model and oracle/input trust, combine static and dynamic testing with expert review, test recovery/upgrade controls, and use staged limits with an accountable release decision."
      },
      {
        "type": "scenario",
        "prompt": "Cryptographic goals and replay\nA payroll service encrypts salary instructions before sending them to a partner. It does not authenticate messages, reuses a nonce with its encryption mode, and accepts a previously captured instruction if it is sent again.\n\na) Explain what encryption provides and what is missing from this design. [3 marks]\n\nb) Explain the risk of nonce reuse and recommend a safer message-protection approach. [3 marks]\n\nc) Identify the replay weakness and give a freshness control. [4 marks]",
        "modelAnswer": "a) Encryption primarily aims at confidentiality. Without authentication/integrity, an attacker may modify ciphertext or impersonate a sender; encryption alone does not establish message origin or correctness.\n\nb) Nonce reuse can break security guarantees of many modes, potentially exposing relationships or enabling forgery. Use a standard authenticated-encryption scheme with unique nonces per key, correct key management and rejection of invalid tags.\n\nc) A valid old instruction can be resent because the receiver does not check freshness. Include a unique transaction ID, nonce or sequence number, track accepted values at the receiver, enforce an appropriate freshness window and make processing idempotent."
      },
      {
        "type": "scenario",
        "prompt": "Authentication, authorization and cloud access\nA staff member receives repeated unexpected push-based MFA prompts and approves one while distracted. The attacker then accesses cloud files through the account. The account has standing access to every department folder, although the staff member works in finance.\n\na) Distinguish authentication from authorization using this scenario. [3 marks]\n\nb) Explain how least privilege and role-based access should change the account’s file permissions. [3 marks]\n\nc) Recommend incident-response steps and two controls to reduce the likelihood or impact of recurrence. [4 marks]",
        "modelAnswer": "a) Authentication establishes that the account holder is signing in, but the attacker induced an approval and compromised that authentication step. Authorization determines which files/actions the authenticated identity may access; the broad file access is a separate authorization failure.\n\nb) Grant the finance role only the folders and actions needed for finance work. Remove standing access to unrelated departments, use time-limited elevation for exceptional tasks and review access periodically.\n\nc) Revoke sessions and tokens, reset/re-secure authentication, preserve sign-in and file-access logs, determine what was accessed, notify security/privacy responders and follow incident procedures. Use number matching or phishing-resistant MFA, alert on repeated prompts, and apply least privilege/conditional access."
      },
      {
        "type": "scenario",
        "prompt": "Cryptography and software updates\nA supplier distributes software updates publicly. Each update is signed with the supplier’s private key; customer devices have a trusted copy of the public key. A rushed patch is signed and installs correctly, but the patch contains an unsafe configuration that disables audit logging.\n\na) Explain how the device should verify the digital signature and what a valid signature establishes. [4 marks]\n\nb) State two important properties a valid signature does not guarantee about this update. [3 marks]\n\nc) Recommend two release controls that would reduce the risk illustrated. [3 marks]",
        "modelAnswer": "a) The device verifies the signature using the trusted public key and checks that the signature corresponds to the update bytes. A valid signature supports that the update was signed by whoever controls the matching private key and that the signed bytes have not changed since signing.\n\nb) It does not prove the update is free of vulnerabilities, correctly configured, safe for the customer environment or that the signer’s key was uncompromised. It also does not by itself establish that installation is authorized under local policy.\n\nc) Use independent code/configuration review and automated security tests before signing; stage and canary the release with monitoring and rollback; enforce secure configuration baselines so audit logging cannot be disabled silently."
      }
    ]
  }
];
