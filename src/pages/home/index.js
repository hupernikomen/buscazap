// src/pages/home.js

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MobileAds } from 'react-native-google-mobile-ads';

import { carregarItensMenu } from '../../utils/carregaItensMenu';
import { Item } from '../../component/Item';

import LogoHeader from '../../component/LogoHeader';
import SearchBar from '../../component/SearchBar';
import MenuHorizontal from '../../component/MenuHorizontal';
import AdBanner from '../../component/AdBanner';
import SemResultado from '../../component/SemResultado';

import Carregamentos from '../../hooks/carregamentos';

MobileAds().initialize();

const INTERVALO_ANUNCIO = 15;
const ITENS_ATE_PRIMEIRO_ANUNCIO = 3;

export default function Home({ navigation }) {
  const [termoBusca, setTermoBusca] = useState('');
  const [itensMenu, setItensMenu] = useState([]);
  const [buscaExecutada, setBuscaExecutada] = useState(false);
  const [showSearchShadow, setShowSearchShadow] = useState(false);

  const { colors } = useTheme();

  const {
    resultados,
    carregando,
    atualizando,
    executarBusca: executarBuscaHook,
    voltarParaListaInicial,
    recarregar,
  } = Carregamentos();

  useEffect(() => {
    const unsubscribe = carregarItensMenu(setItensMenu);
    return () => unsubscribe && unsubscribe();
  }, []);

  const executarBusca = () => {
    if (termoBusca.trim()) {
      setBuscaExecutada(true);
      executarBuscaHook(termoBusca);
    }
  };

  const limparBusca = () => {
    setTermoBusca('');
    setBuscaExecutada(false);
    voltarParaListaInicial();
  };

  const handleChangeText = (texto) => {
    setTermoBusca(texto);

    if (texto.trim() === '') {
      setBuscaExecutada(false);
      voltarParaListaInicial();
    } else if (buscaExecutada) {
      setBuscaExecutada(false);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowSearchShadow(scrollY > 100);
  };

  // MenuHorizontal só aparece quando NÃO tem texto digitado (independente de buscaExecutada)
  const mostrarMenuHorizontal = termoBusca.trim() === '' && itensMenu.length > 0;

  const listaCompleta = useMemo(() => {
    const cabecalho = [
      { type: 'logo' },
      { type: 'search' },
      mostrarMenuHorizontal ? { type: 'menu_horizontal' } : null,
    ].filter(Boolean);

    // Loading ou espera
    if (termoBusca.trim() && !buscaExecutada) return cabecalho;
    if (carregando) return cabecalho;

    // Busca executada
    if (buscaExecutada) {
      if (resultados.length === 0) {
        return [...cabecalho, { type: 'no_results', query: termoBusca.trim() }];
      }

      const itensBusca = resultados.map((item) => ({
        type: 'store',
        item,
        storeId: item.id,
        isDestaque: false,
      }));

      const itensComAnuncios = [];
      let contador = 0;
      let primeiroAnuncioInserido = false;

      itensBusca.forEach((item, indice) => {
        if (!primeiroAnuncioInserido && indice === ITENS_ATE_PRIMEIRO_ANUNCIO) {
          itensComAnuncios.push({ type: 'ad', key: 'ad-primeiro' });
          primeiroAnuncioInserido = true;
        }

        if (primeiroAnuncioInserido) {
          contador++;
          if (contador % INTERVALO_ANUNCIO === 0 && indice < itensBusca.length - 1) {
            itensComAnuncios.push({ type: 'ad', key: `ad-${indice}` });
          }
        }

        itensComAnuncios.push(item);
      });

      return [...cabecalho, ...itensComAnuncios];
    }

    // TELA INICIAL (sem texto na busca)
    if (resultados.length === 0) return cabecalho;

    const todosItens = [...resultados];

    const premium = todosItens
      .filter((item) => item.anuncio?.premium === true)
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    const naoPremium = todosItens.filter((item) => item.anuncio?.premium !== true);

    const topDestaques = [...naoPremium]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 2);

    const restantes = naoPremium.filter((item) => !topDestaques.includes(item));

    const comCliques = restantes
      .filter((item) => (item.clicks || 0) > 0)
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    const semCliques = restantes.filter((item) => (item.clicks || 0) === 0);

    const semCliquesEmbaralhados = [...semCliques].sort(() => Math.random() - 0.5);

    const itensFinais = [];

    premium.forEach((item) => {
      itensFinais.push({
        type: 'store',
        item,
        storeId: item.id,
        isDestaque: false,
      });
    });

    topDestaques.forEach((item) => {
      itensFinais.push({
        type: 'store',
        item,
        storeId: item.id,
        isDestaque: true,
      });
    });

    [...comCliques, ...semCliquesEmbaralhados].forEach((item) => {
      itensFinais.push({
        type: 'store',
        item,
        storeId: item.id,
        isDestaque: false,
      });
    });

    const itensComAnuncios = [];
    let contador = 0;
    let primeiroAnuncioInserido = false;

    itensFinais.forEach((item, indice) => {
      if (!primeiroAnuncioInserido && indice === ITENS_ATE_PRIMEIRO_ANUNCIO) {
        itensComAnuncios.push({ type: 'ad', key: 'ad-primeiro' });
        primeiroAnuncioInserido = true;
      }

      if (primeiroAnuncioInserido) {
        contador++;
        if (contador % INTERVALO_ANUNCIO === 0 && indice < itensFinais.length - 1) {
          itensComAnuncios.push({ type: 'ad', key: `ad-${indice}` });
        }
      }

      itensComAnuncios.push(item);
    });

    return [...cabecalho, ...itensComAnuncios];
  }, [resultados, itensMenu, termoBusca, buscaExecutada, carregando, mostrarMenuHorizontal, colors]);

  const renderizarItem = ({ item }) => {
    switch (item.type) {
      case 'logo':
        return <LogoHeader />;
      case 'search':
        return (
          <SearchBar
            termoBusca={termoBusca}
            setTermoBusca={setTermoBusca}
            buscaExecutada={buscaExecutada}
            carregando={carregando}
            showSearchShadow={showSearchShadow}
            colors={colors}
            onExecutarBusca={executarBusca}
            onLimparBusca={limparBusca}
            onChangeText={handleChangeText}
          />
        );
      case 'menu_horizontal':
        return <MenuHorizontal itensMenu={itensMenu} colors={colors} navigation={navigation} />;
      case 'ad':
        return <AdBanner adKey={item.key} />;
      case 'no_results':
        return <SemResultado colors={colors} query={item.query} />;
      case 'store':
        return (
          <Item
            item={item.item}
            onPress={(loja) => {
              navigation.navigate('Detalhe', { item: loja, colors: colors });
            }}
            colors={colors}
            searchQuery={termoBusca.trim()}
            isDestaque={item.isDestaque}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={listaCompleta}
        renderItem={renderizarItem}
        keyExtractor={(item) => {
          if (item.type === 'logo') return 'logo';
          if (item.type === 'search') return 'search';
          if (item.type === 'menu_horizontal') return 'menu';
          if (item.type === 'ad') return item.key;
          if (item.type === 'no_results') return 'no_results';
          return `store-${item.storeId}`;
        }}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ItemSeparatorComponent={({ leadingItem }) => {
          if (!leadingItem || ['logo', 'search', 'menu_horizontal', 'ad', 'no_results'].includes(leadingItem.type)) {
            return null;
          }
          return <View style={{ borderBottomWidth: 0.5, borderBottomColor: colors.border }} />;
        }}
        ListFooterComponent={
          <View style={{ borderTopWidth: 0.5, borderTopColor: colors.border, paddingVertical: 22 }}>
            <Text style={{ textAlign: 'center' }}>Busca Zap Teresina</Text>
            <Text style={{ textAlign: 'center', color: colors.text + '70', fontSize: 12 }}>@2025</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={recarregar} tintColor={colors.primary} />
        }
      />

      {carregando && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.botao} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.text }}>
            {buscaExecutada ? 'Buscando...' : 'Carregando...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});