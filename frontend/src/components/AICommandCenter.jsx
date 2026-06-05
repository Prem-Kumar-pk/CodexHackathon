import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import InsightsIcon from "@mui/icons-material/Insights";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SummarizeIcon from "@mui/icons-material/Summarize";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";
import SentimentBadge from "./SentimentBadge.jsx";

const riskColor = {
  Low: "success",
  Medium: "warning",
  High: "warning",
  Critical: "error"
};

export default function AICommandCenter({
  busy,
  copyText,
  customer360,
  handleEscalate,
  handleGenerate,
  handleSummary,
  latestInteraction,
  sentimentChartData,
  setReply,
  setSuggestionTab,
  suggestionTab,
  suggestions,
  summary
}) {
  const intelligence = customer360?.intelligence;
  const sentimentScore = latestInteraction
    ? Math.round(((latestInteraction.sentimentScore + 1) / 2) * 100)
    : 50;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: "linear-gradient(135deg, #4f46e5, #0f766e)",
              boxShadow: "0 14px 28px rgba(79, 70, 229, 0.22)",
              animation: "floatUp 3800ms ease-in-out infinite"
            }}
          >
            <PsychologyIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={850}>
              AI Command Center
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Live triage and coaching
            </Typography>
          </Box>
        </Stack>
        {intelligence?.escalationRisk ? (
          <Chip
            size="small"
            color={riskColor[intelligence.escalationRisk.level] || "default"}
            label={`${intelligence.escalationRisk.level} risk`}
          />
        ) : null}
      </Stack>

      {intelligence ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1
          }}
        >
          <InsightTile
            icon={<HealthAndSafetyIcon color="success" />}
            label="Health"
            value={`${intelligence.healthScore}`}
            helper="Customer score"
          />
          <InsightTile
            icon={<InsightsIcon color="warning" />}
            label="Risk"
            value={`${intelligence.escalationRisk.score}%`}
            helper={intelligence.slaRisk}
          />
        </Box>
      ) : null}

      {latestInteraction ? (
        <Box
          sx={{
            border: "1px solid rgba(37, 99, 235, 0.18)",
            borderRadius: 1,
            p: 2,
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(15, 118, 110, 0.08))"
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                Live sentiment
              </Typography>
              <Typography variant="h3" fontWeight={850} lineHeight={1.05}>
                {sentimentScore}
                <Typography component="span" variant="subtitle1" color="text.secondary" fontWeight={800}>
                  /100
                </Typography>
              </Typography>
            </Box>
            <Stack spacing={0.75} alignItems="flex-end">
              <SentimentBadge sentiment={latestInteraction.sentiment} />
              <Chip size="small" icon={<InsightsIcon />} label={latestInteraction.sentimentTrend} variant="outlined" />
            </Stack>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={sentimentScore}
            color={latestInteraction.sentiment === "Critical" ? "error" : "primary"}
            sx={{ height: 9, borderRadius: 8, mt: 1.5 }}
          />
          <Typography variant="caption" color="text.secondary">
            Raw score {latestInteraction.sentimentScore}
          </Typography>
        </Box>
      ) : null}

      {intelligence ? (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1.25,
            background:
              "linear-gradient(135deg, rgba(124, 58, 237, 0.09), rgba(15, 118, 110, 0.08))"
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
            Next best action
          </Typography>
          <Typography variant="body2" fontWeight={650}>
            {intelligence.nextBestAction}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
            <Chip size="small" label={intelligence.intent} />
            <Chip size="small" variant="outlined" label={intelligence.recommendedOwner} />
          </Stack>
        </Box>
      ) : null}

      {latestInteraction ? (
        <Stack spacing={1} sx={{ display: "none" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <SentimentBadge sentiment={latestInteraction.sentiment} />
            <Typography variant="body2" color="text.secondary">
              Trend: {latestInteraction.sentimentTrend}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.round(((latestInteraction.sentimentScore + 1) / 2) * 100)}
            color={latestInteraction.sentiment === "Critical" ? "error" : "primary"}
            sx={{ height: 8, borderRadius: 8 }}
          />
          <Typography variant="caption" color="text.secondary">
            Sentiment score {latestInteraction.sentimentScore}
          </Typography>
        </Stack>
      ) : null}

      <Box sx={{ height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sentimentChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis domain={[-1, 1]} width={32} />
            <ChartTooltip />
            <Line dataKey="score" stroke="#0f766e" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {intelligence?.qualitySignals?.length ? (
        <Stack spacing={0.75}>
          <Typography fontWeight={800} fontSize={15}>
            Quality coach
          </Typography>
          {intelligence.qualitySignals.map((signal) => (
            <Typography key={signal} variant="body2" color="text.secondary">
              {signal}
            </Typography>
          ))}
        </Stack>
      ) : null}

      <Divider />

      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={800} fontSize={15}>
            Suggested replies
          </Typography>
          <Button size="small" startIcon={<AutoAwesomeIcon />} onClick={handleGenerate} disabled={busy}>
            Generate
          </Button>
        </Stack>
        <Tabs
          value={suggestionTab}
          onChange={(event, value) => {
            setSuggestionTab(value);
            if (suggestions?.[value]) setReply(suggestions[value]);
          }}
          variant="fullWidth"
        >
          <Tab value="professional" icon={<WorkOutlineIcon />} iconPosition="start" label="Professional" sx={{ minHeight: 44 }} />
          <Tab value="empathetic" icon={<FavoriteBorderIcon />} iconPosition="start" label="Empathetic" sx={{ minHeight: 44 }} />
          <Tab value="escalation" icon={<ReportProblemOutlinedIcon />} iconPosition="start" label="Escalation" sx={{ minHeight: 44 }} />
        </Tabs>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1.5,
            minHeight: 110,
            bgcolor: "rgba(37, 99, 235, 0.04)"
          }}
        >
          <Typography variant="body2">
            {suggestions?.[suggestionTab] || "Generate a response suggestion for the active conversation."}
          </Typography>
        </Box>
        {suggestions?.[suggestionTab] ? (
          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button size="small" onClick={() => copyText(suggestions[suggestionTab])}>
              Copy
            </Button>
            <Button size="small" variant="outlined" onClick={() => setReply(suggestions[suggestionTab])}>
              Edit
            </Button>
          </Stack>
        ) : null}
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={800} fontSize={15}>
            Escalation
          </Typography>
          <Button
            size="small"
            color="warning"
            startIcon={<ErrorOutlineIcon />}
            onClick={handleEscalate}
            disabled={busy || !latestInteraction}
          >
            Escalate
          </Button>
        </Stack>
        {customer360?.escalationHistory?.[0] ? (
          <Alert severity={customer360.escalationHistory[0].level === "Critical" ? "error" : "warning"}>
            {customer360.escalationHistory[0].level}: {customer360.escalationHistory[0].reason}
          </Alert>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No open escalation for this customer.
          </Typography>
        )}
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Button startIcon={<SummarizeIcon />} onClick={handleSummary} disabled={busy || !customer360}>
          Summarize conversation
        </Button>
        {summary ? (
          <Stack spacing={0.75}>
            {Object.entries(summary).map(([key, value]) => (
              <Box key={key}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                  {key}
                </Typography>
                <Typography variant="body2">{value}</Typography>
              </Box>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
}

function InsightTile({ helper, icon, label, value }) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "rgba(91, 103, 122, 0.16)",
        borderRadius: 1,
        p: 1.25,
        minHeight: 84,
        background: "linear-gradient(180deg, #ffffff, rgba(248, 250, 252, 0.86))",
        boxShadow: "0 10px 20px rgba(17, 24, 39, 0.05)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 28px rgba(17, 24, 39, 0.09)"
        }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={850}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        </Box>
        {icon}
      </Stack>
    </Box>
  );
}
