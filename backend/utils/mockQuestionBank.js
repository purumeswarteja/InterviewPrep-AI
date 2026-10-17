// Smart skill-aware and difficulty-aware question & actual answer bank for technical interviews

const CURATED_QUESTIONS = {
  html: {
    Easy: [
      {
        question: (s, r) => `What is semantic HTML, and why is it important for accessibility and SEO compared to generic <div> tags?`,
        answer: (s, r) => `Semantic HTML means using HTML elements according to their intended meaning rather than generic tags like <div> or <span>.

Key points:
• Core Elements: <header>, <nav>, <main>, <article>, <section>, <aside>, and <footer>.
• Accessibility (a11y): Screen readers use semantic landmarks to build an accessibility tree, allowing users to jump directly to primary content or navigation.
• SEO: Search engine crawlers (e.g. Googlebot) use semantic markup and heading hierarchies (<h1>-<h6>) to understand page structure and index relevant content.
• Code Maintainability: Semantic code is self-documenting and significantly easier for engineering teams to read and style.`
      },
      {
        question: (s, r) => `How do you properly associate a <label> element with an <input> element in an HTML form, and why is this critical for usability?`,
        answer: (s, r) => `There are two standard ways to associate a <label> with an <input>:
1. Explicit binding (Recommended): Match the label's 'for' attribute to the input's 'id':
   <label for="user-email">Email Address</label>
   <input type="email" id="user-email" name="email" />

2. Implicit nesting: Wrap the input inside the label:
   <label>Email Address <input type="email" name="email" /></label>

Why it matters:
• Accessibility: Screen readers announce the label when the field is focused.
• Usability: Clicking the label focuses the input or toggles checkboxes/radio buttons, increasing the clickable target area.`
      },
      {
        question: (s, r) => `Explain the difference between block-level, inline, and inline-block elements in HTML.`,
        answer: (s, r) => `1. Block elements (e.g., <div>, <p>, <h1>, <section>):
• Start on a new line and stretch to fill the full width of their parent container.
• Respect width, height, margin, and padding on all four sides.

2. Inline elements (e.g., <span>, <a>, <strong>, <em>):
• Flow within surrounding text without starting on a new line.
• Width and height cannot be set; only horizontal margins and padding affect layout.

3. Inline-block elements (e.g., <button>, <input>, <img>, or CSS display: inline-block):
• Flow inline with text like inline elements, but respect width, height, and vertical margins/padding like block elements.`
      },
      {
        question: (s, r) => `What is the purpose of the <meta name="viewport"> tag in responsive web design?`,
        answer: (s, r) => `The viewport meta tag tells mobile browsers how to control the page's dimensions and scaling:
<meta name="viewport" content="width=device-width, initial-scale=1.0">

Without it, mobile browsers assume a desktop page width (typically 980px) and scale the entire page down to fit the screen, resulting in tiny, unreadable text. Setting 'width=device-width' matches the screen width in device-independent pixels, and 'initial-scale=1.0' sets a 1:1 zoom ratio.`
      },
      {
        question: (s, r) => `What are HTML data-* attributes, and what is an example of when you would use them?`,
        answer: (s, r) => `HTML5 data-* attributes allow storing extra custom data directly on standard HTML elements without using non-standard attributes or hacky classes.

Example:
<button data-user-id="1042" data-action="delete" class="btn">Delete User</button>

Accessing in JavaScript:
const btn = document.querySelector('.btn');
const userId = btn.dataset.userId; // '1042' (camelCased from data-user-id)

Accessing in CSS:
button[data-action="delete"] { background-color: #ef4444; }`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Explain how the defer and async attributes on <script> tags change HTML parsing and script execution order.`,
        answer: (s, r) => `Default <script src="...">:
• Pauses HTML parsing immediately, fetches the script over the network, executes it, and then resumes HTML parsing.

async (<script async src="...">):
• Fetches the script asynchronously in parallel with HTML parsing.
• As soon as download completes, it pauses HTML parsing to execute the script immediately.
• Scripts execute out-of-order as soon as they load. Best for independent scripts like analytics.

defer (<script defer src="...">):
• Fetches the script asynchronously in parallel with HTML parsing.
• Waits until the entire HTML document is parsed before executing.
• Executes scripts in exact DOM order just before DOMContentLoaded. Best for scripts that depend on the DOM or other scripts.`
      },
      {
        question: (s, r) => `What are the key differences between localStorage, sessionStorage, and cookies in terms of capacity, scope, and network transmission?`,
        answer: (s, r) => `1. Capacity:
• localStorage & sessionStorage: ~5MB to 10MB per origin.
• cookies: ~4KB per cookie.

2. Lifecycle:
• localStorage: Persists indefinitely until explicitly cleared.
• sessionStorage: Persists only for the duration of the browser tab session.
• cookies: Configurable via Expires or Max-Age attributes; can be session-only or persistent.

3. Network Transmission:
• localStorage & sessionStorage: Client-only; never automatically sent to the server.
• cookies: Automatically sent with every HTTP request in the 'Cookie' header (can impact network performance if large).

4. Security:
• Cookies support HttpOnly (prevents JavaScript/XSS access) and SameSite/Secure flags.`
      },
      {
        question: (s, r) => `How does the browser construct the DOM and CSSOM trees, and what causes a script or stylesheet to be render-blocking?`,
        answer: (s, r) => `1. DOM (Document Object Model) Construction:
• Bytes → Characters → Tokens → Nodes → DOM Tree.
• Parsing is incremental as HTML streams in.

2. CSSOM (CSS Object Model) Construction:
• Stylesheets are downloaded and parsed into the CSSOM tree.
• CSS is render-blocking because the browser cannot render without both DOM and CSSOM (which combine into the Render Tree).

3. Render-Blocking Scripts:
• Synchronous <script> tags pause HTML parsing because scripts can call document.write() or inspect the DOM/CSSOM.
• The browser also waits for pending stylesheets to finish before running synchronous JS to avoid style race conditions.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Explain the Critical Rendering Path in depth. What strategies do you use as a ${r} to minimize layout thrashing and reflows?`,
        answer: (s, r) => `The Critical Rendering Path (CRP) is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels on screen:
1. DOM & CSSOM construction → 2. Render Tree generation → 3. Layout (geometry calculation) → 4. Paint (rasterizing pixels) → 5. Composite (layer assembly via GPU).

Minimizing Layout Thrashing & Reflows:
• Batch DOM reads and writes (avoid reading offsetHeight/scrollTop immediately after modifying styles).
• Use requestAnimationFrame for visual updates.
• Animate only composite properties: transform and opacity (handled by GPU without triggering Layout or Paint).
• Use CSS 'contain: strict' or 'will-change' sparingly to isolate reflow boundaries.
• Use DocumentFragment or modern virtual DOM to batch DOM mutations.`
      },
      {
        question: (s, r) => `How do Web Components work (Custom Elements, Shadow DOM, and HTML Templates), and what are the style encapsulation trade-offs?`,
        answer: (s, r) => `Web Components are built on three web standards:
1. Custom Elements: JavaScript API (customElements.define()) allowing creation of custom HTML tags with lifecycle callbacks (connectedCallback, disconnectedCallback, attributeChangedCallback).
2. Shadow DOM: Provides scoped DOM subtrees and CSS encapsulation. Styles defined inside a shadow root do not leak out, and page styles do not leak in.
3. HTML Templates (<template> & <slot>): Inactive markup fragments cloned at runtime, using <slot> for content projection.

Encapsulation Trade-offs:
• Pro: Zero CSS name collisions; modular and framework-agnostic.
• Con: Theming across shadow boundaries requires CSS Custom Properties (--var) or ::part() pseudo-elements; SSR hydration can be complex.`
      }
    ]
  },
  css: {
    Easy: [
      {
        question: (s, r) => `Explain the CSS Box Model: what are content, padding, border, and margin, and how does box-sizing: border-box change calculations?`,
        answer: (s, r) => `The CSS Box Model consists of 4 layers from inside out:
1. Content: The actual text, image, or media.
2. Padding: Transparent space between the content and the border.
3. Border: The line wrapping the padding and content.
4. Margin: Transparent space outside the border separating elements.

box-sizing difference:
• content-box (default): Total width = width + padding-left + padding-right + border-left + border-right.
• border-box: Total width = specified width. Padding and border are subtracted from the interior content area, making layout sizing predictable.`
      },
      {
        question: (s, r) => `What is the difference between CSS classes and IDs, and how does selector specificity determine which style applies?`,
        answer: (s, r) => `1. IDs vs Classes:
• IDs (#id): Must be unique within a document. Carries higher specificity (0, 1, 0, 0).
• Classes (.class): Can be reused across multiple elements. Lower specificity (0, 0, 1, 0).

2. Specificity Hierarchy (from lowest to highest):
• Universal (*) & Type selectors (div, p): (0, 0, 0, 1)
• Classes, pseudo-classes (:hover), attribute selectors ([type="text"]): (0, 0, 1, 0)
• IDs (#header): (0, 1, 0, 0)
• Inline styles (style="..."): (1, 0, 0, 0)
• !important: Overrides all standard specificity levels.`
      },
      {
        question: (s, r) => `In CSS Flexbox, what is the difference between justify-content and align-items?`,
        answer: (s, r) => `In Flexbox:
• justify-content aligns flex items along the MAIN axis (horizontal by default when flex-direction is row). Options: flex-start, flex-end, center, space-between, space-around, space-evenly.
• align-items aligns flex items along the CROSS axis (vertical by default when flex-direction is row). Options: stretch, center, flex-start, flex-end, baseline.

Note: When flex-direction is 'column', the main axis becomes vertical and the cross axis becomes horizontal.`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Compare CSS Grid and CSS Flexbox: in what layout scenarios would you choose one over the other for a ${r} project?`,
        answer: (s, r) => `1. Dimensionality:
• Flexbox is 1-dimensional (arranges items along a row OR a column).
• CSS Grid is 2-dimensional (arranges items simultaneously across rows AND columns).

2. When to choose Flexbox:
• Navigation bars, button groups, aligning icons next to text, distributing items within a single row or column.
• Content-driven layouts where element sizing dictates placement.

3. When to choose CSS Grid:
• Overall page layouts (header, sidebar, main, footer).
• Complex photo galleries, dashboards, or card grids where both row heights and column widths must align rigidly.`
      },
      {
        question: (s, r) => `Explain CSS Stacking Context: what creates a new stacking context, and why might an element with a higher z-index still appear behind another?`,
        answer: (s, r) => `A Stacking Context is a 3D conceptualization of HTML elements along an imaginary z-axis relative to the user.

What creates a new stacking context:
• The root <html> element.
• Positioned elements (relative, absolute, fixed, sticky) with a z-index other than 'auto'.
• opacity less than 1.
• transform, filter, clip-path, or perspective other than 'none'.
• will-change or contain properties.

Why a higher z-index appears behind:
• z-index is only evaluated within its own parent stacking context.
• If Element A has z-index: 999 inside Parent 1, but Parent 1 is inside a stacking context with lower priority than Parent 2, Element A will render behind everything in Parent 2 regardless of its 999 z-index.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Walk through the browser's Layout, Paint, and Composite stages. How do you trigger GPU compositing without excessive memory consumption?`,
        answer: (s, r) => `Browser Rendering Pipeline:
1. Layout (Reflow): Calculates the exact geometry (position and size) of each visible element. Heavy CPU operation.
2. Paint (Repaint): Fills in pixels (colors, borders, shadows, text) into bitmap surfaces.
3. Composite: Combines separate painted layers and draws them to the screen using the GPU.

Optimizing GPU Compositing:
• Animate only 'transform' and 'opacity' properties; they skip both Layout and Paint and execute directly on the GPU composite thread.
• Use CSS 'will-change: transform' only on active animations, and remove it when animation ends to prevent permanent GPU VRAM layer allocation.
• Avoid promoting too many DOM elements to GPU layers (layer explosion), which exhausts device memory.`
      }
    ]
  },
  javascript: {
    Easy: [
      {
        question: (s, r) => `Explain the difference between var, let, and const regarding scope, hoisting, and re-assignment.`,
        answer: (s, r) => `1. Scope:
• var: Function-scoped (or globally scoped). It ignores block {} boundaries (such as if/for statements).
• let & const: Block-scoped. Only accessible within the nearest enclosing curly braces {}.

2. Hoisting & Temporal Dead Zone (TDZ):
• var: Hoisted to the top of its scope and initialized with 'undefined'.
• let & const: Hoisted but uninitialized. Accessing them before their declaration line throws a ReferenceError (TDZ).

3. Re-assignment & Mutability:
• var & let: Can be freely reassigned.
• const: Cannot be reassigned. However, properties inside const objects or items inside const arrays can still be mutated.`
      },
      {
        question: (s, r) => `What is the difference between double equals (==) and triple equals (===) in JavaScript? Give an example of type coercion.`,
        answer: (s, r) => `1. Double Equals (==) - Loose Equality:
• Performs automatic type coercion before comparing values if they have different data types.
• Example: '5' == 5 evaluates to true (string '5' is coerced to number 5).
• Example: null == undefined evaluates to true.
• Example: 0 == false evaluates to true.

2. Triple Equals (===) - Strict Equality:
• Compares both the value AND the data type without type coercion.
• Example: '5' === 5 evaluates to false (string vs number).
• Industry standard: Always use === to prevent subtle bugs caused by unexpected coercion.`
      },
      {
        question: (s, r) => `What is a JavaScript closure? Provide a simple, practical code example of where closures are useful.`,
        answer: (s, r) => `A closure is a function bundled together with references to its surrounding lexical environment. A closure gives an inner function access to an outer function's scope even after the outer function has finished executing.

Practical Example (Data Privacy / Encapsulation):
function createCounter() {
  let count = 0; // Private variable
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
console.log(counter.getCount()); // 2
// count cannot be accessed or modified directly from outside!`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Explain how the JavaScript Event Loop coordinates the Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (setTimeout).`,
        answer: (s, r) => `The Event Loop coordinates single-threaded JavaScript execution:
1. Call Stack: Executes synchronous code one frame at a time.
2. Web APIs: Handles asynchronous operations in the background (DOM events, fetch requests, setTimeout timers).
3. Microtask Queue: Holds Promise callbacks (.then, .catch, .finally), queueMicrotask(), and MutationObserver callbacks.
4. Macrotask (Task) Queue: Holds setTimeout, setInterval, setImmediate, and I/O callbacks.

Execution Priority:
• Synchronous code on the Call Stack runs to completion.
• When the stack is empty, the Event Loop executes ALL pending microtasks until the Microtask Queue is completely drained.
• Only after the microtask queue is empty does the Event Loop pick ONE macrotask from the Task Queue.
• Microtasks always take priority over macrotasks!`
      },
      {
        question: (s, r) => `How does the 'this' keyword get bound in JavaScript (default, implicit, explicit with call/apply/bind, and lexical in arrow functions)?`,
        answer: (s, r) => `'this' binding is determined by how a function is called:
1. Default Binding: Standalone function call. Points to global object (window) or 'undefined' in strict mode.
2. Implicit Binding: Method called on an object (e.g. user.getName()). 'this' points to the object before the dot (user).
3. Explicit Binding: Using .call(obj, ...args), .apply(obj, [args]), or .bind(obj) to explicitly force 'this' to point to obj.
4. 'new' Binding: When a function is called with 'new', 'this' points to the newly instantiated instance.
5. Arrow Functions: Do NOT have their own 'this'. They inherit 'this' lexically from their enclosing parent scope at definition time and cannot be rebound.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `How does V8's garbage collector (Orinoco/Scavenge for young generation vs Mark-Sweep for old generation) work, and how do memory leaks happen in JavaScript?`,
        answer: (s, r) => `V8 Garbage Collection Architecture (Generational Hypothesis):
1. Young Generation (Scavenge / Semi-Space):
• Newly allocated objects go here. Uses a Cheney copy algorithm dividing memory into From-Space and To-Space.
• Fast, frequent minor GC. Objects surviving multiple cycles are promoted to the Old Generation.

2. Old Generation (Major GC / Mark-Sweep-Compact):
• Mark: Traces all reachable objects from GC roots (window, call stack, global variables).
• Sweep: Reclaims unreferenced memory blocks.
• Compact: Defragments remaining memory.

Common JavaScript Memory Leaks:
• Forgotten timers (setInterval) retaining referenced scope.
• Detached DOM nodes retained in JavaScript arrays/objects.
• Unremoved global event listeners.
• Accidental global variables or closures capturing unwanted large outer objects.`
      }
    ]
  },
  react: {
    Easy: [
      {
        question: (s, r) => `What is JSX in React, and how does React turn JSX into rendered DOM elements?`,
        answer: (s, r) => `JSX (JavaScript XML) is a syntax extension for JavaScript that allows writing HTML-like markup inside JavaScript files.

How React processes JSX:
1. Transpilation: Compilers like Babel or SWC transform JSX tags into React function calls:
   <div><h1>Hello</h1></div> → React.createElement('div', null, React.createElement('h1', null, 'Hello'))
   (or the new JSX transform: _jsx('h1', { children: 'Hello' }))
2. Virtual DOM Element: The call returns a lightweight plain JavaScript object (Virtual DOM node) describing the element and its props.
3. DOM Rendering: ReactDOM uses this Virtual DOM representation to create and update actual browser DOM nodes efficiently.`
      },
      {
        question: (s, r) => `Explain the useState hook in React and why state should never be mutated directly.`,
        answer: (s, r) => `useState allows functional components to store and maintain local state across renders:
const [count, setCount] = useState(0);

Why state must NEVER be mutated directly (e.g. user.name = 'Alice'):
1. Shallow Equality Comparison: React relies on Object.is() identity checks to detect whether state has changed and trigger a re-render. Mutating the existing object retains the same memory reference, causing React to skip the re-render.
2. Predictability: Direct mutations break component purity, time-travel debugging, concurrent mode optimizations, and PureComponent/React.memo optimizations.
3. Solution: Always return a new copy (e.g. setUser(prev => ({ ...prev, name: 'Alice' }))).`
      },
      {
        question: (s, r) => `Why is the 'key' prop necessary when rendering lists in React, and what happens if you use the array index for dynamically reordered lists?`,
        answer: (s, r) => `The 'key' prop gives each list element a stable identity that React's reconciliation diffing algorithm uses to match Virtual DOM elements across renders.

Problems with using array indices as keys (key={index}):
• If items are filtered, sorted, deleted, or inserted at the beginning, the index for existing items changes.
• React thinks the element at index 0 is the same element, leading to visual bugs in uncontrolled inputs, broken CSS transition animations, and performance degradation.
• Best practice: Always use a unique, stable ID from your data (e.g., item.id).`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Explain how useEffect works: how does the dependency array control execution, and why are cleanup functions essential?`,
        answer: (s, r) => `useEffect handles side effects (data fetching, subscriptions, manual DOM manipulation) in functional components:

Dependency Array Behavior:
• No dependency array: Runs after EVERY render.
• Empty array []: Runs ONCE after the initial component mount.
• Array with values [id, query]: Runs after mount and whenever any dependency value changes (by Object.is comparison).

Why Cleanup Functions are Essential:
• The returned function runs before the component unmounts and before the effect re-runs with new dependencies.
• Prevents memory leaks by clearing intervals (clearInterval), canceling network requests (AbortController), and removing event listeners (removeEventListener).`
      },
      {
        question: (s, r) => `Compare useMemo and useCallback: what problem do they solve, and when does premature memoization hurt performance?`,
        answer: (s, r) => `1. Definitions:
• useMemo(() => computeValue(a, b), [a, b]): Caches the RESULT of an expensive computation.
• useCallback((x) => doSomething(x), [deps]): Caches the FUNCTION DEFINITION itself to preserve reference equality across renders.

2. Primary Use Cases:
• useMemo: Expensive calculations (filtering/sorting 10,000 items) or stabilizing dependency objects passed to other hooks.
• useCallback: Passing callbacks to optimized child components wrapped in React.memo to prevent unnecessary re-renders.

3. When premature memoization hurts:
• Every hook call adds memory overhead and array comparison checks on every render.
• Wrapping cheap, simple functions (like onClick={() => setOpen(false)}) in useCallback creates unnecessary complexity with zero performance benefit.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Explain React 18 Fiber architecture and concurrent rendering: how do useTransition and useDeferredValue schedule interruptible work?`,
        answer: (s, r) => `1. React Fiber Architecture:
• Complete rewrite of React's core reconciler.
• Represents components as a linked-list tree of 'Fiber' nodes.
• Replaces synchronous call-stack recursion with an interruptible, cooperative scheduling loop via requestIdleCallback/MessageChannel.

2. Concurrent Rendering:
• React can pause, abort, or prioritize rendering work based on urgency.

3. useTransition & useDeferredValue:
• useTransition(): Marks state updates as non-urgent transitions (e.g. switching tabs, rendering large graphs) while keeping urgent interactions (typing in an input) responsive.
• useDeferredValue(): Defers updating a value until urgent renders finish, displaying stale content smoothly without blocking user input.`
      }
    ]
  },
  sql: {
    Easy: [
      {
        question: (s, r) => `What is the difference between the WHERE and HAVING clauses in SQL, and when would you use each?`,
        answer: (s, r) => `1. WHERE Clause:
• Filters individual rows BEFORE any grouping or aggregation takes place.
• Cannot contain aggregate functions (e.g. WHERE SUM(sales) > 500 is illegal).
• Applied directly to tables or joined tables.

2. HAVING Clause:
• Filters grouped records AFTER the GROUP BY clause and aggregate calculations occur.
• Designed specifically for conditions involving aggregate functions.

Example:
SELECT department_id, AVG(salary) AS avg_sal
FROM employees
WHERE status = 'Active'         -- Filters individual rows first
GROUP BY department_id
HAVING AVG(salary) > 60000;      -- Filters groups after aggregation`
      },
      {
        question: (s, r) => `Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with a brief example.`,
        answer: (s, r) => `Given Table A (Users) and Table B (Orders):
1. INNER JOIN: Returns only rows where there is a match in BOTH tables (Users with at least one Order).
2. LEFT JOIN (or LEFT OUTER JOIN): Returns ALL rows from Table A, plus matched rows from Table B. Unmatched rows from Table B contain NULL.
3. RIGHT JOIN: Returns ALL rows from Table B, plus matched rows from Table A. Unmatched rows from Table A contain NULL.
4. FULL OUTER JOIN: Returns all rows when there is a match in either table. If there is no match on either side, NULL is filled in.`
      },
      {
        question: (s, r) => `What are PRIMARY KEY and FOREIGN KEY constraints, and why are they fundamental to relational databases?`,
        answer: (s, r) => `1. PRIMARY KEY:
• Uniquely identifies each record in a database table.
• Must contain UNIQUE values and CANNOT contain NULL values.
• A table can only have one primary key (which can be a single column or composite of multiple columns).

2. FOREIGN KEY:
• A column (or set of columns) that references the PRIMARY KEY of another table.
• Enforces Referential Integrity: Ensures relationships between tables remain consistent and prevents orphan records (e.g., cannot create an Order for a non-existent User).`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Explain SQL Window Functions (such as ROW_NUMBER(), RANK(), DENSE_RANK(), and LAG()/LEAD()) and how the OVER clause partitions and orders data.`,
        answer: (s, r) => `Window functions perform calculations across a set of table rows related to the current row without collapsing the rows into a single summary (unlike GROUP BY):

1. The OVER Clause:
• PARTITION BY: Divides rows into groups (windows).
• ORDER BY: Defines the logical order of rows within each partition.

2. Common Functions:
• ROW_NUMBER(): Assigns a unique, sequential integer (1, 2, 3...) starting at 1 for each partition.
• RANK(): Assigns rank with gaps for ties (e.g. 1, 2, 2, 4).
• DENSE_RANK(): Assigns rank without gaps for ties (e.g. 1, 2, 2, 3).
• LAG(col, n) / LEAD(col, n): Accesses data from preceding or succeeding rows within the window without self-joins.`
      },
      {
        question: (s, r) => `What are Common Table Expressions (CTEs), and how do recursive CTEs work for hierarchical or organizational chart queries?`,
        answer: (s, r) => `A Common Table Expression (CTE) is a temporary named result set defined using the WITH clause that exists only within the execution scope of a single query.

Recursive CTEs (for organizational charts, file trees, graph traversals):
• Anchor Member: Base query that returns the starting root nodes (e.g. Top CEO where manager_id IS NULL).
• UNION ALL: Combines results.
• Recursive Member: Joins the CTE with the base table on the parent-child relationship (e.g. employees.manager_id = cte.employee_id) until no new rows are returned.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Explain transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) and the anomalies they prevent (dirty reads, non-repeatable reads, phantom reads).`,
        answer: (s, r) => `Transaction Isolation Levels & Concurrency Anomalies:

1. Anomalies:
• Dirty Read: Reading uncommitted data written by a concurrent transaction that might later roll back.
• Non-Repeatable Read: Re-reading the same row within a transaction and seeing modified data because another transaction committed an UPDATE.
• Phantom Read: Re-running a range query and seeing new rows inserted or deleted by another committed transaction.

2. Isolation Levels (ANSI SQL):
• Read Uncommitted: Lowest isolation. Allows all anomalies (including dirty reads).
• Read Committed (Default in Postgres): Prevents Dirty Reads. Uses read snapshots per query.
• Repeatable Read (Default in MySQL InnoDB): Prevents Dirty & Non-Repeatable Reads. Uses a consistent snapshot established at transaction start.
• Serializable: Highest isolation. Prevents all anomalies by enforcing strict serial execution via multi-version concurrency control (MVCC) or predicate locks.`
      }
    ]
  },
  nodejs: {
    Easy: [
      {
        question: (s, r) => `What is Node.js, and what does it mean that Node.js runs on a single-threaded, asynchronous event-driven runtime?`,
        answer: (s, r) => `Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 JavaScript engine.

What single-threaded, asynchronous non-blocking means:
• Main Thread: JavaScript code executes on a single main thread with a single call stack.
• Asynchronous I/O: Heavy operations (disk reads/writes, network sockets, database queries) are delegated to the underlying OS kernel or the libuv C++ background thread pool.
• Callback / Event Loop: When an asynchronous operation completes, its callback is queued onto the event loop to run on the main thread without blocking incoming traffic.`
      },
      {
        question: (s, r) => `What is the difference between CommonJS (require/module.exports) and ES Modules (import/export) in Node.js?`,
        answer: (s, r) => `1. CommonJS (CJS):
• Node.js traditional module system: const fs = require('fs'); module.exports = myFunc;
• Synchronous loading: Modules are loaded and executed at runtime when require() is called.
• File extension: .js or .cjs.

2. ES Modules (ESM):
• Official ECMAScript standard: import fs from 'fs'; export default myFunc;
• Asynchronous static analysis: Imports are resolved at compile/parse time before code execution, enabling tree-shaking and top-level await.
• File extension: .mjs or setting "type": "module" in package.json.`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Explain the phases of the Node.js Event Loop (Timers, Pending I/O, Poll, Check/setImmediate, Close) and where process.nextTick fits.`,
        answer: (s, r) => `The Node.js libuv Event Loop has 6 distinct phases executed in order:
1. Timers: Executes callbacks scheduled by setTimeout() and setInterval().
2. Pending Callbacks: Executes I/O callbacks deferred to the next loop iteration (e.g. system socket errors).
3. Idle, Prepare: Internal libuv house-keeping.
4. Poll: Retrieves new I/O events and executes I/O-related callbacks; blocks for incoming connections when appropriate.
5. Check: Executes callbacks registered by setImmediate().
6. Close Callbacks: Executes close event callbacks (e.g. socket.on('close')).

Where process.nextTick() fits:
• process.nextTick is NOT part of the event loop. It executes immediately after the current operation completes, BEFORE the event loop transitions to any other phase.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `How does the libuv thread pool work behind Node.js, which APIs utilize it, and how does sizing UV_THREADPOOL_SIZE impact disk/crypto throughput?`,
        answer: (s, r) => `1. libuv Thread Pool Architecture:
• Node's JavaScript execution is single-threaded, but libuv maintains a background C thread pool (default size = 4).
• Network I/O (TCP/UDP/HTTP) does NOT use the thread pool; it uses OS non-blocking primitives (epoll on Linux, kqueue on macOS, IOCP on Windows).

2. APIs that use the thread pool:
• File System (fs.* asynchronous file calls).
• DNS Lookups (dns.lookup() which uses getaddrinfo(3)).
• Cryptography (crypto.pbkdf2, crypto.randomBytes, crypto.scrypt).
• Compression (zlib.*).

3. Tuning UV_THREADPOOL_SIZE:
• In high-concurrency file processing or password-hashing microservices, 4 threads can easily bottleneck.
• Setting process.env.UV_THREADPOOL_SIZE = 64 (max 128) before starting the server scales parallel throughput.`
      }
    ]
  },
  python: {
    Easy: [
      {
        question: (s, r) => `What are the key differences between Python lists, tuples, and sets in terms of mutability, ordering, and performance?`,
        answer: (s, r) => `1. Lists ([]):
• Mutable: Elements can be added, updated, or removed.
• Ordered: Maintains insertion order; accessible by integer index.

2. Tuples (()):
• Immutable: Once created, elements cannot be modified.
• Ordered: Accessible by index; faster and uses less memory than lists.
• Can be used as dictionary keys if all items are hashable.

3. Sets ({}):
• Mutable (frozenset is immutable).
• Unordered: No duplicate elements allowed.
• Fast O(1) membership lookups (x in my_set) using hash tables.`
      }
    ],
    Medium: [
      {
        question: (s, r) => `What are Python generators and the yield keyword, and how do they optimize memory usage when processing massive datasets?`,
        answer: (s, r) => `A generator is a function that produces a sequence of values lazily on-demand rather than computing all values up-front and storing them in memory.

How it works:
• When a function contains the 'yield' keyword, calling it returns a generator iterator object.
• Each time next() is called (or in a for-loop), the function executes until it hits 'yield', yields the value, and pauses its execution state.
• Memory optimization: Generating 10,000,000 rows with a list requires hundreds of megabytes of RAM; a generator maintains constant O(1) memory usage regardless of dataset size.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Explain Python's Global Interpreter Lock (GIL): why does it exist, and how does it impact multi-threading vs multi-processing in CPU-bound vs I/O-bound tasks?`,
        answer: (s, r) => `The Global Interpreter Lock (GIL) is a mutex in CPython that prevents multiple native OS threads from executing Python bytecode simultaneously.

Why it exists:
• Simplifies CPython memory management and protects reference counting garbage collection from race conditions without complex fine-grained locking.

Impact on concurrency:
1. I/O-Bound Tasks (network requests, database queries, disk I/O):
• Multi-threading works effectively because Python releases the GIL while waiting for OS I/O operations.
2. CPU-Bound Tasks (machine learning, video encoding, numerical processing):
• Multi-threading provides NO speedup (threads compete for the single GIL).
• Solution: Use multiprocessing (e.g. concurrent.futures.ProcessPoolExecutor) to spawn separate processes with separate Python interpreters and independent GILs.`
      }
    ]
  },
  datascience: {
    Easy: [
      {
        question: (s, r) => `What is the difference between Supervised, Unsupervised, and Reinforcement Learning?`,
        answer: (s, r) => `1. Supervised Learning:
• The model trains on labeled data (input features X mapped to target ground-truth labels y).
• Examples: Linear Regression, Logistic Regression, Decision Trees, Random Forests.
• Tasks: Classification (spam vs not spam) and Regression (predicting housing prices).

2. Unsupervised Learning:
• The model trains on unlabeled data to discover hidden patterns, clusters, or distributions.
• Examples: K-Means, Hierarchical Clustering, PCA, Autoencoders.

3. Reinforcement Learning:
• An agent learns to make sequential decisions in an environment to maximize cumulative reward through trial and error.
• Examples: Q-Learning, Deep Q Networks (DQN), PPO.`
      },
      {
        question: (s, r) => `What is the difference between Precision and Recall, and in what scenario (e.g., fraud detection vs spam filtering) would you prioritize one over the other?`,
        answer: (s, r) => `1. Definitions:
• Precision = True Positives / (True Positives + False Positives)
  Of all items predicted as positive, how many were actually positive?
• Recall (Sensitivity) = True Positives / (True Positives + False Negatives)
  Of all actual positive items, how many did the model correctly identify?

2. When to prioritize:
• Prioritize Recall: In Fraud Detection or Disease Diagnosis, missing a positive case (False Negative) is dangerous or catastrophic. You want high recall even if it means some false alarms.
• Prioritize Precision: In Spam Detection or YouTube Video Recommendations, sending an important client email to the spam folder (False Positive) is unacceptable. You want high precision.`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Explain the Bias-Variance tradeoff and how ensemble methods (Bagging like Random Forest vs Boosting like XGBoost/LightGBM) address it.`,
        answer: (s, r) => `1. Bias vs Variance:
• High Bias (Underfitting): Model is overly simplistic and fails to capture patterns in training data (high training and validation error).
• High Variance (Overfitting): Model is overly complex and memorizes training noise (low training error, high validation error).

2. Ensemble Methods:
• Bagging (Bootstrap Aggregating, e.g. Random Forest): Trains multiple deep, high-variance trees in parallel on bootstrap samples and averages predictions. Primarily REDUCES VARIANCE without increasing bias.
• Boosting (e.g. XGBoost, LightGBM): Sequentially trains shallow, high-bias weak learners where each subsequent tree corrects errors made by prior trees. Primarily REDUCES BIAS.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Explain the multi-head self-attention mechanism in Transformers (Query, Key, Value) and why its time complexity is O(N^2) relative to sequence length.`,
        answer: (s, r) => `Self-Attention Mechanism:
1. Projections: Each input token embedding is projected into Query (Q), Key (K), and Value (V) matrices using learned weight matrices.
2. Attention Weights: Computed as Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V.
• Q * K^T computes dot-product pairwise similarity between every token and every other token in the sequence.
• Softmax normalizes similarities into attention weights representing how much attention each token pays to every other token.

3. Why Complexity is O(N^2):
• Computing Q (N x d) times K^T (d x N) yields an N x N attention matrix.
• Every token attends to every token in the sequence, causing quadratic memory and computational scaling with sequence length N.`
      }
    ]
  },
  systemdesign: {
    Easy: [
      {
        question: (s, r) => `What is the difference between horizontal scaling (scaling out) and vertical scaling (scaling up)?`,
        answer: (s, r) => `1. Vertical Scaling (Scaling Up):
• Adding more hardware resources (more CPU cores, RAM, or SSD storage) to an existing single server.
• Pros: Simple, no distributed system complexity.
• Cons: Hard physical hardware limit, single point of failure, requires downtime.

2. Horizontal Scaling (Scaling Out):
• Adding more machines/nodes to the pool and distributing traffic across them via a load balancer.
• Pros: Virtually unlimited scalability, high availability and redundancy.
• Cons: Requires stateless services, network partitioning management, and distributed data consistency.`
      }
    ],
    Medium: [
      {
        question: (s, r) => `Explain the CAP theorem and the trade-offs between Consistency, Availability, and Partition Tolerance in distributed systems.`,
        answer: (s, r) => `The CAP theorem states that a distributed data store can guarantee at most TWO out of three properties simultaneously in the presence of a network partition:

1. Definitions:
• Consistency (C): Every read receives the most recent write or an error.
• Availability (A): Every non-failing node returns a response without guarantee that it contains the most recent write.
• Partition Tolerance (P): The system continues operating despite arbitrary packet loss or network partitions between nodes.

2. The Trade-off:
• Network partitions (P) are unavoidable in real-world distributed networks.
• CP Systems (e.g., HBase, MongoDB with majority write): Reject writes or delay reads to ensure strict consistency when partitions occur.
• AP Systems (e.g., Cassandra, DynamoDB): Accept writes and return possibly stale reads to preserve 100% availability, achieving Eventual Consistency.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Walk me through the end-to-end system design of a URL shortening service (like TinyURL) handling 100,000 writes/sec with high availability and low latency.`,
        answer: (s, r) => `Architecture for 100k writes/sec URL Shortener:
1. API Layer: Stateless Node/Go microservices behind an NGINX/ALB load balancer.
2. Short Hash Generation: Base62 encoding (a-z, A-Z, 0-9) over a 64-bit integer ID generated by a distributed ticket service or Snowflake generator (64-bit yields 7-character hash like tinyurl.com/aB3x9Q).
3. Database Choice: NoSQL Key-Value / Wide-Column store (e.g. Cassandra or DynamoDB) partitioned on hash key for linear horizontal write scalability.
4. Caching: Redis Cluster caching the top 20% most active URLs (80/20 Pareto rule) with LRU eviction for sub-millisecond read redirects.
5. High Availability & Geo-Routing: Multi-region active-active deployments with Global Anycast DNS.`
      }
    ]
  },
  devops: {
    Easy: [
      {
        question: (s, r) => `What is Docker, and how does a container differ fundamentally from a virtual machine?`,
        answer: (s, r) => `1. Virtual Machine (VM):
• Virtualizes physical hardware via a Hypervisor (Type 1 or Type 2).
• Each VM runs a full guest operating system with dedicated kernel, consuming gigabytes of RAM and taking minutes to boot.

2. Docker Container:
• Virtualizes the operating system layer, sharing the host Linux kernel.
• Uses Linux cgroups (resource limits) and namespaces (process/network isolation).
• Extremely lightweight (megabytes in size), boots in milliseconds, and provides consistent runtimes across development and production.`
      }
    ],
    Medium: [
      {
        question: (s, r) => `How do Docker multi-stage builds work, and how do they dramatically shrink production container image size and reduce security vulnerabilities?`,
        answer: (s, r) => `Multi-stage builds allow using multiple FROM instructions in a single Dockerfile:

How it works:
1. Build Stage: Uses a full SDK image (e.g., node:20 or golang:1.22) with compilers, build tools, devDependencies, and test runners to build production assets or binaries.
2. Production Stage: Uses a minimal runtime image (e.g. alpine or distroless), copying ONLY the compiled artifacts from the build stage (COPY --from=builder /app/dist ./dist).

Benefits:
• Dramatically smaller image sizes (e.g. shrinking 1.2GB image down to 50MB).
• Reduced attack surface: Build tools (gcc, npm, git) are excluded from the final production container.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Explain how Linux namespaces (PID, NET, MNT, IPC, UTS) and cgroups provide isolation and resource management for container runtimes under the hood.`,
        answer: (s, r) => `Container runtimes (containerd/runc) rely on two core Linux kernel primitives:

1. Linux Namespaces (What a container CAN SEE):
• PID: Provides process tree isolation (container PID 1 is distinct from host PID).
• NET: Provides dedicated network interfaces, routing tables, and IP addresses.
• MNT: Provides private filesystem mount points.
• IPC: Isolates inter-process communication and shared memory segments.
• UTS: Isolates hostname and domain name.
• USER: Maps container root UID 0 to an unprivileged user UID on the host.

2. Control Groups (cgroups) (What a container CAN USE):
• Enforces CPU, memory, disk I/O, and pids limits, preventing any single container from exhausting host resources (OOM killer).`
      }
    ]
  },
  dsa: {
    Easy: [
      {
        question: (s, r) => `What is Big-O notation, and what are the time and space complexities of searching in an array vs searching in a linked list?`,
        answer: (s, r) => `Big-O notation describes the upper bound of an algorithm's execution time or memory space as input size N grows toward infinity.

Searching Complexity:
1. Unsorted Array vs Singly Linked List:
• Linear Search: O(N) time complexity for both (must inspect up to N elements).
2. Sorted Array:
• Binary Search: O(log N) time because arrays support O(1) random access by index.
• Singly Linked List: Still O(N) even if sorted, because linked lists do not support random access and require traversing pointers sequentially.`
      }
    ],
    Medium: [
      {
        question: (s, r) => `How do you detect a cycle in a singly linked list using Floyd's Cycle Detection (Fast & Slow pointers) algorithm in O(1) space?`,
        answer: (s, r) => `Floyd's Cycle-Finding Algorithm (Tortoise and Hare):
1. Pointers: Initialize two pointers, slow and fast, at the head of the linked list.
2. Traversal: In a loop, move slow by 1 step (slow = slow.next) and fast by 2 steps (fast = fast.next.next).
3. Cycle Detection:
• If fast or fast.next reaches null, the list is acyclic (returns false).
• If slow === fast at any point, a cycle exists (returns true).

Complexity:
• Time Complexity: O(N) - fast pointer enters cycle and catches up to slow in at most one cycle length.
• Space Complexity: O(1) - only two pointer variables are used.`
      }
    ],
    Hard: [
      {
        question: (s, r) => `Explain Dynamic Programming with memoization (top-down) vs tabulation (bottom-up), and walk through the recurrence relation for the 0/1 Knapsack or Longest Common Subsequence problem.`,
        answer: (s, r) => `Dynamic Programming solves optimization problems with Overlapping Subproblems and Optimal Substructure:

1. Approaches:
• Top-Down (Memoization): Solves problem recursively from target N down, caching subproblem results in a hash map or array.
• Bottom-Up (Tabulation): Solves iterative base cases first (0, 1...) and builds up to N in a 1D or 2D DP table, often saving space.

2. 0/1 Knapsack Recurrence:
Given items with weights w[i] and values v[i], and knapsack capacity W:
dp[i][w] = max value considering first i items with weight limit w:
• If w[i-1] > w: dp[i][w] = dp[i-1][w] (item too heavy, exclude it)
• Else: dp[i][w] = max(dp[i-1][w], v[i-1] + dp[i-1][w - w[i-1]]) (max of excluding or including item)`
      }
    ]
  }
};

function normalizeSkill(skill) {
  if (!skill) return 'general';
  const clean = skill.toLowerCase().trim();
  if (clean.includes('html')) return 'html';
  if (clean.includes('css') || clean.includes('tailwind') || clean.includes('sass')) return 'css';
  if (clean.includes('react') || clean.includes('next.js') || clean.includes('nextjs')) return 'react';
  if (clean.includes('javascript') || clean === 'js' || clean.includes('typescript') || clean === 'ts') return 'javascript';
  if (clean.includes('sql') || clean.includes('postgres') || clean.includes('mysql') || clean.includes('database')) return 'sql';
  if (clean.includes('node') || clean.includes('express')) return 'nodejs';
  if (clean.includes('python') || clean.includes('django') || clean.includes('fastapi') || clean.includes('flask')) return 'python';
  if (clean.includes('machine learning') || clean.includes('data science') || clean.includes('deep learning') || clean.includes('pandas') || clean.includes('numpy')) return 'datascience';
  if (clean.includes('system design') || clean.includes('architecture') || clean.includes('microservice')) return 'systemdesign';
  if (clean.includes('docker') || clean.includes('kubernetes') || clean.includes('k8s') || clean.includes('devops') || clean.includes('ci/cd')) return 'devops';
  if (clean.includes('data structure') || clean.includes('algorithm') || clean.includes('dsa') || clean.includes('leetcode')) return 'dsa';
  return clean;
}

function normalizeDifficulty(difficulty) {
  if (!difficulty) return 'Medium';
  const clean = difficulty.trim().toLowerCase();
  if (clean === 'easy') return 'Easy';
  if (clean === 'hard') return 'Hard';
  return 'Medium';
}

export function getSkillDifficultyQuestion(skill, role = 'Software Engineer', difficulty = 'Medium', usedQuestions = [], index = 0) {
  const normSkill = normalizeSkill(skill);
  const normDiff = normalizeDifficulty(difficulty);

  const curatedCategory = CURATED_QUESTIONS[normSkill];
  if (curatedCategory && curatedCategory[normDiff] && curatedCategory[normDiff].length > 0) {
    const pool = curatedCategory[normDiff];
    const usedSet = new Set((usedQuestions || []).map(q => q.toLowerCase().slice(0, 45)));
    const available = pool.filter(item => {
      const qText = item.question(skill, role).toLowerCase().slice(0, 45);
      return !usedSet.has(qText);
    });

    const selected = available.length > 0
      ? available[index % available.length]
      : pool[index % pool.length];

    return selected.question(skill, role);
  }

  // Dynamic fallback for custom/unlisted skill
  if (normDiff === 'Easy') {
    return `What are the core fundamentals, primary use cases, and basic syntax conventions of ${skill}?`;
  }
  if (normDiff === 'Hard') {
    return `Explain the low-level execution model, memory management, or internal runtime mechanics of ${skill}.`;
  }
  return `Describe a practical scenario where you used ${skill} to solve a specific engineering problem as a ${role}.`;
}

export function getActualAnswerForQuestion(questionText, skill = '', difficulty = 'Medium', role = 'Software Engineer') {
  if (!questionText || typeof questionText !== 'string') return '';
  const cleanQ = questionText.toLowerCase().trim();

  // Search curated question bank across all categories
  for (const category of Object.values(CURATED_QUESTIONS)) {
    for (const level of Object.values(category)) {
      for (const item of level) {
        const itemQ = item.question(skill, role).toLowerCase().trim();
        if (cleanQ === itemQ || cleanQ.includes(itemQ.slice(0, 40)) || itemQ.includes(cleanQ.slice(0, 40))) {
          return item.answer(skill, role);
        }
      }
    }
  }

  // If not in curated list, provide a concrete, informative technical answer
  return `Comprehensive Solution for "${questionText}":

1. Core Definition & Principle:
In ${skill || 'modern software engineering'}, this concept addresses primary system reliability, maintainability, and clean code architecture.

2. Technical Implementation & Best Practices:
• Apply standard idioms and native framework conventions rather than ad-hoc workarounds.
• Ensure proper error handling, input validation, and boundary-condition checks.
• Structure components modularly to decouple business logic from runtime dependencies.

3. Performance & Trade-offs:
• Benchmark execution time and monitor resource utilization under load.
• Balance readability and maintainability against premature micro-optimizations.`;
}
