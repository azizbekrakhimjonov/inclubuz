/* ===========================================================
   In-Club IT Center — app.js
   =========================================================== */

/* ---- GOOGLE SHEETS ULANISHI ----
   Apps Script Web App URL ni shu yerga qo'ying (apps-script.gs ga qarang).
   Bo'sh bo'lsa, ariza brauzerda (localStorage) saqlanadi. */
const SHEETS_ENDPOINT = "";

/* ---------- mobile menu ---------- */
const body = document.body;
const toggle = document.getElementById('navToggle');
if (toggle){
  toggle.addEventListener('click', () => body.classList.toggle('menu-open'));
}
document.querySelectorAll('.mobile-menu a, .mobile-menu .btn').forEach(a => {
  a.addEventListener('click', () => body.classList.remove('menu-open'));
});

/* ---------- reveal on scroll (robust + fallback) ---------- */
const reveals = Array.from(document.querySelectorAll('.reveal'));
// per-card stagger index inside grids/lists
document.querySelectorAll('.courses-grid .course, .features-grid .feature, .steps .step, .why-list .why-item').forEach((el, i, list) => {
  const parent = el.parentElement;
  const idx = Array.from(parent.children).indexOf(el);
  el.style.setProperty('--i', idx);
});
function revealInView(){
  const vh = window.innerHeight || document.documentElement.clientHeight;
  reveals.forEach(el => {
    if (el.classList.contains('in')) return;
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add('in');
  });
}
requestAnimationFrame(() => requestAnimationFrame(revealInView));
window.addEventListener('scroll', revealInView, { passive:true });
window.addEventListener('resize', revealInView);
// safety net: never leave content hidden even if transitions are throttled
setTimeout(() => reveals.forEach(el => {
  if (getComputedStyle(el).opacity !== '1'){
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'none';
  }
}), 1600);

/* ---------- scroll progress bar + nav state ---------- */
const progress = document.getElementById('scrollProgress');
const navEl = document.querySelector('header.nav');
function onScroll(){
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
  if (progress) progress.style.width = pct + '%';
  if (navEl) navEl.classList.toggle('scrolled', h.scrollTop > 12);
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

/* ---------- count-up stats ---------- */
const counters = Array.from(document.querySelectorAll('[data-count]'));
let countersDone = false;
function runCounters(){
  if (countersDone) return;
  const hs = document.querySelector('.hero-stats');
  if (!hs) return;
  const r = hs.getBoundingClientRect();
  if (r.top > (window.innerHeight || 800) * 0.95) return;
  countersDone = true;
  counters.forEach(el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    function tick(now){
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  });
}
window.addEventListener('scroll', runCounters, { passive:true });
setTimeout(runCounters, 300);

/* ---------- course card 3D tilt + glow ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && window.matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.course').forEach(card => {
    const glow = card.querySelector('.cglow');
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -8;
      const ry = (px - 0.5) * 8;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (glow){ glow.style.setProperty('--mx', px*100 + '%'); glow.style.setProperty('--my', py*100 + '%'); }
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ---------- hero particle network ---------- */
(function heroNetwork(){
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, nodes = [], raf, mouse = { x:-999, y:-999 };
  const COUNT = 46, LINK = 132;

  function size(){
    const host = canvas.parentElement;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = host.clientWidth; h = host.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function init(){
    nodes = [];
    const n = Math.min(COUNT, Math.round(w / 26));
    for (let i = 0; i < n; i++){
      nodes.push({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-0.5)*0.32, vy:(Math.random()-0.5)*0.32 });
    }
  }
  function draw(){
    ctx.clearRect(0, 0, w, h);
    for (const p of nodes){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dmx = p.x - mouse.x, dmy = p.y - mouse.y;
      const dm = Math.hypot(dmx, dmy);
      if (dm < 120){ p.x += dmx/dm*0.6; p.y += dmy/dm*0.6; }
    }
    for (let i = 0; i < nodes.length; i++){
      for (let j = i+1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d < LINK){
          const o = (1 - d/LINK) * 0.5;
          ctx.strokeStyle = `rgba(77,139,255,${o})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of nodes){
      const near = Math.hypot(p.x-mouse.x, p.y-mouse.y) < 120;
      ctx.beginPath(); ctx.arc(p.x, p.y, near ? 2.6 : 1.8, 0, Math.PI*2);
      ctx.fillStyle = near ? 'rgba(33,217,106,0.9)' : 'rgba(150,170,210,0.7)';
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  function start(){ cancelAnimationFrame(raf); size(); init(); draw(); }
  const heroSection = canvas.closest('.hero');
  heroSection.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  heroSection.addEventListener('pointerleave', () => { mouse.x = -999; mouse.y = -999; });
  window.addEventListener('resize', () => { clearTimeout(window.__hnT); window.__hnT = setTimeout(start, 200); });
  start();
})();

/* ---------- duplicate marquee content for seamless loop ---------- */
(function(){
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;
})();

/* ---------- form ---------- */
const form = document.getElementById('regForm');
if (form){
  const submitBtn = document.getElementById('submitBtn');

  function validate(){
    let ok = true;
    form.querySelectorAll('.reg-body .field').forEach(f => {
      const input = f.querySelector('input, select');
      if (!input) return;
      f.classList.remove('invalid');
      if (!f.querySelector('.req')) return;
      let bad = !input.value.trim();
      if (input.name === 'telefon' && input.value.trim()){
        if (input.value.replace(/\D/g, '').length < 9) bad = true;
      }
      if (bad){ f.classList.add('invalid'); ok = false; }
    });
    return ok;
  }

  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => el.closest('.field')?.classList.remove('invalid'));
    el.addEventListener('change', () => el.closest('.field')?.classList.remove('invalid'));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()){
      form.querySelector('.invalid input, .invalid select')?.focus();
      return;
    }
    const data = {
      vaqt: new Date().toLocaleString('uz-UZ'),
      ism: form.ism.value.trim(),
      familiya: form.familiya.value.trim(),
      telefon: form.telefon.value.trim(),
      yonalish: form.yonalish.value,
      izoh: form.izoh.value.trim()
    };
    submitBtn.disabled = true;
    submitBtn.textContent = 'Yuborilmoqda...';
    try{
      if (SHEETS_ENDPOINT){
        await fetch(SHEETS_ENDPOINT, {
          method:'POST', mode:'no-cors',
          headers:{ 'Content-Type':'text/plain;charset=utf-8' },
          body: JSON.stringify(data)
        });
      } else {
        const all = JSON.parse(localStorage.getItem('inclub_arizalar') || '[]');
        all.push(data);
        localStorage.setItem('inclub_arizalar', JSON.stringify(all));
        await new Promise(r => setTimeout(r, 600));
      }
      form.classList.add('sent');
      form.scrollIntoView ? null : null;
    } catch(err){
      alert('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring yoki telefon orqali bog\'laning.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Arizani yuborish';
    }
  });
}

function inclubResetForm(){
  if (!form) return;
  form.reset();
  form.classList.remove('sent');
}
window.inclubResetForm = inclubResetForm;

/* ---------- footer year ---------- */
const yr = document.getElementById('year');
if (yr) yr.textContent = new Date().getFullYear();