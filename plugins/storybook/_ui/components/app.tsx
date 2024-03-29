/** @jsx jsx */
import { Global, jsx } from "@emotion/react";
import { useEffect } from "react";
import useSWR from "swr";
import { theme } from "../constants.ts";
import { Header } from "./sections/header.tsx";
import { InputPanel } from "./sections/input_panel.tsx";
import { Navigation } from "./sections/navigation.tsx";
import { Story } from "./sections/story.tsx";

export function App() {
  const { mutate } = useSWR("./stories");
  useEffect(() => {
    const eventSource = new EventSource("./story-reload-events");
    const fn = ({ data }: { data: string }) => {
      dispatchEvent(new CustomEvent("story-update", { detail: data }));
      mutate();
    };
    eventSource.addEventListener("message", fn);
    return () => {
      eventSource.removeEventListener("message", fn);
      eventSource.close();
    };
  }, []);
  return (
    <div
      css={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <Global
        styles={{
          html: {
            backgroundColor: theme.colors.background,
            color: theme.colors.onBackground,
            colorScheme: theme.colorScheme,
            fontFamily: "Roboto, sans-serif",
          },
          body: {
            padding: 0,
            margin: 0,
          },
          "*": {
            boxSizing: "border-box",
          },
        }}
      />
      <Navigation />
      <div
        css={{
          flex: "1 1 auto",
          height: "100vh",
          display: "flex",
          alignItems: "stretch",
          flexDirection: "column",
        }}
      >
        <Header />
        <Story />
      </div>
      <InputPanel />
    </div>
  );
}
