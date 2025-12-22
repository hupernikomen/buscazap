// src/pages/home/HomeScreen.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
  Text,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BackHandler } from 'react-native';
import {
  MobileAds,
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';


import { subscribeToStores } from '../../services/firebaseConnection/firestoreService';
import { normalize } from '../../utils/normalize';
import { processarPropostasConfirmadas } from '../../utils/permissaoProposta';
import { carregarMenuEmTempoReal } from '../../utils/menuRolagem';
import { Item } from '../../component/Item';
import { Detalhe } from '../../component/Detalhe';

MobileAds().initialize();
const ID_ANUNCIO = __DEV__ ? TestIds.BANNER : 'ca-app-pub-9531253714806304/5581486318';
const ITENS_FIXOS_POR_CLIQUES = 3;

export default function Home({ navigation }) {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [itensMenu, setItensMenu] = useState([]);

  const { colors } = useTheme();
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const pontosModal = useMemo(() => ['87%'], []);

  useEffect(() => {
    // Inicia o listener do menu
    const cancelar = carregarMenuEmTempoReal(setItensMenu);

    // Cancela quando sair da tela
    return () => cancelar();
  }, []);





  // === CARREGA DADOS COM BUSCA INTELIGENTE ===
  const carregarDados = useCallback(async (atualizar = false) => {
    if (atualizar) setAtualizando(true);
    else setCarregando(true);

    await processarPropostasConfirmadas();

    const cancelar = subscribeToStores(termoBusca, (snapshot) => {
      let dados = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item?.anuncio?.postagem === true);

      let resultadosFinais = [];

      if (termoBusca.trim()) {
        const palavras = normalize(termoBusca).split(/\s+/).filter(Boolean);

        const filtrados = dados.filter(item => {
          const desc = normalize(item.descricao || '');
          const categoria = normalize(item.categoria || '');
          const tagsString = (item.tags || item.arrayTags || '').toString();
          const tags = tagsString.split(',').map(t => normalize(t.trim())).filter(Boolean);

          let acertos = 0;
          palavras.forEach(palavra => {
            if (desc.includes(palavra) || categoria.includes(palavra) || tags.some(t => t.includes(palavra))) {
              acertos++;
            }
          });
          const limite = palavras.length === 1 ? 1 : Math.ceil(palavras.length / 2);
          return acertos >= limite;
        });

        const comBusca = [];
        const premium = [];
        const resto = [];

        filtrados.forEach(item => {
          const anuncio = item.anuncio || {};
          if (anuncio.busca) comBusca.push(item);
          else if (anuncio.premium) premium.push(item);
          else resto.push(item);
        });

        comBusca.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
        premium.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
        resto.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

        resultadosFinais = [...comBusca, ...premium, ...resto];
      } else {
        resultadosFinais = ordenarNormal(dados);
      }

      setResultados(resultadosFinais);
      if (atualizar) setAtualizando(false);
      else setCarregando(false);
    });

    return cancelar;
  }, [termoBusca]);

  useEffect(() => {
    let cancelar = () => { };
    const iniciar = async () => {
      setCarregando(true);
      await processarPropostasConfirmadas();
      cancelar = carregarDados();
    };
    iniciar();
    return () => typeof cancelar === 'function' && cancelar();
  }, [carregarDados]);



  // === ORDENAÇÃO NORMAL (sem busca) ===
  const ordenarNormal = (lista) => {
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



  // === LISTA COMPLETA ===
  const listaCompleta = useMemo(() => {
    const logo = { type: 'logo' };
    const busca = { type: 'search' };
    const menu = itensMenu.length > 0 ? { type: 'menu_horizontal', itens: itensMenu } : null;

    const base = [logo, busca];
    if (menu) base.push(menu);

    if (resultados.length === 0) return base;

    const itensComAnuncios = [];
    const quantidadePremium = resultados.filter(i => i?.anuncio?.premium).length;
    let posicaoPrimeiroAnuncio = quantidadePremium > 1 ? quantidadePremium : quantidadePremium + ITENS_FIXOS_POR_CLIQUES;
    let contadorAnuncios = 0;
    let contadorItensDepoisAnuncio = 0;

    resultados.forEach((item, indice) => {
      if (indice === posicaoPrimeiroAnuncio && contadorAnuncios === 0) {
        itensComAnuncios.push({ type: 'ad' });
        contadorAnuncios++;
        contadorItensDepoisAnuncio = 0;
      }
      itensComAnuncios.push({ type: 'store', item, storeId: item.id, index: indice });

      if (contadorAnuncios > 0) {
        contadorItensDepoisAnuncio++;
        if (contadorItensDepoisAnuncio % 15 === 0 && indice < resultados.length - 1) {
          itensComAnuncios.push({ type: 'ad' });
          contadorAnuncios++;
        }
      }
    });

    return [...base, ...itensComAnuncios];
  }, [resultados, itensMenu]);

  // === RENDERIZAÇÃO ===
  const renderizarItem = ({ item, index }) => {
    if (item.type === 'logo') {
      return (
        <View style={{ alignItems: 'center', paddingTop: 20 }}>
          <Image
            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/appguiacomercial-e6109.appspot.com/o/buscazapthe2.png?alt=media&token=8d55bbb0-be1c-487f-b7f3-c65b1bbdc9aa' }}
            style={{ width: 160, height: 70 }}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (item.type === 'search') {
      return (
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.background, elevation: 6, borderWidth: 0 }]}>
            <Pressable style={{ flex: 1 }} onPress={() => inputRef.current?.focus()}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="O que você procura?"
                value={termoBusca}
                onChangeText={setTermoBusca}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
            </Pressable>
            <Pressable style={styles.searchButton}>
              {carregando ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="search" size={24} color={colors.text} />}
            </Pressable>
          </View>
        </View>
      );
    }

    if (item.type === 'menu_horizontal') {
      if (!item.itens || item.itens.length === 0) return null;

      const botaoFixo = {
        titulo: 'Anuncie Grátis',
        icone: 'megaphone-outline',
        navigate: 'Proposta',
      };

      return (
        <View style={styles.menuWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {/* BOTÃO FIXO */}
            <Pressable
              onPress={() => navigation.navigate(botaoFixo.navigate)}
              style={[styles.menuButton, { backgroundColor: '#464a4cff' }]}
            >
              <Text style={[styles.menuText, { color: '#fff' }]}>{botaoFixo.titulo}</Text>
            </Pressable>

            {/* BOTÕES DO FIREBASE (só com status: true) */}
            {item.itens
              .filter(btn => btn.status === true)
              .map((btn, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    if (btn.navigate) navigation.navigate(btn.navigate);
                    else if (btn.link) Linking.openURL(btn.link).catch(() => { });
                  }}
                  style={[styles.menuButton, { backgroundColor: colors.card }]}
                >
                  {btn.icone && <Ionicons name={btn.icone} size={18} color="#fff" />}
                  <Text style={[styles.menuText, { color: colors.text }]}>{btn.titulo}</Text>
                </Pressable>
              ))}
          </ScrollView>
        </View>
      );
    }

    if (item.type === 'ad') {
      return (
        <View style={styles.adContainer}>
          <BannerAd unitId={ID_ANUNCIO} size={BannerAdSize.LARGE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
        </View>
      );
    }

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
            if (item.type === 'ad') return `ad-${Math.random()}`;
            return `store-${item.storeId}`;
          }}
          stickyHeaderIndices={[1]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22 }}
          ItemSeparatorComponent={({ leadingItem }) => {
            if (!leadingItem || ['logo', 'search', 'menu_horizontal', 'ad'].includes(leadingItem.type)) return null;
            return <View style={{ borderBottomWidth: 0.5, borderBottomColor: colors.border }} />;
          }}
          ListFooterComponent={
            <View style={{ borderTopWidth: 0.5, borderTopColor: colors.border, paddingVertical: 22 }}>
              <Text style={{ textAlign: 'center' }}>Busca Zap Teresina</Text>
              <Text style={{ textAlign: 'center', color: colors.text + '70', fontSize: 12 }}>@2025</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => carregarDados(true)} tintColor={colors.primary} />}
        />
      </View>

      <BottomSheetModal
        ref={modalRef}
        index={1}
        snapPoints={pontosModal}
        onCloseEnd={fecharModal}
        onDismiss={fecharModal}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: colors.background }}
        backdropComponent={({ style, ...props }) => (
          <Pressable onPress={() => modalRef.current?.close()} {...props} style={[style, { backgroundColor: '#000000', opacity: 0.5 }]} />
        )}
      >
        {itemSelecionado && <Detalhe item={itemSelecionado} colors={colors} onClose={fecharModal} />}
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingBottom: 16, paddingTop: 12 },
  searchBar: { borderRadius: 35, height: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22 },
  input: { flex: 1, fontSize: 16, height: 55 },
  searchButton: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginRight: -16 },
  menuWrapper: { paddingBottom: 12 },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginRight: 6,
    gap: 10,
    justifyContent: 'center',
  },
  menuText: { fontSize: 15, fontWeight: '500' },
  adContainer: { marginVertical: 16, alignItems: 'center', justifyContent: 'center' },
});