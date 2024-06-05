/** @jsx jsx */
import { Global, jsx } from "@emotion/react";
import { Fragment } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";

export function App() {
  return (
    <Fragment>
      <Global
        styles={{
          html: {
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
      <RouterProvider router={router} />
    </Fragment>
  );
}
