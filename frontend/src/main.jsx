import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PwaProvider } from "./contexts/PwaContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PwaProvider>
      <App />
    </PwaProvider>
  </React.StrictMode>
);
