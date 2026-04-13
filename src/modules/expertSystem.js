/**
 * Expert System Module
 * Implements forward-chaining rule-based reasoning with information-gain
 * question selection for intelligent animal guessing.
 */

import knowledgeBase from './knowledgeBase.js';

class ExpertSystem {
  constructor() {
    this.reset();
  }

  /** Reset the expert system state for a new game */
  reset() {
    this.answers = {};          // featureId -> 1 (yes) / 0 (no)
    this.askedFeatures = [];    // ordered list of features asked
    this.candidates = [];       // current candidate animals
    this.rules = [];            // active rules
    this.maxQuestions = 10;
    this.refreshCandidates();
  }

  /** Refresh candidates from knowledge base */
  refreshCandidates() {
    this.candidates = knowledgeBase.getAnimals().map(a => ({
      ...a,
      score: 1.0,
      eliminated: false,
    }));
  }

  /**
   * Calculate information gain (entropy reduction) for a feature.
   * Picks the feature that best splits the remaining candidates.
   */
  calculateInformationGain(featureId) {
    const active = this.candidates.filter(c => !c.eliminated);
    if (active.length <= 1) return 0;

    const total = active.length;
    let yesCount = 0;
    let noCount = 0;

    for (const c of active) {
      if (c.features[featureId] === 1) yesCount++;
      else noCount++;
    }

    // Best split is 50/50
    const pYes = yesCount / total;
    const pNo = noCount / total;

    // Entropy of split
    const entropy = (p) => {
      if (p === 0 || p === 1) return 0;
      return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
    };

    return entropy(pYes);
  }

  /**
   * Select the next best question to ask.
   * Uses information gain to pick the most discriminating feature.
   */
  getNextQuestion() {
    const allFeatures = knowledgeBase.getFeatureIds();
    const remaining = allFeatures.filter(f => !this.askedFeatures.includes(f));

    if (remaining.length === 0) return null;
    if (this.askedFeatures.length >= this.maxQuestions) return null;

    // Calculate information gain for each remaining feature
    const scored = remaining.map(featureId => ({
      featureId,
      gain: this.calculateInformationGain(featureId),
    }));

    // Sort by information gain (highest first)
    scored.sort((a, b) => b.gain - a.gain);

    // If top gain is 0, no more useful questions
    if (scored[0].gain === 0 && this.askedFeatures.length >= 3) return null;

    const best = scored[0].featureId;
    return {
      featureId: best,
      question: knowledgeBase.getQuestion(best),
      questionNumber: this.askedFeatures.length + 1,
      totalQuestions: this.maxQuestions,
    };
  }

  /**
   * Process the user's answer and update candidates using forward chaining.
   */
  processAnswer(featureId, answer) {
    this.answers[featureId] = answer;
    this.askedFeatures.push(featureId);

    // Forward chaining: apply the answer as a rule
    for (const candidate of this.candidates) {
      if (candidate.eliminated) continue;

      const match = candidate.features[featureId];
      if (match !== undefined && match !== answer) {
        // Penalize but don't fully eliminate (allow for fuzzy matching)
        candidate.score *= 0.15;
        if (candidate.score < 0.01) {
          candidate.eliminated = true;
        }
      } else if (match === answer) {
        // Reward matching
        candidate.score *= 1.3;
      }
    }

    // Apply learned rules from knowledge base
    for (const rule of knowledgeBase.learnedRules) {
      if (rule.condition.featureId === featureId && rule.condition.value === answer) {
        for (const candidate of this.candidates) {
          if (candidate.eliminated) continue;
          if (candidate.name === rule.then.animal) {
            candidate.score *= rule.then.boost || 2.0;
          }
        }
      }
    }

    return this.getActiveCandidates();
  }

  /** Get candidates that haven't been eliminated, sorted by score */
  getActiveCandidates() {
    return this.candidates
      .filter(c => !c.eliminated)
      .sort((a, b) => b.score - a.score);
  }

  /** Get the current best prediction with confidence */
  getPrediction() {
    const active = this.getActiveCandidates();
    if (active.length === 0) {
      return { animal: null, confidence: 0, alternatives: [] };
    }

    const totalScore = active.reduce((sum, c) => sum + c.score, 0);
    const best = active[0];
    const confidence = totalScore > 0 ? (best.score / totalScore) : 0;

    return {
      animal: { name: best.name, emoji: best.emoji },
      confidence: Math.min(confidence, 0.99),
      score: best.score,
      alternatives: active.slice(1, 4).map(c => ({
        name: c.name,
        emoji: c.emoji,
        confidence: totalScore > 0 ? (c.score / totalScore) : 0,
      })),
    };
  }

  /** Check if we should stop asking questions */
  shouldStop() {
    const prediction = this.getPrediction();
    // Stop if very confident or all questions asked
    if (prediction.confidence > 0.75 && this.askedFeatures.length >= 5) return true;
    if (this.askedFeatures.length >= this.maxQuestions) return true;
    if (this.getActiveCandidates().length <= 1) return true;
    return false;
  }

  /** Get the current answer set */
  getAnswers() {
    return { ...this.answers };
  }

  /** Get the feature vector from answers */
  getFeatureVector() {
    const features = knowledgeBase.getFeatureIds();
    return features.map(f => this.answers[f] !== undefined ? this.answers[f] : -1);
  }
}

export default ExpertSystem;
