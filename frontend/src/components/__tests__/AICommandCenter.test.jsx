import { render, screen } from "@testing-library/react";
import AICommandCenter from "../AICommandCenter.jsx";

jest.mock("recharts", () => {
  const React = require("react");
  const PassThrough = ({ children }) => React.createElement("div", null, children);
  const Primitive = () => React.createElement("div");

  return {
    CartesianGrid: Primitive,
    Line: Primitive,
    LineChart: PassThrough,
    ResponsiveContainer: PassThrough,
    Tooltip: Primitive,
    XAxis: Primitive,
    YAxis: Primitive
  };
});

const customer360 = {
  intelligence: {
    healthScore: 42,
    escalationRisk: { score: 88, level: "Critical" },
    intent: "Billing / Refund",
    recommendedOwner: "Escalation Manager",
    slaRisk: "Immediate",
    nextBestAction: "Acknowledge ownership and route to an escalation manager.",
    qualitySignals: ["Open escalation requires visible ownership."]
  },
  escalationHistory: [
    {
      level: "Critical",
      reason: "Critical sentiment and refund keyword detected."
    }
  ]
};

describe("AICommandCenter", () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test("renders health, risk, next action, and quality signals", () => {
    render(
      <AICommandCenter
        busy={false}
        copyText={jest.fn()}
        customer360={customer360}
        handleEscalate={jest.fn()}
        handleGenerate={jest.fn()}
        handleSummary={jest.fn()}
        latestInteraction={{
          sentiment: "Critical",
          sentimentScore: -0.92,
          sentimentTrend: "Declining"
        }}
        sentimentChartData={[{ name: 1, score: -0.92 }]}
        setReply={jest.fn()}
        setSuggestionTab={jest.fn()}
        suggestionTab="professional"
        suggestions={null}
        summary={null}
      />
    );

    expect(screen.getByText("AI Command Center")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("Acknowledge ownership and route to an escalation manager.")).toBeInTheDocument();
    expect(screen.getByText("Open escalation requires visible ownership.")).toBeInTheDocument();
  });
});
