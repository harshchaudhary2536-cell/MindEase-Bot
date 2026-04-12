export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  try {
    const { messages } = req.body;

    const system = `You are MindEase, a funny chill best friend.
- Short replies
- Casual tone
- Comfort + joke if sad`;

    const contents = [
      { role: "user", parts: [{ text: system }] },
      ...messages
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Bro lag ho gaya 😭";

    res.status(200).json({ reply });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
}
