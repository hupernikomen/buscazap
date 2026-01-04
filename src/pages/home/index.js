import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  BackHandler,
  Text,
  Pressable,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MobileAds } from 'react-native-google-mobile-ads';

import { carregarItensMenu } from '../../utils/carregaItensMenu';
import { Item } from '../../component/Item';
import { DetalheDoItem } from '../../component/DetalheDoItem';

// Componentes locais
import LogoHeader from '../../component/LogoHeader';
import SearchBar from '../../component/SearchBar';
import MenuHorizontal from '../../component/MenuHorizontal';
import AdBanner from '../../component/AdBanner';
import SemResultado from '../../component/SemResultado';

// Hook personalizado
import Carregamentos from '../../hooks/carregamentos';

MobileAds().initialize();

const INTERVALO_ANUNCIO = 7;
const ITENS_ATE_PRIMEIRO_ANUNCIO = 4; // Primeiro anúncio após 4 itens

export default function Home({ navigation }) {
  const [termoBusca, setTermoBusca] = useState('');
  const [itensMenu, setItensMenu] = useState([]);
  const [buscaExecutada, setBuscaExecutada] = useState(false);
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
    voltarParaListaInicial,
    recarregar,
    ITENS_FIXOS_NO_TOPO,
  } = Carregamentos();

  // Carrega menu horizontal
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

  const listaCompleta = useMemo(() => {
    const cabecalho = [
      { type: 'logo' },
      { type: 'search' },
      !termoBusca.trim() && itensMenu.length > 0 ? { type: 'menu_horizontal' } : null,
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

    resultados.forEach((item, indice) => {
      // Primeiro anúncio após 4 itens — sempre insere o slot
      if (!primeiroAnuncioInserido && indice === ITENS_ATE_PRIMEIRO_ANUNCIO) {
        itensComAnuncios.push({ type: 'ad', key: 'ad-primeiro' });
        primeiroAnuncioInserido = true;
      }

      // Anúncios subsequentes a cada 7 itens
      if (primeiroAnuncioInserido) {
        contadorItensDepoisDoPrimeiroAnuncio++;
        if (
          contadorItensDepoisDoPrimeiroAnuncio % INTERVALO_ANUNCIO === 0 &&
          indice < resultados.length - 1
        ) {
          itensComAnuncios.push({ type: 'ad', key: `ad-${indice}` });
        }
      }

      // Item da loja
      itensComAnuncios.push({
        type: 'store',
        item,
        storeId: item.id,
        index: indice,
      });
    });

    return [...cabecalho, ...itensComAnuncios];
  }, [resultados, itensMenu, termoBusca, buscaExecutada, carregando]); // Removido anunciosCarregados da dependência

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
        return <AdBanner adKey={item.key}  />;
      case 'no_results':
        return <SemResultado colors={colors} query={item.query} />;
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
            ITENS_FIXOS_NO_TOPO={ITENS_FIXOS_NO_TOPO}
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
          <Pressable
            {...props}
            style={[style, { backgroundColor: '#000000', opacity: 0.5 }]}
            pointerEvents="auto"
            onPress={() => modalRef.current?.close()}
          />
        )}
      >
        {itemSelecionado && <DetalheDoItem item={itemSelecionado} colors={colors} onClose={fecharModal} />}
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});