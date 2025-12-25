import { normalize } from './normalize'; // ajuste o caminho se necessário
// Importa a função 'normalize' de outro arquivo. 
// Essa função provavelmente remove acentos, transforma em minúsculas e padroniza o texto 
// para permitir buscas insensíveis a acentos e maiúsculas/minúsculas (ex: "Café" → "cafe").

export function hankingDeBusca(dados, termo) {
  // Função principal exportada. Recebe:
  // - dados: array de objetos (lojas/anúncios) vindos do Firestore
  // - termo: string digitada pelo usuário na busca
  // Retorna os itens ordenados por relevância

  if (!termo) return []; 
  // Se não houver termo de busca (campo vazio), retorna array vazio.
  // A ordenação inicial (sem busca) é tratada em outro lugar (carregaListaInicia).

  const palavrasBusca = normalize(termo).split(/\s+/).filter(Boolean);
  // Normaliza o termo (remove acentos, minúsculas) e divide em palavras individuais.
  // Ex: "Pizza Delivery Teresina" → ["pizza", "delivery", "teresina"]
  // .filter(Boolean) remove palavras vazias caso haja espaços duplicados.

  const termoCompleto = normalize(termo);
  // Versão normalizada do termo completo (com espaços), usada para busca exata.
  // Ex: "pizza delivery" como string única.

  const temMaisDeUmaPalavra = palavrasBusca.length > 1;
  // Verifica se a busca tem mais de uma palavra. 
  // Isso é usado depois para exigir mais acertos em anúncios com 'busca' ativada.

  const contarAcertosNasTags = (item) => {
    // Função auxiliar que conta quantas palavras da busca aparecem nas tags do item
    if (!Array.isArray(item.tags) || item.tags.length === 0) return 0;
    // Se não tiver tags ou não for array, retorna 0 acertos
    const tagsTexto = normalize(item.tags.join(' '));
    // Junta todas as tags em uma string e normaliza (ex: ["Pizza", "Delivery"] → "pizza delivery")
    return palavrasBusca.filter(p => tagsTexto.includes(p)).length;
    // Conta quantas palavras da busca estão presentes nas tags
  };

  const temBuscaExata = (item) => {
    // Verifica se o termo completo (com espaços) aparece exatamente nas tags
    if (!Array.isArray(item.tags)) return false;
    const tagsTexto = normalize(item.tags.join(' '));
    return tagsTexto.includes(termoCompleto);
    // Ex: busca "pizza delivery" → true se tags contiverem exatamente essa sequência
  };

  const temRelevancia = (item) => contarAcertosNasTags(item) > 0;
  // Função simples: o item tem pelo menos 1 palavra da busca nas tags?

  const itensComScore = dados.map(item => {
    // Percorre todos os itens e calcula score e prioridade para cada um
    const acertos = contarAcertosNasTags(item);
    // Quantas palavras da busca foram encontradas nas tags

    let score = 0;        // Pontuação numérica para desempate dentro da mesma prioridade
    let prioridade = 0;   // Nível de prioridade (quanto maior, mais no topo)

    // REGRA 1: Busca exata (termo completo aparece nas tags)
    if (temBuscaExata(item)) {
      if (item?.anuncio?.busca) {
        // Maior prioridade possível: tem busca exata + anúncio com destaque de busca pago
        prioridade = 7;
        score = 99999999 + acertos * 1000000; // Score altíssimo
      } else {
        // Busca exata, mas sem destaque pago
        prioridade = 6;
        score = 9999999 + acertos * 100000;
      }

    // REGRA 2: Tem destaque de busca pago (anuncio.busca = true), mas sem busca exata
    } else if (item?.anuncio?.busca && temRelevancia(item)) {
      const minimoExigido = temMaisDeUmaPalavra ? 2 : 1;
      // Se busca tem mais de uma palavra, exige pelo menos 2 acertos para ter alta prioridade
      if (acertos >= minimoExigido) {
        prioridade = 5;
        score = 999999 + acertos * 10000;
      } else {
        // Poucos acertos → prioridade baixa
        prioridade = 1;
        score = acertos * 10;
      }

    // REGRA 3: Relevância normal (sem destaque de busca, mas tem palavras da busca)
    } else if (temRelevancia(item)) {
      prioridade = 4;
      score = acertos * 1000;

    // REGRA 4: Anúncio premium (destaque visual), mas sem busca exata
    } else if (item?.anuncio?.premium && temRelevancia(item)) {
      prioridade = 3;
      score = acertos * 100;

    // REGRA 5: Relevância mínima (qualquer item com pelo menos 1 palavra)
    } else if (temRelevancia(item)) {
      prioridade = 2;
      score = acertos * 1;

    // Nenhum critério atendido → descarta o item
    } else {
      return null;
    }

    // Retorna o item com sua pontuação calculada
    return { item, score, prioridade };
  }).filter(Boolean);
  // Remove itens que retornaram null (sem relevância nenhuma)

  // Ordenação final:
  itensComScore.sort((a, b) => {
    if (b.prioridade !== a.prioridade) return b.prioridade - a.prioridade;
    // Primeiro ordena por prioridade (maior prioridade no topo)
    return b.score - a.score;
    // Depois, dentro da mesma prioridade, ordena por score (maior score no topo)
  });

  // Retorna apenas os itens (sem os scores), na ordem final de relevância
  return itensComScore.map(x => x.item);
}