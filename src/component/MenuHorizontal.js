import React from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';


export default function MenuHorizontal({ itensMenu, colors, navigation }) {
  if (!itensMenu || itensMenu.length === 0) return null;

  const botaoFixo = {
    titulo: 'Anuncie Grátis',
    navigate: 'Proposta',
  };

  return (
    <View style={{ paddingVertical: 18 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, gap: 8 }}>
        <Pressable
          onPress={() => navigation.navigate(botaoFixo.navigate)}
          style={{ backgroundColor: colors.botao, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22 }}
        >
          <Text style={{ color: '#fff', fontWeight: 500 }}>{botaoFixo.titulo}</Text>
        </Pressable>

        {itensMenu
          .filter(btn => btn.status === true)
          .map((btn, i) => (
            <Pressable
              key={i}
              onPress={() => {
                if (btn.navigate) navigation.navigate(btn.navigate);
                else if (btn.link) Linking.openURL(btn.link).catch(() => {});
              }}
              style={{ backgroundColor: '#f8f8f8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22 }}
            >
              <Text style={{ color: colors.text }}>{btn.titulo}</Text>
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
}