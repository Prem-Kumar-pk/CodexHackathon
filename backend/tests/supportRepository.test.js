import {
  getAnalytics,
  getCustomer360,
  listCustomers,
  listInteractions
} from "../src/repositories/supportRepository.js";

describe("supportRepository mock data", () => {
  test("lists customers with latest interaction context", async () => {
    const customers = await listCustomers();

    expect(customers).toHaveLength(4);
    expect(customers[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        latestInteraction: expect.any(Object),
        openTickets: expect.any(Number)
      })
    );
  });

  test("filters interactions by sentiment", async () => {
    const interactions = await listInteractions({ sentiment: "Critical" });

    expect(interactions).toHaveLength(1);
    expect(interactions[0]).toMatchObject({
      customerName: "Priya Raman",
      sentiment: "Critical",
      priority: "Critical"
    });
  });

  test("returns customer 360 with conversation, sentiment, and escalation history", async () => {
    const customer = await getCustomer360("a9a1c7d4-8d09-41e8-81b5-48b8c24f5d8a");

    expect(customer.name).toBe("Priya Raman");
    expect(customer.interactions.length).toBeGreaterThan(0);
    expect(customer.sentimentHistory.length).toBeGreaterThan(0);
    expect(customer.escalationHistory.length).toBeGreaterThan(0);
  });

  test("builds supervisor analytics from support data", async () => {
    const analytics = await getAnalytics();

    expect(analytics.metrics).toMatchObject({
      activeAgents: 1,
      totalCustomers: 4,
      totalInteractions: 5
    });
    expect(analytics.sentimentDistribution).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Critical", value: 1 })])
    );
  });
});
