/* ============================================================
   SWEET ORDER — логика витрины и заказа в Telegram
   Без зависимостей. Данные берутся из window.SITE_CONFIG.
   ============================================================ */

(function () {
  "use strict";

  var C = window.SITE_CONFIG;
  if (!C) {
    console.error("SITE_CONFIG не найден. Проверьте, что config.js подключён до app.js.");
    return;
  }

  /* ── Утилиты ───────────────────────────────────────────── */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function getPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, obj);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var nf = new Intl.NumberFormat("ru-RU");
  function money(value) {
    return nf.format(Math.round(Number(value) || 0)) + "\u00A0₽";
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function isoDate(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function addDays(date, days) {
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + days);
    return d;
  }

  function plural(n, one, few, many) {
    var n10 = n % 10;
    var n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
    return many;
  }

  function formatWeight(grams) {
    if (!grams) return "—";
    if (grams < 1000) return "≈ " + grams + " г";
    var text = (grams / 1000).toFixed(1).replace(".", ",").replace(",0", "");
    return "≈ " + text + " кг";
  }

  function unitLabel(unit, qty) {
    if (unit === "набор") return plural(qty, "набор", "набора", "наборов");
    if (unit === "шт") return "шт";
    return unit || "шт";
  }

  function productById(id) {
    return (C.products || []).filter(function (p) { return p.id === id; })[0];
  }

  // Каталог — в data/catalog.json: его редактирует клиент через Pages CMS.
  // Если JSON не загрузился (например, открыли файл напрямую через file://),
  // берём резервную копию, которую сборка вставила в HTML.
  function loadCatalog() {
    var fallback = [];
    var fallbackEl = document.getElementById("catalogFallback");
    if (fallbackEl) {
      try {
        var parsed = JSON.parse(fallbackEl.textContent);
        fallback = Array.isArray(parsed.products) ? parsed.products : [];
      } catch (err) {
        fallback = [];
      }
    }
    if (location.protocol === "file:") {
      C.products = fallback;
      return Promise.resolve();
    }
    return fetch("data/catalog.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.products) || !data.products.length) {
          throw new Error("Пустой каталог");
        }
        C.products = data.products;
      })
      .catch(function (err) {
        console.warn("data/catalog.json не загрузился, использую резервную копию:", err);
        C.products = fallback;
      })
      .then(function () {
        C.products = (C.products || []).filter(function (p) {
          return p && p.id && p.name && p.available !== false;
        });
      });
  }

  /* ── Иконки для динамических блоков ─────────────────────── */

  var icons = {
    delivery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h11v10H3z"/><path d="M14 11h4l3 3v4h-7z"/><circle cx="7" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/></svg>',
    fresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4C12 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z"/><path d="M5 20c2-6 6-9 11-11"/></svg>',
    choice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20v-7h12v7"/><path d="M8 13V9h8v4"/><path d="M12 9V5"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 14-5Z"/><path d="M8 11h8M8 14h5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2 6.2 6.2 2-6.2 2L12 18l-2-5.8L4 10.2l6.2-2L12 2Z"/></svg>'
  };

  /* ── Состояние ─────────────────────────────────────────── */

  var STORAGE_KEY = "sweet-order-cart-v1";
  var cart = {};
  var activeCategory = "all";
  var orderInView = false;
  var currentOrderText = "";
  var toastTimer = null;

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      var result = {};
      Object.keys(raw).forEach(function (id) {
        var qty = parseInt(raw[id], 10);
        var product = productById(id);
        if (product && product.available !== false && qty > 0) result[id] = Math.min(99, qty);
      });
      return result;
    } catch (err) {
      return {};
    }
  }

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (err) { /* приватный режим */ }
  }

  function cartIds() {
    return (C.products || []).filter(function (p) {
      return cart[p.id] && p.available !== false;
    }).map(function (p) { return p.id; });
  }

  function cartCount() {
    return cartIds().reduce(function (sum, id) { return sum + cart[id]; }, 0);
  }

  function cartItemsTotal() {
    return cartIds().reduce(function (sum, id) { return sum + productById(id).price * cart[id]; }, 0);
  }

  function cartWeight() {
    return cartIds().reduce(function (sum, id) {
      var p = productById(id);
      return sum + (Number(p.weight) || 0) * cart[id];
    }, 0);
  }

  function deliveryCost(itemsTotal) {
    if (!C.delivery || C.delivery.free) return 0;
    if (C.delivery.freeFrom && itemsTotal >= C.delivery.freeFrom) return 0;
    return Number(C.delivery.price) || 0;
  }

  function deliveryText(itemsTotal) {
    var cost = deliveryCost(itemsTotal);
    return cost > 0 ? money(cost) : "бесплатно";
  }

  function minOrder() {
    return Number(C.delivery && C.delivery.minOrder) || 0;
  }

  /* ── Привязка текстов из конфига ───────────────────────── */

  function bindConfig() {
    $$("[data-bind]").forEach(function (el) {
      var value = getPath(C, el.getAttribute("data-bind"));
      if (value !== undefined && value !== null) el.textContent = value;
    });

    $$("[data-bind-html]").forEach(function (el) {
      var value = getPath(C, el.getAttribute("data-bind-html"));
      if (value !== undefined && value !== null) el.innerHTML = value;
    });

    $$("[data-bind-src]").forEach(function (el) {
      var value = getPath(C, el.getAttribute("data-bind-src"));
      if (value) el.setAttribute("src", value);
    });

    $$("[data-bind-alt]").forEach(function (el) {
      var value = getPath(C, el.getAttribute("data-bind-alt"));
      if (value) el.setAttribute("alt", value);
    });

    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    var favicon = $("#favicon");
    if (favicon) {
      var initial = String(C.brand.logoLine1 || "c").trim().charAt(0).toUpperCase();
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="' +
        esc(C.theme.bg || "#F8F2E8") + '"/><text x="32" y="44" font-family="Georgia,serif" font-size="36" text-anchor="middle" fill="' +
        esc(C.theme.accent || "#A63D2F") + '">' + esc(initial) + "</text></svg>";
      favicon.setAttribute("href", "data:image/svg+xml," + encodeURIComponent(svg));
    }

    if (C.meta && C.meta.title) document.title = C.meta.title;
    setMeta("name", "description", C.meta && C.meta.description);
    setMeta("name", "theme-color", C.meta && C.meta.themeColor);

    var ogImage = C.meta && C.meta.ogImage;
    if (ogImage && C.meta.siteUrl) ogImage = C.meta.siteUrl.replace(/\/$/, "") + "/" + ogImage;
    setMeta("property", "og:title", C.meta && C.meta.title);
    setMeta("property", "og:description", C.meta && C.meta.description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", C.brand.name);

    var username = String(C.contacts.telegram || "").replace(/^@/, "").trim();
    var tgUrl = username ? "https://t.me/" + username : (C.contacts.telegramChannel || "#");
    $$(".js-tg-link").forEach(function (a) { a.setAttribute("href", tgUrl); });
    $$(".js-channel-link").forEach(function (a) {
      a.setAttribute("href", C.contacts.telegramChannel || tgUrl);
    });
    $$(".js-phone-link").forEach(function (a) {
      a.setAttribute("href", "tel:" + String(C.contacts.phone || "").replace(/[^\d+]/g, ""));
    });
  }

  function setMeta(attr, key, value) {
    if (!value) return;
    var el = document.querySelector("meta[" + attr + '="' + key + '"]');
    if (el) el.setAttribute("content", value);
  }

  /* ── Рендер статических блоков ─────────────────────────── */

  function renderHeroStats() {
    var box = $("#heroStats");
    if (!box) return;
    box.innerHTML = (C.hero.stats || []).map(function (s) {
      return '<div class="hero-stat"><strong>' + esc(s.value) + "</strong><span>" + esc(s.label) + "</span></div>";
    }).join("");
  }

  function renderMarquee() {
    var track = $("#marqueeTrack");
    if (!track) return;
    var inner = (C.marquee || []).map(function (text) {
      return "<span>" + esc(text) + "</span>" + icons.star;
    }).join("");
    track.innerHTML = '<div class="marquee-group">' + inner + '</div><div class="marquee-group" aria-hidden="true">' + inner + "</div>";
  }

  function renderTrust() {
    var box = $("#trustGrid");
    if (!box) return;
    box.innerHTML = (C.trust || []).map(function (item) {
      return '<div class="trust-item"><span class="trust-icon">' + (icons[item.icon] || icons.choice) +
        '</span><div class="trust-copy"><h3>' + esc(item.title) + "</h3><p>" + esc(item.text) + "</p></div></div>";
    }).join("");
  }

  function renderSteps() {
    var box = $("#stepsGrid");
    if (!box) return;
    box.innerHTML = (C.steps.items || []).map(function (item, i) {
      return '<div class="step"><span class="step-num">' + pad(i + 1) + "</span><h3>" + esc(item.title) +
        "</h3><p>" + esc(item.text) + "</p></div>";
    }).join("");
  }

  function renderFilters() {
    var box = $("#filters");
    if (!box) return;
    box.innerHTML = (C.catalog.categories || []).map(function (cat) {
      return '<button type="button" class="chip' + (cat.id === activeCategory ? " is-active" : "") +
        '" data-cat="' + esc(cat.id) + '">' + esc(cat.label) + "</button>";
    }).join("");
  }

  function renderFaq() {
    var box = $("#faqList");
    if (!box) return;
    box.innerHTML = (C.faq.items || []).map(function (item, i) {
      return '<div class="faq-item">' +
        '<button type="button" class="faq-q" aria-expanded="false" aria-controls="faqA' + i + '">' +
        "<span>" + esc(item.q) + '</span><span class="faq-icon">' + icons.plus + "</span></button>" +
        '<div class="faq-a" id="faqA' + i + '"><div><p>' + esc(item.a) + "</p></div></div></div>";
    }).join("");
  }

  /* ── Каталог ───────────────────────────────────────────── */

  function cardHtml(p, index) {
    var qty = cart[p.id] || 0;
    var badge = p.badge
      ? '<span class="badge badge--' + esc(p.badgeTone || "accent") + '">' + esc(p.badge) + "</span>"
      : "";
    var inCart = qty ? '<span class="card-in-cart">' + qty + " в заказе</span>" : "";
    var control = qty
      ? '<div class="stepper" role="group" aria-label="Количество: ' + esc(p.name) + '">' +
          '<button type="button" data-dec="' + esc(p.id) + '" aria-label="Уменьшить количество">' + icons.minus + "</button>" +
          "<span>" + qty + "</span>" +
          '<button type="button" data-inc="' + esc(p.id) + '" aria-label="Увеличить количество">' + icons.plus + "</button>" +
        "</div>"
      : '<button type="button" class="add-btn" data-add="' + esc(p.id) + '" aria-label="Добавить «' + esc(p.name) + '» в заказ">В заказ ' + icons.plus + "</button>";

    return '<article class="card" data-id="' + esc(p.id) + '" style="--i:' + index + '">' +
      '<div class="card-media">' +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" width="800" height="800" loading="lazy" decoding="async">' +
        badge + inCart +
      "</div>" +
      '<div class="card-body">' +
        '<div class="card-top"><h3>' + esc(p.name) + '</h3><span class="card-weight">' + esc(p.weightLabel || "") + "</span></div>" +
        "<p>" + esc(p.desc) + "</p>" +
        '<div class="card-foot"><div class="price">' + money(p.price) + "</div>" + control + "</div>" +
      "</div></article>";
  }

  function renderCatalog(animate) {
    var grid = $("#catalogGrid");
    if (!grid) return;
    var list = (C.products || []).filter(function (p) {
      return p.available !== false && (activeCategory === "all" || p.category === activeCategory);
    });
    grid.innerHTML = list.map(function (p, i) { return cardHtml(p, i); }).join("");
    grid.classList.remove("is-fresh");
    if (animate) {
      void grid.offsetWidth;
      grid.classList.add("is-fresh");
    }
  }

  /* ── Корзина ───────────────────────────────────────────── */

  function setQty(id, qty) {
    if (!productById(id)) return;
    qty = Math.max(0, Math.min(99, qty));
    if (qty === 0) delete cart[id];
    else cart[id] = qty;
    saveCart();
    renderCatalog(false);
    renderCart();
  }

  function addToCart(id) {
    var p = productById(id);
    if (!p) return;
    setQty(id, (cart[id] || 0) + 1);
    toast("Добавлено: " + p.name);
  }

  function renderCart() {
    var ids = cartIds();
    var count = cartCount();
    var itemsTotal = cartItemsTotal();
    var weight = cartWeight();
    var cost = deliveryCost(itemsTotal);
    var total = itemsTotal + cost;
    var hasItems = ids.length > 0;
    var belowMin = minOrder() > 0 && itemsTotal < minOrder();

    var countEls = $$("[data-cart-count]");
    countEls.forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });

    var headCount = $("#cartHeadCount");
    if (headCount) headCount.textContent = hasItems ? ids.length + " " + plural(ids.length, "позиция", "позиции", "позиций") : "";

    var orderItems = $("#orderItems");
    if (orderItems) {
      if (!hasItems) {
        orderItems.innerHTML = '<div class="cart-empty">' +
          '<span class="cart-empty-icon">' + icons.choice + "</span>" +
          "<strong>" + esc(C.order.emptyTitle || "Пока пусто") + "</strong>" +
          "<p>" + esc(C.order.emptyText || "Добавьте десерты из витрины.") + "</p>" +
          '<a href="#catalog">Перейти к витрине</a></div>';
      } else {
        orderItems.innerHTML = '<div class="cart-list">' + ids.map(function (id) {
          var p = productById(id);
          var q = cart[id];
          return '<div class="cart-row" data-id="' + esc(id) + '">' +
            '<img class="cart-thumb" src="' + esc(p.image) + '" alt="" width="64" height="64" loading="lazy">' +
            '<div class="cart-info">' +
              '<div class="cart-name">' + esc(p.name) + "</div>" +
              '<div class="cart-unit">' + esc(p.weightLabel || "") + " · " + money(p.price) + "</div>" +
              '<div class="cart-controls">' +
                '<div class="stepper" role="group" aria-label="Количество: ' + esc(p.name) + '">' +
                  '<button type="button" data-dec="' + esc(id) + '" aria-label="Уменьшить количество">' + icons.minus + "</button>" +
                  "<span>" + q + "</span>" +
                  '<button type="button" data-inc="' + esc(id) + '" aria-label="Увеличить количество">' + icons.plus + "</button>" +
                "</div>" +
                '<button type="button" class="cart-remove" data-remove="' + esc(id) + '">Удалить</button>' +
              "</div>" +
            "</div>" +
            '<div class="cart-price">' + money(p.price * q) + "</div>" +
          "</div>";
        }).join("") + "</div>";
      }
    }

    var summaryList = $("#summaryList");
    if (summaryList) {
      summaryList.innerHTML = hasItems
        ? ids.map(function (id) {
            var p = productById(id);
            return '<div class="summary-line"><span><b>' + esc(p.name) + "</b> × " + cart[id] + "</span><span>" + money(p.price * cart[id]) + "</span></div>";
          }).join("")
        : '<div class="summary-empty">' + esc(C.order.emptyText || "Добавьте десерты из витрины.") + "</div>";
    }

    setText("#summaryCount", hasItems ? count + " " + plural(count, "десерт", "десерта", "десертов") : "");
    setText("#summaryWeight", hasItems ? formatWeight(weight) : "—");

    var deliveryEl = $("#summaryDelivery");
    if (deliveryEl) {
      deliveryEl.textContent = hasItems ? (cost > 0 ? money(cost) : "бесплатно") : "—";
      deliveryEl.classList.toggle("is-free", hasItems && cost === 0);
    }

    setText("#summaryTotal", money(total));

    var checkoutBtn = $("#checkoutBtn");
    if (checkoutBtn) {
      // Пустая корзина — не «мёртвая» кнопка: она вернёт к витрине.
      checkoutBtn.disabled = belowMin;
      var checkoutLabel = checkoutBtn.querySelector("span");
      if (checkoutLabel) {
        checkoutLabel.textContent = hasItems
          ? (C.order.submit || "Оформить в Telegram")
          : "Выбрать десерт";
      }
    }

    var summaryNote = $(".summary-note");
    if (summaryNote) {
      summaryNote.textContent = belowMin
        ? "Минимальный заказ — " + money(minOrder())
        : hasItems
          ? (C.order.submitNote || "")
          : "Выберите десерт — и вернёмся к оформлению.";
    }

    var mobileMeta = $("#mobileBarMeta");
    if (mobileMeta) mobileMeta.textContent = hasItems ? count + " " + plural(count, "десерт", "десерта", "десертов") : "";
    setText("#mobileBarTotal", money(total));

    updateMobileBar();
  }

  function setText(sel, text) {
    var el = $(sel);
    if (el) el.textContent = text;
  }

  function updateMobileBar() {
    var bar = $("#mobileBar");
    if (!bar) return;
    var show = cartCount() > 0 && !orderInView;
    bar.classList.toggle("is-visible", show);
    bar.setAttribute("aria-hidden", show ? "false" : "true");
  }

  /* ── Тост ──────────────────────────────────────────────── */

  function toast(message) {
    var el = $("#toast");
    if (!el) return;
    el.innerHTML = icons.check + "<span>" + esc(message) + "</span>";
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 2600);
  }

  /* ── Форма ─────────────────────────────────────────────── */

  var form, dateInput, timeSelect, timeHint, occasionSelect, addressField, addressInput,
      pickupHint, consentInput, consentWrap, phoneInput, nameInput, inscriptionInput, commentInput;

  var today = new Date();
  var todayISO = isoDate(today);
  var minDateISO = todayISO;

  function initForm() {
    form = $("#orderForm");
    if (!form) return;

    dateInput = $("#date");
    timeSelect = $("#time");
    timeHint = $("#timeHint");
    occasionSelect = $("#occasion");
    addressField = $("#addressField");
    addressInput = $("#address");
    pickupHint = $("#pickupHint");
    consentInput = $("#consent");
    consentWrap = $('[data-field="consent"]');
    phoneInput = $("#phone");
    nameInput = $("#name");
    inscriptionInput = $("#inscription");
    commentInput = $("#comment");

    if (occasionSelect) {
      occasionSelect.innerHTML = (C.form.occasions || []).map(function (o) {
        return "<option>" + esc(o) + "</option>";
      }).join("");
    }

    if (C.delivery.sameDay === false) minDateISO = isoDate(addDays(today, 1));
    if (dateInput) {
      dateInput.min = minDateISO;
      dateInput.max = isoDate(addDays(today, Number(C.delivery.maxDaysAhead) || 60));
      var defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (C.delivery.sameDay === false) defaultDate = addDays(defaultDate, 1);
      else if (new Date().getHours() >= 18) defaultDate = addDays(defaultDate, 1);
      dateInput.value = isoDate(defaultDate);
    }

    refreshSlots();
    updateMethod();

    if (C.form.inscription === false) {
      var inscriptionField = $("#inscriptionField");
      if (inscriptionField) inscriptionField.hidden = true;
    }

    if (C.form.consent === false && consentWrap) consentWrap.hidden = true;

    if (dateInput) dateInput.addEventListener("change", refreshSlots);
    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        var digits = phoneInput.value.replace(/\D/g, "");
        phoneInput.value = digits ? formatPhone(digits) : "";
      });
    }

    $$('input[name="method"]', form).forEach(function (radio) {
      radio.addEventListener("change", updateMethod);
    });

    form.addEventListener("input", function (e) {
      var wrap = e.target.closest("[data-field]");
      if (wrap) clearFieldError(wrap);
    });
    form.addEventListener("change", function (e) {
      var wrap = e.target.closest("[data-field]");
      if (wrap) clearFieldError(wrap);
    });
    form.addEventListener("submit", onSubmit);
  }

  function formatPhone(digits) {
    var d = String(digits).replace(/\D/g, "");
    if (!d) return "";
    if (d.charAt(0) === "8") d = "7" + d.slice(1);
    if (d.charAt(0) !== "7") d = "7" + d;
    d = d.slice(0, 11);
    var out = "+7";
    if (d.length > 1) out += " (" + d.slice(1, 4);
    if (d.length >= 5) out += ") " + d.slice(4, 7);
    if (d.length >= 8) out += "-" + d.slice(7, 9);
    if (d.length >= 10) out += "-" + d.slice(9, 11);
    return out;
  }

  function slotStart(slot) {
    var m = String(slot).match(/^\s*(\d{1,2}):(\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  }

  function refreshSlots() {
    if (!timeSelect) return;
    var dateVal = dateInput ? dateInput.value : "";
    var isToday = dateVal === todayISO;
    var now = new Date();
    var minMinutes = now.getHours() * 60 + now.getMinutes() + 60;
    var slots = (C.delivery.slots || []).filter(function (s) {
      return !isToday || slotStart(s) >= minMinutes;
    });
    var previous = timeSelect.value;
    timeSelect.innerHTML = slots.length
      ? slots.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + "</option>"; }).join("")
      : '<option value="">На сегодня интервалов нет</option>';
    if (slots.indexOf(previous) !== -1) timeSelect.value = previous;
    else if (slots.length) timeSelect.value = slots[Math.min(Number(C.delivery.defaultSlot) || 0, slots.length - 1)];

    if (timeHint) {
      timeHint.textContent = slots.length ? "" : "Выберите другую дату — на сегодня свободных интервалов уже нет.";
    }
  }

  function updateMethod() {
    if (!form) return;
    var checked = form.querySelector('input[name="method"]:checked');
    var isPickup = checked && checked.value === "pickup";
    if (addressField) addressField.hidden = !!isPickup;
    if (addressInput) addressInput.required = !isPickup;
    if (pickupHint) {
      pickupHint.hidden = !isPickup;
      pickupHint.textContent = isPickup ? (C.delivery.pickupAddress || "") : "";
    }
    if (isPickup && addressField) clearFieldError(addressField);
  }

  function setFieldError(name, message) {
    if (!form) return;
    var wrap = form.querySelector('[data-field="' + name + '"]');
    if (!wrap) return;
    wrap.classList.add("has-error");
    var error = wrap.querySelector(".field-error");
    if (error) error.textContent = message;
    var control = wrap.querySelector("input, select, textarea");
    if (control) control.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(wrap) {
    if (!wrap) return;
    wrap.classList.remove("has-error");
    var control = wrap.querySelector("[aria-invalid]");
    if (control) control.removeAttribute("aria-invalid");
    var error = wrap.querySelector(".field-error");
    if (error) error.textContent = "";
  }

  function clearAllErrors() {
    if (!form) return;
    $$("[data-field]", form).forEach(clearFieldError);
  }

  function validate() {
    clearAllErrors();
    var ok = true;
    var firstInvalid = null;

    function fail(name, message) {
      setFieldError(name, message);
      ok = false;
      if (!firstInvalid) {
        var wrap = form.querySelector('[data-field="' + name + '"]');
        firstInvalid = wrap && wrap.querySelector("input, select, textarea");
      }
    }

    if (!nameInput || nameInput.value.trim().length < 2) fail("name", "Укажите имя");
    var digits = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
    if (digits.length !== 11) fail("phone", "Введите телефон полностью");

    if (!dateInput || !dateInput.value) fail("date", "Выберите дату");
    else if (dateInput.value < minDateISO) fail("date", "Выберите дату не раньше " + formatDateRu(minDateISO));

    if (!timeSelect || !timeSelect.value) fail("time", "Выберите интервал");

    var method = form.querySelector('input[name="method"]:checked');
    var isPickup = method && method.value === "pickup";
    if (!isPickup && addressInput && addressInput.value.trim().length < 5) {
      fail("address", "Укажите адрес доставки");
    }

    if (C.form.consent !== false && consentInput && !consentInput.checked) {
      var wrap = form.querySelector('[data-field="consent"]');
      if (wrap) {
        wrap.classList.add("has-error");
        var error = wrap.querySelector(".field-error");
        if (error) error.textContent = "Нужно согласие на обработку данных";
      }
      ok = false;
      if (!firstInvalid) firstInvalid = consentInput;
    }

    if (!ok && firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!cartCount()) {
      toast("Сначала добавьте десерт");
      goToCatalog();
      return;
    }
    if (minOrder() > 0 && cartItemsTotal() < minOrder()) {
      toast("Минимальный заказ — " + money(minOrder()));
      return;
    }
    if (!validate()) return;
    openOrderModal();
  }

  /* ── Сборка заказа ─────────────────────────────────────── */

  function formatDateRu(iso) {
    var parts = String(iso).split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return new Intl.DateTimeFormat("ru-RU", {
      weekday: "short", day: "numeric", month: "long"
    }).format(date).replace(",", "");
  }

  function buildOrderText() {
    var ids = cartIds();
    var itemsTotal = cartItemsTotal();
    var total = itemsTotal + deliveryCost(itemsTotal);
    var method = form.querySelector('input[name="method"]:checked');
    var isPickup = method && method.value === "pickup";
    var date = formatDateRu(dateInput.value);
    var slot = timeSelect.value;
    var occasion = occasionSelect ? occasionSelect.value : "";
    var address = addressInput ? addressInput.value.trim() : "";
    var inscription = inscriptionInput ? inscriptionInput.value.trim() : "";
    var comment = commentInput ? commentInput.value.trim() : "";
    var name = nameInput ? nameInput.value.trim() : "";
    var phone = phoneInput ? phoneInput.value.trim() : "";

    var lines = [];
    lines.push("👤 Имя: " + name);
    lines.push("📞 Телефон: " + phone);
    lines.push("📅 " + (isPickup ? "Самовывоз" : "Доставка") + ": " + date + ", " + slot);
    if (!isPickup && address) lines.push("📍 Адрес: " + address);
    if (occasion && occasion !== "Без повода") lines.push("🎉 Повод: " + occasion);
    if (inscription) lines.push("✍️ Надпись: " + inscription);
    lines.push("");
    lines.push("Состав заказа:");
    ids.forEach(function (id, i) {
      var p = productById(id);
      var qty = cart[id];
      lines.push((i + 1) + ". " + p.name + " — " + qty + " " + unitLabel(p.unit, qty) +
        " × " + money(p.price) + " = " + money(p.price * qty));
    });
    lines.push("");
    lines.push("Итого: " + money(total));
    if (cartWeight() > 0) lines.push("Общий вес: " + formatWeight(cartWeight()));
    if (!isPickup) lines.push("Доставка: " + deliveryText(itemsTotal));
    if (comment) {
      lines.push("");
      lines.push("💬 Комментарий: " + comment);
    }
    return lines.join("\n");
  }

  function telegramUrl(text) {
    var username = String(C.contacts.telegram || "").replace(/^@/, "").trim();
    if (username) return "https://t.me/" + username + "?text=" + encodeURIComponent(text);
    return "https://t.me/share/url?url=" + encodeURIComponent(location.href) + "&text=" + encodeURIComponent(text);
  }

  function openOrderModal() {
    var modal = $("#orderModal");
    if (!modal) return;

    currentOrderText = buildOrderText();
    var orderText = $("#orderText");
    if (orderText) orderText.textContent = currentOrderText;
    var tgSend = $("#tgSend");
    if (tgSend) tgSend.setAttribute("href", telegramUrl(currentOrderText));
    var copyBtn = $("#copyBtn");
    if (copyBtn) copyBtn.textContent = "Скопировать текст";

    if (typeof modal.showModal === "function") {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    document.body.classList.add("modal-open");
  }

  /* ── Копирование ───────────────────────────────────────── */

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  /* ── События ───────────────────────────────────────────── */

  function bindEvents() {
    document.addEventListener("click", function (e) {
      var add = e.target.closest("[data-add]");
      if (add) {
        addToCart(add.getAttribute("data-add"));
        return;
      }
      var inc = e.target.closest("[data-inc]");
      if (inc) {
        var id = inc.getAttribute("data-inc");
        setQty(id, (cart[id] || 0) + 1);
        return;
      }
      var dec = e.target.closest("[data-dec]");
      if (dec) {
        var decId = dec.getAttribute("data-dec");
        setQty(decId, (cart[decId] || 0) - 1);
        return;
      }
      var remove = e.target.closest("[data-remove]");
      if (remove) {
        var removeId = remove.getAttribute("data-remove");
        var product = productById(removeId);
        setQty(removeId, 0);
        if (product) toast("Удалено: " + product.name);
        return;
      }
      var chip = e.target.closest("[data-cat]");
      if (chip) {
        activeCategory = chip.getAttribute("data-cat");
        $$(".chip").forEach(function (el) { el.classList.toggle("is-active", el === chip); });
        renderCatalog(true);
      }
    });

    var filters = $("#filters");
    if (filters) {
      // Клики по фильтрам ловятся делегированием выше.
    }

    var faqList = $("#faqList");
    if (faqList) {
      faqList.addEventListener("click", function (e) {
        var btn = e.target.closest(".faq-q");
        if (!btn) return;
        var item = btn.closest(".faq-item");
        var isOpen = item.classList.contains("is-open");
        $$(".faq-item", faqList).forEach(function (el) {
          el.classList.remove("is-open");
          var q = $(".faq-q", el);
          if (q) q.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    }

    var cartBtn = $("#cartBtn");
    if (cartBtn) {
      cartBtn.addEventListener("click", function () {
        if (!cartCount()) {
          toast("Выберите десерт — заказ соберём здесь");
          goToCatalog();
          return;
        }
        scrollToOrder();
      });
    }

    var checkoutBtn = $("#checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        if (!cartCount()) {
          toast("Сначала добавьте десерт");
          goToCatalog();
          return;
        }
        if (form) form.requestSubmit();
      });
    }

    var mobileBtn = $("#mobileBarBtn");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", function () {
        if (form) form.requestSubmit();
      });
    }

    var modal = $("#orderModal");
    if (modal) {
      var close = $("#modalClose");
      if (close) close.addEventListener("click", function () { modal.close ? modal.close() : modal.removeAttribute("open"); });
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          if (modal.close) modal.close(); else modal.removeAttribute("open");
        }
      });
      modal.addEventListener("close", function () {
        document.body.classList.remove("modal-open");
      });
    }

    var copyBtn = $("#copyBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        copyText(currentOrderText).then(function (ok) {
          copyBtn.textContent = ok ? "Скопировано" : "Не удалось скопировать";
          toast(ok ? "Текст заказа скопирован" : "Выделите текст и скопируйте вручную");
          setTimeout(function () { copyBtn.textContent = "Скопировать текст"; }, 2200);
        });
      });
    }

    var tgSend = $("#tgSend");
    if (tgSend) {
      tgSend.addEventListener("click", function () {
        // Копируем заранее: если Telegram Web/встроенный браузер не подставит текст,
        // он останется в буфере — покупатель вставит его вручную.
        copyText(currentOrderText).then(function (ok) {
          if (ok) toast("Текст скопирован. Если Telegram не открылся — вставьте его в чат");
        });
      });
    }

    var header = $(".site-header");
    function onScroll() {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Прячем мобильную кнопку только когда на экране уже итог заказа,
    // а не на всей длинной форме — так кнопка всегда под рукой.
    var summaryCard = $("#summary");
    if (summaryCard && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        orderInView = entries[0].isIntersecting;
        updateMobileBar();
      }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });
      observer.observe(summaryCard);
    }

    window.addEventListener("resize", updateMobileBar);
  }

  function goToCatalog() {
    var catalog = $("#catalog");
    if (catalog) catalog.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToOrder() {
    var order = $("#order");
    if (order) order.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ── Инициализация ─────────────────────────────────────── */

  function updateJsonLd() {
    var script = document.querySelector('script[type="application/ld+json"]');
    if (!script || !C.products) return;
    try {
      var data = JSON.parse(script.textContent);
      var baseUrl = String((C.meta && C.meta.siteUrl) || "").replace(/\/$/, "");
      data.hasOfferCatalog = {
        "@type": "OfferCatalog",
        name: "Десерты",
        itemListElement: C.products.map(function (p, i) {
          return {
            "@type": "Offer",
            position: i + 1,
            price: p.price,
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
            itemOffered: {
              "@type": "Product",
              name: p.name,
              description: p.desc,
              ...(baseUrl && p.image ? { image: baseUrl + "/" + p.image } : {})
            }
          };
        })
      };
      script.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      // Если статический JSON-LD не распарсился — не ломаем витрину.
    }
  }

  async function init() {
    bindConfig();
    await loadCatalog();
    cart = loadCart();
    updateJsonLd();
    renderHeroStats();
    renderMarquee();
    renderTrust();
    renderSteps();
    renderFilters();
    renderFaq();
    renderCatalog(true);
    initForm();
    renderCart();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
