import type { ExamPaperSeed } from "../types";

const DISCUSSION_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 5,
  paperNumber: 1,
  title: "Week 5 Tutorial: Crypto Basics 2",
  topics:
    "Pre-lecture Ed Discussion prompt: what encryption alone does and does not protect against — confidentiality vs integrity/authenticity, ciphertext malleability, bit-flipping attacks, replay attacks, message forgery without key knowledge, why authenticated encryption (MACs/AEAD) exists. Week 05 Crypto Basics 2 tutorial (Ed Lessons): the opening challenge that encryption alone leaves out integrity and freshness; the bit-flipping exercise on C = M XOR K where the attacker XORs the ciphertext with delta = '1' XOR '9' = 0x08 to turn a decrypted '1' into '9' with no knowledge of the key, plus the pay=100 -> pay=900 extension; cryptographically secure hash function properties (determinism, fixed-length output, pre-image, second pre-image, collision resistance), the pigeonhole/birthday reason collisions must exist yet stay infeasible to find, MD5 (2004 collisions, 2008 rogue CA) and SHA-1 (2017 SHAttered, two PDFs one hash) being broken, Dual_EC_DRBG and the open SHA-3 competition as the argument for public scrutiny over secret design; the three orderings — MAC-then-Encrypt (tampering only caught after decryption, so the system may act on a malicious plaintext), Encrypt-then-MAC (best practice: MAC over the ciphertext, verified before any decryption) and Encrypt-and-MAC (MAC on the plaintext, not bound to the ciphertext); the wrap-up triad that confidentiality hides data, integrity detects unauthorised change and freshness rejects old messages, and secure systems usually need all three",
  sourceFiles: [
    "Ed Discussion — Week 5 pre-lecture prompt",
    "Ed Lessons — Week 05 Crypto Basics 2 tutorial (slides 790735/790736/807392/781132/781134/781135/790954)",
  ],
  questions: [
    {
      type: "scenario",
      prompt:
        "Eve can see your encrypted message go past, but she can't read it and doesn't have the key.\n\nCan she still cause trouble? Think about three things:\n\n• Could she change the encrypted message?\n\n• Could she save a copy and send it again tomorrow?\n\n• Could she make Bob accept something Alice never actually sent?\n\nIf yes, what protection are we missing?",
      modelAnswer:
        "Think of encryption like sealing a note in a locked box. The lock stops Eve reading the note. It does NOT stop her swapping boxes, mailing an old box again, or forging a note.\n\n• Changing the message: with many ciphers, tweaking the locked box in a predictable way makes a predictable change to the note inside — no key needed. Bob opens it and never knows it was touched.\n\n• Sending it again (replay): Eve doesn't even open the box. She copies a real message like \"transfer $100 to Bob\" and mails the exact same bytes tomorrow. Every check passes, so the transfer runs twice.\n\n• Forgery: nothing in the box says \"Alice made this\", so Eve can push through bytes that Bob treats as coming from Alice.\n\n• What's missing: integrity (proof it wasn't changed) and authenticity (proof of who sent it). Encryption only gives secrecy.\n\n• The fix: add a MAC (Message Authentication Code — a tag only someone with the shared secret can make) or use an AEAD mode like AES-GCM that does secrecy + integrity together. To stop replays you also need a nonce, timestamp, or counter the receiver checks.\n\nSo the answer is: yes to all three, and the missing piece is integrity + authenticity, not more encryption.",
    },
    {
      type: "mcq",
      prompt:
        "Alice encrypts a message with a stream cipher (each plaintext bit is XORed with a keystream bit: C = M XOR K). Eve doesn't know the key. She flips one bit of the ciphertext as it goes past. What does Bob get, and what's missing?",
      options: [
        "Bob decrypts a plaintext with exactly that one bit flipped and has no built-in way to notice the change; integrity is the missing property",
        "Bob's decryption fails with an error because altering any ciphertext bit desynchronises the keystream; confidentiality is the missing property",
        "Bob detects the change automatically because stream ciphers append a checksum over the plaintext; no security property is missing here",
        "Bob decrypts the original message unchanged because a single flipped bit is repaired by the cipher's error handling; freshness is missing",
      ],
      correctIndex: 0,
      modelAnswer:
        "Picture the keystream as a mask laid over the message. XOR just lifts the mask back off. If Eve flips ciphertext bit 5, then bit 5 of Bob's decrypted message flips too — nothing else moves.\n\n• Why it happens: flipping a bit of C flips the same bit of M after decryption. The key doesn't stop this and doesn't detect it.\n\n• What Bob sees: a changed message, with no warning at all.\n\n• Why the other options are wrong: XOR stream decryption doesn't \"error out\" on a changed bit; plain stream ciphers don't add a checksum; there's no self-repair.\n\n• The fix: a separate integrity check — a MAC, or an AEAD mode.\n\nSo the answer is: Bob gets a message with that one bit flipped and no alarm — integrity is missing.",
    },
    {
      type: "mcq",
      prompt:
        "In the bit-flipping exercise, the character '1' is the bits 00110001 and '9' is 00111001. The attacker wants a decrypted '1' to come out as '9' instead. What single change to the ciphertext does that?",
      options: [
        "XOR the ciphertext byte that holds the encrypted '1' with 0x08, which is the value of '1' XOR '9'",
        "XOR every ciphertext byte with 0x08 so that the entire keystream is shifted along by one bit position",
        "Overwrite the ciphertext byte that holds the encrypted '1' with 0x39, which is the ASCII code for '9'",
        "XOR the ciphertext byte that holds the encrypted '1' with 0x39, which is the ASCII code for '9'",
      ],
      correctIndex: 0,
      modelAnswer:
        "Line the two characters up. '1' is 00110001, '9' is 00111001. They differ in exactly one spot — the fourth bit from the right. That difference, written as a byte, is 00001000 = 0x08.\n\n• The move: XOR just that one ciphertext byte with 0x08. Because flipping a ciphertext bit flips the matching plaintext bit, the decrypted character changes from '1' to '9'.\n\n• No key needed: the attacker never touches the keystream.\n\n• Why the other options are wrong: XORing every byte scrambles everything else too; writing or XORing 0x39 assumes you know the secret keystream byte, which you don't.\n\nSo the answer is: XOR that one byte with 0x08 (which is '1' XOR '9').",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In the bit-flipping attack on C = M XOR K, the attacker has to work out or guess the secret key K before they can turn a decrypted '1' into a '9'.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False.\n\n• Why: XOR undoes itself. If you XOR the ciphertext with some difference and then decryption XORs the key back off, the key cancels out and you're left with your difference applied to the message. The key never mattered.\n\n• What the attacker DOES need: to know which byte to hit and what's there now, so they can pick the right difference.\n\nSo the answer is: False — no key required, just knowing where and what.",
    },
    {
      type: "mcq",
      prompt:
        "The follow-up exercise: turn an encrypted 'pay=100' into 'pay=900' using the same trick. What does the attacker actually do?",
      options: [
        "Decrypt the ciphertext, edit the digit, and re-encrypt it using a keystream captured from an earlier intercepted message",
        "XOR the whole ciphertext with the ASCII bytes of the string 'pay=900' so the encrypted field is overwritten in place",
        "Truncate the ciphertext right after 'pay=' and append a freshly encrypted '900' block lifted from a different message",
        "XOR the ciphertext byte at the position of the first digit with '1' XOR '9' (0x08), leaving every other ciphertext byte untouched",
      ],
      correctIndex: 3,
      modelAnswer:
        "'pay=100' and 'pay=900' are identical except for the first digit: '1' vs '9'.\n\n• The move: XOR the single ciphertext byte sitting at that first digit with '1' XOR '9' = 0x08. Decryption then produces 'pay=900'.\n\n• Nothing else changes: no key, no decryption, every other byte left alone. It's a precise, targeted edit.\n\n• Why the other options are wrong: they need the key, the keystream, or a matching encrypted block from elsewhere.\n\nSo the answer is: flip that one digit's byte with 0x08, and this is exactly the kind of quiet edit an integrity check is supposed to catch.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: For a bit-flipping attack to land the target bytes on a specific value the attacker chooses, they need to know (or correctly guess) what the original plaintext at that spot was.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True.\n\n• Why: the attack works by applying a known difference — new = old XOR difference. To hit a chosen target, you set difference = old XOR target, and that formula needs the old value.\n\n• Without knowing the old value: you can still scramble those bytes, but you can't steer them to a specific result.\n\nSo the answer is: True — controlled change needs knowledge of what's there; blind change just corrupts.",
    },
    {
      type: "mcq",
      prompt:
        "A payment system encrypts AND adds a MAC to every 'transfer $100 to Bob' message. Eve copies one message off the wire and re-sends the identical bytes a day later. What happens?",
      options: [
        "The MAC check fails because every tag embeds a wall-clock timestamp, so the replayed message is rejected on arrival",
        "Decryption fails because the session key has been rotated since the message was first sent, so nothing is processed",
        "The message verifies and decrypts correctly, so the transfer runs a second time unless freshness is checked separately",
        "The message is quarantined because encrypting the same plaintext twice always yields a detectable duplicate ciphertext",
      ],
      correctIndex: 2,
      modelAnswer:
        "Eve isn't reading or editing anything. She's re-mailing a genuine, correctly-sealed, correctly-tagged letter.\n\n• Why it goes through: every check is designed to pass for a real message — and this IS a real message. So the transfer happens again.\n\n• What a MAC gives you: proof it wasn't changed and proof of who made it. Not proof that it's new.\n\n• The fix for replay: a nonce, timestamp, or sequence number that the receiver actually records and refuses to accept twice.\n\nSo the answer is: it verifies fine and runs again — a MAC alone doesn't stop replay.",
    },
    {
      type: "mcq",
      prompt:
        "A system takes an old encrypted-and-authenticated message that is still perfectly valid, and simply sends it again later. The system can't reject it. Which guarantee is it missing?",
      options: [
        "Confidentiality — the property that keeps the message contents unreadable to anyone who intercepts them",
        "Integrity — the property that lets the receiver detect any alteration made to the message in transit",
        "Authenticity — the property that ties the message to the identity of the party that produced it",
        "Freshness — the property that lets the receiver reject a message it has already seen and accepted before",
      ],
      correctIndex: 3,
      modelAnswer:
        "Run down the checklist for the replayed message:\n\n• Still unreadable to outsiders? Yes — confidentiality is fine.\n\n• Unchanged since it was sent? Yes — integrity is fine.\n\n• Really from the original sender? Yes — authenticity is fine.\n\n• New / not seen before? No — and that's the one thing missing.\n\nThat last property is freshness. Stopping replay needs a nonce, timestamp, or counter.\n\nSo the answer is: freshness.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Adding a MAC to every message gives you integrity, sender authenticity, AND replay protection, all at once.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False.\n\n• What a MAC does give you: proof the message wasn't changed, and proof it came from someone holding the shared secret.\n\n• What it doesn't: a byte-for-byte copy of an old valid message still passes the MAC check.\n\n• Replay protection is separate: a nonce, timestamp, or sequence number.\n\nSo the answer is: False — replay protection is a different tool.",
    },
    {
      type: "mcq",
      prompt:
        "Which property of a secure hash function stops an attacker from working out the original input when all they have is its hash value?",
      options: [
        "Determinism — hashing the same input always produces the very same digest every time",
        "Pre-image resistance — given a digest, finding any input that hashes to it is computationally infeasible",
        "Fixed-length output — every input, short or long, is mapped to a digest of one fixed size",
        "Collision resistance — finding two distinct inputs that share the same digest is computationally infeasible",
      ],
      correctIndex: 1,
      modelAnswer:
        "A hash is a one-way blender. Fruit goes in, smoothie comes out. You can't get the fruit back from the smoothie.\n\n• Pre-image resistance: given the smoothie (the digest), you can't find any fruit (input) that makes it. This is what protects a stored password hash.\n\n• Why the other options don't fit: determinism and fixed-length are just how a hash is shaped; collision resistance is about finding any two inputs that clash, not reversing one specific digest.\n\nSo the answer is: pre-image resistance.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: A hash collision means at least one pair of different inputs shares the same digest — but it does NOT mean finding such a pair is easy or guaranteed for any two inputs you pick.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True.\n\n• Why collisions must exist: there are unlimited possible inputs but only a fixed number of possible digests. Cram infinitely many pigeons into finitely many holes and some holes hold two. That's the pigeonhole idea.\n\n• Why that's still safe: collision resistance is the separate, practical promise that actually finding one takes more computing than anyone has.\n\nSo the answer is: True — they exist by counting, but finding one is meant to be infeasible.",
    },
    {
      type: "short",
      prompt:
        "Explain the difference between second pre-image resistance and collision resistance, and why collisions tend to get broken first in practice (like with MD5 and SHA-1).",
      modelAnswer:
        "Think of it as two different challenges.\n\n• Second pre-image resistance: I hand you a specific document and its hash. You must find a DIFFERENT document with the same hash. The first one is fixed by me.\n\n• Collision resistance: you get to invent BOTH documents yourself, as long as they share a hash. Much more freedom.\n\n• Why collisions fall first: more freedom means less work. For an n-bit hash, a collision takes roughly 2^(n/2) tries (the \"birthday\" effect — matches happen surprisingly fast when you can pick both sides), while a second pre-image takes about 2^n.\n\n• Real examples: MD5 fell to a collision attack in 2004; SHA-1 fell in 2017 (\"SHAttered\" — two different PDFs, one identical SHA-1 hash).\n\nSo the answer is: collision lets the attacker choose both inputs, which is cheaper, so it breaks first.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial's optional reading covers MD5 and SHA-1. What did the 2017 'SHAttered' result show, and what should systems do about it?",
      options: [
        "That SHA-1 digests could be reversed to recover the original input files; the response is to salt every SHA-1 hash before storing it",
        "That MD5 and SHA-1 emit different-length digests, breaking interoperability; the response is to pad both outputs to 256 bits",
        "The first practical SHA-1 collision — two different PDF files with an identical SHA-1 hash; the response is to move to SHA-256 or SHA-3",
        "That SHA-1 leaks the length of its input through timing side channels; the response is to run it inside a constant-time wrapper",
      ],
      correctIndex: 2,
      modelAnswer:
        "Researchers at Google and CWI Amsterdam built two different PDF files that hash to the exact same SHA-1 value — the first time anyone had actually done it.\n\n• What broke: collision resistance. (MD5 had gone the same way in 2004, which let someone forge a trusted certificate in 2008.)\n\n• Why it matters: signatures, certificates, and integrity checks all lean on collision resistance.\n\n• The response: move to SHA-256 (today's default) or SHA-3.\n\nSo the answer is: two different PDFs, same SHA-1 hash — switch to SHA-256 or SHA-3.",
    },
    {
      type: "short",
      prompt:
        "Why does the tutorial mention the NSA-influenced Dual_EC_DRBG generator and the open, multi-year international SHA-3 competition side by side? What principle is it making?",
      modelAnswer:
        "It's a contrast between two ways to build a standard.\n\n• Dual_EC_DRBG: designed with secret input from one agency. Later, researchers showed it could contain a hidden backdoor for anyone who knew certain secret numbers. Trust in secretly-designed crypto took a big hit.\n\n• SHA-3: chosen the opposite way — an open international contest, with years of public attack attempts on every candidate before a winner was picked.\n\n• The principle: crypto should be strong because everyone has tried to break it in the open, not because its design is hidden or because you trust one organisation.\n\n• A fair note: most experts think SHA-1's weaknesses were found by normal research getting better over time, not planted on purpose.\n\nSo the answer is: public scrutiny beats secret design.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial compares three ways to combine encryption and a MAC. What does Encrypt-then-MAC (the recommended one) do, and why is it best?",
      options: [
        "MAC the plaintext, then encrypt the plaintext and its tag together; preferred because the tag then stays hidden inside the ciphertext",
        "Encrypt the plaintext, then MAC the ciphertext, and send ciphertext plus tag; preferred because the receiver verifies the MAC before decrypting anything",
        "Encrypt the plaintext and MAC the plaintext as two independent steps; preferred because the two operations can then run in parallel",
        "Hash the plaintext, encrypt that hash, then MAC the result; preferred because this ordering additionally provides non-repudiation",
      ],
      correctIndex: 1,
      modelAnswer:
        "Picture a sealed parcel with a tamper tag on the OUTSIDE. The courier checks the tag before opening anything.\n\n• The steps: encrypt the message, then compute the MAC over the resulting ciphertext, and send both.\n\n• Why it's best: the receiver checks the tag against the ciphertext first, and only decrypts if it passes. A tampered or fake parcel is thrown out before it's ever opened.\n\n• The other options: putting the tag inside means you must open the parcel to check it (weaker); tagging the plaintext separately doesn't tie the tag to the ciphertext.\n\nSo the answer is: encrypt first, MAC the ciphertext, check the MAC before decrypting.",
    },
    {
      type: "mcq",
      prompt:
        "According to the tutorial, what's the concrete danger with MAC-then-Encrypt?",
      options: [
        "The MAC tag travels in the clear alongside the ciphertext, so an eavesdropper learns whether two messages are identical",
        "Tampering is only detected after the ciphertext has been decrypted, so the system may already have acted on a malicious plaintext",
        "The encryption key and the MAC key are required to be identical, which effectively halves the usable key length",
        "The receiver has to decrypt the message twice — once to obtain the tag and once for the plaintext — doubling the cost",
      ],
      correctIndex: 1,
      modelAnswer:
        "Here the tamper tag is sealed INSIDE the parcel. To check it, you have to open the parcel first.\n\n• The problem: the receiver decrypts, then checks the tag. But decrypting attacker-controlled bytes can already trigger something — the tutorial's example is \"initiating a money transfer\" off a message that later turns out to be fake.\n\n• Encrypt-then-MAC avoids this: check the tag before opening anything.\n\nSo the answer is: you only find out it was tampered with after you've already acted on it.",
    },
    {
      type: "scenario",
      prompt:
        "Alice sends a ciphertext plus a MAC computed over that ciphertext. On the way, Adele flips one bit so the ciphertext arrives slightly different.\n\nWalk through what Bob's Encrypt-then-MAC receiver does. Then say what would have happened instead under MAC-then-Encrypt.",
      modelAnswer:
        "Encrypt-then-MAC (tag on the outside):\n\n• Bob recomputes the MAC over the ciphertext he actually received, using the shared secret.\n\n• The ciphertext changed, so his recomputed tag doesn't match Alice's tag.\n\n• Bob rejects the message and never decrypts it. The bad bytes touch nothing.\n\nMAC-then-Encrypt (tag on the inside):\n\n• The tag is sealed inside, so Bob has to decrypt the altered ciphertext first.\n\n• He then acts on whatever plaintext came out — maybe kicking off a transfer.\n\n• Only after that does he check the tag and discover the problem — too late.\n\nSo the answer is: Encrypt-then-MAC catches it before any decryption; MAC-then-Encrypt catches it only after Bob may have already acted. That's why you verify integrity first.",
    },
    {
      type: "short",
      prompt:
        "The 'explain it simply' wrap-up names three guarantees. Say what confidentiality, integrity, and freshness each do, and give the one-line reason secure systems usually need all three.",
      modelAnswer:
        "Three separate jobs:\n\n• Confidentiality: hides the contents so someone who intercepts the message can't read it.\n\n• Integrity: lets the receiver spot any change made to the message on the way.\n\n• Freshness: lets the receiver reject a message it has already seen (a replayed old-but-valid message).\n\n• Why you need all three: each tool only covers its own job. Encryption alone gives just confidentiality. A MAC adds integrity and authenticity but not freshness. A nonce or counter adds freshness. A system that must resist reading, tampering, AND replay has to stack all three.\n\nSo the answer is: they're independent, so you combine them.",
    },
    {
      type: "short",
      prompt:
        "A file is sent with its SHA-256 hash attached so the receiver can 'check integrity'. Explain why this doesn't stop a real attacker, and what a keyed approach uses instead.",
      modelAnswer:
        "A plain hash is a fingerprint anyone can take — there's no secret in it.\n\n• The hole: an attacker who can change the file in transit just replaces BOTH the file and its attached hash with a matching pair. The receiver recomputes the hash, it matches the (also-swapped) one, and nothing looks wrong.\n\n• What a plain hash IS good for: catching accidental corruption, like a bad download — not a deliberate swap by someone who controls the channel.\n\n• The fix: a keyed tag — a MAC/HMAC made with a secret the attacker doesn't have — or a digital signature. Now the receiver is checking something only the real sender could have produced.\n\nSo the answer is: anyone can redo a plain hash, so an active attacker swaps both; use a keyed MAC or a signature.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 5,
  paperNumber: 2,
  title: "Week 5 Lecture Practice Paper",
  topics:
    "Cryptography basics part 2 (Week 5 lecture): the journey from the theoretical ideal to practical, computational cryptography and then beyond confidentiality to trust. From perfect secrecy — recapping the one-time pad's four strict conditions (truly random, same length as the message, kept secret, used once) and its practical cost (a message-sized fresh key that must be distributed, stored, protected and destroyed, so key management, not the XOR, is the hard part). The shift to semantic security: instead of asking whether a ciphertext can leak absolutely nothing, asking whether any efficient (computationally bounded) attacker can learn anything useful. How a short key protects a long message: a pseudo-random generator stretches the key into a long keystream, stream ciphers and keystreams, block ciphers and modes, and why keystream/key reuse and weak composition leak. Beyond confidentiality: Attack 1 (message modification, ciphertext malleability, bit-flipping — encryption gives confidentiality, not integrity); Attack 2 (replay/forgery/imitation — a replay needs neither reading nor modifying the message, and encryption does not prove a message is fresh); integrity vs freshness as two distinct missing guarantees. Hashes as fingerprints: deterministic, fixed-length, one-way; avalanche effect; hashing is not encryption and has no decryption key; the Merkle-tree idea of one authenticated root digest over many files. Why a plain hash is not enough: an active attacker replaces both the message and its hash. Cryptographic hash security goals: pre-image, second-pre-image and collision resistance (and the birthday bound ~2^(n/2) from the extra resources); choosing a hash today (avoid MD5/SHA-1, SHA-256 default, SHA-3 modern alternative); why hashing a human password does not create a high-entropy key (use a CSPRNG; use a KDF for password storage); hashing for proof-of-work (expensive to find, cheap to verify). MAC/HMAC: a digest with a shared secret key giving integrity plus sender authenticity between key holders; KeyGen/Tag/Verify; accept/reject cases; modify vs forge; HMAC as a construction not naive hash(key||message); MAC detects tampering but not replay (needs a nonce, timestamp or sequence number); MAC does not give public verification. Digital signatures: private signing key and many public verification keys, sign H(M) with SK and verify with PK, what signatures provide (integrity, origin authentication, public verifiability, non-repudiation support) and what they do not (they do not encrypt — signing is not 'encrypting with a private key'); trusting the public key is a binding problem (certificates, CAs, public-key directories, known SSH host keys, fingerprints), connecting back to the Week 4 man-in-the-middle/key-substitution problem. Comparing the four tools (hash, MAC, digital signature, AEAD) by goal, the secure software update create-sign-verify flow, and the closing frame: modern cryptography is the right guarantee for the right threat model — when you see a security problem, ask first what guarantee is missing. Lecture-recording additions (not in the slide deck): the CIA-triad framing that Week 4 delivered confidentiality and Week 5 adds integrity, with availability still uncovered so the security model is deliberately incomplete; why naming an algorithm ('we use AES-256') is not by itself strong security without the whole security primitive (key generation, true randomness, key sharing, key storage, choice of MAC and authentication); the credit-card-digits-split-across-channels analogy for semantic security and partial-information leakage; a man-in-the-middle who cannot read the traffic substituting a wholly new ciphertext under the same encryption scheme, stopped by origin authentication rather than confidentiality; distinguishing a confidentiality attack (break/decrypt) from an integrity attack (alter/forge without reading); the Weeks 1-3 recap (cyber world, AI in offensive vs defensive security, Week 2 phishing/ransomware/social engineering, Week 3 mobile security and hard-coded secrets in decompiled APKs) and how a hard-coded secret is a key-management failure; SHA-256 vs SHA-3 as an application-dependent performance trade-off; non-repudiation illustrated by a vendor unable to disown a botched signed update; HMAC as 'Hash-based Message Authentication Code'; the Encrypt-then-MAC ordering; and the closing frame that a security professional's job is to choose a fit-for-purpose security model, since there is no single right option.",
  sourceFiles: [
    "lecture/Week05-Cryptography basics part 2.pdf",
    "lecture/INFO5995_Week_5_Extra_Resources.pdf",
    "lecture/Week 05 - Introducti-s1-low.transcript.md",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "A one-time pad only delivers its \"the ciphertext tells you nothing about the message\" promise when four strict rules all hold. Which option lists them correctly?",
      options: [
        "The key comes from a CSPRNG, is at least as long as the message, is held in a hardware security module, and is rotated after a set number of uses",
        "The key is truly random, is deliberately shorter than the message to stay practical to distribute, is kept secret, and is changed on a fixed schedule",
        "The key is truly random, is exactly the same length as the message, is kept secret by both parties, and is used only once and then destroyed",
        "The key is derived by hashing the message, is the same length as the digest, is kept secret, and is combined with a fresh per-message public nonce",
      ],
      correctIndex: 2,
      modelAnswer:
        "The one-time pad is the \"perfect\" cipher, but only under four unforgiving conditions:\n\n• Truly random key — not \"looks random\", actually random.\n\n• Same length as the message — a 1 MB message needs a 1 MB key.\n\n• Kept secret — obviously.\n\n• Used once, then destroyed — reuse instantly breaks it.\n\n• Why the other options are wrong: a key from a generator that's \"at least as long\" and rotated is practical key management, not the pad's definition; a key shorter than the message, or one made by hashing the message, breaks the same-length and true-randomness rules.\n\nSo the answer is: truly random, same length as the message, secret, used once.",
    },
    {
      type: "mcq",
      prompt:
        "\"Perfect Secrecy Has a Practical Cost\" uses a 1 GB message. According to the slide, what's the genuinely hard part of actually using a one-time pad?",
      options: [
        "Managing the key: a fresh 1 GB secret must be distributed safely beforehand, stored and protected at full message size, and destroyed so that it is never reused",
        "Running the XOR: combining a 1 GB key with a 1 GB message byte by byte is too slow for real-time systems and needs dedicated accelerator hardware to keep up",
        "Proving randomness: certifying that a 1 GB key is genuinely random needs statistical testing that itself takes longer than simply sending the message would",
        "Choosing the mode: turning a 1 GB pad into a secure keystream without any repeated blocks is the step that most real implementations get subtly wrong",
      ],
      correctIndex: 0,
      modelAnswer:
        "The maths of a one-time pad is trivial — it's just XOR. The pain is everything around the key.\n\n• A 1 GB message needs a fresh 1 GB secret key.\n\n• You have to get that huge key to the other person safely, before you talk.\n\n• You have to store and protect a message-sized pile of secret bytes.\n\n• You have to destroy it afterwards so it's never reused.\n\n• The slide says it outright: \"the hard part is not the XOR operation. The hard part is managing the key.\"\n\nSo the answer is: distributing, storing, protecting, and destroying a message-sized key.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture stops asking \"Can the ciphertext leak absolutely nothing?\" and asks instead \"Can any realistic attacker learn anything useful?\". What's this weaker-but-achievable goal called, and what does it demand?",
      options: [
        "Perfect secrecy: it demands that the ciphertext distribution is statistically independent of the plaintext even for an adversary with unlimited computing power",
        "Semantic security: it demands that no efficient, computationally bounded attacker can learn significant information about the plaintext from the ciphertext alone",
        "Ciphertext indistinguishability: it demands that the key be replaced after every message so that no two ciphertexts are ever produced under the same keystream",
        "Authenticated encryption: it demands that every ciphertext carry a tag so a tampering attacker cannot learn anything from observing how the receiver reacts",
      ],
      correctIndex: 1,
      modelAnswer:
        "Perfect secrecy is an impossible-in-practice ideal: leak nothing, ever, even to an attacker with infinite computing power. Only the one-time pad hits it, at huge cost.\n\n• Semantic security is the realistic version: no efficient attacker (one with normal, limited computing power) can learn anything meaningful from the ciphertext.\n\n• The trade: we accept the ciphertext might leak trivia (like its length) as long as nothing useful leaks to a real-world attacker.\n\n• Why the other options are wrong: perfect secrecy is the thing we're replacing; the others describe different mechanisms.\n\nSo the answer is: semantic security — no efficient attacker learns anything significant.",
    },
    {
      type: "mcq",
      prompt:
        "\"How can a short key protect a long message?\" is the lecture's central question for moving from theory to usable encryption. What mechanism does it give?",
      options: [
        "The short key is split into equal pieces and each piece encrypts one block of the message independently, so a short key still covers the whole message",
        "The short key is re-agreed with Diffie-Hellman once per message block, so a fresh short key ends up protecting every separate part of the long stream",
        "The message is compressed until it is no longer than the key, then combined with the key a single time, so a short key is always long enough after compression",
        "A pseudo-random generator stretches the short key into a long keystream, and a stream cipher combines that keystream with the message to protect it",
      ],
      correctIndex: 3,
      modelAnswer:
        "A one-time pad needs a key as long as the message. That's the deal-breaker. The fix: don't ship a long key — grow one.\n\n• A pseudo-random generator (PRG) takes one short secret and stretches it into a long, random-looking keystream.\n\n• A stream cipher then XORs that keystream with the message.\n\n• This is what makes practical (computational) encryption possible where a true one-time pad isn't.\n\n• Why the other options are wrong: splitting a short key, re-running key exchange per block, or compressing the message all miss the actual mechanism.\n\nSo the answer is: a PRG stretches the short key into a long keystream.",
    },
    {
      type: "mcq",
      prompt:
        "In \"Attack 1: Message Modification\", Eve can't read Alice's message but changes the ciphertext 1001 to 1101, and Bob decrypts it with \"No warning\". What does this show?",
      options: [
        "That the cipher was used in ECB mode, since only ECB lets an attacker alter content undetected, whereas a chained mode such as CBC would fail to decrypt at all",
        "That encryption provides confidentiality but not integrity: a malleable ciphertext lets an attacker cause a controlled change to the plaintext without the key",
        "That Alice reused a keystream, since bit-flipping only works when the same key bits already encrypted an earlier message that Eve had previously captured",
        "That Bob skipped the key-exchange step, since an authenticated Diffie-Hellman handshake would have bound the ciphertext to Alice and rejected the altered bits",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide caption says it plainly: \"Encryption provides confidentiality, but does not automatically guarantee integrity.\"\n\n• What happened: Eve flipped a ciphertext bit (1001 -> 1101). Bob decrypted the changed message and got no alert, because nothing checks that the ciphertext arrived untouched.\n\n• This is the Week 5 pre-lecture point: an attacker who can't decrypt can still change the message.\n\n• The fix: a MAC or an AEAD mode — not a different cipher mode, not a key exchange.\n\nSo the answer is: encryption gives secrecy, not integrity, and a malleable ciphertext lets Eve make a controlled change with no key.",
    },
    {
      type: "mcq",
      prompt:
        "\"A replay attack does not require the attacker to understand or modify the message.\" In the lecture's \"extend the deadline\" example, how does Eve attack, and what's missing?",
      options: [
        "Eve decrypts the captured message, edits the deadline, re-encrypts it under the same key and resends it; the guarantee missing here is confidentiality",
        "Eve forges an entirely new ciphertext that decrypts to a valid-looking instruction; the guarantee missing here is collision resistance of the hash in use",
        "Eve records one valid encrypted message and sends the exact same bytes to Bob again later; the guarantee missing here is freshness (that a message is new)",
        "Eve substitutes her own public key during setup so Bob encrypts to her instead; the guarantee missing here is peer authentication during the handshake",
      ],
      correctIndex: 2,
      modelAnswer:
        "Eve doesn't touch the message at all.\n\n• The move: record one valid encrypted message, then send the identical bytes to Bob again later. Bob's system accepts it a second time (\"Accepted again\").\n\n• The slide: \"Encryption protects confidentiality but does not prove that a message is new.\"\n\n• What's missing: freshness. A nonce, timestamp, or sequence number is what actually catches a replay.\n\nSo the answer is: she re-sends the exact same captured bytes, and freshness is missing.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: According to \"Attack 1: Message Modification\", encrypting a message automatically guarantees that Bob will detect any change made to it in transit.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False.\n\n• The slide caption: \"Encryption provides confidentiality, but does not automatically guarantee integrity.\"\n\n• In the example, Eve flips a bit (1001 -> 1101) and Bob decrypts it with \"No warning\".\n\n• Detecting changes needs a separate tool — a MAC or an AEAD mode. Plain encryption doesn't include one.\n\nSo the answer is: False.",
    },
    {
      type: "mcq",
      prompt:
        "A live demo shows SHA-256(\"hello\") and SHA-256(\"hell0\") producing completely unrelated digests. Which hash property is this, and what does it let Bob do?",
      options: [
        "The avalanche effect: a tiny input change should cause a widespread, unpredictable output change, so any edit to the message is obvious in the digest",
        "One-wayness: because a digest cannot be reversed, a changed input must yield an unrelated digest, which is what lets Bob recover Alice's original message",
        "Fixed-length output: because every input maps to the same digest size, a single-character change is forced to spread itself across the whole digest",
        "Collision resistance: because no two inputs can share a digest, \"hello\" and \"hell0\" must differ everywhere, which is what lets Bob confirm the sender's identity",
      ],
      correctIndex: 0,
      modelAnswer:
        "Change one letter, and the whole digest looks totally different — no resemblance to the old one.\n\n• This is the avalanche effect: a tiny input change should cause a huge, unpredictable output change.\n\n• What it buys Bob: he recomputes the digest, and any edit — even one character — jumps out immediately. A hash makes a great change detector.\n\n• What it does NOT do: reverse the hash, or prove who sent the message.\n\nSo the answer is: the avalanche effect, which makes any modification obvious.",
    },
    {
      type: "mcq",
      prompt:
        "\"What Should a Cryptographic Hash Make Hard?\" lists three attacker goals. Which option matches every name to the right definition?",
      options: [
        "Pre-image: find any x ≠ y with h(x) = h(y); second-pre-image: given h(x) recover x; collision: given x, find a different x' with the same hash value",
        "Pre-image: given x, find x' ≠ x with h(x') = h(x); second-pre-image: find any two colliding inputs; collision: given a digest, recover its original input",
        "Pre-image: given x and h(x), recover the key; second-pre-image: find x' ≠ x with h(x') = h(x); collision: given h(x), recover x without knowing the key",
        "Pre-image: given h(x), find x; second-pre-image: given x, find a different x' with h(x') = h(x); collision: find any x ≠ y with h(x) = h(y)",
      ],
      correctIndex: 3,
      modelAnswer:
        "Three challenges, from the slide:\n\n• Pre-image resistance: you're given a digest, find any input that produces it. (Reverse the blender.)\n\n• Second-pre-image resistance: you're given one specific input, find a DIFFERENT input with the same digest. The first one is fixed.\n\n• Collision resistance: find ANY two different inputs that share a digest — you choose both.\n\n• The key distinction: second-pre-image locks one input in advance; a collision lets you pick both freely (which is why it's easier).\n\nSo the answer is: pre-image = given digest find input; second-pre-image = given input find another with same hash; collision = find any clashing pair.",
    },
    {
      type: "mcq",
      prompt:
        "\"Which Hash Would You Choose Today?\" for a general cryptographic hash in a new system. What does the slide advise?",
      options: [
        "Avoid MD5 and SHA-1 (broken collision resistance); SHA-256 is a good widely-supported default, and SHA-3 is a good modern alternative from a different design family",
        "Use MD5 for non-security checksums, SHA-1 for signatures, SHA-256 for passwords, and hold SHA-3 back until it finishes its standardisation process in a few years",
        "Prefer SHA-1 over SHA-256 because it is faster and keeps full pre-image resistance; keep SHA-3 in reserve as a future option that is not yet production-ready",
        "Treat all four as acceptable for a new system, because only pre-image resistance matters here and MD5, SHA-1, SHA-256 and SHA-3 all still provide that property",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide's shortlist:\n\n• MD5 — do not use. Broken collision resistance.\n\n• SHA-1 — do not use. Broken collision resistance.\n\n• SHA-256 — good default. Widely supported.\n\n• SHA-3 — good alternative. Different design family, and (the slide is firm on this) already standardised, not \"just for the future\".\n\nSo the answer is: skip MD5/SHA-1, default to SHA-256, SHA-3 is a fine modern alternative.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: The Week 5 extra-resources note says that for an n-bit hash, collision attacks relate to the birthday effect, so collision resistance is roughly 2^(n/2) work rather than 2^n.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True.\n\n• The birthday effect: in a room of just 23 people, two probably share a birthday — matches happen far sooner than you'd guess when any pair counts.\n\n• Same for hashes: finding any two inputs that collide takes about 2^(n/2) tries for an n-bit hash, not 2^n.\n\n• Consequence: to get 128-bit collision strength you need a 256-bit hash.\n\nSo the answer is: True.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: \"Which Hash Would You Choose Today?\" presents SHA-3 as a good, already-standardised modern alternative to SHA-256, not merely a future option.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True.\n\n• The slide marks SHA-3 \"Good alternative — Different design family\" and adds, in as many words: \"Do not label SHA-3 as merely 'future'. It is already a standardised modern option.\"\n\n• The two marked \"Do not choose\" are MD5 and SHA-1, for broken collision resistance.\n\nSo the answer is: True.",
    },
    {
      type: "mcq",
      prompt:
        "\"MAC Idea: A Digest With a Secret Key\". Compared with sending a plain hash next to a message, what does adding a shared secret key K to the tag change?",
      options: [
        "It also hides the message contents, because the same key K that produces the tag T encrypts M, delivering confidentiality and integrity together in a single pass",
        "It lets any member of the public verify the tag, because K is published next to the message so that anyone at all can recompute T and confirm that it matches",
        "Only someone who knows K can produce a tag that verifies, so Eve cannot alter or forge M undetected: it adds integrity and sender authenticity between key holders",
        "It makes the tag reject replayed messages, because every tag is bound to a fresh per-message key, so an old message with its old tag will no longer verify later on",
      ],
      correctIndex: 2,
      modelAnswer:
        "A plain hash is a wax stamp anyone can buy. A MAC is a stamp only you and your friend own.\n\n• Effect: only someone who knows the shared secret K can make a tag that checks out. Eve, without K, can't alter or forge the message without the tag failing.\n\n• What it gives: integrity (not changed) plus sender authenticity (came from a key holder) — but only among the people who share K.\n\n• What it does NOT give: it doesn't hide the message, it doesn't let the general public verify, and it doesn't stop a replay of an unchanged message.\n\nSo the answer is: only a key holder can make a valid tag, so it adds integrity + sender authenticity.",
    },
    {
      type: "mcq",
      prompt:
        "\"Why MAC is not enough for public verification\" uses a software update that millions of users must check, from one publisher. Why can't the publisher just share one MAC key with everyone?",
      options: [
        "Because a single MAC key long enough for millions of users would exceed practical key-length limits, so the resulting tag would be too large to attach to each update",
        "Because anyone who holds the shared key can also create valid tags, so a malicious user with that key could tag a fake update that every other user then accepts",
        "Because MAC verification is far too slow to run on millions of user devices, so most clients would skip the check and install the update without verifying it at all",
        "Because the MAC key would need redistributing after every update, and any user who missed a rotation would then reject the genuine update as though it were a forgery",
      ],
      correctIndex: 1,
      modelAnswer:
        "A MAC key both MAKES tags and CHECKS tags — same key, both directions.\n\n• The problem: give that key to a million users so they can check updates, and every one of them can also produce valid tags.\n\n• So one malicious user (or anyone who rips the key out of a client app) can tag a fake update that everyone else's software happily accepts.\n\n• The slide: \"Public verification breaks this model.\" You need a digital signature — publisher keeps a private signing key, ships only a public key that can check but never forge.\n\nSo the answer is: whoever can verify can also forge, so a shared key can't do public one-to-many verification.",
    },
    {
      type: "mcq",
      prompt:
        "How is a digital signature's key setup different from a MAC's, and why does that matter for software updates and certificates?",
      options: [
        "Both use a shared secret, but a signature's key is longer; updates use signatures only because the longer key resists brute force better than a short MAC key does",
        "A signature uses no key at all — it is just a hash of the message — so updates use it because there is then no key to distribute or to keep secret from the users",
        "A signature uses one private signing key and many public verification keys, so only the owner can sign but anyone can verify — the model that public distribution needs",
        "A signature uses one shared secret for signing and a different shared secret for verifying, so two closed groups can check each other's updates without sharing one key",
      ],
      correctIndex: 2,
      modelAnswer:
        "A MAC has one shared secret that does everything. A signature splits it in two.\n\n• Private signing key: the owner keeps it, never shares it. Only they can sign.\n\n• Public verification key: handed out to everyone. Anyone can check a signature; nobody can forge one with it.\n\n• Why it matters: software updates, app packages, and certificates are all \"one signer, millions of checkers, no shared secret\" — exactly what the signature model is built for.\n\nSo the answer is: one private key signs, many public keys verify — the model public distribution needs.",
    },
    {
      type: "mcq",
      prompt:
        "Put the digital signature steps in the order the lecture gives them, using Alice's private key SK_A and public key PK_A.",
      options: [
        "Encrypt M with PK_A → send the ciphertext → Alice decrypts with SK_A to sign it → Bob re-encrypts the message to check the signature matches",
        "Sign M directly with PK_A → hash the resulting signature → send M with that hash → Bob verifies by signing the hash again using SK_A",
        "Hash M → sign the digest with PK_A → send M and S together → Bob verifies with SK_A, accepting only when the message and signature match",
        "Hash M → sign the digest with SK_A to get S → send M and S together → Bob verifies with PK_A, rejecting if either M or S was changed",
      ],
      correctIndex: 3,
      modelAnswer:
        "From the slide, four steps:\n\n• Hash the message -> H(M).\n\n• Sign the digest with the PRIVATE key -> S = Sign(SK_A, H(M)).\n\n• Send M and S together.\n\n• Verify with the PUBLIC key -> Verify(PK_A, M, S). Accept only if the message and signature match; changing either one breaks it.\n\n• The rule to remember: private key signs, public key verifies — never the other way around.\n\nSo the answer is: hash, sign with SK_A, send M+S, verify with PK_A.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: According to \"What signatures provide and what they do not\", putting a digital signature on a message also keeps its contents secret from anyone who intercepts it.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False.\n\n• The slide: \"Signing does not encrypt the message. Anyone who receives the message can still read it unless encryption is also used.\"\n\n• Also: \"Do not describe digital signing as 'encrypting with a private key'.\"\n\n• Clean mental model: encrypt to hide; sign to prove who sent it and catch changes.\n\nSo the answer is: False — a signature proves origin, it doesn't hide anything.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture ties digital signatures back to the Week 4 man-in-the-middle problem: \"Eve may not break the algorithm; she may replace the key.\" What problem does a mathematically valid signature still NOT solve?",
      options: [
        "That the signature could still be replayed later, since a bare signature carries no timestamp and Bob cannot tell an old signed message apart from a brand-new one",
        "That a valid signature only proves control of some private key; Bob still needs a trusted way to bind that public key to Alice's identity, or he just accepts Eve's key",
        "That the hash inside the signature could have a collision, letting Eve find a second message with the same digest that still verifies under Alice's real public key",
        "That signing does not hide the message, so Eve can still read the signed content in transit even though she is unable to change it without breaking verification",
      ],
      correctIndex: 1,
      modelAnswer:
        "A valid signature proves \"whoever made this holds the private key that matches this public key\". It does NOT prove whose key it is.\n\n• The attack: Eve swaps the public key Bob stores (PK_A -> PK_E). Now everything Eve signs verifies perfectly against the key Bob trusts.\n\n• The slide: \"Trust is a binding problem, not only a mathematics problem.\"\n\n• The fix: bind the public key to a real identity with a certificate, a certificate authority, a pinned key, or a fingerprint checked through a separate trusted channel.\n\n• It's the same key-substitution attack as unauthenticated Diffie-Hellman in Week 4.\n\nSo the answer is: a signature proves control of a key, not whose key it is — you still need trusted key-to-identity binding.",
    },
    {
      type: "mcq",
      prompt:
        "\"Compare the four tools\" summarises Hash, MAC, Digital signature and AEAD by what each provides. Which row is stated correctly?",
      options: [
        "MAC: shared-secret key, provides confidentiality, gives integrity and authenticity between key holders, and additionally supports public verification by any recipient",
        "Hash: no key, provides confidentiality, gives change detection only, and cannot be recalculated by an attacker who does not already have the original input to hand",
        "AEAD: shared-secret key, provides confidentiality, gives integrity and authenticity between key holders, but does not provide public verification of the sender",
        "Digital signature: private/public key pair, provides confidentiality, gives integrity and authenticity, and supports public verification of who produced the signature",
      ],
      correctIndex: 2,
      modelAnswer:
        "Quick grid from the slide:\n\n• Hash — no key, no secrecy, change-detection only, anyone can recompute it.\n\n• MAC — shared secret, no secrecy, integrity + authenticity between key holders, no public verification.\n\n• Digital signature — private/public pair, no secrecy, integrity + authenticity, YES public verification.\n\n• AEAD — shared secret, YES secrecy, integrity + authenticity between key holders, no public verification.\n\n• The wrong options add confidentiality or public verification to tools that don't have it. Only the AEAD row here is right.\n\nSo the answer is: AEAD — shared key, gives confidentiality + integrity/authenticity, no public verification.",
    },
    {
      type: "short",
      prompt:
        "Using the \"Eve replaces both the message and the hash\" scenario, explain what a plain hash does and doesn't prove, and exactly what the shared secret key in a MAC adds.",
      modelAnswer:
        "A plain hash is a fingerprint: recompute it, compare, and you can tell whether the data changed.\n\n• The hole: a plain hash has NO secret, so anyone can compute it. An active attacker who swaps message M for M' also computes h(M') and sends that pair. Bob's check passes and \"Bob is fooled\".\n\n• What the plain hash actually proved: only that the message matches the digest — not who made it.\n\n• What a MAC adds: the tag is T = MAC(K, M), where K is a secret only Alice and Bob share. Eve can copy or alter the packet but can't produce a valid replacement tag without K, so any change to M or any forged tag fails verification.\n\n• Net effect: a check anyone could redo becomes one only a key holder can produce — that's integrity plus sender authenticity between the two parties. Still no confidentiality, no public verification, no replay protection.\n\nSo the answer is: a plain hash only proves consistency and collapses if the attacker rewrites both; the shared key makes the tag unforgeable.",
    },
    {
      type: "short",
      prompt:
        "The Week 5 HMAC activity concludes: \"HMAC detects tampering, but replay protection needs a nonce, timestamp or sequence number.\" Explain why a correct MAC still doesn't stop a replay, and what does.",
      modelAnswer:
        "A MAC answers one question: \"was this exact message made by a key holder, and is it unchanged?\"\n\n• Why replay still works: if Eve records a genuine message M with its valid tag T and later re-sends the identical bytes, nothing about M or T has changed — so the check returns \"accept\" a second time.\n\n• The activity shows this: change \"1 day\" to \"7 days\" and keep the old tag -> rejected. Re-send the original M + T untouched -> accepted again.\n\n• Freshness is a separate guarantee from integrity/authenticity.\n\n• What actually stops replay: something that makes each message unique and checkable as new — a nonce (a number used once), a timestamp, or a sequence number — that the receiver records and won't accept twice.\n\nSo the answer is: a replayed message is unchanged, so it passes the MAC; you need a nonce/timestamp/counter for freshness.",
    },
    {
      type: "short",
      prompt:
        "In the mini puzzle, the sender must find x so that hash(\"send email\" + x) starts with 000000, while the verifier just checks one hash. Explain why finding x is expensive but verifying is cheap, and which hash properties force a brute-force search.",
      modelAnswer:
        "Verifying is trivial:\n\n• Glue the known string to the claimed x, hash it once, and check whether the digest starts with the required zeros. One computation, always the same result.\n\nFinding x is slow:\n\n• There's no shortcut to a digest with a chosen prefix. The hash is one-way (pre-image resistance — you can't work backwards from an output), and it has strong avalanche (a tiny change in x gives a totally unrelated digest).\n\n• So the sender can't nudge x toward a good digest. They can only try loads of x values and hash each until one lands in the tiny slice of outputs starting with 000000.\n\nSo the answer is: no way to aim, so you brute-force — expensive to find, cheap to verify. (This is how proof-of-work is built.)",
    },
    {
      type: "short",
      prompt:
        "Describe the secure software-update process from the lecture (create-and-sign, then verify), and say which question each piece answers: the hash, the digital signature, and the certificate / trusted key record.",
      modelAnswer:
        "Create and sign (developer):\n\n• Take the update file M, compute H(M), then S = Sign(private key, H(M)). Publish the update file plus the signature. The private signing key never leaves the developer.\n\nVerify (user's device):\n\n• Download M + S, recompute H(M), run Verify(public key, M, S). Valid -> install. Modified or fake -> fails, rejected before install.\n\nWhat each piece answers:\n\n• The hash answers \"Did the data change?\"\n\n• The digital signature answers \"Does this verify under this public key?\" — giving integrity, proof of origin, and public verifiability so millions can check without any shared secret.\n\n• The certificate / trusted key record answers \"Whose public key is this?\" — binding the key to the real developer so Eve can't slip her own key in.\n\nSo the answer is: hash = changed?, signature = who signed it (checkable by anyone), certificate = is this really their key.",
    },
    {
      type: "short",
      prompt:
        "The slide \"Does Hashing a Human Password Create a Strong Random Key?\" shows SHA-256(\"password123\") producing random-looking output. Explain why this isn't a strong cryptographic key (link it to key length vs key entropy from Week 4), and say what to do instead.",
      modelAnswer:
        "The digest is 256 bits and looks like noise — but \"looks random\" is not \"is unpredictable\".\n\n• A hash is deterministic. It spreads the input bits across a fixed-size output but can't add unpredictability that wasn't in the input.\n\n• \"password123\" is a weak, guessable input. So SHA-256(\"password123\") is just as guessable — an attacker hashes candidate passwords until one matches.\n\n• Week 4's point: key strength is about entropy (how unpredictable it really is), not length (how many bits it takes up). A full-length key built from a weak secret is still weak.\n\n• What to do: for a cryptographic key, generate the randomness directly with a CSPRNG. For storing passwords, use a deliberately slow password hash / KDF — Argon2id, scrypt, bcrypt, or PBKDF2 — not raw SHA-256.\n\nSo the answer is: hashing doesn't create entropy, so a hashed weak password is still weak — use a CSPRNG for keys, a KDF for password storage.",
    },
    {
      type: "short",
      prompt:
        "A teammate says: \"We protect the download with AES-GCM, so integrity and authenticity are already handled — we don't need signatures.\" Using \"Compare the four tools\" and \"Why MAC is not enough for public verification\", explain what AEAD does and doesn't give a public software-update channel, and what's actually needed.",
      modelAnswer:
        "AEAD (AES-GCM, ChaCha20-Poly1305) bundles confidentiality with integrity and authenticity — but only \"between key holders\".\n\n• Its key model is a shared secret, and its guarantee only holds while that secret stays secret from attackers.\n\n• For a public download where millions must verify an update from one publisher, giving everyone the AEAD (or MAC) key means any holder — including a malicious user — can produce a valid-looking authenticated update. \"Public verification breaks this model.\"\n\n• What's actually needed: public verification. The developer signs H(M) with a private key that's never shared; users verify with the developer's public key; that key's identity is pinned by a certificate or trusted key record.\n\n• AEAD can still protect the transport (like TLS). It doesn't replace the signature.\n\nSo the answer is: AEAD secures a channel between people who share a key; a one-to-many public update needs a digital signature on top.",
    },
    {
      type: "scenario",
      prompt:
        "Alice sends the ciphertext 1001 to Bob over a link Eve fully controls. Eve flips one bit so Bob gets 1101, and Bob's system decrypts it with no warning.\n\nWalk through why encryption alone allowed this, which security property is missing, and what would have caught it.",
      promptDiagram:
        "flowchart LR\n  A[\"Alice sends<br/>ciphertext 1001\"] --> E[\"Eve flips one bit<br/>1001 → 1101\"]\n  E --> B[\"Bob receives 1101<br/>decrypts, no warning\"]",
      modelAnswer:
        "Why it happened:\n\n• Encryption gave Alice confidentiality — Eve can't read what's behind 1001. It gave nothing else.\n\n• The cipher is malleable: a predictable change to the ciphertext makes a predictable change to the decrypted message. So Eve flips a bit (1001 -> 1101) with no key and no idea what the message says.\n\n• Bob decrypts whatever comes out and has no check that tells him it was touched — \"No warning\".\n\nWhat's missing:\n\n• Integrity (proof it wasn't changed). If Eve had instead re-sent an old capture, freshness would be missing too.\n\nWhat would have caught it:\n\n• Attach a tag T = MAC(K, ciphertext) with a shared secret, or use an AEAD mode like AES-GCM. Any change to the ciphertext makes verification fail before Bob acts.\n\nSo the answer is: a malleable cipher plus no integrity check let Eve make a silent change — a MAC or AEAD stops it.",
    },
    {
      type: "scenario",
      prompt:
        "Alice and Bob share a secret key K. Show what Alice sends with her message, what Bob does when it arrives, and give Bob's decision (accept or reject) for each of the three \"MAC Check\" cases:\n\n(A) M and its tag T arrive unchanged\n\n(B) M is changed and the old T is replayed\n\n(C) a brand-new fake M and fake T are made without K",
      promptDiagram:
        "flowchart LR\n  K[\"Shared secret K\"] --> T\n  M[\"Message M\"] --> T[\"T = MAC(K, M)\"]\n  T --> S[\"Send (M, T)\"]\n  S --> V[\"Bob recomputes MAC(K, M)<br/>accept only if it equals T\"]",
      modelAnswer:
        "Alice computes T = MAC(K, M) and sends (M, T). Bob recomputes MAC(K, M) from the M he received and his own copy of K, and accepts only if it equals the T he received.\n\n• Case A — M and T unchanged: recomputed tag matches T. ACCEPT.\n\n• Case B — M changed, old T replayed: the tag depends on M, so a changed M has a different correct tag; the old T no longer matches. REJECT.\n\n• Case C — fake M and fake T without K: Eve can't compute MAC(K, M') without K, so her forged tag won't match Bob's. REJECT.\n\n• Security goal: even after seeing many valid (M, T) pairs, Eve still can't make a new pair that verifies.\n\n• One gap: this does NOT stop a replay of a genuine, unchanged (M, T) — that needs a nonce, timestamp, or counter.\n\nSo the answer is: A accepts, B and C reject, but an untouched replay would still pass.",
    },
    {
      type: "scenario",
      prompt:
        "A device downloads a firmware image and a digital signature. The signature verifies correctly against the public key the device holds — yet the device is now running attacker-controlled firmware.\n\nUsing the lecture's closing question, \"what guarantee is missing?\", name the failure and connect it to the Week 4 man-in-the-middle lesson.",
      modelAnswer:
        "The maths worked. The trust didn't.\n\n• What actually failed: binding the public key to the right identity — not the signature check.\n\n• Why: \"a valid signature proves control of a private key.\" Here it only proves that whoever built the image holds the private key matching the key the device stores. If that stored public key is really the attacker's (PK_A swapped for PK_E), every malicious image will verify.\n\n• Which guarantees held: integrity and origin authentication were fine. Identity binding was not.\n\n• Same as Week 4: this is the man-in-the-middle key-substitution attack — Eve doesn't break the maths, she replaces a key, exactly like unauthenticated Diffie-Hellman.\n\n• The fix: pin the vendor's real public key at manufacture, or use a certificate / fingerprint from a trusted source outside the download. A device with the genuine key pinned rejects the attacker-signed image.\n\nSo the answer is: identity binding failed — trust the wrong key and valid signatures mean nothing.",
    },
    {
      type: "mcq",
      prompt:
        "A game studio ships the same HMAC key to millions of players so each client can check that an update carries a valid tag before installing. What's the main security problem with this design?",
      options: [
        "HMAC provides integrity but not confidentiality, so the update binary travels in the clear and players can read and copy the studio's private signing routine straight from it",
        "HMAC's fixed-length tags are short enough that, across millions of update checks, a collision eventually lets a tampered update verify against a genuine tag by chance",
        "Because every client recomputes the tag locally, a slow client can be tricked into installing an update whose tag it has not finished checking, a time-of-check-to-time-of-use race",
        "Every player holds the one key that both makes and checks tags, so any player can forge a valid tag for a malicious update that other clients will then accept as official",
      ],
      correctIndex: 3,
      modelAnswer:
        "HMAC is symmetric — the same secret key makes tags AND checks tags.\n\n• The problem: hand that key to millions of players so they can verify, and every one of them can also produce valid tags. Anyone (or anyone who extracts the key from a client) can sign a malicious update that other clients accept as official.\n\n• This is the \"MAC does not give public verification\" point: a MAC only works among parties who already trust each other with the shared key.\n\n• The fix: an asymmetric scheme — a digital signature. The studio keeps the private signing key; ships only the public verification key, which can't forge.\n\n• Why the other options are wrong: confidentiality isn't the goal of an update tag; HMAC-SHA-256 has no practical tag-collision weakness; the race described is an implementation bug, not the design flaw.\n\nSo the answer is: everyone who can verify can also forge.",
    },
    {
      type: "scenario",
      prompt:
        "A game studio needs to approve official updates. Only the studio should be able to make an approved update, but millions of players — none of whom the studio trusts with any secret — must be able to check an update is genuine before installing.\n\nName the mechanism that fits, explain how its two keys are used, and correct the common misconception that \"signing is just encrypting the message with the private key\".",
      modelAnswer:
        "Mechanism: a digital signature scheme (asymmetric).\n\n• Keys: the studio makes a key pair. It keeps the private signing key secret and never shares it. The matching public verification key is copied to every player.\n\n• To approve an update: the studio runs Sign(private key, H(update)) and ships the signature with the update. Each player runs Verify(public key, update, signature), which returns accept or reject.\n\n• Why it's safe to hand the public key to millions: holding it lets you CHECK a signature but never MAKE one. (Unlike a MAC, where the verifying key is also the signing key.)\n\nThe misconception:\n\n• \"Signing is not encrypting with the private key.\" Sign and Verify are their own operations, and for modern schemes (Ed25519, ECDSA) there's no encryption involved at all. Calling it \"decrypt with the public key\" is wrong and breaks for those algorithms.\n\n• What a signature gives: integrity, proof of origin, public verifiability, support for non-repudiation. What it doesn't: confidentiality — the update isn't hidden.\n\n• Remaining problem: players must be sure the public key really is the studio's — the Week 4 key-binding problem, solved with certificates, key pinning, or an out-of-band fingerprint.\n\nSo the answer is: a digital signature — private key signs, public key verifies, and it's not \"encryption with the private key\".",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer places the course inside the CIA triad: Week 4's encryption covered confidentiality, and Week 5 adds integrity — \"the message stays accurate and real, and no one can introduce changes.\" Which mapping of tool to the property it mainly provides matches how the lecture uses the triad?",
      options: [
        "Encryption supplies confidentiality; a MAC supplies integrity plus sender authenticity for key holders; a signature supplies integrity, origin authentication and public verifiability",
        "Encryption supplies integrity; a MAC supplies confidentiality between key holders; a signature supplies availability by letting many verifiers check one update at once",
        "Encryption supplies confidentiality and integrity together; a MAC adds availability; a signature adds non-repudiation but gives up integrity and authenticity in exchange",
        "Encryption supplies confidentiality; a MAC supplies non-repudiation to the public; a signature supplies confidentiality plus integrity for closed groups of verifiers",
      ],
      correctIndex: 0,
      modelAnswer:
        "CIA = Confidentiality, Integrity, Availability.\n\n• Encryption -> confidentiality (Week 4).\n\n• MAC -> integrity + sender authenticity, but only between people who share the key. No confidentiality, no public verification.\n\n• Digital signature -> integrity + origin authentication + public verifiability.\n\n• Availability — the \"A\" — is explicitly still uncovered (\"we haven't discussed availability yet\").\n\n• The wrong options hand encryption \"integrity\", give a MAC \"confidentiality\" or \"non-repudiation\", or claim a signature provides confidentiality — all contradict the slide.\n\nSo the answer is: encryption = confidentiality; MAC = integrity + authenticity for key holders; signature = integrity + origin + public verifiability.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture revisits a Week 4 conclusion: \"the algorithm alone is not enough to claim you have a strong, secure system.\" A team says \"we use AES-256, so our crypto is strong.\" Why does the lecturer reject that as enough on its own?",
      options: [
        "Because AES-256 has a known weakness at the full 256-bit key size, so the team should adopt a longer key or a different cipher before they depend on it",
        "Because strength comes from the whole security primitive — algorithm plus key management: key generation, randomness, key sharing and storage, and choice of MAC",
        "Because a block cipher such as AES on its own provides only integrity, so the team must still add a separate mechanism to obtain confidentiality",
        "Because naming the cipher hands it to attackers, and Kerckhoffs's principle holds that a system is strong only while its algorithm stays secret",
      ],
      correctIndex: 1,
      modelAnswer:
        "Naming the cipher is like saying \"we have a great lock\" while ignoring who has keys, how they were cut, and where they're kept.\n\n• The lecturer's term: the security primitive = the algorithm PLUS key management — how keys are generated (with true randomness), shared, stored, verified, and which MAC/authentication is used. \"Everything matters.\"\n\n• \"We use AES-256\" names only the algorithm and says nothing about the parts that actually decide if the deployment is strong.\n\n• Why the other options are wrong: AES-256 has no practical key-size weakness; AES doesn't provide \"only integrity\"; Kerckhoffs's principle is the opposite — the algorithm is assumed public, and security rests on the key.\n\nSo the answer is: strength is the whole primitive — algorithm plus key management — not the cipher name.",
    },
    {
      type: "scenario",
      prompt:
        "To motivate semantic security, the lecturer describes sharing a credit-card number by sending the first four digits over WhatsApp, the next four by SMS, and the next four in a phone call.\n\nExplain what this analogy shows about what we now ask of a cipher, and why \"does the ciphertext leak anything?\" becomes \"does it leak anything meaningful or useful?\".",
      modelAnswer:
        "The split-channel trick isn't a cipher — it's an intuition pump.\n\n• If any one channel is compromised, the attacker holds only a fragment (four digits) that's useless on its own. They can't do anything with it.\n\n• The lecture uses that to reframe the goal:\n\n• Perfect secrecy asked \"can the ciphertext leak absolutely nothing?\" — and only the one-time pad met it, at impractical cost.\n\n• Semantic security asks instead \"can any realistic, computationally-limited attacker learn anything USEFUL from the ciphertext?\" We accept it might leak trivia (length, timing) as long as no efficient attacker can turn that into real knowledge of the plaintext.\n\n• Just as one intercepted channel gives an attacker nothing they can use, a semantically-secure ciphertext gives an efficient attacker nothing they can use.\n\nSo the answer is: it's the shift from an absolute, unlimited-attacker ideal to a practical \"nothing useful leaks\" guarantee.",
    },
    {
      type: "mcq",
      prompt:
        "Separately from bit-flipping, the lecturer describes a man-in-the-middle who says: \"I don't understand what's in your ciphertext, but I'll generate another ciphertext with the same encryption scheme and send that instead.\" What makes this attack possible, and what actually stops it?",
      options: [
        "It works because the cipher is malleable, so the fix is a non-malleable mode such as CBC that makes a substituted ciphertext fail to decrypt",
        "It works because the keystream was reused, so the fix is a fresh nonce per message so the attacker's ciphertext lands on a stale keystream",
        "It works because nothing ties a ciphertext to its sender, so the fix is origin authentication — a MAC or signature — not more confidentiality",
        "It works because the key exchange was unauthenticated, so the fix is an authenticated Diffie-Hellman handshake before any ciphertext is sent",
      ],
      correctIndex: 2,
      modelAnswer:
        "The attacker isn't editing Alice's message — he's throwing it away and sending his own, correctly-formatted one.\n\n• Why it works: encryption gives Alice confidentiality, but nothing in a ciphertext says \"Alice made this\". So Bob decrypts and acts on any validly-encrypted bytes that arrive. No key or plaintext knowledge needed.\n\n• What it's NOT: this isn't bit-flipping (a controlled edit to Alice's own ciphertext), and it isn't a key-exchange failure.\n\n• The missing guarantee: data-origin authentication.\n\n• The fix: a MAC (shared key) or a digital signature (public verification) — not a different cipher mode, not a stronger key exchange.\n\nSo the answer is: nothing ties a ciphertext to its sender, so the fix is origin authentication.",
    },
    {
      type: "mcq",
      prompt:
        "A student suggests that with enough captured ciphertext an attacker could \"reverse-engineer it on supercomputers or quantum computers.\" The lecturer sets that aside and asks a different question. Which pair best describes the distinction he's drawing?",
      options: [
        "The student describes a replay attack; the lecturer redirects to a forgery attack — resending old ciphertext versus crafting a wholly new ciphertext from scratch",
        "The student describes a side-channel attack on the device hardware; the lecturer redirects to a protocol attack on the handshake that negotiates the session keys",
        "The student describes a brute-force search of the key space; the lecturer redirects to a dictionary attack that guesses a low-entropy key from a wordlist",
        "The student describes a confidentiality attack (break the cipher to read the plaintext); the lecturer redirects to an integrity attack (change or forge the message without reading it)",
      ],
      correctIndex: 3,
      modelAnswer:
        "The student is asking \"can the attacker READ it?\" The lecturer wants \"can the attacker CHANGE it without reading it?\"\n\n• Confidentiality attack: cryptanalysis, brute force, quantum, side channels — all aimed at recovering the plaintext.\n\n• Integrity attack: bit-flipping, ciphertext substitution, replay — the attacker never reads the message, just alters or forges it.\n\n• The lecturer's line: \"assume the encryption is perfect. Does that mean no one can change the message? Not really.\"\n\n• Week 5's whole point: a cipher that perfectly resists the first can still be wide open to the second.\n\nSo the answer is: reading it (confidentiality) vs changing/forging it without reading (integrity).",
    },
    {
      type: "short",
      prompt:
        "The lecture opens with a recap of Weeks 1-4. Summarise what each of Weeks 1, 2, 3 and 4 contributed, then explain how Week 3's finding about hard-coded secrets in decompiled APKs connects to this week's \"security primitive\" idea.",
      modelAnswer:
        "The recap:\n\n• Week 1: what the \"cyber world\" and cyber security are, and AI's role in offence vs defence.\n\n• Week 2: social-engineering attacks — phishing and ransomware.\n\n• Week 3: mobile security — an APK can be decompiled, and any secret hard-coded into the source is then exposed.\n\n• Week 4: cryptography begins; the class agrees encryption provides confidentiality in the CIA triad.\n\n• Week 5 adds integrity.\n\nThe connection:\n\n• A hard-coded key or credential is a key-management failure.\n\n• Key management — generation, storage, sharing, protection — is exactly what the \"security primitive\" says must be right for crypto to be strong.\n\n• A perfect algorithm whose key sits in a decompilable binary is still broken. Same lesson as \"the algorithm alone is not enough\".\n\nSo the answer is: a leaked hard-coded secret proves the point that key management, not just the algorithm, decides real security.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer closes by saying last week's takeaway word was \"security primitive\" and this week's is \"security model\": \"your job is to decide — MAC or signatures? which hashing? which key generation? It depends on the scenario; there is no one right option.\" Which reading of that is correct?",
      options: [
        "Choosing a security model means picking mechanisms that fit the threat and constraints of the case — a MAC, a hash choice or a key-generation method can each be right or wrong by context",
        "Choosing a security model means always taking the strongest available primitive — signatures over MACs, SHA-3 over SHA-256 — so the design is safe in every scenario",
        "The security model is fixed as soon as the encryption algorithm is chosen, so selecting AES-GCM already settles the hash, the MAC and the whole key-management approach",
        "A security model is only about key management, so the mechanism questions — MAC versus signature, and which hash — are decided separately and lie outside the model",
      ],
      correctIndex: 0,
      modelAnswer:
        "The point is fit-for-purpose, not \"always maximum\".\n\n• \"Do we need signatures in all use cases? In many cases a MAC will be fine.\" It depends on the threat and the constraints.\n\n• The right mechanism (MAC vs signature), the right hash, the right key-generation method — all depend on the scenario.\n\n• It extends last week's \"security primitive\" (algorithm + key management) into an explicit design choice that the practitioner owns.\n\n• Why the other options are wrong: \"always strongest\" ignores cost and context; the model isn't locked in by the cipher choice; and it's more than just key management.\n\nSo the answer is: pick mechanisms that fit the specific threat and constraints — context decides.",
    },
    {
      type: "mcq",
      prompt:
        "Beyond the slide's advice (MD5/SHA-1 out, SHA-256 default, SHA-3 modern alternative), the lecturer gives a spoken rule of thumb for choosing between SHA-256 and SHA-3. What is it?",
      options: [
        "SHA-3 is faster than SHA-256 in software, so use SHA-3 everywhere except on constrained hardware where SHA-256's smaller state is cheaper to compute",
        "The choice depends on message length: SHA-3 for inputs under a few kilobytes, SHA-256 for large files where its block structure streams more efficiently",
        "SHA-3 is somewhat slower to compute, so prefer it for high-value data that can tolerate latency (health, finance) and keep SHA-256 where responses must be real-time",
        "SHA-3 and SHA-256 perform about the same, so the choice is purely about which library or platform already supports one of them in hardware",
      ],
      correctIndex: 2,
      modelAnswer:
        "The lecturer calls SHA-3 \"more complex\" and \"a bit slower to generate\" than SHA-256 (roughly 1.6-1.8x in some cases, no fixed figure).\n\n• His rule: it depends on the type of data and the application, not the length.\n\n• Use SHA-3 for high-value data where a little delay is fine — health informatics, finance.\n\n• Stay on SHA-256 for latency-sensitive work — real-time image or pixel processing.\n\n• Same \"it depends on the scenario\" theme as the closing security-model point.\n\nSo the answer is: SHA-3 is a bit slower, so use it where latency is acceptable and keep SHA-256 where speed matters.",
    },
    {
      type: "short",
      prompt:
        "In the digital-signatures discussion the lecturer explains \"non-repudiation support\" with a vendor example. Say what non-repudiation means here, give the example, and explain why the slide says signatures give non-repudiation SUPPORT rather than non-repudiation outright.",
      modelAnswer:
        "Non-repudiation here means the signer can't credibly deny they made a message.\n\n• The example: a vendor like Samsung ships a bad update, then claims \"that wasn't us, it was hackers\". That won't hold — only the holder of the private signing key could have produced a signature that verifies against their public key, so a valid signature ties the update to them.\n\n• Why only \"support\": the guarantee depends on the private key genuinely staying secret. If the key was leaked or stolen, a valid signature no longer proves the named party personally acted.\n\n• At that point it becomes a key-management failure (\"why did your key get leaked... someone's going to get fired\"), not a clean denial.\n\nSo the answer is: a valid signature ties a message to the private-key holder — but only as long as that key was actually kept secret.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In the conclusion the lecturer says that Weeks 4 and 5 together — encryption for confidentiality, plus hashing, MAC and signatures for integrity and authentication — now cover the complete CIA triad.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False.\n\n• The conclusion: \"CIA triad — we haven't discussed availability yet... we have just discussed C and I.\"\n\n• Week 4 covered confidentiality. Week 5 adds integrity (and, via MACs and signatures, authentication).\n\n• Availability — the \"A\" — is explicitly still untouched. The lecturer says outright \"this is not complete security\".\n\nSo the answer is: False — availability is still missing.",
    },
    {
      type: "mcq",
      prompt:
        "The activity repeatedly calls the keyed tag an \"HMAC\". What does the acronym stand for, and what is it?",
      options: [
        "Hardware Message Authentication Code — a MAC computed inside a tamper-resistant chip so the signing key never reaches main memory",
        "Hybrid Message Authentication Code — a MAC that pairs a public-key signature with a shared secret so insiders and outsiders can both verify",
        "High-assurance Message Authentication Code — a MAC certified to a formal evaluation standard for use in defence and government systems",
        "Hash-based Message Authentication Code — a MAC built from a cryptographic hash and a shared secret key, giving integrity and sender authenticity to key holders",
      ],
      correctIndex: 3,
      modelAnswer:
        "HMAC = Hash-based Message Authentication Code.\n\n• What it is: a MAC built from a cryptographic hash (like SHA-256) plus a secret key shared by sender and receiver, using a specific inner/outer padding recipe.\n\n• Why not just hash(key + message): that naive version is vulnerable to a length-extension attack. HMAC's construction avoids it.\n\n• What it gives: integrity plus sender authenticity for key holders — only a key holder can make a tag that verifies. No confidentiality, no public verification, no replay protection on its own.\n\n• The other expansions are made up.\n\nSo the answer is: Hash-based Message Authentication Code.",
    },
    {
      type: "mcq",
      prompt:
        "When a system needs both confidentiality and integrity, it should encrypt the plaintext and THEN compute the MAC over the resulting ciphertext (Encrypt-then-MAC), rather than MAC-then-encrypt or encrypt-and-MAC. What's the main security reason?",
      options: [
        "Because computing the MAC over ciphertext is faster than over the plaintext, so the receiver rejects bad messages before spending time on the slower decryption step",
        "Because encrypting first conceals the MAC tag too, so an attacker cannot see the tag to mount an offline search for the MAC key against captured traffic",
        "Because the receiver verifies the MAC on the ciphertext before decrypting, so forged or altered ciphertext is rejected without running attacker-chosen bytes through the decryption path",
        "Because a MAC taken over ciphertext cannot collide, unlike a MAC over plaintext, so only Encrypt-then-MAC yields a tag that is guaranteed unique for every message",
      ],
      correctIndex: 2,
      modelAnswer:
        "Encrypt-then-MAC puts the tamper tag on the OUTSIDE of the sealed parcel.\n\n• Steps: compute T = MAC(key2, ciphertext), send (ciphertext, T). The receiver checks T first and only decrypts if it passes.\n\n• Why that's the security win: forged or tampered ciphertext is thrown out before it reaches the decryption routine. The attacker never gets to push chosen bytes through decrypt-and-unpad — which is exactly what padding-oracle and other chosen-ciphertext attacks (including the classic TLS-CBC ones) rely on.\n\n• MAC-then-encrypt forces the receiver to decrypt before checking the tag, exposing that path. Encrypt-and-MAC tags the plaintext, which can leak plaintext equality and doesn't authenticate the ciphertext.\n\nSo the answer is: you verify the tag on the ciphertext before decrypting, so bad bytes never reach the decryption code.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture stresses that a bare cryptographic hash sent with a message \"proves consistency, not authenticity — protect it with a MAC or a digital signature.\" Against an active attacker who can replace both the message and its hash, which statement correctly contrasts a plain hash and an HMAC?",
      options: [
        "A plain hash provides sender authenticity because only the genuine sender could know the exact message; an HMAC then drops authenticity and provides message integrity alone, since its key is shared by both parties",
        "A plain hash provides confidentiality by scrambling the readable message into a fixed digest; an HMAC provides integrity by letting the receiver recompute and compare the tag with the shared key",
        "A plain hash alone only detects change against a digest you already trust; if the attacker rewrites both it gives neither integrity nor authenticity, whereas an HMAC adds message integrity and sender authenticity for key holders",
        "Both a plain hash and an HMAC provide sender authenticity on their own; only the HMAC also provides integrity, because its secret key makes the tag shift whenever the message changes",
      ],
      correctIndex: 2,
      modelAnswer:
        "A plain hash \"proves consistency\" — recompute it, see that the message matches the digest — \"but it doesn't guarantee it's coming from me\".\n\n• Against an active attacker: they change the message AND the hash to a matching pair, and \"Bob is fooled\". On its own, a bare hash then gives neither integrity nor authenticity. It only helps when compared against a digest you got through a channel you already trust.\n\n• An HMAC computes the tag with a secret only sender and receiver share, so \"if [the attacker] changes M but does not know K, they cannot make a valid tag\". That's message integrity plus sender authenticity for key holders. Still no confidentiality, no public verification.\n\n• The reversed claim — hash gives authenticity, MAC only integrity — is the common misconception.\n\nSo the answer is: a rewritten plain hash proves nothing; an HMAC's secret key gives integrity + sender authenticity.",
    },
    {
      type: "mcq",
      prompt:
        "Introducing semantic security, the lecturer says a practical cipher gives a \"computational guarantee\" — \"cracking that algorithm is going to take a huge amount of time, and that buys us time.\" What's the intended point of making an attack merely infeasible rather than impossible?",
      options: [
        "It means the ciphertext is information-theoretically secure, so even unlimited computing power and time cannot recover the plaintext from it",
        "It means an attacker needs infeasibly long to break it, so defenders have time to detect the attempt, rotate keys and respond before it can succeed",
        "It means the cipher can be broken but only by quantum computers, so classical attackers get no useful information from the ciphertext at all",
        "It means the key may be shorter than the message with no loss of secrecy, because the remaining work factor is what actually protects the data",
      ],
      correctIndex: 1,
      modelAnswer:
        "Perfect secrecy would mean unbreakable forever. Practical crypto settles for \"would take an impractical amount of time\".\n\n• The consequence the lecturer draws (pointing back to Week 1): a big work factor buys defenders TIME — time to notice the attempt and respond (detect it, rotate keys, block the attacker) before it finishes.\n\n• Why the other options are wrong: option 0 describes perfect / information-theoretic secrecy, which semantic security deliberately gives up; the quantum and short-key statements aren't what \"buys us time\" means.\n\nSo the answer is: an infeasibly slow attack gives defenders time to detect and react.",
    },
    {
      type: "mcq",
      prompt:
        "Before the slides, the lecturer asks how you could check four digits weren't altered in transit, and works through: send 1 2 3 4 then their sum, 10, and have the receiver re-add the first four and compare — then calls it \"a very dumb approach.\" Why isn't appending the digit-sum a real integrity check?",
      options: [
        "Because addition is commutative, so an attacker can reorder the digits into a different number that still adds up to the same total the receiver expects",
        "Because the sum is shorter than the data, so many different digit strings share it and the receiver cannot tell which of them was the one actually sent",
        "Because an attacker who changes the digits can just recompute the sum and send that too; a real check needs something they cannot reproduce, such as a keyed tag",
        "Because the sum leaks the digits themselves, letting a passive eavesdropper on the channel reconstruct the original four-digit number without altering anything",
      ],
      correctIndex: 2,
      modelAnswer:
        "\"I can even change the sum as well, as an attacker.\"\n\n• The flaw: the check has no secret and no one-way binding. Anyone who edits the payload just recomputes the checksum and attaches the new value. The receiver's comparison still passes.\n\n• Same weakness as a plain hash against an active attacker.\n\n• The fix: a value the attacker can't reproduce — a MAC/HMAC keyed with a shared secret, or a signature.\n\n• Why the other options are wrong: reordering, length, and leakage are all real properties of a digit-sum, but none is why it fails AS AN INTEGRITY CHECK here.\n\nSo the answer is: the attacker can just recompute and resend the sum — you need something keyed.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer says a hash must change \"almost everything\" when a single input bit flips, then asks \"why is this necessary?\" and answers with an attacker scenario. Why is strong avalanche behaviour a SECURITY requirement, not just a nice-to-have?",
      options: [
        "So that the fixed-length digest can represent inputs of any size, since spreading each input bit's influence across the whole output is what makes variable-length input fit",
        "So that computing the digest stays cheap for the sender, because a change that propagates widely lets the function finish in a single fast pass over the input",
        "So that the digest can be reversed only with great effort, because widespread output change is exactly what gives a hash its one-way, pre-image-resistant property",
        "So an attacker comparing digests of many similar messages sees no partial or proportional relationship to learn from, and cannot use those patterns to attack the hash",
      ],
      correctIndex: 3,
      modelAnswer:
        "The attacker scenario: \"these two messages are very similar, let's see what's changing in the digest... they can detect patterns and try to crack how you are hashing.\"\n\n• Strong avalanche means a one-bit input change gives a totally unrelated, unpredictable digest.\n\n• So an attacker who collects hashes of near-identical inputs gets no gradient, no partial matches, no structure to exploit in differential-style analysis.\n\n• Why the other options are wrong: fixed-length output, cheap computation, and one-wayness are all separate hash properties — not what the \"why is this necessary?\" question is about.\n\nSo the answer is: it denies an attacker any pattern to learn from across similar messages.",
    },
    {
      type: "mcq",
      prompt:
        "Explaining how an attacker \"can create a completely new hash,\" the lecturer says: \"he knows you are probably using SHA-256, it's the standard... I'm assuming hackers can get access to know which hashing mechanism you are using.\" Which Week 4 principle is he applying, and what follows?",
      options: [
        "Kerckhoffs's principle — assume the algorithm is public and known to the attacker, so security must rest on the secret (here a key), never on hiding which hash or cipher is used",
        "Kerckhoffs's principle — keep the algorithm secret wherever possible, because a hash function only stays collision-resistant while attackers cannot determine which construction it uses",
        "Shannon's maxim of perfect secrecy — assume the attacker has unlimited computing power, so the hash must resist inversion even against an adversary with no practical time limit",
        "The avalanche principle — assume the attacker can observe many digests, so a hash must change unpredictably to stop them inferring the algorithm from input-output pairs",
      ],
      correctIndex: 0,
      modelAnswer:
        "Kerckhoffs's principle (Week 4): a system must stay secure even though everything about it except the key is public.\n\n• Applied here: assume the attacker knows the hash is SHA-256. Security can't come from that being secret.\n\n• For a plain hash there's no secret at all — which is why an active attacker can swap message and digest.\n\n• For an HMAC, all the security lives in the shared key.\n\n• Why the other options are wrong: option 1 inverts the principle; Shannon's unbounded-adversary model is perfect secrecy (which practical crypto gives up); avalanche is a different property.\n\nSo the answer is: assume the algorithm is known — security must rest on the key.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer lists uses of hashing: file integrity, digital signatures, password hashing, content addressing (\"git creates a digest before you transfer your code... it should match the digest online\"), and \"in memory... hashing in data structures.\" Which listed use is NOT about a cryptographic digest?",
      options: [
        "Content addressing in version control, where a commit or file is named and located by the hash of its contents so any change produces a different identifier",
        "Hash tables in data structures, where a hash maps a key to a storage bucket for fast lookup and collisions are handled by chaining rather than being a security concern",
        "Password storage, where a system keeps the hash of a password (ideally via a slow KDF) so the plaintext is not held and a stolen store is harder to exploit",
        "File integrity verification, where a published SHA-256 digest lets a downloader confirm the file arrived unmodified by recomputing and comparing the hash",
      ],
      correctIndex: 1,
      modelAnswer:
        "The lecturer separates \"hashing in data structures for memory purposes\" from the digest uses — \"that is not for digest purposes.\"\n\n• A hash table uses a (usually non-cryptographic) hash just to spread keys across buckets for fast lookup. Collisions are expected and handled (e.g. chaining), and none of the crypto goals — pre-image / collision resistance, avalanche — are needed.\n\n• Content addressing (Git), password hashing, and file-integrity checks all rely on a cryptographic digest and its security properties.\n\nSo the answer is: hash tables in data structures.",
    },
    {
      type: "mcq",
      prompt:
        "Asked whether taking the first letter of each word of a favourite quotation makes a strong password, the lecturer says \"not really\" and names a specific attack. Why is such a password weak despite looking like a random letter string?",
      options: [
        "Because the hash of a short password can be inverted directly, so its apparent randomness gives no protection once the attacker obtains the stored digest",
        "Because letters carry less entropy than digits and symbols, so a password with no numbers or punctuation will always fall quickly to exhaustive brute force",
        "Because dictionary attacks try common words, names, dates and the initials of well-known quotes and sayings, so a familiar-quote acronym sits inside the search space",
        "Because reusing one memorable rule across accounts means a single breach reveals the rule, letting the attacker derive every other password the person set",
      ],
      correctIndex: 2,
      modelAnswer:
        "\"There is one famous attack, called a dictionary attack. People try common words — not only common words, [but the] starting letters of common quotes.\"\n\n• A quotation is public and finite, so the acronym of a well-known one is already inside the wordlist an attacker runs through.\n\n• The string LOOKS random but has low real entropy, because the rule that generated it is guessable.\n\n• The lecturer also mentions social engineering (learning your pattern) and that letters alone are weaker than a mix — but the named attack here is the dictionary attack.\n\n• The fix is the same as for any weak password: high-entropy generation, plus storage with a slow KDF.\n\nSo the answer is: a well-known quote's initials are already in the attacker's wordlist.",
    },
    {
      type: "mcq",
      prompt:
        "During the password-hash discussion the lecturer keeps asking \"does it look random to you? is some randomness involved when I apply hashing?\" What's the correct answer and its consequence?",
      options: [
        "Yes — a cryptographic hash seeds an internal random number generator from the input, which is why the same input can hash to different digests on different runs",
        "Yes — hashing injects fresh entropy at each round, so the digest of a low-entropy password is genuinely unpredictable and safe to use directly as a key",
        "No — but the digest is close enough to random that, for a password of any length, it can stand in for a key drawn from a cryptographically secure generator",
        "No — a hash is a fixed deterministic algorithm with no RNG, so it looks random but adds no entropy; a low-entropy input gives an equally guessable digest",
      ],
      correctIndex: 3,
      modelAnswer:
        "\"It might look random to you, but no, not really... there is an algorithm working in the background and that algorithm is not a random number generator... if it looks random, it doesn't mean it has high entropy.\"\n\n• A hash is deterministic — same input, same digest, every time.\n\n• It can't manufacture unpredictability that wasn't in the input. So SHA-256 of a weak password is as guessable as the password.\n\n• For real key material: draw from a CSPRNG. For password storage: use a KDF.\n\nSo the answer is: No — a hash has no RNG and adds no entropy; a weak input stays weak.",
    },
    {
      type: "mcq",
      prompt:
        "Mentimeter question: a stored record changes from \"Alex = 64 diamonds\" to \"Alex = 63 diamonds.\" What should happen to its SHA-256 digest?",
      options: [
        "It changes to an essentially unrelated value — a one-character edit flips roughly half the output bits unpredictably, with no resemblance to the previous digest",
        "It changes only in the region corresponding to the edited field, so comparing digests also shows the attacker which part of the record was altered",
        "It changes by an amount proportional to the size of the edit, so a change from 64 to 63 shifts the digest far less than a large change would",
        "It stays the same, because 64 and 63 differ by one unit and SHA-256 quantises small numeric differences below its collision threshold",
      ],
      correctIndex: 0,
      modelAnswer:
        "By the avalanche effect, ANY change to the input — even one digit — produces a completely different, unpredictable digest with no visible link to the original.\n\n• \"It definitely provides a very drastically changed digest... it's going to change very unpredictably.\"\n\n• The change is NOT localised to the edited field, and NOT proportional to the size of the edit.\n\n• SHA-256 doesn't \"round off\" small differences.\n\n• This is exactly what makes a hash a reliable change detector.\n\nSo the answer is: the whole digest becomes an unrelated value.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer asks whether the key that MAKES an HMAC tag and the key that VERIFIES it are the same or different, and whether the scheme is symmetric or asymmetric. What's the answer, and what limitation follows directly?",
      options: [
        "Different keys, but symmetric overall — the sender tags with a private half and the receiver checks with a public half, so verification can be opened to anyone",
        "The same shared secret key does both, so HMAC is symmetric; anyone who can verify can also forge, which is why it gives no public verification and suits closed groups",
        "The same key does both, but HMAC is asymmetric because tagging and verifying run different internal functions, so only the sender can produce a tag that checks out",
        "Different keys derived from one master secret, making HMAC symmetric; the split means a verifier holding only the check key cannot generate a valid tag of their own",
      ],
      correctIndex: 1,
      modelAnswer:
        "\"Does the receiver need the same key or a different key? Same key. So it should be kept secret.\"\n\n• HMAC is symmetric: one shared secret both creates and checks the tag.\n\n• Direct consequence: everyone who can verify can also produce valid tags. So HMAC can't do public (one-to-many) verification or non-repudiation — it only works among mutually trusting key holders.\n\n• Removing that limitation is exactly why the lecture then moves on to digital signatures.\n\nSo the answer is: same key both ways, so any verifier can also forge — no public verification.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: A student asks what happens if an attacker changes the message and manages to produce a plain hash that still matches. The lecturer's answer: this would fool the receiver, but for a hash like SHA-256 the chance of finding such a colliding input by trial is astronomically small — on the order of 1 in 2^256 — so it's treated as computationally infeasible.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True.\n\n• The lecturer: \"getting the same hash without the key... this is an NP-hard problem... one in a maybe [far more than] billions chance... it's near to infinity... but very, very unlikely.\"\n\n• Finding a different message with a CHOSEN digest breaks second-pre-image resistance; the expected trial cost is about 2^n — here 2^256 — which is why it's considered infeasible.\n\n• A collision between two attacker-chosen messages is easier — about 2^(n/2) by the birthday bound — but still infeasible for SHA-256.\n\nSo the answer is: True.",
    },
    {
      type: "mcq",
      prompt:
        "Deriving digital signatures, the lecturer asks whether a scheme with \"one key to create, one key to verify\" is mathematically more or less complex than the shared-key schemes so far, and answers that asymmetric is \"mathematically more complex.\" Which statement best reflects the trade-off?",
      options: [
        "Asymmetric operations are cheaper per byte than symmetric ones, so signatures are used for bulk data while shared-key MACs are reserved for short control messages",
        "Asymmetric and symmetric operations cost about the same today, so the choice between a signature and a MAC is made purely on key-distribution convenience",
        "Asymmetric operations are more complex only because their keys are longer, so using a shorter public exponent brings signing down to the same cost as an HMAC",
        "Asymmetric operations are mathematically heavier than symmetric ones, and you accept that extra cost when you need public verification that a shared-key MAC cannot give",
      ],
      correctIndex: 3,
      modelAnswer:
        "\"One key is used in creation, one key is used in verifying — which is mathematically more complex? Asymmetric is more complex.\"\n\n• Public-key operations (signing / verifying) are heavier than symmetric ones (hashing / HMAC).\n\n• You pay that cost when the requirement — one signer, many independent verifiers, no shared secret — can only be met by an asymmetric scheme.\n\n• Where a closed group already shares a key, an HMAC is the lighter choice.\n\n• This extends Week 4's symmetric-vs-asymmetric contrast.\n\nSo the answer is: signatures cost more, and you pay it to get public verification a MAC can't give.",
    },
    {
      type: "mcq",
      prompt:
        "Asked \"how do I know this signature belongs to Harry?\", the lecturer answers \"certificates\" and asks the class what a certificate is. Which description matches his answer?",
      options: [
        "A record from a trusted third party (a certificate authority) that binds a public key to an identity, is itself signed, and carries an expiry date after which it is no longer valid",
        "A copy of the signer's private key held in escrow by a certificate authority, released to a verifier on request so they can independently reproduce and check the signature",
        "A long-lived symmetric session key issued by a central server that two parties load in advance so their later message tags can be verified without any further exchange",
        "A signed hash of the message contents attached alongside the signature, letting the receiver confirm the file is intact before deciding whether to trust who produced it",
      ],
      correctIndex: 0,
      modelAnswer:
        "Certificates \"bind a signature to an identity,\" issued by third parties — \"certificate authorities are usually third parties\" — and \"those certificates expire\" (you can even generate them with OpenSSL and set an expiry date).\n\n• So a certificate is a CA-signed statement that a given public key belongs to a named entity.\n\n• If you trust the CA, you can trust that a valid signature under that key really came from that entity.\n\n• It's not the private key, not a session key, not a per-message digest.\n\nSo the answer is: a signed third-party record binding a public key to an identity, with an expiry.",
    },
    {
      type: "short",
      prompt:
        "A student asks why we should trust the certificate authority in the first place. Summarise the lecturer's answer, and what it implies about how far cryptography can take you.",
      modelAnswer:
        "The lecturer concedes it: \"if you are involving a third party to generate a certificate, you have to trust them.\"\n\n• The system relocates trust, it doesn't remove it. Instead of trusting an unauthenticated public key, you trust a small set of well-known certificate authorities to have checked identities and signed honestly. The CA is the trust anchor.\n\n• Limits beyond the maths: a legitimate signer could be coerced (\"someone hijacked the vice chancellor... at gunpoint\"), or a CA could keep or leak key material.\n\n• The recurring takeaway: \"this is still not 100% secure.\" Cryptography gives specific guarantees against specific threats; identity binding ultimately rests on trusting some party and some out-of-band process.\n\nSo the answer is: crypto moves trust to a smaller, better-scrutinised place, but you can never remove it entirely — which is why choosing the right security model is the professional's job.",
    },
    {
      type: "mcq",
      prompt:
        "For a signed software update the lecturer insists you \"hash it, then sign the hash,\" and asks what would go wrong if you signed first and hashed afterwards. Why must hashing come before signing?",
      options: [
        "Because signing the raw file first and hashing the result yields two separate values, and the receiver has no defined order in which to check them",
        "Because verification runs signature-first then message: the signature must sit over the digest, so hashing last would bury the signature where the receiver cannot check it first",
        "Because a hash computed after signing would take in the signature bytes too, so the digest would depend on itself and the receiver could never recompute it",
        "Because hashing after signing discards the message padding the signature scheme added, so the recovered plaintext no longer matches what was signed",
      ],
      correctIndex: 1,
      modelAnswer:
        "\"Hashing comes first and then signing, because the signing process requires the hash. What if I sign first and then create the hash? My signature will get lost, because on the receiver end you first verify the signature and then get back the message.\"\n\n• The verify path is signature-first: the receiver runs Verify(public key, digest, signature), then trusts the message that digest covers.\n\n• The signature is produced over H(M), so H(M) has to exist first.\n\n• Hashing after signing would wrap the signature inside an outer digest and leave nothing to verify up front.\n\n• (Signing a fixed-size digest is also more efficient, but the lecturer's stated reason is the verification order.)\n\nSo the answer is: verification checks the signature over the digest first, so the digest must be made before the signature.",
    },
    {
      type: "mcq",
      prompt:
        "A developer proposes authenticating messages by publishing SHA-256(secret + message) as the tag. Comparing a bare hash, this hash(secret + message) construction, and HMAC, which assessment is correct?",
      options: [
        "A bare hash and an HMAC are effectively interchangeable; HMAC merely runs the underlying hash function twice so the tag comes out faster on long inputs, with no real change to security",
        "A bare hash already authenticates the sender, because only the genuine sender knows the exact message that yields that digest, so adding hash(secret + message) on top just contributes redundancy",
        "hash(secret + message) is the standard and secure way to build a MAC out of a hash function, and HMAC is simply an older published name for that same prepend-the-key construction",
        "A bare hash gives change-detection but no authenticity; hash(secret + message) is a broken DIY MAC (length-extension extends a valid tag without the key); HMAC's nested build is the safe one",
      ],
      correctIndex: 3,
      modelAnswer:
        "Three things, three verdicts:\n\n• Bare hash: no secret, so anyone can recompute it. Detects change, proves nothing about who made it.\n\n• hash(secret + message): a broken home-made MAC. For hashes like SHA-256, a length-extension attack lets someone holding a valid message+tag append data and compute a valid tag for the longer message WITHOUT the secret.\n\n• HMAC: a specific standardised construction — two nested hash passes with distinct inner/outer pad constants and the key — that safely turns a hash into a MAC. Gives integrity plus sender authenticity for key holders.\n\n• It's not \"hashing twice for speed\", and prepend-the-key is not the standard.\n\nSo the answer is: bare hash = no authenticity; prepend-the-key = broken by length extension; HMAC = the safe one.",
    },
    {
      type: "mcq",
      prompt:
        "Compare two things an active attacker might do to a MAC- or signature-protected message: (i) alter the message body M, or (ii) replace the key the receiver trusts to verify (the public key PK_A, or the shared MAC key). What happens in each case, and what's the defence?",
      options: [
        "Altering M fails verification — integrity and authenticity catch it; swapping the key the receiver trusts still verifies, since only the key-identity binding broke, not the maths — fix it with a certificate, pinning or a fingerprint",
        "Both actions fail verification, because any change on the path — whether to the message body or to the stored verification key — breaks the computed tag; the fix for both is to repeat the key exchange over an authenticated channel first",
        "Altering M still verifies whenever the attacker recomputes the tag; swapping the key makes verification fail — so the actual defence is keeping the verification key secret from everyone other than the receiver themselves",
        "Neither action changes the outcome, because a MAC or a signature only ever covers a message header and not the body or the key material — integrity for those must be added separately with a nonce",
      ],
      correctIndex: 0,
      modelAnswer:
        "Two very different attacks:\n\n• (i) Edit M: the MAC or signature over the original no longer matches what the receiver recomputes, so the change is rejected. This is exactly the integrity + authenticity guarantee working.\n\n• (ii) Swap the trusted key: leave the crypto untouched but replace the key the receiver trusts (PK_A -> PK_E, or the shared MAC key). Now messages the attacker produces verify perfectly. Nothing mathematical broke — the receiver just trusts the wrong key. This is the Week 4 man-in-the-middle / key-substitution attack.\n\n• Defence for (ii): bind the key to an identity out of the attacker's reach — a certificate from a trusted CA, a pinned key, or a fingerprint compared over a separate trusted channel.\n\n• Note: keeping a verification key \"secret\" is NOT the fix — public verification keys are meant to be public.\n\nSo the answer is: editing M fails verification; swapping the trusted key still verifies — fix that with certificates, pinning, or fingerprints.",
    },
    {
      type: "mcq",
      prompt:
        "A student asks why home internet download speed is usually much faster than upload speed. The lecturer answers it as an aside, unrelated to the course. What's his explanation?",
      options: [
        "Encryption is applied only to outbound traffic, so every upload carries cipher and integrity overhead that inbound traffic does not, which slows the upload path",
        "It is a physical-link issue: the tower has large, high-power antennas that transmit far on the downlink, while the phone or home device transmits at much lower power with smaller antennas",
        "TCP acknowledgement packets for every download travel back along the upload path, and that return traffic saturates the narrower uplink before user data can use it",
        "Internet providers cap upload rates in software for billing and tiering reasons, and there is no underlying physical cause for the download / upload asymmetry at all",
      ],
      correctIndex: 1,
      modelAnswer:
        "The lecturer flags this as \"nothing to do with this subject\", then explains it as an antenna-and-power asymmetry:\n\n• The base station / tower has large, high-power antennas that push a strong signal a long way on the downlink.\n\n• Your phone or home device transmits with far less power and smaller antennas on the uplink.\n\n• More transmit power means more range and more usable bandwidth, so the downlink is simply easier to make fast.\n\n• It's not caused by encryption overhead, TCP acknowledgements, or purely by ISP billing policy.\n\nSo the answer is: the tower transmits with much more power and bigger antennas than your device.",
    },
  ],
};

export const WEEK_5_PAPERS: ExamPaperSeed[] = [DISCUSSION_PAPER, LECTURE_PAPER];
