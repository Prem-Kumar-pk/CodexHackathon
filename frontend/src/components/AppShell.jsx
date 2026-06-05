import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import {
  AppBar,
  Badge,
  Box,
  Button,
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
  Typography
} from "@mui/material";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const drawerWidth = 260;

export default function AppShell() {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = [
    { label: "Agent Workspace", path: "/workspace", icon: <SupportAgentIcon /> },
    ...(user?.role === "supervisor"
      ? [{ label: "Supervisor", path: "/supervisor", icon: <DashboardIcon /> }]
      : [])
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider", zIndex: 1300 }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: drawerWidth - 24 }}>
            <PeopleIcon color="primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Support Intelligence Hub
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Omnichannel operations
              </Typography>
            </Box>
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
          <Button startIcon={<LogoutIcon />} color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            pt: 9,
            borderRight: "1px solid",
            borderColor: "divider"
          }
        }}
      >
        <List sx={{ px: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          pt: 10,
          ml: { md: `${drawerWidth}px` },
          minHeight: "100vh"
        }}
      >
        <Outlet />
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
