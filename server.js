import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = (process.env.GEMINI_API_KEY || '').trim();

const SYSTEM_PROMPT = "Aap Get Ready For Job (getreadyforjobs.com) ke career mentor hain. Pakistani students aur job seekers ko Roman Urdu mein asan, practical aur mukhtasar mashwara dein (2 sentences max).";

// High demand ke waqt auto-switch hone wale models
const AVAILABLE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash"
];

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    let reply = null;

    for (const modelName of AVAILABLE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Sawal: ${message}\nJawab:` }]
              }
            ]
          })
        });

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = data.candidates[0].content.parts[0].text;
          break; // Response mil gaya, loop close
        }
      } catch (err) {
        continue; // Agar ek model busy ho to agle model par jaye
      }
    }

    if (reply) {
      return res.json({ reply });
    } else {
      return res.json({ 
        reply: "Matric pass students ke liye Railway, Police, Army, Clerk, aur Technical diplomas (DAE, Graphic Design, Web) mein behtareen jobs dastiyab hain." 
      });
    }

  } catch (error) {
    return res.status(500).json({ reply: "Server rabtay mein masla aya, dobara koshish karein." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`=== BOT BACKEND READY ON PORT ${PORT} ===`);
});