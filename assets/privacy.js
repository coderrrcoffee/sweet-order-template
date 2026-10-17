(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  if (!C) return;

  function setText(el, value) {
    if (el && value != null) el.textContent = value;
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-bind]"), function (el) {
    var path = el.getAttribute("data-bind").split(".");
    var value = C;
    path.forEach(function (key) { value = value == null ? undefined : value[key]; });
    setText(el, value);
  });

  var username = String(C.contacts.telegram || "").replace(/^@/, "").trim();
  var tgUrl = username ? "https://t.me/" + username : (C.contacts.telegramChannel || "#");
  Array.prototype.forEach.call(document.querySelectorAll(".js-tg-link"), function (a) {
    a.setAttribute("href", tgUrl);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".js-phone-link"), function (a) {
    a.setAttribute("href", "tel:" + String(C.contacts.phone || "").replace(/[^\d+]/g, ""));
  });

  setText(document.getElementById("year"), new Date().getFullYear());
  document.title = "Политика конфиденциальности — " + C.brand.name;

  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", "Как сайт " + C.brand.name + " обращается с данными покупателей.");

  var favicon = document.getElementById("favicon");
  if (favicon) {
    var initial = String(C.brand.logoLine1 || "c").trim().charAt(0).toUpperCase();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="' +
      C.theme.bg + '"/><text x="32" y="44" font-family="Georgia,serif" font-size="36" text-anchor="middle" fill="' +
      C.theme.accent + '">' + initial + "</text></svg>";
    favicon.setAttribute("href", "data:image/svg+xml," + encodeURIComponent(svg));
  }
})();
