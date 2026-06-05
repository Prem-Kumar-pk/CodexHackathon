import { render, screen } from "@testing-library/react";
import ChannelPill from "../ChannelPill.jsx";

describe("ChannelPill", () => {
  test("renders supported channel names", () => {
    render(<ChannelPill channel="Social Media" />);

    expect(screen.getByText("Social Media")).toBeInTheDocument();
  });
});
