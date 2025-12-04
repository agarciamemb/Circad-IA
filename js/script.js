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

// Mensajes de banner
const banners = [
  "La tecnología no es neutra. Es ritmo que se acopla a tu biología.",
  "La tecnología no es causa. Es mediación en tu experiencia vital.",
  "La tecnología no es pasiva. Se integra como parte de tu ciclo biológico.",
  "La tecnología no es externa. Es resonancia de tu propio organismo.",
  "La tecnología no es aislada. Se convierte en acompañante de tu metabolismo.",
  "La tecnología no es inocente. Es arquitectura de tu percepción biológica.",
  "La tecnología no es ajena. Es interfaz de tu propio ritmo vital.",
  "La tecnología no es neutral. Es coreografía de tu experiencia corporal.",
];

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

let manualOverride = false;
let overrideTimer = null;

// Banner aleatorio
function randomBanner() {
  const idx = Math.floor(Math.random() * banners.length);
  banner.textContent = banners[idx];
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
    trackNameEl.textContent = "🔀 Transición de fase";
    return;
  }
  const alias = trackNames[fase][file] || file;
  trackNameEl.textContent = "🎧 " + alias;
}

// Reproduce transición y luego canción
function playTransitionThenSong(fase, tipo = "short") {
  const transitionTrack = `songs/transitions/${fase}_${tipo}.mp3`;
  audio.src = transitionTrack;
  showTrackName(fase, transitionTrack);
  audio.play().catch(() => {});

  audio.onended = () => {
    const chosenTrack = randomTrack(fase);
    audio.src = chosenTrack;
    showTrackName(fase, chosenTrack);
    audio.play().catch(() => {});
  };

  const opt = select.options[select.selectedIndex];
  title.textContent = opt.dataset.title;
  subtitle.textContent = opt.dataset.sub;
  body.className = fase;
  phaseImage.src = opt.dataset.img;
  randomBanner();
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

  const currentPhase = body.className;
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

  manualOverride = true;
  clearTimeout(overrideTimer);
  overrideTimer = setTimeout(() => (manualOverride = false), 300000);

  playTransitionThenSong(fase, "short");
}

function prevPhase() {
  let idx = select.selectedIndex;
  idx = (idx - 1 + select.options.length) % select.options.length;
  select.selectedIndex = idx;
  const fase = select.options[idx].dataset.class;

  manualOverride = true;
  clearTimeout(overrideTimer);
  overrideTimer = setTimeout(() => (manualOverride = false), 300000);

  playTransitionThenSong(fase, "short");
}

/* Apertura/cierre panel lateral */
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("app").classList.toggle("menu-open");
});

/* Contenido interno para el panel */
const sectionsContent = {
  intensidad: `<h3>🎚️ Intensidad</h3>
    <p>Controla la energía de la atmósfera sonora:</p>
    <ul>
      <li><button class="intensity-btn" data-intensity="low">🔈 Baja</button></li>
      <li><button class="intensity-btn" data-intensity="medium">🔉 Media</button></li>
      <li><button class="intensity-btn" data-intensity="high">🔊 Alta</button></li>
      <li><button class="intensity-btn" data-intensity="max">📢 Máxima</button></li>
    </ul>`,

  estilo: `<h3>🎵 Estilo musical</h3>
    <p>Selecciona un estilo musical generado por IA:</p>
    <ul>
      <li><button class="style-btn" data-style="ambiental">🌌 Ambiental</button></li>
      <li><button class="style-btn" data-style="acustico">🎸 Acústico</button></li>
      <li><button class="style-btn" data-style="electronica">🎧 Electrónica</button></li>
      <li><button class="style-btn" data-style="experimental">🧪 Experimental</button></li>
    </ul>`,

  idioma: `<h3>🌐 Idioma</h3>
    <p>Selecciona el idioma de la interfaz:</p>
    <ul>
      <li><button class="lang-btn" data-lang="es">🇪🇸 Español</button></li>
      <li><button class="lang-btn" data-lang="en">🇬🇧 Inglés</button></li>
      <li><button class="lang-btn" data-lang="fr">🇫🇷 Francés</button></li>
    </ul>`,

  interfaz: `<h3>🎨 Interfaz</h3>
  <p>Configura la interfaz visual:</p>
  <ul>
    <li><button id="toggleInterfaceBtn">🎨 Cambiar interfaz</button></li>
    <li><button id="toggleHighContrastBtn">🌓 Alto contraste</button></li>
  </ul>`,

  acerca_de: `<h3>ℹ️ Acerca de</h3>
  <p><strong>Circad·IA</strong> es un prototipo sonoro adaptativo que explora la relación entre ritmos biológicos y música generada por IA.</p>
  <h4>📖 Capítulos de la memoria</h4>
  <ul>
    <li><strong>Introducción:</strong> Contexto del proyecto y objetivos.</li>
    <li><strong>Marco teórico:</strong> Ritmos circadianos, música generativa y tecnologías adaptativas.</li>
    <li><strong>Metodología:</strong> Diseño de la interfaz, selección de fases y lógica sonora.</li>
    <li><strong>Resultados:</strong> Experiencias de usuario y validación del prototipo.</li>
    <li><strong>Discusión:</strong> Limitaciones, aprendizajes y proyección futura.</li>
  </ul>
  <h4>⚖️ Ética y valores</h4>
  <ul>
    <li>Respeto a la diversidad cultural y lingüística.</li>
    <li>Transparencia en el uso de la IA y sus límites.</li>
    <li>Sostenibilidad digital y eficiencia energética.</li>
    <li>Colaboración humano‑máquina como proceso creativo.</li>
    <li>Protección de la privacidad y datos personales.</li>
  </ul>
  <h4>🌍 Impacto</h4>
  <p>El proyecto busca fomentar una relación consciente con la tecnología, entendida como mediación y acompañante de los ritmos vitales, no como imposición externa.</p>`,
};

function loadSection(section) {
  const content =
    sectionsContent[section] ||
    `<h3>Contenido</h3><p>No se encontró la sección solicitada.</p>`;
  document.getElementById("panelContent").innerHTML = content;
  document.getElementById("app").classList.add("menu-open");
}

function nextSong() {
  const fase = document.body.className || "noche";
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

// Repetición automática de canciones de fase
audio.addEventListener("ended", () => {
  const fase = body.className;
  const chosenTrack = randomTrack(fase);
  audio.src = chosenTrack;
  showTrackName(fase, chosenTrack);
  audio.play().catch(() => {});
});

// EVENTOS
select.addEventListener("change", () => {
  const fase = select.options[select.selectedIndex].dataset.class;
  manualOverride = true;
  clearTimeout(overrideTimer);
  overrideTimer = setTimeout(() => (manualOverride = false), 300000);
  playTransitionThenSong(fase, "short");
});

nextBtn.addEventListener("click", nextPhase);
prevBtn.addEventListener("click", prevPhase);

// INICIALIZACIÓN
setPhaseByTime();
playTransitionThenSong(body.className || "noche", "short");
setInterval(setPhaseByTime, 60000);
