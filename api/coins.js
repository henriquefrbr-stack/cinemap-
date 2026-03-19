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
    .select('coins')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(404).json({ error: 'profile not found' });
  if (profile.coins <= 0) return res.status(402).json({ error: 'no coins' });

  const { data: updated } = await supabase
    .from('profiles')
    .update({ coins: profile.coins - 1 })
    .eq('id', user.id)
    .select('coins')
    .single();

  return res.status(200).json({ coins: updated.coins });
}
