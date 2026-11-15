// Função da Vercel: faz o sorteio na hora para quem pediu e grava no banco.
// Devolve só a amiga secreta de quem perguntou.

const { sortear } = require('../lib/sorteio');

module.exports = async (req, res) => {
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

  try {
    const amiga = await sortear(corpo && corpo.quem);
    console.log(`${corpo.quem} fez o sorteio.`); // aparece nos logs da Vercel, sem revelar quem foi tirada
    res.status(200).json({ amiga: { nome: amiga.nome, foto: amiga.foto } });
  } catch (e) {
    if (!e.status) console.error(e);
    res.status(e.status || 500).json({ erro: e.status ? e.message : 'Não foi possível sortear agora. Tente de novo.' });
  }
};
