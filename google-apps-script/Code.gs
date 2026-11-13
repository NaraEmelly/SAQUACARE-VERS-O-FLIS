const FEEDBACK_RECIPIENT = "saquacare2026@gmail.com";
const FEEDBACK_CATEGORIES = [
  "Sugestão de melhoria",
  "Experiência de uso",
  "Acessibilidade",
  "Nova funcionalidade",
  "Outro comentário",
];

function doPost(event) {
  const parameters = event && event.parameter ? event.parameter : {};

  if (parameters.website) {
    return createResponse({ ok: true });
  }

  const name = String(parameters.name || "").trim();
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
    MailApp.sendEmail({
      to: FEEDBACK_RECIPIENT,
      subject: `Feedback SaquaCare: ${category}`,
      body: [
        `Nome: ${name || "Não informado"}`,
        `Categoria: ${category}`,
        `Avaliação: ${rating}/5 estrelas`,
        "",
        "Feedback:",
        message,
      ].join("\n"),
    });

    return createResponse({ ok: true });
  } catch (error) {
    console.error(error && error.message ? error.message : "Falha ao enviar feedback.");
    return createResponse({ ok: false, error: "send_failed" });
  }
}

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
