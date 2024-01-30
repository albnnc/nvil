/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useEffect, useRef, useState } from "react";
import { useStoryId } from "../../hooks/use_story_id.ts";
import { useStoryInput } from "../../hooks/use_story_input.ts";

export const Story = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const storyId = useStoryId();
  const [locationSearch, setLocationSearch] = useState<string | undefined>();
  useEffect(() => {
    const listen = () => {
      setLocationSearch(location.search);
    };
    addEventListener("pushSearchParams", listen);
    return () => {
      removeEventListener("pushSearchParams", listen);
    };
  }, []);
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
      src={`./stories/${storyId}/` + locationSearch}
      sx={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  );
};
