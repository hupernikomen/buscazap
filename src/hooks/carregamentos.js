// src/hooks/carregamentos.js

import { useState, useEffect, useCallback } from 'react';
import { fetchAllStores } from '../services/firebaseConnection/firestoreService';
import { buscaInteligente } from '../utils/buscaInteligente'; // ← NOVA IMPORTAÇÃO

export default function Carregamentos() {
  const [resultados, setResultados] = useState([]);
  const [todosOsItens, setTodosOsItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [termoAtual, setTermoAtual] = useState('');

  const carregarInicial = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await fetchAllStores();
      setTodosOsItens(dados);
      setResultados(dados);
      setTermoAtual('');
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      setTodosOsItens([]);
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  const executarBusca = useCallback((termo) => {
    if (!termo.trim()) {
      setResultados(todosOsItens);
      setTermoAtual('');
      return;
    }

    setTermoAtual(termo.trim());
    const resultados = buscaInteligente(todosOsItens, termo.trim());
    setResultados(resultados);
  }, [todosOsItens]);

  const recarregar = useCallback(async () => {
    setAtualizando(true);
    try {
      const dados = await fetchAllStores();
      setTodosOsItens(dados);

      if (termoAtual) {
        const resultados = buscaInteligente(dados, termoAtual);
        setResultados(resultados);
      } else {
        setResultados(dados);
      }
    } finally {
      setAtualizando(false);
    }
  }, [termoAtual]);

  const voltarParaListaInicial = useCallback(() => {
    setTermoAtual('');
    setResultados(todosOsItens);
  }, [todosOsItens]);

  useEffect(() => {
    carregarInicial();
  }, [carregarInicial]);

  return {
    resultados,
    carregando,
    atualizando,
    executarBusca,
    voltarParaListaInicial,
    recarregar,
  };
}