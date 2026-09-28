function text(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}
function urls(value) {
  const list = Array.isArray(value) ? value : [];
  return list.map(item => text(item, 2000)).filter(item => /^https:\/\//i.test(item)).slice(0, 10);
}
function parseResponse(raw) {
  try { return JSON.parse(raw); } catch { return { raw: raw.slice(0, 6000) }; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const expected = process.env.KXTXR_CONTROL_TOKEN;
  const incoming = req.headers['x-kxtxr-control-token'];
  if (!expected || incoming !== expected) {
    return res.status(401).json({ ok: false, error: 'control_token_invalid' });
  }

  const userToken = process.env.METRICOOL_USER_TOKEN;
  const userId = process.env.METRICOOL_USER_ID;
  const blogId = process.env.METRICOOL_BLOG_ID || '7111220';
  if (!userToken || !userId || !blogId) {
    return res.status(503).json({
      ok: false,
      error: 'metricool_api_unconfigured',
      required: ['METRICOOL_USER_TOKEN', 'METRICOOL_USER_ID', 'METRICOOL_BLOG_ID']
    });
  }

  const body = req.body || {};
  const network = text(body.network, 30).toLowerCase();
  if (!['instagram', 'tiktok'].includes(network)) {
    return res.status(400).json({ ok: false, error: 'unsupported_network' });
  }

  const dateTime = text(body.dateTime, 40);
  const timezone = text(body.timezone || 'America/Mexico_City', 80);
  const postText = text(body.text, 12000);
  const media = urls(body.media);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(dateTime)) {
    return res.status(400).json({ ok: false, error: 'publication_datetime_invalid' });
  }
  if (!postText) return res.status(400).json({ ok: false, error: 'text_required' });
  if (!media.length) {
    return res.status(400).json({
      ok: false,
      error: 'media_required_for_kxtxr_social',
      boundary: 'Instagram/TikTok execution requires an explicit public non-expiring media URL.'
    });
  }

  const outbound = {
    publicationDate: { dateTime: dateTime.length === 16 ? dateTime + ':00' : dateTime, timezone },
    text: postText,
    providers: [{ network }],
    autoPublish: body.autoPublish !== false,
    draft: Boolean(body.draft),
    shortener: false,
    saveExternalMediaFiles: true,
    media
  };

  if (network === 'instagram') {
    const type = text(body.instagramType || 'POST', 20).toUpperCase();
    if (!['POST', 'REEL', 'STORY', 'TRIAL_REEL'].includes(type)) {
      return res.status(400).json({ ok: false, error: 'instagram_type_invalid' });
    }
    outbound.instagramData = { type };
  }

  if (body.dryRun === true) {
    return res.status(200).json({
      ok: true,
      dryRun: true,
      schema: 'KXTXR_METRICOOL_SCHEDULE_PREVIEW_V1',
      blogId,
      outbound,
      boundary: 'No external write performed.'
    });
  }

  const endpoint = 'https://app.metricool.com/api/v2/scheduler/posts?blogId=' +
    encodeURIComponent(blogId) + '&userId=' + encodeURIComponent(userId);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mc-Auth': userToken
      },
      body: JSON.stringify(outbound)
    });
    const raw = await response.text();
    const result = parseResponse(raw);
    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: 'metricool_scheduler_rejected',
        status: response.status,
        result
      });
    }
    return res.status(200).json({
      ok: true,
      scheduled: true,
      network,
      blogId,
      result,
      evidenceCandidate: {
        class: 'PLATFORM_ACTION',
        source: 'METRICOOL_API',
        observedAt: new Date().toISOString(),
        statement: 'Metricool accepted a KXTXR scheduling request for ' + network + '.'
      }
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'metricool_scheduler_unreachable', message: error.message || 'request_failed' });
  }
}
