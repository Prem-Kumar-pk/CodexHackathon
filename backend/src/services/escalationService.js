import { createEscalation } from "../repositories/supportRepository.js";
import { criticalKeywords } from "./sentimentService.js";

export function evaluateEscalation({ interaction, history = [], sentimentAnalysis }) {
  const message = interaction.message.toLowerCase();
  const keywordHits = [
    ...new Set([
      ...criticalKeywords.filter((keyword) => message.includes(keyword)),
      ...(sentimentAnalysis?.keywords || [])
    ])
  ];

  const recentNegativeStreak = history
    .slice(-3)
    .filter((item) => ["Negative", "Critical"].includes(item.sentiment)).length;

  const score = sentimentAnalysis?.score ?? interaction.sentimentScore;
  let level = "Low";
  const reasons = [];

  if (score <= -0.3) {
    level = "Medium";
    reasons.push("Negative sentiment score");
  }

  if (score <= -0.55 || recentNegativeStreak >= 2) {
    level = "High";
    reasons.push("Sustained negative conversation pattern");
  }

  if (score <= -0.8 || keywordHits.length >= 2) {
    level = "Critical";
    reasons.push("Critical sentiment or high-risk keyword detected");
  }

  if (keywordHits.length) {
    reasons.push(`Keyword match: ${keywordHits.join(", ")}`);
  }

  return {
    shouldEscalate: ["Medium", "High", "Critical"].includes(level),
    level,
    reason: reasons.join(". ") || "No escalation criteria met",
    keywords: keywordHits,
    negativeStreak: recentNegativeStreak
  };
}

export async function escalateInteraction(payload) {
  return createEscalation(payload);
}
