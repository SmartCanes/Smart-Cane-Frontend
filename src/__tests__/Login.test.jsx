import Login from "../auth/Login";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children }) => <span>{children}</span>
}));

// Mock user store (use relative path so tests resolve without alias)
const mockLogin = vi.fn();
const mockSetShowLoginModal = vi.fn();
vi.mock("../stores/useStore", () => ({
  useUserStore: () => ({
    login: mockLogin,
    setShowLoginModal: mockSetShowLoginModal
  })
}));

vi.mock("../api/http", () => ({
  backendApi: {
    post: vi.fn()
  }
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("renders login form", () => {
    render(<Login />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("shows validation errors when fields are empty", async () => {
    render(<Login />);
    const button = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(button);

    const errors = await screen.findAllByText(/this field is required/i);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  test("successful login with backend API", async () => {
    const { backendApi } = await vi.importMock("../api/http");
    backendApi.post.mockResolvedValue({ data: { access_token: "mockToken" } });

    render(<Login />);
    await userEvent.type(screen.getByLabelText(/username/i), "user1");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user1");
      expect(mockSetShowLoginModal).toHaveBeenCalledWith(true);
      expect(localStorage.getItem("token")).toBe("mockToken");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error message if backend login fails", async () => {
    const { backendApi } = await vi.importMock("../api/http");
    backendApi.post.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } }
    });

    render(<Login />);
    await userEvent.type(screen.getByLabelText(/username/i), "user1");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test("login with hardcoded admin credentials", async () => {
    render(<Login />);
    await userEvent.type(screen.getByLabelText(/username/i), "admin");
    await userEvent.type(screen.getByLabelText(/password/i), "admin");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin");
      expect(mockSetShowLoginModal).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
