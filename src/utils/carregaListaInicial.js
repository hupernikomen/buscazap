// // src/utils/ordemInicial.js (alterado)

// export const carregaListaInicial = (dados, ITENS_FIXOS_POR_CLICKS) => {
//   console.log(ITENS_FIXOS_POR_CLICKS);
  
//   if (!Array.isArray(dados) || dados.length === 0) return dados;

//   const premium = dados.filter(item => item?.anuncio?.premium === true);
//   const normais = dados.filter(item => !item?.anuncio?.premium);

//   const premiumOrdenado = [...premium].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

//   const normaisComClicks = normais.filter(item => (item.clicks || 0) > 0);
//   const normaisSemClicks = normais.filter(item => (item.clicks || 0) === 0);

//   let podium = [];
//   let restantes = [];

//   if (normaisComClicks.length > 0) {
//     normaisComClicks.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

//     // Marcar os top N como destaque
//     podium = normaisComClicks.slice(0, ITENS_FIXOS_POR_CLICKS).map(item => ({
//       ...item,
//       _isDestaque: true  // flag interna
//     }));

//     restantes = normaisComClicks.slice(ITENS_FIXOS_POR_CLICKS);
//   }

//   const todosRestantes = [...restantes, ...normaisSemClicks];
//   const embaralhados = [...todosRestantes].sort(() => Math.random() - 0.5);

//   // Itens sem destaque
//   const podiumSemFlag = podium; // já tem a flag
//   const restantesFinais = embaralhados.map(item => ({
//     ...item,
//     _isDestaque: false
//   }));

//   const premiumFinais = premiumOrdenado.map(item => ({
//     ...item,
//     _isDestaque: false
//   }));

//   return [...premiumFinais, ...podium, ...restantesFinais];
// };