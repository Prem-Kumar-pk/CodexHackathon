TRUNCATE TABLE escalations, sentiment_history, tickets, interactions, customers, users RESTART IDENTITY CASCADE;

INSERT INTO users (id, name, email, password_hash, role, status)
VALUES
  ('8f7fcb52-6f76-4524-b5ab-0488393b39b0', 'Avery Agent', 'agent@supporthub.local', 'pbkdf2_sha256$120000$support-agent-salt$43115e92edf240368c62bec190067e06cea6a4810a4756cf56147fe0171db9da', 'agent', 'active'),
  ('19570650-5fd7-4bf0-a302-344899271604', 'Sam Supervisor', 'supervisor@supporthub.local', 'pbkdf2_sha256$120000$support-supervisor-salt$87618033088328aa95779950786b0476818038f05b539e036fd53faf7e65992f', 'supervisor', 'active');

INSERT INTO customers (id, name, email, phone, segment, lifetime_value, location, created_at)
VALUES
  ('c3d18752-93d5-45fd-8d81-fb45e02f7545', 'Jordan Lee', 'jordan.lee@example.com', '+1 415 555 0188', 'Enterprise', 18450, 'San Francisco, CA', now() - interval '820 hours'),
  ('a9a1c7d4-8d09-41e8-81b5-48b8c24f5d8a', 'Priya Raman', 'priya.raman@example.com', '+91 98765 43210', 'Growth', 6250, 'Bengaluru, IN', now() - interval '460 hours'),
  ('7c27519a-d960-4023-b9cf-958dc15ab14e', 'Morgan Patel', 'morgan.patel@example.com', '+1 212 555 0134', 'Startup', 2100, 'New York, NY', now() - interval '210 hours'),
  ('ad5e5309-a7ff-43b7-bd51-910c7e7ae89e', 'Casey Novak', 'casey.novak@example.com', '+44 20 7946 0991', 'Enterprise', 24300, 'London, UK', now() - interval '1120 hours');

INSERT INTO interactions (
  id,
  customer_id,
  agent_id,
  channel,
  timestamp,
  message,
  sentiment,
  sentiment_score,
  sentiment_trend,
  priority,
  status
)
VALUES
  (
    '5afc67d3-4547-4f31-861a-622e955827bb',
    'c3d18752-93d5-45fd-8d81-fb45e02f7545',
    '8f7fcb52-6f76-4524-b5ab-0488393b39b0',
    'Email',
    now() - interval '8 hours',
    'Our invoice export is failing again. The finance team needs this before close of business.',
    'Negative',
    -0.46,
    'Declining',
    'High',
    'Open'
  ),
  (
    'f5929526-b4ec-4d21-ab12-9554b1d37635',
    'c3d18752-93d5-45fd-8d81-fb45e02f7545',
    '8f7fcb52-6f76-4524-b5ab-0488393b39b0',
    'Chat',
    now() - interval '6 hours',
    'Thanks for the quick acknowledgement. Please keep me updated.',
    'Neutral',
    0.08,
    'Improving',
    'Medium',
    'In Progress'
  ),
  (
    'd6285d95-2f53-4f87-8e22-97c14b6b3f78',
    'a9a1c7d4-8d09-41e8-81b5-48b8c24f5d8a',
    '8f7fcb52-6f76-4524-b5ab-0488393b39b0',
    'Social Media',
    now() - interval '4 hours',
    'Worst service. I want a refund immediately or I am posting the whole thread.',
    'Critical',
    -0.92,
    'Declining',
    'Critical',
    'Open'
  ),
  (
    'dc14bb06-3657-469f-b59a-c5d8e6390600',
    '7c27519a-d960-4023-b9cf-958dc15ab14e',
    '8f7fcb52-6f76-4524-b5ab-0488393b39b0',
    'Phone Transcript',
    now() - interval '3 hours',
    'The onboarding call was helpful. We need a walkthrough of analytics next week.',
    'Positive',
    0.68,
    'Stable',
    'Low',
    'Open'
  ),
  (
    'c18f14f6-6b87-4902-95eb-aed1ddaf77dd',
    'ad5e5309-a7ff-43b7-bd51-910c7e7ae89e',
    '8f7fcb52-6f76-4524-b5ab-0488393b39b0',
    'Email',
    now() - interval '2 hours',
    'We are reviewing renewal options and need a security questionnaire response today.',
    'Neutral',
    0.02,
    'Stable',
    'Medium',
    'In Progress'
  );

INSERT INTO sentiment_history (customer_id, interaction_id, sentiment, score, trend, created_at)
SELECT customer_id, id, sentiment, sentiment_score, sentiment_trend, timestamp
FROM interactions;

INSERT INTO tickets (id, customer_id, interaction_id, assigned_agent_id, subject, priority, status, created_at, updated_at)
VALUES
  (
    '735c6e11-66d9-44ad-8904-355b055ee352',
    'a9a1c7d4-8d09-41e8-81b5-48b8c24f5d8a',
    'd6285d95-2f53-4f87-8e22-97c14b6b3f78',
    '8f7fcb52-6f76-4524-b5ab-0488393b39b0',
    'Refund demand on social media',
    'Critical',
    'Escalated',
    now() - interval '4 hours',
    now() - interval '3.5 hours'
  ),
  (
    '433bdf02-5cf5-4951-b2ac-ea95539205c0',
    'c3d18752-93d5-45fd-8d81-fb45e02f7545',
    '5afc67d3-4547-4f31-861a-622e955827bb',
    '8f7fcb52-6f76-4524-b5ab-0488393b39b0',
    'Invoice export failure',
    'High',
    'In Progress',
    now() - interval '8 hours',
    now() - interval '6 hours'
  );

INSERT INTO escalations (id, customer_id, interaction_id, ticket_id, level, reason, keywords, status, created_at)
VALUES
  (
    'f70a2ebb-30cf-4aef-a296-9ed4911cf912',
    'a9a1c7d4-8d09-41e8-81b5-48b8c24f5d8a',
    'd6285d95-2f53-4f87-8e22-97c14b6b3f78',
    '735c6e11-66d9-44ad-8904-355b055ee352',
    'Critical',
    'Critical sentiment and refund keyword detected.',
    ARRAY['refund immediately', 'worst service'],
    'Open',
    now() - interval '4 hours'
  );
