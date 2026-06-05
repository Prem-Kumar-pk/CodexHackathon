import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import AICommandCenter from "../components/AICommandCenter.jsx";
import ChannelPill from "../components/ChannelPill.jsx";
import SentimentBadge from "../components/SentimentBadge.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const channels = ["Email", "Chat", "Social Media", "Phone Transcript"];
const sentimentOptions = ["All", "Positive", "Neutral", "Negative", "Critical"];

export default function AgentWorkspace() {
  const { socket } = useSocket();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customer360, setCustomer360] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState("conversation");
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

  const handleReplyKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (!busy && reply.trim()) {
      handleSend();
    }
  };

  return (
    <Box sx={{ px: { xs: 2, lg: 3 }, pb: 3 }}>
      {toast ? (
        <Alert severity="success" onClose={() => setToast("")} sx={{ mb: 2 }}>
          {toast}
        </Alert>
      ) : null}

      {isCompact ? (
        <Tabs
          value={workspaceTab}
          onChange={(event, value) => setWorkspaceTab(value)}
          variant="fullWidth"
          sx={{
            mb: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1
          }}
        >
          <Tab value="customers" label="Customers" />
          <Tab value="conversation" label="Conversation" />
          <Tab value="ai" label="AI" />
        </Tabs>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "300px minmax(460px, 1fr) 340px" },
          gap: 2,
          alignItems: "stretch"
        }}
      >
        <Card
          sx={{
            display: { xs: workspaceTab === "customers" ? "block" : "none", lg: "block" },
            height: { lg: "calc(100vh - 120px)" },
            overflow: "hidden"
          }}
        >
          <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
              <Box
                sx={{
                  mx: -2,
                  mt: -2,
                  mb: 1,
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  background: "linear-gradient(135deg, rgba(15, 118, 110, 0.1), rgba(37, 99, 235, 0.07))"
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        background: "linear-gradient(135deg, #0f766e, #4f46e5)",
                        boxShadow: "0 10px 22px rgba(15, 118, 110, 0.24)"
                      }}
                    >
                      {filteredCustomers.length}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={850}>
                        Customers
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prioritized by latest activity
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip size="small" label={`${customers.length} total`} color="primary" variant="outlined" />
                </Stack>
              </Box>
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
              <List disablePadding sx={{ overflow: "auto", pr: 0.5, flex: 1, minHeight: 0 }}>
                {filteredCustomers.map((customer, index) => {
                  const selected = customer.id === selectedCustomerId;
                  return (
                    <ListItemButton
                      key={customer.id}
                      selected={selected}
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        if (isCompact) setWorkspaceTab("conversation");
                      }}
                      sx={{
                        borderRadius: 1,
                        alignItems: "flex-start",
                        mb: 1,
                        p: 1.5,
                        border: "1px solid",
                        borderColor: selected ? "primary.main" : "transparent",
                        background: selected
                          ? "linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(79, 70, 229, 0.1))"
                          : "transparent",
                        boxShadow: selected ? "0 14px 30px rgba(15, 118, 110, 0.12)" : "none",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(79, 70, 229, 0.06))"
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, width: "100%" }}>
                        <Avatar
                          sx={{
                            width: 46,
                            height: 46,
                            fontWeight: 950,
                            background: customerGradient(index),
                            color: "#ffffff",
                            flexShrink: 0
                          }}
                        >
                          {getInitials(customer.name)}
                        </Avatar>
                        <Stack spacing={0.6} sx={{ minWidth: 0, width: "100%" }}>
                          <Stack direction="row" justifyContent="space-between" gap={1}>
                            <Typography fontSize={15.5} fontWeight={800} noWrap>
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
                          {customer.intelligenceSummary ? (
                            <Stack direction="row" gap={1} flexWrap="wrap">
                              <Chip
                                size="small"
                                label={`Health ${customer.intelligenceSummary.healthScore}`}
                                color="success"
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`Risk ${customer.intelligenceSummary.escalationRisk.score}%`}
                                color={customer.intelligenceSummary.escalationRisk.score > 70 ? "error" : "warning"}
                                variant="outlined"
                              />
                            </Stack>
                          ) : null}
                        </Stack>
                      </Stack>
                    </ListItemButton>
                  );
                })}
              </List>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            display: { xs: workspaceTab === "conversation" ? "block" : "none", lg: "block" },
            height: { lg: "calc(100vh - 120px)" },
            overflow: "hidden"
          }}
        >
          <CardContent sx={{ height: "100%" }}>
            <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                gap={2}
                sx={{
                  mx: -2,
                  mt: -2,
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  background: "linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(15, 118, 110, 0.08))"
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 58,
                      height: 58,
                      fontWeight: 950,
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      boxShadow: "0 16px 28px rgba(79, 70, 229, 0.22)"
                    }}
                  >
                    {getInitials(customer360?.name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={850} noWrap>
                      {customer360?.name || (loading ? "Loading..." : "Select a customer")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer360?.segment} | {customer360?.location}
                    </Typography>
                    {customer360?.intelligence ? (
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
                        <Chip size="small" label={customer360.intelligence.intent} color="primary" variant="outlined" />
                        <Chip size="small" label={customer360.intelligence.slaRisk} color="success" />
                      </Stack>
                    ) : null}
                  </Box>
                </Stack>
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

              <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, overflow: "auto", pr: 0.5 }}>
                {interactions.map((interaction) => (
                  <Box
                    key={interaction.id}
                    sx={{
                      border: "1px solid",
                      borderColor: interaction.priority === "Critical" ? "rgba(220, 38, 38, 0.28)" : "divider",
                      borderLeft: "6px solid",
                      borderLeftColor: priorityColor(interaction.priority),
                      borderRadius: 1,
                      p: 1.5,
                      bgcolor:
                        interaction.priority === "Critical"
                          ? "rgba(220, 38, 38, 0.06)"
                          : "rgba(255, 255, 255, 0.72)",
                      transition: "transform 160ms ease, box-shadow 160ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 24px rgba(17, 24, 39, 0.08)"
                      }
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                      <ChannelPill channel={interaction.channel} />
                      <SentimentBadge sentiment={interaction.sentiment} />
                    </Stack>
                    <Typography sx={{ mt: 1 }} fontSize={15.5}>
                      {interaction.message}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {interaction.priority} | {interaction.status}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Divider />

              <Stack spacing={1.5} sx={{ flexShrink: 0 }}>
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
                  <Button onClick={handleGenerate} disabled={busy || !customer360}>
                    Generate
                  </Button>
                </Stack>
                <TextField
                  label="Reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  helperText="Press Enter to send. Press Shift+Enter for a new line."
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
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    disabled={busy || !reply.trim()}
                    onClick={handleSend}
                    sx={{
                      bgcolor: "#111827",
                      color: "#ffffff",
                      background: "#111827",
                      "&:hover": {
                        bgcolor: "#000000",
                        background: "#000000"
                      },
                      "&.Mui-disabled": {
                        bgcolor: "rgba(17, 24, 39, 0.32)",
                        color: "rgba(255, 255, 255, 0.72)"
                      }
                    }}
                  >
                    Send
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            display: { xs: workspaceTab === "ai" ? "block" : "none", lg: "block" },
            height: { lg: "calc(100vh - 120px)" },
            overflow: "hidden"
          }}
        >
          <CardContent sx={{ height: "100%", overflow: "auto" }}>
            <AICommandCenter
              busy={busy}
              copyText={copyText}
              customer360={customer360}
              handleEscalate={handleEscalate}
              handleGenerate={handleGenerate}
              handleSummary={handleSummary}
              latestInteraction={latestInteraction}
              sentimentChartData={sentimentChartData}
              setReply={setReply}
              setSuggestionTab={setSuggestionTab}
              suggestionTab={suggestionTab}
              suggestions={suggestions}
              summary={summary}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function customerGradient(index) {
  const gradients = [
    "linear-gradient(135deg, #7c3aed, #2563eb)",
    "linear-gradient(135deg, #be123c, #f97316)",
    "linear-gradient(135deg, #2563eb, #0891b2)",
    "linear-gradient(135deg, #0f766e, #16a34a)"
  ];
  return gradients[index % gradients.length];
}

function priorityColor(priority) {
  return {
    Low: "#16a34a",
    Medium: "#64748b",
    High: "#d97706",
    Critical: "#dc2626"
  }[priority] || "#64748b";
}
