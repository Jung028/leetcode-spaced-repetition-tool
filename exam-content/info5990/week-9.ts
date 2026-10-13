import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 9,
  paperNumber: 1,
  title: "Week 9 Tutorial: Cloud Security (DataLeak Ltd.)",
  topics:
    "The main goal of information security and why cloud adoption has changed how organisations approach IT security. Cloud deployment models (public, private, hybrid, community) and cloud service models (IaaS, PaaS, SaaS, FaaS). The DataLeak Ltd. case study: a mid-sized HR and payroll company on a hybrid cloud (payroll/client data on public cloud IaaS, employee records on a private on-premise server, remote work via VPN and shared cloud storage) whose misconfigured public S3 bucket (no authentication restrictions), weak employee passwords and disabled MFA exposed payroll data for 15,000 employees. Identifying the primary causes and the information security domains breached; how an Incident Response Plan would have changed the outcome; Disaster Recovery and Business Continuity measures; cloud security controls (technical and procedural) that could have prevented the breach; and how NIST and GDPR frameworks guide the company's next steps.",
  sourceFiles: [
    "tutorial/INFO5990 2026-S1 Week 9 Tutorial sheet.pdf",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "Part A of the tutorial opens by asking: what is the main goal of information security?",
      options: [
        "Protecting the confidentiality, integrity and availability of information, no matter what form it is in",
        "Making sure every system is connected to the internet so staff can access data from anywhere",
        "Buying the newest security software so the IT department has the most advanced tools available",
        "Keeping all company data permanently, since deleting anything risks losing something useful later",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of a house with a locked front door, sturdy walls that keep out the weather, and a light switch that always works when you flip it. Information security is the same idea applied to data: keep the wrong people out, keep the information accurate, and make sure the right people can get to it when they need it.\n\n• Confidentiality: only authorised people can see the information, like only family members having a key to the house.\n\n• Integrity: the information is accurate and has not been tampered with, like nobody sneaking in and rearranging the furniture.\n\n• Availability: authorised people can access it when they need to, like the lights turning on whenever you flip the switch.\n\n• Why the others are wrong: being reachable from anywhere, owning the newest tools, and hoarding every piece of data forever are not the goal itself, they are choices that can actually work against confidentiality, integrity and availability if done carelessly.\n\nSo the answer is: the main goal of information security is protecting the confidentiality, integrity and availability of information.",
    },
    {
      type: "mcq",
      prompt:
        "Part A also asks why cloud adoption has changed the way organisations approach IT security. Which answer best captures this?",
      options: [
        "Cloud adoption removes the need for any security controls, because the cloud provider automatically protects all of the customer's data",
        "The organisation now shares security responsibility with cloud providers and must secure a wider, more distributed attack surface spanning remote users and third-party infrastructure",
        "Cloud adoption only changes where files are stored, so the security approach an organisation used for its own data centre stays exactly the same",
        "Cloud adoption mainly affects the marketing department, since cloud services are chosen for cost savings rather than for technical reasons",
      ],
      correctIndex: 1,
      modelAnswer:
        "Imagine moving out of a house you built yourself into an apartment block. The building manager now looks after the walls and the lift, but you still have to lock your own door, and you now also have to worry about the shared lobby and the other tenants' doors.\n\n• Shared responsibility: the cloud provider secures the underlying infrastructure, but the organisation is still responsible for configuring access, identities and data correctly, exactly like the misconfigured S3 bucket in this case study.\n\n• Bigger, more distributed surface: remote staff, personal devices, shared storage and multiple vendors all create more places for something to go wrong than a single on-premise data centre did.\n\n• Why the others are wrong: 'no controls needed' ignores shared responsibility and is how breaches like this one happen, 'nothing changes' ignores that new risks like misconfiguration and third-party access appear, and reducing it to a marketing decision ignores the real security trade-offs.\n\nSo the answer is: cloud adoption spreads responsibility between the organisation and the provider and widens the attack surface, which is exactly why new security practices are needed.",
    },
    {
      type: "match",
      prompt:
        "Match each cloud deployment model discussed in Part A to its correct description.",
      pairs: [
        {
          left: "Public Cloud",
          right:
            "Services offered over the internet by a third-party provider on infrastructure shared between customers, such as AWS or Azure",
        },
        {
          left: "Private Cloud",
          right:
            "Cloud infrastructure dedicated to a single organisation, giving more control and security",
        },
        {
          left: "Hybrid Cloud",
          right:
            "Combines public and private clouds, allowing flexible distribution of workloads between them",
        },
        {
          left: "Community Cloud",
          right:
            "Infrastructure shared between organisations with a common interest, such as government or healthcare consortia",
        },
      ],
      decoys: [
        "Runs application code in response to events without the customer managing any servers",
        "A fully managed software product the customer accesses entirely through a web browser",
      ],
      modelAnswer:
        "Think of renting a shared taxi, owning your own car, switching between the two depending on the trip, or car-pooling with neighbours who all commute to the same office park.\n\n• Public Cloud: a shared taxi service anyone can book, like AWS or Azure.\n\n• Private Cloud: your own car, parked in your own garage, under your own control.\n\n• Hybrid Cloud: sometimes you drive your own car, sometimes you book the taxi, depending on what the trip needs.\n\n• Community Cloud: a car-pool used only by people with the same destination, like a group of government agencies.\n\n• Why the decoys are wrong: running code without managing a server and buying fully managed software are cloud service models, which describe what you get, not where the infrastructure lives or who else shares it.\n\nSo the answer is: Public Cloud is shared third-party infrastructure, Private Cloud is dedicated to one organisation, Hybrid Cloud mixes the two, and Community Cloud is shared by organisations with a common interest.",
    },
    {
      type: "match",
      prompt:
        "Match each cloud service model discussed in Part A to its correct description.",
      pairs: [
        {
          left: "IaaS (Infrastructure as a Service)",
          right:
            "Provides virtualised computing resources such as servers, storage and networking, e.g. AWS EC2",
        },
        {
          left: "PaaS (Platform as a Service)",
          right:
            "Provides a platform for building and deploying applications, e.g. Google App Engine",
        },
        {
          left: "SaaS (Software as a Service)",
          right:
            "Provides fully managed software accessible via the web, e.g. Microsoft 365",
        },
        {
          left: "FaaS / Serverless",
          right:
            "Runs code triggered by events without the customer managing any servers, e.g. AWS Lambda",
        },
      ],
      decoys: [
        "Infrastructure dedicated to a single organisation for more control and security",
        "A combination of public and private clouds used for flexible workload distribution",
      ],
      modelAnswer:
        "Think of renting an empty block of land, renting a half-built house with the plumbing already done, renting a fully furnished apartment, or paying only for the minutes you actually spend in a hotel room.\n\n• IaaS: the empty block of land, you still build and manage almost everything yourself, like virtual servers and storage.\n\n• PaaS: the half-built house, the foundations and plumbing (the platform) are done for you so you can focus on building the application.\n\n• SaaS: the fully furnished apartment, you just move in and use the software, like Microsoft 365.\n\n• FaaS: pay only for the minutes you use, your code runs briefly in response to an event and you never manage a server at all.\n\n• Why the decoys are wrong: 'dedicated to a single organisation' and 'a mix of public and private' describe cloud deployment models, which is about who owns and shares the infrastructure, not how much of the technology stack the customer manages.\n\nSo the answer is: IaaS gives raw infrastructure, PaaS gives a development platform, SaaS gives ready-to-use software, and FaaS runs event-triggered code with no server management.",
    },
    {
      type: "mcq",
      prompt:
        "DataLeak Ltd. is a mid-sized HR and payroll company. Payroll and client data sit on a public cloud (IaaS), while sensitive employee records remain on a private on-premise server, and staff work remotely over VPN with shared cloud storage. Which cloud deployment model does this describe?",
      options: [
        "Public cloud only, because the company's VPN traffic always eventually passes through the internet",
        "Private cloud only, because sensitive employee records never leave the company's own server",
        "Hybrid cloud, because it combines public cloud infrastructure with a private on-premise server",
        "Community cloud, because payroll and HR companies across the industry often share the same infrastructure",
      ],
      correctIndex: 2,
      modelAnswer:
        "Picture a business that rents a warehouse from a shared logistics company for its general stock, but keeps its most valuable items locked in a safe it owns outright at head office. It is using two different kinds of storage for two different kinds of risk.\n\n• Public cloud component: payroll and client data sit on rented infrastructure (IaaS) from a third-party provider.\n\n• Private cloud component: sensitive employee records stay on a server the company owns and controls itself.\n\n• Hybrid cloud: using both of these together, choosing which data goes where based on sensitivity, is the definition of a hybrid deployment.\n\n• Why the others are wrong: calling it 'public only' ignores the private on-premise server, calling it 'private only' ignores the public cloud payroll data, and nothing in the case suggests the infrastructure is shared specifically with other payroll companies, which is what community cloud means.\n\nSo the answer is: hybrid cloud, because DataLeak Ltd. deliberately splits data between public cloud and private on-premise infrastructure.",
    },
    {
      type: "mcq",
      prompt:
        "The investigation found that an S3 bucket holding DataLeak Ltd.'s payroll data was publicly accessible. Which cloud service model was the payroll data stored under?",
      options: [
        "SaaS, since an S3 bucket is a fully managed software product that staff simply log into through a web dashboard and use without any backend configuration",
        "PaaS, since an S3 bucket is a development platform used to build, test and deploy new applications without managing the underlying servers directly",
        "FaaS, since storing files in a bucket only happens briefly whenever a specific event, such as an upload trigger, causes a short-lived function to run",
        "IaaS, since it was described as being hosted on the public cloud as raw storage infrastructure rather than through a managed application or platform",
      ],
      correctIndex: 3,
      modelAnswer:
        "An S3 bucket is like renting raw shelf space in a warehouse: the storage provider supplies the shelving and the building, but you decide what goes on the shelf and who is allowed to walk in and look at it.\n\n• The tutorial sheet explicitly describes the payroll and client data as hosted on 'a public cloud (IaaS)', and object storage buckets are a classic IaaS-level resource.\n\n• Why the others are wrong: SaaS would mean DataLeak Ltd. was using someone else's finished software product, PaaS would mean it was a platform for building applications, and FaaS describes short-lived, event-triggered code execution, none of which match plain object storage.\n\nSo the answer is: IaaS, since the bucket was raw cloud storage infrastructure that DataLeak Ltd. had to configure and secure itself.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that the case study identifies as primary causes of DataLeak Ltd.'s security incident.",
      options: [
        "The public cloud storage bucket was misconfigured and lacked authentication restrictions",
        "A cybersecurity firm failed to notify DataLeak Ltd. about the exposed data for over a year",
        "Several employees used weak passwords",
        "Multi-factor authentication was disabled to simplify remote access",
        "DataLeak Ltd.'s private on-premise server was physically broken into overnight",
      ],
      correctIndices: [0, 2, 3],
      modelAnswer:
        "Imagine a shop that leaves its storeroom door unlocked, gives staff easy-to-guess keys, and removes the alarm system because it kept going off by accident. Any one of those is risky, and together they practically invite trouble.\n\n• The misconfigured S3 bucket lacking authentication restrictions is the direct technical cause named in the case.\n\n• Weak employee passwords and MFA being disabled for convenience are the identity and access causes named in the case.\n\n• Why the others are wrong: the case says a cybersecurity firm promptly notified DataLeak Ltd., so there was no delay on their part, and there is no mention anywhere of a physical break-in, the breach was entirely a cloud misconfiguration and weak-credential problem.\n\nSo the answer is: the misconfigured bucket, weak passwords and disabled MFA are the three primary causes described.",
    },
    {
      type: "multi",
      prompt:
        "Which domains of information security (cyber, data, operational, physical) does the DataLeak Ltd. incident touch? Select ALL that apply.",
      options: [
        "Cyber, because the exposure happened through an internet-facing cloud storage service",
        "Data, because the core failure was sensitive payroll data being left unprotected and exposed",
        "Operational, because weak passwords and disabled MFA reflect a gap in the company's day-to-day security processes and policies",
        "Physical, because the breach involved someone physically entering DataLeak Ltd.'s office or data centre",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "A storeroom can fail in different ways: someone could pick the digital lock, the goods inside could be left unlabelled and exposed, or staff could simply forget to follow the closing-up checklist. None of those require someone to physically break down a wall.\n\n• Cyber: the exposure happened over the internet through a misconfigured cloud service, a classic cyber security domain issue.\n\n• Data: the actual harm was sensitive payroll data being exposed, which is squarely a data security failure.\n\n• Operational: disabling MFA 'to simplify remote access' and allowing weak passwords are process and policy failures, which is operational security (OPSEC).\n\n• Why physical is wrong: nothing in the case involves unauthorised physical entry to a building, server room, or device, the entire incident happened through misconfigured cloud access.\n\nSo the answer is: cyber, data and operational security domains were all breached, but physical security was not involved.",
    },
    {
      type: "mcq",
      prompt:
        "Part B asks: how would a proper Incident Response Plan (IRP) have changed the outcome for DataLeak Ltd.? Which answer best reflects what an IRP actually does?",
      options: [
        "It would have given DataLeak Ltd. a structured, rehearsed process to detect, contain and recover from the exposure faster, reducing how long the data stayed exposed and how much damage resulted",
        "It would have made the breach impossible to happen in the first place, since an IRP is itself a technical control that blocks misconfigurations",
        "It would only have mattered after the breach was already fixed, since an IRP is purely a document for lawyers to review once an incident is over",
        "It would have transferred all legal responsibility for the breach to the cybersecurity firm that discovered it",
      ],
      correctIndex: 0,
      modelAnswer:
        "A fire drill does not stop a fire from starting, but it does mean everyone already knows exactly what to do the moment the alarm goes off, so the damage is far smaller than if people were figuring it out for the first time while the building fills with smoke.\n\n• An Incident Response Plan is a structured approach for detecting, responding to and recovering from incidents, not a tool that prevents the initial misconfiguration.\n\n• With a tested IRP, DataLeak Ltd. would likely have detected the exposed bucket sooner through monitoring, contained it faster by locking it down immediately, and recovered in a more coordinated way.\n\n• Why the others are wrong: an IRP does not block a misconfiguration from happening, it is not a document that only gets used after the fact, and it does not shift legal responsibility onto whoever happens to discover the breach.\n\nSo the answer is: a proper IRP would have sped up detection and containment, limiting the scale and duration of the exposure.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that are genuine Disaster Recovery (DR) actions DataLeak Ltd. could take in response to this incident, as distinct from Business Continuity measures.",
      options: [
        "Restoring the affected cloud storage and payroll systems from clean, verified backups",
        "Rebuilding and re-securing the misconfigured cloud environment before bringing it back online",
        "Setting up a temporary manual payroll process so staff still get paid while systems are restored",
        "Running a company-wide town hall to reassure customers that service will continue during the outage",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "After a burst pipe floods an office, the plumber's job is to fix the pipe and dry out the damaged room. Keeping the business trading in the meantime, like setting up a temporary desk elsewhere, is a completely different job done by someone else.\n\n• Disaster Recovery focuses on restoring IT systems, data and infrastructure, exactly like restoring from clean backups and rebuilding the secured environment.\n\n• Business Continuity focuses on keeping essential business operations running during and after the disruption, which is what the manual payroll workaround and the reassurance town hall are really about.\n\n• Why the last two are wrong here: they are valuable actions, but they belong to Business Continuity, not Disaster Recovery, because they are about continuing operations for people, not restoring IT systems.\n\nSo the answer is: restoring from backups and rebuilding the secured cloud environment are the Disaster Recovery actions.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that are genuine Business Continuity measures DataLeak Ltd. could take in response to this incident, as distinct from Disaster Recovery actions.",
      options: [
        "Running a temporary manual or paper-based payroll process so employees still get paid on time",
        "Notifying affected employees and clients promptly to maintain their trust while systems are investigated",
        "Patching the firewall and overwriting the compromised disks with DoD-standard wiping software",
        "Restoring the exposed data store from the most recent clean backup",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "If the usual delivery van breaks down, the business does not stop serving customers, it borrows a van or uses a courier for a few days while the real van gets fixed. Keeping customers served is one job; fixing the van is a different job.\n\n• Business Continuity measures keep essential operations like paying staff and communicating with clients running through the disruption.\n\n• A temporary manual payroll process and prompt, honest communication with affected people both keep the business functioning and protect trust, which is exactly what BCP is for.\n\n• Why the others are wrong: patching the firewall and restoring from backup are technical restoration actions, they belong to Disaster Recovery, not to keeping the business operating for people.\n\nSo the answer is: the manual payroll workaround and prompt stakeholder communication are the Business Continuity measures.",
    },
    {
      type: "mcq",
      prompt:
        "Which technical cloud security control, if it had been in place, would most directly have prevented the DataLeak Ltd. breach?",
      options: [
        "A company-wide policy requiring staff to change their email signature every quarter",
        "A correctly configured access policy on the storage bucket that blocks public, unauthenticated access by default",
        "A faster corporate internet connection so employees could upload payroll files more quickly",
        "A larger marketing budget to hire more HR staff for the payroll team",
      ],
      correctIndex: 1,
      modelAnswer:
        "Leaving a storeroom door unlocked is the problem, so the fix is locking the door, not repainting the shop sign or hiring more cashiers.\n\n• The root technical cause was a bucket with no authentication restrictions, meaning anyone on the internet could read it.\n\n• A correctly configured access policy, denying public access by default and only allowing specific authenticated identities, directly closes that exact gap.\n\n• Why the others are wrong: a signature policy, a faster internet connection and a bigger HR budget have nothing to do with who can read a cloud storage bucket.\n\nSo the answer is: enforcing a properly configured, non-public access policy on the storage bucket is the control that would have stopped this specific breach.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following cloud security controls (technical or procedural) that could have prevented or reduced the impact of this breach.",
      options: [
        "Enforcing multi-factor authentication (MFA) for all remote access, instead of disabling it for convenience",
        "Regularly auditing cloud storage configurations to catch publicly accessible buckets before attackers do",
        "Enforcing strong password policies instead of allowing weak, easily guessed passwords",
        "Switching the company's website to a more visually appealing template",
        "Applying the principle of least privilege so accounts only have the access they actually need",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "Securing a storeroom properly means locking the door, checking the locks regularly, giving out keys that are hard to copy, and only handing keys to people who actually need to go in there. Repainting the shopfront does nothing for any of that.\n\n• MFA, strong passwords and least privilege are all identity and access controls that directly address the weak-credential side of this breach.\n\n• Regular configuration audits are exactly how a misconfigured, publicly accessible bucket gets caught before an attacker finds it.\n\n• Why the website redesign is wrong: it is a cosmetic, unrelated change that has no bearing on who can access sensitive cloud storage or employee accounts.\n\nSo the answer is: MFA, configuration audits, strong passwords and least privilege are all genuine preventive controls here.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial asks how the NIST Cybersecurity Framework guides DataLeak Ltd.'s next steps. Which description best fits how NIST's five functions apply here?",
      options: [
        "NIST only applies to government agencies and critical infrastructure operators, so it has no relevance at all to a private HR and payroll company like DataLeak Ltd.",
        "NIST is a single mandatory checklist that DataLeak Ltd. must complete exactly once, after which no further security review or updates are ever required again",
        "Identify the exposed assets and risk, Protect them with proper access controls, Detect future incidents faster, Respond to contain the exposure, and Recover systems and trust",
        "NIST replaces the need for a separate Incident Response Plan entirely, since the framework's five functions automatically handle containment, eradication and recovery on their own",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of NIST's five functions as a five-step first-aid routine: work out what is hurt, protect it from getting worse, watch for new problems, treat the injury, and then help the patient get back on their feet.\n\n• Identify: understand what data and systems were exposed and why.\n\n• Protect: put real access controls and secure configurations in place.\n\n• Detect: build monitoring so a public bucket or unusual access gets flagged quickly next time.\n\n• Respond: contain the exposure and notify affected people.\n\n• Recover: restore systems and rebuild trust with employees and clients.\n\n• Why the others are wrong: NIST CSF was built for critical infrastructure but is widely adopted by organisations of all kinds including private companies, it is a flexible risk-based framework rather than a one-off checklist, and it does not replace an IRP, it describes the categories of activity an IRP should cover.\n\nSo the answer is: NIST's five functions give DataLeak Ltd. a structured path from understanding the exposure through to full recovery.",
    },
    {
      type: "mcq",
      prompt:
        "How does the GDPR guide DataLeak Ltd.'s next steps after this breach, given the case states the incident violated GDPR and local privacy laws?",
      options: [
        "It only applies if DataLeak Ltd. is physically headquartered inside the European Union, so it has no bearing on this case at all",
        "It requires DataLeak Ltd. to permanently delete every employee record it holds, regardless of legal retention requirements",
        "It only governs how fast DataLeak Ltd.'s internet connection must be when transferring data between its cloud regions",
        "It obliges DataLeak Ltd. to assess the breach, limit further exposure, and meet its accountability and notification obligations to affected individuals and regulators",
      ],
      correctIndex: 3,
      modelAnswer:
        "If you promise someone you will keep their diary locked up and someone else reads it anyway, the right response is not to pretend nothing happened, it is to tell them what happened, explain what you are doing about it, and show you are taking it seriously going forward.\n\n• GDPR's accountability principle means an organisation must be able to demonstrate compliance, which includes investigating and documenting what went wrong.\n\n• GDPR requires timely breach notification to affected individuals and regulators, and DataLeak Ltd. exposing 15,000 employees' payroll data is exactly the scale of incident that triggers these obligations.\n\n• Why the others are wrong: GDPR has extraterritorial reach and can apply to organisations handling EU residents' data regardless of headquarters location, it does not demand blanket deletion of all records regardless of legitimate retention needs, and it has nothing to do with internet connection speed.\n\nSo the answer is: GDPR pushes DataLeak Ltd. toward accountability, breach containment and proper notification of the people affected.",
    },
    {
      type: "mcq",
      prompt:
        "Using the Reading 2 framing of the cyberattack pathway, the misconfigured S3 bucket that exposed DataLeak Ltd.'s payroll data without any attacker needing to break in is best described as which kind of event?",
      options: [
        "A data leak, because it was an unintentional exposure caused by a misconfiguration rather than a planned cyberattack forcing through an IT boundary",
        "A data breach, because it required an attacker to execute a five-phase cyberattack pathway starting with a phishing email",
        "Neither a leak nor a breach, because no data was actually copied, transmitted, viewed, or accessed by anyone unauthorised",
        "A disaster, because it directly caused physical damage to DataLeak Ltd.'s private on-premise server",
      ],
      correctIndex: 0,
      modelAnswer:
        "Leaving your front door wide open by mistake is different from someone picking the lock to break in. Both end with a stranger inside your house, but only one of them involved an attacker actually forcing their way through a defence.\n\n• A data leak is an unintentional exposure of sensitive data, such as an overlooked misconfiguration, with no attacker needing to force their way through any defence.\n\n• A data breach is the outcome of a planned cyberattack where an external party forces through an IT boundary, usually by exploiting a vulnerability across several stages.\n\n• The S3 bucket had no authentication restrictions at all, so there was no boundary for an attacker to break through, which is the hallmark of a leak rather than a breach.\n\n• Why the others are wrong: no phishing email or multi-stage attack is described in this case, sensitive payroll data for 15,000 employees was clearly exposed, and nothing in the case involves physical damage to the on-premise server.\n\nSo the answer is: this was a data leak, an unintentional exposure caused by misconfiguration rather than a planned attack.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false? According to the case study, DataLeak Ltd.'s private on-premise employee records server was also directly compromised in this incident.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "The case only describes the safe being left unlocked in the public storeroom, not someone also breaking into the locked office at head office.\n\n• The case states the incident involved payroll data found publicly accessible, traced back to a misconfigured public cloud (IaaS) storage bucket.\n\n• The private on-premise server holding sensitive employee records is never mentioned as being accessed, compromised, or affected by this particular incident.\n\n• Why this matters: it shows the hybrid cloud split actually limited the damage, only the public cloud side was exposed, which is a point worth raising when discussing how deployment-model choices affect blast radius.\n\nSo the answer is: false, the incident as described only affected the public cloud payroll data, not the private on-premise employee records.",
    },
    {
      type: "mcq",
      prompt:
        "The case notes that several employees used weak passwords and that MFA was disabled 'to simplify remote access.' Which underlying security discipline does this gap in remote-work security best belong to?",
      options: [
        "Disaster Recovery, since it is about restoring systems and data after an outage or disruptive event rather than about how a user logs in",
        "Identity and Access Management (IAM), since it is about controlling who can prove they are who they claim to be and what they can then access",
        "Data archival, since it is about retaining and organising old records for long-term compliance and legal retention reasons, not login security",
        "Hacktivism, since it describes politically motivated activists disrupting or defacing a service to make a public statement or protest",
      ],
      correctIndex: 1,
      modelAnswer:
        "A nightclub bouncer who stops checking IDs because the line is moving too slowly has just made it trivially easy for anyone to walk in and cause trouble, no matter how good the rest of the club's security is.\n\n• Identity and Access Management (IAM) is specifically about verifying who someone is (authentication, including MFA) and controlling what they are allowed to do once inside (authorisation).\n\n• Weak passwords and disabled MFA are textbook IAM failures, they make it easy for an attacker, or in this case an open bucket, to be reached using compromised or guessable credentials.\n\n• Why the others are wrong: Disaster Recovery is about restoring systems after disruption, data archival is about long-term retention, and hacktivism describes a type of attacker motivation, none of which describe a login-security gap.\n\nSo the answer is: this is an Identity and Access Management gap.",
    },
    {
      type: "fillblank",
      prompt:
        "According to the case study, the exposed payroll data belonged to ___ employees.",
      blanks: [["15,000", "15000"]],
      modelAnswer:
        "Imagine every seat in a large stadium holding one person's payroll file, now imagine that whole stadium's worth of files left sitting on an unlocked public shelf.\n\n• The case states a cybersecurity firm notified DataLeak Ltd. that sensitive payroll data for 15,000 employees had been found publicly accessible on the internet.\n\n• This scale is exactly why the incident triggered GDPR and local privacy law concerns, reputational damage, and potential regulatory fines.\n\nSo the answer is: 15,000 employees.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the impacts that the DataLeak Ltd. case study explicitly lists as consequences of the breach.",
      options: [
        "Exposure of names, salary details, and tax information",
        "Violation of GDPR and local privacy laws",
        "Reputational damage and potential regulatory fines",
        "Business operations disrupted as access to cloud storage was suspended for review",
        "Immediate bankruptcy and closure of DataLeak Ltd.",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "A spilled drink at a party has a clear list of consequences: the carpet is stained, the host is embarrassed, the party might get cut short while it is cleaned up, and the guests remember it. It does not mean the house burns down.\n\n• The case lists exactly four impacts: exposure of names, salary details and tax information; GDPR and local privacy law violations; reputational damage and potential regulatory fines; and disrupted operations while cloud storage access was suspended for review.\n\n• Why the last option is wrong: nothing in the case states or implies DataLeak Ltd. went out of business, that is an exaggeration well beyond what the case describes.\n\nSo the answer is: the first four impacts are exactly what the case study lists; bankruptcy is not mentioned.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following best explains why remote work, specifically VPN access and shared cloud storage, is called out as a contributing factor in this case, even though the breach itself was caused by the storage bucket?",
      options: [
        "Remote work caused the actual data exfiltration directly, since VPN traffic is always fully visible to outside attackers by design regardless of encryption",
        "Remote work is entirely irrelevant to this case and is only mentioned as unrelated background detail with no bearing on how the breach actually occurred",
        "Remote work widened the ways staff could connect to systems, and MFA being disabled 'to simplify remote access' shows convenience was prioritised over security in that wider access model",
        "Remote work means employees physically carried printed paper payroll files between home and the office instead of using any digital transfer method",
      ],
      correctIndex: 2,
      modelAnswer:
        "Giving every staff member a spare key to take home is convenient, but it only stays safe if you are just as careful about who gets a key and how it is used as you were when everyone worked from one locked building.\n\n• The case explicitly ties MFA being disabled to 'simplify remote access', showing that the shift to VPN and shared cloud storage created pressure to loosen a security control for convenience.\n\n• That trade-off, convenience over security, is the real link between remote work and the eventual weak-credential problem, even though the technical failure was the bucket configuration.\n\n• Why the others are wrong: VPNs encrypt traffic and are not inherently visible to outside attackers, remote work is directly named as part of the background, and nothing in the case describes physical paper files.\n\nSo the answer is: remote work widened access and created pressure to disable MFA for convenience, which is a real contributing factor even though the technical cause was the misconfigured bucket.",
    },
    {
      type: "order",
      prompt:
        "Now that the exposed bucket has been discovered, put DataLeak Ltd.'s next incident-handling actions in the correct order, from first to last.",
      steps: [
        "Lock down the bucket immediately to stop any further public access",
        "Determine the full scope of what data was exposed and for how long",
        "Notify affected employees and the relevant regulators as required",
        "Investigate and fix the root cause across all cloud storage, not just this one bucket",
        "Review the incident afterward and update policies, training and monitoring",
      ],
      modelAnswer:
        "If you find your front door wide open, you shut it first, then work out what might be missing, then tell anyone who needs to know, then check every other door in the house, and finally decide how to stop it happening again.\n\n• Containment first: stop the ongoing exposure before anything else, every minute the bucket stays open is more risk.\n\n• Scope next: you cannot notify anyone properly or fix the real cause until you know what was exposed and for how long.\n\n• Notification follows scoping: affected individuals and regulators need accurate information, not a guess.\n\n• Root-cause fix: check every other bucket and system for the same misconfiguration, not just the one that was found.\n\n• Lessons learned last: once the fire is out, update the policies, training and monitoring so this specific failure does not repeat.\n\nSo the answer is: contain, scope, notify, fix the root cause, then review and improve.",
    },
    {
      type: "mcq",
      prompt:
        "If DataLeak Ltd. wanted to detect a publicly accessible storage bucket like this one before an outside party does, which NIST Cybersecurity Framework function does that detection capability belong to?",
      options: [
        "Protect, because it covers implementing safeguards to limit impact",
        "Recover, because it covers restoring services and capabilities after an incident",
        "Identify, because it covers understanding organisational assets, systems and risks",
        "Detect, because it covers identifying cyber security events promptly",
      ],
      correctIndex: 3,
      modelAnswer:
        "A smoke alarm's whole job is to notice smoke the instant it appears, not to stop the fire from starting and not to help you rebuild afterwards.\n\n• Detect specifically means identifying cybersecurity events promptly, which is exactly what a monitoring tool that flags a publicly accessible bucket would be doing.\n\n• Why the others are wrong: Protect is about safeguards that limit impact once something is already happening, Recover is about restoring services after an incident, and Identify is about the earlier step of mapping out assets and risks in the first place, not actively spotting a live misconfiguration.\n\nSo the answer is: Detect, because actively noticing the exposed bucket is an early-warning function, not a safeguard, a recovery step, or an asset inventory.",
    },
    {
      type: "mcq",
      prompt:
        "Based on the DataLeak Ltd. case, which statement correctly distinguishes a 'disaster' in the Disaster Recovery sense from the specific incident described here?",
      options: [
        "A disaster is typically a broader disruptive event such as a cyberattack, hardware failure or natural disaster, while this incident was narrower: a misconfigured, unauthenticated storage bucket rather than an outage or physical event",
        "A disaster and this specific incident are identical concepts in every respect, and the two terms can always be used completely interchangeably no matter what context, industry or regulation applies",
        "A disaster only ever refers to natural events like floods, earthquakes or storms, so cyberattacks and other digital incidents can never be covered under any Disaster Recovery Plan at all",
        "A disaster is always a smaller-scale event than any data exposure, since by definition it only ever affects a single device rather than thousands of records across an organisation",
      ],
      correctIndex: 0,
      modelAnswer:
        "A twisted ankle and a broken leg both hurt, but they are not the same size of problem and they do not need the same treatment plan.\n\n• The lecture material defines a Disaster Recovery Plan as covering disruptive events such as cyberattacks, hardware failure, natural disasters or human error, generally things that take systems offline or destroy infrastructure.\n\n• DataLeak Ltd.'s incident was an exposure of data through a misconfiguration rather than systems going down, so while DR principles like restoring from clean backups still apply, the event itself is narrower than the kind of large-scale outage a DRP is primarily built around.\n\n• Why the others are wrong: the terms are related but not interchangeable, cyberattacks are explicitly included as a disaster trigger alongside natural events, and 'size' is not measured by how many devices versus how many records are affected, a data exposure affecting 15,000 people is a serious incident even without a device going offline.\n\nSo the answer is: a disaster is the broader category of disruptive event, and this specific incident is a narrower exposure case within that broader world.",
    },
    {
      type: "mcq",
      prompt:
        "Part A's discussion question asks about the different types of cloud deployment models and services. If DataLeak Ltd. decided to move its sensitive employee records onto infrastructure shared only with a small group of other HR and payroll companies subject to the same regulations, which deployment model would that be?",
      options: [
        "Public cloud, since any shared infrastructure of any kind automatically counts as public cloud regardless of who else uses it",
        "Community cloud, since it is shared infrastructure for organisations with a common interest or regulatory requirement",
        "Private cloud, since only HR and payroll companies specifically are using it here, and nobody outside that small group at all",
        "Hybrid cloud, since it technically still connects to the internet alongside the company's own private on-premise systems",
      ],
      correctIndex: 1,
      modelAnswer:
        "A shared industry car-pool used only by people commuting to the same business park is not open to the general public, but it is also not just one person's private car, it sits in between.\n\n• Community cloud describes infrastructure shared between organisations with a common interest, such as the same industry or regulatory requirements, which matches 'a small group of other HR and payroll companies subject to the same regulations' exactly.\n\n• Why the others are wrong: public cloud is open to any customer, not just a defined group, private cloud is dedicated to a single organisation and this scenario involves several, and hybrid cloud describes mixing public and private infrastructure together, which is not what is being described here.\n\nSo the answer is: community cloud, because it is shared specifically among a defined group with common needs.",
    },
    {
      type: "mcq",
      prompt:
        "Considering the DataLeak Ltd. case as a whole, which single change would most directly have reduced the breach's blast radius, even if it had not prevented the initial misconfiguration?",
      options: [
        "Giving every employee a company-branded laptop sticker as a reminder to take security seriously during their daily work",
        "Increasing the marketing budget for the payroll product line so that more potential customers hear about the service the company offers",
        "Applying the principle of least privilege and data minimisation, so the exposed bucket held only the minimum payroll data actually needed rather than everything",
        "Moving the company's head office to a different city that is perceived as having a lower general crime rate overall",
      ],
      correctIndex: 2,
      modelAnswer:
        "If a bag gets stolen, it is far better that it only had your gym clothes in it than your passport, your house keys, and your laptop all at once. Carrying less sensitive stuff limits how bad a theft can be.\n\n• Least privilege and data minimisation mean only collecting and exposing the data that is actually necessary, so even if a bucket is misconfigured, there is less sensitive information sitting in it to begin with.\n\n• This is a classic 'defence in depth' idea, reducing blast radius does not prevent the first mistake, but it limits how much damage that mistake can cause.\n\n• Why the others are wrong: a laptop sticker, a marketing budget change, and relocating head office have no bearing on how much sensitive data sits exposed in a storage bucket.\n\nSo the answer is: applying least privilege and data minimisation to what is stored in the bucket would have limited the scale of the exposure.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false? Because DataLeak Ltd. is an Australian company, GDPR definitely cannot apply to this incident, since GDPR only ever governs organisations physically located within the European Union.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "A shop in Sydney that sells online to customers in Paris still has to follow French consumer protection rules for those sales, even though the shop itself is nowhere near France.\n\n• GDPR has extraterritorial reach: it can apply to any organisation that processes the personal data of individuals in the EU, regardless of where that organisation is physically based.\n\n• The case itself states the incident was a violation of GDPR and local privacy laws together, which only makes sense if GDPR genuinely could apply, for example if any of the exposed employees' data relates to EU residents or if the company has EU-connected operations.\n\n• Why this matters: assuming a law 'only applies over there' is exactly the kind of gap that leaves an organisation unprepared for its real compliance obligations.\n\nSo the answer is: false, location alone does not automatically rule GDPR out.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial's learning outcomes include applying investigative research methods to 'identify and critique changing information' about an area of interest. In the context of this case, which practice best demonstrates that skill?",
      options: [
        "Accepting the first headline about the breach at face value and announcing a response before any internal investigation is complete",
        "Ignoring the cybersecurity firm's notification entirely, since outside parties can never be trusted to identify a company's own security gaps",
        "Waiting for a regulator to publish a final ruling before doing any internal investigation of the incident at all",
        "Verifying the cybersecurity firm's findings, confirming the real scope of the exposure, and checking which specific regulations were actually breached before deciding on a response",
      ],
      correctIndex: 3,
      modelAnswer:
        "A good journalist does not publish a story just because one source said something, they check the facts, confirm the details, and only then decide what to report.\n\n• Investigative, critical research means confirming facts (the real scope of exposure), checking sources (the cybersecurity firm's findings), and understanding the actual legal landscape (which regulations were breached) before acting.\n\n• Why the others are wrong: reacting to headlines without verification risks an inaccurate response, dismissing an external researcher's findings outright ignores a legitimate warning, and waiting passively for a regulator's final ruling abandons the organisation's own duty to investigate and respond promptly.\n\nSo the answer is: verifying the scope and the specific regulations breached before responding is the genuinely investigative, critical approach.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5990",
  week: 9,
  paperNumber: 2,
  title: "Week 9 Lecture: Security Management 2",
  topics:
    "The Data Lifecycle (creation/collection, storage, usage/processing, sharing/distribution, archival, destruction/disposal) and the security focus at each stage; data privacy and governance frameworks (Australian Privacy Principles, NSW privacy laws, GDPR's key principles and individual rights, NIST Cybersecurity Framework's five functions and four implementation tiers); cybersecurity fundamentals (the CIA Triad, domains of cybersecurity, common cybersecurity practices); cybersecurity standards (ISO/IEC 27001, NIST CSF, PCI DSS, HIPAA Security Rule safeguards); threat modelling with STRIDE and its mitigation strategies; the Incident Response Plan lifecycle (preparation, identification, containment, eradication, recovery, lessons learned) versus Disaster Recovery Plans (strategies: cold/warm/hot site, DRaaS, backup and restore) versus Business Continuity Plans (BCP lifecycle); modern IT security challenges from cloud adoption, remote work and shadow IT; cloud deployment models (public, private, hybrid, community) and service models (IaaS, PaaS, SaaS, FaaS); security for cloud and virtualised environments (Zero Trust, container security, CWPP, AI-driven threat detection) and best practices; the CloudSafe Corp ransomware case study; and key statistics and case studies from ASD's Annual Cyber Threat Report 2023-24 (hotline calls, cybercrime costs, critical infrastructure incidents, the Medibank/LockBit cyber sanctions, the NSW energy supplier SCADA/DDoS incident, an AI deepfake vishing scam) and UpGuard's Complete Guide to Data Breaches (data breach vs data leak, the five-phase cyberattack pathway, the four cybersecurity disciplines of attack surface coverage).",
  sourceFiles: [
    "lecture/INFO5990 2026-S1 Week 9- Security Management 2 (1).pdf",
    "lecture/Reading 1 - Annual Cyber Threat Report 23-24.pdf",
    "lecture/Reading 2 - A Complete Guide to Data Breaches.pdf",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "A live poll during the lecture asked the class: which statement best defines privacy in the context of information systems?",
      options: [
        "The right to control personal information",
        "The ability to store unlimited data",
        "The process of encrypting files only",
        "A guideline that applies only to government websites",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine a personal diary: privacy is not about how big the diary is or whether it has a fancy lock, it is about you deciding who gets to read it at all.\n\n• Privacy is fundamentally about control: who can collect, see, use and share information about a person.\n\n• Why the others are wrong: storing unlimited data describes a storage capacity, not privacy, and encrypting files is one technical control that supports privacy but is not the definition of it, and privacy laws apply broadly across public and private organisations, not only government sites.\n\nSo the answer is: privacy is the right to control personal information.",
    },
    {
      type: "mcq",
      prompt:
        "A second live poll asked the class: the Australian Privacy Act 1988 primarily regulates which of the following?",
      options: [
        "Data storage speed in organisations",
        "Handling of personal information by entities",
        "Internet bandwidth usage",
        "The design of company logos on websites",
      ],
      correctIndex: 1,
      modelAnswer:
        "Think of the Privacy Act as the rulebook for how a business is allowed to handle someone's personal diary once they have been trusted with it, not a rulebook about how fast their internet connection is.\n\n• The Privacy Act 1988 sets out the Australian Privacy Principles (APPs), which govern how personal information is collected, used, stored and disclosed by regulated entities.\n\n• Why the others are wrong: storage speed, internet bandwidth and website design are technical or cosmetic matters that have nothing to do with how personal information is legally handled.\n\nSo the answer is: the Privacy Act primarily regulates how entities handle personal information.",
    },
    {
      type: "mcq",
      prompt:
        "A third live poll asked the class: a key feature of the General Data Protection Regulation (GDPR) is which of the following?",
      options: [
        "Applies only within one country",
        "Focus on hardware security only",
        "Strong individual data rights",
        "It only regulates data stored on paper, not electronically",
      ],
      correctIndex: 2,
      modelAnswer:
        "GDPR hands people a remote control over their own personal data: they can ask to see it, fix it, delete it, or take it with them to another service.\n\n• GDPR gives individuals rights to access, rectify, erase, restrict processing, port, and object to use of their data, plus a right not to be subject to purely automated decisions that significantly affect them.\n\n• Why the others are wrong: GDPR is an EU regulation but it applies extraterritorially to any organisation handling EU residents' data, not just within one country, it covers organisational processes and data governance broadly rather than only hardware, and it applies to personal data in any form, not just paper.\n\nSo the answer is: strong individual data rights are a defining feature of GDPR.",
    },
    {
      type: "order",
      prompt:
        "Put the six stages of the Data Lifecycle, as presented in the lecture, in the correct order from start to finish.",
      steps: [
        "Data Creation/Collection",
        "Data Storage",
        "Data Usage/Processing",
        "Data Sharing/Distribution",
        "Data Archival",
        "Data Destruction/Disposal",
      ],
      modelAnswer:
        "Think about the life of a single letter: it is written, filed in a drawer, read and acted on, sometimes copied and sent to someone else, eventually moved to a storage box in the attic, and finally shredded once nobody needs it anymore.\n\n• Creation/Collection: the data is first generated or gathered, for example through a registration form or a sensor.\n\n• Storage: it is kept somewhere, such as a database or cloud storage.\n\n• Usage/Processing: it is actively used for operations, analytics or decisions.\n\n• Sharing/Distribution: it may be shared internally or externally with partners or regulators.\n\n• Archival: once it is no longer actively used but must be retained, it moves to long-term storage.\n\n• Destruction/Disposal: finally, once it is no longer needed at all, it is securely destroyed.\n\nSo the answer is: Creation/Collection, Storage, Usage/Processing, Sharing/Distribution, Archival, then Destruction/Disposal.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that the lecture lists as the security focus specifically at the Data Storage stage of the lifecycle.",
      options: [
        "Encryption at rest",
        "Access controls over who can read and write the data",
        "Redundancy and backups to prevent loss",
        "Informed consent at the point of collection",
        "Legal retention schedules such as keeping tax records for seven years",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "A warehouse manager locks the building, keeps a list of who is allowed a key, and makes sure there is a second copy of the stock list somewhere else in case of a fire. Deciding what to let through the front door in the first place, or how long to keep old stock before throwing it out, are different jobs done at different points.\n\n• The lecture's Data Storage slide lists exactly three security focuses: encryption at rest, access controls over who can read and write, and redundancy and backups to prevent loss.\n\n• Why the others are wrong: informed consent at the point of collection belongs to the earlier Data Creation/Collection stage, and legal retention schedules belong to the later Data Archival stage.\n\nSo the answer is: encryption at rest, access controls, and redundancy and backups are the Data Storage security focuses.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture ties data security across the lifecycle to the CIA Triad. Protecting data from being altered or tampered with while it sits in storage or moves between systems maps to which principle?",
      options: [
        "Confidentiality",
        "Availability",
        "Accountability",
        "Integrity",
      ],
      correctIndex: 3,
      modelAnswer:
        "If someone sneaks into a signed contract and quietly changes one of the numbers, the paper has not been stolen and it is not hidden from anyone, but it is no longer trustworthy.\n\n• Integrity means ensuring data is accurate and has not been tampered with.\n\n• Confidentiality is about limiting who can access the data, not whether it has been changed.\n\n• Availability is about authorised users being able to access the data when needed, not about accuracy.\n\n• Accountability is not one of the three CIA Triad principles, it is a separate GDPR principle about demonstrating compliance.\n\nSo the answer is: integrity is the principle that covers protecting data from being altered or tampered with.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement correctly describes the NIST Cybersecurity Framework (CSF) as presented in the lecture?",
      options: [
        "It was developed by the US National Institute of Standards and Technology, primarily for critical infrastructure but now widely adopted, and provides a risk-based approach flexible enough for organisations of any size or sector",
        "It is a European Union regulation, enacted to give individuals strong rights over their own information, whose main purpose is to protect the personal data and privacy rights of EU citizens and residents",
        "It is a payment industry standard developed and maintained by major card schemes such as Visa and Mastercard specifically to protect cardholder data wherever it is stored, processed or transmitted",
        "It is a US healthcare law, enforced through civil and criminal penalties for non-compliance, whose main purpose is to protect electronic protected health information across the healthcare industry",
      ],
      correctIndex: 0,
      modelAnswer:
        "NIST CSF is like a universal fitness plan that was originally designed for elite athletes (critical infrastructure) but turned out to be flexible enough that almost any gym-goer (any organisation) can adapt it to their own level and goals.\n\n• NIST CSF's origin is the US National Institute of Standards and Technology, originally aimed at critical infrastructure but now adopted globally.\n\n• Its main purpose is a risk-based approach to managing and improving cybersecurity, flexible enough for organisations of any size or sector.\n\n• Why the others are wrong: the EU personal-data description is GDPR, the card-scheme description is PCI DSS, and the healthcare description is HIPAA, each a different framework covered later in the lecture.\n\nSo the answer is: NIST CSF is a US-origin, flexible, risk-based framework now adopted well beyond critical infrastructure.",
    },
    {
      type: "mcq",
      prompt:
        "A small organisation's cybersecurity practices are described as ad hoc and reactive, with informal or inconsistent controls and no real risk awareness. Under the NIST CSF Implementation Tiers, which tier best describes this organisation?",
      options: [
        "Tier 2 (Risk-informed)",
        "Tier 1 (Partial)",
        "Tier 3 (Repeatable)",
        "Tier 4 (Adaptive)",
      ],
      correctIndex: 1,
      modelAnswer:
        "A household that only buys a fire extinguisher after a small kitchen fire, with no fire plan and no smoke alarm testing schedule, is reacting to problems as they happen rather than managing risk on purpose.\n\n• Tier 1 (Partial): cybersecurity is ad hoc and reactive, with informal or inconsistent practices, matching this organisation exactly.\n\n• Tier 2 (Risk-informed): policies exist but are applied inconsistently, with only partial risk awareness, a step up from Tier 1.\n\n• Tier 3 (Repeatable): practices are formally documented, consistently applied and monitored.\n\n• Tier 4 (Adaptive): cybersecurity is fully integrated, continuously improved, and adapts to evolving threats.\n\nSo the answer is: Tier 1 (Partial), since the organisation's practices are described as ad hoc, reactive and informal.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the statements below that correctly pair a NIST CSF Framework Core function with its description.",
      options: [
        "Identify: understand organisational assets, systems, data and risks",
        "Protect: implement safeguards to limit or contain the impact of cyber incidents",
        "Detect: identify cybersecurity events promptly",
        "Respond: restore services and capabilities after an incident",
        "Recover: act quickly to incidents in order to mitigate their impact",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Think of a household fire-safety routine: first you work out what is flammable and where the risks are, then you install smoke alarms and fit extinguishers, then the alarm actually goes off when there is smoke, then you fight the fire, and finally you repair and rebuild afterward.\n\n• Identify, Protect and Detect are correctly paired here: understanding assets and risks, implementing safeguards, and spotting events promptly.\n\n• Why the last two are wrong: 'restore services after an incident' is the definition of Recover, not Respond, and 'act quickly to mitigate impact' is the definition of Respond, not Recover, the two descriptions have been swapped.\n\nSo the answer is: Identify, Protect and Detect are correctly matched; Respond and Recover have been swapped with each other's descriptions.",
    },
    {
      type: "match",
      prompt:
        "Match each GDPR key principle to its correct description.",
      pairs: [
        {
          left: "Purpose Limitation",
          right: "Data is collected for specific purposes only",
        },
        {
          left: "Data Minimisation",
          right: "Only collect what is necessary",
        },
        {
          left: "Storage Limitation",
          right: "Retain data only as long as necessary",
        },
        {
          left: "Accountability",
          right: "Organisations must be able to demonstrate compliance",
        },
      ],
      decoys: [
        "Keeping data accurate and up to date at all times",
        "Processing data legally, fairly, and transparently",
      ],
      modelAnswer:
        "Think of borrowing a neighbour's tools: you only borrow what you actually need for the one job you said you'd do, you give them back as soon as you're done, and if anyone asks, you can show exactly what you borrowed and why.\n\n• Purpose Limitation: only borrow the tools for the job you said, not for anything else.\n\n• Data Minimisation: only borrow what you actually need, not the whole toolbox.\n\n• Storage Limitation: give the tools back once the job is finished, don't keep them indefinitely.\n\n• Accountability: be ready to show you handled the borrowing responsibly if anyone checks.\n\n• Why the decoys are wrong: 'keeping data accurate' describes GDPR's Accuracy principle and 'processing legally, fairly and transparently' describes its Lawfulness, Fairness and Transparency principle, both of which are real GDPR principles, just not the four matched here.\n\nSo the answer is: Purpose Limitation, Data Minimisation, Storage Limitation and Accountability match as shown.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false? NIST CSF and GDPR serve essentially the same purpose and can be used interchangeably as security management frameworks.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "A fitness plan and a food-safety law both relate to 'being healthy' in a loose sense, but one tells you how to train and the other tells you what rules a restaurant kitchen must follow, they are not interchangeable.\n\n• NIST CSF is a voluntary, risk-based framework for managing and improving an organisation's cybersecurity posture across any sector.\n\n• GDPR is a legal regulation specifically focused on protecting the personal data and privacy rights of individuals, with mandatory compliance obligations and penalties.\n\n• An organisation would typically use both together: NIST CSF to structure its security program, and GDPR to meet its specific legal privacy obligations, they are complementary, not interchangeable.\n\nSo the answer is: false, they serve different purposes and are not interchangeable.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement best captures what the lecture means by cybersecurity, as distinct from the broader concept of information security?",
      options: [
        "Cybersecurity only covers physical building access, such as door locks, security guards and perimeter fencing around company premises",
        "Cybersecurity is only concerned with marketing a company's security products and services to potential customers and partners",
        "Cybersecurity focuses specifically on protecting computers, networks, programs and data from unauthorised access, attacks, damage or theft, aligned with the CIA Triad",
        "Cybersecurity exclusively means training staff to recognise threats and has nothing to do with any technical or network-level controls",
      ],
      correctIndex: 2,
      modelAnswer:
        "If information security is the whole idea of protecting information in any form, cybersecurity is specifically the digital front line, protecting the computers, networks and data that information now mostly lives in.\n\n• The lecture defines cybersecurity as the practice of protecting computers, networks, programs and data from unauthorised access, attacks, damage or theft, focused specifically on the digital aspect, and aligned with the CIA Triad.\n\n• Why the others are wrong: physical building access is physical security, marketing has nothing to do with the definition, and staff training is only one of several cybersecurity practices, alongside technical controls like firewalls and encryption.\n\nSo the answer is: cybersecurity is the digital-focused practice of protecting computers, networks, programs and data, aligned with the CIA Triad.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that the lecture lists as domains of cybersecurity.",
      options: [
        "Network Security",
        "Application Security",
        "Operational Security (OPSEC)",
        "Marketing Security",
        "Identity & Access Management (IAM)",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "A castle needs its outer walls defended, its gates checked, its soldiers given the right ranks and orders, and its drawbridge controlled, each of those is a distinct job even though they all protect the same castle. Marketing is not one of those jobs.\n\n• The lecture's domains include Network Security, Application Security, Information Security, Operational Security (OPSEC), Endpoint Security, Cloud Security, and Identity & Access Management (IAM).\n\n• Why marketing security is wrong: it is not a recognised domain of cybersecurity at all, it is an invented distractor unrelated to any of the lecture's listed domains.\n\nSo the answer is: Network Security, Application Security, Operational Security and Identity & Access Management are genuine domains; marketing security is not.",
    },
    {
      type: "fillblank",
      prompt:
        "The CIA Triad in cybersecurity stands for Confidentiality, ___, and ___.",
      blanks: [["integrity"], ["availability"]],
      modelAnswer:
        "Picture a locked diary that nobody can read without permission, whose pages nobody can secretly change, and that you can always open and read yourself whenever you want.\n\n• Confidentiality: only authorised users can access the information.\n\n• Integrity: the data is protected from being altered or tampered with.\n\n• Availability: authorised users can access the systems and data when they need to.\n\nSo the answer is: Integrity and Availability complete the Confidentiality, Integrity, Availability triad.",
    },
    {
      type: "mcq",
      prompt:
        "Which of the following is listed in the lecture as a common cybersecurity practice to protect an organisation from threats?",
      options: [
        "Disabling all firewalls so legitimate traffic is never accidentally blocked",
        "Avoiding software updates so systems remain exactly as originally configured",
        "Removing all audit logs to save storage space",
        "Using strong passwords and multi-factor authentication (MFA)",
      ],
      correctIndex: 3,
      modelAnswer:
        "Locking your front door, replacing worn-out locks, keeping a visitor's log, and installing a doorbell camera are all basic, sensible habits. Leaving the door wide open and throwing away the visitor's log is the opposite of sensible.\n\n• The lecture lists strong passwords and MFA, keeping software patched, firewalls and intrusion detection, encryption, staff training, incident response plans, and monitoring/audit logs as common cybersecurity practices.\n\n• Why the others are wrong: disabling firewalls, skipping updates, and deleting audit logs are each the direct opposite of the recommended practices, they remove protection and visibility rather than adding it.\n\nSo the answer is: strong passwords and MFA are a listed common cybersecurity practice.",
    },
    {
      type: "mcq",
      prompt:
        "A hospital needs to protect electronic protected health information (ePHI) for its patients and their business associates who handle that data. Which cybersecurity standard applies most directly here?",
      options: [
        "HIPAA Security Rule",
        "PCI DSS",
        "ISO/IEC 27001",
        "NIST Cybersecurity Framework",
      ],
      correctIndex: 0,
      modelAnswer:
        "Each cybersecurity standard is built for a specific kind of information, like different specialist doctors each focused on one part of the body. Patient medical data has its own specialist standard.\n\n• HIPAA (Health Insurance Portability and Accountability Act) Security Rule exists specifically to protect electronic protected health information (ePHI) and applies to covered entities like healthcare providers and their business associates.\n\n• Why the others are wrong: PCI DSS is specifically for payment card data, ISO/IEC 27001 is a general information security management standard not specific to healthcare, and NIST CSF is a general risk-based framework rather than a healthcare-specific legal rule.\n\nSo the answer is: HIPAA Security Rule, because it is the standard specifically built to protect patient health information.",
    },
    {
      type: "mcq",
      prompt:
        "A US hospital knowingly fails to comply with HIPAA requirements. According to the lecture, which of the following is a genuine consequence it could face?",
      options: [
        "An automatic legal requirement to switch its entire IT estate to a public cloud deployment model within 30 days",
        "Civil penalties ranging from $100 to $50,000 per violation, up to $1.5 million annually, plus possible criminal penalties",
        "Losing the legal right to ever use encryption again anywhere in its clinical or administrative systems",
        "A mandatory, government-enforced downgrade to NIST CSF Implementation Tier 1 for a fixed period",
      ],
      correctIndex: 1,
      modelAnswer:
        "Breaking the rules that protect people's medical records is treated seriously, with real fines and, in serious cases, criminal charges, not with strange technical punishments like being forced to change cloud providers.\n\n• The lecture states HIPAA non-compliance carries civil penalties of $100 to $50,000 per violation, up to $1.5 million annually, criminal penalties for knowing violations, and loss of reputation and patient trust.\n\n• Why the others are wrong: HIPAA does not dictate a specific cloud deployment model, it does not ban the use of encryption, which is actually a required safeguard, and NIST CSF tiers are a separate, voluntary self-assessment framework, not a HIPAA enforcement mechanism.\n\nSo the answer is: real civil and potentially criminal penalties, exactly as the lecture describes.",
    },
    {
      type: "match",
      prompt:
        "Match each cybersecurity standard to its primary focus, as covered in the lecture.",
      pairs: [
        {
          left: "PCI DSS",
          right:
            "Protects payment card data for organisations that store, process or transmit credit or debit card information",
        },
        {
          left: "HIPAA Security Rule",
          right:
            "Protects electronic protected health information for healthcare providers and their business associates",
        },
        {
          left: "NIST Cybersecurity Framework",
          right:
            "A flexible, risk-based framework built around five functions: Identify, Protect, Detect, Respond, Recover",
        },
        {
          left: "GDPR",
          right:
            "An EU regulation protecting the personal data and privacy rights of EU citizens, with strong individual rights",
        },
      ],
      decoys: [
        "A service management framework organised around a six-activity Service Value Chain",
        "A governance framework split into one board-level objective area and four management domains",
      ],
      modelAnswer:
        "Each of these standards is a specialist built for one particular job: one guards card numbers, one guards medical records, one is a flexible general risk toolkit, and one is a broad legal right to control your own data.\n\n• PCI DSS: the card-payment specialist.\n\n• HIPAA: the healthcare-records specialist.\n\n• NIST CSF: the general-purpose, risk-based toolkit any organisation can adapt.\n\n• GDPR: the broad legal regulation giving individuals rights over their own data.\n\n• Why the decoys are wrong: the six-activity Service Value Chain describes ITIL v4, and the board-objective-plus-four-domains description describes COBIT, both frameworks from earlier weeks, not cybersecurity standards from this lecture.\n\nSo the answer is: PCI DSS, HIPAA, NIST CSF and GDPR match as shown.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that are genuine key requirements of PCI DSS, as listed in the lecture.",
      options: [
        "Build and maintain a secure network, including installing a firewall and not using vendor-supplied default passwords",
        "Protect cardholder data through encryption in storage and in transit",
        "Maintain a vulnerability management program, including anti-virus and regular updates",
        "Publish all customer card numbers publicly for transparency",
        "Implement strong access control measures, restricting access to cardholder data by need-to-know",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "A bank vault is built to keep money safe: strong doors, guards who only let in people who actually need access, alarms kept up to date, and the money itself kept locked away, never put on public display.\n\n• The lecture lists building a secure network, protecting cardholder data, maintaining a vulnerability management program, implementing strong access control, monitoring and testing networks regularly, and maintaining an information security policy as PCI DSS's key requirements.\n\n• Why publishing card numbers is wrong: that is the exact opposite of what PCI DSS requires, the entire point of the standard is to keep cardholder data protected and confidential, never exposed.\n\nSo the answer is: secure network, data protection, vulnerability management, and strong access control are genuine PCI DSS requirements; publishing card numbers is not.",
    },
    {
      type: "mcq",
      prompt:
        "A company wants a structured approach to identify, understand and prioritise potential security threats to a new system before it is built, in order to anticipate attacks before they happen. What is this process called?",
      options: [
        "Disaster recovery",
        "Business continuity planning",
        "Threat modelling",
        "Data archival",
      ],
      correctIndex: 2,
      modelAnswer:
        "Before building a new house, a careful architect thinks through every way a burglar might try to get in, which window is weakest, which door is easiest to force, so the design can be fixed before the house is even built.\n\n• Threat modelling is defined in the lecture as a structured approach to identifying, understanding and prioritising potential security threats, helping anticipate attacks before they happen and improve design and architecture.\n\n• Why the others are wrong: disaster recovery and business continuity planning both happen in response to a disruptive event, and data archival is about retaining old data, none of which are about anticipating threats during design.\n\nSo the answer is: threat modelling, because it is specifically about anticipating threats before they occur.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker steals a staff member's login credentials and logs in pretending to be them, gaining access they should not have. Under the STRIDE threat modelling framework, which threat category is this?",
      options: [
        "Tampering with Data",
        "Repudiation",
        "Denial of Service",
        "Spoofing Identity",
      ],
      correctIndex: 3,
      modelAnswer:
        "A burglar wearing a stolen uniform and badge to walk past security as if they were an employee is not changing anything inside the building yet and not flooding it with fake visitors, they are simply pretending to be someone they are not.\n\n• Spoofing Identity is when an attacker pretends to be someone else to gain unauthorised access, exactly matching stolen credentials used to log in as a staff member.\n\n• Why the others are wrong: Tampering is about unauthorised modification of data, Repudiation is about a user denying they performed an action, and Denial of Service is about making a system unavailable, none of which describe impersonating someone to log in.\n\nSo the answer is: Spoofing Identity.",
    },
    {
      type: "mcq",
      prompt:
        "After a suspicious bank transfer, a user claims they never approved it, and the system has no logs or digital signatures to prove otherwise. Under STRIDE, which threat does this represent?",
      options: [
        "Repudiation",
        "Information Disclosure",
        "Elevation of Privilege",
        "Spoofing Identity",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine signing for a parcel but later claiming you never signed anything, and the courier has no copy of the signature to prove you did. Without proof, there is no way to settle the argument.\n\n• Repudiation is when a user denies performing an action and the system lacks proof to dispute it, which matches 'claims they never approved it' with no logs or digital signatures available.\n\n• Why the others are wrong: Information Disclosure is about unauthorised exposure of sensitive information, Elevation of Privilege is about gaining higher access than intended, and Spoofing is about pretending to be someone else, none of which is about denying an action already taken.\n\nSo the answer is: Repudiation, since the mitigation for exactly this problem is logging and non-repudiation mechanisms like digital signatures.",
    },
    {
      type: "match",
      prompt:
        "Match each STRIDE threat to one of its correct mitigation strategies from the lecture.",
      pairs: [
        {
          left: "Spoofing Identity",
          right: "Multi-factor authentication (MFA)",
        },
        {
          left: "Tampering with Data",
          right: "Digital signatures and checksums",
        },
        {
          left: "Repudiation",
          right: "Logging and audit trails",
        },
        {
          left: "Denial of Service",
          right: "Rate limiting and throttling",
        },
      ],
      decoys: [
        "Encryption of sensitive data and data classification",
        "Principle of least privilege and role-based access controls",
      ],
      modelAnswer:
        "Each threat has a matching lock: a fake ID needs a second form of verification, a tampered document needs a tamper-evident seal, a denied action needs a paper trail, and a flood of fake visitors needs a system that slows the gate down.\n\n• Spoofing is countered by MFA, a second proof of identity beyond just a password.\n\n• Tampering is countered by digital signatures and checksums, which detect if data has been changed.\n\n• Repudiation is countered by logging and audit trails, which create the proof that was missing.\n\n• Denial of Service is countered by rate limiting and throttling, which stop a flood of requests from overwhelming the system.\n\n• Why the decoys are wrong: encryption and data classification mitigate Information Disclosure, and least privilege with role-based access controls mitigates Elevation of Privilege, both genuine STRIDE mitigations, just not matched to the four threats listed here.\n\nSo the answer is: Spoofing-MFA, Tampering-digital signatures, Repudiation-logging, Denial of Service-rate limiting, as matched.",
    },
    {
      type: "multi",
      prompt:
        "A web application allows any logged-in user to view other users' private order histories simply by changing a number in the page's web address, with no access check performed. Select ALL STRIDE threat categories this flaw genuinely represents.",
      options: [
        "Information Disclosure, because private order data is exposed to users who should not see it",
        "Elevation of Privilege, because a standard user is able to access data and functionality beyond what their role should permit",
        "Denial of Service, because the flaw makes the application completely unavailable to all users",
        "Spoofing Identity, because the attacker is pretending to be a system administrator rather than a logged-in user",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "Imagine a hotel key card that, through a glitch, also opens every other guest's room. The guest exposing other people's belongings is clearly a privacy problem, and the fact the flaw lets them reach rooms they should never enter is also a permissions problem, even though nobody impersonated staff and the hotel is still fully open for business.\n\n• Information Disclosure fits because other users' private order histories are exposed without authorisation.\n\n• Elevation of Privilege also fits because the flaw lets a standard logged-in user reach data and access rights beyond their intended role, simply by changing a number in the address bar.\n\n• Why the others are wrong: the application is still working for everyone, it is just leaking data, so this is not a Denial of Service, and the attacker is using their own genuine logged-in account rather than pretending to be someone else, so this is not Spoofing.\n\nSo the answer is: this flaw represents both Information Disclosure and Elevation of Privilege.",
    },
    {
      type: "order",
      prompt:
        "Put the stages of the Incident Response Lifecycle, as presented in the lecture, in the correct order.",
      steps: [
        "Preparation",
        "Identification",
        "Containment",
        "Eradication",
        "Recovery",
        "Lessons Learned",
      ],
      modelAnswer:
        "Think of handling a kitchen fire: you keep an extinguisher ready beforehand, you notice the smoke, you stop the fire from spreading, you put it out completely, you clean up and get the kitchen running again, and afterward you figure out what caused it so it does not happen twice.\n\n• Preparation: establish policies, tools and a trained team before anything happens.\n\n• Identification: detect the incident and work out its scope and severity.\n\n• Containment: limit the spread, through short-term and long-term containment.\n\n• Eradication: remove the root cause from the environment entirely.\n\n• Recovery: restore affected systems and monitor for residual threats.\n\n• Lessons Learned: review what happened and update plans, controls and training.\n\nSo the answer is: Preparation, Identification, Containment, Eradication, Recovery, then Lessons Learned.",
    },
    {
      type: "mcq",
      prompt:
        "During an active ransomware attack, a response team immediately disconnects the infected server from the network to stop it spreading further, planning to apply a permanent fix later. Which type of containment does this represent?",
      options: [
        "Long-term containment, since it permanently fixes the problem while maintaining operations",
        "Short-term containment, since it is immediate action to prevent further damage",
        "Eradication, since it removes the root cause of the incident entirely",
        "Recovery, since it restores the server to normal operations",
      ],
      correctIndex: 1,
      modelAnswer:
        "Pulling the plug on a smoking appliance the instant you see smoke is an immediate reflex to stop things getting worse, it is not the same as calling an electrician to actually fix the wiring later.\n\n• Short-term containment is immediate action to prevent further damage, which matches disconnecting the server right away.\n\n• Long-term containment, by contrast, means implementing fixes while still maintaining operations, a more deliberate, longer-lasting step.\n\n• Why the others are wrong: eradication means removing the root cause entirely, which has not happened yet since only the connection was cut, and recovery means restoring to normal operation, which also has not happened yet.\n\nSo the answer is: short-term containment, since it is the immediate action taken to stop the spread.",
    },
    {
      type: "mcq",
      prompt:
        "After an incident, a security team identifies exactly which vulnerable software component let the attacker in and removes or patches it completely from every affected system. Which stage of the Incident Response Lifecycle does this represent?",
      options: [
        "Containment",
        "Identification",
        "Eradication",
        "Preparation",
      ],
      correctIndex: 2,
      modelAnswer:
        "Containment is like sealing a leaking pipe with tape so the flood stops spreading. Eradication is actually replacing the broken pipe so the leak cannot happen again at all.\n\n• Eradication specifically means removing the root cause of the incident from the environment, which matches removing or patching the exact vulnerable component.\n\n• Why the others are wrong: containment only limits the spread without removing the cause, identification is about detecting the incident in the first place, and preparation happens before any incident occurs at all.\n\nSo the answer is: eradication, since it is the stage focused on removing the root cause entirely.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement best describes the main purpose of a Disaster Recovery Plan (DRP), as distinct from an Incident Response Plan?",
      options: [
        "A DRP exists purely to detect and contain active cybersecurity incidents while they are still happening, with absolutely no role to play once the immediate threat itself has already been fully neutralised",
        "A DRP's only purpose is to train staff to recognise and promptly report phishing emails before they ever click on a malicious link or download a suspicious attachment at work",
        "A DRP replaces the need for backups entirely, since every major cloud provider automatically and permanently guarantees that no customer data will ever be lost under any circumstances whatsoever",
        "A DRP outlines how an organisation will recover IT systems, data and operations after a disruptive event such as a cyberattack, hardware failure, natural disaster or human error, focused on minimising downtime and data loss",
      ],
      correctIndex: 3,
      modelAnswer:
        "If an Incident Response Plan is the fire brigade putting out the fire, a Disaster Recovery Plan is the construction crew that rebuilds the damaged part of the house afterward, whatever caused the damage in the first place.\n\n• The lecture defines a DRP as a documented, structured approach outlining how an organisation will recover IT systems, data and operations after a disruptive event, with the goal of minimising downtime and data loss, ensuring business continuity, and meeting regulatory requirements.\n\n• Why the others are wrong: detecting and containing active incidents is closer to an Incident Response Plan's focus, phishing training is a cyber awareness activity rather than the purpose of a DRP, and no cloud provider guarantees zero data loss, backups remain essential.\n\nSo the answer is: a DRP is about recovering IT systems, data and operations after a disruptive event.",
    },
    {
      type: "match",
      prompt:
        "Match each Disaster Recovery strategy to its correct description.",
      pairs: [
        {
          left: "Cold Site",
          right:
            "A pre-prepared physical location with only basic infrastructure, requiring full setup during a disaster",
        },
        {
          left: "Warm Site",
          right:
            "A partially equipped backup site where servers and data still need configuration before use",
        },
        {
          left: "Hot Site",
          right:
            "A fully operational duplicate environment that can take over immediately during a disaster",
        },
        {
          left: "DRaaS (cloud-based DR)",
          right:
            "Systems and data are replicated to the cloud for rapid recovery",
        },
      ],
      decoys: [
        "Regular backups stored offsite, offering slower recovery but a more cost-effective option",
        "A proactive strategy ensuring essential business operations continue during and after a disruption",
      ],
      modelAnswer:
        "Picture four different spare houses you could keep in reserve: an empty block of land you'd still have to build on, a half-furnished house you'd need to finish setting up, a fully furnished house you could move into today, and a virtual house you could spin up instantly in the cloud.\n\n• Cold Site: the empty block, basic infrastructure only, needs full setup.\n\n• Warm Site: the half-furnished house, partially equipped but needs configuration.\n\n• Hot Site: the fully furnished house, ready to take over immediately.\n\n• DRaaS: the cloud-based option, systems and data replicated for rapid recovery.\n\n• Why the decoys are wrong: 'regular backups stored offsite' describes the separate Backup and Restore strategy, slower but cost-effective, and 'ensuring essential operations continue' describes the goal of a Business Continuity Plan, not a Disaster Recovery site strategy.\n\nSo the answer is: Cold, Warm, Hot and DRaaS match as shown.",
    },
    {
      type: "mcq",
      prompt:
        "Which statement best describes the main purpose of a Business Continuity Plan (BCP), as distinct from a Disaster Recovery Plan?",
      options: [
        "A BCP is a proactive strategy ensuring an organisation can continue essential operations during and after a disruptive event, complementing the DRP's focus on restoring IT systems",
        "A BCP is purely a technical document describing how to patch, update and configure an organisation's firewalls and other perimeter network devices",
        "A BCP exists only to decide which specific disaster recovery site type, such as cold, warm or hot, an organisation will choose to use",
        "A BCP's only purpose is to satisfy PCI DSS audit requirements so the organisation can keep processing card payments legally",
      ],
      correctIndex: 0,
      modelAnswer:
        "While the IT team is busy restoring the servers, the rest of the business still needs to keep selling products, paying staff, and talking to customers, that ongoing operational side is what a BCP is built to protect.\n\n• The lecture defines a BCP as a proactive strategy and documented plan ensuring an organisation can continue essential operations during and after a disruptive event, aiming to maintain critical business functions, minimise impact, ensure stakeholder confidence, and complement DRP for IT systems.\n\n• Why the others are wrong: it is not a technical patching document, choosing a DR site type is one small piece of DR strategy rather than the BCP's purpose, and while compliance can be a side benefit, PCI DSS audits are not the defining purpose of a BCP.\n\nSo the answer is: a BCP keeps essential business operations running through and after a disruption, complementing a DRP's focus on IT systems.",
    },
    {
      type: "order",
      prompt:
        "Put the stages of the BCP Lifecycle, as presented in the lecture, in the correct order.",
      steps: [
        "Project Initiation and Management",
        "Business Impact Analysis (BIA)",
        "Risk Assessment",
        "Strategy Development",
        "Plan Development",
        "Testing and Exercises",
        "Maintenance and Continuous Improvement",
      ],
      modelAnswer:
        "Think of planning a wedding on a tight budget: you first set the goals and the budget, work out which parts of the day matter most if something goes wrong, think through what could go wrong, decide your backup options, write the actual plan down, do a rehearsal, and then keep tweaking the plan as things change.\n\n• Project Initiation and Management: establish objectives, scope and resources.\n\n• Business Impact Analysis: identify critical functions and prioritise recovery.\n\n• Risk Assessment: evaluate threats and vulnerabilities.\n\n• Strategy Development: define recovery strategies for critical processes.\n\n• Plan Development: document procedures, roles and resources.\n\n• Testing and Exercises: conduct drills to validate the plan.\n\n• Maintenance and Continuous Improvement: update the plan based on lessons learned and business changes.\n\nSo the answer is: Project Initiation, BIA, Risk Assessment, Strategy Development, Plan Development, Testing and Exercises, then Maintenance and Continuous Improvement.",
    },
    {
      type: "mcq",
      prompt:
        "Employees at a company start using unauthorised chat apps and personal cloud storage to get work done faster, without IT's knowledge or approval. Which modern IT security challenge does this describe?",
      options: [
        "Zero Trust Architecture",
        "Shadow IT",
        "Disaster Recovery as a Service (DRaaS)",
        "Business Impact Analysis",
      ],
      correctIndex: 1,
      modelAnswer:
        "Imagine staff quietly bringing in their own extension cords and space heaters because the office outlets feel too slow, without ever telling the building manager, now nobody responsible for safety even knows those devices exist.\n\n• Shadow IT is defined in the lecture as employees using unauthorised applications or cloud services without IT oversight, a modern IT security challenge alongside cloud adoption risks and remote work security challenges.\n\n• Why the others are wrong: Zero Trust Architecture is a security approach ('never trust, always verify'), DRaaS is a disaster recovery strategy, and a Business Impact Analysis is a BCP planning step, none of which describe unauthorised tool use.\n\nSo the answer is: Shadow IT, since it specifically describes unauthorised applications or services used outside IT's visibility.",
    },
    {
      type: "match",
      prompt:
        "Match each cloud deployment model, as covered in the lecture, to its correct description.",
      pairs: [
        {
          left: "Public Cloud",
          right:
            "Services offered over the internet by third-party providers on shared infrastructure, e.g. AWS, Microsoft Azure, Google Cloud",
        },
        {
          left: "Private Cloud",
          right:
            "Cloud infrastructure dedicated to a single organisation, offering more control and security",
        },
        {
          left: "Hybrid Cloud",
          right:
            "Combines public and private clouds for flexible workload distribution",
        },
        {
          left: "Community Cloud",
          right:
            "Shared infrastructure for a specific group or industry, such as government or healthcare consortia",
        },
      ],
      decoys: [
        "Provides a platform for application development and deployment",
        "Runs code without managing servers, triggered by events",
      ],
      modelAnswer:
        "Picture a shared taxi service, your own private car, switching between the two depending on the trip, and a car-pool used only by people heading to the same industry's offices.\n\n• Public Cloud: the shared taxi, AWS, Azure and Google Cloud all offer this.\n\n• Private Cloud: your own car, dedicated to one organisation.\n\n• Hybrid Cloud: mixing both depending on the workload.\n\n• Community Cloud: the industry car-pool, shared by organisations with a common interest.\n\n• Why the decoys are wrong: a development platform describes PaaS, and running code without managing servers describes FaaS, both cloud service models rather than deployment models.\n\nSo the answer is: Public, Private, Hybrid and Community Cloud match as shown.",
    },
    {
      type: "match",
      prompt:
        "Match each cloud service model, as covered in the lecture, to its correct description.",
      pairs: [
        {
          left: "IaaS",
          right:
            "Provides virtualised computing resources such as servers, storage and network, e.g. AWS EC2",
        },
        {
          left: "PaaS",
          right:
            "Provides a platform for application development and deployment, e.g. Google App Engine",
        },
        {
          left: "SaaS",
          right:
            "Provides fully managed software accessible via the web, e.g. Microsoft 365",
        },
        {
          left: "FaaS / Serverless",
          right:
            "Runs code without managing servers, triggered by events, e.g. AWS Lambda",
        },
      ],
      decoys: [
        "Cloud infrastructure dedicated to a single organisation for more control and security",
        "Shared infrastructure for a specific group or industry, such as government or healthcare consortia",
      ],
      modelAnswer:
        "Picture renting an empty block of land, a half-built house, a fully furnished apartment, and paying only for the minutes you actually use a service, each is a different amount of work handed off to the provider.\n\n• IaaS: the empty block, you manage almost everything yourself.\n\n• PaaS: the half-built house, the platform is ready, you build the application.\n\n• SaaS: the furnished apartment, you just use the finished software.\n\n• FaaS: pay only for the minutes used, code runs briefly with no server management at all.\n\n• Why the decoys are wrong: 'dedicated to a single organisation' describes Private Cloud and 'shared for a specific group or industry' describes Community Cloud, both cloud deployment models rather than service models.\n\nSo the answer is: IaaS, PaaS, SaaS and FaaS match as shown.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture describes a security approach summarised as 'never trust, always verify' for cloud users and devices. What is this approach called?",
      options: [
        "Shadow IT",
        "Cold Site strategy",
        "Zero Trust Architecture",
        "Data Minimisation",
      ],
      correctIndex: 2,
      modelAnswer:
        "An office that makes every single person show ID at every single door, even staff who already badged in at the front gate, is not being paranoid for no reason, it is refusing to assume anyone is automatically trustworthy just because they got in once.\n\n• Zero Trust Architecture is defined in the lecture as 'never trust, always verify' for cloud users and devices, an emerging security technology for cloud and virtualised environments.\n\n• Why the others are wrong: Shadow IT describes unauthorised tool use, a Cold Site is a disaster recovery strategy, and Data Minimisation is a GDPR principle about only collecting necessary data, none of which describe this continuous-verification security approach.\n\nSo the answer is: Zero Trust Architecture.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the following that the lecture lists as cloud environment security best practices.",
      options: [
        "Securing the hypervisor, limiting access to only authorised personnel and patching it regularly",
        "Encrypting data at rest, in transit, and during backup",
        "Using strong identity management, including RBAC, MFA and SSO for cloud access",
        "Disabling centralised logging to reduce storage costs",
        "Applying micro-segmentation to limit lateral movement in virtual networks",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "A well-run data centre locks down the control room, encrypts every filing cabinet, checks everyone's ID carefully before letting them near anything sensitive, and walls off different sections so a problem in one area cannot spread everywhere else. It does not turn off its own security cameras to save money.\n\n• The lecture lists securing the hypervisor, encrypting data, strong identity management (RBAC, MFA, SSO), monitoring logs and network traffic, micro-segmentation, regular vulnerability assessments, secure configuration, and automated security tools (CSPM) as best practices.\n\n• Why disabling logging is wrong: it is the direct opposite of the recommended practice, monitoring logs and network traffic through centralised logging and SIEM integration is explicitly listed as a best practice.\n\nSo the answer is: securing the hypervisor, encryption, strong identity management, and micro-segmentation are genuine best practices; disabling logging is not.",
    },
    {
      type: "mcq",
      prompt:
        "CloudSafe Corp, a SaaS provider for healthcare clients, suffers a ransomware attack after an employee falls for a phishing email while working remotely, exploiting weak MFA implementation. According to the case study, what else was true about the incident's technical conditions?",
      options: [
        "CloudSafe Corp had no cloud infrastructure at all and ran every system entirely on physical on-premise servers",
        "The ransomware entered through a direct physical break-in at CloudSafe Corp's head office",
        "CloudSafe Corp had already fully contained the incident with no services affected before the IT team even noticed",
        "CloudSafe Corp had recently migrated 70% of its applications to a hybrid cloud model while keeping sensitive patient records on a private cloud",
      ],
      correctIndex: 3,
      modelAnswer:
        "A hospital that moves most of its records to a modern storage facility shared with other clients, but keeps its most sensitive X-rays in its own private vault, is making a deliberate trade-off between convenience and extra protection for its most sensitive material.\n\n• The case study states CloudSafe Corp had recently migrated 70% of its applications to a hybrid cloud model while keeping sensitive patient records on a private cloud, with employees working remotely and collaborating via Slack, Microsoft Teams and cloud storage.\n\n• Why the others are wrong: the case explicitly describes cloud infrastructure, including public cloud production servers that were encrypted, there is no mention of any physical break-in, and the case states the incident response was only partially executed with some teams unclear on responsibilities, not fully contained before detection.\n\nSo the answer is: CloudSafe Corp was running a hybrid cloud model, keeping patient records on a private cloud while using public and hybrid cloud for other applications.",
    },
    {
      type: "multi",
      prompt:
        "Based on the CloudSafe Corp case study, select ALL of the following that were identified as security failures contributing to the ransomware attack.",
      options: [
        "A phishing email targeting remote employees succeeded in tricking a user",
        "Weak MFA implementation was exploited to gain access",
        "Incident response responsibilities were unclear, with some teams not knowing their roles",
        "The private cloud holding patient records was left completely unencrypted from the start",
        "CloudSafe Corp had never adopted any form of cloud computing before the attack",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "A break-in happened because someone fell for a fake delivery person at the door (phishing), the alarm system had a known weak spot that was never fixed (weak MFA), and once inside, the response team did not know who was supposed to do what (unclear responsibilities). The vault itself was never broken into, and the building had already been fully renovated with modern systems years before this happened.\n\n• The case study explicitly names the phishing email exploiting weak MFA as the entry point, and states incident response was 'partially executed, but some teams are unclear on responsibilities', a genuine governance failure.\n\n• Why the last two are wrong: the case states private cloud data is safe, meaning it was not left unencrypted and exposed, and the case opens by describing CloudSafe Corp as already having a hybrid cloud model with substantial prior cloud adoption, not a company encountering cloud computing for the first time.\n\nSo the answer is: the phishing success, weak MFA, and unclear incident response responsibilities are the genuine security failures identified.",
    },
    {
      type: "mcq",
      prompt:
        "The CloudSafe Corp case study asks what incident response steps the company should implement immediately to contain the ransomware. Based on the Incident Response Lifecycle covered earlier in the lecture, which action is most appropriate as an immediate first step?",
      options: [
        "Short-term containment, such as isolating infected VMs and the compromised accounts from the network to stop further spread",
        "Conducting a full post-incident Lessons Learned review before taking any other action",
        "Immediately rebuilding the entire public cloud environment from scratch without first isolating the infected systems",
        "Waiting for media attention to die down before taking any technical action at all",
      ],
      correctIndex: 0,
      modelAnswer:
        "When one room in a house catches fire, you shut the door to stop it spreading to the rest of the house before you even think about what caused it or how you will repaint afterward.\n\n• Short-term containment, immediate action such as isolating infected systems and compromised accounts, is exactly the kind of fast, decisive step needed right now, matching the lecture's definition.\n\n• Why the others are wrong: Lessons Learned only happens after the incident is resolved, rebuilding without first isolating infected systems risks reinfecting the rebuilt environment, and waiting for media attention to fade ignores the active, spreading threat entirely.\n\nSo the answer is: short-term containment, isolating the infected systems and accounts right away.",
    },
    {
      type: "mcq",
      prompt:
        "The CloudSafe Corp case study also asks students to discuss the role of Identity and Access Management (IAM) in preventing similar attacks. Which statement best captures that role?",
      options: [
        "IAM has no relevance here at all, since the attack entered entirely through a phishing email rather than through any identity or access system",
        "Strong IAM, including properly enforced MFA and least-privilege access, would have made it much harder for the phishing-compromised credentials to be used to gain further access",
        "IAM's only function in any organisation is to manage which cloud deployment model, such as public, private or hybrid, the organisation chooses to adopt",
        "IAM would have prevented the phishing email from ever being delivered to the employee's inbox in the first place",
      ],
      correctIndex: 1,
      modelAnswer:
        "A stolen house key is far less useful to a burglar if the house also requires a second, separate code to actually open the door, and if that key alone cannot unlock every room, only the one it was meant for.\n\n• The case explicitly states the attack exploited 'weak MFA implementation', meaning properly enforced MFA would have made the phished credentials much harder to actually use.\n\n• Least-privilege access, a core IAM principle, limits how much damage a single compromised account can do even if it is misused.\n\n• Why the others are wrong: IAM is directly relevant since weak MFA was the exploited weakness, IAM concerns identity and access rather than deployment model choice, and IAM does not filter incoming email, that is the job of email security and phishing awareness training.\n\nSo the answer is: strong IAM, especially properly enforced MFA and least privilege, directly addresses the weakness this attack exploited.",
    },
    {
      type: "mcq",
      prompt:
        "In FY2023-24, how many calls did ASD's Australian Cyber Security Hotline receive, and by how much did this change from the previous year?",
      options: [
        "Over 36,700 calls, down 12% from the previous year",
        "Over 87,400 calls, up 7% from the previous year",
        "Over 36,700 calls, up 12% from the previous year",
        "Over 1,100 calls, similar to the previous year",
      ],
      correctIndex: 2,
      modelAnswer:
        "A help line that used to ring about 90 times a day now rings about 100 times a day, that steady rise across a whole year adds up to thousands more calls than before.\n\n• ASD's Annual Cyber Threat Report 2023-24 states the hotline answered over 36,700 calls, up 12% from the previous year, averaging about 100 calls a day, up from 90.\n\n• Why the others are wrong: 87,400 is the number of cybercrime reports received (which was actually down 7%), and over 1,100 refers to the number of cyber security incidents ASD responded to, a completely different statistic from hotline calls.\n\nSo the answer is: over 36,700 calls, up 12% from the previous year.",
    },
    {
      type: "mcq",
      prompt:
        "According to ASD's report, what percentage of all cyber security incidents responded to by ASD in FY2023-24 related to critical infrastructure, and what were the most common activity types leading to those incidents?",
      options: [
        "Over 50% of incidents, most commonly caused by insider threats and deliberate physical sabotage by disgruntled staff",
        "Over 11% of incidents, most commonly caused by weak Wi-Fi passwords left unchanged on office routers and access points",
        "Over 90% of incidents, most commonly caused by natural disasters such as floods and storms affecting data centres",
        "Over 11% of incidents, most commonly caused by phishing, exploitation of a public-facing application, and brute-force activity",
      ],
      correctIndex: 3,
      modelAnswer:
        "If roughly one in nine break-in attempts in a city targeted power stations and water plants rather than ordinary houses, and most of those break-ins started with a tricky email, a forced-open door, or trying lots of different keys, that is a specific, real pattern worth knowing.\n\n• ASD's report states critical infrastructure made up over 11% of all cyber security incidents, and the three most common activity types leading to those incidents were phishing (23%), exploitation of a public-facing application (21%), and brute-force activity (15%).\n\n• Why the others are wrong: the real figure is around 11%, not 50% or 90%, and weak office Wi-Fi passwords and natural disasters are not the activity types named in the report.\n\nSo the answer is: over 11% of incidents, led by phishing, exploitation of public-facing applications, and brute-force activity.",
    },
    {
      type: "multi",
      prompt:
        "According to ASD's report, select ALL of the top three self-reported cybercrime types for businesses reported to law enforcement through ReportCyber.",
      options: [
        "Email compromise (20%)",
        "Business email compromise fraud (13%)",
        "Online banking fraud (13%)",
        "Identity fraud (26%)",
        "Online shopping fraud (15%)",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Businesses and individuals tend to fall for different kinds of scams: a business's inbox is the usual target, while an individual's online shopping habits or personal identity are more often the target.\n\n• The report's top 3 self-reported cybercrime types for businesses are email compromise (20%), business email compromise fraud (13%) and online banking fraud (13%).\n\n• Why the other two are wrong: identity fraud (26%) and online shopping fraud (15%) are the report's top 3 cybercrime types for individuals, not businesses, this is a common mix-up between the two separate rankings.\n\nSo the answer is: email compromise, business email compromise fraud, and online banking fraud are the top three for businesses.",
    },
    {
      type: "mcq",
      prompt:
        "In January 2024, under the Autonomous Sanctions Act 2011, the Australian Government sanctioned a Russian national for his role in a major 2022 data breach that stole nearly 10 million personal records including Medicare numbers. Which organisation was the victim of that breach?",
      options: [
        "Medibank",
        "CloudSafe Corp",
        "DataLeak Ltd.",
        "Alpha Manufacturing",
      ],
      correctIndex: 0,
      modelAnswer:
        "This was the first time Australia ever used its cyber sanctions powers against anyone, a genuinely significant real-world event tied to one of the country's largest-ever data breaches.\n\n• ASD's report describes this as Case study 7: in January 2024, Australia sanctioned Russian national Aleksandr Ermakov for his role in the compromise of the Medibank Private network in 2022, in which nearly 10 million personal records, including names, dates of birth, and Medicare numbers, were stolen, with some published on the dark web.\n\n• In May 2024, a second sanction was imposed on Dmitry Yuryevich Khoroshev for his senior leadership role in the LockBit ransomware group.\n\n• Why the others are wrong: CloudSafe Corp, DataLeak Ltd. and Alpha Manufacturing are fictional case studies used elsewhere in the course for teaching purposes, not the real organisation named in ASD's report.\n\nSo the answer is: Medibank, the real 2022 breach referenced in ASD's Annual Cyber Threat Report.",
    },
    {
      type: "mcq",
      prompt:
        "ASD's report describes a NSW energy supplier that lost remote connectivity to its SCADA systems after a DDoS caused by a brute-force attack on a VPN firewall device. What ultimately stopped the brute-force login attempts from succeeding?",
      options: [
        "A physical security guard stationed at the energy supplier's data centre",
        "Effective multi-factor authentication (MFA) on the firewall device",
        "The attacker voluntarily stopping the attack after a few hours",
        "A complete shutdown of the entire national electricity grid",
      ],
      correctIndex: 1,
      modelAnswer:
        "Thousands of attempts to guess a password are useless if the door also needs a second code that the attacker simply does not have, no matter how many times they try the first lock.\n\n• ASD's report states the device was flooded with thousands of login attempts that were unsuccessful due to effective MFA, even though the flood of attempts still caused the device to disconnect all connections, including permitted ones, which is what caused the SCADA connectivity loss.\n\n• Why the others are wrong: no physical guard or voluntary attacker stand-down is mentioned, and facilities could still operate using onsite access, meaning there was no interruption to energy supply at all, let alone a grid-wide shutdown.\n\nSo the answer is: effective MFA stopped the brute-force login attempts from actually succeeding.",
    },
    {
      type: "mcq",
      prompt:
        "ASD's report describes a vishing incident where an employee at a multinational corporation transferred millions of dollars after attending a video conference call. What made the employee believe the request was legitimate?",
      options: [
        "The request came with a handwritten letter signed by the CEO in person",
        "The employee verified the transfer independently through the company's official finance portal before proceeding",
        "They recognised other colleagues in attendance on the call, not realising all of them except the employee were AI-generated deepfake recreations",
        "A colleague physically confirmed the request in person at the office",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine attending a video call where every single face you recognise is actually a convincing digital puppet, except your own, that is exactly how believable AI-generated deepfakes have become.\n\n• ASD's report describes this as Case study 8, where the employee initially thought it was a phishing scam after receiving a message purporting to be from the UK-based CFO, but after attending a video conference call and recognising other colleagues in attendance, they were reassured the request was legitimate and completed the transfer. All attendees except the employee were deepfake recreations.\n\n• Why the others are wrong: there was no handwritten letter, no independent verification through an official portal, and no in-person confirmation described, the deception worked entirely through the convincing video call.\n\nSo the answer is: recognising colleagues on the call reassured the employee, even though those colleagues were AI-generated deepfakes.",
    },
    {
      type: "mcq",
      prompt:
        "According to the UpGuard guide, which statement correctly distinguishes a data leak from a data breach?",
      options: [
        "A data leak and a data breach describe exactly the same kind of event, so the two terms can always be used interchangeably in any report or conversation",
        "A data leak always involves a planned, multi-stage cyberattack carried out by an external party, while a data breach only ever happens by pure accident",
        "A data leak only ever happens to information stored on paper documents, while a data breach only ever happens to data stored in electronic systems",
        "A data leak is an unintentional exposure of sensitive data, such as a misconfiguration, while a data breach is the outcome of a planned cyberattack where an external party forces through an IT boundary",
      ],
      correctIndex: 3,
      modelAnswer:
        "Leaving your front door unlocked by mistake is different from a burglar picking the lock to force their way in, both can end with a stranger inside, but only one involved someone actively breaking through a defence.\n\n• The guide defines a data leak as any unintentional exposure of sensitive data to the public, such as an overlooked misconfiguration or unauthorised publishing.\n\n• A data breach, by contrast, is the outcome of a planned cyberattack, caused by an external party forcing their way through an IT boundary, usually by exploiting vulnerabilities.\n\n• Why the others are wrong: the guide explicitly says the terms are commonly used interchangeably but actually describe two different events, the leak/breach distinction has nothing to do with planned versus accidental in the way the third option describes it, that reverses the actual definitions, and neither term is limited to paper versus electronic format.\n\nSo the answer is: a leak is unintentional exposure, while a breach is the result of a deliberate attack forcing through a boundary.",
    },
    {
      type: "order",
      prompt:
        "Put the five phases of the Cyber Attack Pathway, as described in UpGuard's guide, in the correct order.",
      steps: [
        "Phishing Attack",
        "Account Compromise",
        "Lateral Movement",
        "Privilege Escalation",
        "Data Exfiltration",
      ],
      modelAnswer:
        "Think of a con artist's plan: first send a convincing fake message, then trick the victim into handing over a key, then quietly explore the house room by room, then find the key to the safe specifically, and finally sneak the valuables out the back door.\n\n• Phase 1, Phishing Attack: a fraudulent email with malicious links designed to steal credentials.\n\n• Phase 2, Account Compromise: the victim clicks the link or downloads a malicious file, compromising their account.\n\n• Phase 3, Lateral Movement: hackers move through the network learning its layout, sometimes remaining dormant for months.\n\n• Phase 4, Privilege Escalation: hackers locate and compromise privileged credentials to reach highly sensitive data.\n\n• Phase 5, Data Exfiltration: hackers deploy malware to establish a backdoor and clandestinely transfer data out of the network.\n\nSo the answer is: Phishing Attack, Account Compromise, Lateral Movement, Privilege Escalation, then Data Exfiltration.",
    },
    {
      type: "multi",
      prompt:
        "Select ALL of the four cybersecurity disciplines of attack surface coverage described in UpGuard's guide.",
      options: [
        "Employee Awareness Training, addressing internal attack vectors",
        "Internal Vulnerability Detection, addressing internal attack vectors",
        "Data Leak Management, addressing both internal and third-party attack vectors",
        "Vendor Risk Management, addressing third-party attack vectors",
        "Marketing Risk Management, addressing brand reputation vectors",
      ],
      correctIndices: [0, 1, 2, 3],
      modelAnswer:
        "Securing a house properly against both the people inside and the deliveries coming from outside means training the household, checking the house itself for weak spots, watching for anything already leaking out, and vetting anyone from outside who has a key, four genuinely different jobs.\n\n• The guide names exactly four disciplines: Employee Awareness Training (internal), Internal Vulnerability Detection (internal), Data Leak Management (internal and third-party), and Vendor Risk Management (third-party).\n\n• Why marketing risk management is wrong: it is not one of the four disciplines described in the guide, it is an invented distractor unrelated to attack surface coverage.\n\nSo the answer is: Employee Awareness Training, Internal Vulnerability Detection, Data Leak Management, and Vendor Risk Management are the genuine four disciplines.",
    },
    {
      type: "mcq",
      prompt:
        "UpGuard's guide distinguishes phishing from social engineering as the two ways cybercriminals trick employees into divulging private network credentials. Which statement correctly captures that distinction?",
      options: [
        "Phishing is the practice of sending fraudulent emails posing as reputable sources, while social engineering is the broader use of emotional manipulation that can also happen by phone or in person",
        "Phishing and social engineering are exactly the same technique, and the guide uses the two terms interchangeably throughout with no meaningful distinction drawn between them",
        "Phishing can only ever happen when the attacker meets the victim in person, while social engineering can only ever happen through an email message",
        "Phishing targets only senior executives within an organisation, while social engineering targets only junior staff who lack security training",
      ],
      correctIndex: 0,
      modelAnswer:
        "A scammer can trick you with a fake email pretending to be your bank, or they can trick you with a fake phone call pretending to be IT support, or even by showing up in person pretending to be a job applicant who just needs quick access to the Wi-Fi, one is a specific email tactic, the other is the broader art of manipulation itself.\n\n• The guide defines phishing specifically as sending fraudulent emails purporting to be from reputable sources to coerce recipients into divulging private information.\n\n• Social engineering is defined more broadly as the use of emotional manipulation to force victims into divulging private information, explicitly noting it can happen over the phone, in person, or by email, not only by email.\n\n• Why the others are wrong: they are related but distinct techniques, not identical, and neither technique is restricted to a single channel or a single type of target as the other two options claim.\n\nSo the answer is: phishing is specifically fraudulent email, while social engineering is the broader category of manipulation across any channel.",
    },
  ],
};

export const WEEK_9_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
