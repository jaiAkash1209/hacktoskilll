/**
 * HackSkill Audio Speech Synthesis Engine
 * Interfaces with native browser SpeechSynthesis API
 */

export const SpeechEngine = {
  speak: (text, language = 'en', onStartCallback = null, onEndCallback = null) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel any current utterances
    window.speechSynthesis.cancel();

    // Clean text emojis for natural flow
    const cleanText = text.replace(/🗣️|🚻|🌮|🚇|♿|⚽|🤖|🔊|📄|🔍|🗺️|🐞|🔒|🔄|✅|⚠️|🔴|🟡|🟠/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Select Voice Locales
    if (language === 'es') {
      utterance.lang = 'es-ES';
    } else if (language === 'fr') {
      utterance.lang = 'fr-FR';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    utterance.onstart = () => {
      if (onStartCallback) onStartCallback();
    };

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
