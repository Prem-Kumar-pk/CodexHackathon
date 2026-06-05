import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      dark: "#0b4f4a",
      light: "#5eead4",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#4f46e5",
      dark: "#3730a3",
      light: "#a5b4fc",
      contrastText: "#ffffff"
    },
    info: {
      main: "#2563eb",
      dark: "#1d4ed8"
    },
    warning: {
      main: "#d97706",
      dark: "#92400e"
    },
    error: {
      main: "#dc2626",
      dark: "#991b1b"
    },
    success: {
      main: "#16a34a",
      dark: "#166534"
    },
    background: {
      default: "#edf4f6",
      paper: "#ffffff"
    },
    text: {
      primary: "#111827",
      secondary: "#5b677a"
    },
    divider: "rgba(91, 103, 122, 0.18)",
    action: {
      hover: "rgba(15, 118, 110, 0.08)",
      selected: "rgba(15, 118, 110, 0.14)"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    h1: { letterSpacing: 0 },
    h2: { letterSpacing: 0 },
    h3: { letterSpacing: 0 },
    h4: { letterSpacing: 0 },
    h5: { letterSpacing: 0 },
    h6: { letterSpacing: 0 },
    button: {
      textTransform: "none",
      fontWeight: 700,
      letterSpacing: 0
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 38,
          borderRadius: 8,
          boxShadow: "none",
          transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 10px 24px rgba(17, 24, 39, 0.12)"
          }
        },
        contained: {
          background: "linear-gradient(135deg, #0f766e, #2563eb)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 16px 38px rgba(17, 24, 39, 0.09)",
          border: "1px solid rgba(91, 103, 122, 0.14)",
          transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease"
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: "background 160ms ease, transform 160ms ease, border-color 160ms ease",
          "&:hover": {
            transform: "translateX(2px)"
          },
          "&.Mui-selected": {
            borderLeft: "3px solid #0f766e"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    }
  }
});
