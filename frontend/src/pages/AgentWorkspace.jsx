import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import SummarizeIcon from "@mui/icons-material/Summarize";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import SentimentBadge from "../components/SentimentBadge.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const channels = ["Email", "Chat", "Social Media", "Phone Transcript"];
const sentimentOptions = ["All", "Positive", "Neutral", "Negative", "Critical"];

export default function AgentWorkspace() {
  const { socket } = useSocket();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customer360, setCustomer360] = useState(null);
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [channel, setChannel] = useState("Chat");
  const [reply, setReply] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionTab, setSuggestionTab] = useState("professional");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const loadCustomers = useCallback(async () => {
    const { data } = await api.get("/customers");
    setCustomers(data.data);
    setSelectedCustomerId((current) => current || data.data[0]?.id || "");
  }, []);

  const loadCustomer360 = useCallback(async (customerId) => {
    if (!customerId) return;
    const { data } = await api.get(`/customers/${customerId}`);
    setCustomer360(data.data);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await loadCustomers();
      setLoading(false);
    }
    load();
  }, [loadCustomers]);

  useEffect(() => {
    loadCustomer360(selectedCustomerId);
    setSuggestions(null);
    setSummary(null);
    setReply("");
  }, [selectedCustomerId, loadCustomer360]);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = (payload) => {
      if (!payload.customerId || payload.customerId === selectedCustomerId) {
        loadCustomer360(selectedCustomerId);
      }
      loadCustomers();
    };
    socket.on("new-customer-message", refresh);
    socket.on("escalation-triggered", refresh);
    socket.on("critical-sentiment", refresh);

    return () => {
      socket.off("new-customer-message", refresh);
      socket.off("escalation-triggered", refresh);
      socket.off("critical-sentiment", refresh);
    };
  }, [socket, selectedCustomerId, loadCustomer360, loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const needle = search.toLowerCase();
    return customers.filter((customer) => {
      const latest = customer.latestInteraction;
      const matchesSearch =
        !needle ||
        customer.name.toLowerCase().includes(needle) ||
        customer.email.toLowerCase().includes(needle) ||
        latest?.message?.toLowerCase().includes(needle);
      const matchesSentiment =
        sentimentFilter === "All" || latest?.sentiment === sentimentFilter;
      return matchesSearch && matchesSentiment;
    });
  }, [customers, search, sentimentFilter]);

  const interactions = customer360?.interactions || [];
  const latestInteraction = interactions[interactions.length - 1];
  const sentimentChartData = (customer360?.sentimentHistory || []).map((item, index) => ({
    name: index + 1,
    score: item.score,
    sentiment: item.sentiment
  }));

  const handleGenerate = async () => {
    if (!customer360) return;
    setBusy(true);
    try {
      const { data } = await api.post("/generate-response", {
        customerId: customer360.id,
        interactionId: latestInteraction?.id
      });
      setSuggestions(data.data);
      setReply(data.data[suggestionTab] || "");
    } finally {
      setBusy(false);
    }
  };

  const handleSummary = async () => {
    if (!customer360) return;
    setBusy(true);
    try {
      const { data } = await api.post("/summarize", { customerId: customer360.id });
      setSummary(data.data);
    } finally {
      setBusy(false);
    }
  };

  const handleEscalate = async () => {
    if (!customer360 || !latestInteraction) return;
    setBusy(true);
    try {
      await api.post("/escalate", {
        customerId: customer360.id,
        interactionId: latestInteraction.id,
        level: "High",
        reason: "Manual escalation from agent workspace",
        keywords: []
      });
      await loadCustomer360(customer360.id);
      setToast("Escalation created");
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (!customer360 || !reply.trim()) return;
    setBusy(true);
    try {
      await api.post("/messages", {
        customerId: customer360.id,
        channel,
        message: reply.trim(),
        status: "In Progress"
      });
      setReply("");
      setToast("Reply sent");
      await Promise.all([loadCustomers(), loadCustomer360(customer360.id)]);
    } finally {
      setBusy(false);
    }
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    setToast("Copied");
  };

  return (
    <Box sx={{ px: { xs: 2, lg: 3 }, pb: 3 }}>
      {toast ? (
        <Alert severity="success" onClose={() => setToast("")} sx={{ mb: 2 }}>
          {toast}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "320px minmax(420px, 1fr) 360px" },
          gap: 2,
          alignItems: "start"
        }}
      >
        <Card sx={{ minHeight: { lg: "calc(100vh - 120px)" } }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>
                Customers
              </Typography>
              <TextField
                size="small"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
              <FormControl size="small">
                <InputLabel>Sentiment</InputLabel>
                <Select
                  label="Sentiment"
                  value={sentimentFilter}
                  onChange={(event) => setSentimentFilter(event.target.value)}
                >
                  {sentimentOptions.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Divider />
              <List disablePadding>
                {filteredCustomers.map((customer) => (
                  <ListItemButton
                    key={customer.id}
                    selected={customer.id === selectedCustomerId}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    sx={{ borderRadius: 1, alignItems: "flex-start", mb: 0.5 }}
                  >
                    <Stack spacing={0.75} sx={{ minWidth: 0, width: "100%" }}>
                      <Stack direction="row" justifyContent="space-between" gap={1}>
                        <Typography fontWeight={800} noWrap>
                          {customer.name}
                        </Typography>
                        <SentimentBadge sentiment={customer.latestInteraction?.sentiment} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {customer.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {customer.latestInteraction?.message || "No interactions"}
                      </Typography>
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: { lg: "calc(100vh - 120px)" } }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    {customer360?.name || (loading ? "Loading..." : "Select a customer")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {customer360?.segment} · {customer360?.location}
                  </Typography>
                </Box>
                {customer360 ? (
                  <Button
                    component={Link}
                    to={`/customers/${customer360.id}`}
                    endIcon={<OpenInNewIcon />}
                    variant="outlined"
                  >
                    Customer 360
                  </Button>
                ) : null}
              </Stack>

              <Divider />

              <Stack spacing={1.5} sx={{ maxHeight: { lg: "44vh" }, overflow: "auto", pr: 0.5 }}>
                {interactions.map((interaction) => (
                  <Box
                    key={interaction.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 1.5,
                      bgcolor: interaction.priority === "Critical" ? "rgba(185, 28, 28, 0.06)" : "background.paper"
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                      <ChannelPill channel={interaction.channel} />
                      <SentimentBadge sentiment={interaction.sentiment} />
                    </Stack>
                    <Typography sx={{ mt: 1 }}>{interaction.message}</Typography>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {interaction.priority} · {interaction.status}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <Stack direction="row" gap={1}>
                  <FormControl size="small" sx={{ minWidth: 170 }}>
                    <InputLabel>Channel</InputLabel>
                    <Select label="Channel" value={channel} onChange={(event) => setChannel(event.target.value)}>
                      {channels.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ flex: 1 }} />
                  <Button startIcon={<AutoAwesomeIcon />} onClick={handleGenerate} disabled={busy || !customer360}>
                    Generate
                  </Button>
                </Stack>
                <TextField
                  label="Reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  minRows={4}
                  multiline
                  fullWidth
                />
                <Stack direction="row" justifyContent="flex-end" gap={1}>
                  <Tooltip title="Copy reply">
                    <span>
                      <IconButton disabled={!reply} onClick={() => copyText(reply)}>
                        <ContentCopyIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Button variant="contained" startIcon={<SendIcon />} disabled={busy || !reply.trim()} onClick={handleSend}>
                    Send
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: { lg: "calc(100vh - 120px)" } }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>
                AI Insights
              </Typography>

              {latestInteraction ? (
                <Stack spacing={1}>
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
                  />
                  <Typography variant="caption" color="text.secondary">
                    Score {latestInteraction.sentimentScore}
                  </Typography>
                </Stack>
              ) : null}

              <Box sx={{ height: 160 }}>
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

              <Divider />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800}>Suggestions</Typography>
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
                  <Tab value="professional" label="Professional" />
                  <Tab value="empathetic" label="Empathetic" />
                  <Tab value="escalation" label="Escalation" />
                </Tabs>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1.5,
                    minHeight: 110
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
                  <Typography fontWeight={800}>Escalation</Typography>
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
                  Summarize
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
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
