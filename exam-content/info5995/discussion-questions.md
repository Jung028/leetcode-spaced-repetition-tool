# INFO5995 — Ed Discussion exam-style questions

A running log of scenario/case-study discussion prompts pulled from Ed
Discussion (not the weekly Ed Lessons tutorials — see `CLAUDE.md` for that
separate workflow). Each entry keeps the prompt verbatim and a full-marks
answer written the way a strong exam response should read: precise
terminology, structured reasoning, nothing hand-waved. This file is for
memorising professional-grade answers, not for the SRS app — it doesn't need
the "explain it to a teenager" style used in `exam-content/**/*.ts`.

Update this file whenever a new similar-style question turns up on Ed
Discussion, across any week/module.

---

## 1. Broken object-level authorization behind a "secure" API

**Source:** Ed Discussion post.

**Prompt:**

> An API uses HTTPS + MFA + signed JWTs.
>
> Alice logs in and receives: `sub=1042, role=student`
>
> She requests: `GET /api/results/1042` → 200 OK
>
> She changes only one thing: `GET /api/results/1043` → 200 OK + another
> student's results
>
> The JWT is valid, correctly signed and completely unmodified.
>
> What exactly failed and why didn't MFA, HTTPS or JWT security prevent it?
>
> Bonus: Where should the fix actually be implemented?

**Full-marks answer:**

**What failed:** This is a **Broken Object Level Authorization (BOLA)**
vulnerability, also commonly called an **IDOR (Insecure Direct Object
Reference)** — currently #1 on the OWASP API Security Top 10. The server
authenticated Alice correctly, then handed back a resource (`/results/1043`)
identified by a client-supplied ID, without ever checking whether the
*authenticated subject* (`sub=1042`) was actually entitled to *that specific
object* (`1043`). The endpoint enforced *authentication* — proving Alice is
Alice — but never enforced *object-level authorization* — proving Alice is
allowed to see result 1043.

**Why each control failed to catch it, precisely:**

- **HTTPS** secures the transport channel — confidentiality and integrity of
  data *in transit* between client and server. It says nothing about who the
  server should let read what once the request legitimately arrives. A
  perfectly encrypted request for someone else's data is still a perfectly
  successful data breach.
- **MFA** strengthens *authentication* — it proves the person logging in is
  really Alice, using something she knows/has/is beyond just a password. It
  has zero bearing on what Alice is subsequently allowed to *do* once
  logged in. MFA answers "is this really Alice?", not "should Alice see
  result 1043?".
- **A valid, correctly signed, unmodified JWT** proves *integrity and
  authenticity of the claims* — the token really was issued by the
  authorization server, for `sub=1042`, and nobody tampered with it in
  transit. That's exactly the problem: the token is functioning perfectly.
  It correctly says "this is user 1042." The vulnerability isn't in the
  token at all — it's that the API endpoint never *used* the token's claims
  to check them against the resource being requested. A JWT authenticates
  the caller; it does not, by itself, authorize access to a specific
  downstream object — that check has to be written into the endpoint.

**The core distinction the whole question is testing:** *authentication*
("who are you?") is a solved, well-tooled problem (HTTPS, MFA, JWTs all
live here) — *authorization at the object level* ("are you allowed to touch
this specific record?") is a business-logic decision that has to be coded,
per-endpoint, by the application developer. No amount of stacking
authentication controls substitutes for that missing check, because they
solve a different layer of the problem entirely.

**Bonus — where the fix belongs:** Server-side, in the **application/business
logic of the endpoint itself**, not in the token, not in the transport
layer, and not by adding more authentication factors. Concretely:

- On every handler that accepts a client-supplied object ID, enforce an
  explicit ownership/entitlement check before returning data: e.g.
  `if (record.owner_id !== token.sub && !hasRole(token, "admin")) return 403`.
- Prefer designs that don't trust a client-supplied ID at all where
  possible — e.g. `GET /api/results/me` resolved server-side from the JWT's
  `sub`, rather than `GET /api/results/{id}` trusting whatever ID the client
  sends.
- Centralise this as a reusable authorization policy/middleware layer rather
  than relying on every developer to remember to add the check by hand —
  BOLA bugs are overwhelmingly caused by one endpoint among many that simply
  forgot the check.
- Add automated BOLA/IDOR regression tests (log in as user A, systematically
  attempt to fetch user B's resources, assert 403/404) as part of CI, since
  this class of bug is invisible to functional tests that only test the
  "happy path" of a user accessing their own data.
- Defense in depth: unguessable, non-sequential resource identifiers
  (UUIDs) raise the bar for casual enumeration, but this is a mitigation,
  never a substitute for the actual authorization check — a UUID can still
  leak (logs, URLs, referrers) and must not be the only thing standing
  between an attacker and someone else's data.

---

## 2. Encryption without integrity — is confidentiality enough?

**Source:** Ed Discussion post, "Week 4 Friday Security Thought: Is
Encryption Enough?" (`#118`, General).

**Prompt:**

> Last week, we talked about encryption and how we can stop Eve from
> reading a message.
>
> But here is something to think about: suppose Eve cannot decrypt your
> message and does not know the key. Can she still attack you? Could she:
>
> - change the encrypted message?
> - copy it and send it again later?
> - somehow make Bob accept something Alice did not intend?
>
> If the answer is yes, what security property are we missing?

**Full-marks answer:**

**Yes — Eve can still attack the exchange, on all three counts, without ever
breaking the encryption.** Encryption on its own only buys **confidentiality**
(Eve can't *read* the plaintext). It says nothing about **integrity**
(whether the ciphertext was altered) or **authenticity/origin** (whether the
message really came from Alice, unmodified, and is being seen for the first
time). Those are separate security properties that have to be added
deliberately — they are not a side effect of encrypting something.

**How each attack works without decrypting anything:**

- **Change the encrypted message (tampering/bit-flipping):** many cipher
  modes are *malleable* — an attacker can flip bits in the ciphertext and
  cause a predictable, corresponding change in the decrypted plaintext,
  without ever learning the key or the original content (classic example:
  XOR-based stream ciphers / CTR mode). Even against modes that aren't
  predictably malleable, an attacker can still corrupt the ciphertext
  (e.g. flip arbitrary bits, truncate it, splice two ciphertexts together);
  without an integrity check, the receiver has no way to detect this and
  will simply decrypt it into garbage — or, in the malleable case, into
  attacker-chosen garbage — and may act on it anyway.
- **Copy it and send it again later (replay attack):** encryption gives no
  notion of freshness or "have I seen this exact message before." Eve
  doesn't need to understand a captured ciphertext to be able to record it
  and resend it verbatim later — e.g. replaying an encrypted "transfer $100"
  instruction a second time. Bob's system, seeing a validly encrypted
  message, has no built-in way to know it's a duplicate unless something
  else (a sequence number, timestamp, or nonce that's tracked and checked)
  was added on top.
- **Make Bob accept something Alice did not intend (spoofing/forgery):**
  without a way to verify the message's origin and that it hasn't been
  altered, Bob cannot actually confirm the ciphertext came from Alice as-is.
  Combined with the two attacks above (splice/replay/bit-flip), Eve can get
  Bob to accept and act on content Alice never sent or never intended in
  that form.

**The missing security property: integrity and authenticity** — not
confidentiality (which encryption already provides). Concretely, what's
missing is a **MAC (Message Authentication Code)** — a keyed checksum
computed over the ciphertext that lets Bob verify both that the message
wasn't altered *and* that it was produced by someone holding the shared key
— or, more generally, an **AEAD scheme** (Authenticated Encryption with
Associated Data, e.g. AES-GCM) that bundles confidentiality and integrity
together in one primitive, plus **replay protection** via nonces/sequence
numbers/timestamps that the receiver tracks and rejects if reused. The
general pattern taught for combining the two properties correctly is
**encrypt-then-MAC**: encrypt first, then compute the MAC over the
ciphertext, so integrity is checked before any decryption is attempted
(checking-then-decrypting avoids feeding tampered ciphertext into the
decryption routine at all).

---
