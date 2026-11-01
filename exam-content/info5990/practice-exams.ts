import type { ExamPaperSeed } from "../types";

export const INFO5990_PRACTICE_EXAM_PAPERS: ExamPaperSeed[] = [
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 4,
    "title": "Exam Paper — Practice Exam 1",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: Northbank Health; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: Northbank Health. A public hospital is replacing separate rostering, payroll and ward systems with NorthStar. Requirements from nurses keep changing after prototype tests; a regulator requires a fixed audit interface. Leaders promise a November launch. A pilot showed faster rostering but did not include night shifts. Contractors have persistent accounts, and nurses still keep parallel spreadsheets.\n\nTasks: Use a hybrid delivery approach for the fixed interface and evolving workflow; explain why pilot estimates need adjustment and propose a better estimate. Identify two measurable benefits and how to verify them. Diagnose one adoption barrier with ADKAR and recommend two actions. State the professional response if the launch date conflicts with a known patient-data exposure.",
        "modelAnswer": "Use a hybrid delivery approach for the fixed interface and evolving workflow; explain why pilot estimates need adjustment and propose a better estimate. Identify two measurable benefits and how to verify them. Diagnose one adoption barrier with ADKAR and recommend two actions. State the professional response if the launch date conflicts with a known patient-data exposure."
      },
      {
        "type": "mcq",
        "prompt": "A project steering group repeatedly discusses an unresolved decision but no one owns it. Which governance improvement is most direct?",
        "options": [
          "Add more technical detail to the status deck",
          "Assign a named accountable decision owner, authority and due date",
          "Move the discussion to the delivery team without recording it",
          "Wait for consensus from every stakeholder"
        ],
        "correctIndex": 1,
        "modelAnswer": "Governance needs explicit decision rights and accountability; more reporting does not assign ownership."
      },
      {
        "type": "mcq",
        "prompt": "Which evidence best demonstrates that a new service creates organisational value after launch?",
        "options": [
          "Number of features committed to the backlog",
          "Number of developers assigned",
          "A measured improvement in the target service outcome against a baseline",
          "The project passed its internal code review"
        ],
        "correctIndex": 2,
        "modelAnswer": "Benefits should be measured against business or service outcomes and a baseline, not delivery activity alone."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to identify where an attacker could cross from a public web service into sensitive records. Which activity is most relevant?",
        "options": [
          "Threat modelling trust boundaries and attack paths",
          "Change-readiness assessment",
          "Earned value analysis",
          "A stakeholder power-interest grid"
        ],
        "correctIndex": 0,
        "modelAnswer": "Threat modelling examines assets, trust boundaries, threats and attack paths."
      },
      {
        "type": "mcq",
        "prompt": "A digital service changes its interface after each user test, while a statutory reporting format is fixed. Which delivery choice is strongest?",
        "options": [
          "Use iterative delivery for both without formal compliance checks",
          "Use a tailored/hybrid approach: iterate the interface and control the stable statutory interface",
          "Use a strict sequential approach for every component",
          "Delay user testing until all requirements are frozen"
        ],
        "correctIndex": 1,
        "modelAnswer": "A hybrid approach fits different levels of requirement uncertainty while preserving control over fixed obligations."
      },
      {
        "type": "mcq",
        "prompt": "Which statement correctly distinguishes governance from management in an IT context?",
        "options": [
          "Governance evaluates direction and accountability; management plans and operates within that direction",
          "Governance is only cybersecurity; management is only finance",
          "Management sets stakeholder accountability; governance assigns daily tasks",
          "They are interchangeable labels for project reporting"
        ],
        "correctIndex": 0,
        "modelAnswer": "Governance evaluates, directs and monitors; management plans, builds, runs and monitors activities under that direction."
      },
      {
        "type": "mcq",
        "prompt": "A model has high overall accuracy but performs substantially worse for one protected group. What is the best next step?",
        "options": [
          "Release because average accuracy is high",
          "Investigate subgroup outcomes, data/proxy effects and harms, then apply a documented release gate",
          "Remove the subgroup label from the report",
          "Use a larger model without examining the data"
        ],
        "correctIndex": 1,
        "modelAnswer": "Disaggregated impact analysis and accountable assurance are needed before deployment."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 5,
    "title": "Exam Paper — Practice Exam 2",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: CivicAccess; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: CivicAccess. A council is moving permit applications and identity documents to a shared cloud service. Service officers, residents and legal staff disagree about workflow. The business case promises quicker permits and fairer access. A vendor has broad support access; retention rules are unclear. Testing confirms common applications work but screen-reader testing is incomplete.\n\nTasks: Define two mission-aligned outcomes and measures. Identify two privacy/security risks and a proportionate control for each. Recommend stakeholder engagement for residents and legal staff. Advise whether launch should proceed with accessibility testing incomplete, applying professional obligations.",
        "modelAnswer": "Define two mission-aligned outcomes and measures. Identify two privacy/security risks and a proportionate control for each. Recommend stakeholder engagement for residents and legal staff. Advise whether launch should proceed with accessibility testing incomplete, applying professional obligations."
      },
      {
        "type": "mcq",
        "prompt": "A team needs to reduce the chance that one compromised account exposes every customer record. Which control most directly applies least privilege?",
        "options": [
          "Require a second authentication factor for all users",
          "Give each role only the records and actions needed for its work",
          "Encrypt backups but leave broad live access unchanged",
          "Publish a policy reminding staff to be careful"
        ],
        "correctIndex": 1,
        "modelAnswer": "Least privilege limits each identity to the minimum access required. MFA and encryption are valuable but solve different parts of the risk."
      },
      {
        "type": "mcq",
        "prompt": "A release has passed unit tests, but no one has tested the end-to-end payment journey with the external provider. What remains the clearest gap?",
        "options": [
          "Unit testing",
          "Integration/end-to-end testing",
          "Static code analysis",
          "User story estimation"
        ],
        "correctIndex": 1,
        "modelAnswer": "The unresolved risk is whether components and the provider work together across a complete journey."
      },
      {
        "type": "mcq",
        "prompt": "An employee finds a serious privacy flaw just before release. What is the professional first response?",
        "options": [
          "Stay silent until the launch has passed",
          "Document and validate the issue, limit exposure where possible, and escalate through accountable channels",
          "Delete the logs to reduce reputational risk",
          "Let marketing decide whether the flaw is material"
        ],
        "correctIndex": 1,
        "modelAnswer": "Professional practice requires honest, evidence-based escalation and proportionate risk reduction."
      },
      {
        "type": "mcq",
        "prompt": "A manager wants to assess whether staff can use a newly deployed tool. Which ADKAR element most directly concerns the ability to perform the new work?",
        "options": [
          "Awareness",
          "Desire",
          "Knowledge",
          "Ability"
        ],
        "correctIndex": 3,
        "modelAnswer": "Ability is demonstrated capability to implement the change; Knowledge is knowing how."
      },
      {
        "type": "mcq",
        "prompt": "An organisation reports that a system is secure because its architecture diagram is not public. Which principle is being misused?",
        "options": [
          "Defence in depth",
          "Least privilege",
          "Security through obscurity",
          "Separation of duties"
        ],
        "correctIndex": 2,
        "modelAnswer": "Keeping design secret is not a dependable security control; security should withstand disclosure of the design."
      },
      {
        "type": "mcq",
        "prompt": "Which practice best improves a forecast made from a small pilot when the full rollout is much larger?",
        "options": [
          "Treat the pilot duration as the exact commitment",
          "Use a WBS/analogy with explicit differences, assumptions and a range, then update with actuals",
          "Remove uncertainty from the report",
          "Add a fixed percentage without explaining why"
        ],
        "correctIndex": 1,
        "modelAnswer": "Evidence-based estimates expose scope differences and uncertainty and are refined as new information arrives."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 6,
    "title": "Exam Paper — Practice Exam 3",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: Fleetwise Logistics; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: Fleetwise Logistics. A logistics firm wants a predictive maintenance platform across depots. The data-science team expects iterative model changes; vehicle hardware interfaces are stable. Executives want a fixed cost forecast based on a small depot trial. Drivers distrust the recommendations and a manager asks the team to hide false positives until after launch.\n\nTasks: Recommend a tailored delivery and estimation approach. Use ADKAR to address driver resistance. Explain how governance should assign decision rights and manage model risk. Apply an ethical framework and professional code to the request to hide false positives.",
        "modelAnswer": "Recommend a tailored delivery and estimation approach. Use ADKAR to address driver resistance. Explain how governance should assign decision rights and manage model risk. Apply an ethical framework and professional code to the request to hide false positives."
      },
      {
        "type": "mcq",
        "prompt": "Which evidence best demonstrates that a new service creates organisational value after launch?",
        "options": [
          "Number of features committed to the backlog",
          "Number of developers assigned",
          "A measured improvement in the target service outcome against a baseline",
          "The project passed its internal code review"
        ],
        "correctIndex": 2,
        "modelAnswer": "Benefits should be measured against business or service outcomes and a baseline, not delivery activity alone."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to identify where an attacker could cross from a public web service into sensitive records. Which activity is most relevant?",
        "options": [
          "Threat modelling trust boundaries and attack paths",
          "Change-readiness assessment",
          "Earned value analysis",
          "A stakeholder power-interest grid"
        ],
        "correctIndex": 0,
        "modelAnswer": "Threat modelling examines assets, trust boundaries, threats and attack paths."
      },
      {
        "type": "mcq",
        "prompt": "A digital service changes its interface after each user test, while a statutory reporting format is fixed. Which delivery choice is strongest?",
        "options": [
          "Use iterative delivery for both without formal compliance checks",
          "Use a tailored/hybrid approach: iterate the interface and control the stable statutory interface",
          "Use a strict sequential approach for every component",
          "Delay user testing until all requirements are frozen"
        ],
        "correctIndex": 1,
        "modelAnswer": "A hybrid approach fits different levels of requirement uncertainty while preserving control over fixed obligations."
      },
      {
        "type": "mcq",
        "prompt": "Which statement correctly distinguishes governance from management in an IT context?",
        "options": [
          "Governance evaluates direction and accountability; management plans and operates within that direction",
          "Governance is only cybersecurity; management is only finance",
          "Management sets stakeholder accountability; governance assigns daily tasks",
          "They are interchangeable labels for project reporting"
        ],
        "correctIndex": 0,
        "modelAnswer": "Governance evaluates, directs and monitors; management plans, builds, runs and monitors activities under that direction."
      },
      {
        "type": "mcq",
        "prompt": "A model has high overall accuracy but performs substantially worse for one protected group. What is the best next step?",
        "options": [
          "Release because average accuracy is high",
          "Investigate subgroup outcomes, data/proxy effects and harms, then apply a documented release gate",
          "Remove the subgroup label from the report",
          "Use a larger model without examining the data"
        ],
        "correctIndex": 1,
        "modelAnswer": "Disaggregated impact analysis and accountable assurance are needed before deployment."
      },
      {
        "type": "mcq",
        "prompt": "A project steering group repeatedly discusses an unresolved decision but no one owns it. Which governance improvement is most direct?",
        "options": [
          "Add more technical detail to the status deck",
          "Assign a named accountable decision owner, authority and due date",
          "Move the discussion to the delivery team without recording it",
          "Wait for consensus from every stakeholder"
        ],
        "correctIndex": 1,
        "modelAnswer": "Governance needs explicit decision rights and accountability; more reporting does not assign ownership."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 7,
    "title": "Exam Paper — Practice Exam 4",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: BrightPath Learning; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: BrightPath Learning. A university is commissioning an AI-assisted student advising system. Early tests show it recommends fewer advanced courses to students from one demographic group. The product team says average accuracy is high and proposes release before enrolment. Student representatives were not consulted; data provenance is uncertain.\n\nTasks: Explain how to investigate disparate impact and proxy variables before release. Identify appropriate stakeholders and engagement actions. Recommend governance and assurance controls, including a measurable decision gate. Apply a professional responsibility to the release decision.",
        "modelAnswer": "Explain how to investigate disparate impact and proxy variables before release. Identify appropriate stakeholders and engagement actions. Recommend governance and assurance controls, including a measurable decision gate. Apply a professional responsibility to the release decision."
      },
      {
        "type": "mcq",
        "prompt": "A release has passed unit tests, but no one has tested the end-to-end payment journey with the external provider. What remains the clearest gap?",
        "options": [
          "Unit testing",
          "Integration/end-to-end testing",
          "Static code analysis",
          "User story estimation"
        ],
        "correctIndex": 1,
        "modelAnswer": "The unresolved risk is whether components and the provider work together across a complete journey."
      },
      {
        "type": "mcq",
        "prompt": "An employee finds a serious privacy flaw just before release. What is the professional first response?",
        "options": [
          "Stay silent until the launch has passed",
          "Document and validate the issue, limit exposure where possible, and escalate through accountable channels",
          "Delete the logs to reduce reputational risk",
          "Let marketing decide whether the flaw is material"
        ],
        "correctIndex": 1,
        "modelAnswer": "Professional practice requires honest, evidence-based escalation and proportionate risk reduction."
      },
      {
        "type": "mcq",
        "prompt": "A manager wants to assess whether staff can use a newly deployed tool. Which ADKAR element most directly concerns the ability to perform the new work?",
        "options": [
          "Awareness",
          "Desire",
          "Knowledge",
          "Ability"
        ],
        "correctIndex": 3,
        "modelAnswer": "Ability is demonstrated capability to implement the change; Knowledge is knowing how."
      },
      {
        "type": "mcq",
        "prompt": "An organisation reports that a system is secure because its architecture diagram is not public. Which principle is being misused?",
        "options": [
          "Defence in depth",
          "Least privilege",
          "Security through obscurity",
          "Separation of duties"
        ],
        "correctIndex": 2,
        "modelAnswer": "Keeping design secret is not a dependable security control; security should withstand disclosure of the design."
      },
      {
        "type": "mcq",
        "prompt": "Which practice best improves a forecast made from a small pilot when the full rollout is much larger?",
        "options": [
          "Treat the pilot duration as the exact commitment",
          "Use a WBS/analogy with explicit differences, assumptions and a range, then update with actuals",
          "Remove uncertainty from the report",
          "Add a fixed percentage without explaining why"
        ],
        "correctIndex": 1,
        "modelAnswer": "Evidence-based estimates expose scope differences and uncertainty and are refined as new information arrives."
      },
      {
        "type": "mcq",
        "prompt": "A team needs to reduce the chance that one compromised account exposes every customer record. Which control most directly applies least privilege?",
        "options": [
          "Require a second authentication factor for all users",
          "Give each role only the records and actions needed for its work",
          "Encrypt backups but leave broad live access unchanged",
          "Publish a policy reminding staff to be careful"
        ],
        "correctIndex": 1,
        "modelAnswer": "Least privilege limits each identity to the minimum access required. MFA and encryption are valuable but solve different parts of the risk."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 8,
    "title": "Exam Paper — Practice Exam 5",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: HarbourBank; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: HarbourBank. A bank is consolidating customer apps and transaction services. A steering group receives long technical reports but does not record who accepts residual risk. A production incident reveals a service account can read unrelated customer records. Executives ask for an immediate restart to protect quarterly targets.\n\nTasks: Set out incident-response priorities from validation through containment and recovery. Explain least privilege and defence in depth as separate controls. Recommend a decision-focused governance update with accountable owners. Explain the ethical/professional response to pressure to restart before the risk is understood.",
        "modelAnswer": "Set out incident-response priorities from validation through containment and recovery. Explain least privilege and defence in depth as separate controls. Recommend a decision-focused governance update with accountable owners. Explain the ethical/professional response to pressure to restart before the risk is understood."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to identify where an attacker could cross from a public web service into sensitive records. Which activity is most relevant?",
        "options": [
          "Threat modelling trust boundaries and attack paths",
          "Change-readiness assessment",
          "Earned value analysis",
          "A stakeholder power-interest grid"
        ],
        "correctIndex": 0,
        "modelAnswer": "Threat modelling examines assets, trust boundaries, threats and attack paths."
      },
      {
        "type": "mcq",
        "prompt": "A digital service changes its interface after each user test, while a statutory reporting format is fixed. Which delivery choice is strongest?",
        "options": [
          "Use iterative delivery for both without formal compliance checks",
          "Use a tailored/hybrid approach: iterate the interface and control the stable statutory interface",
          "Use a strict sequential approach for every component",
          "Delay user testing until all requirements are frozen"
        ],
        "correctIndex": 1,
        "modelAnswer": "A hybrid approach fits different levels of requirement uncertainty while preserving control over fixed obligations."
      },
      {
        "type": "mcq",
        "prompt": "Which statement correctly distinguishes governance from management in an IT context?",
        "options": [
          "Governance evaluates direction and accountability; management plans and operates within that direction",
          "Governance is only cybersecurity; management is only finance",
          "Management sets stakeholder accountability; governance assigns daily tasks",
          "They are interchangeable labels for project reporting"
        ],
        "correctIndex": 0,
        "modelAnswer": "Governance evaluates, directs and monitors; management plans, builds, runs and monitors activities under that direction."
      },
      {
        "type": "mcq",
        "prompt": "A model has high overall accuracy but performs substantially worse for one protected group. What is the best next step?",
        "options": [
          "Release because average accuracy is high",
          "Investigate subgroup outcomes, data/proxy effects and harms, then apply a documented release gate",
          "Remove the subgroup label from the report",
          "Use a larger model without examining the data"
        ],
        "correctIndex": 1,
        "modelAnswer": "Disaggregated impact analysis and accountable assurance are needed before deployment."
      },
      {
        "type": "mcq",
        "prompt": "A project steering group repeatedly discusses an unresolved decision but no one owns it. Which governance improvement is most direct?",
        "options": [
          "Add more technical detail to the status deck",
          "Assign a named accountable decision owner, authority and due date",
          "Move the discussion to the delivery team without recording it",
          "Wait for consensus from every stakeholder"
        ],
        "correctIndex": 1,
        "modelAnswer": "Governance needs explicit decision rights and accountability; more reporting does not assign ownership."
      },
      {
        "type": "mcq",
        "prompt": "Which evidence best demonstrates that a new service creates organisational value after launch?",
        "options": [
          "Number of features committed to the backlog",
          "Number of developers assigned",
          "A measured improvement in the target service outcome against a baseline",
          "The project passed its internal code review"
        ],
        "correctIndex": 2,
        "modelAnswer": "Benefits should be measured against business or service outcomes and a baseline, not delivery activity alone."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 9,
    "title": "Exam Paper — Practice Exam 6",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: GreenGrid Energy; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: GreenGrid Energy. An energy provider is deploying smart meters and a cloud analytics service. A threat workshop identifies exposed device interfaces, shared contractor credentials and a supplier component with delayed patches. An operator reports unexpected commands on a test meter.\n\nTasks: Identify assets, trust boundaries and attack paths in the facts. State the first incident-response actions and evidence-handling priorities. Recommend two access/supply-chain controls. Explain how to communicate the risk and who should accept any residual risk.",
        "modelAnswer": "Identify assets, trust boundaries and attack paths in the facts. State the first incident-response actions and evidence-handling priorities. Recommend two access/supply-chain controls. Explain how to communicate the risk and who should accept any residual risk."
      },
      {
        "type": "mcq",
        "prompt": "An employee finds a serious privacy flaw just before release. What is the professional first response?",
        "options": [
          "Stay silent until the launch has passed",
          "Document and validate the issue, limit exposure where possible, and escalate through accountable channels",
          "Delete the logs to reduce reputational risk",
          "Let marketing decide whether the flaw is material"
        ],
        "correctIndex": 1,
        "modelAnswer": "Professional practice requires honest, evidence-based escalation and proportionate risk reduction."
      },
      {
        "type": "mcq",
        "prompt": "A manager wants to assess whether staff can use a newly deployed tool. Which ADKAR element most directly concerns the ability to perform the new work?",
        "options": [
          "Awareness",
          "Desire",
          "Knowledge",
          "Ability"
        ],
        "correctIndex": 3,
        "modelAnswer": "Ability is demonstrated capability to implement the change; Knowledge is knowing how."
      },
      {
        "type": "mcq",
        "prompt": "An organisation reports that a system is secure because its architecture diagram is not public. Which principle is being misused?",
        "options": [
          "Defence in depth",
          "Least privilege",
          "Security through obscurity",
          "Separation of duties"
        ],
        "correctIndex": 2,
        "modelAnswer": "Keeping design secret is not a dependable security control; security should withstand disclosure of the design."
      },
      {
        "type": "mcq",
        "prompt": "Which practice best improves a forecast made from a small pilot when the full rollout is much larger?",
        "options": [
          "Treat the pilot duration as the exact commitment",
          "Use a WBS/analogy with explicit differences, assumptions and a range, then update with actuals",
          "Remove uncertainty from the report",
          "Add a fixed percentage without explaining why"
        ],
        "correctIndex": 1,
        "modelAnswer": "Evidence-based estimates expose scope differences and uncertainty and are refined as new information arrives."
      },
      {
        "type": "mcq",
        "prompt": "A team needs to reduce the chance that one compromised account exposes every customer record. Which control most directly applies least privilege?",
        "options": [
          "Require a second authentication factor for all users",
          "Give each role only the records and actions needed for its work",
          "Encrypt backups but leave broad live access unchanged",
          "Publish a policy reminding staff to be careful"
        ],
        "correctIndex": 1,
        "modelAnswer": "Least privilege limits each identity to the minimum access required. MFA and encryption are valuable but solve different parts of the risk."
      },
      {
        "type": "mcq",
        "prompt": "A release has passed unit tests, but no one has tested the end-to-end payment journey with the external provider. What remains the clearest gap?",
        "options": [
          "Unit testing",
          "Integration/end-to-end testing",
          "Static code analysis",
          "User story estimation"
        ],
        "correctIndex": 1,
        "modelAnswer": "The unresolved risk is whether components and the provider work together across a complete journey."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 10,
    "title": "Exam Paper — Practice Exam 7",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: MetroCare Digital; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: MetroCare Digital. A health network is replacing its appointment and test-result systems. Integration testing is incomplete, load tests show slowdowns at peak demand, and management cites a successful unit-test report as evidence of readiness. Patients with disabilities have not tested the new interface.\n\nTasks: Distinguish unit, integration/end-to-end, performance and accessibility testing and name the gaps. Recommend release criteria and two outcome measures. Explain how an accountable governance forum should handle schedule pressure. Apply a professional duty to patient safety and accessibility.",
        "modelAnswer": "Distinguish unit, integration/end-to-end, performance and accessibility testing and name the gaps. Recommend release criteria and two outcome measures. Explain how an accountable governance forum should handle schedule pressure. Apply a professional duty to patient safety and accessibility."
      },
      {
        "type": "mcq",
        "prompt": "A digital service changes its interface after each user test, while a statutory reporting format is fixed. Which delivery choice is strongest?",
        "options": [
          "Use iterative delivery for both without formal compliance checks",
          "Use a tailored/hybrid approach: iterate the interface and control the stable statutory interface",
          "Use a strict sequential approach for every component",
          "Delay user testing until all requirements are frozen"
        ],
        "correctIndex": 1,
        "modelAnswer": "A hybrid approach fits different levels of requirement uncertainty while preserving control over fixed obligations."
      },
      {
        "type": "mcq",
        "prompt": "Which statement correctly distinguishes governance from management in an IT context?",
        "options": [
          "Governance evaluates direction and accountability; management plans and operates within that direction",
          "Governance is only cybersecurity; management is only finance",
          "Management sets stakeholder accountability; governance assigns daily tasks",
          "They are interchangeable labels for project reporting"
        ],
        "correctIndex": 0,
        "modelAnswer": "Governance evaluates, directs and monitors; management plans, builds, runs and monitors activities under that direction."
      },
      {
        "type": "mcq",
        "prompt": "A model has high overall accuracy but performs substantially worse for one protected group. What is the best next step?",
        "options": [
          "Release because average accuracy is high",
          "Investigate subgroup outcomes, data/proxy effects and harms, then apply a documented release gate",
          "Remove the subgroup label from the report",
          "Use a larger model without examining the data"
        ],
        "correctIndex": 1,
        "modelAnswer": "Disaggregated impact analysis and accountable assurance are needed before deployment."
      },
      {
        "type": "mcq",
        "prompt": "A project steering group repeatedly discusses an unresolved decision but no one owns it. Which governance improvement is most direct?",
        "options": [
          "Add more technical detail to the status deck",
          "Assign a named accountable decision owner, authority and due date",
          "Move the discussion to the delivery team without recording it",
          "Wait for consensus from every stakeholder"
        ],
        "correctIndex": 1,
        "modelAnswer": "Governance needs explicit decision rights and accountability; more reporting does not assign ownership."
      },
      {
        "type": "mcq",
        "prompt": "Which evidence best demonstrates that a new service creates organisational value after launch?",
        "options": [
          "Number of features committed to the backlog",
          "Number of developers assigned",
          "A measured improvement in the target service outcome against a baseline",
          "The project passed its internal code review"
        ],
        "correctIndex": 2,
        "modelAnswer": "Benefits should be measured against business or service outcomes and a baseline, not delivery activity alone."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to identify where an attacker could cross from a public web service into sensitive records. Which activity is most relevant?",
        "options": [
          "Threat modelling trust boundaries and attack paths",
          "Change-readiness assessment",
          "Earned value analysis",
          "A stakeholder power-interest grid"
        ],
        "correctIndex": 0,
        "modelAnswer": "Threat modelling examines assets, trust boundaries, threats and attack paths."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 11,
    "title": "Exam Paper — Practice Exam 8",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: OpenMarket Retail; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: OpenMarket Retail. A retailer plans to launch a loyalty platform with payment, marketing and fulfilment integrations. A proposal uses an opaque scoring model trained on historic customer data. The vendor will host the service; business leaders disagree about data ownership and post-launch support.\n\nTasks: Identify data-governance and ethical risks in the scoring model. Recommend stakeholder engagement and a transparent decision process. Distinguish governance from management responsibilities for approving strategy versus operating the service. Recommend two adoption and post-launch benefit measures.",
        "modelAnswer": "Identify data-governance and ethical risks in the scoring model. Recommend stakeholder engagement and a transparent decision process. Distinguish governance from management responsibilities for approving strategy versus operating the service. Recommend two adoption and post-launch benefit measures."
      },
      {
        "type": "mcq",
        "prompt": "A manager wants to assess whether staff can use a newly deployed tool. Which ADKAR element most directly concerns the ability to perform the new work?",
        "options": [
          "Awareness",
          "Desire",
          "Knowledge",
          "Ability"
        ],
        "correctIndex": 3,
        "modelAnswer": "Ability is demonstrated capability to implement the change; Knowledge is knowing how."
      },
      {
        "type": "mcq",
        "prompt": "An organisation reports that a system is secure because its architecture diagram is not public. Which principle is being misused?",
        "options": [
          "Defence in depth",
          "Least privilege",
          "Security through obscurity",
          "Separation of duties"
        ],
        "correctIndex": 2,
        "modelAnswer": "Keeping design secret is not a dependable security control; security should withstand disclosure of the design."
      },
      {
        "type": "mcq",
        "prompt": "Which practice best improves a forecast made from a small pilot when the full rollout is much larger?",
        "options": [
          "Treat the pilot duration as the exact commitment",
          "Use a WBS/analogy with explicit differences, assumptions and a range, then update with actuals",
          "Remove uncertainty from the report",
          "Add a fixed percentage without explaining why"
        ],
        "correctIndex": 1,
        "modelAnswer": "Evidence-based estimates expose scope differences and uncertainty and are refined as new information arrives."
      },
      {
        "type": "mcq",
        "prompt": "A team needs to reduce the chance that one compromised account exposes every customer record. Which control most directly applies least privilege?",
        "options": [
          "Require a second authentication factor for all users",
          "Give each role only the records and actions needed for its work",
          "Encrypt backups but leave broad live access unchanged",
          "Publish a policy reminding staff to be careful"
        ],
        "correctIndex": 1,
        "modelAnswer": "Least privilege limits each identity to the minimum access required. MFA and encryption are valuable but solve different parts of the risk."
      },
      {
        "type": "mcq",
        "prompt": "A release has passed unit tests, but no one has tested the end-to-end payment journey with the external provider. What remains the clearest gap?",
        "options": [
          "Unit testing",
          "Integration/end-to-end testing",
          "Static code analysis",
          "User story estimation"
        ],
        "correctIndex": 1,
        "modelAnswer": "The unresolved risk is whether components and the provider work together across a complete journey."
      },
      {
        "type": "mcq",
        "prompt": "An employee finds a serious privacy flaw just before release. What is the professional first response?",
        "options": [
          "Stay silent until the launch has passed",
          "Document and validate the issue, limit exposure where possible, and escalate through accountable channels",
          "Delete the logs to reduce reputational risk",
          "Let marketing decide whether the flaw is material"
        ],
        "correctIndex": 1,
        "modelAnswer": "Professional practice requires honest, evidence-based escalation and proportionate risk reduction."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 12,
    "title": "Exam Paper — Practice Exam 9",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: Coastline Transport; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: Coastline Transport. A transport agency is building a passenger information platform. Some requirements are statutory and stable; passenger-facing features are being refined through user feedback. A project manager estimates the full rollout by analogy to a two-station pilot and provides one point estimate with no assumptions.\n\nTasks: Choose delivery approaches for the stable and changing components. Explain the weakness in the estimate and recommend an evidence-based estimation method with assumptions/range. Identify two stakeholder groups and tailored communications. Explain how benefits and risks should be monitored after staged release.",
        "modelAnswer": "Choose delivery approaches for the stable and changing components. Explain the weakness in the estimate and recommend an evidence-based estimation method with assumptions/range. Identify two stakeholder groups and tailored communications. Explain how benefits and risks should be monitored after staged release."
      },
      {
        "type": "mcq",
        "prompt": "Which statement correctly distinguishes governance from management in an IT context?",
        "options": [
          "Governance evaluates direction and accountability; management plans and operates within that direction",
          "Governance is only cybersecurity; management is only finance",
          "Management sets stakeholder accountability; governance assigns daily tasks",
          "They are interchangeable labels for project reporting"
        ],
        "correctIndex": 0,
        "modelAnswer": "Governance evaluates, directs and monitors; management plans, builds, runs and monitors activities under that direction."
      },
      {
        "type": "mcq",
        "prompt": "A model has high overall accuracy but performs substantially worse for one protected group. What is the best next step?",
        "options": [
          "Release because average accuracy is high",
          "Investigate subgroup outcomes, data/proxy effects and harms, then apply a documented release gate",
          "Remove the subgroup label from the report",
          "Use a larger model without examining the data"
        ],
        "correctIndex": 1,
        "modelAnswer": "Disaggregated impact analysis and accountable assurance are needed before deployment."
      },
      {
        "type": "mcq",
        "prompt": "A project steering group repeatedly discusses an unresolved decision but no one owns it. Which governance improvement is most direct?",
        "options": [
          "Add more technical detail to the status deck",
          "Assign a named accountable decision owner, authority and due date",
          "Move the discussion to the delivery team without recording it",
          "Wait for consensus from every stakeholder"
        ],
        "correctIndex": 1,
        "modelAnswer": "Governance needs explicit decision rights and accountability; more reporting does not assign ownership."
      },
      {
        "type": "mcq",
        "prompt": "Which evidence best demonstrates that a new service creates organisational value after launch?",
        "options": [
          "Number of features committed to the backlog",
          "Number of developers assigned",
          "A measured improvement in the target service outcome against a baseline",
          "The project passed its internal code review"
        ],
        "correctIndex": 2,
        "modelAnswer": "Benefits should be measured against business or service outcomes and a baseline, not delivery activity alone."
      },
      {
        "type": "mcq",
        "prompt": "A team wants to identify where an attacker could cross from a public web service into sensitive records. Which activity is most relevant?",
        "options": [
          "Threat modelling trust boundaries and attack paths",
          "Change-readiness assessment",
          "Earned value analysis",
          "A stakeholder power-interest grid"
        ],
        "correctIndex": 0,
        "modelAnswer": "Threat modelling examines assets, trust boundaries, threats and attack paths."
      },
      {
        "type": "mcq",
        "prompt": "A digital service changes its interface after each user test, while a statutory reporting format is fixed. Which delivery choice is strongest?",
        "options": [
          "Use iterative delivery for both without formal compliance checks",
          "Use a tailored/hybrid approach: iterate the interface and control the stable statutory interface",
          "Use a strict sequential approach for every component",
          "Delay user testing until all requirements are frozen"
        ],
        "correctIndex": 1,
        "modelAnswer": "A hybrid approach fits different levels of requirement uncertainty while preserving control over fixed obligations."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  },
  {
    "course": "INFO5990",
    "week": 9,
    "paperNumber": 13,
    "title": "Exam Paper — Practice Exam 10",
    "topics": "Original integrated case study and applied MCQs for Professional Practice in IT. Focus: Meridian Insurance; professional judgment, governance, delivery, stakeholders, change, security, quality and ethics. Questions are new applications of the lecture/tutorial concepts and exam sample format.",
    "sourceFiles": [
      "INFO5990_2026_S2_Student_Question_Bank_Exam_Style.pdf",
      "INFO5990_2026_S2_Question_Bank_Answer_Guide_Exam_Style.pdf",
      "Predicted Exam - INFO5990.docx",
      "Week 1–9 lecture and tutorial revision materials"
    ],
    "questions": [
      {
        "type": "scenario",
        "prompt": "Case Study: Meridian Insurance. An insurer is migrating claims data to a new platform. Teams have adopted frequent releases, but incident rates and customer complaints are rising. The CIO reports release count as the main success KPI. An employee discovers a misconfigured export that exposes claim details to a broad role.\n\nTasks: Explain why release frequency alone is an inadequate value measure and propose balanced KPIs. Describe the first response to the data exposure and how to preserve evidence. Apply least privilege and change control to prevent recurrence. Explain the professional and ethical duties when reporting the issue.",
        "modelAnswer": "Explain why release frequency alone is an inadequate value measure and propose balanced KPIs. Describe the first response to the data exposure and how to preserve evidence. Apply least privilege and change control to prevent recurrence. Explain the professional and ethical duties when reporting the issue."
      },
      {
        "type": "mcq",
        "prompt": "An organisation reports that a system is secure because its architecture diagram is not public. Which principle is being misused?",
        "options": [
          "Defence in depth",
          "Least privilege",
          "Security through obscurity",
          "Separation of duties"
        ],
        "correctIndex": 2,
        "modelAnswer": "Keeping design secret is not a dependable security control; security should withstand disclosure of the design."
      },
      {
        "type": "mcq",
        "prompt": "Which practice best improves a forecast made from a small pilot when the full rollout is much larger?",
        "options": [
          "Treat the pilot duration as the exact commitment",
          "Use a WBS/analogy with explicit differences, assumptions and a range, then update with actuals",
          "Remove uncertainty from the report",
          "Add a fixed percentage without explaining why"
        ],
        "correctIndex": 1,
        "modelAnswer": "Evidence-based estimates expose scope differences and uncertainty and are refined as new information arrives."
      },
      {
        "type": "mcq",
        "prompt": "A team needs to reduce the chance that one compromised account exposes every customer record. Which control most directly applies least privilege?",
        "options": [
          "Require a second authentication factor for all users",
          "Give each role only the records and actions needed for its work",
          "Encrypt backups but leave broad live access unchanged",
          "Publish a policy reminding staff to be careful"
        ],
        "correctIndex": 1,
        "modelAnswer": "Least privilege limits each identity to the minimum access required. MFA and encryption are valuable but solve different parts of the risk."
      },
      {
        "type": "mcq",
        "prompt": "A release has passed unit tests, but no one has tested the end-to-end payment journey with the external provider. What remains the clearest gap?",
        "options": [
          "Unit testing",
          "Integration/end-to-end testing",
          "Static code analysis",
          "User story estimation"
        ],
        "correctIndex": 1,
        "modelAnswer": "The unresolved risk is whether components and the provider work together across a complete journey."
      },
      {
        "type": "mcq",
        "prompt": "An employee finds a serious privacy flaw just before release. What is the professional first response?",
        "options": [
          "Stay silent until the launch has passed",
          "Document and validate the issue, limit exposure where possible, and escalate through accountable channels",
          "Delete the logs to reduce reputational risk",
          "Let marketing decide whether the flaw is material"
        ],
        "correctIndex": 1,
        "modelAnswer": "Professional practice requires honest, evidence-based escalation and proportionate risk reduction."
      },
      {
        "type": "mcq",
        "prompt": "A manager wants to assess whether staff can use a newly deployed tool. Which ADKAR element most directly concerns the ability to perform the new work?",
        "options": [
          "Awareness",
          "Desire",
          "Knowledge",
          "Ability"
        ],
        "correctIndex": 3,
        "modelAnswer": "Ability is demonstrated capability to implement the change; Knowledge is knowing how."
      }
    ],
    "instructions": "Format reference: the INFO5990 2026 S2 Student Practice Question Bank is split into Part A (six practice case studies, eight application prompts per case) and Part B (30 multiple-choice questions, each single-best-answer). The question bank is a practice resource, so it does not guarantee the exact final-exam length. This app paper is a shortened drill with one integrated case question and six single-best-answer MCQs; it has no multi-select MCQs."
  }
];
