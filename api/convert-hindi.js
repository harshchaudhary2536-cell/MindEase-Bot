export default async function handler(req,res){
  try{
    const { text } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"llama-3.3-70b-versatile",
        messages:[
          {role:"system",content:"Convert Hinglish to Hindi script only."},
          {role:"user",content:text}
        ]
      })
    });

    const data=await response.json();
    const hindi=data.choices?.[0]?.message?.content;

    res.status(200).json({hindi});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
