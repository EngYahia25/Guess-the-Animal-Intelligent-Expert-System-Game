/**
 * Hybrid Intelligence Engine
 * Combines the Expert System (rule-based) with the ML Model
 * for a final prediction that leverages both approaches.
 */

import ExpertSystem from './expertSystem.js';
import MLModel from './mlModel.js';
import knowledgeBase from './knowledgeBase.js';

class HybridEngine {
  constructor() {
    this.expertSystem = new ExpertSystem();
    this.mlModel = new MLModel();
    this.mlModel.train();
    this.gameActive = false;
    this.questionHistory = [];
  }

  /** Start a new game */
  startGame() {
    this.expertSystem.reset();
    this.mlModel.retrain();
    this.gameActive = true;
    this.questionHistory = [];
    return this.getNextQuestion();
  }

  /** Get the next question to ask */
  getNextQuestion() {
    if (!this.gameActive) return null;

    // Check if expert system wants to stop
    if (this.expertSystem.shouldStop()) {
      return null;
    }

    const question = this.expertSystem.getNextQuestion();
    return question;
  }

  /** Process a user answer */
  answerQuestion(featureId, answer) {
    // Update expert system
    this.expertSystem.processAnswer(featureId, answer);

    // Record in history
    this.questionHistory.push({
      featureId,
      question: knowledgeBase.getQuestion(featureId),
      answer,
    });

    // Check if we should stop
    if (this.expertSystem.shouldStop()) {
      return { done: true, prediction: this.getFinalPrediction() };
    }

    const nextQuestion = this.getNextQuestion();
    if (!nextQuestion) {
      return { done: true, prediction: this.getFinalPrediction() };
    }

    return { done: false, nextQuestion, currentPrediction: this.getCurrentPrediction() };
  }

  /** Get the current best prediction (during game) */
  getCurrentPrediction() {
    const answers = this.expertSystem.getAnswers();
    const expertPred = this.expertSystem.getPrediction();
    const mlPred = this.mlModel.predict(answers);

    return this.combinePredictions(expertPred, mlPred);
  }

  /** Get the final combined prediction */
  getFinalPrediction() {
    const answers = this.expertSystem.getAnswers();
    const expertPred = this.expertSystem.getPrediction();
    const mlPred = this.mlModel.predict(answers);

    return this.combinePredictions(expertPred, mlPred);
  }

  /** Combine expert system and ML predictions */
  combinePredictions(expertPred, mlPred) {
    const expertWeight = 0.55;
    const mlWeight = 0.45;

    if (!expertPred.animal && !mlPred.animal) {
      return { animal: null, confidence: 0, alternatives: [], method: 'none' };
    }

    if (!expertPred.animal) {
      return { ...mlPred, method: 'ml_only' };
    }

    if (!mlPred.animal) {
      return { ...expertPred, method: 'expert_only' };
    }

    // Both systems agree
    if (expertPred.animal.name === mlPred.animal.name) {
      const combinedConfidence = Math.min(
        expertPred.confidence * expertWeight + mlPred.confidence * mlWeight + 0.15,
        0.99
      );
      return {
        animal: expertPred.animal,
        confidence: combinedConfidence,
        method: 'hybrid_consensus',
        expertConfidence: expertPred.confidence,
        mlConfidence: mlPred.confidence,
        alternatives: this.mergeAlternatives(expertPred.alternatives, mlPred.alternatives),
      };
    }

    // They disagree — pick the one with higher weighted confidence
    const expertScore = expertPred.confidence * expertWeight;
    const mlScore = mlPred.confidence * mlWeight;

    if (expertScore >= mlScore) {
      const combinedConfidence = Math.min(expertPred.confidence * 0.8, 0.95);
      return {
        animal: expertPred.animal,
        confidence: combinedConfidence,
        method: 'hybrid_expert',
        expertConfidence: expertPred.confidence,
        mlConfidence: mlPred.confidence,
        alternatives: [
          { name: mlPred.animal.name, emoji: mlPred.animal.emoji, confidence: mlPred.confidence },
          ...this.mergeAlternatives(expertPred.alternatives, mlPred.alternatives),
        ].slice(0, 3),
      };
    } else {
      const combinedConfidence = Math.min(mlPred.confidence * 0.8, 0.95);
      return {
        animal: mlPred.animal,
        confidence: combinedConfidence,
        method: 'hybrid_ml',
        expertConfidence: expertPred.confidence,
        mlConfidence: mlPred.confidence,
        alternatives: [
          { name: expertPred.animal.name, emoji: expertPred.animal.emoji, confidence: expertPred.confidence },
          ...this.mergeAlternatives(expertPred.alternatives, mlPred.alternatives),
        ].slice(0, 3),
      };
    }
  }

  /** Merge alternative predictions, removing duplicates */
  mergeAlternatives(alt1 = [], alt2 = []) {
    const merged = new Map();
    for (const a of [...alt1, ...alt2]) {
      if (!merged.has(a.name)) {
        merged.set(a.name, a);
      } else {
        const existing = merged.get(a.name);
        existing.confidence = Math.max(existing.confidence, a.confidence);
      }
    }
    return Array.from(merged.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * Learn from a wrong guess.
   * @param {string} correctAnimalName - What was the actual animal?
   * @param {string} distinguishingQuestion - A yes/no question to distinguish it
   * @param {boolean} distinguishingAnswer - Whether the answer is yes for the new animal
   */
  learn(correctAnimalName, distinguishingQuestion, distinguishingAnswer) {
    const answers = this.expertSystem.getAnswers();

    // Find or create emoji for the animal
    const existingAnimal = knowledgeBase.getAnimals().find(
      a => a.name.toLowerCase() === correctAnimalName.toLowerCase()
    );
    const emoji = existingAnimal?.emoji || '🐾';

    // Create feature vector from user answers
    const features = { ...answers };

    // Add the new distinguishing feature if provided
    if (distinguishingQuestion) {
      const featureId = this.generateFeatureId(distinguishingQuestion);
      knowledgeBase.addFeature(featureId, distinguishingQuestion, 'learned');
      features[featureId] = distinguishingAnswer ? 1 : 0;

      // Add a rule linking this feature to the animal
      knowledgeBase.addRule({
        condition: { featureId, value: distinguishingAnswer ? 1 : 0 },
        then: { animal: correctAnimalName, boost: 2.5 },
        learned: true,
        timestamp: Date.now(),
      });
    }

    // Add or update the animal in the knowledge base
    knowledgeBase.addAnimal(correctAnimalName, emoji, features);

    // Retrain ML model
    this.mlModel.retrain();
  }

  /** Generate a feature ID from a question */
  generateFeatureId(question) {
    return question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 30);
  }

  /** Get question history for the current game */
  getHistory() {
    return this.questionHistory;
  }

  /** Get answers for the current game */
  getAnswers() {
    return this.expertSystem.getAnswers();
  }

  /** Get number of questions asked */
  getQuestionCount() {
    return this.questionHistory.length;
  }
}

export default HybridEngine;
