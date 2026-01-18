// src/component/LogoHeader.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LogoHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.buscaZap}>
        BuscaZap
      </Text>
      <Text style={styles.teresina}>TERESINA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 32,
  },
  buscaZap: {
    fontSize: 26,
    color:'#333',
    fontWeight: '900',
  },
  teresina: {
    fontSize: 10,
    color: '#000',
    letterSpacing: 3.5,
  },
});