import { normalize } from './normalize';

// Lista de stop words (mantida igual)
const STOP_WORDS = new Set([
  'a', 'o', 'as', 'os',
  'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas',
  'com', 'para', 'por', 'sem', 'sob', 'sobre',
  'um', 'uma', 'uns', 'umas',
  'e', 'ou', 'mas', 'que', 'se',
  'ao', 'à', 'às', 'aos',
  'pelo', 'pela', 'pelos', 'pelas',
  'entre', 'até', 'desde',
  'não', 'nem', 'também', 'mais', 'menos', 'muito', 'pouco',
  'todo', 'toda', 'todos', 'todas', 'este', 'esta', 'esses', 'essas',
  'esse', 'essa', 'aquele', 'aquela', 'aqueles', 'aquelas',
  'isto', 'isso', 'aquilo', 'me', 'te', 'lhe', 'nos', 'vos',
  'mim', 'ti', 'si', 'contigo', 'consigo',
  'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas',
  'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas',
  'já', 'ainda', 'só', 'apenas', 'quando', 'onde', 'como', 'porque',
  'assim', 'então', 'agora', 'aqui', 'ali', 'lá', 'cá',
  'bem', 'mal', 'sim',
  'é', 'era', 'foi', 'ser', 'está', 'estão', 'estar', 'tem', 'têm',
  'ter', 'havia', 'há', 'vai',
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas',
  'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas'
]);

// Parâmetros BM25
const k1 = 1.2;
const b = 0.75;
const delta = 1.0;

export function rankingDeBusca(dados, termo) {
  if (!termo?.trim()) return [];

  const termoNormalizado = normalize(termo);

  const palavrasQuery = termoNormalizado
    .split(/\s+/)
    .filter(palavra => palavra.length >= 3 && !STOP_WORDS.has(palavra))
    .filter(Boolean);

  if (palavrasQuery.length === 0) return [];

  const termoCompleto = palavrasQuery.join(' ');

  // Pré-computa textos para busca: tags + descrição
  const textosCompletos = dados.map(item => {
    const tagsText = Array.isArray(item.tags) ? normalize(item.tags.join(' ')) : '';
    const descText = item.descricao ? normalize(item.descricao) : '';
    // Junta tags e descrição (prioriza tags colocando primeiro)
    return `${tagsText} ${descText}`.trim();
  });

  const N = dados.length;
  const avgdl = textosCompletos.reduce((sum, text) => sum + text.split(/\s+/).length, 0) / N || 1;

  // Document frequency baseado no texto completo (tags + descrição)
  const docFreq = {};
  palavrasQuery.forEach(word => {
    docFreq[word] = textosCompletos.filter(text => text.includes(word)).length;
  });

  const itensComScore = dados.map((item, index) => {
    const fullText = textosCompletos[index];
    if (!fullText) return null;

    const dl = fullText.split(/\s+/).length;

    // Separamos para calcular scores individuais (tags vs descrição)
    const tagsText = Array.isArray(item.tags) ? normalize(item.tags.join(' ')) : '';
    const descText = item.descricao ? normalize(item.descricao) : '';

    let scoreTags = 0;
    let scoreDesc = 0;

    palavrasQuery.forEach(word => {
      // Score nas tags
      if (tagsText.includes(word)) {
        const tf = (tagsText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        const idf = Math.log((N - docFreq[word] + 0.5) / (docFreq[word] + 0.5) + 1);
        const norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgdl)));
        scoreTags += idf * (norm + delta);
      }

      // Score na descrição
      if (descText.includes(word)) {
        const tf = (descText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        const idf = Math.log((N - docFreq[word] + 0.5) / (docFreq[word] + 0.5) + 1);
        const norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgdl)));
        scoreDesc += idf * (norm + delta);
      }
    });

    // Peso maior para tags (elas são mais específicas), mas descrição ajuda
    let score = (scoreTags * 2.0) + scoreDesc; // tags valem o dobro

    if (score === 0) return null;

    // Boosts existentes
    if (item?.anuncio?.busca) {
      score *= 3.0;
    } else if (item?.anuncio?.premium) {
      score *= 1.5;
    }

    // Boost por frase exata (em tags ou descrição)
    if (tagsText.includes(termoCompleto) || descText.includes(termoCompleto)) {
      score *= 2.0;
    }

    // Boost leve se a frase original (com stop words) aparecer em qualquer lugar
    const textoOriginalNormalizado = normalize((item.tags?.join(' ') || '') + ' ' + (item.descricao || ''));
    if (textoOriginalNormalizado.includes(termoNormalizado)) {
      score *= 1.3;
    }

    return { item, score };
  }).filter(Boolean);

  itensComScore.sort((a, b) => b.score - a.score);

  return itensComScore.map(x => x.item);
}