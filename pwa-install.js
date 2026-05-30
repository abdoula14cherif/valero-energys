(function(){
  if(window.pwaShown)return;
  window.pwaShown=true;

  const style=document.createElement("style");
  style.textContent=`
    #pwa-top-banner{
      position:fixed;top:0;left:0;right:0;z-index:99999;
      animation:pwaIn .4s ease;
    }
    @keyframes pwaIn{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes pwaOut{from{transform:translateY(0);opacity:1}to{transform:translateY(-100%);opacity:0}}
    #pwa-inner{
      background:linear-gradient(135deg,#00bcd4,#0097a7);
      display:flex;align-items:center;gap:8px;
      padding:12px 14px;
      padding-top:calc(12px + env(safe-area-inset-top));
      box-shadow:0 4px 20px rgba(0,0,0,.2);
    }
    #pwa-img{width:40px;height:40px;border-radius:10px;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.5);}
    #pwa-text{flex:1;}
    #pwa-title{font-size:13px;font-weight:700;color:#fff;font-family:sans-serif;}
    #pwa-sub{font-size:11px;color:rgba(255,255,255,.85);font-family:sans-serif;margin-top:1px;}
    #pwa-install-btn{
      padding:8px 14px;background:#fff;color:#00bcd4;
      border:none;border-radius:8px;font-size:12px;font-weight:800;
      cursor:pointer;white-space:nowrap;font-family:sans-serif;flex-shrink:0;
    }
    #pwa-close{
      background:rgba(255,255,255,.25);border:none;color:#fff;
      font-size:14px;font-weight:700;width:28px;height:28px;
      border-radius:50%;cursor:pointer;flex-shrink:0;
    }
    #pwa-progress{
      height:3px;background:rgba(255,255,255,.3);
      animation:progress 5s linear forwards;
    }
    @keyframes progress{from{width:100%}to{width:0%}}
  `;
  document.head.appendChild(style);

  let timer=null;
  let deferredPrompt=null;

  function createBanner(){
    const old=document.getElementById("pwa-top-banner");
    if(old)old.remove();

    const b=document.createElement("div");
    b.id="pwa-top-banner";
    b.innerHTML=`
      <div id="pwa-inner">
        <img id="pwa-img" src="https://i.ibb.co/d4y9ggqh/IMG-20260525-WA0001-1.jpg" alt="Velero"/>
        <div id="pwa-text">
          <div id="pwa-title">📲 Velero Energy</div>
          <div id="pwa-sub">Installez l'app sur votre écran d'accueil !</div>
        </div>
        <button id="pwa-install-btn" onclick="window.installPWA()">⬇️ Installer</button>
        <button id="pwa-close" onclick="window.hidePWABanner()">✕</button>
      </div>
      <div id="pwa-progress"></div>
    `;
    document.body.insertBefore(b,document.body.firstChild);

    // Auto-cacher après 5s
    timer=setTimeout(window.hidePWABanner,5000);

    // Si prompt dispo, activer le bouton
    if(deferredPrompt){
      document.getElementById("pwa-install-btn").style.display="block";
    }
  }

  window.hidePWABanner=function(){
    clearTimeout(timer);
    const b=document.getElementById("pwa-top-banner");
    if(b){
      b.style.animation="pwaOut .3s ease forwards";
      setTimeout(()=>{if(b.parentNode)b.remove();},300);
    }
  };

  window.installPWA=async function(){
    if(!deferredPrompt){
      // iOS — afficher instructions
      showIOSInstructions();
      return;
    }
    deferredPrompt.prompt();
    const r=await deferredPrompt.userChoice;
    deferredPrompt=null;
    window.hidePWABanner();
  };

  function showIOSInstructions(){
    window.hidePWABanner();
    const box=document.createElement("div");
    box.innerHTML=`
      <style>
        #ios-guide{
          position:fixed;bottom:80px;left:14px;right:14px;
          background:#fff;border-radius:18px;
          padding:18px;z-index:99999;
          box-shadow:0 8px 32px rgba(0,0,0,.2);
          animation:pwaIn .3s ease;
          font-family:sans-serif;
        }
        #ios-guide h3{font-size:15px;font-weight:700;margin-bottom:12px;color:#0f2a3a;}
        #ios-guide p{font-size:13px;color:#555;line-height:2.2;}
        #ios-guide button{
          width:100%;padding:12px;margin-top:14px;
          background:linear-gradient(135deg,#00bcd4,#0097a7);
          color:#fff;border:none;border-radius:11px;
          font-size:14px;font-weight:700;cursor:pointer;
        }
      </style>
      <div id="ios-guide">
        <h3>📲 Installer sur iOS</h3>
        <p>1️⃣ Appuyez sur le bouton <strong>Partager</strong> 🔗<br>
        2️⃣ Faites défiler et choisissez <strong>"Sur l'écran d'accueil"</strong> ➕<br>
        3️⃣ Appuyez sur <strong>"Ajouter"</strong> en haut à droite ✅</p>
        <button onclick="this.parentElement.parentElement.remove()">Compris !</button>
      </div>
    `;
    document.body.appendChild(box);
  }

  // Capturer le prompt Android AVANT que ça soit trop tard
  window.addEventListener("beforeinstallprompt",function(e){
    e.preventDefault();
    deferredPrompt=e;
    // Mettre à jour le bouton si bannière déjà visible
    const btn=document.getElementById("pwa-install-btn");
    if(btn){
      btn.style.background="#fff";
      btn.style.color="#00bcd4";
    }
  });

  window.addEventListener("appinstalled",function(){
    window.hidePWABanner();
  });

  // Lancer la bannière dès que possible
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",createBanner);
  }else{
    createBanner();
  }

  // Service worker
  if("serviceWorker"in navigator){
    navigator.serviceWorker.register("/sw.js").catch(()=>{});
  }
})();
