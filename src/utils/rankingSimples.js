// src/utils/rankingSimples.js

import { normalize } from './normalize';

export const rankingSimples = (dados, termo) => {
  if (!termo?.trim()) return dados;

  const termoNorm = normalize(termo.trim());
  const palavras = termoNorm.split(/\s+/).filter(p => p.length >= 3);
  const fraseCompleta = palavras.join(' ');

  return dados
    .map(item => {
      const nome = normalize(item.nome || '');
      const tags = normalize(item.tags?.join(' ') || '');
      const desc = normalize(item.descricao || '');

      let score = 0;

      // Frase exata tem prioridade máxima
      if (nome.includes(fraseCompleta) || tags.includes(fraseCompleta) || desc.includes(fraseCompleta)) {
        score += 100;
      }

      // Palavras no nome da loja
      palavras.forEach(p => {
        if (nome.includes(p)) score += 12;
      });

      // Palavras nas tags (mais importante)
      palavras.forEach(p => {
        if (tags.includes(p)) score += 15;
      });

      // Palavras na descrição
      palavras.forEach(p => {
        if (desc.includes(p)) score += 5;
      });

      // Boosts de anúncio
      if (item.anuncio?.busca) score *= 3.0;
      else if (item.anuncio?.premium) score *= 1.7;

      return { item, score };
    })
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(i => i.item);
};