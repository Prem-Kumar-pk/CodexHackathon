import { v4 as uuid } from "uuid";
import { createPasswordHash } from "../utils/password.js";

const now = Date.now();
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();

export const mockUsers = [
  {
    id: "8f7fcb52-6f76-4524-b5ab-0488393b39b0",
    name: "Avery Agent",
    email: "agent@supporthub.local",
    passwordHash: createPasswordHash("password123", "support-agent-salt"),
    role: "agent",
    status: "active"
  },
  {
    id: "19570650-5fd7-4bf0-a302-344899271604",
    name: "Sam Supervisor",
    email: "supervisor@supporthub.local",
    passwordHash: createPasswordHash("password123", "support-supervisor-salt"),
    role: "supervisor",
    status: "active"
  }
];

export const mockCustomers = [
  {
    id: "c3d18752-93d5-45fd-8d81-fb45e02f7545",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    phone: "+1 415 555 0188",
    segment: "Enterprise",
    lifetimeValue: 18450,
    location: "San Francisco, CA",
    createdAt: hoursAgo(820)
  },
  {
    id: "a9a1c7d4-8d09-41e8-81b5-48b8c24f5d8a",
    name: "Priya Raman",
    email: "priya.raman@example.com",
    phone: "+91 98765 43210",
    segment: "Growth",
    lifetimeValue: 6250,
    location: "Bengaluru, IN",
    createdAt: hoursAgo(460)
  },
  {
    id: "7c27519a-d960-4023-b9cf-958dc15ab14e",
    name: "Morgan Patel",
    email: "morgan.patel@example.com",
    phone: "+1 212 555 0134",
    segment: "Startup",
    lifetimeValue: 2100,
    location: "New York, NY",
    createdAt: hoursAgo(210)
  },
  {
    id: "ad5e5309-a7ff-43b7-bd51-910c7e7ae89e",
    name: "Casey Novak",
    email: "casey.novak@example.com",
    phone: "+44 20 7946 0991",
    segment: "Enterprise",
    lifetimeValue: 24300,
    location: "London, UK",
    createdAt: hoursAgo(1120)
  }
];

export const mockInteractions = [
  {
    id: "5afc67d3-4547-4f31-861a-622e955827bb",
    customerId: mockCustomers[0].id,
    customerName: mockCustomers[0].name,
    channel: "Email",
    timestamp: hoursAgo(8),
    message: "Our invoice export is failing again. The finance team needs this before close of business.",
    sentiment: "Negative",
    sentimentScore: -0.46,
    sentimentTrend: "Declining",
    priority: "High",
    status: "Open",
    agentId: mockUsers[0].id
  },
  {
    id: "f5929526-b4ec-4d21-ab12-9554b1d37635",
    customerId: mockCustomers[0].id,
    customerName: mockCustomers[0].name,
    channel: "Chat",
    timestamp: hoursAgo(6),
    message: "Thanks for the quick acknowledgement. Please keep me updated.",
    sentiment: "Neutral",
    sentimentScore: 0.08,
    sentimentTrend: "Improving",
    priority: "Medium",
    status: "In Progress",
    agentId: mockUsers[0].id
  },
  {
    id: "d6285d95-2f53-4f87-8e22-97c14b6b3f78",
    customerId: mockCustomers[1].id,
    customerName: mockCustomers[1].name,
    channel: "Social Media",
    timestamp: hoursAgo(4),
    message: "Worst service. I want a refund immediately or I am posting the whole thread.",
    sentiment: "Critical",
    sentimentScore: -0.92,
    sentimentTrend: "Declining",
    priority: "Critical",
    status: "Open",
    agentId: mockUsers[0].id
  },
  {
    id: "dc14bb06-3657-469f-b59a-c5d8e6390600",
    customerId: mockCustomers[2].id,
    customerName: mockCustomers[2].name,
    channel: "Phone Transcript",
    timestamp: hoursAgo(3),
    message: "The onboarding call was helpful. We need a walkthrough of analytics next week.",
    sentiment: "Positive",
    sentimentScore: 0.68,
    sentimentTrend: "Stable",
    priority: "Low",
    status: "Open",
    agentId: mockUsers[0].id
  },
  {
    id: "c18f14f6-6b87-4902-95eb-aed1ddaf77dd",
    customerId: mockCustomers[3].id,
    customerName: mockCustomers[3].name,
    channel: "Email",
    timestamp: hoursAgo(2),
    message: "We are reviewing renewal options and need a security questionnaire response today.",
    sentiment: "Neutral",
    sentimentScore: 0.02,
    sentimentTrend: "Stable",
    priority: "Medium",
    status: "In Progress",
    agentId: mockUsers[0].id
  }
];

export const mockTickets = [
  {
    id: "735c6e11-66d9-44ad-8904-355b055ee352",
    customerId: mockCustomers[1].id,
    interactionId: mockInteractions[2].id,
    assignedAgentId: mockUsers[0].id,
    subject: "Refund demand on social media",
    priority: "Critical",
    status: "Escalated",
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(3.5)
  },
  {
    id: "433bdf02-5cf5-4951-b2ac-ea95539205c0",
    customerId: mockCustomers[0].id,
    interactionId: mockInteractions[0].id,
    assignedAgentId: mockUsers[0].id,
    subject: "Invoice export failure",
    priority: "High",
    status: "In Progress",
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(6)
  }
];

export const mockSentimentHistory = mockInteractions.map((interaction) => ({
  id: uuid(),
  customerId: interaction.customerId,
  interactionId: interaction.id,
  sentiment: interaction.sentiment,
  score: interaction.sentimentScore,
  trend: interaction.sentimentTrend,
  createdAt: interaction.timestamp
}));

export const mockEscalations = [
  {
    id: "f70a2ebb-30cf-4aef-a296-9ed4911cf912",
    customerId: mockCustomers[1].id,
    interactionId: mockInteractions[2].id,
    ticketId: mockTickets[0].id,
    level: "Critical",
    reason: "Critical sentiment and refund keyword detected.",
    keywords: ["refund immediately", "worst service"],
    status: "Open",
    createdAt: hoursAgo(4),
    resolvedAt: null
  }
];
