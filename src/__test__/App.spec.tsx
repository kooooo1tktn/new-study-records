import App from "../App";
import { render, screen } from "@testing-library/react";

describe("title", () => {
  it("should render title", () => {
    render(<App />);
    expect(screen.getByText("シン・学習記録")).toBeInTheDocument();
  });
});
