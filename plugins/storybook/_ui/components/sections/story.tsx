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
  useEffect(() => {
    const eventSource = new EventSource("./story-reload-events");
    const fn = ({ data }: { data: string }) => {
      if (data === activeStoryId) {
        ref.current?.contentWindow?.location.reload();
      }
    };
    eventSource.addEventListener("message", fn);
    return () => {
      eventSource.removeEventListener("message", fn);
      eventSource.close();
    };
  }, [activeStoryId]);
  if (!storyDefs) {
    return;
  }
  return (
    <iframe
      ref={ref}
      src={`./stories/${activeStoryId}/` +
        (activeStorySafeInput
          ? `?story-input=${
            encodeURIComponent(JSON.stringify(activeStorySafeInput))
          }`
          : "")}
      css={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  );
};
