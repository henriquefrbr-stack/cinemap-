const ALLOWED_ORIGINS = ['https://www.cinemap.com.br', 'https://cinemap.com.br'];
const ALLOWED_MODELS = ['llama-3.3-70b-versatile'];

export default async function handler(req, res) {
  // Verificar origem
  const origin = req.headers.origin || req.headers.referer || '';
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o))
    || origin.includes('localhost')
    || origin.includes('vercel.app');

  if (!isAllowed) return res.status(403).json({ error: 'forbidden' });

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { model, messages, temperature, max_tokens } = req.body;

  // Bloquear modelos não autorizados e limitar tokens
  if (!ALLOWED_MODELS.includes(model)) return res.status(400).json({ error: 'invalid model' });
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'invalid messages' });
  if (max_tokens > 600) return res.status(400).json({ error: 'max_tokens too high' });

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  });

  const data = await r.json();
  res.status(r.status).json(data);
}
