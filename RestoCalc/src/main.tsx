
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import "./styles/globals.css";

  // AdMob initialization
  import { initAds } from './ads';
  initAds().catch(() => {/* ignore */});

  createRoot(document.getElementById("root")!).render(<App />);