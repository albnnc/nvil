/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { ReactElement } from "react";
import { render } from "react-dom";

export function init(element: ReactElement) {
  const root = document.getElementById("root");
  render(element, root);
}
