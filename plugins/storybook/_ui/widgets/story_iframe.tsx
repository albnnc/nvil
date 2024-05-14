/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect, useRef } from "react";
import { get } from "../../../../_utils/get.ts";
import { useParams } from "react-router-dom";

export const StoryIframe = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const { id } = useParams();

  useEffect(() => {
    const listen = (event: Event) => {
      if (get(event, "detail") === id) {
        ref.current?.contentWindow?.location.reload();
      }
    };
    addEventListener("story-update", listen);
    return () => removeEventListener("story-update", listen);
  }, [id]);

  if (!id) {
    return null;
  }

  return (
    <iframe
      ref={ref}
      src={`/stories/${id}`}
      css={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  );
};
