import Register from "../auth/Register";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children }) => <span>{children}</span>
}));

vi.mock("../api/http", () => ({
  backendApi: {
    post: vi.fn()
  }
}));

// JSDOM doesn't implement scrollIntoView; ensure it exists for tests
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to select the exact Password label (ignores trailing required asterisk)
  const getPasswordByExactLabel = () =>
    screen.getByLabelText(
      (content) =>
        content.replace(/\*/g, "").trim().toLowerCase() === "password"
    );

  test("renders step 1 fields", () => {
    render(<Register />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(getPasswordByExactLabel()).toBeInTheDocument();
    expect(screen.getByLabelText(/re-enter password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  test("shows required validation errors when step1 submitted empty", async () => {
    const { container } = render(<Register />);
    const form = container.querySelector("form");
    fireEvent.submit(form);

    const errors = await screen.findAllByText(/this field is required/i);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  test("shows password mismatch error", async () => {
    render(<Register />);

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/username/i), "john123");
    await userEvent.type(getPasswordByExactLabel(), "Password1!");
    await userEvent.type(
      screen.getByLabelText(/re-enter password/i),
      "Password2!"
    );

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(
      await screen.findByText(/passwords don't match/i)
    ).toBeInTheDocument();
  });

  test("advances from step1 -> step2 -> step3 (happy path)", async () => {
    const { backendApi } = await vi.importMock("../api/http");

    // First check-credentials call for username availability
    backendApi.post.mockResolvedValueOnce({});
    // Second check-credentials call for email/contact in step2
    backendApi.post.mockResolvedValueOnce({});
    // send-otp call
    backendApi.post.mockResolvedValueOnce({});

    render(<Register />);

    // Fill step 1
    await userEvent.type(screen.getByLabelText(/first name/i), "Jane");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/username/i), "janedoe");
    await userEvent.type(getPasswordByExactLabel(), "Password1!");
    await userEvent.type(
      screen.getByLabelText(/re-enter password/i),
      "Password1!"
    );

    // Submit step1 -> should call backendApi.post once (username check) and move to step2
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(backendApi.post).toHaveBeenCalled();
    });

    // Now step 2 fields should be visible
    expect(
      await screen.findByLabelText(/lot no.\/bldg.\/street/i)
    ).toBeInTheDocument();

    // Fill step 2
    await userEvent.type(
      screen.getByLabelText(/lot no.\/bldg.\/street/i),
      "123 Main St"
    );
    await userEvent.type(
      screen.getByLabelText(/contact number/i),
      "09123456789"
    );
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "jane@example.com"
    );

    // Select Province
    await userEvent.click(screen.getByRole("button", { name: /province/i }));
    await userEvent.click(screen.getByText(/metro manila/i));

    // Select City
    await userEvent.click(screen.getByRole("button", { name: /city/i }));
    await userEvent.click(screen.getByText(/^Manila$/i));

    // Select Barangay
    await userEvent.click(screen.getByRole("button", { name: /barangay/i }));
    await userEvent.click(screen.getByText(/barangay 1/i));

    // Select Relationship
    await userEvent.click(
      screen.getByRole("button", { name: /relationship\.\.\./i })
    );
    await userEvent.click(screen.getByText(/husband/i));

    // Submit step2 -> will call check-credentials and then send-otp
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/email verification/i)).toBeInTheDocument();
    });
  });
});
