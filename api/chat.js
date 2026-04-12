export default async function handler(req, res) {
  console.log("🔥 API HIT");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    console.log("🔑 API KEY EXISTS:", !!API_KEY);

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY NOT FOUND" });
    }

    const { messages } = req.body;

    console.log("📩 Incoming messages:", messages);

    const userText =
      messages?.[messages.length - 1]?.parts?.[0]?.text || "Hello";

    console.log("🧠 User Text:", userText);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userText }]
            }
          ]
        })
      }
    );

    console.log("📡 Gemini Status:", response.status);

    const rawText = await response.text();

    console.log("📦 Raw Gemini Response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: "INVALID JSON FROM GEMINI",
        raw: rawText
      });
    }

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Gemini error",
        full: data
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No reply 😭";

    return res.status(200).json({ reply });

  } catch (err) {
    console.log("💥 SERVER CRASH:", err);

    return res.status(500).json({
      error: "SERVER CRASH",
      details: err.message
    });
  }
}
