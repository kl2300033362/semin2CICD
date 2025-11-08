import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './setupRequestRewrite';
import { BrowserRouter } from "react-router-dom";
import "./index.css";

// Global handler for unhandled promise rejections (shows a friendly toast)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', function (event) {
    // Prevent multiple notifications for the same error in dev
    try {
      // eslint-disable-next-line no-console
      console.warn('Unhandled promise rejection:', event.reason);
    } catch (e) {}
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
