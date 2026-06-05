import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import InsightsIcon from "@mui/icons-material/Insights";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "agent@supporthub.local", password: "password123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/workspace" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/workspace", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 18% 16%, rgba(79, 70, 229, 0.2), transparent 28%), radial-gradient(circle at 82% 22%, rgba(15, 118, 110, 0.22), transparent 26%), linear-gradient(135deg, #eef7f5 0%, #f8fafc 46%, #eef2ff 100%)",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            gap: 3,
            alignItems: "stretch"
          }}
        >
          <Card
            sx={{
              overflow: "hidden",
              color: "#ffffff",
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 118, 110, 0.92) 48%, rgba(79, 70, 229, 0.92))",
              position: "relative",
              minHeight: { md: 560 }
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: "auto -80px -110px auto",
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.14)",
                filter: "blur(2px)"
              }}
            />
            <CardContent sx={{ p: { xs: 3, md: 5 }, position: "relative", height: "100%" }}>
              <Stack spacing={4} justifyContent="space-between" sx={{ height: "100%" }}>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: "rgba(255, 255, 255, 0.18)",
                        border: "1px solid rgba(255, 255, 255, 0.28)"
                      }}
                    >
                      <PsychologyIcon />
                    </Avatar>
                    <Chip
                      icon={<AutoAwesomeIcon />}
                      label="AI-native support workspace"
                      sx={{
                        color: "#ffffff",
                        bgcolor: "rgba(255, 255, 255, 0.14)",
                        border: "1px solid rgba(255, 255, 255, 0.22)"
                      }}
                    />
                  </Stack>

                  <Box>
                    <Typography variant="h3" fontWeight={950} sx={{ maxWidth: 560 }}>
                      Support Intelligence Hub
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1.5, color: "rgba(255, 255, 255, 0.76)", maxWidth: 620 }}>
                      A command-center experience for omnichannel teams, with live sentiment, escalation intelligence, and AI-guided next actions.
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 1.5
                  }}
                >
                  <DemoSignal icon={<InsightsIcon />} label="Live Sentiment" value="4 channels" />
                  <DemoSignal icon={<ShieldOutlinedIcon />} label="Risk Guard" value="Auto triage" />
                  <DemoSignal icon={<DashboardCustomizeIcon />} label="Supervisor View" value="Real-time" />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              alignSelf: "center",
              background: "rgba(255, 255, 255, 0.88)",
              backdropFilter: "blur(18px)"
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                <Stack spacing={1} alignItems="center" textAlign="center">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "#111827",
                      animation: "softPulse 2200ms infinite"
                    }}
                  >
                    <LockOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={950}>
                      Enter the command center
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sign in as an agent or supervisor to start the demo.
                    </Typography>
                  </Box>
                </Stack>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <Stack spacing={2}>
                    <TextField
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      fullWidth
                      required
                    />
                    <Button type="submit" variant="contained" disabled={loading} size="large">
                      {loading ? "Signing in..." : "Login"}
                    </Button>
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 1.5,
                        bgcolor: "rgba(15, 118, 110, 0.06)"
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Agent: agent@supporthub.local | Supervisor: supervisor@supporthub.local | password123
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

function DemoSignal({ icon, label, value }) {
  return (
    <Box
      sx={{
        border: "1px solid rgba(255, 255, 255, 0.22)",
        borderRadius: 1,
        p: 1.5,
        bgcolor: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(10px)"
      }}
    >
      <Stack spacing={1}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: "rgba(255, 255, 255, 0.18)",
            color: "#ffffff"
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            {label}
          </Typography>
          <Typography fontWeight={900}>{value}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
