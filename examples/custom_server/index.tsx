import { createRoot } from "react-dom/client";

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

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
