import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      dark: "#115e59"
    },
    secondary: {
      main: "#7c3aed"
    },
    warning: {
      main: "#b45309"
    },
    error: {
      main: "#b91c1c"
    },
    success: {
      main: "#15803d"
    },
    background: {
      default: "#f6f8fb",
      paper: "#ffffff"
    },
    text: {
      primary: "#14213d",
      secondary: "#596579"
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
          minHeight: 38
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.07)",
          border: "1px solid rgba(89, 101, 121, 0.16)"
        }
      }
    }
  }
});
