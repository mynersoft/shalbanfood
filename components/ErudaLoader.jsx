"use client";

import { useEffect } from "react";

export default function ErudaLoader() {
  useEffect(() => {
    // Only load in development mode
    if (process.env.NODE_ENV === "development") {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.onload = () => {
        eruda.init();
      };
      document.body.appendChild(script);
    }
  }, []);

  return null;
}