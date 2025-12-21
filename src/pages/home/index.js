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

MobileAds().initialize();
const AD_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-9531253714806304/5581486318';

import { subscribeToStores } from '../../services/firebaseConnection/firestoreService';
import { normalize } from '../../utils/normalize';
import { Item } from '../../component/Item';
import { Detalhe } from '../../component/Detalhe';
import { db } from '../../services/firebaseConnection/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const NUMERO_ITENS_FIXOS_POR_CLIQUES = 3;

export default function Home({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuItens, setMenuItens] = useState([]);

  const { colors } = useTheme();
  const bottomSheetRef = useRef(null);
  const textInputRef = useRef(null);
  const snapPoints = useMemo(() => ['87%'], []);

  // === CARREGA MENU DO FIRESTORE (coleção: menu > documento: 1 > campo: menu) ===
  useEffect(() => {
    const menuRef = doc(db, 'menu', '1');
    const unsub = onSnapshot(menuRef, (snap) => {
      if (snap.exists() && snap.data().menu) {
        setMenuItens(snap.data().menu);
      } else {
        setMenuItens([]);
      }
    });
    return () => unsub();
  }, []);

// === ORDENAÇÃO COM REVEZAMENTO ALEATÓRIO ENTRE EMPATADOS ===
const applyOrdering = (list) => {
  const premium = list.filter(i => i?.anuncio?.premium);
  const nonPremium = list.filter(i => !i?.anuncio?.premium);

  // 1. Premium: ordena por cliques (maior primeiro)
  const sortedPremium = premium.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  // 2. Não premium: ordena por cliques
  const sortedNonPremium = nonPremium.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  // 3. Pega os TOP 3 (ou menos se tiver menos que 3)
  const topCount = Math.min(NUMERO_ITENS_FIXOS_POR_CLIQUES, sortedNonPremium.length);
  const topFixedRaw = sortedNonPremium.slice(0, topCount);

  // REVEZAMENTO ALEATÓRIO ENTRE OS TOPS
  const topFixed = topFixedRaw
    .map(item => ({ item, sort: Math.random() })) // adiciona número aleatório
    .sort((a, b) => a.sort - b.sort)             // ordena pelo aleatório
    .map(({ item }) => item);                     // devolve só o item

  // 4. O resto: embaralha completamente
  const remaining = sortedNonPremium.slice(topCount);
  const shuffledRemaining = [...remaining];
  for (let i = shuffledRemaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRemaining[i], shuffledRemaining[j]] = [shuffledRemaining[j], shuffledRemaining[i]];
  }

  // 5. Monta a lista final
  return [...sortedPremium, ...topFixed, ...shuffledRemaining];
};

 // === CARREGA LOJAS COM BUSCA INTELIGENTE (prioridade: busca > premium > normal) ===
const loadData = useCallback((isRefresh = false) => {
  if (isRefresh) setRefreshing(true);
  else setLoading(true);

  const unsub = subscribeToStores(searchQuery, (snapshot) => {
    let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let finalResults = [];

    if (searchQuery.trim()) {
      // === MODO BUSCA ATIVA ===
      const words = normalize(searchQuery).split(/\s+/).filter(Boolean);

      // Filtra primeiro
      const filtered = data.filter(item => {
        const desc = normalize(item.descricao || '');
        const categoria = normalize(item.categoria || '');
        const tagsString = (item.tags || item.arrayTags || '').toString();
        const tags = tagsString.split(',').map(t => normalize(t.trim())).filter(Boolean);

        let matches = 0;
        words.forEach(word => {
          if (
            desc.includes(word) ||
            categoria.includes(word) ||
            tags.some(tag => tag.includes(word))
          ) matches++;
        });

        const threshold = words.length === 1 ? 1 : Math.ceil(words.length / 2);
        return matches >= threshold;
      });

      // === ORDENAÇÃO INTELIGENTE DURANTE A BUSCA ===
      const comBusca = [];
      const premium = [];
      const normal = [];

      filtered.forEach(item => {
        const anuncio = item.anuncio || {};

        if (anuncio.busca) {
          comBusca.push(item);
        } else if (anuncio.premium) {
          premium.push(item);
        } else {
          normal.push(item);
        }
      });

      // Ordena cada grupo por cliques (opcional, mas fica melhor)
      comBusca.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
      premium.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
      normal.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

      finalResults = [...comBusca, ...premium, ...normal];
    } 
    else {
      // === SEM BUSCA → usa a ordenação normal (premium + top 3 + revezamento) ===
      finalResults = applyOrdering(data);
    }

    setResults(finalResults);

    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  });

  return unsub;
}, [searchQuery]);



  useEffect(() => {
    const unsub = loadData();
    return () => unsub && unsub();
  }, [loadData]);

  // === LISTA COMPLETA ===
  const fullData = useMemo(() => {
    const logo = { type: 'logo' };
    const search = { type: 'search' };
    const menu = menuItens.length > 0 ? { type: 'menu_horizontal', itens: menuItens } : null;

    const base = [logo, search];
    if (menu) base.push(menu);

    if (results.length === 0) return base;

    const itemsWithAds = [];
    const premiumCount = results.filter(i => i?.anuncio?.premium).length;
    let firstAdPosition = premiumCount > 1 ? premiumCount : premiumCount + NUMERO_ITENS_FIXOS_POR_CLIQUES;
    let adCount = 0;
    let storeCountAfterFirstAd = 0;

    results.forEach((item, index) => {
      if (index === firstAdPosition && adCount === 0) {
        itemsWithAds.push({ type: 'ad' });
        adCount++;
        storeCountAfterFirstAd = 0;
      }
      itemsWithAds.push({ type: 'store', item, storeId: item.id, index });

      if (adCount > 0) {
        storeCountAfterFirstAd++;
        if (storeCountAfterFirstAd % 15 === 0 && index < results.length - 1) {
          itemsWithAds.push({ type: 'ad' });
          adCount++;
        }
      }
    });

    return [...base, ...itemsWithAds];
  }, [results, menuItens]);


  // === RENDERIZAÇÃO ===
  const renderItem = ({ item, index }) => {
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
            <Pressable style={{ flex: 1 }} onPress={() => textInputRef.current?.focus()}>
              <TextInput
                ref={textInputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="O que você procura?"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
            </Pressable>
            <Pressable style={styles.searchButton}>
              {loading ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="search" size={24} color={colors.text} />}
            </Pressable>
          </View>
        </View>
      );
    }

    // MENU HORIZONTAL — AGORA APARECE!
    if (item.type === 'menu_horizontal') {
  if (!item.itens || item.itens.length === 0) return null;

  return (
    <View style={styles.menuWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}
      >
        {item.itens.map((btn, i) => (
          <Pressable
            key={i}
            onPress={() => {
              // 1. Se tiver 'navigate' → usa navegação interna
              if (btn.navigate) {
                navigation.navigate(btn.navigate);
              }
              // 2. Se tiver 'link' → abre externo (WhatsApp, site, etc)
              else if (btn.link) {
                Linking.openURL(btn.link).catch(err => 
                  console.error('Erro ao abrir link:', err)
                );
              }
              // 3. Caso não tenha nada → não faz nada (ou pode mostrar alerta)
              else {
                console.log('Botão sem ação:', btn.titulo);
              }
            }}
            style={[styles.menuButton, { backgroundColor: colors.card }]}
          >
            {btn.icone && (
              <Ionicons
                name={btn.icone}
                size={18}
                color={colors.primary || colors.text}
              />
            )}
            <Text style={[styles.menuText, { color: colors.text }]}>
              {btn.titulo}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

    if (item.type === 'ad') {
      return (
        <View style={styles.adContainer}>
          <BannerAd unitId={AD_UNIT_ID} size={BannerAdSize.LARGE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
        </View>
      );
    }

    // LOJA NORMAL
    return (
      <Item
        item={item.item}
        index={item.index}
        results={results}
        searchQuery={searchQuery}
        onPress={(store) => {
          setSelectedItem(store);
          bottomSheetRef.current?.present();
        }}
        colors={colors}
      />
    );
  };

  const handleClose = () => setSelectedItem(null);

  useEffect(() => {
    if (!selectedItem) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      bottomSheetRef.current?.close();
      return true;
    });
    return () => handler.remove();
  }, [selectedItem]);

  return (
    <BottomSheetModalProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={fullData}
          renderItem={renderItem}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.primary} />}
        />
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onCloseEnd={handleClose}
        onDismiss={handleClose}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: colors.background }}
        backdropComponent={({ style, ...props }) => (
          <Pressable onPress={() => bottomSheetRef.current?.close()} {...props} style={[style, { backgroundColor: '#000000', opacity: 0.5 }]} />
        )}
      >
        {selectedItem && <Detalhe item={selectedItem} colors={colors} onClose={handleClose} />}
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

  // MENU HORIZONTAL (rola junto)
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginRight: 6,
    gap: 10,
    justifyContent: 'center',
  },

  adContainer: { marginVertical: 16, alignItems: 'center', justifyContent: 'center' },
});