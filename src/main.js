/**
 * Guess the Animal – Main Application
 * Intelligent Expert System Game 🧠🐾
 *
 * Orchestrates UI rendering, game state, and wire-up between
 * the hybrid AI engine, knowledge base, and sound effects.
 */

import './style.css';
import HybridEngine from './modules/hybridEngine.js';
import knowledgeBase from './modules/knowledgeBase.js';
import sfx from './modules/soundEffects.js';

// ── State ──────────────────────────────────────────────
const state = {
  screen: 'welcome',       // welcome | question | result | learn | learnSuccess | dashboard
  engine: new HybridEngine(),
  currentQuestion: null,
  prediction: null,
  questionHistory: [],
  learnForm: { animalName: '', question: '', answer: true },
  soundEnabled: true,
};

// ── Helpers ────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const app = () => document.getElementById('app');

function showToast(message, icon = '✨') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function formatConfidence(val) {
  return `${Math.round(val * 100)}%`;
}

function getConfidenceLevel(val) {
  if (val >= 0.7) return 'high';
  if (val >= 0.4) return 'medium';
  return 'low';
}

function getMethodLabel(method) {
  const labels = {
    hybrid_consensus: '🔗 Hybrid Consensus (Expert + ML agree)',
    hybrid_expert: '📋 Expert System led',
    hybrid_ml: '🤖 ML Model led',
    ml_only: '🤖 ML Prediction only',
    expert_only: '📋 Expert System only',
    consensus: '🔗 Consensus',
    decision_tree: '🌳 Decision Tree',
    distance: '📐 Distance-Based',
    none: '❓ No prediction',
  };
  return labels[method] || method;
}

// ── Particles ──────────────────────────────────────────
function createParticles() {
  const container = document.createElement('div');
  container.className = 'particles';
  const colors = ['rgba(99,102,241,0.25)', 'rgba(168,85,247,0.2)', 'rgba(236,72,153,0.15)', 'rgba(34,211,238,0.15)'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 12}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
  document.body.appendChild(container);
}

// ── Render Router ──────────────────────────────────────
function render() {
  switch (state.screen) {
    case 'welcome': renderWelcome(); break;
    case 'question': renderQuestion(); break;
    case 'result': renderResult(); break;
    case 'learn': renderLearn(); break;
    case 'learnSuccess': renderLearnSuccess(); break;
    case 'dashboard': renderDashboard(); break;
    default: renderWelcome();
  }
}

// ── Welcome Screen ─────────────────────────────────────
function renderWelcome() {
  const stats = knowledgeBase.getStats();
  const animalCount = knowledgeBase.getAnimals().length;
  const accuracy = stats.gamesPlayed > 0 ? Math.round((stats.correctGuesses / stats.gamesPlayed) * 100) : 0;

  app().innerHTML = `
    <div class="screen welcome" id="welcome-screen">
      <div class="welcome-logo">🧠</div>
      <h1 class="welcome-title">Guess the Animal</h1>
      <p class="welcome-subtitle">
        Think of any animal and I'll try to guess it using 
        <strong>AI reasoning</strong>, <strong>machine learning</strong>, 
        and a <strong>self-learning knowledge base</strong>.
      </p>

      <div class="welcome-features">
        <div class="welcome-feature">
          <div class="welcome-feature-icon">📋</div>
          <div class="welcome-feature-label">Expert System<br/>Rule-based AI</div>
        </div>
        <div class="welcome-feature">
          <div class="welcome-feature-icon">🤖</div>
          <div class="welcome-feature-label">ML Model<br/>Decision Tree</div>
        </div>
        <div class="welcome-feature">
          <div class="welcome-feature-icon">🧬</div>
          <div class="welcome-feature-label">Self-Learning<br/>Grows over time</div>
        </div>
      </div>

      ${stats.gamesPlayed > 0 ? `
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">${stats.gamesPlayed}</div>
            <div class="stat-label">Games Played</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${accuracy}%</div>
            <div class="stat-label">Accuracy</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${animalCount}</div>
            <div class="stat-label">Animals Known</div>
          </div>
        </div>
      ` : ''}

      <button class="btn btn-primary btn-lg" id="btn-start">
        🎮 Start Game
      </button>

      <div style="display:flex; gap:12px; margin-top:8px;">
        <button class="btn btn-ghost btn-sm" id="btn-dashboard">📊 Dashboard</button>
        <button class="btn btn-ghost btn-sm" id="btn-sound">
          ${state.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-dashboard').addEventListener('click', () => {
    sfx.play('click');
    sfx.playBackground(); // Ensure music plays on interaction
    state.screen = 'dashboard';
    render();
  });
  document.getElementById('btn-sound').addEventListener('click', () => {
    state.soundEnabled = sfx.toggle();
    sfx.play('click');
    render();
  });
}

// ── Start Game ─────────────────────────────────────────
function startGame() {
  sfx.play('start');
  sfx.playBackground(); // Ensure music starts
  state.currentQuestion = state.engine.startGame();
  state.questionHistory = [];
  state.screen = 'question';
  render();
}

// ── Question Screen ────────────────────────────────────
function renderQuestion() {
  const q = state.currentQuestion;
  if (!q) {
    // No more questions, go to result
    state.prediction = state.engine.getFinalPrediction();
    sfx.play('reveal');
    state.screen = 'result';
    render();
    return;
  }

  const progress = (q.questionNumber / q.totalQuestions) * 100;
  const questionEmojis = ['🤔', '🧐', '💭', '🔍', '🧠', '💡', '🎯', '📡', '⚡', '🔮'];
  const qEmoji = questionEmojis[(q.questionNumber - 1) % questionEmojis.length];

  app().innerHTML = `
    <div class="header-bar">
      <div class="header-brand" id="btn-home">🧠 Guess the Animal</div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" id="btn-restart" title="Restart">🔄 Restart</button>
      </div>
    </div>

    <div class="screen question-screen" id="question-screen">
      <div class="progress-container">
        <div class="progress-label">
          <span>Question ${q.questionNumber} of ${q.totalQuestions}</span>
          <span>${formatConfidence(progress / 100)} complete</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="card question-card">
        <div class="question-number">
          <span>⚡</span> Question ${q.questionNumber}
        </div>
        <div class="question-emoji">${qEmoji}</div>
        <h2 class="question-text">${q.question}</h2>
        <div class="answer-buttons">
          <button class="btn btn-success" id="btn-yes">✅ Yes</button>
          <button class="btn btn-danger" id="btn-no">❌ No</button>
        </div>
        <div class="thinking-indicator">
          <div class="thinking-dots">
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
          </div>
          <span>AI is analyzing...</span>
        </div>
      </div>

      ${state.questionHistory.length > 0 ? `
        <div class="answer-history">
          <div class="answer-history-title">Your answers so far</div>
          <div class="answer-chips">
            ${state.questionHistory.map(h => `
              <span class="answer-chip ${h.answer === 1 ? 'yes' : 'no'}">
                ${h.answer === 1 ? '✓' : '✗'} ${h.shortQuestion}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('btn-yes').addEventListener('click', () => answerQuestion(1));
  document.getElementById('btn-no').addEventListener('click', () => answerQuestion(0));
  document.getElementById('btn-restart').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
  document.getElementById('btn-home').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
}

// ── Answer a Question ──────────────────────────────────
function answerQuestion(answer) {
  sfx.play(answer === 1 ? 'yes' : 'no');

  const q = state.currentQuestion;
  state.questionHistory.push({
    featureId: q.featureId,
    question: q.question,
    shortQuestion: q.question.replace(/^(Does it |Is it |Can it |Has it |Does it have |Is it a |Can it be )/i, '').replace(/\?$/, ''),
    answer,
  });

  const result = state.engine.answerQuestion(q.featureId, answer);

  if (result.done) {
    state.prediction = result.prediction;
    sfx.play('reveal');
    state.screen = 'result';
  } else {
    state.currentQuestion = result.nextQuestion;
  }

  render();
}

// ── Result Screen ──────────────────────────────────────
function renderResult() {
  const pred = state.prediction;
  if (!pred || !pred.animal) {
    // No prediction possible
    app().innerHTML = `
      <div class="header-bar">
        <div class="header-brand" id="btn-home">🧠 Guess the Animal</div>
      </div>
      <div class="screen result-screen">
        <div class="card result-card">
          <div class="result-emoji">🤷</div>
          <div class="result-text">Hmm, I couldn't figure it out...</div>
          <p class="result-animal" style="-webkit-text-fill-color: var(--text-secondary); font-size: 1.2rem;">
            I don't have enough information to guess.
          </p>
          <div class="result-actions">
            <button class="btn btn-primary" id="btn-teach">🧬 Teach Me</button>
            <button class="btn btn-ghost" id="btn-play-again">🔄 Play Again</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btn-teach').addEventListener('click', () => {
      state.screen = 'learn';
      render();
    });
    document.getElementById('btn-play-again').addEventListener('click', () => {
      state.screen = 'welcome';
      render();
    });
    document.getElementById('btn-home').addEventListener('click', () => {
      sfx.play('click');
      state.screen = 'welcome';
      render();
    });
    return;
  }

  const confLevel = getConfidenceLevel(pred.confidence);

  app().innerHTML = `
    <div class="header-bar">
      <div class="header-brand" id="btn-home">🧠 Guess the Animal</div>
    </div>
    <div class="screen result-screen" id="result-screen">
      <div class="result-label">My Prediction</div>

      <div class="card result-card">
        <div class="result-emoji">${pred.animal.emoji}</div>
        <div class="result-text">I think you're thinking of...</div>
        <h2 class="result-animal">${pred.animal.name}</h2>

        <div class="confidence-badge">
          <span class="confidence-dot ${confLevel}"></span>
          <span>${formatConfidence(pred.confidence)} confident</span>
        </div>

        <div class="method-badge">${getMethodLabel(pred.method)}</div>

        <div class="confidence-meter">
          <div class="confidence-meter-bar">
            <div class="confidence-meter-fill ${confLevel}" style="width: ${pred.confidence * 100}%"></div>
          </div>
        </div>

        ${pred.alternatives && pred.alternatives.length > 0 ? `
          <div class="alternatives-section">
            <div class="alternatives-title">Other possibilities</div>
            <div class="alternatives-list">
              ${pred.alternatives.map(a => `
                <div class="alternative-item">
                  <span class="alternative-emoji">${a.emoji}</span>
                  <span>${a.name}</span>
                  <span class="alternative-confidence">${formatConfidence(a.confidence)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div style="font-size: 1rem; color: var(--text-secondary); text-align: center;">
        Was I correct?
      </div>

      <div class="result-actions">
        <button class="btn btn-success btn-lg" id="btn-correct">✅ Correct!</button>
        <button class="btn btn-danger btn-lg" id="btn-wrong">❌ Wrong</button>
      </div>

      <button class="btn btn-ghost btn-sm" id="btn-play-again" style="margin-top:4px;">
        🔄 Play Again
      </button>
    </div>
  `;

  document.getElementById('btn-correct').addEventListener('click', () => {
    sfx.play('correct');
    knowledgeBase.recordGame(true, pred.animal.name);
    showToast(`I knew it was a ${pred.animal.name}! ${pred.animal.emoji}`, '🎉');
    state.screen = 'welcome';
    render();
  });
  document.getElementById('btn-wrong').addEventListener('click', () => {
    sfx.play('wrong');
    knowledgeBase.recordGame(false, pred.animal.name);
    state.learnForm = { animalName: '', question: '', answer: true };
    state.screen = 'learn';
    render();
  });
  document.getElementById('btn-play-again').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
  document.getElementById('btn-home').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
}

// ── Learn Screen ───────────────────────────────────────
function renderLearn() {
  app().innerHTML = `
    <div class="header-bar">
      <div class="header-brand" id="btn-home">🧠 Guess the Animal</div>
    </div>
    <div class="screen learn-screen" id="learn-screen">
      <div class="card learn-card">
        <div class="learn-icon">🧬</div>
        <h2 class="learn-title">Help Me Learn!</h2>
        <p class="learn-subtitle">
          I got it wrong, but I can learn from my mistakes. 
          Tell me about the animal you were thinking of.
        </p>

        <div class="form-group">
          <label class="form-label" for="animal-name">What animal were you thinking of?</label>
          <input 
            type="text" 
            class="form-input" 
            id="animal-name" 
            placeholder="e.g., Parrot, Hamster, Whale..." 
            value="${state.learnForm.animalName}"
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="distinguish-question">
            Give me a Yes/No question that would help identify this animal:
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="distinguish-question" 
            placeholder="e.g., Can it talk or mimic sounds?" 
            value="${state.learnForm.question}"
            autocomplete="off"
          />
          <div class="form-hint">
            This question should distinguish your animal from others.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            What's the answer to this question for your animal?
          </label>
          <div class="radio-group">
            <div class="radio-option ${state.learnForm.answer ? 'selected' : ''}" id="radio-yes">
              ✅ Yes
            </div>
            <div class="radio-option ${!state.learnForm.answer ? 'selected' : ''}" id="radio-no">
              ❌ No
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-primary" id="btn-submit-learn" style="flex:1;">
            🧬 Teach the AI
          </button>
          <button class="btn btn-ghost" id="btn-skip-learn">
            Skip
          </button>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('animal-name').addEventListener('input', (e) => {
    state.learnForm.animalName = e.target.value;
  });
  document.getElementById('distinguish-question').addEventListener('input', (e) => {
    state.learnForm.question = e.target.value;
  });
  document.getElementById('radio-yes').addEventListener('click', () => {
    state.learnForm.answer = true;
    render();
  });
  document.getElementById('radio-no').addEventListener('click', () => {
    state.learnForm.answer = false;
    render();
  });
  document.getElementById('btn-submit-learn').addEventListener('click', submitLearn);
  document.getElementById('btn-skip-learn').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
  document.getElementById('btn-home').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });

  // Focus the first input
  setTimeout(() => document.getElementById('animal-name')?.focus(), 100);
}

function submitLearn() {
  const { animalName, question, answer } = state.learnForm;

  if (!animalName.trim()) {
    showToast('Please enter the animal name', '⚠️');
    document.getElementById('animal-name')?.focus();
    return;
  }

  if (!question.trim()) {
    showToast('Please provide a distinguishing question', '⚠️');
    document.getElementById('distinguish-question')?.focus();
    return;
  }

  // Teach the engine
  state.engine.learn(animalName.trim(), question.trim(), answer);
  sfx.play('learn');
  state.screen = 'learnSuccess';
  render();
}

// ── Learn Success Screen ───────────────────────────────
function renderLearnSuccess() {
  const name = state.learnForm.animalName.trim();

  app().innerHTML = `
    <div class="header-bar">
      <div class="header-brand" id="btn-home">🧠 Guess the Animal</div>
    </div>
    <div class="screen learn-screen" id="learn-success-screen">
      <div class="card learn-card">
        <div class="learn-success">
          <div class="learn-success-icon">🎓</div>
          <h2 class="learn-success-text">Thank you for teaching me!</h2>
          <p class="learn-success-sub">
            I've learned about <strong>${name}</strong> and added it to my knowledge base. 
            Next time, I'll be smarter!
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-play-again">🎮 Play Again</button>
            <button class="btn btn-ghost" id="btn-go-home">🏠 Home</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-play-again').addEventListener('click', () => {
    sfx.play('click');
    startGame();
  });
  document.getElementById('btn-go-home').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
  document.getElementById('btn-home').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
}

// ── Dashboard Screen ───────────────────────────────────
function renderDashboard() {
  const stats = knowledgeBase.getStats();
  const animals = knowledgeBase.getAnimals();
  const topGuessed = knowledgeBase.getTopGuessed(5);
  const accuracy = stats.gamesPlayed > 0 ? Math.round((stats.correctGuesses / stats.gamesPlayed) * 100) : 0;
  const maxCount = topGuessed.length > 0 ? topGuessed[0].count : 1;

  app().innerHTML = `
    <div class="header-bar">
      <div class="header-brand" id="btn-home">🧠 Guess the Animal</div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" id="btn-back">← Back</button>
      </div>
    </div>
    <div class="screen dashboard" id="dashboard-screen">
      <h2 class="dashboard-title">📊 Dashboard</h2>
      <p class="dashboard-subtitle">System statistics and knowledge base overview</p>

      <div class="dashboard-grid">
        <div class="dashboard-stat">
          <div class="dashboard-stat-value">${stats.gamesPlayed}</div>
          <div class="dashboard-stat-label">Games Played</div>
        </div>
        <div class="dashboard-stat">
          <div class="dashboard-stat-value">${accuracy}%</div>
          <div class="dashboard-stat-label">Accuracy</div>
        </div>
        <div class="dashboard-stat">
          <div class="dashboard-stat-value">${animals.length}</div>
          <div class="dashboard-stat-label">Animals Known</div>
        </div>
        <div class="dashboard-stat">
          <div class="dashboard-stat-value">${stats.animalsLearned}</div>
          <div class="dashboard-stat-label">Animals Learned</div>
        </div>
      </div>

      ${topGuessed.length > 0 ? `
        <div class="top-guessed card" style="padding: 24px;">
          <div class="top-guessed-title">🏆 Most Guessed Animals</div>
          <div class="top-guessed-list">
            ${topGuessed.map((item, idx) => `
              <div class="top-guessed-item">
                <div class="top-guessed-rank">${idx + 1}</div>
                <div class="top-guessed-emoji">${item.emoji}</div>
                <div class="top-guessed-name">${item.name}</div>
                <div class="top-guessed-count">${item.count}×</div>
                <div class="top-guessed-bar">
                  <div class="top-guessed-bar-fill" style="width: ${(item.count / maxCount) * 100}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="card" style="padding: 24px; width: 100%;">
        <div class="top-guessed-title" style="margin-bottom: 16px;">🐾 All Known Animals (${animals.length})</div>
        <div class="animals-grid">
          ${animals.map(a => `
            <div class="animal-badge" title="${a.name}">
              <div class="animal-badge-emoji">${a.emoji}</div>
              <div class="animal-badge-name">${a.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card" style="padding: 16px; width: 100%; font-size: 0.8rem; color: var(--text-muted); text-align: center;">
        <p>🎵 <strong>Background Music:</strong> "The Forest and the Trees" by Kevin MacLeod</p>
        <p>Licensed under CC BY 4.0</p>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
        <button class="btn btn-primary" id="btn-start-from-dash">🎮 Play Game</button>
        <button class="btn btn-ghost btn-sm" id="btn-export">📥 Export Data</button>
        <button class="btn btn-ghost btn-sm" id="btn-reset" style="color: var(--danger);">🗑️ Reset All</button>
      </div>
    </div>
  `;

  document.getElementById('btn-back').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
  document.getElementById('btn-home').addEventListener('click', () => {
    sfx.play('click');
    state.screen = 'welcome';
    render();
  });
  document.getElementById('btn-start-from-dash').addEventListener('click', startGame);
  document.getElementById('btn-export').addEventListener('click', () => {
    const data = knowledgeBase.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animal_game_knowledge_base.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Knowledge base exported!', '📥');
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Are you sure? This will reset all learned animals and statistics.')) {
      knowledgeBase.reset();
      state.engine = new HybridEngine();
      showToast('Knowledge base reset to defaults', '🗑️');
      render();
    }
  });
}

// ── Keyboard Shortcuts ─────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (state.screen === 'question') {
    if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      answerQuestion(1);
    } else if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      answerQuestion(0);
    }
  }
  if (e.key === 'Escape') {
    state.screen = 'welcome';
    render();
  }
});

// ── Voice Input (Optional) ─────────────────────────────
function initVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    if (state.screen === 'question') {
      if (transcript.includes('yes')) {
        answerQuestion(1);
      } else if (transcript.includes('no')) {
        answerQuestion(0);
      }
    }
  };

  // Start listening when in question mode (user can activate via microphone)
  window._speechRecognition = recognition;
}

// ── Initialize ─────────────────────────────────────────
function init() {
  createParticles();
  initVoiceInput();
  sfx.enableAutoplayOnFirstInteraction(); // Start bg music on first user interaction
  render();
}

init();
