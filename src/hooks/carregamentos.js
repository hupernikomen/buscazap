import { useState, useEffect, useCallback } from 'react';
import { subscribeToStores } from '../services/firebaseConnection/firestoreService';
import { confirmaPropostas } from '../utils/confirmaPropostas'; // Função que confirma propostas pendentes
import { carregaListaInicial } from '../utils/carregaListaInicial';         // Ordena itens sem busca (por cliques, premium, etc.)
import { hankingDeBusca } from '../utils/hankingDeBusca';             // Ranking inteligente para resultados de busca

const ITENS_FIXOS_NO_TOPO = 3; 
// Quantos itens fixos (geralmente pagos por clique ou destaque) aparecem no topo quando não há busca ativa

/**
 * Custom Hook: useStores
 * Responsável por gerenciar o carregamento em tempo real das lojas do Firestore,
 * incluindo busca inteligente, ordenação inicial e pull-to-refresh.
 */
export default function Carregamentos() {
  // Estado dos resultados exibidos na tela principal
  const [resultados, setResultados] = useState([]); 

  // Indicadores de loading
  const [carregando, setCarregando] = useState(true);     // Loading inicial ou durante busca
  const [atualizando, setAtualizando] = useState(false); // Loading durante pull-to-refresh

  /**
   * Função principal que inicia a subscrição em tempo real no Firestore
   * @param {string} termo - Termo de busca digitado pelo usuário
   * @param {boolean} executarBusca - Se true, aplica filtro e ranking de busca
   * @param {boolean} atualizar - Se true, ativa o modo "atualizando" (pull-to-refresh)
   */
  const carregarDados = useCallback(async (termo = '', executarBusca = false, atualizar = false) => {
    // Ativa o indicador correto de loading
    if (atualizar) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    // Processa propostas confirmadas (ex: ativa anúncios aprovados)
    await confirmaPropostas();

    // Define o termo a ser usado na consulta (trim apenas se for busca real)
    const termoBusca = executarBusca ? termo.trim() : '';

    // Inscreve-se na coleção do Firestore com ou sem filtro de busca
    // Retorna uma função de cancelamento para evitar memory leaks
    const cancelarInscricao = subscribeToStores(termoBusca, (snapshot) => {
      // Converte os documentos do Firestore em array de objetos
      const dadosBrutos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item?.anuncio?.postagem === true); // Apenas anúncios publicados

      // Aplica ordenação conforme o contexto:
      const listaOrdenada = termoBusca
        ? hankingDeBusca(dadosBrutos, termoBusca)           // Com busca → ranking por relevância
        : carregaListaInicial(dadosBrutos, ITENS_FIXOS_NO_TOPO);    // Sem busca → ordem inicial (destaques pagos no topo)

      // Atualiza o estado com os resultados finais
      setResultados(listaOrdenada);

      // Desativa os loadings
      setCarregando(false);
      if (atualizar) setAtualizando(false);
    });

    // Retorna a função de cancelamento para uso no cleanup
    return cancelarInscricao;
  }, []);

  /**
   * Effect: Carregamento inicial ao montar o hook
   * Executa uma vez quando o componente que usa este hook é montado
   */
  useEffect(() => {
    let cancelarInscricao = () => {}; // Função vazia inicial

    const iniciarCarregamento = async () => {
      setCarregando(true);
      await confirmaPropostas();
      // Inicia a subscrição sem termo de busca (lista inicial)
      cancelarInscricao = await carregarDados('', false);
    };

    iniciarCarregamento();

    // Cleanup: Cancela a subscrição ao desmontar o componente
    return () => {
      if (typeof cancelarInscricao === 'function') {
        cancelarInscricao();
      }
    };
  }, [carregarDados]);

  /**
   * Dispara uma nova busca com o termo informado
   */
  const executarBusca = useCallback((termo) => {
    if (termo.trim()) {
      setResultados([]);     // Limpa resultados antigos
      setCarregando(true);   // Ativa loading de busca
      carregarDados(termo, true);
    }
  }, [carregarDados]);

  /**
   * Volta para a lista inicial (sem filtro de busca)
   */
  const voltarParaListaInicial = useCallback(() => {
    setResultados([]);
    carregarDados('', false);
  }, [carregarDados]);

  /**
   * Atualiza a lista atual via pull-to-refresh (mantém o estado atual de busca)
   */
  const atualizarLista = useCallback(() => {
    carregarDados('', false, true);
  }, [carregarDados]);

  // Retorna tudo que o componente consumidor precisa
  return {
    resultados,           // Lista de lojas ordenadas
    carregando,           // true durante carregamento inicial ou busca
    atualizando,          // true durante pull-to-refresh
    executarBusca,        // Função para buscar por termo
    voltarParaListaInicial, // Função para limpar busca
    atualizarLista,       // Função para refresh manual
  };
}