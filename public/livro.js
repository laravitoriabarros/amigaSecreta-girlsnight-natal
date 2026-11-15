// "Conheça seu alvo!": um livro se abre sobre uma mesa de madeira à luz de velas.
// Página esquerda: foto e nome da sorteada. Página direita: do que ela gosta.
(function () {
  const $ = (s) => document.querySelector(s);
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const V = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.2 : 1;
  const FOLHAS = 5; // páginas que passam antes de o livro parar aberto

  /* ============ Ícones (desenhos 2D simples) ============ */
  const svg = (corpo) => `<svg viewBox="0 0 32 32" aria-hidden="true">${corpo}</svg>`;
  const livro = (cor, emblema = '') => svg(`<path d="M6 5h17a3 3 0 0 1 3 3v19H9a3 3 0 0 1-3-3z" fill="${cor}"/><path d="M9 23.5h17V27H9a1.75 1.75 0 0 1 0-3.5z" fill="#fff8ec"/><path d="M6 24V8" stroke="#000" stroke-opacity=".18" stroke-width="2"/>${emblema}`);
  const cores = (a, b) => svg(`<circle cx="12" cy="16" r="9" fill="${a}" stroke="#fff8ec" stroke-width="1.6"/><circle cx="20.5" cy="16" r="9" fill="${b}" stroke="#fff8ec" stroke-width="1.6"/>`);
  const urso = svg('<circle cx="8.5" cy="9" r="4.6" fill="#a9774c"/><circle cx="23.5" cy="9" r="4.6" fill="#a9774c"/><circle cx="8.5" cy="9" r="2" fill="#e7c7a3"/><circle cx="23.5" cy="9" r="2" fill="#e7c7a3"/><circle cx="16" cy="17.5" r="10.5" fill="#b98a5e"/><ellipse cx="16" cy="21" rx="4.6" ry="3.6" fill="#f0dcc0"/><circle cx="12" cy="15.5" r="1.4" fill="#3a2a28"/><circle cx="20" cy="15.5" r="1.4" fill="#3a2a28"/><path d="M14.6 19.6h2.8L16 21.2z" fill="#3a2a28"/>');
  const trufa = svg('<circle cx="16" cy="13.5" r="8.5" fill="#5a3320"/><path d="M9.5 11q6.5-6 13 0M11 15q5-3.5 10 0" stroke="#8a5a3c" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M5.5 18.5h21L23 28H9z" fill="#c9973f"/><path d="M11 19l1 8.5M16 19v8.5M21 19l-1 8.5" stroke="#a87a2c" stroke-width="1.2"/>');
  const frasco = svg('<rect x="10" y="12" width="12" height="17" rx="3" fill="#d8b7a8"/><rect x="13" y="8.5" width="6" height="4" fill="#8a6a55"/><path d="M14.5 8.5V4.5h7.5v2.4h-4.4v1.6z" fill="#5a4640"/><rect x="12" y="17" width="8" height="7" rx="1.2" fill="#fff8ec"/><path d="M14 20.5h4" stroke="#a3182a" stroke-width="1.4" stroke-linecap="round"/>');
  const ICONE = {
    quebra: svg('<path d="M4 10h7.2a3.2 3.2 0 1 1 6.4 0H25v6.6a3.2 3.2 0 1 1 0 6.4V29H4v-6a3.2 3.2 0 1 0 0-6.4z" fill="#6f8597"/><path d="M4 10h7.2a3.2 3.2 0 1 1 6.4 0H25" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>'),
    misterio: livro('#3b3f63', '<circle cx="15" cy="13" r="4" fill="none" stroke="#f6d58a" stroke-width="1.8"/><path d="M18 16l3.4 3.4" stroke="#f6d58a" stroke-width="2" stroke-linecap="round"/>'),
    cristao: livro('#7a5a3c', '<path d="M16 8v11M12 12h8" stroke="#f6d58a" stroke-width="2.2" stroke-linecap="round"/>'),
    classico: livro('#7f1020', '<rect x="10.5" y="9" width="11" height="2" rx="1" fill="#f6d58a"/><rect x="12.5" y="13" width="7" height="1.6" rx=".8" fill="#f6d58a"/><path d="M16 17.5l1 2 2 .2-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2-.2z" fill="#f6d58a"/>'),
    diario: livro('#d98a9a', '<rect x="19" y="5" width="2.6" height="19" fill="#8f1f2a"/><path d="M13 12.2c-1.6-2.2-4.4-.2-3 2.2c.8 1.3 3 2.8 3 2.8s2.2-1.5 3-2.8c1.4-2.4-1.4-4.4-3-2.2z" fill="#fff8ec"/>'),
    bolo: svg('<path d="M7 28l1.8-12h14.4L25 28z" fill="#7a4a2b"/><path d="M7.5 16.5c-.6-7 17.6-7 17 0c-.2 2.6-2 1.6-2.8 4.6c-.8-3-3-1.4-3.8 2.2c-.8-4-3.2-1.6-4 .8c-1-3.4-6-3-6.4-7.6z" fill="#4a2a18"/><circle cx="16" cy="7.5" r="2.6" fill="#c4303a"/><path d="M16 5q1.5-3 3.5-2.5" stroke="#5d7a56" stroke-width="1.3" fill="none" stroke-linecap="round"/>'),
    hortensia: svg('<path d="M16 19v10" stroke="#5d7a56" stroke-width="2" stroke-linecap="round"/><path d="M16 26c-5 .5-7-2-7.5-4.5c3.500-.5 7 .5 7.500 4.500z" fill="#6f8a63"/><g fill="#8ea2e0"><circle cx="11" cy="9" r="4.2"/><circle cx="21" cy="9" r="4.2"/><circle cx="16" cy="6" r="4.2"/><circle cx="8.500" cy="14.500" r="4"/><circle cx="23.500" cy="14.500" r="4"/><circle cx="16" cy="13" r="4.600" fill="#a9b8ee"/><circle cx="12.500" cy="18" r="3.800"/><circle cx="19.500" cy="18" r="3.800"/></g><g fill="#fff8ec"><circle cx="16" cy="6" r="1"/><circle cx="11" cy="9.500" r="1"/><circle cx="21" cy="9.500" r="1"/><circle cx="16" cy="13" r="1.100"/><circle cx="12.500" cy="18" r=".9"/><circle cx="19.500" cy="18" r=".9"/></g>'),
    rosa: svg('<path d="M16 17v12" stroke="#5d7a56" stroke-width="2" stroke-linecap="round"/><path d="M16 25c-5 .5-7-2-7.500-4.500c3.500-.5 7 .5 7.500 4.500zM16 23c4 .5 6-1.500 6.500-3.500c-3-.5-6 .2-6.500 3.500z" fill="#6f8a63"/><circle cx="16" cy="11" r="8" fill="#c4303a"/><path d="M16 6.500a4.500 4.500 0 1 1-4.500 4.500M16 9a2 2 0 1 1-2 2" stroke="#7f1020" stroke-width="1.500" fill="none" stroke-linecap="round"/>'),
    urso,
    trufa,
    prata: svg('<circle cx="16" cy="19.500" r="8" fill="none" stroke="#b4bcc6" stroke-width="3.400"/><circle cx="16" cy="19.500" r="8" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1" stroke-dasharray="6 20"/><path d="M11.500 8.500L16 3.500l4.500 5L16 13z" fill="#e3eaf1" stroke="#98a2ad" stroke-width="1.200" stroke-linejoin="round"/>'),
    tv: svg('<path d="M11 3l5 5l5-5" stroke="#5a4640" stroke-width="1.800" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="3.500" y="8" width="25" height="17" rx="3.500" fill="#8a6a55"/><rect x="6.500" y="11" width="15" height="11" rx="2" fill="#bfe0e6"/><circle cx="25" cy="13.500" r="1.500" fill="#f6d58a"/><circle cx="25" cy="18.500" r="1.500" fill="#f6d58a"/><path d="M9 25l-1.500 3.500M23 25l1.500 3.500" stroke="#5a4640" stroke-width="1.800" stroke-linecap="round"/>'),
    frasco,
    vestido: svg('<path d="M11.500 3.500L16 7l4.500-3.500l1.200 6.500l-2.200 3L25.500 28.500h-19L12.500 13l-2.200-3z" fill="#fffdf8" stroke="#a8958a" stroke-width="1.300" stroke-linejoin="round"/><path d="M12.500 13h7" stroke="#a8958a" stroke-width="1.300"/><path d="M13 17l-2.500 11M19 17l2.500 11" stroke="#d9cdc2" stroke-width="1.100"/>'),
    skincare: svg('<rect x="6.500" y="14" width="19" height="14" rx="3.500" fill="#bcd3c2"/><rect x="5.500" y="8" width="21" height="7" rx="2.500" fill="#6f8a63"/><path d="M11.500 22q4.500-4.500 9 0" stroke="#fff" stroke-width="1.700" fill="none" stroke-linecap="round"/><path d="M24 3.500l.8 1.900l1.900.8l-1.900.8l-.8 1.900l-.8-1.900l-1.900-.8l1.900-.8z" fill="#c9973f"/>'),
    camiseta: svg('<path d="M11 4.500l5 3l5-3l7.500 5.500l-3.200 5.200l-3.300-2V28H10V13.200l-3.300 2L3.500 10z" fill="#7c93a8"/><path d="M11 4.500l5 3l5-3" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.300"/>'),
    coelho: svg('<ellipse cx="11" cy="8.500" rx="3.200" ry="7.500" fill="#fffdf8" stroke="#a8958a" stroke-width="1.200"/><ellipse cx="21" cy="8.500" rx="3.200" ry="7.500" fill="#fffdf8" stroke="#a8958a" stroke-width="1.200"/><ellipse cx="11" cy="9" rx="1.300" ry="4.500" fill="#f2b8c0"/><ellipse cx="21" cy="9" rx="1.300" ry="4.500" fill="#f2b8c0"/><circle cx="16" cy="20" r="9" fill="#fffdf8" stroke="#a8958a" stroke-width="1.200"/><circle cx="12.500" cy="18.500" r="1.300" fill="#3a2a28"/><circle cx="19.500" cy="18.500" r="1.300" fill="#3a2a28"/><path d="M14.800 21.500h2.400L16 23z" fill="#e58a98"/><path d="M16 23v1.200q-1.500 1.500-3 .3M16 24.200q1.500 1.500 3 .3" stroke="#a8958a" stroke-width="1" fill="none" stroke-linecap="round"/>'),
    pulseira: svg('<ellipse cx="16" cy="16" rx="11" ry="8.500" fill="none" stroke="#c9973f" stroke-width="2"/><g fill="#f6d58a" stroke="#a87a2c" stroke-width=".7"><circle cx="5.500" cy="18" r="1.900"/><circle cx="10" cy="23" r="1.900"/><circle cx="22" cy="23" r="1.900"/><circle cx="26.500" cy="18" r="1.900"/></g><path d="M16 21.800c-1.500-2.200-4.200-.200-2.900 2c.800 1.300 2.900 2.700 2.900 2.700s2.100-1.400 2.900-2.700c1.300-2.200-1.400-4.200-2.900-2z" fill="#c4303a"/>'),
    gloss: svg('<rect x="11.500" y="14" width="9" height="15" rx="2.500" fill="#7f1020"/><rect x="13.200" y="16.500" width="2" height="9" rx="1" fill="#fff" opacity=".3"/><rect x="11.500" y="12" width="9" height="3.200" fill="#f6d58a"/><rect x="13" y="3" width="6" height="9.500" rx="2" fill="#3a2a28"/>'),
  };

  /* ============ Do que cada uma gosta ============ */
  const GOSTOS = {
    lara: [
      ['quebra', 'Quebra-cabeças'],
      ['misterio', 'Livros de mistério'],
      [cores('#16161a', '#1f2a5c'), 'Preto e azul-marinho'],
      ['bolo', 'Bolinho vulcão de chocolate'],
      ['hortensia', 'Flores hortênsias'],
      ['urso', 'Pelúcias e itens de papelaria'],
    ],
    shayra: [
      ['trufa', 'Chocolate da Cacau Show (principalmente trufas)'],
      [cores('#7fd6c7', '#a9e8dc'), 'Cor verde-água'],
      ['prata', 'Acessórios prateados, em vez de dourados'],
      ['tv', 'A série Friends'],
      ['rosa', 'Ganhar flores (rosas)'],
    ],
    cynthia: [
      ['cristao', 'Livros cristãos'],
      [cores('#a0613c', '#c9a27a'), 'Tons terrosos'],
      ['frasco', 'Produtinhos de cabelo'],
      ['trufa', 'Trufas da Cacau Show'],
      ['urso', 'Estampas de ursinho em objetos e coisinhas fofas'],
    ],
    karol: [
      ['vestido', 'Peças fluidas e de cor branca'],
      ['classico', 'Livros clássicos'],
      ['skincare', 'Skincare'],
      ['camiseta', 'T-shirts'],
      ['frasco', 'Produtinhos para cabelo'],
    ],
    julia: [
      ['coelho', 'Coelhinhos (pelúcia ou qualquer coisa de coelhinho)'],
      [cores('#fffdf8', '#d9b25a'), 'Branco e dourado'],
      ['pulseira', 'Pulseiras delicadas'],
      ['gloss', 'Maquiagem (gloss vermelho-escuro)'],
      ['diario', 'Diários'],
    ],
  };

  /* ============ Vela ============ */
  const VELA = `<svg viewBox="0 0 60 150" aria-hidden="true">
    <defs><radialGradient id="halo-vela"><stop offset="0" stop-color="#ffd98a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>
    <ellipse class="halo" cx="30" cy="32" rx="30" ry="32" fill="url(#halo-vela)"/>
    <g class="chama"><path d="M30 10C39 25 41 34 30 45C19 34 21 25 30 10Z" fill="#ffab3d"/><path d="M30 23C34.500 31 35.500 37 30 43C24.500 37 25.500 31 30 23Z" fill="#fff3b0"/></g>
    <path d="M30 44v7" stroke="#3a2a28" stroke-width="1.600" stroke-linecap="round"/>
    <rect x="18" y="50" width="24" height="80" rx="3" fill="#f4e6cf"/><rect x="34" y="50" width="8" height="80" rx="3" fill="#000" opacity=".1"/>
    <path d="M18 53c0-4 24-4 24 0c0 5-3 3-3 10c0 3-3 3-3-1c0-5-3-4-4 2c-1 8-4 8-4 0c0-6-3-5-3-1c0 3-3 3-3 0c0-5-4-5-4-10z" fill="#fffaf0"/>
    <ellipse cx="30" cy="131" rx="27" ry="7" fill="#b98636"/><ellipse cx="30" cy="129" rx="27" ry="7" fill="#d9a548"/><ellipse cx="30" cy="128.500" rx="19" ry="4.500" fill="#b98636"/>
  </svg>`;

  /* ============ Montagem ============ */
  const cena = $('#livro-cena'), livroEl = $('#livro'), btnFechar = $('#btn-fechar-livro');
  document.querySelectorAll('#livro-cena .vela').forEach((v) => (v.innerHTML = VELA));
  let aoFechar = null, aberto = false;

  const vertical = () => matchMedia('(orientation: portrait) and (max-width: 720px)').matches;
  // A perspectiva vai em cada folha (e não no livro), para a ordem de empilhamento valer sempre.
  const pose = (angulo) => `perspective(2400px) rotate${vertical() ? 'X' : 'Y'}(${vertical() ? -angulo : angulo}deg)`;
  // Ordem de empilhamento: do lado direito (fechado) a capa fica por cima; depois de virar,
  // a ordem se inverte, como num livro de verdade (a capa vai para baixo de tudo).
  const pilha = (k, virada) => (virada ? 60 - k : 10 + k);
  const partes = () => [...livroEl.querySelectorAll('.capa, .folha')];

  function montar(amiga) {
    const itens = (GOSTOS[amiga.id] || []).map(([ic, texto]) => `<li><span class="ic">${ICONE[ic] || ic}</span><span>${texto}</span></li>`).join('');
    let h = `<div class="metade dura contracapa"></div>
      <div class="metade pagina-base"><div class="face lado-a pag-lista"><h3>Seu alvo gosta de...</h3><ul>${itens}</ul></div></div>`;
    for (let i = FOLHAS - 1; i >= 0; i--) {
      const ultima = i === FOLHAS - 1;
      h += `<div class="metade folha" data-i="${i}"><div class="face lado-a pautada"></div>
        <div class="face lado-b ${ultima ? 'pag-foto' : 'pautada'}">${ultima ? `<img src="${amiga.foto}" alt="Foto de ${amiga.nome}"><p>${amiga.nome}</p>` : ''}</div></div>`;
    }
    h += `<div class="metade dura capa"><div class="face lado-a"><span>Amiga<br>Secreta</span><i>Girls Night de Natal</i></div><div class="face lado-b"></div></div>`;
    livroEl.innerHTML = h;
  }

  // Coloca tudo na posição certa: livro fechado (0°) ou aberto (-180°).
  function posicionar(angulo) {
    const p = partes();
    cena.classList.toggle('vertical', vertical());
    p.forEach((el, k) => { el.style.transform = pose(angulo); el.style.zIndex = pilha(k, angulo !== 0); }); // a capa é a última no HTML
  }

  async function abrir(amiga, depois) {
    aoFechar = depois; aberto = false;
    montar(amiga);
    livroEl.classList.remove('aberto');
    btnFechar.classList.remove('visivel');
    cena.hidden = false;
    posicionar(0);

    const p = partes(), n = p.length;
    const capa = p[n - 1], folhas = p.slice(0, n - 1).reverse(); // folhas[0] é a de cima
    const fechado = vertical() ? 'translateY(-25%)' : 'translateX(-25%)';
    // Vira em duas metades: até ficar de perfil, troca a ordem de empilhamento, e termina de deitar.
    const virar = async (el, ms, atraso = 0) => {
      await el.animate([{ transform: pose(0) }, { transform: pose(-90) }], { duration: (ms / 2) * V, delay: atraso * V, easing: 'cubic-bezier(.5, 0, .9, .6)', fill: 'both' }).finished;
      el.style.zIndex = pilha(p.indexOf(el), true);
      await el.animate([{ transform: pose(-90) }, { transform: pose(-180) }], { duration: (ms / 2) * V, easing: 'cubic-bezier(.1, .4, .4, 1)', fill: 'both' }).finished;
    };

    // O livro fechado pousa na mesa...
    await livroEl.animate(
      [{ transform: `${fechado} translateY(-40px) scale(.92)`, opacity: 0 }, { transform: fechado, opacity: 1 }],
      { duration: 650 * V, easing: 'cubic-bezier(.2, .8, .3, 1)', fill: 'both' },
    ).finished;
    await esperar(350 * V);

    // ...a capa abre enquanto ele vai para o centro...
    const centralizar = livroEl.animate([{ transform: fechado }, { transform: 'none' }], { duration: 1100 * V, easing: 'cubic-bezier(.45, .05, .3, 1)', fill: 'both' }).finished;
    await Promise.all([centralizar, virar(capa, 1100)]);

    // ...e as páginas vão passando, uma atrás da outra.
    await Promise.all(folhas.map((f, i) => virar(f, 700, i * 260)));

    // Fixa o estado final sem depender das animações (assim girar o celular não desmonta o livro).
    [livroEl, ...p].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    aberto = true;
    posicionar(-180);
    livroEl.classList.add('aberto');
    await esperar(1200 * V);
    btnFechar.classList.add('visivel');
    btnFechar.focus();
  }

  btnFechar.addEventListener('click', () => {
    cena.hidden = true;
    livroEl.innerHTML = '';
    if (aoFechar) aoFechar();
  });
  addEventListener('resize', () => { if (!cena.hidden && aberto) posicionar(-180); });

  window.abrirLivro = abrir;
})();
