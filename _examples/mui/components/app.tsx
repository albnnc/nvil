/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
} from "@mui/material";
import { ButtonRow } from "./button_row.tsx";
import { Layout } from "./layout.tsx";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Layout>
        <Typography>
          <h1>MUI Example</h1>
          <h2>Basic Buttons</h2>
          <ButtonRow />
          <h2>Contained Buttons</h2>
          <ButtonRow variant="contained" />
          <h2>Outlined Buttons</h2>
          <ButtonRow variant="outlined" />
        </Typography>
      </Layout>
    </ThemeProvider>
  );
}
