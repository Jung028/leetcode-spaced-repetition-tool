import type { ExamPaperSeed } from "../types";

const DISCUSSION_PAPER: ExamPaperSeed = {
  course: "INFO5995",
  week: 5,
  paperNumber: 1,
  title: "Week 5 Discussion Prep",
  topics:
    "Pre-lecture Ed Discussion prompt: what encryption alone does and does not protect against — confidentiality vs integrity/authenticity, ciphertext malleability, bit-flipping attacks, replay attacks, message forgery without key knowledge, why authenticated encryption (MACs/AEAD) exists",
  sourceFiles: ["Ed Discussion — Week 5 pre-lecture prompt"],
  questions: [
    {
      type: "scenario",
      prompt:
        "Suppose Eve cannot decrypt your encrypted message and does not know the key. Can she still attack you? Could she: change the encrypted message? Copy it and send it again later? Somehow make Bob accept something Alice did not intend? If the answer is yes, what security property are we missing?",
      modelAnswer:
        "Yes to all three, and encryption alone doesn't stop any of them — encryption only buys confidentiality (Eve can't read the plaintext), it says nothing about integrity or authenticity. (1) Changing the message: many ciphers are malleable — an attacker who knows or guesses the plaintext's structure can flip bits in the ciphertext and cause a predictable, controlled change in the decrypted plaintext (e.g. in a stream cipher or CBC mode without a MAC) without ever knowing the key or the actual content. Bob's system would decrypt it into something different from what Alice sent and have no way to tell it had been tampered with. (2) Replay: Eve doesn't need to read or modify the ciphertext at all to replay it — she just captures a legitimate encrypted message (say, 'transfer $100 to Bob') and resends the exact same bytes later; if there's no sequence number, timestamp, or nonce being checked, Bob's system decrypts it successfully (it's a perfectly valid, correctly-encrypted message) and processes the transfer a second time. (3) Forgery: without a way to verify who actually produced the ciphertext, Eve could craft or replay bytes that decrypt into something Bob accepts as coming from Alice, even though Alice never sent that content. What's missing is integrity and authenticity (data-origin authentication) — the guarantee that a message hasn't been altered in transit and genuinely came from who it claims to. Encryption alone doesn't provide either. The standard fix is to add a Message Authentication Code (MAC/HMAC) computed over the ciphertext with a shared secret, or to use an Authenticated Encryption (AEAD) mode like AES-GCM that bundles confidentiality and integrity/authenticity together — plus a nonce or sequence number specifically to catch replays, since a MAC alone doesn't stop a byte-for-byte replay of a previously-valid message.",
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
        "The lecture recaps that a one-time pad only delivers its \"ciphertext reveals nothing about the message\" guarantee when four strict conditions all hold. Which option states them correctly?",
      options: [
        "The key comes from a CSPRNG, is at least as long as the message, is held in a hardware security module, and is rotated after a set number of uses",
        "The key is truly random, is deliberately shorter than the message to stay practical to distribute, is kept secret, and is changed on a fixed schedule",
        "The key is truly random, is exactly the same length as the message, is kept secret by both parties, and is used only once and then destroyed",
        "The key is derived by hashing the message, is the same length as the digest, is kept secret, and is combined with a fresh per-message public nonce",
      ],
      correctIndex: 2,
      modelAnswer:
        "Slide \"From Perfect Secrecy to Practical Cryptography\" lists the four conditions as truly random, message length (same length as the message), used once, and kept secret — only then does \"ciphertext reveal nothing about the message\". The CSPRNG/HSM/rotation option describes practical key management, not the pad's definition; a key shorter than the message, or one derived by hashing the message, breaks the same-length and true-randomness requirements. This is the Week 4 perfect-secrecy result being recapped before the lecture moves on to practical cryptography.",
    },
    {
      type: "mcq",
      prompt:
        "\"Perfect Secrecy Has a Practical Cost\" uses a 1 GB message as its example. According to the slide, what is the genuinely hard part of using a one-time pad in practice?",
      options: [
        "Managing the key: a fresh 1 GB secret must be distributed safely beforehand, stored and protected at full message size, and destroyed so that it is never reused",
        "Running the XOR: combining a 1 GB key with a 1 GB message byte by byte is too slow for real-time systems and needs dedicated accelerator hardware to keep up",
        "Proving randomness: certifying that a 1 GB key is genuinely random needs statistical testing that itself takes longer than simply sending the message would",
        "Choosing the mode: turning a 1 GB pad into a secure keystream without any repeated blocks is the step that most real implementations get subtly wrong",
      ],
      correctIndex: 0,
      modelAnswer:
        "Slide: \"A 1 GB message needs a fresh 1 GB secret key\", with the bullets distribute it safely before communication, store and protect message-sized secret material, and destroy it so it is never reused. The margin note states it directly: \"the hard part is not the XOR operation. The hard part is managing the key.\"",
    },
    {
      type: "mcq",
      prompt:
        "The lecture stops asking \"Can the ciphertext leak absolutely nothing?\" and instead asks \"Can any realistic attacker learn anything useful?\". What is this weaker but achievable goal called, and what does it demand?",
      options: [
        "Perfect secrecy: it demands that the ciphertext distribution is statistically independent of the plaintext even for an adversary with unlimited computing power",
        "Semantic security: it demands that no efficient, computationally bounded attacker can learn significant information about the plaintext from the ciphertext alone",
        "Ciphertext indistinguishability: it demands that the key be replaced after every message so that no two ciphertexts are ever produced under the same keystream",
        "Authenticated encryption: it demands that every ciphertext carry a tag so a tampering attacker cannot learn anything from observing how the receiver reacts",
      ],
      correctIndex: 1,
      modelAnswer:
        "Slide \"So We Change the Question\": the shift is from \"Can the ciphertext leak absolutely nothing?\" to \"Can any realistic attacker learn anything useful?\", labelled Semantic security — \"No efficient attacker should learn significant information from the ciphertext\", with the keywords efficient attacker, computational guarantee, usable systems. Perfect secrecy is the unbounded-adversary ideal that semantic security replaces for practical use.",
    },
    {
      type: "mcq",
      prompt:
        "\"How can a short key protect a long message?\" — the lecture's central question for moving from the theoretical ideal to usable encryption. What is the mechanism it gives?",
      options: [
        "The short key is split into equal pieces and each piece encrypts one block of the message independently, so a short key still covers the whole message",
        "The short key is re-agreed with Diffie-Hellman once per message block, so a fresh short key ends up protecting every separate part of the long stream",
        "The message is compressed until it is no longer than the key, then combined with the key a single time, so a short key is always long enough after compression",
        "A pseudo-random generator stretches the short key into a long keystream, and a stream cipher combines that keystream with the message to protect it",
      ],
      correctIndex: 3,
      modelAnswer:
        "Slide \"Today's Big Question\": short key K → PRG / cipher \"expands, use safely\" → long data stream protected; the lecture then connects \"stream ciphers and keystreams\" and \"block ciphers and modes\". A PRG expands one short secret into a long, pseudo-random keystream — this is what makes practical (computational) encryption possible where a true one-time pad's equal-length key is not.",
    },
    {
      type: "mcq",
      prompt:
        "In \"Attack 1: Message Modification\", Eve cannot read Alice's message but changes the ciphertext 1001 to 1101, and Bob decrypts it with \"No warning\". What does this demonstrate?",
      options: [
        "That the cipher was used in ECB mode, since only ECB lets an attacker alter content undetected, whereas a chained mode such as CBC would fail to decrypt at all",
        "That encryption provides confidentiality but not integrity: a malleable ciphertext lets an attacker cause a controlled change to the plaintext without the key",
        "That Alice reused a keystream, since bit-flipping only works when the same key bits already encrypted an earlier message that Eve had previously captured",
        "That Bob skipped the key-exchange step, since an authenticated Diffie-Hellman handshake would have bound the ciphertext to Alice and rejected the altered bits",
      ],
      correctIndex: 1,
      modelAnswer:
        "Slide caption: \"Encryption provides confidentiality, but does not automatically guarantee integrity.\" The flip 1001 → 1101 reaches Bob with \"No warning\" because nothing checks that the ciphertext is unmodified. This is the Week 5 pre-lecture discussion point — an attacker who cannot decrypt can still change the message — and the fix is a MAC or an AEAD mode, not a different cipher mode or key exchange.",
    },
    {
      type: "mcq",
      prompt:
        "\"A replay attack does not require the attacker to understand or modify the message.\" In the lecture's \"extend the deadline\" example, how does Eve attack and what guarantee is missing?",
      options: [
        "Eve decrypts the captured message, edits the deadline, re-encrypts it under the same key and resends it; the guarantee missing here is confidentiality",
        "Eve forges an entirely new ciphertext that decrypts to a valid-looking instruction; the guarantee missing here is collision resistance of the hash in use",
        "Eve records one valid encrypted message and sends the exact same bytes to Bob again later; the guarantee missing here is freshness (that a message is new)",
        "Eve substitutes her own public key during setup so Bob encrypts to her instead; the guarantee missing here is peer authentication during the handshake",
      ],
      correctIndex: 2,
      modelAnswer:
        "Slides \"Attacker 2 (Forgery / Replay / Imitation)\": \"Eve simply records a valid encrypted message and sends the same message again later\", and \"Encryption protects confidentiality but does not prove that a message is new.\" Bob's system accepts it a second time (\"Accepted again\"). The missing property is freshness; a nonce, timestamp or sequence number is what actually detects a replay.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: According to \"Attack 1: Message Modification\", encrypting a message automatically guarantees that Bob will detect any alteration made to it in transit.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. Slide caption: \"Encryption provides confidentiality, but does not automatically guarantee integrity.\" Eve flips a bit (1001 → 1101) and Bob decrypts the altered message with \"No warning\". Detecting modification needs a separate integrity mechanism — a MAC or an AEAD mode — which plain encryption does not include.",
    },
    {
      type: "mcq",
      prompt:
        "The live demo shows SHA-256(\"hello\") and SHA-256(\"hell0\") producing completely unrelated digests. Which hash property is this, and what does it let Bob do?",
      options: [
        "The avalanche effect: a tiny input change should cause a widespread, unpredictable output change, so any edit to the message is obvious in the digest",
        "One-wayness: because a digest cannot be reversed, a changed input must yield an unrelated digest, which is what lets Bob recover Alice's original message",
        "Fixed-length output: because every input maps to the same digest size, a single-character change is forced to spread itself across the whole digest",
        "Collision resistance: because no two inputs can share a digest, \"hello\" and \"hell0\" must differ everywhere, which is what lets Bob confirm the sender's identity",
      ],
      correctIndex: 0,
      modelAnswer:
        "Slide \"Live Interactive Demo: One Character Changes\": \"A tiny input change should cause widespread, unpredictable output changes\" — the avalanche effect, also listed on the \"What Should a Cryptographic Hash Make Hard?\" slide as \"strong avalanche behaviour\". It makes a hash a useful change detector: Bob recomputes the digest and any modification, however small, changes it drastically. It does not reverse the hash or prove who sent the message.",
    },
    {
      type: "mcq",
      prompt:
        "\"What Should a Cryptographic Hash Make Hard?\" lists three attacker goals. Which option matches every name to the correct definition?",
      options: [
        "Pre-image: find any x ≠ y with h(x) = h(y); second-pre-image: given h(x) recover x; collision: given x, find a different x' with the same hash value",
        "Pre-image: given x, find x' ≠ x with h(x') = h(x); second-pre-image: find any two colliding inputs; collision: given a digest, recover its original input",
        "Pre-image: given x and h(x), recover the key; second-pre-image: find x' ≠ x with h(x') = h(x); collision: given h(x), recover x without knowing the key",
        "Pre-image: given h(x), find x; second-pre-image: given x, find a different x' with h(x') = h(x); collision: find any x ≠ y with h(x) = h(y)",
      ],
      correctIndex: 3,
      modelAnswer:
        "Slide \"What Should a Cryptographic Hash Make Hard?\": Pre-image resistance — \"Given h(x), find x\"; Second-pre-image resistance — \"Given x, find x' ≠ x with same hash\"; Collision resistance — \"Find any x ≠ y with h(x)=h(y)\". The distinction to hold onto: second-pre-image fixes one input in advance, while a collision lets the attacker choose both inputs freely.",
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
        "Slide \"Which Hash Would You Choose Today?\": MD5 \"Do not choose — Broken collision resistance\"; SHA-1 \"Do not choose — Broken collision resistance\"; SHA-256 \"Good default — Widely supported\"; SHA-3 \"Good alternative — Different design family\", with the explicit note \"Do not label SHA-3 as merely 'future'. It is already a standardised modern option.\"",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: The Week 5 extra-resources note says that for an n-bit hash, collision attacks relate to the birthday effect, so collision resistance is roughly 2^(n/2) work rather than 2^n.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. Extra Resources, Optional Deeper Dive: \"For an n-bit hash, collision attacks are related to the birthday effect, so collision resistance is roughly about 2^(n/2) work rather than 2^n.\" This is why a hash's output length is chosen at roughly twice the target security level when collision resistance matters.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: \"Which Hash Would You Choose Today?\" presents SHA-3 as a good, already-standardised modern alternative to SHA-256, not merely a future option.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. The slide marks SHA-3 \"Good alternative — Different design family\" and adds explicitly: \"Do not label SHA-3 as merely 'future'. It is already a standardised modern option.\" MD5 and SHA-1 are the two marked \"Do not choose\" for broken collision resistance.",
    },
    {
      type: "mcq",
      prompt:
        "\"MAC Idea: A Digest With a Secret Key\" — compared with sending a plain hash alongside a message, what does adding a shared secret key K to the tag change?",
      options: [
        "It also hides the message contents, because the same key K that produces the tag T encrypts M, delivering confidentiality and integrity together in a single pass",
        "It lets any member of the public verify the tag, because K is published next to the message so that anyone at all can recompute T and confirm that it matches",
        "Only someone who knows K can produce a tag that verifies, so Eve cannot alter or forge M undetected: it adds integrity and sender authenticity between key holders",
        "It makes the tag reject replayed messages, because every tag is bound to a fresh per-message key, so an old message with its old tag will no longer verify later on",
      ],
      correctIndex: 2,
      modelAnswer:
        "Slides \"A MAC Protects Integrity and Authenticity\" / \"MAC Idea: A Digest With a Secret Key\": \"Only someone who knows K can create a valid tag\"; \"If Eve changes M but does not know K, can she make a valid new tag? No: verification fails\"; \"MAC = message integrity + sender authenticity for parties who share the secret key.\" It does not encrypt M (the message stays visible), and it gives neither public verification nor replay protection on its own.",
    },
    {
      type: "mcq",
      prompt:
        "\"Why MAC is not enough for public verification\" uses a software update that millions of users must verify from one publisher. Why can the publisher not simply share one MAC key with everyone?",
      options: [
        "Because a single MAC key long enough for millions of users would exceed practical key-length limits, so the resulting tag would be too large to attach to each update",
        "Because anyone who holds the shared key can also create valid tags, so a malicious user with that key could tag a fake update that every other user then accepts",
        "Because MAC verification is far too slow to run on millions of user devices, so most clients would skip the check and install the update without verifying it at all",
        "Because the MAC key would need redistributing after every update, and any user who missed a rotation would then reject the genuine update as though it were a forgery",
      ],
      correctIndex: 1,
      modelAnswer:
        "Slide \"Why MAC is not enough for public verification\": \"Could the publisher share one MAC key with everyone?\" — a malicious user \"Also has K\" and produces \"Fake update + MAC_K(Fake update)\" that other users \"verify with K, Accepted\". \"A MAC proves authenticity only while the MAC key remains secret from attackers. Public verification breaks this model.\" Digital signatures (private signing, public verification) exist precisely for this case.",
    },
    {
      type: "mcq",
      prompt:
        "How does a digital signature's key model differ from a MAC's, and why does that difference matter for software updates and certificates?",
      options: [
        "Both use a shared secret, but a signature's key is longer; updates use signatures only because the longer key resists brute force better than a short MAC key does",
        "A signature uses no key at all — it is just a hash of the message — so updates use it because there is then no key to distribute or to keep secret from the users",
        "A signature uses one private signing key and many public verification keys, so only the owner can sign but anyone can verify — the model that public distribution needs",
        "A signature uses one shared secret for signing and a different shared secret for verifying, so two closed groups can check each other's updates without sharing one key",
      ],
      correctIndex: 2,
      modelAnswer:
        "Slide \"Digital signatures change the key model\": MAC/HMAC uses a \"Shared secret key\" (\"If many people know K, any of them can create a valid tag; good for closed groups\"); a digital signature uses \"Private signing, public verification\" (\"Only the owner signs. Anyone with the public key can verify\"). Slide note: \"This is why software updates, app packages and certificates use signatures rather than a shared MAC key.\"",
    },
    {
      type: "mcq",
      prompt:
        "Put the digital signature process in the order the lecture gives it, using Alice's keys SK_A (private) and PK_A (public).",
      options: [
        "Encrypt M with PK_A → send the ciphertext → Alice decrypts with SK_A to sign it → Bob re-encrypts the message to check the signature matches",
        "Sign M directly with PK_A → hash the resulting signature → send M with that hash → Bob verifies by signing the hash again using SK_A",
        "Hash M → sign the digest with PK_A → send M and S together → Bob verifies with SK_A, accepting only when the message and signature match",
        "Hash M → sign the digest with SK_A to get S → send M and S together → Bob verifies with PK_A, rejecting if either M or S was changed",
      ],
      correctIndex: 3,
      modelAnswer:
        "Slide \"Digital signature process\": (1) Hash the message → H(M); (2) Sign privately → S = Sign(SK_A, H(M)); (3) Send M + S; (4) Verify publicly → Verify(PK_A, M, S). Accept when \"M and S match under the sender's public key\"; \"Changing either the message or signature breaks verification.\" The private key signs and the public key verifies — not the other way around.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: According to \"What signatures provide and what they do not\", applying a digital signature to a message also keeps that message's contents secret from anyone who intercepts it.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. Slide: \"Signing does not encrypt the message. Anyone who receives the message can still read it unless encryption is also used\", and \"Do not describe digital signing as 'encrypting with a private key'.\" Clean mental model from the slide: \"encrypt to hide; sign to prove origin and detect changes.\"",
    },
    {
      type: "mcq",
      prompt:
        "Exam-style. The lecture connects digital signatures back to the Week 4 man-in-the-middle problem: \"Eve may not break the algorithm; she may replace the key.\" What residual problem does a mathematically valid signature still not solve?",
      options: [
        "That the signature could still be replayed later, since a bare signature carries no timestamp and Bob cannot tell an old signed message apart from a brand-new one",
        "That a valid signature only proves control of some private key; Bob still needs a trusted way to bind that public key to Alice's identity, or he just accepts Eve's key",
        "That the hash inside the signature could have a collision, letting Eve find a second message with the same digest that still verifies under Alice's real public key",
        "That signing does not hide the message, so Eve can still read the signed content in transit even though she is unable to change it without breaking verification",
      ],
      correctIndex: 1,
      modelAnswer:
        "Slide \"How do we trust the public key?\": if \"Eve substitutes PK_A → PK_E\", Bob \"accepts wrong key\". \"A valid signature proves control of a private key. But we still need a trusted way to connect the public key to an identity.\" Slide \"Ways to bind a public key to an identity\": \"Trust is a binding problem, not only a mathematics problem\" — solved by certificates, CAs, key directories, known SSH host keys or fingerprint comparison. It is the same key-substitution attack as unauthenticated Diffie-Hellman in Week 4.",
    },
    {
      type: "mcq",
      prompt:
        "Exam-style. \"Compare the four tools\" summarises Hash, MAC, Digital signature and AEAD by goal. Which row is stated correctly?",
      options: [
        "MAC: shared-secret key, provides confidentiality, gives integrity and authenticity between key holders, and additionally supports public verification by any recipient",
        "Hash: no key, provides confidentiality, gives change detection only, and cannot be recalculated by an attacker who does not already have the original input to hand",
        "AEAD: shared-secret key, provides confidentiality, gives integrity and authenticity between key holders, but does not provide public verification of the sender",
        "Digital signature: private/public key pair, provides confidentiality, gives integrity and authenticity, and supports public verification of who produced the signature",
      ],
      correctIndex: 2,
      modelAnswer:
        "Slide \"Compare the four tools\": Hash — no key, no confidentiality, change detection only, \"anyone can recalculate\". MAC — shared secret, no confidentiality, integrity/auth between key holders, no public verification. Digital signature — private/public pair, no confidentiality, integrity/auth yes, public verification yes. AEAD — shared secret, confidentiality yes, integrity/auth between key holders, public verification no. Only the AEAD row here is accurate; the others add confidentiality or public verification that those tools do not provide.",
    },
    {
      type: "short",
      prompt:
        "Using the \"Eve replaces both the message and the hash\" scenario, explain what a plain hash does and does not prove, and exactly what the shared secret key in a MAC adds.",
      modelAnswer:
        "A plain hash is a fingerprint: it is deterministic and shows whether data changed (recompute the digest, compare). But \"a plain hash has NO SECRET, so anyone can recompute it\" — so an active attacker who replaces message M with M' can also compute h(M') and send that pair; Bob's check passes and \"Bob is fooled\". The hash proved only that \"the message matches the digest\", not who produced it. A MAC computes T = MAC(K, M) with a key K shared only by Alice and Bob. Eve \"can copy or alter the packet, but cannot create a valid replacement tag\" without K, so \"any change to M or any forged tag causes verification to fail\". The shared secret turns a consistency check anyone can redo into one only a key holder can produce — adding message integrity plus sender authenticity between the two parties. It still gives no confidentiality, no public verification, and no replay protection.",
    },
    {
      type: "short",
      prompt:
        "Week 4 introduced nonces and replay attacks with AES-GCM. The Week 5 HMAC activity concludes: \"HMAC detects tampering, but replay protection needs a nonce, timestamp or sequence number.\" Explain why a correct MAC still does not stop a replay, and what does.",
      modelAnswer:
        "A MAC answers \"was this exact message produced by a key holder, and is it unchanged?\". If Eve records a genuine message M with its valid tag T and later resends the identical bytes, both still verify — nothing about M or T changed, so Verify(K, M, T) returns accept a second time. The \"Live Activity\" slide makes this explicit: tampering (change \"1 day\" to \"7 days\", keep the old HMAC) is rejected, but replaying the original M + T is not. Freshness is a separate guarantee from integrity/authenticity (\"Encryption Alone Cannot Prove Trust\": \"Integrity detects unauthorised modification. Freshness mechanisms detect replayed or stale messages\"). Stopping a replay needs a value that makes each message unique and checkable as new — a nonce (a number used once, as in Week 4's AES-GCM), a timestamp, or a monotonic sequence number — that the receiver records and refuses to accept twice.",
    },
    {
      type: "short",
      prompt:
        "In the mini puzzle, the sender must find x such that hash(\"send email\" || x) starts with 000000, while the verifier checks a single hash. Explain why finding x is expensive but verifying is cheap, and which hash properties force a brute-force search.",
      modelAnswer:
        "Verifying is one hash computation: concatenate the known string with the claimed x, hash once, and check whether the digest begins with the required zeros — cheap and deterministic (\"Verifier: checks one hash\"). Finding x is expensive because there is no shortcut to a digest with a chosen prefix. The hash is one-way (pre-image resistance: given a target output you cannot invert it to an input) and has strong avalanche behaviour (a tiny change in x gives an unrelated, unpredictable digest), so the sender cannot steer x toward a qualifying digest — they can only \"try many x values\" and hash each until one lands in the tiny fraction of outputs starting with 000000. That is the asymmetry the slide names: \"expensive to FIND, cheap to VERIFY.\"",
    },
    {
      type: "short",
      prompt:
        "Describe the secure software-update process from the lecture (create-and-sign, then verify), and state which specific question each building block answers: the hash, the digital signature, and the certificate / trusted key record.",
      modelAnswer:
        "Create and sign (developer): take the update file M, compute H(M), then S = Sign(SK_dev, H(M)); publish \"update file + digital signature\". The private signing key never leaves the developer. Verify (user device): download M + S, recompute H(M), run Verify(PK_dev, M, S); a valid signature means install, while a modified or fake update fails verification and is \"rejected before install\". What each block answers (Extra Resources concept map): the hash answers \"Did the data change?\"; the digital signature answers \"Does this message verify under this public key?\" — integrity, origin authentication and public verifiability, so millions can check without a shared secret; the certificate or trusted key record answers \"Whose public key is this?\", binding PK_dev to the real developer so Eve cannot substitute her own key.",
    },
    {
      type: "short",
      prompt:
        "The slide \"Does Hashing a Human Password Create a Strong Random Key?\" shows SHA-256(\"password123\") producing random-looking output. Explain why this is not a strong cryptographic key, linking to Week 4's distinction between key length and key entropy, and say what to do instead.",
      modelAnswer:
        "The digest is 256 bits and looks random, but \"looks random ≠ has high entropy\". A hash is deterministic: it spreads the input bits across a fixed-length output but \"cannot create unpredictability that was not present in the input\". \"password123\" is a low-entropy, guessable input, so SHA-256(\"password123\") is equally guessable — an attacker just hashes candidate passwords. This is the Week 4 point that key strength is about entropy (how unpredictable the key actually is), not merely length (how many bits it occupies): a full-length key built from a weak secret is still weak. For a cryptographic key, generate the randomness directly with a CSPRNG. For storing passwords, use a deliberately slow password hash / KDF such as Argon2id, scrypt, bcrypt or PBKDF2 — not raw SHA-256.",
    },
    {
      type: "short",
      prompt:
        "A teammate says: \"We protect the download with AES-GCM, so integrity and authenticity are already handled — we don't need signatures.\" Using \"Compare the four tools\" and \"Why MAC is not enough for public verification\", explain what AEAD does and does not give a public software-update channel, and what is actually needed.",
      modelAnswer:
        "AEAD (AES-GCM, ChaCha20-Poly1305) combines confidentiality with integrity and authenticity \"between key holders\" — it is the \"all together\" box on the way to a secure channel like TLS. But its key model is a shared secret, and its integrity/authenticity guarantee only holds while that secret stays secret from attackers. For a public download where millions of users must verify an update from one publisher, giving everyone the AEAD (or MAC) key means any holder — including a malicious user — can produce a valid-looking authenticated update, so \"Public verification breaks this model\". What is needed is public verification: the developer signs H(M) with a private key that is never shared, users verify with the developer's public key, and that key's identity is bound by a certificate or trusted key record. AEAD can still protect the transport; it does not replace the signature.",
    },
    {
      type: "scenario",
      prompt:
        "Alice sends the ciphertext 1001 to Bob over a link Eve fully controls. Eve flips one bit so Bob receives 1101, and Bob's system decrypts it with no warning. Walk through why encryption alone allowed this, which security property is missing, and what mechanism would have caught it.",
      promptDiagram:
        "flowchart LR\n  A[\"Alice sends<br/>ciphertext 1001\"] --> E[\"Eve flips one bit<br/>1001 → 1101\"]\n  E --> B[\"Bob receives 1101<br/>decrypts, no warning\"]",
      modelAnswer:
        "Encryption gave Alice confidentiality: Eve cannot read the plaintext behind 1001. It gave nothing else. The cipher is malleable — a predictable change to the ciphertext produces a predictable change in the decrypted plaintext — so Eve can flip a bit (1001 → 1101) without the key and without knowing the message. Bob decrypts whatever that altered ciphertext yields and has no check to tell him it was tampered with (\"No warning\"). The missing property is integrity (and, if Eve had instead resent an old capture, freshness). The fix is to authenticate the message: attach T = MAC(K, M) computed with a shared secret, or use an AEAD mode such as AES-GCM that bundles encryption with an integrity tag, so any change to the ciphertext makes verification fail before Bob acts on it. This is the Week 5 pre-lecture point: an attacker who cannot decrypt can still change the message.",
    },
    {
      type: "scenario",
      prompt:
        "Alice and Bob share a secret key K. Show what Alice sends alongside her message, what Bob does on receipt, and give Bob's decision (accept / reject) for each of the three cases from \"MAC Check: Accept or Reject?\": (A) M and T arrive unchanged; (B) M is changed and the old T is replayed; (C) a new fake M and fake T are produced without K.",
      promptDiagram:
        "flowchart LR\n  K[\"Shared secret K\"] --> T\n  M[\"Message M\"] --> T[\"T = MAC(K, M)\"]\n  T --> S[\"Send (M, T)\"]\n  S --> V[\"Bob recomputes MAC(K, M)<br/>accept only if it equals T\"]",
      modelAnswer:
        "Alice computes T = MAC(K, M) and sends (M, T). Bob recomputes MAC(K, M) from the received M and his own copy of K and accepts only if it equals the received T (a MAC runs KeyGen → Tag → Verify, where Verify returns 1 = accept or 0 = reject). Case A (M and T unchanged): the recomputed tag matches T → ACCEPT (message and tag match under shared key K). Case B (M changed, old T replayed): the tag is a function of M, so changing M changes the correct tag and the old T no longer matches → REJECT. Case C (new fake M and fake T without K): Eve cannot compute MAC(K, M') without K, so her forged tag will not match Bob's recomputed value → REJECT. Security goal: even after seeing many valid (M, T) pairs, Eve still cannot produce a new pair that verifies. Note this does not stop a replay of a genuine, unmodified (M, T) — that needs a nonce, timestamp or sequence number.",
    },
    {
      type: "scenario",
      prompt:
        "Exam-style. A device downloads a firmware image and a digital signature. The signature verifies correctly against the public key the device holds, yet the device is now running attacker-controlled firmware. Using the lecture's closing question — \"what guarantee is missing?\" — identify the failure and connect it to the Week 4 man-in-the-middle lesson.",
      modelAnswer:
        "Claim: the cryptography worked but the trust did not — the failure is in binding the public key to the right identity, not in the signature check. Supporting points: (1) \"A valid signature proves control of a private key\" — here it proves only that whoever produced the image controls the private key matching the key the device holds; if that stored public key is actually the attacker's (PK_A → PK_E), every malicious image will verify. (2) The four guarantees are hide the message, detect changes, prove origin, and trust the key; integrity and origin authentication held, but identity binding failed. (3) This is the same attack as unauthenticated Diffie-Hellman in Week 4 — Eve does not break the maths, she substitutes a key — so the defence is the same: bind the verification key to the real vendor with a certificate, a pinned key, or a compared fingerprint obtained from a trusted source outside the download. Example: a device that pins the vendor's genuine public key at manufacture rejects the attacker-signed image because the signature no longer verifies against the pinned key.",
    },
    {
      type: "mcq",
      prompt:
        "A game studio ships the same HMAC key to millions of players so each client can check that an update carries a valid tag before installing it. What is the main security problem with this design?",
      options: [
        "HMAC provides integrity but not confidentiality, so the update binary travels in the clear and players can read and copy the studio's private signing routine straight from it",
        "HMAC's fixed-length tags are short enough that, across millions of update checks, a collision eventually lets a tampered update verify against a genuine tag by chance",
        "Because every client recomputes the tag locally, a slow client can be tricked into installing an update whose tag it has not finished checking, a time-of-check-to-time-of-use race",
        "Every player holds the one key that both makes and checks tags, so any player can forge a valid tag for a malicious update that other clients will then accept as official",
      ],
      correctIndex: 3,
      modelAnswer:
        "HMAC is symmetric: the same secret key runs both Tag and Verify. Distributing it so millions of players can verify also gives every one of them the ability to produce valid tags — so any player (or anyone who extracts the key from a client) can sign a malicious update that other clients accept as genuine. This is the lecture's \"MAC does not give public verification\" point: a MAC only works between parties who all already trust each other with the shared key. Public one-to-many verification needs an asymmetric scheme — a digital signature, where the studio keeps the private signing key and ships only the public verification key, which cannot be used to forge. The other options are real HMAC-adjacent facts or misconceptions but none is the core flaw here: confidentiality is not the goal of an update tag, HMAC-SHA-256 has no practical tag-collision weakness, and the race described is an implementation bug, not the design problem.",
    },
    {
      type: "scenario",
      prompt:
        "A game studio needs to approve official updates. Only the studio should be able to produce an approved update, but millions of players — none of whom the studio trusts with any secret — must be able to check that an update is genuine before installing it. Name the mechanism that fits, explain how its two keys are used, and correct the common misconception that \"signing is just encrypting the message with the private key\".",
      modelAnswer:
        "Mechanism: a digital signature scheme (asymmetric). Keys: the studio generates a key pair and keeps the private signing key secret and undistributed; the matching public verification key is copied to every player. To approve an update the studio runs Sign(private key, H(update)) and ships the signature with the update; each player runs Verify(public key, update, signature), which returns accept or reject. The asymmetry is the whole point — holding the public key lets you check a signature but never produce one — so handing it to millions creates no forgery risk, unlike a MAC/HMAC where the verifying key is also the signing key. Misconception: \"signing is not encrypting with the private key\" — Sign and Verify are their own operations (and for schemes like DSA/ECDSA/EdDSA there is no encryption involved at all); framing it as \"decrypt with the public key\" is wrong and breaks for modern signature algorithms. What a signature provides: integrity, origin authentication, public verifiability, and support for non-repudiation. What it does not provide: confidentiality — the update is not hidden. Remaining problem: players must be sure the public key really is the studio's — the Week 4 key-binding / man-in-the-middle problem — solved with certificates, key pinning, or a fingerprint checked out-of-band.",
    },
    {
      type: "mcq",
      prompt:
        "In the recap the lecturer places the course inside the CIA triad: Week 4's encryption protected confidentiality, and Week 5 \"is about the second aspect, integrity — the message stays accurate and real, and no one can introduce changes.\" Which mapping of mechanism to the property it primarily supplies matches how the lecture uses the triad?",
      options: [
        "Encryption supplies confidentiality; a MAC supplies integrity plus sender authenticity for key holders; a signature supplies integrity, origin authentication and public verifiability",
        "Encryption supplies integrity; a MAC supplies confidentiality between key holders; a signature supplies availability by letting many verifiers check one update at once",
        "Encryption supplies confidentiality and integrity together; a MAC adds availability; a signature adds non-repudiation but gives up integrity and authenticity in exchange",
        "Encryption supplies confidentiality; a MAC supplies non-repudiation to the public; a signature supplies confidentiality plus integrity for closed groups of verifiers",
      ],
      correctIndex: 0,
      modelAnswer:
        "In the recap and again in the conclusion the lecturer maps the tools onto the CIA triad: Week 4 established that encryption protects confidentiality, and Week 5 adds integrity — \"the message remains accurate, real; no one is able to introduce any changes.\" That lines up with the earlier \"Compare the four tools\" slide: a MAC gives integrity and sender authenticity between shared-key holders (no confidentiality, no public verification), and a digital signature gives integrity, origin authentication and public verifiability. Availability — the third CIA property — is explicitly still uncovered (\"we haven't discussed availability yet\"). Options that give encryption integrity, give a MAC confidentiality or non-repudiation, or claim a signature provides confidentiality contradict both the recap and that slide.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture opens by revisiting a Week 4 conclusion: \"the algorithm alone is not enough to claim you have a strong, secure system.\" A team says \"we use AES-256, so our system's cryptography is strong.\" Why does the lecturer's framing reject that as sufficient on its own?",
      options: [
        "Because AES-256 has a known weakness at the full 256-bit key size, so the team should adopt a longer key or a different cipher before they depend on it",
        "Because strength comes from the whole security primitive — algorithm plus key management: key generation, randomness, key sharing and storage, and choice of MAC",
        "Because a block cipher such as AES on its own provides only integrity, so the team must still add a separate mechanism to obtain confidentiality",
        "Because naming the cipher hands it to attackers, and Kerckhoffs's principle holds that a system is strong only while its algorithm stays secret",
      ],
      correctIndex: 1,
      modelAnswer:
        "Recap of the Week 4 conclusion: \"the algorithm alone does not determine if it is a strong security or not. You need a complete primitive — how you are managing the key, storing the key, generating the key, verifying the key, sharing the key; everything matters.\" The lecturer calls this the security primitive: the algorithm plus key management, including true randomness in key generation, which MAC is used and how parties are authenticated. \"We use AES-256\" names only the algorithm and says nothing about the parts that actually decide whether the deployment is strong. The Kerckhoffs option is backwards (the algorithm is assumed public), AES does not provide only integrity, and AES-256 has no practical key-size weakness.",
    },
    {
      type: "scenario",
      prompt:
        "To motivate semantic security, the lecturer describes sharing a credit-card number by sending the first four digits over WhatsApp, the next four by SMS, and the next four in a phone call. Explain what this analogy is illustrating about what we now ask of a cipher, and why \"does the ciphertext leak anything?\" becomes \"does the ciphertext leak anything meaningful or useful?\"",
      modelAnswer:
        "The split-channel trick is a defence-in-depth intuition pump, not a cipher: if any one channel is compromised the attacker holds only a fragment (four digits) that is not useful on its own — they cannot act on it. The lecture uses it to reframe the security goal. Perfect secrecy asked \"can the ciphertext leak absolutely nothing?\" and only the one-time pad met it, at impractical cost. Semantic security asks instead \"can any realistic, computationally bounded attacker learn anything meaningful or useful from the ciphertext?\" — we accept that a ciphertext may leak trivia (length, timing) as long as no efficient attacker can extract information they can actually exploit. Just as one intercepted channel yields nothing an attacker can use, a semantically secure ciphertext yields nothing an efficient attacker can turn into knowledge of the plaintext. This is the shift from an absolute, unbounded-adversary ideal to a practical computational guarantee that still gives usable systems.",
    },
    {
      type: "mcq",
      prompt:
        "Separately from bit-flipping, the lecturer describes a man-in-the-middle who says: \"I don't understand what is in your ciphertext, but I'll generate another ciphertext with the same encryption scheme and send that instead.\" What makes this attack possible, and what actually stops it?",
      options: [
        "It works because the cipher is malleable, so the fix is a non-malleable mode such as CBC that makes a substituted ciphertext fail to decrypt",
        "It works because the keystream was reused, so the fix is a fresh nonce per message so the attacker's ciphertext lands on a stale keystream",
        "It works because nothing ties a ciphertext to its sender, so the fix is origin authentication — a MAC or signature — not more confidentiality",
        "It works because the key exchange was unauthenticated, so the fix is an authenticated Diffie-Hellman handshake before any ciphertext is sent",
      ],
      correctIndex: 2,
      modelAnswer:
        "Transcript: \"I'm the man in the middle. I'm receiving your ciphertext. I'm going to replace it with my ciphertext... I don't understand what is there, but I'm going to generate another ciphertext... I need to make sure I use the same encryption scheme.\" The attack needs no key and no plaintext knowledge — encryption gives Alice confidentiality but nothing binds a ciphertext to her as the sender, so Bob decrypts and acts on whatever validly-encrypted bytes arrive. This is not the bit-flipping / malleability attack (a controlled edit to Alice's own ciphertext) and it is not a key-exchange failure; the missing guarantee is data-origin authentication, supplied by a MAC (shared key) or a digital signature (public verification), not by a different cipher mode or a stronger key exchange.",
    },
    {
      type: "mcq",
      prompt:
        "Exam-style. A student suggests that with enough captured ciphertext an attacker could \"reverse-engineer it on supercomputers or quantum computers.\" The lecturer sets that aside and asks a different question. Which pair best describes the distinction the lecturer is drawing?",
      options: [
        "The student describes a replay attack; the lecturer redirects to a forgery attack — resending old ciphertext versus crafting a wholly new ciphertext from scratch",
        "The student describes a side-channel attack on the device hardware; the lecturer redirects to a protocol attack on the handshake that negotiates the session keys",
        "The student describes a brute-force search of the key space; the lecturer redirects to a dictionary attack that guesses a low-entropy key from a wordlist",
        "The student describes a confidentiality attack (break the cipher to read the plaintext); the lecturer redirects to an integrity attack (change or forge the message without reading it)",
      ],
      correctIndex: 3,
      modelAnswer:
        "Transcript: the student's idea is \"reverse engineering on quantum computers... it's always about a pattern\" — an attempt to defeat confidentiality by recovering the plaintext. The lecturer responds: \"I'm trying to raise a bigger problem... assume the encryption is perfect. Does that mean no one can change the message? Not really.\" He moves from can the attacker read it? (a confidentiality attack — cryptanalysis, brute force, side channels) to can the attacker alter or forge it without ever reading it? (an integrity attack — bit-flipping, ciphertext substitution, replay). Week 5's whole point is that a cipher which perfectly resists the first can still be wide open to the second.",
    },
    {
      type: "short",
      prompt:
        "The lecture opens with a recap of Weeks 1-4. Summarise what each of Weeks 1, 2, 3 and 4 contributed as the lecturer lists them, then explain how Week 3's finding about hard-coded secrets in decompiled APKs connects to this week's \"security primitive\" idea.",
      modelAnswer:
        "As recapped: Week 1 established what the \"cyber world\" and cyber security are, and the role of AI in offensive versus defensive security; Week 2 covered social-engineering attacks — phishing and ransomware; Week 3 moved to mobile security, showing that an APK can be decompiled and any secret hard-coded into the source is then exposed; Week 4 began cryptography, with the class agreeing that encryption provides confidentiality in the CIA triad. Week 5 adds integrity. The Week 3 connection: a hard-coded key or credential is a key-management failure, and key management (generation, storage, sharing, protection) is exactly what the \"security primitive\" says must be right for cryptography to be strong — a perfect algorithm whose key sits in a decompilable binary is still broken. It is the same lesson as \"the algorithm alone is not enough.\"",
    },
    {
      type: "mcq",
      prompt:
        "Exam-style. The lecturer closes by saying last week's takeaway word was \"security primitive\" and this week's is \"security model\": \"as a security professional your job is to decide — HashMAC or signatures? which hashing? which key generation? It all depends on the scenario; there is no one right option.\" Which reading of that closing point is correct?",
      options: [
        "Choosing a security model means picking mechanisms that fit the threat and constraints of the case — a MAC, a hash choice or a key-generation method can each be right or wrong by context",
        "Choosing a security model means always taking the strongest available primitive — signatures over MACs, SHA-3 over SHA-256 — so the design is safe in every scenario",
        "The security model is fixed as soon as the encryption algorithm is chosen, so selecting AES-GCM already settles the hash, the MAC and the whole key-management approach",
        "A security model is only about key management, so the mechanism questions — MAC versus signature, and which hash — are decided separately and lie outside the model",
      ],
      correctIndex: 0,
      modelAnswer:
        "Closing remarks: \"I'm going to leave you with a word — security model... as security experts, your job is to find the most suitable or optimal security model. Do you think we need signatures in all use cases? In many cases HashMAC will be fine... It all depends on the scenario. There is no one right option.\" The point is fit-for-purpose selection: the right mechanism (MAC vs signature), hash and key-generation method depend on the threat model and constraints, not a fixed \"always strongest\" rule. It extends last week's \"security primitive\" (algorithm plus key management) into an explicit design choice the practitioner owns.",
    },
    {
      type: "mcq",
      prompt:
        "Beyond the slide's advice (MD5 and SHA-1 out, SHA-256 a good default, SHA-3 a standardised modern alternative), the lecturer adds a spoken rule of thumb for choosing between SHA-256 and SHA-3. What is it?",
      options: [
        "SHA-3 is faster than SHA-256 in software, so use SHA-3 everywhere except on constrained hardware where SHA-256's smaller state is cheaper to compute",
        "The choice depends on message length: SHA-3 for inputs under a few kilobytes, SHA-256 for large files where its block structure streams more efficiently",
        "SHA-3 is somewhat slower to compute, so prefer it for high-value data that can tolerate latency (health, finance) and keep SHA-256 where responses must be real-time",
        "SHA-3 and SHA-256 perform about the same, so the choice is purely about which library or platform already supports one of them in hardware",
      ],
      correctIndex: 2,
      modelAnswer:
        "Recording elaboration on \"Which Hash Would You Choose Today?\": the lecturer says SHA-3 is \"more complex\" and \"a bit slower to generate\" than SHA-256 — declining to give a fixed figure but suggesting on the order of 1.6-1.8x in some cases — and that the decision \"depends on the type of data and your application, not the length.\" His examples: use SHA-3 for health-informatics or finance data where some delay is acceptable, and stay on SHA-256 for latency-sensitive work such as real-time image/pixel processing. It is the same \"it depends on the scenario\" theme as the closing security-model point.",
    },
    {
      type: "short",
      prompt:
        "In the digital-signatures discussion the lecturer explains \"non-repudiation support\" with a vendor example. State what non-repudiation means here, give the example, and explain why the slide says signatures give non-repudiation support rather than non-repudiation outright.",
      modelAnswer:
        "Non-repudiation here means the signer cannot credibly deny that they produced a message. Example: if a vendor such as Samsung ships a bad update and then claims \"this wasn't us, it was malicious actors,\" that will not stand — only the holder of the private signing key could have produced a signature that verifies against their public key, so a valid signature on the update ties it to them (\"a valid signature proves control of a private key\"). It is only support because the guarantee rests on the private key genuinely staying secret: if the key was leaked or stolen, a valid signature no longer proves the named party personally acted — as the lecturer notes, that then becomes a key-management failure (\"why did your key get leaked... someone's going to get fired\"), not a clean repudiation.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In the conclusion the lecturer states that Weeks 4 and 5 together — encryption for confidentiality, plus hashing, MAC and signatures for integrity and authentication — now cover the complete CIA triad.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "False. Conclusion: \"CIA triad — we haven't discussed availability yet... we have just discussed C and I.\" The lecturer is explicit that \"this is not complete security\" and that more concepts come in later weeks. Week 4 covered confidentiality, Week 5 adds integrity (and, via MACs and signatures, authentication), but availability — the A — is still untouched.",
    },
    {
      type: "mcq",
      prompt:
        "In the lecture's activity the keyed tag is repeatedly called an \"HMAC\". What does the acronym stand for, and what is it?",
      options: [
        "Hardware Message Authentication Code — a MAC computed inside a tamper-resistant chip so the signing key never reaches main memory",
        "Hybrid Message Authentication Code — a MAC that pairs a public-key signature with a shared secret so insiders and outsiders can both verify",
        "High-assurance Message Authentication Code — a MAC certified to a formal evaluation standard for use in defence and government systems",
        "Hash-based Message Authentication Code — a MAC built from a cryptographic hash and a shared secret key, giving integrity and sender authenticity to key holders",
      ],
      correctIndex: 3,
      modelAnswer:
        "HMAC = Hash-based Message Authentication Code. It is a MAC constructed from a cryptographic hash function (e.g. SHA-256) and a secret key shared by sender and receiver, with a specific inner/outer-padding construction written HMAC(K, M) — deliberately not the naive hash(K || M), which is vulnerable to length-extension. Like any MAC it provides message integrity plus sender authenticity for the parties who hold K: only a key holder can produce a tag that verifies, so any change to M or any forged tag is rejected. It gives no confidentiality, no public verification, and no replay protection on its own. The other expansions are invented.",
    },
    {
      type: "mcq",
      prompt:
        "When a system needs both confidentiality and integrity it should encrypt the plaintext and then compute the MAC over the resulting ciphertext (Encrypt-then-MAC), in preference to MAC-then-encrypt or encrypt-and-MAC. What is the main security reason?",
      options: [
        "Because computing the MAC over ciphertext is faster than over the plaintext, so the receiver rejects bad messages before spending time on the slower decryption step",
        "Because encrypting first conceals the MAC tag too, so an attacker cannot see the tag to mount an offline search for the MAC key against captured traffic",
        "Because the receiver verifies the MAC on the ciphertext before decrypting, so forged or altered ciphertext is rejected without running attacker-chosen bytes through the decryption path",
        "Because a MAC taken over ciphertext cannot collide, unlike a MAC over plaintext, so only Encrypt-then-MAC yields a tag that is guaranteed unique for every message",
      ],
      correctIndex: 2,
      modelAnswer:
        "Encrypt-then-MAC computes T = MAC(K2, C) over the ciphertext C and sends (C, T). The receiver checks T first and only decrypts if it verifies, so any forged or tampered ciphertext is discarded before it reaches the decryption routine — the attacker never gets to run chosen bytes through decrypt-and-unpad, which is what padding-oracle and other chosen-ciphertext attacks (including the classic TLS-CBC ones) rely on. It also gives ciphertext integrity, and combined with a semantically secure cipher that yields IND-CCA security. MAC-then-encrypt forces the receiver to decrypt before it can check the tag, exposing that decryption path to those attacks; encrypt-and-MAC computes the tag over the plaintext, which can leak plaintext equality (identical plaintexts give identical tags) and does not authenticate the ciphertext. The Week 5 lecture reaches the same ordering conclusion — apply encryption first, then the tag over the result — by a simpler argument (once everything is encrypted you can no longer see the message or digest to tag them).",
    },
    {
      type: "mcq",
      prompt:
        "The lecture stresses that a bare cryptographic hash sent with a message \"proves consistency, not authenticity — protect it with a MAC or a digital signature.\" Against an active attacker who can replace both the message and its hash, which statement correctly contrasts what a plain hash and an HMAC each provide?",
      options: [
        "A plain hash provides sender authenticity because only the genuine sender could know the exact message; an HMAC then drops authenticity and provides message integrity alone, since its key is shared by both parties",
        "A plain hash provides confidentiality by scrambling the readable message into a fixed digest; an HMAC provides integrity by letting the receiver recompute and compare the tag with the shared key",
        "A plain hash alone only detects change against a digest you already trust; if the attacker rewrites both it gives neither integrity nor authenticity, whereas an HMAC adds message integrity and sender authenticity for key holders",
        "Both a plain hash and an HMAC provide sender authenticity on their own; only the HMAC also provides integrity, because its secret key makes the tag shift whenever the message changes",
      ],
      correctIndex: 2,
      modelAnswer:
        "Transcript: a plain hash \"proves consistency\" — the receiver recomputes it and sees the message matches the digest — \"but it doesn't guarantee that it is coming from me,\" and an active attacker who \"changes not only the message, but also the hash\" defeats it entirely (\"Bob is fooled\"). So on its own, against a tamper-capable attacker, a bare hash gives neither integrity nor authenticity; it only helps when compared with a digest obtained through a channel you already trust. An HMAC computes the tag with a secret shared only by sender and receiver, so \"if [the attacker] changes M but does not know K, they cannot make a valid tag\": it delivers message integrity plus sender authenticity (data-origin authentication) for the parties holding K. It still gives no confidentiality and no public verification. The reversed claim — hash gives authenticity, MAC only integrity — is the common misconception.",
    },
    {
      type: "mcq",
      prompt:
        "Introducing semantic security, the lecturer says a practical cipher gives a \"computational guarantee\" — \"cracking that algorithm is going to take a huge amount of time, and that buys us time\" — and points back to Week 1. What is the intended consequence of making an attack merely computationally infeasible rather than impossible?",
      options: [
        "It means the ciphertext is information-theoretically secure, so even unlimited computing power and time cannot recover the plaintext from it",
        "It means an attacker needs infeasibly long to break it, so defenders have time to detect the attempt, rotate keys and respond before it can succeed",
        "It means the cipher can be broken but only by quantum computers, so classical attackers get no useful information from the ciphertext at all",
        "It means the key may be shorter than the message with no loss of secrecy, because the remaining work factor is what actually protects the data",
      ],
      correctIndex: 1,
      modelAnswer:
        "The lecturer contrasts perfect secrecy (\"we can't claim 100% secrecy\") with a practical computational guarantee: the design is made \"computationally very hard to break,\" so an attack would take an impractical amount of time. Referring to Week 1, the point is that a large work factor buys defenders time — time to notice the attempt and respond (detect, rotate keys, block) before it completes. Option 0 describes perfect / information-theoretic secrecy, which semantic security deliberately gives up; the quantum and short-key options are not what \"buys us time\" means (a short key protecting a long message is a separate Week 5 result).",
    },
    {
      type: "mcq",
      prompt:
        "Before the slides the lecturer asks how you could check that four digits were not altered in transit, and works through: send 1 2 3 4 followed by their sum, 10, and have the receiver re-add the first four and compare — then calls it \"a very dumb approach.\" Why is appending the digit-sum not a real integrity check?",
      options: [
        "Because addition is commutative, so an attacker can reorder the digits into a different number that still adds up to the same total the receiver expects",
        "Because the sum is shorter than the data, so many different digit strings share it and the receiver cannot tell which of them was the one actually sent",
        "Because an attacker who changes the digits can just recompute the sum and send that too; a real check needs something they cannot reproduce, such as a keyed tag",
        "Because the sum leaks the digits themselves, letting a passive eavesdropper on the channel reconstruct the original four-digit number without altering anything",
      ],
      correctIndex: 2,
      modelAnswer:
        "Transcript: \"the moment you receive it, you make sure the sum of the first four digits matches the last two digits... But this is a very dumb approach. I can even change the sum as well as an attacker.\" The check has no secret and no one-way binding, so anyone who edits the payload can recompute the checksum and attach the new value; the receiver's comparison still passes. This is the same weakness as a plain hash against an active attacker — the fix is a value the attacker cannot reproduce, i.e. a MAC/HMAC keyed with a shared secret (or a signature). Reordering, length and leakage are real properties of a digit-sum but none is why it fails as an integrity check here.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer notes a hash must change \"almost everything\" when a single input bit flips, then asks \"why is this necessary?\" and answers with an attacker scenario. Why is strong avalanche behaviour a security requirement, not just a convenient property?",
      options: [
        "So that the fixed-length digest can represent inputs of any size, since spreading each input bit's influence across the whole output is what makes variable-length input fit",
        "So that computing the digest stays cheap for the sender, because a change that propagates widely lets the function finish in a single fast pass over the input",
        "So that the digest can be reversed only with great effort, because widespread output change is exactly what gives a hash its one-way, pre-image-resistant property",
        "So an attacker comparing digests of many similar messages sees no partial or proportional relationship to learn from, and cannot use those patterns to attack the hash",
      ],
      correctIndex: 3,
      modelAnswer:
        "Transcript: \"if it is not highly sensitive, attackers can listen to my messages... 'these two messages are very similar, let's see what is changing in the [digest]' and they can detect patterns and try to crack how you are hashing.\" Strong avalanche means a one-bit input change yields an unrelated, unpredictable digest, so an attacker who collects hashes of near-identical inputs gets no gradient, no partial matches and no structure to exploit in differential-style analysis. Fixed-length output, cheap computation and one-wayness are separate hash properties, not what the \"why is this necessary?\" question is about.",
    },
    {
      type: "mcq",
      prompt:
        "Explaining how an attacker \"can create a completely new hash,\" the lecturer says: \"he knows you are probably using SHA-256, it's the standard... I'm assuming hackers can get access to know which hashing mechanism you are using.\" Which Week 4 principle is he applying, and what follows from it?",
      options: [
        "Kerckhoffs's principle — assume the algorithm is public and known to the attacker, so security must rest on the secret (here a key), never on hiding which hash or cipher is used",
        "Kerckhoffs's principle — keep the algorithm secret wherever possible, because a hash function only stays collision-resistant while attackers cannot determine which construction it uses",
        "Shannon's maxim of perfect secrecy — assume the attacker has unlimited computing power, so the hash must resist inversion even against an adversary with no practical time limit",
        "The avalanche principle — assume the attacker can observe many digests, so a hash must change unpredictably to stop them inferring the algorithm from input-output pairs",
      ],
      correctIndex: 0,
      modelAnswer:
        "This is Kerckhoffs's principle from Week 4: a system must stay secure even though everything about it except the key is public. The lecturer assumes the attacker knows the hash in use (SHA-256), so security cannot come from that being secret — for a plain hash there is no secret at all (which is why an active attacker can swap message and digest), and for an HMAC the security is entirely in the shared key. Option 1 inverts the principle; Shannon's unbounded-adversary model is perfect secrecy, which practical crypto gives up; avalanche is a different property.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer lists uses of hashing: file integrity, digital signatures, password hashing, content addressing (\"git creates a digest before you transfer your code... it should match the digest online\"), and \"in memory... hashing in data structures, not for creating a digest.\" Which listed use is NOT about a cryptographic digest?",
      options: [
        "Content addressing in version control, where a commit or file is named and located by the hash of its contents so any change produces a different identifier",
        "Hash tables in data structures, where a hash maps a key to a storage bucket for fast lookup and collisions are handled by chaining rather than being a security concern",
        "Password storage, where a system keeps the hash of a password (ideally via a slow KDF) so the plaintext is not held and a stolen store is harder to exploit",
        "File integrity verification, where a published SHA-256 digest lets a downloader confirm the file arrived unmodified by recomputing and comparing the hash",
      ],
      correctIndex: 1,
      modelAnswer:
        "Transcript: the lecturer separates \"hashing in data structures for memory hashing purposes\" from the digest uses — \"that is not for digest purposes.\" A hash table uses a (typically non-cryptographic) hash just to spread keys across buckets for fast lookup; collisions are expected and handled (e.g. separate chaining), and none of the cryptographic goals (pre-image / collision resistance, avalanche) are needed. Content addressing (Git), password hashing and file-integrity checks all depend on a cryptographic digest and its security properties.",
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
        "Transcript: \"there is one famous attack, which is called a dictionary attack. People try common words — not only common words, [but the] starting letters of common quotes.\" A quotation is public and finite, so the acronym of a well-known one is inside the wordlist an attacker enumerates; the string looks random but has low real entropy because the generating rule is guessable. The lecturer also mentions social engineering (learning your pattern) and that letters alone are weaker than a mix, but the named attack here is the dictionary attack; the remedy is the same as for weak passwords generally — high-entropy generation and storage with a slow KDF.",
    },
    {
      type: "mcq",
      prompt:
        "During the password-hash discussion the lecturer repeatedly asks \"does it look random to you? is some randomness involved when I apply hashing?\" What is the correct answer and its consequence?",
      options: [
        "Yes — a cryptographic hash seeds an internal random number generator from the input, which is why the same input can hash to different digests on different runs",
        "Yes — hashing injects fresh entropy at each round, so the digest of a low-entropy password is genuinely unpredictable and safe to use directly as a key",
        "No — but the digest is close enough to random that, for a password of any length, it can stand in for a key drawn from a cryptographically secure generator",
        "No — a hash is a fixed deterministic algorithm with no RNG, so it looks random but adds no entropy; a low-entropy input gives an equally guessable digest",
      ],
      correctIndex: 3,
      modelAnswer:
        "Transcript: \"it might look random to you, but no, not really... there is an algorithm working in the background and that algorithm is not a random number generator. Although it looks random, it's not random at all. So if it looks random, it doesn't mean it has high entropy.\" A hash is deterministic — same input, same digest, every time — and cannot manufacture unpredictability that was not in the input, so SHA-256 of a weak password is as guessable as the password. For real key material draw from a CSPRNG (uniform distribution); for password storage use a KDF.",
    },
    {
      type: "mcq",
      prompt:
        "Mentimeter question from the lecture: a stored record changes from \"Alex = 64 diamonds\" to \"Alex = 63 diamonds.\" What should happen to its SHA-256 digest?",
      options: [
        "It changes to an essentially unrelated value — a one-character edit flips roughly half the output bits unpredictably, with no resemblance to the previous digest",
        "It changes only in the region corresponding to the edited field, so comparing digests also shows the attacker which part of the record was altered",
        "It changes by an amount proportional to the size of the edit, so a change from 64 to 63 shifts the digest far less than a large change would",
        "It stays the same, because 64 and 63 differ by one unit and SHA-256 quantises small numeric differences below its collision threshold",
      ],
      correctIndex: 0,
      modelAnswer:
        "By the avalanche effect, any change to the input — even one digit — produces a completely different, unpredictable digest that shares no visible structure with the original (\"it definitely provides a very drastically changed digest... it's going to change very unpredictably,\" as the lecturer summarised the poll). The digest change is not localised to the edited field and not proportional to the edit size, and SHA-256 does not ignore small differences. This is what makes a hash a reliable change detector.",
    },
    {
      type: "mcq",
      prompt:
        "The lecturer asks whether the key that makes an HMAC tag and the key that verifies it are the same or different, and whether the scheme is symmetric or asymmetric. What is the answer, and what limitation follows directly from it?",
      options: [
        "Different keys, but symmetric overall — the sender tags with a private half and the receiver checks with a public half, so verification can be opened to anyone",
        "The same shared secret key does both, so HMAC is symmetric; anyone who can verify can also forge, which is why it gives no public verification and suits closed groups",
        "The same key does both, but HMAC is asymmetric because tagging and verifying run different internal functions, so only the sender can produce a tag that checks out",
        "Different keys derived from one master secret, making HMAC symmetric; the split means a verifier holding only the check key cannot generate a valid tag of their own",
      ],
      correctIndex: 1,
      modelAnswer:
        "Transcript: \"does the receiver need the same key or a different key? Same key. So it should be kept secret... I'm assuming the same key is being used for verifying as well.\" HMAC is symmetric: one shared secret both creates and checks the tag. The direct consequence is that every party who can verify can also produce valid tags, so HMAC cannot provide public (one-to-many) verification or non-repudiation — it works only among mutually trusting key holders. Removing that limitation is exactly why the lecture then turns to digital signatures.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: A student asks what happens if an attacker changes the message and manages to produce a plain hash that still matches. The lecturer's answer is that this would fool the receiver, but for a hash like SHA-256 the chance of finding such a colliding input by trial is astronomically small — on the order of 1 in 2^256 — so it is treated as computationally infeasible.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "True. Transcript: \"getting the same hash without the key... this is an NP-hard problem... one in a maybe billions [far more than billions] chance it could happen... it's near to infinity, one out of infinity... but very, very unlikely.\" Finding a different message with a chosen digest breaks second-pre-image resistance; for an n-bit hash the expected trial cost is about 2^n (here 2^256), which is why it is considered infeasible. (A collision between two attacker-chosen messages is easier — about 2^(n/2) by the birthday bound — but still infeasible for SHA-256.)",
    },
    {
      type: "mcq",
      prompt:
        "Deriving digital signatures, the lecturer asks whether a scheme with \"one key to create, one key to verify\" is mathematically more or less complex than the shared-key schemes studied so far, and answers that asymmetric is \"mathematically more complex.\" Which statement best reflects the trade-off he is describing?",
      options: [
        "Asymmetric operations are cheaper per byte than symmetric ones, so signatures are used for bulk data while shared-key MACs are reserved for short control messages",
        "Asymmetric and symmetric operations cost about the same today, so the choice between a signature and a MAC is made purely on key-distribution convenience",
        "Asymmetric operations are more complex only because their keys are longer, so using a shorter public exponent brings signing down to the same cost as an HMAC",
        "Asymmetric operations are mathematically heavier than symmetric ones, and you accept that extra cost when you need public verification that a shared-key MAC cannot give",
      ],
      correctIndex: 3,
      modelAnswer:
        "Transcript: \"one key is used in creation, one key is used in verifying — which one is mathematically more complex? ... asymmetric is more complex, mathematically more complex,\" illustrated with the idea of a function that returns a matching result for different inputs. Public-key operations (signing / verifying) are computationally heavier than symmetric ones (hashing / HMAC). You pay that cost when the requirement — one signer, many independent verifiers, no shared secret — can only be met by an asymmetric scheme; where a closed group already shares a key, an HMAC is the lighter choice. This extends Week 4's symmetric-vs-asymmetric contrast.",
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
        "Transcript: certificates \"bind a signature to an identity,\" issued by third parties — \"certificate authorities are usually third parties\" — and the lecturer notes you can generate them with OpenSSL and \"set an expiry date... those certificates expire.\" A certificate is a CA-signed statement that a given public key belongs to a named entity, so a verifier who trusts the CA can trust that a valid signature under that key really came from that entity. It is not the private key, not a session key, and not a per-message digest.",
    },
    {
      type: "short",
      prompt:
        "A student asks why we should trust the certificate authority in the first place. Summarise the lecturer's answer, and what it implies about how far cryptography can take you.",
      modelAnswer:
        "The lecturer concedes the point: \"if you are involving a third party to generate a certificate, you have to trust them.\" The system relocates trust rather than removing it — instead of trusting an unauthenticated public key you trust a small set of well-known certificate authorities to have checked identities and signed honestly; that CA is the trust anchor. He also notes limits beyond the maths: a legitimate signer could be coerced (\"someone hijacked the vice chancellor... on gunpoint\"), or a CA could keep or leak key material. The takeaway is his recurring one — \"this is still not 100% secure\": cryptography gives specific guarantees against specific threats, and identity binding ultimately rests on trusting some party and some out-of-band process, which is why choosing the right security model, not just the right algorithm, is the professional's job.",
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
        "Transcript: \"hashing comes first and then signing, because hashing is protecting the integrity... signing process requires the hash. What if I sign first and then create the hash? My signatures will get lost, because on the receiver end you first verify [the signature] and then get back the message from the hash.\" The verify path is signature-first: the receiver checks Verify(PK, digest, signature), then trusts the message the digest covers. The signature is produced over H(M), so H(M) must exist first; hashing after signing would wrap the signature inside an outer digest and leave nothing to verify up front. (Signing a fixed-size digest is also more efficient, but the lecturer's stated reason is the verification order.)",
    },
    {
      type: "mcq",
      prompt:
        "A developer proposes authenticating messages by publishing SHA-256(secret ‖ message) as the tag. Comparing a bare hash, this hash(secret ‖ message) construction, and HMAC, which assessment is correct?",
      options: [
        "A bare hash and an HMAC are effectively interchangeable; HMAC merely runs the underlying hash function twice so the tag comes out faster on long inputs, with no real change to security",
        "A bare hash already authenticates the sender, because only the genuine sender knows the exact message that yields that digest, so adding hash(secret ‖ message) on top just contributes redundancy",
        "hash(secret ‖ message) is the standard and secure way to build a MAC out of a hash function, and HMAC is simply an older published name for that same prepend-the-key construction",
        "A bare hash gives change-detection but no authenticity; hash(secret ‖ message) is a broken DIY MAC (length-extension extends a valid tag without the key); HMAC's nested ipad/opad build is the safe one",
      ],
      correctIndex: 3,
      modelAnswer:
        "A plain hash has no secret, so anyone can recompute it: it detects change but proves nothing about who produced it (\"a plain hash is not enough\"). Prepending a secret and hashing — hash(secret ‖ message) — is a broken home-made MAC: for Merkle-Damgard hashes such as SHA-256 a length-extension attack lets someone holding a valid message+tag append data and compute a valid tag for the longer message without knowing the secret. HMAC is a specific standardised construction — two nested hash passes with the distinct inner/outer pad constants (ipad/opad) and the key — that safely turns a hash function into a MAC, giving message integrity plus sender authenticity for holders of the key. It is not \"hashing twice for speed,\" and prepend-the-key is not the standard.",
    },
    {
      type: "mcq",
      prompt:
        "Exam-style. Compare two things an active attacker might do to a MAC- or signature-protected message: (i) alter the message body M, or (ii) replace the key the receiver trusts to verify (the public key PK_A, or the shared MAC key). What happens in each case, and what is the defence?",
      options: [
        "Altering M fails verification — integrity and authenticity catch it; swapping the key the receiver trusts still verifies, since only the key-identity binding broke, not the maths — fix it with a certificate, pinning or a fingerprint",
        "Both actions fail verification, because any change on the path — whether to the message body or to the stored verification key — breaks the computed tag; the fix for both is to repeat the key exchange over an authenticated channel first",
        "Altering M still verifies whenever the attacker recomputes the tag; swapping the key makes verification fail — so the actual defence is keeping the verification key secret from everyone other than the receiver themselves",
        "Neither action changes the outcome, because a MAC or a signature only ever covers a message header and not the body or the key material — integrity for those must be added separately with a nonce",
      ],
      correctIndex: 0,
      modelAnswer:
        "If the attacker edits M, the MAC or signature over the original no longer matches what the receiver recomputes / verifies, so the change is rejected — this is exactly the integrity + authenticity guarantee (the tag or signature binds the content and, for key holders, its origin). If instead the attacker leaves the crypto untouched but substitutes the key the receiver trusts — PK_A → PK_E, or the shared MAC key — then messages the attacker produces verify perfectly: nothing mathematically is broken, but the receiver now trusts the wrong key. This is the Week 4 man-in-the-middle / key-substitution attack (Eve does not break the cipher, she replaces a key, as in unauthenticated Diffie-Hellman). The defence is binding the key to an identity out of the attacker's reach: a certificate from a trusted CA, a pinned key, or a fingerprint compared over a separate trusted channel. Keeping a verification key \"secret\" is not the fix — public verification keys are meant to be public.",
    },
    {
      type: "mcq",
      prompt:
        "A student asks why home internet download speed is typically much faster than upload speed. The lecturer answers it as an aside, unrelated to the course. What is his explanation?",
      options: [
        "Encryption is applied only to outbound traffic, so every upload carries cipher and integrity overhead that inbound traffic does not, which slows the upload path",
        "It is a physical-link issue: the tower has large, high-power antennas that transmit far on the downlink, while the phone or home device transmits at much lower power with smaller antennas",
        "TCP acknowledgement packets for every download travel back along the upload path, and that return traffic saturates the narrower uplink before user data can use it",
        "Internet providers cap upload rates in software for billing and tiering reasons, and there is no underlying physical cause for the download / upload asymmetry at all",
      ],
      correctIndex: 1,
      modelAnswer:
        "The lecturer flags this as \"a completely different [topic]... nothing to do with this subject,\" then explains it as an antenna-and-power asymmetry: the base station or tower has large, high-power antennas that push a strong signal over long range on the downlink, whereas a phone or home device transmits with far less power and smaller antennas on the uplink, and higher transmit power translates into more range and more usable bandwidth. So the downlink is simply easier to make fast than the uplink. It is not caused by encryption overhead, by TCP acknowledgement traffic, or purely by ISP billing policy.",
    },
  ],
};

export const WEEK_5_PAPERS: ExamPaperSeed[] = [DISCUSSION_PAPER, LECTURE_PAPER];
