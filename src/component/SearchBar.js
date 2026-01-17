// src/component/SearchBar.js

import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({
  termoBusca,
  setTermoBusca,
  buscaExecutada,
  carregando,
  showSearchShadow,
  colors,
  onExecutarBusca,
  onLimparBusca,
  onChangeText,
}) {
  const inputRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Tem texto digitado?
  const temTexto = termoBusca.trim().length > 0;

  // Mostra lupa se NÃO foi executada a busca (independente de ter texto ou não)
  // Mostra X apenas se a busca foi executada
  const mostrarLupa = !buscaExecutada;
  const iconeNome = mostrarLupa ? 'search' : 'close';

  // Animação: botão aparece quando tem texto OU quando a busca foi executada
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: temTexto || buscaExecutada ? 1 : 0,
      duration: 500,
      delay:300,
      useNativeDriver: true,
    }).start();
  }, [temTexto, buscaExecutada]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0.3, 1],
  });

  const handlePressBar = () => inputRef.current?.focus();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, showSearchShadow && styles.shadow]}>
      <View style={[styles.bar, { backgroundColor: colors.card }]}>
        <Pressable style={{ flex: 1 }} onPress={handlePressBar}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            placeholder="O que você procura?"
            placeholderTextColor={colors.text + '80'}
            value={termoBusca}
            onChangeText={onChangeText}
            clearButtonMode="never"
            returnKeyType="search"
            onSubmitEditing={onExecutarBusca}
          />
        </Pressable>

        {/* Botão animado */}
        <Animated.View style={{ opacity, transform: [{ translateX }] }}>
          <Pressable
            style={styles.button}
            onPress={mostrarLupa ? onExecutarBusca : onLimparBusca}
          >
            {carregando && buscaExecutada ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons name={iconeNome} size={24} color={colors.text} />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    paddingTop: 6,
    paddingHorizontal: 22,
  },
  shadow: {
    elevation: 1,
    shadowColor: '#000',
  },
  bar: {
    borderRadius: 35,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 22,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 55,
    paddingVertical: 0,
  },
  button: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
  },
});