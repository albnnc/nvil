import { render } from "react-dom";

const App = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        color: "white",
      }}
    >
      TEST
    </div>
  );
};

const root = document.getElementById("root");

render(<App />, root);
