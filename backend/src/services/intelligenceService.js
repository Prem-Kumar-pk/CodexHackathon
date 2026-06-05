const intentRules = [
  { intent: "Billing / Refund", owner: "Billing Specialist", words: ["invoice", "billing", "refund", "charge"] },
  { intent: "Account Retention", owner: "Retention Lead", words: ["cancel account", "renewal", "downgrade"] },
  { intent: "Product Issue", owner: "Technical Support", words: ["broken", "failing", "failed", "error", "export"] },
  { intent: "Legal / Compliance", owner: "Escalation Manager", words: ["legal action", "security", "questionnaire"] },
  { intent: "Onboarding", owner: "Customer Success", words: ["walkthrough", "onboarding", "training"] }
];

const sentimentPenalty = {
  Positive: -8,
  Neutral: 4,
  Negative: 24,
  Critical: 42
};

export function buildCustomerIntelligence(customer) {
  const interactions = customer.interactions || [];
  const tickets = customer.tickets || [];
  const escalations = customer.escalationHistory || [];
  const latest = interactions[interactions.length - 1] || customer.latestInteraction || null;
  const openTickets = tickets.filter((ticket) => ticket.status !== "Resolved").length;
  const openEscalations = escalations.filter((item) => item.status !== "Resolved").length;
  const negativeStreak = countRecentNegative(interactions);
  const averageSentiment = averageSentimentScore(customer.sentimentHistory || interactions);
  const inferred = inferIntent(latest?.message || "");

  const riskScore = clamp(
    (sentimentPenalty[latest?.sentiment] || 8) +
      Math.max(0, -averageSentiment) * 28 +
      negativeStreak * 12 +
      openTickets * 8 +
      openEscalations * 18 +
      (customer.segment === "Enterprise" ? 6 : 0),
    0,
    100
  );

  const healthScore = clamp(
    100 -
      riskScore +
      Math.max(0, averageSentiment) * 12 -
      openTickets * 4 -
      openEscalations * 10 +
      (customer.lifetimeValue > 10000 ? 4 : 0),
    0,
    100
  );

  const riskLevel = toRiskLevel(riskScore);
  const slaRisk = toSlaRisk({ riskScore, latest, openEscalations });

  return {
    healthScore: Math.round(healthScore),
    escalationRisk: {
      score: Math.round(riskScore),
      level: riskLevel
    },
    intent: inferred.intent,
    recommendedOwner: riskLevel === "Critical" ? "Escalation Manager" : inferred.owner,
    slaRisk,
    nextBestAction: nextBestAction({ riskLevel, slaRisk, latest, inferred, openEscalations }),
    qualitySignals: qualitySignals({ latest, negativeStreak, openTickets, openEscalations, averageSentiment }),
    conversationCluster: inferred.intent,
    negativeStreak
  };
}

export function buildCustomerListIntelligence(customer) {
  return buildCustomerIntelligence({
    ...customer,
    interactions: customer.latestInteraction ? [customer.latestInteraction] : [],
    sentimentHistory: customer.latestInteraction
      ? [{ score: customer.latestInteraction.sentimentScore, sentiment: customer.latestInteraction.sentiment }]
      : [],
    escalationHistory: customer.escalationHistory || [],
    tickets: customer.tickets || []
  });
}

function inferIntent(message) {
  const text = message.toLowerCase();
  return (
    intentRules.find((rule) => rule.words.some((word) => text.includes(word))) || {
      intent: "General Support",
      owner: "Support Agent"
    }
  );
}

function averageSentimentScore(items) {
  const scores = items
    .map((item) => item.score ?? item.sentimentScore)
    .filter((score) => typeof score === "number" && !Number.isNaN(score));

  if (!scores.length) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function countRecentNegative(interactions) {
  return interactions
    .slice(-4)
    .filter((item) => ["Negative", "Critical"].includes(item.sentiment)).length;
}

function toRiskLevel(score) {
  if (score >= 78) return "Critical";
  if (score >= 55) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

function toSlaRisk({ riskScore, latest, openEscalations }) {
  if (openEscalations > 0 || latest?.priority === "Critical" || riskScore >= 78) return "Immediate";
  if (latest?.priority === "High" || riskScore >= 55) return "At Risk";
  if (riskScore >= 30) return "Watch";
  return "On Track";
}

function nextBestAction({ riskLevel, slaRisk, latest, inferred, openEscalations }) {
  if (openEscalations > 0 || riskLevel === "Critical") {
    return "Acknowledge ownership, confirm urgency, and route to an escalation manager.";
  }

  if (slaRisk === "At Risk") {
    return `Route to ${inferred.owner} and send a progress update within the next SLA window.`;
  }

  if (latest?.sentiment === "Positive") {
    return "Confirm the next milestone and offer a proactive follow-up.";
  }

  return "Send a concise acknowledgement, clarify the desired outcome, and continue triage.";
}

function qualitySignals({ latest, negativeStreak, openTickets, openEscalations, averageSentiment }) {
  const signals = [];

  if (openEscalations > 0) signals.push("Open escalation requires visible ownership.");
  if (negativeStreak >= 2) signals.push("Tone has been negative across recent messages.");
  if (openTickets > 1) signals.push("Multiple open tickets may need consolidation.");
  if ((latest?.message || "").length > 140) signals.push("Customer provided detailed context; summarize before replying.");
  if (averageSentiment > 0.35) signals.push("Customer mood is improving; reinforce momentum.");

  return signals.length ? signals : ["Conversation is stable; keep the reply clear and outcome-focused."];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
