// PWA Install Banner
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  // Ne pas montrer si déjà installé ou refusé récemment
  if (localStorage.getItem("pwa_installed") === "1") return;
  if (localStorage.getItem("pwa_dismissed")) {
    const dismissedAt = parseInt(localStorage.getItem("pwa_dismissed"));
    if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return; // 3 jours
  }

  // Créer la bannière
  const banner = document.createElement("div");
  banner.id = "pwa-banner";
  banner.innerHTML = `
    <style>
      #pwa-banner {
        position: fixed;
        bottom: 70px;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 28px);
        max-width: 452px;
        background: #fff;
        border-radius: 18px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,.18);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideUp .4s ease;
        border: 1.5px solid #e0f7fa;
      }
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to   { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      #pwa-banner .pwa-icon {
        width: 52px; height: 52px;
        border-radius: 14px;
        object-fit: cover;
        flex-shrink: 0;
      }
      #pwa-banner .pwa-info { flex: 1; }
      #pwa-banner .pwa-title {
        font-size: 14px; font-weight: 700;
        color: #0f2a3a; margin-bottom: 2px;
        font-family: 'DM Sans', sans-serif;
      }
      #pwa-banner .pwa-sub {
        font-size: 11px; color: #888;
        font-family: 'DM Sans', sans-serif;
      }
      #pwa-banner .pwa-btns {
        display: flex; gap: 8px;
        flex-shrink: 0;
      }
      #pwa-banner .btn-install {
        padding: 9px 16px;
        background: linear-gradient(135deg, #00bcd4, #0097a7);
        color: #fff; border: none;
        border-radius: 10px;
        font-size: 12px; font-weight: 700;
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
      }
      #pwa-banner .btn-close {
        padding: 9px;
        background: #f5f5f5; border: none;
        border-radius: 10px;
        font-size: 14px; cursor: pointer;
        color: #888;
      }
    </style>
    <img class="pwa-icon" src="https://i.ibb.co/d4y9ggqh/IMG-20260525-WA0001-1.jpg" alt="Velero"/>
    <div class="pwa-info">
      <div class="pwa-title">📲 Installer Velero Energy</div>
      <div class="pwa-sub">Accès rapide depuis votre écran d'accueil</div>
    </div>
    <div class="pwa-btns">
      <button class="btn-install" onclick="installPWA()">Installer</button>
      <button class="btn-close" onclick="dismissBanner()">✕</button>
    </div>
  `;
  document.body.appendChild(banner);
}

async function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  if (result.outcome === "accepted") {
    localStorage.setItem("pwa_installed", "1");
  }
  deferredPrompt = null;
  const b = document.getElementById("pwa-banner");
  if (b) b.remove();
}

function dismissBanner() {
  localStorage.setItem("pwa_dismissed", Date.now().toString());
  const b = document.getElementById("pwa-banner");
  if (b) b.remove();
}

// Détecter si déjà installé
window.addEventListener("appinstalled", () => {
  localStorage.setItem("pwa_installed", "1");
  const b = document.getElementById("pwa-banner");
  if (b) b.remove();
});

// iOS — afficher instructions manuelles
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

if (isIOS() && !isInStandaloneMode()) {
  setTimeout(() => {
    if (localStorage.getItem("pwa_installed") === "1") return;
    if (localStorage.getItem("pwa_dismissed")) return;

    const banner = document.createElement("div");
    banner.id = "pwa-banner";
    banner.innerHTML = `
      <style>
        #pwa-banner {
          position: fixed; bottom: 70px;
          left: 50%; transform: translateX(-50%);
          width: calc(100% - 28px); max-width: 452px;
          background: #fff; border-radius: 18px;
          padding: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.18);
          z-index: 9999; border: 1.5px solid #e0f7fa;
          font-family: 'DM Sans', sans-serif;
        }
        #pwa-banner .ios-title { font-size: 14px; font-weight: 700; color: #0f2a3a; margin-bottom: 8px; }
        #pwa-banner .ios-steps { font-size: 12px; color: #555; line-height: 2; }
        #pwa-banner .ios-close {
          float: right; background: #f5f5f5; border: none;
          border-radius: 8px; padding: 6px 12px;
          font-size: 12px; cursor: pointer; color: #888;
        }
      </style>
      <button class="ios-close" onclick="dismissBanner()">✕ Fermer</button>
      <div class="ios-title">📲 Installer Velero Energy sur iOS</div>
      <div class="ios-steps">
        1️⃣ Appuyez sur <strong>Partager</strong> (icône en bas)<br>
        2️⃣ Choisissez <strong>"Sur l'écran d'accueil"</strong><br>
        3️⃣ Appuyez sur <strong>Ajouter</strong>
      </div>
    `;
    document.body.appendChild(banner);
  }, 3000);
}
