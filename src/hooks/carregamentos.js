// src/hooks/carregamentos.js

import { useState, useEffect, useCallback } from 'react';
import { carregaListaInicial } from '../utils/carregaListaInicial';
import { rankingSimples } from '../utils/rankingSimples';
import { fetchStoresPaginado } from '../services/firebaseConnection/firestoreService';

const ITENS_FIXOS_NO_TOPO = 2;

export default function Carregamentos() {
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [atualizando, setAtualizando] = useState(false); // ← Para o RefreshControl
  const [temMais, setTemMais] = useState(false);
  const [termoAtual, setTermoAtual] = useState('');

  const carregarInicial = useCallback(async () => {
    setCarregando(true);
    setResultados([]);

    try {
      const { dados, temMais: temMaisAgora } = await fetchStoresPaginado('', true);
      const lista = carregaListaInicial(dados, ITENS_FIXOS_NO_TOPO);
      setResultados(lista);
      setTemMais(temMaisAgora);
      setTermoAtual('');
    } catch (error) {
      console.error('Erro ao carregar inicial:', error);
      setResultados([]);
      setTemMais(false);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarInicial();
  }, [carregarInicial]);

  const executarBusca = useCallback(async (termo) => {
    if (!termo.trim()) {
      carregarInicial();
      return;
    }

    setTermoAtual(termo.trim());
    setCarregando(true);
    setResultados([]);

    try {
      const { dados, temMais: temMaisAgora } = await fetchStoresPaginado(termo.trim(), true);
      const ordenados = rankingSimples(dados, termo.trim());
      setResultados(ordenados);
      setTemMais(temMaisAgora);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  }, [carregarInicial]);

  const carregarMais = useCallback(async () => {
    if (!temMais || carregandoMais) return;

    setCarregandoMais(true);
    try {
      const termoParaUsar = termoAtual || '';
      const { dados, temMais: temMaisAgora } = await fetchStoresPaginado(termoParaUsar);
      
      let novosItens = dados;
      if (termoParaUsar === '') {
        novosItens = carregaListaInicial(dados, ITENS_FIXOS_NO_TOPO);
      } else {
        novosItens = rankingSimples(dados, termoParaUsar);
      }

      setResultados(prev => [...prev, ...novosItens]);
      setTemMais(temMaisAgora);
    } catch (error) {
      console.error('Erro ao carregar mais:', error);
    } finally {
      setCarregandoMais(false);
    }
  }, [temMais, carregandoMais, termoAtual]);

  const recarregar = useCallback(async () => {
    setAtualizando(true);

    try {
      if (termoAtual) {
        await executarBusca(termoAtual);
      } else {
        await carregarInicial();
      }
    } catch (error) {
      console.error('Erro ao recarregar:', error);
    } finally {
      setAtualizando(false);
    }
  }, [termoAtual, executarBusca, carregarInicial]);

  const voltarParaListaInicial = useCallback(() => {
    setTermoAtual('');
    carregarInicial();
  }, [carregarInicial]);

  return {
    resultados,
    carregando,
    carregandoMais,
    atualizando,
    temMais,
    executarBusca,
    carregarMais,
    voltarParaListaInicial,
    recarregar,
    ITENS_FIXOS_NO_TOPO
  };
}