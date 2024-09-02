import { useState } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  const [value, setValue] = useState(0);
  return (
    <div>
      <button onClick={() => setValue(value + 1)}>Value is {value}</button>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
