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

export function getStoryControls(): unknown {
  try {
    const searchParams = new URLSearchParams(globalThis.parent.location.search);

    return JSON.parse(searchParams.get("controls") || "");
  } catch {
    return undefined;
  }
}

export function useStoryControls() {
  const [storyControls, setStoryControls] = useState<unknown>(getStoryControls);
  useEffect(() => {
    const listen = () => {
      setStoryControls(getStoryControls);
    };
    globalThis.parent.addEventListener("controls-update", listen);
    return () => removeEventListener("controls-update", listen);
  }, []);
  return storyControls;
}
