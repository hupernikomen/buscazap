import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToStores } from '../services/firebaseConnection/firestoreService';
import { confirmaPropostas } from '../utils/confirmaPropostas';
import { carregaListaInicial } from '../utils/carregaListaInicial';
import { hankingDeBusca } from '../utils/hankingDeBusca';

const ITENS_FIXOS_NO_TOPO = 3;

export default function Carregamentos() {
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  // Estados para lembrar o contexto da busca
  const [estaEmBusca, setEstaEmBusca] = useState(false);
  const [termoBuscaAtual, setTermoBuscaAtual] = useState('');

  // Ref para guardar a função de cancelamento atual
  const cancelarInscricaoAtual = useRef(null);

  const carregarDados = useCallback(async (termo = '', executarBusca = false, atualizar = false) => {
    // Ativa loading correto
    if (atualizar) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    await confirmaPropostas();

    const termoParaUsar = executarBusca ? termo.trim() : '';

    // *** IMPORTANTE: Cancela inscrição anterior antes de criar nova ***
    if (cancelarInscricaoAtual.current && typeof cancelarInscricaoAtual.current === 'function') {
      cancelarInscricaoAtual.current();
      cancelarInscricaoAtual.current = null;
    }

    // Nova inscrição
    const cancelar = subscribeToStores(termoParaUsar, (snapshot) => {
      const dadosBrutos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item?.anuncio?.postagem === true);

      const listaOrdenada = termoParaUsar
        ? hankingDeBusca(dadosBrutos, termoParaUsar)
        : carregaListaInicial(dadosBrutos, ITENS_FIXOS_NO_TOPO);

      setResultados(listaOrdenada);
      setCarregando(false);
      if (atualizar) setAtualizando(false);
    });

    // Guarda a função de cancelamento
    cancelarInscricaoAtual.current = cancelar;
  }, []);

  // Carregamento inicial
  useEffect(() => {
    const iniciar = async () => {
      setCarregando(true);
      await confirmaPropostas();
      await carregarDados('', false);
    };

    iniciar();

    // Cleanup ao desmontar
    return () => {
      if (cancelarInscricaoAtual.current) {
        cancelarInscricaoAtual.current();
      }
    };
  }, [carregarDados]);

  const executarBusca = useCallback((termo) => {
    if (termo.trim()) {
      setEstaEmBusca(true);
      setTermoBuscaAtual(termo.trim());
      setResultados([]);
      setCarregando(true);
      carregarDados(termo.trim(), true);
    }
  }, [carregarDados]);

  const voltarParaListaInicial = useCallback(() => {
    setEstaEmBusca(false);
    setTermoBuscaAtual('');
    setResultados([]);
    carregarDados('', false);
  }, [carregarDados]);

  // Pull-to-refresh agora funciona perfeitamente!
  const recarregar = useCallback(() => {
    if (estaEmBusca && termoBuscaAtual) {
      carregarDados(termoBuscaAtual, true, true);
    } else {
      carregarDados('', false, true);
    }
  }, [carregarDados, estaEmBusca, termoBuscaAtual]);

  return {
    resultados,
    carregando,
    atualizando,
    executarBusca,
    voltarParaListaInicial,
    recarregar,
  };
}