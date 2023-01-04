/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { render } from "react-dom";
import { ReactElement } from "react";

export function init(element: ReactElement) {
  const root = document.getElementById("root");
  render(element, root);
}
