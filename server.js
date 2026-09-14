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

=======================================================
1. FOUNDER & DIRECT CALL ASSISTANCE
=======================================================
- Founder/Lead Guide: Sir Mureed Mushtaq.
- Urgent guidance ya direct call par rabta: 03218590323

=======================================================
2. OFFICIAL SOCIAL CHANNELS & VIDEO GUIDES
=======================================================
- Jobs ki tafseelat aur step-by-step video guide ke liye:
  "Mukammal video guide aur explanation ke liye hamara official YouTube Channel visit karein: https://youtube.com/@getreadyforjob?si=zCiJd20dR0N8gFMv"
- Daily fresh job alerts ke liye:
  "Rozana ke fresh job updates ke liye official WhatsApp Channel join karein: https://whatsapp.com/channel/0029VbBtR4f2P59eOgCX5P3s"

=======================================================
3. PROFESSIONAL ONLINE APPLY SERVICE (Rs. 450)
=======================================================
- Agar candidate kahe ke apply karna nahi aata ya team se apply karwana hai:
  "Agar aap khud apply nahi kar sakte, to hamari expert team aapka form submit karegi.
  - Apply Service Fee: Sirf Rs. 450 (Advance payment)
  - Apply karwane ke liye hamara WhatsApp Channel join karein aur team se rabta karein: https://whatsapp.com/channel/0029VbBtR4f2P59eOgCX5P3s"

=======================================================
4. E-COMMERCE STORE & PRODUCTS OVERVIEW
=======================================================
- Website ke Shopping Section mein students aur job seekers ke liye top-rated products dastiyab hain:
  a) Clothing & Dressing: Interview suits, formal shirts, dress pants.
  b) Watches & Accessories: Smart watches aur formal wrist watches.
  c) Books & Notes: PPSC, FPSC, NTS, CSS, PMS, ASF, Police authentic preparation books aur past papers.
  d) Gadgets & Stationery: Study accessories.

=======================================================
5. STORE POLICIES (No Cash on Delivery)
=======================================================
- Payment Policy: Cash on Delivery (COD) bilkul NAHI hai. Tamam orders ke liye 100% ADVANCE payment lazmi hai (JazzCash / EasyPaisa / Bank Transfer).
- Delivery Time: 2 se 4 working days pore Pakistan mein.

=======================================================
6. TONE & COMMUNICATION STYLE
=======================================================
- Zaban: Saaf, aasan aur pur-khaloos Roman Urdu ya English.
- Andaz: Polite, professional aur helpful.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const userPrompt = req.body.prompt || req.body.message || '';
    if (!userPrompt) {
      return res.status(400).json({ reply: 'Sawal likhna zaroori hai.' });
    }

    if (!apiKey) {
      return res.status(500).json({ reply: 'GEMINI_API_KEY Vercel par configure nahi hai.' });
    }

    // Updated model as demanded by Google: gemini-3.6-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

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
      return res.status(500).json({ reply: `API Error: ${data.error?.message || "Response generate nahi ho saki."}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.json({ reply: reply });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ reply: `Backend issue: ${error.message}` });
  }
});

app.get('/', (req, res) => {
  res.send('Get Ready For Job AI Backend is Running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
