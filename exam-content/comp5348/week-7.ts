import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 7,
  paperNumber: 1,
  title: "Week 7 Tutorial: RabbitMQ and SOAP",
  topics: "Week 7 tutorial (Message-Oriented Middleware and SOAP). Recap: in Week 6 the message queue was hand-built on a PostgreSQL table; this week an existing message queue implementation, RabbitMQ, is used instead. Setup: Docker (OS-level virtualization, software shipped as containers) runs the RabbitMQ container; docker compose up from the directory holding the zip's top-level compose.yml (not the child folders' copies); keep it running; Ctrl+C to exit. Optional management portal: rabbitmq-plugins enable rabbitmq_management from the container terminal in Docker Desktop, then localhost:15672 with admin/admin (handy for debugging, e.g. deleting a queue). Part I TradeTrackRabbitMQ: two independent applications (producer and consumer); the consumer stores TradeData to the database; a request to TradeDataProducer makes TradeDataConsumer log the received message in the Run tab; hints: spring-boot-starter-amqp in build.gradle, spring.rabbitmq host/port/username/password in application.properties (host localhost, port 5672, admin/admin). Part II StringParserRabbitMQ (pub/sub): the producer sends a pair of strings and three consumers (concat, findLong, findShort) operate on it; the initial code is buggy: 'Failed to declare queue(s)' until a POST to ProducerController (POST http://localhost:8080/api/string-service/publish with JSON string1/string2) initiates the queue, and then only ONE of the three consumers gets each pair, in round-robin; task: use FanoutExchange (RabbitMQ spring-amqp tutorial three) so all three consumers receive every pair. Part III sample SOAP: Spring Boot support for SOAP (spring.io/guides/gs/producing-web-service, gs-soap-service, open the complete folder, gradle build, send request.xml: a soapenv:Envelope with an empty Header and a Body holding gs:getCountryRequest with gs:name Spain); extension: consuming a web service. Code used only as supporting context: durable queue trade_queue, RabbitTemplate.convertAndSend, @RabbitListener, one queue per consumer bound to one FanoutExchange with an empty routing key, XSD to Java classes via xjc, DefaultWsdl11Definition generating the WSDL.",
  sourceFiles: [
    "tutorial/COMP5348_Tutorial 7.pdf",
    "tutorial/tutorial-7-main.zip (supporting context only: TradeTrackRabbitMQ, StringParserRabbitMQ, gs-soap-service)"
  ],
  questions: [
    {
      type: "mcq",
      prompt: "In the Week 6 tutorial you built a message queue on top of a PostgreSQL table. What changes in the Week 7 tutorial?",
      options: [
        "You keep the PostgreSQL table as the queue but add a second table so the messages can be sent to several consumers at once",
        "You replace the queue with direct REST calls from the producer to the consumer, so that no queue is needed between them any more",
        "You use an existing message queue product, RabbitMQ, instead of building the queue yourself out of a database table",
        "You use the same PostgreSQL queue but run it inside a Docker container so that it can be shared between the two applications"
      ],
      correctIndex: 2,
      modelAnswer: "Last week you built your own post box out of a cardboard box and some glue. This week you use the real post office that already exists.\n\n• Week 6: the queue was a table in PostgreSQL that we wrote the logic around ourselves.\n\n• Week 7: the queue is RabbitMQ, a ready-made message broker, meaning a program whose whole job is to hold and hand out messages.\n\n• What stays the same: there is still a producer that sends and a consumer that receives, and the consumer still saves the TradeData to the database.\n\nSo the answer is: Week 7 swaps our hand-made PostgreSQL queue for the existing RabbitMQ queue."
    },
    {
      type: "mcq",
      prompt: "The tutorial asks you to install Docker before anything else. What is Docker used for here?",
      options: [
        "It compiles the Spring Boot producer and consumer projects and packages them into the jar files that the two applications run from",
        "It runs the RabbitMQ message queue as a ready-packaged container, so you do not have to install and configure RabbitMQ by hand",
        "It stores the TradeData rows that the consumer saves, taking over the role that PostgreSQL played in the Week 6 version of the tutorial",
        "It acts as the network gateway between the producer and the consumer, forwarding each HTTP request from one application to the other"
      ],
      correctIndex: 1,
      modelAnswer: "Docker is like a lunchbox that already has the meal packed and heated: you open it and eat, no cooking or shopping needed.\n\n• A container is a software package that carries a program together with everything it needs, and it uses operating-system-level virtualization to keep it separate from the rest of your computer.\n\n• Here the container holds RabbitMQ, so one command starts a working queue.\n\n• Why the other options are wrong: Gradle builds the projects, the database stores the trades, and the producer and consumer talk to RabbitMQ rather than to each other.\n\nSo the answer is: Docker runs the RabbitMQ container for us."
    },
    {
      type: "mcq",
      prompt: "Your zip file has one compose.yml at the top level and more compose files inside the project sub-folders. Which one should you use to start RabbitMQ, and how?",
      options: [
        "Any one of them works the same way, so you can run docker compose up in whichever project folder you currently have open in IntelliJ",
        "The one inside TradeTrackRabbitMQ, because Part I is the first task and its compose file also starts the StringParser containers",
        "The one inside StringParserRabbitMQ, because it is the most recent and its RabbitMQ container is the only one with a web portal",
        "The one at the top level of the zip, by running docker compose up in that directory rather than in one of the child folders"
      ],
      correctIndex: 3,
      modelAnswer: "It is like a building with one main switchboard and some small spare switches inside individual rooms. The tutorial says to use the main one.\n\n• The instruction is explicit: use the compose.yml from the Week 7 Tut Resources zip, not the one in its child folders.\n\n• The command is docker compose up, run in the directory that holds that file.\n\n• Keep the container running while you run the applications, and press Ctrl+C when you finish.\n\nSo the answer is: run docker compose up next to the top-level compose.yml."
    },
    {
      type: "mcq",
      prompt: "You want to open RabbitMQ's web management portal to debug the queue. What does the tutorial say you must do first?",
      options: [
        "Open the container's terminal in Docker Desktop and run rabbitmq-plugins enable rabbitmq_management, then visit localhost:15672",
        "Install the RabbitMQ management app from the vendor's website on your own machine and point it at localhost:5672 in the settings",
        "Add a spring.rabbitmq.management property to application.properties in both projects and restart the producer and consumer applications",
        "Stop the container, delete the compose.yml file and start RabbitMQ again with the docker run command and the portal flag switched on"
      ],
      correctIndex: 0,
      modelAnswer: "The portal is like the staff-only window on a post office: it exists, but you have to switch it on before you can look through it.\n\n• It is optional, and it is handy for debugging, for example deleting a queue.\n\n• To turn it on: in Docker Desktop, open the running RabbitMQ container, choose Open in terminal, and run rabbitmq-plugins enable rabbitmq_management.\n\n• Then browse to localhost:15672 and log in with the username admin and the password admin.\n\nSo the answer is: enable the management plugin inside the container, then open localhost:15672."
    },
    {
      type: "mcq",
      prompt: "The applications connect to RabbitMQ with spring.rabbitmq.port=5672, while you view the web portal at localhost:15672. What is the difference between the two ports?",
      options: [
        "5672 is used only by the producer to send and 15672 is used only by the consumer to receive, so that the two roles do not clash",
        "5672 is the encrypted port for production use and 15672 is the plain one that you use while you are still developing and debugging",
        "5672 is the port your applications use to send and receive messages, and 15672 is the port for the human-facing management web page",
        "5672 is the port for the queue's data and 15672 is the port Docker uses internally to check whether the container is still alive"
      ],
      correctIndex: 2,
      modelAnswer: "A shop has a delivery door at the back for the couriers and a front door for visitors. Same building, two doors for two kinds of user.\n\n• Port 5672: the door for programs. The Spring apps use it to send and receive messages.\n\n• Port 15672: the door for people. It shows the management web page in your browser.\n\n• Both are published by the compose file, which is why you can reach them from your laptop.\n\nSo the answer is: 5672 carries the messages, 15672 shows the management portal."
    },
    {
      type: "mcq",
      prompt: "Part I asks you to rebuild the Week 6 TradeTrack application on RabbitMQ. Which design matches the task?",
      options: [
        "One single application that both generates the prices and saves them, using RabbitMQ only as an internal in-memory list inside that program",
        "Two independent applications: a producer that sends the trade data to the queue and a consumer that receives it and stores it in the database",
        "Two independent applications: a producer that saves the trade data to the database itself and sends only a notification to the consumer",
        "Three applications: a producer, a consumer and a separate database service that the consumer has to call through a SOAP request each time"
      ],
      correctIndex: 1,
      modelAnswer: "Think of a restaurant where the waiter drops order slips on a spike and the cook picks them up later. The waiter never cooks and the cook never takes orders.\n\n• The task text says there should be two independent applications, one for the producer and one for the consumer.\n\n• The producer only sends TradeData messages to the queue.\n\n• The consumer takes them off the queue and stores the TradeData in the database.\n\nSo the answer is: a producer app that sends and a consumer app that receives and saves."
    },
    {
      type: "mcq",
      prompt: "The Part I hints say two files besides the Java sources were changed to make Spring talk to RabbitMQ. Which pair is right?",
      options: [
        "compose.yml gets a new volume entry and settings.gradle lists both projects as sub-modules so that they share one RabbitMQ session",
        "pom.xml gets the SOAP starter and the web.xml file is edited so that the producer publishes its messages through the servlet container",
        "The Dockerfile gets a RabbitMQ install step and the log settings are raised so that every queued message is printed by the consumer",
        "build.gradle gets the spring-boot-starter-amqp dependency, and application.properties gets the RabbitMQ host, port, username and password"
      ],
      correctIndex: 3,
      modelAnswer: "To phone a friend you need two things: a phone app installed, and the friend's number. The build file is the app and the properties file is the number.\n\n• build.gradle: add implementation 'org.springframework.boot:spring-boot-starter-amqp'. AMQP is the messaging protocol RabbitMQ speaks, and this starter is the Spring library that speaks it.\n\n• application.properties: spring.rabbitmq.host=localhost, port=5672, and the username and password, both admin.\n\n• Why the others are wrong: the compose file, the SOAP starter and Dockerfile edits are not part of the hint.\n\nSo the answer is: the amqp starter in build.gradle plus the connection settings in application.properties."
    },
    {
      type: "mcq",
      prompt: "When you first start a StringParser consumer you may see the error \"Failed to declare queue(s):[*_QUEUE]\". What is the cause and the fix?",
      options: [
        "The password admin is wrong for that consumer, so you must edit the consumer's application properties file and restart the Docker container",
        "Docker has not been restarted since installation, so you must close IntelliJ and restart the terminal before the queue can be declared",
        "The queue has not been initiated yet, so you make one POST request to the producer's publish endpoint to get the queue created",
        "The consumer's server.port is already in use by the producer, so you must change one of the two port numbers in the properties file"
      ],
      correctIndex: 2,
      modelAnswer: "It is like turning up to collect a parcel from a locker that has not been installed yet. The locker only appears after the first parcel is sent.\n\n• Why it happens: the queue the consumer wants does not exist on the broker yet.\n\n• The fix: use the function in ProducerController to make a POST request. That first publish initiates the queue.\n\n• Why the other options are wrong: a bad password gives a different error, and the port numbers are not what this error message is about.\n\nSo the answer is: initiate the queue by making a POST request to the producer."
    },
    {
      type: "mcq",
      prompt: "In the unmodified StringParser code you publish one pair of strings and only one of the three consumers receives it, and the consumers take turns. Why?",
      options: [
        "All three consumers are listening on the same single queue, so RabbitMQ hands each message to just one of them in round-robin order",
        "The consumers were started one after another, so the first one to start has locked the message and the other two are refused access",
        "RabbitMQ deliberately drops two of every three messages when it has three consumers, so as to protect the broker from being overloaded",
        "The producer sends each pair to the three consumers one at a time, and the round-robin logic is written in the producer's controller"
      ],
      correctIndex: 0,
      modelAnswer: "Imagine three cashiers serving one single line of customers. Each customer goes to one cashier, and the cashiers take turns. Nobody is served three times.\n\n• Why it happens: the three consumers share one queue, so they compete for its messages.\n\n• A queue hands each message to exactly one consumer, and RabbitMQ rotates through them, which is round robin.\n\n• That is fine for sharing out work, but it is not pub/sub, where every subscriber should get every message.\n\nSo the answer is: one shared queue means each message goes to only one consumer, in turn."
    },
    {
      type: "mcq",
      prompt: "Part II asks you to make all three consumers receive every pair of strings. Which change does the hint point to?",
      options: [
        "Start three copies of the producer so that each consumer application has its own producer sending to it directly",
        "Raise the RabbitMQ prefetch count to three so that each consumer is allowed to hold one copy of every message",
        "Send the pair three times from the producer, once with each consumer's name written into a routing key on the message",
        "Use a FanoutExchange, so that each consumer's own queue is bound to the exchange and gets a copy of every published message"
      ],
      correctIndex: 3,
      modelAnswer: "A newsletter goes to every subscriber, not just one. You do not deliver it by hand to each house: the mail room copies it into every subscriber's own mailbox.\n\n• The fanout exchange is the mail room. It copies each message into every queue bound to it.\n\n• Each consumer needs its own queue bound to the exchange, so each gets its own copy.\n\n• The producer publishes once, to the exchange, and does not need to know who the consumers are.\n\nSo the answer is: use a FanoutExchange with one queue per consumer."
    },
    {
      type: "mcq",
      prompt: "What does a fanout exchange do with the routing key on a message?",
      options: [
        "It matches the key exactly against each binding key and delivers only to the queues whose binding key is the same",
        "It treats the key as a wildcard pattern such as string.* and delivers only to queues whose pattern fits the key",
        "It ignores the key completely and sends a copy of the message to every queue that is bound to the exchange",
        "It uses the key as a priority and delivers the message first to the queue that was bound to the exchange earliest"
      ],
      correctIndex: 2,
      modelAnswer: "A fire alarm does not check who you are. It rings in every room, and the person pressing it does not choose which rooms.\n\n• A fanout exchange broadcasts to all bound queues.\n\n• The routing key is ignored, which is why the tutorial producer sends with an empty key.\n\n• Exact matching is the job of a direct exchange, and wildcard patterns belong to a topic exchange, which is not what Part II uses.\n\nSo the answer is: fanout ignores the routing key and copies the message to every bound queue."
    },
    {
      type: "mcq",
      prompt: "The producer publishes 6 pairs of strings. How many messages do the three consumers process in total in the buggy version, and in the fixed fanout version?",
      options: [
        "6 in the buggy version and 6 in the fixed version, because a fanout exchange still gives each message to only one consumer",
        "6 in the buggy version and 18 in the fixed version, because every one of the three consumers receives its own copy of each message",
        "18 in the buggy version and 18 in the fixed version, because each of the three consumers reads every message in either design",
        "2 in the buggy version and 6 in the fixed version, because the buggy version only ever delivers to a single consumer application"
      ],
      correctIndex: 1,
      modelAnswer: "Six flyers handed to a queue of three people, one flyer each in turn, uses six flyers in total. If everyone must get all six, you need eighteen copies.\n\n• Buggy version: one shared queue, round robin, so each of the 6 messages is handled by exactly one consumer. Total 6, about 2 each.\n\n• Fixed version: a copy goes to each of the 3 queues, so each consumer gets all 6. Total 3 × 6 = 18.\n\n• This is the difference between sharing work out and broadcasting.\n\nSo the answer is: 6 in the buggy version and 18 with the fanout exchange."
    },
    {
      type: "mcq",
      prompt: "In the Part III request.xml, where does the country name Spain go, and what does the Header contain?",
      options: [
        "Spain is inside the Body as the name of a getCountryRequest, and the Header is empty because it is optional",
        "Spain is inside the Header as a country attribute, and the Body is empty because the request needs no data",
        "Spain is in the URL of the POST request only, and the Envelope has neither a Header nor a Body element at all",
        "Spain is inside the Body and the Header must carry the username and password or the service rejects the call"
      ],
      correctIndex: 0,
      modelAnswer: "A SOAP message is like a parcel in an envelope. The Body is the letter you actually want delivered. The Header is a sticky note for extra instructions, and you can leave it off.\n\n• Envelope: the outer wrapper, in the soapenv namespace.\n\n• Header: optional. Here it is written as an empty element, because this request needs no extras.\n\n• Body: holds the real request, a gs:getCountryRequest containing gs:name with the value Spain.\n\nSo the answer is: Spain lives in the Body, and the Header is left empty."
    },
    {
      type: "mcq",
      prompt: "The SOAP sample project needs a gradle build before it will run. What does the build produce that the service's code depends on?",
      options: [
        "The RabbitMQ container image that the SOAP service uses to queue up incoming requests before it answers them",
        "The PostgreSQL schema that stores the list of countries, which the service reads whenever a getCountryRequest arrives",
        "Java classes such as GetCountryRequest and GetCountryResponse, generated from the XML schema that describes the messages",
        "An encrypted keystore that the service needs so that the SOAP envelope can be signed before it is sent back to the caller"
      ],
      correctIndex: 2,
      modelAnswer: "It is like building a set of moulds from a blueprint. The blueprint is the XML schema and the moulds are the Java classes that fit it exactly.\n\n• The project has an XSD, which is an XML schema that defines the request and response message shapes.\n\n• The Gradle build runs an XJC plugin that generates Java classes from that schema.\n\n• The endpoint's code then uses those generated classes, so without the build it would not compile.\n\n• Nothing in this project uses RabbitMQ or a database, since the countries are kept in memory.\n\nSo the answer is: the build generates Java classes from the XML schema."
    },
    {
      type: "mcq",
      prompt: "The tutorial's optional extension is the Spring guide \"consuming a web service\". Compared with Part III, what changes?",
      options: [
        "You move from SOAP to a REST service, because consuming a web service is only possible with JSON and HTTP verbs",
        "Your application becomes the client that calls a SOAP web service, instead of the provider of the service",
        "Your application must publish the WSDL into a UDDI registry so that other applications can find the service later",
        "The service now sits behind a RabbitMQ queue so that your application sends its SOAP request asynchronously"
      ],
      correctIndex: 1,
      modelAnswer: "In Part III you are the shop serving customers. In the extension you are the customer walking into someone else's shop.\n\n• Producing a web service: you offer an operation such as getCountry and wait for callers.\n\n• Consuming a web service: your code builds the SOAP request and calls a service that somebody else offers.\n\n• Both are still SOAP over a request and reply exchange. Nothing about it becomes REST or queue-based.\n\nSo the answer is: in the extension your application is the SOAP client."
    },
    {
      type: "mcq",
      prompt: "In the sample SOAP project the WebServiceConfig class creates a DefaultWsdl11Definition from the schema. In terms of the lecture, what does that give the service?",
      options: [
        "A UDDI registry entry, so that any application in the world can look the service up by its business name",
        "A message queue in front of the service, so that requests are buffered when the service is temporarily busy",
        "A REST URI for every country, so that clients can use GET and DELETE on each country instead of SOAP",
        "A WSDL contract that describes the operations, messages and data types so that clients can learn how to call it"
      ],
      correctIndex: 3,
      modelAnswer: "Think of a restaurant menu. It does not cook the food, but it tells customers what they can order and in what form.\n\n• WSDL, the Web Services Description Language, is the XML contract that lists a service's operations, messages and types.\n\n• The configuration turns the XSD schema into that WSDL automatically, so the contract always matches the code.\n\n• A UDDI registry is a different thing: it is the directory where WSDLs can be listed and found.\n\nSo the answer is: it publishes a WSDL contract describing how to call the service."
    },
    {
      type: "truefalse",
      prompt: "True or False: In a SOAP message the Header is mandatory and carries the request data, while the Body is optional and holds only extra information such as authentication.",
      options: [
        "True",
        "False"
      ],
      correctIndex: 1,
      modelAnswer: "It is the other way round: the letter is required and the sticky note is optional.\n\n• Envelope: mandatory, marks the start and the end of the message.\n\n• Body: mandatory, holds the actual request or document.\n\n• Header: optional, holds general information such as authentication or transaction details. The tutorial's request.xml has an empty Header.\n\nSo the answer is: False."
    },
    {
      type: "multi",
      prompt: "Select every change the tutorial's hints say were made for the Part I TradeTrack application to talk to RabbitMQ.",
      options: [
        "application.properties sets spring.rabbitmq.host=localhost and spring.rabbitmq.port=5672 so the applications can find the broker",
        "The spring-boot-starter-amqp dependency was added to build.gradle so that the applications can send and receive AMQP messages",
        "application.properties sets spring.rabbitmq.username=admin and spring.rabbitmq.password=admin so the applications can log in",
        "The Week 6 queue table create_table.sql is kept and extended so that RabbitMQ can store its messages in PostgreSQL instead",
        "The producer is changed to call the consumer's REST endpoint directly, so that the message queue is only used to log the result"
      ],
      correctIndices: [
        0,
        1,
        2
      ],
      modelAnswer: "To join a group chat you install the app, find the server and sign in. All three are settings, not new business logic.\n\n• Install: the spring-boot-starter-amqp dependency, in build.gradle.\n\n• Find: host localhost and port 5672.\n\n• Sign in: username and password, both admin.\n\n• Why the other options are wrong: RabbitMQ keeps its own messages, so the PostgreSQL queue table from Week 6 is not needed, and the whole point is that the producer does not call the consumer directly.\n\nSo the answer is: the amqp dependency plus host, port, username and password."
    },
    {
      type: "multi",
      prompt: "Select every task that the Part I consumer application performs.",
      options: [
        "It stores the TradeData in the database, which is the job the Part I task hands to the consumer application",
        "It generates the random gold, silver and platinum prices, since the consumer is the side that knows the market",
        "It listens on the RabbitMQ queue and receives each message that the producer has put there, without the producer waiting",
        "It deserializes the received message back into a TradeData object so that the trade fields can be used in Java code",
        "It sends an acknowledgement message back to the producer over a second queue before it saves anything to the database"
      ],
      correctIndices: [
        0,
        2,
        3
      ],
      modelAnswer: "The consumer is the kitchen: it picks up slips, reads them, and cooks. It does not invent orders and it does not phone the waiter.\n\n• It listens on the queue and gets each message.\n\n• It turns the message text back into a TradeData object.\n\n• It stores the TradeData in the database.\n\n• Why the other options are wrong: generating prices is the producer's job, and there is no reply queue in this design.\n\nSo the answer is: listen, deserialize, and store."
    },
    {
      type: "multi",
      prompt: "Select every statement that explains the problem in the unmodified StringParser project, where only one consumer gets each pair.",
      options: [
        "The consumers are on different port numbers, and RabbitMQ can only deliver to consumers that share the same server.port",
        "RabbitMQ gives the messages out to the competing consumers on that queue in round-robin order, one message to each in turn",
        "The three consumers are all reading from one shared queue, so the messages are shared among them and not copied to each",
        "The application is meant to follow pub/sub, where every subscriber should receive its own copy of every published message",
        "The queue was never declared, so RabbitMQ has nowhere to put the message and silently forwards it to the first consumer only"
      ],
      correctIndices: [
        1,
        2,
        3
      ],
      modelAnswer: "Three friends reading from one shared pizza box will each get slices, not the whole pizza. If everyone should get a whole pizza, you need three boxes.\n\n• One shared queue: the messages are split among the consumers.\n\n• Round robin: RabbitMQ takes turns handing them out.\n\n• The design goal was pub/sub, so it fails the goal that every subscriber gets every message.\n\n• Why the other options are wrong: server.port is just the application's own web port, and the missing-queue problem shows up as the Failed to declare queue error, not as odd delivery.\n\nSo the answer is: a shared queue with round-robin delivery does not give the pub/sub behaviour that was wanted."
    },
    {
      type: "multi",
      prompt: "Select every element of a correct FanoutExchange solution to Part II.",
      options: [
        "All three consumers keep listening on one shared queue, and RabbitMQ is told to give every message to all of them at once",
        "Each consumer's queue is bound to the fanout exchange, so the exchange copies every message into all three bound queues",
        "Each of the three consumers has its own queue, so that no two consumers are competing for the same messages",
        "The producer must send a different routing key for each consumer so that the exchange can tell which queue to fill",
        "A FanoutExchange is declared, and the producer publishes each pair of strings to that exchange instead of to one particular queue"
      ],
      correctIndices: [
        1,
        2,
        4
      ],
      modelAnswer: "A newsletter service needs a mail room, one mailbox per subscriber, and a rule that copies each issue into every mailbox.\n\n• The exchange is the mail room: the producer publishes once to it.\n\n• A queue per consumer is each subscriber's mailbox.\n\n• A binding links each queue to the exchange, so a copy goes into each.\n\n• Why the other options are wrong: fanout ignores routing keys, and a single shared queue is the round-robin situation we are trying to escape.\n\nSo the answer is: one fanout exchange, one queue per consumer, and a binding from each queue to the exchange."
    },
    {
      type: "multi",
      prompt: "Select every true statement about the request.xml used in Part III.",
      options: [
        "Its Header carries the country name Spain, and its Body carries only the authentication details of the caller",
        "It has a soapenv:Header element that is present but empty, since a header is optional and this call needs nothing extra",
        "Its Body contains a gs:getCountryRequest element with a gs:name child whose value is Spain",
        "It is a JSON document that is posted to the RabbitMQ management port 15672 in order to look up the country",
        "It is wrapped in a soapenv:Envelope, the outer element that marks the start and the end of the SOAP message"
      ],
      correctIndices: [
        1,
        2,
        4
      ],
      modelAnswer: "A SOAP request is a labelled envelope: the envelope itself, an optional note slot, and the letter inside.\n\n• Envelope: the wrapper for the whole message.\n\n• Header: optional, and left empty here.\n\n• Body: the real content, a getCountryRequest asking for the country named Spain.\n\n• Why the other options are wrong: it is XML not JSON, it goes to the SOAP service and not to RabbitMQ, and the data does not live in the Header.\n\nSo the answer is: an Envelope with an empty Header and a Body that asks for Spain."
    }
  ]
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 7,
  paperNumber: 2,
  title: "Week 7 Lecture: Service-Oriented Architecture, SOAP and RESTful Services",
  topics: "Lecture 7 (Dr. Sichao Li): Week 6 recap quiz (MOM request/reply is three separately committed transactions so a later failure does not undo earlier ones, saga-like; JMS is an API not a protocol so interoperability needs the same product underneath; publish OrderPlaced to a topic so analytics can subscribe later; a message broker maps legacy message formats without touching senders/receivers). Service definition (repeatable business activity, self-contained, possibly composed, black box; vending machine analogy). SOA: apps provide/consume services and share only standards, contracts, schemas; tenets (explicit boundaries, autonomy, share schema and contract not classes, policy-based compatibility); principles (coarse-grained but focused, reliability, fewer dependencies, do not rewrite legacy - wrap it, keep it simple). Web services: XML messages and XML service definitions, W3C standardises only what goes on the wire; WS-* history; sender/receiver/intermediary/ultimate receiver; five WS standards; Distributed Computing 101 (find, find out how to call, invoke, add transactions/security/reliability). SOAP (envelope mandatory, header optional for authentication/transaction/routing, body mandatory; doc/literal vs deprecated RPC/encoded; performance and WAN findings; SOAP outdated but still maintained in enterprise legacy). WS-Addressing (extended URIs, transport-neutral, endpoint reference with address, reference properties, policy). UDDI (white/yellow/green pages, never took off) vs WSDL (types, message, portType, binding; tool generated; does not specify message order); publish-find-bind triangle. REST (Fielding 2000; architectural style not a protocol or product; four principles: URI identification, uniform interface, self-descriptive messages via metadata, hyperlinks for application state; stateless; nouns not verbs; representations pass-by-value; URI structure, descriptive vs opaque, URI templates; verbs GET/HEAD/PUT/POST/DELETE/OPTIONS and their semantics, CRUD mapping; status codes 1xx-5xx and headers; links as state transitions). Starbucks case study (POST order 201 Created + Location + payment link, OPTIONS Allow, PUT amend 200, 409 Conflict if too slow, GET status, POST payment, 401 Unauthorized with Digest, private /orders feed). Evaluation: REST strengths and weaknesses vs WS-* (transactions, reliability, security, intermediaries, transport flexibility). Conclusion: pick whatever architecture gets the job done; REST more common for mobile/web, SOAP for legacy and strict contracts.",
  sourceFiles: [
    "lecture/COMP5348_W7.pdf",
    "lecture/Week 07 - Enterprise-s1-low.transcript.md"
  ],
  questions: [
    {
      type: "mcq",
      prompt: "Week 6 recap quiz. A client sends a request over a message queue and updates its own database. The server processes the request and puts a reply on the queue. The client's final step, handling the reply, then fails. What happens?",
      options: [
        "Every earlier step is rolled back automatically, because the request, the processing and the reply are all one big atomic transaction",
        "The server's work and the reply are undone by the queue, but the client's first database update stays because the client committed it",
        "Only the failed final step rolls back. The earlier steps were already committed as separate transactions, much like a saga, so they stay done",
        "The queue pauses the whole exchange and retries all of it from the very first step until the final step finally succeeds without an error"
      ],
      correctIndex: 2,
      modelAnswer: "Think of posting three separate letters on three different days. If the third letter gets lost, the first two are still delivered. You cannot un-post them.\n\n• Why it happens: sender and receiver over message-oriented middleware do not share a transaction.\n\n• A request and reply is really three separately committed transactions: the client's send, the server's work and reply, then the client's handling of the reply.\n\n• Because the earlier ones were already committed, a later failure does not undo them, so only the failed step rolls back. The lecturer said this is quite similar to the saga from earlier weeks.\n\n• Why the other options are wrong: nothing links the three steps into one atomic unit.\n\nSo the answer is: only the failed step rolls back, and the earlier committed steps stay."
    },
    {
      type: "mcq",
      prompt: "Week 6 recap quiz. Two applications both use the Java Message Service (JMS), but each runs on a different message-queue product. Why might they still fail to exchange messages?",
      options: [
        "JMS is an API that defines how senders and receivers are coded, not a wire protocol, so compatibility is only guaranteed on the same product underneath",
        "JMS only supports point-to-point queues, so an application that uses topics on one side cannot exchange anything with an application on the other",
        "JMS sets a fixed maximum message size that differs between products, so any message larger than the smaller limit is silently dropped along the way",
        "JMS is a wire protocol, but each product implements a different version of it, so the two sides cannot agree on the handshake when they connect"
      ],
      correctIndex: 0,
      modelAnswer: "Two phones can both have the same style of charging socket, but that does not mean their chargers speak the same electrical language behind it. A plug shape is not a wire standard.\n\n• The trick the lecturer set on purpose: JMS is an API, meaning it defines how your code sends and receives.\n\n• It is not a protocol, so it does not define what the message looks like on the wire.\n\n• So interoperability is only guaranteed if both applications use the same messaging product underneath, not just the same API.\n\nSo the answer is: JMS is an API and not a protocol, so it does not guarantee that different products can talk."
    },
    {
      type: "mcq",
      prompt: "Week 6 recap quiz. An order service publishes OrderPlaced events that billing and shipping already consume. Next month analytics must receive the same events too. Which approach fits best?",
      options: [
        "Change the order service so that it also sends a copy of each event to a new dedicated analytics queue, using that queue's name",
        "Make analytics poll the billing service's database on a timer to spot new orders, so the order service is not touched at all",
        "Have billing forward every OrderPlaced event to analytics after it has finished processing that event for its own purposes",
        "Publish the events to a topic that billing, shipping and analytics each subscribe to, so the sender never needs to know who receives them"
      ],
      correctIndex: 3,
      modelAnswer: "A radio station broadcasts once, and anyone who tunes in hears it. The station does not need to know how many listeners there are, or add a new phone line for each one.\n\n• With plain queues the sender still has to know which destination to use, so adding analytics means changing the sender.\n\n• With a topic, the order service publishes OrderPlaced once. Billing and shipping are already subscribed, and analytics just subscribes too.\n\n• This is the publish and subscribe pattern. Both queues and topics are acceptable designs, but they fit different needs, and here the set of receivers keeps growing.\n\nSo the answer is: publish to a topic and let analytics subscribe."
    },
    {
      type: "mcq",
      prompt: "Week 6 recap quiz. Several legacy systems each use a different message format. The team wants to change how formats are mapped without touching any sender or receiver. Which pattern fits?",
      options: [
        "Point-to-point queues where every sender writes directly in the exact format that its particular receiver expects to get",
        "A message broker in the middle that maps and transforms formats between the senders and the receivers on their behalf",
        "A shared database table that every legacy system reads and writes, holding one common format that they all agree on",
        "Synchronous RPC calls between the systems, with each system converting the incoming data using its own conversion code"
      ],
      correctIndex: 1,
      modelAnswer: "A translator at a meeting lets a French speaker and a Japanese speaker talk without either learning the other's language. If the translation rules change, only the translator is updated.\n\n• The systems all keep their own formats.\n\n• The message broker sits in the middle and transforms each message into the format the downstream receiver needs.\n\n• Because mapping lives in the broker, you can change it without identifying or changing the senders and receivers.\n\nSo the answer is: use a message broker to map and transform the formats."
    },
    {
      type: "mcq",
      prompt: "The lecture opens the service topic with a vending machine. From the consumer's point of view, how should a service behave?",
      options: [
        "Like an open book: the consumer studies the internals first so that it can pick the right way to call the service",
        "Like a black box: the consumer uses the interface, gives the input and gets the output, without knowing how it works inside",
        "Like a shared library: the consumer links the service's classes into its own program and calls them in the same process",
        "Like a mirror: the consumer must use the same programming language and platform that the service uses in order to call it"
      ],
      correctIndex: 1,
      modelAnswer: "You put a coin in a vending machine and a snack drops out. You do not care whether the machine is old or new inside, or how it counts money.\n\n• A service is a self-contained unit of functionality that does a meaningful, repeatable business activity.\n\n• To the consumer it is a black box, with the implementation hidden.\n\n• The vending machine also has a contract: it takes Australian dollars, not US dollars. The consumer has to follow the contract.\n\n• Example from the lecture: a payment service that answers success or failure, and the shopping app does not need to know whether it is written in Java or .NET.\n\nSo the answer is: a black box that is used through its interface."
    },
    {
      type: "mcq",
      prompt: "The lecture's Distributed Computing 101 lists what every distributed platform must answer. Which mapping to the web service technologies is correct?",
      options: [
        "Find something: SOAP. Find out how to call it: UDDI. Ask it to do something: WSDL. Add useful services: nothing is defined",
        "Find something: WSDL. Find out how to call it: SOAP. Ask it to do something: UDDI. Add useful services: WS-Addressing",
        "Find something: UDDI. Find out how to call it: WSDL. Ask it to do something: SOAP. Add useful services: further WS-* standards",
        "Find something: WS-Addressing. Find out how to call it: UDDI. Ask it to do something: WSDL. Add useful services: SOAP headers only"
      ],
      correctIndex: 2,
      modelAnswer: "To use a restaurant you first find it in a directory, then read the menu, then place your order. Then you may want extras like a receipt or a booking guarantee.\n\n• Find something: UDDI, the directory of services.\n\n• Find out how to call it: WSDL, the description of what it needs. WS-Addressing tells you where it lives.\n\n• Ask it to do something: SOAP, the calling mechanism.\n\n• Useful extras such as transactions, security and reliability: the further WS-* standards.\n\nSo the answer is: UDDI to find, WSDL to describe, SOAP to call, and WS-* for the extras."
    },
    {
      type: "mcq",
      prompt: "Which parts of a SOAP message are mandatory?",
      options: [
        "The Envelope and the Body are mandatory, and the Header is optional",
        "The Envelope and the Header are mandatory, and the Body is optional",
        "The Header and the Body are mandatory, and the Envelope is optional",
        "All three are optional, because SOAP messages are just plain XML documents"
      ],
      correctIndex: 0,
      modelAnswer: "A posted parcel needs the box and the item inside. A note with special instructions is optional.\n\n• Envelope: mandatory. It marks the start and the end of the message.\n\n• Body: mandatory. It carries the actual message data or document.\n\n• Header: optional. It holds general information such as authentication, transaction management, context and routing, which is where the extensibility lives.\n\nSo the answer is: Envelope and Body are mandatory, and the Header is optional."
    },
    {
      type: "mcq",
      prompt: "The lecturer asked the class for the difference between UDDI and WSDL. Which answer is right?",
      options: [
        "UDDI is the XML contract for one service and WSDL is the registry that lists every service in the world",
        "UDDI is the message format for calling a service and WSDL is the protocol that carries that message over HTTP",
        "UDDI describes the data types of a service and WSDL is the security policy that says who may use that service",
        "UDDI is a registry that indexes services so they can be discovered, and WSDL is the XML contract describing one service in detail"
      ],
      correctIndex: 3,
      modelAnswer: "UDDI is like the phone book. WSDL is like the detailed brochure for one business that you find in it.\n\n• UDDI stands for Universal Description, Discovery and Integration. It is a directory that holds and indexes service descriptions, so applications can discover them.\n\n• WSDL stands for Web Services Description Language. It is an XML contract describing the operations, messages, data types and how to bind to the service.\n\n• The lecturer's summary: UDDI is the indexing side, and WSDL is the language that describes a service in more detail.\n\nSo the answer is: UDDI is the registry, and WSDL is the description of a service."
    },
    {
      type: "mcq",
      prompt: "Which sequence describes how WSDL and a registry work together in the publish, find and bind picture?",
      options: [
        "The requester writes the WSDL, gives it to the provider, and the provider registers the requester in the service registry",
        "The registry writes the WSDL, hands it to the requester, and the requester then publishes the service on the provider's behalf",
        "The provider finds the requester in the registry, sends it the WSDL, and the requester binds to the registry to make its call",
        "The provider publishes its WSDL to the registry, the requester finds it there, then the requester binds to the provider and calls it"
      ],
      correctIndex: 3,
      modelAnswer: "A shop puts its listing in the directory. A customer finds the listing, then walks to the shop and buys something.\n\n• Provider: publishes the WSDL description of its service to the service registry.\n\n• Requester: searches the registry and finds that description.\n\n• Requester: binds to the provider using the description, then calls it directly.\n\n• The registry only helps with discovery, and the call goes to the provider, not through the registry.\n\nSo the answer is: publish, find, then bind and call."
    },
    {
      type: "mcq",
      prompt: "The lecturer gave a limitation of WSDL using an online purchase. What is that limitation?",
      options: [
        "WSDL cannot describe request-response operations, so a service can only be described if it uses one-way messages",
        "WSDL is an interface definition language that does not say in which order operations must be called, such as pay before confirm",
        "WSDL cannot list more than one operation for each service, so a shop needs a separate WSDL for the pay and confirm operations",
        "WSDL only works with the HTTP transport, so a purchase over TCP or SMTP cannot be described with it at all"
      ],
      correctIndex: 1,
      modelAnswer: "A list of shop counters tells you which counters exist, but not the order in which to visit them. Should you pay first, or confirm first?\n\n• WSDL is focused on request-response interactions, an IDL (interface definition language) for web services.\n\n• It does not specify in which order to send messages.\n\n• BPEL can theoretically add conversations, but tool support is limited and it is verbose and complex.\n\n• The lecturer said this is a limitation that the REST architecture, with links that say what to do next, aims to solve.\n\nSo the answer is: WSDL gives no ordering of operations."
    },
    {
      type: "mcq",
      prompt: "What kind of thing is REST, according to the lecture?",
      options: [
        "A protocol, defined by the W3C, that replaces SOAP and is implemented by downloading a REST library",
        "A commercial product from a vendor, which you install on the web server to turn an application into a RESTful one",
        "An architectural style with constraints that you choose to follow, so there is no REST library to download",
        "A markup language for describing web resources, comparable to WSDL, that is generated from the code by tools"
      ],
      correctIndex: 2,
      modelAnswer: "REST is like a set of house rules, such as 'shoes off, quiet after ten'. There is no product to buy that gives you the rules.\n\n• REST stands for Representational State Transfer, and Roy Fielding described it in his 2000 thesis.\n\n• It is an architecture style, not a protocol or a product.\n\n• There is no library to download. There are constraints that you choose to follow, and the lecturer said this distinction is important.\n\nSo the answer is: REST is an architectural style."
    },
    {
      type: "mcq",
      prompt: "Which list gives the four REST principles from the slides?",
      options: [
        "Identify resources by URI, use a uniform interface, use self-descriptive messages with metadata, and use hyperlinks to define application state",
        "Identify resources by WSDL, use one operation per service, use encrypted messages with signatures, and use a registry to define state",
        "Identify resources by class name, use remote method calls, use self-descriptive stubs with schemas, and use sessions for application state",
        "Identify resources by port number, use a message queue, use transactional messages with metadata, and use callbacks to define state"
      ],
      correctIndex: 0,
      modelAnswer: "REST is like a library: every book has a call number, every borrower uses the same desk procedure, every slip explains itself, and each book points to related books.\n\n• 1. Resource identification through URI.\n\n• 2. Uniform interface for all resources: GET, PUT, POST, DELETE.\n\n• 3. Self-descriptive messages through metadata.\n\n• 4. Hyperlinks to define the application state.\n\n• The lecture also stresses that each request carries everything needed and the server keeps nothing between requests, so REST is stateless.\n\nSo the answer is: URIs, a uniform interface, self-descriptive messages, and hyperlinks."
    },
    {
      type: "mcq",
      prompt: "In the Starbucks case study you want to add an extra shot to your existing order. Which verb do you use, and why?",
      options: [
        "PUT to the existing order URI, because PUT is idempotent and repeating it just leaves the order in the same state",
        "POST to the existing order URI, because POST is idempotent and repeating it just leaves the order in the same state",
        "GET on the existing order URI, because GET can carry the new content in the request and update the order in place",
        "DELETE the order and POST a new one, because an existing resource can never be modified by an HTTP verb at all"
      ],
      correctIndex: 0,
      modelAnswer: "Writing 'two shots' over the old note on the order slip is safe even if you do it twice. Adding a new slip each time would give you two orders.\n\n• PUT modifies an existing resource in place, by overwriting it.\n\n• PUT is idempotent, meaning repeating it gives the same final state.\n\n• The slide says 'Don't use POST here, because PUT is idempotent.'\n\n• The lecturer asked the class to tell whether to use PUT or POST here. The transcript is garbled on this, but the slides are clear.\n\nSo the answer is: use PUT on the existing order."
    },
    {
      type: "mcq",
      prompt: "A client sends DELETE /user/jwebber. What happens to the resource, according to the lecture?",
      options: [
        "It is physically erased from disk straight away, along with every backup copy, so nothing about it can be recovered",
        "It stops being accessible, which is a logical delete and not necessarily a physical one, and this decouples implementation details",
        "It is moved to a different URI, so that the same resource can still be reached through a new name in the future",
        "It is marked as read-only, so that GET still works on it but PUT, POST and DELETE are refused from then on"
      ],
      correctIndex: 1,
      modelAnswer: "Taking a book off the shelf so that nobody can borrow it does not mean the library has burned the book. The book might still be in the storeroom.\n\n• DELETE makes the resource stop being accessible.\n\n• The lecturer stressed that this is a logical delete, not a permanent physical delete in reality.\n\n• That matters for decoupling implementation details from resources. The client only knows the URI is no longer valid.\n\nSo the answer is: DELETE is a logical delete, and the resource stops being accessible."
    },
    {
      type: "mcq",
      prompt: "In the Starbucks case study the order response contains a link with rel payment. What is the purpose of that link, and what problem from the WSDL slides does it address?",
      options: [
        "It is the URI of the drink and it addresses WSDL's inability to describe the data types of the messages",
        "It is a security token and it addresses the fact that WSDL cannot carry authentication in the message header",
        "It is a cache hint and it addresses the fact that WSDL messages cannot be reused between separate requests",
        "It tells the client what to do next, so the order of the steps is visible and it addresses WSDL not giving any ordering"
      ],
      correctIndex: 3,
      modelAnswer: "It is like a signpost after each room in a museum, pointing to the next room. You do not need a separate map that lists the visiting order.\n\n• Links are state transitions. Think of resources as states in a state machine and links as the transitions between them.\n\n• The order response points to the payment resource, so the client learns the next step from the response itself.\n\n• Earlier the lecturer showed that WSDL does not say whether to pay before confirming. In REST, the links tell us what to do next.\n\nSo the answer is: the link tells the client what to do next, which solves the missing ordering."
    },
    {
      type: "mcq",
      prompt: "A bank needs to integrate with a legacy mainframe system, and the two sides must follow a strict formal contract with transactions and message-level security. A separate startup is building a mobile app that reads product data over the internet. Which choice best matches the lecture?",
      options: [
        "REST for both, because REST is always the better choice and SOAP no longer has any valid use in any enterprise system",
        "SOAP for the mobile app, because mobile apps need strict contracts, and REST for the bank, because it has transactions",
        "SOAP and WS-* for the bank and legacy integration, and REST for the mobile app that needs a light, HTTP-based interface",
        "Neither, because both styles are equally unsuitable for these cases and only a message queue can meet either requirement"
      ],
      correctIndex: 2,
      modelAnswer: "You would use a courier with signed, tracked delivery for a legal contract, and a bicycle messenger for a quick note. Same job, different tools.\n\n• The bank case needs the enterprise extras that WS-* provides: transactions, reliability and security, with a strict contract and a legacy system.\n\n• The mobile app case wants simplicity, ubiquitous HTTP and light infrastructure, which is REST's strength.\n\n• The conclusion slide says to focus on whatever architecture gets the job done. Each will be highly suitable to some applications and terrible for others.\n\nSo the answer is: SOAP and WS-* for the bank, and REST for the mobile app."
    },
    {
      type: "mcq",
      prompt: "Link to Week 6. A REST call to a service and a message put on a queue for the same service both reach the service while it is running. What happens when the service is down for an hour?",
      options: [
        "The REST call still waits patiently for the service to return, while the queued message is lost for the whole hour",
        "Both fail immediately, because neither one can be delivered until the service is running again at the time of sending",
        "Both succeed automatically, because HTTP and message queues both store requests until the service is back to handle them",
        "The REST call fails at once because the exchange is synchronous, while the queued message waits until the service comes back"
      ],
      correctIndex: 3,
      modelAnswer: "Phoning a shop that is shut gets no answer, while dropping a note through its letterbox works, and the note is read when it opens.\n\n• REST over HTTP is a synchronous request and reply, so the caller needs the service to be up right now, just like RPC.\n\n• Message-oriented middleware stores the message in a persistent queue until the receiver reads it, which gives the decoupling from Week 6.\n\n• So REST gives simplicity and immediacy, and MOM gives availability and independence in time.\n\nSo the answer is: the REST call fails now, and the queued message waits."
    },
    {
      type: "mcq",
      prompt: "Link to Week 3 and Week 4. A client sends a request that changes an order, and the connection drops before it sees the reply. It cannot tell whether the change was applied. Which request is the safest to resend blindly?",
      options: [
        "POST to the orders collection, because the server will simply recognise it as a duplicate and refuse the second copy",
        "GET with the change added to the query string, because GET is always safe to send twice and it can update an order",
        "DELETE on the collection of all orders, because deleting something twice always leaves the system in the same state",
        "PUT of the full new order to the same order URI, because PUT is idempotent and a repeat leaves the same final state"
      ],
      correctIndex: 3,
      modelAnswer: "Setting a thermostat to 21 degrees twice gives the same result as once. Pressing 'add one degree' twice does not.\n\n• PUT overwrites a resource with the given content and the lecture calls it idempotent, so repeating it is harmless.\n\n• POST creates a new resource with a system-chosen URI, so resending it can create a duplicate. This is why the slide says not to use POST for updates.\n\n• GET is idempotent too, but it should never be used to change state.\n\n• Deleting all orders is destructive and is not the retry we want.\n\nSo the answer is: resend the PUT to the same URI."
    },
    {
      type: "multi",
      prompt: "Select every SOA tenet listed in the lecture.",
      options: [
        "Boundaries are explicit, so crossing a service boundary has costs and implications",
        "Services share one common database and class library so that they always stay consistent",
        "Services share schema and contract, not classes and implementations",
        "Compatibility is policy-based, so requirements are stated in policies and not in code",
        "Services are autonomous, so they may be outside your control and can change"
      ],
      correctIndices: [
        0,
        2,
        3,
        4
      ],
      modelAnswer: "The four tenets read like the rules of dealing with a business in another country: know where the border is, remember they run their own affairs, agree only on the paperwork, and write requirements as policies.\n\n• Explicit boundaries.\n\n• Autonomous services.\n\n• Share schema and contract, not classes.\n\n• Policy-based compatibility.\n\n• Sharing a database or class library is the opposite of SOA, where applications share nothing else.\n\nSo the answer is: explicit boundaries, autonomy, sharing schema and contract, and policy-based compatibility are tenets, and a shared database is not."
    },
    {
      type: "multi",
      prompt: "Select every true statement about WSDL.",
      options: [
        "It is generated and consumed by tools, such as Visual Studio, WebSphere, Java tooling and Spring Boot",
        "It is focused on request-response interactions, and an approach called BPEL could in theory add conversations",
        "It specifies the order in which the messages of a conversation must be sent, such as pay before confirm",
        "It is an XML description of a service, including its interfaces, methods, parameters, request and response, and how to bind to it",
        "Its structure has types, message, portType and binding sections"
      ],
      correctIndices: [
        0,
        1,
        3,
        4
      ],
      modelAnswer: "WSDL is the complete data sheet for a product, generated by the factory's tools. It says what buttons exist but not the order to press them.\n\n• XML description of interfaces, operations, messages, and how to bind.\n\n• Four sections: types, message, portType, binding.\n\n• Tool-generated and tool-consumed, so people rarely write it by hand.\n\n• Focused on request-response, so it does not say what order to send messages, and BPEL can in theory add conversations but is verbose and complex.\n\nSo the answer is: all but the option that claims WSDL specifies message order."
    },
    {
      type: "multi",
      prompt: "Select every true statement about the REST verbs.",
      options: [
        "DELETE always physically wipes the resource, so the underlying data can no longer be recovered by the server",
        "OPTIONS retrieves the full representation of the resource, and it is the verb that browsers use for every page view",
        "POST creates a new resource and the server decides its URI, with 201 Created and a Location header in the reply",
        "GET retrieves a representation, and HEAD is like GET but only retrieves metadata",
        "PUT can create a resource at a URI the client chooses, and it can update an existing resource by overwriting it in place"
      ],
      correctIndices: [
        2,
        3,
        4
      ],
      modelAnswer: "Each verb is a different button on the same remote control, and each does one job.\n\n• POST: create, with a server-chosen URI.\n\n• PUT: create at a client-chosen URI, or update in place. It is idempotent.\n\n• GET: read. HEAD: read only the metadata.\n\n• DELETE: a logical delete, so the resource stops being accessible, not a promise of physical erasure.\n\n• OPTIONS asks which verbs the resource supports. Reading a page is GET.\n\nSo the answer is: the POST, PUT and GET-with-HEAD statements."
    },
    {
      type: "multi",
      prompt: "Select every correct pairing of an HTTP status code with its meaning in the lecture.",
      options: [
        "201 Created: a new resource was created, and the Location header says where it is",
        "500 Internal Server Error: the client sent something the server could not understand, so the client must fix it",
        "404 Not Found: the resource the client asked for does not exist at that URI",
        "409 Conflict: the request clashes with the resource's current state, as when an order has already been started",
        "401 Unauthorized: the client must authenticate, for example with a Digest challenge, before it can read the resource"
      ],
      correctIndices: [
        0,
        2,
        3,
        4
      ],
      modelAnswer: "The number's first digit tells you who has to fix things: 2 all good, 3 go elsewhere, 4 the caller erred, 5 the server erred.\n\n• 201 Created goes with a Location header, as in the Starbucks order.\n\n• 404 Not Found, and 405 Method Not Allowed, are 4xx client mistakes.\n\n• 401 Unauthorized comes with a WWW-Authenticate challenge for the private payment resource.\n\n• 409 Conflict was the reply to the too-slow PUT.\n\n• 500 is the server's fault, not the client's.\n\nSo the answer is: 201, 404, 401 and 409 are paired correctly, and 500 is a server fault, not a client one."
    },
    {
      type: "multi",
      prompt: "Select every true statement about the Starbucks order workflow in the case study.",
      options: [
        "Once payment has been made the client keeps a private session on the server that stores how much has been paid",
        "The order steps have to be looked up in a WSDL file, because HTTP itself cannot say what the client does next",
        "OPTIONS on the order shows which verbs are currently allowed, such as GET and PUT before the drink is made",
        "The order is created by POSTing to a well-known URI, and the reply contains the new order's Location",
        "The client learns to POST its payment from a link in the order representation, not from an external contract"
      ],
      correctIndices: [
        2,
        3,
        4
      ],
      modelAnswer: "The shop guides you through the steps one signpost at a time, and it never has to remember who you are between visits.\n\n• POST an order to a well-known URI and you get 201 Created with a Location.\n\n• OPTIONS tells you what verbs are available right now: GET and PUT at first, and GET only after it is too late.\n\n• The link in the order says where to POST the payment.\n\n• The workflow is expressed by resources and links, so a WSDL is not needed, and the server is stateless between requests, so the interaction state is in the resources.\n\nSo the answer is: the well-known URI, the OPTIONS check, and the link-driven payment step."
    },
    {
      type: "multi",
      prompt: "Select every strength of REST that the lecture lists.",
      options: [
        "Perceived ease of adoption, needing only a browser to get started and no WS-* middleware",
        "Simplicity, since the uniform interface is immutable and so harder to break clients",
        "Built-in distributed transactions and reliable delivery, exactly as offered by the WS-* family of standards",
        "HTTP and plain XML are ubiquitous, so the traffic goes through firewalls",
        "Proven scalability from the way the web works, such as caching and clustered server farms"
      ],
      correctIndices: [
        0,
        1,
        3,
        4
      ],
      modelAnswer: "REST wins by being like a bicycle: easy to get, easy to ride, and it goes on the roads that already exist.\n\n• Simplicity and an immutable uniform interface.\n\n• Ubiquitous HTTP, so it passes through firewalls.\n\n• Proven scalability: after all the web works, with caching and server farms.\n\n• Ease of adoption: only a browser is needed.\n\n• Transactions and reliability are the WS-* strength, and REST cannot deliver all of the enterprise 'ilities'.\n\nSo the answer is: simplicity, firewalls, scalability and ease of adoption."
    },
    {
      type: "multi",
      prompt: "Select every weakness of REST that the lecture lists.",
      options: [
        "It cannot deliver all the enterprise 'ilities' that WS-* does, such as transactions, flexible security and reliability",
        "It is not clear whether it is really just four verbs, since HTTP 1.1 also has HEAD, TRACE, OPTIONS and CONNECT",
        "The interaction is inherently synchronous, so it does not fit asynchronous scenarios in the way a queue does",
        "There is an apparent lack of standards other than URI, HTTP, XML, MIME and HTML",
        "Its messages cannot cross a firewall without extra configuration, since it does not use port 80 or 443"
      ],
      correctIndices: [
        0,
        1,
        2,
        3
      ],
      modelAnswer: "REST leaves out many features on purpose, and some of that is a strength and some is a cost.\n\n• Synchronous by nature, so it does not suit the asynchronous cases that MOM handles.\n\n• Cannot deliver all the enterprise 'ilities'.\n\n• Few formal standards, and descriptions that are informal and human-oriented.\n\n• Confusion about the verbs: HTTP 1.1 has HEAD, GET, POST, PUT, DELETE, TRACE, OPTIONS and CONNECT.\n\n• Firewalls are a strength, not a weakness, since REST rides on HTTP.\n\nSo the answer is: synchronous, missing the 'ilities', few standards, and verb confusion."
    },
    {
      type: "multi",
      prompt: "Link to earlier weeks. Select every true statement that connects this week's REST and SOAP material to earlier ideas.",
      options: [
        "Unlike MOM, HTTP does not store the request in a persistent queue for a service that is currently unavailable",
        "Because REST is stateless, any server in a farm can handle any request, which supports the scalability ideas from the performance week",
        "A REST request and reply is synchronous, so like RPC the caller waits, and it fails at once if the service is down",
        "Because the server keeps each client's conversation between requests, it can recover the conversation after a crash",
        "A REST POST automatically takes part in a distributed two-phase commit, so a set of calls behaves as one atomic transaction"
      ],
      correctIndices: [
        0,
        1,
        2
      ],
      modelAnswer: "REST is the web's ordinary phone call: quick, simple, and needs the other side to be there. It is not a postal system with guaranteed storage, and not a bank vault.\n\n• Synchronous like RPC: the caller waits and needs the service up.\n\n• No persistent queue like MOM: an unavailable service means a failed call.\n\n• Stateless, so requests can go to any server in a cluster, and GET can be cached, which helps scalability.\n\n• Transactions across calls are a WS-* feature and not something REST gives for free.\n\n• REST keeps no per-client conversation on the server: the state is in the resources and links.\n\nSo the answer is: the synchronous, no-persistent-queue and stateless-scaling points."
    },
    {
      type: "multi",
      prompt: "Select every good justification in a final-exam style case: a company must expose its 20-year-old order system to a new mobile app and to partner banks. Choose the reasons that match the lecture's principles.",
      options: [
        "Rewrite the legacy system first so that all consumers can share its internal classes and its database schema directly",
        "Offer partner banks a SOAP interface described by WSDL when they need a strict contract, transactions and message-level security",
        "Give the mobile app a REST interface with clear resource URIs, because it is light and works well over HTTP",
        "Wrap the legacy system behind a service interface and contract, so that it is not rewritten, following the SOA principle",
        "Choose a single style for everything, because using both REST and SOAP is not allowed within a service-oriented architecture"
      ],
      correctIndices: [
        1,
        2,
        3
      ],
      modelAnswer: "A company can serve customers at the front counter and trade partners through a formal contract office, both in front of the same old warehouse.\n\n• SOA principle: avoid rewriting legacy code, so wrap it and share only a contract and schema.\n\n• REST for the mobile app: light, HTTP-based, simple to adopt.\n\n• SOAP with WSDL for the partners: strict contract, transactions and security.\n\n• Sharing classes and database schemas breaks the SOA tenet of sharing schema and contract, not classes.\n\n• The conclusion slide says SOA can be implemented in different ways: focus on whatever architecture gets the job done.\n\nSo the answer is: wrap the legacy system, REST for mobile, and SOAP with WSDL for the strict partner integration."
    },
    {
      type: "truefalse",
      prompt: "True or False: Because JMS defines how senders and receivers are coded, two applications that both use JMS are guaranteed to exchange messages even when they run on different messaging products.",
      options: [
        "True",
        "False"
      ],
      correctIndex: 1,
      modelAnswer: "Two kettles with the same style of plug do not necessarily use the same voltage. The plug shape is not the wiring behind it.\n\n• JMS is an API, meaning it fixes how you write the code, and it is not a protocol.\n\n• It does not define what the message looks like on the wire.\n\n• Interoperability is only guaranteed when both applications use the same messaging product underneath.\n\nSo the answer is: False."
    },
    {
      type: "truefalse",
      prompt: "True or False: In a SOAP message the Header is optional and is where extensible information such as authentication, transaction context or routing lives, while the Body carries the actual request or document.",
      options: [
        "True",
        "False"
      ],
      correctIndex: 0,
      modelAnswer: "A parcel needs its contents, and instructions on the outside are extras.\n\n• Envelope: mandatory.\n\n• Header: optional. It holds authentication, transaction, context and routing, which is where the protocol is extended.\n\n• Body: mandatory. It carries the request or document.\n\n• The lecturer's example had no header at all, and that is still a valid message.\n\nSo the answer is: True."
    },
    {
      type: "truefalse",
      prompt: "True or False: GET should be idempotent, meaning that however many times you get the same resource, its state does not change, and GET responses could be cached.",
      options: [
        "True",
        "False"
      ],
      correctIndex: 0,
      modelAnswer: "Reading the same page of a book many times does not change the book.\n\n• GET retrieves a representation of a resource.\n\n• It should be idempotent, which is a shared understanding that we must not violate.\n\n• Because of this, it could be cached.\n\nSo the answer is: True."
    }
  ]
};

export const WEEK_7_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
