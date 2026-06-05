import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
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
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        px: 2
      }}
    >
      <Container maxWidth="xs">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Stack spacing={0.5} textAlign="center">
                <Typography variant="h5" fontWeight={900}>
                  Support Intelligence Hub
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to the agent workspace
                </Typography>
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
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Agent: agent@supporthub.local · Supervisor: supervisor@supporthub.local · password123
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
