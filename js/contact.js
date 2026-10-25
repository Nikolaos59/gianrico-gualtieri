(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const recipient = form.dataset.mailto;
  const status = form.querySelector("[data-form-status]");
  const language = document.documentElement.lang.slice(0, 2);
  const copy = {
    fr: { name: "Nom", email: "E-mail", subject: "Objet", message: "Message", ready: "Votre application de messagerie va s’ouvrir. Vérifiez le message puis confirmez son envoi dans cette application." },
    de: { name: "Name", email: "E-Mail", subject: "Betreff", message: "Nachricht", ready: "Ihr E-Mail-Programm wird geöffnet. Prüfen Sie die Nachricht und bestätigen Sie den Versand dort." },
    en: { name: "Name", email: "Email", subject: "Subject", message: "Message", ready: "Your email app will open. Review the message and send it from that app." },
    it: { name: "Nome", email: "E-mail", subject: "Oggetto", message: "Messaggio", ready: "Si aprirà la tua app di posta. Controlla il messaggio e confermane l’invio da lì." },
    nl: { name: "Naam", email: "E-mail", subject: "Onderwerp", message: "Bericht", ready: "Je e-mailprogramma wordt geopend. Controleer het bericht en bevestig de verzending daar." }
  }[language] || { name: "Name", email: "Email", subject: "Subject", message: "Message", ready: "Your email app will open. Review and send the message there." };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    const subject = "[Gianrico Gualtieri] " + String(fields.get("subject") || "").trim();
    const body = [
      copy.name + ": " + String(fields.get("name") || "").trim(),
      copy.email + ": " + String(fields.get("email") || "").trim(),
      copy.subject + ": " + String(fields.get("subject") || "").trim(),
      "",
      copy.message + ":",
      String(fields.get("message") || "").trim()
    ].join("\n");

    if (status) status.textContent = copy.ready;
    window.location.href = "mailto:" + recipient +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();