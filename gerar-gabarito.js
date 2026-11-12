// Faz o sorteio do amigo secreto e grava o resultado em gabarito.txt.
// Rode UMA vez antes de publicar na Vercel:   node gerar-gabarito.js
// Para sortear tudo de novo:                  node gerar-gabarito.js --novo
// O resultado não aparece na tela. Para conferir, abra o gabarito.txt.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const NOMES = ['Lara', 'Júlia', 'Shayra', 'Karol', 'Cynthia'];
const ARQUIVO = path.join(__dirname, 'gabarito.txt');

if (fs.existsSync(ARQUIVO) && !process.argv.includes('--novo')) {
  console.log('O gabarito.txt já existe e foi mantido. Para sortear de novo: node gerar-gabarito.js --novo');
  process.exit(0);
}

const embaralhar = (lista) => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

// As participantes sorteiam em ordem aleatória. Cada uma tira, ao acaso, alguém
// que ainda não foi tirada, que não seja ela mesma e que não a tenha tirado
// (se Shayra tirou Cynthia, Cynthia não pode tirar Shayra). Se alguém ficar sem
// opção, o sorteio inteiro é refeito.
function sortear() {
  for (;;) {
    const ordem = embaralhar(NOMES);
    let restantes = [...NOMES];
    const pares = [];
    for (const quem of ordem) {
      const tirouEla = pares.find(([, amiga]) => amiga === quem);
      const opcoes = restantes.filter((nome) => nome !== quem && !(tirouEla && nome === tirouEla[0]));
      if (!opcoes.length) break;
      const amiga = opcoes[crypto.randomInt(opcoes.length)];
      restantes = restantes.filter((nome) => nome !== amiga);
      pares.push([quem, amiga]);
    }
    if (pares.length === NOMES.length) return pares;
  }
}

const quando = new Date().toLocaleString('pt-BR');
fs.writeFileSync(ARQUIVO, sortear().map(([quem, amiga]) => `${quem} tirou ${amiga}`).join('\r\n') + `\r\n\r\nSorteio feito em ${quando}\r\n`, 'utf8');
console.log('Sorteio feito! Resultado gravado em gabarito.txt (não abra se você também participa).');
