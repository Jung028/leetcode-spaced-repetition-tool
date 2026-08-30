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

export const WEEK_5_PAPERS: ExamPaperSeed[] = [DISCUSSION_PAPER];
