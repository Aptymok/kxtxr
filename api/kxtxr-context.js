export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'kxtxr.vercel.app');
  const proto = String(req.headers['x-forwarded-proto'] || 'https');
  const base = proto + '://' + host;
  const routes = {
    music: '/data/music-field.json',
    observations: '/data/observation-schema.json',
    knowledge: '/data/knowledge-plane.json',
    control: '/data/control-plane.json',
    regime: '/data/regime-transition.json',
    campaign: '/campaigns/que-no/representation-engine.json',
    discovery: '/grimoire/discovery-mesh.json',
    ai_governance: '/data/ai-governance.json'
  };

  try {
    const entries = await Promise.all(Object.entries(routes).map(async ([key,path]) => {
      const response = await fetch(base + path, { headers: { accept: 'application/json' } });
      if (!response.ok) return [key, { status: 'UNAVAILABLE', httpStatus: response.status, source: path }];
      return [key, await response.json()];
    }));
    const context = Object.fromEntries(entries);

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      ok: true,
      schema: 'KXTXR_AI_CONTEXT_CAPSULE_V1',
      generatedAt: new Date().toISOString(),
      authority: {
        artist: 'KXTXR',
        human_operator: 'Edwing',
        ai: 'observer / curator / proposal generator',
        external_evidence_plane: 'System Friction Institute'
      },
      epistemicRule: 'SOURCE != OBSERVATION != DERIVATION != INFERENCE != DECISION != RETURN',
      context,
      agentBoundary: [
        'Do not infer missing audio or platform data.',
        'Do not convert pairwise distance into artistic quality.',
        'Do not convert platform metrics into algorithm causality.',
        'Do not declare a calibrated regime transition.',
        'Do not mutate artistic canon or publish without human authority.'
      ]
    });
  } catch (error) {
    return res.status(503).json({ ok: false, error: 'context_hydration_failed', message: error.message || 'unknown' });
  }
}
