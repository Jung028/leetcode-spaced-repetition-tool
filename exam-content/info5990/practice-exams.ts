import type { ExamPaperSeed } from "../types";

export const INFO5990_PRACTICE_EXAM_PAPERS: ExamPaperSeed[] = [
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 4,
    "title": "Exam Paper — Practice Exam 1",
    "topics": "50-mark final-exam practice paper 1: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A technically strong solution has no agreed business outcome. What should the team do first?",
        "options": [
          "Select the newest technology",
          "Clarify the organisational objective and measurable benefits",
          "Treat on-time delivery as value",
          "Let the supplier define priorities"
        ],
        "correctIndex": 1,
        "modelAnswer": "Clarify objectives and measurable benefits before committing."
      },
      {
        "type": "mcq",
        "prompt": "Statutory requirements are stable and mandatory. Which approach feature helps?",
        "options": [
          "Defined phases and formal review points",
          "Unlimited change at any time",
          "Remove documentation",
          "Avoid acceptance criteria"
        ],
        "correctIndex": 0,
        "modelAnswer": "Stable obligations benefit from defined controls and gates."
      },
      {
        "type": "mcq",
        "prompt": "A comparable completed project is available for estimating. Which technique uses it directly?",
        "options": [
          "Estimation by analogy",
          "Random contingency",
          "Function points based only on team size",
          "Ignore history"
        ],
        "correctIndex": 0,
        "modelAnswer": "Analogy uses actual results from similar work, adjusted for differences."
      },
      {
        "type": "mcq",
        "prompt": "Which statement best distinguishes COBIT and ITIL?",
        "options": [
          "COBIT supports enterprise IT governance; ITIL supports service-management practices",
          "COBIT is ticketing; ITIL is ethics",
          "COBIT replaces strategy",
          "They are estimation methods"
        ],
        "correctIndex": 0,
        "modelAnswer": "They address related but distinct governance and service-management needs."
      },
      {
        "type": "mcq",
        "prompt": "Employees understand and want a change but cannot complete the workflow. Weakest ADKAR element?",
        "options": [
          "Awareness",
          "Desire",
          "Ability",
          "Reinforcement"
        ],
        "correctIndex": 2,
        "modelAnswer": "Ability concerns applying skills to perform the new work."
      },
      {
        "type": "mcq",
        "prompt": "Release frequency increases while customer complaints rise. Best conclusion?",
        "options": [
          "More releases proves value",
          "Delivery activity alone does not show outcomes",
          "Complaints are irrelevant",
          "Stop all releases permanently"
        ],
        "correctIndex": 1,
        "modelAnswer": "Measure service outcomes and quality alongside delivery."
      },
      {
        "type": "mcq",
        "prompt": "In Tuckman, a team argues over roles and norms. This most closely reflects:",
        "options": [
          "Forming",
          "Storming",
          "Performing",
          "Adjourning"
        ],
        "correctIndex": 1,
        "modelAnswer": "Storming includes negotiation and conflict."
      },
      {
        "type": "mcq",
        "prompt": "A project has EV=$80k and PV=$100k. SPI below 1 means:",
        "options": [
          "Ahead of planned progress",
          "Behind planned progress",
          "Under budget by definition",
          "Complete"
        ],
        "correctIndex": 1,
        "modelAnswer": "SPI=EV/PV; below 1 means less value earned than planned."
      },
      {
        "type": "mcq",
        "prompt": "The ADKAR element for understanding why a change is needed is:",
        "options": [
          "Awareness",
          "Ability",
          "Reinforcement",
          "Control"
        ],
        "correctIndex": 0,
        "modelAnswer": "Awareness is understanding the need for change."
      },
      {
        "type": "mcq",
        "prompt": "A good communication plan should define:",
        "options": [
          "Audience, purpose, channel, timing, owner and feedback",
          "One email for everyone",
          "Only technical details",
          "No cadence"
        ],
        "correctIndex": 0,
        "modelAnswer": "Tailored, owned communication supports engagement."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: HarbourStay Guest Services Transformation: HarbourStay is replacing booking, loyalty, payment and housekeeping systems with a cloud platform before summer. Hotel managers and guests revise workflows after releases; payment-provider access reviews are inconsistent. Peak searches slow down and end-to-end guest journeys remain untested.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: MediSupply Procurement Renewal: A medical distributor replaces procurement and inventory systems. A standard vendor product must fit local workflows. Shared integration accounts have excessive privileges, end-to-end purchasing-to-delivery tests fail and a major hospital contract starts soon after launch.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: LearnAI Academic Support: A university pilots AI study support integrated with its learning system. Historical student data may be shared with a supplier, ownership and retention are unclear, answers can be confidently incorrect and results vary across student groups.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: SkyFreight Operations Modernisation: An air-cargo operator integrates booking, warehouse and customs services. Privileged support activity from an unusual location was detected. Functional tests pass, but peak processing is unstable and recovery has not been exercised.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 5,
    "title": "Exam Paper — Practice Exam 2",
    "topics": "50-mark final-exam practice paper 2: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "What is a main benefit of a WBS?",
        "options": [
          "Removes uncertainty",
          "Breaks scope into estimable work packages",
          "Guarantees stable requirements",
          "Removes need for assumptions"
        ],
        "correctIndex": 1,
        "modelAnswer": "Decomposition supports more grounded estimates."
      },
      {
        "type": "mcq",
        "prompt": "Many committees exist, but no one can accept a technology risk. Core problem?",
        "options": [
          "Insufficient code testing",
          "Unclear decision rights and accountability",
          "No function-point analysis",
          "Insufficient training"
        ],
        "correctIndex": 1,
        "modelAnswer": "Governance requires explicit authority and ownership."
      },
      {
        "type": "mcq",
        "prompt": "Employees use a system successfully, then return to the old process. Focus on:",
        "options": [
          "Awareness",
          "Knowledge",
          "Reinforcement",
          "Procurement"
        ],
        "correctIndex": 2,
        "modelAnswer": "Reinforcement sustains the change."
      },
      {
        "type": "mcq",
        "prompt": "A system passes unit tests but fails when two services interact. Main testing gap?",
        "options": [
          "Unit testing",
          "Integration and end-to-end testing",
          "Code formatting",
          "User attendance"
        ],
        "correctIndex": 1,
        "modelAnswer": "Cross-component interactions need integration and journey-level tests."
      },
      {
        "type": "mcq",
        "prompt": "An early pilot estimate should be strengthened by:",
        "options": [
          "Linear scaling only",
          "WBS, explicit assumptions, ranges and actuals",
          "Only an optimistic date",
          "Ignoring excluded work"
        ],
        "correctIndex": 1,
        "modelAnswer": "Decomposition and evidence expose omissions and uncertainty."
      },
      {
        "type": "mcq",
        "prompt": "Which is a useful risk-register entry?",
        "options": [
          "Risk title only",
          "Cause-event-effect, owner, rating, trigger and response",
          "Guarantee it will not occur",
          "No review date"
        ],
        "correctIndex": 1,
        "modelAnswer": "A useful risk entry supports action and accountability."
      },
      {
        "type": "mcq",
        "prompt": "Staff know the reason but do not know how to perform the new process. Focus on:",
        "options": [
          "Desire",
          "Knowledge",
          "Reinforcement",
          "Awareness"
        ],
        "correctIndex": 1,
        "modelAnswer": "Knowledge is knowing how; ability is performing it."
      },
      {
        "type": "mcq",
        "prompt": "Which is a suitable benefit measure?",
        "options": [
          "Number of features shipped",
          "Reduced average service time versus baseline",
          "Team size",
          "Number of meetings"
        ],
        "correctIndex": 1,
        "modelAnswer": "It measures an outcome against a baseline."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to use a secret design as its main security control. This is:",
        "options": [
          "Defence in depth",
          "Security through obscurity",
          "Least privilege",
          "Separation of duties"
        ],
        "correctIndex": 1,
        "modelAnswer": "Design secrecy alone is not a dependable security control."
      },
      {
        "type": "mcq",
        "prompt": "A shared administrator account creates which major concern?",
        "options": [
          "Better accountability",
          "Weak attribution and broad compromise impact",
          "Improved least privilege",
          "No security effect"
        ],
        "correctIndex": 1,
        "modelAnswer": "Shared credentials obscure accountability and increase blast radius."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: SkyFreight Operations Modernisation: An air-cargo operator integrates booking, warehouse and customs services. Privileged support activity from an unusual location was detected. Functional tests pass, but peak processing is unstable and recovery has not been exercised.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: MetroPay Service Renewal: A transit agency updates payment services. Launch is fixed, partner retries sometimes duplicate top-ups, logs may contain personal information and frontline staff have not practised the exception workflow.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: MetroPay Service Renewal: A transit agency updates payment services. Launch is fixed, partner retries sometimes duplicate top-ups, logs may contain personal information and frontline staff have not practised the exception workflow.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: RetailCloud Migration: A retailer migrates loyalty and customer service to a cloud platform. A pilot used clean data from one store, but other regions use different processes. Customer complaints rise and governance cannot agree who accepts privacy risk.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 6,
    "title": "Exam Paper — Practice Exam 3",
    "topics": "50-mark final-exam practice paper 3: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A data controller asks a vendor for historical user data to train a product. First resolve:",
        "options": [
          "Whether the vendor can use any data",
          "Purpose, authority, minimisation, retention and safeguards",
          "The vendor logo",
          "Whether data is interesting"
        ],
        "correctIndex": 1,
        "modelAnswer": "Data governance requires defined purpose, authority and controls."
      },
      {
        "type": "mcq",
        "prompt": "A high-power regulator and low-power affected community group require:",
        "options": [
          "Identical communication",
          "Tailored engagement that reflects authority and impact",
          "Ignore the community",
          "Only contact the regulator"
        ],
        "correctIndex": 1,
        "modelAnswer": "Stakeholder plans should consider power, legitimacy, impact and needs."
      },
      {
        "type": "mcq",
        "prompt": "A project has PV=$100k, EV=$80k and AC=$90k. CPI is:",
        "options": [
          "0.89",
          "1.11",
          "0.80",
          "1.25"
        ],
        "correctIndex": 0,
        "modelAnswer": "CPI=EV/AC=80/90≈0.89, below 1 indicates cost inefficiency."
      },
      {
        "type": "mcq",
        "prompt": "Which is the strongest change-control practice?",
        "options": [
          "Block every change",
          "Assess impacts and route to authorized decision maker",
          "Implement silently",
          "Update baseline before approval"
        ],
        "correctIndex": 1,
        "modelAnswer": "Assess and authorize before changing approved baselines."
      },
      {
        "type": "mcq",
        "prompt": "A manager wants to know if training worked. Strong evidence is:",
        "options": [
          "Attendance alone",
          "Observed successful completion of realistic tasks",
          "Slide count",
          "Meeting invitations"
        ],
        "correctIndex": 1,
        "modelAnswer": "Demonstrated performance is evidence of capability."
      },
      {
        "type": "mcq",
        "prompt": "A product has high overall accuracy but poor results for one group. Best next step?",
        "options": [
          "Deploy immediately",
          "Analyse subgroup outcomes and apply documented release criteria",
          "Hide the data",
          "Use average accuracy only"
        ],
        "correctIndex": 1,
        "modelAnswer": "Disaggregated impact analysis can reveal unequal harm."
      },
      {
        "type": "mcq",
        "prompt": "Least privilege means:",
        "options": [
          "Every user is admin",
          "Each identity receives only access needed for its role",
          "Share accounts",
          "Remove audit logs"
        ],
        "correctIndex": 1,
        "modelAnswer": "Permissions should be limited to the minimum necessary."
      },
      {
        "type": "mcq",
        "prompt": "A suspected customer-data exposure is found. First priorities include:",
        "options": [
          "Delete logs",
          "Contain exposure, preserve evidence and notify accountable responders",
          "Post unverified details",
          "Wait for launch"
        ],
        "correctIndex": 1,
        "modelAnswer": "Containment and evidence preservation support safe incident handling."
      },
      {
        "type": "mcq",
        "prompt": "A security review identifies high risk but no owner. Governance should:",
        "options": [
          "Add more status pages",
          "Assign an accountable owner, authority and response deadline",
          "Remove the item",
          "Ask all users to decide"
        ],
        "correctIndex": 1,
        "modelAnswer": "Risk requires ownership and decision authority."
      },
      {
        "type": "mcq",
        "prompt": "ACS professional responsibilities most directly support:",
        "options": [
          "Honesty, competence, respect and public interest",
          "Concealing risks to protect a launch",
          "Ignoring affected users",
          "Sharing credentials"
        ],
        "correctIndex": 0,
        "modelAnswer": "Professional codes require responsible conduct and regard for public interest."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: SafeCampus Response Service: A university connects mobile reports, campus security and external responders. A pilot improved response time but excluded disabled students and did not test after-hours routing. Data-sharing approval is incomplete.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: GreenGrid Customer Portal: An energy provider outsources a customer portal. Hosting requirements are stable but analytics scope is uncertain. A supplier asks for extra features after award; service transition and data-portability terms are unclear.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: HarbourStay Guest Services Transformation: HarbourStay is replacing booking, loyalty, payment and housekeeping systems with a cloud platform before summer. Hotel managers and guests revise workflows after releases; payment-provider access reviews are inconsistent. Peak searches slow down and end-to-end guest journeys remain untested.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: MediSupply Procurement Renewal: A medical distributor replaces procurement and inventory systems. A standard vendor product must fit local workflows. Shared integration accounts have excessive privileges, end-to-end purchasing-to-delivery tests fail and a major hospital contract starts soon after launch.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 7,
    "title": "Exam Paper — Practice Exam 4",
    "topics": "50-mark final-exam practice paper 4: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A project has EV=$80k and PV=$100k. SPI below 1 means:",
        "options": [
          "Ahead of planned progress",
          "Behind planned progress",
          "Under budget by definition",
          "Complete"
        ],
        "correctIndex": 1,
        "modelAnswer": "SPI=EV/PV; below 1 means less value earned than planned."
      },
      {
        "type": "mcq",
        "prompt": "The ADKAR element for understanding why a change is needed is:",
        "options": [
          "Awareness",
          "Ability",
          "Reinforcement",
          "Control"
        ],
        "correctIndex": 0,
        "modelAnswer": "Awareness is understanding the need for change."
      },
      {
        "type": "mcq",
        "prompt": "A good communication plan should define:",
        "options": [
          "Audience, purpose, channel, timing, owner and feedback",
          "One email for everyone",
          "Only technical details",
          "No cadence"
        ],
        "correctIndex": 0,
        "modelAnswer": "Tailored, owned communication supports engagement."
      },
      {
        "type": "mcq",
        "prompt": "A professional sees a serious privacy flaw before release. They should:",
        "options": [
          "Sign off anyway",
          "Document, validate and escalate through accountable channels",
          "Conceal it",
          "Test using real data without approval"
        ],
        "correctIndex": 1,
        "modelAnswer": "Professional duties require honest, proportionate escalation."
      },
      {
        "type": "mcq",
        "prompt": "MFA and least privilege are:",
        "options": [
          "Interchangeable",
          "Different controls addressing different risks",
          "Both encryption methods",
          "Only useful for vendors"
        ],
        "correctIndex": 1,
        "modelAnswer": "MFA supports identity assurance; least privilege limits authorized actions."
      },
      {
        "type": "mcq",
        "prompt": "Which is a preventive security control?",
        "options": [
          "Access control enforcing role permissions",
          "Post-incident report",
          "Lessons-learned meeting",
          "Historical trend report"
        ],
        "correctIndex": 0,
        "modelAnswer": "Role authorization can prevent unauthorized actions."
      },
      {
        "type": "mcq",
        "prompt": "An ethical utilitarian analysis primarily asks:",
        "options": [
          "Which option maximizes overall consequences and minimizes harm",
          "Which rule is easiest to ignore",
          "Who has the most power",
          "What is cheapest regardless of harm"
        ],
        "correctIndex": 0,
        "modelAnswer": "Utilitarian reasoning evaluates consequences and overall welfare."
      },
      {
        "type": "mcq",
        "prompt": "A contractor no longer needs production access. Best action?",
        "options": [
          "Keep account for convenience",
          "Revoke access promptly and review activity",
          "Share it with new staff",
          "Disable audit logging"
        ],
        "correctIndex": 1,
        "modelAnswer": "Timely deprovisioning limits exposure."
      },
      {
        "type": "mcq",
        "prompt": "In a service transition, which item most supports continuity?",
        "options": [
          "Marketing announcement",
          "Runbooks, access handover, support ownership and rehearsed recovery",
          "More project slides",
          "An unowned backlog"
        ],
        "correctIndex": 1,
        "modelAnswer": "Operational knowledge and ownership enable support."
      },
      {
        "type": "mcq",
        "prompt": "Decision-focused executive updates should:",
        "options": [
          "State issue, impact, options, recommendation and decision needed",
          "List all raw logs",
          "Avoid owners",
          "Hide uncertainty"
        ],
        "correctIndex": 0,
        "modelAnswer": "Executives need concise evidence tied to an actionable decision."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: SafeCampus Response Service: A university connects mobile reports, campus security and external responders. A pilot improved response time but excluded disabled students and did not test after-hours routing. Data-sharing approval is incomplete.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: AquaGrid Smart Water Program: A utility combines sensor data and cloud analytics for leak response. Device specifications are costly to change while analytics evolve. A city-wide estimate comes from a small pilot. Contractors have remote access, reused credentials were found, and unusual commands appeared on a test device.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: SkyFreight Operations Modernisation: An air-cargo operator integrates booking, warehouse and customs services. Privileged support activity from an unusual location was detected. Functional tests pass, but peak processing is unstable and recovery has not been exercised.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: MetroPay Service Renewal: A transit agency updates payment services. Launch is fixed, partner retries sometimes duplicate top-ups, logs may contain personal information and frontline staff have not practised the exception workflow.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 8,
    "title": "Exam Paper — Practice Exam 5",
    "topics": "50-mark final-exam practice paper 5: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "Which is a suitable benefit measure?",
        "options": [
          "Number of features shipped",
          "Reduced average service time versus baseline",
          "Team size",
          "Number of meetings"
        ],
        "correctIndex": 1,
        "modelAnswer": "It measures an outcome against a baseline."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to use a secret design as its main security control. This is:",
        "options": [
          "Defence in depth",
          "Security through obscurity",
          "Least privilege",
          "Separation of duties"
        ],
        "correctIndex": 1,
        "modelAnswer": "Design secrecy alone is not a dependable security control."
      },
      {
        "type": "mcq",
        "prompt": "A shared administrator account creates which major concern?",
        "options": [
          "Better accountability",
          "Weak attribution and broad compromise impact",
          "Improved least privilege",
          "No security effect"
        ],
        "correctIndex": 1,
        "modelAnswer": "Shared credentials obscure accountability and increase blast radius."
      },
      {
        "type": "mcq",
        "prompt": "Which is a detective control?",
        "options": [
          "Audit logging and anomalous access alerts",
          "Password policy alone",
          "Design review only",
          "Procurement contract"
        ],
        "correctIndex": 0,
        "modelAnswer": "Monitoring can detect suspicious activity."
      },
      {
        "type": "mcq",
        "prompt": "A deontological analysis primarily considers:",
        "options": [
          "Duties, rights and principles",
          "Only total financial return",
          "Only delivery speed",
          "Popularity"
        ],
        "correctIndex": 0,
        "modelAnswer": "Deontology emphasizes duties and constraints on action."
      },
      {
        "type": "mcq",
        "prompt": "A release has no tested recovery procedure. Best response?",
        "options": [
          "Assume backup works",
          "Test recovery and define owners/triggers before release",
          "Ignore it if unit tests pass",
          "Ask users to recover data"
        ],
        "correctIndex": 1,
        "modelAnswer": "Recovery evidence is part of service readiness."
      },
      {
        "type": "mcq",
        "prompt": "A production service outage is an incident; repeated underlying cause analysis is typically:",
        "options": [
          "Problem management",
          "Awareness",
          "Procurement",
          "Estimation"
        ],
        "correctIndex": 0,
        "modelAnswer": "Problem management investigates and manages underlying causes."
      },
      {
        "type": "mcq",
        "prompt": "A formal risk acceptance should include:",
        "options": [
          "Named authorized owner, rationale, conditions and review date",
          "Only verbal agreement",
          "No residual risk",
          "A developer signature regardless of authority"
        ],
        "correctIndex": 0,
        "modelAnswer": "Acceptance should be explicit, authorized and reviewable."
      },
      {
        "type": "mcq",
        "prompt": "Users understand their needs only after seeing features. Which approach fits?",
        "options": [
          "Sequential delivery with no change",
          "Iterations with feedback and reprioritisation",
          "Deployment without acceptance criteria",
          "Technical design without users"
        ],
        "correctIndex": 1,
        "modelAnswer": "Iteration supports learning and controlled refinement."
      },
      {
        "type": "mcq",
        "prompt": "A stakeholder has high influence and high interest. Best approach?",
        "options": [
          "Generic infrequent updates",
          "Close engagement and timely decision-relevant communication",
          "Technical detail regardless of role",
          "Contact after completion"
        ],
        "correctIndex": 1,
        "modelAnswer": "High influence and interest warrant close, tailored engagement."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: JusticeConnect Digital Case Platform: A public agency builds a case platform for applications, evidence and payments. Legal controls are stable, workflows evolve, records move to approved external organisations, retention labels are inconsistent and accessibility tests identify barriers.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: RetailCloud Migration: A retailer migrates loyalty and customer service to a cloud platform. A pilot used clean data from one store, but other regions use different processes. Customer complaints rise and governance cannot agree who accepts privacy risk.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: SafeCampus Response Service: A university connects mobile reports, campus security and external responders. A pilot improved response time but excluded disabled students and did not test after-hours routing. Data-sharing approval is incomplete.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: SkyFreight Operations Modernisation: An air-cargo operator integrates booking, warehouse and customs services. Privileged support activity from an unusual location was detected. Functional tests pass, but peak processing is unstable and recovery has not been exercised.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 9,
    "title": "Exam Paper — Practice Exam 6",
    "topics": "50-mark final-exam practice paper 6: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A suspected customer-data exposure is found. First priorities include:",
        "options": [
          "Delete logs",
          "Contain exposure, preserve evidence and notify accountable responders",
          "Post unverified details",
          "Wait for launch"
        ],
        "correctIndex": 1,
        "modelAnswer": "Containment and evidence preservation support safe incident handling."
      },
      {
        "type": "mcq",
        "prompt": "A security review identifies high risk but no owner. Governance should:",
        "options": [
          "Add more status pages",
          "Assign an accountable owner, authority and response deadline",
          "Remove the item",
          "Ask all users to decide"
        ],
        "correctIndex": 1,
        "modelAnswer": "Risk requires ownership and decision authority."
      },
      {
        "type": "mcq",
        "prompt": "ACS professional responsibilities most directly support:",
        "options": [
          "Honesty, competence, respect and public interest",
          "Concealing risks to protect a launch",
          "Ignoring affected users",
          "Sharing credentials"
        ],
        "correctIndex": 0,
        "modelAnswer": "Professional codes require responsible conduct and regard for public interest."
      },
      {
        "type": "mcq",
        "prompt": "A supplier contract has uncertain deliverables. Useful control?",
        "options": [
          "Uncapped spend",
          "Capped budget, staged acceptance and frequent review",
          "No progress reporting",
          "No exit clause"
        ],
        "correctIndex": 1,
        "modelAnswer": "Controls should preserve oversight as scope is learned."
      },
      {
        "type": "mcq",
        "prompt": "A pilot benefits claim is strongest when it includes:",
        "options": [
          "No comparison",
          "Baseline, representative sample, outcome and limitations",
          "Only a testimonial",
          "Project spend"
        ],
        "correctIndex": 1,
        "modelAnswer": "A credible claim depends on relevant comparative evidence."
      },
      {
        "type": "mcq",
        "prompt": "A technically strong solution has no agreed business outcome. What should the team do first?",
        "options": [
          "Select the newest technology",
          "Clarify the organisational objective and measurable benefits",
          "Treat on-time delivery as value",
          "Let the supplier define priorities"
        ],
        "correctIndex": 1,
        "modelAnswer": "Clarify objectives and measurable benefits before committing."
      },
      {
        "type": "mcq",
        "prompt": "Statutory requirements are stable and mandatory. Which approach feature helps?",
        "options": [
          "Defined phases and formal review points",
          "Unlimited change at any time",
          "Remove documentation",
          "Avoid acceptance criteria"
        ],
        "correctIndex": 0,
        "modelAnswer": "Stable obligations benefit from defined controls and gates."
      },
      {
        "type": "mcq",
        "prompt": "A comparable completed project is available for estimating. Which technique uses it directly?",
        "options": [
          "Estimation by analogy",
          "Random contingency",
          "Function points based only on team size",
          "Ignore history"
        ],
        "correctIndex": 0,
        "modelAnswer": "Analogy uses actual results from similar work, adjusted for differences."
      },
      {
        "type": "mcq",
        "prompt": "Which statement best distinguishes COBIT and ITIL?",
        "options": [
          "COBIT supports enterprise IT governance; ITIL supports service-management practices",
          "COBIT is ticketing; ITIL is ethics",
          "COBIT replaces strategy",
          "They are estimation methods"
        ],
        "correctIndex": 0,
        "modelAnswer": "They address related but distinct governance and service-management needs."
      },
      {
        "type": "mcq",
        "prompt": "Employees understand and want a change but cannot complete the workflow. Weakest ADKAR element?",
        "options": [
          "Awareness",
          "Desire",
          "Ability",
          "Reinforcement"
        ],
        "correctIndex": 2,
        "modelAnswer": "Ability concerns applying skills to perform the new work."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: HarbourStay Guest Services Transformation: HarbourStay is replacing booking, loyalty, payment and housekeeping systems with a cloud platform before summer. Hotel managers and guests revise workflows after releases; payment-provider access reviews are inconsistent. Peak searches slow down and end-to-end guest journeys remain untested.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: JusticeConnect Digital Case Platform: A public agency builds a case platform for applications, evidence and payments. Legal controls are stable, workflows evolve, records move to approved external organisations, retention labels are inconsistent and accessibility tests identify barriers.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: MetroPay Service Renewal: A transit agency updates payment services. Launch is fixed, partner retries sometimes duplicate top-ups, logs may contain personal information and frontline staff have not practised the exception workflow.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: AquaGrid Smart Water Program: A utility combines sensor data and cloud analytics for leak response. Device specifications are costly to change while analytics evolve. A city-wide estimate comes from a small pilot. Contractors have remote access, reused credentials were found, and unusual commands appeared on a test device.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 10,
    "title": "Exam Paper — Practice Exam 7",
    "topics": "50-mark final-exam practice paper 7: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A contractor no longer needs production access. Best action?",
        "options": [
          "Keep account for convenience",
          "Revoke access promptly and review activity",
          "Share it with new staff",
          "Disable audit logging"
        ],
        "correctIndex": 1,
        "modelAnswer": "Timely deprovisioning limits exposure."
      },
      {
        "type": "mcq",
        "prompt": "In a service transition, which item most supports continuity?",
        "options": [
          "Marketing announcement",
          "Runbooks, access handover, support ownership and rehearsed recovery",
          "More project slides",
          "An unowned backlog"
        ],
        "correctIndex": 1,
        "modelAnswer": "Operational knowledge and ownership enable support."
      },
      {
        "type": "mcq",
        "prompt": "Decision-focused executive updates should:",
        "options": [
          "State issue, impact, options, recommendation and decision needed",
          "List all raw logs",
          "Avoid owners",
          "Hide uncertainty"
        ],
        "correctIndex": 0,
        "modelAnswer": "Executives need concise evidence tied to an actionable decision."
      },
      {
        "type": "mcq",
        "prompt": "A serious project risk is discovered. What is the strongest professional response?",
        "options": [
          "Record and escalate it with evidence, ownership and options",
          "Keep it in the technical team",
          "Remove it if it delays delivery",
          "Assume executives know"
        ],
        "correctIndex": 0,
        "modelAnswer": "Evidence-based escalation supports accountable decisions."
      },
      {
        "type": "mcq",
        "prompt": "An executive update is technical but asks for no decision. Best improvement?",
        "options": [
          "Add raw data",
          "Use a concise structure and state the decision required",
          "Send unstructured messages",
          "Remove the assessment"
        ],
        "correctIndex": 1,
        "modelAnswer": "Decision-focused communication makes the action explicit."
      },
      {
        "type": "mcq",
        "prompt": "What is a main benefit of a WBS?",
        "options": [
          "Removes uncertainty",
          "Breaks scope into estimable work packages",
          "Guarantees stable requirements",
          "Removes need for assumptions"
        ],
        "correctIndex": 1,
        "modelAnswer": "Decomposition supports more grounded estimates."
      },
      {
        "type": "mcq",
        "prompt": "Many committees exist, but no one can accept a technology risk. Core problem?",
        "options": [
          "Insufficient code testing",
          "Unclear decision rights and accountability",
          "No function-point analysis",
          "Insufficient training"
        ],
        "correctIndex": 1,
        "modelAnswer": "Governance requires explicit authority and ownership."
      },
      {
        "type": "mcq",
        "prompt": "Employees use a system successfully, then return to the old process. Focus on:",
        "options": [
          "Awareness",
          "Knowledge",
          "Reinforcement",
          "Procurement"
        ],
        "correctIndex": 2,
        "modelAnswer": "Reinforcement sustains the change."
      },
      {
        "type": "mcq",
        "prompt": "A system passes unit tests but fails when two services interact. Main testing gap?",
        "options": [
          "Unit testing",
          "Integration and end-to-end testing",
          "Code formatting",
          "User attendance"
        ],
        "correctIndex": 1,
        "modelAnswer": "Cross-component interactions need integration and journey-level tests."
      },
      {
        "type": "mcq",
        "prompt": "An early pilot estimate should be strengthened by:",
        "options": [
          "Linear scaling only",
          "WBS, explicit assumptions, ranges and actuals",
          "Only an optimistic date",
          "Ignoring excluded work"
        ],
        "correctIndex": 1,
        "modelAnswer": "Decomposition and evidence expose omissions and uncertainty."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: HarbourStay Guest Services Transformation: HarbourStay is replacing booking, loyalty, payment and housekeeping systems with a cloud platform before summer. Hotel managers and guests revise workflows after releases; payment-provider access reviews are inconsistent. Peak searches slow down and end-to-end guest journeys remain untested.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: GreenGrid Customer Portal: An energy provider outsources a customer portal. Hosting requirements are stable but analytics scope is uncertain. A supplier asks for extra features after award; service transition and data-portability terms are unclear.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: JusticeConnect Digital Case Platform: A public agency builds a case platform for applications, evidence and payments. Legal controls are stable, workflows evolve, records move to approved external organisations, retention labels are inconsistent and accessibility tests identify barriers.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: RetailCloud Migration: A retailer migrates loyalty and customer service to a cloud platform. A pilot used clean data from one store, but other regions use different processes. Customer complaints rise and governance cannot agree who accepts privacy risk.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 11,
    "title": "Exam Paper — Practice Exam 8",
    "topics": "50-mark final-exam practice paper 8: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A formal risk acceptance should include:",
        "options": [
          "Named authorized owner, rationale, conditions and review date",
          "Only verbal agreement",
          "No residual risk",
          "A developer signature regardless of authority"
        ],
        "correctIndex": 0,
        "modelAnswer": "Acceptance should be explicit, authorized and reviewable."
      },
      {
        "type": "mcq",
        "prompt": "Users understand their needs only after seeing features. Which approach fits?",
        "options": [
          "Sequential delivery with no change",
          "Iterations with feedback and reprioritisation",
          "Deployment without acceptance criteria",
          "Technical design without users"
        ],
        "correctIndex": 1,
        "modelAnswer": "Iteration supports learning and controlled refinement."
      },
      {
        "type": "mcq",
        "prompt": "A stakeholder has high influence and high interest. Best approach?",
        "options": [
          "Generic infrequent updates",
          "Close engagement and timely decision-relevant communication",
          "Technical detail regardless of role",
          "Contact after completion"
        ],
        "correctIndex": 1,
        "modelAnswer": "High influence and interest warrant close, tailored engagement."
      },
      {
        "type": "mcq",
        "prompt": "Which statement about an early estimate is defensible?",
        "options": [
          "Present it as exact",
          "Make assumptions and uncertainty explicit; refine as evidence improves",
          "Never use historical data",
          "Never update after approval"
        ],
        "correctIndex": 1,
        "modelAnswer": "Early forecasts should evolve as knowledge improves."
      },
      {
        "type": "mcq",
        "prompt": "A production service unexpectedly fails and users cannot transact. In ITSM this is primarily:",
        "options": [
          "Service request",
          "Incident",
          "Estimate",
          "Governance objective"
        ],
        "correctIndex": 1,
        "modelAnswer": "An unplanned service interruption is an incident."
      },
      {
        "type": "mcq",
        "prompt": "A data controller asks a vendor for historical user data to train a product. First resolve:",
        "options": [
          "Whether the vendor can use any data",
          "Purpose, authority, minimisation, retention and safeguards",
          "The vendor logo",
          "Whether data is interesting"
        ],
        "correctIndex": 1,
        "modelAnswer": "Data governance requires defined purpose, authority and controls."
      },
      {
        "type": "mcq",
        "prompt": "A high-power regulator and low-power affected community group require:",
        "options": [
          "Identical communication",
          "Tailored engagement that reflects authority and impact",
          "Ignore the community",
          "Only contact the regulator"
        ],
        "correctIndex": 1,
        "modelAnswer": "Stakeholder plans should consider power, legitimacy, impact and needs."
      },
      {
        "type": "mcq",
        "prompt": "A project has PV=$100k, EV=$80k and AC=$90k. CPI is:",
        "options": [
          "0.89",
          "1.11",
          "0.80",
          "1.25"
        ],
        "correctIndex": 0,
        "modelAnswer": "CPI=EV/AC=80/90≈0.89, below 1 indicates cost inefficiency."
      },
      {
        "type": "mcq",
        "prompt": "Which is the strongest change-control practice?",
        "options": [
          "Block every change",
          "Assess impacts and route to authorized decision maker",
          "Implement silently",
          "Update baseline before approval"
        ],
        "correctIndex": 1,
        "modelAnswer": "Assess and authorize before changing approved baselines."
      },
      {
        "type": "mcq",
        "prompt": "A manager wants to know if training worked. Strong evidence is:",
        "options": [
          "Attendance alone",
          "Observed successful completion of realistic tasks",
          "Slide count",
          "Meeting invitations"
        ],
        "correctIndex": 1,
        "modelAnswer": "Demonstrated performance is evidence of capability."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: SafeCampus Response Service: A university connects mobile reports, campus security and external responders. A pilot improved response time but excluded disabled students and did not test after-hours routing. Data-sharing approval is incomplete.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: MediSupply Procurement Renewal: A medical distributor replaces procurement and inventory systems. A standard vendor product must fit local workflows. Shared integration accounts have excessive privileges, end-to-end purchasing-to-delivery tests fail and a major hospital contract starts soon after launch.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: HarbourStay Guest Services Transformation: HarbourStay is replacing booking, loyalty, payment and housekeeping systems with a cloud platform before summer. Hotel managers and guests revise workflows after releases; payment-provider access reviews are inconsistent. Peak searches slow down and end-to-end guest journeys remain untested.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: JusticeConnect Digital Case Platform: A public agency builds a case platform for applications, evidence and payments. Legal controls are stable, workflows evolve, records move to approved external organisations, retention labels are inconsistent and accessibility tests identify barriers.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 12,
    "title": "Exam Paper — Practice Exam 9",
    "topics": "50-mark final-exam practice paper 9: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "A comparable completed project is available for estimating. Which technique uses it directly?",
        "options": [
          "Estimation by analogy",
          "Random contingency",
          "Function points based only on team size",
          "Ignore history"
        ],
        "correctIndex": 0,
        "modelAnswer": "Analogy uses actual results from similar work, adjusted for differences."
      },
      {
        "type": "mcq",
        "prompt": "Which statement best distinguishes COBIT and ITIL?",
        "options": [
          "COBIT supports enterprise IT governance; ITIL supports service-management practices",
          "COBIT is ticketing; ITIL is ethics",
          "COBIT replaces strategy",
          "They are estimation methods"
        ],
        "correctIndex": 0,
        "modelAnswer": "They address related but distinct governance and service-management needs."
      },
      {
        "type": "mcq",
        "prompt": "Employees understand and want a change but cannot complete the workflow. Weakest ADKAR element?",
        "options": [
          "Awareness",
          "Desire",
          "Ability",
          "Reinforcement"
        ],
        "correctIndex": 2,
        "modelAnswer": "Ability concerns applying skills to perform the new work."
      },
      {
        "type": "mcq",
        "prompt": "Release frequency increases while customer complaints rise. Best conclusion?",
        "options": [
          "More releases proves value",
          "Delivery activity alone does not show outcomes",
          "Complaints are irrelevant",
          "Stop all releases permanently"
        ],
        "correctIndex": 1,
        "modelAnswer": "Measure service outcomes and quality alongside delivery."
      },
      {
        "type": "mcq",
        "prompt": "In Tuckman, a team argues over roles and norms. This most closely reflects:",
        "options": [
          "Forming",
          "Storming",
          "Performing",
          "Adjourning"
        ],
        "correctIndex": 1,
        "modelAnswer": "Storming includes negotiation and conflict."
      },
      {
        "type": "mcq",
        "prompt": "A project has EV=$80k and PV=$100k. SPI below 1 means:",
        "options": [
          "Ahead of planned progress",
          "Behind planned progress",
          "Under budget by definition",
          "Complete"
        ],
        "correctIndex": 1,
        "modelAnswer": "SPI=EV/PV; below 1 means less value earned than planned."
      },
      {
        "type": "mcq",
        "prompt": "The ADKAR element for understanding why a change is needed is:",
        "options": [
          "Awareness",
          "Ability",
          "Reinforcement",
          "Control"
        ],
        "correctIndex": 0,
        "modelAnswer": "Awareness is understanding the need for change."
      },
      {
        "type": "mcq",
        "prompt": "A good communication plan should define:",
        "options": [
          "Audience, purpose, channel, timing, owner and feedback",
          "One email for everyone",
          "Only technical details",
          "No cadence"
        ],
        "correctIndex": 0,
        "modelAnswer": "Tailored, owned communication supports engagement."
      },
      {
        "type": "mcq",
        "prompt": "A professional sees a serious privacy flaw before release. They should:",
        "options": [
          "Sign off anyway",
          "Document, validate and escalate through accountable channels",
          "Conceal it",
          "Test using real data without approval"
        ],
        "correctIndex": 1,
        "modelAnswer": "Professional duties require honest, proportionate escalation."
      },
      {
        "type": "mcq",
        "prompt": "MFA and least privilege are:",
        "options": [
          "Interchangeable",
          "Different controls addressing different risks",
          "Both encryption methods",
          "Only useful for vendors"
        ],
        "correctIndex": 1,
        "modelAnswer": "MFA supports identity assurance; least privilege limits authorized actions."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: GreenGrid Customer Portal: An energy provider outsources a customer portal. Hosting requirements are stable but analytics scope is uncertain. A supplier asks for extra features after award; service transition and data-portability terms are unclear.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: SafeCampus Response Service: A university connects mobile reports, campus security and external responders. A pilot improved response time but excluded disabled students and did not test after-hours routing. Data-sharing approval is incomplete.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: HarbourStay Guest Services Transformation: HarbourStay is replacing booking, loyalty, payment and housekeeping systems with a cloud platform before summer. Hotel managers and guests revise workflows after releases; payment-provider access reviews are inconsistent. Peak searches slow down and end-to-end guest journeys remain untested.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: SkyFreight Operations Modernisation: An air-cargo operator integrates booking, warehouse and customs services. Privileged support activity from an unusual location was detected. Functional tests pass, but peak processing is unstable and recovery has not been exercised.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      }
    ]
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 13,
    "title": "Exam Paper — Practice Exam 10",
    "topics": "50-mark final-exam practice paper 10: ten single-best-answer MCQs and four applied written scenarios covering delivery, governance, stakeholders, change, estimation, quality, security and professional responsibility.",
    "instructions": "Final exam practice | 50 marks | Suggested time: 2 hours. Answer all questions. Problem 1 contains 10 single-best-answer multiple-choice questions (1 mark each). Problems 2–5 are written scenario-based questions (10 marks each); answer every subpart and apply course concepts to the facts.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Questions.pdf",
      "INFO5990_Final_Exam_Practice_Papers_10x50_Answer_Guide.pdf"
    ],
    "questions": [
      {
        "type": "mcq",
        "prompt": "Employees use a system successfully, then return to the old process. Focus on:",
        "options": [
          "Awareness",
          "Knowledge",
          "Reinforcement",
          "Procurement"
        ],
        "correctIndex": 2,
        "modelAnswer": "Reinforcement sustains the change."
      },
      {
        "type": "mcq",
        "prompt": "A system passes unit tests but fails when two services interact. Main testing gap?",
        "options": [
          "Unit testing",
          "Integration and end-to-end testing",
          "Code formatting",
          "User attendance"
        ],
        "correctIndex": 1,
        "modelAnswer": "Cross-component interactions need integration and journey-level tests."
      },
      {
        "type": "mcq",
        "prompt": "An early pilot estimate should be strengthened by:",
        "options": [
          "Linear scaling only",
          "WBS, explicit assumptions, ranges and actuals",
          "Only an optimistic date",
          "Ignoring excluded work"
        ],
        "correctIndex": 1,
        "modelAnswer": "Decomposition and evidence expose omissions and uncertainty."
      },
      {
        "type": "mcq",
        "prompt": "Which is a useful risk-register entry?",
        "options": [
          "Risk title only",
          "Cause-event-effect, owner, rating, trigger and response",
          "Guarantee it will not occur",
          "No review date"
        ],
        "correctIndex": 1,
        "modelAnswer": "A useful risk entry supports action and accountability."
      },
      {
        "type": "mcq",
        "prompt": "Staff know the reason but do not know how to perform the new process. Focus on:",
        "options": [
          "Desire",
          "Knowledge",
          "Reinforcement",
          "Awareness"
        ],
        "correctIndex": 1,
        "modelAnswer": "Knowledge is knowing how; ability is performing it."
      },
      {
        "type": "mcq",
        "prompt": "Which is a suitable benefit measure?",
        "options": [
          "Number of features shipped",
          "Reduced average service time versus baseline",
          "Team size",
          "Number of meetings"
        ],
        "correctIndex": 1,
        "modelAnswer": "It measures an outcome against a baseline."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to use a secret design as its main security control. This is:",
        "options": [
          "Defence in depth",
          "Security through obscurity",
          "Least privilege",
          "Separation of duties"
        ],
        "correctIndex": 1,
        "modelAnswer": "Design secrecy alone is not a dependable security control."
      },
      {
        "type": "mcq",
        "prompt": "A shared administrator account creates which major concern?",
        "options": [
          "Better accountability",
          "Weak attribution and broad compromise impact",
          "Improved least privilege",
          "No security effect"
        ],
        "correctIndex": 1,
        "modelAnswer": "Shared credentials obscure accountability and increase blast radius."
      },
      {
        "type": "mcq",
        "prompt": "Which is a detective control?",
        "options": [
          "Audit logging and anomalous access alerts",
          "Password policy alone",
          "Design review only",
          "Procurement contract"
        ],
        "correctIndex": 0,
        "modelAnswer": "Monitoring can detect suspicious activity."
      },
      {
        "type": "mcq",
        "prompt": "A deontological analysis primarily considers:",
        "options": [
          "Duties, rights and principles",
          "Only total financial return",
          "Only delivery speed",
          "Popularity"
        ],
        "correctIndex": 0,
        "modelAnswer": "Deontology emphasizes duties and constraints on action."
      },
      {
        "type": "scenario",
        "prompt": "Stakeholders, governance and communication: JusticeConnect Digital Case Platform: A public agency builds a case platform for applications, evidence and payments. Legal controls are stable, workflows evolve, records move to approved external organisations, retention labels are inconsistent and accessibility tests identify barriers.\n\n(a) Select two stakeholders with different interests and explain how engagement and communication should differ. (3 marks)\n\n(b) Recommend a governance improvement that clarifies who can approve scope changes and accept residual risk. (3 marks)\n\n(c) Describe a concise decision-focused update format and one way to close the feedback loop with affected users. (4 marks)",
        "modelAnswer": "(a) Engage the regulator closely on evidence and fixed compliance criteria; involve front-line staff or affected users in accessible workflow testing and explain how feedback is used. Tailor detail, channel and cadence to each group.\n\n(b) Establish a decision-rights matrix that names the accountable sponsor for scope approval, the security/privacy owner for risk advice, and the role authorized to accept residual risk. Set delegated limits and escalation triggers so changes within tolerance can be decided quickly and higher-impact changes reach the steering committee. Record each decision, rationale, conditions, owner and review date in a decision log; a committee list without named authority does not create accountability.\n\n(c) Use a concise structure such as situation, background, assessment and recommendation, ending with the decision required, options, impact, owner and deadline. Publish a response to user feedback showing what changed, what did not and why; include a channel for follow-up."
      },
      {
        "type": "scenario",
        "prompt": "People, change and team dynamics: MediSupply Procurement Renewal: A medical distributor replaces procurement and inventory systems. A standard vendor product must fit local workflows. Shared integration accounts have excessive privileges, end-to-end purchasing-to-delivery tests fail and a major hospital contract starts soon after launch.\n\n(a) Use ADKAR to distinguish two likely adoption gaps and connect them to the facts. (3 marks)\n\n(b) Recommend two targeted actions that build adoption while addressing staff concerns. (3 marks)\n\n(c) Apply a team-development or leadership concept to the conflict and propose two measures that would show whether change is taking hold. (4 marks)",
        "modelAnswer": "(a) The clearest ADKAR gap is Ability: demonstrations may build awareness and knowledge, but staff have not practised the rare exception workflow well enough to perform it under pressure. Desire may also be at risk because supervisors fear losing professional discretion; confirm this in staff interviews rather than treating it as established. Diagnose each element separately so training is not used to solve a motivation or role-clarity problem.\n\n(b) Provide realistic sandbox practice, job aids and coaching for rare workflows. Involve supervisors in exception design and clarify which decisions remain professional judgment. Use local champions and a time-bound transition from parallel spreadsheets.\n\n(c) The disagreement may reflect Tuckman storming as roles and norms are negotiated. Facilitate explicit working agreements, decision rights and escalation. Measure successful completion in the new system, error/rework rate and reduction in unapproved parallel records, segmented by team."
      },
      {
        "type": "scenario",
        "prompt": "Quality, security and professional responsibility: MetroPay Service Renewal: A transit agency updates payment services. Launch is fixed, partner retries sometimes duplicate top-ups, logs may contain personal information and frontline staff have not practised the exception workflow.\n\n(a) Identify two testing or service-readiness activities that should be completed and explain their value. (3 marks)\n\n(b) Recommend two controls for supplier access and describe a suitable incident response if exposure may have occurred. (3 marks)\n\n(c) Apply one ethical perspective and relevant professional responsibilities to the release decision. State who should decide and what evidence is needed. (4 marks)",
        "modelAnswer": "(a) Complete end-to-end tests of the highest-risk payment journeys, including partner retries and duplicate-top-up handling, with explicit pass criteria and defect owners. Also run a timed backup/restore or recovery exercise that verifies data integrity, recovery time and who makes the recovery decision. Unit tests cannot show that integrated services behave correctly together or that staff can restore service during an outage.\n\n(b) Apply least privilege and time-bound named accounts with MFA, logging and periodic access review. If exposure may have occurred, contain access, preserve logs, determine scope, notify security/privacy leads and communicate through accountable channels.\n\n(c) A utilitarian analysis weighs public benefit against likely harm; a duty-based analysis emphasizes honesty, privacy and competence. The team must not misrepresent assurance or conceal the weakness. An authorized release owner should decide against documented risk criteria using test results, exposure scope, mitigations, recovery readiness and residual-risk ownership."
      },
      {
        "type": "scenario",
        "prompt": "Delivery, value and estimation: MediSupply Procurement Renewal: A medical distributor replaces procurement and inventory systems. A standard vendor product must fit local workflows. Shared integration accounts have excessive privileges, end-to-end purchasing-to-delivery tests fail and a major hospital contract starts soon after launch.\n\n(a) Recommend a delivery approach that handles both stable obligations and evolving workflows. (3 marks)\n\n(b) Propose two measurable benefits with baselines, owners and review timing. Explain why feature count is insufficient. (3 marks)\n\n(c) Identify two weaknesses in the pilot-based forecast and recommend a more defensible estimate and communication approach. (4 marks)",
        "modelAnswer": "(a) Use a tailored or hybrid approach: baseline legal/privacy interfaces and acceptance gates, while iterating uncertain user-facing workflows with affected users. Changes affecting fixed obligations go through formal impact assessment.\n\n(b) For example, measure completion time and error/rework rate against a pre-launch baseline. Assign operational owners, data sources, targets and a post-launch review date. Features delivered are outputs; they do not prove better service outcomes.\n\n(c) The pilot excluded a user group and may not include migration, integration, training or operational readiness. Decompose the remaining work using a WBS, compare with analogous actuals, state assumptions/dependencies and produce a range. Report confidence and update it as evidence arrives rather than presenting a single date as certain."
      }
    ]
  }
];
