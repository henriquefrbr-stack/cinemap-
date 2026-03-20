import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'no token' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'invalid token' });

  const baseUrl = process.env.APP_URL || 'https://www.cinemap.com.br';

  // MP exige start_date no futuro
  const startDate = new Date(Date.now() + 60 * 1000).toISOString();

  const subscription = {
    reason: 'Cinemap Premium',
    external_reference: user.id,
    payer_email: user.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: 9.90,
      currency_id: 'BRL',
      start_date: startDate
    },
    back_url: `${baseUrl}/?payment=success`,
    status: 'pending'
  };

  const r = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  });

  const data = await r.json();
  if (!r.ok) return res.status(500).json({ error: 'mp_error', details: data });

  return res.status(200).json({ checkout_url: data.init_point });
}
