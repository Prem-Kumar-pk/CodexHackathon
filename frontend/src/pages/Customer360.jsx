import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import MoodIcon from "@mui/icons-material/Mood";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api/client.js";
import ChannelPill from "../components/ChannelPill.jsx";
import MetricCard from "../components/MetricCard.jsx";
import SentimentBadge from "../components/SentimentBadge.jsx";

export default function Customer360() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    api.get(`/customers/${id}`).then(({ data }) => setCustomer(data.data));
  }, [id]);

  if (!customer) {
    return (
      <Box sx={{ px: 3 }}>
        <Typography>Loading customer...</Typography>
      </Box>
    );
  }

  const sentimentData = customer.sentimentHistory.map((item, index) => ({
    name: index + 1,
    score: item.score,
    sentiment: item.sentiment
  }));

  return (
    <Box sx={{ px: { xs: 2, lg: 3 }, pb: 3 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              {customer.name}
            </Typography>
            <Typography color="text.secondary">
              {customer.email} · {customer.phone} · {customer.location}
            </Typography>
          </Box>
          <Button component={Link} to="/workspace" startIcon={<ArrowBackIcon />} variant="outlined">
            Workspace
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
            gap: 2
          }}
        >
          <MetricCard label="Segment" value={customer.segment} helper="Customer profile" icon={<LocalActivityIcon color="primary" />} />
          <MetricCard
            label="Lifetime Value"
            value={`$${Number(customer.lifetimeValue).toLocaleString()}`}
            helper="Revenue context"
            icon={<MoodIcon color="success" />}
          />
          <MetricCard
            label="Interactions"
            value={customer.interactions.length}
            helper={`${customer.escalationHistory.length} escalations`}
            icon={<HistoryIcon color="warning" />}
          />
          <MetricCard
            label="AI Health"
            value={customer.intelligence?.healthScore ?? "-"}
            helper={`${customer.intelligence?.escalationRisk?.level || "Low"} risk`}
            icon={<MoodIcon color="secondary" />}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.25fr 0.75fr" },
            gap: 2
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={900} gutterBottom>
                Sentiment History
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[-1, 1]} />
                    <ChartTooltip />
                    <Line dataKey="score" stroke="#0f766e" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={900} gutterBottom>
                Escalation History
              </Typography>
              <Stack spacing={1.5}>
                {customer.escalationHistory.length ? (
                  customer.escalationHistory.map((item) => (
                    <Box key={item.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                      <Typography fontWeight={800}>{item.level}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.reason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.createdAt).toLocaleString()} · {item.status}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">No escalation history.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={900} gutterBottom>
              Previous Conversations
            </Typography>
            <Stack divider={<Divider />} spacing={1.5}>
              {customer.interactions.map((interaction) => (
                <Stack key={interaction.id} spacing={1}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <ChannelPill channel={interaction.channel} />
                    <SentimentBadge sentiment={interaction.sentiment} />
                  </Stack>
                  <Typography>{interaction.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(interaction.timestamp).toLocaleString()} · {interaction.priority} · {interaction.status}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
