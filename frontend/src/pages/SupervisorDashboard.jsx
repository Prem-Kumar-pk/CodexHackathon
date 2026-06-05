import GroupsIcon from "@mui/icons-material/Groups";
import SpeedIcon from "@mui/icons-material/Speed";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api/client.js";
import MetricCard from "../components/MetricCard.jsx";

const chartColors = ["#0f766e", "#7c3aed", "#b45309", "#b91c1c", "#2563eb"];

export default function SupervisorDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get("/analytics").then(({ data }) => setAnalytics(data.data));
  }, []);

  if (!analytics) {
    return (
      <Box sx={{ px: 3 }}>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  const { metrics } = analytics;

  return (
    <Box sx={{ px: { xs: 2, lg: 3 }, pb: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Supervisor Dashboard
          </Typography>
          <Typography color="text.secondary">Real-time service health and escalation analytics</Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(6, 1fr)" },
            gap: 2
          }}
        >
          <MetricCard label="Active Agents" value={metrics.activeAgents} helper="Online and available" icon={<SupportAgentIcon color="primary" />} />
          <MetricCard label="Open Tickets" value={metrics.openTickets} helper={`${metrics.totalInteractions} interactions`} icon={<GroupsIcon color="secondary" />} />
          <MetricCard label="Escalated Cases" value={metrics.escalatedCases} helper="Open escalations" icon={<WarningAmberIcon color="warning" />} />
          <MetricCard
            label="Avg Response"
            value={`${metrics.averageResponseTimeMinutes}m`}
            helper="Ticket update interval"
            icon={<SpeedIcon color="success" />}
          />
          <MetricCard label="Avg Health" value={metrics.averageHealthScore} helper="AI customer health" icon={<SpeedIcon color="primary" />} />
          <MetricCard label="At Risk" value={metrics.atRiskCustomers} helper="High or critical risk" icon={<WarningAmberIcon color="error" />} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "1.2fr 0.8fr" },
            gap: 2
          }}
        >
          <ChartCard title="Sentiment Trends">
            <ResponsiveContainer width="100%" height={310}>
              <LineChart data={analytics.sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Channel Distribution">
            <ResponsiveContainer width="100%" height={310}>
              <PieChart>
                <Pie data={analytics.channelDistribution} dataKey="value" nameKey="name" outerRadius={105} label>
                  {analytics.channelDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2
          }}
        >
          <ChartCard title="Sentiment Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.sentimentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Escalation Analytics">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.escalationAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#b45309" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Customer Risk Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      </Stack>
    </Box>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={900} gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}
