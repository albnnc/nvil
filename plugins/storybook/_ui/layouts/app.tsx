/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Fragment } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { useStories } from "../utils/use_stories.ts";

export const AppLayout = () => {
  return (
    <div css={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
          Storybook
        </Link>
      </header>
      <div
        css={{
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "row",
        }}
      >
        <nav
          css={{
            flex: "0 0 260px",
            alignSelf: "stretch",
            overflowY: "auto",
            maxHeight: "calc(100vh - 56px)",
            borderRight: "1px solid rgb(216, 222, 228)",
          }}
        >
          <Navigation />
        </nav>
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
  const { stories } = useStories();
  const { id } = useParams();
  if (stories.length === 0) {
    return null;
  }

  return (
    <nav>
      <ul css={{ margin: 0, listStyle: "none", padding: 0, marginTop: "8px" }}>
        {Object.entries(
          Object.groupBy(stories, (story) => story.group ?? "")
        ).map(([group, stories]) => {
          return (
            <Fragment key={group}>
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
              {stories?.map((story) => {
                return (
                  <li key={story.id} css={{ marginRight: "16px" }}>
                    <Link
                      key={story.id}
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
                        ...(id === story.id && {
                          backgroundColor: "rgba(208, 215, 222, 0.32)",
                        }),
                      }}
                      to={`/s/${story.id}`}
                    >
                      {story.name}
                    </Link>
                  </li>
                );
              })}
              <li
                css={{
                  backgroundColor: "rgba(208, 215, 222, 0.48)",
                  height: "1px",
                  marginTop: "7px",
                }}
              />
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
};
