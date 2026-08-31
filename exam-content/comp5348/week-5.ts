import type { ExamPaperSeed } from "../types";

const TUTORIAL_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 5,
  paperNumber: 1,
  title: "Week 5 Tutorial Practice Paper",
  topics:
    "Performance measurement units and conversions from the Week 5 tutorial: processor clock speed (Hz/MHz/GHz, cycles vs instructions), MIPS vs FLOPS and why GHz conversions are architecture-dependent, bit vs byte, decimal storage units (KB=1000 B for calculation questions) vs binary (KiB=1024 B), Mbps vs MBps (1 MBps = 8 Mbps), USB standard speeds, time-unit conversion (s/ms/us/ns), number-system equivalence (1111 = 15 = F); worked exercises Q1 (spotting the errors in a colleague's cloud-cost calculation: storage rate per MB per day vs per hour, multiply vs divide, per-MB transmission charge as rate x MB not division, wrong record sizes, request count, KB/B unit slip, weighted-average weights = occurrences not inter-arrival seconds), Q2 (CPU and disk utilisation from a job-class mix, and which resource saturates first as arrival rate rises), Q3 (instructions/sec and instructions/sec-per-dollar for three cache configurations, diminishing returns), Q4 (HDD sequential vs random 1 KB-block read times, and the effect of replacing the HDD with an SSD)",
  sourceFiles: [
    "tutorial/COMP5348_Tutorial 5 Slides.pdf",
    "tutorial/COMP5348_Tutorial 5.pdf",
  ],
  questions: [
    {
      type: "mcq",
      prompt:
        "The tutorial slide 'Processor Clock Speed' says clock speed indicates how many cycles a CPU executes per second, with each cycle typically representing one basic operation. Given only that a CPU is rated at 2 GHz, what can you state directly?",
      options: [
        "It moves 2 billion bytes each second between the CPU registers and main memory, one byte transferred on every rising clock edge",
        "It performs 2 billion floating-point operations each second, since a gigahertz rating is defined in terms of FLOPS for real-number work",
        "It completes exactly 2 billion machine instructions each second, because one clock cycle always corresponds to exactly one finished instruction",
        "It completes 2 billion clock cycles each second; the instruction rate depends on cycles-per-instruction, which varies by instruction and by architecture",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide defines clock speed as cycles per second (1 Hz = one cycle/s; 1 GHz = 1 billion Hz). Instructions take a variable number of cycles (the later exercises use 2 or 4 cycles per instruction), so GHz alone does not give instructions/sec - that conversion is architecture-dependent.",
    },
    {
      type: "mcq",
      prompt:
        "On the 'More Processor Speed Measurements' slide, why does it say a FLOP 'is not the same as a basic instruction' and that GHz-to-MIPS and GHz-to-FLOPS conversions are 'CPU architecture dependent'?",
      options: [
        "A FLOP always equals exactly eight basic instructions on every CPU, a fixed ratio that makes the GHz conversion identical across all architectures",
        "FLOPS counts only operations that miss the cache while MIPS counts only operations that hit it, so the two can never be compared on one machine",
        "MIPS is measured in software and FLOPS in hardware, so only FLOPS is a real figure and GHz cannot be converted to MIPS at all on any CPU",
        "Floating-point operations on real numbers are more complex than basic integer instructions, so they take a different, architecture-specific number of cycles each",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide states FLOPS measures floating-point operations (complex calculations involving real numbers) and that 'a FLOP is not the same as a basic instruction'. Because a FLOP and a basic instruction take different numbers of cycles on different CPU designs, GHz cannot be converted to MIPS or FLOPS without knowing the architecture.",
    },
    {
      type: "truefalse",
      prompt:
        "The Week 5 tutorial slides say that although 1 KiB = 1,024 bytes in binary, you should assume 1 KB = 1,000 bytes when doing the tutorial's calculation questions.",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "True. The 'Storage Measurements' slide gives decimal 1 KB = 1,000 bytes and binary 1 KiB = 1,024 bytes, and states 'Binary: commonly used in computing systems. Decimal: for calculation questions.' The lecture's Measurement Principles slide agrees ('We assume KB = 1000 B in the calculation questions').",
    },
    {
      type: "mcq",
      prompt:
        "A storage device is advertised at 480 Mbps and a network link is advertised at 480 Mbps. Using the tutorial's 'Speed Measurements' conversions (1 byte = 8 bits, 1 MBps = 8 Mbps), what sustained rate in megabytes per second does each represent?",
      options: [
        "3,840 MBps for both, since converting megabits per second to megabytes per second means multiplying the rate by the eight bits in a byte",
        "60 MBps for the storage device but 480 MBps for the network link, because network speeds are already quoted in bytes per second by convention",
        "480 MBps for both, because 'Mbps' and 'MBps' are two notations for the same unit and no bit-to-byte conversion is needed",
        "60 MBps for both - dividing the megabit-per-second figure by 8 converts it to megabytes per second whether the link is storage or network",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide gives 1 Megabyte = 8 Megabits, so 1 MBps = 8 Mbps; 480 Mbps / 8 = 60 MBps. Both figures are in bits per second (the slide's USB table lists 'USB 2.0: 480 Mbps (60 MBps)'), so the factor of 8 applies to storage and network figures alike.",
    },
    {
      type: "mcq",
      prompt:
        "The tutorial's 'Speed Measurement in Practice' slide lists USB 3.2 Gen 2 at 10 Gbps and USB 3.2 Gen 2x2 at 20 Gbps, and a '100 Mbps' network-speed example. Roughly how do the two USB links compare, in bytes per second, with that network figure?",
      options: [
        "All three are about the same in bytes per second once converted, because Gbps and Mbps both reduce to roughly 10 MBps after dividing by eight",
        "USB 3.2 Gen 2 is about 10 MBps and Gen 2x2 about 20 MBps, versus about 100 MBps for the network, so the 100 Mbps link is the fastest of the three",
        "USB 3.2 Gen 2 is about 1,250 MBps and Gen 2x2 about 2,500 MBps, versus about 12.5 MBps for the 100 Mbps network - roughly 100x and 200x faster",
        "USB 3.2 Gen 2 is about 80 GBps and Gen 2x2 about 160 GBps, versus about 800 MBps for the network, since converting to bytes multiplies the bit rate by eight",
      ],
      correctIndex: 2,
      modelAnswer:
        "Slide values: USB 3.2 Gen 2 = 10 Gbps (1,250 MBps); Gen 2x2 = 20 Gbps (2,500 MBps). 100 Mbps / 8 = 12.5 MBps. 1,250 / 12.5 = 100 and 2,500 / 12.5 = 200.",
    },
    {
      type: "mcq",
      prompt:
        "Using the tutorial's 'Time Unit Conversion' slide (1 s = 1,000 ms; 1 ms = 1,000 us; 1 us = 1,000 ns), how is a disk set-up latency of 5 ms expressed in nanoseconds, and how does it compare with an SSD set-up latency of 5 us?",
      options: [
        "5 ms = 5,000 ns and 5 us = 5,000,000 ns, so the SSD set-up latency is actually the larger of the two",
        "5 ms = 5,000,000 ns and 5 us = 500,000 ns, so the HDD set-up latency is about 10x the SSD's",
        "5 ms = 500,000 ns and 5 us = 50,000 ns, so the HDD set-up latency is only about 10x the SSD's",
        "5 ms = 5,000,000 ns and 5 us = 5,000 ns, so the HDD set-up latency is 1,000x the SSD's",
      ],
      correctIndex: 3,
      modelAnswer:
        "5 ms x 1,000 = 5,000 us x 1,000 = 5,000,000 ns; 5 us x 1,000 = 5,000 ns; the ratio is 5,000,000 / 5,000 = 1,000. This is exactly the HDD-to-SSD set-up-latency change in worksheet Q4(3).",
    },
    {
      type: "mcq",
      prompt:
        "The 'Number System Conversion' slide shows binary 1111, decimal 15 and hexadecimal F as the same value. Which statement about that equivalence is correct?",
      options: [
        "F in base-16 equals 16 in decimal because hexadecimal is base-16, so the slide's decimal value of 15 contains an off-by-one error",
        "1111 in binary equals 15 in decimal (8 + 4 + 2 + 1), and a single hex digit F also represents 15, so one hex digit encodes four binary digits",
        "1111 in binary equals 1,111 in decimal because binary and decimal share the same positional weights, and F is just a label for that number",
        "1111 in binary equals 15 only by coincidence for this value; in general four binary digits map to two hexadecimal digits, not one",
      ],
      correctIndex: 1,
      modelAnswer:
        "Positional value 8 + 4 + 2 + 1 = 15; hex F = 15. Because 2^4 = 16, every hexadecimal digit maps to exactly four bits (0000-1111 covers 0-F), which is why the three representations line up.",
    },
    {
      type: "scenario",
      prompt:
        "Worksheet Q1: a retailer stores 100,000 customer records (120 B each), 300,000 order records (1.5 KB each) and 10,000 product records (300 B each) at a cloud facility. Charges: $0.50 per request received, $2.50 per MB transmitted to the client, $1.60 per day per MB stored. A reporting operation (once per hour) makes 1 request and returns data on 100 products. A query operation (4 times per minute) returns 1 customer, then 1 order, then on average 2 products. A colleague concludes the total is about $291.15/hour via: storage = 465 MB; storage cost/hour = 465 / 1.60 = $290.625; reporting data = 100 x 1.5 = 150 B, cost = 0.50 x 1 + 2.50 / 150 = $0.5167; query = 3 requests, data = 120 + 1.5 + 2 x 300 = 721.5 B, cost = 0.50 x 3 + 2.50 / 721.5 = $1.5035; average operation = (3600 x 0.5167 + 15 x 1.5035) / (3600 + 15) = $0.5208; total = 290.625 + 0.5208. Identify the errors.",
      modelAnswer:
        "1) Storage rate mis-applied. The charge is $1.60 per MB PER DAY and is a multiplication: 465 x $1.60 = $744/day, /24 = about $31/hour - not $290.625/hour (the colleague divided by 1.60 and treated a daily rate as hourly). The 465 MB total is itself right (12,000,000 + 450,000,000 + 3,000,000 = 465,000,000 B = 465 decimal MB); the stray '475800000' in their working is inconsistent.\n2) Data charge inverted. $2.50 is PER MB transmitted, so cost = 2.50 x (bytes / 1,000,000), not 2.50 / bytes.\n3) Reporting data volume wrong. 100 products x 300 B = 30,000 B = 0.03 MB, not 100 x 1.5 = 150 B (wrong record size). Correct reporting cost = 0.50 x 1 + 2.50 x 0.03 = $0.575.\n4) Query request count wrong. 1 (customer) + 1 (order) + 2 (products, the stated average) = 4 requests, not 3.\n5) Query data volume wrong. The order record is 1.5 KB = 1,500 B, not 1.5 B (KB/B slip). Correct data = 120 + 1,500 + 2 x 300 = 2,220 B; query cost = 0.50 x 4 + 2.50 x (2,220 / 1,000,000) = about $2.006.\n6) Weighting wrong. The 'average operation' step weights the two job classes by the seconds between their arrivals (3,600 and 15). Weights should be the number of occurrences per period (reporting 1/hour, query 240/hour) - and you cannot add one 'average operation cost' to a whole hour of storage. Per hour: 1 reporting op + 240 query ops + 1 hour storage = about 0.575 + 240 x 2.006 + 31 = about $513/hour.\n7) Units dropped throughout (B vs MB, KB vs B, per-day vs per-hour), which is what let the slips pass - the lecture's 'always include units' principle.",
    },
    {
      type: "mcq",
      prompt:
        "In worksheet Q1 the stored data totals 465 MB and the facility charges $1.60 per MB per day. What is the correct storage cost per hour, and what did the colleague get wrong?",
      options: [
        "$12.92/hour: take 465 x $1.60 / 24, then divide again by the $2.40 per-MB transmission surcharge that also applies to data at rest",
        "$744/hour: multiplying 465 by $1.60 is correct, and the charge recurs every hour, so dividing by 24 would understate it",
        "$31/hour: 465 x $1.60 = $744 per day, and $744 / 24 = $31/hour; the colleague divided by 1.60 rather than multiplying, and never converted per-day to per-hour",
        "$290.63/hour: the colleague's method is sound because 465 / 1.60 converts megabytes to dollars and the rate is already quoted per hour",
      ],
      correctIndex: 2,
      modelAnswer:
        "The rate is per MB per day and multiplicative: 465 x 1.60 = $744/day; /24 h = $31/h. The colleague computed 465 / 1.60 = $290.625 (division instead of multiplication) and treated a daily rate as an hourly one.",
    },
    {
      type: "mcq",
      prompt:
        "In worksheet Q1's query operation the client retrieves 1 customer, then 1 order, then on average 2 products. The colleague counted '3 separate requests'. How many requests does one query operation actually involve, and what does the request charge alone come to at $0.50 each?",
      options: [
        "2 requests, so $1.00 - the customer and order lookups form one combined request and the products add the second",
        "6 requests, so $3.00 - each of the customer, order and product lookups is counted twice, once to send and once to receive",
        "4 requests (1 + 1 + 2), so $2.00 in request charges - the colleague treated the product retrieval as one request instead of the average of two",
        "3 requests, so $1.50 - the colleague is right, because the two products are fetched together in a single batched request",
      ],
      correctIndex: 2,
      modelAnswer:
        "1 (customer) + 1 (order) + 2 (products, the stated average) = 4 requests, so 4 x $0.50 = $2.00. The average number of products retrieved is 2, so the product step averages two requests, not one.",
    },
    {
      type: "short",
      prompt:
        "Worksheet Q1: the colleague computes the query operation's transmitted data as '120 + 1.5 + 2 x 300 = 721.5 B'. Identify the unit error, and give the corrected data volume and the corrected $2.50-per-MB transmission charge for one query operation.",
      modelAnswer:
        "The order record is 1.5 KB, i.e. 1,500 B - the colleague used 1.5 B. Corrected data per query = 120 (customer) + 1,500 (order) + 2 x 300 (two products) = 2,220 B = 0.00222 MB. Transmission charge = $2.50 x 0.00222 = about $0.0056 per query (and the charge is rate x MB, not $2.50 / bytes). Total query cost = about $2.00 (four requests) + $0.0056 = about $2.006.",
    },
    {
      type: "short",
      prompt:
        "Worksheet Q1: the colleague combines the two operation costs as (3600 x 0.5167 + 15 x 1.5035) / (3600 + 15). Explain why this weighting is wrong and how the per-hour cost should actually be assembled.",
      modelAnswer:
        "The colleague weighted each job class by the seconds between its arrivals (3,600 s for reporting, 15 s for query). A weighted average should weight by the number of occurrences of each class: in one hour there is 1 reporting operation and 4 x 60 = 240 query operations. You also should not blend the operations into one 'average' and add it to a whole hour of storage - the hourly cost is the sum of every operation run that hour plus one hour of storage: about 1 x $0.575 + 240 x $2.006 + $31 = about $513/hour.",
    },
    {
      type: "scenario",
      prompt:
        "Worksheet Q2: requests arrive every 100 ms; 90% are type A (2M instructions at 2 cycles each, plus 10 ms of disk activity), 10% are type B (100M instructions at 4 cycles each, no I/O). The CPU runs at 2 GHz. Work out the CPU and disk utilisation, and estimate when saturation occurs as the arrival rate rises.",
      modelAnswer:
        "Per-request CPU demand: type A = 2e6 x 2 / 2e9 = 2 ms; type B = 100e6 x 4 / 2e9 = 200 ms. Mean CPU demand = 0.9 x 2 + 0.1 x 200 = 21.8 ms/request. Mean disk demand = 0.9 x 10 + 0.1 x 0 = 9 ms/request.\nAt one request per 100 ms: CPU utilisation = 21.8 / 100 = about 22%; disk utilisation = 9 / 100 = 9%.\nAs the arrival interval shrinks the CPU reaches 100% first, at an interval of about 21.8 ms (about 46 requests/s, roughly 4.6x the current rate); the disk would only saturate at about 9 ms (about 111 requests/s). So the CPU is the bottleneck; beyond about 46 requests/s its queue grows without bound and response time diverges. Note that type B is only 10% of requests but supplies 20 of the 21.8 ms mean CPU demand.",
    },
    {
      type: "mcq",
      prompt:
        "In worksheet Q2 type B requests are only 10% of the mix but each needs 100M instructions at 4 cycles. What does this do to the mean per-request CPU demand, and which resource saturates first as load grows?",
      options: [
        "Because type B is only 10% of requests it has a negligible effect on mean CPU demand, and the disk (used by every type A request) saturates first",
        "Type A and type B contribute equally to mean CPU demand once frequency is accounted for, so the CPU and disk reach saturation at the same arrival rate",
        "Type B needs no I/O, so it lowers the mean per-request demand overall, and neither resource saturates until the arrival interval drops below 2 ms",
        "Type B contributes 0.1 x 200 ms = 20 ms of the 21.8 ms mean CPU demand, so the CPU saturates well before the disk despite type B's low frequency",
      ],
      correctIndex: 3,
      modelAnswer:
        "Mean CPU demand = 0.9 x 2 + 0.1 x 200 = 21.8 ms, of which type B supplies 20 ms; mean disk demand = 9 ms. CPU utilisation (about 22%) already far exceeds disk (9%), and the CPU hits 100% at about 21.8 ms inter-arrival versus about 9 ms for the disk. This is the lecture's 'averages are evil' / weight-by-occurrence point in action.",
    },
    {
      type: "scenario",
      prompt:
        "Worksheet Q3: three 2 GHz configurations differ only in cache - X: 128 kB, 50% hit, $1,250; Y: 3 MB, 95% hit, $1,500; Z: 64 MB, 100% hit, $6,000. Each instruction takes 2 cycles excluding load/store; there is 1 load/store per 10 instructions; cache access = 10 ns, slow memory = 70 ns. Find instructions/sec and instructions/sec-per-dollar for each, and say which to buy.",
      modelAnswer:
        "Cycle time = 1 / 2 GHz = 0.5 ns, so an instruction (excluding load/store) = 2 x 0.5 = 1 ns; 10 instructions = 10 ns of compute plus 1 load/store.\nLoad/store average time = hit x 10 + miss x 70: X = 0.5 x 10 + 0.5 x 70 = 40 ns; Y = 0.95 x 10 + 0.05 x 70 = 13 ns; Z = 10 ns.\nTime per 10 instructions: X = 10 + 40 = 50 ns -> 2.0e8 instr/s; Y = 10 + 13 = 23 ns -> about 4.35e8 instr/s; Z = 10 + 10 = 20 ns -> 5.0e8 instr/s.\nPer dollar: X = 2.0e8 / 1,250 = about 1.6e5; Y = 4.35e8 / 1,500 = about 2.9e5; Z = 5.0e8 / 6,000 = about 8.3e4.\nZ is fastest in absolute terms but worst value; Y gives the best performance per dollar (X->Y nearly doubles throughput for +$250, Y->Z adds only about 15% for +$4,500). Buy Y unless the extra absolute throughput of Z is genuinely worth the premium.",
    },
    {
      type: "mcq",
      prompt:
        "Worksheet Q3 yields roughly 2.0e8, 4.35e8 and 5.0e8 instructions/sec for configurations X, Y and Z, at $1,250, $1,500 and $6,000. Which conclusion about 'performance per dollar' does this best support?",
      options: [
        "All three have equal performance per dollar because throughput and price both scale linearly with the amount of cache fitted",
        "Y is the best value: X->Y nearly doubles throughput for $250 more, while Y->Z adds only about 15% for $4,500 more - classic diminishing returns",
        "X is the best value because it is the cheapest box, and the 50% hit rate barely matters since most instructions do no load/store anyway",
        "Z is the best value because it has the highest raw throughput, and 'performance per dollar' just means raw throughput once price is set aside",
      ],
      correctIndex: 1,
      modelAnswer:
        "Per-dollar figures are about 1.6e5 (X), 2.9e5 (Y), 8.3e4 (Z); Y is highest. The big gain is X->Y (hit rate 50% -> 95%); Z's extra cache buys only the last 5% of hits at large cost.",
    },
    {
      type: "scenario",
      prompt:
        "Worksheet Q4(1)-(2): a 1 GB file sits on an HDD with 250 MB/s sequential bandwidth and 5 ms set-up latency. (1) Time to read it sequentially. (2) Time if it is read as 1 KB blocks in random order, each block needing its own 5 ms set-up. Use decimal units (1 GB = 1,000 MB, 1 KB = 1,000 B).",
      modelAnswer:
        "(1) Transfer = 1,000 MB / 250 MB/s = 4 s, plus one 5 ms set-up = about 4.005 s.\n(2) Blocks = 1 GB / 1 KB = 1,000,000. Each block: 5 ms set-up + (1,000 B / 250e6 B/s = 4 us transfer, negligible) = about 5 ms. Total = about 1,000,000 x 5 ms = 5,000,000 s = about 57.9 days. The per-block set-up (seek/rotational) latency completely dominates - random small-block access on an HDD is catastrophic next to the 4 s sequential read of the same data.",
    },
    {
      type: "scenario",
      prompt:
        "Worksheet Q4(3): the HDD is replaced by an SSD with 2 GB/s sequential bandwidth and 5 us set-up latency. Redo parts (1) and (2), and explain why the two cases improve by such different factors.",
      modelAnswer:
        "(1) 5 us + 1,000 MB / 2,000 MB/s = 5 us + 0.5 s = about 0.5 s (about 8x faster than the HDD's about 4 s - this case is bandwidth-bound, and bandwidth only rose 8x).\n(2) 1,000,000 blocks x (5 us set-up + 1,000 B / 2e9 B/s = 0.5 us) = about 1,000,000 x 5.5 us = about 5.5 s (versus about 58 days on the HDD - roughly a million-fold improvement). The random case is latency-bound, and the SSD has no seek or rotational delay, so per-access latency falls from 5 ms to about 5 us. Sequential throughput improves modestly; random access improves enormously.",
    },
    {
      type: "mcq",
      prompt:
        "Comparing worksheet Q4's HDD random-block case (about 58 days) with its sequential case (about 4 s) for the same 1 GB of data, what is the dominant cost in the random case, and what mainly removes it on the SSD?",
      options: [
        "The dominant cost is the raw data transfer, because reading in 1 KB pieces moves far more total bytes; the SSD's higher bandwidth is what fixes it",
        "The dominant cost is cache eviction between blocks; the SSD's larger internal SLC cache keeps every block resident and avoids re-reads",
        "The dominant cost is the per-block 5 ms set-up (seek/rotational) latency, repeated a million times; the SSD removes almost all of it with about 5 us access latency and no moving parts",
        "The dominant cost is CPU time spent issuing a million read calls; the SSD helps because its controller offloads that work from the CPU",
      ],
      correctIndex: 2,
      modelAnswer:
        "1,000,000 blocks x 5 ms set-up = about 5,000,000 s dominates; the actual transfer (1 GB at 250 MB/s = about 4 s) is trivial by comparison. On the SSD the set-up latency drops from 5 ms to about 5 us (no seek/rotational delay), so the random case falls to about 5.5 s.",
    },
    {
      type: "mcq",
      prompt:
        "Worksheet Q1 computes the stored data as 100,000 x 120 + 300,000 x 1,500 + 10,000 x 300 = 465,000,000 B and calls it 465 MB. Which unit convention is being used, and is it the one the tutorial says to use?",
      options: [
        "Decimal for the customer and product records but binary for the order records, because kilobyte-sized records are conventionally measured in KiB",
        "Decimal (1 MB = 1,000,000 B), giving exactly 465 MB; this matches the slide's instruction to use decimal units for calculation questions",
        "Binary (1 MiB = 1,048,576 B), giving 465 MB after rounding; this matches the slide's advice to use binary units everywhere in computing",
        "Neither - the slide says storage must always be quoted in gibibytes, so the answer should be about 0.43 GiB rather than 465 MB",
      ],
      correctIndex: 1,
      modelAnswer:
        "465,000,000 / 1,000,000 = 465 exactly, i.e. decimal MB. The 'Storage Measurements' slide says decimal is 'for calculation questions'; binary units (KiB/MiB) are for describing real systems.",
    },
    {
      type: "short",
      prompt:
        "The tutorial's 'Processor Clock Speed Increase' slide plots microprocessor clock speed from 1976 to 2016. In one or two sentences, what trend does it show and why does that matter for how we measure performance?",
      modelAnswer:
        "Clock speed rose steeply (roughly exponentially) from the late 1970s into the mid-2000s, then flattened near the 1e9-1e10 Hz range. Raw GHz stopped being the main lever for performance gains, so the other measures the tutorial introduces - MIPS/FLOPS, cache hit rate, I/O bandwidth and latency, and concurrency - are now what distinguish systems.",
    },
    {
      type: "mcq",
      prompt:
        "Worksheet Q1's query operation is billed $0.50 for every request it sends (four of them) plus $2.50 per MB returned. Relating this to the remote-call model from earlier weeks (gRPC stubs and round trips), what does the pricing reward?",
      options: [
        "Fewer, coarser-grained calls that return what the client needs in one round trip, rather than a chain of small dependent requests each costing a flat $0.50",
        "Moving all processing to the client, because requests received by the facility are free and only data leaving it is charged",
        "Keeping each response as large as possible, since the per-MB charge falls once a single response exceeds 1 MB",
        "Splitting every retrieval into as many small requests as possible, since the per-request charge shrinks as the number of requests grows",
      ],
      correctIndex: 0,
      modelAnswer:
        "The flat $0.50-per-request charge penalises a 'chatty' sequence of small dependent calls (customer -> order -> products); a coarser call that returns the needed data in one round trip costs one $0.50 instead of four. This is the same round-trip-cost concern behind choosing remote-call granularity in the earlier gRPC/stub material.",
    },
  ],
};

const LECTURE_PAPER: ExamPaperSeed = {
  course: "COMP5348",
  week: 5,
  paperNumber: 2,
  title: "Week 5 Lecture Practice Paper",
  topics:
    "Lecture 5 (Performance): aspects of performance - load (arrival rate x work per request), job classes and describing load by relative amounts / per-type arrival rates, open vs closed systems (think time, unbounded vs bounded feedback loop, MPL as the closed-system independent variable), throughput vs response time (and response time vs runtime for staged answers), figure of merit and why averages/variance matter, speed-up and real-vs-ideal scalability (contention and queueing); measuring performance - measurement principles (always state units, KB=1024 vs assume 1000, weighted average with weight = number of occurrences), timer precision vs resolution, Java timing functions (currentTimeMillis OS-dependent resolution, nanoTime), Spring Boot Micrometer @Timed, recording data from multi-threaded services, gaining confidence with range intervals, performance counters, standard benchmarks (TPC-C/E OLTP, TPC-H/DS analytics, TPC = Transaction Processing Council), the client-server evaluation setup; performance principles - resources and their characteristics, response-time composition (processor + I/O + wait for shared resources), concurrency and resource overlap, saturation and the 80% rule-of-thumb, admission control and thrashing, queues, the effect of arrival-rate distribution/variability, bottlenecks and Amdahl's Law, read and write caching, middle-tier database caching and cache-miss costs, scale-out, scaling stateless logic vs stateful state stores (replication, partitioning), and optimising for work-done-per-watt at cloud scale; connection to Week 4's two-phase-commit distributed transaction as a 'heavy', lock-holding update. Assessment note from the lecture: Assignment 1 is an individual take-home covering Weeks 1-6, submitted as a single PDF via Canvas, not an in-class quiz.",
  sourceFiles: ["lecture/COMP5348_W5.pdf"],
  questions: [
    {
      type: "mcq",
      prompt:
        "The lecture's 'Load' slide says load 'typically comes from users requesting that jobs be performed' and characterises it along two axes. What are they?",
      options: [
        "How many job requests arrive per unit time, and how much work is involved in each job request",
        "How long the system has been running, and how many times it has been restarted since deployment",
        "How many CPUs the server has, and how much memory each CPU can address",
        "How many users hold accounts, and how many of those users have logged in at least once",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide lists exactly 'How many job requests arrive per unit time' and 'How much work is involved in each job request'. The jobs themselves are typically to look up information or to modify information.",
    },
    {
      type: "mcq",
      prompt:
        "On the 'Job classes' slide, Type A 'looks up 1 record from each of 3 tables by primary key', Type B 'looks up all records in a range by one attribute', and Type C looks up 3 records by primary key 'and then modifies one record'. How does the slide say the overall load is described?",
      options: [
        "By the relative amount of each job type in the mix, or equivalently by the separate arrival rate of each type",
        "By whichever job type was most common in the previous measurement interval, ignoring the rarer types",
        "By the total number of database tables touched across all job types added together",
        "By the single slowest job type present, since that type alone determines the system's response time",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide states 'Load is described by the relative amount of the different types' and 'Or (equivalently) by the separate rate of arrival of each type.' Type A is a small read, Type B a large read, Type C an update.",
    },
    {
      type: "mcq",
      prompt:
        "Using the 'Open vs Closed Systems' slide's definitions, which description is correct?",
      options: [
        "Open: jobs arrive at some external rate and leave once processed (sensible for web requests); potentially unbounded, so access control is needed. Closed: a fixed set of clients, each starting its next job only after its previous one finishes, following a think time; potentially bounded by that feedback loop",
        "Both terms describe a fixed client population of the same size; the only difference is whether the think time a client waits between finishing one job and starting the next is zero or greater than zero",
        "Open means any system reachable from the public internet; closed means any system reachable only from a private corporate network, independent of how the jobs themselves are generated or how many clients exist",
        "Closed: jobs arrive at some external rate and leave once processed, unbounded and needing access control. Open: a fixed set of clients each replacing its own finished job after a think time, bounded by the resulting feedback loop (the labels are simply swapped)",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide: open system - 'jobs are generated at some rate, and once each is processed, it leaves'; 'Sensible model for web requests'; 'Potentially unbounded (access control needed)'. Closed system - a fixed number of client sources, each generating a replacement job once its previous one finishes; 'Think time' is the wait between jobs; 'Potentially bounded (feedback loop)'.",
    },
    {
      type: "truefalse",
      prompt:
        "In the lecture's treatment of a closed system, because each client contributes a roughly constant load, the independent variable used when graphing performance is the number of clients, referred to as the multiprogramming level (MPL).",
      options: ["False", "True"],
      correctIndex: 1,
      modelAnswer:
        "True. The 'Understanding Performance Variations' slide: 'In closed system, each client usually gives constant load, so independent variable is the number of clients [multiprogramming level (MPL)].' Throughput or response time is the dependent variable.",
    },
    {
      type: "mcq",
      prompt:
        "The lecture defines two common figures of merit. Which statement matches both the definitions and where each is normally measured?",
      options: [
        "Throughput is work per unit time measured at the client only; response time is work per unit time measured at the server only, and the two should always be equal in a healthy system",
        "Throughput is the time from request submission to response receipt, measured at the client; response time is the number of jobs completed per second, measured at the server after network latency is removed",
        "Both are measured only at the server; throughput counts completed jobs and response time counts queued jobs, and neither figure includes any network or overhead time",
        "Throughput is the amount of work done per unit time (e.g. jobs/second), measured at the server or by summing across clients; response time is from request submission to response receipt, measured at the client so it includes overheads and latency",
      ],
      correctIndex: 3,
      modelAnswer:
        "'Throughput' slide: 'Amount of work done in a given time ... Either measure this at the server, or else add up information from all the clients.' 'Response Time' slide: 'Time from when request is submitted, till the response is received ... Usually measured at the client ... Includes overheads and latency.'",
    },
    {
      type: "mcq",
      prompt:
        "The lecture notes that in some applications the answer 'comes back in stages'. How does it distinguish response time from runtime in that case?",
      options: [
        "Response time is the server's own estimate while runtime is the client's measured value, differing only by clock skew between the two machines",
        "Response time is measured from sending the request until the first part of the response arrives; runtime is measured from the request until the entire response has been received",
        "Response time covers only the network hops while runtime covers only the server-side processing, and the two never overlap in time",
        "Response time applies to read jobs and runtime applies to update jobs; a single job is only ever described by one of the two",
      ],
      correctIndex: 1,
      modelAnswer:
        "'Response Time' slide: 'Response time is from when request is sent until the first part of the response arrives'; 'Runtime is measured from request until all the response has been received.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Figure of Merit' slide warns that a saturated system 'may show good throughput but poor response time', and that 'average response time might be OK but variance poor'. What design lesson does this point to?",
      options: [
        "A single averaged metric can hide unacceptable behaviour; you may need to state the figure of merit as, say, a bounded 99th-percentile response time while maximising throughput",
        "Throughput and response time are interchangeable, so measuring either one at the average is enough to characterise the system",
        "Variance in response time can always be removed by running the benchmark longer, after which the average alone is a complete description",
        "Once throughput is high the response time no longer matters, because users only notice how much total work the system completes",
      ],
      correctIndex: 0,
      modelAnswer:
        "Good throughput is high and good response time is low, but a saturated system can pair high throughput with poor, highly variable response time. 'Understanding Performance Variations' adds that we often 'aim for max throughput while keeping response time within a bound' and must decide whether that bound is on the average, the 99th percentile, or average +/- 1 standard deviation.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Measuring scalability' slide contrasts ideal and real speed-up when CPUs are added to a system doing an unchanging type of work. What does it say actually happens in practice, and why?",
      options: [
        "Throughput rises faster than proportionally and response time falls, because each new CPU also adds cache and memory bandwidth",
        "Throughput rises less than proportionally to the added resources and per-request response time increases, because of resource contention and queueing",
        "Throughput and response time both stay exactly on their ideal lines, because adding CPUs never introduces new coordination costs",
        "Throughput stays flat while response time falls linearly, because extra CPUs only help latency and never help capacity",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide: ideal - throughput increases proportionally, response time unaffected; in practice - 'Throughput increases (but ... less than proportional to amount of resources)', 'Response time ... in practice increases', with 'Deviations from ideal -> resource contention and queueing'. 'Averages are evil.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Measurement Principles' slide gives the weighted average (sum of w_i c_i) / (sum of w_i) and specifies what the weights w_i should be. In a workload made of several job classes, what are they?",
      options: [
        "The number of tables or resources each job class touches, so that broader jobs are weighted more heavily",
        "The number of occurrences of each job class, so that frequent classes count proportionally more toward the average",
        "The response time of each job class, so that slower classes are weighted up regardless of how often they occur",
        "One divided by the number of job classes, so that every class contributes equally to the average",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide: 'Weight should be number of occurrences of each type of job class.' This is exactly why weighting the tutorial's Q1 operations by seconds-between-arrivals rather than by how many run per hour is wrong.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Accuracy of Timers' slide says many timers have 'deceptively high precision but coarse resolution'. Which scenario is an example of exactly that?",
      options: [
        "A timer reporting values in nanoseconds whose reading also advances smoothly in single-nanosecond steps",
        "A timer reporting values in milliseconds that is wrong by a constant offset of exactly 10 ms on every reading",
        "A timer reporting values in nanoseconds (double-precision seconds) whose reading only changes once every 10 ms, jumping by 10 ms at a time",
        "A timer reporting values only in whole seconds whose reading also changes only once per second",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide: precision is 'how the value is reported' (ms, us, ns, double 'seconds'); resolution is 'how much the value jumps from one reading to another'; its example is 'Clock has a 10ms resolution ... Reading stays the same for a while, then increases by 10ms.' 'The value can't be trusted by more than the resolution.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Java Timing Functions' slide compares System.currentTimeMillis() and System.nanoTime(). Which description is accurate?",
      options: [
        "The two methods behave identically, including their resolution and their susceptibility to OS clock adjustments; the only difference is whether the returned long value is expressed in milliseconds or in nanoseconds",
        "currentTimeMillis() runs on all JDKs but its resolution is OS-dependent (roughly 1 ms on Linux and macOS, roughly 10 ms on Windows); nanoTime() (JDK 1.5+) uses the best precision the platform offers but guarantees no particular resolution",
        "currentTimeMillis() is guaranteed to have exactly 1 ms resolution on every operating system, and nanoTime() is guaranteed to have exactly 1 ns resolution on every operating system, regardless of the underlying hardware clock",
        "nanoTime() is the method available on all JDK versions and returns wall-clock time of day, whereas currentTimeMillis() was only added in JDK 1.5 and returns a monotonic counter whose resolution is fixed at 1 ms",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide: currentTimeMillis() is 'Standard (all JDK's)' but 'Has different resolutions depending on OS and platforms!' - its table lists Linux 1 ms, Mac OS X 1 ms, Windows 10 ms. nanoTime() 'In JDK 1.5 ... Always uses the best precision available on a system, but no guaranteed resolution.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Spring Boot Timers' slide shows @Timed(value = \"generic.task.timer\") on a service method, imported from io.micrometer.core.annotation. What is that annotation doing?",
      options: [
        "Marking the method as the single entry point the JVM's Flight Recorder will sample, disabling all other timing",
        "Using the Micrometer metrics library to record how long each call to that method takes, under the named timer 'generic.task.timer'",
        "Setting a hard timeout so the method is aborted if it runs longer than the value named by 'generic.task.timer'",
        "Scheduling the method to run automatically once per second, with 'generic.task.timer' naming the cron trigger",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide imports io.micrometer.core.annotation.Timed and annotates executeTask() with @Timed(value = \"generic.task.timer\"); Micrometer then times invocations of that method and publishes them under that timer name. It is an application-level instrumentation option alongside currentTimeMillis()/nanoTime() and OS performance counters.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Recording Data' slide asks how to record measurements from multi-threaded services. Which approach does it favour, and why?",
      options: [
        "Sampling just one thread and multiplying its counts by the size of the thread pool, to avoid synchronisation entirely",
        "Per-thread performance tables that are merged under lock protection only at the end, to avoid lock contention on a shared table during the run",
        "No in-memory tables at all; write every individual measurement straight to disk as it happens so nothing can be lost",
        "One shared performance table guarded by a global lock on every update, since correctness matters more than the contention that creates",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide raises 'Shared perf tables? Locking to ensure atomicity? Contention for perf tables?' and answers 'Per-thread perf tables, merged under lock protection (at end)'. It also says defer file writes until after the experiment (avoid file-system contention; buffering helps), don't measure the test harness, and keep metadata for reproducibility.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Gaining Confidence' slide says every measurement should be presented with a range interval, and that you 'won't get a narrow range for latency-based metrics once you get into the non-linear part of the performance curve'. Why not?",
      options: [
        "The non-linear region is where throughput is highest, and high throughput mechanically forces every response time to cluster tightly around the mean",
        "Range intervals apply only to throughput metrics; latency is a single deterministic number and cannot meaningfully be given a range at all",
        "Latency metrics near saturation become perfectly constant, so any remaining spread must be measurement error that more sampling cannot reduce",
        "Near saturation, small differences in load produce large, highly variable swings in response time, so many more samples are needed to pin the true average to a narrow band",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide: 'Measure it many times ... use statistics to get a good estimate of a range within which the true average lies'; 'For a narrow range, you need to sample many executions/transactions.' In the non-linear (contention/queueing) region response time varies widely, so the interval stays wide. Cf. Raj Jain, The Art of Computer Systems Performance Analysis.",
    },
    {
      type: "mcq",
      prompt:
        "The 'TPC Benchmarks' slide maps benchmark families to workload types. Which mapping is correct?",
      options: [
        "TPC-C and TPC-E measure OLTP systems (C an inventory scenario, E a brokerage scenario); TPC-H and TPC-DS measure decision-support/analytics systems on retailing scenarios",
        "TPC-C measures virtualized database consolidation; TPC-E, TPC-H and TPC-DS each measure a single-user desktop database",
        "All four of TPC-C, TPC-E, TPC-H and TPC-DS measure the same OLTP inventory workload and differ only in the vendor that published them",
        "TPC-C and TPC-E measure analytics/decision-support workloads; TPC-H and TPC-DS measure OLTP workloads on a brokerage dataset",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide: 'TPC-C and TPC-E - Measures the performance of OLTP systems (C: inventory scenario; E: brokerage scenario)'; 'TPC-H and TPC-DS - Performance decision support, analytics systems (retailing scenarios; H: items and orders; DS: customers and sales)'. TPC-VMS is the virtualized-consolidation one. TPC = Transaction Processing Council, a non-profit of commercial software vendors.",
    },
    {
      type: "mcq",
      promptDiagram:
        "flowchart LR\n  CE[\"Client emulator(s)\\none multithreaded process\\nemulating n clients\"] --> TN[\"Test Network\"]\n  TN --> SUT[\"System Under Test\\nserver + DB, may be\\nclustered / multi-tier\"]",
      prompt:
        "The diagram reproduces the lecture's 'Typical Client-Server Evaluation Setup'. Where are response time and throughput measured, and what does the slide insist about where the client emulator runs?",
      options: [
        "They are measured on the test network hardware; the client emulator and server must share a host so the network segment can be bypassed entirely",
        "They are measured at the client emulator(s); the slide insists the client emulator(s) must run on a separate machine from the server(s) so the measurement rig does not consume the SUT's resources",
        "They are measured inside the System Under Test itself; the client emulator should run on the same machine as the server to remove network latency from the numbers",
        "They are measured at the database only; the client emulator can run anywhere because its placement has no effect on the figures obtained",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide: 'Response time and throughput is measured here' - at the client emulator, 'often just one multithreaded client that emulates n concurrent clients'; 'The client emulator(s) should run on a separate machine than the server(s).' The SUT 'can be arbitrary complex; e.g. clustered servers or multi-tier architectures.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Concurrency' slide shows '1 job in 3 time units; 2 jobs in 4 time units', for jobs that each use CPU, then I/O, then CPU. What principle is it illustrating?",
      options: [
        "The CPU and disk must be used in strict alternation across the whole system, so at most one job can make progress at any instant",
        "Adding a second job always doubles total completion time, so concurrency is counterproductive whenever jobs share any resource",
        "Two jobs finish in 4 time units only because the second job skips its I/O phase entirely, which is not generally possible",
        "Running jobs concurrently lets one use the CPU while another waits on I/O, so overlapping their resource use raises throughput above running them one at a time",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide: 'A typical job will need different resources at different times ... We may get more throughput if there are more concurrent jobs, by overlapping time that each spends on different resources.' One job alone takes 3 units; two overlapped take 4, not 6.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Saturation' slide says you can roughly calculate how much load a resource can handle - an upper bound on system throughput - and that '80% is a common rule-of-thumb'. What caveat does it attach to that 80%?",
      options: [
        "It refers to 80% of the number of CPUs rather than 80% of any one resource's capacity, and only matters when scaling out",
        "It is a hard architectural limit enforced by the operating system, so a resource can never actually exceed 80% utilisation in practice",
        "It is an average-utilisation guideline, not a peak-utilisation one; a resource averaging 80% can still hit overload during peaks, depending on its overload characteristics",
        "It applies only to disk resources; CPU and network resources can safely be driven to 100% average utilisation with no loss of throughput",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide: past saturation 'performance will start to degrade with more concurrent requests'; '80% is a common rule-of-thumb' 'But remember overload characteristics of the resource as this will be average utilisation, not peak utilisation.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Admission Control' slide describes a feedback effect: 'More load makes things slower, which reduces the system capacity, which ... leads to Thrashing.' What is admission control's response, and what does the slide say about tuning it?",
      options: [
        "Speed up each job by giving it more CPU once the system is busy, which is easy to tune because the right limit follows directly from the CPU count",
        "Admit every job but lower all their priorities equally, a change that has almost no effect on overall performance either way",
        "Shed load by permanently disabling the slowest subsystem, a setting that only needs to be chosen once and never revisited",
        "Cap the number of jobs concurrently admitted (dropping or queuing the rest); choosing that limit well is a 'black art' with a huge impact on overall performance",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide: 'Limit the number of jobs that are concurrently allowed into a system ... Requests above this limit can be dropped or queued'; 'Setting the limit sensibly is often a black art ... Which has a huge impact on overall performance.' It exists to keep the system out of the non-linear scaling range.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Queues' slide says time spent waiting in a queue lengthens a job's response time, and that admission control 'stops queues growing indefinitely'. How does it contrast closed and open systems on this point?",
      options: [
        "Both closed and open systems have automatic feedback loops, so neither one ever needs admission control or request rejection",
        "Neither system can bound its queues; in both cases the only option is to add more of the saturated resource until the queue drains",
        "A closed system must explicitly reject requests once full, whereas an open system's queues are naturally bounded because new work stops arriving",
        "A closed system has an inherent feedback loop - a client waiting for its job cannot issue new ones - whereas an open system must explicitly reject requests once it is fully loaded",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide: 'Closed systems have inherent feedback loops - Waiting client can't issue more requests'; 'Open system needs to reject requests once system fully loaded.' Each resource has a queue selected FIFO, by priority, or by efficiency.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Distribution' slide compares jobs that arrive 'exactly one per 1.3 s' (each taking 1 s) with jobs that arrive 'average one per 1.3 s with a normal distribution'. What point is it making?",
      options: [
        "The variable arrivals actually give the better response time, because normally distributed gaps let the server catch up during the wider gaps faster than a fixed gap allows",
        "The two cases behave identically because they share the same average arrival rate, which confirms that only the mean of the arrival process ever matters when predicting response time",
        "With equal average arrival rates the steady stream never queues, but the variable stream sometimes bunches up, causing waits that cascade onto later jobs - so variability, not the mean alone, drives response time",
        "The steady arrivals overload the system while the variable arrivals do not, because a fixed 1.3 s gap is shorter than the 1 s service time once queueing overhead is added",
      ],
      correctIndex: 2,
      modelAnswer:
        "The slide: 'Even if two systems have the same average request arrival rate, the outcomes are different if the variability changes'; steady 1-per-1.3 s with 1 s service gives 'No queuing, ever', while normally distributed arrivals mean 'Sometimes a job will wait; ... the next job may then have to wait too.' 'Queues just even out peaks ... But resource capacity still cannot be exceeded.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Bottlenecks' slide says the bottleneck is 'which resource reaches saturation first', that adding resources elsewhere is useless (Amdahl's Law), and that relieving one bottleneck exposes another. It also contrasts stateless and stateful resources - how?",
      options: [
        "Stateful resources are easy to scale because their state tells the load balancer exactly where to send each request; stateless ones are hard because any copy could serve any request",
        "Stateless resources are easy to scale (add more identical copies and spread the load); stateful resources are harder, because their data must be kept consistent across copies",
        "Neither a stateless nor a stateful resource can be scaled by adding boxes; a bottleneck can only be relieved by replacing the saturated machine with a single faster one",
        "Both stateless and stateful resources are equally straightforward to scale out; the only practical difference is that a stateful box costs more to purchase and license",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide: 'Stateless resources are easy to scale'; 'Stateful resources are harder to scale.' Adding resources away from the bottleneck has 'No impact on performance (Amdahl's Law)', and 'Add enough resources, and some other bottleneck will appear.'",
    },
    {
      type: "mcq",
      prompt:
        "The 'Read caching' slide describes the algorithm - serve from cache if present, else evict older data by LRU, load from slow storage, and 'typically load larger chunks than a single request'. On what property does it say effective caching depends?",
      options: [
        "Disabling read-ahead, so that each request loads exactly the bytes asked for and never spends cache space on neighbours",
        "A high hit rate, which needs the workload to keep accessing the same or physically nearby data (locality / hot spots in a much larger dataset)",
        "A uniformly random access pattern across the whole dataset, so that every item is equally likely to already be cached",
        "A cache at least as large as the entire dataset, since anything smaller cannot raise the hit rate above roughly fifty percent",
      ],
      correctIndex: 1,
      modelAnswer:
        "The slide: 'Caching built on idea of uneven patterns of access ... Cache tries to find and hold hot spots'; 'Hit Rate needs to be high for effective caching - Must be frequently accessing same or physically close data'; then 'Average access time is close to that of fast cache when it works.' Loading multi-word lines/pages exploits spatial locality.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Middle-Tier Database Caching' slide puts a 'front-end' database local to each app server, kept loosely current by asynchronous (lazy) replication from the back-end, with 'no inter-cache sync'. The 'Cache Miss Costs' slide adds that an internal EJB cache hit is about 23x faster than back-end DB access and about 5x faster than the middle-tier DB cache. What overall picture do these two slides give?",
      options: [
        "A hierarchy of caches with increasing hit cost and decreasing locality - in-process cache, then middle-tier DB cache, then back-end DB - traded off against the staleness that lazy, un-synchronised replication allows",
        "A design in which the back-end master database is bypassed altogether once the middle-tier caches have warmed up, so the back end's much larger access latency stops mattering to response time",
        "A single shared cache used by every application server at once, kept strictly consistent by synchronous replication on every write, so a cache miss anywhere costs exactly the same as a miss anywhere else",
        "Evidence that middle-tier database caching should generally be avoided, because it is only about 5x faster than an in-process hit and that margin never justifies the extra operational complexity",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide: a front-end DB local to the app server gives a faster 'out-of-process cache hit'; 'Distributed cache consistency via lazy replication'; 'asynchronous replication' to the back-end; 'No inter-cache sync.' Cache Miss Costs: an EJB in-process hit is about 23x faster than the back-end DB and about 5x faster than the middle-tier DB cache - successive tiers are slower but larger, at the price of possible staleness.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Scaling state stores' slide lists a bigger box, replication and partitioning as options for scaling a stateful store. Which pairing of an option with its described mechanism is correct?",
      options: [
        "Partitioning: keep full copies of all data on every server and broadcast each change to all the others",
        "Replication: several servers each own a disjoint slice of the data, so every write goes to exactly one server and no copies exist",
        "Bigger box: split the data by key range across two machines, which is guaranteed to remove all lock contention and I/O limits",
        "Partitioning: several servers each own a slice of the data (e.g. customers A-M vs N-Z), ideally transparent to apps via something like partitioned views",
      ],
      correctIndex: 3,
      modelAnswer:
        "The slide: Replication - 'Multiple copies of shared data ... Change anywhere & send to everyone else'; Partitioning - 'Multiple servers, each looking after a part of the state store ... Separate customers A-M & N-Z ... Preferably transparent to apps e.g. SQL/Server partitioned views'; Bigger box - 'Could hit lock contention or I/O limits.' The options can also be combined.",
    },
    {
      type: "mcq",
      prompt:
        "The 'Performance Is Everything?' slide argues that at cloud scale the figure of merit shifts. To what, and why?",
      options: [
        "Toward work done per watt and toward utilisation and availability, because data-centre cost is dominated by power and cooling and automated ops make people costs a small component",
        "Toward lines of code shipped per week, because at cloud scale developer output is the main constraint on delivering features",
        "Toward peak throughput on a published benchmark, because cloud customers choose providers almost entirely on benchmark records",
        "Toward raw single-thread latency, because cloud providers bill per request and lower latency directly cuts the number of servers billed",
      ],
      correctIndex: 0,
      modelAnswer:
        "The slide: 'Costs of data center (DC) are dominated by power and cooling infrastructure'; 'Optimise for work done/Watt'; 'Optimise for utilisation & availability'; 'System design + automated ops -> people costs small component.'",
    },
    {
      type: "short",
      prompt:
        "The 'Response time and resources' slide splits each transaction's time into processor time, I/O time and wait time for shared resources, and says response time 'varies with the heaviness of transactions - fast read-only transactions, slower update transactions'. Using Week 4's two-phase-commit bank example, explain why a distributed update transaction is 'heavy' in these terms.",
      modelAnswer:
        "A 2PC transfer does processor and I/O work at the coordinator (Central Bank) and at every participant bank, and adds several network round trips (prepare, then commit or rollback). Crucially it holds locks / pending state on each account from the prepare phase until the global commit decision arrives, so its 'wait time for shared resources' is long and it makes other transactions on those accounts wait too. A read-only lookup touches one node, holds nothing, and returns immediately. So the distributed update sits at the heavy end of the slide's spectrum, and contention from many such updates degrades response time for everyone.",
    },
    {
      type: "short",
      prompt:
        "A three-tier system (web servers, stateless app servers, one database) is saturating. Measurements show the database disk is the first resource to hit about 100% while CPUs everywhere sit at about 30%. Using the lecture's bottleneck and scale-out principles, what should and should not be done?",
      modelAnswer:
        "The database disk is the bottleneck - the resource that saturates first. Adding web or app servers, or more app-server CPU, does nothing for throughput (Amdahl's Law: capacity added away from the bottleneck). Effort should go to the bottleneck: faster or more disks and a larger DB cache to cut the number of I/Os, then, if needed, scale the stateful store by partitioning (e.g. split customers across DB servers) or replication for read load. Expect that relieving the disk will just move the bottleneck (DB CPU, locks, or the network), so measure again. The stateless tiers stay easy to scale later; the stateful DB is the hard part.",
    },
    {
      type: "scenario",
      prompt:
        "Final-exam style: a closed-system load test plots throughput and mean response time against MPL (number of clients). Throughput rises almost linearly to MPL about 40, flattens by MPL about 60, and dips slightly beyond MPL about 90; mean response time is flat to MPL about 40, then climbs steeply, and its variance grows fast past MPL about 60. The stakeholder asks for 'maximum throughput'. Advise them, using the lecture's concepts of saturation, figure of merit, response-time bounds and admission control.",
      modelAnswer:
        "Peak throughput is around MPL 60-90, but that is a saturated region: mean response time there is already several times its unloaded value and its variance is large, so many individual requests are far worse than the mean ('averages are evil'). The right figure of merit is maximum throughput subject to a response-time bound - e.g. a bounded 95th/99th percentile - not raw throughput. That points to operating near MPL about 40, the knee of the curve, where throughput is close to peak but response time is still flat and predictable. Enforce it with admission control: cap concurrent jobs near the knee and queue or reject the rest, so extra load cannot push the system into the non-linear region and trigger thrashing. Beyond MPL about 90 throughput actually falls, so more clients are strictly worse.",
    },
    {
      type: "truefalse",
      prompt:
        "According to the Week 5 lecture's 'common questions from last week' section, Assignment 1 is an in-class timed quiz sat during the Week 7 tutorial.",
      options: ["False", "True"],
      correctIndex: 0,
      modelAnswer:
        "False. The lecture clarified: 'Assessment 1 is not an in-class quiz. It is an individual take-home assessment covering material from Weeks 1-6', and you may type or handwrite your answers and submit them as a single PDF via Canvas.",
    },
    {
      type: "short",
      prompt:
        "The lecture says adding concurrent jobs can raise throughput (by overlapping CPU and I/O), yet also that beyond saturation more concurrent jobs degrade performance and can cause thrashing. Explain how both claims are true at once.",
      modelAnswer:
        "While the bottleneck resource still has spare capacity, a second job can use it during another job's wait on a different resource (1 job in 3 units, 2 jobs in 4). Once that resource is fully utilised there is no spare capacity to overlap into, so extra concurrent jobs only lengthen queues and add contention and scheduling overhead - the non-linear region that admission control exists to keep the system out of.",
    },
  ],
};

export const WEEK_5_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];
