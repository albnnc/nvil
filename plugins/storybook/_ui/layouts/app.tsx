/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { appTitle, groupOrder } from "../constants.ts";
import { LinkWrapper } from "../shared/ui/link_wrapper.tsx";
import { Loader } from "../shared/ui/loader.tsx";
import { StoryDef, useStories } from "../utils/use_stories.ts";

export const AppLayout = () => {
  return (
    <div
      css={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        css={{
          position: "sticky",
          top: 0,
          height: "56px",
          paddingLeft: "24px",
          paddingRight: "24px",
          zIndex: 1,
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgb(216, 222, 228)",
        }}
      >
        <Link
          css={{
            textDecoration: "unset",
            color: "inherit",
            fontWeight: 500,
            fontSize: "16pxp",
            letterSpacing: "0.05em",
          }}
          to="/"
        >
          {appTitle ?? "Storybook"}
        </Link>
      </header>
      <div
        css={{
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "row",
        }}
      >
        <Navigation />
        <main
          css={{
            flex: "1 1 auto",
            display: "flex",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const Navigation = () => {
  const { stories, loaded } = useStories();
  const { id: activeStoryId } = useParams();
  const listRef = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    if (activeStoryId) {
      requestAnimationFrame(() =>
        listRef.current[activeStoryId]?.scrollIntoView({
          behavior: "instant",
          block: "center",
        })
      );
    }
  }, [stories]);

  const groups = useMemo(() => {
    return orderStringArray(
      [...new Set(stories.map((s) => s.group ?? ""))].filter((i) => !!i),
      groupOrder ?? [],
    ).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: stories.filter((s) => (s.index !== true) && s.group === curr),
      }),
      {},
    ) as Record<string, StoryDef[]>;
  }, [stories]);

  return (
    <nav
      css={{
        paddingBottom: "48px",
        flex: "0 0 260px",
        alignSelf: "stretch",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 56px)",
        borderRight: "1px solid rgb(216, 222, 228)",
      }}
    >
      {!loaded
        ? <Loader css={{ margin: "auto", width: "24px", height: "24px" }} />
        : (
          <ul
            css={{ margin: 0, listStyle: "none", padding: 0, marginTop: "8px" }}
          >
            {Object.entries(groups).map(([group, stories], index, arr) => {
              const last = index === arr.length - 1;
              const inGroup = !!group;
              return (
                <Fragment key={group}>
                  {inGroup && (
                    <li css={{ marginRight: "16px", marginTop: "8px" }}>
                      <span
                        css={{
                          fontSize: "12px",
                          marginLeft: "16px",
                          height: "30px",
                          color: "rgb(87, 96, 106)",
                          display: "flex",
                          fontWeight: 500,
                          letterSpacing: "0.015em",
                          alignItems: "center",
                          paddingLeft: "8px",
                          textDecoration: "unset",
                          borderRadius: "6px",
                        }}
                      >
                        {group}
                      </span>
                    </li>
                  )}
                  {stories.map((story) => {
                    return (
                      <li
                        ref={(node) => (listRef.current[story.id] = node!)}
                        key={story.id}
                        id={`nav-item-${story.id}`}
                        css={{
                          marginRight: "16px",
                          marginTop: inGroup ? "0px" : "8px",
                        }}
                      >
                        <LinkWrapper
                          replace={false}
                          to={{ pathname: `/s/${story.id}`, search: "" }}
                        >
                          <a
                            css={{
                              marginLeft: "16px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: "8px",
                              color: "rgb(36, 41, 47)",
                              textDecoration: "unset",
                              borderRadius: "6px",
                              "&:hover, &:active, &:focus-visible": {
                                backgroundColor: "rgba(208, 215, 222, 0.32)",
                              },
                              ...(activeStoryId === story.id && {
                                backgroundColor: "rgba(208, 215, 222, 0.32)",
                              }),
                            }}
                          >
                            {story.name}
                          </a>
                        </LinkWrapper>
                      </li>
                    );
                  })}
                  {!last && (
                    <li
                      css={{
                        backgroundColor: "rgba(208, 215, 222, 0.48)",
                        height: "1px",
                        marginTop: "7px",
                      }}
                    />
                  )}
                </Fragment>
              );
            })}
          </ul>
        )}
    </nav>
  );
};

function orderStringArray(arr: string[], order: string[]) {
  if (order && order.length > 0) {
    arr.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1 && indexB === -1) {
        return 0;
      } else if (indexA === -1) {
        return 1;
      } else if (indexB === -1) {
        return -1;
      } else {
        return indexA - indexB;
      }
    });
  } else {
    arr.sort();
  }
  return arr;
}
