const SB_URL="https://seegoklunovyuieorkvy.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZWdva2x1bm92eXVpZW9ya3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODI3MjYsImV4cCI6MjA5NTI1ODcyNn0.9p2OcUAY25E6XhG4Uq7XYTab_N2FWrg_dtemrUEroeo";

window.VE={
  SB_URL,SB_KEY,
  tok:()=>localStorage.getItem("velero_token"),
  uid:()=>localStorage.getItem("velero_uid"),
  H:()=>({"Content-Type":"application/json","apikey":SB_KEY,"Authorization":"Bearer "+localStorage.getItem("velero_token")}),

  checkAuth(){
    if(!this.tok()){location.href="index.html";return false;}
    return true;
  },

  async getUser(){
    try{
      const r=await fetch(SB_URL+"/auth/v1/user",{headers:this.H()});
      const d=await r.json();
      if(d.id)localStorage.setItem("velero_uid",d.id);
      return d;
    }catch(e){return null;}
  },

  async getProfile(){
    try{
      const uid=this.uid();
      if(!uid)return null;
      const r=await fetch(SB_URL+"/rest/v1/profiles?id=eq."+uid+"&select=*",{headers:this.H()});
      const d=await r.json();
      return Array.isArray(d)?d[0]:null;
    }catch(e){return null;}
  },

  async rpc(fn,params){
    try{
      const r=await fetch(SB_URL+"/rest/v1/rpc/"+fn,{
        method:"POST",headers:this.H(),body:JSON.stringify(params)
      });
      return await r.json();
    }catch(e){return {success:false,error:"Erreur réseau"};}
  },

  async select(table,q=""){
    try{
      const r=await fetch(SB_URL+"/rest/v1/"+table+q,{headers:this.H()});
      return await r.json();
    }catch(e){return [];}
  },

  async insert(table,data){
    try{
      const r=await fetch(SB_URL+"/rest/v1/"+table,{
        method:"POST",
        headers:{...this.H(),"Prefer":"return=representation"},
        body:JSON.stringify(data)
      });
      return await r.json();
    }catch(e){return null;}
  },

  async update(table,q,data){
    try{
      const r=await fetch(SB_URL+"/rest/v1/"+table+q,{
        method:"PATCH",
        headers:{...this.H(),"Prefer":"return=representation"},
        body:JSON.stringify(data)
      });
      return await r.json();
    }catch(e){return null;}
  },

  async logout(){
    try{await fetch(SB_URL+"/auth/v1/logout",{method:"POST",headers:this.H()});}catch(e){}
    localStorage.clear();
    location.href="index.html";
  }
};
