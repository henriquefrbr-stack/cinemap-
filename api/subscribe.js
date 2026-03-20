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

  const isSandbox = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-');
  const baseUrl   = process.env.APP_URL || 'https://cinemap-nl99.vercel.app';

  const preference = {
    items: [{
      title: 'Cinemap Premium',
      description: '999 moedas por dia para explorar o universo do cinema',
      quantity: 1,
      currency_id: 'BRL',
      unit_price: 19.90
    }],
    payer: { email: user.email },
    back_urls: {
      success: `${baseUrl}/?payment=success`,
      failure: `${baseUrl}/?payment=failure`,
      pending: `${baseUrl}/?payment=pending`
    },
    auto_return: 'approved',
    external_reference: user.id,
    notification_url: `${baseUrl}/api/mp-webhook`
  };

  const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preference)
  });

  const data = await r.json();
  if (!r.ok) return res.status(500).json({ error: 'mp_error', details: data });

  const url = isSandbox ? data.sandbox_init_point : data.init_point;
  return res.status(200).json({ checkout_url: url });
}
