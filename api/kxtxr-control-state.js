export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  return res.status(200).json({
    ok: true,
    schema: 'KXTXR_CONTROL_STATE_V1',
    generatedAt: new Date().toISOString(),
    connectors: {
      metricool: {
        serverApiConfigured: Boolean(process.env.METRICOOL_USER_TOKEN && process.env.METRICOOL_USER_ID && (process.env.METRICOOL_BLOG_ID || '7111220')),
        schedulerEndpointReady: Boolean(process.env.METRICOOL_USER_TOKEN && process.env.METRICOOL_USER_ID),
        blogId: process.env.METRICOOL_BLOG_ID || '7111220',
        note: 'ChatGPT MCP connection is not the same as production server API configuration.'
      },
      sfi: {
        structuredResultConfigured: Boolean(process.env.SFI_EXTERNAL_TOKEN),
        endpoint: process.env.SFI_STRUCTURED_RESULT_URL || 'https://systemfriction.org/api/external/v1/result'
      },
      operator: {
        tokenConfigured: Boolean(process.env.KXTXR_CONTROL_TOKEN)
      },
      ai: {
        configured: Boolean(process.env.OPENAI_API_KEY),
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        boundary: 'Server-side only; browser never receives OPENAI_API_KEY.'
      },
      githubMutation: {
        configured: Boolean(process.env.GITHUB_KXTXR_TOKEN),
        mode: 'JSON_MANIFEST_PR_ONLY'
      }
    }
  });
}
