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

const NUMERO_ITENS_FIXOS_POR_CLIQUES = 3;

export default function Home({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { colors } = useTheme();
  const bottomSheetRef = useRef(null);
  const textInputRef = useRef(null);
  const snapPoints = useMemo(() => ['87%'], []);

  const applyOrdering = (list) => {
    const premium = list.filter(i => i.premium);
    const nonPremium = list.filter(i => !i.premium);
    const sortedPremium = premium.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    const sortedNonPremium = nonPremium.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    const topFixed = sortedNonPremium.slice(0, NUMERO_ITENS_FIXOS_POR_CLIQUES);
    const remaining = sortedNonPremium.slice(NUMERO_ITENS_FIXOS_POR_CLIQUES);
    const shuffled = [...remaining];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return [...sortedPremium, ...topFixed, ...shuffled];
  };

  const loadData = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const unsub = subscribeToStores(searchQuery, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let filtered = data;

      if (searchQuery.trim()) {
        const words = normalize(searchQuery).split(/\s+/).filter(Boolean);
        filtered = data.filter(item => {
          const desc = normalize(item.description || '');
          const tags = (item.arrayTags || '').split(',').map(t => normalize(t.trim()));
          let matches = 0;
          words.forEach(w => {
            if (desc.includes(w) || tags.some(t => t.includes(w))) matches++;
          });
          const threshold = words.length === 1 ? 1 : Math.ceil(words.length / 2);
          return matches >= threshold;
        });
      }

      const finalResults = searchQuery.trim() ? filtered : applyOrdering(filtered);
      setResults(finalResults);

      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    });

    return unsub;
  }, [searchQuery]);



  useEffect(() => { const unsub = loadData(); return () => unsub(); }, [loadData]);


  // === DADOS COMPLETOS: logo + busca + itens + anúncios ===
  const fullData = useMemo(() => {
    const logo = { type: 'logo' };
    const search = { type: 'search' };

    if (results.length === 0) return [logo, search];

    const itemsWithAds = [];
    const premiumCount = results.filter(i => i.premium).length;
    let firstAdPosition = premiumCount > 1 ? premiumCount : premiumCount + NUMERO_ITENS_FIXOS_POR_CLIQUES;
    let adCount = 0;
    let storeCountAfterFirstAd = 0;

    results.forEach((item, index) => {
      if (index === firstAdPosition && adCount === 0) {
        itemsWithAds.push({ type: 'ad' });
        adCount++;
        storeCountAfterFirstAd = 0;
      }

      itemsWithAds.push({ type: 'store', item, storeId: item.id });

      if (adCount > 0) {
        storeCountAfterFirstAd++;
        if (storeCountAfterFirstAd % 15 === 0 && index < results.length - 1) {
          itemsWithAds.push({ type: 'ad' });
          adCount++;
        }
      }
    });

    return [logo, search, ...itemsWithAds];
  }, [results]);


  
  const renderItem = ({ item }) => {
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
          <View style={[styles.searchBar, {
            backgroundColor: colors.background,
            elevation: 6,
            borderWidth: 0,
          }]}>

            <Pressable style={{ flex: 1, justifyContent: 'center' }} onPress={() => textInputRef.current?.focus()}>
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

    

    if (item.type === 'ad') {
      return (
        <View style={styles.adContainer}>
          <BannerAd unitId={AD_UNIT_ID} size={BannerAdSize.LARGE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
        </View>
      );
    }

    return (
      <Item
        item={item.item}
        index={item.index}
        results={results}
        onPress={(store) => {
          setSelectedItem(store);
          bottomSheetRef.current?.present();
        }}
        colors={colors}
      />
    );
  };

  const handleClose = () => {
    setSelectedItem(null);
    // setTimeout(() => textInputRef.current?.focus(), 100);
  };

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
          keyExtractor={(item, index) => {
            if (item.type === 'logo') return 'logo';
            if (item.type === 'search') return 'search';
            if (item.type === 'ad') return `ad-${index}`;
            return `store-${item.storeId}`;
          }}
          stickyHeaderIndices={[1]}  // ← Só a busca fica fixa!
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22 }}
          ItemSeparatorComponent={({ leadingItem }) => {
            if (!leadingItem || leadingItem.type === 'logo' || leadingItem.type === 'search' || leadingItem.type === 'ad') return null;
            return <View style={{ borderBottomWidth: 0.5, borderBottomColor: colors.border }} />;
          }}
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

// === ESTILOS 100% MANTIDOS (exatamente como você tinha antes) ===
const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingBottom: 16,
    paddingTop: 12,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 35,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 55,
  },
  searchButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight:-16
  },
  adContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});