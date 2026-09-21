import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 8,
  paperNumber: 1,
  title: "Week 8 Tutorial: RESTful Web Services (payroll)",
  topics: "Week 8 tutorial (RESTful payroll service). Part A: design the resources, URIs and HTTP verbs (collection /employees with GET list and POST create, item /employees/{id} with GET, PUT, DELETE); safe and idempotent verbs; POST creates a new resource and returns the server-chosen id; 404 for a missing employee. Part B: implement the Spring controller. Part C: React front end whose data service maps CRUD to HTTP verbs (update uses PUT). Part D: backward-compatible change, splitting name into firstName and lastName by keeping name and adding optional new fields so old clients keep working.",
  sourceFiles: [
    "tutorial/COMP5348_Tutorial 8.pdf",
    "tutorial/tutorial-8-base (supporting context only: payroll Spring code)"
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Payroll REST design in one glance",
      body: "Picture a filing cabinet. Each drawer label is a noun, like employees, and the verbs are the things you do to it. In a good REST design the address names the thing and the HTTP verb says the action.\n\n• Safe: the call changes nothing on the server, like reading a menu.\n\n• Idempotent: doing it many times leaves the same result as doing it once, like setting a thermostat to 21.\n\n• Verb table: GET is safe and idempotent. PUT and DELETE are idempotent but not safe. POST is neither, because repeating it can create duplicates.\n\n• Payroll design: the collection is /employees, with GET to list and POST to create. One employee is /employees/{id}, with GET to view, PUT to replace and DELETE to remove.\n\n• Good habits: nouns not verbs in addresses, and 404 Not Found for an employee that does not exist. A POST returns the new id chosen by the server.\n\n• Backward compatible means an additive change: keep name and add optional firstName and lastName, so old clients keep working."
    }
  ],
  questions: [
    {
      type: "sort",
      prompt: "The payroll service exposes the calls below. Put each call into the box that describes its HTTP method: safe and idempotent, idempotent but not safe, or neither safe nor idempotent.",
      groups: ["Safe and idempotent", "Idempotent but not safe", "Neither safe nor idempotent"],
      items: [
        { text: "GET /employees/7", group: 0 },
        { text: "GET /employees", group: 0 },
        { text: "PUT /employees/7 with a new role", group: 1 },
        { text: "DELETE /employees/7", group: 1 },
        { text: "DELETE /employees (remove all)", group: 1 },
        { text: "POST /employees with a new person", group: 2 }
      ],
      modelAnswer: "Think of a restaurant. Reading the menu changes nothing. Telling the waiter you want your table at exactly 7pm gives the same booking however often you say it. Pressing add one sandwich again and again keeps adding sandwiches.\n\n• Safe and idempotent: both GET calls only read, so they change nothing and repeating them changes nothing.\n\n• Idempotent but not safe: PUT replaces the record with the given data and DELETE removes it. They do change the server, but the second identical call leaves the same end state.\n\n• Neither: POST /employees creates a new employee each time, so repeating it makes duplicates.\n\nSo the answer is: the GETs are safe and idempotent, PUT and both DELETEs are idempotent only, and POST is neither."
    },
    {
      type: "match",
      prompt: "Match each payroll call to what it does.",
      pairs: [
        { left: "GET /employees", right: "list all employees" },
        { left: "POST /employees", right: "create a new employee" },
        { left: "GET /employees/{id}", right: "view one employee" },
        { left: "PUT /employees/{id}", right: "update (replace) one employee" },
        { left: "DELETE /employees/{id}", right: "remove one employee" }
      ],
      decoys: ["look up an employee by name only"],
      modelAnswer: "A filing cabinet has one drawer for all the folders, and a numbered folder inside it.\n\n• The collection address is /employees, so reading it lists everyone and posting to it adds a new person.\n\n• The item address is /employees/{id}, so it names exactly one employee. GET views it, PUT replaces it and DELETE removes it.\n\n• Decoy: the design has no call that searches by name only. Lookups go through the id in the address.\n\nSo the answer is: collection calls list or create, item calls view, update or remove."
    },
    {
      type: "mcq",
      prompt: "A client POSTs a new employee to /employees, the connection times out, and the client sends exactly the same POST again. Both requests reached the server. What is the likely result?",
      options: [
        "Exactly one employee exists, because POST is idempotent and repeats have no extra effect",
        "Two employees with different ids exist, because POST is not idempotent and each call creates one",
        "The second call fails with 409 Conflict, because an employee with that name already exists",
        "The second call is ignored, because the server remembers the first request from that client"
      ],
      correctIndex: 1,
      modelAnswer: "Imagine pressing the add one sandwich button twice because the screen froze. You get two sandwiches, not one.\n\n• Why it happens: POST is neither safe nor idempotent. Each call asks the server to create a new resource and choose a fresh id.\n\n• Why the idempotent option is wrong: it describes PUT or DELETE, not POST.\n\n• Why the 409 option is wrong: the service does not have to reject duplicate names, so nothing forces a conflict.\n\n• Why the ignore option is wrong: a stateless server keeps no memory of earlier requests.\n\nSo the answer is: two employees with different ids are created."
    },
    {
      type: "fillblank",
      prompt: "In the React front end, the data service function update(id, data) sends an HTTP ___ request to /employees/{id}.",
      blanks: [["PUT", "put"]],
      modelAnswer: "Updating a record is like replacing the old page in a folder with a new page.\n\n• CRUD (Create, Read, Update, Delete) maps to verbs: create is POST, read is GET, update is PUT, delete is DELETE.\n\n• Update replaces the whole employee at its own address, and PUT is the verb for that. It is idempotent, so sending it twice leaves the same data.\n\nSo the answer is: PUT."
    },
    {
      type: "mcq",
      prompt: "A client calls GET /employees/999 and no employee with id 999 exists. What should the payroll service return?",
      options: [
        "200 OK with an empty body, to show the request was understood and nothing was found",
        "204 No Content, to show the request worked and that there is nothing to send back",
        "404 Not Found, with a message such as Could not find employee 999 for the client",
        "500 Internal Server Error, to show the server could not produce the requested employee"
      ],
      correctIndex: 2,
      modelAnswer: "Asking a librarian for a book that is not on the shelves should get you a clear it is not here, not a blank stare and not a fire alarm.\n\n• The rule: status codes tell the client what happened. 404 Not Found means the address names a resource that does not exist.\n\n• Why 200 is wrong: it says success, so the client would think it got a real employee.\n\n• Why 204 is wrong: it also says success, only with nothing to show.\n\n• Why 500 is wrong: that means the server itself broke, but here the server worked fine and the client asked for something missing.\n\nSo the answer is: 404 Not Found with a helpful message."
    },
    {
      type: "mcq",
      prompt: "Which is the best REST design for the action delete employee 7?",
      options: [
        "GET /employees/7/delete, because a link the user can click is easy to call",
        "POST /deleteEmployee?id=7, because POST is the verb used for anything that changes data",
        "DELETE /employees/7, where the address names the employee and the verb is the action",
        "GET /removeEmployee/7, because remove is clearer than delete in the address"
      ],
      correctIndex: 0,
      modelAnswer: "A street address should say which house it is, and the delivery instruction should say what to do there. You do not put the instruction in the street name.\n\n• REST style: the URI names a noun, the resource. The HTTP verb is the action.\n\n• Why the GET options are wrong: GET must be safe, so a GET must never change anything. Web crawlers and caches may call GET links freely.\n\n• Why the POST option is wrong: it puts a verb in the address and uses a verb that is not idempotent for a simple removal.\n\nSo the answer is: DELETE /employees/7."
    },
    {
      type: "mcq",
      prompt: "The payroll API is live in many companies. The single name field must become firstName and lastName. Which plan is best?",
      options: [
        "Replace name with firstName and lastName, then take every client offline while they all update",
        "Version the whole service and require every client to switch to the new version on the same night",
        "Keep name and add optional firstName and lastName, and let the server fill one from the other",
        "Keep only name and store the new first and last names in a separate hidden table on the server"
      ],
      correctIndex: 2,
      modelAnswer: "If a shop changes the plug on a power cord, everyone with an old socket is stuck. Adding an adapter first means old sockets still work.\n\n• The idea: a backward-compatible change is additive. Old clients still send and read name and keep working.\n\n• How: the server accepts the new optional fields and fills firstName and lastName from name, or name from the two new fields.\n\n• Why the replace and switch-on-one-night options are wrong: they force everyone to change together, which is exactly what deployed systems cannot do.\n\n• Why the hidden table option is wrong: the new fields are never exposed, so the change is pointless.\n\nSo the answer is: keep name and add the new optional fields."
    },
    {
      type: "multi",
      prompt: "A client only knows the employee JSON fields id, name and role. Select all changes to the employee JSON that are backward compatible with this old client.",
      options: [
        "Renaming name to fullName in every response the server sends",
        "Adding an optional firstName field to each response",
        "Removing the role field from every response the server sends",
        "Keeping name while adding a lastName field to each response",
        "Old clients simply ignoring extra fields they do not recognise"
      ],
      correctIndices: [1, 3, 4],
      modelAnswer: "A new coat of paint on a shop does not stop regulars finding the door. Moving the door does.\n\n• Additive changes are safe: a new optional field, or a new field added beside name, does not break a client that ignores it.\n\n• Tolerant readers help: old clients ignoring unknown fields is what makes additive changes work.\n\n• Breaking changes: renaming name means the old client cannot find the field, and removing role takes away a field it depends on.\n\nSo the answer is: adding optional firstName, keeping name while adding lastName, and ignoring unknown fields are compatible."
    }
  ]
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 8,
  paperNumber: 2,
  title: "Week 8 Lecture: Predicting Performance and Queues",
  topics: "Week 8 lecture (predicting performance and queues). Operational laws from the slide Work is done at different devices: visits per job Vi, service time Si, demand per job Di = Vi x Si, service rate mu = 1/Si, arrival rate and throughput, utilisation Ui = arrival rate x Si; Forced Flow Law Xi = Vi x X; Service Demand Law (Bottleneck Law) Ui = Di x X; Little's law N = lambda T; interactive response time law R = N/X - Z; low-load bounds (R >= D, X <= N/(D+Z)) and high-load bounds (X <= 1/Dmax, R >= N x Dmax - Z); knee N* = (D+Z)/Dmax; planning N <= (R+Z)/Dmax; redesign and the moving bottleneck; re-using stale quantities. Prediction approaches (extrapolation, simulation, analytical models), closed vs open systems, M/M/1 queue results, heavy-tailed service times. Week 7 recap quiz (safe and idempotent methods, 201 Created with Location, stateless, SOAP envelope, WS-* vs REST). Mixed review from Week 4 (two-phase commit), Week 5 (admission control) and Week 6 (message queues).",
  sourceFiles: [
    "lecture/COMP5348_W8.pdf",
    "lecture/Week 08 - Enterprise-s1-low.transcript.md"
  ],
  readings: [
    {
      beforeQuestion: 0,
      title: "Work per job at each device",
      body: "A coffee shop has a cashier and a barista. Every customer is one job. A job needs the cashier twice and the barista three times, and each visit takes 20 seconds. Who jams up first? The barista, because she does more work per customer.\n\n• Job and visit: a job is one complete client request. A visit is one trip to one device, such as the CPU (the processor) or the database.\n\n• Vᵢ: visits one job makes to device i.\n\n• Sᵢ: time actually being served per visit. Waiting in the queue is not counted.\n\n• Dᵢ = Vᵢ × Sᵢ: the service demand, the serving time one job needs from device i.\n\n• Example: CPU has V = 2 and S = 20 ms, so D = 40 ms = 0.04 s. Database has V = 3 and S = 20 ms, so D = 60 ms = 0.06 s.\n\n• Total D is the sum of all Dᵢ, here 0.10 s. The biggest single Dᵢ is D max, here 0.06 s, and that device is the bottleneck."
    },
    {
      beforeQuestion: 5,
      title: "How busy is a device?",
      body: "The barista takes 20 seconds per drink. Working non-stop she could make 3 drinks a minute. If only 1 drink a minute is ordered, she is busy one third of the time.\n\n• μᵢ = 1 / Sᵢ: the service rate, the visits per second the device could finish if it never idled.\n\n• λᵢ: the arrival rate, visits per second arriving at device i.\n\n• Xᵢ: the throughput, visits per second actually completed. If the device keeps up, Xᵢ equals λᵢ.\n\n• Uᵢ = λᵢ × Sᵢ: the utilisation, the fraction of time the device is busy. It can never go above 1, meaning 100 percent.\n\n• Example: a database with S = 20 ms has μ = 1 / 0.02 = 50 visits per second. If 30 visits per second arrive, U = 30 × 0.02 = 0.6, so it is 60 percent busy.\n\n• If arrivals exceed μ, the device is busy all the time, completes only about μ visits per second, and the waiting line keeps growing."
    },
    {
      beforeQuestion: 10,
      title: "From one device to the whole system",
      body: "If the shop finishes 10 customers a minute and each one visits the barista 3 times, she handles 30 visits a minute. How busy she is equals the time each customer needs from her, times customers per minute.\n\n• X: throughput of the whole system, in jobs per second. Xᵢ: throughput of device i, in visits per second.\n\n• Forced Flow Law: Xᵢ = Vᵢ × X.\n\n• Service Demand Law, also called the Bottleneck Law: Uᵢ = Dᵢ × X.\n\n• Example with X = 10 jobs per second: the database (V = 3, D = 0.06 s) sees 3 × 10 = 30 visits per second and has U = 0.06 × 10 = 0.6. The CPU (D = 0.04 s) has U = 0.4. Neither is saturated.\n\n• Utilisation cannot pass 1, so 0.06 × X ≤ 1, which gives X ≤ 1 / 0.06 ≈ 16.67 jobs per second. The database saturates first.\n\n• Watch out: pair Dᵢ with the system throughput X, not with Xᵢ, because D already contains the visits.",
      diagram: "flowchart LR\n  C[\"Client\"] --> CPU[\"CPU: V = 2\"]\n  CPU --> DB[\"Database: V = 3\"]\n  DB --> C2[\"Reply to client\"]"
    },
    {
      beforeQuestion: 16,
      title: "Little's law and the response time law",
      body: "A cafe has 6 people inside and 2 walk in per minute, so each stays about 3 minutes. Crowd, arrival rate and stay length are tied together.\n\n• Little's law: N = λT. N is jobs in the system, λ the arrival rate and T the time each spends there. Some notes write it as L = λ × W. Same law, different letters.\n\n• A closed system has N clients who each cycle: send a request, wait for the reply R, then think for Z seconds.\n\n• Counting everyone, N = X × (R + Z). Rearranged, this is the interactive response time law: R = N / X − Z.\n\n• Example: N = 20 clients, Z = 5 s, measured X = 3.92 jobs per second. Then R = 20 / 3.92 − 5 ≈ 5.10 − 5 = 0.10 s.\n\n• Total demand is D = 0.10 s, so R is about D. Nobody is queueing at this load.\n\n• If R is much bigger than D, jobs are waiting in queues.",
      diagram: "flowchart LR\n  A[\"Think for Z\"] --> B[\"Send request\"]\n  B --> C[\"Wait for reply R\"]\n  C --> A"
    },
    {
      beforeQuestion: 22,
      title: "The two bounds and the knee",
      body: "When a shop is quiet, your wait is just your own service, since nobody is ahead of you. When it is packed, how fast people leave is set by the slowest station.\n\n• Low-load bounds: R ≥ D and X ≤ N / (D + Z). Real values sit near these when there are few clients.\n\n• High-load bounds: X ≤ 1 / D max and R ≥ N × D max − Z. Real values sit near these when there are many clients.\n\n• A bound is a limit the real value cannot beat, like a speed limit.\n\n• The lines cross at the knee N* = (D + Z) / D max. Past it, queues build up badly.\n\n• Example: D = 0.10 s, D max = 0.06 s, Z = 5 s. High-load cap X ≤ 1 / 0.06 ≈ 16.67 jobs per second, and the knee is 5.10 / 0.06 = 85 clients.\n\n• Method: find each Dᵢ, add them up for D, pick D max, apply the bounds. The device with D max is the bottleneck.",
      diagram: "flowchart LR\n  A[\"Find each Di\"] --> B[\"Add up D and pick D max\"]\n  B --> C[\"Apply the bounds\"]\n  C --> D[\"Bottleneck has D max\"]"
    },
    {
      beforeQuestion: 28,
      title: "Planning for scale and redesign",
      body: "A restaurant owner asks how many diners fit before the average wait passes 2 minutes. She works it out from the slowest station, then decides which station to upgrade.\n\n• Planning: from R ≥ N × D max − Z and a target R, we need N ≤ (R target + Z) / D max. Round down.\n\n• Example: R at most 2 s, D max = 0.06 s, Z = 5 s. N ≤ 7 / 0.06 = 116.67, so about 116 clients. Check: 116 × 0.06 − 5 = 1.96 s and 117 × 0.06 − 5 = 2.02 s.\n\n• It is a planning estimate from averages and bounds, not a promise for each single client.\n\n• Redesign: the only way past X ≤ 1 / D max is to shrink D max. Move work off the bottleneck, add devices, cut visits, or use a faster device. Then a new bottleneck appears elsewhere.\n\n• Common mistake: re-using an old number that has changed. With more clients Dᵢ stays the same, but Xᵢ and Uᵢ change."
    },
    {
      beforeQuestion: 34,
      title: "Predicting before you deploy, and one queue",
      body: "Before launching, you want to know how the system will behave. There are three ways.\n\n• Extrapolation: fit a curve through measurements. Fine between measured points, risky beyond them, because behaviour changes sharply once a device saturates.\n\n• Simulation: run a model program. Hard to build and hard to get the parameters.\n\n• Analytical models: maths on averages. The operational laws are the focus of this unit.\n\n• Closed system: N clients with think time Z. Open system: jobs arrive at rate λ.\n\n• M/M/1: random arrivals, one server. ρ = λ / μ, jobs in system N = ρ / (1 − ρ), time in system T = 1 / (μ (1 − ρ)), waiting time T wait = ρ / (μ (1 − ρ)).\n\n• Example with μ = 10 per second: ρ 0.5 gives T = 0.20 s, 0.8 gives 0.50 s, 0.9 gives 1.00 s, 0.95 gives 2.00 s. Keep bottleneck load below about 0.8.\n\n• A few huge jobs, called heavy tails, make queues worse."
    },
    {
      beforeQuestion: 39,
      title: "Recap: REST and SOAP in one glance",
      body: "A quick refresher of last week, told with everyday pictures.\n\n• Reading a menu changes nothing. That is being safe.\n\n• Setting a thermostat to 21 gives the same result however often you do it. That is being idempotent, meaning many times has the same effect as once.\n\n• Pressing add a sandwich and pressing it again gives an extra sandwich. That is neither safe nor idempotent.\n\n• A waiter who forgets you between visits means each order slip has to carry everything the kitchen needs. That is being stateless.\n\n• A letter has an envelope on the outside and a body of content inside, with optional notes in a header. That is how a SOAP message is laid out.\n\n• REST is a style built on the web: addresses for things, cacheable pages and one uniform way to talk. The WS-* family adds extras on top."
    }
  ],
  questions: [
    {
      type: "mcq",
      prompt: "A job visits the disk 4 times. Each visit needs 15 ms of actual disk service, and on average the job also waits another 25 ms in the disk queue per visit. What is the service demand D of the disk per job?",
      options: [
        "160 ms, found by adding the wait to each visit and multiplying by 4",
        "19 ms, found by adding the 4 visits to the 15 ms service time",
        "60 ms, found by multiplying the 4 visits by the 15 ms of service",
        "3.75 ms, found by dividing the 15 ms of service by the 4 visits"
      ],
      correctIndex: 2,
      modelAnswer: "At a car wash, the time the brushes actually scrub your car is service. The time you sit in the queue behind other cars is waiting, and it is not part of the work your car needs.\n\n• The rule: D = V × S, where S is the service time per visit and leaves out waiting.\n\n• Working: D = 4 × 15 ms = 60 ms.\n\n• The 160 ms option models counting the queue: 4 × (15 + 25) treats waiting as service.\n\n• The 19 ms option models adding: 4 + 15 instead of multiplying.\n\n• The 3.75 ms option models dividing: 15 / 4 instead of multiplying.\n\nSo the answer is: 60 ms."
    },
    {
      type: "fillblank",
      prompt: "A job visits the CPU 5 times and each visit needs 8 ms of service. The service demand of the CPU is D = ___ ms per job.",
      blanks: [["40", "40.0"]],
      modelAnswer: "If you ride a bus 5 times a day and each ride is 8 minutes, you spend 40 minutes a day on the bus.\n\n• The rule: D = V × S, visits per job times service time per visit.\n\n• Working: D = 5 × 8 ms = 40 ms.\n\nSo the answer is: 40."
    },
    {
      type: "mcq",
      prompt: "A job visits three devices. The web server has V = 1 and S = 30 ms. The app server has V = 2 and S = 12 ms. The database has V = 6 and S = 6 ms. Which device is the bottleneck?",
      options: [
        "The database, because it has the largest D of the three devices",
        "The web server, because it has the longest service time per visit",
        "The app server, because it sits between the other two devices",
        "All three, because they share the same total D for each job"
      ],
      correctIndex: 0,
      modelAnswer: "In a kitchen the slowest cook is not the one who takes longest per plate, but the one with the most total work per meal.\n\n• The rule: the bottleneck is the device with the largest D = V × S, not the largest S.\n\n• Working, web: 1 × 30 ms = 30 ms.\n\n• Working, app: 2 × 12 ms = 24 ms.\n\n• Working, database: 6 × 6 ms = 36 ms, the largest. The total D is 30 + 24 + 36 = 90 ms.\n\n• The web server option models looking only at S, and the last option models a confusion between the total and the individual devices.\n\nSo the answer is: the database, with D = 36 ms."
    },
    {
      type: "multi",
      prompt: "Device P has V = 2 and S = 25 ms. Device Q has V = 5 and S = 8 ms. Device R has V = 10 and S = 4 ms. Select all statements that are true.",
      options: [
        "Q has a larger D than P because Q is visited more often",
        "P has the largest D and is the bottleneck of the three",
        "R has a smaller D than Q because its S is the smallest",
        "Q and R have the same D as each other",
        "The total D for the three devices is 130 ms"
      ],
      correctIndices: [1, 3, 4],
      modelAnswer: "Three cooks: one does 2 slow steps, one 5 medium steps, one 10 quick steps. What matters is total work per meal, not how many steps or how slow each is.\n\n• Working: D for P = 2 × 25 = 50 ms, for Q = 5 × 8 = 40 ms, for R = 10 × 4 = 40 ms.\n\n• True: P has the largest D, so it is the bottleneck. Q and R tie at 40 ms. Total D = 50 + 40 + 40 = 130 ms.\n\n• False, Q larger than P: 40 is smaller than 50, and more visits alone do not decide D.\n\n• False, R smaller than Q: their D values are equal, since a small S is cancelled by many visits.\n\nSo the answer is: P is the bottleneck, Q and R tie, and the total is 130 ms."
    },
    {
      type: "mcq",
      prompt: "A student computes the service demand of a device with V = 4 visits per job and S = 5 ms as D = V / S = 4 / 0.005 = 800. What is the error?",
      options: [
        "D should be V + S, so the sum of the visits and the time per visit",
        "D should be S / V, so the time per visit shared across the visits",
        "The value 800 is right, but its unit should be visits per second",
        "D should be V × S = 4 × 5 ms = 20 ms, so multiply rather than divide"
      ],
      correctIndex: 3,
      modelAnswer: "If you make 4 trips to the shop and each takes 5 minutes, the total is 20 minutes. Dividing 4 by 5 minutes gives nonsense like 0.8 trips per minute, which is a rate, not a time.\n\n• The rule: D = V × S, the total serving time one job needs from the device.\n\n• Working: 4 × 5 ms = 20 ms, or 0.020 s.\n\n• Why 800 is wrong: 4 / 0.005 is a rate, visits per second, so it has no place as a demand in seconds per job.\n\n• The V + S option adds unlike things, visits and time. The S / V option divides the wrong way round.\n\nSo the answer is: multiply, D = 4 × 5 ms = 20 ms."
    },
    {
      type: "fillblank",
      prompt: "A disk needs S = 4 ms (0.004 s) per visit. Its service rate is μ = ___ visits per second.",
      blanks: [["250", "250.0"]],
      modelAnswer: "If a shop assistant takes 4 seconds per customer, then in one second she is a quarter of the way through one. Turn that around and she can do 250 customers in 1000 seconds.\n\n• The rule: μ = 1 / S, the visits per second the device could finish if it never idled.\n\n• Working: μ = 1 / 0.004 = 250 visits per second.\n\nSo the answer is: 250."
    },
    {
      type: "mcq",
      prompt: "Visits arrive at a device at a rate of λ = 120 per second. Each visit needs S = 5 ms (0.005 s) of service. What is the utilisation of the device?",
      options: [
        "40%, found by taking the idle fraction 1 − 0.6 instead of the busy fraction",
        "600%, found by mixing up the units and using S = 0.05 s in the formula",
        "60%, found by multiplying the arrival rate by the service time per visit",
        "2400%, found by dividing 120 by 5 instead of multiplying by 0.005"
      ],
      correctIndex: 2,
      modelAnswer: "If a barista makes a drink every 5 thousandths of a second and 120 orders come in each second, then out of every second she is busy for 120 short bursts. Add up the bursts and you get the busy fraction.\n\n• The rule: U = λ × S, utilisation is arrival rate times service time per visit, and it cannot exceed 1.\n\n• Working: U = 120 × 0.005 = 0.6, which is 60 percent.\n\n• The 40 percent option is the idle fraction, 1 − 0.6.\n\n• The 600 percent option is a units slip of 10 times, 120 × 0.05.\n\n• The 2400 percent option divides, 120 / 5 = 24. Any answer above 100 percent should also ring alarm bells, since a device cannot be busy more than all the time.\n\nSo the answer is: 60%."
    },
    {
      type: "mcq",
      prompt: "A device has a service rate of μ = 40 visits per second, which is S = 25 ms per visit, but 50 visits per second arrive, so λ × S would be 1.25. What actually happens?",
      options: [
        "It runs at 125 percent utilisation and completes all 50 visits each second",
        "It completes 50 visits per second because throughput always equals the arrival rate",
        "Its service time falls to 20 ms so that it is able to cope with the load",
        "It is busy all the time, completes about 40 visits per second, and the queue keeps growing"
      ],
      correctIndex: 3,
      modelAnswer: "A single till that serves 40 customers a minute cannot serve 50 a minute, however hard people wish it could. The extra 10 every minute just join the line, which gets longer and longer.\n\n• The rule: utilisation cannot go above 1, and throughput cannot exceed the service rate μ.\n\n• Working: λ × S = 50 × 0.025 = 1.25, so the demand is more than the device can give.\n\n• What happens: it saturates, sits at 100 percent busy, completes about 40 visits per second, and the waiting line grows without limit.\n\n• The 125 percent option is impossible. The always equals λ option holds only while the device keeps up. A device does not speed itself up.\n\nSo the answer is: it saturates at 100 percent busy and about 40 visits per second."
    },
    {
      type: "multi",
      prompt: "A device has service time S = 25 ms per visit and visits arrive at λ = 16 per second. Select all statements that are true.",
      options: [
        "Its utilisation is U = 16 / 0.025 = 640",
        "Its service rate is μ = 40 visits per second",
        "A different device with S = 50 ms has μ = 50 visits per second",
        "Its utilisation is U = 0.4, so it is 40 percent busy",
        "If it keeps up, its throughput is X = 16 visits per second"
      ],
      correctIndices: [1, 3, 4],
      modelAnswer: "Think of a barista who needs 25 thousandths of a second per drink and gets 16 orders each second: she can do 40 per second at best, and she is busy 40 percent of the time.\n\n• Working, service rate: μ = 1 / 0.025 = 40 visits per second.\n\n• Working, utilisation: U = λ × S = 16 × 0.025 = 0.4.\n\n• Throughput: when the device keeps up, what arrives also leaves, so X = λ = 16.\n\n• False, 640: that divides, 16 / 0.025, instead of multiplying, and no utilisation can be above 1.\n\n• False, 50 per second: a slower 50 ms service means μ = 1 / 0.05 = 20 per second, not 50. Mixing up milliseconds and rate is the slip.\n\nSo the answer is: μ = 40, U = 0.4 and X = 16 are true."
    },
    {
      type: "match",
      prompt: "Match each symbol or term for a device i to its meaning.",
      pairs: [
        { left: "Vᵢ", right: "visits one job makes to device i" },
        { left: "Sᵢ", right: "service time for one visit, not counting waiting" },
        { left: "Dᵢ", right: "total service time one job needs from device i" },
        { left: "μᵢ", right: "visits per second the device could finish if it never idled" },
        { left: "λᵢ", right: "visits per second arriving at device i" },
        { left: "Uᵢ", right: "fraction of time the device is busy" }
      ],
      decoys: [
        "average time from a request to its reply for the whole job",
        "time a client waits between a reply and its next request"
      ],
      modelAnswer: "These symbols are like the labels on a shop's staff timetable: how many trips, how long each takes, how much in total, and how busy the person is.\n\n• Vᵢ counts visits per job, and Sᵢ is the time of one visit with queueing left out.\n\n• Dᵢ = Vᵢ × Sᵢ is the total serving time per job at that device.\n\n• μᵢ = 1 / Sᵢ is the rate the device could do at most. λᵢ is the rate of arrivals. Uᵢ = λᵢ × Sᵢ is the busy fraction.\n\n• The decoys: the time from request to reply for the whole job is the response time R, and the wait between a reply and the next request is the think time Z.\n\nSo the answer is: match each symbol to its own meaning, and R and Z are not device symbols."
    },
    {
      type: "fillblank",
      prompt: "The whole system completes X = 6 jobs per second, and each job makes 4 visits to the cache server. The cache server's throughput is Xcache = ___ visits per second.",
      blanks: [["24", "24.0"]],
      modelAnswer: "If a school finishes 6 students per minute and each student visits the library desk 4 times, the desk handles 24 visits per minute.\n\n• The rule: Forced Flow Law, Xᵢ = Vᵢ × X. Every job is forced to visit device i Vᵢ times, so the device sees Vᵢ times the job rate.\n\n• Working: Xcache = 4 × 6 = 24 visits per second.\n\nSo the answer is: 24."
    },
    {
      type: "mcq",
      prompt: "The whole system completes X = 15 jobs per second, and the app server has a service demand of D = 0.03 s per job. What is the utilisation of the app server?",
      options: [
        "45%, found by multiplying the demand by the system throughput",
        "0.2%, found by dividing the demand by the system throughput",
        "55%, found by taking the idle fraction instead of the busy one",
        "50,000%, found by dividing the throughput by the demand"
      ],
      correctIndex: 0,
      modelAnswer: "If each customer needs 3 hundredths of a second of the barista and 15 customers arrive every second, then the barista is busy for 15 of those short bursts each second.\n\n• The rule: Service Demand Law, Uᵢ = Dᵢ × X. It is also called the Bottleneck Law.\n\n• Working: U = 0.03 × 15 = 0.45, so 45 percent busy.\n\n• The 0.2 percent option divides, 0.03 / 15 = 0.002.\n\n• The 55 percent option is the idle share, 1 − 0.45.\n\n• The 50,000 percent option divides the other way, 15 / 0.03 = 500. It is also impossible, since utilisation never exceeds 100 percent.\n\nSo the answer is: 45%."
    },
    {
      type: "mcq",
      prompt: "The database has a service demand of D = 0.04 s per job. What is the highest system throughput X before the database is 100 percent busy?",
      options: [
        "0.04 jobs per second, which is the demand value itself",
        "40 jobs per second, which is 1 divided by a 25 ms service time",
        "2.5 jobs per second, which slips the decimal point by a factor of ten",
        "25 jobs per second, which is 1 divided by the demand of 0.04 s"
      ],
      correctIndex: 3,
      modelAnswer: "A till that needs 4 hundredths of a second of your time per customer can serve 25 customers a second at most, because 25 × 0.04 = 1 whole second of work.\n\n• The rule: U = D × X, and U can be at most 1. So D × X ≤ 1, which means X ≤ 1 / D.\n\n• Working: X ≤ 1 / 0.04 = 25 jobs per second.\n\n• The 0.04 option just repeats D. The 40 option assumes S = 25 ms and does 1 / S, but D is per job, not per visit. The 2.5 option slips the decimal point.\n\nSo the answer is: 25 jobs per second."
    },
    {
      type: "mcq",
      prompt: "A shop system runs at X = 20 jobs per second. The web server has V = 1 and S = 15 ms. The app server has V = 3 and S = 10 ms. The database has V = 5 and S = 8 ms. Every job visits web, then app, then database. What is true?",
      promptDiagram: "flowchart LR\n  C[\"Client\"] --> W[\"Web: V = 1, S = 15 ms\"]\n  W --> A[\"App: V = 3, S = 10 ms\"]\n  A --> D[\"Database: V = 5, S = 8 ms\"]",
      options: [
        "The database is saturated, because it receives 5 × 20 = 100 visits per second",
        "The web server is busiest, because it has the longest time per visit at 15 ms",
        "No device is saturated and the database is the busiest at 80 percent utilisation",
        "The system is overloaded, because 0.3 + 0.6 + 0.8 = 1.7 is above 1"
      ],
      correctIndex: 2,
      modelAnswer: "Three cooks in a row, each with a different amount of work per meal. To see who is swamped, work out how much of each cook's time is taken up.\n\n• Demands: web D = 1 × 15 = 15 ms, app D = 3 × 10 = 30 ms, database D = 5 × 8 = 40 ms.\n\n• Utilisations with U = D × X: web 0.015 × 20 = 0.3, app 0.030 × 20 = 0.6, database 0.040 × 20 = 0.8.\n\n• No device reaches 1, and the database, at 80 percent, is the busiest.\n\n• The saturated option ignores that the database can do 1 / 0.008 = 125 visits per second, so 100 is well within its limit.\n\n• The web option looks at S only, and the 1.7 option adds up utilisations, but each one belongs to its own device and they are never summed.\n\nSo the answer is: nothing is saturated and the database is busiest at 80 percent."
    },
    {
      type: "multi",
      prompt: "The system completes X = 12 jobs per second. Each job visits the database V = 2 times, and the database has a service demand of D = 0.05 s per job, so S = 25 ms. Select all statements that are true.",
      options: [
        "The database throughput is Xdb = 24 visits per second",
        "The database utilisation is 0.05 × 24 = 1.2, so it is overloaded",
        "The database utilisation is U = 0.6",
        "The database throughput is Xdb = 12 / 2 = 6 visits per second",
        "The database alone limits the system to at most 20 jobs per second"
      ],
      correctIndices: [0, 2, 4],
      modelAnswer: "A cook who needs 5 hundredths of a second per meal, with 12 meals a second, is busy for 0.6 of each second. Two visits per meal double the number of visits, but the 0.05 already counts both.\n\n• Working, Forced Flow: Xdb = V × X = 2 × 12 = 24 visits per second.\n\n• Working, Service Demand Law: U = D × X = 0.05 × 12 = 0.6.\n\n• Working, cap: X ≤ 1 / 0.05 = 20 jobs per second.\n\n• False, 1.2: it pairs D with the visit rate 24. D already contains the visits, so it must be paired with the system throughput 12.\n\n• False, 6 visits per second: Forced Flow multiplies by V, it does not divide.\n\nSo the answer is: 24 visits per second, U = 0.6 and a cap of 20 jobs per second."
    },
    {
      type: "truefalse",
      prompt: "True or False: When the system throughput doubles from 8 to 16 jobs per second, the service demand Dᵢ of each device also doubles.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer: "How long a haircut takes does not depend on how many people are queuing. More customers means a busier barber, but each haircut takes the same time.\n\n• The rule: Dᵢ = Vᵢ × Sᵢ depends on the job and the device, not on the load.\n\n• What does change: Xᵢ = Vᵢ × X and Uᵢ = Dᵢ × X both double when X doubles. That is why re-using an old Uᵢ after the load changes is a mistake.\n\nSo the answer is: False."
    },
    {
      type: "fillblank",
      prompt: "A closed system has N = 40 clients with think time Z = 6 s and throughput X = 5 jobs per second. The average response time is R = ___ seconds.",
      blanks: [["2", "2.0", "2.00"]],
      modelAnswer: "In a closed system each client cycles between waiting for a reply and thinking. Forty clients moving through 5 jobs per second means each one cycles once every 8 seconds, of which 6 are thinking.\n\n• The rule: interactive response time law, R = N / X − Z.\n\n• Working: R = 40 / 5 − 6 = 8 − 6 = 2 seconds.\n\nSo the answer is: 2."
    },
    {
      type: "mcq",
      prompt: "A closed system has N = 60 clients with think time Z = 3 s. The measured average response time is R = 1.5 s. What is the system throughput X?",
      options: [
        "40 jobs per second, found by dividing N by R and ignoring the think time",
        "20 jobs per second, found by dividing N by Z and ignoring the wait",
        "13.3 jobs per second, found by dividing N by R + Z, so 60 / 4.5",
        "90 jobs per second, found by multiplying N by R instead of dividing"
      ],
      correctIndex: 2,
      modelAnswer: "Each client's full cycle is the wait for the reply plus the thinking time. Counting only part of the cycle over-counts how fast the jobs finish.\n\n• The rule: N = X × (R + Z), so X = N / (R + Z).\n\n• Working: X = 60 / (1.5 + 3) = 60 / 4.5 ≈ 13.3 jobs per second.\n\n• The 40 option is 60 / 1.5, which forgets the think time Z.\n\n• The 20 option is 60 / 3, which forgets the response time R.\n\n• The 90 option multiplies, 60 × 1.5.\n\nSo the answer is: about 13.3 jobs per second."
    },
    {
      type: "mcq",
      prompt: "A server has on average N = 30 requests inside it at any moment, and it completes λ = 60 requests per second. On average, how long does each request spend in the server?",
      options: [
        "0.5 s, found with Little's law as N divided by the arrival rate",
        "2 s, found by dividing the arrival rate by the number of requests",
        "1800 s, found by multiplying the requests by the arrival rate",
        "90 s, found by adding the number of requests to the arrival rate"
      ],
      correctIndex: 0,
      modelAnswer: "If 30 people are in a cafe and 60 walk out every second, each person must have been there for half a second.\n\n• The rule: Little's law, N = λT, where T is the average time in the system.\n\n• Working: T = N / λ = 30 / 60 = 0.5 seconds.\n\n• The 2 s option flips the fraction, 60 / 30. The 1800 s option multiplies. The 90 s option adds numbers with different units.\n\nSo the answer is: 0.5 s."
    },
    {
      type: "mcq",
      prompt: "A system has a total demand D = 0.30 s per job. With N = 30 clients, think time Z = 10 s and measured throughput X = 2.9 jobs per second, what is the average response time and what does it say about queueing?",
      options: [
        "About 0.30 s, exactly equal to D, so there is no queueing at all in the system",
        "About 0.34 s, just above D, so there is very little queueing in the system",
        "About 10.34 s, far above D, so the system is suffering from heavy queueing",
        "About 77 s, far above D, so the system is suffering from very heavy queueing"
      ],
      correctIndex: 1,
      modelAnswer: "Response time is the wait from asking to being answered. If nobody queues, it equals the pure work D. Any extra is time spent standing in lines.\n\n• The rule: R = N / X − Z.\n\n• Working: R = 30 / 2.9 − 10 = 10.34 − 10 ≈ 0.34 s.\n\n• Reading it: 0.34 s is only slightly more than D = 0.30 s, so there is very little queueing.\n\n• The 10.34 s option forgets to subtract Z. The 77 s option multiplies, N × X − Z. The 0.30 s option assumes R equals D without calculating.\n\nSo the answer is: about 0.34 s, so very little queueing."
    },
    {
      type: "multi",
      prompt: "A closed system has N = 25 clients, think time Z = 5 s and throughput X = 4 jobs per second. Select all statements that are true.",
      options: [
        "N = X × (R + Z) = 4 × 6.25 = 25, which fits R = 1.25 s",
        "The response time is R = 25 / 4 − 5 = 1.25 s",
        "The response time is R = 25 / 4 = 6.25 s",
        "The throughput is X = N / (R + Z) = 25 / 6.25 = 4 jobs per second",
        "The response time is R = N × X − Z = 25 × 4 − 5 = 95 s"
      ],
      correctIndices: [0, 1, 3],
      modelAnswer: "Each client spends 6.25 seconds per cycle, of which 5 are thinking, so 1.25 seconds are waiting for the system.\n\n• Working, response time: R = 25 / 4 − 5 = 6.25 − 5 = 1.25 s.\n\n• Working, consistency: X × (R + Z) = 4 × 6.25 = 25 = N, and X = 25 / 6.25 = 4.\n\n• False, 6.25 s: that is R + Z, the whole cycle, not R alone.\n\n• False, 95 s: it multiplies N and X instead of dividing.\n\nSo the answer is: R = 1.25 s, N = X × (R + Z) holds, and X = N / (R + Z) holds."
    },
    {
      type: "order",
      prompt: "Put the stages of one client's cycle in a closed system into the correct order.",
      steps: [
        "The client finishes thinking and sends a request",
        "The request queues for and is served by the devices",
        "The reply arrives back at the client",
        "The client thinks for Z seconds before sending the next request"
      ],
      modelAnswer: "It is like a diner who orders, waits for the food, eats and chats, then orders again. The whole loop repeats for every diner.\n\n• Stages 2 and 3 together are the response time R, the wait from sending to getting the reply.\n\n• Stage 4 is the think time Z.\n\n• One trip round the loop takes R + Z. With N clients each doing X cycles per second overall, the law N = X × (R + Z) counts the clients in both the waiting and the thinking stages.\n\nSo the answer is: send, be served, reply arrives, think, and then the cycle repeats."
    },
    {
      type: "fillblank",
      prompt: "System K has three devices with service demands CPU 0.06 s, database 0.10 s and disk 0.04 s per job, so D = 0.20 s in total and the think time is Z = 10 s. The high-load throughput bound is X ≤ ___ jobs per second.",
      blanks: [["10", "10.0"]],
      modelAnswer: "A road is only as fast as its narrowest bridge. In System K the narrowest bridge is the device with the biggest demand, the database.\n\n• The rule: at high load X ≤ 1 / D max, where D max is the largest single demand.\n\n• Working: D max = 0.10 s, so X ≤ 1 / 0.10 = 10 jobs per second.\n\nSo the answer is: 10."
    },
    {
      type: "mcq",
      prompt: "System K has demands CPU 0.06 s, database 0.10 s and disk 0.04 s per job, so D = 0.20 s in total, and Z = 10 s. There are N = 30 clients. Which upper bound on the throughput X is the smaller one, and what is its value?",
      options: [
        "The high-load bound 1 / D max, which gives X ≤ 10 jobs per second",
        "The bound N / Z, which gives X ≤ 3.0 jobs per second",
        "The bound 1 / D, which gives X ≤ 5 jobs per second",
        "The low-load bound N / (D + Z), which gives X ≤ 2.94 jobs per second"
      ],
      correctIndex: 3,
      modelAnswer: "A queue at a shop is limited by two things: how few people are trying to get in, and how fast the slowest counter works. Whichever limit is tighter is the one that bites.\n\n• The two bounds: low-load X ≤ N / (D + Z) and high-load X ≤ 1 / D max. Real X is below both.\n\n• Working, low-load: 30 / (0.20 + 10) = 30 / 10.2 ≈ 2.94 jobs per second.\n\n• Working, high-load: 1 / 0.10 = 10 jobs per second. The smaller is 2.94, so 30 clients are too few to reach the high-load cap.\n\n• The 3.0 option drops D from the bottom. The 5 option uses the total D instead of D max.\n\nSo the answer is: the low-load bound, 2.94 jobs per second."
    },
    {
      type: "mcq",
      prompt: "System K has D = 0.20 s in total, D max = 0.10 s and Z = 10 s. What is the knee point N*, the number of clients where the low-load and high-load bounds cross?",
      options: [
        "102 clients, found from N* = (D + Z) / D max = 10.2 / 0.10",
        "100 clients, found from Z / D max and so dropping D from the top",
        "2 clients, found from D / D max and so dropping Z from the top",
        "51 clients, found by dividing D + Z by the total D instead of D max"
      ],
      correctIndex: 0,
      modelAnswer: "The knee is the crowd size at which a shop stops feeling quiet and starts to jam. Below it clients rarely wait, above it queues build up quickly.\n\n• The rule: set N / (D + Z) equal to 1 / D max and solve, so N* = (D + Z) / D max.\n\n• Working: N* = (0.20 + 10) / 0.10 = 10.2 / 0.10 = 102 clients.\n\n• The 100 option drops D. The 2 option drops Z. The 51 option divides by D = 0.20 instead of D max = 0.10.\n\nSo the answer is: 102 clients."
    },
    {
      type: "mcq",
      prompt: "System K has D max = 0.10 s and Z = 10 s, and its knee is at 102 clients. With N = 150 clients, far above the knee, what does the high-load bound say about the average response time R?",
      options: [
        "R ≥ 0.20 s, which is the low-load bound and only applies with few clients",
        "R ≥ 15 s, found from N × D max and forgetting to subtract the think time",
        "R ≥ 5 s, found from N × D max − Z = 150 × 0.10 − 10",
        "R ≥ 25 s, found from N × D max + Z by adding the think time instead"
      ],
      correctIndex: 2,
      modelAnswer: "When 150 people crowd into a shop that can only serve one person every 0.10 s at its slowest counter, the last one in line waits a long time. But each person also spends 10 s away, thinking, before rejoining the queue, which reduces the wait.\n\n• The rule: at high load R ≥ N × D max − Z.\n\n• Working: R ≥ 150 × 0.10 − 10 = 15 − 10 = 5 s.\n\n• Why not 0.20 s: R ≥ D is the low-load bound, which is only tight with few clients. Far above the knee it is a very weak limit.\n\n• The 15 s option forgets to subtract Z. The 25 s option adds Z instead.\n\nSo the answer is: R ≥ 5 s."
    },
    {
      type: "multi",
      prompt: "System K has D = 0.20 s in total, D max = 0.10 s and Z = 10 s, with a knee at 102 clients. Select all statements that are true.",
      options: [
        "At N = 300 the low-load bound N / (D + Z) is the one closest to the real throughput",
        "At N = 20 the real response time is close to D = 0.20 s",
        "At N = 300 the real throughput is close to 10 jobs per second",
        "Adding clients beyond the knee raises throughput noticeably",
        "At N = 300 the response time is at least 300 × 0.10 − 10 = 20 s"
      ],
      correctIndices: [1, 2, 4],
      modelAnswer: "Picture a shop that is nearly empty versus one with a queue out of the door. Empty: each customer waits only for their own service. Packed: the slowest counter sets the pace, and adding more people only lengthens the line.\n\n• True, N = 20: this is well below the knee of 102, so the real R hugs the low-load bound R ≥ D = 0.20 s.\n\n• True, N = 300: this is well above the knee, so real X is close to the high-load cap 1 / 0.10 = 10 jobs per second.\n\n• True, R at N = 300: R ≥ 300 × 0.10 − 10 = 30 − 10 = 20 s.\n\n• False, low-load closest: at N = 300 the low-load bound is 300 / 10.2 ≈ 29 jobs per second, far above the real cap of 10, so it is not close.\n\n• False, more clients raise X: past the knee X is stuck near the cap and only R grows.\n\nSo the answer is: the N = 20, N = 300 throughput and N = 300 response time statements are true."
    },
    {
      type: "sort",
      prompt: "Put each statement into the box for the bound family it belongs to.",
      groups: ["Low-load bound", "High-load bound"],
      items: [
        { text: "R ≥ D", group: 0 },
        { text: "X ≤ N / (D + Z)", group: 0 },
        { text: "Real values sit close to this line when there are few clients", group: 0 },
        { text: "X ≤ 1 / D max", group: 1 },
        { text: "R ≥ N × D max − Z", group: 1 },
        { text: "Real values sit close to this line when there are many clients", group: 1 }
      ],
      modelAnswer: "A shop has two modes. Quiet mode: nobody is ahead of you, so your wait is just your own service. Packed mode: the slowest counter decides everything.\n\n• Low-load family: R ≥ D and X ≤ N / (D + Z), which real values follow when there are few clients.\n\n• High-load family: X ≤ 1 / D max and R ≥ N × D max − Z, which real values follow when there are many clients.\n\n• The knee N* = (D + Z) / D max is where the two families cross.\n\nSo the answer is: D and N over D + Z belong to low load, and D max lines belong to high load."
    },
    {
      type: "fillblank",
      prompt: "A system has D max = 0.04 s and Z = 6 s, and the target is an average response time of at most R = 2.5 s. Using N ≤ (R + Z) / D max and rounding down, the largest number of clients the plan allows is N = ___.",
      blanks: [["212"]],
      modelAnswer: "A restaurant owner asks how many diners she can seat before the average wait goes over the limit. She works from the slowest station.\n\n• The rule: from R ≥ N × D max − Z, keeping R at most the target gives N ≤ (R target + Z) / D max.\n\n• Working: N ≤ (2.5 + 6) / 0.04 = 8.5 / 0.04 = 212.5, so round down to 212.\n\n• Check: 212 × 0.04 − 6 = 2.48 s, which is within 2.5 s. 213 × 0.04 − 6 = 2.52 s, which is over.\n\nSo the answer is: 212."
    },
    {
      type: "mcq",
      prompt: "A system has total demand D = 0.10 s, D max = 0.08 s and Z = 5 s. The target is an average response time of at most 1 s. What is the largest number of clients the plan allows?",
      options: [
        "60 clients, found by using the total D instead of D max, so 6 / 0.10",
        "75 clients, found from (R + Z) / D max = (1 + 5) / 0.08",
        "50 clients, found from (Z − R) / D max by subtracting R instead of adding",
        "12 clients, found from R / D max by forgetting the think time Z"
      ],
      correctIndex: 1,
      modelAnswer: "Same restaurant idea: the number of diners you can seat depends on how slow the slowest station is, and think time lets more people fit.\n\n• The rule: N ≤ (R target + Z) / D max, using D max, not the total D.\n\n• Working: N ≤ (1 + 5) / 0.08 = 6 / 0.08 = 75 clients.\n\n• The 60 option uses D = 0.10. The 50 option computes (5 − 1) / 0.08, a sign slip. The 12 option is 1 / 0.08 = 12.5 rounded down, which leaves out Z.\n\nSo the answer is: 75 clients."
    },
    {
      type: "mcq",
      prompt: "A planner finds N ≤ 75 for an average response time of at most 1 s. A manager says: so client number 75 is guaranteed a response in one second or less. What is the best reply?",
      options: [
        "Yes, because the bound is exact for every single request that the system serves",
        "Yes, but only if the maximum service demand is measured in milliseconds not seconds",
        "No, because the bound ignores the think time Z when it counts the number of clients",
        "No, it is a planning estimate from averages, so it does not promise any single request"
      ],
      correctIndex: 3,
      modelAnswer: "A weather forecast that says on average 20 degrees does not promise that today at noon you will feel exactly 20 degrees.\n\n• What the calculation is: a bound built from average demands. It says beyond roughly 75 clients the average target cannot be met.\n\n• What it is not: a guarantee that one particular request, such as the one from client number 75, finishes within 1 s.\n\n• Why the other replies are wrong: the bound is not exact per request, units do not matter as long as they are consistent, and Z is included in the formula since N ≤ (R + Z) / D max.\n\nSo the answer is: it is a planning estimate, not a per-request guarantee."
    },
    {
      type: "multi",
      prompt: "A system has demands web 0.02 s, app 0.05 s and database 0.08 s per job, so X ≤ 12.5 jobs per second at present. Select all changes that would raise the maximum throughput bound.",
      options: [
        "Cache reads so that database visits per job halve, so the database demand drops to 0.04 s",
        "Replace the web server with one that is twice as fast, so the web demand drops to 0.01 s",
        "Move half the database work to a second identical database, so each carries 0.04 s",
        "Increase the think time Z of every client, so that clients pause longer between requests",
        "Buy database storage that is 30 percent faster, so the database demand drops to 0.056 s"
      ],
      correctIndices: [0, 2, 4],
      modelAnswer: "A three-person assembly line jams at its slowest person. Speeding up anyone else changes nothing, and telling the workers to take longer breaks changes nothing either.\n\n• The rule: X ≤ 1 / D max, so only shrinking D max raises the bound. Here D max is the database at 0.08 s.\n\n• True, cache: the database drops to 0.04 s, so the new D max is the app at 0.05 s and X ≤ 20 jobs per second.\n\n• True, second database: each database carries 0.04 s, so again the app is D max and X ≤ 20.\n\n• True, faster storage: D max becomes 0.056 s and X ≤ 1 / 0.056 ≈ 17.9 jobs per second.\n\n• False, faster web server: the database is still D max, so X ≤ 12.5 stays. False, Z: think time does not appear in the high-load throughput bound.\n\nSo the answer is: the cache, the second database and the faster storage all raise the bound."
    },
    {
      type: "mcq",
      prompt: "After adding a cache, the demands are web 0.02 s, app 0.05 s and database 0.04 s per job. Before the change the bound was X ≤ 12.5 jobs per second. What is the new maximum throughput bound?",
      options: [
        "20 jobs per second, because the app server is now the bottleneck at 0.05 s",
        "25 jobs per second, because the database demand of 0.04 s is used as if it were still the bottleneck",
        "12.5 jobs per second, because the cache does not change the bound at all",
        "50 jobs per second, because the smallest demand of 0.02 s is used for the bound"
      ],
      correctIndex: 0,
      modelAnswer: "If you speed up the slowest runner in a relay, the team's pace is now set by the next slowest runner.\n\n• The rule: X ≤ 1 / D max, and D max is the largest demand after the change.\n\n• Working: the demands are 0.02, 0.05 and 0.04, so D max = 0.05 s and X ≤ 1 / 0.05 = 20 jobs per second.\n\n• The 25 option is 1 / 0.04. It forgets that the bottleneck moved. The 12.5 option keeps the old bound. The 50 option uses the web server, which is the fastest device.\n\nSo the answer is: 20 jobs per second, and the bottleneck is now the app server."
    },
    {
      type: "order",
      prompt: "Put the steps of a bottleneck analysis in the correct order.",
      steps: [
        "Identify the resources (devices) a job uses",
        "Find Vᵢ and Sᵢ and compute Dᵢ = Vᵢ × Sᵢ for each",
        "Add up D and pick out D max",
        "Apply the low-load and high-load bounds",
        "The device with D max is the bottleneck, so redesign there first"
      ],
      modelAnswer: "A doctor first lists the symptoms, then measures, then adds up the results, and only then decides what to treat.\n\n• Step 1: list the devices a job touches.\n\n• Step 2: for each device get visits and service time, then compute Dᵢ = Vᵢ × Sᵢ.\n\n• Step 3: sum them for D and pick the biggest as D max.\n\n• Step 4: apply the bounds, using D and D max.\n\n• Step 5: the device with D max is the bottleneck, and the redesign targets it, after which a new bottleneck may appear.\n\nSo the answer is: list devices, compute each D, add and pick D max, apply the bounds, then fix the bottleneck."
    },
    {
      type: "mcq",
      prompt: "A team measured the average response time at 10, 20 and 30 clients and fitted a curve through the results to predict other loads. Which statement is right?",
      options: [
        "The estimates for 25 clients and for 400 clients are equally reliable, because the same curve produced both",
        "The estimate for 400 clients is reliable but the one for 25 clients is not, because 400 is closer to the limit",
        "Curve fitting never works for computer systems, so neither the 25 nor the 400 client estimate has any value",
        "The estimate for 25 clients is trustworthy, but 400 is risky because behaviour changes sharply at saturation"
      ],
      correctIndex: 3,
      modelAnswer: "If you measured a child's height at ages 10, 20 and 30 you could guess the height at 25, but guessing what it will be at 400 is silly. Things change in ways the measurements never showed.\n\n• Interpolation: predicting between measured points is usually fine, so the 25 client estimate is trustworthy.\n\n• Extrapolation: predicting beyond the measured range is risky, because once a device saturates the response time bends sharply upward and a curve fitted to light loads misses it.\n\n• Other prediction approaches exist: simulation, which is hard to build, and analytical models such as the operational laws.\n\nSo the answer is: 25 clients is fine, and 400 clients is risky."
    },
    {
      type: "mcq",
      prompt: "In an M/M/1 queue the server completes μ = 20 jobs per second and jobs arrive at λ = 16 per second, so the load is ρ = 0.8. What is the average time a job spends in the system, T = 1 / (μ × (1 − ρ))?",
      options: [
        "0.05 s, which is only the service time 1 / μ with the queue left out",
        "0.25 s, found from 1 / (20 × 0.2) with the queue included",
        "0.20 s, which is only the waiting time ρ / (μ × (1 − ρ)) and not the service",
        "5 s, found from 1 / (1 − ρ) by forgetting to divide by the service rate"
      ],
      correctIndex: 1,
      modelAnswer: "One till, customers arriving at random. At 80 percent busy there is usually someone ahead of you, so your time at the till is your own service plus a wait.\n\n• The rule: for M/M/1, T = 1 / (μ × (1 − ρ)).\n\n• Working: T = 1 / (20 × 0.2) = 1 / 4 = 0.25 s.\n\n• The 0.05 s option is 1 / μ, the service alone. The 0.20 s option is the waiting alone, 0.8 / 4. The 5 s option is 1 / 0.2, which forgets μ.\n\n• Check: 0.05 s service plus 0.20 s waiting gives 0.25 s.\n\nSo the answer is: 0.25 s."
    },
    {
      type: "fillblank",
      prompt: "In an M/M/1 queue, jobs arrive at λ = 18 per second and the server completes μ = 20 per second. The average number of jobs in the system is N = ρ / (1 − ρ) = ___.",
      blanks: [["9", "9.0"]],
      modelAnswer: "A till that is busy nine tenths of the time usually has a long line. On average nine people are in the shop, whether waiting or being served.\n\n• Load: ρ = λ / μ = 18 / 20 = 0.9.\n\n• Working: N = 0.9 / (1 − 0.9) = 0.9 / 0.1 = 9 jobs.\n\nSo the answer is: 9."
    },
    {
      type: "multi",
      prompt: "An M/M/1 server has μ = 50 jobs per second. Select all statements that are true.",
      options: [
        "Raising λ from 40 to 48, which is 20 percent more, raises T by about 20 percent",
        "At λ = 40 the load is ρ = 0.8 and the average time in the system is T = 0.10 s",
        "Since μ never changes, T is the same at λ = 40 and at λ = 48",
        "At λ = 48 the load is ρ = 0.96 and the average time in the system is T = 0.50 s",
        "At λ = 40 there are on average 4 jobs in the system"
      ],
      correctIndices: [1, 3, 4],
      modelAnswer: "Adding a few more customers to a till that is already 80 percent busy hardly seems to matter, but the queue explodes as it nears 100 percent.\n\n• Working, λ = 40: ρ = 40 / 50 = 0.8, T = 1 / (50 × 0.2) = 0.10 s, and N = 0.8 / 0.2 = 4 jobs.\n\n• Working, λ = 48: ρ = 0.96, T = 1 / (50 × 0.04) = 0.50 s.\n\n• False, about 20 percent: T went from 0.10 s to 0.50 s, which is five times as much, so the growth is not proportional.\n\n• False, same T: the server is unchanged, but the load changed, and T depends on 1 − ρ.\n\nSo the answer is: response time grows sharply, non-linearly, as the load nears 1."
    },
    {
      type: "truefalse",
      prompt: "True or False: If a few jobs are enormous (heavy-tailed service times) but the average service time is unchanged, queues and response times get worse.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer: "A supermarket checkout where most people buy one item but a few bring three trolleys: the average shop may not change, but everyone stuck behind a trolley-full customer waits ages.\n\n• The reason: variability. One huge job holds the server for a long time while many small jobs queue behind it.\n\n• The average alone hides this, so queues and response times rise even though the mean service time is the same.\n\nSo the answer is: True."
    },
    {
      type: "mcq",
      prompt: "Which HTTP method is safe as well as idempotent?",
      options: [
        "PUT, because sending it again replaces the resource with the same data",
        "DELETE, because deleting a resource that is already gone leaves the same result",
        "POST, because it sends data to the server and the server decides what to do",
        "GET, because it only reads a resource and repeating it changes nothing at all"
      ],
      correctIndex: 3,
      modelAnswer: "Reading a menu changes nothing at the restaurant. Booking a table for 7pm gives the same booking however often you say it, but it did change something the first time.\n\n• Safe: the call does not change the resource. Idempotent: repeating it has the same effect as doing it once.\n\n• GET is both: repeated GETs return the same representation and change nothing.\n\n• PUT and DELETE are idempotent but not safe, because they change the resource. POST is neither, since repeating it can create duplicates.\n\nSo the answer is: GET."
    },
    {
      type: "mcq",
      prompt: "A client POSTs a new order and the server chooses the order's URL (its resource identifier). What should the response be?",
      options: [
        "201 Created, with a Location header that holds the new order's URL",
        "200 OK, with no Location header, so the client has to search for the order",
        "204 No Content, with no Location header and nothing else in the response",
        "303 See Other, with a redirect back to the collection of all orders"
      ],
      correctIndex: 0,
      modelAnswer: "When you drop a parcel off at a depot, they hand you a receipt with the tracking address. That is what the client needs.\n\n• Status: 201 Created says a new resource now exists.\n\n• Location header: it carries the address of the new order, chosen by the server, so the client can find it later.\n\n• Why the others are weaker: 200 with no location, and 204 with nothing, leave the client without the new address. A 303 redirect to the collection also does not point at the new order.\n\nSo the answer is: 201 Created with a Location header."
    },
    {
      type: "mcq",
      prompt: "When we say that a service is stateless, what does that mean?",
      options: [
        "The service has no database behind it, so it never has anywhere to store data",
        "The service never changes its data, so every response is the same as before",
        "The server keeps no session between requests, and each request carries everything needed",
        "The client keeps no cache, so it must always ask the server for a fresh copy"
      ],
      correctIndex: 2,
      modelAnswer: "A waiter who forgets you between visits. Each order slip must carry everything the kitchen needs, because nobody remembers your last visit.\n\n• Meaning: the server keeps no conversation or session memory between requests.\n\n• Consequence: each request carries all the information needed, such as who you are and what you want.\n\n• Why it helps: any server in a group can handle any request, so it is easy to scale.\n\n• Why the other options are wrong: a stateless service may well have a database and may change its data. And stateless says nothing about client caches.\n\nSo the answer is: no session state kept on the server between requests."
    },
    {
      type: "mcq",
      prompt: "Which message structure is XML with an envelope that contains a header and a body?",
      options: [
        "A REST resource representation, which is a document sent for a URI",
        "A SOAP message, which wraps its content in an envelope with header and body",
        "A gRPC Protobuf message, which is a compact binary payload with numbered fields",
        "A plain JSON payload with HTTP headers, which has no envelope of its own"
      ],
      correctIndex: 1,
      modelAnswer: "A letter has an envelope on the outside, optional notes about the letter, and the letter body itself. A SOAP message is laid out the same way.\n\n• Envelope: mandatory outer wrapper.\n\n• Header: optional, for extras such as security, transaction context or routing.\n\n• Body: mandatory, the actual request or document.\n\n• The others do not look like this: REST sends whatever representation you choose, gRPC uses binary Protobuf, and plain JSON has no envelope.\n\nSo the answer is: a SOAP message."
    },
    {
      type: "multi",
      prompt: "Which capabilities do WS-* (SOAP) standards give that REST does not?",
      options: [
        "Caching of responses",
        "Transport neutrality, so messages can travel over any transport",
        "A uniform interface for every resource",
        "Support for distributed transactions, in the style of WS-AtomicTransaction"
      ],
      correctIndices: [1, 3],
      modelAnswer: "REST is a style built on the web itself. WS-* is a toolbox of extras added on top of messages.\n\n• Transport neutrality: SOAP messages do not care whether they travel over HTTP, a queue or something else.\n\n• Distributed transactions: WS-AtomicTransaction and similar standards let several services agree to commit or abort together.\n\n• Not extras: caching comes from HTTP and is part of REST. The uniform interface, meaning the same small set of verbs for every resource, is REST's own core idea, not something WS-* adds.\n\nSo the answer is: transport neutrality and distributed transactions."
    },
    {
      type: "mcq",
      prompt: "The whole system completes X = 7 jobs per second. Each job visits the database 4 times and each visit needs S = 25 ms, so the database service demand is D = 0.1 s and its throughput is 28 visits per second. What is the utilisation of the database?",
      options: [
        "17.5%, found from S × X = 0.025 × 7 and so using S in place of D",
        "28%, found by treating the visit rate of 28 as if it were a percentage",
        "280%, found from D × 28 and so counting the visits twice over",
        "70%, found from the Service Demand Law as D × X = 0.1 × 7"
      ],
      correctIndex: 3,
      modelAnswer: "A cook who needs a tenth of a second of work per meal, with 7 meals a second, is busy for 7 tenths of each second.\n\n• The rule: Service Demand Law, U = D × X, pairing the demand with the system throughput.\n\n• Working: U = 0.1 × 7 = 0.7, so 70 percent.\n\n• The 17.5 percent option uses S for one visit, 0.025 × 7, and forgets there are 4 visits per job.\n\n• The 28 percent option mixes up the visit rate with the utilisation.\n\n• The 280 percent option multiplies D by the visit rate 28, counting the visits twice, since D already contains them.\n\nSo the answer is: 70%."
    },
    {
      type: "mcq",
      prompt: "A database completes the most orders per minute at 40 concurrent jobs, and completes fewer and fewer as more jobs are admitted. What does admission control do here?",
      options: [
        "Caps the concurrent jobs near 40 and queues or rejects the rest",
        "Admits every job so that no job is ever refused or kept waiting",
        "Adds many more clients so that the processor never sits idle",
        "Doubles the think time of every client so that the load falls"
      ],
      correctIndex: 0,
      modelAnswer: "A nightclub with a doorman: once the room is full, the doorman keeps people outside. The party inside stays fun, instead of everyone being crushed.\n\n• The problem: past a certain load the system thrashes, meaning it spends its effort juggling too many jobs and finishes fewer.\n\n• The fix: admission control limits how many jobs run at once, near the sweet spot of 40.\n\n• The rest: extra jobs wait in a short queue or get a busy message.\n\n• Link to this week: it is the same idea as staying below the knee of the performance curve.\n\nSo the answer is: cap concurrency near 40 and queue or reject the rest."
    },
    {
      type: "sort",
      prompt: "A system is measured with a certain number of clients and then more clients of the same type are added. Put each quantity into the box that says what happens to it.",
      groups: ["Stays the same when more clients of the same type are added", "Changes when more clients are added"],
      items: [
        { text: "Dᵢ, the service demand of a device", group: 0 },
        { text: "Vᵢ, the visits per job", group: 0 },
        { text: "Sᵢ, the service time per visit", group: 0 },
        { text: "Xᵢ, the throughput of a device", group: 1 },
        { text: "Uᵢ, the utilisation of a device", group: 1 },
        { text: "R, the average response time", group: 1 }
      ],
      modelAnswer: "A haircut takes the same time however many people are queuing. But the barber gets busier and the wait gets longer as more people arrive.\n\n• Unchanged: Vᵢ and Sᵢ describe one job at one device, so Dᵢ = Vᵢ × Sᵢ does not depend on the load.\n\n• Changes: Xᵢ = Vᵢ × X and Uᵢ = Dᵢ × X depend on X, which changes with the number of clients, and R changes as queues grow.\n\n• The mistake to avoid: re-using an old Xᵢ or Uᵢ after the number of clients has changed.\n\nSo the answer is: V, S and D stay the same, while X, U and R change."
    },
    {
      type: "multi",
      prompt: "In the prepare phase of two-phase commit the coordinator collects votes from the participants. Select all statements that are true.",
      options: [
        "A participant that voted Yes may commit on its own before the decision arrives",
        "If every participant votes Yes, the coordinator tells all of them to commit",
        "If any participant votes No or times out, the coordinator tells all of them to abort",
        "The prepare phase already makes the changes permanent",
        "A participant that voted Yes must keep its locks until it hears the decision"
      ],
      correctIndices: [1, 2, 4],
      modelAnswer: "A group deciding on a restaurant: first everyone says yes or no, and only when all agree does the group leader announce it is on.\n\n• Commit: only if every participant votes Yes does the coordinator tell all to commit.\n\n• Abort: any No, or a vote that times out, makes the coordinator tell all to abort.\n\n• Waiting: a participant that voted Yes has promised to go along, so it must hold its locks until it hears the decision.\n\n• False, commit early: a Yes voter cannot decide alone, the decision belongs to the coordinator.\n\n• False, permanent in prepare: changes become permanent only in the commit phase.\n\nSo the answer is: commit needs all Yes, any No aborts, and Yes voters keep their locks."
    },
    {
      type: "match",
      prompt: "Match each law or bound to its formula.",
      pairs: [
        { left: "Forced Flow Law", right: "Xᵢ = Vᵢ × X" },
        { left: "Service Demand Law", right: "Uᵢ = Dᵢ × X" },
        { left: "Interactive response time law", right: "R = N / X − Z" },
        { left: "Little's law", right: "N = λ × T" },
        { left: "High-load throughput bound", right: "X ≤ 1 / D max" }
      ],
      decoys: ["R = N × X − Z"],
      modelAnswer: "These laws are the shop's rulebook: how visits add up, how busy a device is, how long a cycle takes, how many are inside, and the speed limit.\n\n• Forced Flow: each job visits device i Vᵢ times, so its throughput is Vᵢ times the system throughput.\n\n• Service Demand: utilisation is the demand times the system throughput.\n\n• Interactive response time: N = X × (R + Z) rearranged gives R = N / X − Z.\n\n• Little's law: jobs in the system equals the arrival rate times the time spent.\n\n• High-load bound: the bottleneck caps the throughput at 1 over D max.\n\n• The decoy multiplies N by X, which is a common slip for the response time law.\n\nSo the answer is: match each law to its own formula and leave the decoy alone."
    },
    {
      type: "multi",
      prompt: "An order service puts messages on a queue that is read by an email service. Select all benefits of using the queue.",
      options: [
        "The order service does not wait for the email to be sent",
        "The order service gets instant proof that the email arrived",
        "Messages wait safely if the email service is down for an hour",
        "The queue guarantees each email is read before the next order is taken",
        "The two services can be deployed and scaled separately"
      ],
      correctIndices: [0, 2, 4],
      modelAnswer: "A post box: you drop the letter in and walk away. The postal service collects it whenever it is ready, and the letter waits safely in the meantime.\n\n• Decoupling in time: the order service carries on straight away, without waiting for the email.\n\n• Buffering: if the email service is down, messages sit safely in the queue until it comes back.\n\n• Independence: producer and consumer can be deployed and scaled separately.\n\n• False, instant proof: a queue does not tell the sender the email arrived, since the sender has already moved on.\n\n• False, ordering guarantee: the queue does not make one service wait for another.\n\nSo the answer is: no waiting, safe buffering, and separate scaling."
    }
  ]
};

export const WEEK_8_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
