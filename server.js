import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

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
- Agar candidate apply na kar sake: Hamari expert team apply karegi.
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

// Supported model names in Google AI Studio
const CANDIDATE_MODELS = [
  "gemini-1.5-flash-latest",
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.5-pro-latest"
];

app.post('/api/chat', async (req, res) => {
  try {
    const userPrompt = req.body.prompt || req.body.message || '';
    if (!userPrompt) {
      return res.status(400).json({ reply: 'Sawal likhna zaroori hai.' });
    }

    if (!apiKey) {
      return res.status(500).json({ reply: 'GEMINI_API_KEY Vercel par configure nahi hai.' });
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${userPrompt}`;
    let responseText = null;
    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} not available, switching to fallback...`);
      }
    }

    if (!responseText) {
      throw lastError || new Error("Koi bhi model available nahi mila.");
    }

    return res.json({ reply: responseText });
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
