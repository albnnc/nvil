/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import React from "react";
import ReactDOM from "react-dom";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        color: "white",
      }}
    >
      SAMPLE
    </div>
  );
}

const root = document.getElementById("root");

ReactDOM.render(<App />, root);
