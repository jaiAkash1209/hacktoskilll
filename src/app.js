/**
 * HackSkill Application Bootstrap & Controller Router Coordinator
 */

import { store } from './store/store.js';
import { ACTIONS } from './store/actions.js';
import { AIClient } from './services/AIClient.js';
import { SpeechEngine } from './services/SpeechEngine.js';
import { CommandPalette } from './components/search/CommandPalette.js';

// Global ChartJS reference
let studentCommitsChart = null;

// Initialize app when window loads
window.addEventListener('DOMContentLoaded', () => {
  // PWA Service Worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA]: Service Worker registered successfully', reg.scope))
      .catch(err => console.error('[PWA]: Service Worker registration failed:', err));
  }

  // Boot Command Palette Ctrl+K spotlight
  CommandPalette.init();

  // Load baseline statistics charts
  initializeStudentCommitsChart();

  // Load leaderboard table data
  renderLeaderboardRows();

  // Render Certificates initially
  renderCertificatesGrid();

  // Initialize Accordion (FAQ) click bindings
  bindFAQAccordions();

  // Load user details theme preference
  applyCurrentTheme();

  // Subscribe state store changes to drive UI view updates
  store.subscribe((state) => {
    updateWorkspaceUI(state);
  });

  // Initial UI refresh
  updateWorkspaceUI(store.getState());
});

// Switch visual themes
window.toggleTheme = function() {
  const current = store.getState().user.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  store.dispatch(ACTIONS.SWITCH_THEME, next);
  applyCurrentTheme();
  showToastNotification(`Theme switched to ${next.toUpperCase()} mode.`, 'success');
};

function applyCurrentTheme() {
  const theme = store.getState().user.theme;
  document.documentElement.className = `theme-${theme}`;
  
  // Icon update
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
}

// Student OS View router switcher
window.switchDashboardTab = function(tabId) {
  store.dispatch(ACTIONS.SWITCH_TAB, tabId);
};

// Handle visual changes matching central store state
function updateWorkspaceUI(state) {
  // Page Title Update
  const title = document.getElementById('workspace-title');
  if (title) {
    title.innerText = getPageTitle(state.activeTab);
  }

  // Toggles workspace view blocks
  document.querySelectorAll('.workspace-content').forEach(view => {
    view.classList.remove('active');
  });
  const activeView = document.getElementById(`view-${state.activeTab}`);
  if (activeView) activeView.classList.add('active');

  // Sidebar active menus
  document.querySelectorAll('.sidebar-panel .menu-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeMenu = document.getElementById(`menu-${state.activeTab}`);
  if (activeMenu) activeMenu.classList.add('active');

  // Auth visibility controls
  const btnLogin = document.getElementById('btn-header-login');
  const btnLogout = document.getElementById('btn-sidebar-logout');
  const streakWidget = document.getElementById('header-streak-widget');

  const displayName = state.isLoggedIn ? state.user.name : 'Guest Developer';

  // Dynamic welcome heading
  const welcome = document.getElementById('dashboard-welcome-heading');
  if (welcome) welcome.innerText = `Welcome back, ${displayName}`;

  // User Profile Metrics
  const nameLabel = document.getElementById('user-profile-name');
  if (nameLabel) nameLabel.innerText = displayName;

  const avatar = document.getElementById('user-avatar');
  if (avatar) avatar.innerText = displayName.charAt(0).toUpperCase();

  const xpVal = document.getElementById('user-xp');
  if (xpVal) xpVal.innerHTML = `${state.user.xp} <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">XP</span>`;

  const lvVal = document.getElementById('user-level');
  if (lvVal) lvVal.innerText = `Lv. ${state.user.level}`;

  const streakVal = document.getElementById('user-streak-txt');
  if (streakVal) streakVal.innerText = `${state.user.streak} Days`;
  
  const streakMetric = document.getElementById('user-streak-metric');
  if (streakMetric) streakMetric.innerText = `${state.user.streak} Days`;

  // XP progress bar width updates
  const bar = document.getElementById('user-level-bar');
  if (bar) {
    const relativeXp = state.user.xp % 1000;
    const pct = (relativeXp / 1000) * 100;
    bar.style.width = `${pct}%`;
  }

  if (state.isLoggedIn) {
    if (btnLogin) btnLogin.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'inline-flex';
    if (streakWidget) streakWidget.style.display = 'flex';
  } else {
    if (btnLogin) btnLogin.style.display = 'inline-flex';
    if (btnLogout) btnLogout.style.display = 'none';
    if (streakWidget) streakWidget.style.display = 'none';
  }

  // Alert mode handles
  if (state.evacuationMode) {
    const mainShell = document.getElementById('app-shell');
    if (mainShell) mainShell.style.boxShadow = "inset 0 0 100px rgba(239, 68, 68, 0.4)";
    showToastNotification('⚠️ Operations Evacuation Simulator activated. Exits routing vectors highlighted on smart maps.', 'danger');
  } else {
    const mainShell = document.getElementById('app-shell');
    if (mainShell) mainShell.style.boxShadow = "none";
  }
}

function getPageTitle(tabId) {
  switch (tabId) {
    case 'overview': return 'Overview Dashboard';
    case 'courses': return 'Syllabus Courses';
    case 'playground': return 'Coding Playground';
    case 'mentor': return 'AI Learning Companion';
    case 'career': return 'Career Assistant';
    case 'leaderboard': return 'Global Standings';
    case 'certificates': return 'Certifications & Badges';
    default: return 'HackSkill Workspace';
  }
}

// User dynamic action triggers
window.triggerLoginFlow = function() {
  const username = prompt("Enter your developer username to launch the SaaS client:") || "jaiAkash1209";
  store.dispatch(ACTIONS.LOGIN, username);

  // Set charts sizes
  setTimeout(() => {
    if (studentCommitsChart) {
      studentCommitsChart.resize();
    }
  }, 100);

  showToastNotification(`Welcome back, ${username}! Developer dashboard environment activated.`, 'success');
  addStudentActivityLog(`User session opened on SaaS terminal client`, 'system');
};

window.triggerLogout = function() {
  store.dispatch(ACTIONS.LOGOUT);
  showToastNotification('Developer dashboard logged-out successfully.', 'warning');
};

// Course enroll trigger
window.enrollInCourse = function(courseName, xpReward) {
  showToastNotification(`Enrolled in "${courseName}"! Course details loaded.`, 'success');
  addStudentActivityLog(`Enrolled in syllabus roadmap: ${courseName}`, 'system');

  // Add certificate to list after simulation course completion
  setTimeout(() => {
    store.dispatch(ACTIONS.ADD_XP, xpReward);
    store.dispatch(ACTIONS.ADD_CERTIFICATE, courseName);
    showToastNotification(`🎉 Congratulations! You have completed the course "${courseName}"! Received +${xpReward} XP and certificate.`, 'success');
    addStudentActivityLog(`Completed course paths: ${courseName} (+${xpReward} XP)`, 'ai');
    renderCertificatesGrid();
  }, 3500);
};

// Claim daily streak actions
window.claimDailyTarget = function(type) {
  const item = document.getElementById(`target-${type}`);
  if (item.classList.contains('completed')) return;

  const icon = document.getElementById(`target-${type}-icon`);
  icon.className = "fa-solid fa-circle-check";
  item.classList.add('completed');

  const xpReward = type === 'review' ? 50 : 30;
  store.dispatch(ACTIONS.ADD_XP, xpReward);
  showToastNotification(`Daily Target completed! Claimed +${xpReward} XP.`, 'success');
};

// ==============================================
// DEVELOPER SANDBOX PLAYGROUND ENGINE
// ==============================================

window.runPlaygroundCode = function() {
  const code = document.getElementById('playground-code-area').value;
  const consoleLog = document.getElementById('playground-console-logs');
  consoleLog.innerHTML = '';

  // Intercept standard console.log
  const logArray = [];
  const nativeLog = console.log;
  console.log = function(...args) {
    logArray.push(args.join(' '));
    nativeLog.apply(console, args);
  };

  try {
    // Run sandbox eval safely in context
    const sandboxFn = new Function(code);
    sandboxFn();

    console.log = nativeLog; // restore
    consoleLog.innerHTML = logArray.length > 0 
      ? logArray.map(line => `&gt;_ ${line}`).join('<br>')
      : `&gt;_ Script ran successfully. No outputs logged.`;
    consoleLog.style.color = "var(--color-success)";

    // Update state XP
    store.dispatch(ACTIONS.ADD_XP, 20);
    showToastNotification('Code compiled successfully! +20 XP awarded.', 'success');
    addStudentActivityLog('Executed Javascript script in compiler sandbox', 'system');
  } catch (error) {
    console.log = nativeLog; // restore
    consoleLog.innerHTML = `❌ Error: ${error.message}`;
    consoleLog.style.color = "var(--color-danger)";
    showToastNotification('Compiler Error: Check sandbox console logs.', 'danger');
  }
};

window.runAICodeReview = async function() {
  const code = document.getElementById('playground-code-area').value;
  const diag = document.getElementById('playground-diagnostic-res');
  diag.innerHTML = `<em>AI Code Reviewer analyzing workspace structure...</em>`;

  const report = await AIClient.getCodeReview(code);
  setTimeout(() => {
    diag.innerHTML = report.replace(/\n/g, '<br>');
    showToastNotification('AI Code Review completed successfully.', 'success');
    addStudentActivityLog('Requested AI Code Review on playground sandbox', 'ai');
    
    // Auto check daily target review
    const target = document.getElementById('target-review');
    if (target && !target.classList.contains('completed')) {
      claimDailyTarget('review');
    }
  }, 1000);
};

window.runAIBugFinder = async function() {
  const code = document.getElementById('playground-code-area').value;
  const diag = document.getElementById('playground-diagnostic-res');
  diag.innerHTML = `<em>AI Bug Finder scanning logical variables...</em>`;

  const report = await AIClient.getBugFinder(code);
  setTimeout(() => {
    diag.innerHTML = report.replace(/\n/g, '<br>');
    showToastNotification('AI Bug Finder compiler scan completed.', 'success');
    addStudentActivityLog('Triggered AI Bug Finder logic scanner', 'ai');
  }, 1000);
};

// ==============================================
// AI MENTOR AUDIO CHAT INTERFACE
// ==============================================

window.changeMentorLanguage = function() {
  const select = document.getElementById('mentor-lang-select');
  showToastNotification(`AI Mentor language updated to: ${select.value.toUpperCase()}`, 'success');
};

window.handleMentorChatKey = function(e) {
  if (e.key === 'Enter') {
    sendMentorChatMessage();
  }
};

window.sendMentorChatMessage = async function() {
  const input = document.getElementById('mentor-chat-input');
  const queryText = input.value.trim();
  if (!queryText) return;

  // Add user message bubble
  appendMentorChatBubble(queryText, 'user');
  input.value = '';

  // Get AI Response
  const select = document.getElementById('mentor-lang-select');
  const response = await AIClient.getMentorResponse(queryText, select.value);
  
  setTimeout(() => {
    appendMentorChatBubble(response.text, 'ai');
    
    // Update daily targets
    const target = document.getElementById('target-mentor');
    if (target && !target.classList.contains('completed')) {
      claimDailyTarget('mentor');
    }
  }, 600);
};

window.sendSuggestedMentorQuery = function(text) {
  const input = document.getElementById('mentor-chat-input');
  input.value = text;
  sendMentorChatMessage();
};

function appendMentorChatBubble(text, sender) {
  const feed = document.getElementById('mentor-chat-messages');
  const msg = document.createElement('div');
  msg.className = `message ${sender}-msg`;
  
  const uniqueId = `mentor-msg-${Math.floor(Math.random() * 100000)}`;

  if (sender === 'system') {
    msg.className = 'message system-msg';
    msg.innerHTML = `<p>${text}</p>`;
  } else {
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = sender === 'ai' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';

    const content = document.createElement('div');
    content.className = 'msg-content';

    let innerHTML = `<p id="${uniqueId}">${text}</p>`;
    if (sender === 'ai') {
      innerHTML += `<button class="audio-speak-btn" onclick="speakMentorResponse('${uniqueId}')"><i class="fa-solid fa-volume-high"></i> Listen to Copa</button>`;
    }
    content.innerHTML = innerHTML;

    msg.appendChild(avatar);
    msg.appendChild(content);
  }

  feed.appendChild(msg);
  feed.scrollTop = feed.scrollHeight;
}

// Trigger browser voice engine
window.speakMentorResponse = function(msgId) {
  const elem = document.getElementById(msgId);
  if (!elem) return;

  const text = elem.innerText.replace(/Copa AI Guide:|Copa AI Explanation:/g, '');
  const select = document.getElementById('mentor-lang-select');
  
  const waveform = document.getElementById('mentor-audio-waveform');

  SpeechEngine.speak(
    text,
    select.value,
    () => waveform.style.display = 'flex',
    () => waveform.style.display = 'none'
  );
};

window.speakMentorWelcome = function() {
  const text = document.getElementById('mentor-welcome-txt').innerText;
  const select = document.getElementById('mentor-lang-select');
  const waveform = document.getElementById('mentor-audio-waveform');

  SpeechEngine.speak(
    text,
    select.value,
    () => waveform.style.display = 'flex',
    () => waveform.style.display = 'none'
  );
};

window.stopSpeechEngine = function() {
  SpeechEngine.stop();
  document.getElementById('mentor-audio-waveform').style.display = 'none';
};

// ==============================================
// CAREER HUB SERVICES (RESUME & INTERVIEW COACH)
// ==============================================

window.toggleCareerSubTab = function(sub) {
  const btnResume = document.getElementById('career-tab-resume');
  const btnInterview = document.getElementById('career-tab-interview');
  
  const panelResume = document.getElementById('career-panel-resume');
  const panelInterview = document.getElementById('career-panel-interview');

  if (sub === 'resume') {
    btnResume.classList.add('active');
    btnInterview.classList.remove('active');
    panelResume.style.display = 'block';
    panelInterview.style.display = 'none';
  } else {
    btnResume.classList.remove('active');
    btnInterview.classList.add('active');
    panelResume.style.display = 'none';
    panelInterview.style.display = 'flex';
  }
};

window.auditDeveloperResume = async function() {
  const text = document.getElementById('resume-textarea').value;
  const panel = document.getElementById('career-panel-resume');
  
  panel.innerHTML = `<em>AI Resume analyzer auditing key skills profile...</em>`;
  const report = await AIClient.analyzeResume(text);
  
  setTimeout(() => {
    panel.innerHTML = report.replace(/\n/g, '<br>');
    showToastNotification('Resume audit completed successfully.', 'success');
    addStudentActivityLog('Audited developer profile resume via AI recruiter', 'ai');
  }, 1200);
};

// Interview Coach practice loop
let interviewTopic = 'javascript';
window.startInterviewCoach = async function() {
  const answerInput = document.getElementById('interview-answer-input');
  const btn = document.getElementById('interview-action-btn');
  const log = document.getElementById('interview-coach-log');

  if (btn.innerText.includes('Start')) {
    // Start session
    answerInput.style.display = 'block';
    answerInput.value = '';
    btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Submit Response`;
    
    log.innerHTML = `💼 **Senior Interviewer Question:**<br>What is the difference between let, const, and var in Javascript?`;
    showToastNotification('Interview coach session started.', 'success');
    addStudentActivityLog('Started AI Interview practice simulation', 'system');
  } else {
    // Submit response
    const answer = answerInput.value;
    log.innerHTML = `<em>Evaluating answer loops...</em>`;
    
    const feedback = await AIClient.getInterviewCoachResponse(answer, interviewTopic);
    setTimeout(() => {
      log.innerHTML = feedback.replace(/\n/g, '<br>');
      answerInput.value = '';
      showToastNotification('Interviewer response submitted.', 'success');
      addStudentActivityLog('Submitted interview answer to AI coach', 'ai');
    }, 1000);
  }
};

// ==============================================
// LANDING PAGE FAQ ACCORDION BINDINGS
// ==============================================

function bindFAQAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const isActive = item.classList.contains('active');
      
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ==============================================
// RENDERING WIDGET DATA FUNCTIONS
// ==============================================

function renderLeaderboardRows() {
  const tbody = document.getElementById('leaderboard-table-rows');
  if (!tbody) return;

  const ranks = [
    { rank: 1, name: 'Akash (jaiAkash1209)', level: 'Lv. 14', xp: '14,250 XP', class: 'rank-1' },
    { rank: 2, name: 'John Doe', level: 'Lv. 8', xp: '8,400 XP', class: 'rank-2' },
    { rank: 3, name: 'Sarah Smith', level: 'Lv. 5', xp: '5,200 XP', class: 'rank-3' },
    { rank: 4, name: 'Developer (You)', level: 'Lv. 3', xp: '2,450 XP', class: '' }
  ];

  tbody.innerHTML = '';
  ranks.forEach(row => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = "1px solid var(--border-color)";
    
    let rankHtml = `<span class="rank-badge ${row.class}">${row.rank}</span>`;
    if (!row.class) rankHtml = `<span style="padding-left:8px;">${row.rank}</span>`;

    tr.innerHTML = `
      <td style="padding:12px;">${rankHtml}</td>
      <td style="padding:12px; font-weight:700;">${row.name}</td>
      <td style="padding:12px;">${row.level}</td>
      <td style="padding:12px; font-weight:600;">${row.xp}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCertificatesGrid() {
  const container = document.getElementById('certificates-grid-container');
  const overviewGrid = document.getElementById('overview-certs-grid');
  
  const userCerts = store.getState().user.certificates;

  if (container) {
    container.innerHTML = '';
    if (userCerts.length === 0) {
      container.innerHTML = `<div class="glass-card" style="grid-column: 1 / -1; align-items:center; padding:var(--space-2); text-align:center;">
        <i class="fa-solid fa-award" style="font-size:1.5rem; color:var(--text-muted);"></i>
        <p style="color:var(--text-muted); font-size:0.8rem; margin-top:4px;">No certificates earned yet. Enroll and complete syllabus courses to earn credentials.</p>
      </div>`;
    } else {
      userCerts.forEach(cert => {
        const card = document.createElement('div');
        card.className = 'glass-card card-premium';
        card.style.borderLeftColor = 'var(--color-success)';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge-tag" style="background:rgba(16,185,129,0.15); border-color:var(--color-success); color:var(--color-success);">COMPLETED</span>
            <i class="fa-solid fa-certificate" style="color:var(--color-warning); font-size:1.1rem;"></i>
          </div>
          <h4 style="font-weight:700; margin-top:4px;">${cert} Certification</h4>
          <p style="font-size:0.7rem; color:var(--text-muted);">Authorized on ${new Date().toISOString().substring(0, 10)}</p>
          <button class="btn-outline" style="align-self:flex-start; margin-top:var(--space-1); padding:2px 8px; font-size:0.7rem; height:28px;" onclick="downloadCertMock('${cert}')"><i class="fa-solid fa-download"></i> Download PDF</button>
        `;
        container.appendChild(card);
      });
    }
  }

  if (overviewGrid) {
    overviewGrid.innerHTML = '';
    if (userCerts.length === 0) {
      overviewGrid.innerHTML = `<div style="grid-column: 1 / -1; font-size:0.75rem; color:var(--text-muted); padding:var(--space-1);">No certificates earned yet. Complete courses to verify learning milestones.</div>`;
    } else {
      userCerts.forEach(cert => {
        const item = document.createElement('div');
        item.style.cssText = 'background:var(--bg-app); border:1px solid var(--border-color); padding:8px var(--space-1); border-radius:6px; display:flex; justify-content:space-between; align-items:center;';
        item.innerHTML = `
          <div>
            <div style="font-size:0.75rem; font-weight:700;">${cert} Certificate</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">HackSkill authorized credentials</div>
          </div>
          <i class="fa-solid fa-certificate" style="color:var(--color-warning); font-size:1rem;"></i>
        `;
        overviewGrid.appendChild(item);
      });
    }
  }
}

window.downloadCertMock = function(name) {
  showToastNotification(`Download request for [${name} Certification] sent. Download triggered!`, 'success');
};

// Activity feed logs updater
function addStudentActivityLog(msg, type = 'system') {
  const feed = document.getElementById('student-activity-feed');
  if (!feed) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const time = new Date().toTimeString().substring(0, 5);
  entry.innerHTML = `<span class="log-time">${time}</span><span class="log-msg">${msg}</span>`;
  
  feed.appendChild(entry);
  feed.scrollTop = feed.scrollHeight;
}

// Chart.js stats initializer
function initializeStudentCommitsChart() {
  const chartCanvas = document.getElementById('student-commits-chart');
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');

  studentCommitsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Sandbox Commits',
        data: [4, 6, 2, 8, 5, 0, 3],
        backgroundColor: '#00f3ff',
        borderRadius: 4,
        barThickness: 16
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 9 } } },
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } }
      }
    }
  });
}

// Toast warnings dispatcher
function showToastNotification(msg, type = 'primary') {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'danger') icon = 'fa-circle-xmark';
  if (type === 'warning') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span class="toast-msg">${msg}</span>
  `;
  
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Quick sandbox compiler runner
window.runQuickSandbox = function() {
  const code = document.getElementById('quick-code-area').value;
  const consoleLog = document.getElementById('quick-console-logs');
  consoleLog.innerHTML = '';

  const logArray = [];
  const nativeLog = console.log;
  console.log = function(...args) {
    logArray.push(args.join(' '));
    nativeLog.apply(console, args);
  };

  try {
    const sandboxFn = new Function(code);
    sandboxFn();

    console.log = nativeLog;
    consoleLog.innerHTML = logArray.length > 0 
      ? logArray.map(line => `&gt;_ ${line}`).join('<br>')
      : `&gt;_ Script ran successfully. No outputs logged.`;
    consoleLog.style.color = "var(--color-success)";
    showToastNotification('Quick sandbox run completed.', 'success');
  } catch (error) {
    console.log = nativeLog;
    consoleLog.innerHTML = `❌ Error: ${error.message}`;
    consoleLog.style.color = "var(--color-danger)";
  }
};

// Mini Chatbot logic on overview page
window.sendMiniChatMessage = async function() {
  const input = document.getElementById('overview-mini-input');
  const queryText = input.value.trim();
  if (!queryText) return;

  const chatLog = document.getElementById('overview-mini-chat');
  chatLog.innerHTML += `<br><strong>You:</strong> ${queryText}`;
  input.value = '';

  const response = await AIClient.getMentorResponse(queryText, 'en');
  setTimeout(() => {
    chatLog.innerHTML += `<br>🤖 <strong>Copa AI:</strong> ${response.text}`;
    chatLog.scrollTop = chatLog.scrollHeight;
    
    // Auto check daily target review
    const target = document.getElementById('target-mentor');
    if (target && !target.classList.contains('completed')) {
      claimDailyTarget('mentor');
    }
  }, 500);
};

window.handleMiniChatKey = function(e) {
  if (e.key === 'Enter') {
    sendMiniChatMessage();
  }
};

// Global Notifications toast trigger
window.triggerNotificationToast = function() {
  showToastNotification('Console System: Weekly coding target resets in 3 days.', 'info');
};
