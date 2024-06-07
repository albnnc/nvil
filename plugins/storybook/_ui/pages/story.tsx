/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useParams } from "react-router-dom";
import { Loader } from "../shared/ui/loader.tsx";
import { useStories } from "../utils/use_stories.ts";
import { StoryControls } from "../widgets/story_controls.tsx";
import { StoryIframe } from "../widgets/story_iframe.tsx";

export const StoryPage = () => {
  const { id } = useParams();
  const { stories, loaded } = useStories();
  if (!loaded) {
    return <Loader css={{ margin: "auto", width: "24px", height: "24px" }} />;
  }

  const story = stories.find((story) => story.id === id);

  if (!story) {
    return <span css={{ margin: "24px" }}>Story not found</span>;
  }
  return (
    <div css={{ flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
      <div
        css={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
          borderBottom: "1px solid rgb(216, 222, 228)",
        }}
      >
        <h1
          css={{
            margin: 0,
            padding: 0,
            fontSize: "20px",
            fontWeight: 500,
          }}
        >
          {story.name}
        </h1>
      </div>
      <div css={{ flex: "1 1 auto" }}>
        <StoryIframe id={story.id} />
      </div>
      {story.controls && (
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "rgb(246, 248, 250)",
            borderTop: "1px solid rgb(216, 222, 228)",
          }}
        >
          <div
            css={{
              borderBottom: "1px solid rgb(208, 215, 222)",
              padding: "8px",
              fontWeight: 500,
            }}
          >
            Controls
          </div>
          <div
            css={{
              height: "340px",
              flex: "1 1 auto",
              display: "flex",
              overflowY: "auto",

              backgroundColor: "rgb(246, 248, 250)",
            }}
          >
            <StoryControls controls={story.controls} />
          </div>
        </div>
      )}
    </div>
  );
};
