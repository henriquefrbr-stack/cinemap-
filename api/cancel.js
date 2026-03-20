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

  const { data: profile } = await supabase
    .from('profiles')
    .select('mp_subscription_id, plan')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(404).json({ error: 'profile not found' });
  if (profile.plan !== 'premium') return res.status(400).json({ error: 'not premium' });

  // Cancela no Mercado Pago se tiver ID da assinatura
  if (profile.mp_subscription_id) {
    await fetch(`https://api.mercadopago.com/preapproval/${profile.mp_subscription_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
  }

  // Rebaixa o plano no Supabase
  await supabase
    .from('profiles')
    .update({ plan: 'free', mp_subscription_id: null })
    .eq('id', user.id);

  return res.status(200).json({ ok: true });
}
