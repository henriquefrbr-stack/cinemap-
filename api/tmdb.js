const ALLOWED_ORIGINS = ['https://www.cinemap.com.br', 'https://cinemap.com.br'];
const ALLOWED_PATHS = /^(search\/movie|movie\/\d+\/recommendations|movie\/\d+\/similar|movie\/\d+)$/;

export default async function handler(req, res) {
  // Verificar origem
  const origin = req.headers.origin || req.headers.referer || '';
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o))
    || origin.includes('localhost')
    || origin.includes('vercel.app');

  if (!isAllowed) return res.status(403).json({ error: 'forbidden' });

  res.setHeader('Access-Control-Allow-Origin', origin);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'path required' });

  // Bloquear paths fora do esperado (evita uso indevido do proxy)
  if (!ALLOWED_PATHS.test(path.replace(/^\//, ''))) {
    return res.status(400).json({ error: 'invalid path' });
  }

  const url = new URL(`https://api.themoviedb.org/3/${path.replace(/^\//, '')}`);
  url.searchParams.set('api_key', process.env.TMDB_KEY);
  url.searchParams.set('language', 'pt-BR');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const r = await fetch(url);
  const data = await r.json();
  res.status(r.status).json(data);
}
