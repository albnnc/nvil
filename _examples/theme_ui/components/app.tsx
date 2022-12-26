/** @jsx jsx */
import { jsx, Theme, ThemeProvider } from "@theme-ui/core";
import { Global } from "@emotion/react";

const theme: Theme = {
  fonts: {
    body: "Roboto, sans-serif",
  },
  colors: {
    primary: "green",
  },
};

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={{
          html: {
            backgroundColor: "#101010",
            color: "#eaeaea",
          },
        }}
      />
      <div
        sx={{
          mt: 5,
          display: "flex",
          justifyContent: "center",
          fontFamily: "body",
        }}
      >
        <h1 sx={{ color: "primary", fontWeight: 400 }}>Sample Text</h1>
      </div>
    </ThemeProvider>
  );
}
