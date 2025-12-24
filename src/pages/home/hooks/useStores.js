import { useState, useEffect, useCallback } from 'react';
import { subscribeToStores } from '../../../services/firebaseConnection/firestoreService';
import { processarPropostasConfirmadas } from '../../../utils/permissaoProposta';
import { ordemInicial } from '../../../utils/ordemInicial';
import { rankearResultados } from '../../../utils/searchRanking';

const ITENS_FIXOS_POR_CLIQUES = 3;


export default function useStores() {
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregarDados = useCallback(async (termo = '', executarBusca = false, atualizar = false) => {
    if (atualizar) setAtualizando(true);
    else setCarregando(true);

    await processarPropostasConfirmadas();

    const termoParaUsar = executarBusca ? termo.trim() : '';

    // Cancela inscrição anterior (se houver)
    const cancelar = subscribeToStores(termoParaUsar, (snapshot) => {
      const dados = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item?.anuncio?.postagem === true);

      const resultadosFinais = termoParaUsar
        ? rankearResultados(dados, termoParaUsar)
        : ordemInicial(dados, ITENS_FIXOS_POR_CLIQUES);

      setResultados(resultadosFinais);
      setCarregando(false);
      if (atualizar) setAtualizando(false);
    });

    return cancelar;
  }, []);

  // Carregamento inicial
  useEffect(() => {
    let cancelar = () => {};
    const iniciar = async () => {
      setCarregando(true);
      await processarPropostasConfirmadas();
      cancelar = await carregarDados('', false);
    };
    iniciar();

    return () => {
      if (typeof cancelar === 'function') cancelar();
    };
  }, [carregarDados]);

  const executarBusca = useCallback((termo) => {
    if (termo.trim()) {
      setResultados([]);
      setCarregando(true);
      carregarDados(termo, true);
    }
  }, [carregarDados]);

  const limparBusca = useCallback(() => {
    setResultados([]);
    carregarDados('', false);
  }, [carregarDados]);

  const recarregar = useCallback(() => {
    carregarDados('', false, true);
  }, [carregarDados]);

  return {
    resultados,
    carregando,
    atualizando,
    executarBusca,
    limparBusca,
    recarregar,
  };
}