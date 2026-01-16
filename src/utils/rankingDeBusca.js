// src/utils/rankingDeBusca.js

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
  'assim', 'então', 'agora', 'aqui', 'ali', 'lá', 'cá', 'bem', 'mal', 'sim'
]);

const k1 = 1.2;
const b = 0.75;
const delta = 1.0;

const PESO_NOME = 6.0;
const PESO_TAGS = 4.5;
const PESO_DESCRICAO = 1.0;

export function rankingDeBusca(dados, termo) {
  if (!termo?.trim() || dados.length === 0) return dados;

  const termoNormalizado = normalize(termo).toLowerCase().trim();

  const palavrasBusca = termoNormalizado
    .split(/\s+/)
    .filter(palavra => !STOP_WORDS.has(palavra));

  if (palavrasBusca.length === 0) return dados;

  const isBuscaPorUmaPalavra = palavrasBusca.length === 1;

  const totalDocumentos = dados.length;

  const documentos = dados.map(item => {

    
    const nome = normalize(item.nome || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? normalize(item.tags.join(' ')).toLowerCase() : '';
    const descricao = normalize(item.descricao || '').toLowerCase();
    
    const textoCompleto = `${nome} ${tags} ${descricao}`;
    
    return {
      item,
      nome,
      tags,
      descricao,
      textoCompleto,
      temAnuncioBusca: !!item.anuncio?.busca,
      temPremium: !!item.anuncio?.premium,
    };
  });

  // Document Frequency
  const df = {};
  palavrasBusca.forEach(palavra => {
    df[palavra] = documentos.filter(doc => 
      doc.nome.includes(palavra) || 
      doc.tags.includes(palavra) || 
      doc.descricao.includes(palavra)
    ).length;
  });
  
  const calcularBM25 = (tf, dl, avgdl, df) => {
    if (tf === 0) return 0;
    const idf = Math.log((totalDocumentos - df + 0.5) / (df + 0.5) + 1);
    const norm = tf * (k1 + 1) / (tf + k1 * (1 - b + b * (dl / avgdl)));
    return idf * (norm + delta);
  };

  const scored = documentos.map(doc => {
    let score = 0;

    palavrasBusca.forEach(palavra => {
      const tfNome = (doc.nome.match(new RegExp(palavra, 'g')) || []).length;
      const tfTags = (doc.tags.match(new RegExp(palavra, 'g')) || []).length;
      const tfDescricao = (doc.descricao.match(new RegExp(palavra, 'g')) || []).length;

      const avgNome = 5;
      const avgTags = 8;
      const avgDesc = 20;

      score += calcularBM25(tfNome, doc.nome.split(/\s+/).length || 1, avgNome, df[palavra]) * PESO_NOME;
      score += calcularBM25(tfTags, doc.tags.split(/\s+/).length || 1, avgTags, df[palavra]) * PESO_TAGS;
      score += calcularBM25(tfDescricao, doc.descricao.split(/\s+/).length || 1, avgDesc, df[palavra]) * PESO_DESCRICAO;
    });

    // Boosts
    if (isBuscaPorUmaPalavra && doc.nome.includes(palavrasBusca[0])) {
      score *= 4.0;
    }

    if (doc.textoCompleto.includes(termoNormalizado)) {
      score *= 2.5;
    }

    if (doc.temAnuncioBusca && score > 0) {
      score *= 20;
    } else if (doc.temPremium) {
      score *= 2.0;
    }

    return { item: doc.item, score };
  });

  // ORDENA POR SCORE (mesmo se score for baixo)
  scored.sort((a, b) => b.score - a.score);

  const resultados = scored.map(s => s.item);

  console.log(dados);


  // Se nenhum item tiver score (raro), retorna tudo
  return resultados.length > 0 ? resultados : dados;
}