import { requestOpenAIJson } from "./openaiService.js";

export async function summarizeConversation({ customer, interactions = [] }) {
  try {
    const aiResult = await requestOpenAIJson({
      system:
        "You summarize support conversations for agents. Return JSON with issue, resolution, customerMood, and nextAction.",
      user: JSON.stringify({ customer, interactions }),
      schema: {
        name: "support_conversation_summary",
        value: {
          type: "object",
          additionalProperties: false,
          required: ["issue", "resolution", "customerMood", "nextAction"],
          properties: {
            issue: { type: "string" },
            resolution: { type: "string" },
            customerMood: { type: "string" },
            nextAction: { type: "string" }
          }
        }
      }
    });

    if (aiResult) return aiResult;
  } catch (error) {
    console.warn(error.message);
  }

  const latest = interactions[interactions.length - 1];
  return {
    issue: latest?.message || "No active issue recorded yet.",
    resolution: latest?.status === "Resolved" ? "The latest interaction is marked resolved." : "Resolution is pending.",
    customerMood: latest?.sentiment || "Neutral",
    nextAction:
      latest?.priority === "Critical"
        ? "Escalate and respond with ownership within the SLA window."
        : "Send an acknowledgement and continue triage."
  };
}
