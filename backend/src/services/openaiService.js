import { config } from "../config/env.js";

export async function requestOpenAIJson({ system, user, schema }) {
  if (!config.openaiApiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.openaiModel,
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      text: {
        format: {
          type: "json_schema",
          name: schema.name,
          strict: true,
          schema: schema.value
        }
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const text = extractText(data);
  return text ? JSON.parse(text) : null;
}

function extractText(data) {
  if (data.output_text) return data.output_text;

  const output = data.output || [];
  for (const item of output) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        return content.text;
      }
    }
  }

  return "";
}
