// Ferramenta da organizadora (roda no computador, não no site).
//
//   node gabarito.js              baixa quem tirou quem e grava em gabarito.txt
//   node gabarito.js --reiniciar  apaga o sorteio do banco para começar de novo
//
// Precisa das credenciais do banco num arquivo .env.local nesta pasta
// (KV_REST_API_URL e KV_REST_API_TOKEN, copiados da Vercel). Esse arquivo não vai para o GitHub.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Carrega .env.local / .env sem depender de nenhum pacote.
for (const nome of ['.env.local', '.env']) {
  const arquivo = path.join(__dirname, nome);
  if (!fs.existsSync(arquivo)) continue;
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const { PARTICIPANTES, porId, lerPares, reiniciar, credenciais } = require('./lib/sorteio');
const ARQUIVO = path.join(__dirname, 'gabarito.txt');

const perguntar = (texto) => new Promise((ok) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(texto, (r) => { rl.close(); ok(r); });
});

(async () => {
  if (!credenciais()) {
    console.error('Faltam as credenciais do banco. Crie o arquivo .env.local com KV_REST_API_URL e KV_REST_API_TOKEN.');
    process.exit(1);
  }

  if (process.argv.includes('--reiniciar')) {
    const r = await perguntar('Isso apaga TODO o sorteio e não tem volta. Digite APAGAR para confirmar: ');
    if (r.trim() !== 'APAGAR') return console.log('Nada foi apagado.');
    await reiniciar();
    if (fs.existsSync(ARQUIVO)) fs.unlinkSync(ARQUIVO);
    return console.log('Sorteio apagado. Todas podem sortear de novo.');
  }

  const pares = await lerPares();
  const data = (iso) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const linhas = Object.entries(pares)
    .sort((a, b) => a[1].quando.localeCompare(b[1].quando))
    .map(([quem, v]) => `${porId.get(quem).nome} tirou ${porId.get(v.amiga).nome} (${data(v.quando)})`);
  const faltam = PARTICIPANTES.filter((p) => !pares[p.id]).map((p) => p.nome);
  if (faltam.length) linhas.push('', `Ainda não sortearam: ${faltam.join(', ')}`);

  fs.writeFileSync(ARQUIVO, linhas.join('\r\n') + '\r\n', 'utf8');
  console.log(`gabarito.txt atualizado: ${Object.keys(pares).length} de ${PARTICIPANTES.length} já sortearam.`);
})().catch((e) => {
  console.error('Não foi possível falar com o banco:', e.message);
  process.exit(1);
});
