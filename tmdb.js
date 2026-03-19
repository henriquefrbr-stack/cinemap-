export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'path required' });

  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  url.searchParams.set('api_key', process.env.TMDB_KEY);
  url.searchParams.set('language', 'pt-BR');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const r = await fetch(url);
  const data = await r.json();
  res.status(r.status).json(data);
}
