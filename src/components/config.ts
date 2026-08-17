// config.ts
// Keep the API key and model names here so they're not scattered inside the component.
// IMPORTANT: this only organizes the code — it does NOT hide the key from users.
// Any key placed in frontend code (even in its own file) ends up inside the JS bundle
// that ships to the browser, and anyone can read it via DevTools > Sources or "View Source".
// For real protection, this key must live on a server and the frontend should call
// your own backend endpoint instead of calling Groq directly. See the note at the
// bottom of this file for a minimal example.

export const GROQ_API_KEY = "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";

export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const MODELS = {
  text: "openai/gpt-oss-120b",
  vision: "qwen/qwen3.6-27b",
} as const;

/*
  ---- Minimal backend example (Node/Express) to truly hide the key ----

  // server.js (runs on YOUR server, never shipped to the browser)
  import express from "express";
  const app = express();
  app.use(express.json());

  app.post("/api/chat", async (req, res) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // key lives only on the server
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  });

  app.listen(3000);

  Then in Madly.tsx, instead of calling Groq directly, you'd call:
    fetch("/api/chat", { method: "POST", body: JSON.stringify({ model, messages, ... }) })
  and the browser never sees GROQ_API_KEY at all.
*/