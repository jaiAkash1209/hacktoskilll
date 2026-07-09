/**
 * HackSkill Store Management System
 * Unidirectional State Store using Reactive Pub/Sub Pattern
 */

import { ACTIONS } from './actions.js';

// Default State baseline
const DEFAULT_STATE = {
  isLoggedIn: false,
  user: {
    name: 'Developer',
    streak: 5,
    xp: 2450,
    level: 3,
    theme: 'dark',
    completedChallenges: 12,
    certificates: []
  },
  activeTab: 'overview',
  activeCourse: null,
  toast: null,
  evacuationMode: false,
  concessionOrders: []
};

class Store {
  constructor() {
    this.state = this.loadFromStorage();
    this.subscribers = [];
  }

  loadFromStorage() {
    const cached = localStorage.getItem('hackskill_state');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached state:', e);
      }
    }
    return { ...DEFAULT_STATE };
  }

  saveToStorage() {
    localStorage.setItem('hackskill_state', JSON.stringify(this.state));
  }

  getState() {
    return { ...this.state };
  }

  // Subscribe callback function
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Dispatch actions unidirectional loop
  dispatch(actionType, payload = null) {
    console.log(`[Store Dispatch]: Action [${actionType}]`, payload);
    let stateChanged = false;

    switch (actionType) {
      case ACTIONS.LOGIN:
        this.state.isLoggedIn = true;
        this.state.user.name = payload || 'Developer';
        stateChanged = true;
        break;
        
      case ACTIONS.LOGOUT:
        this.state.isLoggedIn = false;
        this.state.activeTab = 'overview';
        stateChanged = true;
        break;

      case ACTIONS.SWITCH_TAB:
        this.state.activeTab = payload;
        stateChanged = true;
        break;

      case ACTIONS.SWITCH_THEME:
        this.state.user.theme = payload || (this.state.user.theme === 'dark' ? 'light' : 'dark');
        stateChanged = true;
        break;

      case ACTIONS.ADD_XP:
        this.state.user.xp += payload || 100;
        // Level up algorithm (1000 XP per level)
        this.state.user.level = Math.floor(this.state.user.xp / 1000) + 1;
        stateChanged = true;
        break;

      case ACTIONS.INCREMENT_STREAK:
        this.state.user.streak += 1;
        stateChanged = true;
        break;

      case ACTIONS.ADD_CERTIFICATE:
        if (!this.state.user.certificates.includes(payload)) {
          this.state.user.certificates.push(payload);
          stateChanged = true;
        }
        break;

      case ACTIONS.TRIGGER_EVACUATION:
        this.state.evacuationMode = payload !== null ? payload : !this.state.evacuationMode;
        stateChanged = true;
        break;

      case ACTIONS.PLACE_ORDER:
        this.state.concessionOrders.push(payload);
        stateChanged = true;
        break;

      default:
        console.warn(`[Store Warning]: Unhandled Action Type [${actionType}]`);
    }

    if (stateChanged) {
      this.saveToStorage();
      this.notifySubscribers();
    }
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

export const store = new Store();
