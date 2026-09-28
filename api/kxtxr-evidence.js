function entry(statement, basis, refs = []) {
  return { statement: String(statement || '').slice(0, 2000), basis: String(basis || '').slice(0, 1000), refs: refs.map(String).slice(0, 20) };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  const expected = process.env.KXTXR_CONTROL_TOKEN;
  const incoming = req.headers['x-kxtxr-control-token'];
  if (!expected || incoming !== expected) return res.status(401).json({ ok: false, error: 'control_token_invalid' });

  const gatewayToken = process.env.SFI_EXTERNAL_TOKEN;
  const endpoint = process.env.SFI_STRUCTURED_RESULT_URL || 'https://systemfriction.org/api/external/v1/result';
  if (!gatewayToken) return res.status(503).json({ ok: false, error: 'sfi_connector_unconfigured' });

  try {
    const p = req.body || {};
    const obs = Array.isArray(p.observed) ? p.observed : [];
    const declared = Array.isArray(p.declared) ? p.declared : [];
    const derived = Array.isArray(p.derived) ? p.derived : [];
    const missing = Array.isArray(p.missing) ? p.missing : [];
    const id = String(p.id || `kxtxr-${Date.now()}`).slice(0, 200);
    const platform = String(p.platform || 'unknown').slice(0, 80);
    const piece = String(p.piece || 'unknown').slice(0, 80);
    const campaign = String(p.campaign || 'QUE NO').slice(0, 120);
    const observedAt = String(p.observedAt || new Date().toISOString());

    const envelope = {
      objective: String(p.objective || 'Observe KXTXR representation return and regime-transition variables without inferring platform causality.').slice(0, 2000),
      lineage: ['kxtxr', campaign, piece, platform, id],
      object: {
        objectKey: `kxtxr:${campaign}:${piece}:${platform}:${id}`,
        id,
        kind: 'json',
        name: `KXTXR ${campaign} ${piece} ${platform} observation`,
        materialIdentityVerified: false,
        assetRef: String(p.assetRef || '').slice(0, 1000),
        metadata: { campaign, piece, platform, representation: String(p.representation || '').slice(0, 300) },
        provenance: { sourceRef: platform, acquisitionMethod: String(p.acquisitionMethod || 'operator_or_platform_export').slice(0, 300), observedAt }
      },
      result: {
        summary: String(p.summary || 'KXTXR platform observation returned as a sanitized structured result.').slice(0, 3000),
        measurements: {
          summary: String(p.measurementSummary || '').slice(0, 3000),
          rowCount: Number.isFinite(Number(p.rowCount)) ? Number(p.rowCount) : undefined,
          fields: Array.isArray(p.fields) ? p.fields.map(String).slice(0, 100) : [],
          custom: {
            metrics: p.metrics && typeof p.metrics === 'object' ? p.metrics : {},
            regimeVector: p.regimeVector && typeof p.regimeVector === 'object' ? p.regimeVector : {},
            regimeCandidate: String(p.regimeCandidate || 'OBSERVING').slice(0, 100),
            kry: p.kry == null ? null : (Number.isFinite(Number(p.kry)) ? Number(p.kry) : null)
          },
          measurementLimitations: Array.isArray(p.limitations) ? p.limitations.map(String).slice(0, 50) : []
        },
        epistemicPartition: {
          observed: obs.map(x => entry(x.statement || x, x.basis || platform, x.refs || [])),
          declared: declared.map(x => entry(x.statement || x, x.basis || 'operator declaration', x.refs || [])),
          derived: derived.map(x => entry(x.statement || x, x.basis || 'KXTXR control-plane derivation', x.refs || [])),
          inferred: [], simulated: [],
          missing: missing.map(x => entry(x.statement || x, x.basis || 'not observed', x.refs || [])),
          unresolved: []
        },
        hypotheses: Array.isArray(p.hypotheses) ? p.hypotheses.slice(0, 10) : [],
        rivals: Array.isArray(p.rivals) ? p.rivals.slice(0, 10) : [],
        risks: [],
        invariants: ['PUBLICATION != EVIDENCE','ENGAGEMENT != CAUSALITY','REGIME_CANDIDATE != CALIBRATED_TRANSITION','AI_RECOMMENDATION != HUMAN_AUTHORITY'],
        unresolved: Array.isArray(p.unresolved) ? p.unresolved.map(String).slice(0, 50) : [],
        metadata: { schema: 'KXTXR_EVIDENCE_ENVELOPE_V1', source: 'KXTXR_CONTROL_PLANE' }
      },
      analyzer: { name: 'KXTXR Control Plane', provider: 'kxtxr', method: 'representation_return_regime_transition', version: '1.0.0' }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gatewayToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ ok: false, error: 'sfi_gateway_rejected', result });
    return res.status(200).json({ ok: true, persisted: true, result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'evidence_persist_failed' });
  }
}
