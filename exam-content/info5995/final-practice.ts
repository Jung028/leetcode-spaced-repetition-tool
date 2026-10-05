import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 8,
  paperNumber: 3,
  title: "Final Exam Revision Practice (Weeks 1–8, Mixed MCQ)",
  topics:
    "A cumulative mixed-review MCQ paper spanning all eight authored weeks, sourced from the official INFO5995 Exam Revision Question Bank's 'Mixed MCQ Practice - Weeks 1-8' section. Draws on: Week 1 (system/threat models, attack surface, explicit attacker assumptions); Week 2 (AI-assisted vulnerability discovery — hallucinated findings, least-privilege tool access, human-in-the-loop verification); Week 3 (mobile security — exported Android components, embedded secrets, deep links); Week 4 (cryptography basics — confidentiality vs other properties, one-time pads, ECB weaknesses); Week 5 (MACs vs unkeyed hashes, digital signatures, replay attacks, keystream reuse); Week 6 (applied cryptography and authentication — least privilege, MFA fatigue, TLS trust, password storage); Week 7 (network security — DDoS vs CIA, certificate validation, SQL injection); and Week 8 (software and system security — XSS, IDS false positives/negatives, detector tuning trade-offs). Every question and its correct answer is taken directly from the source document's own MCQ Answer Guide; option order has been shuffled from the source to remove positional bias while keeping the correct answer's content unchanged.",
  sourceFiles: [
    "INFO5995_Exam_Revision_Question_Bank_Weeks_1-8_with_MCQs_ANSWERED.pdf (official exam revision pack — 'Mixed MCQ Practice - Weeks 1-8' section, Q1-30, plus its MCQ Answer Guide)",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "A service that used to be reachable only from one internal network is changed so it can now be reached from more networks and more kinds of devices. What is the most direct security implication of this change?",
      options: [
        "Every new connection path automatically acts as an independent security control",
        "Confidentiality automatically improves, because a broader range of people can now reach the service",
        "The attack surface may increase, because more paths into the service are now reachable",
        "Threat modelling is no longer needed once the service has already been deployed",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a house that used to have one front door and now has a front door, a side door, a garage door and three windows that all open. Nothing about the furniture inside changed, but there are suddenly a lot more ways in.\n\n• The attack surface is simply the full set of places an attacker could try to get in. Adding networks and device types adds entry points, even if the code itself didn't change.\n\n• Why the others are wrong: more reachability never improves confidentiality on its own, a bigger attack surface makes threat modelling more necessary rather than optional, and a new connection path is just a path — it isn't a control unless something is actively checking it.\n\nSo the answer is: the attack surface may increase, because more paths into the service are now reachable.",
    },
    {
      type: "mcq",
      prompt:
        "When you write down a threat model, why is it useful to state your assumptions explicitly — for example, exactly what the attacker can and can't do, and exactly what you're trying to protect?",
      options: [
        "They prove that every security claim holds true in every possible environment forever",
        "They remove the need for any monitoring once the system has been deployed",
        "They guarantee that vulnerabilities cannot exist anywhere in the system",
        "They make the attacker's capabilities and the system's security goals clear enough to evaluate",
      ],
      correctIndex: 3,
      modelAnswer:
        "Saying \"this lock is secure\" means nothing on its own — secure against a toddler, a burglar with a crowbar, or a government lockpicking expert? The claim only makes sense once you say who you're defending against.\n\n• A security claim is only ever true relative to its stated assumptions: who the attacker is, what they can do, and what you're trying to achieve. Writing those down is what lets someone else actually check your claim.\n\n• Why the others are wrong: no document can guarantee the absence of vulnerabilities or hold for every environment forever, and clear assumptions make monitoring more targeted, not unnecessary.\n\nSo the answer is: explicit assumptions make attacker capabilities and security goals clear enough to evaluate.",
    },
    {
      type: "mcq",
      prompt:
        "An AI coding assistant tells you it found a vulnerability, but it can't point to the actual file and line, and it can't show you a request that actually reproduces the problem. What should you do with that report?",
      options: [
        "Publish it right away as a confirmed critical vulnerability",
        "Accept it as true, because the AI stated it with high confidence",
        "Reject every AI-assisted finding automatically, without even looking into it",
        "Treat it as a hypothesis and verify it against the real code and a controlled test",
      ],
      correctIndex: 3,
      modelAnswer:
        "An AI model's confident tone is like a very persuasive witness who wasn't actually at the scene — sounding sure of yourself isn't the same as being right.\n\n• High confidence from an AI model is just part of the text it generated; it isn't a measurement of whether the claim is actually true, so unverified AI output should be treated as a hypothesis, not a fact.\n\n• The right next step is to trace the claim in the real source code and try to reproduce it in a controlled environment — if it holds up, you now have real evidence instead of a guess.\n\n• Why the others are wrong: blind acceptance and immediate publishing both skip verification entirely, and blanket rejection of all AI findings throws away genuinely useful leads along with the bad ones.\n\nSo the answer is: verify the finding against real code and controlled testing before trusting it.",
    },
    {
      type: "mcq",
      prompt:
        "You're deciding how much freedom to give an AI coding agent that has terminal access while it works on a security review. Which single control best limits the damage it could cause?",
      options: [
        "Giving it administrator access to every system so it never gets blocked",
        "Turning off logging for the commands it generates so review goes faster",
        "Letting it automatically execute every action it suggests without a pause",
        "Least-privilege tool permissions combined with a human review step before risky actions",
      ],
      correctIndex: 3,
      modelAnswer:
        "It's the difference between handing a new intern the master key to the building versus giving them a key to just their own desk, plus asking them to check with you before touching anything unusual.\n\n• Least privilege means the agent can only reach what the task actually needs, and a human review step adds a checkpoint before anything destructive or irreversible actually runs.\n\n• Together, those two limit both how far a mistake or a manipulated instruction (like a hidden prompt injection) can reach, and whether it ever executes at all.\n\n• Why the others are wrong: admin access maximises the blast radius of any mistake, disabled logging removes the evidence needed to catch problems, and auto-executing every suggestion removes the one checkpoint that could have stopped a bad action.\n\nSo the answer is: least-privilege tool permissions with human review before risky actions.",
    },
    {
      type: "mcq",
      prompt:
        "A developer marks an Android app component as \"exported\" in the manifest, even though nothing in the app's own interface links to it. Why can this still create a security risk?",
      options: [
        "Android automatically encrypts every piece of data carried inside an intent",
        "Exported components are physically incapable of receiving any external input",
        "The component becomes completely invisible to the Android operating system",
        "External apps may be able to start that component directly, crossing a trust boundary",
      ],
      correctIndex: 3,
      modelAnswer:
        "Leaving a side door unlocked but not mentioning it in the brochure doesn't make it secure — anyone who already knows side doors exist can just walk up and try the handle.\n\n• \"Exported\" means any other app on the device (or a tester with debugging tools) can launch that component directly with a crafted intent, completely bypassing the app's normal user interface.\n\n• Not linking to it from the UI only hides it from casual users — it's security by obscurity, not an actual access control, and the intent data arriving from outside is fully attacker-controlled.\n\n• Why the others are wrong: exported components absolutely can receive external input (that's the whole risk), Android doesn't auto-encrypt intent contents, and the component is still fully visible and callable by the OS and other apps.\n\nSo the answer is: external applications may be able to invoke it directly, crossing a trust boundary.",
    },
    {
      type: "mcq",
      prompt:
        "A mobile team argues it's fine to bake a long-lived backend API key into the app's resource files, since users never see it on screen. Why is this actually unsafe?",
      options: [
        "Because the app sandbox automatically publishes any secret embedded in the app",
        "Because Android silently converts every embedded secret into a signed certificate",
        "Because the APK can be unpacked and inspected, so the embedded secret may be recovered",
        "Because APK files are technically incapable of making any outbound network connections",
      ],
      correctIndex: 2,
      modelAnswer:
        "Writing your house alarm code on a sticky note and taping it inside a drawer doesn't make it secret just because visitors don't open that drawer — anyone who actually looks will find it.\n\n• An APK is just an archive file distributed to every single user, and tools like decompilers can unpack it and read the resources and code inside, including a key stored in a file.\n\n• \"Not shown on screen\" isn't the same as secret: the device itself is under the attacker's control once installed, so anything shipped inside the app has to be treated as effectively public.\n\n• Why the others are wrong: nothing about an APK blocks network access, Android has no feature that turns embedded secrets into certificates, and the app sandbox protects the app's private runtime data — it does nothing to protect strings baked into the installed package itself.\n\nSo the answer is: the APK can be unpacked and inspected, so the embedded secret may be recovered.",
    },
    {
      type: "mcq",
      prompt:
        "Out of the core security properties a system can offer, which one does encryption most directly and primarily provide?",
      options: [
        "Patch management, so known software flaws get fixed on a schedule",
        "Confidentiality, so only someone holding the correct key can read the data",
        "Non-repudiation, so a sender can never later deny having sent a message",
        "Availability, keeping the system reachable whenever a legitimate user needs it",
      ],
      correctIndex: 1,
      modelAnswer:
        "Putting a letter inside a sealed envelope stops a stranger from reading it as it travels — it doesn't make the postal service faster, and it doesn't stop the sender from later denying they wrote it.\n\n• Encryption turns readable data into ciphertext that only someone with the correct key can turn back into plaintext, which is exactly the definition of confidentiality.\n\n• Why the others are wrong: encryption says nothing about whether the service stays online (availability), it doesn't by itself stop a sender denying authorship (non-repudiation needs signatures), and it has nothing to do with scheduling software fixes.\n\nSo the answer is: encryption primarily provides confidentiality.",
    },
    {
      type: "mcq",
      prompt:
        "A team wants to use a one-time pad to encrypt data because, done correctly, it offers perfect secrecy. Why is a one-time pad usually impractical to actually use in real systems?",
      options: [
        "Because a one-time pad is mathematically incapable of ever decrypting correctly",
        "Because every single bit of a one-time pad message needs its own public-key signature",
        "Because it needs a truly random key as long as the message, shared securely in advance, and used only once",
        "Because a one-time pad provides no confidentiality at all once it's correctly applied",
      ],
      correctIndex: 2,
      modelAnswer:
        "It's like promising perfect secrecy for a letter, but only if you first securely hand-deliver a second letter just as long as the first, in person, every single time — the \"secure delivery\" problem never actually goes away.\n\n• A one-time pad only gives its famous perfect-secrecy guarantee if the key is truly random, at least as long as the message, shared securely before use, and never reused for anything else.\n\n• That key-generation-and-distribution problem is exactly as hard as securely sending the original message, so for anything beyond tiny, rare messages it becomes operationally unworkable.\n\n• Why the others are wrong: a correctly used one-time pad decrypts perfectly and does provide confidentiality, and it uses a shared secret key, not public-key signatures per bit.\n\nSo the answer is: it requires a random, message-length key that's securely shared in advance and used only once.",
    },
    {
      type: "mcq",
      prompt:
        "What is the key difference between a MAC (Message Authentication Code, such as HMAC) and an unkeyed hash function like plain SHA-256?",
      options: [
        "A MAC is computed using secret key material, which is what gives it authentication and integrity",
        "A MAC is guaranteed to always provide confidentiality for the message it protects",
        "A MAC is computed using no secret information at all, exactly like an unkeyed hash",
        "A MAC is always built using public-key digital signatures rather than a shared key",
      ],
      correctIndex: 0,
      modelAnswer:
        "Anyone can press a stamp into wax — but only someone holding your actual signet ring can press your personal seal. A plain hash is a generic stamp; a MAC is the personalised seal that needs the secret ring.\n\n• A MAC is computed with a secret key, so only someone who holds that key can produce a valid tag for a given message — that's exactly what gives it authentication (proof of who made it) and integrity (proof it wasn't changed).\n\n• An unkeyed hash uses no secret at all, so anyone, including an attacker, can recompute it for any data they want — it can only show the data is self-consistent, not where it came from.\n\n• Why the others are wrong: a MAC doesn't hide the message's content (that's encryption's job, not a MAC's), and a MAC uses a shared secret key, not a public/private signature pair.\n\nSo the answer is: a MAC uses secret key material, which is what gives it authentication and integrity.",
    },
    {
      type: "mcq",
      prompt:
        "A client downloads a software update, checks its digital signature, and the signature verifies correctly. What does that successful check most directly support?",
      options: [
        "That the software is guaranteed to contain no bugs or flaws",
        "That the server hosting the download will always stay available",
        "That the update's contents are kept confidential from every user",
        "That the update came from the expected signer and wasn't modified after signing",
      ],
      correctIndex: 3,
      modelAnswer:
        "A wax seal on an old letter doesn't prove the letter's contents are wise or correct — it proves the right person sealed it, and that nobody has broken the seal and swapped the pages since.\n\n• A valid signature confirms two specific things: the update was signed using the expected signer's private key (authenticity), and nothing has changed in it since that signing happened (integrity).\n\n• Why the others are wrong: a signature says nothing about code quality or the absence of bugs, nothing about whether the hosting server stays online, and signing doesn't hide the update's contents from anyone who downloads it.\n\nSo the answer is: the update came from the expected signer and was not modified after signing.",
    },
    {
      type: "mcq",
      prompt:
        "A door controller accepts an encrypted and authenticated \"OPEN\" command. An attacker records that exact message once, then later resends the identical ciphertext and tag, and the door opens again. What kind of attack is this?",
      options: [
        "A replay attack, resending a previously valid authenticated message",
        "Cross-site scripting, exploiting how the controller renders untrusted content",
        "SQL injection, exploiting how the controller builds a database query",
        "Password spraying, trying one common password across many accounts",
      ],
      correctIndex: 0,
      modelAnswer:
        "It's the security-camera equivalent of recording someone saying the magic password out loud, then playing the recording back later to open the same door — the words are completely genuine, just reused.\n\n• Encryption hides content and authentication proves the message is genuine and unmodified, but neither one says anything about when the message was created or whether it's been seen before.\n\n• Without a counter, a nonce, or a timestamp the controller has no way to tell a fresh command from a recorded copy — resending a valid old message to repeat its effect is the definition of a replay attack.\n\n• Why the others are wrong: nothing here involves manipulating a database query or rendering untrusted content, and resending one specific recorded message is not the same as guessing passwords across accounts.\n\nSo the answer is: this is a replay attack.",
    },
    {
      type: "mcq",
      prompt:
        "A cloud service account only needs to read from one specific storage bucket, but it's actually been set up with full administrator rights across the whole cloud account. Which security principle does this violate?",
      options: [
        "Perfect secrecy, the guarantee that a one-time pad provides when used correctly",
        "Non-repudiation, the guarantee that an action can't later be credibly denied",
        "Least privilege, the idea that an identity should only get the access its task needs",
        "Certificate transparency, the public logging of issued TLS certificates",
      ],
      correctIndex: 2,
      modelAnswer:
        "Giving the office intern who only needs to file one cabinet a master key to every room in the building, including the vault, isn't convenience — it's an unnecessary risk waiting to be exploited.\n\n• Least privilege means every identity, human or automated, should hold only the permissions its actual task requires — here, that's read access to one bucket, nothing more.\n\n• Granting full administrator rights instead means that if this one account's credentials are ever stolen, the attacker inherits the keys to the entire cloud account rather than just one bucket.\n\n• Why the others are wrong: perfect secrecy is a one-time-pad cryptography concept, certificate transparency is about publicly logging TLS certificates, and non-repudiation is about proving who performed an action — none of those describe over-broad permissions.\n\nSo the answer is: this violates the principle of least privilege.",
    },
    {
      type: "mcq",
      prompt:
        "A staff member gets an unexpected push-based MFA prompt late at night, ignores it, then gets several more in a row, and eventually taps \"approve\" just to make them stop. What weakness in authentication design does this illustrate?",
      options: [
        "MFA fatigue, where repeated push prompts wear a user down into approving one",
        "A consensus failure happening inside a distributed ledger system",
        "A cryptographic hash collision occurring inside the authentication server",
        "An Android sandbox escape triggered by the repeated notifications",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine a smoke alarm that keeps going off at 3am for no real reason — eventually you just rip the battery out to make it stop, even though you still don't actually know if there's a fire.\n\n• MFA fatigue (also called push-bombing) is a form of social engineering where an attacker spams approval prompts until the exhausted user taps \"approve\" just to end the annoyance, with no real thought about who's actually asking.\n\n• The weakness being exploited is the human, not the cryptography: the login credentials and the MFA mechanism itself are still working exactly as designed, but a one-tap approval requires no real context check.\n\n• Why the others are wrong: nothing about a hash collision, a distributed-ledger consensus failure, or a sandbox escape matches a human simply getting worn down by repeated prompts.\n\nSo the answer is: this illustrates MFA fatigue (push-bombing) pressure on the user.",
    },
    {
      type: "mcq",
      prompt:
        "A browser successfully validates a website's TLS certificate before loading the page. What does that successful check primarily help the browser establish?",
      options: [
        "That it is communicating with the intended server/domain, within the certificate trust model",
        "That phishing is now impossible on that site because it uses HTTPS",
        "That the server can never experience a denial-of-service outage",
        "That the website's application code contains no vulnerabilities whatsoever",
      ],
      correctIndex: 0,
      modelAnswer:
        "Checking someone's government-issued ID at the door tells you their name matches the one on the list — it tells you nothing about whether they're a good person or whether the building might still catch fire later.\n\n• A certificate binds a public key to a specific domain name and is signed by a certificate authority the browser already trusts, so a successful check confirms the browser is really talking to the server that controls that domain.\n\n• Why the others are wrong: certificate validation says nothing about bugs in the site's own application code, it doesn't make phishing impossible (a look-alike domain can get its own valid certificate), and it has no bearing on whether the server can be knocked offline.\n\nSo the answer is: it helps establish that the browser is communicating with the intended server/domain within the trust model.",
    },
    {
      type: "mcq",
      prompt:
        "A DDoS attack floods a public service with traffic until legitimate users can no longer connect, while no evidence suggests any stored data was actually read or changed. Which CIA-triad goal is most directly affected?",
      options: [
        "Availability, because the service becomes unreachable for the users who need it",
        "Integrity, because an attacker could have been silently modifying stored records",
        "Confidentiality, because an attacker could have been reading sensitive data",
        "Non-repudiation, because the attacker's identity can no longer be proven",
      ],
      correctIndex: 0,
      modelAnswer:
        "Jamming every phone line into a business so real customers can never get through doesn't steal anything from inside the building and doesn't rearrange the furniture — it just stops anyone from getting in the door.\n\n• Availability is about whether a system is usable when someone legitimately needs it, and that's exactly what a DDoS attack takes away by exhausting the service's capacity to respond.\n\n• Why the others are wrong: the scenario explicitly states no data was read or modified, which rules out a confidentiality or integrity breach, and non-repudiation is a completely separate property about proving who performed an action.\n\nSo the answer is: availability is the goal most directly affected.",
    },
    {
      type: "mcq",
      prompt:
        "A web application takes a value straight from an incoming request and glues it directly into a SQL query's text, with no separation between the data and the query structure. What vulnerability does this create?",
      options: [
        "A cross-site scripting vulnerability, letting a script run in another user's browser",
        "A SQL injection vulnerability, letting crafted input change the query's structure",
        "A replay vulnerability, letting an attacker resend an old authenticated request",
        "A DDoS vulnerability, letting an attacker exhaust the server's capacity",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's like a form letter where someone can write anything into the \"fill in your name\" blank, including new instructions for the printer itself — because nothing stops the blank from being read as part of the instructions.\n\n• When untrusted input is concatenated straight into SQL text, the database can no longer tell the developer's intended query apart from attacker-supplied data, so crafted input like `' OR '1'='1` can change what the query actually does.\n\n• Why the others are wrong: replay is about resending an old valid message, DDoS is about exhausting capacity, and cross-site scripting is about unsafely rendering content in a browser — none of those describe untrusted data reshaping a SQL query's own structure.\n\nSo the answer is: this creates a SQL injection vulnerability.",
    },
    {
      type: "mcq",
      prompt:
        "A discussion site stores a user's comment without sanitising it, then later inserts it into the page exactly as written. When another user views that page, the comment's script runs inside their browser. What is this?",
      options: [
        "Certificate validation, since the browser is checking the site's TLS certificate",
        "Password hashing, since the comment is being processed through a hash function",
        "Cross-site scripting, since unencoded user content is executed as script by the browser",
        "Transaction ordering, since the comment changes the order database writes occur in",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine a notice board where anyone can pin up a note, and the office reads every note aloud over the intercom exactly as written, including one that says \"also, announce everyone's salary.\" The board can't tell a normal note from an instruction.\n\n• Because the comment was stored without being safely encoded for the page it's displayed on, the browser can't distinguish the site's own trusted code from the attacker's text, so it runs the script with the site's own trust and permissions.\n\n• Why the others are wrong: nothing here involves password hashing, the order of database writes, or TLS certificate checks — the defining problem is untrusted content being executed as code in someone else's browser.\n\nSo the answer is: this is cross-site scripting (XSS).",
    },
    {
      type: "mcq",
      prompt:
        "A network intrusion-detection system raises an alert during a routine software deployment. Analysts investigate and eventually confirm there was never actually an attack happening. How should this alert be classified?",
      options: [
        "A true negative, since the system correctly stayed silent about a non-event",
        "A false positive, since an alert was raised on activity that was actually benign",
        "A replay, since an old authenticated message was being resent",
        "A false negative, since a real attack went completely undetected",
      ],
      correctIndex: 1,
      modelAnswer:
        "It's a smoke detector going off because someone made toast, not because the building is on fire — an alarm sounded, but there was never actually a fire to find.\n\n• A false positive is exactly this: the detector raised an alert (a positive result), but the underlying activity was benign, so the alert itself was wrong.\n\n• Why the others are wrong: a false negative is the opposite case, where a real attack produces no alert at all; a true negative means the system correctly stayed silent, which isn't what happened here since an alert was raised; and replay describes resending an old valid message, not a detection outcome.\n\nSo the answer is: this is a false positive.",
    },
    {
      type: "mcq",
      prompt:
        "A learning portal stays fully confidential and none of its stored records get changed during an outage, but students are completely unable to submit their assessments for two hours. Which security property actually failed?",
      options: [
        "Non-repudiation, since students could later deny having tried to submit",
        "Availability, since the system wasn't usable by students when they needed it",
        "Authentication, since the system could no longer verify who students were",
        "Confidentiality, since the outage exposed student records to unauthorised viewers",
      ],
      correctIndex: 1,
      modelAnswer:
        "A bank vault that keeps every dollar perfectly safe and untouched is still a failure if customers can't get to the counter to actually make a withdrawal when they need to.\n\n• The portal's data stayed secret (confidentiality intact) and unchanged (integrity intact), but students couldn't reach the service to use it — that's specifically what availability measures.\n\n• Why the others are wrong: nothing in the scenario describes a failure to verify identity, a dispute about who performed an action, or any exposure of data to the wrong people.\n\nSo the answer is: availability is the property that failed.",
    },
    {
      type: "mcq",
      prompt:
        "Two security analysts look at the exact same technical evidence, but one assumes the attacker already has a valid user account, and the other assumes the attacker has no credentials at all. They reach completely different conclusions about whether the service can be exploited. What best explains this?",
      options: [
        "Encryption on the service removes the need for either analyst to state assumptions",
        "A security conclusion is only ever true relative to its explicit attacker assumptions",
        "A good threat model should deliberately exclude stating attacker capabilities",
        "Because they disagree, at least one of their two conclusions must simply be wrong",
      ],
      correctIndex: 1,
      modelAnswer:
        "Asking \"can someone get past this lock?\" has a different honest answer depending on whether you're asking about a stranger on the street or someone who's already been handed a spare key.\n\n• A security claim like \"exploitable\" or \"not exploitable\" is only meaningful relative to a stated model: what the attacker can do, and what's being protected. Two different, equally valid attacker models can honestly produce two different, equally correct conclusions from the same evidence.\n\n• Why the others are wrong: encryption doesn't eliminate the need to state assumptions, disagreement alone doesn't mean either analyst is wrong (they're each correct under their own stated model), and excluding attacker capabilities from a threat model would make it far less useful, not more rigorous.\n\nSo the answer is: security conclusions depend on the explicit attacker assumptions being used.",
    },
    {
      type: "mcq",
      prompt:
        "While investigating a finding, an AI agent with terminal access proposes running a command that would delete production data. What is the best next step?",
      options: [
        "Require human approval first, and run anything risky in a safe test environment",
        "Grant the agent broader administrator privileges so it isn't blocked again",
        "Disable all audit logging first so the command runs faster",
        "Execute the command right away, since the AI agent suggested it",
      ],
      correctIndex: 0,
      modelAnswer:
        "If an assistant you'd just hired said \"I think the fastest fix is to shred this entire filing cabinet,\" the right response isn't to hand them the shredder — it's to stop them and get a second opinion first.\n\n• Any destructive or irreversible action, like deleting production data, needs an explicit human checkpoint before it runs, and should ideally be tried in a sandboxed test environment rather than against real production systems.\n\n• Why the others are wrong: auto-executing the suggestion removes the one safeguard that could catch a mistake, disabling logging destroys the evidence needed to understand what happened, and granting broader privileges makes a wrong or manipulated action even more dangerous, not safer.\n\nSo the answer is: require human approval and use a safe test environment before anything destructive runs.",
    },
    {
      type: "mcq",
      prompt:
        "A banking app registers a deep link that opens its transfer screen and can pre-populate the destination account number from the link itself. What should the app do before it actually completes a transfer triggered this way?",
      options: [
        "Validate the input and re-check the user's authorisation before completing the sensitive action",
        "Disable the Android sandbox protections so the deep link can be processed and applied more quickly",
        "Store the incoming transfer account and amount permanently inside the installed APK's resources",
        "Trust the pre-populated account number automatically, since the URL's syntax is already correctly formatted",
      ],
      correctIndex: 0,
      modelAnswer:
        "A correctly formatted cheque isn't the same as a cheque you actually intended to sign — the bank still has to check that you, the real account holder, actually authorised that specific payment before the money moves.\n\n• A deep link is an entry point that any website, message, or other app can trigger, so the app should treat its contents as untrusted: validate the account and amount values, and have the server re-confirm the logged-in user actually authorised this exact transfer.\n\n• Why the others are wrong: correctly formatted syntax only shows the link is well-formed, not that it came from a trustworthy source or that the user intended it; disabling the sandbox has nothing to do with validating a deep link's data; and storing transfer data inside the APK makes no sense and doesn't address the trust problem at all.\n\nSo the answer is: validate the input and re-check user authorisation before completing the transfer.",
    },
    {
      type: "mcq",
      prompt:
        "A system accidentally reuses the exact same one-time-pad key (or the same keystream) to encrypt two different messages. What is the main security problem this creates?",
      options: [
        "It automatically generates a valid digital signature for both messages",
        "It prevents the legitimate receiver from decrypting either message",
        "It can reveal a relationship between the two underlying plaintext messages",
        "It makes the resulting ciphertext noticeably longer than it should be",
      ],
      correctIndex: 2,
      modelAnswer:
        "If you used the exact same decoder ring to scramble two different secret notes, someone who collects both scrambled notes could compare them and start figuring out where the two original messages agree and where they differ — even without ever finding the ring itself.\n\n• Combining the two ciphertexts together (XORing them, mathematically) makes the shared key cancel itself out, leaving behind the relationship between the two original plaintexts — and if either message is partly known or guessable, the attacker can often recover both messages and the key itself.\n\n• Why the others are wrong: reusing a key doesn't change the ciphertext's length, it doesn't stop the legitimate receiver from decrypting (they still have the correct key), and nothing about key reuse has anything to do with generating a digital signature.\n\nSo the answer is: it can reveal relationships between the plaintext messages.",
    },
    {
      type: "mcq",
      prompt:
        "A legacy system encrypts structured, sensitive payment data using ECB mode and performs no integrity checking on top of it. Why is ECB mode a poor choice for this kind of structured sensitive data?",
      options: [
        "ECB mode automatically detects and prevents replay attacks on its own, without needing any additional freshness mechanism",
        "ECB mode can only ever be used safely together with public-key encryption algorithms, never with any symmetric cipher",
        "ECB mode hides message patterns and structure more thoroughly than modern authenticated encryption modes such as AES-GCM",
        "Identical plaintext blocks produce identical ciphertext blocks, and blocks can be rearranged undetected without integrity protection",
      ],
      correctIndex: 3,
      modelAnswer:
        "ECB is like translating a form letter one word at a time using the exact same code book for every word — the same word always becomes the same coded symbol, so a sharp-eyed reader can start spotting repeated fields just from the pattern of symbols, even without breaking the code.\n\n• Because each block is encrypted independently with the same key, the same plaintext block always produces the same ciphertext block, and because there's no chaining or integrity check, an attacker can swap, duplicate, or reorder ciphertext blocks and the message will still \"successfully\" decrypt — just with a different, attacker-chosen meaning.\n\n• Why the others are wrong: ECB is a symmetric block cipher mode with no inherent connection to public-key cryptography, it has no built-in replay protection, and it actually leaks patterns rather than hiding them — the opposite of what a modern authenticated mode like AES-GCM provides.\n\nSo the answer is: identical plaintext blocks produce identical ciphertext, and blocks can be rearranged undetected.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker logs in successfully using stolen credentials and then downloads records that this particular account is legitimately allowed to read. Which control area most urgently needs strengthening here?",
      options: [
        "Block-cipher key length used by the storage system, and nothing else",
        "Database availability settings, and nothing else",
        "Packet routing configuration on the network, and nothing else",
        "Identity and access controls, such as stronger authentication and tighter access scope",
      ],
      correctIndex: 3,
      modelAnswer:
        "A thief who steals your actual house key can walk through your front door and take anything you keep in plain sight — the lock on the door did its job perfectly; the problem is that the wrong person now holds a legitimate-looking key.\n\n• The encryption and access-control rules worked exactly as designed here; the real failure is that stolen credentials were accepted as proof of identity, which points straight at strengthening identity and access controls, such as adding phishing-resistant multi-factor authentication and tightening how much each account can read.\n\n• Why the others are wrong: nothing in the scenario points to a weak cipher key length, an availability problem, or a routing issue — the attacker read data they were technically authorised to read once logged in, which is purely an identity problem.\n\nSo the answer is: identity and access controls need the most strengthening.",
    },
    {
      type: "mcq",
      prompt:
        "A team is choosing how to store user passwords and is weighing a few different designs. Which design is generally the most appropriate choice?",
      options: [
        "Reversible encryption of each password, so support staff can recover a forgotten one",
        "A suitable salted password-hashing function, paired with a password-reset flow instead of recovery",
        "One shared encrypted password value reused across every user account",
        "Plaintext storage of passwords, protected only by strict file permissions",
      ],
      correctIndex: 1,
      modelAnswer:
        "A good coat-check doesn't keep a copy of your coat in a back room just in case you lose your ticket — it gives you a way to prove it's yours and get a brand new ticket issued if you lose the old one, without ever needing to \"recover\" the original.\n\n• A suitable salted hashing function (like bcrypt, scrypt, or Argon2) means the service never actually needs to know a user's real password, only a way to verify it — and if it's forgotten, the safe move is to reset it, never to recover the original value.\n\n• Why the others are wrong: reversible encryption means a decryption key exists somewhere that could expose every password at once, plaintext storage is unsafe no matter how strict the file permissions are, and a single shared password defeats the entire point of per-user authentication.\n\nSo the answer is: a suitable salted password-hashing function with a reset flow is the preferable design.",
    },
    {
      type: "mcq",
      prompt:
        "A user clicks a phishing link and lands on a look-alike login page. That page genuinely uses HTTPS and has a completely valid TLS certificate — just for its own deceptive, look-alike domain. What does this situation actually demonstrate?",
      options: [
        "That HTTPS guarantees a site can never be malicious as long as the padlock is present",
        "That a valid certificate check removes any need to actually look at the domain name",
        "That HTTPS protects the connection itself, but doesn't prove the domain is the organisation the user intended",
        "That TLS automatically stops users from entering credentials into deceptive sites",
      ],
      correctIndex: 2,
      modelAnswer:
        "A sealed, tamper-proof envelope proves the letter inside hasn't been opened in transit — it says absolutely nothing about whether the person who sent it is who they claim to be.\n\n• The padlock only confirms two things: the connection to that specific domain is encrypted, and the server holds a valid certificate for the domain shown in the address bar. Anyone can register a look-alike domain and get a free, automatically issued certificate for it.\n\n• Why the others are wrong: a valid certificate doesn't mean a site is honest, it doesn't remove the need to actually check the domain name yourself, and TLS has no mechanism that stops a user from typing credentials into a page just because it's deceptive.\n\nSo the answer is: HTTPS protects the connection, but it doesn't prove the domain is the organisation the user intended.",
    },
    {
      type: "mcq",
      prompt:
        "A public service is hit by a DDoS attack that floods it with junk traffic from thousands of compromised devices. Why doesn't encrypting the service's traffic do anything to stop this kind of attack?",
      options: [
        "Because a DDoS attack only ever affects the confidentiality of the data stored on the service",
        "Because an encrypted service becomes physically incapable of ever being overloaded by excess traffic",
        "Because turning on encryption for all traffic automatically disables every network filtering rule in place",
        "Because a DDoS attack primarily targets the service's capacity and availability, not the content of its traffic",
      ],
      correctIndex: 3,
      modelAnswer:
        "Sealing every letter in a tamper-proof envelope doesn't stop someone from jamming your mailbox shut with ten thousand pieces of junk mail — the envelopes protect what's written inside, not how much mail shows up at your door.\n\n• Encryption protects the confidentiality and integrity of the content being sent, but a DDoS attack works by exhausting the service's bandwidth, connections, or processing capacity — the attacker doesn't need to read or alter anything to achieve that.\n\n• Why the others are wrong: encryption doesn't disable network filtering (it can even add CPU overhead from handshakes, if anything making things slightly worse under load), it doesn't make a service immune to being overloaded, and a DDoS attack is fundamentally an availability attack, not a confidentiality one.\n\nSo the answer is: a DDoS attack primarily targets service capacity and availability, which encryption doesn't protect.",
    },
    {
      type: "mcq",
      prompt:
        "A web application is vulnerable to SQL injection because it builds queries by directly combining untrusted user input with SQL text. Out of the options below, which is the strongest primary defence against this?",
      options: [
        "Hiding database error messages from the end user, and nothing else",
        "Using parameterised queries, so untrusted data is never interpreted as SQL structure",
        "Storing the user's input in a longer variable before using it",
        "Increasing the key length used by the site's TLS connection",
      ],
      correctIndex: 1,
      modelAnswer:
        "Filling out a form where the printed questions are locked in place and you can only write your answer into the blank lines is fundamentally different from a form where your handwriting could rewrite the questions themselves — one design makes the distinction between \"question\" and \"answer\" impossible to break.\n\n• Parameterised queries (prepared statements) write the SQL structure first, with placeholders, and pass the user's input separately as pure data — the database then treats that input as a value, never as part of the query's logic, no matter what characters it contains.\n\n• Why the others are wrong: hiding error messages only reduces information leakage, it doesn't stop the injection itself; TLS key length protects data in transit and has nothing to do with how a query is built; and a longer variable does nothing to stop malicious characters from being interpreted as SQL syntax.\n\nSo the answer is: use parameterised queries so untrusted data is never interpreted as SQL structure.",
    },
    {
      type: "mcq",
      prompt:
        "A security team wants to tune their intrusion detector so it stops producing any false positives at all. Why can't a detector simply be tuned to eliminate every false positive without any real consequence?",
      options: [
        "Because false positives and false negatives are actually the exact same kind of classification error",
        "Because a genuinely well-designed detector never needs to use any thresholds or rules at all",
        "Because the correct fix is simply to block all traffic indiscriminately, including benign traffic",
        "Because making it less likely to raise false alarms makes it more likely to miss real attacks, creating false negatives instead",
      ],
      correctIndex: 3,
      modelAnswer:
        "Turning a smoke detector's sensitivity all the way down so it never goes off for burnt toast also means it's far more likely to stay silent during an actual small fire — you haven't removed the trade-off, you've just moved it.\n\n• A detector separates benign from malicious activity using rules or thresholds, and those two categories genuinely overlap in the real world — making it less sensitive to cut false alarms inevitably makes it more likely to miss some real attacks, turning them into false negatives.\n\n• Why the others are wrong: false positives and false negatives are opposite kinds of errors, not the same thing; real detectors do rely on thresholds to make their classification decisions; and blocking all traffic isn't tuning the detector, it's disabling the service entirely.\n\nSo the answer is: reducing false positives tends to increase missed attacks (false negatives) — it's a genuine trade-off.",
    },
  ],
};

export const INFO5995_FINAL_PRACTICE_PAPERS: ExamPaperSeed[] = [PAPER];
