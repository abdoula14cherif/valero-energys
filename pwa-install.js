// pwa-install.js — à inclure dans toutes les pages avec <script src="/pwa-install.js"></script>

// 1. Enregistrer le Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// 2. Capturer l'événement d'installation
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;

  // Afficher le bouton d'installation si présent sur la page
  const btn = document.getElementById("btnInstallPWA");
  if (btn) {
    btn.style.display = "flex";
  }
});

// 3. Fonction globale pour déclencher l'installation
window.installPWA = async function () {
  if (!deferredPrompt) {
    alert("Pour installer : appuyez sur le menu de votre navigateur, puis 'Ajouter à l'écran d'accueil'.");
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  const btn = document.getElementById("btnInstallPWA");
  if (btn) btn.style.display = "none";
};

// 4. Masquer le bouton si déjà installé
window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  const btn = document.getElementById("btnInstallPWA");
  if (btn) btn.style.display = "none";
});
