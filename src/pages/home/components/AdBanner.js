import React from 'react';
import { View, Text } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const ID_ANUNCIO = __DEV__ ? TestIds.BANNER : 'ca-app-pub-9531253714806304/5581486318';

export default function AdBanner({ adKey, onAdLoaded }) {
  return (
    <View style={{ marginVertical: 16, alignItems: 'center' }}>
      <Text style={{ marginBottom: 6, fontSize: 12 }}>PUBLICIDADE</Text>
      <BannerAd
        unitId={ID_ANUNCIO}
        size={BannerAdSize.LARGE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => onAdLoaded(adKey)}
        onAdFailedToLoad={() => {}}
      />
    </View>
  );
}