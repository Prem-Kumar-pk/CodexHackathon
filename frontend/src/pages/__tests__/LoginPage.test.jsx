import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { api } from "../../api/client.js";
import { AuthProvider } from "../../context/AuthContext.jsx";
import LoginPage from "../LoginPage.jsx";

jest.mock("../../api/client.js", () => ({
  api: {
    post: jest.fn()
  }
}));

function renderLoginPage() {
  localStorage.clear();

  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/workspace" element={<div>Workspace loaded</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  test("renders demo credentials and default agent email", () => {
    renderLoginPage();

    expect(screen.getByRole("heading", { name: "Support Intelligence Hub" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("agent@supporthub.local")).toBeInTheDocument();
    expect(screen.getByText(/Supervisor: supervisor@supporthub.local/)).toBeInTheDocument();
  });

  test("submits credentials, stores auth state, and navigates to workspace", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: "jwt-token",
        user: {
          id: "user-1",
          name: "Avery Agent",
          email: "agent@supporthub.local",
          role: "agent",
          status: "active"
        }
      }
    });

    renderLoginPage();

    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "agent@supporthub.local",
        password: "password123"
      });
    });
    expect(await screen.findByText("Workspace loaded")).toBeInTheDocument();
    expect(localStorage.getItem("supportHubToken")).toBe("jwt-token");
  });

  test("shows backend validation errors", async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          error: "Invalid credentials"
        }
      }
    });

    renderLoginPage();

    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
