/**
 * StadiumPulse AI - Core Frontend Application Logic
 * FIFA World Cup 2026 Smart Stadium Platform
 */

// Global State
const state = {
  activeTab: 'fan',
  language: 'en',
  userSeat: 'Sec 112, Row M, Seat 5',
  assistMode: 'none',
  mapLayer: 'density',
  ecoPoints: 120,
  ecoActions: {
    cup: false,
    waste: false,
    transit: true,
    ticket: true
  },
  telemetry: {
    gateA: 4,
    gateB: 14,
    gateC: 26,
    gateD: 7,
    water: 58,
    waste: 41,
    energy: 320,
    incidents: 0
  },
  activeSimulation: null,
  activePath: null,
  sentimentScore: 84,
  msgCounter: 1
};

// Node Coordinates on SVG Map
const mapNodes = {
  // Seat Blocks
  '112': { x: 400, y: 170 },
  '114': { x: 510, y: 205 },
  '116': { x: 570, y: 300 },
  '118': { x: 510, y: 395 },
  '120': { x: 400, y: 430 },
  '122': { x: 290, y: 395 },
  '104': { x: 230, y: 300 },
  '110': { x: 290, y: 205 },
  
  // Gates
  'gateA': { x: 400, y: 120 },
  'gateB': { x: 620, y: 300 },
  'gateC': { x: 400, y: 480 },
  'gateD': { x: 180, y: 300 },
  
  // Landmarks
  'metro': { x: 100, y: 100 },
  'parkingA': { x: 700, y: 120 },
  'parkingB': { x: 720, y: 480 },
  
  // Facilities
  'restroom114': { x: 520, y: 230 },
  'restroom122': { x: 280, y: 370 },
  'tacos': { x: 270, y: 230 },
  'burgers': { x: 530, y: 370 },
  'elevator': { x: 210, y: 275 },
  'aid': { x: 400, y: 445 }
};

// Multilingual Copa AI Strings
const i18n = {
  en: {
    welcome: "Hello! I am Copa, your FIFA 26 smart stadium assistant. I know your seat is in <strong>Section 112</strong>. How can I help you navigate MetLife Stadium today?",
    placeholder: "Ask Copa about routes, concessions, schedules...",
    restroomMsg: "🚻 <strong>Copa AI Restroom Guide:</strong> The closest restroom to Section 112 is located at Sector 114 concourse. I've highlighted the optimal step-free path on the map for you. Queue estimate: 4 minutes.",
    tacoMsg: "🌮 <strong>Copa AI Concessions Guide:</strong> Craving tacos? The <em>World Cup Taco Hub</em> is located in Sector 110 concourse. Average queue is 6 minutes. Follow the highlighted green pathway on your map!",
    metroMsg: "🚇 <strong>Copa AI Transit Guide:</strong> To reach the Metro Terminal from Section 112, proceed through Gate A and follow the stadium ring route path highlighted. Expected walk time: 9 minutes.",
    accessMsg: "♿ <strong>Copa AI Accessibility Guide:</strong> Wheelchair-friendly elevator access is active near Sector 104 concourse. Standard route is 2 minutes. I've marked the step-free ramp pathway on your map.",
    matchFactMsg: "⚽ <strong>Copa AI Match Day Facts:</strong> USA leading Mexico 2 - 1. Christian Pulisic scored at 34', Raul Jimenez equalized at 54' (PK), and Weston McKennie restored USA's lead at 72'. MetLife Stadium is at 98% capacity.",
    translateMsg: "🗣️ <strong>Copa AI Translator:</strong> You can say: <em>\"¿Dónde está mi asiento, por favor?\"</em> in Spanish (where is my seat, please). Let me know if you need translation card files for ticketing or help desks!",
    defaultReply: "🤖 <strong>Copa AI Support:</strong> I've analyzed your query. StadiumPulse telemetry indicates that concourses around Section 112 are moderately active. Let me know if you'd like a route plotted on the map!",
    commuteCalculate: "Routing commute preference..."
  },
  es: {
    welcome: "¡Hola! Soy Copa, tu asistente virtual inteligente de la FIFA 26. Sé que tu asiento está en la <strong>Sección 112</strong>. ¿Cómo puedo ayudarte en el MetLife Stadium hoy?",
    placeholder: "Pregúntale a Copa sobre rutas, comida, horarios...",
    restroomMsg: "🚻 <strong>Copa AI Guía de Baños:</strong> El baño más cercano a la Sección 112 está en el pasillo del Sector 114. He trazado la ruta más directa y sin escaleras en tu mapa. Tiempo de espera: 4 minutos.",
    tacoMsg: "🌮 <strong>Copa AI Comida:</strong> ¿Quieres tacos? El <em>World Cup Taco Hub</em> está en el Sector 110. Fila promedio: 6 minutos. ¡Sigue la ruta verde en tu mapa!",
    metroMsg: "🚇 <strong>Copa AI Transporte:</strong> Para llegar a la Terminal de Metro desde la Sección 112, sal por la Puerta A y sigue la ruta exterior. Tiempo estimado a pie: 9 minutos.",
    accessMsg: "♿ <strong>Copa AI Accesibilidad:</strong> El ascensor para silla de ruedas está activo cerca del Sector 104. He trazado la rampa de acceso sin escaleras en tu mapa.",
    matchFactMsg: "⚽ <strong>Copa AI Estadísticas del Partido:</strong> EE.UU. vence a México 2 - 1. Goles: Pulisic (34'), Jiménez (54' penalti), McKennie (72'). El estadio está al 98% de su capacidad.",
    translateMsg: "🗣️ <strong>Copa AI Traductor:</strong> En inglés se dice: <em>\"Where is my seat, please?\"</em>. ¡Avísame si necesitas traducir otras frases para la entrada o seguridad!",
    defaultReply: "🤖 <strong>Copa AI Soporte:</strong> He procesado tu consulta. La telemetría de StadiumPulse indica flujo normal en la Sección 112. ¿Deseas que te muestre alguna ruta?",
    commuteCalculate: "Calculando ruta de transporte..."
  },
  fr: {
    welcome: "Bonjour! Je suis Copa, votre assistant intelligent de la Coupe du Monde FIFA 26. Votre siège est dans la <strong>Section 112</strong>. Comment puis-je vous aider au MetLife Stadium aujourd'hui?",
    placeholder: "Demandez à Copa les directions, la nourriture, les transports...",
    restroomMsg: "🚻 <strong>Copa AI Guide des Toilettes:</strong> Les toilettes les plus proches se trouvent dans la coursive du Secteur 114. J'ai tracé l'itinéraire sans escalier sur votre carte. Attente: 4 minutes.",
    tacoMsg: "🌮 <strong>Copa AI Restauration:</strong> Envie de tacos? Le <em>World Cup Taco Hub</em> se trouve dans le Secteur 110. File d'attente moyenne: 6 minutes. Suivez le chemin vert sur votre carte!",
    metroMsg: "🚇 <strong>Copa AI Transports:</strong> Pour rejoindre le terminal de métro depuis la Section 112, sortez par la Porte A et suivez le chemin balisé. Temps de marche estimé: 9 minutes.",
    accessMsg: "♿ <strong>Copa AI Accessibilité:</strong> Un ascenseur accessible aux fauteuils roulants est opérationnel près du Secteur 104. L'itinéraire sans marche est tracé sur la carte.",
    matchFactMsg: "⚽ <strong>Copa AI Statistiques du Match:</strong> Les États-Unis mènent 2 - 1 contre le Mexique. Pulisic (34'), Jimenez (54' pen), McKennie (72'). Le stade est rempli à 98%.",
    translateMsg: "🗣️ <strong>Copa AI Traduction:</strong> En anglais, on dit: <em>\"Where is my seat, please?\"</em>. Dites-moi si vous avez besoin d'autres traductions pour les guichets!",
    defaultReply: "🤖 <strong>Copa AI Support:</strong> J'ai analysé votre demande. La télémétrie indique un trafic modéré autour de la Section 112. Souhaitez-vous voir un itinéraire?",
    commuteCalculate: "Calcul de l'itinéraire de transport..."
  }
};

// Initial setup
window.onload = function() {
  // Update footer time
  setInterval(updateLocalTime, 1000);
  updateLocalTime();
  
  // Fluctuate sentiment score slightly to look alive
  setInterval(fluctuateSentiment, 6000);
  
  // Populate maps, initialize state values
  updateTelemetryUI();
  
  // Highlight seat block 112 initially on the map
  const seatBlock = document.getElementById('block-112');
  if (seatBlock) seatBlock.classList.add('selected');
};

function updateLocalTime() {
  const timeElem = document.getElementById('current-time');
  if (timeElem) {
    const now = new Date();
    timeElem.innerText = now.toISOString().replace('T', ' ').substring(0, 19);
  }
}

// Tab switcher
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  // Views
  document.querySelectorAll('.portal-view').forEach(view => view.classList.remove('active'));
  document.getElementById(`view-${tabId}`).classList.add('active');

  // If switched to Ops, show normal log
  if (tabId === 'ops') {
    addOpsLog('Operations Coordinator switched console mode.', 'system');
  }
}

// Language handler
function changeLanguage() {
  const langSelect = document.getElementById('fan-lang');
  state.language = langSelect.value;
  
  // Update UI texts
  const welcomeText = document.getElementById('welcome-text');
  welcomeText.innerHTML = i18n[state.language].welcome;
  
  const chatInput = document.getElementById('fan-chat-input');
  chatInput.placeholder = i18n[state.language].placeholder;

  // Add system translation log
  addChatMessage(`Copa AI Language switched to ${state.language.toUpperCase()}`, 'system');
}

// User changes input seat
function updateSeatLocation() {
  const inputSeat = document.getElementById('fan-seat').value;
  state.userSeat = inputSeat;
  addOpsLog(`Fan seat location updated in client telemetry to: ${inputSeat}`, 'system');
}

// User toggles accessibility mode
function updateAccessibilityMode() {
  const mode = document.getElementById('fan-needs').value;
  state.assistMode = mode;
  addOpsLog(`Fan accessibility preferences modified: Mode [${mode}]`, 'system');
  addChatMessage(`♿ Copa AI: Assist mode updated to <strong>${mode.toUpperCase()}</strong>. Pathfinding algorithms will favor step-free ramps and low-sensory corridors.`, 'system');
}

// Fan AI Chat Interactions
function handleChatKey(event) {
  if (event.key === 'Enter') {
    sendFanMessage();
  }
}

function sendFanMessage() {
  const inputElem = document.getElementById('fan-chat-input');
  const userText = inputElem.value.trim();
  if (!userText) return;

  // Display user bubble
  addChatMessage(userText, 'user');
  inputElem.value = '';

  // Processing delay simulation
  setTimeout(() => {
    generateAIResponse(userText.toLowerCase());
  }, 600);
}

function sendSuggestedQuestion(key) {
  let userText = "";
  const lang = state.language;
  
  if (key === 'nearest_restroom') userText = lang === 'es' ? "Dónde está el baño más cercano?" : lang === 'fr' ? "Où sont les toilettes?" : "Where is the nearest restroom?";
  else if (key === 'taco_stand') userText = lang === 'es' ? "Quiero buscar un puesto de tacos" : lang === 'fr' ? "Où puis-je trouver des tacos?" : "I want to find a taco stand";
  else if (key === 'metro_route') userText = lang === 'es' ? "Cómo llegar a la estación de metro?" : lang === 'fr' ? "Comment aller au métro?" : "How do I get to the Metro?";
  else if (key === 'accessibility') userText = lang === 'es' ? "Dónde hay ascensores sin escaleras?" : lang === 'fr' ? "Où sont les ascenseurs accessibles?" : "Where is the wheelchair elevator?";
  else if (key === 'translate_phrase') userText = lang === 'es' ? "Ayúdame a traducir frases" : lang === 'fr' ? "Aide-moi à traduire" : "Help me translate a phrase";
  else if (key === 'match_fact') userText = lang === 'es' ? "Estadísticas del partido de fútbol" : lang === 'fr' ? "Statistiques du match" : "Tell me match stats";
  
  addChatMessage(userText, 'user');
  setTimeout(() => {
    generateAIResponse(key);
  }, 500);
}

function addChatMessage(text, sender) {
  const feed = document.getElementById('fan-chat-messages');
  
  if (sender === 'system') {
    const msg = document.createElement('div');
    msg.className = 'message system-msg';
    msg.innerHTML = `<p>${text}</p>`;
    feed.appendChild(msg);
  } else {
    state.msgCounter++;
    const msgId = `copa-msg-${state.msgCounter}`;
    
    const msg = document.createElement('div');
    msg.className = `message ${sender}-msg`;
    
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = sender === 'ai' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'msg-content';
    
    // Add text and TTS listen button if sender is AI
    let innerHTML = `<p id="${msgId}">${text}</p>`;
    if (sender === 'ai') {
      innerHTML += `<button class="audio-speak-btn" onclick="speakCopaResponse('${msgId}')"><i class="fa-solid fa-volume-high"></i> Listen to Copa</button>`;
    }
    content.innerHTML = innerHTML;
    
    msg.appendChild(avatar);
    msg.appendChild(content);
    feed.appendChild(msg);
  }
  
  feed.scrollTop = feed.scrollHeight;
}

// Generate Response and plot path dynamically
function generateAIResponse(queryKeyOrText) {
  const lang = state.language;
  let reply = "";
  let targetNode = null;
  let routeType = state.assistMode === 'wheelchair' ? 'accessible' : 'standard';

  // Check query keys
  if (queryKeyOrText.includes('restroom') || queryKeyOrText.includes('baño') || queryKeyOrText.includes('toilette') || queryKeyOrText === 'nearest_restroom') {
    reply = i18n[lang].restroomMsg;
    targetNode = 'restroom114';
  } else if (queryKeyOrText.includes('taco') || queryKeyOrText.includes('food') || queryKeyOrText.includes('comida') || queryKeyOrText.includes('manger') || queryKeyOrText === 'taco_stand') {
    reply = i18n[lang].tacoMsg;
    targetNode = 'tacos';
  } else if (queryKeyOrText.includes('metro') || queryKeyOrText.includes('train') || queryKeyOrText.includes('transit') || queryKeyOrText.includes('subway') || queryKeyOrText === 'metro_route') {
    reply = i18n[lang].metroMsg;
    targetNode = 'metro';
  } else if (queryKeyOrText.includes('wheelchair') || queryKeyOrText.includes('elevator') || queryKeyOrText.includes('access') || queryKeyOrText.includes('silla de ruedas') || queryKeyOrText.includes('handicap') || queryKeyOrText === 'accessibility') {
    reply = i18n[lang].accessMsg;
    targetNode = 'elevator';
    routeType = "accessible";
  } else if (queryKeyOrText.includes('match') || queryKeyOrText.includes('fact') || queryKeyOrText.includes('score') || queryKeyOrText.includes('stat') || queryKeyOrText.includes('partido') || queryKeyOrText === 'match_fact') {
    reply = i18n[lang].matchFactMsg;
  } else if (queryKeyOrText.includes('translate') || queryKeyOrText.includes('traducción') || queryKeyOrText.includes('tradui') || queryKeyOrText === 'translate_phrase') {
    reply = i18n[lang].translateMsg;
  } else {
    // Basic dynamic answer
    reply = i18n[lang].defaultReply;
  }

  // Check context if rain is happening
  if (state.activeSimulation === 'rain') {
    reply += lang === 'es' 
      ? "<br><br>🌧️ <strong>Aviso de lluvia:</strong> Lleva un impermeable. Los accesos cubiertos están habilitados en los pasillos superiores." 
      : lang === 'fr' 
      ? "<br><br>🌧️ <strong>Alerte Pluie:</strong> Les coursives couvertes sont recommandées. Le toit du concourse est entièrement déployé."
      : "<br><br>🌧️ <strong>Rain Alert:</strong> Covered concourses are recommended. Shuttles are running with delays.";
  }

  // Check evacuation
  if (state.activeSimulation === 'evac') {
    reply = lang === 'es'
      ? "🚨 <strong>AVISO DE EVACUACIÓN CRÍTICA:</strong> Se ha activado la alarma. Por favor, desaloje el estadio con calma. Use la salida de emergencia más cercana (Gate A/D)."
      : lang === 'fr'
      ? "🚨 <strong>ALERTE D'ÉVACUATION CRITIQUE:</strong> Alarme active. Veuillez évacuer le stade calmement par la sortie la plus proche (Porte A/D)."
      : "🚨 <strong>CRITICAL EVACUATION ADVISORY:</strong> Alarm triggered. Please exit the stadium calmly via the nearest gates (A/D) highlighted in red.";
    targetNode = 'gateA';
    routeType = "accessible";
  }

  addChatMessage(reply, 'ai');

  // Trigger SVG Path Routing
  if (targetNode) {
    drawStadiumRoute('112', targetNode, routeType);
  }
}

// Browser TTS (SpeechSynthesis) integration
function speakCopaResponse(msgId) {
  if (!('speechSynthesis' in window)) {
    alert("Speech Synthesis is not supported in this browser.");
    return;
  }

  // Cancel any ongoing speaking
  window.speechSynthesis.cancel();

  // Extract raw text
  const msgElem = document.getElementById(msgId);
  if (!msgElem) return;
  const rawText = msgElem.innerText.replace(/🗣️|🚻|🌮|🚇|♿|⚽|🤖|🔊/g, ''); // strip emojis

  const utterance = new SpeechSynthesisUtterance(rawText);

  // Set language voice parameters
  if (state.language === 'es') {
    utterance.lang = 'es-MX';
  } else if (state.language === 'fr') {
    utterance.lang = 'fr-FR';
  } else {
    utterance.lang = 'en-US';
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.1;

  // Bind animation toggles
  const visualizer = document.getElementById('audio-waveform');
  
  utterance.onstart = function() {
    visualizer.style.display = 'flex';
  };

  utterance.onend = function() {
    visualizer.style.display = 'none';
  };

  utterance.onerror = function() {
    visualizer.style.display = 'none';
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  document.getElementById('audio-waveform').style.display = 'none';
}

// Map layer switching
function toggleMapLayer(layer) {
  state.mapLayer = layer;
  
  document.querySelectorAll('.map-layer-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${layer}`).classList.add('active');

  const facilityGroup = document.querySelectorAll('.map-facility');
  const pathBlocks = document.querySelectorAll('.seat-block');

  if (layer === 'density') {
    pathBlocks.forEach(block => {
      block.style.fillOpacity = "0.22";
    });
    facilityGroup.forEach(fac => fac.style.opacity = "0.4");
  } else {
    pathBlocks.forEach(block => {
      block.style.fillOpacity = "0.05";
    });
    facilityGroup.forEach(fac => {
      fac.style.opacity = "1";
      fac.style.transform = "scale(1.15)";
      setTimeout(() => fac.style.transform = "scale(1)", 300);
    });
  }
}

// SVG Routing Engine
function drawStadiumRoute(startBlock, targetNodeId, routeType) {
  const pathElem = document.getElementById('route-path');
  const marker = document.getElementById('seat-marker');
  
  const start = mapNodes[startBlock];
  const target = mapNodes[targetNodeId];
  
  if (!start || !target) return;

  let controlX = (start.x + target.x) / 2;
  let controlY = (start.y + target.y) / 2;
  
  if (routeType === 'accessible') {
    controlX -= 30;
    controlY += 40;
  } else {
    controlX += 20;
    controlY -= 20;
  }

  const d = `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`;
  
  pathElem.setAttribute('d', d);
  pathElem.style.display = 'block';
  
  if (routeType === 'accessible') {
    pathElem.setAttribute('stroke', '#ff00aa');
  } else {
    pathElem.setAttribute('stroke', '#00f3ff');
  }

  marker.setAttribute('transform', `translate(${target.x}, ${target.y})`);
  marker.style.display = 'block';

  document.querySelectorAll('.seat-block').forEach(b => b.classList.remove('selected'));
  const targetBlock = document.getElementById(`block-${startBlock}`);
  if (targetBlock) targetBlock.classList.add('selected');

  addOpsLog(`GenAI plotted route from Block ${startBlock} to ${targetNodeId} (${routeType} path)`, 'ai');
}

// Seat Click Event
function selectSeatBlock(blockNum) {
  document.querySelectorAll('.seat-block').forEach(b => b.classList.remove('selected'));
  document.getElementById(`block-${blockNum}`).classList.add('selected');
  
  document.getElementById('fan-seat').value = `Sec ${blockNum}, Row A, Seat 1`;
  state.userSeat = `Sec ${blockNum}, Row A, Seat 1`;

  addChatMessage(`Selected seat location: Block ${blockNum}`, 'system');
}

// Food pre-order optimizer logic
function optimizeFoodOrder() {
  const foodSelect = document.getElementById('food-item-select');
  const selectedVal = foodSelect.value;
  const resultsBox = document.getElementById('food-results');
  
  resultsBox.style.display = 'flex';
  
  const title = document.getElementById('food-title-res');
  const badge = document.getElementById('food-time-res');
  const desc = document.getElementById('food-desc-res');

  const now = new Date();
  now.setMinutes(now.getMinutes() + 8);
  const timeString = now.toTimeString().substring(0, 5);

  let targetStand = 'tacos';

  if (selectedVal === 'burger') {
    title.innerText = "Big Kick Beef Burger";
    badge.innerText = `${timeString} Pickup`;
    desc.innerHTML = `GenAI allocated window at <strong>Concourse Sec 118</strong>. Your queue wait is optimized down to 2 minutes. (Bypasses general 12-min queue).`;
    targetStand = 'burgers';
  } else if (selectedVal === 'pretzel') {
    title.innerText = "Golden Goal Soft Pretzel";
    badge.innerText = `${timeString} Pickup`;
    desc.innerHTML = `GenAI allocated window at <strong>Concourse Sec 116</strong>. Your queue wait is optimized down to 1 minute. (Bypasses general 5-min queue).`;
    targetStand = 'restroom114'; // proximity
  } else {
    title.innerText = "Championship Taco Basket";
    badge.innerText = `${timeString} Pickup`;
    desc.innerHTML = `GenAI allocated window at <strong>Concourse Sec 110</strong>. Your queue wait is optimized down to 1.5 minutes. (Bypasses general 8-min queue).`;
    targetStand = 'tacos';
  }

  // Draw path to stand on map
  drawStadiumRoute('112', targetStand, 'standard');
  addOpsLog(`Food pre-order optimization calculated pickup slot at ${timeString} for stand [${targetStand}]`, 'ai');
}

// Travel & Commute Planner Calculator
function calculateCommute() {
  const origin = document.getElementById('commute-origin').value;
  const pref = document.getElementById('commute-preference').value;
  const resultsBox = document.getElementById('transit-results');
  
  resultsBox.style.display = 'block';
  
  const etaElem = document.getElementById('transit-eta');
  const carbonElem = document.getElementById('transit-carbon');
  const gateElem = document.getElementById('transit-gate');
  const timeline = document.getElementById('transit-timeline');
  
  let eta = "35 mins";
  let carbon = "-60% 🌱";
  let gate = "Gate D";
  let steps = [];

  if (origin === 'manhattan') {
    if (pref === 'eco') {
      eta = "48 mins";
      carbon = "-85% 🌱 Eco-Choice";
      gate = "Gate D (Metro entrance)";
      steps = [
        { time: "14:40", desc: "Board NJ Transit Bus #160 at Port Authority Terminal.", active: true },
        { time: "15:05", desc: "Arrive at MetLife Metro Bus Center.", active: true },
        { time: "15:15", desc: "Pass digital ticketing via zero-paper scanning Gate D.", active: false, eco: true }
      ];
    } else if (pref === 'accessible') {
      eta = "55 mins";
      carbon = "-70% 🌱";
      gate = "Gate A (Elevator Access)";
      steps = [
        { time: "14:40", desc: "Board NJ Transit train from Penn Station (Wheelchair-car).", active: true },
        { time: "14:55", desc: "Transfer at Secaucus Junction (Ramps active).", active: true },
        { time: "15:20", desc: "Arrive MetLife Rail. Assist crew guides to Gate A lift.", active: false, eco: false }
      ];
    } else {
      eta = "38 mins";
      carbon = "-65% 🌱";
      gate = "Gate D";
      steps = [
        { time: "14:40", desc: "NJ Transit Express rail from Secaucus Junction.", active: true },
        { time: "15:08", desc: "Arrive MetLife Stadium station platform.", active: true },
        { time: "15:18", desc: "Enter via Gate D entry corridors.", active: false }
      ];
    }
  } else if (origin === 'newark') {
    eta = "45 mins";
    carbon = "-50% 🌱";
    gate = "Gate C";
    steps = [
      { time: "14:40", desc: "Board airport rideshare to Lot A dropzone.", active: true },
      { time: "15:10", desc: "Board shuttle loop to MetLife perimeter.", active: true },
      { time: "15:25", desc: "Walk through Gate C entry checkpoints.", active: false }
    ];
  } else if (origin === 'secaucus') {
    eta = "22 mins";
    carbon = "-75% 🌱";
    gate = "Gate D";
    steps = [
      { time: "14:40", desc: "Board MetLife Express rail platform.", active: true },
      { time: "14:55", desc: "Arrive at Metro terminal walk zone.", active: true },
      { time: "15:02", desc: "Clear turnstiles at Gate D.", active: false }
    ];
  } else {
    eta = "15 mins";
    carbon = "0% (Gasoline)";
    gate = "Gate B";
    steps = [
      { time: "14:40", desc: "Locate space in Lot B Parking (Green lane).", active: true },
      { time: "14:48", desc: "Walk via Lot B eco-passway to stadium east boundary.", active: true },
      { time: "14:55", desc: "Enter gate B turnstiles.", active: false }
    ];
  }

  etaElem.innerText = eta;
  carbonElem.innerText = carbon;
  gateElem.innerText = gate;

  timeline.innerHTML = '';
  steps.forEach(step => {
    const div = document.createElement('div');
    div.className = `timeline-step ${step.active ? 'active' : ''} ${step.eco ? 'eco' : ''}`;
    div.innerHTML = `<span class="step-time">${step.time}</span><span class="step-desc">${step.desc}</span>`;
    timeline.appendChild(div);
  });

  if (origin === 'manhattan' || origin === 'secaucus') {
    drawStadiumRoute('104', 'gateD', 'standard');
  } else if (origin === 'local') {
    drawStadiumRoute('118', 'gateB', 'standard');
  } else {
    drawStadiumRoute('120', 'gateC', 'standard');
  }

  addOpsLog(`Commute routing calculated from ${origin} focusing on ${pref}`, 'ai');
}

// Eco challenge completion helper
function completeEcoAction(type) {
  if (state.ecoActions[type]) return;

  state.ecoActions[type] = true;
  state.ecoPoints += type === 'cup' ? 50 : 30;
  
  const icon = document.getElementById(`eco-${type}-icon`);
  icon.className = "fa-solid fa-circle-check";
  icon.parentElement.classList.add('completed');

  const ptsContainer = document.getElementById('eco-pts-display');
  ptsContainer.innerText = `${state.ecoPoints} / 200 PTS`;

  const bar = document.getElementById('eco-progress-fill');
  const percent = Math.min((state.ecoPoints / 200) * 100, 100);
  bar.style.width = `${percent}%`;

  if (state.ecoPoints >= 200) {
    document.getElementById('voucher-box').style.display = 'flex';
  }

  addChatMessage(`🎉 <strong>Eco Action Completed:</strong> You've earned points for returning stadium recycling resources! Check your voucher status.`, 'system');
}

// Sentiment analyzer fluctuation simulation
function fluctuateSentiment() {
  const dev = Math.floor(Math.random() * 5) - 2; // -2 to +2
  state.sentimentScore = Math.min(Math.max(state.sentimentScore + dev, 60), 98);
  
  const scoreVal = document.getElementById('sentiment-score-val');
  const scoreFill = document.getElementById('sentiment-fill');
  
  if (scoreVal && scoreFill) {
    scoreVal.innerText = `${state.sentimentScore}% Positive`;
    scoreFill.style.width = `${state.sentimentScore}%`;
  }
}

// ==============================================
// STADIUM OPERATIONS TELEMETRY & SIMULATOR LOGIC
// ==============================================

function updateTelemetryUI() {
  document.getElementById('val-gate-a').innerText = state.telemetry.gateA;
  document.getElementById('bar-gate-a').style.width = `${Math.min(state.telemetry.gateA * 4, 100)}%`;
  updateGateBadge('gate-a', state.telemetry.gateA);

  document.getElementById('val-gate-b').innerText = state.telemetry.gateB;
  document.getElementById('bar-gate-b').style.width = `${Math.min(state.telemetry.gateB * 4, 100)}%`;
  updateGateBadge('gate-b', state.telemetry.gateB);

  document.getElementById('val-gate-c').innerText = state.telemetry.gateC;
  document.getElementById('bar-gate-c').style.width = `${Math.min(state.telemetry.gateC * 4, 100)}%`;
  updateGateBadge('gate-c', state.telemetry.gateC);

  document.getElementById('val-gate-d').innerText = state.telemetry.gateD;
  document.getElementById('bar-gate-d').style.width = `${Math.min(state.telemetry.gateD * 4, 100)}%`;
  updateGateBadge('gate-d', state.telemetry.gateD);

  document.getElementById('val-water').innerHTML = `${state.telemetry.water} PSI <span class="sub-text">(${state.telemetry.water > 50 ? 'Normal' : 'Low Flow'})</span>`;
  document.getElementById('val-waste').innerHTML = `${state.telemetry.waste}% <span class="sub-text">(Sorted & Compacting)</span>`;
  document.getElementById('val-energy').innerHTML = `${state.telemetry.energy} kW <span class="sub-text">(Eco Grid Live)</span>`;
  document.getElementById('val-incidents').innerHTML = `${state.telemetry.incidents} <span class="sub-text">Active Cases</span>`;
}

function updateGateBadge(gateId, value) {
  const box = document.getElementById(`metric-${gateId}`);
  const badge = box.querySelector('.metric-badge');
  const progressFill = box.querySelector('.progress-bar-fill');

  badge.className = "metric-badge";
  progressFill.className = "progress-bar-fill";

  if (value < 10) {
    badge.innerText = "Light";
    badge.classList.add('success');
    progressFill.classList.add('bg-success');
  } else if (value <= 20) {
    badge.innerText = "Busy";
    badge.classList.add('warning');
    progressFill.classList.add('bg-warning');
  } else {
    badge.innerText = "Heavy";
    badge.classList.add('danger');
    progressFill.classList.add('bg-danger');
  }
}

// Append logs in Operations Control
function addOpsLog(msg, type = 'system') {
  const feed = document.getElementById('ops-logs-feed');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const time = new Date().toTimeString().substring(0, 5);
  entry.innerHTML = `<span class="log-time">${time}</span><span class="log-msg">${msg}</span>`;
  
  feed.appendChild(entry);
  feed.scrollTop = feed.scrollHeight;
}

// Trigger simulation cards
function triggerSimulation(type) {
  document.querySelectorAll('.sim-btn').forEach(btn => btn.classList.remove('active'));
  state.activeSimulation = type;

  const recContainer = document.getElementById('ai-rec-container');
  const statusIndicator = document.getElementById('system-status-indicator');
  const evacGroup = document.getElementById('evacuation-vectors');

  // Hide emergency evac routes initially
  evacGroup.style.display = "none";
  document.getElementById('live-indicator-wrapper').className = "ticker-item live-indicator";
  document.getElementById('ticker-occupancy').innerText = "81,300 (98%)";

  if (type === 'reset') {
    state.telemetry = {
      gateA: 4,
      gateB: 12,
      gateC: 15,
      gateD: 6,
      water: 58,
      waste: 35,
      energy: 310,
      incidents: 0
    };
    state.activeSimulation = null;
    state.sentimentScore = 84;
    recContainer.innerHTML = '';
    
    // Status Green
    statusIndicator.className = "system-status-pill green-pill";
    statusIndicator.innerHTML = '<span class="status-dot"></span> System Normal';
    
    // Map blocks reset
    document.querySelectorAll('.seat-block').forEach(b => {
      b.className = "seat-block block-green";
    });
    document.getElementById('block-120').className = "seat-block block-green";
    document.getElementById('block-114').className = "seat-block block-orange";
    
    // Hide paths
    document.getElementById('route-path').style.display = 'none';
    document.getElementById('seat-marker').style.display = 'none';

    addOpsLog("🔄 Operations simulator reset. Telemetry baseline restored.", "system");
    updateTelemetryUI();
    fluctuateSentiment();
    return;
  }

  // Apply visual button state
  document.getElementById(`sim-${type}`).classList.add('active');

  if (type === 'rain') {
    state.telemetry.energy = 45;
    state.telemetry.gateC = 35;
    state.telemetry.gateB = 22;
    state.telemetry.water = 52;
    state.sentimentScore = 71;

    statusIndicator.className = "system-status-pill yellow-pill";
    statusIndicator.innerHTML = '<span class="status-dot"></span> Weather Caution';

    addOpsLog("🌧️ Weather Sensor: Rain detected (0.24 inches/hr). Grid solar output reduced.", "warning");

    recContainer.innerHTML = `
      <div class="ai-rec-card warning-card">
        <div class="rec-icon"><i class="fa-solid fa-cloud-showers-heavy"></i></div>
        <div class="rec-content">
          <h6>🌧️ Weather Adaptation Plan</h6>
          <p>Solar generation is compromised. StadiumPulse AI recommends enabling regional smart lighting controls and activating corridor drainage pumps. Redirect Gate C lines to covered Gate D.</p>
          <div class="rec-actions">
            <button class="rec-btn approve" onclick="executeOpsAction('drainage')">Activate Pumps</button>
            <button class="rec-btn" onclick="executeOpsAction('dim_concourse')">Dim Non-critical Lights</button>
          </div>
        </div>
      </div>
    `;
  } 
  else if (type === 'metro') {
    state.telemetry.gateD = 28;
    state.sentimentScore = 64;
    statusIndicator.className = "system-status-pill yellow-pill";
    statusIndicator.innerHTML = '<span class="status-dot"></span> Transport Advisory';

    addOpsLog("🚉 Transit Alert: NJ Transit Train line reporting 25-minute delay due to switches.", "warning");
    document.getElementById('block-104').className = "seat-block block-red";

    recContainer.innerHTML = `
      <div class="ai-rec-card warning-card">
        <div class="rec-icon"><i class="fa-solid fa-train"></i></div>
        <div class="rec-content">
          <h6>🚉 Transit hold compensation</h6>
          <p>GenAI recommends notifying fans on their devices to remain in concourse areas to avoid crowding station platforms. 15% discount vouchers released for concessions post-match.</p>
          <div class="rec-actions">
            <button class="rec-btn approve" onclick="executeOpsAction('extend_concessions')">Extend Concessions</button>
            <button class="rec-btn" onclick="executeOpsAction('send_push')">Send Push Alerts</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (type === 'surge') {
    state.telemetry.gateC = 42;
    state.telemetry.incidents = 1;
    state.sentimentScore = 58;
    statusIndicator.className = "system-status-pill red-pill";
    statusIndicator.innerHTML = '<span class="status-dot"></span> Crowd Congestion Alert';

    addOpsLog("⚠️ Sensors: Heavy crowd surge at Sector 120 / Gate C. Local capacity threshold exceeded.", "danger");
    document.getElementById('block-120').className = "seat-block selected block-red";

    recContainer.innerHTML = `
      <div class="ai-rec-card danger-card">
        <div class="rec-icon"><i class="fa-solid fa-users-viewfinder"></i></div>
        <div class="rec-content">
          <h6>🚨 Crowd Surge Dispatch Program</h6>
          <p>Volunteers and security should immediately be deployed to Gate C to open secondary emergency lanes. Direct flow of Section 120 toward exit portals at Gate B.</p>
          <div class="rec-actions">
            <button class="rec-btn approve" onclick="executeOpsAction('dispatch_crowd')">Dispatch Crowd Team</button>
            <button class="rec-btn" onclick="executeOpsAction('gate_override')">Open Aux lanes</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (type === 'power') {
    state.telemetry.energy = 0;
    state.telemetry.water = 24;
    state.sentimentScore = 69;
    statusIndicator.className = "system-status-pill red-pill";
    statusIndicator.innerHTML = '<span class="status-dot"></span> Power Substation Failure';

    addOpsLog("🔌 Electrical Substation: Main power supply breaker tripped. Primary transformer dead.", "danger");

    recContainer.innerHTML = `
      <div class="ai-rec-card danger-card">
        <div class="rec-icon"><i class="fa-solid fa-bolt-lightning"></i></div>
        <div class="rec-content">
          <h6>⚡ Power Grid Recovery Sequence</h6>
          <p>Substation down. Gemini AI suggests starting auxiliary generator bank and switching emergency lighting to low-draw. Sanitary systems bypass active.</p>
          <div class="rec-actions">
            <button class="rec-btn approve" onclick="executeOpsAction('activate_gen')">Start Generators</button>
            <button class="rec-btn" onclick="executeOpsAction('override_pumps')">Bypass Pumps</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (type === 'evac') {
    // CRITICAL EMERGENCIES
    state.telemetry.gateA = 48; // crowds fleeing
    state.telemetry.gateB = 52;
    state.telemetry.gateC = 55;
    state.telemetry.gateD = 45;
    state.telemetry.water = 20;
    state.telemetry.incidents = 4;
    state.sentimentScore = 18; // panic

    // UI Updates
    statusIndicator.className = "system-status-pill red-pill red-pill-critical";
    statusIndicator.innerHTML = '<span class="status-dot"></span> 🚨 EVACUATION MODE';
    document.getElementById('live-indicator-wrapper').className = "ticker-item live-indicator red-pill-critical";
    document.getElementById('ticker-occupancy').innerText = "EVACUATING";

    // Show blinking red/emergency arrows on SVG map
    evacGroup.style.display = "block";
    addOpsLog("🚨 EMERGENCY DISPATCH: Fire alarm sensor in Sector 120 triggered. Crowd evacuation route protocol live.", "danger");

    recContainer.innerHTML = `
      <div class="ai-rec-card danger-card">
        <div class="rec-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="rec-content">
          <h6>🚨 Crisis Action Plan Evacuation</h6>
          <p>GenAI recommends overriding all gate turnstiles to open emergency outward flow (Gate A, B, C, D). Flash stadium LED arrays. Broadcast audio evacuation guidance.</p>
          <div class="rec-actions">
            <button class="rec-btn approve" onclick="executeOpsAction('open_all_gates')">OPEN ALL EXIT GATES</button>
            <button class="rec-btn" onclick="executeOpsAction('broadcast_alarm')">Broadcast Alarm Voice</button>
          </div>
        </div>
      </div>
    `;
  }

  updateTelemetryUI();
  fluctuateSentiment();
}

// Action executor within AI cards
function executeOpsAction(actionId) {
  addOpsLog(`🤖 StadiumPulse AI executed automation response: [${actionId}]`, 'ai');
  
  if (actionId === 'drainage') {
    state.telemetry.water = 55;
    addOpsLog("✅ Concourse drainage pumps started. Water logging risk reduced.", "system");
  } 
  else if (actionId === 'dim_concourse') {
    state.telemetry.energy += 30;
    addOpsLog("✅ Concourse lighting dimmed by 20% in non-critical zones. Battery load reduced.", "system");
  } 
  else if (actionId === 'extend_concessions') {
    addOpsLog("✅ Dynamic stadium screens displaying post-match taco discount coupons to balance metro load.", "system");
  } 
  else if (actionId === 'dispatch_crowd') {
    state.telemetry.incidents = 0;
    state.telemetry.gateC = 22;
    addOpsLog("✅ Crowd Ambassadors dispatched to Sector 120. Rerouting queue to Gate B.", "system");
  } 
  else if (actionId === 'gate_override') {
    state.telemetry.gateC = 12;
    addOpsLog("✅ Auxiliary ticket lanes opened. Entry flow speed up 40%.", "system");
  }
  else if (actionId === 'activate_gen') {
    state.telemetry.energy = 210;
    state.telemetry.water = 45;
    addOpsLog("✅ Emergency generator banks started. Vital systems powered up.", "system");
  }
  else if (actionId === 'reroute_d') {
    state.telemetry.gateC = 14;
    state.telemetry.gateD = 18;
    addOpsLog("✅ Digital street signs and Fan Portal routing updated. Traffic balanced.", "system");
  }
  else if (actionId === 'open_all_gates') {
    state.telemetry.gateA = 12;
    state.telemetry.gateB = 14;
    state.telemetry.gateC = 15;
    state.telemetry.gateD = 10;
    addOpsLog("✅ Emergency command sent. All exits opened outwards. Crowd exiting at 3x standard rate.", "danger");
  }
  else if (actionId === 'broadcast_alarm') {
    addOpsLog("📢 Broadcast audio triggered: 'Attention, please proceed to your nearest exit Gate immediately.'", "danger");
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Emergency warning. Please exit the stadium calmly via the nearest gates.");
      window.speechSynthesis.speak(utterance);
    }
  }

  // Clear that card
  const container = document.getElementById('ai-rec-container');
  container.innerHTML = `<div class="ai-rec-card info-card">
    <div class="rec-icon"><i class="fa-solid fa-check-circle"></i></div>
    <div class="rec-content">
      <h6>Action Approved & Done</h6>
      <p>System metrics stabilized successfully following AI recommendation.</p>
    </div>
  </div>`;

  updateTelemetryUI();
}

// ==============================================
// NATURAL LANGUAGE COMMAND CONSOLE PARSER (OPS)
// ==============================================

function handleOpsCommandKey(event) {
  if (event.key === 'Enter') {
    executeOpsCommand();
  }
}

function executeOpsCommand() {
  const inputElem = document.getElementById('ops-command-input');
  const rawCommand = inputElem.value.trim();
  if (!rawCommand) return;

  // Render prompt in logs
  addOpsLog(`Operator: "${rawCommand}"`, 'system');
  inputElem.value = '';

  const respBox = document.getElementById('ops-console-response');
  respBox.style.display = 'block';
  respBox.innerHTML = `<em>Processing Command...</em>`;

  // NLP simulated parser
  setTimeout(() => {
    let response = "";
    const cleanCmd = rawCommand.toLowerCase();

    if (cleanCmd.includes('status') || cleanCmd.includes('/status')) {
      response = `🟢 System Report:\n- Grid status: stable (${state.telemetry.energy}kW)\n- Gate queues: Gate A(${state.telemetry.gateA}m) Gate B(${state.telemetry.gateB}m) Gate C(${state.telemetry.gateC}m) Gate D(${state.telemetry.gateD}m)\n- Sanitary: Normal pressure`;
    } 
    else if (cleanCmd.includes('dispatch') || cleanCmd.includes('send crew') || cleanCmd.includes('security')) {
      let loc = "Gate C";
      if (cleanCmd.includes('gate a')) loc = "Gate A";
      if (cleanCmd.includes('gate b')) loc = "Gate B";
      if (cleanCmd.includes('gate c')) loc = "Gate C";
      if (cleanCmd.includes('gate d')) loc = "Gate D";
      if (cleanCmd.includes('120') || cleanCmd.includes('sector 120')) loc = "Sector 120";

      state.telemetry.incidents = Math.max(state.telemetry.incidents - 1, 0);
      response = `🤖 Dispatch Protocol:\nStadiumPulse AI has dispatched security crew and volunteers to [${loc}]. Dispatch coordinates sent to handheld terminals. System monitoring queue clearance.`;
      addOpsLog(`Dispatch dispatched to ${loc} successfully.`, 'ai');
    } 
    else if (cleanCmd.includes('eco') || cleanCmd.includes('sustainability') || cleanCmd.includes('optimization')) {
      state.telemetry.waste = Math.max(state.telemetry.waste - 8, 10);
      state.telemetry.energy = Math.min(state.telemetry.energy + 25, 400);
      response = `🌱 Eco-Optimization report generated:\nSolar array angle tracking adjusted for peak afternoon yield (+25kW). Bin compaction routine initiated at Zones 2 and 4. Compost diversion efficiency at 82%.`;
      addOpsLog(`Sustainability compaction sweeps completed.`, 'ai');
    } 
    else if (cleanCmd.includes('reroute') || cleanCmd.includes('balance')) {
      state.telemetry.gateC = 12;
      state.telemetry.gateB = 10;
      state.telemetry.gateA = 6;
      state.telemetry.gateD = 8;
      response = `📢 Dynamic Entry Routing:\nFan digital wayfinding updated. MetLife perimeter screens showing low-queue Gates (A & D) to disperse Gate B/C arrivals. Crowd flow model indicates uniform balance in 4 mins.`;
      addOpsLog(`Dynamic route balancing completed.`, 'ai');
    } 
    else if (cleanCmd.includes('evacuate') || cleanCmd.includes('emergency') || cleanCmd.includes('alarm')) {
      triggerSimulation('evac');
      response = `🚨 EMERGENCY EVACUATION PARSING SUCCESS:\nStadium evacuation routines initiated via Command Line command. Exits A-D opened. Warning broadcasts started.`;
    }
    else if (cleanCmd.includes('help') || cleanCmd.includes('/help') || cleanCmd.includes('command')) {
      response = `Available Command Syntaxes:\n- "status" - reports stadium telemetry metrics\n- "dispatch crew to [Gate/Sector]" - dispatches volunteers\n- "run eco optimization" - runs power conservation sweeps\n- "reroute gate flow" - balances stadium entrance queues\n- "evacuate stadium" - triggers emergency evacuation mode`;
    } 
    else {
      response = `🤖 StadiumPulse Copilot:\nAnalyzed: "${rawCommand}".\nGenAI confirms operations are running within safe parameters. No high priority threshold violations detected. Let me know if you need to dispatch security or trigger transit changes.`;
    }

    respBox.innerHTML = response.replace(/\n/g, '<br>');
    updateTelemetryUI();
  }, 700);
}
