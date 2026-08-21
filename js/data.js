/**
 * ============================================
 * CODE FORGE - Data & Content
 * ============================================
 */

const DATA = {
    // ==========================================
    // Programming Languages & Technologies
    // ==========================================
    
    languages: [
        {
            id: 'html',
            name: 'HTML',
            fullName: 'HyperText Markup Language',
            category: 'frontend',
            difficulty: 'beginner',
            icon: 'fab fa-html5',
            color: '#e34c26',
            gradient: 'linear-gradient(135deg, #e34c26 0%, #f06529 100%)',
            description: 'The foundation of every web page. HTML provides structure and meaning to web content.',
            tags: ['Web Basics', 'Frontend', 'Beginner Friendly'],
            features: ['Semantic markup', 'Forms', 'Accessibility', 'SEO basics'],
            lessonsCount: 24,
            duration: '8 hours'
        },
        {
            id: 'css',
            name: 'CSS',
            fullName: 'Cascading Style Sheets',
            category: 'frontend',
            difficulty: 'beginner',
            icon: 'fab fa-css3-alt',
            color: '#264de4',
            gradient: 'linear-gradient(135deg, #264de4 0%, #2965f1 100%)',
            description: 'Style your web pages with CSS. Learn layout, animations, responsive design, and more.',
            tags: ['Styling', 'Frontend', 'Design'],
            features: ['Flexbox', 'Grid', 'Animations', 'Responsive design'],
            lessonsCount: 32,
            duration: '12 hours'
        },
        {
            id: 'javascript',
            name: 'JavaScript',
            fullName: 'JavaScript (ES6+)',
            category: 'programming',
            difficulty: 'intermediate',
            icon: 'fab fa-js-square',
            color: '#f7df1e',
            gradient: 'linear-gradient(135deg, #f7df1e 0%, #f0db4f 100%)',
            textColor: '#000',
            description: 'Bring websites to life with JavaScript. The essential language for interactive web development.',
            tags: ['Programming', 'Frontend', 'Backend'],
            features: ['DOM manipulation', 'Async/await', 'ES6+', 'Node.js intro'],
            lessonsCount: 48,
            duration: '20 hours'
        },
        {
            id: 'python',
            name: 'Python',
            fullName: 'Python 3',
            category: 'programming',
            difficulty: 'beginner',
            icon: 'fab fa-python',
            color: '#3776ab',
            gradient: 'linear-gradient(135deg, #3776ab 0%, #ffd43b 100%)',
            description: 'A versatile language perfect for beginners. Used in web dev, data science, AI, and automation.',
            tags: ['General Purpose', 'Beginner Friendly', 'Data Science'],
            features: ['Syntax basics', 'Data structures', 'OOP', 'Libraries'],
            lessonsCount: 42,
            duration: '18 hours'
        },
        {
            id: 'java',
            name: 'Java',
            fullName: 'Java SE',
            category: 'programming',
            difficulty: 'intermediate',
            icon: 'fab fa-java',
            color: '#007396',
            gradient: 'linear-gradient(135deg, #007396 0%, #ed8b00 100%)',
            description: 'Enterprise-grade programming language. Learn OOP principles that transfer to any language.',
            tags: ['Enterprise', 'Object-Oriented', 'Android'],
            features: ['OOP fundamentals', 'Collections', 'Exception handling', 'Streams'],
            lessonsCount: 38,
            duration: '16 hours'
        },
        {
            id: 'c-plus-plus',
            name: 'C++',
            fullName: 'C++ (Modern)',
            category: 'programming',
            difficulty: 'advanced',
            icon: 'fas fa-code',
            color: '#00599C',
            gradient: 'linear-gradient(135deg, #00599C 0%, #004482 100%)',
            description: 'High-performance systems programming. Master memory management and low-level concepts.',
            tags: ['Systems', 'Performance', 'Game Dev'],
            features: ['Pointers', 'Memory', 'STL templates', 'Modern C++'],
            lessonsCount: 36,
            duration: '15 hours'
        },
        {
            id: 'sql',
            name: 'SQL',
            fullName: 'Structured Query Language',
            category: 'database',
            difficulty: 'intermediate',
            icon: 'fas fa-database',
            color: '#336791',
            gradient: 'linear-gradient(135deg, #336791 0%, #00758F 100%)',
            description: 'Query and manage databases. Essential skill for backend development and data analysis.',
            tags: ['Database', 'Backend', 'Data Analysis'],
            features: ['SELECT queries', 'JOINS', 'Aggregation', 'Normalization'],
            lessonsCount: 28,
            duration: '10 hours'
        },
        {
            id: 'react',
            name: 'React',
            fullName: 'React.js',
            category: 'frontend',
            difficulty: 'advanced',
            icon: 'fab fa-react',
            color: '#61dafb',
            gradient: 'linear-gradient(135deg, #61dafb 0%, #282c34 100%)',
            description: 'Build modern user interfaces with components, hooks, and state management.',
            tags: ['Frontend', 'Framework', 'JavaScript'],
            features: ['Components', 'Hooks', 'Context API', 'Redux intro'],
            lessonsCount: 35,
            duration: '14 hours'
        },
        {
            id: 'nodejs',
            name: 'Node.js',
            fullName: 'Node.js Runtime',
            category: 'backend',
            difficulty: 'intermediate',
            icon: 'fab fa-node-js',
            color: '#339933',
            gradient: 'linear-gradient(135deg, #339933 0%, #68a063 100%)',
            description: 'Run JavaScript on the server. Build APIs, real-time apps, and scalable backends.',
            tags: ['Backend', 'APIs', 'Full Stack'],
            features: ['Express.js', 'REST APIs', 'Middleware', 'File handling'],
            lessonsCount: 30,
            duration: '12 hours'
        },
        {
            id: 'php',
            name: 'PHP',
            fullName: 'PHP 8',
            category: 'backend',
            difficulty: 'intermediate',
            icon: 'fab fa-php',
            color: '#777bb4',
            gradient: 'linear-gradient(135deg, #777bb4 0%, #8993be 100%)',
            description: 'Powerful server-side scripting. Powers WordPress and millions of websites worldwide.',
            tags: ['Backend', 'CMS', 'Server-side'],
            features: ['Syntax basics', 'Databases', 'OOP', 'Frameworks intro'],
            lessonsCount: 30,
            duration: '11 hours'
        },
        {
            id: 'csharp',
            name: 'C#',
            fullName: 'C# (.NET)',
            category: 'programming',
            difficulty: 'intermediate',
            icon: 'fas fa-code',
            color: '#68217a',
            gradient: 'linear-gradient(135deg, #68217a 0%, #9b4f96 100%)',
            description: 'Microsoft\'s powerful language for Windows apps, games with Unity, and enterprise software.',
            tags: ['Enterprise', 'Game Dev', 'Windows'],
            features: ['.NET basics', 'LINQ', 'Async patterns', 'ASP.NET'],
            lessonsCount: 34,
            duration: '13 hours'
        },
        {
            id: 'typescript',
            name: 'TypeScript',
           fullName: 'TypeScript',
            category: 'programming',
            difficulty: 'intermediate',
            icon: 'fas fa-code',
            color: '#3178c6',
            gradient: 'linear-gradient(135deg, #3178c6 0%, #235a97 100%)',
            description: 'Type-safe JavaScript. Catch errors early and build more robust applications.',
            tags: ['Programming', 'Type Safety', 'JavaScript'],
            features: ['Types system', 'Interfaces', 'Generics', 'Tooling'],
            lessonsCount: 26,
            duration: '10 hours'
        }
    ],

    // ==========================================
    // Course Content / Learning Paths
    // ==========================================
    
    courses: {
        html: {
            title: 'HTML Fundamentals',
            description: 'Master the building blocks of the web with comprehensive HTML training.',
            levels: {
                beginner: [
                    { id: 'html-1', title: 'Introduction to HTML', duration: '10 min' },
                    { id: 'html-2', title: 'HTML Document Structure', duration: '15 min' },
                    { id: 'html-3', title: 'Text Elements & Formatting', duration: '20 min' },
                    { id: 'html-4', title: 'Links & Navigation', duration: '15 min' },
                    { id: 'html-5', title: 'Images & Media', duration: '20 min' },
                    { id: 'html-6', title: 'Lists (Ordered & Unordered)', duration: '15 min' },
                    { id: 'html-7', title: 'Tables', duration: '20 min' },
                    { id: 'html-8', title: 'Forms - Part 1: Basics', duration: '25 min' }
                ],
                intermediate: [
                    { id: 'html-9', title: 'Forms - Part 2: Validation', duration: '25 min' },
                    { id: 'html-10', title: 'Semantic Elements', duration: '20 min' },
                    { id: 'html-11', title: 'Multimedia Elements', duration: '20 min' },
                    { id: 'html-12', title: 'Meta Tags & SEO Basics', duration: '15 min' },
                    { id: 'html-13', title: 'Accessibility (ARIA)', duration: '25 min' },
                    { id: 'html-14', title: 'Embedding Content (iframe, embed)', duration: '15 min' }
                ],
                advanced: [
                    { id: 'html-15', title: 'Custom Data Attributes', duration: '15 min' },
                    { id: 'html-16', title: 'SVG Graphics', duration: '25 min' },
                    { id: 'html-17', title: 'Canvas Integration', duration: '20 min' },
                    { id: 'html-18', title: 'Web Components Templates', duration: '25 min' }
                ]
            }
        },
        css: {
            title: 'CSS Mastery',
            description: 'Create beautiful, responsive designs with modern CSS techniques.',
            levels: {
                beginner: [
                    { id: 'css-1', title: 'Introduction to CSS', duration: '10 min' },
                    { id: 'css-2', title: 'Selectors & Specificity', duration: '20 min' },
                    { id: 'css-3', title: 'Box Model', duration: '25 min' },
                    { id: 'css-4', title: 'Colors & Backgrounds', duration: '20 min' },
                    { id: 'css-5', title: 'Typography & Text Styling', duration: '20 min' },
                    { id: 'css-6', title: 'Flexbox Layout', duration: '30 min' },
                    { id: 'css-7', title: 'CSS Grid Layout', duration: '30 min' }
                ],
                intermediate: [
                    { id: 'css-8', title: 'Responsive Design Principles', duration: '25 min' },
                    { id: 'css-9', title: 'Media Queries', duration: '25 min' },
                    { id: 'css-10', title: 'Transitions & Animations', duration: '30 min' },
                    { id: 'css-11', title: 'Transforms', duration: '20 min' },
                    { id: 'css-12', title: 'Pseudo-elements & Classes', duration: '25 min' },
                    { id: 'css-13', title: 'Positioning (Static to Fixed)', duration: '25 min' }
                ],
                advanced: [
                    { id: 'css-14', title: 'CSS Variables', duration: '20 min' },
                    { id: 'css-15', title: 'CSS Functions', duration: '25 min' },
                    { id: 'css-16', title: 'Container Queries', duration: '20 min' },
                    { id: 'css-17', title: 'Modern Layout Techniques', duration: '25 min' }
                ]
            }
        },
        javascript: {
            title: 'JavaScript Essentials',
            description: 'From variables to async/await - master JavaScript programming.',
            levels: {
                beginner: [
                    { id: 'js-1', title: 'Variables & Data Types', duration: '20 min' },
                    { id: 'js-2', title: 'Operators & Expressions', duration: '20 min' },
                    { id: 'js-3', title: 'Conditionals (if/else, switch)', duration: '20 min' },
                    { id: 'js-4', title: 'Loops (for, while, do-while)', duration: '25 min' },
                    { id: 'js-5', title: 'Functions - Part 1', duration: '25 min' },
                    { id: 'js-6', title: 'Functions - Part 2 (Arrow, Callbacks)', duration: '25 min' },
                    { id: 'js-7', title: 'Arrays & Array Methods', duration: '30 min' },
                    { id: 'js-8', title: 'Objects', duration: '25 min' }
                ],
                intermediate: [
                    { id: 'js-9', title: 'String Methods', duration: '20 min' },
                    { id: 'js-10', title: 'DOM Manipulation', duration: '35 min' },
                    { id: 'js-11', title: 'Event Handling', duration: '30 min' },
                    { id: 'js-12', title: 'Error Handling (try/catch)', duration: '20 min' },
                    { id: 'js-13', title: 'Promises & Async/Await', duration: '35 min' },
                    { id: 'js-14', title: 'Fetch API & HTTP Requests', duration: '30 min' },
                    { id: 'js-15', title: 'LocalStorage & SessionStorage', duration: '20 min' }
                ],
                advanced: [
                    { id: 'js-16', title: 'Classes & OOP in JavaScript', duration: '30 min' },
                    { id: 'js-17', title: 'Modules (import/export)', duration: '25 min' },
                    { id: 'js-18', title: 'Generators & Iterators', duration: '25 min' },
                    { id: 'js-19', title: 'ES6+ Features Deep Dive', duration: '30 min' }
                ]
            }
        },
        python: {
            title: 'Python Programming',
            description: 'Learn Python from scratch - perfect for beginners and powerful enough for experts.',
            levels: {
                beginner: [
                    { id: 'py-1', title: 'Setting Up Python Environment', duration: '15 min' },
                    { id: 'py-2', title: 'Variables & Basic Types', duration: '20 min' },
                    { id: 'py-3', title: 'Strings & String Operations', duration: '25 min' },
                    { id: 'py-4', title: 'Lists & Tuples', duration: '25 min' },
                    { id: 'py-5', title: 'Dictionaries', duration: '20 min' },
                    { id: 'py-6', title: 'Control Flow (if/elif/else)', duration: '20 min' },
                    { id: 'py-7', title: 'Loops (for, while)', duration: '25 min' },
                    { id: 'py-8', title: 'Functions', duration: '25 min' }
                ],
                intermediate: [
                    { id: 'py-9', title: 'File I/O Operations', duration: '25 min' },
                    { id: 'py-10', title: 'Error Handling', duration: '20 min' },
                    { id: 'py-11', title: 'Object-Oriented Programming', duration: '35 min' },
                    { id: 'py-12', title: 'Inheritance & Polymorphism', duration: '25 min' },
                    { id: 'py-13', title: 'Modules & Packages', duration: '20 min' },
                    { id: 'py-14', title: 'Working with JSON', duration: '15 min' }
                ],
                advanced: [
                    { id: 'py-15', title: 'Decorators', duration: '25 min' },
                    { id: 'py-16', title: 'Generators & Comprehensions', duration: '25 min' },
                    { id: 'py-17', title: 'Virtual Environments', duration: '15 min' },
                    { id: 'py-18', title: 'Popular Libraries Overview', duration: '30 min' }
                ]
            }
        }
    },

    // ==========================================
    // Lesson Content Samples
    // ==========================================
    
    lessons: {
        'html-1': {
            title: 'Introduction to HTML',
            level: 'Beginner',
            content: `
<h1>What is HTML?</h1>

<p><strong>HTML</strong> stands for <strong>H</strong>yper<strong>T</strong>ext <strong>M</strong>arkup <strong>L</strong>anguage. It is the standard markup language used to create web pages.</p>

<h2>Why Learn HTML?</h2>
<ul>
<li>It's the foundation of every website</li>
<li>Easy to learn and understand</li>
<li>Essential for web development careers</li>
<li>Cross-platform compatible</li>
</ul>

<h2>Your First HTML Element</h2>
<p>An HTML element consists of an opening tag, content, and a closing tag:</p>

<pre><code>&lt;tagname&gt;Content goes here...&lt;/tagname&gt;</code></pre>

<div class="tip-box">
<strong>💡 Pro Tip:</strong> Every webpage you visit is built with HTML as its skeleton. Even complex applications like YouTube, Facebook, and Google use HTML at their core.
</div>

<h2>Key Concepts</h2>
<ul>
<li><strong>Elements:</strong> Building blocks of HTML</li>
<li><strong>Tags:</strong> Mark the beginning and end of elements</li>
<li><strong>Attributes:</strong> Provide additional information about elements</li>
<li><strong>Nesting:</strong> Placing elements inside other elements</li>
</ul>

<div class="exercise-box">
<h4>📝 Quick Exercise</h4>
<p>Try identifying the parts of this HTML element:</p>
<pre><code>&lt;p class="intro"&gt;Hello World!&lt;/p&gt;</code></pre>
<p>What's the tag? What's the attribute? What's the content?</p>
</div>`
        },
        
        'html-2': {
            title: 'HTML Document Structure',
            level: 'Beginner',
            content: `
<h1>The Anatomy of an HTML Document</h1>

<p>Every HTML document follows a specific structure. Let's break it down:</p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width"&gt;
    &lt;title&gt;Page Title&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;!-- Page content goes here --&gt;
    &lt;h1&gt;Hello, World!&lt;/h1&gt;
    &lt;p&gt;This is my first page.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

<h2>Document Parts Explained</h2>
<ul>
<li><strong>DOCTYPE declaration (&lt;!DOCTYPE html&gt;)</strong>: Tells the browser this is HTML5</li>
<li><strong>&lt;html&gt;</strong>: Root element that wraps everything</li>
<li><strong>&lt;head&gt;</strong>: Contains metadata (not visible on page)</li>
<li><strong>&lt;body&gt;</strong>: Contains visible page content</li>
</ul>

<div class="warning-box">
⚠️ <strong>Note:</strong> Always include the viewport meta tag! This ensures your page displays correctly on mobile devices.
</div>

<h2>The Head Section</h2>
<p>The head contains important meta information:</p>
<ul>
<li><code>&lt;meta charset&gt;</code> - Character encoding</li>
<li><code>&lt;title&gt;</code> - Browser tab title</li>
<li><code>&lt;link&gt;</code> - Link to stylesheets</li>
<li><code>&lt;script&gt;</code> - JavaScript files</li>
</ul>`
        },

        'js-1': {
            title: 'Variables & Data Types',
            level: 'Beginner',
            content: `
<h1>Understanding Variables in JavaScript</h1>

<p>Variables are containers for storing data values. In JavaScript, we have three ways to declare variables:</p>

<h2>Declaring Variables</h2>

<pre><code>// Using 'let' (modern, recommended)
let message = "Hello, World!";
let count = 42;

// Using 'const' (for constants)
const PI = 3.14159;

// Using 'var' (legacy, avoid using)
var oldStyle = "Old way";</code></pre>

<div class="tip-box">
<strong>💡 Best Practice:</strong> Use <code>const</code> by default, <code>let</code> when you need to reassign, and avoid <code>var</code> entirely.
</div>

<h2>JavaScript Data Types</h2>

<ul>
<li><strong>String:</strong> Text values - "Hello", 'World'</li>
<li><strong>Number:</strong> Integers and floats - 42, 3.14</li>
<li><strong>Boolean:</strong> true or false</li>
<li><strong>Undefined:</strong> Variable declared but not assigned</li>
<li><strong>null:</strong> Intentionally empty value</li>
<li><strong>Symbol:</strong> Unique identifier (ES6+)</li>
<li><strong>BigInt:</strong> Large integers (ES2020+)</li>
<li><strong>Object:</strong> Collections of key-value pairs</li>
</ul>

<pre><code>// Examples of different types
const name = "Code Forge";      // String
const age = 25;                  // Number  
const isActive = true;           // Boolean
let notAssigned;                 // Undefined
const empty = null;              // Null

// Checking types
console.log(typeof name);       // "string"
console.log(typeof age);        // "number"</code></pre>

<div class="exercise-box">
<h4>🎯 Practice Exercise</h4>
<p>Create variables for:</p>
<ol>
<li>Your name (string)</li>
<li>Your age (number)</li>
<li>Whether you're learning JavaScript (boolean)</li>
</ol>
<p>Then use console.log() to display each variable's type.</p>
</div>`
        },

        'py-1': {
            title: 'Setting Up Python Environment',
            level: 'Beginner',
            content: `
<h1>Getting Started with Python</h1>

<p>Before writing Python code, let's set up your development environment properly.</p>

<h2>Installing Python</h2>

<ol>
<li><strong>Download:</strong> Visit python.org/downloads</li>
<li><strong>Select version:</strong> Download Python 3.11 or newer</li>
<li><strong>Install:</strong> Run installer and check "Add to PATH"</li>
<li><strong>Verify:</strong> Open terminal and type <code>python --version</code></li>
</ol>

<div class="tip-box">
💡 <strong>Tip:</strong> On Windows, make sure to check "Add Python to PATH" during installation!
</div>

<h2>Your First Python Program</h2>

<pre><code># This is a comment in Python
print("Hello, Code Forge!")

# Variables don't need type declarations
name = "Developer"
print(f"Welcome, {name}!")</code></pre>

<h2>Choosing an IDE</h2>

<p>Several great options exist:</p>
<ul>
<li><strong>VS Code:</strong> Free, versatile, highly extensible</li>
<li><strong>PyCharm:</strong> Feature-rich, great for larger projects</li>
<li><strong>Jupyter Notebook:</strong> Excellent for data science</li>
<li><strong>IDLE:</strong> Comes bundled with Python, good for basics</li>
</ul>

<h2>Python vs Other Languages</h2>

<pre><code># JavaScript: semicolons required (usually)
let x = 5;

# Python: clean syntax, no semicolons
x = 5

# Indentation matters! Not curly braces
if x > 0:
    print("Positive!")
else:
    print("Not positive")</code></pre>

<div class="warning-box">
⚠️ <strong>Important:</strong> Python uses indentation (spaces/tabs) to define code blocks. Inconsistent indentation causes errors!
</div>`
        }
    },

    // ==========================================
    // Projects Library
    // ==========================================
    
    projects: [
        {
            id: 'portfolio',
            title: 'Portfolio Website',
            description: 'Build a beautiful, responsive personal portfolio website to showcase your skills and projects.',
            difficulty: 'beginner',
            category: 'web',
            technologies: ['HTML', 'CSS'],
            icon: 'fa-globe',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            estimatedTime: '2-3 hours',
            features: ['Responsive design', 'Smooth animations', 'Contact form', 'Project showcase'],
            files: [
                { name: 'index.html', type: 'html' },
                { name: 'styles.css', type: 'css' },
                { name: 'script.js', type: 'javascript' }
            ],
            starterCode: {
                'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Portfolio</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <!-- Navigation -->\n    <nav>\n        <ul>\n            <li><a href="#home">Home</a></li>\n            <li><a href="#about">About</a></li>\n            <li><a href="#projects">Projects</a></li>\n            <li><a href="#contact">Contact</a></li>\n        </ul>\n    </nav>\n\n    <!-- Hero Section -->\n    <header id="home">\n        <h1>Hello, I\'m [Your Name]</h1>\n        <p>A passionate developer</p>\n    </header>\n\n    <!-- About Section -->\n    <section id="about">\n        <h2>About Me</h2>\n        <p>Tell visitors about yourself...</p>\n    </section>\n\n    <!-- Projects Section -->\n    <section id="projects">\n        <h2>My Projects</h2>\n        <!-- Add your projects here -->\n    </section>\n\n    <!-- Contact Section -->\n    <section id="contact">\n        <h2>Contact Me</h2>\n        <form>\n            <input type="text" placeholder="Your Name" required>\n            <input type="email" placeholder="Your Email" required>\n            <textarea placeholder="Message"></textarea>\n            <button type="submit">Send Message</button>\n        </form>\n    </section>\n\n    <script src="script.js"></script>\n</body>\n</html>`,
                'styles.css': `/* Reset and Base Styles */\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: \'Segoe UI\', sans-serif;\n    line-height: 1.6;\n    color: #333;\n}\n\n/* Navigation */\nnav {\n    position: fixed;\n    top: 0;\n    width: 100%;\n    background: #fff;\n    box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n}\n\nnav ul {\n    display: flex;\n    justify-content: center;\n    list-style: none;\n    padding: 1rem;\n}\n\nnav a {\n    text-decoration: none;\n    color: #333;\n    margin: 0 1rem;\n    font-weight: 500;\n    transition: color 0.3s;\n}\n\nnav a:hover {\n    color: #667eea;\n}\n\n/* Hero Section */\nheader {\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    text-align: center;\n    background: linear-gradient(135deg, #667eea, #764ba2);\n    color: white;\n}\n\nheader h1 {\n    font-size: 3rem;\n    margin-bottom: 1rem;\n}\n\nheader p {\n    font-size: 1.5rem;\n    opacity: 0.9;\n}\n\n/* Sections */\nsection {\n    padding: 4rem 2rem;\n    max-width: 900px;\n    margin: 0 auto;\n}\n\nsection h2 {\n    margin-bottom: 1.5rem;\n    font-size: 2rem;\n}\n\n/* Form Styles */\nform {\n    display: flex;\n    flex-direction: column;\n    gap: 1rem;\n    max-width: 500px;\n}\n\nform input,\ntextarea {\n    padding: 0.75rem;\n    border: 1px solid #ddd;\n    border-radius: 4px;\n    font-size: 1rem;\n}\n\nform button {\n    padding: 0.75rem;\n    background: #667eea;\n    color: white;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 1rem;\n}\n\nform button:hover {\n    background: #5568d3;\n}`,
                'script.js': `// Smooth scroll for navigation links\ndocument.querySelectorAll(\'nav a[href^="#"]\').forEach(anchor => {\n    anchor.addEventListener(\'click\', function(e) {\n        e.preventDefault();\n        const target = document.querySelector(this.getAttribute(\'href\'));\n        if (target) {\n            target.scrollIntoView({ behavior: \'smooth\' });\n        }\n    });\n});\n\n// Form submission handler\ndocument.querySelector(\'form\')?.addEventListener(\'submit\', function(e) {\n    e.preventDefault();\n    alert(\'Form submitted! (Implement actual submission logic)\');\n});`
            }
        },
        {
            id: 'calculator',
            title: 'Calculator App',
            description: 'A fully functional calculator with basic arithmetic operations and a polished UI.',
            difficulty: 'beginner',
            category: 'app',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            icon: 'fa-calculator',
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            estimatedTime: '1-2 hours',
            features: ['Basic operations', 'Keyboard support', 'Clear function', 'Visual feedback'],
            files: [
                { name: 'index.html', type: 'html' },
                { name: 'style.css', type: 'css' },
                { name: 'app.js', type: 'javascript' }
            ],
            starterCode: {
                'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Calculator</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="calculator">\n        <input type="text" id="display" readonly value="0">\n        \n        <div class="buttons">\n            <button class="btn clear" data-action="clear">C</button>\n            <button class="btn operator" data-action="backspace">←</button>\n            <button class="btn operator" data-action="%" data-value="%">%</button>\n            <button class="btn operator" data-action="/" data-value="/">÷</button>\n            \n            <button class="btn number" data-value="7">7</button>\n            <button class="btn number" data-value="8">8</button>\n            <button class="btn number" data-value="9">9</button>\n            <button class="btn operator" data-action="*" data-value="*">×</button>\n            \n            <button class="btn number" data-value="4">4</button>\n            <button class="btn number" data-value="5">5</button>\n            <button class="btn number" data-value="6">6</button>\n            <button class="btn operator" data-action="-" data-value="-">−</button>\n            \n            <button class="btn number" data-value="1">1</button>\n            <button class="btn number" data-value="2">2</button>\n            <button class="btn number" data-value="3">3</button>\n            <button class="btn operator" data-action="+" data-value="+">+</button>\n            \n            <button class="btn number zero" data-value="0">0</button>\n            <button class="btn number" data-value=".">.</button>\n            <button class="btn equals" data-action="equals">=</button>\n        </div>\n    </div>\n    \n    <script src="app.js"></script>\n</body>\n</html>`,
                'style.css': `body {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    min-height: 100vh;\n    background: linear-gradient(135deg, #11998e, #38ef7d);\n    margin: 0;\n    font-family: \'Segoe UI\', sans-serif;\n}\n\n.calculator {\n    background: #1e1e2e;\n    padding: 20px;\n    border-radius: 20px;\n    box-shadow: 0 20px 50px rgba(0,0,0,0.3);\n    width: 320px;\n}\n\n#display {\n    width: 100%;\n    background: transparent;\n    border: none;\n    color: #fff;\n    font-size: 36px;\n    text-align: right;\n    padding: 15px;\n    box-sizing: border-box;\n    margin-bottom: 15px;\n}\n\n.buttons {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    gap: 10px;\n}\n\n.btn {\n    padding: 20px;\n    font-size: 20px;\n    border: none;\n    border-radius: 12px;\n    cursor: pointer;\n    transition: all 0.2s;\n    font-weight: 600;\n}\n\n.btn:hover {\n    transform: scale(1.05);\n}\n\n.btn:active {\n    transform: scale(0.95);\n}\n\n.number {\n    background: #313244;\n    color: #fff;\n}\n\n.operator {\n    background: #45475a;\n    color: #89b4fa;\n}\n\n.clear {\n    background: #f38ba8;\n    color: #1e1e2e;\n}\n\n.equals {\n    background: #a6e3a1;\n    color: #1e1e2e;\n    grid-column: span 1;\n}\n\n.zero {\n    grid-column: span 2;\n}`,
                'app.js': `class Calculator {\n    constructor() {\n        this.display = document.getElementById(\'display\');\n        this.currentValue = \'0\';\n        this.previousValue = \'\';\n        this.operator = null;\n        this.shouldResetDisplay = false;\n        \n        this.bindEvents();\n    }\n    \n    bindEvents() {\n        document.querySelectorAll(\'.btn\').forEach(btn => {\n            btn.addEventListener(\'click\', () => this.handleClick(btn));\n        });\n        \n        document.addEventListener(\'keydown\', (e) => this.handleKeyboard(e));\n    }\n    \n    handleClick(btn) {\n        const action = btn.dataset.action;\n        const value = btn.dataset.value;\n        \n        if (action === \'clear\') this.clear();\n        else if (action === \'backspace\') this.backspace();\n        else if (action === \'equals\') this.calculate();\n        else if (value) this.appendValue(value, action);\n        \n        this.updateDisplay();\n    }\n    \n    appendValue(value, action) {\n        if (this.shouldResetDisplay) {\n            this.currentValue = \'\';\n            this.shouldResetDisplay = false;\n        }\n        \n        if (action && !value) return; // Operator without value\n        \n        if (this.isOperator(value)) {\n            this.setOperator(value);\n        } else {\n            if (this.currentValue === \'0\' && value !== \'.\') {\n                this.currentValue = value;\n            } else {\n                this.currentValue += value;\n            }\n        }\n    }\n    \n    setOperator(op) {\n        if (this.operator && !this.shouldResetDisplay) {\n            this.calculate();\n        }\n        this.previousValue = this.currentValue;\n        this.operator = op;\n        this.shouldResetDisplay = true;\n    }\n    \n    calculate() {\n        const prev = parseFloat(this.previousValue);\n        const current = parseFloat(this.currentValue);\n        \n        if (isNaN(prev) || isNaN(current)) return;\n        \n        switch(this.operator) {\n            case \'+\': this.currentValue = prev + current; break;\n            case \'-\': this.currentValue = prev - current; break;\n            case \'*\': this.currentValue = prev * current; break;\n            case \'/\': this.currentValue = current !== 0 ? prev / current : \'Error\'; break;\n            case \'%\': this.currentValue = prev % current; break;\n        }\n        \n        this.currentValue = Math.round(this.currentValue * 1000000000) / 1000000000;\n        this.operator = null;\n        this.previousValue = \'\';\n        this.shouldResetDisplay = true;\n    }\n    \n    clear() {\n        this.currentValue = \'0\';\n        this.previousValue = \'\';\n        this.operator = null;\n        this.shouldResetDisplay = false;\n    }\n    \n    backspace() {\n        this.currentValue = this.currentValue.slice(0, -1) || \'0\';\n    }\n    \n    isOperator(char) {\n        return [\'+\', \'-\', \'*\', \'/\', \'%\'\n        ].includes(char);\n    }\n    \n    handleKeyboard(e) {\n        const key = e.key;\n        \n        if (/[0-9.]/.test(key)) {\n            this.appendValue(key);\n        } else if (this.isOperator(key)) {\n            this.setOperator(key);\n        } else if (key === \'Enter\' || key === \'=\') {\n            this.calculate();\n        } else if (key === \'Escape\') {\n            this.clear();\n        } else if (key === \'Backspace\') {\n            this.backspace();\n        }\n        \n        this.updateDisplay();\n    }\n    \n    updateDisplay() {\n        this.display.value = this.currentValue;\n    }\n}\n\nnew Calculator();`
            }
        },
        {
            id: 'todo',
            title: 'To-Do Application',
            description: 'A complete task manager with categories, priorities, and local storage persistence.',
            difficulty: 'intermediate',
            category: 'app',
            technologies: ['HTML', 'CSS', 'JavaScript', 'LocalStorage'],
            icon: 'fa-tasks',
            gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b33 100%)',
            estimatedTime: '3-4 hours',
            features: ['CRUD operations', 'Priority levels', 'Filter tasks', 'Local storage', 'Responsive'],
            files: [
                { name: 'index.html', type: 'html' },
                { name: 'style.css', type: 'css' },
                { name: 'app.js', type: 'javascript' }
            ]
        },
        {
            id: 'quiz-app',
            title: 'Quiz Application',
            description: 'An interactive quiz app with timer, scoring, and multiple question categories.',
            difficulty: 'intermediate',
            category: 'web',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            icon: 'fa-question-circle',
            gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
            estimatedTime: '2-3 hours',
            features: ['Timer', 'Score tracking', 'Results summary', 'Category selection']
        },
        {
            id: 'weather-dashboard',
            title: 'Weather Dashboard',
            description: 'A weather app displaying current conditions and forecasts using a public API.',
            difficulty: 'intermediate',
            category: 'utility',
            technologies: ['HTML', 'CSS', 'JavaScript', 'API'],
            icon: 'fa-cloud-sun',
            gradient: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
            estimatedTime: '3-4 hours',
            features: ['Weather API integration', 'Location search', 'Unit toggle', 'Forecast view']
        },
        {
            id: 'login-ui',
            title: 'Login UI Component',
            description: 'Beautiful login/signup forms with validation, animations, and responsive design.',
            difficulty: 'beginner',
            category: 'web',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            icon: 'fa-sign-in-alt',
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            estimatedTime: '1-2 hours',
            features: ['Form validation', 'Toggle between login/signup', 'Smooth transitions', 'Accessibility']
        },
        {
            id: 'expense-tracker',
            title: 'Expense Tracker',
            description: 'Track income and expenses with charts, categories, and monthly reports.',
            difficulty: 'intermediate',
            category: 'utility',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            icon: 'fa-wallet',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            estimatedTime: '4-5 hours',
            features: ['CRUD for transactions', 'Category management', 'Charts/visualization', 'Export data']
        },
        {
            id: 'notes-app',
            title: 'Notes App',
            description: 'A note-taking application with rich text editing, search, and organization.',
            difficulty: 'intermediate',
            category: 'app',
            technologies: ['HTML', 'CSS', 'JavaScript', 'LocalStorage'],
            icon: 'fa-sticky-note',
            gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
            estimatedTime: '3-4 hours',
            features: ['Create/edit/delete notes', 'Search functionality', 'Categories', 'Pin notes']
        }
    ],

    // ==========================================
    // Playground Starter Code Templates
    // ==========================================
    
    playgroundTemplates: {
        'html-css-js': `<!-- Welcome to the Code Forge Playground! -->
<!-- Write HTML, CSS, and JavaScript code below -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <style>
        /* Your CSS goes here */
        body {
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea, #764ba2);
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        p {
            color: #666;
        }
        
        button {
            margin-top: 20px;
            padding: 12px 28px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello from Code Forge!</h1>
        <p>Edit this code and click "Run" to see changes</p>
        <button onclick="greet()">Click Me!</button>
        <p id="output"></p>
    </div>

    <script>
        // Your JavaScript goes here
        function greet() {
            document.getElementById('output').textContent = 
                '🎉 You clicked the button! Keep coding!';
        }
        
        console.log('Welcome to Code Forge Playground!');
    </script>
</body>
</html>`,

        javascript: `// Welcome to the JavaScript Playground!

console.log("Hello from Code Forge!");

// Try out some JavaScript:

// Variables
const greeting = "Welcome to Code Forge!";
const numbers = [1, 2, 3, 4, 5];

console.log(greeting);
console.log(numbers);

// Functions
function calculateSum(arr) {
    return arr.reduce((sum, num) => sum + num, 0);
}

console.log("Sum:", calculateSum(numbers));

// Try your own code below:
`,

        python: `# Welcome to Code Forge Python Playground!
# Note: This template shows what Python code looks like
# Full execution requires backend configuration

# Simple Python examples:

def greet(name):
    """Return a greeting message"""
    return f"Hello, {name}! Welcome to CodeForge!"

def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib

# Example usage
print(greet("Developer"))
print("Fibonacci(10):", fibonacci(10))
`,

        java: `// Java Playground Template
// Full compilation requires backend configuration

public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Code Forge!");
        
        // Example: Calculate factorial
        int number = 5;
        long result = factorial(number);
        System.out.println("Factorial of " + number + " is " + result);
    }
    
    public static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}`
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATA;
}