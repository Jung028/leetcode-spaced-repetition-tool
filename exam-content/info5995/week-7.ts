import type { ExamPaperSeed } from "../types";

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 7,
  paperNumber: 1,
  title: "Week 7 Lecture Practice Paper",
  topics:
    "Network security, protocols, TLS, web security, DoS and DDoS. Authentication vs authorisation: a valid, correctly signed, unmodified JWT still lets a user read another user's object when the server trusts the ID in the request instead of checking ownership — broken object-level authorisation (BOLA / IDOR, OWASP API1). Why transport security (HTTPS/TLS), strong login (MFA) and token integrity (a signed JWT) do not enforce per-object access control, and where the authorisation check actually belongs — server-side, per request, on every object reference.",
  sourceFiles: [
    "exam-content/info5995/unit_schedule.md (Week 07 topic: network security, protocols, TLS, web security, DoS and DDoS)",
    "User-supplied exam scenario: Alice (sub=1042, role=student) reading GET /api/results/1043",
  ],
  questions: [
    {
      type: "scenario",
      prompt:
        "An API is protected with HTTPS, multi-factor login and signed JWTs.\n\nAlice logs in and gets a token that says: sub = 1042, role = student.\n\nShe calls GET /api/results/1042 and gets 200 OK — her own results.\n\nShe changes one character: GET /api/results/1043 — and gets 200 OK with another student's results.\n\nThe token was valid, correctly signed and not modified in any way.\n\n• What exactly failed here, and why didn't HTTPS, MFA or the JWT stop it?\n\n• Bonus: where should the fix actually be implemented?",
      modelAnswer:
        "Think of a nightclub. The bouncer checks your ID at the door and stamps your hand — that is login plus MFA. The stamp is genuine and cannot be faked — that is the signed JWT. HTTPS is just the covered walkway from the street to the door so nobody can jump you on the way in. None of that decides which private rooms you may enter once you are inside, and here nobody is checking the door of each room.\n\n• HTTPS / TLS only encrypts the connection so an outsider cannot read or alter the request in transit. Alice's own browser is not an outsider — she is allowed to type any URL she likes. HTTPS was never meant to stop this.\n\n• MFA only proves it really is Alice signing in, not someone with a stolen password. It answers 'who are you', never 'what are you allowed to see'.\n\n• The signed JWT only proves the token was issued by the server and has not been edited, so 'sub 1042, role student' is trustworthy. The token says who she is. It does not say she may read record 1043, and the server never checked.\n\n• The real failure: the endpoint takes the ID straight from the URL and returns that record without checking it belongs to the caller. This is broken object-level authorisation, also called IDOR (Insecure Direct Object Reference), and it is number one on the OWASP API Security list. It is an authorisation bug, and everything Alice's setup provides is authentication, transport or token integrity — not authorisation.\n\n• Why it survives testing: with her own ID everything works, so the normal path looks fine. The hole only shows when you ask for someone else's object.\n\n• Where the fix goes (the bonus): server-side, inside the endpoint's own logic, on every request. Before returning results for a given ID, the server must confirm that record belongs to the authenticated user, or that the user's role genuinely allows reading other students' records (a lecturer, say). Make it a reusable ownership or permission check applied to every object lookup. Never trust the client to request only 'its own' IDs, and do not treat unguessable IDs such as UUIDs as the protection, because a shared or leaked link still works.\n\nSo the answer is: authentication succeeded but authorisation was never performed; the object-ownership check has to live on the server, run on every request, and cover every object reference.",
    },
  ],
};

const LECTURE_PRACTICE_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 7,
  paperNumber: 2,
  title: "Week 7 Lecture Practice Paper",
  topics:
    "Secure networks: IP best-effort delivery, UDP vs TCP, TCP handshake, sequence numbers and retransmission, why reliable is not secure, port scanning and reconnaissance, SYN flood / DoS / DDoS, ARP, IP and DNS spoofing, man-in-the-middle (active vs passive, CIA impact), TLS (handshake, certificates, record protocol, layering above TCP), HTTPS and what it does not fix, Heartbleed as an implementation bug, secure TLS deployment, plus the guest presenter's demos (port scan, SQL injection, Wireshark spoofing detection) and defences.",
  sourceFiles: [
    "lecture/Week07-Secure network, UDP, TCP, TLS, HTTPS.pdf",
    "lecture/INFO5995_Week_7_Extra_Resources_UPDATED.pdf",
    "lecture/Week 07 - Introducti-s1-low.transcript.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "An attacker runs a port scan against a company server and finds ports 22 (SSH remote login), 80 (HTTP), 443 (HTTPS) and 3306 (MySQL database) open.\n\nWhich conclusion is the most accurate?",
      options: [
        "The scan is reconnaissance: it reveals which services are reachable, and how risky each one is depends on what runs behind it and how it is configured",
        "The server is already compromised, because a port scan can only succeed against a machine the attacker has broken into",
        "Every open port is a confirmed vulnerability, so all four must be closed right away or the server counts as breached",
        "Only the database port is a real concern, because web and remote-login services cannot be attacked from the network",
      ],
      correctIndex: 0,
      modelAnswer:
        "Think of walking round a building and noting which doors and windows are unlocked. You have not got in yet, you have only learned where you could try.\n\n• What a scan gives: a list of reachable services, which are possible entry points. Reconnaissance is not the same as compromise.\n\n• Why open is not automatically unsafe: staff genuinely need SSH to connect, and a password-protected database is a much smaller risk than one with a guessable password.\n\n• Why the other options are wrong: a scan works on any reachable machine, closing everything would break the service, and web or SSH services are attacked all the time.\n\nSo the answer is: an open port shows a reachable service, and the real risk depends on what is running and how it is set up.",
    },
    {
      type: "mcq",
      prompt:
        "A client sends packets P1, P2, P3 to a server in that order. The server receives P3 first, then P1, one copy of P1 twice, and P2 never arrives.\n\nWhich statement about IP best explains this?",
      options: [
        "IP always uses one shortest route, so this can only happen when a router is faulty; normal IP delivers in order",
        "IP guarantees delivery but not secrecy, so the missing packet must have been stolen by an eavesdropper on the path",
        "IP numbers every packet and retransmits missing ones itself, so the fault must lie in the application that reads them",
        "IP only makes a best effort: it promises no delivery, no order and no protection from duplicates, so a layer above must fix it",
      ],
      correctIndex: 3,
      modelAnswer:
        "Think of posting three letters to a friend through the normal mail. They can take different trucks and routes, so one might arrive first, one might get lost, and occasionally a copy turns up twice. The post office never promised otherwise.\n\n• How IP works: each packet carries a destination address and routers forward it. The network layer does not always pick the shortest route, it may weigh how busy or reliable a path is.\n\n• What can happen: lost, late, out of order or duplicated packets. That is normal behaviour, not a fault.\n\n• Why other options are wrong: IP does not retransmit or number packets. That job belongs to TCP above it.\n\nSo the answer is: IP is best-effort delivery, which is why transport protocols such as TCP or UDP sit above it.",
    },
    {
      type: "multi",
      prompt:
        "Select every pairing where the transport protocol fits the reasoning given.",
      options: [
        "Watching a movie over TCP so the picture pauses until every missing pixel arrives, which is what viewers prefer",
        "Sending a bank transfer request over UDP because speed matters more than every byte arriving intact",
        "An online game over UDP: the game would rather skip a lost update than freeze and wait",
        "Delivering an email over TCP: losing even two characters is not acceptable, so ordered acknowledged delivery matters",
        "A live voice call over UDP: a late audio packet is worth less than the next fresh one",
      ],
      correctIndices: [2, 3, 4],
      modelAnswer:
        "Picture two delivery services. One is a courier who gets a signature for every parcel and re-sends anything lost. The other is a leaflet drop where nobody waits for a lost leaflet. Which one you want depends on whether late data is still useful.\n\n• UDP: no connection set-up, no retransmission, no ordering, so it is fast. Good for calls, games and DNS queries where fresh beats perfect.\n\n• TCP: connection set-up, sequence numbers, acknowledgements and retransmission, so it is slower but accurate. Good for email and money.\n\n• Why the other two are wrong: viewers want the movie to keep playing rather than stall for one pixel, and a bank transfer cannot afford missing or reordered data.\n\nSo the answer is: pick UDP when fresh data beats complete data, and TCP when every byte must arrive in order.",
    },
    {
      type: "mcq",
      prompt:
        "A student says: \"UDP must retransmit lost packets, because the link layer underneath retransmits frames whatever protocol is on top.\"\n\nWhich statement is correct?",
      options: [
        "UDP retransmits after a timeout just like TCP, and the only real difference is that UDP skips the initial handshake",
        "TCP relies on the link layer for retransmission and adds none of its own, so the two protocols behave the same when data is lost",
        "Retransmission happens only at the application layer, so neither UDP nor TCP has any part in resending a lost packet",
        "UDP itself never retransmits; a lower layer may resend frames, but only TCP takes responsibility for retransmission at the transport layer",
      ],
      correctIndex: 3,
      modelAnswer:
        "A friend asks the post office to redeliver a lost parcel. That is different from you personally promising to keep checking until it arrives. UDP is the post office, TCP is you checking.\n\n• UDP: sends once and moves on. No acknowledgements, so it never knows something was lost.\n\n• Link layer: it may resend a damaged frame no matter which protocol is above it, which is why the student's observation is true but does not make UDP reliable.\n\n• TCP: does not trust the link layer. It numbers the data, waits for acknowledgements and resends what is missing.\n\nSo the answer is: UDP has no retransmission of its own, whereas TCP adds it at the transport layer.",
    },
    {
      type: "mcq",
      prompt:
        "A TCP sender transmits byte ranges 1–40, 41–70 and 71–100. The range 41–70 is lost, but 71–100 arrives.\n\nWhat does the receiver do, and what happens next?",
      options: [
        "It keeps sending ACK 41, saying it still expects byte 41, so no progress is made and the sender retransmits the missing bytes",
        "It sends ACK 101, confirming the latest bytes received, and the sender continues without resending anything",
        "It sends ACK 71 to show where the gap ends, and the receiver then requests bytes 41–70 from a different server",
        "It stays silent until every byte is present, and the sender restarts the connection with a brand-new handshake",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine numbered pages of a report arriving. You have pages 1 to 40 and 71 to 100, so you keep saying the next page I need is 41. Eventually the sender notices you never move on and sends it again.\n\n• The receiver's question: what byte do I expect next? An ACK of 41 means everything before 41 is here and 41 is still missing.\n\n• The sender's reaction: no ACK moves forward inside the window, so it retransmits the missing chunk.\n\n• Why other options are wrong: ACK 101 would claim the gap was filled, and TCP does not reconnect or ask another server.\n\nSo the answer is: the receiver repeats ACK 41 and the sender retransmits 41–70.",
    },
    {
      type: "multi",
      prompt:
        "Select every correct statement about the TCP handshake and the TLS handshake.",
      options: [
        "After the TLS handshake finishes, application data travels as protected TLS records",
        "The TLS handshake replaces the TCP handshake, so an HTTPS connection never needs SYN or ACK packets",
        "The TLS handshake (hello, certificate, key exchange, finished) agrees algorithms, proves the server's identity and creates session keys",
        "Completing the TCP handshake proves to the client that it is talking to the genuine server",
        "The TCP handshake (SYN, SYN-ACK, ACK) creates connection state before any application data is sent",
      ],
      correctIndices: [0, 2, 4],
      modelAnswer:
        "Think of a phone call. TCP is dialling and hearing the other person pick up, so you know a line exists. TLS is then asking for proof of who they are and agreeing on a secret code before you discuss anything private.\n\n• TCP handshake: SYN (can we connect?), SYN-ACK (yes, ready), ACK (connected). It only makes a reliable connection.\n\n• TLS handshake: four moves, hello, certificate, key exchange, finished. It builds an agreement and session keys, not a connection.\n\n• Why the other two are wrong: someone answering the TCP call proves nothing about identity, and TLS runs on top of TCP rather than replacing it.\n\nSo the answer is: TCP first creates the connection, then TLS agrees the security and switches to protected records.",
    },
    {
      type: "mcq",
      prompt:
        "A developer says: \"Our chat app uses TCP, which delivers everything in order with acknowledgements, so nobody can hijack or read the conversation.\"\n\nWhat is the best response?",
      options: [
        "TCP's sequence numbers detect any change an attacker makes, so only confidentiality is missing, and encryption alone would complete the design",
        "Reliability is not security: TCP repairs loss and order, but it gives no secrecy, no tamper protection and no proof of who the server is",
        "TCP is safe as long as the handshake completes, because an attacker cannot send a SYN-ACK without being the real server",
        "TCP protects the data from being read but not from being lost, so the app only needs a retransmission timer added",
      ],
      correctIndex: 1,
      modelAnswer:
        "A registered-post envelope tells you the parcel arrived and in what order. It does not stop the postman from opening it, and it does not prove the sender is who they claim.\n\n• What TCP fixes: lost, late, out-of-order or duplicated packets. It answers the question did it arrive?\n\n• What TCP does not fix: was it private, unchanged and authentic? An attacker on the path can still read, change or impersonate.\n\n• The missing layer: TLS adds confidentiality, integrity and authentication above TCP.\n\nSo the answer is: reliable delivery does not make communication secure.",
    },
    {
      type: "mcq",
      prompt:
        "A browser is about to send an HTTP request over an HTTPS connection.\n\nIn what order does the request pass through the protocols on the sending side?",
      options: [
        "HTTP request, then TCP (reliable delivery), then TLS (encrypts and adds a tag), then IP (routing)",
        "HTTP request, then IP (routing), then TLS (encrypts and adds a tag), then TCP (reliable delivery)",
        "TLS (encrypts and adds a tag), then HTTP request, then TCP (reliable delivery), then IP (routing)",
        "HTTP request, then TLS (encrypts and adds a tag), then TCP (reliable delivery), then IP (routing)",
      ],
      correctIndex: 3,
      modelAnswer:
        "Write a letter, seal it in a tamper-proof envelope, hand it to a courier who guarantees delivery, and only then decide which roads to use. Protection comes before delivery.\n\n• TLS sits between the application and TCP: it protects the data first, encrypting it and adding an integrity tag.\n\n• TCP then moves those protected bytes reliably, and IP forwards the packets across networks.\n\n• Why the others are wrong: IP is the last step because routing is about the path, and TLS cannot come before HTTP because it has nothing to protect until the request exists.\n\nSo the answer is: HTTP, then TLS, then TCP, then IP. TCP moves the bytes, TLS makes them trustworthy.",
    },
    {
      type: "mcq",
      prompt:
        "A web server is running normally, but thousands of SYN packets arrive each second and none of the senders ever replies with the final ACK. Genuine users can no longer connect.\n\nWhat is the attack and which security property does it hit?",
      options: [
        "A SYN flood: half-open connections fill the server's backlog, so the service runs but users cannot reach it; the property hit is availability",
        "A SYN flood: the attacker completes each handshake and downloads large files, using up bandwidth; the property hit is availability",
        "ARP spoofing: the server's address table is corrupted so replies go to the wrong machine; the property hit is integrity",
        "A man-in-the-middle attack: the attacker sits between users and server reading the handshakes; the property hit is confidentiality",
      ],
      correctIndex: 0,
      modelAnswer:
        "Imagine a restaurant where prank callers book hundreds of tables and never turn up. The kitchen works fine, but real customers cannot get a table.\n\n• How it works: the attacker only sends the first step of the handshake, SYN. The server replies SYN-ACK and holds resources waiting for a final ACK that never comes.\n\n• The effect: the backlog of half-open connections fills up, so legitimate clients struggle to connect.\n\n• Why the other options are wrong: the attacker never finishes the handshake, and nothing is being read or redirected.\n\nSo the answer is: a SYN flood is a denial-of-service attack on availability.",
    },
    {
      type: "multi",
      prompt:
        "Select every correct statement about denial-of-service (DoS) and distributed denial-of-service (DDoS) attacks.",
      options: [
        "In a DDoS attack many compromised machines send the flood together, which makes it harder to stop",
        "Blocking the single busiest IP address fully stops a DDoS attack, because all of the requests come from that address",
        "In a DoS attack the flood of requests comes from a single machine",
        "Encrypting the traffic with TLS stops a flood, because the server can discard requests that it cannot decrypt",
        "Firewalls that check whether traffic is legitimate, and rate limiting that blocks an IP sending too much, are standard defences",
      ],
      correctIndices: [0, 2, 4],
      modelAnswer:
        "One person shouting outside a shop is easy to move on. A thousand people all shouting at once from different streets is a different problem.\n\n• DoS versus DDoS: the difference is the source. One machine versus many compromised machines, maybe tens or hundreds.\n\n• Defences from the lecture: firewalls to judge whether traffic is legitimate, and rate limiting to block an IP that sends too much for a while.\n\n• Why the two wrong options fail: TLS protects content and cannot stop volume, and in a DDoS blocking one address does little because the traffic is spread over many.\n\nSo the answer is: DoS is one source, DDoS is many, and firewalls plus rate limiting are the standard defences.",
    },
    {
      type: "mcq",
      prompt:
        "On a cafe network, an attacker sends messages claiming the gateway's IP address now belongs to the attacker's own MAC address. Victims' traffic starts flowing through the attacker's laptop.\n\nWhich attack is this?",
      options: [
        "IP spoofing: each packet is built with a forged source IP address so that it appears to come from another host",
        "DNS spoofing: a fake reply to a name lookup sends the victim to an attacker's IP address for a website name",
        "ARP spoofing: false address-resolution information changes which MAC address a local IP appears to map to",
        "A SYN flood: the attacker overwhelms the gateway with handshake requests until traffic reroutes through the laptop",
      ],
      correctIndex: 2,
      modelAnswer:
        "Think of a mailroom noticeboard that says which flat number belongs to which person. If a stranger swaps their name onto your flat number, your post goes to them.\n\n• ARP spoofing: the local network's IP-to-MAC table is poisoned, so traffic for one IP is delivered to the attacker's MAC. It works on the local network.\n\n• IP spoofing: something different, the source address inside a packet is faked.\n\n• DNS spoofing: also different, it lies about which IP belongs to a domain name.\n\nSo the answer is: this is ARP spoofing, which can turn into a man-in-the-middle position.",
    },
    {
      type: "multi",
      prompt:
        "A defender opens a Wireshark capture. For one DNS query about example.test there are two replies with different IP addresses, and the second arrives almost instantly. Separately, two ARP replies for the gateway IP come from two different MAC addresses.\n\nSelect every reasonable inference.",
      options: [
        "A reply arriving faster than a genuine DNS server could answer is itself a warning sign that it was forged",
        "Two answers to a single DNS question is suspicious: one may be an attacker racing the real server, so DNS spoofing is likely",
        "Two MAC addresses for one IP simply means the server has two network cards, so this is a TLS certificate problem",
        "A real server's MAC address does not change, so two MACs for the gateway IP point to ARP spoofing",
        "Two DNS replies are normal load balancing, so there is nothing to investigate as long as the capture is unencrypted",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "If you ask a question and two people answer at once with different answers, and one answered impossibly fast, you should ask who that fast person is.\n\n• DNS: one question should get one answer. A second, very fast reply with a different IP suggests an impersonator.\n\n• ARP: the real gateway has one fixed MAC address. A second MAC claiming the same IP is the attacker.\n\n• Why the wrong options fail: nothing here is about certificates, and load balancing does not produce a forged reply that races the real one.\n\nSo the answer is: the duplicate replies, the impossible speed and the changing MAC are the tell-tale signs of DNS and ARP spoofing.",
    },
    {
      type: "mcq",
      prompt:
        "Eve joins a rogue Wi-Fi network. In case one she silently records unencrypted logins. In case two she intercepts a payment, changes the amount and forwards it.\n\nWhich classification is correct?",
      options: [
        "Case one is an active man-in-the-middle attack, because she is positioned in the path; case two is passive eavesdropping",
        "Case one is passive eavesdropping; case two is an active man-in-the-middle attack because she changes the packet",
        "Both are passive attacks, because neither case involves Eve sending traffic to the victim's own machine",
        "Both are active attacks, because any attacker on the same network is interfering with the communication",
      ],
      correctIndex: 1,
      modelAnswer:
        "A passive attacker is someone listening at the door with a glass to the wall. An active attacker steps in, takes the note, rewrites it and hands it on.\n\n• Passive: listening only. The victim cannot tell, and the attacker may keep the messages, for example for a later replay.\n\n• Active: the attacker changes, redirects or blocks. A man-in-the-middle attack is active because the attacker changes who is communicating with whom.\n\n• The dangerous part: both ends may still see apparently normal communication.\n\nSo the answer is: listening only is passive, and changing the packet makes it an active man-in-the-middle.",
    },
    {
      type: "multi",
      prompt:
        "Mallory is in the path on a rogue Wi-Fi network. Select every action that is matched to the right security property.",
      options: [
        "Reading unprotected login details as they pass: confidentiality",
        "Changing the amount in a transfer request in transit: confidentiality",
        "Reading unprotected login details as they pass: integrity",
        "Silently dropping the victim's selected traffic: availability",
        "Changing the amount in a transfer request in transit: integrity",
      ],
      correctIndices: [0, 3, 4],
      modelAnswer:
        "Picture a postman who can open your letters, rewrite them, or throw them in the bin. Each is a different kind of harm.\n\n• Read: seeing the data breaks confidentiality.\n\n• Change: altering the data in transit breaks integrity.\n\n• Block: stopping selected traffic breaks availability. A fourth action, redirect, sends traffic somewhere else and attacks trust.\n\n• Why the wrong matches fail: looking at data does not alter it, and altering it does not merely reveal it.\n\nSo the answer is: read maps to confidentiality, change to integrity and block to availability.",
    },
    {
      type: "mcq",
      prompt:
        "During connection set-up, a man-in-the-middle attacker swaps the server's public key for the attacker's own public key, and the client cannot tell.\n\nWhich security property is missing?",
      options: [
        "Reliability of delivery: the client would notice a substituted key if TCP acknowledged every packet correctly",
        "Availability of the server: the attacker's key crowds out the real key so the real server can no longer be reached",
        "Compression of the handshake: a shorter exchange leaves no room for the client to compare the key with a stored copy",
        "Authentication of the server: nothing proves that the public key really belongs to the server, so a substituted key is accepted",
      ],
      correctIndex: 3,
      modelAnswer:
        "If a stranger hands you a padlock and says it is your bank's, you cannot tell without something vouching for it. Anyone can hand you a padlock.\n\n• The missing piece: authentication, a way to bind a public key to a server's real identity.\n\n• How TLS fixes it: the server presents a certificate, a statement signed by a trusted authority that ties its name to its public key, and the client verifies it.\n\n• Why the other options are wrong: TCP reliability says nothing about whose key it is, and this is not about reachability.\n\nSo the answer is: authentication is what stops a man-in-the-middle from silently substituting a key.",
    },
    {
      type: "mcq",
      prompt:
        "A browser shows: \"This website's certificate has expired. Do you still want to proceed?\"\n\nWhat has actually gone wrong, and what is the risk of clicking proceed?",
      options: [
        "The website's data has been encrypted with a broken algorithm, so every page will be sent to you as plain readable text",
        "The TCP handshake with the server failed, so the browser cannot exchange any data until the connection is restored",
        "The site has certainly been hacked, so proceeding will infect your device with malware as soon as the page loads",
        "The browser can no longer validate the server's identity, so proceeding means trusting a server that has not been verified as the real one",
      ],
      correctIndex: 3,
      modelAnswer:
        "It is like a shop showing an out-of-date ID badge. The person might still be the real employee, but you can no longer be sure, and crossing the road without a zebra crossing is your call.\n\n• What a certificate does: it binds the server's name to its public key, and it expires after a while.\n\n• What failed: the browser cannot verify that binding, so the identity check has lapsed.\n\n• The risk: an impersonator could look exactly like this, and DNS spoofing can send you to a lookalike site.\n\nSo the answer is: the identity check failed, which is why proceeding is left to the user's discretion and is risky.",
    },
    {
      type: "mcq",
      prompt:
        "A developer's client checks that a server certificate is signed by a trusted CA, but skips checking that the certificate's name matches the website being visited. An attacker holds a valid CA-signed certificate for attacker-site.example and sits in the path to bank.example.\n\nWhat happens?",
      options: [
        "The client rejects it, because the CA's signature is only valid for the site that originally asked for the certificate",
        "The client accepts the attacker's certificate and completes the handshake, so a man-in-the-middle succeeds; both chain and hostname must be checked",
        "The client accepts it, but the man-in-the-middle sees only scrambled bytes because TLS encrypts everything either way",
        "The client accepts it, but the attack fails at the record stage, since session keys are only shared with the real bank",
      ],
      correctIndex: 1,
      modelAnswer:
        "A security guard checks that your ID card is real, but never reads the name on it. Anyone with any genuine card walks in.\n\n• Chain validation: proves a trusted authority signed the certificate.\n\n• Hostname validation: proves it was issued for this website. Skipping it means an attacker with a genuine certificate for their own site passes.\n\n• Consequence: the attacker completes the handshake as the bank, so session keys are shared with the attacker and the encryption protects nothing from them.\n\nSo the answer is: both the certificate chain and the hostname must be verified, or authentication breaks.",
    },
    {
      type: "mcq",
      prompt:
        "A site uses TLS everywhere. An attacker then poisons the ARP and DNS lookup tables held on a router.\n\nWhy is this still possible?",
      options: [
        "TLS encrypts only the first packet of each connection, so any address information sent later in the same session is left readable to anyone on the path",
        "TLS protects the data in the logical channel between endpoints; it does not protect address tables and routing at the network layer, which is why network-layer security is still needed",
        "TLS protects the whole machine and every table it holds, but only when a certificate has been installed on the router as well as on the server",
        "TLS was only ever designed to protect passwords typed into a login form, so tables and every other kind of traffic always remain open to attack",
      ],
      correctIndex: 1,
      modelAnswer:
        "A sealed, tamper-proof parcel does not stop someone repainting the road signs so the courier drives to the wrong town.\n\n• What TLS protects: the data inside your logical channel, giving confidentiality, integrity and authentication.\n\n• What it does not cover: ARP and DNS lookup tables, and the routers that hold them. Those sit at the network layer.\n\n• The lesson: security is needed at every layer, for example network-layer protection such as IPsec, and even frequency hopping at the physical layer.\n\nSo the answer is: TLS protects the channel's data, not the network's lookup tables, so other layers need their own protection.",
    },
    {
      type: "truefalse",
      prompt:
        "True or false: even if every layer above it is encrypted and authenticated, an attacker with a signal jammer can still block communication, so the physical layer needs its own defence such as frequency hopping.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "You can lock every door and window in a house, but someone shouting loud enough outside still stops you hearing your visitors.\n\n• Why it is true: jamming attacks availability at the physical layer, and encryption above it cannot help because no signal gets through.\n\n• The defence: frequency hopping, where the transmitter keeps switching frequency so the attacker does not know which one to jam. It is used in mobile networks.\n\nSo the answer is: True, security is needed at every layer.",
    },
    {
      type: "multi",
      prompt:
        "A shop moves its entire site to HTTPS. Select every threat that HTTPS alone does NOT stop.",
      options: [
        "An eavesdropper on the cafe Wi-Fi reading the pages the customer views",
        "A server-side flaw such as SQL injection, or a breach of the shop's database",
        "A man-in-the-middle silently changing the order details while they travel",
        "Malware already running on the customer's own device",
        "A customer using an easily guessed password that an attacker simply tries",
      ],
      correctIndices: [1, 3, 4],
      modelAnswer:
        "HTTPS is an armoured van for the trip. It does not care whether the goods inside are junk, whether the sender is a thief, or whether the warehouse at the end has been robbed.\n\n• What HTTPS does: encrypts traffic, detects tampering and lets the browser verify the server through its certificate. So reading and silent changes in transit are covered.\n\n• What it does not do: fix weak passwords, remove malware, stop users being phished or fix server-side vulnerabilities.\n\n• The takeaway: it is necessary but only one control in a secure system.\n\nSo the answer is: HTTPS protects data in transit, not the whole website.",
    },
    {
      type: "mcq",
      prompt:
        "Heartbleed let attackers read chunks of a server's memory. A client sent a heartbeat saying it was sending 1 byte but asking for 64 KB back, and the server complied.\n\nHow should this failure be classified?",
      options: [
        "A cryptographic break: the encryption algorithm used by TLS was cracked, letting attackers decrypt any captured traffic",
        "A protocol design flaw: the TLS handshake itself lets clients request server memory, so every TLS library was affected",
        "An implementation bug: OpenSSL did not check that the claimed payload length matched the real payload, so TLS design and cryptography were not broken",
        "A certificate authority compromise: forged certificates let the attacker pose as the server and read its memory",
      ],
      correctIndex: 2,
      modelAnswer:
        "Imagine a good lock installed by a careless locksmith who left the key under the mat. The lock design is fine, the installation was not.\n\n• What happened: the heartbeat is a check that the other side is still responsive. The software trusted the length the client claimed and never checked it, a bounds-checking failure.\n\n• Why it matters: a well-designed protocol still depends on careful implementation and input validation.\n\n• Why the other options are wrong: the cryptography, handshake design and certificates were all fine.\n\nSo the answer is: Heartbleed was an implementation vulnerability, not a failure of TLS cryptography.",
    },
    {
      type: "mcq",
      prompt:
        "Heartbleed can leak private keys, passwords, session cookies and other recently used memory from a server.\n\nWhich leaked item lets an attacker impersonate the server itself?",
      options: [
        "The server's certificate, because the certificate itself proves the holder's identity, so possessing it is enough",
        "A user's session cookie, because it lets the attacker act as the server toward every other client",
        "The server's private key, because whoever holds it can pass as the server and may decrypt sessions",
        "The negotiated TLS version, because it lets the attacker rebuild the server's identity from the protocol alone",
      ],
      correctIndex: 2,
      modelAnswer:
        "A certificate is like a public name badge with a photo in the window. Anyone can copy the badge, but only the person who holds the matching secret stamp can prove it is really them.\n\n• Private key: the secret half. If it leaks, an attacker can impersonate the server and perhaps decrypt sessions.\n\n• Certificate: just a public binding of the name to the public key. It is not secret.\n\n• Session cookies: they let an attacker hijack a logged-in user's session, which is bad but different from impersonating the server.\n\nSo the answer is: the private key is what lets an attacker pose as the server.",
    },
    {
      type: "multi",
      prompt:
        "A company learns its servers ran a Heartbleed-vulnerable TLS library. Select every response that fits the defence mindset.",
      options: [
        "Invalidate existing sessions so stolen session cookies stop working",
        "Reissue the certificate but keep using the same private key as before",
        "Rotate keys that may have been exposed, replacing them with new ones",
        "Patch the vulnerable library quickly",
        "Temporarily switch the site to plain HTTP so no TLS code is running",
      ],
      correctIndices: [0, 2, 3],
      modelAnswer:
        "If a burglar might have copied your house key, you fix the broken window, change the locks and tell everyone previously let in to leave. Fixing the window alone is not enough.\n\n• Patch: closes the hole so nothing more leaks.\n\n• Rotate keys: what already leaked stays leaked, so the old private key must be replaced. Reissuing a certificate for the same key does nothing, because the attacker holds that key.\n\n• Invalidate sessions and monitor: stolen cookies could hijack logged-in users.\n\nSo the answer is: patch, rotate the exposed keys and invalidate sessions, and keep monitoring for abuse.",
    },
    {
      type: "multi",
      prompt:
        "Select every practice that reflects secure TLS deployment as recommended in the Week 7 material.",
      options: [
        "Validate the certificate chain and the hostname on every connection",
        "Protect private keys and automate certificate renewal",
        "Design a custom handshake tuned to the application, since standard TLS wastes time on steps it does not need",
        "Disable obsolete TLS versions and weak cipher suites, and keep the TLS library patched",
        "Treat HTTPS as the whole security strategy, since the other layers duplicate what TLS already provides",
      ],
      correctIndices: [0, 1, 3],
      modelAnswer:
        "Owning a good safe does not help if you leave it open, use the factory combination or never fix the hinge. Secure design needs secure operation.\n\n• Modern versions only: old versions and weak ciphers have known weaknesses, so turn them off.\n\n• Validate properly: check the chain and the hostname, and guard the private key.\n\n• Never invent your own: use established, tested TLS libraries. Also remember that secure communication is only one layer of defence in depth.\n\nSo the answer is: keep TLS current, validate certificates fully, protect keys, and do not roll your own or rely on it alone.",
    },
    {
      type: "mcq",
      prompt:
        "You must log in to your bank while using free Wi-Fi in a cafe.\n\nWhich approach follows the Week 7 guidance?",
      options: [
        "Trust the network if it has a password, because Wi-Fi encryption already protects every site you visit from other guests",
        "Rely on the TCP connection, since reliable acknowledged delivery makes it hard for other guests to change your data",
        "Assume the network is untrusted and rely on correctly validated HTTPS, rather than trusting the Wi-Fi operator to protect you",
        "Skip HTTPS on the login page so the request is faster, since the bank's own servers will protect the data on arrival",
      ],
      correctIndex: 2,
      modelAnswer:
        "You would not shout your PIN across a crowded cafe just because the cafe owner seems friendly. You would whisper in a code only the bank understands.\n\n• The rule: treat any network you do not control as hostile. Your data crosses routers and devices you cannot see.\n\n• What protects you: HTTPS with a certificate the browser validates, so eavesdropping and silent changes fail and the server is verified.\n\n• Why the other options fail: shared passwords do not stop other guests, TCP is not security, and skipping HTTPS exposes the login.\n\nSo the answer is: assume the network is untrusted and rely on correctly validated HTTPS.",
    },
    {
      type: "mcq",
      prompt:
        "A team is configuring how long an idle session stays open before it is closed.\n\nWhich statement about choosing this timeout is correct?",
      options: [
        "Longer is always safer, because a session that never closes cannot be re-established by an attacker",
        "Too short adds overhead because sessions are constantly re-established, and too long is less secure, so a balanced value must be chosen",
        "Shorter is always safer, and the extra re-connection work is a cost that does not need to be considered",
        "The value is fixed by the TCP standard, so it is the same in every context and cannot be configured",
      ],
      correctIndex: 1,
      modelAnswer:
        "A hotel key card that expires after ten seconds means you are always at the front desk. One that works forever means a lost card is a problem for years. You want something sensible in between.\n\n• Too short: overhead, since sessions keep being re-established.\n\n• Too long: the session stays open and usable for longer, which is less secure.\n\n• Configurable: the lecturer noted it can be changed in settings such as TTL, and differs by context.\n\nSo the answer is: neither extreme is good, pick a balance between overhead and security.",
    },
    {
      type: "mcq",
      prompt:
        "In the lecture demo, a scan with nmap -sV -p 3306 reports that the target is running a specific MySQL version.\n\nWhy is that valuable to an attacker?",
      options: [
        "The version flag cracks the database password automatically, so the scan has already given the attacker a working login",
        "The version number reveals the private key of the server, which the attacker can then use to decrypt the traffic",
        "Knowing the exact version lets the attacker search for publicly disclosed vulnerabilities in it and plan an attack; the scan has not itself broken in",
        "It proves the port is safe, since only up-to-date services report their version to a scanner",
      ],
      correctIndex: 2,
      modelAnswer:
        "Reading the make and model of a lock on the door does not open it, but it tells a burglar which known weaknesses to try.\n\n• What the flags do: -p picks the port, -sV asks the service what software and version it is running.\n\n• Why it helps an attacker: many versions have publicly disclosed bugs, so the attacker looks up that version and plans from there.\n\n• Not yet a compromise: getting in still needed a weakness or a cracked password, which the demo showed with a password cracker.\n\nSo the answer is: the version reveals known vulnerabilities to look up, and it is reconnaissance, not access.",
    },
    {
      type: "mcq",
      prompt:
        "On an HTTPS login page, an attacker types admin followed by a single quote and two hyphens as the username, then any password, and is logged in as admin.\n\nWhat explains this and what is the right fix?",
      options: [
        "SQL injection: the two hyphens comment out the rest of the query including the password check; validate and sanitise input on the server",
        "A weak TLS cipher: the attacker downgraded the encryption, so the fix is to disable obsolete TLS versions",
        "A man-in-the-middle attack: the credentials were swapped in transit, so the fix is a longer session timeout",
        "A stolen session cookie: the attacker reused a valid session, so the fix is to rotate the server's private key",
      ],
      correctIndex: 0,
      modelAnswer:
        "A form that says write your name is meant to take a name. If the clerk reads whatever you write as instructions, then writing ignore the rest of this form gets you straight through.\n\n• What happened: the input was placed straight into a database command. The hyphens start a comment, so the password check is ignored.\n\n• Why HTTPS did not help: it protected the request in transit, and the flaw was in how the server used it.\n\n• The fix: input sanitisation, checking whatever is typed before it is used.\n\nSo the answer is: SQL injection, fixed with server-side input validation, not with more transport security.",
    },
    {
      type: "multi",
      prompt:
        "Select every attack that is matched to a defence from the presentation.",
      options: [
        "Man-in-the-middle: input sanitisation on the server",
        "SQL injection: rate limiting the login page",
        "SQL injection: input sanitisation in the code",
        "Phishing and social engineering: staff training, with multi-factor authentication as extra protection",
        "Man-in-the-middle: encryption, so intercepted packets reveal nothing",
        "Denial of service: firewalls and rate limiting",
      ],
      correctIndices: [2, 3, 4, 5],
      modelAnswer:
        "A good defence is chosen for the way the attacker gets in, like locks for doors and smoke alarms for fire. A smoke alarm does not stop a burglar.\n\n• DoS: the trouble is volume, so firewalls and rate limiting.\n\n• MITM: the trouble is a listener on the path, so encryption makes what they capture useless.\n\n• SQL injection: the trouble is untrusted input, so sanitise it. Phishing: the weakest link is people, so train staff and add multi-factor authentication.\n\n• Why the two wrong matches fail: slowing requests does not fix a badly built query, and cleaning input does not hide traffic from a listener.\n\nSo the answer is: match each defence to the way the attack works.",
    },
    {
      type: "mcq",
      prompt:
        "You type https://example.org into a browser.\n\nWhich sequence best describes what happens before the page appears?",
      options: [
        "A TCP connection is opened, the TLS handshake verifies the server and creates keys, and then the HTTP request and response travel encrypted",
        "The TLS handshake verifies the server first, then a TCP connection is opened, and then the encrypted HTTP request is sent",
        "A TCP connection is opened, the HTTP request is sent in plain text, and TLS is switched on only once the page has loaded",
        "The browser sends the HTTP request and the server decides afterwards whether to open a TCP connection and start TLS",
      ],
      correctIndex: 0,
      modelAnswer:
        "You phone a company (that is the connection), ask for proof they are who they say and agree a secret code word (that is the handshake), and only then discuss your account.\n\n• Step one: TCP gives a reliable connection to the server.\n\n• Step two: the TLS handshake verifies the server through its certificate and creates session keys.\n\n• Step three: HTTP requests and responses now travel as encrypted, tamper-checked TLS records. HTTPS is simply HTTP inside TLS on port 443.\n\nSo the answer is: TCP first, then TLS handshake, then protected HTTP.",
    },
  ],
};

export const WEEK_7_PAPERS: ExamPaperSeed[] = [LECTURE_PAPER, LECTURE_PRACTICE_PAPER];
