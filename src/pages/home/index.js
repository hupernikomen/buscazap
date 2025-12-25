import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  BackHandler,
  Text,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MobileAds } from 'react-native-google-mobile-ads';

import { carregarMenuEmTempoReal } from '../../utils/menuRolagem';
import { Item } from '../../component/Item';
import { Detalhe } from '../../component/Detalhe';

// Componentes locais
import LogoHeader from '../../component/LogoHeader';
import SearchBar from '../../component/SearchBar';
import HorizontalMenu from '../../component/HorizontalMenu';
import AdBanner from '../../component/AdBanner';
import NoResults from '../../component/NoResults';

// Hook personalizado
import useStores from './hooks/useStores';

MobileAds().initialize();

const INTERVALO_ANUNCIO = 7;

export default function Home({ navigation }) {
  const [termoBusca, setTermoBusca] = useState('');
  const [itensMenu, setItensMenu] = useState([]);
  const [buscaExecutada, setBuscaExecutada] = useState(false);
  const [anunciosCarregados, setAnunciosCarregados] = useState(new Set());
  const [showSearchShadow, setShowSearchShadow] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const { colors } = useTheme();
  const modalRef = useRef(null);

  // Hook que gerencia todos os dados das lojas
  const {
    resultados,
    carregando,
    atualizando,
    executarBusca: executarBuscaHook,
    limparBusca: limparBuscaHook,
    recarregar,
  } = useStores();

  // Carrega menu horizontal
  useEffect(() => {
    const cancelar = carregarMenuEmTempoReal(setItensMenu);
    return () => cancelar();
  }, []);

  const onAdLoaded = (key) => {
    if (!__DEV__) {
      setAnunciosCarregados(prev => new Set(prev).add(key));
    }
  };

  const executarBusca = () => {
    if (termoBusca.trim()) {
      setBuscaExecutada(true);
      executarBuscaHook(termoBusca);
    }
  };

  const limparBusca = () => {
    setTermoBusca('');
    setBuscaExecutada(false);
    limparBuscaHook();
  };

  const handleChangeText = (texto) => {
    setTermoBusca(texto);
    if (buscaExecutada) {
      setBuscaExecutada(false);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowSearchShadow(scrollY > 100);
  };

  const listaCompleta = useMemo(() => {
    const cabecalho = [
      { type: 'logo' },
      { type: 'search' },
      itensMenu.length > 0 ? { type: 'menu_horizontal' } : null,
    ].filter(Boolean);

    if (termoBusca.trim() && !buscaExecutada) return cabecalho;
    if (carregando && buscaExecutada) return cabecalho;
    if (buscaExecutada && resultados.length === 0 && !carregando) {
      return [...cabecalho, { type: 'no_results', query: termoBusca.trim() }];
    }
    if (resultados.length === 0) return cabecalho;

    const itensComAnuncios = [];
    let contadorItensDepoisDoPrimeiroAnuncio = 0;
    let primeiroAnuncioInserido = false;
    const ITENS_FIXOS_POR_CLIQUES = 3; // pode ser movido para constante global depois

    resultados.forEach((item, indice) => {
      if (!primeiroAnuncioInserido && indice === ITENS_FIXOS_POR_CLIQUES) {
        const keyPrimeiro = 'ad-primeiro';
        if (__DEV__ || anunciosCarregados.has(keyPrimeiro)) {
          itensComAnuncios.push({ type: 'ad', key: keyPrimeiro });
        }
        primeiroAnuncioInserido = true;
      }

      if (primeiroAnuncioInserido) {
        contadorItensDepoisDoPrimeiroAnuncio++;
        if (contadorItensDepoisDoPrimeiroAnuncio % INTERVALO_ANUNCIO === 0 && indice < resultados.length - 1) {
          const keyAd = `ad-${indice}`;
          if (__DEV__ || anunciosCarregados.has(keyAd)) {
            itensComAnuncios.push({ type: 'ad', key: keyAd });
          }
        }
      }

      itensComAnuncios.push({
        type: 'store',
        item,
        storeId: item.id,
        index: indice,
      });
    });

    return [...cabecalho, ...itensComAnuncios];
  }, [resultados, itensMenu, termoBusca, buscaExecutada, carregando, anunciosCarregados]);

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
        return <HorizontalMenu itensMenu={itensMenu} colors={colors} navigation={navigation} />;
      case 'ad':
        return <AdBanner adKey={item.key} onAdLoaded={onAdLoaded} />;
      case 'no_results':
        return <NoResults colors={colors} query={item.query} />;
      case 'store':
        return (
          <Item
            item={item.item}
            index={item.index}
            results={resultados}
            searchQuery={termoBusca}
            onPress={(loja) => {
              setItemSelecionado(loja);
              modalRef.current?.present();
            }}
            colors={colors}
          />
        );
      default:
        return null;
    }
  };

  const fecharModal = () => setItemSelecionado(null);

  useEffect(() => {
    if (!itemSelecionado) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      modalRef.current?.close();
      return true;
    });
    return () => handler.remove();
  }, [itemSelecionado]);

  return (
    <BottomSheetModalProvider>
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
          removeClippedSubviews={false}
          ItemSeparatorComponent={({ leadingItem }) => {
            if (!leadingItem || ['logo', 'search', 'menu_horizontal', 'ad', 'no_results'].includes(leadingItem.type)) return null;
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
      </View>

      <BottomSheetModal
        ref={modalRef}
        index={1}
        snapPoints={['85%']}
        onCloseEnd={fecharModal}
        onDismiss={fecharModal}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: colors.background }}
        backdropComponent={({ style, ...props }) => (
          <View {...props} style={[style, { backgroundColor: '#000000', opacity: 0.5 }]} pointerEvents="auto" />
        )}
      >
        {itemSelecionado && <Detalhe item={itemSelecionado} colors={colors} onClose={fecharModal} />}
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});