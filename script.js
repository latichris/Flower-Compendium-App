/* script.js */

document.addEventListener('DOMContentLoaded', () => {

const loadingStartTime = Date.now();

const flowerPage = document.getElementById('flowerPage');
const bodyEl = document.body;
const topbar = document.querySelector('.topbar');
const catalogue = document.querySelector('.catalogue');

/* ---------------- Sidebar ---------------- */
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

const sidebarOverlay = document.getElementById('overlay');
if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });
}

/* ---------------- Filter Options ---------------- */
const FILTER_OPTIONS = {
  meaning: [
    { id: "love", label: "Love" },
    { id: "friendship", label: "Friendship" },
    { id: "virtues", label: "Virtues" },
    { id: "emotions", label: "Emotions" },
    { id: "fate", label: "Fate" },
    { id: "remembrance", label: "Remembrance" },
    { id: "wit", label: "Wit & Challenges" },
    { id: "beauty", label: "Beauty & Charm" }
  ],
  colour: [
    { id: "red", label: "Red" },
    { id: "white", label: "White" },
    { id: "yellow", label: "Yellow" },
    { id: "pink", label: "Pink" },
    { id: "purple", label: "Purple" },
    { id: "green", label: "Green" },
    { id: "blue", label: "Blue" },
    { id: "orange", label: "Orange" }
  ]
};

let activeFilters = { meaning: new Set(), colour: new Set() };

/* ---------------- Bottom Sheet ---------------- */
const bottomSheet = document.getElementById("bottomSheet");
const bottomOverlay = document.getElementById("bottomSheetOverlay");
const filterMenu = document.getElementById('filterMenu');

function openBottomSheet() {
  bottomSheet.style.bottom = "0";
  bottomOverlay.style.opacity = "1";
  bottomOverlay.style.pointerEvents = "auto";
  filterMenu.classList.remove("active");
}

function closeBottomSheet() {
  bottomSheet.style.bottom = "-100%";
  bottomOverlay.style.opacity = "0";
  bottomOverlay.style.pointerEvents = "none";
}

bottomOverlay.addEventListener("click", closeBottomSheet);

function renderFilterOptions(type) {
  const title = document.getElementById("bottomSheetTitle");
  const container = document.getElementById("bottomSheetOptions");
  title.textContent = "Filter by " + type;
  container.innerHTML = "";

  FILTER_OPTIONS[type].forEach(opt => {
    const row = document.createElement("label");
    row.className = "bottom-option";
    row.innerHTML = `<input type="checkbox" value="${opt.id}"><span>${opt.label}</span>`;
    container.appendChild(row);
  });

  container.querySelectorAll("input").forEach(chk => {
    if (activeFilters[type].has(chk.value)) chk.checked = true;
    chk.addEventListener("change", () => {
      if (chk.checked) activeFilters[type].add(chk.value);
      else activeFilters[type].delete(chk.value);
    });
  });
}

function applyFilters() {
  document.querySelectorAll(".flower-card").forEach(card => {
    const meaning = card.dataset.meaning;
    const colour = card.dataset.colour;
    const matchMeaning = activeFilters.meaning.size === 0 || activeFilters.meaning.has(meaning);
    const matchColour = activeFilters.colour.size === 0 || activeFilters.colour.has(colour);
    card.style.display = (matchMeaning && matchColour) ? "" : "none";
  });
}

document.getElementById("bottomSheetApply").addEventListener("click", () => {
  applyFilters();
  closeBottomSheet();
});

document.getElementById("filterMeaningButton").addEventListener("click", () => {
  renderFilterOptions("meaning");
  openBottomSheet();
});

document.getElementById("filterColourButton").addEventListener("click", () => {
  renderFilterOptions("colour");
  openBottomSheet();
});

document.getElementById("filterResetButton").addEventListener("click", () => {
  activeFilters.meaning.clear();
  activeFilters.colour.clear();
  document.querySelectorAll(".flower-card").forEach(card => { card.style.display = ""; });
  filterMenu.classList.remove("active");
});

/* ---------------- Search Mode ---------------- */
const menuIconEl = document.getElementById('menuIcon');
const menuDotsEl = document.getElementById('menuDots');
const filterNameBtn = document.getElementById('filterNameButton');
const topbarTitleEl = document.querySelector('.topbar-title');
const topbarSearchEl = document.getElementById('topbarSearch');

let inSearchMode = false;

function hideFilterMenu() {
  if (filterMenu) filterMenu.classList.remove('active');
}

function enterSearchMode() {
  if (inSearchMode) return;
  inSearchMode = true;
  topbarTitleEl.style.display = 'none';
  menuDotsEl.style.display = 'none';
  topbarSearchEl.style.display = 'inline-block';
  topbarSearchEl.value = '';
  topbarSearchEl.focus();
  menuIconEl.dataset.prev = menuIconEl.innerHTML;
  menuIconEl.innerHTML = '←';
  menuIconEl.classList.add('search-back');
  topbarSearchEl.addEventListener('input', searchFilter);
  hideFilterMenu();
}

function exitSearchMode() {
  if (!inSearchMode) return;
  inSearchMode = false;
  if (topbarTitleEl) topbarTitleEl.style.display = '';
  if (menuDotsEl) menuDotsEl.style.display = '';
  if (topbarSearchEl) {
    topbarSearchEl.style.display = 'none';
    topbarSearchEl.removeEventListener('input', searchFilter);
  }
  if (menuIconEl) {
    if (menuIconEl.dataset.prev) menuIconEl.innerHTML = menuIconEl.dataset.prev;
    menuIconEl.classList.remove('search-back');
  }
  const cat = document.querySelector('.catalogue');
  if (cat) {
    const overlay = document.createElement('div');
    overlay.className = 'catalogue-flash-overlay';
    cat.appendChild(overlay);
    setTimeout(() => overlay.remove(), 400);
  }
  document.querySelectorAll('.flower-card').forEach(c => c.style.display = '');
}

function searchFilter() {
  const q = topbarSearchEl.value.trim().toLowerCase();
  document.querySelectorAll('.flower-card').forEach(card => {
    const nameEl = card.querySelector('.flower-name');
    const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
    card.style.display = name.includes(q) ? '' : 'none';
  });
}

/* ---------------- Menu Wiring ---------------- */
if (menuIconEl) {
  menuIconEl.onclick = () => {
    if (inSearchMode) {
      exitSearchMode();
    } else {
      toggleMenu();
    }
  };
}

if (menuDotsEl) {
  menuDotsEl.onclick = (e) => {
    e.stopPropagation();
    filterMenu.classList.toggle("active");
  };
}

document.addEventListener("click", (e) => {
  if (!filterMenu.contains(e.target) && !menuDotsEl.contains(e.target)) {
    filterMenu.classList.remove("active");
  }
});

if (filterNameBtn) {
  filterNameBtn.addEventListener('click', () => {
    enterSearchMode();
    hideFilterMenu();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && inSearchMode) exitSearchMode();
});

/* ---------------- Sidebar Links ---------------- */
const compendiumLink = document.getElementById("compendiumLink");
if (compendiumLink) {
  compendiumLink.addEventListener("click", () => {
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const bouquetLink = document.getElementById("bouquetLink");
if (bouquetLink) {
  bouquetLink.addEventListener("click", (e) => {
    e.stopPropagation();
    const toast = document.createElement("div");
    toast.textContent = "Coming Soon!";
    toast.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:12px 18px;border-radius:8px;z-index:9999;font-size:15px;opacity:0;transition:opacity 0.3s ease;";
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = "1"; });
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 1800);
  });
}

/* ---------------- Options Page ---------------- */
const optionsPage        = document.getElementById('optionsPage');
const optionsBack        = document.getElementById('optionsBack');
const optionsLink        = document.getElementById('optionsLink');
const darkModeToggle     = document.getElementById('darkModeToggle');
const confidenceSegments = document.getElementById('confidenceSegments');

let confidenceThreshold = parseFloat(localStorage.getItem('confidenceThreshold') || '0.75');
const darkModeSaved = localStorage.getItem('darkMode') === 'true';

if (darkModeSaved) {
  bodyEl.classList.add('dark-mode');
  if (darkModeToggle) darkModeToggle.checked = true;
}

if (confidenceSegments) {
  confidenceSegments.querySelectorAll('.options-segment').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.value) === confidenceThreshold);
  });
}

function closeSidebarClean() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

function openOptionsPage() {
  closeSidebarClean();
  if (optionsPage) optionsPage.classList.add('active');
}

function closeOptionsPage() {
  if (optionsPage) optionsPage.classList.remove('active');
}

if (optionsLink) optionsLink.addEventListener('click', openOptionsPage);
if (optionsBack) optionsBack.addEventListener('click', closeOptionsPage);

if (darkModeToggle) {
  darkModeToggle.addEventListener('change', () => {
    bodyEl.classList.toggle('dark-mode', darkModeToggle.checked);
    localStorage.setItem('darkMode', darkModeToggle.checked);
  });
}

if (confidenceSegments) {
  confidenceSegments.querySelectorAll('.options-segment').forEach(btn => {
    btn.addEventListener('click', () => {
      confidenceSegments.querySelectorAll('.options-segment').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      confidenceThreshold = parseFloat(btn.dataset.value);
      localStorage.setItem('confidenceThreshold', confidenceThreshold);
    });
  });
}

/* ---------------- Support Page ---------------- */
const supportPage = document.getElementById('supportPage');
const supportBack = document.getElementById('supportBack');
const supportLink = document.getElementById('supportLink');
const supportBtn  = document.getElementById('supportBtn');

function openSupportPage() {
  closeSidebarClean();
  if (supportPage) supportPage.classList.add('active');
}

function closeSupportPage() {
  if (supportPage) supportPage.classList.remove('active');
}

if (supportLink) supportLink.addEventListener('click', openSupportPage);
if (supportBack) supportBack.addEventListener('click', closeSupportPage);

if (supportBtn) {
  supportBtn.addEventListener('click', () => {
    window.open('https://ko-fi.com/latichris', '_blank');
  });
}

/* ---------------- CSS Loader ---------------- */
function loadCSS(id, href) {
  return new Promise((resolve) => {
    const existing = document.getElementById(id);
    if (existing && existing.sheet) return resolve();
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet'; link.href = href;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

async function preloadAllFlowerStyles() {
  const cssFiles = [
    { id: 'style-base', href: 'data/flower-base.css' },
    { id: 'style-amaryllis', href: 'data/amaryllis.css' },
    { id: 'style-anemone', href: 'data/anemone.css' },
    { id: 'style-aster', href: 'data/aster.css' },
    { id: 'style-azalea', href: 'data/azalea.css' },
    { id: 'style-babysbreath', href: 'data/babysbreath.css' },
    { id: 'style-begonia', href: 'data/begonia.css' },
    { id: 'style-buttercup', href: 'data/buttercup.css' },
    { id: 'style-camellia', href: 'data/camellia.css' },
    { id: 'style-carnation', href: 'data/carnation.css' },
    { id: 'style-chrysanthemum', href: 'data/chrysanthemum.css' },
    { id: 'style-clematis', href: 'data/clematis.css' },
    { id: 'style-clover', href: 'data/clover.css' },
    { id: 'style-columbine', href: 'data/columbine.css' },
    { id: 'style-cornflower', href: 'data/cornflower.css' },
    { id: 'style-crocus', href: 'data/crocus.css' },
    { id: 'style-daffodil', href: 'data/daffodil.css' },
    { id: 'style-dahlia', href: 'data/dahlia.css' },
    { id: 'style-daisy', href: 'data/daisy.css' },
    { id: 'style-dandelion', href: 'data/dandelion.css' },
    { id: 'style-dogwood', href: 'data/dogwood.css' },
    { id: 'style-forget', href: 'data/forget.css' },
    { id: 'style-foxglove', href: 'data/foxglove.css' },
    { id: 'style-gladiolus', href: 'data/gladiolus.css' },
    { id: 'style-hawthorn', href: 'data/hawthorn.css' },
    { id: 'style-heather', href: 'data/heather.css' },
    { id: 'style-hellebore', href: 'data/hellebore.css' },
    { id: 'style-holly', href: 'data/holly.css' },
    { id: 'style-honeysuckle', href: 'data/honeysuckle.css' },
    { id: 'style-hyacinth', href: 'data/hyacinth.css' },
    { id: 'style-hydrangea', href: 'data/hydrangea.css' },
    { id: 'style-hyssop', href: 'data/hyssop.css' },
    { id: 'style-iris', href: 'data/iris.css' },
    { id: 'style-jasmine', href: 'data/jasmine.css' },
    { id: 'style-slipper', href: 'data/slipper.css' },
    { id: 'style-larkspur', href: 'data/larkspur.css' },
    { id: 'style-lavender', href: 'data/lavender.css' },
    { id: 'style-lilac', href: 'data/lilac.css' },
    { id: 'style-lily', href: 'data/lily.css' },
    { id: 'style-valley', href: 'data/valley.css' },
    { id: 'style-magnolia', href: 'data/magnolia.css' },
    { id: 'style-marigold', href: 'data/marigold.css' },
    { id: 'style-monkshood', href: 'data/monkshood.css' },
    { id: 'style-oleander', href: 'data/oleander.css' },
    { id: 'style-orchid', href: 'data/orchid.css' },
    { id: 'style-pansy', href: 'data/pansy.css' },
    { id: 'style-passionflower', href: 'data/passionflower.css' },
    { id: 'style-peony', href: 'data/peony.css' },
    { id: 'style-petunia', href: 'data/petunia.css' },
    { id: 'style-poppy', href: 'data/poppy.css' },
    { id: 'style-rose', href: 'data/rose.css' },
    { id: 'style-snapdragon', href: 'data/snapdragon.css' },
    { id: 'style-snowdrop', href: 'data/snowdrop.css' },
    { id: 'style-sunflower', href: 'data/sunflower.css' },
    { id: 'style-sweetpea', href: 'data/sweetpea.css' },
    { id: 'style-sweetwilliam', href: 'data/sweetwilliam.css' },
    { id: 'style-tulip', href: 'data/tulip.css' },
    { id: 'style-violet', href: 'data/violet.css' },
    { id: 'style-yarrow', href: 'data/yarrow.css' },
    { id: 'style-zinnia', href: 'data/zinnia.css' },
  ];
  await Promise.all(cssFiles.map(({ id, href }) => loadCSS(id, href)));
  console.log('✅ All flower styles loaded.');
}

/* ---------------- Flower Page ---------------- */
async function showFlowerContent(htmlString, flowerName) {
  const BG = {
    amaryllis:'#f3a88d',anemone:'#c25e3b',aster:'#9b6ba1',azalea:'#f29e75',
    babysbreath:'#a5cce2',begonia:'#e68a59',buttercup:'#e6b93c',camellia:'#e68796',
    carnation:'#cc6b6b',chrysanthemum:'#d79b2d',clematis:'#a181c9',clover:'#91cba3',
    columbine:'#a99dd1',cornflower:'#6b9fe0',crocus:'#b29dda',daffodil:'#c8c5c0',
    dahlia:'#b6554e',daisy:'#dbd9d3',dandelion:'#e8e6e3',dogwood:'#d9d2ca',
    forget:'#5ca8d1',foxglove:'#e4949d',gladiolus:'#e68f9b',hawthorn:'#cfcbc6',
    heather:'#b894b3',hellebore:'#a67c8c',holly:'#b33c35',honeysuckle:'#e5c96e',
    hyacinth:'#9477c9',hydrangea:'#5e9ad8',hyssop:'#7e83b7',iris:'#7e6abf',
    jasmine:'#e3d5a3',slipper:'#c58697',larkspur:'#6e7dc6',lavender:'#a18cbf',
    lilac:'#b48dc5',lily:'#e2ded6',valley:'#c9d1d6',magnolia:'#d6b8b7',
    marigold:'#c8942f',monkshood:'#6b73b3',oleander:'#c88998',orchid:'#b186b5',
    pansy:'#8068b6',passionflower:'#7784c2',peony:'#c78a9e',petunia:'#9578c5',
    poppy:'#b74438',rose:'#c47a90',snapdragon:'#d7837a',snowdrop:'#d1d7c4',
    sunflower:'#d9a93c',sweetpea:'#c894aa',sweetwilliam:'#d48697',tulip:'#c88494',
    violet:'#9b87c3',yarrow:'#d8c16f',zinnia:'#d77c74',
  }[flowerName] || '#fdf5f1';

  flowerPage.innerHTML = htmlString;

  const pageContainer = flowerPage.querySelector('.page-container');
  if (pageContainer) pageContainer.classList.add('flower-inner');

  flowerPage.style.backgroundColor = BG;
  flowerPage.classList.remove('slide-in', 'slide-out', 'active');

  if (topbar) topbar.style.zIndex = '0';
  if (catalogue) catalogue.style.visibility = 'hidden';

  flowerPage.style.zIndex = '10002';

  void flowerPage.offsetWidth;
  flowerPage.classList.add('active', 'slide-in');

  const backBtn = flowerPage.querySelector('.back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      flowerPage.classList.remove('slide-in');
      void flowerPage.offsetWidth;
      flowerPage.classList.add('slide-out');
      setTimeout(() => {
        flowerPage.innerHTML = '';
        flowerPage.classList.remove('active', 'slide-out');
        flowerPage.style.backgroundColor = '';
        flowerPage.style.zIndex = '';
        if (topbar) topbar.style.zIndex = '';
        if (catalogue) catalogue.style.visibility = 'visible';
      }, 450);
    }, { once: true });
  }
}

async function loadFlower(flowerName) {
  try {
    bodyEl.classList.add('transitioning');
    const resp = await fetch(`data/${flowerName}.html?v=${Date.now()}`);
    if (!resp.ok) throw new Error('Fetch failed');
    const text = await resp.text();
    await showFlowerContent(text, flowerName);
  } catch (err) {
    console.warn(`⚠️ Fetch failed for ${flowerName}`, err);
    const tmpl = document.getElementById(`tmpl-${flowerName}`);
    if (tmpl) await showFlowerContent(tmpl.innerHTML, flowerName);
    else await showFlowerContent(`<div>Could not load ${flowerName}</div>`, flowerName);
  } finally {
    bodyEl.classList.remove('transitioning');
  }
}

/* ---------------- Loading Messages ---------------- */
const LOADING_MESSAGES = [
  "Planting some flowers…",
  "Hearing the latest tea from some hollies…",
  "The lilacs are being dramatic again…",
  "Asking some jasmines to cheer me up…",
  "Hiding from the bees…",
  "Watering the garden…",
  "Arranging the bouquets…",
  "Gifting tulips to Bob…",
  "Preparing some roses for her…",
  "Waiting for dogwoods to bloom…",
];

let loadingMsgInterval = null;

function startLoadingMessages() {
  const textEl = document.querySelector('.loading-text');
  if (!textEl) return;

  let lastIdx = Math.floor(Math.random() * LOADING_MESSAGES.length);
  const recentIdxs = [lastIdx];
  textEl.textContent = LOADING_MESSAGES[lastIdx];

  setTimeout(() => { textEl.style.opacity = '1'; }, 300);

  loadingMsgInterval = setInterval(() => {
    textEl.classList.add('fade-out');
    setTimeout(() => {
      if (Math.random() < 0.01) {
        textEl.textContent = "fuck :3";
        textEl.classList.remove('fade-out');
        return;
      }
      let next;
      do { next = Math.floor(Math.random() * LOADING_MESSAGES.length); }
      while (recentIdxs.includes(next));
      recentIdxs.push(next);
      if (recentIdxs.length > 6) recentIdxs.shift();
      lastIdx = next;
      textEl.textContent = LOADING_MESSAGES[next];
      textEl.classList.remove('fade-out');
    }, 400);
  }, 3500);
}

startLoadingMessages();

/* ---------------- Startup ---------------- */
(async function initApp() {
  await preloadAllFlowerStyles();
  console.log('🌸 App ready.');

  const cards = document.querySelectorAll('.flower-card');
  console.log('Cards found:', cards.length);

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const flower = card.dataset.flower;
      if (!flower) return;
      loadFlower(flower);
    });
  });

  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    const isFirstVisit = !sessionStorage.getItem('hasVisited');
    if (isFirstVisit) sessionStorage.setItem('hasVisited', 'true');
    const minDisplay = isFirstVisit ? 9000 : 2000;
    const elapsed = Date.now() - loadingStartTime;
    const remaining = Math.max(0, minDisplay - elapsed);
    setTimeout(() => {
      if (loadingMsgInterval) clearInterval(loadingMsgInterval);
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.remove(), 700);
    }, remaining);
  }
})();

/* ---------------- Music ---------------- */
let music = new Audio("Home.mp3");
music.loop = true;
music.volume = 0;
let musicOn = false;

const toggleMusicBtn = document.getElementById("toggleMusicButton");

function fadeAudio(targetVolume, callback) {
  let fadeDuration = 500, fadeSteps = 20;
  let stepTime = fadeDuration / fadeSteps;
  let current = music.volume;
  let step = (targetVolume - current) / fadeSteps;
  let interval = setInterval(() => {
    current += step;
    music.volume = Math.min(Math.max(current, 0), 1);
    if ((step > 0 && music.volume >= targetVolume) || (step < 0 && music.volume <= targetVolume)) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, stepTime);
}

toggleMusicBtn.addEventListener("click", () => {
  if (!musicOn) {
    musicOn = true;
    toggleMusicBtn.textContent = "Mute music";
    music.currentTime = 0;
    music.play().then(() => { fadeAudio(1); }).catch(() => {
      document.body.addEventListener("click", userStart);
    });
  } else {
    fadeAudio(0, () => { music.pause(); music.currentTime = 0; });
    musicOn = false;
    toggleMusicBtn.textContent = "Play music";
  }
});

function userStart() {
  music.play();
  fadeAudio(1);
  musicOn = true;
  toggleMusicBtn.textContent = "Mute music";
  document.body.removeEventListener("click", userStart);
}

/*****************************************************
 * AI FLOWER IDENTIFIER — TensorFlow.js
 *****************************************************/

const LABEL_TO_KEY = {
  forgetmenot:     'forget',
  gladiolas:       'gladiolus',
  ladysslipper:    'slipper',
  lilyofthevalley: 'valley',
  roses:           'rose',
  viola:           'violet',
};

let flowerModel = null;
let flowerLabels = null;
let cameraStream = null;
let rafId = null;
let isInferring = false;
let isLocked = false;
let lockedFlowerName = null;

const identifierPanel  = document.getElementById("identifierPanel");
const cameraVideo      = document.getElementById("cameraStream");
const inferenceCanvas  = document.getElementById("inferenceCanvas");
const scanHint         = document.getElementById("scanHint");
const cameraLink       = document.getElementById("cameraLink");
const closeIdentifier  = document.getElementById("closeIdentifier");
const resultCard       = document.getElementById("resultCard");
const resultCardName   = document.getElementById("resultCardName");
const resultCardConf   = document.getElementById("resultCardConfidence");
const resultCardImage  = document.getElementById("resultCardImage");
const resultGalleryImg = document.getElementById("resultGalleryImage");
const resultProfileBtn = document.getElementById("resultCardProfileBtn");
const resultScanAgain  = document.getElementById("resultCardScanAgain");
const resultCloseBtn   = document.getElementById("resultCardClose");
const cameraGlow       = document.getElementById("cameraGlow");

let lowConfidenceStreak = 0;
const LOW_CONF_LIMIT = 20;
let noResultShown = false;

async function loadFlowerModel() {
  if (flowerModel) return;
  scanHint.textContent = "Loading model…";
  try {
    [flowerModel, flowerLabels] = await Promise.all([
      tf.loadGraphModel('./models/model.json'),
      fetch('./models/labels.json').then(r => r.json())
    ]);
    console.log('✅ Model loaded:', Object.keys(flowerLabels).length, 'classes');
    scanHint.textContent = "Point the camera at a flower 🌸";
  } catch (err) {
    console.error("Model load failed:", err);
    scanHint.textContent = "❌ Failed to load model";
  }
}

function preprocessImage(source) {
  return tf.tidy(() =>
    tf.browser.fromPixels(source)
      .resizeBilinear([224, 224])
      .toFloat()
      .sub(127.5)
      .div(127.5)
      .expandDims(0)
  );
}

async function runPrediction(source) {
  if (!flowerModel || !flowerLabels) return null;
  const tensor = preprocessImage(source);
  const out = flowerModel.execute(tensor);
  const scores = await out.data();
  tensor.dispose();
  out.dispose();
  return Array.from(scores)
    .map((score, i) => ({ flower: flowerLabels[i], confidence: score }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

function loadGalleryImage(flowerKey, imgEl) {
  imgEl.src = `gallery/${flowerKey}1.png`;
  imgEl.onerror = () => {
    imgEl.src = `gallery/${flowerKey}1.jpg`;
    imgEl.onerror = () => { imgEl.src = ''; };
  };
}

function showResultCard(top3) {
  isLocked = true;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

  const ctx = inferenceCanvas.getContext("2d");
  inferenceCanvas.width  = cameraVideo.videoWidth  || 300;
  inferenceCanvas.height = cameraVideo.videoHeight || 400;
  ctx.drawImage(cameraVideo, 0, 0, inferenceCanvas.width, inferenceCanvas.height);

  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  cameraVideo.style.display     = "none";
  inferenceCanvas.style.display = "block";

  const best = top3[0];
  const raw = best.flower.toLowerCase().replace(/[^a-z]/g, '');
  lockedFlowerName = LABEL_TO_KEY[raw] || raw;
  const pct = (best.confidence * 100).toFixed(0);

  resultCardName.textContent = best.flower;
  resultCardConf.textContent = `${pct}% confidence`;

  resultCardImage.style.display = 'block';
  resultCardImage.src = `images/${lockedFlowerName}.png`;
  resultCardImage.onerror = () => { resultCardImage.style.display = 'none'; };

  loadGalleryImage(lockedFlowerName, resultGalleryImg);
  resultCard.classList.add("visible");
}

function hideResultCard() {
  resultCard.classList.remove("visible");
  isLocked = false;
  lockedFlowerName = null;
}

function resetScan() {
  hideResultCard();
  inferenceCanvas.style.display = "none";
  cameraVideo.style.display     = "block";
  scanHint.textContent = "Point the camera at a flower 🌸";
  scanHint.className = 'scan-hint-bar';
  setGlow('none');
  lowConfidenceStreak = 0;
  noResultShown = false;
  startCamera().then(() => inferenceLoop());
}

async function startCamera() {
  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }, audio: false
  });
  cameraVideo.srcObject = cameraStream;
  await cameraVideo.play();
}

function stopCamera() {
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  isInferring = false;
  isLocked = false;
}

function setGlow(level) {
  cameraGlow.classList.remove('tentative', 'tentative-strong');
  if (level === 'tentative') cameraGlow.classList.add('tentative');
  else if (level === 'strong') cameraGlow.classList.add('tentative-strong');
}

async function inferenceLoop() {
  if (isInferring || !cameraStream || isLocked) return;
  isInferring = true;
  try {
    const top3 = await runPrediction(cameraVideo);
    if (top3 && top3[0].confidence > confidenceThreshold) {
      setGlow('none');
      showResultCard(top3);
      isInferring = false;
      return;
    } else if (top3 && top3[0].confidence > confidenceThreshold * 0.8) {
      scanHint.textContent = `Maybe ${top3[0].flower}…`;
      scanHint.className = 'scan-hint-bar tentative';
      setGlow('strong');
      lowConfidenceStreak = 0;
      noResultShown = false;
    } else if (top3 && top3[0].confidence > confidenceThreshold * 0.55) {
      scanHint.textContent = `Maybe ${top3[0].flower}…`;
      scanHint.className = 'scan-hint-bar tentative';
      setGlow('tentative');
      lowConfidenceStreak = 0;
      noResultShown = false;
    } else {
      setGlow('none');
      lowConfidenceStreak++;
      if (lowConfidenceStreak >= LOW_CONF_LIMIT && !noResultShown) {
        noResultShown = true;
        scanHint.textContent = "Try moving closer, or improve the light 🌿";
        scanHint.className = 'scan-hint-bar no-result';
        setTimeout(() => {
          if (!isLocked) {
            scanHint.textContent = "Point the camera at a flower 🌸";
            scanHint.className = 'scan-hint-bar';
            lowConfidenceStreak = 0;
            noResultShown = false;
          }
        }, 4000);
      } else if (!noResultShown) {
        scanHint.textContent = "Point the camera at a flower 🌸";
        scanHint.className = 'scan-hint-bar';
      }
    }
  } catch (err) { console.error("Inference error:", err); }
  isInferring = false;
  setTimeout(() => { if (!isLocked) rafId = requestAnimationFrame(inferenceLoop); }, 500);
}

function closeIdentifierPanel() {
  identifierPanel.style.display = "none";
  stopCamera();
  hideResultCard();
  setGlow('none');
  lowConfidenceStreak = 0;
  noResultShown = false;
  scanHint.className = 'scan-hint-bar';
  inferenceCanvas.style.display = "none";
  cameraVideo.style.display     = "block";
}

cameraLink.addEventListener("click", async () => {
  closeSidebarClean();
  identifierPanel.style.display = "flex";
  hideResultCard();
  inferenceCanvas.style.display = "none";
  cameraVideo.style.display     = "block";
  scanHint.textContent = "Point the camera at a flower 🌸";
  await loadFlowerModel();
  await startCamera();
  inferenceLoop();
});

closeIdentifier.addEventListener("click", () => {
  identifierPanel.style.display = "none";
  stopCamera();
  hideResultCard();
  setGlow('none');
  lowConfidenceStreak = 0;
  noResultShown = false;
  scanHint.className = 'scan-hint-bar';
  inferenceCanvas.style.display = "none";
  cameraVideo.style.display     = "block";
});

resultScanAgain.addEventListener("click", resetScan);

resultCloseBtn.addEventListener("click", () => {
  identifierPanel.style.display = "none";
  stopCamera();
  hideResultCard();
  inferenceCanvas.style.display = "none";
  cameraVideo.style.display     = "block";
});

resultProfileBtn.addEventListener("click", () => {
  if (lockedFlowerName) loadFlower(lockedFlowerName);
});

const imageUploadButton = document.getElementById("imageUploadButton");
const imageUploadInput  = document.getElementById("imageUploadInput");

imageUploadButton.addEventListener("click", () => imageUploadInput.click());

imageUploadInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  stopCamera();
  scanHint.textContent = "Analysing…";
  await loadFlowerModel();

  const img = new Image();
  img.onload = async () => {
    const ctx = inferenceCanvas.getContext("2d");
    inferenceCanvas.width = 300; inferenceCanvas.height = 400;
    ctx.drawImage(img, 0, 0, 300, 400);
    inferenceCanvas.style.display = "block";
    cameraVideo.style.display     = "none";

    const top3 = await runPrediction(img);
    if (top3 && top3[0].confidence > 0.5) {
      showResultCard(top3);
    } else {
      scanHint.textContent = "Couldn't identify this flower";
    }
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(file);
});

}); // end DOMContentLoaded


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/Flower-Compendium-App/service-worker.js')
    .then(reg => {
      console.log('✅ Service worker registered');
      if (!navigator.serviceWorker.controller) {
        window.location.reload();
      }
    })
    .catch(err => console.warn('SW registration failed:', err));
}
