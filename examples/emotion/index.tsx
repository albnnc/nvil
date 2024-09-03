import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <div
      css={{
        display: "inline-block",
        padding: "1rem",
        borderRadius: "4px",
        background: "green",
        color: "white",
        fontFamily: "sans-serif",
        fontWeight: 600,
      }}
    >
      TEST
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
