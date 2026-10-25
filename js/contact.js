(() => {
  const success = document.querySelector("[data-contact-success]");
  if (!success) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    success.hidden = false;
    success.focus();
    window.history.replaceState({}, "", window.location.pathname);
  }
})();