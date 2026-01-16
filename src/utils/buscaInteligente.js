// src/utils/buscaInteligente.js

import Fuse from 'fuse.js';

const OPTIONS = {
  includeScore: true,
  threshold: 0.0, // 0.0 = só matches muito bons, mas vamos compensar com boost manual
  keys: [
    { name: 'nome', weight: 0.8 }, // nome com peso altíssimo
    { name: 'tags', weight: 0.15 },
    { name: 'descricao', weight: 0.05 },
  ],
  getFn: (obj, path) => {
    if (path === 'tags') {
      return obj.tags || [];
    }
    return Fuse.config.getFn(obj, path);
  },
  shouldSort: true,
  minMatchCharLength: 1,
  findAllMatches: true,
  ignoreLocation: true, // ignora posição da palavra
  useExtendedSearch: true,
};

export function buscaInteligente(dados, termo) {
  if (!termo?.trim() || dados.length === 0) return dados;

  const termoLimpo = termo.trim().toLowerCase();

  const listaParaBusca = dados.map(item => ({
    original: item,
    nome: (item.nome || '').toLowerCase(),
    tags: Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [],
    descricao: (item.descricao || '').toLowerCase(),
  }));

  const fuse = new Fuse(listaParaBusca, OPTIONS);

  let resultados = fuse.search(termoLimpo);

  // Boost manual forte para garantir ordem correta
  resultados = resultados.map(result => {
    const item = result.item.original;
    const nomeLower = (item.nome || '').toLowerCase();
    let boost = 0;

    // Match exato no nome → topo absoluto
    if (nomeLower === termoLimpo) {
      boost = 5000;
    }
    // Nome contém o termo completo
    else if (nomeLower.includes(termoLimpo)) {
      boost = 3000;
    }
    // Nome começa com o termo
    else if (nomeLower.startsWith(termoLimpo)) {
      boost = 2000;
    }

    // Anúncio pago com busca=true → topo absoluto
    if (item.anuncio?.busca === true) {
      boost += 10000;
    } else if (item.anuncio?.premium === true) {
      boost += 2000;
    }

    return {
      item: item,
      score: result.score - boost, // menor = melhor
    };
  });

  // Ordenação final
  resultados.sort((a, b) => a.score - b.score);

  // Retorna todos os itens encontrados
  const final = resultados.map(r => r.item);

  // Fallback: se nada for encontrado, retorna tudo (evita lista vazia)
  return final.length > 0 ? final : dados;
}