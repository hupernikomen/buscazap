// src/utils/buscaInteligente.js

import Fuse from 'fuse.js';

const OPTIONS = {
  includeScore: true,
  threshold: 0.4, // 0.4 é bom: tolera erros, mas não retorna tudo
  keys: [
    { name: 'nome', weight: 0.7 },
    { name: 'tags', weight: 0.2 },
    { name: 'descricao', weight: 0.1 },
  ],
  getFn: (obj, path) => {
    if (path === 'tags') {
      return obj.tags || [];
    }
    return Fuse.config.getFn(obj, path);
  },
  shouldSort: true,
  minMatchCharLength: 2, // mínimo 2 letras para buscar
  findAllMatches: true,
  ignoreLocation: true,
};

export function buscaInteligente(dados, termo) {
  if (!termo?.trim() || dados.length === 0) return dados;

  const termoLimpo = termo.trim();

  // Se o termo for muito curto (1 letra ou menos), não busca
  if (termoLimpo.length < 2) return [];

  const listaParaBusca = dados.map(item => ({
    original: item,
    nome: item.nome || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    descricao: item.descricao || '',
  }));

  const fuse = new Fuse(listaParaBusca, OPTIONS);

  const resultados = fuse.search(termoLimpo);

  // Filtra apenas resultados com score bom (menor que 0.6 = match razoável)
  const bonsResultados = resultados.filter(r => r.score < 0.6);

  const itensEncontrados = bonsResultados.map(r => r.item.original);

  // Se não encontrou nada bom, retorna vazio (mostra "Sem resultados")
  return itensEncontrados.length > 0 ? itensEncontrados : [];
}