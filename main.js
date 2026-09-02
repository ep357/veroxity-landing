const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Theme toggle with persistence ===== */
(function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem("veroxity-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = stored || (prefersLight ? "light" : "dark");
  root.setAttribute("data-theme", initial);

  const toggle = document.getElementById("themeToggle");
  updateToggleAria(initial);
  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("veroxity-theme", next);
    updateToggleAria(next);
  });

  function updateToggleAria(theme) {
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }
})();

/* ===== Mobile menu ===== */
(function initMobileMenu() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");
  const links = menu.querySelectorAll("a");
  let open = false;

  function setOpen(state) {
    open = state;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.toggle("open", open));
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      menu.addEventListener(
        "transitionend",
        () => { if (!open) menu.hidden = true; },
        { once: true }
      );
    }
  }

  burger.addEventListener("click", () => setOpen(!open));
  links.forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  });
})();

/* ===== Navbar scroll state ===== */
(function initNavScroll() {
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ===== Reveal on scroll ===== */
(function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => observer.observe(el));
})();

/* ===== Animated stat counters ===== */
(function initCounters() {
  const stats = document.querySelectorAll(".stat__num");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    stats.forEach((el) => (el.textContent = el.dataset.count));
    return;
  }
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  stats.forEach((el) => observer.observe(el));
})();

/* ===== Footer year ===== */
document.getElementById("year").textContent = new Date().getFullYear();
