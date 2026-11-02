import type { ExamPaperSeed } from "../types";

export const INFO5995_FINAL_PRACTICE_PAPERS: ExamPaperSeed[] = [
  {
    "course": "INFO5995",
    "week": 8,
    "paperNumber": 4,
    "title": "Final Exam Practice Paper (Weeks 1–8, mixed review)",
    "instructions": "Final examination practice | Total: 50 marks. Answer all questions. Problem 1 contains 10 multiple-choice questions worth 1 mark each (10 marks); select one best answer for each. Problems 2–5 are written scenario questions worth 10 marks each (40 marks); answer every subpart and apply your reasoning to the facts.",
    "topics": "A cumulative mixed-review MCQ paper spanning all eight authored weeks, sourced from the official INFO5995 Exam Revision Question Bank's 'Mixed MCQ Practice - Weeks 1-8' section. Draws on: Week 1 (system/threat models, attack surface, explicit attacker assumptions); Week 2 (AI-assisted vulnerability discovery — hallucinated findings, least-privilege tool access, human-in-the-loop verification); Week 3 (mobile security — exported Android components, embedded secrets, deep links); Week 4 (cryptography basics — confidentiality vs other properties, one-time pads, ECB weaknesses); Week 5 (MACs vs unkeyed hashes, digital signatures, replay attacks, keystream reuse); Week 6 (applied cryptography and authentication — least privilege, MFA fatigue, TLS trust, password storage); Week 7 (network security — DDoS vs CIA, certificate validation, SQL injection); and Week 8 (software and system security — XSS, IDS false positives/negatives, detector tuning trade-offs). Every question and its correct answer is taken directly from the source document's own MCQ Answer Guide; option order has been shuffled from the source to remove positional bias while keeping the correct answer's content unchanged. Reworked to the 50-mark format: 10 single-best-answer MCQs and four written scenario questions.",
    "sourceFiles": [
      "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf (official exam revision pack — 'Mixed MCQ Practice - Weeks 1-8' section, Q1-30, plus its MCQ Answer Guide)",
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
        "prompt": "A service that used to be reachable only from one internal network is changed so it can now be reached from more networks and more kinds of devices. What is the most direct security implication of this change?",
        "options": [
          "Every new connection path automatically acts as an independent security control",
          "Confidentiality automatically improves, because a broader range of people can now reach the service",
          "The attack surface may increase, because more paths into the service are now reachable",
          "Threat modelling is no longer needed once the service has already been deployed"
        ],
        "correctIndex": 2,
        "modelAnswer": "Think of a house that used to have one front door and now has a front door, a side door, a garage door and three windows that all open. Nothing about the furniture inside changed, but there are suddenly a lot more ways in.\n\n• The attack surface is simply the full set of places an attacker could try to get in. Adding networks and device types adds entry points, even if the code itself didn't change.\n\n• Why the others are wrong: more reachability never improves confidentiality on its own, a bigger attack surface makes threat modelling more necessary rather than optional, and a new connection path is just a path — it isn't a control unless something is actively checking it.\n\nSo the answer is: the attack surface may increase, because more paths into the service are now reachable."
      },
      {
        "type": "mcq",
        "prompt": "When you write down a threat model, why is it useful to state your assumptions explicitly — for example, exactly what the attacker can and can't do, and exactly what you're trying to protect?",
        "options": [
          "They prove that every security claim holds true in every possible environment forever",
          "They remove the need for any monitoring once the system has been deployed",
          "They guarantee that vulnerabilities cannot exist anywhere in the system",
          "They make the attacker's capabilities and the system's security goals clear enough to evaluate"
        ],
        "correctIndex": 3,
        "modelAnswer": "Saying \"this lock is secure\" means nothing on its own — secure against a toddler, a burglar with a crowbar, or a government lockpicking expert? The claim only makes sense once you say who you're defending against.\n\n• A security claim is only ever true relative to its stated assumptions: who the attacker is, what they can do, and what you're trying to achieve. Writing those down is what lets someone else actually check your claim.\n\n• Why the others are wrong: no document can guarantee the absence of vulnerabilities or hold for every environment forever, and clear assumptions make monitoring more targeted, not unnecessary.\n\nSo the answer is: explicit assumptions make attacker capabilities and security goals clear enough to evaluate."
      },
      {
        "type": "mcq",
        "prompt": "An AI coding assistant tells you it found a vulnerability, but it can't point to the actual file and line, and it can't show you a request that actually reproduces the problem. What should you do with that report?",
        "options": [
          "Publish it right away as a confirmed critical vulnerability",
          "Accept it as true, because the AI stated it with high confidence",
          "Reject every AI-assisted finding automatically, without even looking into it",
          "Treat it as a hypothesis and verify it against the real code and a controlled test"
        ],
        "correctIndex": 3,
        "modelAnswer": "An AI model's confident tone is like a very persuasive witness who wasn't actually at the scene — sounding sure of yourself isn't the same as being right.\n\n• High confidence from an AI model is just part of the text it generated; it isn't a measurement of whether the claim is actually true, so unverified AI output should be treated as a hypothesis, not a fact.\n\n• The right next step is to trace the claim in the real source code and try to reproduce it in a controlled environment — if it holds up, you now have real evidence instead of a guess.\n\n• Why the others are wrong: blind acceptance and immediate publishing both skip verification entirely, and blanket rejection of all AI findings throws away genuinely useful leads along with the bad ones.\n\nSo the answer is: verify the finding against real code and controlled testing before trusting it."
      },
      {
        "type": "mcq",
        "prompt": "You're deciding how much freedom to give an AI coding agent that has terminal access while it works on a security review. Which single control best limits the damage it could cause?",
        "options": [
          "Giving it administrator access to every system so it never gets blocked",
          "Turning off logging for the commands it generates so review goes faster",
          "Letting it automatically execute every action it suggests without a pause",
          "Least-privilege tool permissions combined with a human review step before risky actions"
        ],
        "correctIndex": 3,
        "modelAnswer": "It's the difference between handing a new intern the master key to the building versus giving them a key to just their own desk, plus asking them to check with you before touching anything unusual.\n\n• Least privilege means the agent can only reach what the task actually needs, and a human review step adds a checkpoint before anything destructive or irreversible actually runs.\n\n• Together, those two limit both how far a mistake or a manipulated instruction (like a hidden prompt injection) can reach, and whether it ever executes at all.\n\n• Why the others are wrong: admin access maximises the blast radius of any mistake, disabled logging removes the evidence needed to catch problems, and auto-executing every suggestion removes the one checkpoint that could have stopped a bad action.\n\nSo the answer is: least-privilege tool permissions with human review before risky actions."
      },
      {
        "type": "mcq",
        "prompt": "A developer marks an Android app component as \"exported\" in the manifest, even though nothing in the app's own interface links to it. Why can this still create a security risk?",
        "options": [
          "Android automatically encrypts every piece of data carried inside an intent",
          "Exported components are physically incapable of receiving any external input",
          "The component becomes completely invisible to the Android operating system",
          "External apps may be able to start that component directly, crossing a trust boundary"
        ],
        "correctIndex": 3,
        "modelAnswer": "Leaving a side door unlocked but not mentioning it in the brochure doesn't make it secure — anyone who already knows side doors exist can just walk up and try the handle.\n\n• \"Exported\" means any other app on the device (or a tester with debugging tools) can launch that component directly with a crafted intent, completely bypassing the app's normal user interface.\n\n• Not linking to it from the UI only hides it from casual users — it's security by obscurity, not an actual access control, and the intent data arriving from outside is fully attacker-controlled.\n\n• Why the others are wrong: exported components absolutely can receive external input (that's the whole risk), Android doesn't auto-encrypt intent contents, and the component is still fully visible and callable by the OS and other apps.\n\nSo the answer is: external applications may be able to invoke it directly, crossing a trust boundary."
      },
      {
        "type": "mcq",
        "prompt": "A mobile team argues it's fine to bake a long-lived backend API key into the app's resource files, since users never see it on screen. Why is this actually unsafe?",
        "options": [
          "Because the app sandbox automatically publishes any secret embedded in the app",
          "Because Android silently converts every embedded secret into a signed certificate",
          "Because the APK can be unpacked and inspected, so the embedded secret may be recovered",
          "Because APK files are technically incapable of making any outbound network connections"
        ],
        "correctIndex": 2,
        "modelAnswer": "Writing your house alarm code on a sticky note and taping it inside a drawer doesn't make it secret just because visitors don't open that drawer — anyone who actually looks will find it.\n\n• An APK is just an archive file distributed to every single user, and tools like decompilers can unpack it and read the resources and code inside, including a key stored in a file.\n\n• \"Not shown on screen\" isn't the same as secret: the device itself is under the attacker's control once installed, so anything shipped inside the app has to be treated as effectively public.\n\n• Why the others are wrong: nothing about an APK blocks network access, Android has no feature that turns embedded secrets into certificates, and the app sandbox protects the app's private runtime data — it does nothing to protect strings baked into the installed package itself.\n\nSo the answer is: the APK can be unpacked and inspected, so the embedded secret may be recovered."
      },
      {
        "type": "mcq",
        "prompt": "Out of the core security properties a system can offer, which one does encryption most directly and primarily provide?",
        "options": [
          "Patch management, so known software flaws get fixed on a schedule",
          "Confidentiality, so only someone holding the correct key can read the data",
          "Non-repudiation, so a sender can never later deny having sent a message",
          "Availability, keeping the system reachable whenever a legitimate user needs it"
        ],
        "correctIndex": 1,
        "modelAnswer": "Putting a letter inside a sealed envelope stops a stranger from reading it as it travels — it doesn't make the postal service faster, and it doesn't stop the sender from later denying they wrote it.\n\n• Encryption turns readable data into ciphertext that only someone with the correct key can turn back into plaintext, which is exactly the definition of confidentiality.\n\n• Why the others are wrong: encryption says nothing about whether the service stays online (availability), it doesn't by itself stop a sender denying authorship (non-repudiation needs signatures), and it has nothing to do with scheduling software fixes.\n\nSo the answer is: encryption primarily provides confidentiality."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to use a one-time pad to encrypt data because, done correctly, it offers perfect secrecy. Why is a one-time pad usually impractical to actually use in real systems?",
        "options": [
          "Because a one-time pad is mathematically incapable of ever decrypting correctly",
          "Because every single bit of a one-time pad message needs its own public-key signature",
          "Because it needs a truly random key as long as the message, shared securely in advance, and used only once",
          "Because a one-time pad provides no confidentiality at all once it's correctly applied"
        ],
        "correctIndex": 2,
        "modelAnswer": "It's like promising perfect secrecy for a letter, but only if you first securely hand-deliver a second letter just as long as the first, in person, every single time — the \"secure delivery\" problem never actually goes away.\n\n• A one-time pad only gives its famous perfect-secrecy guarantee if the key is truly random, at least as long as the message, shared securely before use, and never reused for anything else.\n\n• That key-generation-and-distribution problem is exactly as hard as securely sending the original message, so for anything beyond tiny, rare messages it becomes operationally unworkable.\n\n• Why the others are wrong: a correctly used one-time pad decrypts perfectly and does provide confidentiality, and it uses a shared secret key, not public-key signatures per bit.\n\nSo the answer is: it requires a random, message-length key that's securely shared in advance and used only once."
      },
      {
        "type": "mcq",
        "prompt": "What is the key difference between a MAC (Message Authentication Code, such as HMAC) and an unkeyed hash function like plain SHA-256?",
        "options": [
          "A MAC is computed using secret key material, which is what gives it authentication and integrity",
          "A MAC is guaranteed to always provide confidentiality for the message it protects",
          "A MAC is computed using no secret information at all, exactly like an unkeyed hash",
          "A MAC is always built using public-key digital signatures rather than a shared key"
        ],
        "correctIndex": 0,
        "modelAnswer": "Anyone can press a stamp into wax — but only someone holding your actual signet ring can press your personal seal. A plain hash is a generic stamp; a MAC is the personalised seal that needs the secret ring.\n\n• A MAC is computed with a secret key, so only someone who holds that key can produce a valid tag for a given message — that's exactly what gives it authentication (proof of who made it) and integrity (proof it wasn't changed).\n\n• An unkeyed hash uses no secret at all, so anyone, including an attacker, can recompute it for any data they want — it can only show the data is self-consistent, not where it came from.\n\n• Why the others are wrong: a MAC doesn't hide the message's content (that's encryption's job, not a MAC's), and a MAC uses a shared secret key, not a public/private signature pair.\n\nSo the answer is: a MAC uses secret key material, which is what gives it authentication and integrity."
      },
      {
        "type": "mcq",
        "prompt": "A client downloads a software update, checks its digital signature, and the signature verifies correctly. What does that successful check most directly support?",
        "options": [
          "That the software is guaranteed to contain no bugs or flaws",
          "That the server hosting the download will always stay available",
          "That the update's contents are kept confidential from every user",
          "That the update came from the expected signer and wasn't modified after signing"
        ],
        "correctIndex": 3,
        "modelAnswer": "A wax seal on an old letter doesn't prove the letter's contents are wise or correct — it proves the right person sealed it, and that nobody has broken the seal and swapped the pages since.\n\n• A valid signature confirms two specific things: the update was signed using the expected signer's private key (authenticity), and nothing has changed in it since that signing happened (integrity).\n\n• Why the others are wrong: a signature says nothing about code quality or the absence of bugs, nothing about whether the hosting server stays online, and signing doesn't hide the update's contents from anyone who downloads it.\n\nSo the answer is: the update came from the expected signer and was not modified after signing."
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
      }
    ]
  }
];
