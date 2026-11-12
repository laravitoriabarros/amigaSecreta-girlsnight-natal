// Desenha a feira de Natal em aquarela (6 camadas SVG, viewBox 1600x700),
// os ramos de pinheiro dos cantos e as estrelinhas douradas.
(function () {
  // Aleatório com semente fixa: a cena fica sempre igual.
  let semente = 1224;
  const rnd = () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const R = (a, b) => a + rnd() * (b - a);
  const escolher = (lista) => lista[Math.floor(rnd() * lista.length)];
  const n = (v) => +v.toFixed(1);

  const VINHO = '#a3182a', VERM = '#c4454a', OURO = '#c9973f', OURO_CLARO = '#f6d58a';
  const VERDE = '#6f8a63', VERDE_ESC = '#4f6b4c', NEVE = '#fffdf8', TINTA = '#4a3a36';
  const BASE = 575; // linha onde os prédios encontram a praça

  /* ============ Peças ============ */
  function fachada(x, w, h, cor, telhado) {
    const y = BASE - h;
    let s = `<rect x="${n(x + w * 0.22)}" y="${y - 40}" width="8" height="18" fill="#c59a88"/><rect x="${n(x + w * 0.22 - 2)}" y="${y - 43}" width="12" height="4" rx="2" fill="${NEVE}"/>
      <rect x="${n(x + w * 0.7)}" y="${y - 36}" width="7" height="14" fill="#c59a88"/><rect x="${n(x + w * 0.7 - 2)}" y="${y - 39}" width="11" height="4" rx="2" fill="${NEVE}"/>
      <polygon points="${x + 1},${y} ${x + 7},${y - 24} ${x + w - 7},${y - 24} ${x + w - 1},${y}" fill="${telhado}"/>
      <rect x="${x + 4}" y="${y - 29}" width="${w - 8}" height="8" rx="4" fill="${NEVE}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}"/>
      <rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="5" rx="2" fill="${NEVE}"/>`;
    const cols = Math.max(2, Math.floor(w / 24)), linhas = Math.floor((h - 26) / 31), passo = w / cols;
    for (let c = 0; c < cols; c++) {
      s += `<rect x="${n(x + passo * (c + 0.5) - 4)}" y="${y - 19}" width="8" height="11" rx="4" fill="${rnd() < 0.4 ? OURO_CLARO : '#fff'}" opacity=".8"/>`;
      for (let l = 0; l < linhas; l++) {
        const acesa = rnd() < 0.42;
        s += `<rect x="${n(x + passo * (c + 0.5) - 4.5)}" y="${y + 13 + l * 31}" width="9" height="17" rx="4" fill="${acesa ? OURO_CLARO : '#fff'}" opacity="${acesa ? 1 : 0.5}"/>`;
      }
    }
    return s;
  }

  function pinheiro(x, base, s, luzes) {
    let t = `<g transform="translate(${x},${base}) scale(${s})"><rect x="-4" y="-10" width="8" height="12" fill="#7a5a44"/>`;
    for (let k = 0; k < 4; k++) {
      const l = 31 - 6.5 * k, y = -8 - 21 * k;
      t += `<path d="M${-l} ${y} Q${-l / 2} ${y + 8} 0 ${y + 2} Q${l / 2} ${y + 8} ${l} ${y} L0 ${y - 36}Z" fill="${k % 2 ? VERDE : VERDE_ESC}"/>
            <path d="M${n(-l * 0.72)} ${y - 5} Q${n(-l * 0.3)} ${y - 13} 0 ${y - 35} Q${n(l * 0.22)} ${y - 17} ${n(l * 0.5)} ${y - 9} Q${n(l * 0.05)} ${y - 15} ${n(-l * 0.72)} ${y - 5}Z" fill="${NEVE}" opacity=".93"/>`;
    }
    if (luzes) {
      [[-18, -12, VINHO], [6, -9, OURO], [19, -14, VINHO], [-11, -33, OURO], [9, -31, VINHO], [-6, -53, VINHO], [7, -51, OURO], [0, -72, OURO]].forEach(([px, py, cor]) => {
        t += `<circle cx="${px}" cy="${py}" r="2.6" fill="${cor}"/>`;
      });
      let estrela = '';
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 3.4 : 8.5, a = (Math.PI / 5) * i - Math.PI / 2;
        estrela += `${n(r * Math.cos(a))},${n(-109 + r * Math.sin(a))} `;
      }
      t += `<circle cx="0" cy="-109" r="20" fill="url(#brilho-lampada)"/><polygon points="${estrela}" fill="${OURO}"/>`;
    }
    return t + '</g>';
  }

  function barraca(x, base, s) {
    let b = `<g transform="translate(${x},${base}) scale(${s})">
      <ellipse cx="110" cy="4" rx="130" ry="10" fill="#fbe3b5" opacity=".7"/>
      <rect x="10" y="-96" width="200" height="96" fill="${VERM}"/>
      <rect x="22" y="-92" width="176" height="50" fill="url(#vitrine)"/>
      <path d="M22 -66 h176" stroke="#b9772f" stroke-width="2"/>`;
    for (let i = 0; i < 10; i++) {
      const a = R(8, 17), l = R(8, 14), px = 28 + i * 17 + R(0, 3);
      b += `<rect x="${n(px)}" y="${n(-44 - a)}" width="${n(l)}" height="${n(a)}" rx="2" fill="${escolher(['#c98a4b', '#b8323a', '#e0a04f', '#8a5a3c', '#f7ead6'])}"/>`;
      if (i % 2) b += `<circle cx="${n(px + 4)}" cy="-73" r="${n(R(4, 6))}" fill="${escolher(['#c98a4b', '#b8323a', '#e0a04f'])}"/>`;
    }
    b += `<rect x="10" y="-42" width="200" height="42" fill="#b03038"/>`;
    for (let i = 1; i < 10; i++) b += `<path d="M${10 + i * 20} -40 V0" stroke="#8f1f2a" stroke-width="1.5" opacity=".6"/>`;
    b += `<rect x="4" y="-47" width="212" height="8" rx="4" fill="${NEVE}"/>`;
    for (let i = 0; i < 10; i++) b += `<path d="M${n(14 + i * 19.2)} -98 h19.2 v7 a9.6 9.6 0 0 1 -19.2 0z" fill="${i % 2 ? '#f7ead6' : VINHO}"/>`;
    b += `<polygon points="10,-96 110,-148 210,-96" fill="${VERM}"/>
      <polygon points="-8,-93 110,-154 228,-93 228,-99 110,-160 -8,-99" fill="${VINHO}"/>
      <path d="M-13 -98 L110 -162 L233 -98" fill="none" stroke="${NEVE}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 -100 Q62 -104 100 -128 M200 -100 Q158 -104 120 -128" fill="none" stroke="${VERDE}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="110" cy="-121" r="12" fill="none" stroke="${VERDE_ESC}" stroke-width="7"/>
      <path d="M110 -110 l-9 -6 v12z M110 -110 l9 -6 v12z" fill="${VINHO}"/><circle cx="110" cy="-110" r="2.6" fill="${VINHO}"/>
      <rect x="-4" y="-4" width="228" height="8" rx="4" fill="${NEVE}"/>
    </g>`;
    return b;
  }

  function poste(x, base, s, laco) {
    return `<g transform="translate(${x},${base}) scale(${s})">
      <circle cx="0" cy="-140" r="42" fill="url(#brilho-lampada)"/>
      <path d="M-7 0 h14 l-3 -12 h-8z" fill="${TINTA}"/><rect x="-2.3" y="-126" width="4.6" height="116" fill="${TINTA}"/>
      <rect x="-4.5" y="-62" width="9" height="4" rx="2" fill="${TINTA}"/><rect x="-6" y="-129" width="12" height="4" rx="2" fill="${TINTA}"/>
      <polygon points="-9,-153 9,-153 6.5,-129 -6.5,-129" fill="#ffe9a8" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="-12,-153 0,-165 12,-153" fill="${TINTA}"/><ellipse cx="0" cy="-161" rx="8" ry="3.4" fill="${NEVE}"/><circle cx="0" cy="-167" r="2" fill="${TINTA}"/>
      ${laco ? `<path d="M0 -96 q-16 -12 -17 0 q1 11 17 0 q16 -12 17 0 q-1 11 -17 0 M-2 -95 l-8 18 l6 -3 l3 5z M2 -95 l8 18 l-6 -3 l-3 5z" fill="${VINHO}"/><circle cx="0" cy="-96" r="3.4" fill="#8f1f2a"/>` : ''}
    </g>`;
  }

  const presente = (x, base, w, a, cor, fita) => `<rect x="${x}" y="${base - a}" width="${w}" height="${a}" rx="2" fill="${cor}"/><rect x="${x + w / 2 - 2.5}" y="${base - a}" width="5" height="${a}" fill="${fita}"/>
    <path d="M${x + w / 2} ${base - a} q-9 -11 -11 -2 q4 4 11 2 q9 -11 11 -2 q-4 4 -11 2" fill="${fita}"/><rect x="${x - 1}" y="${base - a - 2}" width="${w + 2}" height="4" rx="2" fill="${NEVE}"/>`;

  /* ============ Camada 1: fundo (prédios ao longe) ============ */
  let fundo = `<defs>
    <filter id="aquarela" x="-2%" y="-4%" width="104%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="r"/><feDisplacementMap in="SourceGraphic" in2="r" scale="5"/></filter>
    <radialGradient id="brilho-lampada"><stop offset="0" stop-color="#ffe6a0" stop-opacity=".85"/><stop offset="1" stop-color="#ffe6a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="lavado-pessego"><stop offset="0" stop-color="#f6d3bd" stop-opacity=".75"/><stop offset="1" stop-color="#f6d3bd" stop-opacity="0"/></radialGradient>
    <radialGradient id="lavado-lilas"><stop offset="0" stop-color="#dcd2e6" stop-opacity=".8"/><stop offset="1" stop-color="#dcd2e6" stop-opacity="0"/></radialGradient>
    <radialGradient id="lavado-ouro"><stop offset="0" stop-color="#fbe2b0" stop-opacity=".8"/><stop offset="1" stop-color="#fbe2b0" stop-opacity="0"/></radialGradient>
    <linearGradient id="vitrine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c9"/><stop offset="1" stop-color="#f5c468"/></linearGradient>
    <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#eee6ee"/></linearGradient>
  </defs><g filter="url(#aquarela)">
    <ellipse cx="300" cy="430" rx="460" ry="230" fill="url(#lavado-pessego)"/><ellipse cx="1310" cy="420" rx="460" ry="240" fill="url(#lavado-lilas)"/><ellipse cx="800" cy="540" rx="420" ry="130" fill="url(#lavado-ouro)"/>`;

  // Prédio com cúpula (esquerda)
  fundo += `<g><rect x="30" y="${BASE - 250}" width="225" height="250" fill="#f1cbbd"/>
    <rect x="92" y="${BASE - 296}" width="100" height="48" fill="#eac0b2"/>
    <path d="M80 ${BASE - 294} Q142 ${BASE - 420} 204 ${BASE - 294}Z" fill="#a9b4c4"/>
    <path d="M92 ${BASE - 300} Q112 ${BASE - 372} 142 ${BASE - 386} Q128 ${BASE - 340} 126 ${BASE - 300}Z" fill="${NEVE}" opacity=".9"/>
    <rect x="132" y="${BASE - 398}" width="20" height="26" fill="#eac0b2"/><path d="M128 ${BASE - 396} Q142 ${BASE - 420} 156 ${BASE - 396}Z" fill="#a9b4c4"/><path d="M142 ${BASE - 408} v-34" stroke="#8a93a3" stroke-width="2.5"/>
    <rect x="24" y="${BASE - 254}" width="237" height="8" rx="4" fill="${NEVE}"/><rect x="86" y="${BASE - 300}" width="112" height="7" rx="3.5" fill="${NEVE}"/>`;
  for (let c = 0; c < 7; c++) {
    fundo += `<rect x="${44 + c * 30}" y="${BASE - 226}" width="6" height="226" fill="#fff" opacity=".35"/>`;
    for (let l = 0; l < 5; l++) fundo += `<rect x="${55 + c * 30}" y="${BASE - 222 + l * 44}" width="11" height="24" rx="5.5" fill="${rnd() < 0.5 ? OURO_CLARO : '#fff'}" opacity=".85"/>`;
  }
  for (let c = 0; c < 4; c++) fundo += `<rect x="${103 + c * 22}" y="${BASE - 286}" width="10" height="26" rx="5" fill="${OURO_CLARO}"/>`;
  fundo += '</g>';

  // Fileiras de fachadas que diminuem em direção ao centro
  const esquerda = [[262, 92, 236, '#ecd9df'], [356, 82, 204, '#f6dcc6'], [440, 72, 172, '#e9d6e0'], [514, 62, 144, '#f3cdbd'], [578, 52, 118, '#ecd9df'], [632, 44, 96, '#f6dcc6'], [678, 36, 78, '#e9d6e0']];
  const coresDir = ['#e2dbe8', '#efd8cf', '#dfd9e6', '#f1dccb', '#e2dbe8', '#efd8cf', '#dfd9e6'];
  esquerda.forEach(([x, w, h, cor], i) => {
    const o = n(1 - i * 0.07);
    fundo += `<g opacity="${o}">${fachada(x, w, h, cor, '#a9b4c4')}</g><g opacity="${o}">${fachada(1600 - x - w, w, h, coresDir[i], '#9aa6b8')}</g>`;
  });
  fundo += `<g>${fachada(1344, 232, 292, '#e4dde8', '#8e9bb0')}</g>`;

  // Fim da praça: barraquinhas e gente bem ao longe
  fundo += `<path d="M560 ${BASE + 3} H1040" stroke="#b9a59a" stroke-width="2" stroke-dasharray="3 7" opacity=".7"/>`;
  [716, 752, 826, 862].forEach((x) => (fundo += `<g opacity=".6">${barraca(x, BASE + 2, 0.14)}</g>`));
  fundo += '</g>';

  /* ============ Camada 2: trem ============ */
  const roda = (x, r) => `<g class="roda"><circle cx="${x}" cy="${-r}" r="${r}" fill="${TINTA}" stroke="${OURO}" stroke-width="2"/><line x1="${x - r}" y1="${-r}" x2="${x + r}" y2="${-r}" stroke="${OURO}" stroke-width="1.5"/></g>`;
  const vagao = (x, cor) => `<g transform="translate(${x},0)"><rect x="108" y="-22" width="12" height="4" fill="${TINTA}"/>
      <rect x="0" y="-66" width="110" height="50" rx="6" fill="${cor}"/><rect x="0" y="-30" width="110" height="5" fill="${OURO}"/>
      <rect x="-4" y="-74" width="118" height="10" rx="4" fill="#7a1622"/><rect x="-4" y="-78" width="118" height="7" rx="3.5" fill="${NEVE}"/>
      ${[12, 44, 76].map((wx) => `<rect x="${wx}" y="-58" width="22" height="20" rx="3" fill="${OURO_CLARO}"/>`).join('')}${roda(25, 10)}${roda(85, 10)}</g>`;
  const trem = `<g class="trem"><g transform="translate(0,${BASE + 3}) scale(.5)">
      ${vagao(-354, '#7c93a8')}${vagao(-236, VERDE)}${vagao(-118, VERM)}
      <circle class="fumaca" cx="108" cy="-104" r="9"/><circle class="fumaca" cx="108" cy="-104" r="9" style="animation-delay:-.8s"/><circle class="fumaca" cx="108" cy="-104" r="9" style="animation-delay:-1.6s"/>
      <rect x="100" y="-92" width="16" height="32" fill="${TINTA}"/><rect x="95" y="-98" width="26" height="8" rx="2" fill="${TINTA}"/>
      <rect x="40" y="-64" width="92" height="44" rx="10" fill="${VINHO}"/><rect x="60" y="-64" width="6" height="44" fill="${OURO}"/><rect x="88" y="-64" width="6" height="44" fill="${OURO}"/>
      <rect x="0" y="-92" width="52" height="72" rx="4" fill="${VERDE_ESC}"/><rect x="10" y="-82" width="32" height="26" rx="3" fill="${OURO_CLARO}"/>
      <rect x="-6" y="-100" width="64" height="10" rx="4" fill="#7a1622"/><rect x="-6" y="-104" width="64" height="7" rx="3.5" fill="${NEVE}"/>
      <rect x="0" y="-22" width="134" height="8" fill="${TINTA}"/><polygon points="134,-26 156,-4 134,-4" fill="${OURO}"/><circle cx="134" cy="-48" r="7" fill="#fff3b0"/>
      ${roda(22, 15)}${roda(72, 11)}${roda(106, 11)}
    </g></g>`;

  /* ============ Camada 3: chão da praça e o que fica lá no fundo ============ */
  let chao = `<g filter="url(#aquarela)">
    <path d="M0 ${BASE - 4} Q400 ${BASE - 16} 800 ${BASE - 6} T1600 ${BASE - 8} V700 H0Z" fill="url(#chao)"/>
    <ellipse cx="800" cy="640" rx="560" ry="26" fill="#e7deea" opacity=".7"/><ellipse cx="330" cy="676" rx="300" ry="16" fill="#e7deea" opacity=".6"/><ellipse cx="1290" cy="672" rx="300" ry="16" fill="#e7deea" opacity=".6"/>`;
  [[610, 584, 0.55], [990, 584, 0.55], [540, 590, 0.75], [1060, 590, 0.75], [664, 582, 0.45], [936, 582, 0.45], [652, 590, 0.9], [948, 590, 0.9]].forEach(([x, b, s]) => (chao += pinheiro(x, b, s)));
  chao += barraca(668, 582, 0.26) + barraca(875, 582, 0.26) + '</g>';

  /* ============ Camada 5: barracas, árvores e postes (na frente de quem passeia) ============ */
  let frente = `<g filter="url(#aquarela)">` + pinheiro(800, 616, 1.65, true);
  frente += presente(768, 618, 14, 11, VINHO, OURO_CLARO) + presente(822, 619, 12, 13, '#7c93a8', NEVE);
  frente += pinheiro(432, 614, 1.15) + pinheiro(1168, 614, 1.15);
  frente += barraca(452, 616, 0.74) + barraca(1600 - 452 - 220 * 0.74, 616, 0.74);
  frente += poste(418, 624, 0.8) + poste(1182, 624, 0.8);
  frente += pinheiro(40, 640, 2.5) + pinheiro(1560, 640, 2.5) + pinheiro(410, 640, 1.5) + pinheiro(1190, 640, 1.5);
  frente += barraca(128, 642, 1.14) + barraca(1600 - 128 - 220 * 1.14, 642, 1.14);
  frente += poste(86, 664, 1.28, true) + poste(1514, 664, 1.28, true);
  frente += presente(118, 668, 26, 20, VINHO, OURO_CLARO) + presente(148, 670, 20, 26, '#f7ead6', VINHO) + presente(1444, 668, 24, 20, VERDE, VINHO) + presente(1418, 670, 20, 16, '#f7ead6', OURO);
  frente += pinheiro(-6, 700, 1.9) + pinheiro(1606, 700, 1.9);
  frente += `<path d="M0 690 Q300 668 640 688 T1220 684 T1600 678 V700 H0Z" fill="${NEVE}"/></g>`;

  /* ============ Camada 6: luzinhas e freguesas nas barracas ============ */
  let vida = '';
  function varal(x1, y1, x2, y2, barriga) {
    const mx = (x1 + x2) / 2, my = Math.max(y1, y2) + barriga;
    let v = `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="#8a7466" stroke-width="1.2" opacity=".7"/>`;
    const q = Math.round(Math.abs(x2 - x1) / 24);
    for (let i = 1; i < q; i++) {
      const t = i / q, u = 1 - t;
      const bx = u * u * x1 + 2 * u * t * mx + t * t * x2, by = u * u * y1 + 2 * u * t * my + t * t * y2;
      v += `<circle class="luz" cx="${n(bx)}" cy="${n(by + 3)}" r="3.4" style="animation-delay:${n(-(i % 5) * 0.5)}s"/>`;
    }
    return v;
  }
  [[86, 452, 418, 494, 34], [418, 494, 800, 440, 40], [262, 350, 800, 440, 60], [0, 400, 262, 350, 30]].forEach(([x1, y1, x2, y2, b]) => {
    vida += varal(x1, y1, x2, y2, b) + varal(1600 - x2, y2, 1600 - x1, y1, b);
  });
  // luzes da árvore central
  [[-22, -14], [-4, -20], [14, -12], [24, -18], [-14, -38], [4, -42], [15, -34], [-8, -58], [8, -60], [-2, -80], [-26, -10], [0, -30]].forEach(([px, py], i) => {
    vida += `<circle class="luz" cx="${n(800 + px * 1.65)}" cy="${n(616 + py * 1.65)}" r="3" style="animation-delay:${n(-i * 0.4)}s"/>`;
  });

  const PELES = ['#f3cfb0', '#e3b08a', '#c08a62', '#8f5c3c', '#f8dcc4'];
  const CABELOS = ['#3a2a24', '#5a3a26', '#8a5a34', '#c9a063', '#2a2226', '#7a3524'];
  const CASACOS = ['#a3182a', '#c9965f', '#7c93a8', '#efe2cf', '#5d7a56', '#c4454a', '#8a6a55', '#d8b7a8'];
  function figura(costas) {
    const casaco = escolher(CASACOS), cabelo = escolher(CABELOS), pele = escolher(PELES);
    const cachecol = escolher(['#f7ead6', VINHO, VERDE_ESC, OURO].filter((c) => c !== casaco)), gorro = rnd() < 0.4, p = n(R(0.55, 0.8));
    return `<g class="${costas ? '' : 'balanco'}" style="--p:${p}s">
      <ellipse cx="0" cy="1" rx="12" ry="2.6" fill="#b9aec2" opacity=".5"/>
      <rect class="${costas ? '' : 'perna'}" x="-5" y="-17" width="4.2" height="17" rx="2" fill="${TINTA}" style="--p:${p}s"/>
      <rect class="${costas ? '' : 'perna b'}" x="1" y="-17" width="4.2" height="17" rx="2" fill="${TINTA}" style="--p:${p}s"/>
      <path d="M-7 -55 Q0 -59 7 -55 L11.5 -13 Q0 -10 -11.5 -13Z" fill="${casaco}"/><path d="M0 -56 L.6 -12" stroke="#000" stroke-width=".8" opacity=".14"/>
      <rect class="${costas ? '' : 'braco'}" x="-2.2" y="-52" width="4.4" height="21" rx="2.2" fill="${casaco}" stroke="#000" stroke-opacity=".16" stroke-width=".6" style="--p:${p}s"/>
      <rect x="-6.5" y="-58.5" width="13" height="4.6" rx="2.3" fill="${cachecol}"/>
      <circle cx="0" cy="-64.5" r="6.2" fill="${pele}"/>
      ${costas
        ? `<path d="M-7 -65 a7 7 0 0 1 14 0 v11 q-7 4 -14 0z" fill="${cabelo}"/>`
        : `<path d="M-7 -63 a7 7 0 0 1 13.4 -3 q-5.4 .6 -6.4 5 l-.6 11 q-4.4 1.4 -6.4 -2z" fill="${cabelo}"/><circle cx="3.4" cy="-64.5" r=".9" fill="${TINTA}"/>`}
      ${gorro ? `<path d="M-7 -67 Q0 -83 7 -67Z M-4 -73 Q-8 -84 -14 -77 L-6 -68Z" fill="${VINHO}"/><rect x="-7.6" y="-69.4" width="15.2" height="4.2" rx="2.1" fill="${NEVE}"/><circle cx="-14" cy="-77.4" r="2.8" fill="${NEVE}"/>` : ''}
    </g>`;
  }
  // Freguesas paradas nas barracas (de costas)
  [[498, 618, 0.72], [522, 619, 0.76], [590, 618, 0.7], [1010, 618, 0.72], [1078, 619, 0.76], [1102, 618, 0.7], [250, 650, 1.12], [286, 652, 1.18], [1314, 652, 1.18], [1352, 650, 1.12]].forEach(([x, y, s]) => {
    vida += `<g transform="translate(${x},${y}) scale(${s})">${figura(true)}</g>`;
  });
  /* ============ Camada 4: gente passeando ============ */
  // Todas caminham no fundo da praça (acima da linha das barracas), então passam
  // por trás das barracas, das árvores e dos postes, nunca por cima.
  let passeio = '';
  const gente = [];
  for (let i = 0; i < 16; i++) {
    const y = R(594, 610);
    gente.push({ y, s: 0.74 + ((y - 594) / 16) * 0.2, esq: i % 2 === 1, dur: n(R(64, 120)), atraso: n(-R(0, 120)) });
  }
  gente.sort((a, b) => a.y - b.y).forEach((g) => {
    passeio += `<g class="andante${g.esq ? ' volta' : ''}" style="--d:${g.dur}s;--at:${g.atraso}s"><g transform="translate(0,${n(g.y)}) scale(${n(g.esq ? -g.s : g.s)},${n(g.s)})">${figura(false)}</g></g>`;
  });

  document.getElementById('cena-fundo').innerHTML = fundo;
  document.getElementById('cena-trem').innerHTML = trem;
  document.getElementById('cena-chao').innerHTML = chao;
  document.getElementById('cena-gente').innerHTML = passeio;
  document.getElementById('cena-frente').innerHTML = frente;
  document.getElementById('cena-vida').innerHTML = vida;

  /* ============ Ramos de pinheiro dos cantos ============ */
  (function ramos() {
    let r = '';
    const hastes = [[[0, 26], [150, 4], [292, 58]], [[0, 12], [120, 56], [214, 168]], [[8, 0], [70, 96], [96, 232]], [[0, 18], [90, 20], [176, 96]]];
    for (const [a, c, b] of hastes) {
      r += `<path d="M${a} Q${c} ${b}" fill="none" stroke="#8a6a3c" stroke-width="2.4" stroke-linecap="round"/>`;
      for (let t = 0.06; t <= 1; t += 0.028) {
        const u = 1 - t;
        const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
        const ang = Math.atan2(2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]), 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]));
        for (const lado of [-1, 1]) {
          const g = ang + lado * R(0.5, 0.8), comp = R(20, 32) * (1 - t * 0.45);
          r += `<path d="M${n(x)} ${n(y)} l${n(Math.cos(g) * comp)} ${n(Math.sin(g) * comp)}" stroke="${escolher(['#b8923f', '#c9a655', '#8f8f4e', '#6f8a63', '#a88a3a'])}" stroke-width="1.7" stroke-linecap="round"/>`;
        }
      }
    }
    [[150, 12, 46, 8], [226, 34, 34, 7], [92, 60, 30, 7], [150, 110, 26, 6], [62, 130, 18, 6], [84, 196, 14, 5]].forEach(([x, y, rx, ry]) => {
      r += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${NEVE}" opacity=".95" transform="rotate(${n(R(-8, 22))} ${x} ${y})"/>`;
    });
    r += `<path d="M96 28 q4 22 -6 38 M96 28 q14 16 14 36 M96 28 q22 10 30 26" fill="none" stroke="#8a6a3c" stroke-width="1.6"/>`;
    [[88, 70], [110, 68], [128, 56], [98, 86]].forEach(([x, y]) => {
      r += `<circle cx="${x}" cy="${y}" r="9.5" fill="#b3202c"/><circle cx="${x - 3}" cy="${y - 3}" r="2.6" fill="#fff" opacity=".7"/>`;
    });
    document.querySelectorAll('.ramo').forEach((el) => (el.innerHTML = r));
  })();

  /* ============ Estrelinhas douradas ============ */
  (function estrelas() {
    const ceu = document.querySelector('.estrelas');
    [[7, 30, 16], [13, 44, 10], [19, 21, 9], [24, 37, 13], [9, 55, 8], [29, 13, 8], [93, 30, 16], [87, 45, 10], [81, 20, 9], [76, 38, 13], [91, 56, 8], [71, 13, 8]].forEach(([x, y, t], i) => {
      ceu.insertAdjacentHTML('beforeend', `<svg viewBox="-10 -10 20 20" style="left:${x}%;top:${y}%;width:${t}px;animation-delay:${-i * 0.6}s"><path d="M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10Z" fill="${OURO}"/></svg>`);
    });
  })();
})();
