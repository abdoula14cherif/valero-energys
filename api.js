const SB_URL="https://seegoklunovyuieorkvy.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZWdva2x1bm92eXVpZW9ya3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODI3MjYsImV4cCI6MjA5NTI1ODcyNn0.9p2OcUAY25E6XhG4Uq7XYTab_N2FWrg_dtemrUEroeo";

window.VE={
  SB_URL,SB_KEY,

  tok(){return localStorage.getItem("velero_token");},
  uid(){return localStorage.getItem("velero_uid");},

  H(){
    return {
      "Content-Type":"application/json",
      "apikey":SB_KEY,
      "Authorization":"Bearer "+this.tok()
    };
  },

  // Rafraîchir le token si expiré
  async refreshToken(){
    const refresh=localStorage.getItem("velero_refresh");
    if(!refresh)return false;
    try{
      const r=await fetch(SB_URL+"/auth/v1/token?grant_type=refresh_token",{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SB_KEY},
        body:JSON.stringify({refresh_token:refresh})
      });
      const d=await r.json();
      if(d.access_token){
        localStorage.setItem("velero_token",d.access_token);
        if(d.refresh_token)localStorage.setItem("velero_refresh",d.refresh_token);
        if(d.user&&d.user.id)localStorage.setItem("velero_uid",d.user.id);
        return true;
      }
      return false;
    }catch(e){return false;}
  },

  checkAuth(){
    if(!this.tok()){
      location.href="index.html";
      return false;
    }
    return true;
  },

  // Appel API avec retry si token expiré
  async call(url,opts={}){
    let r=await fetch(url,{...opts,headers:{...this.H(),...(opts.headers||{})}});
    if(r.status===401){
      const ok=await this.refreshToken();
      if(ok){
        r=await fetch(url,{...opts,headers:{...this.H(),...(opts.headers||{})}});
      }else{
        this.logout();
        return null;
      }
    }
    const ct=r.headers.get("content-type")||"";
    if(ct.includes("json"))return r.json();
    return null;
  },

  async getUser(){
    const uid=this.uid();
    if(uid)return {id:uid};
    try{
      const d=await this.call(SB_URL+"/auth/v1/user");
      if(d&&d.id){
        localStorage.setItem("velero_uid",d.id);
        return d;
      }
      return null;
    }catch(e){return null;}
  },

  async getProfile(){
    let uid=this.uid();
    if(!uid){
      const u=await this.getUser();
      if(!u)return null;
      uid=u.id;
    }
    try{
      const d=await this.call(SB_URL+"/rest/v1/profiles?id=eq."+uid+"&select=*");
      if(Array.isArray(d)&&d.length>0)return d[0];
      return null;
    }catch(e){return null;}
  },

  async rpc(fn,params){
    try{
      return await this.call(SB_URL+"/rest/v1/rpc/"+fn,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(params)
      });
    }catch(e){return {success:false,error:"Erreur réseau"};}
  },

  async select(table,q=""){
    try{
      const d=await this.call(SB_URL+"/rest/v1/"+table+q);
      return Array.isArray(d)?d:[];
    }catch(e){return [];}
  },

  async insert(table,data){
    try{
      return await this.call(SB_URL+"/rest/v1/"+table,{
        method:"POST",
        headers:{"Prefer":"return=representation"},
        body:JSON.stringify(data)
      });
    }catch(e){return null;}
  },

  async update(table,q,data){
    try{
      return await this.call(SB_URL+"/rest/v1/"+table+q,{
        method:"PATCH",
        headers:{"Prefer":"return=representation"},
        body:JSON.stringify(data)
      });
    }catch(e){return null;}
  },

  logout(){
    try{fetch(SB_URL+"/auth/v1/logout",{method:"POST",headers:this.H()});}catch(e){}
    localStorage.clear();
    location.href="index.html";
  }
};
