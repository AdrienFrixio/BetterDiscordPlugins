/**
 * @name UsersLastConnection
 * @author Frixio
 * @version 0.0.1
 * @description Displays on profiles if users are online, or if not, the time since their last connection.
 * @license MIT
 */

module.exports = (() => {
  const PLUGIN = "UsersLastConnection";

  // ===== i18n: status sentences =============================================
  const I18N = {
    en:{online:"{username} is online",last:"Last seen {duration} ago",unknown:"Last seen unknown",units:{d:"d",h:"h",m:"min"}},
    fr:{online:"{username} est en ligne",last:"Dernière connexion il y a {duration}",unknown:"Dernière connexion inconnue",units:{d:"j",h:"h",m:"min"}},
    es:{online:"{username} está en línea",last:"Última conexión hace {duration}",unknown:"Última conexión desconocida",units:{d:"d",h:"h",m:"min"}},
    pt:{online:"{username} está online",last:"Último acesso há {duration}",unknown:"Último acesso desconhecido",units:{d:"d",h:"h",m:"min"}},
    de:{online:"{username} ist online",last:"Zuletzt online vor {duration}",unknown:"Zuletzt online: unbekannt",units:{d:"T",h:"Std",m:"Min"}},
    ru:{online:"{username} в сети",last:"Был(а) в сети {duration} назад",unknown:"Последний визит: неизвестно",units:{d:"д",h:"ч",m:"мин"}},
    ar:{online:"{username} متصل",last:"آخر ظهور منذ {duration}",unknown:"آخر ظهور غير معروف",units:{d:"ي",h:"س",m:"د"}},
    hi:{online:"{username} ऑनलाइन है",last:"आखिरी बार {duration} पहले",unknown:"आखिरी बार: अज्ञात",units:{d:"दि",h:"घं",m:"मि"}},
    bn:{online:"{username} অনলাইনে আছেন",last:"সর্বশেষ দেখা {duration} আগে",unknown:"সর্বশেষ দেখা: অজানা",units:{d:"দ",h:"ঘ",m:"মি"}},
    ja:{online:"{username} はオンライン",last:"最終オンライン {duration} 前",unknown:"最終オンライン: 不明",units:{d:"日",h:"時間",m:"分"}},
    "zh-CN":{online:"{username} 在线",last:"上次在线 {duration} 前",unknown:"上次在线：未知",units:{d:"天",h:"小时",m:"分钟"}},
    it:{online:"{username} è online",last:"Ultimo accesso {duration} fa",unknown:"Ultimo accesso sconosciuto",units:{d:"g",h:"h",m:"min"}},
    tr:{online:"{username} çevrimiçi",last:"Son görülme {duration} önce",unknown:"Son görülme: bilinmiyor",units:{d:"g",h:"s",m:"dk"}}
  };
  const LANG_LIST = [
    ["en","English"],["fr","Français"],["es","Español"],["pt","Português"],["de","Deutsch"],
    ["ru","Русский"],["ar","العربية"],["hi","हिन्दी"],["bn","বাংলা"],["ja","日本語"],
    ["zh-CN","简体中文"],["it","Italiano"],["tr","Türkçe"]
  ];

  // ===== i18n: settings UI strings ==========================================
  const UI = {
    en:{languageTitle:"Language", languageSubtitle:"Choose a language for the connection status sentence.", previewTitle:"Preview",
        toastLangUpdated:"Language updated", toastStarted:"Started.", toastError:"Error"},
    fr:{languageTitle:"Langue", languageSubtitle:"Choisissez la langue de la phrase de statut de connexion.", previewTitle:"Aperçu",
        toastLangUpdated:"Langue mise à jour", toastStarted:"Démarré.", toastError:"Erreur"},
    es:{languageTitle:"Idioma", languageSubtitle:"Elige el idioma de la frase de estado de conexión.", previewTitle:"Vista previa",
        toastLangUpdated:"Idioma actualizado", toastStarted:"Iniciado.", toastError:"Error"},
    pt:{languageTitle:"Idioma", languageSubtitle:"Escolha o idioma da frase de status de conexão.", previewTitle:"Pré-visualização",
        toastLangUpdated:"Idioma atualizado", toastStarted:"Iniciado.", toastError:"Erro"},
    de:{languageTitle:"Sprache", languageSubtitle:"Wähle die Sprache für den Verbindungsstatus-Satz.", previewTitle:"Vorschau",
        toastLangUpdated:"Sprache aktualisiert", toastStarted:"Gestartet.", toastError:"Fehler"},
    ru:{languageTitle:"Язык", languageSubtitle:"Выберите язык текста статуса подключения.", previewTitle:"Предпросмотр",
        toastLangUpdated:"Язык обновлён", toastStarted:"Запущено.", toastError:"Ошибка"},
    ar:{languageTitle:"اللغة", languageSubtitle:"اختر لغة جملة حالة الاتصال.", previewTitle:"معاينة",
        toastLangUpdated:"تم تحديث اللغة", toastStarted:"تم التشغيل.", toastError:"خطأ"},
    hi:{languageTitle:"भाषा", languageSubtitle:"कनेक्शन स्थिति वाक्य की भाषा चुनें.", previewTitle:"पूर्वावलोकन",
        toastLangUpdated:"भाषा अपडेट हुई", toastStarted:"शुरू हो गया.", toastError:"त्रुटि"},
    bn:{languageTitle:"ভাষা", languageSubtitle:"সংযোগ স্থিতি বাক্যের ভাষা নির্বাচন করুন।", previewTitle:"প্রিভিউ",
        toastLangUpdated:"ভাষা আপডেট হয়েছে", toastStarted:"শুরু হয়েছে।", toastError:"ত্রুটি"},
    ja:{languageTitle:"言語", languageSubtitle:"接続ステータス文の言語を選択してください。", previewTitle:"プレビュー",
        toastLangUpdated:"言語を更新しました", toastStarted:"開始しました。", toastError:"エラー"},
    "zh-CN":{languageTitle:"语言", languageSubtitle:"选择连接状态句子的语言。", previewTitle:"预览",
        toastLangUpdated:"语言已更新", toastStarted:"已启动。", toastError:"错误"},
    it:{languageTitle:"Lingua", languageSubtitle:"Scegli la lingua della frase di stato di connessione.", previewTitle:"Anteprima",
        toastLangUpdated:"Lingua aggiornata", toastStarted:"Avviato.", toastError:"Errore"},
    tr:{languageTitle:"Dil", languageSubtitle:"Bağlantı durumu cümlesi için dili seçin.", previewTitle:"Önizleme",
        toastLangUpdated:"Dil güncellendi", toastStarted:"Başlatıldı.", toastError:"Hata"}
  };

  // ===== CSS (profil + settings) ============================================
  const CSS = `
    /* Profil */
    .ulc-container{margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--background-modifier-accent)}
    .ulc-line{font-size:12px;line-height:1.35;opacity:1}
    .ulc-line.online{font-weight:600} /* couleur appliquée en JS */

    /* Settings */
    .ulc-settings{padding:16px;display:grid;gap:16px}
    .ulc-card{background:var(--background-secondary);border:1px solid var(--background-modifier-accent);border-radius:12px;padding:14px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
    .ulc-card h3{margin:0 0 8px;font-size:14px;font-weight:800;color:var(--header-primary);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
    .ulc-sub{margin-top:-2px;margin-bottom:10px;color:var(--header-secondary);font-size:12px}

    /* Bouton langue — bleu #5461E5 + bordure 3px */
    .ulc-dd{position:relative;width:280px}
    .ulc-dd-btn{width:100%;display:flex;align-items:center;justify-content:space-between;background:#5461E5;color:#fff;border:3px solid #5461E5;border-radius:10px;padding:10px 12px;cursor:pointer;user-select:none;box-shadow:0 6px 16px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.06);transition:filter .12s ease,transform .02s ease}
    .ulc-dd-btn:hover{filter:brightness(1.06)} .ulc-dd-btn:active{transform:translateY(1px)} .ulc-dd-btn:focus{outline:2px solid #fff;outline-offset:1px}
    .ulc-dd-arrow{opacity:.88;margin-left:10px}

    /* Menu langues lisible partout */
    .ulc-dd-menu{position:fixed;left:0;top:0;width:280px;max-height:260px;overflow:auto;background:#ffffff!important;color:#000!important;border:1px solid rgba(0,0,0,.15)!important;border-radius:10px;box-shadow:0 12px 28px rgba(0,0,0,.25);z-index:1000000;-webkit-font-smoothing:antialiased}
    .ulc-dd-item{padding:9px 12px;cursor:pointer;white-space:nowrap;color:#111!important}
    .ulc-dd-item:hover,.ulc-dd-item[aria-selected="true"]{background:#f2f3f5!important;color:#000!important}

    /* Séparateur blanc + preview style */
    .ulc-sep{height:1px;background:#ffffff;opacity:.25;border-radius:1px;margin:14px 0 10px}
    .ulc-previewTitle{margin:0 0 8px;font-size:14px;font-weight:800;color:var(--header-primary);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
    .ulc-preview{padding:8px 10px;border-radius:10px;background:var(--background-secondary);border:1px solid var(--background-modifier-accent)}
  `;

  // ===== helpers: toasts + color/contrast ===================================
  const toast = (msg,type="info") => { try{ BdApi.UI.showToast(`[${PLUGIN}] ${msg}`,{type}); }catch{} };
  const clamp = (n,min,max)=>Math.min(max,Math.max(min,n));

  function parseColor(str){
    if(!str) return null;
    str = String(str).trim().toLowerCase();
    if(str === "transparent") return {r:0,g:0,b:0,a:0};
    const hex = str.match(/^#([0-9a-f]{3,8})$/i);
    if(hex){
      let h = hex[1];
      if(h.length===3) h = h.split("").map(c=>c+c).join("");
      if(h.length===6) return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:1};
      if(h.length===8) return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:parseInt(h.slice(6,8),16)/255};
    }
    const rgb = str.match(/^rgba?\(([^)]+)\)$/);
    if(rgb){
      const p = rgb[1].split(",").map(s=>s.trim());
      const r = parseFloat(p[0]); const g = parseFloat(p[1]); const b = parseFloat(p[2]);
      const a = p[3] != null ? parseFloat(p[3]) : 1;
      return {r,g,b,a:isNaN(a)?1:a};
    }
    return null;
  }
  function blend(fg,bg){ const a = clamp(fg.a ?? 1, 0, 1); return { r: fg.r*a + bg.r*(1-a), g: fg.g*a + bg.g*(1-a), b: fg.b*a + bg.b*(1-a) }; }
  function effectiveBackground(el){
    let base = {r:43,g:45,b:49}; // fallback dark
    let node = el;
    const seen = new Set();
    while(node && node instanceof Element && !seen.has(node)){
      seen.add(node);
      const cs = getComputedStyle(node);
      const bgc = parseColor(cs.backgroundColor);
      if(bgc && (bgc.a ?? 1) > 0){
        base = bgc.a >= 1 ? {r:bgc.r,g:bgc.g,b:bgc.b} : blend(bgc, base);
      }
      node = node.parentElement;
    }
    return base;
  }
  function srgbToLin(c){ c/=255; return c<=0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }
  function luminance(rgb){ return 0.2126*srgbToLin(rgb.r)+0.7152*srgbToLin(rgb.g)+0.0722*srgbToLin(rgb.b); }
  function contrast(c1,c2){ const L1 = luminance(c1), L2 = luminance(c2); const [a,b] = L1>L2?[L1,L2]:[L2,L1]; return (a+0.05)/(b+0.05); }
  const rgbCss = (r,g,b)=>`rgb(${Math.round(clamp(r,0,255))}, ${Math.round(clamp(g,0,255))}, ${Math.round(clamp(b,0,255))})`;

  // Try a green ramp; fallback to BW to reach AAA (>=7:1)
  function bestReadableGreen(bg){
    const light = {r:129,g:246,b:169};
    const dark  = {r:18,g:105,b:63};
    let best = light, bestC = contrast(light, bg);
    for(let i=0;i<=24;i++){
      const t=i/24;
      const c={r:light.r*(1-t)+dark.r*t, g:light.g*(1-t)+dark.g*t, b:light.b*(1-t)+dark.b*t};
      const cr=contrast(c,bg);
      if(cr>bestC){ bestC=cr; best=c; }
    }
    if(bestC >= 7) return best;
    const black={r:0,g:0,b:0}, white={r:255,g:255,b:255};
    return contrast(black,bg) > contrast(white,bg) ? black : white;
  }
  function bestReadableBW(bg){
    const black={r:0,g:0,b:0}, white={r:255,g:255,b:255};
    return contrast(black,bg) > contrast(white,bg) ? black : white;
  }
  function haloFor(textRGB){
    const light = luminance(textRGB) > 0.5;
    const s1 = light ? "rgba(0,0,0,.85)" : "rgba(255,255,255,.9)";
    const s2 = light ? "rgba(0,0,0,.55)" : "rgba(255,255,255,.55)";
    return `0 0 1px ${s1}, 0 0 4px ${s2}, 0 0 8px ${s2}`;
  }
  function applyAdaptiveColors(root){
    if(!root) return;
    const bg = effectiveBackground(root);
    root.querySelectorAll(".ulc-line").forEach(node=>{
      const isOn = node.classList.contains("online");
      const col = isOn ? bestReadableGreen(bg) : bestReadableBW(bg);
      node.style.setProperty("color", rgbCss(col.r,col.g,col.b), "important");
      node.style.textShadow = haloFor(col);
    });
  }

  // ===== dropdown UI (menu blanc/texte noir) ================================
  function createDropdown(items, value, onChange){
    const wrap=document.createElement("div"); wrap.className="ulc-dd";
    let open=false, menu=null;

    const btn=document.createElement("button"); btn.type="button"; btn.className="ulc-dd-btn";
    btn.setAttribute("aria-haspopup","listbox"); btn.setAttribute("aria-expanded","false");

    const text=document.createElement("span");
    const arrow=document.createElement("span"); arrow.className="ulc-dd-arrow"; arrow.textContent="▾";
    btn.appendChild(text); btn.appendChild(arrow);

    function labelOf(v){ const f=items.find(([val])=>val===v); return f?f[1]:String(v); }
    function positionMenu(){ if(!menu) return;
      const r=btn.getBoundingClientRect(), w=r.width;
      const left=Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
      const top=Math.min(r.bottom+6, window.innerHeight-8);
      menu.style.width=`${w}px`; menu.style.left=`${left}px`; menu.style.top=`${top}px`; }
    function renderMenu(){ menu.innerHTML=""; items.forEach(([v,lbl])=>{
      const it=document.createElement("div"); it.className="ulc-dd-item"; it.setAttribute("role","option");
      it.setAttribute("aria-selected", v===value ? "true":"false"); it.textContent=lbl;
      it.onclick=()=>{ value=v; text.textContent=labelOf(value); closeMenu(); onChange?.(value); };
      menu.appendChild(it);
    }); }
    function openMenu(){ if(open) return; menu=document.createElement("div"); menu.className="ulc-dd-menu";
      document.body.appendChild(menu); renderMenu(); positionMenu(); open=true; btn.setAttribute("aria-expanded","true");
      setTimeout(()=>{ window.addEventListener("mousedown", onDoc,{capture:true}); window.addEventListener("keydown", onKey,{capture:true});
        window.addEventListener("resize", positionMenu); window.addEventListener("scroll", positionMenu,{passive:true}); },0); }
    function closeMenu(){ if(!open) return; open=false; btn.setAttribute("aria-expanded","false");
      window.removeEventListener("mousedown", onDoc,{capture:true}); window.removeEventListener("keydown", onKey,{capture:true});
      window.removeEventListener("resize", positionMenu); window.removeEventListener("scroll", positionMenu,{passive:true});
      menu?.remove(); menu=null; }
    function onDoc(e){ if(!wrap.contains(e.target) && !menu?.contains(e.target)) closeMenu(); }
    function onKey(e){ if(e.key==="Escape") closeMenu(); }

    btn.onclick=()=>open?closeMenu():openMenu();
    text.textContent=labelOf(value);

    wrap.appendChild(btn);
    return { element:wrap, setValue:(v)=>{ value=v; text.textContent=labelOf(v); }, getValue:()=>value, close:closeMenu };
  }

  // ===== Webpack env =========================================================
  function getEnv(){
    let StatusStore=null, UserStore=null, Dispatcher=null, React=BdApi.React;
    if(global.ZeresPluginLibrary){
      const {WebpackModules,DiscordModules}=global.ZeresPluginLibrary;
      StatusStore = WebpackModules.findByProps?.("getStatus","isMobileOnline")||null;
      UserStore   = WebpackModules.findByProps?.("getUser","getCurrentUser")||null;
      Dispatcher  = DiscordModules?.Dispatcher||null;
      React       = DiscordModules?.React||React;
    }
    if(!StatusStore||!UserStore||!Dispatcher){
      const WP=BdApi.Webpack;
      StatusStore = StatusStore || WP.getModule(m=>m?.getStatus&&m?.isMobileOnline)||null;
      UserStore   = UserStore   || WP.getModule(m=>m?.getUser&&m?.getCurrentUser)||null;
      Dispatcher  = Dispatcher  || WP.getModule(m=>m?.dispatch&&m?.subscribe&&m?.unsubscribe&&!m?._actionHandlers)||null;
    }
    return {StatusStore,UserStore,Dispatcher,React};
  }

  // ===== Plugin ==============================================================
  class UsersLastConnection{
    constructor(){
      this.env=getEnv();
      this.nodes=new Map();
      this.lastSeen={};
      this.statusCache=new Map();
      this._mo=null; this._scanLoop=null; this._tick=null; this._presenceCb=null;
      this.settings={ tickSeconds:30, lang:"en" }; // EN by default
      try{ const s=BdApi.Data.load(PLUGIN,"settings"); if(s&&typeof s==="object") this.settings={...this.settings,...s}; }catch{}
    }
    getName(){ return PLUGIN; }
    getAuthor(){ return "Frixio"; }
    getVersion(){ return "0.0.1"; }
    getDescription(){ return "Instant status on popout/profile + last-seen counter. Language selectable (default English). Diagnostics (Ctrl+Alt+U)."; }

    // Settings panel (localized)
    getSettingsPanel(){
      const el=document.createElement("div"); el.className="ulc-settings";
      const strings = UI[this.settings.lang] || UI.en;

      const card=document.createElement("div"); card.className="ulc-card";
      const title=document.createElement("h3"); title.textContent=strings.languageTitle; card.appendChild(title);
      const sub=document.createElement("div"); sub.className="ulc-sub"; sub.textContent=strings.languageSubtitle; card.appendChild(sub);

      const dd=createDropdown(
        LANG_LIST.map(([code,name])=>[code, `${name} (${code})`]),
        this.settings.lang,
        (val)=>{ this.settings.lang=val; this._saveSettings(); this._refreshAll(); renderTexts(); toast((UI[val]||UI.en).toastLangUpdated,"success"); }
      );
      card.appendChild(dd.element);

      const sep=document.createElement("div"); sep.className="ulc-sep"; card.appendChild(sep);

      const previewTitle=document.createElement("div"); previewTitle.className="ulc-previewTitle"; card.appendChild(previewTitle);
      const preview=document.createElement("div"); preview.className="ulc-preview"; card.appendChild(preview);

      const renderTexts=()=>{
        const s = UI[this.settings.lang] || UI.en;
        title.textContent = s.languageTitle;
        sub.textContent   = s.languageSubtitle;
        previewTitle.textContent = s.previewTitle;

        const lang = this.settings.lang in I18N ? this.settings.lang : "en";
        const pack = I18N[lang];
        const me   = this.env.UserStore?.getCurrentUser?.();
        const myName = me?.username || (lang==="fr" ? "Moi" : "Me");
        const online = pack.online.replace("{username}", myName);
        const dur    = this._fmtLocalized(135*60*1000, lang);
        const last   = pack.last.replace("{duration}", dur);
        preview.innerHTML = `<div class="ulc-line online">${this._esc(online)}</div><div class="ulc-line">${this._esc(last)}</div>`;
        applyAdaptiveColors(preview);
      };
      renderTexts();

      el.appendChild(card);
      return el;
    }

    // lifecycle
    start(){
      try{
        this.env=getEnv();
        BdApi.DOM.addStyle(PLUGIN, CSS);
        this._loadData();
        this._subscribePresence();
        this._startObservers();
        this._startScanLoop();
        this._startTick();
        const s = UI[this.settings.lang] || UI.en;
        toast(s.toastStarted,"success");
      }catch(e){ const s = UI[this.settings.lang] || UI.en; toast(s.toastError,"error"); }
    }
    stop(){
      try{
        this._stopTick(); this._stopScanLoop(); this._stopObservers(); this._unsubscribePresence();
        for(const el of this.nodes.keys()) el?.remove?.(); this.nodes.clear();
        BdApi.DOM.removeStyle(PLUGIN); this._saveData();
      }catch{}
    }

    // presence
    _subscribePresence(){
      const D=this.env.Dispatcher; if(!D) return;
      this._presenceCb=(payload)=>{
        try{
          const ids=this._extractIds(payload); if(!ids.size) return;
          for(const id of ids){
            const status=this._getStatus(id,payload); const prev=this.statusCache.get(id)??"unknown";
            this.statusCache.set(id,status);
            if(this._isOffline(status)&&!this._isOffline(prev)){ this.lastSeen[id]=Date.now(); this._saveDataDebounced(); }
          }
          this._refreshFor(ids);
        }catch{}
      };
      ["PRESENCE_UPDATE","PRESENCE_UPDATES","SELF_PRESENCE_UPDATE"].forEach(ev=>{ try{ D.subscribe(ev,this._presenceCb); }catch{} });
    }
    _unsubscribePresence(){
      const D=this.env.Dispatcher; if(!D||!this._presenceCb) return;
      ["PRESENCE_UPDATE","PRESENCE_UPDATES","SELF_PRESENCE_UPDATE"].forEach(ev=>{ try{ D.unsubscribe(ev,this._presenceCb); }catch{} });
      this._presenceCb=null;
    }
    _extractIds(p){
      const ids=new Set(); if(!p) return ids;
      if(p.userId) ids.add(String(p.userId));
      if(p.user?.id) ids.add(String(p.user.id));
      if(p.users) for(const k of Object.keys(p.users)) ids.add(String(k));
      if(Array.isArray(p.updates)) for(const u of p.updates){ if(u?.user?.id) ids.add(String(u.user.id)); if(u?.userId) ids.add(String(u.userId)); }
      return ids;
    }

    // DOM injection — ***version qui marchait chez toi***
    _startObservers(){
      const selectors=[
        'div[class*="userPopout"]','div[class*="userProfileModal"]','div[class*="userProfileInner"]',
        'div[class*="overlay-"][class*="userProfile"]','div[role="dialog"] div[class*="userProfile"]',
        'section[class*="userProfile"]','div[class*="profile"]','div[class*="userPanel"]','div[id^="popout_"] div[class*="profile"]'
      ];
      const tryInject=(root)=>{
        try{
          if(this._looksProfile(root)) this._injectOnce(root);
          const all=root.querySelectorAll?.(selectors.join(","))||[];
          for(const el of all) this._injectOnce(el);
        }catch{}
      };
      tryInject(document.body);
      this._mo=new MutationObserver(muts=>{
        for(const m of muts){
          for(const n of m.addedNodes){ if(n.nodeType===1) tryInject(n); }
          for(const n of m.removedNodes){
            if(n.nodeType!==1) continue;
            if(this.nodes.has(n)) this.nodes.delete(n);
            n.querySelectorAll?.(".ulc-container[data-ulc-root='1']")?.forEach(el=>this.nodes.delete(el));
          }
        }
      });
      this._mo.observe(document.body,{childList:true,subtree:true});
    }
    _stopObservers(){ if(this._mo){ this._mo.disconnect(); this._mo=null; } }
    _startScanLoop(){ this._scanLoop=setInterval(()=>{ try{ this._scanNow(); }catch{} },2000); }
    _stopScanLoop(){ if(this._scanLoop){ clearInterval(this._scanLoop); this._scanLoop=null; } }
    _scanNow(){ this._findAllProfileRoots().forEach(r=>this._injectOnce(r)); }
    _findAllProfileRoots(){
      const qs=[
        'div[class*="userPopout"]','div[class*="userProfileModal"]','div[class*="userProfileInner"]',
        'div[class*="overlay-"][class*="userProfile"]','div[role="dialog"] div[class*="userProfile"]',
        'section[class*="userProfile"]','div[class*="profile"]','div[class*="userPanel"]','div[id^="popout_"] div[class*="profile"]'
      ];
      const set=new Set(); qs.forEach(sel=>document.querySelectorAll(sel).forEach(el=>set.add(el))); return [...set];
    }
    _looksProfile(el){ if(!(el instanceof Element)) return false; const c=`${el.className||""}`; return /userPopout|userProfile|profile/i.test(c); }
    _injectOnce(root){
      if(!root||(root.nodeType!==1)) return;
      if(root.querySelector?.(".ulc-container[data-ulc-root='1']")) return;
      const userId=this._findUserId(root); if(!userId) return;
      const blk=document.createElement("div"); blk.className="ulc-container"; blk.setAttribute("data-ulc-root","1");
      const target=root.querySelector('div[class*="body-"], div[class*="bodyInner-"], div[class*="userPopout"], div[class*="profile"]')||root;
      target.appendChild(blk);
      this.nodes.set(blk,userId);
      this._renderOne(blk,userId);
    }
    _findUserId(root){
      const img=root.querySelector('img[src*="/avatars/"], img[src*="/banners/"]');
      const src=img?.getAttribute("src")||""; const m1=src.match(/\/avatars\/(\d+)\//); const m2=src.match(/\/banners\/(\d+)\//);
      if(m1?.[1]) return m1[1]; if(m2?.[1]) return m2[1];
      const a=root.querySelector('a[href*="/users/"]'); const href=a?.getAttribute("href")||""; const m3=href.match(/\/users\/(\d+)/); if(m3?.[1]) return m3[1];
      const attrId=root.getAttribute("data-user-id"); if(attrId) return attrId;
      const fiber=this._getFiber(root); const probe=this._scanFiberForUserId(fiber); if(probe) return probe; return null;
    }
    _getFiber(node){ if(!node) return null; for(const k of Object.keys(node)) if(k.startsWith("__reactFiber$")||k.startsWith("__reactInternalInstance$")) return node[k]; return null; }
    _scanFiberForUserId(fiber){ try{ let f=fiber,steps=0; while(f&&steps<200){ const p=f.memoizedProps||f.pendingProps;
      const u=p?.user||p?.children?.props?.user; const id=u?.id||p?.userId||p?.profileUserId; if(id) return String(id); f=f.return; steps++; } }catch{} return null; }

    // render
    _renderOne(el,userId){
      const lang=I18N[this.settings.lang]?this.settings.lang:"en";
      const pack=I18N[lang];
      const username=this.env.UserStore?.getUser?.(userId)?.username ?? (lang==="en"?"This user":"User");
      const status=this._getStatus(userId);
      const online=!this._isOffline(status);
      if(online){
        el.innerHTML=`<div class="ulc-line online">${this._esc(pack.online.replace("{username}",username))}</div>`;
      }else{
        const ts=this.lastSeen[userId];
        const text = ts ? pack.last.replace("{duration}", this._fmtLocalized(Date.now()-ts, lang)) : pack.unknown;
        el.innerHTML=`<div class="ulc-line">${this._esc(text)}</div>`;
      }
      applyAdaptiveColors(el);
    }
    _refreshFor(ids){ for(const [el,uid] of this.nodes.entries()) if(ids.has(uid)) this._renderOne(el,uid); }
    _refreshAll(){ for(const [el,uid] of this.nodes.entries()) this._renderOne(el,uid); }

    _startTick(){ const ms=Math.max(5,Number(this.settings.tickSeconds)||30)*1000; this._tick=setInterval(()=>this._refreshAll(),ms); }
    _stopTick(){ if(this._tick){ clearInterval(this._tick); this._tick=null; } }

    _getStatus(userId,payloadMaybe){
      try{
        if(payloadMaybe){
          if(payloadMaybe.status) return payloadMaybe.status;
          if(payloadMaybe.user?.status) return payloadMaybe.user.status;
          if(payloadMaybe.users && payloadMaybe.users[userId]?.status) return payloadMaybe.users[userId].status;
        }
        return this.env.StatusStore?.getStatus?.(userId) ?? "unknown";
      }catch{ return "unknown"; }
    }
    _isOffline(s){ return !s || s==="offline" || s==="invisible" || s==="unknown"; }
    _fmtLocalized(ms,lang){
      if(ms<0) ms=0;
      const mins=Math.floor(ms/60000), d=Math.floor(mins/1440), h=Math.floor((mins-d*1440)/60), m=mins%60;
      const u=(I18N[lang]||I18N.en).units; const parts=[];
      if(d>0) parts.push(`${d} ${u.d}`); if(h>0) parts.push(`${h} ${u.h}`); parts.push(`${m} ${u.m}`);
      return parts.join(" ");
    }
    _esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

    _loadData(){ try{ const obj=BdApi.Data.load(PLUGIN,"lastSeen"); if(obj && typeof obj==="object") this.lastSeen=obj; }catch{ this.lastSeen={}; } }
    _saveData(){ try{ BdApi.Data.save(PLUGIN,"lastSeen",this.lastSeen); }catch{} }
    _saveDataDebounced(){ clearTimeout(this._saveDebounce); this._saveDebounce=setTimeout(()=>this._saveData(),400); }
    _saveSettings(){ try{ BdApi.Data.save(PLUGIN,"settings",this.settings); }catch{} }
  }

  return UsersLastConnection;
})();
