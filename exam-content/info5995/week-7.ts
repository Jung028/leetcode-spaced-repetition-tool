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

export const WEEK_7_PAPERS: ExamPaperSeed[] = [LECTURE_PAPER];
