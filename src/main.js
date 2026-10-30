import "./style.css";
import * as THREE from "three";
import { TweenMax, TimelineMax, Power2, Power3, Expo } from "gsap";
import { CornWorld } from "./scene.js";

const conditions = [
  {
    id: "wind",
    label: "WIND",
    description: "The Boreas mobile wind machine simulates high winds to test stalk and root strength at critical points in the growing season.",
    symbol: "wind",
  },
  {
    id: "drought",
    label: "DROUGHT",
    description: "Dedicated managed-stress environments and water-limited trials help identify hybrids that make the most of every drop of water.",
    symbol: "drought",
  },
  {
    id: "disease",
    label: "DISEASE",
    description: "Breeders test for tolerance to local threats, including Goss’s wilt and northern corn leaf blight.",
    symbol: "disease",
  },
  {
    id: "population",
    label: "POPULATION DENSITY",
    description: "Plants are tested at different seeding rates to find the balance between population and performance.",
    symbol: "population",
  },
  {
    id: "soil",
    label: "SOIL",
    description: "Performance is observed in different soils and environments to guide placement and management.",
    symbol: "soil",
  },
];

const slides = [
  {
    id: "home",
    chapter: "",
    title: "CORN. REVOLUTIONIZED.",
    description: "From lab to field, it’s corn seed development that will change farming.",
    cta: "SCROLL TO\nDISCOVER",
    palette: "home",
    visual: "corn",
  },
  {
    id: "science",
    chapter: "CHAPTER 1 · SCIENCE",
    title: "FIRST, A SOLID\nFOUNDATION.",
    description: "We have the world’s most comprehensive corn germplasm library. And every year, we create more unique genetic lines, each one traceable back to the first inbred development program started in 1920.",
    cta: "EXPLORE THE\nLIBRARY",
    palette: "science",
    visual: "helix",
  },
  {
    id: "testing",
    chapter: "CHAPTER 2 · REAL WORLD TESTING",
    title: "WE TAKE IT TO\nTHE FIELD.",
    description: "Now, the testing gets exponentially tougher. At each of Pioneer’s research plots, corn seeds that have made it this far undergo rigorous stress tests. New tools give precise measurements on how the plants respond.",
    cta: "EXPERIENCE THE\nTESTS",
    palette: "field",
    visual: "field",
  },
  {
    id: "conditions",
    chapter: "CHAPTER 2 · REAL WORLD TESTING",
    title: "YOUR REGION.\nYOUR CONDITIONS.",
    description: "Select a condition to see how every hybrid is put through its paces.",
    cta: "CONTINUE THE\nSTORY",
    palette: "field",
    visual: "plant",
  },
  {
    id: "trials",
    chapter: "CHAPTER 2 · REAL WORLD TESTING",
    title: "TESTING, TESTING\nAND MORE TESTING.",
    description: "A second year of pre-commercial testing. More locations. Expanding decision zones. Now we conduct 8x more late-stage field tests, comparing proven leaders, competitive seeds and experimental hybrids, so only the best make it to a farmer’s field.",
    cta: "SEE THE\nRESULTS",
    palette: "field",
    visual: "field",
  },
  {
    id: "result",
    chapter: "CHAPTER 3 · RESULT",
    title: "LESS THAN 0.01%\nOF SEEDS MAKE IT.",
    description: "The best of the best survive computer simulations, lab tests, field tests and discerning breeders to make it into a Pioneer bag.",
    cta: "EXPLORE THE\nSTORY AGAIN",
    palette: "result",
    visual: "kernels",
  },
];

const app = document.querySelector("#experience");
const title = document.querySelector("[data-title]");
const eyebrow = document.querySelector("[data-eyebrow]");
const description = document.querySelector("[data-description]");
const cta = document.querySelector("[data-cta]");
const ctaLabel = document.querySelector("[data-cta-label]");
const counter = document.querySelector("[data-counter]");
const railLabel = document.querySelector("[data-rail-label]");
const railDots = document.querySelector("[data-rail-dots]");
const picker = document.querySelector("[data-condition-picker]");
const scrollCue = document.querySelector("[data-scroll-cue]");
const storyMenu = document.querySelector(".story-menu");
const menuToggle = document.querySelector(".menu-toggle");
const notice = document.querySelector("[data-notice]");

let activeIndex = 0;
let activeCondition = "wind";
let isAnimating = false;
let menuOpen = false;
let detailOpen = false;
let wheelLock = false;
let noticeTimer = null;
const world = new CornWorld(document.querySelector("#world"));

function chapterFor(index) {
  if (index === 0) return "";
  if (index <= 1) return "SCIENCE";
  if (index <= 4) return "REAL WORLD TESTING";
  return "RESULT";
}

function buildPicker() {
  picker.innerHTML = conditions.map((condition) => `
    <button class="condition-button" type="button" data-condition="${condition.id}" aria-label="${condition.label}" aria-pressed="false">
      <span class="condition-icon condition-icon--${condition.symbol}" aria-hidden="true"></span>
      <small>${condition.label}</small>
    </button>
  `).join("");
  picker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-condition]");
    if (!button) return;
    setCondition(button.dataset.condition);
  });
}

function render(index, { initial = false } = {}) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  const slide = slides[activeIndex];
  app.dataset.palette = slide.palette;
  app.dataset.visual = slide.visual;
  eyebrow.textContent = slide.chapter;
  title.textContent = slide.title;
  description.textContent = slide.description;
  ctaLabel.textContent = slide.cta;
  counter.textContent = String(activeIndex + 1).padStart(2, "0");
  railLabel.textContent = chapterFor(activeIndex);
  scrollCue.classList.toggle("is-hidden", activeIndex > 0);
  picker.classList.toggle("is-visible", activeIndex === 3);
  document.querySelectorAll(".rail-dot").forEach((dot) => {
    const dotIndex = Number(dot.dataset.railIndex);
    dot.classList.toggle("is-active", chapterFor(dotIndex) === chapterFor(activeIndex));
    dot.setAttribute("aria-current", chapterFor(dotIndex) === chapterFor(activeIndex) ? "step" : "false");
  });
  syncHash(slide.id);
  world.setScene(slide.visual, { condition: activeCondition, instant: initial });
}

function syncHash(id) {
  const hash = id === "home" ? "" : `#${id === "trials" ? "testing" : id}`;
  if (window.location.hash !== hash) history.replaceState(null, "", `${location.pathname}${hash}`);
}

function goTo(index, { immediate = false } = {}) {
  if (isAnimating || index === activeIndex || menuOpen || detailOpen) return;
  const next = Math.max(0, Math.min(slides.length - 1, index));
  if (immediate) {
    render(next);
    return;
  }
  isAnimating = true;
  const tl = new TimelineMax({
    onComplete: () => { isAnimating = false; },
  });
  tl.to(".copy-stack", 0.22, { y: -12, opacity: 0, filter: "blur(5px)", ease: Power2.easeIn })
    .call(() => render(next))
    .fromTo(".copy-stack", 0.68, { y: 18, opacity: 0, filter: "blur(7px)" }, { y: 0, opacity: 1, filter: "blur(0px)", ease: Expo.easeOut })
    .fromTo(".orbit-cta", 0.55, { scale: 0.82, opacity: 0 }, { scale: 1, opacity: 1, ease: Power3.easeOut }, "-=0.42");
}

function setCondition(id) {
  const condition = conditions.find((item) => item.id === id);
  if (!condition) return;
  activeCondition = id;
  document.querySelectorAll(".condition-button").forEach((button) => {
    const active = button.dataset.condition === id;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  eyebrow.textContent = condition.label;
  title.textContent = condition.label;
  description.textContent = condition.description;
  TweenMax.fromTo(".copy-stack", 0.65, { y: 14, opacity: 0.2, filter: "blur(4px)" }, { y: 0, opacity: 1, filter: "blur(0px)", ease: Expo.easeOut });
  world.setScene("plant", { condition });
}

function showNotice(message) {
  notice.textContent = message;
  notice.classList.add("is-visible");
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => notice.classList.remove("is-visible"), 2200);
}

function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.classList.add("is-open");
  storyMenu.setAttribute("aria-hidden", "false");
  storyMenu.classList.add("is-open");
  const tl = new TimelineMax();
  tl.fromTo(storyMenu, 0.65, { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", ease: Power3.easeInOut })
    .staggerFromTo(".chapter-link", 0.55, { x: -25, opacity: 0 }, { x: 0, opacity: 1, ease: Expo.easeOut }, 0.08, "-=0.28")
    .staggerFromTo(".menu-actions > *", 0.4, { x: 18, opacity: 0 }, { x: 0, opacity: 1, ease: Power2.easeOut }, 0.08, "-=0.35");
}

function closeMenu() {
  if (!menuOpen) return;
  const tl = new TimelineMax({ onComplete: () => {
    menuOpen = false;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.classList.remove("is-open");
    storyMenu.setAttribute("aria-hidden", "true");
    storyMenu.classList.remove("is-open");
  }});
  tl.to(storyMenu, 0.45, { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", ease: Power3.easeInOut });
}

function openLibrary() {
  detailOpen = true;
  const drawer = document.querySelector(".library-story");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  TweenMax.fromTo(drawer, 0.75, { x: "100%", opacity: 0.3 }, { x: "0%", opacity: 1, ease: Power3.easeOut });
}

function closeLibrary() {
  const drawer = document.querySelector(".library-story");
  if (!detailOpen) return;
  TweenMax.to(drawer, 0.45, { x: "100%", opacity: 0, ease: Power2.easeIn, onComplete: () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    detailOpen = false;
  }});
}

function nextScene() {
  if (detailOpen) return closeLibrary();
  if (menuOpen) return closeMenu();
  goTo(activeIndex + 1);
}

function previousScene() {
  if (detailOpen) return closeLibrary();
  if (menuOpen) return closeMenu();
  goTo(activeIndex - 1);
}

function handleWheel(event) {
  event.preventDefault();
  if (wheelLock || Math.abs(event.deltaY) < 12) return;
  wheelLock = true;
  if (event.deltaY > 0) nextScene(); else previousScene();
  window.setTimeout(() => { wheelLock = false; }, 850);
}

function handleKeys(event) {
  if (["ArrowDown", "PageDown", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
    nextScene();
  } else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(event.key)) {
    event.preventDefault();
    previousScene();
  } else if (event.key === "Escape") {
    closeMenu();
    closeLibrary();
  }
}

buildPicker();
railDots.innerHTML = [1, 2, 5].map((index) => `<button type="button" class="rail-dot" data-rail-index="${index}" aria-label="Go to ${chapterFor(index)}"></button>`).join("");
railDots.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-rail-index]");
  if (dot) goTo(Number(dot.dataset.railIndex));
});
menuToggle.addEventListener("click", () => menuOpen ? closeMenu() : openMenu());
document.querySelector(".menu-close").addEventListener("click", closeMenu);
document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => { const target = Number(button.dataset.jump); closeMenu(); window.setTimeout(() => goTo(target, { immediate: true }), 520); }));
document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  const hasOverlay = menuOpen || detailOpen;
  closeMenu();
  closeLibrary();
  if (hasOverlay) window.setTimeout(() => goTo(0), 520); else goTo(0);
});
document.querySelector("[data-cta]").addEventListener("click", () => {
  if (activeIndex === 0) return goTo(1);
  if (activeIndex === 1) return openLibrary();
  if (activeIndex === 2) return goTo(3);
  if (activeIndex === 3) return goTo(4);
  if (activeIndex === 4) return goTo(5);
  goTo(0);
});
document.querySelector("[data-library-close]").addEventListener("click", closeLibrary);
document.querySelectorAll("[data-menu-action]").forEach((button) => button.addEventListener("click", () => {
  const action = button.dataset.menuAction;
  const message = action === "newsletter" ? "NEWS SIGN-UP · LOCAL UI DEMO, NO DATA SENT" : action === "contact" ? "TERRITORY MANAGER · LOCAL UI DEMO, NO DATA SENT" : "LEGAL & TRADEMARK · PIONEER.COM/PRIVACY-POLICY";
  showNotice(message);
}));
window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeys);
window.addEventListener("resize", () => world.resize());

const initialId = window.location.hash.slice(1);
const initialIndex = initialId === "science" ? 1 : initialId === "testing" ? 2 : initialId === "result" ? 5 : 0;
render(initialIndex, { initial: true });
TweenMax.to(".loader", 0.7, { opacity: 0, delay: 0.4, ease: Power2.easeOut, onComplete: () => document.querySelector(".loader").remove() });

