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

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 8,
  paperNumber: 2,
  title: "Week 8 Tutorial: Password Storage, SQL Injection, IDS/IPS and Common Vulnerabilities",
  topics:
    "Week 8 tutorial (Ed Lessons — Securing Software and Running Systems). Modern password storage as a which-component-does-what exercise: the backend/application server generates the per-user salt and runs the password hashing function (PHF, e.g. Argon2id/bcrypt/scrypt/PBKDF2), the database stores username+salt+password_hash+parameters but never the plaintext, an optional pepper is kept outside the password database in a secret manager/KMS/HSM; the registration and login flows step by step; why a stolen database plus a live-page lockout still allows offline guessing. SQL injection tutorial example: the alice' OR '1'='1' -- - bypass, why the `-- -` comment matters, parameterised/prepared queries sending data separately from SQL syntax, why input validation (e.g. a username regex) is not a substitute. XSS reframed as a which-component-does-what bug (server stores/reflects content, browser interprets it, missing output encoding for context is the flaw). IDS or IPS decision table: five failed logins, 10,000 login attempts from one IP, a known malware signature, and unusual outbound data at 3am, each needing an IDS-alert vs IPS-block call with a reason; why a poorly tuned IPS causes operational problems. Other common vulnerability categories: broken access control, IDOR, CSRF, SSRF, command injection, RCE, path traversal, unsafe file upload, insecure deserialisation, vulnerable third-party components, security misconfiguration, sensitive data exposure, broken session management, race conditions, missing logging and monitoring.",
  sourceFiles: [
    "Ed Lessons — INFO5995 Week 08 Tutorial: Securing Software and Running Systems (slides 817524/781149/781150/781151/781152/791058/781153)",
  ],
  questions: [
    // ---------- Round 1: modern password storage (0-9) ----------
    {
      type: "mcq",
      prompt:
        "A website handles its own logins. During registration, which component should normally generate the per-user salt and compute the password hash?",
      options: [
        "The database, after storing the plaintext password",
        "The browser, then the server stores only the user's typed password",
        "The DNS server, before the browser connects to the website",
        "The application server, before storing the password record",
      ],
      correctIndex: 3,
      modelAnswer:
        "Picture a nightclub where the bouncer, not the guests and not the cloakroom, is the one who stamps each visitor's hand with a unique pattern. The stamping has to happen at one trusted checkpoint, not wherever is convenient.\n\n• The trusted checkpoint: the backend application server, or a trusted authentication service it calls, is the one place that should turn a typed password into something safe to store.\n\n• Why not the browser: the browser is on the user's own machine, outside your control, so trusting it to hash the password means trusting an attacker's machine too if that machine is compromised.\n\n• Why not the database: a database stores records, it does not run application logic like a hashing function.\n\n• Why not DNS: DNS only turns a website name into an address, it never touches passwords at all.\n\nSo the answer is: the application server or trusted authentication service generates the salt and computes the hash, before anything is stored.",
    },
    {
      type: "mcq",
      prompt:
        "Which set of values should normally be stored in the password database for a user account?",
      options: [
        "Username, plaintext password, and pepper",
        "Username, password, private TLS key, and session cookies",
        "Username, salt, password-hash output, and hashing parameters",
        "Username only, because salts must never be stored",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a locked diary where you write down the recipe you used to bake a cake, and a sample slice, but never the actual recipe card someone could steal and reuse elsewhere.\n\n• What is stored: the username, that user's random salt, the output of the hashing function (the password hash), and which hashing function and settings were used (the parameters), so the same check can be repeated at login.\n\n• What is never stored: the plaintext password. If you can read it back out, so can an attacker who steals the database.\n\n• Why not a private TLS key or session cookies: those belong to a completely different part of the system, encrypting the connection and tracking a logged-in session, not to how a password is checked.\n\n• Why salts must be stored: a salt only works if the server can look it up again next time the user logs in, so it has to sit right next to the hash, out in the open.\n\nSo the answer is: username, salt, password-hash output, and the hashing parameters.",
    },
    {
      type: "mcq",
      prompt: "What is the main purpose of a random per-user salt in password storage?",
      options: [
        "It encrypts the password so the server can decrypt it during login",
        "It replaces the need for a password hashing function",
        "It makes the same password produce different stored hashes for different users",
        "It must stay secret or the password immediately becomes plaintext",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine two students who both pick the password sunshine123. If the teacher stamps each answer sheet with a different random watermark before marking it, the two sheets end up looking nothing alike, even though the underlying answer was the same.\n\n• Without a salt: two users with the same password get the exact same stored hash, and an attacker with a precomputed table of common password hashes can crack both accounts in one lookup.\n\n• With a salt: it gets mixed in before hashing, so identical passwords produce completely different stored hashes, which defeats precomputed lookup tables and forces the attacker to guess each account separately.\n\n• Why the other options are wrong: hashing is one-way, so nothing is ever decrypted back to the password, a salt does not replace the hashing function, and unlike a pepper, a salt is fine to store openly because its whole job is done once it is mixed in.\n\nSo the answer is: it makes the same password produce a different stored hash for every user.",
    },
    {
      type: "mcq",
      prompt: "If a pepper is used alongside password hashing, where should it be stored?",
      options: [
        "In the same database table as every user's salt",
        "In the user's browser so the user can prove identity",
        "Separately from the password database, such as in a secret manager",
        "In the public source code repository for reproducibility",
      ],
      correctIndex: 2,
      modelAnswer:
        "A pepper is like the one master ingredient a bakery keeps locked in the manager's office, while every other ingredient sits out on the open shelf for any baker to use.\n\n• Why separate: a pepper is a single high-value secret shared across accounts, so if it sat in the same table as the salts, stealing the database would hand the attacker everything they need.\n\n• Where it belongs: a secret manager, a key-management service, an HSM-backed service, or protected environment configuration that is not part of the password database backup.\n\n• Why not the browser: the pepper must never leave the trusted backend, the same reasoning that keeps password hashing off the browser applies here too.\n\n• Why not a public repository: publishing it defeats the entire point of keeping it secret.\n\nSo the answer is: separately from the password database, such as in a secret manager.",
    },
    {
      type: "mcq",
      prompt:
        "A company's password database is stolen, but its live login page locks an account out after five failed attempts. Which statement about this is most accurate?",
      options: [
        "Account lockout stops all offline guessing because the attacker must use the login page",
        "Account lockout decrypts the stored hashes after five failed attempts",
        "Account lockout means salts and password hashing are no longer needed",
        "Account lockout does not stop offline guessing against the stolen hashes",
      ],
      correctIndex: 3,
      modelAnswer:
        "A shop's till only lets a cashier try five wrong PIN guesses before it locks. That rule is completely useless once the safe itself has been carried out the back door, because nobody needs the till anymore.\n\n• The key distinction: account lockout only limits guesses made through the live login page. Once the database is stolen, the attacker guesses offline, on their own hardware, with no login page and no lockout in the way.\n\n• What still protects the stolen hashes: the strength of the hashing function and how expensive it is to compute, which is exactly why slow, tunable functions like Argon2id are chosen over fast ones.\n\n• Why the other options are wrong: hashes are not decrypted by anything, lockout is a front-door control, and the theft changes nothing about needing salts and hashing in the first place, if anything it proves why they matter.\n\nSo the answer is: account lockout does not stop offline guessing against the stolen hashes.",
    },
    {
      type: "order",
      prompt: "Put the steps of the registration flow for a self-managed password system in the correct order.",
      steps: [
        "The browser sends the username and password to the backend over HTTPS",
        "The backend generates a fresh random salt for this user",
        "The backend runs the password hashing function on the password, salt, parameters, and optional pepper",
        "The backend stores the username, salt, password-hash output, and hashing parameters in the database",
        "If a pepper is used, it is fetched from a separate secret store and never saved into the password database",
      ],
      modelAnswer:
        "Think of enrolling at a new gym. You hand over your details at the front desk, the desk issues you a unique membership number, that number gets combined with your details to print your card, the file goes into the cabinet, and the one master key to the safe stays with the manager, not filed with your paperwork.\n\n• Step 1: the credentials travel from browser to backend, protected in transit by HTTPS.\n\n• Step 2: a fresh, random salt is generated for this specific user, never reused from someone else.\n\n• Step 3: the hashing function combines the password, that salt, the chosen parameters, and the pepper if one is used.\n\n• Step 4: only the non-secret pieces, username, salt, hash output, and parameters, get written to the database.\n\n• Step 5: the pepper itself is pulled from its own secret store each time, and it is deliberately kept out of the password database.\n\nSo the answer is: send credentials over HTTPS, generate the salt, run the hashing function, store username/salt/hash/parameters, and keep any pepper in a separate secret store.",
    },
    {
      type: "order",
      prompt: "Put the steps of the login flow for a self-managed password system in the correct order.",
      steps: [
        "The browser sends the username and the password attempt to the backend over HTTPS",
        "The backend fetches that user's stored salt, password hash, and hashing parameters from the database",
        "The backend recomputes a candidate hash from the password attempt, salt, parameters, and optional pepper",
        "The backend compares the candidate hash with the stored password hash",
        "Authentication succeeds only if the two hashes match",
      ],
      modelAnswer:
        "It is like checking a wax seal on a returned parcel. You do not reopen and compare the original letter, you press a fresh seal with the same stamp and see whether the new wax pattern matches the one already on file.\n\n• Step 1: the attempt travels from browser to backend over HTTPS, just like at registration.\n\n• Step 2: the backend looks up that specific user's stored salt, hash, and parameters, nothing about the login can proceed without these.\n\n• Step 3: the backend redoes the exact same hashing recipe on the new attempt, using the same salt and parameters so the comparison is fair.\n\n• Step 4: it lines the freshly computed hash up against the one saved back at registration.\n\n• Step 5: only a match lets the user in, since hashing is one-way there is no other way to check.\n\nSo the answer is: send the attempt, fetch the stored salt/hash/parameters, recompute the candidate hash, compare it, and succeed only on a match.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker steals the password database, which holds usernames, salts, hashes and parameters, but the pepper is kept in a separate secret manager the attacker cannot reach. What can the attacker do next?",
      options: [
        "Nothing at all, because without the pepper the stolen hashes are completely useless to them",
        "Recover every plaintext password instantly, since the salt alone is enough to reverse a hash",
        "Try offline guesses through the same hashing function, but each guess is missing the correct pepper so it produces the wrong hash",
        "Log in directly using the stolen hash in place of a password, since the login page accepts hashes as well",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine a recipe card is stolen but one secret ingredient is locked in a safe the thief cannot open. The thief can still bake test batches all day long, they just cannot know it is right until they happen to guess the missing ingredient too.\n\n• What the attacker still has: usernames, salts, hashes and parameters, which is enough to attempt an offline dictionary or brute-force attack, recomputing the hash for each guessed password.\n\n• What blocks them: without the pepper, every one of those guesses is computed with the wrong ingredient, so a guess that matches the real password still will not produce a matching hash, unless they also guess the pepper.\n\n• Why not fully useless: the pepper adds a real extra hurdle, it does not make the stolen data worthless, a weak, common, or reused password can still eventually be found if the pepper itself is somehow guessed or leaked separately.\n\n• Why the last option is wrong: a login page checks a typed password, not a raw hash value, so a stolen hash cannot simply be typed in as if it were the password.\n\nSo the answer is: they can attempt offline guesses, but each one is missing the correct pepper, so a correct password guess still will not produce a matching hash.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about the difference between a salt and a pepper.",
      options: [
        "A salt is unique per user and is stored openly alongside that user's hash",
        "A pepper is typically one secret value shared across many users and kept outside the password database",
        "A salt must be kept just as secret as a pepper, or the whole scheme fails",
        "Both a salt and a pepper are combined into the password before hashing",
        "A pepper is generated fresh for every single login attempt, unlike a salt",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "A salt is like a name tag everyone can see at a conference, unique to each person but not secret. A pepper is like the one shared staff passcode that only the organisers know, and it stays the same across the whole event.\n\n• Salt: unique per user, stored openly right next to the hash, its job is to stop identical passwords from producing identical hashes.\n\n• Pepper: usually one value shared across the whole system, kept secret and stored well away from the password database.\n\n• Why the secrecy option is wrong: a salt does not need to be secret to do its job, that is exactly what makes a pepper different from it.\n\n• Both get combined: the hashing function mixes in the password, the salt, and the pepper if one is used, before producing the stored hash.\n\n• Why the last option is wrong: neither a salt nor a pepper is regenerated per login attempt, they are set once, at registration, and reused every time that same account is checked.\n\nSo the answer is: a salt is unique and stored openly, a pepper is a shared secret kept separately, and both feed into the hashing function.",
    },
    {
      type: "fillblank",
      prompt:
        "A ___ is generated fresh for each user and is stored in plain view next to their password hash, unlike a pepper, which stays secret and is stored separately from the password database.",
      blanks: [["salt"]],
      modelAnswer:
        "One of these two ingredients is a name tag anyone can read, the other is a locked-away shared passcode.\n\n• Salt: unique per user, and openly stored right alongside the hash, since its job does not depend on being secret.\n\n• Pepper: the secret one, deliberately kept apart from the password database.\n\nSo the answer is: salt.",
    },
    // ---------- Round 2: SQL injection (10-14) ----------
    {
      type: "mcq",
      prompt:
        "In the injected login attempt alice' OR '1'='1' -- -, what does the trailing -- - mainly do?",
      options: [
        "It hashes the password before comparison",
        "It tells the browser to block JavaScript",
        "It encrypts the SQL query before it reaches the database",
        "It starts a SQL comment so the remaining password check can be ignored",
      ],
      correctIndex: 3,
      modelAnswer:
        "It is like scribbling out the rest of a sentence on a form with a thick black marker, so whoever reads it afterwards never sees what came next.\n\n• What -- - does: in SQL it marks the start of a comment, so the database engine ignores everything written after it on that line.\n\n• Why it matters here: the original query still has an AND password = '...' check waiting after the username. The comment marker erases that check from the database's point of view, so it never runs.\n\n• Combined with OR '1'='1': the username condition becomes always true, and the password condition never even gets evaluated, so the login can succeed with no correct password at all.\n\n• Why the other options are wrong: nothing here touches hashing, the browser, or encryption, this is purely about how the database engine parses SQL text.\n\nSo the answer is: it starts a SQL comment, so the remaining password check is never evaluated.",
    },
    {
      type: "mcq",
      prompt: "Why do prepared statements or parameterized queries help defend against SQL injection?",
      options: [
        "They send user input as data instead of letting it become SQL syntax",
        "They make the database run over HTTPS",
        "They remove the need for authentication",
        "They store every password in plaintext for easier comparison",
      ],
      correctIndex: 0,
      modelAnswer:
        "A fill-in-the-blank form with fixed printed wording around each blank cannot be rewritten by whatever the visitor scribbles in the blank, no matter how cleverly worded it is.\n\n• The fix: the SQL structure, such as SELECT id FROM users WHERE username = ? AND password = ?, is fixed first, and the actual values are sent to the database separately, as pure data.\n\n• Why that stops injection: even a value like alice' OR '1'='1' -- - is just treated as a literal string to search for in the username column, it can never break out and become part of the SQL command itself.\n\n• Why the other options are wrong: prepared statements are about how a query is built, they have nothing to do with the transport protocol, whether authentication happens, or how passwords are stored.\n\nSo the answer is: they send user input as data, never letting it become part of the SQL syntax.",
    },
    {
      type: "mcq",
      prompt:
        "A login uses a parameterized query SELECT id FROM users WHERE username = ? AND password = ?, with the two typed values sent to the database separately as data. An attacker types alice' OR '1'='1' -- - as the username. What happens?",
      options: [
        "The always-true OR condition still applies, so the login succeeds without a correct password",
        "The database splits the text at the apostrophe and runs the first part as a separate SQL command",
        "The comment marker deletes the users table before the query can run",
        "The database treats the whole typed text as one literal username value to search for, so the lookup fails",
      ],
      correctIndex: 3,
      modelAnswer:
        "Writing a strange sentence full of punctuation on a name tag does not turn the tag into a real instruction, security guards still just read it as a (weird) name and check it against the guest list.\n\n• What changes with parameters: the value alice' OR '1'='1' -- - never gets pasted into the SQL text at all, it travels to the database as a separate piece of data, tagged as the value for the username parameter.\n\n• The result: the database looks for a username that is literally the whole string, apostrophes, OR, dashes and all, and since no such account exists, the lookup simply fails.\n\n• Why the string-joining flaw is now gone: the vulnerable version from the reading built the SQL text by joining strings together, which let the apostrophe close the intended quote early. A parameterized query never joins anything, so there is no quote for the attacker's apostrophe to close.\n\n• Why the other options are wrong: nothing splits the value into separate commands, and no comment marker can delete a table, that danger only existed in the vulnerable string-joining version.\n\nSo the answer is: the database treats the whole attacker string as one literal username, so the login attempt fails.",
    },
    {
      type: "mcq",
      prompt:
        "A tutorial example restricts usernames to the pattern ^[A-Za-z0-9_]{3,32}$, letters, digits and underscores only, 3 to 32 characters. Why is this input validation not a substitute for parameterized queries?",
      options: [
        "Validation rules like this one can be incomplete, and other input fields may need to allow much richer text that a simple pattern cannot safely cover",
        "Regular expressions cannot be run on a web server, so this kind of check is never actually usable in practice",
        "Validation makes the application slower than a parameterized query, so it is worse purely for performance reasons",
        "Parameterized queries and validation do the exact same job, so using both at once is simply redundant",
      ],
      correctIndex: 0,
      modelAnswer:
        "A doorman who only ever checks for exactly one kind of fake ID will still get fooled by a fake he has never seen before. A locked door that nobody without the real key can open at all works regardless of what trick they try.\n\n• Why validation alone is fragile: a pattern like this one only manages the username field, and other fields, like a comment box or a full name, may need to allow apostrophes, spaces or punctuation that a strict pattern would wrongly reject.\n\n• The deeper reason it is not a substitute: SQL safety should not depend on manually blocking every dangerous character across every field, that is an easy list to get wrong or forget to update, whereas a parameterized query removes the danger structurally, no matter what characters arrive.\n\n• Why they are not redundant together: validation is still genuinely useful, catching obviously malformed input early and improving data quality, it just is not the layer that is responsible for stopping injection.\n\n• Why the other two options are wrong: regular expressions run perfectly well on a web server, and this is not fundamentally a performance argument.\n\nSo the answer is: validators can be incomplete and other fields may need richer text, so SQL safety should not depend on manually blocking dangerous characters instead of using parameterized queries.",
    },
    {
      type: "order",
      prompt: "Put the steps of the vulnerable SQL injection flow described in the tutorial into the correct order.",
      steps: [
        "The application reads a username and password from an HTTP form",
        "The application builds a SQL string by joining fixed SQL text with the user's typed input",
        "The attacker enters alice' OR '1'='1' -- - as the username, with any text as the password",
        "The final SQL string becomes one command that the database cannot tell apart from a legitimate query",
        "Because '1'='1' is true and the rest of the line is commented out, the password check may be bypassed",
      ],
      modelAnswer:
        "It is like a form letter assembled by literally gluing strips of paper together, including whatever the sender wrote on their reply slip, then reading the whole glued-together mess aloud as if every word were the office's own wording.\n\n• Step 1: ordinary input arrives from a form, nothing suspicious yet on its own.\n\n• Step 2: the flaw is introduced here, joining fixed SQL text with untrusted input turns that input into part of the command.\n\n• Step 3: the attacker supplies text specifically crafted to exploit that joining.\n\n• Step 4: the database receives a single SQL string and has no way to know which parts were meant as code and which were meant as data.\n\n• Step 5: the always-true condition plus the comment together let the login succeed without a valid password.\n\nSo the answer is: read the form input, join it into the SQL string, the attacker enters the crafted username, the final string becomes one command, and the always-true condition plus the comment bypass the password check.",
    },
    // ---------- Round 3: IDS or IPS decision table (15-19) ----------
    {
      type: "mcq",
      prompt:
        "A monitoring system logs five failed login attempts on one account within a minute, from what looks like the account owner's usual location. Which is the better call: an IDS alert, or an automatic IPS block, and why?",
      options: [
        "An automatic IPS block, because any failed login at all should be treated as a confirmed attack",
        "An IDS alert, because five failed attempts is a weak, low-confidence signal that could just be the real user mistyping their password",
        "An automatic IPS block, because blocking is always safer than alerting no matter how weak the signal is",
        "Neither, because failed logins are too common to ever be worth recording",
      ],
      correctIndex: 1,
      modelAnswer:
        "A parent who calls the police the instant their teenager is five minutes late home will burn out that relationship fast. A parent who quietly starts keeping an eye on the clock does not.\n\n• Why this is a weak signal: five failed logins from what looks like the usual location very often just means the real account owner fumbled their password, which is an everyday, low-stakes event.\n\n• Why alert rather than block: an IDS alert lets a person, or a smarter automated check, look closer before anyone is punished. Automatically locking the account out after a handful of typos would frustrate genuine users far more often than it stops real attackers.\n\n• The general rule this follows: reserve automatic blocking for higher-confidence signals, and use alerting for signals that are common enough to include a lot of innocent explanations.\n\nSo the answer is: an IDS alert, because five failed attempts is a weak signal that is very often just the real user, not a confirmed attacker.",
    },
    {
      type: "mcq",
      prompt:
        "A monitoring system logs 10,000 login attempts against many different accounts, all arriving from a single IP address within a few minutes. Which is the better call: an IDS alert, or an automatic IPS block, and why?",
      options: [
        "An automatic IPS block, because a volume and pattern this extreme is a high-confidence sign of an automated brute-force attack",
        "An IDS alert only, because volume alone is never enough evidence to justify blocking anything automatically",
        "Neither, because the traffic is still valid login traffic and must always be allowed through",
        "An automatic IPS block, purely because 10,000 is a round, easy-to-remember number",
      ],
      correctIndex: 0,
      modelAnswer:
        "One person knocking on the wrong door once is an easy mistake. One person hammering on ten thousand doors in a few minutes is not a person at all, it is a machine, and nobody reasonable needs to double-check that before shutting the door.\n\n• Why this is a high-confidence signal: no real human generates that volume of login attempts, spread across many accounts, from one address, in minutes. It has the unmistakable shape of an automated brute-force or credential-stuffing attack.\n\n• Why block rather than just alert: waiting for a person to review an alert while thousands more guesses keep firing every second gives the attacker a huge head start. Acting inline, immediately, is what actually limits the damage.\n\n• The general rule this follows: extreme, unambiguous patterns like this justify automatic action, unlike the ambiguous five-failed-logins case.\n\nSo the answer is: an automatic IPS block, because the volume and pattern are a high-confidence sign of an automated attack.",
    },
    {
      type: "mcq",
      prompt:
        "A file arriving on the network matches a known malware signature exactly. Which is the better call: an IDS alert, or an automatic IPS block, and why?",
      options: [
        "An IDS alert only, because signature matches are too unreliable to ever act on automatically",
        "An automatic IPS block, because a known-signature match is deterministic and carries very little risk of being a false positive",
        "Neither, because signature-based tools cannot examine files at all, only network traffic patterns",
        "An automatic IPS block, but only after a human has manually confirmed the file byte by byte",
      ],
      correctIndex: 1,
      modelAnswer:
        "A librarian comparing a returned book's barcode against a list of confirmed stolen barcodes either finds an exact match or does not, there is no fuzzy in-between to agonise over.\n\n• Why this is high confidence: a signature match means the file's known fingerprint lines up exactly with a confirmed piece of malware, this is about as close to certain as detection gets.\n\n• Why block automatically: waiting for a human to review something this clear-cut only gives a known-bad file more time to do damage, for a genuinely low risk of wrongly blocking something legitimate.\n\n• Contrast with anomaly-based detection: an anomaly flag (like unusual traffic) is a judgement call about what looks abnormal, and deserves more caution, a signature match is a direct comparison against something already confirmed malicious.\n\n• Why the other options are wrong: signature-based tools very much can inspect files, not just traffic patterns, and waiting for manual byte-by-byte review defeats the point of fast, automated protection for a clear match.\n\nSo the answer is: an automatic IPS block, because a signature match is deterministic and carries very little false-positive risk.",
    },
    {
      type: "mcq",
      prompt:
        "A server sends an unusually large amount of outbound data at 3 a.m., a time when it normally sits idle. Which is the better call: an IDS alert, or an automatic IPS block, and why?",
      options: [
        "An automatic IPS block, because any activity outside business hours must always be treated as an attack",
        "An IDS alert, because this anomaly-based signal could be a genuine backup job and deserves review before anything is cut off",
        "Neither, because outbound traffic can never be a sign of a security problem, only inbound traffic can",
        "An automatic IPS block, because outbound data always means credentials have already been stolen",
      ],
      correctIndex: 1,
      modelAnswer:
        "A house with its lights on at 3 a.m. might mean a burglar, or it might just mean someone is up doing laundry before an early flight. Either is plausible, so a neighbour would peek before calling anyone.\n\n• Why this is an anomaly, not a certainty: unusual timing and volume compared to a normal baseline is exactly what anomaly-based detection is built to flag, but by its nature it can also be triggered by something completely legitimate, like a scheduled backup or a batch export job.\n\n• Why alert rather than block: automatically cutting off outbound traffic the moment it looks unusual risks breaking a real, scheduled business process, at 3 a.m. specifically because that is when such jobs are often deliberately scheduled, when load is low.\n\n• Contrast with the malware-signature case: that was a deterministic match against something already confirmed bad, this is a statistical judgement about what looks abnormal, which deserves human or further automated review before anyone acts.\n\nSo the answer is: an IDS alert, because this anomaly-based signal could easily be a genuine scheduled job and needs review before anything is blocked.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about why a poorly tuned IPS can cause operational problems.",
      options: [
        "Rules set too aggressively can block legitimate traffic, such as real users or scheduled jobs, causing a self-inflicted outage",
        "Because an IPS sits inline, a bad rule takes effect immediately, unlike an IDS alert that a person can review first",
        "If the device is configured fail-closed, a bug or crash in the IPS itself can stop all traffic, not just malicious traffic",
        "A poorly tuned IPS can never cause any operational harm, because blocking more traffic is always the safer choice",
        "Frequent false positives can push a team to loosen or disable rules out of frustration, weakening protection right when it is most needed",
      ],
      correctIndices: [0, 1, 2, 4],
      modelAnswer:
        "A smoke alarm that goes off every time someone makes toast eventually gets its battery pulled out, right before the day there is a real fire.\n\n• Blocking legitimate traffic: an over-aggressive rule cannot tell a real user or a scheduled job apart from an attacker, so it can lock out the very people and processes the system exists to serve.\n\n• Inline means instant: unlike an IDS, which only raises an alert for a person to weigh up, an IPS acts immediately, so a badly tuned rule causes harm the moment it fires, with no human in the loop to catch it first.\n\n• Fail-closed risk: if the device is set to stop all traffic when it breaks, a crash or bug in the IPS itself becomes an outage for everyone, not just for attackers.\n\n• The frustration spiral: constant false alarms push overworked teams to loosen rules or turn protections off altogether, which quietly removes the defence exactly when it is needed most.\n\n• Why the always-safer option is wrong: blocking too much has a real cost, in the two team-tuned examples above it was better to alert first rather than block automatically, so more blocking is not automatically safer.\n\nSo the answer is: blocking legitimate traffic, acting instantly with no human review, fail-closed outages, and the alert-fatigue spiral are all real operational risks of a poorly tuned IPS.",
    },
    // ---------- Round 4: other common vulnerabilities (20-23) ----------
    {
      type: "match",
      prompt: "Match each vulnerability category to what it actually means.",
      pairs: [
        {
          left: "Broken access control",
          right: "Users can reach data or actions they should never have been allowed to access",
        },
        {
          left: "IDOR (insecure direct object reference)",
          right: "The app trusts an object ID like user_id=123 in a request without checking the current user may access it",
        },
        {
          left: "CSRF (cross-site request forgery)",
          right: "A victim's browser is tricked into sending an authenticated request the victim never intended",
        },
        {
          left: "Race condition",
          right: "The attacker exploits a timing gap between when something is checked and when it is acted on",
        },
        {
          left: "Command injection",
          right: "Attacker-supplied input becomes part of an operating-system command that then gets executed",
        },
        {
          left: "RCE (remote code execution)",
          right: "An attacker can run their own code on the target system from another machine",
        },
      ],
      decoys: ["A tool inspects source code for risky patterns without ever running the program"],
      modelAnswer:
        "Six different ways a building's security can fail: the guest list is wrong, the room-number badge is not checked against who is holding it, a visitor is tricked into signing something on someone else's behalf, someone slips through during a shift change, a note gets treated as a staff order, and eventually an outsider is running the building's own systems remotely.\n\n• Broken access control is the umbrella problem, someone reaches something they should not.\n\n• IDOR is one specific, common way that happens, trusting a raw ID number in a request.\n\n• CSRF abuses the victim's own already-logged-in browser to fire off a request they never chose to make.\n\n• A race condition abuses the gap between checking a condition and acting on it, before the system has caught up.\n\n• Command injection smuggles attacker text into an operating-system command, the OS-level cousin of SQL injection.\n\n• RCE is the outcome, actually running attacker-chosen code on the target, which command injection is one common route into.\n\n• The decoy describes static analysis, a testing technique, not a vulnerability category at all.\n\nSo the answer is: broken access control is the general failure, IDOR is a specific ID-trusting version of it, CSRF hijacks a victim's browser, a race condition exploits a timing gap, command injection smuggles OS commands, and RCE is running code remotely.",
    },
    {
      type: "sort",
      prompt:
        "Sort each vulnerability category into whether it is mainly about the server trusting untrustworthy input, or mainly about a gap in setup, dependencies or day-to-day operations.",
      groups: ["Exploits the server trusting untrusted input", "A gap in setup, dependencies or operations"],
      items: [
        { text: "SSRF: attacker input makes the server send a request to an internal or external system", group: 0 },
        { text: "Path traversal: input such as ../ lets an attacker reach files outside the intended directory", group: 0 },
        { text: "Insecure deserialisation: untrusted serialised data is parsed in a way that can change program state", group: 0 },
        { text: "Unsafe file upload: an uploaded file can be executed, overwrite important files, or store malicious content", group: 0 },
        { text: "Security misconfiguration: unsafe defaults, exposed admin panels, or public storage buckets", group: 1 },
        { text: "Vulnerable third-party components: libraries, frameworks, plugins or containers with known flaws", group: 1 },
        { text: "Missing logging and monitoring: attacks happen but are not recorded, detected or investigated in time", group: 1 },
        { text: "Broken session management: session IDs, cookies, logout or token rotation are handled incorrectly", group: 1 },
      ],
      modelAnswer:
        "Imagine a building again. Some break-ins happen because a specific door was tricked into opening for a forged note. Others happen because nobody ever locked the side gate, patched the rusted hinge, checked the cameras, or made sure old keys stop working after someone leaves.\n\n• Exploits untrusted input: SSRF, path traversal, insecure deserialisation and unsafe file upload all share one shape, a specific piece of attacker-supplied input is fed to the server, and the server acts on it as if it were trustworthy, fetching a URL, opening a path, rebuilding an object, or running a file.\n\n• Setup, dependency or operational gap: security misconfiguration, vulnerable third-party components, missing logging and monitoring, and broken session management are not about one clever malicious input at all, they are standing weaknesses in how the system is configured, kept up to date, watched, or how it manages who stays logged in.\n\n• Why the distinction matters: input-trust problems are usually fixed by validating and safely handling that specific kind of input, operational gaps are usually fixed by process, configuration review, patching, and better monitoring, quite different kinds of fixes for quite different kinds of failures.\n\nSo the answer is: SSRF, path traversal, insecure deserialisation and unsafe file upload exploit trusted input, while misconfiguration, vulnerable components, missing logging and broken session management are operational gaps.",
    },
    {
      type: "multi",
      prompt: "Select all true statements about remote code execution (RCE).",
      options: [
        "RCE means an attacker can run their own code on the target system from another machine",
        "Command injection, unsafe deserialisation, template injection, or a vulnerable component can each lead to RCE",
        "RCE is itself a specific root-cause bug, separate from and unrelated to every other vulnerability category",
        "Once RCE is achieved, an attacker typically has far more control than a single leaked record or blocked login attempt would give them",
        "RCE can only ever happen through a web browser, never through a server-side application",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "RCE is less like one specific lock being picked and more like the outcome of several very different locks all failing, a stolen master key, a forged pass, or a propped-open fire door, they are different routes that all end with the intruder standing inside the building with free run of it.\n\n• The definition: an attacker running their own chosen code on a machine they do not own, from somewhere else entirely.\n\n• Many roads lead there: command injection, insecure deserialisation, template injection, and a vulnerable third-party component are all listed as paths that can end in RCE, it is an outcome, not one single cause.\n\n• Why the unrelated option is wrong: exactly because it can be reached through so many different underlying bugs, RCE is not a separate, disconnected category, it is often the worst-case destination those other categories can lead to.\n\n• Why it is so serious: compare it to a single leaked record or one blocked login, RCE typically hands the attacker the same level of control a legitimate administrator would have, which is about as bad as it gets.\n\n• Why the browser-only option is wrong: RCE very often targets server-side applications directly, a browser is not required at all.\n\nSo the answer is: RCE means running attacker code remotely, several different bugs can lead to it, and it typically grants far more control than a single leaked record.",
    },
    // ---------- Round 5: XSS as a components problem (24-25) ----------
    {
      type: "mcq",
      prompt:
        "The tutorial frames XSS as also being about which component does what. Following that framing, which two components are involved, and where does the actual flaw sit?",
      options: [
        "The database and the network, and the flaw is a missing firewall rule between them",
        "The server, which stores or reflects content, and the browser, which runs it; the flaw is missing output encoding",
        "The operating system and the hard disk, and the flaw is a missing file permission setting",
        "The DNS server and the certificate authority, and the flaw is an expired TLS certificate",
      ],
      correctIndex: 1,
      modelAnswer:
        "It is the same shape as the password-storage exercise, but with different components: one side handles some content, another side later trusts and acts on it, and the bug is a missing safety step in between.\n\n• The server's job: it stores content a user typed, like a comment, or reflects content straight back, like part of a search query.\n\n• The browser's job: it later reads that content and, because it trusts the site it came from, may interpret it as real HTML or JavaScript instead of as plain text.\n\n• Where the bug actually lives: not in the browser and not really in the database either, it is in the server placing that data into the page without the output encoding or sanitisation appropriate for where it lands.\n\n• Why the other options are wrong: none of them are the components the tutorial is actually describing, XSS has nothing to do with firewalls, file permissions, or certificates.\n\nSo the answer is: the server stores or reflects the content, the browser interprets it, and the flaw is missing output encoding or sanitisation for that context.",
    },
    {
      type: "mcq",
      prompt:
        "Using the which-component-does-what framing from this tutorial, what is the clearest way to tell SQL injection and XSS apart?",
      options: [
        "SQL injection tricks the database into trusting attacker text as SQL commands, while XSS tricks a browser into trusting it as HTML or JavaScript",
        "SQL injection and XSS are two different names for exactly the same underlying bug, just found in different products",
        "SQL injection only ever affects the browser, while XSS only ever affects the database server",
        "SQL injection requires no user input at all, while XSS can only happen if the database has been compromised first",
      ],
      correctIndex: 0,
      modelAnswer:
        "One is a clerk who reads a forged instruction and acts on it as if the office wrote it. The other is a visitor who reads a forged notice pinned to a trusted cafe's board and obeys it as if the cafe itself put it there.\n\n• SQL injection's target: the database, via the application, attacker text ends up read and executed as part of a SQL command.\n\n• XSS's target: the end user's own browser, attacker text ends up read and executed as HTML or JavaScript, because the browser trusts the site serving it.\n\n• Why this framing helps: both bugs share the same underlying shape, untrusted input crossing into a place that will interpret it as instructions instead of as plain data, but they hit completely different components, which is exactly why the fix for one, prepared statements, does nothing at all to stop the other, which needs output encoding instead.\n\n• Why the other options are wrong: they are not the same bug, each one clearly does involve a specific component the other option denies, and neither requires the scenario described.\n\nSo the answer is: SQL injection tricks the database into treating attacker text as SQL, while XSS tricks the browser into treating attacker text as HTML or JavaScript.",
    },
  ],
};

export const WEEK_8_PAPERS: ExamPaperSeed[] = [LECTURE_PAPER, TUTORIAL_PAPER];
