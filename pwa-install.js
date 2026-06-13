// PWA - Laisser le navigateur gérer l'installation nativement
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("/sw.js").catch(()=>{});
}

// Sur Android/Chrome : le navigateur affiche automatiquement
// le bouton "Ajouter à l'écran d'accueil" dans la barre d'adresse
// On ne fait rien de plus - c'est le comportement natif correct
