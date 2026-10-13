import type { ExamPaperSeed } from "../types";

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 9,
  paperNumber: 1,
  title: "Week 9 Lecture: Ethics and Incident Response",
  topics:
    "Week 9 lecture (ethics and incident response). Cybersecurity as a system of people, processes, technology and law; prevention versus preparedness. Ethics: can we (technical) versus may we (legal) versus should we (ethical); five principles — honesty, privacy, confidentiality, accountability, professional responsibility. ACS Code of Professional Ethics (honesty, trustworthiness, respect) and its four practical test questions. ACM Code of Ethics (contribute to human wellbeing, avoid harm, be honest and fair, respect privacy and confidentiality) and how responsibility grows with authority and scale. Responsible disclosure (verify, report, coordinate, disclose). Ethical dilemmas with no risk-free answer (ransomware payment, employee monitoring). Cambridge Analytica as a systemic ethical failure. Law versus standard versus framework. Australian Privacy Act, the Australian Privacy Principles, APP 11, and the Notifiable Data Breaches scheme. Cybercrime (unauthorised access, malware, identity theft, authorisation covering person/system/purpose/method/time). ISO/IEC 27001 (context, risk, controls, assurance) and the NIST Cybersecurity Framework (identify, protect, detect, respond, recover, and Govern in CSF 2.0). Security incidents: event versus alert versus incident versus data breach; severity classification. The incident response lifecycle (preparation, detection, containment, eradication, recovery, lessons learned) as a cycle, not a one-time fix. The incident response team as a decision network (incident commander, technical leads, business and risk, communications). Containment (short-term, evidence, strategic) as a risk decision. Eradication (remove, remediate, verify), recovery (prioritise, restore, monitor) and lessons learned (timeline, decisions, improvements, blameless review). Preserving digital evidence and audience-specific incident reporting. Business continuity versus disaster recovery, RTO and RPO. Case simulation: Harbour University ransomware incident from detection through containment, eradication, recovery and post-incident review. Brief mixed review of threat modelling and attack surface, and of hash versus HMAC versus digital signature, from supplementary recap recordings.",
  sourceFiles: [
    "lecture/INFO5995 Week 9 Ethics and Incident Response.pdf",
    "lecture/INFO5995 Week 9 Extra Resources.pdf",
    "lecture/GMT20261002-014311_Recording.transcript.vtt",
    "lecture/GMT20261002-031415_Recording.transcript.vtt",
    "lecture/GMT20261002-034437_Recording.transcript.vtt",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Security is a system, not a tool",
      body: "Think of keeping a building safe. A good lock on the front door matters, but so does the guard who checks it every night, the rulebook that says who is allowed where, and the local laws about reporting a break-in. Cybersecurity works the same way.\n\n• People: who decides, communicates and notices the alert nobody else saw.\n\n• Processes: the rulebook, who may escalate, how evidence is handled.\n\n• Technology: firewalls, detection tools and recovery systems, only one piece of the whole picture.\n\n• Law: the duties around privacy and reporting that apply no matter how good the technology is.\n\n• A question is technical when it asks can we do this, legal when it asks may we, and ethical when it asks should we.",
    },
    {
      beforeQuestion: 6,
      title: "Wider codes, harder dilemmas",
      body: "Two professional codes guide IT decisions. One is about honesty, trustworthiness and respect toward the people a professional deals with directly. The other zooms out further, to everyone affected by computing, even people who never touched the system.\n\n• Avoid harm means thinking about ripple effects, not just the direct hit, a fix for one system can knock out a hospital's shared service.\n\n• Responsible disclosure is the professional way to report a found weakness: verify it safely, report it through the right channel, coordinate a fix, then disclose proportionately, never for publicity.\n\n• An ethical dilemma rarely has a risk-free answer, paying a ransom or monitoring staff both trade one risk for another.\n\n• Cambridge Analytica shows an ethical failure is rarely one broken part, consent, honesty, accountability and power all failed together.",
    },
    {
      beforeQuestion: 15,
      title: "Law, standard, framework",
      body: "Three words get mixed up constantly: law, standard and framework. They are not the same tool.\n\n• Law: sets what you must do, a binding duty, like Australia's Privacy Act. Break it and there are legal consequences.\n\n• Standard: sets what can be audited, like ISO 27001, a certifiable set of requirements an assessor can tick off.\n\n• Framework: organises how you think about the problem, like the NIST Cybersecurity Framework, a shared language rather than a rulebook.\n\n• None of them replaces the others. A mature organisation uses a framework to organise its improvement, a standard to prove its discipline, and the law to know its non-negotiable duties.",
    },
    {
      beforeQuestion: 17,
      title: "Privacy duties and cybercrime",
      body: "Imagine a diary you are trusted to look after for someone else. You should only read the pages you need, only share them with permission, lock the diary up properly, and shred it once nobody needs it anymore.\n\n• Collect, use and disclose, secure, and delete, the four duties organisations have for personal information under Australia's privacy rules.\n\n• APP 11 is the security duty: take reasonable steps against misuse, loss or unauthorised access, what counts as reasonable depends on the risk.\n\n• Not every leak is notifiable, only an eligible breach, where a reasonable person would expect likely serious harm that remedial action has not prevented, must be reported.\n\n• Cybercrime does not require breaking encryption, entering a system or account without the right permission for the person, purpose, method and time is enough.",
    },
    {
      beforeQuestion: 23,
      title: "Standards and frameworks keep working",
      body: "A gym membership is not useful unless you actually go and the trainer checks your form regularly. A standard works the same way, it is not a one-off checklist.\n\n• ISO 27001 builds an ongoing system: understand the organisation's context, assess risk, apply proportionate controls across people, process and technology, then keep monitoring, auditing and improving.\n\n• NIST's Cybersecurity Framework gives five operational functions, identify, protect, detect, respond, recover, a shared way to talk about the whole cyber lifecycle.\n\n• The newer 2.0 version adds a sixth function, Govern, that sits across all the others, setting strategy, policy, roles and oversight for everything else to run inside.",
    },
    {
      beforeQuestion: 26,
      title: "A ladder of seriousness",
      body: "Not every strange thing a computer does is a crisis. There is a ladder of seriousness.\n\n• Event: anything observable in a system, on its own, meaningless.\n\n• Alert: a tool or person flags that event as worth a look.\n\n• Incident: the flagged activity actually threatens confidentiality, integrity, availability or policy, and needs a coordinated response.\n\n• Data breach: specifically, personal information has been lost, accessed or disclosed without authorisation.\n\n• Severity then decides how big the response is, malware on one laptop gets handled by IT support, but an enterprise-wide ransomware attack pulls in executives and regulators.",
    },
    {
      beforeQuestion: 30,
      title: "Responding like a trained team",
      body: "Firefighters do not just show up and spray water. They train beforehand, confirm it is really a fire, stop it spreading, put it out properly, then check the building is safe, and afterwards they review what happened.\n\n• The six-stage cycle: preparation, detection, containment, eradication, recovery, lessons learned, and real incidents loop back between stages rather than running in a straight line.\n\n• Incident response is a team sport: an incident commander sets priorities, technical leads handle the systems, business and risk roles own the bigger decisions, and communications handles the outside world.\n\n• Containment buys time, short-term moves like isolating a host, evidence capture like preserving logs, and a longer strategic fix like segmenting the network, while treating speed versus harm as a risk decision.",
    },
    {
      beforeQuestion: 35,
      title: "Finishing the job properly",
      body: "Pulling a muddy footprint off the carpet does not mean the broken window is fixed, and switching the lights back on does not mean the building is actually safe again.\n\n• Eradication removes the cause, not just what you can see, the malware, any rogue accounts, and the unpatched hole that let the attacker in, then verifies nothing was missed.\n\n• Recovery is complete only when services are stable, trusted and supported, not merely switched back on.\n\n• Lessons learned means rebuilding the timeline, reviewing which choices helped or hurt, and turning that into named owners and deadlines, a blameless review still expects someone to actually fix things.\n\n• Preserving evidence and reporting to the right audience in the right language both run alongside every one of these stages, not just at the end.",
    },
    {
      beforeQuestion: 41,
      title: "Keeping going versus getting the tech back",
      body: "If the office floods, business continuity is the plan that gets staff working from a spare room with pen and paper. Disaster recovery is the plan that gets the actual computer systems back up.\n\n• Business continuity asks how the organisation keeps its most important outcomes running during disruption, using workarounds like alternate staff, sites or manual processes.\n\n• Disaster recovery is the technical side, restoring platforms, data and infrastructure using backups, replication and rebuilds.\n\n• Recovery time objective, RTO, is how fast a service must be restored; recovery point objective, RPO, is how much data loss is acceptable.\n\n• A backup is only a real recovery capability once restoring from it has actually been tested.",
    },
    {
      beforeQuestion: 44,
      title: "A university's bad morning, and two quick recaps",
      body: "A university wakes up to a ransomware attack, and every decision from here is a trade-off, not a clean answer. We also circle back briefly to two earlier topics raised again in extra review recordings: mapping a system's attack surface, and choosing between a hash, an HMAC and a digital signature.\n\n• The case: alerts spike, shares go inaccessible, encryption behaviour is detected, then a privileged account starts deleting snapshots, each stage forces a decision about speed, evidence and business impact.\n\n• Attack surface reminder: it is just an opportunity to interact with a system, it only becomes a vulnerability if there is an actual weakness there to exploit.\n\n• Hash, HMAC and digital signature all protect integrity, but solve different trust problems, only a digital signature lets strangers verify a message without ever holding the signing secret.",
    },
  ],
  questions: [
    // ---------- Round 1: system view and the three questions (0-2) ----------
    {
      type: "mcq",
      prompt:
        "A university spends heavily on firewalls and detection tools but has no policy on who can authorise shutting down a critical server during an attack. Why can this still leave the organisation exposed?",
      options: [
        "Cybersecurity is a system of people, processes, technology and law together, and a weak link in any one of them can undermine the whole response",
        "Firewalls and detection tools are the only layer that matters, and policy questions belong to a separate department entirely",
        "Technology spending alone always guarantees protection, so the missing policy is a minor administrative detail",
        "Once enough money is spent on technology, people and process failures stop being able to cause real harm",
      ],
      correctIndex: 0,
      modelAnswer:
        "A car can have airbags, anti-lock brakes and a reversing camera, but if nobody agreed who is allowed to grab the wheel in an emergency, all that technology still will not stop a crash.\n\n• The system view: cybersecurity rests on people, processes, technology and law together, not technology bought off a shelf.\n\n• What went missing here: a process gap, nobody has clear authority to make a fast, high-stakes decision during an incident.\n\n• Why it matters: a strong technical control can still fail if a person ignores an alert, or if nobody is allowed to act on it in time.\n\n• Why the other options are wrong: spending on technology does not remove the need for people and process, and policy is not a separate department's problem once an incident is live.\n\nSo the answer is: a weak link in people, process, technology or law can undermine the whole response, no matter how much is spent on tools alone.",
    },
    {
      type: "mcq",
      prompt:
        "A security team realises they are technically capable of secretly monitoring every employee's personal messages on the company network, and company policy does not forbid it. Which single question are they still missing, and what kind of question is it?",
      options: [
        "Who pays for this, a budget question that determines whether the monitoring tool can be purchased",
        "Can we do this, a technical question that has already been answered by confirming the capability exists",
        "Should we do this, an ethical question about whether the action is right, even though it is technically possible and currently permitted",
        "May we do this, a legal question that is identical to asking whether it is the ethical choice",
      ],
      correctIndex: 2,
      modelAnswer:
        "Being able to pick a lock, and not being told not to, does not make it right to walk into someone's house.\n\n• Can we: a technical question, is the organisation capable of doing it.\n\n• May we: a legal question, is it permitted by law or policy.\n\n• Should we: an ethical question, even if something is technically possible and currently allowed, is it still the right thing to do.\n\n• Why the other options are wrong: the capability question has already been answered, legal permission is a separate test from ethics rather than the same thing, and budget is not part of this three-question framework at all.\n\nSo the answer is: the missing question is should we, which is an ethical question, separate from what is technically or legally possible.",
    },
    {
      type: "match",
      prompt: "Match each of the five ethical lenses from the lecture to the professional choice it describes.",
      pairs: [
        { left: "Honesty", right: "Describing risks, limitations and mistakes truthfully, even when the news is bad" },
        {
          left: "Privacy",
          right: "Collecting and using only what people would reasonably expect, not everything technically available",
        },
        {
          left: "Confidentiality",
          right: "Protecting information that has been entrusted, so it is not exposed to those who should not see it",
        },
        {
          left: "Accountability",
          right: "Owning a decision and its consequences, rather than deflecting blame once something goes wrong",
        },
        {
          left: "Professional responsibility",
          right: "Maintaining competence and escalating when safety or the public interest is at risk",
        },
      ],
      modelAnswer:
        "Five lenses, one job, checking a decision from different angles before it is made, the way a jeweller turns a stone to check it from every side.\n\n• Honesty: truthful about risk, uncertainty and mistakes, not just good news.\n\n• Privacy: collect and use only what people reasonably expect, not everything that could technically be gathered.\n\n• Confidentiality: protect information entrusted to you from unauthorised exposure.\n\n• Accountability: own the decision and its consequences.\n\n• Professional responsibility: stay competent, and escalate when something bigger than you is at risk.\n\nSo the answer is: honesty is truthful disclosure, privacy is collecting only what is expected, confidentiality is protecting entrusted information, accountability is owning the decision, and professional responsibility is competence plus escalation.",
    },
    // ---------- Round 2: the ACS code (3-5) ----------
    {
      type: "mcq",
      prompt:
        "A new graduate says the ACS Code of Professional Ethics is basically a checklist: tick honesty, trustworthiness and respect, and any decision is automatically fine. What is the best correction?",
      options: [
        "The code is actually a legal contract, and breaking it results in criminal prosecution rather than professional consequences",
        "The code is only relevant once an incident has already happened, not during everyday technical decisions",
        "The code only applies to senior staff, so a graduate does not need to apply it to their own decisions",
        "The code describes the character expected of a professional when judgement is difficult or contested, not a box-ticking checklist",
      ],
      correctIndex: 3,
      modelAnswer:
        "A list of house rules pinned to a fridge does not make someone a good housemate, what matters is how they act when a rule does not clearly cover the situation.\n\n• What the ACS code actually is: honesty, trustworthiness and respect describe the character expected of a professional, especially when a judgement call is hard or contested.\n\n• Why it is not a checklist: ticking three boxes does not replace thinking through who is affected and what is being claimed.\n\n• Why the other options are wrong: the code applies to every IT professional including graduates, breaching it is a professional ethics matter rather than automatically a crime, and it is meant to guide everyday decisions, not only post-incident ones.\n\nSo the answer is: the code describes expected professional character for difficult judgement calls, not a box-ticking checklist.",
    },
    {
      type: "mcq",
      prompt:
        "Before deploying a new monitoring tool, a team asks themselves whether they could document their reasoning and accept independent scrutiny of this decision. Which of the ACS four practical test questions are they applying?",
      options: ["What must be protected", "What are we claiming", "Can I defend this", "Who is affected"],
      correctIndex: 2,
      modelAnswer:
        "It is the difference between doing something quietly and being willing to explain it out loud to someone who disagrees with you.\n\n• Who is affected: asks about direct and indirect people, not just the obvious user.\n\n• What are we claiming: asks you to separate evidence from assumptions and pressure.\n\n• What must be protected: asks about privacy, safety, confidentiality and public confidence.\n\n• Can I defend this: asks whether the reasoning could survive documentation and independent review.\n\nSo the answer is: can I defend this, the test about documenting reasoning and accepting scrutiny.",
    },
    {
      type: "order",
      prompt: "Put the ACS Code's four practical test questions in the order the lecture presented them.",
      steps: [
        "Who is affected?",
        "What are we claiming?",
        "What must be protected?",
        "Can I defend this decision?",
      ],
      modelAnswer:
        "Think of it as widening the lens before you commit to a shot, first see who is in the frame, then check what you can actually say is true, then check what is fragile and needs protecting, and only then decide if you could show the photo to anyone.\n\n• Step 1: who is affected, including indirect users and future stakeholders.\n\n• Step 2: what are we claiming, separating evidence from assumption and pressure.\n\n• Step 3: what must be protected, covering privacy, safety, confidentiality and public confidence.\n\n• Step 4: can I defend this, the final check before acting.\n\nSo the answer is: who is affected, what are we claiming, what must be protected, then can I defend this.",
    },
    // ---------- Round 3: the ACM code (6-8) ----------
    {
      type: "mcq",
      prompt:
        "To stop an attacker, a response team disconnects a shared server. This also knocks a hospital wing's patient monitoring system offline for six hours, something the team had not checked before acting. Which ACM principle does this best illustrate, and how?",
      options: [
        "Be honest and fair, because the team did not tell the hospital the truth about what they were doing",
        "Contribute to human wellbeing, because stopping the attacker always counts as contributing to wellbeing",
        "Respect privacy and confidentiality, because patient records were technically exposed during the outage",
        "Avoid harm, because the team failed to anticipate an indirect, cumulative effect of their containment action",
      ],
      correctIndex: 3,
      modelAnswer:
        "Turning off a single shared power switch to stop one faulty appliance from sparking can also plunge an entire ward into darkness if nobody checked what else was plugged into it.\n\n• Avoid harm: computing professionals must anticipate direct, indirect and cumulative impacts, not just the immediate target.\n\n• What happened here: a technically correct containment action caused real harm nobody had checked for in advance.\n\n• Why the other options are wrong: nothing suggests a privacy breach or dishonesty happened, and contributing to wellbeing is undermined, not automatically satisfied, when harm like this goes unchecked.\n\nSo the answer is: avoid harm, because an indirect and cumulative impact was not anticipated before acting.",
    },
    {
      type: "multi",
      prompt:
        "Select all statements that correctly describe how ACM responsibility changes between an individual professional and an organisational leader.",
      options: [
        "Only individual developers carry any ethical responsibility; organisational leaders are covered entirely by compliance paperwork",
        "An individual developer should design carefully, review impacts, and disclose significant risks to the right people",
        "More authority over systems and decisions comes with a wider range of consequences and a stronger duty of care",
        "An organisational leader shapes culture, decides whether concerns can be raised safely, and decides whether security is funded",
        "Responsibility stays exactly the same regardless of how much authority or organisational power a person holds",
      ],
      correctIndices: [1, 2, 3],
      modelAnswer:
        "A junior cook needs to wash their hands properly. The head chef running the whole kitchen needs to also make sure the fridge works, staff are trained, and nobody is pressured to serve food that is not safe, a bigger job carries a bigger duty of care.\n\n• Individual level: design, review and disclose, the practical day-to-day choices of one professional.\n\n• Organisational level: leadership shapes culture, decides whether staff can raise concerns, and decides whether security gets funded.\n\n• The key relationship: more authority means wider consequences, which means a stronger duty of care.\n\n• Why the other two are wrong: responsibility does not stay flat as authority grows, and leaders are not excused from ethics just because compliance paperwork exists.\n\nSo the answer is: individual design and disclosure, organisational culture and funding decisions, and the rule that more authority brings a stronger duty of care.",
    },
    {
      type: "mcq",
      prompt:
        "A senior manager quietly decides not to fund a requested security upgrade to protect this quarter's budget numbers, without telling the board the risk this creates. Whose responsibility is this decision mainly testing, and why?",
      options: [
        "Equally everyone's responsibility across the whole company, so no individual decision-maker can be identified",
        "The manager's organisational-level responsibility, because leaders decide whether security is funded and must disclose significant risk to the right people",
        "Nobody's, because budget decisions are purely financial and sit outside the scope of cybersecurity ethics",
        "Only the security team's responsibility, because they are the ones who will have to deal with any resulting incident",
      ],
      correctIndex: 1,
      modelAnswer:
        "The person who controls the household budget is the one who decides whether the smoke alarm batteries get replaced, if they quietly skip it to save money and say nothing, the decision and its risk sit with them.\n\n• Organisational-level responsibility: leaders decide whether security is funded and shape whether risk gets disclosed upward.\n\n• What makes this worse: hiding the risk from the board breaks the disclosure duty that comes with that authority.\n\n• Why the other options are wrong: budget decisions with security consequences are squarely inside cybersecurity ethics, the security team cannot fund what they were never given money for, and diffusing responsibility across everyone ignores who actually made the call.\n\nSo the answer is: the manager's organisational-level responsibility, since leaders control funding and must disclose the risk it creates.",
    },
    // ---------- Round 4: responsible disclosure (9-10) ----------
    {
      type: "order",
      prompt: "Put the four steps of responsible disclosure in the order the lecture described them.",
      steps: [
        "Verify the vulnerability safely, minimising access to real data",
        "Report it through an authorised channel with reproducible evidence",
        "Coordinate with the affected organisation on scope and a reasonable remediation timeline",
        "Disclose proportionately once risk is controlled, or escalate if it is not",
      ],
      modelAnswer:
        "It is the difference between quietly telling a shop their door lock is broken and giving them a fair chance to fix it, versus shouting it to a crowd outside the shop before they even know.\n\n• Step 1: verify safely, without digging through real data more than necessary.\n\n• Step 2: report through an authorised channel, with evidence that can be reproduced.\n\n• Step 3: coordinate on scope, remediation and a reasonable timeline.\n\n• Step 4: disclose proportionately once risk is controlled, or escalate if the organisation is not responsive.\n\nSo the answer is: verify, report, coordinate, then disclose.",
    },
    {
      type: "mcq",
      prompt:
        "A researcher finds a serious flaw in a hospital's patient portal and, within the hour, posts full working exploit code publicly along with their name, without contacting the hospital first. Which step of responsible disclosure was skipped, and what is the main problem with skipping it?",
      options: [
        "Nothing meaningful was skipped, since publishing quickly always reduces the overall risk to users by forcing the hospital to patch the flaw faster than it otherwise would",
        "Disclosing proportionately was skipped, which only matters for minor, low-risk findings and makes no real difference once an exploit affecting patient safety is already involved",
        "Verifying the vulnerability safely was skipped, meaning the flaw might not actually be real, so the exploit code could simply be a false alarm with no genuine risk at all",
        "Reporting through an authorised channel and coordinating with the organisation were skipped, leaving patients exposed before any fix exists",
      ],
      correctIndex: 3,
      modelAnswer:
        "Shouting that a shop's door lock is broken, loudly enough for anyone passing by to hear, before the shop even knows, does not protect anyone inside, it just invites trouble while the door is still open.\n\n• What was skipped: reporting through an authorised channel and coordinating with the organisation on scope and a fix.\n\n• Why it matters: the goal of responsible disclosure is reducing harm while the genuine risk is addressed, not publicity or personal credit.\n\n• The real cost here: patients using a hospital portal are now exposed to a public, working exploit before any patch exists.\n\n• Why the other options are wrong: nothing suggests the vulnerability was unverified, proportional disclosure matters for serious findings too, and publishing before coordination usually increases risk rather than reducing it.\n\nSo the answer is: reporting and coordination were skipped, leaving users exposed before a fix was possible.",
    },
    // ---------- Round 5: ethical dilemmas (11-12) ----------
    {
      type: "mcq",
      prompt:
        "A hospital's systems are encrypted by ransomware and patient care is at risk. Leadership is under pressure to pay quickly to restore services. What is the most defensible approach, according to the lecture's framing of ethical dilemmas?",
      options: [
        "Refuse to pay under any circumstances, since paying is always illegal regardless of the situation",
        "Treat it as a simple yes or no decision and let whichever option is faster decide the outcome",
        "Pay immediately without question, since restoring patient care instantly outweighs every other consideration",
        "Prepare alternatives, involve legal authorities, assess the life-safety impact, and document the governance behind whatever is decided",
      ],
      correctIndex: 3,
      modelAnswer:
        "Choosing whether to pay a kidnapper's ransom is never a quick coin flip, a responsible family would still call the police, weigh the real danger, and keep a clear record of every decision made under pressure.\n\n• Pressure: restoring critical services and protecting patients quickly.\n\n• Risk: payment can fund crime, does not guarantee recovery, and can invite repeat targeting.\n\n• The defensible approach: prepare alternatives in advance, involve legal authorities, assess the genuine life-safety impact, and document the governance behind the decision.\n\n• Why the other options are wrong: ethical dilemmas rarely have a perfect, risk-free answer, so a flat yes, a flat no, or a coin-flip all skip the actual reasoning the situation demands.\n\nSo the answer is: prepare alternatives, involve legal authorities, assess life-safety impact, and document the governance behind the decision.",
    },
    {
      type: "multi",
      prompt:
        "An organisation is considering monitoring staff activity to detect insider threats. Select all considerations that belong to a defensible approach, according to the lecture.",
      options: [
        "Proportionality and minimisation, collecting no more than what the risk genuinely justifies",
        "Keeping the monitoring completely secret from staff, since surprise makes it more effective",
        "Monitoring everything available at all times, since more data always produces a more defensible decision",
        "Necessity, is this level of monitoring actually required to address a real risk",
        "Transparency and meaningful oversight, people know monitoring exists and someone independent can review how it is used",
      ],
      correctIndices: [0, 3, 4],
      modelAnswer:
        "A workplace that quietly films every private conversation to catch one dishonest employee is solving a small problem by creating a much bigger one, lost trust, fear and unfair power over everyone else.\n\n• Necessity: is this level of monitoring actually needed for a real risk.\n\n• Proportionality and minimisation: collect no more than the risk justifies.\n\n• Transparency and meaningful oversight: people know it exists, and someone independent can check how it is used.\n\n• Why secrecy and collect-everything are wrong: the lecture lists chilling effects, power imbalance and discrimination as the real risks of monitoring, and secrecy plus maximal collection makes every one of those risks worse, not more defensible.\n\nSo the answer is: necessity, proportionality and minimisation, and transparency with meaningful oversight.",
    },
    // ---------- Round 6: Cambridge Analytica case (13-14) ----------
    {
      type: "mcq",
      prompt:
        "After the Cambridge Analytica case, what is the main lesson the lecture draws about how the ethical failure happened?",
      options: [
        "It was purely a technical hacking incident, where attackers broke through Facebook's encryption to steal the data",
        "It was a single missing setting that, once fixed, would have prevented the entire outcome on its own",
        "It was entirely the fault of individual app users, who should have read the terms and conditions more carefully",
        "It was a systemic failure across consent, honesty, accountability and power together, not one isolated control",
      ],
      correctIndex: 3,
      modelAnswer:
        "A bridge rarely collapses because of one bolt, usually several small weaknesses, a bad design choice, a skipped inspection, a material flaw, all line up together.\n\n• What failed together: consent was not meaningful, honesty was compromised by misleading assurances, accountability and oversight were inadequate, and power let the data reach people who never used the app at all.\n\n• Why this framing matters: it is a masters-level lesson that ethical review must follow data across its whole lifecycle, not just check one setting.\n\n• Why the other options are wrong: this was not a hacking incident breaking encryption, blaming individual users ignores the platform and company failures, and no single fix would have stopped every one of these failures at once.\n\nSo the answer is: it was a systemic failure spanning consent, honesty, accountability and power, not one isolated control.",
    },
    {
      type: "multi",
      prompt:
        "Select all statements that correctly describe what went wrong in the Cambridge Analytica case, as framed in the lecture.",
      options: [
        "Facebook's servers were broken into using a previously unknown technical exploit",
        "Users received misleading assurances about how identifiable their information would remain",
        "Data inference let the operation influence people who had never engaged with the app at all",
        "Platform access controls and third-party oversight were inadequate to catch what was happening",
        "People could not meaningfully understand how far their data's reach or later use would actually extend",
      ],
      correctIndices: [1, 2, 3, 4],
      modelAnswer:
        "It is less like one locked door being picked, and more like four separate doors in the same building, consent, honesty, oversight and reach, all being left unlatched at once.\n\n• Consent: people could not meaningfully understand the reach or later use of their data.\n\n• Honesty: users got misleading assurances about identifiability.\n\n• Accountability: platform access and third-party oversight were inadequate.\n\n• Power: data inference reached people who never touched the app.\n\n• Why the last option is wrong: this was not framed as a technical break-in using an unknown exploit, it was built on weak consent, honesty, accountability and oversight.\n\nSo the answer is: the first four statements describe the real failures; there was no technical server break-in involved.",
    },
    // ---------- Round 7: law versus standard versus framework (15-16) ----------
    {
      type: "mcq",
      prompt:
        "An organisation says it follows ISO/IEC 27001, so it does not need to worry about the Privacy Act. What is wrong with this reasoning?",
      options: [
        "Standards only apply to government agencies, so private organisations never need to follow either one",
        "Nothing is wrong, since a certifiable standard always legally overrides a country's privacy law",
        "ISO 27001 and the Privacy Act are simply two different names for exactly the same set of rules",
        "A standard provides auditable requirements for managing risk, but it does not replace a law's binding legal duties",
      ],
      correctIndex: 3,
      modelAnswer:
        "Having a gym membership that tracks your workouts carefully does not exempt you from the road rules on your drive there, they answer completely different questions.\n\n• Law: sets binding duties, like the Privacy Act's rules on personal information.\n\n• Standard: provides auditable requirements for a management system, like ISO 27001, which helps build discipline but is not itself a law.\n\n• Why the reasoning fails: compliance is the floor, and a standard does not replace a legal obligation.\n\n• Why the other options are wrong: they are not interchangeable, not identical, and standards are not limited to government agencies.\n\nSo the answer is: a standard gives auditable requirements, but it does not replace the law's binding duties.",
    },
    {
      type: "match",
      prompt:
        "Match each term to the core question it answers, based on the lecture's distinction between law, standard and framework.",
      pairs: [
        { left: "Law (for example, the Privacy Act)", right: "What must we do, creates binding legal obligations" },
        {
          left: "Standard (for example, ISO/IEC 27001)",
          right: "What requirements can be systematically implemented and audited",
        },
        {
          left: "Framework (for example, the NIST Cybersecurity Framework)",
          right: "How can we organise and communicate cybersecurity outcomes",
        },
      ],
      modelAnswer:
        "A rulebook, a certified inspection checklist, and a shared map are three different tools for three different jobs, even though all three help keep a building safe.\n\n• Law: what must we do, a binding obligation.\n\n• Standard: what requirements can be audited, a certifiable discipline.\n\n• Framework: how to organise and communicate outcomes, a shared structure rather than a rulebook.\n\nSo the answer is: law sets mandatory duties, standard sets auditable requirements, and framework organises and communicates outcomes.",
    },
    // ---------- Round 8: Privacy Act and NDB scheme (17-20) ----------
    {
      type: "mcq",
      prompt:
        "Two organisations handle similarly sensitive personal data, but one operates in a far higher-risk environment with greater capability to invest in protection. Under APP 11, should they take exactly the same security steps?",
      options: [
        "No, APP 11 only applies to government agencies, so neither private organisation is covered by it",
        "Yes, because reasonable steps means the cheapest option available, regardless of context",
        "No, what counts as reasonable steps is contextual, depending on risk, sensitivity, capability, consequences and evolving practice",
        "Yes, APP 11 lists one fixed checklist of technical controls that every organisation must apply identically",
      ],
      correctIndex: 2,
      modelAnswer:
        "What counts as a reasonable lock on a door depends on whether it guards a garden shed or a bank vault, the same fixed answer cannot fit both.\n\n• APP 11: requires reasonable steps against misuse, loss and unauthorised access, modification or disclosure.\n\n• Reasonable is contextual: it depends on risk, sensitivity, capability, consequences and evolving practice, not one fixed list.\n\n• Why the other options are wrong: APP 11 is not limited to government agencies, there is no single universal checklist, and reasonable does not simply mean cheapest.\n\nSo the answer is: no, what counts as reasonable steps depends on context, so the two organisations are not necessarily held to identical measures.",
    },
    {
      type: "multi",
      prompt:
        "Select all statements that correctly describe an organisation's duties for personal information under the Australian Privacy Principles, as covered in the lecture.",
      options: [
        "Information should be deleted or de-identified once it is no longer needed, unless retention is legally required",
        "Once information is collected lawfully, an organisation may use or disclose it for any purpose it chooses",
        "Collection should be lawful, necessary and transparent, so people understand why their data is being collected",
        "Use and disclosure should stay within the purposes personal information was permitted for",
        "APP 11 requires reasonable steps to secure personal information against misuse, loss and unauthorised access",
      ],
      correctIndices: [0, 2, 3, 4],
      modelAnswer:
        "Looking after someone else's diary responsibly means only reading what you need, only sharing it with permission, keeping it locked up, and shredding it once nobody needs it anymore.\n\n• Collect: lawfully, necessarily and transparently.\n\n• Use and disclose: stay within permitted purposes.\n\n• Secure: APP 11's reasonable steps against misuse, loss and unauthorised access.\n\n• Delete or de-identify: once no longer needed, unless the law requires keeping it.\n\n• Why the last option is wrong: use and disclosure must stay within permitted purposes, not expand to anything the organisation later decides it wants.\n\nSo the answer is: the first four statements are correct; lawful collection does not grant unlimited later use.",
    },
    {
      type: "order",
      prompt: "Put the four stages of the Notifiable Data Breaches process in the order the lecture described them.",
      steps: [
        "Suspect, quickly assess what happened and whose information is affected",
        "Contain, stop further exposure and take remedial action",
        "Evaluate, would a reasonable person expect likely serious harm",
        "Notify, if eligible, inform affected individuals and the OAIC as soon as practicable",
      ],
      modelAnswer:
        "It is the same order a responsible shopkeeper follows after spotting a break-in, work out what happened, stop the damage spreading, judge how bad it really is, then tell the people who need to know.\n\n• Step 1: suspect, assessing what happened and who is affected.\n\n• Step 2: contain, stopping further exposure.\n\n• Step 3: evaluate, judging likely serious harm.\n\n• Step 4: notify, informing affected individuals and the regulator if the breach is eligible.\n\nSo the answer is: suspect, contain, evaluate, then notify.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: if remedial action successfully prevents the likely serious harm a data breach would otherwise cause, the breach may no longer require notification under the NDB scheme.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "If you catch a dropped glass before it shatters and clean it up completely before anyone could get hurt, there is a real argument nobody needs to be warned about broken glass on the floor.\n\n• The NDB threshold: unauthorised access, disclosure or loss, plus likely serious harm, plus remediation that has not prevented that harm.\n\n• What changes here: if remedial action genuinely prevents the likely serious harm, the eligibility threshold for notification may no longer be met.\n\n• Why this still needs care: the assessment of whether harm was truly prevented must be honest and documented, not just assumed.\n\nSo the answer is: True, effective remedial action that prevents likely serious harm can remove the need to notify.",
    },
    // ---------- Round 9: cybercrime (21-22) ----------
    {
      type: "mcq",
      prompt:
        "An employee uses their own valid login to access a restricted HR database they were never given permission to view, out of curiosity. No encryption was broken and no password was stolen. Does this count as unauthorised access under the cybercrime principles in the lecture?",
      options: [
        "No, because curiosity is treated as a legally protected motive for accessing restricted systems",
        "No, because using a valid, working login always means the access was authorised",
        "Yes, because authorisation must cover the person, system, purpose, method and time, and the purpose here was never granted",
        "No, because unauthorised access only applies when encryption has been broken",
      ],
      correctIndex: 2,
      modelAnswer:
        "Having a key that opens the staff room does not mean you are allowed to use it to read the manager's private files just because the lock happens to turn.\n\n• Unauthorised access does not require breaking encryption, accessing a restricted system without entitlement is itself the issue.\n\n• Authorisation must cover the person, the system, the purpose, the method and the time, all five together.\n\n• What went wrong here: the purpose, viewing HR data out of curiosity, was never granted, even though the login itself worked.\n\n• Why the other options are wrong: encryption is irrelevant here, a working login does not automatically mean the purpose was authorised, and curiosity is not a recognised legal exemption.\n\nSo the answer is: yes, because the purpose was never authorised, even with a valid login and no broken encryption.",
    },
    {
      type: "multi",
      prompt: "Select all statements that correctly describe cybercrime concepts from the lecture.",
      options: [
        "Because encryption was not broken, unauthorised access charges can never apply to that access",
        "Authorisation must cover the person, the system, the purpose, the method and the time together",
        "A single unauthorised act can only ever create one possible offence, never more than one at once",
        "Malware is code that can modify data, impair systems or communications, or enable further offences",
        "Identity theft involves using stolen credentials or personal data to impersonate, defraud or gain access",
      ],
      correctIndices: [1, 3, 4],
      modelAnswer:
        "Breaking into a car, driving it, and using a stolen wallet found inside are three separate wrongs even though they happened in one afternoon, familiar conduct can stack up into more than one offence.\n\n• Malware: modifies data, impairs systems or communications, or enables further offences.\n\n• Identity theft: using stolen credentials or personal data to impersonate, defraud or gain access.\n\n• Authorisation: must cover person, system, purpose, method and time together.\n\n• Why the last two are wrong: familiar conduct can create multiple offences at once, and unauthorised access does not require broken encryption.\n\nSo the answer is: the first three statements are correct.",
    },
    // ---------- Round 10: ISO 27001 and NIST CSF (23-25) ----------
    {
      type: "mcq",
      prompt:
        "An organisation implements ISO/IEC 27001 once, documents its controls, and considers the project finished. What is missing from how the standard is meant to work?",
      options: [
        "Nothing is missing, since ISO 27001 is explicitly designed as a one-time technical control checklist",
        "Ongoing monitoring, auditing, review and continual improvement, ISO 27001 builds a management system, not a one-time checklist",
        "A requirement to switch entirely to the NIST Cybersecurity Framework instead, since the two cannot be used together",
        "A legal filing with a government regulator, since ISO 27001 compliance is itself a binding law",
      ],
      correctIndex: 1,
      modelAnswer:
        "Getting fit once at the gym and never going back does not keep you fit, the whole point is the ongoing habit, not a single session.\n\n• ISO 27001's cycle: understand context, assess risk and choose treatment, implement proportionate controls across people, process and technology, then monitor, audit, review and improve.\n\n• What is missing here: the ongoing monitoring, auditing and improvement that keeps the system current.\n\n• Why the other options are wrong: ISO 27001 is explicitly not a one-time checklist, it complements rather than replaces a framework like NIST CSF, and it is a standard, not a law.\n\nSo the answer is: ongoing monitoring, auditing, review and improvement are missing, since the standard builds a management system, not a one-off checklist.",
    },
    {
      type: "sort",
      prompt: "Sort each NIST Cybersecurity Framework function into the stage of the incident timeline it mainly belongs to.",
      groups: ["Before an incident", "During an incident", "After an incident"],
      items: [
        { text: "Identify, understanding assets, business context and risk", group: 0 },
        { text: "Protect, applying safeguards to reduce likelihood and impact", group: 0 },
        { text: "Detect, finding cybersecurity events quickly", group: 1 },
        { text: "Respond, containing, communicating and managing the incident", group: 1 },
        { text: "Recover, restoring capabilities and improving resilience", group: 2 },
      ],
      modelAnswer:
        "Firefighters check the building and install sprinklers beforehand, watch for smoke and fight the fire during, and repair the damage afterwards, NIST's functions map onto the same timeline.\n\n• Before: identify understands assets and risk, protect applies safeguards to reduce impact.\n\n• During: detect finds the event quickly, respond contains and manages it.\n\n• After: recover restores capability and improves resilience.\n\n• Note: Govern, added in CSF 2.0, actually sits across all three stages rather than in just one, providing strategy, policy, roles and oversight for the rest.\n\nSo the answer is: identify and protect come before an incident, detect and respond happen during it, and recover happens after.",
    },
    {
      type: "mcq",
      prompt:
        "NIST CSF 2.0 adds a sixth function called Govern alongside identify, protect, detect, respond and recover. What role does Govern play?",
      options: [
        "It only applies after an incident has already been fully recovered from",
        "It establishes strategy, policy, roles and oversight across all of the other functions",
        "It is an optional function used only by organisations that do not already have a privacy law to follow",
        "It replaces the detect function entirely, since governance and detection are considered the same activity",
      ],
      correctIndex: 1,
      modelAnswer:
        "A conductor does not play an instrument in the orchestra, but sets the tempo and coordinates every section so the whole performance holds together.\n\n• Govern: establishes strategy, policy, roles and oversight for identify, protect, detect, respond and recover.\n\n• Why it is distinct from detect: it is not another operational function, it sits across and supports all of them.\n\n• Why the other options are wrong: it does not replace any function, it is not limited to after recovery, and it is a core CSF 2.0 function, not an optional substitute for law.\n\nSo the answer is: Govern sets strategy, policy, roles and oversight across all the other functions.",
    },
    // ---------- Round 11: incident definitions and severity (26-29) ----------
    {
      type: "mcq",
      prompt:
        "A monitoring tool flags an unusual login pattern as worth investigating, but the investigation finds it was just an employee logging in from a new laptop. Has a security incident occurred?",
      options: [
        "Yes, because any flagged alert automatically counts as a confirmed security incident",
        "No, an alert is a flag worth investigating, and this one did not turn out to threaten confidentiality, integrity, availability or policy",
        "Yes, because a data breach occurred the moment the alert was generated",
        "No, because alerts are never worth investigating unless they are confirmed within the first five minutes",
      ],
      correctIndex: 1,
      modelAnswer:
        "A smoke detector going off does not mean there was a fire, it means someone needs to go check, and sometimes it really is just burnt toast.\n\n• Event: any observable occurrence.\n\n• Alert: a tool or person flags that event for investigation.\n\n• Incident: the flagged activity actually threatens confidentiality, integrity, availability or policy, needing coordinated response.\n\n• What happened here: the alert was investigated and turned out to be harmless, so it never became an incident.\n\n• Why the other options are wrong: not every alert is confirmed, no data breach occurred, and investigation timing has nothing to do with whether something was worth checking.\n\nSo the answer is: no, this stayed at the alert stage since it did not threaten confidentiality, integrity, availability or policy.",
    },
    {
      type: "match",
      prompt: "Match each term to its definition from the lecture's incident classification.",
      pairs: [
        { left: "Event", right: "Any observable occurrence in a system or network" },
        { left: "Alert", right: "A tool or person flags behaviour for investigation" },
        {
          left: "Incident",
          right: "An occurrence that threatens confidentiality, integrity, availability or policy and needs coordinated response",
        },
        { left: "Data breach", right: "Personal information is lost, accessed or disclosed without authorisation" },
      ],
      decoys: ["A scheduled maintenance window agreed in advance with no security relevance"],
      modelAnswer:
        "A ladder of seriousness: first something is simply observed, then someone flags it as worth a look, then it turns out to actually threaten the system, and sometimes, specifically, personal information is involved.\n\n• Event: any observable occurrence.\n\n• Alert: a flag for investigation.\n\n• Incident: a real threat needing coordinated response.\n\n• Data breach: personal information lost, accessed or disclosed without authorisation.\n\n• The decoy is a planned, harmless maintenance window, not part of this ladder at all.\n\nSo the answer is: event is any observation, alert is a flag, incident is a real threat, and data breach specifically involves personal information.",
    },
    {
      type: "mcq",
      prompt:
        "A phishing campaign has affected several employees across one department, but no systems have been encrypted or taken offline. Which severity level and typical response best fits this, according to the lecture's classification?",
      options: [
        "Low severity, handled locally by IT support without further escalation",
        "High severity, requiring full activation of the Incident Response Team as the top priority",
        "Critical severity, requiring executive leadership and regulators to be involved immediately",
        "Medium severity, where the security team investigates rather than IT support alone or executive escalation",
      ],
      correctIndex: 3,
      modelAnswer:
        "One scratched car in a car park gets handled by the driver. A multi-car pile-up on a busy road needs police and an ambulance. A phishing campaign hitting several people sits somewhere in between, enough to call in a proper team, not enough to call in the fire brigade.\n\n• Low: malware isolated to one workstation, handled locally by IT support.\n\n• Medium: a phishing campaign affecting several users, investigated by the security team.\n\n• High: a database compromise, the Incident Response Team activated.\n\n• Critical: enterprise ransomware or a major data breach, executive leadership and regulators involved.\n\nSo the answer is: medium severity, with the security team investigating.",
    },
    {
      type: "sort",
      prompt: "Sort each scenario into the severity level it best matches, based on the lecture's incident severity table.",
      groups: ["Low", "Medium", "High / Critical"],
      items: [
        { text: "Malware found and removed from a single workstation", group: 0 },
        { text: "IT support handles a one-off suspicious email locally without escalation", group: 0 },
        { text: "A phishing campaign tricks several staff into entering their passwords", group: 1 },
        { text: "The security team opens an investigation after multiple related reports", group: 1 },
        { text: "An attacker gains access to the customer database and begins extracting records", group: 2 },
        { text: "Enterprise-wide ransomware encrypts systems across every department, with executives and regulators involved", group: 2 },
      ],
      modelAnswer:
        "Think of a hospital's triage desk: a scraped knee waits in the regular queue, a broken arm gets seen faster, and chest pain or a mass casualty event both go straight to the top of the queue.\n\n• Low: malware on one workstation, handled locally.\n\n• Medium: a phishing campaign affecting several users, investigated by the security team.\n\n• High / Critical: a database compromise through to enterprise ransomware, where the Incident Response Team, executives and regulators all get involved.\n\nSo the answer is: single-workstation and locally handled items are low, the phishing campaign and its investigation are medium, and the database compromise and enterprise ransomware items are high/critical.",
    },
    // ---------- Round 12: the incident response lifecycle (30-32) ----------
    {
      type: "order",
      prompt:
        "Put the six stages of the incident response lifecycle in order, from before an incident starts to after it ends.",
      steps: ["Preparation", "Detection", "Containment", "Eradication", "Recovery", "Lessons learned"],
      modelAnswer:
        "It is the same shape as recovering from any emergency: get ready beforehand, notice it is happening, stop it spreading, remove the actual cause, get back to normal, then sit down afterwards and work out how to do better next time.\n\n• Preparation: governance, people and technology ready before anything happens.\n\n• Detection: turning weak signals into a defensible hypothesis.\n\n• Containment: stopping harm from spreading while preserving evidence.\n\n• Eradication: removing the actual cause, not just the symptom.\n\n• Recovery: restoring stable, trusted, supported services.\n\n• Lessons learned: converting the incident into real improvement.\n\nSo the answer is: preparation, detection, containment, eradication, recovery, lessons learned.",
    },
    {
      type: "mcq",
      prompt:
        "During eradication, the team discovers a second compromised server they had not previously detected. What should they do, given that the lifecycle is a cycle rather than a strict straight line?",
      options: [
        "Ignore the new system entirely, since the lifecycle only allows moving forward, never backward",
        "Loop back to detection and containment for the newly found system before continuing",
        "Immediately declare the incident fully recovered, since eradication has already technically started",
        "Restart the entire lifecycle from preparation, discarding all evidence and decisions made so far",
      ],
      correctIndex: 1,
      modelAnswer:
        "Finding a second leak while fixing the first one does not mean starting the whole repair job over, it means going back to check that new leak properly before moving on.\n\n• The real shape of the lifecycle: stages make decisions visible, but real incidents are not perfectly linear.\n\n• What to do here: loop back to detection and containment for the newly found system.\n\n• Why the other options are wrong: ignoring a newly found compromise leaves a gap, declaring recovery too early contradicts the point of eradication, and restarting from preparation throws away evidence and decisions for no reason.\n\nSo the answer is: loop back to detection and containment for the new system before continuing.",
    },
    {
      type: "multi",
      prompt: "Select all statements that correctly describe the preparation stage of incident response.",
      options: [
        "Without preparation, responders waste valuable time answering basic questions like who can approve an action",
        "People need clear roles, training, on-call coverage and trusted contacts",
        "Technology must support response through good logging, secure tools, backups and evidence storage",
        "Governance defines policy, authority, severity levels, legal triggers and decision rights",
        "Preparation only matters for very large organisations, since small teams can always improvise effectively",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "A fire drill feels pointless to a school with ten students, right? Wrong, every team, large or small, performs worse under real pressure without practice and a clear plan.\n\n• Governance: policy, authority, severity levels, legal triggers and decision rights.\n\n• People: clear roles, training, on-call coverage and trusted contacts.\n\n• Technology: good logging, secure tools, backups and evidence storage.\n\n• Why it matters: without preparation, responders waste time on basic questions like who can approve this.\n\n• Why the small-team option is wrong: preparation is not reserved for large organisations, improvising under real pressure is exactly what preparation is meant to prevent.\n\nSo the answer is: governance, people, technology and the cost of skipping preparation are all correctly described; team size does not exempt anyone from needing it.",
    },
    // ---------- Round 13: the IR team and containment (33-34) ----------
    {
      type: "mcq",
      prompt:
        "A security analyst fully understands a live attack and knows exactly which critical business service should be shut down to stop it, but has no authority to actually shut it down. Who, according to the lecture, should hold that authority?",
      options: [
        "Nobody, since no critical business service should ever be shut down under any circumstances",
        "Business and risk roles, since they bring service ownership, continuity, privacy, legal and executive authority to that decision",
        "The communications role, since they are responsible for all external-facing decisions during an incident",
        "The analyst themself, since deep technical understanding of the attack is always sufficient authority on its own",
      ],
      correctIndex: 1,
      modelAnswer:
        "A pilot who sees a fault on the instrument panel still cannot unilaterally decide to divert a planeload of passengers, that call involves people who own the bigger consequences.\n\n• Incident commander: sets priorities and decision ownership.\n\n• Technical leads: cover security operations, forensics, infrastructure, cloud and identity.\n\n• Business and risk roles: bring service ownership, continuity, privacy, legal and executive authority.\n\n• Communications: reaches employees, customers, regulators and law enforcement.\n\n• Why this matters here: shutting down a critical business service is a decision within the whole organisation, not one person's technical call.\n\nSo the answer is: business and risk roles, since they hold the authority over service ownership and the wider consequences.",
    },
    {
      type: "multi",
      prompt: "Select all statements that correctly describe containment, as framed in the lecture.",
      options: [
        "Strategic containment can involve network segmentation, rotating trust relationships and creating business workarounds",
        "The only correct containment action in any situation is disconnecting the entire network immediately, regardless of impact",
        "Containment is a risk decision, where acting too slowly increases harm but acting blindly can destroy evidence or operations",
        "Short-term actions include isolating hosts, disabling compromised accounts and blocking known indicators",
        "At the same time, logs and volatile evidence should be preserved and every action documented",
      ],
      correctIndices: [0, 2, 3, 4],
      modelAnswer:
        "Stopping a kitchen fire does not always mean pulling every plug in the building, sometimes it means closing the kitchen door, grabbing the extinguisher, and checking the wiring properly afterwards.\n\n• Short term: isolate hosts, disable accounts, block indicators.\n\n• Evidence: preserve logs and volatile data, document every action.\n\n• Strategic: segment the network, rotate trust, build business workarounds.\n\n• The core idea: containment is a risk decision, too slow increases harm, too blind destroys evidence or operations.\n\n• Why the last option is wrong: a single fixed reaction ignores the actual trade-offs the lecture describes containment as weighing.\n\nSo the answer is: the first four statements are correct; there is no single always-correct containment action.",
    },
    // ---------- Round 14: eradication, recovery, lessons learned (35-38) ----------
    {
      type: "mcq",
      prompt:
        "A team removes the malware file they found on a compromised server, confirms the file is gone, and declares the incident eradicated. They never checked whether the attacker created any other accounts or whether the entry point was patched. What is missing?",
      options: [
        "Remediation and verification, fixing the weakness that let the attacker in and threat-hunting to confirm nothing else remains",
        "A formal notification to the regulator, which is required before any eradication step can begin",
        "Nothing, removing the known malware file is the entire definition of eradication",
        "The containment stage, which should have come after eradication rather than before it",
      ],
      correctIndex: 0,
      modelAnswer:
        "Pulling one weed out of a garden bed does not mean the roots underneath are gone, or that the gap in the fence the rabbits got through is fixed.\n\n• Remove: malware, rogue accounts, scheduled tasks, web shells, unauthorised tools.\n\n• Remediate: patch vulnerabilities, harden configurations, rotate compromised secrets.\n\n• Verify: threat-hunt across the environment and validate clean rebuilds.\n\n• What is missing here: remediation of the entry point and verification that nothing else remains.\n\n• Why the other options are wrong: eradication is more than deleting one file, containment comes before eradication not after, and regulator notification is a separate legal process, not a precondition for eradication.\n\nSo the answer is: remediation of the weakness and verification that nothing else remains were both skipped.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: once a system is switched back on and users can reach it again, recovery from an incident is complete.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "Reopening a shop with the lights back on does not mean the shop is actually safe to trade in, if the broken lock was never properly fixed, customers could be walking straight back into danger.\n\n• What recovery actually requires: prioritising services by business impact, restoring or rebuilding from known-good sources with validated integrity, and monitoring closely during the return to service.\n\n• The real bar: recovery is complete when services are stable, trusted and supported, not merely online.\n\n• Why switching back on is not enough: attackers may still have persistence, and an unvalidated system can simply recreate the incident.\n\nSo the answer is: False, being switched back on and reachable is not the same as being genuinely recovered.",
    },
    {
      type: "multi",
      prompt: "Select all statements that correctly describe the lessons learned stage.",
      options: [
        "A blameless review means nobody is ever held accountable for anything, under any circumstances",
        "The organisation reviews the incident while evidence and decisions are still fresh",
        "Reconstructing the timeline includes how the team's understanding of events changed over time",
        "If the same preventable failure happens again because nobody implemented what was learned, the review has failed",
        "Findings are converted into improvements with named owners, deadlines, measures and verification",
      ],
      correctIndices: [1, 2, 3, 4],
      modelAnswer:
        "A flight crew's post-flight debrief happens straight after landing, while the details are still fresh, and it produces an actual checklist change, not just a shrug and a promise to do better.\n\n• Timing: review while evidence and decisions are still fresh.\n\n• Timeline: reconstruct what happened and how understanding changed.\n\n• Improvements: named owners, deadlines, measures and verification.\n\n• The real failure mode: the same preventable failure recurring because nobody implemented the fix.\n\n• Why blameless does not mean unaccountable: the review examines system conditions honestly while still expecting someone to actually fix things.\n\nSo the answer is: the first, second, third and fifth statements are correct; blameless does not mean nobody is accountable.",
    },
    {
      type: "mcq",
      prompt:
        "A year after an incident, the exact same preventable failure happens again because the agreed fix was never actually implemented. What does this say about the original lessons learned review?",
      options: [
        "The review failed in its real purpose, since a blameless review still expects named improvements to actually be carried out",
        "It proves the incident response lifecycle has no connection to long-term organisational improvement",
        "Nothing, since lessons learned reviews are purely symbolic and are not expected to prevent recurrence",
        "It proves the review correctly assigned blame to an individual, which is the review's main purpose",
      ],
      correctIndex: 0,
      modelAnswer:
        "A doctor diagnosing the same illness twice because the patient never actually took the prescribed medicine is a failure of follow-through, not of the diagnosis itself.\n\n• The purpose of lessons learned: convert incident cost into organisational capability through named owners, deadlines and verification.\n\n• Blameless does not mean toothless: it examines system conditions honestly, but still expects the agreed fixes to happen.\n\n• What recurrence proves: the review's findings were not actually implemented, so the lesson was not truly learned.\n\n• Why the other options are wrong: reviews are meant to prevent recurrence not just exist symbolically, assigning individual blame is not the review's stated purpose, and this is a very direct link to long-term improvement, not evidence of no connection.\n\nSo the answer is: the review failed in its real purpose, since the agreed improvement was never carried out.",
    },
    // ---------- Round 15: evidence preservation and reporting (39-40) ----------
    {
      type: "multi",
      prompt:
        "Select all statements that correctly describe preserving digital evidence during an incident, as covered in the lecture.",
      options: [
        "Record actions taken by responders as the response unfolds",
        "Minimise unnecessary changes to affected systems wherever practical",
        "Capture volatile data such as memory, processes and connections when appropriate and authorised",
        "Rebooting an affected server immediately is always the safest first step, regardless of what evidence it might destroy",
        "Preserve relevant logs, including timestamps, comments, decisions and personnel involved",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "Investigating a break-in without touching anything until the details are recorded preserves the clues, while mopping the floor straight away destroys exactly what you needed to understand what happened.\n\n• Preserve logs: timestamps, comments, decisions, personnel.\n\n• Record actions: document what responders actually do.\n\n• Capture volatile data: memory, processes, connections, when appropriate and authorised.\n\n• Minimise change: avoid unnecessary modification to affected systems.\n\n• Why rebooting is wrong: incident response must reduce harm without destroying the information needed to understand what happened, and an immediate reboot can wipe exactly that evidence.\n\nSo the answer is: the first four statements are correct; an automatic reboot is not the safe default.",
    },
    {
      type: "match",
      prompt: "Match each incident reporting audience to the kind of information the lecture says they need.",
      pairs: [
        { left: "Executives", right: "Business impact, decisions required, uncertainty and the next update time" },
        { left: "Technical teams", right: "Scope, evidence, actions taken, working hypotheses and task ownership" },
        { left: "Legal and regulators", right: "Applicable thresholds, evidence preservation, notifications and timelines" },
        { left: "People affected", right: "Plain-language impact, protective steps to take, and honest limitations" },
      ],
      modelAnswer:
        "A single incident report written one way for everyone either drowns executives in technical detail or leaves affected customers staring at jargon they cannot use, so the message has to change shape for its audience.\n\n• Executives: business impact, required decisions, uncertainty, next update time.\n\n• Technical teams: scope, evidence, actions, hypotheses, task ownership.\n\n• Legal and regulators: thresholds, preservation, notifications, timelines.\n\n• People affected: plain-language impact, protective steps, honest limitations.\n\nSo the answer is: executives get business impact and decisions, technical teams get scope and evidence, legal and regulators get thresholds and timelines, and affected people get plain-language impact and protective steps.",
    },
    // ---------- Round 16: business continuity versus disaster recovery (41-43) ----------
    {
      type: "mcq",
      prompt:
        "A company's main office floods and staff cannot access their usual systems or building for several days. Which question is business continuity planning specifically trying to answer?",
      options: [
        "Which specific software patch should have been applied to the server before the flood occurred to prevent the outage",
        "How much data was permanently lost on the flooded server's local hard drive before any offsite backup could be checked",
        "How quickly the damaged server hardware itself can be physically repaired, replaced or rebuilt by the vendor support team",
        "How does the organisation keep its most important outcomes operating while normal processes, people or facilities are disrupted",
      ],
      correctIndex: 3,
      modelAnswer:
        "If the usual office is suddenly unusable, business continuity is the plan that gets the most important work still happening somewhere else, even if that means pen, paper and a borrowed room for a few days.\n\n• Business continuity: identifies critical activities and dependencies, uses workarounds like alternate staff, sites or manual processes, and tests those plans through exercises.\n\n• What it is not about: the physical hardware repair or the technical data recovery itself, that is disaster recovery's job.\n\n• Why the other options are wrong: they describe technical restoration details, not the broader question of keeping critical outcomes running.\n\nSo the answer is: how the organisation keeps its most important outcomes operating during the disruption.",
    },
    {
      type: "fillblank",
      prompt:
        "In disaster recovery planning, ___ expresses the targeted time to restore a service, while ___ expresses how much data loss can be tolerated.",
      blanks: [
        ["RTO", "recovery time objective", "recovery time objective (RTO)"],
        ["RPO", "recovery point objective", "recovery point objective (RPO)"],
      ],
      modelAnswer:
        "Two different questions about getting back on your feet after a disaster, how soon do you need to be walking again, and how much of the last few steps are you willing to forget.\n\n• RTO, recovery time objective: how quickly a service needs to be restored.\n\n• RPO, recovery point objective: how much data loss can be tolerated.\n\n• Why both matter: a service can be restored fast but still lose unacceptable amounts of recent data if RPO was never planned for, or vice versa.\n\nSo the answer is: RTO for the targeted restoration time, and RPO for the acceptable data loss.",
    },
    {
      type: "mcq",
      prompt:
        "An organisation takes daily backups of its systems but has never actually tried restoring from one. A disaster occurs and the backups turn out to be unusable. What does the lecture say was missing?",
      options: [
        "Validation, a backup is only a real recovery capability once restoration, dependencies and integrity have actually been tested",
        "Nothing could have been done differently, since taking regular backups is the entire definition of disaster recovery capability",
        "A faster internet connection, since backup speed is the only factor that determines whether a restore will succeed",
        "A separate disaster recovery team, since the same staff who take backups should never be the ones restoring them",
      ],
      correctIndex: 0,
      modelAnswer:
        "Owning a fire extinguisher you have never actually test-fired does not guarantee it will work the one time you desperately need it to.\n\n• Capability: backups, replication, alternate infrastructure, rebuild procedures.\n\n• Validation: test restoration, dependencies, integrity and operational handover.\n\n• The key line from the lecture: a backup is only useful if you can actually restore from it when needed.\n\n• Why the other options are wrong: taking backups alone is not the whole capability, connection speed is not the stated factor, and team structure is not the issue described.\n\nSo the answer is: validation was missing, since the restoration itself had never been tested.",
    },
    // ---------- Round 17: case simulation, Harbour University (44-46) ----------
    {
      type: "mcq",
      prompt:
        "At Harbour University, impossible-travel alerts appear at 7:10am, inaccessible research shares are reported at 7:18am, encryption behaviour is detected on two servers at 7:24am, and a privileged account begins deleting snapshots at 7:31am. At what point does this clearly require coordinated incident response and urgent evidence preservation?",
      options: [
        "Only after the university's insurer has formally approved an incident response budget",
        "Only once every affected server has been fully identified and documented in detail",
        "Not until the privileged account finishes deleting the snapshots, since only completed damage counts as a confirmed incident",
        "By 7:24am at the latest, once encryption behaviour on multiple servers confirms this is no longer an isolated alert",
      ],
      correctIndex: 3,
      modelAnswer:
        "A single car alarm going off might be nothing, but when two more start blaring and someone is actively trying the door handles, nobody waits for a signed form before calling for help.\n\n• The escalating pattern: isolated identity alerts, then inaccessible shares, then confirmed encryption behaviour on multiple servers, then active destruction of recovery points.\n\n• The threshold: by the time encryption is confirmed on two servers, this is clearly an incident needing coordinated response and urgent evidence preservation, not a wait-and-see alert.\n\n• Why the other options are wrong: waiting for full documentation, budget approval, or completed damage before acting all let harm and evidence loss continue unnecessarily.\n\nSo the answer is: by 7:24am at the latest, once encryption behaviour confirmed this was more than an isolated alert.",
    },
    {
      type: "mcq",
      prompt:
        "Harbour University's team is choosing between disconnecting the entire campus network immediately, isolating only the affected identity, server and network segments, or briefly monitoring to learn more about the attacker. Which option best reflects the lecture's framing of containment as a risk decision, and what is its trade-off?",
      options: [
        "Monitor briefly with no containment action at all, since any delay always improves the quality of the evidence collected",
        "Isolate the affected identity, server and network segments, trading some precision risk for a more targeted response that avoids shutting down the whole university",
        "Whichever option is fastest to execute, since execution speed alone determines the correct containment choice",
        "Disconnect the entire campus network, since the trade-off of severe disruption to teaching and research never needs to be weighed against anything",
      ],
      correctIndex: 1,
      modelAnswer:
        "Closing one contaminated aisle in a supermarket is usually smarter than locking the whole building, as long as you are confident you have actually found every contaminated spot.\n\n• Option A, full disconnect: fast containment, but severe teaching, research and safety impact.\n\n• Option B, monitor briefly: may improve intelligence, but risks further encryption and exfiltration while you wait.\n\n• Option C, targeted isolation: more precise, but depends on how confident the team is in its scope and segmentation.\n\n• The lecture's framing: containment is a risk decision, trading precision confidence for business impact, not a single automatic choice.\n\nSo the answer is: isolating the affected segments, trading some precision risk for avoiding a full campus shutdown.",
    },
    {
      type: "mcq",
      prompt:
        "Harbour University's post-incident review lists what failed, such as legacy remote access and incomplete log coverage, and what changes going forward, such as phishing-resistant multi-factor authentication and recovery exercises. What is the point of connecting these technical causes to governance and operational conditions this way?",
      options: [
        "It is an optional formality, since the incident was already considered fully closed the moment the affected systems were back online",
        "The incident ends only when the organisation actually changes, turning technical causes into assigned, testable improvements rather than just restoring systems",
        "It replaces the need for any separate incident report to executives, legal, technical teams and the people actually affected by it",
        "It exists purely to assign personal blame to whichever staff member happened to configure the legacy remote access system that failed",
      ],
      correctIndex: 1,
      modelAnswer:
        "A city does not just clean up after a bridge collapse, it investigates why the bridge actually failed and changes the standards bridges are built to from then on.\n\n• What failed: legacy remote access, weak privileged-access controls, incomplete log coverage.\n\n• What worked: EDR detection, cross-team escalation, clean offline backups.\n\n• What changes: phishing-resistant MFA, asset ownership, recovery exercises, supplier assurance.\n\n• The real point: the incident ends only when the organisation actually changes, not merely when systems are restored.\n\n• Why the other options are wrong: this is not about assigning personal blame, it is not an optional formality once systems are online, and it does not replace the separate audience-specific incident reports.\n\nSo the answer is: connecting technical causes to governance conditions turns the incident into assigned, testable organisational improvement.",
    },
    // ---------- Round 18: mixed review, threat modelling and hash/HMAC/signature (47-48) ----------
    {
      type: "mcq",
      prompt:
        "A system has an internet-facing login page that any member of the public can reach. According to the threat modelling recap, does this automatically mean the login page is vulnerable?",
      options: [
        "No, because only pages that explicitly require a username and password can ever be considered part of a system's attack surface",
        "No, the login page is part of the attack surface because it can be reached, but it is only a vulnerability if it actually contains an exploitable weakness",
        "Yes, but only because public pages are always built without any dedicated security testing or review before they ever go live",
        "Yes, any page that can be reached from the internet is automatically a vulnerability by definition, regardless of how it was built or tested",
      ],
      correctIndex: 1,
      modelAnswer:
        "A front door that anyone could knock on is not automatically broken, it only becomes a real problem if the lock itself has a flaw that lets someone in without a key.\n\n• Attack surface: an opportunity to interact with the system, like a reachable login page.\n\n• Vulnerability: an actual weakness that may be exploited, a separate question.\n\n• Why they are not the same: the page being reachable does not mean the login mechanism actually contains a flaw that bypasses authentication.\n\n• Why the other options are wrong: reachability alone is not the definition of a vulnerability, security testing is not universally absent from public pages, and plenty of pages are part of the attack surface regardless of whether they ask for a password.\n\nSo the answer is: no, it is part of the attack surface, but only a vulnerability if a real exploitable weakness exists there.",
    },
    {
      type: "mcq",
      prompt:
        "A software developer needs to publish an update to millions of devices so that each device can verify the update is genuine, without ever sharing the developer's secret signing material with any device. Which mechanism fits, and why not HMAC?",
      options: [
        "No cryptographic mechanism is needed at all, since millions of devices cannot realistically perform any kind of verification in practice",
        "HMAC, because giving every device the exact same shared secret key is the safest way to let millions of devices verify independently",
        "A plain cryptographic hash, because a hash alone proves the update truly came from the developer and was never altered in transit",
        "A digital signature, because the private key stays only with the developer while every device verifies using the public key, so no shared secret is ever distributed",
      ],
      correctIndex: 3,
      modelAnswer:
        "A notary's personal seal only needs to leave their own desk once, anyone can check a document against a published copy of that seal without ever being handed the notary's private stamp.\n\n• Hash alone: only proves data has not changed, it does not prove who sent it, since anyone can compute a hash.\n\n• HMAC: needs a shared secret, so handing that same key to millions of devices would mean a single compromised device could forge updates for everyone.\n\n• Digital signature: the private key stays only with the developer, while every device verifies using the public key, so no shared secret is ever distributed.\n\n• Why the last option is wrong: device verification is exactly what digital signatures are designed to make possible at scale.\n\nSo the answer is: a digital signature, because it avoids distributing any shared secret while still letting every device verify authenticity.",
    },
  ],
};

const BLOCKCHAIN_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 9,
  paperNumber: 2,
  title: "Week 9 Lecture: Introduction to Blockchain",
  topics:
    "Week 9 lecture (introduction to blockchain, delivered live as a guided class discussion). Ledgers and the history of recording transactions; why saving many copies of a ledger makes it reliable; a transaction as a change of state, not just money. Blockchain as a decentralised ledger / a trusted shared computer; the security property that a blockchain gets harder to attack as it grows, and the need to control more than 50% of nodes to corrupt it; consensus versus ordering (consensus agrees on state, it does not by itself fix the order events happened in). The Raft consensus algorithm: leader, follower and candidate roles; per-node state (term, role, voted-for); heartbeats and randomised election timeouts; why Raft is a distributed-but-centralised, permissioned/internal-setup algorithm with a single point of failure and no defence against fake identities. Proof of work as a way to make a claimed state change verifiable to other nodes. Permissionless (fully decentralised, no central authority) systems and their Sybil/impersonation weakness: creating fake identities is cheap, so an adversary controlling over 50% of nodes still corrupts the system. The longest-chain rule for resolving competing branches. Attacks: eclipse attack (controlling a target node's connections), selfish mining (withholding a solved block for advantage), imitation/front-running attack (racing ahead of a known pending request). Programmability and smart contracts: code deployed on a shared computer that every node can call, with logic that cannot be changed once deployed. Decentralised finance (DeFi), liquidity (wallet vs bank account vs house, and liquidity provided to a smart contract/AMM so trades do not need fresh permission each time), and why big holders can still move the price of an asset (gold/whale analogy, Elon Musk's wealth sitting in shares rather than cash). Sandwich attacks and slippage.",
  sourceFiles: [
    "lecture/Week 09 - Introducti-s1-low.transcript.md",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "A ledger is just a trusted record, kept by more than one person",
      body: "Long before computers, market traders and record-keepers wrote down who owed what in a book, and other people kept their own copies so one dishonest page couldn't rewrite history. A blockchain automates that same old idea.\n\n• A transaction is not only about money: it is any change of state, like a student becoming a graduate, or an account balance changing.\n\n• A blockchain saves states and the transactions that changed them, across many computers (nodes) instead of one.\n\n• Reliability comes from redundancy: if many nodes hold a copy, a single corrupted copy can be caught and corrected by comparing against the others.\n\n• Security is a different claim from reliability: more copies alone do not stop every attack, which is why the rest of the lecture is about consensus and attacks.",
    },
    {
      beforeQuestion: 10,
      title: "Raft solves agreement with a single leader — and that is also its weak point",
      body: "Think of a classroom where one person is picked to read out the final answer, and everyone else just repeats it, so nobody disagrees about what was said. Raft works the same way.\n\n• Three roles: a leader decides the order of events and tells everyone, a follower just repeats whatever the leader says, and a candidate is a node currently asking to become the leader.\n\n• A heartbeat is a regular I'm still here signal from the leader; if followers stop hearing it, one of them can nominate itself and call a vote.\n\n• The wait before nominating yourself is randomised on purpose, so two followers don't both call a vote at the exact same moment and split it.\n\n• The catch: Raft only works if you already trust who is allowed to be a node (a permissioned, internal setup) — it has no way to tell a genuine identity from a fake one, and because there's one leader at a time, attacking that one leader attacks the whole system.",
    },
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "A lecturer asks: what are people actually saving when they save something 'in a blockchain'? Which answer best matches what the lecture taught?",
      options: [
        "A copy of physical currency notes, converted into a digital image so they can be transferred between accounts",
        "A video recording of every transaction being carried out, stored so that disputes can be resolved by watching it back",
        "A list of every user's password, kept so that nodes can log each other into the network automatically",
        "A record of states and the transactions (changes of state) that produced them, which could be a balance, a title, or any other tracked condition",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of a scoreboard: what matters isn't the ball itself, it's the current score and the record of the plays that changed it.\n\n• State: the current condition of something, like an account balance, who owns an asset, or what role a person holds.\n\n• Transaction: a change of state, a transformation from one state to another — it doesn't have to involve money at all.\n\n• Why the others are wrong: a blockchain isn't a currency image store, a video archive, or a password list, it's a record of states and the transactions between them.\n\nSo the answer is: a blockchain saves states and the transactions (changes of state) that produced them.",
    },
    {
      type: "mcq",
      prompt:
        "Which description best matches 'blockchain' as it was introduced in the lecture?",
      options: [
        "A decentralised ledger: a shared record of states, kept and checked across many computers instead of one central owner",
        "A centralised ledger: a single company's private database that only its own employees are permitted to edit",
        "A nightly backup service: a tool that copies files to a second server so they can be restored after a crash",
        "An encrypted messaging app: a tool whose only job is to keep the contents of conversations hidden from outsiders",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine a shared notebook that many people hold copies of, instead of one person locking it in their own drawer.\n\n• Decentralised: no single party owns or fully controls the ledger, many nodes hold and check it together.\n\n• Ledger: a record of states and the transactions that changed them, the same idea people used long before computers existed.\n\n• Why the others are wrong: a private company database is centralised, not decentralised; an encrypted chat app and a backup service solve different problems (secrecy and disaster recovery), not shared, trust-checked record keeping.\n\nSo the answer is: a blockchain is a decentralised ledger.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture says a blockchain gets harder to attack as it grows. What is the reason given, and what does an attacker need to corrupt it?",
      options: [
        "A larger network has fewer active users checking it, so an attacker only needs to control a single node that nobody else is watching",
        "A larger network slows down every transaction, so an attacker needs to control exactly one node that is positioned near the start of the chain",
        "A larger network has more nodes to compare records against, and an attacker needs to control more than 50% of the nodes to corrupt the consensus",
        "A larger network automatically encrypts older transactions more strongly, so an attacker only needs to break the encryption on the newest block",
      ],
      correctIndex: 2,
      modelAnswer:
        "Picture trying to convince a packed stadium that a goal didn't happen, versus convincing just two friends — the more witnesses there are, the harder it is to fake the story.\n\n• More nodes to check against: growth means more copies of the record exist, so a lone corrupted copy stands out faster.\n\n• The 50% threshold: an attacker needs to control more than half of the nodes before they can out-vote the honest majority and corrupt consensus.\n\n• Why the others are wrong: growth doesn't change encryption strength, doesn't slow transactions in the way described, and doesn't reduce the number of nodes watching.\n\nSo the answer is: more nodes mean more copies to cross-check, and an attacker needs over 50% of the nodes to corrupt the network.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture draws a line between 'consensus' and 'ordering'. Which statement correctly describes that difference?",
      options: [
        "Ordering is only a concern for centralised databases, so decentralised blockchains never need to worry about the order of transactions",
        "Consensus and ordering are the same mechanism, so solving one automatically and completely solves the other in every blockchain design",
        "Consensus gets nodes to agree on the current state, but on its own it does not guarantee the order in which events reached every node",
        "Consensus guarantees exact timing of every event across the network, which makes ordering an unnecessary, redundant extra step",
      ],
      correctIndex: 2,
      modelAnswer:
        "Two people shouting answers into a crowded room might eventually agree on the final answer, but that doesn't mean the room agrees on who shouted first.\n\n• Consensus: a mechanism for nodes to agree on the current state, despite starting from different information.\n\n• Ordering: a separate question, which events arrived, or should count as having happened, first — a node near one part of the network can see things in a different order to a node elsewhere.\n\n• Why the others are wrong: the two problems are related but distinct, ordering still matters in decentralised systems, and consensus does not hand you perfect timing for free.\n\nSo the answer is: consensus agrees on state, but it does not by itself guarantee the ordering of events.",
    },
    {
      type: "mcq",
      prompt:
        "In the cat-and-dog shared-wallet example, both try to spend the same $10 from the same account at nearly the same time. What two problems does this create?",
      options: [
        "A conflict over who gets to spend the money, and a risk that different nodes briefly disagree about the account's remaining balance",
        "A conflict over who owns the wallet app itself, and a risk that the wallet's password gets permanently reset for both users",
        "A conflict over who created the wallet first, and a risk that the network stops accepting any transactions from either user forever",
        "A conflict over which currency the wallet should use, and a risk that the transaction history file becomes permanently unreadable",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine two people in different rooms both grabbing for the same last ticket at the same instant, before either store clerk has heard from the other.\n\n• The conflict: both transactions are racing for the same $10, and only one can actually succeed.\n\n• The consistency problem: because the news of the winning transaction takes time to travel, one node might still show $10 left while another already shows $0.\n\n• Why the others are wrong: nothing in the example is about ownership of the app, currency choice, or a broken history file — it's purely about a race over shared funds and temporarily inconsistent balances.\n\nSo the answer is: a spending conflict, plus a short window where different nodes disagree about the account's balance.",
    },
    {
      type: "mcq",
      prompt:
        "In Raft, what are the responsibilities of the leader, follower and candidate roles?",
      options: [
        "Leader only stores backups of the network; follower makes all the real decisions on its own; candidate is a node that has permanently left the voting process",
        "Leader decides the order and distributes updates to the network; follower just applies whatever the leader sends it; candidate is a node currently requesting votes to become leader",
        "Leader and follower perform identical duties at all times; candidate is a separate role that never actually becomes a leader under any circumstance",
        "Leader approves every single transaction by hand; follower rejects any transaction it personally disagrees with; candidate is simply a visitor with no voting rights at all",
      ],
      correctIndex: 1,
      modelAnswer:
        "Picture a classroom where one student reads the final answer aloud, everyone else just copies it down, and occasionally someone puts their hand up asking to be the reader next.\n\n• Leader: decides the order of events and pushes updates out to the rest of the network.\n\n• Follower: just applies whatever the leader sends, without deciding anything itself.\n\n• Candidate: a temporary role a node takes on while it is asking others to vote for it to become the new leader.\n\nSo the answer is: the leader decides and distributes, the follower just applies updates, and the candidate is a node currently requesting votes.",
    },
    {
      type: "mcq",
      prompt:
        "A Raft node stores the state A(term=1, role=Leader, votedFor=A), and its two peers store B(term=1, role=Follower, votedFor=A) and C(term=1, role=Follower, votedFor=A). What does this tell you about the network right now?",
      options: [
        "Node A is permanently the only leader this network can ever have, and B and C are not allowed to ever trigger a new election",
        "Term 1 means the network has already failed once, and B and C are being punished by being locked into the follower role",
        "The three nodes disagree about who the leader is, since A claims leadership while B and C only record themselves as followers",
        "All three nodes are in the first voting round (term 1), they all voted for A, and A has become this round's leader while B and C are followers",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's like a class vote where the ballot sheet records the round number, who each person voted for, and the result — everyone's sheet shows round 1, everyone voted for A, and A won.\n\n• Term: the current voting round; all three nodes agree they are in term 1, so there is no disagreement about which round this is.\n\n• votedFor: every node recorded a vote for A, which is consistent with A winning this round's election.\n\n• Role: A holding Leader while B and C hold Follower is exactly the expected outcome once A has won the vote, it is not a disagreement.\n\nSo the answer is: term 1, all nodes voted for A, and A has become the leader while B and C are followers — the states agree with each other.",
    },
    {
      type: "mcq",
      prompt:
        "Why does Raft use a randomised delay before a follower nominates itself as a candidate, instead of a fixed delay that is the same for every node?",
      options: [
        "So that slower computers are automatically promoted to leader ahead of faster ones, which balances the hardware across the network",
        "So that the leader is forced to change every single round, preventing the same node from ever being re-elected twice",
        "So that followers never need to listen for the leader's heartbeat at all, since the random timer replaces that signal entirely",
        "So that followers don't all start an election at exactly the same moment, which would otherwise split the votes and risk no one winning",
      ],
      correctIndex: 3,
      modelAnswer:
        "If every runner in a race reacted to the starting gun in exactly the same split second, several might cross the first hurdle together and cause a pile-up — staggering their reactions avoids that.\n\n• The problem it avoids: if every follower waited the exact same fixed time after losing the heartbeat, many could become candidates simultaneously and split the vote.\n\n• The fix: a randomised wait means followers are more likely to notice a missing heartbeat at slightly different times, so one usually gets ahead and wins cleanly.\n\n• Why the others are wrong: it has nothing to do with forcing leader rotation, promoting slower hardware, or removing the need for heartbeats.\n\nSo the answer is: randomising the delay reduces the chance that multiple followers call an election at the same moment and split the vote.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture calls Raft a 'distributed but centralised' system, and notes it needs more than 50% of nodes to stay honest. What are its two key limitations?",
      options: [
        "It relies on a single leader at a time, making that leader a single point of failure, and it has no way to verify real identities, so it only suits a trusted, permissioned setup",
        "It only works for cryptocurrency and cannot represent any other kind of state, and it requires every node to be physically in the same building",
        "It cannot run on more than three computers at once, and it requires every transaction to be approved manually by a human operator",
        "It guarantees perfect security against all attacks once deployed, and it requires no heartbeat or election mechanism at all once started",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like a company where everything runs smoothly through one manager — efficient day to day, but if someone fakes being staff, or the manager is taken out, the whole operation is in trouble.\n\n• Single point of failure: there is one leader at a time, so attacking or disabling that leader disrupts the whole network.\n\n• No identity check: Raft has no built-in way to tell a genuine node from a fake one, so it only makes sense in a permissioned, internal setup where membership is already trusted.\n\n• Why the others are wrong: Raft isn't limited to three nodes, doesn't need manual human approval, isn't cryptocurrency-only, and isn't magically immune to all attacks.\n\nSo the answer is: a single leader creates a single point of failure, and Raft has no mechanism to verify real identities, so it only fits a trusted, permissioned setup.",
    },
    {
      type: "mcq",
      prompt:
        "What problem does 'proof of work' solve in the lecture's eclipse-attack recovery example, where Harry's node looks corrupted to its neighbours?",
      options: [
        "It instantly deletes Harry's corrupted data without needing any neighbour nodes to agree first, resolving the dispute immediately",
        "It lets the honest nodes show verifiable evidence of how their state changed over time, so Harry can be convinced which version is actually correct",
        "It permanently bans Harry's node from the network the first time any inconsistency is detected, regardless of who was actually at fault",
        "It encrypts the disputed data so that only Harry's node is able to read it, which prevents the neighbours from comparing it at all",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's like three witnesses independently showing matching, detailed notes of what happened, so the fourth person whose memory is fuzzy can be convinced which version is true.\n\n• The dispute: Harry's node shows a different hash than what its neighbours have saved, so someone's state must be wrong.\n\n• The fix: the neighbours compare notes with each other first, then show Harry verifiable evidence of how their consistent state was reached.\n\n• Why the others are wrong: nothing gets instantly deleted, nobody gets permanently banned on the spot, and encrypting the data would stop a comparison, not enable one.\n\nSo the answer is: proof of work gives nodes verifiable evidence of their state history, which is used to convince the one node that looks out of sync.",
    },
    {
      type: "mcq",
      prompt:
        "What does 'permissionless' mean in the context of a blockchain, and what weakness does the lecture pair it with?",
      options: [
        "Anyone can join, but every single action still needs sign-off from one appointed administrator before it is allowed to happen",
        "It means transactions never require any computing resources at all, since no permission step means no verification step either",
        "Only pre-approved companies are allowed to run nodes, which removes the risk of fake identities almost entirely",
        "No central authority controls who can join or act, but it is cheap to create fake identities, so an adversary can still try to gain over 50% effective control",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's like an open public forum anyone can post in, no gatekeeper approves new accounts — which is great for openness, but also makes it cheap for one person to create dozens of fake accounts.\n\n• Permissionless: nobody needs approval from a central authority to join or act, unlike Raft's permissioned, internal setup.\n\n• The weakness: creating a new identity is cheap, so a single adversary can spin up many fake nodes to try to swing votes or control.\n\n• Why the others are wrong: permissionless is the opposite of needing an administrator's sign-off or pre-approval, and it does not remove the need for computing work.\n\nSo the answer is: permissionless means no central authority grants access, but cheap fake identities remain an open weakness.",
    },
    {
      type: "mcq",
      prompt:
        "Two branches of a blockchain conflict after roughly simultaneous updates. Which rule does the lecture describe for resolving this, and what does it reward?",
      options: [
        "The longest-chain rule: nodes accept the branch that represents the most accumulated work, rewarding the branch that more nodes have built on",
        "The random-coin rule: nodes flip a coin independently, so each node may end up permanently following a different, unreconciled branch",
        "The oldest-node rule: nodes always accept whichever branch was proposed by the node that joined the network first, regardless of recent work",
        "The alphabetical rule: nodes accept whichever branch's proposing node has a name earlier in alphabetical order, as a simple tie-breaker",
      ],
      correctIndex: 0,
      modelAnswer:
        "Two work crews both claim to have built the 'real' road out of town — you follow whichever road is actually longer, since that's the one more work has clearly gone into.\n\n• The rule: when branches conflict, nodes accept the one with the longest chain, meaning the most accumulated work.\n\n• What it rewards: it respects the branch that more of the network has already built on, discarding the shorter branch.\n\n• Why the others are wrong: the decision isn't based on node age, alphabetical names, or independent coin flips, all of which could leave the network permanently split.\n\nSo the answer is: the longest-chain rule, which rewards and keeps the branch with the most accumulated work.",
    },
    {
      type: "mcq",
      prompt:
        "What is an eclipse attack, as described in the lecture?",
      options: [
        "An attacker controls a target node's incoming and outgoing connections, letting them manipulate what that isolated node sees and believes",
        "An attacker steals the private signing key of every node on the network in a single coordinated operation",
        "An attacker overloads the entire network with traffic at once, taking every single node offline simultaneously for a short period",
        "An attacker physically disconnects a data centre's power supply, which is a non-technical attack outside the blockchain's threat model",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine someone intercepting and swapping every letter that reaches one particular house, so that household only ever hears the version of events the interceptor wants them to hear.\n\n• The mechanism: the attacker controls a target node's incoming and outgoing connections, isolating it from the honest network.\n\n• The effect: the attacker can feed that one node delayed, manipulated, or false information, playing with its view of the shared state.\n\n• Why the others are wrong: it targets one node's connections, not the whole network's traffic, not every private key at once, and it isn't a physical power outage.\n\nSo the answer is: an eclipse attack controls a target node's connections to manipulate what that isolated node sees.",
    },
    {
      type: "mcq",
      prompt:
        "What is 'selfish mining', as explained in the lecture?",
      options: [
        "A miner who has already solved the puzzle deliberately delays announcing it, holding back the update to gain an advantage over other nodes",
        "A miner only ever mines puzzles that were specifically assigned to them by a central administrator, ignoring all other requests",
        "A miner refuses to accept any mining rewards at all, choosing to work for the network purely for free out of goodwill",
        "A miner shares their solved puzzle with every node the instant it is solved, maximising transparency across the whole network",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's like finishing a work task early but telling your manager two days later anyway, so you can quietly use the extra time to your own advantage.\n\n• The behaviour: a node that has already solved the puzzle holds back the announcement instead of publishing immediately.\n\n• The payoff: delaying the update to certain parts of the network shifts timing in the selfish miner's favour, since the whole system runs on when updates arrive.\n\n• Why the others are wrong: it isn't about refusing rewards, only mining assigned puzzles, or maximising instant transparency, it is specifically about withholding an already-solved result.\n\nSo the answer is: selfish mining means withholding an already-solved block instead of publishing it immediately, to gain an advantage.",
    },
    {
      type: "mcq",
      prompt:
        "What is the 'imitation attack' (front-running) described in the lecture's Tesla-waiting-list and client-mining examples?",
      options: [
        "An attacker publishes a completely fake product listing that does not correspond to any real asset or request at all",
        "An attacker waits patiently in a public queue and only ever buys an asset after every other legitimate buyer has already been served",
        "An attacker copies another node's public key exactly, then uses that identical key to sign their own unrelated transactions",
        "An attacker, who already knows another party wants a specific asset or result, races to acquire or solve it first, then offers it back at a higher price",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's like someone buying up the last item on a waiting list before you, knowing you want it, just so they can resell it to you later at a markup.\n\n• The mechanism: the attacker already knows a client wants a specific asset or solved puzzle, and races to get there first.\n\n• The payoff: having beaten the legitimate client to it, the attacker offers it back later, often at a worse price or after a delay.\n\n• Why the others are wrong: it isn't about copying a public key, patiently waiting one's turn, or inventing a listing with nothing real behind it, it's specifically about racing ahead of a known pending request.\n\nSo the answer is: an imitation attack means racing ahead of a known pending request to acquire it first, then offering it back at a cost.",
    },
    {
      type: "mcq",
      prompt:
        "What does 'programmability' mean in the blockchain context, using the lecture's counter-contract example?",
      options: [
        "A single administrator can silently rewrite a deployed contract's logic at any time, without needing any node's agreement",
        "Programmability means the blockchain can only store numbers, and is incapable of running any kind of logic or code",
        "Each node is free to run a totally different program from every other node, since blockchains do not require shared logic at all",
        "Code (a smart contract) is deployed on the shared network so every node can call it, and once deployed its logic cannot be changed",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's like publishing the official rulebook for a game where every table plays by the exact same printed rules, and nobody gets to quietly change a rule after the game has started.\n\n• Deployment: a program (contract) is saved on the shared network, and every node can call it, like a counter that adds one each time it's called.\n\n• Immutability: once deployed, the contract's logic cannot be changed, that's what makes it trustworthy as a shared rule.\n\n• Why the others are wrong: all nodes run the same code rather than different programs, no single administrator can silently rewrite it, and contracts can represent much more than plain numbers.\n\nSo the answer is: programmability means deploying shared, callable code whose logic cannot be changed once deployed.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture compares a physical wallet, a bank account, and a house to explain liquidity. Which statement matches what was taught?",
      options: [
        "Liquidity only applies to cryptocurrency, so comparing a physical wallet, bank account, and house to each other is not meaningful",
        "Liquidity is simply the total dollar value of an asset; the house is the most liquid of the three because it is worth the most money",
        "Liquidity is how readily an asset can be used right now; a wallet is highly liquid, a bank account is less so because of limits, and a house is the least liquid",
        "Liquidity means how physically heavy or large an asset is, so the house is the least liquid purely because of its size",
      ],
      correctIndex: 2,
      modelAnswer:
        "Cash in your pocket you can spend the second you need to; money in savings might have withdrawal limits; a house can take months to sell — same value idea, very different speeds.\n\n• Wallet: close to 100% liquid, you can use it immediately, with no restrictions.\n\n• Bank account: less liquid, since daily limits or savings-account rules can restrict how much you can access right away.\n\n• House: the least liquid of the three, since selling it takes real time and effort.\n\nSo the answer is: liquidity is about how readily an asset can be used right now, ranking wallet as most liquid, then bank account, then house.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture explains an AMM-style arrangement where Bob lets Alice trade on his behalf without asking permission each time. What role does 'liquidity' play here?",
      options: [
        "Bob transfers full legal ownership of all his assets to Alice permanently, ending his own ability to ever trade again",
        "Bob makes some of his funds available upfront, so Alice can trade for him instantly without needing fresh permission for every single trade",
        "Bob locks his funds so that neither he nor Alice can access them at all until a government regulator unlocks the account",
        "Bob and Alice must both physically meet in person before any trade can be approved, which removes the need for liquidity entirely",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's like leaving a trusted friend a standing authorisation on a shared account, so they can act for you on the spot instead of calling you for a yes every single time.\n\n• The setup: Bob makes some of his resource available to Alice in advance, through their contract.\n\n• Why it matters: prices move quickly, so if Alice had to ask permission for every trade, the rate could already have changed by the time she got an answer.\n\n• Why the others are wrong: ownership isn't permanently transferred, no in-person meeting is required, and the funds aren't locked away from everyone.\n\nSo the answer is: liquidity here means funds made available in advance, so trades can happen without asking permission each time.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false: according to the lecture, a blockchain becomes easier to attack as more nodes join and the network grows larger.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "Picture trying to fool a packed stadium of witnesses versus fooling two people in an empty room — more honest witnesses makes faking the story harder, not easier.\n\n• What the lecture actually said: growth is a protective property, the more the blockchain grows, the more it becomes secure.\n\n• Why: more nodes means more independent copies to cross-check a claimed state against.\n\n• The attacker still needs a majority: an attacker still needs to control more than 50% of the nodes, and that gets harder as the honest node count rises.\n\nSo the answer is: False, growing larger makes a blockchain harder, not easier, to attack.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false: in Raft, a follower that stops hearing heartbeats from the leader waits a randomised amount of time before it can nominate itself as a candidate, specifically to reduce the chance of a split vote.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "It's like staggering race starts slightly so runners don't all pile into the first hurdle at the exact same instant.\n\n• The trigger: a missing heartbeat from the leader is what allows a follower to consider starting a new election.\n\n• The randomised wait: it's deliberately randomised, not fixed, specifically so multiple followers don't become candidates at the same moment.\n\n• The payoff: this reduces the chance that votes get split evenly across competing candidates with no clear winner.\n\nSo the answer is: True, the randomised delay exists specifically to reduce the chance of a split vote.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly describes transactions, states, and ledgers as taught in the lecture.",
      options: [
        "A blockchain can only represent financial balances, and has no way to represent any non-financial state",
        "Keeping a shared record and comparing copies to catch tampering is an old idea, not something invented by modern blockchains",
        "A transaction is a change of state, and it does not have to involve money at all",
        "A single master copy of a ledger is always more reliable than many independently held copies, according to the lecture",
        "Saving many copies of a ledger across different people or nodes helps make the record reliable, since copies can be cross-checked",
      ],
      correctIndices: [1, 2, 4],
      modelAnswer:
        "A class group project log that several teammates each keep a copy of is the same old idea blockchains automate: many copies, cross-checked, to catch anyone quietly changing the story.\n\n• True, transaction: a change of state, which could be money, a role, an asset, or anything else being tracked.\n\n• True, many copies: redundancy is what lets a ledger be cross-checked and trusted.\n\n• False, financial-only: the lecture explicitly used non-money examples, like a student becoming a faculty member, as a transaction.\n\n• True, old idea: the lecture pointed to historical record-keepers using master copies long before computers existed.\n\n• False, single master copy: the lecture's whole point was that many independently checkable copies beat relying on one copy.\n\nSo the answer is: transaction as change of state, many copies aiding reliability, and this being an old idea are all true.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly describes Raft, as covered in the lecture.",
      options: [
        "Raft defines three roles: leader, follower, and candidate",
        "Because there is a single leader at a time, that leader is a single point of failure in Raft",
        "Raft includes a built-in mechanism for verifying that every node's claimed identity is genuine",
        "A Raft leader is responsible for deciding the order of events and distributing updates to followers",
        "Raft needs more than 50% of its nodes to be honest, or the network can be corrupted",
      ],
      correctIndices: [0, 1, 3, 4],
      modelAnswer:
        "Think of a classroom with one reader, several note-copiers, and occasionally someone raising a hand to become the next reader — that's the leader, followers, and candidate, minus any way to check who's actually enrolled in the class.\n\n• True, three roles: leader, follower, candidate are exactly the roles Raft defines.\n\n• True, leader's job: deciding order and distributing updates is the leader's core responsibility.\n\n• False, identity check: the lecture was explicit that Raft has no protection against fake or impersonated identities.\n\n• True, majority honesty: more than 50% of nodes need to stay honest, or the network's consensus gets corrupted.\n\n• True, single point of failure: a single leader at a time means attacking that leader disrupts the whole network.\n\nSo the answer is: the three roles, the leader's job, the majority-honesty requirement, and the single point of failure are all true — only the identity-verification claim is false.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly describes permissionless systems and their weaknesses, as covered in the lecture.",
      options: [
        "Proof of work helps a node offer other nodes verifiable evidence that its claimed state is correct",
        "The longest-chain rule is used to resolve conflicts between competing branches by favouring the one with the most accumulated work",
        "Because it is permissionless, it is automatically impossible for any adversary to ever gain majority control",
        "A permissionless system is decentralised, with no central authority controlling who can join or act",
        "Creating a new fake identity in a permissionless system is typically cheap and does not require much extra effort",
      ],
      correctIndices: [0, 1, 3, 4],
      modelAnswer:
        "An open public forum anyone can join, with no ID check at the door, is easy to get into — but exactly as easy for someone to open ten more fake accounts and try to out-vote everyone else.\n\n• True, decentralised: no central authority grants access or permission.\n\n• True, cheap fake identities: creating new identities doesn't require much complexity, compute, or energy.\n\n• False, automatically safe: being permissionless does not stop an adversary from trying to gain over 50% effective control, it actually makes fake identities easier to create.\n\n• True, longest chain: conflicts between branches are resolved by favouring the one with the most accumulated work.\n\n• True, proof of work: it gives nodes verifiable evidence to support a claimed state.\n\nSo the answer is: decentralisation, cheap fake identities, the longest-chain rule, and proof of work are all true — permissionless does not mean automatically safe from majority attacks.",
    },
    {
      type: "multi",
      prompt:
        "Select every statement below that correctly matches an attack to its mechanism, as covered in the lecture.",
      options: [
        "Eclipse attack: the attacker controls a target node's incoming and outgoing connections, isolating it from the honest network",
        "Imitation attack: an attacker races ahead of a client's known pending request to acquire or solve it first",
        "51% attack: an attacker secretly encrypts every other node's ledger so that only the attacker can read any transaction",
        "Selfish mining: a node that has already solved the puzzle withholds announcing it, to gain a timing advantage",
        "Sandwich attack: an attacker trades around a victim's pending trade to profit from the price movement (slippage) it causes",
      ],
      correctIndices: [0, 1, 3, 4],
      modelAnswer:
        "Four different ways to cheat a shared system: cutting off one person's mail, sitting on finished work, trading around someone else's order, and racing ahead of someone you know is about to buy.\n\n• True, eclipse attack: controlling a target node's connections to isolate and manipulate what it sees.\n\n• True, selfish mining: withholding an already-solved block instead of announcing it immediately.\n\n• True, sandwich attack: trading before and after a victim's pending trade to profit from the price slippage it causes.\n\n• True, imitation attack: racing ahead of a known pending request to claim it first.\n\n• False, 51% attack: it's about controlling over half the nodes to out-vote consensus, not about encrypting everyone else's ledger.\n\nSo the answer is: eclipse, selfish mining, sandwich, and imitation attacks are all correctly described — the 51% attack description is false.",
    },
    {
      type: "order",
      prompt:
        "Put the steps of a Raft leader election, as described in the lecture, into the correct order.",
      steps: [
        "A follower stops hearing heartbeat messages from the current leader",
        "After a randomised delay, the node nominates itself, becoming a candidate and voting for itself",
        "The candidate sends a vote request to its peer nodes",
        "Peers that have not already voted this term reply, accepting or rejecting the candidate",
        "Once the candidate receives votes from a majority of nodes, it becomes the new leader",
        "The new leader begins sending heartbeats to its followers",
      ],
      modelAnswer:
        "It's the same shape as a classroom losing its reader: silence is noticed, someone waits a beat then puts their hand up, asks classmates to back them, gets enough nods, and starts reading aloud once they've won.\n\n• Missing heartbeat is the trigger that starts the whole process.\n\n• The randomised delay before self-nomination is what keeps multiple nodes from colliding into an election at once.\n\n• Requesting votes, then collecting replies, is how the network actually decides.\n\n• A majority of votes is the win condition, after which the new leader starts heartbeats to confirm its role to everyone.\n\nSo the answer is: missed heartbeat, randomised delay then self-nomination, vote request, peer replies, majority win becomes leader, then heartbeats begin.",
    },
    {
      type: "match",
      prompt:
        "Match each blockchain attack to the mechanism the lecture described for it.",
      pairs: [
        { left: "Eclipse attack", right: "controls a target node's incoming and outgoing connections to isolate and manipulate it" },
        { left: "Selfish mining", right: "a node that solved the puzzle withholds announcing it, to gain a timing advantage" },
        { left: "Sandwich attack", right: "trades around a victim's pending trade to profit from the price slippage it causes" },
        { left: "Imitation attack", right: "races ahead of a client's known pending request to claim it first" },
        { left: "51% attack", right: "an adversary gains control of more than half the nodes, corrupting consensus" },
      ],
      decoys: ["encrypts every node's stored ledger so only the attacker can read any transaction"],
      modelAnswer:
        "Five different ways to cheat a shared, trust-based system, each exploiting a different weak point: a node's connections, its honesty about finishing work, a victim's visible pending trade, a known future request, or raw voting power.\n\n• Eclipse and selfish mining both target what one node sees or chooses to share, just through different means.\n\n• Sandwich and imitation attacks both exploit knowing what someone else is about to do, before they've finished doing it.\n\n• The 51% attack is the blunt, majority-control version that the other, subtler attacks are trying to avoid needing.\n\n• The decoy describes mass encryption of other nodes' ledgers, which is not a mechanism the lecture described for any of these attacks.\n\nSo the answer is: match each attack to its own mechanism, and leave the mass-encryption description as the decoy.",
    },
  ],
};

export const WEEK_9_PAPERS: ExamPaperSeed[] = [LECTURE_PAPER, BLOCKCHAIN_PAPER];
