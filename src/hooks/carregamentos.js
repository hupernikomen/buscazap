import { useState, useEffect, useCallback } from 'react';
import { confirmaPropostas } from '../utils/confirmaPropostas';
import { carregaListaInicial } from '../utils/carregaListaInicial';
import { hankingDeBusca } from '../utils/hankingDeBusca';
import { fetchStoresOnce } from '../services/firebaseConnection/firestoreService'; // ← Use essa função única

export default function Carregamentos() {
  const ITENS_FIXOS_NO_TOPO = 2;
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const [estaEmBusca, setEstaEmBusca] = useState(false);
  const [termoBuscaAtual, setTermoBuscaAtual] = useState('');

  const carregarDados = useCallback(async (termo = '', executarBusca = false, atualizar = false) => {
    if (atualizar) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    await confirmaPropostas();

    const termoParaUsar = executarBusca ? termo.trim() : '';

    try {
      const dadosBrutos = await fetchStoresOnce(termoParaUsar);

      const listaOrdenada = termoParaUsar
        ? hankingDeBusca(dadosBrutos, termoParaUsar)
        : carregaListaInicial(dadosBrutos, ITENS_FIXOS_NO_TOPO);

      setResultados(listaOrdenada);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setResultados([]);
    } finally {
      setCarregando(false);
      if (atualizar) setAtualizando(false);
    }
  }, []);

  // Carregamento inicial (quando abre o app)
  useEffect(() => {
    carregarDados('', false);
  }, [carregarDados]);

  const executarBusca = useCallback((termo) => {
    if (termo.trim()) {
      setEstaEmBusca(true);
      setTermoBuscaAtual(termo.trim());
      carregarDados(termo.trim(), true);
    }
  }, [carregarDados]);

  const voltarParaListaInicial = useCallback(() => {
    setEstaEmBusca(false);
    setTermoBuscaAtual('');
    carregarDados('', false);
  }, [carregarDados]);

  // Pull-to-refresh: agora SIM atualiza o ranking (opcional — veja abaixo)
  const recarregar = useCallback(() => {
    if (estaEmBusca && termoBuscaAtual) {
      carregarDados(termoBuscaAtual, true, true);
    } else {
      carregarDados('', false, true); // Atualiza o ranking por cliques
    }
  }, [carregarDados, estaEmBusca, termoBuscaAtual]);

  return {
    resultados,
    carregando,
    atualizando,
    executarBusca,
    voltarParaListaInicial,
    recarregar,
    ITENS_FIXOS_NO_TOPO
  };
}