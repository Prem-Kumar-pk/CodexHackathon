import {
  getAnalytics,
  getCustomer360,
  getInteractionById,
  listCustomers,
  listInteractions
} from "../repositories/supportRepository.js";
import { emitEvent } from "../realtime/socket.js";
import { analyzeSentiment } from "../services/sentimentService.js";
import { evaluateEscalation, escalateInteraction } from "../services/escalationService.js";
import { generateResponses } from "../services/responseService.js";
import { summarizeConversation } from "../services/summaryService.js";
import { createInteraction } from "../repositories/supportRepository.js";

export async function getInteractions(req, res, next) {
  try {
    const interactions = await listInteractions(req.query);
    res.json({ data: interactions });
  } catch (error) {
    next(error);
  }
}

export async function getCustomers(req, res, next) {
  try {
    const customers = await listCustomers();
    res.json({ data: customers });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const customer = await getCustomer360(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
}

export async function postMessage(req, res, next) {
  try {
    const { customerId, channel, message, status = "Open" } = req.body;
    if (!customerId || !channel || !message) {
      return res.status(400).json({ error: "customerId, channel, and message are required" });
    }

    const customer = await getCustomer360(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const history = customer.interactions || [];
    const sentiment = await analyzeSentiment({ message, history });
    const priority = derivePriority(sentiment.sentiment);
    const interaction = await createInteraction({
      customerId,
      channel,
      message,
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score,
      sentimentTrend: sentiment.trend,
      priority,
      status,
      agentId: req.user?.id
    });

    emitEvent("new-customer-message", {
      customerId,
      interaction,
      message: `New ${channel} interaction from ${interaction.customerName}`
    });

    if (sentiment.sentiment === "Critical") {
      emitEvent("critical-sentiment", {
        customerId,
        interaction,
        sentiment,
        message: `${interaction.customerName} has critical sentiment`
      });
    }

    const evaluation = evaluateEscalation({
      interaction,
      history,
      sentimentAnalysis: sentiment
    });

    let escalation = null;
    if (evaluation.shouldEscalate) {
      escalation = await escalateInteraction({
        interactionId: interaction.id,
        customerId,
        level: evaluation.level,
        reason: evaluation.reason,
        keywords: evaluation.keywords
      });

      emitEvent("escalation-triggered", {
        customerId,
        interaction,
        escalation,
        message: `${evaluation.level} escalation triggered for ${interaction.customerName}`
      });
    }

    res.status(201).json({
      data: {
        interaction,
        sentiment,
        escalation
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzeSentimentRequest(req, res, next) {
  try {
    const { message, customerId } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const customer = customerId ? await getCustomer360(customerId) : null;
    const sentiment = await analyzeSentiment({
      message,
      history: customer?.interactions || []
    });

    res.json({ data: sentiment });
  } catch (error) {
    next(error);
  }
}

export async function generateResponseRequest(req, res, next) {
  try {
    const { customerId, interactionId } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }

    const customer = await getCustomer360(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const interaction =
      (interactionId && (await getInteractionById(interactionId))) ||
      customer.interactions?.[customer.interactions.length - 1];

    const responses = await generateResponses({
      customer,
      interaction,
      history: customer.interactions || []
    });

    res.json({ data: responses });
  } catch (error) {
    next(error);
  }
}

export async function escalateRequest(req, res, next) {
  try {
    const { interactionId, customerId, level = "High", reason = "Manual escalation", keywords = [] } = req.body;
    if (!interactionId || !customerId) {
      return res.status(400).json({ error: "interactionId and customerId are required" });
    }

    const escalation = await escalateInteraction({ interactionId, customerId, level, reason, keywords });

    emitEvent("escalation-triggered", {
      customerId,
      escalation,
      message: `${level} escalation created`
    });

    res.status(201).json({ data: escalation });
  } catch (error) {
    next(error);
  }
}

export async function summarizeRequest(req, res, next) {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }

    const customer = await getCustomer360(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const summary = await summarizeConversation({
      customer,
      interactions: customer.interactions || []
    });

    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getAnalyticsRequest(req, res, next) {
  try {
    const analytics = await getAnalytics();
    res.json({ data: analytics });
  } catch (error) {
    next(error);
  }
}

function derivePriority(sentiment) {
  if (sentiment === "Critical") return "Critical";
  if (sentiment === "Negative") return "High";
  if (sentiment === "Neutral") return "Medium";
  return "Low";
}
