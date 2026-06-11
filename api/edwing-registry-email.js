// Vercel Serverless Function: /api/edwing-registry-email
// NO VA EN /public.
// Variables de entorno requeridas en Vercel:
// - KXTXR_REGISTRY_TOKEN           token privado que Edwing escribe en el sitio
// - RESEND_API_KEY                 API key de Resend
// - REGISTRY_TO_EMAIL              s115.kxtxr@proton.mx
// - REGISTRY_FROM_EMAIL            remitente verificado en Resend

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const expectedToken = process.env.KXTXR_REGISTRY_TOKEN;
    const incomingToken = req.headers["x-kxtxr-registry-token"];

    if (!expectedToken || incomingToken !== expectedToken) {
      return res.status(401).json({ ok: false, error: "registry_token_invalid" });
    }

    const payload = req.body || {};
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.REGISTRY_TO_EMAIL || "s115.kxtxr@proton.mx";
    const from = process.env.REGISTRY_FROM_EMAIL;

    if (!apiKey || !from) {
      return res.status(500).json({
        ok: false,
        error: "missing_email_environment",
        required: ["RESEND_API_KEY", "REGISTRY_FROM_EMAIL"]
      });
    }

    const latest = payload.latest_entry || {};
    const subject = `[KXTXR.REGISTRY] ${latest.window_code || "REGISTRO"} // REM618 // Edwing`;

    const jsonText = JSON.stringify(payload, null, 2);
    const attachmentBase64 = Buffer.from(jsonText, "utf8").toString("base64");

    const summary = [
      "KXTXR.REGISTRY // EDWING",
      "",
      `Ventana: ${latest.window_code || "N/A"}`,
      `Perturbación: ${latest.perturbation || "N/A"}`,
      `Decisión: ${latest.decision || "N/A"}`,
      "",
      "Cálculos:",
      JSON.stringify(payload.calculations || {}, null, 2),
      "",
      "El JSON completo va adjunto."
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: summary,
        attachments: [
          {
            filename: `kxtxr-edwing-${latest.window_code || "registry"}.json`,
            content: attachmentBase64
          }
        ]
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: "email_provider_failed", result });
    }

    return res.status(200).json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "email_failed" });
  }
}
