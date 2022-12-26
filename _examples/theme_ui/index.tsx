/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/app.tsx";

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
