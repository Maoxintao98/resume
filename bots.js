'use strict';
(() => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 每只只有身体和眼睛。高光已去掉。
  const SHAPES = {
    circle: {
      type: 'circle',
      eyes: [[40, 58, 9.4, 12.2], [60, 58, 9.4, 12.2]]
    },
    flower: {
      type: 'flower',
      eyes: [[41, 59, 8.6, 11.4], [59, 59, 8.6, 11.4]]
    },
    cloud: {
      body: 'M27 84C13 84 5 74 8 63C10 53 19 48 28 49C31 33 44 23 59 25C72 27 81 36 83 49C96 48 104 58 101 70C98 81 88 86 76 86C63 90 39 90 27 84Z',
      eyes: [[40, 61, 8.6, 11.2], [60, 61, 8.6, 11.2]]
    },
    diamond: {
      body: 'M50 8C54 8 58 11 61 17L89 53C97 63 94 80 84 90L60 109C54 113 46 113 40 109L16 90C6 80 3 63 11 53L39 17C42 11 46 8 50 8Z',
      eyes: [[41, 60, 8.4, 11], [59, 60, 8.4, 11]]
    },
    tri: {
      body: 'M50 8C55 8 59 12 62 18C70 35 80 55 89 73C95 85 90 104 75 104C62 110 38 110 25 104C10 104 5 85 11 73C20 55 30 35 38 18C41 12 45 8 50 8Z',
      eyes: [[41, 61, 8.4, 10.8], [59, 61, 8.4, 10.8]]
    },
    triTall: {
      body: 'M50 6C54 6 58 9 61 15C66 28 72 51 80 76C86 96 80 108 66 108H34C20 108 14 96 20 76C28 51 34 28 39 15C42 9 46 6 50 6Z',
      eyes: [[41, 67, 8, 10.4], [59, 67, 8, 10.4]]
    },
    triWide: {
      body: 'M50 14C54 14 58 17 61 23C70 38 82 58 92 76C97 86 92 99 80 99C62 104 38 104 20 99C8 99 3 86 8 76C18 58 30 38 39 23C42 17 46 14 50 14Z',
      eyes: [[40, 63, 8.4, 10.8], [60, 63, 8.4, 10.8]]
    },
    blob: {
      body: 'M50 6C72 4 90 23 92 47C94 72 83 101 57 105C32 109 8 94 6 67C4 41 17 12 38 7C42 6 46 6 50 6Z',
      eyes: [[40, 51, 9.2, 11.8], [62, 50, 9.2, 11.8]]
    },
    pill: {
      body: 'M50 6C74 6 88 20 88 44V65C88 93 73 106 50 106C27 106 12 93 12 65V44C12 20 26 6 50 6Z',
      eyes: [[40, 49, 9, 11.8], [60, 49, 9, 11.8]]
    }
  };

  const MOTION = {
    flower: 'flutter', cloud: 'squish', diamond: 'pulse',
    tri: 'sway', triTall: 'tremble', triWide: 'nod', pill: 'bob'
  };
  const rng = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647)(20261023);
  const fmt = n => Number(n.toFixed(1));
  const hash = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  };

  function bodyMarkup(s) {
    if (s.type === 'circle') return '<circle class="bot__body" cx="50" cy="60" r="47"/>';
    if (s.type === 'flower') {
      return `<g class="bot__body bot__flower">
        <circle cx="50" cy="33" r="19"/><circle cx="27" cy="50" r="18"/>
        <circle cx="35" cy="79" r="18"/><circle cx="65" cy="79" r="18"/>
        <circle cx="73" cy="50" r="18"/><circle cx="50" cy="61" r="25"/>
      </g>`;
    }
    return `<path class="bot__body" d="${s.body}"/>`;
  }

  function botSVG(cfg, id) {
    const s = SHAPES[cfg.shape] || SHAPES.circle;
    const inline = cfg.inline ? ' bot--inline' : '';
    const motion = cfg.motion || MOTION[cfg.shape] || 'bob';
    const wink = id % 5 === 2;
    const base = cfg.size || 22;
    const jitter = inline ? 1 : 0.78 + (hash(cfg.id || String(id)) % 55) / 100;
    const maxSize = 52;
    const size = inline ? base : Math.min(maxSize, Math.max(15, Math.round(base * jitter)));
    const style = [
      `--x:${cfg.x || '0%'}`, `--y:${cfg.y || '0%'}`, `--size:${size}px`,
      `--rot:${cfg.rot || 0}deg`, `--float:${cfg.float || 14}px`,
      `--dur:${cfg.dur || fmt(5 + rng() * 2)}s`, `--delay:${fmt(-rng() * 6)}s`,
      `--blink-delay:${fmt(-rng() * 7)}s`, `--wink-delay:${fmt(-rng() * 8)}s`,
      `--stagger:${(id % 7) * 70}`
    ].join(';');
    return `<svg class="bot bot--${cfg.shape || 'circle'} bot--${cfg.tone || 'ink'} bot--motion-${motion}${inline}" data-bot="${cfg.id}" style="${style}" viewBox="0 0 100 120" aria-hidden="true" focusable="false">
      <g class="bot__rig">
        ${bodyMarkup(s)}
        <g class="bot__face">
          <g class="bot__eyes">
            <ellipse class="bot__eye" cx="${s.eyes[0][0]}" cy="${s.eyes[0][1]}" rx="${s.eyes[0][2]}" ry="${s.eyes[0][3]}"/>
            <ellipse class="bot__eye${wink ? ' bot__eye--wink' : ''}" cx="${s.eyes[1][0]}" cy="${s.eyes[1][1]}" rx="${s.eyes[1][2]}" ry="${s.eyes[1][3]}"/>
          </g>
        </g>
      </g>
    </svg>`;
  }

  const SQUADS = [
    { host: '.portrait-stage', name: 'hero', bots: [
      { shape: 'flower', tone: 'butter', size: 28, x: '98%', y: '28%', rot: 7, motion: 'flutter' }
    ]},
    { host: '.portrait-stage', name: 'hero-peek', bots: [
      { shape: 'tri', tone: 'grape', size: 34, x: '62%', y: '-5%', rot: 4, motion: 'peek' }
    ]},
    { host: '.closing', name: 'closing', bots: [
      { shape: 'circle', tone: 'butter', size: 24, x: '20%', y: '52%', rot: -5, motion: 'jump' },
      { shape: 'cloud', tone: 'sky', size: 26, x: '80%', y: '70%', rot: -6, motion: 'lean' }
    ]}
  ];

  SQUADS.forEach(squad => {
    const host = document.querySelector(squad.host);
    if (!host) return;
    host.classList.add('has-bots');
    const wrap = document.createElement('div');
    wrap.className = `bot-squad squad--${squad.name}`;
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = squad.bots.map((cfg, i) => botSVG({ ...cfg, id: `${squad.name}-${i}` }, i)).join('');
    host.appendChild(wrap);
    if (squad.name === 'frame') host.classList.add('has-actor');
  });

  // 时间线每个节点一只，站在竖线左侧，不压线。
  const timelineNodeBots = [
    { shape: 'flower', tone: 'coral', size: 20, motion: 'jump' },
    { shape: 'circle', tone: 'butter', size: 18, motion: 'pulse' },
    { shape: 'cloud', tone: 'sky', size: 19, motion: 'squish' },
    { shape: 'diamond', tone: 'mint', size: 19, motion: 'barrel' }
  ];
  document.querySelectorAll('.timeline li').forEach((li, i) => {
    const cfg = timelineNodeBots[i % timelineNodeBots.length];
    const wrap = document.createElement('span');
    wrap.className = 'timeline-node';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = botSVG({ ...cfg, x: '-10px', y: '10px', rot: i % 2 ? 4 : -4, id: `timeline-node-${i}` }, i);
    li.appendChild(wrap);
  });

  const notes = [...document.querySelectorAll('.note')];
  const noteBots = [
    { shape: 'flower', tone: 'coral', size: 26, x: '48%', y: '-3%', rot: 3, motion: 'jump' },
    { shape: 'cloud', tone: 'butter', size: 24, x: '52%', y: '-4%', rot: -6, motion: 'squish' },
    { shape: 'diamond', tone: 'mint', size: 26, x: '50%', y: '-3%', rot: 5, motion: 'twist' }
  ];
  notes.forEach((note, i) => {
    note.classList.add('has-bots');
    const wrap = document.createElement('div');
    wrap.className = `bot-squad squad--notes squad--note-${i + 1}`;
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = botSVG({ ...noteBots[i % 3], id: `note-${i}` }, i);
    note.appendChild(wrap);
  });

  // 作品卡的上边，各坐一只负责看片的小家伙。
  const workCardBots = [
    { shape: 'flower', tone: 'butter', size: 21, rot: 4, motion: 'wobble' },
    { shape: 'cloud', tone: 'mint', size: 19, rot: -5, motion: 'flutter' },
    { shape: 'diamond', tone: 'coral', size: 21, rot: 5, motion: 'barrel' }
  ];
  [...document.querySelectorAll('.work-card')].forEach((card, i) => {
    card.classList.add('has-bots');
    const wrap = document.createElement('div');
    wrap.className = 'bot-squad squad--work-card';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = botSVG({ ...workCardBots[i % workCardBots.length], x: '50%', y: '-8%', id: `work-card-${i}` }, i);
    card.appendChild(wrap);
  });

  const bots = [...document.querySelectorAll('.bot')];
  const visible = new Set();
  const rects = new Map();
  let rectsDirty = true;

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const bot = entry.target;
        if (entry.isIntersecting) {
          visible.add(bot);
          rectsDirty = true;
          if (!bot.dataset.awake) {
            bot.dataset.awake = '1';
            const delay = Number(bot.style.getPropertyValue('--stagger')) || 0;
            setTimeout(() => bot.classList.add('is-awake'), delay);
          } else {
            bot.classList.add('is-awake');
          }
          bot.classList.remove('is-offscreen');
        } else {
          visible.delete(bot);
          if (bot.dataset.awake) bot.classList.add('is-offscreen');
        }
      });
    }, { rootMargin: '80px 0px', threshold: 0.01 });
    bots.forEach(bot => io.observe(bot));
  } else {
    bots.forEach(bot => { bot.classList.add('is-awake'); visible.add(bot); });
  }

  // 视线跟随：只处理视口内的小家伙，并按帧节流。
  let px = innerWidth / 2, py = innerHeight / 2, gazeFrame = 0;
  const refreshRects = () => { rectsDirty = true; };
  window.addEventListener('scroll', () => { refreshRects(); lean(); }, { passive: true });
  window.addEventListener('resize', refreshRects, { passive: true });

  function applyGaze() {
    gazeFrame = 0;
    if (rectsDirty) {
      rects.forEach((_, bot) => { if (!visible.has(bot)) rects.delete(bot); });
      visible.forEach(bot => rects.set(bot, bot.getBoundingClientRect()));
      rectsDirty = false;
    }
    visible.forEach(bot => {
      const r = rects.get(bot);
      if (!r) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = px - cx, dy = py - cy;
      const dist = Math.hypot(dx, dy);
      const k = clamp(1 - dist / 460, 0, 1);
      const ex = clamp(dx / 80, -1, 1) * 2.6 * k;
      const ey = clamp(dy / 80, -1, 1) * 2.2 * k;
      bot.style.setProperty('--eye-x', `${fmt(ex)}px`);
      bot.style.setProperty('--eye-y', `${fmt(ey)}px`);
    });
  }

  window.addEventListener('pointermove', event => {
    if (reduceMotion.matches || event.pointerType === 'touch') return;
    px = event.clientX; py = event.clientY;
    if (!gazeFrame) gazeFrame = requestAnimationFrame(applyGaze);
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    visible.forEach(bot => {
      bot.style.setProperty('--eye-x', '0px');
      bot.style.setProperty('--eye-y', '0px');
    });
  });

  // 滚动时整页轻轻倾一下，像一群小家伙一起探头。
  let lastY = scrollY, leanTimer = 0;
  function lean() {
    if (reduceMotion.matches) return;
    const dy = scrollY - lastY;
    lastY = scrollY;
    const value = `${clamp(dy * .12, -2.6, 2.6).toFixed(2)}deg`;
    document.body.style.setProperty('--page-lean', value);
    clearTimeout(leanTimer);
    leanTimer = setTimeout(() => document.body.style.setProperty('--page-lean', '0deg'), 160);
  }

  // 轻点时弹一下。
  document.addEventListener('pointerdown', event => {
    if (reduceMotion.matches) return;
    const bot = event.target.closest('.bot');
    if (!bot) return;
    bot.classList.remove('is-hopping');
    void bot.getBoundingClientRect();
    bot.classList.add('is-hopping');
    clearTimeout(bot._hopTimer);
    bot._hopTimer = setTimeout(() => bot.classList.remove('is-hopping'), 520);
  });

  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('bots-paused', document.hidden);
  });

  // 主家伙：点击时蹲一下，换台词时气泡弹一下。
  const friend = document.getElementById('friend');
  if (friend) {
    friend.addEventListener('pointerdown', () => {
      if (reduceMotion.matches) return;
      friend.classList.remove('is-bouncing');
      void friend.getBoundingClientRect();
      friend.classList.add('is-bouncing');
      setTimeout(() => friend.classList.remove('is-bouncing'), 650);
    });
  }
  const bubble = document.getElementById('friend-speech');
  if (bubble && 'MutationObserver' in window) {
    new MutationObserver(() => {
      bubble.classList.remove('is-popping');
      void bubble.offsetWidth;
      bubble.classList.add('is-popping');
      setTimeout(() => bubble.classList.remove('is-popping'), 340);
    }).observe(bubble, { childList: true, characterData: true, subtree: true });
  }

  if (reduceMotion.matches) document.documentElement.classList.add('bots-still');
  reduceMotion.addEventListener?.('change', event => {
    document.documentElement.classList.toggle('bots-still', event.matches);
    if (!event.matches) bots.forEach(bot => bot.classList.add('is-awake'));
  });
})();
