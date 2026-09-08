import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 6,
  paperNumber: 1,
  title: "Week 6 Tutorial: Harbour University — Authentication to Cloud",
  topics:
    "Week 6 Extra Resources self-check and the in-class 'Tom and Jerry: The Great Cyber Chase' Menti, both built around the Harbour University running case study. Applied scenarios: a correct-but-stolen password proves knowledge of a secret, not presence of the owner; password + PIN are one factor category, not two independent factors; push fatigue (repeated MFA approval prompts) coercing an approval; passkeys answering an origin-bound signed challenge to resist credential stuffing and phishing; account recovery / help-desk reset as an authentication path and often the weakest one; why passwords are hashed (one-way verification) rather than reversibly encrypted, with unique salt + a deliberately costly KDF (Argon2id/scrypt/bcrypt/PBKDF2); credential stuffing vs password spraying; least privilege when defining a role and 'scope should match responsibility, not status'; changing an ID in a URL (GET /marks/1043 as student 1042) is broken object-level authorisation, not failed authentication; separation of duties (lecturer proposes, coordinator approves, system publishes); an availability failure with confidentiality and integrity intact; DoS vs DDoS; encryption at rest not overriding application authorisation for a valid over-permitted session; data in transit vs at rest vs in use; data minimisation and retention; collecting logs vs monitoring them; cloud shared responsibility ('of' the cloud vs 'in' the cloud); why one cloud misconfiguration (public object storage, open DB endpoint, broad IAM) scales; isolated, protected, restoration-tested backups; the Week 6 concept map linking identification -> authentication -> authorisation -> availability -> data security -> cloud",
  sourceFiles: [
    "lecture/INFO5995_Week_6_Extra_Resources_REVISED (1).pdf",
    "lecture/Week 06 - Introducti-s1-low.transcript.md (in-class 'Tom and Jerry: The Great Cyber Chase' Menti)",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "In the Cyber Chase, Jerry steals a staff member's password and logs in successfully. The login is accepted. What has the system actually verified at that moment?",
      options: [
        "That the request came from a device previously registered to the staff member",
        "That the legitimate account owner is physically present and initiated this sign-in",
        "That whoever submitted the request knows a secret associated with the account",
        "That the account's stored password hash has not been tampered with since it was set",
      ],
      correctIndex: 2,
      modelAnswer:
        "A password only demonstrates knowledge of a secret; it does not prove the legitimate owner is present. Passwords are reusable, shareable and phishable, so a correct password can authenticate the wrong human. Establishing that the right person is present needs additional, independent evidence (MFA / passkeys) plus monitoring.",
    },
    {
      type: "mcq",
      prompt:
        "Harbour University asks Alice for her email, then a password, then a separate numeric PIN. A colleague calls this multi-factor authentication. Why is that wrong?",
      options: [
        "It is not MFA because MFA requires at least one biometric ('something you are'); knowledge and possession factors alone can never qualify",
        "It is not MFA because a PIN is inherently weaker than a password, so the two together still count as one strong factor",
        "It is genuine MFA, because entering three separate values in sequence always counts as three factors",
        "It is not MFA because a password and a PIN are both 'something you know' — one factor category verified twice, not two independent factors",
      ],
      correctIndex: 3,
      modelAnswer:
        "Factors count separately only when each is an independently verified, different category: something you know, something you have, something you are. Password + PIN are two steps but one category ('know'). MFA needs categories that fail independently — e.g. password plus a registered device or a passkey. (MFA does not specifically require a biometric; a possession factor is fine.)",
    },
    {
      type: "mcq",
      prompt:
        "At 2:13 a.m. a staff member's phone receives MFA approval prompts again and again until, half asleep, they tap Approve. In the Cyber Chase this is scored as a specific technique. What did Jerry exploit?",
      options: [
        "Password spraying — a few common passwords tried across many accounts to avoid lockout",
        "Credential stuffing — a leaked username/password pair reused against Harbour University",
        "An offline attack on a stolen verifier — guessing the password without contacting the server",
        "Push fatigue — repeated prompts pressure a user into approving an attacker's session",
      ],
      correctIndex: 3,
      modelAnswer:
        "Push fatigue (MFA prompt bombing): the attacker already has the password, triggers repeated push approvals, and relies on the user eventually approving one. MFA reduces risk but does not make phishing or coercion impossible. Number matching and passkeys are the mitigations. Credential stuffing and spraying are password-guessing attacks, not approval coercion.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Because a fingerprint is unique to a person, the Week 6 material treats it as a secret that can safely replace a password.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. 'Your fingerprint is an identifier but not a secret.' A biometric sensor does a probabilistic template match, not an exact string comparison; false accepts/rejects must be tuned per use case, and a biometric is hard to replace once compromised. It needs liveness checks, secure hardware, retry limits and a carefully protected fallback — it is a factor, not a drop-in secret.",
    },
    {
      type: "mcq",
      prompt:
        "How does a passkey change what Harbour University's portal stores, compared with password login?",
      options: [
        "The portal stores nothing at all; the device alone decides whether the login succeeds and simply reports the result",
        "The portal stores a shared secret seed that both the device and server use to generate matching one-time codes every 30 seconds",
        "The portal stores the user's password encrypted with the device's private key instead of hashed, so it can be decrypted only on that device",
        "The portal stores a per-user public key and verifies a signed, origin-bound challenge; the private key never leaves the user's device",
      ],
      correctIndex: 3,
      modelAnswer:
        "With passkeys the server keeps the matching public key — not a reusable password — and the device proves possession of the private key by signing a challenge bound to the site's origin. Because nothing reusable is stored or sent and the signature is origin-bound, passkeys resist credential stuffing and many phishing attacks. The 30-second shared-seed description is TOTP, a different mechanism.",
    },
    {
      type: "mcq",
      prompt:
        "Jerry, logged in as student 1042, changes the URL to request GET /marks/1043 and sees another student's marks. In the Cyber Chase many players answered 'authentication failure'. Why is that wrong, and what actually failed?",
      options: [
        "Availability failed — the marks service was overloaded and a race under load swapped the responses, so 1042's request returned record 1043 by accident",
        "Authentication failed — Jerry forged a session token for account 1043, which is the only reason a different student's record could load for him at all",
        "Authentication succeeded (Jerry is a valid logged-in user); what failed is object-level authorisation — the server did not check that 1042 may view record 1043",
        "Nothing failed — any authenticated student may read any /marks/ record, so returning 1043 to student 1042 is simply the system working as designed",
      ],
      correctIndex: 2,
      modelAnswer:
        "Authentication already answered 'who are you?' correctly. Changing an ID in a URL is broken object-level authorisation: the server must check, per request, whether the authenticated identity is permitted to act on that specific object. The fix is a server-side permission check on every resource access (deny by default), not stronger login.",
    },
    {
      type: "mcq",
      prompt:
        "Tom is promoted to maintain the cloud platform and, as a side effect, can now read every student's marks. Which principle is most directly violated?",
      options: [
        "Least privilege — a platform-maintenance role does not need to read student marks to do its job",
        "Complete mediation — some requests for marks bypass the access-control check entirely",
        "Defence in depth — there is only a single layer of control protecting the marks",
        "Fail-safe defaults — the system granted access on error rather than denying it",
      ],
      correctIndex: 0,
      modelAnswer:
        "Least privilege: grant the minimum scope, actions and duration required for the task. A higher role means more control, not automatic permission to read every record ('scope should match responsibility, not status'). Separation of duties is also relevant, but the direct violation is a role holding access it has no job need for. Access should have been revised on role change (JOIN/MOVE/REVIEW/LEAVE).",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In the Cyber Chase, a cloud storage bucket is made public while its contents stay encrypted at rest, and internet users can still retrieve the files — so the primary failure is loss of service availability.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. The primary failure is access configuration / misconfiguration — a control change (making object storage public, or an over-broad IAM policy) applied at cloud scale. Availability was never lost; the service kept serving, just to everyone. Encryption at rest protected a data state that was not the one under attack.",
    },
    {
      type: "mcq",
      prompt:
        "The database is encrypted at rest, but Jerry reuses a valid staff session that carries excessive permissions and downloads readable records. Why did encryption at rest not stop this?",
      options: [
        "The records were only encrypted in transit and never at rest, so once Jerry pulled a local copy of the export the protection no longer applied to it at all",
        "The cipher protecting the database was reversible, so Jerry simply took the encrypted export away and decrypted it offline at his leisure afterwards",
        "Encryption at rest protects a specific data state; a valid, authorised session is served plaintext because the application must use the data — it does not override authorisation",
        "The data-at-rest key sat in a config file next to the database, so any authenticated session could read the key and decrypt every record for itself",
      ],
      correctIndex: 2,
      modelAnswer:
        "'Protection at rest worked' — but a valid session with wrong (too broad) permissions reaches too much, and the application returns readable records because legitimate use requires plaintext. Encryption protects data at rest from someone reading the raw store; it cannot substitute for least privilege and per-request authorisation on a live session.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the Week 6 material insist that account recovery (e.g. a help-desk password reset) is itself an authentication path?",
      options: [
        "Because recovery is only ever performed by help-desk administrators, who have themselves already passed strong multi-factor authentication first",
        "Because a recovery reset permanently disables the account afterwards, so even if it is abused once the attacker cannot use that route a second time",
        "Because recovery re-establishes access to an account, so a weak identity check there (name + date of birth) can bypass the strongest primary login",
        "Because the recovery flow always enforces MFA and a registered passkey by design, which makes it the single most trustworthy way to regain access",
      ],
      correctIndex: 2,
      modelAnswer:
        "'The strongest login can be bypassed by recovery.' Recovery grants account access on the strength of whatever it checks; if that is just name and date of birth over the phone, an attacker social-engineers a reset and takes control regardless of passkeys or MFA on the front door. Recovery must be designed and hardened as an authentication path, often the weakest one.",
    },
    {
      type: "short",
      prompt:
        "State the difference between credential stuffing and password spraying, and give the defence that addresses both.",
      modelAnswer:
        "Credential stuffing replays leaked username/password pairs (from a breach elsewhere) against Harbour University accounts, betting on password reuse. Password spraying tries a few likely passwords across many accounts, spread out to stay under lockout thresholds. Stuffing exploits reuse of a specific known password; spraying exploits common weak passwords across a population. Layered defence covers both: unique passwords (password manager), MFA / passkeys so a correct password alone is not enough, rate limiting and lockout, and monitoring for many-account or many-attempt patterns.",
    },
    {
      type: "short",
      prompt:
        "Harbour University holds public course handbooks, internal staff meeting notes, confidential student marks, and restricted payroll and medical records. Explain why the system classifies data before deciding controls, and what classification drives.",
      modelAnswer:
        "Not all data has the same value, sensitivity or impact if exposed, and security is not free (encryption, integrity checks and monitoring cost compute and effort). Classifying first — public / internal / confidential / restricted — lets the university spend protection where impact is highest. Classification drives who may access it, how strongly it is protected in transit / at rest / in use, how it is logged and monitored, and how long it is retained before deletion. Treating every record identically either over-spends on trivia or under-protects payroll and medical data.",
    },
    {
      type: "mcq",
      prompt:
        "A ransomware incident encrypts Harbour University's production files. The team restores from backup but is still 'in panic'. What does the Week 6 material say a usable backup strategy requires beyond simply having a copy?",
      options: [
        "Storing the backup on a second physical disk inside the same server so it can be restored quickly over the local bus with no network transfer delay",
        "Taking a single full backup at go-live and relying on it indefinitely, on the basis that the production configuration rarely changes much afterwards",
        "Keeping the backup isolated (different network, versioned/immutable), and restoring into a safe environment then verifying integrity and dependencies before resuming",
        "Encrypting the backup with a key so strong that ransomware cannot read or re-encrypt it, which on its own is enough to guarantee a clean recovery",
      ],
      correctIndex: 2,
      modelAnswer:
        "Backups support availability and recovery only when they are isolated and protected (a copy on the same server or network is lost with it), versioned/immutable against tampering, and — critically — restoration-tested: restore to a safe environment, verify integrity and that dependencies work, and confirm the vulnerability that let the attack in has been fixed, or the restored system is compromised again. Backups do not by themselves provide confidentiality.",
    },
    {
      type: "mcq",
      prompt:
        "Under the cloud shared responsibility model as presented for Harbour University, which pairing is correct?",
      options: [
        "Provider secures student and staff identities and application authorisation; the university secures the hypervisor and core networking",
        "Provider secures everything technical; the university is only responsible for paying the bill and choosing a region",
        "The university secures physical hardware failures; the provider secures customer-controlled IAM policies and object-storage settings",
        "Provider secures physical facilities, hardware and the hypervisor; the university secures its identities, application authorisation, data, configuration, backups and recovery",
      ],
      correctIndex: 3,
      modelAnswer:
        "Security 'of' the cloud (buildings, hardware, core networking, hypervisor, managed service components, physical failures) is the provider's; security 'in' the cloud (identities, authentication/authorisation, applications and data, backups/retention/recovery, and all customer-controlled configuration) is the customer's. The exact line shifts across IaaS/PaaS/SaaS and the contract, so the useful question after a leak is 'which control failed?', not 'provider or customer?'.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: A single cloud misconfiguration can expose an entire dataset precisely because a control change can apply at enormous scale.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. Examples: public object storage, an open database endpoint, an over-broad IAM policy. One setting flip is not a local mistake — it can instantly change exposure for a whole bucket, database or account, which is why configuration review, drift detection and least privilege matter more at cloud scale.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer contrasts a 9:00 a.m. sign-in from a known laptop on the Sydney campus with a 3:14 a.m. sign-in from a new browser in an unusual country. Both present a correct credential. What is the intended lesson?",
      options: [
        "Authentication is absolute: once the credential verifies, context such as time and location is irrelevant",
        "The second sign-in must be blocked outright, and all overseas logins should be permanently denied",
        "The first sign-in is risky because campus networks are shared, and the second is safe because a new browser has no stored cookies",
        "Identity is never absolute — device, location and behaviour change the risk of a login, so adaptive authentication can demand stronger evidence or restrict sensitive actions",
      ],
      correctIndex: 3,
      modelAnswer:
        "'Identity is never absolute' and 'authentication is continuous.' The same correct credential can carry very different risk depending on context. Adaptive (risk-based) authentication responds by stepping up evidence or limiting what the session can do — not by a blunt 'block every overseas login', which annoys legitimate travelling users and still misses local threats.",
    },
    {
      type: "mcq",
      prompt:
        "Monitoring shows: 09:12 login from Australia, 09:14 login from Germany for the same account, 09:15 a 40,000-record download. What is the appropriate detection logic?",
      options: [
        "Ignore it — a VPN can explain the country change, so there is no reliable signal here",
        "Rely on the encryption of the records at rest to make the download harmless",
        "Correlate impossible travel with the bulk-export behaviour and alert/step-up on that same identity",
        "Immediately and permanently block every login originating outside Australia",
      ],
      correctIndex: 2,
      modelAnswer:
        "Two logins 2 minutes apart from different continents is impossible travel; combined with a large export it is a strong compromise signal. The response is to correlate travel + export for that identity and alert / block / step-up on it — not to block 'every overseas login' (the word 'every' is what makes that option wrong: it harms legitimate users and does not address local misuse).",
    },
    {
      type: "short",
      prompt:
        "Give an example, in the Harbour University setting, of a security failure where confidentiality and integrity both hold but security has still failed. Name the property involved.",
      modelAnswer:
        "The portal is knocked offline by a DDoS, or its data is locked by ransomware, so students and staff cannot reach their marks or enrolment functions. The marks are still encrypted (confidentiality holds) and unchanged (integrity holds), but authorised users cannot access the service when needed — availability has failed. Availability failures are not data breaches, but they are still security failures; the CIA triad needs all three.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer distinguishes 'collecting logs' from 'monitoring' them. Why does that distinction matter for detecting a changed mark?",
      options: [
        "There is no meaningful distinction — any system that writes log files is, by the act of writing them, already monitoring itself and will surface a change",
        "Logs (time, actor, action, resource, context) create accountability only if they are protected, actively reviewed and alerted on — otherwise a change leaves evidence no one ever looks at",
        "Monitoring completely replaces the need to keep logs, so a system with good real-time monitoring can safely discard its historical records once they age out",
        "Collecting logs is always the university's own responsibility while monitoring them is always the cloud provider's job under the shared responsibility model",
      ],
      correctIndex: 1,
      modelAnswer:
        "'Collection creates evidence. Monitoring creates detection.' A record that Alice (1042) viewed marks at 09:02 from a Sydney IP only helps if the logs are tamper-protected and someone (or an alerting rule) reviews them — cross-checking independent logs (e.g. app login logs vs database access logs) is how an out-of-hours access is caught. Intelligent attackers try to erase logs on the way out, which is why protection and review are part of the control.",
    },
    {
      type: "scenario",
      prompt:
        "Walk through the identification -> authentication -> authorisation sequence for 'Alice signs in to view her own marks', and show where each of a phished password, push fatigue, and an ID-swap in the URL would strike.",
      modelAnswer:
        "Identification: Alice enters alice@harbour.edu.au — the portal now knows which account is claimed (no trust yet). Authentication: Alice's passkey signs an origin-bound challenge; the portal gains confidence she controls the registered credential. A phished password would strike here — a stolen secret authenticates the wrong human — and push fatigue also strikes here, coercing an approval that stands in for real evidence; passkeys/number matching blunt both. Authorisation: Alice requests GET /marks/1042; policy allows her to view her own record but not /marks/1043. An ID-swap in the URL strikes here — it is broken object-level authorisation, defeated only by a per-request server-side permission check, not by anything done at the login step. Identification makes a claim, authentication verifies evidence, authorisation controls access — three distinct decisions, each with its own failure mode.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Asking an applicant for a passport copy and driver licence 'just in case' is good practice because more identity data always makes verification stronger.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. 'Only collect what you truly need.' Before collecting, ask: is it required for the stated purpose, is there a less sensitive alternative, how long must it be retained, who can access it. Less stored data means less to expose, misuse, retain and delete — extra personal data is a liability, not a safety margin.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement best captures the Week 6 concept map's through-line for Harbour University?",
      options: [
        "Secure systems are built in layers: identity -> permissions -> data protection -> secure cloud operations, and encryption cannot compensate for stolen credentials, excessive permissions or unsafe operations",
        "Authentication is the only layer that ultimately matters, because every later failure in the case study — authorisation, availability, data, cloud — traces back to a bad login",
        "Availability is purely a networking concern handled entirely by the cloud provider, so it sits outside the university's own security model and needs no design attention",
        "Strong encryption applied at every layer is sufficient on its own; identity, permissions and configuration are secondary concerns a good crypto stack makes unnecessary",
      ],
      correctIndex: 0,
      modelAnswer:
        "The one-minute takeaway: authentication builds confidence in identity; authorisation limits actions and resources; availability keeps legitimate access possible; data security protects information across its lifecycle; cloud security adds clear ownership, secure configuration, least privilege, monitoring and tested recovery. Encryption remains essential but does not cover stolen credentials, over-permissioned sessions or misconfiguration.",
    },
    {
      type: "multi",
      prompt:
        "Select every option that is a 'something you know' authentication factor — the category the Cyber Chase says is verified twice when Harbour University asks for a password and then a separate PIN.",
      options: [
        "The account password",
        "A numeric PIN",
        "The answer to a 'first school' security question",
        "A code from an authenticator app on a registered phone",
        "A fingerprint read by the laptop's sensor",
        "A passkey private key held in the phone's secure hardware",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Password, PIN and a security-question answer are all knowledge — 'something you know'. Stacking them is extra steps in one category, not extra factors. An authenticator-app code and a passkey are 'something you have' (a registered device / a private key that never leaves it); a fingerprint is 'something you are'. MFA needs categories that fail independently.",
    },
    {
      type: "multi",
      prompt:
        "In the Cyber Chase, Jerry (logged in as student 1042) edits the URL to GET /marks/1043 and sees another student's marks. Select every statement that correctly describes this round.",
      options: [
        "Authentication succeeded — Jerry is a genuine logged-in user",
        "What failed is object-level authorisation: the server never checked that 1042 may read record 1043",
        "The correct fix is a server-side permission check on every resource access, denying by default",
        "The session token must have been forged, since a different student's record loaded",
        "Enforcing a stronger password policy or mandatory MFA would prevent this",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Authentication already answered 'who are you?' correctly, so the login step is not where this breaks — many players wrongly answered 'authentication failure'. Changing an ID in a URL is broken object-level authorisation: the server must verify, per request, that the authenticated identity may act on that specific object, and default to deny. No token was forged, and stronger login does nothing here because Jerry logs in as himself.",
    },
    {
      type: "multi",
      prompt:
        "Tom is promoted to maintain the cloud platform and, as a side effect, can now read every student's mark. Select every statement the lecturer endorsed about this round.",
      options: [
        "Least privilege is violated — a platform-maintenance role has no job need to read student marks",
        "It also touches separation of duties, and the lecturer said he would accept both principles",
        "The access-lifecycle step for a role change (revise permissions, don't add on top) was not applied",
        "This is an authentication failure, because Tom's new identity was not re-verified",
        "Encryption at rest failed, since Tom can read the marks in plaintext",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "'High privilege means more control, not more data.' The direct violation is least privilege; the lecturer noted separation of duties is also defensible and he would take both. On a role change you replace permissions rather than accumulate them (JOIN/MOVE/REVIEW/LEAVE), so the MOVE/review step was skipped. Authentication is not involved (Tom is a valid user) and encryption at rest is irrelevant — a legitimately over-permitted session is served plaintext.",
    },
    {
      type: "multi",
      prompt:
        "The self-check contrasts a stolen-password login with MFA prompt-bombing. Select every statement that is true of MFA push fatigue as scored in the Cyber Chase.",
      options: [
        "The attacker already knows the password and just needs one approval tap",
        "Repeated prompts, often out of hours, wear the user down until they approve",
        "Number matching and phishing-resistant passkeys are the intended mitigations",
        "It is a form of password spraying, since many attempts are made",
        "MFA being enabled means this attack cannot succeed",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Push fatigue (prompt bombing) assumes the password is already compromised; the attacker triggers approval prompts repeatedly and relies on the user eventually tapping Approve — the lecturer's '2 a.m., half asleep' example. Number matching and passkeys blunt it. It is not password spraying (a guessing attack across many accounts), and MFA reduces but does not eliminate the risk.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 6,
  paperNumber: 2,
  title: "Week 6 Lecture: Authentication, Data Security & Cloud Security",
  topics:
    "Week 6 lecture (deck labelled 'Applied Cryptography and Secure Communications' but delivered as system-level authentication, authorisation, availability, data security and cloud security around the Harbour University case study). From crypto authentication (authenticate the message/peer: MAC/HMAC, signatures, certificates/TLS) to system authentication (authenticate the user/session). Password vs MFA categories (know/have/are); MFA push fatigue; biometrics as probabilistic identifiers not secrets, liveness and fallback; passkeys and origin-bound signed challenges; adaptive/continuous authentication and context; recovery as the weakest authentication path; the five principles of strong authentication (identity is never absolute, passwords alone are not enough, independent factors are stronger, authentication is continuous, recovery must be secure). Password storage: unique salt stored openly, a deliberately costly password-hashing function (Argon2id, scrypt, bcrypt, PBKDF2), stored verifier + parameters, server derives a candidate verifier at login; hash not encrypt because passwords are authentication secrets not data to be recovered, and hashing raises guessing cost rather than making weak passwords strong; stolen verifiers / credential stuffing / password spraying / phishing. Authorisation: authentication asks 'who are you?', authorisation asks 'what may you do?'; five roles with scope matching responsibility not status; RBAC assigns permissions to roles; least privilege limits blast radius; separation of duties (propose/approve/publish); broken object-level authorisation (ID in URL); the JOIN/MOVE/REVIEW/LEAVE access lifecycle. Availability as the third CIA pillar; what breaks it (DoS/DDoS, ransomware, resource exhaustion, failure, human error, dependency outage); DoS vs DDoS; resilience (redundancy, load balancing, rate limiting, monitoring) and ransomware response (isolated backup, restore + verify, continue). Data security lifecycle: classification (public/internal/confidential/restricted), data in transit (TLS/HTTPS) vs at rest (disk/database/object encryption) vs in use (permissions, isolation, minimisation, monitoring); encryption not overriding authorisation; minimisation and retention; audit logs for integrity and accountability; the five principles of data security. Cloud security: why the cloud (remote access, elastic resources, resilience, faster deployment) and new risks (internet exposure, shared responsibility, misconfiguration, identity attacks); IaaS/PaaS/SaaS and who controls what; identity as the primary control plane (location alone is no longer sufficient trust); one misconfiguration at scale; least privilege at cloud scale; encrypt every managed copy including backups; monitoring cloud logs (impossible travel + bulk export); recovery (production/backup/restore/test/recover); the five principles of cloud security (identity first, secure configuration, least privilege, continuous monitoring, recovery and resilience).",
  sourceFiles: [
    "lecture/INFO5995-Week 6_ Applied Cryptography and Secure Communications.pdf",
    "lecture/Week 06 - Introducti-s1-low.transcript.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "The lecture frames Week 6 as 'same idea, new layer' relative to Weeks 4–5. What is the shift?",
      options: [
        "From integrity checks back to confidentiality, because Week 6 drops hashing and MACs entirely and re-encrypts every portal request instead",
        "From symmetric encryption to asymmetric encryption for all traffic exchanged between the users and the Harbour University portal from now on",
        "From authenticating the message or peer (MAC/HMAC, digital signatures, certificates/TLS) to authenticating the user or session logging into a system",
        "From application-layer software security up to the physical security of the campus data centre where the portal's servers are actually racked",
      ],
      correctIndex: 2,
      modelAnswer:
        "Weeks 4–5 authenticated a message or peer with cryptography (MAC/HMAC, signatures, certificates/TLS). Week 6 keeps the idea but moves up a layer: system-level authentication of the human/session — 'encryption can protect the channel; it cannot prove the right human is using the account.' The Harbour University incident (a login, no broken crypto) motivates it.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture lists three authentication factor categories. Which option lists them correctly with a valid example of each?",
      options: [
        "Something you know (password), something you have (registered phone / security key), something you are (fingerprint)",
        "Something you type (password), something you remember (PIN), something you recognise (security image)",
        "Something local (device PIN), something remote (server token), something physical (ID card) — all three being possession factors",
        "Something public (username), something private (password), something shared (recovery question)",
      ],
      correctIndex: 0,
      modelAnswer:
        "Know / have / are. Alice logging in with password + registered phone + fingerprint uses all three. The point of separate categories is independent failure: a stolen password (know) does not also hand over the phone (have) or the biometric (are). Password + PIN is 'know' twice — two steps, one category.",
    },
    {
      type: "mcq",
      prompt:
        "How should Harbour University store a user password, according to the lecture's 'stored verifier' slide?",
      options: [
        "As the password string reversed and then Base64-encoded, which is adequate because the stored value is no longer directly human-readable in the database",
        "As the output of a deliberately costly password-hashing function (Argon2id / scrypt / bcrypt / PBKDF2) over the password plus a unique per-account salt, stored with the algorithm parameters",
        "Encrypted with a single site-wide key kept in the application config so the server can decrypt each stored value and compare it to the password at login",
        "As a plain SHA-256 hash of the password with no per-account salt, on the grounds that SHA-256 is collision-resistant and therefore safe enough here",
      ],
      correctIndex: 1,
      modelAnswer:
        "Store a derived verifier: unique per-account salt (stored openly) + a KDF configured to be costly (Argon2id, scrypt, bcrypt, PBKDF2) + the parameters. At login the server derives a fresh candidate verifier and compares. No plaintext, and the server never needs to recover the original password. A bare unsalted fast hash is vulnerable to precomputation and fast offline guessing.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Passwords are hashed rather than reversibly encrypted mainly because there is no legitimate need to recover the original password, and one-way verification removes the risk that a stolen key exposes every password at once.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. Passwords are authentication secrets, not application data that must be recovered. Encryption is reversible — steal the key and every stored password is exposed. Password hashing only checks whether a submitted password derives the same verifier; the original is never needed. Hashing does not make weak passwords strong; it raises the cost of guessing them.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture's authentication-methods table compares password, authenticator app (TOTP), push approval and security key / passkey. Which limitation is matched to the right method?",
      options: [
        "Security key / passkey — 'codes can still be phished in real time'",
        "Password — 'requires compatible devices and services'",
        "Push approval — 'vulnerable to push fatigue if users approve unexpected requests'",
        "Authenticator app (TOTP) — 'can be stolen, reused or phished' in the same way as a static password",
      ],
      correctIndex: 2,
      modelAnswer:
        "Push approval's main limitation is push fatigue — enable number matching where available. Password: can be stolen, reused or phished. TOTP: codes can still be phished in real time. Passkey/security key: requires compatible devices and services, but is the preferred phishing-resistant option for high-risk authentication.",
    },
    {
      type: "short",
      prompt:
        "List the five principles of strong authentication from the lecture and give a one-line meaning for each.",
      modelAnswer:
        "1. Identity is never absolute — systems build confidence from evidence, not certainty. 2. Passwords alone are not enough — they can be stolen, shared, reused or phished. 3. Independent factors are stronger — different evidence categories reduce reliance on one failure mode. 4. Authentication is continuous — device, location and behaviour can change risk after login, so keep evaluating. 5. Recovery must be secure — a weak fallback (help-desk reset on name + DOB) bypasses the strongest primary method. Overall: authentication is about building confidence that the right person is accessing the right system at the right time.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture states 'scope should match responsibility, not status' and shows five roles (student, tutor, lecturer, unit coordinator, administrator). A student guesses the administrator should see the most data. Why is that the wrong instinct?",
      options: [
        "A higher-privilege role means more control over the platform, not automatic permission to read every record — e.g. a platform admin has no job need to read student marks",
        "Data visibility in the model is assigned at random per role to reduce correlation attacks, so no role is ever meant to see systematically more data than another",
        "The administrator role sits entirely outside the RBAC model in the lecture, so the question of how much data it should see simply does not apply to that role",
        "The unit coordinator is defined to hold strictly more permissions than the administrator at every level, so it is the administrator that ends up seeing the least",
      ],
      correctIndex: 0,
      modelAnswer:
        "Higher roles do not automatically inherit permission to read every record. An administrator maintains platform services (more control / responsibility); reading marks is not needed for that job, so under least privilege it should be hidden. A unit coordinator legitimately sees marks for their cohort; a student sees only their own. Control scope and data scope are different axes.",
    },
    {
      type: "mcq",
      prompt:
        "In the lecture's terms, what does Role-Based Access Control (RBAC) actually do?",
      options: [
        "It assigns permissions to roles; users inherit permissions through role membership, which makes common permission sets manageable and adds isolation",
        "It encrypts each individual record with a key derived from the record owner's role, so that only holders of that same role are able to decrypt it",
        "It replaces the authentication step entirely by deciding, from the submitted username alone, exactly what actions that request is then allowed to perform",
        "It assigns permissions to each individual user one account at a time, which is precisely why the approach does not scale to a university of a million users",
      ],
      correctIndex: 0,
      modelAnswer:
        "RBAC attaches permissions to roles (student -> view own result; tutor -> enter marks for assigned tutorial; coordinator -> approve final marks; administrator -> maintain service) and users get them by being in the role. Benefits: manageability at scale (change the role, not a million users) and a degree of isolation between roles.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: 'Least privilege limits the blast radius' means that if a tutor account with only its assigned-class permissions is compromised, the attacker reaches fewer records and actions than if the tutor role could view all students and export all marks.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. Grant the minimum scope, actions and duration required for the task. A tutor needs to view and mark their assigned class — not bulk export, change enrolments or manage users. If that tighter account is phished, the damage is contained; an over-broad tutor role turns one compromised account into a whole-cohort exposure.",
    },
    {
      type: "mcq",
      prompt:
        "The mark-publishing workflow is: lecturer proposes marks, coordinator reviews and approves, the system workflow publishes. Which principle does this implement, and what does it buy?",
      options: [
        "Defence in depth — three independent encryption layers protect the proposed marks in sequence as they pass from lecturer to coordinator to publication",
        "Complete mediation — every single access to the marks is re-checked against the access policy on every request, with no cached authorisation decisions",
        "Least privilege — each of the three roles is handed only the smallest set of permissions it needs to carry out its own part of the process",
        "Separation of duties — no single person controls the whole critical process, which reduces fraud, mistakes and unilateral misuse",
      ],
      correctIndex: 3,
      modelAnswer:
        "Separation of duties: splitting a critical action across roles so someone always reviews someone else. It reduces fraud, error and unilateral abuse. Note it is separation of role/responsibility, not separation of data — the coordinator still sees the cohort's data that the lecturer proposed.",
    },
    {
      type: "mcq",
      prompt:
        "Access must change as people change roles. The lecture's lifecycle is JOIN -> MOVE -> REVIEW -> LEAVE. What is the specific risk the MOVE step addresses?",
      options: [
        "That a brand-new joiner is granted their permissions before their identity has actually been verified through the onboarding checks",
        "That the scheduled periodic access reviews get quietly skipped because no single team clearly owns running that process end to end",
        "That a departing user's account is deleted outright before their files and mailbox have been archived for the record",
        "That someone changing roles accumulates permissions — keeping the old role's access on top of the new one instead of having it replaced",
      ],
      correctIndex: 3,
      modelAnswer:
        "On MOVE you remove old permissions and grant only the new role's access — you do not build on top of what they already had. The lecturer's own example: moving up can mean losing access (e.g. losing the student system) as well as gaining it. REVIEW then periodically re-checks that current permissions still match responsibilities; LEAVE disables the account, revokes sessions and removes access.",
    },
    {
      type: "short",
      prompt:
        "The lecture says availability is often misunderstood. Explain the misconception and give two ways availability can be attacked without any service going fully offline.",
      modelAnswer:
        "The misconception is that attacking availability means fully disrupting a service. It does not have to. (1) Degradation: flood a server so it becomes slow, or make it crash-and-restart every few minutes — technically still 'up' but not usable. (2) Ransomware / lockout: the data or system is locked so authorised users cannot access it, even though the servers run. Resource exhaustion (CPU, memory, storage, APIs), dependency outages and deadlocks are other routes. Availability = authorised users can access what they need, when they need it.",
    },
    {
      type: "mcq",
      prompt:
        "DoS vs DDoS, per the lecture: same goal (make the service unavailable), different scale. Which is the key operational difference the lecturer stresses?",
      options: [
        "A DoS attack is aimed at availability, whereas a DDoS is really aimed at confidentiality — it quietly exfiltrates stored data under the cover of all the flood traffic it generates",
        "A DoS reads or modifies the data on its way through the server, whereas a DDoS only ever consumes bandwidth and open connections and never touches any of the stored data",
        "A DoS attack always originates from a single host inside the target organisation's own network, whereas a DDoS always originates from many external hosts out on the public internet",
        "A DoS comes from one attacker/source and is comparatively easy to block; a DDoS uses many distributed devices (botnets), so identifying and blocking the malicious sources without cutting off genuine users is much harder",
      ],
      correctIndex: 3,
      modelAnswer:
        "Both aim to deny service; neither needs to read or change data. One source is relatively easy to identify and block; a distributed flood from many devices makes it expensive and slow to work out which nodes to block without harming legitimate traffic. Sometimes innocent machines are conscripted into the attack.",
    },
    {
      type: "mcq",
      prompt:
        "Which set of measures does the lecture group under 'protecting availability means building resilience'?",
      options: [
        "TLS on every connection, certificate pinning in the clients, HSTS response headers, and keeping encrypted off-site copies of all the backups",
        "Data classification into four tiers, data minimisation at collection, fixed retention schedules, and detailed audit logging of every access",
        "Redundancy (no single point of failure), load balancing, rate limiting abusive requests, and monitoring to detect problems early",
        "Stronger password-hashing parameters, mandatory MFA for all staff, passkey enrolment, and a hardened account-recovery process",
      ],
      correctIndex: 2,
      modelAnswer:
        "Resilience for availability: redundancy so nothing is a single point of failure, load balancing to spread demand (and shift load off an overwhelmed node), rate limiting to slow abusive senders, and monitoring to catch trouble early. For ransomware specifically: isolated backup -> restore + verify integrity -> resume. The other lists belong to authentication, data security and transport security respectively.",
    },
    {
      type: "mcq",
      prompt:
        "The data-security slide separates data in transit, at rest and in use. Which mapping of state to control is correct?",
      options: [
        "In transit -> disk, database and object-storage encryption; at rest -> TLS and authenticated channels; in use -> certificate pinning and client-side VPN tunnelling",
        "All three states are adequately covered by one full-disk-encryption control, so drawing a distinction between transit, rest and use is only an academic exercise",
        "In transit -> TLS / authenticated channels / VPN where appropriate; at rest -> database, disk and object-storage encryption; in use -> application permissions, isolation, minimisation and monitoring",
        "In transit -> application permissions and isolation; at rest -> a VPN back to the campus network; in use -> disk and database encryption of the working copy",
      ],
      correctIndex: 2,
      modelAnswer:
        "In transit: TLS/HTTPS, authenticated channels, VPN where appropriate. At rest: disk/database/object encryption. In use: the data is decrypted for the application to work with it, so the controls are permissions, isolation, data minimisation and monitoring. 'Encryption controls must match the data state and threat model' — there is no one control for all three.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: If a mark is changed from 78 to 98 by someone who got in through a stolen login, integrity is unaffected because the hashing and signature mechanisms from Week 5 are still in place.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. The data is no longer accurate, so integrity has failed — regardless of which weakness let the change happen. Hashes, checksums, digital signatures / MACs and protected audit logs are the controls that detect or attribute such a change; if none flags it, integrity protection was insufficient in practice. Integrity is a property of the data's correctness, not just of having the mechanisms installed.",
    },
    {
      type: "mcq",
      prompt:
        "'Every important action should leave evidence.' The lecture shows a log row: time, actor, action, resource, context (09:02:14 | Alice (1042) | Viewed marks | Student 1042 | Sydney, 203.x.x.x). What makes such logging actually useful?",
      options: [
        "Protecting the logs from tampering, monitoring/reviewing them, and cross-checking independent logs against each other — since attackers try to erase traces on the way out",
        "Writing as many separate log files as possible, on the basis that a larger volume of stored log data is itself a signal of how secure the system must be",
        "Encrypting the log files so strongly that not even a system administrator can read them, including during a later incident investigation into a changed mark",
        "Keeping all the logs only on the same host as the application itself, so that they are always perfectly in sync with the events they describe",
      ],
      correctIndex: 0,
      modelAnswer:
        "Logs create accountability only when protected, monitored and reviewed. Cross-checking independent logs is powerful: if the system login log says nobody was on at 01:00 but the database log shows a query at 01:00, that inconsistency points to an intrusion (or an unexpected automated job). Intelligent attackers delete or edit logs to hide, so tamper protection and off-host copies matter.",
    },
    {
      type: "short",
      prompt:
        "State the five principles of data security from the lecture, in order.",
      modelAnswer:
        "1. Know what data you have — inventory owners, systems and copies. 2. Classify it — match sensitivity and impact (public / internal / confidential / restricted). 3. Protect it — access control, encryption, integrity and resilience appropriate to the class. 4. Monitor access — detect misuse and create accountability. 5. Retain and delete — keep data only as long as justified, then dispose of it. Together they protect information across its whole lifecycle.",
    },
    {
      type: "mcq",
      prompt:
        "Why does the lecture say a confidential file needs more protection in the cloud than on a local machine?",
      options: [
        "The attack surface is larger — the resource is more reachable/visible over the internet — and cloud tenancy adds shared infrastructure and lateral-movement risk between tenants",
        "Cloud providers routinely read through their customers' stored files for operational reasons, so anything placed in the cloud is effectively public information",
        "A local machine genuinely cannot be reached or attacked over any network at all, so a confidential file sitting on its disk needs no real protection",
        "Cloud storage is always left completely unencrypted by default, whereas a local machine's disk is always encrypted, so the cloud copy starts out exposed",
      ],
      correctIndex: 0,
      modelAnswer:
        "Putting a resource in the cloud increases the attack surface / attack vector: it is more reachable and, once live, draws probing and attacks. Cloud services also run on shared, virtualised infrastructure, so there is lateral-movement risk from other tenants. It is a trade-off — you gain elasticity, resilience and reduced operational burden, but you must secure identity, configuration and data deliberately.",
    },
    {
      type: "mcq",
      prompt:
        "IaaS, PaaS and SaaS differ in who manages what. Which description is correct?",
      options: [
        "SaaS gives the customer the most control and the largest share of operational responsibility of the three, while IaaS is the most managed option where the provider does almost everything for you",
        "IaaS, PaaS and SaaS are identical in how responsibility is split between provider and customer; the three names only reflect different pricing and billing tiers for the same underlying service",
        "IaaS: the provider runs the finished application and the customer only configures it. PaaS: the customer racks and manages the physical hardware. SaaS: the customer installs and patches the operating system on the provider's metal",
        "IaaS: provider gives infrastructure, customer installs and manages the OS and everything above. PaaS: provider manages the platform/OS, customer deploys apps, data and services onto it. SaaS: provider runs the whole application, customer just uses it",
      ],
      correctIndex: 3,
      modelAnswer:
        "IaaS: rent infrastructure, you install/patch the OS and up (e.g. Linux/Windows on their VMs). PaaS: a ready platform is provided; you bring your apps, APIs, databases, web content. SaaS: you just use the service (e.g. an online PDF converter) — least control, least operational responsibility, most on the provider. 'Which is best?' depends on the scenario; there is no universal answer.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In modern cloud thinking, being on the office network or in a trusted location is, by itself, sufficient basis to trust a request.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. Identity becomes the primary control plane: an internet request is authenticated, then authorised with context, before an application action. Identity does not replace network security, but 'location alone is no longer sufficient trust' — a request from the office network still has to prove who it is and be within policy.",
    },
    {
      type: "scenario",
      prompt:
        "Harbour University presents a cloud design with authentication (password + MFA + passkeys), authorisation (roles + least privilege), data security (classification + encryption + retention) and operations (monitoring + backups + logging + recovery) and asks: would you approve it? Give a reasoned verdict in the lecture's spirit.",
      modelAnswer:
        "Verdict: do not approve as complete — it covers the four layers well but has visible gaps. Strengths: it addresses identity (MFA/passkeys), least privilege, data classification and encryption, and it has monitoring, backups and a recovery process. Missing / to confirm: (1) physical and network protection of the servers — someone cutting cables or reaching the hosts is still an availability/security failure; the deck notes firewalls, IDS/IPS and network scanning were not discussed. (2) Recovery must include root-cause fixing, not just restoring the backup, or the same vulnerability is re-exploited. (3) Session freshness / timeouts and privileged-access controls (scoped roles, temporary elevation) at cloud scale. (4) Backups must be isolated and restoration-tested, and every managed copy — including backups — encrypted. (5) Configuration review / drift detection, since one misconfiguration exposes data at scale. So: approve the direction, require the missing operational and network controls before sign-off. Cloud security is continuous, not a one-time configuration.",
    },
    {
      type: "mcq",
      prompt:
        "State the five principles of cloud security from the lecture.",
      options: [
        "Encrypt everything; trust the provider; open by default; annual audit; single administrator",
        "Identity first; secure configuration; least privilege; continuous monitoring; recovery and resilience",
        "Perimeter firewall; static passwords; shared accounts; manual backups; incident email list",
        "Buy more compute; disable logging for performance; broad IAM; skip restore testing; region lock",
      ],
      correctIndex: 1,
      modelAnswer:
        "Identity first (protect human and workload accounts); secure configuration (review settings, detect drift); least privilege (limit permissions and duration); continuous monitoring (detect suspicious activity early — impossible travel, large downloads, repeated failures, privilege changes); recovery and resilience (prepare for hardware failure, ransomware, human error, regional/provider outage; test restores). Cloud security is continuous, not a one-time setup.",
    },
    {
      type: "mcq",
      prompt:
        "'Cloud encryption must cover every managed copy.' What is the specific point about backups?",
      options: [
        "Backups should be encrypted with the exact same single key as the production database so that a restore needs no extra key exchange and finishes faster in an incident",
        "Backups never need their own encryption because they sit offline on separate media and are therefore unreachable by an attacker who only has network access to the live system",
        "Only object-file or full-image backups need to be encrypted; ordinary database dump backups are safe to keep as plain text because they cannot be booted or mounted directly",
        "A recovery copy is another data-at-rest location; if data in transit and primary storage are encrypted but the backup is not, the backup becomes the soft target — so encrypt it too and manage keys, access and restore procedures",
      ],
      correctIndex: 3,
      modelAnswer:
        "Encrypt every copy: in transit (TLS), at rest (disk/database/object), and the backup/recovery copy — plus manage keys, access and restore procedures. An unencrypted backup undoes the rest of the chain. (The lecturer notes encrypting very large object/image backups has a real compute cost, so backup management and placement are part of the design, but the copy still needs protecting.)",
    },
    {
      type: "mcq",
      prompt:
        "The lecture's password-storage slide mentions both a salt and a pepper. What is the difference between them?",
      options: [
        "A salt is a unique random value stored alongside each hash; a pepper is a single secret value kept apart from the password store (e.g. in app config or an HSM) and never written next to the hashes",
        "A salt is applied before hashing and a pepper is applied after hashing, but both are stored in the same user record so the server can recompute the verifier",
        "A salt makes each hash unique while a pepper is a slower hash algorithm chosen to increase the per-guess cost for an attacker",
        "A salt protects passwords at rest and a pepper protects them in transit, so a login form needs the pepper but the database only needs the salt",
      ],
      correctIndex: 0,
      modelAnswer:
        "A per-account salt is random, unique and stored openly with the hash — it defeats precomputation (rainbow tables) and stops identical passwords sharing a hash. A pepper is one additional secret mixed into the hashing, but deliberately kept separate from the database, so a dump of the password table alone is not enough to start cracking. (The lecturer's off-hand 'the second salt is pepper' captures 'add more randomness' but the real distinction is that the pepper is a kept secret, not stored beside the data.) The deliberately costly algorithm — Argon2id/scrypt/bcrypt/PBKDF2 — is a separate control again.",
    },
    {
      type: "multi",
      prompt:
        "The lecture asks why a password is hashed rather than reversibly encrypted. Select every statement that is a true reason.",
      options: [
        "There is no legitimate need to recover the original password — the server only has to check a login attempt",
        "A one-way verifier means stealing one key cannot expose every stored password at once",
        "Hashing verifies by deriving a fresh candidate verifier and comparing it to the stored value",
        "Hashing turns a weak password into a strong one",
        "Hashing makes the password readable to administrators for support purposes",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Passwords are authentication secrets, not application data that must be read back, so a non-reversible verifier is enough. Encryption is reversible — one stolen key exposes the lot — while a hash only lets the server re-derive a candidate and compare. Hashing does NOT strengthen a weak password; it only raises the per-guess cost, and it deliberately makes the value unreadable to everyone, including admins.",
    },
    {
      type: "multi",
      prompt:
        "The lecturer says people misunderstand availability as 'the service is fully down'. Select every situation the lecture counts as an availability compromise.",
      options: [
        "A flood of requests makes the server respond slowly but it stays up",
        "A bug makes the application crash and restart every few minutes",
        "Ransomware encrypts the data so authorised users cannot open it, though the servers run",
        "A dependency the service relies on goes offline and requests hang",
        "An attacker quietly copies the confidential student database and sells it",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Availability is 'authorised users can access what they need, when they need it'. Degradation (slow responses), crash-looping, ransomware lockout and dependency outages / deadlocks all break that even while the service is nominally 'up'. Silently exfiltrating data is a confidentiality breach, not an availability one.",
    },
    {
      type: "multi",
      prompt:
        "Select every measure the lecture groups under 'protecting availability means building resilience'.",
      options: [
        "Redundancy so no component is a single point of failure",
        "Load balancing across distributed servers, shifting load off an overwhelmed node",
        "Rate limiting requests from a source you cannot yet confirm is malicious",
        "Monitoring traffic to spot abuse early",
        "Hashing stored passwords with Argon2id",
        "Classifying data as public / internal / confidential / restricted",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Resilience for availability = redundancy, load balancing, rate limiting abusive senders, and monitoring to detect trouble early (plus isolated, restoration-tested backups for ransomware). Password hashing is an authentication control and data classification is a data-security control — neither is on the availability list.",
    },
    {
      type: "multi",
      prompt:
        "Under the cloud shared responsibility model as taught, select every item that is the university's ('in the cloud') responsibility rather than the provider's.",
      options: [
        "Configuring IAM policies and keeping them least-privilege",
        "Setting object-storage buckets private and reviewing configuration for drift",
        "Encrypting its data and managing the keys, including for backups",
        "Deciding data retention and deletion schedules",
        "Securing the physical data centre and replacing failed disks",
        "Patching the hypervisor that isolates tenants",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Security 'in' the cloud — identities and IAM, application authorisation, data and its encryption/keys, configuration, backups, retention — is the customer's. Security 'of' the cloud — buildings, hardware, physical failures, core networking and the hypervisor — is the provider's. After a leak the useful question is 'which control failed?', not 'provider or customer?'.",
    },
    {
      type: "multi",
      prompt:
        "The data-security slide separates data in transit, at rest and in use. Select every control the lecture assigns to data IN USE.",
      options: [
        "Application-level permissions on who can see which records",
        "Tenant / process isolation so other workloads cannot read it",
        "Data minimisation — only working with the fields actually needed",
        "Monitoring and logging of access to spot misuse",
        "TLS / HTTPS on the connection carrying the data",
        "Disk and database encryption of the stored copy",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Data in use is decrypted so the application can work with it, so the controls are permissions, isolation, minimisation and monitoring. TLS/HTTPS protects data in transit; disk/database/object encryption protects data at rest. 'Encryption controls must match the data state and threat model' — there is no single control for all three states.",
    },
  ],
};

export const WEEK_6_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
