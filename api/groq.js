export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { model, messages, temperature, max_tokens } = req.body;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) {
    clearTimeout(timeout);
    res.status(504).json({ error: 'timeout' });
  }
}
