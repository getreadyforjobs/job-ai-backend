import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = (process.env.GEMINI_API_KEY || '').trim();

const SYSTEM_PROMPT = `
Aap "Get Ready For Job" (getreadyforjobs.com) ke official AI Career Representative aur E-Commerce Guide hain.
Is platform ke Founder aur Lead Guide "Sir Mureed Mushtaq" hain.

Aapka maqsad candidates ko career guidance, jobs information, online apply service, aur website ke mukammal E-Commerce Store (Shopping Section) ke mutabiq behtareen rehnumai dena hai.

Hamesha darj zail usoolon aur maloomat ke mutabiq jawab dein:

1. FOUNDER & DIRECT CALL ASSISTANCE:
- Founder/Admin: Sir Mureed Mushtaq.
- Urgent guidance / Call Assistance: 03218590323

2. OFFICIAL SOCIAL CHANNELS & VIDEO GUIDES:
- Job details & Video guides (YouTube): https://youtube.com/@getreadyforjob?si=zCiJd20dR0N8gFMv
- Daily fresh job alerts (WhatsApp Channel): https://whatsapp.com/channel/0029VbBtR4f2P59eOgCX5P3s

3. PROFESSIONAL ONLINE APPLY SERVICE (Rs. 450):
- Agar candidate apply na kar sake: Hamari team apply karegi.
- Apply Fee: Sirf Rs. 450 (Advance payment).
- WhatsApp Channel join karein: https://whatsapp.com/channel/0029VbBtR4f2P59eOgCX5P3s

4. E-COMMERCE STORE & PRODUCTS:
- Store par Clothes (Interview suits, shirts), Watches, Authentic Books/Notes (PPSC, FPSC, NTS, etc.), aur Gadgets dastiyab hain.

5. PAYMENT & STORE POLICIES:
- Payment Policy: Cash on Delivery (COD) bilkul NAHI hai. Tamam orders ke liye 100% ADVANCE payment lazmi hai (JazzCash/EasyPaisa/Bank Transfer).
- Delivery Time: 2 se 4 working days pore Pakistan mein.

6. TONE:
- Saaf, helpful Roman Urdu ya English mein step-by-step jawab dein.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const userPrompt = req.body.prompt || req.body.message || '';
    if (!userPrompt) {
      return res.status(400).json({ reply: 'Sawal likhna zaroori hai.' });
    }

    if (!apiKey) {
      return res.status(500).json({ reply: 'GEMINI_API_KEY set nahi hai.' });
    }

    // Direct Google Gemini API endpoint (No SDK dependency)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nCandidate Question: ${userPrompt}` }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Fallback agar 2.0-flash allow na ho
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`;
      const fbResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nCandidate Question: ${userPrompt}` }]
            }
          ]
        })
      });
      const fbData = await fbResponse.json();

      if (!fbResponse.ok) {
        throw new Error(fbData.error?.message || data.error?.message || 'API Error');
      }

      const fbReply = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.json({ reply: fbReply });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.json({ reply: reply });

  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ 
      reply: `Gemini issue: ${error.message || "Model response nahi de raha."}` 
    });
  }
});

app.get('/', (req, res) => {
  res.send('Get Ready For Job AI Backend is Running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
