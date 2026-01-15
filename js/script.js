// =====================
// Circad·IA — script.js
// =====================

const select = document.getElementById("fase");
const audio = document.getElementById("audio");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const body = document.body;
const banner = document.getElementById("banner");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const phaseImage = document.getElementById("phaseImage");
const trackNameEl = document.getElementById("trackName");
const liveTimeEl = document.getElementById("liveTime");


// Mensajes de banner (por idioma)
const bannersByLang = {
  es: [
    "La tecnología no es neutra. Es ritmo que se acopla a tu biología.",
    "La tecnología no es causa. Es mediación en tu experiencia vital.",
    "La tecnología no es pasiva. Se integra como parte de tu ciclo biológico.",
    "La tecnología no es externa. Es resonancia de tu propio organismo.",
    "La tecnología no es aislada. Se convierte en acompañante de tu metabolismo.",
    "La tecnología no es inocente. Es arquitectura de tu percepción biológica.",
    "La tecnología no es ajena. Es interfaz de tu propio ritmo vital.",
    "La tecnología no es neutral. Es coreografía de tu experiencia corporal."
  ],
  en: [
    "Technology is not neutral. It is rhythm synced to your biology.",
    "Technology is not the cause. It mediates your lived experience.",
    "Technology is not passive. It becomes part of your daily cycle.",
    "Technology is not external. It resonates with your own organism.",
    "Technology is not isolated. It accompanies your metabolism.",
    "Technology is not innocent. It shapes biological perception.",
    "Technology is not distant. It is an interface to your vital rhythm.",
    "Technology is not neutral. It choreographs embodied experience."
  ],
  fr: [
    "La technologie n’est pas neutre. C’est un rythme accordé à ta biologie.",
    "La technologie n’est pas la cause. Elle médie ton expérience vécue.",
    "La technologie n’est pas passive. Elle s’intègre à ton cycle quotidien.",
    "La technologie n’est pas externe. Elle résonne avec l’organisme.",
    "La technologie n’est pas isolée. Elle accompagne ton métabolisme.",
    "La technologie n’est pas innocente. Elle façonne la perception biologique.",
    "La technologie n’est pas lointaine. Elle interface ton rythme vital.",
    "La technologie n’est pas neutre. Elle chorégraphie l’expérience corporelle."
  ]
};


// Diccionario de nombres amigables
const trackNames = {
  amanecer: {
    "track01.mp3": "Aurora suave",
    "track02.mp3": "Amanecer primaveral",
    "track03.mp3": "Luz creciente",
    "track04.mp3": "Ritmo vital",
    "track05.mp3": "Energía matinal",
    "track06.mp3": "Inicio sereno",
  },
  mediodia: {
    "track01.mp3": "Plenitud solar",
    "track02.mp3": "Foco intenso",
    "track03.mp3": "Energía máxima",
    "track04.mp3": "Claridad máxima",
    "track05.mp3": "Impulso cognitivo",
    "track06.mp3": "Rendimiento alto",
  },
  atardecer: {
    "track01.mp3": "Declive luminoso",
    "track02.mp3": "Atardecer soleado",
    "track03.mp3": "Horizonte cálido",
    "track04.mp3": "Descanso imperecedero",
    "track05.mp3": "Travesía tranquila",
    "track06.mp3": "Ocaso reflexivo",
  },
  noche: {
    "track01.mp3": "Pausa profunda",
    "track02.mp3": "Estrella del alba",
    "track03.mp3": "Silencio estelar",
    "track04.mp3": "Descanso interior",
    "track05.mp3": "Sueño reparador",
    "track06.mp3": "Oscuridad acogedora",
  },
};

// Arrays de pistas
const tracks = {
  amanecer: Array.from(
    { length: 6 },
    (_, i) => `songs/amanecer/track0${i + 1}.mp3`
  ),
  mediodia: Array.from(
    { length: 6 },
    (_, i) => `songs/mediodia/track0${i + 1}.mp3`
  ),
  atardecer: Array.from(
    { length: 6 },
    (_, i) => `songs/atardecer/track0${i + 1}.mp3`
  ),
  noche: Array.from({ length: 6 }, (_, i) => `songs/noche/track0${i + 1}.mp3`),
};


const PHASES = ["amanecer","mediodia","atardecer","noche"];
let currentPhase = "amanecer";

function getCurrentPhase() {
  for (const p of PHASES) {
    if (document.body.classList.contains(p)) return p;
  }
  return currentPhase || "noche";
}

function setPhaseClass(phase) {
  PHASES.forEach(p => document.body.classList.remove(p));
  document.body.classList.add(phase);
  currentPhase = phase;
}

let manualOverride = false;
let overrideTimer = null;
let overrideEndsAt = 0; // timestamp (ms) para mostrar cuenta atrás en modo manual

// Pequeño aviso (toast) cuando el sistema vuelve a modo automático
let autoToastUntil = 0; // timestamp (ms)

function activateManualOverride(durationMs = 300000) {
  manualOverride = true;
  overrideEndsAt = Date.now() + durationMs;
  clearTimeout(overrideTimer);
  overrideTimer = setTimeout(() => {
    manualOverride = false;
    overrideEndsAt = 0;
    showHudToast(t("labels.reenabled"));
    updateLiveTime();
  }, durationMs);
  updateLiveTime();
}

// Estado de reproducción
let isTransition = false;
let transitionTargetPhase = null;

// Banner aleatorio
function randomBanner(force=false) {
  const list = (bannersByLang[currentLang] || bannersByLang.es);
  if (!force && Math.random() < 0.2) return;
  const chosen = list[Math.floor(Math.random() * list.length)];
  banner.textContent = chosen;
}


// Evitar repetir la misma pista consecutiva
let lastTrack = null;
function randomTrack(fase) {
  const list = tracks[fase];
  let chosen;
  do {
    chosen = list[Math.floor(Math.random() * list.length)];
  } while (chosen === lastTrack && list.length > 1);
  lastTrack = chosen;
  return chosen;
}

// Mostrar nombre de pista
function showTrackName(fase, path) {
  const file = path.split("/").pop();
  if (file.includes("short") || file.includes("long")) {
    trackNameEl.textContent = "🔀 " + t("labels.transition");
    return;
  }
  const alias = trackNames[fase][file] || file;
  trackNameEl.textContent = "🎧 " + alias;
}

// Reproduce transición y luego canción
function playTransitionThenSong(fase, tipo = "short") {
  const transitionTrack = `songs/transitions/${fase}_${tipo}.mp3`;
  isTransition = true;
  transitionTargetPhase = fase;
  audio.src = transitionTrack;
  showTrackName(fase, transitionTrack);
  audio.play().catch(() => {});

  // Título/subtítulo dependen del idioma, pero la imagen se mantiene por fase
  const dict = phaseDict();
  if (dict[fase]) {
    title.textContent = dict[fase].title;
    subtitle.textContent = dict[fase].sub;
  }
  setPhaseClass(fase);

  const opt = select.options[select.selectedIndex];
  phaseImage.src = opt.dataset.img;
  randomBanner();
  updateLiveTime();
}

// Cambio automático según hora
function setPhaseByTime() {
  if (manualOverride) return;

  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const time = hour + minutes / 60;
  let phase;

  if (time >= 7 && time < 10) phase = "amanecer";
  else if (time >= 10 && time < 16) phase = "mediodia";
  else if (time >= 16 && time < 21) phase = "atardecer";
  else phase = "noche";

  const currentPhase = getCurrentPhase();
  if (phase !== currentPhase) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].dataset.class === phase) {
        select.selectedIndex = i;
        break;
      }
    }
    playTransitionThenSong(phase, "long");
  }
}

// Navegación manual
function nextPhase() {
  let idx = select.selectedIndex;
  idx = (idx + 1) % select.options.length;
  select.selectedIndex = idx;
  const fase = select.options[idx].dataset.class;

  activateManualOverride(300000);

  playTransitionThenSong(fase, "short");
}

function prevPhase() {
  let idx = select.selectedIndex;
  idx = (idx - 1 + select.options.length) % select.options.length;
  select.selectedIndex = idx;
  const fase = select.options[idx].dataset.class;

  activateManualOverride(300000);

  playTransitionThenSong(fase, "short");
}

/* Apertura/cierre panel lateral */
document.getElementById("menuToggle").addEventListener("click", () => {
  const app = document.getElementById("app");
  const btn = document.getElementById("menuToggle");
  const willOpen = !app.classList.contains("menu-open");
  app.classList.toggle("menu-open");
  btn.setAttribute("aria-expanded", String(willOpen));
});

// Actualiza hora local + modo (auto / manual)
function phaseLabelFromClass(cls) {
  const dict = (i18n[currentLang] || i18n.es).phases || i18n.es.phases;
  return (dict[cls] && dict[cls].label) ? dict[cls].label : (cls || "");
}

function currentPhaseWindow(cls) {
  // Ventanas usadas en setPhaseByTime()
  return (
    {
      amanecer: "07:00–10:00",
      mediodia: "10:00–16:00",
      atardecer: "16:00–21:00",
      noche: "21:00–07:00",
    }[cls] || ""
  );
}

function format2(n) {
  return String(n).padStart(2, "0");
}


const hudContentEl = document.getElementById("hudContent");
let hudCollapsed = false; // abierto por defecto
// El estado se guarda tras interacción del usuario.
const _hudSaved = localStorage.getItem("circadia_hud_collapsed");
if (_hudSaved === "1") hudCollapsed = true;

function applyHudCollapsedState() {
  if (!liveTimeEl) return;
  liveTimeEl.classList.toggle("collapsed", !!hudCollapsed);

  // Asa única a la derecha: cambia de glifo según estado.
  // Abierto  -> «  (indica que se puede cerrar hacia la izquierda)
  // Cerrado  -> »  (indica que se puede abrir hacia la derecha)
  const handle = liveTimeEl.querySelector(".hud-handle");
  if (handle) handle.textContent = hudCollapsed ? "»" : "«";
}

function toggleHud() {
  hudCollapsed = !hudCollapsed;
  localStorage.setItem("circadia_hud_collapsed", hudCollapsed ? "1" : "0");
  applyHudCollapsedState();
}

function showHudToast(text) {
  if (!hudContentEl) return;
  const toast = document.createElement("div");
  toast.className = "meta-line meta-toast";
  toast.textContent = text;
  hudContentEl.appendChild(toast);
  setTimeout(() => toast.remove(), 2100);
}

if (liveTimeEl) {
  liveTimeEl.addEventListener("click", () => {
    // En móvil el HUD es estático: no colapsa
    if (window.matchMedia("(max-width: 900px)").matches) return;
    toggleHud();
  });
  liveTimeEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (window.matchMedia("(max-width: 900px)").matches) return;
      toggleHud();
    }
  });
}

function updateLiveTime() {
  if (!hudContentEl) return;

  const now = new Date();
  const hh = format2(now.getHours());
  const mm = format2(now.getMinutes());

  const phase = getCurrentPhase();
  const win = currentPhaseWindow(phase);

  const phaseIcon =
    {
      amanecer: "🌅",
      mediodia: "☀️",
      atardecer: "🌇",
      noche: "🌙",
    }[phase] || "⏳";

  let modeLine = `🤖 ${t("labels.auto")}`;
  if (manualOverride) {
    const remaining = Math.max(0, overrideEndsAt - Date.now());
    const totalSec = Math.ceil(remaining / 1000);
    const m = format2(Math.floor(totalSec / 60));
    const s = format2(totalSec % 60);
    modeLine = `👤 ${t("labels.manual")} (${m}:${s})`;
  }

  hudContentEl.innerHTML = [
    `<span class="meta-line">🕙 ${hh}:${mm}</span>`,
    `<span class="meta-line">${phaseIcon} ${win}</span>`,
    `<span class="meta-line">${modeLine}</span>`,
  ].join("");

  applyHudCollapsedState();
}


/* Contenido interno para el panel */

const i18n = {
  es: {
    banner: { default: "La tecnología no es neutra. Es parte de la experiencia biológica." },
    menu: { intensity: "Intensidad", style: "Estilo musical", language: "Idioma", ui: "Interfaz", about: "Acerca de" },
    ui: { toggleInterface: "Cambiar interfaz", highContrast: "Alto contraste" },
    labels: { auto: "Automático", manual: "Manual", reenabled: "Automático reactivado", transition: "Transición de fase" },
    phases: {
      amanecer: { label: "Amanecer", title: "Aurora suave", sub: "Despertar gradual" },
      mediodia: { label: "Mediodía", title: "Foco intenso", sub: "Actividad crítica" },
      atardecer: { label: "Atardecer", title: "Transición suave", sub: "Recuperación serena" },
      noche: { label: "Noche", title: "Pausa profunda", sub: "Restauración metabólica" },
    },
    sections: {
      intensityTitle: "🎚️ Intensidad",
      intensityDesc: "Controla la energía de la atmósfera sonora:",
      intensity: { low: "🔈 Baja", medium: "🔉 Media", high: "🔊 Alta", max: "📢 Máxima" },
      styleTitle: "🎵 Estilo musical",
      styleDesc: "Selecciona un estilo musical generado por IA:",
      style: { ambiental:"🌌 Ambiental", acustico:"🎸 Acústico", electronica:"🎧 Electrónica", piano:"🎹 Piano", drone:"🧘 Drone" },
      languageTitle: "🌐 Idioma",
      languageDesc: "Selecciona el idioma de la interfaz:",
      uiTitle: "🎨 Interfaz",
      uiDesc: "Configura la interfaz visual:",
      aboutTitle: "ℹ️ Acerca de",
      aboutIntro: "<p><strong>Circad·IA</strong> es un prototipo sonoro adaptativo que explora la relación entre ritmos biológicos y música generada por IA.</p>",
      aboutEthicsTitle: "<h4>⚖️ Ética y valores</h4>",
      aboutEthicsList: [
        "Respeto a la diversidad cultural y lingüística.",
        "Transparencia en el uso de la IA y sus límites.",
        "Sostenibilidad digital y eficiencia energética.",
        "Colaboración humano‑máquina como proceso creativo.",
        "Protección de la privacidad y datos personales."
      ]
    }
  },
  en: {
    banner: { default: "Technology is not neutral. It is part of your biological experience." },
    menu: { intensity: "Intensity", style: "Music style", language: "Language", ui: "Interface", about: "About" },
    ui: { toggleInterface: "Switch interface", highContrast: "High contrast" },
    labels: { auto: "Automatic", manual: "Manual", reenabled: "Automatic restored", transition: "Phase transition" },
    phases: {
      amanecer: { label: "Sunrise", title: "Soft dawn", sub: "Gradual awakening" },
      mediodia: { label: "Midday", title: "Intense focus", sub: "Peak activity" },
      atardecer: { label: "Sunset", title: "Gentle transition", sub: "Serene recovery" },
      noche: { label: "Night", title: "Deep pause", sub: "Metabolic restoration" },
    },
    sections: {
      intensityTitle: "🎚️ Intensity",
      intensityDesc: "Control the energy of the sound atmosphere:",
      intensity: { low: "🔈 Low", medium: "🔉 Medium", high: "🔊 High", max: "📢 Max" },
      styleTitle: "🎵 Music style",
      styleDesc: "Select an AI-generated music style:",
      style: { ambiental:"🌌 Ambient", acustico:"🎸 Acoustic", electronica:"🎧 Electronic", piano:"🎹 Piano", drone:"🧘 Drone" },
      languageTitle: "🌐 Language",
      languageDesc: "Select the interface language:",
      uiTitle: "🎨 Interface",
      uiDesc: "Configure the visual interface:",
      aboutTitle: "ℹ️ About",
      aboutIntro: "<p><strong>Circad·IA</strong> is an adaptive sound prototype exploring the relationship between biological rhythms and AI-generated music.</p>",
      aboutEthicsTitle: "<h4>⚖️ Ethics & values</h4>",
      aboutEthicsList: [
        "Respect for cultural and linguistic diversity.",
        "Transparency about AI use and its limits.",
        "Digital sustainability and energy efficiency.",
        "Human‑machine collaboration as a creative process.",
        "Privacy and personal-data protection."
      ]
    }
  },
  fr: {
    banner: { default: "La technologie n’est pas neutre. Elle fait partie de l’expérience biologique." },
    menu: { intensity: "Intensité", style: "Style musical", language: "Langue", ui: "Interface", about: "À propos" },
    ui: { toggleInterface: "Changer l’interface", highContrast: "Contraste élevé" },
    labels: { auto: "Automatique", manual: "Manuel", reenabled: "Automatique réactivé", transition: "Transition de phase" },
    phases: {
      amanecer: { label: "Aube", title: "Aurore douce", sub: "Réveil progressif" },
      mediodia: { label: "Midi", title: "Concentration intense", sub: "Activité de pointe" },
      atardecer: { label: "Crépuscule", title: "Transition douce", sub: "Récupération sereine" },
      noche: { label: "Nuit", title: "Pause profonde", sub: "Restauration métabolique" },
    },
    sections: {
      intensityTitle: "🎚️ Intensité",
      intensityDesc: "Contrôle l’énergie de l’atmosphère sonore :",
      intensity: { low: "🔈 Faible", medium: "🔉 Moyenne", high: "🔊 Élevée", max: "📢 Max" },
      styleTitle: "🎵 Style musical",
      styleDesc: "Sélectionne un style généré par IA :",
      style: { ambiental:"🌌 Ambient", acustico:"🎸 Acoustique", electronica:"🎧 Électronique", piano:"🎹 Piano", drone:"🧘 Drone" },
      languageTitle: "🌐 Langue",
      languageDesc: "Choisis la langue de l’interface :",
      uiTitle: "🎨 Interface",
      uiDesc: "Configure l’interface visuelle :",
      aboutTitle: "ℹ️ À propos",
      aboutIntro: "<p><strong>Circad·IA</strong> est un prototype sonore adaptatif qui explore le lien entre rythmes biologiques et musique générée par IA.</p>",
      aboutEthicsTitle: "<h4>⚖️ Éthique et valeurs</h4>",
      aboutEthicsList: [
        "Respect de la diversité culturelle et linguistique.",
        "Transparence sur l’usage de l’IA et ses limites.",
        "Soutenabilité numérique et efficacité énergétique.",
        "Collaboration humain‑machine comme processus créatif.",
        "Protection de la vie privée et des données personnelles."
      ]
    }
  }
};

const PHASE_EMOJI = { amanecer: "🌅", mediodia: "☀️", atardecer: "🌇", noche: "🌙" };

function phaseDict(){
  return ((i18n[currentLang] || i18n.es).phases || i18n.es.phases);
}

function applyPhaseTexts(){
  const dict = phaseDict();
  // El select de fase en este proyecto se referencia como `select`
  if (select) {
    Array.from(select.options).forEach((opt) => {
      const p = dict[opt.value];
      if (!p) return;
      opt.textContent = `${PHASE_EMOJI[opt.value] || ""} ${p.label}`.trim();
    });
  }
  const p = dict[currentPhase];
  if (p && title && subtitle) {
    title.textContent = p.title;
    subtitle.textContent = p.sub;
  }
}

// Idioma inicial: por requisitos de entrega, el proyecto debe iniciar siempre en español.
// (Se permite cambiarlo desde el menú, pero el arranque no hereda selecciones previas.)
let currentLang = "es";
// El usuario puede cambiarlo desde el menú; entonces se guarda en localStorage.

function t(key) {
  const dict = i18n[currentLang] || i18n.es;
  return (key.split(".").reduce((o,k)=> (o||{})[k], dict)) || key;
}

function setLanguage(lang) {
  currentLang = (lang === "en" || lang === "fr") ? lang : "es";
  localStorage.setItem("circadia_lang", currentLang);
  applyLanguage();
  applyPhaseTexts();
  randomBanner(true);
  updateLiveTime();
}

function applyLanguage() {
  // Textos estáticos del menú (index.html)
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Si el panel está abierto, reconstruye la sección actual para reflejar idioma
  if (currentSection) {
    document.getElementById("panelContent").innerHTML = buildSection(currentSection);
  }
}


let currentSection = null;

function buildSection(section) {
  const s = (i18n[currentLang] || i18n.es).sections;

  if (section === "intensidad") {
    return `<h3>${s.intensityTitle}</h3>
      <p>${s.intensityDesc}</p>
      <ul>
        <li><button class="intensity-btn" data-intensity="low">${s.intensity.low}</button></li>
        <li><button class="intensity-btn" data-intensity="medium">${s.intensity.medium}</button></li>
        <li><button class="intensity-btn" data-intensity="high">${s.intensity.high}</button></li>
        <li><button class="intensity-btn" data-intensity="max">${s.intensity.max}</button></li>
      </ul>`;
  }

  if (section === "estilo") {
    return `<h3>${s.styleTitle}</h3>
      <p>${s.styleDesc}</p>
      <ul>
        <li><button class="style-btn" data-style="ambiental">${s.style.ambiental}</button></li>
        <li><button class="style-btn" data-style="acustico">${s.style.acustico}</button></li>
        <li><button class="style-btn" data-style="electronica">${s.style.electronica}</button></li>
        <li><button class="style-btn" data-style="piano">${s.style.piano}</button></li>
        <li><button class="style-btn" data-style="drone">${s.style.drone}</button></li>
      </ul>`;
  }

  if (section === "idioma") {
    return `<h3>${s.languageTitle}</h3>
      <p>${s.languageDesc}</p>
      <ul>
        <li><button class="lang-btn" data-lang="es">🇪🇸 Español</button></li>
        <li><button class="lang-btn" data-lang="en">🇬🇧 English</button></li>
        <li><button class="lang-btn" data-lang="fr">🇫🇷 Français</button></li>
      </ul>`;
  }

  if (section === "interfaz") {
    return `<h3>${s.uiTitle}</h3>
      <p>${s.uiDesc}</p>
      <ul>
        <li><button id="toggleInterfaceBtn">🎨 ${t("ui.toggleInterface")}</button></li>
        <li><button id="toggleHighContrastBtn">🌓 ${t("ui.highContrast")}</button></li>
      </ul>`;
  }

  if (section === "acerca_de") {
    const ethicsItems = s.aboutEthicsList.map((x) => `<li>${x}</li>`).join("");
    return `<h3>${s.aboutTitle}</h3>
      ${s.aboutIntro}
      ${s.aboutEthicsTitle}
      <ul class="acerca-valores">${ethicsItems}</ul>`;
  }

  return `<h3>Contenido</h3><p>No se encontró la sección solicitada.</p>`;
}


function loadSection(section) {
  currentSection = section;
  const content = buildSection(section);
  document.getElementById("panelContent").innerHTML = content;
  document.getElementById("app").classList.add("menu-open");
}


function nextSong() {
  const fase = getCurrentPhase();
  const chosenTrack = randomTrack(fase);
  audio.src = chosenTrack;
  showTrackName(fase, chosenTrack);
  audio.play().catch(() => {});
}

document.getElementById("nextSongBtn").addEventListener("click", nextSong);

// Escucha el botón "Cambiar interfaz" cuando se cargue la sección Interfaz
// Escucha los botones de la sección Interfaz
document.addEventListener("click", (e) => {
  // Cambiar interfaz (modo alternativo de la card)
  if (e.target && e.target.id === "toggleInterfaceBtn") {
    const card = document.querySelector(".card");
    if (card) {
      card.classList.toggle("alt");
    }
  }

  // Alto contraste (afecta todo el body y el menú)
  if (e.target && e.target.id === "toggleHighContrastBtn") {
    document.body.classList.toggle("high-contrast");
  }

  // Idioma
  if (e.target && e.target.classList && e.target.classList.contains("lang-btn")) {
    const lang = e.target.getAttribute("data-lang");
    setLanguage(lang);
  }
});

// Botón de paleta inferior derecha
const paletteBtn = document.getElementById("paletteBtn");
if (paletteBtn) {
  paletteBtn.addEventListener("click", () => {
    const card = document.querySelector(".card");
    if (card) {
      card.classList.toggle("alt");
    } else {
      document.body.classList.toggle("alt-interface");
    }
  });
}

// Motor único: al terminar pista, decide qué reproducir
audio.addEventListener("ended", () => {
  // Si acaba una transición, arrancamos una pista de la fase objetivo
  if (isTransition && transitionTargetPhase) {
    const fase = transitionTargetPhase;
    isTransition = false;
    transitionTargetPhase = null;
    const chosenTrack = randomTrack(fase);
    audio.src = chosenTrack;
    showTrackName(fase, chosenTrack);
    audio.play().catch(() => {});
    return;
  }

  // Si acaba una pista normal, continuamos con otra de la fase actual
  const fase = getCurrentPhase();
  const chosenTrack = randomTrack(fase);
  audio.src = chosenTrack;
  showTrackName(fase, chosenTrack);
  audio.play().catch(() => {});
});

// Manejo de errores de carga (por si falta un asset o hay fallo puntual)
audio.addEventListener("error", () => {
  const fase = getCurrentPhase();
  trackNameEl.textContent = "⚠️ Error cargando audio — reintentando…";
  // Evita bucles agresivos: reintento suave
  setTimeout(() => {
    const chosenTrack = randomTrack(fase);
    audio.src = chosenTrack;
    showTrackName(fase, chosenTrack);
    audio.play().catch(() => {});
  }, 600);
});

// EVENTOS
select.addEventListener("change", () => {
  const fase = select.options[select.selectedIndex].dataset.class;
  activateManualOverride(300000);
  playTransitionThenSong(fase, "short");
});

nextBtn.addEventListener("click", nextPhase);
prevBtn.addEventListener("click", prevPhase);

// INICIALIZACIÓN
setPhaseByTime();
playTransitionThenSong(getCurrentPhase(), "short");
setInterval(setPhaseByTime, 60000);
setInterval(updateLiveTime, 1000);
updateLiveTime();




// Idioma inicial
applyLanguage();
applyPhaseTexts();
randomBanner(true);
