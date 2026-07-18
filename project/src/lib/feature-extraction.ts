export type ProductFeature = {
  name: string;
  sentimentScore: number;
  mentions: number;
  positiveMentions: number;
  negativeMentions: number;
};

export type FeatureAnalysis = {
  features: ProductFeature[];
  overallSentiment: number;
  topPositiveFeature: string;
  topNegativeFeature: string;
  featureScores: Record<string, number>;
};

export class FeatureExtractor {
  private readonly FEATURES: Record<string, string[]> = {
    electronics: ['battery', 'display', 'performance', 'sound', 'camera', 'design', 'durability', 'screen', 'processor', 'storage'],
    clothing: ['quality', 'fit', 'color', 'material', 'comfort', 'style', 'size', 'fabric', 'design', 'durability'],
    books: ['content', 'writing', 'cover', 'pages', 'quality', 'story', 'characters', 'plot', 'value'],
    general: ['price', 'quality', 'delivery', 'service', 'packaging', 'value', 'durability', 'design'],
  };

  private readonly SENTIMENT_WORDS = {
    positive: ['good', 'great', 'amazing', 'excellent', 'awesome', 'fantastic', 'perfect', 'best', 
               'love', 'like', 'beautiful', 'wonderful', 'superb', 'outstanding', 'remarkable',
               'superior', 'exceptional', 'flawless', 'impressive', 'satisfied', 'happy'],
    negative: ['bad', 'terrible', 'poor', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 
               'disappointing', 'fail', 'failure', 'useless', 'waste', 'annoying', 'frustrating',
               'mediocre', 'inferior', 'subpar', 'disgusting', 'unacceptable', 'broken'],
  };

  extractFeatures(text: string, category: string = 'general'): Record<string, number> {
    const featureScores: Record<string, number> = {};
    const categoryFeatures = this.FEATURES[category.toLowerCase()] || this.FEATURES.general;
    const words = text.toLowerCase().split(' ');
    const positiveWords = this.SENTIMENT_WORDS.positive;
    const negativeWords = this.SENTIMENT_WORDS.negative;

    categoryFeatures.forEach(feature => {
      let score = 0;
      let mentions = 0;

      words.forEach((word, index) => {
        // Check if the word or a variation is a feature
        if (word.includes(feature) || word === feature || feature.includes(word)) {
          mentions++;
          // Look at surrounding words for sentiment
          const start = Math.max(0, index - 3);
          const end = Math.min(words.length, index + 4);
          const context = words.slice(start, end);

          const hasPositive = context.some(w => positiveWords.includes(w));
          const hasNegative = context.some(w => negativeWords.includes(w));

          if (hasPositive && !hasNegative) {
            score += 1;
          } else if (hasNegative && !hasPositive) {
            score -= 1;
          } else {
            // Check for modifier words
            const modifiers = context.filter(w => ['very', 'really', 'extremely', 'quite', 'somewhat'].includes(w));
            if (modifiers.length > 0) {
              score += 0.5;
            }
          }
        }
      });

      if (mentions > 0) {
        const normalizedScore = (score / mentions + 1) / 2; // Normalize to 0-1
        featureScores[feature] = Math.max(0, Math.min(1, normalizedScore));
      }
    });

    return featureScores;
  }

  analyzeFeatures(text: string, category: string = 'general'): FeatureAnalysis {
    const featureScores = this.extractFeatures(text, category);
    const features: ProductFeature[] = [];

    let totalSentiment = 0;
    let count = 0;

    Object.entries(featureScores).forEach(([name, score]) => {
      const mentions = (text.toLowerCase().split(name).length - 1) || 1;
      features.push({
        name,
        sentimentScore: score,
        mentions,
        positiveMentions: Math.round(mentions * score),
        negativeMentions: Math.round(mentions * (1 - score)),
      });
      totalSentiment += score;
      count++;
    });

    // Sort by mentions (most mentioned features first)
    features.sort((a, b) => b.mentions - a.mentions);

    // Find top positive and negative features
    const positiveFeatures = features.filter(f => f.sentimentScore > 0.7);
    const negativeFeatures = features.filter(f => f.sentimentScore < 0.3);

    return {
      features,
      overallSentiment: count > 0 ? totalSentiment / count : 0.5,
      topPositiveFeature: positiveFeatures.length > 0 ? positiveFeatures[0].name : 'N/A',
      topNegativeFeature: negativeFeatures.length > 0 ? negativeFeatures[0].name : 'N/A',
      featureScores,
    };
  }

  // Aggregate features from multiple reviews
  aggregateFeatures(reviews: string[], category: string = 'general'): FeatureAnalysis {
    const allFeatures: Record<string, number[]> = {};
    const allMentions: Record<string, number> = {};

    reviews.forEach(text => {
      const analysis = this.analyzeFeatures(text, category);
      Object.entries(analysis.featureScores).forEach(([name, score]) => {
        if (!allFeatures[name]) {
          allFeatures[name] = [];
          allMentions[name] = 0;
        }
        allFeatures[name].push(score);
        allMentions[name] += (text.toLowerCase().split(name).length - 1) || 1;
      });
    });

    const aggregatedFeatures: ProductFeature[] = [];
    let totalSentiment = 0;
    let count = 0;

    Object.keys(allFeatures).forEach(name => {
      const scores = allFeatures[name];
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const mentions = allMentions[name] || 1;
      
      aggregatedFeatures.push({
        name,
        sentimentScore: avgScore,
        mentions,
        positiveMentions: Math.round(mentions * avgScore),
        negativeMentions: Math.round(mentions * (1 - avgScore)),
      });
      totalSentiment += avgScore;
      count++;
    });

    aggregatedFeatures.sort((a, b) => b.mentions - a.mentions);

    const positiveFeatures = aggregatedFeatures.filter(f => f.sentimentScore > 0.7);
    const negativeFeatures = aggregatedFeatures.filter(f => f.sentimentScore < 0.3);

    return {
      features: aggregatedFeatures,
      overallSentiment: count > 0 ? totalSentiment / count : 0.5,
      topPositiveFeature: positiveFeatures.length > 0 ? positiveFeatures[0].name : 'N/A',
      topNegativeFeature: negativeFeatures.length > 0 ? negativeFeatures[0].name : 'N/A',
      featureScores: Object.fromEntries(
        aggregatedFeatures.map(f => [f.name, f.sentimentScore])
      ),
    };
  }
}