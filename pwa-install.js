(function(){
  // Enregistrer Service Worker
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("/sw.js").catch(()=>{});
  }

  // Si déjà installé en mode standalone → ne rien faire
  if(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone){
    return;
  }

  let deferredPrompt=null;

  // Capturer le prompt natif Android
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault();
    deferredPrompt=e;
    // Afficher notre bouton après 2 secondes
    setTimeout(showBanner, 2000);
  });

  window.addEventListener("appinstalled",function(){
    hideBanner();
    localStorage.setItem("pwa_installed","1");
  });

  function showBanner(){
    if(localStorage.getItem("pwa_installed")==="1") return;
    if(document.getElementById("ve-pwa-bar")) return;

    const bar=document.createElement("div");
    bar.id="ve-pwa-bar";
    bar.innerHTML=`
      <style>
        #ve-pwa-bar{
          position:fixed;top:0;left:0;right:0;z-index:99999;
          animation:pwaSlideIn .4s cubic-bezier(.175,.885,.32,1.275);
        }
        @keyframes pwaSlideIn{
          from{transform:translateY(-110%)}
          to{transform:translateY(0)}
        }
        @keyframes pwaSlideOut{
          from{transform:translateY(0)}
          to{transform:translateY(-110%)}
        }
        #ve-pwa-inner{
          background:linear-gradient(135deg,#0097a7,#00bcd4);
          display:flex;align-items:center;
          padding:10px 14px;
          padding-top:calc(10px + env(safe-area-inset-top));
          gap:10px;
          box-shadow:0 4px 20px rgba(0,0,0,.25);
        }
        #ve-pwa-logo{
          width:44px;height:44px;border-radius:12px;
          object-fit:cover;flex-shrink:0;
          border:2px solid rgba(255,255,255,.6);
        }
        #ve-pwa-txt{flex:1;}
        #ve-pwa-name{font-size:13px;font-weight:700;color:#fff;font-family:sans-serif;}
        #ve-pwa-desc{font-size:11px;color:rgba(255,255,255,.85);font-family:sans-serif;margin-top:1px;}
        #ve-pwa-btn{
          padding:9px 16px;
          background:#fff;
          color:#0097a7;
          border:none;border-radius:10px;
          font-size:13px;font-weight:800;
          cursor:pointer;white-space:nowrap;
          font-family:sans-serif;flex-shrink:0;
          box-shadow:0 2px 8px rgba(0,0,0,.15);
        }
        #ve-pwa-close{
          background:rgba(255,255,255,.2);
          border:none;color:#fff;
          width:26px;height:26px;border-radius:50%;
          cursor:pointer;font-size:13px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
        }
        #ve-pwa-progress{
          height:3px;
          background:linear-gradient(90deg,rgba(255,255,255,.8),rgba(255,255,255,.2));
          animation:pwaProgress 8s linear forwards;
        }
        @keyframes pwaProgress{
          from{width:100%}to{width:0%}
        }
      </style>
      <div id="ve-pwa-inner">
        <img id="ve-pwa-logo" src="https://i.ibb.co/d4y9ggqh/IMG-20260525-WA0001-1.jpg" alt="Velero"/>
        <div id="ve-pwa-txt">
          <div id="ve-pwa-name">📲 Velero Energy</div>
          <div id="ve-pwa-desc">Installer l'app sur votre téléphone</div>
        </div>
        <button id="ve-pwa-btn" onclick="window.installVeleroPWA()">⬇️ Installer</button>
        <button id="ve-pwa-close" onclick="window.hideVeleroPWA()">✕</button>
      </div>
      <div id="ve-pwa-progress"></div>
    `;
    document.body.appendChild(bar);

    // Auto-cacher après 8 secondes
    setTimeout(hideBanner, 8000);
  }

  function hideBanner(){
    const bar=document.getElementById("ve-pwa-bar");
    if(bar){
      bar.style.animation="pwaSlideOut .3s ease forwards";
      setTimeout(()=>bar&&bar.remove(), 300);
    }
  }

  window.hideVeleroPWA=hideBanner;

  window.installVeleroPWA=async function(){
    if(deferredPrompt){
      // Android Chrome → installation native directe
      hideBanner();
      deferredPrompt.prompt();
      const result=await deferredPrompt.userChoice;
      deferredPrompt=null;
      if(result.outcome==="accepted"){
        localStorage.setItem("pwa_installed","1");
      }
    } else {
      // iOS ou navigateur sans prompt → instructions
      hideBanner();
      showIOSGuide();
    }
  };

  function showIOSGuide(){
    const guide=document.createElement("div");
    guide.id="ve-ios-guide";
    guide.innerHTML=`
      <style>
        #ve-ios-guide{
          position:fixed;inset:0;background:rgba(0,0,0,.6);
          z-index:99999;display:flex;align-items:flex-end;justify-content:center;
          animation:fadeIn .3s ease;
        }
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        #ve-ios-box{
          background:#fff;border-radius:24px 24px 0 0;
          padding:24px 20px 36px;width:100%;max-width:480px;
          font-family:sans-serif;
        }
        #ve-ios-box h3{font-size:17px;font-weight:700;margin-bottom:16px;text-align:center;color:#0f2a3a;}
        .ios-step{display:flex;align-items:center;gap:14px;margin-bottom:16px;font-size:14px;color:#333;}
        .ios-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00bcd4,#0097a7);
          color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        #ve-ios-close{
          width:100%;padding:14px;
          background:linear-gradient(135deg,#00bcd4,#0097a7);
          color:#fff;border:none;border-radius:14px;
          font-size:15px;font-weight:700;cursor:pointer;
          margin-top:8px;font-family:sans-serif;
        }
      </style>
      <div id="ve-ios-box">
        <h3>📲 Installer Velero Energy</h3>
        <div class="ios-step">
          <div class="ios-num">1</div>
          <div>Appuyez sur le bouton <strong>Partager</strong> <span style="font-size:18px;">⬆️</span> en bas de Safari</div>
        </div>
        <div class="ios-step">
          <div class="ios-num">2</div>
          <div>Faites défiler et choisissez <strong>"Sur l'écran d'accueil"</strong> ➕</div>
        </div>
        <div class="ios-step">
          <div class="ios-num">3</div>
          <div>Appuyez sur <strong>"Ajouter"</strong> en haut à droite ✅</div>
        </div>
        <button id="ve-ios-close" onclick="document.getElementById('ve-ios-guide').remove()">✓ Compris !</button>
      </div>
    `;
    document.body.appendChild(guide);
    guide.addEventListener("click", function(e){
      if(e.target===guide) guide.remove();
    });
  }

  // iOS : montrer instructions après 3 secondes (pas de prompt natif)
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari=/safari/i.test(navigator.userAgent)&&!/chrome/i.test(navigator.userAgent);
  if(isIOS && isSafari && localStorage.getItem("pwa_installed")!=="1"){
    setTimeout(showBanner, 3000);
    // Override le bouton pour iOS
    const origShow=showBanner;
  }

})();
