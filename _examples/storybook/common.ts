/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { ReactElement, useEffect, useState } from "react";
import { render } from "react-dom";

export function createReactElementLoader(element: ReactElement) {
  return () => {
    const root = document.getElementById("root");
    render(element, root);
  };
}

export function getStoryInput(): unknown {
  try {
    const searchParams = new URLSearchParams(location.search);
    return JSON.parse(searchParams.get("story-input") || "");
  } catch {
    return undefined;
  }
}

export function useStoryInput() {
  const [storyInput, setStoryInput] = useState<unknown>(getStoryInput);
  useEffect(() => {
    const listen = () => setStoryInput(getStoryInput);
    addEventListener("story-input", listen);
    return () => removeEventListener("story-input", listen);
  }, []);
  return storyInput;
}
