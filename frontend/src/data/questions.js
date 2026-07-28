const interviewCategories = [
  {
    id: "behavioral",
    name: "Behavioral",
    icon: "Users",
    description: "Soft skills, teamwork, and past experiences",
    color: "brand",
    questions: [
      "Tell me about a time you faced a significant challenge at work. How did you handle it?",
      "Describe a situation where you had a conflict with a coworker. How did you resolve it?",
      "Tell me about a time you failed and what you learned from it.",
      "Describe a project you led from start to finish. What was the outcome?",
      "Tell me about a time you had to persuade someone to see things your way.",
      "Describe a situation where you had to work under a tight deadline.",
      "Tell me about a time you went above and beyond what was required.",
      "Describe how you handle feedback and criticism."
    ]
  },
  {
    id: "technical",
    name: "Technical",
    icon: "Code",
    description: "Programming concepts and system design",
    color: "sky",
    questions: [
      "Explain the difference between SQL and NoSQL databases. When would you use each?",
      "Describe how you would design a URL shortener service at scale.",
      "What is the CAP theorem and how does it apply to distributed systems?",
      "Explain the difference between async and sync programming. Give an example.",
      "How would you optimize a slow database query?",
      "Describe the difference between processes and threads.",
      "What is dependency injection and why is it useful?",
      "Explain Big O notation and the time complexity of binary search."
    ]
  },
  {
    id: "system-design",
    name: "System Design",
    icon: "Network",
    description: "Architecture and scalable system design",
    color: "accent",
    questions: [
      "How would you design a chat application like WhatsApp?",
      "Design a rate limiter for an API. What algorithms would you consider?",
      "How would you design Twitter's news feed?",
      "Design a parking lot system. What classes and patterns would you use?",
      "How would you design a distributed cache?",
      "Design a ride-sharing application like Uber. What are the key components?"
    ]
  },
  {
    id: "leadership",
    name: "Leadership",
    icon: "Crown",
    description: "Management and team leadership",
    color: "brand",
    questions: [
      "How do you motivate team members who are underperforming?",
      "Describe your approach to delegating tasks in a large project.",
      "Tell me about a time you had to make an unpopular decision as a leader.",
      "How do you balance technical debt with new feature development?",
      "Describe how you mentor junior team members."
    ]
  },
  {
    id: "product",
    name: "Product Sense",
    icon: "Lightbulb",
    description: "Product thinking and user-centric design",
    color: "sky",
    questions: [
      "How would you improve our flagship product? Walk me through your approach.",
      "Tell me about a product you love. What makes it great?",
      "How would you prioritize features for the next quarter?",
      "Describe a time you used data to make a product decision."
    ]
  }
];

const hrTopics = [
  { id: "self-intro", name: "Self Introduction", icon: "User" },
  { id: "strengths", name: "Strengths & Weaknesses", icon: "TrendingUp" },
  { id: "experience", name: "Work Experience", icon: "Briefcase" },
  { id: "salary", name: "Salary Negotiation", icon: "DollarSign" },
  { id: "culture-fit", name: "Culture Fit", icon: "Heart" },
  { id: "career-goals", name: "Career Goals", icon: "Target" }
];

const technicalTopics = [
  { id: "javascript", name: "JavaScript", icon: "Code" },
  { id: "react", name: "React", icon: "Atom" },
  { id: "python", name: "Python", icon: "Terminal" },
  { id: "java", name: "Java", icon: "Code" },
  { id: "cpp", name: "C++", icon: "Terminal" },
  { id: "sql", name: "SQL & Databases", icon: "Database" },
  { id: "data-structures", name: "Data Structures", icon: "Box" },
  { id: "algorithms", name: "Algorithms", icon: "GitBranch" },
  { id: "system-design", name: "System Design", icon: "Network" },
  { id: "cloud", name: "Cloud & DevOps", icon: "Cloud" },
  { id: "web-security", name: "Web Security", icon: "Shield" },
  { id: "machine-learning", name: "Machine Learning", icon: "Brain" }
];

const difficultyLevels = [
  { id: "easy", name: "Easy", description: "Beginner-friendly questions", color: "brand" },
  { id: "medium", name: "Medium", description: "Intermediate complexity", color: "accent" },
  { id: "hard", name: "Hard", description: "Advanced and challenging", color: "red" }
];

const mockQuestionBank = {
  javascript: [
    {
      q: "Explain closures in JavaScript with an example.",
      a: "A closure is a function that remembers variables from its outer scope even after the outer function returns. Example: `function counter(){let c=0; return ()=>++c;}` — the returned function keeps access to `c`. Closures enable encapsulation and stateful callbacks.",
      difficulty: "easy",
      keywords: ["closure", "outer", "scope", "variable", "access", "return", "encapsulation", "counter", "function"]
    },
    {
      q: "What is the event loop and how does it work?",
      a: "The event loop lets single-threaded JS handle async work without blocking. It watches the call stack and the task/microtask queues; when the stack is empty, it pushes the next callback up. Microtasks (Promises) run before macrotasks (setTimeout).",
      difficulty: "easy",
      keywords: ["event loop", "call stack", "callback", "queue", "microtask", "macrotask", "async", "single thread", "promise", "setTimeout"]
    },
    {
      q: "Explain the difference between let, const, and var.",
      a: "`var` is function-scoped and hoisted as undefined; `let` and `const` are block-scoped and sit in the temporal dead zone until declared. `const` can't be reassigned (its object's contents still can). Prefer `let`/`const` to avoid scope bugs.",
      difficulty: "easy",
      keywords: ["var", "let", "const", "scope", "block", "function", "hoist", "redeclare", "reassign", "temporal dead zone"]
    },
    {
      q: "What is hoisting in JavaScript?",
      a: "Hoisting moves declarations to the top of their scope during compilation. Function declarations are fully hoisted (callable early); `var` is hoisted as undefined; `let`/`const` are hoisted but stay in the temporal dead zone, so early access throws ReferenceError.",
      difficulty: "medium",
      keywords: ["hoisting", "declaration", "scope", "var", "function", "undefined", "temporal dead zone", "let", "const", "compilation"]
    },
    {
      q: "How does prototypal inheritance work?",
      a: "Objects inherit via the prototype chain: accessing a property, JS checks the object then walks up `__proto__` until found or null. `Object.create(obj)` makes a new object with `obj` as its prototype. ES6 `class` is syntactic sugar over this system.",
      difficulty: "medium",
      keywords: ["prototype", "inheritance", "chain", "object", "__proto__", "Object.create", "class", "new", "property", "delegation"]
    },
    {
      q: "Explain the difference between == and ===.",
      a: "`==` compares with type coercion (`5 == '5'` is true); `===` compares value and type without coercion (`5 === '5'` is false). Prefer `===` to avoid surprise conversions. Note `NaN !== NaN` (use `Number.isNaN`).",
      difficulty: "easy",
      keywords: ["==", "===", "loose", "strict", "coercion", "type", "value", "null", "undefined", "NaN"]
    },
    {
      q: "What are arrow functions and how do they differ from regular functions?",
      a: "Arrow functions (`=>`) are concise and inherit `this` from the enclosing scope, unlike regular functions which bind `this` by call site. They can't be constructors and have no `arguments` object. Great for callbacks; use regular functions when you need own `this`.",
      difficulty: "medium",
      keywords: ["arrow", "function", "this", "lexical", "scope", "constructor", "new", "arguments", "prototype", "concise"]
    },
    {
      q: 'Explain the concept of "this" in JavaScript.',
      a: "`this` depends on the call site: global in global scope, the object before the dot in a method, undefined in strict-mode free calls, the new instance with `new`, and fixed by `call`/`apply`/`bind`. Arrow functions inherit `this` lexically.",
      difficulty: "hard",
      keywords: ["this", "scope", "global", "object", "method", "arrow", "lexical", "call", "apply", "bind", "new"]
    },
    {
      q: "Explain event delegation and how you'd use it in the browser.",
      a: "Event delegation attaches a single listener to a parent and inspects event.target to handle events for many child elements — useful for dynamic lists and performance. It reduces listeners and memory usage and relies on event bubbling.",
      difficulty: "medium",
      keywords: ["event delegation", "event bubbling", "listener", "target", "performance", "dynamic", "delegate"]
    },
    {
      q: "How do Promises differ from async/await?",
      a: "Promises are objects representing eventual completion; `async/await` is syntax sugar over Promises making asynchronous code look synchronous. `await` pauses async function execution until the Promise resolves; use try/catch for errors.",
      difficulty: "easy",
      keywords: ["promise", "async", "await", "syntax sugar", "then", "catch", "error handling"]
    },
    {
      q: "How would you debounce a function? Explain with code.",
      a: "Debouncing delays execution until after a pause in events: `function debounce(fn, wait){let t; return (...args)=>{clearTimeout(t); t=setTimeout(()=>fn(...args), wait)}}` Useful for resize/scroll/input handlers to reduce calls.",
      difficulty: "medium",
      keywords: ["debounce", "throttle", "timeout", "performance", "handler", "delay"]
    },
    {
      q: "Describe how you would optimize a single-page app's bundle size.",
      a: "Strategies: code-splitting (dynamic imports), tree-shaking, remove unused dependencies, lazy-load routes/images, use smaller libraries, compress assets, and precompute heavy code. Analyze with bundle analyzers.",
      difficulty: "hard",
      keywords: ["code-splitting", "tree-shaking", "lazy-load", "bundle", "compress", "analyzer"]
    },
    {
      q: "What is the difference between Map and WeakMap in JavaScript?",
      a: "Map holds key-value pairs with keys of any type and prevents garbage collection of keys. WeakMap only allows object keys, holds them weakly (allowing GC if no other reference exists), and is not enumerable. Useful for private data storage.",
      difficulty: "hard",
      keywords: ["map", "weakmap", "garbage collection", "keys", "objects", "enumerable", "memory"]
    },
    {
      q: "Explain Generator functions and the yield keyword.",
      a: "Generators are functions that can be paused and resumed using `function*` syntax and `yield`. Calling a generator returns an iterator object with a `.next()` method that yields `{ value, done }` objects.",
      difficulty: "medium",
      keywords: ["generator", "yield", "next", "iterator", "pause", "resume", "iterable"]
    },
    {
      q: "What are Web Workers and when should you use them?",
      a: "Web Workers run scripts in background threads separate from the main execution thread. They are used to execute heavy computations without freezing or blocking the user interface (UI thread).",
      difficulty: "hard",
      keywords: ["web worker", "background thread", "ui thread", "concurrency", "performance", "multithreading"]
    }
  ],
  react: [
    {
      q: "What is the Virtual DOM and how does React use it?",
      a: "The Virtual DOM is an in-memory tree of JS objects representing the UI. On state change React builds a new tree, diffs it against the old one (reconciliation), and applies only the minimal changes to the real DOM in a batch — minimizing expensive DOM writes.",
      difficulty: "easy",
      keywords: ["virtual dom", "vdom", "reconciliation", "diff", "tree", "batch", "performance", "dom", "key", "render"]
    },
    {
      q: "Explain the difference between state and props.",
      a: "Props are read-only data passed from parent to child; state is internal, mutable data owned by the component (`useState`). Props can't change inside the child; state can, and changes trigger re-render. New parent state flows down as new props.",
      difficulty: "easy",
      keywords: ["state", "props", "component", "parent", "child", "immutable", "mutable", "useState", "render", "re-render"]
    },
    {
      q: "What are React Hooks? Name a few common ones.",
      a: "Hooks let function components use state and lifecycle features without classes. Common ones: `useState` (state), `useEffect` (side effects), `useContext` (context), `useRef` (mutable ref), `useMemo`/`useCallback` (memoization), `useReducer` (complex state). Call them at top level only.",
      difficulty: "easy",
      keywords: ["hooks", "useState", "useEffect", "useContext", "useRef", "useMemo", "useCallback", "functional", "component", "useReducer"]
    },
    {
      q: "How does useEffect work? Explain its dependency array.",
      a: "`useEffect(callback, deps)` runs side effects after render. No array: runs every render. `[]`: runs once on mount. `[a,b]`: runs when a or b change. Return a cleanup function to tear down before the next effect/unmount. Wrong deps cause stale closures or infinite loops.",
      difficulty: "medium",
      keywords: ["useEffect", "side effect", "dependency", "array", "cleanup", "mount", "render", "unmount", "stale", "closure"]
    },
    {
      q: "What is the Context API and when would you use it?",
      a: "Context lets you pass data through the tree without prop drilling. Create with `createContext()`, provide via `<Context.Provider value={...}>`, consume with `useContext()`. Good for theme, auth, locale. For high-frequency updates it can over-render consumers.",
      difficulty: "medium",
      keywords: ["context", "provider", "consumer", "useContext", "createContext", "prop drilling", "theme", "auth", "global", "state"]
    },
    {
      q: "Explain reconciliation in React.",
      a: "Reconciliation is React's diffing algorithm: it compares new and old element trees by type and key. Different types unmount/remount; same types update props and recurse into children. Keys identify list items so React can match adds/removals — avoid array indexes as keys when reordering.",
      difficulty: "medium",
      keywords: ["reconciliation", "diff", "tree", "type", "key", "mount", "unmount", "props", "children", "mutation"]
    },
    {
      q: "What are higher-order components?",
      a: "A Higher-Order Component is a function that takes a component and returns an enhanced one, used for cross-cutting concerns like auth or logging. Example: `withAuth(Component)` renders the component if authenticated, else `<Login/>`. Hooks have largely replaced HOCs.",
      difficulty: "medium",
      keywords: ["hoc", "higher-order", "component", "function", "wrap", "enhance", "compose", "props", "auth", "pattern"]
    },
    {
      q: "How would you optimize a React app's performance?",
      a: "Memoize with `React.memo`, `useMemo`, and `useCallback`; virtualize long lists (react-window); code-split with `React.lazy` + Suspense; use stable list keys; keep state local; debounce handlers; and profile with the React Profiler to find bottlenecks.",
      difficulty: "hard",
      keywords: ["memo", "useMemo", "useCallback", "React.memo", "virtualization", "code splitting", "lazy", "key", "profiler", "performance", "debounce"]
    },
    {
      q: "What's the difference between controlled and uncontrolled components?",
      a: "Controlled components have their value controlled by React state (`value` + `onChange`), while uncontrolled components rely on the DOM (`defaultValue` or refs). Controlled forms simplify validation and state sync; uncontrolled can be simpler for basic inputs.",
      difficulty: "medium",
      keywords: ["controlled", "uncontrolled", "ref", "value", "defaultValue", "form", "validation"]
    },
    {
      q: "Explain React Server Components (RSC) and how they differ from Client Components.",
      a: "React Server Components run exclusively on the server, producing zero client bundle overhead and enabling direct database access. Client components run in browser DOM and handle interactivity, state, and browser APIs.",
      difficulty: "hard",
      keywords: ["server components", "rsc", "client components", "bundle size", "ssr", "next.js", "hydration"]
    },
    {
      q: "How does useImperativeHandle work with forwardRef?",
      a: "`useImperativeHandle` customizes the ref value exposed by a parent component when using `forwardRef`. It limits which inner DOM methods or custom functions the parent can trigger.",
      difficulty: "hard",
      keywords: ["useImperativeHandle", "forwardRef", "ref", "parent", "child", "dom"]
    },
    {
      q: "What is Error Boundary in React and how is it implemented?",
      a: "Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the whole app. Implemented via class methods `getDerivedStateFromError` or `componentDidCatch`.",
      difficulty: "medium",
      keywords: ["error boundary", "fallback ui", "crash", "componentDidCatch", "catch", "exception"]
    }
  ],
  python: [
    {
      q: "Explain the difference between a list and a tuple in Python.",
      a: "Lists (`[]`) are mutable; tuples (`()`) are immutable and hashable, so they can be dict keys/set elements. Tuples are slightly faster and smaller. Use lists for dynamic collections and tuples for fixed records; a one-element tuple needs a trailing comma `(1,)`.",
      difficulty: "easy",
      keywords: ["list", "tuple", "mutable", "immutable", "hashable", "dictionary key", "sequence", "memory", "syntax", "performance"]
    },
    {
      q: "What are decorators in Python and how do you use them?",
      a: "A decorator is a function that wraps another to extend its behavior, applied with `@decorator`. It takes the original function, returns a wrapper that adds before/after logic, and uses `functools.wraps` to preserve metadata. Common uses: logging, timing, caching (`@lru_cache`).",
      difficulty: "medium",
      keywords: ["decorator", "function", "wrap", "@", "functools", "wraps", "argument", "closure", "lru_cache", "syntax"]
    },
    {
      q: "Explain Python's GIL (Global Interpreter Lock).",
      a: "The GIL is a mutex in CPython letting only one thread run bytecode at a time, because reference counting isn't thread-safe. It's released during I/O, so threads help I/O-bound code, but CPU-bound work needs multiprocessing or C extensions to bypass it.",
      difficulty: "hard",
      keywords: ["gil", "thread", "mutex", "cpython", "bytecode", "reference counting", "multiprocessing", "io", "lock", "concurrency"]
    },
    {
      q: "How would you profile a Python application to find CPU/memory hotspots?",
      a: "Use `cProfile` for CPU profiling, `pyinstrument` for a higher-level view, and `tracemalloc` for memory allocation tracing. Combine with sampling profilers, logging, and reproducing load; fix hotspots by algorithmic changes, lazy loading, or C extensions.",
      difficulty: "medium",
      keywords: ["profiling", "cProfile", "tracemalloc", "pyinstrument", "cpu", "memory", "hotspot", "optimization"]
    },
    {
      q: "Explain generators and when to use them.",
      a: "Generators use `yield` to produce values lazily, suspending between yields and keeping state. They are memory-efficient for streaming large data and can model pipelines; combined with `itertools` they enable elegant solutions for big-data processing.",
      difficulty: "easy",
      keywords: ["generator", "yield", "lazy", "iterator", "memory", "pipeline", "itertools"]
    },
    {
      q: "What is the difference between deep and shallow copy?",
      a: "A shallow copy duplicates the top object but shares nested references, so mutating a nested mutable affects both. A deep copy recursively clones everything, making fully independent copies. Use `copy.copy()` and `copy.deepcopy()`; slicing a list makes a shallow copy.",
      difficulty: "medium",
      keywords: ["shallow", "deep", "copy", "reference", "nested", "mutable", "copy.copy", "copy.deepcopy", "independent", "recursive"]
    },
    {
      q: "Explain list comprehensions with an example.",
      a: "A list comprehension builds a list in one expression: `[expression for item in iterable if condition]`. Example: `[x**2 for x in range(10) if x % 2 == 0]` gives `[0,4,16,36,64]`. They're faster than loops and also work for sets, dicts, and generators.",
      difficulty: "easy",
      keywords: ["list comprehension", "expression", "iterable", "condition", "syntax", "concise", "generator", "set", "dict", "performance"]
    },
    {
      q: "What are *args and **kwargs in Python function definitions?",
      a: "`*args` allows a function to accept any number of positional arguments as a tuple, while `**kwargs` accepts any number of keyword arguments as a dictionary. Useful for wrapper functions and dynamic argument handling.",
      difficulty: "easy",
      keywords: ["*args", "**kwargs", "arguments", "positional", "keyword", "tuple", "dictionary", "flexibility"]
    },
    {
      q: "Explain asyncio and event loops in Python.",
      a: "`asyncio` provides asynchronous I/O primitives using `async/await` syntax and an event loop that coordinates concurrent tasks without multi-threading overhead.",
      difficulty: "hard",
      keywords: ["asyncio", "async", "await", "event loop", "coroutine", "concurrency", "io-bound"]
    },
    {
      q: "What is dunder (double underscore) methods in Python? Give examples.",
      a: "Dunder methods (like `__init__`, `__str__`, `__len__`, `__repr__`) customize special behavior in classes, such as object initialization, string representation, operator overloading, and length calculation.",
      difficulty: "medium",
      keywords: ["dunder", "magic methods", "__init__", "__str__", "__len__", "operator overloading", "class"]
    }
  ],
  sql: [
    {
      q: "Explain the difference between INNER JOIN and LEFT JOIN.",
      a: "`INNER JOIN` returns only rows matching in both tables. `LEFT JOIN` returns all left-table rows plus matched right rows; unmatched right columns are NULL. Use INNER for intersecting data, LEFT when you want all left rows regardless of match (e.g., all customers with their orders).",
      difficulty: "easy",
      keywords: ["inner join", "left join", "match", "null", "outer", "table", "row", "intersect", "unmatched", "right join"]
    },
    {
      q: "What is database normalization? Describe the normal forms.",
      a: "Normalization organizes tables to reduce redundancy and protect integrity. 1NF: atomic values. 2NF: no partial dependency on a composite key. 3NF: no transitive dependency. BCNF: every determinant is a candidate key. Higher forms reduce redundancy but add joins, so analytics often denormalize.",
      difficulty: "medium",
      keywords: ["normalization", "1nf", "2nf", "3nf", "bcnf", "redundancy", "dependency", "atomic", "key", "integrity"]
    },
    {
      q: "How would you find duplicate records in a table?",
      a: "Use `GROUP BY` with `HAVING COUNT(*) > 1`: `SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;`. For full rows, use a window function: `ROW_NUMBER() OVER (PARTITION BY email ORDER BY id)` and filter `rn > 1`.",
      difficulty: "easy",
      keywords: ["duplicate", "group by", "having", "count", "window", "row_number", "partition", "order", "select", "join"]
    },
    {
      q: "Explain the difference between WHERE and HAVING clauses.",
      a: "`WHERE` filters rows before grouping and can't use aggregates. `HAVING` filters groups after `GROUP BY` and can use aggregates like COUNT/SUM. Example: `... WHERE status='active' GROUP BY dept HAVING COUNT(*) > 5` — WHERE picks rows, HAVING picks groups.",
      difficulty: "medium",
      keywords: ["where", "having", "filter", "group by", "aggregate", "count", "sum", "avg", "row", "group"]
    },
    {
      q: "What are indexes and how do they improve query performance?",
      a: "Indexes (usually B-trees) let the DB find rows by a column fast, avoiding full table scans, and speed up WHERE/JOIN/ORDER BY. They cost disk space and slow INSERT/UPDATE/DELETE. Index columns used in filters, joins, and sorts; avoid over-indexing. Check usage with EXPLAIN.",
      difficulty: "easy",
      keywords: ["index", "b-tree", "lookup", "scan", "where", "join", "order", "performance", "composite", "maintenance"]
    },
    {
      q: "Write a query to find the second highest salary in a table.",
      a: "Options: `SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);`, or `ORDER BY salary DESC LIMIT 1 OFFSET 1;`, or use `DENSE_RANK() OVER (ORDER BY salary DESC)` and filter `rnk = 2` to handle ties.",
      difficulty: "medium",
      keywords: ["second highest", "subquery", "max", "limit", "offset", "order by", "dense_rank", "window", "distinct", "salary"]
    },
    {
      q: "Explain ACID properties in relational databases.",
      a: "Atomicity (all operations succeed or roll back), Consistency (data satisfies constraints), Isolation (concurrent transactions don't interfere), and Durability (committed changes persist even during crash).",
      difficulty: "medium",
      keywords: ["acid", "atomicity", "consistency", "isolation", "durability", "transactions", "rollback", "commit"]
    },
    {
      q: "What are window functions in SQL and how do they differ from GROUP BY?",
      a: "Window functions (like `ROW_NUMBER()`, `RANK()`, `SUM() OVER (...)`) compute aggregate values over a partition of rows while preserving individual row identity, whereas `GROUP BY` collapses rows into single summaries.",
      difficulty: "hard",
      keywords: ["window function", "over", "partition by", "rank", "dense_rank", "lead", "lag", "row_number"]
    },
    {
      q: "What is database deadlock and how can it be prevented?",
      a: "A deadlock occurs when two transactions hold locks on separate resources and each waits for the other to release theirs. Prevented by locking resources in a consistent order, using lower isolation levels, or setting lock timeouts.",
      difficulty: "hard",
      keywords: ["deadlock", "locks", "transaction", "resource", "blocking", "isolation", "concurrency"]
    }
  ],
  "data-structures": [
    {
      q: "Explain the difference between an array and a linked list.",
      a: "Arrays store elements contiguously: O(1) index access but O(n) insert/delete (shifting). Linked lists store nodes with pointers: O(1) insert/delete at a known node but O(n) random access. Arrays have better cache locality; lists avoid reallocation.",
      difficulty: "easy",
      keywords: ["array", "linked list", "memory", "contiguous", "pointer", "access", "insertion", "deletion", "cache", "node"]
    },
    {
      q: "How does a hash table work? What is a hash collision?",
      a: "A hash table maps keys to array buckets via a hash function, giving average O(1) insert/lookup/delete. A collision is when two keys hash to the same bucket; resolve via chaining (list per bucket) or open addressing (probe for the next free slot). Resize when the load factor grows.",
      difficulty: "easy",
      keywords: ["hash table", "hash function", "bucket", "collision", "chaining", "open addressing", "probing", "load factor", "resize", "o(1)"]
    },
    {
      q: "Describe the implementation of a binary search tree.",
      a: "A Binary Search Tree keeps, for every node, all left-subtree keys smaller and right-subtree keys larger. Search/insert/delete are O(log n) when balanced, O(n) when skewed. Self-balancing variants (AVL, Red-Black) rotate to keep O(log n). Inorder traversal yields sorted output.",
      difficulty: "medium",
      keywords: ["bst", "binary search tree", "node", "left", "right", "subtree", "balanced", "avl", "red-black", "inorder"]
    },
    {
      q: "What is a stack vs a queue? Give real-world examples.",
      a: "A stack is LIFO — push/pop at one end; used for call stacks, undo, expression evaluation. A queue is FIFO — enqueue at rear, dequeue at front; used for scheduling, BFS, request handling. Variants: deque (both ends), priority queue.",
      difficulty: "easy",
      keywords: ["stack", "queue", "lifo", "fifo", "push", "pop", "enqueue", "dequeue", "undo", "bfs"]
    },
    {
      q: "Explain how a graph can be represented in memory.",
      a: "Adjacency matrix: an n×n array with matrix[i][j]=1 for an edge — O(n²) space, O(1) edge lookup, good for dense graphs. Adjacency list: an array of neighbor lists — O(n+e) space, better for sparse graphs. Pick by density and the operations you need.",
      difficulty: "medium",
      keywords: ["graph", "adjacency matrix", "adjacency list", "edge", "vertex", "space", "dense", "sparse", "edge list", "weight"]
    },
    {
      q: "What is the time complexity of operations on a heap?",
      a: "A binary heap is a complete tree with the heap property (min-heap: parent ≤ children). Insert and extract-min/max are O(log n) (sift up/down); peek is O(1); building from an array is O(n). Heaps power priority queues and heapsort. Store in an array: children of i are 2i+1, 2i+2.",
      difficulty: "medium",
      keywords: ["heap", "binary", "insert", "extract", "peek", "log n", "sift", "heapify", "priority queue", "complete tree"]
    },
    {
      q: "What is a Trie and when is it preferred over a Hash Table?",
      a: "A Trie (prefix tree) stores string characters along tree branches. It enables O(L) retrieval where L is word length and facilitates fast prefix search and auto-complete suggestions.",
      difficulty: "hard",
      keywords: ["trie", "prefix tree", "autocomplete", "string lookup", "branch", "prefix"]
    },
    {
      q: "Explain LRU Cache implementation using Data Structures.",
      a: "An LRU (Least Recently Used) cache is implemented using a Hash Map combined with a Doubly Linked List to achieve O(1) get and put operations.",
      difficulty: "hard",
      keywords: ["lru cache", "hash map", "doubly linked list", "eviction", "o(1)"]
    }
  ],
  algorithms: [
    {
      q: "Explain the quicksort algorithm and its time complexity.",
      a: "Quicksort picks a pivot, partitions smaller-left/larger-right, and recurses. Average O(n log n), worst O(n²) when the pivot is consistently extreme (fix with random/median-of-three pivot). It's in-place and cache-friendly but not stable. Schemes: Lomuto, Hoare.",
      difficulty: "medium",
      keywords: ["quicksort", "pivot", "partition", "divide", "conquer", "o(n log n)", "o(n²)", "in-place", "recursion", "lomuto"]
    },
    {
      q: "How does binary search work? What are its prerequisites?",
      a: "Binary search finds a target in a sorted array by comparing the middle element and discarding half the range each step. O(log n) time, O(1) space. Prerequisites: sorted data with random access. Watch off-by-one bounds; `bisect_left/right` find insertion points.",
      difficulty: "easy",
      keywords: ["binary search", "sorted", "middle", "half", "o(log n)", "random access", "bounds", "bisect", "target", "prerequisite"]
    },
    {
      q: "Explain dynamic programming with a classic example.",
      a: "DP breaks a problem into overlapping subproblems and solves each once, storing results (memoization top-down or tabulation bottom-up). It applies when there's optimal substructure + overlapping subproblems. Example: Fibonacci goes from O(2^n) recursion to O(n) with memo.",
      difficulty: "medium",
      keywords: ["dynamic programming", "subproblem", "memoization", "tabulation", "optimal substructure", "overlapping", "fibonacci", "knapsack", "top-down", "bottom-up"]
    },
    {
      q: "What is the difference between BFS and DFS?",
      a: "BFS explores level by level with a queue — finds shortest paths in unweighted graphs, good for level order. DFS goes deep with a stack/recursion — used for cycle detection, topological sort, connectivity. Both are O(V+E); BFS uses queue-width memory, DFS uses depth.",
      difficulty: "easy",
      keywords: ["bfs", "dfs", "queue", "stack", "level", "depth", "shortest path", "backtrack", "topological", "recursion"]
    },
    {
      q: "How would you detect a cycle in a linked list?",
      a: "Floyd's algorithm: use a slow pointer (1 step) and fast pointer (2 steps); if they meet, a cycle exists. To find the cycle start, reset one pointer to head and move both one step until they meet. O(n) time, O(1) space.",
      difficulty: "easy",
      keywords: ["cycle", "floyd", "tortoise", "hare", "slow", "fast", "pointer", "linked list", "o(1)", "hash set"]
    },
    {
      q: "Explain the merge sort algorithm.",
      a: "Merge sort recursively splits the array into halves, then merges the sorted halves back. O(n log n) in all cases and stable, but uses O(n) extra space for merging. Preferred when stability matters or for linked lists and external sorting.",
      difficulty: "medium",
      keywords: ["merge sort", "divide", "conquer", "split", "merge", "sorted", "o(n log n)", "stable", "auxiliary", "external sort"]
    },
    {
      q: "Explain Dijkstra's algorithm for shortest paths.",
      a: "Dijkstra's algorithm finds the shortest path from a single source vertex to all other vertices in a graph with non-negative edge weights using a Min-Priority Queue in O((V + E) log V) time.",
      difficulty: "hard",
      keywords: ["dijkstra", "shortest path", "min heap", "priority queue", "weighted graph", "greedy"]
    },
    {
      q: "What is Topological Sort and when is it applicable?",
      a: "Topological Sort orders vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, u comes before v. Used in build systems (like Make/npm) and task scheduling.",
      difficulty: "medium",
      keywords: ["topological sort", "dag", "indegree", "kahn's algorithm", "dependencies", "directed acyclic graph"]
    }
  ],
  "system-design": [
    {
      q: "How would you design a URL shortener like bit.ly?",
      a: "POST /shorten returns a short code; GET /{code} redirects to the long URL. Generate codes with an auto-increment ID encoded in base62 (~7 chars) or a hash. Store code→long URL in a KV store with Redis cache for hot codes; shard by code prefix at scale and collect click analytics via an async queue.",
      difficulty: "medium",
      keywords: ["url shortener", "base62", "hash", "redis", "cache", "redirect", "sharding", "cdn", "analytics", "rate limit"]
    },
    {
      q: "Design a rate limiter. What algorithms would you use?",
      a: "Algorithms: token bucket (allows bursts), leaky bucket (smooths), fixed/sliding window (simple vs accurate). In a distributed system, keep counters in Redis with atomic INCR + TTL. Apply per user/API key/IP and return 429 with Retry-After. Centralize at the API gateway.",
      difficulty: "medium",
      keywords: ["rate limiter", "token bucket", "leaky bucket", "fixed window", "sliding window", "redis", "429", "retry-after", "distributed", "atomic"]
    },
    {
      q: "How would you design a notification system?",
      a: "A service receives events, stores them, and dispatches via channel providers (email/SMS/push). Use a queue (Kafka/SQS) to decouple producers from delivery and handle retries. Templates render per channel/locale; user preferences filter channels and quiet hours; dedup via idempotency keys.",
      difficulty: "medium",
      keywords: ["notification", "channel", "email", "sms", "push", "queue", "kafka", "template", "preference", "retry"]
    },
    {
      q: "Design a distributed key-value store.",
      a: "Partition data with consistent hashing and replicate each key to N nodes for fault tolerance. Use quorum reads/writes and choose strong vs eventual consistency per your CAP needs. Resolve conflicts with vector clocks/versioning; detect failures via gossip; repair via read-repair and Merkle trees.",
      difficulty: "hard",
      keywords: ["key-value", "shard", "consistent hashing", "replication", "quorum", "cap", "vector clock", "lsm", "gossip", "cassandra"]
    },
    {
      q: "How would you design Twitter's timeline?",
      a: "Pull (fan-out on read) fetches and merge-sorts followed tweets per request — costly for heavy readers. Push (fan-out on write) appends to each follower's timeline cache — fast reads but expensive for huge followings. Hybrid: push for normal users, pull for celebrities.",
      difficulty: "hard",
      keywords: ["timeline", "fan-out", "push", "pull", "redis", "cache", "shard", "celebrity", "trending", "denormalize"]
    },
    {
      q: "Explain how you would design a file storage system.",
      a: "Like S3: store immutable objects under a key, with PUT/GET/DELETE on /bucket/key. Split large files into chunks replicated 3x (or erasure coded) across nodes; a metadata service maps keys to locations. Add a CDN for hot reads, multipart upload, versioning, and lifecycle tiering.",
      difficulty: "medium",
      keywords: ["file storage", "object", "bucket", "metadata", "chunk", "replication", "erasure", "cdn", "multipart", "versioning"]
    },
    {
      q: "Design a Video Streaming Platform like Netflix or YouTube.",
      a: "Store original video in S3, use an async processing worker pipeline to transcode into multiple resolutions (1080p, 4K) and formats (HLS/DASH). Serve content via global CDNs and cache user watch progress in Redis.",
      difficulty: "hard",
      keywords: ["video streaming", "transcoding", "hls", "dash", "cdn", "s3", "blob", "chunks"]
    }
  ],
  cloud: [
    {
      q: "Explain the difference between IaaS, PaaS, and SaaS.",
      a: "IaaS gives virtualized compute/storage/network (EC2, Azure VM) — you manage OS up. PaaS gives a managed runtime (Heroku, App Engine) — you deploy code. SaaS gives ready apps (Gmail, Slack) — you just use them. The trade-off is control vs. convenience.",
      difficulty: "easy",
      keywords: ["iaas", "paas", "saas", "infrastructure", "platform", "software", "ec2", "heroku", "salesforce", "managed"]
    },
    {
      q: "What is containerization and how does Docker work?",
      a: "Containers package an app with its deps into one runnable unit that runs consistently anywhere. Docker shares the host kernel and isolates via namespaces and cgroups; an image is a layered filesystem built from a Dockerfile, run as a container, distributed via a registry. Kubernetes orchestrates them at scale.",
      difficulty: "medium",
      keywords: ["container", "docker", "image", "namespace", "cgroup", "kernel", "dockerfile", "registry", "layer", "kubernetes"]
    },
    {
      q: "Explain the concept of blue-green deployment.",
      a: "Blue-green keeps two identical environments: blue (live) and green (new). Deploy to green, test, then flip the router from blue to green for zero-downtime release; flip back for instant rollback. Needs two environments, backward-compatible migrations, and externalized session state.",
      difficulty: "medium",
      keywords: ["blue-green", "deployment", "environment", "router", "switch", "rollback", "zero downtime", "load balancer", "canary", "migration"]
    },
    {
      q: "What is Infrastructure as Code? Give examples.",
      a: "Infrastructure as Code provisions infrastructure from version-controlled config files instead of manual steps. Tools: Terraform (declarative, multi-cloud), CloudFormation (AWS), Pulumi (real languages), Ansible (config mgmt). Benefits: reproducibility, review, and CI/CD for infrastructure.",
      difficulty: "easy",
      keywords: ["iac", "infrastructure as code", "terraform", "cloudformation", "pulumi", "ansible", "declarative", "version control", "provisioning", "ci/cd"]
    },
    {
      q: "How would you design a CI/CD pipeline?",
      a: "Stages: source (trigger on push) → build → test (unit/integration/lint) → package (Docker image to registry) → deploy to staging → acceptance tests → deploy to prod (blue-green/canary) → monitor and rollback on failure. Use feature flags to decouple deploy from release.",
      difficulty: "medium",
      keywords: ["ci/cd", "pipeline", "build", "test", "deploy", "staging", "production", "docker", "registry", "feature flag", "rollback"]
    },
    {
      q: "Explain the difference between horizontal and vertical scaling.",
      a: "Vertical scaling adds resources to one machine (CPU/RAM) — simple but capped and often needs downtime. Horizontal scaling adds machines — near-unlimited and no downtime, but requires stateless apps and adds load balancing and consistency complexity. Stateless services scale out easily.",
      difficulty: "medium",
      keywords: ["horizontal", "vertical", "scaling", "scale up", "scale out", "instance", "stateless", "load balancer", "sharding", "auto-scaling"]
    },
    {
      q: "What is Kubernetes and what problem does it solve?",
      a: "Kubernetes is an open-source container orchestration system that automates deployment, scaling, load balancing, service discovery, self-healing, and rolling updates for containerized applications across node clusters.",
      difficulty: "hard",
      keywords: ["kubernetes", "k8s", "orchestration", "pods", "services", "deployments", "auto-scaling", "self-healing"]
    }
  ],
  java: [
    {
      q: "Explain the difference between HashMap, Hashtable, and ConcurrentHashMap in Java.",
      a: "HashMap is unsynchronized, allows null key/values, and is not thread-safe. Hashtable is synchronized and legacy (disallows nulls). ConcurrentHashMap achieves thread-safety using fine-grained segment/bucket locking without locking the whole map, delivering much higher throughput under concurrency.",
      difficulty: "medium",
      keywords: ["hashmap", "hashtable", "concurrenthashmap", "synchronized", "thread-safe", "null", "bucket", "locking", "concurrency", "performance"]
    },
    {
      q: "What is Garbage Collection in Java and how do different collectors work?",
      a: "Java Garbage Collection (GC) automatically frees heap memory allocated to unreferenced objects using a generational hypothesis (Young, Old, Permanent/Metaspace). Collectors like G1 GC divide memory into regions and prioritize collecting regions with the most garbage for low latency.",
      difficulty: "hard",
      keywords: ["garbage collection", "gc", "heap", "g1 gc", "young generation", "old generation", "metaspace", "memory", "latency", "pause time"]
    },
    {
      q: "Explain OOP principles in Java with real-world examples.",
      a: "Encapsulation (hiding state via private fields and getters), Inheritance (extending base classes via `extends`), Polymorphism (overriding/overloading methods dynamically), and Abstraction (hiding implementation details via interfaces/abstract classes).",
      difficulty: "easy",
      keywords: ["oop", "encapsulation", "inheritance", "polymorphism", "abstraction", "interface", "abstract class", "overriding", "overloading", "extends"]
    },
    {
      q: "How does the JVM handle memory management (Heap vs Stack)?",
      a: "Stack memory stores primitive values and references to objects for specific threads (LIFO per method call execution). Heap memory stores actual object instances shared across all threads and managed by the Garbage Collector.",
      difficulty: "easy",
      keywords: ["jvm", "heap", "stack", "memory", "thread", "primitives", "references", "garbage collection", "lifo", "instance"]
    },
    {
      q: "What is Java Stream API and how does map/filter/reduce work?",
      a: "The Stream API introduced in Java 8 enables functional-style operations on collections. `filter()` removes elements matching predicates, `map()` transforms items, and `reduce()` collapses elements into a single aggregate result.",
      difficulty: "medium",
      keywords: ["stream api", "functional", "filter", "map", "reduce", "lambda", "collectors", "java 8"]
    },
    {
      q: "Explain CompletableFuture and asynchronous programming in Java.",
      a: "`CompletableFuture` allows non-blocking asynchronous programming in Java, supporting chaining via `thenApply()`, `thenAccept()`, and handling exceptions via `exceptionally()`.",
      difficulty: "hard",
      keywords: ["completablefuture", "async", "non-blocking", "threads", "futures", "java 8", "executor"]
    }
  ],
  cpp: [
    {
      q: "What is RAII (Resource Acquisition Is Initialization) in C++?",
      a: "RAII ties resource lifecycle (memory, file handles, mutex locks) to object lifetime. Resources are acquired in the constructor and released in the destructor. When an object goes out of scope, its destructor runs automatically, guaranteeing exception-safe cleanup.",
      difficulty: "medium",
      keywords: ["raii", "destructor", "constructor", "resource", "scope", "exception safety", "memory leak", "smart pointer", "lifetime", "cleanup"]
    },
    {
      q: "Explain smart pointers in C++11 (unique_ptr, shared_ptr, weak_ptr).",
      a: "std::unique_ptr enforces exclusive ownership (non-copyable, moveable). std::shared_ptr uses reference counting for shared ownership. std::weak_ptr provides a non-owning reference to prevent circular dependency memory leaks.",
      difficulty: "hard",
      keywords: ["smart pointer", "unique_ptr", "shared_ptr", "weak_ptr", "reference counting", "ownership", "memory leak", "circular reference", "raii", "move"]
    },
    {
      q: "What is the Virtual Method Table (vtable) and how does dynamic dispatch work?",
      a: "When a class has virtual functions, the compiler creates a vtable containing function pointers. Each object gets a vptr pointing to its class's vtable. At runtime, calling a virtual function looks up the pointer in vtable for dynamic polymorphism.",
      difficulty: "hard",
      keywords: ["vtable", "vptr", "virtual function", "polymorphism", "dynamic dispatch", "function pointer", "runtime", "base class", "override"]
    },
    {
      q: "Explain Move Semantics and std::move in C++11.",
      a: "Move semantics allow transferring resources (like heap memory pointers) from temporary (rvalue) objects to new objects without copying data, optimizing performance. `std::move` casts an lvalue to an rvalue reference.",
      difficulty: "hard",
      keywords: ["move semantics", "std::move", "rvalue reference", "lvalue", "copy elision", "performance"]
    },
    {
      q: "What is undefined behavior in C++? Give 3 common examples.",
      a: "Undefined behavior (UB) occurs when code executes operations for which the C++ standard places no requirements. Examples: dereferencing null/dangling pointers, out-of-bounds array access, and signed integer overflow.",
      difficulty: "medium",
      keywords: ["undefined behavior", "dangling pointer", "null pointer", "buffer overflow", "out of bounds", "integer overflow"]
    }
  ],
  "web-security": [
    {
      q: "What is Cross-Site Scripting (XSS) and how do you prevent it?",
      a: "XSS occurs when malicious scripts are injected into trusted websites. Types: Stored, Reflected, DOM-based. Prevention: context-aware output encoding/escaping, Content Security Policy (CSP) headers, using frameworks that auto-escape (React JSX), and setting HttpOnly cookies.",
      difficulty: "medium",
      keywords: ["xss", "cross-site scripting", "csp", "sanitization", "encoding", "httponly", "injection", "script", "escaping", "cookies"]
    },
    {
      q: "Explain Cross-Site Request Forgery (CSRF) and mitigation techniques.",
      a: "CSRF tricks an authenticated user into executing unwanted actions on a site where they are authenticated. Mitigations: Anti-CSRF tokens (synchronizer token pattern), SameSite cookie attributes (SameSite=Strict or Lax), and verifying Origin/Referer headers.",
      difficulty: "medium",
      keywords: ["csrf", "cross-site request forgery", "samesite", "token", "cookie", "origin", "referer", "authentication", "session", "headers"]
    },
    {
      q: "How does JWT (JSON Web Token) authentication work and what are security best practices?",
      a: "JWTs consist of Header, Payload, and Signature. Server signs the token with a secret key; client sends it in Authorization header (Bearer). Best practices: use short expiration (exp), store in HttpOnly secure cookies to avoid XSS, and use HTTPS.",
      difficulty: "easy",
      keywords: ["jwt", "bearer", "signature", "payload", "httponly", "token", "header", "expiration", "https", "authentication"]
    },
    {
      q: "What is SQL Injection (SQLi) and how do parameterized queries prevent it?",
      a: "SQLi happens when user input is concatenated directly into SQL query strings, allowing attackers to execute arbitrary SQL commands. Parameterized queries (prepared statements) separate SQL logic from data parameters.",
      difficulty: "easy",
      keywords: ["sqli", "sql injection", "parameterized query", "prepared statement", "sanitization", "database security"]
    },
    {
      q: "Explain Content Security Policy (CSP) headers and how they enhance security.",
      a: "CSP is an HTTP header that lets site administrators restrict which resources (JavaScript, CSS, Images, Frames) the browser is allowed to load for a given page, drastically reducing XSS and clickjacking vulnerabilities.",
      difficulty: "medium",
      keywords: ["csp", "content security policy", "http header", "xss", "script-src", "whitelisting"]
    }
  ],
  "machine-learning": [
    {
      q: "Explain the difference between supervised, unsupervised, and reinforcement learning.",
      a: "Supervised learning uses labeled training data (e.g. classification, regression). Unsupervised learning finds hidden patterns in unlabeled data (e.g. clustering with K-Means, PCA). Reinforcement learning learns actions in an environment to maximize rewards (e.g. Q-learning, RLHF).",
      difficulty: "easy",
      keywords: ["supervised", "unsupervised", "reinforcement", "labeled", "unlabeled", "clustering", "regression", "reward", "classification", "k-means"]
    },
    {
      q: "What is overfitting in ML and how do you prevent it?",
      a: "Overfitting happens when a model learns training noise rather than general patterns, performing great on train set but poorly on validation. Prevention: cross-validation, regularization (L1/L2), dropout, early stopping, pruning, and collecting more data.",
      difficulty: "medium",
      keywords: ["overfitting", "underfitting", "regularization", "dropout", "cross-validation", "early stopping", "generalization", "noise", "validation"]
    },
    {
      q: "How do Transformer models and Attention mechanisms work?",
      a: "Transformers process sequences in parallel using Self-Attention, computing query-key-value (Q, K, V) dot products to weigh the context of each word relative to every other word regardless of position. Powers LLMs like GPT and BERT.",
      difficulty: "hard",
      keywords: ["transformer", "attention", "self-attention", "query", "key", "value", "llm", "bert", "gpt", "sequence"]
    },
    {
      q: "What is the difference between Precision and Recall? How does the F1-Score combine them?",
      a: "Precision measures true positives out of all predicted positives (quality). Recall measures true positives out of all actual positives (quantity). F1-Score is the harmonic mean of Precision and Recall.",
      difficulty: "medium",
      keywords: ["precision", "recall", "f1-score", "harmonic mean", "confusion matrix", "classification", "metrics"]
    },
    {
      q: "Explain Gradient Descent and the Learning Rate parameter.",
      a: "Gradient Descent is an optimization algorithm that iteratively minimizes a loss function by taking steps proportional to the negative of the gradient. The learning rate controls step size: too high overshoots, too low converges slowly.",
      difficulty: "easy",
      keywords: ["gradient descent", "learning rate", "loss function", "optimization", "adam", "sgd", "convergence"]
    }
  ]
};

const dailyChallengeQuestions = [
  "Tell me about a time you solved a problem no one else could.",
  "Explain a complex technical concept to a non-technical audience.",
  "Describe your ideal team environment.",
  "What's the most impactful piece of code you've written?",
  "How do you stay current with new technologies?",
  "Describe a time you had to learn something entirely new quickly."
];

const skillKeywords = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "SQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "REST API",
  "GraphQL",
  "CI/CD",
  "Agile",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Teamwork",
  "Testing",
  "Microservices",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Linux"
];

export {
  dailyChallengeQuestions,
  difficultyLevels,
  hrTopics,
  interviewCategories,
  mockQuestionBank,
  skillKeywords,
  technicalTopics
};
