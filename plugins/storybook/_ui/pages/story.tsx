/** @jsx jsx */
import useSWR from "swr";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { jsx } from "@emotion/react";
import { StoryIframe } from "../widgets/story_iframe.tsx";
import { useParams } from "react-router-dom";
import { useStories } from "../utils/use_stories.ts";
import { InputPanel } from "../components/sections/input_panel.tsx";

export const StoryPage = () => {
  const { id } = useParams();
  const { stories } = useStories();
  const story = stories.find((story) => story.id === id);
  return (
    <div css={{ flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
      <div
        css={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
          borderBottom: "1px solid rgb(208, 215, 222)",
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
          {story?.name}
        </h1>
      </div>
      <div css={{ flex: "1 1 auto" }}>
        <StoryIframe />
      </div>
      <div
        css={{
          height: "360px",
          display: "flex",
          flexDirection: "column",
          // backgroundColor: "rgb(246, 248, 250)",
          borderTop: "1px solid rgb(208, 215, 222)",
        }}
      >
        <div
          css={{
            borderBottom: "1px solid rgb(208, 215, 222)",
          }}
        >
          <div css={{ padding: "8px", fontWeight: 500 }}>Controls</div>
        </div>
        <div
          css={{
            flex: "1 1 auto",
            display: "flex",
            padding: "8px",
            backgroundColor: "rgb(246, 248, 250)",
          }}
        >
          <InputPanel />
        </div>
      </div>
    </div>
  );
};
