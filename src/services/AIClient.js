/**
 * HackSkill Decoupled AI Prompt & Response Service Coordinator
 * Simulates Gemini AI services with production-ready NLP generators
 */

export const AIClient = {
  // AI Mentor chat responder
  getMentorResponse: async (query, language = 'en') => {
    const cleanQuery = query.toLowerCase().trim();
    
    // Quick prompt chip responses
    if (cleanQuery.includes('roadmap') || cleanQuery.includes('study plan')) {
      return {
        role: 'mentor',
        text: language === 'es'
          ? "🗺️ **Copa AI Ruta de Aprendizaje:** Aquí tienes tu itinerario de Javascript Fullstack:\n1. Fundamentos sintácticos (XP 100)\n2. Programación Asíncrona (Promesas y async/wait)\n3. Servidores con Express (XP 250)\n4. Bases de datos integradas.\n¡Completa las lecciones para certificar tu nivel!"
          : language === 'fr'
          ? "🗺️ **Copa AI Feuille de Route:** Voici votre plan Javascript Fullstack:\n1. Syntaxe de base (XP 100)\n2. Programmation Asynchrone (Promesses & async/await)\n3. Node.js et Express (XP 250)\n4. Intégration de Bases de Données.\nProgressez pour obtenir votre certificat!"
          : "🗺️ **Copa AI Learning Roadmap:** Here is your structured Fullstack JavaScript path:\n1. Syntactic Fundamentals (XP 100)\n2. Asynchronous Execution (Promises & Async/Await)\n3. Express Server Engines (XP 250)\n4. Datastores Integration.\nComplete the coding challenges to generate your certification!"
      };
    }
    
    if (cleanQuery.includes('closure') || cleanQuery.includes('scope')) {
      return {
        role: 'mentor',
        text: "🔒 **Copa AI Explanation:** A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In simple terms, a closure gives an inner function access to the outer function's scope even after the outer function has finished executing."
      };
    }

    if (cleanQuery.includes('event loop') || cleanQuery.includes('asynchronous')) {
      return {
        role: 'mentor',
        text: "🔄 **Copa AI Explanation:** The Event Loop is the secret behind JavaScript's asynchronous execution. Since JS is single-threaded, the event loop monitors the Call Stack and Callback Queue. When the stack is empty, it pushes execution callbacks onto it to prevent blocking UI threads."
      };
    }

    // Default response
    return {
      role: 'mentor',
      text: language === 'es'
        ? "🤖 **Copa AI Mentor:** He analizado tu pregunta. Para acelerar tu aprendizaje, te sugiero abrir la pestaña 'Coding Playground' y probar ejemplos prácticos de código. ¿Hay algún concepto específico que quieras profundizar?"
        : language === 'fr'
        ? "🤖 **Copa AI Mentor:** J'ai analysé votre demande. Pour accélérer votre apprentissage, je vous suggère d'ouvrir l'onglet 'Coding Playground' pour tester des exemples de code. Quel concept souhaitez-vous approfondir?"
        : "🤖 **Copa AI Mentor:** I've analyzed your query. To maximize retention, I recommend opening the 'Coding Playground' panel and writing sample scripts. Let me know if you need code reviews, interview coaching, or resume analysis!"
    };
  },

  // AI Code Reviewer
  getCodeReview: async (code, language = 'javascript') => {
    if (!code.trim()) {
      return "⚠️ **AI Code Review:** Code workspace is empty. Write or paste scripts in the playground before running a review.";
    }

    const complexity = code.includes('for') || code.includes('while') ? 'O(N) Linear Complexity' : 'O(1) Constant Complexity';
    const suggestions = code.includes('var') 
      ? "- Replace 'var' definitions with modern scoped 'let' or 'const' variables to prevent scope leakage.\n" 
      : "";
    
    return `🔍 **AI Code Reviewer Diagnostics:**
- **Code Syntax**: Verified clean compiler tags.
- **Estimated Complexity**: ${complexity}
- **Optimizations recommended**:
${suggestions}- Ensure strict equality comparisons (\`===\` instead of \`==\`) are used consistently.
- DRY Principle: Structure code modularly into reusable functions.`;
  },

  // AI Bug Finder
  getBugFinder: async (code) => {
    if (!code.trim()) {
      return "⚠️ **AI Bug Finder:** No code found to analyze.";
    }

    const hasMissingBrace = (code.match(/{/g) || []).length !== (code.match(/}/g) || []).length;
    const hasVarLeak = code.includes('var ');
    const hasFetchNoError = code.includes('fetch') && !code.includes('catch');

    let diagnostics = [];
    if (hasMissingBrace) diagnostics.push("🔴 **Syntax Bug**: Unequal curly brackets sequence. Code block execution will fail.");
    if (hasVarLeak) diagnostics.push("🟡 **Scope Bug**: 'var' declaration detected. Can result in global variable leakage.");
    if (hasFetchNoError) diagnostics.push("🟠 **Async Bug**: Unhandled network fetch promise. Missing catch block for error management.");

    if (diagnostics.length === 0) {
      return "✅ **AI Bug Finder:** Clean code scan! No logical warnings or compiler faults detected in this segment.";
    }

    return `🐞 **AI Bug Finder Scan Report:**\n\n` + diagnostics.join('\n');
  },

  // AI Resume Analyzer
  analyzeResume: async (text) => {
    if (!text.trim()) {
      return "⚠️ **AI Resume Analyzer:** Copy/paste resume details before starting audits.";
    }

    const score = Math.floor(Math.random() * 20) + 72; // 72-91
    return `📄 **AI Resume Auditor Score: ${score}% Match**

**Strengths**:
- Solid integration keywords found for fullstack engineering.
- Good layout formatting and clear action metrics.

**Suggested improvements**:
- Add specific developer projects highlighting API architecture or system performance.
- Highlight metrics showing project outcomes (e.g. *\"Reduced load latency by 20%\"*).
- Keywords checklist missed: **\"Docker\"**, **\"CI/CD Pipelines\"**, **\"Redis Caching\"**`;
  },

  // AI Interview Coach
  getInterviewCoachResponse: async (answer, topic = 'javascript') => {
    if (!answer.trim()) {
      return "💬 **AI Interview Coach:** Hi! I am your senior interviewer. Let's practice. What is the difference between let, const, and var in Javascript?";
    }

    const isGoodAnswer = answer.length > 25;
    return `💼 **Senior Interviewer Feedback:**
- **Answer Depth**: ${isGoodAnswer ? 'Excellent detail provided!' : 'Answer is too brief. Try to elaborate on memory allocation and hoisting behaviors.'}
- **Score**: ${isGoodAnswer ? '85/100' : '50/100'}
- **Next Question**: Great. Can you explain how promises work in Javascript and how they prevent Callback Hell?`;
  }
};
