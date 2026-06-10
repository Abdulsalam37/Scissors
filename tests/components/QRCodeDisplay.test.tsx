import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import QRCodeDisplay from "../../src/components/QRCodeDisplay";

describe("QRCodeDisplay Component", () => {
  it("renders QR Code customization header", () => {
    render(<QRCodeDisplay url="https://happy-monkey-123.convex.site/abc" />);
    expect(screen.getByText("Customize QR Code")).toBeInTheDocument();
  });

  it("renders foreground and background color pickers", () => {
    render(<QRCodeDisplay url="https://happy-monkey-123.convex.site/abc" />);
    expect(screen.getByText("Foreground")).toBeInTheDocument();
    expect(screen.getByText("Background")).toBeInTheDocument();
  });

  it("renders PNG and SVG download buttons", () => {
    render(<QRCodeDisplay url="https://happy-monkey-123.convex.site/abc" />);
    expect(screen.getByRole("button", { name: /PNG/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SVG/i })).toBeInTheDocument();
  });
});
