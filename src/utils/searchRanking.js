import { normalize } from '../../src/utils/normalize'; // ajuste o caminho se necessário


export function rankearResultados(dados, termo) {
  if (!termo) return []; // Será tratado fora (ordem inicial)

  const palavrasBusca = normalize(termo).split(/\s+/).filter(Boolean);
  const termoCompleto = normalize(termo);
  const temMaisDeUmaPalavra = palavrasBusca.length > 1;

  const contarAcertosNasTags = (item) => {
    if (!Array.isArray(item.tags) || item.tags.length === 0) return 0;
    const tagsTexto = normalize(item.tags.join(' '));
    return palavrasBusca.filter(p => tagsTexto.includes(p)).length;
  };

  const temBuscaExata = (item) => {
    if (!Array.isArray(item.tags)) return false;
    const tagsTexto = normalize(item.tags.join(' '));
    return tagsTexto.includes(termoCompleto);
  };

  const temRelevancia = (item) => contarAcertosNasTags(item) > 0;

  const itensComScore = dados.map(item => {
    const acertos = contarAcertosNasTags(item);
    let score = 0;
    let prioridade = 0;

    if (temBuscaExata(item)) {
      if (item?.anuncio?.busca) {
        prioridade = 7;
        score = 99999999 + acertos * 1000000;
      } else {
        prioridade = 6;
        score = 9999999 + acertos * 100000;
      }
    } else if (item?.anuncio?.busca && temRelevancia(item)) {
      const minimoExigido = temMaisDeUmaPalavra ? 2 : 1;
      if (acertos >= minimoExigido) {
        prioridade = 5;
        score = 999999 + acertos * 10000;
      } else {
        prioridade = 1;
        score = acertos * 10;
      }
    } else if (temRelevancia(item)) {
      prioridade = 4;
      score = acertos * 1000;
    } else if (item?.anuncio?.premium && temRelevancia(item)) {
      prioridade = 3;
      score = acertos * 100;
    } else if (temRelevancia(item)) {
      prioridade = 2;
      score = acertos * 1;
    } else {
      return null;
    }

    return { item, score, prioridade };
  }).filter(Boolean);

  itensComScore.sort((a, b) => {
    if (b.prioridade !== a.prioridade) return b.prioridade - a.prioridade;
    return b.score - a.score;
  });

  return itensComScore.map(x => x.item);
}