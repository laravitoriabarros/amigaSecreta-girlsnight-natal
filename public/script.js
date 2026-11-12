// Amiga Secreta de Natal: neve, modal "Quem é você?" e animação das cartas.
// Quem tirou quem fica no gabarito.txt, consultado pela função api/sortear.js (Vercel).
(function () {
  const $ = (s) => document.querySelector(s);
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const R = (a, b) => a + Math.random() * (b - a);
  // Com "reduzir movimento" ligado no sistema, a animação fica bem mais curta.
  const V = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.25 : 1;

  /* ================= Neve ================= */
  (function neve() {
    const tela = $('#neve'), ctx = tela.getContext('2d');
    let L, A, flocos = [];
    function ajustar() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      L = innerWidth; A = innerHeight;
      tela.width = L * dpr; tela.height = A * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(200, (L * A) / 7500));
      flocos = Array.from({ length: n }, () => novo(true));
    }
    function novo(inicio) {
      const r = R(1.2, 4.6);
      return { x: R(0, L), y: inicio ? R(0, A) : -8, r, v: 0.3 + r * 0.26, fase: R(0, 6.28), bal: R(0.3, 1), op: R(0.65, 1) };
    }
    function desenhar(cor, folga, opacidade) {
      ctx.fillStyle = cor;
      for (const f of flocos) {
        ctx.globalAlpha = f.op * opacidade;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r + folga, 0, 6.2832); ctx.fill();
      }
    }
    let antes = performance.now();
    function quadro(agora) {
      const dt = Math.min(50, agora - antes) / 16.7; antes = agora;
      for (const f of flocos) {
        f.y += f.v * dt; f.fase += 0.012 * dt; f.x += Math.sin(f.fase) * f.bal * dt + 0.2 * dt;
        if (f.y > A + 8) Object.assign(f, novo(false));
        if (f.x > L + 8) f.x = -8;
      }
      ctx.clearRect(0, 0, L, A);
      desenhar('#9c8fa6', 0.9, 0.22); // contorno suave, para a neve aparecer no papel claro
      desenhar('#ffffff', 0, 1);
      if (V === 1) requestAnimationFrame(quadro);
    }
    addEventListener('resize', () => { ajustar(); if (V !== 1) quadro(performance.now()); });
    ajustar();
    requestAnimationFrame(quadro);
  })();

  /* ================= Participantes ================= */
  const btnSortear = $('#btn-sortear');
  const modal = $('#modal'), palco = $('#palco'), seletor = $('#quem'), erro = $('#erro');
  const passoEscolha = $('#passo-escolha'), passoConfirma = $('#passo-confirma');
  const participantes = [
    { id: 'lara', nome: 'Lara' },
    { id: 'julia', nome: 'Júlia' },
    { id: 'shayra', nome: 'Shayra' },
    { id: 'karol', nome: 'Karol' },
    { id: 'cynthia', nome: 'Cynthia' },
  ].map((p) => ({ ...p, foto: `imagens/participantes/${p.id}.jpg` }));

  /* ================= Modal ================= */
  const escolhida = () => participantes.find((p) => p.id === seletor.value);

  function mostrarPasso(confirma) {
    passoEscolha.hidden = confirma; passoConfirma.hidden = !confirma;
    (confirma ? $('#btn-sim') : seletor).focus();
  }

  function abrirModal() {
    seletor.innerHTML = '<option value="" disabled selected>Selecione…</option>' +
      participantes.map((p) => `<option value="${p.id}">${p.nome}</option>`).join('');
    erro.textContent = '';
    mostrarPrevia();
    modal.hidden = false;
    mostrarPasso(false);
  }
  function fecharModal() { modal.hidden = true; btnSortear.focus(); }

  function mostrarPrevia() {
    const p = escolhida();
    for (const el of [$('#previa'), $('#previa2')]) {
      el.classList.toggle('vazia', !p);
      el.style.backgroundImage = p ? `url("${p.foto}")` : '';
    }
    $('#btn-continuar').disabled = !p;
  }

  btnSortear.addEventListener('click', abrirModal);
  seletor.addEventListener('change', () => { erro.textContent = ''; mostrarPrevia(); });
  $('#btn-cancelar').addEventListener('click', fecharModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) fecharModal(); });

  $('#btn-continuar').addEventListener('click', () => {
    const p = escolhida();
    if (!p) return;
    $('#nome-confirma').textContent = p.nome;
    mostrarPasso(true);
  });
  $('#btn-nao').addEventListener('click', () => mostrarPasso(false));

  $('#btn-sim').addEventListener('click', async () => {
    const p = escolhida(), btn = $('#btn-sim');
    btn.disabled = true;
    let amiga;
    try {
      const r = await fetch('api/sortear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quem: p.id }),
      });
      const dados = await r.json().catch(() => ({}));
      if (!r.ok || !dados.amiga) throw new Error(dados.erro || 'Não foi possível sortear. Tente de novo.');
      amiga = dados.amiga;
    } catch (e) {
      mostrarPasso(false);
      erro.textContent = e instanceof TypeError ? 'Sem conexão com o sorteio. Tente de novo.' : e.message;
      return;
    } finally {
      btn.disabled = false;
    }
    // Carrega a foto antes de começar, para a carta já virar com a imagem pronta.
    const foto = new Image();
    foto.src = amiga.foto;
    await Promise.race([foto.decode().catch(() => {}), esperar(4000)]);
    modal.hidden = true;
    revelar(amiga);
  });

  /* ================= Cartas ================= */
  const FLOCO = `<svg viewBox="-50 -50 100 100" fill="none" stroke="#f6d58a" stroke-width="4" stroke-linecap="round">
    <circle r="44" stroke-width="2"/>
    ${[0, 60, 120].map((a) => `<g transform="rotate(${a})"><path d="M0 -34 V34 M0 -22 l-9 -9 M0 -22 l9 -9 M0 22 l-9 9 M0 22 l9 9"/></g>`).join('')}
  </svg>`;
  const T = (x, y, r, s) => `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
  const SUAVE = 'cubic-bezier(.4, 0, .2, 1)';

  async function revelar(amiga) {
    const baralho = $('#baralho'), topo = $('#texto-topo'), baixo = $('#texto-baixo');
    const N = 7, S = 0.62, meio = (N - 1) / 2;

    baralho.innerHTML = '';
    topo.classList.remove('visivel'); baixo.classList.remove('visivel');
    topo.textContent = 'Embaralhando as cartas…';
    $('#nome-amiga').textContent = '';
    palco.hidden = false;
    const w = baralho.offsetWidth;

    const cartas = Array.from({ length: N }, (_, i) => {
      const c = document.createElement('div');
      c.className = 'carta';
      c.innerHTML = `<div class="carta-miolo"><div class="face verso">${FLOCO}</div>${i === 0 ? '<div class="face frente"><img alt=""></div>' : ''}</div>`;
      baralho.appendChild(c);
      return c;
    });
    const principal = cartas[0];
    principal.querySelector('img').src = amiga.foto;
    principal.querySelector('img').alt = `Foto de ${amiga.nome}`;

    // Posição atual de cada carta, para cada movimento partir de onde a carta está.
    const pos = cartas.map(() => T(R(-w, w), innerHeight, R(-50, 50), S));
    cartas.forEach((c, i) => (c.style.transform = pos[i]));
    const mover = (i, para, ms, atraso = 0, extra = {}) => {
      const de = pos[i];
      pos[i] = para;
      return cartas[i].animate([{ transform: de }, { transform: para, ...extra }], { duration: ms * V, delay: atraso * V, easing: SUAVE, fill: 'both' }).finished;
    };
    const pilha = (k) => T(k * 0.7, -k * 1.8, 0, S);

    // ordem[k] = índice da carta que está na posição k da pilha (0 = embaixo)
    let ordem = cartas.map((_, i) => i).sort(() => Math.random() - 0.5);
    ordem.forEach((i, k) => (cartas[i].style.zIndex = k));

    topo.classList.add('visivel');
    await Promise.all(ordem.map((i, k) => mover(i, pilha(k), 520, k * 70)));
    await esperar(150 * V);

    // Embaralho: corta o monte em dois e intercala as cartas, três vezes.
    for (let vez = 0; vez < 3; vez++) {
      const corte = Math.ceil(N / 2);
      const esq = ordem.slice(0, corte), dir = ordem.slice(corte);
      await Promise.all([
        ...esq.map((i, j) => mover(i, T(-w * 0.46, -j * 1.8, -8, S), 300)),
        ...dir.map((i, j) => mover(i, T(w * 0.46, -j * 1.8, 8, S), 300)),
      ]);
      const nova = [];
      const montes = Math.random() < 0.5 ? [esq, dir] : [dir, esq];
      while (montes[0].length || montes[1].length) for (const m of montes) if (m.length) nova.push(m.shift());
      await Promise.all(nova.map((i, k) => {
        setTimeout(() => (cartas[i].style.zIndex = k), k * 60 * V);
        return mover(i, pilha(k), 240, k * 60);
      }));
      ordem = nova;
      await esperar(90 * V);
    }

    // Abre em leque e fecha.
    await Promise.all(ordem.map((i, k) => mover(i, T((k - meio) * w * 0.3, Math.abs(k - meio) ** 2 * 7, (k - meio) * 9, S), 450)));
    await esperar(350 * V);
    await Promise.all(ordem.map((i, k) => mover(i, pilha(k), 380)));

    // Sobra uma carta só.
    topo.classList.remove('visivel');
    principal.style.zIndex = 99;
    let lado = 1;
    const saidas = ordem.filter((i) => i !== 0).map((i, k) => {
      lado = -lado;
      return mover(i, T(lado * innerWidth * 0.7, R(-200, 200), lado * R(20, 70), S), 520, k * 45, { opacity: 0 });
    });
    await Promise.all([
      ...saidas,
      principal.animate([{ transform: pos[0] }, { transform: T(0, 0, 0, 1) }], { duration: 700 * V, delay: 150 * V, easing: 'cubic-bezier(.3, 1.4, .5, 1)', fill: 'both' }).finished,
    ]);
    cartas.forEach((c, i) => i && c.remove());

    topo.textContent = 'Sua amiga secreta é…';
    topo.classList.add('visivel');
    await esperar(900 * V);
    await principal.animate(
      [0, -5, 5, -4, 4, 0].map((g) => ({ transform: T(0, 0, g, 1) })),
      { duration: 800 * V, easing: 'ease-in-out', fill: 'both' },
    ).finished;

    principal.classList.add('virada');
    await esperar(1000);
    brilhos(baralho);
    $('#nome-amiga').textContent = amiga.nome.toUpperCase() + '!';
    baixo.classList.add('visivel');
    $('#btn-fechar').focus();
  }

  function brilhos(onde) {
    const cores = ['#c9973f', '#a3182a', '#fffdf8', '#5d7a56', '#f6d58a'];
    for (let i = 0; i < 44; i++) {
      const b = document.createElement('span');
      b.className = 'brilho';
      b.style.background = cores[i % cores.length];
      onde.appendChild(b);
      const ang = R(0, 6.28), dist = R(140, 380), tam = R(0.5, 1.5);
      b.animate(
        [
          { transform: `translate(-50%, -50%) scale(${tam})`, opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist + 80}px)) scale(0)`, opacity: 0 },
        ],
        { duration: R(900, 1700), easing: 'cubic-bezier(.1, .7, .3, 1)', fill: 'both' },
      ).finished.then(() => b.remove());
    }
  }

  $('#btn-fechar').addEventListener('click', () => {
    palco.hidden = true;
    $('#baralho').innerHTML = '';
    btnSortear.focus();
  });

})();
