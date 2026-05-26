const SB_URL="https://seegoklunovyuieorkvy.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZWdva2x1bm92eXVpZW9ya3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODI3MjYsImV4cCI6MjA5NTI1ODcyNn0.9p2OcUAY25E6XhG4Uq7XYTab_N2FWrg_dtemrUEroeo";

function getToken(){return localStorage.getItem("velero_token");}
function getHeaders(){
  return {"Content-Type":"application/json","apikey":SB_KEY,"Authorization":"Bearer "+getToken()};
}

async function getUser(){
  const r=await fetch(SB_URL+"/auth/v1/user",{headers:getHeaders()});
  return r.json();
}

async function getProfile(){
  const u=await getUser();
  if(!u.id)return null;
  const r=await fetch(SB_URL+"/rest/v1/profiles?id=eq."+u.id+"&select=*",{headers:getHeaders()});
  const d=await r.json();
  return d[0]||null;
}

async function rpc(fn,params){
  const r=await fetch(SB_URL+"/rest/v1/rpc/"+fn,{
    method:"POST",headers:getHeaders(),
    body:JSON.stringify(params)
  });
  return r.json();
}

async function select(table,query=""){
  const r=await fetch(SB_URL+"/rest/v1/"+table+query,{headers:getHeaders()});
  return r.json();
}

async function insert(table,data){
  const r=await fetch(SB_URL+"/rest/v1/"+table,{
    method:"POST",
    headers:{...getHeaders(),"Prefer":"return=representation"},
    body:JSON.stringify(data)
  });
  return r.json();
}

async function update(table,query,data){
  const r=await fetch(SB_URL+"/rest/v1/"+table+query,{
    method:"PATCH",
    headers:{...getHeaders(),"Prefer":"return=representation"},
    body:JSON.stringify(data)
  });
  return r.json();
}

function checkAuth(){
  if(!getToken()){window.location.href="index.html";return false;}
  return true;
}

window.VE={SB_URL,SB_KEY,getToken,getHeaders,getUser,getProfile,rpc,select,insert,update,checkAuth};
