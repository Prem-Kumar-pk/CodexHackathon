import { analyzeSentiment, criticalKeywords } from "../src/services/sentimentService.js";

describe("sentimentService", () => {
  test("classifies high-risk language as critical", async () => {
    const result = await analyzeSentiment({
      message: "Worst service. I need a refund immediately or I will take legal action."
    });

    expect(result.sentiment).toBe("Critical");
    expect(result.score).toBeLessThanOrEqual(-0.75);
    expect(result.keywords).toEqual(
      expect.arrayContaining(["refund immediately", "worst service", "legal action"])
    );
  });

  test("classifies appreciative language as positive", async () => {
    const result = await analyzeSentiment({
      message: "Thanks, the walkthrough was helpful and the issue is resolved."
    });

    expect(result.sentiment).toBe("Positive");
    expect(result.score).toBeGreaterThan(0);
  });

  test("keeps escalation keywords explicit and reviewable", () => {
    expect(criticalKeywords).toEqual(
      expect.arrayContaining(["cancel account", "refund immediately", "worst service", "legal action"])
    );
  });
});
