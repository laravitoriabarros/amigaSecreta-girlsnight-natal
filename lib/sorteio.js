// Regras do sorteio e acesso ao banco (Upstash Redis, ligado ao projeto pela Vercel).
// Usado pelas funções da pasta api/ e pelo script gabarito.js.

const crypto = require('crypto');

const PARTICIPANTES = [
  { id: 'lara', nome: 'Lara' },
  { id: 'julia', nome: 'Júlia' },
  { id: 'shayra', nome: 'Shayra' },
  { id: 'karol', nome: 'Karol' },
  { id: 'cynthia', nome: 'Cynthia' },
].map((p) => ({ ...p, foto: `imagens/participantes/${p.id}.jpg` }));
const porId = new Map(PARTICIPANTES.map((p) => [p.id, p]));

const CHAVE_PARES = 'amiga-secreta:pares'; // campo = quem sorteou, valor = { amiga, quando }
const CHAVE_TRAVA = 'amiga-secreta:trava'; // impede dois sorteios ao mesmo tempo

/* ============ Banco ============ */
function credenciais() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis(...comando) {
  const c = credenciais();
  if (!c) throw new ErroSorteio(500, 'O sorteio ainda não foi configurado. Avise a organizadora.');
  const r = await fetch(c.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comando),
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok || dados.error) throw new Error(`Redis: ${dados.error || r.status}`);
  return dados.result;
}

class ErroSorteio extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// { idDeQuemSorteou: { amiga: id, quando: ISO } }
async function lerPares() {
  const lista = (await redis('HGETALL', CHAVE_PARES)) || [];
  const pares = {};
  for (let i = 0; i < lista.length; i += 2) {
    try {
      const v = JSON.parse(lista[i + 1]);
      if (porId.has(lista[i]) && porId.has(v.amiga)) pares[lista[i]] = v;
    } catch {}
  }
  return pares;
}

/* ============ Regras ============ */
// Todas as formas de completar o sorteio a partir do que já saiu, respeitando:
// ninguém tira a si mesma, cada uma é tirada uma única vez e ninguém tira quem a tirou.
function completarSorteio(feitos) {
  const ids = PARTICIPANTES.map((p) => p.id), solucoes = [];
  const atual = { ...feitos }, usados = new Set(Object.values(feitos));
  (function tentar(i) {
    if (i === ids.length) return void solucoes.push({ ...atual });
    const quem = ids[i];
    if (feitos[quem]) return tentar(i + 1);
    for (const alvo of ids) {
      if (alvo === quem || usados.has(alvo) || atual[alvo] === quem) continue;
      usados.add(alvo); atual[quem] = alvo;
      tentar(i + 1);
      usados.delete(alvo); delete atual[quem];
    }
  })(0);
  return solucoes;
}

// Sorteia na hora para quem pediu. Escolhe ao acaso um sorteio completo que ainda
// é possível e usa só a parte desta pessoa: assim ninguém que vier depois fica sem opção.
async function sortear(id) {
  const quem = porId.get(id);
  if (!quem) throw new ErroSorteio(400, 'Participante desconhecida.');

  const ficha = crypto.randomUUID();
  let travou = false;
  for (let i = 0; i < 40 && !travou; i++) {
    travou = (await redis('SET', CHAVE_TRAVA, ficha, 'NX', 'PX', '8000')) === 'OK';
    if (!travou) await new Promise((r) => setTimeout(r, 150));
  }
  if (!travou) throw new ErroSorteio(503, 'Muita gente sorteando ao mesmo tempo. Tente de novo.');

  try {
    const pares = await lerPares();
    if (pares[quem.id]) throw new ErroSorteio(409, `${quem.nome}, você já fez o seu sorteio!`);

    const feitos = Object.fromEntries(Object.entries(pares).map(([q, v]) => [q, v.amiga]));
    const solucoes = completarSorteio(feitos);
    if (!solucoes.length) throw new ErroSorteio(500, 'O sorteio ficou sem saída. Avise a organizadora.');

    const amiga = porId.get(solucoes[crypto.randomInt(solucoes.length)][quem.id]);
    const gravou = await redis('HSETNX', CHAVE_PARES, quem.id, JSON.stringify({ amiga: amiga.id, quando: new Date().toISOString() }));
    if (!gravou) throw new ErroSorteio(409, `${quem.nome}, você já fez o seu sorteio!`);
    return amiga;
  } finally {
    await redis('DEL', CHAVE_TRAVA).catch(() => {});
  }
}

async function estado() {
  const pares = await lerPares();
  // Só diz QUEM já sorteou, nunca quem foi tirada.
  return PARTICIPANTES.map((p) => ({ ...p, jaSorteou: Boolean(pares[p.id]) }));
}

async function reiniciar() {
  await redis('DEL', CHAVE_PARES, CHAVE_TRAVA);
}

module.exports = { PARTICIPANTES, porId, ErroSorteio, completarSorteio, sortear, estado, lerPares, reiniciar, credenciais };
