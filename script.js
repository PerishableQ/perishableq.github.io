// Абстрактные 3D-заглушки (сфера на пьедестале), пока нет своих картинок.
// px/pw/ph - положение и размер пьедестала, s - размер сферы (в %).
const ARTS = [
  { bg: "#eadfce", bg2: "#d8c6ac", block: "#f1e8da", sphere: "#e2733d", px: 20, pw: 34, ph: 30, s: 18 },
  { bg: "#d3cec6", bg2: "#b3aca1", block: "#ebe7e0", sphere: "#f4f2ed", px: 38, pw: 30, ph: 22, s: 22 },
  { bg: "#a6cbca", bg2: "#6f9d9f", block: "#2d3a3c", sphere: "#1f2628", px: 42, pw: 16, ph: 34, s: 12 },
  { bg: "#5684b8", bg2: "#2f5b8c", block: "#ebe6dc", sphere: "#ef8a3c", px: 30, pw: 28, ph: 26, s: 16 },
  { bg: "#9599da", bg2: "#6d70bf", block: "#e6e4f3", sphere: "#d8d6ee", px: 25, pw: 44, ph: 36, s: 20 },
  { bg: "#eaa7ac", bg2: "#d9545c", block: "#7a5bd1", sphere: "#e3262f", px: 34, pw: 28, ph: 26, s: 18 },
  { bg: "#adb7a0", bg2: "#89947f", block: "#dcdfd2", sphere: "#f2f0ea", px: 30, pw: 34, ph: 30, s: 20 },
];

const artStyle = (i) => {
  const a = ARTS[i % ARTS.length];
  const sx = a.px + (a.pw - a.s) / 2;
  return `--bg:${a.bg};--bg2:${a.bg2};--block:${a.block};--sphere:${a.sphere};--px:${a.px}%;--pw:${a.pw}%;--ph:${a.ph}%;--s:${a.s}%;--sx:${sx}%`;
};

const coverOf = (w) => (w.images && w.images[0] ? w.images[0].src : w.image);

// Вертикальные (мобильные) скриншоты показываем целиком, а не обрезаем
const markOrientation = "this.naturalHeight > this.naturalWidth && this.parentElement.classList.add('is-portrait')";

const media = (item, i) => {
  const src = coverOf(item);
  return src
    ? `<img class="media__img" src="${src}" alt="${item.title || ""}" loading="lazy" onload="${markOrientation}">`
    : `<div class="art" style="${artStyle(i)}"></div>`;
};

const pill = (text, cls = "") => `<span class="pill ${cls}">${text}</span>`;

// ---------- Hero: буквы заголовка появляются по очереди ----------
const heroTitle = document.getElementById("heroTitle");
heroTitle.setAttribute("aria-label", heroTitle.textContent);
let charIndex = 0;
heroTitle.innerHTML = heroTitle.innerHTML
  .split(/<br\s*\/?>/)
  .map((line) =>
    [...line.trim()]
      .map((ch) => `<span class="char" style="animation-delay:${200 + charIndex++ * 50}ms" aria-hidden="true">${ch}</span>`)
      .join("")
  )
  .join("<br>");

// ---------- Лента избранных работ ----------
const showcase = document.getElementById("showcase");
showcase.innerHTML = WORKS.map(
    (w, i) => `
    <button class="show-card" data-work="${i}">
      <div class="media">${media(w, i)}<span class="round-btn" aria-hidden="true">↗</span></div>
      <div class="caption"><span>${w.title}</span></div>
    </button>`
  )
  .join("");

// Перетаскивание ленты мышью
let drag = null;
let dragged = false;
showcase.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse") return;
  drag = { x: e.clientX, left: showcase.scrollLeft };
  dragged = false;
});
addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 5) {
    dragged = true;
    showcase.classList.add("is-dragging");
  }
  showcase.scrollLeft = drag.left - dx;
});
addEventListener("pointerup", () => {
  drag = null;
  showcase.classList.remove("is-dragging");
  setTimeout(() => (dragged = false), 0);
});
showcase.addEventListener("dragstart", (e) => e.preventDefault());

// ---------- Дровер проекта ----------

const drawer = document.getElementById("drawer");
const drawerSheet = document.getElementById("drawerSheet");
const drawerContent = document.getElementById("drawerContent");
let lastFocus = null;

const slugOf = (w, i) => w.slug || String(i);
const paragraphs = (d) => (Array.isArray(d) ? d : d ? [d] : []).map((t) => `<p>${t}</p>`).join("");

function figure(img, cls = "") {
  return `<figure class="dw__figure ${cls}">
    <div class="dw__frame"><img src="${img.src}" alt="${img.caption || ""}" loading="lazy" onload="${markOrientation}"></div>
    ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ""}
  </figure>`;
}

function renderDrawer(i) {
  const w = WORKS[i];
  const images = w.images && w.images.length ? w.images : w.image ? [{ src: w.image }] : [];
  const [hero, ...rest] = images;
  const next = WORKS[(i + 1) % WORKS.length];
  const meta = [
    ["Клиент", w.client],
    ["Год", w.year],
    ["Роль", w.role],
    ["Категория", w.category],
  ].filter(([, v]) => v);

  drawerContent.innerHTML = `
    <article class="dw">
      <h2 class="dw__title" id="drawerTitle">${w.title}</h2>
      ${hero ? figure(hero, "dw__hero") : `<div class="dw__hero dw__frame media">${media(w, i)}</div>`}

      <div class="dw__info">
        <div class="dw__text">
          ${w.summary ? `<p class="dw__lead">${w.summary}</p>` : ""}
          ${paragraphs(w.description)}
        </div>
        <aside class="dw__meta">
          <dl>${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          ${(w.links || []).length ? `<div class="dw__links">${w.links.map((l) => `<a class="btn btn--dark" href="${l.url}" target="_blank" rel="noopener">${l.label} <span>↗</span></a>`).join("")}</div>` : ""}
          ${w.stack && w.stack.length ? `<div class="dw__stack"><dt>Стек</dt><div class="tags">${w.stack.map((t) => pill(t)).join("")}</div></div>` : ""}
        </aside>
      </div>

      ${rest.length ? `<div class="dw__gallery">${rest.map((img) => figure(img)).join("")}</div>` : ""}

      <a class="dw__next" href="#/work/${slugOf(next, WORKS.indexOf(next))}">
        <span class="dw__next-label">Следующий проект</span>
        <span class="dw__next-title">${next.title} <span>→</span></span>
      </a>
    </article>`;
  drawerSheet.scrollTop = 0;
}

function openDrawer(i, push = true) {
  if (!WORKS[i]) return;
  renderDrawer(i);
  if (!drawer.classList.contains("is-open")) lastFocus = document.activeElement;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const hash = `#/work/${slugOf(WORKS[i], i)}`;
  if (push && location.hash !== hash) history.pushState({ drawer: true }, "", hash);
  drawerSheet.focus({ preventScroll: true });
}

function hideDrawer() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}

function closeDrawer() {
  if (!drawer.classList.contains("is-open")) return;
  if (history.state && history.state.drawer) history.back();
  else {
    history.replaceState(null, "", location.pathname + location.search);
    hideDrawer();
  }
}

const indexFromHash = () => {
  const m = location.hash.match(/^#\/work\/(.+)$/);
  return m ? WORKS.findIndex((w, i) => slugOf(w, i) === decodeURIComponent(m[1])) : -1;
};

function syncWithHash() {
  const i = indexFromHash();
  if (i >= 0) openDrawer(i, false);
  else if (drawer.classList.contains("is-open")) hideDrawer();
}

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-work]");
  if (card) {
    if (dragged) {
      dragged = false;
      return;
    }
    openDrawer(+card.dataset.work);
    return;
  }
  const nextLink = e.target.closest(".dw__next");
  if (nextLink) {
    e.preventDefault();
    const i = WORKS.findIndex((w, k) => `#/work/${slugOf(w, k)}` === nextLink.getAttribute("href"));
    history.replaceState({ drawer: true }, "", nextLink.getAttribute("href"));
    openDrawer(i, false);
  }
});
drawer.addEventListener("click", (e) => e.target.closest("[data-close]") && closeDrawer());
document.addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());
addEventListener("popstate", syncWithHash);
syncWithHash();

// ---------- Шапка ----------
const header = document.getElementById("header");
let lastY = 0;
addEventListener(
  "scroll",
  () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("is-hidden", y > lastY && y > 400);
    lastY = y;
  },
  { passive: true }
);

// ---------- Появление при скролле ----------
const io = new IntersectionObserver(
  (entries) => {
    entries
      .filter((en) => en.isIntersecting)
      .forEach((en, n) => {
        en.target.style.transitionDelay = `${n * 90}ms`;
        en.target.classList.add("is-visible");
        setTimeout(() => (en.target.style.transitionDelay = ""), 1200 + n * 90);
        io.unobserve(en.target);
      });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

