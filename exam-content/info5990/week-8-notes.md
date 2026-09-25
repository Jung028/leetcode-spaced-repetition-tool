# INFO5990 Week 8 — Reader Notes (Security Management)

**Source material:**
- Lecture slides: `INFO5990 2026-S2 Week 08 - Security Management.pdf` (48 slides, titled "Part 1")
- Lecture video transcript: `Week 08 - Profession-s1-low.transcript.md` (whisper-cpp auto transcript, no speaker labels)
- Tutorial sheet: `INFO5990 2026-S1 Week 08 Tutorial sheet.pdf` (2 pages)
- No tutorial transcript/video exists for Week 8 (tutorials aren't recorded per the unit outline).

**IMPORTANT MISMATCH TO FLAG:** the Week 8 tutorial sheet is entirely about **Change Management** (Project Management vs. Change Management, McKinsey 7S / ADKAR / Kotter's 8-Step, and a BetaBank CRM adoption-failure case study) — a completely different topic from the Week 8 **lecture**, which is about **Security Management**. This is not a transcription error; the tutorial PDF genuinely covers change management. Treat the lecture paper and tutorial paper as two unrelated topics when this week is authored into questions.

**IMPORTANT COVERAGE GAP TO FLAG:** the lecture transcript stops partway through the slide deck. The recording covers the Agenda through **Cybercrime #7 (DDoS Attacks)**, and the lecturer explicitly says at the end: *"we mostly covered that... maybe in the next lecture I will start from APT... we have two lectures on the security."* This means the following slide sections exist in the PDF but were **never verbally discussed** in this recording — no worked examples, analogies, or verbal elaboration exist for them, only the bare slide text:
- Cybercrime #8 — Advanced Persistent Threats (APTs)
- Categories of Security Threats (5 categories) and "Factors making Organisations vulnerable" (the org-level version, distinct from the earlier "Factors contributing to Vulnerabilities" which *was* covered)
- "Factors that make Security Harder!"
- Individual Rights of Data (GDPR/CCPA/Privacy Act rights list)
- End of Lecture Questions (review slide)
- Case Study (healthcare ransomware) + Case Study based Questions

These are captured below (Section 1) since they're real, examinable slide content, but they are clearly marked as slide-only.

---

## 1. Important points from slides

### Introduction / why security matters
- Four real breach case studies opened the deck (all with infographic slides):
  - **ManageMyHealth (NZ, early 2025):** >1 million patient records breached (names, lab results, clinical notes, mental health assessments, prescriptions). Key security failures called out: insufficient endpoint detection (attack undetected for weeks) and lack of zero-trust network segmentation (attackers moved freely once inside).
  - **Kido International ransomware (2025):** Ransomware attack across **38 countries**, exposing data on **25,000+** children, parents, and employees (UK-based childcare/education provider). Key weaknesses: weak third-party vendor access controls, legacy system integrations, lack of strong network segmentation. Violated UK GDPR and Child Data Protection Regulations.
  - **Snowflake data breach (2024):** Compromised third-party credentials + lack of MFA + weak customer-side access controls exposed **500M+** customer records across dozens of client environments (Ticketmaster ~560M records affected, Santander financial data exposed). Root cause stated on slide: "Compromised Third-Party Credentials + Lack of MFA + Weak Customer Access Controls." Slide explicitly frames a **Shared Responsibility Model**: Snowflake (provider) is responsible for platform infrastructure/physical security/availability/core service protection; the customer is responsible for account security, access controls, MFA enforcement, data governance, monitoring/auditing.
  - **TJX Investigation (retail, US):** Timeline — 18 Dec 2006 suspicious software discovered; 17 Jan 2007 TJX reported unauthorised access to credit card data; Mar 2007 TJX admitted breaches may go back to July 2005 (potentially as far back as 2002 since data was stored unencrypted); **potentially 45.7 million accounts compromised**. Hackers sold 80GB of data; fake cards used for gift-voucher fraud; card-company losses of US$50–100 million. Six suspects arrested Mar 2007 (named, ages 18–40, bonds $1M each, charged with "organized scheme to defraud"). 8 May 2007: TJX revealed the fraud was likely via Wi-Fi — data was intercepted before encryption, and the thieves also had the encryption key. Sept 2007: Irving Escobar sentenced to 5 years. Oct 2007: TJX fined $880,000. Nov 2007: TJX settles with Visa for $40.9M (card reissue costs). Apr 2008: TJX settles with MasterCard for $13M. Aftermath: Aug 2008, 11 men charged with hacking nine US retailers incl. TJX; Mar 2010, hacker Albert Gonzalez pleaded guilty, sentenced to **20 years** — "the lengthiest punishment ever imposed for computer or identity theft crimes" (at the time); 8 May 2010, Ukrainian Sergey Storchark arrested in India.

### What is security?
- **Security** = the practice of protecting information systems (hardware, software, networks, data) from unauthorized access, misuse, disruption, or destruction.
- **3 dimensions of security in IT:**
  - **Physical Security** — protecting tangible infrastructure. Goal: prevent theft, damage, or physical tampering with assets.
  - **Digital/Information Security** — protecting data and digital systems from cyber threats. Goal: maintain confidentiality, integrity, and availability (CIA) of data.
  - **Operational Security** — protecting systems through processes, people, and policies. Goal: reduce risks from human error, insider threats, or weak processes.

### Security Management
- **Definition:** the process of identifying, implementing, monitoring, and continuously improving security measures to protect an organization's assets (physical and digital); ensures risks are managed systematically and security aligns with business objectives, compliance requirements, and operational needs.
- **Main goals:** Protect Confidentiality/Integrity/Availability (ICIA on slide); Ensure Business Continuity; Maintain Compliance and Legal Obligations; Build Trust with Users, Customers, and Stakeholders.
- **Key elements of Security Management (6 elements, matches the lifecycle):** Risk Assessment and Analysis (identify threats/vulnerabilities/potential impacts) → Policy and Governance (define security policies, standards, compliance frameworks — **ISO 27001, NIST, GDPR** named) → Implementation of Controls (technical, administrative, physical controls to reduce risk) → Monitoring and Detection (continuous monitoring of systems/networks/behaviors to detect anomalies) → Incident Response and Recovery (plans/procedures for containment, eradication, recovery, lessons learned) → Continuous Improvement (regular audits, penetration testing, red/blue team exercises, feedback loops).
- **Why security management matters in IT (7 reasons on slide):** Protection of Critical Assets; Mitigating Cyber Threats; Ensuring Business Continuity; Legal and Regulatory Compliance (GDPR, HIPAA, ISO 27001 named); Safeguarding Reputation and Trust; Managing Human Risk (phishing, weak passwords, negligence); Cost Avoidance (prevention costs less than the financial/operational impact of a breach).
- **The Security Management Lifecycle (continuous cycle, 6 steps):** 1. Identify Risks (understand assets, threats, vulnerabilities) → 2. Plan Controls (define policies, controls, response plans) → 3. Implement Controls (deploy technical, administrative, physical controls) → 4. Monitor & Detect (continuously monitor/detect suspicious activities) → 5. Respond & Recover (contain incidents, recover systems, minimize impact) → 6. Review & Improve (evaluate effectiveness, improve processes/controls/policies) → loops back to step 1 ("Continuous Improvement and Adaptation").

### Information Security (InfoSec)
- **Definition:** the practice of protecting information, in any form (digital, physical, or spoken), from unauthorized access, use, disclosure, disruption, modification, or destruction. Core goal: data remains **Confidential** (only authorized people/systems can access it), **Integrity-protected** (accurate, reliable, not improperly altered), and **Available** (accessible when needed).
- **The CIA Triad** — the foundational model for information security; three core principles every organization should protect:
  - **Confidentiality** — information accessible only to authorized individuals/systems. Prevents unauthorized access/disclosure. Techniques: encryption, access controls and permissions, multi-factor authentication (MFA).
  - **Integrity** — information is accurate, complete, and unaltered except by authorized actions. Prevents unauthorized modification/tampering. Techniques: checksums, hashes, audit logs, version control, data validation.
  - **Availability** — information and systems are accessible/usable when needed by authorized users. Prevents downtime, service disruptions, data loss. Techniques: backups, load balancing.
- **How threats impact the CIA Triad:**
  - Confidentiality threats → unauthorized access/disclosure. Examples: data breaches, eavesdropping, insider snooping, phishing attacks.
  - Integrity threats → unauthorized modification, corruption, or deletion of data. Examples: data tampering, malware/ransomware, man-in-the-middle attacks, insider fraud.
  - Availability threats → systems/data become unavailable to authorized users. Examples: DDoS attacks, hardware failures, power outages, natural disasters.
- **Domains of Information Security** (information security is the umbrella; these 4 sit within it):
  - **Cybersecurity** — protecting digital systems, networks, applications from unauthorized access/disruption/attack. Examples: firewalls, intrusion detection, antivirus/anti-malware, network security.
  - **Physical Security** — protecting the tangible assets supporting info systems (people, hardware, facilities). Examples: access control, surveillance, locks & barriers, environmental controls.
  - **Operational Security** — protecting processes, workflows, org practices to keep info safe. Examples: policies & procedures, change management, staff training, incident management.
  - **Data Security** — protecting the information itself, at rest/in transit/in use. Examples: encryption, data masking, backup & recovery, Data Loss Prevention (DLP).
- **Why InfoSec matters for IT professionals (4 reasons, each with sub-points):** Protecting Sensitive Data (IT pros are custodians of financial records, IP, personal data, client info — a breach causes financial loss, reputational damage, legal consequences); Legal and Regulatory Compliance (GDPR (EU), HIPAA (US), Privacy Act (Australia) — must design/maintain compliant systems or risk lawsuits/penalties); Enabling Trust and Reputation (a single lapse — e.g., data leak, ransomware — can undermine years of trust); Supporting Business Continuity (ensure availability via disaster recovery, backups, incident response — without planning, downtime = lost productivity/revenue/loyalty); **Defending Against Increasing Cyberthreats** — threat actors are more sophisticated, organized, and well-funded than ever; must stay ahead of phishing, social engineering, malware, ransomware, DDoS; security skills are essential in *every* IT role, not just "security specialists."

### Understanding Vulnerabilities
- **Factors contributing to Vulnerabilities** (this version — covered in the video):
  - **Human Factors:** weak passwords/password reuse; falling for phishing/social engineering; lack of awareness or training; insider threats (malicious or negligent employees).
  - **Technological Factors:** unpatched software and outdated systems; misconfigurations (firewalls, cloud storage, databases); weak encryption or lack of encryption; zero-day vulnerabilities in hardware/software.
  - **Organisational Factors:** lack of clear policies and governance; poor incident response planning; insufficient monitoring and auditing; over-reliance on third-party vendors without proper vetting.
  - **Physical/Environmental Factors:** insecure server rooms or data centers; theft or tampering with devices; natural disasters (floods, fires, earthquakes); power failures or inadequate redundancy.
  - **Process and Operational Factors:** inadequate access control (too many privileges); poor patch/change management processes.
- **The biggest security threat — Users:** despite all technical protections, humans are often the weakest link. Even the strongest firewalls, encryption, and monitoring can be bypassed if users make mistakes or act carelessly. Why users are a threat: **Human error** (sending sensitive info to the wrong recipient, misconfiguring systems, accidentally deleting data); **Poor password practices** (weak passwords, password reuse across accounts, sharing credentials); **Phishing and Social engineering** (falling for emails/calls/messages designed to steal credentials, clicking malicious links/downloading infected attachments); **Insider threats** (disgruntled employees intentionally misusing access).

### Cyber-Crimes
- **Definition:** cybercrimes are criminal activities that involve the internet, computers, networks, or digital devices; actions that violate laws by targeting information systems, data, or digital communications for malicious purposes. Can target individuals, organizations, or governments; often exploit technical vulnerabilities or human weaknesses. Prevention requires a combination of technical controls, policies, and user awareness.
- **8 named cybercrime types (each with a preventive-measures list):**
  1. **Identity Theft and Fraud** — stealing another person's personal info (name, Social Security/Tax ID, credit card, login credentials) to commit fraud (financial theft, unauthorized transactions, impersonation). Preventative measures: strong unique passwords + MFA; monitor accounts for suspicious activity; caution sharing personal info online/phone; shred sensitive documents before disposal; install antivirus/anti-malware.
  2. **Harassment and Cyber-bullying** — Harassment = repeated unwanted behavior intended to intimidate/threaten/disturb; Cyberbullying = harassment occurring online/via digital devices, targeting individuals with malicious intent. Both cause emotional/psychological/reputational harm. Preventative measures: acceptable use policies + online conduct rules; monitor platforms + enforce reporting mechanisms; train users to recognize/respond to harassment; legal/regulatory frameworks (e.g., cyber harassment laws in Australia).
  3. **Hacking and Unauthorised access** — gaining access to systems/networks/data/accounts without permission, or using legitimate access in an unauthorized way; ranges from a simple password guess to sophisticated intrusion campaigns. Preventative measures: strong password policies + mandatory MFA; least-privilege access + role-based access control (RBAC); regular security awareness training (phishing simulations); vendor/third-party risk assessments; Web Application Firewall (WAF) + input validation; encryption for data at rest and in transit.
  4. **Data Breaches** — sensitive/protected/confidential info accessed, disclosed, or stolen without authorization; can involve personal data (PII), financial records, trade secrets, IP. Preventative measures: encrypt data at rest and in transit; strong access controls (least privilege, RBAC); regular security awareness training; patch and vulnerability management; monitor and audit systems continuously; backup critical data + test recovery plans.
  5. **Malware** — malicious software intentionally designed to damage, disrupt, steal, or gain unauthorized access to systems/networks/data. Preventative measures: install/update antivirus/anti-malware software; keep systems and software patched and up-to-date; educate users on phishing and safe browsing practices; use firewalls and intrusion detection systems; backup critical data regularly and securely; restrict unnecessary administrative privileges.
  6. **Phishing and Social Engineering** — Social Engineering = manipulating/deceiving people to reveal confidential info or perform actions that compromise security; Phishing = a type of social engineering using emails/messages/websites to trick users into giving sensitive data (passwords, credit cards); key idea: attackers exploit human psychology, not just technical vulnerabilities. Preventative measures: user awareness and training (recognize suspicious emails/links/messages); MFA (prevents stolen credentials alone from being enough); email and web filters (block malicious content before it reaches users).
  7. **DDoS Attacks** — a Distributed Denial of Service (DDoS) attack aims to overwhelm a target (server, service, network) with traffic/requests from many distributed sources so legitimate users cannot access it; goal is disruption rather than data theft (though DDoS is sometimes used as a smokescreen for other attacks). Preventative measures: traffic scrubbing/scrubbing centres (third-party DDoS mitigation); rate limiting + upstream filtering with ISP cooperation; autoscaling with careful limits (helps absorb spikes but can be costly, must be coupled with filtering); load balancers + redundancy across regions; centralized logging, SIEM, real-time traffic monitoring.
  8. **Advanced Persistent Threats (APTs)** *(slide-only — not reached in this recording)* — a prolonged and targeted cyberattack in which an intruder gains unauthorized access to a network and remains undetected for an extended period; usually targets high-value assets (IP, financial data, government secrets). Preventative measures: continuous network monitoring, anomaly detection, endpoint detection; close known security gaps APTs might exploit; a detailed plan to detect, contain, and remediate intrusions; deploying least privilege, network segmentation, and MFA.

### Security Threats and Organisational Challenges *(slide-only — not reached in this recording)*
- **Categories of Security Threats (5):** security threats are potential events/actions that can compromise the CIA of information/systems; can be intentional, accidental, or natural.
  - Human-based: threats caused by people, deliberately or unintentionally.
  - Technical: threats exploiting hardware, software, or network vulnerabilities.
  - Physical: threats targeting the tangible infrastructure that supports IT.
  - Operational: threats arising from weak processes, policies, or operational failures.
  - External: threats from outside the organization's direct control.
- **Factors making Organisations vulnerable** (the org-level version — distinct from the "Factors contributing to Vulnerabilities" list above, which *was* covered verbally): organizations are vulnerable due to a combination of technical, human, operational, and environmental factors.
  - Human factors: lack of security awareness/training → phishing/social-engineering susceptibility; weak password practices → reuse, simplicity, sharing; negligence or mistakes → misconfigured systems, accidental deletion.
  - Technological factors: outdated software/unpatched systems → exploits available to attackers; use of legacy systems → incompatible with modern security standards.
  - Operational Factors: weak access control policies → excessive privileges, lack of role-based access; inadequate incident response and recovery plans.
  - Physical Factors: unprotected facilities → theft, tampering, or natural disasters; poor disaster recovery planning → inability to recover after an incident.
  - External Factors: third-party/vendor vulnerabilities → compromised suppliers can affect your systems; regulatory or legal changes → unprepared organizations may become non-compliant; market pressures → cutting corners on security due to cost or time constraints.
- **Factors that make Security Harder:** security in IT isn't just about technology — it's complex, dynamic, and multidimensional. Several factors make protecting systems/data increasingly difficult: rapid technological changes; increasing sophistication of attacks; human factors; complexity of IT environments; regulatory and compliance pressures; resource constraints; evolving threat landscape.

### Individual Rights of Data *(slide-only — not reached in this recording)*
- In the digital age, people have specific rights over their personal data (any info that identifies them — name, email, biometrics, financial info). Protected by laws (**GDPR, CCPA, Privacy Act 1988 in Australia**) and reflecting broader ethical principles.
- **The rights (7):**
  - **Right to be informed** — individuals must know how their data is collected, stored, used, shared; organizations must provide clear privacy notices (not hidden in fine print).
  - **Right of access** — individuals can request access to the personal data an organization holds about them; IT systems must support easy and timely data access requests.
  - **Right to rectification (correction)** — if data is inaccurate or incomplete, individuals have the right to correct it.
  - **Right to erasure (right to be forgotten)** — individuals can request their personal data be deleted if: it's no longer needed for the purpose it was collected; they withdraw consent; it was collected unlawfully. **Exception:** data needed for legal, contractual, or public interest purposes.
  - **Right to restrict processing** — individuals can limit how their data is processed (example given: pausing marketing emails while keeping an account active).
  - **Right to data portability** — individuals can request their data in a structured, machine-readable format (e.g., CSV, JSON); enables moving data between providers (e.g., switching banks, telecoms).
  - **Rights related to automated decision-making and profiling** — individuals can object to: direct marketing (ads, promotions); processing based on legitimate interests or public interest tasks. Organizations must stop processing unless they prove compelling legitimate grounds.

### End of Lecture Questions *(slide-only review questions — not verbally delivered in this recording)*
- Define security in the context of IT and explain its three main dimensions.
- What is security management and why is it important in IT organizations?
- List at least five factors that contribute to organizational vulnerabilities.
- Describe the CIA Triad and give a practical example for each element.
- Differentiate between phishing and social engineering.
- Explain the difference between a DDoS attack and an Advanced Persistent Threat (APT).

### Case Study *(slide-only — not verbally delivered in this recording)*
- **Scenario:** a mid-sized healthcare organization suffered a cyberattack. An employee clicked a phishing email link, which installed ransomware on several hospital servers. This caused temporary unavailability of patient records, and some sensitive patient data was also exposed. The attackers demanded payment to decrypt files.
- **Case Study based Questions:**
  - Identify which CIA Triad elements were impacted and explain how.
  - Discuss the human, technological, and operational factors that contributed to this breach.
  - Propose at least five preventive measures that could have mitigated this attack.
  - What incident response steps should the organization take immediately after detecting the attack?
  - Which legal and ethical considerations must the organization address post-attack?

### Tutorial sheet content (Change Management — different topic from the lecture)
- **Objective:** apply change management concepts to real-world IT projects; deepen understanding of the difference between Project Management (PM) and Change Management (CM); explore the psychology of change and adoption; practice using McKinsey's 7S, ADKAR, and Kotter's 8-Step models; develop critical thinking on how effective change management translates into business outcomes, IT adoption, long-term organizational success.
- **Learning outcomes covered:** LO3 (wider IT professional-practice issues / HR trends), LO4 (impact of IT on individuals/organizations globally), LO5 (written/oral communication skills incl. conflict resolution, negotiation, team formation, leadership, team dynamics).
- **Part A — Knowledge Check (discussion questions, no answers provided on the sheet):**
  - What is the difference between Project Management (PM) and Change Management (CM) in IT projects?
  - Why do organizations need change management even if the project is delivered on time and within budget?
  - Briefly explain one change management model (McKinsey 7S, ADKAR, or Kotter's 8-Step) and when it would be most useful.
- **Part B — Case Study Discussion: BetaBank.** BetaBank, a mid-sized retail bank, is implementing a new CRM system to improve customer service and enable data-driven marketing.
  - Background facts: the IT team is excited about the system's AI-driven analytics; Project Managers are confident the system will go live on time; branch staff worry the CRM is too complex and will slow down customer interactions; marketing staff don't understand how the new system differs from their current spreadsheets; after the pilot phase, **adoption rates are only 30%**, with many employees reverting to old tools; the CEO is frustrated: "We've spent **$5 million**, but the results are not visible."
  - Discussion questions: At which stages of the change curve might the branch staff and marketing team be? What psychological barriers are visible in this case? Which change management model would you apply here? Why? What are the potential risks to business outcomes if the CRM adoption continues to fail? Suggest three specific interventions the Change Management team could take in the next 3 months to improve adoption.

---

## 2. Important points only in the video (not on the slides)

- **Framing device (repeated multiple times):** security is described as a "complex process" with "no one switch" — it depends on multiple interlinked components: the internet (called "the most unsecured/untrusted network"), an organization's network devices (routers, switches, Wi-Fi routers), servers, hardware, software, protocols, and — critically — humans. Analogy used: a building with multiple entry gates — over-securing one gate while neglecting the others doesn't help; all gates need equal security.
- **Verbally-cited statistic (not on slides):** a survey found that in security incidents, there's a **70% chance** someone from *inside* the organization is involved, intentionally or unintentionally.
- **Historical framing (not on slides):** ~15–20 years ago, security was treated as a "nice to have," not a primary requirement; it has since become one of the fundamental/must-have professional practices in IT. Lesson drawn: security must be designed in from the *start* of a project, not bolted on midway or after an incident.
- **Interview-scenario teaching device:** the lecturer frames a mock job-interview scenario ("you're good at security — how would you secure our organization?") to teach a generic, always-safe answer: *"I will implement / verify the security fundamentals in your systems."* Follow-up "what are the fundamentals?" leads into the CIA Triad. This framing (a job-interview answer script) does not appear on any slide.
- **CIA Triad name origin (verbal only):** attributed to **NIST** — the (US) National Institute of Standards and Technology, described as a US-based standards body. (Note: the auto-transcript garbles "Confidentiality"/"Continuity" a few times — cross-checked against the slides, the triad is Confidentiality–Integrity–Availability.)
- **Postman analogy for Confidentiality (used twice, not on slides):**
  - *Version 1:* a postman, curious, opens a plain-English personal letter, reads and understands its private contents, then reseals and delivers it → **confidentiality is compromised**, because an unauthorized party understood the private information.
  - *Version 2:* the sender switches to writing in code words. The postman opens the letter again, reads the coded words but does **not** understand them, then reseals and delivers it → **confidentiality is NOT compromised** — merely accessing protected information isn't a breach; a breach requires the unauthorized party to actually *understand/decode* it. Digital parallel drawn: encrypted data traveling over the (inherently untrusted) internet is fine — confidentiality is only compromised if someone can actually decrypt it.
- **Aside on decision-making (tangential, not on slides):** while polling the class on the postman scenario, the lecturer digresses into a leadership/interview point: in leadership-track interviews, given ambiguous information and asked to decide, refusing to decide is treated as the *worst* possible response — worse than deciding and being wrong. Students are encouraged to always form and state an opinion when given information, because interviewers are testing decisiveness as much as correctness.
- **"Which CIA element is most important?" — context-dependent answer (elaborated verbally, not spelled out this explicitly on slides):** all three matter overall, but relative priority depends on the system: for **financial/banking systems**, Integrity is most critical (e.g., mis-adding/removing a zero could turn a $10,000 balance into $100,000 or $100); for **healthcare/hospital systems**, Availability/Continuity is most critical (patient data/treatment info must always be accessible).
- **"Why call it a Triad?" (verbal elaboration):** it's shown as a triangle because all three fundamentals must be implemented *together* — like three pillars holding up a building. If even one pillar (C, I, or A) is weak, the whole security "building" collapses, regardless of how strong the other two are.
- **DoS analogy (not on slides):** compared to someone repeatedly knocking on the lecture-room door — the lecturer must keep answering it instead of teaching, i.e., "denying the [teaching] service" to the class.
- **DoS vs DDoS distinction (verbal elaboration):** DoS = one attacking system vs. one target; DDoS = many systems from many different locations attacking one target simultaneously — DDoS is described as more dangerous due to combined scale.
- **Mechanism call-outs (verbal, brief, not detailed on slides):** hashing named as the typical mechanism for implementing Integrity; encryption repeatedly named as the go-to mechanism for Confidentiality.
- **ISO 27001 career aside (not on slides):** described as a UK-based standards body certification; becoming an "information security auditor/implementer" typically requires about 5 days of training from an authorized ISO training provider plus an exam; described as not especially difficult (assuming a security background); the lecturer mentions personally completing this certification "5-6 years ago."
- **Market-value aside (not on slides):** information security experts are described as more in-demand/valuable than narrowly-scoped "cyber security" experts, because InfoSec expertise is broader — covers policy-writing and incident-response planning across *all* possible scenarios, not just machine-level protection.
- **Fire-drill / incident-response worked example (not on slides):** a building fire-alarm evacuation procedure is used as an analogy for incident response planning. Rather than everyone running, a floor monitor/leader is assigned per floor and everyone proceeds to a designated assembly point — specifically because a false fire alarm could otherwise be exploited by someone to slip into a server room and tamper with critical systems while everyone else evacuates.
- **Zero-day vulnerability, explained verbally (slide only names it, doesn't define the mechanism):** a brand-new vulnerability that has just appeared, for which existing antivirus/security systems have no prior signature/training data — so it isn't yet recognized as malicious.
- **Malware hierarchy, explained verbally:** malware ("malicious software") is the generic/umbrella term; viruses, Trojans, and macros are named as sub-categories; anti-malware/antivirus tools work by scanning code for known malicious "bit patterns" and blocking matches.
- **Australian federal-vs-state regulation aside (not on slides):** Australia has both federal and state-level cyber/privacy rules; NSW and Queensland are given as an example of states that can have different specific rules under the same general theme — a caution to consider the *specific state* when designing/deploying software, not just federal law.
- **Ethical hacking course aside (not on slides):** the university's own "ethical hacking" course is mentioned — students practice attacker techniques legally by hacking their *own* virtual machines within one physical system, rather than real external targets.
- **Least-privilege example grounded in the students' own context (not on slides):** logging into a University of Sydney (USYD) student account grants only limited privileges (e.g., browsing is allowed, installing certain software is not) — used as a live, relatable example of least-privilege access control.
- **Risk formula given verbally (not on slides):** Risk = Vulnerability × Threat.
- **Multi-layer/defense-in-depth analogy (not on slides):** security compared to having three sequential gates/doors — breaking through one or two still leaves another; more layers = more security, though a sufficiently determined attacker can still eventually succeed.
- **Explicit pacing/coverage note at the end:** the lecturer states this recording did not fully reach Advanced Persistent Threats (APT) and that APT will be picked up "in the next lecture," described as the second of two lectures on security management. (This is why APT onward, in Section 1 above, is marked slide-only.)

---

## 3. Lecture-quiz questions (verbatim, with the lecturer's answers)

These are the questions the lecturer put to the class during the recording (rhetorical-then-answered, or actual live prompts/polls). All facts each question depends on are included inline.

**Q1.** "Can anybody tell me the difference between cyber security... How cyber security is different from data security or information security?"
**Answer given:** Cybersecurity = protecting machines/hardware (servers, switches, routers, Wi-Fi devices, laptops, phones) from digital threats. Physical security = protecting the physical premises/tangible assets (e.g., server room doors, network cabling) — even perfect cybersecurity is worthless if someone can just physically walk in and take the server, or cut its cable. Information security is the overarching/umbrella term; cybersecurity, physical security, operational security, and data security are all sub-domains sitting within it.

**Q2.** Interview scenario: "If I ask you — you look good in security, how are you going to secure my organization? How are you going to protect our systems?" (posed as: you don't know the org's specific systems, and the interviewer won't tell you.)
**Answer given:** The generic, always-safe answer is *"I will implement (or check/verify) the security fundamentals in your systems."* When the interviewer follows up with "what are the security fundamentals?", the answer is the three CIA Triad fundamentals — Confidentiality, Integrity, Availability. (The term "CIA" comes from NIST, the US National Institute of Standards and Technology.)

**Q3 (poll — show of hands).** Postman scenario #1: a postman, out of curiosity, opens a personal letter written in plain English, reads and understands its private content (e.g., a meeting time), then reseals the envelope and delivers it as normal. "In this scenario, is confidentiality compromised?"
**Answer given:** Yes — confidentiality is compromised, because an unauthorized person understood private information that was meant only for the recipient.

**Q4 (poll — show of hands).** Postman scenario #2: after the first incident, the sender switches to writing the letter using code words instead of plain English. The same postman opens the letter again, reads the coded words, but does not understand them, then reseals and delivers it. "Is confidentiality compromised or not compromised in this case?"
**Answer given:** No — confidentiality is **not** compromised. Simply gaining access to protected information is not itself a breach; a breach only occurs when the unauthorized party actually understands/decodes the content. (Digital parallel given by the lecturer: on the internet — "the most unsecured, most untrusted network" — anybody can technically get hold of encrypted data in transit; confidentiality is only compromised if someone can actually decrypt it.)

**Q5 (poll — show of hands, deliberately open-ended).** "Which is more important — continuity [availability] or integrity?"
**Answer given:** All three CIA fundamentals matter overall, but which one is *most* important depends on the specific system: for **financial/banking systems**, Integrity is most critical — e.g., adding or removing a single zero could turn a $10,000 balance into $100,000 or $100. For **healthcare systems**, Availability/Continuity is most critical — patient data (diagnoses, treatment info) must always be accessible. (The lecturer also used this question to make a side point: when given information and asked to decide, refusing to pick an answer is treated as the worst possible response — worse than picking and being wrong — because it signals an inability to make decisions.)

**Q6.** "How can availability be compromised? Can anybody tell me?"
**Answer given:** Through a **Denial-of-Service (DoS) attack** — e.g., a server like Gmail is kept so busy responding to an attacker's flood of requests that it can't respond to legitimate users — or through a **physical security failure**, such as someone physically stealing the server or cutting its network cable. Either way, the service becomes unavailable to legitimate/authorized users.

**Q7.** "Why do we call it the CIA Triad — why show it as a triangle?"
**Answer given:** Because all three fundamentals (Confidentiality, Integrity, Availability) must be implemented *together*, like three pillars holding up a building. If even one pillar is weak or missing, the whole security "building" collapses — even if the other two pillars are strong.

**Q8.** "What is a vulnerability in security?"
**Answer given:** A weak point or loophole in a system. Analogy: a building with hundreds of small windows — if even one window is broken, an attacker can get in, no matter how secure every door is.

**Q9.** "What is the difference between denial of service and distributed denial of service?"
**Answer given:** DoS = one attacking system overwhelming one target. DDoS = many systems, from many different locations, attacking one target at the same time. DDoS is described as more dangerous because of the combined volume/scale from multiple sources.

**Q10.** "What is zero-day vulnerability? Can somebody tell me?"
**Answer given:** A brand-new vulnerability that has just appeared/been discovered, for which existing antivirus/security systems have no prior information or signature — so the system doesn't yet recognize the associated malicious code as a threat.

**Q11.** "What does 'control' mean in security? What is a control?"
**Answer given:** A control is, in effect, a "solution" implemented to address a security risk. Types given: **technical controls** (e.g., encryption, access control), **administrative controls** (policies governing how systems should be used), and **physical controls** (e.g., a locked/electronically-secured server room).

**Q12.** "What is access control in security?"
**Answer given:** The process/mechanism governing how someone is allowed to access a system — e.g., requiring a strong password and multi-factor authentication (MFA) to log in. Tied to the **least-privilege** principle: users are granted only the specific permissions they need (example given: a University of Sydney student account allows browsing but not installing certain software).

**Q13.** "What is Malware if I ask you?"
**Answer given:** Malware ("malicious software") is a generic/umbrella term for any piece of code intentionally designed to do something harmful to a system. Viruses, Trojans, and macros are all sub-categories of malware. Anti-malware/antivirus tools work by scanning code for known malicious "bit patterns" and blocking anything that matches a known-bad pattern.

### Slide-only review/quiz questions (present in the deck, but the recording ends before reaching them — not verbally delivered in this recording)

**"End of Lecture Questions" slide:**
- Define security in the context of IT and explain its three main dimensions.
- What is security management and why is it important in IT organizations?
- List at least five factors that contribute to organizational vulnerabilities.
- Describe the CIA Triad and give a practical example for each element.
- Differentiate between phishing and social engineering.
- Explain the difference between a DDoS attack and an Advanced Persistent Threat (APT).

**"Case Study" + "Case Study based Questions" slides** (scenario: a mid-sized healthcare organization suffered a cyberattack after an employee clicked a phishing email link that installed ransomware on several hospital servers, causing temporary unavailability of patient records and exposing some sensitive patient data; attackers demanded payment to decrypt files):
- Identify which CIA Triad elements were impacted and explain how.
- Discuss the human, technological, and operational factors that contributed to this breach.
- Propose at least five preventive measures that could have mitigated this attack.
- What incident response steps should the organization take immediately after detecting the attack?
- Which legal and ethical considerations must the organization address post-attack?

---

## 4. Post-lecture Q&A

No distinct informal "post-lecture" teacher/student discussion tail exists in this recording. The transcript's interactive back-and-forth (rhetorical questions, hand-raise polls, "can anybody tell me…" prompts) is woven throughout the formal lecture content itself (captured in Section 3 above), not separated out into an end-of-recording informal discussion. The recording ends immediately after the DDoS Attacks slide with the lecturer summarizing what was covered ("today we covered the most important part of your security management... security is all about basic fundamentals of information security") and a direct sign-off: *"In the next lecture we will cover some of this part in the next lecture which is also on the security. We have two lectures on the security. Thank you and I will see you next week."* There is no separate exam-hint or misconception-correction exchange after this point to report.

**One coverage/exam-relevance note worth carrying forward (stated directly, not just implied):** the lecturer explicitly frames this as "Part 1" of two lectures on Security Management, and states APT and everything after it will be covered "in the next lecture." Any Week 8 lecture paper should treat APT, the org-level threat-category material, "Factors that make Security Harder," Individual Rights of Data, and the Case Study as real (slide-sourced) content, but should not attribute any verbal emphasis/worked-example weighting to them the way the earlier CIA Triad / cybercrime-types material received.
