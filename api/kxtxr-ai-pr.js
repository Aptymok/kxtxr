const REPO = 'Aptymok/kxtxr';
const API = 'https://api.github.com';

const ALLOWED_JSON = new Set([
  'data/site-manifest.json',
  'data/visual-system.json',
  'data/observation-schema.json',
  'data/knowledge-plane.json',
  'data/control-plane.json',
  'data/regime-transition.json',
  'data/system-map.json',
  'grimoire/discovery-mesh.json',
  'campaigns/que-no/representation-engine.json'
]);

function authorized(req) {
  const expected = process.env.KXTXR_CONTROL_TOKEN;
  return Boolean(expected && req.headers['x-kxtxr-control-token'] === expected);
}
function ghHeaders(token) {
  return {
    Authorization:'Bearer ' + token,
    Accept:'application/vnd.github+json',
    'Content-Type':'application/json',
    'X-GitHub-Api-Version':'2022-11-28'
  };
}
function pointerParts(pointer) {
  if (pointer === '') return [];
  if (!pointer.startsWith('/')) throw new Error('json_pointer_invalid');
  return pointer.slice(1).split('/').map(x => x.replace(/~1/g,'/').replace(/~0/g,'~'));
}
function applyPatch(document, patch) {
  const parts = pointerParts(patch.path);
  if (!parts.length) throw new Error('root_replacement_forbidden');
  let target = document;
  for (let i=0;i<parts.length-1;i++) {
    const key = parts[i];
    if (target == null || typeof target !== 'object' || !(key in target)) throw new Error('json_pointer_parent_missing:' + patch.path);
    target = target[key];
  }
  const leaf = parts[parts.length-1];
  let value;
  try { value = JSON.parse(patch.valueJson); }
  catch { throw new Error('patch_value_json_invalid:' + patch.path); }

  if (Array.isArray(target)) {
    if (patch.op === 'add' && leaf === '-') {
      target.push(value);
      return;
    }
    const index = Number(leaf);
    if (!Number.isInteger(index) || index < 0) throw new Error('array_index_invalid:' + patch.path);
    if (patch.op === 'replace' && index >= target.length) throw new Error('replace_target_missing:' + patch.path);
    if (patch.op === 'add' && index <= target.length) target.splice(index,0,value);
    else target[index] = value;
    return;
  }

  if (target == null || typeof target !== 'object') throw new Error('patch_target_invalid:' + patch.path);
  if (patch.op === 'replace' && !(leaf in target)) throw new Error('replace_target_missing:' + patch.path);
  target[leaf] = value;
}
async function github(token, path, options={}) {
  const response = await fetch(API + path, {
    ...options,
    headers:{...ghHeaders(token),...(options.headers||{})}
  });
  const raw = await response.text();
  let data = {};
  try { data = JSON.parse(raw); } catch { data = {raw:raw.slice(0,5000)}; }
  if (!response.ok) {
    const error = new Error('github_api_' + response.status);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
function repoPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}
function compact(value, max=3500) {
  const t = String(value || '');
  return t.length > max ? t.slice(0,max) + '…' : t;
}

export default async function handler(req,res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }
  if (!authorized(req)) return res.status(401).json({ok:false,error:'control_token_invalid'});

  const token = process.env.GITHUB_KXTXR_TOKEN;
  if (!token) return res.status(503).json({ok:false,error:'github_mutation_unconfigured',required:['GITHUB_KXTXR_TOKEN']});

  const body = req.body || {};
  if (body.approvedByHuman !== true) return res.status(400).json({ok:false,error:'human_approval_required'});
  const plan = body.plan?.result || body.plan;
  if (!plan || !Array.isArray(plan.changes)) return res.status(400).json({ok:false,error:'site_plan_invalid'});

  const executable = plan.changes.filter(change =>
    change?.applyMode === 'JSON_PATCH' &&
    change?.action !== 'NO_CHANGE' &&
    ALLOWED_JSON.has(String(change?.path || '')) &&
    Array.isArray(change?.jsonPatch) &&
    change.jsonPatch.length > 0
  );

  if (!executable.length) {
    return res.status(400).json({
      ok:false,error:'no_executable_json_changes',
      note:'HTML/CSS/JS and non-allowlisted paths remain PLAN_ONLY.'
    });
  }

  for (const change of executable) {
    for (const patch of change.jsonPatch) {
      if (!['add','replace'].includes(patch?.op)) return res.status(400).json({ok:false,error:'patch_operation_forbidden'});
      if (typeof patch?.path !== 'string' || typeof patch?.valueJson !== 'string') return res.status(400).json({ok:false,error:'patch_shape_invalid'});
    }
  }

  const suffix = Date.now().toString(36);
  const branch = 'ai/kxtxr-' + suffix;
  try {
    const mainRef = await github(token, '/repos/' + REPO + '/git/ref/heads/main');
    const baseSha = mainRef.object?.sha;
    if (!baseSha) throw new Error('main_sha_missing');

    await github(token, '/repos/' + REPO + '/git/refs', {
      method:'POST',
      body:JSON.stringify({ref:'refs/heads/' + branch,sha:baseSha})
    });

    const applied = [];
    for (const change of executable) {
      const path = String(change.path);
      const current = await github(token, '/repos/' + REPO + '/contents/' + repoPath(path) + '?ref=' + encodeURIComponent(branch));
      const decoded = Buffer.from(String(current.content || '').replace(/\n/g,''),'base64').toString('utf8');
      let document;
      try { document = JSON.parse(decoded); }
      catch { throw new Error('target_json_invalid:' + path); }

      for (const patch of change.jsonPatch) applyPatch(document, patch);
      const next = JSON.stringify(document,null,2) + '\n';

      await github(token, '/repos/' + REPO + '/contents/' + repoPath(path), {
        method:'PUT',
        body:JSON.stringify({
          message:'ai: ' + compact(change.purpose,120),
          content:Buffer.from(next,'utf8').toString('base64'),
          sha:current.sha,
          branch
        })
      });
      applied.push({
        path,
        patches:change.jsonPatch.map(p => ({op:p.op,path:p.path})),
        purpose:compact(change.purpose,500)
      });
    }

    const title = 'AI proposal: ' + compact(plan.summary || 'KXTXR governed site mutation',120);
    const bodyText = [
      'Generated by KXTXR SITE_EDITOR and explicitly approved for PR creation by a human operator.',
      '',
      'This PR is not self-authoritative and is not auto-merged.',
      '',
      '## Trigger',
      compact(plan.trigger || 'N/D'),
      '',
      '## Applied JSON manifest changes',
      '\`\`\`json',
      JSON.stringify(applied,null,2),
      '\`\`\`',
      '',
      '## Boundaries',
      '- AI PROPOSAL != HUMAN AUTHORITY',
      '- AUDIO RELATION != ARTISTIC QUALITY',
      '- ENGAGEMENT != CAUSALITY',
      '- REGIME CANDIDATE != CALIBRATED TRANSITION',
      '- No master/historical asset mutation',
      '',
      '## QA requested',
      ...(Array.isArray(plan.qa) ? plan.qa.map(x => '- ' + compact(x,400)) : ['- Verify Vercel preview'])
    ].join('\n');

    const pr = await github(token, '/repos/' + REPO + '/pulls', {
      method:'POST',
      body:JSON.stringify({title,head:branch,base:'main',body:bodyText,draft:true})
    });

    return res.status(200).json({
      ok:true,
      schema:'KXTXR_AI_PR_V1',
      branch,
      pullRequest:{number:pr.number,url:pr.html_url,draft:pr.draft},
      applied,
      baseSha,
      boundary:'Draft PR only. No automatic merge or deployment to production.'
    });
  } catch (error) {
    return res.status(error.status || 502).json({
      ok:false,
      error:'github_pr_creation_failed',
      message:error.message || 'unknown',
      detail:error.data || null
    });
  }
}
