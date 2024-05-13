/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect, useMemo, useRef } from "react";
import { get } from "../../../../_utils/get.ts";
import { useStorySummary } from "../hooks/use_story_summary.ts";
import { useParams } from "react-router-dom";

export const StoryIframe = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const { id } = useParams();
  const { storyDefs, activeStoryInput, activeStoryDefaultInput } =
    useStorySummary() ?? {};
  const activeStorySafeInput = activeStoryInput ?? activeStoryDefaultInput;
  const activeStorySafeInputString =
    "?story-input=" + encodeURIComponent(JSON.stringify(activeStorySafeInput));

  const activeStoryInitialSrc = useMemo(() => {
    if (!id) {
      return undefined;
    }
    return `./stories/${id}`;
  }, [id]);

  useEffect(() => {
    const listen = (event: Event) => {
      if (get(event, "detail") === id) {
        ref.current?.contentWindow?.location.reload();
      }
    };
    addEventListener("story-update", listen);
    return () => removeEventListener("story-update", listen);
  }, [id]);
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

  if (!storyDefs || !activeStoryInitialSrc) {
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
