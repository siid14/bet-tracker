import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import BettingDashboard from "./BettingDashboard";
import { Analytics } from "@vercel/analytics/react";

// test deploy2
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BettingDashboard />
    <Analytics />
  </React.StrictMode>
);
