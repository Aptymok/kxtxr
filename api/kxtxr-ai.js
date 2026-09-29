const MODES = new Set(['observe','curate','site_plan']);

function controlAuthorized(req) {
  const expected = process.env.KXTXR_CONTROL_TOKEN;
  const incoming = req.headers['x-kxtxr-control-token'];
  return Boolean(expected && incoming === expected);
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  const chunks = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') chunks.push(content.text);
      if (typeof content?.text === 'string' && !content?.type) chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

function schemaFor(mode) {
  const evidenceItem = {
    type:'object',
    additionalProperties:false,
    properties:{
      statement:{type:'string'},
      basis:{type:'string'},
      refs:{type:'array',items:{type:'string'}}
    },
    required:['statement','basis','refs']
  };

  if (mode === 'observe') return {
    type:'object',
    additionalProperties:false,
    properties:{
      summary:{type:'string'},
      observed:{type:'array',items:evidenceItem},
      derived:{type:'array',items:evidenceItem},
      inferred:{type:'array',items:evidenceItem},
      missing:{type:'array',items:evidenceItem},
      contradictions:{type:'array',items:{type:'string'}},
      hypotheses:{type:'array',items:{type:'string'}},
      rivals:{type:'array',items:{type:'string'}},
      fieldSignals:{type:'array',items:{
        type:'object',additionalProperties:false,
        properties:{
          fieldId:{type:'string'},
          status:{type:'string',enum:['SUPPORTED','WEAK','MISSING','CANDIDATE']},
          rationale:{type:'string'},
          evidenceRefs:{type:'array',items:{type:'string'}}
        },
        required:['fieldId','status','rationale','evidenceRefs']
      }},
      regime:{type:'object',additionalProperties:false,
        properties:{
          state:{type:'string',enum:['BASELINE_MISSING','OBSERVING','TRANSITION_CANDIDATE','CALIBRATION_REQUIRED']},
          rationale:{type:'string'}
        },
        required:['state','rationale']
      },
      nextObservation:{type:'string'}
    },
    required:['summary','observed','derived','inferred','missing','contradictions','hypotheses','rivals','fieldSignals','regime','nextObservation']
  };

  if (mode === 'curate') return {
    type:'object',
    additionalProperties:false,
    properties:{
      summary:{type:'string'},
      operations:{type:'array',items:{
        type:'object',additionalProperties:false,
        properties:{
          operation:{type:'string',enum:['ADD','UPDATE','SUSPEND','DEPRECATE','NO_CHANGE']},
          fieldId:{type:'string'},
          plane:{type:'string',enum:['MUSIC','REPRESENTATION','RETURN','REGIME']},
          proposedStatus:{type:'string',enum:['CANDIDATE','ACTIVE','SUSPENDED','DEPRECATED']},
          epistemicClass:{type:'string'},
          meaning:{type:'string'},
          rationale:{type:'string'},
          evidenceRefs:{type:'array',items:{type:'string'}},
          rival:{type:'string'},
          testWindow:{type:'string'}
        },
        required:['operation','fieldId','plane','proposedStatus','epistemicClass','meaning','rationale','evidenceRefs','rival','testWindow']
      }},
      unchangedFields:{type:'array',items:{type:'string'}},
      warnings:{type:'array',items:{type:'string'}}
    },
    required:['summary','operations','unchangedFields','warnings']
  };

  return {
    type:'object',
    additionalProperties:false,
    properties:{
      summary:{type:'string'},
      trigger:{type:'string'},
      informationGain:{type:'number',minimum:0,maximum:1},
      identityPreservation:{type:'number',minimum:0,maximum:1},
      reversibility:{type:'number',minimum:0,maximum:1},
      perturbationCost:{type:'number',minimum:0,maximum:1},
      changes:{type:'array',items:{
        type:'object',additionalProperties:false,
        properties:{
          path:{type:'string'},
          action:{type:'string',enum:['UPDATE','ADD','NO_CHANGE']},
          purpose:{type:'string'},
          sourceRefs:{type:'array',items:{type:'string'}},
          exactFields:{type:'array',items:{type:'string'}},
          proposedContent:{type:'string'},
          constraints:{type:'array',items:{type:'string'}},
          rollback:{type:'string'}
        },
        required:['path','action','purpose','sourceRefs','exactFields','proposedContent','constraints','rollback']
      }},
      doNotChange:{type:'array',items:{type:'string'}},
      qa:{type:'array',items:{type:'string'}},
      humanDecisionRequired:{type:'boolean'}
    },
    required:['summary','trigger','informationGain','identityPreservation','reversibility','perturbationCost','changes','doNotChange','qa','humanDecisionRequired']
  };
}

function instructionsFor(mode) {
  const common = `
You are operating inside KXTXR, an artist-controlled system observed by System Friction Institute.
Use only the supplied context and local observations.
Maintain strict epistemic partitions: SOURCE != OBSERVATION != DERIVATION != INFERENCE != DECISION != RETURN.
Never infer missing facts. Audio relation is not artistic quality. Platform metrics are not algorithm causality.
A regime candidate is not a calibrated transition. AI proposal is not human authority.
Edwing retains artistic/publication authority. SFI is an external evidence/RETURN plane, not the artist.
`;

  if (mode === 'observe') return common + `
Role: AI_OBSERVER. Describe the current field, identify evidence gaps, contradictions, hypotheses and rivals.
Treat local browser observations as unpersisted operator observations unless a receipt proves otherwise.
Do not recommend engagement manipulation or fabricate platform behavior.
`;

  if (mode === 'curate') return common + `
Role: FIELD_CURATOR. Decide whether the observation schema needs ADD/UPDATE/SUSPEND/DEPRECATE/NO_CHANGE proposals.
Prefer NO_CHANGE when evidence is weak. New fields begin CANDIDATE unless there is an explicit governed reason otherwise.
Every mutation requires evidence references, a rival explanation and a bounded test window.
`;

  return common + `
Role: SITE_EDITOR. Propose the smallest reversible site mutation that can increase information gain while preserving KXTXR identity.
Produce a plan, not executable code. Do not write main. Do not alter masters, historical preserved artifacts or artist identity.
Use only repo-relative paths allowed by the governance policy. Prefer data/manifest changes before visual churn.
Every proposed change must state source refs, exact fields, constraints and rollback.
`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }
  if (!controlAuthorized(req)) return res.status(401).json({ok:false,error:'control_token_invalid'});

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ok:false,error:'openai_unconfigured',required:['OPENAI_API_KEY']});

  const body = req.body || {};
  const mode = String(body.mode || 'observe');
  if (!MODES.has(mode)) return res.status(400).json({ok:false,error:'mode_invalid'});

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'kxtxr.vercel.app');
  const proto = String(req.headers['x-forwarded-proto'] || 'https');
  const base = proto + '://' + host;

  try {
    const [contextResponse, governanceResponse] = await Promise.all([
      fetch(base + '/api/kxtxr-context', {headers:{accept:'application/json'}}),
      fetch(base + '/data/ai-governance.json', {headers:{accept:'application/json'}})
    ]);
    if (!contextResponse.ok || !governanceResponse.ok) {
      return res.status(503).json({ok:false,error:'context_unavailable'});
    }
    const context = await contextResponse.json();
    const governance = await governanceResponse.json();

    const localObservations = Array.isArray(body.localObservations) ? body.localObservations.slice(-24) : [];
    const payload = {
      context,
      governance,
      selectedTrackId: body.selectedTrackId || null,
      operatorInstruction: String(body.instruction || '').slice(0,4000),
      localObservations
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{
        Authorization:'Bearer ' + apiKey,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        instructions: instructionsFor(mode),
        input: JSON.stringify(payload),
        text:{
          format:{
            type:'json_schema',
            name:'kxtxr_' + mode,
            strict:true,
            schema:schemaFor(mode)
          }
        }
      })
    });

    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        ok:false,
        error:'openai_response_rejected',
        status:response.status,
        detail:raw?.error?.message || null
      });
    }

    const outputText = extractOutputText(raw);
    let result;
    try { result = JSON.parse(outputText); }
    catch {
      return res.status(502).json({ok:false,error:'structured_output_parse_failed'});
    }

    return res.status(200).json({
      ok:true,
      schema:'KXTXR_AI_RUN_V1',
      mode,
      model:raw.model || process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      responseId:raw.id || null,
      generatedAt:new Date().toISOString(),
      result,
      boundary:'AI output is a proposal/analysis object. It does not publish, mutate main, or establish canonical truth.'
    });
  } catch (error) {
    return res.status(502).json({ok:false,error:'ai_run_failed',message:error.message || 'unknown'});
  }
}
