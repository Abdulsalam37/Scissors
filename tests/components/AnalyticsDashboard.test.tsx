import { vi, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AnalyticsDashboard from "../../src/components/AnalyticsDashboard";
import { useQuery } from "convex/react";

// Mock Convex
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

// Mock Recharts to avoid layout issues in JSDOM
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => children,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  CartesianGrid: () => null,
}));

describe("AnalyticsDashboard Component", () => {
  it("renders loader when clicks are loading", () => {
    vi.mocked(useQuery).mockReturnValue(undefined); // loading
    render(<AnalyticsDashboard linkId={"links:123" as any} />);
    expect(screen.getByText("Aggregating analytics data...")).toBeInTheDocument();
  });

  it("renders empty state notice when there are no clicks logged", () => {
    vi.mocked(useQuery).mockReturnValue([]); // empty
    render(<AnalyticsDashboard linkId={"links:123" as any} />);
    expect(screen.getByText("No Click Data Yet")).toBeInTheDocument();
    expect(screen.getByText(/Share this link/i)).toBeInTheDocument();
  });

  it("renders key metrics when click history is present", () => {
    const mockClicks = [
      { _id: "click1", linkId: "123", timestamp: Date.now(), country: "US", referrer: "Direct", device: "Desktop" },
      { _id: "click2", linkId: "123", timestamp: Date.now(), country: "GB", referrer: "github.com", device: "Mobile" },
      { _id: "click3", linkId: "123", timestamp: Date.now(), country: "US", referrer: "Direct", device: "Desktop" },
    ];
    vi.mocked(useQuery).mockReturnValue(mockClicks);

    render(<AnalyticsDashboard linkId={"links:123" as any} />);

    // Total Clicks card
    expect(screen.getByText("Total Clicks")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Top Country
    expect(screen.getByText("Top Country")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument(); // first top alphabetically/frequency match

    // Top Referrer
    expect(screen.getByText("Top Referrer")).toBeInTheDocument();
    expect(screen.getByText("Direct")).toBeInTheDocument();

    // Top Device
    expect(screen.getByText("Top Device")).toBeInTheDocument();
    expect(screen.getByText("Desktop")).toBeInTheDocument();

    // Charts containers are loaded
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });
});
