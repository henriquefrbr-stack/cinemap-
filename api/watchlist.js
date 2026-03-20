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

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'invalid token' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('watchlist')
      .select('movie_id, movie_data, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data || [] });
  }

  if (req.method === 'POST') {
    const { movie } = req.body || {};
    if (!movie?.id) return res.status(400).json({ error: 'missing movie' });
    const movie_data = {
      id: movie.id, title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average
    };
    const { error } = await supabase.from('watchlist').upsert(
      { user_id: user.id, movie_id: movie.id, movie_data },
      { onConflict: 'user_id,movie_id' }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { movie_id } = req.body || {};
    if (!movie_id) return res.status(400).json({ error: 'missing movie_id' });
    const { error } = await supabase.from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movie_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
