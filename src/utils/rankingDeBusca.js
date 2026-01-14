import { normalize } from './normalize';

const STOP_WORDS = new Set([
  'a', 'o', 'as', 'os', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'com', 'para', 'por', 'sem', 'sob', 'sobre', 'um', 'uma', 'uns', 'umas', 'e', 'ou',
  'mas', 'que', 'se', 'ao', 'à', 'às', 'aos', 'pelo', 'pela', 'pelos', 'pelas', 'entre',
  'até', 'desde', 'não', 'nem', 'também', 'mais', 'menos', 'muito', 'pouco', 'todo',
  'toda', 'todos', 'todas', 'este', 'esta', 'esses', 'essas', 'esse', 'essa', 'aquele',
  'aquela', 'aqueles', 'aquelas', 'isto', 'isso', 'aquilo', 'me', 'te', 'lhe', 'nos',
  'vos', 'mim', 'ti', 'si', 'contigo', 'consigo', 'meu', 'minha', 'meus', 'minhas',
  'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa',
  'nossos', 'nossas', 'já', 'ainda', 'só', 'apenas', 'quando', 'onde', 'como', 'porque',
  'assim', 'então', 'agora', 'aqui', 'ali', 'lá', 'cá', 'bem', 'mal', 'sim', 'é', 'era',
  'foi', 'ser', 'está', 'estão', 'estar', 'tem', 'têm', 'ter', 'havia', 'há', 'vai',
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'outro', 'outra', 'outros',
  'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas'
]);

// Parâmetros BM25 (valores padrão comuns + BM25+ com delta)
const k1 = 1.2;
const b = 0.75;
const delta = 1.0;

// Pesos por campo (ajustáveis)
const PESO_NOME = 3.0;    // Mais importante que descrição, menos que tags
const PESO_TAGS = 4.0;    // Mais específico
const PESO_DESC = 1.0;    // Menos específico

export function rankingDeBusca(dados, termo) {
  if (!termo?.trim() || dados.length === 0) return [];

  const termoNormalizado = normalize(termo).trim();

  const palavrasQuery = termoNormalizado
    .split(/\s+/)
    .filter(palavra => palavra.length >= 3 && !STOP_WORDS.has(palavra))
    .filter(Boolean);

  if (palavrasQuery.length === 0) return [];

  const termoCompletoSemStops = palavrasQuery.join(' ');
  const regexPalavras = palavrasQuery.map(word => new RegExp(`\\b${word}\\b`, 'g'));
  const regexFraseSemStops = new RegExp(`\\b${termoCompletoSemStops}\\b`);

  const N = dados.length;

  // Pré-processamento: normaliza e tokeniza os campos de cada item
  const documentos = dados.map(item => {
    const nome = item.nome ? normalize(item.nome) : '';
    const tags = Array.isArray(item.tags) ? normalize(item.tags.join(' ')) : '';
    const desc = item.descricao ? normalize(item.descricao) : '';

    const tokensNome = nome.split(/\s+/).filter(Boolean);
    const tokensTags = tags.split(/\s+/).filter(Boolean);
    const tokensDesc = desc.split(/\s+/).filter(Boolean);

    const textoCompleto = `${nome} ${tags} ${desc}`.trim();

    return {
      item,
      nome,
      tags,
      desc,
      tokensNome,
      tokensTags,
      tokensDesc,
      textoCompleto,
      dlNome: tokensNome.length,
      dlTags: tokensTags.length,
      dlDesc: tokensDesc.length,
    };
  });

  // Cálculo do avgdl por campo
  const avgdlNome = documentos.reduce((sum, doc) => sum + doc.dlNome, 0) / N || 1;
  const avgdlTags = documentos.reduce((sum, doc) => sum + doc.dlTags, 0) / N || 1;
  const avgdlDesc = documentos.reduce((sum, doc) => sum + doc.dlDesc, 0) / N || 1;

  // Document Frequency correto (com word boundaries)
  const docFreq = {};
  palavrasQuery.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`);
    docFreq[word] = documentos.filter(doc => regex.test(doc.textoCompleto)).length;
  });

  // Função auxiliar para calcular BM25 de um termo em um campo
  function bm25Score(tf, dl, avgdl, df) {
    if (tf === 0) return 0;
    const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
    const norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgdl)));
    return idf * (norm + delta);
  }

  const itensComScore = documentos.map(doc => {
    let scoreNome = 0;
    let scoreTags = 0;
    let scoreDesc = 0;

    palavrasQuery.forEach((word, i) => {
      const regex = regexPalavras[i];
      const tfNome = (doc.nome.match(regex) || []).length;
      const tfTags = (doc.tags.match(regex) || []).length;
      const tfDesc = (doc.desc.match(regex) || []).length;

      scoreNome += bm25Score(tfNome, doc.dlNome, avgdlNome, docFreq[word]);
      scoreTags += bm25Score(tfTags, doc.dlTags, avgdlTags, docFreq[word]);
      scoreDesc += bm25Score(tfDesc, doc.dlDesc, avgdlDesc, docFreq[word]);
    });

    // Score final ponderado por campo
    let score = 
      scoreNome * PESO_NOME +
      scoreTags * PESO_TAGS +
      scoreDesc * PESO_DESC;

    if (score === 0) return null;

    // Boosts comerciais
    if (doc.item?.anuncio?.busca) {
      score *= 3.0;
    } else if (doc.item?.anuncio?.premium) {
      score *= 1.5;
    }

    // Boost por frase exata (sem stop words)
    if (regexFraseSemStops.test(doc.nome) || 
        regexFraseSemStops.test(doc.tags) || 
        regexFraseSemStops.test(doc.desc)) {
      score *= 2.0;
    }

    // Boost leve se a query original normalizada aparecer inteira em qualquer campo
    if (doc.textoCompleto.includes(termoNormalizado)) {
      score *= 1.3;
    }

    return { item: doc.item, score };
  }).filter(Boolean);

  itensComScore.sort((a, b) => b.score - a.score);

  return itensComScore.map(x => x.item);
}