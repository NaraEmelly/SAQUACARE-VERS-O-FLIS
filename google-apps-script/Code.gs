const FEEDBACK_RECIPIENT = "saquacare2026@gmail.com";
const FEEDBACK_CATEGORIES = [
  "Sugestão de melhoria",
  "Experiência de uso",
  "Acessibilidade",
  "Nova funcionalidade",
  "Outro comentário",
];

function doPost(event) {
  const parameters = getRequestParameters(event);

  if (parameters.website) {
    return createResponse({ ok: true });
  }

  const name = String(parameters.name || "").trim().replace(/[\r\n]/g, " ");
  const category = String(parameters.category || "");
  const rating = Number(parameters.rating);
  const message = String(parameters.message || "").trim();

  if (
    name.length > 100 ||
    !FEEDBACK_CATEGORIES.includes(category) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    message.length < 1 ||
    message.length > 2000
  ) {
    return createResponse({ ok: false, error: "invalid_feedback" });
  }

  try {
    const displayName = name || "Não informado";
    const escapedName = escapeHtml(displayName);
    const escapedCategory = escapeHtml(category);
    const escapedMessage = escapeHtml(message);
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    MailApp.sendEmail({
      to: FEEDBACK_RECIPIENT,
      name: `SaquaCare | ${displayName}`,
      subject: `Feedback SaquaCare | ${displayName} | ${category}`,
      body: [
        `Nome: ${displayName}`,
        `Categoria: ${category}`,
        `Avaliação: ${rating}/5 estrelas`,
        "",
        "Feedback:",
        message,
      ].join("\n"),
      htmlBody: `
        <div style="margin:0;padding:32px 16px;background:#f3f6f5;font-family:Arial,Helvetica,sans-serif;color:#243b3a;">
          <div style="max-width:600px;margin:0 auto;border:1px solid #dce7e4;border-radius:16px;background:#ffffff;overflow:hidden;">
            <div style="padding:24px 28px;background:#176b67;color:#ffffff;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;opacity:.85;">SaquaCare</p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;">Novo feedback recebido</h1>
            </div>
            <div style="padding:24px 28px;">
              <div style="margin-bottom:20px;padding:16px;border-radius:12px;background:#f3f8f7;">
                <p style="margin:0 0 6px;color:#627674;font-size:12px;text-transform:uppercase;letter-spacing:.8px;">Avaliação</p>
                <p style="margin:0;color:#d29300;font-size:26px;letter-spacing:3px;">${stars}</p>
                <p style="margin:4px 0 0;color:#243b3a;font-size:14px;">${rating} de 5 estrelas</p>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:10px 0;color:#627674;">Nome</td>
                  <td style="padding:10px 0;text-align:right;font-weight:600;">${escapedName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #edf1f0;color:#627674;">Categoria</td>
                  <td style="padding:10px 0;border-top:1px solid #edf1f0;text-align:right;font-weight:600;">${escapedCategory}</td>
                </tr>
              </table>
              <div style="margin-top:20px;padding:18px;border:1px solid #e6eeec;border-radius:12px;">
                <p style="margin:0 0 10px;color:#627674;font-size:12px;text-transform:uppercase;letter-spacing:.8px;">Mensagem</p>
                <p style="margin:0;color:#243b3a;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapedMessage}</p>
              </div>
            </div>
            <div style="padding:14px 28px;border-top:1px solid #edf1f0;color:#80908e;font-size:12px;">
              Enviado pelo formulário de feedback do SaquaCare.
            </div>
          </div>
        </div>
      `,
    });

    return createResponse({ ok: true });
  } catch (error) {
    console.error(error && error.message ? error.message : "Falha ao enviar feedback.");
    return createResponse({ ok: false, error: "send_failed" });
  }
}

function getRequestParameters(event) {
  const parameters = Object.assign({}, event && event.parameter ? event.parameter : {});
  const body = event && event.postData ? event.postData.contents : "";

  if (!body) return parameters;

  body.split("&").forEach((entry) => {
    const separator = entry.indexOf("=");
    const key = decodeFormValue(separator < 0 ? entry : entry.slice(0, separator));
    const value = decodeFormValue(separator < 0 ? "" : entry.slice(separator + 1));
    parameters[key] = value;
  });

  return parameters;
}

function decodeFormValue(value) {
  return decodeURIComponent(value.replace(/\+/g, " "));
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
