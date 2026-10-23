/* BEU CSE Semester 4 content seed. Unit/topic wording is based on the syllabus PDF provided in this conversation. Priority levels are study guidance, not official university marks weightage. */
window.STUDY_DATA = {
 exams:[
  {id:"CN",name:"Computer Networks",code:"105406",date:"2026-10-29",color:"#a78bfa"},
  {id:"COA",name:"Computer Organization & Architecture",code:"105401",date:"2026-10-31",color:"#61d5b0"},
  {id:"FLAT",name:"Formal Language & Automata Theory",code:"105402",date:"2026-11-02",color:"#80aaff"},
  {id:"DBMS",name:"Database Management System",code:"105404",date:"2026-11-03",color:"#f18ba8"},
  {id:"DAA",name:"Design & Analysis of Algorithms",code:"105403",date:"2026-11-05",color:"#f2bf70"},
  {id:"ETC",name:"Effective Technical Communication",code:"105405",date:"2026-11-07",color:"#bc9aff"}
 ],
 subjects:[
 {id:"COA",name:"Computer Organization & Architecture",short:"COA",code:"105401",icon:"▧",color:"#61d5b0",units:[
  {name:"Unit 1 · Functional blocks and ISA",hours:7,topics:[
   ["Functional blocks: CPU, memory, I/O subsystems and control unit","High"],
   ["CPU registers, instruction execution cycle and RTL interpretation","High"],
   ["Addressing modes, instruction set and CPU instruction-set case studies","High"]
  ]},
  {name:"Unit 2 · Data representation and arithmetic",hours:7,topics:[
   ["Signed numbers; fixed-point, floating-point and character representation","High"],
   ["Integer addition/subtraction, ripple-carry adder and carry-look-ahead adder","High"],
   ["Shift-and-add multiplication, Booth multiplier and carry-save multiplier","High"],
   ["Restoring and non-restoring division techniques","Medium"],
   ["Floating-point arithmetic: overflow, underflow, normalization and rounding","High"]
  ]},
  {name:"Unit 3 · CPU control and memory technology",hours:7,topics:[
   ["Introduction to x86 architecture","Medium"],
   ["Hardwired and microprogrammed control-unit design","High"],
   ["Design of a simple hypothetical CPU","High"],
   ["Semiconductor memory technologies and memory organization","Medium"]
  ]},
  {name:"Unit 4 · I/O and interrupts",hours:7,topics:[
   ["Peripheral devices, I/O subsystems and device interfaces","Medium"],
   ["Program-controlled I/O, interrupt-driven I/O and DMA","High"],
   ["Privileged/non-privileged instructions, software interrupts and exceptions","High"],
   ["Interrupts in process-state transitions; SCII and USB interfaces (as named in syllabus)","Medium"]
  ]},
  {name:"Unit 5 · Pipelining and parallel processors",hours:7,topics:[
   ["Pipelining concepts, throughput and speedup numericals","High"],
   ["Pipeline hazards and their remedies","High"],
   ["Parallel processors and concurrent access to memory","Medium"],
   ["Cache coherency","High"]
  ]},
  {name:"Unit 6 · Memory hierarchy and cache",hours:7,topics:[
   ["Memory interleaving and hierarchical memory organization","High"],
   ["Cache organization and direct, associative and set-associative mapping","High"],
   ["Cache/block size, address breakdown and mapping numericals","High"],
   ["Replacement algorithms (FIFO/LRU) and write policies","High"]
  ]}
 ]},
 {id:"FLAT",name:"Formal Language & Automata Theory",short:"FLAT",code:"105402",icon:"⌘",color:"#80aaff",units:[
  {name:"Unit 1 · Introduction",hours:5,topics:[
   ["Alphabet, strings, languages, grammars and productions","Medium"],
   ["Derivations and Chomsky hierarchy of languages","High"]
  ]},
  {name:"Unit 2 · Regular languages and finite automata",hours:9,topics:[
   ["Regular expressions and regular languages","High"],
   ["DFA and equivalence with regular expressions","High"],
   ["NFA and equivalence with DFA","High"],
   ["Regular grammars and equivalence with finite automata","High"],
   ["Properties and closure of regular languages","Medium"],
   ["Pumping lemma for regular languages","High"],
   ["Finite-automata minimization","High"]
  ]},
  {name:"Unit 3 · Context-free languages and PDA",hours:8,topics:[
   ["Context-free grammars (CFG) and context-free languages (CFL)","High"],
   ["Chomsky Normal Form and Greibach Normal Form","High"],
   ["Nondeterministic PDA and equivalence with CFG","High"],
   ["Parse trees and ambiguity in CFG","High"],
   ["Pumping lemma for CFLs and closure properties","Medium"],
   ["Deterministic pushdown automata","Medium"]
  ]},
  {name:"Unit 4 · Context-sensitive languages",hours:5,topics:[
   ["Context-sensitive grammars and context-sensitive languages","Medium"],
   ["Linear bounded automata and equivalence with CSG","Medium"]
  ]},
  {name:"Unit 5 · Turing machines",hours:8,topics:[
   ["Basic Turing-machine model and configurations","High"],
   ["Turing-recognizable vs Turing-decidable languages","High"],
   ["Variants of Turing machines; nondeterministic TM equivalence","Medium"],
   ["Unrestricted grammars and their equivalence with Turing machines","Medium"],
   ["Turing machines as enumerators","Low"]
  ]},
  {name:"Unit 6 · Undecidability",hours:7,topics:[
   ["Church–Turing thesis and universal Turing machine","High"],
   ["Universal and diagonalization languages","High"],
   ["Reductions between languages and Rice’s theorem","High"],
   ["Undecidable problems about languages","High"]
  ]}
 ]},
 {id:"DAA",name:"Design & Analysis of Algorithms",short:"DAA",code:"105403",icon:"⌁",color:"#f2bf70",units:[
  {name:"Unit 1 · Algorithm analysis",hours:7,topics:[
   ["Algorithm characteristics; best, average and worst-case behavior","High"],
   ["Asymptotic complexity bounds: O, Ω and Θ","High"],
   ["Algorithm performance measurement and time–space trade-offs","Medium"],
   ["Recurrences: substitution, recursion-tree and Master theorem","High"]
  ]},
  {name:"Unit 2 · Divide-and-conquer and heaps",hours:7,topics:[
   ["Binary search and analysis","High"],
   ["Quick sort and merge sort","High"],
   ["Linear-time selection, Strassen matrix multiplication and Karatsuba algorithm","Medium"],
   ["Min/max heaps, build-heap and heap sort","High"]
  ]},
  {name:"Unit 3 · Design paradigms and greedy algorithms",hours:7,topics:[
   ["Brute force, greedy, dynamic programming, branch-and-bound and backtracking","High"],
   ["Minimum-cost spanning tree: Prim’s and Kruskal’s algorithms","High"],
   ["Knapsack, job sequencing and Huffman coding","High"],
   ["Single-source shortest path and greedy-choice reasoning","High"]
  ]},
  {name:"Unit 4 · Dynamic programming",hours:7,topics:[
   ["Dynamic programming vs divide-and-conquer","High"],
   ["Matrix-chain multiplication","High"],
   ["0/1 knapsack and longest common subsequence","High"],
   ["Fibonacci, rod cutting, travelling salesperson and bin packing","Medium"],
   ["Heuristics and application domains","Low"]
  ]},
  {name:"Unit 5 · Graph and tree algorithms",hours:7,topics:[
   ["Graph representations; BFS and DFS traversals","High"],
   ["Dijkstra’s and Bellman–Ford shortest-path algorithms","High"],
   ["Floyd–Warshall all-pairs shortest path and transitive closure","High"],
   ["Topological sorting and connected components","Medium"],
   ["Network-flow algorithms","Medium"]
  ]},
  {name:"Unit 6 · Tractable and intractable problems",hours:7,topics:[
   ["Computability of algorithms and tractable/intractable problems","Medium"],
   ["Complexity classes P, NP, NP-complete and NP-hard","High"],
   ["Cook’s theorem and standard NP-complete problems","High"],
   ["Polynomial reduction techniques","High"],
   ["Approximation and randomized algorithms","High"]
  ]}
 ]},
 {id:"DBMS",name:"Database Management System",short:"DBMS",code:"105404",icon:"▤",color:"#f18ba8",units:[
  {name:"Unit 1 · Database system architecture",hours:8,topics:[
   ["Data abstraction and data independence","High"],
   ["Data Definition Language (DDL) and Data Manipulation Language (DML)","High"],
   ["ER, network, relational and object-oriented data models","High"],
   ["Integrity constraints and data manipulation operations","Medium"]
  ]},
  {name:"Unit 2 · Relational query languages and design",hours:10,topics:[
   ["Relational algebra; tuple and domain relational calculus","High"],
   ["SQL3 overview and DDL/DML constructs","High"],
   ["Functional/dependency concepts and Armstrong’s axioms","High"],
   ["Normalization: normal forms (1NF, 2NF, 3NF, BCNF)","High"],
   ["Dependency preservation and lossless design/decomposition","High"],
   ["Relational-algebra evaluation, query equivalence, join strategies and query optimization","Medium"],
   ["MySQL, Oracle, DB2 and SQL Server overview (as listed in syllabus)","Low"]
  ]},
  {name:"Unit 3 · Storage strategies",hours:4,topics:[
   ["Database indexes and index structures","High"],
   ["B-trees and hashing","High"]
  ]},
  {name:"Unit 4 · Transaction processing",hours:8,topics:[
   ["ACID properties and transaction processing","High"],
   ["Serializability and schedule analysis","High"],
   ["Locking and timestamp-based schedulers","High"],
   ["Multiversion and optimistic concurrency control","Medium"],
   ["Database recovery","High"]
  ]},
  {name:"Unit 5 · Database security",hours:6,topics:[
   ["Authentication, authorization and access control","Medium"],
   ["DAC, MAC and RBAC access-control models","High"],
   ["Intrusion detection and SQL injection","High"]
  ]},
  {name:"Unit 6 · Advanced topics",hours:6,topics:[
   ["Object-oriented, object-relational and logical databases","Low"],
   ["Web databases and distributed databases","Medium"],
   ["Data warehousing and data mining","Medium"]
  ]}
 ]},
 {id:"ETC",name:"Effective Technical Communication",short:"ETC",code:"105405",icon:"✎",color:"#bc9aff",units:[
  {name:"Unit 1 · Information design and development",hours:8,topics:[
   ["Technical-document types and information-development life cycle","Medium"],
   ["Organization structures and factors affecting information/document design","Medium"],
   ["Organization strategies; writing for print and online media","High"]
  ]},
  {name:"Unit 2 · Technical writing, grammar and editing",hours:10,topics:[
   ["Technical-writing process, forms of discourse, drafts and revision","High"],
   ["Collaborative writing, indexes, technical style and language","Medium"],
   ["Grammar and editing strategies for appropriate technical style","High"],
   ["Usability, human factors, project estimation, single sourcing and localization","Medium"]
  ]},
  {name:"Unit 3 · Self-development and assessment",hours:4,topics:[
   ["Self-assessment, awareness, perception, attitudes, values and beliefs","Medium"],
   ["Personal goals, career planning and self-esteem","Low"],
   ["Time management, memory, rapid reading and note-taking","High"],
   ["Complex problem solving and creativity","Medium"]
  ]},
  {name:"Unit 4 · Communication",hours:8,topics:[
   ["Public speaking and group discussion","High"],
   ["Oral presentation, graphic presentation and presentation aids","High"],
   ["Interviews and personality development","High"]
  ]},
  {name:"Unit 5 · Technical writing",hours:6,topics:[
   ["Reports, project proposals and progress reports","High"],
   ["Brochures, newsletters, technical articles and manuals","Medium"],
   ["Official notes, business letters, memos and minutes of meetings","High"],
   ["Event reports","Medium"]
  ]},
  {name:"Unit 6 · Ethics",hours:6,topics:[
   ["Business ethics and engineering ethics","High"],
   ["Social, office, email and telephone etiquettes","High"],
   ["Engineer’s roles/responsibilities and workplace culture","Medium"],
   ["Time management and personal memo","Medium"]
  ]}
 ]},
 {id:"CN",name:"Computer Networks",short:"CN",code:"105406",icon:"⌘",color:"#a78bfa",units:[
  {name:"Unit 1 · Overview of data communication and networking",hours:4,topics:[
   ["Data communication, network architecture and physical topology","Medium"],
   ["OSI reference model and TCP/IP protocol suite","High"]
  ]},
  {name:"Unit 2 · Physical layer",hours:10,topics:[
   ["Analog/digital signals, transmission impairment and data-rate limits","High"],
   ["Network performance: throughput, delay and bandwidth","High"],
   ["Bit representation, synchronization and analog/digital transmission","Medium"],
   ["Multiplexing and spreading techniques","High"],
   ["Guided transmission media","Medium"],
   ["Circuit, packet and virtual-circuit switching","High"]
  ]},
  {name:"Unit 3 · Data link layer",hours:10,topics:[
   ["Framing, flow control and error control","High"],
   ["Noiseless/noisy-channel protocols and stop-and-wait/sliding-window ideas","High"],
   ["Pure/slotted ALOHA, CSMA/CD and CSMA/CA","High"],
   ["Controlled access: bitmap, polling and token passing","Medium"],
   ["TDMA, FDMA and CDMA channelization","High"],
   ["Physical addressing, Ethernet, LAN interconnection and VLANs","High"]
  ]},
  {name:"Unit 4 · Network layer",hours:7,topics:[
   ["IPv4 and IPv6 addressing/header concepts","High"],
   ["ARP, RARP, BOOTP and DHCP address mapping","High"],
   ["ICMP and IGMP","Medium"],
   ["Routing algorithms","High"]
  ]},
  {name:"Unit 5 · Transport layer",hours:7,topics:[
   ["UDP, TCP and socket interface/client-server model","High"],
   ["TCP connection management and reliability concepts","High"],
   ["Congestion control and Quality of Service","High"]
  ]},
  {name:"Unit 6 · Application layer",hours:4,topics:[
   ["DNS and domain-name resolution","High"],
   ["Remote logging and email: SMTP and POP","Medium"],
   ["FTP, World Wide Web and HTTP","High"]
  ]}
 ]}
 ],
 questions:[
  {id:"cn1",s:"CN",type:"MCQ",q:"Which OSI layer provides end-to-end process delivery and transport services?",o:["Network","Transport","Data Link","Session"],a:1,e:"The transport layer supports process-to-process delivery. TCP and UDP are commonly mapped to this layer."},
  {id:"cn2",s:"CN",type:"MCQ",q:"Which protocol maps an IPv4 address to a MAC address on a local network?",o:["DNS","DHCP","ARP","ICMP"],a:2,e:"ARP resolves a local IPv4 address to a link-layer hardware address."},
  {id:"cn3",s:"CN",type:"MCQ",q:"Which transport protocol is connection-oriented?",o:["UDP","TCP","ARP","ICMP"],a:1,e:"TCP uses connection management, sequence numbers and acknowledgements to provide reliable byte-stream delivery."},
  {id:"cn4",s:"CN",type:"MCQ",q:"Which switching method sends packets individually without reserving a dedicated end-to-end circuit?",o:["Circuit switching","Packet switching","Dedicated circuit only","Channelization"],a:1,e:"In packet switching, packets are forwarded through shared network links; datagrams may take different paths."},
  {id:"coa1",s:"COA",type:"MCQ",q:"Booth’s algorithm is commonly used for which operation?",o:["Floating-point normalization","Signed binary multiplication","Cache replacement","I/O polling"],a:1,e:"Booth’s algorithm recodes signed binary multiplication, commonly using two’s-complement representation."},
  {id:"coa2",s:"COA",type:"MCQ",q:"What is the main advantage of a carry-look-ahead adder over a ripple-carry adder?",o:["No logic gates are required","Reduced carry-propagation delay","It stores operands in cache","It prevents subtraction"],a:1,e:"Generate/propagate logic calculates carry signals faster than waiting for a carry to ripple through every bit."},
  {id:"coa3",s:"COA",type:"MCQ",q:"Which cache replacement policy evicts the block that has not been used for the longest time?",o:["FIFO","LRU","Write-through","Write-back"],a:1,e:"Least Recently Used (LRU) selects the cache block whose most recent access is oldest."},
  {id:"coa4",s:"COA",type:"MCQ",q:"Which technique can transfer a block between an I/O device and memory with reduced continuous CPU involvement?",o:["Polling only","DMA","RTL decoding","Cache mapping"],a:1,e:"Direct Memory Access (DMA) allows a controller to transfer a block with reduced CPU participation."},
  {id:"flat1",s:"FLAT",type:"MCQ",q:"A finite automaton recognizes which class of languages?",o:["All recursively enumerable languages","Regular languages","Only context-sensitive languages","Only undecidable languages"],a:1,e:"DFA and NFA recognize exactly the regular languages."},
  {id:"flat2",s:"FLAT",type:"MCQ",q:"Which computational model uses a stack as auxiliary memory?",o:["DFA","Pushdown automaton","Finite automaton only","Boolean circuit"],a:1,e:"A pushdown automaton uses a stack; nondeterministic PDAs recognize the context-free languages."},
  {id:"flat3",s:"FLAT",type:"MCQ",q:"Which statement about DFA and NFA is correct?",o:["NFA recognizes more languages than DFA","DFA cannot be minimized","They recognize the same class of languages","NFA cannot be converted to DFA"],a:2,e:"DFA and NFA differ in representation but recognize the same class: regular languages."},
  {id:"flat4",s:"FLAT",type:"MCQ",q:"Rice’s theorem is about non-trivial semantic properties of which objects?",o:["Finite strings only","Variable names","Languages recognized by Turing machines","DFA state labels"],a:2,e:"Rice’s theorem shows that every non-trivial semantic property of the language recognized by a Turing machine is undecidable."},
  {id:"daa1",s:"DAA",type:"MCQ",q:"What is the standard worst-case time complexity of merge sort?",o:["O(log n)","O(n)","O(n log n)","O(n²)"],a:2,e:"Merge sort has logarithmic recursion depth and linear merge work per level, giving O(n log n)."},
  {id:"daa2",s:"DAA",type:"MCQ",q:"Which pair contains standard greedy minimum-spanning-tree algorithms?",o:["Prim and Kruskal","BFS and DFS","Merge sort and quick sort","Dijkstra and binary search"],a:0,e:"Prim’s and Kruskal’s algorithms construct minimum spanning trees using greedy edge/vertex choices."},
  {id:"daa3",s:"DAA",type:"MCQ",q:"Dynamic programming is especially useful when a problem has:",o:["No repeated subproblems","Overlapping subproblems and optimal substructure","Only one input value","No possible recurrence"],a:1,e:"DP saves subproblem results to avoid repeated work and uses optimal substructure."},
  {id:"daa4",s:"DAA",type:"MCQ",q:"An NP-complete decision problem is:",o:["Known to be O(1)","In NP and NP-hard under polynomial-time reductions","Necessarily undecidable","A problem with no finite input"],a:1,e:"NP-complete problems are in NP and every NP problem can be reduced to them in polynomial time."},
  {id:"dbms1",s:"DBMS",type:"MCQ",q:"Which ACID property means a transaction is all-or-nothing?",o:["Consistency","Isolation","Atomicity","Durability"],a:2,e:"Atomicity means either all transaction operations commit, or none of them do."},
  {id:"dbms2",s:"DBMS",type:"MCQ",q:"Which normal form primarily removes partial dependency on a candidate key?",o:["1NF","2NF","3NF","BCNF only"],a:1,e:"Second Normal Form eliminates partial functional dependencies of non-prime attributes on a proper subset of a candidate key."},
  {id:"dbms3",s:"DBMS",type:"MCQ",q:"Which SQL command is ordinarily used to retrieve rows?",o:["SELECT","ALTER","DROP","GRANT"],a:0,e:"SELECT retrieves data from one or more tables or other queryable sources."},
  {id:"dbms4",s:"DBMS",type:"MCQ",q:"Which access-control model assigns permissions based on job roles?",o:["DAC","MAC","RBAC","CRC"],a:2,e:"Role-Based Access Control (RBAC) assigns privileges to roles and users gain permissions through role membership."},
  {id:"etc1",s:"ETC",type:"MCQ",q:"Which is most appropriate for a formal technical report?",o:["Unstructured slang","Clear purpose, organized sections and evidence","Only personal opinions","No headings or conclusion"],a:1,e:"Technical reports should be clear, organized, audience-aware, and supported by relevant evidence."},
  {id:"etc2",s:"ETC",type:"MCQ",q:"The usual first step before drafting a technical document is to:",o:["Send it without review","Identify purpose and audience","Add decoration only","Skip information gathering"],a:1,e:"Purpose and audience guide scope, tone, structure, technical detail and format."},
  {id:"etc3",s:"ETC",type:"MCQ",q:"Which communication format is best for a short formal request to a colleague or organization?",o:["A structured professional email or letter","Unrelated social-media post","Unlabeled data dump","Only emojis"],a:0,e:"A professional email/letter states context, request, necessary details and a courteous close."},
  {id:"etc4",s:"ETC",type:"MCQ",q:"Which is a core part of engineering ethics?",o:["Hiding known safety risks","Respecting responsibility and professional integrity","Inventing test results","Ignoring confidentiality"],a:1,e:"Engineering ethics includes integrity, responsibility, safety, fairness and respect for relevant professional duties."},
  {id:"cn5",s:"CN",type:"Long",q:"Explain the OSI reference model with a neat layered diagram and the function of each layer.",outline:["Draw seven layers in order: Physical, Data Link, Network, Transport, Session, Presentation, Application.","State each layer’s primary responsibility; examples include framing/MAC at Data Link, routing/IP at Network, and TCP/UDP at Transport.","Explain encapsulation and decapsulation briefly.","Conclude with why layering supports modular design and interoperability."],evidence:"PYQ-style practice aligned with the supplied Computer Networks syllabus. This is not labelled as a verbatim past-paper question."},
  {id:"cn6",s:"CN",type:"Long",q:"Compare TCP and UDP. Explain the TCP three-way handshake and connection termination.",outline:["Define connection-oriented TCP and connectionless UDP.","Compare reliability, sequencing, flow/congestion control, overhead and typical use cases.","Draw SYN → SYN-ACK → ACK for connection establishment.","Explain FIN/ACK-based termination at a high level; note simultaneous close and states only if relevant."],evidence:"Syllabus-aligned practice prompt for Transport Layer."},
  {id:"coa5",s:"COA",type:"Long",q:"Explain Booth’s multiplication algorithm with a worked signed-binary example.",outline:["Introduce A, Q, Q−1 and the signed multiplier representation.","List rules for Q0Q−1: 01 add M; 10 subtract M; 00/11 no arithmetic operation.","Perform arithmetic right shift of the combined registers each cycle.","Show each register state, number of cycles and final product; verify by decimal conversion."],evidence:"A related Booth algorithm question appears in the supplied COA PYQ collection; this is a prepared practice version."},
  {id:"coa6",s:"COA",type:"Long",q:"Explain cache mapping techniques and compare direct, fully associative and set-associative mapping.",outline:["Define cache line, block, tag, index/set and offset.","Draw the address fields for each mapping approach.","Explain where a main-memory block may be placed for each technique.","Compare hardware complexity, flexibility, conflict misses and lookup cost; solve one address breakdown example if given."],evidence:"Cache mapping appears repeatedly in the supplied COA PYQ collection."},
  {id:"flat5",s:"FLAT",type:"Long",q:"State and apply the pumping lemma for regular languages. Explain how it can prove a language is not regular.",outline:["State the lemma with pumping length p and decomposition w = xyz.","Give conditions: |xy| ≤ p, |y| > 0 and xyᶦz belongs to L for all i ≥ 0.","Assume a candidate language is regular and choose a string dependent on p.","Show every valid split puts y in a constrained region, then choose i (often 0 or 2) to contradict membership.","Clarify that the lemma is a necessary condition, not a general test for proving regularity."],evidence:"Syllabus-aligned practice prompt; pumping lemma is explicitly in the supplied syllabus."},
  {id:"flat6",s:"FLAT",type:"Long",q:"Explain the Chomsky hierarchy and relate regular, context-free, context-sensitive and recursively enumerable languages to their machines.",outline:["Define Types 3, 2, 1 and 0 grammars at the level used in your course.","Connect regular languages with finite automata; CFLs with PDA; CSLs with linear bounded automata; Type 0 with Turing machines.","Draw the containment relation: regular ⊆ context-free ⊆ context-sensitive ⊆ recursively enumerable.","Give one simple illustrative language per level if time allows."],evidence:"Syllabus-aligned practice prompt."},
  {id:"daa5",s:"DAA",type:"Long",q:"Explain merge sort and derive its time complexity using a recurrence relation.",outline:["Describe divide, recursively sort both halves, and merge.","Write T(n) = 2T(n/2) + Θ(n), with base case T(1)=Θ(1).","Use the Master theorem or recursion tree to derive Θ(n log n).","Mention auxiliary space and why the split/merge work leads to the complexity."],evidence:"Merge sort and recurrence analysis are in the supplied DAA syllabus."},
  {id:"daa6",s:"DAA",type:"Long",q:"Compare Prim’s and Kruskal’s algorithms for a minimum spanning tree. Demonstrate one on a weighted graph.",outline:["Define spanning tree and minimum spanning tree.","Prim grows one tree from a start vertex by adding a minimum safe crossing edge.","Kruskal sorts edges and adds the next minimum edge that does not create a cycle (often using disjoint sets).","Trace the selected edges on a given graph and show the final weight.","Compare typical data structures and when each may be convenient."],evidence:"Prim’s and Kruskal’s algorithms are explicitly in the supplied syllabus and algorithm-lab section."},
  {id:"dbms5",s:"DBMS",type:"Long",q:"Explain normalization up to 3NF and BCNF with examples of functional dependencies.",outline:["Define functional dependency and candidate key for the relation.","Explain 1NF (atomic domains), 2NF (no partial dependency on candidate key), and 3NF (no disallowed transitive dependency for non-prime attributes).","State BCNF: every non-trivial functional dependency X → Y has X as a superkey.","Use a small relation to illustrate a decomposition.","Check losslessness and dependency preservation rather than assuming every decomposition has both."],evidence:"Normalization, functional dependencies and lossless design are in the supplied DBMS syllabus."},
  {id:"dbms6",s:"DBMS",type:"Long",q:"Explain ACID properties and conflict serializability of transaction schedules.",outline:["Define Atomicity, Consistency, Isolation and Durability with one sentence/example each.","For a schedule, mark read/write operations and identify conflicting operations on the same data item.","Construct the precedence graph, adding an edge for each conflict order.","Acyclic graph implies conflict serializable; a cycle implies not conflict serializable.","Mention locking/timestamps as concurrency-control approaches."],evidence:"Transactions, ACID and serializability are explicitly in the supplied DBMS syllabus."},
  {id:"etc5",s:"ETC",type:"Long",q:"Describe the structure and key features of a technical report or project proposal.",outline:["State title, purpose, audience and scope.","Use a suitable structure: title page, abstract/executive summary, contents, introduction, method/analysis, results/discussion, conclusion/recommendations, references and appendices as appropriate.","Keep headings, visuals, units and citations consistent.","Use concise objective language and proofread for grammar, clarity and technical correctness."],evidence:"Technical reports and project proposals are explicitly in the supplied ETC syllabus."},
  {id:"etc6",s:"ETC",type:"Long",q:"Write a formal email and explain the principles of professional email etiquette.",outline:["Use a precise subject line, courteous salutation and clear purpose.","Place the request/action and essential context early; keep paragraphs short.","Check recipients, attachments, tone, grammar, confidentiality and reply-all use.","Close professionally with the sender’s identity; avoid slang and unnecessary urgency."],evidence:"Email etiquette and business/technical writing appear in the supplied ETC syllabus."}
 ]
};


// Source-checked MCQs transcribed from the uploaded COA paper images.
// Course code and source semester are retained so the app does not silently
// equate a historical paper with every current course outline.
window.STUDY_DATA.questions.push(
  {
    id:"coa-pyq-2022-q1a", s:"COA", type:"MCQ",
    q:"The 8-bit encoding format used to store data in a computer is:",
    o:["ASCII","EBCDIC","ANCI","USCI"], a:1,
    e:"EBCDIC uses an 8-bit character code. Standard ASCII is a 7-bit code.",
    marks:2, year:2022, semester:4, courseCode:"105401/106401",
    paper:"B.Tech 4th Semester Examination, 2022 (New Course)",
    sourceName:"COA PYQ.pdf", sourcePage:1,
    sourceType:"Original PYQ · 4th Sem 2022", verifiedSource:true
  },
  {
    id:"coa-pyq-2022-q1b", s:"COA", type:"MCQ",
    q:"The bus used to connect the monitor to the CPU is:",
    o:["PCI bus","SCSI bus","Memory bus","RAM bus"], a:0,
    e:"Of the listed options, PCI is the bus associated with connecting an expansion/display adapter to the system. The exact wording and options are transcribed from the uploaded paper; confirm with your class notes if the question is discussed differently.",
    marks:2, year:2022, semester:4, courseCode:"105401/106401",
    paper:"B.Tech 4th Semester Examination, 2022 (New Course)",
    sourceName:"COA PYQ.pdf", sourcePage:2,
    sourceType:"Original PYQ · 4th Sem 2022", verifiedSource:true
  }
);
