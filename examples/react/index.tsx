/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { render } from "react-dom";
import { App } from "./app.tsx";

const root = document.getElementById("root");

render(<App />, root);
