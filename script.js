// Абстрактные 3D-заглушки (сфера на пьедестале), пока нет своих картинок.
// px/pw/ph — положение и размер пьедестала, s — размер сферы (в %).
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

const media = (item, i) =>
  item.image
    ? `<img class="media__img" src="${item.image}" alt="${item.title || ""}" loading="lazy">`
    : `<div class="art" style="${artStyle(i)}"></div>`;

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
      <div class="caption"><span>${w.title}</span><small>для ${w.client}</small></div>
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

// ---------- Модальное окно проекта ----------
const modal = document.getElementById("modal");
document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-work]");
  if (!card) return;
  if (dragged) {
    dragged = false;
    return;
  }
  const i = +card.dataset.work;
  const w = WORKS[i];
  document.getElementById("modalCover").innerHTML = media(w, i);
  document.getElementById("modalTags").innerHTML = pill(w.category) + pill(w.client);
  document.getElementById("modalTitle").textContent = w.title;
  document.getElementById("modalText").textContent = w.description;
  const link = document.getElementById("modalLink");
  link.href = w.link || "#";
  link.style.display = w.link && w.link !== "#" ? "" : "none";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
});

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};
modal.addEventListener("click", (e) => e.target.closest("[data-close]") && closeModal());
document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

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

