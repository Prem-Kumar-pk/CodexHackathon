import { requestOpenAIJson } from "./openaiService.js";

export const criticalKeywords = [
  "cancel account",
  "refund immediately",
  "worst service",
  "legal action"
];

const positiveWords = ["thanks", "thank you", "great", "helpful", "excellent", "resolved", "appreciate"];
const negativeWords = ["angry", "broken", "failing", "failed", "bad", "upset", "refund", "cancel", "worst"];

export async function analyzeSentiment({ message, history = [] }) {
  try {
    const aiResult = await requestOpenAIJson({
      system:
        "You analyze customer support messages. Return only JSON that matches the schema. Sentiment must be Positive, Neutral, Negative, or Critical. Score is -1 to 1.",
      user: JSON.stringify({ message, recentHistory: history.slice(-6) }),
      schema: {
        name: "support_sentiment_analysis",
        value: {
          type: "object",
          additionalProperties: false,
          required: ["sentiment", "score", "trend", "reason", "keywords"],
          properties: {
            sentiment: { type: "string", enum: ["Positive", "Neutral", "Negative", "Critical"] },
            score: { type: "number", minimum: -1, maximum: 1 },
            trend: { type: "string", enum: ["Improving", "Stable", "Declining"] },
            reason: { type: "string" },
            keywords: { type: "array", items: { type: "string" } }
          }
        }
      }
    });

    if (aiResult) {
      return normalizeSentiment(aiResult);
    }
  } catch (error) {
    console.warn(error.message);
  }

  return heuristicSentiment(message, history);
}

function heuristicSentiment(message, history = []) {
  const text = message.toLowerCase();
  const keywordHits = criticalKeywords.filter((keyword) => text.includes(keyword));
  const positiveHits = positiveWords.filter((word) => text.includes(word)).length;
  const negativeHits = negativeWords.filter((word) => text.includes(word)).length;

  let score = 0;
  score += positiveHits * 0.18;
  score -= negativeHits * 0.18;
  score -= keywordHits.length * 0.35;
  score = Math.max(-1, Math.min(1, score));

  const recentScores = history
    .slice(-3)
    .map((item) => item.sentimentScore ?? item.score)
    .filter((value) => typeof value === "number");
  const priorAverage = recentScores.length
    ? recentScores.reduce((sum, value) => sum + value, 0) / recentScores.length
    : score;

  let trend = "Stable";
  if (score - priorAverage > 0.15) trend = "Improving";
  if (score - priorAverage < -0.15) trend = "Declining";

  let sentiment = "Neutral";
  if (score >= 0.35) sentiment = "Positive";
  if (score <= -0.25) sentiment = "Negative";
  if (score <= -0.75 || keywordHits.length >= 2) sentiment = "Critical";

  return {
    sentiment,
    score: Number(score.toFixed(2)),
    trend,
    reason: keywordHits.length
      ? `Detected escalation-sensitive keyword(s): ${keywordHits.join(", ")}.`
      : "Heuristic analysis from customer language and recent context.",
    keywords: keywordHits
  };
}

function normalizeSentiment(result) {
  const score = Math.max(-1, Math.min(1, Number(result.score || 0)));
  return {
    sentiment: result.sentiment,
    score: Number(score.toFixed(2)),
    trend: result.trend || "Stable",
    reason: result.reason || "AI sentiment analysis completed.",
    keywords: Array.isArray(result.keywords) ? result.keywords : []
  };
}
