/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useEffect, useRef } from "react";
import { useStoryId } from "../../hooks/use_story_id.ts";

export const Story = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const storyId = useStoryId();
  useEffect(() => {
    const eventSource = new EventSource("./story-reload-events");
    const fn = ({ data }: { data: string }) => {
      if (data === storyId) {
        ref.current?.contentWindow?.location.reload();
      }
    };
    eventSource.addEventListener("message", fn);
    return () => {
      eventSource.removeEventListener("message", fn);
      eventSource.close();
    };
  }, [storyId]);
  return (
    <iframe
      ref={ref}
      src={`./stories/${storyId}/`}
      sx={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  );
};
