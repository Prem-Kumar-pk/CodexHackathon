import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AgentWorkspace from "./pages/AgentWorkspace.jsx";
import Customer360 from "./pages/Customer360.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SupervisorDashboard from "./pages/SupervisorDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/workspace" replace />} />
        <Route path="workspace" element={<AgentWorkspace />} />
        <Route path="customers/:id" element={<Customer360 />} />
        <Route
          path="supervisor"
          element={
            <ProtectedRoute roles={["supervisor"]}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
