import { requestOpenAIJson } from "./openaiService.js";

export async function generateResponses({ customer, interaction, history = [] }) {
  try {
    const aiResult = await requestOpenAIJson({
      system:
        "You draft concise customer support replies. Return JSON with professional, empathetic, and escalation reply options.",
      user: JSON.stringify({ customer, interaction, recentHistory: history.slice(-6) }),
      schema: {
        name: "support_response_suggestions",
        value: {
          type: "object",
          additionalProperties: false,
          required: ["professional", "empathetic", "escalation"],
          properties: {
            professional: { type: "string" },
            empathetic: { type: "string" },
            escalation: { type: "string" }
          }
        }
      }
    });

    if (aiResult) return aiResult;
  } catch (error) {
    console.warn(error.message);
  }

  return fallbackResponses(customer, interaction);
}

function fallbackResponses(customer, interaction) {
  const name = customer?.name?.split(" ")[0] || "there";
  const issue = interaction?.message || "your request";

  return {
    professional: `Hi ${name}, thank you for reaching out. I am reviewing the details about "${issue.slice(
      0,
      90
    )}" and will follow up with the next update shortly.`,
    empathetic: `Hi ${name}, I understand how frustrating this must feel. I am going to look into this carefully and keep you updated until we have a clear path forward.`,
    escalation: `Hi ${name}, I am escalating this to the right specialist now due to the urgency and impact. We will prioritize the case and share the next action as soon as possible.`
  };
}
