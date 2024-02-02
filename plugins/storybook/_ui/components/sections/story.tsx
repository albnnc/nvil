/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "../../hooks/use_search_params.ts";
import { useStorySummary } from "../../hooks/use_story_summary.ts";
import { getSchemaDefaults } from "../../utils/get_schema_defaults.ts";

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
    const eventSource = new EventSource("./story-reload-events");
    const fn = ({ data }: { data: string }) => {
      if (!ref.current) {
        return;
      }
      if (data === activeStoryId) {
        ref.current.contentWindow?.location.reload();
      }
    };
    eventSource.addEventListener("message", fn);
    return () => {
      eventSource.removeEventListener("message", fn);
      eventSource.close();
    };
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
