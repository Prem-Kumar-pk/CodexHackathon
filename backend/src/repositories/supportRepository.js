import { v4 as uuid } from "uuid";
import { query } from "../db/pool.js";
import { config } from "../config/env.js";
import {
  mockCustomers,
  mockEscalations,
  mockInteractions,
  mockSentimentHistory,
  mockTickets,
  mockUsers
} from "../data/mockData.js";

const channelRank = {
  Email: 1,
  Chat: 2,
  "Social Media": 3,
  "Phone Transcript": 4
};

function toInteraction(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    channel: row.channel,
    timestamp: row.timestamp,
    message: row.message,
    sentiment: row.sentiment,
    sentimentScore: Number(row.sentiment_score),
    sentimentTrend: row.sentiment_trend,
    priority: row.priority,
    status: row.status,
    agentId: row.agent_id
  };
}

function toCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    segment: row.segment,
    lifetimeValue: Number(row.lifetime_value || 0),
    location: row.location,
    createdAt: row.created_at
  };
}

function toEscalation(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    interactionId: row.interaction_id,
    ticketId: row.ticket_id,
    level: row.level,
    reason: row.reason,
    keywords: row.keywords || [],
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at
  };
}

function toSentiment(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    interactionId: row.interaction_id,
    sentiment: row.sentiment,
    score: Number(row.score),
    trend: row.trend,
    createdAt: row.created_at
  };
}

function applyInteractionFilters(interactions, filters = {}) {
  const { search, channel, status, sentiment, customerId } = filters;

  return interactions
    .filter((item) => {
      if (customerId && item.customerId !== customerId) return false;
      if (channel && channel !== "All" && item.channel !== channel) return false;
      if (status && status !== "All" && item.status !== status) return false;
      if (sentiment && sentiment !== "All" && item.sentiment !== sentiment) return false;
      if (!search) return true;

      const needle = search.toLowerCase();
      return (
        item.customerName.toLowerCase().includes(needle) ||
        item.message.toLowerCase().includes(needle) ||
        item.channel.toLowerCase().includes(needle)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function listInteractions(filters = {}) {
  if (config.useMockDb) {
    return applyInteractionFilters(mockInteractions, filters);
  }

  const result = await query(
    `SELECT
        i.id,
        i.customer_id,
        c.name AS customer_name,
        i.channel,
        i.timestamp,
        i.message,
        i.sentiment,
        i.sentiment_score,
        i.sentiment_trend,
        i.priority,
        i.status,
        i.agent_id
      FROM interactions i
      JOIN customers c ON c.id = i.customer_id
      WHERE ($1::uuid IS NULL OR i.customer_id = $1)
        AND ($2::text IS NULL OR i.channel = $2)
        AND ($3::text IS NULL OR i.status = $3)
        AND ($4::text IS NULL OR i.sentiment = $4)
        AND (
          $5::text IS NULL OR
          c.name ILIKE '%' || $5 || '%' OR
          i.message ILIKE '%' || $5 || '%' OR
          i.channel ILIKE '%' || $5 || '%'
        )
      ORDER BY i.timestamp DESC`,
    [
      filters.customerId || null,
      filters.channel && filters.channel !== "All" ? filters.channel : null,
      filters.status && filters.status !== "All" ? filters.status : null,
      filters.sentiment && filters.sentiment !== "All" ? filters.sentiment : null,
      filters.search || null
    ]
  );

  return result.rows.map(toInteraction);
}

export async function getInteractionById(id) {
  const interactions = await listInteractions();
  return interactions.find((interaction) => interaction.id === id) || null;
}

export async function createInteraction(payload) {
  const id = uuid();
  const timestamp = new Date().toISOString();

  if (config.useMockDb) {
    const customer = mockCustomers.find((item) => item.id === payload.customerId);
    const interaction = {
      id,
      customerId: payload.customerId,
      customerName: customer?.name || payload.customerName || "Unknown Customer",
      channel: payload.channel,
      timestamp,
      message: payload.message,
      sentiment: payload.sentiment,
      sentimentScore: payload.sentimentScore,
      sentimentTrend: payload.sentimentTrend,
      priority: payload.priority,
      status: payload.status || "Open",
      agentId: payload.agentId || null
    };

    mockInteractions.unshift(interaction);
    mockSentimentHistory.push({
      id: uuid(),
      customerId: interaction.customerId,
      interactionId: interaction.id,
      sentiment: interaction.sentiment,
      score: interaction.sentimentScore,
      trend: interaction.sentimentTrend,
      createdAt: interaction.timestamp
    });
    return interaction;
  }

  const result = await query(
    `INSERT INTO interactions (
        id,
        customer_id,
        channel,
        timestamp,
        message,
        sentiment,
        sentiment_score,
        sentiment_trend,
        priority,
        status,
        agent_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
    [
      id,
      payload.customerId,
      payload.channel,
      timestamp,
      payload.message,
      payload.sentiment,
      payload.sentimentScore,
      payload.sentimentTrend,
      payload.priority,
      payload.status || "Open",
      payload.agentId || null
    ]
  );

  await query(
    `INSERT INTO sentiment_history (customer_id, interaction_id, sentiment, score, trend)
     VALUES ($1, $2, $3, $4, $5)`,
    [payload.customerId, id, payload.sentiment, payload.sentimentScore, payload.sentimentTrend]
  );

  const [interaction] = await listInteractions({ customerId: payload.customerId });
  return interaction || toInteraction(result.rows[0]);
}

export async function listCustomers() {
  if (config.useMockDb) {
    return mockCustomers
      .map((customer) => {
        const latestInteraction = applyInteractionFilters(mockInteractions, {
          customerId: customer.id
        })[0];
        const openTickets = mockTickets.filter(
          (ticket) => ticket.customerId === customer.id && ticket.status !== "Resolved"
        ).length;

        return {
          ...customer,
          latestInteraction,
          openTickets,
          lastChannelRank: latestInteraction ? channelRank[latestInteraction.channel] : 0
        };
      })
      .sort((a, b) => {
        const aTime = a.latestInteraction ? new Date(a.latestInteraction.timestamp).getTime() : 0;
        const bTime = b.latestInteraction ? new Date(b.latestInteraction.timestamp).getTime() : 0;
        return bTime - aTime;
      });
  }

  const result = await query(
    `SELECT
        c.*,
        COALESCE(open_ticket_counts.count, 0) AS open_tickets,
        latest.id AS latest_id,
        latest.channel AS latest_channel,
        latest.timestamp AS latest_timestamp,
        latest.message AS latest_message,
        latest.sentiment AS latest_sentiment,
        latest.sentiment_score AS latest_sentiment_score,
        latest.sentiment_trend AS latest_sentiment_trend,
        latest.priority AS latest_priority,
        latest.status AS latest_status,
        latest.agent_id AS latest_agent_id
      FROM customers c
      LEFT JOIN LATERAL (
        SELECT *
        FROM interactions i
        WHERE i.customer_id = c.id
        ORDER BY i.timestamp DESC
        LIMIT 1
      ) latest ON true
      LEFT JOIN (
        SELECT customer_id, count(*)::int
        FROM tickets
        WHERE status <> 'Resolved'
        GROUP BY customer_id
      ) open_ticket_counts ON open_ticket_counts.customer_id = c.id
      ORDER BY latest.timestamp DESC NULLS LAST, c.name ASC`
  );

  return result.rows.map((row) => ({
    ...toCustomer(row),
    openTickets: Number(row.open_tickets || 0),
    latestInteraction: row.latest_id
      ? {
          id: row.latest_id,
          customerId: row.id,
          customerName: row.name,
          channel: row.latest_channel,
          timestamp: row.latest_timestamp,
          message: row.latest_message,
          sentiment: row.latest_sentiment,
          sentimentScore: Number(row.latest_sentiment_score),
          sentimentTrend: row.latest_sentiment_trend,
          priority: row.latest_priority,
          status: row.latest_status,
          agentId: row.latest_agent_id
        }
      : null
  }));
}

export async function getCustomer360(id) {
  if (config.useMockDb) {
    const customer = mockCustomers.find((item) => item.id === id);
    if (!customer) return null;

    return {
      ...customer,
      interactions: applyInteractionFilters(mockInteractions, { customerId: id }).reverse(),
      sentimentHistory: mockSentimentHistory
        .filter((item) => item.customerId === id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      escalationHistory: mockEscalations
        .filter((item) => item.customerId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      tickets: mockTickets.filter((ticket) => ticket.customerId === id)
    };
  }

  const customerResult = await query("SELECT * FROM customers WHERE id = $1", [id]);
  if (!customerResult.rows[0]) return null;

  const [interactionsResult, sentimentResult, escalationsResult, ticketsResult] = await Promise.all([
    query(
      `SELECT i.*, c.name AS customer_name
       FROM interactions i
       JOIN customers c ON c.id = i.customer_id
       WHERE i.customer_id = $1
       ORDER BY i.timestamp ASC`,
      [id]
    ),
    query(
      `SELECT * FROM sentiment_history WHERE customer_id = $1 ORDER BY created_at ASC`,
      [id]
    ),
    query(
      `SELECT * FROM escalations WHERE customer_id = $1 ORDER BY created_at DESC`,
      [id]
    ),
    query(
      `SELECT * FROM tickets WHERE customer_id = $1 ORDER BY created_at DESC`,
      [id]
    )
  ]);

  return {
    ...toCustomer(customerResult.rows[0]),
    interactions: interactionsResult.rows.map(toInteraction),
    sentimentHistory: sentimentResult.rows.map(toSentiment),
    escalationHistory: escalationsResult.rows.map(toEscalation),
    tickets: ticketsResult.rows.map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      interactionId: row.interaction_id,
      assignedAgentId: row.assigned_agent_id,
      subject: row.subject,
      priority: row.priority,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  };
}

export async function createEscalation({ interactionId, customerId, level, reason, keywords = [] }) {
  const id = uuid();
  const ticketId = uuid();
  const createdAt = new Date().toISOString();

  if (config.useMockDb) {
    const interaction = mockInteractions.find((item) => item.id === interactionId);
    const ticket = {
      id: ticketId,
      customerId,
      interactionId,
      assignedAgentId: interaction?.agentId || mockUsers[0]?.id || null,
      subject: reason.slice(0, 80),
      priority: level,
      status: "Escalated",
      createdAt,
      updatedAt: createdAt
    };
    const escalation = {
      id,
      customerId,
      interactionId,
      ticketId,
      level,
      reason,
      keywords,
      status: "Open",
      createdAt,
      resolvedAt: null
    };

    mockTickets.unshift(ticket);
    mockEscalations.unshift(escalation);
    return escalation;
  }

  await query(
    `INSERT INTO tickets (id, customer_id, interaction_id, priority, status, subject)
     VALUES ($1, $2, $3, $4, 'Escalated', $5)`,
    [ticketId, customerId, interactionId, level, reason.slice(0, 120)]
  );

  const result = await query(
    `INSERT INTO escalations (id, customer_id, interaction_id, ticket_id, level, reason, keywords, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'Open')
     RETURNING *`,
    [id, customerId, interactionId, ticketId, level, reason, keywords]
  );

  return toEscalation(result.rows[0]);
}

export async function getAnalytics() {
  const interactions = await listInteractions();
  const customers = await listCustomers();

  if (config.useMockDb) {
    const openTickets = mockTickets.filter((ticket) => ticket.status !== "Resolved").length;
    const escalatedCases = mockEscalations.filter((item) => item.status !== "Resolved").length;
    return buildAnalytics({
      interactions,
      customers,
      users: mockUsers,
      tickets: mockTickets,
      escalations: mockEscalations,
      openTickets,
      escalatedCases
    });
  }

  const [usersResult, ticketsResult, escalationsResult] = await Promise.all([
    query("SELECT id, name, role, status FROM users"),
    query("SELECT * FROM tickets"),
    query("SELECT * FROM escalations")
  ]);

  return buildAnalytics({
    interactions,
    customers,
    users: usersResult.rows,
    tickets: ticketsResult.rows,
    escalations: escalationsResult.rows.map(toEscalation),
    openTickets: ticketsResult.rows.filter((ticket) => ticket.status !== "Resolved").length,
    escalatedCases: escalationsResult.rows.filter((item) => item.status !== "Resolved").length
  });
}

function buildAnalytics({ interactions, customers, users, tickets, escalations, openTickets, escalatedCases }) {
  const activeAgents = users.filter((user) => user.role === "agent" && user.status === "active").length;
  const avgResponseTime = tickets.length
    ? Math.round(
        tickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt || ticket.created_at).getTime();
          const updated = new Date(ticket.updatedAt || ticket.updated_at || Date.now()).getTime();
          return sum + Math.max(12, (updated - created) / (60 * 1000));
        }, 0) / tickets.length
      )
    : 0;

  const sentimentDistribution = countBy(interactions, "sentiment");
  const channelDistribution = countBy(interactions, "channel");
  const escalationDistribution = countBy(escalations, "level");

  const sentimentTrends = interactions
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      score: item.sentimentScore,
      sentiment: item.sentiment
    }));

  return {
    metrics: {
      activeAgents,
      openTickets,
      escalatedCases,
      averageResponseTimeMinutes: avgResponseTime,
      totalCustomers: customers.length,
      totalInteractions: interactions.length
    },
    sentimentDistribution,
    channelDistribution,
    escalationAnalytics: escalationDistribution,
    sentimentTrends
  };
}

function countBy(items, key) {
  return Object.entries(
    items.reduce((acc, item) => {
      const value = item[key] || "Unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
}
