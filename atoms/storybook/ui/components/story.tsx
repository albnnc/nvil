/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function Story() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get("story");
  useEffect(() => {
    const eventSource = new EventSource("/story-reload-events");
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
      sx={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
      src={`/stories/${storyId}/`}
    />
  );
}
