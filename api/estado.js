// Função da Vercel: diz quem já sorteou (nunca quem foi tirada).

const { estado } = require('../lib/sorteio');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    res.status(200).json({ participantes: await estado() });
  } catch (e) {
    if (!e.status) console.error(e);
    res.status(e.status || 500).json({ erro: e.status ? e.message : 'Sem conexão com o sorteio. Tente de novo.' });
  }
};
