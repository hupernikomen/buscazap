

// === ORDENAÇÃO NORMAL (sem busca) ===
  export const ordemInicial = (lista, ITENS_FIXOS_POR_CLIQUES) => {
    const premium = lista.filter(i => i?.anuncio?.premium);
    const outros = lista.filter(i => !i?.anuncio?.premium);

    const premiumOrdenado = premium.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    const outrosOrdenado = outros.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    const quantidadeFixa = Math.min(ITENS_FIXOS_POR_CLIQUES, outrosOrdenado.length);
    const topoFixoBruto = outrosOrdenado.slice(0, quantidadeFixa);
    const topoFixo = topoFixoBruto
      .map(i => ({ i, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(({ i }) => i);

    const restantes = outrosOrdenado.slice(quantidadeFixa);
    const embaralhados = [...restantes];
    for (let i = embaralhados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [embaralhados[i], embaralhados[j]] = [embaralhados[j], embaralhados[i]];
    }

    return [...premiumOrdenado, ...topoFixo, ...embaralhados];
  };