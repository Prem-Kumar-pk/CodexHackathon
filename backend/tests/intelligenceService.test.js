import { buildCustomerIntelligence } from "../src/services/intelligenceService.js";

describe("intelligenceService", () => {
  test("scores stable positive customers as healthy and low risk", () => {
    const result = buildCustomerIntelligence({
      segment: "Growth",
      lifetimeValue: 5000,
      interactions: [
        {
          message: "The onboarding walkthrough was helpful.",
          sentiment: "Positive",
          sentimentScore: 0.7,
          priority: "Low"
        }
      ],
      sentimentHistory: [{ score: 0.7, sentiment: "Positive" }],
      escalationHistory: [],
      tickets: []
    });

    expect(result.healthScore).toBeGreaterThanOrEqual(90);
    expect(result.escalationRisk.level).toBe("Low");
    expect(result.intent).toBe("Onboarding");
    expect(result.slaRisk).toBe("On Track");
  });

  test("raises risk and ownership for critical escalation signals", () => {
    const result = buildCustomerIntelligence({
      segment: "Enterprise",
      lifetimeValue: 25000,
      interactions: [
        {
          message: "Worst service. I need a refund immediately.",
          sentiment: "Critical",
          sentimentScore: -0.9,
          priority: "Critical"
        }
      ],
      sentimentHistory: [{ score: -0.9, sentiment: "Critical" }],
      escalationHistory: [{ status: "Open", level: "Critical" }],
      tickets: [{ status: "Escalated" }]
    });

    expect(result.escalationRisk.level).toBe("Critical");
    expect(result.escalationRisk.score).toBeGreaterThanOrEqual(78);
    expect(result.recommendedOwner).toBe("Escalation Manager");
    expect(result.slaRisk).toBe("Immediate");
  });
});
