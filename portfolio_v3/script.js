// ============ HELPERS ============
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const D = DATA; // all content comes from data.js
const iconUrl = (name) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;

// ============ NAVBAR ============
// Logo text + menu links
function renderNavbar() {
  $('#ini').textContent = D.initials;
  $('#sh').textContent = D.short;
  // hideOnMobile: pages left out of the phone menu; Contact only shows on phones
  const pages = [
    ['Home'], ['About', 'desk'], ['Skills'], ['Experience'],
    ['Projects'], ['Education', 'desk'], ['Contact', 'mob'],
  ];
  $('#links').innerHTML =
    '<button class="mclose" aria-label="Close menu">✕ Close</button>' +
    pages.map(([p, cls = '']) => `<a class="${cls}" href="#${p.toLowerCase()}">${p}</a>`).join('');
}

// ============ HOME ============
// Name, role, intro, buttons, photo, location, stats
function renderHero() {
  const words = D.name.split(' ');
  $('#hname').innerHTML = words
    .map((w, i) => `<span class="${i ? 'a' : ''}">${w}</span>`)
    .join('');
  $('#r1').textContent = D.role;
  $('#r2').textContent = D.roleAccent;
  $('#intro').innerHTML = D.intro;
  $('#cv').href = D.cv;
  $('#photo').src = D.photo;
  $('#loc').textContent = D.location;
  $('#mode').textContent = D.mode;
  $('#stats').innerHTML = D.stats
    .map(([number, label]) => `<div><b>${number}</b><small>${label}</small></div>`)
    .join('');
}

// Logos placed in a circle around the profile photo
function renderFloatingIcons() {
  const total = D.floating.length;
  $('#orbit').innerHTML = D.floating
    .map((name, i) => {
      const angle = (i / total) * Math.PI * 2;
      const left = 50 + 50 * Math.cos(angle);
      const top = 50 + 50 * Math.sin(angle);
      return `<img src="${iconUrl(name)}" alt="${name}"
        style="left:calc(${left}% - 26px); top:calc(${top}% - 26px); animation-delay:0s,${i * 0.4}s">`;
    })
    .join('');
}

// Tilted moving band (content is doubled for a seamless loop)
function renderMarquee() {
  const items = D.marquee
    .map((m) => `<span>${m.toUpperCase()}</span><span>✦</span>`)
    .join('');
  $('#marquee').innerHTML = items + items;
}

// ============ ABOUT ============
// Heading, text card and small side cards
function renderAbout() {
  const A = D.about;
  $('#abT').innerHTML = `${A.title} <span class="hi">${A.accent}</span>`;
  $('#abCard').innerHTML =
    `<h3>${A.lead}</h3>` + A.paras.map((p) => `<p>${p}</p>`).join('');
  $('#abSide').innerHTML = A.cards
    .map(([label, value], i) => `
      <div class="card">
        <div class="ic">${i ? '🎓' : '📍'}</div>
        <small>${label}</small><b>${value}</b>
      </div>`)
    .join('');
}

// The hanging ID card content
function renderIdCard() {
  const B = D.about.badge;
  $('#idc').innerHTML = `
    <img src="${D.photo}">
    <b>${D.name}</b>
    <small>${B.title}</small>
    <div class="bar"></div>
    <div style="display:flex;justify-content:space-between;font:11px 'JetBrains Mono'">
      <span>${B.id}</span><span>${B.city}</span>
    </div>
    <div class="ow" style="margin-top:8px">Open to work</div>`;
}

// "Right now" list with live Lahore clock
function renderRightNow() {
  const rows = D.about.now
    .map(([label, value]) => `<div class="row"><span>${label}</span><b>${value}</b></div>`)
    .join('');
  $('#nowList').innerHTML =
    `<div class="row"><span>Local time · Lahore</span><b class="clk" id="clk"></b></div>` + rows;
  setInterval(updateClock, 1000);
}

// Updates the clock text every second
function updateClock() {
  const time = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi' });
  $('#clk').textContent = time + ' PKT';
}

// Rope + draggable card: sways on its own, stretches when pulled, swings back on release
function setupHangingCard() {
  const card = $('#idc');
  const rope = $('#rope path');
  const box = $('#lany');
  const ROPE_LENGTH = 150;
  let x = 0, y = 0, vx = 0, vy = 0;
  let dragging = false, hovering = false, startX, startY;

  card.insertAdjacentHTML('beforeend', '<span class="pull">Pull me ↓</span>');

  // Redraws rope curve and moves/tilts the card
  function draw() {
    const mid = box.clientWidth / 2;
    const stretch = hovering || dragging ? 1.04 : 1;
    rope.setAttribute('d', `M${mid} 0 Q ${mid + x * 0.3} ${(ROPE_LENGTH + y) * 0.6} ${mid + x} ${ROPE_LENGTH + y}`);
    card.style.transform = `translate(${x}px,${y}px) rotate(${x * 0.1}deg) scaleY(${stretch})`;
  }

  // Spring physics: gentle left-right sway when idle, pulls back when released
  function animate(time) {
    if (!dragging) {
      const sway = Math.sin(time / 900) * 22;
      vx += (sway - x) * 0.05;
      vy += -y * 0.06;
      vx *= 0.94;
      vy *= 0.92;
      x += vx;
      y += vy;
    }
    draw();
    requestAnimationFrame(animate);
  }

  card.addEventListener('pointerdown', (e) => {
    dragging = true;
    card.classList.add('grab');
    startX = e.clientX - x;
    startY = e.clientY - y;
    card.setPointerCapture(e.pointerId);
  });
  card.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    x = Math.sign(e.clientX - startX) * Math.min(Math.abs(e.clientX - startX), 120);
    y = Math.min(Math.max(-30, e.clientY - startY), 150);
  });
  function release() {
    dragging = false;
    card.classList.remove('grab');
    vx = vy = 0;
  }
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);
  card.addEventListener('pointerenter', () => (hovering = true));
  card.addEventListener('pointerleave', () => (hovering = false));

  requestAnimationFrame(animate);
}

// ============ SKILLS ============
// Shows the logo cards of one category
function showSkills(category) {
  $('#tabs').innerHTML = Object.keys(D.skills)
    .map((name) => `<button class="${name === category ? 'on' : ''}">${name}</button>`)
    .join('');
  $('#skillGrid').innerHTML = D.skills[category]
    .map(([label, icon], i) => `
      <div class="sk" style="animation-delay:${i * 60}ms">
        ${icon.startsWith('~') ? `<span class="emo">${icon.slice(1)}</span>` : `<img src="${iconUrl(icon)}" alt="${label}">`}${label}
      </div>`)
    .join('');
  $$('#tabs button').forEach((btn) => {
    btn.onclick = () => showSkills(btn.textContent);
  });
}

// ============ EXPERIENCE ============
function renderExperience() {
  $('#exp').innerHTML = D.experience
    .map((job) => `
      <div class="card rv">
        <div class="top"><h3>${job.title} <span>${job.sub}</span></h3><span class="pill">${job.date}</span></div>
        <div class="org">${job.org}</div>
        <ul>${job.points.map((p) => `<li>${p}</li>`).join('')}</ul>
        <div class="tags">${job.tags.map((t) => `<span>${t}</span>`).join('')}</div>
      </div>`)
    .join('');
}

// ============ PROJECTS ============
function renderProjects() {
  const button = (url, label) =>
    url
      ? `<a class="lbtn" href="${url}" target="_blank" rel="noopener">${label}</a>`
      : `<span class="lbtn off" aria-disabled="true" title="Link not added yet">${label}</span>`;
  $('#proj').innerHTML = D.projects
    .map((p, i) => `
      <div class="card rv">
        <span class="pn">0${i + 1}</span><span class="pt">${p.tag}</span>
        <h3>${p.name}</h3><p>${p.desc}</p>
        <div class="tags">${p.tech.map((t) => `<span>${t}</span>`).join('')}</div>
        <div class="plinks">${button(p.live, 'Live ↗')}${button(p.github, 'GitHub ⌥')}</div>
      </div>`)
    .join('');
}

// ============ EDUCATION ============
function renderEducation() {
  $('#edu').innerHTML = D.education
    .map((e) => `
      <div class="card rv">
        <div class="ic">${e.icon}</div><h3>${e.name}</h3><p>${e.desc}</p>
        <span class="pill">${e.date}</span>
      </div>`)
    .join('');
  $('#certs').innerHTML = D.certs
    .map(([title, place]) => `<div class="card c rv"><b>🏅 ${title}</b><small>${place}</small></div>`)
    .join('');
}

// ============ CONTACT ============
// Contact links + form that opens the email app
function renderContact() {
  const C = D.contact;
  const items = [
    ['✉', 'Email', C.email, 'mailto:' + C.email],
    ['☎', 'Phone', C.phone, 'tel:' + C.phone],
    ['in', 'LinkedIn', C.linkedin, 'https://' + C.linkedin],
    ['⌥', 'GitHub', C.github, 'https://' + C.github],
  ];
  $('#cl').innerHTML = items
    .map(([icon, label, value, href]) => `
      <a class="cl" href="${href}" target="_blank">
        <span class="ic" style="background:#fff;color:#14532d">${icon}</span>
        <div><small>${label}</small><b>${value}</b></div>
      </a>`)
    .join('');

  $('#form').onsubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(e.target.s.value);
    const body = encodeURIComponent(e.target.m.value);
    location.href = `mailto:${C.email}?subject=${subject}&body=${body}`;
  };
}

// ============ PAGE BEHAVIOUR ============
// Light / dark mode switch
function setupTheme() {
  const root = document.documentElement;
  const button = $('#theme');
  const apply = (theme) => {
    root.dataset.theme = theme;
    button.textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  apply(matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  button.onclick = () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark');
}

// Top progress bar + active menu link while scrolling
function setupScroll() {
  const sections = [...$$('section')];
  addEventListener('scroll', () => {
    const scrolled = scrollY / (document.body.scrollHeight - innerHeight);
    $('#progress').style.width = scrolled * 100 + '%';
    const current = sections.filter((s) => s.getBoundingClientRect().top < 200).pop();
    $$('nav a').forEach((a) => a.classList.toggle('on', current && a.hash === '#' + current.id));
  });
  $('#top').onclick = () => scrollTo({ top: 0 });
}

// Fade-in cards when they enter the screen
function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
    { threshold: 0.15 }
  );
  $$('.rv').forEach((el) => observer.observe(el));
}

// CV preview window (iframe) with download button
function setupCvPreview() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="cvModal">
      <div class="mbox">
        <div class="mbar"><b>CV Preview</b>
          <span><a class="lbtn" href="${D.cv}" download>Download</a><button class="lbtn" id="cvClose">✕ Close</button></span>
        </div>
        <iframe id="cvFrame" title="CV preview"></iframe>
      </div>
    </div>`);
  const modal = $('#cvModal');
  const close = () => { modal.classList.remove('show'); $('#cvFrame').src = ''; document.body.style.overflow = ''; };
  $('#cv').onclick = (e) => {
    e.preventDefault();
    $('#cvFrame').src = D.cv;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  $('#cvClose').onclick = close;
  modal.onclick = (e) => e.target === modal && close();
  addEventListener('keydown', (e) => e.key === 'Escape' && close());
}

// Mobile menu: open with button, close with Close button, link tap or tap outside
function setupMenu() {
  const menu = $('#links');
  const button = $('#menu');
  const setOpen = (open) => {
    menu.classList.toggle('open', open);
    button.textContent = open ? '✕' : '☰';
  };
  button.onclick = () => setOpen(!menu.classList.contains('open'));
  $('.mclose').onclick = () => setOpen(false);
  $$('#links a').forEach((a) => (a.onclick = () => setOpen(false)));
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !button.contains(e.target)) setOpen(false);
  });
  addEventListener('scroll', () => setOpen(false), { passive: true });
}

// ============ START ============
renderNavbar();
setupMenu();
setupCvPreview();
renderHero();
renderFloatingIcons();
renderMarquee();
renderAbout();
renderIdCard();
renderRightNow();
setupHangingCard();
showSkills('Web & MERN');
renderExperience();
renderProjects();
renderEducation();
renderContact();
setupTheme();
setupScroll();
setupReveal();
