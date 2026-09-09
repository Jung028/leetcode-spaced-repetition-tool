# INFO5990 Week 6 — IT Governance — Study Notes

Source material for this week:

- `lecture/INFO5990 2026-S2 Week 06 - IT Governance.pdf` (lecture deck)
- `lecture/Reading 1 - COBIT.pdf` — Nurdin & Lubis (2023), *The IT Governance Measurement using COBIT 5 Framework in Quality Assurance Department* (a worked COBIT 5 DSS-domain audit case)
- `lecture/Reading 2 - ITIL v4.pdf` — Anand (2025), *ITIL 4 Explained – ITIL 4 IT Service Management Practices* (itsm.tools)
- `tutorial/INFO5990 2026-S1 Week 06 Tutorial Sheet.pdf` — DIKW, statistics in IT research, primary vs secondary research, the 5-step estimation process, MediCare Solutions EHR case study

> Note: the **tutorial sheet for Week 6 is not about IT governance** — it continues the information-quality / research-methods / project-estimation thread from earlier tutorials (DIKW, credible sources, the 5-step estimation process). Paper 1 is written only from that tutorial sheet; Paper 2 is written only from the lecture deck + the two readings.

---

## Important points

### Slide-sourced (lecture deck)

**What IT Governance is**

- IT Governance = the framework of **leadership, structures, and processes** that ensures an organisation's IT systems and strategies **support its overall business goals, deliver value, and manage risk**.
- It answers **3 questions**:
  1. Are we doing the **right things** with IT? → alignment with business strategy
  2. Are we doing them the **right way**? → processes, accountability, compliance
  3. Are we **getting the benefits**? → value delivery, performance measurement

**Why it matters in professional practice**

- **Accountability & responsibility** — IT professionals don't just "build systems"; they must ensure systems are secure, reliable, aligned with business needs. Governance frameworks clarify *who is accountable* (CIO, project leads, developers).
- **Ethical & professional standards** — poor governance → privacy breaches, unethical data use, financial loss. Professionals are bound by codes of conduct (**ACS, IEEE, ISACA**) to act responsibly and escalate risks.
- **Risk awareness** — IT projects often fail due to poor governance (scope creep, lack of oversight). Governance is part of risk management and compliance (e.g. **GDPR, APRA CPS 234**).
- **Alignment with business strategy** — IT is about delivering measurable business value, not "cool tech".
- **Career relevance** — many IT roles need governance-framework literacy (**COBIT, ITIL, ISO 38500**).

**IT Governance success**

- Successful when IT **delivers value, manages risk, and aligns with business strategy**.
- Key elements: **strategic alignment, value delivery, risk management, resource optimisation, performance measurement** (KPIs, Balanced Scorecards, regular audits).
- Indicators of success: projects on time / on budget / with expected outcomes; high executive support & stakeholder satisfaction; compliance with laws/regulations; IT decisions transparent, ethical, accountable.

**Why governance fails**

- **Lack of executive support** (no buy-in from CIO/CEO/Board → policies ignored, weak accountability)
- **Misalignment with business goals** (IT initiatives in isolation → technically sound, little value)
- **Poor communication & awareness** (staff don't understand the rules → inconsistent implementation)
- **Resistance to change** (governance = process changes, documentation, oversight → seen as bureaucratic)

**Governance frameworks — why**

- A structured set of practices, principles, processes guiding how IT is managed to support strategy, deliver value, control risk.
- Provide a **common language** between IT and business; define **roles/responsibilities/accountability**; ensure **compliance**; improve **efficiency & performance measurement**.
- Two frameworks taught: **COBIT and ITIL v4**.

**COBIT**

- **C**ontrol **Ob**jectives for **I**nformation and related **T**echnologies. Developed **1996**. Globally recognised IT governance & management framework, owned by **ISACA** (COBIT reading: developed by the **IT Governance Institute (ITGI)**, part of ISACA).
- Structured into **2 parts**:
  - **Governance Objectives → EDM** (Evaluate, Direct, Monitor) — "Are we doing the right things?" — owned by **boards & executives** (CIO, steering committees, board of directors).
  - **Management Objectives → PBRM** (Plan, Build, Run, Monitor) — "Are we doing things the right way?" — owned by **IT managers, project managers, operational teams**:
    - **Plan → APO** (Align, Plan, Organise): strategy, budget, enterprise architecture, project planning
    - **Build → BAI** (Build, Acquire, Implement): develop solutions, acquire infrastructure, configure systems
    - **Run → DSS** (Deliver, Service, Support): operate services, service desk, incident management, change management
    - **Monitor → MEA** (Monitor, Evaluate, Assess): evaluate performance, security, availability, risk monitoring
- **EDM sub-model**: **Evaluate** (assess stakeholder needs, goals, risks, compliance), **Direct** (set priorities, make governance decisions, allocate resources), **Monitor** (check performance, compliance, stakeholder satisfaction).

**Evolution of COBIT**

- COBIT 1 — control objectives for **IT auditing**
- COBIT 2 — broader IT management + governance elements
- COBIT 3 — alignment with business goals, risk-management focus
- COBIT 4 — comprehensive governance + management, **integrated other frameworks (ITIL, ISO)**
- COBIT 5 — **5 key governance principles**:
  1. Meeting stakeholder needs
  2. Covering the enterprise end-to-end
  3. Applying a single integrated framework
  4. Enabling a holistic approach
  5. Separating governance from management
- COBIT 2019 — **6th concept: design principles/factors** — customisation & flexibility; governance system tailored to organisation needs (size, risk, strategy, regulatory environment, priorities).

**COBIT 5 → COBIT 2019 changes**

- 5 principles → **6** principles
- **37 processes → 40** (new: Managed Assurance, Managed Projects, Managed Data)
- "**Enablers**" renamed "**Components**"
- Open-source-style model — periodically updated under a steering committee.

**COBIT 5 five principles — detail**

- Holistic approach is driven by interconnected **enablers**: processes, principles, culture, information, infrastructure, people.
- Separating governance from management: **governance sets direction and evaluates; management plans, builds, executes**. (Example: board sets the IT risk appetite; IT manager implements security controls within that boundary.)

**Purpose of COBIT** — Strategic Alignment; Value Delivery (optimise costs & resources); Risk Management; Resource Optimisation (people, processes, technology); Performance Measurement (**metrics and maturity models**).

**COBIT use case (university online learning)** — Provide stakeholder value (students/faculty/regulators); holistic approach (processes/people/technology/information); dynamic governance system (policies updated as ed-tech evolves); governance vs management (Senate/Board sets policy & risk appetite; CIO & IT staff implement LMS, uptime, security); tailored to enterprise needs; end-to-end governance covering all faculties (HR, Research, Administration), not just IT.

**ITSM**

- IT Service Management = the discipline & practice of **managing IT as a set of services that deliver value to customers** (internal or external).
- Focus on **Processes** (how IT is delivered), **People** (who uses/supports IT), **Services** (the outcomes IT provides), not just the technology.

**COBIT vs ITIL**

| | COBIT | ITIL |
|---|---|---|
| Type | Governance (and management) framework | Best-practice framework |
| Focus | Alignment, control, value, risk — *what* should be done | Implementing ITSM processes — *how* services are delivered/managed |
| Scope | Governance + management | Service lifecycle |
| Level | Strategic & Tactical | Operational & Tactical |
| Owner | ISACA | AXELOS (JV of UK Cabinet Office & Capita) |

**History of ITSM**

- **1960s** — hardware-focused, technology-centric, ad-hoc support ("know someone in IT")
- **1980s** — UK govt's **CCTA** (Central Computer and Telecommunications Agency) created **ITIL v1** (late 1980s)
- **1990s** — **ITIL v2** simplified into **Service Support** and **Service Delivery**; became global ITSM standard. **ISO/IEC 20000 (2005)** = first international ITSM standard, based on ITIL.
- **2000s** — **ITIL v3 (2007)** introduced the **Service Lifecycle** model; COBIT, MOF (Microsoft Operations Framework), ISO reinforced ITSM
- **2010s** — ITIL 2011 refined v3; **ITIL 4 (2019)** integrated **Agile** principles → flexible, adaptive, value co-creation
- **Today** — cloud (AWS/Azure/SaaS), automation & AI (chatbots, self-service, predictive analytics), UX as a core outcome

**ITIL v3 — 5-stage Service Lifecycle**

1. **Service Strategy** — define IT as a strategic service provider that delivers value (business outcomes, value creation, service portfolio, financial mgmt, risk mgmt)
2. **Service Design** — design services & processes to meet business needs (service catalog, availability, capacity, security, continuity, compliance)
3. **Service Transition** — build, test, deploy services safely (change mgmt, release mgmt, knowledge mgmt, service validation)
4. **Service Operation** — run and support services efficiently (incident mgmt, problem mgmt, request fulfilment, monitoring, service desk)
5. **Continual Service Improvement (CSI)** — measure & improve based on feedback and metrics (KPI monitoring, service reviews, lessons learned)

**ITIL v4**

- Latest ITSM framework, **released 2019 by AXELOS**; value-driven, flexible, digital-first (Agile, Lean, DevOps). ITIL = **a set of practices** giving a systematic approach to ITSM.
- **Key changes from ITIL v3**: the **four dimensions**, the **guiding principles**, the move from **processes → practices**, the **Service Value System (SVS)**.
- **Service Value System (SVS)** — ensures all components/activities work together to **co-create value**. 5 components: **Guiding Principles, Governance, Service Value Chain (SVC), Practices (34), Continual Improvement**.
- **7 guiding principles** (down from 9 in ITIL v3): Focus on value; Start where you are; Progress iteratively with feedback; Collaborate and promote visibility; Think and work holistically; Keep it simple and practical; Optimize and automate.
- **Service Value Chain (SVC)** — the central operating model; shows how value is created end-to-end. **6 activities**: Plan, Improve, Engage, Design & Transition, Obtain/Build, Deliver & Support. Activities can be combined in different sequences to form **value streams** (e.g. recreating the ITIL v3 lifecycle).
- **34 practices** (replace ITIL v3 "processes"): **14 General Management** (strategy, risk mgmt, continual improvement, knowledge mgmt, portfolio mgmt, project mgmt, …), **17 Service Management** (incident mgmt, problem mgmt, change enablement, service desk, service level mgmt, availability mgmt, …), **3 Technical Management** (deployment mgmt, software development & mgmt, infrastructure & platform mgmt).

**How ITIL processes work together**

- Incident occurs → **Incident Management**
- Root cause identified → **Problem Management**
- Change required → **Change Enablement**
- Update deployed → **Deployment Management**
- Service measured → **Continual Improvement**

**Airline example (ITIL v4 in practice)** — new online booking/check-in system fails on day one: **Service Operation / Incident Management** (service desk logs complaints, prioritise, temporary workaround); **Service Transition / Change Enablement** (root cause = misconfigured payment gateway during deployment → Change Request to fix without affecting live services); **CSI** (post-incident review, metrics = mean time to recovery / complaints resolved, new policy = all major releases go through end-to-end testing in staging).

**End-of-lecture questions** — Explain why IT governance is critical for IT professionals; list three benefits of ITSM; describe the difference between COBIT and ITIL; name the seven ITIL v4 guiding principles; briefly explain the SVC activities.

**Lecture case study** — USYD wants a new LMS to improve engagement & faculty collaboration. Context: past projects had delays & budget overruns; some staff resist new digital tools; team plans COBIT 2019 for governance, ITIL v4 for ITSM, agile for development.

### Reading 1 (COBIT) adds beyond the slides

- COBIT was developed by the **IT Governance Institute (ITGI)**, part of **ISACA**.
- COBIT 5 has **5 domains and 37 processes**; the **DSS (Deliver, Service and Support)** domain has **6 control objectives**:
  - **DSS01** Manage Operations
  - **DSS02** Manage Service Requests and Incidents
  - **DSS03** Manage Problems
  - **DSS04** Manage Continuity
  - **DSS05** Manage Security Services
  - **DSS06** Manage Business Process Controls
- EDM comes from the **governance area**; APO / BAI / DSS / MEA come from the **management area** of enterprise IT.
- **RACI** = **R**esponsible (does the work), **A**ccountable (directs/owns the outcome), **C**onsulted (gives input), **I**nformed (kept up to date). Part of the Responsibility Assignment Matrix (RAM); in COBIT 5 the RACI chart identifies which respondents to interview in an audit.
- **Capability levels** (COBIT 5 uses a **Capability Model**; COBIT 4.1 used a **Maturity Model** — both have 6 levels):
  - **0 Incomplete** — not implemented / fails its purpose
  - **1 Performed** — implemented, achieves its purpose
  - **2 Managed** — planned, monitored, adjusted; results defined and controlled
  - **3 Established** — documented and communicated
  - **4 Predictable** — monitored, measured, predicted
  - **5 Optimizing** — continuously improved toward current & future objectives
- The case study found the QA Department averaged **Level 3 (Established)**, with 4 of 6 DSS sub-domains still at **Level 1 (Performed)** because of missing SOPs / documentation; target level **4 (Predictable)**.
- **Gap analysis** = comparing current (as-is) capability against expected (to-be) target, to see how far apart they are and what to fix.
- IT audit = collecting and evaluating evidence to determine whether a system can safeguard assets, maintain data integrity, and support organisational goals efficiently.

### Reading 2 (ITIL v4) adds beyond the slides

- Motivated by the **Fourth Industrial Revolution** / digital disruption; ITIL 4 is an update to ITIL v3 (2011 Edition).
- ITIL 4 provides a **digital operating model** and looks at ITSM, development, operations, business relationships and governance **holistically** — an integrated model for digital service management focused on customer service / satisfaction / experience.
- **Four dimensions of service management** (needed to create value; keep them balanced):
  1. **Organizations and people** — culture supports objectives; right staff capacity & competency
  2. **Information and technology** — the information, knowledge and technologies needed to manage services
  3. **Partners and suppliers** — the suppliers involved in design/deployment/delivery/support/improvement and their relationship to the org
  4. **Value streams and processes** — are the parts of the org working in an integrated, coordinated way
- The guiding principles are **not new** but ITIL 4 has **7 (down from 9)**; they should be followed at **every stage of service delivery**.
- The **34 management practices** are "sets of organizational resources for performing work or accomplishing an objective." Newer ITIL 4 practices explicitly named: **Organizational change management**, **Service desk** (now a practice), **IT asset management** (now included).
- ITIL 4 Foundation is the entry-level, multiple-choice exam; higher levels: Managing Professional, Strategic Leader, Master; Practice Manager streams: *Monitor, Support and Fulfil* / *Plan, Implement and Control* / *Collaborate, Assure and Improve*.
- ITIL 4 can be adopted by organisations of any size/geography/vertical; the limiting factor is usually **existing ITSM maturity** (and budget).

### Video-only content

**No lecture recording available for Week 6** — the app reports no video in the Week 6 folder for this run, so there is no transcript. Nothing in this section.

---

## Post-lecture Q&A

**N/A this week — no lecture recording.** Lecture recordings normally keep rolling into an informal teacher/student discussion; there is no recording for Week 6, so there is no post-lecture Q&A to summarise and no in-class / Mentimeter questions to mine. The lecture deck's own "End of Lecture Questions" slide (5 questions) and "Case Study based Questions" slide (4 questions) are the closest equivalent and have been turned into practice questions in `week-6.ts` Paper 2.
