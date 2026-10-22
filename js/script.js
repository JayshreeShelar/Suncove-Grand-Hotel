/* ==========================================================
   Suncove Grand Hotel: script.js
   ----------------------------------------------------------
   EDIT HERE FIRST: everything the hotel owner needs to change
   (contact details, enquiry channel, images) is in the two
   config blocks below.
   ========================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- 1. CONTACT + ENQUIRY CONFIG (placeholders: replace) ---------- */
  var CONFIG = {
    hotelName: "Suncove Grand Hotel",
    channel: "whatsapp",              // "whatsapp" or "email"
    whatsappNumber: "918830532500",   // WhatsApp number: country code + number, digits only
    email: "info@example.com",        // PLACEHOLDER
    phone: "+91 88305 32500",       // shown on the page
    address: "Lonavala, Pune District, Maharashtra, India",
    city: "Lonavala, Pune, Maharashtra",
    mapQuery: "Lonavala, Pune, Maharashtra, India", // used for the Get Directions link
    autoplayMs: 5500
  };

  /* ---------- 2. IMAGE CONFIG (replace URLs or local files) ----------
     Each key lists sources tried in order. The first one that loads wins.
     To use your own photo, put it in assets/images/ and put its path first,
     e.g. src: ["assets/images/ocean-suite.jpg", ...].                      */
  var IMG = "?auto=format&fit=crop&w=1600&q=80";
  var U = "https://images.unsplash.com/";
  var IMAGES = {
    room:     { src: [U + "photo-1631049307264-da0ec9d70304" + IMG, "assets/images/room.svg"] },
    beach:    { src: [U + "photo-1507525428034-b723cf961d3e" + IMG, "assets/images/beach.svg"] },
    suite:    { src: [U + "photo-1570077188670-e3a8d69ac5ff" + IMG, "assets/images/suite.svg"] },
    dining:   { src: [U + "photo-1414235077428-338989a2e8c0" + IMG, "assets/images/dining.svg"] },
    exterior: { src: [U + "photo-1566073771259-6a8506099945" + IMG, "assets/images/exterior.svg"] },
    pool:     { src: [U + "photo-1520250497591-112f2f40a3f4" + IMG, "assets/images/pool.svg"] },
    terrace:  { src: [U + "photo-1551882547-ff40c63fe5fa" + IMG, "assets/images/terrace.svg"] },
    about:    { src: [U + "photo-1571896349842-33c89424de2d" + IMG, "assets/images/about.svg"] }
  };

  /* ---------- 3. HERO CAROUSEL SLIDES (order = left to right) ---------- */
  var SLIDES = [
    { key: "room",     title: "Premium Room",      sub: "Comfort & Style" },
    { key: "beach",    title: "Beach View",        sub: "Nature's Beauty" },
    { key: "suite",    title: "Ocean View Suite",  sub: "Luxury Redefined" },
    { key: "dining",   title: "Rooftop Dining",    sub: "Fine Dining" },
    { key: "exterior", title: "Hotel Exterior",    sub: "Modern Elegance" }
  ];
  var START_INDEX = 2; // the reference shows the Ocean View Suite in front

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mod = function (n, m) { return ((n % m) + m) % m; };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 4. Image loading with fallback ---------- */
  var resolved = {};

  function tryLoad(url, ms) {
    return new Promise(function (ok, fail) {
      var img = new Image();
      var t = setTimeout(function () { img.src = ""; fail(); }, ms);
      img.onload = function () { clearTimeout(t); ok(url); };
      img.onerror = function () { clearTimeout(t); fail(); };
      img.src = url;
    });
  }

  function resolveImage(key) {
    var list = IMAGES[key].src.slice();
    return (function next() {
      if (!list.length) return Promise.resolve("");
      var url = list.shift();
      return tryLoad(url, 7000).catch(next);
    })().then(function (u) { resolved[key] = u; });
  }

  function applyImages() {
    $$("img[data-img]").forEach(function (el) {
      var u = resolved[el.getAttribute("data-img")];
      if (u) el.src = u;
    });
  }

  /* ---------- 5. Carousel + synced hero background ---------- */
  function initCarousel() {
    var stage = $("#carouselStage");
    var dotsWrap = $("#carouselDots");
    var carousel = $("#carousel");
    var status = $("#carouselStatus");
    var layers = [$("#bgLayerA"), $("#bgLayerB")];
    var topLayer = 0;
    var active = START_INDEX;
    var timer = null;
    var hovering = false;
    var focusInside = false;
    var n = SLIDES.length;

    // Build cards + dots
    var cards = SLIDES.map(function (s, i) {
      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "slide");
      card.setAttribute("aria-label", (i + 1) + " of " + n + ": " + s.title);
      card.innerHTML =
        '<div class="card__inner">' +
          '<img class="card__img" alt="' + s.title + '" width="300" height="420" draggable="false">' +
          '<div class="card__meta"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>' +
          '<div><h3 class="card__title">' + s.title + '</h3><p class="card__sub">' + s.sub + '</p></div></div>' +
          '<button type="button" class="card__heart" aria-pressed="false" aria-label="Save ' + s.title + '">' +
          '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
        '</div>';
      card.querySelector("img").src = resolved[s.key];
      card.addEventListener("click", function () { if (i !== active) goTo(i, true); });
      card.querySelector(".card__heart").addEventListener("click", function (e) {
        e.stopPropagation();
        var b = e.currentTarget;
        var on = b.getAttribute("aria-pressed") === "true";
        b.setAttribute("aria-pressed", String(!on));
        b.firstElementChild.className = on ? "fa-regular fa-heart" : "fa-solid fa-heart";
      });
      stage.appendChild(card);
      return card;
    });

    var dots = SLIDES.map(function (s, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "carousel__dot";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Show " + s.title);
      d.addEventListener("click", function () { goTo(i, true); });
      dotsWrap.appendChild(d);
      return d;
    });

    // Crossfade the hero background to the active slide's image
    function setBackground(url, instant) {
      var next = 1 - topLayer;
      layers[next].style.backgroundImage = "url('" + url + "')";
      if (instant) {
        layers[next].style.transition = "none";
        layers[topLayer].style.transition = "none";
      }
      layers[next].classList.add("is-visible");
      layers[topLayer].classList.remove("is-visible");
      if (instant) {
        void layers[next].offsetWidth;
        layers[next].style.transition = "";
        layers[topLayer].style.transition = "";
      }
      topLayer = next;
    }

    function render(instant) {
      cards.forEach(function (c, i) {
        var off = mod(i - active + 2, n) - 2; // -2..2, 0 = active
        c.setAttribute("data-offset", String(off));
        c.setAttribute("aria-hidden", off === 0 ? "false" : "true");
        c.querySelector(".card__heart").tabIndex = off === 0 ? 0 : -1;
      });
      dots.forEach(function (d, i) {
        var on = i === active;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", String(on));
      });
      setBackground(resolved[SLIDES[active].key], instant);
      status.textContent = "Showing " + SLIDES[active].title + ", " + (active + 1) + " of " + n;
    }

    function goTo(i, user) {
      active = mod(i, n);
      render(false);
      if (user) restart();
    }

    function startAuto() {
      stopAuto();
      if (reduceMotion || document.hidden || hovering || focusInside) return;
      timer = setInterval(function () { goTo(active + 1, false); }, CONFIG.autoplayMs);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { startAuto(); }

    $("#prevBtn").addEventListener("click", function () { goTo(active - 1, true); });
    $("#nextBtn").addEventListener("click", function () { goTo(active + 1, true); });

    // Pause on hover / focus, resume afterwards
    carousel.addEventListener("mouseenter", function () { hovering = true; stopAuto(); });
    carousel.addEventListener("mouseleave", function () { hovering = false; startAuto(); });
    carousel.addEventListener("focusin", function () { focusInside = true; stopAuto(); });
    carousel.addEventListener("focusout", function () { focusInside = false; startAuto(); });
    document.addEventListener("visibilitychange", function () { document.hidden ? stopAuto() : startAuto(); });

    // Keyboard arrows while focus is inside the carousel
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { goTo(active - 1, true); }
      else if (e.key === "ArrowRight") { goTo(active + 1, true); }
    });

    // Touch swipe
    var sx = 0, sy = 0, tracking = false;
    stage.addEventListener("touchstart", function (e) {
      var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; tracking = true;
      hovering = true; stopAuto();
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(active + (dx < 0 ? 1 : -1), false);
      hovering = false; startAuto();
    }, { passive: true });
    stage.addEventListener("touchcancel", function () { tracking = false; hovering = false; startAuto(); }, { passive: true });

    render(true);
    startAuto();
  }

  /* ---------- 6. Header, nav, scroll effects ---------- */
  function initHeader() {
    var header = $("#siteHeader");
    var nav = $("#mainNav");
    var toggle = $("#navToggle");

    function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function closeMenu() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1024) closeMenu(); });

    // Active link highlighting
    var links = $$(".nav__link");
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (l) { l.classList.remove("is-active"); });
            map[en.target.id].classList.add("is-active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["home", "about", "rooms", "amenities", "gallery", "location"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }
  }

  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. Config-driven text/links ---------- */
  function applyConfig() {
    $$("[data-config]").forEach(function (el) {
      var key = el.getAttribute("data-config");
      if (CONFIG[key]) el.textContent = CONFIG[key];
      var kind = el.getAttribute("data-config-href");
      if (kind === "tel") el.href = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
      if (kind === "mailto") el.href = "mailto:" + CONFIG.email;
    });
    var dir = $("#directionsLink");
    if (dir) dir.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapQuery);
    var yr = $("#year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ---------- 8. Dates ---------- */
  function iso(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function addDay(isoStr) {
    var p = isoStr.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2] + 1);
    return iso(d);
  }
  function fmtDate(isoStr) {
    if (!isoStr) return "";
    var p = isoStr.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function linkDates(inEl, outEl) {
    var today = iso(new Date());
    inEl.min = today;
    outEl.min = addDay(today);
    inEl.addEventListener("change", function () {
      if (inEl.value) {
        outEl.min = addDay(inEl.value);
        if (outEl.value && outEl.value < outEl.min) outEl.value = "";
      } else {
        outEl.min = addDay(today);
      }
    });
    [inEl, outEl].forEach(function (el) {
      el.addEventListener("click", function () { try { if (el.showPicker) el.showPicker(); } catch (e) { /* ignore */ } });
    });
  }

  /* ---------- 9. Sending enquiries (WhatsApp or email) ---------- */
  // Builds the WhatsApp message template (WhatsApp shows *text* as bold).
  function waTemplate(title, rows) {
    var out = ["*" + title + " | " + CONFIG.hotelName + "*", "_Sent from the hotel website_", ""];
    rows.forEach(function (r) { if (r[1]) out.push("- *" + r[0] + ":* " + r[1]); });
    out.push("", "Please share availability and details. This is an enquiry only, not a booking.", "Thank you!");
    return out.join("\n");
  }

  function dispatch(subject, body) {
    if (CONFIG.channel === "email") {
      window.location.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      return "your email app";
    }
    var url = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(body);
    window.open(url, "_blank", "noopener");
    return "WhatsApp";
  }

  function initBar() {
    var form = $("#barForm");
    var cin = $("#barCheckin"), cout = $("#barCheckout"), guests = $("#barGuests"), msg = $("#barMsg");
    linkDates(cin, cout);

    function say(text, err) { msg.textContent = text; msg.classList.toggle("is-error", !!err); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cin.value) { say("Please choose a check-in date.", true); cin.focus(); return; }
      if (!cout.value) { say("Please choose a check-out date.", true); cout.focus(); return; }
      if (cout.value <= cin.value) { say("Check-out must be after check-in.", true); cout.focus(); return; }
      var label = guests.options[guests.selectedIndex].text;
      var nights = Math.round((Date.parse(cout.value) - Date.parse(cin.value)) / 86400000);
      var body = waTemplate("Stay Enquiry", [
        ["Check-in", fmtDate(cin.value)],
        ["Check-out", fmtDate(cout.value)],
        ["Nights", String(nights)],
        ["Guests", label]
      ]);
      var via = dispatch("Stay enquiry: " + CONFIG.hotelName, body);
      say("Your enquiry is ready in " + via + ". Send it from there and the hotel will reply. Nothing is booked yet.", false);
    });
  }

  function initForm() {
    var form = $("#enquiryForm");
    var f = {
      name: $("#fName"), phone: $("#fPhone"), email: $("#fEmail"), type: $("#fType"),
      cin: $("#fCheckin"), cout: $("#fCheckout"), guests: $("#fGuests"), message: $("#fMessage")
    };
    var fb = $("#formFeedback");
    linkDates(f.cin, f.cout);

    function setErr(el, text) {
      var errEl = document.getElementById(el.id + "Err");
      if (errEl) errEl.textContent = text || "";
      var wrap = el.closest(".field");
      if (wrap) wrap.classList.toggle("has-error", !!text);
      if (text) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      return !text;
    }

    function validate() {
      var ok = true, first = null;
      function check(el, text) { var good = setErr(el, text); if (!good) { ok = false; if (!first) first = el; } }

      check(f.name, f.name.value.trim().length < 2 ? "Please enter your full name." : "");
      var digits = f.phone.value.replace(/\D/g, "");
      check(f.phone, (!/^[\d\s()+\-]+$/.test(f.phone.value) || digits.length < 7 || digits.length > 15) ? "Enter a valid phone number (7 to 15 digits)." : "");
      check(f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? "Enter a valid email address." : "");
      var g = parseInt(f.guests.value, 10);
      check(f.guests, (isNaN(g) || g < 1 || g > 20) ? "Guests must be between 1 and 20." : "");
      var dateErr = "";
      if (f.cin.value && f.cin.value < iso(new Date())) dateErr = "Check-in cannot be in the past.";
      else if (f.cout.value && !f.cin.value) dateErr = "Please add a check-in date too.";
      else if (f.cin.value && f.cout.value && f.cout.value <= f.cin.value) dateErr = "Check-out must be after check-in.";
      check(f.cout, dateErr);
      check(f.message, f.message.value.trim().length < 5 ? "Please add a short message." : "");
      if (first) first.focus();
      return ok;
    }

    Object.keys(f).forEach(function (k) {
      f[k].addEventListener("input", function () { if (f[k].closest(".field.has-error")) setErr(f[k], ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fb.classList.remove("is-error");
      if (!validate()) {
        fb.textContent = "Please fix the highlighted fields and try again.";
        fb.classList.add("is-error");
        return;
      }
      var rows = [
        ["Enquiry type", f.type.value],
        ["Name", f.name.value.trim()],
        ["Phone", f.phone.value.trim()],
        ["Email", f.email.value.trim()],
        ["Guests", f.guests.value],
        ["Check-in", fmtDate(f.cin.value)],
        ["Check-out", fmtDate(f.cout.value)],
        ["Message", f.message.value.trim()]
      ];
      var via = dispatch(f.type.value + ": " + CONFIG.hotelName, waTemplate(f.type.value, rows));
      fb.textContent = "Thank you! Your enquiry has been prepared in " + via + ". Please press send there so the hotel receives it. This is not a booking confirmation.";
    });

    // "Enquire about this room" links pre-select the enquiry type
    $$("[data-enquiry-type]").forEach(function (a) {
      a.addEventListener("click", function () { f.type.value = a.getAttribute("data-enquiry-type"); });
    });
  }

  /* ---------- boot ---------- */
  applyConfig();
  initHeader();
  initReveal();
  initBar();
  initForm();

  Promise.all(Object.keys(IMAGES).map(resolveImage)).then(function () {
    applyImages();
    initCarousel();
  });
})();
