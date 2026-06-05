import { evaluateEscalation } from "../src/services/escalationService.js";

const baseInteraction = {
  id: "interaction-1",
  customerId: "customer-1",
  message: "I need help with billing.",
  sentimentScore: 0,
  sentiment: "Neutral"
};

describe("escalationService", () => {
  test("does not escalate low-risk interactions", () => {
    const result = evaluateEscalation({
      interaction: baseInteraction,
      history: [],
      sentimentAnalysis: { score: 0.1, keywords: [] }
    });

    expect(result).toMatchObject({
      shouldEscalate: false,
      level: "Low"
    });
  });

  test("creates a medium escalation from negative sentiment", () => {
    const result = evaluateEscalation({
      interaction: baseInteraction,
      history: [],
      sentimentAnalysis: { score: -0.4, keywords: [] }
    });

    expect(result).toMatchObject({
      shouldEscalate: true,
      level: "Medium"
    });
  });

  test("raises to high when the conversation has a negative streak", () => {
    const result = evaluateEscalation({
      interaction: baseInteraction,
      history: [
        { sentiment: "Negative" },
        { sentiment: "Critical" },
        { sentiment: "Neutral" }
      ],
      sentimentAnalysis: { score: -0.2, keywords: [] }
    });

    expect(result.level).toBe("High");
    expect(result.negativeStreak).toBe(2);
  });

  test("raises to critical for multiple high-risk keywords", () => {
    const result = evaluateEscalation({
      interaction: {
        ...baseInteraction,
        message: "This is the worst service and I need a refund immediately."
      },
      history: [],
      sentimentAnalysis: { score: -0.45, keywords: ["worst service", "refund immediately"] }
    });

    expect(result).toMatchObject({
      shouldEscalate: true,
      level: "Critical"
    });
    expect(result.keywords).toEqual(expect.arrayContaining(["worst service", "refund immediately"]));
  });
});
