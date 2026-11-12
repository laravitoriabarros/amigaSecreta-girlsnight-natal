// Função da Vercel: consulta o gabarito e devolve SÓ a amiga secreta de quem perguntou.
// O gabarito vem da variável de ambiente GABARITO (cole nela o conteúdo do gabarito.txt)
// ou, se ela não existir, do arquivo gabarito.txt na raiz do projeto.
// Nenhum dos dois é acessível pelo site.

const fs = require('fs');
const path = require('path');

const PARTICIPANTES = [
  { id: 'lara', nome: 'Lara' },
  { id: 'julia', nome: 'Júlia' },
  { id: 'shayra', nome: 'Shayra' },
  { id: 'karol', nome: 'Karol' },
  { id: 'cynthia', nome: 'Cynthia' },
];
const porNome = new Map(PARTICIPANTES.map((p) => [p.nome, p]));
const porId = new Map(PARTICIPANTES.map((p) => [p.id, p]));

function lerGabarito() {
  let texto = process.env.GABARITO || null;
  for (const caminho of [path.join(__dirname, '..', 'gabarito.txt'), path.join(process.cwd(), 'gabarito.txt')]) {
    if (texto) break;
    try {
      texto = fs.readFileSync(caminho, 'utf8');
    } catch {}
  }
  if (!texto) return null;

  // Aceita uma por linha ou tudo numa linha só ("Lara tirou X; Júlia tirou Y; ...").
  const pares = {};
  for (const m of texto.matchAll(/(\p{L}+) tirou (\p{L}+)/gu)) {
    const quem = porNome.get(m[1]);
    const amiga = porNome.get(m[2]);
    if (quem && amiga) pares[quem.id] = amiga.id;
  }
  // Só vale se estiver completo: todas tiram alguém, todas são tiradas, ninguém tira a si mesma.
  const tiradas = new Set(Object.values(pares));
  const valido = PARTICIPANTES.every((p) => pares[p.id] && pares[p.id] !== p.id && tiradas.has(p.id));
  return valido ? pares : null;
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });

  let corpo = req.body;
  if (typeof corpo === 'string') {
    try {
      corpo = JSON.parse(corpo);
    } catch {
      corpo = null;
    }
  }
  const quem = porId.get(corpo && corpo.quem);
  if (!quem) return res.status(400).json({ erro: 'Participante desconhecida.' });

  const pares = lerGabarito();
  if (!pares) return res.status(500).json({ erro: 'O sorteio ainda não está pronto. Avise a organizadora.' });

  const amiga = porId.get(pares[quem.id]);
  console.log(`${quem.nome} abriu a sua carta.`); // aparece nos logs da Vercel (sem revelar quem foi tirada)
  res.status(200).json({ amiga: { nome: amiga.nome, foto: `imagens/participantes/${amiga.id}.jpg` } });
};
