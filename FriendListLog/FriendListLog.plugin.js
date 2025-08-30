/**
 * @name FriendListLog
 * @author Frixio
 * @version 0.0.1
 * @description Friend list logging (adds/removes) with timestamps. Floating button (Friends tab only). Clean 4-column table with avatars, search (with inline clear), CSV export, status panel, hotkey Ctrl/Cmd+L. Localizable UI (default: English) with language selector in settings.
 */
// @ts-nocheck

module.exports = class FriendListLog {
  constructor() {
    this.PLUGIN_NAME = "FriendListLog";
    this.STYLE_ID   = "fllogs-style";
    this.FAB_ID     = "fllogs-fab";
    this.BUTTON_ID  = "fllogs-button";
    this.OVERLAY_ID = "fllogs-overlay";
    this.TABLE_ID   = "fllogs-table";
    this.TBODY_ID   = "fllogs-tbody";

    // data
    this.logs = [];
    this._searchQuery = "";
    this.prev = { friends: new Set(), pin: new Set(), pout: new Set() };
    this._lastEvents = [];
    this._selfIntents = new Map();
    this._recentOutgoingReq = new Map();
    this._globalClicks = { addAccept: 0, outgoing: 0, remove: 0 };

    // modules/handles
    this.UserStore = null;
    this.RelationshipStore = null;
    this.RelationshipTypes = null;
    this.AvatarResolver = null;

    this.pollInterval = null;
    this.observer = null;
    this._unpatchHistory = null;
    this._popstateHandler = null;
    this._escHandler = null;
    this._docClick = null;
    this._panelOpen = false;
    this._hotkeyHandler = null;

    // settings (default english)
    this.settings = { lang: "en" };

    this._debugInfo = { userStore:false, relationStore:false, actionsPatched:false, pin:0, pout:0, friends:0 };

    // i18n strings
    this.LANGS = {
      en: {
        panel_title: "FriendListLog — Logs",
        btn_status: "Status",
        btn_export_csv: "Export CSV",
        btn_close: "Close",
        tooltip_clear: "Clear all logs",
        search_placeholder: "Search: name, @handle, action (add/remove) or date...",
        th_time: "TIME",
        th_actor: "ACTOR",
        th_action: "ACTION",
        th_target: "RECIPIENT",
        badge_add: "ADD",
        badge_remove: "REMOVE",
        empty: "No entries yet.",
        empty_search: "No entries match your search.",
        confirm_clear_title: "Clear logs?",
        confirm_clear_body: "This action is irreversible.",
        confirm_clear_button: "Clear",
        status_title: "FriendListLog — Status",
        status_modules: "Modules:",
        status_userstore: "UserStore:",
        status_relstore: "RelationshipStore:",
        status_patched: "Patched actions:",
        status_info: "Info:",
        status_me: "Me:",
        status_friends: "Friends detected:",
        status_inouts: "Incoming: {in} | Outgoing: {out}",
        status_clicks: "Recent clicks (6s): Add/Accept={add}, Send={out}, Remove={rem}",
        status_polling: "Polling:",
        active: "active",
        inactive: "inactive",
        ok: "OK",
        no: "NO",
        toast_open_friends: "Open the Friends tab to view the logs",
        enabled_toast: "FriendListLog enabled",
        disabled_toast: "FriendListLog disabled",
        btn_logs: "Logs",
        search_clear_aria: "Clear"
      },
      fr: {
        panel_title: "FriendListLog — Journaux",
        btn_status: "Statut",
        btn_export_csv: "Exporter CSV",
        btn_close: "Fermer",
        tooltip_clear: "Effacer tous les logs",
        search_placeholder: "Rechercher : nom, @pseudo, action (ajouter/supprimer) ou date...",
        th_time: "HEURE",
        th_actor: "UTILISATEUR QUI FAIT L'ACTION",
        th_action: "ACTION",
        th_target: "UTILISATEUR QUI REÇOIT L'ACTION",
        badge_add: "AJOUTER",
        badge_remove: "SUPPRIMER",
        empty: "Aucune entrée pour le moment.",
        empty_search: "Aucune entrée ne correspond à la recherche.",
        confirm_clear_title: "Vider les logs ?",
        confirm_clear_body: "Cette action est irréversible.",
        confirm_clear_button: "Vider",
        status_title: "FriendListLog — Statut",
        status_modules: "Modules :",
        status_userstore: "UserStore :",
        status_relstore: "RelationshipStore :",
        status_patched: "Actions patchées :",
        status_info: "Infos :",
        status_me: "Moi :",
        status_friends: "Amis détectés :",
        status_inouts: "Entrantes : {in} | Sortantes : {out}",
        status_clicks: "Clics récents (6s) : Ajouter/Accepter={add}, Envoyer={out}, Supprimer={rem}",
        status_polling: "Polling :",
        active: "actif",
        inactive: "inactif",
        ok: "OK",
        no: "NON",
        toast_open_friends: "Ouvre l’onglet Amis pour afficher les journaux",
        enabled_toast: "FriendListLog activé",
        disabled_toast: "FriendListLog désactivé",
        btn_logs: "Logs",
        search_clear_aria: "Effacer"
      },
      es: {
        panel_title: "FriendListLog — Registros",
        btn_status: "Estado",
        btn_export_csv: "Exportar CSV",
        btn_close: "Cerrar",
        tooltip_clear: "Borrar todos los registros",
        search_placeholder: "Buscar: nombre, @usuario, acción (añadir/eliminar) o fecha...",
        th_time: "HORA",
        th_actor: "QUIÉN ACTÚA",
        th_action: "ACCIÓN",
        th_target: "DESTINATARIO",
        badge_add: "AÑADIR",
        badge_remove: "ELIMINAR",
        empty: "Aún no hay entradas.",
        empty_search: "Ninguna entrada coincide con tu búsqueda.",
        confirm_clear_title: "¿Borrar registros?",
        confirm_clear_body: "Esta acción es irreversible.",
        confirm_clear_button: "Borrar",
        status_title: "FriendListLog — Estado",
        status_modules: "Módulos:",
        status_userstore: "UserStore:",
        status_relstore: "RelationshipStore:",
        status_patched: "Acciones parcheadas:",
        status_info: "Información:",
        status_me: "Yo:",
        status_friends: "Amigos detectados:",
        status_inouts: "Entrantes: {in} | Salientes: {out}",
        status_clicks: "Clics recientes (6s): Añadir/Aceptar={add}, Enviar={out}, Eliminar={rem}",
        status_polling: "Consulta:",
        active: "activo",
        inactive: "inactivo",
        ok: "OK",
        no: "NO",
        toast_open_friends: "Abre la pestaña Amigos para ver los registros",
        enabled_toast: "FriendListLog habilitado",
        disabled_toast: "FriendListLog deshabilitado",
        btn_logs: "Logs",
        search_clear_aria: "Borrar"
      },
      de: {
        panel_title: "FriendListLog — Protokolle",
        btn_status: "Status",
        btn_export_csv: "CSV exportieren",
        btn_close: "Schließen",
        tooltip_clear: "Alle Protokolle löschen",
        search_placeholder: "Suchen: Name, @Handle, Aktion (hinzufügen/entfernen) oder Datum...",
        th_time: "ZEIT",
        th_actor: "AKTEUR",
        th_action: "AKTION",
        th_target: "EMPFÄNGER",
        badge_add: "HINZUFÜGEN",
        badge_remove: "ENTFERNEN",
        empty: "Noch keine Einträge.",
        empty_search: "Keine Einträge entsprechen der Suche.",
        confirm_clear_title: "Protokolle löschen?",
        confirm_clear_body: "Diese Aktion ist irreversibel.",
        confirm_clear_button: "Löschen",
        status_title: "FriendListLog — Status",
        status_modules: "Module:",
        status_userstore: "UserStore:",
        status_relstore: "RelationshipStore:",
        status_patched: "Gepatchte Aktionen:",
        status_info: "Info:",
        status_me: "Ich:",
        status_friends: "Erkannte Freunde:",
        status_inouts: "Eingehend: {in} | Ausgehend: {out}",
        status_clicks: "Letzte Klicks (6s): Hinzufügen/Akzeptieren={add}, Senden={out}, Entfernen={rem}",
        status_polling: "Polling:",
        active: "aktiv",
        inactive: "inaktiv",
        ok: "OK",
        no: "NEIN",
        toast_open_friends: "Öffne den Freunde-Tab, um die Protokolle zu sehen",
        enabled_toast: "FriendListLog aktiviert",
        disabled_toast: "FriendListLog deaktiviert",
        btn_logs: "Logs",
        search_clear_aria: "Leeren"
      },
      pt: {
        panel_title: "FriendListLog — Registros",
        btn_status: "Status",
        btn_export_csv: "Exportar CSV",
        btn_close: "Fechar",
        tooltip_clear: "Apagar todos os registros",
        search_placeholder: "Pesquisar: nome, @usuário, ação (adicionar/remover) ou data...",
        th_time: "HORA",
        th_actor: "QUEM AGE",
        th_action: "AÇÃO",
        th_target: "DESTINATÁRIO",
        badge_add: "ADICIONAR",
        badge_remove: "REMOVER",
        empty: "Ainda não há entradas.",
        empty_search: "Nenhuma entrada corresponde à pesquisa.",
        confirm_clear_title: "Apagar registros?",
        confirm_clear_body: "Esta ação é irreversível.",
        confirm_clear_button: "Apagar",
        status_title: "FriendListLog — Status",
        status_modules: "Módulos:",
        status_userstore: "UserStore:",
        status_relstore: "RelationshipStore:",
        status_patched: "Ações corrigidas:",
        status_info: "Informações:",
        status_me: "Eu:",
        status_friends: "Amigos detectados:",
        status_inouts: "Entrantes: {in} | Saídas: {out}",
        status_clicks: "Cliques recentes (6s): Adicionar/Aceitar={add}, Enviar={out}, Remover={rem}",
        status_polling: "Polling:",
        active: "ativo",
        inactive: "inativo",
        ok: "OK",
        no: "NÃO",
        toast_open_friends: "Abra a aba Amigos para ver os registros",
        enabled_toast: "FriendListLog ativado",
        disabled_toast: "FriendListLog desativado",
        btn_logs: "Logs",
        search_clear_aria: "Limpar"
      },
      it: {
        panel_title: "FriendListLog — Registro",
        btn_status: "Stato",
        btn_export_csv: "Esporta CSV",
        btn_close: "Chiudi",
        tooltip_clear: "Cancella tutti i log",
        search_placeholder: "Cerca: nome, @handle, azione (aggiungere/rimuovere) o data...",
        th_time: "ORA",
        th_actor: "CHI AGISCE",
        th_action: "AZIONE",
        th_target: "DESTINATARIO",
        badge_add: "AGGIUNGERE",
        badge_remove: "RIMUOVERE",
        empty: "Nessuna voce al momento.",
        empty_search: "Nessuna voce corrisponde alla ricerca.",
        confirm_clear_title: "Cancellare i log?",
        confirm_clear_body: "Questa azione è irreversibile.",
        confirm_clear_button: "Cancella",
        status_title: "FriendListLog — Stato",
        status_modules: "Moduli:",
        status_userstore: "UserStore:",
        status_relstore: "RelationshipStore:",
        status_patched: "Azioni patchate:",
        status_info: "Info:",
        status_me: "Io:",
        status_friends: "Amici rilevati:",
        status_inouts: "In arrivo: {in} | In uscita: {out}",
        status_clicks: "Click recenti (6s): Aggiungi/Accetta={add}, Invia={out}, Rimuovi={rem}",
        status_polling: "Polling:",
        active: "attivo",
        inactive: "inattivo",
        ok: "OK",
        no: "NO",
        toast_open_friends: "Apri la scheda Amici per vedere i log",
        enabled_toast: "FriendListLog attivato",
        disabled_toast: "FriendListLog disattivato",
        btn_logs: "Logs",
        search_clear_aria: "Cancella"
      }
    };

    this.LANG_NAMES = { en:"English", fr:"Français", es:"Español", de:"Deutsch", pt:"Português", it:"Italiano" };
  }

  /* ---------- Utils & i18n ---------- */
  get Data()    { return BdApi.Data; }
  get Patcher() { return BdApi.Patcher; }

  _pad(n){ return String(n).padStart(2,"0"); }
  _nowStr(){
    const d=new Date();
    return this._pad(d.getDate())+"/"+this._pad(d.getMonth()+1)+"/"+d.getFullYear()+" "+
           this._pad(d.getHours())+":"+this._pad(d.getMinutes())+":"+this._pad(d.getSeconds());
  }
  _esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  _load(){ try{ const s=this.Data.load(this.PLUGIN_NAME,"logs"); if(Array.isArray(s)) this.logs=s; }catch(e){} }
  _save(){ try{ this.Data.save(this.PLUGIN_NAME,"logs",this.logs); }catch(e){} }

  _loadSettings(){
    try{
      const st=this.Data.load(this.PLUGIN_NAME,"settings");
      if(st && typeof st==="object") this.settings=Object.assign({lang:"en"}, st);
    }catch(e){}
    if(!this.LANGS[this.settings.lang]) this.settings.lang="en";
  }
  _saveSettings(){ try{ this.Data.save(this.PLUGIN_NAME,"settings",this.settings); }catch(e){} }
  _t(key, vars){
    const lang=this.settings.lang || "en";
    let str=(this.LANGS[lang] && this.LANGS[lang][key]) || (this.LANGS.en[key]||key);
    if(vars) for(const k in vars) str=str.replace(new RegExp("\\{"+k+"\\}","g"), String(vars[k]));
    return str;
  }

  /* ---------- Avatars ---------- */
  _avatarFromUser(user,size){
    try{
      if(!user) return "https://cdn.discordapp.com/embed/avatars/0.png";
      if(this.AvatarResolver && typeof this.AvatarResolver.getUserAvatarURL==="function")
        return this.AvatarResolver.getUserAvatarURL(user, size||64);
      if(typeof user.getAvatarURL==="function") return user.getAvatarURL(size||64);
      if(user.avatar) return "https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".webp?size="+(size||64);
      const idx=(user.discriminator && parseInt(user.discriminator,10)>=0)?(parseInt(user.discriminator,10)%6):0;
      return "https://cdn.discordapp.com/embed/avatars/"+idx+".png";
    }catch(e){ return "https://cdn.discordapp.com/embed/avatars/0.png"; }
  }
  _avatarById(id,size){
    try{
      let u=null;
      if(id && id!=="?") u=(this.UserStore&&this.UserStore.getUser)?this.UserStore.getUser(id):null;
      else u=this._me();
      return this._avatarFromUser(u,size||64);
    }catch(e){ return "https://cdn.discordapp.com/embed/avatars/0.png"; }
  }

  /* ---------- Modules ---------- */
  _grabModules(){
    const W = BdApi.Webpack;
    const byProps=(...p)=>W.getModule(W.Filters.byProps(...p),{defaultExport:false});
    const byKeys=(k)=>W.getModule(m=>m&&k.every(x=>x in m),{defaultExport:false});

    this.UserStore = (W.getStore && W.getStore("UserStore")) || byProps("getCurrentUser","getUser");
    this.RelationshipStore =
      (W.getStore && W.getStore("RelationshipStore")) ||
      byProps("getFriendIDs") || byProps("getFriendIds") ||
      byProps("isFriend","getRelationships") || byProps("getRelationships");

    this.RelationshipTypes = byKeys(["FRIEND","PENDING_INCOMING","PENDING_OUTGOING","BLOCKED"]) || null;
    this.AvatarResolver = byProps("getUserAvatarURL","getGuildMemberAvatarURL") || null;

    this._debugInfo.userStore = !!this.UserStore;
    this._debugInfo.relationStore = !!this.RelationshipStore;

    const Actions =
      byProps("removeRelationship","acceptFriendRequest","addRelationship","sendFriendRequest") ||
      byProps("removeRelationship","acceptFriendRequest","addRelationship") ||
      byProps("removeRelationship");

    if(Actions){
      try{
        if(typeof Actions.removeRelationship==="function")
          this.Patcher.before(this.PLUGIN_NAME, Actions, "removeRelationship", (_,a)=>{ const uid=a[0]; this._markIntent(uid,"remove"); });
        if(typeof Actions.acceptFriendRequest==="function")
          this.Patcher.before(this.PLUGIN_NAME, Actions, "acceptFriendRequest", (_,a)=>{ const uid=a[0]; this._markIntent(uid,"accept"); });
        if(typeof Actions.addRelationship==="function")
          this.Patcher.before(this.PLUGIN_NAME, Actions, "addRelationship", (_,a)=>{
            const uid=a[0], rel=a[1];
            if(!this.RelationshipTypes || rel===this.RelationshipTypes.FRIEND || rel==null) this._markIntent(uid,"add");
            const isPO=(this.RelationshipTypes && rel===this.RelationshipTypes.PENDING_OUTGOING) || rel===4 || rel==="PENDING_OUTGOING";
            if(isPO){ this._markOutgoing(uid); this._markGlobal("outgoing"); }
          });
        if(typeof Actions.sendFriendRequest==="function")
          this.Patcher.before(this.PLUGIN_NAME, Actions, "sendFriendRequest", (_,a)=>{ const uid=a[0]; this._markOutgoing(uid); this._markGlobal("outgoing"); });
        this._debugInfo.actionsPatched = true;
      }catch(e){}
    }
  }

  /* ---------- Names ---------- */
  _me(){ try{ return (this.UserStore&&this.UserStore.getCurrentUser) ? this.UserStore.getCurrentUser() : null; }catch(e){ return null; } }
  _nice(u){
    if(!u) return null;
    const un=u.username||null, gn=u.globalName||u.global_name||null;
    return (gn && un && gn!==un) ? (gn+" (@"+un+")") : (gn || un || null);
  }
  _nameById(id){ if(!id) return null; try{ const u=(this.UserStore&&this.UserStore.getUser)?this.UserStore.getUser(id):null; return this._nice(u); }catch(e){ return null; } }

  /* ---------- Intents & Clicks ---------- */
  _markIntent(userId,type){ if(!userId) return; this._selfIntents.set(userId,{type,t:Date.now()}); setTimeout(()=>this._selfIntents.delete(userId),5000); }
  _wasSelfRecent(userId,type){ const it=this._selfIntents.get(userId); return !!(it&&it.type===type&&Date.now()-it.t<5000); }
  _markOutgoing(uid){ if(!uid) return; this._recentOutgoingReq.set(uid, Date.now()); }
  _hadRecentOutgoing(uid){ const t=this._recentOutgoingReq.get(uid); return !!(t && Date.now()-t < 259200000); } // 3 days
  _markGlobal(kind){ this._globalClicks[kind]=Date.now(); }
  _didGlobal(kind,ms){ return Date.now()-(this._globalClicks[kind]||0)<ms; }

  _installClickSniffer(){
    if(this._docClick) return;
    const match=(txt)=>{
      if(!txt) return null;
      const s=txt.trim().toLowerCase();
      if(/(^|\s)(ajouter|add|add friend|ajouter un ami|ajouter en ami)(\s|$)/.test(s)) return "addAccept";
      if(/(^|\s)(accepter|accept)(\s|$)/.test(s)) return "addAccept";
      if(/envoyer.*(demande|request)|send friend request/.test(s)) return "outgoing";
      if(/(retirer|supprimer).*(ami)|remove friend|unfriend/.test(s)) return "remove";
      return null;
    };
    const getText=(el)=>{
      if(!el) return "";
      if(el.getAttribute && el.getAttribute("aria-label")) return el.getAttribute("aria-label");
      if(el.innerText && el.innerText.length) return el.innerText;
      if(el.textContent && el.textContent.length) return el.textContent;
      return "";
    };
    this._docClick=(e)=>{
      try{
        let el=e.target;
        for(let i=0;i<4 && el;i++){
          const m=match(getText(el));
          if(m){ this._markGlobal(m); break; }
          el=el.parentElement;
        }
      }catch(err){}
    };
    document.addEventListener("click", this._docClick, true);
  }
  _removeClickSniffer(){ try{ if(this._docClick) document.removeEventListener("click", this._docClick, true); }catch(e){} this._docClick=null; }

  /* ---------- Snapshot ---------- */
  _getSnapshot(){
    const s=this.RelationshipStore;
    const friends=new Set(), pin=new Set(), pout=new Set();
    if(!s) return {friends, pin, pout};
    const RT=this.RelationshipTypes;

    const isF=(id,rel)=>{ try{
      if(typeof s.isFriend==="function") return !!s.isFriend(id);
      if(RT) return rel===RT.FRIEND;
      return rel===1||rel===3||rel==="FRIEND";
    }catch(_){return false;}};
    const isPIN=(id,rel)=>{ try{
      if(typeof s.isIncomingFriendRequest==="function") return !!s.isIncomingFriendRequest(id);
      if(typeof s.isIncomingRequest==="function") return !!s.isIncomingRequest(id);
      if(RT) return rel===RT.PENDING_INCOMING;
      return rel===2||rel==="PENDING_INCOMING";
    }catch(_){return false;}};
    const isPOUT=(id,rel)=>{ try{
      if(typeof s.isOutgoingFriendRequest==="function") return !!s.isOutgoingFriendRequest(id);
      if(typeof s.isOutgoingRequest==="function") return !!s.isOutgoingRequest(id);
      if(RT) return rel===RT.PENDING_OUTGOING;
      return rel===4||rel==="PENDING_OUTGOING";
    }catch(_){return false;}};

    try{
      const rels=(typeof s.getRelationships==="function")?s.getRelationships():null;
      if(rels){
        if(typeof rels.forEach==="function"){
          rels.forEach((rel,id)=>{ if(isF(id,rel)) friends.add(id); else if(isPIN(id,rel)) pin.add(id); else if(isPOUT(id,rel)) pout.add(id); });
        }else{
          for(const k in rels){ const rel=rels[k]; if(isF(k,rel)) friends.add(k); else if(isPIN(k,rel)) pin.add(k); else if(isPOUT(k,rel)) pout.add(k); }
        }
      }else{
        const ids=(s.getFriendIDs?.() ?? s.getFriendIds?.() ?? []) || [];
        for(const id of (Array.isArray(ids)?ids:Array.from(ids))) friends.add(id);
      }
    }catch(e){}

    this._debugInfo.friends=friends.size; this._debugInfo.pin=pin.size; this._debugInfo.pout=pout.size;
    return {friends, pin, pout};
  }

  /* ---------- Recording ---------- */
  _push(entry){
    const key=entry.action+":"+entry.otherId;
    const now=Date.now();
    this._lastEvents=this._lastEvents.filter(e=>now-e.t<2000);
    if(this._lastEvents.some(e=>e.key===key)) return;

    entry.actorName=entry.actorName||this._nameById(entry.actorId)||"Unknown";
    entry.targetName=entry.targetName||this._nameById(entry.targetId)||"Unknown";

    this._lastEvents.push({key,t:now});
    this.logs.unshift(entry);
    this._save();
    if(this._panelOpen) this._refreshTable();
  }

  _recordAdd(otherId, prevSnap){
    let actorIsMe=false;
    if(this._wasSelfRecent(otherId,"accept")||this._wasSelfRecent(otherId,"add")) actorIsMe=true;
    if(!actorIsMe && this._didGlobal("addAccept",6000)) actorIsMe=true;
    if(!actorIsMe && (this._hadRecentOutgoing(otherId)||this._didGlobal("outgoing",6000))) actorIsMe=false;
    if(!actorIsMe && prevSnap && prevSnap.pout && prevSnap.pout.has(otherId)) actorIsMe=false;
    if(!actorIsMe && prevSnap && prevSnap.pin && prevSnap.pin.has(otherId)) actorIsMe=true;

    const me=this._me(); const meId=(me&&me.id)?me.id:"?"; const meName=this._nice(me)||"Me";
    const otherName=this._nameById(otherId)||("User "+otherId);

    const actorId=actorIsMe?meId:otherId;
    const targetId=actorIsMe?otherId:meId;
    const actorName=actorIsMe?meName:otherName;
    const targetName=actorIsMe?otherName:meName;

    this._push({ t:Date.now(), when:this._nowStr(), action:"ADD", actorId, actorName, targetId, targetName, otherId });
  }

  _recordRemove(otherId){
    let actorIsMe=this._wasSelfRecent(otherId,"remove");
    if(!actorIsMe && this._didGlobal("remove",6000)) actorIsMe=true;

    const me=this._me(); const meId=(me&&me.id)?me.id:"?"; const meName=this._nice(me)||"Me";
    const otherName=this._nameById(otherId)||("User "+otherId);

    const actorId=actorIsMe?meId:otherId;
    const targetId=actorIsMe?otherId:meId;
    const actorName=actorIsMe?meName:otherName;
    const targetName=actorIsMe?otherName:meName;

    this._push({ t:Date.now(), when:this._nowStr(), action:"REMOVE", actorId, actorName, targetId, targetName, otherId });
  }

  /* ---------- Polling ---------- */
  _startPolling(){
    try{ this.prev=this._getSnapshot(); }catch(e){ this.prev={friends:new Set(),pin:new Set(),pout:new Set()}; }
    this.pollInterval=setInterval(()=>{
      try{
        const cur=this._getSnapshot();
        for(const id of cur.friends) if(!this.prev.friends.has(id)) this._recordAdd(id, this.prev);
        for(const id of this.prev.friends) if(!cur.friends.has(id)) this._recordRemove(id);
        this.prev=cur;
      }catch(e){}
    },1000);
  }

  /* ---------- CSV ---------- */
  _buildCSV(list){
    const esc=x=>'"'+String(x==null?"":x).replace(/"/g,'""')+'"';
    const rows=[];
    rows.push([this._t("th_time"),this._t("th_actor"),this._t("th_action"),this._t("th_target")]);
    (list||this.logs).forEach(e=>{
      rows.push([ e.when||"", e.actorName||"", (e.action==="ADD"?this._t("badge_add"):this._t("badge_remove")), e.targetName||"" ]);
    });
    return rows.map(r=>r.map(esc).join(";")).join("\r\n");
  }

  /* ---------- Styles (incl. nicer settings) ---------- */
  _injectStyle(){
    const css = [
      // Floating button
      "#"+this.FAB_ID+"{position:fixed;right:18px;bottom:18px;z-index:9999;pointer-events:none;}",
      "#"+this.BUTTON_ID+"{pointer-events:auto;appearance:none;border:none;padding:11px 18px;border-radius:999px;font-weight:700;cursor:pointer;background:#5865F2;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.35);transition:transform .06s,filter .12s,box-shadow .12s;}",
      "#"+this.BUTTON_ID+":hover{filter:brightness(1.06);box-shadow:0 10px 22px rgba(0,0,0,.45);}",
      "#"+this.BUTTON_ID+":active{transform:translateY(1px);}",

      // Overlay / modal
      "#"+this.OVERLAY_ID+"{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;}",
      "#"+this.OVERLAY_ID+" .fllogs-modal{width:min(1000px,94vw);max-height:86vh;background:#2e3440;color:#e6e9ef;border:1px solid rgba(255,255,255,.14);border-radius:16px;box-shadow:0 20px 48px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;}",

      ".fllogs-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,0));border-bottom:1px solid rgba(255,255,255,.14);font-weight:800;font-size:16px;letter-spacing:.3px;}",
      ".fllogs-actions{display:flex;gap:10px;}",
      ".fllogs-btn{appearance:none;border:1px solid rgba(255,255,255,.22);background:#3b4150;color:#fff;border-radius:10px;padding:7px 12px;cursor:pointer;font-weight:700;}",
      ".fllogs-btn:hover{filter:brightness(1.07);}"+

      ".fllogs-body{padding:14px 16px;background:#303646;color:#e6e9ef;display:flex;flex-direction:column;gap:12px;overflow:hidden;}",
      ".fllogs-search{position:relative;display:flex;align-items:center;margin:0 0 6px 0;}",
      ".fllogs-search input{flex:1 1 auto;background:#262b39;border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:8px 30px 8px 10px;color:#fff;font-weight:600;outline:none;}",
      ".fllogs-search input::placeholder{color:#b8bfcc;opacity:.85;}",
      ".fllogs-clearbtn{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:20px;height:20px;line-height:20px;text-align:center;border:none;border-radius:50%;background:transparent;color:#b8bfcc;cursor:pointer;font-size:16px;padding:0;}",
      ".fllogs-clearbtn:hover{color:#fff;background:rgba(255,255,255,.12);}",

      ".fllogs-tablewrap{overflow:auto;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:#242a38;}",
      "table.fllogs-table{width:100%;border-collapse:collapse;min-width:760px;}",
      "table.fllogs-table thead th{position:sticky;top:0;z-index:1;text-align:left;padding:12px 12px;font-size:12px;letter-spacing:.35px;text-transform:uppercase;background:#3b3f4a;color:#f2f5f9;}",
      "table.fllogs-table tbody td{padding:11px 12px;border-top:1px solid rgba(255,255,255,.08);vertical-align:middle;}",
      "table.fllogs-table tbody tr:nth-child(odd){background:rgba(255,255,255,.035);}",

      ".cell-when{width:220px;font-family:ui-monospace,Menlo,Consolas,monospace;color:#cfd3da;}",
      ".cell-actor,.cell-target{width:320px;font-weight:800;color:#f0f3f7;}",
      ".fllogs-user{display:inline-flex;align-items:center;gap:8px;min-width:0;}",
      ".fllogs-avatar{width:22px;height:22px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.2);}",
      ".fllogs-user .name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;display:inline-block;}",

      ".badge{display:inline-block;padding:5px 12px;border-radius:999px;font-weight:900;color:#fff;font-size:11px;letter-spacing:.25px;}",
      ".badge.add{background:#24d27e;}",
      ".badge.remove{background:#ff6b6b;}",

      ".fllogs-iconbtn{display:inline-grid;place-items:center;padding:7px;width:36px;height:36px;}",
      ".fllogs-iconbtn svg{width:18px;height:18px;fill:currentColor;display:block;}",
      ".fllogs-iconbtn:hover{filter:brightness(1.07);}",

      ".bd-modal-wrapper .bd-modal-body pre,.bd-modal-wrapper .bd-modal-body div{color:#f0f3f7!important;}",

      // Settings panel (card, high contrast, nicer spacing)
      ".fllogs-settings{max-width:620px;background:#2e3440;border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:16px;margin:8px 0;box-shadow:0 12px 28px rgba(0,0,0,.35);color:#e6e9ef;}",
      ".fllogs-settings h2{margin:0 0 10px 0;font-weight:900;font-size:18px;letter-spacing:.2px;color:#f2f5f9;}",
      ".fllogs-settings .row{display:flex;align-items:center;gap:12px;margin-top:8px;}",
      ".fllogs-settings label{min-width:120px;font-weight:800;color:#f0f3f7;opacity:.95;}",
      ".fllogs-settings select{background:#1f2433;color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:10px;padding:8px 12px;font-weight:700;outline:none;}",
      ".fllogs-settings select:focus{box-shadow:0 0 0 3px rgba(88,101,242,.35);border-color:#5865F2;}",
      ".fllogs-settings .hint{margin-top:10px;color:#cfd3da;opacity:.95;font-size:12.5px;}"
    ].join("\n");
    try{ BdApi.DOM.addStyle(this.STYLE_ID, css); }catch(e){}
  }
  _removeStyle(){ try{ BdApi.DOM.removeStyle(this.STYLE_ID); }catch(e){} }

  /* ---------- UI (panel) ---------- */
  _openLogsModal(){
    if(document.getElementById(this.OVERLAY_ID)) return;
    this._panelOpen=true;
    const overlay=document.createElement("div");
    overlay.id=this.OVERLAY_ID;
    overlay.innerHTML =
      '<div class="fllogs-modal" role="dialog" aria-label="'+this._esc(this._t("panel_title"))+'">' +
      '  <div class="fllogs-head">' +
      '    <span>'+this._esc(this._t("panel_title"))+'</span>' +
      '    <div class="fllogs-actions">' +
      '      <button class="fllogs-btn" id="'+this.OVERLAY_ID+'-status">'+this._esc(this._t("btn_status"))+'</button>' +
      '      <button class="fllogs-btn" id="'+this.OVERLAY_ID+'-exportcsv">'+this._esc(this._t("btn_export_csv"))+'</button>' +
      '      <button class="fllogs-btn fllogs-iconbtn" id="'+this.OVERLAY_ID+'-clear" title="'+this._esc(this._t("tooltip_clear"))+'" aria-label="'+this._esc(this._t("tooltip_clear"))+'">' +
      '        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 3a1 1 0 0 0-1 1v2H5v2h1l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13h1V6h-3V4a1 1 0 0 0-1-1H9zm2 3V5h2v1h-2zm-2 4h2v9H9V10zm6 0h-2v9h2V10z"/></svg>' +
      '      </button>' +
      '      <button class="fllogs-btn" id="'+this.OVERLAY_ID+'-close">'+this._esc(this._t("btn_close"))+'</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="fllogs-body">' +
      '    <div class="fllogs-search">' +
      '      <input type="text" id="'+this.OVERLAY_ID+'-search" placeholder="'+this._esc(this._t("search_placeholder"))+'">' +
      '      <button class="fllogs-clearbtn" id="'+this.OVERLAY_ID+'-searchclear" aria-label="'+this._esc(this._t("search_clear_aria"))+'">×</button>' +
      '    </div>' +
      '    <div class="fllogs-tablewrap">' +
      '      <table class="fllogs-table" id="'+this.TABLE_ID+'">' +
      '        <thead><tr>' +
      '          <th>'+this._esc(this._t("th_time"))+'</th>' +
      '          <th>'+this._esc(this._t("th_actor"))+'</th>' +
      '          <th>'+this._esc(this._t("th_action"))+'</th>' +
      '          <th>'+this._esc(this._t("th_target"))+'</th>' +
      '        </tr></thead>' +
      '        <tbody id="'+this.TBODY_ID+'">' +
      '          <tr><td colspan="4" style="text-align:center;padding:18px;">'+this._esc(this._t("empty"))+'</td></tr>' +
      '        </tbody>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    const close=()=>this._closeLogsModal();
    overlay.addEventListener("click", (e)=>{ if(e.target===overlay) close(); });
    document.getElementById(this.OVERLAY_ID+"-close").addEventListener("click", close);

    // Export CSV
    document.getElementById(this.OVERLAY_ID+"-exportcsv").addEventListener("click", ()=>{
      const csv=this._buildCSV(this.logs);
      const node=BdApi.React.createElement("textarea",{readOnly:true,
        style:{width:"100%",height:"45vh",background:"#1e2330",color:"#fff",border:"1px solid #333",borderRadius:"8px",padding:"10px"}}, csv);
      BdApi.UI.showConfirmationModal(
        this._t("btn_export_csv"),
        node,
        {confirmText: this._t("btn_export_csv"),
         cancelText: this._t("btn_close"),
         onConfirm: ()=>{
           try{
             const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
             const url=URL.createObjectURL(blob);
             const a=document.createElement("a");
             a.href=url; a.download="FriendListLog_"+Date.now()+".csv";
             document.body.appendChild(a); a.click();
             setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); },0);
           }catch(e){}
         }}
      );
    });

    // Clear logs
    document.getElementById(this.OVERLAY_ID+"-clear").addEventListener("click", ()=>{
      BdApi.UI.showConfirmationModal(this._t("confirm_clear_title"), this._t("confirm_clear_body"), {
        confirmText:this._t("confirm_clear_button"), danger:true,
        onConfirm:()=>{ this.logs=[]; this._save(); this._refreshTable(); }
      });
    });

    // Status
    document.getElementById(this.OVERLAY_ID+"-status").addEventListener("click", ()=>this._showStatus());

    // Search + clear cross
    const si=document.getElementById(this.OVERLAY_ID+"-search");
    const sc=document.getElementById(this.OVERLAY_ID+"-searchclear");
    const syncClear=()=>{ try{ if(sc) sc.style.display=(si && si.value && si.value.length)?"block":"none"; }catch(e){} };

    if(si){
      si.value=this._searchQuery||"";
      si.addEventListener("input",(e)=>{ this._searchQuery=(e.target&&e.target.value)?e.target.value:""; this._refreshTable(); syncClear(); });
      si.addEventListener("keydown",(e)=>{
        if(e.key==="Escape"){ this._searchQuery=""; si.value=""; this._refreshTable(); syncClear(); e.stopPropagation(); e.preventDefault(); }
      });
    }
    if(sc){
      sc.addEventListener("click",()=>{ this._searchQuery=""; if(si) si.value=""; this._refreshTable(); if(si) si.focus(); syncClear(); });
    }
    syncClear();

    // ESC closes (but not inside inputs)
    this._escHandler=(e)=>{
      if(e.key==="Escape"){
        const ae=document.activeElement;
        if(ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA")) return;
        close();
      }
    };
    window.addEventListener("keydown", this._escHandler);

    this._refreshTable();

    // Focus search on open
    setTimeout(()=>{ try{ const el=document.getElementById(overlay.id+"-search"); if(el) el.focus(); }catch(e){} },0);
  }

  _closeLogsModal(){
    this._panelOpen=false;
    const overlay=document.getElementById(this.OVERLAY_ID);
    if(!overlay) return;
    try{ overlay.remove(); }catch(e){}
    try{ if(this._escHandler) window.removeEventListener("keydown", this._escHandler); }catch(e){}
    this._escHandler=null;
  }

  _refreshTable(){
    const tbody=document.getElementById(this.TBODY_ID); if(!tbody) return;
    let list=this.logs;
    const qRaw=(this._searchQuery||"").trim().toLowerCase();
    if(qRaw){
      list=list.filter(e=>{
        const when=(e.when||"").toLowerCase();
        const actor=(e.actorName||"").toLowerCase();
        const target=(e.targetName||"").toLowerCase();
        const act=(e.action==="ADD"?"add":"remove");
        return when.includes(qRaw)||actor.includes(qRaw)||target.includes(qRaw)||act.includes(qRaw);
      });
    }
    if(!list.length){
      const msg = qRaw ? this._t("empty_search") : this._t("empty");
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:18px;">'+this._esc(msg)+'</td></tr>';
      return;
    }

    const rows=list.map((e,i)=>{
      const when=this._esc(e.when);
      const actorName=this._esc(e.actorName||"");
      const targetName=this._esc(e.targetName||"");
      const actorSrc=this._avatarById(e.actorId,64);
      const targetSrc=this._avatarById(e.targetId,64);
      const badgeClass=e.action==="ADD"?"badge add":"badge remove";
      const badgeText=e.action==="ADD"?this._t("badge_add"):this._t("badge_remove");
      return (
        '<tr data-idx="'+i+'">'+
          '<td class="cell-when">'+when+'</td>'+
          '<td class="cell-actor"><span class="fllogs-user"><img class="fllogs-avatar" alt="" src="'+this._esc(actorSrc)+'"><span class="name">'+actorName+'</span></span></td>'+
          '<td><span class="'+badgeClass+'">'+badgeText+'</span></td>'+
          '<td class="cell-target"><span class="fllogs-user"><img class="fllogs-avatar" alt="" src="'+this._esc(targetSrc)+'"><span class="name">'+targetName+'</span></span></td>'+
        '</tr>'
      );
    }).join("");
    tbody.innerHTML=rows;
  }

  _showStatus(){
    const me=this._me(); const snap=this._getSnapshot();
    const meName=this._nice(me); const meId=(me&&me.id)?me.id:"?";
    const addOK=this._didGlobal("addAccept",6000);
    const outOK=this._didGlobal("outgoing",6000);
    const remOK=this._didGlobal("remove",6000);

    const lines=[];
    lines.push(this._t("status_modules"));
    lines.push("- "+this._t("status_userstore")+" "+(this._debugInfo.userStore?this._t("ok"):this._t("no")));
    lines.push("- "+this._t("status_relstore")+" "+(this._debugInfo.relationStore?this._t("ok"):this._t("no")));
    lines.push("- "+this._t("status_patched")+" "+(this._debugInfo.actionsPatched?this._t("ok"):this._t("no")));
    lines.push("");
    lines.push(this._t("status_info"));
    lines.push("- "+this._t("status_me")+" "+(meName ? (meName+" ("+meId+")") : "unknown (?)"));
    lines.push("- "+this._t("status_friends")+" "+snap.friends.size);
    lines.push("- "+this._t("status_inouts", {in:snap.pin.size, out:snap.pout.size}));
    lines.push("- "+this._t("status_clicks", {add:addOK, out:outOK, rem:remOK}));
    lines.push("- "+this._t("status_polling")+" "+(this.pollInterval?this._t("active"):this._t("inactive")));

    BdApi.UI.showConfirmationModal(
      this._t("status_title"),
      BdApi.React.createElement("pre",{style:{whiteSpace:"pre-wrap",color:"#f0f3f7"}}, lines.join("\n")),
      {confirmText: this._t("ok")}
    );
  }

  /* ---------- FAB ---------- */
  _mountFab(){
    if(document.getElementById(this.FAB_ID)) return;
    const wrap=document.createElement("div"); wrap.id=this.FAB_ID;
    const btn=document.createElement("button"); btn.id=this.BUTTON_ID; btn.type="button"; btn.textContent=this._t("btn_logs");
    btn.addEventListener("click", ()=>this._openLogsModal());
    wrap.appendChild(btn); document.body.appendChild(wrap);
  }
  _unmountFab(){ this._closeLogsModal(); const wrap=document.getElementById(this.FAB_ID); if(wrap&&wrap.parentElement) wrap.parentElement.removeChild(wrap); }

  _onFriendsRoute(){
    const p=location.pathname;
    if(!p.startsWith("/channels/@me")) return false;
    const rest=p.replace("/channels/@me","");
    return rest==="" || rest==="/" || rest.startsWith("?");
  }
  _settingsOpen(){
    if(location.pathname.startsWith("/settings")) return true;
    const v=document.querySelector('[class*="standardSidebarView-"]');
    if(v){ const r=v.getBoundingClientRect(); const cs=getComputedStyle(v); if(r.width>0 && r.height>0 && cs.display!=="none" && cs.visibility!=="hidden") return true; }
    return false;
  }
  _syncFabVisibility(){ if(this._onFriendsRoute() && !this._settingsOpen()) this._mountFab(); else this._unmountFab(); }

  _startObserver(){
    this.observer=new MutationObserver(()=>this._syncFabVisibility());
    this.observer.observe(document.body,{childList:true,subtree:true});
    const origPush=history.pushState, origReplace=history.replaceState, self=this;
    history.pushState=function(){ const r=origPush.apply(this,arguments); setTimeout(()=>self._syncFabVisibility(),0); return r; };
    history.replaceState=function(){ const r=origReplace.apply(this,arguments); setTimeout(()=>self._syncFabVisibility(),0); return r; };
    this._unpatchHistory=function(){ history.pushState=origPush; history.replaceState=origReplace; };
    this._popstateHandler=()=>this._syncFabVisibility(); window.addEventListener("popstate", this._popstateHandler);
  }
  _stopObserver(){
    try{ if(this.observer) this.observer.disconnect(); }catch(e){}
    this.observer=null;
    if(this._unpatchHistory){ try{ this._unpatchHistory(); }catch(e){} this._unpatchHistory=null; }
    if(this._popstateHandler){ try{ window.removeEventListener("popstate", this._popstateHandler); }catch(e){} this._popstateHandler=null; }
  }

  /* ---------- Hotkeys ---------- */
  _installHotkeys(){
    if(this._hotkeyHandler) return;
    this._hotkeyHandler=(e)=>{
      try{
        const key=(e.key||"").toLowerCase();
        const mod=(e.ctrlKey||e.metaKey) && !e.shiftKey && !e.altKey;
        if(!(mod && key==="l")) return;
        const ae=document.activeElement;
        if(ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.isContentEditable)) return;
        if(this._panelOpen) this._closeLogsModal();
        else{
          if(this._onFriendsRoute() && !this._settingsOpen()) this._openLogsModal();
          else BdApi.UI.showToast(this._t("toast_open_friends"),{type:"info"});
        }
        e.preventDefault(); e.stopPropagation();
      }catch(_){}
    };
    window.addEventListener("keydown", this._hotkeyHandler, true);
  }
  _removeHotkeys(){ try{ if(this._hotkeyHandler) window.removeEventListener("keydown", this._hotkeyHandler, true); }catch(e){} this._hotkeyHandler=null; }

  /* ---------- Settings Panel (now styled & readable) ---------- */
  getSettingsPanel(){
    const wrap=document.createElement("div");
    wrap.className="fllogs-settings";
    const h=document.createElement("h2");
    h.textContent="FriendListLog — Settings";

    const row=document.createElement("div");
    row.className="row";
    const label=document.createElement("label");
    label.textContent="Language:";
    const select=document.createElement("select");
    Object.keys(this.LANG_NAMES).forEach(code=>{
      const opt=document.createElement("option");
      opt.value=code; opt.textContent=this.LANG_NAMES[code];
      if(code===this.settings.lang) opt.selected=true;
      select.appendChild(opt);
    });
    select.addEventListener("change", ()=>{
      this.settings.lang = select.value;
      this._saveSettings();
      // update FAB label
      const b=document.getElementById(this.BUTTON_ID); if(b) b.textContent=this._t("btn_logs");
      // live refresh panel if open
      if(this._panelOpen){ this._closeLogsModal(); this._openLogsModal(); }
      BdApi.UI.showToast("Language: "+this.LANG_NAMES[this.settings.lang], {type:"success"});
    });

    const hint=document.createElement("div");
    hint.className="hint";
    hint.textContent="UI language applies to the Logs panel, tooltips and CSV headers.";

    row.appendChild(label); row.appendChild(select);
    wrap.appendChild(h); wrap.appendChild(row); wrap.appendChild(hint);
    return wrap;
  }

  /* ---------- Lifecycle ---------- */
  start(){
    this._load();
    this._loadSettings();
    this._injectStyle();
    this._grabModules();
    this._installClickSniffer();
    this._installHotkeys();
    this._startPolling();
    this._syncFabVisibility();
    this._startObserver();
    BdApi.UI.showToast(this._t("enabled_toast"),{type:"success"});
  }
  stop(){
    this._stopObserver();
    this._unmountFab();
    this._removeClickSniffer();
    this._removeHotkeys();
    if(this.pollInterval){ try{ clearInterval(this.pollInterval); }catch(e){} }
    this.pollInterval=null;
    try{ this.Patcher.unpatchAll(this.PLUGIN_NAME); }catch(e){}
    this._save();
    this._removeStyle();
    BdApi.UI.showToast(this._t("disabled_toast"),{type:"info"});
  }
};
