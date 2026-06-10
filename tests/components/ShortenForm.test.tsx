import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShortenForm from "../../src/components/ShortenForm";

// Mock Convex Hooks
vi.mock("convex/react", () => ({
  useMutation: () => vi.fn().mockResolvedValue({ id: "123", slug: "custom-slug" }),
  useQuery: () => true, // Mock that slug is available
}));

describe("ShortenForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main URL input form", () => {
    render(<ShortenForm />);
    expect(screen.getByPlaceholderText(/https:\/\/example.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Shorten URL/i })).toBeInTheDocument();
  });

  it("displays a validation error when trying to submit an empty URL", async () => {
    render(<ShortenForm />);
    const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a URL/i)).toBeInTheDocument();
    });
  });

  it("displays validation error for a malformed URL", async () => {
    render(<ShortenForm />);
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/i);
    fireEvent.change(urlInput, { target: { value: "invalid-url-no-protocol" } });

    const submitButton = screen.getByRole("button", { name: /Shorten URL/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
    });
  });

  it("renders custom slug and expiration optional inputs", () => {
    render(<ShortenForm />);
    expect(screen.getByPlaceholderText("my-custom-slug")).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiration Date/i)).toBeInTheDocument();
  });
});
