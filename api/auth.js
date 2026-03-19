import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'no token' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'invalid token' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(404).json({ error: 'profile not found' });

  // Reset diário de moedas
  const today = new Date().toISOString().split('T')[0];
  if (profile.coins_reset_at !== today) {
    const maxCoins = profile.plan === 'premium' ? 999 : 5;
    await supabase
      .from('profiles')
      .update({ coins: maxCoins, coins_reset_at: today })
      .eq('id', user.id);
    profile.coins = maxCoins;
    profile.coins_reset_at = today;
  }

  return res.status(200).json({ coins: profile.coins, plan: profile.plan });
}
