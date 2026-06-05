import DashboardIcon from "@mui/icons-material/Dashboard";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import {
  AppBar,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const drawerWidth = 260;
const collapsedDrawerWidth = 78;

export default function AppShell() {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const activeDrawerWidth = navOpen ? drawerWidth : collapsedDrawerWidth;

  const navItems = [
    { label: "Agent Workspace", path: "/workspace", icon: <SupportAgentIcon /> },
    ...(user?.role === "supervisor"
      ? [{ label: "Supervisor", path: "/supervisor", icon: <DashboardIcon /> }]
      : [])
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        background:
          "linear-gradient(180deg, #e7f6f2 0%, #edf3fb 42%, #f8fafc 100%)"
      }}
    >
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: 1300,
          backdropFilter: "blur(16px)",
          bgcolor: "rgba(255, 255, 255, 0.86)"
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Tooltip title={navOpen ? "Collapse navigation" : "Expand navigation"}>
            <IconButton
              aria-label={navOpen ? "collapse navigation" : "expand navigation"}
              onClick={() => setNavOpen((current) => !current)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {navOpen ? <KeyboardDoubleArrowLeftIcon /> : <KeyboardDoubleArrowRightIcon />}
            </IconButton>
          </Tooltip>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              minWidth: { md: navOpen ? drawerWidth - 76 : 250 },
              transition: "min-width 180ms ease"
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                color: "primary.contrastText",
                background: "linear-gradient(135deg, #0f766e, #4f46e5)"
              }}
            >
              <PeopleIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Support Intelligence Hub
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Omnichannel operations
              </Typography>
            </Box>
            <Chip
              size="small"
              label="Live"
              color="success"
              sx={{
                ml: 1,
                fontWeight: 900,
                bgcolor: "rgba(22, 163, 74, 0.12)",
                color: "success.dark",
                "& .MuiChip-label": { px: 1.1 },
                "&::before": {
                  content: "\"\"",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  ml: 1
                }
              }}
            />
          </Stack>

          <Box sx={{ flex: 1 }} />

          <IconButton aria-label="notifications" onClick={(event) => setAnchorEl(event.currentTarget)}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {notifications.length === 0 ? (
              <MenuItem>No notifications</MenuItem>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <MenuItem key={item.id} sx={{ maxWidth: 420, whiteSpace: "normal" }}>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={700}>
                      {eventLabel(item.event)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.message}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))
            )}
            {notifications.length ? (
              <>
                <Divider />
                <MenuItem onClick={clearNotifications}>Clear</MenuItem>
              </>
            ) : null}
          </Menu>

          <Stack alignItems="flex-end" sx={{ display: { xs: "none", sm: "flex" } }}>
            <Typography variant="body2" fontWeight={700}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Stack>
          <Avatar
            sx={{
              display: { xs: "none", sm: "flex" },
              width: 42,
              height: 42,
              fontWeight: 900,
              background: "linear-gradient(135deg, #0f766e, #4f46e5)"
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
          <Button startIcon={<LogoutIcon />} color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: activeDrawerWidth,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: activeDrawerWidth,
            boxSizing: "border-box",
            pt: 9,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(255, 255, 255, 0.92)",
            overflowX: "hidden",
            transition: "width 180ms ease"
          }
        }}
      >
        <List sx={{ px: 1 }}>
          {navItems.map((item) => (
            <Tooltip key={item.path} title={navOpen ? "" : item.label} placement="right">
              <ListItemButton
                component={NavLink}
                to={item.path}
                selected={location.pathname.startsWith(item.path)}
                onClick={(event) => {
                  if (location.pathname.startsWith(item.path)) {
                    event.preventDefault();
                    setNavOpen((current) => !current);
                  }
                }}
                sx={{
                  borderRadius: 1,
                  minHeight: 54,
                  justifyContent: navOpen ? "flex-start" : "center",
                  px: navOpen ? 2 : 1.25
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: navOpen ? 42 : 0,
                    color: location.pathname.startsWith(item.path) ? "primary.main" : "text.secondary",
                    justifyContent: "center"
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {navOpen ? <ListItemText primary={item.label} /> : null}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          pt: 10,
          ml: { md: `${activeDrawerWidth}px` },
          minHeight: "100vh",
          pb: { xs: 10, md: 3 },
          transition: "margin-left 180ms ease"
        }}
      >
        <Outlet />
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 1300,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(17, 24, 39, 0.16)"
        }}
      >
        <BottomNavigation
          value={location.pathname.startsWith("/supervisor") ? "/supervisor" : "/workspace"}
          onChange={(event, value) => navigate(value)}
          showLabels
          sx={{ bgcolor: "rgba(255, 255, 255, 0.96)" }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label.replace("Agent ", "")} value={item.path} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Box>
    </Box>
  );
}

function eventLabel(event) {
  return {
    "critical-sentiment": "Critical sentiment",
    "escalation-triggered": "Escalation triggered",
    "new-customer-message": "New message"
  }[event];
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
