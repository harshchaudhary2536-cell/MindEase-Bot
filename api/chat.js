export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
      return res.status(500).json({ error: "GROQ KEY NOT FOUND" });
    }

    const { messages, mode } = req.body;

    const userText =
      messages?.[messages.length - 1]?.parts?.[0]?.text || "Hello";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are MindEase — an emotionally intelligent AI best friend.

STEP 1: Detect emotion (sad, angry, stressed, overthinking, normal)

STEP 2: Respond:

IF SAD → comfort deeply  
IF ANGRY → calm + validate  
IF STRESSED → simplify + relax  
IF OVERTHINKING → ground gently  
IF NORMAL → chill friend talk  

MODE:
${mode === "savage" ? "- Be funny + slightly savage 😈" : ""}
${mode === "funny" ? "- Be playful and humorous 😂" : ""}
${mode === "chill" ? "- Be calm and comforting 😌" : ""}

RULES:
- Talk like real friend
- Short replies
- Casual tone
- No robotic talk
- No long lectures

Make user feel better after reply.
`
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "Groq error"
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || "I'm here bro 🤍"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
