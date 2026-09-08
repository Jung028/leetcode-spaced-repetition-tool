# INFO5995 Week 6 — Study Notes

**Lecture deck title on file:** *"Applied Cryptography and Secure Communications"* —
but the session was actually delivered as **system-level security around a running
case study, "Harbour University"** (50,000 students + staff, one single sign-on):
identification → authentication → authorisation → availability → data security →
cloud security. The lecturer framed it as *"same idea as Weeks 4–5, new layer"*:
Weeks 4–5 authenticated a *message or peer* with cryptography (encryption, then
hash / HMAC / digital signatures for integrity); Week 6 authenticates the *user
or session* logging into a system. Encryption can protect the channel; it cannot
prove the right human is using the account.

> **Note on scope vs. your pasted notes.** Your own notes for this week
> (continuous authentication, salting/peppering, hashing vs. encryption,
> credential stuffing / password spraying / phishing, least privilege, blast
> radius, access reviews, RBAC, BOLA, least privilege vs. data minimisation vs.
> separation of duties, DoS vs. DDoS, load balancing) line up almost exactly with
> what the lecture covered — they are folded into the questions in `week-6.ts`.

---

## 1. Important points

### 1a. From the slides / core lecture content

**Authentication (system level)**
- Identification = *claiming* an identity; authentication = *providing evidence*
  for it; authorisation = deciding *what that identity may do*. Three separate
  decisions, each with its own failure mode.
- Three factor **categories**: something you **know** (password, PIN, security
  question), something you **have** (registered phone, authenticator app, security
  key / passkey), something you **are** (biometric). Factors only count separately
  when they are *different categories that fail independently*. Password + PIN =
  "know" twice = **not** MFA.
- **Push fatigue / prompt bombing**: attacker already has the password, fires
  repeated MFA approval prompts, relies on the user eventually tapping *Approve*
  (the "2 a.m., half asleep" example, or a child pressing it). Mitigations: number
  matching, phishing-resistant passkeys.
- **Biometrics**: *"your fingerprint is an identifier, but not a secret."*
  Probabilistic template match, not string comparison; tune false accept/reject
  per use case; hard to revoke once copied; needs liveness checks, secure
  hardware, retry limits and a protected fallback.
- **Passkeys**: the portal stores a per-user **public key**; login = the device
  signs an **origin-bound challenge** with the private key, which never leaves the
  device. Nothing reusable is stored or sent → resists credential stuffing and
  most phishing. (30-second shared-seed codes = TOTP, a different mechanism.)
- **Adaptive / continuous authentication**: same correct credential carries
  different risk depending on device, location, time, behaviour (9 a.m. known
  campus laptop vs. 3:14 a.m. new browser, unusual country). *"Identity is never
  absolute"*, *"authentication is continuous"* — the system keeps evaluating after
  login and can step up evidence or log you out.
- **Recovery is an authentication path — often the weakest.** *"The strongest
  login can be bypassed by recovery."* Help-desk reset on name + date of birth =
  social engineering route straight past passkeys/MFA.
- **Five principles of strong authentication**: identity is never absolute;
  passwords alone are not enough; independent factors are stronger; authentication
  is continuous; recovery must be secure.

**Password storage**
- Store a **derived verifier**, not the password: unique per-account **salt**
  (random, stored openly with the hash — defeats rainbow tables, stops identical
  passwords sharing a hash) + a **deliberately costly** password-hashing function
  (**Argon2id / scrypt / bcrypt / PBKDF2**) + the algorithm parameters. At login
  the server derives a fresh candidate verifier and compares.
- **Pepper**: an *additional secret* mixed into the hashing but kept **separate
  from the password store** (app config / HSM). A dump of the password table alone
  is then not enough to start cracking. *(The lecturer's off-hand line "if you add
  salt twice, the second one is pepper" captures "more randomness" but understates
  it — the real point is that the pepper is a **kept secret**, not stored beside
  the data.)*
- **Hash, don't encrypt**, because: (1) there is no legitimate need to recover the
  original password — the server only checks a login attempt; (2) encryption is
  reversible, so one stolen key exposes *every* stored password at once; a one-way
  verifier does not. Hashing does **not** make a weak password strong — it only
  raises the per-guess cost.
- Password attacks: **credential stuffing** (replay leaked user/pass pairs from a
  breach elsewhere, betting on reuse), **password spraying** (a few common
  passwords across many accounts, spread out to dodge lockout), **phishing**
  (social-engineer the credential directly), plus dictionary / brute-force
  guessing against a stolen verifier.

**Authorisation**
- Authentication asks *"who are you?"*; authorisation asks *"what may you do?"*
- **Least privilege**: minimum scope, actions and duration for the job.
  Test: *"can this person do their job without this access?"* If yes, don't grant
  it. Example: read-only for 12–24 hours that then expires; the WhatsApp
  view-once photo.
- **"Scope should match responsibility, not status."** A higher role means more
  *control*, not automatic permission to read every record — a platform
  administrator has no job need to read student marks.
- **RBAC**: attach permissions to **roles**, users inherit them via role
  membership. Benefits: manageability at scale (change the role, not a million
  users) and isolation between roles.
- **Least privilege limits the blast radius**: a tightly-scoped tutor account, if
  phished, exposes one class; an over-broad tutor role (view all students, export
  all marks, change enrolments, manage users) turns one phished account into a
  whole-cohort breach.
- **Separation of duties**: split a critical action across roles so someone always
  reviews someone else — *lecturer proposes marks → coordinator approves →
  system workflow publishes*. Reduces fraud, error, unilateral misuse. It is
  separation of **role/responsibility**, not of data (the coordinator still sees
  the cohort's data).
- **Broken object-level authorisation (BOLA)**: changing an ID in a URL
  (`GET /marks/1043` while logged in as `1042`) and seeing another record.
  Authentication *succeeded* — the server just failed to check, per request, that
  the identity may act on *that object*. Fix: server-side permission check on
  every resource access, **deny by default**. (In the in-class quiz, 16 players
  wrongly answered "authentication failure".)
- **Access lifecycle — JOIN / MOVE / REVIEW / LEAVE**: on a role change you
  **replace** permissions, you do not stack the new role on top of the old
  (moving up can mean *losing* access too). REVIEW periodically re-checks that
  permissions still match responsibilities; LEAVE disables the account and revokes
  sessions.

**Availability (third CIA pillar)**
- Misconception: "attacking availability = the service goes fully down." It does
  not have to. Also counts: **degradation** (flood → slow), **crash-looping**
  (crash/restart every few minutes — technically "up"), **ransomware lockout**
  (servers run, data unreachable), **resource exhaustion** (CPU/memory/storage/
  API), **dependency outage**, **deadlock**, human error.
  Availability = *authorised users can access what they need, when they need it.*
- **DoS vs. DDoS**: same goal, different scale. One source is comparatively easy
  to identify and block; a **distributed** flood from many devices (botnets — often
  innocent conscripted machines) makes it slow and expensive to work out which
  nodes to block without cutting off genuine users. Neither needs to read or
  change data.
- **Resilience** = redundancy (no single point of failure), **load balancing**
  (geographically distributed servers; shift load off an overwhelmed node — the
  Google example), **rate limiting** a source you cannot yet confirm is malicious,
  and **monitoring** to catch trouble early.
- **Ransomware response**: **isolated** backup (different *network*, not just a
  different disk — same server/network is lost with it), versioned/immutable,
  then **restore into a safe environment and verify integrity + dependencies**,
  *and fix the root-cause vulnerability first* or the restored system is
  re-compromised.

**Data security**
- Not all data is equally valuable, and security is not free (encryption,
  integrity checks, monitoring all cost compute). **Classify first** —
  public / internal / confidential / restricted — then spend protection where
  impact is highest. Classification drives who may access, how strongly it is
  protected, how it is logged, how long it is retained.
  - Public: names, course handbook, unit outline.
  - Internal: staff meeting notes.
  - Confidential: student marks (leak → disputes across the cohort).
  - Restricted: payroll, financial, medical records — no access without approval.
- **Three data states, matched controls**:
  - *In transit* → TLS / HTTPS, authenticated channels, VPN where appropriate.
  - *At rest* → disk / database / object-storage encryption.
  - *In use* → the data is decrypted for the app to work with it, so: application
    permissions, isolation, **data minimisation**, monitoring.
  - *"Encryption controls must match the data state and threat model."* No single
    control covers all three.
- **Encryption does not override authorisation.** A valid session with
  over-broad permissions is served **plaintext** because legitimate use requires
  it — encryption at rest only protects the raw store from someone reading it
  directly.
- **Data minimisation**: *"only collect what you truly need."* Asking an admissions
  applicant for a passport + licence "just in case" is a liability, not a safety
  margin — more to secure, retain and delete.
- **Logs**: *"collection creates evidence; monitoring creates detection."* A log
  row (time, actor, action, resource, context) only helps if the logs are
  tamper-protected, reviewed/alerted on, and **cross-checked** against each other
  — e.g. the system login log says nobody was on at 1 a.m. but the database log
  shows a query at 1 a.m. → inconsistency → likely intrusion. Intelligent
  attackers delete logs on the way out.
- A mark changed from 78 → 98 through a stolen login **is** an integrity failure —
  the data is no longer accurate, regardless of which weakness let the change
  happen. Hashes / checksums / signatures / protected audit logs are what detect
  or attribute it.
- **Five principles of data security**: know what data you have; classify it;
  protect it (appropriate to the class); monitor access; retain and delete.

**Cloud security**
- *Why cloud*: storage you can't practically own, elastic compute (train an ML
  model in hours not weeks), pay-as-you-go, less operational responsibility,
  resilience, faster deployment.
- *New risk*: a confidential file needs **more** protection in the cloud —
  **larger attack surface / attack vector** (more reachable and visible over the
  internet; goes live → gets probed), plus **shared, virtualised infrastructure**
  and **lateral-movement** risk between tenants.
- **IaaS / PaaS / SaaS**: IaaS — provider gives infrastructure, you install and
  manage the OS and up; PaaS — provider manages the platform/OS, you deploy apps,
  APIs, databases, web content; SaaS — provider runs the whole application, you
  just use it (iLovePDF, Adobe online). Less control ↓, less operational
  responsibility ↓, moving IaaS → SaaS. *"Which is best? It depends on the
  scenario."*
- **Shared responsibility** — security **of** the cloud (buildings, hardware,
  physical failures, core networking, hypervisor) is the provider's; security
  **in** the cloud (identities and IAM, application authorisation, data +
  encryption/keys including for backups, configuration, backups, retention) is the
  customer's. The exact line shifts across IaaS/PaaS/SaaS and the contract. After
  a leak, the useful question is *"which control failed?"*, not *"provider or
  customer?"*
- **Identity is the primary control plane** — *"location alone is no longer
  sufficient trust."* Being on the office network does not, by itself, make a
  request trustworthy; it still has to prove who it is and be within policy.
- **One misconfiguration scales**: public object storage, an open database
  endpoint, an over-broad IAM policy — one setting flip changes exposure for a
  whole bucket / database / account. → configuration review, drift detection,
  least privilege matter *more* at cloud scale (a privilege-escalation attack
  reaches far more data).
- **Encrypt every managed copy** — in transit, at rest, **and the backup**; an
  unencrypted backup is the soft target. (Encrypting very large object/image
  backups has a real compute cost, so backup *management and placement* are part
  of the design.)
- **Cloud monitoring**: impossible travel + bulk export → correlate the two on
  the same identity and alert / block / step-up. Do **not** "block every overseas
  login" — the word *every* is what makes that option wrong (harms genuine
  travellers, misses local misuse).
- **Recovery**: production → backup → restore → **test** → recover; fix the
  root cause before restoring.
- **Five principles of cloud security**: identity first; secure configuration;
  least privilege; continuous monitoring; recovery and resilience.
- The concept-map through-line: **identity → permissions → data protection →
  secure cloud operations**, and *encryption cannot compensate for stolen
  credentials, excessive permissions or unsafe operations.*

### 1b. Video-only — asides, in-class questions, emphasis not on a slide

- **Whole lecture is "problem-based learning" around "Harbour University"** — a
  fictional 50,000-user campus with single sign-on. Every concept is introduced
  as *"what could go wrong here?"* rather than as a definition.
- **In-class Menti competition — "Tom and Jerry: The Great Cyber Chase"**
  (~8 questions, live leaderboard; "V room" won with 6,514 points). Each round is
  now a practice question in `week-6.ts` (TUTORIAL paper):
  1. Jerry steals a staff password and logs in → the system only verified
     *knowledge of a secret*. (48 answered correctly.)
  2. Repeated MFA approval prompts until the staff member taps Approve →
     **push fatigue** (some still answered "password spraying" — wrong).
  3. `GET /marks/1043` while logged in as `1042` → **object-level authorisation**
     (16 answered "authentication" — wrong; auth already passed).
  4. Tom promoted to maintain the cloud platform, can now read every mark →
     **least privilege** (18 said separation of duties; lecturer: *"if I had to
     pick, I'd pick both"*).
  5. Encrypted database, but Jerry uses a valid **stolen over-permissioned
     session** and downloads readable records → authorisation / least privilege
     (encryption at rest doesn't help a legitimate session).
  6. Cloud storage bucket made **public**, contents still encrypted at rest,
     internet users retrieve the files → **access configuration /
     misconfiguration** (some said "service availability" — wrong; the service
     never went down).
  7. Same account logs in 09:12 Australia then 09:14 Germany, then a big export →
     **correlate travel + export and act on that identity** — *not* "block every
     overseas login" (the word *every* makes that option wrong).
- **Biometric anecdotes** (why a biometric isn't a drop-in secret): a friend's
  cheap phone unlocked by holding up a *printed photo*; facial recognition can't
  tell identical **twins** apart; fingerprints can be lifted onto a rubber-like
  material (forensics-movie style).
- **Canvas ransomware incident** — used repeatedly as the worked example for
  availability, third-party cloud, and shared responsibility: *"they locked 9,000
  institutes' data"* — that scale is the point.
- **DoS false positive story**: a research student uploaded/downloaded thousands
  of images to measure Facebook's server footprint; Facebook blocked the account,
  then the whole school network — a legitimate heavy workload can look like a DoS.
- **VPN / source-tracing aside**: you can partly locate a DoS source by analysing
  the hops (traceroute-style) and comparing against a genuine path to that region,
  plus published lists of known VPN IP ranges — but it's only ever a partial,
  probabilistic answer.
- **Futurology aside** (not examinable): "deflation of technology" — compute
  eventually stops being the constraint; Musk's "star mines" (Starlink satellites
  training AI models); underwater datacentres for cooling.
- Repeated refrain from Weeks 4–5: *"it's about a security model, not just an
  algorithm — which approach suits this data, these roles, this scenario."*

---

## 2. Post-lecture Q&A

Questions students raised in the informal discussion after the formal content, and
how the lecturer answered them:

- **"Is the impossible-travel case (09:12 Australia, 09:14 Germany) definitely a
  breach?"** — High chance. The only innocent explanation is a VPN, and you can't
  confirm that from the login alone, so it *is* enough evidence to alert or block
  that user.
- **"If you restore from backup but the same vulnerability is still there, won't
  they just attack again?"** — Yes. *Recovery is not just restoring the backup* —
  first identify and fix the root cause, then restore, or the backup gets ruined
  too. A full factory reset is a huge job for corporates running customised
  operating systems (you lose all your configuration).
- **"Do you approve this cloud design?"** (authentication + authorisation + data
  security + backups) — Something is still missing: **physical and network
  security of the servers** (someone cutting the cables is still an availability
  failure), **session timeout / freshness**, and **firewalls, IDS/IPS, network
  scanning and pattern-blocking appliances** — *"that could be the next
  discussion."* Approve the direction, require the missing controls first.
- **"Do you encrypt the backup as well?"** — *It depends.* Encrypting very large
  object/image backups costs a lot of compute; *"it's about managing backups
  rather than just creating or encrypting them"* — placement and management are
  part of the design, but the copy still needs protecting.
- **"Is Canvas a good example of the third-party-cloud risk?"** (student raised it)
  — Yes: third-party cloud holding 9,000 institutes' data; one incident there hit
  all of them at once. That scale is exactly why shared responsibility and
  least privilege matter at cloud scale.
