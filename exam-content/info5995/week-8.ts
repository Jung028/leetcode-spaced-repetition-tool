import type { ExamPaperSeed } from "../types";

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 8,
  paperNumber: 1,
  title: "Week 8 Lecture: Software and System Security",
  topics:
    "Week 8 lecture (software and system security). Why secure systems still get hacked (defects enter at every lifecycle stage; Equifax 2017, Log4Shell 2021, MOVEit 2023; attack surface). Memory safety: garbage values, pointers, dangling pointers, NULL after free, RAII and smart pointers. Static analysis (SAST), dynamic analysis (DAST), penetration testing, monitoring and the defence-in-depth layers. Database security: CIA at the data layer (authentication, least privilege, constraints, audit logs, backups, failover). SQL injection and its defences (prepared statements as the primary defence, validation, sanitisation is fragile, least privilege, ORMs). Database inference and linkage attacks, error messages as a leak. Cross-site scripting (stored, reflected, DOM-based, output encoding, CSP). System security: IDS vs IPS, HIDS vs NIDS, signature vs anomaly detection, fail-open vs fail-closed, tuning, firewalls, antivirus, software vs system security scopes. Mixed review with Week 1 (CIA), Weeks 4-5 (public-key encryption), Week 6 (multi-factor authentication) and Week 7 (SYN flood DDoS).",
  sourceFiles: [
    "lecture/Week08_Software and System security.pdf",
    "lecture/INFO5995_Week8_Extra_Resources.pdf",
    "lecture/Week 08 - Introducti-s1-low.transcript.md",
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Why security keeps failing",
      body: "Imagine building a house. The plan can forget a lock for the back door, the builder can leave a window latch loose, the inspector can skip the alley side, and years later nobody fixes a broken hinge. A flaw can sneak in at any step, not only at the end.\n\n• Software lifecycle: the stages a program goes through, from working out what it must do, to design, coding, testing, release and upkeep.\n\n• Attack surface: every place an outsider can hand the program something. No place to type means nothing to inject into.\n\n• Case files: in 2017 Equifax left a component un-updated and about 147 million people were hit. In 2021 Log4Shell was a weakness in a shared library that allowed remote code execution. In 2023 MOVEit was a SQL injection that led to mass data theft.",
    },
    {
      beforeQuestion: 4,
      title: "Memory and pointers",
      body: "A program's memory is like an apartment block. Every flat has a number. Asking for memory is renting a flat, and giving it back is handing in the key.\n\n• Garbage value: a flat used before and never cleaned still holds the last tenant's stuff. Memory you declare but do not set is not empty, it holds leftovers.\n\n• Pointer: a variable holding the flat number of something else, like a sticky note with an address instead of the house.\n\n• Dangling pointer: the sticky note still shows a flat that was handed back and may now belong to someone else. Using it is undefined behaviour, and attackers abuse it as use-after-free.\n\n• Safe habit: after free in C or delete in C++, set the pointer to NULL, or nullptr in C++, so a later check can see it is empty.\n\n• Naturally secure C++: RAII means the owner object frees the memory itself when it goes away. Smart pointers such as std::unique_ptr and std::shared_ptr do this for you.",
    },
    {
      beforeQuestion: 9,
      title: "Testing with and without running",
      body: "Checking a car before it leaves the factory can be done two ways. You can read the blueprint and spot a badly drawn brake, or you can take the car onto a road and push it hard.\n\n• Static analysis, called SAST: reads source code or compiled files without running them, during development or the build, so flaws are caught early.\n\n• Dynamic analysis, called DAST: runs the application and probes it while it works, finding runtime problems such as memory leaks or a missing permission check.\n\n• Penetration testing: an authorised tester behaves like a real attacker against the running application.\n\n• Monitoring: after release, keep watching the live system.\n\n• Defence in depth: stack several layers, from build time to run time, so one missed flaw does not become a breach.",
    },
    {
      beforeQuestion: 13,
      title: "Databases and CIA",
      body: "A database is a well-run library, not a pile of loose papers. Books are catalogued and cross-referenced, and only some people may enter the back rooms.\n\n• Database: an organised collection of structured data that keeps the links, rules and dependencies between pieces, such as a foreign key linking a students table to an enrolments table.\n\n• Confidentiality: only the right people see the right data. Tools: authentication, least privilege, encryption, masking.\n\n• Integrity: data stays accurate, valid and traceable. Tools: constraints, transactions, validation, audit logs, and consistency checks across tables.\n\n• Availability: data is there when needed. Tools: backups, replication or failover, recovery plans, spare capacity.\n\n• Least privilege: an account gets only the permissions it needs.\n\n• Good practice is to keep backups on a separate, isolated network from the live data.",
    },
    {
      beforeQuestion: 17,
      title: "SQL injection",
      body: "A form is a note you pass to a clerk, who reads out a search. Now imagine the clerk treats every word on your note as an instruction.\n\n• SQL injection: text typed by an attacker gets mixed into a database command and runs as part of it. The database does its job. The flaw is in the application code that built the command.\n\n• Example: a login builds SELECT * FROM users WHERE name='Alice' from typed input. Typing Alice' OR '1'='1 makes the test always true.\n\n• Prepared statement: the command is fixed first with a ? placeholder, and the input travels separately as pure data.\n\n• Input validation: accept only the expected type, range or syntax, such as an age from 0 to 120.\n\n• Sanitising: stripping or escaping risky characters. On its own it is fragile.\n\n• Least privilege: the database account can do only what it must, so a successful injection does less damage.",
    },
    {
      beforeQuestion: 22,
      title: "Learning secrets from allowed answers",
      body: "You can guess how a friend did in an exam from how relaxed they look, without ever seeing their mark. Databases can leak the same way.\n\n• Inference attack: the attacker is allowed to ask the questions, but pieces a secret together from the answers, counts, timings, error messages and other side details.\n\n• Example: a query that only says found or not found for salary above a number still narrows down a salary without ever showing it.\n\n• Anonymity set: the group of people a record could belong to. The smaller it is, the easier it is to pick one out.\n\n• Linkage: joining two harmless clues, such as who works at the last minute and how many reviews each paper got, to reveal an identity.\n\n• Controls: query controls, aggregation, and larger anonymity sets.",
    },
    {
      beforeQuestion: 25,
      title: "Cross-site scripting",
      body: "A cafe lets anyone pin a note on its notice board. If a note secretly gave orders to whoever read it, readers would obey, because they trust the cafe.\n\n• XSS, cross-site scripting: attacker-controlled JavaScript is delivered by a trusted site and runs in the visitor's browser with that site's trust.\n\n• Example: a comment box receives the text of a script tag. If the page prints it without encoding, the browser runs it instead of showing it.\n\n• Stored: the site saves the bad input and serves it to later visitors. Reflected: it is echoed straight back from the current request, such as a crafted link. DOM-based: page JavaScript in the browser writes untrusted data into the page.\n\n• Damage: stolen session tokens, actions done as the victim, fake login boxes, copied page data.\n\n• Defences: encode output for its context, sanitise allowed HTML with a proven library, use auto-escaping frameworks, and add Content Security Policy as an extra layer.",
    },
    {
      beforeQuestion: 31,
      title: "IDS, IPS and how they detect",
      body: "A security camera records and rings a bell when it sees someone climbing in. A guard standing at the door stops them physically.\n\n• IDS, intrusion detection system: watches activity and raises alerts. It sits on the monitoring path and is passive.\n\n• IPS, intrusion prevention system: sits inline, so traffic passes through it. It inspects, decides, then acts: block traffic, drop packets, reset connections or quarantine a host.\n\n• HIDS watches one host. NIDS watches a network segment.\n\n• Signature-based: matches known attack patterns. Anomaly-based: flags departures from a normal baseline, so it can catch unseen attacks but may raise false alarms.\n\n• Tools: Snort, Suricata, Zeek.\n\n• Tuning: alerts drown in false positives unless rules are tuned. Fail-open means traffic still flows if the device breaks. Fail-closed means traffic stops.",
    },
    {
      beforeQuestion: 36,
      title: "Firewalls, antivirus and the two scopes",
      body: "A building has a front gate that checks who and what comes in, and a cleaner who checks the rooms inside for anything nasty. They do different jobs.\n\n• Firewall: a filter on network traffic, in and out. Rules use IP address, port or protocol. It blocks unauthorised connections and helps cut off flood traffic. Rules are fixed, so it acts on sight.\n\n• Antivirus: lives on a host, scans local files, memory and running processes for malicious code, and quarantines what it finds.\n\n• Where tools live: on one host, on a router or network, or in a cloud service.\n\n• Software security: before release. Design, secure coding, testing, least privilege.\n\n• System security: after release. Monitoring, patching, and real-time threat response using firewalls, IDS and IPS.",
    },
  ],
  questions: [
    // ---------- Round 1: why security keeps failing (0-3) ----------
    {
      type: "mcq",
      prompt:
        "A company follows good security practice while its developers write code, yet it is still breached. Which explanation best fits why secure systems still get hacked?",
      options: [
        "Attackers usually break the encryption algorithms, so practice at any lifecycle stage is irrelevant",
        "Only defects created while coding matter, so extra care during testing changes nothing at all",
        "A defect can enter at any stage, and one trusting mistake that is never caught can be enough",
        "Once a system is deployed its attack surface stays fixed, so later changes cannot open new holes",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a bank vault with a perfect steel door but a window left unlatched by the cleaner. The door being perfect does not help if one small thing anywhere was missed.\n\n• Why it happens: a flaw can be introduced at any lifecycle stage, from forgetting a requirement to leaving a bad default setting or delaying a patch.\n\n• The shared root: the system trusts data, identity, configuration or a library more than it should.\n\n• Why layers matter: because one missed defect can be enough, several layered controls are used, so no single miss becomes a breach.\n\n• Why the other options are wrong: most big breaches use software mistakes rather than breaking encryption, defects appear outside coding too, and a running system's attack surface keeps changing with users, traffic and settings.\n\nSo the answer is: a defect can enter at any stage and one uncaught trusting mistake can be enough.",
    },
    {
      type: "mcq",
      prompt:
        "Three real breaches: Equifax in 2017 (an unpatched component, about 147 million people), Log4Shell in 2021 (a vulnerable library allowing remote code execution) and MOVEit in 2023 (SQL injection, mass data theft). What do these incidents have in common?",
      options: [
        "A software weakness, configuration issue or dependency gave the attacker a way in, not broken encryption",
        "Each attacker broke the encryption protecting stored data, so stronger algorithms would have prevented it",
        "Each breach began with a stolen password, so multi-factor login alone would have prevented all three",
        "Each one was staff misusing their legitimate access, so tighter vetting would have prevented all three",
      ],
      correctIndex: 0,
      modelAnswer:
        "It is like burglars who never pick the lock. They walk in through an unlatched window, a rotten door frame, or a spare key hidden under a mat.\n\n• The common thread: a weakness in the software itself, a bad configuration, or a vulnerable dependency (a borrowed component) gave the attacker a way in.\n\n• Equifax: a component that was not updated. Log4Shell: a widely used library. MOVEit: unsafe handling of input in a SQL query.\n\n• Why the others are wrong: none of the three was a broken cipher, a stolen password or a rogue insider.\n\nSo the answer is: a software weakness, configuration issue or dependency gave the attacker the way in.",
    },
    {
      type: "match",
      prompt:
        "Every lifecycle stage has a typical defect that sneaks in there. Match each stage to the defect that is typical of it.",
      pairs: [
        { left: "Requirements stage", right: "Nobody wrote down how an attacker might misuse the feature" },
        { left: "Design stage", right: "A trust boundary is drawn in the wrong place" },
        { left: "Implementation stage", right: "Untrusted data is handled unsafely in the code" },
        { left: "Testing stage", right: "A hostile path is never tried, only the happy path" },
        { left: "Deployment stage", right: "An unsafe default setting ships to the users" },
        { left: "Maintenance stage", right: "A known fix is applied too late" },
      ],
      modelAnswer:
        "Think of building and running a restaurant. Each step has its own classic slip.\n\n• Requirements: you never asked what a bad customer might do, so an abuse case is omitted.\n\n• Design: the plan lets kitchen staff and the public share a door, so a trust boundary is missed.\n\n• Implementation: coding is where data gets handled, so unsafe handling of untrusted input lives here.\n\n• Testing: the tester only checks the happy path and skips the adversarial one.\n\n• Deployment: the product goes live with insecure default settings such as a factory password.\n\n• Maintenance: an available patch is delayed, which is exactly the Equifax story.\n\nSo the answer is: abuse case omitted, trust boundary missed, unsafe data handling, adversarial path skipped, insecure default, patch delayed.",
    },
    {
      type: "mcq",
      prompt:
        "A small tool reads one fixed file and prints a summary. It never asks the user for anything and it has no database. Can an attacker use SQL injection against it?",
      options: [
        "Yes, because any program that runs on a server can be sent SQL commands through the network",
        "Yes, because the operating system passes hidden SQL text to every program that it starts",
        "Yes, but only after the tool is later connected to the internet using its default settings",
        "No, because with no user input and no database query there is nothing to inject into",
      ],
      correctIndex: 3,
      modelAnswer:
        "A letterbox that is bricked up cannot receive a poisoned letter. If nothing can be posted in, nothing bad can arrive that way.\n\n• The idea: an attack surface is every place an outsider can hand the program something. SQL injection needs typed input that ends up inside a database query.\n\n• Here there is no input and no query, so there is no place to inject.\n\n• The lesson: you decide the attack surface, then you secure it. Fewer inputs means fewer injection points.\n\n• Why the others are wrong: SQL is not sent to programs by the network or the operating system by default, and being on the internet alone does not create a query to poison.\n\nSo the answer is: no, because there is no input and no query to inject into.",
    },
    // ---------- Round 2: memory and pointers (4-8) ----------
    {
      type: "mcq",
      prompt:
        "A C programmer declares an integer array of 5 items and prints it straight away without setting any values. What will it show?",
      options: [
        "Five zeros, because the computer always clears new memory before handing it to a program",
        "Leftover values from earlier use of that memory, which look random and cannot be relied upon",
        "An error message, because C refuses to read an array that has not been given any values",
        "Five identical values that are the same on every run, so the program can safely rely on them",
      ],
      correctIndex: 1,
      modelAnswer:
        "Picture checking into a hotel room and finding the last guest's stuff still in the drawers. The room is not empty just because you have not put anything in it.\n\n• Garbage values: declaring memory does not clear it. It holds whatever was left there from earlier use.\n\n• Why it is risky: the values look random, may even repeat across runs, and still must never be relied on. Code that reads them behaves unpredictably and can leak old data.\n\n• The fix: initialise memory, for example set the array to zero, before using it.\n\n• Why the others are wrong: C does not clear memory for you and does not raise an error for reading it.\n\nSo the answer is: it shows leftover, unpredictable garbage values.",
    },
    {
      type: "fillblank",
      prompt:
        "A pointer is a variable that stores the memory ___ of another variable, rather than the other variable's own value.",
      blanks: [["address", "addresses", "location"]],
      modelAnswer:
        "A sticky note that says flat 42 is not the flat itself. It only tells you where to go.\n\n• Pointer: a variable whose content is the memory address of something else.\n\n• Why it matters for security: if the flat is handed back but the note still says 42, the note is now dangerous. That is a dangling pointer.\n\nSo the answer is: address.",
    },
    {
      type: "mcq",
      prompt:
        "A C program calls free on a block of memory, and later reads through the same pointer without changing it. What is this pointer called and why is it risky?",
      options: [
        "A garbage pointer, because it was never set to any value and may hold leftover data",
        "A leaking pointer, because the block was allocated and never freed so memory slowly runs out",
        "A dangling pointer, because it still refers to freed memory that something else may now own",
        "A null pointer, because it refers to no block and any use of it is stopped safely by the language",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine keeping the address of a flat you gave back. Someone new may live there now, and walking in is trouble for both of you.\n\n• Dangling pointer: it points at memory that has already been freed. Using it is undefined behaviour and the classic attack built on it is use-after-free.\n\n• Why the leak option is wrong: a leak is memory allocated and never freed. That wastes memory but is a different flaw from using freed memory.\n\n• Why the garbage option is wrong: a garbage value is an uninitialised one, not a freed block.\n\n• Why the null option is wrong: the pointer was not set to NULL. That is the safe fix.\n\nSo the answer is: a dangling pointer, because the freed memory may already belong to something else.",
    },
    {
      type: "multi",
      prompt:
        "Which practices remove or reduce manual memory-management defects in C or C++? Select all that apply.",
      options: [
        "Use std::unique_ptr so the memory is freed automatically when its single owner goes out of scope",
        "Use std::shared_ptr so the memory is freed once the last of several owners has finished with it",
        "Set a raw pointer to nullptr straight after delete so that a later check can see it is empty",
        "Call free a second time on the same pointer to make sure that the block has really gone",
        "Leave freed pointers unchanged because the memory manager marks them all as unusable for you",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "It is like a hotel that returns a key card to the desk automatically when you check out, instead of relying on you to remember.\n\n• RAII, resource acquisition is initialisation: the owning object frees the memory itself when it goes away, so there is nothing to forget.\n\n• Smart pointers: std::unique_ptr has one owner, std::shared_ptr shares ownership and frees at the last one. Both remove the manual free.\n\n• Safe destruction of raw pointers: set them to NULL or nullptr right after free or delete so a later check spots them.\n\n• Why the others are wrong: freeing the same block twice is a double free bug, and nothing marks a freed pointer as unusable for you.\n\nSo the answer is: unique_ptr, shared_ptr and setting the pointer to nullptr after delete.",
    },
    {
      type: "order",
      prompt:
        "Put the steps of handling one heap block of memory safely in C into the correct order.",
      steps: [
        "Ask for a block of memory and store its address in a pointer",
        "Use the block through that pointer",
        "Free the block once it is no longer needed",
        "Set the pointer to NULL straight after freeing",
        "Any later code checks the pointer for NULL before it uses it",
      ],
      modelAnswer:
        "Think of renting a locker. You get the key, use the locker, hand the key back, and then cross the locker number off your note so you cannot walk back to it by mistake.\n\n• Step 1: allocate and keep the address in a pointer.\n\n• Step 2: use the memory.\n\n• Step 3: free it exactly once.\n\n• Step 4: set the pointer to NULL immediately, so it is no longer dangling.\n\n• Step 5: later code checks for NULL, so a stale use is caught instead of corrupting memory.\n\nSo the answer is: allocate, use, free, set to NULL, then check for NULL before any later use.",
    },
    // ---------- Round 3: testing and layers (9-12) ----------
    {
      type: "match",
      prompt: "Match each testing activity to the description that fits it best.",
      pairs: [
        {
          left: "Static analysis (SAST)",
          right: "A scanner flags a risky query-building pattern in source code that has never been run",
        },
        {
          left: "Dynamic analysis (DAST)",
          right: "A tool sends odd requests to the running app and notices that memory use keeps growing",
        },
        {
          left: "Penetration testing",
          right: "An authorised tester tries to break into the live application the way a real attacker would",
        },
        {
          left: "Monitoring",
          right: "A dashboard keeps watching the released system to see whether it stays under control",
        },
      ],
      decoys: ["A compiler rewrites the program so that it runs faster on the target machine"],
      modelAnswer:
        "Compare a car checked on paper, on a test track, by a crash-test professional, and by a dashboard warning light once you own it.\n\n• Static analysis, SAST: inspects code or compiled files without executing them, in development or the build, so it can flag a risky pattern early.\n\n• Dynamic analysis, DAST: runs the program and probes it, which finds runtime problems such as memory leaks.\n\n• Penetration testing: an authorised person simulates a real attack on the running application.\n\n• Monitoring: continuous observation after release.\n\n• The decoy is an optimisation, not security testing.\n\nSo the answer is: static reads without running, dynamic probes the running app, pen testing simulates a real attack, and monitoring watches the live system.",
    },
    {
      type: "multi",
      prompt:
        "A web app is running in a test environment. Which findings is dynamic analysis or penetration testing of the running app well placed to reveal? Select all that apply.",
      options: [
        "Memory use that keeps growing after many requests, showing a leak",
        "A user changing an ID in the address and seeing another person's record, an authorisation failure",
        "A comment box that runs typed script when the page loads",
        "A risky query-building pattern inside a code path that no test ever reaches",
        "A naming-style rule that is broken but has no effect on how the program runs",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Test-driving a car shows that the brakes squeal or the steering pulls, but only on the routes you actually drive. Reading the blueprint finds problems in parts you never took out on the road.\n\n• Dynamic analysis and pen testing work on the running app, so they find runtime behaviour: leaks, improper authorisation, and injected script that really executes.\n\n• Why a never-reached code path is wrong: a running test can only see code that actually runs. Static analysis reads all the code, even parts no test touches.\n\n• Why the style rule is wrong: a style breach with no runtime effect is a static-checking matter.\n\nSo the answer is: the growing memory, the ID change exposing another record, and the script that runs on page load.",
    },
    {
      type: "order",
      prompt:
        "Put the defence-in-depth layers in order, from build time to run time.",
      steps: [
        "Secure coding",
        "Testing",
        "Static analysis",
        "Dynamic analysis",
        "Monitoring",
        "IDS and IPS",
      ],
      modelAnswer:
        "Building a castle: good bricks first, then inspect the walls, then probe them, then put up guards, and finally alarms and gates in service.\n\n• Secure coding prevents flaws as the code is written.\n\n• Testing challenges the software with hostile cases.\n\n• Static analysis inspects the code without running it.\n\n• Dynamic analysis probes it while running.\n\n• Monitoring observes the live system.\n\n• IDS and IPS detect and block at run time.\n\nThe layers work together so one missed defect does not turn into a successful attack.\n\nSo the answer is: secure coding, testing, static analysis, dynamic analysis, monitoring, then IDS and IPS.",
    },
    {
      type: "mcq",
      prompt:
        "A team has monitoring dashboards and a well-tuned IDS, but its developers still build SQL commands by joining strings, and most of its incidents are injection. Where should the next control go to reduce risk most effectively?",
      options: [
        "At the coding stage, using prepared statements so the flaw is removed where it is cheapest",
        "At the network edge, adding a second IDS so that more of the injection attempts are seen",
        "At the monitoring stage, adding more dashboards so that alerts on injection are noticed sooner",
        "At the deployment stage, hardening the server settings so that less of the flaw is reachable",
      ],
      correctIndex: 0,
      modelAnswer:
        "If a pipe keeps leaking, you fix the pipe before you buy more buckets. Buckets help, but the leak is still there.\n\n• Where to place it: put the next control where it removes the root cause most cheaply, and where a layer is missing. Here that is secure coding.\n\n• Why earlier is better: the later a defect is found, the more design, data and operations already depend on it.\n\n• Why the others are weaker: more detection and dashboards only notice the flaw being used. Hardening the server does not change how the query is built.\n\nSo the answer is: add prepared statements at the coding stage.",
    },
    // ---------- Round 4: databases and CIA (13-16) ----------
    {
      type: "mcq",
      prompt:
        "A student says a database is just a warehouse where data files are stored. Which correction is best?",
      options: [
        "It is a very large disk, and the only difference from a warehouse is that it is faster",
        "It is a set of shared spreadsheets, and the difference is that several people can edit them",
        "It is a backup system, and the difference is that its main job is to keep spare copies",
        "It is a managed collection of structured data that also keeps links, rules and constraints between items",
      ],
      correctIndex: 3,
      modelAnswer:
        "A warehouse holds boxes. A good library also knows which book belongs to which series, who borrowed it and what rules apply. That connecting knowledge is what makes it more than storage.\n\n• Database: an organised collection of structured data.\n\n• What makes it special: it preserves relationships and dependencies, for example a foreign key linking an enrolments table to a students table.\n\n• Why security cares: breaking into a database affects every application and decision that depends on it, not only the stored records.\n\nSo the answer is: a managed collection of structured data that keeps the links, rules and constraints between items.",
    },
    {
      type: "sort",
      prompt:
        "Put each database control into the CIA goal it mainly supports at the data layer.",
      groups: ["Confidentiality", "Integrity", "Availability"],
      items: [
        { text: "Least privilege database roles", group: 0 },
        { text: "Masking card numbers shown to support staff", group: 0 },
        { text: "Foreign-key constraint linking enrolments to students", group: 1 },
        { text: "Audit log of every change to a payroll row", group: 1 },
        { text: "A replicated standby database that takes over on failure", group: 2 },
        { text: "Backups kept on a separate isolated network", group: 2 },
      ],
      modelAnswer:
        "Think of a school office. A key list decides who sees which files, a checklist makes sure the records add up, and a spare filing cabinet in another building keeps the school running if the first one burns.\n\n• Confidentiality, only the right people see the data: least privilege and masking.\n\n• Integrity, data stays accurate, valid and traceable: foreign keys and other constraints, and audit logs.\n\n• Availability, data is there when needed: replication or failover and backups kept away from the live network.\n\nSo the answer is: least privilege and masking for confidentiality, constraints and audit logs for integrity, standby and separate backups for availability.",
    },
    {
      type: "mcq",
      prompt:
        "A timetable database stores room capacity in one table and enrolment counts in another. A bug lets enrolments go above the room's capacity. Which goal has failed, and what control helps?",
      options: [
        "Confidentiality, so the enrolment table should be encrypted with a stronger key",
        "Integrity, so a consistency check should compare the enrolment count with the room capacity",
        "Availability, so the enrolment table should be replicated to a second server as a standby",
        "Confidentiality, so room capacities should be masked from students who use the booking page",
      ],
      correctIndex: 1,
      modelAnswer:
        "If a cinema sells 300 tickets for a 200-seat room, the ticket system and the seat plan disagree. Nobody stole anything, but the records no longer make sense.\n\n• Integrity: data must stay accurate, valid and consistent. The same fact can be reached through different tables, so a check across them keeps the data correct.\n\n• The control: a consistency constraint, such as enrolments must not exceed capacity.\n\n• Why the others are wrong: encryption, masking and replication protect secrecy and uptime. They would not stop a wrong number being saved.\n\nSo the answer is: integrity, protected by a consistency check across the two tables.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about protecting a database.",
      options: [
        "An application account holding only the permissions it needs limits what a stolen login can read",
        "Audit logs support integrity because each change can be traced back to who made it",
        "Keeping backups on the same network as the live database is safest because they are quick to reach",
        "Replication or failover helps availability because a second copy can take over",
        "Encrypting the database files stops SQL injection because the attacker cannot read encrypted data",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Picture a shop. Staff only get keys to the rooms they need, every stock change is written in a ledger, and a spare storeroom in another town covers a fire.\n\n• Least privilege: a stolen account can only do what that account was allowed to do, so the damage is limited.\n\n• Audit logs: they make changes traceable, which supports integrity.\n\n• Failover: a standby copy keeps data available.\n\n• Why same-network backups are wrong: one attack or fire on that network can reach both the data and its backups. Keep them isolated.\n\n• Why encryption at rest is wrong: SQL injection runs through the application, which can decrypt the data for its own queries.\n\nSo the answer is: least privilege, audit logs and failover are correct.",
    },
    // ---------- Round 5: SQL injection (17-21) ----------
    {
      type: "mcq",
      prompt:
        "A student says SQL injection works because attackers trick the database into leaking its data. Which statement best corrects this?",
      options: [
        "The database has a bug in its query engine that attackers find and exploit directly",
        "The database password is weak, so attackers simply guess it and log in directly",
        "The application builds its query from typed input, so attacker text is read as SQL commands",
        "The network has no encryption, so attackers read the queries as they pass by",
      ],
      correctIndex: 2,
      modelAnswer:
        "If a clerk obeys every word written on the note you hand over, the clerk is not being tricked. The office procedure is simply badly designed.\n\n• Key message: attackers exploit insecure application code, not the database itself.\n\n• How it works: user-controlled text is merged into the SQL command, so it gets interpreted as SQL syntax and changes what the query does.\n\n• Why the others are wrong: the database is doing what it is told, a weak password or unencrypted traffic are different problems, and none of them is how injection works.\n\nSo the answer is: the application builds the query from typed input, so attacker text is read as SQL commands.",
    },
    {
      type: "mcq",
      prompt:
        "A login runs the query SELECT * FROM users WHERE name='X' AND pass='Y' with the typed values dropped in as X and Y. A tester enters Bob' OR 1=1 -- as the name. The double dash starts a comment that hides the rest of the line. What is the most likely outcome?",
      options: [
        "The database rejects the odd characters and the login fails, so the attempt is safely blocked",
        "The query matches only the user Bob, so the password is still checked and nothing is learned",
        "The comment marker deletes the users table, so nobody at all can log in afterwards",
        "The condition is always true and the password check is commented out, so login can succeed",
      ],
      correctIndex: 3,
      modelAnswer:
        "It is like a guard who is told to let in anyone named Bob or anyone for whom one equals one. Since one always equals one, everyone is let in, and the rest of the instructions are torn off the page.\n\n• The trick: OR 1=1 makes the condition true for every row.\n\n• The dash dash: it turns the remaining text, including the password test, into a comment, so it is never checked.\n\n• Result: authentication bypass and unauthorised data access.\n\n• Why the others are wrong: the database does not know the text is hostile, it does not check the password once it is commented out, and the comment marker does not delete tables by itself.\n\nSo the answer is: the condition is always true and the password check is commented out, so login can succeed.",
    },
    {
      type: "order",
      prompt: "Put the steps of a successful SQL injection against a login form into the correct order.",
      steps: [
        "The attacker types a crafted piece of text into the login field",
        "The application joins the text into the middle of its SQL command",
        "The database runs the altered command as ordinary SQL",
        "The always-true condition makes the query match every row",
        "The attacker gets in without knowing the password",
      ],
      modelAnswer:
        "Think of a note that is passed along a chain of clerks. Each clerk trusts the one before, so the forged instruction reaches the end unchecked.\n\n• Step 1: hostile input is supplied.\n\n• Step 2: the flaw, the app pastes the input straight into the command instead of keeping it apart.\n\n• Step 3: the database cannot tell which part was meant as data, so it runs all of it.\n\n• Step 4: the injected condition is always true, so every row matches.\n\n• Step 5: the result is authentication bypass and unauthorised data access.\n\nSo the answer is: crafted input, pasted into the command, run by the database, always true, attacker gets in.",
    },
    {
      type: "mcq",
      prompt:
        "A login page builds its database query by joining strings. Which single change is the primary, structural fix?",
      options: [
        "Strip the apostrophe character out of every value that users type into the form",
        "Publish a longer and more complex list of characters that usernames may contain",
        "Hide the database error messages so that attackers cannot see what went wrong",
        "Use a prepared statement with placeholders so that input is only ever passed in as data",
      ],
      correctIndex: 3,
      modelAnswer:
        "A form letter with blanks is safer than a blank sheet. Whatever goes into a blank stays a name in the blank and can never become a new instruction.\n\n• Prepared statement: the SQL structure is fixed first with a ? placeholder, and the input is supplied separately as a value. So even text like ABC123 or 1=1 is just a wrong string.\n\n• Why it is primary: it separates data from executable SQL, which is exactly what injection breaks.\n\n• Why the others are weaker: stripping one character is fragile because attackers try many other tricks, a longer allow-list only narrows input, and hiding errors does not fix how the query is built.\n\nSo the answer is: use a prepared statement with placeholders.",
    },
    {
      type: "multi",
      prompt: "Select all correct statements about defending against SQL injection.",
      options: [
        "Input validation checks that a value matches its expected type, range and syntax",
        "Least privilege limits the damage if an injection still gets through",
        "Sanitising by stripping or escaping quotes is enough by itself to stop SQL injection",
        "An ORM protects against injection even when it is fed raw concatenated SQL strings",
        "Prepared statements make validation and least privilege pointless",
      ],
      correctIndices: [0, 1],
      modelAnswer:
        "Airport security has a bag check, a locked cockpit door and an alarm. Each layer has a job, and no single one is enough.\n\n• Validation: accept only the expected type, range and syntax, such as an age from 0 to 120.\n\n• Least privilege: if something goes wrong, a limited database account can do less harm.\n\n• Why sanitising alone is wrong: stripping or escaping is fragile, because attackers keep trying other always-true tricks and other characters.\n\n• Why the ORM option is wrong: an ORM only helps when its safe query methods are used correctly.\n\n• Why the last option is wrong: prepared statements are the primary defence, but the other layers still add safety.\n\nSo the answer is: validation and least privilege are correct.",
    },
    // ---------- Round 6: inference (22-24) ----------
    {
      type: "mcq",
      prompt:
        "A staff directory lets any staff member ask: is there a person named Alice whose salary is over 100000? It only answers found or not found and never shows a salary. A colleague repeats the question with other thresholds. What is happening?",
      options: [
        "SQL injection, because the colleague changes the query text to bypass the access control",
        "An inference attack, because a series of allowed yes or no answers reveals a secret",
        "Cross-site scripting, because the queries run a script inside another person's browser",
        "A denial of service, because many repeated queries slow the directory down for others",
      ],
      correctIndex: 1,
      modelAnswer:
        "It is like playing twenty questions. Each yes or no seems harmless, but ten of them can pin down a secret number.\n\n• Inference attack: the attacker does not bypass access control. They learn from what the system reveals through legitimate queries.\n\n• Here: found or not found never shows the salary, yet repeating the question with different thresholds narrows it down.\n\n• Lesson: a sequence of low-information answers can reveal a high-value secret.\n\n• Why the others are wrong: nothing is injected, no browser runs a script, and there is no flood of traffic.\n\nSo the answer is: an inference attack from a series of allowed yes or no answers.",
    },
    {
      type: "mcq",
      prompt:
        "A conference shows a chart of each anonymous reviewer's progress. The horizontal axis is days before the deadline, the vertical axis is the fraction of work finished, each person has a named blue line, and a red line shows the average. It also lists how many reviews each paper received. An author matches a person who always rushes at the last minute to a paper whose reviews arrived late. What is this attack?",
      options: [
        "A brute-force attack, because the author keeps guessing reviewer names until one is right",
        "A cross-site scripting attack, because the chart runs the author's script in reviewers' browsers",
        "A linkage attack, because behaviour and counts are matched to infer who reviewed which paper",
        "A privilege escalation, because the author gains the higher access rights that reviewers hold",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of spotting who wrote a note by matching their handwriting to a signed shopping list. Neither item is secret alone, but together they identify someone.\n\n• Linkage attack: match reviewer behaviour, a fingerprint like last-minute rushing, to review counts per paper to infer who reviewed which paper.\n\n• Why it works: individually harmless signals become identifying when combined, and a small anonymity set makes it easier.\n\n• Useful aggregates leak when identities stay attached to them.\n\n• Why the others are wrong: nobody guessed passwords, ran script or gained extra rights. They only combined what was shown.\n\nSo the answer is: a linkage attack.",
    },
    {
      type: "multi",
      prompt:
        "Which measures help reduce the risk of database inference attacks? Select all that apply.",
      options: [
        "Return a bland access-blocked message instead of a detailed error that shows names and ranges",
        "Answer only in aggregate, so individual values are never returned",
        "Keep groups large so a record cannot be picked out of a small anonymity set",
        "Encrypt the disk holding the database files so stolen drives are unreadable",
        "Add a firewall rule that blocks traffic from unknown addresses at the network edge",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "Compare a receptionist who says I cannot help with that to one who explains exactly which rule you broke. The second one is teaching you how to get around the rule.\n\n• Bland errors: a verbose error reveals variable names, structure and allowed ranges, so an attacker provokes more errors and learns more. Do not be an information provider.\n\n• Aggregation and query controls: limit what a legitimate answer can reveal.\n\n• Larger anonymity sets: inference gets harder when many people look alike.\n\n• Why the others are wrong: disk encryption and a network firewall protect data at rest and the network edge. The inference attacker is using allowed, legitimate queries.\n\nSo the answer is: bland errors, aggregate answers and larger groups.",
    },
    // ---------- Round 7: XSS (25-30) ----------
    {
      type: "mcq",
      prompt:
        "A forum saves each comment and prints it on the thread page exactly as typed. A user posts text containing a script tag that sends every visitor's session token to a stranger's server. Which attack is this and which defence directly stops it?",
      options: [
        "Stored XSS, stopped by encoding the comment for its HTML context when the page is output",
        "Stored XSS, stopped by using a prepared statement when the comment is saved in the database",
        "SQL injection, stopped by encoding the comment for its HTML context when the page is output",
        "Reflected XSS, stopped by adding one more firewall rule that blocks scripts arriving from outside",
      ],
      correctIndex: 0,
      modelAnswer:
        "If a notice board copies any note onto a big sign, a rude note becomes the cafe's own rude sign. Cleaning the note as it goes on the sign is what stops that.\n\n• Attack: the site stores the untrusted comment and serves it to later visitors, so it is stored XSS.\n\n• Why it works: if output is not encoded, data becomes code, and the browser trusts the site.\n\n• Direct fix: encode output for the context it is written into, so angle brackets show as text instead of running.\n\n• Why the others are wrong: a prepared statement stops SQL injection on saving, not script running on output. This is not SQL injection. And the script comes from the site itself, so a perimeter rule does not see it as an outside attack.\n\nSo the answer is: stored XSS, stopped by output encoding for its HTML context.",
    },
    {
      type: "match",
      prompt: "Match each attack or weakness to what it does.",
      pairs: [
        { left: "SQL injection", right: "Makes the back-end database run commands chosen by the attacker" },
        { left: "Cross-site scripting", right: "Runs attacker script in a visitor's browser under a trusted site" },
        { left: "Database inference attack", right: "Deduces a secret from answers the system is allowed to give" },
        { left: "Broken access control", right: "Treats a user as having authority that they were never given" },
      ],
      decoys: ["Floods a service with traffic until real users cannot reach it"],
      modelAnswer:
        "Four different doors into the same building: the back office, the customers, the chatterbox and the unlocked cupboard.\n\n• SQL injection: the effect lands on the back-end database, though the flaw is in the application code that built the query.\n\n• XSS: the target is the end user's browser, which trusts the vulnerable site.\n\n• Inference: no bypass of access control, just clever reading of legitimate answers.\n\n• Broken access control: identity is mistaken for authority.\n\n• The decoy describes a denial of service.\n\nSo the answer is: injection hits the database, XSS hits the browser, inference reads allowed answers, and broken access control grants unearned authority.",
    },
    {
      type: "mcq",
      prompt: "A colleague says that XSS hacks the browser. Which correction is best?",
      options: [
        "It exploits a bug in the browser's memory handling, which vendors then fix in updates",
        "It breaks the encryption between browser and site so that the pages can be changed",
        "It steals the password from the browser's saved-password store and sends it out",
        "It abuses the browser's trust in a vulnerable site that serves the attacker's code as its own",
      ],
      correctIndex: 3,
      modelAnswer:
        "A doorman lets in anyone wearing the hotel's uniform. If a thief steals a uniform, the doorman is not hacked, he is just trusting the wrong person.\n\n• The browser trusts the website, not the attacker.\n\n• If the website serves malicious code, the browser runs it anyway, with the site's privileges.\n\n• So XSS does not hack the browser. It abuses the browser's trust in a vulnerable application, by exploiting the website's own code.\n\n• Why the others are wrong: no browser bug, no broken encryption and no saved-password theft is needed.\n\nSo the answer is: it abuses the browser's trust in a vulnerable site that serves the attacker's code.",
    },
    {
      type: "sort",
      prompt: "Put each defence into the box for the attack it directly prevents, or into Neither.",
      groups: ["Directly prevents SQL injection", "Directly prevents XSS", "Neither directly"],
      items: [
        { text: "A prepared statement with ? placeholders", group: 0 },
        { text: "An ORM used through its safe query methods", group: 0 },
        { text: "HTML-encoding angle brackets when printing a comment", group: 1 },
        { text: "A Content Security Policy as an extra browser layer", group: 1 },
        { text: "A second IDS placed at the network edge", group: 2 },
        { text: "Nightly backups on a separate network", group: 2 },
      ],
      modelAnswer:
        "Different problems need different locks. The lock on the front door does not stop a leak in the roof.\n\n• Against SQL injection: keep data apart from SQL, using prepared statements or an ORM used properly.\n\n• Against XSS: encode output for its context, and add a Content Security Policy as an additional layer.\n\n• Neither: an IDS only detects, and backups only help you recover afterwards. Useful, but they do not stop either flaw from being exploited.\n\nSo the answer is: prepared statements and a safe ORM for SQL injection, output encoding and CSP for XSS, and the IDS and backups for neither.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about cross-site scripting and injection.",
      options: [
        "Stored XSS keeps the malicious input on the server and serves it to later visitors",
        "Reflected XSS echoes malicious input from the current request, such as a crafted link, back in the response",
        "DOM-based XSS requires the server to store the payload in its database first",
        "Not every text box feeds a database query, so input can inject script or logic instead of SQL",
        "A Content Security Policy makes output encoding unnecessary",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Think of three ways a prank can reach a person: a note left on a shared board, a note handed straight back to you, and a note you write on your own desk yourself.\n\n• Stored: saved by the server and shown to later visitors.\n\n• Reflected: echoed straight back from the current request.\n\n• DOM-based: the page's own JavaScript in the browser writes untrusted data into the page, so it does not need to be stored on the server at all.\n\n• Not always SQL: a form field can also feed program logic or a page, so not every injection is SQL injection.\n\n• CSP: an extra layer only. It supports, but does not replace, output encoding.\n\nSo the answer is: stored, reflected and the not-always-SQL statements are true.",
    },
    {
      type: "fillblank",
      prompt:
        "To stop stored XSS, the page should ___ the comment for its HTML context, so that angle brackets are shown as text instead of being run as script.",
      blanks: [["encode", "encoded", "encoding", "escape", "escaped", "escaping"]],
      modelAnswer:
        "If you want to read a rude word aloud in a quotation, you put it inside speech marks so it is just words, not an order.\n\n• Output encoding: convert characters such as the angle brackets and the ampersand into safe equivalents so the browser shows them instead of running them.\n\n• The context matters: HTML, attribute, JavaScript and URL contexts each need the right kind of encoding.\n\n• The banner: validate input, encode output, keep data separate from code.\n\nSo the answer is: encode.",
    },
    // ---------- Round 8: IDS, IPS and detection (31-35) ----------
    {
      type: "mcq",
      prompt:
        "A web server receives thousands of wrong-password attempts from one address. Only an IDS is deployed. Would the IDS alone stop this brute-force attack?",
      options: [
        "Yes, because an IDS blocks the source address automatically as soon as it sees repeated failures",
        "No, because an IDS only detects and alerts, so guesses continue until a person or inline tool acts",
        "Yes, because an alert makes the attacker stop once they know that the team has been warned",
        "No, because an IDS cannot see login failures at all and only finds malware inside uploaded files",
      ],
      correctIndex: 1,
      modelAnswer:
        "A security camera sees the burglar and rings the bell, but it cannot lock the door. Someone still has to come and act.\n\n• IDS: detects and generates alerts. It is passive, on the monitoring path, and it does not automatically stop the attack.\n\n• Meanwhile: the guesses keep coming until a human responds.\n\n• IPS: sits inline, and can block the source IP and log the incident automatically. Detection is still useful for the alert.\n\n• Why the others are wrong: an IDS does not block, alerts alone do not stop attackers, and login failures are exactly the sort of pattern it can see.\n\nSo the answer is: no, an IDS only detects and alerts, so guessing continues until a person or an inline IPS acts.",
    },
    {
      type: "mcq",
      prompt:
        "A company wants to watch the traffic crossing its office network segment for scans and attacks, rather than one single server. Which choice fits best?",
      options: [
        "A HIDS, because it watches the activity on one computer or server",
        "An IPS, because only inline devices are able to observe network traffic",
        "A NIDS, because it watches the traffic across a network segment",
        "An antivirus, because it scans network packets for malicious files",
      ],
      correctIndex: 2,
      modelAnswer:
        "A camera in one room sees only that room. A camera over the corridor sees everyone walking past.\n\n• HIDS, host-based IDS: watches one computer or server.\n\n• NIDS, network-based IDS: watches traffic across a network segment, so it suits a whole office.\n\n• Why the IPS option is wrong: an IPS is about acting inline, but an IDS can observe the network too.\n\n• Why antivirus is wrong: it scans files, memory and processes on one host.\n\nSo the answer is: a NIDS.",
    },
    {
      type: "mcq",
      prompt:
        "A brand-new attack style sends unusual bursts of traffic, and no published attack pattern exists yet. Which detection approach has the best chance of flagging it, and what is the trade-off?",
      options: [
        "Anomaly-based, because it flags departures from normal behaviour, but it may raise false alarms",
        "Signature-based, because it matches known patterns, so it flags unseen attacks just as easily",
        "Signature-based, because it learns a normal baseline, but it needs frequent updates to stay useful",
        "Anomaly-based, because it matches known patterns quickly, but it only works on a single host",
      ],
      correctIndex: 0,
      modelAnswer:
        "A wanted poster only helps you catch criminals whose faces are already on it. A guard who notices someone acting oddly can spot a new one, but may also stop an innocent nervous person.\n\n• Signature-based: matches known attack patterns, so an unseen attack has no signature to match.\n\n• Anomaly-based: builds a baseline of normal behaviour and flags deviations, so it can catch unseen attacks.\n\n• Trade-off: legitimate but unusual activity can trigger false positives, so it needs tuning.\n\n• Why the others are wrong: they swap what the two methods do.\n\nSo the answer is: anomaly-based, at the cost of possible false alarms.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about intrusion prevention systems.",
      options: [
        "An IPS sits inline, so traffic passes through it and it can drop packets or reset connections",
        "A badly tuned IPS can block legitimate users, which is a false positive with a real cost",
        "A fail-open inline device blocks all traffic if it breaks",
        "A fail-closed inline device stops traffic passing if it breaks, which can cause an outage",
        "An IPS can sit passively off to the side of the network and still block the traffic",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Think of a guard at a door. To stop someone he must stand in the doorway, and if he is jumpy he will sometimes turn away the wrong people.\n\n• Inline: an IPS inspects, decides and acts, and it can only block traffic that actually passes through it.\n\n• False positives: rules must be tuned and tested before production, or useful traffic gets blocked.\n\n• Fail-closed: if the device fails, traffic stops, which is safe but can cause an outage.\n\n• Why fail-open is wrong: fail-open means traffic keeps flowing when the device breaks, which lets attacks through.\n\n• Why the passive option is wrong: a device that is off to the side is an IDS, which can only watch and alert.\n\nSo the answer is: inline, false positives and fail-closed statements are true.",
    },
    {
      type: "fillblank",
      prompt:
        "A tool that flags traffic which departs from a learned baseline of normal behaviour uses ___-based detection.",
      blanks: [["anomaly", "anomaly-based"]],
      modelAnswer:
        "A shopkeeper who knows every regular customer notices when someone unusual walks in, without needing a wanted poster.\n\n• Anomaly-based: learns what normal looks like and flags deviations. It can catch unseen attacks but may raise false alarms.\n\n• Signature-based: compares activity against known attack patterns.\n\nSo the answer is: anomaly.",
    },
    // ---------- Round 9: firewalls, antivirus and scopes (36-40) ----------
    {
      type: "sort",
      prompt: "Put each control into the box for the kind of security it belongs to.",
      groups: ["Software security (before deployment)", "System security (after deployment)"],
      items: [
        { text: "Parameterised queries in the login code", group: 0 },
        { text: "Encoding comment output for HTML", group: 0 },
        { text: "Static analysis run during the build", group: 0 },
        { text: "An IDS alerting on repeated failed logins", group: 1 },
        { text: "An IPS dropping packets from a scanning host", group: 1 },
        { text: "A firewall rule blocking a protocol the servers never use", group: 1 },
      ],
      modelAnswer:
        "Building a car safely and driving it safely are different jobs. Crumple zones are put in at the factory. Speed cameras and police watch the roads afterwards.\n\n• Software security: prevent vulnerabilities before deployment, by design, secure coding, testing and least privilege. Parameterised queries, output encoding and static analysis all belong here.\n\n• System security: detect and respond after deployment, because the running system is reachable, observable and continuously attacked. IDS, IPS and firewall rules belong here.\n\n• Both are essential, and neither replaces the other.\n\nSo the answer is: the coding and build controls are software security, and the IDS, IPS and firewall are system security.",
    },
    {
      type: "mcq",
      prompt: "Which statement describes the difference between a firewall and antivirus?",
      options: [
        "A firewall scans local files for malicious code, while antivirus filters network traffic by port",
        "A firewall reviews behaviour over months for oddities, while antivirus blocks packets by IP address",
        "A firewall sits on each file and quarantines it, while antivirus filters what enters the network",
        "A firewall filters traffic by IP address, port or protocol, while antivirus scans files and memory on a host",
      ],
      correctIndex: 3,
      modelAnswer:
        "The front gate checks who and what may come in. The cleaner inside checks the rooms for something nasty that got in anyway.\n\n• Firewall: a filter on network traffic, in and out, using rules about IP address, port or protocol. It blocks unauthorised connections and can block a protocol, such as mail traffic.\n\n• Antivirus: host-level. It scans local files, memory and running processes for malicious code and quarantines what it finds, often in real time.\n\n• Why the others are wrong: they swap the two jobs.\n\nSo the answer is: a firewall filters network traffic by IP, port or protocol, while antivirus scans files and memory on a host.",
    },
    {
      type: "mcq",
      prompt:
        "A lab computer is never connected to any network, but staff sometimes plug in USB sticks to copy files onto it. Which control is the most useful for this computer?",
      options: [
        "A network firewall, because USB sticks may carry traffic that needs filtering by port",
        "Antivirus on the computer, because files on a USB stick can carry malicious code",
        "An IPS at the network edge, because malicious files would arrive through that link",
        "A NIDS on the office segment, because it can spot files copied from removable media",
      ],
      correctIndex: 1,
      modelAnswer:
        "A house with no front door on the street does not need a gate. But if visitors bring parcels inside, you want to check the parcels.\n\n• Air-gapped machine: it has no network, so a network firewall or network IDS has nothing to filter or watch.\n\n• The USB path: files arriving on removable media can carry malicious code, so a host-level antivirus scan is the useful control.\n\n• The bigger idea: how much protection you need depends on the scenario and the likelihood.\n\nSo the answer is: antivirus on the computer.",
    },
    {
      type: "mcq",
      prompt:
        "A social site instantly bans any account that posts one specific banned word. It does not review months of an account's behaviour. Is this closer to a firewall or an IDS?",
      options: [
        "An IDS, because it reacts to an unusual pattern that builds up over a long period",
        "An IDS, because it only raises an alert and leaves the decision to a person later",
        "A firewall, because it applies a fixed rule on sight without looking at the wider pattern",
        "A firewall, because it studies each account's history to learn a normal baseline first",
      ],
      correctIndex: 2,
      modelAnswer:
        "A bouncer told never to admit anyone in a red hat is applying a fixed rule. A manager who reads six months of reports and notices odd behaviour is doing something different.\n\n• Firewall: works from fixed rules and acts on sight, blocking what matches.\n\n• IDS: looks at the wider pattern over time, such as a machine suddenly changing how it talks, and raises an alert.\n\n• Here: one word triggers an instant ban with no review of history, so it behaves like a firewall rule.\n\n• Why the others are wrong: they describe pattern-over-time or alert-only behaviour.\n\nSo the answer is: closer to a firewall, because a fixed rule acts on sight.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about firewalls, antivirus and where they are placed.",
      options: [
        "A firewall can filter traffic in both directions using rules on IP address, port or protocol",
        "Antivirus scans local files, memory and running processes on a host for malicious code",
        "A firewall or IDS can be deployed on one host, on a router, or in a cloud service",
        "Antivirus is the main tool for stopping a flood of network traffic",
        "A firewall opens the files inside a laptop and quarantines the infected ones",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "A city protects itself with border checks, guards in each building and a cleaning crew. Each has a place and a job.\n\n• Firewall: filters traffic in and out by IP address, port or protocol, and helps mitigate DDoS floods.\n\n• Antivirus: host-level file, memory and process scanning.\n\n• Placement: on one host it protects only that system, on a router it protects the network, and in the cloud, traffic can pass through a relay first so bad packets are dropped before reaching the machine.\n\n• Why the last two are wrong: floods are a network problem for network tools, and reading and quarantining files is antivirus work.\n\nSo the answer is: the traffic-filtering, host-scanning and placement statements are true.",
    },
    // ---------- Mixed review (41-49) ----------
    {
      type: "mcq",
      prompt:
        "An attacker changes the exam marks stored in a university database without permission. Which part of the CIA triad is broken?",
      options: [
        "Integrity, because the data was changed without authorisation and can no longer be trusted",
        "Confidentiality, because the attacker was able to read marks that were not theirs to see",
        "Availability, because the students can no longer reach the marks page during the change",
        "Accountability, because nobody can prove who made the change, which is itself a CIA goal",
      ],
      correctIndex: 0,
      modelAnswer:
        "If someone secretly rewrites your report card, nobody read a secret and the school is still open. The trouble is that the card is now wrong.\n\n• Integrity: preventing unauthorised change so that data stays accurate and trustworthy.\n\n• Confidentiality: preventing unauthorised disclosure. Availability: sustaining dependable access.\n\n• Why accountability is wrong: it is a useful property, but it is not one of the three letters of CIA.\n\nSo the answer is: integrity.",
    },
    {
      type: "mcq",
      prompt:
        "Alice wants to send Bob a secret message that only Bob can read, and they have never shared a secret key. Which approach fits?",
      options: [
        "Encrypt the message with Alice's own private key so that anyone can read it with her public key",
        "Hash the message with SHA-256 so that Bob can reverse the hash to get the message back",
        "Encrypt the message with a symmetric key that the two of them already share in secret",
        "Encrypt the message with Bob's public key, so that only Bob's private key can open it",
      ],
      correctIndex: 3,
      modelAnswer:
        "Bob hands out open padlocks to everyone. Anyone can snap one shut on a box, but only Bob holds the key that opens it.\n\n• Public-key encryption: encrypt with the receiver's public key, and only their private key decrypts.\n\n• Why the first option is wrong: encrypting with your own private key is how you sign, and anyone with the public key can open it.\n\n• Why hashing is wrong: hashes are one-way, so Bob cannot recover the message.\n\n• Why the symmetric option is wrong: the question says they never shared a key.\n\nSo the answer is: encrypt with Bob's public key.",
    },
    {
      type: "mcq",
      prompt:
        "A user logs in with a password and then types a one-time code sent to their phone. Which idea does this show?",
      options: [
        "Authorisation, because the system decides which files the authenticated user may open",
        "Multi-factor authentication, because two different kinds of evidence are needed to prove identity",
        "Single sign-on, because one login is then reused across several separate services",
        "Non-repudiation, because the user can no longer deny that they took the action",
      ],
      correctIndex: 1,
      modelAnswer:
        "Getting into a club with both your ID and a stamp from earlier is stronger than either alone.\n\n• Multi-factor authentication: combine different kinds of evidence, such as something you know, the password, and something you have, the phone.\n\n• Authentication is proving who you are. Authorisation is deciding what you may do afterwards.\n\n• Why the others are wrong: nothing here decides file access, shares a login across services, or proves the user cannot deny an action.\n\nSo the answer is: multi-factor authentication.",
    },
    {
      type: "mcq",
      prompt:
        "Attackers on many machines flood a server with half-open connection requests so that real users cannot connect. Which attack is this and which CIA property does it harm?",
      options: [
        "A man-in-the-middle attack, harming confidentiality because traffic is read while in transit",
        "A DNS spoofing attack, harming integrity because names resolve to the wrong address",
        "A distributed SYN flood, harming availability because real users cannot get connected",
        "A brute-force attack, harming confidentiality because passwords are guessed one at a time",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine hundreds of people ringing a shop's phone and hanging up, so real customers only hear a busy tone.\n\n• SYN flood: the attacker starts many TCP handshakes and never finishes them, so the server's connection slots are used up.\n\n• Many attacking machines make it a distributed denial of service, DDoS.\n\n• Harm: availability, because authorised users cannot get access.\n\n• Why the others are wrong: they describe reading traffic, redirecting names, or guessing passwords.\n\nSo the answer is: a distributed SYN flood, harming availability.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false: static analysis can flag a risky pattern in a piece of code that no test has ever run, because it reads the code without executing it.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "A proofreader can spot a typo on a page nobody has read aloud yet, because they read the words rather than performing the play.\n\n• Static analysis inspects source code or compiled files without executing them, so it covers code paths that tests never reach.\n\n• Dynamic analysis only sees what actually runs.\n\nSo the answer is: true.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false: a dangling pointer is one that points to memory that has been allocated and is still in use.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "A sticky note pointing to a flat that you still rent is a perfectly good note. It only becomes a problem after the flat is handed back.\n\n• A pointer to live memory is a normal, valid pointer.\n\n• Dangling pointer: it points at memory that has already been freed, so using it is undefined behaviour and a use-after-free risk.\n\nSo the answer is: false.",
    },
    {
      type: "mcq",
      prompt:
        "A budget-limited company asks whether it must buy a separate IDS if it already has an IPS. Which answer is best?",
      options: [
        "No separate IDS is needed for detection, because an IPS must detect an attack before it can block it",
        "Yes, because an IPS only blocks traffic and has no way to tell which traffic is malicious",
        "Yes, because an IPS sits on the monitoring path and cannot act on traffic as it flows past",
        "No, because an IDS is only useful for host machines and an IPS is only useful for networks",
      ],
      correctIndex: 0,
      modelAnswer:
        "A guard who can stop intruders must first be able to spot them. You do not need a second person just to watch.\n\n• IPS: inline, and follows inspect, decide, act. Detection is part of its job, so it is treated as including IDS-style detection.\n\n• The lecturer's point: how can you protect before detecting?\n\n• Why the others are wrong: an IPS can tell malicious traffic apart, it sits inline rather than on a monitoring path, and both HIDS and NIDS forms exist.\n\nSo the answer is: no separate IDS is needed for detection, since an IPS already detects before it blocks.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about software and system security.",
      options: [
        "The later a defect is found, the more design, data and operations may depend on it, so it costs more to fix",
        "HTTPS protecting data in transit also stops SQL injection in the application behind it",
        "A vulnerability can be introduced or removed at any stage of the software lifecycle",
        "Software security and system security complement each other, because neither replaces the other",
        "An operating system is not software, so software security never applies to it",
      ],
      correctIndices: [0, 2, 3],
      modelAnswer:
        "Fixing a crooked house frame is cheap on the drawing board and very costly once the walls, wiring and people are in.\n\n• Early is cheaper: the later a defect is discovered, the more may already depend on it.\n\n• Any stage: vulnerabilities can be introduced or removed at every lifecycle stage, and unhandled edge cases found late are an example.\n\n• Both scopes: software security reduces weaknesses before deployment, system security detects and responds after.\n\n• Why HTTPS is wrong: it protects the connection, while injection abuses the application's own query building.\n\n• Why the OS option is wrong: the operating system is system software, though this week focuses on application software.\n\nSo the answer is: the early-is-cheaper, any-stage and complementary statements are true.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about error messages and input handling.",
      options: [
        "A detailed error that reveals variable names and allowed ranges gives an attacker material to plan the next step",
        "Removing quote characters from input is a fragile way to stop SQL injection when used alone",
        "Returning a bland access-blocked message is safer than showing a detailed technical error",
        "Turning on verbose error output is helpful because real users can then fix their own input",
        "Parameterised queries are only needed on forms that display results back to the user",
      ],
      correctIndices: [0, 1, 2],
      modelAnswer:
        "A lock that says exactly which pin is wrong is helping the lock-picker. A lock that just stays shut gives nothing away.\n\n• Verbose errors: they leak structure, and the attacker provokes more errors to learn more. Do not be an information provider.\n\n• Fragile sanitising: if one always-true trick is blocked, attackers try hundreds of others, so stripping characters alone is weak.\n\n• Bland message: safer than a technical error.\n\n• Why the last two are wrong: verbose output helps attackers more than users, and parameterised queries matter wherever input reaches a query, whether or not results are shown.\n\nSo the answer is: the detailed-error, fragile-stripping and bland-message statements are true.",
    },
  ],
};

export const WEEK_8_PAPERS: ExamPaperSeed[] = [LECTURE_PAPER];
