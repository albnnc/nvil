/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect, useMemo, useRef } from "react";
import { get } from "../../../../../_utils/get.ts";
import { useStorySummary } from "../../hooks/use_story_summary.ts";

export const Story = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const {
    storyDefs,
    activeStoryId,
    activeStoryInput,
    activeStoryDefaultInput,
  } = useStorySummary() ?? {};
  const activeStorySafeInput = activeStoryInput ?? activeStoryDefaultInput;
  const activeStorySafeInputString = "?story-input=" +
    encodeURIComponent(JSON.stringify(activeStorySafeInput));
  const activeStoryInitialSrc = useMemo(() => {
    if (!activeStoryId) {
      return undefined;
    }
    return `./stories/${activeStoryId}/` + activeStorySafeInputString;
  }, [activeStoryId]);
  useEffect(() => {
    const listen = (event: Event) => {
      if (get(event, "detail") === activeStoryId) {
        ref.current?.contentWindow?.location.reload();
      }
    };
    addEventListener("story-update", listen);
    return () => removeEventListener("story-update", listen);
  }, [activeStoryId]);
  useEffect(() => {
    const storyWindow = ref.current?.contentWindow;
    if (
      !activeStorySafeInput ||
      !storyWindow ||
      storyWindow.location.origin !== location.origin
    ) {
      return;
    }
    storyWindow.history.replaceState({}, "", activeStorySafeInputString);
    storyWindow.dispatchEvent(new CustomEvent("story-input"));
  }, [activeStorySafeInput]);
  if (!storyDefs) {
    return;
  }
  return (
    <iframe
      ref={ref}
      src={activeStoryInitialSrc}
      css={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  );
};
