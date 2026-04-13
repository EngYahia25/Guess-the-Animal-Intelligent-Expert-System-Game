# 🧠🐾 Guess the Animal — Intelligent Expert System Game

An interactive AI-powered game that combines **Expert Systems**, **Machine Learning**, and a **Self-Learning Knowledge Base** to guess the animal you're thinking of.

> Built as a course project for **AI 405 – Intelligent Decision Support Systems**

---

## ✨ Features

- **Expert System** — Forward chaining rule-based reasoning with information-gain question selection
- **Machine Learning** — Decision Tree (ID3) + Distance-based (KNN) hybrid classifier
- **Hybrid Intelligence** — Combined scoring (55% Expert + 45% ML) with consensus boosting
- **Self-Learning** — Learns new animals and distinguishing questions from wrong guesses
- **20+ Animals** — Lion, Tiger, Elephant, Dog, Cat, Eagle, Penguin, Shark, Dolphin, Frog, Snake, Horse, Cow, Rabbit, Bear, Wolf, Monkey, Giraffe, Crocodile, Owl
- **20 Binary Features** — can_fly, lives_in_water, has_fur, is_carnivore, size_small, and more
- **Persistent Storage** — localStorage-based database that grows over time
- **Premium UI** — Dark glassmorphism design, animations, responsive layout
- **Sound Effects** — Procedural audio via Web Audio API
- **Keyboard Shortcuts** — Press Y/N during questions, Esc to return home
- **Voice Input** — Say "Yes" or "No" using Web Speech API
- **Dashboard** — Game stats, accuracy tracking, top guessed animals

---

## 🎮 How It Works

1. **Think** of any animal
2. **Answer** up to 10 Yes/No questions (AI picks the smartest question each time)
3. **See** the AI's prediction with confidence score
4. **Correct?** Great! **Wrong?** Teach the AI — it will remember for next time

---

## 🏗️ Architecture

```
┌─────────────────────┐
│    User Interface    │
│  (Welcome → Q&A →   │
│  Result → Learning)  │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │Hybrid Engine │ ← Combines both approaches
    └──┬───────┬──┘
       │       │
 ┌─────▼───┐ ┌▼─────────┐
 │  Expert  │ │ ML Model │
 │  System  │ │ (ID3 +   │
 │ (Rules + │ │  KNN)    │
 │ Fwd Chain│ │          │
 └────┬─────┘ └──┬───────┘
      │           │
   ┌──▼───────────▼──┐
   │  Knowledge Base  │
   │ (Animals, Rules, │
   │  Features, Stats)│
   └──────┬───────────┘
          │
   ┌──────▼──────┐
   │ localStorage │
   └─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/EngYahia25/Guess-the-Animal-Intelligent-Expert-System-Game.git
cd Guess-the-Animal-Intelligent-Expert-System-Game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Production Build

```bash
npm run build
# Output in dist/ — deploy to any static hosting
```

---

## 📁 Project Structure

```
Project_AI405/
├── index.html                  # Entry point
├── package.json
├── vite.config.js              # Vite bundler config
├── src/
│   ├── main.js                 # App orchestrator & UI rendering
│   ├── style.css               # Full design system (dark mode, glassmorphism)
│   └── modules/
│       ├── knowledgeBase.js    # Animals, features, rules, persistence
│       ├── expertSystem.js     # Forward chaining + information gain
│       ├── mlModel.js          # Decision Tree (ID3) + KNN classifier
│       ├── hybridEngine.js     # Combined prediction engine
│       └── soundEffects.js     # Procedural audio (Web Audio API)
└── public/                     # Static assets
```

---

## 🧪 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript (ES Modules) |
| Styling | Vanilla CSS (Custom Properties, Glassmorphism) |
| Bundler | Vite |
| AI/ML | Custom Decision Tree (ID3) + KNN |
| Storage | localStorage (JSON) |
| Audio | Web Audio API |
| Voice | Web Speech API |

---

## 📊 AI Methods Used

| Method | Description |
|--------|-------------|
| **Forward Chaining** | Applies IF-THEN rules progressively as answers come in |
| **Information Gain** | Selects the question that maximizes entropy reduction |
| **Decision Tree (ID3)** | Classifies animals based on binary feature splits |
| **K-Nearest Neighbors** | Distance-based similarity scoring against all animals |
| **Hybrid Consensus** | Weighted combination of Expert System + ML predictions |
| **Online Learning** | Adds new animals and rules from user feedback |

---

## 👤 Author

**Yahia** — [@EngYahia25](https://github.com/EngYahia25)

---

## 📄 License

This project is for educational purposes — AI 405 Intelligent Decision Support Systems course project.
