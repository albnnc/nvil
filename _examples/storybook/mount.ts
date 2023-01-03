import { render } from "react-dom";
import { ReactElement } from "react";

export function mount(element: ReactElement) {
  const root = document.getElementById("root");
  render(element, root);
}
