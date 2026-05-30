// Bannière PWA — s'affiche en haut à chaque ouverture
(function(){
  if(window.pwaShown)return;
  window.pwaShown=true;

  // Créer la bannière immédiatement
  function createBanner(){
    // Supprimer si déjà là
    const old=document.getElementById("pwa-top-banner");
    if(old)old.remove();

    const b=document.createElement("div");
    b.id="pwa-top-banner";
    b.innerHTML=`
      <div id="pwa-inner">
        <img src="https://i.ibb.co/d4y9ggqh/IMG-20260525-WA0001-1.jpg" id="pwa-img"/>
        <div id="pwa-text">
          <div id="pwa-title">📲 Velero Energy</div>
          <div id="pwa-sub">Installez l'app pour un accès rapide !</div>
        </div>
        <button id="pwa-close" onclick="hidePWABanner()">✕</button>
      </div>
    `;
    document.body.insertBefore(b,document.body.firstChild);

    // Auto-cacher après 5 secondes
    setTimeout(hidePWABanner, 5000);
  }

  window.hidePWABanner=function(){
    const b=document.getElementById("pwa-top-banner");
    if(b){
      b.style.animation="slideDown .4s ease forwards";
      setTimeout(()=>b.remove(),400);
    }
  };

  // Styles
  const style=document.createElement("style");
  style.textContent=`
    #pwa-top-banner{
      position:fixed;
      top:0;left:0;right:0;
      z-index:99999;
      animation:slideDown2 .4s ease;
    }
    @keyframes slideDown2{
      from{transform:translateY(-100%);opacity:0}
      to{transform:translateY(0);opacity:1}
    }
    @keyframes slideDown{
      from{transform:translateY(0);opacity:1}
      to{transform:translateY(-100%);opacity:0}
    }
    #pwa-inner{
      background:linear-gradient(135deg,#00bcd4,#0097a7);
      display:flex;
      align-items:center;
      gap:10px;
      padding:10px 14px;
      padding-top:calc(10px + env(safe-area-inset-top));
    }
    #pwa-img{
      width:38px;height:38px;
      border-radius:10px;
      object-fit:cover;
      flex-shrink:0;
      border:2px solid rgba(255,255,255,.5);
    }
    #pwa-text{flex:1;}
    #pwa-title{
      font-size:13px;font-weight:700;
      color:#fff;
      font-family:'DM Sans',sans-serif;
    }
    #pwa-sub{
      font-size:11px;
      color:rgba(255,255,255,.85);
      font-family:'DM Sans',sans-serif;
      margin-top:1px;
    }
    #pwa-close{
      background:rgba(255,255,255,.25);
      border:none;color:#fff;
      font-size:14px;font-weight:700;
      width:28px;height:28px;
      border-radius:50%;cursor:pointer;
      flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
    }
    #pwa-install-btn{
      padding:7px 12px;
      background:#fff;color:#00bcd4;
      border:none;border-radius:8px;
      font-size:11px;font-weight:800;
      cursor:pointer;white-space:nowrap;
      font-family:'DM Sans',sans-serif;
      flex-shrink:0;
      margin-right:6px;
    }
  `;
  document.head.appendChild(style);

  // Attendre que le DOM soit prêt
  if(document.body){
    createBanner();
  }else{
    document.addEventListener("DOMContentLoaded",createBanner);
  }

  // Service Worker
  if("serviceWorker"in navigator){
    navigator.serviceWorker.register("/sw.js").catch(()=>{});
  }

  // Bouton installer pour Android
  let deferredPrompt=null;
  window.addEventListener("beforeinstallprompt",function(e){
    e.preventDefault();
    deferredPrompt=e;
    // Ajouter bouton installer dans la bannière
    const inner=document.getElementById("pwa-inner");
    if(inner&&!document.getElementById("pwa-install-btn")){
      const btn=document.createElement("button");
      btn.id="pwa-install-btn";
      btn.textContent="Installer";
      btn.onclick=async function(){
        if(!deferredPrompt)return;
        deferredPrompt.prompt();
        const r=await deferredPrompt.userChoice;
        deferredPrompt=null;
        hidePWABanner();
      };
      // Insérer avant le bouton fermer
      const closeBtn=document.getElementById("pwa-close");
      if(closeBtn)inner.insertBefore(btn,closeBtn);
    }
  });

})();
