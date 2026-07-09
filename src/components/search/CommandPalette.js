/**
 * HackSkill Command Palette Component (Ctrl+K)
 * Manages search shortcuts, modal hooks, and tab switching actions
 */

import { store } from '../../store/store.js';
import { ACTIONS } from '../../store/actions.js';

export const CommandPalette = {
  init: () => {
    // Append modal overlay to HTML if not present
    let overlay = document.getElementById('palette-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'palette-overlay';
      overlay.className = 'palette-overlay';
      overlay.innerHTML = `
        <div class="palette-box">
          <div class="palette-input-row">
            <i class="fa-solid fa-magnifying-glass palette-search-icon"></i>
            <input type="text" id="palette-search-input" class="palette-input" placeholder="Type a command or search..." autocomplete="off">
          </div>
          <div class="palette-results" id="palette-results-list">
            <!-- Dynamic elements loaded here -->
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    // Keyboard hooks
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        CommandPalette.toggle();
      }
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        CommandPalette.close();
      }
    });

    // Input search handler
    const searchInput = document.getElementById('palette-search-input');
    searchInput.addEventListener('input', (e) => {
      CommandPalette.render(e.target.value);
    });

    // Default renders
    CommandPalette.render('');
  },

  toggle: () => {
    const overlay = document.getElementById('palette-overlay');
    if (overlay.classList.contains('active')) {
      CommandPalette.close();
    } else {
      CommandPalette.open();
    }
  },

  open: () => {
    const overlay = document.getElementById('palette-overlay');
    overlay.classList.add('active');
    
    // Clear search and focus
    const searchInput = document.getElementById('palette-search-input');
    searchInput.value = '';
    CommandPalette.render('');
    setTimeout(() => searchInput.focus(), 50);
  },

  close: () => {
    const overlay = document.getElementById('palette-overlay');
    overlay.classList.remove('active');
  },

  // Command items definitions
  getCommands: () => [
    { title: 'Dashboard Overview', desc: 'Jump to student stats and analytics', tab: 'overview', category: 'navigation' },
    { title: 'Coding Playground', desc: 'Code editor, review, and syntax checkers', tab: 'playground', category: 'navigation' },
    { title: 'Courses Hub', desc: 'Learn Javascript, node, and databases', tab: 'courses', category: 'navigation' },
    { title: 'AI Mentor Chat', desc: 'Ask questions or build study roadmaps', tab: 'mentor', category: 'navigation' },
    { title: 'Career Assistant', desc: 'AI Interview Coach and Resume Analyzer', tab: 'career', category: 'navigation' },
    { title: 'Leaderboards', desc: 'Compare XP standings with other developers', tab: 'leaderboard', category: 'navigation' },
    { title: 'Certificates & Goals', desc: 'Earned badges and certifications list', tab: 'certificates', category: 'navigation' },
    { title: 'Toggle Light/Dark Theme', desc: 'Switch visual styles', action: 'toggle_theme', category: 'settings' },
    { title: 'Trigger Evacuation Simulator', desc: 'Test system operations security alarms', action: 'evac', category: 'simulator' }
  ],

  render: (filterText) => {
    const query = filterText.toLowerCase().trim();
    const list = document.getElementById('palette-results-list');
    list.innerHTML = '';

    const filtered = CommandPalette.getCommands().filter(cmd => 
      cmd.title.toLowerCase().includes(query) || 
      cmd.desc.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      list.innerHTML = `<div class="palette-result-item" style="cursor:default;">No results found for "${filterText}"</div>`;
      return;
    }

    filtered.forEach(cmd => {
      const item = document.createElement('div');
      item.className = 'palette-result-item';
      item.innerHTML = `
        <div class="result-main">
          <i class="fa-solid ${CommandPalette.getIcon(cmd.category)}"></i>
          <div>
            <div style="color:var(--text-primary); font-size:0.9rem;">${cmd.title}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">${cmd.desc}</div>
          </div>
        </div>
        <span class="result-tag">${cmd.category.toUpperCase()}</span>
      `;

      item.onclick = () => {
        if (cmd.tab) {
          store.dispatch(ACTIONS.SWITCH_TAB, cmd.tab);
        } else if (cmd.action === 'toggle_theme') {
          store.dispatch(ACTIONS.SWITCH_THEME);
        } else if (cmd.action === 'evac') {
          store.dispatch(ACTIONS.TRIGGER_EVACUATION);
        }
        CommandPalette.close();
      };

      list.appendChild(item);
    });
  },

  getIcon: (category) => {
    switch (category) {
      case 'navigation': return 'fa-location-arrow';
      case 'settings': return 'fa-gear';
      case 'simulator': return 'fa-triangle-exclamation';
      default: return 'fa-circle-question';
    }
  }
};
