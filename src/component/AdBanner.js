// src/componentes/AdBanner.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

// ID real do banner - sem verificação de dev, pois o dispositivo está na lista de teste
const AD_UNIT_ID = 'ca-app-pub-9531253714806304/5581486318';
// const AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111'; // Teste do Google

const AdBanner = ({ adKey, onAdLoaded }) => {

  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.suave }]}>PUBLICIDADE</Text>
      
      <View style={styles.bannerWrapper}>
        <BannerAd
          unitId={AD_UNIT_ID}
          size={BannerAdSize.LARGE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => onAdLoaded?.(adKey)}
          onAdFailedToLoad={(error) => {
            console.log('Anúncio falhou ao carregar:', error);
            onAdLoaded?.(adKey); // Continua o fluxo mesmo se falhar
          }}
        />
      </View>
    </View>
  );
};

export default AdBanner;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    opacity: 0.7,
  },
  bannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});