export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY NOT FOUND" });
    }

    const { messages } = req.body;

    const userText =
      messages?.[messages.length - 1]?.parts?.[0]?.text || "Hello";

    const prompt = `You are MindEase, a funny chill best friend.
- Short replies
- Casual tone
- Comfort + joke if sad

User: ${userText}
MindEase:`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Invalid response from Gemini",
        raw: text
      });
    }

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Gemini error"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Bro I forgot 😭";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({
      error: "SERVER ERROR",
      details: err.message
    });
  }
}
