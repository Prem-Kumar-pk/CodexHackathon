import { render, screen } from "@testing-library/react";
import SentimentBadge from "../SentimentBadge.jsx";

describe("SentimentBadge", () => {
  test("renders the provided sentiment label", () => {
    render(<SentimentBadge sentiment="Critical" />);

    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  test("falls back to neutral when sentiment is missing", () => {
    render(<SentimentBadge />);

    expect(screen.getByText("Neutral")).toBeInTheDocument();
  });
});
