const MAL_LOGO_DATA_URL = "data:image/webp;base64,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";
const AL_LOGO_DATA_URL = "data:image/png;base64,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";



const state = { title:'', eps:'', score:9, cover:null, avatar:null, mal:null, status:'completed', source:'mal' };

// Carrega logo embutido automaticamente (MAL por padrão, AniList se source=anilist)
function loadSourceLogo(source) {
  const img = new Image();
  img.onload = () => { state.mal = img; render(); };
  img.src = source === 'anilist' ? AL_LOGO_DATA_URL : MAL_LOGO_DATA_URL;
}
loadSourceLogo('mal');

// Carrega dados do MAL salvos pelo background
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get('malStoryData', res => {
    const d = res.malStoryData;
    if (d && d.title) {
      state.title = d.title;
      state.eps   = d.episodes || '';
      if (d.score && d.score !== '0') {
        state.score = parseFloat(d.score);
        document.getElementById('inp-score').value = state.score;
        updateScore(state.score, false);
      }
      document.getElementById('inp-title').value = state.title;
      document.getElementById('inp-eps').value   = state.eps;
      const src = d.source === 'anilist' ? 'AniList' : 'MyAnimeList';
      document.getElementById('auto-banner').innerHTML = '✨ Dados carregados automaticamente do <strong>' + src + '</strong>. Edite se precisar.';
      document.getElementById('auto-banner').style.display = 'block';

      if (d.coverUrl) {
        document.getElementById('inp-cover-url').value = d.coverUrl;
        loadImgUrl(d.coverUrl, 'cover');
      }
      if (d.source) {
        state.source = d.source;
      }
      // Carrega foto de perfil do MAL automaticamente
      if (d.avatarUrl) {
        loadImgUrl(d.avatarUrl, 'avatar');
      }
      if (d.status) {
        state.status = d.status;
      }
      // Carrega logo correto baseado na fonte (MAL ou AniList)
      loadSourceLogo(d.source || 'mal');
      render();
    } else {
      render();
    }
  });
} else {
  render();
}

function statusIcon(status) {
  if (status === 'dropped')              return '✕';
  if (status === 'on_hold')              return '⏸';
  if (status === 'watching' || status === 'reading') return '▶';
  if (status === 'plan_to_watch')        return '📋';
  return '★'; // completed
}

function statusColor(status, score) {
  if (status === 'dropped')                          return '#ef4444';
  if (status === 'on_hold')                          return '#e2e8f0';
  if (status === 'watching' || status === 'reading') return '#4ade80';
  return scoreColor(score);
}

function scoreColor(s) {
  // Paleta metais — do ouro ao enferrujado
  if (s >= 10)  return '#facc15'; // ouro brilhante — (10) Masterpiece
  if (s >= 9)   return '#fde68a'; // ouro claro     — (9)  Great
  if (s >= 8)   return '#e2e8f0'; // prata clara    — (8)  Very Good
  if (s >= 7)   return '#94a3b8'; // prata escura   — (7)  Good
  if (s >= 6)   return '#cd7f32'; // bronze         — (6)  Fine
  if (s >= 5)   return '#a05c1e'; // cobre          — (5)  Average
  if (s >= 4)   return '#b45309'; // ferrugem clara — (4)  Bad
  if (s >= 3)   return '#92400e'; // ferrugem       — (3)  Very Bad
  if (s >= 2)   return '#7f1d1d'; // bordô          — (2)  Horrible
  return '#450a0a';               // bordô escuro   — (1)  Appalling
}

function updateScore(v, doRender=true) {
  state.score = parseFloat(v);
  document.getElementById('score-display').textContent = state.score;
  document.getElementById('score-val').textContent     = state.score;
  document.getElementById('score-val').style.color     = scoreColor(state.score);
  if (doRender) render();
}

function loadImgFile(input, key) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => { const img=new Image(); img.onload=()=>{state[key]=img;render();}; img.src=e.target.result; };
  r.readAsDataURL(f);
}

function loadImgUrl(url, key) {
  if (!url) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { state[key]=img; render(); };
  img.onerror = () => {
    // Tenta via fetch + blob para evitar tainted canvas
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const burl = URL.createObjectURL(blob);
        const img2 = new Image();
        img2.onload = () => { state[key]=img2; render(); };
        img2.src = burl;
      })
      .catch(() => {
        // Último recurso sem crossOrigin — canvas ficará tainted
        const img3 = new Image();
        img3.onload = () => { state[key]=img3; render(); };
        img3.src = url;
      });
  };
  img.src = url;
}

document.getElementById('inp-title').addEventListener('input', e=>{state.title=e.target.value;render();});
document.getElementById('inp-eps').addEventListener('input',   e=>{state.eps=e.target.value;render();});
document.getElementById('inp-score').addEventListener('input', e=>{updateScore(e.target.value);});

// ── Canvas ──
function drawRR(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function mTxt(ctx,txt,font){ctx.save();ctx.font=font;const w=ctx.measureText(txt).width;ctx.restore();return w;}
function wrapText(ctx,text,x,y,maxW,lh){
  const words=text.split(' '); let line='',ly=y;
  for(let i=0;i<words.length;i++){
    const test=line+(line?' ':'')+words[i];
    if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,x,ly);line=words[i];ly+=lh;}
    else line=test;
  }
  ctx.fillText(line,x,ly);
}

function drawCard(canvas) {
  const W=canvas.width, H=canvas.height, sc=W/270;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);

  // fundo
  if (state.cover) {
    ctx.save();
    ctx.filter=`blur(${6*sc}px) brightness(0.42) saturate(1.35)`;
    const pad=20*sc;
    const r=Math.max((W+pad*2)/state.cover.naturalWidth,(H+pad*2)/state.cover.naturalHeight);
    ctx.drawImage(state.cover,(W-state.cover.naturalWidth*r)/2,(H-state.cover.naturalHeight*r)/2,state.cover.naturalWidth*r,state.cover.naturalHeight*r);
    ctx.filter='none'; ctx.restore();
  } else { ctx.fillStyle='#0a0a0a'; ctx.fillRect(0,0,W,H); }

  // vinheta
  const vg=ctx.createRadialGradient(W/2,H/2,H*0.1,W/2,H/2,H*0.75);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

  // capa
  const cW=196*sc,cH=278*sc,cX=(W-cW)/2,cY=60*sc,cR=14*sc;
  ctx.save(); drawRR(ctx,cX,cY,cW,cH,cR); ctx.clip();
  if (state.cover) {
    const r=Math.max(cW/state.cover.naturalWidth,cH/state.cover.naturalHeight);
    ctx.drawImage(state.cover,cX+(cW-state.cover.naturalWidth*r)/2,cY+(cH-state.cover.naturalHeight*r)/2,state.cover.naturalWidth*r,state.cover.naturalHeight*r);
  } else { ctx.fillStyle='#1a1a2e'; ctx.fillRect(cX,cY,cW,cH); }
  ctx.restore();
  ctx.save(); drawRR(ctx,cX,cY,cW,cH,cR);
  const bv=ctx.createLinearGradient(cX,cY,cX+cW,cY+cH);
  bv.addColorStop(0,'rgba(255,255,255,0.12)'); bv.addColorStop(0.5,'rgba(255,255,255,0)'); bv.addColorStop(1,'rgba(0,0,0,0.25)');
  ctx.strokeStyle=bv; ctx.lineWidth=2*sc; ctx.stroke(); ctx.restore();

  // avatar
  const aR=30*sc,aX=W/2,aY=70*sc;
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=16*sc; ctx.shadowOffsetY=4*sc;
  ctx.beginPath(); ctx.arc(aX,aY,aR,0,Math.PI*2); ctx.fillStyle='#222'; ctx.fill();
  ctx.shadowColor='transparent';
  ctx.beginPath(); ctx.arc(aX,aY,aR,0,Math.PI*2); ctx.clip();
  if (state.avatar) {
    const r=Math.max((aR*2)/state.avatar.naturalWidth,(aR*2)/state.avatar.naturalHeight);
    ctx.drawImage(state.avatar,aX-state.avatar.naturalWidth*r/2,aY-state.avatar.naturalHeight*r/2,state.avatar.naturalWidth*r,state.avatar.naturalHeight*r);
  } else { ctx.fillStyle='#333'; ctx.fillRect(aX-aR,aY-aR,aR*2,aR*2); }
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(aX,aY,aR,0,Math.PI*2);
  const ar=ctx.createLinearGradient(aX-aR,aY-aR,aX+aR,aY+aR);
  ar.addColorStop(0,'rgba(255,255,255,0.35)'); ar.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.strokeStyle=ar; ctx.lineWidth=2.5*sc; ctx.stroke(); ctx.restore();

  // título
  ctx.save(); ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='rgba(0,0,0,0.95)'; ctx.shadowBlur=10*sc;
  ctx.font=`700 ${17*sc}px Montserrat, sans-serif`;
  wrapText(ctx,state.title||'—',W/2,358*sc,230*sc,22*sc); ctx.restore();

  // nota + eps — layout varia por status
  const mY=403*sc, sC=statusColor(state.status, state.score);
  const isCompleted = state.status === 'completed' || (!state.status);

  ctx.save(); ctx.textBaseline='middle';
  ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=6*sc;

  const icon     = statusIcon(state.status);
  const iconW    = mTxt(ctx, icon, `${16*sc}px sans-serif`);
  const g        = 10*sc, sep = 1*sc;

  if (isCompleted) {
    // ★ 9 /10 | 13 eps
    const nTxt = String(state.score);
    const nW   = mTxt(ctx, nTxt, `900 ${20*sc}px Cinzel, serif`);
    const dW   = mTxt(ctx, '/10', `700 ${11*sc}px Cinzel, serif`);
    const eW   = state.eps ? mTxt(ctx, state.eps, `700 ${13*sc}px Montserrat, sans-serif`) : 0;
    const tW   = iconW+4*sc+nW+2*sc+dW + (state.eps ? g+sep+g+eW : 0);
    let cx = (W-tW)/2;
    ctx.fillStyle=sC; ctx.font=`${16*sc}px sans-serif`; ctx.fillText(icon,cx,mY); cx+=iconW+4*sc;
    ctx.fillStyle=sC; ctx.font=`900 ${20*sc}px Cinzel, serif`; ctx.fillText(nTxt,cx,mY); cx+=nW+2*sc;
    ctx.fillStyle='rgba(255,255,255,0.32)'; ctx.font=`700 ${11*sc}px Cinzel, serif`;
    ctx.textBaseline='bottom'; ctx.fillText('/10',cx,mY+7*sc); ctx.textBaseline='middle'; cx+=dW;
    if (state.eps) {
      cx+=g; ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(cx,mY-8*sc,sep,16*sc); cx+=sep+g;
      ctx.fillStyle='rgba(255,255,255,0.48)'; ctx.font=`700 ${13*sc}px Montserrat, sans-serif`;
      ctx.fillText(state.eps,cx,mY);
    }
  } else {
    // ✕ Dropped · 6 | 5 eps   ou   ▶ Watching | 12/24 eps
    const statusLabels = { watching:'Watching', reading:'Reading', on_hold:'On Hold', dropped:'Dropped' };
    const label  = statusLabels[state.status] || state.status;
    const labelW = mTxt(ctx, label, `500 ${13*sc}px Montserrat, sans-serif`);
    const dotTxt = state.score > 0 ? ` · ${state.score}` : '';
    const dotW   = dotTxt ? mTxt(ctx, dotTxt, `400 ${12*sc}px Montserrat, sans-serif`) : 0;
    const eW     = state.eps ? mTxt(ctx, state.eps, `700 ${13*sc}px Montserrat, sans-serif`) : 0;
    const tW     = iconW+6*sc+labelW+dotW + (state.eps ? g+sep+g+eW : 0);
    let cx = (W-tW)/2;

    // ícone
    ctx.fillStyle=sC; ctx.font=`${15*sc}px sans-serif`; ctx.fillText(icon,cx,mY); cx+=iconW+6*sc;
    // label status
    ctx.fillStyle=sC; ctx.font=`500 ${13*sc}px Montserrat, sans-serif`; ctx.fillText(label,cx,mY); cx+=labelW;
    // · nota (se tiver)
    if (dotTxt) {
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font=`400 ${12*sc}px Montserrat, sans-serif`;
      ctx.fillText(dotTxt,cx,mY); cx+=dotW;
    }
    // | eps
    if (state.eps) {
      cx+=g; ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(cx,mY-8*sc,sep,16*sc); cx+=sep+g;
      ctx.fillStyle='rgba(255,255,255,0.48)'; ctx.font=`700 ${13*sc}px Montserrat, sans-serif`;
      ctx.fillText(state.eps,cx,mY);
    }
  }
  ctx.restore();

  // MAL badge
  const malY=H-38*sc;
  ctx.save(); ctx.textBaseline='middle';
  ctx.shadowColor='rgba(0,0,0,0.7)'; ctx.shadowBlur=4*sc;
  const ls=18*sc, wTxt=state.source==='anilist'?'AniList':'MyAnimeList';
  const wW=mTxt(ctx,wTxt,`400 ${12*sc}px Montserrat, sans-serif`);
  const lg=7*sc;
  const bTW=(state.mal?ls+lg:0)+wW;
  let bx=(W-bTW)/2;
  if (state.mal) {
    ctx.save(); ctx.beginPath();
    drawRR(ctx,bx,malY-ls/2,ls,ls,4*sc); ctx.clip();
    ctx.drawImage(state.mal,bx,malY-ls/2,ls,ls);
    ctx.restore(); bx+=ls+lg;
  }
  ctx.fillStyle='rgba(255,255,255,0.48)';
  ctx.font=`400 ${12*sc}px Montserrat, sans-serif`;
  ctx.fillText(wTxt,bx,malY); ctx.restore();
}

function render() {
  document.fonts.ready.then(()=>drawCard(document.getElementById('preview-canvas')));
}

async function download() {
  const btn=document.getElementById('btn-dl');
  btn.disabled=true; btn.textContent='Gerando…';
  try {
    await document.fonts.ready;
    const exp=document.createElement('canvas');
    exp.width=1080; exp.height=1920;
    drawCard(exp);
    exp.toBlob(function(blob) {
      if (!blob) { btn.disabled=false; btn.textContent='⬇ Baixar PNG (1080 × 1920)'; return; }
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=(state.title||'anime').replace(/[^\w\s\-]/g,'').trim().replace(/\s+/g,'-')+'_mal_story.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},5000);
      btn.disabled=false; btn.textContent='⬇ Baixar PNG (1080 × 1920)';
    },'image/png');
  } catch(e) {
    console.error('Download error:', e);
    btn.disabled=false; btn.textContent='⬇ Baixar PNG (1080 × 1920)';
    alert('Erro ao gerar: ' + e.message);
  }
}

render();

// Listeners para botões sem onclick inline
document.addEventListener('DOMContentLoaded', function() {
  var btnDl = document.getElementById('btn-dl');
  if (btnDl) btnDl.addEventListener('click', download);

  var btnLoadCover = document.getElementById('btn-load-cover');
  if (btnLoadCover) btnLoadCover.addEventListener('click', function() {
    loadImgUrl(document.getElementById('inp-cover-url').value, 'cover');
  });
});
