// src/utils/ordemInicial.js

export const carregaListaInicial = (dados, ITENS_FIXOS_POR_CLICKS) => {

  
  if (!Array.isArray(dados) || dados.length === 0) return dados;

  // 1. Separa premium dos normais
  const premium = dados.filter(item => item?.anuncio?.premium === true);
  const normais = dados.filter(item => !item?.anuncio?.premium);

  // 2. Premium no topo, ordenados por clicks
  const premiumOrdenado = [...premium].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  // 3. Normais com clicks > 0
  const normaisComClicks = normais.filter(item => (item.clicks || 0) > 0);
  const normaisSemClicks = normais.filter(item => (item.clicks || 0) === 0);

  let podium = []; // Apenas os top 3 com mais clicks
  let restantes = []; // Todos os outros normais (inclui com poucos clicks)

  if (normaisComClicks.length > 0) {
    // Ordena por clicks decrescente
    normaisComClicks.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    // Pega apenas os 3 primeiros (ou menos, se não tiver 3)
    podium = normaisComClicks.slice(0, ITENS_FIXOS_POR_CLICKS);

    // O resto dos com clicks vai para os restantes (serão embaralhados)
    restantes = normaisComClicks.slice(ITENS_FIXOS_POR_CLICKS);
  }

  // 4. Embaralha todos os restantes (com clicks baixos + sem clicks)
  const todosRestantes = [...restantes, ...normaisSemClicks];
  const embaralhados = [...todosRestantes];
  for (let i = embaralhados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhados[i], embaralhados[j]] = [embaralhados[j], embaralhados[i]];
  }

  // 5. Lista final: premium → top 3 por clicks → resto embaralhado
  return [...premiumOrdenado, ...podium, ...embaralhados];
};