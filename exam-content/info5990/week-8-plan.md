# INFO5990 Week 8 — Planner Output

Two papers, per the authoring guide: `TUTORIAL_PAPER` (paperNumber 1, Change
Management / BetaBank) then `LECTURE_PAPER` (paperNumber 2, Security
Management) — genuinely unrelated topics this week, per `week-8-notes.md`'s
flagged mismatch. `export const WEEK_8_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];`

Continuity note: Week 7's `CHANGE_LECTURE_PAPER` already drilled PM-vs-CM,
Kubler-Ross curve, ADKAR, Kotter's 8-Step and McKinsey 7S using an **Alpha
Manufacturing ERP** case. The Week 8 tutorial reuses the same models on a
**different case (BetaBank CRM)** — this is intentional second-exposure
practice, not duplication. Every Week 8 tutorial question must be new and
BetaBank-specific (or, in the mixed-review round, an explicit new Week 7
connection) — never a re-skin of an Alpha Manufacturing question.

Self-contained numbers rule applied throughout: every case-study fact a
question needs (BetaBank's $5M/30%, TJX's 45.7M accounts, Kido's 25,000+/38
countries, ManageMyHealth's >1M records, Snowflake's 500M+ records) is either
stated inline in that question's own prompt, or supplied by a reading card
that precedes it. Nothing ever says "the case study/slide/deck says X."

---

## LECTURE_PAPER — Security Management (paperNumber 2)

Source files: `exam-content/info5990/week-8-notes.md`,
`exam-content/info5990/week-8-learning.md`,
`lecture/INFO5990 2026-S2 Week 08 - Security Management.pdf`,
`lecture/Week 08 - Profession-s1-low.transcript.md`.

Target ~51 questions (within the 55 cap for a paper using new formats/cards).

### Quota checklist (paper-level, Writer should land within ~1-2 of each)
| type | target |
|---|---|
| mcq | 26 |
| multi | 10 |
| truefalse | 2 |
| fillblank | 3 |
| match | 3 |
| order | 3 |
| sort | 3 |
| **total** | **~50 (cap 55)** |

At least 10 questions across the paper must be "why / what happens if"
framed (marked **[WHY]** below — 11 tagged, some flexibility to swap).

### Round-by-round plan

**Round A — What Security Means (3 dimensions)** — card: "three kinds of
locks" (Physical / Digital-Information / Operational Security), each with its
goal. No diagram needed (short enough as text). 4 questions:
1. mcq — classify a new scenario (e.g. a cleaner leaves a server-room door
   propped open) into the correct dimension.
2. **sort** — sort 6-8 new short scenarios into Physical / Digital /
   Operational (only 2-3 groups allowed by the format — use these three).
3. multi — select ALL statements that correctly describe Operational
   Security (processes/people/policies reducing human-error and insider
   risk) vs distractors describing the other two dimensions.
4. mcq — distinguishes cybersecurity vs information security vs data
   security as an umbrella-vs-sub-domain relationship (Lecture-quiz **Q1**,
   new wording, new example — see mapping table below).

**Round B — Security Management: goals & lifecycle** — card: smoke-detector
analogy, the 6-step lifecycle (Identify → Plan → Implement → Monitor & Detect
→ Respond & Recover → Review & Improve, looping). Diagram: reuse the
`graph LR` loop from `week-8-learning.md` section 2. 5 questions:
1. **order** — put 6 shuffled lifecycle steps back in the correct order,
   grounded in a new mini-scenario (a company finding an outdated VPN
   client).
2. mcq — apply a new scenario to one specific lifecycle step (e.g. "a
   company runs a penetration test after a fix ships" → Review & Improve).
3. mcq — distinguish Security Management's *goals* (protect CIA, business
   continuity, compliance, trust) from its *key elements* (the 6-step
   process) in a new example — tests not conflating the two lists.
4. multi — select ALL genuine reasons security management matters (from the
   7-reason list) vs plausible-but-wrong distractors (e.g. "maximising
   developer velocity" is not one of the 7).
5. **[WHY]** mcq — what happens if the "Monitor & Detect" step is skipped
   entirely (new scenario: breach runs undetected for weeks) — echoes the
   ManageMyHealth failure mode without naming ManageMyHealth yet.

**Round C — The CIA Triad** — card: postman analogy (both versions,
condensed) + NIST origin + "why a triangle" (three pillars). Diagram: reuse
the `graph TD` from `week-8-learning.md` section 1. 6 questions:
1. mcq — **Q3** new postman-style scenario (an office cleaner reads a
   printed memo and understands it) → confidentiality compromised.
2. mcq — **Q4** new coded/encrypted variant (the memo is shredded-then-taped
   back in code, or an encrypted email is intercepted but not decrypted) →
   NOT compromised.
3. mcq — **Q7** "why is it drawn as a triangle" — new framing (three
   pillars under one roof) rather than the lecture's literal wording.
4. mcq — **Q5** context-dependent priority, applied to a *new* domain not
   used in class (e.g. an airline's flight-booking ledger → Integrity
   matters most because a doubled/dropped booking number causes real harm;
   or a 911/emergency dispatch system → Availability matters most).
5. multi — select ALL techniques that primarily protect **Confidentiality**
   (encryption, access permissions, MFA) vs a mixed set including Integrity
   techniques (hashes, checksums) as distractors that must NOT be ticked.
6. **fillblank** (3 blanks in one question) — "The CIA Triad's three parts:
   ___ (only authorised people can read it), ___ (the data hasn't been
   secretly changed), ___ (the system is there when it's needed)."

**Round D — Vulnerabilities & Risk = Vulnerability × Threat** — card:
"broken window in a guarded building" + the Risk formula. 4 questions:
1. **sort** — sort 6-8 new vulnerability examples into Human / Technological
   / Organisational (3 groups; leave Physical and Process factors as extra
   items folded into these three or as decoys since sort caps at 3 groups).
2. mcq — **Q8** "what is a vulnerability" — new example (an unlocked test
   account nobody disabled after an intern left).
3. mcq — apply Risk = Vulnerability × Threat to a NEW pair of examples (a
   high-vulnerability system nobody is targeting vs. a hardened system under
   active attack) — tests that risk needs both factors, not just one.
4. **[WHY]** multi — select ALL true statements about why users are the
   "biggest threat" (human error, poor password practice, phishing
   susceptibility, insider misuse) vs a distractor claiming zero-days are
   primarily a user-behaviour problem (false — they're a technical/vendor
   gap).

**Round E — Controls & Access Control / Least Privilege** — card: hotel
keycard analogy + technical/administrative/physical control types + brief
defense-in-depth note (three sequential gates). 4 questions:
1. **match** — match 4 new concrete actions to their control type (e.g.
   "encrypting a database" and "enforcing MFA" → Technical; "writing a
   password-rotation policy" → Administrative; "keycard-locking the server
   room" → Physical). Left = the actions (unique), right = repeatable
   category labels.
2. mcq — **Q12** least-privilege applied to a new example (a temp
   contractor's account scoped to one shared folder only).
3. mcq — **Q11** "what does 'control' mean" — new scenario needing the
   student to name which control type best fits.
4. **[WHY]** mcq — what happens if an organisation relies on a single
   security layer (password only, no MFA) and that layer fails — ties to
   defense-in-depth without repeating the lecture's literal 3-gates wording.

**Round F — Cybercrime Types I (Identity Theft, Harassment, Hacking, Data
Breaches)** — card: four short definitions with one preventive measure each.
4 questions:
1. mcq — distinguish **Data Breach** from **Hacking/Unauthorised Access** in
   a new scenario where both look similar (an ex-employee's still-active
   login is used to export a customer list) — tests the access-vs-outcome
   distinction.
2. mcq — Identity Theft preventive measure applied to a new scenario
   (someone posts their full name + DOB publicly and gets impersonated).
3. multi — select ALL genuine preventive measures for Hacking/Unauthorised
   Access (RBAC, MFA, WAF + input validation, vendor risk assessments) vs a
   distractor like "disabling all remote access permanently" (unrealistic,
   not on the list).
4. **fillblank** — "Manipulating a person (not a machine) into revealing
   confidential information is called ___." → social engineering (bridges
   into Round G).

**Round G — Cybercrime Types II (Malware, Phishing/Social Engineering, DDoS,
APT)** — card: malware family tree + zero-day + DoS-vs-DDoS. Diagram: reuse
the malware `graph TD` from `week-8-learning.md` section 7; consider a second
small `promptDiagram` on one question showing one-attacker→target vs
many-attackers→target for the DDoS question. 5 questions:
1. mcq — **Q13** malware definition/hierarchy, new example (a macro hidden
   in a downloaded spreadsheet).
2. **fillblank** — **Q10** "A brand-new flaw with no existing defence
   signature is called a ___ vulnerability." → zero-day.
3. mcq — **Q9** DoS vs DDoS, new scenario (a ticket-sales site flooded from
   one machine vs. from thousands of hijacked devices worldwide).
4. **[WHY]** mcq — distinguish DDoS from an **APT** (End-of-Lecture slide
   question, restated with the actual facts inline): "attacker quietly lives
   inside a network for months, slowly exfiltrating data" (APT) vs
   "attacker floods a server with traffic to crash it" (DDoS) — what's the
   key difference and why does it matter for detection?
5. multi — select ALL genuine phishing preventive measures (user training,
   MFA, email/web filters) vs a distractor claiming a phone-call
   impersonation ("vishing") IS textbook phishing (it's social engineering,
   but not phishing specifically, which is message/email-based) — tests the
   phishing-vs-social-engineering boundary.

**Round H — Real Breaches & the Shared Responsibility Model** — card:
landlord/tenant analogy for Shared Responsibility (Snowflake) only — the
other three breaches' numbers are stated directly inside their own question
prompts, not on the card, to stay under the ~150-200 word cap. 4 questions:
1. mcq — Shared Responsibility applied to a NEW cloud scenario (a customer
   skips MFA and reuses a leaked password on their cloud account) — whose
   responsibility, provider or customer?
2. mcq — states inline: "TJX's 2005-2007 breach exposed up to 45.7 million
   accounts; data was intercepted over Wi-Fi before it reached encryption,
   and unencrypted data had also been stored since as early as 2002." Which
   CIA element was primarily broken, and what's the root technical cause?
3. mcq — states inline: "Kido International's 2025 ransomware attack exposed
   data on 25,000+ children, parents and staff across 38 countries; the
   attackers got in via weak third-party vendor access controls." Which
   vulnerability category does this best illustrate?
4. **multi** — select ALL statements about the Shared Responsibility Model
   that are true, using only facts restated in the card/question (provider
   owns platform infrastructure & uptime; customer owns MFA, access control,
   monitoring) vs a distractor claiming the provider is responsible for the
   customer's own account security.

**Round I — Slide-only content: Threat Categories & Individual Data
Rights** — card 1 (threat categories): 5-category list condensed to the 3
used in the sort below; card 2 (rights) may need its own short card or fold
into one ~180-word combined card if both ideas are simple enough — Writer's
call, keep each card ≤200 words. 5 questions:
1. **sort** — sort 6-8 new threat examples into Human-based / Technical /
   External (3 of the slide's 5 categories, chosen because they sort
   cleanly and avoid the Physical/Operational overlap with Round A/D).
2. **match** — match 4-5 of the 7 Individual Data Rights (informed, access,
   rectification, erasure, portability) to a one-line description each.
3. mcq — Right to Erasure applied to a new scenario that includes the legal
   exception (a bank must keep transaction records despite a deletion
   request, for regulatory reasons).
4. mcq — distinguish Right to Restrict Processing vs Right to Erasure in a
   new scenario (pausing marketing emails while keeping the account active,
   vs closing the account entirely).
5. **[WHY]** mcq — "Factors that make security harder" applied to a new
   scenario combining rapid tech change + an evolving threat landscape (a
   company adopting a new AI tool faster than its security team can vet it).

**Round J — Case Study Application: Healthcare Ransomware** (slide-only —
facts restated inline every time, no card needed since it's one scenario
used across the round). 3 questions, each opening with: "A mid-sized
healthcare organisation was hit after an employee clicked a phishing email
link, which installed ransomware on several hospital servers. Patient
records became temporarily unavailable, and some sensitive patient data was
also exposed. The attackers demanded payment to unlock the files."
1. **multi** — select ALL CIA Triad elements impacted (Confidentiality —
   data exposed; Availability — records unavailable) vs Integrity as a
   distractor (no evidence records were altered, only exposed/unavailable).
2. **[WHY]** mcq — best immediate incident-response step (contain/isolate
   affected servers per an incident-response plan) vs a distractor (pay the
   ransom immediately) — why is containment prioritised over paying?
3. mcq — legal/ethical obligation post-attack (notify affected patients per
   breach-disclosure obligations) vs a distractor (no obligation to disclose
   if the ransom is paid).

### Final mixed-review round (no card) — 7 questions
No card. At least 3 connect to earlier weeks (new questions, never copies).
No more than 2 consecutive questions on the same subtopic.

1. mcq **[earlier-week: Week 1]** — states inline: "In 2024 a faulty
   CrowdStrike software update crashed millions of Windows machines
   worldwide, grounding flights and disrupting hospitals for hours, with no
   attacker involved." Which CIA element does this best illustrate being
   compromised, and does a threat actor need to be involved for that to
   happen?
2. mcq **[earlier-week: Week 7]** — "Week 7 distinguished COBIT Governance
   (board-level EDM: Evaluate, Direct, Monitor) from Management (APO, BAI,
   DSS, MEA). A board deciding how much financial risk the organisation will
   accept from a potential data breach — is that Governance or Management
   under COBIT, and which part of Security Management's lifecycle does it
   correspond to?"
3. mcq **[earlier-week: Week 2]** — connects "aligning IT investment with
   business value" (Week 2) to security's "Cost Avoidance" reason (prevention
   costs less than breach impact) via a new numeric scenario (a $50,000
   security upgrade vs. a plausible $2M breach-and-recovery cost).
4. truefalse — new statement testing the vulnerability-vs-threat distinction
   from Round D, different wording/example than Round D used.
5. multi — jumbled: select ALL correct cybercrime-preventive-measure
   pairings across two different cybercrime types (mixes Round F/G content,
   new examples).
6. match — quick 3-row match of control type → new example, distinct
   examples from Round E's match.
7. **[WHY]** order — order the 4 general stages of responding to any
   security incident (Contain → Investigate/root-cause → Recover → Review &
   improve) grounded in a brand-new mini-scenario (a leaked API key), never
   reusing the Round B lifecycle wording verbatim.

### Lecture-quiz question coverage map (all 13 must land; none dropped)
| # | Topic | Round / question |
|---|---|---|
| Q1 | cybersecurity vs data/info security | Round A, Q4 |
| Q2 | interview "security fundamentals" = CIA | Round C intro / folded into Round C's framing (card) — if not asked directly as its own mcq, add as Round C Q0: "In a job interview you're asked how you'd secure an unfamiliar organisation. What's the one always-safe generic answer, and what does it lead to?" → verify this is present as an explicit question, not just card text |
| Q3 | postman #1 — confidentiality compromised | Round C, Q1 |
| Q4 | postman #2 — confidentiality not compromised | Round C, Q2 |
| Q5 | continuity vs integrity, context-dependent | Round C, Q4 |
| Q6 | how availability is compromised (DoS / physical) | fold into Round D or G — add explicit mcq if not already covered by G's DoS question; ensure a standalone "how can availability be compromised" (DoS attack OR physical failure, both options) lands in Round D as an added Q5 if Round D runs under 4, or as Round G's DoS question is broadened to also list physical failure as a correct co-option (multi, not mcq) |
| Q7 | "why a triangle" | Round C, Q3 |
| Q8 | "what is a vulnerability" | Round D, Q2 |
| Q9 | DoS vs DDoS | Round G, Q3 |
| Q10 | zero-day | Round G, Q2 |
| Q11 | "what is a control" | Round E, Q3 |
| Q12 | access control / least privilege | Round E, Q2 |
| Q13 | malware definition/hierarchy | Round G, Q1 |

**Planner note on Q2 and Q6:** the round layout above places 11 of 13
cleanly. Q2 (interview → "implement the fundamentals" → CIA) and Q6 (DoS
attack OR a physical failure, e.g. stolen server / cut cable, both count) are
thematically close to material already covered elsewhere in Round C/D/G. The
Writer must still add each as its own explicit standalone question (not just
a card sentence) — e.g. Q2 as an extra Round C question (a card can *set up*
the interview framing, but the graded question itself must ask it, per the
self-contained/no-card-answer rule) and Q6 as an extra Round D or G question
covering both causes of a compromised Availability. This pushes Round C to 7
and/or Round D or G to +1, which is fine — it keeps the paper at ~52-53,
still under the 55 cap. **Do not drop or merge these into card text only;
they must remain independently answerable questions**, since the guide
requires every lecture-quiz question to become its own practice question.

### End-of-Lecture / Case-Study slide questions (not live quiz questions —
lower-priority coverage, folded in rather than separately mandated)
- "Three dimensions of security" → Round A.
- "Why security management matters" → Round B.
- "Five vulnerability factors" → Round D.
- "CIA Triad practical examples" → Round C.
- "Phishing vs social engineering" → Round G.
- "DDoS vs APT" → Round G.
- Healthcare case study questions → Round J.

---

## TUTORIAL_PAPER — Change Management / BetaBank (paperNumber 1)

Source files: `exam-content/info5990/week-8-notes.md` (tutorial section),
`tutorial/INFO5990 2026-S1 Week 08 Tutorial sheet.pdf`,
`exam-content/info5990/week-7.ts` (continuity only — do not copy).

Target ~31 questions (tutorial papers run smaller, ~30-35 per the guide).
No transcript/video exists for this tutorial, so there's no lecture-quiz
pass — instead every one of the tutorial sheet's Part A (3) and Part B (5)
discussion questions must be represented as a recognition-format question
applying to BetaBank. None dropped.

### Quota checklist (approximate — tutorial papers don't need the lecture
paper's exact ratio, but keep the same format-selection logic)
| type | target |
|---|---|
| mcq | ~17 |
| multi | ~6 |
| truefalse | ~2 |
| fillblank | ~1 |
| match | ~2 |
| order | ~2 |
| sort | ~1 |
| **total** | **~31** |

At least 10 "why / what happens if" questions across this paper too — heavy
because the tutorial sheet's own discussion questions are almost all "why"
or "what should be done" in nature.

### Round-by-round plan

**Round 1 — PM vs CM, applied to BetaBank** — card: restaurant-kitchen
analogy (building the kitchen vs. filling the seats), rephrased fresh from
Week 7's version, framed around BetaBank's facts stated inline: "BetaBank
spent $5 million on a new CRM system. The pilot went live on schedule, but
after the pilot, only 30% of employees were using it — many reverted to
their old tools." 4 questions:
1. mcq — **Tutorial Part A Q1** (PM vs CM difference) applied: given the
   BetaBank facts above, was this a project management failure, a change
   management failure, or both? (Tests recognising PM succeeded technically
   while CM failed on adoption.)
2. mcq — **[WHY] Tutorial Part A Q2** ("why do orgs need CM even when
   delivered on time/budget") — new framing: if BetaBank's CEO says "we
   delivered on time and under the original scope, so why is this failing?"
   what's the direct answer?
3. multi — select ALL measures of Change Management success (confident,
   competent, consistent use) vs distractors that are actually Project
   Management measures (on time, on budget, in scope).
4. mcq — new scenario distinct from BetaBank (a hospital rolls out new
   scheduling software) testing the same PM-vs-CM distinction from a fresh
   angle, so students see it's general, not BetaBank-specific.

**Round 2 — Change Management models: 7S / ADKAR / Kotter's 8-Step** —
card: three-model quick-reference (Kotter's 8 steps in order; 7S's 7
elements split hard/soft; ADKAR's 5 stages) — likely needs to be trimmed to
fit ≤200 words; prioritise Kotter's step list and the 7S hard/soft split
since those drive the order/sort questions below; ADKAR gets a one-line
reminder since Week 7 already covered it in depth. Diagram: simple `graph TD`
chain for Kotter's 8 steps. 6 questions:
1. **order** — order Kotter's 8 steps correctly, grounded in a NEW mini
   BetaBank-adjacent scenario (not copying Week 7's Alpha Manufacturing
   wording).
2. **sort** — sort McKinsey 7S's 7 elements into Hard (Strategy, Structure,
   Systems) / Soft (Shared Values, Skills, Style, Staff) — 2 groups.
3. mcq — **Tutorial Part A Q3** ("explain one model and when it's most
   useful") turned into recognition form: given a scenario needing rapid
   individual-level adoption tracking (not organisation-wide restructuring),
   which model fits best and why?
4. mcq — **[WHY]** applies ADKAR to BetaBank: branch staff know the CRM is
   coming and understand the reasons (Awareness met), but are actively
   avoiding it out of complexity fears — which ADKAR stage is the gap, and
   why does jumping straight to training not fix it?
5. multi — select ALL of McKinsey 7S's "soft" elements (Shared Values,
   Skills, Style, Staff) vs distractors mixing in a hard element.
6. mcq — distinguish top-down vs bottom-up change approaches, applied to a
   NEW scenario (a CEO mandate vs. a grassroots pilot team) — connects to
   Week 7's same distinction with fresh wording.

**Round 3 — Change Curve & Psychology of Change** — card: change-curve
stages (shock/denial → resistance → exploration → commitment, or the
lecture's own stage names) + the 5 named psychological barriers (fear of the
unknown, loss aversion, cognitive dissonance, status quo bias, social proof)
+ Diffusion of Innovation categories (innovators/early adopters/laggards
etc). Diagram: `graph LR` of the curve stages in order. 5 questions:
1. mcq — **Tutorial Part B Q1a**: given branch staff's stated worry ("CRM is
   too complex and will slow us down"), which change-curve stage are they
   most likely in?
2. mcq — **Tutorial Part B Q1a (marketing)**: given marketing staff's stated
   confusion ("don't understand how it differs from their spreadsheets"),
   which stage are they in — same or different from branch staff, and why?
3. multi — **Tutorial Part B Q1b** select ALL psychological barriers visible
   in the BetaBank case (loss aversion — losing familiar spreadsheet
   workflow; status quo bias — reverting to old tools; fear of the unknown —
   complexity worry) vs a distractor barrier not evidenced in the case.
4. **fillblank** — "The tendency to keep doing things the old, familiar way
   even when a better option exists is called ___ bias." → status quo.
5. mcq — Diffusion of Innovation applied: branch staff reverting to old
   tools after the pilot best fits which adoption category, and what does
   that imply for the rollout strategy?

**Round 4 — BetaBank case: risks & interventions** — no separate card;
BetaBank facts restated inline in each prompt since this round IS the case
study. 5 questions, all stating relevant numbers inline (spend $5M,
adoption 30%, CEO quote):
1. **[WHY]** mcq — **Tutorial Part B Q3**: what specific business risk does
   continued 30% adoption create for BetaBank beyond the $5M sunk cost
   (e.g. compounding vendor/support costs, staff reverting to insecure
   spreadsheet workflows, marketing losing the promised data-driven
   capability)?
2. multi — **Tutorial Part B Q4**: select ALL of the 3 interventions that
   would plausibly raise adoption within 3 months (targeted coaching for
   branch staff's specific complexity fear; a working session showing
   marketing exactly what the CRM does that spreadsheets can't; short
   quick-win pilots with visible early wins) vs a distractor intervention
   that addresses a different problem (e.g. renegotiating the vendor
   contract price — doesn't address adoption).
3. mcq — stakeholder-mapping style question: given the case facts, which
   stakeholder group most needs direct engagement first, and why (branch
   staff, since they're both large in number and actively resisting, vs.
   marketing, which is confused but not yet resisting)?
4. mcq — **Tutorial Part B Q2** ("which model would you apply here and
   why") in recognition form: given BetaBank needs to rebuild employees'
   *desire* to use a system they already understand, which of the three
   models' structure best targets exactly that individual-level gap, and
   why does a structural model like 7S not directly fix it?
5. truefalse — new statement testing whether "the CRM project's on-time
   pilot delivery guarantees the change will succeed" (false — ties back to
   Round 1's PM-vs-CM point with a fresh angle).

**Round 5 — Change roles & practical strategies** — card: change-agent
network + stakeholder mapping + "quick wins" concept, applied to a
DIFFERENT company (not BetaBank) for variety. 4 questions:
1. **match** — match 3-4 change-management roles (sponsor, change agent /
   champion, resistor, end user) to a one-line description each.
2. mcq — "quick win" applied to a new scenario (a manufacturing firm
   showcasing one team's early success with a new inventory system to build
   momentum).
3. mcq — stakeholder mapping applied to a new scenario, distinguishing a
   high-power/high-resistance stakeholder from a low-power/supportive one.
4. multi — select ALL genuine business/IT outcomes of effective change
   management (higher adoption, faster ROI realisation, reduced shadow-IT
   workarounds) vs a distractor outcome that's actually a project management
   outcome (delivering within the original budget).

### Final mixed-review round (no card) — 7 questions
At least 3 connect to Week 7 (new questions, never copies of Week 7's Alpha
Manufacturing questions). No more than 2 consecutive on one subtopic.
1. mcq **[earlier-week: Week 7]** — new question applying Week 7's
   PM-vs-CM distinction to a fresh third scenario (neither Alpha
   Manufacturing nor BetaBank) to test the concept is generalised, not
   memorised per-case.
2. mcq **[earlier-week: Week 7]** — new question connecting Week 7's ADKAR
   coverage (Alpha Manufacturing) to a fresh BetaBank-adjacent detail not
   used in Round 2/3 above.
3. mcq **[earlier-week: Week 7]** — new question connecting Week 7's
   governance material (COBIT EDM/RACI) to who should be *accountable* for
   BetaBank's CRM adoption outcome, distinct from who is *responsible* for
   running training sessions.
4. truefalse — new Kotter's-8-steps statement, distinct wording from Round
   2.
5. multi — jumbled: select ALL correct statements mixing psychological
   barriers (Round 3) and intervention types (Round 4), new example.
6. **order** — order 4 generic stages of any change rollout (Awareness-build
   → Pilot → Broad rollout → Reinforcement) grounded in yet another new
   mini-scenario, distinct wording from Round 2's Kotter order question.
7. **[WHY]** mcq — "why" a change effort with strong Awareness and Ability
   but weak Desire and Reinforcement still fails long-term, applied to a
   brand-new scenario.

### Tutorial-sheet question coverage map (all 8 must land)
| Sheet question | Round / question |
|---|---|
| Part A Q1 — PM vs CM difference | Round 1, Q1 |
| Part A Q2 — why CM needed even on-time/budget | Round 1, Q2 |
| Part A Q3 — explain one model, when useful | Round 2, Q3 |
| Part B — change-curve stage, branch staff | Round 3, Q1 |
| Part B — change-curve stage, marketing staff | Round 3, Q2 |
| Part B — psychological barriers visible | Round 3, Q3 |
| Part B — which model would you apply, why | Round 4, Q4 |
| Part B — risks if adoption continues to fail | Round 4, Q1 |
| Part B — suggest 3 interventions | Round 4, Q2 |

---

## Cross-cutting reminders for the Writer stage
- Every question must be answerable from its own prompt + any preceding
  reading card + general knowledge — never "the deck/slides/tutorial sheet
  says."
- Cards teach via analogy + worked example + jargon decoder; questions apply
  the idea to a **new** example, never quoting a card sentence back as the
  answer.
- Distractors must be close/plausible, same length and specificity as the
  correct option — run `bun scripts/check-mcq-lengths.ts INFO5990` after
  writing and fix every flag.
- Check `correctIndex` distribution is roughly even across 0-3; run
  `bun scripts/shuffle-week-options.ts` if skewed.
- Run `bun scripts/check-exam-structure.ts` and `bun test` before considering
  the week done — both must pass with 0 issues / 0 failures.
