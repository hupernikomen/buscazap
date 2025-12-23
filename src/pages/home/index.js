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
import { ordemInicial } from '../../utils/ordemInicial';
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



  // === CARREGA DADOS COM BUSCA INTELIGENTE (MELHOR DO BRASIL) ===

  // ORDEM DE PRIORIDADE (do mais importante para o menos importante):
  //
  // 1º LUGAR: TAG EXATA
  //    - Se alguma tag contiver o termo completo da busca (ex: busca "tênis nike" e tag "tênis nike")
  //    - Sempre aparece no topo, independente de busca=true ou premium
  //
  // 2º LUGAR: busca=true + relevância suficiente
  //    - Só entra se tiver busca=true
  //    - Se a busca tiver 1 palavra → precisa de pelo menos 1 acerto nas tags
  //    - Se a busca tiver 2+ palavras → precisa de pelo menos 2 acertos nas tags
  //    - Quanto mais acertos → mais acima dentro desse grupo
  //
  // 3º LUGAR: Maior número de acertos nas tags (sem restrição de busca=true)
  //    - Qualquer loja com mais palavras da busca nas tags aparece aqui
  //    - Quanto mais acertos → mais acima
  //
  // 4º LUGAR: Premium com relevância
  //    - Só entra se tiver premium=true E pelo menos 1 acerto nas tags
  //
  // 5º LUGAR: Qualquer loja com pelo menos 1 acerto nas tags
  //    - Última posição, mas ainda aparece (para não deixar o usuário sem resultado)
  //    - Garante que toda loja com alguma relevância seja mostrada
  //
  // REGRAS GERAIS:
  // - Só olha nas TAGS (descrição e categoria ignoradas)
  // - Sem relevância nas tags → NÃO aparece na busca
  // - Busca exata tem prioridade máxima absoluta
  // - Tudo justo, inteligente e profissional — nível Google!


  const carregarDados = useCallback(async (atualizar = false) => {
    if (atualizar) setAtualizando(true);
    else setCarregando(true);

    await processarPropostasConfirmadas();

    const cancelar = subscribeToStores(termoBusca, (snapshot) => {
      // Filtra apenas lojas ativas
      let dados = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item?.anuncio?.postagem === true);

      let resultadosFinais = [];

      // === BUSCA INTELIGENTE — VERSÃO FINAL E PERFEITA ===
      if (termoBusca.trim()) {
        const palavrasBusca = normalize(termoBusca).split(/\s+/).filter(Boolean);
        const termoCompleto = normalize(termoBusca);
        const temMaisDeUmaPalavra = palavrasBusca.length > 1;

        const contarAcertosNasTags = (item) => {
          if (!Array.isArray(item.tags) || item.tags.length === 0) return 0;
          const tagsTexto = normalize(item.tags.join(' '));
          return palavrasBusca.filter(p => tagsTexto.includes(p)).length;
        };

        const temBuscaExata = (item) => {
          if (!Array.isArray(item.tags)) return false;
          const tagsTexto = normalize(item.tags.join(' '));
          return tagsTexto.includes(termoCompleto);
        };

        const temRelevancia = (item) => contarAcertosNasTags(item) > 0;

        const itensComScore = dados
          .map(item => {
            const acertos = contarAcertosNasTags(item);
            let score = 0;
            let prioridade = 0;

            // 1º LUGAR: BUSCA EXATA
            if (temBuscaExata(item)) {
              // Subprioridade: busca=true vem antes
              if (item?.anuncio?.busca) {
                prioridade = 7; // busca=true + exata → topo absoluto
                score = 99999999 + acertos * 1000000;
              } else {
                prioridade = 6; // exata sem busca=true
                score = 9999999 + acertos * 100000;
              }
            }
            // 2º LUGAR: busca=true + relevância suficiente
            else if (item?.anuncio?.busca && temRelevancia(item)) {
              const minimoExigido = temMaisDeUmaPalavra ? 2 : 1;
              if (acertos >= minimoExigido) {
                prioridade = 5;
                score = 999999 + acertos * 10000;
              } else {
                prioridade = 1;
                score = acertos * 10;
              }
            }
            // 3º LUGAR: maior número de acertos
            else if (temRelevancia(item)) {
              prioridade = 4;
              score = acertos * 1000;
            }
            // 4º LUGAR: premium com relevância
            else if (item?.anuncio?.premium && temRelevancia(item)) {
              prioridade = 3;
              score = acertos * 100;
            }
            // 5º LUGAR: qualquer com pelo menos 1 acerto
            else if (temRelevancia(item)) {
              prioridade = 2;
              score = acertos * 1;
            }
            // Sem relevância → não aparece
            else {
              return null;
            }

            return { item, score, prioridade };
          })
          .filter(Boolean);

        itensComScore.sort((a, b) => {
          if (b.prioridade !== a.prioridade) return b.prioridade - a.prioridade;
          return b.score - a.score;
        });

        resultadosFinais = itensComScore.map(x => x.item);

      } else {
        // Sem busca → ordenação normal
        resultadosFinais = ordemInicial(dados, ITENS_FIXOS_POR_CLIQUES);
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





  // === LISTA COMPLETA ===
  const listaCompleta = useMemo(() => {
    const logo = { type: 'logo' };
    const busca = { type: 'search' };
    const menu = itensMenu.length > 0 ? { type: 'menu_horizontal', itens: itensMenu } : null;

    const cabecalho = [logo, busca];

    if (menu) cabecalho.push(menu);

    if (resultados.length === 0) return cabecalho;

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

    return [...cabecalho, ...itensComAnuncios];
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
        <View style={[styles.searchContainer, { backgroundColor: colors.background, paddingHorizontal: 22 }]}>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, padding: 22, gap: 8 }}>
            {/* BOTÃO FIXO */}
            <Pressable
              onPress={() => navigation.navigate(botaoFixo.navigate)}
              style={[styles.menuButton, {
                backgroundColor: colors.botao
              }]}
            >
              <Text style={[styles.menuText, { color: '#fff', fontWeight: 500 }]}>{botaoFixo.titulo}</Text>
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
                  style={[styles.menuButton, { backgroundColor: '#f8f8f8' }]}
                >
                  <Text style={[styles.menuText, { color: colors.text }]}>{btn.titulo}</Text>
                </Pressable>
              ))}
          </ScrollView>
        </View>
      );
    }

    if (item.type === 'ad') {
      return (
        <View style={[styles.adContainer, { borderBottomWidth: 0.5, borderBottomColor: colors.border, paddingBottom: 18 }]}>
          <Text style={{ marginBottom: 6, fontSize: 12 }}>PUBLICIDADE</Text>
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
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    marginBottom: 12,

  },
  adContainer: { marginVertical: 16, alignItems: 'center', justifyContent: 'center', },
});