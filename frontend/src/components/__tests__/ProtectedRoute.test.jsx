import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({
  useAuth: jest.fn()
}));

function renderProtectedRoute({ user = null, token = null, roles } = {}) {
  useAuth.mockReturnValue({
    isAuthenticated: Boolean(token && user),
    user
  });

  return render(
    <MemoryRouter initialEntries={["/secure"]}>
      <Routes>
        <Route
          path="/secure"
          element={
            <ProtectedRoute roles={roles}>
              <div>Secure workspace</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login screen</div>} />
        <Route path="/workspace" element={<div>Agent workspace</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  test("redirects unauthenticated users to login", () => {
    renderProtectedRoute();

    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  test("renders protected content for authenticated users", () => {
    renderProtectedRoute({
      token: "token",
      user: { id: "user-1", email: "agent@test.local", role: "agent" }
    });

    expect(screen.getByText("Secure workspace")).toBeInTheDocument();
  });

  test("redirects authenticated users without the required role", () => {
    renderProtectedRoute({
      token: "token",
      user: { id: "user-1", email: "agent@test.local", role: "agent" },
      roles: ["supervisor"]
    });

    expect(screen.getByText("Agent workspace")).toBeInTheDocument();
  });
});
