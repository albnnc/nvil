/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { ReactElement } from "react";
import { render } from "react-dom";

export function createReactElementLoader(element: ReactElement) {
  return () => {
    const root = document.getElementById("root");
    render(element, root);
  };
}

export function getStoryInput() {
  try {
    const searchParams = new URLSearchParams(location.search);
    return JSON.parse(searchParams.get("story-input") || "");
  } catch {
    return undefined;
  }
}
