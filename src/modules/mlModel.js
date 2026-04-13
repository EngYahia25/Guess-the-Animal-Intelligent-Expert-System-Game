/**
 * Machine Learning Model Module
 * Implements a simple Decision Tree classifier and a distance-based
 * scoring system for animal prediction.
 */

import knowledgeBase from './knowledgeBase.js';

class MLModel {
  constructor() {
    this.trained = false;
    this.trainingData = [];
    this.decisionTree = null;
  }

  /**
   * Train the model from the knowledge base.
   * Builds a simple decision tree and stores training data.
   */
  train() {
    const animals = knowledgeBase.getAnimals();
    const featureIds = knowledgeBase.getFeatureIds();

    // Create training data: each animal is a sample
    this.trainingData = animals.map(animal => ({
      label: animal.name,
      emoji: animal.emoji,
      features: featureIds.map(f => animal.features[f] !== undefined ? animal.features[f] : 0),
    }));

    // Build a simple decision tree using ID3-like algorithm
    this.decisionTree = this.buildTree(
      this.trainingData.map((_, i) => i),
      featureIds.map((_, i) => i),
      0
    );

    this.trained = true;
  }

  /**
   * Build a decision tree node recursively.
   * Uses information gain to select the best feature to split on.
   */
  buildTree(sampleIndices, availableFeatures, depth) {
    if (sampleIndices.length === 0) {
      return { type: 'leaf', label: 'Unknown', emoji: '❓', probability: 0 };
    }

    // Check if all samples have the same label
    const labels = [...new Set(sampleIndices.map(i => this.trainingData[i].label))];
    if (labels.length === 1) {
      const sample = this.trainingData[sampleIndices[0]];
      return { type: 'leaf', label: sample.label, emoji: sample.emoji, probability: 1.0 };
    }

    // Stop if max depth reached or no features left
    if (depth >= 15 || availableFeatures.length === 0) {
      return this.createMajorityLeaf(sampleIndices);
    }

    // Find best feature to split on
    let bestFeature = -1;
    let bestGain = -1;

    for (const featureIdx of availableFeatures) {
      const gain = this.informationGain(sampleIndices, featureIdx);
      if (gain > bestGain) {
        bestGain = gain;
        bestFeature = featureIdx;
      }
    }

    if (bestFeature === -1 || bestGain <= 0) {
      return this.createMajorityLeaf(sampleIndices);
    }

    // Split samples
    const yesSamples = sampleIndices.filter(i => this.trainingData[i].features[bestFeature] === 1);
    const noSamples = sampleIndices.filter(i => this.trainingData[i].features[bestFeature] !== 1);
    const remainingFeatures = availableFeatures.filter(f => f !== bestFeature);

    return {
      type: 'node',
      featureIndex: bestFeature,
      featureId: knowledgeBase.getFeatureIds()[bestFeature],
      yes: this.buildTree(yesSamples, remainingFeatures, depth + 1),
      no: this.buildTree(noSamples, remainingFeatures, depth + 1),
    };
  }

  /** Create a leaf node with the majority label */
  createMajorityLeaf(sampleIndices) {
    const labelCounts = {};
    for (const i of sampleIndices) {
      const label = this.trainingData[i].label;
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    }
    const sorted = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]);
    const bestLabel = sorted[0][0];
    const sample = this.trainingData.find(d => d.label === bestLabel);
    return {
      type: 'leaf',
      label: bestLabel,
      emoji: sample?.emoji || '❓',
      probability: sorted[0][1] / sampleIndices.length,
      alternatives: sorted.slice(1, 4).map(([label, count]) => ({
        label,
        emoji: this.trainingData.find(d => d.label === label)?.emoji || '❓',
        probability: count / sampleIndices.length,
      })),
    };
  }

  /** Calculate information gain for a feature */
  informationGain(sampleIndices, featureIdx) {
    const total = sampleIndices.length;
    const parentEntropy = this.entropy(sampleIndices);

    const yesSamples = sampleIndices.filter(i => this.trainingData[i].features[featureIdx] === 1);
    const noSamples = sampleIndices.filter(i => this.trainingData[i].features[featureIdx] !== 1);

    const yesEntropy = this.entropy(yesSamples);
    const noEntropy = this.entropy(noSamples);

    return parentEntropy - (yesSamples.length / total) * yesEntropy - (noSamples.length / total) * noEntropy;
  }

  /** Calculate entropy of a set of samples */
  entropy(sampleIndices) {
    if (sampleIndices.length === 0) return 0;
    const labelCounts = {};
    for (const i of sampleIndices) {
      const label = this.trainingData[i].label;
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    }
    let ent = 0;
    for (const count of Object.values(labelCounts)) {
      const p = count / sampleIndices.length;
      if (p > 0) ent -= p * Math.log2(p);
    }
    return ent;
  }

  /**
   * Predict using the decision tree.
   * @param {Object} answers - featureId -> value mapping
   * @returns prediction object
   */
  predictWithTree(answers) {
    if (!this.trained || !this.decisionTree) {
      this.train();
    }

    let node = this.decisionTree;
    while (node.type === 'node') {
      const answer = answers[node.featureId];
      if (answer === 1) {
        node = node.yes;
      } else if (answer === 0) {
        node = node.no;
      } else {
        // Unknown answer, go with larger branch
        node = node.yes || node.no;
      }
    }

    return {
      animal: { name: node.label, emoji: node.emoji },
      confidence: node.probability || 0.5,
      alternatives: node.alternatives || [],
    };
  }

  /**
   * Predict using distance-based scoring (K-nearest neighbors approach).
   * Compares user answers to all animal feature vectors.
   */
  predictWithDistance(answers) {
    const animals = knowledgeBase.getAnimals();
    const featureIds = knowledgeBase.getFeatureIds();

    const scores = animals.map(animal => {
      let matchCount = 0;
      let totalCompared = 0;
      let weightedScore = 0;

      for (const fId of featureIds) {
        if (answers[fId] === undefined) continue;
        totalCompared++;
        const animalValue = animal.features[fId] !== undefined ? animal.features[fId] : 0;
        const userValue = answers[fId];

        if (animalValue === userValue) {
          matchCount++;
          weightedScore += 1.0;
        } else {
          weightedScore -= 0.5;
        }
      }

      const similarity = totalCompared > 0 ? matchCount / totalCompared : 0;
      return {
        name: animal.name,
        emoji: animal.emoji,
        similarity,
        matchCount,
        totalCompared,
        weightedScore,
      };
    });

    scores.sort((a, b) => b.similarity - a.similarity || b.weightedScore - a.weightedScore);

    if (scores.length === 0) {
      return { animal: null, confidence: 0, alternatives: [] };
    }

    return {
      animal: { name: scores[0].name, emoji: scores[0].emoji },
      confidence: scores[0].similarity,
      alternatives: scores.slice(1, 4).map(s => ({
        name: s.name,
        emoji: s.emoji,
        confidence: s.similarity,
      })),
    };
  }

  /**
   * Combined prediction using both tree and distance methods.
   */
  predict(answers) {
    const treePrediction = this.predictWithTree(answers);
    const distPrediction = this.predictWithDistance(answers);

    // Combine scores: weight tree prediction higher
    const treeWeight = 0.6;
    const distWeight = 0.4;

    // If both agree, boost confidence
    if (treePrediction.animal && distPrediction.animal &&
        treePrediction.animal.name === distPrediction.animal.name) {
      return {
        animal: treePrediction.animal,
        confidence: Math.min(
          treePrediction.confidence * treeWeight + distPrediction.confidence * distWeight + 0.1,
          0.99
        ),
        method: 'consensus',
        treePrediction,
        distPrediction,
        alternatives: treePrediction.alternatives,
      };
    }

    // If they disagree, go with the one with higher confidence
    const treeScore = treePrediction.confidence * treeWeight;
    const distScore = distPrediction.confidence * distWeight;

    if (treeScore >= distScore) {
      return {
        animal: treePrediction.animal,
        confidence: Math.min(treePrediction.confidence * 0.85, 0.95),
        method: 'decision_tree',
        treePrediction,
        distPrediction,
        alternatives: [
          ...(distPrediction.animal ? [{
            name: distPrediction.animal.name,
            emoji: distPrediction.animal.emoji,
            confidence: distPrediction.confidence,
          }] : []),
          ...(treePrediction.alternatives || []),
        ].slice(0, 3),
      };
    } else {
      return {
        animal: distPrediction.animal,
        confidence: Math.min(distPrediction.confidence * 0.85, 0.95),
        method: 'distance',
        treePrediction,
        distPrediction,
        alternatives: [
          ...(treePrediction.animal ? [{
            name: treePrediction.animal.name,
            emoji: treePrediction.animal.emoji,
            confidence: treePrediction.confidence,
          }] : []),
          ...(distPrediction.alternatives || []),
        ].slice(0, 3),
      };
    }
  }

  /** Retrain the model (should be called after knowledge base updates) */
  retrain() {
    this.trained = false;
    this.train();
  }
}

export default MLModel;
