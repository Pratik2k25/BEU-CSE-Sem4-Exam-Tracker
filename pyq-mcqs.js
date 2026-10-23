/* Source-derived MCQ catalogue.
 * Original paper wording/options were transcribed from the user-supplied scan.
 * Answers were independently checked against standard course knowledge; the
 * supplied papers do not include an official answer key. Semester/code mismatches
 * are explicitly labeled supplementary instead of being promoted as current PYQs.
 */
(()=>{
 const D=window.STUDY_DATA;
 if(!D || !Array.isArray(D.questions)) return;
 const CURRENT_CODES={CN:"105406",COA:"105401",FLAT:"105402",DBMS:"105404",DAA:"105403",ETC:"105405"};
 const ordinal=n=>n===1?"1st":n===2?"2nd":n===3?"3rd":n+"th";
 const allSource=[];
 function add(x){
   // These additional question statements were prepared from syllabus concepts.
   // Until the original wording/options are reconciled line-by-line with the scan,
   // keep them as curated practice and do not attach guessed paper/year/page metadata.
   const q={
     id:x.id.replace(/^pyq-/,"curated-mcq-"),s:x.s,type:"MCQ",q:x.q,o:x.o,a:x.a,e:x.e,
     marks:x.marks||2,sourceType:"Curated practice · not verbatim PYQ",
     verifiedSource:false,answerVerified:true,
     answerVerification:"Answer checked against standard subject knowledge; question is curated practice, not a verified verbatim PYQ.",
     topicId:x.topicId||null,priority:x.priority||"Medium",difficulty:x.difficulty||"Medium",
     originalWording:false,sourceConfidence:"not-a-source-transcription"
   };
   D.questions.push(q);allSource.push(q);
 }
 // COMPUTER ORGANIZATION & ARCHITECTURE — current 4th-semester papers.
 // Source PDF pages 1, 3, 5 and 7 respectively: papers for 2025, 2024, 2023 and 2022.
 const C25={s:"COA",year:2025,semester:4,code:"105401",pdfPage:1,paper:"B.Tech 4th Semester Examination, 2025"};
 [
  ["a","The unit responsible for fetching, decoding, and executing instructions is:",["ALU","Memory Unit","Control Unit","I/O Unit"],2,"The control unit sequences instruction fetch/decode and coordinates execution.", "COA-0-1","Easy"],
  ["b","Which addressing mode uses the contents of a register to determine the effective address?",["Indexed addressing","Indirect addressing","Direct addressing","Immediate addressing"],1,"Indirect (including register-indirect) addressing obtains the effective address through a register or memory pointer.", "COA-0-2","Medium"],
  ["c","Two's-complement representation is primarily used for:",["Signed integers","Instruction opcodes","ASCII characters","Floating-point exponents"],0,"Two's complement is the standard representation for signed binary integers.", "COA-1-0","Easy"],
  ["d","Booth's algorithm is used for:",["Floating-point division","Character encoding","Integer multiplication","Cache replacement"],2,"Booth recoding reduces the additions/subtractions needed for signed binary multiplication.", "COA-1-2","Easy"],
  ["e","In floating-point representation, the part that represents significant digits is the:",["Mantissa / significand","Sign bit","Exponent","Bias"],0,"The significand (traditionally called mantissa) stores the precision-bearing digits.", "COA-1-4","Easy"],
  ["f","The x86 instruction-set architecture is traditionally classified as:",["RISC","CISC","MISD","SIMD only"],1,"The x86 ISA is generally classified as CISC, even though modern processors internally translate instructions.", "COA-0-2","Easy"],
  ["g","Which memory technology is commonly used for main memory?",["Magnetic tape","Flash ROM only","DRAM","Optical disk"],2,"Main memory is typically implemented with dynamic RAM (DRAM).", "COA-2-3","Easy"],
  ["h","The acronym DMA means:",["Direct Memory Access","Data Memory Address","Dynamic Module Allocation","Direct Machine Arithmetic"],0,"DMA transfers data between an I/O device and memory with reduced CPU involvement.", "COA-3-1","Easy"],
  ["i","A pipeline stall caused by a hardware resource conflict is a:",["Control hazard","Structural hazard","Data value","Branch target"],1,"A structural hazard occurs when concurrent pipeline stages need the same unavailable hardware resource.", "COA-4-1","Medium"],
  ["j","Which addressing mode places the operand value directly in the instruction?",["Immediate addressing","Direct addressing","Indirect addressing","Indexed addressing"],0,"Immediate addressing stores the literal operand in the instruction.", "COA-0-2","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...C25,id:"pyq-coa-2025-"+id,q,o,a,e,topicId,difficulty}));
 const C24={s:"COA",year:2024,semester:4,code:"105401",pdfPage:3,paper:"B.Tech 4th Semester Examination, 2024"};
 [
  ["a","What is the first step in the instruction-execution cycle?",["Decode","Execute","Fetch","Store"],2,"The processor fetches the instruction before decoding and executing it.","COA-0-1","Easy"],
  ["b","What is the main advantage of a carry-look-ahead adder over a ripple-carry adder?",["Simpler design","Higher latency","Reduced power in every case","Faster addition by reducing carry-propagation delay"],3,"Carry-look-ahead logic computes carry signals in parallel, reducing carry-chain delay.","COA-1-1","Medium"],
  ["c","Which control unit is generally faster but more difficult to modify?",["Hardwired control unit","Microprogrammed control unit","Cache control unit","Memory-management unit"],0,"Hardwired control uses fixed logic; it is often faster but less flexible to change.","COA-2-1","Easy"],
  ["d","Which I/O transfer method has the CPU poll the device until it is ready?",["DMA","Interrupt-driven I/O","Program-controlled I/O","Asynchronous I/O only"],2,"In program-controlled (polled) I/O, the CPU repeatedly checks the device status.","COA-3-1","Easy"],
  ["e","Branch prediction primarily helps reduce which pipeline problem?",["Data hazards","Structural hazards","Control hazards","Memory capacity"],2,"Branch prediction reduces stalls associated with uncertain control flow.","COA-4-1","Easy"],
  ["f","Which is NOT one of Flynn's classic parallel-computer classes?",["SIMD","SISD","MIMD","MISD"],1,"SISD is the single-instruction, single-data class, conventionally sequential rather than a parallel class.","COA-4-2","Medium"],
  ["g","Which cache replacement policy removes the block that has been unused for the longest time?",["FIFO","Least recently used (LRU)","Least frequently used (LFU)","Random"],1,"LRU replaces the line whose most recent access is furthest in the past.","COA-5-3","Easy"],
  ["h","Which technique can handle pipeline data hazards without increasing clock frequency?",["Increase memory capacity","Instruction scheduling","Add more cache lines","Change the number base"],1,"Instruction scheduling reorders independent instructions where legal to avoid or reduce data stalls.","COA-4-1","Medium"],
  ["i","Which address mode uses a literal operand encoded in the instruction?",["Direct","Immediate","Indirect","Indexed"],1,"Immediate addressing encodes the operand value itself in the instruction.","COA-0-2","Easy"],
  ["j","A 32-bit data bus is built using 4K × 8-bit RAM chips. What capacity results from four chips in parallel?",["4 KB","8 KB","16 KB","32 KB"],2,"Four 8-bit chips form a 32-bit word; 4K words × 4 bytes per word = 16 KiB.","COA-2-3","Medium"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...C24,id:"pyq-coa-2024-"+id,q,o,a,e,topicId,difficulty}));
 const C23={s:"COA",year:2023,semester:4,code:"105401",pdfPage:5,paper:"B.Tech 4th Semester Examination, 2023"};
 [
  ["a","A pipeline stage is best described as:",["A sequential circuit only","A combinational circuit only","A combination of combinational logic and sequential storage","None of these"],2,"Pipeline stages combine logic with registers or other sequential storage between stages.","COA-4-0","Medium"],
  ["b","A direct-mapped cache with n cache lines is equivalent to which set-associative organization?",["0-way set associative","2-way set associative","1-way set associative","n-way set associative"],2,"Direct mapping is the 1-way set-associative case.","COA-5-1","Easy"],
  ["c","Pipelined-processor performance can suffer when:",["Pipeline stages have unequal delays","Consecutive instructions depend on one another","Pipeline stages contend for a shared resource","All of the above"],3,"Unequal stage delays, data/control dependencies, and structural conflicts can all limit pipeline performance.","COA-4-1","Medium"],
  ["d","Which Flynn classification is generally considered to have little practical use?",["SISD","MISD","SIMD","MIMD"],1,"MISD is a rarely used architectural category in practical general-purpose systems.","COA-4-2","Medium"],
  ["e","A key advantage of a microprogrammed control unit is that it:",["Is always faster than hardwired logic","Makes new instructions easier to implement","Cannot be changed","Eliminates control memory"],1,"Microprogrammed control provides flexibility by expressing control signals through microinstructions.","COA-2-1","Easy"],
  ["f","In memory-mapped I/O, memory and I/O devices:",["Always use separate address spaces","Share the processor's address space","Cannot use load/store instructions","Require only DMA"],1,"Memory-mapped I/O assigns device registers addresses in the same address space used for memory.","COA-3-1","Medium"],
  ["g","The processor stall due to an unavailable shared hardware resource is a:",["Control hazard","Structural hazard","Syntax hazard","Cache replacement"],1,"A resource conflict is classified as a structural hazard.","COA-4-1","Easy"],
  ["h","The addressing mode in which the operand value is stated in the instruction is:",["Immediate","Direct","Indirect","Relative"],0,"Immediate addressing encodes a literal value rather than a memory address.","COA-0-2","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...C23,id:"pyq-coa-2023-"+id,q,o,a,e,topicId,difficulty}));
 const C22={s:"COA",year:2022,semester:4,code:"105401/106401",pdfPage:7,paper:"B.Tech 4th Semester Examination, 2022 (New Course)"};
 [
  ["c","A device used to connect a peripheral to a computer bus is called a:",["Control register","Communication protocol","Interface","None of these"],2,"An I/O interface adapts the peripheral's signals and protocol to the system bus.","COA-3-0","Easy"],
  ["d","Array processors are commonly associated with which Flynn category?",["SISD","SIMD","MISD","MIMD only"],1,"Array processors apply the same operation to multiple data elements, a classic SIMD pattern.","COA-4-2","Medium"],
  ["e","Which component holds data and instructions temporarily until the CPU needs them?",["ROM only","Control unit","Main memory","Coprocessor"],2,"Main memory stores currently active programs and data for CPU access.","COA-2-3","Easy"],
  ["f","For an ideal k-stage pipeline with no stalls, the cycles for n tasks are:",["n + k − 1","n × k","n − k + 1","n × (k − 1)"],0,"The first result needs k cycles; each later result adds one cycle, giving k+n−1.","COA-4-0","Medium"],
  ["g","Which data hazard is not possible in a conventional in-order pipeline?",["WAR (write after read)","RAW (read after write)","RAR (read after read)","WAW (write after write)"],2,"Read-after-read creates no write dependency; it is not a true data hazard.","COA-4-1","Medium"],
  ["h","Which character encoding uses an 8-bit code and appears in the supplied paper's options?",["ASCII","EBCDIC","ANCI","USCI"],1,"EBCDIC is an 8-bit character-encoding family; standard ASCII is 7-bit.","COA-0-0","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...C22,id:"pyq-coa-2022-"+id,q,o,a,e,topicId,difficulty}));
 // COMPUTER NETWORKS — source questions are from 6th-semester papers (course 100602),
 // so they are authentic networking PYQs but supplementary to the current 4th-semester course.
 const N26={s:"CN",year:2026,semester:6,code:"100602",pdfPage:11,paper:"B.Tech 6th Semester Examination, 2026"};
 [
  ["a","Wavelength Division Multiplexing is primarily associated with:",["Copper cables","Optical-fibre communication","Radio communication only","Coaxial cables"],1,"WDM carries multiple optical wavelengths over an optical-fibre system.","CN-1-3","Easy"],
  ["b","A code has minimum Hamming distance dmin = 5. What is the maximum number of bit errors it can guarantee detecting?",["2","3","4","5"],2,"A code with minimum distance d detects up to d−1 errors, so 5−1 = 4.","CN-2-0","Medium"],
  ["c","In stop-and-wait ARQ, if the acknowledgement for frame 5 is not received before timeout, the sender should:",["Retransmit frame 5","Discard all previous frames","Move directly to frame 6","Restart the entire connection"],0,"The sender retransmits the outstanding frame when its timer expires.","CN-2-1","Easy"],
  ["d","Which statement correctly compares IPv4 and IPv6 address lengths?",["IPv4 128 bits; IPv6 32 bits","Both are 32 bits","IPv4 32 bits; IPv6 128 bits","Both are 128 bits"],2,"IPv4 addresses are 32 bits; IPv6 addresses are 128 bits.","CN-3-0","Easy"],
  ["e","A host knows another host's IPv4 address on the same LAN but not its MAC address. What does it do first?",["Send a DNS request","Broadcast an ARP request","Send an ICMP redirect","Start TCP"],1,"ARP resolves a local IPv4 address to the destination's link-layer MAC address.","CN-3-1","Easy"],
  ["f","Which transport protocol provides reliable, ordered byte-stream delivery with retransmission?",["UDP","ARP","TCP","DHCP"],2,"TCP provides reliable, in-order byte-stream delivery using acknowledgements and retransmissions.","CN-4-0","Easy"],
  ["g","Which application-layer service resolves a domain name such as www.example.com to an IP address?",["DNS","FTP","TELNET","SNMP"],0,"DNS resolves host/domain names to resource records including IP addresses.","CN-5-0","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...N26,id:"pyq-cn-2026-"+id,q,o,a,e,topicId,difficulty}));
 const N25={s:"CN",year:2025,semester:6,code:"100602",pdfPage:13,paper:"B.Tech 6th Semester Examination, 2025"};
 [
  ["a","Which OSI layer handles data representation and encryption?",["Session","Data Link","Presentation","Application"],2,"The presentation layer is responsible for representation/translation and commonly associated data encryption and compression.","CN-0-1","Easy"],
  ["b","Which network topology generally offers the highest path redundancy?",["Bus","Star","Mesh","Ring"],2,"A full mesh has multiple alternative paths between nodes, although it is costly to deploy.","CN-0-0","Easy"],
  ["c","In stop-and-wait ARQ, when does a sender normally retransmit an unacknowledged frame?",["Immediately after sending any frame","When its timer expires","Only after a DNS lookup","Only when a router asks"],1,"A timeout without an acknowledgement triggers retransmission of the outstanding frame.","CN-2-1","Easy"],
  ["d","Which access method listens to the medium before transmitting in the listed options?",["Slotted ALOHA","CSMA/CA","Token passing","Pure ALOHA"],1,"CSMA/CA senses the channel and uses collision-avoidance procedures before transmission.","CN-2-2","Medium"],
  ["e","ARP is used to map:",["An IP address to a MAC address","A MAC address to a domain name","A port to a process name","A URL to a file"],0,"ARP resolves an IPv4 address to a local link-layer address.","CN-3-1","Easy"],
  ["f","Which protocol is traditionally used for remote terminal login?",["SMTP","FTP","HTTP","TELNET"],3,"TELNET provides remote terminal access; it is insecure compared with modern SSH.","CN-5-1","Easy"],
  ["g","What is the length of an IPv6 address?",["32 bits","64 bits","128 bits","256 bits"],2,"IPv6 addresses are 128 bits long.","CN-3-0","Easy"],
  ["h","The primary purpose of a network firewall is:",["Error correction","Data compression","Network security/access control","Traffic encoding"],2,"Firewalls enforce traffic rules between network zones to reduce unauthorized access.","CN-5-2","Easy"],
  ["i","OSI stands for:",["Open Service Internet","Open Server Implementation","Operating System Interface","Open Systems Interconnection"],3,"OSI means Open Systems Interconnection.","CN-0-1","Easy"],
  ["j","Which item in the question's list is not a network device: hub, bridge, switch, or:",["Hub","Bridge","Switch","None of these"],3,"Hub, bridge and switch are all network devices, so none of the listed devices is the exception.","CN-2-5","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...N25,id:"pyq-cn-2025-"+id,q,o,a,e,topicId,difficulty}));
 const N24={s:"CN",year:2024,semester:6,code:"100602",pdfPage:15,paper:"B.Tech 6th Semester Examination, 2024"};
 [
  ["a","Which of the following are transmission media: (1) twisted-pair cable, (2) microwaves/satellite signals, (3) repeaters, (4) analog transmission, (5) fibre optics?",["(1) and (5)","(1) and (2)","(1), (2) and (5)","(1), (2), (3) and (5)"],2,"Twisted pair, microwave/satellite links and fibre are media; repeaters are devices and analog transmission is a signaling method.","CN-1-4","Medium"],
  ["b","On a simplex data link, which listed method can provide error recovery without a reverse acknowledgement channel?",["Backward error correction (BEC)","Hamming codes","Automatic Repeat Request (ARQ)","Downward error correction"],1,"Forward error-correcting codes such as Hamming codes permit correction at the receiver without retransmission feedback.","CN-2-0","Medium"],
  ["c","If two systems use different protocol suites and need interconnection, which device is appropriate?",["Repeater","Gateway","Bridge","Hub"],1,"A gateway can translate between differing protocols, unlike a repeater or basic bridge.","CN-2-5","Medium"],
  ["d","Which is not a physical transmission medium used by IEEE 802.3 Ethernet?",["Thin coaxial cable","Twisted pair","Microwave radio link","Fibre-optic cable"],2,"Ethernet media include copper and fibre; a microwave radio link is not an 802.3 wired Ethernet medium.","CN-2-5","Easy"],
  ["e","Which option is a syntactically valid dotted-decimal IPv4 address?",["128.64.0.0","127.201.3.1.52","01.200.128.123","300.142.210.64"],0,"128.64.0.0 has four octets in the 0–255 range; the other options contain too many octets or out-of-range/nonstandard leading-zero notation.","CN-3-0","Medium"],
  ["f","In the TCP/IP model, the layer corresponding most closely to the OSI transport layer is called:",["Host-to-host / transport","Internet","Application","Network access"],0,"TCP and UDP operate at the TCP/IP transport (host-to-host) layer.","CN-4-0","Easy"],
  ["g","In the standard service-port list, port 110 is associated with:",["SMTP","FTP","POP3","Telnet"],2,"TCP port 110 is the conventional POP3 service port.","CN-5-1","Easy"],
  ["h","When an outgoing mail server connects to another server to send a message using SMTP, it acts as the SMTP:",["Server only","Client","POP endpoint","DNS resolver"],1,"The initiating mail-transfer agent acts as the SMTP client for that connection.","CN-5-1","Medium"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...N24,id:"pyq-cn-2024-"+id,q,o,a,e,topicId,difficulty}));
 const N23={s:"CN",year:2023,semester:6,code:"100602",pdfPage:17,paper:"Bihar Engineering University End Semester Examination, 2023 — Computer Networks"};
 [
  ["a","For total internal reflection in an optical fibre, the core must be optically ____ than the cladding.",["Denser","Less dense","The same optical density","Unrelated to the cladding"],0,"The core has a higher refractive index (is optically denser) than the cladding.","CN-1-4","Medium"],
  ["b","The sliding-window protocol is commonly used for:",["Error control only","Session control","Flow control","Concurrency control"],2,"Sliding-window protocols regulate how much unacknowledged data may be in flight and can also support error control.","CN-2-1","Easy"],
  ["c","TCP connection establishment uses a ____-way handshake.",["One","Two","Three","Four"],2,"TCP normally establishes a connection with SYN, SYN-ACK and ACK.","CN-4-0","Easy"],
  ["d","Which is the inter-domain routing protocol?",["RIP","BGP","OSPF","ICMP"],1,"BGP exchanges routing information between autonomous systems.","CN-3-3","Easy"],
  ["e","In NRZ-I encoding, a transition at the start of a bit interval conventionally represents:",["A 0","A 1","Both bits always","A parity error"],1,"In the common NRZ-I convention, a 1 is represented by a transition and a 0 by no transition.","CN-1-2","Medium"],
  ["f","UDP is a ____ transport protocol.",["Connection-oriented","Connectionless","Circuit-switched","Reliable byte-stream"],1,"UDP is connectionless and does not guarantee delivery or ordering.","CN-4-0","Easy"],
  ["g","Which protocol maps a physical MAC address to its corresponding IPv4 address?",["ARP","RARP","ICMP","IMAP"],1,"RARP historically mapped a known hardware address to an IPv4 address; ARP performs the opposite mapping.","CN-3-1","Medium"],
  ["h","Process-to-process delivery is primarily the responsibility of which TCP/IP layer?",["Transport","Network access","Physical","Presentation"],0,"Transport-layer protocols identify application endpoints using port numbers.","CN-4-0","Easy"],
  ["i","Which medium-access method is associated with IEEE 802.5 networks?",["CSMA/CD","Token bus","Token ring","Slotted ALOHA"],2,"IEEE 802.5 defines token-ring networking.","CN-2-2","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...N23,id:"pyq-cn-2023-"+id,q,o,a,e,topicId,difficulty}));
 // DATABASE MANAGEMENT SYSTEM — source paper is labelled 5th semester and the printed
 // code does not match the current 4th-semester DBMS code, so every item is supplementary.
 const DB25={s:"DBMS",year:2025,semester:5,code:"105402",pdfPage:22,paper:"B.Tech 5th Semester Examination, 2025 — Database Management System"};
 [
  ["a","Which statement about a weak entity set is correct?",["Every weak entity depends on an owner/strong entity","A weak entity must always have a complete key of its own","A weak entity cannot participate in a relationship","Every weak entity is a superkey"],0,"A weak entity is identified using an owner entity's key together with its partial key.","DBMS-0-2","Medium"],
  ["b","For R(A,B,C) with only the functional dependencies A→B and B→A, which statement is necessarily true?",["A alone is a candidate key","B alone is a candidate key","Neither A nor B alone determines C","Both A and B alone are candidate keys"],2,"The stated dependencies connect A and B but provide no dependency that determines C.","DBMS-1-2","Medium"],
  ["c","In relational algebra, which operation is most naturally used to find students enrolled in all courses in a given course relation?",["Selection","Projection","Division","Union"],2,"Relational division models a 'for all' query such as entities related to every tuple in another relation.","DBMS-1-0","Medium"],
  ["d","A relation is in BCNF when:",["Every non-prime attribute depends on a key","Every determinant of a non-trivial functional dependency is a superkey","It contains no foreign keys","Every table has exactly one candidate key"],1,"BCNF requires every non-trivial determinant to be a superkey.","DBMS-1-3","Medium"],
  ["e","When query predicates require exact equality lookups, which index strategy can be especially suitable in many cases?",["Hashing","Full table scan only","A queue","A network bridge"],0,"Hash indexes are often effective for equality lookup, though not for general range scans.","DBMS-2-1","Medium"],
  ["f","Under strict two-phase locking, exclusive locks are normally held until:",["The next SQL statement","Commit or abort","The first read","The transaction starts"],1,"Strict 2PL retains exclusive locks until the transaction commits or aborts, preventing dirty reads of its writes.","DBMS-3-2","Medium"],
  ["g","Which SQL security threat occurs when untrusted input is interpreted as part of a query?",["Hash collision","SQL injection","Index fragmentation","Deadlock only"],1,"SQL injection manipulates query text through inadequately parameterized input.","DBMS-4-2","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...DB25,id:"pyq-dbms-2025-"+id,q,o,a,e,topicId,difficulty}));
 // DESIGN & ANALYSIS OF ALGORITHMS — scanned paper's subject heading is DAA, but
 // its course code (105402) conflicts with the current subject code 105403.
 const DA25={s:"DAA",year:2025,semester:4,code:"105402",pdfPage:24,paper:"B.Tech 4th Semester Examination, 2025 — Design & Analysis of Algorithms"};
 [
  ["a","An algorithm is considered finite if:",["It uses minimum memory","It produces correct output for every input","It has finite input size only","It terminates after a finite number of steps"],3,"Finiteness means the procedure terminates after a finite number of steps for valid inputs.","DAA-0-0","Easy"],
  ["b","What is the maximum number of swaps performed by selection sort on n elements?",["n − 1","n","n log n","n²"],0,"Selection sort performs at most one swap per pass over the first n−1 positions.","DAA-1-0","Medium"],
  ["c","The time complexity of Strassen's matrix multiplication is approximately:",["O(n³)","O(n²·⁸¹)","O(n log n)","O(2ⁿ)"],1,"Strassen's recurrence T(n)=7T(n/2)+O(n²) gives exponent log₂7 ≈ 2.807.","DAA-1-2","Medium"],
  ["d","Which problem cannot, in general, be solved optimally by the standard greedy method?",["Minimum spanning tree","Job sequencing with deadlines","Fractional knapsack","0/1 knapsack"],3,"The ordinary greedy ratio strategy is optimal for fractional knapsack but not for general 0/1 knapsack.","DAA-2-2","Medium"],
  ["e","The main purpose of branch-and-bound for a minimization problem is to:",["Enumerate every solution without pruning","Use bounds to prune subproblems that cannot beat the incumbent","Convert every problem to a sorting problem","Avoid objective functions"],1,"A valid bound lets the algorithm discard a branch that cannot improve the best solution found so far.","DAA-2-0","Medium"],
  ["f","In matrix-chain multiplication dynamic programming, the DP table stores:",["The minimum scalar multiplication cost for each subchain","Only the largest matrix element","The determinant of each matrix","The output matrix itself for every split"],0,"The DP entry records the minimum scalar multiplication cost of parenthesizing a chain segment.","DAA-3-1","Medium"],
  ["g","Topological sorting is applicable to:",["Directed acyclic graphs","Undirected graphs only","Every cyclic graph","Complete graphs only"],0,"A topological ordering exists exactly for a directed acyclic graph (DAG).","DAA-4-3","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...DA25,id:"pyq-daa-2025-"+id,q,o,a,e,topicId,difficulty}));
 // FORMAL LANGUAGE & AUTOMATA THEORY — scanned papers are 5th-semester papers
 // (code 105503), not current 4th-semester FLAT (105402).
 const F25={s:"FLAT",year:2025,semester:5,code:"105503",pdfPage:27,paper:"B.Tech 5th Semester Examination, 2025 — Formal Language & Automata Theory"};
 [
  ["a","Which is a basic element used to form strings in a formal language?",["Grammar","Alphabet","String","Production"],1,"An alphabet is a finite set of symbols from which strings are formed.","FLAT-0-0","Easy"],
  ["b","A formal language over an alphabet Σ is a set of:",["Alphabet symbols only","Strings over Σ","Grammars only","Automata only"],1,"A language is a set of finite strings over its alphabet.","FLAT-0-0","Easy"],
  ["c","Which Chomsky-hierarchy grammar class is the most general?",["Type 3","Type 2","Type 1","Type 0"],3,"Type-0 unrestricted grammars are the most general class in the Chomsky hierarchy.","FLAT-0-1","Easy"],
  ["d","Which model is equivalent in expressive power to context-free grammars?",["Linear bounded automata","Pushdown automata","Finite automata","Counter-free automata"],1,"Nondeterministic pushdown automata recognise exactly the context-free languages.","FLAT-2-2","Easy"],
  ["e","The pumping lemma for context-free languages is commonly used to prove that a language:",["Is regular","Is not context-free","Is finite","Is accepted by every DFA"],1,"The CFL pumping lemma provides a necessary property used to show a language is not context-free.","FLAT-2-4","Medium"],
  ["f","Recursively enumerable languages are also known as:",["Turing-recognizable languages","Regular languages","Context-free languages","Always-decidable languages"],0,"A Turing machine may recognize a recursively enumerable language but need not halt on nonmembers.","FLAT-4-1","Medium"],
  ["g","The Halting Problem for Turing machines is:",["Decidable","Undecidable","Regular","Context-free"],1,"There is no algorithm that decides for every machine/input pair whether the machine halts.","FLAT-5-3","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...F25,id:"pyq-flat-2025-"+id,q,o,a,e,topicId,difficulty}));
 const F24={s:"FLAT",year:2024,semester:5,code:"105503",pdfPage:29,paper:"B.Tech 5th Semester Examination, 2024 — Formal Language & Automata Theory"};
 [
  ["a","In the Chomsky hierarchy, regular languages correspond to:",["Type 0","Type 1","Type 2","Type 3"],3,"Regular grammars are Type-3 grammars.","FLAT-0-1","Easy"],
  ["b","The pumping lemma for regular languages is commonly used to prove that a language is:",["Regular","Not regular","Finite","Generated by every CFG"],1,"The lemma is a necessary property of regular languages and is used to prove non-regularity by contradiction.","FLAT-1-5","Medium"],
  ["c","Which normal form is widely used as a standard form for context-free grammar parsing algorithms?",["Chomsky Normal Form","Greibach hierarchy","DFA normal form","Pumping form"],0,"CNF restricts productions to A→BC or A→a (with a special start-symbol exception where needed).","FLAT-2-1","Medium"],
  ["d","An ambiguous context-free grammar has at least one string with:",["No derivation","Two distinct parse trees","Only finite derivations","No terminal symbols"],1,"Ambiguity means a string has more than one distinct parse tree (equivalently, distinct leftmost derivations).","FLAT-2-3","Easy"],
  ["e","Which statement about context-free languages is correct?",["They are closed under union","They are closed under arbitrary intersection","They are closed under complement","They are all regular"],0,"CFLs are closed under union; they are not closed under arbitrary intersection or complement.","FLAT-2-5","Medium"],
  ["f","Which of the following is an undecidable problem?",["Whether a DFA accepts a given string","Whether a TM halts on an input","Whether two DFAs accept the same language","Whether a DFA language is empty"],1,"The Turing-machine halting problem is undecidable; the listed DFA questions are decidable.","FLAT-5-3","Medium"],
  ["g","A language is recursive (decidable) when some Turing machine:",["Accepts members but may loop on nonmembers","Halts on every input and answers membership correctly","Accepts all strings","Has no rejecting state"],1,"A decider halts on every input, accepting members and rejecting nonmembers.","FLAT-4-1","Medium"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...F24,id:"pyq-flat-2024-"+id,q,o,a,e,topicId,difficulty}));
 const F23={s:"FLAT",year:2023,semester:5,code:"105503",pdfPage:31,paper:"B.Tech 5th Semester Examination, 2023 — Formal Language & Automata Theory"};
 [
  ["a","The power set of an infinite countable set is:",["Countable","Uncountable","Finite","Always empty"],1,"Cantor's theorem establishes that a set and its power set cannot have the same cardinality; for a countably infinite set, the power set is uncountable.","FLAT-0-0","Medium"],
  ["b","The pumping lemma for regular languages is used to show that a language:",["Must be regular","Is not regular when it violates the lemma","Is context-sensitive only","Has a finite alphabet"],1,"If a language violates the pumping lemma's necessary condition, it cannot be regular.","FLAT-1-5","Medium"],
  ["c","A pushdown automaton with two unbounded stacks can simulate:",["A finite automaton only","A Turing machine","A regular expression only","A DFA with one state"],1,"Two stacks can represent the tape halves of a Turing machine, giving TM-equivalent computational power.","FLAT-2-2","Hard"],
  ["d","Recursive languages are:",["Undecidable by definition","Decidable by a Turing machine that halts on every input","Always finite","Not recognizable"],1,"Recursive (decidable) languages have a total Turing-machine decider.","FLAT-4-1","Medium"],
  ["e","The complement of a recursive language is:",["Always recursive","Never recursively enumerable","Always finite","Undecidable"],0,"A decider for the complement can swap accept and reject outcomes while still halting on every input.","FLAT-5-0","Medium"],
  ["f","Context-free languages are not closed under which operation in general?",["Union","Concatenation","Kleene star","Intersection"],3,"CFLs are closed under union, concatenation and star, but not arbitrary intersection.","FLAT-2-5","Medium"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...F23,id:"pyq-flat-2023-"+id,q,o,a,e,topicId,difficulty}));
 const F22={s:"FLAT",year:2022,semester:5,code:"105503",pdfPage:33,paper:"End Semester Examination, 2022 — Formal Language & Automata Theory"};
 [
  ["a","Which pair of computational models differs in expressive power in the usual theory of automata?",["DFA and NFA","DFA and regular expressions","Deterministic and nondeterministic pushdown automata","Single-tape and multi-tape Turing machines"],2,"Deterministic PDAs are strictly less expressive than nondeterministic PDAs; the other pairs listed are equivalent in language-recognition power.","FLAT-2-2","Hard"],
  ["b","The pumping lemma for regular languages is useful for proving:",["Every language is regular","A language is not regular","A grammar is unambiguous","A DFA is minimal by itself"],1,"The lemma is a common contradiction tool for proving that a language is non-regular.","FLAT-1-5","Medium"],
  ["c","A deterministic finite automaton can be obtained from an NFA with n states using at most how many subset-construction states?",["n","n²","2ⁿ","2n"],2,"Subset construction uses subsets of the NFA state set, with an upper bound of 2ⁿ subsets.","FLAT-1-2","Medium"],
  ["d","Which property defines an ambiguous CFG?",["Every string has no parse tree","Some string has more than one parse tree","It generates only finite languages","It has no production rules"],1,"Ambiguity exists when at least one string admits more than one parse tree.","FLAT-2-3","Easy"],
  ["e","Which statement correctly describes the relationship between regular and context-free languages?",["Every context-free language is regular","Every regular language is context-free","The classes are disjoint","Every language is regular"],1,"Regular languages form a proper subset of context-free languages.","FLAT-2-0","Easy"],
  ["f","A language is decidable if:",["A recognizer accepts members but may loop on nonmembers","A Turing machine halts on every input and decides membership","It is generated by any unrestricted grammar only","It contains no empty string"],1,"Decidability requires a procedure that halts with a yes/no answer for every input.","FLAT-4-1","Medium"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...F22,id:"pyq-flat-2022-"+id,q,o,a,e,topicId,difficulty}));
 // EFFECTIVE TECHNICAL COMMUNICATION — source paper is a 3rd-semester paper (code 100305).
 const E23={s:"ETC",year:2023,semester:3,code:"100305",pdfPage:35,paper:"B.Tech 3rd Semester Examination, 2023 — Humanities-I (Effective Technical Communication)"};
 [
  ["a","Which is a principal advantage of collaborative writing?",["Reduced creativity","Increased workload in every case","Decreased productivity","Diverse perspectives and shared expertise"],3,"Collaborative writing can combine subject knowledge, feedback and different perspectives.","ETC-1-1","Easy"],
  ["b","Which is a sensible first step in technical-document preparation?",["Proofreading before drafting","Planning the purpose and audience","Printing the final copy","Formatting before defining the message"],1,"Planning clarifies purpose, audience, scope and structure before drafting.","ETC-1-0","Easy"],
  ["c","A primary advantage of effective technical writing is that it:",["Reduces clarity","Increases ambiguity","Communicates information clearly and accurately","Removes the need for revision"],2,"Effective technical writing prioritizes accurate, audience-appropriate and clear communication.","ETC-1-0","Easy"],
  ["d","Which behaviour is generally effective during an oral presentation?",["Speaking as quickly as possible","Using unexplained jargon throughout","Maintaining appropriate eye contact","Avoiding audience questions"],2,"Appropriate eye contact helps establish engagement while the content remains clear and audience-focused.","ETC-3-0","Easy"],
  ["e","An effective first step in career planning is to:",["Apply for every job immediately","Assess skills, interests and goals","Negotiate salary before choosing a role","Quit the current job"],1,"Self-assessment informs realistic career goals and subsequent planning.","ETC-2-1","Easy"],
  ["f","Which approach supports complex problem solving?",["Avoiding all evidence","Ignoring alternatives","Breaking the problem into manageable parts","Rushing to conclusions"],2,"Decomposition makes complex problems easier to analyse and solve systematically.","ETC-2-3","Easy"],
  ["g","The primary purpose of a formal business letter is:",["Sharing personal stories","Providing informal greetings only","Formal professional communication","Replacing every meeting"],2,"A business letter conveys a formal professional message or request in a documented format.","ETC-4-2","Easy"]
 ].forEach(([id,q,o,a,e,topicId,difficulty])=>add({...E23,id:"pyq-etc-2023-"+id,q,o,a,e,topicId,difficulty}));
 D.mcqBankInfo={
   extractedFrom:["CSE-4TH-SEM-ALL-PYQs.pdf","COA PYQ.pdf"],
   totalAdded:allSource.length,
   verifiedSourceMcqs:0,
   answerPolicy:"These additional items are scored as curated practice after answer review; the uploaded PDFs did not include an official answer key.",
   contentCaveat:"The added practice statements have not all been reconciled line-by-line against original scans. They are deliberately labelled curated practice, not authentic PYQs. Only an item with independently checked original wording and source metadata is labelled as a PYQ."
 };
})();
