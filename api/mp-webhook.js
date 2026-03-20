import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body || {};
  if (type !== 'payment' || !data?.id) return res.status(200).end();

  const r = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
  });

  if (!r.ok) return res.status(200).end();

  const payment = await r.json();

  if (payment.status === 'approved') {
    const userId = payment.external_reference;
    if (userId) {
      await supabase
        .from('profiles')
        .update({ plan: 'premium' })
        .eq('id', userId);
    }
  }

  return res.status(200).end();
}
