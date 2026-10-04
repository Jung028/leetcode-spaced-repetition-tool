# INFO5995 — Exam Revision Scenario Question Bank (Weeks 1–8)

Source: `INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf`
(official revision pack, "Week 1-8 scenario practice" section — 48 scenarios,
6 per week, each worth 10 marks across 2-3 parts). Kept verbatim from the
answered source with only light formatting clean-up — these are already
strong, correct exam-grade answers.

This is a reference file for revision, not SRS app content — it doesn't use
the "explain it to a teenager" style used in `exam-content/**/*.ts`, the same
convention as `discussion-questions.md`. The 30-question "Mixed MCQ Practice"
section from the same source document has been authored into the app as
`exam-content/info5995/final-practice.ts` (paper 3, week 8); this file covers
everything else in the pack — the scenario/short-answer questions, which are
out of scope for the app's typed-question pipeline until Phase 2 (per
`CLAUDE.md`'s "Generation phase" rules, `short`/`scenario` types aren't
authored for INFO5995 yet).

Update this file whenever a newer revision of the official question bank is
released.

---

## Week 1 — Cybersecurity Foundations, Security Lifecycle, System and Threat Models

### Scenario 1: University portal exposure (10 marks)

A university expands a student portal so it can be reached from campus, home
networks and mobile devices. The portal stores profiles, marks and
enrolment information. The team argues that the change only improves
usability and does not alter security because the application code is
unchanged.

**a) Define an appropriate system boundary and identify two important
assets. [3 marks]**

User/device, the portal, the user-centred service for login/register, the
database, and the dependencies external/internal. The assets are user
personal information, student marks/enrolment info, credentials, and
availability of the portal.

**b) Identify two ways the expanded connectivity changes the attack surface
or threat model. [3 marks]**

The expanded connectivity changes the attack surface and threat model by
introducing new entry points for credential-based spoofing and third-party
supply-chain risks, while shifting the threat focus from traditional local
data theft toward Denial of Service (DoS) attacks and cascading dependency
failures across a wider trust boundary.

- Credential spoofing refers to phishing, where an attacker creates a fake
  email to get a username and password, which can then be used for
  credential stuffing — trying that username and password against other
  websites.
- Third-party supply chain means external components like a library or API;
  if those providers are compromised, an attacker can exploit the system's
  trust in them.

**c) Give one confidentiality, one integrity and one availability
requirement for the portal. [4 marks]**

Confidentiality: only the user can see their own marks. Integrity: students
cannot modify their own marks. Availability: the portal stays online for
students at all times.

### Scenario 2: Research laboratory threat model (10 marks)

A research laboratory stores unpublished results on a shared service used by
staff, students and external collaborators. Accounts have different
privileges, and the service depends on cloud storage and an identity
provider. The team wants to assess security before adding another
collaborator group.

**a) State two attacker capabilities or threat assumptions that should be
made explicit. [2 marks]**

The attacker has the capability to intercept and modify network traffic
between client and server, and they can obtain user credentials through
credential spoofing.

**b) Identify two trust assumptions and explain why each matters. [4 marks]**

1. External APIs and dependencies won't inject malicious code or exploit
   the internal services within the system — if that trust is broken, the
   attacker can gain access to the inner logic and internal assets.
2. Only authorised users can perform specific actions / view specific
   data — this matters because without it, an attacker who compromises a
   single account can navigate and exploit the whole system.

**c) Recommend two controls that reduce risk at different points in the
system. [4 marks]**

Enforce MFA at the entry point to prevent account compromise or credential
spoofing, and strict RBAC (role-based access control) at the cloud storage
layer to restrict data access even if perimeter authentication is bypassed.

### Scenario 3: Weakest-link security (10 marks)

A company has strong encryption for its database but uses shared
administrator passwords, an unpatched web server and limited monitoring.
Management claims the database encryption makes the overall system secure.

**a) Explain why security must be considered end-to-end rather than only at
the database. [4 marks]**

Security of a system is only as strong as its weakest link. For example,
database encryption only secures data at rest, while a weak authentication
layer, a lack of RBAC, or a malicious external dependency can cause the
system to be exploited through that layer — so even with very strong
database encryption, one weak layer makes the whole system vulnerable.
Taking an end-to-end approach ensures every component and interface along
the path is reasoned about and protected.

**b) Identify two weak points in the scenario and a plausible consequence of
each. [4 marks]**

- Shared admin passwords prevent identifying which account has been
  compromised; the consequence is that the attacker can perform a data
  breach or execute administrative changes across the system without being
  traced back to a specific user.
- An unpatched web server leaves unaddressed vulnerabilities an attacker
  can exploit; the consequence is a direct entry point for remote code
  (command) injection and exploitation of internal components.

**c) State one detective control that would complement preventive controls.
[2 marks]**

Centralised audit logging — adding user_id, action and time to every DML or
data-update command. Alternatively, an IDS/IPS: an intrusion detection
system monitors for anomalous activity, and an intrusion prevention system
automatically stops malicious activity from proceeding further.

### Scenario 4: Security lifecycle (10 marks)

A new online service is designed quickly, deployed to production and
reviewed for security only after customers begin reporting suspicious
activity. The development team wants a more systematic process for the next
release.

**a) Explain why discovering security issues late can be costly. [2 marks]**

Discovering security issues late in the development lifecycle is costly
because fixing architectural flaws after deployment requires expensive
emergency redesigns, major code refactoring and data migrations, while also
risking active security breaches, operational downtime, regulatory fines
and severe reputational damage.

**b) Describe four security activities that should occur across the system
lifecycle. [4 marks]**

- Requirements phase — Threat Modeling: identify potential threats, attack
  vectors and security requirements.
- Implementation phase — Secure code reviews and static analysis (SAST):
  perform static code analysis and peer reviews to detect coding flaws,
  buffer overflows and input validation vulnerabilities while code is being
  written.
- Verification phase — Penetration Testing & Dynamic Analysis (DAST):
  conduct automated security scanning and manual ethical hacking on the
  running system to find exploitable vulnerabilities prior to deployment.
- Operation phase — Continuous Monitoring and Patch Management:
  continuously inspect system logs for anomalous behaviour and regularly
  apply security updates to mitigate newly discovered vulnerabilities
  post-deployment.

**c) Explain how monitoring after deployment contributes to security. [4
marks]**

Post-deployment monitoring contributes to security by acting as a critical
detective control that continuously inspects system logs, network traffic
and user activity to identify anomalous behaviour, unauthorised privilege
access or active breaches in real time. Because preventive controls cannot
stop every attack — such as zero-day threats or insider credential
misuse — ongoing monitoring enables security teams to detect incidents
early, reduce response time, and identify gaps to improve over time.

### Scenario 5: CIA trade-offs (10 marks)

During a major assessment deadline, a learning platform remains confidential
and its records are unchanged, but students cannot submit work for two
hours. The operations team considers disabling a security control
temporarily to restore service faster.

**a) Identify the security property most directly affected by the outage
and justify your answer. [2 marks]**

Availability is the security property most affected, because availability
ensures systems stay online when users need them. An outage prevents users
from accessing the system, which violates this property.

**b) Explain one security trade-off the team should consider before
disabling a control. [4 marks]**

Before disabling a control, the team needs to know that disabling it (such
as a rate limit or an auth check) may resolve an immediate availability or
performance bottleneck but will cause the security level to drop. The
trade-off is losing confidentiality and integrity of the system for
short-term availability — removing RBAC, for example, increases the chance
of credential spoofing, unauthorised access and data exploitation while the
control is inactive. To manage this trade-off, the team must implement
compensating controls, such as enhanced monitoring, and set a strict
timeframe for re-enabling the control.

**c) Propose two actions that could improve resilience without ignoring
confidentiality or integrity. [4 marks]**

Implement a redundant/failover server and backup submission functions so
students can still submit work if the primary platform fails. Also improve
backup and recovery procedures: maintain regular, tested backups and a
documented disaster recovery process so the platform and assessment records
can be restored quickly after an outage. Backups should remain protected by
appropriate access controls and integrity checks.

### Scenario 6: Model-based reasoning (10 marks)

Two analysts disagree about whether a remote attacker can exploit a
service. One assumes the attacker has a valid user account; the other
assumes the attacker has no credentials. They reach different conclusions
from the same technical evidence.

**a) Explain why their conclusions can differ even when both reason
correctly. [3 marks]**

A security conclusion is only true relative to a model: the system, the
attacker's capabilities, and the security goal. The two analysts are using
different attacker models, one authenticated (valid account) and one
unauthenticated (no credentials). If the flaw sits behind the login, it is
reachable for the first attacker and unreachable for the second, so
"exploitable" and "not exploitable" are both correct under their own
assumptions — they disagree about the assumptions, not about the evidence.

**b) State three elements that should be explicit in a useful security
model. [3 marks]**

1. System model — the system boundary, components, assets and trust
   boundaries (what is being protected and where).
2. Threat model — who the attacker is and what they can do (e.g. remote or
   local, with or without credentials).
3. Security goals — the properties that must hold, e.g. confidentiality,
   integrity and availability requirements, plus any trust assumptions
   about users and dependencies.

**c) Explain how documenting assumptions makes a security claim more
defensible. [4 marks]**

- Precise scope: the claim becomes "secure against attacker X under
  assumptions Y" instead of a vague "it is secure", so it cannot be
  over-read.
- Testable: other people can check each assumption and challenge it
  directly, instead of arguing about the conclusion.
- Repeatable: different analysts starting from the same written assumptions
  reach the same conclusion, removing disagreements like the one in this
  scenario.
- Shows its limits: when an assumption stops being true (e.g. a credential
  is phished, so the attacker now has an account), it's clear exactly which
  claims must be re-assessed and where the gaps are.

---

## Week 2 — AI-Assisted Vulnerability Discovery

### Scenario 1: AI coding agent (10 marks)

A security team gives an AI coding agent access to a private repository,
terminal commands and a vulnerability scanner. The agent finds one real
exposed credential but also proposes a destructive command and reports a
function that does not exist.

**a) Identify two benefits of controlled tool access for vulnerability
discovery. [2 marks]**

- Evidence-grounded findings: the agent can read the real code and run the
  scanner, so its findings are based on the actual system instead of
  guesses (it found one real exposed credential).
- Speed and coverage with bounded risk: it automates repetitive searching
  across the whole repository, while controlled (limited, logged) tool
  access keeps its actions restricted and auditable.

**b) Identify three risks or limitations shown by the scenario. [3 marks]**

1. Hallucination — it reported a function that does not exist, so its
   output can be confidently wrong (a false positive that wastes time).
2. Unsafe actions — it proposed a destructive command. With terminal
   access, one wrong command could destroy data or take down a service.
3. Sensitive data exposure — the agent has access to a private repository
   and a real credential, which now sits in its context and logs and could
   leak. Its access is wider than a read-only review needs.

**c) Describe a five-step human-in-the-loop workflow for producing
defensible evidence. [5 marks]**

1. Scope and restrict: run the agent in a sandbox or test copy with
   least-privilege, read-only access, approved tools only, and full logging
   of every command.
2. AI proposes: the agent produces candidate findings as hypotheses, each
   with a file, line and reason.
3. Human verifies against real code: an analyst checks that the finding's
   file path actually exists. The non-existent function is discarded here.
4. Human-approved safe reproduction: confirm the finding in a controlled
   environment. Any risky command needs explicit approval, and the
   destructive command is rejected.
5. Record evidence and remediate: document location, reproduction steps,
   output, impact and fix (e.g. rotate the exposed credential and remove it
   from history), then retest.

### Scenario 2: AI finding without evidence (10 marks)

An AI assistant reports a possible authorisation bypass in a web API and
assigns it high confidence, but provides no reproducible request, code path
or runtime evidence. The developer wants to file it immediately as a
critical vulnerability.

**a) Explain why model confidence is not proof of a vulnerability. [3
marks]**

An LLM generates text that is statistically likely, not text that has been
checked. Its "high confidence" is just part of the generated output, not a
measurement of truth. It can hallucinate a code path or miss context it
wasn't shown — for example, an authorisation check done in middleware
elsewhere. A vulnerability is a claim about how the real system behaves, so
it needs evidence: a reachable code path and a reproducible result. Without
that, it is only a hypothesis.

**b) Describe three verification activities that should occur before
accepting the finding. [3 marks]**

1. Code review — trace the API endpoint in the real source and check
   whether an authorisation check exists, including in middleware or the
   framework.
2. Dynamic reproduction — in a test environment, send the request as a
   low-privilege or unauthenticated user and see whether protected data or
   actions are actually returned.
3. Impact and independent check — confirm with a second reviewer or tool,
   and work out what an attacker really gains to set the true severity (it
   may not be critical).

**c) Explain what evidence should be recorded in a final vulnerability
report. [4 marks]**

- Location: the affected endpoint, file, function and version or commit.
- Reproduction steps: the exact request, preconditions, the account role
  used and the test environment, so anyone can repeat it.
- Proof: the observed result versus the expected result, with supporting
  output (response, logs, screenshots).
- Impact, severity and fix: what data or action is exposed, under what
  attacker assumptions, a justified severity rating, and a recommended
  remediation — noting that the AI-led finding was manually verified.

### Scenario 3: Tool permissions (10 marks)

An AI agent is allowed to run commands during a security review. One
proposal gives it unrestricted administrator privileges; another limits it
to a test environment, read-only repository access and approved tools
unless a human authorises more.

**a) Compare the security implications of the two permission models. [4
marks]**

Unrestricted administrator: any mistake, hallucination or prompt injection
becomes a maximum-impact event. The agent could delete data, change
configuration, read secrets or touch production. The blast radius is the
whole system, and it also breaks accountability and containment, because
nothing stops or checks a bad command before it runs.

Restricted model: the test environment means errors never reach real users
or data, read-only access means it cannot change the code, and approved
tools limit what actions are possible. The human-authorisation step adds a
checkpoint for anything riskier. The trade-off is a little less speed and
autonomy in exchange for bounded, auditable risk.

**b) Explain how least privilege applies to the AI agent. [3 marks]**

Least privilege means giving only the minimum access needed for the task,
for only as long as it is needed. A security review only needs to read code
and run scanners, so the agent should get read-only repository access, a
test environment and an allow-list of tools, with no production access or
secrets. This limits the damage if the agent is wrong or is manipulated
(e.g. a prompt injection hidden in the code). Extra permission is granted
case by case by a human, then removed.

**c) Give three actions that should require human review or explicit
approval. [3 marks]**

1. Destructive or irreversible commands, such as deleting, overwriting or
   modifying data, code or configuration.
2. Anything that touches production systems or real customer data,
   including running an exploit.
3. Gaining more access or reaching outside the sandbox — privilege
   escalation, reading secrets, installing packages, pushing code or
   making external network connections.

### Scenario 4: Context and prompts (10 marks)

A team uses an LLM to review source code. Different prompts and
conversation histories produce different explanations of the same function.
One response confidently invents a library behaviour that is not present in
the supplied code.

**a) Explain why context can change an LLM response. [3 marks]**

An LLM generates each answer conditioned on everything in its context
window: the prompt wording, the conversation history and the supplied code.
Changing any of these changes the most likely output. Generation is also
probabilistic, so the same input can give different wording or conclusions.
When context is missing, the model fills gaps from training patterns, and a
leading prompt (e.g. "find the vulnerability") biases it toward finding
one.

**b) Identify the security risk demonstrated by the invented library
behaviour. [3 marks]**

This is hallucination: a plausible but false claim stated with confidence.
The risk is that the analyst trusts it. That can cause a false positive
(wasted time, a wrong fix) or, worse, a false negative — believing the
library sanitises input when it does not, so a real vulnerability is
missed. It creates false assurance and automation bias, where decisions
rest on evidence that does not exist.

**c) Describe two ways an analyst can reduce reliance on unsupported AI
claims. [4 marks]**

1. Verify against ground truth — read the actual source code and the
   official library documentation, then run a test to confirm the real
   behaviour. Require the AI to cite the file and line for every claim, and
   reject claims it cannot point to.
2. Improve inputs and cross-check — give the model the complete relevant
   code (including the library), and confirm findings with an independent
   source such as a static analyser, a fresh session or a second human
   reviewer. Treat every AI output as a hypothesis until it is reproduced.

### Scenario 5: AI-assisted triage (10 marks)

Static analysis produces 120 warnings. An AI assistant groups similar
findings, explains suspicious paths and proposes test inputs. The team has
only one day to decide which findings deserve manual investigation.

**a) Explain two useful roles for AI in this triage process. [4 marks]**

1. Grouping and de-duplication — the AI clusters the 120 warnings by root
   cause or pattern, so the team reviews a small number of groups instead
   of 120 separate items. This saves most of the limited day.
2. Explanation and test support — the AI explains the suspicious path from
   untrusted input (source) to dangerous operation (sink) and proposes test
   inputs, so a human can judge reachability and confirm or dismiss each
   group quickly.

**b) Explain why the AI should not make the final vulnerability decision
alone. [2 marks]**

The AI can hallucinate or miss context, giving both false positives and
false negatives, and it lacks business knowledge about real impact. A final
decision needs verified evidence and an accountable person — the AI cannot
be held responsible for a wrong call.

**c) Propose a four-step triage workflow combining AI and human
verification. [4 marks]**

1. AI groups — cluster and de-duplicate the 120 warnings and summarise each
   group.
2. Rank by risk — AI suggests and a human decides the priority using
   severity, reachability from untrusted input, and the sensitivity of the
   asset. Pick the top groups that fit in one day.
3. Human verifies — for the top groups, read the real code path and run
   the AI's test inputs in a test environment.
4. Decide and record — mark each as confirmed, false positive or needs
   more work, with evidence. Fix confirmed issues, and log the unreviewed
   remainder so nothing is silently dropped.

### Scenario 6: Safe testing (10 marks)

An AI assistant proposes an exploit string for a suspected vulnerability in
a production service containing real customer data. The team has permission
to assess the application but has a staging copy with synthetic data
available.

**a) Explain why the staging environment is preferable for initial
verification. [3 marks]**

Staging uses synthetic data, so no real customer data can be exposed or
corrupted (protects confidentiality and integrity). An AI-proposed exploit
is unverified and may have unknown side effects. If it crashes staging,
production availability and real customers are unaffected. Staging can also
be freely logged, reset and re-run, so results are repeatable and safe to
study.

**b) Describe three safe verification steps. [3 marks]**

1. Human review first — read the exploit string and understand exactly
   what it does before running anything. Remove any destructive part.
2. Run it in the isolated staging copy with logging on, using the least
   harmful proof possible (e.g. a harmless marker that shows the flaw
   without deleting or extracting data).
3. Observe and record the result, match it to the code path to confirm the
   root cause, then reset the environment.

**c) State two conditions that should be satisfied before any higher-impact
test is performed. [4 marks]**

1. Explicit authorisation and scope — the system owner must approve that
   specific test in writing, with clear rules of engagement: what is in
   scope, the time window, and who is contacted if something goes wrong.
   General permission to assess is not enough for a risky test.
2. Verified need plus safeguards — the finding must already be confirmed
   in staging, and a risk assessment must show the higher-impact test is
   truly necessary. Safeguards must be ready: backups, a rollback plan,
   monitoring, and a minimal-impact payload.

---

## Week 3 — Mobile Security

### Scenario 1: Exported Android component (10 marks)

Static inspection of an APK shows an exported activity that accepts a
user-controlled URL through an intent. The activity is not linked from the
normal interface, and the developer argues that users therefore cannot
reach it.

**a) Explain why the exported activity can still create a security
concern. [4 marks]**

"Exported" means any other app on the device (or a tester using adb) can
start the activity directly with an intent. It does not need to be linked
from the interface. Hiding it from the UI is security by obscurity, not
access control. The intent crosses a trust boundary, and the URL inside it
is fully attacker-controlled. If the activity loads that URL (e.g. in a
WebView) it runs inside the trusted app's identity. This can enable
phishing pages shown inside the real app, theft of tokens or cookies,
access to local files, or skipping the login screens the normal flow would
enforce.

**b) Describe how you would test the component dynamically in a controlled
environment. [3 marks]**

1. Set up a controlled environment: an emulator or test device with a test
   build and a test account.
2. Send a crafted intent directly to the component, e.g.
   `adb shell am start -n com.example.app/.TargetActivity --es url
   "https://attacker.test"`, or use a small test app.
3. Observe and record: does it open without authentication, and does it
   load the supplied URL? Watch logcat and proxy traffic, then try variants
   such as `file://` and `javascript:` URLs.

**c) Recommend one remediation and explain why it helps. [3 marks]**

Set `android:exported="false"` in the manifest (or protect it with a
signature-level permission) if no other app needs it. This removes the
external entry point, so only the app's own components can start the
activity and the attacker can no longer supply the URL. If it must stay
exported, validate the URL against an allow-list of trusted HTTPS hosts and
require the user to be authenticated first.

### Scenario 2: Embedded mobile secret (10 marks)

A mobile app contains a long-lived API key in a resource file inside its
APK. The backend trusts requests containing that key. The development team
assumes the key is safe because users do not see it on screen.

**a) Explain why storing the secret in the APK is unsafe. [4 marks]**

An APK is distributed to every user and is just an archive. Anyone can
unpack or decompile it and read the resource file. "Not shown on screen" is
not secret — the client device is under the attacker's control, so anything
shipped in it must be treated as public. The same key is shared by every
install; once extracted, an attacker can call the backend directly without
the app, and the backend cannot tell them apart from a real user. Because
it is long-lived, it stays valid for a long time and is hard to rotate (it
needs a new app release), so the impact is wide and lasting.

**b) Describe two ways an analyst could discover or confirm the issue. [2
marks]**

1. Static analysis — decompile the APK with apktool or jadx and search the
   resources and code for key-like strings.
2. Dynamic analysis — run the app on an emulator through an intercepting
   proxy, see the key in the requests, and confirm by replaying a request
   with that key from outside the app (authorised test only).

**c) Recommend a safer design for protecting backend access. [4 marks]**

Do not ship long-lived secrets in the client at all. Authenticate each user
instead: after login, the server issues a short-lived, per-user,
limited-scope token (e.g. an OAuth access token), stored in the Android
Keystore. Enforce authorisation on the server for every request, based on
who the user is, not on possession of an app-wide key. Keep third-party
secrets on the backend (the app calls your server, which holds the key),
and add rotation, revocation, rate limiting and monitoring so abuse can be
cut off quickly.

### Scenario 3: Permissions and least privilege (10 marks)

A photo-editing app requests camera, microphone, location, contacts and
storage permissions, although its advertised features only require camera
access and saving edited images.

**a) Explain the security principle that should guide permission requests.
[3 marks]**

The principle is least privilege (with data minimisation): an app should
request only the permissions its stated features need, and only when it
needs them. Here that means camera and saving images. Microphone, location
and contacts have no justification. This limits what the app, or anyone who
compromises it, is able to reach.

**b) Identify two risks created by unnecessary permissions. [3 marks]**

1. Privacy risk — the app or a bundled third-party SDK can collect
   location, contacts and audio far beyond its stated purpose, with or
   without the user realising.
2. Bigger blast radius — if the app is compromised, has a vulnerable
   component or receives a malicious update, the attacker inherits every
   granted permission and can track location, record audio or steal
   contacts. It also damages user trust and may breach privacy rules.

**c) Recommend how the permission design should be improved. [4 marks]**

Remove microphone, location and contacts from the manifest entirely.
Request camera access at runtime, at the moment the user takes a photo,
with a short explanation, and keep working sensibly if it's denied. Replace
broad storage permission with narrower options: the system photo picker and
scoped storage (MediaStore), or the system camera intent, so less
permission is needed. Review permissions every release, including those
pulled in by third-party SDKs.

### Scenario 4: Android sandbox (10 marks)

A developer says an Android application is secure because Android assigns
applications separate identities and sandboxes them. The same application
exports multiple components and processes external intents.

**a) Explain what the Android sandbox protects by default. [3 marks]**

Each app gets its own Linux user ID and runs in its own process. Its
private data directory can only be accessed by that user ID, enforced by
the kernel (and SELinux). So by default, other apps cannot read its files
or memory or interfere with it, and access to sensitive resources needs
explicit permissions.

**b) Explain why sandboxing does not remove risks at exported components or
intents. [4 marks]**

The sandbox isolates by default, but exported components are deliberate
doors through that wall for inter-app communication. The sandbox controls
who can reach the app's files; it does not check whether data arriving
through an allowed channel is safe. An incoming intent is processed with
the receiving app's own privileges and data access — a malicious app with
no permissions can therefore get the app to act on its behalf (the
confused-deputy problem). If the intent data is not validated, this can
cause data leaks, unauthorised actions or injection; security at these
entry points depends on the app's own checks, not on the sandbox.

**c) Give one validation or authorisation control for externally supplied
input. [3 marks]**

Treat all intent data as untrusted and validate it before use: check type,
format and length, and compare values against an allow-list (e.g. only
expected actions and trusted hosts). Reject everything else. Combine this
with authorisation: set `exported="false"` where external access is not
needed, or protect the component with a signature-level permission so only
apps signed by the same developer can call it.

### Scenario 5: Deep-link trust boundary (10 marks)

A banking app registers a deep link that opens a transfer screen. A crafted
external URL can populate the destination account and amount. The app
currently assumes that any correctly formatted deep link came from a
trusted source.

**a) Explain why the deep link represents a trust-boundary issue. [4
marks]**

A deep link is an entry point from outside the app. Any website, email,
SMS, QR code or other app can trigger it. So the destination account and
amount cross from an untrusted source into a trusted, authenticated banking
context. The app wrongly treats "correctly formatted" as "from a trusted
source" — format says nothing about origin. An attacker can send a crafted
link; when the victim taps it, the transfer screen is filled with the
attacker's account inside the victim's logged-in session (similar to CSRF).
A sensitive action is being driven by untrusted input.

**b) Identify two checks that should occur before a transfer is accepted.
[4 marks]**

1. User authentication and explicit confirmation — the user must be
   logged in, be shown the payee and amount clearly, and actively confirm
   with step-up authentication (PIN or biometric). The link must never
   submit the transfer by itself.
2. Input validation and server-side authorisation — treat the link values
   as untrusted suggestions: validate account format and amount limits, and
   let the server check that this user is allowed to make this transfer
   (new-payee checks, fraud limits). Verified App Links can also confirm
   the link's origin.

**c) Explain why correct URL syntax alone is not sufficient security
evidence. [2 marks]**

Valid syntax only shows the data is well-formed. It does not show who
created it or whether the user intended it. An attacker can produce a
perfectly valid URL, so trust must come from authenticating the source and
authorising the action.

### Scenario 6: Static and dynamic mobile analysis (10 marks)

An analyst decompiles an APK and finds suspicious manifest settings and a
hard-coded endpoint. Runtime testing, however, does not immediately show
harmful behaviour.

**a) Explain what static analysis can reveal in this assessment. [3
marks]**

Static analysis examines the app without running it. It can reveal manifest
settings (exported components, permissions, debuggable or cleartext-traffic
flags), hard-coded endpoints and secrets, and the libraries and code paths
present. It covers all the code, including paths that never run in a test,
so it shows what the app could do.

**b) Explain what dynamic analysis can add that static inspection cannot
prove by itself. [3 marks]**

Dynamic analysis shows what the app actually does when it runs: real
network traffic to the endpoint, what data is sent, files written and
runtime behaviour. It can confirm whether a suspicious setting is truly
reachable and exploitable, and it sees through obfuscation or code loaded
at runtime. Its limit is that it only observes the paths that were
executed. No harmful behaviour seen so far does not prove the app is safe,
because a trigger, time delay or specific input may be needed.

**c) Propose a four-step process for combining both forms of evidence. [4
marks]**

1. Static first — decompile the APK and list the suspicious items
   (manifest settings, endpoint) as hypotheses.
2. Plan targeted tests — for each item, design a dynamic test on an
   emulator with a proxy and logging.
3. Run and trigger — start the specific components (e.g. via adb intents),
   exercise the relevant features and watch for traffic to the hard-coded
   endpoint.
4. Correlate and report — findings confirmed by both are reported with
   evidence and a fix. Static-only findings stay as potential risks and are
   retested with different triggers, not dismissed.

---

## Week 4 — Cryptography Basics Part 1

### Scenario 1: Choosing a cryptographic goal (10 marks)

A medical service must send sensitive records over an untrusted network.
The team says that encrypting the data is sufficient for every security
requirement.

**a) Explain the security property encryption is primarily intended to
provide. [3 marks]**

Encryption primarily provides confidentiality. It turns plaintext records
into ciphertext that only someone with the correct key can read. An
eavesdropper on the untrusted network sees only ciphertext, as long as the
key stays secret.

**b) Explain two important properties that encryption alone may not
provide. [4 marks]**

1. Integrity — encryption alone does not detect changes. An attacker can
   alter the ciphertext and the receiver decrypts a modified record without
   knowing (e.g. a changed dosage). A MAC or authenticated encryption is
   needed.
2. Authentication (origin) — encryption does not prove who sent the data
   or who you are talking to. An attacker could impersonate the service or
   inject their own records. Certificates or digital signatures are needed.

(Encryption also does not give availability, freshness against replay, or
non-repudiation.)

**c) State why the cryptographic tool must be matched to the security
goal. [3 marks]**

Each cryptographic tool provides specific properties: encryption gives
confidentiality, hashes and MACs give integrity, MACs and signatures give
authentication, and signatures give non-repudiation. Using the wrong tool
leaves the real goal unprotected while creating a false sense of security.
So the team should start from the security requirements and threat model,
then choose tools that cover each one (e.g. TLS with authenticated
encryption for the medical records).

### Scenario 2: Security by obscurity (10 marks)

A startup uses a proprietary encryption algorithm and refuses to document
it, arguing that attackers cannot break a design they do not know. The
encryption key is also embedded in the client software.

**a) Explain the weakness in relying on secret algorithm design. [4 marks]**

This is security by obscurity and it breaks Kerckhoffs's principle: a
system should stay secure even if everything except the key is known. The
algorithm cannot stay secret — it ships inside the client software and can
be reverse-engineered, or leaked by insiders. A proprietary, undocumented
design has had no public expert review, so it very likely has undiscovered
flaws. Standards such as AES have survived decades of analysis. Once the
design is exposed, it cannot be changed easily: the whole system must be
replaced. Here the key is also in the client, so everything is recoverable.

**b) Explain why key secrecy is different from algorithm secrecy. [3
marks]**

A key is a small random value that can be unique per user or session and is
easy to change if it is compromised. An algorithm is shared by everyone,
built into every copy of the software, and very hard to replace. So all
secrecy should sit in the key, and security is then measured by key
strength. In this scenario the key is embedded in the client, so it is not
really secret either.

**c) Recommend one design principle for a stronger cryptographic system. [3
marks]**

Follow Kerckhoffs's principle (open design): use public, standardised,
peer-reviewed algorithms such as AES-GCM from well-tested libraries. Keep
only the key secret. Manage keys properly: do not embed them in the
client; generate them per user or session, store them in a secure keystore
or server-side, and rotate them.

### Scenario 3: Symmetric vs asymmetric (10 marks)

A company needs to encrypt large volumes of backup data and also establish
secure communication with users who have never shared a secret key with the
company before.

**a) Explain where symmetric encryption is useful in this scenario. [3
marks]**

Symmetric encryption (e.g. AES) suits the large backup data. It is fast and
efficient for bulk data. The company both encrypts and decrypts its own
backups, so one secret key is enough and there is no key-sharing problem.
It is also used for the session data once a secure connection is set up.

**b) Explain where asymmetric cryptography can help. [3 marks]**

Asymmetric cryptography solves communication with users who share no
secret. The company publishes a public key (in a certificate). Users use it
to authenticate the company and to establish a shared session key over the
untrusted channel, with no prior secret needed. Because it is slow, it is
used only for setup; the bulk data then uses symmetric encryption (a hybrid
design).

**c) Explain one key-management challenge associated with each approach.
[4 marks]**

Symmetric challenge: key distribution and storage. The same key must reach
every party securely, and the number of keys grows quickly as parties are
added. The backup key must be protected for years and kept separate from
the backups: if it leaks all backups are exposed, and if it is lost the
data is gone.

Asymmetric challenge: public-key authenticity. Users must be sure the
public key really belongs to the company, otherwise a man-in-the-middle can
substitute their own. This needs certificates, certificate authorities and
revocation (PKI), and the private key must still be protected.

### Scenario 4: One-time pad (10 marks)

A team proposes a one-time pad for sending 2 GB backup files every day
because it can provide perfect secrecy when used correctly.

**a) State the key conditions required for one-time-pad security. [4
marks]**

1. The key must be truly random.
2. The key must be at least as long as the message.
3. The key must be used only once and never reused.
4. The key must be kept secret and shared securely in advance between only
   the sender and receiver.

**b) Explain why those conditions make the proposal operationally
difficult. [4 marks]**

- Volume: each day needs 2 GB of truly random key, which is slow and hard
  to generate.
- Distribution: that key must be delivered securely to the receiver.
  Securely moving a 2 GB key is the same problem as securely moving the 2
  GB file, so the problem is moved, not solved.
- Storage and handling: both ends must store, protect and synchronise
  large amounts of key material, then destroy it after use.
- Fragility: any slip (reuse, weak randomness) removes perfect secrecy, and
  the pad gives no integrity. A standard cipher such as AES-256 with a
  short key is the practical choice.

**c) Explain why reusing a one-time-pad key is unsafe. [2 marks]**

If two messages use the same key, XORing the two ciphertexts cancels the
key and gives M1 XOR M2. This leaks the relationship between the
plaintexts. If part of one is known or guessable (e.g. file headers), the
attacker recovers the other message and the key, so perfect secrecy is
lost.

### Scenario 5: Key establishment (10 marks)

Two devices need to communicate securely but have never shared a secret. An
engineer proposes emailing the same symmetric key to both devices over an
untrusted channel.

**a) Explain the key-establishment problem in this scenario. [3 marks]**

Symmetric encryption needs both devices to hold the same secret key before
they can talk securely. But they have no secure channel yet to share that
key. The only channel is untrusted. So they need a way to agree a secret
over a public channel and be sure it is agreed with the right device.

**b) Explain why sending the secret key openly defeats the security goal.
[3 marks]**

Anyone who can read the channel (mail servers, a network attacker) gets a
copy of the key. They can then decrypt all later traffic and also forge or
modify messages, and the devices cannot tell. Encryption is only as secret
as its key, so confidentiality is lost before communication starts.

**c) Describe at a high level how public-key techniques can assist key
establishment. [4 marks]**

Each device has a key pair: a public key that can be shared openly and a
private key that never leaves the device.

- Key transport: device A generates a random session key and encrypts it
  with B's public key. Only B's private key can decrypt it.
- Key agreement (Diffie-Hellman): the devices exchange public values and
  each combines its own private value with the other's public value to
  compute the same secret. An eavesdropper who sees only the public values
  cannot compute it.

The public keys must be authenticated (certificates or signatures) to stop
a man-in-the-middle. The agreed key is then used with a fast symmetric
cipher, as in TLS.

### Scenario 6: Plaintext, ciphertext and keys (10 marks)

An organisation publishes the algorithm used to encrypt archived files but
keeps the encryption keys secret. A manager worries that publishing the
algorithm automatically makes the ciphertext readable.

**a) Define plaintext, ciphertext and key in this context. [3 marks]**

Plaintext: the original readable archived file before encryption.
Ciphertext: the scrambled output of the encryption algorithm that is
stored, unreadable without the key. Key: the secret value that controls
the algorithm and is needed to encrypt and decrypt.

**b) Explain why a modern cryptographic design need not rely on hiding the
algorithm. [4 marks]**

By Kerckhoffs's principle, a system should remain secure even when
everything except the key is public. Security comes from the key being
infeasible to guess (e.g. 2^256 possibilities for AES-256), not from hiding
the method — knowing the algorithm does not help without the key. Public
algorithms are reviewed by many experts, so weaknesses are found and
fixed, and they are interoperable. Hidden algorithms eventually leak or are
reverse-engineered, so secrecy of the design is not dependable. The
manager's worry is therefore unfounded.

**c) Identify one operational failure involving keys that could still
compromise the archives. [3 marks]**

Poor key storage: the key is kept on the same server as the archives, or
hard-coded in a script or source repository. An attacker who reaches the
archives then also gets the key and can decrypt everything. Keys should be
held separately in a key management system or HSM with strict access
control and rotation. (Losing the key would equally make the archives
unrecoverable.)

---

## Week 5 — Cryptography Basics Part 2

### Scenario 1: Hash versus MAC (10 marks)

A software team publishes a download together with its SHA-256 hash on the
same website. An attacker who can replace the file can also replace the
displayed hash.

**a) Explain what an unkeyed hash can demonstrate when obtained from a
trusted source. [3 marks]**

It demonstrates integrity: the user recomputes SHA-256 over the download
and compares it with the trusted value. A match means the file is
bit-for-bit identical to the original, because it is infeasible to find a
different file with the same hash (collision and second-preimage
resistance). This detects both accidental corruption and tampering, but
only when the reference hash itself is trustworthy.

**b) Explain why the arrangement does not authenticate the file against
this attacker. [3 marks]**

A hash has no key, so anyone can compute it. The attacker replaces the
file, recomputes the hash of the malicious file, and replaces the displayed
hash too. The user's check still passes. The file and the hash share the
same compromised channel, so the hash only proves the two are consistent
with each other, not where they came from.

**c) Explain how a keyed MAC changes the trust model and one limitation of
using it for public distribution. [4 marks]**

A MAC is computed with a secret key, so only key holders can produce a
valid tag. An attacker who replaces the file cannot forge a matching tag.
Trust moves from "whoever controls the website" to "whoever holds the
key", giving integrity and origin authentication.

Limitation: a MAC is symmetric. Every verifier needs the same secret key,
so for public distribution the key would have to be given to everyone,
including attackers who could then forge tags. It also gives no
non-repudiation. This is why public downloads use digital signatures:
verify with a public key, sign with a private one.

### Scenario 2: Digital signature (10 marks)

A vendor distributes software updates publicly and signs each update with
its private signing key. Clients have a trusted copy of the vendor's public
key.

**a) Explain how a client verifies the update signature. [4 marks]**

1. The client receives the update and its signature.
2. The client computes the hash of the received update.
3. The client uses its trusted copy of the vendor's public key to check
   the signature against that hash.
4. If they match, the update is accepted and installed; if not, it is
   rejected.

**b) State what authenticity/integrity claim a valid signature supports.
[3 marks]**

Authenticity: the update was signed by the holder of the vendor's private
key, so it comes from the vendor. Integrity: it has not been changed since
signing, because any change breaks the signature. Non-repudiation: the
vendor cannot credibly deny signing it. These hold whatever channel or
mirror delivered the file.

**c) State one important property a valid signature does not guarantee
about the software. [3 marks]**

It does not guarantee the software is safe, correct or free of malicious
code. A signature only says who signed it and that it is unchanged. If the
vendor's build system or signing key is compromised, a malicious update
carries a valid signature (a supply-chain attack). (It also gives no
confidentiality, and no freshness: an old, vulnerable but validly signed
version could be replayed.)

### Scenario 3: Replay (10 marks)

A door controller accepts an encrypted and authenticated OPEN command. An
attacker records one valid command and later resends the exact ciphertext
and tag. The controller has no sequence number, nonce history or timestamp
checking.

**a) Explain why encryption and authentication do not automatically stop
this attack. [4 marks]**

Encryption only hides the content. The attacker does not need to read or
understand the command. Authentication only proves the message was created
by a key holder and not modified. The recorded command is genuine and
unmodified, so its tag verifies again. Neither property says when the
message was created or whether it has been seen before. The controller
keeps no state (no sequence number, nonce or timestamp), so it cannot tell
the original from a copy. Freshness is a separate property that must be
added.

**b) Identify the attack. [2 marks]**

This is a replay attack. The attacker captures a valid message and
retransmits it later to repeat its effect (the door opens) without knowing
any key.

**c) Describe two freshness mechanisms that could help reject the replay.
[4 marks]**

1. Sequence number or counter — the sender puts an increasing counter
   inside the authenticated message. The controller stores the last value
   seen and rejects anything not higher, so an old recording is refused.
2. Challenge-response nonce — the controller sends a fresh random nonce,
   and the command must include it under the MAC. A recorded command
   contains an old nonce and fails.

(A timestamp with a short acceptance window also works, but needs
synchronised clocks. The freshness value must be covered by the MAC.)

### Scenario 4: ECB block swapping (10 marks)

A legacy application encrypts structured payment instructions using ECB
mode and performs no integrity check. An attacker cannot decrypt blocks but
can rearrange ciphertext blocks.

**a) Explain why ECB permits useful block rearrangement by an attacker. [4
marks]**

ECB encrypts each block independently with the same key. There is no
chaining and no IV. The same plaintext block always gives the same
ciphertext block, and a block decrypts correctly wherever it is placed. In
fixed-format payment messages the attacker can learn which block position
holds which field, since patterns show through. They can then swap,
duplicate or paste blocks (even from other messages) without the key, and
with no integrity check nothing detects it.

**b) Describe the likely effect after decryption if two ciphertext blocks
are swapped. [3 marks]**

Decryption succeeds with no error, and the two plaintext blocks simply
appear in swapped positions. For example, swapping the payer and payee
account blocks reverses the direction of the payment. The receiver
processes a valid-looking instruction whose meaning was chosen by the
attacker.

**c) Explain why integrity protection is important in addition to
confidentiality. [3 marks]**

Confidentiality only stops an attacker reading the data. It does not stop
them changing it. As ECB shows, the meaning can be changed without knowing
the content, and for payments correct data matters at least as much as
secret data. A MAC or authenticated encryption (e.g. AES-GCM) makes any
modification or reordering detectable, so the message is rejected before it
is processed.

### Scenario 5: Encrypt-then-authenticate (10 marks)

A team protects messages with encryption but does not authenticate the
ciphertext. Attackers can modify traffic in transit, and the receiver
processes decrypted data without checking whether it was altered.

**a) Explain the security weakness in this design. [3 marks]**

The ciphertext is malleable: an attacker can alter it in transit and the
receiver cannot detect it. It decrypts to changed plaintext, sometimes in
predictable ways (flipping a ciphertext bit flips the same plaintext bit in
stream or CTR modes), and the receiver acts on it. So the design has
confidentiality without integrity, and the receiver's reactions to bad
input can even leak plaintext (e.g. a padding-oracle attack).

**b) Explain the role of a MAC or authenticated-encryption mechanism. [4
marks]**

The sender computes a MAC tag over the ciphertext with a secret key
(encrypt-then-MAC). The receiver recomputes and checks the tag first. If it
does not match, the message is rejected without being decrypted or
processed. This gives integrity and origin authentication, because only a
key holder can produce a valid tag. Authenticated encryption (AES-GCM,
ChaCha20-Poly1305) does encryption and authentication together in one
vetted mechanism and can also protect unencrypted headers.

**c) Give one example of an attack class that integrity protection is
intended to prevent or detect. [3 marks]**

Bit-flipping (ciphertext tampering) attack. The attacker flips chosen bits
in the ciphertext to change a field in the plaintext, e.g. the amount in a
payment, without knowing the key. With integrity protection the tag check
fails and the altered message is rejected. (Padding-oracle and other
chosen-ciphertext attacks are another valid example.)

### Scenario 6: Key/nonce reuse (10 marks)

A stream-cipher-like construction accidentally reuses the same keystream
for two different messages. The attacker sees both ciphertexts but does not
know the key.

**a) Explain why keystream reuse is dangerous. [4 marks]**

A stream cipher computes ciphertext = plaintext XOR keystream, and is only
secure if each keystream is used once. If the same keystream encrypts two
messages, XORing the two ciphertexts cancels the keystream. The attacker
gets information about both plaintexts without the key. If one plaintext
is known or guessable, the other is recovered. The keystream itself is then
recovered too, so the attacker can decrypt or forge any other message using
it. Confidentiality fails without the key ever being broken.

**b) Describe what relationship may become visible when the ciphertexts
are combined. [3 marks]**

C1 XOR C2 = (P1 XOR K) XOR (P2 XOR K) = P1 XOR P2. The keystream K
disappears, leaving the XOR of the two plaintexts. This shows where the
messages are identical (zeros) and how they differ, and with known formats
or language patterns both plaintexts can be separated.

**c) State one operational control that prevents this class of failure. [3
marks]**

Never reuse a (key, nonce) pair. Give every message a unique nonce or IV,
generated by a counter or a large enough random value and enforced by the
library, not left to developers. Rotate the key before the counter can
repeat, and use a vetted authenticated-encryption library (ideally a
misuse-resistant mode) instead of a custom construction.

---

## Week 6 — Applied Cryptography, Authentication and Secure Communications

### Scenario 1: MFA fatigue (10 marks)

A staff member receives repeated unexpected push-based MFA prompts late at
night and eventually approves one. The attacker then accesses cloud files
available to the account.

**a) Explain authentication and authorisation using two different moments
in the scenario. [4 marks]**

Authentication is verifying who you are. This is the login moment: the
password plus the MFA push approval. When the staff member approved the
prompt, the system accepted the attacker as that staff member, so
authentication was fooled.

Authorisation is deciding what an authenticated identity may do. This is
the moment after login, when the system checks the account's permissions
and allows access to the cloud files. Authorisation worked as designed, but
for the wrong person, because it relies on authentication being correct.

**b) Explain the human-factor weakness exploited by the repeated prompts.
[2 marks]**

MFA fatigue (push bombing), a form of social engineering. Repeated
late-night prompts wear the user down until they approve one to make it
stop or assume it is a glitch. A one-tap "approve" needs no thought or
context, so the attack targets the human, not the cryptography.

**c) Recommend one stronger authentication control and one post-login
damage-limiting control. [4 marks]**

Stronger authentication: phishing-resistant MFA such as a FIDO2 security
key or passkey, which needs the user's device to be present at the real
login, so remote prompt spam does not work. (At minimum: number matching
with login details shown, plus a limit on prompts.)

Damage-limiting control: least-privilege access so the account can reach
only the files the role needs, combined with monitoring that alerts on
unusual logins or bulk downloads so the session can be revoked quickly.

### Scenario 2: Least privilege in cloud (10 marks)

A background service needs read access to one storage bucket but has
administrator privileges across the cloud account. Its credential is later
stolen.

**a) Explain how least privilege applies to this service. [3 marks]**

Least privilege means an identity gets only the permissions its task
needs. The service needs to read one bucket, so its policy should allow
only read actions on that one bucket. It should have no write or delete
rights, no other buckets and no administrator or identity-management
rights.

**b) Explain how excessive privilege changes the impact of credential
compromise. [3 marks]**

The impact of a stolen credential equals the privileges attached to it
(the blast radius). With least privilege the attacker could only read one
bucket — a limited confidentiality loss. With administrator rights the
attacker can read all data, modify or delete resources, create new accounts
for persistence and disable logging — a full account takeover. The
likelihood is the same but the impact is far higher.

**c) Recommend two controls that reduce post-compromise reach or improve
detection. [4 marks]**

Reduce reach: replace the admin rights with a narrowly scoped role, and use
short-lived, automatically rotated credentials instead of a long-lived
static key, so a stolen credential expires quickly and can do little.

Improve detection: enable cloud audit logging with alerts on abnormal use,
such as calls from new locations or admin actions the service never
normally performs, so the credential can be revoked fast.

### Scenario 3: Password storage (10 marks)

A service stores user passwords using reversible encryption so support
staff can recover forgotten passwords. Another design proposes a suitable
salted password-hashing function.

**a) Explain why reversible storage creates unnecessary risk. [4 marks]**

Reversible means a decryption key exists, so the original passwords can be
recovered. Anyone who gets that key, such as an attacker who breaches the
server (the key is usually stored nearby) or an insider, can recover every
password at once. The service never needs to know a password, only to
verify it, so this risk is unnecessary. People reuse passwords, so a leak
also exposes their accounts on other sites, and staff being able to see
passwords enables insider abuse and social engineering.

**b) Explain the purpose of salting password hashes. [3 marks]**

A salt is a unique random value per user, stored with the hash and combined
with the password before hashing. Identical passwords then produce
different hashes, so an attacker cannot see which users share a password.
It defeats precomputed (rainbow) tables and forces each hash to be cracked
separately. It works best with a deliberately slow function such as bcrypt,
scrypt or Argon2.

**c) State how password recovery should be handled without recovering the
original password. [3 marks]**

Reset the password, never recover it. Verify the user through another
channel and send a single-use, short-lived random reset link to the
registered email (with MFA where available). The user sets a new password,
which is salted, hashed and stored. The old one is invalidated, sessions
are ended and the user is notified. Staff never see any password.

### Scenario 4: Defence in depth (10 marks)

A research portal uses passwords, MFA, role-based access control, encrypted
network connections and audit logging. A researcher's password is stolen,
but the attacker has not yet passed MFA.

**a) Explain defence in depth using three controls from the scenario. [4
marks]**

Defence in depth means using several independent layers, so that if one
fails the others still protect the system and there is no single point of
failure.

- Password: the first layer. It has already failed because it was stolen.
- MFA: a second, different factor. It stops an attacker who only has the
  password.
- RBAC: even after a successful login, it limits the account to the data
  its role needs. (Encrypted connections stop eavesdropping, and audit logs
  detect misuse.)

**b) Identify which control currently blocks initial access and why. [2
marks]**

MFA blocks initial access. The attacker has the "something you know"
factor (the password) but not the second factor, "something you have" (the
researcher's device), so the login cannot complete.

**c) If authentication later succeeds, identify two controls that can still
reduce harm. [4 marks]**

1. Role-based access control — the attacker is limited to that
   researcher's role and cannot reach other projects or admin functions,
   which reduces the blast radius.
2. Audit logging — logins and data access are recorded, so unusual
   activity can be detected and alerted on, the account can be disabled
   quickly, and investigators can see exactly what was accessed.

### Scenario 5: Encrypted but breached (10 marks)

A university encrypts data in transit and at rest. An attacker nevertheless
logs in with a compromised account and downloads records that the account
is authorised to read.

**a) Explain why the encryption did not fail in this incident. [4 marks]**

Encryption in transit protects against eavesdroppers on the network.
Encryption at rest protects against someone stealing the disks or database
files. Neither was the attack path. The attacker came through the front
door as an authenticated, authorised user, and the system correctly
decrypted data for that account, as designed. Encryption protects data from
people without access. It cannot tell a real user from an attacker using
valid credentials, so this is an identity failure, not a cryptographic one.

**b) Identify the identity/access-control issue that enabled the breach. [3
marks]**

The issue is weak authentication: the account's credentials were
compromised (e.g. phishing or password reuse) and a single factor was
enough to log in. The system could not verify the person behind the
account. Access may also have been too broad, letting one account download
many records with no check on unusual behaviour.

**c) Recommend one preventive and one detective improvement. [3 marks]**

Preventive: phishing-resistant multi-factor authentication, so a stolen
password alone cannot log in (plus least privilege to limit what one
account can read).

Detective: log and monitor account activity, with alerts on anomalies such
as logins from new locations or devices and bulk downloads.

### Scenario 6: Passkeys and phishing (10 marks)

An organisation is considering replacing password-only login with passkeys
for a high-value service after several credential-phishing incidents.

**a) Explain why password-based authentication is vulnerable to phishing
and reuse. [3 marks]**

A password is a shared secret that the user types, and it can be typed into
any site. A fake look-alike site can capture it and the attacker replays it
on the real site. Nothing ties the password to the genuine site. People
reuse passwords, so one breach or phish lets attackers try the same
password elsewhere (credential stuffing).

**b) Explain at a high level how phishing-resistant authentication can
reduce this risk. [4 marks]**

Passkeys (FIDO2/WebAuthn) use public-key cryptography. The device creates a
key pair for each site; the private key stays on the device and the server
stores only the public key. At login the server sends a fresh random
challenge, the device signs it, and the server verifies the signature. The
passkey is bound to the real site's domain, so the browser will not use it
on a look-alike domain and the phishing site gets nothing. There is no
shared secret to type, phish, reuse or steal from the server, and a fresh
challenge each time prevents replay.

**c) Identify one operational consideration that still needs to be managed
after stronger authentication is introduced. [3 marks]**

Account recovery and device loss. If a user loses their device, there must
be a secure way to re-enrol. If recovery falls back to something weak
(email reset, helpdesk call, old password), attackers will target that path
with social engineering, and it becomes the new weakest link. (Other valid
points: removing password fallback, protecting session tokens.)

---

## Week 7 — Network Security, TCP/UDP, TLS and HTTPS

### Scenario 1: Airport Wi-Fi (10 marks)

A student uses free airport Wi-Fi to access a university portal. The
browser establishes HTTPS with a valid certificate. An attacker controls
the local access point and can observe, delay, drop and modify packets.

**a) Identify two threats created by the untrusted network path. [2
marks]**

1. Eavesdropping — the attacker can read traffic passing through the
   access point (confidentiality).
2. Active man-in-the-middle — the attacker can modify or inject packets or
   redirect the student to a fake site (integrity and authentication). They
   can also drop or delay traffic (availability).

**b) Explain how correctly validated TLS supports confidentiality,
integrity and server authentication. [4 marks]**

Server authentication: the portal presents a certificate signed by a
trusted CA. The browser checks the chain, validity and that the name
matches the domain, and the server proves it holds the private key. The
access point cannot impersonate the portal.

Confidentiality: the handshake sets up session keys the attacker cannot
derive, and all data is encrypted with them.

Integrity: every record carries an authentication tag, so modified or
injected data is detected and the connection is aborted.

These only hold when validation is done correctly. If the user clicks
through a certificate warning, the guarantees are lost.

**c) Explain one important problem TLS does not solve and one additional
control that could help. [4 marks]**

Problem not solved: availability. TLS protects the content of the channel,
but an attacker who controls the access point can still drop, delay or
block packets and cut the student off. (TLS also does not hide metadata
such as which site is visited, and does not stop phishing.)

Additional control: switch to a trusted network path, such as a personal
mobile hotspot, so the attacker is no longer on the path. (For the other
gaps: a VPN hides metadata from the local network, and phishing-resistant
MFA protects the account.)

### Scenario 2: DDoS (10 marks)

A public service receives traffic from thousands of compromised devices
until legitimate users can no longer connect. No evidence shows that stored
data was read or modified.

**a) Identify the primary security goal affected and justify your answer.
[3 marks]**

Availability is the goal affected. Legitimate users cannot connect, so the
service is not usable when needed. Confidentiality and integrity are
intact, because there is no evidence data was read or modified.

**b) Explain why encryption alone does not solve this problem. [3 marks]**

Encryption protects the content of data (confidentiality and integrity),
not the capacity of the service. A DDoS exhausts bandwidth, connections or
CPU. The attacker does not need to read or change anything. Encrypted junk
traffic still consumes resources, and TLS handshakes cost the server extra
CPU, so encryption can even make it slightly worse.

**c) Recommend two resilience or mitigation approaches at a high level. [4
marks]**

1. Absorb and spread the load — use a CDN or DDoS-scrubbing service, load
   balancing, redundancy and auto-scaling so there is spare capacity and no
   single choke point.
2. Filter and limit bad traffic — rate limiting, traffic filtering (e.g.
   blocking known-bad sources, SYN cookies) and upstream filtering by the
   ISP, supported by monitoring and an incident response plan.

### Scenario 3: Certificate warning (10 marks)

A browser connects to a site claiming to be the university login page, but
certificate validation reports that the certificate name does not match the
requested domain.

**a) Explain why certificate validation matters for server authentication.
[4 marks]**

Encryption is only useful if you know who is at the other end. A
certificate binds a public key to a domain name and is signed by a trusted
certificate authority. The browser checks that the chain is trusted, the
certificate is not expired or revoked, and the name matches the requested
domain, and the server proves it holds the private key. A name mismatch
means the server has not proved it is the university's site, so the
encrypted channel may lead straight to an attacker.

**b) Explain the risk of ignoring the warning. [3 marks]**

It could be a man-in-the-middle or a fake site. If the user continues and
enters their password (and MFA code), the attacker captures them and can
log in to the real university account, or read and alter the whole session.
Clicking through also trains users to ignore warnings in future.

**c) State one user or system action that is safer than proceeding. [3
marks]**

Do not proceed. Close the page. Go to the university site through a
known-good bookmark or typed official address on a trusted network, and
report the warning to IT. System-side, HSTS makes the browser refuse to let
users bypass the warning at all.

### Scenario 4: TCP vs UDP security reasoning (10 marks)

A monitoring application sends periodic sensor updates using UDP, while an
administrative interface uses a connection-oriented transport. A manager
assumes one transport is automatically secure because it is
connection-oriented.

**a) Explain why transport choice alone does not provide confidentiality or
authentication. [4 marks]**

TCP and UDP are transport protocols. They are about delivery, not
security. TCP adds reliability, ordering and a connection handshake; UDP is
connectionless and best-effort. Neither encrypts, so anyone on the path can
read the data (no confidentiality). Neither authenticates the endpoints.
Addresses can be spoofed, and TCP's handshake, sequence numbers and
checksums only guard against accidental errors, not a deliberate attacker.
"Connection-oriented" therefore does not mean "secure".

**b) Identify two security properties that should be provided above or
alongside the transport. [2 marks]**

1. Confidentiality — encryption of the data.
2. Authentication with integrity — proof of who the endpoints are and that
   messages were not altered.

These come from TLS over TCP, or DTLS/QUIC over UDP.

**c) Explain how threat modelling should guide the communication design.
[4 marks]**

Start from the assets, the attacker and the security goals for each data
flow, not from the protocol.

Administrative interface: high value, because it carries credentials and
commands. An on-path attacker could steal or alter them, so it needs TLS,
strong authentication (MFA), authorisation and restricted network access.

Sensor updates: ask what happens if they are spoofed, altered, replayed or
dropped. Integrity, authenticity and freshness probably matter most, so use
DTLS or a per-message MAC with a counter, and detect missing updates.

Controls are then chosen in proportion to each risk, and the transport is
chosen for performance needs only.

### Scenario 5: Phishing over HTTPS (10 marks)

A user receives a link to a look-alike login domain. The phishing site
itself uses HTTPS and has a valid certificate for its own deceptive domain.

**a) Explain why the padlock/HTTPS indicator does not prove the site is the
intended organisation. [4 marks]**

The padlock means only two things: the connection is encrypted, and the
server holds a valid certificate for the domain shown in the address bar.
It says nothing about who owns that domain or whether they are honest.
Anyone can register a look-alike domain and get a free, domain-validated
certificate automatically, because the CA only checks control of the
domain. So a phishing site shows a genuine padlock. The user must check the
domain name itself.

**b) Explain what TLS does authenticate in this situation. [3 marks]**

TLS authenticates that the server controls the private key for the
certificate of that exact (look-alike) domain. It also protects data in
transit to that server. So the user has a secure, authenticated channel,
but to the attacker. TLS does not authenticate the real-world organisation
or its intent.

**c) Recommend one control that reduces credential-phishing risk. [3
marks]**

Phishing-resistant authentication (passkeys or FIDO2 security keys). The
credential is bound to the genuine domain, so it will not work on a
look-alike site and there is no password to steal. (Other valid controls: a
password manager that only autofills on the real domain, email filtering,
user awareness training.)

### Scenario 6: Network attacker model (10 marks)

A client sends sensitive requests across multiple routers and networks. The
security team assumes an attacker can observe, inject, modify, delay or
drop packets on part of the path.

**a) Explain why this is a useful network threat model. [3 marks]**

The path crosses routers and networks that the client and server do not
control, so an on-path attacker is realistic. It is a strong, worst-case
model: a design that is secure against it is also secure against weaker
(e.g. passive) attackers. It makes the attacker's capabilities explicit, so
each one can be mapped to a required control and tested, instead of
assuming the network is trusted.

**b) Map three attacker capabilities to possible security consequences. [3
marks]**

1. Observe — loss of confidentiality (sensitive requests and credentials
   are read).
2. Modify or inject — loss of integrity and authenticity (altered
   requests, forged messages, impersonation).
3. Delay or drop — loss of availability (denial of service). Re-sending
   captured packets can also cause replay.

**c) Explain how TLS addresses some, but not all, of these consequences. [4
marks]**

Observe: TLS encrypts the data, protecting confidentiality.

Modify or inject: TLS adds an integrity tag to every record and
authenticates the server with a certificate, so tampering and impersonation
are detected.

Not addressed — drop or delay: TLS cannot force packets to be delivered, so
availability is not protected.

Not addressed — metadata and endpoints: addresses, sizes and timing stay
visible, and TLS does nothing about phishing, compromised endpoints or
application flaws. Other controls (redundancy, strong authentication,
secure software) are still needed.

---

## Week 8 — Software and System Security

### Scenario 1: SQL injection (10 marks)

A web endpoint builds a database command by concatenating an untrusted
request parameter directly into SQL text. An attacker supplies crafted
input that changes the meaning of the query.

**a) Explain the trust-boundary mistake that creates SQL injection. [4
marks]**

The request parameter comes from the user, so it is untrusted and crosses a
trust boundary into the application. The application concatenates it
straight into the SQL text, so the database cannot tell the developer's
code from the attacker's data. Data is treated as code. Crafted input such
as `' OR '1'='1` changes the structure and meaning of the query. The
database runs it with the application's privileges, so the attacker can
bypass logins or read, modify or delete data.

**b) Describe one primary remediation that keeps data separate from
executable SQL structure. [3 marks]**

Use parameterised queries (prepared statements). The SQL structure is
written first with placeholders, e.g. `SELECT * FROM users WHERE id = ?`,
and the user input is passed separately as a value. The database always
treats that value as data, never as SQL syntax, so it cannot change the
meaning of the query.

**c) Give one additional defence that reduces impact if an injection flaw
exists. [3 marks]**

Least-privilege database account. The application's database account gets
only the permissions it needs on the tables it needs (e.g. no DROP, no
administrator rights). If an injection does succeed, the attacker is
limited to those permissions, so the damage is contained. (Also valid:
allow-list input validation, a web application firewall, generic error
messages.)

### Scenario 2: Cross-site scripting (10 marks)

A discussion site displays user-supplied comments without appropriate
output handling. A crafted comment causes script to execute in another
user's browser.

**a) Identify the vulnerability and explain how it arises. [4 marks]**

The vulnerability is stored (persistent) cross-site scripting (XSS). The
site accepts a comment, which is untrusted input, and stores it. It later
inserts the comment into the HTML page without output encoding. The browser
cannot tell the attacker's script from the site's own code, so it runs it
with the site's trust for every user who views the page. Again, data is
treated as code.

**b) Explain the security impact on a victim user. [3 marks]**

The script runs inside the victim's logged-in session on that site. It can
steal session cookies or tokens and hijack the account. It can also perform
actions as the victim, read private page data, or show a fake login form or
redirect to malware.

**c) Recommend one prevention approach consistent with the output context.
[3 marks]**

Context-aware output encoding. Comments are placed in the HTML body, so
HTML-encode them on output (e.g. `<` becomes `&lt;`). The browser then
displays them as text instead of executing them. Use the framework's
automatic escaping, and apply the matching encoding for other contexts
(attributes, JavaScript, URLs). A Content Security Policy adds a second
layer.

### Scenario 3: IDS false positive (10 marks)

A network intrusion-detection system alerts on benign traffic during a
software deployment. Analysts spend time investigating but eventually
confirm there was no attack.

**a) Classify the alert and explain your reasoning. [3 marks]**

This is a false positive. The IDS raised an alert (a positive result), but
the traffic was benign deployment activity and no attack existed, so the
alert was wrong. The deployment traffic most likely matched a signature or
differed from the normal baseline.

**b) Explain the difference between a false positive and a false negative.
[3 marks]**

False positive: an alert is raised on benign activity. The cost is wasted
analyst time and alert fatigue. False negative: no alert is raised on a
real attack. The cost is an attack that goes undetected. False negatives
are usually more dangerous because nobody knows to respond.

**c) Explain why tuning a detector involves trade-offs rather than
eliminating all errors. [4 marks]**

A detector uses rules or thresholds to separate benign from malicious
activity, and the two overlap. Making it more sensitive catches more
attacks (fewer false negatives) but raises more false alarms. Making it
less sensitive reduces false alarms but misses more attacks. Both errors
cannot reach zero at once, and real attacks are rare, so even a small
false-positive rate produces many false alerts and causes alert fatigue.
Tuning is therefore a risk decision: balance the cost of a missed attack
against analyst capacity, e.g. suppress known deployment windows carefully
and rely on other layers for what is missed.

### Scenario 4: Defence in depth for software (10 marks)

An Internet-facing application uses input validation, parameterised
database access, authentication, least-privilege service accounts, logging
and patch management.

**a) Explain defence in depth using three controls from the scenario. [4
marks]**

Defence in depth means several independent layers, so that if one fails
another still protects the system. Input validation rejects malformed or
unexpected input at the entry point. Parameterised database access means
that if bad input still gets through, it cannot change the SQL.
Least-privilege service accounts mean that if an attacker still compromises
the application, what they can do is limited. (Logging then detects it, and
patching removes known holes.)

**b) Explain why no single listed control makes the application completely
secure. [3 marks]**

Each control covers only one type of threat. For example, parameterised
queries stop SQL injection but not XSS or stolen credentials. Any control
can also fail, be misconfigured or be bypassed, and patching cannot cover
unknown (zero-day) flaws. Security is only as strong as the weakest link,
and attackers choose the path that is not covered, so layers are needed.

**c) Identify one preventive and one detective control from the scenario.
[3 marks]**

Preventive: parameterised database access, which stops SQL injection before
it can happen. (Input validation, authentication, least privilege and patch
management are also preventive.)

Detective: logging, which records events so that attacks can be noticed,
alerted on and investigated.

### Scenario 5: Vulnerable dependency (10 marks)

A service uses an old third-party library with a publicly known
vulnerability. The application code itself contains no obvious flaw, so the
team delays updating the dependency.

**a) Explain why third-party components are part of software security. [3
marks]**

Library code runs inside the application with the same privileges and
access to the same data. A vulnerability in the library is therefore a
vulnerability in the service. Attackers do not care who wrote the code.
Most modern software is largely third-party code, including indirect
dependencies, so the supply chain is part of the attack surface (e.g.
Log4Shell).

**b) Explain how delayed patching can increase risk. [3 marks]**

The vulnerability is publicly known, so details and often ready-made
exploit code are available. Attackers scan the Internet automatically for
vulnerable versions, so little skill is needed. The longer the gap between
disclosure and patching (the window of exposure), the more likely the
service is exploited. Delay also makes the eventual upgrade harder.

**c) Recommend two lifecycle practices for managing vulnerable components.
[4 marks]**

1. Inventory and continuous scanning — keep a list of all components and
   versions (a software bill of materials), run automated dependency
   scanning in the build pipeline and watch vulnerability advisories, so
   the team learns quickly when a component is affected.
2. A defined patch-management process — set risk-based deadlines (e.g.
   critical fixes within days), test the update in staging, deploy with a
   rollback plan, and use compensating controls (e.g. a firewall rule or
   disabling the feature) when a patch cannot be applied immediately.
   Remove unused dependencies.

### Scenario 6: Secure defaults (10 marks)

A newly deployed administrative interface is reachable from the Internet
with a default account enabled and broad permissions. The team plans to
harden it later after users become familiar with the system.

**a) Identify two insecure-default problems in the scenario. [4 marks]**

1. Default account enabled with broad permissions. Default usernames and
   passwords are publicly documented and are the first thing attackers and
   bots try. Broad permissions mean one guess gives full control, which
   breaks least privilege.
2. Administrative interface exposed to the Internet. Anyone in the world
   can reach it and attack it with guessing or exploits. This is an
   unnecessarily large attack surface for something only administrators
   need.

**b) Explain why security should be designed before deployment rather than
added only after incidents. [3 marks]**

The system is vulnerable from the moment it is exposed. Automated scanners
find new Internet-facing services within hours, so "later" may be after a
compromise. Fixing after an incident costs far more than building security
in: breach response, redesign and reputational damage. An attacker may also
already have persistent access. Starting secure by default also means users
learn the secure way of working from day one, instead of habits that are
hard to remove.

**c) Recommend one access-control and one configuration improvement. [3
marks]**

Access control: disable or remove the default account and give each
administrator an individual account with a strong password, MFA and only
the permissions their role needs.

Configuration: take the administrative interface off the public Internet,
so it is reachable only through a VPN, internal network or IP allow-list,
and turn off unused features.
