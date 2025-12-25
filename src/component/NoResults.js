import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NoResults({ colors, query }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 100 }}>
      <Ionicons name="search-outline" size={40} color={colors.text + '60'} />
      <Text style={{ fontSize: 18, fontWeight: '500', marginTop: 24, textAlign: 'center', color: colors.text }}>
        Nenhum resultado encontrado para "{query}"
      </Text>
    </View>
  );
}