/**
 * Knowledge Base Module
 * Stores all animals, features, questions, and rules.
 * Supports persistence via localStorage and self-learning.
 */

const STORAGE_KEY = 'animal_game_kb';
const STATS_KEY = 'animal_game_stats';

// Default feature definitions
const DEFAULT_FEATURES = [
  { id: 'can_fly', question: 'Can it fly?', category: 'locomotion' },
  { id: 'lives_in_water', question: 'Does it live primarily in water?', category: 'habitat' },
  { id: 'has_fur', question: 'Does it have fur or hair?', category: 'body' },
  { id: 'is_carnivore', question: 'Is it primarily a meat eater (carnivore)?', category: 'diet' },
  { id: 'size_small', question: 'Is it smaller than a typical house cat?', category: 'size' },
  { id: 'has_scales', question: 'Does it have scales?', category: 'body' },
  { id: 'is_domesticated', question: 'Is it commonly kept as a pet or farm animal?', category: 'relation' },
  { id: 'has_legs', question: 'Does it have legs?', category: 'body' },
  { id: 'is_nocturnal', question: 'Is it mainly active at night (nocturnal)?', category: 'behavior' },
  { id: 'lives_in_groups', question: 'Does it typically live in groups or herds?', category: 'behavior' },
  { id: 'can_swim', question: 'Can it swim?', category: 'locomotion' },
  { id: 'has_tail', question: 'Does it have a prominent tail?', category: 'body' },
  { id: 'is_herbivore', question: 'Does it primarily eat plants (herbivore)?', category: 'diet' },
  { id: 'lives_in_trees', question: 'Does it spend a lot of time in trees?', category: 'habitat' },
  { id: 'is_large', question: 'Is it larger than an average adult human?', category: 'size' },
  { id: 'has_stripes_or_spots', question: 'Does it have stripes or spots on its body?', category: 'body' },
  { id: 'is_dangerous', question: 'Is it generally dangerous to humans?', category: 'relation' },
  { id: 'has_feathers', question: 'Does it have feathers?', category: 'body' },
  { id: 'makes_loud_sound', question: 'Is it known for making a loud or distinctive sound?', category: 'behavior' },
  { id: 'lives_in_cold', question: 'Does it live in cold or arctic climates?', category: 'habitat' },
];

// Default animals with feature vectors
const DEFAULT_ANIMALS = [
  {
    name: 'Lion', emoji: '🦁',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 0, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 0, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Tiger', emoji: '🐯',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 1, lives_in_groups: 0, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 1, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Elephant', emoji: '🐘',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 0, is_carnivore: 0, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 1, has_tail: 1, is_herbivore: 1, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 0, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Dog', emoji: '🐕',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 1, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Cat', emoji: '🐈',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 1, size_small: 1, has_scales: 0, is_domesticated: 1, has_legs: 1, is_nocturnal: 1, lives_in_groups: 0, can_swim: 0, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 0, lives_in_cold: 0 }
  },
  {
    name: 'Eagle', emoji: '🦅',
    features: { can_fly: 1, lives_in_water: 0, has_fur: 0, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 0, lives_in_groups: 0, can_swim: 0, has_tail: 1, is_herbivore: 0, lives_in_trees: 1, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 1, has_feathers: 1, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Penguin', emoji: '🐧',
    features: { can_fly: 0, lives_in_water: 1, has_fur: 0, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 1, makes_loud_sound: 0, lives_in_cold: 1 }
  },
  {
    name: 'Shark', emoji: '🦈',
    features: { can_fly: 0, lives_in_water: 1, has_fur: 0, is_carnivore: 1, size_small: 0, has_scales: 1, is_domesticated: 0, has_legs: 0, is_nocturnal: 0, lives_in_groups: 0, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 0, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 0, lives_in_cold: 0 }
  },
  {
    name: 'Dolphin', emoji: '🐬',
    features: { can_fly: 0, lives_in_water: 1, has_fur: 0, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 0, is_nocturnal: 0, lives_in_groups: 1, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Frog', emoji: '🐸',
    features: { can_fly: 0, lives_in_water: 1, has_fur: 0, is_carnivore: 1, size_small: 1, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 1, lives_in_groups: 0, can_swim: 1, has_tail: 0, is_herbivore: 0, lives_in_trees: 0, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Snake', emoji: '🐍',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 0, is_carnivore: 1, size_small: 0, has_scales: 1, is_domesticated: 0, has_legs: 0, is_nocturnal: 1, lives_in_groups: 0, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 0, has_stripes_or_spots: 1, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 0, lives_in_cold: 0 }
  },
  {
    name: 'Horse', emoji: '🐴',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 0, size_small: 0, has_scales: 0, is_domesticated: 1, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 1, has_tail: 1, is_herbivore: 1, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Cow', emoji: '🐄',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 0, size_small: 0, has_scales: 0, is_domesticated: 1, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 0, has_tail: 1, is_herbivore: 1, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 1, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Rabbit', emoji: '🐇',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 0, size_small: 1, has_scales: 0, is_domesticated: 1, has_legs: 1, is_nocturnal: 0, lives_in_groups: 0, can_swim: 0, has_tail: 1, is_herbivore: 1, lives_in_trees: 0, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 0, lives_in_cold: 0 }
  },
  {
    name: 'Bear', emoji: '🐻',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 0, lives_in_groups: 0, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 0, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 1 }
  },
  {
    name: 'Wolf', emoji: '🐺',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 1, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 1, lives_in_groups: 1, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 1 }
  },
  {
    name: 'Monkey', emoji: '🐒',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 0, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 0, has_tail: 1, is_herbivore: 0, lives_in_trees: 1, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 1, lives_in_cold: 0 }
  },
  {
    name: 'Giraffe', emoji: '🦒',
    features: { can_fly: 0, lives_in_water: 0, has_fur: 1, is_carnivore: 0, size_small: 0, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 0, lives_in_groups: 1, can_swim: 0, has_tail: 1, is_herbivore: 1, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 1, is_dangerous: 0, has_feathers: 0, makes_loud_sound: 0, lives_in_cold: 0 }
  },
  {
    name: 'Crocodile', emoji: '🐊',
    features: { can_fly: 0, lives_in_water: 1, has_fur: 0, is_carnivore: 1, size_small: 0, has_scales: 1, is_domesticated: 0, has_legs: 1, is_nocturnal: 1, lives_in_groups: 0, can_swim: 1, has_tail: 1, is_herbivore: 0, lives_in_trees: 0, is_large: 1, has_stripes_or_spots: 0, is_dangerous: 1, has_feathers: 0, makes_loud_sound: 0, lives_in_cold: 0 }
  },
  {
    name: 'Owl', emoji: '🦉',
    features: { can_fly: 1, lives_in_water: 0, has_fur: 0, is_carnivore: 1, size_small: 1, has_scales: 0, is_domesticated: 0, has_legs: 1, is_nocturnal: 1, lives_in_groups: 0, can_swim: 0, has_tail: 1, is_herbivore: 0, lives_in_trees: 1, is_large: 0, has_stripes_or_spots: 0, is_dangerous: 0, has_feathers: 1, makes_loud_sound: 1, lives_in_cold: 0 }
  },
];

class KnowledgeBase {
  constructor() {
    this.animals = [];
    this.features = [];
    this.learnedRules = [];
    this.stats = { gamesPlayed: 0, correctGuesses: 0, animalsLearned: 0, mostGuessed: {} };
    this.load();
  }

  /** Load from localStorage or initialize with defaults */
  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.animals = data.animals || [...DEFAULT_ANIMALS];
        this.features = data.features || [...DEFAULT_FEATURES];
        this.learnedRules = data.learnedRules || [];
      } else {
        this.animals = JSON.parse(JSON.stringify(DEFAULT_ANIMALS));
        this.features = JSON.parse(JSON.stringify(DEFAULT_FEATURES));
        this.learnedRules = [];
      }
    } catch {
      this.animals = JSON.parse(JSON.stringify(DEFAULT_ANIMALS));
      this.features = JSON.parse(JSON.stringify(DEFAULT_FEATURES));
      this.learnedRules = [];
    }

    try {
      const savedStats = localStorage.getItem(STATS_KEY);
      if (savedStats) {
        this.stats = JSON.parse(savedStats);
      }
    } catch {
      // Use defaults
    }
  }

  /** Save current state to localStorage */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        animals: this.animals,
        features: this.features,
        learnedRules: this.learnedRules,
      }));
      localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Failed to save knowledge base:', e);
    }
  }

  /** Get all animals */
  getAnimals() {
    return this.animals;
  }

  /** Get all features */
  getFeatures() {
    return this.features;
  }

  /** Get feature IDs */
  getFeatureIds() {
    return this.features.map(f => f.id);
  }

  /** Get question for a feature */
  getQuestion(featureId) {
    const feature = this.features.find(f => f.id === featureId);
    return feature ? feature.question : null;
  }

  /** Add a new animal with features */
  addAnimal(name, emoji, features) {
    // Check if animal already exists
    const existing = this.animals.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      // Update existing
      Object.assign(existing.features, features);
    } else {
      // Add new, ensure all features are present
      const fullFeatures = {};
      for (const f of this.features) {
        fullFeatures[f.id] = features[f.id] !== undefined ? features[f.id] : 0;
      }
      this.animals.push({ name, emoji, features: fullFeatures });
      this.stats.animalsLearned++;
    }
    this.save();
  }

  /** Add a new distinguishing feature/question */
  addFeature(id, question, category = 'learned') {
    if (this.features.find(f => f.id === id)) return;
    this.features.push({ id, question, category });
    // Initialize this feature to 0 for all existing animals
    for (const animal of this.animals) {
      if (animal.features[id] === undefined) {
        animal.features[id] = 0;
      }
    }
    this.save();
  }

  /** Add a learned rule */
  addRule(rule) {
    this.learnedRules.push(rule);
    this.save();
  }

  /** Update game stats */
  recordGame(correct, animalName) {
    this.stats.gamesPlayed++;
    if (correct) this.stats.correctGuesses++;
    if (animalName) {
      this.stats.mostGuessed[animalName] = (this.stats.mostGuessed[animalName] || 0) + 1;
    }
    this.save();
  }

  /** Get stats */
  getStats() {
    return this.stats;
  }

  /** Get top guessed animals */
  getTopGuessed(n = 5) {
    return Object.entries(this.stats.mostGuessed)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ name, count, emoji: this.animals.find(a => a.name === name)?.emoji || '❓' }));
  }

  /** Reset to defaults */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
    this.load();
  }

  /** Export knowledge base as JSON */
  exportData() {
    return JSON.stringify({
      animals: this.animals,
      features: this.features,
      learnedRules: this.learnedRules,
      stats: this.stats,
    }, null, 2);
  }
}

// Singleton
const knowledgeBase = new KnowledgeBase();
export default knowledgeBase;
